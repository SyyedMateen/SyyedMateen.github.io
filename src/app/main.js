/* Syed Mateen · page behaviour: preloader, smooth scroll, sound, accent colours, cursor,
   text scramble, magnetic buttons, video tiles and lightbox. Content is never hidden without JS. */
import Lenis from "lenis";
import { gsap } from "gsap";
import { Sound } from "./sound.js";

const d = document, root = d.documentElement;
gsap.ticker.lagSmoothing(0); // animations keep real time even when the 3D makes a frame slow
root.classList.add("js");
window.__appReady = true;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const sound = new Sound();
const isHome = !!d.getElementById("stage");

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
setAccent(store.get("accent") || root.getAttribute("data-accent") || "blue", true);
d.querySelectorAll("[data-accent-pick]").forEach((b) => b.addEventListener("click", () => { setAccent(b.getAttribute("data-accent-pick")); sound.glitch(); }));

/* ---------- sound toggle ---------- */
const sBtn = d.querySelector("[data-sound-toggle]");
function setSound(on) {
  const ok = on ? sound.enable() : (sound.disable(), true);
  root.classList.toggle("sound-on", !!(on && ok));
  if (sBtn) { sBtn.setAttribute("aria-pressed", String(!!(on && ok))); sBtn.querySelector(".sr").textContent = on ? "Sound on" : "Sound off"; }
  store.set("sound", on ? "1" : "0");
}
if (sBtn) sBtn.addEventListener("click", () => setSound(!sound.on));

/* ---------- phone menu ---------- */
const menuBtn = d.querySelector(".menu-btn"), menu = d.getElementById("menu");
if (menuBtn && menu) {
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("open")); }
    else { menu.classList.remove("open"); setTimeout(() => { if (!menu.classList.contains("open")) menu.hidden = true; }, 500); }
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); } });
}

/* ---------- every page opens at its top (unless a #section is asked for) ---------- */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) {
  scrollTo(0, 0);
  // inside a preview frame the outer page can keep its old scroll; bring this page's top into view
  if (window.top !== window) requestAnimationFrame(() => { try { d.body.scrollIntoView({ block: "start" }); } catch (e) {} });
}
d.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", (e) => {
  const u = new URL(a.href, location.href);
  if (u.pathname === location.pathname && !u.hash && u.origin === location.origin) { e.preventDefault(); if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else scrollTo({ top: 0, behavior: "smooth" }); }
}));

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.9 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
d.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
  const id = a.getAttribute("href").slice(1), el = id && d.getElementById(id);
  if (!el) return; e.preventDefault();
  if (lenis) lenis.scrollTo(el, { duration: 1.8 }); else el.scrollIntoView({ block: "start" });
}));
const top = d.querySelector(".top");
const onScroll = () => { if (top) top.classList.toggle("solid", scrollY > 40); };
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---------- text scramble (decodes into the real text) ---------- */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";
function scramble(el, dur = 900) {
  if (reduce || el.dataset.scrambled) return; el.dataset.scrambled = "1";
  const nodes = []; const walk = (n) => { n.childNodes.forEach((c) => { if (c.nodeType === 3 && c.textContent.trim()) nodes.push({ n: c, t: c.textContent }); else if (c.nodeType === 1) walk(c); }); };
  walk(el);
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    nodes.forEach(({ n, t }) => {
      const reveal = Math.floor(t.length * k);
      let s = t.slice(0, reveal);
      for (let i = reveal; i < t.length; i++) s += t[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      n.textContent = s;
    });
    if (k < 1) requestAnimationFrame(step); else nodes.forEach(({ n, t }) => (n.textContent = t));
  };
  requestAnimationFrame(step);
}

/* ---------- reveals: below the fold only, so nothing is ever left hidden ---------- */
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    el.classList.remove("below");
    el.querySelectorAll("[data-scramble]").forEach((s) => scramble(s));
    if (el.hasAttribute("data-scramble")) scramble(el);
  }), { threshold: 0.12 });
  d.querySelectorAll(".reveal, [data-scramble]").forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight * 0.9) {
      if (el.classList.contains("reveal")) el.classList.add("below");
      io.observe(el);
    }
  });
}

