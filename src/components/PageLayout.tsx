import Navigation from "@/components/Navigation";

interface PageLayoutProps {
  children: React.ReactNode;
  customPadding?: string;
  className?: string;
}

export default function PageLayout({
  children,
  customPadding = "py-8 sm:py-12 lg:py-20",
  className = "",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center min-h-screen">
        <div
          className={`flex flex-col gap-12 sm:gap-20 items-center justify-start px-4 sm:px-8 lg:px-16 ${customPadding} w-full ${className}`}
        >
          <Navigation />
          <div className="max-w-4xl w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
