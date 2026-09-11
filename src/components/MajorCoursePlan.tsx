"use client";

import { useEffect, useState } from "react";
import { coursesCoveredByExams, examCovering } from "@/lib/ap-credit";
import { courseByCode } from "@/lib/catalog";
import {
  alternativeCovered,
  rowCovered,
  type FirstYearPlan,
  type FirstYearRow,
} from "@/lib/first-year-plans";
import { round1 } from "@/lib/grades";
import { loadApExams, saveApExams } from "@/lib/storage";
import { ubcGradesUrl, type WinterAverage } from "@/lib/ubcgrades";
import { YearPlanner } from "@/components/YearPlanner";

type Averages = Record<string, WinterAverage | null>;

export function MajorCoursePlan({
  specId,
  plan,
  scienceOne,
  averages,
}: {
  specId: string;
  plan: FirstYearPlan;
  scienceOne: boolean;
  averages: Averages;
}) {
  const [exams, setExams] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setExams(loadApExams());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveApExams(exams);
  }, [exams, hydrated]);

  const covered = coursesCoveredByExams(hydrated ? exams : []);
  const extras = plan.rows.filter((row) => row.kind !== "courses");

  function toggleExam(id: string) {
    setExams((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  return (
    <div className="space-y-10">
      {scienceOne && (
        <div className="rounded-[28px] border-2 border-[#142033] bg-[#fff1a8] px-5 py-4 shadow-[4px_4px_0_#142033]">
          <p className="text-lg font-bold">In Science One?</p>
          <p className="mt-1 text-base leading-7">
            SCIE 001 already covers eligibility. Skip the list below unless you left that stream.
          </p>
        </div>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#8a7018]">Your year one</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">What to take</h2>
          </div>
          <a
            href={plan.calendarUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-semibold shadow-[2px_2px_0_#142033]"
          >
            Official Calendar ↗
          </a>
        </div>
        <p className="mt-2 text-base font-medium">{plan.heading}</p>
        {plan.intro ? (
          <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--muted)]">{plan.intro}</p>
        ) : null}

        <div className="mt-8 space-y-8">
          {plan.rows
            .filter((row) => row.kind === "courses")
            .map((row, index) => (
              <CourseBlock
                key={`${row.display}-${index}`}
                row={row}
                averages={averages}
                covered={covered}
                examIds={hydrated ? exams : []}
                step={index + 1}
              />
            ))}
        </div>

        <ExtrasBar rows={extras} />

        {plan.notes.length > 0 && (
          <details className="mt-8 rounded-[24px] border-2 border-[#142033] bg-white px-5 py-4">
            <summary className="cursor-pointer text-base font-bold">The small print</summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--muted)]">
              {plan.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ol>
          </details>
        )}

        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Class averages are UBC Vancouver overall from{" "}
          <a href="https://ubcgrades.com/" className="font-semibold text-[var(--ink)] underline">
            UBC Grades
          </a>
          , latest winter on file — not admission cutoffs.
        </p>
      </section>

      <YearPlanner specId={specId} plan={plan} exams={exams} onToggleExam={toggleExam} />
    </div>
  );
}

function ExtrasBar({ rows }: { rows: FirstYearRow[] }) {
  const bits = rows.map((row) => {
    if (row.kind === "text") return `${row.credits} cr · ${row.label}`;
    if (row.kind === "electives") return `${row.credits} cr electives`;
    if (row.kind === "total") return `${row.credits} credits total`;
    return null;
  });
  if (!bits.some(Boolean)) return null;
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {bits.filter(Boolean).map((bit) => (
        <span
          key={bit}
          className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-4 py-2 text-sm font-semibold"
        >
          {bit}
        </span>
      ))}
    </div>
  );
}

function CourseBlock({
  row,
  averages,
  covered,
  examIds,
  step,
}: {
  row: Extract<FirstYearRow, { kind: "courses" }>;
  averages: Averages;
  covered: Set<string>;
  examIds: string[];
  step: number;
}) {
  const skipped = rowCovered(row, covered);
  const covering = row.alternatives
    .flat()
    .map((code) => examCovering(code, examIds))
    .find(Boolean);
  const pickOne = row.alternatives.length > 1;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#142033] text-sm font-bold text-[#f2d45c]">
          {step}
        </span>
        <div>
          <p className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
            {row.display}
            {row.note ? <sup className="ml-1 text-sm font-semibold"> {row.note}</sup> : null}
          </p>
          <p className="text-sm font-medium text-[var(--muted)]">
            {row.credits} credits
            {pickOne ? " · pick one option" : " · take this"}
          </p>
        </div>
        {skipped && covering ? (
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white">
            Skip — {covering.name}
          </span>
        ) : null}
      </div>

      <div className="space-y-3">
        {row.alternatives.map((alt, i) => (
          <div key={alt.join("+")}>
            {i > 0 && (
              <p className="my-2 text-center text-sm font-black tracking-[0.35em] text-[#c4a35a]">
                OR
              </p>
            )}
            <OptionCard alt={alt} averages={averages} done={alternativeCovered(alt, covered)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionCard({
  alt,
  averages,
  done,
}: {
  alt: string[];
  averages: Averages;
  done: boolean;
}) {
  return (
    <div
      className={`space-y-4 rounded-[28px] border-2 border-[#142033] p-4 shadow-[4px_4px_0_#142033] sm:p-5 ${
        done ? "bg-emerald-50" : "bg-white"
      }`}
    >
      {alt.map((code) => {
        const course = courseByCode(code);
        const avg = averages[code];
        return (
          <div key={code} className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-black tracking-tight sm:text-3xl">{code}</p>
              <p className="mt-1 text-lg leading-snug font-medium">
                {course?.title ?? "UBC course"}
              </p>
              {course?.blurb ? (
                <p className="mt-2 text-base leading-7 text-[var(--muted)]">{course.blurb}</p>
              ) : null}
              {done ? (
                <p className="mt-2 text-sm font-bold text-emerald-800">Covered by your AP credit</p>
              ) : null}
            </div>
            <AvgSticker code={code} avg={avg} />
          </div>
        );
      })}
    </div>
  );
}

function AvgSticker({
  code,
  avg,
}: {
  code: string;
  avg: WinterAverage | null | undefined;
}) {
  if (!avg) {
    return (
      <div className="flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#142033] bg-[#f4f1ea] text-center">
        <span className="text-xs font-bold leading-4 text-[var(--muted)]">no avg yet</span>
      </div>
    );
  }
  return (
    <a
      href={ubcGradesUrl(code)}
      target="_blank"
      rel="noreferrer"
      className="flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-[#142033] bg-[#f2d45c] text-[var(--ink)] shadow-[3px_3px_0_#142033] sm:h-20 sm:w-20"
      title={`${avg.session} overall class average`}
    >
      <span className="text-lg font-black leading-none tabular-nums sm:text-xl">
        {round1(avg.average).toFixed(1)}
      </span>
      <span className="mt-1 text-[10px] font-bold leading-none">%</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">
        {avg.session}
      </span>
    </a>
  );
}
