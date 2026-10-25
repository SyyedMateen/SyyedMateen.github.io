"""Renders the share image, the two motion explainers and the 3D reel (with an original soundtrack).
Run from the repo root:  python3 tools/render/record.py [og] [clinic] [shorts] [reel]
Needs: playwright (python), ffmpeg, numpy, scipy."""
import sys, os, base64, subprocess, asyncio, shutil, math, tempfile, pathlib
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, butter, lfilter
from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / "static/assets/video"; IMG = ROOT / "static/assets/img"
SCR = pathlib.Path(tempfile.gettempdir()) / "sm-frames"
ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--allow-file-access-from-files", "--ignore-gpu-blocklist"]
FPS = 30
HOLD, GLIDE, NS = 1.7, 1.3, 6


def save(d, i, url):
    (d / f"{i:05d}.jpg").write_bytes(base64.b64decode(url.split(",", 1)[1]))


def encode(name, audio=None, poster_t=1.0):
    d = SCR / name
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(d / "%05d.jpg")]
    if audio: cmd += ["-i", str(audio), "-c:a", "aac", "-b:a", "160k", "-shortest"]
    else: cmd += ["-an"]
    cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "28" if name == "reel" else "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / f"{name}.mp4")]
    subprocess.run(cmd, check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(d / f"{int(poster_t * FPS):05d}.jpg"), "-q:v", "4", str(IMG / f"{name}-poster.jpg")], check=True)


async def motion(p, name):
    b = await p.chromium.launch(args=ARGS)
    W, H = (1200, 630) if name == "og" else (1280, 720)
    pg = await b.new_page(viewport={"width": W, "height": H})
    await pg.goto((HERE / "motion.html").as_uri()); await pg.evaluate(f"setup({W},{H})")
    if name == "og":
        url = await pg.evaluate("drawAt('og',0)"); (IMG / "og-image.jpg").write_bytes(base64.b64decode(url.split(",", 1)[1])); await b.close(); return
    dur = await pg.evaluate(f"MOTION.{name}.dur"); d = SCR / name; shutil.rmtree(d, ignore_errors=True); d.mkdir(parents=True)
    for i in range(int(dur * FPS)): save(d, i, await pg.evaluate(f"drawAt('{name}',{i / FPS})"))
    await b.close(); encode(name, poster_t={"clinic": 8.6, "shorts": 8.9}[name])


def prog(t):
    acc = 0
    for s in range(NS):
        if t < acc + HOLD: return s
        acc += HOLD
        if s < NS - 1:
            if t < acc + GLIDE:
                x = (t - acc) / GLIDE; return s + x * x * (3 - 2 * x)
            acc += GLIDE
    return NS - 1


def transitions():
    out, acc = [], 0
    for s in range(NS - 1):
        acc += HOLD; out.append(acc); acc += GLIDE
    return out


async def reel(p, accent="blue"):
    b = await p.chromium.launch(args=ARGS)
    pg = await b.new_page(viewport={"width": 1280, "height": 720})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto((HERE / "reel.html").as_uri() + "#" + accent); await pg.evaluate("window.sceneReady")
    if errs: print(errs[:5])
    d = SCR / "reel"; shutil.rmtree(d, ignore_errors=True); d.mkdir(parents=True)
    dur = NS * HOLD + (NS - 1) * GLIDE + 0.6
    waved = False
    for i in range(int(dur * FPS)):
        t = i / FPS; pr = prog(t)
        acc, al, st = 0, 0, -1
        for s in range(NS):
            if acc <= t < acc + HOLD:
                u = t - acc; al = min(1, u / 0.3, (HOLD - u) / 0.25) if s < NS - 1 else min(1, u / 0.3); st = s; break
            acc += HOLD + (GLIDE if s < NS - 1 else 0)
        if t >= acc and st < 0: st, al = NS - 1, 1
        if not waved and pr >= 1: await pg.evaluate("sceneWave()"); waved = True
        mx, my = math.sin(t * 0.6) * 0.15, math.cos(t * 0.45) * 0.08
        save(d, i, await pg.evaluate(f"(function(){{sceneRender({t + 1.0},{pr},{mx},{my});return compose({st},{max(0, al)},{t})}})()"))
        if i % 90 == 0: print("reel", i, "/", int(dur * FPS), flush=True)
    await b.close()
    # fade in/out
    tmp = d / "f"; tmp.mkdir()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(d / "%05d.jpg"), "-vf", f"fade=t=in:st=0:d=0.5,fade=t=out:st={dur - 0.7:.2f}:d=0.7", "-q:v", "2", str(tmp / "%05d.jpg")], check=True)
    for f in d.glob("*.jpg"): f.unlink()
    for f in tmp.glob("*.jpg"): f.rename(d / f.name)
    tmp.rmdir()
    wav = SCR / "reel.wav"; soundtrack(dur, transitions(), wav)
    shutil.copy(wav, ROOT / "tools/render/reel-soundtrack.wav")
    encode("reel", audio=wav, poster_t=1.2)


