import { Suspense } from "react";
import { AdmissionOutlook } from "@/components/AdmissionOutlook";
import { OutlookDecor } from "@/components/OutlookDecor";

export default function OutlookPage() {
  return (
    <div className="planner-chill outlook-chill space-y-8">
      <header className="relative">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-[#c62828]">Tool 3</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Major outlook</h1>
          <p className="mt-3 text-lg leading-8 text-[var(--muted)]">
            Uses your calculator average when it exists. We assume you already took the required
            courses. Chance is Low, Medium, or High from past published cutoffs only — not an
            admission decision.
          </p>
        </div>
        <OutlookDecor />
      </header>
      <Suspense fallback={<p className="text-[var(--muted)]">Loading outlook…</p>}>
        <AdmissionOutlook />
      </Suspense>
    </div>
  );
}
