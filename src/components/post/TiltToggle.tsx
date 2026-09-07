"use client";

import { useTranslations } from "next-intl";
import { usePostCardAnimation } from "./PostCardAnimationProvider";

// iOS 는 자이로 권한을 사용자 탭 안에서만 요청할 수 있어서 버튼이 필요하다.
// Android 처럼 권한이 필요 없는 기기와 PC 에서는 아무것도 그리지 않는다.
export default function TiltToggle() {
  const t = useTranslations("work");
  const { needsTiltPermission, tiltEnabled, enableTilt } =
    usePostCardAnimation();

  if (!needsTiltPermission || tiltEnabled) return null;

  return (
    <div className="flex justify-end mb-3">
      <button
        type="button"
        onClick={() => void enableTilt()}
        className="text-xs border-[0.5px] border-current px-2 py-1 active:opacity-60"
      >
        {t("tilt")}
      </button>
    </div>
  );
}
