import type { ReactNode } from "react";
import { CircleAlert, CircleCheckBig, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  info: {
    icon: CircleAlert,
    className: "border-sky-400/20 bg-sky-400/10 text-sky-50",
  },
  success: {
    icon: CircleCheckBig,
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-50",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber-300/20 bg-amber-300/10 text-amber-50",
  },
};

export function Alert({
  title,
  children,
  variant = "info",
}: {
  title: string;
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  const current = variants[variant];
  const Icon = current.icon;

  return (
    <div className={cn("my-6 rounded-[1.5rem] border p-4", current.className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm leading-7 text-current/85">{children}</div>
        </div>
      </div>
    </div>
  );
}
