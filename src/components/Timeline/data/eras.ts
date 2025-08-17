// data/eras.ts
// Minimal schema you can grow over time.
// Keys are S3 object keys under your allowlisted prefix (e.g., S3_PREFIX = "love/").
// NOTE: S3 is case-sensitive — keep file names EXACT (JPG vs jpg).

export type MediaImage = {
  name: string;         // e.g., "IMG_1949.JPG"
  alt: string;          // cute, specific alt text
  w?: number;           // optional: only needed if you render with width/height instead of `fill`
  h?: number;
  aspect?: "3/4" | "4/3" | "1/1"; // optional: helps you pick a container aspect in the grid
};

export type MediaVideo = {
  name: string;         // e.g., "recorded-977962684238.mp4"
  poster?: string;      // optional image in the SAME base folder, shown before play
  caption?: string;     // optional short label
};

export type Era = {
  id: string;
  title: string;
  base: string;         // folder under your prefix, e.g., "love/era1/"
  images: MediaImage[];
  videos?: MediaVideo[]; // listed here; we’ll render them with <video> later via /api/v/<key>
};

export const eras: Era[] = [
  {
    id: "2022-07_2023-04",
    title: "July 2022 – April 2023",
    base: "love/era1/",
    images: [
      // ✅ Good: JPG/JPEG/PNG/WebP. (PNG is heavy—convert to webp/jpg when you can.)
      { name: "29BBA272-B1DB-4E41-B899-DFC8192EE438.jpg", alt: "First candid together", w: 1200, h: 1600, aspect: "3/4" },
      { name: "B297C67C-4233-4416-A129-F815D611C0A6.jpg", alt: "Goofy selfie on the way", w: 1600, h: 1200, aspect: "4/3" },
      { name: "IMG_1949.JPG", alt: "Cafe smile", w: 1200, h: 1600, aspect: "3/4" },
      { name: "IMG_1988.JPG", alt: "Evening walk", w: 1200, h: 1600, aspect: "3/4" },
      { name: "IMG_2141.JPG", alt: "Goofy face", w: 1200, h: 1600, aspect: "3/4" },
      { name: "IMG_2273.JPG", alt: "Late-night laughs", w: 1200, h: 1600, aspect: "3/4" },
      { name: "IMG_3326.JPG", alt: "Airport moment", w: 1600, h: 1200, aspect: "4/3" },
      { name: "IMG_3377.JPG", alt: "Train window scene", w: 1600, h: 1200, aspect: "4/3" },
      { name: "IMG_3457.JPG", alt: "Snow day!", w: 1600, h: 1200, aspect: "4/3" }, // ~1.4MB — compress later
      // ❌ Skip for now (browser support/size):
      // "IMG_2499.HEIC", "IMG_2607.HEIC", "IMG_2683.HEIC" → convert to JPG/WebP before using
      // "IMG_2350.PNG" (11.9 MB) → convert to WebP/JPG (target < 500 KB) before adding
      // "cm-chat-media-video-1_... .MOV" → put in videos[] once we add /api/v
      // "recorded-977962684238.mp4" → put in videos[] (see below)
    ],
    videos: [
      { name: "recorded-977962684238.mp4", poster: "IMG_3326.JPG", caption: "Little moment" },
      // { name: "cm-chat-media-video-1_e564a8a4-afb5-581e-b3de-8b3287f47a44_142_3_0.MOV", caption: "Chat clip" } 
      // MOV will work once we add /api/v with correct Content-Type; consider converting to mp4/h.264 first.
    ],
  },

  {
    id: "2023-05_2024-12",
    title: "May 2023 – Dec 2024",
    base: "love/era2/",
    images: [
      { name: "IMG_9461.JPG", alt: "Campus steps", w: 1200, h: 1600, aspect: "3/4" },
    ],
    videos: [
      { name: "14B57F81-0DF7-429D-B2C9-35105D86DF70.mp4", caption: "Sunset clip" },
      { name: "235477A2-B33E-489F-9F19-E37C9481D233.mp4", caption: "Laugh attack" },
      { name: "59F4702C-4B92-4499-92DC-D8AD346CFFFC.mp4", caption: "Street vibes" },
      { name: "F90AB9A5-077D-4B34-B9DA-5B1D3B061F68.mp4", caption: "Mini vlog" },
    ],
  },
];
