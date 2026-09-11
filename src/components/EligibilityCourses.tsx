import { courseByCode } from "@/lib/catalog";
import { round1 } from "@/lib/grades";
import type { CourseSlot, EligibilityView, SimpleSlot } from "@/lib/requirements";
import { ubcGradesUrl, type WinterAverage } from "@/lib/ubcgrades";

type Averages = Record<string, WinterAverage | null>;

export function EligibilityCourses({
  view,
  averages,
}: {
  view: EligibilityView;
  averages: Averages;
}) {
  if (view.empty) {
    return (
      <p className="rounded-2xl border border-[var(--line)] bg-white p-5 text-[15px] leading-7 text-[var(--muted)]">
        This specialization does not list extra first-year eligibility courses. You still need
        second-year standing (typically 24+ credits) before you can apply.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {view.scienceOneAlt && (
        <div className="rounded-2xl border border-[#d4b63a] bg-[#fff8dc] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8a7018]">
            Already in Science One?
          </p>
          <p className="mt-2 text-[15px] leading-7">
            Completing <strong>SCIE 001</strong> covers eligibility. You do not also take the
            list below.
          </p>
          <div className="mt-4">
            <CourseCard code="SCIE 001" averages={averages} />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {view.scienceOneAlt && (
          <p className="text-sm font-medium text-[var(--navy)]">
            If you are not in Science One, take every group below.
          </p>
        )}
        {view.slots.map((slot, index) => (
          <SlotBlock key={index} index={index + 1} slot={slot} averages={averages} />
        ))}
      </div>

      <p className="text-xs leading-5 text-[var(--muted)]">
        Winter averages are the UBC Vancouver <strong>OVERALL</strong> section from{" "}
        <a href="https://ubcgrades.com/" className="underline underline-offset-2">
          UBC Grades
        </a>
        , using the most recent Winter Session that has data. They are class averages, not
        cutoffs.
      </p>
    </div>
  );
}

function SlotBlock({
  index,
  slot,
  averages,
}: {
  index: number;
  slot: CourseSlot;
  averages: Averages;
}) {
  if (slot.kind === "simple") {
    return <SimpleBlock index={index} slot={slot} averages={averages} />;
  }

  return (
    <section className="space-y-3">
      <GroupLabel
        index={index}
        title="Choose one path"
        hint="Finish every course in a single path. You do not mix courses across paths."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {slot.paths.map((path) => (
          <article
            key={path.name}
            className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-4"
          >
            <p className="text-sm font-semibold">{path.name}</p>
            {path.slots.map((inner, innerIndex) => (
              <div key={innerIndex} className="space-y-2">
                {inner.chooseOne && (
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--navy)]">
                    Choose one
                  </p>
                )}
                <CourseStack
                  courses={inner.courses}
                  chooseOne={inner.chooseOne}
                  averages={averages}
                />
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

function SimpleBlock({
  index,
  slot,
  averages,
}: {
  index: number;
  slot: SimpleSlot;
  averages: Averages;
}) {
  return (
    <section className="space-y-3">
      <GroupLabel
        index={index}
        title={slot.chooseOne ? "Choose one of these" : "Take this course"}
        hint={
          slot.chooseOne
            ? "Any one course in this group is enough. Do not take two unless you want to."
            : "This course (or an approved equivalent already listed) is required."
        }
      />
      <CourseStack courses={slot.courses} chooseOne={slot.chooseOne} averages={averages} />
    </section>
  );
}

function GroupLabel({
  index,
  title,
  hint,
}: {
  index: number;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-semibold text-white">
        {index}
      </span>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-[var(--muted)]">{hint}</p>
      </div>
    </div>
  );
}

function CourseStack({
  courses,
  chooseOne,
  averages,
}: {
  courses: string[];
  chooseOne: boolean;
  averages: Averages;
}) {
  return (
    <div className="space-y-2">
      {courses.map((code, i) => (
        <div key={code}>
          {chooseOne && i > 0 && (
            <p className="my-1 text-center text-xs font-semibold tracking-widest text-[var(--gold)]">
              OR
            </p>
          )}
          <CourseCard code={code} averages={averages} />
        </div>
      ))}
    </div>
  );
}

export function CourseCard({
  code,
  averages,
}: {
  code: string;
  averages: Averages;
}) {
  const course = courseByCode(code);
  const avg = averages[code];

  return (
    <article className="rounded-xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold tracking-tight">{code}</p>
          <p className="text-sm text-[var(--muted)]">{course?.title ?? "UBC course"}</p>
        </div>
        {avg ? (
          <a
            href={ubcGradesUrl(code)}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg bg-[var(--paper)] px-3 py-2 text-right"
          >
            <p className="text-xl font-semibold tabular-nums">{round1(avg.average).toFixed(1)}%</p>
            <p className="text-[11px] leading-4 text-[var(--muted)]">
              {avg.session} overall
            </p>
          </a>
        ) : (
          <p className="max-w-[7rem] shrink-0 text-right text-[11px] leading-4 text-[var(--muted)]">
            No winter average on UBC Grades
          </p>
        )}
      </div>
      {course?.blurb ? (
        <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{course.blurb}</p>
      ) : null}
    </article>
  );
}
