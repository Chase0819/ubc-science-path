import { coopPlan } from "./coop";
import {
  ARTS_CREDITS_REQUIRED,
  breadthCategoryOf,
  breadthLabel,
  breadthProgress,
  isLabCourse,
  labSatisfied,
  type BreadthId,
} from "./degree-requirements";
import type { Specialization } from "./types";

/**
 * A full winter is normally 4 to 5 courses a term. The required list for a
 * specialization rarely fills that, so the leftover seats go to Arts credits,
 * Science breadth, and Co-op prep.
 */
export const COURSES_PER_TERM = 5;
export const CREDITS_PER_TERM = 15;

/** Breadth is a four-year job. One or two extra areas a year is the honest pace. */
const MAX_BREADTH_SUGGESTIONS = 2;
const MAX_ARTS_SUGGESTIONS = 2;

export type SuggestionKind = "coop" | "breadth" | "arts" | "lab";

export type Suggestion = {
  code: string;
  kind: SuggestionKind;
  /** Short chip: what requirement this feeds. */
  reason: string;
  /** One sentence on why it belongs in first year. */
  detail: string;
  term: "term1" | "term2" | "either";
};

/** Courses in the Faculty of Arts that a first-year Science student can walk into. */
export const ARTS_PICKS: { code: string; detail: string }[] = [
  {
    code: "PSYC 101",
    detail: "The most common Arts pick in Science. No prerequisite, and it pairs with PSYC 102.",
  },
  {
    code: "PSYC 102",
    detail:
      "The other half of intro psychology. With PSYC 101 that is 6 of your 12 Arts credits, and both are prerequisites for later PSYC courses.",
  },
  {
    code: "ECON 101",
    detail: "Microeconomics. No prerequisite, and it opens a lot of later Arts options.",
  },
  {
    code: "ECON 102",
    detail: "Macroeconomics. Stacks with ECON 101 for 6 Arts credits.",
  },
  {
    code: "PHIL 120",
    detail:
      "Arguments, fallacies, and where reasoning breaks. No prerequisite, but it is restricted to students under 90 credits — so it is a first- or second-year course.",
  },
  {
    code: "LING 100",
    detail: "How language is structured. No prerequisite, and useful later for Cognitive Systems.",
  },
  {
    code: "AMNE 151",
    detail:
      "Greek and Roman mythology, read in translation. No prerequisite. This is the course that used to be CLST 105.",
  },
  {
    code: "GEOG 122",
    detail:
      "Human geography since 1945. Counts as Arts — only the GEOS and GEOB geography codes carry science credit instead.",
  },
];

/** First-year friendly ways to open each breadth category. */
const BREADTH_PICKS: Record<BreadthId, string[]> = {
  math: ["MATH 100", "MATH 101"],
  chem: ["CHEM 121", "CHEM 123"],
  phys: ["PHYS 117", "PHYS 118"],
  life: ["BIOL 112", "BIOL 121", "BIOL 111"],
  stat: ["DSCI 100", "STAT 200"],
  cpsc: ["CPSC 100", "CPSC 103", "CPSC 110"],
  earth: ["EOSC 114", "ATSC 113", "EOSC 110", "EOSC 112"],
};

/** Lab courses that are easy to add when the required list has no lab in it. */
const LAB_PICKS = ["EOSC 111", "ASTR 101", "BIOL 140"];

/** Prefer a lab course when that same pick also opens the missing breadth area. */
function picksFor(category: BreadthId, wantLab: boolean): string[] {
  const picks = BREADTH_PICKS[category];
  if (!wantLab) return picks;
  const dual = LAB_PICKS.filter((code) => breadthCategoryOf(code) === category);
  return [...new Set([...dual, ...picks.filter(isLabCourse), ...picks])];
}

/**
 * Which breadth area to open first when several are missing: the ones whose
 * first-year entry course has no prerequisite and no lab attached.
 */
const BREADTH_ORDER: BreadthId[] = ["earth", "stat", "cpsc", "life", "chem", "phys", "math"];

