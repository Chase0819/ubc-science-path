export function letterFromPercent(percent: number): string {
  if (percent >= 90) return "A+";
  if (percent >= 85) return "A";
  if (percent >= 80) return "A-";
  if (percent >= 76) return "B+";
  if (percent >= 72) return "B";
  if (percent >= 68) return "B-";
  if (percent >= 64) return "C+";
  if (percent >= 60) return "C";
  if (percent >= 55) return "C-";
  if (percent >= 50) return "D";
  return "F";
}

export function gpaFromPercent(percent: number): number {
  if (percent >= 90) return 4.33;
  if (percent >= 85) return 4.0;
  if (percent >= 80) return 3.7;
  if (percent >= 76) return 3.3;
  if (percent >= 72) return 3.0;
  if (percent >= 68) return 2.7;
  if (percent >= 64) return 2.3;
  if (percent >= 60) return 2.0;
  if (percent >= 55) return 1.7;
  if (percent >= 50) return 1.0;
  return 0;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function componentPercent(
  components: { weight: number; score: number | "" }[],
): number | null {
  const usable = components.filter(
    (c) => c.weight > 0 && c.score !== "" && Number.isFinite(Number(c.score)),
  );
  if (usable.length === 0) return null;
  const weightSum = usable.reduce((sum, c) => sum + c.weight, 0);
  if (weightSum <= 0) return null;
  const weighted = usable.reduce(
    (sum, c) => sum + (Number(c.score) * c.weight) / weightSum,
    0,
  );
  return weighted;
}

export function remainingNeeded(
  components: { name: string; weight: number; score: number | "" }[],
  targetPercent: number,
): { remainingWeight: number; neededOnRemaining: number | null } | null {
  const remaining = components.filter(
    (c) => c.weight > 0 && (c.score === "" || !Number.isFinite(Number(c.score))),
  );
  const done = components.filter(
    (c) => c.weight > 0 && c.score !== "" && Number.isFinite(Number(c.score)),
  );
  const totalWeight = components.reduce(
    (sum, c) => sum + (c.weight > 0 ? c.weight : 0),
    0,
  );
  if (totalWeight <= 0 || remaining.length === 0) return null;
  const remainingWeight = remaining.reduce((sum, c) => sum + c.weight, 0);
  const earned = done.reduce((sum, c) => sum + Number(c.score) * c.weight, 0);
  const neededTotal = targetPercent * totalWeight;
  const neededOnRemaining = (neededTotal - earned) / remainingWeight;
  return { remainingWeight, neededOnRemaining };
}
