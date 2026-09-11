import { cache } from "react";
import { round1 } from "./grades";

export type WinterAverage = {
  session: string;
  average: number;
  reported: number | null;
};

type GradeRow = {
  section?: string;
  average?: number | null;
  year?: string;
  session?: string;
  reported?: number | null;
};

function splitCode(code: string): { subject: string; course: string } | null {
  const match = code.trim().match(/^([A-Za-z]+)\s+(\d+[A-Za-z]?)$/);
  if (!match) return null;
  return { subject: match[1].toUpperCase(), course: match[2] };
}

export function ubcGradesUrl(code: string): string {
  const parts = splitCode(code);
  if (!parts) return "https://ubcgrades.com/";
  return `https://ubcgrades.com/#UBCV-${parts.subject}-${parts.course}`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const winterSessions = cache(async (): Promise<string[]> => {
  const sessions = await fetchJson<string[]>(
    "https://ubcgrades.com/api/v3/yearsessions/UBCV",
  );
  if (!sessions?.length) return ["2025W", "2024W", "2023W"];
  return sessions.filter((session) => session.endsWith("W")).reverse();
});

function fromOverall(rows: GradeRow[], session: string): WinterAverage | null {
  const overall = rows.find((row) => row.section === "OVERALL");
  if (!overall || typeof overall.average !== "number") return null;
  return {
    session,
    average: round1(overall.average),
    reported: typeof overall.reported === "number" ? overall.reported : null,
  };
}

async function averageForCode(code: string): Promise<WinterAverage | null> {
  const parts = splitCode(code);
  if (!parts) return null;
  const sessions = await winterSessions();
  for (const session of sessions.slice(0, 4)) {
    const rows = await fetchJson<GradeRow[]>(
      `https://ubcgrades.com/api/v3/grades/UBCV/${session}/${parts.subject}/${parts.course}`,
    );
    if (!rows?.length) continue;
    const found = fromOverall(rows, session);
    if (found) return found;
  }
  return null;
}

export const getWinterAverages = cache(async (codes: string[]) => {
  const unique = [...new Set(codes)];
  const entries = await Promise.all(
    unique.map(async (code) => [code, await averageForCode(code)] as const),
  );
  return Object.fromEntries(entries) as Record<string, WinterAverage | null>;
});
