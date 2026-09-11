"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { predictAdmission } from "@/lib/admission-model";
import { gpaFromPercent, round1, round2 } from "@/lib/grades";
import { SPECIALIZATIONS } from "@/lib/specializations";
import { loadPlanner, loadSessional } from "@/lib/storage";

const bandStyles: Record<string, string> = {
  blocked: "bg-red-50 text-red-900 border-red-200",
  reach: "bg-orange-50 text-orange-950 border-orange-200",
  possible: "bg-amber-50 text-amber-950 border-amber-200",
  competitive: "bg-sky-50 text-sky-950 border-sky-200",
  likely: "bg-emerald-50 text-emerald-950 border-emerald-200",
  open: "bg-emerald-50 text-emerald-950 border-emerald-200",
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
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Target specialization
          <select
            className="input"
            value={spec.id}
            onChange={(e) => setSpecId(e.target.value)}
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Winter Session average (%)
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={sessional}
            onChange={(e) => setSessional(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Approximate 4.33 GPA for {round1(sessional)}% is{" "}
        <strong className="text-[var(--ink)]">{round2(gpa).toFixed(2)}</strong>. Placement
        uses percent, not GPA.
      </p>

      <section
        className={`rounded-2xl border p-6 ${bandStyles[outlook.band]}`}
      >
        <p className="text-sm uppercase tracking-wide opacity-80">{outlook.band}</p>
        <h2 className="mt-1 text-2xl font-semibold">{outlook.headline}</h2>
        <p className="mt-4 text-5xl font-semibold tabular-nums">
          {Math.round(outlook.probability * 100)}%
        </p>
        <p className="mt-1 text-sm opacity-80">modelled chance of placement into this choice</p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[var(--navy)]"
            style={{ width: `${Math.round(outlook.probability * 100)}%` }}
          />
        </div>
        <p className="mt-4 text-sm leading-6">{outlook.detail}</p>
        <p className="mt-3 text-sm">{outlook.trend}</p>
        <p className="mt-2 text-sm">Latest published line: {outlook.latestLabel}</p>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm leading-6">
        <h3 className="font-semibold">How this small model works</h3>
        <p className="mt-2 text-[var(--muted)]">
          There is no public student-level training set, so this is not a neural net and it is
          not official. It is a local statistical model: eligibility is a hard gate, then a
          logistic curve is centred on a blend of the latest published cutoff and the historical
          mean, with width from year-to-year cutoff swing. Open / NF specializations score high
          once you are eligible. Cutoffs move with demand and seat counts — beating last year
          does not guarantee this year.
        </p>
        <p className="mt-2 text-[var(--muted)]">
          Historical figures: UBC Faculty of Science, Historical BSc Specialization Admission
          Information (through 2026). Eligibility: BSc Specialization Application Requirements
          for the 2026 cycle.
        </p>
      </section>
    </div>
  );
}
