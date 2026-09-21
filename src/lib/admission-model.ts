import { meetsRequirement, missingPieces } from "./requirements";
import type { Cutoff, Specialization } from "./types";

export type Chance = "blocked" | "low" | "medium" | "high";

export const HISTORICAL_CUTOFFS_URL =
  "https://science.ubc.ca/students/historical-bsc-specialization-admission-information";

export const COMBINED_CUTOFF_YEAR = 2025;

export function cutoffMixNote(spec: Specialization): string {
  if (spec.umbrella === "computer-science") {
    return `Through 2024, Computer Science cutoffs were published separately for domestic and international students. Each 2022–2024 point here is the average of those two lines. From ${COMBINED_CUTOFF_YEAR} on, Science published one combined cutoff — there was no DOM/INT split.`;
  }
  return "These published cutoffs are overall winter-session averages for that year, not split into domestic and international groups.";
}

export type Outlook = {
  chance: Chance;
  headline: string;
  reasons: string[];
  missing: string[];
};

export type CutoffChartPoint = {
  year: number;
  value: number | null;
  mark: "cutoff" | "nf" | "sup" | "none";
};

export function cutoffChartPoints(spec: Specialization): CutoffChartPoint[] {
  return spec.cutoffs.map((row) => {
    if (typeof row.value === "number") {
      return { year: row.year, value: row.value, mark: "cutoff" as const };
    }
    if (row.value === "NF") return { year: row.year, value: null, mark: "nf" as const };
    if (row.value === "sup") return { year: row.year, value: null, mark: "sup" as const };
    return { year: row.year, value: null, mark: "none" as const };
  });
}

export function predictAdmission(options: {
  spec: Specialization;
  sessional: number;
  completed: string[];
}): Outlook {
  const { spec, sessional, completed } = options;
  const missing = missingPieces(spec.eligibility, completed);
  const eligible = meetsRequirement(spec.eligibility, completed);
  const avg = `${sessional.toFixed(1)}%`;

  if (!eligible) {
    return {
      chance: "blocked",
      headline: "Not eligible to apply yet",
      reasons: [
        "UBC Science will not place you until every eligibility course is finished by the end of Winter Session. Average only matters after that.",
        ...missing.map((course) => `${course} is still missing from the planner.`),
      ],
      missing,
    };
  }

  if (spec.minSessional && sessional < spec.minSessional) {
    return {
      chance: "blocked",
      headline: `Below the ${spec.minSessional}% honours floor`,
      reasons: [
        `This honours path lists a minimum winter-session average of ${spec.minSessional}%. Your ${avg} is below that floor, so cutoff history does not apply yet.`,
      ],
      missing,
    };
  }

  const yearLines = [...spec.cutoffs].reverse();
  const numeric = spec.cutoffs.filter(
    (row): row is { year: number; value: number } => typeof row.value === "number",
  );
  const lastNumeric = [...numeric].reverse()[0] ?? null;
  const above = numeric.filter((row) => sessional + 1e-9 >= row.value);
  const below = numeric.filter((row) => sessional < row.value);
  const lastGap = lastNumeric ? sessional - lastNumeric.value : null;
  const lastWasNf = yearLines.find((row) => row.value !== null)?.value === "NF";

  if (!spec.quota) {
    return {
      chance: "high",
      headline: "High chance — this major has no quota",
      reasons: [
        `${spec.name} admits eligible students. Published cutoffs are not used to rank this choice.`,
        `Your ${avg} winter-session average is not a cutoff here. Keep eligibility and second-year standing (typically 24+ credits).`,
      ],
      missing,
    };
  }

  if (numeric.length === 0 && (lastWasNf || spec.cutoffs.some((row) => row.value === "NF"))) {
    return {
      chance: "high",
      headline: "High chance — recent years were unfilled",
      reasons: [
        `${spec.name} has not used a binding cutoff recently (NF). Eligible applicants got in those years.`,
        `Your ${avg} winter-session average would have been enough in NF years, as long as you stay eligible.`,
        ...yearByYearReasons(spec, sessional),
      ],
      missing,
    };
  }

  if (numeric.length === 0) {
    return {
      chance: "medium",
      headline: "Medium chance — little public cutoff history",
      reasons: [
        `There is no published numeric cutoff for ${spec.name} to compare with your ${avg} winter-session average.`,
        ...yearByYearReasons(spec, sessional),
        "Treat this as a planning hint, not a forecast. Cutoffs only appear when a program fills.",
      ],
      missing,
    };
  }

  const chance = chanceFromCutoffs(lastGap, above.length, below.length, numeric.length);
  const lastLine = lastNumeric
    ? `${lastNumeric.year} cutoff of ${lastNumeric.value.toFixed(1)}%`
    : "the latest published cutoff";

  const summary =
    chance === "high"
      ? `Your ${avg} winter-session average would have been above ${above.length} of ${numeric.length} published cutoffs${
          lastGap !== null && lastGap >= 0 ? `, including the ${lastLine}` : ""
        }. That is why this reads High.`
      : chance === "low"
        ? `Your ${avg} winter-session average would have been below ${below.length} of ${numeric.length} published cutoffs${
            lastGap !== null && lastGap < 0 ? `, including the ${lastLine}` : ""
          }. That is why this reads Low.`
        : `Your ${avg} winter-session average is close to the recent cutoff line — above ${above.length} and below ${below.length} of ${numeric.length} published years${
            lastNumeric && lastGap !== null
              ? lastGap >= 0
                ? `. You sit ${lastGap.toFixed(1)} points above the ${lastLine}`
                : `. You sit ${Math.abs(lastGap).toFixed(1)} points below the ${lastLine}`
              : ""
          }. That is why this reads Medium.`;

  const headlines: Record<Exclude<Chance, "blocked">, string> = {
    low: "Low chance on recent cutoffs",
    medium: "Medium chance — near recent cutoffs",
    high: "High chance on recent cutoffs",
  };

  return {
    chance,
    headline: headlines[chance],
    reasons: [
      `Eligibility courses for ${spec.name} are marked complete in the planner.`,
      summary,
      ...yearByYearReasons(spec, sessional),
      ...(spec.umbrella === "computer-science" ? [cutoffMixNote(spec)] : []),
      "Cutoffs move with demand and seat counts. Beating last year does not guarantee this year, and this is not UBC's decision.",
    ],
    missing,
  };
}

