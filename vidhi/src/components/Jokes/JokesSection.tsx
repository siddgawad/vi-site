"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Section from "../Layout/Section";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Card = {
  src: string;
  title: string;
  caption: string;
  alt: string;
  emoji?: string;
  bgColor?: string;
};

const CARDS: Card[] = [
  { src: "/img1.png", title: "YOU TAKE UP", caption: "SO MUSHROOM IN MY HEART", alt: "Mushroom pun", emoji: "🍄", bgColor: "#FFE5EC" },
  { src: "/img2.png", title: "I'M SOY INTO YOU", caption: "EDAMAME BE YOURS?", alt: "Edamame pun", emoji: "🌱", bgColor: "#E5F5E5" },
  { src: "/img3.png", title: "YOU'RE ONE IN A MELON", caption: "SEEDS THE DAY WITH ME", alt: "Watermelon pun", emoji: "🍉", bgColor: "#FFE5E5" },
  { src: "/vi.jpg", title: "I CHEWS YOU", caption: "LET'S STICK TOGETHER", alt: "Chewing gum pun", emoji: "💝", bgColor: "#F0E5FF" },
];

export default function JokesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const progressWrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<HTMLDivElement[]>([]);
  const setCardRef = (el: HTMLDivElement | null, i: number) => { 
    if (el) cardRefs.current[i] = el; 
  };

  const lastIdxRef = useRef(0);

  useLayoutEffect(() => {
    if (!sectionRef.current || !stageRef.current || !trackRef.current || !progressWrapRef.current) return;

    ScrollTrigger.getById("JOKES_SINGLE")?.kill();

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean);
      const stageEl = stageRef.current!;
      const progressEl = progressRef.current!;
      
      if (!cards.length) return;

      // Initially show stage and first card immediately
      gsap.set(stageEl, { autoAlpha: 1, pointerEvents: "auto" });

      // Stack all cards at center - only one visible at a time
      gsap.set(cards, {
        position: "absolute",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        zIndex: (i) => CARDS.length - i
      });

      // Set initial states - ONLY first card visible
      cards.forEach((card, i) => {
        const title = card.querySelector(".card-title") as HTMLElement;
        const caption = card.querySelector(".card-caption") as HTMLElement;
        const image = card.querySelector(".card-image") as HTMLElement;
        const emoji = card.querySelector(".card-emoji") as HTMLElement;

        if (i === 0) {
          // First card fully visible and active
          gsap.set(card, { 
            autoAlpha: 1, 
            scale: 1, 
            rotate: 0,
            x: 0,
            y: 0
          });
          gsap.set([title, caption], { autoAlpha: 1, y: 0 });
          gsap.set(image, { scale: 1, autoAlpha: 1 });
          gsap.set(emoji, { scale: 1, rotate: 0 });
          card.classList.add("is-active");
        } else {
          // All other cards completely invisible
          gsap.set(card, { 
            autoAlpha: 0, 
            scale: 0.8, 
            rotate: 5,
            x: 100,
            y: 50
          });
          gsap.set([title, caption], { autoAlpha: 0, y: 20 });
          gsap.set(image, { scale: 0.9, autoAlpha: 0 });
          gsap.set(emoji, { scale: 0, rotate: -90 });
          card.classList.remove("is-active");
        }
      });

      // Create timeline for smooth card transitions
      const tl = gsap.timeline({ paused: true });
      
      // Small hold at start
      tl.to({}, { duration: 0.15 });

      // Transition between each card
      for (let i = 0; i < CARDS.length - 1; i++) {
        const currentCard = cards[i];
        const nextCard = cards[i + 1];
        
        const currTitle = currentCard.querySelector(".card-title") as HTMLElement;
        const currCaption = currentCard.querySelector(".card-caption") as HTMLElement;
        const currImage = currentCard.querySelector(".card-image") as HTMLElement;
        const currEmoji = currentCard.querySelector(".card-emoji") as HTMLElement;

        const nextTitle = nextCard.querySelector(".card-title") as HTMLElement;
        const nextCaption = nextCard.querySelector(".card-caption") as HTMLElement;
        const nextImage = nextCard.querySelector(".card-image") as HTMLElement;
        const nextEmoji = nextCard.querySelector(".card-emoji") as HTMLElement;

        // Exit current card (slide left and fade out)
        tl.to(currentCard, {
          x: -120,
          y: -30,
          rotate: -8,
          scale: 0.75,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.inOut",
          zIndex: 1
        })
        .to([currTitle, currCaption], {
          autoAlpha: 0,
          y: -20,
          duration: 0.4,
          stagger: 0.05
        }, "<")
        .to(currImage, {
          scale: 0.85,
          autoAlpha: 0,
          duration: 0.4
        }, "<")
        .to(currEmoji, {
          scale: 0,
          rotate: 90,
          duration: 0.4
        }, "<")

        // Update active classes
        .add(() => {
          currentCard.classList.remove("is-active");
          nextCard.classList.add("is-active");
        }, "<0.3")

        // Enter next card (slide in from right)
        .fromTo(nextCard, {
          x: 120,
          y: 30,
          rotate: 8,
          scale: 0.8,
          autoAlpha: 0,
          zIndex: 5
        }, {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.7,
          ease: "back.out(1.2)"
        }, "<0.15")

        .fromTo([nextTitle, nextCaption], {
          autoAlpha: 0,
          y: 25
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out"
        }, "<0.2")

        .fromTo(nextImage, {
          scale: 0.9,
          autoAlpha: 0
        }, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out"
        }, "<0.1")

        .fromTo(nextEmoji, {
          scale: 0,
          rotate: -90
        }, {
          scale: 1,
          rotate: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.6)"
        }, "<0.1");

        // Brief pause between cards
        tl.to({}, { duration: 0.2 });
      }

      // ScrollTrigger for smooth, responsive scrolling
      const st = ScrollTrigger.create({
        id: "JOKES_SINGLE",
        trigger: stageEl,
        start: "top center",
        endTrigger: trackRef.current!,
        end: "bottom center",
        scrub: 0.8, // Smoother scrubbing
        // No pinning - use natural sticky behavior instead
        onEnter: () => {
          // Cards are already visible, no need to change visibility
        },
        onEnterBack: () => {
          // Cards are already visible, no need to change visibility  
        },
        onLeave: () => {
          // Keep cards visible until section is done
        },
        onLeaveBack: () => {
          // Keep cards visible
        },
        onUpdate(self) {
          // Drive timeline
          tl.progress(self.progress);

          // Update progress bar
          const p = Math.max(0.02, self.progress);
          gsap.set(progressEl, { scaleX: p, transformOrigin: "0 0" });

          // Update active index
          const idx = Math.min(Math.floor(self.progress * CARDS.length), CARDS.length - 1);
          if (idx !== lastIdxRef.current) {
            lastIdxRef.current = idx;
            setActiveIndex(idx);
          }
        },
        invalidateOnRefresh: true
      });

      st.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Section id="jokes" ref={sectionRef}>
      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-center text-white mb-6">
        💝 Silly Jokes for You 💝
      </h2>

      {/* Progress Bar */}
      <div ref={progressWrapRef} className="relative z-10 max-w-lg mx-auto mb-6 px-4">
        <div className="bg-white/20 rounded-full overflow-hidden h-2 shadow-lg">
          <div 
            ref={progressRef} 
            className="h-full bg-gradient-to-r from-white via-pink-200 to-pink-300 rounded-full transform-gpu transition-transform duration-100" 
          />
        </div>
        <div className="flex justify-between mt-4 text-sm text-white/70">
          {CARDS.map((_, i) => (
            <span 
              key={i} 
              className={`transition-all duration-500 px-2 py-1 rounded ${
                activeIndex === i 
                  ? "text-white font-bold scale-110 bg-white/10" 
                  : "hover:text-white/90"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Single Card Display Container */}
      <div className="relative -mt-4">
        {/* Sticky stage that stays within this container */}
        <div
          ref={stageRef}
          className="sticky  min-h-200 mx-auto flex items-center justify-center z-10"
        >
          {/* Single card container */}
          <div className="relative w-[min(90vw,480px)] h-full flex items-center justify-center">
            {CARDS.map((card, i) => (
              <div
                key={i}
                ref={(el) => setCardRef(el, i)}
                className="card w-full max-w-[480px] rounded-3xl p-8 sm:p-10 text-center select-none transform-gpu"
                style={{
                  backgroundColor: card.bgColor || "#ffffff",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)"
                }}
              >
                <div className="card-emoji absolute -top-6 -right-6 text-5xl sm:text-6xl">
                  {card.emoji}
                </div>

                <div className="overflow-hidden mb-6">
                  <h3 className="card-title text-[clamp(20px,4.5vw,36px)] font-black tracking-tight text-gray-800 leading-tight">
                    {card.title}
                  </h3>
                </div>

                <div className="card-image relative w-full rounded-2xl overflow-hidden border-4 border-white/60 shadow-2xl mb-6">
                  <div className="w-full aspect-[4/3] relative bg-gradient-to-br from-white to-gray-50">
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 768px) 90vw, 480px"
                      className="object-contain p-3"
                      priority={i === 0}
                    />
                  </div>
                </div>

                <div className="overflow-hidden">
                  <p className="card-caption text-[clamp(16px,3.8vw,28px)] font-bold text-gray-700 leading-snug">
                    {card.caption}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-b-3xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll track - controls the animation length */}
        <div ref={trackRef} style={{ height: 300 }} aria-hidden />
      </div>

      <style jsx>{`
        .card { 
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }
        .card.is-active {
          box-shadow:
            0 30px 90px rgba(216,109,181,.25),
            0 15px 40px rgba(216,109,181,.15),
            0 0 0 3px rgba(255,255,255,.7),
            inset 0 0 0 1px rgba(255,255,255,.4);
        }
        .card.is-active .card-title {
          background: linear-gradient(135deg, #D86DB5, #ff69b4, #ff1493);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card.is-active .card-caption { 
          color: #D86DB5; 
          font-weight: 900;
        }
        .card.is-active .card-emoji {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .card, .card *, .card.is-active .card-emoji { 
            transition: none !important; 
            animation: none !important;
          }
        }
      `}</style>
    </Section>
  );
}