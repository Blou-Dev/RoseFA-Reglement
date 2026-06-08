"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { PublicCategory } from "@/lib/types";

export function MobileSidebar({ categories }: { categories: PublicCategory[] }) {
  const [open, setOpen] = useState(false);
  const safeCategories = categories ?? [];

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08] xl:hidden"
        aria-label="Ouvrir la navigation"
        aria-expanded={open}
        aria-controls="mobile-navigation-drawer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Fermer la navigation"
            className="absolute inset-0 bg-black/72 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            id="mobile-navigation-drawer"
            className="absolute left-0 right-0 top-[calc(var(--topbar-height)+env(safe-area-inset-top,0px))] mx-3 max-h-[calc(100dvh-var(--topbar-height)-env(safe-area-inset-top,0px)-0.75rem)] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0b10]/98 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">Navigation</div>
                <div className="mt-1 text-sm text-white/78">Accede rapidement aux pages du site.</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                aria-label="Fermer la navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="max-h-[calc(100dvh-var(--topbar-height)-env(safe-area-inset-top,0px)-6.5rem)] space-y-6 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base font-medium text-white/88"
                >
                  Accueil
                </Link>
              </div>

              {safeCategories.map((group) => (
                <div key={group.title} className="space-y-2">
                  <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">{group.title}</div>

                  {(group.pages ?? []).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-[15px] leading-6 text-white/72 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
