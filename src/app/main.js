/* Syed Mateen: page behaviour.
   Pages change in place (the next page is fetched and swapped in), so the music keeps playing from page to page
   and the 3D stage is never rebuilt. Everything page-specific is set up in initPage() and torn down on the next swap.
   Smooth scroll, sound (on by default), accent colours, heading reveals, magnetic buttons, video tiles, ad carousel,
   lightbox and the contact brief. Content is never hidden without JS. */
import Lenis from "lenis";
import { Sound } from "./sound.js";

const d = document, root = d.documentElement;
root.classList.add("js", "entered");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const session = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
const sound = new Sound();
window.__siteSound = sound; // handy for checking the audio state from the console
const isHome = () => !!d.querySelector("main [data-station]");
let lenis = null;

/* ======================================================================= ONCE PER VISIT */

/* ---------- accent colour ---------- */
const OLD = { purple: "violet", orange: "sunset", green: "aurora" };
function setAccent(name, silent) {
  name = OLD[name] || name;
  root.setAttribute("data-accent", name);
  d.querySelectorAll("[data-accent-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-accent-pick") === name)));
  store.set("accent", name);
  dispatchEvent(new Event("accentchange"));
  if (!silent) sound.tick();
}

/* ---------- sound: on by default ----------
   Every browser blocks sound until the visitor first taps, clicks or presses a key on the site (no page can override
   this). So the music is armed at once, starts by itself where the browser already allows it, and otherwise starts on
   that first touch. Because pages change in place, it then plays on without a break. The intro hit plays once per visit
   and muting lasts for the visit. */
let wantSound = session.get("muted") !== "1", introDone = session.get("intro") === "1";
function paintSound() {
  const live = wantSound && sound.running();
  root.classList.toggle("sound-on", wantSound);
  root.classList.toggle("sound-wait", wantSound && !live);
  const b = d.querySelector("[data-sound-toggle]");
  if (b) { const t = !wantSound ? "Sound off, tap to turn on" : live ? "Sound on, tap to mute" : "Sound starts on your first tap"; b.setAttribute("aria-pressed", String(wantSound)); b.querySelector(".sr").textContent = t; b.title = t; }
}
function maybeIntro() { if (!introDone && wantSound && sound.running()) { introDone = true; session.set("intro", "1"); sound.intro(); } }
function setSound(on, byUser) {
  wantSound = on;
  if (byUser) session.set("muted", on ? "0" : "1");
  if (on) { sound.enable(); maybeIntro(); syncMusic(); } else sound.disable();
  paintSound();
}
sound.onchange = () => { maybeIntro(); syncMusic(); paintSound(); };
const WAKE = ["pointerdown", "mousedown", "keydown", "touchend", "click"];
const wake = () => { if (wantSound) setSound(true); if (sound.running()) WAKE.forEach((ev) => removeEventListener(ev, wake, true)); };
WAKE.forEach((ev) => addEventListener(ev, wake, { capture: true, passive: true }));

/* ---------- the site's sound steps aside completely while any video plays with sound ---------- */
function audibleVideo() { return Array.from(d.querySelectorAll("video")).some((v) => !v.paused && !v.ended && !v.muted && v.volume > 0 && v.currentSrc); }
function syncMusic() { const busy = audibleVideo(); sound.hush = busy; sound.duck(busy); }
["play", "playing", "pause", "ended", "volumechange", "emptied"].forEach((ev) => d.addEventListener(ev, syncMusic, true)); // media events, caught for every video on every page

/* ---------- smooth scroll ---------- */
if (!reduce) {
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
const scrollToEl = (el, instant) => { if (lenis) lenis.scrollTo(el, { duration: instant ? 0 : 1.6, immediate: !!instant, force: true }); else if (typeof el === "number") scrollTo(0, el); else el.scrollIntoView({ block: "start" }); };
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
const onScroll = () => { const t = d.querySelector(".top"); if (t) t.classList.toggle("solid", scrollY > 40); };
addEventListener("scroll", onScroll, { passive: true });

/* ---------- toast ---------- */
let toastEl = null, toastT = 0;
function toast(msg) {
  if (!toastEl || !toastEl.isConnected) { toastEl = d.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); toastEl.setAttribute("aria-live", "polite"); d.body.appendChild(toastEl); }
  toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 3200);
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    const a = d.createElement("textarea"); a.value = t; a.style.position = "fixed"; a.style.opacity = "0"; d.body.appendChild(a); a.select();
    let ok = false; try { ok = d.execCommand("copy"); } catch (e2) {} a.remove(); return ok;
  }
}

