import TimelineSection from "../components/Timeline/timelineSection"


export default function Page(){
  return(
      <div className="min-h-screen bg-[#F2CEE6] py-10">

        {/* container */}
          <main className="w-[95%] bg-[#812261] mt-2 mb-2 mx-auto overflow-hidden border-transparent rounded-3xl p-10">

{/*seperate div for each section with consistent styling for each div and the inner section of each div*/}
              <div className="bg-[#D86DB5] border-transparent rounded-3xl p-10 mb-4 mt-4">
                  
                  {/* Header */}
                  <header className="text-center">
                      <h1 
                          className=" font-bold drop-shadow-lg text-white text-[clamp(3rem,8vw,6rem)] leading-[1.1]"
                      >
                          Vidhu Site
                      </h1>
                  </header>
                  </div>

{/* Timeline Section */}
                <div className="bg-[#D86DB5] border-transparent rounded-3xl p-10 mb-4 mt-4">
                    
<section id="timeline" className="p-10 bg-[#E18EC5] mt-4 border-transparent rounded-3xl">
                      
{/*Components go within sections */}
<TimelineSection />
                      </section>
</div>


  {/* Jokes Div and Section*/}

<div className="bg-[#D86DB5] border-transparent rounded-3xl p-10 mb-4 mt-4">
    

  <section id="jokes" className="p-10 bg-[#E18EC5] border-transparent rounded-3xl ">
                      <h2 className="text-3xl font-bold text-center text-white">Jokes</h2>
                      {/* Content placeholder */}
                  </section>
</div>




{/* Map Section*/}

                
<div className="bg-[#D86DB5] border-transparent rounded-3xl p-10 mb-4 mt-4" >
<section id="map" className="p-10 bg-[#E18EC5] mt-4 border-transparent rounded-3xl">
                      <h2 className="text-3xl font-bold text-center text-white">Map</h2>


                      {/* Content placeholder */}
                  </section>
</div>



{/* Music Section*/}

                  
<div className="bg-[#D86DB5] border-transparent rounded-3xl p-10 mb-4 mt-4">
<section id="music-ily" className="p-10 bg-[#E18EC5] mt-4 border-transparent rounded-3xl">
                      <h2 className="text-3xl font-bold text-center text-white">Music</h2>
                      {/* Content placeholder */}
                  </section>
</div>

{/* Feedback Section*/}
                 

                  <div className="bg-[#D86DB5] border-transparent rounded-3xl p-10 mb-4 mt-4">

                  <section id="feedback" className="p-10 bg-[#E18EC5] mt-4 border-transparent rounded-3xl">
                      <h2 className="text-3xl font-bold text-center text-white">Feedback</h2>
                      {/* Content placeholder */}
                  </section>
              </div>
          </main>
      </div>
  )
}