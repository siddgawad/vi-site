"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { eras } from "./data/eras";

gsap.registerPlugin(ScrollTrigger);

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);          // <div> wrapper
  const panelsRef = useRef<HTMLElement[]>([]);                     // <section> panels

  const setPanelRef = (el: HTMLElement | null, i: number) => {
    if (el) panelsRef.current[i] = el;
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!sectionRef.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const panels = panelsRef.current.filter(Boolean);
    if (!panels.length) return;

    gsap.set(panels, { opacity: 0, pointerEvents: "none" });
    gsap.set(panels[0], { opacity: 1, pointerEvents: "auto" });

    const triggers: gsap.plugins.ScrollTriggerInstance[] = [];
    panels.forEach((panel) => {
      const st = ScrollTrigger.create({
        trigger: panel,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          gsap.to(panels, { opacity: 0, pointerEvents: "none", duration: 0.3, overwrite: "auto" });
          gsap.to(panel, { opacity: 1, pointerEvents: "auto", duration: 0.4, ease: "power2.out" });
        },
        onEnterBack: () => {
          gsap.to(panels, { opacity: 0, pointerEvents: "none", duration: 0.3, overwrite: "auto" });
          gsap.to(panel, { opacity: 1, pointerEvents: "auto", duration: 0.4, ease: "power2.out" });
        },
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
    <div ref={sectionRef} className="relative">
      {eras.map((era, index) => (
        <section
          key={era.base}
          ref={(el) => setPanelRef(el, index)}
          className="relative min-h-[90vh] flex items-center justify-center"
        >
          <div className="w-full max-w-6xl px-4 sm:px-6 md:px-8">
            <header className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow">
                {era.title}
              </h2>
              {era.subtitle && (                                       
                <p className="text-white/80 mt-2">{era.subtitle}</p>
              )}
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {era.images.map((img) => (
                <div
                  key={`${era.base}${img.name}`}
                  className="group relative rounded-3xl overflow-hidden bg-white/10 border border-white/20"
                >
                  <div className="relative w-full h-full pt-[100%]">
                    <Image
                      src={`/api/i/${era.base}${img.name}`}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 640px) 28vw, 90vw"
                      className="absolute inset-0 object-contain transition-transform duration-500 motion-safe:group-hover:scale-110"
                      priority={index < 1}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
    
    </>
   
  );
}
