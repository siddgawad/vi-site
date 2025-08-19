"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import confetti from "canvas-confetti";

/* ====== tiny local utils ====== */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ====== your start date ====== */
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

export default function LoveCounters() {
  const target = useMemo(() => calculateTimeDiff(), []);
  const [shown, setShown] = useState({ years: 0, months: 0, days: 0, hours: 0 });
  const [done, setDone] = useState(false);

  // sticky section
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // SVG refs
  const lovePathRef = useRef<SVGPathElement | null>(null);
  const infinityGroupRef = useRef<SVGGElement | null>(null);
  const infinityPathRef = useRef<SVGPathElement | null>(null);

  // reveal trigger for counters
  const { ref: countersRef, inView: countersVisible } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  /* --------- counters ease-in --------- */
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
        if (!prefersReducedMotion()) {
          confetti({ particleCount: 300, spread: 70, origin: { y: 0.35 } });
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [countersVisible, target.years, target.months, target.days, target.hours]);

  /* --------- GSAP: pin + draw + grow --------- */
  useEffect(() => {
    // minimal context shape (avoid importing GSAP types)
    let ctx: { revert: () => void } | null = null;
    let mounted = true;
    let cleanupScrollTrigger: (() => void) | null = null;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (!mounted) return;

      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current!;
      const lovePath = lovePathRef.current!;
      const infinityGroup = infinityGroupRef.current!;
      const infinityPath = infinityPathRef.current!;

      // dash prep for draw-on effects
      const loveLen = lovePath.getTotalLength();
      lovePath.style.strokeDasharray = `${loveLen}`;
      lovePath.style.strokeDashoffset = `${loveLen}`;

      const infLen =
        typeof infinityPath.getTotalLength === "function"
          ? infinityPath.getTotalLength()
          : 0;
      if (infLen) {
        infinityPath.style.strokeDasharray = `${infLen}`;
        infinityPath.style.strokeDashoffset = `${infLen}`;
      }

      const computeScale = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const base = Math.min(vw, vh);
        const endScale = Math.max(4, Math.min(12, Math.round((Math.max(vw, vh) / base) * 8)));
        return { start: 0.7, end: endScale };
      };
      const { start, end } = computeScale();

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2400",
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 0% -> 40%: draw the love signature
        tl.to(lovePath, { strokeDashoffset: 0, duration: 0.4 });

        // 20% -> 100%: grow the infinity
        tl.fromTo(
          infinityGroup,
          { scale: start, transformOrigin: "50% 50%" },
          { scale: end, duration: 0.8 },
          0.2
        );

        // optional: also draw infinity
        if (infLen) {
          tl.to(infinityPath, { strokeDashoffset: 0, duration: 0.6 }, 0.25);
        }

        const handler = () => {
          const s = computeScale();
          gsap.set(infinityGroup, { scale: s.start, transformOrigin: "50% 50%" });
        };
        ScrollTrigger.addEventListener("refreshInit", handler);
        cleanupScrollTrigger = () =>
          ScrollTrigger.removeEventListener("refreshInit", handler);
      }, section);
    })();

    return () => {
      mounted = false;
      cleanupScrollTrigger?.();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[280vh]">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 grid place-items-center bg-[#0b0f14]">
          {/* Infinity behind, scales up while pinned */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center -z-10">
            <svg
              viewBox="0 0 1000 600"
              className="w-[64vmin] sm:w-[60vmin] md:w-[56vmin] lg:w-[52vmin] xl:w-[48vmin] h-auto overflow-visible"
              aria-label="Infinity symbol"
            >
              <g ref={infinityGroupRef} id="infinityGroup" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}>
                <path
                  ref={infinityPathRef}
                  d="M 200,300
                     C 200,180 360,180 500,300
                     C 640,420 800,420 800,300
                     C 800,180 640,180 500,300
                     C 360,420 200,420 200,300"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={16}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 12px rgba(117,225,255,.35))" }}
                />
              </g>
            </svg>
          </div>

          {/* Foreground content */}
          <div className="relative w-full max-w-3xl px-4 text-center select-none">
            <h2 className="text-white/90 text-xl sm:text-2xl tracking-wide">
              we have been together for
            </h2>

            {/* Counters */}
            <div
              id="love-counters"
              ref={countersRef}
              className={`mt-3 text-white font-bold tracking-tight ${done ? "counter-done" : ""}`}
            >
              <div className="text-4xl sm:text-5xl md:text-6xl">
                {shown.years} • {shown.months} • {shown.days} • {shown.hours}
              </div>
              <p className="mt-2 opacity-70 text-sm sm:text-base">
                years • months • days • hours
              </p>
            </div>

            {/* “I love you” signature (draws first) */}
            <div className="mt-8 flex justify-center">
              <svg
                viewBox="0 0 1200 300"
                className="w-[80vw] max-w-4xl h-auto"
                aria-label="I love you signature"
              >
                <path
                  ref={lovePathRef}
                  d="
                    M80,200
                    C140,120 180,120 220,200
                    M240,200
                    C310,80 410,80 460,200
                    C510,320 610,320 660,200
                    M690,200
                    C740,120 820,120 860,200
                    C900,280 980,280 1040,200
                  "
                  fill="none"
                  stroke="#ff6aa6"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: "drop-shadow(0 0 10px rgba(255,106,166,.35))" }}
                />
              </svg>
            </div>

            <p className="mt-4 text-white/70 text-xs sm:text-sm">
              (scroll to watch the signature write on & the infinity grow)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}











