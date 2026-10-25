// Media pipeline: turns whatever is dropped into content/cgi-ads and content/certificates into web-ready files.
// Runs inside `npm run build` (locally and on GitHub Actions). Results are cached in .cache/media by file hash,
// so a rebuild only processes new or changed files.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const VIDEO_EXT = [".mp4", ".mov", ".m4v", ".webm", ".mkv"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];

/* ---------- tools ---------- */
let FFMPEG = null;
async function findFfmpeg() {
  if (FFMPEG !== null) return FFMPEG;
  const ok = (bin) => { try { return spawnSync(bin, ["-version"], { stdio: "ignore" }).status === 0; } catch (e) { return false; } };
  if (ok("ffmpeg")) return (FFMPEG = "ffmpeg");
  try { const m = await import("ffmpeg-static"); if (m.default && ok(m.default)) return (FFMPEG = m.default); } catch (e) {}
  return (FFMPEG = "");
}
const hasPdftoppm = () => { try { return spawnSync("pdftoppm", ["-v"], { stdio: "ignore" }).status === 0; } catch (e) { return false; } };
const ff = (args) => execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "ignore", "pipe"] });

// width, height, duration, rotation and audio from ffmpeg's own report (no ffprobe needed)
function probe(file) {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-i", file], { encoding: "utf8" });
  const t = (r.stderr || "") + (r.stdout || "");
  const dur = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(t);
  const vid = /Stream[^\n]*Video:\s*(\w+)[^\n]*?\s(\d{2,5})x(\d{2,5})/.exec(t);
  const rot = /rotation of\s*(-?[\d.]+)/.exec(t) || /rotate\s*:\s*(-?\d+)/.exec(t);
  let w = vid ? +vid[2] : 0, h = vid ? +vid[3] : 0;
  if (rot && Math.abs(Math.round(+rot[1])) % 180 === 90) [w, h] = [h, w];
  return { codec: vid ? vid[1] : "", w, h, dur: dur ? +dur[1] * 3600 + +dur[2] * 60 + +dur[3] : 0, audio: /Stream[^\n]*Audio:/.test(t), rotated: !!rot && +rot[1] !== 0 };
}

