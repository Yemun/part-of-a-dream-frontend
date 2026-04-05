"use client";

import { useTranslations } from "next-intl";
import type { ContactInfo } from "@/lib/careerUtils";

function ContactLink({
  label,
  href,
  children,
  isEmail = false,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
  isEmail?: boolean;
}) {
  return (
    <p>
      {label} -{" "}
      <a
        href={href}
        {...(!isEmail && { target: "_blank", rel: "noopener noreferrer" })}
        className="dark:text-blue-400 underline"
      >
        {children}
      </a>
    </p>
  );
}

export default function ContactSection({
  contact,
}: {
  contact: ContactInfo;
}) {
  const t = useTranslations("profile");

  return (
    <div className="mt-6 sm:mt-7 pt-6 sm:pt-7 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {t("contact")}
      </h2>
      <div className="space-y-1">
        <ContactLink
          label={t("email")}
          href={`mailto:${contact.email}`}
          isEmail={true}
        >
          {contact.email}
        </ContactLink>
        <ContactLink label="Instagram" href={contact.instagram}>
          {contact.instagram}
        </ContactLink>
        <ContactLink label="LinkedIn" href={contact.linkedin}>
          {contact.linkedin}
        </ContactLink>
        <ContactLink label="GitHub" href={contact.github}>
          {contact.github}
        </ContactLink>
      </div>
    </div>
  );
}
