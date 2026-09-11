import type { Requirement } from "./types";

export function hasScie001(completed: string[]): boolean {
  return completed.includes("SCIE 001");
}

export function meetsRequirement(
  req: Requirement,
  completed: string[],
): boolean {
  switch (req.kind) {
    case "none":
      return true;
    case "scie001":
      return hasScie001(completed);
    case "any":
      return req.courses.some((code) => completed.includes(code));
    case "all":
      return req.items.every((item) => meetsRequirement(item, completed));
    case "or":
      return req.items.some((item) => meetsRequirement(item, completed));
  }
}

export function flattenCourses(req: Requirement): string[] {
  switch (req.kind) {
    case "none":
    case "scie001":
      return [];
    case "any":
      return [...req.courses];
    case "all":
    case "or":
      return req.items.flatMap(flattenCourses);
  }
}

export function describeRequirement(req: Requirement): string {
  switch (req.kind) {
    case "none":
      return "No specific first-year eligibility courses.";
    case "scie001":
      return "SCIE 001 (Science One)";
    case "any":
      return req.courses.length === 1
        ? req.courses[0]
        : `one of ${req.courses.join(" / ")}`;
    case "all":
      return req.items.map(describeRequirement).join(" + ");
    case "or":
      return req.items.map((item) => `(${describeRequirement(item)})`).join(" or ");
  }
}

export function missingPieces(
  req: Requirement,
  completed: string[],
): string[] {
  if (meetsRequirement(req, completed)) return [];
  switch (req.kind) {
    case "none":
      return [];
    case "scie001":
      return ["SCIE 001"];
    case "any":
      return [`one of ${req.courses.join(" / ")}`];
    case "all":
      return req.items.flatMap((item) => missingPieces(item, completed));
    case "or":
      return [`${req.items.map(describeRequirement).join(" or ")}`];
  }
}
