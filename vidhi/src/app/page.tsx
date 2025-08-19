"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import TimelineSection from "../components/Timeline/timelineSection"
import {createContext, useState } from "react"
import { useInView } from "react-intersection-observer";
import confetti from "canvas-confetti";



export const ScrollCtx = createContext<{ y: number; t: number }>({ y: 0, t: 0 })
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const START = new Date("2022-10-10T00:00:00-05:00"); // <- change me
const now = new Date();
const diffMs = now.getTime() - START.getTime();
// tiny crude breakdown; good enough for display
const target = {
  years: Math.floor(diffMs / (365 * 24 * 3600 * 1000)),
  months: Math.floor((diffMs / (30 * 24 * 3600 * 1000)) % 12),
  days: Math.floor((diffMs / (24 * 3600 * 1000)) % 30),
  hours: Math.floor((diffMs / (3600 * 1000)) % 24),
};

function splitWords(el: HTMLElement) {
    const words = el.textContent?.split(' ').filter(Boolean) ?? [];
    el.innerHTML = words.map(w => `<span class="reveal" style="display:inline-block">${w}&nbsp;</span>`).join('');
    const spans = Array.from(el.querySelectorAll('span.reveal'));
    spans.forEach((s, i) => (s as HTMLElement).style.transitionDelay = `${i * 60}ms`);
    requestAnimationFrame(() => el.classList.add('ready')); // just in case
    setTimeout(() => spans.forEach(s => s.classList.add('in')), 50);
    (el as HTMLElement).classList.remove('opacity-0');

  }
  
  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  



export default function Page(){
    const [scroll, setScroll] = useState({ y: 0, t: 0 })
    const [shown, setShown] = useState({ years: 0, months: 0, days: 0, hours: 0 });
    const [done, setDone] = useState(false);
    const { ref: countersRef, inView: countersVisible } = useInView({ threshold: 0.2, triggerOnce: true });

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
    
        // subtle background drift (respect reduced motion)
        if (!prefersReducedMotion()) {
          bgY = (bgY + 0.02 * dt) % 256; // 256 = tile size
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
    
      
     

      useEffect(() => {
        const el = document.getElementById('hero-title');
        if (el) splitWords(el);
      }, []);
      


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
      }, [countersVisible]);
      


  return(
    <ScrollCtx.Provider value={scroll}>
      <div className="min-h-screen bg-[#F2CEE6] py-2 xs:py-4 sm:py-6 md:py-8 lg:py-10 px-1 xs:px-2 sm:px-4">

        {/* container */}
          <main className="w-full sm:w-[98%] md:w-[95%] lg:w-[90%] xl:w-[85%] 2xl:w-[80%] max-w-7xl mx-auto bg-[#812261]  rounded-xl main-bg xs:rounded-2xl sm:rounded-3xl shadow-lg px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 xs:py-4 sm:py-6 md:py-8 lg:py-10">

{/*separate div for each section with consistent styling for each div and the inner section of each div*/}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
                  
                  {/* Header */}
                  <header className="text-center">
                  <h1 id="hero-title" className="opacity-0 font-bold drop-shadow-lg text-white text-[clamp(2.5rem,8vw,6rem)] leading-[1.1]">Vidhu Site</h1>
                  </header>
              </div>

{/* Timeline Section */}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
                    
                  <section id="timeline" className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#E18EC5] rounded-xl xs:rounded-2xl sm:rounded-3xl">
                      
                      {/*Components go within sections */}
                      <TimelineSection />
                  </section>
              </div>

              {/* Counters sticky stage */}
<section className="h-[180vh]">
  <div className="sticky top-0 h-screen grid place-items-center">
    {/* We'll render the counters box here in step 4 */}
    <div id="love-counters" ref={countersRef} className={`text-white text-center select-none ${done ? 'counter-done' : ''}`}>
  <div className="text-5xl sm:text-6xl font-bold tracking-tight">
    {shown.years} • {shown.months} • {shown.days} • {shown.hours}
  </div>
  <p className="mt-2 opacity-80">years • months • days • hours</p>
</div>

  </div>
</section>


{/* Jokes Div and Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">

                  <section id="jokes" className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#E18EC5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl">
                      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Jokes</h2>
                      {/* Content placeholder */}
                      {/* test sticky stage (tiny) */}
<section className="h-[200vh]">
  <div className="sticky top-0 h-screen grid place-items-center">Test Sticky</div>
</section>

                  </section>
              </div>

{/* Map Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
                  
                  <section id="map" className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#E18EC5] rounded-xl xs:rounded-2xl sm:rounded-3xl">
                      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Map</h2>
                      {/* Content placeholder */}
                  </section>
              </div>

{/* Music Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">
                  
                  <section id="music-ily" className="p-4 sm:p-6 md:p-8 lg:p-10 bg-[#E18EC5] rounded-2xl sm:rounded-3xl">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Music</h2>
                      {/* Content placeholder */}
                  </section>
              </div>

{/* Feedback Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">

                  <section id="feedback" className="p-4 sm:p-6 md:p-8 lg:p-10 bg-[#E18EC5] rounded-2xl sm:rounded-3xl">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Feedback</h2>
                      {/* Content placeholder */}
                  </section>
              </div>
          </main>
      </div>
      </ScrollCtx.Provider>
  )
}