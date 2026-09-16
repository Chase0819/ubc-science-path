import type { CalcTerm } from "./types";

export type WinterPhase = "term1" | "term2" | "summer";

export function winterNow(date = new Date()): { term: CalcTerm; phase: WinterPhase } {
  const month = date.getMonth();
  if (month <= 3) return { term: "term2", phase: "term2" };
  if (month >= 8) return { term: "term1", phase: "term1" };
  return { term: "term1", phase: "summer" };
}

export function asCalcTerm(value: unknown, fallback: CalcTerm): CalcTerm {
  return value === "term1" || value === "term2" ? value : fallback;
}
