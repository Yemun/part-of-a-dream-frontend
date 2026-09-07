"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

interface PostCardAnimationContextValue {
  /** 카드가 쉬는 x 위치. 페이지를 오갈 때 같은 자리로 돌아오도록 보관한다 */
  getX: (key: string) => number | undefined;
  setX: (key: string, x: number) => void;
}

const PostCardAnimationContext =
  createContext<PostCardAnimationContextValue | null>(null);

export function PostCardAnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const savedX = useRef(new Map<string, number>());

  const getX = useCallback((key: string) => savedX.current.get(key), []);
  const setX = useCallback((key: string, x: number) => {
    savedX.current.set(key, x);
  }, []);

  const value = useMemo(() => ({ getX, setX }), [getX, setX]);

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
};

export function usePostCardAnimation() {
  return useContext(PostCardAnimationContext) ?? fallback;
}
