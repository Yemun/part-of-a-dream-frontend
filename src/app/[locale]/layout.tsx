import type { Metadata } from "next";
import Script from "next/script";
import Navigation from "@/components/layout/Navigation";
import NavigationVisibility from "@/components/layout/NavigationVisibility";
import { createMetadata } from "@/lib/metadata";
import "@/app/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = createMetadata();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "ko" | "en")) {
    notFound();
  }

  // Optimized message loading - load essential messages only
  const messages = await getMessages();

  return (
    <html lang={locale}>
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
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen">
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-12 sm:gap-14 items-center justify-start px-4 sm:px-8 lg:px-16 pt-8 pb-22 sm:pt-12 sm:pb-24 lg:pt-20 lg:pb-26 w-full">
                <NavigationVisibility>
                  <Navigation />
                </NavigationVisibility>
                <div className="max-w-5xl w-full">{children}</div>
              </div>
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
