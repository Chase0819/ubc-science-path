import { coopPlan } from "./coop";
import {
  ARTS_CREDITS_REQUIRED,
  BREADTH_CATEGORIES,
  breadthCategoryOf,
  breadthProgress,
  isLabCourse,
  labSatisfied,
  type BreadthId,
} from "./degree-requirements";
import { artsCreditsOf } from "./browse-courses";
import type { WinterAverage } from "./ubcgrades";
import type { CatalogCourse, Specialization } from "./types";

export { artsCreditsOf };

/**
 * A full winter is normally 4 to 5 courses a term. The required list for a
 * specialization rarely fills that, so leftover seats can go to a walk-in
 * elective — or to Co-op prep if that deadline is in play.
 */
export const COURSES_PER_TERM = 5;
export const CREDITS_PER_TERM = 15;

const MAX_ELECTIVE_SUGGESTIONS = 5;

export type SuggestionKind = "coop" | "elective";

export type Suggestion = {
  code: string;
  kind: SuggestionKind;
  /** Short chip: what requirement this feeds. */
  reason: string;
  /** One sentence on why it belongs in first year. */
  detail: string;
  term: "term1" | "term2" | "either";
};

/** Walk-in electives with no university-course prerequisite — not Arts, breadth, or lab. */
export const ELECTIVE_PICKS: {
  code: string;
  title: string;
  credits: number;
  reason: string;
  detail: string;
}[] = [
  {
    code: "NURS 180",
    title: "Stress and Strategies to Promote Well Being",
    credits: 3,
    reason: "Nursing elective",
    detail:
      "How stress works and what actually helps. Open to every faculty, no university course first — a common first-year pick when you want a lighter seat.",
  },
  {
    code: "NURS 280",
    title: "Human Sexual Health",
    credits: 3,
    reason: "Nursing elective",
    detail:
      "Sexual health from several angles, not a Nursing-majors class. No university-course prerequisite.",
  },
  {
    code: "FRST 100",
    title: "Sustainable Forests",
    credits: 3,
    reason: "Forestry elective",
    detail:
      "Forests and forestry in B.C. and elsewhere. No university-course prerequisite — a walk-in from Forestry.",
  },
  {
    code: "CONS 127",
    title: "Observing the Earth from Space",
    credits: 3,
    reason: "Forestry elective",
    detail:
      "Satellites and maps, without a lab. No university-course prerequisite.",
  },
  {
    code: "UFOR 100",
    title: "Greening the City",
    credits: 3,
    reason: "Forestry elective",
    detail:
      "Urban trees, parks, and why cities need them. No university-course prerequisite.",
  },
  {
    code: "CONS 101",
    title: "Introduction to Conservation",
    credits: 3,
    reason: "Forestry elective",
    detail:
      "Current conservation and forest-science topics. No university-course prerequisite.",
  },
  {
    code: "NURS 290",
    title: "Health Impacts of Climate Change",
    credits: 3,
    reason: "Nursing elective",
    detail:
      "Climate and health, written for any faculty. No university-course prerequisite.",
  },
];

export function artsCredits(codes: string[]): number {
  return codes.reduce((sum, code) => sum + artsCreditsOf(code), 0);
}

export function isArtsCourse(code: string): boolean {
  return artsCreditsOf(code) > 0;
}

export type SuggestionInput = {
  specId: string;
  kind: Specialization["kind"];
  /** Codes sitting in Term 1 or Term 2. */
  placed: string[];
  /** Codes already earned through AP credit. */
  ap: string[];
  /** Every code the required list mentions, including options not chosen. */
  planCodes: string[];
  /** The required groups, so areas the year covers by definition are not suggested again. */
  requiredRows: { alternatives: string[][] }[];
  /** Latest winter class averages, used to rank walk-in elective suggestions. */
  averages?: Record<string, WinterAverage | null>;
};

/**
 * A required group opens a breadth area only when every way of satisfying it
 * lands in that area — so a "CPSC 110 or CPSC 103 and 107" group counts for
 * Computer Science, but a "CHEM or BIOL" choice guarantees neither.
 */
type RequiredRow = { alternatives: string[][] };

/** A required group counts only when every way of satisfying it does the job. */
function everyAlternative(row: RequiredRow, test: (alt: string[]) => boolean): boolean {
  return row.alternatives.length > 0 && row.alternatives.every(test);
}

/** True when the required list has to include a Laboratory Science course. */
export function guaranteedLab(rows: RequiredRow[]): boolean {
  return rows.some((row) => everyAlternative(row, (alt) => alt.some(isLabCourse)));
}

/**
 * Arts credits the required list guarantees. Rows already satisfied by a placed
 * course are skipped, since those credits are counted from the plan instead.
 */
export function guaranteedArtsCredits(rows: RequiredRow[], held: Set<string>): number {
  let total = 0;
  for (const row of rows) {
    if (row.alternatives.length === 0) continue;
    if (row.alternatives.some((alt) => alt.every((code) => held.has(code)))) continue;
    total += Math.min(...row.alternatives.map((alt) => artsCredits(alt)));
  }
  return total;
}

