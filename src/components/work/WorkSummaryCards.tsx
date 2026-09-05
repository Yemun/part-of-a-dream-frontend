import { getTranslations } from "next-intl/server";
import type { WorkItem } from "@/lib/content";
import {
  formatDate,
  formatDuration,
  getMonthsBetweenDates,
} from "@/lib/careerUtils";

interface WorkSummaryCardsProps {
  work: WorkItem;
  locale: string;
}

const cellClass = "border -ml-px -mt-px p-3 sm:p-4";
const labelClass = "text-xs text-gray-500 dark:text-gray-400 mb-1";

// 6칸 격자에서 셀 개수별 폭. Tailwind가 클래스를 정적으로 찾도록 문자열로 고정한다.
const spanByCount: Record<number, string> = {
  1: "sm:col-span-6",
  2: "sm:col-span-3",
  3: "sm:col-span-2",
};

interface TopCell {
  label: string;
  value: string;
  sub?: string;
}

interface ListRow {
  label: string;
  items: string[];
}

/**
 * frontmatter 속성을 요약 카드 격자로 표시한다.
 * 1행: 제품(없으면 회사) / 역할 / 기간 · 2행: 문제 | 성과 2단 · 3행: 태그(있을 때만)
 * PostCard와 같은 1px 테두리 겹침(-ml-px -mt-px) 아이덴티티를 따른다.
 */
export default async function WorkSummaryCards({
  work,
  locale,
}: WorkSummaryCardsProps) {
  const t = await getTranslations("work");
  const tProfile = await getTranslations("profile");

  const present = t("present");
  const period = `${formatDate(work.startDate, present, locale)} – ${formatDate(work.endDate, present, locale)}`;
  const duration = formatDuration(
    getMonthsBetweenDates(work.startDate, work.endDate).length,
    locale,
    tProfile,
  );

  const topCells: TopCell[] = [];
  if (work.product) {
    topCells.push({
      label: t("product"),
      value: work.product,
      sub: work.productDescription,
    });
  } else if (work.company) {
    topCells.push({ label: t("company"), value: work.company });
  }
  if (work.role) topCells.push({ label: t("role"), value: work.role });
  topCells.push({ label: t("period"), value: period, sub: duration });
  const topSpan = spanByCount[topCells.length] ?? "sm:col-span-6";

  const listRows: ListRow[] = [];
  if (work.problem?.length) {
    listRows.push({ label: t("problem"), items: work.problem });
  }
  if (work.impact?.length) {
    listRows.push({ label: t("impact"), items: work.impact });
  }
  const listSpan = listRows.length === 2 ? "sm:col-span-3" : "sm:col-span-6";

  return (
    <dl className="mb-10 sm:mb-14 grid grid-cols-1 sm:grid-cols-6 text-sm">
      {topCells.map((cell) => (
        <div key={cell.label} className={`${cellClass} ${topSpan}`}>
          <dt className={labelClass}>{cell.label}</dt>
          <dd className="font-medium text-black dark:text-white">
            {cell.value}
          </dd>
          {cell.sub && (
            <dd className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {cell.sub}
            </dd>
          )}
        </div>
      ))}

      {listRows.map((row) => (
        <div key={row.label} className={`${cellClass} ${listSpan}`}>
          <dt className={labelClass}>{row.label}</dt>
          <dd>
            <ul className="list-disc pl-4 space-y-1 text-gray-800 dark:text-gray-200">
              {row.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      ))}

      {work.tags && work.tags.length > 0 && (
        <div className={`${cellClass} sm:col-span-6`}>
          <dt className={labelClass}>{t("tags")}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {work.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}
