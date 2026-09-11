import { SiteHeader } from "@/components/SiteHeader";

export function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[var(--paper)] text-[var(--ink)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">{children}</main>
      <footer className="border-t border-[var(--line)] px-5 py-6 text-center text-xs text-[var(--muted)]">
        Unofficial student tool, not affiliated with UBC. Course lists and cutoffs
        follow Faculty of Science pages for the 2026 specialization cycle and can
        change. Always confirm with the{" "}
        <a
          className="underline"
          href="https://science.ubc.ca/students/spec-admission-requirements"
        >
          Faculty of Science
        </a>
        .
      </footer>
    </div>
  );
}
