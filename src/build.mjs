// Builds the static site into dist/. `npm run build` runs this; the GitHub Pages workflow deploys dist/.
// Edit text here, rebuild, push. Static files live in static/ and are copied as they are.
// The 3D scene (src/scene) and page script (src/app) are bundled into static/assets/js on every build.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(ROOT, "dist");
const STATIC = path.join(ROOT, "static");

/* ---------- settings ---------- */
const SITE_URL = (process.env.SITE_URL || "https://www.syyedmateen.com").replace(/\/$/, "");
const PREVIEW = process.env.PREVIEW === "1"; // claude.ai preview build (fonts are self-hosted, so it matches the live site)
const DEFAULT_ACCENT = "blue";               // blue · violet · sunset · aurora
const EMAIL = "syyedmaten@gmail.com";
const WHATSAPP = "";                          // e.g. "923001234567". The icon appears when set.
const LINKEDIN = "https://www.linkedin.com/in/syyedmateen";
const INSTAGRAM = "https://www.instagram.com/syyed_mateen/";
const X_URL = "https://x.com/Syyedmateen";
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const arrow = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`;
const playIcon = `<svg viewBox="0 0 12 12" aria-hidden="true" fill="currentColor" width="12" height="12"><path d="M2 1l9 5-9 5z"/></svg>`;
const icons = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 8.6h3v10.2h-3zM6.7 4a1.7 1.7 0 1 1 0 3.5 1.7 1.7 0 0 1 0-3.5zM10.2 8.6h2.9V10c.4-.8 1.4-1.7 3-1.7 3.1 0 3.7 2 3.7 4.7v5.8h-3v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.2h-2.9z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8 18.4z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 4.5 19 19.5M19 4.5 5 19.5"/></svg>`,
  phones: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>`
};

/* ---------- JSON-LD entities ---------- */
const PERSON_ID = `${SITE_URL}/#person`;
const person = {
  "@type": "Person", "@id": PERSON_ID, name: "Syed Mateen", url: `${SITE_URL}/`,
  image: `${SITE_URL}/assets/img/syed-mateen.jpg`,
  jobTitle: "AI Automation & Digital Growth Specialist",
  description: "Syed Mateen builds AI agents and automations for businesses, makes AI-powered CGI product ads, and runs Meta and Google ad campaigns.",
  email: `mailto:${EMAIL}`,
  worksFor: { "@type": "Organization", name: "Lenaar Digital" },
  alumniOf: [{ "@type": "CollegeOrUniversity", name: "University of Karachi", alternateName: "Karachi University" }, { "@type": "EducationalOrganization", name: "Boys Degree College" }],
  homeLocation: { "@type": "Country", name: "Pakistan" },
  knowsAbout: ["AI agents", "AI voice agents", "Chatbots", "n8n workflow automation", "ElevenLabs", "Appointment booking automation", "Content repurposing automation", "CGI product ads", "AI video generation", "Social media management", "Meta Ads", "Google Ads", "Lead generation", "HubSpot CRM"],
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", name: "HubSpot Sales Hub Software", credentialCategory: "certification", recognizedBy: { "@type": "Organization", name: "HubSpot" }, dateCreated: "2026-10", identifier: "1f53857ab712465f8638e8c76f46c88e" },
    { "@type": "EducationalOccupationalCredential", name: "Google Ads Measurement Certification", credentialCategory: "certification", recognizedBy: { "@type": "Organization", name: "Google" }, dateCreated: "2026-10", expires: "2027-10", identifier: "196123032" }
  ],
  makesOffer: [
    ["AI agents", "AI automation", "Voice and chat agents that answer, book and follow up."],
    ["CGI ads", "Video advertising", "Product ads made with AI video tools, without a studio or a shoot."],
    ["Growth", "Paid advertising", "Meta and Google ad campaigns built around leads."],
    ["Automation", "Business automation", "Workflows that connect business tools and remove busywork."]
  ].map(([n, t, dsc]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n, serviceType: t, description: dsc, areaServed: "Worldwide" } })),
  sameAs: [LINKEDIN, INSTAGRAM, X_URL]
};
const website = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Syed Mateen", inLanguage: "en", publisher: { "@id": PERSON_ID }, about: { "@id": PERSON_ID } };

/* ---------- chrome ---------- */
function head({ title, desc, pathname, image = "/assets/img/og-image.jpg", type = "website", graph, root = "", noindex = false }) {
  const url = `${SITE_URL}${pathname}`;
  return `<!doctype html>
<html lang="en" data-accent="${DEFAULT_ACCENT}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}">
<meta name="author" content="Syed Mateen">
<meta name="theme-color" content="#040507">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Syed Mateen">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@Syyedmateen">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE_URL}${image}">
<link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png">
<link rel="manifest" href="${root}site.webmanifest">
<link rel="alternate" type="text/plain" title="LLM summary" href="${root}llms.txt">
<script>try{var a=localStorage.getItem("accent");a={purple:"violet",orange:"sunset",green:"aurora"}[a]||a;if(a)document.documentElement.setAttribute("data-accent",a)}catch(e){}document.documentElement.classList.add("js");setTimeout(function(){if(!window.__appReady){var l=document.getElementById("loader");if(l)l.remove()}},10000)</script>
<link rel="preload" href="${root}assets/fonts/unbounded-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/manrope-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/css/site.css">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body>`;
}
const PALETTE = [["blue", "Meta Blue", "#1f6fff", "#7cc4ff"], ["violet", "Royal Violet", "#6d4dff", "#d36bff"], ["sunset", "Sunset", "#ff4d4d", "#ffb347"], ["aurora", "Aurora", "#00c2a8", "#6ef0ff"]];
const swatchButtons = PALETTE.map(([k, l, a, b]) => `<button type="button" data-accent-pick="${k}" style="--c:${a};--c2:${b}" aria-label="${l}" title="${l}" aria-pressed="false"></button>`).join("");
// robot mark: follows the accent colours (header + footer); the favicon is a fixed blue copy
let markN = 0;
function mark() {
  const id = `mk${++markN}`;
  return `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent-2)"/><stop offset="1" style="stop-color:var(--accent)"/></linearGradient></defs><g transform="translate(32 34) scale(1.12) translate(-32 -34)"><line x1="32" y1="9" x2="32" y2="16" style="stroke:var(--accent-2)" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="8" r="3.4" style="fill:var(--accent-2)"/><rect x="7" y="27" width="5" height="14" rx="2.5" fill="url(#${id})"/><rect x="52" y="27" width="5" height="14" rx="2.5" fill="url(#${id})"/><rect x="11" y="16" width="42" height="35" rx="13" fill="url(#${id})"/><rect x="17" y="24" width="30" height="18" rx="9" fill="#05080f"/><circle class="eye" cx="26" cy="33" r="3.6" fill="#e6f4ff"/><circle class="eye" cx="38" cy="33" r="3.6" fill="#e6f4ff"/><path d="M15 21 Q20 17.5 27 17.6" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/></g></svg>`;
}
const speaker = `<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8v4h3l4 3.5v-11L6 8z" fill="currentColor" fill-opacity=".15"/><path class="w1" d="M13 7.5a3.5 3.5 0 0 1 0 5"/><path class="w2" d="M15.3 5.3a6.6 6.6 0 0 1 0 9.4"/><path class="x" d="M13.5 8l4 4M17.5 8l-4 4"/></svg>`;
function header(root) {
  const h = (id) => `${root}index.html#${id}`;
  return `<a class="skip" href="#content">Skip to content</a>
<header class="top">
  <a class="brand" href="${root}index.html" aria-label="Syed Mateen, home">${mark()}<span>Syed <span class="long">Mateen</span></span></a>
  <nav class="links" aria-label="Main">
    <a href="${h("services")}">Services</a>
    <a href="${h("cgi-ads")}">CGI Ads</a>
    <a href="${h("work")}">Work</a>
    <a href="${h("about")}">About</a>
  </nav>
  <div class="tools">
    <div class="swatches" role="group" aria-label="Colour">${swatchButtons}</div>
    <button type="button" class="snd" data-sound-toggle aria-pressed="false">${speaker}<span class="sr">Sound off</span></button>
    <button type="button" class="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Menu"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 5h12M2 11h12"/></svg></button>
    <a class="cta" href="${h("contact")}">Contact</a>
  </div>
</header>
<nav class="menu" id="menu" aria-label="Menu" hidden>
  <a href="${h("services")}">Services</a><a href="${h("cgi-ads")}">CGI Ads</a><a href="${h("work")}">Work</a><a href="${h("about")}">About</a><a href="${h("faq")}">FAQ</a><a href="${h("contact")}">Contact</a>
  <div class="swatches menu-sw" role="group" aria-label="Colour">${swatchButtons}</div>
</nav>`;
}
function socials() {
  const list = [["email", "Email", `mailto:${EMAIL}`], ["linkedin", "LinkedIn", LINKEDIN], ["instagram", "Instagram", INSTAGRAM], ...(WHATSAPP ? [["whatsapp", "WhatsApp", `https://wa.me/${WHATSAPP}`]] : []), ["x", "X", X_URL]];
  return `<ul class="socials">${list.map(([k, l, href]) => `<li><a href="${href}" aria-label="${l}"${href.startsWith("http") ? ' target="_blank" rel="me noopener"' : ""}>${icons[k]}</a></li>`).join("")}</ul>`;
}
function contactInner(heading, id) {
  return `<div class="in">
      <span class="kicker">Contact</span>
      <h2 id="h-${id}" data-scramble>${heading}</h2>
      <p class="soft">Tell me the problem. The first call is free.</p>
      <div class="actions"><a class="btn solid" href="mailto:${EMAIL}">Email me ${arrow}</a><a class="btn" href="${LINKEDIN}" target="_blank" rel="me noopener">LinkedIn</a></div>
      <span class="mail">${EMAIL}</span>
      ${socials()}
    </div>`;
}
function footer(root) {
  return `<footer class="site">
  <div class="wrap">
    <div class="f-brand"><a class="brand" href="${root}index.html">${mark()}<span>Syed Mateen</span></a><p>AI agents, CGI ads and marketing for businesses in the US and worldwide.</p></div>
    <nav aria-label="Footer">
      <a href="${root}ai-agents.html">AI Agents</a>
      <a href="${root}cgi-ads.html">CGI Ads</a>
      <a href="${root}marketing.html">Marketing</a>
      <a href="${root}privacy-policy.html">Privacy Policy</a>
      <a href="${root}terms.html">Terms</a>
    </nav>
    <div class="f-base"><span>© <span data-year>2026</span> Syed Mateen</span><a href="mailto:${EMAIL}">${EMAIL}</a></div>
  </div>
</footer>
<script src="${root}assets/js/app.js" defer></script>`;
}

