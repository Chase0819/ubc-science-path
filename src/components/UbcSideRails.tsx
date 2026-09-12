"use client";

import { usePathname } from "next/navigation";
import { pageChrome } from "@/lib/page-chrome";

/** Simplified UBC sun — reads at small size better than the full shield. */
function UbcSun() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 - 90) * Math.PI) / 180;
    return (
      <line
        key={i}
        x1={12 + Math.cos(a) * 6.2}
        y1={12 + Math.sin(a) * 6.2}
        x2={12 + Math.cos(a) * 10.2}
        y2={12 + Math.sin(a) * 10.2}
      />
    );
  });

  return (
    <svg viewBox="0 0 24 24" className="ubc-rail-sun" aria-hidden>
      <circle cx="12" cy="12" r="3.6" />
      {rays}
    </svg>
  );
}

function RailColumn({ copies }: { copies: number }) {
  return (
    <div className="ubc-rail-track">
      {Array.from({ length: copies }, (_, i) => (
        <div key={i} className="ubc-rail-bead">
          <UbcSun />
          <span className="ubc-rail-word-wrap">
            <span className="ubc-rail-word">UBC</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function UbcSideRails() {
  const theme = pageChrome(usePathname());

  return (
    <div className="ubc-rails" aria-hidden>
      <div
        className="ubc-rail ubc-rail-left"
        style={{ background: theme.rail, color: theme.ink }}
      >
        <RailColumn copies={16} />
      </div>
      <div
        className="ubc-rail ubc-rail-right"
        style={{ background: theme.rail, color: theme.ink }}
      >
        <RailColumn copies={16} />
      </div>
    </div>
  );
}
