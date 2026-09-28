"use client";

import { useState } from "react";
import { SpotlightTutorial } from "@/components/SpotlightTutorial";

const ALL_STEPS = [
  {
    target: "inputs",
    title: "Pick a major and a winter average",
    body: "Choose the specialization you want. Then type a winter-session percent — Term 1 plus Term 2, credit-weighted, which is what Science uses, not GPA. The calculator fills this in when you have one saved. Clearing the box leaves it empty.",
  },
  {
    target: "term2",
    title: "What Term 2 still has to be",
    body: "If Term 1 is in, this box solves for the Term 2 percent that would lift the credit-weighted winter average to Medium or High on past cutoffs. Credits default to 15 and 15 — change them if the terms are uneven.",
  },
  {
    target: "chance",
    title: "Low, Medium, or High — not a percent",
    body: "We assume the required courses are already done. The word only compares your winter average with published past cutoffs, plus a simple trend from those same numbers. It is not an admission decision.",
  },
  {
    target: "chart",
    title: "You vs published cutoffs",
    body: "Black is that year’s cutoff. The dashed green line is your winter average. Gold is a possible next-year cutoff from the published trend. Green stems mean you would have cleared that year; red stems mean you would have been short. The red button opens Science’s official cutoff page.",
  },
  {
    target: "why",
    title: "Why it reads that way",
    body: "This paragraph is the evidence: which published years you would have cleared, and how far you sit from the latest cutoff and the trend. Important lines are bold. It is still only past cutoffs — not a UBC decision.",
  },
  {
    target: "read",
    title: "How to read the whole page",
    body: "Beating a past cutoff does not guarantee this year. Confirm the Calendar, Workday, and Science’s own cutoff table before you plan around any of these numbers.",
  },
] as const;

function stepsOnPage() {
  return ALL_STEPS.filter((step) => document.querySelector(`[data-tutorial="${step.target}"]`));
}

export function OutlookTutorial({ onClose }: { onClose: () => void }) {
  const [steps] = useState(stepsOnPage);
  return <SpotlightTutorial id="outlook" steps={steps} onClose={onClose} accent="red" />;
}
