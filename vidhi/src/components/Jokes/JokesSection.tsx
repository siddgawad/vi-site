"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Section from "../Layout/Section";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Card = { src: string; title: string; caption: string; alt: string };

const CARDS: Card[] = [
  { src: "/img1.png", title: "YOU TAKE UP", caption: "SO MUSHROOM IN MY HEART", alt: "Mushroom pun" },
  { src: "/img2.png", title: "I’M SOY INTO YOU", caption: "EDAMAME BE YOURS?", alt: "Edamame pun" },
  { src: "/img3.png", title: "YOU’RE ONE IN A MELON", caption: "SEEDS THE DAY WITH ME", alt: "Watermelon pun" },
  { src: "/vi.jpg",   title: "I CHEWS YOU", caption: "LET’S STICK TOGETHER",   alt: "Chewing gum pun" },
];

const CARD_CLASS =
  "card absolute w-[min(88vw,420px)] rounded-2xl bg-white p-6 text-center select-none shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-shadow";

export default function JokesSection() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const setCardRef = (el: HTMLDivElement | null, i: number) => { if (el) cardRefs.current[i] = el; };

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!stageRef.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean);
      const titles = cards.map((c) => c.querySelector(".card-title") as HTMLElement);
      const caps   = cards.map((c) => c.querySelector(".card-caption") as HTMLElement);

      // center stack
      gsap.set(cards, {
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 0,
        scale: 0.96,
        rotate: 0,
        transformOrigin: "50% 50%",
        zIndex: 1,
        willChange: "transform, opacity",
      });

      // text reveal (mask up)
      gsap.set([...titles, ...caps], { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });

      // first card active immediately
      cards[0].classList.add("is-active");
      gsap.set(cards[0], { autoAlpha: 1, scale: 1, zIndex: 5 });
      gsap.to([titles[0], caps[0]], {
        clipPath: "inset(0 0 0% 0)",
        autoAlpha: 1,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
      });

      // Pin THIS stage (no CSS sticky)
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: stageRef.current!,
          start: "top top",
          end: () => `+=${CARDS.length * 900}`,
          scrub: true,
          pin: true,          // <-- GSAP handles pinning
          pinSpacing: true,   // reserves space; no overlap with other sections
          anticipatePin: 1,
        },
      });

      for (let i = 0; i < cards.length - 1; i++) {
        const curr = cards[i];
        const next = cards[i + 1];
        const tCurrTitle = titles[i], tCurrCap = caps[i];
        const tNextTitle = titles[i + 1], tNextCap = caps[i + 1];

        // hold at center
        tl.to({}, { duration: 0.6 });

        // exit to ~10 o’clock (down-left)
        tl.to(
          curr,
          {
            keyframes: [
              { x: "-28vw", y: "8vh",  rotate: -10, scale: 0.98, duration: 0.35 },
              { x: "-52vw", y: "22vh", rotate: -24, autoAlpha: 0, scale: 0.96, duration: 0.35 },
            ],
            zIndex: 1,
          },
          ">-0.05"
        );
        tl.to([tCurrTitle, tCurrCap], {
          clipPath: "inset(0 0 100% 0)",
          autoAlpha: 0,
          duration: 0.28,
        }, "<");

        // enter from ~4 o’clock
        tl.fromTo(
          next,
          { x: "52vw", y: "22vh", rotate: 18, scale: 0.94, autoAlpha: 0, zIndex: 5 },
          {
            keyframes: [
              { x: "26vw", y: "10vh", rotate: 8, scale: 0.97, autoAlpha: 1, duration: 0.35 },
              { x: 0,      y: 0,      rotate: 0, scale: 1,  duration: 0.35 },
            ],
            zIndex: 5,
          },
          "<"
        );

        // toggle active
        tl.add(() => {
          curr.classList.remove("is-active");
          next.classList.add("is-active");
        }, "<");

        // reveal next text
        tl.fromTo(
          [tNextTitle, tNextCap],
          { clipPath: "inset(0 0 100% 0)", autoAlpha: 0 },
          { clipPath: "inset(0 0 0% 0)", autoAlpha: 1, duration: 0.38, stagger: 0.08, ease: "power2.out" },
          "<+0.05"
        );
      }
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <Section id="jokes">
      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">
        Jokes
      </h2>

      {/* NO sticky here; GSAP handles pinning */}
      <div ref={stageRef} className="relative h-screen flex items-center justify-center z-0">
        {CARDS.map((c, i) => (
          <div key={i} ref={(el) => setCardRef(el, i)} className={CARD_CLASS}>
            <div className="overflow-hidden mb-3">
              <p className="card-title text-[clamp(18px,4vw,28px)] font-bold tracking-wide" style={{ color: "var(--cardText)" }}>
                {c.title}
              </p>
            </div>
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 mb-3">
              <div className="w-full aspect-[4/3] relative">
                <Image
                  src={c.src}
                  alt={c.alt}
                  fill
                  sizes="(max-width: 768px) 88vw, 420px"
                  className="object-contain"
                  priority={i === 0}
                />
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="card-caption text-[clamp(14px,3.4vw,20px)] font-semibold" style={{ color: "var(--cardText)" }}>
                {c.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .card { --cardText: #5b5b5b; }
        .card.is-active { --cardText: #000; box-shadow: 0 12px 46px rgba(0,0,0,.18); }
      `}</style>
    </Section>
  );
}
