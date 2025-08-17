
export type MediaImage = {
  name: string;         // e.g., "IMG_1949.JPG"
  alt: string;          // cute, specific alt text
  w?: number;           // optional: only needed if you render with width/height instead of `fill`
  h?: number;
};

export type MediaVideo = {
  name: string;      

  caption?: string;     
};

export type Era = {
  id: string;
  title: string;
  base: string;       
  images: MediaImage[];
 
};

export const eras: Era[] = [
  {
    id: "2022-07_2023-04",
    title: "July 2022 – April 2023",
    base: "love/era1/",
    images: [
 
      { name: "29BBA272-B1DB-4E41-B899-DFC8192EE438.jpg", alt: "First candid together" },
      { name: "B297C67C-4233-4416-A129-F815D611C0A6.jpg", alt: "Goofy selfie on the way" },
      { name: "IMG_1949.JPG", alt: "Cafe smile" },
      { name: "IMG_1988.JPG", alt: "Evening walk" },
      { name: "IMG_2141.JPG", alt: "Goofy face" },
      { name: "IMG_2273.JPG", alt: "Late-night laughs"},
      { name: "IMG_3326.JPG", alt: "Airport moment" },
      { name: "IMG_3377.JPG", alt: "Train window scene" },
      { name: "IMG_3457.JPG", alt: "Snow day!" }
    ],
  },

  {
    id: "2023-05_2024-12",
    title: "May 2023 – Dec 2024",
    base: "love/era2/",
    images: [
      { name: "IMG_9461.JPG", alt: "Campus steps" },
      {name:"4d081137-cb55-49e5-8793-136a8f2ab74c.jpg",alt:"LDR-IMG-1"},
      {name:"b6961976-cd7a-4ac0-840c-97e9ab0f3bb7.jpg",alt:"LDR-IMG-1"},
      {name:"IMG_1984.PNG",alt:"LDR-IMG-1"},
      {name:"IMG_2210.PNG",alt:"LDR-IMG-1"},
   

    ],
  },
];
