const SUCK_MS = 620;
const EASE_IN = "cubic-bezier(0.4, 0, 0.2, 1)";
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

type SuckRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  id?: string | null;
};

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function saveRect(rect: SuckRect) {
  try {
    sessionStorage.setItem("usp.suck", JSON.stringify(rect));
  } catch {
    /* ignore */
  }
}

export function readSuckRect(): SuckRect | null {
  try {
    const raw = sessionStorage.getItem("usp.suck");
    return raw ? (JSON.parse(raw) as SuckRect) : null;
  } catch {
    return null;
  }
}

function play(el: Element, keyframes: Keyframe[], easing: string, duration: number) {
  return el.animate(keyframes, { duration, easing, fill: "forwards" });
}

function frame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function pageNode(from?: Element | null): HTMLElement | null {
  const el =
    from?.closest(".page-enter") ??
    document.querySelector(".page-enter") ??
    document.querySelector("main");
  return el instanceof HTMLElement ? el : null;
}

function placeGhost(source: HTMLElement, rect: DOMRect) {
  const ghost = source.cloneNode(true) as HTMLElement;
  ghost.setAttribute("aria-hidden", "true");
  ghost.removeAttribute("href");
  ghost.classList.add("major-suck-ghost");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    boxSizing: "border-box",
    transformOrigin: "center center",
  });
  document.body.appendChild(ghost);
  return ghost;
}

/** Paper sheet over the content column, so the route swap never flashes. */
function addCover() {
  const cover = document.createElement("div");
  cover.className = "major-suck-cover";
  document.body.appendChild(cover);
  return cover;
}

function markEnterOrigin(ox: number, oy: number) {
  const root = document.documentElement;
  root.style.setProperty("--suck-ox", `${ox}px`);
  root.style.setProperty("--suck-oy", `${oy}px`);
  root.classList.add("from-major-suck");
  window.setTimeout(() => root.classList.remove("from-major-suck"), SUCK_MS + 1200);
}

function waitForRoute(pathname: string, timeout = 2500) {
  return new Promise<void>((resolve) => {
    const started = performance.now();
    const tick = () => {
      if (
        window.location.pathname === pathname ||
        performance.now() - started > timeout
      ) {
        resolve();
        return;
      }
      window.setTimeout(tick, 40);
    };
    tick();
  });
}

async function shrinkPage(page: HTMLElement, ox: number, oy: number) {
  page.style.transformOrigin = `${ox}px ${oy}px`;
  const anim = play(
    page,
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(0.24)", opacity: 0 },
    ],
    EASE_IN,
    SUCK_MS,
  );
  return anim;
}

async function revealAfterRoute(
  pathname: string,
  page: HTMLElement,
  pageAnim: Animation,
  cover: HTMLElement,
) {
  await waitForRoute(pathname);

  // Let the incoming page paint underneath the cover before we drop it.
  pageAnim.cancel();
  page.style.transformOrigin = "";
  await frame();
  await frame();

  const out = play(cover, [{ opacity: 1 }, { opacity: 0 }], EASE_OUT, 260);
  await out.finished.catch(() => undefined);
  cover.remove();
}

export async function suckIntoCard(
  card: HTMLElement,
  pathname: string,
  navigate: () => void,
  majorId?: string,
) {
  const rect = card.getBoundingClientRect();
  saveRect({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    id: majorId ?? null,
  });

  const page = pageNode(card);
  if (!page || reducedMotion()) {
    navigate();
    return;
  }

  const box = page.getBoundingClientRect();
  const ox = rect.left + rect.width / 2 - box.left;
  const oy = rect.top + rect.height / 2 - box.top;
  markEnterOrigin(ox, oy);

  const ghost = placeGhost(card, rect);
  const cover = addCover();
  card.style.visibility = "hidden";

  const pageAnim = await shrinkPage(page, ox, oy);
  const coverAnim = play(
    cover,
    [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.5 },
      { opacity: 1, offset: 1 },
    ],
    EASE_OUT,
    SUCK_MS,
  );
  const ghostAnim = play(
    ghost,
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(1.04)", opacity: 1, offset: 0.35 },
      { transform: "scale(0.9)", opacity: 0 },
    ],
    EASE_OUT,
    SUCK_MS,
  );

  await Promise.all(
    [pageAnim, coverAnim, ghostAnim].map((a) => a.finished.catch(() => undefined)),
  );
  ghost.remove();

  navigate();
  await revealAfterRoute(pathname, page, pageAnim, cover);
  card.style.visibility = "";
}

export async function popOutOfCard(pathname: string, navigate: () => void) {
  const page = pageNode();
  if (!page || reducedMotion()) {
    navigate();
    return;
  }

  const saved = readSuckRect();
  const box = page.getBoundingClientRect();
  const ox = saved ? saved.left + saved.width / 2 - box.left : box.width / 2;
  const oy = saved ? saved.top + saved.height / 2 - box.top : 120;
  markEnterOrigin(ox, oy);

  const cover = addCover();
  const pageAnim = await shrinkPage(page, ox, oy);
  const coverAnim = play(
    cover,
    [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.5 },
      { opacity: 1, offset: 1 },
    ],
    EASE_OUT,
    SUCK_MS,
  );

  await Promise.all(
    [pageAnim, coverAnim].map((a) => a.finished.catch(() => undefined)),
  );

  navigate();
  await revealAfterRoute(pathname, page, pageAnim, cover);
}
