// Guide pages (buyer questions). Imported by build.mjs and spread into the services map.
export default ({ sec, prose, svcCards, stepList, linkRows, card, esc, arrow, ads }) => ({
  /* ----- guide: what is a CGI ad ----- */
  whatCgi: {
    file: "what-is-a-cgi-ad.html", crumb: "What Is a CGI Ad?", parent: ["CGI Ads", "cgi-ads.html"], kicker: "Guide",
    title: "What Is CGI Advertising? CGI Ads in Marketing, With Examples",
    desc: "What CGI advertising is, how CGI is used in marketing, photo-real CGI ad examples, how CGI product ads are made without a photoshoot and when a brand should use one.",
    h1: `What is <span class="hl">CGI advertising</span>?`,
    lede: "A plain-English guide to CGI ads and CGI in marketing: what they are, how they're made, real examples and when they make sense for your brand",
    service: "CGI product ad production", serviceType: "CGI ad production", audience: "Brands and small businesses selling on Instagram, TikTok and Amazon", og: "cgi-ads", cta: "Want a CGI ad for your product?",
    answer: "CGI advertising means ads made with computer-generated imagery instead of a camera. A CGI ad is a video or image ad where the product and the scene are created digitally instead of filmed with a camera. The product can float, splash through water, sit on a building or move in ways that would be expensive or impossible to shoot. Brands use CGI ads on Instagram Reels, TikTok and YouTube Shorts because they stop the scroll and can be made from photos of the product, without a studio, a crew or shipping the product.",
    vis: () => ads.slice(0, 3).map((a) => a.poster), visKind: "tall",
    faq: [
      ["What is CGI in marketing?", "CGI in marketing is the use of computer-generated imagery for product videos, social ads, launch films and product page visuals. Brands use it to show products in ways a camera can't, like floating, splashing or appearing on a real street, without booking a shoot."],
      ["What are examples of CGI marketing?", "Common examples are FOOH (fake out of home) ads where a product appears on a real building or billboard, skincare bottles splashing through water, food that explodes into flying layers, and tech products that assemble in mid-air. Every example in the CGI ads collection on this site has its own page."],
      ["What is photo-real CGI advertising?", "Photo-real CGI is computer-generated imagery made to look like it was filmed. Lighting, reflections and textures are matched to real life, so viewers see a premium product video and not an animation."],
      ["What does CGI stand for?", "CGI stands for computer-generated imagery: pictures and video created digitally instead of filmed with a camera."],
      ["Is a CGI ad the same as a 3D ad?", "Mostly. Most CGI ads are built from 3D scenes, but a CGI ad can also mix real footage with digital elements, like a real street with a giant product on a billboard."],
      ["What's an example of a CGI ad?", "A skincare serum floating through water while drops splash around it, a burger that explodes into flying layers, or a bottle reaching out of a street billboard (a FOOH ad). Examples are in the CGI ads collection on this site."],
      ["Do I need to send my product for a CGI ad?", "No. Clear photos of the product from several angles and a sharp photo of the label are usually enough."],
      ["Are CGI ads good for small businesses?", "Yes. They give a small brand a premium look without booking a studio, and new versions for new offers or seasons are quick to make."],
      ["Where do CGI ads work best?", "Short vertical video placements: Instagram Reels and Stories, TikTok, YouTube Shorts and Facebook. They also work as product page loops on Shopify and Amazon."]
    ],
    body: () => [
      sec("Examples", "CGI ads in action", `<div class="ads-grid three">${ads.slice(0, 6).map((w) => `<div class="ad-item">${card(w, "ad")}<p>${esc(w.text)}</p><a class="link-more" href="${w.page}">Watch and details ${arrow}</a></div>`).join("")}</div>`, `<a class="link-more" href="cgi-ads.html">All CGI ads ${arrow}</a>`),
      sec("How it's made", "From product photos to a finished ad", stepList([["Photos", "Clear photos of the product and label, plus the brand colours"], ["Build", "The product is rebuilt digitally and placed in a designed scene with lighting and motion"], ["Finish", "Editing, sound design, captions and every size needed for Reels, TikTok and ads"]])),
      sec("When to use one", "CGI ads are a good fit when", svcCards([
        ["You're launching", "A new product or shade needs a premium reveal"],
        ["You sell online", "Shopify, Amazon and DTC brands that live on Instagram and TikTok"],
        ["Shoots are hard", "Liquids, splashes and impossible camera moves cost a lot to film"],
        ["You test ads", "New hooks and backgrounds are quick to make for testing"],
        ["Seasons change", "Holiday and seasonal versions without a new shoot"],
        ["You want to stand out", "Most competitors still post the same flat product photos"]
      ])),
      sec("CGI or UGC?", "Not sure which one you need?", prose(`<p>CGI makes the product look premium and stops the scroll. UGC style ads build trust with a person talking about the product. Many brands use both: a CGI shot as the hook, UGC as the proof. Read the full comparison in <a href="cgi-vs-ugc-ads.html">CGI vs UGC ads</a>.</p>`)),
      sec("More", "Related", linkRows([["Compare", "CGI vs UGC ads: which should you use?", "cgi-vs-ugc-ads.html"], ["How-to", "How to make a product video without a photoshoot", "product-video-without-photoshoot.html"], ["Street ads", "FOOH ads (fake out of home)", "fooh-ads.html"]]))
    ]
  },

  /* ----- guide: CGI vs UGC ----- */
  cgiVsUgc: {
    file: "cgi-vs-ugc-ads.html", crumb: "CGI vs UGC Ads", parent: ["CGI Ads", "cgi-ads.html"], kicker: "Guide",
    title: "CGI vs UGC Ads: Which Should Your Brand Use? (With Examples)",
    desc: "CGI ads vs UGC ads compared: what each one is, cost of production, what each is best for, and how skincare, beauty, food and ecommerce brands combine them.",
    h1: `CGI vs UGC ads: <span class="hl">which one</span> should you use?`,
    lede: "Both work on Instagram and TikTok, but they do different jobs. Here's how to choose, with examples",
    service: "CGI ads and UGC style ads", serviceType: "Video ad production", audience: "Ecommerce, beauty, skincare, food and local businesses", og: "cgi-ads", cta: "Want help choosing the right ad?",
    answer: "CGI ads and UGC ads do different jobs. A CGI ad is created digitally and makes the product look premium, which is best for stopping the scroll, launches and products that are hard to film. A UGC ad is a phone-style video of a person talking about the product, which is best for building trust and showing the product in real life. Most brands get the best results using both: a CGI shot as the hook in the first second and UGC as the proof.",
    vis: () => [...ads.filter((a) => /ugc/i.test(a.tag)), ...ads.filter((a) => !/ugc/i.test(a.tag))].slice(0, 3).map((a) => a.poster), visKind: "tall",
    faq: [
      ["What is the difference between CGI and UGC ads?", "CGI ads are created digitally and focus on the product looking premium. UGC ads look like a real person filmed on a phone and focus on trust and recommendation."],
      ["Which converts better, CGI or UGC?", "It depends on the product and the audience, which is why brands test both. CGI usually wins attention in the first second; UGC usually wins trust. Using a CGI hook followed by UGC style proof combines both."],
      ["Which is better for skincare brands?", "Skincare often uses CGI for texture, drops and ingredient stories, and UGC for routines, reviews and before and after style stories. Both are common."],
      ["Which is better for restaurants?", "CGI food shots grab attention in ads; UGC style videos of people enjoying the food show the real experience. Restaurants often post both."],
      ["Can one ad use both?", "Yes. A popular structure is a 1 to 2 second CGI product hook, then a presenter explaining why they love it, then a clear call to action."]
    ],
    body: () => [
      sec("Side by side", "CGI vs UGC at a glance", svcCards([
        ["CGI: looks", "Premium, polished, impossible shots like splashes and floating products"],
        ["UGC: looks", "Natural, phone-filmed, a person talking straight to camera"],
        ["CGI: best for", "Stopping the scroll, launches, products that are hard to film"],
        ["UGC: best for", "Trust, reviews, showing the product in real life"],
        ["CGI: made from", "Photos of the product. No shoot, no shipping"],
        ["UGC: made from", "A presenter and the product, or your own creator footage edited into ads"]
      ])),
      sec("CGI examples", "CGI ads", `<div class="ads-grid three">${ads.filter((a) => !/ugc/i.test(a.tag)).slice(0, 3).map((w) => `<div class="ad-item">${card(w, "ad")}<p>${esc(w.text)}</p></div>`).join("")}</div>`),
      sec("UGC examples", "UGC style ads", `<div class="ads-grid three">${ads.filter((a) => /ugc/i.test(a.tag)).slice(0, 3).map((w) => `<div class="ad-item">${card(w, "ad")}<p>${esc(w.text)}</p></div>`).join("")}</div>`),
      sec("How to choose", "A simple rule", prose(`<p>If people <strong>don't know your product yet</strong>, lead with CGI to win attention. If people <strong>know it but don't trust it yet</strong>, lead with UGC to build trust. If you can run more than one ad, run both and let the results decide.</p>`)),
      sec("More", "Related", linkRows([["Guide", "What is a CGI ad?", "what-is-a-cgi-ad.html"], ["UGC", "UGC style video ads", "ugc-ads.html"], ["Beauty", "CGI skincare and beauty ads", "cgi-ads-skincare.html"]]))
    ]
  },

  /* ----- guide: med spa reel ideas ----- */
  medspaIdeas: {
    file: "med-spa-instagram-reel-ideas.html", crumb: "Med Spa Reel Ideas", parent: ["CGI Ads", "cgi-ads.html"], kicker: "Guide",
    title: "20 Med Spa Instagram Reel & Ad Ideas That Book Appointments",
    desc: "20 Instagram Reel and ad ideas for med spas: Botox, filler, facials, laser and seasonal promos, plus tips to keep ads within Meta's health and beauty ad rules.",
    h1: `20 med spa <span class="hl">reel ideas</span> that book appointments`,
    lede: "Ready-to-use Instagram Reel and ad ideas for Botox, fillers, facials, laser and seasonal promos",
    service: "Video ads and reels for med spas", serviceType: "Social media content creation", audience: "Med spas and aesthetic clinics in the United States", og: "cgi-ads", cta: "Want these reels made for your med spa?",
    answer: "The best Instagram Reels for med spas show one treatment and one benefit in under 20 seconds, start with a hook in the first second and end with a clear way to book. Strong ideas include treatment explainers, myth-busting, day-in-the-clinic videos, seasonal promos, client questions answered on camera and before and after style stories that don't rely on patient photos. Ads should avoid shaming language and unrealistic promises to stay within Meta's health and beauty ad policies.",
    vis: () => [...ads.filter((a) => /med spa/i.test(a.tag)), ...ads].slice(0, 3).map((a) => a.poster), visKind: "tall",
    faq: [
      ["How often should a med spa post Reels?", "Three to five Reels a week is a strong rhythm for most med spas. Consistency matters more than volume."],
      ["What makes a med spa Reel go viral?", "A strong hook in the first second, one simple idea, captions for sound-off viewing, and a format people want to share, like myth-busting or a surprising before and after style reveal."],
      ["Can med spas run before and after ads on Instagram?", "Meta restricts some before and after imagery and any ad that implies negative self-image, so many med spas use before and after style stories without patient photos, like the pumpkin ad made for Sukoon Spa. Always check Meta's current policy before running an ad."],
      ["Do I need to film in my clinic?", "No. CGI and UGC style reels can be made from your treatment list, logo, offer and a few photos of your space."]
    ],
    body: () => [
      sec("Ideas 1 to 10", "Treatment reels", svcCards([
        ["1. 15 second Botox explainer", "What it does, how long it takes, how long it lasts"],
        ["2. Myth vs fact", "\"Botox freezes your face\": myth-busting in three quick cuts"],
        ["3. Lip filler options", "Subtle vs fuller, shown with CGI or illustrations"],
        ["4. HydraFacial steps", "Each step in one second, with captions"],
        ["5. Laser hair removal timeline", "Sessions and results week by week"],
        ["6. Microneedling explained", "Macro skin textures and a calm voiceover"],
        ["7. What to expect at your first visit", "A walk-through from the front desk"],
        ["8. Aftercare in 10 seconds", "Do's and don'ts as on-screen text"],
        ["9. Price-of-coffee comparison", "Membership value framed simply"],
        ["10. Client question of the week", "One real question answered on camera"]
      ])),
      sec("Ideas 11 to 20", "Seasonal and trust reels", svcCards([
        ["11. Halloween pumpkin before and after", "See the Sukoon Spa example"],
        ["12. Holiday glow package", "Gift cards and party-ready facials"],
        ["13. New Year skin reset", "A January promo with a clear offer"],
        ["14. Valentine's lip special", "Short, playful, one offer"],
        ["15. Wedding season countdown", "Treatment plan 3 months before the big day"],
        ["16. Summer body prep", "Laser and body treatments before beach season"],
        ["17. Meet the injector", "Credentials and experience build trust"],
        ["18. Day in the clinic", "Behind the scenes, clean and calm"],
        ["19. UGC style review", "A talking-to-camera story about the experience"],
        ["20. CGI product hero", "Your skincare line in a premium CGI scene"]
      ])),
      sec("Rules", "Keep your ads approved", prose(`<ul class="ticks"><li>No shaming or negative self-image language ("Hate your wrinkles?")</li><li>No promises of exact results</li><li>Be careful with before and after imagery; use before and after style stories instead of patient photos when in doubt</li><li>Prices and claims approved by the clinic</li></ul><p>Meta's policies change, so check the current health and appearance rules before launching paid ads.</p>`)),
      sec("Examples", "Med spa ads", `<div class="ads-grid three">${ads.filter((a) => /med spa/i.test(a.tag)).slice(0, 3).map((w) => `<div class="ad-item">${card(w, "ad")}<p>${esc(w.text)}</p><a class="link-more" href="${w.page}">Watch and details ${arrow}</a></div>`).join("")}</div>`, `<a class="link-more" href="cgi-ads-med-spa.html">Video ads for med spas ${arrow}</a>`)
    ]
  },

  /* ----- guide: product video without a photoshoot ----- */
  noShoot: {
    file: "product-video-without-photoshoot.html", crumb: "Product Video Without a Shoot", parent: ["CGI Ads", "cgi-ads.html"], kicker: "Guide",
    title: "How to Make a Product Video Without a Photoshoot (CGI & UGC)",
    desc: "How small brands get scroll-stopping product videos without a studio, a crew or shipping products: CGI product ads, UGC style videos and smart editing.",
    h1: `Product videos <span class="hl">without a photoshoot</span>`,
    lede: "How small brands get premium product videos for Instagram, TikTok and Amazon without a studio, a crew or shipping a single product",
    service: "Product video production without a shoot", serviceType: "CGI product ad production", audience: "Ecommerce, Shopify and Amazon brands", og: "cgi-ads", cta: "Want a product video without a shoot?",
    answer: "You can make a product video without a photoshoot by using CGI: the product is rebuilt digitally from clear photos and placed in designed scenes with lighting, motion, water, splashes or real-looking locations. UGC style videos and smart editing of existing clips are two more no-shoot options. All three give you ready-to-post videos for Instagram Reels, TikTok, YouTube Shorts, Shopify and Amazon without booking a studio or shipping the product.",
    vis: () => ads.slice(3, 6).map((a) => a.poster), visKind: "tall",
    faq: [
      ["What photos do I need?", "The front, back and sides of the product on a plain background, a sharp photo of the label, and the brand colours. Phone photos in good light are often enough."],
      ["Will the product look real?", "Yes. The digital product is matched to your photos, so the shape, label and colours look like what customers receive."],
      ["Can I use the video on Amazon and Shopify?", "Yes. Product page loops and square versions can be delivered along with vertical Reels and TikToks."],
      ["How do we work together?", "Over WhatsApp or email: you send photos and the idea, you review drafts, and you get the final files. No calls needed."]
    ],
    body: () => [
      sec("Three ways", "No-shoot product video options", svcCards([
        ["1. CGI product ads", "The product rebuilt digitally in premium scenes: splashes, drops, floating, FOOH billboards"],
        ["2. UGC style videos", "Phone-style presenter videos that review or show the product"],
        ["3. Smart editing", "Your existing photos and clips turned into Reels with motion, captions and sound"]
      ])),
      sec("Step by step", "How a no-shoot video is made", stepList([["Send photos", "Product photos, label, brand colours and the idea"], ["Review drafts", "First versions with a round of changes"], ["Post", "Final files for Reels, TikTok, Shorts, Shopify and Amazon"]])),
      sec("Examples", "Made without a shoot", `<div class="ads-grid three">${ads.slice(0, 6).map((w) => `<div class="ad-item">${card(w, "ad")}<p>${esc(w.text)}</p><a class="link-more" href="${w.page}">Watch and details ${arrow}</a></div>`).join("")}</div>`),
      sec("More", "Related", linkRows([["Guide", "What is a CGI ad?", "what-is-a-cgi-ad.html"], ["Compare", "CGI vs UGC ads", "cgi-vs-ugc-ads.html"], ["Beauty", "CGI skincare and beauty ads", "cgi-ads-skincare.html"]]))
    ]
  }
});
