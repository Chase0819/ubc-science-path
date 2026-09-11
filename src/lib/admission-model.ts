import { meetsRequirement, missingPieces } from "./requirements";
import type { Cutoff, Specialization } from "./types";

export type Outlook = {
  probability: number;
  band: "blocked" | "reach" | "possible" | "competitive" | "likely" | "open";
  headline: string;
  detail: string;
  latestCutoff: number | null;
  latestLabel: string;
  trend: string;
  missing: string[];
};

function numericCutoffs(spec: Specialization): number[] {
  return spec.cutoffs
    .map((c) => c.value)
    .filter((v): v is number => typeof v === "number");
}

function latestCutoff(spec: Specialization): {
  year: number | null;
  value: Cutoff | undefined;
} {
  const last = [...spec.cutoffs].reverse().find((c) => c.value !== null);
  return { year: last?.year ?? null, value: last?.value };
}

function stdev(values: number[]): number {
  if (values.length < 2) return 3.2;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const varSum =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(varSum);
}

function logistic(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function clamp01(n: number): number {
  return Math.min(0.99, Math.max(0.01, n));
}

export function bandFromProbability(
  p: number,
  blocked: boolean,
  open: boolean,
): Outlook["band"] {
  if (blocked) return "blocked";
  if (open) return "open";
  if (p >= 0.8) return "likely";
  if (p >= 0.55) return "competitive";
  if (p >= 0.3) return "possible";
  return "reach";
}

export function predictAdmission(options: {
  spec: Specialization;
  sessional: number;
  completed: string[];
  gpa?: number;
}): Outlook {
  const { spec, sessional, completed } = options;
  const missing = missingPieces(spec.eligibility, completed);
  const eligible = meetsRequirement(spec.eligibility, completed);

  if (!eligible) {
    return {
      probability: 0,
      band: "blocked",
      headline: "Not eligible to apply yet",
      detail:
        "UBC Science will not place you into this specialization until every eligibility course is finished by the end of Winter Session. Finish the missing courses first — average only matters after that.",
      latestCutoff: null,
      latestLabel: "n/a",
      trend: "Eligibility is the gate. Average is the ranking key.",
      missing,
    };
  }

  if (spec.minSessional && sessional < spec.minSessional) {
    return {
      probability: 0.05,
      band: "blocked",
      headline: `Below the ${spec.minSessional}% honours floor`,
      detail: `This honours path lists a minimum sessional average of ${spec.minSessional}%.`,
      latestCutoff: spec.minSessional,
      latestLabel: `${spec.minSessional}% minimum`,
      trend: "Raise the sessional average before ranking honours first.",
      missing,
    };
  }

  if (!spec.quota) {
    return {
      probability: 0.97,
      band: "open",
      headline: "Eligible — this major has no quota",
      detail: `${spec.name} admits eligible students. Your ${sessional.toFixed(1)}% winter-session average is not used as a cutoff here.`,
      latestCutoff: null,
      latestLabel: "no quota",
      trend: "Keep eligibility and second-year standing (typically 24+ credits).",
      missing,
    };
  }

  const { year, value } = latestCutoff(spec);
  const history = numericCutoffs(spec);
  const sigma = Math.max(2.4, Math.min(6.5, stdev(history)));
  const mean =
    history.length > 0
      ? history.reduce((a, b) => a + b, 0) / history.length
      : 75;

  if (value === "NF" || history.length === 0) {
    const p = clamp01(0.88 + Math.max(0, sessional - 60) * 0.002);
    return {
      probability: p,
      band: bandFromProbability(p, false, true),
      headline: "Historically unfilled — eligible applicants got in",
      detail: `${spec.name} has not used a binding cutoff recently (NF). Your ${sessional.toFixed(1)}% average would have been enough in those years, as long as you stay eligible.`,
      latestCutoff: null,
      latestLabel: year ? `${year} NF` : "NF",
      trend: "NF years still need eligibility and second-year standing.",
      missing,
    };
  }

  const cutoff =
    typeof value === "number" ? value : mean;
  const blended = 0.7 * cutoff + 0.3 * mean;
  const z = (sessional - blended) / (sigma * 0.85);
  const probability = clamp01(logistic(z));
  const gap = sessional - cutoff;
  const band = bandFromProbability(probability, false, false);

  const headlines: Record<Outlook["band"], string> = {
    blocked: "Not competitive on current numbers",
    reach: "Reach — historically below the last cutoff",
    possible: "Possible, but the last cutoff was higher",
    competitive: "In range of recent cutoffs",
    likely: "Above recent cutoffs",
    open: "Open / unfilled historically",
  };

  const trend =
    history.length >= 2
      ? `Recent numeric cutoffs: ${history
          .slice(-3)
          .map((n) => n.toFixed(1))
          .join(" → ")}%. Year-to-year swing is about ${sigma.toFixed(1)} points.`
      : "Limited cutoff history — treat this as a rough prior, not a forecast.";

  return {
    probability,
    band,
    headline: headlines[band],
    detail: `UBC ranks eligible applicants by most recent Winter Session average. Last published cutoff for ${spec.name} was ${typeof value === "number" ? `${cutoff.toFixed(1)}%` : "suppressed"} (${year ?? "recent"}). You are ${gap >= 0 ? `${gap.toFixed(1)} points above` : `${Math.abs(gap).toFixed(1)} points below`} that line. This local model uses a logistic curve around a blend of the latest cutoff and the historical mean — it is not UBC's decision.`,
    latestCutoff: typeof value === "number" ? cutoff : null,
    latestLabel:
      typeof value === "number"
        ? `${year}: ${cutoff.toFixed(1)}%+`
        : `${year}: ${value}`,
    trend,
    missing,
  };
}