/* ---------- phone menu ---------- */
function setMenu(open) {
  const btn = d.querySelector(".menu-btn"), menu = d.getElementById("menu"); if (!btn || !menu) return;
  btn.setAttribute("aria-expanded", String(open));
  if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("open")); }
  else { menu.classList.remove("open"); setTimeout(() => { if (!menu.classList.contains("open")) menu.hidden = true; }, 500); }
}
addEventListener("keydown", (e) => { const btn = d.querySelector(".menu-btn"); if (e.key === "Escape" && btn && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); } });

/* ---------- one click handler for the whole site ---------- */
d.addEventListener("click", (e) => {
  const t = e.target;
  const pick = t.closest("[data-accent-pick]"); if (pick) { setAccent(pick.getAttribute("data-accent-pick")); return; }
  if (t.closest("[data-sound-toggle]")) { setSound(!(wantSound && sound.running()), true); return; }
  if (t.closest(".menu-btn")) { const b = t.closest(".menu-btn"); setMenu(b.getAttribute("aria-expanded") !== "true"); return; }
  const copy = t.closest("[data-copy]"); if (copy) { copyText(copy.getAttribute("data-copy")).then((ok) => toast(ok ? "Email address copied" : copy.getAttribute("data-copy"))); return; }
  const tog = t.closest("[data-toggle-video]"); if (tog) { const v = d.getElementById(tog.getAttribute("data-toggle-video")); if (v) { if (v.paused) { delete v.dataset.paused; v.play(); } else { v.dataset.paused = "1"; v.pause(); } tog.textContent = v.paused ? "Play" : "Pause"; } return; }
  const um = t.closest("button[data-unmute]"); if (um) { const v = d.getElementById(um.getAttribute("data-unmute")); if (v) { v.muted = !v.muted; if (!v.muted) v.play(); um.textContent = v.muted ? "Sound on" : "Sound off"; } return; }
  const vid = t.closest("[data-video]"); if (vid) { openLightbox(vid, false); return; }
  const img = t.closest("[data-image]"); if (img) { openLightbox(img, true); return; }
  const a = t.closest("a[href]"); if (!a) return;
  if (d.getElementById("menu") && d.getElementById("menu").contains(a)) setMenu(false);
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
  let u; try { u = new URL(a.href, location.href); } catch (err) { return; }
  if (u.origin !== location.origin) return;
  const samePage = u.pathname === location.pathname || (pageKey(u.pathname) === pageKey(location.pathname));
  if (samePage) {
    e.preventDefault();
    if (u.hash) { const el = d.getElementById(decodeURIComponent(u.hash.slice(1))); if (el) scrollToEl(el); history.replaceState(history.state, "", u.hash); }
    else scrollToEl(0);
    return;
  }
  if (!/(\.html?|\/)$/.test(u.pathname)) return; // PDFs, text files and the like open normally
  e.preventDefault();
  go(u.href, true);
});
const pageKey = (p) => p.replace(/index\.html?$/, "");

