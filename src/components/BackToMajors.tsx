"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { popOutOfCard } from "@/lib/suck-into";

export function BackToMajors() {
  const router = useRouter();

  return (
    <Link
      href="/planner"
      onMouseEnter={() => router.prefetch("/planner")}
      onNavigate={(event) => event.preventDefault()}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        ) {
          return;
        }
        event.preventDefault();
        void popOutOfCard("/planner", () => router.push("/planner"));
      }}
      className="inline-flex text-base font-bold text-[var(--ink)]"
    >
      ← All majors
    </Link>
  );
}