/* ---------- names, dates, sidecars ---------- */
export const slugify = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
const KEEP = { ai: "AI", seo: "SEO", crm: "CRM", aws: "AWS", ui: "UI", ux: "UX", hubspot: "HubSpot", linkedin: "LinkedIn", youtube: "YouTube", tiktok: "TikTok", n8n: "n8n", cgi: "CGI", "3d": "3D", sql: "SQL", api: "API", ibm: "IBM", it: "IT" };
export function titleFrom(base, dropAd) {
  let s = base.replace(/^\d+[\s._-]+/, "").replace(/[_]+/g, " ").replace(/\s*-\s*/g, " ").replace(/\s+/g, " ").trim();
  if (dropAd) s = s.replace(/\s+(ad|advert|commercial|cgi)$/i, "");
  const mixed = /[A-Z]/.test(s) && /[a-z]/.test(s);
  return s.split(" ").map((w) => KEEP[w.toLowerCase()] || (mixed ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
}
const ISSUERS = [["google", "Google"], ["hubspot", "HubSpot"], ["meta", "Meta"], ["facebook", "Meta"], ["microsoft", "Microsoft"], ["coursera", "Coursera"], ["linkedin", "LinkedIn"], ["aws", "Amazon Web Services"], ["amazon", "Amazon"], ["semrush", "Semrush"], ["udemy", "Udemy"], ["ibm", "IBM"], ["cisco", "Cisco"], ["n8n", "n8n"], ["shopify", "Shopify"], ["tiktok", "TikTok"], ["karachi", "University of Karachi"]];
const guessIssuer = (s) => { s = s.toLowerCase(); const m = ISSUERS.find(([k]) => s.includes(k)); return m ? m[1] : ""; };

function readJson(file, warn) {
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { warn(`${path.basename(file)} is not valid JSON (${e.message}); using defaults`); return {}; }
}
// when was this file added? git commit date (works on GitHub Actions with fetch-depth: 0), then file time
function addedDate(file, root) {
  try {
    const out = execFileSync("git", ["log", "--diff-filter=A", "--follow", "--format=%cI", "--", path.relative(root, file)], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean);
    if (out.length) return new Date(out[out.length - 1]).toISOString().slice(0, 16);
  } catch (e) {}
  return fs.statSync(file).mtime.toISOString().slice(0, 16); // minute precision: files added together tie, then their own date decides
}
const hashFile = (f) => crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex").slice(0, 16);

/* ---------- cache ---------- */
function cached(cacheDir, key, outputs, make) {
  const dir = path.join(cacheDir, key);
  if (outputs.every((o) => fs.existsSync(path.join(dir, o)))) return dir;
  fs.mkdirSync(dir, { recursive: true });
  make(dir);
  return dir;
}

/* ======================================================================= CGI ADS */
export async function collectAds({ root, distDir, warn = console.warn }) {
  const src = path.join(root, "content/cgi-ads"), cacheDir = path.join(root, ".cache/media/ads");
  if (!fs.existsSync(src)) return [];
  const files = fs.readdirSync(src).filter((f) => !f.startsWith("."));
  const videos = files.filter((f) => VIDEO_EXT.includes(path.extname(f).toLowerCase()));
  if (!videos.length) return [];
  if (!(await findFfmpeg())) throw new Error("ffmpeg is needed to process content/cgi-ads. Run `npm install` (ffmpeg-static) or install ffmpeg.");
  const outDir = path.join(distDir, "assets/media/ads");
  fs.mkdirSync(outDir, { recursive: true });
  const used = new Set(), ads = [];
  for (const f of videos) {
    const file = path.join(src, f), base = f.slice(0, -path.extname(f).length);
    const meta = readJson(path.join(src, base + ".json"), warn);
    if (meta.hidden) continue;
    let slug = slugify(meta.slug || base); while (used.has(slug)) slug += "-2"; used.add(slug);
    const posterSrc = IMAGE_EXT.map((e) => path.join(src, base + e)).find((p) => fs.existsSync(p)) || IMAGE_EXT.map((e) => path.join(src, base + e.toUpperCase())).find((p) => fs.existsSync(p));
    const info = probe(file);
    if (!info.w) { warn(`skipped ${f}: not a readable video`); continue; }
    const key = hashFile(file) + (posterSrc ? "-" + hashFile(posterSrc) : "") + "-v5";
    const big = fs.statSync(file).size > 20e6, needsEncode = path.extname(f).toLowerCase() !== ".mp4" || info.codec !== "h264" || big || info.w > 1440 || info.h > 1920 || info.rotated;
    const dir = cached(cacheDir, key, ["full.mp4", "preview.mp4", "screen.mp4", "poster.jpg", "poster.webp", "tiny.jpg", "og.jpg"], (d) => {
      console.log(`  processing ad: ${f}`);
      // full video: original if it is already web-friendly, otherwise an H.264 copy (sound kept)
      // file tags (encoder, tool names, dates, GPS) are always stripped from what gets published
      if (needsEncode) ff(["-i", file, "-map_metadata", "-1", "-map_chapters", "-1", "-vf", "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'", "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", path.join(d, "full.mp4")]);
      else ff(["-i", file, "-map", "0:v:0", "-map", "0:a:0?", "-c", "copy", "-map_metadata", "-1", "-map_chapters", "-1", "-movflags", "+faststart", path.join(d, "full.mp4")]);
      // silent 6-second loop for the cards and the 3D phones
      const start = info.dur > 8 ? Math.min(1, info.dur * 0.1) : 0, len = Math.min(6, Math.max(1, info.dur - start));
      ff(["-ss", String(start), "-t", String(len), "-i", file, "-vf", "scale='if(gt(iw,ih),-2,min(400,iw))':'if(gt(iw,ih),min(400,ih),-2)',fps=24", "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-map_metadata", "-1", path.join(d, "preview.mp4")]);
      // sharp loop for the floating 3D screens (higher resolution than the card previews)
      ff(["-ss", String(start), "-t", String(len), "-i", file, "-vf", "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)',fps=30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-map_metadata", "-1", path.join(d, "screen.mp4")]);
      // poster: your own image if you added one with the same name, otherwise a frame from the video
      if (posterSrc) ff(["-i", posterSrc, "-vf", "scale='min(720,iw)':-2", "-q:v", "3", "-frames:v", "1", path.join(d, "poster.jpg")]);
      else ff(["-ss", String(Math.min(1.5, info.dur * 0.3)), "-i", file, "-frames:v", "1", "-vf", "scale='min(720,iw)':-2", "-q:v", "3", path.join(d, "poster.jpg")]);
      ff(["-i", path.join(d, "poster.jpg"), "-c:v", "libwebp", "-quality", "80", path.join(d, "poster.webp")]);
      ff(["-i", path.join(d, "poster.jpg"), "-vf", "scale=360:-2", "-q:v", "4", path.join(d, "tiny.jpg")]);
      // 1200x630 share image: poster centred over a blurred, darkened copy of itself
      ff(["-i", path.join(d, "poster.jpg"), "-filter_complex", "[0]scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630,boxblur=30:3,eq=brightness=-0.25[bg];[0]scale=-2:560[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2", "-frames:v", "1", "-q:v", "3", path.join(d, "og.jpg")]);
    });
    const out = (n, ext) => { const name = `${slug}${n}.${ext}`; fs.copyFileSync(path.join(dir, n ? n.slice(1) + "." + ext : `full.${ext}`), path.join(outDir, name)); return `assets/media/ads/${name}`; };
    const full = probe(path.join(dir, "full.mp4"));
    const added = addedDate(file, root), date = meta.date || added.slice(0, 10);
    ads.push({
      slug, file: f,
      title: meta.title || titleFrom(base, true),
      tag: meta.tag || "Product ad",
      text: meta.text || "A short vertical product ad made for Reels, Shorts and TikTok",
      idea: meta.idea || "", why: Array.isArray(meta.why) ? meta.why : [],
      link: meta.link || "", linkLabel: meta.linkLabel || "",
      pin: !!meta.pin, phone: meta.phone !== false,
      date, added, dur: Math.max(1, Math.round(full.dur || info.dur)), w: full.w || info.w, h: full.h || info.h, audio: full.audio,
      video: out("", "mp4"), preview: out("-preview", "mp4"), screen: out("-screen", "mp4"), poster: out("-poster", "webp"), posterJpg: out("-poster", "jpg"), og: out("-og", "jpg"),
      tiny: "data:image/jpeg;base64," + fs.readFileSync(path.join(dir, "tiny.jpg")).toString("base64"),
      page: `ads/${slug}.html`
    });
  }
  const orphans = files.filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase()) && !videos.some((v) => v.slice(0, -path.extname(v).length) === f.slice(0, -path.extname(f).length)));
  orphans.forEach((o) => warn(`content/cgi-ads/${o} has no video with the same name, so it is not used`));
  // newest upload first; files uploaded together are ordered by their own date
  return ads.sort((a, b) => (b.pin - a.pin) || b.added.localeCompare(a.added) || String(b.date).localeCompare(String(a.date)));
}

