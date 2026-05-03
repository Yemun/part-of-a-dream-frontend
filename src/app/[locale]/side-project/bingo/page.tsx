import { redirect } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BingoLegacyRedirect({ params }: PageProps) {
  const { locale } = await params;
  redirect({
    href: { pathname: "/side-project", query: { tab: "bingo" } },
    locale,
  });
}
