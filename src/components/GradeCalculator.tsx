"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  calcCourseByCode,
  searchCalcCourses,
  type CalcCourseOption,
} from "@/lib/calculator-courses";
import {
  componentPercent,
  creditWeighted,
  letterFromPercent,
  remainingNeeded,
  round1,
  round2,
} from "@/lib/grades";
import { saveCalculator, saveSessional, loadCalculator, newCalcId } from "@/lib/storage";
import type { CalcTerm, CalculatorCourse, GradeComponent } from "@/lib/types";
import { winterNow } from "@/lib/winter";

type AverageEntry = {
  id: string;
  code: string;
  percent: number | null;
};

function uid() {
  return newCalcId();
}

function emptyComponent(): GradeComponent {
  return { id: uid(), name: "Midterm", weight: 30, score: "" };
}

function emptyCourse(term: CalcTerm): CalculatorCourse {
  return {
    id: uid(),
    code: "",
    credits: 3,
    term,
    percentOverride: "",
    components: [
      { id: uid(), name: "Assignments", weight: 20, score: "" },
      { id: uid(), name: "Midterm", weight: 30, score: "" },
      { id: uid(), name: "Final", weight: 50, score: "" },
    ],
  };
}

function coursePercent(course: CalculatorCourse): number | null {
  return componentPercent(course.components);
}

const TERM_META: Record<
  CalcTerm,
  { title: string; season: string; nowLabel: string }
> = {
  term1: {
    title: "Term 1",
    season: "Sep – Dec",
    nowLabel: "You are in Term 1. New courses land here until January.",
  },
  term2: {
    title: "Term 2",
    season: "Jan – Apr",
    nowLabel: "You are in Term 2. New courses land here until the winter session ends.",
  },
};

export function GradeCalculator() {
  const [courses, setCourses] = useState<CalculatorCourse[]>([]);
  const [target, setTarget] = useState(80);
  const skipSave = useRef(true);
  const clock = winterNow();

  useEffect(() => {
    const saved = loadCalculator();
    setCourses(saved.length ? saved : [emptyCourse(winterNow().term)]);
  }, []);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    saveCalculator(courses);
  }, [courses]);

  const graded = useMemo(() => {
    return courses
      .map((course) => {
        const percent = coursePercent(course);
        return percent === null
          ? null
          : { course, percent, credits: course.credits || 0 };
      })
      .filter(
        (row): row is NonNullable<typeof row> =>
          row !== null && row.credits > 0 && row.course.code.trim() !== "",
      );
  }, [courses]);

  const term1 = creditWeighted(
    graded.filter((row) => row.course.term === "term1").map((row) => row),
  );
  const term2 = creditWeighted(
    graded.filter((row) => row.course.term === "term2").map((row) => row),
  );
  const combined = creditWeighted(graded);
  const combinedPercent = combined?.percent ?? null;

  const term1Entries = averageEntries(courses, "term1");
  const term2Entries = averageEntries(courses, "term2");
  const combinedEntries = averageEntries(courses);

  useEffect(() => {
    if (combinedPercent !== null) saveSessional(round1(combinedPercent));
  }, [combinedPercent]);

  const phaseCopy =
    clock.phase === "summer"
      ? "Winter session is over. New courses start in Term 1 for the next winter."
      : TERM_META[clock.term].nowLabel;

  return (
    <div className="relative left-1/2 w-[min(96rem,calc(100vw-5rem))] max-w-none -translate-x-1/2 space-y-8">
      <div className="rounded-[28px] border-2 border-[#142033] bg-[#c5e8c4] px-5 py-4 shadow-[4px_4px_0_#142033]">
        <p className="text-lg font-bold">Where the year is</p>
        <p className="mt-1 text-base leading-7">{phaseCopy}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AverageCard
          kicker="Sep – Dec"
          label="Term 1 average"
          stats={term1}
          entries={term1Entries}
          current={clock.phase === "term1"}
        />
        <AverageCard
          kicker="Jan – Apr"
          label="Term 2 average"
          stats={term2}
          entries={term2Entries}
          current={clock.phase === "term2"}
        />
        <AverageCard
          kicker="Winter session"
          label="Combined average"
          stats={combined}
          entries={combinedEntries}
          combined
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#3d7a45]">Your winter marks</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Term 1 and Term 2</h2>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          Target course %
          <input
            className="w-20 rounded-2xl border-2 border-[#142033] bg-white px-3 py-1.5 font-bold shadow-[2px_2px_0_#142033] outline-none"
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TermColumn
          term="term1"
          current={clock.term === "term1"}
          courses={courses.filter((course) => course.term === "term1")}
          target={target}
          setCourses={setCourses}
        />
        <TermColumn
          term="term2"
          current={clock.term === "term2"}
          courses={courses.filter((course) => course.term === "term2")}
          target={target}
          setCourses={setCourses}
        />
      </div>
    </div>
  );
}

