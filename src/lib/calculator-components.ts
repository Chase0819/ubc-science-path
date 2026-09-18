import type { CalculatorCourse } from "./types";

export const COMPONENT_PRESETS = ["Assignments", "Midterm", "Final", "Attendance", "Lab"] as const;

export type ComponentOption = {
  name: string;
  custom: boolean;
};

export function isPresetName(name: string): boolean {
  const key = name.trim().toLowerCase();
  return COMPONENT_PRESETS.some((preset) => preset.toLowerCase() === key);
}

export function rememberCustomComponent(list: string[], name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2 || isPresetName(trimmed)) return list;
  const key = trimmed.toLowerCase();
  if (list.some((item) => item.toLowerCase() === key)) return list;
  return [...list, trimmed];
}

export function mergeCustomComponents(saved: string[], courses: CalculatorCourse[]): string[] {
  let next = [...saved];
  for (const course of courses) {
    for (const row of course.components) {
      next = rememberCustomComponent(next, row.name);
    }
  }
  return next;
}

export function filterComponentOptions(
  saved: string[],
  query: string,
  typed: boolean,
): ComponentOption[] {
  const needle = query.trim().toLowerCase();
  const presets: ComponentOption[] = COMPONENT_PRESETS.map((name) => ({ name, custom: false }));
  const seen = new Set(COMPONENT_PRESETS.map((name) => name.toLowerCase()));
  const customs: ComponentOption[] = [];
  for (const name of saved) {
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    customs.push({ name: trimmed, custom: true });
  }
  const all = [...presets, ...customs];
  if (!typed || !needle) return all;
  return all.filter((row) => row.name.toLowerCase().includes(needle));
}
