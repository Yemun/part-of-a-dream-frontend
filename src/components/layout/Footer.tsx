import { useLocale, useTranslations } from "next-intl";
import { getProfileData } from "@/data/profile";

interface FooterLink {
  label: string;
  href: string;
  external: boolean;
}

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("profile");
  const { contact } = getProfileData(locale);

  const links: FooterLink[] = [
    { label: contact.email, href: `mailto:${contact.email}`, external: false },
    { label: "Instagram", href: contact.instagram, external: true },
    { label: "LinkedIn", href: contact.linkedin, external: true },
    { label: "GitHub", href: contact.github, external: true },
  ];

  return (
    <footer className="w-full max-w-5xl pt-6 sm:pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">
          {links.map(({ label, href, external }) => (
            <li key={href}>
              <a
                href={href}
                {...(external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} {t("name")}
        </p>
      </div>
    </footer>
  );
}