function TermColumn({
  term,
  current,
  courses,
  target,
  setCourses,
}: {
  term: CalcTerm;
  current: boolean;
  courses: CalculatorCourse[];
  target: number;
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>;
}) {
  const meta = TERM_META[term];
  const credits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
  return (
    <section
      className={`rounded-[28px] border-2 border-[#142033] p-5 shadow-[4px_4px_0_#142033] sm:p-6 ${
        current ? "bg-[#c5e8c4]" : "bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-2xl font-black">{meta.title}</p>
          <p className="text-sm font-medium text-[var(--muted)]">{meta.season}</p>
        </div>
        <p className="text-sm font-bold">
          {credits} cr
          {current ? (
            <span className="ml-2 rounded-full border-2 border-[#142033] bg-white px-2 py-0.5 text-[10px] font-bold uppercase">
              now
            </span>
          ) : null}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {courses.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[#142033] px-3 py-8 text-center text-sm font-medium text-[var(--muted)]">
            No {meta.title} courses yet
          </p>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              target={target}
              setCourses={setCourses}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => setCourses((list) => [...list, emptyCourse(term)])}
        className={`mt-4 w-full rounded-full border-2 border-[#142033] px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#142033] ${
          current ? "bg-white" : "bg-[#c5e8c4]"
        }`}
      >
        Add {meta.title} course
      </button>
    </section>
  );
}

function CourseCard({
  course,
  target,
  setCourses,
}: {
  course: CalculatorCourse;
  target: number;
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>;
}) {
  const percent = coursePercent(course);
  const leftover = remainingNeeded(course.components, target);
  const weightTotal = course.components.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);

  return (
    <article className="relative z-0 rounded-2xl border-2 border-[#142033] bg-white px-4 py-4 shadow-[3px_3px_0_#142033] focus-within:z-30 sm:px-5 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CourseSearch course={course} setCourses={setCourses} />
        <label className="grid w-20 shrink-0 gap-1 text-xs font-bold">
          Credits
          <input
            className="w-full rounded-2xl border-2 border-[#142033] bg-white px-2 py-2.5 font-bold outline-none"
            type="number"
            min={0}
            step={1}
            value={course.credits}
            onChange={(e) =>
              updateCourse(setCourses, course.id, { credits: Number(e.target.value) })
            }
          />
        </label>
        <div className="min-w-[5.5rem] shrink-0 pt-5 text-right">
          <p className="text-2xl font-black tabular-nums leading-none">
            {percent === null ? "—" : `${round1(percent)}%`}
          </p>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            {percent === null ? "add scores" : letterFromPercent(percent)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TermSwitch term={course.term} onChange={(term) => updateCourse(setCourses, course.id, { term })} />
        <button
          type="button"
          className="ml-auto rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-bold hover:bg-[#f8d0d0]"
          onClick={() => setCourses((list) => list.filter((row) => row.id !== course.id))}
        >
          Delete course
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-[minmax(0,1fr)_6rem_6rem_2rem] gap-2 text-[10px] font-bold tracking-wide text-[var(--muted)] uppercase">
          <p>Component</p>
          <p>Weight</p>
          <p>Score</p>
          <p />
        </div>
        {course.components.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[minmax(0,1fr)_6rem_6rem_2rem] items-center gap-2"
          >
            <input
              className="rounded-xl border-2 border-[#142033] bg-white px-2 py-1.5 text-sm font-semibold outline-none"
              value={row.name}
              onChange={(e) =>
                updateComponent(setCourses, course.id, row.id, { name: e.target.value })
              }
            />
            <input
              className="rounded-xl border-2 border-[#142033] bg-white px-2 py-1.5 text-sm font-bold outline-none"
              type="number"
              min={0}
              value={row.weight}
              onChange={(e) =>
                updateComponent(setCourses, course.id, row.id, { weight: Number(e.target.value) })
              }
            />
            <input
              className="rounded-xl border-2 border-[#142033] bg-white px-2 py-1.5 text-sm font-bold outline-none"
              type="number"
              min={0}
              max={100}
              placeholder="—"
              value={row.score}
              onChange={(e) =>
                updateComponent(setCourses, course.id, row.id, {
                  score: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
            <button
              type="button"
              className="text-sm font-black text-[var(--muted)] hover:text-[#c62828]"
              onClick={() =>
                setCourses((list) =>
                  list.map((item) =>
                    item.id === course.id
                      ? {
                          ...item,
                          components: item.components.filter((part) => part.id !== row.id),
                        }
                      : item,
                  ),
                )
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          className="rounded-full border-2 border-[#142033] bg-[#c5e8c4] px-3 py-1 text-xs font-bold"
          onClick={() =>
            setCourses((list) =>
              list.map((item) =>
                item.id === course.id
                  ? { ...item, components: [...item.components, emptyComponent()] }
                  : item,
              ),
            )
          }
        >
          Add component
        </button>
        <span
          className={`font-semibold ${
            Math.abs(weightTotal - 100) < 0.5 ? "text-[var(--muted)]" : "text-amber-800"
          }`}
        >
          Weights {round1(weightTotal)}%
        </span>
        {leftover && leftover.neededOnRemaining !== null ? (
          <span className="text-[var(--muted)]">
            Need{" "}
            <strong className="text-[var(--ink)]">{round1(leftover.neededOnRemaining)}%</strong> on
            leftover work for {target}%.
          </span>
        ) : null}
      </div>
    </article>
  );
}

function TermSwitch({
  term,
  onChange,
}: {
  term: CalcTerm;
  onChange: (term: CalcTerm) => void;
}) {
  return (
    <div className="flex gap-2">
      {(["term1", "term2"] as const).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-full border-2 border-[#142033] px-3 py-1 text-xs font-bold ${
            term === id ? "bg-[#c5e8c4] shadow-[2px_2px_0_#142033]" : "bg-white"
          }`}
        >
          {id === "term1" ? "Term 1" : "Term 2"}
        </button>
      ))}
    </div>
  );
}

