"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  calcCourseByCode,
  searchCalcCourses,
  type CalcCourseOption,
} from "@/lib/calculator-courses";
import {
  componentPercent,
  creditWeighted,
  letterFromPercent,
  neededPartnerAverage,
  remainingAverageNeeded,
  remainingNeeded,
  round1,
  round2,
} from "@/lib/grades";
import { saveCalculator, saveSessional, loadCalculator, newCalcId } from "@/lib/storage";
import type {
  CalcTerm,
  CalculatorCourse,
  CalculatorTargets,
  GradeComponent,
} from "@/lib/types";
import { winterNow } from "@/lib/winter";
import { AverageAnalysis } from "@/components/AverageAnalysis";
import { CalculatorTutorial } from "@/components/CalculatorTutorial";

type AverageEntry = {
  id: string;
  code: string;
  percent: number | null;
  pull: number | null;
};

type GradedRow = {
  course: CalculatorCourse;
  percent: number;
  credits: number;
};

function uid() {
  return newCalcId();
}

const COMPONENT_PRESETS = ["Assignments", "Midterm", "Final", "Attendance", "Lab"] as const;

function emptyComponent(): GradeComponent {
  return { id: uid(), name: "", weight: 30, score: "" };
}

function emptyCourse(term: CalcTerm): CalculatorCourse {
  return {
    id: uid(),
    code: "",
    credits: 3,
    term,
    percentOverride: "",
    target: 80,
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
  { title: string; season: string }
> = {
  term1: {
    title: "Term 1",
    season: "Sep – Dec",
  },
  term2: {
    title: "Term 2",
    season: "Jan – Apr",
  },
};

export function GradeCalculator() {
  const [courses, setCourses] = useState<CalculatorCourse[]>([]);
  const [targets, setTargets] = useState<CalculatorTargets>({
    term1: "",
    term2: "",
    combined: "",
  });
  const [analysis, setAnalysis] = useState<"term1" | "term2" | "combined" | null>(null);
  const [ready, setReady] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const skipSave = useRef(true);
  const clock = winterNow();

  useEffect(() => {
    const saved = loadCalculator();
    setCourses(saved.courses.length ? saved.courses : [emptyCourse(winterNow().term)]);
    setTargets(saved.targets);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const wait = window.setTimeout(() => setTourOpen(true), 880);
    return () => window.clearTimeout(wait);
  }, [ready]);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    saveCalculator({ courses, targets });
  }, [courses, targets]);

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

  const term1Entries = averageEntries(courses, graded, "term1");
  const term2Entries = averageEntries(courses, graded, "term2");
  const combinedEntries = averageEntries(courses, graded);
  const term1Courses = useMemo(
    () => courses.filter((course) => course.term === "term1"),
    [courses],
  );
  const term2Courses = useMemo(
    () => courses.filter((course) => course.term === "term2"),
    [courses],
  );
  const codedCourses = useMemo(
    () => courses.filter((course) => course.code.trim()),
    [courses],
  );

  const winterPartner = winterPartnerHint(
    term1,
    term2,
    term1Courses,
    term2Courses,
    targets.combined,
  );

  useEffect(() => {
    if (combinedPercent !== null) saveSessional(round1(combinedPercent));
  }, [combinedPercent]);

  return (
    <>
      <div className="relative left-1/2 w-[min(96rem,calc(100vw-5rem))] max-w-none -translate-x-1/2 space-y-8">
      <div data-tutorial="averages" className="grid gap-4 scroll-mt-8 sm:grid-cols-3">
        <AverageCard
          kicker="Sep – Dec"
          label="Term 1 average"
          stats={term1}
          entries={term1Entries}
          current={clock.phase === "term1"}
          target={targets.term1}
          leftover={leftoverForTarget(term1Courses, targets.term1)}
          partner={winterPartner?.other === "Term 1" ? winterPartner : null}
          onTarget={(target) => setTargets((current) => ({ ...current, term1: target }))}
          onAnalyse={() => setAnalysis("term1")}
        />
        <AverageCard
          kicker="Jan – Apr"
          label="Term 2 average"
          stats={term2}
          entries={term2Entries}
          current={clock.phase === "term2"}
          target={targets.term2}
          leftover={leftoverForTarget(term2Courses, targets.term2)}
          partner={winterPartner?.other === "Term 2" ? winterPartner : null}
          onTarget={(target) => setTargets((current) => ({ ...current, term2: target }))}
          onAnalyse={() => setAnalysis("term2")}
        />
        <AverageCard
          kicker="Winter session"
          label="Combined average"
          stats={combined}
          entries={combinedEntries}
          combined
          target={targets.combined}
          leftover={leftoverForTarget(codedCourses, targets.combined)}
          partner={winterPartner}
          onTarget={(target) => setTargets((current) => ({ ...current, combined: target }))}
          onAnalyse={() => setAnalysis("combined")}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#3d7a45]">Your winter marks</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Term 1 and Term 2</h2>
        </div>
        <button
          type="button"
          onClick={() => setTourOpen(true)}
          className="rounded-full border-2 border-[#142033] bg-[#d8f0d7] px-4 py-1.5 text-sm font-semibold shadow-[2px_2px_0_#142033]"
        >
          How this works
        </button>
      </div>

      <div data-tutorial="terms" className="grid gap-4 scroll-mt-8 lg:grid-cols-2">
        <TermColumn
          term="term1"
          current={clock.term === "term1"}
          courses={term1Courses}
          setCourses={setCourses}
        />
        <TermColumn
          term="term2"
          current={clock.term === "term2"}
          courses={term2Courses}
          setCourses={setCourses}
        />
      </div>
      </div>

      {tourOpen ? <CalculatorTutorial onClose={() => setTourOpen(false)} /> : null}

      {analysis ? (
        <AverageAnalysis
          title={
            analysis === "term1"
              ? "Term 1 analysis"
              : analysis === "term2"
                ? "Term 2 analysis"
                : "Combined winter analysis"
          }
          courses={
            analysis === "term1"
              ? term1Courses
              : analysis === "term2"
                ? term2Courses
                : codedCourses
          }
          onClose={() => setAnalysis(null)}
        />
      ) : null}
    </>
  );
}