/* ---------- cursor + magnetic buttons ---------- */
if (fine && !reduce) {
  d.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("pointerenter", () => sound.tick());
    el.addEventListener("click", () => sound.click());
  });
  d.querySelectorAll(".btn, .tools .cta, .snd, .socials a").forEach((el) => {
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: "power3.out" }); });
    el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }));
  });
}

/* ---------- section whoosh: follows the particle transitions ---------- */
if (isHome) {
  let lastTurb = 0, lastAt = 0, lastStation = 0;
  const chapterNow = d.querySelector("[data-chapter-now]"), hud = d.querySelector(".hud");
  const covers = Array.from(d.querySelectorAll("[data-cover], .strip, footer.site"));
  const names = ["Intro", "AI agents", "CGI ads", "Growth", "Automation", "Contact"];
  const tick = (now) => {
    const s = window.__stage;
    if (hud) { const mid = innerHeight * 0.75; hud.classList.toggle("off", covers.some((c) => { const r = c.getBoundingClientRect(); return r.top < mid && r.bottom > mid; })); }
    if (s) {
      if (s.turb > 0.3 && lastTurb <= 0.3 && now - lastAt > 900) { sound.whoosh(0.8 + Math.random() * 0.3); lastAt = now; }
      lastTurb = s.turb;
      const st = Math.round(s.progress);
      if (st !== lastStation) {
        lastStation = st;
        if (chapterNow) { chapterNow.textContent = String(st).padStart(2, "0") + " · " + names[st]; }
        const h = d.querySelector(`[data-station="${st}"] h2, [data-station="${st}"] h1`); if (h) { delete h.dataset.scrambled; scramble(h, 700); }
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- videos ---------- */
const vids = Array.from(d.querySelectorAll("video[data-auto]"));
const playV = (v) => { if (reduce || v.dataset.paused) return; if (v.preload === "none") { v.preload = "auto"; v.load(); } const p = v.play(); if (p && p.catch) p.catch(() => {}); };
if ("IntersectionObserver" in window) {
  const vio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) playV(e.target); else if (!e.target.paused) e.target.pause(); }), { rootMargin: "150px 0px", threshold: 0.1 });
  vids.forEach((v) => vio.observe(v));
}
const lb = d.getElementById("lb");
if (lb && lb.showModal) {
  const lv = lb.querySelector("video"), lt = lb.querySelector("[data-lb-title]"), lx = lb.querySelector("[data-lb-text]"), ll = lb.querySelector("[data-lb-link]");
  d.querySelectorAll("[data-video]").forEach((t) => t.addEventListener("click", () => {
    lv.src = t.getAttribute("data-video"); lv.poster = t.getAttribute("data-poster") || "";
    lv.muted = !t.hasAttribute("data-has-sound") || !sound.on; lv.controls = true;
    lt.textContent = t.getAttribute("data-title"); lx.textContent = t.getAttribute("data-text");
    const link = t.getAttribute("data-link"); ll.hidden = !link; if (link) ll.href = link;
    if (sound.on) sound.music.gain.setTargetAtTime(0.12, sound.ctx.currentTime, 0.3);
    lb.showModal(); if (lenis) lenis.stop(); const p = lv.play(); if (p && p.catch) p.catch(() => {});
  }));
  const close = () => { lv.pause(); lv.removeAttribute("src"); lv.load(); if (lb.open) lb.close(); };
  lb.addEventListener("close", () => { if (lenis) lenis.start(); if (sound.on) sound.music.gain.setTargetAtTime(0.55, sound.ctx.currentTime, 0.6); lv.pause(); lv.removeAttribute("src"); lv.load(); });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
}
d.querySelectorAll("[data-toggle-video]").forEach((b) => {
  const v = d.getElementById(b.getAttribute("data-toggle-video")); if (!v) return;
  const lab = () => (b.textContent = v.paused ? "Play" : "Pause");
  b.addEventListener("click", () => { if (v.paused) { delete v.dataset.paused; v.play(); } else { v.dataset.paused = "1"; v.pause(); } lab(); });
  v.addEventListener("play", lab); v.addEventListener("pause", lab);
});
d.querySelectorAll("button[data-unmute]").forEach((b) => {
  const v = d.getElementById(b.getAttribute("data-unmute")); if (!v) return;
  b.addEventListener("click", () => { v.muted = !v.muted; if (!v.muted) v.play(); b.textContent = v.muted ? "Sound on" : "Sound off"; });
});

