import type { ApState, CalculatorCourse, PlannerState, TermPlan } from "./types";
import { asCalcTerm, winterNow } from "./winter";

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

export function newCalcId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function uniquifyCourses(courses: CalculatorCourse[], fallback: CalculatorCourse["term"]) {
  const seen = new Set<string>();
  function take(id: string) {
    if (id && !seen.has(id)) {
      seen.add(id);
      return id;
    }
    let next = newCalcId();
    while (seen.has(next)) next = newCalcId();
    seen.add(next);
    return next;
  }
  return courses.map((course) => ({
    ...course,
    id: take(course.id),
    term: asCalcTerm(course.term, fallback),
    components: (course.components ?? []).map((row) => ({
      ...row,
      id: take(row.id),
    })),
  }));
}

export function loadCalculator(): CalculatorCourse[] {
  const fallback = winterNow().term;
  return uniquifyCourses(readJson<CalculatorCourse[]>(CALC_KEY, []), fallback);
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
