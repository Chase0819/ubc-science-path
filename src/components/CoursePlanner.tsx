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
      <label className="grid max-w-xl gap-2 text-base font-semibold">
        Search
        <input
          className="input rounded-full border-2 border-[#142033] px-5 py-3 text-base shadow-[3px_3px_0_#142033]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Computer Science, Biology, Neuroscience…"
        />
      </label>
      <ul className="grid gap-4 sm:grid-cols-2">
        {filtered.map((spec) => (
          <li key={spec.id}>
            <Link
              href={`/planner/${spec.id}`}
              transitionTypes={["nav-forward"]}
              className="block rounded-[28px] border-2 border-[#142033] bg-white px-5 py-5 text-left shadow-[4px_4px_0_#142033] transition hover:-translate-y-0.5 hover:bg-[#fff8dc]"
            >
              <span className="text-xl font-bold tracking-tight">{spec.name}</span>
              <p className="mt-2 text-sm font-medium text-[var(--muted)]">
                {spec.kind.replace(/-/g, " ")}
                {spec.quota ? " · limited seats" : " · open seats"}
              </p>
              <p className="mt-4 text-base font-bold">See first year →</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
