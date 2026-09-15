/**
 * UBC Science Co-op, read from a first-year student's point of view.
 * Sources: sciencecoop.ubc.ca application requirements and deadline table,
 * plus the Computer Science Co-op notes in the UBC Calendar.
 *
 * Deadline dates move every year, so this stores the season, not the date.
 */

export const COOP_DEADLINES = "https://sciencecoop.ubc.ca/prospective/applydeadlines";
export const COOP_REQUIREMENTS = "https://sciencecoop.ubc.ca/prospective/applyreq";

export type CoopPlan = {
  /** The Science Co-op discipline you apply through. */
  program: string;
  /** Year standing when you can first apply. */
  applyIn: string;
  /** What first year has to look like for that application to work. */
  firstYear: string;
  /** First-year courses worth adding now because Co-op wants them early. */
  addCourses?: string[];
};

const CS_COOP: CoopPlan = {
  program: "Computer Science",
  applyIn: "Term 2 of first year (early March), or Term 1 of second year",
  firstYear:
    "To apply you need CPSC 110 finished and CPSC 121 and CPSC 210 in progress. Put CPSC 210 in Term 2 if you want the first-year deadline; otherwise take it in the summer after first year and apply in second year instead. Applying in first year puts your first work term in Term 2 of second year.",
  addCourses: ["CPSC 210"],
};

const PHYS_COOP: CoopPlan = {
  program: "Physics and Astronomy",
  applyIn: "Term 2 of first year (early March), or year 2 or 3 in the fall",
  firstYear:
    "This is one of the few disciplines that takes first-year applicants, so finish the physics lecture-plus-lab sequence and both calculus courses by April. Co-op also highly encourages CPSC 110 (or CPSC 103 and 107) before your first work term — Physics eligibility does not require it, so add it if you have a seat.",
  addCourses: ["CPSC 110"],
};

const STAT_COOP: CoopPlan = {
  program: "Statistics",
  applyIn: "year 2, in the fall",
  firstYear:
    "Nothing extra is due in first year. Finish calculus and your intro statistics or data science course on time so second-year Statistics is open to you.",
};

const MATH_COOP: CoopPlan = {
  program: "Mathematics and Mathematical Science",
  applyIn: "year 2 (early March), or year 2 or 3 in the fall",
  firstYear:
    "Nothing extra is due in first year. Both calculus courses matter most, since second-year MATH is the gate.",
};

const CHEM_COOP: CoopPlan = {
  program: "Chemistry & Chemical Biology",
  applyIn: "year 2 (early March), or year 3 in the fall",
  firstYear:
    "Nothing extra is due in first year. Finish both first-year chemistry courses so second-year CHEM is open on schedule.",
};

const BIOL_COOP: CoopPlan = {
  program: "Biology",
  applyIn: "year 2 or 3",
  firstYear:
    "Nothing extra is due in first year. Keep first-year biology and chemistry on schedule so second-year BIOL is open.",
};

const EARTH_COOP: CoopPlan = {
  program: "Earth, ocean, and environmental disciplines",
  applyIn: "year 2 or 3, in mid-September",
  firstYear:
    "Nothing extra is due in first year, but the deadline lands right after Labour Day — so plan to apply in the first week of second year, not later.",
};

const THIRD_YEAR_COOP = (program: string): CoopPlan => ({
  program,
  applyIn: "year 3, in the fall",
  firstYear:
    "Nothing extra is due in first year. The average is what carries forward, since it decides both your specialization placement and whether you clear the Co-op minimum.",
});

const COOP_BY_SPEC: Record<string, CoopPlan> = {
  cpsc: CS_COOP,
  "cogs-cid": {
    ...CS_COOP,
    program: "Cognitive Systems (Computational Intelligence and Design)",
    applyIn: "year 2 (early March), or year 3 in mid-September",
    firstYear:
      "Cognitive Systems applies in second year, not first. CPSC 210 is still the course to line up early, because the computational stream applies through the Computer Science intake.",
  },
  "cogs-brain": {
    program: "Cognitive Systems (Brain and Cognition)",
    applyIn: "year 2 (early March), or year 3 in mid-September",
    firstYear:
      "Nothing extra is due in first year. Keep psychology, biology, and the CPSC course on schedule so second-year Cognitive Systems is open.",
  },
  masc: MATH_COOP,
  math: MATH_COOP,
  stat: STAT_COOP,
  "stat-econ": STAT_COOP,
  dsci: {
    program: "Data Science",
    applyIn: "year 2, in the fall",
    firstYear:
      "Data Science applies in second year and expects the whole second-year core (DSCI 200, 220, 221, MATH 200, 221, STAT 201) finished that year. First year just has to leave you ready for it: the CPSC course, DSCI 100, and both calculus courses.",
  },
  chem: CHEM_COOP,
  "chem-biol": CHEM_COOP,
  "bioc-chem": {
    ...CHEM_COOP,
    program: "Chemistry (year 2) or Biochemistry and Molecular Biology (year 3)",
    applyIn: "year 2 through Chemistry, or year 3 through Biochemistry",
  },
  biol: BIOL_COOP,
  mbim: {
    program: "Microbiology & Immunology",
    applyIn: "year 2 (mid-January), or year 2 or 3 in mid-September",
    firstYear:
      "Nothing extra is due in first year, but the January deadline arrives early in second year — so this is a plan to make before you finish Term 2.",
  },
  bioc: THIRD_YEAR_COOP("Biochemistry and Molecular Biology"),
  caps: THIRD_YEAR_COOP("Cellular, Anatomical and Physiological Sciences"),
  pcth: THIRD_YEAR_COOP("Pharmacology"),
  nsci: THIRD_YEAR_COOP("Neuroscience"),
  insc: THIRD_YEAR_COOP("Integrated Sciences"),
  cmsc: THIRD_YEAR_COOP("CMS / General Science"),
  atsc: {
    program: "Atmospheric Sciences",
    applyIn: "year 3, in mid-September",
    firstYear:
      "Nothing extra is due in first year. The physics and calculus sequence is what keeps the later years on track.",
  },
  phys: PHYS_COOP,
  astr: PHYS_COOP,
  eosc: EARTH_COOP,
  geol: EARTH_COOP,
  geop: EARTH_COOP,
  geos: EARTH_COOP,
  ensc: {
    ...EARTH_COOP,
    program: "Environmental Sciences",
  },
  "cpsc-math": CS_COOP,
  "cpsc-stat": CS_COOP,
  "cpsc-phys": CS_COOP,
  "cpsc-chem": CS_COOP,
  "cpsc-biol": CS_COOP,
  "cpsc-mbim": CS_COOP,
  "cpsc-nsci": CS_COOP,
};

const GENERIC_COOP: CoopPlan = {
  program: "Science Co-op",
  applyIn: "usually year 2 or year 3",
  firstYear:
    "Most disciplines take applications in second or third year, so first year is about the average and finishing your specialization courses on time.",
};

export function coopPlan(specId: string): CoopPlan {
  return COOP_BY_SPEC[specId] ?? GENERIC_COOP;
}

/** True where Co-op wants a first-year course you would not otherwise take. */
export function coopCourses(specId: string): string[] {
  return coopPlan(specId).addCourses ?? [];
}

/** Facts that apply to every Science Co-op discipline. */
export const COOP_BASELINE = [
  "You need roughly a B− (68%) average, full-time registration, and good standing to apply.",
  "Being eligible is not an offer — placements are competitive, and Co-op admission is separate from specialization admission.",
];
