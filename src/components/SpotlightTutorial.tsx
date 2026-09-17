"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const CARD_RESERVE = 268;

export type SpotlightStep = {
  target: string;
  title: string;
  body: string;
};

type Accent = "gold" | "green";

const THEME: Record<
  Accent,
  { kicker: string; ring: string; next: string }
> = {
  gold: {
    kicker: "text-[#8a7018]",
    ring: "tutorial-loop-ring border-[#f2d45c]",
    next: "bg-[#f2d45c]",
  },
  green: {
    kicker: "text-[#3d7a45]",
    ring: "tutorial-loop-ring-green border-[#3d7a45]",
    next: "bg-[#c5e8c4]",
  },
};

type Hole = { top: number; left: number; width: number; height: number };

function holeFrom(el: Element | null): Hole | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 10;
  const top = Math.max(8, r.top - pad);
  const left = Math.max(8, r.left - pad);
  const right = Math.min(window.innerWidth - 8, r.right + pad);
  const bottom = Math.min(window.innerHeight - CARD_RESERVE, r.bottom + pad);
  const width = Math.max(48, right - left);
  const height = Math.max(48, bottom - top);
  return { top, left, width, height };
}

export function SpotlightTutorial({
  steps,
  onClose,
  accent = "gold",
  cue,
}: {
  steps: readonly SpotlightStep[];
  onClose: () => void;
  accent?: Accent;
  cue?: (target: string) => ReactNode;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [step, setStep] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);
  const lockY = useRef<number | null>(null);
  const returnTop = useRef(false);
  const last = step === steps.length - 1;
  const current = steps[step] ?? steps[0];
  const kicker =
    current && steps.length > 0 ? `Step ${step + 1} of ${steps.length}` : "";
  const target = current?.target;
  const theme = THEME[accent];

  function finish() {
    returnTop.current = true;
    onCloseRef.current();
  }

  useEffect(() => {
    const html = document.documentElement;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (event.key === "ArrowRight") setStep((n) => Math.min(steps.length - 1, n + 1));
      if (event.key === "ArrowLeft") setStep((n) => Math.max(0, n - 1));
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "PageUp" ||
        event.key === "PageDown" ||
        event.key === "Home" ||
        event.key === "End" ||
        (event.key === " " && !(event.target instanceof HTMLButtonElement))
      ) {
        event.preventDefault();
      }
    };
    const block = (event: Event) => event.preventDefault();
    const freeze = () => {
      if (lockY.current == null) return;
      if (window.scrollY !== lockY.current) {
        window.scrollTo({ top: lockY.current, behavior: "instant" });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("scroll", freeze, { capture: true });
    const focus = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("scroll", freeze, true);
      window.clearTimeout(focus);
    };
    // finish reads a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length]);

  useEffect(() => {
    if (!target) return;
    const html = document.documentElement;
    const body = document.body;
    const selector = `[data-tutorial="${target}"]`;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let settled = false;
    let failsafe = 0;
    let poll = 0;

    function unlockStyles() {
      const frozen = body.style.position === "fixed";
      const top = frozen ? Math.abs(parseFloat(body.style.top || "0")) : window.scrollY;
      lockY.current = null;
      html.classList.remove("tutorial-no-scroll");
      html.style.overflow = "";
      html.style.scrollBehavior = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      if (frozen) window.scrollTo({ top, behavior: "instant" });
    }

    function lockStyles() {
      if (cancelled) return;
      const y = window.scrollY;
      html.classList.add("tutorial-no-scroll");
      html.style.overflow = "hidden";
      html.style.scrollBehavior = "auto";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${y}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      lockY.current = y;
      setHole(holeFrom(document.querySelector(selector)));
    }

    function destinationY() {
      const el = document.querySelector(selector);
      if (!el) return window.scrollY;
      const raw = el.getBoundingClientRect().top + window.scrollY - 24;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(max, Math.max(0, raw));
    }

    function followHole() {
      if (!cancelled) setHole(holeFrom(document.querySelector(selector)));
    }

    function stopWatching() {
      window.removeEventListener("scroll", followHole);
      window.removeEventListener("scrollend", settle);
      if (failsafe) window.clearTimeout(failsafe);
      if (poll) window.clearInterval(poll);
    }

    function settle() {
      if (cancelled || settled) return;
      settled = true;
      stopWatching();
      lockStyles();
    }

    function startMove() {
      if (cancelled) return;
      const dest = destinationY();
      followHole();
      if (reduced || Math.abs(window.scrollY - dest) < 4) {
        window.scrollTo({ top: dest, behavior: "instant" });
        lockStyles();
        return;
      }
      window.addEventListener("scroll", followHole, { passive: true });
      window.addEventListener("scrollend", settle);
      window.scrollTo({ top: dest, behavior: "smooth" });
      poll = window.setInterval(() => {
        followHole();
        if (Math.abs(window.scrollY - dest) < 3) settle();
      }, 40);
      failsafe = window.setTimeout(settle, 2000);
    }

    unlockStyles();
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(startMove);
    });

    const onResize = () => followHole();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      stopWatching();
      window.removeEventListener("resize", onResize);
      unlockStyles();
      if (returnTop.current) {
        const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" });
      }
    };
  }, [target]);

  if (!current) return null;

  const frame = (
    <div className="pointer-events-auto fixed inset-0 z-[90] touch-none overscroll-none">
      <div aria-hidden className="absolute inset-0" />
      <DimPanes hole={hole} />
      {hole ? (
        <div
          className={`pointer-events-none absolute rounded-[28px] border-2 ${theme.ring}`}
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
        />
      ) : null}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pointer-events-auto absolute inset-x-3 bottom-3 z-10 mx-auto w-[min(100%,28rem)] overflow-hidden rounded-[28px] border-2 border-[#142033] bg-[#f4f1ea]/90 shadow-[8px_8px_0_#142033] backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
      >
        <div className="flex items-start justify-between gap-3 border-b-2 border-[#142033] bg-white/70 px-4 py-3">
          <div>
            <p className={`text-xs font-semibold tracking-wide uppercase ${theme.kicker}`}>
              {kicker}
            </p>
            <h2 id={titleId} className="mt-0.5 text-lg font-black tracking-tight">
              {current.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={finish}
            className="rounded-full border-2 border-[#142033] bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#142033]"
          >
            Skip
          </button>
        </div>

        <div className="px-4 pt-3">
          {cue ? cue(current.target) : null}
          <p className="text-sm leading-6 text-[var(--muted)]">{current.body}</p>
          <div className="mt-3 flex justify-center gap-1.5">
            {steps.map((item, i) => (
              <button
                key={item.target}
                type="button"
                aria-label={`Go to ${item.title}`}
                aria-current={i === step ? "step" : undefined}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === step ? "w-6 bg-[#142033]" : "w-2 bg-[#142033]/25"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-[#142033] bg-white/70 px-4 py-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((n) => Math.max(0, n - 1))}
            className="rounded-full border-2 border-[#142033] bg-white px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033] disabled:opacity-35"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (last ? finish() : setStep((n) => n + 1))}
            className={`rounded-full border-2 border-[#142033] ${theme.next} px-5 py-1.5 text-sm font-bold shadow-[2px_2px_0_#142033]`}
          >
            {last ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(frame, document.body);
}

function DimPanes({ hole }: { hole: Hole | null }) {
  const dim = "pointer-events-none absolute bg-[#142033]/32 backdrop-blur-[2px]";
  if (!hole) return <div className={`${dim} inset-0`} />;
  return (
    <>
      <div className={dim} style={{ top: 0, left: 0, right: 0, height: hole.top }} />
      <div
        className={dim}
        style={{
          top: hole.top + hole.height,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        className={dim}
        style={{
          top: hole.top,
          left: 0,
          width: hole.left,
          height: hole.height,
        }}
      />
      <div
        className={dim}
        style={{
          top: hole.top,
          left: hole.left + hole.width,
          right: 0,
          height: hole.height,
        }}
      />
    </>
  );
}
