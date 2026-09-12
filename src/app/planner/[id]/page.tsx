import Link from "next/link";
import { notFound } from "next/navigation";
import { BackToMajors } from "@/components/BackToMajors";
import { MajorCoursePlan } from "@/components/MajorCoursePlan";
import { MajorMark } from "@/components/MajorMark";
import { codesFromPlan, getFirstYearPlan } from "@/lib/first-year-plans";
import { applyView } from "@/lib/requirements";
import { SPECIALIZATIONS, specializationById } from "@/lib/specializations";
import { getWinterAverages } from "@/lib/ubcgrades";

export const revalidate = 86400;

export function generateStaticParams() {
  return SPECIALIZATIONS.map((spec) => ({ id: spec.id }));
}

export default async function MajorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const spec = specializationById(id);
  if (!spec) notFound();

  const view = applyView(spec.eligibility);
  const plan = getFirstYearPlan(spec, view);
  const averages = await getWinterAverages([
    ...codesFromPlan(plan),
    "WRDS 150",
    ...(view.scienceOneAlt ? ["SCIE 001"] : []),
  ]);

  return (
    <div className="planner-chill space-y-8">
      <BackToMajors />

      <header className="max-w-3xl">
        <p className="text-sm font-bold text-[#8a7018]">
          {spec.kind.replace(/-/g, " ")}
          {spec.quota ? " · limited seats" : " · no quota"}
        </p>
        <h1 className="mt-2 flex items-start gap-3 text-4xl font-black tracking-tight sm:items-center sm:text-5xl">
          <MajorMark id={spec.id} size={56} className="mt-1 sm:mt-0" />
          <span>{spec.name}</span>
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
          First-year courses live at the top. Build Term 1 and Term 2 at the bottom — AP credit
          counts toward the bar. Yellow stickers are last winter’s class average.
        </p>
      </header>

      <MajorCoursePlan
        specId={spec.id}
        plan={plan}
        scienceOne={view.scienceOneAlt}
        averages={averages}
      />

      {spec.notes.length > 0 && (
        <section className="rounded-[28px] border-2 border-[#142033] bg-white p-6 shadow-[4px_4px_0_#142033]">
          <h2 className="text-xl font-bold">Heads up</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7">
            {spec.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/outlook?major=${spec.id}`}
        transitionTypes={["nav-forward"]}
        className="inline-flex rounded-full border-2 border-[#142033] bg-[#f2d45c] px-6 py-3 text-base font-bold shadow-[3px_3px_0_#142033]"
      >
        Check outlook for {spec.name}
      </Link>
    </div>
  );
}
