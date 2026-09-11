import type { ApState, CalculatorCourse, PlannerState, TermPlan } from "./types";

const CALC_KEY = "usp.calculator";
const PLAN_KEY = "usp.planner";
const SESSIONAL_KEY = "usp.sessional";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadCalculator(): CalculatorCourse[] {
  return readJson<CalculatorCourse[]>(CALC_KEY, []);
}

export function saveCalculator(courses: CalculatorCourse[]) {
  localStorage.setItem(CALC_KEY, JSON.stringify(courses));
}

export function loadPlanner(): PlannerState {
  return readJson<PlannerState>(PLAN_KEY, { completed: [], intended: [] });
}

export function savePlanner(state: PlannerState) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(state));
}

export function loadSessional(): number | null {
  const v = readJson<number | null>(SESSIONAL_KEY, null);
  return typeof v === "number" ? v : null;
}

export function saveSessional(value: number) {
  localStorage.setItem(SESSIONAL_KEY, JSON.stringify(value));
}

const AP_KEY = "usp.ap";

export function loadApExams(): string[] {
  return readJson<ApState>(AP_KEY, { exams: [] }).exams;
}

export function saveApExams(exams: string[]) {
  localStorage.setItem(AP_KEY, JSON.stringify({ exams } satisfies ApState));
}

const TERM_KEY = "usp.termplan";

export function loadTermPlan(specId: string): TermPlan {
  const all = readJson<Record<string, TermPlan>>(TERM_KEY, {});
  return all[specId] ?? { term1: [], term2: [] };
}

export function saveTermPlan(specId: string, plan: TermPlan) {
  const all = readJson<Record<string, TermPlan>>(TERM_KEY, {});
  all[specId] = plan;
  localStorage.setItem(TERM_KEY, JSON.stringify(all));
}
