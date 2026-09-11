"use client";

import { useEffect, useMemo, useState } from "react";
import {
  componentPercent,
  gpaFromPercent,
  letterFromPercent,
  remainingNeeded,
  round1,
  round2,
} from "@/lib/grades";
import { saveCalculator, saveSessional, loadCalculator } from "@/lib/storage";
import type { CalculatorCourse, GradeComponent } from "@/lib/types";

let nextId = 0;
function uid() {
  nextId += 1;
  return `row-${nextId}`;
}

function emptyComponent(): GradeComponent {
  return { id: uid(), name: "Midterm", weight: 30, score: "" };
}

function emptyCourse(): CalculatorCourse {
  return {
    id: uid(),
    code: "",
    credits: 3,
    percentOverride: "",
    components: [
      { id: uid(), name: "Assignments", weight: 20, score: "" },
      { id: uid(), name: "Midterm", weight: 30, score: "" },
      { id: uid(), name: "Final", weight: 50, score: "" },
    ],
  };
}

const DEFAULT_COURSE: CalculatorCourse = {
  id: "default-course",
  code: "",
  credits: 3,
  percentOverride: "",
  components: [
    { id: "default-a", name: "Assignments", weight: 20, score: "" },
    { id: "default-m", name: "Midterm", weight: 30, score: "" },
    { id: "default-f", name: "Final", weight: 50, score: "" },
  ],
};

function coursePercent(course: CalculatorCourse): number | null {
  if (course.percentOverride !== "" && Number.isFinite(Number(course.percentOverride))) {
    return Number(course.percentOverride);
  }
  return componentPercent(course.components);
}

export function GradeCalculator() {
  const [courses, setCourses] = useState<CalculatorCourse[]>([DEFAULT_COURSE]);
  const [target, setTarget] = useState(80);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadCalculator();
    if (saved.length) setCourses(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveCalculator(courses);
  }, [courses, ready]);

  const graded = useMemo(() => {
    return courses
      .map((course) => {
        const percent = coursePercent(course);
        return percent === null
          ? null
          : { course, percent, credits: course.credits || 0 };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null && row.credits > 0);
  }, [courses]);

  const creditSum = graded.reduce((sum, row) => sum + row.credits, 0);
  const sessional =
    creditSum > 0
      ? graded.reduce((sum, row) => sum + row.percent * row.credits, 0) / creditSum
      : null;
  const gpa =
    creditSum > 0
      ? graded.reduce((sum, row) => sum + gpaFromPercent(row.percent) * row.credits, 0) /
        creditSum
      : null;

  useEffect(() => {
    if (sessional !== null) saveSessional(round1(sessional));
  }, [sessional]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Sessional average"
          value={sessional === null ? "—" : `${round1(sessional)}%`}
          hint="Credit-weighted percent. This is what UBC Science uses for specialization ranking."
        />
        <Stat
          label="4.33 GPA"
          value={gpa === null ? "—" : round2(gpa).toFixed(2)}
          hint="Approximate UBC letter-to-GPA conversion. Not used for BSc specialization placement."
        />
        <Stat
          label="Credits counted"
          value={creditSum ? String(creditSum) : "—"}
          hint="Second-year standing typically needs 24+ completed credits."
        />
      </div>

      <div className="space-y-6">
        {courses.map((course) => {
          const percent = coursePercent(course);
          const leftover = remainingNeeded(course.components, target);
          const weightTotal = course.components.reduce(
            (sum, c) => sum + (Number(c.weight) || 0),
            0,
          );
          return (
            <article
              key={course.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-end gap-3">
                <label className="grid min-w-40 flex-1 gap-1 text-sm">
                  Course
                  <input
                    className="input"
                    placeholder="CPSC 110"
                    value={course.code}
                    onChange={(e) =>
                      updateCourse(setCourses, course.id, { code: e.target.value })
                    }
                  />
                </label>
                <label className="grid w-24 gap-1 text-sm">
                  Credits
                  <input
                    className="input"
                    type="number"
                    min={0}
                    step={1}
                    value={course.credits}
                    onChange={(e) =>
                      updateCourse(setCourses, course.id, {
                        credits: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="grid w-36 gap-1 text-sm">
                  Final % override
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="optional"
                    value={course.percentOverride}
                    onChange={(e) =>
                      updateCourse(setCourses, course.id, {
                        percentOverride:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </label>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-semibold tabular-nums">
                    {percent === null ? "—" : `${round1(percent)}%`}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {percent === null ? "add scores" : letterFromPercent(percent)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm text-red-700 hover:underline"
                  onClick={() =>
                    setCourses((list) => list.filter((c) => c.id !== course.id))
                  }
                >
                  Remove
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--muted)]">
                      <th className="py-2 font-medium">Component</th>
                      <th className="font-medium">Weight %</th>
                      <th className="font-medium">Score %</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {course.components.map((row) => (
                      <tr key={row.id} className="border-t border-[var(--line)]">
                        <td className="py-2 pr-2">
                          <input
                            className="input"
                            value={row.name}
                            onChange={(e) =>
                              updateComponent(setCourses, course.id, row.id, {
                                name: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="pr-2">
                          <input
                            className="input w-24"
                            type="number"
                            min={0}
                            value={row.weight}
                            onChange={(e) =>
                              updateComponent(setCourses, course.id, row.id, {
                                weight: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="pr-2">
                          <input
                            className="input w-24"
                            type="number"
                            min={0}
                            max={100}
                            placeholder="blank = leftover"
                            value={row.score}
                            onChange={(e) =>
                              updateComponent(setCourses, course.id, row.id, {
                                score:
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="text-xs text-[var(--muted)] hover:text-red-700"
                            onClick={() =>
                              setCourses((list) =>
                                list.map((c) =>
                                  c.id === course.id
                                    ? {
                                        ...c,
                                        components: c.components.filter(
                                          (x) => x.id !== row.id,
                                        ),
                                      }
                                    : c,
                                ),
                              )
                            }
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setCourses((list) =>
                      list.map((c) =>
                        c.id === course.id
                          ? { ...c, components: [...c.components, emptyComponent()] }
                          : c,
                      ),
                    )
                  }
                >
                  Add component
                </button>
                <span
                  className={
                    Math.abs(weightTotal - 100) < 0.5
                      ? "text-[var(--muted)]"
                      : "text-amber-800"
                  }
                >
                  Weights sum to {round1(weightTotal)}%
                </span>
                {leftover && leftover.neededOnRemaining !== null && (
                  <span className="text-[var(--muted)]">
                    For a {target}% course mark, you need{" "}
                    <strong className="text-[var(--ink)]">
                      {round1(leftover.neededOnRemaining)}%
                    </strong>{" "}
                    on remaining work.
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setCourses((list) => [...list, emptyCourse()])}
        >
          Add course
        </button>
        <label className="flex items-center gap-2 text-sm">
          Target course %
          <input
            className="input w-20"
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{hint}</p>
    </div>
  );
}

function updateCourse(
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>,
  id: string,
  patch: Partial<CalculatorCourse>,
) {
  setCourses((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

function updateComponent(
  setCourses: React.Dispatch<React.SetStateAction<CalculatorCourse[]>>,
  courseId: string,
  componentId: string,
  patch: Partial<GradeComponent>,
) {
  setCourses((list) =>
    list.map((c) =>
      c.id === courseId
        ? {
            ...c,
            components: c.components.map((row) =>
              row.id === componentId ? { ...row, ...patch } : row,
            ),
          }
        : c,
    ),
  );
}
