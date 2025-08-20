"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import confetti from "canvas-confetti";

/* tiny utils */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const nmap = (v: number, a: number, b: number) => clamp((v - a) / (b - a), 0, 1);
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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

/* falling confetti stream (top → down) */
// function fallConfetti() {
//   const end = Date.now() + 1200;
//   (function frame() {
//     confetti({
//       particleCount: 7,
//       angle: 90,
//       spread: 70,
//       startVelocity: 45,
//       gravity: 1.1,
//       ticks: 260,
//       drift: 0,
//       scalar: 1.4,
//       origin: { x: Math.random(), y: -0.05 },
//       zIndex: 9999,
//       colors: ["#D86DB5", "#FFCEEF", "#ffffff", "#ff69b4"],
//     });
//     if (Date.now() < end) requestAnimationFrame(frame);
//   })();
// }

export default function LoveCounters() {
  const target = useMemo(() => calculateTimeDiff(), []);
  const [shown, setShown] = useState({ years: 0, months: 0, days: 0, hours: 0 });
  const [done, setDone] = useState(false);

  // structure
  const sectionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const confettiFiredRef = useRef(false);
  const gsapInitRef = useRef(false);

  // SVG refs
  const infinityGroupRef = useRef<SVGGElement | null>(null);
  const infinityPathRef = useRef<SVGPathElement | null>(null);

  // counters reveal
  const { ref: countersRef, inView: countersVisible } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  /* counters ease-in */
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
      // ✅ revert to your original confetti behavior
      if (!prefersReducedMotion() && !confettiFiredRef.current) {
        confettiFiredRef.current = true;
        confetti({
          particleCount: 300,
          spread: 75,
          startVelocity: 46,
          gravity: 0.85,
          scalar: 1.9,
          ticks: 230,
          origin: { y: 0.35 },
        });
      }
    }
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [countersVisible, target.years, target.months, target.days, target.hours]);


  /* GSAP: ScrollTrigger drives draw via progress */
  useEffect(() => {
    if (gsapInitRef.current) return;
    gsapInitRef.current = true;

    let mounted = true;
    let killTrigger: (() => void) | null = null;
    let removeRefresh: (() => void) | null = null;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (!mounted) return;
      gsap.registerPlugin(ScrollTrigger);

      const trigger = triggerRef.current!;
      const pinEl = pinRef.current!;
      const infinityPath = infinityPathRef.current!;

      infinityPath.setAttribute("pathLength", "1");
      infinityPath.style.strokeDasharray = "1";
      infinityPath.style.strokeDashoffset = "1";

      ScrollTrigger.getById("love-scroll")?.kill();

      const st = ScrollTrigger.create({
        id: "love-scroll",
        trigger,
        start: "top top",
        end: "+=2200",
        scrub: true,
        pin: pinEl,
        pinSpacing: true, // allow spacer so next section doesn’t overlap
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress;
          const tInf = nmap(p, 0.0, 0.8);
          infinityPath.style.strokeDashoffset = String(1 - tInf);
        },
        onRefreshInit() {
          infinityPath.style.strokeDashoffset = "1";
        },
      });

      killTrigger = () => st.kill();
      const handleRefreshInit = () => {};
      ScrollTrigger.addEventListener("refreshInit", handleRefreshInit);
      removeRefresh = () => ScrollTrigger.removeEventListener("refreshInit", handleRefreshInit);
    })();

    return () => {
      mounted = false;
      removeRefresh?.();
      killTrigger?.();
    };
  }, []);

  return (
    <section
      id="love-counter"
      ref={sectionRef}
      className="relative bg-[#D86DB5] rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6"
    >
      {/* tall scroll area controlling progress */}
      <div ref={triggerRef} className="h-[260vh]">
        {/* pinned stage */}
        <div ref={pinRef} className="relative h-screen rounded-xl xs:rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            {/* title */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
              <h3 className="pt-4 text-white drop-shadow-lg font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                we have been together for
              </h3>
            </div>

            {/* content box */}
            <div className="absolute inset-x-0 top-20 bottom-10 sm:top-25 md:top-30 lg:top-35 flex justify-center">
              <div className="h-full w-full mt-10 sm:w-[90%] md:w-[90%] lg:w-[90%] bg-[#FFCEEF] flex flex-col items-center justify-center gap-6 p-6 border-transparent rounded-2xl sm:rounded-3xl">
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

                {/* Infinity — bigger via width classes */}
                <div className="flex-1 flex items-center justify-center mt-4">
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

                <p className="text-[#D86DB5]/70 text-xs sm:text-sm text-center">
                  (scroll to watch the infinity grow)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
