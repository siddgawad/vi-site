"use client"

import Image from "next/image"
import {eras} from "./data/eras"; // stores images
import type { Era } from "./data/eras";
import { useInView } from "react-intersection-observer";


interface EraItemProps{
    era: Era;
    index:number;
}

function EraItem({era,index}:EraItemProps){
    const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

    const isEven = index%2===0;
    return(
        <>
         <div className="bg-[#D86DB5] border-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-2 xs:mb-3 sm:mb-4 md:mb-6 mt-2 xs:mt-3 sm:mt-4 md:mt-6">
                    
            {/*parent of grid div allowing us to position grid correctly*/}
            <div className={`mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-[100px] mt-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-[100px] flex flex-col 2xl:flex-row ${isEven ? "2xl:justify-end" : "2xl:justify-start"} items-center 2xl:items-start`}>

                {/*Title div for each grid - responsive positioning*/}
                <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl text-white drop-shadow-lg font-bold mb-4 2xl:mb-0 text-center 2xl:text-left 2xl:absolute 2xl:mt-10 ${isEven ? "2xl:right-[540px] 3xl:right-[590px]" : "2xl:left-[540px] 3xl:left-[590px]"}`}>
                    {era.title}
                </div>

                {/*grid div for positioning - responsive width and grid*/}
                <div ref={ref} className={`w-fullsm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[60%] 2xl:w-[60%] 3xl:w-[75%] my-4 sm:my-6 md:my-8 lg:my-12 xl:my-16 2xl:my-[100px] bg-[#FFCEEF] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-10 3xl:gap-20 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-8 2xl:p-8 3xl:p-8 border-transparent rounded-2xl sm:rounded-3xl" reveal ${inView ? 'in' : ''}`}>

                    {/*grid elements */}
                    {era.images.map((img, i) => (
                       <div key={`${era.id}-${i}`} className="group overflow-hidden rounded-lg sm:rounded-xl">
                       {/* ratio box: reserves height via padding-top */}
                       <div className="relative w-full pt-[100%]">
                         <Image
                           src={`/api/i/${era.base}${img.name}`}
                           alt={img.alt}
                           fill
                           sizes="(min-width: 1536px) 400px, (min-width: 1280px) 300px, (min-width: 1024px) 200px, (min-width: 640px) 33vw, (min-width: 480px) 50vw, 100vw"
                           className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-110"
                           priority={index < 2}
                         />
                       </div>
                     </div>
                    ))}
                </div>
            </div>
            </div>
        </>
    )
}

export default function TimelineSection(){
    return(
        // main container with responsive padding
        <div className="border-transparent rounded-2xl sm:rounded-3xl px-2 sm:px-4 md:px-6 lg:px-8">
            {eras.map((era, index) => (
                <EraItem key={index} era={era} index={index} />
            ))}
        </div>
    )
}