import type { Requirement } from "./types";
import { courseByCode } from "./catalog";

export function hasScie001(completed: string[]): boolean {
  return completed.includes("SCIE 001");
}

export function meetsRequirement(
  req: Requirement,
  completed: string[],
): boolean {
  switch (req.kind) {
    case "none":
      return true;
    case "scie001":
      return hasScie001(completed);
    case "any":
      return req.courses.some((code) => completed.includes(code));
    case "all":
      return req.items.every((item) => meetsRequirement(item, completed));
    case "or":
      return req.items.some((item) => meetsRequirement(item, completed));
  }
}

export function flattenCourses(req: Requirement): string[] {
  switch (req.kind) {
    case "none":
      return [];
    case "scie001":
      return ["SCIE 001"];
    case "any":
      return [...req.courses];
    case "all":
    case "or":
      return [...new Set(req.items.flatMap(flattenCourses))];
  }
}

export function describeRequirement(req: Requirement): string {
  switch (req.kind) {
    case "none":
      return "No specific first-year eligibility courses.";
    case "scie001":
      return "SCIE 001 (Science One)";
    case "any":
      return req.courses.length === 1
        ? req.courses[0]
        : `one of ${req.courses.join(" / ")}`;
    case "all":
      return req.items.map(describeRequirement).join(" + ");
    case "or":
      return req.items.map((item) => `(${describeRequirement(item)})`).join(" or ");
  }
}

export function missingPieces(
  req: Requirement,
  completed: string[],
): string[] {
  if (meetsRequirement(req, completed)) return [];
  switch (req.kind) {
    case "none":
      return [];
    case "scie001":
      return ["SCIE 001"];
    case "any":
      return [`one of ${req.courses.join(" / ")}`];
    case "all":
      return req.items.flatMap((item) => missingPieces(item, completed));
    case "or":
      return [`${req.items.map(describeRequirement).join(" or ")}`];
  }
}

export function courseLabel(code: string): string {
  const found = courseByCode(code);
  return found ? `${found.code} — ${found.title}` : code;
}

export type SimpleSlot = {
  kind: "simple";
  chooseOne: boolean;
  courses: string[];
};

export type PathGroup = {
  kind: "paths";
  paths: { name: string; slots: SimpleSlot[] }[];
};

export type CourseSlot = SimpleSlot | PathGroup;

export type EligibilityView = {
  empty: boolean;
  scienceOneAlt: boolean;
  slots: CourseSlot[];
};

function asSimple(req: Requirement): SimpleSlot | null {
  if (req.kind === "any") {
    return {
      kind: "simple",
      chooseOne: req.courses.length > 1,
      courses: req.courses,
    };
  }
  if (req.kind === "scie001") {
    return { kind: "simple", chooseOne: false, courses: ["SCIE 001"] };
  }
  return null;
}

function pathName(slots: SimpleSlot[], index: number): string {
  const codes = slots.flatMap((slot) => slot.courses);
  if (codes.includes("PHYS 159") || codes.includes("PHYS 158")) {
    return "Engineering physics path";
  }
  if (codes.includes("PHYS 119") || codes.includes("PHYS 118") || codes.includes("PHYS 108")) {
    return "Science physics path";
  }
  return `Option ${index + 1}`;
}

function asSlots(req: Requirement): CourseSlot[] {
  const simple = asSimple(req);
  if (simple) return [simple];
  if (req.kind === "none") return [];
  if (req.kind === "all") return req.items.flatMap(asSlots);
  if (req.kind === "or") {
    return [
      {
        kind: "paths",
        paths: req.items.map((item, index) => {
          const nested = asSlots(item);
          const slots = nested.flatMap((slot) =>
            slot.kind === "simple" ? [slot] : slot.paths.flatMap((path) => path.slots),
          );
          return { name: pathName(slots, index), slots };
        }),
      },
    ];
  }
  return [];
}

export function eligibilityView(req: Requirement): EligibilityView {
  if (req.kind === "none") {
    return { empty: true, scienceOneAlt: false, slots: [] };
  }
  if (req.kind === "or" && req.items[0]?.kind === "scie001") {
    return {
      empty: false,
      scienceOneAlt: true,
      slots: asSlots(req.items[1]),
    };
  }
  return { empty: false, scienceOneAlt: false, slots: asSlots(req) };
}

export function codesFromView(view: EligibilityView): string[] {
  const codes: string[] = [];
  if (view.scienceOneAlt) codes.push("SCIE 001");
  for (const slot of view.slots) {
    if (slot.kind === "simple") codes.push(...slot.courses);
    else {
      for (const path of slot.paths) {
        for (const inner of path.slots) codes.push(...inner.courses);
      }
    }
  }
  return [...new Set(codes)];
}