function lightbox() {
  return `<dialog id="lb" class="lb" aria-label="Video">
  <div class="lb-in">
    <button class="lb-close" type="button" aria-label="Close">×</button>
    <div class="lb-media"><video playsinline controls></video></div>
    <div class="lb-info"><div><h3 data-lb-title></h3><p data-lb-text></p></div><a class="btn" data-lb-link href="#">Read the case study ${arrow}</a></div>
  </div>
</dialog>`;
}
// one playable card: media on top, caption underneath
function card(w, kind, root = "") {
  return `<button type="button" class="${kind} reveal" style="--ar:${w.ar || "9/16"}" data-video="${root}${w.video}"${kind === "ad" ? " data-has-sound" : ""} data-poster="${root}${w.poster}" data-title="${esc(w.title)}" data-text="${esc(w.text)}"${w.link ? ` data-link="${root}${w.link}"` : ""} aria-label="Play: ${esc(w.title)}${kind === "ad" ? " ad" : ""}">
          <span class="media"><video data-auto muted loop playsinline preload="none" poster="${root}${w.poster}" aria-hidden="true"><source src="${root}${w.video}" type="video/mp4"></video><span class="play" aria-hidden="true">${playIcon}</span></span>
          <span class="cap"><span class="t">${w.title}</span><span class="g">${w.tag}</span></span>
        </button>`;
}
const workRows = () => [[0, 2], [3, 1]].map((r) => `<div class="row">${r.map((i) => card(work[i], "tile")).join("\n        ")}</div>`).join("\n        ");

/* ---------- content ---------- */
const chapters = [
  { id: "services", title: "AI agents", text: "Voice and chat agents that answer, book and follow up, day and night.", tags: ["Voice AI", "Chatbots", "Booking"], link: ["See the AI agents", "ai-agents.html"] },
  { id: "ads", title: "CGI ads", text: "Product ads made with AI. No studio, no shoot.", tags: ["CGI", "AI video", "Reels"], link: ["See all CGI ads", "cgi-ads.html"] },
  { id: "growth", title: "Growth", text: "Meta and Google ads that bring real leads, not just clicks.", tags: ["Meta Ads", "Google Ads", "Lead gen"], link: ["Marketing services", "marketing.html"] },
  { id: "automation", title: "Automation", text: "Workflows that connect your tools and do the busywork.", tags: ["n8n", "Google Workspace", "APIs"], link: ["See the automations", "ai-agents.html"] }
];
const ads = [
  { title: "Pond's Hydra Miracle", tag: "Skincare · Spec ad", video: "assets/video/ponds-hydra-miracle.mp4", poster: "assets/img/ponds-poster.jpg", text: "A CGI spec ad that sells hydration without a word on screen. Not affiliated with Unilever.", link: "work/ponds-hydra-miracle-spec-ad.html" },
  { title: "Lumora serum", tag: "Skincare", video: "assets/video/lumora-serum-ad.mp4", poster: "assets/img/lumora-serum-ad-poster.jpg", text: "One drop, one face, one bottle. A clean skincare ad that ends on the product." },
  { title: "Jabeen's hair oil", tag: "Hair care", video: "assets/video/jabeens-hair-oil-ad.mp4", poster: "assets/img/jabeens-hair-oil-ad-poster.jpg", text: "Golden oil, leaves and slow pours, landing on the bottle and the brand." },
  { title: "Burger & fries", tag: "Food", video: "assets/video/burger-fries-ad.mp4", poster: "assets/img/burger-fries-ad-poster.jpg", text: "Exploding layers and flying fries. A food ad built for the first second of a Reel." },
  { title: "Sukoon Spa", tag: "Med spa", video: "assets/video/sukoon-spa-ad.mp4", poster: "assets/img/sukoon-spa-ad-poster.jpg", text: "A med spa story: welcome at the desk, consultation, then treatment." }
];
const work = [
  { ar: "16/9", title: "Clinic voice agent", tag: "AI agent", video: "assets/video/clinic.mp4", poster: "assets/img/clinic-poster.jpg", text: "Answers the phone, checks the calendar, offers the nearest free slot and never double-books.", link: "work/clinic-voice-booking-agent.html" },
  { ar: "4/5", title: "AI receptionist", tag: "Voice & chat", video: "assets/video/robot-receptionist.mp4", poster: "assets/img/robot-poster.jpg", text: "Answers calls and messages automatically, so no lead waits." },
  { ar: "16/9", title: "YouTube to Shorts", tag: "Automation", video: "assets/video/shorts.mp4", poster: "assets/img/shorts-poster.jpg", text: "One YouTube link in. Captioned, scheduled Shorts out.", link: "work/youtube-to-shorts-agent.html" },
  { ar: "16/9", title: "Onboarding agent", tag: "n8n workflow", video: "assets/video/onboarding-agent.mp4", poster: "assets/img/onboarding-poster.jpg", text: "A new-user form starts it. An AI agent sets the person up in every tool and adds them to the right Slack channels." },
];
const steps = [["Talk", "A short call about your problem. Free."], ["Build", "I build it and test it with your real tools."], ["Launch", "It goes live, and I keep improving it."]];
const quotes = [
  ["The booking agent picks up every call now. Our front desk finally has time for patients.", "Clinic owner"],
  ["The product ad looked like a studio shoot, and we never left the office.", "Brand manager"],
  ["Leads land in our CRM with a follow-up already sent. It just runs.", "Agency founder"]
];
const faqs = [
  ["What does Syed Mateen do?", "Syed Mateen builds AI agents and automations for businesses (voice and chat agents, booking and onboarding workflows, content pipelines), makes CGI product ads with AI video tools, and runs Meta and Google ad campaigns. He works with Lenaar Digital on AI automation and social media marketing for US clients."],
  ["What is an AI voice booking agent?", "A phone agent that answers calls, collects the caller's details and books the appointment. Syed's clinic version uses ElevenLabs for the voice and n8n for the logic. It checks opening hours and Google Calendar, offers the nearest free slot, blocks double bookings, logs the patient in Google Sheets and emails a confirmation."],
  ["Can you make a product ad without a film shoot?", "Yes. CGI product ads are made with AI video tools, then edited and captioned for Reels, Shorts and TikTok."],
  ["Which tools do you use?", "n8n, ElevenLabs, ChatGPT and Claude, Google Calendar, Sheets and Gmail, Klap, Telegram, Slack, HubSpot, Meta Ads and Google Ads."],
  ["Do you work with clients outside Pakistan?", "Yes. Mostly remote work with businesses in the United States and worldwide."]
];

