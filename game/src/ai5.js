// ---------- Level 5 · AI: the moths — huge, dusty, and drawn to your light ----------
const AI5 = { moths: [], fl: null };
function buildMoth() {
  const mat = actMat('moth', { spec: 0.12, shin: 8, wrinkle: 0.7, emis: 1, wrap: 0.6, mottle: 0.9 });
  const root = tnode(null), r = { root, mat, kind: 'moth', hipH: 1.1 }, tn = rnd(0.85, 1.12);
  const BR = [0.4, 0.33, 0.25].map(v => v * tn), DK = [0.12, 0.1, 0.08], FUR = [0.55, 0.48, 0.38].map(v => v * tn);
  const fur = (x, y, z) => 0.78 + 0.36 * hash1(Math.floor(x * 60) * 7.1 + Math.floor(y * 60) * 3.3 + Math.floor(z * 60) * 1.7);
  r.body = tnode(root, 0, 0, 0);
  part('Sphere', { diameter: 0.36, segments: 10 }, r.body, mat, FUR, 0, [0, 0, 0.06], null, [0.95, 0.85, 1.15], fur);                       // thorax
  for (let i = 0; i < 5; i++) part('Sphere', { diameter: 0.3 - i * 0.04, segments: 9 }, r.body, mat, i % 2 ? DK.map(v => v * 1.8) : BR, 0, [0, -0.02 - i * 0.02, -0.16 - i * 0.11], null, [1, 0.88, 0.9], fur);   // abdomen
  r.head = tnode(r.body, 0, 0.02, 0.26);
  part('Sphere', { diameter: 0.2, segments: 10 }, r.head, mat, FUR, 0, [0, 0, 0], null, [1.1, 0.9, 0.8], fur);
  for (const s of [-1, 1]) {
    part('Sphere', { diameter: 0.1, segments: 8 }, r.head, mat, [1, 0.42, 0.08], 1, [s * 0.075, 0.02, 0.05]);                              // ember eyes
    const an = tnode(r.head, s * 0.04, 0.07, 0.06); an.rotation.set(-1.0, s * 0.5, 0);
    part('Box', { width: 0.012, height: 0.36, depth: 0.012 }, an, mat, DK, 0, [0, 0.18, 0]);
    for (let k = 0; k < 8; k++) part('Box', { width: 0.13 - k * 0.013, height: 0.007, depth: 0.004 }, an, mat, FUR, 0, [0, 0.05 + k * 0.04, 0]);   // feathered antennae
  }
  for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, L = tnode(r.body, s * 0.1, -0.08, 0.14 - Math.floor(i / 2) * 0.1); L.rotation.set(0.3, 0, s * 0.8); part('Capsule', { height: 0.32, radius: 0.012, tessellation: 5 }, L, mat, DK, 0, [0, -0.15, 0]); }
  // wings: fore + hind on each side, patterned with a pale-ringed eyespot
  r.wings = [];
  for (const s of [-1, 1]) for (const [fore, span, chord, zo] of [[1, 1.0, 0.56, 0.06], [0, 0.72, 0.5, -0.2]]) {
    const w = tnode(r.body, s * 0.12, 0.05, zo), pat = (x, y, z) => {
      const u = s * x + 0.5, e = Math.hypot(u - (fore ? 0.6 : 0.5), (z - (fore ? 0.02 : -0.05)) * 1.4);
      let k = 0.78 + 0.16 * Math.sin(u * 17 + z * 7) + 0.12 * hash1(Math.floor(u * 30) + Math.floor(z * 30) * 13);
      if (e < 0.07) k = 0.18; else if (e < 0.12) k = 1.75; else if (e < 0.15) k = 0.45;
      if (u > 0.88) k *= 0.55; if (Math.abs(z) > 0.42) k *= 0.8; return k;
    };
    part('Sphere', { diameter: 1, segments: 16 }, w, mat, fore ? BR : BR.map(v => v * 0.85), 0, [s * span / 2, 0, 0], null, [span, 0.022, chord], pat);
    r.wings.push({ n: w, s, fore });
  }
  setEmi(mat, 0.6);
  return r;
}
// flying things ignore the furniture - only walls and closed doors stop them
function collideW(p, r) {
  const bx0 = Math.max(0, Math.floor((p.x - r) / BK)), bx1 = Math.min(NBK - 1, Math.floor((p.x + r) / BK)), bz0 = Math.max(0, Math.floor((p.z - r) / BK)), bz1 = Math.min(NBK - 1, Math.floor((p.z + r) / BK));
  for (let it = 0; it < 2; it++) for (let bz = bz0; bz <= bz1; bz++) for (let bx = bx0; bx <= bx1; bx++) for (const si of LV.buckets[bz * NBK + bx]) {
    const b = LV.solids[si]; if (b.off || b.tag === 'prop') continue;
    const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1), dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue;
    if (d2 > 1e-9) { const d = Math.sqrt(d2), k = (r - d) / d; p.x += dx * k; p.z += dz * k; }
    else { const pen = [p.x - b.x0 + r, b.x1 - p.x + r, p.z - b.z0 + r, b.z1 - p.z + r], m = Math.min(...pen), w = pen.indexOf(m); if (w === 0) p.x -= m; else if (w === 1) p.x += m; else if (w === 2) p.z -= m; else p.z += m; }
  }
}
class Moth extends Agent {
  constructor(nest, i) {
    super(buildMoth(), 0.42); mergeRig(this.rig); this.noSep = true;   // flies: no ground personal space
    this.nest = nest; this.boil = nest.boil; this.i = i;
    this.cellFn = this.boil ? (c => !boilZ5(LV.zone[c])) : (c => { const z = LV.zone[c]; return !z || boilZ5(z) || z === Z5.VEST || z === Z5.ELEV || z === Z5.STAIR || z === Z5.SERV || LV.reg[c] === R5.E; });
    this.edgeFn = (x, y, d) => !doorClosed(x, y, d);
    const a = rnd(0, TAU); this.home = { x: nest.x + Math.sin(a) * 0.55, z: nest.z + Math.cos(a) * 0.55 };
    Object.assign(this, { st: 'roost', stT: 0, percT: rnd(0, 0.3), atkCd: 0, lk: null, y: CEIL - 0.42, wph: rnd(0, TAU), flapA: 0, wp: null, seen: false, lit: false, shadowR: 0.45,
      lamp: null, orbA: rnd(0, TAU), chitCd: 0, away: null, bob: rnd(0, TAU), roll: 0, pitch: 0, unT5: 0, driftT: 0 });
    this.place(this.home.x, this.home.z, rnd(0, TAU));
  }
  mine(c) { return c >= 0 && c < N * N && !this.cellFn(c); }
  sync() { const r = this.rig.root; r.position.set(this.x, this.y, this.z); r.rotation.set(this.pitch, this.yaw, this.roll); }
  step(tx, tz, spd, dt, turnK = 5) {   // like Agent.step, but it flies: walls only, banks into turns
    const dx = tx - this.x, dz = tz - this.z, d = Math.hypot(dx, dz);
    if (d < 0.03) { this.spd = damp(this.spd, 0, 6, dt); return d; }
    const want = Math.atan2(dx, dz), y0 = this.yaw; this.face(want, turnK, dt); this.roll = damp(this.roll, clamp(-angDiff(y0, this.yaw) / Math.max(dt, 1e-3) * 0.12, -0.6, 0.6), 4, dt);
    const k = Math.min(d, spd * Math.max(0.35, Math.cos(angDiff(this.yaw, want))) * dt), ox = this.x, oz = this.z, p = { x: ox + dx / d * k, z: oz + dz / d * k };
    collideW(p, this.rad); this.x = p.x; this.z = p.z;
    const m = Math.hypot(p.x - ox, p.z - oz); this.spd = damp(this.spd, m / Math.max(dt, 1e-4), 8, dt);
    if (spd > 0.4 && m < spd * dt * 0.2) this.stuckT += dt; else this.stuckT = Math.max(0, this.stuckT - dt * 2);
    return d;
  }
  // your flashlight pulls them in from far away; without it they only notice you close up or when you're loud
  lightPull() {
    if (PL.fk < 0.5 || G.state !== 'play' || !this.mine(PL.cell)) return false;
    const d = this.d; return d < 16 && los(this.x, this.z, PL.x, PL.z);
  }
  notice() {
    if (G.state !== 'play' || !this.mine(PL.cell)) return false;
    const d = this.d;
    if (d < (PL.crouch ? 2.0 : 4.2) && los(this.x, this.z, PL.x, PL.z)) return true;
    return PL.noise > 0.05 && d < PL.noise * 9;
  }
  wake(why) {
    if (this.st !== 'roost' && this.st !== 'return') return;
    this.st = 'wake'; this.stT = 0; this.lk = { x: PL.x, z: PL.z };
    if (this.d < 26) { SFX5.burst(this.pos(this.y)); if (this.chitCd <= 0) { this.chitCd = 5; SFX5.chitter(this.pos(this.y)); } }
    if (!G5.mothSeen && this.d < 16 && G.state === 'play') { G5.mothSeen = true; later(1.6, () => radio5('moth')); }
  }
  attack() {
    this.atkCd = 2.2; this.rig.hipH = this.y - 0.9;
    SFX5.screech(this.pos(this.y)); SFX.jumpscare && this.d < 2 && Math.random() < 0.35 && SFX.jumpscare();
    knock(this, [12, 16, 22][G.diff], 'moth', 5); PL.san = Math.max(0, PL.san - 12); FX.glitch = Math.max(FX.glitch, 1.2);
    const a = Math.atan2(this.x - PL.x, this.z - PL.z) + rnd(-0.6, 0.6); this.away = { x: this.x + Math.sin(a) * 6, z: this.z + Math.cos(a) * 6 };
    this.st = 'retreat'; this.stT = 0;
  }
  nearLamp(maxD) {   // a lit fixture to circle (sconce, bulb, chandelier)
    let b = null, bd = maxD;
    for (const f of LV.fixtures) { if (!f.state) continue; const d = dist2(f.x, f.z, this.x, this.z); if (d < bd && this.mine(cIdx(cellOf(f.x), cellOf(f.z))) && los(this.x, this.z, f.x, f.z)) { bd = d; b = f; } }
    return b;
  }
  ceil() { return LV.zone[this.cell()] === Z5.BEV ? BEV_H : CEIL; }
  update(dt) {
    const d = this.d, t = FX.t, play = G.state === 'play';
    this.stT += dt; this.atkCd -= dt; this.percT -= dt; this.chitCd -= dt;
    if (this.st === 'roost' && d > 34) { if (this.shown) this.cull(); return; }
    let spd = 0, alt = 2.0, flap = 9;
    if (this.percT <= 0) {
      this.percT = 0.2; this.lit = this.lightPull();
      this.seen = this.lit || this.notice();
      if (this.st === 'roost' && play && (this.notice() || (this.lit && d < 10) || inBeam(this.x, this.y, this.z, 13, 0.92))) this.wake('light');
      if (this.seen && ['drift', 'circle', 'search', 'return'].includes(this.st)) { this.st = 'hunt'; this.stT = 0; this.unT5 = 0; if (this.chitCd <= 0 && d < 20) { this.chitCd = 6; SFX5.chitter(this.pos(this.y)); } }
      if (this.seen) this.lk = { x: PL.x, z: PL.z };
    }
    const top = this.ceil() - 0.35;
    switch (this.st) {
      case 'roost': {   // folded under the ceiling at the nest, twitching now and then
        this.x = damp(this.x, this.home.x, 2, dt); this.z = damp(this.z, this.home.z, 2, dt); alt = CEIL - 0.42; flap = 0; spd = 0;
        this.flapA = hash1(Math.floor(t * 2 + this.i * 7)) < 0.06 ? 0.3 : 0;
        break;
      }
      case 'wake': {
        this.face(Math.atan2(PL.x - this.x, PL.z - this.z), 4, dt); alt = 2.1; flap = 14;
        if (this.stT > 0.9) { this.st = this.lit || this.seen ? 'hunt' : 'drift'; this.stT = 0; }
        break;
      }
      case 'hunt': {
        G.chase = Math.max(G.chase, 0.6); PL.fear = Math.max(PL.fear, 0.75);
        this.unT5 = this.seen ? 0 : this.unT5 + dt;
        if (this.unT5 > 2.4) {   // it lost you: circle a lamp if one is close, else search where it last saw you
          const L = this.nearLamp(8); if (L) { this.lamp = L; this.st = 'circle'; } else this.st = 'search';
          this.stT = 0; break;
        }
        const F = this.field(PL.cell); if (F[this.cell()] < 0) { this.st = 'search'; this.stT = 0; break; }
        spd = [3.0, 3.4, 3.8][G.diff] * (0.85 + 0.3 * Math.max(0, Math.sin(t * 3.1 + this.i)));
        this.navTo(PL.x, PL.z, spd, dt, F); alt = lerp(1.45, 2.2, clamp(d / 6, 0, 1)); flap = 13;
        if (d < 6) AI.flick = Math.max(AI.flick, 0.35);
        if (d < 1.2 && this.atkCd <= 0 && play) this.attack();
        break;
      }
      case 'retreat': {
        const r = this.navTo(this.away.x, this.away.z, 3.4, dt); spd = 3.4; alt = 2.3; flap = 14;
        if (r < 0.6 || this.stT > 2.6) { this.st = this.lit ? 'hunt' : 'search'; this.stT = 0; this.unT5 = 0; }
        break;
      }
      case 'search': {
        const g = this.lk || this.home, r = this.navTo(g.x, g.z, 1.8, dt); spd = 1.8; alt = 2.0; flap = 9;
        if ((r < 0.8 && this.stT > 3) || this.stT > 9) { const L = this.nearLamp(10); if (L) { this.lamp = L; this.st = 'circle'; } else this.st = 'drift'; this.stT = 0; this.wp = null; }
        break;
      }
      case 'circle': {   // spiralling round a light, oblivious - until your flashlight comes on
        const L = this.lamp, R = 0.95 + 0.25 * Math.sin(t * 0.7 + this.i); this.orbA += dt * 1.9;
        const ly = L.y ?? (LV.zone[cIdx(cellOf(L.x), cellOf(L.z))] === Z5.BEV ? 5.4 : CEIL - 0.45);
        this.navTo(L.x + Math.sin(this.orbA) * R, L.z + Math.cos(this.orbA) * R, 2.2, dt); spd = 2.2; alt = Math.min(ly - 0.1, top); flap = 11;
        if (this.stT > rnd(14, 20)) { this.st = 'drift'; this.stT = 0; this.wp = null; }
        break;
      }
      case 'drift': {
        if (!this.wp) { const c = randCell5(this, 5); this.wp = c >= 0 ? cellPt(c, 0.9, 0.4) : { x: this.home.x, z: this.home.z }; }
        const r = this.navTo(this.wp.x, this.wp.z, 1.5, dt); spd = 1.5; alt = 2.0 + 0.3 * Math.sin(t * 0.8 + this.i); flap = 8;
        if (r < 0.8) this.wp = null;
        this.driftT += dt;
        if (PL.fk < 0.5 && this.driftT > 6 && RNG() < dt * 0.1) { const L = this.nearLamp(9); if (L) { this.lamp = L; this.st = 'circle'; this.stT = 0; } }
        if (this.stT > 34) { this.st = 'return'; this.stT = 0; this.driftT = 0; }
        break;
      }
      case 'return': {
        const r = this.navTo(this.home.x, this.home.z, 1.6, dt); spd = 1.6; alt = r < 1.5 ? CEIL - 0.42 : 2.1; flap = r < 1.5 ? 5 : 8;
        if (r < 0.35) { this.st = 'roost'; this.stT = 0; }
        break;
      }
    }
    // altitude, bob, wingbeat
    const bob = this.st === 'roost' ? 0 : Math.sin(t * 2.3 + this.bob) * 0.12 + Math.sin(t * flap * 0.5) * 0.03;
    this.y = damp(this.y, clamp(alt, 0.9, top) + bob, this.st === 'hunt' ? 3.5 : 2, dt);
    this.pitch = damp(this.pitch, this.st === 'roost' ? -0.25 : clamp(this.spd * 0.06, 0, 0.3), 4, dt); if (this.st === 'roost') this.roll = damp(this.roll, 0, 3, dt);
    this.wph += dt * flap * TAU * 0.5;
    const A = this.st === 'roost' ? this.flapA : 0.75, sweep = this.st === 'roost' ? 1.15 : 0.25 + 0.1 * Math.sin(this.wph * 0.5);
    for (const W of this.rig.wings) { const lift = this.st === 'roost' ? -0.25 + A * Math.sin(t * 30) : 0.15 + A * Math.sin(this.wph + (W.fore ? 0 : 0.5)); W.n.rotation.set(0, W.s * (W.fore ? sweep : sweep + 0.35), W.s * lift); }
    this.sync();
  }
}
function randCell5(a, R) {   // a random reachable cell of the moth's own domain within R steps of its nest
  const F = bfs(a.nest.c % N, (a.nest.c / N) | 0, a.cellFn, a.edgeFn), out = [];
  for (let i = 0; i < F.length; i++) if (F[i] >= 0 && F[i] <= R) out.push(i);
  return out.length ? pick(out) : -1;
}
function spawnMoth5(n) { const m = new Moth(n, AI5.moths.length); AI.all.push(m); AI5.moths.push(m); return m; }
function initAI5() {
  Object.assign(AI, { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null, flick: 0 });
  AI5.moths = [];
  for (const n of W5.nests.filter(n => !n.boil)) { spawnMoth5(n); if (G.diff === 2 && RNG() < 0.6) spawnMoth5(n); }
  const bn = W5.nests.filter(n => n.boil); if (bn.length) for (let i = 0; i < [2, 3, 3][G.diff]; i++) spawnMoth5(bn[i % bn.length]);
}
// steam from a valve rouses the moths down in the boiler room
function wakeBoiler5(v, all) {
  const bm = AI5.moths.filter(m => m.boil && m.st === 'roost').sort((a, b) => dist2(a.x, a.z, v.x, v.z) - dist2(b.x, b.z, v.x, v.z));
  for (const m of all ? bm : bm.slice(0, 1)) { m.wake('steam'); m.lk = { x: v.x, z: v.z }; }
}
function foes5() {
  const out = [], pb = boilZ5(LV.zone[cIdx(cellOf(PL.x), cellOf(PL.z))]);
  for (const m of AI5.moths) {
    if (m.st === 'roost' || m.boil !== pb) continue;
    const d = m.d, ch = m.st === 'hunt' || m.st === 'wake' || m.st === 'retreat', maxD = ch ? 24 : 16; if (d > maxD) continue;
    out.push({ ang: Math.atan2(m.x - PL.x, m.z - PL.z), d, k: clamp(1 - d / maxD, 0.2, 1), ch, kind: 'w', fl: 0 });
  }
  return out.sort((a, b) => a.d - b.d).slice(0, 3);
}
function updateAI5(dt) {
  PL.fear = 0; PL.interf = 0; AI.flick = 0; G.chase = 0;
  for (const a of AI.all) a.update(dt);
  // the nearest flying moth: a soft, fast flutter you can track through walls
  let bm = null, bd = 18;
  for (const m of AI5.moths) { if (m.st === 'roost') continue; const d = m.d; if (d < bd) { bd = d; bm = m; } }
  if (AU.ctx && !AI5.fl) AI5.fl = mkFlutter5();
  if (AI5.fl) {
    if (bm) { AI5.fl.set(bm.x, bm.y, bm.z, PL.x, PL.z); AI5.fl.lfo.frequency.value = bm.st === 'hunt' ? 14 : 9; }
    setGain(AI5.fl, bm && G.state === 'play' ? (bm.st === 'hunt' ? 0.75 : 0.4) * clamp(1.2 - bd / 18, 0, 1) : 0, 0.2);
  }
  AI.visT -= dt;
  if (AI.visT <= 0) { AI.visT = 0.1; for (const a of AI.all) if (a.st !== 'roost' || a.d < 34) a.cull(); }
  const cs = [];
  for (const a of AI.all) if (a.shown && a.shadowR > 0) { const d = a.d; if (d < 20) cs.push([d, a]); }
  cs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 8; i++) { const a = cs[i] && cs[i][1]; if (a) setShadowCaster(i, a.x, a.z, a.shadowR, 0.45); else setShadowCaster(i, 0, 0, 0, 0); }
}
