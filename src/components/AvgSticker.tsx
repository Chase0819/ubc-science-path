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
      <div className="flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#142033] bg-[#f4f1ea] text-center">
        <span className="text-xs font-bold leading-4 text-[var(--muted)]">no avg yet</span>
      </div>
    );
  }
  return (
    <a
      href={ubcGradesUrl(code, avg.session)}
      target="_blank"
      rel="noreferrer"
      className="flex h-[4.75rem] w-[5.25rem] shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-[#142033] bg-[#f2d45c] text-[var(--ink)] shadow-[3px_3px_0_#142033] sm:h-20 sm:w-[5.5rem]"
      title={`${avg.session} winter, all sections`}
    >
      <span className="text-lg font-black leading-none tabular-nums sm:text-xl">
        {round1(avg.average).toFixed(1)}%
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{avg.session}</span>
    </a>
  );
}
