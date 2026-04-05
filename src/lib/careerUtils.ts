export interface RoleInfo {
  role: string;
  startDate: string;
  endDate: string | null;
}

export interface CareerEntry {
  company: string;
  roles?: RoleInfo[];
}

export interface MonthCircleData {
  year: number;
  month: number;
  isWorked: boolean;
  fillPercentage: number;
}

export interface CareerGraphItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  monthCircles: MonthCircleData[];
  totalMonths: number;
  isCurrentJob: boolean;
}

export interface Education {
  university: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  instagram: string;
}

export interface ProfileData {
  contact: ContactInfo;
  career: CareerEntry[];
  education: Education;
}

const DAYS_PER_MONTH = 365 / 12;

export function getMonthsBetweenDates(
  startDate: string,
  endDate: string | null,
): MonthCircleData[] {
  const circles: MonthCircleData[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const totalDays =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalMonthsNeeded = Math.ceil(totalDays / DAYS_PER_MONTH);

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();

  for (let i = 0; i < totalMonthsNeeded; i++) {
    const currentDate = new Date(startYear, startMonth + i, 1);

    let fillPercentage = 100;
    if (i === totalMonthsNeeded - 1) {
      const remainingDays = totalDays - i * DAYS_PER_MONTH;
      fillPercentage = Math.round((remainingDays / DAYS_PER_MONTH) * 100);
      fillPercentage = Math.max(10, Math.min(100, fillPercentage));
    }

    circles.push({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      isWorked: true,
      fillPercentage,
    });
  }

  return circles;
}

export function processCareerToGraph(
  career: CareerEntry[],
): CareerGraphItem[] {
  const items: CareerGraphItem[] = [];

  career.forEach((entry) => {
    entry.roles?.forEach((role) => {
      const monthCircles = getMonthsBetweenDates(role.startDate, role.endDate);
      items.push({
        company: entry.company,
        role: role.role,
        startDate: role.startDate,
        endDate: role.endDate,
        monthCircles,
        totalMonths: monthCircles.length,
        isCurrentJob: role.endDate === null,
      });
    });
  });

  items.sort((a, b) => {
    if (a.isCurrentJob && !b.isCurrentJob) return -1;
    if (!a.isCurrentJob && b.isCurrentJob) return 1;
    const dateA = a.endDate ? new Date(a.endDate) : new Date();
    const dateB = b.endDate ? new Date(b.endDate) : new Date();
    return dateB.getTime() - dateA.getTime();
  });

  return items;
}

export function formatDate(
  dateStr: string | null,
  present: string,
  locale?: string,
): string {
  if (!dateStr) return present;
  const [year, month] = dateStr.split("-");
  return locale === "en" ? `${month}/${year}` : `${year}.${month}`;
}

export function formatDuration(
  totalMonths: number,
  locale: string,
  t: (key: string) => string,
): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const isKo = locale === "ko";
  const parts: string[] = [];

  if (years > 0) {
    const unit = isKo
      ? t("yearsUnit")
      : t(years === 1 ? "yearsUnit" : "yearsUnitPlural");
    parts.push(`${years}${unit}`);
  }
  if (months > 0) {
    const unit = isKo
      ? t("monthsUnit")
      : t(months === 1 ? "monthsUnit" : "monthsUnitPlural");
    parts.push(`${months}${unit}`);
  }

  return parts.join(" ") || `0${t("monthsUnit")}`;
}
