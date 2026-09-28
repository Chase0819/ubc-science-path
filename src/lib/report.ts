export const REPORT_PAGES = [
  { id: "home", label: "Home", hint: "Landing page", color: "bg-[var(--navy)] text-white" },
  { id: "calculator", label: "Grade calculator", hint: "Marks and averages", color: "bg-[#c5e8c4] text-[#142033]" },
  { id: "planner", label: "Course planner", hint: "First-year timetable", color: "bg-[#f2d45c] text-[#142033]" },
  { id: "outlook", label: "Major outlook", hint: "Cutoff chance", color: "bg-[#c62828] text-white" },
] as const;

export type ReportPageId = (typeof REPORT_PAGES)[number]["id"];

export function isReportPageId(value: string): value is ReportPageId {
  return REPORT_PAGES.some((page) => page.id === value);
}

export const REPORT_PAGE_LABEL: Record<ReportPageId, string> = {
  home: "Home",
  calculator: "Grade calculator",
  planner: "Course planner",
  outlook: "Major outlook",
};

export function reportSubject(page: ReportPageId) {
  return `UBC Science Path ${REPORT_PAGE_LABEL[page]} Problem`;
}
