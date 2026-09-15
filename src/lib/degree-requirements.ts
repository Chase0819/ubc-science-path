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

/**
 * Subject codes housed in the Faculty of Arts (Calendar course descriptions /
 * Arts Ways of Knowing lists). A B.Sc. Arts credit must be offered by this
 * faculty — not Science, Applied Science, Forestry, LFS, Education, etc.
 */
const FACULTY_OF_ARTS_SUBJECTS = new Set([
  "ACAM", "AFST", "AMNE", "ANTH", "ARBC", "ARBM", "ARCL", "ARTH", "ARTS", "ASIA",
  "ASIX", "ASL", "ASLA", "ASTU", "CAP", "CDST", "CENS", "CHIN", "CINE", "CLST",
  "CNRS", "CNTO", "CRWR", "CSIS", "CTLN", "DANI", "ECON", "ENGL", "ENST", "FIPR",
  "FIST", "FMST", "FNEL", "FNIS", "FREN", "GEOG", "GERM", "GERN", "GMST", "GREK",
  "GRSJ", "HEBR", "HINU", "HIST", "INFO", "ITAL", "ITST", "JAPN", "JRNL", "JWST",
  "KORN", "LASO", "LAST", "LATN", "LING", "MDIA", "MDVL", "MES", "MUSC", "NEPL",
  "NEST", "NORD", "PERS", "PHIL", "POLI", "POLS", "PORT", "PPGA", "PSYC", "PUNJ",
  "RELG", "RGST", "RMST", "RUSS", "SANS", "SCAN", "SEAL", "SLAV", "SOAL", "SOCI",
  "SOWK", "SPAN", "SWAH", "SWED", "THFL", "THTR", "TIBT", "UKRN", "URST", "VISA",
  "WRDS", "YDSH",
]);

/** WRDS / ENGL used for Communication may not also satisfy the Arts Requirement. */
const COMMUNICATION_ARTS_SUBJECTS = new Set(["ENGL", "WRDS"]);

/**
 * B.Sc. Calendar: only music history, theory, ethnomusicology, or composition
 * (plus ensemble performance, which we do not list). Music technology and
 * B.Mus. skills courses do not count.
 */
const MUSC_ARTS_FOR_SCIENCE = new Set([
  "MUSC 103",
  "MUSC 120",
  "MUSC 128",
]);

const ASIC_ARTS_FOR_SCIENCE = new Set(["ASIC 200", "ASIC 220"]);

function psycHasScienceCredit(number: number): boolean {
  if (number === 348 || number === 448) return true;
  const lastTwo = number % 100;
  return lastTwo >= 60 && lastTwo <= 89;
}

/**
 * Whether a course can count toward the B.Sc. 12-credit Arts Requirement.
 * Source: Calendar, Science and Arts Requirements — Faculty of Arts courses,
 * excluding GEOS/GEOB, science-credit PSYC, and Communication Arts courses.
 */
export function countsAsBscArtsCredit(code: string): boolean {
  const parsed = parseCode(code);
  if (!parsed) return false;
  const clean = `${parsed.subject} ${parsed.number}`;
  if (ASIC_ARTS_FOR_SCIENCE.has(clean)) return true;
  if (parsed.subject === "GEOS" || parsed.subject === "GEOB") return false;
  if (COMMUNICATION_ARTS_SUBJECTS.has(parsed.subject)) return false;
  if (parsed.subject === "PSYC" && psycHasScienceCredit(parsed.number)) return false;
  if (parsed.subject === "MUSC") return MUSC_ARTS_FOR_SCIENCE.has(clean);
  return FACULTY_OF_ARTS_SUBJECTS.has(parsed.subject);
}

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
