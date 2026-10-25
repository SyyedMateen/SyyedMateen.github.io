# Adding CGI ads and certificates

No code to edit. Upload a file to the right folder on GitHub and the site updates itself in about 2–3 minutes.

## Add a CGI ad

1. On GitHub, open the `content/cgi-ads` folder.
2. Click **Add file → Upload files** and drop in your video (`.mp4`, `.mov`, `.m4v` or `.webm`).
3. Click **Commit changes**.

That's it. The new ad appears **first** in the CGI Ads section on the home page, on the CGI Ads page, gets its own watch page (`/ads/your-file-name.html`), and is added to the sitemap for Google.

**The file name becomes the title.** `rose-perfume-ad.mp4` shows as "Rose Perfume". Use dashes or spaces; a trailing "ad" is dropped from the title. Keep each video under 25 MB when uploading through the browser (GitHub's limit); bigger or non-MP4 files are converted for the web automatically.

The build also makes, by itself: a cover image (from the video), a short silent preview loop for the cards, a share image for WhatsApp/LinkedIn/X, and it strips file tags (encoder, tool names, dates, location) from the published video.

### Optional extras (same file name, different ending)

| File | What it does |
|---|---|
| `rose-perfume-ad.jpg` (or `.png`) | Your own cover image instead of a frame from the video |
| `rose-perfume-ad.json` | Title, category and text (see below) |

Example `rose-perfume-ad.json` (every line is optional):

```json
{
  "title": "Rose Perfume",
  "tag": "Fragrance",
  "text": "Petals, glass and light, landing on the bottle.",
  "idea": "A longer paragraph for the watch page.",
  "why": ["First reason it works.", "Second reason.", "Third reason."],
  "date": "2026-11-02",
  "pin": true,
  "phone": true,
  "hidden": false
}
```

- `pin: true` keeps an ad at the front, whatever its date.
- `phone: false` keeps it off the three floating 3D screens (they play the first three ads).
- `hidden: true` takes it off the site without deleting the file.
- Order is newest upload first. Files uploaded together are ordered by their `date`.

To remove an ad, delete its video (and its `.jpg`/`.json`, if any).

## Add a certificate

1. Open the `content/certificates` folder on GitHub.
2. **Add file → Upload files**, drop in the certificate as an image (`.jpg`, `.png`, `.webp`) or a `.pdf`.
3. **Commit changes**.

It appears first in the Certifications section, opens full size when tapped, and is added to the site's structured data so Google knows about it. Credential numbers are never shown on the site. The issuer is guessed from the file name (Google, HubSpot, Meta, Microsoft, Coursera, LinkedIn, AWS).

Optional `.json` with the same name:

```json
{
  "title": "Google Ads Search Certification",
  "issuer": "Google",
  "date": "2026-11-02",
  "expires": "2027-11",
  "url": "https://skillshop.credential.net/...",
  "skill": "Paid ads"
}
```

`url` adds a **Verify** button. A `.json` on its own (no image) still shows the certificate as a card; add the image later with the same name.
