# Video kit

## On the site now

| File | Where it plays |
|---|---|
| `reel.mp4` | "Watch the reel" in the hero. Rendered from the site's 3D scene, with an original soundtrack. |
| `clinic.mp4` | Clinic voice agent tile and case study (motion explainer) |
| `shorts.mp4` | YouTube to Shorts tile and case study (motion explainer) |
| `ponds-hydra-miracle.mp4`, `lumora-serum-ad.mp4`, `jabeens-hair-oil-ad.mp4`, `burger-fries-ad.mp4`, `sukoon-spa-ad.mp4` | CGI ads shelf (with sound) |
| `loop/burger.mp4`, `loop/lumora.mp4`, `loop/jabeens.mp4` | Screens on the three 3D phones (CGI ads chapter) |
| `robot-receptionist.mp4` | AI receptionist tile |
| `onboarding-agent.mp4` | Onboarding agent tile (your n8n recording) |

All live in `static/assets/video/`.

## Swap a video

```
ffmpeg -i new.mp4 -vf "scale='min(1080,iw)':-2" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart -an static/assets/video/NAME.mp4
```

Keep each under about 6 MB. Remove `-an` to keep the sound.

## Re-render the reel in another colour

```
python3 tools/render/record.py reel
```

Edit `reel.html` (or open it with `#purple`, `#orange`, `#green`) to change the accent.

## Clips worth making next (AI video prompts)

Ask for dark footage with your accent colour as the only light. These work in Google Flow (Veo), Kling or Runway:

- **Real screen recordings** of the clinic agent and the Shorts agent running. These beat any explainer.
- **Product macro:** "Slow macro shot of a glass serum dropper bottle on black glass, electric blue rim light, water droplets running down, shallow depth of field, cinematic, no text."
- **AI agent:** "A sleek white robot assistant materialising from glowing blue particles in a dark studio, slow push-in, cinematic, 4K, no text."

## Phone screen loops

```
ffmpeg -ss START -t 6 -i ad.mp4 -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=360:640,fps=24" -c:v libx264 -crf 30 -pix_fmt yuv420p -movflags +faststart -an static/assets/video/loop/NAME.mp4
ffmpeg -ss 1.5 -i static/assets/video/loop/NAME.mp4 -frames:v 1 static/assets/video/loop/NAME.jpg
```

Then regenerate `static/assets/models/ads.js` (the posters as data URIs, so phones still show a picture when the site is opened from a folder) with:

```
python3 -c "import base64,json;d={k:'data:image/jpeg;base64,'+base64.b64encode(open(f'static/assets/video/loop/{k}.jpg','rb').read()).decode() for k in ['burger','lumora','jabeens','ponds']};open('static/assets/models/ads.js','w').write('window.AD_POSTERS='+json.dumps(d)+';')"
```
