"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SummaryLink = {
  label: string;
  href: string;
};

export function SectionSummary({ links }: { links: SummaryLink[] }) {
  const safeLinks = links ?? [];
  const [activeId, setActiveId] = useState(safeLinks[0]?.href ?? "");

  useEffect(() => {
    const sections = safeLinks
      .map((link) => document.querySelector(link.href))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveId(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [safeLinks]);

  return (
    <nav className="mt-4 space-y-1">
      {safeLinks.map((item) => {
        const active = activeId === item.href;

        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md border-l-2 border-transparent px-3 py-2 text-sm transition",
              active
                ? "border-l-rose-300 bg-white/[0.04] text-white"
                : "text-white/62 hover:bg-white/[0.03] hover:text-white",
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
