export function pageChrome(pathname: string) {
  if (pathname.startsWith("/calculator")) {
    return {
      bar: "bg-[#c5e8c4] text-[#142033]",
      hover: "hover:bg-black/10",
      active: "bg-black/10",
      rail: "#c5e8c4",
      ink: "#142033",
    };
  }
  if (pathname.startsWith("/planner")) {
    return {
      bar: "bg-[#f2d45c] text-[#142033]",
      hover: "hover:bg-black/10",
      active: "bg-black/10",
      rail: "#f2d45c",
      ink: "#142033",
    };
  }
  if (pathname.startsWith("/outlook")) {
    return {
      bar: "bg-[#c62828] text-white",
      hover: "hover:bg-white/10",
      active: "bg-white/15",
      rail: "#c62828",
      ink: "#ffffff",
    };
  }
  return {
    bar: "bg-[var(--navy)] text-white",
    hover: "hover:bg-white/10",
    active: "bg-white/15",
    rail: "#1b365d",
    ink: "#ffffff",
  };
}