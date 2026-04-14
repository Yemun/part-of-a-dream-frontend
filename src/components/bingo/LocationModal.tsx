"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BingoLocation } from "@/lib/bingo";
import Button from "@/components/ui/Button";

interface LocationModalProps {
  location: BingoLocation | null;
  onClose: () => void;
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
}: LocationModalProps) {
  const t = useTranslations("bingo");
  const locale = useLocale();

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
        </div>
      </div>
    </div>
  );
}
