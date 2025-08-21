"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import confetti from "canvas-confetti";

/* tiny utils */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const nmap = (v: number, a: number, b: number) => clamp((v - a) / (b - a), 0, 1);

/* your start date */
const START = new Date("2022-10-10T00:00:00-05:00");
function calculateTimeDiff() {
  const now = new Date();
  const diffMs = now.getTime() - START.getTime();
  return {
    years: Math.floor(diffMs / (365 * 24 * 3600 * 1000)),
    months: Math.floor((diffMs / (30 * 24 * 3600 * 1000)) % 12),
    days: Math.floor((diffMs / (24 * 3600 * 1000)) % 30),
    hours: Math.floor((diffMs / (3600 * 1000)) % 24),
  };
}

/* confetti burst (over everything) */
function fireConfetti() {
  confetti({
    particleCount: 300,
    spread: 75,
    startVelocity: 46,
    gravity: 0.85,
    scalar: 1.9,
    ticks: 230,
    origin: { y: 0.35 },
    colors: ["#D86DB5", "#FFCEEF", "#ffffff", "#ff69b4"],
    zIndex: 2147483647,
  });
}

export default function LoveCounters() {
  const target = useMemo(() => calculateTimeDiff(), []);
  const [shown, setShown] = useState({ years: 0, months: 0, days: 0, hours: 0 });
  const [done, setDone] = useState(false);

  // structure
  const sectionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const gsapInitRef = useRef(false);

  // SVG refs
  const infinityGroupRef = useRef<SVGGElement | null>(null);
  const infinityPathRef = useRef<SVGPathElement | null>(null);

  // text reveal ref
  const loveTextRef = useRef<HTMLDivElement | null>(null);

  // counters reveal
  const { ref: countersRef, inView: countersVisible } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  /* counters ease-in */
  useEffect(() => {
    if (!countersVisible) return;
    let raf = 0;
    const T = 800;
    const t0 = performance.now();

    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / T);
      const e = easeOutCubic(p);
      setShown({
        years: Math.floor(lerp(0, target.years, e)),
        months: Math.floor(lerp(0, target.months, e)),
        days: Math.floor(lerp(0, target.days, e)),
        hours: Math.floor(lerp(0, target.hours, e)),
      });
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [countersVisible, target.years, target.months, target.days, target.hours]);

  /* GSAP: ScrollTrigger for infinity draw + confetti + SplitType reveal */
  useEffect(() => {
    if (gsapInitRef.current) return; // StrictMode guard
    gsapInitRef.current = true;

    let mounted = true;
    const disposers: Array<() => void> = []; // ✅ const (ESLint prefer-const)

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: SplitType }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("split-type"),
      ]);
      if (!mounted) return;
      gsap.registerPlugin(ScrollTrigger);

      const trigger = triggerRef.current!;
      const pinEl = pinRef.current!;
      const infinityPath = infinityPathRef.current!;
      const loveTextEl = loveTextRef.current!;

      // Normalize dash units so drawing is resolution/scale-proof
      infinityPath.setAttribute("pathLength", "1");
      infinityPath.style.strokeDasharray = "1";
      infinityPath.style.strokeDashoffset = "1";

      // Split the "I LOVE YOU" text
      const split = new SplitType(loveTextEl, { types: "words,chars" });
      const chars = split.chars as HTMLElement[];

      // Initial hidden state for characters
      gsap.set(chars, {
        opacity: 0,
        yPercent: 120,
        rotateX: 60,
        transformPerspective: 400,
        transformOrigin: "50% 100% -20px",
        willChange: "transform,opacity",
      });

      // Reveal timeline (paused; we drive progress from main ScrollTrigger)
      const revealTl = gsap.timeline({ paused: true });
      revealTl.to(chars, {
        opacity: 1,
        yPercent: 0,
        rotateX: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.02, from: "start" },
      });

      // Kill any previous with same id (fast refresh safety)
      ScrollTrigger.getById("love-scroll")?.kill();

      const st = ScrollTrigger.create({
        id: "love-scroll",
        trigger,
        start: "top top",
        end: "+=2200",       // how long the section stays pinned/animated
        scrub: true,
        pin: pinEl,          // keep it sticky
        pinSpacing: true,    // reserve space so next section can't overlap
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Confetti whenever the section becomes sticky (both directions)
        onEnter: () => fireConfetti(),
        onEnterBack: () => fireConfetti(),
        onUpdate(self) {
          const p = self.progress;         // 0..1
          const tInf = nmap(p, 0.0, 0.8);  // draw finishes by 80%
          infinityPath.style.strokeDashoffset = String(1 - tInf);

          // Drive text reveal during the last ~35% of the scroll
          const tText = nmap(p, 0.65, 1.0);
          revealTl.progress(tText);
        },
        onRefreshInit() {
          infinityPath.style.strokeDashoffset = "1";
          revealTl.progress(0);
        },
      });

      disposers.push(
        () => st.kill(),
        () => split.revert()
      );
    })();

    // Actual React cleanup: run all disposers
    return () => {
      mounted = false;
      disposers.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    };
  }, []);

  return (
    <section
      id="love-counter"
      ref={sectionRef}
      className="relative isolate bg-[#D86DB5] rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6"
    >
      {/* tall scroll area (pin spacing will create the space) */}
      <div ref={triggerRef}>
        {/* pinned stage */}
        <div
          ref={pinRef}
          className="relative h-screen rounded-xl xs:rounded-2xl sm:rounded-3xl overflow-hidden"
        >
          {/* OPAQUE VIEWPORT BACKGROUND WHILE PINNED (prevents bleed-through) */}
          <div className="absolute inset-0 bg-[#D86DB5] z-0" />

          <div className="absolute inset-0 z-10">
            {/* title */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
              <h3 className="pt-4 text-white drop-shadow-lg font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                we have been together for
              </h3>
            </div>

            {/* content box */}
            <div className="absolute inset-x-0 top-24 md:top-28 lg:top-32 bottom-10 flex justify-center overflow-hidden">
              <div className="h-full w-full sm:w-[90%] md:w-[90%] lg:w-[90%] bg-[#FFCEEF] flex flex-col items-center justify-center gap-6 p-6 border-transparent rounded-2xl sm:rounded-3xl overflow-hidden">
                {/* Counters */}
                <div
                  id="love-counters"
                  ref={countersRef}
                  className={`text-[#D86DB5] font-bold tracking-tight text-center ${done ? "counter-done" : ""}`}
                >
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                    {shown.years} • {shown.months} • {shown.days} • {shown.hours}
                  </div>
                  <p className="mt-2 opacity-70 text-sm sm:text-base md:text-lg">
                    years • months • days • hours
                  </p>
                </div>

                {/* connecting text */}
                <p className="text-[#D86DB5] font-semibold text-lg sm:text-xl md:text-2xl">
                  and will be till
                </p>

                {/* Infinity */}
                <div className="flex-1 flex items-center justify-center mt-2">
                  <svg
                    viewBox="0 0 800 400"
                    className="w-[80vmin] sm:w-[76vmin] md:w-[72vmin] lg:w-[68vmin] h-auto"
                    aria-label="Infinity symbol"
                  >
                    <g
                      ref={infinityGroupRef}
                      id="infinityGroup"
                      style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
                    >
                      <path
                        ref={infinityPathRef}
                        d="M 200,200 
                           C 200,100 300,100 400,200
                           C 500,300 600,300 600,200
                           C 600,100 500,100 400,200
                           C 300,300 200,300 200,200"
                        fill="none"
                        stroke="#D86DB5"
                        strokeWidth={16}
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: "drop-shadow(0 0 12px rgba(216,109,181,.35))" }}
                      />
                    </g>
                  </svg>
                </div>

                {/* I LOVE YOU — GSAP + SplitType reveal */}
                <div className="mt-6 mb-2">
                  <div
                    ref={loveTextRef}
                    className="text-[#D86DB5] font-black text-center"
                    style={{
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      fontSize: "clamp(2.25rem, 8vw, 6rem)",
                      textRendering: "optimizeLegibility",
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                    }}
                  >
                    I LOVE YOU
                  </div>
                </div>

                <p className="text-[#D86DB5]/70 text-xs sm:text-sm text-center">
                  (scroll to watch the infinity draw and the words appear)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}