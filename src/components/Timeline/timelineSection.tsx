"use client";

import Image from "next/image";
import { eras } from "@/components/Timeline/data/eras";               
import { useReveal } from "@/components/hooks/useReveal"; 

import { Era } from "./data/eras";

interface EraItemProps {
  era: Era;
  index: number;
}

function EraItem({ era, index }: EraItemProps) {
  const { ref, visible } = useReveal({ threshold: 0.1, once: true });
  const isEven = index % 2 === 0;

  return (
    <div className="py-16">
      {/* Full-width container with left/right positioning */}
      <div className={`flex ${isEven ? 'justify-start' : 'justify-end'} w-full`}>
        
        {/* Era container - 60% width, positioned left or right */}
        <div className={`w-[60%] ${isEven ? 'pr-8' : 'pl-8'}`}>
          
          {/* Era header */}
          <header className={`mb-6 ${isEven ? 'text-left' : 'text-right'}`}>
            <h3 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2">
              Era {index + 1}
            </h3>
            <div className={`h-1 w-16 bg-purple-400 ${isEven ? '' : 'ml-auto'}`} />
          </header>
          
          {/* Images grid */}
          <div 
            ref={ref as React.RefObject<HTMLDivElement>} 
            className="rounded-2xl p-6 shadow-lg border border-purple-100"
            style={{backgroundColor: '#F6F4E7'}}
          >
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {era.images.map((img, i) => (
                  <div key={`${era.id}-${i}`} className="aspect-square group relative overflow-hidden flex items-center justify-center">
                    <Image
                      src={`/api/i/${era.base}${img.name}`}
                      alt={img.alt}
                      width={150}
                      height={150}
                      className={`
                        rounded-xl object-cover shadow-md w-full h-full
                        transition-all duration-500 ease-out
                        group-hover:scale-110 group-hover:shadow-xl
                        fade ${visible ? "in" : ""}
                      `}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    />
                  
                  {/* Hover overlay with alt text */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                    <p className="text-white text-xs font-medium text-center px-2 leading-tight">
                      {img.alt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Era summary */}
            <div className="mt-6 pt-4 border-t border-purple-100">
              <p className="text-sm text-gray-500 text-center">
                {era.images.length} memories captured
              </p>
            </div>
          </div>

          {/* Time period badge */}
          <div className={`mt-4 ${isEven ? 'text-left' : 'text-right'}`}>
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {era.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelineSection() {
  return (
    <section className="relative px-4 py-12">
      {/* Section header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">Timeline</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          A journey through different eras and moments captured in time
        </p>
      </div>

      {/* Timeline container */}
      <div className="max-w-7xl mx-auto">
        {eras.map((era, index) => (
          <EraItem key={era.id} era={era} index={index} />
        ))}
      </div>
    </section>
  );
}