"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type TiltListener = (tilt: number) => void;

interface PostCardAnimationContextValue {
  /** 카드가 쉬는 x 위치. 페이지를 오갈 때 같은 자리로 돌아오도록 보관한다 */
  getX: (key: string) => number | undefined;
  setX: (key: string, x: number) => void;
  /** 기울기 입력이 켜져 있는지 (터치 기기에서만 켜진다) */
  tiltEnabled: boolean;
  /** iOS처럼 사용자 제스처 안에서 권한을 받아야 하는 기기인지 */
  needsTiltPermission: boolean;
  /** 권한을 요청하고 기울기 입력을 켠다. 반드시 클릭/탭 핸들러 안에서 부를 것 */
  enableTilt: () => Promise<void>;
  /** 좌우 기울기(-1~1) 구독. 해제 함수를 돌려준다 */
  subscribeTilt: (listener: TiltListener) => () => void;
}

// 이 각도(도)만큼 기울이면 원이 끝까지 굴러간다
const TILT_FULL_DEG = 30;

// iOS 13+ 는 DeviceOrientationEvent 에 requestPermission 정적 메서드를 붙여 둔다
type OrientationEventCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};
const orientationEvent = (): OrientationEventCtor | undefined =>
  typeof DeviceOrientationEvent === "undefined"
    ? undefined
    : (DeviceOrientationEvent as OrientationEventCtor);

// 기울기 입력 지원 상태. 터치 기기가 아니면 none, iOS 는 권한이 필요하다
type TiltSupport = "none" | "auto" | "permission";
const detectTiltSupport = (): TiltSupport => {
  const ctor = orientationEvent();
  if (!ctor) return "none";
  if (!window.matchMedia("(hover: none)").matches) return "none";
  return typeof ctor.requestPermission === "function" ? "permission" : "auto";
};
const noopSubscribe = () => () => {};

const PostCardAnimationContext =
  createContext<PostCardAnimationContextValue | null>(null);

export function PostCardAnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const savedX = useRef(new Map<string, number>());
  const listeners = useRef(new Set<TiltListener>());
  // 환경값은 클라이언트에서만 알 수 있다. 서버 스냅샷은 none 으로 두고 hydration 뒤에 갱신된다
  const support = useSyncExternalStore(
    noopSubscribe,
    detectTiltSupport,
    () => "none" as TiltSupport,
  );
  // 권한이 필요한 기기에서 사용자가 응답한 결과
  const [permission, setPermission] = useState<"pending" | "granted" | "denied">(
    "pending",
  );

  const tiltEnabled =
    support === "auto" || (support === "permission" && permission === "granted");
  const needsTiltPermission =
    support === "permission" && permission === "pending";

  // 리스너는 한 개만 붙이고, 프레임당 한 번 구독자에게 뿌린다
  useEffect(() => {
    if (!tiltEnabled) return;
    let frame = 0;
    let latest = 0;
    const flush = () => {
      frame = 0;
      listeners.current.forEach((listener) => listener(latest));
    };
    const onOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0; // 좌우 기울기. 왼쪽으로 기울이면 음수
      latest = Math.max(-1, Math.min(1, gamma / TILT_FULL_DEG));
      if (!frame) frame = requestAnimationFrame(flush);
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tiltEnabled]);

  const enableTilt = useCallback(async () => {
    const ctor = orientationEvent();
    if (typeof ctor?.requestPermission !== "function") return;
    try {
      const result = await ctor.requestPermission();
      // 거부하면 이 세션에서는 다시 물을 수 없으니 버튼도 치운다
      setPermission(result === "granted" ? "granted" : "denied");
    } catch {
      setPermission("denied");
    }
  }, []);

  const subscribeTilt = useCallback((listener: TiltListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const getX = useCallback((key: string) => savedX.current.get(key), []);
  const setX = useCallback((key: string, x: number) => {
    savedX.current.set(key, x);
  }, []);

  const value = useMemo<PostCardAnimationContextValue>(
    () => ({
      getX,
      setX,
      tiltEnabled,
      needsTiltPermission,
      enableTilt,
      subscribeTilt,
    }),
    [getX, setX, tiltEnabled, needsTiltPermission, enableTilt, subscribeTilt],
  );

  return (
    <PostCardAnimationContext.Provider value={value}>
      {children}
    </PostCardAnimationContext.Provider>
  );
}

// Provider 밖에서 쓰일 때의 무동작 값. 매 렌더마다 새 객체가 되면 effect 가 계속 다시 돌므로 상수로 둔다
const fallback: PostCardAnimationContextValue = {
  getX: () => undefined,
  setX: () => {},
  tiltEnabled: false,
  needsTiltPermission: false,
  enableTilt: async () => {},
  subscribeTilt: () => () => {},
};

export function usePostCardAnimation() {
  return useContext(PostCardAnimationContext) ?? fallback;
}
