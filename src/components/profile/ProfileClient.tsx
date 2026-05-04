"use client";

import { useTranslations, useLocale } from "next-intl";
import type { ProfileData } from "@/lib/careerUtils";
import { processCareerToGraph, formatDuration } from "@/lib/careerUtils";
import CareerGraph from "./CareerGraph";
import EducationSection from "./EducationSection";
import ContactSection from "./ContactSection";

export default function ProfileClient({
  profileData,
}: {
  profileData: ProfileData;
}) {
  const t = useTranslations("profile");
  const locale = useLocale();

  const totalCareerMonths = processCareerToGraph(profileData.career).reduce(
    (sum, item) => sum + item.totalMonths,
    0,
  );
  const careerDuration = formatDuration(totalCareerMonths, locale, t);

  return (
    <section>
      <h1 className="font-semibold text-black dark:text-white text-2xl sm:text-3xl lg:text-4xl leading-7 sm:leading-9 lg:leading-10 mb-3">
        {t("name")}
      </h1>

      <div className="mb-8 sm:mb-10">
        <p className="text-base sm:text-lg">{t("biography")}</p>
      </div>

      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {t("career")} · {careerDuration}
        </h2>

        <CareerGraph career={profileData.career} />
      </div>
      <div className="mt-8">
        <EducationSection education={profileData.education} />
      </div>

      <ContactSection contact={profileData.contact} />
    </section>
  );
}
