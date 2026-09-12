import { SiteHeader } from "@/components/SiteHeader";
import { UbcSideRails } from "@/components/UbcSideRails";

export function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full bg-[var(--paper)] text-[var(--ink)]">
      <UbcSideRails />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-8 py-10 sm:px-10">{children}</main>
      <footer className="relative z-10 border-t border-[var(--line)] px-8 py-6 text-center text-xs text-[var(--muted)] sm:px-10">
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