/* ======================================================================= HOME */
function home() {
  const graph = [
    website, person,
    { "@type": "ProfilePage", "@id": `${SITE_URL}/#profile`, url: `${SITE_URL}/`, name: "Syed Mateen | AI Agents, Automation & CGI Ads", isPartOf: { "@id": `${SITE_URL}/#website` }, mainEntity: { "@id": PERSON_ID }, dateCreated: "2026-10-17", dateModified: TODAY },
    { "@type": "VideoObject", "@id": `${SITE_URL}/#reel`, name: "Syed Mateen reel", description: "A cinematic pass through the 3D scenes on this site, with original music: an AI core, a robot agent, a serum bottle, a lead funnel and a booking workflow.", thumbnailUrl: `${SITE_URL}/assets/img/reel-poster.jpg`, contentUrl: `${SITE_URL}/assets/video/reel.mp4`, uploadDate: TODAY, duration: "PT18S", creator: { "@id": PERSON_ID } },
    { "@type": "FAQPage", "@id": `${SITE_URL}/#faq`, mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "ItemList", "@id": `${SITE_URL}/#work`, name: "Selected work by Syed Mateen", itemListElement: [...ads, ...work].map((w, i) => ({ "@type": "ListItem", position: i + 1, name: w.title, ...(w.link ? { url: `${SITE_URL}/${w.link.replace(/\.html$/, "")}` } : {}) })) },
    ...ads.map((a) => ({ "@type": "VideoObject", name: `${a.title} ad by Syed Mateen`, description: a.text, thumbnailUrl: `${SITE_URL}/${a.poster}`, contentUrl: `${SITE_URL}/${a.video}`, uploadDate: "2026-10-17", creator: { "@id": PERSON_ID } }))
  ];
  const tools = ["n8n", "ElevenLabs", "Claude", "ChatGPT", "Google Flow", "Meta Ads", "Google Ads", "HubSpot", "Klap", "CapCut", "Shopify", "Figma"];
  const toolList = (hide) => tools.map((t) => `<li${hide ? ' aria-hidden="true"' : ""}>${t}</li>`).join("");
  return `${head({
    title: "Syed Mateen | AI Agents, Automation & CGI Ads",
    desc: "Syed Mateen builds AI agents and automations that save businesses time, and makes AI-powered ads that bring them customers. See the work.",
    pathname: "/", graph
  })}
<div class="loader" id="loader" role="dialog" aria-label="Loading">
  <div class="ld-in">
    <span class="ld-name">SYED MATEEN · PORTFOLIO</span>
    <span class="ld-count"><span data-count>000</span><small>%</small></span>
    <div class="ld-bar"><i></i></div>
    <div class="ld-enter" hidden><button class="btn solid" type="button" data-enter="sound">Enter with sound</button><button class="btn" type="button" data-enter="mute">Enter without sound</button></div>
    <span class="ld-tip">${icons.phones} Best with headphones</span>
  </div>
</div>
${header("")}
<canvas id="stage" aria-hidden="true" data-robot="assets/models/robot.js" data-ads="assets/video/loop/"></canvas>
<div class="hud" aria-hidden="true"><b>●</b><span data-chapter-now>00 · Intro</span></div>

<main id="content">
  <section id="hero" class="hero" data-station="0" aria-labelledby="h-hero">
    <div class="wrap">
      <span class="kicker">Syed Mateen · AI &amp; Growth</span>
      <h1 id="h-hero" data-scramble>AI agents, ads &amp; <span class="hl">automation.</span></h1>
      <p class="sub">I build AI that saves businesses time, and ads that bring them customers.</p>
      <div class="actions"><a class="btn solid" href="#work">See my work ${arrow}</a><button class="btn" type="button" data-video="assets/video/reel.mp4" data-has-sound data-poster="assets/img/reel-poster.jpg" data-title="The reel" data-text="A pass through the 3D scenes on this site, with its original soundtrack.">${playIcon} Watch the reel</button></div>
      <span class="scroll"><i></i>Scroll</span>
    </div>
  </section>

  ${chapters.map((c, i) => `<section id="${c.id}" class="chapter" data-station="${i + 1}" aria-labelledby="h-${c.id}">
    <div class="wrap"><div class="text">
      <span class="num">0${i + 1} / 04</span>
      <h2 id="h-${c.id}">${c.title}</h2>
      <p>${c.text}</p>
      <ul class="tags">${c.tags.map((t) => `<li>${t}</li>`).join("")}</ul>
      ${c.link ? `<a class="more" href="${c.link[1]}">${c.link[0]} →</a>` : ""}
    </div></div>
  </section>`).join("\n  ")}

  <section id="cgi-ads" class="band fade" data-cover aria-labelledby="h-ads-shelf">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">CGI ads</span><h2 id="h-ads-shelf" data-scramble>Ads made with AI.</h2></div><a class="link-more" href="cgi-ads.html">All CGI ads ${arrow}</a></div>
      <div class="shelf">
        ${ads.map((w) => card(w, "ad")).join("\n        ")}
      </div>
    </div>
  </section>

  <section id="work" class="band" data-cover aria-labelledby="h-work">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">AI &amp; automation</span><h2 id="h-work" data-scramble>Things I've built.</h2></div><a class="link-more" href="ai-agents.html">All AI agents ${arrow}</a></div>
      <div class="grid">
        ${workRows()}
      </div>
    </div>
  </section>

  <div class="strip" aria-label="Tools"><ul>${toolList(false)}${toolList(true)}</ul></div>

  <section id="process" class="band" data-cover aria-labelledby="h-process">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">How it works</span><h2 id="h-process" data-scramble>Three steps.</h2></div></div>
      <ol class="steps reveal">${steps.map(([t, b], i) => `<li><span class="n">0${i + 1}</span><h3>${t}</h3><p>${b}</p></li>`).join("")}</ol>
    </div>
  </section>

  <section id="voices" class="band" data-cover aria-labelledby="h-voices">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">What clients say</span><h2 id="h-voices" data-scramble>In their words.</h2></div><p class="soft">Example testimonials, shown until real client quotes are added.</p></div>
      <div class="quotes reveal">${quotes.map(([q, who]) => `<figure class="quote"><blockquote>${q}</blockquote><footer><span>${who}</span><span class="ex">Example only</span></footer></figure>`).join("")}</div>
    </div>
  </section>

  <section id="about" class="band" data-cover aria-labelledby="h-about">
    <div class="wrap about reveal">
      <figure><picture><source srcset="assets/img/hero-desk.webp" type="image/webp"><img src="assets/img/hero-desk.jpg" width="1600" height="899" alt="Syed Mateen at his desk with a podcast microphone" loading="lazy"></picture></figure>
      <div class="txt">
        <span class="kicker">About</span>
        <h2 id="h-about" data-scramble>Hi, I'm Syed.</h2>
        <p>I build <strong>AI agents and automations</strong>, and make <strong>AI-powered ads</strong>, for businesses in the US and worldwide.</p>
        <p>I work with Lenaar Digital and study computer science at the University of Karachi.</p>
        <ul class="creds"><li>Google Ads Measurement certified</li><li>HubSpot Sales Hub certified</li></ul>
      </div>
    </div>
  </section>

  <section id="faq" class="band" data-cover aria-labelledby="h-faq">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">FAQ</span><h2 id="h-faq" data-scramble>Quick answers.</h2></div></div>
      <div class="faq reveal">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join("")}</div>
    </div>
  </section>

  <section id="contact" class="contact" data-station="5" aria-labelledby="h-contact">
    <div class="wrap">${contactInner("Let's build something.", "contact")}</div>
  </section>
</main>
${footer("")}

${lightbox()}
<script src="assets/models/ads.js" defer></script>
<script src="assets/js/scene.js" defer></script>
</body>
</html>
`;
}

