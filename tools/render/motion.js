/* Motion explainers rendered to MP4 (clinic agent, Shorts agent) plus the share image.
   Each scene is a pure function of time on a 1280x720 board. Palette follows the site accent (blue). */
(function () {
  "use strict";
  var C = { ink: "#040507", ink2: "#0e1118", ink3: "#151925", fog: "#eef1f7", mute: "#97a0b3", line: "rgba(160,180,220,0.12)", line2: "rgba(160,180,220,0.24)", acc: "#1f6fff", acc2: "#7cc4ff", ok: "#7cc4ff", bad: "#ff6b6b", warn: "#ffb347" };
  var F = { display: '"Instrument Sans", sans-serif', body: '"Instrument Sans", sans-serif', mono: '"JetBrains Mono", monospace' };
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function out(x) { return 1 - Math.pow(1 - x, 3); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function txt(g, s, x, y, font, color, align, alpha) { g.save(); g.globalAlpha *= alpha == null ? 1 : alpha; g.font = font; g.fillStyle = color; g.textAlign = align || "left"; g.fillText(s, x, y); g.restore(); }
  function glow(g, x, y, r, color, a) { var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, color); gr.addColorStop(1, "rgba(0,0,0,0)"); g.save(); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
  function check(g, x, y, s, color, k) {
    g.save(); g.strokeStyle = color; g.lineWidth = 3; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath();
    var p1 = [x - s * 0.5, y], p2 = [x - s * 0.12, y + s * 0.38], p3 = [x + s * 0.55, y - s * 0.42], k1 = clamp(k * 2, 0, 1), k2 = clamp(k * 2 - 1, 0, 1);
    g.moveTo(p1[0], p1[1]); g.lineTo(lerp(p1[0], p2[0], k1), lerp(p1[1], p2[1], k1)); if (k2 > 0) g.lineTo(lerp(p2[0], p3[0], k2), lerp(p2[1], p3[1], k2));
    g.stroke(); g.restore();
  }
  function card(g, x, y, w, h, o) { o = o || {}; g.save(); rr(g, x, y, w, h, o.r || 18); g.fillStyle = o.fill || C.ink2; g.fill(); g.lineWidth = 1.5; g.strokeStyle = o.stroke || C.line2; g.stroke(); g.restore(); }
  function backdrop(g, W, H) {
    g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
    glow(g, 1040, 110, 560, "rgba(31,111,255,0.22)", 1); glow(g, 140, 660, 460, "rgba(124,196,255,0.08)", 1);
    g.save(); g.fillStyle = "rgba(160,180,220,0.07)";
    for (var x = 40; x < W; x += 40) for (var y = 40; y < H; y += 40) g.fillRect(x, y, 1.5, 1.5);
    g.restore();
  }
  function frame(g, W, H, t, label, dur) {
    txt(g, label, 48, 54, "500 14px " + F.mono, C.acc2);
    txt(g, "SYED MATEEN", 48, H - 34, "500 13px " + F.mono, C.mute);
    txt(g, "Illustration of the workflow logic", W - 48, H - 34, "400 13px " + F.mono, C.mute, "right");
    g.save(); g.fillStyle = C.line; g.fillRect(48, H - 64, W - 96, 2); var gr = g.createLinearGradient(48, 0, W - 48, 0); gr.addColorStop(0, C.acc); gr.addColorStop(1, C.acc2); g.fillStyle = gr; g.fillRect(48, H - 64, (W - 96) * clamp(t / dur, 0, 1), 2); g.restore();
  }
  function fadeEnds(g, W, H, t, dur) { var a = Math.max(1 - seg(t, 0, 0.5), seg(t, dur - 0.6, dur)); if (a > 0) { g.save(); g.globalAlpha = a; g.fillStyle = C.ink; g.fillRect(0, 0, W, H); g.restore(); } }
  function chain(g, labels, active, y, W) {
    var n = labels.length, x0 = 160, x1 = W - 160, st = (x1 - x0) / (n - 1);
    g.save(); g.strokeStyle = C.line2; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    g.strokeStyle = C.acc; g.shadowColor = C.acc; g.shadowBlur = 12; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + st * clamp(active, 0, n - 1), y); g.stroke(); g.restore();
    for (var i = 0; i < n; i++) {
      var x = x0 + st * i, on = active >= i - 0.02, cur = Math.abs(active - i) < 0.5;
      if (cur) glow(g, x, y, 38, "rgba(31,111,255,0.7)", 1);
      g.save(); g.beginPath(); g.arc(x, y, cur ? 9 : 7, 0, 6.283); g.fillStyle = on ? C.acc : C.ink3; g.fill(); g.lineWidth = 2; g.strokeStyle = on ? C.acc2 : C.line2; g.stroke(); g.restore();
      txt(g, labels[i], x, y + 30, "500 13px " + F.mono, on ? C.fog : C.mute, "center");
    }
  }

  /* ============ Clinic voice booking agent (14 s) ============ */
  function clinic(g, t, W, H) {
    var DUR = 14; backdrop(g, W, H); frame(g, W, H, t, "CLINIC VOICE BOOKING AGENT  ·  N8N + ELEVENLABS", DUR);
    var act = t < 1.4 ? 0 : t < 3.2 ? lerp(0, 1, ease(seg(t, 1.4, 3.2))) : t < 6 ? lerp(1, 2, ease(seg(t, 3.2, 3.8))) : t < 9 ? lerp(2, 3, ease(seg(t, 6, 6.6))) : t < 10.6 ? lerp(3, 4, ease(seg(t, 9, 9.6))) : lerp(4, 5, ease(seg(t, 10.6, 11.2)));
    chain(g, ["Call", "Voice agent", "Checks", "Find slot", "Lock slot", "Booked"], act, 600, W);
    var ti = 1 - seg(t, 1.1, 1.6);
    if (ti > 0) { txt(g, "A patient calls to book.", W / 2, 290, "600 54px " + F.display, C.fog, "center", ti); txt(g, "Here is everything the agent checks before it says yes.", W / 2, 345, "400 22px " + F.body, C.mute, "center", ti); }
    var a1 = seg(t, 1.4, 1.9) * (1 - seg(t, 5.6, 6.1));
    if (a1 > 0) {
      g.save(); g.globalAlpha = a1; var px = 190, py = 300;
      for (var r = 0; r < 3; r++) { var u = (t * 0.9 + r / 3) % 1; g.beginPath(); g.arc(px, py, 40 + u * 70, 0, 6.283); g.strokeStyle = "rgba(124,196,255," + 0.5 * (1 - u) + ")"; g.lineWidth = 2; g.stroke(); }
      g.beginPath(); g.arc(px, py, 40, 0, 6.283); g.fillStyle = C.acc; g.fill();
      g.save(); g.translate(px, py); g.rotate(-0.6); rr(g, -10, -22, 20, 44, 9); g.fillStyle = "#fff"; g.fill(); g.restore();
      txt(g, "Incoming call", px, py + 76, "500 14px " + F.mono, C.mute, "center");
      var b = out(seg(t, 1.8, 2.4)); card(g, 300, 210 + (1 - b) * 20, 470, 84);
      txt(g, "Patient", 324, 240 + (1 - b) * 20, "500 13px " + F.mono, C.acc2);
      var said = "Hi, can I book Thursday at 3 PM?"; txt(g, said.slice(0, Math.floor(said.length * seg(t, 2, 3))), 324, 274 + (1 - b) * 20, "500 22px " + F.body, C.fog);
      var b2 = out(seg(t, 3, 3.5));
      if (b2 > 0) {
        card(g, 330, 316 + (1 - b2) * 20, 476, 120, { fill: "#0b1630", stroke: "rgba(31,111,255,0.7)" });
        txt(g, "Voice agent  ·  ElevenLabs", 354, 346 + (1 - b2) * 20, "500 13px " + F.mono, C.acc2);
        var said2 = "Sure. Can I get your name and phone number?"; txt(g, said2.slice(0, Math.floor(said2.length * seg(t, 3.3, 4.4))), 354, 380 + (1 - b2) * 20, "500 20px " + F.body, C.fog);
        for (var w = 0; w < 34; w++) { var hh = 4 + Math.abs(Math.sin(t * 9 + w * 0.7) * Math.sin(w * 0.35 + t * 2)) * 22 * (t < 4.6 ? 1 : 0.2); g.fillStyle = C.acc2; g.fillRect(354 + w * 12, 414 + (1 - b2) * 20 - hh / 2, 6, hh); }
      }
      g.restore();
    }
    var a2 = seg(t, 3.6, 4.1) * (1 - seg(t, 5.9, 6.3));
    if (a2 > 0) {
      g.save(); g.globalAlpha = a2; var cx = 990, cy = 150; card(g, cx - 150, cy, 300, 300);
      txt(g, "n8n checks", cx - 128, cy + 34, "500 13px " + F.mono, C.acc2);
      ["Patient details", "Requested date & time", "Within clinic hours", "Not a weekend or past date", "Nothing missing"].forEach(function (s, i) {
        var k = seg(t, 4 + i * 0.32, 4.3 + i * 0.32), y = cy + 78 + i * 46;
        g.save(); g.beginPath(); g.arc(cx - 118, y - 6, 12, 0, 6.283); g.fillStyle = k > 0 ? "rgba(31,111,255,0.25)" : C.ink3; g.fill(); g.restore();
        if (k > 0) check(g, cx - 118, y - 6, 12, C.acc2, k);
        txt(g, s, cx - 96, y, "500 16px " + F.body, k > 0 ? C.fog : C.mute);
      });
      g.restore();
    }
    var a3 = seg(t, 6, 6.5) * (1 - seg(t, 10.4, 10.8));
    if (a3 > 0) {
      g.save(); g.globalAlpha = a3;
      var gx = 110, gy = 140, colW = 140, rowH = 50, days = ["Tue", "Wed", "Thu", "Fri"], times = ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"];
      txt(g, "Google Calendar  ·  Thursday", gx, gy - 14, "500 13px " + F.mono, C.acc2);
      var taken = { "1-2": 1, "2-2": 1, "2-0": 1, "2-5": 1, "0-3": 1, "3-1": 1, "1-4": 1 };
      days.forEach(function (dd, di) { txt(g, dd, gx + 90 + di * colW + colW / 2, gy + 20, "500 14px " + F.mono, di === 2 ? C.fog : C.mute, "center"); });
      times.forEach(function (tt, ti2) {
        var y = gy + 36 + ti2 * rowH; txt(g, tt, gx + 76, y + 31, "400 13px " + F.mono, C.mute, "right");
        days.forEach(function (dd, di) {
          var x = gx + 90 + di * colW, isT = !!taken[di + "-" + ti2], fill = isT ? "rgba(255,107,107,0.1)" : "rgba(160,180,220,0.04)", stroke = isT ? "rgba(255,107,107,0.35)" : C.line;
          if (di === 2 && ti2 === 3) { if (t > 7.9) { fill = "rgba(31,111,255,0.25)"; stroke = C.acc; } if (t > 9) { fill = "rgba(255,179,71,0.2)"; stroke = C.warn; } }
          if (di === 2 && ti2 === 4 && t > 9.6) { fill = "rgba(124,196,255,0.2)"; stroke = C.acc2; }
          rr(g, x + 6, y + 6, colW - 12, rowH - 10, 8); g.fillStyle = fill; g.fill(); g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke();
          if (isT) txt(g, "Taken", x + colW / 2, y + 31, "500 12px " + F.mono, C.bad, "center", 0.85);
        });
      });
      var sk = ease(seg(t, 6.8, 7.9)), sy = gy + 36 + lerp(2, 3, sk) * rowH, sx = gx + 90 + 2 * colW;
      g.save(); g.strokeStyle = C.acc2; g.lineWidth = 2.5; g.shadowColor = C.acc; g.shadowBlur = 16; rr(g, sx + 3, sy + 3, colW - 6, rowH - 4, 10); g.stroke(); g.restore();
      if (t > 7.9) txt(g, t > 9 ? "Held" : "Free", sx + colW / 2, gy + 36 + 3 * rowH + 31, "600 13px " + F.mono, t > 9 ? C.warn : C.acc2, "center");
      if (t > 9.6) txt(g, "Free", sx + colW / 2, gy + 36 + 4 * rowH + 31, "600 13px " + F.mono, C.acc2, "center");
      var m1 = out(seg(t, 6.6, 7.1)); card(g, 780, 160 + (1 - m1) * 16, 400, 112);
      txt(g, "Requested  ·  Thu 3:00 PM", 804, 192 + (1 - m1) * 16, "500 13px " + F.mono, C.bad);
      txt(g, "Taken. Searching for the", 804, 226 + (1 - m1) * 16, "500 19px " + F.body, C.fog); txt(g, "nearest free slot…", 804, 252 + (1 - m1) * 16, "500 19px " + F.body, C.fog);
      var m2 = out(seg(t, 8, 8.5));
      if (m2 > 0) { card(g, 780, 292 + (1 - m2) * 16, 400, 112, { fill: "#0b1630", stroke: "rgba(31,111,255,0.7)" }); txt(g, "Voice agent", 804, 324 + (1 - m2) * 16, "500 13px " + F.mono, C.acc2); txt(g, "3:00 is taken, but 3:30 is free.", 804, 358 + (1 - m2) * 16, "500 19px " + F.body, C.fog); txt(g, "Shall I book it?", 804, 384 + (1 - m2) * 16, "500 19px " + F.body, C.fog); }
      var m3 = out(seg(t, 9, 9.5));
      if (m3 > 0) { card(g, 780, 424 + (1 - m3) * 16, 400, 96, { fill: "#1d1508", stroke: "rgba(255,179,71,0.55)" }); txt(g, "Second caller wants 3:30 too", 804, 456 + (1 - m3) * 16, "500 13px " + F.mono, C.warn); txt(g, "Slot locked. Offered 4:00 instead.", 804, 490 + (1 - m3) * 16, "500 19px " + F.body, C.fog); }
      g.restore();
    }
    var a4 = seg(t, 10.7, 11.1);
    if (a4 > 0) {
      g.save(); g.globalAlpha = a4 * (1 - seg(t, 12.7, 13.05));
      txt(g, "Booked: Thursday 3:30 PM", W / 2, 200, "600 44px " + F.display, C.fog, "center");
      [["Google Calendar", "Event created"], ["Google Sheets", "Patient logged"], ["Gmail", "Confirmation sent"], ["Voice agent", "Status returned"]].forEach(function (o, i) {
        var k = out(seg(t, 11 + i * 0.25, 11.4 + i * 0.25)), x = 136 + i * 262, y = 260 + (1 - k) * 24;
        g.save(); g.globalAlpha *= k; card(g, x, y, 240, 150, { stroke: k > 0.9 ? "rgba(31,111,255,0.7)" : C.line2 });
        g.beginPath(); g.arc(x + 40, y + 46, 18, 0, 6.283); g.fillStyle = "rgba(31,111,255,0.25)"; g.fill();
        check(g, x + 40, y + 46, 16, C.acc2, seg(t, 11.2 + i * 0.25, 11.6 + i * 0.25));
        txt(g, o[0], x + 24, y + 104, "600 19px " + F.body, C.fog); txt(g, o[1], x + 24, y + 130, "400 14px " + F.mono, C.mute); g.restore();
      });
      g.restore();
    }
    var a5 = seg(t, 13.05, 13.4);
    if (a5 > 0) { txt(g, "Guardrails make it a business system,", W / 2, 300, "600 36px " + F.display, C.fog, "center", a5); txt(g, "not a demo.", W / 2, 352, "600 36px " + F.display, C.acc2, "center", a5); }
    fadeEnds(g, W, H, t, DUR);
  }

  /* ============ YouTube to Shorts agent (12 s) ============ */
  function shorts(g, t, W, H) {
    var DUR = 12; backdrop(g, W, H); frame(g, W, H, t, "YOUTUBE TO SHORTS AGENT  ·  KLAP + TELEGRAM", DUR);
    var act = t < 3.2 ? 0 : t < 5.6 ? lerp(0, 1, ease(seg(t, 3.2, 3.8))) : t < 7.5 ? lerp(1, 2, ease(seg(t, 5.6, 6.2))) : t < 9.4 ? lerp(2, 4, ease(seg(t, 7.5, 9))) : lerp(4, 5, ease(seg(t, 9.6, 10.1)));
    chain(g, ["Input", "Find clips", "Captions", "Schedule", "Publish", "Summary"], act, 600, W);
    var ti = 1 - seg(t, 1, 1.4);
    if (ti > 0) { txt(g, "One long video in.", W / 2, 290, "600 54px " + F.display, C.fog, "center", ti); txt(g, "Captioned, scheduled Shorts out.", W / 2, 345, "400 22px " + F.body, C.mute, "center", ti); }
    var a1 = seg(t, 1.3, 1.7) * (1 - seg(t, 3.2, 3.6));
    if (a1 > 0) {
      g.save(); g.globalAlpha = a1; card(g, 300, 190, 680, 210);
      txt(g, "Input", 330, 228, "500 13px " + F.mono, C.acc2); txt(g, "YouTube URL", 330, 272, "500 14px " + F.mono, C.mute);
      rr(g, 330, 284, 620, 46, 10); g.fillStyle = C.ink3; g.fill();
      var url = "youtube.com/watch?v=long-form-episode"; txt(g, url.slice(0, Math.floor(url.length * seg(t, 1.6, 2.5))) + (Math.floor(t * 3) % 2 && t < 2.6 ? "|" : ""), 348, 314, "500 18px " + F.mono, C.fog);
      txt(g, "Shorts required", 330, 370, "500 14px " + F.mono, C.mute); rr(g, 480, 348, 70, 34, 8); g.fillStyle = C.ink3; g.fill(); txt(g, t > 2.7 ? "4" : "", 515, 372, "600 18px " + F.mono, C.acc2, "center");
      g.restore();
    }
    var clips = [[0.08, 0.17], [0.31, 0.39], [0.55, 0.64], [0.78, 0.86]], tx = 140, tw = 1000, ty = 250, th = 90;
    var a2 = seg(t, 3.2, 3.6) * (1 - seg(t, 5.6, 6));
    if (a2 > 0) {
      g.save(); g.globalAlpha = a2; txt(g, "Long-form video  ·  42:18", tx, ty - 20, "500 13px " + F.mono, C.acc2);
      rr(g, tx, ty, tw, th, 12); g.fillStyle = C.ink2; g.fill(); g.strokeStyle = C.line2; g.lineWidth = 1.5; g.stroke();
      for (var i = 0; i < 125; i++) { var h2 = 10 + Math.abs(Math.sin(i * 0.53) * Math.cos(i * 0.21)) * 58; g.fillStyle = "rgba(160,180,220,0.28)"; g.fillRect(tx + 10 + i * 7.9, ty + th / 2 - h2 / 2, 4, h2); }
      var ph = seg(t, 3.5, 5.3);
      clips.forEach(function (c, ci) { var k = clamp((ph - c[1]) * 6, 0, 1); if (k > 0) { g.save(); g.globalAlpha *= k; rr(g, tx + c[0] * tw, ty - 6, (c[1] - c[0]) * tw, th + 12, 10); g.fillStyle = "rgba(31,111,255,0.22)"; g.fill(); g.strokeStyle = C.acc2; g.lineWidth = 2; g.stroke(); txt(g, "Clip " + (ci + 1), tx + c[0] * tw + 8, ty + th + 30, "500 13px " + F.mono, C.acc2); g.restore(); } });
      var px = tx + ph * tw; g.fillStyle = "#fff"; g.fillRect(px - 1, ty - 14, 2, th + 28); glow(g, px, ty + th / 2, 60, "rgba(124,196,255,0.4)", 1);
      txt(g, "Finding the strongest moments", tx, ty + th + 80, "500 20px " + F.body, C.fog, "left", seg(t, 3.6, 4));
      g.restore();
    }
    var a3 = seg(t, 5.6, 6.1);
    if (a3 > 0) {
      g.save(); g.globalAlpha = a3 * (1 - seg(t, 9.5, 9.9));
      var slots = ["Mon 6:00 PM", "Tue 12:00 PM", "Wed 6:00 PM", "Thu 12:00 PM"], mk = ease(seg(t, 7.5, 8.6));
      for (var c2 = 0; c2 < 4; c2++) {
        var c = clips[c2], k3 = out(seg(t, 5.6 + c2 * 0.12, 6.3 + c2 * 0.12));
        var cw = lerp((c[1] - c[0]) * tw, 150, k3), ch = lerp(th, 266, k3), cx0 = lerp(tx + c[0] * tw, 180 + c2 * 240, k3), cy0 = lerp(ty, 150, k3);
        var cx1 = 420 + c2 * 200, cy1 = 210, cwf = lerp(cw, 112, mk), chf = lerp(ch, 199, mk), X = lerp(cx0, cx1, mk), Y = lerp(cy0, cy1, mk);
        rr(g, X, Y, cwf, chf, 14); var gr = g.createLinearGradient(X, Y, X, Y + chf); gr.addColorStop(0, "#123a8a"); gr.addColorStop(1, "#070b16"); g.fillStyle = gr; g.fill(); g.strokeStyle = C.acc2; g.lineWidth = 2; g.stroke();
        g.save(); g.fillStyle = "#fff"; g.globalAlpha *= 0.85; g.beginPath(); var gx2 = X + cwf / 2, gy2 = Y + chf * 0.4; g.moveTo(gx2 - 9, gy2 - 12); g.lineTo(gx2 + 13, gy2); g.lineTo(gx2 - 9, gy2 + 12); g.closePath(); g.fill(); g.restore();
        var capK = seg(t, 6.3 + c2 * 0.15, 6.9 + c2 * 0.15);
        if (capK > 0) { var bw = cwf * 0.72; rr(g, X + (cwf - bw) / 2, Y + chf * 0.72, bw * capK, 10, 4); g.fillStyle = C.acc2; g.fill(); rr(g, X + (cwf - bw * 0.7) / 2, Y + chf * 0.72 + 16, bw * 0.7 * capK, 10, 4); g.fillStyle = "rgba(238,241,247,0.85)"; g.fill(); }
        txt(g, "Short " + (c2 + 1), X + cwf / 2, Y - 12, "500 13px " + F.mono, C.mute, "center", 1 - mk);
        if (mk > 0) { g.save(); g.globalAlpha *= mk; rr(g, cx1 - 30, cy1 + 214, 172, 40, 10); g.fillStyle = C.ink2; g.fill(); g.strokeStyle = "rgba(31,111,255,0.7)"; g.lineWidth = 1.5; g.stroke(); txt(g, slots[c2], cx1 + 56, cy1 + 240, "500 14px " + F.mono, C.acc2, "center"); g.restore(); }
      }
      txt(g, "Captions added", 180, 470, "500 20px " + F.body, C.fog, "left", seg(t, 6.5, 6.9) * (1 - mk));
      if (mk > 0) { txt(g, "Publishing times calculated", 420, 160, "500 13px " + F.mono, C.acc2, "left", mk); var pub = seg(t, 8.7, 9.3); txt(g, "Uploading to connected platforms", 420, 516, "500 20px " + F.body, C.fog, "left", pub); rr(g, 420, 532, 760 * pub, 4, 2); g.fillStyle = C.acc; g.fill(); }
      g.restore();
    }
    var a4 = seg(t, 9.6, 10);
    if (a4 > 0) {
      g.save(); g.globalAlpha = a4; var y0 = 170 + (1 - out(a4)) * 20;
      txt(g, "Telegram summary", 400, y0 - 18, "500 13px " + F.mono, C.acc2);
      card(g, 400, y0, 480, 236, { fill: "#0b1630", stroke: "rgba(31,111,255,0.7)", r: 22 });
      [["Video processed", C.fog], ["4 Shorts created with captions", C.fog], ["Scheduled: Mon to Thu", C.fog], ["Next post: Mon 6:00 PM", C.acc2]].forEach(function (l, i) { var k = seg(t, 9.9 + i * 0.22, 10.2 + i * 0.22); check(g, 440, y0 + 50 + i * 46, 12, C.acc2, k); txt(g, l[0], 466, y0 + 56 + i * 46, "500 19px " + F.body, l[1], "left", k); });
      g.restore();
    }
    fadeEnds(g, W, H, t, DUR);
  }

  /* ============ share image ============ */
  function og(g, t, W, H, img) {
    g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
    if (img) { var s = H / img.height, iw = img.width * s; g.drawImage(img, W - iw + 250, 0, iw, H); var gr = g.createLinearGradient(330, 0, 760, 0); gr.addColorStop(0, C.ink); gr.addColorStop(1, "rgba(4,5,7,0)"); g.fillStyle = gr; g.fillRect(0, 0, 760, H); g.fillStyle = C.ink; g.fillRect(0, 0, 330, H); }
    glow(g, 160, 80, 460, "rgba(31,111,255,0.35)", 1); glow(g, 1100, 560, 360, "rgba(31,111,255,0.25)", 1);
    txt(g, "SYED MATEEN", 64, 110, "500 20px " + F.mono, C.acc2);
    [["AI agents,", C.fog], ["ads &", C.fog], ["automation.", C.acc]].forEach(function (l, i) { txt(g, l[0], 60, 226 + i * 88, "600 84px " + F.display, l[1]); });
    txt(g, "AI that saves time. Ads that bring customers.", 64, 560, "500 24px " + F.body, C.mute);
  }

  window.MOTION = { clinic: { draw: clinic, dur: 14 }, shorts: { draw: shorts, dur: 12 }, og: { draw: og, dur: 0 } };
})();
