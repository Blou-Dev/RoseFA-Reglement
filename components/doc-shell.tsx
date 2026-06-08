import type { ReactNode } from "react";
import type { PublicCategory } from "@/lib/types";
import { FooterBadge } from "@/components/footer-badge";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function DocShell({
  children,
  categories,
}: {
  children: ReactNode;
  categories: PublicCategory[];
}) {
  const safeCategories = categories ?? [];

  return (
    <div className="min-h-screen">
      <Topbar categories={safeCategories} />
      <div className="mx-auto flex max-w-[var(--page-max-width)] xl:px-4">
        <Sidebar categories={safeCategories} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1040px] px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-7 xl:px-8">{children}</div>
          <div className="mx-auto max-w-[1040px] px-3 pb-8 sm:px-4 md:px-6 xl:px-8">
            <FooterBadge />
          </div>
        </main>
      </div>
    </div>
  );
}
