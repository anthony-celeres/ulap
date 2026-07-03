"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface CarouselProps {
  children: ReactNode;
  ariaLabel: string;
  /** Child index to bring into view on mount (e.g. the current hour). */
  scrollToIndex?: number;
}

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-surface text-muted border border-edge neu-sm active:neu-inset-sm transition-shadow duration-150 cursor-pointer";

/**
 * Horizontal scroll strip with neumorphic arrow controls. The scrollbar is
 * hidden; arrows appear only on the sides that still have content. Extra
 * padding (offset by negative margin) keeps the tiles' soft shadows from
 * being clipped by the scroll container.
 */
export default function Carousel({ children, ariaLabel, scrollToIndex }: CarouselProps) {
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
        el.scrollLeft = Math.max(0, child.offsetLeft - el.offsetLeft - 16);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollToIndex]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="relative h-full">
      <div
        ref={trackRef}
        role="list"
        aria-label={ariaLabel}
        className="h-full flex gap-3 xl:gap-4 overflow-x-auto snap-x no-scrollbar p-4 -m-4 scroll-p-4"
      >
        {children}
      </div>
      {canLeft && (
        <button type="button" aria-label="Scroll back" onClick={() => scroll(-1)} className={`${arrowClass} left-0 -translate-x-1/3`}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
      )}
      {canRight && (
        <button type="button" aria-label="Scroll forward" onClick={() => scroll(1)} className={`${arrowClass} right-0 translate-x-1/3`}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
