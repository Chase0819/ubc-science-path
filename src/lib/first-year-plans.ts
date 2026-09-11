import { courseByCode } from "./catalog";
import type { CourseSlot, EligibilityView } from "./requirements";
import type { Specialization } from "./types";

export type CourseAlternatives = string[][];

export type FirstYearRow =
  | {
      kind: "courses";
      display: string;
      alternatives: CourseAlternatives;
      credits: number;
      note?: number;
      lead?: string;
    }
  | {
      kind: "text";
      label: string;
      credits: number;
      note?: number;
    }
  | {
      kind: "electives";
      credits: number;
      note?: number;
    }
  | {
      kind: "total";
      credits: number;
    };

export type FirstYearPlan = {
  heading: string;
  calendarUrl: string;
  calendarLabel: string;
  intro?: string;
  rows: FirstYearRow[];
  notes: string[];
};

const CS_CALENDAR =
  "https://vancouver.calendar.ubc.ca/faculties-colleges-and-schools/faculty-science/bachelor-science/computer-science";

const DIFF_DISPLAY = "MATH 100 or 102 or 104 (or 180 or 184 or 120 or 110)";
const DIFF_ALTS: CourseAlternatives = [
  ["MATH 100"],
  ["MATH 102"],
  ["MATH 104"],
  ["MATH 180"],
  ["MATH 184"],
  ["MATH 120"],
  ["MATH 110"],
];
const INT_DISPLAY = "MATH 101 or 103 or 105 (or 121)";
const INT_ALTS: CourseAlternatives = [
  ["MATH 101"],
  ["MATH 103"],
  ["MATH 105"],
  ["MATH 121"],
];
const CPSC_110_ALTS: CourseAlternatives = [["CPSC 110"], ["CPSC 103", "CPSC 107"]];

const CS_NOTES = [
  "For a full list of acceptable courses see Communication Requirement in the UBC Calendar.",
  "CPSC 110 is the recommended route. CPSC 103 and 107 may replace it, using 2 credits of electives.",
  "Students aiming at Co-op are advised to also take CPSC 210 in first year or the following summer.",
  "Elective credits can move between years. Extra-credit MATH courses mean fewer electives later. Electives plus required courses must still meet Faculty of Science foundational, laboratory, breadth, Science/Arts, upper-level, and general degree requirements.",
];

function csFirstYear(options: {
  heading: string;
  intro?: string;
  extraAfterMath?: FirstYearRow[];
  electiveCredits: number;
  total: number;
  extraNotes?: string[];
}): FirstYearPlan {
  return {
    heading: options.heading,
    calendarUrl: CS_CALENDAR,
    calendarLabel: "UBC Calendar · Computer Science",
    intro: options.intro,
    rows: [
      { kind: "courses", display: "SCIE 113", alternatives: [["SCIE 113"]], credits: 3, lead: "SCIE 113" },
      { kind: "text", label: "Additional Communication Requirement", credits: 3, note: 1 },
      {
        kind: "courses",
        display: "CPSC 110 (or CPSC 103 and 107)",
        alternatives: CPSC_110_ALTS,
        credits: 4,
        note: 2,
        lead: "CPSC 110",
      },
      {
        kind: "courses",
        display: "CPSC 121",
        alternatives: [["CPSC 121"]],
        credits: 4,
        note: 3,
        lead: "CPSC 121",
      },
      {
        kind: "courses",
        display: DIFF_DISPLAY,
        alternatives: DIFF_ALTS,
        credits: 3,
        note: 4,
        lead: "MATH 100",
      },
      {
        kind: "courses",
        display: INT_DISPLAY,
        alternatives: INT_ALTS,
        credits: 3,
        note: 4,
        lead: "MATH 101",
      },
      ...(options.extraAfterMath ?? []),
      { kind: "electives", credits: options.electiveCredits, note: 4 },
      { kind: "total", credits: options.total },
    ],
    notes: [...CS_NOTES, ...(options.extraNotes ?? [])],
  };
}

const CS_INTRO =
  "To get into CS you apply through Science in late May / early June. CPSC 110 (or 107) is the gate. The list below is what first year actually looks like.";