// import { useEffect, useState } from 'react';
// import { useInView } from 'react-intersection-observer';
// import confetti from 'canvas-confetti';
// import { lerp, easeOutCubic, prefersReducedMotion } from '../../utils/animation';

// const START = new Date("2022-10-10T00:00:00-05:00");

// function calculateTimeDiff() {
//   const now = new Date();
//   const diffMs = now.getTime() - START.getTime();
  
//   return {
//     years: Math.floor(diffMs / (365 * 24 * 3600 * 1000)),
//     months: Math.floor((diffMs / (30 * 24 * 3600 * 1000)) % 12),
//     days: Math.floor((diffMs / (24 * 3600 * 1000)) % 30),
//     hours: Math.floor((diffMs / (3600 * 1000)) % 24),
//   };
// }

// export default function LoveCounters() {
//   const target = calculateTimeDiff();
//   const [shown, setShown] = useState({ years: 0, months: 0, days: 0, hours: 0 });
//   const [done, setDone] = useState(false);
//   const { ref: countersRef, inView: countersVisible } = useInView({ 
//     threshold: 0.2, 
//     triggerOnce: true 
//   });

//   useEffect(() => {
//     if (!countersVisible) return;

//     let raf = 0;
//     const T = 800; // ms
//     const t0 = performance.now();

//     const tick = () => {
//       const p = Math.min(1, (performance.now() - t0) / T);
//       const e = easeOutCubic(p);

//       setShown({
//         years: Math.floor(lerp(0, target.years, e)),
//         months: Math.floor(lerp(0, target.months, e)),
//         days: Math.floor(lerp(0, target.days, e)),
//         hours: Math.floor(lerp(0, target.hours, e)),
//       });

//       if (p < 1) {
//         raf = requestAnimationFrame(tick);
//       } else {
//         setDone(true);
//         if (!prefersReducedMotion()) {
//           confetti({ particleCount: 1000, spread: 100, origin: { y: 0.3 } });
//         }
//       }
//     };

//     raf = requestAnimationFrame(tick);
//     return () => cancelAnimationFrame(raf);
//   }, [countersVisible, target.years, target.months, target.days, target.hours]);

//   return (
//     <div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">

//     <section className="h-[180vh]">
//       <div className="sticky top-0 h-screen grid place-items-center">
//         <div 
//           id="love-counters" 
//           ref={countersRef} 
//           className={`text-white text-center select-none ${done ? 'counter-done' : ''}`}
//         >
//           <div className="text-5xl sm:text-6xl font-bold tracking-tight">
//             {shown.years} • {shown.months} • {shown.days} • {shown.hours}
//           </div>
//           <p className="mt-2 opacity-80">years • months • days • hours</p>
//         </div>
//       </div>
//     </section>
//     </div>
//   );
// }