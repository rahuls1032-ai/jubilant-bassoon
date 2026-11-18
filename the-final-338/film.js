// THE FILM — a fan watches the final. Pure function of t; every hit comes from score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { BEAT, ev, T } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const FAN = {
    hairStyle: 'quiff', hair: '#1E1612', facialHair: 'mustache', glasses: 'none',
    outfit: 'hoodie', shirt: '#1F7A4D', bottoms: 'pants', pants: '#2A2F3C', shoes: '#EDEDED',
    skin: Ch.SKIN_TONES ? Ch.SKIN_TONES[3] : undefined, build: 'regular',
  };
  globalThis.CAST = { fan: FAN };

  // layout
  const TV = { x: 80, y: 236, w: 840, h: 420 };
  const METER = { x: 80, y: 690, w: 840, h: 34 };
  const FAN_X = W / 2 - 40, HIP_Y = 1600, FS = 1.9, FEET_Y = 1745;

  const after = (list, t) => { let r = null; for (const x of list) if (x.t <= t + 1e-6) r = x; return r; };
  const hitAt = (t) => after(ev.hits, t);
  const stamp = (t, t0) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / 0.22), 2.6));

  // ---------- room ----------
  function room(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#15202E'); g.addColorStop(1, '#22293A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // shelves of little frames (like a fan's wall), plants at the edges
    for (let i = 0; i < 6; i++) {
      const x = 120 + i * 140, y = 800 + (i % 2) * 18;
      G.rrect(ctx, x, y, 90, 110, 6, { fill: ['#C9A55A', '#3B6EA5', '#2E8B57', '#B5523B'][i % 4], lw: 3, seed: 30 + i, alpha: 0.35 });
    }
    for (const [x, sd] of [[40, 1], [W - 40, -1]]) {
      for (let k = 0; k < 6; k++) G.ellipse(ctx, x + sd * (10 + k * 8), 1180 - k * 60, 70, 26, { fill: '#2F5A3A', lw: 3, seed: 50 + k + x, alpha: 0.7 });
    }
    // floor (lives in the bottom 22%: platform UI may cover it, which is fine)
    G.poly(ctx, [[-20, 1640], [W + 20, 1640], [W + 20, H + 20], [-20, H + 20]], { fill: '#3A2D2A', lw: 4, seed: 9, hatch: { color: 'rgba(0,0,0,0.18)', gap: 10 } });
  }

  // TV glow colour on the fan per section
  function glow(ctx, t) {
    let col = 'rgba(80,200,140,0.10)';
    if (t >= ev.drop && t < ev.slump) col = `rgba(255,210,120,${0.14 + 0.1 * pulse(t, ev.drop + Math.floor((t - ev.drop) / BEAT) * BEAT, 6)})`;
    else if (t >= ev.breath && t < ev.drop) col = 'rgba(0,0,0,0.0)';
    const h = hitAt(t); if (h && t - h.t < 0.5 && t < ev.prayer) col = `rgba(255,255,255,${0.25 * (1 - (t - h.t) / 0.5)})`;
    const gr = ctx.createRadialGradient(W / 2, 600, 50, W / 2, 900, 1100);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  }

  // ---------- the broadcast on the TV ----------
  function field(ctx, t, x, y, w, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#2E8F4E'); g.addColorStop(1, '#1D6B39');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; ctx.fillRect(x, y + (i * h) / 8, w, h / 8); }
    // pitch strip in perspective + stumps
    const cx = x + w / 2;
    G.poly(ctx, [[cx - 40, y + 60], [cx + 40, y + 60], [cx + 90, y + h], [cx - 90, y + h]], { fill: '#CDB58A', lw: 3, seed: 61 });
    for (const sx of [-10, 0, 10]) G.line(ctx, [[cx + sx, y + 64], [cx + sx, y + 30]], { lw: 4, color: '#F4EBD8', seed: 62 + sx });
    for (const sx of [-24, 0, 24]) G.line(ctx, [[cx + sx, y + h - 10], [cx + sx, y + h - 80]], { lw: 7, color: '#F4EBD8', seed: 66 + sx });
    // crowd band
    ctx.fillStyle = '#22314F'; ctx.fillRect(x, y, w, 26);
    for (let i = 0; i < 70; i++) { ctx.fillStyle = ['#2E8B57', '#3B6EA5', '#E9C46A', '#ddd'][i % 4]; ctx.fillRect(x + (i * w) / 70 + 2, y + 6 + (i % 3) * 5, 6, 6); }
  }

  function tv(ctx, t) {
    const { x, y, w, h } = TV;
    // flash on every stamp so the cut reads
    G.rrect(ctx, x - 14, y - 14, w + 28, h + 28, 26, { fill: '#0C0F14', lw: 5, seed: 70 });
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    field(ctx, t, x, y, w, h);
    // the ball: rolled in on each boundary, flies to the rope
    const hh = hitAt(t);
    if (hh && t - hh.t < 0.9 && t < ev.prayer) {
      const u = ease.outCubic(clamp((t - hh.t) / 0.6));
      const i = ev.hits.indexOf(hh), dir = [[-1, -0.6], [1, -0.7], [0.2, -1.2]][i];
      const bx = x + w / 2 + dir[0] * u * w * 0.55, by = y + h - 60 + dir[1] * u * h * 0.9;
      for (let k = 1; k < 6; k++) G.ellipse(ctx, bx - dir[0] * k * 14, by - dir[1] * k * 14, 9, 9, { fill: `rgba(255,255,255,${0.15 * (6 - k) / 5})`, lw: 0, seed: 80 + k });
      G.ellipse(ctx, bx, by, 13, 13, { fill: '#F5F1E6', lw: 3, seed: 81 });
    }
    // last ball, in slow motion, coming at the camera during the held breath
    if (t >= ev.lastOver && t < ev.drop) {
      const u = clamp((t - ev.lastOver) / (ev.drop - ev.lastOver));
      const r = lerp(8, 120, ease.inCubic(u));
      G.ellipse(ctx, x + w / 2, y + h * 0.55, r, r, { fill: '#F5F1E6', lw: 4, seed: 82 });
      G.line(ctx, [[x + w / 2 - r * 0.9, y + h * 0.55 - r * 0.3], [x + w / 2 + r * 0.9, y + h * 0.55 + r * 0.3]], { lw: 3, color: '#B5523B', seed: 83 });
    }
    // overlay bars (graphics of the broadcast)
    ctx.fillStyle = 'rgba(8,30,70,0.88)'; ctx.fillRect(x, y + h - 58, w, 58);
    G.text(ctx, 'PAKISTAN  vs  INDIA', x + 24, y + h - 16, { size: 34, color: '#FFFFFF', boil: false });
    if (t >= ev.target) G.text(ctx, 'TARGET 338', x + w - 24, y + h - 16, { size: 34, color: '#FFD23F', align: 'right', boil: false });
    // LIVE pill
    ctx.fillStyle = '#D62839'; ctx.fillRect(x + 20, y + 40, 92, 40);
    G.text(ctx, 'LIVE', x + 66, y + 71, { size: 28, color: '#fff', align: 'center', boil: false });
    // big stamps on the TV
    const big = (txt, t0, t1, col, size, sub) => {
      if (t < t0 || t >= t1) return;
      const p = stamp(t, t0), a = clamp((t1 - t) / 0.2);
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(x + w / 2, y + h * 0.45); ctx.scale(p, p); ctx.rotate(-0.06);
      G.text(ctx, txt, 0, 0, { size, color: col, align: 'center', stroke: '#0C0F14', strokeW: 14 });
      if (sub) G.text(ctx, sub, 0, size * 0.55, { size: size * 0.32, color: '#fff', align: 'center', stroke: '#0C0F14', strokeW: 8 });
      ctx.restore();
    };
    big('THE FINAL', ev.title, ev.target, '#FFD23F', 130, 'U19 ASIA CUP 2026');
    big('338', ev.target, S.T(1, 3.6), '#FFFFFF', 190, 'TO WIN');
    ev.hits.forEach((hh2, i) => big(hh2.label + '!', hh2.t, (ev.hits[i + 1] || { t: hh2.t + 1.6 }).t, i === 2 ? '#FF7A3D' : '#FFD23F', 220 * hh2.size));
    big('LAST OVER', ev.lastOver, ev.breath, '#FF5A5F', 130);
    ctx.restore();
    // stamp flashes (whole screen of the TV)
    for (const t0 of [ev.title, ev.target, ev.lastOver, ...ev.hits.map((q) => q.t)]) {
      const f = t >= t0 ? Math.exp(-(t - t0) * 14) : 0;
      if (f > 0.02) { ctx.fillStyle = `rgba(255,255,255,${0.85 * f})`; ctx.fillRect(x, y, w, h); }
    }
  }

  // the nerves meter fills through the chase
  function meter(ctx, t) {
    if (t < ev.heart - 0.3) return;
    const { x, y, w, h } = METER;
    let v = clamp((t - ev.heart) / (ev.breath - ev.heart)) * 0.75;
    for (const q of ev.hits) if (t >= q.t) v += 0.07 * ease.outBack(clamp((t - q.t) / 0.3));
    if (t >= ev.drop) v = 1;
    v = clamp(v);
    const a = clamp((t - ev.heart + 0.3) / 0.3);
    ctx.save(); ctx.globalAlpha = a;
    G.rrect(ctx, x, y, w, h, 17, { fill: '#0C0F14', lw: 4, seed: 90 });
    const col = v > 0.85 ? '#FF5A5F' : v > 0.5 ? '#FFB23F' : '#4CC38A';
    if (v > 0.02) G.rrect(ctx, x + 4, y + 4, (w - 8) * v, h - 8, 13, { fill: col, lw: 0, seed: 91 });
    G.text(ctx, t >= ev.drop ? 'NERVES: MAXED OUT' : 'NERVES', x + 18, y + h - 8, { size: 24, color: '#fff', boil: false });
    ctx.restore();
  }

  // ---------- gaming chair + the fan ----------
  function chair(ctx) {
    const x = FAN_X;
    G.rrect(ctx, x - 175, HIP_Y - 620, 350, 650, 70, { fill: '#1A1A1F', lw: 5, seed: 100, hatch: { color: 'rgba(255,255,255,0.05)', gap: 9 } });
    G.rrect(ctx, x - 60, HIP_Y - 600, 120, 610, 40, { fill: '#B5223B', lw: 4, seed: 101 });
    G.rrect(ctx, x - 200, HIP_Y - 30, 400, 70, 26, { fill: '#26262D', lw: 5, seed: 102 });
    G.line(ctx, [[x, HIP_Y + 40], [x, 1720]], { lw: 18, color: '#111', seed: 103 });
    G.line(ctx, [[x - 120, 1730], [x + 120, 1730]], { lw: 14, color: '#111', seed: 104 });
  }

  function fan(ctx, t) {
    const o = { x: FAN_X, y: HIP_Y, s: FS, pose: 'sit', style: FAN, seed: 300, blink: 0 };
    // blink every so often (deterministic)
    const bp = (t * 0.6) % 1; if (bp > 0.96) o.blink = 1;
    const hb = after(S.heartbeats.map((q) => ({ t: q })), t);
    const thump = hb ? pulse(t, hb.t, 9) : 0;

    if (t < ev.heart) { // calm: arms crossed, confident
      o.crossArms = true; o.mouth = 'smirk'; o.eyes = 'normal'; o.brows = 'neutral';
      o.headRot = 0.05 * Math.sin(t * 1.5);
    } else if (t < ev.hits[0].t) { // hand on heart
      o.handR = [26, -128]; o.mouth = 'wavy'; o.brows = 'worried'; o.eyes = 'normal';
      o.sy = 1 + 0.015 * thump;
    } else if (t < ev.prayer) { // head in hands, worse each time
      const h = hitAt(t), i = ev.hits.indexOf(h);
      const k = clamp((t - h.t) / 0.12);
      o.handL = [lerp(-62, -46, k), lerp(-6, -232, k)]; o.handR = [lerp(26, 46, k), lerp(-128, -232, k)];
      o.eyes = 'closed'; o.mouth = 'o'; o.brows = 'worried'; o.sweat = 0.4 + i * 0.3;
      o.headY = 8 + i * 6; o.rot = Math.sin((t - h.t) * 9) * 0.03 * (i + 1) * Math.exp(-(t - h.t) * 2);
    } else if (t < ev.breath) { // praying
      o.handL = [-12, -200]; o.handR = [12, -200]; o.eyes = 'closed'; o.brows = 'worried';
      o.mouth = Math.floor(t / (BEAT / 2)) % 2 ? 'wavy' : 'flat'; // lips moving in prayer
      o.sweat = 0.6; o.sy = 1 + 0.012 * thump;
      if (t >= ev.lastOver) { o.eyes = 'wide'; o.mouth = 'o'; } // peeks at LAST OVER
    } else if (t < ev.drop) { // the held breath: frozen, leaning in
      o.handL = [-12, -200]; o.handR = [12, -200]; o.eyes = 'wide'; o.mouth = 'flat'; o.brows = 'worried'; o.sweat = 1;
      o.sy = 0.96; o.headY = -6;
    } else if (t < ev.slump) { // the drop: on his feet, hands on head
      const j = clamp((t - ev.drop) / 0.25);
      o.pose = 'stand'; o.y = FEET_Y - 60 * Math.sin(Math.PI * j) * (t < ev.drop + 0.25 ? 1 : 0);
      o.handL = [-58, -486]; o.handR = [58, -486]; o.eyes = 'wide'; o.mouth = 'open'; o.brows = 'up';
      o.rot = Math.sin((t - ev.drop) * 6) * 0.04; o.sweat = 0.5;
    } else { // slump back, exhale, smile
      const k = ease.outCubic(clamp((t - ev.slump) / 0.5));
      o.handL = [-80, -10]; o.handR = [80, -10]; o.eyes = 'closed'; o.mouth = 'smile'; o.brows = 'neutral';
      o.sy = 1 - 0.04 * k; o.headRot = -0.12 * k; o.blush = 0.4;
    }
    Ch.person(ctx, o);

    // the heart gimmick: a heart on his chest that beats with the music
    if (t >= ev.heart && t < ev.breath && !(t >= ev.hits[0].t && t < ev.prayer)) {
      const s = 1.6 + 1.2 * thump;
      G.heart(ctx, FAN_X + 30 * FS, HIP_Y - 150 * FS, s, { seed: 7 });
    }
  }

  // drop: rays behind, then the big words
  function rays(ctx, t) {
    if (t < ev.drop || t >= ev.slump) return;
    ctx.save(); ctx.translate(W / 2, 1050); ctx.rotate((t - ev.drop) * 0.25);
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = i % 2 ? '#F2B84B' : '#1F7A4D';
      const a0 = (i / 20) * Math.PI * 2, a1 = ((i + 1) / 20) * Math.PI * 2, R = 2400;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); ctx.fill();
    }
    ctx.restore();
  }

  function dropWords(ctx, t) {
    if (t < ev.drop || t >= ev.slump) return;
    const words = ['WHAT.', 'A.', 'FINAL.'];
    words.forEach((w, i) => {
      const t0 = ev.drop + i * BEAT;
      const p = stamp(t, t0); if (p <= 0) return;
      ctx.save(); ctx.translate(W / 2 - 40, 330 + i * 150); ctx.scale(p, p); ctx.rotate(i % 2 ? 0.04 : -0.04);
      G.text(ctx, w, 0, 0, { size: 150, color: i === 2 ? '#FFD23F' : '#FFFFFF', align: 'center', stroke: '#0C0F14', strokeW: 16 });
      ctx.restore();
    });
  }

  function endCard(ctx, t) {
    if (t < ev.end) return;
    const a = clamp((t - ev.end) / 0.4);
    ctx.save(); ctx.globalAlpha = a;
    G.tornPaper(ctx, 110, 300, 800, 380, { fill: '#F4EBD8', seed: 120, shadow: true });
    G.text(ctx, 'U19 Asia Cup 2026', W / 2 - 40, 400, { size: 52, color: '#1F7A4D', align: 'center' });
    G.text(ctx, 'The Final', W / 2 - 40, 490, { size: 86, color: '#14181F', align: 'center' });
    G.text(ctx, 'win or lose... dil se fan.', W / 2 - 40, 590, { size: 46, fam: 'Patrick Hand', weight: 400, color: '#B5223B', align: 'center' });
    ctx.restore();
  }

  Studio.film({
    draw(ctx, t) {
      // camera shake on boundaries and the drop
      let shake = 0;
      const h = hitAt(t); if (h && t < ev.prayer) shake = 14 * h.size * Math.exp(-(t - h.t) * 7);
      if (t >= ev.drop) shake = Math.max(shake, 24 * Math.exp(-(t - ev.drop) * 4));
      ctx.save();
      ctx.translate(U.noise1(t * 30, 1) * shake, U.noise1(t * 30, 2) * shake);
      room(ctx, t);
      rays(ctx, t);
      chair(ctx);
      if (!(t >= ev.drop && t < ev.slump)) { tv(ctx, t); meter(ctx, t); }
      else meter(ctx, t);
      fan(ctx, t);
      glow(ctx, t);
      dropWords(ctx, t);
      ctx.restore();
      // the world holds its breath
      if (t >= ev.breath && t < ev.drop) { ctx.fillStyle = 'rgba(5,6,12,0.45)'; ctx.fillRect(0, 0, W, H); }
      const flash = t >= ev.drop ? 0.9 * Math.exp(-(t - ev.drop) * 10) : 0;
      if (flash > 0.01) { ctx.fillStyle = `rgba(255,250,235,${flash})`; ctx.fillRect(0, 0, W, H); }
      for (const c of S.captions) G.caption(ctx, c, t);
      endCard(ctx, t);
    },
    post: { paper: 0.35, vignette: 0.4, grain: 0.05 },
    fadeOut: 1.2,
  });
})();
