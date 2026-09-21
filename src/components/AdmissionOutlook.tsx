"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OutlookCutoffChart } from "@/components/OutlookCutoffChart";
import { HISTORICAL_CUTOFFS_URL, predictAdmission, type Chance } from "@/lib/admission-model";
import { gpaFromPercent, round1, round2 } from "@/lib/grades";
import { SPECIALIZATIONS } from "@/lib/specializations";
import { loadPlanner, loadSessional } from "@/lib/storage";

const chanceStyles: Record<Chance, string> = {
  blocked: "bg-[#fde8e6]",
  low: "bg-[#f8d0d0]",
  medium: "bg-[#f2d45c]",
  high: "bg-[#d8f0d7]",
};

const chanceWord: Record<Chance, string> = {
  blocked: "Blocked",
  low: "Low",
  medium: "Medium",
  high: "High",
};

const chanceKicker: Record<Chance, string> = {
  blocked: "Eligibility first",
  low: "Below recent years",
  medium: "Near the cutoff line",
  high: "Above recent years",
};

export function AdmissionOutlook() {
  const searchParams = useSearchParams();
  const [specId, setSpecId] = useState("cpsc");
  const [sessional, setSessional] = useState(78);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const planner = loadPlanner();
    const savedAvg = loadSessional();
    const fromQuery = searchParams.get("major");
    if (fromQuery && SPECIALIZATIONS.some((s) => s.id === fromQuery)) {
      setSpecId(fromQuery);
    } else if (planner.intended[0]) {
      setSpecId(planner.intended[0]);
    }
    if (savedAvg !== null) setSessional(savedAvg);
    setCompleted(planner.completed);
  }, [searchParams]);

  const spec = SPECIALIZATIONS.find((s) => s.id === specId) ?? SPECIALIZATIONS[0];
  const outlook = useMemo(
    () => predictAdmission({ spec, sessional, completed }),
    [spec, sessional, completed],
  );
  const gpa = gpaFromPercent(sessional);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033]">
          <span className="text-sm font-bold text-[var(--muted)]">Target specialization</span>
          <select
            className="mt-2 w-full rounded-2xl border-2 border-[#142033] bg-white px-3 py-2.5 font-bold outline-none"
            value={spec.id}
            onChange={(e) => setSpecId(e.target.value)}
          >
            {SPECIALIZATIONS.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033]">
          <span className="text-sm font-bold text-[var(--muted)]">Winter Session average (%)</span>
          <input
            className="mt-2 w-full rounded-2xl border-2 border-[#142033] bg-white px-3 py-2.5 font-black outline-none"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={sessional}
            onChange={(e) => setSessional(Number(e.target.value))}
          />
          <p className="mt-2 text-xs font-medium leading-5 text-[var(--muted)]">
            About {round2(gpa).toFixed(2)} GPA for {round1(sessional)}%. Placement uses percent,
            not GPA.
          </p>
        </label>
      </div>

      <section
        className={`rounded-[28px] border-2 border-[#142033] p-6 shadow-[4px_4px_0_#142033] sm:p-7 ${chanceStyles[outlook.chance]}`}
      >
        <p className="text-sm font-bold uppercase tracking-wide">{chanceKicker[outlook.chance]}</p>
        <p className="mt-2 text-5xl font-black tracking-tight sm:text-6xl">
          {chanceWord[outlook.chance]}
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">{outlook.headline}</h2>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#142033]/80">
          Based on published winter-session cutoffs, not a UBC decision. The graph below is the
          same evidence as the year-by-year list.
        </p>
      </section>

      <section className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033] sm:p-6">
        <p className="text-sm font-bold text-[#c62828]">Cutoff history</p>
        <h3 className="mt-1 text-2xl font-black tracking-tight">You vs published cutoffs</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Black is that year’s cutoff. The dashed green line is your {round1(sessional)}% winter
          average. Green stems mean you would have cleared that year; red stems mean you would
          have been short.
        </p>
        <OutlookCutoffChart spec={spec} sessional={sessional} />
        <a
          href={HISTORICAL_CUTOFFS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center rounded-full border-2 border-[#142033] bg-[#c62828] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_#142033]"
        >
          Official cutoffs for {spec.name}
        </a>
      </section>

      <section className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033] sm:p-6">
        <h3 className="text-2xl font-black tracking-tight">
          Why this reads {chanceWord[outlook.chance]}
        </h3>
        <ul className="mt-4 space-y-3">
          {outlook.reasons.map((reason, index) => {
            const last = index === outlook.reasons.length - 1;
            return (
              <li
                key={reason}
                className={`rounded-2xl border-2 border-[#142033] px-4 py-3 text-sm leading-6 ${
                  last
                    ? "border-[#c62828] bg-white font-black"
                    : "bg-[#f4f1ea] font-medium"
                }`}
              >
                {reason}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-[28px] border-2 border-[#142033] bg-[#f4f1ea] p-5 shadow-[4px_4px_0_#142033] sm:p-6">
        <h3 className="text-2xl font-black tracking-tight">How to read this</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          There is no public student-level training set, so this is not official. If eligibility
          is missing, the result is Blocked. Otherwise Low, Medium, or High comes from how your
          winter-session average sits against each published cutoff from recent years. Open / NF
          specializations read High once you are eligible.{" "}
          <strong className="text-[var(--ink)]">
            Cutoffs move with demand and seat counts — beating last year does not guarantee this
            year.
          </strong>
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Historical figures: UBC Faculty of Science, Historical BSc Specialization Admission
          Information (through 2026). Eligibility: BSc Specialization Application Requirements
          for the 2026 cycle.
        </p>
      </section>
    </div>
  );
}
