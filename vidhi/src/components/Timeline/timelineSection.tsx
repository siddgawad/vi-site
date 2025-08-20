"use client"

import { useLayoutEffect, useRef } from "react"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { eras } from "./data/eras"

gsap.registerPlugin(ScrollTrigger)

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const panelsRef = useRef<HTMLDivElement[]>([])

  // helper to assign refs inside map
  const setPanelRef = (el: HTMLDivElement | null, i: number) => {
    if (el) panelsRef.current[i] = el
  }

  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    if (!sectionRef.current) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      const panels = panelsRef.current.filter(Boolean)
      if (!panels.length) return

      // stack panels on top of each other
      gsap.set(panels, {
        position: "absolute",
        inset: 0,
        opacity: 0,
        pointerEvents: "none",
      })
      gsap.set(panels[0], { opacity: 1, pointerEvents: "auto" })

      const steps = panels.length - 1
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current!,
          start: "top top",
          end: `+=${Math.max(1, steps) * 100}%`, // scroll distance
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          // nice snapping per panel
          snap: {
            snapTo: (value: number) => {
              const steps = panels.length - 1
              if (steps <= 0) return 0 // only one panel → snap to start
              const seg = 1 / steps
              return Math.round(value / seg) * seg
            },
            duration: { min: 0.1, max: 0.3 },
            ease: "power1.inOut",
          },
        },
      })

      // cross-fade: i => i+1
      for (let i = 0; i < steps; i++) {
        tl.to(panels[i], { opacity: 0, duration: 0.5, pointerEvents: "none" })
          .to(
            panels[i + 1],
            { opacity: 1, duration: 0.5, pointerEvents: "auto" },
            "<"
          )
      }

      // refresh on resize (grid heights, etc.)
      const ro = new ResizeObserver(() => ScrollTrigger.refresh())
      ro.observe(sectionRef.current!)

      return () => {
        ro.disconnect()
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="timeline"
      ref={sectionRef}
      // outer card wrapper (your theme)
      className="relative min-h-auto bg-[#D86DB5] rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6"
    >
      {/* pinned stage */}
      <div className="relative  min-h-screen rounded-xl xs:rounded-2xl sm:rounded-3xl overflow-hidden">
        {eras.map((era, index) => (
          <div key={era.id} ref={(el) => setPanelRef(el, index)} className="absolute inset-0">
            {/* title */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
              <h3 className="pt-4 text-white drop-shadow-lg font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                {era.title}
              </h3>
            </div>
  
            {/* grid box */}
            <div className="absolute inset-x-0 top-20 bottom-10 sm:top-25 bottom-15 md:top-30 bottom-30 lg:top-35 bottom-30 flex justify-center">
              <div className=" h-full w-full mt-10 sm:w-[90%] md:w-[90%] lg:w-[90%] bg-[#FFCEEF] grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-1 sm:gap-2 p-3 border-transparent rounded-2xl sm:rounded-3xl overflow-y-auto">
                {era.images.map((img, i) => (
                  <div key={`${era.id}-${i}`} className="group overflow-hidden rounded-lg sm:rounded-xl">
                    {/* ratio box so <Image fill /> has height */}
                    <div className="relative w-full h-full pt-[100%]">
                      <Image
                        src={`/api/i/${era.base}${img.name}`}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 640px) 28vw, 90vw"
                        className="absolute inset-0 object-contain  transition-transform duration-500 motion-safe:group-hover:scale-110"
                        priority={index < 1} // first era eager; others lazy
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
