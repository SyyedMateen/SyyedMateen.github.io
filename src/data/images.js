/**
 * TEMPORARY IMAGE CONFIG
 * ------------------------------------------------------------------
 * Every image URL used on the site is centralized here so the whole
 * set can be swapped for real photography / product screenshots in
 * one place. Placeholders are served from Picsum's seeded endpoint
 * (deterministic, always resolves, no API key) — replace the `url`
 * values with real assets (Unsplash exports, screenshots, the real
 * portrait) when available. Alt text is written for the FINAL
 * intended image, not the placeholder, so it can ship as-is.
 * ------------------------------------------------------------------
 */

const seed = (name, w, h) =>
  `https://picsum.photos/seed/${name}/${w}/${h}`;

export const images = {
  heroPortrait: {
  url: "/Images/rebot.gif",
  alt: "Editorial portrait of Syed Mateen",
  },

  aboutPortrait: {
  url: "/Images/aiBRAIN.jpg",
  alt: "Editorial portrait of Syed Mateen",
  },

  personalityPortrait: {
  url: "/Images/app-screen2.jpg",
  alt: "Editorial portrait of Syed Mateen",
  },

  cinematicBg: {
    url: seed("cinematic-blue-atmosphere", 1920, 1080),
    alt: "Abstract dark blue atmospheric background",
  },

  project01: {
  url: "/Images/Robotwali.gif",
  alt: "Editorial portrait of Syed Mateen",
  },

 project02: {
  url: "/Images/whatsapp-yakka-HQ.gif",
  alt: "Editorial portrait of Syed Mateen",
},

project03: {
  url: "/Images/travel.jpg",
  alt: "Editorial portrait of Syed Mateen",
  },

  project04: {
  url: "/Images/LD-Landscape.jpg",
  alt: "Editorial portrait of Syed Mateen",
  },

  processTexture: {
    url: seed("process-grid-texture", 1600, 1600),
    alt: "Abstract technical grid texture",
  },
};