/* ---------- preloader ---------- */
const loader = d.getElementById("loader");
const behind = Array.from(d.querySelectorAll("body > header, body > main, body > footer, body > .skip, body > .menu"));
function enter(withSound) {
  behind.forEach((el) => (el.inert = false));
  if (withSound) { setSound(true); sound.intro(); } else setSound(false);
  root.classList.add("entered");
  if (!loader) return;
  if (reduce) { loader.remove(); return; }
  setTimeout(() => { if (loader.isConnected) loader.remove(); }, 3000); // slow devices: never leave the loader on top
  gsap.timeline({ onComplete: () => loader.remove() })
    .to(loader.querySelectorAll(".ld-in > *"), { y: -30, opacity: 0, duration: 0.4, stagger: 0.03, ease: "power2.in" })
    .to(loader, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.1")
    .fromTo(".hero .kicker, .hero h1, .hero .sub, .hero .actions, .hero .scroll", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: "expo.out", immediateRender: false }, "-=0.45");
  setTimeout(() => d.querySelectorAll(".hero [data-scramble]").forEach((s) => scramble(s, 1100)), 900);
}
if (loader) {
  const num = loader.querySelector("[data-count]"), bar = loader.querySelector(".ld-bar i"), btns = loader.querySelector(".ld-enter");
  let real = 0, shown = 0, done = false;
  const readyP = new Promise((res) => { window.__stageReadyResolve = res; });
  const fontsP = d.fonts ? d.fonts.ready : Promise.resolve();
  Promise.race([Promise.all([readyP, fontsP]), new Promise((r) => setTimeout(r, isHome ? 7000 : 600))]).then(() => { real = 100; });
  const start = performance.now();
  const step = (now) => {
    const minT = Math.min(1, (now - start) / 1600);
    const target = real === 100 ? 100 * minT : 90 * minT;
    shown += (target - shown) * 0.12;
    const n = shown > 99.4 ? 100 : Math.floor(shown);
    num.textContent = String(n).padStart(3, "0"); bar.style.transform = `scaleX(${shown / 100})`;
    if (n >= 100 && !done) { done = true; loader.classList.add("ready"); btns.hidden = false; const first = btns.querySelector("button"); first.focus({ preventScroll: true }); gsap.from(btns.children, { y: 16, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power3.out", onComplete: () => { if (d.activeElement === d.body || !loader.contains(d.activeElement)) first.focus({ preventScroll: true }); } }); return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  loader.querySelectorAll("[data-enter]").forEach((b) => b.addEventListener("click", () => enter(b.getAttribute("data-enter") === "sound")));
  if (lenis) lenis.stop();
  behind.forEach((el) => (el.inert = true));
  const unlock = () => { if (lenis) lenis.start(); };
  loader.addEventListener("click", (e) => { if (e.target.closest("[data-enter]")) unlock(); });
} else {
  root.classList.add("entered");
  if (store.get("sound") === "1") {
    // browsers need a gesture; resume on the first interaction
    const once = () => { setSound(true); removeEventListener("pointerdown", once); removeEventListener("keydown", once); };
    addEventListener("pointerdown", once); addEventListener("keydown", once);
  }
}

const y = d.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();
