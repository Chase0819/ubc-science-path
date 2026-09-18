"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { componentPercent, round1 } from "@/lib/grades";
import type { CalculatorCourse } from "@/lib/types";
import { COMPONENT_PRESETS } from "@/lib/calculator-components";
import { ubcGradesUrl, type CourseWinterSeries } from "@/lib/ubcgrades";

const PRESET_ORDER = [...COMPONENT_PRESETS];

type RankedCourse = {
  course: CalculatorCourse;
  you: number | null;
  campus: number | null;
  session: string | null;
  diff: number | null;
};

type ComponentGroup = {
  key: string;
  name: string;
  custom: boolean;
  average: number | null;
  rows: { id: string; code: string; score: number | null }[];
};

export function AverageAnalysis({
  title,
  courses,
  target,
  targetLabel,
  onClose,
}: {
  title: string;
  courses: CalculatorCourse[];
  target: number | "";
  targetLabel: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const [series, setSeries] = useState<Record<string, CourseWinterSeries>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const codesKey = [...new Set(courses.map((course) => course.code.trim()).filter(Boolean))]
    .sort()
    .join("|");

  useEffect(() => {
    const codes = codesKey ? codesKey.split("|") : [];
    if (codes.length === 0) {
      setSeries({});
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    for (const code of codes) params.append("code", code);
    fetch(`/api/winter-averages?${params}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, CourseWinterSeries>) => {
        setSeries(data ?? {});
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoading(false);
      });
    return () => controller.abort();
  }, [codesKey]);

  const ranked = useMemo(() => rankCourses(courses, series), [courses, series]);
  const components = useMemo(() => componentGroups(courses), [courses]);
  const chartRows = ranked.map((row) => ({
    code: row.course.code,
    you: row.you,
    campus: row.campus,
    diff: row.diff,
  }));
  const targetValue = typeof target === "number" ? target : null;

  const frame = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close analysis"
        className="absolute inset-0 bg-[#142033]/45"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[min(88vh,52rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] border-2 border-[#142033] bg-[#f4f1ea] p-5 shadow-[6px_6px_0_#142033] sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#3d7a45]">Deep analysis</p>
            <h2 id={titleId} className="mt-1 text-3xl font-black tracking-tight">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Courses are ordered by your current percent. Campus numbers are the latest overall
              winter average from UBC Grades, not a cutoff and not a component mark. The graph
              also draws this box&apos;s target and the actual gap between you and campus.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {ranked.length === 0 ? (
          <p className="mt-6 rounded-2xl border-2 border-dashed border-[#142033] px-4 py-8 text-center text-sm font-medium text-[var(--muted)]">
            Add a course id and scores to analyse this box.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            <section className="rounded-[24px] border-2 border-[#142033] bg-white p-4 sm:p-5">
              <h3 className="text-lg font-black">Your scores, high to low</h3>
              <ol className="mt-3 space-y-2">
                {ranked.map((row, index) => {
                  const history = series[row.course.code]?.history ?? [];
                  return (
                  <li
                    key={row.course.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border-2 border-[#142033] bg-[#f4f1ea] px-3 py-2 text-sm font-bold"
                  >
                    <span>
                      <span className="mr-2 tabular-nums text-[var(--muted)]">{index + 1}.</span>
                      {row.course.code}
                    </span>
                    <span className="tabular-nums">
                      You {row.you === null ? "—" : `${round1(row.you)}%`}
                      <span className="ml-3 text-[var(--muted)]">
                        {loading
                          ? "campus…"
                          : row.campus === null
                            ? "no campus avg"
                            : `${row.session} ${round1(row.campus)}%`}
                      </span>
                      <span className={`ml-3 ${diffClass(row.diff)}`}>{formatDiff(row.diff)}</span>
                    </span>
                    {history.length > 1 ? (
                      <p className="w-full text-xs font-semibold text-[var(--muted)]">
                        Recent winters:{" "}
                        {history.map((hit) => `${hit.session} ${round1(hit.average)}%`).join(" · ")}
                      </p>
                    ) : null}
                  </li>
                  );
                })}
              </ol>
            </section>

            <section className="rounded-[24px] border-2 border-[#142033] bg-white p-4 sm:p-5">
              <h3 className="text-lg font-black">Difference from campus winter average</h3>
              <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                Same order as the list. Green is you, black is the latest campus winter overall, and
                the dashed line is this box&apos;s target. The number on each stem is you minus
                campus.
              </p>
              <ScoreCompareChart rows={chartRows} target={targetValue} targetLabel={targetLabel} />
            </section>

            <section className="rounded-[24px] border-2 border-[#142033] bg-white p-4 sm:p-5">
              <h3 className="text-lg font-black">Component averages</h3>
              <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                Mean of the scores you entered for each component name, including ones you created.
              </p>
              {components.length === 0 ? (
                <p className="mt-3 text-sm font-medium text-[var(--muted)]">
                  Add named components to see this breakdown.
                </p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {components.map((group) => (
                    <article
                      key={group.key}
                      className="rounded-2xl border-2 border-[#142033] bg-[#f4f1ea] p-3"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-black">
                          {group.name}
                          {group.custom ? (
                            <span className="ml-2 rounded-full border-2 border-[#142033] bg-white px-2 py-0.5 text-[10px] font-bold uppercase">
                              custom
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xl font-black tabular-nums">
                          {group.average === null ? "—" : `${round1(group.average)}%`}
                        </p>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs font-bold">
                        {group.rows.map((row) => (
                          <li key={row.id} className="flex justify-between gap-2">
                            <span className="truncate">{row.code || "Untitled course"}</span>
                            <span className="tabular-nums text-[var(--muted)]">
                              {row.score === null ? "—" : `${round1(row.score)}%`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <p className="text-xs leading-5 text-[var(--muted)]">
              Winter averages via{" "}
              <a className="font-semibold underline" href="https://ubcgrades.com/" target="_blank" rel="noreferrer">
                UBC Grades
              </a>
              . Unofficial, and a course overall is not the same as your syllabus weights.
              {ranked[0]?.session ? (
                <>
                  {" "}
                  Latest link example:{" "}
                  <a
                    className="font-semibold underline"
                    href={ubcGradesUrl(ranked[0].course.code, ranked[0].session ?? undefined)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {ranked[0].course.code}
                  </a>
                  .
                </>
              ) : null}
            </p>
          </div>
        )}
      </section>
    </div>
  );

  return createPortal(frame, document.body);
}

function rankCourses(
  courses: CalculatorCourse[],
  series: Record<string, CourseWinterSeries>,
): RankedCourse[] {
  return [...courses]
    .filter((course) => course.code.trim())
    .map((course) => {
      const you = componentPercent(course.components);
      const campusRow = series[course.code]?.latest ?? null;
      const campus = campusRow?.average ?? null;
      const diff = you === null || campus === null ? null : you - campus;
      return {
        course,
        you,
        campus,
        session: campusRow?.session ?? null,
        diff,
      };
    })
    .sort((a, b) => {
      if (a.you === null && b.you === null) return a.course.code.localeCompare(b.course.code);
      if (a.you === null) return 1;
      if (b.you === null) return -1;
      return b.you - a.you;
    });
}

function componentGroups(courses: CalculatorCourse[]): ComponentGroup[] {
  const groups = new Map<string, ComponentGroup>();
  for (const course of courses) {
    if (!course.code.trim()) continue;
    for (const row of course.components) {
      const name = row.name.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const current =
        groups.get(key) ??
        {
          key,
          name,
          custom: !PRESET_ORDER.some((preset) => preset.toLowerCase() === key),
          average: null,
          rows: [],
        };
      const score =
        row.score === "" || !Number.isFinite(Number(row.score)) ? null : Number(row.score);
      current.rows.push({
        id: `${course.id}-${row.id}`,
        code: course.code.trim() || "Untitled course",
        score,
      });
      groups.set(key, current);
    }
  }

  return [...groups.values()]
    .map((group) => {
      const scored = group.rows
        .map((row) => row.score)
        .filter((score): score is number => score !== null);
      return {
        ...group,
        average:
          scored.length === 0
            ? null
            : scored.reduce((sum, score) => sum + score, 0) / scored.length,
      };
    })
    .sort((a, b) => {
      const ai = PRESET_ORDER.findIndex((name) => name.toLowerCase() === a.key);
      const bi = PRESET_ORDER.findIndex((name) => name.toLowerCase() === b.key);
      const aOrder = ai === -1 ? PRESET_ORDER.length : ai;
      const bOrder = bi === -1 ? PRESET_ORDER.length : bi;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
}

function formatDiff(diff: number | null): string {
  if (diff === null) return "—";
  const n = round1(diff);
  if (n === 0) return "even";
  return n > 0 ? `+${n} vs campus` : `−${Math.abs(n)} vs campus`;
}

function diffClass(diff: number | null): string {
  if (diff === null) return "text-[var(--muted)]";
  const n = round1(diff);
  if (n > 0) return "text-[#2f6b38]";
  if (n < 0) return "text-[#b42318]";
  return "text-[var(--muted)]";
}

function ScoreCompareChart({
  rows,
  target,
  targetLabel,
}: {
  rows: { code: string; you: number | null; campus: number | null; diff: number | null }[];
  target: number | null;
  targetLabel: string;
}) {
  const plotted = rows.filter((row) => row.you !== null || row.campus !== null);
  if (plotted.length === 0) {
    return (
      <p className="mt-4 text-sm font-medium text-[var(--muted)]">
        Add scores to draw this comparison.
      </p>
    );
  }

  const width = 640;
  const height = 280;
  const padL = 42;
  const padR = 44;
  const padT = 22;
  const padB = 52;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const x = (index: number) =>
    plotted.length === 1 ? padL + innerW / 2 : padL + (index / (plotted.length - 1)) * innerW;
  const y = (value: number) => padT + (1 - Math.min(100, Math.max(0, value)) / 100) * innerH;

  const youLine = polyline(plotted.map((row, index) => (row.you === null ? null : [x(index), y(row.you)])));
  const campusLine = polyline(
    plotted.map((row, index) => (row.campus === null ? null : [x(index), y(row.campus)])),
  );

  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto min-w-full" role="img">
        <title>
          Your percent versus latest campus winter average
          {target !== null ? ` and ${targetLabel}` : ""}
        </title>
        {[0, 50, 80, 100].map((mark) => (
          <g key={mark}>
            <line
              x1={padL}
              x2={width - padR}
              y1={y(mark)}
              y2={y(mark)}
              stroke="#d9d3c7"
              strokeWidth="1"
            />
            <text x={8} y={y(mark) + 4} className="fill-[#5c6573] text-[11px] font-bold">
              {mark}
            </text>
          </g>
        ))}
        {target !== null ? (
          <g>
            <line
              x1={padL}
              x2={width - padR}
              y1={y(target)}
              y2={y(target)}
              stroke="#c9a227"
              strokeWidth="2.5"
              strokeDasharray="7 5"
            />
            <text
              x={width - padR}
              y={y(target) - 6}
              textAnchor="end"
              className="fill-[#8a7018] text-[11px] font-black"
            >
              {targetLabel} {round1(target)}%
            </text>
          </g>
        ) : null}
        {campusLine.map((points, index) => (
          <polyline
            key={`campus-${index}`}
            fill="none"
            stroke="#142033"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
        ))}
        {youLine.map((points, index) => (
          <polyline
            key={`you-${index}`}
            fill="none"
            stroke="#3d7a45"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
        ))}
        {plotted.map((row, index) => (
          <g key={`${row.code}-${index}`}>
            {row.you !== null && row.campus !== null ? (
              <>
                <line
                  x1={x(index)}
                  x2={x(index)}
                  y1={y(row.you)}
                  y2={y(row.campus)}
                  stroke={round1(row.you - row.campus) >= 0 ? "#2f6b38" : "#b42318"}
                  strokeWidth="2"
                />
                <text
                  x={index === plotted.length - 1 && plotted.length > 1 ? x(index) - 8 : x(index) + 8}
                  y={(y(row.you) + y(row.campus)) / 2 + 4}
                  textAnchor={
                    index === plotted.length - 1 && plotted.length > 1 ? "end" : "start"
                  }
                  className={`text-[11px] font-black ${
                    round1(row.you - row.campus) >= 0 ? "fill-[#2f6b38]" : "fill-[#b42318]"
                  }`}
                >
                  {formatChartGap(row.you - row.campus)}
                </text>
              </>
            ) : null}
            {row.campus !== null ? (
              <circle cx={x(index)} cy={y(row.campus)} r="4.5" fill="#142033" />
            ) : null}
            {row.you !== null ? (
              <circle cx={x(index)} cy={y(row.you)} r="4.5" fill="#3d7a45" />
            ) : null}
            <text
              x={x(index)}
              y={height - 16}
              textAnchor="middle"
              className="fill-[#142033] text-[11px] font-bold"
            >
              {row.code}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4 text-xs font-bold">
        <span className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-[#3d7a45]" />
          You
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-[#142033]" />
          Campus winter
        </span>
        {target !== null ? (
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 border-t-2 border-dashed border-[#c9a227]" />
            {targetLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function formatChartGap(diff: number): string {
  const n = round1(diff);
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

function polyline(points: ([number, number] | null)[]): string[] {
  const lines: string[] = [];
  let current: string[] = [];
  for (const point of points) {
    if (point === null) {
      if (current.length) {
        lines.push(current.join(" "));
        current = [];
      }
      continue;
    }
    current.push(`${point[0]},${point[1]}`);
  }
  if (current.length) lines.push(current.join(" "));
  return lines;
}