const PLANS: Record<string, FirstYearPlan> = {
  cpsc: csFirstYear({
    heading: "Major (0376) and Honours (0154): Computer Science",
    intro: CS_INTRO,
    electiveCredits: 10,
    total: 30,
  }),
  "cogs-cid": csFirstYear({
    heading: "Cognitive Systems: Computational Intelligence and Design — first year follows Computer Science",
    intro: CS_INTRO,
    electiveCredits: 10,
    total: 30,
  }),
  masc: csFirstYear({
    heading: "Mathematical Sciences — first year follows Computer Science calculus and CPSC 110",
    intro: CS_INTRO,
    electiveCredits: 10,
    total: 30,
  }),
  "cpsc-math": csFirstYear({
    heading: "Combined Major: Computer Science and Mathematics",
    intro: CS_INTRO,
    electiveCredits: 10,
    total: 30,
  }),
  "cpsc-stat": csFirstYear({
    heading: "Combined Major: Computer Science and Statistics",
    intro: CS_INTRO,
    electiveCredits: 10,
    total: 30,
  }),
  "cpsc-biol": csFirstYear({
    heading: "Combined Major: Computer Science and Biology",
    intro: CS_INTRO,
    extraAfterMath: [
      {
        kind: "courses",
        display: "CHEM 121 (or 111 or 141)",
        alternatives: [["CHEM 121"], ["CHEM 111"], ["CHEM 141"]],
        credits: 4,
        lead: "CHEM 121",
      },
      {
        kind: "courses",
        display: "CHEM 123",
        alternatives: [["CHEM 123"]],
        credits: 4,
        lead: "CHEM 123",
      },
      {
        kind: "courses",
        display: "BIOL 112 or BIOL 121",
        alternatives: [["BIOL 112"], ["BIOL 121"]],
        credits: 3,
        lead: "BIOL 112",
      },
    ],
    electiveCredits: 0,
    total: 31,
  }),
  "cpsc-mbim": csFirstYear({
    heading: "Combined Major: Computer Science and Microbiology and Immunology",
    intro: CS_INTRO,
    extraAfterMath: [
      {
        kind: "courses",
        display: "CHEM 121 (or 111 or 141)",
        alternatives: [["CHEM 121"], ["CHEM 111"], ["CHEM 141"]],
        credits: 4,
        lead: "CHEM 121",
      },
      {
        kind: "courses",
        display: "CHEM 123",
        alternatives: [["CHEM 123"]],
        credits: 4,
        lead: "CHEM 123",
      },
      {
        kind: "courses",
        display: "BIOL 112",
        alternatives: [["BIOL 112"]],
        credits: 3,
        lead: "BIOL 112",
      },
    ],
    electiveCredits: 0,
    total: 31,
  }),
  "cpsc-nsci": csFirstYear({
    heading: "Combined Major: Computer Science and Neuroscience",
    intro: CS_INTRO,
    extraAfterMath: [
      {
        kind: "courses",
        display: "CHEM 121 (or 111 or 141)",
        alternatives: [["CHEM 121"], ["CHEM 111"], ["CHEM 141"]],
        credits: 4,
        lead: "CHEM 121",
      },
      {
        kind: "courses",
        display: "CHEM 123",
        alternatives: [["CHEM 123"]],
        credits: 4,
        lead: "CHEM 123",
      },
      {
        kind: "courses",
        display: "BIOL 112",
        alternatives: [["BIOL 112"]],
        credits: 3,
        lead: "BIOL 112",
      },
    ],
    electiveCredits: 0,
    total: 31,
  }),
  "cpsc-chem": {
    heading: "Combined Major (3401): Computer Science and Chemistry",
    calendarUrl: CS_CALENDAR,
    calendarLabel: "UBC Calendar · Computer Science",
    intro: CS_INTRO,
    rows: [
      { kind: "courses", display: "SCIE 113", alternatives: [["SCIE 113"]], credits: 3, note: 1, lead: "SCIE 113" },
      {
        kind: "courses",
        display: "CHEM 121 (or 111 or 141)",
        alternatives: [["CHEM 121"], ["CHEM 111"], ["CHEM 141"]],
        credits: 4,
        note: 2,
        lead: "CHEM 121",
      },
      { kind: "courses", display: "CHEM 123", alternatives: [["CHEM 123"]], credits: 4, note: 3, lead: "CHEM 123" },
      {
        kind: "courses",
        display: "CPSC 110 (or CPSC 103 and 107)",
        alternatives: CPSC_110_ALTS,
        credits: 4,
        note: 4,
        lead: "CPSC 110",
      },
      { kind: "courses", display: "CPSC 121", alternatives: [["CPSC 121"]], credits: 4, note: 5, lead: "CPSC 121" },
      { kind: "courses", display: "MATH 100 or 102 or 104", alternatives: [["MATH 100"], ["MATH 102"], ["MATH 104"]], credits: 3, note: 6, lead: "MATH 100" },
      { kind: "courses", display: "MATH 101 or 103 or 105", alternatives: [["MATH 101"], ["MATH 103"], ["MATH 105"]], credits: 3, note: 7, lead: "MATH 101" },
      { kind: "electives", credits: 6, note: 8 },
      { kind: "total", credits: 31 },
    ],
    notes: [
      "CHEM 300 in third year can satisfy the additional communication requirement.",
      "Without Chemistry 12 you may need CHEM 100. CHEM 110/115 may substitute for CHEM 111; CHEM 120/115 for CHEM 121.",
      "CHEM 130 and 135 may substitute for CHEM 123.",
      "CPSC 110 is the recommended route. CPSC 103 and 107 may replace it using 2 credits of electives.",
      "Co-op students are advised to take CPSC 210 in first year or the following summer.",
      "MATH 180 or 184 or 120 or 110 may substitute for the listed differential calculus courses.",
      "MATH 121 may substitute for the listed integral calculus courses.",
      "Electives plus required courses must meet Faculty of Science degree requirements.",
    ],
  },
  "cpsc-phys": {
    heading: "Combined Major (1391): Computer Science and Physics",
    calendarUrl: CS_CALENDAR,
    calendarLabel: "UBC Calendar · Computer Science",
    intro: CS_INTRO,
    rows: [
      { kind: "courses", display: "SCIE 113", alternatives: [["SCIE 113"]], credits: 3, lead: "SCIE 113" },
      { kind: "text", label: "Additional Communication Requirement", credits: 3, note: 1 },
      {
        kind: "courses",
        display: "CPSC 110 (or CPSC 103 and 107)",
        alternatives: CPSC_110_ALTS,
        credits: 4,
        note: 2,
        lead: "CPSC 110",
      },
      { kind: "courses", display: "CPSC 121", alternatives: [["CPSC 121"]], credits: 4, note: 3, lead: "CPSC 121" },
      {
        kind: "courses",
        display: "MATH 100 (or 102 or 104 or 110 or 180 or 184 or 120)",
        alternatives: DIFF_ALTS,
        credits: 3,
        note: 4,
        lead: "MATH 100",
      },
      {
        kind: "courses",
        display: "MATH 101 (or 103 or 105 or 121)",
        alternatives: INT_ALTS,
        credits: 3,
        note: 4,
        lead: "MATH 101",
      },
      {
        kind: "courses",
        display: "PHYS 117 (or 106 or 107)",
        alternatives: [["PHYS 117"], ["PHYS 106"], ["PHYS 107"]],
        credits: 3,
        note: 5,
        lead: "PHYS 117",
      },
      {
        kind: "courses",
        display: "PHYS 118 (or 108)",
        alternatives: [["PHYS 118"], ["PHYS 108"]],
        credits: 3,
        note: 5,
        lead: "PHYS 118",
      },
      { kind: "courses", display: "PHYS 119", alternatives: [["PHYS 119"]], credits: 1, lead: "PHYS 119" },
      { kind: "electives", credits: 3, note: 4 },
      { kind: "total", credits: 30 },
    ],
    notes: [
      "For a full list of acceptable courses see Communication Requirement in the UBC Calendar.",
      "CPSC 110 is the recommended route. CPSC 103 and 107 may replace it using 2 credits of electives.",
      "Co-op students are advised to take CPSC 210 in first year or the following summer.",
      "If an alternate course has a different credit value, adjust electives. Electives must still meet Faculty of Science degree requirements.",
      "Without Physics 12 take PHYS 100 first. Qualified students are encouraged to take PHYS (106 or 107)/108/119.",
    ],
  },
};

