// ---------- r10.2 · route guidance: the compass mark and the floor arrows follow the walkable map, not a straight line ----------
// A fine walk grid (NAV.res m) is rasterised from the collision boxes. A distance field is grown out from the objective, through
// openable doors, ladders, stairs, slides and portals (per-level links). The compass mark points at the farthest point along that
// route the player can see in a straight line, so it leads round walls and down the corridor that actually gets there.
// If the objective is behind a locked door or gate, the route leads to that door; if it can't be reached at all, to the nearest place that can.
const NAV = { res: 0.4, n: 0, blk: null, scn: null, lvl: -1, sig: '', links: null, linkB: null, linkA: null, F: null, pass: 'A', key: '', tgt: null, rebuildT: 0, calcT: 0, wp: null, wpT: 0, metres: -1, last: null };
const NAV_R = 0.22;   // clearance used for the walk grid (the player's own radius is 0.28; a little lenient so narrow doorways still connect)
const NAVD = [[1, 0, 5], [-1, 0, 5], [0, 1, 5], [0, -1, 5], [1, 1, 7], [1, -1, 7], [-1, 1, 7], [-1, -1, 7]], NAV_LINK = 12;
function navOn() { return [0, 9, 5, 18, 37, 2, 7].includes(LVL) && !!LV.solids; }
// what each solid is to the walker: 1 wall/prop, 2 a door you can open, 3 a door or gate that is locked for now
function navDoorMap() {
  const m = new Map(); if (LVL === 0 || !W9 || !W9.doors) return m;
  for (const d of W9.doors) if (d.solid !== undefined && d.solid >= 0) m.set(d.solid, d);
  return m;
}
const NAV_GATES = new Set(['gate', 'liftgate', 'cage', 'cell', 'elev', 'sluice', 'stair']);
function navSig() {
  const S = LV.solids; let h = S.length * 7919;
  for (let i = 0; i < S.length; i++) if (S[i].off) h = (h * 31 + i + 1) | 0;
  if (LVL !== 0 && W9 && W9.doors) for (const d of W9.doors) if (d.locked || d.jammed) h = (h * 17 + d.solid + 3) | 0;
  if (LVL === 37 && typeof G37 !== 'undefined' && G37.onTower) h ^= 0x5a5a;
  return LVL + ':' + h + ':' + (LV.navVer || 0);
}
function navBuild() {
  const res = NAV.res, n = Math.ceil(LEVEL / res), blk = new Uint8Array(n * n), dm = navDoorMap();
  for (let i = 0; i < n; i++) { blk[i] = blk[(n - 1) * n + i] = blk[i * n] = blk[i * n + n - 1] = 1; }
  const S = LV.solids;
  for (let si = 0; si < S.length; si++) {
    const s = S[si], dr = dm.get(si); let v;
    if (dr) v = dr.locked || dr.jammed ? 3 : 2;
    else if (s.off) continue;
    else v = NAV_GATES.has(s.tag) ? 3 : 1;
    const i0 = Math.max(0, Math.floor((s.x0 - NAV_R) / res - 0.5)), i1 = Math.min(n - 1, Math.ceil((s.x1 + NAV_R) / res - 0.5)), j0 = Math.max(0, Math.floor((s.z0 - NAV_R) / res - 0.5)), j1 = Math.min(n - 1, Math.ceil((s.z1 + NAV_R) / res - 0.5));
    for (let j = j0; j <= j1; j++) { const z = (j + 0.5) * res, cz = clamp(z, s.z0, s.z1); for (let i = i0; i <= i1; i++) {
      const x = (i + 0.5) * res, cx = clamp(x, s.x0, s.x1); if ((x - cx) ** 2 + (z - cz) ** 2 >= NAV_R * NAV_R) continue;
      const k = j * n + i, o = blk[k]; if (o === 1 || v === 1) blk[k] = 1; else if (o === 0 || v > o) blk[k] = v; } }
  }
  Object.assign(NAV, { n, blk, lvl: LVL, scn: SCN, F: null, key: '' });
  navMakeLinks();
}
// per-level links: standing at a takes you to b (a fade, a climb, a slide, a portal)
function navMakeLinks() {
  const L = [], add = (ax, az, bx, bz, two) => { L.push([ax, az, bx, bz]); if (two) L.push([bx, bz, ax, az]); };
  try {
    if (LVL === 7 && WS7.ladders) for (const l of WS7.ladders) add(l.wx, l.wz, l.dx, l.dz, true);
    if (LVL === 37 && W37.tower && W37.pos && W37.pos.towerBase) { const T = W37.tower; add(W37.pos.towerBase.x, W37.pos.towerBase.z, T.cx, T.cz); add(T.cx, T.cz, T.cx + CELL / 2 + 0.7, T.cz); }
    if (LVL === 18 && W18.slides) for (const S of W18.slides) { const t = SLIDE_TO18[S.to] && SLIDE_TO18[S.to](); if (t) add(S.x, S.z, t.x, t.z); }
    if (LVL === 5) {
      if (typeof PORT5 !== 'undefined') for (const P of PORT5.list) { const v = P.v, X = P.X, b = X.map(X.ax + v.fx * 0.9, X.az + v.fz * 0.9); add(X.ax - v.fx * 0.8, X.az - v.fz * 0.8, b[0], b[1]); }
      const s = LV.svStair, a = LV.arrive5; if (s && a) { add(cellCenter(s.x), s.y * CELL + 1.8, cellCenter(a.x), a.y * CELL + 2.5); add(cellCenter(a.x), a.y * CELL + 1.2, cellCenter(s.x), s.y * CELL - 0.8); }
    }
    if (LVL === 9) {
      for (const h of LV.houses || []) if (h.stair) { const s = h.stair, mid = r => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2], g = mid(s.gTrig), u = mid(s.uTrig); add(g[0], g[1], s.uArr.x, s.uArr.z); add(u[0], u[1], s.gArr.x, s.gArr.z); }
      if (LV.base && LV.lab) { add(cellCenter(LV.base.stair.x), LV.base.stair.y * CELL + 1.6, (LAB_X + 2.5) * CELL, 2.65); add(cellCenter(LV.lab.arrive.x), 0.8, 25.5 * CELL, 19.45 * CELL); }
    }
  } catch (e) { if (typeof frameErr === 'function') frameErr('navLinks', e); }
  const linkB = new Map(), linkA = new Map();
  for (const [ax, az, bx, bz] of L) {
    const a = navSnap(ax, az, 'B', 6), b = navSnap(bx, bz, 'B', 6); if (a < 0 || b < 0) continue;
    if (!linkB.has(b)) linkB.set(b, []); linkB.get(b).push(a);
    if (!linkA.has(a)) linkA.set(a, []); linkA.get(a).push(b);
  }
  Object.assign(NAV, { links: L, linkB, linkA });
}
const navIdx = (x, z) => { const n = NAV.n, i = clamp(Math.floor(x / NAV.res), 0, n - 1), j = clamp(Math.floor(z / NAV.res), 0, n - 1); return j * n + i; };
const navX = k => (k % NAV.n + 0.5) * NAV.res, navZ = k => (((k / NAV.n) | 0) + 0.5) * NAV.res;
function navFree(k, pass) { const v = NAV.blk[k]; return v === 0 || v === 2 || (v === 3 && pass !== 'A'); }
// the nearest walkable node to a point (rings out to r nodes)
function navSnap(x, z, pass, r = 4) {
  const n = NAV.n, k0 = navIdx(x, z); if (navFree(k0, pass)) return k0;
  const i0 = k0 % n, j0 = (k0 / n) | 0; let best = -1, bd = 1e9;
  for (let d = 1; d <= r; d++) { for (let j = j0 - d; j <= j0 + d; j++) for (let i = i0 - d; i <= i0 + d; i++) {
    if (Math.max(Math.abs(i - i0), Math.abs(j - j0)) !== d || i < 0 || j < 0 || i >= n || j >= n) continue;
    const k = j * n + i; if (!navFree(k, pass)) continue; const dd = (i - i0) ** 2 + (j - j0) ** 2; if (dd < bd) { bd = dd; best = k; } }
    if (best >= 0) return best; }
  return -1;
}
// Dijkstra on small integer costs (5 straight, 7 diagonal, links 12) with a ring of buckets
function navField(seeds, pass, rev = false) {
  const n = NAV.n, N2 = n * n, D = new Int32Array(N2).fill(-1), blk = NAV.blk, RING = 16, lim = pass === 'A' ? 2 : 3;
  const free = new Uint8Array(N2); for (let k = 0; k < N2; k++) { const v = blk[k]; free[k] = v === 0 || v === 2 || (v === 3 && lim === 3) ? 1 : 0; }
  const B = Array.from({ length: RING }, () => new Int32Array(1024)), BL = new Int32Array(RING);
  const push = (b, k) => { let a = B[b]; if (BL[b] >= a.length) { const g = new Int32Array(a.length * 2); g.set(a); B[b] = a = g; } a[BL[b]++] = k; };
  let pending = 0;
  for (const k of seeds) if (k >= 0 && D[k] < 0) { D[k] = 0; push(0, k); pending++; }
  const LK = rev ? NAV.linkA : NAV.linkB, OFF = [1, -1, n, -n], DG = [n + 1, n - 1, -n + 1, -n - 1], DGa = [1, -1, 1, -1], DGb = [n, n, -n, -n];
  const cur = new Int32Array(0); let work = new Int32Array(1024);
  for (let d = 0; pending > 0; d++) {
    const b = d % RING, cnt = BL[b]; if (!cnt) continue;
    if (work.length < cnt) work = new Int32Array(cnt * 2); work.set(B[b].subarray(0, cnt)); BL[b] = 0;
    for (let q = 0; q < cnt; q++) {
      const k = work[q]; pending--; if (D[k] !== d) continue;
      const i = k % n;
      for (let o = 0; o < 4; o++) {   // straight
        if ((o === 0 && i === n - 1) || (o === 1 && i === 0)) continue;
        const nk = k + OFF[o]; if (nk < 0 || nk >= N2 || !free[nk]) continue; const nd = d + 5; const dv = D[nk]; if (dv >= 0 && dv <= nd) continue; D[nk] = nd; push(nd % RING, nk); pending++;
      }
      for (let o = 0; o < 4; o++) {   // diagonal, no corner cutting
        if ((DGa[o] === 1 && i === n - 1) || (DGa[o] === -1 && i === 0)) continue;
        const nk = k + DG[o]; if (nk < 0 || nk >= N2 || !free[nk] || !free[k + DGa[o]] || !free[k + DGb[o]]) continue; const nd = d + 7; const dv = D[nk]; if (dv >= 0 && dv <= nd) continue; D[nk] = nd; push(nd % RING, nk); pending++;
      }
      if (LK) { const ls = LK.get(k); if (ls) for (const a of ls) { const nd = d + NAV_LINK; if (D[a] >= 0 && D[a] <= nd) continue; D[a] = nd; push(nd % RING, a); pending++; } }
    }
  }
  return D;
}
// straight walkable line between two nodes (no wall, no locked door, no corner cut)
function navLine(a, b, pass) {
  const ax = navX(a), az = navZ(a), bx = navX(b), bz = navZ(b), d = Math.hypot(bx - ax, bz - az), m = Math.ceil(d / (NAV.res * 0.5));
  for (let s = 1; s < m; s++) { const t = s / m; if (!navFree(navIdx(ax + (bx - ax) * t, az + (bz - az) * t), pass)) return false; }
  return true;
}
// is node k on the target's own side of any wall? (the first 0.45 m from the target are ignored: it is usually mounted on that wall)
function navReach(x, z, k) {
  const bx = navX(k), bz = navZ(k), d = Math.hypot(bx - x, bz - z), m = Math.ceil(d / (NAV.res * 0.5));
  for (let s = 1; s < m; s++) { const t = s / m; if (d * t < 0.45) continue; if (NAV.blk[navIdx(x + (bx - x) * t, z + (bz - z) * t)] === 1) return false; }
  return true;
}
// (re)compute the field toward a target point
function navTarget(tg) {
  const now = FX.t;
  if (NAV.scn !== SCN || NAV.lvl !== LVL || !NAV.blk) { navBuild(); NAV.sigT = 0; NAV.sig = navSig(); }
  if ((NAV.sigT = (NAV.sigT || 0) - 1) <= 0) { NAV.sigT = 20; const s = navSig(); if (s !== NAV.sig) { NAV.sig = s; navBuild(); } }
  const moved = !NAV.tgt || Math.hypot(tg.x - NAV.tgt.x, tg.z - NAV.tgt.z) > 1.2;
  if (NAV.F && !moved && NAV.key === NAV.sig) return;
  if (NAV.F && moved && NAV.tgt && Math.hypot(tg.x - NAV.tgt.x, tg.z - NAV.tgt.z) < 6 && now - NAV.calcT < 1.2 && NAV.key === NAV.sig) return;   // a slowly moving target (someone walking): not every frame
  NAV.tgt = { x: tg.x, z: tg.z }; NAV.calcT = now; NAV.key = NAV.sig;
  const seedsFor = pass => { const out = [], c = navIdx(tg.x, tg.z), r = Math.ceil(1.6 / NAV.res), n = NAV.n, i0 = c % n, j0 = (c / n) | 0;
    for (let j = j0 - r; j <= j0 + r; j++) for (let i = i0 - r; i <= i0 + r; i++) { if (i < 0 || j < 0 || i >= n || j >= n) continue; const k = j * n + i; if ((i - i0) ** 2 + (j - j0) ** 2 <= r * r && navFree(k, pass) && navReach(tg.x, tg.z, k)) out.push(k); }
    if (!out.length) { const s = navSnap(tg.x, tg.z, pass, 10); if (s >= 0) out.push(s); } return out; };
  const pk = navSnap(PL.x, PL.z, 'B', 4);
  let F = navField(seedsFor('A'), 'A'), pass = 'A';
  if (pk < 0 || F[navSnap(PL.x, PL.z, 'A', 4)] < 0) { F = navField(seedsFor('B'), 'B'); pass = 'B'; }
  if (pk >= 0 && F[pk] < 0) {   // not reachable from here: lead to the reachable place nearest the objective
    const R = navField([pk], 'B', true); let best = -1, bd = 1e18;
    for (let k = 0; k < R.length; k++) if (R[k] >= 0) { const dd = (navX(k) - tg.x) ** 2 + (navZ(k) - tg.z) ** 2; if (dd < bd) { bd = dd; best = k; } }
    if (best >= 0) F = navField([best], 'B');
  }
  NAV.F = F; NAV.pass = pass; NAV.wpT = 0;
}
// the route from the player: a list of nodes down the field (stops at a link: the ladder / stair / slide is the next goal)
function navPath(maxN = 90) {
  const F = NAV.F, pass = NAV.pass, n = NAV.n; let k = navSnap(PL.x, PL.z, pass, 4); if (k < 0) k = navSnap(PL.x, PL.z, 'B', 4); if (k < 0 || F[k] < 0) return null;
  const out = [k];
  for (let s = 0; s < maxN && F[k] > 0; s++) {
    const i = k % n, j = (k / n) | 0; let best = -1, bd = F[k], link = false;
    for (const [dx, dz] of NAVD) { const ni = i + dx, nj = j + dz; if (ni < 0 || nj < 0 || ni >= n || nj >= n) continue; const nk = nj * n + ni; if (F[nk] >= 0 && F[nk] < bd && navFree(nk, 'B')) { if (dx && dz && (!navFree(j * n + ni, 'B') || !navFree(nj * n + i, 'B'))) continue; bd = F[nk]; best = nk; } }
    const ls = NAV.linkA && NAV.linkA.get(k); if (ls) for (const b of ls) if (F[b] >= 0 && F[b] + NAV_LINK <= F[k] && F[b] < bd) { bd = F[b]; best = b; link = true; }
    if (best < 0) break;
    if (link) { out.link = out.length - 1; break; }
    out.push(best); k = best;
  }
  return out;
}
// where the compass should point: the farthest point on the route still in a straight walkable line (12 m at most)
function navGuide(tg) {
  if (!tg || !navOn() || G.state !== 'play') return tg;
  try {
    navTarget(tg);
    if ((NAV.wpT -= 1) > 0 && NAV.wp) return NAV.wp;
    NAV.wpT = 6;
    const P = navPath(); if (!P || P.length < 2) { NAV.wp = tg; NAV.metres = P ? 0 : -1; return tg; }
    const F = NAV.F, p0 = P[0]; NAV.metres = F[p0] / 5 * NAV.res; NAV.last = P;
    if (P.link === undefined && NAV.metres < 2.2) { NAV.wp = tg; return tg; }
    let pick = P[Math.min(P.length - 1, 2)];
    for (let s = P.length - 1; s >= 1; s--) { const k = P[s]; if (Math.hypot(navX(k) - PL.x, navZ(k) - PL.z) > 12) continue; if (navLine(p0, k, NAV.pass)) { pick = k; break; } }
    NAV.wp = Object.assign({}, tg, { x: navX(pick), z: navZ(pick), route: true });
    if (P.link === undefined && pick === P[P.length - 1] && P.length < 90 && navLine(p0, navIdx(tg.x, tg.z), 'B')) NAV.wp = tg;   // the objective itself is in plain sight
    return NAV.wp;
  } catch (e) { if (typeof frameErr === 'function') frameErr('nav', e); return tg; }
}