function TermColumn({
  term,
  current,
  courses,
  setCourses,
}: {
  term: CalcTerm;
  current: boolean;
  courses: CalculatorCourse[];
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
  setCourses,
}: {
  course: CalculatorCourse;
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>;
}) {
  const percent = coursePercent(course);
  const target = typeof course.target === "number" ? course.target : null;
  const leftover =
    target === null ? null : remainingNeeded(course.components, target);
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

      <div data-tutorial="components" className="scroll-mt-8">
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TermSwitch term={course.term} onChange={(term) => updateCourse(setCourses, course.id, { term })} />
        <label className="flex items-center gap-2 text-xs font-bold">
          Target %
          <input
            className="w-16 rounded-xl border-2 border-[#142033] bg-white px-2 py-1.5 text-sm font-bold outline-none"
            type="number"
            min={0}
            max={100}
            placeholder="—"
            value={course.target}
            onChange={(e) =>
              updateCourse(setCourses, course.id, {
                target: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </label>
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
            <ComponentNamePick
              courseId={course.id}
              component={row}
              setCourses={setCourses}
            />
            <input
              className="rounded-xl border-2 border-[#142033] bg-white px-2 py-1.5 text-sm font-bold outline-none"
              type="number"
              min={0}
              placeholder="—"
              value={row.weight}
              onChange={(e) =>
                updateComponent(setCourses, course.id, row.id, {
                  weight: e.target.value === "" ? "" : Number(e.target.value),
                })
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
        {leftover && leftover.neededOnRemaining !== null && target !== null ? (
          <span className="text-[var(--muted)]">
            Need{" "}
            <strong className="text-[var(--ink)]">{round1(leftover.neededOnRemaining)}%</strong> on
            leftover work for {target}%.
          </span>
        ) : null}
      </div>
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
  target,
  leftover,
  partner,
  onTarget,
  onAnalyse,
}: {
  kicker: string;
  label: string;
  stats: { percent: number; credits: number; gpa: number } | null;
  entries: AverageEntry[];
  current?: boolean;
  combined?: boolean;
  target: number | "";
  leftover: { remainingCredits: number; neededOnRemaining: number } | null;
  partner: WinterPartnerHint | null;
  onTarget: (target: number | "") => void;
  onAnalyse: () => void;
}) {
  const targetNumber = typeof target === "number" ? target : null;
  const gap =
    stats !== null && targetNumber !== null && !(combined && partner)
      ? round1(stats.percent - targetNumber)
      : null;
  const leftoverUseful =
    leftover && targetNumber !== null && (!partner || leftover.remainingCredits !== partner.credits);
  return (
    <div
      data-tutorial={combined ? "combined" : undefined}
      className={`scroll-mt-8 rounded-[28px] border-2 border-[#142033] p-5 shadow-[4px_4px_0_#142033] ${
        combined ? "bg-[#f2d45c]" : current ? "bg-[#d8f0d7]" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#3d7a45] uppercase">{kicker}</p>
          <p className="mt-1 text-sm font-bold">{label}</p>
        </div>
        <label className="grid shrink-0 gap-1 text-[10px] font-bold tracking-wide uppercase">
          Target %
          <input
            className="w-16 rounded-xl border-2 border-[#142033] bg-white px-2 py-1.5 text-sm font-bold outline-none"
            type="number"
            min={0}
            max={100}
            placeholder="—"
            value={target}
            onChange={(event) =>
              onTarget(event.target.value === "" ? "" : Number(event.target.value))
            }
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-3xl font-black tabular-nums tracking-tight">
          {stats === null ? "—" : `${round1(stats.percent)}%`}
        </p>
        {gap !== null ? (
          <p className={`text-base font-black tabular-nums ${pullClass(gap)}`}>
            {gap === 0
              ? "on target"
              : gap > 0
                ? `+${gap}% above`
                : `−${Math.abs(gap)}% below`}
          </p>
        ) : null}
      </div>
      <p className="mt-2 text-xs font-semibold leading-5 text-[var(--muted)]">
        {stats === null
          ? "Add scores to count this average."
          : combined
            ? `${stats.credits} cr · GPA ${round2(stats.gpa).toFixed(2)} · saved for outlook`
            : `${stats.credits} cr · GPA ${round2(stats.gpa).toFixed(2)}`}
      </p>
      {partner ? <p className="mt-1 text-xs font-semibold leading-5">{partnerCopy(partner, combined)}</p> : null}
      {leftoverUseful && leftover && targetNumber !== null ? (
        <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
          Need{" "}
          <strong className="text-[var(--ink)]">{round1(leftover.neededOnRemaining)}%</strong> on
          leftover {leftover.remainingCredits} cr for {targetNumber}%.
        </p>
      ) : null}
      {entries.length > 0 ? (
        <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto text-xs font-bold">
          {entries.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate">{row.code}</span>
              <span className="shrink-0 tabular-nums">
                <span className="text-[var(--muted)]">
                  {row.percent === null ? "—" : `${round1(row.percent)}%`}
                </span>
                <span className={`ml-2 ${pullClass(row.pull)}`}>{formatPull(row.pull)}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={onAnalyse}
        className="mt-4 w-full rounded-full border-2 border-[#142033] bg-white px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_#142033]"
      >
        Deep analysis
      </button>
    </div>
  );
}

function filterComponentPresets(query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...COMPONENT_PRESETS];
  return COMPONENT_PRESETS.filter((name) => name.toLowerCase().includes(needle));
}

function ComponentNamePick({
  courseId,
  component,
  setCourses,
}: {
  courseId: string;
  component: GradeComponent;
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextOpen = useRef(false);
  const [query, setQuery] = useState(component.name);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const [active, setActive] = useState(0);
  const matches = useMemo(
    () => (typed ? filterComponentPresets(query) : [...COMPONENT_PRESETS]),
    [query, typed],
  );
  const optionCount = matches.length + 1;

  useEffect(() => {
    setQuery(component.name);
  }, [component.name]);

  useEffect(() => {
    setActive(0);
  }, [query, typed]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function setName(name: string) {
    setQuery(name);
    updateComponent(setCourses, courseId, component.id, { name });
  }

  function pickPreset(name: string) {
    setName(name);
    setOpen(false);
    setTyped(false);
  }

  function pickCustom() {
    skipNextOpen.current = true;
    setName("");
    setTyped(true);
    setOpen(false);
    inputRef.current?.focus();
    window.setTimeout(() => {
      skipNextOpen.current = false;
    }, 0);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, optionCount - 1));
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
      if (active >= matches.length) pickCustom();
      else if (matches[active]) pickPreset(matches[active]);
      else pickCustom();
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${open ? "z-40" : ""}`}>
      <input
        ref={inputRef}
        className="w-full rounded-xl border-2 border-[#142033] bg-white px-2 py-1.5 text-sm font-semibold outline-none"
        placeholder="Type a name"
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        onMouseDown={() => {
          if (skipNextOpen.current) return;
          setTyped(false);
          setOpen(true);
        }}
        onFocus={() => {
          if (skipNextOpen.current) return;
          setTyped(false);
          setOpen(true);
        }}
        onClick={() => {
          if (skipNextOpen.current) return;
          setOpen(true);
        }}
        onChange={(event) => {
          setTyped(true);
          setName(event.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-64 w-[min(18rem,calc(100vw-6rem))] overflow-auto rounded-2xl border-2 border-[#142033] bg-white py-1 shadow-[4px_4px_0_#142033]"
        >
          {matches.map((name, index) => (
            <li key={name} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm font-bold ${
                  index === active ? "bg-[#c5e8c4]" : "bg-white hover:bg-[#d8f0d7]"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => pickPreset(name)}
              >
                {name}
              </button>
            </li>
          ))}
          <li
            role="option"
            aria-selected={active === matches.length}
            className="mt-1 border-t-2 border-[#142033]"
          >
            <button
              type="button"
              className={`w-full px-3 py-2 text-left text-sm font-bold text-[#3d7a45] ${
                active === matches.length ? "bg-[#c5e8c4]" : "bg-white hover:bg-[#d8f0d7]"
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(matches.length)}
              onClick={pickCustom}
            >
              + Create own component
            </button>
          </li>
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
    <div
      ref={rootRef}
      data-tutorial="search"
      className={`relative min-w-[12rem] flex-1 scroll-mt-8 ${open ? "z-40" : ""}`}
    >
      <label className="grid gap-1 text-xs font-bold">
        Search course
        <input
          className="w-full rounded-2xl border-2 border-[#142033] bg-white px-3 py-2.5 text-base font-black outline-none"
          placeholder="Type course id"
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

function leftoverForTarget(
  courses: CalculatorCourse[],
  target: number | "",
): { remainingCredits: number; neededOnRemaining: number } | null {
  if (typeof target !== "number") return null;
  return remainingAverageNeeded(
    courses
      .filter((course) => course.code.trim() && (course.credits || 0) > 0)
      .map((course) => ({ percent: coursePercent(course), credits: course.credits || 0 })),
    target,
  );
}

type WinterPartnerHint = {
  other: "Term 1" | "Term 2";
  current: "Term 1" | "Term 2";
  currentPercent: number;
  needed: number;
  credits: number;
  assumed: boolean;
  combinedTarget: number;
  locked: boolean;
};

function plannedCredits(courses: CalculatorCourse[]): number {
  return courses.reduce((sum, course) => {
    if (!course.code.trim() || !(course.credits > 0)) return sum;
    return sum + course.credits;
  }, 0);
}

function courseSettled(course: CalculatorCourse): boolean {
  if (coursePercent(course) === null) return false;
  return remainingNeeded(course.components, 0) === null;
}

function termLocked(courses: CalculatorCourse[]): boolean {
  const rows = courses.filter((course) => course.code.trim() && (course.credits || 0) > 0);
  return rows.length > 0 && rows.every(courseSettled);
}

function winterPartnerHint(
  term1: { percent: number; credits: number } | null,
  term2: { percent: number; credits: number } | null,
  term1Courses: CalculatorCourse[],
  term2Courses: CalculatorCourse[],
  combinedTarget: number | "",
): WinterPartnerHint | null {
  if (typeof combinedTarget !== "number") return null;
  const t1Locked = term1 !== null && termLocked(term1Courses);
  const t2Locked = term2 !== null && termLocked(term2Courses);
  if (t1Locked && t2Locked) return null;

  if (term1 && !t2Locked) {
    const planned = plannedCredits(term2Courses);
    const credits = planned > 0 ? planned : term1.credits;
    const needed = neededPartnerAverage(term1, credits, combinedTarget);
    if (needed === null) return null;
    return {
      other: "Term 2",
      current: "Term 1",
      currentPercent: term1.percent,
      needed,
      credits,
      assumed: planned <= 0,
      combinedTarget,
      locked: t1Locked,
    };
  }

  if (term2 && !t1Locked) {
    const planned = plannedCredits(term1Courses);
    const credits = planned > 0 ? planned : term2.credits;
    const needed = neededPartnerAverage(term2, credits, combinedTarget);
    if (needed === null) return null;
    return {
      other: "Term 1",
      current: "Term 2",
      currentPercent: term2.percent,
      needed,
      credits,
      assumed: planned <= 0,
      combinedTarget,
      locked: t2Locked,
    };
  }

  return null;
}

function partnerCopy(partner: WinterPartnerHint, combined?: boolean): ReactNode {
  const score = `${round1(partner.needed)}%`;
  const stay = `${round1(partner.currentPercent)}%`;
  const unreachable = partner.needed > 100;
  const already = partner.needed <= 0;
  const reach = unreachable
    ? " — not reachable at this credit load."
    : already
      ? " — already above that winter target."
      : ".";

  const load = partner.assumed ? ` if it is also ${partner.credits} cr` : ` on ${partner.credits} cr`;

  if (!combined) {
    if (partner.locked) {
      return (
        <>
          Need <strong className="text-[var(--ink)]">{score}</strong> here{load}, for your{" "}
          {partner.combinedTarget}% winter average{reach}
        </>
      );
    }
    return (
      <>
        Need <strong className="text-[var(--ink)]">{score}</strong> here if {partner.current} stays at {stay}
        {load}, for your {partner.combinedTarget}% winter average{reach}
      </>
    );
  }

  if (partner.locked) {
    return (
      <>
        {partner.other} needs <strong className="text-[var(--ink)]">{score}</strong>
        {load}, for your {partner.combinedTarget}% winter average{reach}
        {partner.assumed ? ` Add ${partner.other} courses to lock the credits.` : ""}
      </>
    );
  }

  return (
    <>
      If {partner.current} stays at {stay}, {partner.other} needs{" "}
      <strong className="text-[var(--ink)]">{score}</strong>
      {load}, for your {partner.combinedTarget}% winter average{reach}
      {partner.assumed ? ` Add ${partner.other} courses to lock the credits.` : ""}
    </>
  );
}

function averageEntries(
  courses: CalculatorCourse[],
  graded: GradedRow[],
  term?: CalcTerm,
): AverageEntry[] {
  const pool = courses.filter((course) => course.code.trim() && (!term || course.term === term));
  const counted = graded.filter((row) => !term || row.course.term === term);
  const withAll = creditWeighted(counted);

  return pool.map((course) => {
    const percent = coursePercent(course);
    const inAverage = percent !== null && (course.credits || 0) > 0;
    let pull: number | null = null;
    if (inAverage && withAll) {
      const without = creditWeighted(counted.filter((row) => row.course.id !== course.id));
      pull = without === null ? 0 : withAll.percent - without.percent;
    }
    return { id: course.id, code: course.code, percent, pull };
  });
}

function formatPull(pull: number | null): string {
  if (pull === null) return "—";
  const n = round1(pull);
  if (n === 0) return "0%";
  return n > 0 ? `+${n}%` : `−${Math.abs(n)}%`;
}

function pullClass(pull: number | null): string {
  if (pull === null) return "text-[var(--muted)]";
  const n = round1(pull);
  if (n > 0) return "text-[#2f6b38]";
  if (n < 0) return "text-[#b42318]";
  return "text-[var(--muted)]";
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