function formatOr(codes: string[]): string {
  return codes.join(" or ");
}

function slotToRow(slot: CourseSlot): FirstYearRow {
  if (slot.kind === "simple") {
    const lead = slot.courses[0];
    return {
      kind: "courses",
      display: formatOr(slot.courses),
      alternatives: slot.courses.map((code) => [code]),
      credits: courseByCode(lead)?.credits ?? 3,
      lead,
    };
  }
  const display = slot.paths
    .map((path) => {
      const inner = path.slots
        .map((item) => (item.chooseOne ? formatOr(item.courses) : item.courses.join(" and ")))
        .join(", and ");
      return `${path.name}: ${inner}`;
    })
    .join(" — or — ");
  const alternatives: CourseAlternatives = [];
  for (const path of slot.paths) {
    const groups = path.slots.map((item) => item.courses);
    if (groups.length === 1) {
      for (const code of groups[0]) alternatives.push([code]);
    } else {
      alternatives.push(groups.flat());
    }
  }
  return {
    kind: "courses",
    display,
    alternatives,
    credits: 4,
    lead: alternatives[0]?.[0],
  };
}

function fallbackPlan(spec: Specialization, view: EligibilityView): FirstYearPlan {
  const rows: FirstYearRow[] = [
    { kind: "courses", display: "SCIE 113", alternatives: [["SCIE 113"]], credits: 3, lead: "SCIE 113" },
    { kind: "text", label: "Additional Communication Requirement", credits: 3, note: 1 },
    ...view.slots.map(slotToRow),
  ];
  const listed = new Set(codesFromPlan({ rows }));
  for (const code of spec.recommended) {
    if (listed.has(code) || code === "SCIE 113") continue;
    rows.push({
      kind: "courses",
      display: code,
      alternatives: [[code]],
      credits: courseByCode(code)?.credits ?? 3,
      lead: code,
    });
    listed.add(code);
  }
  const used = rows.reduce((sum, row) => {
    if (row.kind === "courses" || row.kind === "text") return sum + row.credits;
    return sum;
  }, 0);
  const electives = Math.max(0, 30 - used);
  if (electives > 0) rows.push({ kind: "electives", credits: electives, note: 2 });
  rows.push({ kind: "total", credits: used + electives });
  return {
    heading: `${spec.name} — first year`,
    calendarUrl:
      "https://vancouver.calendar.ubc.ca/faculties-colleges-and-schools/faculty-science/bachelor-science",
    calendarLabel: "UBC Calendar · Bachelor of Science",
    intro: view.noSubjectList
      ? "This specialization has no extra subject eligibility list. You still need second-year standing (typically 24+ credits) and the first-year Science pattern below."
      : "Finish the subject rows by the end of Winter Session if they are eligibility courses. Calculus and communication are the usual first-year Science pattern.",
    rows,
    notes: [
      "For a full list of acceptable courses see Communication Requirement in the UBC Calendar.",
      "Electives plus required courses must meet Faculty of Science degree requirements. Extra-credit MATH courses mean fewer electives later.",
    ],
  };
}

export function codesFromPlan(plan: Pick<FirstYearPlan, "rows">): string[] {
  const codes: string[] = [];
  for (const row of plan.rows) {
    if (row.kind !== "courses") continue;
    for (const alt of row.alternatives) codes.push(...alt);
  }
  return [...new Set(codes)];
}

export function getFirstYearPlan(spec: Specialization, view: EligibilityView): FirstYearPlan {
  return PLANS[spec.id] ?? fallbackPlan(spec, view);
}

export function alternativeCovered(alt: string[], covered: Set<string>): boolean {
  return alt.every((code) => covered.has(code));
}

export function rowCovered(row: Extract<FirstYearRow, { kind: "courses" }>, covered: Set<string>): boolean {
  return row.alternatives.some((alt) => alternativeCovered(alt, covered));
}
