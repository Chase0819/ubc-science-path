import { courseByCode } from "./catalog";
import { rowCovered, type FirstYearPlan, type FirstYearRow } from "./first-year-plans";
import type { TermPlan } from "./types";

export type TermId = "bench" | "term1" | "term2";

export { type TermPlan };
export const EMPTY_TERM_PLAN: TermPlan = { term1: [], term2: [] };

const USUALLY_T1 = new Set([
  "MATH 100",
  "MATH 102",
  "MATH 104",
  "MATH 110",
  "MATH 120",
  "MATH 180",
  "MATH 184",
  "CHEM 111",
  "CHEM 121",
  "CHEM 141",
  "CPSC 103",
  "CPSC 110",
  "SCIE 113",
  "BIOL 112",
  "PHYS 100",
  "PHYS 106",
  "PHYS 107",
  "PHYS 117",
  "PHYS 131",
  "PHYS 157",
  "ECON 101",
]);

export function courseRows(plan: FirstYearPlan): Extract<FirstYearRow, { kind: "courses" }>[] {
  const rows = plan.rows.filter(
    (row): row is Extract<FirstYearRow, { kind: "courses" }> => row.kind === "courses",
  );
  const hasComms = plan.rows.some((row) => row.kind === "text" && /communication/i.test(row.label));
  if (hasComms && !rows.some((row) => row.alternatives.flat().includes("WRDS 150"))) {
    rows.push({
      kind: "courses",
      display: "Second writing course (usually WRDS 150)",
      alternatives: [["WRDS 150"]],
      credits: 3,
      lead: "WRDS 150",
    });
  }
  return rows;
}

export function slotSatisfied(
  row: Extract<FirstYearRow, { kind: "courses" }>,
  placed: Set<string>,
  ap: Set<string>,
): boolean {
  if (rowCovered(row, ap)) return true;
  return row.alternatives.some((alt) => alt.every((code) => placed.has(code) || ap.has(code)));
}

export function planProgress(
  rows: Extract<FirstYearRow, { kind: "courses" }>[],
  placed: Set<string>,
  ap: Set<string>,
): { done: number; total: number; percent: number } {
  const total = rows.length || 1;
  const done = rows.filter((row) => slotSatisfied(row, placed, ap)).length;
  return { done, total: rows.length, percent: Math.round((done / total) * 100) };
}

export function benchCourses(
  rows: Extract<FirstYearRow, { kind: "courses" }>[],
  placed: Set<string>,
  ap: Set<string>,
): string[] {
  const codes: string[] = [];
  for (const row of rows) {
    if (slotSatisfied(row, placed, ap)) continue;
    for (const alt of row.alternatives) {
      for (const code of alt) {
        if (placed.has(code) || ap.has(code) || codes.includes(code)) continue;
        codes.push(code);
      }
    }
  }
  return codes;
}

export function suggestedTerm(code: string): "term1" | "term2" {
  return USUALLY_T1.has(code) ? "term1" : "term2";
}

export function termCredits(codes: string[]): number {
  return codes.reduce((sum, code) => sum + (courseByCode(code)?.credits ?? 3), 0);
}

export function placedSet(plan: TermPlan): Set<string> {
  return new Set([...plan.term1, ...plan.term2]);
}

export function moveCourse(plan: TermPlan, code: string, dest: TermId): TermPlan {
  const next: TermPlan = {
    term1: plan.term1.filter((item) => item !== code),
    term2: plan.term2.filter((item) => item !== code),
  };
  if (dest === "term1") next.term1 = [...next.term1, code];
  if (dest === "term2") next.term2 = [...next.term2, code];
  return next;
}
