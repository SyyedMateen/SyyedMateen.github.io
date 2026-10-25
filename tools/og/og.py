# Renders the 1200x630 share images in static/assets/img/og/ (run: python3 tools/og/og.py)
import asyncio, os, json
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
A = "file://" + ROOT + "/static/assets/"
C = "file://" + ROOT + "/content/cgi-ads/"  # ad posters live next to the ad videos
LOGO = open(os.path.join(ROOT, "tools/og/logo.svg")).read()
PAGES = [
  ("home", "AI agents, ads &amp; <b>automation.</b>", "AI agents · CGI ads · Marketing", ["img/clinic-poster.jpg", "img/ponds-poster.jpg", "C/burger-fries-ad.jpg"], "mix"),
  ("ai-agents", "AI agents that <b>do the work.</b>", "Voice &amp; chat agents · n8n automation", ["img/clinic-poster.jpg", "img/onboarding-poster.jpg", "img/robot-poster.jpg"], "mix"),
  ("cgi-ads", "CGI ads that <b>sell the product.</b>", "Skincare · Hair care · Food · Med spa", ["C/lumora-serum-ad.jpg", "img/ponds-poster.jpg", "C/burger-fries-ad.jpg"], "tall"),
  ("marketing", "Marketing that brings <b>customers.</b>", "Meta Ads · Google Ads · SEO &amp; AI search", ["C/sukoon-spa-ad.jpg", "C/jabeens-hair-oil-ad.jpg", "C/burger-fries-ad.jpg"], "tall"),
  # ad watch pages get their share image automatically at build time
  # ("lumora-serum-ad", "Lumora serum <b>CGI ad.</b>", "Skincare · Vertical 9:16", ["C/lumora-serum-ad.jpg"], "one"),
  # ("jabeens-hair-oil-ad", "Jabeen's hair oil <b>CGI ad.</b>", "Hair care · Vertical 9:16", ["C/jabeens-hair-oil-ad.jpg"], "one"),
  # ("burger-fries-ad", "Burger &amp; fries <b>CGI ad.</b>", "Food · Vertical 9:16", ["C/burger-fries-ad.jpg"], "one"),
  # ("sukoon-spa-ad", "Sukoon Spa <b>video ad.</b>", "Med spa · Vertical 9:16", ["C/sukoon-spa-ad.jpg"], "one"),
  ("ponds-hydra-miracle-spec-ad", "Pond's Hydra Miracle <b>spec ad.</b>", "CGI ad case study", ["img/ponds-poster.jpg"], "one"),
  ("clinic-voice-booking-agent", "A voice agent that <b>books appointments.</b>", "Case study · ElevenLabs + n8n", ["img/clinic-poster.jpg"], "wide"),
  ("youtube-to-shorts-agent", "YouTube to Shorts, <b>on autopilot.</b>", "Case study · Klap + n8n + Telegram", ["img/shorts-poster.jpg"], "wide"),
]
CSS = """
@font-face{font-family:U;src:url(%sfonts/unbounded-latin-600-normal.woff2)}
@font-face{font-family:M;src:url(%sfonts/manrope-latin-500-normal.woff2)}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:#040507;color:#eef1f7;font-family:M}
.bg{position:absolute;inset:0;background:radial-gradient(60%% 80%% at 85%% 20%%,rgba(31,111,255,.38),transparent 60%%),radial-gradient(40%% 50%% at 0%% 100%%,rgba(124,196,255,.12),transparent 70%%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(160,180,220,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(160,180,220,.06) 1px,transparent 1px);background-size:60px 60px;mask-image:linear-gradient(90deg,#000,transparent 70%%)}
.l{position:absolute;left:70px;top:64px;bottom:64px;width:600px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;align-items:center;gap:14px;font-family:U;font-size:26px;letter-spacing:-.02em}.brand svg{width:52px;height:52px}
h1{font-family:U;font-weight:600;font-size:60px;line-height:1.05;letter-spacing:-.045em;margin:0}
h1 b{font-weight:600;background:linear-gradient(100deg,#1f6fff,#7cc4ff);-webkit-background-clip:text;color:transparent}
.sub{font-size:24px;color:#97a0b3}.url{font-size:20px;color:#7cc4ff;letter-spacing:.02em}
.r{position:absolute;right:60px;top:50%%;transform:translateY(-50%%);width:430px;height:500px}
.r img{position:absolute;object-fit:cover;border-radius:22px;border:1px solid rgba(160,180,220,.22);box-shadow:0 30px 70px -20px rgba(0,0,0,.9)}
.tall img{width:170px;height:302px;top:99px}.tall img:nth-child(1){left:0;transform:rotate(-7deg);opacity:.85}.tall img:nth-child(2){left:130px;top:70px;width:180px;height:320px;z-index:2;box-shadow:0 30px 80px -20px rgba(31,111,255,.6)}.tall img:nth-child(3){left:260px;transform:rotate(7deg);opacity:.85}
.one img{width:260px;height:462px;left:90px;top:19px;box-shadow:0 30px 90px -20px rgba(31,111,255,.6)}
.wide img{width:430px;height:242px;top:129px;left:0;box-shadow:0 30px 90px -20px rgba(31,111,255,.6)}
.mix img:nth-child(1){width:400px;height:225px;left:0;top:40px;z-index:2;box-shadow:0 30px 90px -20px rgba(31,111,255,.6)}.mix img:nth-child(2){width:150px;height:267px;left:20px;top:220px;z-index:3}.mix img:nth-child(3){width:150px;height:267px;left:250px;top:200px;opacity:.9}
""" % (A, A)
async def main():
  os.makedirs(os.path.join(ROOT, "static/assets/img/og"), exist_ok=True)
  async with async_playwright() as p:
    b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 630})
    for name, title, sub, imgs, kind in PAGES:
      html = f"<html><head><style>{CSS}</style></head><body><div class=bg></div><div class=grid></div><div class=l><div class=brand>{LOGO}Syed Mateen</div><div><h1>{title}</h1><p class=sub>{sub}</p></div><div class=url>syyedmateen.com</div></div><div class='r {kind}'>{''.join(f'<img src={C if i.startswith("C/") else A}{i[2:] if i.startswith("C/") else i}>' for i in imgs)}</div></body></html>"
      tmp = os.path.join(ROOT, "tools/og/_tmp.html"); open(tmp, "w").write(html)
      await pg.goto("file://" + tmp); await pg.wait_for_timeout(500)
      await pg.screenshot(path=os.path.join(ROOT, f"static/assets/img/og/{name}.jpg"), type="jpeg", quality=86)
    await b.close(); os.remove(os.path.join(ROOT, "tools/og/_tmp.html"))
asyncio.run(main())
