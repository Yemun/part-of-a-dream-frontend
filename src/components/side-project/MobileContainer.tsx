import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="mx-auto flex h-211 max-h-[calc(100dvh-10rem)] sm:max-h-[calc(100dvh-13rem)] w-97.5 max-w-full flex-col overflow-hidden border-1 border-zinc-900 bg-white dark:border-zinc-700 dark:bg-zinc-950">
      {children}
    </div>
  );
}
