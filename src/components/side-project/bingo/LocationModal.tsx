"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { BingoLocation, updateLocationCoords } from "@/lib/bingo";

interface LocationModalProps {
  location: BingoLocation | null;
  onClose: () => void;
  isAdmin?: boolean;
  onLocationUpdated?: (updated: BingoLocation) => void;
  onNotify?: (text: string) => void;
}

const IOS_STORE_URL = "https://apps.apple.com/kr/app/id304608425";
const ANDROID_PACKAGE = "net.daum.android.map";
const ANDROID_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

function openKakaoWalkingRoute(location: BingoLocation) {
  const lat = location.latitude;
  const lng = location.longitude;
  const name = encodeURIComponent(location.name);
  const webFallback = `https://map.kakao.com/link/to/${name},${lat},${lng}`;

  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  if (isAndroid) {
    const fallback = encodeURIComponent(ANDROID_STORE_URL);
    window.location.href =
      `intent://route?ep=${lat},${lng}&by=FOOT` +
      `#Intent;scheme=kakaomap;package=${ANDROID_PACKAGE};` +
      `S.browser_fallback_url=${fallback};end`;
    return;
  }

  if (isIOS) {
    const timer = window.setTimeout(() => {
      window.location.href = IOS_STORE_URL;
    }, 1500);
    const cancel = () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", cancel);
      window.removeEventListener("blur", cancel);
    };
    window.addEventListener("pagehide", cancel);
    window.addEventListener("blur", cancel);
    window.location.href = `kakaomap://route?ep=${lat},${lng}&by=FOOT`;
    return;
  }

  window.open(webFallback, "_blank", "noopener,noreferrer");
}

export default function LocationModal({
  location,
  onClose,
  isAdmin = false,
  onLocationUpdated,
  onNotify,
}: LocationModalProps) {
  const t = useTranslations("bingo");

  const [isEditing, setIsEditing] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [prevLocationId, setPrevLocationId] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  if (location && location.id !== prevLocationId) {
    setPrevLocationId(location.id);
    setLatInput(String(location.latitude));
    setLngInput(String(location.longitude));
    setIsEditing(false);
    setImageFailed(false);
  }

  useEffect(() => {
    if (!location) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [location, onClose]);

  if (!location) return null;

  const fillWithCurrentGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatInput(String(pos.coords.latitude));
        setLngInput(String(pos.coords.longitude));
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSave = async () => {
    const lat = Number(latInput);
    const lng = Number(lngInput);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    setSaving(true);
    const updated = await updateLocationCoords(location.id, lat, lng);
    setSaving(false);

    if (updated) {
      onLocationUpdated?.(updated);
      onNotify?.(t("coordsUpdated"));
      onClose();
    } else {
      onNotify?.(t("coordsUpdateFailed"));
    }
  };

  return (
    <div className="bingo-modal-backdrop" onClick={onClose}>
      <div className="bingo-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`bingo-modal-cover ${imageFailed ? "" : "has-image"}`}>
          {imageFailed ? (
            <span className="pin">📍</span>
          ) : (
            <Image
              src={`/bingo/locations/${location.id}.jpg`}
              alt={location.name.replace("\n", " ")}
              fill
              sizes="340px"
              style={{ objectFit: "cover" }}
              priority
              onError={() => setImageFailed(true)}
            />
          )}
        </div>
        <div className="bingo-modal-body">
          <h3 className="bingo-modal-title">
            {location.name.replace("\n", " ")}
          </h3>
          <div className="bingo-modal-actions">
            <button
              type="button"
              className="bingo-cta primary"
              onClick={() => openKakaoWalkingRoute(location)}
            >
              🗺 {t("openInMaps")}
            </button>

            {isAdmin && !isEditing && (
              <button
                type="button"
                className="bingo-cta secondary"
                onClick={() => setIsEditing(true)}
              >
                {t("editCoords")}
              </button>
            )}

            <button
              type="button"
              className="bingo-cta secondary"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
          </div>

          {isAdmin && isEditing && (
            <div className="bingo-modal-edit">
              <label>
                {t("latitude")}
                <input
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                />
              </label>
              <label>
                {t("longitude")}
                <input
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="bingo-cta secondary"
                onClick={fillWithCurrentGps}
                disabled={gpsLoading}
              >
                {gpsLoading ? t("gettingGps") : t("fillWithCurrentGps")}
              </button>
              <div className="bingo-modal-edit-row">
                <button
                  type="button"
                  className="bingo-cta secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  className="bingo-cta primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {t("save")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
