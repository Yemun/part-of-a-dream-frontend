"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BingoLocation, updateLocationCoords } from "@/lib/bingo";
import Button from "@/components/ui/Button";

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
  const locale = useLocale();

  const [isEditing, setIsEditing] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [prevLocationId, setPrevLocationId] = useState<string | null>(null);

  if (location && location.id !== prevLocationId) {
    setPrevLocationId(location.id);
    setLatInput(String(location.latitude));
    setLngInput(String(location.longitude));
    setIsEditing(false);
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

  const displayName =
    locale === "en" && location.name_en ? location.name_en : location.name;

  const fillWithCurrentGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatInput(String(pos.coords.latitude));
        setLngInput(String(pos.coords.longitude));
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
      },
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm overflow-hidden border-[0.5px] border-gray-300 dark:border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {t("locationPlaceholder")}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <h3 className="text-base font-semibold">{displayName}</h3>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => openKakaoWalkingRoute(location)}
          >
            {t("openInMaps")}
          </Button>

          {isAdmin && !isEditing && (
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => setIsEditing(true)}
            >
              {t("editCoords")}
            </Button>
          )}

          {isAdmin && isEditing && (
            <div className="flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700 pt-3">
              <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
                {t("latitude")}
                <input
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
                {t("longitude")}
                <input
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
                />
              </label>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={fillWithCurrentGps}
                disabled={gpsLoading}
              >
                {gpsLoading ? t("gettingGps") : t("fillWithCurrentGps")}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {t("save")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
