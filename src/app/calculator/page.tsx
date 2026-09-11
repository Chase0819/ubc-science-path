import { GradeCalculator } from "@/components/GradeCalculator";

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Grade calculator</h1>
        <p className="mt-2 text-[var(--muted)]">
          Leave a component score blank to treat it as remaining work. The sessional average
          is saved for the major outlook page.
        </p>
      </header>
      <GradeCalculator />
    </div>
  );
}
