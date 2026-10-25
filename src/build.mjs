// Builds the static site into dist/. `npm run build` runs this; the GitHub Pages workflow deploys dist/.
// Edit text here, rebuild, push. Static files live in static/ and are copied as they are.
// The 3D scene (src/scene) and page script (src/app) are bundled into static/assets/js on every build.
// New CGI ads and certificates need no code: drop the files into content/cgi-ads or content/certificates (see content/README.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectAds, collectCertificates, videoShape } from "./media.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const STATIC = path.join(ROOT, "static");

/* ---------- settings ---------- */
// must match the custom domain in Settings → Pages (and static/CNAME)
const SITE_URL = (process.env.SITE_URL || "https://syyedmateen.com").replace(/\/$/, "");
const DEFAULT_ACCENT = "blue";               // blue · violet · sunset · aurora
const SHOW_EXAMPLE_QUOTES = false;            // the placeholder testimonials stay hidden until real client quotes are added to `quotes`
const HOME_ADS = 10;                          // how many of the newest CGI ads the home page carousel shows (the CGI Ads page shows all)
const EMAIL = "syyedmaten@gmail.com";
const WHATSAPP = "";                          // e.g. "923001234567". The icon appears when set.
const LINKEDIN = "https://www.linkedin.com/in/syyedmateen";
const INSTAGRAM = "https://www.instagram.com/syyed_mateen/";
const X_URL = "https://x.com/Syyedmateen";
// Search engine ownership checks: paste the code from Google Search Console / Bing Webmaster Tools (the content="..." value) and rebuild.
const GOOGLE_VERIFICATION = "";
const BING_VERIFICATION = "";
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- start the output folder and process uploaded media ---------- */
try {
  const { buildSync } = await import("esbuild");
  const common = { bundle: true, minify: true, format: "iife", target: "es2019", legalComments: "none" };
  buildSync({ ...common, entryPoints: [path.join(ROOT, "src/scene/main.js")], outfile: path.join(STATIC, "assets/js/scene.js") });
  buildSync({ ...common, entryPoints: [path.join(ROOT, "src/app/main.js")], outfile: path.join(STATIC, "assets/js/app.js") });
} catch (e) { console.warn("esbuild not available, using the committed bundles:", e.message); }
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(STATIC, DIST, { recursive: true, filter: (src) => !src.endsWith(".glb") });
const warnings = [];
const warn = (m) => { warnings.push(m); console.warn("  ! " + m); };
const ads = await collectAds({ root: ROOT, distDir: DIST, warn });
const certs = await collectCertificates({ root: ROOT, distDir: DIST, warn });

const clip = (t, n) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(" ", n - 1)).replace(/[,:;]$/, "") + "…");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const arrow = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`;
const playIcon = `<svg viewBox="0 0 12 12" aria-hidden="true" fill="currentColor" width="12" height="12"><path d="M2 1l9 5-9 5z"/></svg>`;
const icons = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.2 8.6h3v10.2h-3zM6.7 4a1.7 1.7 0 1 1 0 3.5 1.7 1.7 0 0 1 0-3.5zM10.2 8.6h2.9V10c.4-.8 1.4-1.7 3-1.7 3.1 0 3.7 2 3.7 4.7v5.8h-3v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.2h-2.9z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8 18.4z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>`,
  phones: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>`
};

/* ---------- JSON-LD entities (who Syed is, for Google and AI assistants) ---------- */
const NAMES = ["Syyed Mateen", "Syed Abdul Mateen", "syyedmateen"]; // other spellings people search for
const FOCUS = "AI automation, paid ads and CGI ads";
const PERSON_ID = `${SITE_URL}/#person`;
const person = {
  "@type": "Person", "@id": PERSON_ID, name: "Syed Mateen", givenName: "Syed", additionalName: "Abdul", familyName: "Mateen", alternateName: NAMES, url: `${SITE_URL}/`,
  image: `${SITE_URL}/assets/img/syed-mateen-portrait.jpg`,
  jobTitle: "AI Automation and Digital Marketing Specialist",
  description: "Syed Mateen (also written Syyed Mateen) is an AI automation and digital marketing specialist. He builds AI voice agents and n8n workflows, runs Meta and Google ad campaigns, and creates CGI product ads and video edits for businesses in the US and worldwide.",
  email: `mailto:${EMAIL}`,
  worksFor: { "@type": "Organization", name: "Lenaar Digital" },
  alumniOf: [{ "@type": "CollegeOrUniversity", name: "University of Karachi", alternateName: "Karachi University" }, { "@type": "EducationalOrganization", name: "Boys Degree College" }],
  homeLocation: { "@type": "Country", name: "Pakistan" },
  knowsLanguage: ["English", "Urdu"],
  knowsAbout: ["AI automation", "AI agents", "AI voice agents", "Chatbots", "n8n workflow automation", "Appointment booking automation", "CRM automation", "HubSpot", "Lead generation", "Paid advertising", "Meta Ads", "Facebook Ads", "Instagram Ads", "Google Ads", "Conversion tracking", "Content creation", "CGI product ads", "Video editing", "Short form video", "Social media marketing"],
  // filled automatically from content/certificates
  hasCredential: certs.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c.title, credentialCategory: "certification", ...(c.issuer ? { recognizedBy: { "@type": "Organization", name: c.issuer } } : {}), ...(c.date ? { dateCreated: c.date } : {}), ...(c.expires ? { expires: c.expires } : {}), ...(c.url ? { url: c.url } : {}), ...(c.img ? { image: `${SITE_URL}/${c.img}` } : {}), ...(c.skill ? { competencyRequired: c.skill } : {}) })),
  makesOffer: [
    ["AI automation", "AI agents and workflow automation", "Voice agents, chat agents and n8n workflows that answer, book, follow up and keep your CRM up to date."],
    ["Paid ads", "Meta Ads and Google Ads", "Lead generation campaigns on Meta and Google with proper conversion tracking."],
    ["CGI ads and video editing", "Content creation", "Studio quality CGI product ads and short form edits for Reels, Shorts and TikTok."]
  ].map(([n, t, dsc]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n, serviceType: t, description: dsc, areaServed: "Worldwide" } })),
  sameAs: [LINKEDIN, INSTAGRAM, X_URL]
};
const BUSINESS_ID = `${SITE_URL}/#business`;
const business = {
  "@type": "ProfessionalService", "@id": BUSINESS_ID, name: "Syed Mateen: AI Automation and Digital Marketing", alternateName: "Syyed Mateen", url: `${SITE_URL}/`,
  description: "AI voice agents and n8n automation, Meta and Google paid ads, and CGI product ads with video editing for businesses in the United States and worldwide.",
  image: `${SITE_URL}/assets/img/og-image.jpg`, logo: `${SITE_URL}/assets/img/apple-touch-icon.png`, email: EMAIL, founder: { "@id": PERSON_ID },
  address: { "@type": "PostalAddress", addressCountry: "PK" }, areaServed: [{ "@type": "Country", name: "United States" }, { "@type": "Place", name: "Worldwide" }],
  knowsLanguage: "en", sameAs: [LINKEDIN, INSTAGRAM, X_URL],
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Services", itemListElement: [
    ["AI automation and AI agents", "ai-agents.html", "Voice and chat agents that answer, book and follow up, and n8n workflows that connect business tools."],
    ["Paid ads: Meta and Google", "marketing.html", "Lead generation campaigns on Meta and Google, conversion tracking, creative testing and lead follow up."],
    ["CGI ads and video editing", "cgi-ads.html", "Vertical CGI product ads and edits for Reels, Shorts and TikTok, without a studio or a shoot."]
  ].map(([n, u, d]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n, description: d, url: `${SITE_URL}/${u}`, provider: { "@id": PERSON_ID } } })) }
};
const crumbs = (...items) => ({ "@type": "BreadcrumbList", itemListElement: [["Home", `${SITE_URL}/`], ...items].map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })) });
const website = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Syed Mateen", alternateName: NAMES, inLanguage: "en", publisher: { "@id": PERSON_ID }, about: { "@id": PERSON_ID } };

