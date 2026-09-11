import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const yearPlan = [
  {
    when: "September – December",
    title: "Term 1: lock in the foundation",
    text: "Most first-year BSc students start communication (WRDS 150 or SCIE 113), differential calculus, and at least one lab science. If Computer Science is on your list, CPSC 110 belongs here — it is the eligibility course, not a nice-to-have.",
  },
  {
    when: "January – April",
    title: "Term 2: finish eligibility, not the whole Calendar",
    text: "Integral calculus, CHEM 123, a second biology or physics course, and anything still missing for the majors you might rank. Calendar “Year 1” lists are longer than eligibility lists. You do not need every listed first-year course before you apply.",
  },
  {
    when: "Late May – June",
    title: "Specialization application",
    text: "After you have second-year standing, you rank three specializations. UBC places eligible students by most recent Winter Session average. Summer courses usually do not count for that round, so Term 1 and Term 2 are the year that matters.",
  },
];

const paths = [
  {
    want: "If you want Biology, Neuroscience, or Microbiology",
    then: "first-year chemistry plus BIOL 112 has to be on the timetable. Calculus and communication still sit beside them.",
  },
  {
    want: "If you want Computer Science or a CS combined major",
    then: "CPSC 110 or 107 is the door. You can only rank two CS-umbrella choices, so a third rank should be a program whose courses you also finish.",
  },
  {
    want: "If you want Physics, Astronomy, or Atmospheric Science",
    then: "integral calculus and a physics lecture-plus-lab sequence are the eligibility core, not a full Calendar dump in September.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="relative isolate min-h-[28rem] overflow-hidden rounded-3xl text-white shadow-sm">
        <Image
          src="/photos/campus-hero.png"
          alt="Students walking through a Pacific Northwest university campus"
          fill
          priority
          sizes="(min-width: 80rem) 72rem, 100vw"
          className="hero-zoom object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,32,51,0.88)_15%,rgba(20,32,51,0.55)_70%,rgba(20,32,51,0.25))]" />
        <div className="hero-enter relative z-10 flex min-h-[28rem] flex-col justify-end gap-6 px-6 py-10 sm:px-10">
          <div className="flex items-center gap-3">
            <img src="/mark.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--gold)]">
                UBC Vancouver · Faculty of Science
              </p>
              <p className="text-xs text-white/70">Unofficial student guide · Science Path</p>
            </div>
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            First year is undeclared. Second year is a specialization. This is the year in between.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/85">
            You do not pick a major on day one. You take the right mix of courses, protect a
            Winter Session average, then apply in the spring. Science Path is built for that
            stretch of the BSc — not as an official UBC site, as a student-made companion.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#planner" className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-medium text-[var(--navy)]">
              Course planner
            </Link>
            <Link href="#calculator" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
              Grade calculator
            </Link>
            <Link href="#outlook" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
              Major outlook
            </Link>
          </div>
        </div>
      </section>

      <Reveal>
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[var(--line)]">
          <Image
            src="/photos/students-study.png"
            alt="Science students studying together with laptops and notes"
            fill
            sizes="(min-width: 1024px) 32rem, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--gold)]">
            What first year is actually for
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            You are building eligibility, credits, and an average — at the same time.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
            During first year in UBC Science, students are not locked into a major. You register
            as a BSc student, then spend Winter Session taking courses that do two jobs: they
            count toward promotion into second-year standing, and a smaller subset makes you
            eligible to apply for the specialization you want.
          </p>
          <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
            The UBC Calendar lists every first-year course a degree eventually wants.
            Specialization admission only cares about a shorter eligibility list, finished by
            the end of Term 2. Placement then uses your most recent Winter Session percentage —
            not a 4.0 GPA.
          </p>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section>
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--gold)]">
            What you should do this year
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            A practical first-year Science plan
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">
            You do not need a perfect four-year map in September. You do need an honest list of
            one to three specializations you might rank, then a timetable that keeps you eligible
            for all of them.
          </p>
        </div>
        <ol className="mt-8 space-y-5">
          {yearPlan.map((item, i) => (
            <li
              key={item.title}
              className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white p-6 md:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <p className="font-mono text-sm text-[var(--gold)]">0{i + 1}</p>
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{item.when}</p>
                <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      </Reveal>

      <Reveal>
      <section
        id="planner"
        className="scroll-mt-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-white"
      >
        <div className="h-2 bg-[#f2d45c]" />
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#b89620]">
              Tool 1 · Course planner
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Start from the major you might declare — then work backward to Term 1.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
              Different specializations ask for different first-year pieces. Open a major to
              see only the eligibility courses you must finish by the end of Winter Session —
              not a giant course catalog.
            </p>
            <ul className="mt-6 space-y-4">
              {paths.map((path) => (
                <li key={path.want} className="border-l-2 border-[#f2d45c] pl-4">
                  <p className="font-medium">{path.want}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{path.then}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/planner"
              transitionTypes={["nav-forward"]}
              className="mt-8 inline-flex rounded-full bg-[#f2d45c] px-5 py-2.5 text-sm font-medium text-[var(--ink)]"
            >
              Open the course planner
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/photos/campus-walk.png"
              alt="Students walking between campus buildings"
              fill
              sizes="(min-width: 1024px) 32rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section
        id="calculator"
        className="scroll-mt-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-white"
      >
        <div className="h-2 bg-[#c5e8c4]" />
        <div className="p-6 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#3d7a45]">
            Tool 2 · Grade calculator
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight">
            Know the Winter Session average while the year is still in progress.
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[var(--muted)]">
            UBC Science ranks eligible applicants on credit-weighted percent from the current
            Winter Session. The calculator lets you enter assignments, midterms, and finals as
            they come in, leave leftover work blank, and see the sessional average that actually
            gets used — plus a 4.33 GPA for your own tracking.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#eef7ee] p-5">
              <p className="text-sm font-semibold">Weighted course marks</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Split each course into components. Blank scores are treated as remaining work.
              </p>
            </div>
            <div className="rounded-2xl bg-[#eef7ee] p-5">
              <p className="text-sm font-semibold">Sessional average</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Credits pull the average, so a 4-credit lab science counts more than a 1-credit lab.
              </p>
            </div>
            <div className="rounded-2xl bg-[#eef7ee] p-5">
              <p className="text-sm font-semibold">Saved for outlook</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                The average carries into the major outlook page in this browser.
              </p>
            </div>
          </div>
          <Link
            href="/calculator"
            transitionTypes={["nav-forward"]}
            className="mt-8 inline-flex rounded-full bg-[#c5e8c4] px-5 py-2.5 text-sm font-medium text-[var(--ink)]"
          >
            Open the grade calculator
          </Link>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section
        id="outlook"
        className="scroll-mt-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-white"
      >
        <div className="h-2 bg-[#c62828]" />
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#c62828]">
              Tool 3 · Major outlook
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              See whether last year’s cutoff would have let you in.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
              Some programs admit every eligible student. Others have filled at high averages.
              Outlook checks eligibility from the planner first, then compares your sessional
              average with published 2022–2026 lines. Rank the program you want first, and keep
              two backups whose courses you also complete.
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
              It is a local model, not an admission decision. Use it to plan, then confirm with
              advising.
            </p>
            <Link
              href="/outlook"
              transitionTypes={["nav-forward"]}
              className="mt-8 inline-flex rounded-full bg-[#c62828] px-5 py-2.5 text-sm font-medium text-white"
            >
              Open major outlook
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f8ecec] p-6">
            <p className="text-sm font-medium text-[#c62828]">How to read it</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <li>
                <strong className="text-[var(--ink)]">Blocked</strong> — missing eligibility
                courses, so average does not matter yet.
              </li>
              <li>
                <strong className="text-[var(--ink)]">Reach / possible</strong> — eligible, but
                historically below the last cutoff.
              </li>
              <li>
                <strong className="text-[var(--ink)]">Likely / open</strong> — above recent
                cutoffs, or the program has no quota.
              </li>
            </ul>
          </div>
        </div>
      </section>
      </Reveal>
    </div>
  );
}
