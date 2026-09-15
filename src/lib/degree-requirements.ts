import type { Specialization } from "./types";

/**
 * Faculty of Science degree rules that first year can chip away at.
 * Source: UBC Vancouver Calendar, B.Sc. — Science and Arts Requirements,
 * Science Breadth Requirement, and Lower-level Requirements.
 */

export const CALENDAR_BREADTH =
  "https://vancouver.calendar.ubc.ca/faculties-colleges-and-schools/faculty-science/bachelor-science/science-breadth-requirement";
export const CALENDAR_SCIENCE_ARTS =
  "https://vancouver.calendar.ubc.ca/faculties-colleges-and-schools/faculty-science/bachelor-science/science-and-arts-requirements";
export const CALENDAR_LOWER_LEVEL =
  "https://vancouver.calendar.ubc.ca/faculties-colleges-and-schools/faculty-science/bachelor-science/lower-level-requirements";

export const ARTS_CREDITS_REQUIRED = 12;

export type BreadthId = "math" | "chem" | "phys" | "life" | "stat" | "cpsc" | "earth";

export type BreadthCategory = {
  id: BreadthId;
  label: string;
  short: string;
};

export const BREADTH_CATEGORIES: BreadthCategory[] = [
  { id: "math", label: "Mathematics", short: "Math" },
  { id: "chem", label: "Chemistry", short: "Chem" },
  { id: "phys", label: "Physics", short: "Physics" },
  { id: "life", label: "Life Science", short: "Life science" },
  { id: "stat", label: "Statistics", short: "Statistics" },
  { id: "cpsc", label: "Computer Science", short: "Computer science" },
  { id: "earth", label: "Earth & Planetary Science", short: "Earth science" },
];

export function breadthLabel(id: BreadthId): string {
  return BREADTH_CATEGORIES.find((cat) => cat.id === id)?.label ?? id;
}

/** Statistics is defined by course, not by subject code. */
const STAT_EXCEPTIONS = new Set(["BIOL 300", "DSCI 100", "MATH 302"]);

function parseCode(code: string): { subject: string; number: number } | null {
  const match = /^([A-Z]+)\s*(\d+)/.exec(code.trim().toUpperCase());
  if (!match) return null;
  return { subject: match[1], number: Number(match[2]) };
}

/** Which of the 7 breadth categories a course counts for, or null if it counts for none. */
export function breadthCategoryOf(code: string): BreadthId | null {
  const parsed = parseCode(code);
  if (!parsed) return null;
  const clean = `${parsed.subject} ${parsed.number}`;
  if (STAT_EXCEPTIONS.has(clean)) return "stat";

  const { subject, number } = parsed;
  switch (subject) {
    case "MATH":
      return "math";
    case "CHEM":
      return number === 100 || number === 300 ? null : "chem";
    case "PHYS":
      return number === 100 ? null : "phys";
    case "BIOL":
      return number === 140 ? null : "life";
    case "BIOC":
    case "MICB":
      return "life";
    case "PSYC": {
      const lastTwo = number % 100;
      return lastTwo >= 60 && lastTwo <= 89 ? "life" : null;
    }
    case "STAT":
      return "stat";
    case "CPSC":
    case "AI":
      return "cpsc";
    case "ASTR":
    case "ATSC":
    case "ENVR":
      return "earth";
    case "EOSC":
      return number === 111 ? null : "earth";
    case "GEOS":
    case "GEOB":
      return number === 207 ? "life" : "earth";
    default:
      return null;
  }
}

/** Science One is credited with Mathematics, Chemistry, Physics, and Life Science. */
const SCIENCE_ONE_BREADTH: BreadthId[] = ["math", "chem", "phys", "life"];

/** Combined specializations need 5 of 7 categories; everyone else needs 6 of 7. */
export function breadthTarget(kind: Specialization["kind"]): number {
  return kind === "combined-major" || kind === "combined-honours" ? 5 : 6;
}

export type BreadthProgress = {
  target: number;
  covered: BreadthId[];
  missing: BreadthId[];
  satisfied: boolean;
  /** How many more categories are still needed to hit the target. */
  shortBy: number;
};

export function breadthProgress(
  codes: string[],
  kind: Specialization["kind"],
  /** Areas covered some other way, e.g. by a required group you have not placed yet. */
  alsoCovered: BreadthId[] = [],
): BreadthProgress {
  const hit = new Set<BreadthId>(alsoCovered);
  if (codes.includes("SCIE 001")) for (const id of SCIENCE_ONE_BREADTH) hit.add(id);
  for (const code of codes) {
    const category = breadthCategoryOf(code);
    if (category) hit.add(category);
  }
  const target = breadthTarget(kind);
  const covered = BREADTH_CATEGORIES.filter((cat) => hit.has(cat.id)).map((cat) => cat.id);
  const missing = BREADTH_CATEGORIES.filter((cat) => !hit.has(cat.id)).map((cat) => cat.id);
  return {
    target,
    covered,
    missing,
    satisfied: covered.length >= target,
    shortBy: Math.max(0, target - covered.length),
  };
}

/** The Laboratory Science Requirement list — one of these courses is required. */
export const LAB_COURSES = [
  "ASTR 101",
  "ASTR 102",
  "BIOL 140",
  "CHEM 111",
  "CHEM 115",
  "CHEM 121",
  "CHEM 123",
  "CHEM 135",
  "EOSC 111",
  "PHYS 101",
  "PHYS 107",
  "PHYS 109",
  "PHYS 119",
  "PHYS 159",
  "SCIE 001",
];

export function isLabCourse(code: string): boolean {
  return LAB_COURSES.includes(code);
}

export function labSatisfied(codes: string[]): boolean {
  return codes.some(isLabCourse);
}