/* ---------- chrome ---------- */
const KEYWORDS = ["Syed Mateen", "Syyed Mateen", "Syed Abdul Mateen", "AI automation", "AI agents", "AI voice agent", "n8n automation", "chatbot developer", "lead generation", "Meta Ads", "Facebook Ads", "Google Ads", "paid ads specialist", "CGI ads", "CGI product ads", "video editing", "content creation"];
function head({ title, desc, pathname, image = "/assets/img/og-image.jpg", imageAlt = "Syed Mateen: AI automation, paid ads and CGI ads", type = "website", graph, root = "", noindex = false, keywords = KEYWORDS }) {
  const url = `${SITE_URL}${pathname}`;
  return `<!doctype html>
<html lang="en" data-accent="${DEFAULT_ACCENT}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">${GOOGLE_VERIFICATION ? `\n<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}">` : ""}${BING_VERIFICATION ? `\n<meta name="msvalidate.01" content="${BING_VERIFICATION}">` : ""}
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}">
<meta name="author" content="Syed Mateen (Syyed Mateen)">
<meta name="keywords" content="${esc(keywords.join(", "))}">
<meta name="application-name" content="Syed Mateen">
<meta name="apple-mobile-web-app-title" content="Syed Mateen">
<meta name="format-detection" content="telephone=no">
<link rel="me" href="${LINKEDIN}">
<link rel="me" href="${INSTAGRAM}">
<link rel="me" href="${X_URL}">
<meta name="theme-color" content="#040507">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Syed Mateen">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@Syyedmateen">
<meta name="twitter:creator" content="@Syyedmateen">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE_URL}${image}">
<link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png">
<link rel="manifest" href="${root}site.webmanifest">
<link rel="alternate" type="text/plain" title="LLM summary" href="${root}llms.txt">
<link rel="sitemap" type="application/xml" href="${root}sitemap.xml">
<script>try{var a=localStorage.getItem("accent");a={purple:"violet",orange:"sunset",green:"aurora"}[a]||a;if(a)document.documentElement.setAttribute("data-accent",a)}catch(e){}document.documentElement.classList.add("js")</script>
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
  const items = [["skills", "Services"], ["cgi-ads", "CGI Ads"], ["work", "AI Work"], ["certificates", "Certifications"], ["about", "About"]];
  return `<a class="skip" href="#content">Skip to content</a>
<header class="top">
  <a class="brand" href="${root}index.html" aria-label="Syed Mateen home">${mark()}<span>Syed <span class="long">Mateen</span></span></a>
  <nav class="links" aria-label="Main">
    ${items.map(([id, l]) => `<a href="${h(id)}">${l}</a>`).join("\n    ")}
  </nav>
  <div class="tools">
    <div class="swatches" role="group" aria-label="Colour">${swatchButtons}</div>
    <button type="button" class="snd" data-sound-toggle aria-pressed="false">${speaker}<span class="sr">Sound</span></button>
    <button type="button" class="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Menu"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 5h12M2 11h12"/></svg></button>
    <a class="cta" href="${h("contact")}">Contact</a>
  </div>
</header>
<nav class="menu" id="menu" aria-label="Menu" hidden>
  ${items.map(([id, l]) => `<a href="${h(id)}">${l}</a>`).join("")}<a href="${h("faq")}">FAQ</a><a href="${h("contact")}">Contact</a>
  <div class="swatches menu-sw" role="group" aria-label="Colour">${swatchButtons}</div>
</nav>`;
}
// social links as labelled pills (icon + name), so they read clearly on every screen
function socials(extra = "") {
  const list = [["linkedin", "LinkedIn", LINKEDIN], ["instagram", "Instagram", INSTAGRAM], ["x", "X", X_URL], ...(WHATSAPP ? [["whatsapp", "WhatsApp", `https://wa.me/${WHATSAPP}`]] : []), ["email", "Email", `mailto:${EMAIL}`]];
  return `<ul class="socials${extra}">${list.map(([k, l, href]) => `<li><a class="soc soc-${k}" href="${href}"${href.startsWith("http") ? ' target="_blank" rel="me noopener"' : ""}><span class="ic">${icons[k]}</span><span>${l}</span></a></li>`).join("")}</ul>`;
}
// contact: a short brief that opens the visitor's email app, ready to send (no server, no sign-up)
const copyIcon = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="8.5" height="8.5" rx="2"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>`;
let briefN = 0;
function contactInner(heading, id) {
  const needs = ["AI automation", "Paid ads", "CGI ad or edit", "Something else"], n = ++briefN;
  return `<div class="in">
      <span class="kicker">Contact</span>
      <h2 id="h-${id}" data-scramble>${heading}</h2>
      <p class="soft">Tell me what you need and I will get back to you. The first call is free</p>
      <form class="brief" data-brief action="mailto:${EMAIL}" method="post" enctype="text/plain" novalidate>
        <fieldset class="needs"><legend>What do you need</legend>${needs.map((x, i) => `<label class="chip"><input type="radio" name="need" value="${x}"${i === 0 ? " checked" : ""}><span>${x}</span></label>`).join("")}</fieldset>
        <div class="two">
          <label class="field" for="bn${n}"><span>Your name</span><input id="bn${n}" name="name" autocomplete="name" required></label>
          <label class="field" for="bc${n}"><span>Company or website <i>optional</i></span><input id="bc${n}" name="company" autocomplete="organization"></label>
        </div>
        <label class="field" for="bm${n}"><span>What should it do</span><textarea id="bm${n}" name="message" rows="4" required placeholder="A few lines about the problem, the goal and any deadline"></textarea></label>
        <div class="brief-foot"><button class="btn solid" type="submit">Send by email ${arrow}</button><button class="btn copy" type="button" data-copy="${EMAIL}">${copyIcon}<span>${EMAIL}</span></button></div>
        <p class="fine">Opens your email app with the message ready to send</p>
      </form>
      ${socials()}
    </div>`;
}
function footer(root) {
  return `<footer class="site">
  <div class="wrap">
    <div class="f-brand"><a class="brand" href="${root}index.html">${mark()}<span>Syed Mateen</span></a><p>AI automation, paid ads and CGI ads for businesses in the US and worldwide</p></div>
    <nav aria-label="Footer">
      <a href="${root}ai-agents.html">AI Automation</a>
      <a href="${root}marketing.html">Paid Ads</a>
      <a href="${root}cgi-ads.html">CGI Ads</a>
      <a href="${root}privacy-policy.html">Privacy Policy</a>
      <a href="${root}terms.html">Terms</a>
    </nav>
    <div class="f-base"><span>© <span data-year>2026</span> Syed Mateen</span><a href="mailto:${EMAIL}">${EMAIL}</a></div>
  </div>
</footer>
<script src="${root}assets/js/app.js" defer></script>`;
}

const isoDate = (d) => (/^\d{4}-\d{2}$/.test(d) ? d + "-01" : String(d || TODAY).slice(0, 10));
const adVideo = (a) => ({ "@type": "VideoObject", "@id": `${SITE_URL}/${a.page}#video`, name: `${a.title} CGI ad by Syed Mateen`, description: a.text, thumbnailUrl: `${SITE_URL}/${a.posterJpg}`, contentUrl: `${SITE_URL}/${a.video}`, uploadDate: isoDate(a.date), duration: `PT${a.dur}S`, creator: { "@id": PERSON_ID }, inLanguage: "en" });
function lightbox() {
  return `<dialog id="lb" class="lb" aria-label="Viewer">
  <div class="lb-in">
    <button class="lb-close" type="button" aria-label="Close">×</button>
    <div class="lb-media"><video playsinline controls></video><img alt="" hidden></div>
    <div class="lb-info"><div><h3 data-lb-title></h3><p data-lb-text></p></div><a class="btn" data-lb-link href="#"><span data-lb-linktext>See the details</span> ${arrow}</a></div>
  </div>
</dialog>`;
}
// one playable card: media on top, caption underneath
// ads are clean rounded cards; demos sit in a slim screen frame; every card follows the video's real shape
function card(w, kind, root = "") {
  const ar = w.ar || "9/16", [aw, ah] = ar.split("/").map(Number), r = aw / ah;
  const sound = kind === "ad" ? w.audio !== false : !!w.audio;
  const fit = kind === "ad" && Math.abs(r - 9 / 16) > 0.05; // not 9:16: shown whole over a soft blurred fill
  const vid = `<video data-auto muted loop playsinline preload="none" data-lazy-poster="${root}${w.poster}" aria-hidden="true"><source src="${root}${w.preview || w.video}" type="video/mp4"></video>`;
  const media = kind === "ad"
    ? `<span class="frame card${fit ? " fit" : ""}"><span class="screen">${fit ? `<span class="blur" data-lazy-bg="${root}${w.poster}"></span>` : ""}${vid}<span class="play" aria-hidden="true">${playIcon}</span></span></span>`
    : `<span class="frame window"><span class="bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(w.tag)}</span></span><span class="screen" style="aspect-ratio:${ar}">${vid}<span class="play" aria-hidden="true">${playIcon}</span></span></span>`;
  return `<button type="button" class="${kind}${r < 1 ? " tall" : ""} reveal" style="--ar:${ar}" data-video="${root}${w.video}" data-ar="${ar}"${sound ? " data-has-sound" : ""} data-poster="${root}${w.poster}" data-title="${esc(w.title)}" data-text="${esc(w.text)}"${w.page || w.link ? ` data-link="${root}${w.page || w.link}"` : ""}>
          ${media}
          <span class="cap"><span class="t"><span class="sr">Play </span>${esc(w.title)}</span><span class="g">${esc(w.tag)}</span></span>
        </button>`;
}
const workRows = () => [[0, 2], [3, 1]].map((r) => `<div class="row">${r.map((i) => card(work[i], "tile")).join("\n        ")}</div>`).join("\n        ");
// the home carousel: newest ads first, arrows on wide screens, swipe on phones
const shelf = (list) => `<div class="shelf-wrap"><div class="shelf" tabindex="0" aria-label="CGI ads, scroll sideways">
        ${list.map((w) => card(w, "ad")).join("\n        ")}
      </div><div class="shelf-nav" aria-hidden="true"><button type="button" data-shelf="-1" tabindex="-1">${arrow}</button><button type="button" data-shelf="1" tabindex="-1">${arrow}</button></div></div>`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const certDate = (d) => { if (!d) return ""; const [y, m] = String(d).split("-"); return m ? `${MONTHS[+m - 1] || ""} ${y}`.trim() : y; };
