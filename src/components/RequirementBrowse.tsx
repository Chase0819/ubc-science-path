"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AvgSticker } from "@/components/AvgSticker";
import {
  browseCategories,
  browseCategoryLabel,
  browseCourses,
  sortByWinterAverage,
  type BrowseCourse,
  type BrowseKind,
} from "@/lib/browse-courses";
import { courseByCode } from "@/lib/catalog";
import { COURSES_PER_TERM } from "@/lib/electives";
import { termCredits } from "@/lib/term-plan";
import type { TermPlan } from "@/lib/types";
import type { WinterAverage } from "@/lib/ubcgrades";

const TOP_5 = "top5";
const TOP_5_COUNT = 5;

const COPY: Record<BrowseKind, { title: string; intro: string }> = {
  arts: {
    title: "Arts credits",
    intro:
      "Only courses that count toward the B.Sc. 12-credit Arts Requirement: offered by the Faculty of Arts, with no other UBC course required first. GEOG counts; GEOS/GEOB does not. PSYC 101 and 102 count; science-numbered PSYC does not. ENGL and WRDS used for Communication do not count twice. Music is limited to history, theory, ethnomusicology, and composition. Language placement still applies if you already speak it.",
  },
  breadth: {
    title: "Science breadth",
    intro:
      "First-year Science courses that open a breadth area without another UBC course first. High-school Physics 12 or Chemistry 12 still apply where the Calendar says so.",
  },
  lab: {
    title: "Lab requirement",
    intro:
      "Every B.Sc. needs one course from this Faculty list. Some have a high-school or first-term prerequisite — check Workday before you register.",
  },
};