/* ======================================================================= CASE STUDIES */
const videoBlock = (id, name, label, poster, note) => `<figure style="margin:0;display:grid;gap:10px">
        <div class="player">
          <video id="${id}" data-auto muted loop playsinline preload="metadata" poster="../assets/img/${poster}" aria-label="${esc(label)}"><source src="../assets/video/${name}.mp4" type="video/mp4"></video>
          <div class="vctl"><button type="button" data-toggle-video="${id}">Pause</button></div>
        </div>
        <figcaption class="soft" style="font-size:.86rem">${note}</figcaption>
      </figure>`;

const cases = [
  {
    slug: "clinic-voice-booking-agent", crumb: "Clinic voice booking agent", kicker: "Case 01 · AI agent · Voice",
    title: "AI Voice Booking Agent for Clinics (n8n) | Syed Mateen",
    desc: "How Syed Mateen built an AI voice agent that books clinic appointments, checks hours and Google Calendar, offers the nearest free slot and blocks double bookings.",
    h1: "A voice agent that books clinic appointments without double-booking anyone.",
    lede: "Booking one appointment by phone takes a receptionist seven steps. This agent does all seven, and knows what to do when the request doesn't fit.",
    tldr: "An AI voice agent built with ElevenLabs answers a clinic's booking calls and passes the caller's details to an n8n workflow. The workflow checks the request against clinic hours, weekends, past dates and missing details, checks Google Calendar, then books the slot, offers the nearest free one, or offers another day or a callback. It re-checks the slot before confirming so two callers can't take the same time, logs the patient in Google Sheets and sends a confirmation from Gmail.",
    facts: [["Role", "Design and build"], ["Built with", "ElevenLabs · n8n"], ["Connected to", "Calendar · Sheets · Gmail"], ["First shared", "August 2026"]],
    published: "2026-08-17", image: "/assets/img/clinic-poster.jpg",
    about: ["AI voice agent", "Appointment booking automation", "n8n", "ElevenLabs"],
    keywords: ["AI voice agent for clinics", "appointment booking automation", "n8n ElevenLabs", "prevent double booking"],
    video: { name: "Clinic voice booking agent: workflow logic", desc: "A motion explainer of how the clinic voice agent checks a request, finds the nearest free slot, locks it against a second caller and confirms the booking.", mp4: "/assets/video/clinic.mp4", duration: "PT14S" },
    media: videoBlock("caseVideo", "clinic", "Motion explainer of the clinic booking workflow", "clinic-poster.jpg", "Motion explainer of the workflow logic. It illustrates the rules; it is not a recording of a live clinic."),
    sections: [
      ["The problem", `<p>When a patient calls to book, a receptionist normally works through every step by hand:</p><ol class="flow-list"><li>Answer the call</li><li>Collect the patient's details</li><li>Check the calendar</li><li>Confirm availability</li><li>Book the appointment</li><li>Record the details</li><li>Send a confirmation</li></ol><p>None of it is hard. All of it is repetitive, and it happens while other patients wait at the desk.</p>`],
      ["How it works", `<ol class="flow-list"><li>The voice agent answers<span>ElevenLabs handles the conversation and collects the name, contact details and requested time.</span></li><li>The details go to n8n<span>The logic lives in one workflow you can read and change.</span></li><li>The request is checked<span>Clinic hours, weekends and past dates, and anything missing.</span></li><li>The calendar is checked<span>Google Calendar is the source of truth for what's free.</span></li><li>The booking is confirmed<span>Calendar updated, patient logged in Google Sheets, confirmation sent from Gmail, and the status goes back to the voice agent.</span></li></ol>`],
      ["Every situation", `<div class="table-wrap"><table><thead><tr><th scope="col">Situation</th><th scope="col">What the agent does</th></tr></thead><tbody>
        <tr><td><span class="st">Slot available</span></td><td>Books the appointment.</td></tr>
        <tr><td><span class="st">Slot unavailable</span></td><td>Finds the nearest free slot and offers it.</td></tr>
        <tr><td><span class="st">No suitable slot</span></td><td>Offers another day or a callback.</td></tr>
        <tr><td><span class="st">Slot taken mid-call</span></td><td>Blocks the duplicate and offers another time.</td></tr>
        <tr><td><span class="st">Closed or past date</span></td><td>Explains why and asks for a different time.</td></tr>
        <tr><td><span class="st">Missing details</span></td><td>Asks for what's missing first.</td></tr></tbody></table></div>`],
      ["What I learned", `<p><strong>The interesting part wasn't connecting the tools. It was building the logic and guardrails around them.</strong> You have to decide what happens when details are incomplete, the clinic is closed, or two callers want the same slot at the same moment. That's where automation stops being a demo and becomes a business system.</p>`]
    ],
    next: ["YouTube to Shorts agent", "youtube-to-shorts-agent.html"], cta: "Want an agent like this on your phone line?"
  },
  {
    slug: "youtube-to-shorts-agent", crumb: "YouTube to Shorts agent", kicker: "Case 02 · Automation · Content",
    title: "YouTube to Shorts AI Agent: Clip & Publish | Syed Mateen",
    desc: "An AI agent by Syed Mateen that turns one YouTube video into captioned, scheduled Shorts, publishes them to connected platforms and reports back on Telegram.",
    h1: "One YouTube link in. Captioned, scheduled Shorts out.",
    lede: "Generating Shorts is the easy part. This agent automates everything around them.",
    tldr: "You send the agent a YouTube URL and the number of Shorts you want. It extracts the strongest clips, adds captions, generates the Shorts through Klap, checks the processing, calculates publishing times, uploads to the connected platforms and sends a summary on Telegram.",
    facts: [["Role", "Design and build"], ["Input", "YouTube URL + clip count"], ["Built with", "Klap · Telegram"], ["First shared", "September 2026"]],
    published: "2026-09-02", image: "/assets/img/shorts-poster.jpg",
    about: ["AI agent", "Content repurposing automation", "YouTube Shorts"],
    keywords: ["YouTube to Shorts automation", "repurpose long-form video", "auto publish Shorts", "Klap automation"],
    video: { name: "YouTube to Shorts agent: pipeline", desc: "A motion explainer of the pipeline: input, clip finding, captions, scheduling, publishing and the Telegram summary.", mp4: "/assets/video/shorts.mp4", duration: "PT12S" },
    media: videoBlock("caseVideo", "shorts", "Motion explainer of the YouTube to Shorts pipeline", "shorts-poster.jpg", "Motion explainer of the pipeline. The example URL, clip count and times are illustrative."),
    sections: [
      ["The problem", `<p>Turning one long video into Shorts by hand means downloading it, finding timestamps, writing every caption and uploading to each platform one by one.</p>`],
      ["How it works", `<ol class="flow-list"><li>Send the input<span>A YouTube URL and the number of Shorts.</span></li><li>Clips are extracted<span>The agent picks the important moments.</span></li><li>Captions are added</li><li>Shorts are generated through Klap<span>Processing is checked before anything moves on.</span></li><li>Publishing times are calculated</li><li>Content is uploaded<span>To each connected platform.</span></li><li>A Telegram summary comes back</li></ol>`],
      ["Why it matters", `<p><strong>The interesting part isn't generating Shorts. It's automating the whole workflow around them.</strong> Send the video, and the agent handles the rest.</p><ul class="chips"><li>Klap</li><li>Telegram</li><li>Scheduling</li><li>Multi-platform publishing</li></ul>`]
    ],
    next: ["Pond's Hydra Miracle spec ad", "ponds-hydra-miracle-spec-ad.html"], cta: "Have long videos that should work harder?"
  },
  {
    slug: "ponds-hydra-miracle-spec-ad", crumb: "Pond's spec ad", kicker: "Case 03 · CGI ad · Spec work",
    title: "Pond's Hydra Miracle Spec Ad: CGI Ad Breakdown | Syed Mateen",
    desc: "Syed Mateen's CGI spec ad for Pond's Hydra Miracle: how one colour, water and a corridor of bottles sell hydration without saying the word.",
    h1: "Selling hydration without saying \"hydration.\"",
    lede: "Twenty seconds. Not one word of copy. And you still know what the serum does.",
    tldr: "A vertical CGI spec ad for Pond's Hydra Miracle, made with AI video tools. The whole frame stays in the bottle's pale blue, water tells the story, lab glassware signals science, and a corridor of bottles narrows to one.",
    facts: [["Type", "Spec ad"], ["Length", "About 20 seconds"], ["Format", "9:16 for Reels and Shorts"], ["First shared", "October 2026"]],
    published: "2026-10-13", image: "/assets/img/ponds-poster.jpg",
    about: ["CGI product ad", "AI video advertising", "Skincare marketing"],
    keywords: ["CGI product ad", "AI video ad", "skincare ad creative", "spec ad"],
    video: { name: "Pond's Hydra Miracle spec ad", desc: "A vertical CGI spec ad for Pond's Hydra Miracle serum made with AI video tools.", mp4: "/assets/video/ponds-hydra-miracle.mp4", duration: "PT18S", uploaded: "2026-10-13" },
    media: `<figure style="margin:0;display:grid;gap:10px">
        <div class="player fit">
          <video id="caseVideo" data-auto muted loop playsinline preload="metadata" poster="../assets/img/ponds-poster.jpg" aria-label="Pond's Hydra Miracle spec ad"><source src="../assets/video/ponds-hydra-miracle.mp4" type="video/mp4"></video>
          <div class="vctl"><button type="button" data-unmute="caseVideo">Sound on</button><button type="button" data-toggle-video="caseVideo">Pause</button></div>
        </div>
        <figcaption class="soft" style="font-size:.86rem">Spec work. Not commissioned by, affiliated with or endorsed by Unilever or Pond's.</figcaption>
      </figure>`,
    sections: [
      ["The brief", `<p class="disclaimer">A self-initiated spec ad. Pond's and Hydra Miracle are trademarks of Unilever.</p><p>The brief: <strong>sell hydration without saying "hydration."</strong> No voiceover, no on-screen copy, built for Reels and Shorts.</p>`],
      ["The decisions", `<h3>One colour, start to finish</h3><p>Everything lives in the brand's pale blue, so the product never fights for attention.</p><h3>Water does the talking</h3><p>Drops, ripples and a bottle sinking into water make the connection before anyone reads the label.</p><h3>Lab shots for trust</h3><p>Beakers in the background say "formulated," not "decorated."</p><h3>Repetition, then focus</h3><p>A corridor of bottles shows scale, then the camera narrows to one.</p><h3>The first second decides</h3><p>On Reels, people decide in about a second. The opening shot has to earn the rest.</p>`],
      ["The takeaway", `<p><strong>Most beauty ads try to say five things. This one tries to make you feel one.</strong></p><ul class="chips"><li>AI video</li><li>Art direction</li><li>Editing</li><li>Reels &amp; Shorts</li></ul>`]
    ],
    next: ["Clinic voice booking agent", "clinic-voice-booking-agent.html"], cta: "Want a product film like this?"
  }
];

