"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import type { PublicCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Sidebar({ categories }: { categories: PublicCategory[] }) {
  const pathname = usePathname();
  const safeCategories = categories ?? [];

  return (
    <aside className="hidden w-[var(--sidebar-width)] shrink-0 xl:block">
      <div className="sticky top-[calc(var(--topbar-height)+0.75rem)] flex max-h-[calc(100vh-var(--topbar-height)-1.5rem)] flex-col gap-6 px-4 pb-4">
        <div className="rounded-xl border-r border-white/8 pr-4">
          <nav className="space-y-6 overflow-y-auto pr-1">
            <div className="space-y-1">
              <SidebarLink
                href="/"
                title="Accueil"
                active={pathname === "/"}
                topLevel
                icon={<Home className="h-4 w-4 text-white/45" />}
              />
            </div>

            {safeCategories.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">{group.title}</div>

                <div className="space-y-0.5">
                  {(group.pages ?? []).map((item) => (
                    <SidebarLink key={item.id} href={item.href} title={item.title} active={pathname === item.href} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  title,
  active,
  topLevel = false,
  icon,
}: {
  href: string;
  title: string;
  active: boolean;
  topLevel?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between rounded-md border-l-2 border-transparent px-3 py-2 text-sm transition",
        active
          ? "border-l-rose-300 bg-white/[0.04] text-white"
          : "text-white/68 hover:bg-white/[0.03] hover:text-white",
        topLevel && "py-2.5",
      )}
    >
      <span className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
      </span>
      {!topLevel ? <ChevronRight className={cn("h-4 w-4", active ? "text-rose-200" : "text-white/18")} /> : null}
    </Link>
  );
}
