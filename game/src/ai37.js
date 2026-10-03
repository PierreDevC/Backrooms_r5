// ---------- r8 · Level 37: the people and things in the water ----------
// Abara (relief team, camp), Teague (the swimmer in the hotel court), the Staff (only on night shot), and the Fish (wave pool; the Dive Well once the video plays).
const AI37 = { npcs: [], staff: [], fish: null, wwf: null, abara: null, teague: null };
const NPCI37 = [];
function npc37Floor(a, y0 = 0) { a.rig.root.position.y = floorY37(a.x, a.z) + y0; }
class Npc37 extends Agent {
  constructor(tint, o = {}) {
    super(buildExplorer({ tint }), 0.3); mergeRig(this.rig);
    Object.assign(this, { shadowR: 0.5, home: null, lookT: 0, noSep: true }, o);
    this.cellFn = c => LV.zone[c] > 0 && LV.bas[c] < 0; this.edgeFn = (x, y, d) => !doorClosed(x, y, d);
  }
  cull() { const d = this.d; this.shown = d < 40 && (d < 5 || los(PL.x, PL.z, this.x, this.z)); setRigVisible(this.rig, this.shown); }
}
// Abara: stands by her cot and turns toward you when you are near; never leaves camp
class Abara37 extends Npc37 {
  constructor() { super([0.35, 0.5, 0.42]); const P = W37.pos.abara; this.place(P.x, P.z, Math.PI * 0.5); this.home = P; }
  update(dt) {
    const d = this.d, want = d < 7 && G.state === 'play' ? Math.atan2(PL.x - this.x, PL.z - this.z) : this.yaw; this.face(want, 2.2, dt);
    this.ph += dt * 0.6; if (this.rig.sk || this.rig.hip) animHuman(this.rig, 0, 0, { lean: 0.03, look: clamp(angDiff(this.yaw, want) * 0.4, -0.5, 0.5), armL: 0.1 + 0.05 * Math.sin(this.ph), armR: 0.05 });
    this.sync(); npc37Floor(this);
  }
}
// Teague: on the deck by lane four until you time her, then four lengths
class Teague37 extends Npc37 {
  constructor() {
    super([0.75, 0.4, 0.4]); const S = W37.pos.swimmer; this.S = S; this.place(S.x, S.z, -Math.PI / 2); this.swimming = false; this.lapT = 0; this.dirn = -1; this.lx = S.x;
    this.inter = { x: S.x, z: S.z, y: 0.8, r: 2.6, label: () => P37.hotel.timed ? 'TEAGUE' : holdBusy(this.inter) ? `TIMING TEAGUE… ${holdPct(this.inter)}%` : this.swimming ? 'KEEP THE WATCH' : 'SPEAK TO TEAGUE', ok: () => G.state === 'play', act: () => talkTeague37() };
    W.interact.push(this.inter);
  }
  update(dt) {
    const S = this.S;
    if (this.swimming) {
      this.lapT += dt; const spd = 3.3; this.lx += this.dirn * spd * dt;
      if (this.lx < S.laneX0) { this.lx = S.laneX0; this.dirn = 1; } if (this.lx > S.laneX1) { this.lx = S.laneX1; this.dirn = -1; }
      this.x = this.lx; this.z = S.laneZ; this.yaw = this.dirn < 0 ? -Math.PI / 2 : Math.PI / 2; this.ph += dt * 5.2;
      const wy = waterY37(this.x, this.z); this.rig.root.position.y = wy - 0.2; this.rig.root.rotation.x = 1.45;
      const s = Math.sin(this.ph); if (this.rig.hip) animHuman(this.rig, this.ph, 0.9, { armA: 1.7, legA: 0.28 });
      if (Math.random() < dt * 5) SFX37.splashSoft && SFX37.splashSoft(P9({ x: this.x, y: wy, z: this.z }));
      this.sync(); this.rig.root.position.y = wy - 0.2; this.rig.root.rotation.x = 1.45;
    } else {
      if (this.rig.root.rotation.x !== 0) { this.rig.root.rotation.x = 0; this.place(S.x, S.z, -Math.PI / 2); this.lx = S.x; }
      const want = this.d < 7 ? Math.atan2(PL.x - this.x, PL.z - this.z) : -Math.PI / 2; this.face(want, 2, dt);
      animHuman(this.rig, 0, 0, { lean: 0.1, look: clamp(angDiff(this.yaw, want) * 0.4, -0.5, 0.5), armL: -0.2, armR: -0.2 });
      this.sync(); npc37Floor(this);
    }
  }
  cull() { const d = this.d; this.shown = d < 44 && (this.swimming || d < 6 || los(PL.x, PL.z, this.x, this.z)); setRigVisible(this.rig, this.shown); }
}
// the Staff: pale, still, doing the one thing; they only exist on night shot
class Staff37 extends Npc37 {
  constructor(p) {
    super([0.1, 0.12, 0.12]); this.key = p.key; this.task = p.task; this.ry = p.ry; this.place(p.x, p.z, p.ry); this.base = { x: p.x, z: p.z }; this.faceT = 0; this.tt = rnd(0, 6); this.shadowR = 0; this.present = true;
    const it = { get x() { return a.x; }, get z() { return a.z; }, y: 1.1, r: 2.1, label: () => staffLabel37(a), ok: () => G.state === 'play' && FX.nv > 0.5, act: () => talkStaff37(a) }; const a = this; W.interact.push(it);
  }
  update(dt) {
    this.tt += dt; let want = this.ry; if (this.faceT > 0) { this.faceT -= dt; want = Math.atan2(PL.x - this.x, PL.z - this.z); }
    if (this.task === 'walk') { const t = this.tt * 0.12; const nx = this.base.x + Math.sin(t) * 2.6; this.step(nx, this.base.z, 0.5, dt); this.ph += dt * this.spd * 3; animHuman(this.rig, this.ph, clamp(this.spd / 1.2, 0, 1), { lean: 0.05, armA: 0.2 }); }
    else { this.face(want, 3, dt); const w = Math.sin(this.tt * 0.9) * (this.task === 'bed' ? 0.02 : 0.08); animHuman(this.rig, 0, 0, { lean: 0.12 + w, look: Math.sin(this.tt * 0.4) * 0.3, armL: this.task === 'desk' || this.task === 'file' ? -0.7 + Math.sin(this.tt * 1.4) * 0.15 : -0.1, armR: this.task === 'desk' ? -0.6 : -0.1, elL: -0.9, elR: -0.9 }); }
    this.sync(); npc37Floor(this);
  }
  cull() { const v = FX.nv > 0.5 && this.d < 36 && (this.d < 5 || los(PL.x, PL.z, this.x, this.z)); this.shown = v; setRigVisible(this.rig, v); }
}
// the Fish: a long dark thing in the water. Wanders its basin; hunts you if you are swimming in it
function buildFish37() {
  const mat = actMat('fish37', { spec: 0.4, shin: 40, wrap: 0.2 }), root = tnode(null), r = { root, mat, hipH: 0, kind: 'fish' }, c = [0.03, 0.05, 0.05];
  r.body = tnode(root); part('Sphere', { diameter: 1, segments: 12 }, r.body, mat, c, 0, [0, 0, 0], null, [0.55, 0.5, 2.6]);
  r.head = tnode(r.body, 0, 0, 1.2); part('Sphere', { diameter: 0.5, segments: 10 }, r.head, mat, c, 0, [0, 0, 0.15], null, [1, 0.9, 1.3]);
  for (const s of [-1, 1]) { part('Sphere', { diameter: 0.07, segments: 6 }, r.head, mat, [0.95, 0.95, 0.8], 1, [s * 0.14, 0.08, 0.34]); part('Sphere', { diameter: 0.14, segments: 6 }, r.body, mat, c, 0, [s * 0.28, -0.05, 0.4], null, [0.3, 0.1, 1.6]); }
  r.tail = tnode(r.body, 0, 0, -1.2); part('Box', { width: 0.05, height: 0.8, depth: 0.5 }, r.tail, mat, c, 0, [0, 0, -0.25]); part('Box', { width: 0.05, height: 0.55, depth: 0.7 }, r.body, mat, c, 0, [0, 0.4, 0.1]);
  return r;
}
class Fish37 extends Agent {
  constructor(basin) {
    super(buildFish37(), 0.5); mergeRig(this.rig); this.basin = basin; this.cells = []; for (let c = 0; c < N * N; c++) if (LV.bas[c] === basin && LV.fh[c] < LV.basins[basin].y - 0.9) this.cells.push(c);
    this.y = 0; this.aggroed = false; this.atkCd = 2; this.wp = null; this.shadowR = 0; this.st = 'lurk'; this.spd = 0;
    const c = this.cells.length ? pick(this.cells) : 0; this.place(cellCenter(c % N), cellCenter((c / N) | 0), rnd(0, TAU)); this.y = LV.basins[basin].y - 1.2; this.sync();
  }
  aggro() { this.aggroed = true; this.st = 'hunt'; }
  dispose() { const i = AI.all.indexOf(this); if (i >= 0) AI.all.splice(i, 1); try { this.rig.root.dispose(); } catch (e) {} }
  inBasin(x, z) { return LV.bas[cell37(x, z)] === this.basin; }
  update(dt) {
    const B = LV.basins[this.basin], play = G.state === 'play', pIn = play && this.inBasin(PL.x, PL.z) && depth37(PL.x, PL.z) > 0.55, d = this.d;
    if (!this.present || !B) return;
    // the Well fish stays out until the flood is up
    if (this.basin === BAS37.WELL && !G37.flood) { this.shown = false; setRigVisible(this.rig, false); return; }
    if (pIn && (this.aggroed || d < 9)) this.st = 'hunt'; else if (!this.aggroed) this.st = 'lurk';
    let tx, tz, ty, sp;
    if (this.st === 'hunt' && pIn) { tx = PL.x; tz = PL.z; ty = clamp(G37.ey - 0.5, LV.fh[cell37(this.x, this.z)] + 0.4, B.y - 0.35); sp = [2.7, 3.1, 3.5][G.diff]; if (d > 2.6) sp *= 0.85 + 0.15 * Math.sin(FX.t * 5); }
    else { if (!this.wp || dist2(this.x, this.z, this.wp.x, this.wp.z) < 1.2) { const c = this.cells.length ? pick(this.cells) : 0; this.wp = { x: cellCenter(c % N), z: cellCenter((c / N) | 0) }; } tx = this.wp.x; tz = this.wp.z; ty = B.y - rnd(1.2, 2.2); sp = 1.1; }
    const ox = this.x, oz = this.z, dx = tx - this.x, dz = tz - this.z, dd = Math.hypot(dx, dz) || 1, k = Math.min(dd, sp * dt);
    const nx = this.x + dx / dd * k, nz = this.z + dz / dd * k;
    if (this.inBasin(nx, nz) && LV.fh[cell37(nx, nz)] < B.y - 0.5) { this.x = nx; this.z = nz; } else if (this.st === 'lurk') this.wp = null;
    this.face(Math.atan2(dx, dz), 5, dt); this.spd = Math.hypot(this.x - ox, this.z - oz) / Math.max(dt, 1e-4); this.y = damp(this.y, ty, 2.4, dt);
    this.ph += dt * (2 + this.spd * 1.6); this.rig.tail.rotation.y = Math.sin(this.ph) * 0.5; this.rig.body.rotation.y = Math.sin(this.ph) * 0.1; this.rig.head.rotation.y = Math.sin(this.ph + 1) * 0.12;
    this.sync(); this.rig.root.position.y = this.y;
    // seen as a long shadow: fear when it is near and you are in the water
    if (pIn) { const k2 = clamp(1 - d / 12, 0, 0.7); PL.fear = Math.max(PL.fear, k2); if (this.st === 'hunt' && d < 7) G.chase = Math.max(G.chase, clamp(1 - d / 9, 0, 1)); }
    this.atkCd -= dt;
    if (play && pIn && this.st === 'hunt' && d < 1.5 && Math.abs(G37.ey - 0.5 - this.y) < 1.4 && this.atkCd <= 0) { this.atkCd = [2.6, 2.2, 1.8][G.diff]; knock(this, 13, 'fish', 3.2); SFX37.splash && SFX37.splash(P9({ x: PL.x, y: B.y, z: PL.z })); FX.glitch = Math.max(FX.glitch, 1.2); toast('SOMETHING HIT YOU IN THE WATER', 1.6); }
    if (this.st === 'lurk' && !pIn) this.aggroed = this.aggroed;
  }
  cull() { const v = this.present && this.d < 32 && depth37(this.x, this.z) > 0; this.shown = v && (this.basin !== BAS37.WELL || G37.flood); setRigVisible(this.rig, this.shown); }
}
function spawnFish37(where) {
  if (where === 'well' && !AI37.fish) { const f = new Fish37(BAS37.WELL); f.aggro(); AI37.fish = f; AI.all.push(f); }
}
function initAI37() {
  Object.assign(AI, { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null, flick: 0 }); AI37.npcs = []; AI37.staff = []; AI37.fish = null; AI37.wwf = null;
  const A = new Abara37(), T = new Teague37(); AI37.abara = A; AI37.teague = T; AI.all.push(A, T);
  W.interact.push({ get x() { return A.x; }, get z() { return A.z; }, y: 1.1, r: 2.2, label: () => 'TALK TO ABARA', ok: () => G.state === 'play', act: () => talkAbara37() });
  for (const p of W37.pos.staff || []) { const s = new Staff37(p); AI37.staff.push(s); AI.all.push(s); }
  if (LV.basins[BAS37.WWF]) { const f = new Fish37(BAS37.WWF); AI37.wwf = f; AI.all.push(f); }
}
function updateAI37(dt) {
  PL.fear = 0; PL.interf = 0; AI.flick = 0; G.chase = 0;
  for (const a of AI.all) a.update(dt);
  AI.visT -= dt; if (AI.visT <= 0) { AI.visT = 0.1; for (const a of AI.all) a.cull(); }
  const cs = []; for (const a of AI.all) if (a.shown && a.shadowR > 0) { const d = a.d; if (d < 20) cs.push([d, a]); } cs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 8; i++) { const a = cs[i] && cs[i][1]; if (a) setShadowCaster(i, a.x, a.z, a.shadowR, 0.45); else setShadowCaster(i, 0, 0, 0, 0); }
}
function foes37() { const o = []; for (const f of [AI37.fish, AI37.wwf]) if (f && f.shown && f.st === 'hunt' && f.d < 22) o.push({ kind: 'f', ang: Math.atan2(f.x - PL.x, f.z - PL.z), d: f.d, k: clamp(1 - f.d / 24, 0, 1), ch: true, fl: 0 }); return o; }
