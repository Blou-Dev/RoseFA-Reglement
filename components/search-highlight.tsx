"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function clearHighlights(root: HTMLElement) {
  const highlights = root.querySelectorAll("mark[data-search-highlight='true']");

  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (!parent) return;

    parent.replaceChild(document.createTextNode(highlight.textContent ?? ""), highlight);
    parent.normalize();
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightQuery(root: HTMLElement, query: string): HTMLElement | null {
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

  let firstHighlight: HTMLElement | null = null;

  textNodes.forEach((textNode) => {
    const text = textNode.textContent ?? "";
    if (!regex.test(text)) return;
    regex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    text.replace(regex, (match, offset: number) => {
      if (offset > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
      }

      const mark = document.createElement("mark");
      mark.dataset.searchHighlight = "true";
      mark.className = "search-highlight-match";
      mark.textContent = match;
      fragment.appendChild(mark);

      if (!firstHighlight) {
        firstHighlight = mark;
      }

      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  });

  return firstHighlight;
}

export function SearchHighlight({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    clearHighlights(root);

    if (!query.trim()) {
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let timeoutId: number | null = null;

    const attemptHighlight = () => {
      if (cancelled || !rootRef.current) return false;

      clearHighlights(rootRef.current);
      const firstHighlight = highlightQuery(rootRef.current, query);
      if (!firstHighlight) return false;

      firstHighlight.classList.add("search-highlight-current");
      firstHighlight.scrollIntoView({
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
      if (rootRef.current) {
        clearHighlights(rootRef.current);
      }
    };
  }, [pathname, query]);

  return <div ref={rootRef}>{children}</div>;
}