# ---------- original soundtrack, same musical idea as the site's live Web Audio score ----------
def soundtrack(dur, hits, path, sr=44100):
    n = int(dur * sr); L = np.zeros(n); R = np.zeros(n); t = np.arange(n) / sr
    rng = np.random.default_rng(7)
    midi = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [[45, 57, 60, 64, 67, 71], [41, 53, 57, 60, 64, 67], [48, 55, 59, 62, 64, 67], [43, 55, 59, 62, 64, 69]]
    bar = dur / 4
    def lp(x, fc):
        b, a = butter(2, fc / (sr / 2)); return lfilter(b, a, x)
    for ci, ch in enumerate(chords):
        s0 = int(ci * bar * sr); s1 = min(n, int((ci + 1) * bar * sr + 2.5 * sr)); seg = t[s0:s1] - t[s0]
        env = np.minimum(1, seg / 1.6) * np.clip(1 - (seg - bar) / 2.5, 0, 1)
        for k, m in enumerate(ch):
            f = midi(m); amp = 0.16 if k == 0 else 0.05
            if k == 0: wave = np.sin(2 * np.pi * f * seg)
            else:
                wave = sum(2 * ((f * (1 + d) * seg) % 1) - 1 for d in (-0.004, 0, 0.0045)) / 3
                wave = lp(wave, 1400)
            pan = 0.5 + (k - 3) * 0.12
            L[s0:s1] += wave * env * amp * (1 - pan); R[s0:s1] += wave * env * amp * pan
    # plucked arpeggio
    scale = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79]
    for st in np.arange(1.2, dur - 1, 0.375):
        if rng.random() > 0.45: continue
        f = midi(scale[rng.integers(len(scale))]); s0 = int(st * sr); m = min(n - s0, int(1.4 * sr)); seg = np.arange(m) / sr
        w = (2 * np.abs(2 * ((f * seg) % 1) - 1) - 1) * np.exp(-seg * 4) * 0.07
        pan = rng.random(); L[s0:s0 + m] += w * (1 - pan); R[s0:s0 + m] += w * pan
    # whooshes on every transition + intro hit
    noise = rng.standard_normal(n)
    for h in hits:
        s0 = int((h - 0.15) * sr); m = min(n - s0, int(1.5 * sr)); seg = np.arange(m) / sr
        x = noise[s0:s0 + m].copy(); out = np.zeros(m)
        for j in range(0, m, 512):  # sweeping band-pass, block by block
            fc = 250 * (2600 / 250) ** min(1, seg[j] / 0.55) if seg[j] < 0.55 else 2600 * (500 / 2600) ** min(1, (seg[j] - 0.55) / 0.8)
            b, a = butter(2, [max(40, fc * 0.6) / (sr / 2), min(sr / 2 - 1, fc * 1.6) / (sr / 2)], btype="band")
            out[j:j + 512] = lfilter(b, a, x[max(0, j - 2048):j + 512])[-len(x[j:j + 512]):]
        env = np.minimum(1, seg / 0.45) * np.exp(-np.maximum(0, seg - 0.45) * 3.2) * 0.32
        pan = np.clip(seg / 1.3, 0, 1)
        L[s0:s0 + m] += out * env * (1 - pan); R[s0:s0 + m] += out * env * pan
    m = int(3 * sr); seg = np.arange(m) / sr
    hit = np.sin(2 * np.pi * np.cumsum(110 * (36 / 110) ** np.minimum(1, seg / 2.2)) / sr) * np.exp(-seg * 1.6) * 0.5
    L[:m] += hit; R[:m] += hit
    # reverb
    ir_len = int(3.2 * sr); ir = rng.standard_normal((2, ir_len)) * (1 - np.arange(ir_len) / ir_len) ** 2.6 * 0.02
    L = L + fftconvolve(L, ir[0])[:n] * 0.9; R = R + fftconvolve(R, ir[1])[:n] * 0.9
    # fades + normalise
    fade = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 1.2)
    st = np.stack([L * fade, R * fade], 1); st /= max(1e-6, np.abs(st).max()) / 0.85
    wavfile.write(str(path), sr, (st * 32767).astype(np.int16))


async def main():
    which = sys.argv[1:] or ["og", "clinic", "shorts", "reel"]
    SCR.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        for w in which:
            if w == "reel": await reel(p)
            else: await motion(p, w)
            print("done", w, flush=True)

asyncio.run(main())
