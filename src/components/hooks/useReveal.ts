"use client";
import { useEffect, useRef, useState } from "react";

export function useReveal(opts?: { threshold?: number; once?: boolean }) {
  const threshold = opts?.threshold ?? 0.35;
  const once = opts?.once ?? true;

  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return { ref, visible };
}
