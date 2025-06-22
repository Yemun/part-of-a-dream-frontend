import Navigation from "@/components/layout/Navigation";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center min-h-screen">
        <div className="flex flex-col gap-20 sm:gap-24 items-center justify-start px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-20 w-full">
          <Navigation />
          <div className="max-w-4xl w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
