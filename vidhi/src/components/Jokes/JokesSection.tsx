"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useCardIntersection, useDwell, useScrollVelocity } from "@/hooks/viewport";

type Card = {
  src: string;
  title: string;
  caption: string;
  alt: string;
  emoji?: string;
  bgColor?: string;
};

// Add/remove freely — behavior scales automatically
const CARDS: Card[] = [
  { src: "/img1.png", title: "YOU TAKE UP", caption: "SO MUSHROOM IN MY HEART", alt: "Mushroom", emoji: "🍄", bgColor: "#FFE5EC" },
  { src: "/img2.png", title: "I'M SOY INTO YOU", caption: "EDAMAME BE YOURS?", alt: "Edamame", emoji: "🌱", bgColor: "#E5F5E5" },
  { src: "/img3.png", title: "YOU'RE ONE IN A MELON", caption: "SEEDS THE DAY WITH ME", alt: "Watermelon", emoji: "🍉", bgColor: "#FFE5E5" },
  { src: "/vi.jpg",  title: "I CHEWS YOU", caption: "LET'S STICK TOGETHER", alt: "Chewing gum", emoji: "💝", bgColor: "#F0E5FF" },
];

export default function JokesSection() {
  // Active card index
  const [active, setActive] = useState(0);

  // One sentinel per card — these are invisible waypoints that scroll under the sticky stage
  const sentinelsRef = useRef<HTMLDivElement[]>([]);
  const setSentinel = (el: HTMLDivElement | null, i: number) => {
    if (!el) return;
    sentinelsRef.current[i] = el;
    el.dataset.cardIndex = String(i);
  };

  // Observe sentinels: when one is sufficiently in view, we activate its card
  useCardIntersection(
    sentinelsRef,
    {
      threshold: 0.5,                  // switch when ~half the viewport hits this waypoint
      rootMargin: "0px 0px 0px 0px",
    },
    {
      onEnter: (i) => setActive(i),
      
    }
  );

  // Let fast flicks skip a card intentionally
  const v = useScrollVelocity({ minDelta: 8 });
  useEffect(() => {
    if (v > 900) setActive((a) => Math.min(a + 1, CARDS.length - 1));
    if (v < -900) setActive((a) => Math.max(a - 1, 0));
  }, [v]);

  // Settle on pause to avoid frantic swaps
  const settled = useDwell(active, 150);

  // Rail height = number of cards * 100vh (no blank tail)
  const railStyle = useMemo<React.CSSProperties>(
    () => ({ position: "relative", height: `${CARDS.length * 100}vh` }),
    []
  );

  return (
    <section id="jokes" className="relative">
      {/* Sticky stage stays visible the entire rail height */}
      <div className="sticky top-16 sm:top-20 z-10">
        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-center text-white mb-6">
          💝 Silly Jokes for You 💝
        </h2>

        {/* Card deck */}
        <div className="relative w-[min(90vw,520px)] mx-auto">
          {CARDS.map((c, i) => (
            <div
              key={i}
              className={[
                "rounded-3xl p-8 sm:p-10 text-center transition-all duration-500 will-change-transform",
                i === settled
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-90 translate-y-4 pointer-events-none",
              ].join(" ")}
              style={{ backgroundColor: c.bgColor || "#fff", position: i === settled ? "relative" : "absolute", inset: 0 }}
              aria-hidden={i !== settled}
            >
              <div className="absolute -top-6 -right-6 text-5xl sm:text-6xl">{c.emoji}</div>
              <h3 className="text-[clamp(20px,4.5vw,36px)] font-black tracking-tight text-gray-800 leading-tight mb-6">
                {c.title}
              </h3>
              <div className="relative w-full rounded-2xl overflow-hidden border-4 border-white/60 shadow-2xl mb-6">
                <div className="w-full aspect-[4/3] relative bg-gradient-to-br from-white to-gray-50">
                  <Image
                    src={c.src}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 520px"
                    className="object-contain p-3"
                    priority={i === 0}
                  />
                </div>
              </div>
              <p className="text-[clamp(16px,3.8vw,28px)] font-bold text-gray-700 leading-snug">{c.caption}</p>
              <div className="mt-4 h-2 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-b-3xl" />
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="relative z-10 max-w-lg mx-auto mt-6 px-4">
          <div className="bg-white/20 rounded-full overflow-hidden h-2 shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-white via-pink-200 to-pink-300 rounded-full"
              style={{ width: `${((settled + 1) / CARDS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- The Invisible Rail (provides scroll distance + waypoints) --- */}
      <div style={railStyle} aria-hidden>
        {/* Absolute sentinels at each 100vh step inside the rail */}
        {CARDS.map((_, i) => (
          <div
            key={`sentinel-${i}`}
            ref={(el) => setSentinel(el, i)}
            className="pointer-events-none"
            style={{
              position: "absolute",
              top: `${i * 100}vh`,
              left: 0,
              right: 0,
              height: "100vh",
            }}
          />
        ))}
      </div>
    </section>
  );
}
