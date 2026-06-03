"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItemType = {
  title: string;
  content: string;
};

function isAccordionItem(value: unknown): value is AccordionItemType {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as AccordionItemType).title === "string" &&
      typeof (value as AccordionItemType).content === "string",
  );
}

export function Accordion({ items }: { items?: AccordionItemType[] }) {
  const safeItems = Array.isArray(items) ? items.filter(isAccordionItem) : [];

  if (safeItems.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.03]">
      {safeItems.map((item, index) => (
        <AccordionItem key={item.title} item={item} last={index === safeItems.length - 1} />
      ))}
    </div>
  );
}

function AccordionItem({ item, last }: { item: AccordionItemType; last: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(!last && "border-b border-white/10")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.025]"
      >
        <span className="text-sm font-medium text-white md:text-base">{item.title}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-rose-300 transition", open && "rotate-180")} />
      </button>
      {open ? <div className="px-5 pb-5 text-sm leading-7 text-white/65">{item.content}</div> : null}
    </div>
  );
}
