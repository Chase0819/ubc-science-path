import {
  BREADTH_CATEGORIES,
  LAB_COURSES,
  breadthLabel,
  type BreadthId,
} from "./degree-requirements";
import type { CatalogCourse } from "./types";

/**
 * First-year courses a Science student can walk into for Arts credit, Science
 * breadth, or the lab list. University-course prerequisites are the filter —
 * high-school Physics 12 / Chemistry 12 still apply where the Calendar says so.
 */

export type BrowseKind = "arts" | "breadth" | "lab";

export type BrowseCourse = {
  code: string;
  title: string;
  credits: number;
  category: string;
  note?: string;
};

function item(
  category: string,
  code: string,
  title: string,
  credits = 3,
  note?: string,
): BrowseCourse {
  return { code, title, credits, category, note };
}

export const ARTS_CATEGORIES = [
  "Psychology",
  "Economics",
  "Philosophy",
  "Linguistics",
  "Language",
  "Political science",
  "Sociology",
  "Anthropology",
  "History",
  "Geography",
  "Ancient Mediterranean",
  "Asian studies",
  "Gender and social justice",
] as const;

/** Faculty of Arts intros with no university-course prerequisite. ENGL/WRDS are omitted — they are Communication, and do not count twice. Language courses in Arts departments count toward the 12-credit Arts Requirement. */
export const ARTS_BROWSE: BrowseCourse[] = [
  item("Psychology", "PSYC 101", "Introduction to Biological and Cognitive Psychology"),
  item("Psychology", "PSYC 102", "Introduction to Developmental, Social, Personality, and Clinical Psychology"),
  item("Economics", "ECON 101", "Principles of Microeconomics"),
  item("Economics", "ECON 102", "Principles of Macroeconomics"),
  item("Philosophy", "PHIL 101", "Introduction to Philosophy"),
  item("Philosophy", "PHIL 102", "Introduction to Philosophy II"),
  item("Philosophy", "PHIL 104", "Happiness"),
  item(
    "Philosophy",
    "PHIL 120",
    "Introduction to Critical Thinking",
    3,
    "Restricted to students under 90 credits.",
  ),
  item(
    "Philosophy",
    "PHIL 125",
    "Introduction to Scientific Reasoning",
    3,
    "Restricted to students under 90 credits.",
  ),
  item("Linguistics", "LING 100", "Introduction to Language and Linguistics"),
  item("Linguistics", "LING 101", "Languages of the World"),
  item("Linguistics", "LING 170", "Introduction to How to Learn a Language"),
  item(
    "Language",
    "FREN 101",
    "Beginners' French I",
    3,
    "Not for credit if you completed Core French 11, 12, or Immersion.",
  ),
  item("Language", "SPAN 101", "Beginners' Spanish I"),
  item("Language", "GERN 101", "Learning German 1"),
  item("Language", "ITAL 101", "Beginners' Italian I"),
  item(
    "Language",
    "JAPN 100",
    "Beginning Japanese IA",
    3,
    "Not for credit with Japanese 11 or 12. Placement guidelines apply.",
  ),
  item(
    "Language",
    "KORN 100",
    "Basic Korean I",
    3,
    "Korean Placement Interview before you register.",
  ),
  item(
    "Language",
    "CHIN 131",
    "Basic Chinese I: Part 1 (Non-Heritage)",
    3,
    "For students new to Mandarin. Asian Studies placement rules apply.",
  ),
  item("Language", "RUSS 101", "Learning Russian 1"),
  item("Language", "ASL 100", "American Sign Language and Deaf Culture I"),
  item("Political science", "POLI 100", "Introduction to Politics"),
  item("Political science", "POLI 101", "Introduction to Canadian Politics"),
  item("Sociology", "SOCI 101", "Social Interaction and Culture"),
  item("Sociology", "SOCI 102", "Inequality and Social Change"),
  item("Anthropology", "ANTH 100", "Introduction to Cultural Anthropology"),
  item("History", "HIST 100", "What is History?"),
  item("Geography", "GEOG 121", "Geography, Environment and Globalization"),
  item("Geography", "GEOG 122", "Geography, Modernity and Globalization"),
  item("Ancient Mediterranean", "AMNE 151", "Greek and Roman Mythology"),
  item("Asian studies", "ASIA 100", "Introduction to Traditional Asia"),
  item("Asian studies", "ASIA 101", "Introduction to Modern Asia"),
  item("Gender and social justice", "GRSJ 101", "Introduction to Social Justice"),
  item("Gender and social justice", "GRSJ 102", "Global Issues in Social Justice"),
];

