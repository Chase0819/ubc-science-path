import Link from "next/link";

const features = [
  {
    href: "/calculator",
    title: "Grade calculator",
    body: "Build each course from assignments, midterms, and finals. Get a credit-weighted sessional average — the number UBC Science actually ranks — plus letter grades and a 4.33 GPA.",
  },
  {
    href: "/planner",
    title: "First-year course planner",
    body: "Pick up to three specializations. See the eligibility courses you must finish this year, what you can leave for later, and a suggested first-year mix.",
  },
  {
    href: "/outlook",
    title: "Major outlook model",
    body: "A small on-device model estimates whether your winter-session average and completed courses would have been competitive against published 2022–2026 cutoffs.",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--gold)]">
          UBC first-year science
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Plan the year, know the average, rank the major.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Built for BSc students who need three things in one place: a serious grade
          calculator, a map from first-year courses to second-year specializations, and an
          honest read on how competitive that specialization has been.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--navy)]"
          >
            <h2 className="text-xl font-semibold">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{feature.body}</p>
            <p className="mt-5 text-sm font-medium text-[var(--navy)]">Open →</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
