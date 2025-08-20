"use client"

import { createContext } from "react"
import MainContainer from "../components/Layout/MainContainer"
import HeroSection from "../components/Hero/HeroSection"
import TimelineSection from "../components/Timeline/timelineSection";
import LoveCounters from "../components/Counters/LoveCounters"
import JokesSection from "../components/Jokes/JokesSection"
import Section from "../components/Layout/Section"
import { useScrollAnimation } from "../hooks/useScrollAnimation"
import MapSection from "@/components/Map/MapSection";

export const ScrollCtx = createContext<{ y: number; t: number }>({ y: 0, t: 0 })

export default function Page() {
  const scroll = useScrollAnimation();

  return (
    <ScrollCtx.Provider value={scroll}>
      <MainContainer>
        <HeroSection />




          <TimelineSection />
       

        <LoveCounters />
       
        
<JokesSection />

<Section id="music-ily">
  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">
    Music
  </h2>
</Section>

<Section id="feedback">
  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">
    Feedback
  </h2>
</Section>

{/* <MapSection /> */}

</MainContainer>
</ScrollCtx.Provider>
)
}

