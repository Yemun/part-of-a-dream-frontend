"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

interface TransformData {
  transform: string;
  x: number;
}

interface PostCardAnimationContextValue {
  isFirstLoad: boolean;
  getTransform: (slug: string) => TransformData | undefined;
  setTransform: (slug: string, data: TransformData) => void;
}

const PostCardAnimationContext =
  createContext<PostCardAnimationContextValue | null>(null);

export function PostCardAnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isFirstLoad] = useState(true);
  const savedTransforms = useRef(new Map<string, TransformData>());

  return (
    <PostCardAnimationContext.Provider
      value={{
        isFirstLoad,
        getTransform: (slug) => savedTransforms.current.get(slug),
        setTransform: (slug, data) => savedTransforms.current.set(slug, data),
      }}
    >
      {children}
    </PostCardAnimationContext.Provider>
  );
}

export function usePostCardAnimation() {
  const ctx = useContext(PostCardAnimationContext);
  if (!ctx) {
    return { isFirstLoad: false, getTransform: () => undefined, setTransform: () => {} };
  }
  return ctx;
}
