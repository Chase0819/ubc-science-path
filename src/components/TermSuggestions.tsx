"use client";

import { useState } from "react";
import { AvgSticker } from "@/components/AvgSticker";
import { RequirementBrowse } from "@/components/RequirementBrowse";
import { courseByCode } from "@/lib/catalog";
import { COOP_BASELINE, COOP_DEADLINES, COOP_REQUIREMENTS, coopPlan } from "@/lib/coop";
import {
  BREADTH_CATEGORIES,
  CALENDAR_BREADTH,
  CALENDAR_LOWER_LEVEL,
  CALENDAR_SCIENCE_ARTS,
  LAB_COURSES,
} from "@/lib/degree-requirements";
import {
  COURSES_PER_TERM,
  suggestElectives,
  type Suggestion,
  type SuggestionKind,
} from "@/lib/electives";
import { termCredits } from "@/lib/term-plan";
import type { Specialization, TermPlan } from "@/lib/types";
import type { WinterAverage } from "@/lib/ubcgrades";
import type { BrowseKind } from "@/lib/browse-courses";

const KIND_STYLE: Record<SuggestionKind, string> = {
  coop: "bg-[#c62828] text-white",
  elective: "bg-[#d8ccf5]",
};

export function TermSuggestions({
  specId,
  specKind,
  planCodes,
  requiredRows,
  scienceOneOption,
  terms,
  ap,
  averages,
  onAdd,
  onRemove,
}: {
  specId: string;
  specKind: Specialization["kind"];
  planCodes: string[];
  requiredRows: { alternatives: string[][] }[];
  /** True where this specialization accepts Science One instead of the course list. */
  scienceOneOption: boolean;
  terms: TermPlan;
  ap: string[];
  averages: Record<string, WinterAverage | null>;
  onAdd: (code: string, term: "term1" | "term2") => void;
  onRemove: (code: string) => void;
}) {
  const [browse, setBrowse] = useState<BrowseKind | null>(null);
  const placed = [...terms.term1, ...terms.term2];
  const report = suggestElectives({
    specId,
    kind: specKind,
    placed,
    ap,
    planCodes,
    requiredRows,
    averages,
  });
  const combined = specKind === "combined-major" || specKind === "combined-honours";
  const coop = coopPlan(specId);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#8a7018]">The other seats</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">What else to take</h2>
        <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Most first-year students carry four or five courses a term, and the eligibility list
          rarely fills that. Arts credits, Science breadth, and the lab are for the B.Sc. as a
          whole — they do not have to be finished in first year, and you can take none of them this
          winter. Filling an empty seat with one is a good idea if the course looks doable. If you
          think it will drop your average, skip it. First-year grades matter for specialization
          admission, and that call is yours. Co-op, if you want it, is the exception: it has its
          own first-year timing.
        </p>
      </div>

      <div className="sticky top-0 z-30 -mx-1 bg-[var(--paper)]/95 px-1 py-3 shadow-[0_8px_16px_-8px_rgba(20,32,51,0.35)] backdrop-blur-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <TermLoadCard title="Term 1" codes={terms.term1} onRemove={onRemove} />
          <TermLoadCard title="Term 2" codes={terms.term2} onRemove={onRemove} />
        </div>
      </div>

      <div data-tutorial="extras" className="grid gap-4 scroll-mt-40 lg:grid-cols-3">
        <RequirementCard
          title="Arts credits"
          value={`${report.arts.have} of ${report.arts.need}`}
          done={report.arts.have >= report.arts.need}
          href={CALENDAR_SCIENCE_ARTS}
          browseLabel="Search Arts courses"
          onBrowse={() => setBrowse("arts")}
        >
          <p>
            Every B.Sc. needs 12 credits from the Faculty of Arts before you graduate. Writing
            courses you use for the Communication Requirement — SCIE 113, WRDS 150, an ENGL course —
            do not count twice. Physical geography (GEOS) and science-numbered PSYC do not count.
          </p>
          <p className="mt-2">
            You do not have to start this year. One Arts course now is a recommendation, not a
            requirement — skip it if you would rather protect your average.
          </p>
        </RequirementCard>

        <RequirementCard
          title="Science breadth"
          value={`${report.breadth.covered.length} of ${report.breadth.target} areas`}
          done={report.breadth.satisfied}
          href={CALENDAR_BREADTH}
          browseLabel="Search breadth courses"
          onBrowse={() => setBrowse("breadth")}
        >
          <p>
            {combined
              ? "Combined specializations need 3 credits in 5 of these 7 areas before you graduate."
              : "Majors and honours need 3 credits in 6 of these 7 areas before you graduate."}{" "}
            Any level counts, and the courses your major already requires count. Extra areas in
            first year are optional.
          </p>
          {report.breadth.satisfied ? null : (
            <p className="mt-2 font-semibold">
              {report.breadth.shortBy} more{" "}
              {report.breadth.shortBy === 1 ? "area" : "areas"} still open for later years — not a
              first-year deadline.
            </p>
          )}
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
            {BREADTH_CATEGORIES.map((category) => {
              const apCredit = report.apCovered.includes(category.id);
              return (
                <li key={category.id} className="inline-flex items-center gap-1.5">
                  <BreadthChip
                    label={category.short}
                    covered={report.breadth.covered.includes(category.id)}
                  />
                  {apCredit ? (
                    <span className="text-xs font-bold text-emerald-800">AP credit</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {scienceOneOption ? (
            <p className="mt-3">
              In Science One? SCIE 001 alone is credited with Mathematics, Chemistry, Physics, and
              Life Science.
            </p>
          ) : null}
        </RequirementCard>

        <RequirementCard
          title="Lab requirement"
          value={report.lab.satisfied ? "Covered" : "Not yet"}
          done={report.lab.satisfied}
          href={CALENDAR_LOWER_LEVEL}
          browseLabel="See the lab list"
          onBrowse={() => setBrowse("lab")}
        >
          <p>
            One course from the Faculty’s lab list before you graduate, so you handle real data at
            least once: {LAB_COURSES.slice(0, 6).join(", ")}, and a few others. It does not have to
            be first year.
          </p>
          {report.lab.satisfied ? (
            <p className="mt-2 font-semibold text-emerald-800">
              A course already in your plan is on that list.
            </p>
          ) : null}
        </RequirementCard>
      </div>

      <div data-tutorial="coop" className="scroll-mt-40 rounded-[28px] border-2 border-[#142033] bg-[#fff1a8] p-5 shadow-[4px_4px_0_#142033]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold">Thinking about Co-op?</h3>
          <div className="flex flex-wrap gap-2">
            <a
              href={COOP_REQUIREMENTS}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-semibold shadow-[2px_2px_0_#142033]"
            >
              Application rules ↗
            </a>
            <a
              href={COOP_DEADLINES}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-semibold shadow-[2px_2px_0_#142033]"
            >
              Deadlines ↗
            </a>
          </div>
        </div>
        <p className="mt-3 text-base leading-7">
          <span className="font-bold">{coop.program}</span> — apply in {coop.applyIn}.
        </p>
        <p className="mt-2 text-base leading-7">{coop.firstYear}</p>
        {coop.addCourses && coop.addCourses.length > 0 ? (
          <p className="mt-2 text-base leading-7">
            Extra course to line up:{" "}
            <span className="font-bold">{coop.addCourses.join(", ")}</span>.
          </p>
        ) : null}
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#5b4a12]">
          {COOP_BASELINE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div data-tutorial="recommended" className="scroll-mt-40">
        <h3 className="text-xl font-bold">Suggested courses for the empty seats</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Co-op prep stays on this list when this major has a first-year deadline. The rest are
          walk-in electives with no university course first — Nursing, Forestry, and similar —
          ranked by last winter’s class average. Arts, Science breadth, and the lab live in the
          boxes above; they are not on this list. Take one if it fits and you expect to do well. If
          the average looks like it will drag yours down, leave the seat empty.
        </p>
        {report.suggestions.length === 0 ? (
          <p className="mt-2 rounded-[24px] border-2 border-dashed border-[#142033] bg-[#f4f1ea] px-5 py-4 text-base leading-7">
            Nothing extra on this list right now — either these electives are already in your plan,
            or Co-op is the only timed add. Arts, Science breadth, and the lab stay in the boxes
            above.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {report.suggestions.map((suggestion) => (
              <li key={suggestion.code}>
                <SuggestionCard
                  suggestion={suggestion}
                  avg={averages[suggestion.code]}
                  onAdd={onAdd}
                />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Suggestions, not a schedule. Seats, prerequisites, and terms change — check the course in
          Workday and the Calendar before you register, and talk to Science Advising if a
          requirement is close.
        </p>
      </div>

      {browse ? (
        <RequirementBrowse
          kind={browse}
          open
          terms={terms}
          averages={averages}
          onAdd={onAdd}
          onRemove={onRemove}
          onClose={() => setBrowse(null)}
        />
      ) : null}
    </section>
  );
}

function TermLoadCard({
  title,
  codes,
  onRemove,
}: {
  title: string;
  codes: string[];
  onRemove: (code: string) => void;
}) {
  const credits = termCredits(codes);
  const seats = COURSES_PER_TERM - codes.length;
  const message =
    codes.length === 0
      ? "Nothing placed yet."
      : seats > 0
        ? `Room for ${seats} more ${seats === 1 ? "course" : "courses"}.`
        : "That is a full load.";
  return (
    <div className="rounded-[24px] border-2 border-[#142033] bg-white px-5 py-4 shadow-[3px_3px_0_#142033]">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-lg font-black">{title}</p>
        <p className="text-sm font-bold tabular-nums">
          {codes.length} {codes.length === 1 ? "course" : "courses"} · {credits} cr
        </p>
      </div>
      <p className="mt-1 text-sm font-medium text-[var(--muted)]">{message}</p>
      {codes.length > 0 ? (
        <ul className="mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
          {codes.map((code) => (
            <li
              key={code}
              className="inline-flex max-w-full items-center gap-1 rounded-full border-2 border-[#142033] bg-[#f4f1ea] py-0.5 pl-2.5 pr-1"
            >
              <span className="truncate text-xs font-bold">{code}</span>
              <button
                type="button"
                onClick={() => onRemove(code)}
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold hover:bg-white"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function RequirementCard({
  title,
  value,
  done,
  href,
  browseLabel,
  onBrowse,
  children,
}: {
  title: string;
  value: string;
  done: boolean;
  href: string;
  browseLabel: string;
  onBrowse: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold">{title}</h3>
        <span
          className={`shrink-0 rounded-full border-2 border-[#142033] px-3 py-1 text-sm font-bold ${
            done ? "bg-[#c5e8c4]" : "bg-[#fff1a8]"
          }`}
        >
          {value}
        </span>
      </div>
      <div className="mt-3 text-sm leading-6 text-[var(--muted)]">{children}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBrowse}
          className="rounded-full border-2 border-[#142033] bg-[#f2d45c] px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
        >
          {browseLabel}
        </button>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold underline"
        >
          Calendar rule ↗
        </a>
      </div>
    </div>
  );
}

function BreadthChip({ label, covered }: { label: string; covered: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-bold ${
        covered
          ? "border-[#142033] bg-[#c5e8c4] text-[#142033]"
          : "border-dashed border-[#8a8578] bg-white text-[var(--muted)]"
      }`}
    >
      {covered ? "✓" : "○"} {label}
    </span>
  );
}

function SuggestionCard({
  suggestion,
  avg,
  onAdd,
}: {
  suggestion: Suggestion;
  avg: WinterAverage | null | undefined;
  onAdd: (code: string, term: "term1" | "term2") => void;
}) {
  const course = courseByCode(suggestion.code);
  const credits = course?.credits ?? 3;
  return (
    <div className="rounded-[24px] border-2 border-[#142033] bg-white p-4 shadow-[3px_3px_0_#142033] sm:p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-2xl font-black tracking-tight">{suggestion.code}</p>
            <span
              className={`rounded-full border-2 border-[#142033] px-3 py-0.5 text-xs font-bold ${
                KIND_STYLE[suggestion.kind]
              }`}
            >
              {suggestion.reason}
            </span>
          </div>
          <p className="mt-1 text-lg font-medium leading-snug">{course?.title ?? "UBC course"}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
            {credits} {credits === 1 ? "credit" : "credits"}
            {suggestion.term === "term1"
              ? " · usually Term 1"
              : suggestion.term === "term2"
                ? " · usually Term 2"
                : " · either term"}
          </p>
          <p className="mt-2 text-base leading-7">{suggestion.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAdd(suggestion.code, "term1")}
              className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
            >
              + Term 1
            </button>
            <button
              type="button"
              onClick={() => onAdd(suggestion.code, "term2")}
              className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
            >
              + Term 2
            </button>
          </div>
        </div>
        <AvgSticker code={suggestion.code} avg={avg} />
      </div>
    </div>
  );
}
