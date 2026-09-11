import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Grade calculator" },
  { href: "/planner", label: "Course planner" },
  { href: "/outlook", label: "Major outlook" },
];

export function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[var(--navy)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            UBC Science Path
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-white/85 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-10">{children}</main>
      <footer className="border-t border-[var(--line)] px-5 py-6 text-center text-xs text-[var(--muted)]">
        Unofficial student tool. Course lists and cutoffs follow UBC Science pages
        for the 2026 specialization cycle and can change. Always confirm with the{" "}
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
