/**
 * 날짜 기준으로 항목을 연도별로 묶는다. 입력 순서를 유지하므로
 * 정렬은 호출 측에서 끝내고 넘길 것.
 */
export function groupByYear<T>(
  items: T[],
  getDate: (item: T) => string,
): [number, T[]][] {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const year = new Date(getDate(item)).getFullYear();
    const group = map.get(year);
    if (group) {
      group.push(item);
    } else {
      map.set(year, [item]);
    }
  }
  return [...map.entries()];
}
