"use client";

import { Link, usePathname } from "@/i18n/routing";

interface NavigationClientProps {
  workText: string;
  blogText: string;
  profileText: string;
  sideProjectText: string;
}

interface NavItem {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}

export default function NavigationClient({
  workText,
  blogText,
  profileText,
  sideProjectText,
}: NavigationClientProps) {
  const pathname = usePathname();

  const items: NavItem[] = [
    {
      href: "/",
      label: workText,
      isActive: (p) => p === "/" || p.startsWith("/work"),
    },
    {
      href: "/posts",
      label: blogText,
      isActive: (p) => p.startsWith("/posts"),
    },
    {
      href: "/profile",
      label: profileText,
      isActive: (p) => p === "/profile",
    },
    {
      href: "/side-project",
      label: sideProjectText,
      isActive: (p) => p.startsWith("/side-project"),
    },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map(({ href, label, isActive }) => (
        <Link
          key={href}
          href={href}
          prefetch={true}
          className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${
            isActive(pathname) ? "font-semibold underline" : "font-normal"
          } `}
        >
          <p className="whitespace-pre">{label}</p>
        </Link>
      ))}
    </div>
  );
}
