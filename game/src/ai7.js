// ---------- r10 · Level 7: Kell, Wren, Fen, the Gulpers, the Long Shadow ----------
const AIS7 = { npcs: {}, kell: null, wren: null, fen: null, fish: [], shadow: null };
// is this point under a light the Shadow will not cross?
function lit7(x, z) {
  for (const L of WS7.lights) { if (L.needs === 'gen' && !PS7.gen) continue; if (L.needs === 'lit' && !PS7.lit) continue; if (dist2(x, z, L.x, L.z) < L.r) return true; }
  if (GS7.flareT > 0 && GS7.flarePos && dist2(x, z, GS7.flarePos.x, GS7.flarePos.z) < 26) return true;
  if (PS7.lit && dist2(x, z, cc7(31), cc7(11)) < 52) return true;
  const c = cell7(x, z); if (LV.fh[c] > -1.0 && LV.room[c] !== LV.dry.sea.id) return true;
  return false;
}
class Npc7 extends Agent {
  constructor(tint, p, o = {}) {
    super(buildExplorer({ tint }), 0.3); mergeRig(this.rig); Object.assign(this, { shadowR: 0.5, noSep: true, base: p.yaw, tt: rnd(0, 9), pose: o.pose || 'stand' });
    this.cellFn = c => false; this.place(p.x, p.z, p.yaw);
  }
  update(dt) {
    this.tt += dt; const d = this.d, near = d < 6 && G.state === 'play', want = near ? Math.atan2(PL.x - this.x, PL.z - this.z) : this.base; this.face(want, 2.5, dt);
    animHuman(this.rig, 0, 0, { lean: 0.06 + Math.sin(this.tt * 0.5) * 0.015, look: clamp(angDiff(this.yaw, want) * 0.4, -0.5, 0.5), armL: -0.25 + Math.sin(this.tt * 0.9) * 0.05, armR: -0.2 });
    this.sync(); this.rig.root.position.y = floorY37(this.x, this.z);
  }
  cull() { const d = this.d; this.shown = d < 42 && (d < 6 || los(PL.x, PL.z, this.x, this.z)); setRigVisible(this.rig, this.shown); }
}
class Gulper7 extends Fish37 {
  constructor(basin, region) { super(basin); this.cdK = 1.6; this.region = region; if (region) { this.cells = this.cells.filter(c => dist2(cellCenter(c % N), cellCenter((c / N) | 0), region.x, region.z) < region.r); if (!this.cells.length) this.cells = [region.c]; const c = pick(this.cells); this.place(cellCenter(c % N), cellCenter((c / N) | 0), rnd(0, TAU)); this.y = LV.basins[basin].y - 1.6; this.sync(); } }
  update(dt) { if (this.region && dist2(PL.x, PL.z, this.region.x, this.region.z) > this.region.r + 14 && this.st === 'hunt') { this.st = 'lurk'; this.aggroed = false; } super.update(dt); }
}
// ----- the Long Shadow: very large, very slow, under the surface; it comes for what swims in the dark -----
function buildShadow7() {
  const mat = actMat('shadow7', { spec: 0.05, shin: 4, wrap: 0.1, emis: 1 }), root = tnode(null), r = { root, mat, hipH: 0 }, c = [0.01, 0.015, 0.02];
  r.body = tnode(root); r.segs = [];
  for (let i = 0; i < 9; i++) { const t = i / 8, s = i === 0 ? 3.0 : 3.6 - t * 3.0, n = tnode(r.body, 0, 0, -i * 2.6 + 4); part('Sphere', { diameter: 1, segments: 10 }, n, mat, c, 0, [0, 0, 0], null, [s, s * 0.7, 3.2]); r.segs.push(n); }
  r.head = r.segs[0]; for (const sx of [-1, 1]) part('Sphere', { diameter: 0.5, segments: 8 }, r.head, mat, [0.8, 0.9, 0.7], 1, [sx * 0.7, 0.3, 1.5]);
  for (let k = 0; k < 7; k++) part('Box', { width: 0.12, height: 1.2, depth: 0.5 }, r.body, mat, c, 0, [0, 1.6, 2 - k * 2.4], [-0.3, 0, 0]);
  return r;
}
class Shadow7 extends Agent {
  constructor() {
    super(buildShadow7(), 1.6); mergeRig(this.rig); this.deep = []; for (let c = 0; c < N * N; c++) if (LV.room[c] === LV.dry.sea.id && LV.fh[c] <= -8) this.deep.push(c);
    const c = pick(this.deep.filter(c => dist2(cellCenter(c % N), cellCenter((c / N) | 0), cc7(30), cc7(30)) > 70)) || pick(this.deep); this.place(cellCenter(c % N), cellCenter((c / N) | 0), rnd(0, TAU));
    Object.assign(this, { st: 'sleep', wp: null, y: -6, atkCd: 0, scareT: 0, shadowR: 0, noiseT: 8, gone: false, awake: 0, pass: 0 }); this.sync();
  }
  show() { this.st = 'show'; this.showT = 0; this.gone = false; this.place(cc7(15), cc7(17), Math.PI * 0.8); this.y = -2.6; this.shown = false; }
  scare(t = 20) { this.scareT = t; this.st = 'flee'; }
  leave() { this.gone = true; this.st = 'flee'; this.scareT = 9999; }
  playerPrey() { return G.state === 'play' && (G37.under || depth37(PL.x, PL.z) > 1.3) && depth37(PL.x, PL.z) > 3.5 && !lit7(PL.x, PL.z); }
  update(dt) {
    const d = this.d, play = G.state === 'play', B = LV.basins[BAS7.SEA];
    if (this.st === 'show') { this.showT += dt; const tx = cc7(14), tz = cc7(44), dx = tx - this.x, dz = tz - this.z, l = Math.hypot(dx, dz) || 1; this.x += dx / l * 4.2 * dt; this.z += dz / l * 4.2 * dt; this.yaw = Math.atan2(dx, dz); this.y = -2.4 + Math.sin(this.showT * 0.7) * 0.4; this.rig.segs.forEach((sg, i) => { sg.position.x = Math.sin(this.showT * 0.9 - i * 0.7) * 0.6 * (i / 8 + 0.2); }); this.sync(); this.rig.root.position.y = this.y; this.vis(true); if (this.showT > 16) this.leave(); return; }
    if (this.st === 'sleep') { if (play && (PS7.met || G.time > 200)) { this.awake += dt; if (this.awake > 40) this.st = 'patrol'; } this.vis(false); return; }
    if (this.gone && d > 120) { this.vis(false); return; }
    this.atkCd -= dt; this.noiseT -= dt; if (this.scareT > 0) this.scareT -= dt;
    let sp = 1.6, tx, tz;
    if (this.st === 'flee') { const ax = this.x - PL.x, az = this.z - PL.z, l = Math.hypot(ax, az) || 1; tx = this.x + ax / l * 40; tz = this.z + az / l * 40; sp = 3.4; if (this.scareT <= 0 && !this.gone) this.st = 'patrol'; }
    else if (this.st === 'hunt') {
      if (!this.playerPrey() || !play) { this.st = 'patrol'; this.wp = null; }
      else { tx = PL.x; tz = PL.z; sp = [2.6, 3.0, 3.5][G.diff] * (1 + clamp(PL.noise, 0, 1) * 0.2); G.chase = Math.max(G.chase, clamp(1 - d / 40, 0, 1)); PL.fear = Math.max(PL.fear, clamp(1 - d / 34, 0, 0.9));
        if (d < 5.2 && this.atkCd <= 0) { this.atkCd = 3.2; knock(this, [30, 38, 46][G.diff], 'shadow', 3.6); FX.glitch = 1.6; SFX7.shadow(P9({ x: PL.x, y: 0, z: PL.z })); this.st = 'flee'; this.scareT = 9; } }
    } else {   // patrol: wander the deep, keep away from the lights
      if (!this.wp || dist2(this.x, this.z, this.wp.x, this.wp.z) < 6) { const c = pick(this.deep); this.wp = { x: cellCenter(c % N), z: cellCenter((c / N) | 0) }; }
      tx = this.wp.x; tz = this.wp.z;
      if (play && !this.gone && d < 70 && this.playerPrey() && (d < 28 || PL.noise > 0.3 || G37.under)) { this.st = 'hunt'; SFX7.shadow(P9({ x: this.x, y: 0, z: this.z })); GS7.shadowSeen++; }
    }
    // steer through deep water only
    const dx = tx - this.x, dz = tz - this.z, l = Math.hypot(dx, dz) || 1, nx = this.x + dx / l * sp * dt, nz = this.z + dz / l * sp * dt, c = cell7(nx, nz);
    if (LV.room[c] === LV.dry.sea.id && LV.fh[c] <= -4 && (this.st === 'hunt' || !lit7(nx, nz))) { this.x = nx; this.z = nz; } else if (this.st !== 'hunt') this.wp = null;
    this.yaw += angDiff(this.yaw, Math.atan2(dx, dz)) * Math.min(1, 1.2 * dt);
    this.y = damp(this.y, this.st === 'hunt' ? clamp(G37.ey - 2.4, -9, -1.8) : -5 - Math.sin(FX.t * 0.3) * 1.2, 0.8, dt);
    this.rig.segs.forEach((s, i) => { s.position.x = Math.sin(FX.t * 0.9 - i * 0.7) * 0.5 * (i / 8 + 0.2); });
    this.sync(); this.rig.root.position.y = this.y; this.vis(d < 90);
    if (this.noiseT <= 0 && d < 60) { this.noiseT = rnd(14, 26); SFX7.shadowPass({ x: this.x, y: -3, z: this.z, pl: { x: PL.x, z: PL.z } }); }
  }
  vis(v) { if (this.shown !== v) { this.shown = v; setRigVisible(this.rig, v); } }
  cull() {}
}
function initAI7() {
  Object.assign(AI, { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null, flick: 0 }); AIS7.fish = [];
  const P = WS7.pos, mk = (k, tint, p) => { const n = new Npc7(tint, p); AIS7[k] = n; AI.all.push(n); return n; };
  mk('kell', [0.8, 0.5, 0.14], P.kell); mk('wren', [0.28, 0.34, 0.42], P.wren); mk('fen', [0.1, 0.3, 0.42], P.fen);
  for (const [k, n, lab] of [['kell', 'KELL', 'TALK TO KELL'], ['wren', 'WREN', 'TALK TO WREN'], ['fen', 'FEN', 'TALK TO FEN']]) { const a = AIS7[k]; W.interact.push({ get x() { return a.x; }, get z() { return a.z; }, y: 1.2, r: 2.3, label: () => lab, ok: () => G.state === 'play', act: () => talk7(k) }); }
  const g1 = new Gulper7(BAS7.HOLD1, null); AIS7.fish.push(g1); AI.all.push(g1);
  for (const [bx, bz] of [[cc7(17), cc7(52)], [cc7(19), cc7(53)], [cc7(13), cc7(50)]]) { const c0 = cell7(bx, bz), g = new Gulper7(BAS7.SEA, { x: bx, z: bz, r: 22, c: c0 }); AIS7.fish.push(g); AI.all.push(g); }
  const sh = new Shadow7(); AIS7.shadow = sh; AI.all.push(sh);
}
function updateAI7(dt) {
  PL.fear = 0; PL.interf = 0; AI.flick = 0; G.chase = 0;
  for (const a of AI.all) a.update(dt);
  AI.visT -= dt; if (AI.visT <= 0) { AI.visT = 0.1; for (const a of AI.all) a.cull(); }
  const cs = []; for (const a of AI.all) if (a.shown && a.shadowR > 0) { const d = a.d; if (d < 20) cs.push([d, a]); } cs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 8; i++) { const a = cs[i] && cs[i][1]; if (a) setShadowCaster(i, a.x, a.z, a.shadowR, 0.45); else setShadowCaster(i, 0, 0, 0, 0); }
}
function foes7() { const o = [], s = AIS7.shadow; if (s && s.st === 'hunt' && s.d < 70) o.push({ kind: 'f', ang: Math.atan2(s.x - PL.x, s.z - PL.z), d: s.d, k: clamp(1 - s.d / 70, 0, 1), ch: true, fl: 0 }); for (const f of AIS7.fish) if (f.shown && f.st === 'hunt' && f.d < 20) o.push({ kind: 'f', ang: Math.atan2(f.x - PL.x, f.z - PL.z), d: f.d, k: clamp(1 - f.d / 24, 0, 1), ch: true, fl: 0 }); return o; }