// certificates: picture, title, issuer and date; no credential numbers on show
function certCards(list, root = "") {
  if (!list.length) return `<p class="soft center">Certificates will appear here</p>`;
  return `<ul class="certs">${list.map((c) => {
    const when = c.date ? `Issued ${certDate(c.date)}${c.expires ? ` <span class="dot"></span> Valid to ${certDate(c.expires)}` : ""}` : "";
    const pic = c.thumb
      ? `<button type="button" class="cert-img" data-image="${root}${c.img}" data-title="${esc(c.title)}" data-text="${esc([c.issuer, c.date && "Issued " + certDate(c.date)].filter(Boolean).join(", "))}"${c.url || c.pdf ? ` data-link="${esc(c.url || root + c.pdf)}" data-link-label="${c.url ? "Verify credential" : "Open PDF"}"` : ""} aria-label="View certificate ${esc(c.title)}"><img src="${root}${c.thumb}" alt="${esc(c.title)} certificate issued to Syed Abdul Mateen" width="${c.w || 720}" height="${c.h || 510}" loading="lazy" decoding="async"></button>`
      : `<div class="cert-img badge" aria-hidden="true"><span>${esc((c.issuer || c.title).slice(0, 1))}</span></div>`;
    return `<li class="cert reveal">${pic}<div class="cert-txt">${c.issuer ? `<span class="issuer">${esc(c.issuer)}</span>` : ""}<h3>${esc(c.title)}</h3>${when ? `<p>${when}</p>` : ""}${c.url ? `<a class="verify" href="${esc(c.url)}" target="_blank" rel="noopener">Verify ${arrow}</a>` : ""}</div></li>`;
  }).join("")}</ul>`;
}

/* ---------- content ---------- */
// the four 3D chapters (their order matches the shapes: robot, screens, funnel, workflow)
const chapters = [
  { id: "services", title: "AI agents", text: "Voice and chat agents that pick up every call, book appointments and follow up day and night", tags: ["Voice agents", "Chatbots", "Booking"], link: ["See the AI work", "ai-agents.html"] },
  { id: "ads", title: "CGI ads", text: "Product ads that look like a studio shoot without the studio", tags: ["CGI", "Editing", "Reels"], link: ["See all CGI ads", "cgi-ads.html"] },
  { id: "growth", title: "Paid ads", text: "Meta and Google campaigns built for leads you can actually call", tags: ["Meta Ads", "Google Ads", "Lead gen"], link: ["Paid ads services", "marketing.html"] },
  { id: "automation", title: "Automation", text: "n8n workflows that connect your tools and take the repetitive work off your plate", tags: ["n8n", "CRM", "APIs"], link: ["See the automations", "ai-agents.html"] }
];
// what I do: AI automation is the main focus, then paid ads, then CGI ads and editing
const skills = [
  { key: "ai", title: "AI Automation", badge: "Main focus", text: "Voice agents, chat agents and n8n workflows. Calls get answered, leads get qualified and your CRM stays up to date while you get on with the real work", chips: ["n8n", "Voice agents", "ElevenLabs", "Chatbots", "HubSpot", "Google Workspace", "Slack", "Telegram"], link: ["AI automation", "ai-agents.html"] },
  { key: "ads", title: "Paid Ads", text: "Meta and Google campaigns judged on one number: cost per lead. Tracking set up properly from day one", chips: ["Meta Ads", "Google Ads", "Lead generation", "Conversion tracking", "Audience research"], link: ["Paid ads", "marketing.html"] },
  { key: "cgi", title: "CGI Ads and Editing", text: "Scroll stopping product ads and clean edits for Reels, Shorts and TikTok with captions, sound and every format you need", chips: ["CGI ads", "Video editing", "CapCut", "Reels and Shorts", "Captions"], link: ["CGI ads", "cgi-ads.html"] }
];
const work = [
  { ar: "16/9", title: "Clinic voice agent", tag: "AI agent", video: "assets/video/clinic.mp4", preview: "assets/video/preview/clinic.mp4", poster: "assets/img/clinic-poster.jpg", text: "Answers the phone, checks the calendar, offers the nearest free slot and never double books", link: "work/clinic-voice-booking-agent.html" },
  { ar: "4/5", title: "AI receptionist", tag: "Voice and chat", video: "assets/video/robot-receptionist.mp4", preview: "assets/video/preview/robot-receptionist.mp4", poster: "assets/img/robot-poster.jpg", text: "Answers calls and messages on its own so no lead is left waiting" },
  { ar: "16/9", title: "YouTube to Shorts", tag: "Automation", video: "assets/video/shorts.mp4", preview: "assets/video/preview/shorts.mp4", poster: "assets/img/shorts-poster.jpg", text: "One YouTube link in and captioned, scheduled Shorts out", link: "work/youtube-to-shorts-agent.html" },
  { ar: "16/9", title: "Onboarding agent", tag: "n8n workflow", video: "assets/video/onboarding-agent.mp4", preview: "assets/video/preview/onboarding-agent.mp4", poster: "assets/img/onboarding-poster.jpg", text: "A new user form starts it and the agent sets the person up in every tool and the right Slack channels" },
];
// read each demo video's real size, so its frame matches it (the receptionist clip is 9:16, not 4:5)
for (const w of work) { const v = await videoShape(path.join(STATIC, w.video)); if (v) { w.ar = `${v.w}/${v.h}`; w.dur = Math.round(v.dur); } }
ads.forEach((a) => { a.ar = `${a.w}/${a.h}`; });
const steps = [["Talk", "A short free call about what is slowing you down"], ["Build", "I build it and test it with your real tools and data"], ["Launch", "It goes live and I keep improving it with you"]];
const quotes = [
  ["The booking agent picks up every call now. Our front desk finally has time for patients.", "Clinic owner"],
  ["The product ad looked like a studio shoot, and we never left the office.", "Brand manager"],
  ["Leads land in our CRM with a follow-up already sent. It just runs.", "Agency founder"]
];
const faqs = [
  ["Who is Syed Mateen?", "Syed Mateen, also written Syyed Mateen (full name Syed Abdul Mateen), is an AI automation and digital marketing specialist from Pakistan. He builds AI voice agents and n8n workflows, runs Meta and Google ad campaigns and creates CGI product ads and video edits for businesses in the US and worldwide."],
  ["What services does Syed Mateen offer?", "Three things. AI automation is the main one: voice agents, chat agents and n8n workflows that answer, book and follow up. Then paid ads on Meta and Google built around leads. And CGI product ads with video editing for Reels, Shorts and TikTok."],
  ["What is an AI voice booking agent?", "A phone agent that answers calls, collects the caller's details and books the appointment. Syed's clinic version checks opening hours and Google Calendar, offers the nearest free slot, blocks double bookings, logs the patient in Google Sheets and emails a confirmation."],
  ["Can you make a product ad without a film shoot?", "Yes. The scenes are created digitally around your product, then edited, scored and captioned for Reels, Shorts and TikTok. Clear photos of the product are enough to start."],
  ["Which tools do you work with?", "n8n, ElevenLabs, HubSpot, Google Calendar, Sheets and Gmail, Slack, Telegram, Meta Ads Manager, Google Ads and CapCut."],
  ["Do you work with clients outside Pakistan?", "Yes. Most of the work is remote, with businesses in the United States and worldwide."],
  ["How long does it take to build an AI agent?", "A focused agent such as a booking line or a lead follow up flow usually takes one to two weeks, including testing with your real calendar, CRM and inbox."],
  ["How do I hire Syed Mateen?", `Email ${EMAIL} or message Syed on LinkedIn with the problem you want solved. The first call is free.`]
];

