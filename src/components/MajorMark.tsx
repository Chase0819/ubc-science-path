type MarkKind =
  | "code"
  | "brain"
  | "pill"
  | "cell"
  | "body"
  | "leaf"
  | "flask"
  | "chart"
  | "sigma"
  | "cogs"
  | "globe"
  | "mix"
  | "atom"
  | "star"
  | "cloud"
  | "rock"
  | "map"
  | "dna";

const KIND: Record<string, MarkKind> = {
  cpsc: "code",
  nsci: "brain",
  pcth: "pill",
  mbim: "cell",
  bioc: "dna",
  caps: "body",
  biol: "leaf",
  chem: "flask",
  dsci: "chart",
  stat: "chart",
  math: "sigma",
  masc: "sigma",
  "cogs-brain": "cogs",
  "cogs-cid": "cogs",
  ensc: "globe",
  insc: "mix",
  phys: "atom",
  astr: "star",
  atsc: "cloud",
  geop: "rock",
  eosc: "rock",
  geol: "rock",
  geos: "map",
  cmsc: "mix",
  "cpsc-biol": "dna",
  "cpsc-math": "sigma",
  "cpsc-stat": "chart",
  "cpsc-phys": "atom",
  "cpsc-chem": "flask",
  "cpsc-mbim": "cell",
  "cpsc-nsci": "brain",
  "stat-econ": "chart",
  "bioc-chem": "flask",
  "chem-biol": "leaf",
};

const FILL: Record<MarkKind, string> = {
  code: "#c9d8ff",
  brain: "#f7c4d4",
  pill: "#c8f0d4",
  cell: "#d7f0c4",
  body: "#f8d0c4",
  leaf: "#c5e8c4",
  flask: "#c9e8f4",
  chart: "#ffe3a8",
  sigma: "#e4d4ff",
  cogs: "#fde0b0",
  globe: "#c5eadc",
  mix: "#f2d45c",
  atom: "#d0e0ff",
  star: "#fff1a8",
  cloud: "#dde7f8",
  rock: "#e8dcc8",
  map: "#d4ecc8",
  dna: "#f4cce0",
};

function Glyph({ kind }: { kind: MarkKind }) {
  const s = { fill: "none", stroke: "#142033", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "code":
      return (
        <>
          <path d="M15 13 L10 20 L15 27" {...s} />
          <path d="M25 13 L30 20 L25 27" {...s} />
        </>
      );
    case "brain":
      return (
        <>
          <path d="M12 22c0-6 4-10 8-10 2 0 3.5 1 4 2 1-2 3.5-3 6-2 3 1 5 5 4 9-1 4-4 7-8 7h-5c-4 0-9-2-9-6z" {...s} />
          <path d="M20 12v16" {...s} />
        </>
      );
    case "pill":
      return <path d="M14 24 L24 14 a5.5 5.5 0 0 1 8 8 L22 32 a5.5 5.5 0 0 1-8-8z" {...s} />;
    case "cell":
      return (
        <>
          <circle cx="20" cy="20" r="9" {...s} />
          <circle cx="17" cy="18" r="2" fill="#142033" stroke="none" />
          <circle cx="23" cy="22" r="1.6" fill="#142033" stroke="none" />
        </>
      );
    case "body":
      return (
        <>
          <circle cx="20" cy="13" r="3.5" {...s} />
          <path d="M13 28c1-6 4-9 7-9s6 3 7 9" {...s} />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M20 30c-8-2-12-10-10-16 8-2 16 6 16 16-2 1-4 1-6 0z" {...s} />
          <path d="M20 30c0-8 4-14 10-16" {...s} />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M16 10h8 M18 10v6 L12 30h16L22 16V10" {...s} />
          <path d="M14 26h12" {...s} />
        </>
      );
    case "chart":
      return (
        <>
          <path d="M11 29h18" {...s} />
          <path d="M15 29V20" {...s} />
          <path d="M20 29V14" {...s} />
          <path d="M25 29V23" {...s} />
        </>
      );
    case "sigma":
      return <path d="M28 12H13l7 8-7 8h15" {...s} />;
    case "cogs":
      return (
        <>
          <circle cx="17" cy="20" r="5" {...s} />
          <circle cx="25" cy="23" r="3.5" {...s} />
        </>
      );
    case "globe":
      return (
        <>
          <circle cx="20" cy="20" r="9" {...s} />
          <path d="M11 20h18" {...s} />
          <path d="M20 11c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9z" {...s} />
        </>
      );
    case "mix":
      return (
        <>
          <circle cx="15" cy="16" r="4" {...s} />
          <circle cx="25" cy="16" r="4" {...s} />
          <circle cx="20" cy="25" r="4" {...s} />
        </>
      );
    case "atom":
      return (
        <>
          <circle cx="20" cy="20" r="2.2" fill="#142033" stroke="none" />
          <ellipse cx="20" cy="20" rx="11" ry="5" {...s} />
          <ellipse cx="20" cy="20" rx="5" ry="11" {...s} />
        </>
      );
    case "star":
      return (
        <path
          d="M20 10l2.2 6.4H29l-5.4 4 2.1 6.4L20 23.2l-5.7 3.6 2.1-6.4-5.4-4h6.8z"
          {...s}
        />
      );
    case "cloud":
      return <path d="M14 26h13a5 5 0 0 0 0-10 7 7 0 0 0-13.5 2A4.5 4.5 0 0 0 14 26z" {...s} />;
    case "rock":
      return <path d="M8 28 L16 14 L22 22 L26 16 L32 28z" {...s} />;
    case "map":
      return (
        <>
          <path d="M12 12l5 3 6-3 5 3v14l-5-3-6 3-5-3z" {...s} />
          <path d="M17 15v14M23 12v14" {...s} />
        </>
      );
    case "dna":
      return (
        <>
          <path d="M14 10c8 4 8 16 0 20" {...s} />
          <path d="M26 10c-8 4-8 16 0 20" {...s} />
          <path d="M16 15h8M16 20h8M16 25h8" {...s} />
        </>
      );
  }
}

export const PLANNER_SPOTLIGHT = [
  "cpsc",
  "nsci",
  "biol",
  "chem",
  "phys",
  "dsci",
  "math",
  "mbim",
] as const;

export function MajorMarkRow({ size = 40 }: { size?: number }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-hidden>
      {PLANNER_SPOTLIGHT.map((id) => (
        <li key={id}>
          <MajorMark id={id} size={size} />
        </li>
      ))}
    </ul>
  );
}

export function MajorMark({
  id,
  size = 44,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const kind = KIND[id] ?? "mix";
  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      aria-hidden
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} className="overflow-visible">
        <circle cx="20" cy="20" r="18" fill={FILL[kind]} stroke="#142033" strokeWidth="2.4" />
        <Glyph kind={kind} />
      </svg>
    </span>
  );
}
