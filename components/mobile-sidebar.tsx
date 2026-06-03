"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { PublicCategory } from "@/lib/types";

export function MobileSidebar({ categories }: { categories: PublicCategory[] }) {
  const [open, setOpen] = useState(false);
  const safeCategories = categories ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white xl:hidden"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur xl:hidden">
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-r border-white/10 bg-[#09090c] p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold">Navigation</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                aria-label="Fermer la navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-6">
              <div className="space-y-2">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85"
                >
                  Accueil
                </Link>
              </div>

              {safeCategories.map((group) => (
                <div key={group.title} className="space-y-2">
                  <div className="px-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{group.title}</div>

                  {(group.pages ?? []).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
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