function casePage(c) {
  const url = `${SITE_URL}/work/${c.slug}`;
  const graph = [
    website, person,
    { "@type": "Article", "@id": `${url}#article`, headline: c.h1, description: c.desc, url, mainEntityOfPage: url, image: `${SITE_URL}${c.image}`, datePublished: c.published, dateModified: TODAY, author: { "@id": PERSON_ID }, publisher: { "@id": PERSON_ID }, inLanguage: "en", about: c.about, keywords: c.keywords.join(", "), video: { "@id": `${url}#video` } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/#work` },
      { "@type": "ListItem", position: 3, name: c.crumb, item: url }
    ] },
    { "@type": "VideoObject", "@id": `${url}#video`, name: c.video.name, description: c.video.desc, thumbnailUrl: `${SITE_URL}${c.image}`, contentUrl: `${SITE_URL}${c.video.mp4}`, uploadDate: c.video.uploaded || TODAY, duration: c.video.duration, creator: { "@id": PERSON_ID } }
  ];
  return `${head({ title: c.title, desc: c.desc, pathname: `/work/${c.slug}`, type: "article", graph, root: "../" })}
${header("../")}
<main id="content">
  <section class="case-hero">
    <div class="wrap">
      <ol class="crumbs" aria-label="Breadcrumb"><li><a href="../index.html">Home</a></li><li><a href="../index.html#work">Work</a></li><li aria-current="page">${esc(c.crumb)}</li></ol>
      <span class="kicker rise">${c.kicker}</span>
      <h1 class="rise d1" data-scramble>${c.h1}</h1>
      <p class="lede rise d2">${c.lede}</p>
      ${c.media}
      <div class="tldr"><strong>In short</strong><p>${c.tldr}</p></div>
      <dl class="facts-row">${c.facts.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join("")}</dl>
    </div>
  </section>
  <div class="case-body"><div class="wrap">
    ${c.sections.map(([h, body]) => `<section class="case-sec reveal"><h2>${h}</h2><div class="content">${body}</div></section>`).join("\n    ")}
    <div class="next-case"><span class="kicker">Next</span><a href="${c.next[1]}">${c.next[0]} →</a></div>
  </div></div>
  <section id="contact" class="case-contact" aria-labelledby="h-contact"><div class="wrap">${contactInner(c.cta, "contact")}</div></section>
</main>
${footer("../")}
</body>
</html>
`;
}

