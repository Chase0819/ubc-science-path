"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { OutlookCutoffChart } from "@/components/OutlookCutoffChart";
import {
  HISTORICAL_CUTOFFS_URL,
  forecastCutoff,
  predictAdmission,
  term2Goals,
  type Chance,
} from "@/lib/admission-model";
import {
  componentPercent,
  creditWeighted,
  gpaFromPercent,
  parsePercentInput,
  round1,
  round2,
  sanitizePercentInput,
} from "@/lib/grades";
import { SPECIALIZATIONS } from "@/lib/specializations";
import { loadCalculator, loadPlanner, loadSessional } from "@/lib/storage";

const chanceStyles: Record<Chance, string> = {
  low: "bg-[#f8d0d0]",
  medium: "bg-[#f2d45c]",
  high: "bg-[#d8f0d7]",
};

const chanceWord: Record<Chance, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const chanceKicker: Record<Chance, string> = {
  low: "Below recent years",
  medium: "Near the cutoff line",
  high: "Above recent years",
};

export function AdmissionOutlook() {
  const searchParams = useSearchParams();
  const [specId, setSpecId] = useState("cpsc");
  const [sessionalInput, setSessionalInput] = useState("78");
  const [term1Input, setTerm1Input] = useState("");
  const [term1CreditsInput, setTerm1CreditsInput] = useState("15");
  const [term2CreditsInput, setTerm2CreditsInput] = useState("15");

  useEffect(() => {
    const planner = loadPlanner();
    const savedAvg = loadSessional();
    const calc = loadCalculator();
    const fromQuery = searchParams.get("major");
    if (fromQuery && SPECIALIZATIONS.some((s) => s.id === fromQuery)) {
      setSpecId(fromQuery);
    } else if (planner.intended[0]) {
      setSpecId(planner.intended[0]);
    }
    if (savedAvg !== null) setSessionalInput(sanitizePercentInput(String(savedAvg)));
    const term1 = creditWeighted(
      calc.courses
        .filter((course) => course.term === "term1" && course.code.trim())
        .map((course) => {
          const percent = componentPercent(course.components);
          return percent === null ? null : { percent, credits: course.credits || 0 };
        })
        .filter((row): row is { percent: number; credits: number } => row !== null && row.credits > 0),
    );
    const term2Credits = calc.courses
      .filter((course) => course.term === "term2" && course.code.trim())
      .reduce((sum, course) => sum + (course.credits || 0), 0);
    if (term1) {
      setTerm1Input(sanitizePercentInput(String(round1(term1.percent))));
      setTerm1CreditsInput(String(Math.max(1, Math.round(term1.credits))));
    }
    if (term2Credits > 0) setTerm2CreditsInput(String(Math.max(1, Math.round(term2Credits))));
  }, [searchParams]);

  const spec = SPECIALIZATIONS.find((s) => s.id === specId) ?? SPECIALIZATIONS[0];
  const sessional = parsePercentInput(sessionalInput);
  const outlook = useMemo(
    () => (sessional === null ? null : predictAdmission({ spec, sessional })),
    [spec, sessional],
  );
  const forecast = useMemo(() => forecastCutoff(spec), [spec]);
  const gpa = sessional === null ? null : gpaFromPercent(sessional);
  const term1 = parsePercentInput(term1Input);
  const term1Credits = Math.max(0, Number(term1CreditsInput) || 0);
  const term2Credits = Math.max(0, Number(term2CreditsInput) || 0);
  const goals = useMemo(
    () =>
      term1 === null || term1Credits <= 0 || term2Credits <= 0
        ? []
        : term2Goals(spec, term1, term1Credits, term2Credits),
    [spec, term1, term1Credits, term2Credits],
  );
  const currentIfTerm2 = (term2: number) =>
    term1 === null || term1Credits <= 0 || term2Credits <= 0
      ? null
      : round1((term1 * term1Credits + term2 * term2Credits) / (term1Credits + term2Credits));

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
            type="text"
            inputMode="decimal"
            placeholder="—"
            value={sessionalInput}
            onChange={(e) => {
              setSessionalInput(sanitizePercentInput(e.target.value));
            }}
          />
          <p className="mt-2 text-xs font-medium leading-5 text-[var(--muted)]">
            {sessional === null || gpa === null
              ? "Type a winter-session percent. Clearing the box leaves it empty — it will not snap back to 0."
              : `About ${round2(gpa).toFixed(2)} GPA for ${round1(sessional)}%. Placement uses percent, not GPA.`}
          </p>
        </label>
      </div>

      <section className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033] sm:p-6">
        <p className="text-sm font-bold text-[#c62828]">Term 2 target</p>
        <h3 className="mt-1 text-2xl font-black tracking-tight">What Term 2 needs for a higher chance</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Enter your Term 1 average. We solve for the Term 2 percent that would lift the
          credit-weighted winter average to Medium or High on past cutoffs. Credits default to
          15 and 15 — change them if the terms are uneven.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold">
            Term 1 average (%)
            <input
              className="w-full rounded-2xl border-2 border-[#142033] bg-white px-3 py-2.5 font-black outline-none"
              type="text"
              inputMode="decimal"
              placeholder="—"
              value={term1Input}
              onChange={(e) => setTerm1Input(sanitizePercentInput(e.target.value))}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Term 1 credits
            <input
              className="w-full rounded-2xl border-2 border-[#142033] bg-white px-3 py-2.5 font-black outline-none"
              type="text"
              inputMode="numeric"
              value={term1CreditsInput}
              onChange={(e) => setTerm1CreditsInput(sanitizeCreditsInput(e.target.value))}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Term 2 credits
            <input
              className="w-full rounded-2xl border-2 border-[#142033] bg-white px-3 py-2.5 font-black outline-none"
              type="text"
              inputMode="numeric"
              value={term2CreditsInput}
              onChange={(e) => setTerm2CreditsInput(sanitizeCreditsInput(e.target.value))}
            />
          </label>
        </div>
        {term1 === null ? (
          <p className="mt-4 text-sm font-medium text-[var(--muted)]">
            Add a Term 1 percent to see the Term 2 targets.
          </p>
        ) : goals.length === 0 ? (
          <p className="mt-4 text-sm font-medium leading-6 text-[var(--muted)]">
            Past cutoff pages do not give a Medium or High winter line for this major — often
            because it has no quota or recent years were unfilled.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {goals.map((goal) => {
              const winter = currentIfTerm2(Math.min(100, Math.max(0, goal.term2)));
              const word = chanceWord[goal.chance];
              return (
                <li
                  key={goal.chance}
                  className={`rounded-2xl border-2 border-[#142033] px-4 py-3 ${chanceStyles[goal.chance]}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide">{word} on past cutoffs</p>
                  {goal.already ? (
                    <p className="mt-1 text-sm font-medium leading-6">
                      Term 1 is already enough. Even a low Term 2 would keep winter at the{" "}
                      <strong>{word}</strong> line ({goal.winter.toFixed(1)}%).
                    </p>
                  ) : goal.unreachable ? (
                    <p className="mt-1 text-sm font-medium leading-6">
                      Even 100% in Term 2 may not reach <strong>{word}</strong>. That line needs a
                      winter average of {goal.winter.toFixed(1)}%.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm leading-6">
                      Term 2 needs about{" "}
                      <strong className="text-2xl font-black">{goal.term2.toFixed(1)}%</strong>
                      {winter !== null ? `, for a winter average near ${winter.toFixed(1)}%` : ""}.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs font-medium leading-5 text-[var(--muted)]">
          Same past-cutoff model as the chance word. Not a UBC decision, and Term 2 still has to
          actually land.
        </p>
      </section>

      <section
        className={`rounded-[28px] border-2 border-[#142033] p-6 shadow-[4px_4px_0_#142033] sm:p-7 ${
          outlook ? chanceStyles[outlook.chance] : "bg-[#f4f1ea]"
        }`}
      >
        <p className="text-sm font-bold uppercase tracking-wide">
          {outlook ? chanceKicker[outlook.chance] : "Add your average"}
        </p>
        <p className="mt-2 text-5xl font-black tracking-tight sm:text-6xl">
          {outlook ? chanceWord[outlook.chance] : "—"}
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">
          {outlook ? outlook.headline : "Enter a winter-session average to score the chance"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#142033]/80">
          We assume you already took the required courses. Low, Medium, and High come only from
          past published cutoffs — not from UBC.
        </p>
      </section>

      <section className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033] sm:p-6">
        <p className="text-sm font-bold text-[#c62828]">Cutoff history</p>
        <h3 className="mt-1 text-2xl font-black tracking-tight">You vs published cutoffs</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Black is that year’s cutoff. The dashed green line is your winter average
          {sessional === null ? "" : ` (${round1(sessional)}%)`}. Gold is a possible next-year
          cutoff from the published trend. Green stems mean you would have cleared that year; red
          stems mean you would have been short.
        </p>
        <OutlookCutoffChart spec={spec} sessional={sessional} forecast={forecast} />
        <a
          href={HISTORICAL_CUTOFFS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center rounded-full border-2 border-[#142033] bg-[#c62828] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_#142033]"
        >
          Official cutoffs for {spec.name}
        </a>
      </section>

      {outlook ? (
      <section className="rounded-[28px] border-2 border-[#142033] bg-white p-5 shadow-[4px_4px_0_#142033] sm:p-6">
        <h3 className="text-2xl font-black tracking-tight">
          Why this reads {chanceWord[outlook.chance]}
        </h3>
        <p className="mt-4 text-sm leading-7 text-[#142033]">
          {outlook.explanation.map((bit, index) =>
            bit.strong ? (
              <strong key={`${bit.text}-${index}`}>{bit.text}</strong>
            ) : (
              <span key={`${bit.text}-${index}`}>{bit.text}</span>
            ),
          )}
        </p>
      </section>
      ) : null}

      <section className="rounded-[28px] border-2 border-[#142033] bg-[#f4f1ea] p-5 shadow-[4px_4px_0_#142033] sm:p-6">
        <h3 className="text-2xl font-black tracking-tight">How to read this</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Outlook assumes the required courses are already done. Low, Medium, and High only
          compare your winter-session average with published past cutoffs, plus a simple trend
          from those same numbers. If you enter Term 1, the Term 2 targets are the percents that
          would lift the credit-weighted winter average to those same past-cutoff lines.{" "}
          <strong className="text-[var(--ink)]">
            This is not official, and beating a past cutoff does not guarantee this year.
          </strong>
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Historical figures: UBC Faculty of Science, Historical BSc Specialization Admission
          Information (through 2026).
        </p>
      </section>
    </div>
  );
}

function sanitizeCreditsInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return digits.replace(/^0+(?=\d)/, "");
}
