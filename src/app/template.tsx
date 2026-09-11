import { ViewTransition } from "react";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-fade",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-fade",
      }}
      default="none"
    >
      <div className="page-enter">{children}</div>
    </ViewTransition>
  );
}
