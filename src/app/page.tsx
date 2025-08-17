// import Image from 'next/image';
import TimelineSection from "@/components/Timeline/timelineSection"

export default function Page(){
    return(
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
            <main className="container mx-auto px-4 py-6">
                <div className="bg-[#E5D4F2] backdrop-blur-sm border rounded-xl border-purple-300 shadow-xl overflow-hidden">
                    
                    {/* Header */}
                    <header className="px-8 py-12 text-center">
                        <h1 
                            className="font-bold drop-shadow-lg" 
                            style={{fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: '1.1'}}
                        >
                            Vidhu Site
                        </h1>
                    </header>

                    {/* Timeline Section */}
                    <section id="timeline" className="bg-gray-50">
                        <TimelineSection />
                    </section>

                    {/* Other Sections */}
                    <section id="jokes" className="px-8 py-12 bg-white border-t border-gray-200">
                        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8">Jokes</h2>
                        {/* Content placeholder */}
                    </section>

                    <section id="map" className="px-8 py-12 bg-gray-50 border-t border-gray-200">
                        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8">Map</h2>
                        {/* Content placeholder */}
                    </section>

                    <section id="music-ily" className="px-8 py-12 bg-white border-t border-gray-200">
                        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8">Music</h2>
                        {/* Content placeholder */}
                    </section>

                    <section id="feedback" className="px-8 py-12 bg-purple-50 border-t border-gray-200 rounded-b-3xl">
                        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8">Feedback</h2>
                        {/* Content placeholder */}
                    </section>
                </div>
            </main>
        </div>
    )
}