export function RequirementBrowse({
  kind,
  open,
  terms,
  averages,
  onAdd,
  onRemove,
  onClose,
}: {
  kind: BrowseKind;
  open: boolean;
  terms: TermPlan;
  averages: Record<string, WinterAverage | null>;
  onAdd: (code: string, term: "term1" | "term2") => void;
  onRemove: (code: string) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const catsId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState(TOP_5);
  const [catsOpen, setCatsOpen] = useState(kind !== "arts");

  useEffect(() => {
    if (!open) return;
    setCategory(TOP_5);
    setCatsOpen(kind !== "arts");
  }, [open, kind]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [category]);

  function pickCategory(id: string) {
    setCategory(id);
    setCatsOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => closeRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
  }, [open, kind, onClose]);

  const copy = COPY[kind];
  const categories = browseCategories(kind);
  const paged = kind !== "lab";
  const topFive = useMemo(() => {
    if (!paged) return [];
    return sortByWinterAverage(browseCourses(kind), averages)
      .filter((item) => typeof averages[item.code]?.average === "number")
      .slice(0, TOP_5_COUNT);
  }, [averages, kind, paged]);

  const visible = useMemo(() => {
    if (!paged) return sortByWinterAverage(browseCourses(kind), averages);
    if (category === TOP_5) return topFive;
    const rows = browseCourses(kind).filter((item) => item.category === category);
    return sortByWinterAverage(rows, averages);
  }, [averages, category, kind, paged, topFive]);

  const heading =
    !paged ? "Lab list" : category === TOP_5 ? "Top 5" : browseCategoryLabel(kind, category);
  const intro =
    paged && category === TOP_5
      ? "Latest winter overall from UBC Grades — not a cutoff, and not a ranking of how useful the course is."
      : null;

  if (!open) return null;

  const categoryLabel = category === TOP_5 ? "Top 5" : browseCategoryLabel(kind, category);

  const frame = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-1 sm:p-3">
      <button
        type="button"
        aria-label="Close course list"
        className="absolute inset-0 bg-[#142033]/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-[min(98vh,86rem)] w-full max-w-[92rem] flex-col overflow-hidden rounded-[28px] border-2 border-[#142033] bg-[#f4f1ea] shadow-[8px_8px_0_#142033]"
      >
        <div className="border-b-2 border-[#142033] bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#8a7018]">Browse courses</p>
              <h2 id={titleId} className="mt-0.5 text-2xl font-black tracking-tight sm:text-3xl">
                {copy.title}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-full border-2 border-[#142033] bg-[#f2d45c] px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
            >
              Close
            </button>
          </div>
          <p className="mt-1.5 max-w-5xl text-xs leading-5 text-[var(--muted)] sm:text-sm sm:leading-6">
            {copy.intro}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <TermCount title="Term 1" codes={terms.term1} onRemove={onRemove} />
            <TermCount title="Term 2" codes={terms.term2} onRemove={onRemove} />
          </div>
          {paged ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wide text-[var(--muted)]">
                  Categories
                </p>
                <button
                  type="button"
                  aria-expanded={catsOpen}
                  aria-controls={catsId}
                  onClick={() => setCatsOpen((openNow) => !openNow)}
                  className="rounded-full border-2 border-[#142033] bg-white px-3 py-0.5 text-xs font-bold shadow-[1px_1px_0_#142033] hover:bg-[#fff6c8]"
                >
                  {catsOpen ? "Collapse" : "Expand"}
                </button>
              </div>
              {catsOpen ? (
                <ul id={catsId} className="mt-2 flex flex-wrap gap-1">
                  <li>
                    <CategoryChip
                      label="Top 5"
                      on={category === TOP_5}
                      onClick={() => pickCategory(TOP_5)}
                    />
                  </li>
                  {categories.map((id) => (
                    <li key={id}>
                      <CategoryChip
                        label={browseCategoryLabel(kind, id)}
                        on={category === id}
                        onClick={() => pickCategory(id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div id={catsId} className="mt-2 flex flex-wrap items-center gap-1.5">
                  <CategoryChip label={categoryLabel} on onClick={() => setCatsOpen(true)} />
                  <p className="text-xs font-medium text-[var(--muted)]">
                    Expand to see every category
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
          <section>
            <h3 className="text-xl font-bold">{heading}</h3>
            {intro ? <p className="mt-1 text-sm text-[var(--muted)]">{intro}</p> : null}
            {visible.length === 0 ? (
              <p className="mt-3 rounded-[24px] border-2 border-dashed border-[#142033] bg-white px-5 py-6 text-center text-base">
                No courses in this category yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {visible.map((course, index) => (
                  <li key={course.code}>
                    <BrowseRow
                      course={course}
                      rank={paged && category === TOP_5 ? index + 1 : undefined}
                      area={
                        paged && category === TOP_5
                          ? browseCategoryLabel(kind, course.category)
                          : undefined
                      }
                      avg={averages[course.code]}
                      terms={terms}
                      onAdd={onAdd}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );

  return createPortal(frame, document.body);
}

function TermCount({
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
  return (
    <div className="rounded-[16px] border-2 border-[#142033] bg-[#f4f1ea] px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-black">{title}</p>
        <p className="text-xs font-bold tabular-nums">
          {codes.length} {codes.length === 1 ? "course" : "courses"} · {credits} cr
        </p>
      </div>
      <p className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">
        {codes.length === 0
          ? "Nothing placed yet."
          : seats > 0
            ? `Room for ${seats} more.`
            : "That is a full load."}
      </p>
      {codes.length > 0 ? (
        <ul className="mt-1.5 max-h-24 space-y-1 overflow-y-auto">
          {codes.map((code) => (
            <li
              key={code}
              className="flex items-center justify-between gap-2 rounded-full border-2 border-[#142033] bg-white px-2.5 py-0.5"
            >
              <span className="min-w-0 truncate text-xs font-bold">
                {code}
                <span className="ml-1 font-medium text-[var(--muted)]">
                  {courseByCode(code)?.title ?? ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(code)}
                className="shrink-0 text-[11px] font-bold underline decoration-2 underline-offset-2"
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

function CategoryChip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 border-[#142033] px-2 py-0.5 text-[11px] font-bold shadow-[1px_1px_0_#142033] ${
        on ? "bg-[#c5e8c4]" : "bg-white hover:bg-[#fff6c8]"
      }`}
    >
      {label}
    </button>
  );
}

function BrowseRow({
  course,
  rank,
  area,
  avg,
  terms,
  onAdd,
}: {
  course: BrowseCourse;
  rank?: number;
  area?: string;
  avg: WinterAverage | null | undefined;
  terms: TermPlan;
  onAdd: (code: string, term: "term1" | "term2") => void;
}) {
  const where = terms.term1.includes(course.code)
    ? "term1"
    : terms.term2.includes(course.code)
      ? "term2"
      : null;
  return (
    <div className="rounded-[22px] border-2 border-[#142033] bg-white p-3 shadow-[3px_3px_0_#142033] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {rank ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#142033] text-xs font-bold text-[#f2d45c]">
                {rank}
              </span>
            ) : null}
            <p className="text-lg font-black tracking-tight sm:text-xl">{course.code}</p>
            {area ? (
              <span className="rounded-full border-2 border-[#142033] bg-[#f4f1ea] px-2 py-0.5 text-[10px] font-bold">
                {area}
              </span>
            ) : null}
            {where ? (
              <span className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-2 py-0.5 text-[10px] font-bold">
                In {where === "term1" ? "Term 1" : "Term 2"}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-medium leading-5 sm:text-base">{course.title}</p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
            {course.credits} {course.credits === 1 ? "credit" : "credits"}
          </p>
          {course.note ? (
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{course.note}</p>
          ) : null}
        </div>
        <AvgSticker code={course.code} avg={avg} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={where === "term1"}
          onClick={() => onAdd(course.code, "term1")}
          className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Term 1
        </button>
        <button
          type="button"
          disabled={where === "term2"}
          onClick={() => onAdd(course.code, "term2")}
          className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Term 2
        </button>
      </div>
    </div>
  );
}
