import type { Metadata } from "next";
import Script from "next/script";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "꿈의 일환",
  keywords: ["꿈의 일환", "블로그", "디자인시스템", "서을"],
  description: "사용자와 제품의 관계을 탐구하는 일지입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5SYWFDCQER"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5SYWFDCQER');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <div className="min-h-screen">
          <div className="flex flex-col items-center min-h-screen">
            <div className="flex flex-col gap-12 sm:gap-20 items-center justify-start px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-20 w-full">
              <Navigation />
              <div className="max-w-4xl w-full">{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
