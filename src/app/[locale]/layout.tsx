import type { Metadata } from "next";
import Script from "next/script";
import PageShell from "@/components/layout/PageShell";
import { createMetadata } from "@/lib/metadata";
import "@/app/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, isValidLocale } from "@/i18n/routing";
import { PostCardAnimationProvider } from "@/components/post/PostCardAnimationProvider";

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
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Optimized message loading - load essential messages only
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PostCardAnimationProvider>
            <div className="min-h-screen antialiased">
              <PageShell>{children}</PageShell>
            </div>
          </PostCardAnimationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