function notFound() {
  return `${head({ title: "Page not found | Syed Mateen", desc: "This page doesn't exist. Head back to Syed Mateen's AI agents, automations and CGI ads.", pathname: "/404", graph: [website], root: "/", noindex: true })}
${header("/")}
<main id="content"><section class="case-hero" style="min-height:86svh"><div class="wrap">
  <span class="kicker">404</span>
  <h1 data-scramble>This page didn't make the final cut.</h1>
  <p class="lede">The page you asked for doesn't exist. The work does.</p>
  <div class="actions"><a class="btn solid" href="/">Back home ${arrow}</a><a class="btn" href="/#work">See the work</a></div>
</div></section></main>
${footer("/")}
</body></html>
`;
}


/* ======================================================================= SERVICE PAGES (footer: AI Agents · CGI Ads · Marketing) */
const svcCards = (items) => `<ul class="svc" style="--n:${items.length}">${items.map(([t, b]) => `<li class="reveal"><h3>${t}</h3><p>${b}</p></li>`).join("")}</ul>`;
const svcFaq = (list) => `<div class="faq reveal">${list.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join("")}</div>`;
const sec = (kicker, h, body, extra = "") => `<section class="band" data-cover><div class="wrap"><div class="head reveal"><div><span class="kicker">${kicker}</span><h2 data-scramble>${h}</h2></div>${extra}</div>${body}</div></section>`;
const services = {
  agents: {
    file: "ai-agents.html", crumb: "AI Agents", kicker: "Services · AI agents",
    title: "AI Agents & Automation | Syed Mateen",
    desc: "AI voice agents, chat agents and n8n automations by Syed Mateen: a clinic booking agent, an AI receptionist, a Shorts pipeline and an onboarding agent.",
    h1: `AI agents that <span class="hl">do the work.</span>`,
    lede: "Voice and chat agents that answer, book and follow up, and workflows that connect your tools. Built with n8n, ElevenLabs, Claude and ChatGPT.",
    service: "AI agent and workflow automation development",
    vis: ["assets/img/clinic-poster.jpg", "assets/img/onboarding-poster.jpg", "assets/img/robot-poster.jpg"], visKind: "wide",
    faq: [
      ["What can an AI agent do for a small business?", "Answer calls and messages, book appointments into your calendar, qualify leads, send follow-ups and keep your CRM or Google Sheets up to date, day and night."],
      ["Which tools do you build with?", "n8n for the workflows, ElevenLabs for voice, Claude and ChatGPT models for the thinking, plus Google Calendar, Sheets, Gmail, Slack, Telegram and HubSpot."],
      ["How long does a build take?", "A focused agent, like a booking line, usually takes one to two weeks including testing with your real tools."]
    ],
    body: () => [
      sec("Selected work", "Agents and automations.", `<div class="grid">${workRows()}</div>`, `<p class="soft">Tap any card to watch.</p>`),
      sec("What I build", "Four kinds of help.", svcCards([
        ["Voice agents", "Pick up every call, answer questions, book the appointment and send the confirmation."],
        ["Chat agents", "Website and WhatsApp chat that answers instantly and hands warm leads to you."],
        ["Workflow automation", "n8n flows that connect your CRM, calendar, sheets and Slack, so nobody copies data by hand."],
        ["Content pipelines", "Long videos in, captioned Shorts out, scheduled and posted for you."]
      ])),
      sec("Case studies", "How they were built.", `<div class="cases reveal"><a href="work/clinic-voice-booking-agent.html"><span class="g">Voice AI · n8n</span><b>Clinic voice booking agent</b><span class="go">${arrow}</span></a><a href="work/youtube-to-shorts-agent.html"><span class="g">Automation</span><b>YouTube to Shorts agent</b><span class="go">${arrow}</span></a></div>`)
    ]
  },
  ads: {
    file: "cgi-ads.html", crumb: "CGI Ads", kicker: "Services · CGI ads",
    title: "CGI Ads Made with AI | Syed Mateen",
    desc: "CGI product ads made with AI video tools by Syed Mateen: skincare, hair care, food and med spa ads for Reels, Shorts and TikTok. No studio, no shoot.",
    h1: `CGI ads, <span class="hl">made with AI.</span>`,
    lede: "Product ads for Reels, Shorts and TikTok. No studio, no shoot. Tap any ad to watch it with sound.",
    service: "CGI product ad production with AI video tools",
    vis: ["assets/img/lumora-serum-ad-poster.jpg", "assets/img/ponds-poster.jpg", "assets/img/burger-fries-ad-poster.jpg"], visKind: "tall",
    faq: [
      ["What is a CGI ad?", "A product ad where the scenes are generated rather than filmed: liquids, splashes, exploding layers and impossible camera moves that would cost a studio day to shoot."],
      ["Do I need to send the product?", "No. Clear photos of the product and its label are enough to build the shots around it."],
      ["Which formats do I get?", "Vertical 9:16 for Reels, Shorts and TikTok by default, plus square or widescreen cuts when you need them."]
    ],
    body: () => [
      sec("All ads", "The collection.", `<div class="ads-grid">${ads.map((w) => `<div class="ad-item">${card(w, "ad")}<p>${esc(w.text)}</p></div>`).join("")}</div>`, `<p class="soft">${ads.length} ads · sound on</p>`),
      sec("How it's made", "Three steps.", `<ol class="steps reveal">${[["Brief", "The product, the audience and the one thing the first second must say."], ["Generate", "Scenes built with AI video tools such as Google Flow, shot by shot, around your product."], ["Finish", "Edit, sound, captions and every format you need, ready to post."]].map(([t, b], i) => `<li><span class="n">0${i + 1}</span><h3>${t}</h3><p>${b}</p></li>`).join("")}</ol>`),
      sec("Case study", "Behind one ad.", `<div class="cases reveal"><a href="work/ponds-hydra-miracle-spec-ad.html"><span class="g">Skincare · Spec ad</span><b>Pond's Hydra Miracle</b><span class="go">${arrow}</span></a></div>`)
    ]
  },
  marketing: {
    file: "marketing.html", crumb: "Marketing", kicker: "Services · Marketing",
    title: "Digital Marketing: Meta & Google Ads | Syed Mateen",
    desc: "Digital marketing by Syed Mateen: Meta and Google Ads campaigns, social content, SEO and AI search visibility, and lead follow-up that turns clicks into customers.",
    h1: `Marketing that brings <span class="hl">customers.</span>`,
    lede: "Meta and Google campaigns, scroll-stopping creative and fast follow-up, set up to bring leads, not just clicks.",
    service: "Digital marketing: Meta Ads, Google Ads, social media and SEO",
    vis: ["assets/img/sukoon-spa-ad-poster.jpg", "assets/img/jabeens-hair-oil-ad-poster.jpg", "assets/img/burger-fries-ad-poster.jpg"], visKind: "tall",
    faq: [
      ["Do you run Meta and Google ads?", "Yes. Campaign setup, audiences, creative testing and conversion tracking on Meta (Facebook and Instagram) and Google (Search and YouTube)."],
      ["Can you make the ad creative too?", "Yes. CGI product ads and short-form videos are made in-house, so the creative and the campaign are planned together."],
      ["What is AI search optimisation?", "Structuring your site and content so Google, ChatGPT, Claude and Perplexity can understand it and quote it, using clear answers, schema markup and an llms.txt file."]
    ],
    body: () => [
      sec("What I do", "Five ways to grow.", svcCards([
        ["Meta Ads", "Facebook and Instagram campaigns with clear audiences, tested creative and proper pixel tracking."],
        ["Google Ads", "Search and YouTube campaigns measured on real conversions. Google Ads Measurement certified."],
        ["Social content", "Reels, Shorts and posts with captions, planned and scheduled so your page never goes quiet."],
        ["SEO & AI search", "Pages that Google and AI assistants can read, trust and quote, with schema and clear answers."],
        ["Lead follow-up", "Every lead lands in your CRM with a reply already sent, so nobody goes cold. HubSpot certified."]
      ])),
      sec("Creative", "Ads that stop the scroll.", `<div class="ads-grid three">${ads.slice(0, 3).map((w) => `<div class="ad-item">${card(w, "ad")}</div>`).join("")}</div>`, `<a class="link-more" href="cgi-ads.html">All CGI ads ${arrow}</a>`),
      sec("How it works", "Three steps.", `<ol class="steps reveal">${[["Audit", "A look at your ads, page and tracking. What works stays, what leaks gets fixed."], ["Launch", "Campaigns, creative and follow-up go live together, measured from day one."], ["Improve", "Weekly changes based on cost per lead, not likes."]].map(([t, b], i) => `<li><span class="n">0${i + 1}</span><h3>${t}</h3><p>${b}</p></li>`).join("")}</ol>`)
    ]
  }
};
function servicePage(k) {
  const P = services[k], url = `${SITE_URL}/${P.file}`;
  const graph = [
    website, person,
    { "@type": "WebPage", "@id": `${url}#page`, url, name: P.title, description: P.desc, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${url}#service` }, dateModified: TODAY },
    { "@type": "Service", "@id": `${url}#service`, name: P.service, serviceType: P.crumb, provider: { "@id": PERSON_ID }, areaServed: ["United States", "Worldwide"], url },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: P.crumb, item: url }] },
    { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: P.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ...(k === "ads" ? ads.map((a) => ({ "@type": "VideoObject", name: `${a.title} ad by Syed Mateen`, description: a.text, thumbnailUrl: `${SITE_URL}/${a.poster}`, contentUrl: `${SITE_URL}/${a.video}`, uploadDate: "2026-10-17", creator: { "@id": PERSON_ID } })) : [])
  ];
  return `${head({ title: P.title, desc: P.desc, pathname: `/${P.file}`, graph })}
${header("")}
<main id="content" class="svc-page">
  <section class="case-hero"><div class="wrap">
    <div class="hero-vis ${P.visKind}" aria-hidden="true">${P.vis.map((src) => `<img src="${src}" alt="" loading="eager" decoding="async">`).join("")}</div>
    <ol class="crumbs" aria-label="Breadcrumb"><li><a href="index.html">Home</a></li><li aria-current="page">${P.crumb}</li></ol>
    <span class="kicker rise">${P.kicker}</span>
    <h1 class="rise d1" data-scramble>${P.h1}</h1>
    <p class="lede rise d2">${P.lede}</p>
    <div class="actions rise d3"><a class="btn solid" href="#contact">Start a project ${arrow}</a><a class="btn" href="index.html#work">See all work</a></div>
  </div></section>
  ${P.body().join("\n  ")}
  ${sec("FAQ", "Quick answers.", svcFaq(P.faq))}
  <section id="contact" class="case-contact" aria-labelledby="h-contact"><div class="wrap">${contactInner("Let's build something.", "contact")}</div></section>
</main>
${footer("")}
${lightbox()}
</body>
</html>
`;
}