/* ---------- lightbox (video or certificate image) ---------- */
function openLightbox(t, isImage) {
  const lb = d.getElementById("lb"); if (!lb || !lb.showModal) return;
  const lv = lb.querySelector("video"), li = lb.querySelector(".lb-media img"), ll = lb.querySelector("[data-lb-link]"), lbl = lb.querySelector("[data-lb-linktext]");
  lb.querySelector("[data-lb-title]").textContent = t.getAttribute("data-title") || "";
  lb.querySelector("[data-lb-text]").textContent = t.getAttribute("data-text") || "";
  const link = t.getAttribute("data-link"); ll.hidden = !link; lbl.textContent = t.getAttribute("data-link-label") || "See the details";
  if (link) { ll.href = link; if (/^https?:|\.pdf$/.test(link)) { ll.target = "_blank"; ll.rel = "noopener"; } else { ll.removeAttribute("target"); } }
  const [aw, ah] = (t.getAttribute("data-ar") || "16/9").split("/").map(Number);
  lb.classList.toggle("tall", !isImage && ah > aw); lb.classList.toggle("pic", !!isImage);
  lb.style.setProperty("--lar", isImage ? "auto" : `${aw}/${ah}`);
  lv.hidden = !!isImage; li.hidden = !isImage;
  if (isImage) { li.src = t.getAttribute("data-image"); li.alt = t.getAttribute("data-title") || ""; }
  else { lv.src = t.getAttribute("data-video"); lv.poster = t.getAttribute("data-poster") || ""; lv.muted = !t.hasAttribute("data-has-sound"); lv.controls = true; }
  lb.showModal(); if (lenis) lenis.stop();
  if (!isImage) { const p = lv.play(); if (p && p.catch) p.catch(() => { lv.muted = true; lv.play().catch(() => {}); }); }
  if (!lb.dataset.wired) {
    lb.dataset.wired = "1";
    const close = () => { if (lb.open) lb.close(); };
    lb.addEventListener("close", () => { if (lenis) lenis.start(); lv.pause(); lv.removeAttribute("src"); lv.load(); li.removeAttribute("src"); syncMusic(); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  }
}

/* ---------- contact brief: opens the visitor's email app with everything filled in ---------- */
d.addEventListener("input", (e) => { const f = e.target.closest && e.target.closest(".field"); if (f) f.classList.remove("err"); });
d.addEventListener("submit", (e) => {
  const f = e.target.closest("[data-brief]"); if (!f) return;
  e.preventDefault();
  const to = (f.getAttribute("action") || "").replace(/^mailto:/, "");
  const v = (n) => (f.elements[n] && f.elements[n].value || "").trim();
  const need = (f.querySelector("input[name=need]:checked") || {}).value || "A project";
  let bad = null;
  ["name", "message"].forEach((n) => { if (!v(n)) { f.elements[n].closest(".field").classList.add("err"); bad = bad || f.elements[n]; } });
  if (bad) { bad.focus(); toast("Please add your name and a few lines about the project"); return; }
  const subject = `${need}: project enquiry from ${v("name")}`;
  const body = ["Hi Syed,", "", v("message"), "", `What I need: ${need}`, v("company") ? `Company or website: ${v("company")}` : "", "", v("name")].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
  location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  toast("Opening your email app");
  // no email app on this computer? the address is copied so it can be pasted into Gmail or Outlook
  setTimeout(async () => { if (d.hasFocus() && !d.hidden) { const ok = await copyText(to); if (ok) toast(`No email app opened? ${to} is copied so you can paste it into your mail`); } }, 1600);
});

/* ---------- section whoosh: follows the particle transitions (home only) ---------- */
let lastTurb = 0, lastAt = 0, onHome = false;
(function tick(now) {
  requestAnimationFrame(tick);
  const s = window.__stage; if (!onHome || !s) return;
  if (s.turb > 0.3 && lastTurb <= 0.3 && now - lastAt > 900) { sound.whoosh(0.8 + Math.random() * 0.3); lastAt = now; }
  lastTurb = s.turb;
})(0);

/* ---------- headings: words rise softly into place ---------- */
function split(el) {
  if (el.dataset.split) return; el.dataset.split = "1";
  let i = 0;
  const walk = (n) => Array.from(n.childNodes).forEach((c) => {
    if (c.nodeType === 1) { if (!c.classList.contains("sr")) walk(c); return; }
    if (c.nodeType !== 3 || !c.textContent.trim()) return;
    const frag = d.createDocumentFragment();
    c.textContent.split(/(\s+)/).forEach((t) => {
      if (!t) return;
      if (/^\s+$/.test(t)) { frag.appendChild(d.createTextNode(t)); return; }
      const w = d.createElement("span"); w.className = "w"; w.style.setProperty("--i", i++); w.textContent = t; frag.appendChild(w);
    });
    c.replaceWith(frag);
  });
  walk(el); el.classList.add("split");
}
const reveal = (el) => { if (reduce) return; split(el); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in"))); };
// safety net: a heading on screen is always revealed, even if an observer event is late (slow devices, fast jumps)
let netQ = false;
const net = () => { netQ = false; d.querySelectorAll(".split:not(.is-in)").forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight * 0.95 && r.bottom > 0) el.classList.add("is-in"); }); d.querySelectorAll(".reveal.below").forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.remove("below"); }); };
addEventListener("scroll", () => { if (!netQ) { netQ = true; setTimeout(net, 120); } }, { passive: true });

