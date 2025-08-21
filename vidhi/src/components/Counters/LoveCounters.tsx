"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import confetti from "canvas-confetti";

/* tiny utils */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* your start date */
const START = new Date("2022-09-10T00:00:00-05:00");

type Counters = { years: number; months: number; days: number; hours: number };

function calculateTimeDiff(): Counters {
  const now = new Date();
  const years = now.getFullYear() - START.getFullYear();
  const months = now.getMonth() - START.getMonth() + years * 12;
  const dMs = now.getTime() - START.getTime();
  const days = Math.floor(dMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((dMs / (1000 * 60 * 60)) % 24);
  return { years, months, days, hours };
}

function fireConfetti() {
  confetti({
    particleCount: 200,   // up from 90
    spread: 120,          // wider
    angle: 90,
    origin: { y: 0.35 },
    scalar: 1.5,          // bigger pieces
    zIndex: 2147483647,
  });
}

export default function LoveCounters() {
  const target = useMemo((): Counters => calculateTimeDiff(), []);
  const [shown, setShown] = useState<Counters>({ years: 0, months: 0, days: 0, hours: 0 });
  const [done, setDone] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const infinityPathRef = useRef<SVGPathElement | null>(null);
  const loveTextRef = useRef<HTMLDivElement | null>(null);
  const infinityGroupRef = useRef<SVGGElement | null>(null);

  // counters animate when numbers block is visible
  const { ref: countersRef, inView } = useInView({ threshold: 0.4, triggerOnce: true });

  // Counter tween
  useEffect(() => {
    if (!inView || done) return;

    const duration = 1200;
    const startTs = performance.now();
    const s0: Counters = { years: 0, months: 0, days: 0, hours: 0 };

    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const t = clamp((now - startTs) / duration, 0, 1);
      const e = easeOutCubic(t);
      setShown({
        years: Math.round(lerp(s0.years, target.years, e)),
        months: Math.round(lerp(s0.months, target.months, e)),
        days: Math.round(lerp(s0.days, target.days, e)),
        hours: Math.round(lerp(s0.hours, target.hours, e)),
      });
      if (t < 1) requestAnimationFrame(tick);
      else setDone(true);
    };

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [inView, done, target]);

  // Infinity draw + text reveal on viewport enter
  useEffect(() => {
    const section = sectionRef.current;
    const path = infinityPathRef.current;
    const textEl = loveTextRef.current;
    if (!section || !path || !textEl) return;

    path.setAttribute("pathLength", "1");
    path.style.strokeDasharray = "1";
    path.style.strokeDashoffset = "1";

    let cancelled = false;

    const onEnter = () => {
      if (cancelled) return;

      fireConfetti();

       // draw path SLOWER: 2500ms instead of 1200ms
       const startTs = performance.now();
       const duration = 2500;
 
       const draw = (now: number) => {
         if (cancelled) return;
         const t = Math.min(1, Math.max(0, (now - startTs) / duration));
         path.style.strokeDashoffset = String(1 - t);
         if (t < 1) requestAnimationFrame(draw);
       };
       requestAnimationFrame(draw);
 
       // reveal text slightly slower as well
       textEl.animate(
         [
           { opacity: 0, transform: "translateY(20px) rotateX(30deg)" },
           { opacity: 1, transform: "translateY(0px) rotateX(0deg)" },
         ],
         { duration: 1200, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
       );
     };
 
     const io = new IntersectionObserver(
       (entries) => {
         entries.forEach((e) => e.isIntersecting && onEnter());
       },
       { threshold: 0.5 }
     );
 
     io.observe(section);
     return () => {
       cancelled = true;
       io.disconnect();
     };
   }, []);

  return (
    <section ref={sectionRef} aria-label="Love counters and infinity animation">
      <div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">
        <div className="bg-[#E18EC5] rounded-2xl sm:rounded-3xl p-4 sm:rounded-3xl md:p-8 lg:p-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Infinity + headline */}
            <div className="flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 800 400"
                className="w-[min(92vw,720px)] h-auto overflow-visible mb-6"
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
                  />
                </g>
              </svg>

              <div
                ref={loveTextRef}
                className="text-center text-white font-black text-[clamp(24px,6vw,56px)] tracking-tight leading-[1.05] drop-shadow"
              >
                I LOVE YOU
              </div>

              <p className="text-[#D86DB5]/70 text-xs sm:text-sm text-center mt-2">
                (appears when this section enters the viewport)
              </p>
            </div>

            {/* Right: Counters */}
            <div ref={countersRef} className="grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 items-center">
              {[
                { label: "Years", value: shown.years },
                { label: "Months", value: shown.months },
                { label: "Days", value: shown.days },
                { label: "Hours", value: shown.hours },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                  <div className="text-white/80 text-xs tracking-wider">{item.label}</div>
                  <div className="text-white font-black text-4xl sm:text-5xl mt-1">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