const certHeading = () => { const iss = [...new Set(certs.map((c) => (c.issuer || "").split(" ")[0]).filter(Boolean))].slice(0, 3); return iss.length ? `Certified by ${iss.length > 1 ? iss.slice(0, -1).join(", ") + " and " + iss[iss.length - 1] : iss[0]}` : "Certifications"; };

/* ======================================================================= HOME */
function home() {
  const graph = [
    website, person, business,
    { "@type": "ProfilePage", "@id": `${SITE_URL}/#profile`, url: `${SITE_URL}/`, name: "Syed Mateen (Syyed Mateen): AI Automation and Paid Ads", isPartOf: { "@id": `${SITE_URL}/#website` }, mainEntity: { "@id": PERSON_ID }, about: { "@id": PERSON_ID }, dateCreated: "2026-10-17", dateModified: TODAY },
    { "@type": "FAQPage", "@id": `${SITE_URL}/#faq`, mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "ItemList", "@id": `${SITE_URL}/#work`, name: "Selected work by Syed Mateen", itemListElement: [...work, ...ads].map((w, i) => ({ "@type": "ListItem", position: i + 1, name: w.title, ...(w.page || w.link ? { url: `${SITE_URL}/${w.page || w.link}` } : {}) })) },
    ...ads.map((a) => adVideo(a))
  ];
  const tools = ["n8n", "ElevenLabs", "HubSpot", "Meta Ads", "Google Ads", "Google Workspace", "Slack", "Telegram", "CapCut", "Shopify", "Figma"];
  const toolList = (hide) => tools.map((t) => `<li${hide ? ' aria-hidden="true"' : ""}>${t}</li>`).join("");
  return `${head({
    title: "Syed Mateen | AI Agents, Automation & CGI Ads",
    desc: "Syed Mateen, also known as Syyed Mateen, builds AI voice agents and n8n automations, runs Meta and Google ads and creates CGI product ads for businesses worldwide.",
    pathname: "/", graph
  })}
${header("")}
<canvas id="stage" aria-hidden="true" data-robot="assets/models/robot.js"></canvas>

<main id="content">
  <section id="hero" class="hero" data-station="0" aria-labelledby="h-hero">
    <div class="wrap">
      <span class="kicker">Syed Mateen</span>
      <h1 id="h-hero" data-scramble><span class="sr">Syed Mateen, </span>AI automation that does <span class="hl">the busywork</span></h1>
      <p class="sub">Voice agents and n8n workflows that answer, book and follow up for you. Meta and Google ads that bring the leads in. CGI ads and edits that make people stop scrolling</p>
      <div class="actions"><a class="btn solid" href="#work">See my work ${arrow}</a><a class="btn" href="#contact">Book a free call</a></div>
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

  <section id="skills" class="band fade" data-cover aria-labelledby="h-skills">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">What I do</span><h2 id="h-skills" data-scramble>Three skills, one goal: more customers</h2></div></div>
      <div class="skills">${skills.map((k) => `<article class="skill skill-${k.key} reveal">${k.badge ? `<span class="badge">${k.badge}</span>` : ""}<h3>${k.title}</h3><p>${k.text}</p><ul class="chips">${k.chips.map((c) => `<li>${c}</li>`).join("")}</ul><a class="link-more" href="${k.link[1]}">${k.link[0]} ${arrow}</a></article>`).join("")}</div>
    </div>
  </section>

  <section id="cgi-ads" class="band" data-cover aria-labelledby="h-ads-shelf">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">CGI ads and editing</span><h2 id="h-ads-shelf" data-scramble>Ads that stop the scroll</h2></div><a class="link-more" href="cgi-ads.html">All ${ads.length} CGI ads ${arrow}</a></div>
      ${shelf(ads.slice(0, HOME_ADS))}
    </div>
  </section>

  <section id="work" class="band" data-cover aria-labelledby="h-work">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">AI automation</span><h2 id="h-work" data-scramble>AI agents at work</h2></div><a class="link-more" href="ai-agents.html">All AI work ${arrow}</a></div>
      <div class="grid">
        ${workRows()}
      </div>
    </div>
  </section>

  <div class="strip" aria-label="Tools"><ul>${toolList(false)}${toolList(true)}</ul></div>

  <section id="process" class="band" data-cover aria-labelledby="h-process">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">How it works</span><h2 id="h-process" data-scramble>Simple from the first call</h2></div></div>
      <ol class="steps reveal">${steps.map(([t, b], i) => `<li><span class="n">0${i + 1}</span><h3>${t}</h3><p>${b}</p></li>`).join("")}</ol>
    </div>
  </section>

  ${SHOW_EXAMPLE_QUOTES ? `<section id="voices" class="band" data-cover aria-labelledby="h-voices">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">What clients say</span><h2 id="h-voices" data-scramble>In their words</h2></div></div>
      <div class="quotes reveal">${quotes.map(([q, who]) => `<figure class="quote"><blockquote>${q}</blockquote><footer><span>${who}</span></footer></figure>`).join("")}</div>
    </div>
  </section>` : ""}

  <section id="about" class="band" data-cover aria-labelledby="h-about">
    <div class="wrap about reveal">
      <figure><picture><source srcset="assets/img/syed-mateen-portrait.webp" type="image/webp"><img src="assets/img/syed-mateen-portrait.jpg" width="720" height="900" alt="Syed Mateen (Syyed Mateen), AI automation and digital marketing specialist" loading="lazy" decoding="async"></picture></figure>
      <div class="txt">
        <span class="kicker">About</span>
        <h2 id="h-about" data-scramble>Hi, I'm Syed</h2>
        <p>I'm Syed Abdul Mateen and most people find me online as <strong>Syyed Mateen</strong>. My main work is <strong>AI automation</strong>: voice agents, chat agents and n8n workflows that take the repetitive work off a business.</p>
        <p>I also run <strong>Meta and Google ad campaigns</strong> and create <strong>CGI product ads and video edits</strong> so the automation always has fresh leads to work with.</p>
        <p>I work with Lenaar Digital on AI automation and social media marketing for US clients and study computer science at the University of Karachi.</p>
        <div class="actions"><a class="btn solid" href="#contact">Work with me ${arrow}</a><a class="btn" href="${LINKEDIN}" target="_blank" rel="me noopener">LinkedIn</a></div>
      </div>
    </div>
  </section>

  <section id="certificates" class="band" data-cover aria-labelledby="h-certs">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">Certifications</span><h2 id="h-certs" data-scramble>Certification</h2></div><p class="soft">Paid advertising, Meta marketing and CRM credentials. Tap any certificate to see it in full</p></div>
      ${certCards(certs)}
    </div>
  </section>

  <section id="faq" class="band" data-cover aria-labelledby="h-faq">
    <div class="wrap">
      <div class="head reveal"><div><span class="kicker">FAQ</span><h2 id="h-faq" data-scramble>Quick answers</h2></div></div>
      <div class="faq reveal">${faqs.map(([q, a]) => `<details name="faq"><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join("")}</div>
    </div>
  </section>

  <section id="contact" class="contact" data-station="5" aria-labelledby="h-contact">
    <div class="wrap">${contactInner("Let's build something", "contact")}</div>
  </section>
</main>
${footer("")}

