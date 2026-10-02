// ---------- r6 · Level 9 terminal mini-game: PACKET STACK ----------
// The transfer only moves when you verify packets: drop the falling block into the well and complete rows. Fill the well to the top
// and the link corrupts (you lose a row and the modem screeches). A/D or ←/→ move, W/↑ turns, S/↓ drops faster, Space slams, E steps back.
const HACK9 = { on: false, T: null, skip: false, g: null, p: null, fallT: 0, lines: 0, need: 4, flash: 0, msg: '', msgT: 0, tCd: 0, wasOn: false };
const HK_C = 6, HK_R = 9;
const HK_P = [   // small, readable pieces
  { c: [[0, 0], [1, 0]], col: '#3dff7e' }, { c: [[0, 0], [1, 0], [2, 0]], col: '#7ad7ff' }, { c: [[0, 0], [0, 1], [1, 1]], col: '#ffd23a' },
  { c: [[0, 0], [1, 0], [0, 1], [1, 1]], col: '#ff8a4a' }, { c: [[0, 0], [1, 0], [2, 0], [1, 1]], col: '#d68aff' }];
function hackReset9(keepLines) {
  HACK9.g = Array.from({ length: HK_R }, () => new Array(HK_C).fill(0));
  for (let r = HK_R - 2; r < HK_R; r++) { const gaps = new Set([rndi(0, HK_C - 1)]); if (RNG() < 0.5) gaps.add(rndi(0, HK_C - 1)); for (let c = 0; c < HK_C; c++) HACK9.g[r][c] = gaps.has(c) ? 0 : '#2a6a40'; }
  if (!keepLines) HACK9.lines = 0;
  hackSpawn9();
}
function hackSpawn9() {
  const k = HK_P[rndi(0, HK_P.length - 1)], c = k.c.map(q => q.slice()), w = Math.max(...c.map(q => q[0])) + 1;
  HACK9.p = { c, col: k.col, x: ((HK_C - w) / 2) | 0, y: 0 }; HACK9.fallT = 0;
  if (!hackFits9(HACK9.p.c, HACK9.p.x, HACK9.p.y)) hackCorrupt9();
}
function hackFits9(c, x, y) { return c.every(([a, b]) => { const cx = x + a, cy = y + b; return cx >= 0 && cx < HK_C && cy < HK_R && (cy < 0 || !HACK9.g[cy][cx]); }); }
function hackRot9(c) { const r = c.map(([a, b]) => [b, -a]), mx = Math.min(...r.map(q => q[0])), my = Math.min(...r.map(q => q[1])); return r.map(([a, b]) => [a - mx, b - my]); }
function hackMove9(dx) { const P = HACK9.p; if (P && hackFits9(P.c, P.x + dx, P.y)) { P.x += dx; SFX.beep(700, 0.015); } }
function hackTurn9() { const P = HACK9.p; if (!P) return; const r = hackRot9(P.c); for (const k of [0, -1, 1]) if (hackFits9(r, P.x + k, P.y)) { P.c = r; P.x += k; SFX.beep(900, 0.015); return; } }
function hackLand9() {
  const P = HACK9.p, T = HACK9.T; for (const [a, b] of P.c) if (P.y + b >= 0) HACK9.g[P.y + b][P.x + a] = P.col;
  SFX.beep(420, 0.03); makeNoise(0.06);
  let n = 0;
  for (let r = HK_R - 1; r >= 0; r--) if (HACK9.g[r].every(Boolean)) { HACK9.g.splice(r, 1); HACK9.g.unshift(new Array(HK_C).fill(0)); n++; r++; }
  if (n) {
    HACK9.lines = Math.min(HACK9.need, HACK9.lines + n); HACK9.flash = 0.35; HACK9.msg = n > 1 ? `${n} PACKETS VERIFIED` : 'PACKET VERIFIED'; HACK9.msgT = 1.2;
    SFX9.chirp(P9({ x: T.x, z: T.z, y: 0.96 })); FX.glitch = Math.max(FX.glitch, 0.25);
    T.prog = T.need * HACK9.lines / HACK9.need;
    if (HACK9.lines < HACK9.need && !HACK9.g.some(row => row.some(Boolean))) hackReset9(true);   // a clean well gets fresh junk to clear
  }
  if (HACK9.lines < HACK9.need) hackSpawn9();
}
function hackCorrupt9() {
  const T = HACK9.T; HACK9.lines = Math.max(0, HACK9.lines - 1); if (T) T.prog = T.need * HACK9.lines / HACK9.need;
  HACK9.msg = 'LINK CORRUPTED'; HACK9.msgT = 1.6; HACK9.flash = 0.6; FX.glitch = Math.max(FX.glitch, 1.0);
  if (T) { SFX9.modem(P9({ x: T.x, z: T.z, y: 0.96 })); noiseAt9(T.x, T.z, 0.9, 0.5); }
  toast('LINK CORRUPTED · ONE PACKET LOST', 2);
  hackReset9(true);
}
// ----- session -----
function hackStart9(T) {
  if (HACK9.skip) return;
  HACK9.need = [3, 4, 5][G.diff];
  if (HACK9.T !== T || !HACK9.g || T.prog <= 0) { HACK9.T = T; hackReset9(true); }   // a new terminal, or a transfer a checkpoint retry cancelled: fresh well
  HACK9.lines = Math.round(T.prog / T.need * HACK9.need);   // the packet count always follows the transfer
  HACK9.on = true; HACK9.tCd = 0;
  if (!G9.hackTip) { G9.hackTip = true; toast(IS_TOUCH ? 'PACKET STACK · STICK MOVES / TURNS / DROPS · USE STEPS BACK' : 'PACKET STACK · A/D MOVE · W TURN · S DROP · E STEP BACK', 4.2); }
}
function hackStop9(msg) { if (!HACK9.on) return; HACK9.on = false; if (msg) toast(msg, 1.8); }
function hackKeys9(J) {   // called from updatePlayer before JUST is cleared
  if (!HACK9.on || !HACK9.p) return;
  if (J.has('KeyA') || J.has('ArrowLeft')) hackMove9(-1);
  if (J.has('KeyD') || J.has('ArrowRight')) hackMove9(1);
  if (J.has('KeyW') || J.has('ArrowUp')) hackTurn9();
  if (J.has('Space')) { const P = HACK9.p; while (hackFits9(P.c, P.x, P.y + 1)) P.y++; hackLand9(); }
}
function hackTick9(dt) {
  const T = HACK9.T;
  if (HACK9.on && (!T || !T.active || T.done || G.state !== 'play')) HACK9.on = false;
  if (HACK9.on && dist2(T.x, T.z, PL.x, PL.z) > 3.4) hackStop9('LINK INTERRUPTED');
  if (HACK9.on) { const H = hearLimit9(); if (H.hunt) hackStop9('SOMETHING IS COMING · YOU LET GO OF THE KEYS'); }
  HACK9.flash = Math.max(0, HACK9.flash - dt); HACK9.msgT = Math.max(0, HACK9.msgT - dt);
  if (!HACK9.on || !HACK9.p) return;
  if (IS_TOUCH) {   // the stick: sideways moves, up turns, down drops
    HACK9.tCd -= dt;
    if (HACK9.tCd <= 0) { if (TOUCH.mx > 0.6) { hackMove9(1); HACK9.tCd = 0.18; } else if (TOUCH.mx < -0.6) { hackMove9(-1); HACK9.tCd = 0.18; } else if (TOUCH.mz > 0.7) { hackTurn9(); HACK9.tCd = 0.3; } }
  }
  const soft = K.has('KeyS') || K.has('ArrowDown') || (IS_TOUCH && TOUCH.mz < -0.6);
  HACK9.fallT += dt * (soft ? 9 : 1);
  const step = [0.75, 0.6, 0.46][G.diff];
  while (HACK9.fallT >= step && HACK9.on && HACK9.p) {
    HACK9.fallT -= step; const P = HACK9.p;
    if (hackFits9(P.c, P.x, P.y + 1)) P.y++; else { hackLand9(); break; }
  }
}
// drawn on the terminal's own screen (256 × 192)
function drawHack9(T) {
  const c = T.sc.ctx, w = 256, h = 192, cs = 18, ox = 12, oy = 22, G1 = '#3dff7e';
  c.fillStyle = HACK9.flash > 0 && HACK9.msg === 'LINK CORRUPTED' ? '#2a0606' : '#021208'; c.fillRect(0, 0, w, h);
  c.fillStyle = G1; c.font = 'bold 13px monospace'; c.fillText('PACKET STACK · NODE 9-' + (T.i + 1), ox, 15);
  c.strokeStyle = G1; c.lineWidth = 2; c.strokeRect(ox - 2, oy - 2, HK_C * cs + 4, HK_R * cs + 4);
  for (let r = 0; r < HK_R; r++) for (let q = 0; q < HK_C; q++) { const v = HACK9.g[r][q]; if (v) { c.fillStyle = v; c.fillRect(ox + q * cs + 1, oy + r * cs + 1, cs - 2, cs - 2); } else { c.fillStyle = 'rgba(61,255,126,0.07)'; c.fillRect(ox + q * cs + 8, oy + r * cs + 8, 2, 2); } }
  const P = HACK9.p;
  if (P) {
    let gy = P.y; while (hackFits9(P.c, P.x, gy + 1)) gy++;   // where it would land
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; for (const [a, b] of P.c) c.strokeRect(ox + (P.x + a) * cs + 2, oy + (gy + b) * cs + 2, cs - 4, cs - 4);
    c.fillStyle = P.col; for (const [a, b] of P.c) if (P.y + b >= 0) c.fillRect(ox + (P.x + a) * cs + 1, oy + (P.y + b) * cs + 1, cs - 2, cs - 2);
  }
  const rx = ox + HK_C * cs + 14; c.fillStyle = G1; c.font = '12px monospace';
  c.fillText('PACKETS', rx, 40); c.font = 'bold 22px monospace'; c.fillText(`${HACK9.lines}/${HACK9.need}`, rx, 64);
  c.font = '12px monospace'; c.fillText('TRANSFER', rx, 92); c.strokeRect(rx, 98, 100, 12); c.fillRect(rx + 2, 100, 96 * clamp(T.prog / T.need, 0, 1), 8);
  if (!HACK9.on) { c.fillStyle = Math.floor(FX.t * 2) % 2 ? '#ffd23a' : G1; c.fillText(T.away > 0.25 ? 'LINK LOST' : 'PAUSED', rx, 130); c.fillText('[E] RESUME', rx, 146); }
  else if (HACK9.msgT > 0) { c.fillStyle = HACK9.msg === 'LINK CORRUPTED' ? '#ff5a40' : '#ffffff'; c.fillText(HACK9.msg.split(' ')[0], rx, 130); c.fillText(HACK9.msg.split(' ').slice(1).join(' '), rx, 146); }
  else { c.fillStyle = 'rgba(61,255,126,0.7)'; c.fillText(IS_TOUCH ? 'STICK: MOVE' : 'A D  MOVE', rx, 130); c.fillText(IS_TOUCH ? 'UP: TURN' : 'W    TURN', rx, 146); c.fillText(IS_TOUCH ? 'DOWN: DROP' : 'S    DROP', rx, 162); }
  c.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
  T.sc.dt.update();
}
function resetHack9() { Object.assign(HACK9, { on: false, T: null, g: null, p: null, lines: 0, msg: '', msgT: 0, flash: 0 }); }
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { HACK9, hackStart9, hackStop9, hackMove9, hackTurn9, hackLand9, hackTick9, hackFits9 }));
