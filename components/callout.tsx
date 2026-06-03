import type { ReactNode } from "react";

export function Callout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="my-6 rounded-lg border border-rose-400/18 bg-rose-500/[0.06] px-4 py-3.5">
      <div className="text-sm leading-7 text-white/78">{children}</div>
    </div>
  );
}
