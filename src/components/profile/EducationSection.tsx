"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatDate } from "@/lib/careerUtils";

interface Education {
  university: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export default function EducationSection({
  education,
}: {
  education: Education;
}) {
  const t = useTranslations("profile");
  const locale = useLocale();

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {t("education")}
      </h2>

      <p className="mb-4 gap-2 flex items-center">
        {education.university}, {education.degree},{" "}
        <br className="sm:hidden" />
        {formatDate(education.startDate, t("present"), locale)} –{" "}
        {formatDate(education.endDate, t("present"), locale)}
      </p>
    </div>
  );
}