/* ======================================================================= CERTIFICATES */
export async function collectCertificates({ root, distDir, warn = console.warn }) {
  const src = path.join(root, "content/certificates"), cacheDir = path.join(root, ".cache/media/certificates");
  if (!fs.existsSync(src)) return [];
  const files = fs.readdirSync(src).filter((f) => !f.startsWith("."));
  const groups = new Map();
  for (const f of files) {
    const ext = path.extname(f).toLowerCase(), base = f.slice(0, -ext.length);
    if (![...IMAGE_EXT, ".pdf", ".json"].includes(ext)) continue;
    const g = groups.get(base.toLowerCase()) || { base }; groups.set(base.toLowerCase(), g);
    if (ext === ".json") g.json = path.join(src, f); else if (ext === ".pdf") g.pdf = path.join(src, f); else g.img = path.join(src, f);
  }
  const outDir = path.join(distDir, "assets/media/certificates");
  const certs = [], used = new Set();
  const haveFf = await findFfmpeg(), pdfOk = hasPdftoppm();
  for (const g of groups.values()) {
    const meta = g.json ? readJson(g.json, warn) : {};
    if (meta.hidden) continue;
    let slug = slugify(meta.slug || g.base); while (used.has(slug)) slug += "-2"; used.add(slug);
    const title = meta.title || titleFrom(g.base, false);
    const c = { slug, title, issuer: meta.issuer || guessIssuer(g.base + " " + title), skill: meta.skill || "", date: meta.date || "", expires: meta.expires || "", url: meta.url || "", img: "", thumb: "", pdf: "", w: 0, h: 0 };
    const srcFile = g.img || g.pdf;
    if (srcFile) {
      fs.mkdirSync(outDir, { recursive: true });
      if (g.pdf) { fs.copyFileSync(g.pdf, path.join(outDir, `${slug}.pdf`)); c.pdf = `assets/media/certificates/${slug}.pdf`; }
      if (!haveFf) { warn("ffmpeg not found: certificate images are copied without resizing"); }
      const key = hashFile(srcFile) + "-c3";
      try {
        const dir = cached(cacheDir, key, ["full.jpg", "thumb.jpg", "thumb.webp"], (d) => {
          console.log(`  processing certificate: ${path.basename(srcFile)}`);
          let img = g.img;
          if (!img) {
            if (!pdfOk) throw new Error("pdftoppm (poppler-utils) is needed to preview PDF certificates");
            execFileSync("pdftoppm", ["-png", "-r", "150", "-f", "1", "-l", "1", "-singlefile", g.pdf, path.join(d, "page")]);
            img = path.join(d, "page.png");
          }
          // flatten transparent PNGs onto white, then make a large and a small JPEG
          const flat = "[0]format=rgba,split[a][b];[a]drawbox=c=white:t=fill[w];[w][b]overlay=format=auto";
          ff(["-i", img, "-filter_complex", `${flat},scale='min(1800,iw)':-2`, "-frames:v", "1", "-q:v", "3", path.join(d, "full.jpg")]);
          ff(["-i", img, "-filter_complex", `${flat},scale='min(720,iw)':-2`, "-frames:v", "1", "-q:v", "4", path.join(d, "thumb.jpg")]);
          ff(["-i", path.join(d, "thumb.jpg"), "-c:v", "libwebp", "-quality", "82", path.join(d, "thumb.webp")]);
        });
        fs.copyFileSync(path.join(dir, "full.jpg"), path.join(outDir, `${slug}.jpg`));
        fs.copyFileSync(path.join(dir, "thumb.webp"), path.join(outDir, `${slug}-thumb.webp`));
        const p = probe(path.join(dir, "thumb.jpg"));
        c.img = `assets/media/certificates/${slug}.jpg`; c.thumb = `assets/media/certificates/${slug}-thumb.webp`; c.w = p.w; c.h = p.h;
      } catch (e) { warn(`certificate ${path.basename(srcFile)}: ${e.message}`); }
    }
    c.added = srcFile ? addedDate(srcFile, root) : g.json ? addedDate(g.json, root) : "";
    c.pin = !!meta.pin;
    certs.push(c);
  }
  return certs.sort((a, b) => (b.pin - a.pin) || b.added.localeCompare(a.added) || String(b.date).localeCompare(String(a.date)));
}

/* video dimensions for the static demo videos (so every frame matches its real shape) */
export async function videoShape(file) {
  if (!(await findFfmpeg()) || !fs.existsSync(file)) return null;
  const p = probe(file); return p.w ? p : null;
}
