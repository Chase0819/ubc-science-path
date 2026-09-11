"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Grade calculator" },
  { href: "/planner", label: "Course planner" },
  { href: "/outlook", label: "Major outlook" },
];

function headerTheme(pathname: string) {
  if (pathname.startsWith("/calculator")) {
    return {
      bar: "bg-[#c5e8c4] text-[#142033] border-[#9cc59a]",
      hover: "hover:bg-black/10",
      active: "bg-black/10",
    };
  }
  if (pathname.startsWith("/planner")) {
    return {
      bar: "bg-[#f2d45c] text-[#142033] border-[#d4b63a]",
      hover: "hover:bg-black/10",
      active: "bg-black/10",
    };
  }
  if (pathname.startsWith("/outlook")) {
    return {
      bar: "bg-[#c62828] text-white border-[#9e1e1e]",
      hover: "hover:bg-white/10",
      active: "bg-white/15",
    };
  }
  return {
    bar: "bg-[var(--navy)] text-white border-[var(--navy)]",
    hover: "hover:bg-white/10",
    active: "bg-white/15",
  };
}

export function SiteHeader() {
  const pathname = usePathname();
  const theme = headerTheme(pathname);

  return (
    <header
      className={`border-b transition-colors duration-500 ${theme.bar}`}
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <img src="/mark.svg" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
          UBC Science Path
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((link) => {
            const on =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                transitionTypes={link.href === "/" ? ["nav-back"] : ["nav-forward"]}
                className={`rounded-full px-3 py-1.5 ${theme.hover} ${on ? theme.active : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
