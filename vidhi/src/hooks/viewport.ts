"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Handlers = {
  onEnter?: (index: number, el: Element) => void;
  onLeave?: (index: number, el: Element) => void;
};

const hasWindow = typeof window !== "undefined";

if (hasWindow) {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch {
    /* noop for SSR */
  }
}

export const prefersReducedMotion = (): boolean =>
  hasWindow && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

/** Viewport-based section progress (no pins or fake tracks). */
export function useSectionViewportProgress(
  ref: React.RefObject<HTMLElement>,
  start: string = "top bottom-=100",
  end: string = "bottom top+=100",
  scrub: boolean = true
): number {
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!hasWindow || !el || prefersReducedMotion()) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      scrub,
      onUpdate: (self) => setProgress(clamp(self.progress, 0, 1)),
    });

    return () => st.kill();
  }, [ref, start, end, scrub]);

  return progress;
}

/**
 * Global scroll velocity (px/s approx).
 * Fixes "Maximum update depth exceeded" by:
 *  - batching updates in rAF
 *  - deduping tiny changes (minDelta)
 */
export function useScrollVelocity(
  opts: { minDelta?: number } = {}
): number {
  const { minDelta = 1 } = opts;
  const [velocity, setVelocity] = useState(0);

  const lastValueRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!hasWindow || prefersReducedMotion()) return;

    let mounted = true;

    const flush = (next: number) => {
      if (!mounted) return;
      // Dedupe tiny changes to avoid noisy re-renders
      if (Math.abs(next - lastValueRef.current) < minDelta) return;
      lastValueRef.current = next;
      setVelocity(next);
    };

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();

        // rAF gate: avoid synchronous setState during ScrollTrigger tick
        if (frameRef.current !== null) return;
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null;
          flush(v);
        });
      },
    });

    return () => {
      mounted = false;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      st.kill();
    };
  }, [minDelta]);

  return velocity;
}

/** Dwell/debounce a changing value (settles after delay). */
export function useDwell<T>(value: T, delayMs: number = 200): T {
  const [settled, setSettled] = useState<T>(value);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    const t = window.setTimeout(() => setSettled(latest.current), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return settled;
}

/**
 * IntersectionObserver helper for lists.
 * Lint-safe via refs (no missing-deps warnings).
 */
export function useCardIntersection(
  elementsRef: React.MutableRefObject<HTMLElement[]>,
  opts: IntersectionObserverInit = { threshold: 0.5 },
  handlers?: Handlers
): void {
  const optsRef = useRef<IntersectionObserverInit>(opts);
  const handlersRef = useRef<Handlers | undefined>(handlers);

  // keep latest options without forcing main effect to re-run
  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  // keep latest handlers without forcing main effect to re-run
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const els = (elementsRef.current ?? []).filter(Boolean) as HTMLElement[];
    if (!els.length || !hasWindow) return;

    const observer = new IntersectionObserver((entries) => {
      const h = handlersRef.current;
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const idx = Number(target.dataset.cardIndex);
        if (Number.isNaN(idx)) continue;
        if (entry.isIntersecting) h?.onEnter?.(idx, target);
        else h?.onLeave?.(idx, target);
      }
    }, optsRef.current);

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [elementsRef]);
}
