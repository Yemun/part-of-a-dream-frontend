import { useTranslations } from "next-intl";
import { Suspense } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import NavigationClient from "./NavigationClient";
import SideProjectSubNav from "./SideProjectSubNav";

export default function Navigation() {
  const t = useTranslations("navigation");
  const tSideProject = useTranslations("sideProject");

  return (
    <nav className="w-full max-w-5xl">
      <div className="flex flex-row items-center justify-between w-full">
        <NavigationClient
          blogText={t("blog")}
          profileText={t("profile")}
          sideProjectText={t("sideProject")}
        />
        <LanguageSwitcher />
      </div>
      <Suspense fallback={null}>
        <SideProjectSubNav
          bingoLabel={tSideProject("tabBingo")}
          jangbogiLabel={tSideProject("tabJangbogi")}
          paletteLabel={tSideProject("tabPalette")}
        />
      </Suspense>
    </nav>
  );
}
