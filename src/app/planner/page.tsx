import { CoursePlanner } from "@/components/CoursePlanner";

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Course planner</h1>
        <p className="mt-2 text-[var(--muted)]">
          Eligibility courses must be done by the end of Winter Session. Calendar “Year 1”
          lists are longer and do not all have to be finished before you apply.
        </p>
      </header>
      <CoursePlanner />
    </div>
  );
}
