export type Requirement =
  | { kind: "none" }
  | { kind: "scie001" }
  | { kind: "any"; courses: string[] }
  | { kind: "all"; items: Requirement[] }
  | { kind: "or"; items: Requirement[] };

export type Cutoff = number | "NF" | "sup" | null;

export type Specialization = {
  id: string;
  name: string;
  kind: "major" | "combined-major" | "honours" | "combined-honours";
  quota: boolean;
  umbrella?: "computer-science" | "statistics" | "cognitive-systems";
  eligibility: Requirement;
  notes: string[];
  recommended: string[];
  cutoffs: { year: number; value: Cutoff }[];
  minSessional?: number;
};

export type CatalogCourse = {
  code: string;
  title: string;
  credits: number;
  tags: string[];
  blurb: string;
};

export type GradeComponent = {
  id: string;
  name: string;
  weight: number | "";
  score: number | "";
};

export type CalcTerm = "term1" | "term2";

export type CalculatorCourse = {
  id: string;
  code: string;
  credits: number;
  term: CalcTerm;
  target: number | "";
  components: GradeComponent[];
  percentOverride: number | "";
};

export type CalculatorTargets = {
  term1: number | "";
  term2: number | "";
  combined: number | "";
};

export type CalculatorState = {
  courses: CalculatorCourse[];
  targets: CalculatorTargets;
};

export type PlannerState = {
  completed: string[];
  intended: string[];
};

export type ApState = {
  exams: string[];
};

export type TermPlan = {
  term1: string[];
  term2: string[];
};
