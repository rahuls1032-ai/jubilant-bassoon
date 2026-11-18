// THE SONG — renders every sound from the score into out/music.wav.
//   node song.js   (STEMS=1 writes out/stem-*.wav, LUFS=-14 masters to a loudness)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), lead = bus(), fx = bus(), heart = bus(), crowd = bus();
const verb = bus(), dly = bus();
const inBreath = (t) => t >= ev.breath - 1e-6 && t < ev.drop - 1e-6;

// ---------- harmonium chords (whole film, soft early, open on the drop) ----------
for (const c of sc.chords) {
  const t1 = c.t0 < ev.breath && c.t1 > ev.breath ? ev.breath : c.t1;
  const loud = c.t0 >= ev.drop && c.t0 < ev.slump;
  for (const n of c.notes) {
    const h = I.harmonium(n, t1 - c.t0, { attack: 0.12, release: 0.4, bright: loud ? 0.9 : 0.6, seed: n });
    pad.addStereo(h.L, h.R, c.t0, loud ? 0.07 : 0.05);
  }
}

// ---------- intro hook on harmonium, outro on music box ----------
for (const n of sc.intro) { const h = I.harmonium(n.midi, n.dur * 0.95, { attack: 0.03, bright: 1.1, seed: 7 }); keys.addStereo(h.L, h.R, n.t, 0.09); verb.addStereo(h.L, h.R, n.t, 0.04); }
for (const n of sc.HOOK.end.map(([nn, s, d]) => ({ t: T(10, s / 2), midi: m(nn) + 12 }))) { const mb = I.musicBox(n.midi); keys.addMono(mb, n.t + BEAT * 4, 0.16); verb.addMono(mb, n.t + BEAT * 4, 0.2); }

// ---------- tabla: tin on every beat in the calm section, dha on the stamps ----------
clock.eachStep(0, 2, 4, (t) => { if (t > 0.2) drums.addMono(I.tabla('tin', { midi: 62, seed: Math.round(t * 10) }), t, 0.25, 0.2); });
for (const t of [ev.title, ev.target]) { drums.addMono(I.tabla('dha', { midi: 62, seed: 3 }), t, 0.7); drums.addMono(I.dhol('both', { seed: 4 }), t, 0.6); fx.addMono(I.tvClick(), t, 0.25); }

// ---------- heartbeats ----------
for (const t of sc.heartbeats) heart.addMono(I.heartbeat(), t, 0.85);

// ---------- dholak groove: boundaries + prayer (bars 4-7) ----------
const G16 = { 0: ['ghe', 0.7, 1], 8: ['ghe', 0.7, 1], 6: ['ghe', 0.5, 0.9], 11: ['ghe', 0.5, 0.9], 2: ['na', 0.4, 1], 10: ['na', 0.4, 1], 14: ['na', 0.4, 1], 4: ['na', 0.4, 1.06], 12: ['na', 0.4, 1.06], 7: ['ka', 0.3, 1], 15: ['ka', 0.3, 1], 13: ['tit', 0.15, 1] };
clock.eachStep(4, 8, 16, (t, b, s) => {
  if (t >= ev.lastOver - 1e-6) return;
  const g = G16[s]; if (!g) return;
  drums.addMono(I.dholak(g[0], { pitch: g[2], seed: s + b * 16 }), t, g[1] * (b >= 6 ? 0.8 : 1), g[0] === 'na' ? 0.25 : 0);
  if (s === 4 || s === 12) { const cl = I.clap({ spread: 1.3 }); drums.addMono(cl, t, b >= 6 ? 0.25 : 0.4); verb.addMono(cl, t, 0.15); }
});

// ---------- boundaries: bat crack + dhol + crash + crowd roar through the TV ----------
const CR = I.crash(18);
ev.hits.forEach((h, i) => {
  drums.addMono(I.woodTick(0.62), h.t, 0.9 * h.size);
  drums.addMono(I.thwack(), h.t, 0.55 * h.size);
  drums.addMono(I.dhol('both', { seed: 20 + i }), h.t, 0.7);
  drums.addMono(CR, h.t, 0.22 * h.size, i % 2 ? 0.3 : -0.3);
  // crowd: a burst of shouting voices, low-passed later as "through a TV"
  const rnd = (k) => ((Math.sin((i + 1) * 999 + k * 77.7) * 43758.5) % 1 + 1) % 1;
  const nv = Math.round(10 * h.size);
  for (let k = 0; k < nv; k++) {
    const len = 0.6 + rnd(k) * 0.7, mid = 50 + Math.floor(rnd(k + 50) * 12) + (k % 3 === 0 ? 12 : 0);
    const v = I.voice(mid, len, { syl: k % 2 ? 'a' : 'e', type: k % 3 === 0 ? 'alto' : 'tenor', seed: k + i * 40, glide: 3, breath: 0.2, shout: 1.3 });
    crowd.addMono(v, h.t + 0.03 + rnd(k + 9) * 0.12, 0.05, rnd(k + 3) * 1.2 - 0.6);
  }
});

