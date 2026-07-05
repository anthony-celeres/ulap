"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface CarouselProps {
  children: ReactNode;
  ariaLabel: string;
  /** Child index to bring into view on mount (e.g. the current hour). */
  scrollToIndex?: number;
  /** Pixels reserved at the left (e.g. a sticky label column) when aligning scrolls. */
  scrollPadding?: number;
}

const arrowClass =
  "flex items-center justify-center w-7 h-7 rounded-full bg-surface text-muted border border-edge neu-sm active:neu-inset-sm transition-shadow duration-150 cursor-pointer disabled:opacity-35 disabled:cursor-default";

/**
 * Horizontal scroll strip. The scrollbar is hidden; when the content
 * overflows, a pair of controls appears above the strip — never over it —
 * with the unavailable direction disabled.
 */
export default function Carousel({ children, ariaLabel, scrollToIndex, scrollPadding = 4 }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    // rAF defers the initial measurement out of the effect body.
    const raf = requestAnimationFrame(update);
    const el = trackRef.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, children]);

  useEffect(() => {
    if (scrollToIndex === undefined) return;
    const raf = requestAnimationFrame(() => {
      const el = trackRef.current;
      const child = el?.children[scrollToIndex] as HTMLElement | undefined;
      if (el && child) {
        el.scrollLeft = Math.max(0, child.offsetLeft - el.offsetLeft - scrollPadding);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollToIndex, scrollPadding]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  const scrollable = canLeft || canRight;

  return (
    <div className="h-full flex flex-col">
      {scrollable && (
        <div className="flex justify-end gap-1.5 pb-2">
          <button type="button" aria-label="Scroll back" disabled={!canLeft} onClick={() => scroll(-1)} className={arrowClass}>
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Scroll forward" disabled={!canRight} onClick={() => scroll(1)} className={arrowClass}>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}
      <div
        ref={trackRef}
        role="list"
        aria-label={ariaLabel}
        className="flex-1 min-h-0 flex gap-1.5 xl:gap-2 overflow-x-auto snap-x no-scrollbar"
        style={{ scrollPaddingLeft: scrollPadding }}
      >
        {children}
      </div>
    </div>
  );
}
