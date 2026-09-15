"use client";

import { useEffect, useMemo, useState } from "react";
import { coursesCoveredByExams, relevantApExams } from "@/lib/ap-credit";
import { courseByCode } from "@/lib/catalog";
import type { FirstYearPlan } from "@/lib/first-year-plans";
import { loadTermPlan, saveTermPlan } from "@/lib/storage";
import {
  benchGroups,
  courseRows,
  moveCourse,
  placedSet,
  planProgress,
  suggestedTerm,
  termCredits,
  type TermId,
} from "@/lib/term-plan";
import { OverloadNotice } from "@/components/OverloadNotice";
import { TermSuggestions } from "@/components/TermSuggestions";
import { COURSES_PER_TERM } from "@/lib/electives";
import type { Specialization, TermPlan } from "@/lib/types";
import type { WinterAverage } from "@/lib/ubcgrades";

export function YearPlanner({
  specId,
  specKind,
  plan,
  scienceOne,
  exams,
  averages,
  onToggleExam,
}: {
  specId: string;
  specKind: Specialization["kind"];
  plan: FirstYearPlan;
  scienceOne: boolean;
  exams: string[];
  averages: Record<string, WinterAverage | null>;
  onToggleExam: (id: string) => void;
}) {
  const [terms, setTerms] = useState<TermPlan>({ term1: [], term2: [] });
  const [hydrated, setHydrated] = useState(false);
  const [over, setOver] = useState<TermId | null>(null);
  const [overload, setOverload] = useState<{ term: TermId; count: number } | null>(null);

  const rows = useMemo(() => courseRows(plan), [plan]);
  const pageCodes = useMemo(
    () => [...new Set(rows.flatMap((row) => row.alternatives.flat()))],
    [rows],
  );
  const apOptions = relevantApExams(pageCodes);
  const ap = coursesCoveredByExams(exams);
  const placed = placedSet(terms);
  const progress = planProgress(rows, placed, ap);
  const groups = benchGroups(rows, placed, ap);
  const leftover = progress.total - progress.done;
  const apKey = exams.slice().sort().join(",");
  /** Suggested electives are not part of the required list, so removing them drops them for good. */
  const isExtra = (code: string) => !pageCodes.includes(code);

  useEffect(() => {
    setTerms(loadTermPlan(specId));
    setHydrated(true);
  }, [specId]);

  useEffect(() => {
    if (!hydrated) return;
    setTerms((current) => {
      const covered = coursesCoveredByExams(exams);
      const next = {
        term1: current.term1.filter((code) => !covered.has(code)),
        term2: current.term2.filter((code) => !covered.has(code)),
      };
      if (
        next.term1.length === current.term1.length &&
        next.term2.length === current.term2.length
      ) {
        return current;
      }
      saveTermPlan(specId, next);
      return next;
    });
  }, [apKey, exams, hydrated, specId]);

  function persist(next: TermPlan) {
    setTerms(next);
    saveTermPlan(specId, next);
  }

  function send(code: string, dest: TermId) {
    const next = moveCourse(terms, code, dest);
    persist(next);
    if (
      dest !== "bench" &&
      !terms[dest].includes(code) &&
      next[dest].length > COURSES_PER_TERM
    ) {
      setOverload({ term: dest, count: next[dest].length });
    }
  }

  function onDrop(dest: TermId, event: React.DragEvent) {
    event.preventDefault();
    setOver(null);
    const code = event.dataTransfer.getData("text/plain");
    if (code) send(code, dest);
  }

  return (
    <section className="space-y-6">
      <div data-tutorial="ap" className="scroll-mt-8 space-y-6">
        <div>
          <p className="text-sm font-semibold text-[#8a7018]">Your winter</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Build Term 1 and Term 2</h2>
          <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Drag a course into a term — or tap Term 1 / Term 2. AP credit counts as already done, so
            those courses do not need a seat.
          </p>
        </div>

      {apOptions.length > 0 && (
        <div>
          <p className="text-base font-bold">AP credit (score 4+)</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {apOptions.map((exam) => {
              const on = exams.includes(exam.id);
              return (
                <li key={exam.id}>
                  <button
                    type="button"
                    onClick={() => onToggleExam(exam.id)}
                    className={`rounded-full border-2 px-4 py-2 text-left text-sm font-semibold shadow-[3px_3px_0_#142033] ${
                      on ? "border-[#142033] bg-[#f2d45c]" : "border-[#142033] bg-white hover:bg-[#fff6c8]"
                    }`}
                  >
                    {exam.name}
                    <span className="mt-0.5 block text-xs font-normal leading-4 text-[var(--muted)]">
                      {exam.detail}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <p className="text-lg font-bold">
            {progress.percent}% of required groups are in the plan
          </p>
          <p className="text-sm font-semibold text-[var(--muted)]">
            {leftover === 0
              ? "You covered every required group."
              : leftover === 1
                ? "1 group still needs a course."
                : `${leftover} groups still need a course.`}
          </p>
        </div>
        <div className="h-5 overflow-hidden rounded-full border-2 border-[#142033] bg-white">
          <div
            className="h-full bg-[#7dcf7a] transition-[width] duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {progress.done} of {progress.total} groups filled
          {ap.size > 0 ? " (including AP)" : ""}. Pick one option in an “or” group.
        </p>
      </div>

      <div data-tutorial="place" className="scroll-mt-8 space-y-4">
      <DropZone
        id="bench"
        title="Still to place"
        hint="Grouped the way the Calendar lists them. Pick one option in an “or” group — you do not take every course here."
        active={over === "bench"}
        onDragOver={() => setOver("bench")}
        onDragLeave={() => setOver(null)}
        onDrop={(event) => onDrop("bench", event)}
      >
        {groups.length === 0 ? (
          <p className="text-sm font-medium text-[var(--muted)]">
            Nothing waiting — every required group is covered or already in a term.
          </p>
        ) : (
          <div>
            {groups.map((group, index) => {
              const singles = group.alternatives
                .filter((alt) => alt.length === 1)
                .map((alt) => alt[0]);
              const bundles = group.alternatives.filter((alt) => alt.length > 1);
              return (
                <div
                  key={`${group.display}-${index}`}
                  className={index === 0 ? "" : "mt-4 border-t-2 border-[#142033] pt-4"}
                >
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-bold leading-5">{group.display}</p>
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      {group.credits} cr · {group.pickOne ? "pick one option" : "take this"}
                    </p>
                  </div>
                  {singles.length > 0 ? (
                    <ul className="flex flex-wrap gap-3">
                      {singles.map((code) => (
                        <li key={code}>
                          <CourseChip
                            code={code}
                            hint={suggestedTerm(code) === "term1" ? "usually T1" : "usually T2"}
                            onTerm1={() => send(code, "term1")}
                            onTerm2={() => send(code, "term2")}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {bundles.map((alt) => (
                    <div key={alt.join("-")} className={singles.length > 0 ? "mt-2" : ""}>
                      {singles.length > 0 || bundles[0] !== alt ? (
                        <p className="mb-2 text-xs font-black uppercase tracking-wide text-[var(--muted)]">
                          or
                        </p>
                      ) : null}
                      <ul className="flex flex-wrap gap-3">
                        {alt.map((code) => (
                          <li key={code}>
                            <CourseChip
                              code={code}
                              hint={suggestedTerm(code) === "term1" ? "usually T1" : "usually T2"}
                              onTerm1={() => send(code, "term1")}
                              onTerm2={() => send(code, "term2")}
                            />
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                        Take both — this is one Calendar option.
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </DropZone>

      <div data-tutorial="terms" className="grid gap-4 scroll-mt-8 lg:grid-cols-2">
        <TermColumn
          id="term1"
          title="Term 1"
          season="Sep – Dec"
          codes={terms.term1}
          active={over === "term1"}
          onDragOver={() => setOver("term1")}
          onDragLeave={() => setOver(null)}
          onDrop={(event) => onDrop("term1", event)}
          onToTerm2={(code) => send(code, "term2")}
          onRemove={(code) => send(code, "bench")}
          isExtra={isExtra}
        />
        <TermColumn
          id="term2"
          title="Term 2"
          season="Jan – Apr"
          codes={terms.term2}
          active={over === "term2"}
          onDragOver={() => setOver("term2")}
          onDragLeave={() => setOver(null)}
          onDrop={(event) => onDrop("term2", event)}
          onToTerm1={(code) => send(code, "term1")}
          onRemove={(code) => send(code, "bench")}
          isExtra={isExtra}
        />
      </div>
      </div>

      <TermSuggestions
        specId={specId}
        specKind={specKind}
        planCodes={pageCodes}
        requiredRows={rows}
        scienceOneOption={scienceOne}
        terms={terms}
        ap={[...ap]}
        averages={averages}
        onAdd={send}
        onRemove={(code) => send(code, "bench")}
      />

      {overload ? (
        <OverloadNotice
          term={overload.term}
          count={overload.count}
          onClose={() => setOverload(null)}
        />
      ) : null}
    </section>
  );
}

function DropZone({
  id,
  title,
  hint,
  active,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  active: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      data-zone={id}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onDragLeave();
      }}
      onDrop={onDrop}
      className={`min-h-[7rem] rounded-[28px] border-2 border-dashed p-4 transition ${
        active ? "border-[#142033] bg-[#fff1a8]" : "border-[#142033] bg-[#f4f1ea]"
      }`}
    >
      <p className="font-bold">{title}</p>
      {hint ? <p className="mb-3 text-sm text-[var(--muted)]">{hint}</p> : null}
      {children}
    </div>
  );
}

function TermColumn({
  id,
  title,
  season,
  codes,
  active,
  onDragOver,
  onDragLeave,
  onDrop,
  onToTerm1,
  onToTerm2,
  onRemove,
  isExtra,
}: {
  id: TermId;
  title: string;
  season: string;
  codes: string[];
  active: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onToTerm1?: (code: string) => void;
  onToTerm2?: (code: string) => void;
  onRemove: (code: string) => void;
  isExtra?: (code: string) => boolean;
}) {
  const credits = termCredits(codes);
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onDragLeave();
      }}
      onDrop={onDrop}
      className={`rounded-[28px] border-2 border-[#142033] p-4 shadow-[4px_4px_0_#142033] ${
        active ? "bg-[#fff1a8]" : "bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-2xl font-black">{title}</p>
          <p className="text-sm font-medium text-[var(--muted)]">{season}</p>
        </div>
        <p className={`text-sm font-bold ${credits > 16 ? "text-[#c62828]" : ""}`}>
          {credits} cr
        </p>
      </div>
      <ul className="mt-4 min-h-[10rem] space-y-3">
        {codes.length === 0 ? (
          <li className="rounded-2xl border-2 border-dashed border-[#142033] px-3 py-8 text-center text-sm font-medium text-[var(--muted)]">
            Drop courses here
          </li>
        ) : (
          codes.map((code) => (
            <li key={code}>
              <CourseChip
                code={code}
                inTerm={id}
                extra={isExtra?.(code) ?? false}
                onTerm1={id === "term2" ? onToTerm1 : undefined}
                onTerm2={id === "term1" ? onToTerm2 : undefined}
                onRemove={() => onRemove(code)}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function CourseChip({
  code,
  hint,
  inTerm,
  extra,
  onTerm1,
  onTerm2,
  onRemove,
}: {
  code: string;
  hint?: string;
  inTerm?: TermId;
  extra?: boolean;
  onTerm1?: (code: string) => void;
  onTerm2?: (code: string) => void;
  onRemove?: () => void;
}) {
  const course = courseByCode(code);
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", code);
        event.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab rounded-2xl border-2 border-[#142033] bg-white px-3 py-3 shadow-[3px_3px_0_#142033] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-black leading-none">{code}</p>
          <p className="mt-1 text-sm font-medium leading-5">{course?.title ?? "UBC course"}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            {course?.credits ?? 3} cr{hint ? ` · ${hint}` : ""}
          </p>
        </div>
        {extra ? (
          <span className="shrink-0 rounded-full border-2 border-[#142033] bg-[#f2d45c] px-2 py-0.5 text-[10px] font-bold uppercase">
            added
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {onTerm1 && (
          <button
            type="button"
            className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-3 py-1 text-xs font-bold"
            onClick={() => onTerm1(code)}
          >
            Term 1
          </button>
        )}
        {onTerm2 && (
          <button
            type="button"
            className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-3 py-1 text-xs font-bold"
            onClick={() => onTerm2(code)}
          >
            Term 2
          </button>
        )}
        {onRemove && inTerm && (
          <button
            type="button"
            className="rounded-full border-2 border-[#142033] bg-white px-3 py-1 text-xs font-bold"
            onClick={onRemove}
          >
            {extra ? "Remove" : "Back"}
          </button>
        )}
      </div>
    </div>
  );
}