${lightbox()}
</body>
</html>
`;
}

/* ======================================================================= CASE STUDIES */
const videoBlock = (id, name, label, poster, note) => `<figure style="margin:0;display:grid;gap:10px">
        <div class="frame window solo"><span class="bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(label)}</span></span><span class="screen" style="aspect-ratio:16/9">
          <video id="${id}" data-auto muted loop playsinline preload="metadata" poster="../assets/img/${poster}" aria-label="${esc(label)}"><source src="../assets/video/${name}.mp4" type="video/mp4"></video>
          <div class="vctl"><button type="button" data-toggle-video="${id}">Pause</button></div>
        </span></div>
        <figcaption class="soft" style="font-size:.86rem">${note}</figcaption>
      </figure>`;

const pondsVideo = (ads.find((a) => a.slug === "ponds-hydra-miracle-ad") || { video: "assets/media/ads/ponds-hydra-miracle-ad.mp4" }).video;
const cases = [
  {
    slug: "clinic-voice-booking-agent", crumb: "Clinic voice booking agent", kicker: "Case study: voice agent",
    title: "AI Voice Booking Agent for Clinics (n8n) | Syed Mateen",
    desc: "How Syed Mateen built an AI voice agent that books clinic appointments, checks Google Calendar, offers the nearest free slot and blocks double bookings.",
    h1: "A voice agent that books clinic appointments without double booking anyone",
    lede: "Booking one appointment by phone takes a receptionist seven steps. This agent does all seven, and knows what to do when the request doesn't fit.",
    tldr: "An AI voice agent built with ElevenLabs answers a clinic's booking calls and passes the caller's details to an n8n workflow. The workflow checks the request against clinic hours, weekends, past dates and missing details, checks Google Calendar, then books the slot, offers the nearest free one, or offers another day or a callback. It re-checks the slot before confirming so two callers can't take the same time, logs the patient in Google Sheets and sends a confirmation from Gmail.",
    facts: [["Role", "Design and build"], ["Built with", "ElevenLabs and n8n"], ["Connected to", "Calendar, Sheets and Gmail"], ["First shared", "August 2026"]],
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
    slug: "youtube-to-shorts-agent", crumb: "YouTube to Shorts agent", kicker: "Case study: automation",
    title: "YouTube to Shorts AI Agent: Clip & Publish | Syed Mateen",
    desc: "An AI agent by Syed Mateen that turns one YouTube video into captioned, scheduled Shorts, publishes them to connected platforms and reports back on Telegram.",
    h1: "One YouTube link in and captioned Shorts out",
    lede: "Making Shorts is the easy part. This agent automates everything around them.",
    tldr: "You send the agent a YouTube URL and the number of Shorts you want. It extracts the strongest clips, adds captions, renders the Shorts through Klap, checks the processing, calculates publishing times, uploads to the connected platforms and sends a summary on Telegram.",
    facts: [["Role", "Design and build"], ["Input", "YouTube URL + clip count"], ["Built with", "Klap and Telegram"], ["First shared", "September 2026"]],
    published: "2026-09-02", image: "/assets/img/shorts-poster.jpg",
    about: ["AI agent", "Content repurposing automation", "YouTube Shorts"],
    keywords: ["YouTube to Shorts automation", "repurpose long-form video", "auto publish Shorts", "Klap automation"],
    video: { name: "YouTube to Shorts agent: pipeline", desc: "A motion explainer of the pipeline: input, clip finding, captions, scheduling, publishing and the Telegram summary.", mp4: "/assets/video/shorts.mp4", duration: "PT12S" },
    media: videoBlock("caseVideo", "shorts", "Motion explainer of the YouTube to Shorts pipeline", "shorts-poster.jpg", "Motion explainer of the pipeline. The example URL, clip count and times are illustrative."),
    sections: [
      ["The problem", `<p>Turning one long video into Shorts by hand means downloading it, finding timestamps, writing every caption and uploading to each platform one by one.</p>`],
      ["How it works", `<ol class="flow-list"><li>Send the input<span>A YouTube URL and the number of Shorts.</span></li><li>Clips are extracted<span>The agent picks the important moments.</span></li><li>Captions are added</li><li>Shorts are rendered through Klap<span>Processing is checked before anything moves on.</span></li><li>Publishing times are calculated</li><li>Content is uploaded<span>To each connected platform.</span></li><li>A Telegram summary comes back</li></ol>`],
      ["Why it matters", `<p><strong>The interesting part isn't making Shorts. It's automating the whole workflow around them.</strong> Send the video, and the agent handles the rest.</p><ul class="chips"><li>Klap</li><li>Telegram</li><li>Scheduling</li><li>Multi-platform publishing</li></ul>`]
    ],
    next: ["Pond's Hydra Miracle spec ad", "ponds-hydra-miracle-spec-ad.html"], cta: "Have long videos that should work harder?"
  },
  {
    slug: "ponds-hydra-miracle-spec-ad", crumb: "Pond's spec ad", kicker: "Case study: CGI spec ad",
    title: "Pond's Hydra Miracle Spec Ad: CGI Ad Breakdown | Syed Mateen",
    desc: "Syed Mateen's CGI spec ad for Pond's Hydra Miracle: how one colour, water and a corridor of bottles sell hydration without saying the word.",
    h1: "Selling hydration without saying the word",
    lede: "Twenty seconds. Not one word of copy. And you still know what the serum does.",
    tldr: "A vertical CGI spec ad for Pond's Hydra Miracle. The whole frame stays in the bottle's pale blue, water tells the story, lab glassware signals science, and a corridor of bottles narrows to one.",
    facts: [["Type", "Spec ad"], ["Length", "About 20 seconds"], ["Format", "9:16 for Reels and Shorts"], ["First shared", "October 2026"]],
    published: "2026-10-13", image: "/assets/img/ponds-poster.jpg",
    about: ["CGI product ad", "Video advertising", "Skincare marketing"],
    keywords: ["CGI product ad", "CGI skincare ad", "skincare ad creative", "spec ad"],
    video: { name: "Pond's Hydra Miracle spec ad", desc: "A vertical CGI spec ad for Pond's Hydra Miracle serum.", mp4: `/${pondsVideo}`, duration: "PT18S", uploaded: "2026-10-13" },
    media: `<figure style="margin:0;display:grid;gap:10px">
        <div class="frame card solo"><span class="screen">
          <video id="caseVideo" data-auto muted loop playsinline preload="metadata" poster="../assets/img/ponds-poster.jpg" aria-label="Pond's Hydra Miracle spec ad"><source src="../${pondsVideo}" type="video/mp4"></video>
          
          <div class="vctl"><button type="button" data-unmute="caseVideo">Sound on</button><button type="button" data-toggle-video="caseVideo">Pause</button></div>
        </span></div>
        <figcaption class="soft" style="font-size:.86rem;text-align:center">Spec work. Not commissioned by, affiliated with or endorsed by Unilever or Pond's.</figcaption>
      </figure>`,
    sections: [
      ["The brief", `<p class="disclaimer">A self-initiated spec ad. Pond's and Hydra Miracle are trademarks of Unilever.</p><p>The brief: <strong>sell hydration without saying "hydration."</strong> No voiceover, no on-screen copy, built for Reels and Shorts.</p>`],
      ["The decisions", `<h3>One colour, start to finish</h3><p>Everything lives in the brand's pale blue, so the product never fights for attention.</p><h3>Water does the talking</h3><p>Drops, ripples and a bottle sinking into water make the connection before anyone reads the label.</p><h3>Lab shots for trust</h3><p>Beakers in the background say "formulated," not "decorated."</p><h3>Repetition, then focus</h3><p>A corridor of bottles shows scale, then the camera narrows to one.</p><h3>The first second decides</h3><p>On Reels, people decide in about a second. The opening shot has to earn the rest.</p>`],
      ["The takeaway", `<p><strong>Most beauty ads try to say five things. This one tries to make you feel one.</strong></p><ul class="chips"><li>CGI</li><li>Art direction</li><li>Editing</li><li>Reels &amp; Shorts</li></ul>`]
    ],
    next: ["Clinic voice booking agent", "clinic-voice-booking-agent.html"], cta: "Want an ad like this?"
  }
];

function casePage(c) {
  const url = `${SITE_URL}/work/${c.slug}.html`;
  const graph = [
    website, person,
    { "@type": "Article", "@id": `${url}#article`, headline: c.h1, description: c.desc, url, mainEntityOfPage: url, image: `${SITE_URL}${c.image}`, datePublished: c.published, dateModified: TODAY, author: { "@id": PERSON_ID }, publisher: { "@id": PERSON_ID }, inLanguage: "en", about: c.about, keywords: c.keywords.join(", "), video: { "@id": `${url}#video` } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: c.slug.includes("spec-ad") ? "CGI Ads" : "AI Agents", item: `${SITE_URL}/${c.slug.includes("spec-ad") ? "cgi-ads" : "ai-agents"}.html` },
      { "@type": "ListItem", position: 3, name: c.crumb, item: url }
    ] },
    { "@type": "VideoObject", "@id": `${url}#video`, name: c.video.name, description: c.video.desc, thumbnailUrl: `${SITE_URL}${c.image}`, contentUrl: `${SITE_URL}${c.video.mp4}`, uploadDate: c.video.uploaded || c.published, duration: c.video.duration, creator: { "@id": PERSON_ID }, inLanguage: "en" }
  ];
  return `${head({ title: c.title, desc: c.desc, pathname: `/work/${c.slug}.html`, image: `/assets/img/og/${c.slug}.jpg`, imageAlt: c.h1, type: "article", graph, root: "../" })}
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
  <h1 data-scramble>This page did not make the final cut</h1>
  <p class="lede">The page you asked for does not exist but the work does</p>
  <div class="actions"><a class="btn solid" href="/">Back home ${arrow}</a><a class="btn" href="/#work">See the work</a></div>
</div></section></main>
${footer("/")}
</body></html>
`;
}


