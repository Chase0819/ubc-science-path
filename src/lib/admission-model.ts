import type { Specialization } from "./types";

export type Chance = "low" | "medium" | "high";

export type ExplanationBit = {
  text: string;
  strong?: boolean;
};

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
  explanation: ExplanationBit[];
  forecast: CutoffForecast | null;
};

export type CutoffForecast = {
  year: number;
  value: number;
  slope: number;
  fromYear: number;
  toYear: number;
  lastPublished: { year: number; value: number };
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

function numericCutoffs(spec: Specialization) {
  return spec.cutoffs.filter(
    (row): row is { year: number; value: number } => typeof row.value === "number",
  );
}

export function forecastCutoff(spec: Specialization): CutoffForecast | null {
  const numeric = numericCutoffs(spec);
  if (numeric.length === 0) return null;

  const lastPublished = numeric[numeric.length - 1];
  const year = lastPublished.year + 1;
  const recent = numeric.slice(-5);
  const fromYear = recent[0].year;
  const toYear = recent[recent.length - 1].year;

  if (recent.length === 1) {
    return {
      year,
      value: lastPublished.value,
      slope: 0,
      fromYear,
      toYear,
      lastPublished,
    };
  }

  const n = recent.length;
  const meanX = recent.reduce((sum, row) => sum + row.year, 0) / n;
  const meanY = recent.reduce((sum, row) => sum + row.value, 0) / n;
  let num = 0;
  let den = 0;
  for (const row of recent) {
    num += (row.year - meanX) * (row.value - meanY);
    den += (row.year - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  const raw = intercept + slope * year;
  const clamped = Math.min(lastPublished.value + 6, Math.max(lastPublished.value - 6, raw));
  const value = Math.round(Math.min(100, Math.max(40, clamped)) * 10) / 10;

  return {
    year,
    value,
    slope: Math.round(slope * 10) / 10,
    fromYear,
    toYear,
    lastPublished,
  };
}

export function predictAdmission(options: {
  spec: Specialization;
  sessional: number;
}): Outlook {
  const { spec, sessional } = options;
  const avg = `${sessional.toFixed(1)}%`;
  const forecast = forecastCutoff(spec);
  const assumed = "This assumes you already took the required courses.";
  const disclaimer = {
    text: "This is only based on past published cutoffs — not a UBC decision.",
    strong: true,
  };

  if (spec.minSessional && sessional < spec.minSessional) {
    return {
      chance: "low",
      headline: "Low on past cutoffs",
      explanation: paragraph(
        assumed,
        `This honours path listed a ${spec.minSessional}% winter-session floor, and your ${avg} is below that published line.`,
        disclaimer,
      ),
      forecast,
    };
  }

  const yearLines = [...spec.cutoffs].reverse();
  const numeric = numericCutoffs(spec);
  const lastNumeric = numeric[numeric.length - 1] ?? null;
  const above = numeric.filter((row) => sessional + 1e-9 >= row.value);
  const below = numeric.filter((row) => sessional < row.value);
  const lastGap = lastNumeric ? sessional - lastNumeric.value : null;
  const predictedGap = forecast ? sessional - forecast.value : null;
  const lastWasNf = yearLines.find((row) => row.value !== null)?.value === "NF";

  if (!spec.quota) {
    return {
      chance: "high",
      headline: "High — no quota on the cutoff page",
      explanation: paragraph(
        assumed,
        `${spec.name} has no quota, so past cutoff pages are not used to rank it.`,
        disclaimer,
      ),
      forecast,
    };
  }

  if (numeric.length === 0 && (lastWasNf || spec.cutoffs.some((row) => row.value === "NF"))) {
    return {
      chance: "high",
      headline: "High — recent years were unfilled",
      explanation: paragraph(
        assumed,
        {
          text: "Recent published years were unfilled (NF), so eligible students got in.",
          strong: true,
        },
        disclaimer,
      ),
      forecast,
    };
  }

  if (numeric.length === 0) {
    return {
      chance: "medium",
      headline: "Medium — little public cutoff history",
      explanation: paragraph(
        assumed,
        `There is no published numeric cutoff to compare with your ${avg}.`,
        disclaimer,
      ),
      forecast,
    };
  }

  const chance = chanceFromHistoryAndTrend(
    lastGap,
    predictedGap,
    above.length,
    below.length,
    numeric.length,
  );
  const lastBit = lastNumeric
    ? `including ${lastNumeric.year} at ${lastNumeric.value.toFixed(1)}%`
    : "the latest published year";
  const vsHistory =
    chance === "high"
      ? `Your ${avg} would have cleared ${above.length} of ${numeric.length} published years, ${lastBit}.`
      : chance === "low"
        ? `Your ${avg} would have sat under ${below.length} of ${numeric.length} published years, ${lastBit}.`
        : `Your ${avg} is mixed against past years — above ${above.length} and below ${below.length} of ${numeric.length}, ${lastBit}.`;

  const headlines: Record<Chance, string> = {
    low: "Low on past cutoffs",
    medium: "Medium on past cutoffs",
    high: "High on past cutoffs",
  };

  return {
    chance,
    headline: headlines[chance],
    explanation: paragraph(assumed, { text: vsHistory, strong: true }, trendSentence(forecast, sessional), disclaimer),
    forecast,
  };
}

function chanceFromHistoryAndTrend(
  lastGap: number | null,
  predictedGap: number | null,
  above: number,
  below: number,
  total: number,
): Chance {
  const last = lastGap ?? predictedGap;
  const pred = predictedGap ?? lastGap;
  if (last === null || pred === null) return "medium";

  if ((last >= 3 && pred >= 1) || (pred >= 3 && last >= 1) || (total > 0 && above === total && pred >= 1)) {
    return "high";
  }
  if (lastGap !== null && lastGap >= 1 && above >= below && pred >= 0) {
    return "high";
  }
  if ((last <= -3 && pred < 0) || (pred <= -3 && last < 0) || (total > 0 && above === 0 && last < 0 && pred < 0)) {
    return "low";
  }
  return "medium";
}

function paragraph(
  ...parts: Array<string | ExplanationBit | null | undefined>
): ExplanationBit[] {
  const bits: ExplanationBit[] = [];
  for (const part of parts) {
    if (!part) continue;
    const bit = typeof part === "string" ? { text: part } : part;
    if (bits.length) bits.push({ text: " " });
    bits.push(bit);
  }
  return bits;
}

function trendSentence(forecast: CutoffForecast | null, sessional: number): string | null {
  if (!forecast) return null;
  const gap = sessional - forecast.value;
  const span =
    forecast.fromYear === forecast.toYear
      ? `${forecast.toYear}`
      : `${forecast.fromYear}–${forecast.toYear}`;
  const move =
    Math.abs(forecast.slope) < 0.15
      ? `Past cutoffs from ${span} were roughly flat`
      : forecast.slope > 0
        ? `Past cutoffs from ${span} rose about ${forecast.slope.toFixed(1)} points a year`
        : `Past cutoffs from ${span} fell about ${Math.abs(forecast.slope).toFixed(1)} points a year`;
  const vs =
    Math.abs(gap) < 0.05
      ? `even with a possible ${forecast.year} line near ${forecast.value.toFixed(1)}%`
      : gap > 0
        ? `${gap.toFixed(1)} points above a possible ${forecast.year} line near ${forecast.value.toFixed(1)}%`
        : `${Math.abs(gap).toFixed(1)} points below a possible ${forecast.year} line near ${forecast.value.toFixed(1)}%`;
  return `${move}, so your ${sessional.toFixed(1)}% sits ${vs}.`;
}
