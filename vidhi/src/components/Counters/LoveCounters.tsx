import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import confetti from 'canvas-confetti';
import { lerp, easeOutCubic, prefersReducedMotion } from '../../utils/animation';

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
  const target = calculateTimeDiff();
  const [shown, setShown] = useState({ years: 0, months: 0, days: 0, hours: 0 });
  const [done, setDone] = useState(false);
  const { ref: countersRef, inView: countersVisible } = useInView({ 
    threshold: 0.2, 
    triggerOnce: true 
  });

  useEffect(() => {
    if (!countersVisible) return;

    let raf = 0;
    const T = 800; // ms
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
          confetti({ particleCount: 60, spread: 55, origin: { y: 0.3 } });
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [countersVisible, target.years, target.months, target.days, target.hours]);

  return (
    <div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">

    <section className="h-[180vh]">
      <div className="sticky top-0 h-screen grid place-items-center">
        <div 
          id="love-counters" 
          ref={countersRef} 
          className={`text-white text-center select-none ${done ? 'counter-done' : ''}`}
        >
          <div className="text-5xl sm:text-6xl font-bold tracking-tight">
            {shown.years} • {shown.months} • {shown.days} • {shown.hours}
          </div>
          <p className="mt-2 opacity-80">years • months • days • hours</p>
        </div>
      </div>
    </section>
    </div>
  );
}