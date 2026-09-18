"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { componentPercent, round1 } from "@/lib/grades";
import type { CalculatorCourse } from "@/lib/types";

export type Over100Issue = {
  key: string;
  kind: "score" | "weight" | "weights" | "average";
  detail: string;
};

export function collectOver100(
  courses: CalculatorCourse[],
  averages: { term1: number | null; term2: number | null; combined: number | null },
): Over100Issue[] {
  const issues: Over100Issue[] = [];

  for (const course of courses) {
    const code = course.code.trim() || "Untitled course";
    const weightTotal = course.components.reduce((sum, row) => sum + (Number(row.weight) || 0), 0);
    if (weightTotal > 100) {
      issues.push({
        key: `weights:${course.id}`,
        kind: "weights",
        detail: `${code} weights add to ${round1(weightTotal)}%. They usually add to 100%.`,
      });
    }
    for (const row of course.components) {
      const name = row.name.trim() || "a component";
      if (row.weight !== "" && Number(row.weight) > 100) {
        issues.push({
          key: `weight:${course.id}:${row.id}`,
          kind: "weight",
          detail: `${code} · ${name} weight is ${round1(Number(row.weight))}%.`,
        });
      }
      if (row.score !== "" && Number(row.score) > 100) {
        issues.push({
          key: `score:${course.id}:${row.id}`,
          kind: "score",
          detail: `${code} · ${name} score is ${round1(Number(row.score))}%.`,
        });
      }
    }
    const percent = componentPercent(course.components);
    if (percent !== null && percent > 100) {
      issues.push({
        key: `course:${course.id}`,
        kind: "average",
        detail: `${code} is at ${round1(percent)}%.`,
      });
    }
  }

  if (averages.term1 !== null && averages.term1 > 100) {
    issues.push({
      key: "avg:term1",
      kind: "average",
      detail: `Term 1 average is ${round1(averages.term1)}%.`,
    });
  }
  if (averages.term2 !== null && averages.term2 > 100) {
    issues.push({
      key: "avg:term2",
      kind: "average",
      detail: `Term 2 average is ${round1(averages.term2)}%.`,
    });
  }
  if (averages.combined !== null && averages.combined > 100) {
    issues.push({
      key: "avg:combined",
      kind: "average",
      detail: `Winter average is ${round1(averages.combined)}%.`,
    });
  }

  return issues;
}

export function over100IssueKey(issues: Over100Issue[]): string {
  return issues
    .map((issue) => issue.key)
    .sort()
    .join("|");
}

export function courseHasOver100(course: CalculatorCourse): boolean {
  return collectOver100([course], { term1: null, term2: null, combined: null }).length > 0;
}

export function CalculatorOverNotice({
  issues,
  onClose,
}: {
  issues: Over100Issue[];
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const listed = issues.slice(0, 5);
  const extra = issues.length - listed.length;
  const title = noticeTitle(issues);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => closeRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
  }, [onClose]);

  const frame = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close over 100 notice"
        className="absolute inset-0 bg-[#142033]/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] border-2 border-[#142033] bg-[#f4f1ea] shadow-[8px_8px_0_#142033]"
      >
        <div className="border-b-2 border-[#142033] bg-white px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-[#b42318]">Over 100%</p>
          <h2 id={titleId} className="mt-1 text-2xl font-black tracking-tight">
            {title}
          </h2>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm leading-6 text-[var(--muted)] sm:px-6">
          <p>
            A percent over 100 is unusual. Check the syllabus weights add to 100, and that each
            score is out of 100 — unless bonus marks are real.
          </p>
          <ul className="space-y-1.5 font-semibold text-[var(--ink)]">
            {listed.map((issue) => (
              <li key={issue.key}>{issue.detail}</li>
            ))}
          </ul>
          {extra > 0 ? <p>And {extra} more.</p> : null}
        </div>
        <div className="flex justify-end border-t-2 border-[#142033] bg-white px-5 py-3 sm:px-6">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-[#142033] bg-[#f2d45c] px-5 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(frame, document.body);
}

function noticeTitle(issues: Over100Issue[]): string {
  const kinds = new Set(issues.map((issue) => issue.kind));
  const onlyWeights = [...kinds].every((kind) => kind === "weight" || kind === "weights");
  const onlyScores = [...kinds].every((kind) => kind === "score" || kind === "average");
  if (onlyWeights) return "Weights add to more than 100%";
  if (onlyScores) return "A score is over 100%";
  return "A number is over 100%";
}
