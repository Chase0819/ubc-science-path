"use client";

import { useState } from "react";
import { SpotlightTutorial } from "@/components/SpotlightTutorial";

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

export function PlannerTutorial({ onClose }: { onClose: () => void }) {
  const [steps] = useState(stepsOnPage);
  return (
    <SpotlightTutorial
      steps={steps}
      onClose={onClose}
      accent="gold"
      cue={(target) => (target === "place" ? <DragCue /> : null)}
    />
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
