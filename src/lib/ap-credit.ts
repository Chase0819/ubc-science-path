export type ApExam = {
  id: string;
  name: string;
  minScore: number;
  covers: string[];
  detail: string;
};

/** UBC Vancouver first-year credit for AP exam 4+. Source: you.ubc.ca first-year credit. */
export const AP_EXAMS: ApExam[] = [
  {
    id: "calc-ab",
    name: "AP Calculus AB",
    minScore: 4,
    covers: ["MATH 100"],
    detail: "Credit for MATH 100. You can skip the differential calculus group.",
  },
  {
    id: "calc-bc",
    name: "AP Calculus BC",
    minScore: 4,
    covers: ["MATH 100", "MATH 101"],
    detail: "Credit for MATH 100 and MATH 101. You can skip both calculus groups.",
  },
  {
    id: "chem",
    name: "AP Chemistry",
    minScore: 4,
    covers: ["CHEM 121"],
    detail: "Credit for CHEM 121 only. You still take CHEM 123 if this major requires it.",
  },
  {
    id: "bio",
    name: "AP Biology",
    minScore: 4,
    covers: ["BIOL 111", "BIOL 121"],
    detail: "Exempts BIOL 111, BIOL 121, and BIOL 180. Does not skip BIOL 112.",
  },
  {
    id: "phys2",
    name: "AP Physics 2",
    minScore: 4,
    covers: ["PHYS 131"],
    detail: "Credit for PHYS 131. AP Physics 1 grants no UBC credit.",
  },
  {
    id: "phys-c-mech",
    name: "AP Physics C: Mechanics",
    minScore: 4,
    covers: ["PHYS 117"],
    detail: "Credit for PHYS 117.",
  },
  {
    id: "phys-c-em",
    name: "AP Physics C: Electricity and Magnetism",
    minScore: 4,
    covers: ["PHYS 118"],
    detail: "Credit for PHYS 118. You still need the matching lab (PHYS 119) if a lab is required.",
  },
  {
    id: "stats",
    name: "AP Statistics",
    minScore: 4,
    covers: ["STAT 200"],
    detail: "Credit for STAT 200. Does not skip DSCI 100 if that is the course this major wants.",
  },
  {
    id: "micro",
    name: "AP Microeconomics",
    minScore: 4,
    covers: ["ECON 101"],
    detail: "Credit for ECON 101.",
  },
  {
    id: "macro",
    name: "AP Macroeconomics",
    minScore: 4,
    covers: ["ECON 102"],
    detail: "Credit for ECON 102.",
  },
  {
    id: "psych",
    name: "AP Psychology",
    minScore: 4,
    covers: ["PSYC 101"],
    detail: "Credit for PSYC 101 (and PSYC 102).",
  },
  {
    id: "csa",
    name: "AP Computer Science A",
    minScore: 4,
    covers: [],
    detail: "Unassigned CPSC 1st-year credit only. It does not skip CPSC 110 or CPSC 107.",
  },
];

const EQUIVALENTS: Record<string, string[]> = {
  "MATH 100": ["MATH 100", "MATH 102", "MATH 104", "MATH 110", "MATH 120", "MATH 180", "MATH 184"],
  "MATH 101": ["MATH 101", "MATH 103", "MATH 105", "MATH 121"],
  "CHEM 121": ["CHEM 111", "CHEM 121", "CHEM 141"],
};

export function coursesCoveredByExams(examIds: string[]): Set<string> {
  const covered = new Set<string>();
  for (const id of examIds) {
    const exam = AP_EXAMS.find((item) => item.id === id);
    if (!exam) continue;
    for (const code of exam.covers) covered.add(code);
  }
  return covered;
}

export function examCovering(code: string, examIds: string[]): ApExam | undefined {
  return AP_EXAMS.find((exam) => examIds.includes(exam.id) && exam.covers.includes(code));
}

export function relevantApExams(courseCodes: string[]): ApExam[] {
  const codes = new Set(courseCodes);
  return AP_EXAMS.filter((exam) => {
    if (exam.id === "csa") {
      return ["CPSC 103", "CPSC 107", "CPSC 110"].some((code) => codes.has(code));
    }
    return exam.covers.some((code) => {
      const family = EQUIVALENTS[code] ?? [code];
      return family.some((item) => codes.has(item)) || codes.has(code);
    });
  });
}

export function simpleSlotCovered(courses: string[], covered: Set<string>): boolean {
  return courses.some((code) => covered.has(code));
}
