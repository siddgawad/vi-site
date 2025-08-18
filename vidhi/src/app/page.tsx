
import TimelineSection from "../components/Timeline/timelineSection"

export default function Page(){
  return(
      <div className="min-h-screen bg-[#F2CEE6] py-2 xs:py-4 sm:py-6 md:py-8 lg:py-10 px-1 xs:px-2 sm:px-4">

        {/* container */}
          <main className="w-full sm:w-[98%] md:w-[95%] lg:w-[90%] xl:w-[85%] 2xl:w-[80%] max-w-7xl mx-auto bg-[#812261] overflow-hidden rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-lg px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 xs:py-4 sm:py-6 md:py-8 lg:py-10">

{/*separate div for each section with consistent styling for each div and the inner section of each div*/}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
                  
                  {/* Header */}
                  <header className="text-center">
                      <h1 
                          className="font-bold drop-shadow-lg text-white text-[clamp(2.5rem,8vw,6rem)] leading-[1.1]"
                      >
                          Vidhu Site
                      </h1>
                  </header>
              </div>

{/* Timeline Section */}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
                    
                  <section id="timeline" className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#E18EC5] rounded-xl xs:rounded-2xl sm:rounded-3xl">
                      
                      {/*Components go within sections */}
                      <TimelineSection />
                  </section>
              </div>

{/* Jokes Div and Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">

                  <section id="jokes" className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#E18EC5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl">
                      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Jokes</h2>
                      {/* Content placeholder */}
                  </section>
              </div>

{/* Map Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
                  
                  <section id="map" className="p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-[#E18EC5] rounded-xl xs:rounded-2xl sm:rounded-3xl">
                      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Map</h2>
                      {/* Content placeholder */}
                  </section>
              </div>

{/* Music Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">
                  
                  <section id="music-ily" className="p-4 sm:p-6 md:p-8 lg:p-10 bg-[#E18EC5] rounded-2xl sm:rounded-3xl">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Music</h2>
                      {/* Content placeholder */}
                  </section>
              </div>

{/* Feedback Section*/}
              <div className="bg-[#D86DB5] border-transparent rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 mb-3 sm:mb-4 md:mb-6 mt-3 sm:mt-4 md:mt-6">

                  <section id="feedback" className="p-4 sm:p-6 md:p-8 lg:p-10 bg-[#E18EC5] rounded-2xl sm:rounded-3xl">
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white leading-tight sm:leading-normal">Feedback</h2>
                      {/* Content placeholder */}
                  </section>
              </div>
          </main>
      </div>
  )
}