"use client"

import Image from "next/image"
import {eras} from "./data/eras"; // stores images
import type { Era } from "./data/eras";

interface EraItemProps{
    era: Era;
    index:number;

}

    function EraItem({era,index}:EraItemProps){
        const isEven = index%2===0;
        return(
         <>
         

      
                  {/*parent of grid div allowing us to position grid correctly*/}
              <div className={`mb-[100px] mt-[100px] flex ${isEven?"justify-end":"justify-start"}`}>
      
                    {/*Title div for each grid*/}
                 <div className={`text-4xl font-bold absolute mt-10 ${isEven?"right-95":"left-95"}`}>{era.title}</div>
      
                  {/*grid div for positioning */}
              <div  className="w-[60%] my-[100px]   bg-[#FFCEEF] grid grid-cols-3 gap-10 p-10 border-transparent rounded-3xl">
                 
                 {/*grid elements */}
                 {era.images.map((img, i) => (
  <div key={`${era.id}-${i}`}>
    <Image src={`/api/i/${era.base}${img.name}`} 
    alt={img.alt} 
    width={300} 
    height={300} 
    className="border-transparent rounded-3xl"
    />
  </div>
))}


  
              </div>
              </div>
              
             
             
              
      
              </>
              
             
      
              
          )
    }

export default function TimelineSection(){

return(
       // main container 
       <div className="border-transparent rounded-3xl ">
                  {eras.map((era, index) => (
        <EraItem key={index} era={era} index={index} />
      ))}
               </div>
)

  
}