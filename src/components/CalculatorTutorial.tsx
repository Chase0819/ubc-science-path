"use client";

import { useState } from "react";
import { SpotlightTutorial } from "@/components/SpotlightTutorial";

const ALL_STEPS = [
  {
    target: "averages",
    title: "Three winter averages",
    body: "Term 1 is Sep–Dec. Term 2 is Jan–Apr. Combined is credit-weighted percent across both — that is what Science uses for specialization ranking, not GPA. Set a target on each box. The gap sits next to the average. If Term 1 is in and you set a winter target, the yellow box tells you what Term 2 has to be.",
  },
  {
    target: "combined",
    title: "Deep analysis on each box",
    body: "Open Deep analysis to rank your courses high to low, see the latest campus winter overall from UBC Grades, and compare the gap on a line graph. Component averages include names you created, like Quiz.",
  },
  {
    target: "search",
    title: "Search by course id",
    body: "Type MATH 100 or CPSC 110. The list is 100- and 200-level Science so the site stays small, including 200s in case AP already covered a 100.",
  },
  {
    target: "components",
    title: "Target, weight, and score",
    body: "Each course has its own target %. Click a component box for Assignments, Midterm, Final, Attendance, or Lab — or create your own. Weight is the syllabus slice; score is what you got. Clear a weight to type 20, not 020.",
  },
  {
    target: "terms",
    title: "Term 1 and Term 2",
    body: "Add courses to the term you actually take them. The NOW badge is the term you are in. Move a course with the Term 1 / Term 2 chips if the timetable changes.",
  },
] as const;

function stepsOnPage() {
  return ALL_STEPS.filter((step) => document.querySelector(`[data-tutorial="${step.target}"]`));
}

export function CalculatorTutorial({ onClose }: { onClose: () => void }) {
  const [steps] = useState(stepsOnPage);
  return <SpotlightTutorial steps={steps} onClose={onClose} accent="green" />;
}