/* ======================================================================= LEGAL PAGES */
const LEGAL_EMAIL = "matfinanceinfo@gmail.com"; // contact address used by the original policies (kept so app reviews still match)
const LEGAL_UPDATED = "17 October 2026";
const legal = {
  privacy: {
    file: "privacy-policy.html", title: "Privacy Policy", desc: "How syyedmateen.com and Syed Mateen's content tools handle information: what is collected, connected accounts and your choices.",
    sections: [
      ["Who this covers", `<p>This policy covers the website syyedmateen.com and the content management tools Syed Mateen builds and operates, including tools that connect to social media accounts to prepare and publish video content.</p>`],
      ["What the website collects", `<p>The website has no sign-up, no contact form and no advertising trackers. When you visit:</p><ul><li>Your browser stores your colour choice and your sound setting on your own device (local storage). They never leave your device.</li><li>Fonts are served from this website itself. No third-party font service is contacted.</li><li>The site is hosted on GitHub Pages, which may keep standard server logs such as IP address and pages requested.</li></ul><p>If you email or message me, I receive whatever you choose to send and use it only to reply.</p>`],
      ["Connected social media accounts", `<p>When you authorise a supported platform (for example TikTok), the tools may receive basic profile details and authorisation tokens from that platform's official sign-in. This is used only to connect your account and upload or publish the videos you ask for.</p>`],
      ["Your videos", `<p>Videos you supply are processed only to prepare, upload or publish them to the platform you choose. You are responsible for having the rights to anything you upload or publish.</p>`],
      ["Sharing", `<p>Your information is never sold. It is shared only where needed to provide the feature you asked for, to operate the platform integration, or to comply with the law.</p>`],
      ["Security and retention", `<p>Reasonable technical and organisational measures protect the information the tools handle. Information is kept only as long as needed to provide the service, meet legal obligations or resolve disputes. You can revoke a platform's access at any time in that platform's settings.</p>`],
      ["Children", `<p>The tools are not intended for children under the age required by law in your country, and their information is not knowingly collected.</p>`],
      ["Changes", `<p>This policy may change. The date at the top always shows the latest version.</p>`],
      ["Contact", `<p>Privacy questions: <a href="mailto:${LEGAL_EMAIL}">${LEGAL_EMAIL}</a></p>`]
    ]
  },
  terms: {
    file: "terms.html", title: "Terms of Service", desc: "Terms for using syyedmateen.com and Syed Mateen's content tools: your responsibilities, connected accounts and availability.",
    sections: [
      ["About these terms", `<p>These terms apply to the website syyedmateen.com and to the content management tools and social media integrations Syed Mateen provides.</p>`],
      ["Using the tools", `<p>The tools let authorised users manage, prepare, upload and publish video content to supported social media platforms.</p>`],
      ["Your responsibilities", `<p>You are responsible for the content you upload or publish and for holding every right, licence and permission it needs. You keep control of your connected accounts and should review the permissions you grant.</p>`],
      ["Not allowed", `<p>Don't use the tools for anything unlawful, for unauthorised access, fraud or abuse, to infringe intellectual property, or for content that breaks the rules of the platform you publish to.</p>`],
      ["Third-party platforms", `<p>The tools work with third-party platforms. Their own terms and privacy policies also apply when you use them.</p>`],
      ["Website content", `<p>The work shown on this website, including ads and videos, belongs to Syed Mateen or the relevant brand owner. Spec work is marked as such and is not endorsed by the brands shown. Testimonials marked "Example only" are placeholders, not real client quotes.</p>`],
      ["Availability", `<p>Parts of the tools may be changed, paused or stopped for maintenance, security or development. They are provided as available, without a guarantee that they will always be uninterrupted or error-free.</p>`],
      ["Changes", `<p>These terms may change. The date at the top always shows the latest version.</p>`],
      ["Contact", `<p>Questions about these terms: <a href="mailto:${LEGAL_EMAIL}">${LEGAL_EMAIL}</a></p>`]
    ]
  }
};
function legalPage(k) {
  const L = legal[k], url = `${SITE_URL}/${L.file}`;
  const graph = [website, person, { "@type": "WebPage", "@id": `${url}#page`, url, name: L.title, isPartOf: { "@id": `${SITE_URL}/#website` }, dateModified: TODAY }];
  return `${head({ title: `${L.title} | Syed Mateen`, desc: L.desc, pathname: `/${L.file}`, graph })}
${header("")}
<main id="content" class="legal">
  <section class="case-hero"><div class="wrap">
    <ol class="crumbs" aria-label="Breadcrumb"><li><a href="index.html">Home</a></li><li aria-current="page">${L.title}</li></ol>
    <span class="kicker">Legal</span>
    <h1>${L.title}</h1>
    <p class="lede">Last updated ${LEGAL_UPDATED}</p>
  </div></section>
  <div class="case-body"><div class="wrap">
    <nav class="toc" aria-label="On this page"><ol>${L.sections.map(([h], i) => `<li><a href="#s${i + 1}">${h}</a></li>`).join("")}</ol></nav>
    ${L.sections.map(([h, body], i) => `<section class="case-sec" id="s${i + 1}"><h2>${h}</h2><div class="content">${body}</div></section>`).join("\n    ")}
  </div></div>
</main>
${footer("")}
</body>
</html>
`;
}