/* ======================================================================= SERVICE PAGES (footer: AI Automation, Paid Ads, CGI Ads) */
const svcCards = (items) => `<ul class="svc" style="--n:${items.length}">${items.map(([t, b]) => `<li class="reveal"><h3>${t}</h3><p>${b}</p></li>`).join("")}</ul>`;
const svcFaq = (list) => `<div class="faq reveal">${list.map(([q, a]) => `<details name="faq"><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join("")}</div>`;
const sec = (kicker, h, body, extra = "") => `<section class="band" data-cover><div class="wrap"><div class="head reveal"><div><span class="kicker">${kicker}</span><h2 data-scramble>${h}</h2></div>${extra}</div>${body}</div></section>`;
const stepList = (list) => `<ol class="steps reveal">${list.map(([t, b], i) => `<li><span class="n">0${i + 1}</span><h3>${t}</h3><p>${b}</p></li>`).join("")}</ol>`;
const certsFor = (re) => certs.filter((c) => re.test(`${c.title} ${c.issuer} ${c.skill}`));
const services = {
  agents: {
    file: "ai-agents.html", crumb: "AI Automation", kicker: "Main focus",
    title: "AI Automation & AI Agents | Syed Mateen (Syyed Mateen)",
    desc: "AI automation by Syed Mateen: AI voice agents, chat agents and n8n workflows that answer calls, book appointments, qualify leads and update your CRM.",
    h1: `AI automation that <span class="hl">does the work</span>`,
    lede: "Voice agents, chat agents and n8n workflows that answer, book, follow up and keep your tools in sync. You stop copying data and start answering only the calls that matter",
    service: "AI automation, AI agent and workflow development", og: "ai-agents",
    answer: "Syed Mateen builds AI voice agents, chat agents and n8n workflow automations for businesses. They answer calls and messages, book appointments into Google Calendar, qualify leads and keep CRMs and sheets up to date around the clock.",
    vis: ["assets/img/clinic-poster.jpg", "assets/img/onboarding-poster.jpg", "assets/img/robot-poster.jpg"], visKind: "wide",
    faq: [
      ["What can an AI agent do for a small business?", "Answer calls and messages, book appointments into your calendar, qualify leads, send follow ups and keep your CRM or Google Sheets up to date day and night."],
      ["Which tools do you build with?", "n8n for the workflows and ElevenLabs for voice, connected to Google Calendar, Sheets, Gmail, Slack, Telegram and HubSpot."],
      ["How long does a build take?", "A focused agent such as a booking line usually takes one to two weeks including testing with your real tools."]
    ],
    body: () => [
      sec("Selected work", "Agents and automations", `<div class="grid">${workRows()}</div>`, `<p class="soft">Tap any card to watch</p>`),
      sec("What I build", "Four kinds of automation", svcCards([
        ["Voice agents", "Pick up every call, answer questions, book the appointment and send the confirmation"],
        ["Chat agents", "Website and WhatsApp chat that replies instantly and hands warm leads to you"],
        ["Workflow automation", "n8n flows that connect your CRM, calendar, sheets and Slack so nobody copies data by hand"],
        ["Content pipelines", "Long videos in and captioned Shorts out, scheduled and posted for you"]
      ])),
      sec("Case studies", "How they were built", `<div class="cases reveal"><a href="work/clinic-voice-booking-agent.html"><span class="g">Voice agent</span><b>Clinic voice booking agent</b><span class="go">${arrow}</span></a><a href="work/youtube-to-shorts-agent.html"><span class="g">Automation</span><b>YouTube to Shorts agent</b><span class="go">${arrow}</span></a></div>`),
      ...(certsFor(/hubspot|crm/i).length ? [sec("Certified", "CRM and sales automation", certCards(certsFor(/hubspot|crm/i)))] : [])
    ]
  },
  marketing: {
    file: "marketing.html", crumb: "Paid Ads", kicker: "Paid ads",
    title: "Paid Ads: Meta Ads & Google Ads | Syed Mateen (Syyed Mateen)",
    desc: "Paid ads by Syed Mateen: Meta and Google Ads campaigns for lead generation with proper conversion tracking, creative testing and fast lead follow up.",
    h1: `Paid ads that bring <span class="hl">real leads</span>`,
    lede: "Meta and Google campaigns with clear audiences, tested creative and tracking you can trust. Judged on cost per lead and not on likes",
    service: "Paid advertising: Meta Ads and Google Ads", og: "marketing",
    answer: "Syed Mateen runs Meta (Facebook and Instagram) and Google ad campaigns for lead generation. He sets up the pixel and conversion tracking, builds and tests the creative and connects every lead to a CRM with an instant follow up.",
    vis: () => ads.slice(0, 3).reverse().map((a) => a.poster), visKind: "tall",
    faq: [
      ["Do you run Meta and Google ads?", "Yes. Campaign setup, audiences, creative testing and conversion tracking on Meta (Facebook and Instagram) and Google (Search and YouTube)."],
      ["Can you make the ad creative too?", "Yes. CGI product ads and short videos are made in house so the creative and the campaign are planned together."],
      ["How do you measure results?", "By cost per lead and booked calls. Conversion tracking goes in before the first dollar is spent."]
    ],
    body: () => [
      sec("What I do", "Five ways to grow", svcCards([
        ["Meta Ads", "Facebook and Instagram campaigns with clear audiences, tested creative and proper pixel tracking"],
        ["Google Ads", "Search and YouTube campaigns measured on real conversions"],
        ["Ad creative", "CGI product ads, edits and hooks made for the first second of a Reel"],
        ["Tracking", "Pixel, conversions API and Google tags set up so every lead is counted"],
        ["Lead follow up", "Every lead lands in your CRM with a reply already sent so nobody goes cold"]
      ])),
      ...(certsFor(/google|facebook|meta/i).length ? [sec("Certified", "Paid advertising credentials", certCards(certsFor(/google|facebook|meta/i)))] : []),
      sec("Creative", "Ads that stop the scroll", `<div class="ads-grid three">${ads.slice(0, 4).map((w) => `<div class="ad-item">${card(w, "ad")}</div>`).join("")}</div>`, `<a class="link-more" href="cgi-ads.html">All CGI ads ${arrow}</a>`),
      sec("How it works", "Three steps", stepList([["Audit", "A look at your ads, page and tracking. What works stays and what leaks gets fixed"], ["Launch", "Campaigns, creative and follow up go live together, measured from day one"], ["Improve", "Weekly changes based on cost per lead"]]))
    ]
  },
  ads: {
    file: "cgi-ads.html", crumb: "CGI Ads", kicker: "CGI ads and editing",
    title: "CGI Ads & Video Editing for Reels and TikTok | Syed Mateen",
    desc: "CGI product ads and video editing by Syed Mateen: skincare, hair care, food and med spa ads for Reels, Shorts and TikTok. Studio quality with no studio and no shoot.",
    h1: `CGI ads that <span class="hl">sell the product</span>`,
    lede: "Studio quality product ads and clean edits for Reels, Shorts and TikTok. No studio and no shoot. Tap any ad to watch it with sound",
    service: "CGI product ads and video editing", og: "cgi-ads",
    answer: "Syed Mateen creates CGI product ads and edits short videos for Reels, Shorts and TikTok. Each ad is built shot by shot around the product and finished with editing, sound design and captions. No studio and no film shoot.",
    vis: () => ads.slice(0, 3).map((a) => a.poster), visKind: "tall",
    faq: [
      ["What is a CGI ad?", "A product ad created digitally instead of filmed on set. Think liquids, splashes, exploding layers and camera moves that would cost a full studio day to shoot."],
      ["Do I need to send the product?", "No. Clear photos of the product and its label are enough to build the shots around it."],
      ["Do you also edit videos?", "Yes. Reels, Shorts and TikTok edits with captions, sound and hooks, from your own footage or from scratch."]
    ],
    body: () => [
      sec("All ads", "The collection", `<div class="ads-grid">${ads.map((w) => `<div class="ad-item">${card(w, "ad")}<p>${esc(w.text)}</p><a class="link-more" href="${w.page}">Watch and details ${arrow}</a></div>`).join("")}</div>`, `<p class="soft">${ads.length} ads. Tap to watch with sound</p>`),
      sec("How it's made", "Three steps", stepList([["Brief", "The product, the audience and the one thing the first second must say"], ["Design", "Look, lighting and motion planned shot by shot around your product"], ["Finish", "Edit, sound, captions and every format you need, ready to post"]])),
      sec("Case study", "Behind one ad", `<div class="cases reveal"><a href="work/ponds-hydra-miracle-spec-ad.html"><span class="g">Skincare spec ad</span><b>Pond's Hydra Miracle</b><span class="go">${arrow}</span></a></div>`)
    ]
  }
};
const ratioName = (w, h) => { const r = w / h; return [[9, 16], [4, 5], [3, 4], [2, 3], [1, 1], [4, 3], [16, 9], [21, 9]].reduce((b, c) => (Math.abs(c[0] / c[1] - r) < Math.abs(b[0] / b[1] - r) ? c : b)).join(":"); };
function adPage(a) {
  const url = `${SITE_URL}/${a.page}`, others = ads.filter((o) => o !== a).slice(0, 8);
  const h1 = `${a.title} CGI ad`;
  const graph = [website, person, business,
    { "@type": "WebPage", "@id": `${url}#page`, url, name: `${h1} | Syed Mateen`, description: a.text, isPartOf: { "@id": `${SITE_URL}/#website` }, primaryImageOfPage: `${SITE_URL}/${a.posterJpg}`, video: { "@id": `${url}#video` }, author: { "@id": PERSON_ID }, dateModified: TODAY },
    { ...adVideo(a), "@id": `${url}#video` },
    crumbs(["CGI Ads", `${SITE_URL}/cgi-ads.html`], [a.title, url])
  ];
  const vertical = a.h >= a.w, fmt = `${a.w === a.h ? "Square" : vertical ? "Vertical" : "Widescreen"} ${ratioName(a.w, a.h)}`, fit = Math.abs(a.w / a.h - 9 / 16) > 0.05;
  const desc = clip(`${h1} by Syed Mateen: ${a.text.charAt(0).toLowerCase()}${a.text.slice(1)} A ${a.dur}-second ${vertical ? "vertical " : ""}video for Reels, Shorts and TikTok.`, 158);
  const idea = a.idea || a.text;
  return `${head({ title: `${h1} | Syed Mateen`, desc, pathname: `/${a.page}`, image: `/${a.og}`, imageAlt: h1, type: "video.other", graph, root: "../" })}
${header("../")}
<main id="content" class="ad-page">
  <section class="case-hero"><div class="wrap ad-hero">
    <div class="ad-copy">
      <ol class="crumbs" aria-label="Breadcrumb"><li><a href="../index.html">Home</a></li><li><a href="../cgi-ads.html">CGI Ads</a></li><li aria-current="page">${esc(a.title)}</li></ol>
      <span class="kicker rise">CGI ad <span class="alt">${esc(a.tag)}</span></span>
      <h1 class="rise d1" data-scramble>${esc(h1)}</h1>
      <p class="lede rise d2">${esc(a.text)}</p>
      <dl class="facts-row">${[["Category", a.tag], ["Format", fmt], ["Length", `${a.dur} seconds`], ["Sound", a.audio ? "Yes" : "Silent"]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <div class="actions"><a class="btn solid" href="#contact">Get an ad like this ${arrow}</a>${a.link ? `<a class="btn" href="../${a.link}">${esc(a.linkLabel || "Case study")}</a>` : `<a class="btn" href="../cgi-ads.html">All CGI ads</a>`}</div>
    </div>
    <figure class="ad-player"><div class="frame card solo${fit ? " fit" : ""}" style="--ar:${a.w}/${a.h}"><span class="screen">${fit ? `<span class="blur" style="background-image:url('../${a.poster}')"></span>` : ""}<video id="adVideo" controls playsinline preload="metadata" poster="../${a.poster}" aria-label="${esc(h1)}" data-sound-video><source src="../${a.video}" type="video/mp4"></video></span></div><figcaption class="soft">${a.audio ? "Press play to watch with sound." : "Press play to watch."}</figcaption></figure>
  </div></section>
  <div class="case-body"><div class="wrap">
    <section class="case-sec reveal"><h2>The idea</h2><div class="content"><p>${esc(idea)}</p></div></section>
    ${a.why.length ? `<section class="case-sec reveal"><h2>Why it works</h2><div class="content"><ul class="ticks">${a.why.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></section>` : ""}
    <section class="case-sec reveal"><h2>Where it runs</h2><div class="content"><p>Made for Instagram Reels, YouTube Shorts and TikTok, where most people watch with the sound off at first, so the story works on picture alone.</p></div></section>
    ${others.length ? `<section class="case-sec reveal"><h2>More ads</h2><div class="content"><ul class="more-ads">${others.map((o) => `<li><a href="../${o.page}"><img src="../${o.poster}" alt="${esc(o.title)} ad poster" width="${o.w}" height="${o.h}" loading="lazy"><span>${esc(o.title)}</span></a></li>`).join("")}</ul></div></section>` : ""}
  </div></div>
  <section id="contact" class="case-contact" aria-labelledby="h-contact"><div class="wrap">${contactInner("Want an ad like this?", "contact")}</div></section>
</main>
${footer("../")}
</body>
</html>
`;
}
function servicePage(k) {
  const P = services[k], url = `${SITE_URL}/${P.file}`;
  const graph = [
    website, person,
    { "@type": "WebPage", "@id": `${url}#page`, url, name: P.title, description: P.desc, isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${url}#service` }, dateModified: TODAY },
    business,
    { "@type": "Service", "@id": `${url}#service`, name: P.service, serviceType: P.crumb, description: P.answer, provider: { "@id": PERSON_ID }, brand: { "@id": BUSINESS_ID }, areaServed: ["United States", "Worldwide"], url, image: `${SITE_URL}/assets/img/og/${P.og}.jpg` },
    crumbs([P.crumb, url]),
    { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: P.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ...(k === "ads" ? ads.map((a) => adVideo(a)) : [])
  ];
  return `${head({ title: P.title, desc: P.desc, pathname: `/${P.file}`, image: `/assets/img/og/${P.og}.jpg`, imageAlt: P.title, graph })}
${header("")}
<main id="content" class="svc-page">
  <section class="case-hero"><div class="wrap">
    <div class="hero-vis ${P.visKind}" aria-hidden="true">${(typeof P.vis === "function" ? P.vis() : P.vis).map((src) => `<img src="${src}" alt="" loading="eager" decoding="async">`).join("")}</div>
    <ol class="crumbs" aria-label="Breadcrumb"><li><a href="index.html">Home</a></li><li aria-current="page">${P.crumb}</li></ol>
    <span class="kicker rise">${P.kicker}</span>
    <h1 class="rise d1" data-scramble>${P.h1}</h1>
    <p class="lede rise d2">${P.lede}</p>
    <div class="tldr rise d2"><strong>In short</strong><p>${P.answer}</p></div>
    <div class="actions rise d3"><a class="btn solid" href="#contact">Start a project ${arrow}</a><a class="btn" href="index.html#work">See all work</a></div>
  </div></section>
  ${P.body().join("\n  ")}
  ${sec("FAQ", "Quick answers", svcFaq(P.faq))}
  <section id="contact" class="case-contact" aria-labelledby="h-contact"><div class="wrap">${contactInner("Let's build something", "contact")}</div></section>
</main>
${footer("")}
${lightbox()}
</body>
</html>
`;
}

/* ======================================================================= LEGAL PAGES */
const LEGAL_EMAIL = EMAIL; // one address everywhere
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
      ["Website content", `<p>The work shown on this website, including ads and videos, belongs to Syed Mateen or the relevant brand owner. Spec work is marked as such and is not endorsed by the brands shown.</p>`],
      ["Availability", `<p>Parts of the tools may be changed, paused or stopped for maintenance, security or development. They are provided as available, without a guarantee that they will always be uninterrupted or error-free.</p>`],
      ["Changes", `<p>These terms may change. The date at the top always shows the latest version.</p>`],
      ["Contact", `<p>Questions about these terms: <a href="mailto:${LEGAL_EMAIL}">${LEGAL_EMAIL}</a></p>`]
    ]
  }
};
function legalPage(k) {
  const L = legal[k], url = `${SITE_URL}/${L.file}`;
  const graph = [website, person, { "@type": "WebPage", "@id": `${url}#page`, url, name: L.title, isPartOf: { "@id": `${SITE_URL}/#website` }, dateModified: TODAY }, crumbs([L.title, url])];
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
// every indexable page, with its main images and videos (Google image + video sitemaps)
const V = (t, d, th, u, dur) => ({ t, d, th, u, dur });
const sitemapPages = [
  { p: "/", pr: "1.0", img: ["/assets/img/og-image.jpg", "/assets/img/syed-mateen-portrait.jpg", ...certs.filter((c) => c.img).map((c) => `/${c.img}`)] },
  { p: "/ai-agents.html", pr: "0.9", img: ["/assets/img/og/ai-agents.jpg"], v: work.map((x) => V(x.title, x.text, `/${x.poster}`, `/${x.video}`, x.dur)) },
  { p: "/cgi-ads.html", pr: "0.9", img: ["/assets/img/og/cgi-ads.jpg"], v: ads.map((a) => V(`${a.title} ad`, a.text, `/${a.posterJpg}`, `/${a.video}`, a.dur)) },
  { p: "/marketing.html", pr: "0.9", img: ["/assets/img/og/marketing.jpg"] },
  ...ads.map((a) => ({ p: `/${a.page}`, pr: "0.7", img: [`/${a.posterJpg}`], v: [V(`${a.title} CGI ad by Syed Mateen`, a.text, `/${a.posterJpg}`, `/${a.video}`, a.dur)] })),
  ...cases.map((c) => ({ p: `/work/${c.slug}.html`, pr: "0.8", img: [c.image], v: [V(c.video.name, c.video.desc, c.image, c.video.mp4, parseInt(c.video.duration.replace(/\D/g, ""), 10))] })),
  { p: "/terms.html", pr: "0.2" }, { p: "/privacy-policy.html", pr: "0.2" }
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemapPages.map(({ p, pr, img = [], v = [] }) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${pr}</priority>${img.map((i) => `
    <image:image><image:loc>${SITE_URL}${i}</image:loc></image:image>`).join("")}${v.map((x) => `
    <video:video>
      <video:thumbnail_loc>${SITE_URL}${x.th}</video:thumbnail_loc>
      <video:title>${esc(x.t)}</video:title>
      <video:description>${esc(x.d)}</video:description>
      <video:content_loc>${SITE_URL}${x.u}</video:content_loc>
      <video:duration>${x.dur || 10}</video:duration>
    </video:video>`).join("")}
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

> Syed Mateen (also written Syyed Mateen, full name Syed Abdul Mateen) is an AI automation and digital marketing specialist. His main focus is AI automation: AI voice agents, chat agents and n8n workflows that answer calls, book appointments, qualify leads and update CRMs. He also runs Meta Ads and Google Ads campaigns for lead generation and creates CGI product ads and video edits for Reels, Shorts and TikTok. He works with Lenaar Digital on AI automation and social media marketing for US clients and studies computer science at the University of Karachi. Works remotely with clients worldwide.

Key facts:
- Name: Syed Mateen. Also searched as Syyed Mateen, Syed Abdul Mateen and syyedmateen
- Headline: Digital Marketing + AI Automation (Meta Ads, Lead Generation, n8n, Voice Agents)
- Skills in order of focus: AI automation (main focus), paid ads (Meta and Google), content creation (CGI ads) and video editing
- Role: AI Automation & Social Media Marketing, Lenaar Digital (part-time, remote, US clients), since June 2026
- Also: Call Centre Agent on a US DME campaign (customer communication, CRM tracking, lead generation), since August 2026
- Education: BS Computer Science, University of Karachi (in progress); Intermediate in Computer Science, Boys Degree College
- Certifications: ${certs.map((c) => `${c.title}${c.issuer || c.date ? ` (${[c.issuer, certDate(c.date)].filter(Boolean).join(", ")})` : ""}`).join("; ") || "see the site"}
- Tools: n8n, ElevenLabs, HubSpot, Google Calendar, Google Sheets, Gmail, Slack, Telegram, Meta Ads Manager, Google Ads, CapCut, Shopify, Figma
- Contact: ${EMAIL}, LinkedIn ${LINKEDIN}, Instagram @syyed_mateen, X @Syyedmateen

## Services

${Object.values(services).map((P) => `- [${P.crumb}](${SITE_URL}/${P.file}): ${P.answer}`).join("\n")}

## Certifications

${certs.map((c) => `- ${c.title}${c.issuer ? `, ${c.issuer}` : ""}${c.date ? `, issued ${certDate(c.date)}` : ""}${c.url ? ` (verify: ${c.url})` : ""}`).join("\n")}

## Case studies

${cases.map((c) => `- [${c.crumb}](${SITE_URL}/work/${c.slug}.html): ${c.desc}`).join("\n")}

## CGI ads

${ads.map((a) => `- [${a.title}](${SITE_URL}/${a.page}): ${a.text} (${a.dur}s)`).join("\n")}

## Optional

- [Full text for language models](${SITE_URL}/llms-full.txt)
- [About](${SITE_URL}/#about)
- [FAQ](${SITE_URL}/#faq)
- [Privacy Policy](${SITE_URL}/privacy-policy.html)
- [Terms](${SITE_URL}/terms.html)
`;
const strip = (h) => String(h).replace(/<li>/g, "\n- ").replace(/<\/(p|h3|ol|ul)>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\n{3,}/g, "\n\n").trim();
const llmsFull = `# Syed Mateen: full site text

Source: ${SITE_URL}/ (updated ${TODAY})

${llms.split("\n## Optional")[0].replace(/^# Syed Mateen\n\n/, "")}

## Frequently asked questions

${faqs.map(([q, a]) => `### ${q}\n${a}`).join("\n\n")}

${Object.values(services).map((P) => `## ${P.crumb} (${SITE_URL}/${P.file})\n\n${P.answer}\n\n${P.faq.map(([q, a]) => `### ${q}\n${a}`).join("\n\n")}`).join("\n\n")}

${cases.map((c) => `## Case study: ${c.crumb} (${SITE_URL}/work/${c.slug}.html)\n\n${strip(c.tldr)}\n\n${c.sections.map(([h, b]) => `### ${h}\n${strip(b)}`).join("\n\n")}`).join("\n\n")}

${ads.map((a) => `## CGI ad: ${a.title} (${SITE_URL}/${a.page})\n\n${a.idea || a.text}${a.why.length ? `\n\nWhy it works:\n${a.why.map((x) => `- ${x}`).join("\n")}` : ""}`).join("\n\n")}
`;
const manifest = JSON.stringify({ name: "Syed Mateen", short_name: "Mateen", start_url: "/", display: "browser", background_color: "#040507", theme_color: "#040507", icons: [{ src: "/assets/img/apple-touch-icon.png", sizes: "180x180", type: "image/png" }, { src: "/assets/img/favicon.svg", sizes: "any", type: "image/svg+xml" }] }, null, 2);
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc4ff"/><stop offset="1" stop-color="#1f6fff"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#040507"/><g transform="translate(32 35) scale(0.98) translate(-32 -34)"><line x1="32" y1="9" x2="32" y2="16" stroke="#5aa8ff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="8" r="3.4" fill="#7cc4ff"/><rect x="7" y="27" width="5" height="14" rx="2.5" fill="url(#g)"/><rect x="52" y="27" width="5" height="14" rx="2.5" fill="url(#g)"/><rect x="11" y="16" width="42" height="35" rx="13" fill="url(#g)"/><rect x="17" y="24" width="30" height="18" rx="9" fill="#05080f"/><circle cx="26" cy="33" r="3.6" fill="#e6f4ff"/><circle cx="38" cy="33" r="3.6" fill="#e6f4ff"/></g></svg>`;

/* ---------- write ---------- */
const w = (p, s) => { const f = path.join(DIST, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
w("index.html", home());
cases.forEach((c) => w(`work/${c.slug}.html`, casePage(c)));
w("404.html", notFound());
Object.keys(services).forEach((k) => w(services[k].file, servicePage(k)));
ads.forEach((a) => w(a.page, adPage(a)));
w("privacy-policy.html", legalPage("privacy")); w("terms.html", legalPage("terms"));
w("sitemap.xml", sitemap); w("robots.txt", robots); w("llms.txt", llms); w("llms-full.txt", llmsFull);
w("site.webmanifest", manifest); w("assets/img/favicon.svg", favicon);
// the three 3D phones play the first three ads (set "phone": false in an ad's .json to skip it)
const phoneAds = ads.filter((a) => a.phone).slice(0, 3);
w("assets/models/ads.js", `window.PHONE_ADS=${JSON.stringify(phoneAds.map((a) => ({ name: a.title, src: a.screen, poster: a.tiny })))};`);
w(".nojekyll", "");
console.log(`built ${SITE_URL} ${TODAY}: ${ads.length} CGI ads, ${certs.length} certificates${warnings.length ? `, ${warnings.length} warning(s)` : ""}`);
