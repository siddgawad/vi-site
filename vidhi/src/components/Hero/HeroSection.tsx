import { useEffect } from 'react';
import { splitWords } from '../../utils/animation';
import Section from '../Layout/Section';

export default function HeroSection() {
  useEffect(() => {
    const el = document.getElementById('hero-title');
    if (el) splitWords(el);
  }, []);

  return (
    <Section>
         <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
               
      <header className="text-center">
        <h1 
          id="hero-title" 
          className="opacity-0 font-bold drop-shadow-lg text-white text-[clamp(2.5rem,8vw,6rem)] leading-[1.1]"
        >
          Vidhu Site
        </h1>
      </header>
      </div>
    </Section>
  );
}