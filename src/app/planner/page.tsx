import { CoursePlanner } from "@/components/CoursePlanner";

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Course planner</h1>
        <p className="mt-2 text-[var(--muted)]">
          Choose a specialization to see the eligibility courses you must finish by the end of
          Winter Session.
        </p>
      </header>
      <CoursePlanner />
    </div>
  );
}
