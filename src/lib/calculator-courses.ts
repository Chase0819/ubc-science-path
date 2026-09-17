import { LAB_BROWSE } from "./browse-courses";
import { CATALOG } from "./catalog";

export type CalcCourseOption = {
  code: string;
  title: string;
  credits: number;
};

/** Common 200-level Science courses that are not already in the first-year catalog. */
const LEVEL_200: CalcCourseOption[] = [
  { code: "MATH 200", title: "Calculus III", credits: 3 },
  { code: "MATH 210", title: "Introduction to Mathematical Computing", credits: 3 },
  { code: "MATH 215", title: "Elementary Differential Equations I", credits: 3 },
  { code: "MATH 217", title: "Multivariable and Vector Calculus", credits: 4 },
  { code: "MATH 220", title: "Mathematical Proof", credits: 3 },
  { code: "MATH 221", title: "Matrix Algebra", credits: 3 },
  { code: "MATH 223", title: "Honours Linear Algebra", credits: 3 },
  { code: "MATH 226", title: "Advanced Calculus I", credits: 3 },
  { code: "MATH 253", title: "Multivariable Calculus", credits: 3 },
  { code: "CPSC 203", title: "Programming, Problem Solving, and Algorithms", credits: 3 },
  { code: "CPSC 213", title: "Introduction to Computer Systems", credits: 4 },
  { code: "CPSC 221", title: "Basic Algorithms and Data Structures", credits: 4 },
  { code: "CHEM 203", title: "Introduction to Organic Chemistry", credits: 4 },
  { code: "CHEM 205", title: "Physical Chemistry", credits: 3 },
  { code: "CHEM 211", title: "Introduction to Chemical Analysis", credits: 4 },
  { code: "CHEM 213", title: "Organic Chemistry", credits: 3 },
  { code: "CHEM 233", title: "Organic Chemistry for the Biological Sciences", credits: 3 },
  { code: "CHEM 235", title: "Organic Chemistry Laboratory", credits: 1 },
  { code: "BIOL 200", title: "Fundamentals of Cell Biology", credits: 3 },
  { code: "BIOL 201", title: "Introduction to Biochemistry", credits: 3 },
  { code: "BIOL 203", title: "Eukaryotic Microbiology", credits: 4 },
  { code: "BIOL 204", title: "Vertebrate Structure and Function", credits: 4 },
  { code: "BIOL 205", title: "Comparative Invertebrate Zoology", credits: 4 },
  { code: "BIOL 230", title: "Fundamentals of Ecology", credits: 3 },
  { code: "BIOL 234", title: "Fundamentals of Genetics", credits: 3 },
  { code: "BIOL 260", title: "Fundamentals of Physiology", credits: 3 },
  { code: "PHYS 200", title: "Relativity and Quanta", credits: 4 },
  { code: "PHYS 203", title: "Thermal Physics I", credits: 4 },
  { code: "PHYS 209", title: "Intermediate Experimental Physics", credits: 3 },
  { code: "PHYS 210", title: "Introduction to Computational Physics", credits: 3 },
  { code: "PHYS 216", title: "Intermediate Mechanics", credits: 3 },
  { code: "PHYS 250", title: "Introduction to Modern Physics", credits: 3 },
  { code: "STAT 201", title: "Statistical Inference for Data Science", credits: 3 },
  { code: "STAT 203", title: "Statistical Methods", credits: 3 },
  { code: "MICB 201", title: "Introductory Environmental Microbiology", credits: 3 },
  { code: "MICB 202", title: "Introductory Medical Microbiology and Immunology", credits: 3 },
  { code: "MICB 211", title: "Foundations of Microbiology", credits: 3 },
  { code: "MICB 212", title: "Introductory Immunology & Virology", credits: 3 },
  { code: "EOSC 211", title: "Computer Methods in Earth, Ocean and Atmospheric Sciences", credits: 3 },
  { code: "EOSC 212", title: "Topics in the Earth and Planetary Sciences", credits: 3 },
  { code: "EOSC 220", title: "Introductory Mineralogy", credits: 3 },
  { code: "EOSC 221", title: "Introductory Petrology", credits: 3 },
  { code: "EOSC 222", title: "Geological Time and Stratigraphy", credits: 3 },
  { code: "EOSC 223", title: "Field Techniques", credits: 3 },
  { code: "BIOC 202", title: "Introductory Medical Biochemistry", credits: 3 },
  { code: "BIOC 203", title: "Fundamentals of Biochemistry", credits: 3 },
];

function courseNumber(code: string): number | null {
  const match = /^[A-Z]+\s*(\d+)/i.exec(code.trim());
  return match ? Number(match[1]) : null;
}

function inCalcRange(code: string): boolean {
  if (code === "SCIE 001") return true;
  const number = courseNumber(code);
  return number !== null && number >= 100 && number < 300;
}

function asOption(row: { code: string; title: string; credits: number }): CalcCourseOption {
  return { code: row.code, title: row.title, credits: row.credits };
}

function compactCode(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase();
}

function sortOptions(rows: CalcCourseOption[]): CalcCourseOption[] {
  return [...rows].sort((a, b) => {
    const [subjectA, numberA = "0"] = a.code.split(" ");
    const [subjectB, numberB = "0"] = b.code.split(" ");
    if (subjectA !== subjectB) return subjectA.localeCompare(subjectB);
    return Number(numberA) - Number(numberB);
  });
}

const POOL = sortOptions(
  [
    ...CATALOG.filter((row) => inCalcRange(row.code) && !row.tags.includes("arts")).map(asOption),
    ...LAB_BROWSE.filter((row) => inCalcRange(row.code)).map(asOption),
    ...LEVEL_200,
  ].filter((row, index, list) => list.findIndex((item) => item.code === row.code) === index),
);

export const CALC_COURSES = POOL;

export function calcCourseByCode(code: string): CalcCourseOption | undefined {
  const compact = compactCode(code);
  return POOL.find((row) => compactCode(row.code) === compact);
}

const PER_SUBJECT = 4;
const MAX_RESULTS = 16;

/** Prefix search on the short code: "c" → CHEM / CPSC, "cpsc 2" → CPSC 203 / 210 / … */
export function searchCalcCourses(query: string): CalcCourseOption[] {
  const needle = compactCode(query);
  if (!needle) return [];
  const hits = POOL.filter((row) => compactCode(row.code).startsWith(needle));
  if (/\d/.test(needle)) return hits.slice(0, MAX_RESULTS);

  const taken = new Map<string, number>();
  const mixed: CalcCourseOption[] = [];
  for (const hit of hits) {
    const subject = hit.code.split(" ")[0] ?? hit.code;
    const count = taken.get(subject) ?? 0;
    if (count >= PER_SUBJECT) continue;
    taken.set(subject, count + 1);
    mixed.push(hit);
    if (mixed.length >= MAX_RESULTS) break;
  }
  return mixed;
}
