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
  noSubjectList: boolean;
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
    return { empty: true, scienceOneAlt: false, noSubjectList: true, slots: [] };
  }
  if (req.kind === "or" && req.items[0]?.kind === "scie001") {
    return {
      empty: false,
      scienceOneAlt: true,
      noSubjectList: false,
      slots: asSlots(req.items[1]),
    };
  }
  return {
    empty: false,
    scienceOneAlt: false,
    noSubjectList: false,
    slots: asSlots(req),
  };
}

const DIFF_CALC = ["MATH 100", "MATH 102", "MATH 104", "MATH 110", "MATH 120", "MATH 180", "MATH 184"];
const INT_CALC = ["MATH 101", "MATH 103", "MATH 105", "MATH 121"];

function hasFamily(slots: CourseSlot[], family: string[]): boolean {
  return codesFromSlots(slots).some((code) => family.includes(code));
}

function codesFromSlots(slots: CourseSlot[]): string[] {
  const codes: string[] = [];
  for (const slot of slots) {
    if (slot.kind === "simple") codes.push(...slot.courses);
    else {
      for (const path of slot.paths) {
        for (const inner of path.slots) codes.push(...inner.courses);
      }
    }
  }
  return codes;
}

/** Official eligibility plus first-year calculus, which Science students almost always need before they apply. */
export function applyView(req: Requirement): EligibilityView {
  const view = eligibilityView(req);
  const slots = [...view.slots];
  if (!hasFamily(slots, DIFF_CALC)) {
    slots.unshift({
      kind: "simple",
      chooseOne: true,
      courses: DIFF_CALC,
    });
  }
  if (!hasFamily(slots, INT_CALC)) {
    const insertAt = hasFamily(slots, DIFF_CALC)
      ? slots.findIndex(
          (slot) =>
            slot.kind === "simple" && slot.courses.some((code) => DIFF_CALC.includes(code)),
        ) + 1
      : 0;
    slots.splice(Math.max(insertAt, 0), 0, {
      kind: "simple",
      chooseOne: true,
      courses: INT_CALC,
    });
  }
  return {
    ...view,
    empty: slots.length === 0,
    slots,
  };
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
