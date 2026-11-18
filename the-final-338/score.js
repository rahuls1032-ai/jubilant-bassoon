// THE SCORE — single source of truth for music AND picture.
// Story: a fan watches the U19 Asia Cup 2026 final (Pakistan vs India, India chasing 338).
// calm -> hand on heart -> head in hands -> praying -> LAST OVER -> the drop. The result is never claimed.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, placeBar, makeChords } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = makeClock({ bpm: 110, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(11) + 1.6; // ~25.6s

  const S = {
    calm: [0, T(2)],
    heart: [T(2), T(4)],
    boundaries: [T(4), T(6)],
    prayer: [T(6), T(7, 3)],
    breath: [T(7, 3), T(8)],
    drop: [T(8), T(10)],
    outro: [T(10), DURATION],
  };

  // D minor-ish desi colour: Dm Bb C Am
  const { chords, chordAt } = makeChords(clock, {
    Dm: { notes: ['A3', 'D4', 'F4'], bass: 'D2' },
    Bb: { notes: ['Bb3', 'D4', 'F4'], bass: 'Bb1' },
    C: { notes: ['G3', 'C4', 'E4'], bass: 'C2' },
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' },
    Gm: { notes: ['G3', 'Bb3', 'D4'], bass: 'G1' },
    A: { notes: ['A3', 'C#4', 'E4'], bass: 'A1' },
    Dsus: { notes: ['A3', 'D4', 'G4'], bass: 'D2' },
  }, [
    [0, 0, 4, 'Dm'], [1, 0, 4, 'Bb'],
    [2, 0, 4, 'Dm'], [3, 0, 4, 'Am'],
    [4, 0, 4, 'Bb'], [5, 0, 4, 'C'],
    [6, 0, 4, 'Gm'], [7, 0, 3, 'A'],
    [8, 0, 4, 'Dm'], [9, 0, 2, 'Bb'], [9, 2, 2, 'C'],
    [10, 0, 4, 'Dsus'], [11, 0, 4, 'Dm'],
  ]);

  // the hook (8th grid): harmonium in the intro, shehnai-ish brass on the drop
  const HOOK = {
    a: [['D5', 0, 2], ['F5', 2, 1], ['E5', 3, 1], ['D5', 4, 2], ['A4', 6, 2]],
    b: [['Bb4', 0, 2], ['D5', 2, 1], ['C5', 3, 1], ['Bb4', 4, 1], ['A4', 5, 3]],
    c: [['D5', 0, 1], ['F5', 1, 1], ['A5', 2, 2], ['G5', 4, 1], ['F5', 5, 1], ['E5', 6, 2]],
    d: [['F5', 0, 2], ['E5', 2, 1], ['D5', 3, 1], ['E5', 4, 2], ['C#5', 6, 2]],
    end: [['D5', 0, 2], ['C5', 2, 1], ['A4', 3, 1], ['D5', 4, 4]],
  };
  const intro = [...placeBar(clock, HOOK.a, 0, -12), ...placeBar(clock, HOOK.b, 1, -12)];
  const lead = [...placeBar(clock, HOOK.c, 8), ...placeBar(clock, HOOK.d, 9), ...placeBar(clock, HOOK.end, 10)];

  const ev = {
    title: T(0, 1),       // "THE FINAL" stamps
    target: T(1, 0),      // "TARGET 338" stamps on the TV
    heart: T(2, 0),       // hand goes to the heart; heartbeats start
    hits: [               // boundaries, each bigger than the last
      { t: T(4, 0), label: '4', size: 1.0 },
      { t: T(5, 0), label: '4', size: 1.15 },
      { t: T(5, 2), label: '6', size: 1.4 },
    ],
    prayer: T(6, 0),
    lastOver: T(7, 0),
    breath: T(7, 3),
    drop: T(8, 0),
    slump: T(10, 0),
    end: T(10, 2),
  };
  // heartbeats: on beats 1 and 3, getting faster (every beat) in bar 3
  const heartbeats = [];
  for (let b = 2; b < 4; b++) for (let q = 0; q < 4; q++) if (b === 3 || q % 2 === 0) heartbeats.push(T(b, q));
  // more heartbeats under the prayer, every beat
  for (let b = 6; b < 8; b++) for (let q = 0; q < 4; q++) { const t = T(b, q); if (t < ev.breath - 1e-6) heartbeats.push(t); }

  const markers = {
    title: { t: ev.title, sync: 'av' },
    target: { t: ev.target, sync: 'av' },
    four1: { t: ev.hits[0].t, sync: 'av' },
    four2: { t: ev.hits[1].t, sync: 'av' },
    six: { t: ev.hits[2].t, sync: 'av' },
    lastOver: { t: ev.lastOver, sync: 'av' },
    breath: ev.breath,
    drop: { t: ev.drop, sync: 'av' },
    end: ev.end,
  };

  const cx = SAFE.x + 30;
  const captions = [
    { t: T(2, 0.5), end: T(3, 3.6), text: 'the chase begins...', x: cx, y: 800, rot: -0.03, size: 56 },
    { t: T(6, 0.5), end: T(6, 3.7), text: 'every ball = one dua', x: cx, y: 800, rot: 0.03, size: 56 },
  ];

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, HOOK, intro, lead, ev, heartbeats, markers, captions };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
