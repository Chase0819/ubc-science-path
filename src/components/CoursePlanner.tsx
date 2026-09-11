"use client";

import { useEffect, useMemo, useState } from "react";
import { CATALOG } from "@/lib/catalog";
import {
  describeRequirement,
  meetsRequirement,
  missingPieces,
} from "@/lib/requirements";
import { SPECIALIZATIONS } from "@/lib/specializations";
import { loadPlanner, savePlanner } from "@/lib/storage";
import type { Specialization } from "@/lib/types";

export function CoursePlanner() {
  const [query, setQuery] = useState("");
  const [intended, setIntended] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadPlanner();
    setIntended(saved.intended);
    setCompleted(saved.completed);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePlanner({ intended, completed });
  }, [intended, completed, hydrated]);

  const selected = intended
    .map((id) => SPECIALIZATIONS.find((s) => s.id === id))
    .filter((s): s is Specialization => Boolean(s));

  const filtered = SPECIALIZATIONS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );

  const recommended = useMemo(() => {
    const set = new Set<string>();
    for (const spec of selected) {
      for (const code of spec.recommended) set.add(code);
    }
    return [...set];
  }, [selected]);

  function toggleIntended(id: string) {
    setIntended((list) =>
      list.includes(id)
        ? list.filter((x) => x !== id)
        : list.length >= 3
          ? list
          : [...list, id],
    );
  }

  function toggleCourse(code: string) {
    setCompleted((list) =>
      list.includes(code) ? list.filter((x) => x !== code) : [...list, code],
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <label className="grid gap-1 text-sm">
          Search specializations
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Computer Science, Biology, Neuroscience…"
          />
        </label>
        <p className="text-sm text-[var(--muted)]">
          Rank up to three choices, the same way the BSc specialization application works.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {filtered.map((spec) => {
            const on = intended.includes(spec.id);
            const rank = intended.indexOf(spec.id) + 1;
            const ok = meetsRequirement(spec.eligibility, completed);
            return (
              <li key={spec.id}>
                <button
                  type="button"
                  onClick={() => toggleIntended(spec.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left ${
                    on
                      ? "border-[var(--navy)] bg-[var(--navy-soft)]"
                      : "border-[var(--line)] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{spec.name}</span>
                    {on && (
                      <span className="rounded-full bg-[var(--navy)] px-2 py-0.5 text-xs text-white">
                        #{rank}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {spec.kind.replace("-", " ")}
                    {spec.quota ? " · quota" : " · no quota"}
                    {ok ? " · eligibility met" : " · missing courses"}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-semibold">Eligibility for your choices</h2>
          {selected.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Pick a specialization to see first-year courses you must finish before applying.
            </p>
          ) : (
            <ul className="mt-3 space-y-4 text-sm">
              {selected.map((spec) => {
                const missing = missingPieces(spec.eligibility, completed);
                const ok = missing.length === 0;
                return (
                  <li key={spec.id}>
                    <p className="font-medium">{spec.name}</p>
                    <p className="text-[var(--muted)]">
                      {describeRequirement(spec.eligibility)}
                    </p>
                    <p className={ok ? "text-emerald-800" : "text-amber-800"}>
                      {ok ? "Ready to apply on courses." : `Still need: ${missing.join("; ")}`}
                    </p>
                    {spec.notes.map((note) => (
                      <p key={note} className="mt-1 text-xs text-[var(--muted)]">
                        {note}
                      </p>
                    ))}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-semibold">Courses you have finished</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            SCIE 001 covers most eligibility lists. Tick what you will have by the end of Term 2.
          </p>
          <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto text-sm">
            {(recommended.length
              ? CATALOG.filter(
                  (c) => recommended.includes(c.code) || completed.includes(c.code),
                )
              : CATALOG
            ).map((course) => (
              <li key={course.code}>
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={completed.includes(course.code)}
                    onChange={() => toggleCourse(course.code)}
                  />
                  <span>
                    <span className="font-medium">{course.code}</span>{" "}
                    <span className="text-[var(--muted)]">{course.title}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        {recommended.length > 0 && (
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="font-semibold">Suggested first-year mix</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Eligibility courses plus typical Year 1 calendar courses. You do not need every
              calendar Year 1 course before applying.
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              {recommended.map((code) => (
                <li key={code}>
                  {code}
                  {completed.includes(code) ? " ✓" : ""}
                </li>
              ))}
            </ol>
          </section>
        )}
      </aside>
    </div>
  );
}