function AverageCard({
  kicker,
  label,
  stats,
  entries,
  current,
  combined,
}: {
  kicker: string;
  label: string;
  stats: { percent: number; credits: number; gpa: number } | null;
  entries: AverageEntry[];
  current?: boolean;
  combined?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border-2 border-[#142033] p-5 shadow-[4px_4px_0_#142033] ${
        combined ? "bg-[#c5e8c4]" : current ? "bg-[#d8f0d7]" : "bg-white"
      }`}
    >
      <p className="text-xs font-bold tracking-wide text-[#3d7a45] uppercase">{kicker}</p>
      <p className="mt-1 text-sm font-bold">{label}</p>
      <p className="mt-2 text-3xl font-black tabular-nums tracking-tight">
        {stats === null ? "—" : `${round1(stats.percent)}%`}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-[var(--muted)]">
        {stats === null
          ? "Add scores to count this average."
          : combined
            ? `${stats.credits} cr · GPA ${round2(stats.gpa).toFixed(2)} · saved for outlook`
            : `${stats.credits} cr · GPA ${round2(stats.gpa).toFixed(2)}`}
      </p>
      {entries.length > 0 ? (
        <ul className="mt-3 max-h-36 space-y-1 overflow-y-auto text-xs font-bold">
          {entries.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-3">
              <span>{row.code}</span>
              <span className="tabular-nums text-[var(--muted)]">
                {row.percent === null ? "—" : `${round1(row.percent)}%`}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CourseSearch({
  course,
  setCourses,
}: {
  course: CalculatorCourse;
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(course.code);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = useMemo(() => searchCalcCourses(query), [query]);

  useEffect(() => {
    setQuery(course.code);
  }, [course.code]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function pick(option: CalcCourseOption) {
    updateCourse(setCourses, course.id, { code: option.code, credits: option.credits });
    setQuery(option.code);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const hit = matches[active] ?? calcCourseByCode(query);
      if (hit) pick(hit);
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-[12rem] flex-1 ${open ? "z-40" : ""}`}>
      <label className="grid gap-1 text-xs font-bold">
        Search course
        <input
          className="w-full rounded-2xl border-2 border-[#142033] bg-white px-3 py-2.5 text-base font-black outline-none"
          placeholder="Type C for CHEM, CPSC…"
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          onFocus={() => setOpen(query.trim().length > 0)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </label>
      {open && query.trim() ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-2xl border-2 border-[#142033] bg-white py-1 shadow-[4px_4px_0_#142033]"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-xs font-semibold text-[var(--muted)]">
              No 100- or 200-level Science course starts with that.
            </li>
          ) : (
            matches.map((option, index) => (
              <li key={option.code} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left ${
                    index === active ? "bg-[#c5e8c4]" : "bg-white hover:bg-[#d8f0d7]"
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => pick(option)}
                >
                  <span className="text-sm font-black">{option.code}</span>
                  <span className="truncate text-[11px] font-semibold text-[var(--muted)]">
                    {option.title}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function averageEntries(courses: CalculatorCourse[], term?: CalcTerm): AverageEntry[] {
  return courses
    .filter((course) => course.code.trim() && (!term || course.term === term))
    .map((course) => ({
      id: course.id,
      code: course.code,
      percent: coursePercent(course),
    }));
}

function updateCourse(
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>,
  id: string,
  patch: Partial<CalculatorCourse>,
) {
  setCourses((list) => list.map((course) => (course.id === id ? { ...course, ...patch } : course)));
}

function updateComponent(
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>,
  courseId: string,
  componentId: string,
  patch: Partial<GradeComponent>,
) {
  setCourses((list) =>
    list.map((course) =>
      course.id === courseId
        ? {
            ...course,
            components: course.components.map((row) =>
              row.id === componentId ? { ...row, ...patch } : row,
            ),
          }
        : course,
    ),
  );
}
