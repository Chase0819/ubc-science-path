"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CARD_RESERVE = 268;

const ALL_STEPS = [
  {
    target: "calendar",
    title: "Required first-year courses",
    body: "This list is what the Calendar asks this major to take in year one — same groups, including the “or” choices. Yellow stickers are last winter’s class average, not a cutoff. Read it first so you know what still has to land in a term.",
  },
  {
    target: "ap",
    title: "AP credit skips matching courses",
    body: "If you have AP Calculus, Chemistry, or Physics, tap those chips. The matching course turns green with an AP credit label. It already counts toward the major, so you do not drag it into Term 1 or Term 2.",
  },
  {
    target: "place",
    title: "Move leftover courses into a term",
    body: "Still to place is the waiting list. Drag a leftover course onto Term 1 or Term 2, or tap the Term buttons. That is how you turn the Calendar list into a winter timetable.",
  },
  {
    target: "terms",
    title: "This is your winter timetable",
    body: "These two boxes are the year you are building. Five courses in one term is a full Science load. A sixth pops a warning — you can keep it, but email Science Advising before you try to register.",
  },
  {
    target: "extras",
    title: "Graduation extras, not a first-year rush",
    body: "Arts credits, Science breadth, and the lab are B.Sc. rules you finish before you graduate. You can take none of them this winter. Open a box when you want a course — they are not required to fill first year.",
  },
  {
    target: "coop",
    title: "Co-op is optional — the deadline is not",
    body: "Use this box only if you want Co-op. Some majors can apply in first year; most wait. The timing and extra course live here, and Co-op admission is separate from getting into the major.",
  },
  {
    target: "recommended",
    title: "Optional electives for empty seats",
    body: "These are walk-in electives to fill a leftover seat — high winter averages, no university course first. Co-op prep stays on this list when this major has a first-year deadline. Skip anything that would drag your average down.",
  },
] as const;

function stepsOnPage() {
  return ALL_STEPS.filter((step) => document.querySelector(`[data-tutorial="${step.target}"]`));
}

type Hole = { top: number; left: number; width: number; height: number };

function holeFrom(el: Element | null): Hole | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 10;
  const top = Math.max(8, r.top - pad);
  const left = Math.max(8, r.left - pad);
  const right = Math.min(window.innerWidth - 8, r.right + pad);
  const bottom = Math.min(window.innerHeight - CARD_RESERVE, r.bottom + pad);
  const width = Math.max(48, right - left);
  const height = Math.max(48, bottom - top);
  return { top, left, width, height };
}

export function PlannerTutorial({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [steps] = useState(stepsOnPage);
  const [step, setStep] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);
  const last = step === steps.length - 1;
  const current = steps[step] ?? steps[0];
  const kicker =
    current && steps.length > 0 ? `Step ${step + 1} of ${steps.length}` : "";

  function finish() {
    onCloseRef.current();
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (event.key === "ArrowRight") setStep((n) => Math.min(steps.length - 1, n + 1));
      if (event.key === "ArrowLeft") setStep((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
    // finish reads a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length]);

  useEffect(() => {
    if (!current) return;
    const selector = `[data-tutorial="${current.target}"]`;
    const el = document.querySelector(selector);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
      inline: "nearest",
    });

    let frame = 0;
    const measure = () => {
      setHole(holeFrom(document.querySelector(selector)));
    };
    const start = window.setTimeout(measure, reduced ? 40 : 380);
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [current]);

  if (!current) return null;

  const frame = (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      <DimPanes hole={hole} />
      {hole ? (
        <div
          className="tutorial-loop-ring pointer-events-none absolute rounded-[28px] border-2 border-[#f2d45c]"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
        />
      ) : null}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pointer-events-auto absolute inset-x-3 bottom-3 z-10 mx-auto w-[min(100%,28rem)] overflow-hidden rounded-[28px] border-2 border-[#142033] bg-[#f4f1ea]/90 shadow-[8px_8px_0_#142033] backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
      >
        <div className="flex items-start justify-between gap-3 border-b-2 border-[#142033] bg-white/70 px-4 py-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#8a7018] uppercase">
              {kicker}
            </p>
            <h2 id={titleId} className="mt-0.5 text-lg font-black tracking-tight">
              {current.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={finish}
            className="rounded-full border-2 border-[#142033] bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#142033]"
          >
            Skip
          </button>
        </div>

        <div className="px-4 pt-3">
          {current.target === "place" ? <DragCue /> : null}
          <p className="text-sm leading-6 text-[var(--muted)]">{current.body}</p>
          <div className="mt-3 flex justify-center gap-1.5">
            {steps.map((item, i) => (
              <button
                key={item.target}
                type="button"
                aria-label={`Go to ${item.title}`}
                aria-current={i === step ? "step" : undefined}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === step ? "w-6 bg-[#142033]" : "w-2 bg-[#142033]/25"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-[#142033] bg-white/70 px-4 py-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((n) => Math.max(0, n - 1))}
            className="rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033] disabled:opacity-35"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (last ? finish() : setStep((n) => n + 1))}
            className="rounded-full border-2 border-[#142033] bg-[#f2d45c] px-5 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]"
          >
            {last ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(frame, document.body);
}

function DimPanes({ hole }: { hole: Hole | null }) {
  const dim = "pointer-events-none absolute bg-[#142033]/32 backdrop-blur-[2px]";
  if (!hole) return <div className={`${dim} inset-0`} />;
  return (
    <>
      <div className={dim} style={{ top: 0, left: 0, right: 0, height: hole.top }} />
      <div
        className={dim}
        style={{
          top: hole.top + hole.height,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        className={dim}
        style={{
          top: hole.top,
          left: 0,
          width: hole.left,
          height: hole.height,
        }}
      />
      <div
        className={dim}
        style={{
          top: hole.top,
          left: hole.left + hole.width,
          right: 0,
          height: hole.height,
        }}
      />
    </>
  );
}

function DragCue() {
  return (
    <div className="relative mb-3 h-16 overflow-hidden rounded-2xl border-2 border-[#142033] bg-white">
      <p className="absolute left-2 top-1.5 text-[9px] font-black text-[var(--muted)]">Still to place</p>
      <p className="absolute right-2 top-1.5 text-[9px] font-black text-[var(--muted)]">Term 1</p>
      <span className="tutorial-loop-place absolute left-2 top-7 rounded-full border-2 border-[#142033] bg-[#fff8d6] px-2 py-0.5 text-[8px] font-bold shadow-[2px_2px_0_#142033]">
        CPSC 110
      </span>
    </div>
  );
}
