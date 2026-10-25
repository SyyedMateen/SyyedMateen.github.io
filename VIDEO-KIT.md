# Video kit

## On the site now

| File | Where it plays |
|---|---|
| `reel.mp4` | "Watch the reel" in the hero. Rendered from the site's 3D scene, with an original soundtrack. |
| `clinic.mp4` | Clinic voice agent tile and case study (motion explainer) |
| `shorts.mp4` | YouTube to Shorts tile and case study (motion explainer) |
| `robot-receptionist.mp4` | AI receptionist tile |
| `onboarding-agent.mp4` | Onboarding agent tile (your n8n recording) |

All live in `static/assets/video/`. Cards on the page play small silent previews (`video/preview/`, 50–200 KB each); the full video only loads when someone opens it.

Make a preview for a tile:

```
ffmpeg -i NAME.mp4 -t 8 -vf "scale='min(640,iw)':-2,fps=24" -c:v libx264 -crf 31 -preset slow -pix_fmt yuv420p -movflags +faststart -an static/assets/video/preview/NAME.mp4
```

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

## Clips worth making next

- **Real screen recordings** of the clinic agent and the Shorts agent running. These beat any explainer.
- Dark footage with your accent colour as the only light matches the site best.

## CGI ads

CGI ads are no longer kept here. Put them in `content/cgi-ads/` (see `content/README.md`): posters, preview loops, the 3D phone screens and share images are all made automatically on every build.