/* ======================================================================= PER PAGE */
let cleanups = [];
const saveData = !!(navigator.connection && navigator.connection.saveData);
function initPage(first) {
  cleanups.forEach((f) => { try { f(); } catch (e) {} }); cleanups = [];
  setAccent(store.get("accent") || root.getAttribute("data-accent") || "blue", true);
  paintSound(); onScroll();
  const y = d.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();

  // reveals: below the fold only, so nothing is ever left hidden
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el); el.classList.remove("below");
      el.querySelectorAll("[data-scramble]").forEach(reveal); if (el.hasAttribute("data-scramble")) reveal(el);
    }), { threshold: 0.12 });
    d.querySelectorAll(".reveal, [data-scramble]").forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight * 0.9) { if (el.classList.contains("reveal")) el.classList.add("below"); if (el.hasAttribute("data-scramble")) split(el); io.observe(el); }
    });
    cleanups.push(() => io.disconnect());
  }

  // cover images load shortly before they scroll into view (keeps the first load light)
  const lazy = Array.from(d.querySelectorAll("[data-lazy-poster], [data-lazy-bg]"));
  const show = (el) => { if (el.dataset.lazyPoster) { el.poster = el.dataset.lazyPoster; delete el.dataset.lazyPoster; } if (el.dataset.lazyBg) { el.style.backgroundImage = `url('${el.dataset.lazyBg}')`; delete el.dataset.lazyBg; } };
  if ("IntersectionObserver" in window) {
    const pio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { pio.unobserve(e.target); show(e.target); } }), { rootMargin: "800px 400px" });
    lazy.forEach((el) => pio.observe(el));
    cleanups.push(() => pio.disconnect());
  } else lazy.forEach(show);

  // video tiles play while on screen
  if ("IntersectionObserver" in window) {
    const playV = (v) => { if (reduce || saveData || v.dataset.paused) return; if (v.preload === "none") { v.preload = "auto"; v.load(); } const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const vio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) playV(e.target); else if (!e.target.paused) e.target.pause(); }), { threshold: 0.35 });
    d.querySelectorAll("video[data-auto]").forEach((v) => vio.observe(v));
    cleanups.push(() => vio.disconnect());
  }

  // hover ticks and magnetic buttons
  if (fine && !reduce) {
    d.querySelectorAll("a, button").forEach((el) => el.addEventListener("pointerenter", () => sound.tick()));
    d.querySelectorAll(".btn, .tools .cta, .snd, .soc").forEach((el) => {
      el.classList.add("mag");
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px"); el.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px"); });
      el.addEventListener("pointerleave", () => { el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px"); });
    });
  }

  // ad carousel: arrows on wide screens, swipe on touch
  d.querySelectorAll(".shelf-wrap").forEach((w) => {
    const sh = w.querySelector(".shelf"), [prev, next] = w.querySelectorAll("[data-shelf]");
    const upd = () => { const max = sh.scrollWidth - sh.clientWidth - 2; w.classList.toggle("can-prev", sh.scrollLeft > 2); w.classList.toggle("can-next", sh.scrollLeft < max); w.classList.toggle("scrolls", max > 2); };
    const step = (dir) => { const c = sh.querySelector(".ad"), cw = c ? c.getBoundingClientRect().width + 16 : sh.clientWidth * 0.8; sh.scrollBy({ left: dir * cw * Math.max(1, Math.floor(sh.clientWidth / cw) - 1), behavior: reduce ? "auto" : "smooth" }); };
    prev.addEventListener("click", () => step(-1)); next.addEventListener("click", () => step(1));
    sh.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
    cleanups.push(() => removeEventListener("resize", upd));
    sh.setAttribute("data-lenis-prevent-touch", "");
  });

  // home: the 3D stage picks up the new page
  onHome = isHome();
  ensureStage();

  // FAQ: opening one answer closes the others (browsers without the built-in behaviour)
  d.querySelectorAll(".faq").forEach((box) => box.addEventListener("toggle", (e) => { if (e.target.open) box.querySelectorAll("details[open]").forEach((o) => { if (o !== e.target) o.open = false; }); }, true));

  // hero entrance
  if (isHome() && !reduce && !location.hash) {
    d.querySelectorAll(".hero .kicker, .hero .sub, .hero .actions, .hero .scroll").forEach((el, i) => { if (el.animate) el.animate([{ transform: "translateY(26px)" }, { transform: "none" }], { duration: 1100, delay: (first ? 50 : 150) + i * 80, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }); });
    d.querySelectorAll(".hero [data-scramble]").forEach((h) => { split(h); setTimeout(() => h.classList.add("is-in"), 120); });
  }
  setTimeout(net, 700);
}