/** First-year Science courses that open a breadth area without another UBC course first. */
export const BREADTH_BROWSE: BrowseCourse[] = [
  item("math", "MATH 100", "Differential Calculus"),
  item("math", "MATH 102", "Differential Calculus with Applications to Life Sciences"),
  item("math", "MATH 104", "Differential Calculus with Applications to Commerce and Social Sciences"),
  item("math", "MATH 110", "Differential Calculus (extended)", 6),
  item("math", "MATH 120", "Honours Differential Calculus", 4),
  item("math", "MATH 180", "Differential Calculus with Physical Applications", 4),
  item("math", "MATH 184", "Differential Calculus for Social Sciences and Commerce"),
  item("chem", "CHEM 111", "Structure, Bonding and Equilibrium", 4, "For students without Chemistry 12."),
  item("chem", "CHEM 121", "Structure and Bonding in Chemistry", 4),
  item("chem", "CHEM 141", "Structure and Bonding (enriched)", 4),
  item("phys", "PHYS 117", "Dynamics and Waves"),
  item("phys", "PHYS 131", "Energy and Waves"),
  item("phys", "PHYS 106", "Enriched Physics I"),
  item("phys", "PHYS 107", "Enriched Physics I (alternate)"),
  item("life", "BIOL 111", "Introduction to Modern Biology", 3, "If you already have Biology 12, take BIOL 112."),
  item("life", "BIOL 112", "Biology of the Cell"),
  item("life", "BIOL 121", "Genetics, Evolution and Ecology"),
  item("stat", "DSCI 100", "Introduction to Data Science"),
  item(
    "cpsc",
    "CPSC 100",
    "Computational Thinking",
    3,
    "Not open once you have CPSC 107, CPSC 110, or APSC 160.",
  ),
  item("cpsc", "CPSC 103", "Introduction to Systematic Program Design"),
  item("cpsc", "CPSC 110", "Computation, Programs, and Programming", 4),
  item("earth", "EOSC 110", "The Solid Earth: A Dynamic Planet"),
  item("earth", "EOSC 112", "The Climate System"),
  item("earth", "EOSC 114", "The Catastrophic Earth: Natural Disasters"),
  item("earth", "ATSC 113", "Weather Science for Sailing, Flying, and Snow Sports"),
  item(
    "earth",
    "ASTR 101",
    "Introduction to the Solar System",
    3,
    "Needs Physics 11, Physics 12, or PHYS 100, plus Pre-calculus 12. Also a lab course.",
  ),
];

const LAB_TITLES: Record<string, { title: string; credits: number; note?: string }> = {
  "ASTR 101": {
    title: "Introduction to the Solar System",
    credits: 3,
    note: "Needs Physics 11, Physics 12, or PHYS 100, plus Pre-calculus 12.",
  },
  "ASTR 102": {
    title: "Introduction to Stars and Galaxies",
    credits: 3,
    note: "Needs Physics 11, Physics 12, or PHYS 100, plus Principles of Mathematics 12.",
  },
  "BIOL 140": {
    title: "Laboratory Investigations in Life Science",
    credits: 2,
    note: "Needs Biology 11, Biology 12, or BIOL 111. Does not open Life Science breadth.",
  },
  "CHEM 111": { title: "Structure, Bonding and Equilibrium", credits: 4 },
  "CHEM 115": {
    title: "Introductory Chemical Laboratory I",
    credits: 1,
    note: "Needs CHEM 110 or CHEM 120.",
  },
  "CHEM 121": { title: "Structure and Bonding in Chemistry", credits: 4 },
  "CHEM 123": { title: "Thermodynamics, Kinetics and Organic Chemistry", credits: 4 },
  "CHEM 135": {
    title: "Introductory Chemical Laboratory II",
    credits: 1,
    note: "Pairs with CHEM 130.",
  },
  "EOSC 111": {
    title: "Laboratory Exploration of Planet Earth",
    credits: 1,
    note: "No prerequisite. Does not open Earth & Planetary Science breadth.",
  },
  "PHYS 101": {
    title: "Energy and Waves",
    credits: 3,
    note: "Needs Physics 12 or PHYS 100, and a first-year calculus course as a corequisite.",
  },
  "PHYS 107": { title: "Enriched Physics I (alternate)", credits: 3 },
  "PHYS 109": {
    title: "Enriched Experimental Physics",
    credits: 1,
    note: "Needs PHYS 107. Corequisite PHYS 108 or PHYS 118.",
  },
  "PHYS 119": { title: "Experimental Physics Lab", credits: 1 },
  "PHYS 159": { title: "Introductory Physics Laboratory", credits: 1 },
  "SCIE 001": { title: "Science One", credits: 27, note: "The integrated first-year stream." },
};

export const LAB_BROWSE: BrowseCourse[] = LAB_COURSES.map((code) => {
  const meta = LAB_TITLES[code];
  return item("Lab", code, meta?.title ?? code, meta?.credits ?? 3, meta?.note);
});

const BY_KIND: Record<BrowseKind, BrowseCourse[]> = {
  arts: ARTS_BROWSE,
  breadth: BREADTH_BROWSE,
  lab: LAB_BROWSE,
};

export function browseCourses(kind: BrowseKind): BrowseCourse[] {
  return BY_KIND[kind];
}

export function browseCategories(kind: BrowseKind): string[] {
  if (kind === "arts") return [...ARTS_CATEGORIES];
  if (kind === "lab") return [];
  return BREADTH_CATEGORIES.map((category) => category.id);
}

export function browseCategoryLabel(kind: BrowseKind, category: string): string {
  if (kind === "breadth") return breadthLabel(category as BreadthId);
  return category;
}

export function browseCodes(): string[] {
  return [...new Set([...ARTS_BROWSE, ...BREADTH_BROWSE, ...LAB_BROWSE].map((item) => item.code))];
}

export function sortByWinterAverage(
  courses: BrowseCourse[],
  averages: Record<string, { average: number } | null | undefined>,
): BrowseCourse[] {
  return [...courses].sort((a, b) => {
    const scoreA = averages[a.code]?.average ?? -1;
    const scoreB = averages[b.code]?.average ?? -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.code.localeCompare(b.code);
  });
}

export function browseByCode(code: string): CatalogCourse | undefined {
  const hit = [...ARTS_BROWSE, ...BREADTH_BROWSE, ...LAB_BROWSE].find((item) => item.code === code);
  if (!hit) return undefined;
  return {
    code: hit.code,
    title: hit.title,
    credits: hit.credits,
    tags: [],
    blurb: hit.note ?? "",
  };
}

export function artsCreditsOf(code: string): number {
  return ARTS_BROWSE.find((item) => item.code === code)?.credits ?? 0;
}

