"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SPECIALIZATIONS } from "@/lib/specializations";

export function CoursePlanner() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return SPECIALIZATIONS.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <label className="grid max-w-xl gap-1 text-sm">
        Search specializations
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Computer Science, Biology, Neuroscience…"
        />
      </label>
      <p className="text-sm text-[var(--muted)]">
        Open a major to see the first-year courses you must finish before you can apply.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((spec) => (
          <li key={spec.id}>
            <Link
              href={`/planner/${spec.id}`}
              transitionTypes={["nav-forward"]}
              className="block rounded-xl border border-[var(--line)] bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--navy)]"
            >
              <span className="font-medium">{spec.name}</span>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {spec.kind.replace(/-/g, " ")}
                {spec.quota ? " · limited seats" : " · no quota"}
                {spec.umbrella ? ` · ${spec.umbrella.replace("-", " ")} umbrella` : ""}
              </p>
              <p className="mt-3 text-sm font-medium text-[var(--navy)]">
                See required courses →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
