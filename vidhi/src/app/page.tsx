"use client"

import { createContext } from "react"
import MainContainer from "../components/Layout/MainContainer"
import HeroSection from "../components/Hero/HeroSection"
import TimelineSection from "../components/Timeline/timelineSection";
import LoveCounters from "../components/Counters/LoveCounters"
import JokesSection from "../components/Jokes/JokesSection"
import Section from "../components/Layout/Section"
import { useScrollAnimation } from "../hooks/useScrollAnimation"
import MusicSection from "@/components/Music/MusicSection";
// import MapSection from "@/components/Map/MapSection";
import FeedbackForm from "../components/Feedback/FeedbackForm";

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
  <div><MusicSection />
  </div>
</Section>

{/* Feedback Section*/}
<div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">
  <section id="feedback" className="p-4 sm:p-6 md:p-8 lg:p-10 bg-[#E18EC5] rounded-2xl sm:rounded-3xl">
    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">
      Feedback
    </h2>

    <FeedbackForm />
  </section>
</div>

{/* 
<MapSection /> */}

</MainContainer>
</ScrollCtx.Provider>
)
}

