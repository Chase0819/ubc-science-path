import { ReportForm } from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <div className="planner-chill report-chill space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold text-[#6b3fa0]">Feedback</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Report a problem</h1>
        <p className="mt-3 text-lg leading-8 text-[var(--muted)]">
          Pick Home, Grade calculator, Course planner, or Major outlook. Say what broke, then
          press Report. It emails the student who built this site — not UBC.
        </p>
      </header>
      <ReportForm />
    </div>
  );
}
