"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function clearActiveTargets(root: HTMLElement) {
  root
    .querySelectorAll("[data-search-current='true']")
    .forEach((element) => element.removeAttribute("data-search-current"));
}

function findSearchTarget(root: HTMLElement, query: string): HTMLElement | null {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!(node.textContent ?? "").trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode();

  while (currentNode) {
    const text = (currentNode.textContent ?? "").toLowerCase();
    if (text.includes(normalizedQuery)) {
      const element =
        currentNode.parentElement?.closest("p, li, h1, h2, h3, h4, blockquote, td, th, div");

      if (element instanceof HTMLElement) {
        return element;
      }
    }

    currentNode = walker.nextNode();
  }

  return null;
}

export function SearchHighlight({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    clearActiveTargets(root);

    if (!query.trim()) {
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let timeoutId: number | null = null;

    const attemptFocus = () => {
      if (cancelled || !rootRef.current) return false;

      clearActiveTargets(rootRef.current);
      const target = findSearchTarget(rootRef.current, query);
      if (!target) return false;

      target.setAttribute("data-search-current", "true");
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return true;
    };

    [0, 150, 400].forEach((delay) => {
      window.setTimeout(() => {
        if (cancelled) return;
        if (attemptFocus() && observer) {
          observer.disconnect();
          observer = null;
        }
      }, delay);
    });

    observer = new MutationObserver(() => {
      if (attemptFocus() && observer) {
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
        clearActiveTargets(rootRef.current);
      }
    };
  }, [pathname, query]);

  return <div ref={rootRef}>{children}</div>;
}
