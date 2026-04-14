"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BingoLocation } from "@/lib/bingo";
import Button from "@/components/ui/Button";

interface LocationModalProps {
  location: BingoLocation | null;
  onClose: () => void;
}

function buildKakaoMapUrl(location: BingoLocation): string {
  const name = encodeURIComponent(location.name);
  return `https://map.kakao.com/link/map/${name},${location.latitude},${location.longitude}`;
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
  const mapUrl = buildKakaoMapUrl(location);

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
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button variant="primary" size="md" className="w-full">
              {t("openInMaps")}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
