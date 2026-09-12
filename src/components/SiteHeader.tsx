"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageChrome } from "@/lib/page-chrome";

const links = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Grade calculator" },
  { href: "/planner", label: "Course planner" },
  { href: "/outlook", label: "Major outlook" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const theme = pageChrome(pathname);

  return (
    <header className="site-header">
      <div className={`site-header-bar ${theme.bar}`}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-8 py-4 sm:px-10">
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
      </div>
      <svg className="site-header-wave" viewBox="0 0 1200 48" preserveAspectRatio="none" aria-hidden>
        <path
          fill={theme.rail}
          d="M0 0h1200v10C1050 46 930 6 780 28 630 50 510 4 360 26 210 48 90 8 0 24V0Z"
        />
      </svg>
    </header>
  );
}
