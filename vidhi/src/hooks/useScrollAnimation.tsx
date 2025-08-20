import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { prefersReducedMotion } from '../utils/animation';

export function useScrollAnimation() {
  const [scroll, setScroll] = useState({ y: 0, t: 0 });

  useEffect(() => {
    const lenis = new Lenis();
    const onScroll = ({ scroll }: { scroll: number }) =>
      setScroll({ y: scroll, t: performance.now() });

    lenis.on("scroll", onScroll);

    let bgY = 0, last = 0;
    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);

      const dt = last ? (time - last) : 16;
      last = time;

      if (!prefersReducedMotion()) {
        bgY = (bgY + 0.02 * dt) % 256;
        document.documentElement.style.setProperty("--bgY", `${bgY}px`);
      }

      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return scroll;
}