import type { Metadata } from "next";
import Script from "next/script";
import Navigation from "@/components/layout/Navigation";
import { createMetadata } from "@/lib/metadata";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export const metadata: Metadata = createMetadata();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'ko' | 'en')) {
    notFound();
  }
 
  // Provide only essential messages to reduce bundle size
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
      <body className="antialiased">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter
            id="texture-filter"
            x="0"
            y="0"
            width="1"
            height="1"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.2"
              result="turb"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turb"
              scale="1.4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen">
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-12 sm:gap-14 items-center justify-start px-4 sm:px-8 lg:px-16 pt-8 pb-22 sm:pt-12 sm:pb-24 lg:pt-20 lg:pb-26 w-full">
                <Navigation />
                <div className="max-w-5xl w-full">{children}</div>
              </div>
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}