import { CoursePlanner } from "@/components/CoursePlanner";
import { MajorMarkRow } from "@/components/MajorMark";

export default function PlannerPage() {
  return (
    <div className="planner-chill space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-bold text-[#8a7018]">Tool 1</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Pick a major</h1>
        <p className="mt-3 text-lg leading-8 text-[var(--muted)]">
          We’ll show the first-year courses in big type — including the “or” options — so you can
          build a timetable without squinting at the Calendar.
        </p>
        <div className="mt-5">
          <MajorMarkRow size={44} />
        </div>
      </header>
      <CoursePlanner />
    </div>
  );
}
