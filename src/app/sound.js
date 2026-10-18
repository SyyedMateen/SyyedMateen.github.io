/* Sound for the site, synthesised live with the Web Audio API (no audio files, no licences).
   Music: a slow cinematic pad (Am9 · Fmaj9 · Cmaj7 · G6) with a sub, airy noise and a sparse plucked arpeggio.
   SFX: whoosh when particles re-form, hover ticks, clicks, an intro hit, a short glitch.
   Off until the visitor opts in (browsers block audio before a click anyway). */
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
const CHORDS = [
  [45, 57, 60, 64, 67, 71],   // A minor 9
  [41, 53, 57, 60, 64, 67],   // F major 9
  [48, 55, 59, 62, 64, 67],   // C major 7 (add 9)
  [43, 55, 59, 62, 64, 69]    // G 6/9
];
const SCALE = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79];

export class Sound {
  constructor() { this.ctx = null; this.on = false; this.started = false; this.chordIx = 0; this.nextChord = 0; this.nextArp = 0; this.timer = null; }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain(); this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    this.master.connect(comp); comp.connect(ctx.destination);
    this.music = ctx.createGain(); this.music.gain.value = 0.55; this.music.connect(this.master);
    this.sfx = ctx.createGain(); this.sfx.gain.value = 0.7; this.sfx.connect(this.master);
    this.reverb = ctx.createConvolver(); this.reverb.buffer = this.impulse(4.2, 2.6);
    this.revGain = ctx.createGain(); this.revGain.gain.value = 0.9; this.reverb.connect(this.revGain); this.revGain.connect(this.master);
    // pad filter breathes slowly
    this.padF = ctx.createBiquadFilter(); this.padF.type = "lowpass"; this.padF.frequency.value = 900; this.padF.Q.value = 0.6;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.05; lfoG.gain.value = 500; lfo.connect(lfoG); lfoG.connect(this.padF.frequency); lfo.start();
    this.padF.connect(this.music); this.padF.connect(this.reverb);
    // echo for the arpeggio
    this.delay = ctx.createDelay(1.5); this.delay.delayTime.value = 0.56; const fb = ctx.createGain(); fb.gain.value = 0.38;
    const dF = ctx.createBiquadFilter(); dF.type = "lowpass"; dF.frequency.value = 2600;
    this.delay.connect(dF); dF.connect(fb); fb.connect(this.delay); dF.connect(this.music); dF.connect(this.reverb);
    this.noiseBuf = this.noise(2);
    // air: very quiet filtered noise
    const air = ctx.createBufferSource(); air.buffer = this.noiseBuf; air.loop = true;
    const airF = ctx.createBiquadFilter(); airF.type = "bandpass"; airF.frequency.value = 5200; airF.Q.value = 0.4;
    const airG = ctx.createGain(); airG.gain.value = 0.012; air.connect(airF); airF.connect(airG); airG.connect(this.music); air.start();
  }

  impulse(sec, decay) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  noise(sec) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5 + w * 0.15; }
    return b;
  }

  /* ---------- music ---------- */
  chord(t, notes, dur) {
    const ctx = this.ctx;
    notes.forEach((n, i) => {
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t);
      const peak = i === 0 ? 0.05 : 0.022;
      g.gain.linearRampToValueAtTime(peak, t + 2.4); g.gain.setValueAtTime(peak, t + dur - 0.2); g.gain.linearRampToValueAtTime(0, t + dur + 2.8);
      g.connect(i === 0 ? this.music : this.padF);
      const types = i === 0 ? ["sine"] : ["sawtooth", "sawtooth", "triangle"];
      types.forEach((ty, k) => {
        const o = ctx.createOscillator(); o.type = ty; o.frequency.value = midi(n) * (i === 0 ? 1 : 1);
        o.detune.value = (k - 1) * 7 + (Math.random() - 0.5) * 4;
        o.connect(g); o.start(t); o.stop(t + dur + 3);
      });
    });
  }
  pluck(t, n, vel) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.value = midi(n); f.type = "lowpass"; f.frequency.setValueAtTime(3800, t); f.frequency.exponentialRampToValueAtTime(700, t + 0.6);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06 * vel, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.4);
    o.connect(f); f.connect(g); g.connect(this.music); g.connect(this.delay); g.connect(this.reverb);
    o.start(t); o.stop(t + 1.5);
  }
  schedule() {
    const ctx = this.ctx, now = ctx.currentTime, BAR = 8;
    while (this.nextChord < now + 1) { this.chord(this.nextChord, CHORDS[this.chordIx % 4], BAR); this.chordIx++; this.nextChord += BAR; }
    while (this.nextArp < now + 0.6) {
      if (Math.random() < 0.42) { const pool = SCALE; this.pluck(this.nextArp, pool[Math.floor(Math.random() * pool.length)] + (Math.random() < 0.2 ? 12 : 0), 0.5 + Math.random() * 0.5); }
      this.nextArp += 0.375;
    }
  }

  /* ---------- sfx ---------- */
  whoosh(strength = 1) {
    if (!this.on) return;
    const ctx = this.ctx, t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.55); f.frequency.exponentialRampToValueAtTime(500, t + 1.3);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.42 * strength, t + 0.45); g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    s.connect(f); f.connect(g);
    if (p) { p.pan.setValueAtTime(-0.7, t); p.pan.linearRampToValueAtTime(0.7, t + 1.3); g.connect(p); p.connect(this.sfx); p.connect(this.reverb); } else { g.connect(this.sfx); }
    s.start(t, Math.random()); s.stop(t + 1.5);
    // a soft tonal shimmer rides on top, in key
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(midi(76), t); o.frequency.exponentialRampToValueAtTime(midi(88), t + 0.9);
    og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.025 * strength, t + 0.3); og.gain.exponentialRampToValueAtTime(0.0005, t + 1.2);
    o.connect(og); og.connect(this.reverb); o.start(t); o.stop(t + 1.3);
  }
  tick() {
    if (!this.on) return;
    const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(2300 + Math.random() * 300, t);
    g.gain.setValueAtTime(0.035, t); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.06);
    o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.07);
  }
  click() {
    if (!this.on) return;
    const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.14);
    g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.18);
    o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.2);
  }
  glitch() {
    if (!this.on) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = t0 + i * 0.045, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square"; o.frequency.value = 200 + Math.random() * 1800;
      g.gain.setValueAtTime(0.022, t); g.gain.setValueAtTime(0, t + 0.03);
      o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.035);
    }
  }
  intro() {
    const ctx = this.ctx, t = ctx.currentTime;
    // reverse-swell riser into a low hit
    const s = ctx.createBufferSource(); s.buffer = this.noiseBuf; const f = ctx.createBiquadFilter(); f.type = "highpass";
    f.frequency.setValueAtTime(4000, t); f.frequency.exponentialRampToValueAtTime(300, t + 0.9);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.85); g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    s.connect(f); f.connect(g); g.connect(this.sfx); g.connect(this.reverb); s.start(t); s.stop(t + 1.2);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sine";
    o.frequency.setValueAtTime(110, t + 0.85); o.frequency.exponentialRampToValueAtTime(36, t + 3);
    og.gain.setValueAtTime(0, t + 0.85); og.gain.linearRampToValueAtTime(0.5, t + 0.88); og.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
    o.connect(og); og.connect(this.sfx); og.connect(this.reverb); o.start(t + 0.85); o.stop(t + 3.3);
  }

  /* ---------- control ---------- */
  enable() {
    this.init(); if (!this.ctx) return false;
    this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t); this.master.gain.setValueAtTime(this.master.gain.value, t); this.master.gain.linearRampToValueAtTime(0.85, t + 1.2);
    if (!this.started || this.nextChord < t) { this.started = true; this.nextChord = t + 0.3; this.nextArp = t + 2; }
    if (!this.timer) this.timer = setInterval(() => this.schedule(), 200);
    this.on = true; return true;
  }
  disable() {
    if (!this.ctx) { this.on = false; return; }
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t); this.master.gain.setValueAtTime(this.master.gain.value, t); this.master.gain.linearRampToValueAtTime(0, t + 0.6);
    this.on = false;
    setTimeout(() => { if (!this.on && this.timer) { clearInterval(this.timer); this.timer = null; this.ctx.suspend(); } }, 700);
  }
}
