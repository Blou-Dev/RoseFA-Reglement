import { cn } from "@/lib/utils";

export function Card({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-white/10 bg-white/[0.02] p-4", className)}>
      <div className="text-base font-semibold tracking-tight text-white">{title}</div>
      <p className="mt-2 text-sm leading-7 text-white/60">{description}</p>
    </div>
  );
}
