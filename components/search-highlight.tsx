"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clearCustomHighlights() {
  if (typeof CSS === "undefined" || !("highlights" in CSS)) {
    return;
  }

  CSS.highlights.delete("search-match");
  CSS.highlights.delete("search-current");
}

function highlightQuery(root: HTMLElement, query: string): Range | null {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return null;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "MARK", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!(node.textContent ?? "").trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const regex = new RegExp(escapeRegExp(normalizedQuery), "gi");
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  const ranges: Range[] = [];
  let firstRange: Range | null = null;

  textNodes.forEach((textNode) => {
    const text = textNode.textContent ?? "";
    regex.lastIndex = 0;

    let match: RegExpExecArray | null = regex.exec(text);

    while (match) {
      const start = match.index;
      const end = start + match[0].length;
      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      ranges.push(range);

      if (!firstRange) {
        firstRange = range;
      }

      match = regex.exec(text);
    }
  });

  if (ranges.length === 0) {
    return null;
  }

  if (typeof CSS !== "undefined" && "highlights" in CSS) {
    CSS.highlights.set("search-match", new Highlight(...ranges));
    if (firstRange) {
      CSS.highlights.set("search-current", new Highlight(firstRange));
    }
  }

  return firstRange;
}

export function SearchHighlight({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    clearCustomHighlights();

    if (!query.trim()) {
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let timeoutId: number | null = null;

    const attemptHighlight = () => {
      if (cancelled || !rootRef.current) return false;

      clearCustomHighlights();
      const firstRange = highlightQuery(rootRef.current, query);
      if (!firstRange) return false;

      const firstElement =
        firstRange.startContainer instanceof Element
          ? firstRange.startContainer
          : firstRange.startContainer.parentElement;

      firstElement?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return true;
    };

    const scheduleAttempts = [0, 120, 320];
    scheduleAttempts.forEach((delay) => {
      window.setTimeout(() => {
        if (cancelled) return;
        if (attemptHighlight() && observer) {
          observer.disconnect();
          observer = null;
        }
      }, delay);
    });

    observer = new MutationObserver(() => {
      if (attemptHighlight() && observer) {
        observer.disconnect();
        observer = null;
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    timeoutId = window.setTimeout(() => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }, 2000);

    return () => {
      cancelled = true;
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      clearCustomHighlights();
    };
  }, [pathname, query]);

  return <div ref={rootRef}>{children}</div>;
}
