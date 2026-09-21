export function OutlookDecor() {
  return (
    <div
      className="relative mx-auto mt-4 hidden h-44 w-72 sm:block lg:absolute lg:right-2 lg:-top-1 lg:mt-0"
      aria-hidden
    >
      <div className="absolute left-3 top-1 w-32 -rotate-6 rounded-[22px] border-2 border-[#142033] bg-[#f8d0d0] px-3 py-2.5 shadow-[4px_4px_0_#142033]">
        <p className="text-[10px] font-bold tracking-wide text-[#8a1f1f] uppercase">Below the line</p>
        <p className="mt-1 text-2xl font-black leading-none">Low</p>
      </div>
      <div className="absolute right-1 top-8 w-36 rotate-6 rounded-[22px] border-2 border-[#142033] bg-[#f2d45c] px-3 py-2.5 shadow-[4px_4px_0_#142033]">
        <p className="text-[10px] font-bold tracking-wide text-[#8a7018] uppercase">Near cutoffs</p>
        <p className="mt-1 text-2xl font-black leading-none">Medium</p>
      </div>
      <div className="absolute bottom-1 left-10 w-44 -rotate-2 rounded-[22px] border-2 border-[#142033] bg-[#d8f0d7] px-3 py-2 shadow-[4px_4px_0_#142033]">
        <p className="text-[10px] font-bold tracking-wide uppercase">Above recent years</p>
        <p className="mt-0.5 text-sm font-black">High chance</p>
      </div>
    </div>
  );
}
