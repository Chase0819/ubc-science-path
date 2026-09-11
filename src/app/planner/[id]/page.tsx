import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCard, EligibilityCourses } from "@/components/EligibilityCourses";
import { codesFromView, eligibilityView } from "@/lib/requirements";
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

  const view = eligibilityView(spec.eligibility);
  const averages = await getWinterAverages([
    ...codesFromView(view),
    ...spec.recommended,
  ]);

  return (
    <div className="space-y-8">
      <Link
        href="/planner"
        transitionTypes={["nav-back"]}
        className="text-sm font-medium text-[var(--navy)] hover:underline"
      >
        ← All specializations
      </Link>

      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#b89620]">
          {spec.kind.replace(/-/g, " ")}
          {spec.quota ? " · limited seats" : " · no quota"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{spec.name}</h1>
        <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">
          Direct list of courses that make you <strong className="font-medium text-[var(--ink)]">eligible to apply</strong>.
          Finish them by the end of Winter Session. Groups marked “choose one” mean any single
          option is enough.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">Courses to take</h2>
        <div className="mt-4">
          <EligibilityCourses view={view} averages={averages} />
        </div>
      </section>

      {spec.recommended.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Typical first-year mix</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Useful alongside eligibility. You do not need every item here before you apply.
          </p>
          <ul className="mt-4 space-y-3">
            {spec.recommended.map((code) => (
              <li key={code}>
                <CourseCard code={code} averages={averages} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {spec.notes.length > 0 && (
        <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="text-xl font-semibold">Notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted)]">
            {spec.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/outlook?major=${spec.id}`}
        transitionTypes={["nav-forward"]}
        className="inline-flex rounded-full bg-[#f2d45c] px-5 py-2.5 text-sm font-medium text-[var(--ink)]"
      >
        Check outlook for {spec.name}
      </Link>
    </div>
  );
}