// ----- floor arrows: if the player has made no progress toward the objective for a while, faint arrows are painted along the route -----
const GUIDE = { arrows: [], scn: null, mat: null, tex: null, idle: 0, best: 1e9, tkey: '', tick: 0, shownT: 0, n: 0 };
const GUIDE_AFTER = [60, 120, 210];   // seconds without progress before the arrows show (Easy / Normal / Nightmare)
BABYLON.Effect.ShadersStore.guideArrVertexShader = `precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 world; uniform mat4 viewProjection; varying vec2 vUV; void main(){ vUV = uv; gl_Position = viewProjection*world*vec4(position,1.0); }`;
BABYLON.Effect.ShadersStore.guideArrFragmentShader = `precision highp float; varying vec2 vUV; uniform sampler2D tex; uniform vec4 col; void main(){ vec4 c = texture2D(tex, vUV); gl_FragColor = vec4(col.rgb*c.rgb, c.a*col.a); }`;
function guideMeshes() {
  if (GUIDE.scn === SCN && GUIDE.arrows.length) return;
  GUIDE.arrows = []; GUIDE.scn = SCN;
  const dt = new BABYLON.DynamicTexture('guideArr', { width: 128, height: 128 }, SCN, true), c = dt.getContext();
  c.clearRect(0, 0, 128, 128); c.lineCap = 'round'; c.lineJoin = 'round';
  const chev = (y, w) => { c.beginPath(); c.moveTo(22, y + 30); c.lineTo(64, y); c.lineTo(106, y + 30); c.lineWidth = w; c.stroke(); };
  c.strokeStyle = 'rgba(255,255,255,0.95)'; chev(24, 15); c.strokeStyle = 'rgba(255,255,255,0.6)'; chev(62, 12);
  // a little grain, so it reads as paint on the floor rather than a UI sprite
  const im = c.getImageData(0, 0, 128, 128), d = im.data; for (let i = 3; i < d.length; i += 4) if (d[i]) d[i] = Math.max(0, d[i] - (Math.random() < 0.18 ? 120 : Math.random() * 40)); c.putImageData(im, 0, 0);
  dt.hasAlpha = true; dt.update();
  for (let i = 0; i < 14; i++) {
    const m = new BABYLON.ShaderMaterial('guideArrM', SCN, { vertex: 'guideArr', fragment: 'guideArr' }, { attributes: ['position', 'uv'], uniforms: ['world', 'viewProjection', 'col'], samplers: ['tex'], needAlphaBlending: true });
    m.setTexture('tex', dt); m.setVector4('col', new BABYLON.Vector4(1, 0.86, 0.45, 0)); m.backFaceCulling = false; m.disableDepthWrite = true; m.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
    const g = BABYLON.MeshBuilder.CreateGround('guideArr', { width: 0.9, height: 0.9 }, SCN); g.material = m; g.isPickable = false; g._sortD = 300; g.alphaIndex = 6; g.setEnabled(false);
    GUIDE.arrows.push({ g, m, t0: 0, life: 0, on: false });
  }
}
function navFloorY(x, z) {
  if (LVL === 9 && typeof phys9 === 'function') return phys9(x, z);
  if ((LVL === 37 || LVL === 2 || LVL === 7) && LV.fh) { const c = cIdx(cellOf(x), cellOf(z)); let y = LV.fh[c]; if (LV.bas && LV.bas[c] >= 0 && LV.basins[LV.bas[c]]) y = Math.max(y, LV.basins[LV.bas[c]].y); if (LVL === 37 && typeof G37 !== 'undefined' && G37.onTower && W37.tower) y = W37.tower.top; return [x, z, y]; }
  return [x, z, 0];
}
function guideShow() {
  const P = NAV.last; if (!P || P.length < 3) return false;
  guideMeshes(); const pts = [], step = Math.round(1.7 / NAV.res);
  for (let s = Math.round(1.2 / NAV.res); s < P.length && pts.length < GUIDE.arrows.length; s += step) {
    const k = P[s], nx = P[Math.min(P.length - 1, s + 2)], px = P[Math.max(0, s - 2)];
    pts.push({ x: navX(k), z: navZ(k), yaw: Math.atan2(navX(nx) - navX(px), navZ(nx) - navZ(px)) });
  }
  if (P.link !== undefined) { const k = P[P.length - 1]; pts.push({ x: navX(k), z: navZ(k), yaw: pts.length ? pts[pts.length - 1].yaw : PL.yaw, end: true }); }
  if (!pts.length) return false;
  pts.slice(0, GUIDE.arrows.length).forEach((p, i) => { const A = GUIDE.arrows[i], f = navFloorY(p.x, p.z); A.g.position.set(f[0], f[2] + 0.025, f[1]); A.g.rotation.y = p.yaw; A.t0 = FX.t + i * 0.18; A.life = 22; A.on = true; A.g.setEnabled(true); });
  GUIDE.shownT = FX.t; GUIDE.n++; return true;
}
function guideHide() { for (const A of GUIDE.arrows) { A.on = false; A.g.setEnabled(false); } }
function guideTick(dt, tg) {
  if (GUIDE.scn !== SCN) { GUIDE.arrows = []; GUIDE.scn = null; GUIDE.idle = 0; GUIDE.best = 1e9; GUIDE.tkey = ''; }
  for (const A of GUIDE.arrows) if (A.on) {
    const t = FX.t - A.t0, k = t < 0 ? 0 : t < 0.6 ? t / 0.6 : t > A.life - 2 ? Math.max(0, (A.life - t) / 2) : 1, pulse = 0.75 + 0.25 * Math.sin(FX.t * 3 - A.t0 * 6);
    A.m.setVector4('col', new BABYLON.Vector4(1, 0.86, 0.45, 0.62 * k * pulse)); if (t > A.life) { A.on = false; A.g.setEnabled(false); }
  }
  if (!tg || G.state !== 'play' || !navOn()) { GUIDE.idle = 0; return; }
  if ((GUIDE.tick -= dt) > 0) return; GUIDE.tick = 0.5;
  const key = Math.round(tg.x / 6) + ',' + Math.round(tg.z / 6);
  if (key !== GUIDE.tkey) { GUIDE.tkey = key; GUIDE.idle = 0; GUIDE.best = 1e9; guideHide(); }
  const m = NAV.metres; if (m < 0) return;
  if (m < GUIDE.best - 4 || m < 3) { if (m < GUIDE.best) GUIDE.best = m; GUIDE.idle = Math.max(0, GUIDE.idle - 6); if (m < 3) GUIDE.idle = 0; return; }
  GUIDE.idle += 0.5;
  const lim = GUIDE_AFTER[G.diff] ?? 120;
  if (GUIDE.idle >= lim && FX.t - GUIDE.shownT > 24) { if (guideShow()) GUIDE.idle = lim * 0.5; }
}
// QA only: collide as if every unlocked door had been opened
function collideNav(p, r) { const off = []; for (const [si, d] of navDoorMap()) if (!d.locked && !d.jammed && !LV.solids[si].off) { LV.solids[si].off = true; off.push(si); } collide(p, r); for (const si of off) LV.solids[si].off = false; }
