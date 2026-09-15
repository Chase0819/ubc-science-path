"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { COURSES_PER_TERM } from "@/lib/electives";
import type { TermId } from "@/lib/term-plan";

const ADVISING = "https://science.ubc.ca/students/advising";

export function OverloadNotice({
  term,
  count,
  onClose,
}: {
  term: TermId;
  count: number;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const label = term === "term1" ? "Term 1" : "Term 2";

  useEffect(() => {
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
  }, [onClose]);

  const frame = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close overload notice"
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
          <p className="text-sm font-semibold text-[#8a7018]">Course load</p>
          <h2 id={titleId} className="mt-1 text-2xl font-black tracking-tight">
            {label} is now over {COURSES_PER_TERM} courses
          </h2>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm leading-6 text-[var(--muted)] sm:px-6">
          <p>
            You have <span className="font-bold text-[var(--ink)]">{count}</span> courses in{" "}
            {label}. We do not recommend taking more than {COURSES_PER_TERM} in one term —
            that is already a full Science load, and Workday often blocks a sixth course
            until an advisor raises your credit limit.
          </p>
          <p>
            If you still want this many, keep them on the plan — but remember to email your
            Science advisor (or use the Science Advising contact form) before you try to
            register.
          </p>
          <p>
            <a
              href={ADVISING}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[var(--ink)] underline decoration-2 underline-offset-2"
            >
              Science Advising
            </a>
          </p>
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
