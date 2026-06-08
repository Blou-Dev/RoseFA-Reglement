"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import type { SearchItem } from "@/lib/types";

function buildSearchHref(href: string, query: string) {
  const trimmedQuery = query.trim();
  return trimmedQuery ? `${href}?q=${encodeURIComponent(trimmedQuery)}` : href;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"),
  );
}

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const trimmedQuery = query.trim();
  const hasResults = useMemo(() => items.length > 0, [items]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    if (!trimmedQuery) {
      setItems([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as SearchItem[];
        setItems(data);
      } catch {
        setItems([]);
      }
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function handleGlobalShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(true);

        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        });
      }

      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isEditableTarget(event.target)) {
        event.preventDefault();
        setOpen(true);

        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut, true);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut, true);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  function navigateToItem(item: SearchItem) {
    const targetHref = buildSearchHref(item.href, trimmedQuery);
    setOpen(false);
    router.push(targetHref);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!hasResults) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((currentIndex) => (currentIndex + 1) % items.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((currentIndex) => (currentIndex - 1 + items.length) % items.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedItem = items[activeIndex];
      if (selectedItem) {
        navigateToItem(selectedItem);
      }
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <label className="flex h-12 items-center gap-3 rounded-full border border-white/10 bg-black/50 px-4 text-sm text-white/60 backdrop-blur md:h-13">
        <Search className="h-4 w-4 shrink-0 text-rose-300" />
        <input
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          placeholder="Rechercher un reglement, un guide, une notion..."
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/32"
        />
        <span className="hidden rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/45 md:inline-flex">Ctrl K</span>
      </label>

      {open ? (
        <div className="surface-panel absolute left-0 right-0 top-[calc(100%+0.55rem)] z-40 overflow-hidden rounded-[1rem] border border-white/10 bg-[#0c0c12]/95 md:top-[calc(100%+0.75rem)]">
          {hasResults ? (
            <div className="max-h-[min(60dvh,24rem)] overflow-y-auto p-2">
              {items.map((item, index) => (
                <button
                  key={`${item.href}-${item.title}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigateToItem(item)}
                  className={`block w-full rounded-xl px-4 py-3 text-left transition ${
                    index === activeIndex ? "bg-white/7" : "hover:bg-white/5"
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-rose-300/80">{item.section}</div>
                  <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-1 line-clamp-2 text-sm leading-6 text-white/55">{item.description}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-5 text-sm text-white/50">
              <Sparkles className="h-4 w-4 text-rose-300" />
              {trimmedQuery ? "Aucun resultat pertinent pour cette recherche." : "Commence a taper pour rechercher dans la documentation."}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
