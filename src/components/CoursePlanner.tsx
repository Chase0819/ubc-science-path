"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MajorMark } from "@/components/MajorMark";
import { SPECIALIZATIONS } from "@/lib/specializations";
import type { Specialization } from "@/lib/types";

const GROUPS: { title: string; hint: string; ids: string[] }[] = [
  {
    title: "Computing",
    hint: "Computer Science umbrella — you may rank at most two of these.",
    ids: [
      "cpsc",
      "masc",
      "cogs-cid",
      "cpsc-math",
      "cpsc-stat",
      "cpsc-phys",
      "cpsc-chem",
      "cpsc-biol",
      "cpsc-mbim",
      "cpsc-nsci",
    ],
  },
  {
    title: "Math, stats, and data",
    hint: "Numbers, models, and Data Science.",
    ids: ["math", "stat", "dsci", "stat-econ"],
  },
  {
    title: "Life science and health",
    hint: "Cells, organisms, and pre-health paths.",
    ids: ["biol", "mbim", "pcth", "caps", "bioc", "chem-biol"],
  },
  {
    title: "Brain and behaviour",
    hint: "Neuroscience and Cognitive Systems.",
    ids: ["nsci", "cogs-brain"],
  },
  {
    title: "Chemistry",
    hint: "Molecules, labs, and combined chemistry options.",
    ids: ["chem", "bioc-chem"],
  },
  {
    title: "Physics and space",
    hint: "Lecture-plus-lab physics and related majors.",
    ids: ["phys", "astr", "atsc", "geop"],
  },
  {
    title: "Earth, environment, and geography",
    hint: "Solid earth, oceans, climate, and landscapes.",
    ids: ["eosc", "geol", "geos", "ensc"],
  },
  {
    title: "Broad Science degrees",
    hint: "More flexibility, less of a single-department track.",
    ids: ["insc", "cmsc"],
  },
];

export function CoursePlanner() {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.toLowerCase().trim();
    const byId = new Map(SPECIALIZATIONS.map((spec) => [spec.id, spec]));
    const placed = new Set<string>();
    const sections = GROUPS.map((group) => {
      const specs = group.ids
        .map((id) => byId.get(id))
        .filter((spec): spec is Specialization => Boolean(spec))
        .filter((spec) => !q || spec.name.toLowerCase().includes(q));
      for (const spec of specs) placed.add(spec.id);
      return { ...group, specs };
    }).filter((group) => group.specs.length > 0);

    const leftover = SPECIALIZATIONS.filter(
      (spec) => !placed.has(spec.id) && (!q || spec.name.toLowerCase().includes(q)),
    );
    if (leftover.length > 0) {
      sections.push({
        title: "Other",
        hint: "Still in the Faculty of Science list.",
        ids: leftover.map((spec) => spec.id),
        specs: leftover,
      });
    }
    return sections;
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
      {grouped.length === 0 ? (
        <p className="text-base font-medium text-[var(--muted)]">No major matches that search.</p>
      ) : (
        <div className="space-y-10">
          {grouped.map((group, index) => (
            <section key={group.title}>
              {index > 0 ? (
                <div className="mb-8 border-t-2 border-dashed border-[#142033]" />
              ) : null}
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-2xl font-black tracking-tight">{group.title}</h2>
                <p className="text-sm font-semibold text-[var(--muted)]">{group.hint}</p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {group.specs.map((spec) => (
                  <li key={spec.id}>
                    <MajorCard spec={spec} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function MajorCard({ spec }: { spec: Specialization }) {
  return (
    <Link
      href={`/planner/${spec.id}`}
      transitionTypes={["nav-forward"]}
      className="flex items-start gap-3 rounded-[28px] border-2 border-[#142033] bg-white px-5 py-5 text-left shadow-[4px_4px_0_#142033] transition hover:-translate-y-0.5 hover:bg-[#fff8dc]"
    >
      <MajorMark id={spec.id} size={56} className="mt-0.5" />
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight">{spec.name}</p>
        <p className="mt-2 text-sm font-medium text-[var(--muted)]">
          {spec.kind.replace(/-/g, " ")}
          {spec.quota ? " · limited seats" : " · open seats"}
        </p>
        <p className="mt-4 text-base font-bold">See first year →</p>
      </div>
    </Link>
  );
}
