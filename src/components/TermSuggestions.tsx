"use client";

import {
  BREADTH_CATEGORIES,
  CALENDAR_BREADTH,
  CALENDAR_LOWER_LEVEL,
  CALENDAR_SCIENCE_ARTS,
  LAB_COURSES,
} from "@/lib/degree-requirements";
import { COURSES_PER_TERM, suggestElectives } from "@/lib/electives";
import { termCredits } from "@/lib/term-plan";
import type { Specialization, TermPlan } from "@/lib/types";

export function TermSuggestions({
  specId,
  specKind,
  planCodes,
  requiredRows,
  scienceOneOption,
  terms,
  ap,
}: {
  specId: string;
  specKind: Specialization["kind"];
  planCodes: string[];
  requiredRows: { alternatives: string[][] }[];
  /** True where this specialization accepts Science One instead of the course list. */
  scienceOneOption: boolean;
  terms: TermPlan;
  ap: string[];
}) {
  const placed = [...terms.term1, ...terms.term2];
  const report = suggestElectives({
    specId,
    kind: specKind,
    placed,
    ap,
    planCodes,
    requiredRows,
  });
  const combined = specKind === "combined-major" || specKind === "combined-honours";

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#8a7018]">The other seats</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight">What else to take</h2>
        <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Most first-year students carry four or five courses a term. Your eligibility list rarely
          fills that, and the leftover seats are not free — the B.Sc. also wants Arts credits,
          Science breadth, and a lab.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TermLoadCard title="Term 1" codes={terms.term1} />
        <TermLoadCard title="Term 2" codes={terms.term2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RequirementCard
          title="Arts credits"
          value={`${report.arts.have} of ${report.arts.need}`}
          done={report.arts.have >= report.arts.need}
          href={CALENDAR_SCIENCE_ARTS}
        >
          <p>
            Every B.Sc. needs 12 credits from the Faculty of Arts. Writing courses you use for the
            Communication Requirement — SCIE 113, WRDS 150, an ENGL course — do not count twice.
          </p>
          <p className="mt-2">
            Three or six credits in first year keeps it from piling up in fourth year.
          </p>
        </RequirementCard>

        <RequirementCard
          title="Science breadth"
          value={`${report.breadth.covered.length} of ${report.breadth.target} areas`}
          done={report.breadth.satisfied}
          href={CALENDAR_BREADTH}
        >
          <p>
            {combined
              ? "Combined specializations need 3 credits in 5 of these 7 areas."
              : "Majors and honours need 3 credits in 6 of these 7 areas."}{" "}
            Any level counts, and the courses your major already requires count.
          </p>
          {report.breadth.satisfied ? null : (
            <p className="mt-2 font-semibold">
              {report.breadth.shortBy} more{" "}
              {report.breadth.shortBy === 1 ? "area" : "areas"} to open before you graduate — one or
              two a year is a normal pace.
            </p>
          )}
          <ul className="mt-3 flex flex-wrap gap-2">
            {BREADTH_CATEGORIES.map((category) => (
              <li key={category.id}>
                <BreadthChip
                  label={category.short}
                  covered={report.breadth.covered.includes(category.id)}
                />
              </li>
            ))}
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
        >
          <p>
            One course from the Faculty’s lab list, so you handle real data at least once:{" "}
            {LAB_COURSES.slice(0, 6).join(", ")}, and a few others.
          </p>
          {report.lab.satisfied ? (
            <p className="mt-2 font-semibold text-emerald-800">
              A course already in your plan is on that list.
            </p>
          ) : null}
        </RequirementCard>
      </div>
    </section>
  );
}

function TermLoadCard({ title, codes }: { title: string; codes: string[] }) {
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
    </div>
  );
}

function RequirementCard({
  title,
  value,
  done,
  href,
  children,
}: {
  title: string;
  value: string;
  done: boolean;
  href: string;
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
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm font-semibold underline"
      >
        Calendar rule ↗
      </a>
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