/** Prerequisites and restrictions worth saying out loud before someone registers. */
const PICK_NOTES: Record<string, string> = {
  "EOSC 111": "One credit, no prerequisite — the cheapest way to tick this box. It does not open Earth & Planetary Science breadth.",
  "ASTR 101": "Needs Physics 11, Physics 12, or PHYS 100, plus Pre-calculus 12.",
  "BIOL 140": "Two credits. Needs Biology 11, Biology 12, or BIOL 111. It does not open Life Science breadth.",
  "BIOL 111": "Not open to you if you already have Biology 12 credit — take BIOL 112 instead.",
  "CPSC 100": "No programming experience needed, but not open once you have CPSC 107, CPSC 110, or APSC 160 credit.",
  "STAT 200": "Needs a first-year calculus course, so it fits Term 2 or later.",
  "ATSC 113": "No prerequisite. Weather through sailing, flying, and snow sports.",
};

/** Arts credit values, so progress toward the 12-credit Arts Requirement can be counted. */
const ARTS_CREDIT: Record<string, number> = {
  "PSYC 101": 3,
  "PSYC 102": 3,
  "ECON 101": 3,
  "ECON 102": 3,
  "PHIL 120": 3,
  "LING 100": 3,
  "AMNE 151": 3,
  "GEOG 122": 3,
};

export function artsCreditsOf(code: string): number {
  return ARTS_CREDIT[code] ?? 0;
}

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
  lab: { satisfied: boolean };
  suggestions: Suggestion[];
};

/**
 * Breadth is scored on courses you actually hold, so a required option you have
 * not placed yet does not count. Everything placed plus AP credit does.
 */
export function suggestElectives(input: SuggestionInput): SuggestionReport {
  const held = [...new Set([...input.placed, ...input.ap])];
  const heldSet = new Set(held);
  const breadth = breadthProgress(held, input.kind, guaranteedBreadth(input.requiredRows));
  const artsHave = artsCredits(held) + guaranteedArtsCredits(input.requiredRows, heldSet);
  const lab = labSatisfied(held) || guaranteedLab(input.requiredRows);

  const suggestions: Suggestion[] = [];
  // Never suggest a course the required list already asks for — it is on the board above.
  const taken = new Set([...held, ...input.planCodes]);

  function push(code: string, kind: SuggestionKind, reason: string, detail: string, term: Suggestion["term"]) {
    if (taken.has(code)) return;
    taken.add(code);
    const note = PICK_NOTES[code];
    suggestions.push({ code, kind, reason, detail: note ? `${detail} ${note}` : detail, term });
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

  // Breadth: the areas with the friendliest first-year entry course, a couple at a time.
  let labCovered = lab;
  const stillNeeded = Math.min(breadth.shortBy, MAX_BREADTH_SUGGESTIONS);
  if (stillNeeded > 0) {
    const openable = breadth.missing
      .filter((category) => !suggestions.some((item) => breadthCategoryOf(item.code) === category))
      .filter((category) => BREADTH_PICKS[category].some((code) => !heldSet.has(code)))
      .sort((a, b) => BREADTH_ORDER.indexOf(a) - BREADTH_ORDER.indexOf(b));
    for (const category of openable.slice(0, stillNeeded)) {
      const picks = picksFor(category, !labCovered);
      const code = picks.find((pick) => !taken.has(pick));
      if (!code) continue;
      const area = breadthLabel(category);
      const alsoLab = !labCovered && isLabCourse(code);
      push(
        code,
        "breadth",
        alsoLab ? "Breadth + lab" : "Science breadth",
        alsoLab
          ? `Opens ${area} and sits on the Laboratory Science list, so one course does both jobs.`
          : `Opens ${area} — nothing else in your year covers that area.`,
        code === "STAT 200" ? "term2" : "either",
      );
      if (alsoLab) labCovered = true;
    }
  }

  if (!labCovered) {
    const code = LAB_PICKS.find((pick) => !heldSet.has(pick) && isLabCourse(pick));
    if (code) {
      push(
        code,
        "lab",
        "Lab requirement",
        "Nothing in your plan is on the Laboratory Science list yet, and every B.Sc. needs one.",
        "either",
      );
    }
  }

  if (artsHave < ARTS_CREDITS_REQUIRED) {
    const wanted = Math.min(
      MAX_ARTS_SUGGESTIONS,
      Math.ceil((ARTS_CREDITS_REQUIRED - artsHave) / 3),
    );
    for (const pick of ARTS_PICKS.filter((item) => !heldSet.has(item.code)).slice(0, wanted)) {
      push(pick.code, "arts", "Arts requirement", pick.detail, "either");
    }
  }

  return {
    arts: { have: artsHave, need: ARTS_CREDITS_REQUIRED },
    breadth,
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
