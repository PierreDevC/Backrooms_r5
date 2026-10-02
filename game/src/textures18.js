// ---------- Level 18 · Nostalgic Memories: procedural textures (canvas-painted wallpapers & murals, kids' floors, drop ceilings) ----------
// canvas textures: draw(ctx, S, hctx) paints the albedo (canvas top = top of the wall) and optionally a grey height map.
function canvasTex18(scene, S, nStr, draw, o = {}) {
  const W = o.w || S, cv = document.createElement('canvas'); cv.width = W; cv.height = S; const c = cv.getContext('2d');
  const hv = document.createElement('canvas'); hv.width = W; hv.height = S; const h = hv.getContext('2d');
  h.fillStyle = '#808080'; h.fillRect(0, 0, W, S);
  draw(c, W, S, h);
  const A = c.getImageData(0, 0, W, S).data, HH = h.getImageData(0, 0, W, S).data;
  // square textures only past this point (W === S): flip rows so v = 0 is the floor, and mirror u so text reads left-to-right on every wall
  const col = new Uint8Array(S * S * 4), H = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const sy = S - 1 - y, sx = o.noMirror ? x : S - 1 - x, si = (sy * S + sx) * 4, di = (y * S + x) * 4;
    col[di] = A[si]; col[di + 1] = A[si + 1]; col[di + 2] = A[si + 2]; col[di + 3] = 255; H[y * S + x] = HH[si] / 255;
  }
  return { albedo: rawTex(col, S, scene), normal: rawTex(heightToNormal(H, S, nStr), S, scene) };
}
// draw fn at (x, y) and at its wrapped copies so the tile repeats seamlessly
function wrap18(W, S, x, y, r, fn) {
  for (const dx of [-W, 0, W]) for (const dy of [-S, 0, S]) { const X = x + dx, Y = y + dy; if (X > -r && X < W + r && Y > -r && Y < S + r) fn(X, Y); }
}
const R18 = mulberry32(1818);
const rr18 = (a, b) => a + R18() * (b - a);
function cloud18(c, x, y, s, col = '#f6f9fc', sh = 'rgba(120,160,200,0.35)') {
  const puffs = [[0, 0, 1], [-0.9, 0.25, 0.7], [0.9, 0.22, 0.75], [-0.45, -0.35, 0.72], [0.45, -0.4, 0.8], [1.5, 0.4, 0.5], [-1.5, 0.42, 0.48]];
  c.fillStyle = sh; for (const [px, py, pr] of puffs) { c.beginPath(); c.arc(x + px * s, y + py * s + s * 0.18, pr * s, 0, TAU); c.fill(); }
  c.fillStyle = col; for (const [px, py, pr] of puffs) { c.beginPath(); c.arc(x + px * s, y + py * s, pr * s, 0, TAU); c.fill(); }
}
function star18(c, x, y, r, col, pts = 5, rot = 0) {
  c.fillStyle = col; c.beginPath();
  for (let i = 0; i < pts * 2; i++) { const a = rot + i * Math.PI / pts - Math.PI / 2, q = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  c.closePath(); c.fill();
}
function moon18(c, x, y, r, col, bg) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = bg; c.beginPath(); c.arc(x + r * 0.45, y - r * 0.2, r * 0.85, 0, TAU); c.fill(); }
function balloon18(c, x, y, r, col) {
  c.strokeStyle = 'rgba(60,60,70,0.7)'; c.lineWidth = Math.max(1, r * 0.06); c.beginPath(); c.moveTo(x, y + r * 1.2); c.bezierCurveTo(x - r * 0.4, y + r * 1.8, x + r * 0.4, y + r * 2.3, x, y + r * 2.9); c.stroke();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r * 0.85, r * 1.1, 0, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(x - r * 0.15, y + r * 1.2); c.lineTo(x + r * 0.15, y + r * 1.2); c.lineTo(x, y + r * 1.05); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.45, r * 0.18, r * 0.3, -0.5, 0, TAU); c.fill();
}
function teddy18(c, x, y, r) {
  const B = '#b37a46', L = '#e2b98a';
  c.fillStyle = B; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * r * 0.72, y - r * 0.7, r * 0.36, 0, TAU); c.fill(); }
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.fillStyle = L; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * r * 0.72, y - r * 0.7, r * 0.18, 0, TAU); c.fill(); }
  c.beginPath(); c.ellipse(x, y + r * 0.35, r * 0.42, r * 0.32, 0, 0, TAU); c.fill();
  c.fillStyle = '#2a1a10'; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * r * 0.36, y - r * 0.15, r * 0.1, 0, TAU); c.fill(); }
  c.beginPath(); c.ellipse(x, y + r * 0.22, r * 0.14, r * 0.1, 0, 0, TAU); c.fill();
}
function duck18(c, x, y, r) {
  c.fillStyle = '#f4cf34'; c.beginPath(); c.ellipse(x, y + r * 0.35, r, r * 0.62, 0, 0, TAU); c.fill();
  c.beginPath(); c.arc(x + r * 0.55, y - r * 0.35, r * 0.48, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(x - r * 0.9, y + r * 0.1); c.lineTo(x - r * 1.35, y - r * 0.2); c.lineTo(x - r * 0.8, y + r * 0.45); c.fill();
  c.fillStyle = '#ef8a22'; c.beginPath(); c.ellipse(x + r * 1.08, y - r * 0.25, r * 0.3, r * 0.13, 0.1, 0, TAU); c.fill();
  c.fillStyle = '#1e1a14'; c.beginPath(); c.arc(x + r * 0.68, y - r * 0.45, r * 0.08, 0, TAU); c.fill();
  c.fillStyle = 'rgba(200,140,20,0.5)'; c.beginPath(); c.ellipse(x - r * 0.1, y + r * 0.3, r * 0.45, r * 0.25, -0.3, 0, TAU); c.fill();
}
function speckle18(c, W, S, n, cols, r0, r1) { for (let i = 0; i < n; i++) { c.fillStyle = cols[(R18() * cols.length) | 0]; c.fillRect(R18() * W, R18() * S, rr18(r0, r1), rr18(r0, r1)); } }
function noiseFill18(c, W, S, base, amp, cell = 4, seed = 1) {   // blotchy paint variation
  c.fillStyle = base; c.fillRect(0, 0, W, S);
  for (let y = 0; y < S; y += cell) for (let x = 0; x < W; x += cell) {
    const n = tfbm(x / W * 6, y / S * 6, 6, 3, seed) - 0.5; if (Math.abs(n) < 0.02) continue;
    c.fillStyle = n > 0 ? `rgba(255,255,255,${(n * amp).toFixed(3)})` : `rgba(0,0,0,${(-n * amp).toFixed(3)})`; c.fillRect(x, y, cell, cell);
  }
}
const TEX18 = {
  // preschool corridor: sky-blue nursery wallpaper (clouds, stars, moons, balloons, teddies, ducks); white base + crown. 2.85 m square tile.
  skyw: (sc, S) => canvasTex18(sc, S, 1.6, (c, W, H, h) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#79b8e2'); g.addColorStop(1, '#94cbee'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const top = H * 0.03, bot = H * (1 - 0.045), k = S / 512, bg = '#86c1e8';
    const cols = 6, rows = 6, cw = W / cols, ch = (bot - top) / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = (i + 0.5 + (j % 2) * 0.5) * cw + rr18(-8, 8) * k, y = top + (j + 0.5) * ch + rr18(-6, 6) * k, m = (i * 7 + j * 3 + ((R18() * 2) | 0)) % 6;
      wrap18(W, H, x, y, 40 * k, (X, Y) => {
        if (Y < top + 10 * k || Y > bot - 10 * k) return;
        if (m === 0) cloud18(c, X, Y, 13 * k); else if (m === 1) star18(c, X, Y, 12 * k, '#f7d64a', 5, 0.2);
        else if (m === 2) moon18(c, X, Y, 12 * k, '#f5e39a', bg); else if (m === 3) balloon18(c, X, Y - 8 * k, 10 * k, ['#e2483c', '#f3c230', '#57b45a', '#e87fb0'][(i + j) % 4]);
        else if (m === 4) teddy18(c, X, Y, 11 * k); else duck18(c, X, Y, 10 * k);
      });
    }
    for (let i = 0; i < 70; i++) { const x = R18() * W, y = top + R18() * (bot - top); star18(c, x, y, rr18(2, 4) * k, 'rgba(255,255,255,0.8)', 4, 0.4); }
    // baseboard + crown (white, a little raised)
    c.fillStyle = '#eef0ec'; c.fillRect(0, bot, W, H - bot); c.fillRect(0, 0, W, top);
    c.fillStyle = '#c9ccc6'; c.fillRect(0, bot, W, 2 * k); c.fillRect(0, top - 2 * k, W, 2 * k);
    h.fillStyle = '#b0b0b0'; h.fillRect(0, bot + 2 * k, W, H - bot); h.fillRect(0, 0, W, top - 2 * k);
    h.fillStyle = '#606060'; h.fillRect(0, bot, W, 2 * k);
    for (let x = 0; x < W; x += W / 4) { h.fillStyle = '#707070'; h.fillRect(x, top, 1, bot - top); }   // wallpaper seams
  }),
  // the yellow corridor: glossy egg-yolk paint over plaster panels, darker skirting. 2.4 m wide x 2.85 m.
  yelw: (sc, S) => canvasTex18(sc, S, 1.2, (c, W, H, h) => {
    noiseFill18(c, W, H, '#e7c431', 0.25, 4, 1801);
    const k = S / 512, bot = H * (1 - 0.035);
    c.fillStyle = '#b8931a'; c.fillRect(0, bot, W, H - bot);
    for (const x of [0, W / 2]) { c.fillStyle = 'rgba(120,90,10,0.35)'; c.fillRect(x, 0, 2 * k, bot); h.fillStyle = '#5a5a5a'; h.fillRect(x, 0, 2 * k, bot); }
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, H * 0.62, W, 3 * k);
    h.fillStyle = '#a0a0a0'; h.fillRect(0, bot, W, H - bot);
  }),
  // the playland mural: purple wainscot, painted sky with balloons and clouds, a 1-10 number frieze. 9 m x 4.2 m, S = 1024.
  mural: (sc, S) => canvasTex18(sc, S, 1.0, (c, W, H, h) => {
    const y = m => H - m / 4.2 * H, k = S / 1024;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2d5d9a'); g.addColorStop(0.45, '#6aa9dc'); g.addColorStop(1, '#a9d6f2'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) wrap18(W, H, (i + 0.3 + R18() * 0.4) * W / 9, y(rr18(3.2, 3.9)), 60 * k, (X, Y) => cloud18(c, X, Y, 16 * k));
    for (let i = 0; i < 40; i++) star18(c, R18() * W, y(rr18(3.4, 4.15)), rr18(3, 6) * k, '#f5e27a', 5, R18());
    for (let i = 0; i < 14; i++) wrap18(W, H, R18() * W, y(rr18(1.5, 2.05)), 50 * k, (X, Y) => balloon18(c, X, Y, rr18(12, 17) * k, ['#e2483c', '#f3c230', '#57b45a', '#e87fb0', '#8a5cc8', '#3f8fe0'][i % 6]));
    for (let i = 0; i < 6; i++) wrap18(W, H, (i + 0.5) * W / 6 + 40 * k, y(1.35), 60 * k, (X, Y) => cloud18(c, X, Y, 12 * k));
    // frieze: 10 coloured discs with the numbers
    const fy0 = y(2.95), fy1 = y(2.25);
    c.fillStyle = '#f4f0e6'; c.fillRect(0, fy0, W, fy1 - fy0);
    c.fillStyle = '#d74a3c'; c.fillRect(0, fy0, W, 5 * k); c.fillRect(0, fy1 - 5 * k, W, 5 * k);
    const NC = ['#e2483c', '#f08a24', '#f3c230', '#57b45a', '#2fa3a0', '#3f8fe0', '#6b5cd0', '#b55cc8', '#e87fb0', '#8a6a44'];
    for (let i = 0; i < 10; i++) {
      const cx = (i + 0.5) * W / 10, cy = (fy0 + fy1) / 2, r = (fy1 - fy0) * 0.4;
      c.fillStyle = NC[i]; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
      c.fillStyle = '#ffffff'; c.font = `bold ${Math.round(r * 1.25)}px "Comic Sans MS", "Trebuchet MS", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i + 1), cx, cy + r * 0.06);
      h.fillStyle = '#9a9a9a'; h.beginPath(); h.arc(cx, cy, r, 0, TAU); h.fill();
    }
    // wainscot: lilac with a white rail and polka dots
    const wy = y(1.1); c.fillStyle = '#9b7cc6'; c.fillRect(0, wy, W, H - wy);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.arc((i + (j % 2) * 0.5) * W / 40, wy + (j + 0.6) * (H - wy) / 4.4, 6 * k, 0, TAU); c.fill(); }
    c.fillStyle = '#f4f0e6'; c.fillRect(0, wy - 8 * k, W, 12 * k); h.fillStyle = '#b8b8b8'; h.fillRect(0, wy - 8 * k, W, 12 * k);
    c.fillStyle = '#5b4a7a'; c.fillRect(0, H - 10 * k, W, 10 * k);
  }),
  // the meadow room: a painted sky over rolling hills, a rainbow, a tree. 7.2 m x 3.4 m, S = 1024.
  meadow: (sc, S) => canvasTex18(sc, S, 0.8, (c, W, H, h) => {
    const y = m => H - m / 3.4 * H, k = S / 1024;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4f98d8'); g.addColorStop(0.7, '#a5d3f0'); g.addColorStop(1, '#dff0f7'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    // rainbow
    const RB = ['#e2483c', '#f08a24', '#f3c230', '#57b45a', '#3f8fe0', '#6b5cd0'];
    RB.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 14 * k; c.beginPath(); c.arc(W * 0.3, y(0.9), W * 0.2 - i * 14 * k, Math.PI, TAU); c.stroke(); });
    // sun
    c.fillStyle = '#f7d64a'; c.beginPath(); c.arc(W * 0.78, y(2.75), 40 * k, 0, TAU); c.fill();
    c.strokeStyle = '#f7d64a'; c.lineWidth = 6 * k; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.moveTo(W * 0.78 + Math.cos(a) * 52 * k, y(2.75) + Math.sin(a) * 52 * k); c.lineTo(W * 0.78 + Math.cos(a) * 70 * k, y(2.75) + Math.sin(a) * 70 * k); c.stroke(); }
    for (let i = 0; i < 7; i++) wrap18(W, H, (i + 0.5) * W / 7 + rr18(-30, 30) * k, y(rr18(2.2, 3.1)), 70 * k, (X, Y) => cloud18(c, X, Y, rr18(16, 22) * k));
    // hills (periodic in x)
    const hill = (base, amp, f, ph, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 4) c.lineTo(x, y(base + amp * Math.sin(x / W * TAU * f + ph) + amp * 0.4 * Math.sin(x / W * TAU * (f * 2 + 1) + ph * 2))); c.lineTo(W, H); c.fill(); };
    hill(1.2, 0.22, 2, 0.5, '#7cc257'); hill(0.85, 0.2, 3, 2.1, '#5eaa45'); hill(0.45, 0.12, 4, 4.0, '#48913a');
    // tree
    const tx = W * 0.58; c.fillStyle = '#7a4e2a'; c.fillRect(tx - 12 * k, y(1.9), 24 * k, y(0.6) - y(1.9));
    c.fillStyle = '#3d8a34'; for (const [dx, dy, r] of [[0, 2.25, 58], [-44, 2.0, 44], [44, 2.02, 46], [-20, 2.5, 40], [24, 2.48, 42]]) { c.beginPath(); c.arc(tx + dx * k, y(dy), r * k, 0, TAU); c.fill(); }
    c.fillStyle = '#e2483c'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(tx + rr18(-60, 60) * k, y(rr18(1.95, 2.55)), 5 * k, 0, TAU); c.fill(); }
    // flowers + grass tufts
    for (let i = 0; i < 160; i++) { const x = R18() * W, yy = y(rr18(0.05, 0.75)); c.fillStyle = ['#ffffff', '#f3c230', '#e87fb0', '#e2483c', '#b9a7ee'][i % 5]; c.beginPath(); c.arc(x, yy, rr18(2.5, 4.5) * k, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(30,80,20,0.5)'; c.lineWidth = 1.5 * k; for (let i = 0; i < 500; i++) { const x = R18() * W, yy = y(rr18(0.0, 0.9)); c.beginPath(); c.moveTo(x, yy); c.lineTo(x + rr18(-3, 3) * k, yy - rr18(5, 11) * k); c.stroke(); }
  }),
  // the slide hall: dark teal paint, a yellow and a red stripe at hand height
  teal: (sc, S) => canvasTex18(sc, S, 1.4, (c, W, H, h) => {
    noiseFill18(c, W, H, '#1c5a5e', 0.35, 4, 1811);
    const y = m => H - m / 2.85 * H, k = S / 512;
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, y(1.0), W, H - y(1.0));
    c.fillStyle = '#e3b834'; c.fillRect(0, y(1.08), W, 7 * k); c.fillStyle = '#c9463b'; c.fillRect(0, y(1.0), W, 7 * k);
    c.fillStyle = '#0f3437'; c.fillRect(0, y(0.1), W, H - y(0.1));
    for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(0,0,0,${rr18(0.05, 0.18).toFixed(2)})`; c.fillRect(R18() * W, y(rr18(0.15, 0.9)), rr18(8, 40) * k, rr18(1, 3) * k); }   // scuffs
    h.fillStyle = '#a0a0a0'; h.fillRect(0, y(0.1), W, H - y(0.1));
  }),
  // a childhood bedroom: pale blue paper with rockets, planets and stars above a striped dado and a border
  bedw: (sc, S) => canvasTex18(sc, S, 1.2, (c, W, H, h) => {
    const y = m => H - m / 2.6 * H, k = S / 512;
    c.fillStyle = '#cfe0f0'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) {
      const x = R18() * W, yy = y(rr18(1.15, 2.5)), m = i % 3;
      wrap18(W, H, x, yy, 30 * k, (X, Y) => {
        if (m === 0) star18(c, X, Y, 8 * k, '#f3c230', 5, R18());
        else if (m === 1) { c.fillStyle = ['#e2483c', '#57b45a', '#8a5cc8'][i % 3]; c.beginPath(); c.arc(X, Y, 10 * k, 0, TAU); c.fill(); c.strokeStyle = '#f3c230'; c.lineWidth = 2.5 * k; c.beginPath(); c.ellipse(X, Y, 17 * k, 5 * k, -0.3, 0, TAU); c.stroke(); }
        else { c.save(); c.translate(X, Y); c.rotate(-0.6); c.fillStyle = '#f4f4f4'; c.fillRect(-5 * k, -14 * k, 10 * k, 24 * k); c.fillStyle = '#e2483c'; c.beginPath(); c.moveTo(-5 * k, -14 * k); c.lineTo(0, -24 * k); c.lineTo(5 * k, -14 * k); c.fill(); c.fillRect(-9 * k, 4 * k, 4 * k, 8 * k); c.fillRect(5 * k, 4 * k, 4 * k, 8 * k); c.fillStyle = '#3f8fe0'; c.beginPath(); c.arc(0, -5 * k, 3 * k, 0, TAU); c.fill(); c.fillStyle = '#f08a24'; c.beginPath(); c.moveTo(-4 * k, 10 * k); c.lineTo(0, 18 * k); c.lineTo(4 * k, 10 * k); c.fill(); c.restore(); }
      });
    }
    c.fillStyle = '#f4f0e6'; c.fillRect(0, y(1.05), W, 10 * k); c.fillStyle = '#3f8fe0'; c.fillRect(0, y(1.05) + 3 * k, W, 3 * k);
    for (let x = 0; x < W; x += 16 * k) { c.fillStyle = (x / (16 * k)) % 2 ? '#a9c6e6' : '#bcd4ee'; c.fillRect(x, y(1.0), 16 * k, y(0.1) - y(1.0)); }
    c.fillStyle = '#f4f0e6'; c.fillRect(0, y(0.1), W, H - y(0.1));
    h.fillStyle = '#b0b0b0'; h.fillRect(0, y(1.05), W, 10 * k); h.fillRect(0, y(0.1), W, H - y(0.1));
  }),
  // an old kitchen: 70s orange flower paper over wood-grain panelling
  kitw: (sc, S) => canvasTex18(sc, S, 1.2, (c, W, H, h) => {
    const y = m => H - m / 2.6 * H, k = S / 512;
    c.fillStyle = '#efe2c2'; c.fillRect(0, 0, W, H);
    for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) wrap18(W, H, (i + 0.5 + (j % 2) * 0.5) * W / 5, y(1.0) * (j + 0.5) / 5, 40 * k, (X, Y) => {
      for (let p = 0; p < 6; p++) { const a = p / 6 * TAU; c.fillStyle = '#d9772b'; c.beginPath(); c.ellipse(X + Math.cos(a) * 14 * k, Y + Math.sin(a) * 14 * k, 10 * k, 6 * k, a, 0, TAU); c.fill(); }
      c.fillStyle = '#8a4a1c'; c.beginPath(); c.arc(X, Y, 8 * k, 0, TAU); c.fill(); c.fillStyle = '#e8b64a'; c.beginPath(); c.arc(X, Y, 4 * k, 0, TAU); c.fill();
    });
    for (let x = 0; x < W; x += 1) { const g = tfbm(x / W * 30, 0.5, 30, 3, 1821); c.fillStyle = `rgb(${(90 + g * 60) | 0},${(56 + g * 36) | 0},${(28 + g * 18) | 0})`; c.fillRect(x, y(0.95), 1, H - y(0.95)); }
    for (let x = 0; x < W; x += W / 8) { c.fillStyle = 'rgba(20,10,0,0.6)'; c.fillRect(x, y(0.95), 2 * k, H - y(0.95)); h.fillStyle = '#505050'; h.fillRect(x, y(0.95), 2 * k, H - y(0.95)); }
    c.fillStyle = '#6a4020'; c.fillRect(0, y(0.99), W, 8 * k);
  }),
  // the void: almost black, with a child's scribbles fading into it
  voidw: (sc, S) => canvasTex18(sc, S, 0.4, (c, W, H, h) => {
    c.fillStyle = '#060608'; c.fillRect(0, 0, W, H); const k = S / 512;
    for (let i = 0; i < 18; i++) {
      c.strokeStyle = ['rgba(90,60,60,0.35)', 'rgba(60,70,100,0.35)', 'rgba(80,80,60,0.3)', 'rgba(70,90,70,0.3)'][i % 4]; c.lineWidth = rr18(2, 4) * k;
      let x = R18() * W, yy = rr18(0.3, 0.9) * H; c.beginPath(); c.moveTo(x, yy);
      for (let s = 0; s < 30; s++) { x += rr18(-14, 14) * k; yy += rr18(-10, 10) * k; c.lineTo(x, yy); } c.stroke();
    }
  }),
  // floors -----------------------------------------------------------------------------------------------
  // glossy cream vinyl tiles, 0.3 m, a few pale-grey ones (1.2 m tile)
  ktile: (sc, S) => genTex9(sc, S, 1.2, (u, v, x, y, o) => {
    const ti = Math.floor(u * 4), tj = Math.floor(v * 4), tu = (u * 4) % 1, tv = (v * 4) % 1, gr = Math.min(tu, 1 - tu, tv, 1 - tv) < 0.012;
    const th = h2i(ti, tj, 1831), n = tfbm(u * 12, v * 12, 12, 3, 1832), sp = h2i(x, y, 1833);
    let r = 0.9, g = 0.86, b = 0.74; if (th < 0.18) { r = 0.8; g = 0.79; b = 0.74; }
    const k = 0.95 + 0.08 * n + (sp > 0.985 ? -0.25 : sp < 0.012 ? 0.08 : 0);
    if (gr) { o[0] = 0.55; o[1] = 0.52; o[2] = 0.45; o[3] = 0.2; return; }
    o[0] = r * k; o[1] = g * k; o[2] = b * k; o[3] = 0.7 + n * 0.1;
  }),
  // arcade-style kids' carpet: bright shapes on navy (2.4 m)
  kcarpet: (sc, S) => canvasTex18(sc, S, 1.0, (c, W, H, h) => {
    c.fillStyle = '#1b2244'; c.fillRect(0, 0, W, H); const k = S / 512, P = ['#e2483c', '#f3c230', '#57b45a', '#3f8fe0', '#e87fb0', '#f08a24', '#b55cc8'];
    for (let i = 0; i < 90; i++) {
      const x = R18() * W, yy = R18() * H, m = i % 5, col = P[i % P.length], rot = R18() * TAU, s = rr18(9, 16) * k;
      wrap18(W, H, x, yy, 30 * k, (X, Y) => {
        c.save(); c.translate(X, Y); c.rotate(rot); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 3.5 * k;
        if (m === 0) { c.beginPath(); c.arc(0, 0, s * 0.6, 0, TAU); c.fill(); }
        else if (m === 1) { c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.9, s * 0.6); c.lineTo(-s * 0.9, s * 0.6); c.closePath(); c.fill(); }
        else if (m === 2) { c.beginPath(); c.moveTo(-s, 0); for (let q = 0; q < 5; q++) c.lineTo(-s + (q + 1) * s * 0.4, q % 2 ? 0 : -s * 0.5); c.stroke(); }
        else if (m === 3) star18(c, 0, 0, s * 0.8, col, 5, 0);
        else { c.beginPath(); c.arc(0, 0, s * 0.7, 0.2, Math.PI - 0.2); c.stroke(); }
        c.restore();
      });
    }
    speckle18(c, W, H, 3000, ['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.2)'], 1, 2);
    h.fillStyle = '#808080';
  }),
  // green artificial turf (2 m)
  turf: (sc, S) => genTex9(sc, S, 1.6, (u, v, x, y, o) => {
    const bl = h2i(x, y, 1841), bl2 = h2i(x >> 1, (y + 3) >> 1, 1842), n = tfbm(u * 5, v * 5, 5, 3, 1843), b = 0.62 + bl * 0.3 + bl2 * 0.18 + n * 0.2;
    o[0] = 0.2 * b; o[1] = 0.52 * b; o[2] = 0.16 * b; o[3] = bl * 0.7 + bl2 * 0.3;
  }),
  // grey carpet tiles (2.4 m, 0.6 m squares with alternating pile)
  gcarpet: (sc, S) => genTex9(sc, S, 1.3, (u, v, x, y, o) => {
    const ti = Math.floor(u * 4), tj = Math.floor(v * 4), tu = (u * 4) % 1, tv = (v * 4) % 1, seam = Math.min(tu, 1 - tu, tv, 1 - tv) < 0.008;
    const pile = h2i(x, y, 1851), n = tfbm(u * 10, v * 10, 10, 3, 1852), dir = (ti + tj) % 2 ? Math.sin(u * 900) : Math.sin(v * 900);
    const b = (0.44 + 0.06 * dir + 0.1 * pile + 0.08 * n) * (seam ? 0.7 : 1); o[0] = b; o[1] = b * 1.01; o[2] = b * 1.04; o[3] = pile * 0.6 + n * 0.3;
  }),
  // yellow / white checker linoleum (1.2 m)
  lino: (sc, S) => genTex9(sc, S, 0.8, (u, v, x, y, o) => {
    const ti = Math.floor(u * 4), tj = Math.floor(v * 4), n = tfbm(u * 8, v * 8, 8, 3, 1861), w = (ti + tj) % 2;
    const k = 0.9 + 0.12 * n; if (w) { o[0] = 0.92 * k; o[1] = 0.9 * k; o[2] = 0.82 * k; } else { o[0] = 0.86 * k; o[1] = 0.7 * k; o[2] = 0.28 * k; } o[3] = 0.5;
  }),
  // black floor of the void: faint noise so the flashlight has something to find (4 m)
  voidf: (sc, S) => genTex9(sc, S, 0.8, (u, v, x, y, o) => { const n = tfbm(u * 6, v * 6, 6, 4, 1871), g = h2i(x, y, 1872); const b = 0.03 + 0.04 * n + 0.015 * g; o[0] = b; o[1] = b; o[2] = b * 1.15; o[3] = n; }),
  // ceilings -------------------------------------------------------------------------------------------
  // white drop ceiling, 0.6 m acoustic tiles in a T-bar grid (1.2 m tile)
  dceil: (sc, S) => genTex9(sc, S, 2.0, (u, v, x, y, o) => {
    const tu = (u * 2) % 1, tv = (v * 2) % 1, eg = Math.min(tu, 1 - tu, tv, 1 - tv), fis = tfbm(u * 26, v * 26, 26, 3, 1881), fn = h2i(x, y, 1882), pin = h2i(x >> 1, y >> 1, 1883);
    if (eg < 0.012) { o[0] = 0.86; o[1] = 0.86; o[2] = 0.84; o[3] = 1; return; }
    let b = 0.9 + (fn - 0.5) * 0.06 - (Math.abs(fis - 0.5) < 0.02 ? 0.12 : 0) - (pin > 0.982 ? 0.22 : 0); b *= 0.85 + 0.15 * smooth(0.012, 0.035, eg);
    o[0] = b; o[1] = b; o[2] = b * 0.97; o[3] = 0.6 - 0.3 * smooth(0.012, 0.035, eg) + (fn - 0.5) * 0.05;
  }),
  // painted sky ceiling with clouds (meadow)
  skyc: (sc, S) => canvasTex18(sc, S, 0.4, (c, W, H) => {
    c.fillStyle = '#73b4e6'; c.fillRect(0, 0, W, H); const k = S / 512;
    for (let i = 0; i < 7; i++) wrap18(W, H, R18() * W, R18() * H, 60 * k, (X, Y) => cloud18(c, X, Y, rr18(14, 22) * k, '#f4f8fb', 'rgba(90,140,190,0.25)'));
  }),
  // night-blue bedroom ceiling with glow-in-the-dark stars
  starc: (sc, S) => canvasTex18(sc, S, 0.3, (c, W, H) => {
    c.fillStyle = '#26345a'; c.fillRect(0, 0, W, H); const k = S / 512;
    for (let i = 0; i < 26; i++) wrap18(W, H, R18() * W, R18() * H, 20 * k, (X, Y) => star18(c, X, Y, rr18(6, 11) * k, '#c8f59a', 5, R18()));
    moon18(c, W * 0.3, H * 0.4, 20 * k, '#d8f7b0', '#26345a');
  }),
};