// ---------- LAST OVER: stamp, then a dhol roll that stops an 8th early (held breath) ----------
drums.addMono(I.dhol('both', { seed: 31 }), ev.lastOver, 0.8);
fx.addMono(I.tvClick(), ev.lastOver, 0.3);
for (let i = 0; i < 10; i++) {
  const t = T(7, 0.5) + i * BEAT / 5;
  if (t >= T(7, 2.5) - 1e-6) break;
  drums.addMono(I.dhol(i % 2 ? 'tilli' : 'dagga', { seed: 40 + i }), t, 0.3 + i * 0.05);
}
fx.addMono(I.noiseSweep(ev.breath - ev.prayer, 200, 7000, { q: 0.9, shape: (x) => x * x, pink: true }), ev.prayer, 0.35);

// ---------- THE DROP: dhol + sub boom + crash, then the dhol chaal and the lead ----------
drums.addMono(I.dhol('both', { seed: 50 }), ev.drop, 1);
drums.addMono(I.kick({ punch: 1.3, tail: 0.4 }), ev.drop, 0.9);
drums.addMono(CR, ev.drop, 0.45);
fx.addMono(I.subBoom(2.2), ev.drop, 0.7);
const kicks = [];
const CHAAL = 'B.t.tD.tB.t.tD.t';
clock.eachStep(8, 10, 16, (t, b, s) => {
  if (t < ev.drop + 1e-6) return;
  const c = CHAAL[s];
  if (c === 'B') { drums.addMono(I.dhol('both', { seed: s + b }), t, 0.85); kicks.push(t); }
  if (c === 'D') drums.addMono(I.dhol('dagga', { seed: s + b }), t, 0.7);
  if (c === 't') drums.addMono(I.dhol('tilli', { seed: s + b }), t, 0.35, 0.2);
  if (s === 4 || s === 12) { const cl = I.clap({ spread: 1.3 }); drums.addMono(cl, t, 0.45); verb.addMono(cl, t, 0.2); }
});
// "ooooh" crowd on the drop (ambiguous on purpose: the result isn't ours to tell)
for (let k = 0; k < 16; k++) {
  const v = I.voice(52 + (k % 5) * 2 + (k % 4 === 0 ? 12 : 0), 1.8, { syl: 'u', type: k % 4 === 0 ? 'alto' : 'tenor', seed: 200 + k, glide: -4, breath: 0.15 });
  crowd.addMono(v, ev.drop + 0.05 + (k % 7) * 0.02, 0.05, (k % 5) / 2.5 - 0.8);
}
for (const n of sc.lead) {
  const a = I.brassNote(n.midi, n.dur * 0.9), b = I.harmonium(n.midi - 12, n.dur * 0.9, { attack: 0.02, bright: 1.2, seed: 9 });
  lead.addStereo(a.L, a.R, n.t, 0.22); lead.addStereo(b.L, b.R, n.t, 0.1);
  verb.addStereo(a.L, a.R, n.t, 0.1); dly.addStereo(a.L, a.R, n.t, 0.04);
}

// ---------- bass: plucks on 1 and 3 from the boundaries on, 8ths on the drop ----------
clock.eachStep(4, 10, 8, (t, b, s) => {
  if (t >= ev.lastOver - 1e-6 && t < ev.drop - 1e-6) return;
  const c = sc.chordAt(t); if (!c) return;
  const R = c.bass + 12;
  if (b >= 8) bass.addMono(I.bass(s % 2 ? R + 12 : R, BEAT / 2 * 0.8, { sub: 0.8 }), t, 0.5);
  else if (s === 0 || s === 4) bass.addMono(I.bass(R, BEAT * 0.8), t, 0.5);
});
bass.addMono(I.bass(m('D2'), 3, { bright: 0.3, sub: 1 }), ev.slump, 0.4);

// ---------- slump: a big exhale (soft noise) ----------
fx.addMono(I.noiseSweep(1.2, 1800, 300, { q: 0.7, pink: true }), ev.slump, 0.25);
for (const c of sc.captions) fx.addMono(I.paperFwip(0.9, Math.round(c.t * 10)), c.t - 0.03, 0.2);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks);
// crowd through a TV: band-limited
const { SVF } = require('./engine/audio/dsp');
for (const ch of [crowd.L, crowd.R]) { const f = new SVF(), g = new SVF(); for (let i = 0; i < ch.length; i++) ch[i] = g.hp(f.lp(ch[i], 2400, 0.7), 300, 0.7); }
const stems = {
  drums, bass, pad, keys, lead, fx, heart, crowd,
  verb: reverb(verb, { room: 0.82, damp: 0.35 }),
  dly: pingpong(dly, BEAT * 0.75, 0.35, 3500),
};
const GAIN = { drums: 0.55, bass: 0.7, pad: 1.4, keys: 2.0, lead: 1.6, fx: 0.8, heart: 0.55, crowd: 2.4, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 22);
MIX.gate(mix, ev.breath, ev.drop);
MIX.fadeOut(mix, DURATION - 1.4, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : -14 });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