/* ---------- the 3D stage: loaded after the page is ready, then kept across page changes ----------
   The page itself (text, images, videos) shows at once. The heavy 3D (three.js and the robot model) loads on the
   visitor's first scroll, move or tap, or after a few quiet seconds, so it never holds up the first view. */
let stageLoading = false, stageArmed = false;
function loadScript(src) { return new Promise((res, rej) => { const s = d.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; d.head.appendChild(s); }); }
function bootStage() {
  if (stageLoading || window.__stageRefresh || !isHome() || !d.getElementById("stage")) return;
  stageLoading = true;
  loadScript("assets/models/ads.js").catch(() => {}).then(() => loadScript("assets/js/scene.js")).catch(() => {});
}
function ensureStage() {
  if (window.__stageRefresh) { window.__stageRefresh(); return; }
  if (!isHome() || stageArmed) { if (isHome() && stageArmed) bootStage(); return; }
  stageArmed = true;
  const go = () => { ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"].forEach((ev) => removeEventListener(ev, go)); bootStage(); };
  ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"].forEach((ev) => addEventListener(ev, go, { passive: true, once: true }));
  const idle = () => setTimeout(go, 6000);
  if (d.readyState === "complete") idle(); else addEventListener("load", idle, { once: true });
}

/* ---------- page change in place ---------- */
let navId = 0;
async function go(url, push) {
  const id = ++navId;
  root.classList.add("is-leaving");
  let html;
  try { const res = await fetch(url, { credentials: "same-origin" }); if (!res.ok) throw new Error(res.status); html = await res.text(); }
  catch (e) { location.href = url; return; }
  if (id !== navId) return;
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc.querySelector("main")) { location.href = url; return; }
  const swap = () => {
    // head: the visible title and the basics; crawlers read the real page anyway
    d.title = doc.title;
    [["meta[name=description]", "content"], ["link[rel=canonical]", "href"]].forEach(([sel, attr]) => { const n = doc.querySelector(sel), o = d.querySelector(sel); if (n && o) o.setAttribute(attr, n.getAttribute(attr)); });
    if (push) history.pushState({ sm: 1 }, "", url);
    // body: keep the 3D canvas and the toast, replace everything else
    const keepStage = d.getElementById("stage");
    Array.from(d.body.children).forEach((el) => { if (el !== keepStage && el !== toastEl) el.remove(); });
    const frag = d.createDocumentFragment();
    Array.from(doc.body.children).forEach((el) => { if (el.tagName === "SCRIPT") return; if (el.id === "stage" && keepStage) return; frag.appendChild(d.importNode(el, true)); });
    d.body.appendChild(frag);
    if (lenis) { lenis.start(); lenis.resize(); }
    const hash = new URL(url, location.href).hash, target = hash && d.getElementById(decodeURIComponent(hash.slice(1)));
    scrollToEl(0, true);
    initPage(false);
    if (target) setTimeout(() => scrollToEl(target), 60);
    root.classList.remove("is-leaving");
    syncMusic();
  };
  if (d.startViewTransition && !reduce) d.startViewTransition(swap); else swap();
}
addEventListener("popstate", () => go(location.href, false));
history.replaceState({ sm: 1 }, "", location.href);

/* ---------- first load ---------- */
if (!location.hash) { scrollTo(0, 0); if (window.top !== window) requestAnimationFrame(() => { try { d.body.scrollIntoView({ block: "start" }); } catch (e) {} }); }
initPage(true);
if (wantSound) setSound(true); // starts at once where the browser allows it, otherwise on the first tap
paintSound();
