import Navigation from "./Navigation";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-12 sm:gap-14 items-center justify-start px-4 sm:px-8 lg:px-16 pt-8 pb-8 sm:pt-12 sm:pb-12 w-full">
        <Navigation />
        <div className="max-w-5xl w-full">{children}</div>
      </div>
    </div>
  );
}
