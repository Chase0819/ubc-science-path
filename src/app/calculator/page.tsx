import { GradeCalculator } from "@/components/GradeCalculator";

export default function CalculatorPage() {
  return (
    <div className="planner-chill calculator-chill space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold text-[#3d7a45]">Tool 2</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Grade calculator</h1>
        <p className="mt-3 text-lg leading-8 text-[var(--muted)]">
          Split courses into Term 1 and Term 2 the way the year actually runs. The combined winter
          average is credit-weighted percent — that is what Science uses for specialization
          ranking, not GPA.
        </p>
      </header>
      <GradeCalculator />
    </div>
  );
}