function chanceFromCutoffs(
  lastGap: number | null,
  above: number,
  below: number,
  total: number,
): Exclude<Chance, "blocked"> {
  if (total > 0 && above === total) return "high";
  if (lastGap !== null && lastGap >= 3) return "high";
  if (lastGap !== null && lastGap >= 1 && above >= below) return "high";
  if (total > 0 && above === 0 && lastGap !== null && lastGap < 0) return "low";
  if (lastGap !== null && lastGap <= -3) return "low";
  return "medium";
}

function yearByYearReasons(spec: Specialization, sessional: number): string[] {
  return [...spec.cutoffs]
    .reverse()
    .map((row) => yearReason(row.year, row.value, sessional))
    .filter((line): line is string => Boolean(line));
}

function yearReason(year: number, value: Cutoff, sessional: number): string | null {
  const avg = `${sessional.toFixed(1)}%`;
  if (value === null) {
    return `${year} has no published cutoff, so it is not used as evidence.`;
  }
  if (value === "NF") {
    return `${year} was not filled (NF). Eligible applicants got in that year, so your ${avg} winter average would have been enough.`;
  }
  if (value === "sup") {
    return `${year} cutoff was suppressed. There is no public number to compare with your ${avg}.`;
  }
  const gap = sessional - value;
  const line = `${year} cutoff was ${value.toFixed(1)}%.`;
  if (Math.abs(gap) < 0.05) {
    return `${line} Your ${avg} winter average sits on that line.`;
  }
  if (gap > 0) {
    return `${line} Your ${avg} winter average would have been ${gap.toFixed(1)} points above that line.`;
  }
  return `${line} Your ${avg} winter average would have been ${Math.abs(gap).toFixed(1)} points below that line.`;
}
