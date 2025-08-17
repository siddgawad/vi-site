"use client";

import Image from "next/image";
import { eras } from "@/components/Timeline/data/eras";               
import { useReveal } from "@/components/hooks/useReveal"; 

import { Era } from "./data/eras";

interface EraItemProps {
  era: Era;
}

function EraItem({ era }: EraItemProps) {
  const { ref, visible } = useReveal({ threshold: 0.1, once: true });

  return (
    <div className="min-h-[100svh] py-12">
      <header className="sticky top-4 z-10">
        <h2 className="text-2xl font-bold">{era.title}</h2>
      </header>

      <div ref={ref as React.RefObject<HTMLDivElement>} className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {era.images.map((img, i) => (
          <Image
            key={i}
            src={img.name.startsWith('img') ? `/${img.name}` : `/api/i/${era.base}${img.name}`}
            alt={img.alt}
            width={img.w || 1200}
            height={img.h || 1600}
            sizes="(max-width: 768px) 50vw, 33vw"
            className={`rounded-xl fade ${visible ? "in" : ""}`}
            // className={"rounded-xl fade in"}
            style={{ transitionDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TimelineSection() {
  return (
    <section id="timeline" className="px-6">
      {eras.map((era) => (
        <EraItem key={era.id} era={era} />
      ))}
    </section>
  );
}