// ----- crayon drawing helpers (for the drawings, the notes, the signs) -----
function crayonLine18(c, pts, col, w, passes = 3) {
  c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
  for (let p = 0; p < passes; p++) {
    c.globalAlpha = 0.55 + 0.2 * p / passes; c.lineWidth = w * (0.7 + 0.5 * Math.random()); c.beginPath();
    pts.forEach(([x, y], i) => { const jx = x + (Math.random() - 0.5) * w * 0.8, jy = y + (Math.random() - 0.5) * w * 0.8; i ? c.lineTo(jx, jy) : c.moveTo(jx, jy); }); c.stroke();
  }
  c.globalAlpha = 1;
}
function crayonFill18(c, x0, y0, x1, y1, col, w, inside) {   // zig-zag scribble fill clipped to an optional shape test
  c.strokeStyle = col; c.lineWidth = w; c.globalAlpha = 0.6; c.beginPath(); let first = true;
  for (let y = y0; y < y1; y += w * 0.8) {
    for (const x of [x0, x1]) { const px = x + (Math.random() - 0.5) * w * 2, py = y + (Math.random() - 0.5) * w; if (inside && !inside(px, py)) continue; first ? c.moveTo(px, py) : c.lineTo(px, py); first = false; }
  }
  c.stroke(); c.globalAlpha = 1;
}
function crayonCircle18(c, x, y, r, col, w, fill) {
  const pts = []; for (let i = 0; i <= 26; i++) { const a = i / 24 * TAU; pts.push([x + Math.cos(a) * r * (1 + (Math.random() - 0.5) * 0.08), y + Math.sin(a) * r * (1 + (Math.random() - 0.5) * 0.08)]); }
  if (fill) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); crayonFill18(c, x - r, y - r, x + r, y + r, fill, w * 1.2); c.restore(); }
  crayonLine18(c, pts, col, w);
}
function crayonText18(c, txt, x, y, px, col, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.font = `bold ${px}px "Comic Sans MS", "Trebuchet MS", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = col; for (let i = 0; i < 3; i++) { c.globalAlpha = 0.5; c.fillText(txt, (Math.random() - 0.5) * px * 0.06, (Math.random() - 0.5) * px * 0.06); }
  c.globalAlpha = 1; c.restore();
}
function paper18(c, w, h, tint = '#f6f1e2') {
  c.fillStyle = tint; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(120,100,70,${(Math.random() * 0.05).toFixed(3)})`; c.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 2 + Math.random() * 6); }
  c.strokeStyle = 'rgba(120,100,70,0.3)'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2);
}
function stick18(c, x, y, s, col, o = {}) {   // a stick figure: head at (x, y)
  crayonCircle18(c, x, y, s * 0.28, col, s * 0.06, o.face || null);
  if (o.hair) crayonLine18(c, [[x - s * 0.25, y - s * 0.12], [x - s * 0.1, y - s * 0.34], [x + s * 0.12, y - s * 0.34], [x + s * 0.26, y - s * 0.1]], o.hair, s * 0.08);
  c.fillStyle = '#222'; c.fillRect(x - s * 0.12, y - s * 0.05, s * 0.05, s * 0.05); c.fillRect(x + s * 0.07, y - s * 0.05, s * 0.05, s * 0.05);
  crayonLine18(c, [[x - s * 0.12, y + s * 0.1], [x, y + s * 0.16], [x + s * 0.12, y + s * 0.1]], '#c33', s * 0.035, 2);
  if (o.dress) { c.save(); c.beginPath(); c.moveTo(x, y + s * 0.28); c.lineTo(x - s * 0.35, y + s * 1.0); c.lineTo(x + s * 0.35, y + s * 1.0); c.closePath(); c.clip(); crayonFill18(c, x - s * 0.4, y + s * 0.28, x + s * 0.4, y + s, o.dress, s * 0.07); c.restore(); crayonLine18(c, [[x, y + s * 0.28], [x - s * 0.35, y + s], [x + s * 0.35, y + s], [x, y + s * 0.28]], o.dress, s * 0.05); }
  else crayonLine18(c, [[x, y + s * 0.28], [x, y + s]], col, s * 0.06);
  crayonLine18(c, [[x - s * 0.45, y + s * 0.45], [x, y + s * 0.5], [x + s * 0.45, y + s * 0.4]], col, s * 0.06);
  crayonLine18(c, [[x - s * 0.3, y + s * 1.55], [x, y + s * 1.0], [x + s * 0.3, y + s * 1.55]], col, s * 0.06);
}
