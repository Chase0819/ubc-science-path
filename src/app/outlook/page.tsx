import { AdmissionOutlook } from "@/components/AdmissionOutlook";

export default function OutlookPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Major outlook</h1>
        <p className="mt-2 text-[var(--muted)]">
          Uses your planner courses and calculator average when they exist. This is a local
          model, not an admission decision.
        </p>
      </header>
      <AdmissionOutlook />
    </div>
  );
}
