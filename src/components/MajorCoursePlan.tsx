"use client";

import { useEffect, useState } from "react";
import { coursesCoveredByExams, examCovering } from "@/lib/ap-credit";
import { courseByCode } from "@/lib/catalog";
import {
  alternativeCovered,
  COMMS_CALENDAR,
  rowCovered,
  type FirstYearPlan,
  type FirstYearRow,
} from "@/lib/first-year-plans";
import { loadApExams, saveApExams } from "@/lib/storage";
import type { WinterAverage } from "@/lib/ubcgrades";
import { AvgSticker } from "@/components/AvgSticker";
import { YearPlanner } from "@/components/YearPlanner";
import type { Specialization } from "@/lib/types";

type Averages = Record<string, WinterAverage | null>;

export function MajorCoursePlan({
  specId,
  specKind,
  plan,
  scienceOne,
  averages,
}: {
  specId: string;
  specKind: Specialization["kind"];
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
            title={plan.calendarLabel}
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
            .filter((row) => row.kind === "courses" || row.kind === "text")
            .map((row, index) =>
              row.kind === "text" ? (
                <CommunicationBlock
                  key={`${row.label}-${index}`}
                  row={row}
                  averages={averages}
                  step={index + 1}
                />
              ) : (
                <CourseBlock
                  key={`${row.display}-${index}`}
                  row={row}
                  averages={averages}
                  covered={covered}
                  examIds={hydrated ? exams : []}
                  step={index + 1}
                />
              ),
            )}
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

      <YearPlanner
        specId={specId}
        specKind={specKind}
        plan={plan}
        scienceOne={scienceOne}
        exams={exams}
        averages={averages}
        onToggleExam={toggleExam}
      />
    </div>
  );
}

function CommunicationBlock({
  row,
  averages,
  step,
}: {
  row: Extract<FirstYearRow, { kind: "text" }>;
  averages: Averages;
  step: number;
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#142033] text-sm font-bold text-[#f2d45c]">
          {step}
        </span>
        <div>
          <p className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
            Second writing course
            {row.note ? <sup className="ml-1 text-sm font-semibold"> {row.note}</sup> : null}
          </p>
          <p className="text-sm font-medium text-[var(--muted)]">{row.credits} credits · required</p>
        </div>
      </div>
      <div className="rounded-[28px] border-2 border-[#142033] bg-[#fff8d6] p-4 shadow-[4px_4px_0_#142033] sm:p-5">
        <p className="text-lg font-black tracking-tight">SCIE 113 is not enough on its own.</p>
        <p className="mt-2 text-base leading-7">
          Faculty of Science wants two communication courses: SCIE 113 plus 3 more writing credits.
          Most first-year students take{" "}
          <span className="font-bold">WRDS 150</span>. ENGL 110 or 111 also work. Chemistry can wait
          for CHEM 300; Combined Major in Science uses SCIE 300 later; Environmental Sciences can
          use ENVR 200.
        </p>
        <a
          href={COMMS_CALENDAR}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
        >
          Official writing-course list ↗
        </a>
      </div>
      <div className="mt-3">
        <OptionCard alt={["WRDS 150"]} averages={averages} done={false} />
      </div>
    </div>
  );
}

function ExtrasBar({ rows }: { rows: FirstYearRow[] }) {
  const bits = rows.map((row) => {
    if (row.kind === "text") return null;
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
