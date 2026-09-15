import { round1 } from "@/lib/grades";
import { ubcGradesUrl, type WinterAverage } from "@/lib/ubcgrades";

export function AvgSticker({
  code,
  avg,
}: {
  code: string;
  avg: WinterAverage | null | undefined;
}) {
  if (!avg) {
    return (
      <div className="flex h-20 w-[5.5rem] shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#142033] bg-[#f4f1ea] text-center sm:h-[5.5rem] sm:w-24">
        <span className="text-xs font-bold leading-4 text-[var(--muted)]">no avg yet</span>
      </div>
    );
  }
  return (
    <a
      href={ubcGradesUrl(code, avg.session)}
      target="_blank"
      rel="noreferrer"
      className="flex h-20 w-[5.5rem] shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-[#142033] bg-[#f2d45c] text-[var(--ink)] shadow-[3px_3px_0_#142033] sm:h-[5.5rem] sm:w-24"
      title={`${avg.session} winter, all sections`}
    >
      <span className="text-xl font-black leading-none tabular-nums sm:text-2xl">
        {round1(avg.average).toFixed(1)}%
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{avg.session}</span>
    </a>
  );
}
