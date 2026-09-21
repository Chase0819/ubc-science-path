import { COMBINED_CUTOFF_YEAR, cutoffChartPoints, cutoffMixNote } from "@/lib/admission-model";
import { round1 } from "@/lib/grades";
import type { Specialization } from "@/lib/types";

export function OutlookCutoffChart({
  spec,
  sessional,
}: {
  spec: Specialization;
  sessional: number;
}) {
  const points = cutoffChartPoints(spec);
  const numeric = points.filter(
    (row): row is { year: number; value: number; mark: "cutoff" } => row.mark === "cutoff",
  );

  if (points.length === 0) {
    return (
      <p className="mt-3 text-sm font-medium text-[var(--muted)]">
        No published years to plot for this specialization.
      </p>
    );
  }

  if (numeric.length === 0) {
    return (
      <div className="mt-4">
        <YearStrip points={points} />
        <p className="mt-3 text-sm font-medium leading-6 text-[var(--muted)]">
          Recent years are NF, suppressed, or unpublished, so there is no numeric cutoff line to
          draw against your {round1(sessional)}% winter average.
        </p>
        <p className="mt-3 text-sm font-black leading-6 text-[#142033]">{cutoffMixNote(spec)}</p>
      </div>
    );
  }

  const avg = Number.isFinite(sessional) ? sessional : 0;
  const values = [...numeric.map((row) => row.value), avg];
  const { min, max } = yRange(values);
  const ticks = axisTicks(min, max);

  const width = 720;
  const height = 360;
  const padL = 48;
  const padR = 28;
  const padT = 40;
  const padB = 58;
  const halo = {
    paintOrder: "stroke",
    stroke: "#ffffff",
    strokeWidth: 5,
    strokeLinejoin: "round",
  } as const;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const x = (index: number) =>
    points.length === 1 ? padL + innerW / 2 : padL + (index / (points.length - 1)) * innerW;
  const y = (value: number) => padT + (1 - (clamp(value, min, max) - min) / (max - min)) * innerH;

  const cutoffLine = polyline(
    points.map((row, index) => (row.value === null ? null : [x(index), y(row.value)])),
  );
  const youY = y(avg);
  const combinedIndex =
    spec.umbrella === "computer-science"
      ? points.findIndex((row) => row.year >= COMBINED_CUTOFF_YEAR)
      : -1;
  const showCombinedMark = combinedIndex > 0;
  const combinedX = showCombinedMark
    ? (x(combinedIndex - 1) + x(combinedIndex)) / 2
    : 0;

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-full overflow-visible"
          role="img"
          aria-label={`${spec.name} published cutoffs versus your ${round1(avg)}% winter-session average`}
        >
          {ticks.map((mark) => (
            <g key={mark}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y(mark)}
                y2={y(mark)}
                stroke="#d9d3c7"
                strokeWidth="1"
              />
              <text x={8} y={y(mark) + 4} className="fill-[#5c6573] text-[11px] font-bold">
                {mark}
              </text>
            </g>
          ))}
          {points.map((_, index) => (
            <line
              key={`grid-${index}`}
              x1={x(index)}
              x2={x(index)}
              y1={padT}
              y2={height - padB}
              stroke="#eee9df"
              strokeWidth="1"
            />
          ))}
          {showCombinedMark ? (
            <g>
              <line
                x1={combinedX}
                x2={combinedX}
                y1={padT}
                y2={height - padB}
                stroke="#c62828"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <text
                x={combinedX + 8}
                y={padT + 12}
                className="fill-[#c62828] text-[11px] font-black"
              >
                Combined from {COMBINED_CUTOFF_YEAR}
              </text>
            </g>
          ) : null}
          <line
            x1={padL}
            x2={width - padR}
            y1={youY}
            y2={youY}
            stroke="#3d7a45"
            strokeWidth="3"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
          <text
            x={padL + 8}
            y={youY + 18}
            style={halo}
            className="fill-[#2f6b38] text-[13px] font-black"
          >
            You {round1(avg)}%
          </text>
          {cutoffLine.map((line, index) => (
            <polyline
              key={`cutoff-${index}`}
              fill="none"
              stroke="#142033"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={line}
            />
          ))}
          {points.map((row, index) => {
            const cx = x(index);
            if (row.value === null) {
              return (
                <g key={row.year}>
                  <text
                    x={cx}
                    y={padT + innerH / 2}
                    textAnchor="middle"
                    className="fill-[#8a7018] text-[11px] font-black"
                  >
                    {row.mark === "nf" ? "NF" : row.mark === "sup" ? "sup" : "—"}
                  </text>
                  <YearLabel x={cx} y={height - 18} year={row.year} />
                </g>
              );
            }

            const gap = avg - row.value;
            const cutoffY = y(row.value);
            const last = index === points.length - 1 && points.length > 1;
            const first = index === 0 && points.length > 1;
            const sideLeft = last || index >= Math.ceil(points.length / 2);
            const stemX = cx + (sideLeft ? -12 : 12);
            const stemAnchor = sideLeft ? "end" : "start";
            const aboveYou = row.value >= avg;
            const labelY = aboveYou ? cutoffY - 14 : cutoffY + 18;
            const labelAnchor = last ? "end" : first ? "start" : "middle";
            const labelX = last ? cx + 4 : first ? cx - 4 : cx;

            return (
              <g key={row.year}>
                <line
                  x1={cx}
                  x2={cx}
                  y1={youY}
                  y2={cutoffY}
                  stroke={gap >= 0 ? "#2f6b38" : "#b42318"}
                  strokeWidth="2.25"
                />
                <circle cx={cx} cy={cutoffY} r="6" fill="#142033" />
                <circle cx={cx} cy={youY} r="4.5" fill="#3d7a45" stroke="#ffffff" strokeWidth="2" />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={labelAnchor}
                  style={halo}
                  className="fill-[#142033] text-[12px] font-black"
                >
                  {round1(row.value)}%
                </text>
                <text
                  x={stemX}
                  y={(youY + cutoffY) / 2 + 4}
                  textAnchor={stemAnchor}
                  style={halo}
                  className={`text-[12px] font-black ${
                    gap >= 0 ? "fill-[#2f6b38]" : "fill-[#b42318]"
                  }`}
                >
                  {formatGap(gap)}
                </text>
                <YearLabel x={cx} y={height - 18} year={row.year} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold">
        <span className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-[#142033]" />
          Published cutoff
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 border-t-[3px] border-dashed border-[#3d7a45]" />
          Your winter average
        </span>
        <span className="flex items-center gap-2 text-[#2f6b38]">+ above that year</span>
        <span className="flex items-center gap-2 text-[#b42318]">− below that year</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
        The vertical scale is zoomed around these numbers so a 2–4 point gap is visible, not
        flattened on a 0–100 axis. The line breaks on NF or suppressed years.
      </p>
      <p className="mt-3 text-sm font-black leading-6 text-[#142033]">{cutoffMixNote(spec)}</p>
    </div>
  );
}

function YearStrip({ points }: { points: ReturnType<typeof cutoffChartPoints> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {points.map((row) => (
        <span
          key={row.year}
          className="rounded-full border-2 border-[#142033] bg-white px-3 py-1 text-xs font-black shadow-[2px_2px_0_#142033]"
        >
          {row.year} · {row.mark === "nf" ? "NF" : row.mark === "sup" ? "sup" : "—"}
        </span>
      ))}
    </div>
  );
}

function YearLabel({ x, y, year }: { x: number; y: number; year: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-[#142033] text-[12px] font-black">
      {year}
    </text>
  );
}

function yRange(values: number[]): { min: number; max: number } {
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const span = Math.max(6, maxV - minV);
  const pad = Math.max(3.5, span * 0.28);
  let min = Math.max(0, Math.floor((minV - pad) / 2) * 2);
  let max = Math.min(100, Math.ceil((maxV + pad) / 2) * 2);
  if (max - min < 8) {
    min = Math.max(0, min - 4);
    max = Math.min(100, max + 4);
  }
  if (max === min) {
    min = Math.max(0, min - 5);
    max = Math.min(100, max + 5);
  }
  return { min, max };
}

function axisTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span > 20 ? 5 : span > 10 ? 2 : 1;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= max + 1e-9; value += step) {
    ticks.push(Number(value.toFixed(1)));
  }
  if (ticks[0] !== min && ticks[0] - min > step * 0.45) {
    ticks.unshift(min);
  }
  if (ticks[ticks.length - 1] !== max && max - ticks[ticks.length - 1] > step * 0.45) {
    ticks.push(max);
  }
  return ticks;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatGap(diff: number): string {
  const n = round1(diff);
  if (n === 0) return "even";
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

function polyline(points: ([number, number] | null)[]): string[] {
  const lines: string[] = [];
  let current: string[] = [];
  for (const point of points) {
    if (point === null) {
      if (current.length) {
        lines.push(current.join(" "));
        current = [];
      }
      continue;
    }
    current.push(`${point[0]},${point[1]}`);
  }
  if (current.length) lines.push(current.join(" "));
  return lines;
}