/* ---------- crawler + AI files ---------- */
const sitemapPages = [
  { p: "/", pr: "1.0", v: { t: "Syed Mateen reel", d: "A cinematic pass through the 3D scenes on this site.", th: "/assets/img/reel-poster.jpg", u: "/assets/video/reel.mp4", dur: 18 } },
  ...cases.map((c) => ({ p: `/work/${c.slug}`, pr: "0.8", v: { t: c.video.name, d: c.video.desc, th: c.image, u: c.video.mp4, dur: parseInt(c.video.duration.replace(/\D/g, ""), 10) } })),
  { p: "/ai-agents.html", pr: "0.9" }, { p: "/cgi-ads.html", pr: "0.9" }, { p: "/marketing.html", pr: "0.9" },
  { p: "/terms.html", pr: "0.2" }, { p: "/privacy-policy.html", pr: "0.2" }
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapPages.map(({ p, pr, v }) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${pr}</priority>${v ? `
    <video:video>
      <video:thumbnail_loc>${SITE_URL}${v.th}</video:thumbnail_loc>
      <video:title>${esc(v.t)}</video:title>
      <video:description>${esc(v.d)}</video:description>
      <video:content_loc>${SITE_URL}${v.u}</video:content_loc>
      <video:duration>${v.dur}</video:duration>
    </video:video>` : ""}
  </url>`).join("\n")}
</urlset>
`;
const bots = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Applebot", "Applebot-Extended"];
const robots = `# Everything here is public and meant to be read by people, search engines and AI assistants.
User-agent: *
Allow: /

${bots.map((b) => `User-agent: ${b}\nAllow: /`).join("\n")}

Sitemap: ${SITE_URL}/sitemap.xml
`;
const llms = `# Syed Mateen

> Syed Mateen builds AI agents and automations for businesses (voice and chat agents, booking and onboarding workflows and content pipelines built with n8n, ElevenLabs and Claude/ChatGPT models), makes CGI product ads with AI video tools, and runs Meta Ads and Google Ads campaigns. He works with Lenaar Digital on AI automation and social media marketing for US clients and studies computer science at the University of Karachi. Works remotely with clients worldwide.

Key facts:
- Role: AI Automation & Social Media Marketing, Lenaar Digital (part-time, remote, US clients), since June 2026
- Also: Call Centre Agent on a US DME campaign (customer communication, CRM tracking, lead generation), since August 2026
- Education: BS Computer Science, University of Karachi (in progress); Intermediate in Computer Science, Boys Degree College
- Certifications: Google Ads Measurement (Google Skillshop, Oct 2026); HubSpot Sales Hub Software (HubSpot, Oct 2026)
- Tools: n8n, ElevenLabs, ChatGPT, Claude, Google Calendar, Google Sheets, Gmail, Klap, Telegram, Slack, HubSpot, Meta Ads, Google Ads, Google Flow, CapCut, Shopify, Figma
- Contact: ${EMAIL} · LinkedIn ${LINKEDIN} · Instagram @syyed_mateen · X @Syyedmateen

## Work

- [Clinic voice booking agent](${SITE_URL}/work/clinic-voice-booking-agent): ElevenLabs voice agent plus an n8n workflow that checks clinic hours and Google Calendar, books or offers the nearest free slot, prevents double bookings, logs patients in Google Sheets and emails confirmations.
- [YouTube to Shorts agent](${SITE_URL}/work/youtube-to-shorts-agent): Turns a YouTube URL into captioned Shorts through Klap, schedules and publishes them, and sends a Telegram summary.
- [Pond's Hydra Miracle spec ad](${SITE_URL}/work/ponds-hydra-miracle-spec-ad): A vertical CGI spec ad made with AI video tools, with no on-screen copy. Not affiliated with Unilever or Pond's.
- [AI receptionist](${SITE_URL}/#work): A voice and chat receptionist that answers inbound calls and messages and captures leads.
- [Onboarding agent](${SITE_URL}/#work): An n8n workflow where an AI agent provisions a new user across company tools and Slack channels.

## Services

- [AI agents and automation](${SITE_URL}/ai-agents.html): voice and chat agents that answer, book and follow up; n8n workflows that connect business tools.
- [CGI ads](${SITE_URL}/cgi-ads.html): product ads made with AI video tools (skincare, hair care, food, med spa), for Reels, Shorts and TikTok.
- [Marketing](${SITE_URL}/marketing.html): Meta Ads and Google Ads campaigns, social content, SEO and AI search visibility, lead follow-up.

## Optional

- [About](${SITE_URL}/#about)
- [FAQ](${SITE_URL}/#faq)
`;
const manifest = JSON.stringify({ name: "Syed Mateen", short_name: "Mateen", start_url: "/", display: "browser", background_color: "#040507", theme_color: "#040507", icons: [{ src: "/assets/img/apple-touch-icon.png", sizes: "180x180", type: "image/png" }, { src: "/assets/img/favicon.svg", sizes: "any", type: "image/svg+xml" }] }, null, 2);
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc4ff"/><stop offset="1" stop-color="#1f6fff"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#040507"/><g transform="translate(32 35) scale(0.98) translate(-32 -34)"><line x1="32" y1="9" x2="32" y2="16" stroke="#5aa8ff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="8" r="3.4" fill="#7cc4ff"/><rect x="7" y="27" width="5" height="14" rx="2.5" fill="url(#g)"/><rect x="52" y="27" width="5" height="14" rx="2.5" fill="url(#g)"/><rect x="11" y="16" width="42" height="35" rx="13" fill="url(#g)"/><rect x="17" y="24" width="30" height="18" rx="9" fill="#05080f"/><circle cx="26" cy="33" r="3.6" fill="#e6f4ff"/><circle cx="38" cy="33" r="3.6" fill="#e6f4ff"/></g></svg>`;

/* ---------- bundle, then write ---------- */
try {
  const { buildSync } = await import("esbuild");
  const common = { bundle: true, minify: true, format: "iife", target: "es2019", legalComments: "none" };
  buildSync({ ...common, entryPoints: [path.join(ROOT, "src/scene/main.js")], outfile: path.join(STATIC, "assets/js/scene.js") });
  buildSync({ ...common, entryPoints: [path.join(ROOT, "src/app/main.js")], outfile: path.join(STATIC, "assets/js/app.js") });
} catch (e) { console.warn("esbuild not available, using the committed bundles:", e.message); }
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(STATIC, DIST, { recursive: true, filter: (src) => !src.endsWith(".glb") });
const w = (p, s) => { const f = path.join(DIST, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
w("index.html", home());
cases.forEach((c) => w(`work/${c.slug}.html`, casePage(c)));
w("404.html", notFound());
Object.keys(services).forEach((k) => w(services[k].file, servicePage(k)));
w("privacy-policy.html", legalPage("privacy")); w("terms.html", legalPage("terms"));
w("sitemap.xml", sitemap); w("robots.txt", robots); w("llms.txt", llms);
w("site.webmanifest", manifest); w("assets/img/favicon.svg", favicon);
w(".nojekyll", "");
console.log(`built ${SITE_URL} ${TODAY}${PREVIEW ? " (preview fonts)" : ""}`);