export function guaranteedBreadth(rows: RequiredRow[]): BreadthId[] {
  const ids = new Set<BreadthId>();
  for (const row of rows) {
    if (row.alternatives.length === 0) continue;
    let common: BreadthId[] | null = null;
    for (const alt of row.alternatives) {
      const cats: BreadthId[] = [];
      for (const code of alt) {
        const category = breadthCategoryOf(code);
        if (category && !cats.includes(category)) cats.push(category);
      }
      common = common === null ? cats : common.filter((id) => cats.includes(id));
    }
    for (const id of common ?? []) ids.add(id);
  }
  return [...ids];
}

export type SuggestionReport = {
  /** Credits counted toward the 12-credit Arts Requirement. */
  arts: { have: number; need: number };
  breadth: ReturnType<typeof breadthProgress>;
  /** Breadth areas opened by AP credit rather than a course in the timetable. */
  apCovered: BreadthId[];
  lab: { satisfied: boolean };
  suggestions: Suggestion[];
};

/** First-year courses the empty-seat recommender might offer. */
export function electiveSuggestionCodes(): string[] {
  return [...ELECTIVE_PICKS.map((item) => item.code), "CPSC 210"];
}

export function electiveByCode(code: string): CatalogCourse | undefined {
  const hit = ELECTIVE_PICKS.find((item) => item.code === code);
  if (!hit) return undefined;
  return {
    code: hit.code,
    title: hit.title,
    credits: hit.credits,
    tags: [],
    blurb: hit.detail,
  };
}

/**
 * Breadth is scored on courses you actually hold, so a required option you have
 * not placed yet does not count. Everything placed plus AP credit does.
 */
export function suggestElectives(input: SuggestionInput): SuggestionReport {
  const held = [...new Set([...input.placed, ...input.ap])];
  const heldSet = new Set(held);
  const apSet = new Set(input.ap);
  const apCovered = BREADTH_CATEGORIES.filter((category) =>
    [...apSet].some((code) => breadthCategoryOf(code) === category.id),
  ).map((category) => category.id);
  const breadth = breadthProgress(held, input.kind, guaranteedBreadth(input.requiredRows));
  const artsHave = artsCredits(held) + guaranteedArtsCredits(input.requiredRows, heldSet);
  const lab = labSatisfied(held) || guaranteedLab(input.requiredRows);

  const suggestions: Suggestion[] = [];
  // Never suggest a course the required list already asks for — it is on the board above.
  const taken = new Set([...held, ...input.planCodes]);

  function push(code: string, kind: SuggestionKind, reason: string, detail: string, term: Suggestion["term"]) {
    if (taken.has(code)) return;
    taken.add(code);
    suggestions.push({ code, kind, reason, detail, term });
  }

  // Co-op first: it is the only one with a deadline attached to it.
  const coop = coopPlan(input.specId);
  for (const code of coop.addCourses ?? []) {
    const detail =
      code === "CPSC 210"
        ? `${coop.program} Co-op will not accept the application unless CPSC 110 is done and CPSC 121 and CPSC 210 are in progress.`
        : code === "CPSC 110"
          ? `${coop.program} Co-op highly encourages CPSC 110 (or CPSC 103 and 107) before your first work term. The specialization itself does not require it.`
          : `${coop.program} Co-op expects this one in progress when you apply.`;
    push(code, "coop", "Co-op prep", detail, code === "CPSC 110" ? "term1" : "term2");
  }

  const electivesLeft = ELECTIVE_PICKS.filter((item) => !heldSet.has(item.code)).sort((a, b) => {
    const scoreA = input.averages?.[a.code]?.average ?? -1;
    const scoreB = input.averages?.[b.code]?.average ?? -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return ELECTIVE_PICKS.indexOf(a) - ELECTIVE_PICKS.indexOf(b);
  });
  for (const pick of electivesLeft.slice(0, MAX_ELECTIVE_SUGGESTIONS)) {
    push(pick.code, "elective", pick.reason, pick.detail, "either");
  }

  return {
    arts: { have: artsHave, need: ARTS_CREDITS_REQUIRED },
    breadth,
    apCovered,
    lab: { satisfied: lab },
    suggestions,
  };
}

/** Which breadth category a suggested course opens, for the chip on its card. */
export function suggestionCategory(code: string): BreadthId | null {
  return breadthCategoryOf(code);
}

export type TermLoad = {
  courses: number;
  credits: number;
  /** Seats left before the term hits a normal 5-course load. */
  seats: number;
};

export function termLoad(codes: string[], creditsOf: (code: string) => number): TermLoad {
  const credits = codes.reduce((sum, code) => sum + creditsOf(code), 0);
  return {
    courses: codes.length,
    credits,
    seats: Math.max(0, COURSES_PER_TERM - codes.length),
  };
}
