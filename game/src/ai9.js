// ---------- Level 9 AI: the Neighborhood Watch, the Wretches, the lab subject, Dr. Hale ----------
const AI9 = { watch: [], wretches: [], subject: null, hale: null, streets: null };

// ----- rigs (animHuman-compatible) -----
function buildWatch() {
  if (sknOn()) return buildWatchSk();
  const mat = actMat('watch', { spec: 0.22, shin: 14, wrinkle: 0.6, emis: 1, wet: 0.1, wrap: 0.25, mottle: 0.6 });
  const SK = [0.3, 0.29, 0.27], COAT = [0.12, 0.11, 0.1], VEST = [0.8, 0.33, 0.05], REF = [0.9, 0.9, 0.8], PANT = [0.08, 0.08, 0.09], CAP = [0.08, 0.1, 0.18];
  const root = tnode(null), r = { root, mat, kind: 'watch', hipH: 1.36 };
  const rag = (x, y, z) => 0.75 + 0.25 * Math.sin(x * 41 + y * 17 + z * 29);
  r.hips = tnode(root, 0, r.hipH, 0); r.torso = tnode(r.hips, 0, 0.02, 0);
  part('Capsule', { height: 0.95, radius: 0.15, tessellation: 12 }, r.torso, mat, COAT, 0, [0, 0.45, 0], null, [1.3, 1, 0.72], rag);
  part('Box', { width: 0.42, height: 0.46, depth: 0.25 }, r.torso, mat, VEST, 0.05, [0, 0.56, 0]);
  for (const y of [0.46, 0.66]) part('Box', { width: 0.425, height: 0.035, depth: 0.255 }, r.torso, mat, REF, 0.45, [0, y, 0]);
  part('Box', { width: 0.1, height: 0.07, depth: 0.02 }, r.torso, mat, [0.9, 0.85, 0.3], 0.2, [0.1, 0.72, 0.13]);
  part('Cylinder', { diameterTop: 0.4, diameterBottom: 0.62, height: 0.6, tessellation: 12, cap: BABYLON.Mesh.NO_CAP, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, r.hips, mat, COAT, 0, [0, -0.25, 0], null, [1, 1, 0.8], rag);
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; part('Box', { width: 0.07, height: rnd(0.2, 0.42), depth: 0.01 }, r.hips, mat, COAT, 0, [Math.sin(a) * 0.29, -0.62, Math.cos(a) * 0.24], [0, a, rnd(-0.1, 0.1)]); }
  r.neck = tnode(r.torso, 0, 0.9, 0.04); r.neck.rotation.x = 0.28;
  part('Capsule', { height: 0.34, radius: 0.045, tessellation: 10 }, r.neck, mat, SK, 0, [0, 0.13, 0]);
  r.head = tnode(r.neck, 0, 0.3, 0.02);
  part('Sphere', { diameter: 0.25, segments: 14 }, r.head, mat, SK, 0, [0, 0.02, 0], null, [0.78, 1.4, 0.95]);
  part('Cylinder', { diameter: 0.24, height: 0.1, tessellation: 14 }, r.head, mat, CAP, 0, [0, 0.17, -0.01]);
  part('Box', { width: 0.2, height: 0.015, depth: 0.15 }, r.head, mat, CAP, 0, [0, 0.125, 0.14], [-0.15, 0, 0]);
  r.eyes = []; for (const s of [-1, 1]) r.eyes.push(part('Sphere', { diameter: 0.034, segments: 6 }, r.head, mat, [1, 0.95, 0.72], 2.4, [s * 0.043, 0.055, 0.108]));
  part('Box', { width: 0.075, height: 0.009, depth: 0.01 }, r.head, mat, [0.04, 0.02, 0.02], 0, [0, -0.08, 0.11]);
  r.sh = []; r.el = []; r.hands = [];
  for (const s of [-1, 1]) {
    const sh = tnode(r.torso, s * 0.26, 0.86, 0); r.sh.push(sh);
    part('Sphere', { diameter: 0.14, segments: 8 }, sh, mat, COAT, 0, [0, 0, 0]);
    part('Capsule', { height: 0.78, radius: 0.06, tessellation: 10 }, sh, mat, COAT, 0, [0, -0.36, 0], null, null, rag);
    const el = tnode(sh, 0, -0.72, 0); r.el.push(el);
    part('Capsule', { height: 0.74, radius: 0.045, tessellation: 10 }, el, mat, COAT, 0, [0, -0.33, 0], null, null, rag);
    const hand = tnode(el, 0, -0.7, 0); r.hands.push(hand);
    part('Sphere', { diameter: 0.08, segments: 6 }, hand, mat, SK, 0, [0, -0.02, 0]);
    for (let f = -1.5; f <= 1.5; f++) part('Capsule', { height: 0.24, radius: 0.011, tessellation: 5 }, hand, mat, SK, 0, [f * 0.018, -0.13, 0.01], [0.2, 0, f * 0.12]);
  }
  r.torch = part('Cylinder', { diameter: 0.06, height: 0.26, tessellation: 10 }, r.el[1], mat, [0.1, 0.1, 0.1], 0, [0, -0.78, 0.05]);
  part('Cylinder', { diameter: 0.07, height: 0.015, tessellation: 12 }, r.el[1], mat, [1, 0.95, 0.8], 1, [0, -0.915, 0.05]);
  r.hip = []; r.kn = [];
  for (const s of [-1, 1]) {
    const hp = tnode(r.hips, s * 0.11, -0.02, 0); r.hip.push(hp);
    part('Capsule', { height: 0.74, radius: 0.065, tessellation: 10 }, hp, mat, PANT, 0, [0, -0.33, 0]);
    const kn = tnode(hp, 0, -0.68, 0); r.kn.push(kn);
    part('Capsule', { height: 0.68, radius: 0.05, tessellation: 10 }, kn, mat, PANT, 0, [0, -0.31, 0]);
    part('Box', { width: 0.12, height: 0.1, depth: 0.3 }, kn, mat, [0.06, 0.05, 0.05], 0, [0, -0.63, 0.06]);
  }
  setEmi(mat, 0.7);
  root.scaling.set(1.14, 1.24, 1.14);   // r6: the procedural fallback grows with the skinned one
  return r;
}
function buildWretch(o = {}) {
  if (sknOn()) return buildWretchSk(o);
  const mat = actMat('wretch', { spec: 0.5, shin: 26, wrinkle: 0.85, emis: 1, wet: 0.3, wrap: 0.45, mottle: 0.95 });
  const SK = o.gown ? [0.5, 0.52, 0.44] : [0.36, 0.4, 0.3].map(v => v * rnd(0.85, 1.1)), DK = [0.1, 0.08, 0.07];
  const CL = o.gown ? [0.55, 0.62, 0.66] : pick([[0.3, 0.26, 0.22], [0.2, 0.24, 0.3], [0.4, 0.36, 0.3], [0.32, 0.2, 0.2]]), PANT = o.gown ? SK : [0.14, 0.14, 0.16];
  const root = tnode(null), r = { root, mat, kind: 'wretch', hipH: 0.84 };
  const rib = (x, y, z) => 0.82 + 0.18 * Math.sin(y * 70);
  r.hips = tnode(root, 0, r.hipH, 0); r.torso = tnode(r.hips, 0, 0.02, 0);
  part('Capsule', { height: 0.7, radius: 0.13, tessellation: 12 }, r.torso, mat, SK, 0, [0, 0.33, 0], null, [1.15, 1, 0.75], rib);
  part('Capsule', { height: 0.46, radius: 0.145, tessellation: 12 }, r.torso, mat, CL, 0, [0, 0.2, 0], null, [1.15, 1, 0.78], (x, y, z) => y < 0.3 && Math.sin(x * 50 + z * 30) > -0.6 ? 1 : 0.6);
  for (let i = 0; i < 6; i++) part('Sphere', { diameter: 0.045, segments: 5 }, r.torso, mat, SK, 0, [0, 0.12 + i * 0.1, -0.1]);
  r.neck = tnode(r.torso, 0, 0.66, 0.05); r.neck.rotation.x = 0.5;
  part('Capsule', { height: 0.26, radius: 0.04, tessellation: 8 }, r.neck, mat, SK, 0, [0, 0.1, 0]);
  r.head = tnode(r.neck, 0, 0.24, 0.02);
  part('Sphere', { diameter: 0.22, segments: 14 }, r.head, mat, SK, 0, [0, 0.03, 0], null, [0.82, 1.2, 1.02]);
  for (const s of [-1, 1]) { part('Sphere', { diameter: 0.06, segments: 8 }, r.head, mat, DK, 0, [s * 0.042, 0.06, 0.085]); part('Sphere', { diameter: 0.012, segments: 4 }, r.head, mat, [1, 0.9, 0.6], 1, [s * 0.042, 0.06, 0.112]); }
  r.jaw = tnode(r.head, 0, -0.05, 0.03);
  part('Box', { width: 0.11, height: 0.03, depth: 0.12 }, r.jaw, mat, SK, 0, [0, -0.03, 0.05]);
  part('Box', { width: 0.09, height: 0.05, depth: 0.02 }, r.head, mat, [0.12, 0.02, 0.02], 0, [0, -0.07, 0.1]);
  for (let i = 0; i < 5; i++) part('Box', { width: 0.01, height: 0.022, depth: 0.01 }, r.jaw, mat, [0.8, 0.76, 0.6], 0, [-0.04 + i * 0.02, -0.005, 0.105]);
  r.sh = []; r.el = []; r.hands = [];
  for (const s of [-1, 1]) {
    const sh = tnode(r.torso, s * 0.18, 0.6, 0); r.sh.push(sh);
    part('Capsule', { height: 0.52, radius: 0.04, tessellation: 8 }, sh, mat, SK, 0, [0, -0.23, 0]);
    const el = tnode(sh, 0, -0.47, 0); r.el.push(el);
    part('Capsule', { height: 0.5, radius: 0.032, tessellation: 8 }, el, mat, SK, 0, [0, -0.22, 0]);
    const hand = tnode(el, 0, -0.46, 0); r.hands.push(hand);
    for (let f = -1; f <= 1; f++) part('Capsule', { height: 0.2, radius: 0.01, tessellation: 5 }, hand, mat, DK, 0, [f * 0.022, -0.09, 0.01], [0.3, 0, f * 0.25]);
  }
  r.hip = []; r.kn = [];
  for (const s of [-1, 1]) {
    const hp = tnode(r.hips, s * 0.09, -0.02, 0); r.hip.push(hp);
    part('Capsule', { height: 0.46, radius: 0.052, tessellation: 8 }, hp, mat, PANT, 0, [0, -0.2, 0]);
    const kn = tnode(hp, 0, -0.42, 0); r.kn.push(kn);
    part('Capsule', { height: 0.44, radius: 0.036, tessellation: 8 }, kn, mat, SK, 0, [0, -0.2, 0]);
    part('Capsule', { height: 0.2, radius: 0.028, tessellation: 6 }, kn, mat, SK, 0, [0, -0.41, 0.06], [Math.PI / 2, 0, 0]);
  }
  setEmi(mat, 0.5);
  return r;
}
function buildHale() {
  if (sknOn()) return buildHaleSk();
  const mat = actMat('hale', { spec: 0.28, shin: 20, wrinkle: 0.35, emis: 1, wrap: 0.5, mottle: 0.2 });
  const SKN = [0.7, 0.54, 0.44], COAT = [0.84, 0.85, 0.83], SHIRT = [0.32, 0.42, 0.55], PANT = [0.22, 0.22, 0.25], HAIR = [0.3, 0.27, 0.24], SHOE = [0.08, 0.07, 0.07];
  const root = tnode(null), r = { root, mat, kind: 'human', hipH: 0.95 };
  r.hips = tnode(root, 0, r.hipH, 0); r.torso = tnode(r.hips, 0, 0.02, 0);
  part('Capsule', { height: 0.66, radius: 0.16, tessellation: 12 }, r.torso, mat, SHIRT, 0, [0, 0.3, 0], null, [1.15, 1, 0.75]);
  part('Capsule', { height: 0.7, radius: 0.175, tessellation: 12 }, r.torso, mat, COAT, 0, [0, 0.3, -0.01], null, [1.18, 1, 0.8], (x, y, z) => z > 0.06 && Math.abs(x) < 0.07 ? 0.2 : 1);
  part('Cylinder', { diameterTop: 0.4, diameterBottom: 0.5, height: 0.62, tessellation: 12, cap: BABYLON.Mesh.NO_CAP, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, r.hips, mat, COAT, 0, [0, -0.25, -0.01], null, [1, 1, 0.8]);
  part('Box', { width: 0.07, height: 0.09, depth: 0.01 }, r.torso, mat, [0.9, 0.9, 0.85], 0, [0.1, 0.44, 0.15]);
  r.neck = tnode(r.torso, 0, 0.64, 0); r.head = tnode(r.neck, 0, 0.14, 0.01);
  part('Cylinder', { diameter: 0.1, height: 0.12, tessellation: 10 }, r.neck, mat, SKN, 0, [0, 0.03, 0]);
  part('Sphere', { diameter: 0.22, segments: 14 }, r.head, mat, SKN, 0, [0, 0.07, 0], null, [0.9, 1.1, 1]);
  part('Sphere', { diameter: 0.235, segments: 12 }, r.head, mat, HAIR, 0, [0, 0.11, -0.02], null, [0.92, 0.85, 1], (x, y, z) => (y > 0.02 || z < -0.02) ? 1 : 0.3);
  part('Sphere', { diameter: 0.04, segments: 6 }, r.head, mat, SKN, 0, [0, 0.05, 0.105]);
  for (const s of [-1, 1]) part('Torus', { diameter: 0.055, thickness: 0.008, tessellation: 10 }, r.head, mat, [0.15, 0.15, 0.15], 0, [s * 0.04, 0.08, 0.1], [Math.PI / 2, 0, 0]);
  r.sh = []; r.el = []; r.hands = [];
  for (const s of [-1, 1]) {
    const sh = tnode(r.torso, s * 0.22, 0.58, 0); r.sh.push(sh);
    part('Capsule', { height: 0.36, radius: 0.06, tessellation: 10 }, sh, mat, COAT, 0, [0, -0.15, 0]);
    const el = tnode(sh, 0, -0.3, 0); r.el.push(el);
    part('Capsule', { height: 0.34, radius: 0.05, tessellation: 10 }, el, mat, COAT, 0, [0, -0.14, 0]);
    const hand = tnode(el, 0, -0.3, 0); r.hands.push(hand);
    part('Sphere', { diameter: 0.08, segments: 8 }, hand, mat, SKN, 0, [0, -0.03, 0], null, [0.8, 1.1, 0.6]);
  }
  r.card = part('Box', { width: 0.055, height: 0.085, depth: 0.004 }, tnode(r.hands[1], 0, 0, 0), mat, [0.92, 0.9, 0.85], 0.3, [0, -0.08, 0.04], [0.3, 0, 0]);
  r.hip = []; r.kn = [];
  for (const s of [-1, 1]) {
    const hp = tnode(r.hips, s * 0.1, -0.02, 0); r.hip.push(hp);
    part('Capsule', { height: 0.5, radius: 0.07, tessellation: 10 }, hp, mat, PANT, 0, [0, -0.22, 0]);
    const kn = tnode(hp, 0, -0.46, 0); r.kn.push(kn);
    part('Capsule', { height: 0.46, radius: 0.055, tessellation: 10 }, kn, mat, PANT, 0, [0, -0.21, 0]);
    part('Box', { width: 0.1, height: 0.08, depth: 0.25 }, kn, mat, SHOE, 0, [0, -0.45, 0.05]);
  }
  setEmi(mat, 0.2);
  return r;
}

// ----- helpers -----
function streetCells9() { if (!AI9.streets) { AI9.streets = []; for (let i = 0; i < N * N; i++) if (LV.zone[i] === ZN.STREET) AI9.streets.push(i); } return AI9.streets; }
const watchEdge = (x, y, d) => !doorClosed(x, y, d);
function footAt(a, key, vol, rate, dist = 30) { if (a.d < dist) playS(bpick(key), { pos: a.pos(0.1), vol, rate: rate * rnd(0.94, 1.06) }); }
// physical distance to the player (upstairs floors are stored off-map, see phys9)
function physD9(a) { const P = phys9(PL.x, PL.z), q = phys9(a.x, a.z); return Math.hypot(q[0] - P[0], q[1] - P[1], q[2] - P[2]); }
// loud, lightly-occluded footsteps so you can track enemies through walls and floors
function footAt9(a, key, vol, rate, dist, ref = 3) { if (physD9(a) < dist) playS(bpick(key), { pos: a.pos(0.1 + (a.yOff || 0)), vol, rate: rate * rnd(0.94, 1.06), ref, roll: 1.05, occF: 1700 }); }
function stepPhase(a, dt, len, cb) { const p0 = a.stepPh || 0; a.stepPh = p0 + a.spd * dt / len; if (Math.floor(a.stepPh) !== Math.floor(p0)) cb(); }
function knock(a, dmg, cause, push) {
  const dx = PL.x - a.x, dz = PL.z - a.z, dd = Math.hypot(dx, dz) || 1; PL.kx = dx / dd * push; PL.kz = dz / dd * push;
  PL.lookAt = { x: a.x, y: a.rig.hipH + 0.9, z: a.z }; PL.lookK = 0.45; hurt(dmg, cause);
}

// ================= THE NEIGHBORHOOD WATCH =================
class Watch extends Agent {
  constructor(i) {
    super(buildWatch(), 0.36); mergeRig(this.rig);
    Object.assign(this, { i, st: 'patrol', wp: null, callT: rnd(12, 30), beat: null, whistled: -99, percT: 0, sus: 0, lk: null, lost: 0, atkCd: 0, leaveT: 0, lurkT: 0, bangT: 0, door: null, look: 0, seen: false, shadowR: 0.7, stT: 0, bangs: 0 });
    this.edgeFn = watchEdge;
  }
  newWaypoint(far) {
    const B = this.beat; if (B && FX.t < B.until && !far && B.cells.length && RNG() < 0.8) { this.wp = cellPt(pick(B.cells), 0.7, 0.4); return; }   // r6: walking a beat round one house
    const S = streetCells9(); let c = -1;
    for (let k = 0; k < 20; k++) {
      const q = pick(S), x = cellCenter(q % N), z = cellCenter((q / N) | 0), d = dist2(x, z, this.x, this.z), dp = dist2(x, z, PL.x, PL.z);
      if (d < 16 || d > 75) continue; if (far && dp < 36) continue;
      c = q; if (far || RNG() < 0.55 || dp < 40) break;
    }
    if (c < 0) c = pick(S);
    this.wp = cellPt(c, 0.7, 0.4);
  }
  canSee() {
    if (G.state !== 'play' || this.leaveT > 0) return false;
    const d = this.d; if (d > 42 || !los(this.x, this.z, PL.x, PL.z)) return false;
    const ang = Math.atan2(PL.x - this.x, PL.z - this.z), off = Math.abs(angDiff(this.yaw + this.look, ang));
    if (d < 2.2) return true;
    if (d < 21 && off < 0.36) return true;                 // caught in its torch beam
    if (off > 1.25) return false;
    return d < 2.5 + playerVis() * 24 * (PL.ck > 0.5 ? 0.6 : 1);
  }
  startChase() {
    this.st = 'notice'; this.stT = 0; this.lost = 0; this.lk = { x: PL.x, z: PL.z };
    playS(bpick('howl'), { pos: this.pos(2.3), vol: 1.3, rate: 0.7, ref: 4, roll: 0.8 });
    if (FX.t - (G.lastSting ?? -99) > 20) { SFX.sting(); G.lastSting = FX.t; }
    FX.glitch = Math.max(FX.glitch, 0.9);
    if (!G9.watchSeen) { G9.watchSeen = true; later(1.6, () => radio9('watch')); }
  }
  attack() {
    this.atkCd = 3; SFX.jumpscare(); playS(bpick('scrLo'), { pos: this.pos(2.2), vol: 1.1, rate: 0.75 });
    if (this.rig.sk) rigPlay(this.rig, 'hook', { upper: true, fade: 0.08, restart: true });
    knock(this, 50, 'watch', 7);
    if (G.state === 'play') { this.st = 'leave'; this.leaveT = 15; this.newWaypoint(true); }
  }
  update(dt) {
    const d = this.d, t = FX.t, play = G.state === 'play';
    this.stT += dt; this.atkCd -= dt; this.leaveT -= dt; this.percT -= dt;
    if (this.percT <= 0) {
      this.percT = 0.15; this.seen = this.canSee();
      if (this.seen) { this.lk = { x: PL.x, z: PL.z }; this.lost = 0; }
      if (['patrol', 'search', 'lurk'].includes(this.st)) {
        if (this.seen) { this.sus += 0.15 * (d < 12 ? 3 : 1.4) * (PL.run ? 1.5 : 1); if (this.sus > 1 || d < 5) { this.sus = 0; this.startChase(); } }
        else {
          this.sus = Math.max(0, this.sus - 0.05);
          if (play && PL.noise > 0.05 && this.st === 'patrol' && this.leaveT <= 0 && d < PL.noise * 16) { this.st = 'search'; this.stT = 0; this.lk = { x: PL.x + rnd(-2, 2), z: PL.z + rnd(-2, 2) }; }
        }
      }
    }
    if (play && ['patrol', 'search', 'leave'].includes(this.st) && (this.callT -= dt) <= 0) { this.callT = rnd(...[[30, 55], [25, 45], [20, 38]][G.diff]); watchWhistle9(this); }   // r6: the rounds have a whistle
    let spd = 1.45, amp = 0.55, look = Math.sin(t * 0.55 + this.i * 2) * 0.55, armR = -1.15, lean = 0.12;
    switch (this.st) {
      case 'patrol': case 'leave': {
        if (!this.wp) this.newWaypoint(this.st === 'leave');
        const r = this.navTo(this.wp.x, this.wp.z, this.st === 'leave' ? 2.2 : 1.45, dt);
        this.stuckT = this.spd < 0.15 ? (this.stuckT || 0) + dt : 0; if (this.stuckT > 4) { this.stuckT = 0; this.wp = null; break; }   // r6: no way through: go somewhere else
        if (r < 1.0) { if (this.st === 'leave' && this.leaveT <= 0) this.st = 'patrol'; this.newWaypoint(this.st === 'leave'); }
        if (this.st === 'leave') spd = 2.2;
        break;
      }
      case 'search': {
        const r = this.navTo(this.lk.x, this.lk.z, 2.4, dt); spd = 2.4; look = Math.sin(t * 1.6) * 0.9;
        if (r < 1.2 || this.stT > 14) { this.spd = damp(this.spd, 0, 6, dt); spd = 0; if (this.stT > 20 || (r < 1.2 && (this.lurkT += dt) > 5)) { this.lurkT = 0; this.st = 'patrol'; this.wp = null; } }
        break;
      }
      case 'notice': {
        this.face(Math.atan2(PL.x - this.x, PL.z - this.z), 6, dt); this.spd = damp(this.spd, 0, 8, dt); spd = 0; look = 0; armR = -1.35;
        this.rig.head.rotation.z = Math.sin(t * 30) * 0.05;
        if (this.stT > 1.1) { this.st = 'chase'; this.stT = 0; }
        break;
      }
      case 'chase': {
        G.chase = 1; PL.fear = Math.max(PL.fear, 1); look = 0; armR = -0.4; amp = 1.25; lean = 0.3;
        if (!this.seen) this.lost += dt;
        const F = this.field(PL.cell), mine = F[this.cell()];
        if (mine < 0) { this.st = 'lurk'; this.stT = 0; this.bangs = 0; this.door = this.findDoor(); break; }
        spd = [4.5, 5.1, 5.7][G.diff] * (d < 3 ? 0.8 : 1);
        this.navTo(this.seen || this.lost < 1.5 ? PL.x : this.lk.x, this.seen || this.lost < 1.5 ? PL.z : this.lk.z, spd, dt, F);
        if (d < 1.35 && this.atkCd <= 0 && play && los(this.x, this.z, PL.x, PL.z)) this.attack();
        else if (this.lost > 7) { this.st = 'search'; this.stT = 0; }
        break;
      }
      case 'lurk': {   // you are behind a closed door it cannot open
        PL.fear = Math.max(PL.fear, 0.7);
        const F = this.field(PL.cell); if (F[this.cell()] >= 0) { this.st = 'chase'; this.stT = 0; break; }
        const dr = this.door;
        if (dr) {
          const ox = dr.out[0], oz = dr.out[1], r = this.navTo(ox, oz, 2.6, dt); spd = 2.6;
          if (r < 0.7) { spd = 0; this.face(Math.atan2(dr.mx - this.x, dr.mz - this.z), 5, dt); this.bangT -= dt;
            if (this.bangT <= 0 && this.bangs < 3) { this.bangT = rnd(1.6, 2.6); this.bangs++; bangDoor(dr, 1.3); if (this.rig.sk) rigPlay(this.rig, 'punch', { upper: true, fade: 0.1, restart: true, t: 0.12 }); else armR = -1.6; } }
        } else spd = 0;
        if (this.stT > (dr ? 11 : 4)) { this.st = 'leave'; this.leaveT = 10; this.newWaypoint(true); if (!G9.lurkTip) { G9.lurkTip = true; later(1, () => radio9('lost')); } }
        break;
      }
    }
    if (spd === 0) amp = 0;
    // r6: under a roof it has to stoop; on its rounds the head snaps round now and then, too fast, and tilts back slowly
    const stoop = indoorZ(LV.zone[this.cell()]); if (stoop) lean += 0.75;
    if (['patrol', 'search', 'leave'].includes(this.st) && (this.jerkT = (this.jerkT ?? rnd(3, 8)) - dt) <= 0) { this.jerkT = rnd(3.5, 9); this.look = rnd(-1.4, 1.4); this.tilt = rnd(-0.55, 0.55); }
    this.tilt = damp(this.tilt || 0, 0, 1.1, dt); if (this.st !== 'notice') this.rig.head.rotation.z = this.tilt;
    this.look = damp(this.look, look, 3, dt);
    this.ph += this.spd * dt * 2.1; const a = clamp(this.spd / 1.5, 0, 1.3);
    animHuman(this.rig, this.ph, Math.max(0.12, Math.min(amp, a)), { armR: armR + Math.sin(t * 1.3) * 0.08, elR: -0.35, look: this.look * 0.6, lean, armA: 0.35, legA: 0.5, drop: stoop ? -0.32 : 0 });
    this.rig.sh[1].rotation.y = this.look;
    stepPhase(this, dt, 1.25, () => footAt9(this, 'hstep', this.st === 'chase' ? 1.15 : 0.8, 0.72, 34, 3.2));
    this.sync();
    if (d < 24) AI.flick = Math.max(AI.flick, (1 - d / 24) * (this.st === 'chase' ? 1 : 0.5));
    if (d < 20 && this.seen) PL.fear = Math.max(PL.fear, 0.45);
  }
  findDoor() {   // the closed door of the building you are hiding in, nearest to it
    const b = LV.bld[PL.cell]; let best = null, bd = 1e9;
    for (const dr of W9.doors) {
      if (dr.target || !(dr.dk === 'front' || dr.dk === 'back' || dr.dk === 'base')) continue;
      const e = dr.e, bb = LV.bld[cIdx(e.x, e.y)]; if (bb !== b) continue;
      const dd = dist2(dr.mx, dr.mz, this.x, this.z); if (dd < bd) { bd = dd; best = dr; }
    }
    if (best && !best.out) { const e = best.e; best.out = [best.mx + DX[e.d] * 1.0, best.mz + DY[e.d] * 1.0]; }
    return best;
  }
}

// ================= THE WRETCHES =================
// Easy: house Wretches move slower than the player's walk (2.35 m/s), so walking away works and sprinting clearly escapes.
const WR9_CHASE = [1.75, 2.9, 3.3];   // chase base speed; ±20% surge  →  easy 1.4–2.1 m/s
const wrK9 = () => (G.diff === 0 ? 0.72 : 1);   // other fast moves (doorway linger, door approach, stair climb)
// Hearing: Wretches are blind. They only notice you by sound, and only while you are inside their house.
// A noise of level n (PL.noise: crouch ≈0.04, walk ≈0.42, sprint 1) carries n × hearR9 metres (physical distance, floors included).
const WR9_HEAR = [6.5, 8.5, 10];     // metres at full noise for a sleeping Wretch (walking ≈ 0.42 of that, crouching ≈ 0.04)
const WR9_SUS = [0.6, 0.9, 1.3];     // how fast hearing you turns into waking (per second, ×0.4–1.6 by how clearly): ~1–2.5 s of noise wakes a sleeper
const WR9_FORGET = [4, 6, 8];
const WR9_ROAM = [0.8, 1.0, 1.15];   // r6: house Wretches roam their house at a shuffle (m/s), stopping now and then to listen        // seconds of silence before a chasing Wretch loses you
function hearR9(w) { return WR9_HEAR[G.diff] * (w.st === 'chase' ? 1.5 : w.st === 'lost' ? 1.2 : 1); }
function hear9(w) {   // 0 = it can't hear you; up to 1 = loud and close
  if (G.state !== 'play' || !w.present || !w.inHouse(PL.cell)) return 0;
  const d = physD9(w);
  if (w.st === 'chase' && d < 1.8) return 1;          // close enough to hear you breathe
  const R = PL.noise * hearR9(w);
  return R > 0.15 && d < R ? clamp(1 - d / R, 0.05, 1) : 0;
}
function noiseAt9(x, z, lvl, add) {   // a sound in the world (terminal modem, …): nearby Wretches in that house stir
  const c = cIdx(cellOf(x), cellOf(z)), P = phys9(x, z);
  for (const w of AI9.wretches) {
    if (!w.present || !w.inHouse(c) || !['dormant', 'prowl', 'return', 'lost', 'rest'].includes(w.st)) continue;
    const q = phys9(w.x, w.z), d = Math.hypot(q[0] - P[0], q[1] - P[1], q[2] - P[2]), R = lvl * hearR9(w);
    if (d < R) { w.sus = Math.min(1, (w.sus || 0) + add * (0.5 + (1 - d / R))); w.lk = { x, z }; }
  }
}
// HUD: how loud you may be before the nearest Wretch in this house hears you (lim = null when none can)
function hearLimit9() {
  let lim = null, sus = 0, heard = false, hunt = false;
  if (LVL !== 9 || G.state !== 'play') return { lim, sus, heard, hunt };
  for (const w of AI9.wretches) {
    if (!w.present || !w.inHouse(PL.cell)) continue;
    const l = physD9(w) / hearR9(w); if (lim === null || l < lim) lim = l;
    if (['chase', 'wake', 'bang', 'climb'].includes(w.st)) hunt = true;
    else { sus = Math.max(sus, w.sus || 0); if (w.hear > 0) heard = true; }
  }
  return { lim, sus, heard, hunt };
}
class Wretch extends Agent {
  constructor(h, cell, o = {}) {
    super(buildWretch(o), 0.3); mergeRig(this.rig);
    this.h = h; this.lab = !!o.lab;
    this.cellFn = this.lab ? (c => LV.zone[c] !== ZN.LAB) : (c => LV.bld[c] !== h.id);
    this.edgeFn = (x, y, d) => { const dr = doorOn(x, y, d); return !dr || !dr.latched; };
    const p = cellPt(cell, 0.9, 0.35); this.home = p; this.hyaw = rnd(0, TAU);
    Object.assign(this, { st: 'rest', restT: rnd(1, 6), stT: 0, percT: rnd(0, 0.3), atkCd: 0, lk: null, doorT: 0, bangT: 0, bangs: 0, bdoor: null, look: 0, twitch: 0, shadowR: 0.5, scrCd: 0, wakeCd: 0, yOff: 0, unheardT: 0, sus: 0, hear: 0, stirred: false, cl: null });
    this.place(p.x, p.z, this.hyaw);
  }
  inHouse(c) { return this.lab ? LV.zone[c] === ZN.LAB : LV.bld[c] === this.h.id; }
  wake(why) {
    if (!['dormant', 'return', 'prowl', 'rest'].includes(this.st)) return;
    this.st = 'wake'; this.stT = 0; this.lk = { x: PL.x, z: PL.z };
    if (this.rig.sk) { rigBase(this.rig, null); rigPlay(this.rig, 'hit', { fade: 0.06, restart: true }); }
    if (this.scrCd <= 0) { this.scrCd = 6; playS(bpick('scrHi'), { pos: this.pos(1.3), vol: 1.1, rate: rnd(1.15, 1.35) }); }
    FX.glitch = Math.max(FX.glitch, 0.8);
    if (!G9.wretchSeen && this.d < 14) { G9.wretchSeen = true; later(2.2, () => radio9('wretch')); }
  }
  attack() {
    this.atkCd = 2; SFX.jumpscare(); playS(bpick('scrHi'), { pos: this.pos(1.3), vol: 1.0, rate: 1.3 });
    if (this.rig.sk) rigPlay(this.rig, 'hook', { upper: true, fade: 0.08, restart: true, rate: 1.3 });
    knock(this, [16, 20, 26][G.diff], 'wretch', 4);
  }
  sync() { super.sync(); this.rig.root.position.y = this.yOff || 0; }
  hearTick() {   // every 0.2 s: listen; suspicion builds while it hears you and fades in silence
    this.hear = hear9(this);
    if (this.hear > 0) { this.lk = { x: PL.x, z: PL.z }; this.unheardT = 0; }
    if (!['dormant', 'prowl', 'return', 'lost', 'rest'].includes(this.st)) { this.sus = 0; return; }
    const alert = this.st === 'lost';   // r6: roaming is its normal state; only a Wretch that just lost you listens harder
    if (this.hear > 0) this.sus = Math.min(1, this.sus + 0.2 * WR9_SUS[G.diff] * (alert ? 1.5 : 1) * (0.4 + 1.2 * this.hear));
    else this.sus = Math.max(0, this.sus - 0.2 * 0.3);
    if (this.sus >= 1) {
      this.sus = 0; this.stirred = false;
      if (['dormant', 'rest', 'prowl', 'return'].includes(this.st)) this.wake('heard');
      else { this.st = 'chase'; this.stT = 0; this.unheardT = 0; if (this.scrCd <= 0) { this.scrCd = 6; playS(bpick('scrHi'), { pos: this.pos(1.3), vol: 1.0, rate: rnd(1.15, 1.35) }); } }
      return;
    }
    if (this.sus > 0.3 && !this.stirred) {   // it heard something: a low groan, and the HUD warns you
      this.stirred = true; if (physD9(this) < 20) playS(bpick('scrLo'), { pos: this.pos(1.2), vol: 0.32, rate: rnd(0.55, 0.65), occF: 1700 });
      if (!G9.stirTip) { G9.stirTip = true; toast('SOMETHING HEARD YOU · STAY QUIET', 2.6); }
    }
    if (this.sus < 0.1) this.stirred = false;
  }
  // house helpers: which floor I'm on, walking to the stairs and climbing them
  myFl() { return this.lab ? 0 : floorOf(this.cell()); }
  toStairs(spd, dt) {
    const s = this.h && this.h.stair; if (!s) return false;
    const up = this.myFl() === 0, g = up ? s.gGoal : s.uGoal, F = this.field(cIdx(cellOf(g.x), cellOf(g.z)));
    if (F[this.cell()] < 0) return false;
    const r = this.navDoors(g.x, g.z, spd, dt, F);
    if (r < 0.5) this.startClimb(up);
    return true;
  }
  goH(x, z, spd, dt) {   // navigate anywhere in the house, taking the stairs if the goal is on the other floor
    if (!this.lab && this.h.stair && floorOf(cIdx(cellOf(x), cellOf(z))) !== this.myFl()) { if (!this.toStairs(spd, dt)) { this.wp = null; return 0; } return 9; }
    return this.navDoors(x, z, spd, dt);
  }
  startClimb(up) {
    this.cl = { up, t: 0, dur: (this.st === 'chase' ? 1.6 : 2.6) / wrK9(), prev: this.st, stT: this.stT }; this.st = 'climb';
    if (physD9(this) < 16) playS(bpick('wstep'), { pos: this.pos(0.2), vol: 0.9, rate: 0.9, ref: 3, occF: 1700 });
  }
  update(dt) {
    const d = this.d, t = FX.t, play = G.state === 'play';
    this.stT += dt; this.atkCd -= dt; this.percT -= dt; this.scrCd -= dt;
    if ((this.st === 'dormant' || this.st === 'rest' || this.st === 'prowl') && physD9(this) > 30) { if (this.shown) this.cull(); return; }   // far away: it keeps its place
    let spd = 0, lean = 0.75, armL = -0.3, armR = -0.3, look = 0, drop = -0.06, amp = 0;
    if (this.percT <= 0) {
      this.percT = 0.2; this.hearTick();
    }
    switch (this.st) {
      case 'dormant': {
        const s = this.sus; this.spd = 0;
        if (s > 0.3 && this.lk) this.face(Math.atan2(this.lk.x - this.x, this.lk.z - this.z), 1.2, dt); else this.face(this.hyaw, 2, dt);   // it turns toward the sound
        this.twitch = hash1(Math.floor(t * 3 + this.home.x)) < 0.1 + s * 0.5 ? Math.sin(t * 40) * 0.2 * (1 + s) : 0;
        look = this.twitch; lean = 0.95; armL = armR = 0.05; drop = -0.1;
        if (this.rig.sk) { lean = 0.25; drop = 0; }   // skinned: crouch-idle clip (rigBase below)
        break;
      }
      case 'wake': {
        const wk = this.lk || PL; this.face(Math.atan2(wk.x - this.x, wk.z - this.z), 7, dt); look = Math.sin(t * 25) * 0.15; lean = 0.4; armL = armR = -0.9;
        if (this.stT > 0.85) { this.st = 'chase'; this.stT = 0; }
        break;
      }
      case 'climb': {   // up or down the stairwell: rise out of / sink into the flight, swap floors half-way
        const C = this.cl, s = this.h.stair; C.t += dt; const k = clamp(C.t / C.dur, 0, 1), half = k < 0.5, u = half ? k * 2 : k * 2 - 1;
        const gy = al => clamp((al + 1.45) / 2.9, 0, 1) * CEIL, uy = u2 => lerp(-FLH + CEIL / 12, 0, u2);
        let o, al, y;
        if (C.up) { if (half) { o = s.g; al = lerp(-1.3, 1.5, u); y = gy(al); } else { o = s.u; al = lerp(-1.45, 1.35, u); y = uy(u); } }
        else { if (half) { o = s.u; al = lerp(1.35, -1.45, u); y = uy(1 - u); } else { o = s.g; al = lerp(1.5, -1.3, u); y = gy(al); } }
        const p = s.pt(o, al, 1.19); this.x = p.x; this.z = p.z; this.yOff = y; this.yaw = s.yawU + (C.up ? 0 : Math.PI); this.spd = 2.2;
        amp = 1; lean = 0.8; armL = armR = -0.5;
        if (Math.floor(C.t * 3.2) !== Math.floor((C.t - dt) * 3.2) && physD9(this) < 22) playS(bpick('wstep'), { pos: this.pos(0.1 + y), vol: 0.85, rate: 0.95 * rnd(0.94, 1.06), ref: 3, occF: 1700 });
        if (k >= 1) { this.yOff = 0; this.st = C.prev === 'climb' ? 'prowl' : C.prev; this.stT = C.stT; this.cl = null; this.fc = -1; this.dir = -1; }
        break;
      }
      case 'chase': {   // blind: it runs to where it last heard you, and loses you after a while in silence
        G.chase = Math.max(G.chase, 0.8); PL.fear = Math.max(PL.fear, 0.9);
        this.unheardT += dt;
        if (this.unheardT > WR9_FORGET[G.diff]) { this.st = 'lost'; this.stT = 0; this.unheardT = 0; break; }
        const lk = this.lk || (this.lk = { x: PL.x, z: PL.z }), lc = cIdx(cellOf(lk.x), cellOf(lk.z));
        if (!this.inHouse(lc)) { this.st = 'lost'; this.stT = 0; break; }
        if (!this.lab && this.h.stair && floorOf(lc) !== this.myFl()) {       // the sound came from the other floor: it follows
          spd = WR9_CHASE[G.diff]; amp = 1.2; lean = 0.6; armL = armR = -0.7;
          if (!this.toStairs(spd, dt)) { this.st = 'lost'; this.stT = 0; }
          break;
        }
        const F = this.field(lc), mine = F[this.cell()];
        if (mine < 0) {
          // latched door in the way? go and hammer on it
          const F2 = bfs(lc % N, (lc / N) | 0, this.cellFn), m2 = F2[this.cell()];
          if (m2 >= 0) { this.st = 'bang'; this.stT = 0; this.bangs = 0; this.F2 = F2; this.bc = lc; break; }
          this.st = 'lost'; this.stT = 0; break;
        }
        if (this.unheardT > 0.6 && dist2(lk.x, lk.z, this.x, this.z) < 0.8) { this.st = 'lost'; this.stT = 0; break; }   // nothing here: it stops to listen
        spd = WR9_CHASE[G.diff] * (0.8 + 0.4 * Math.max(0, Math.sin(t * 6.5 + this.home.x)));
        this.navDoors(lk.x, lk.z, spd, dt, F);
        amp = 1.2; lean = 0.6; armL = armR = -0.7;
        if (d < 1.05 && this.atkCd <= 0 && play) this.attack();
        break;
      }
      case 'bang': {
        const F = this.field(this.bc ?? PL.cell); if (F[this.cell()] >= 0) { this.st = 'chase'; break; }
        const w = navWay({ x: this.x, z: this.z, dir: this.dir, edgeFn: null }, this.F2), cx = cellOf(this.x), cy = cellOf(this.z);
        let dr = null; for (let k = 0; k < 4; k++) { const q = doorOn(cx, cy, k); if (q && q.latched && dist2(q.mx, q.mz, this.x, this.z) < 1.3) dr = q; }
        if (dr) {
          spd = 0; this.face(Math.atan2(dr.mx - this.x, dr.mz - this.z), 6, dt); this.bangT -= dt; this.atDoor = true; if (!this.rig.sk) armL = armR = -1.5 + Math.sin(t * 14) * 0.3;
          if (this.bangT <= 0) { this.bangT = rnd(0.7, 1.2); this.bangs++; bangDoor(dr, 0.9); if (this.bangs === 1 && !G9.latchSaved) { G9.latchSaved = true; toast('THE LATCH IS HOLDING…', 2); } }
          if (this.bangs >= 6) { this.st = 'prowl'; this.stT = 0; this.wp = null; }
        } else if (w) { spd = 2.6 * wrK9(); this.step(w.x, w.z, spd, dt); amp = 1; } else { this.st = 'prowl'; this.stT = 0; }
        if (this.stT > 14) { this.st = 'prowl'; this.stT = 0; }
        break;
      }
      case 'lost': {   // it lost the sound: it lingers where it last heard you, listening, then wanders
        spd = 0; look = Math.sin(t * 2.2) * 0.8;
        if (this.lk && floorOf(cIdx(cellOf(this.lk.x), cellOf(this.lk.z))) === this.myFl()) { const ls = 2.2 * wrK9(), r = this.navDoors(this.lk.x, this.lk.z, ls, dt); if (r > 1.0) spd = ls; }
        if (this.stT > 4) { this.st = 'prowl'; this.stT = 0; }
        break;
      }
      case 'rest': {   // r6: it stands where it stopped and listens, head tipping; then it moves on
        spd = 0; look = Math.sin(t * 0.9 + this.home.x) * 0.7 + (this.sus > 0.3 ? Math.sin(t * 30) * 0.08 : 0); lean = 0.7;
        if (this.sus > 0.3 && this.lk) this.face(Math.atan2(this.lk.x - this.x, this.lk.z - this.z), 1.4, dt);
        if (play && d < 0.85 && this.inHouse(PL.cell)) { this.lk = { x: PL.x, z: PL.z }; this.wake('touch'); break; }   // you walked into it
        if (this.stT > this.restT) { this.st = 'prowl'; this.stT = 0; this.wp = null; }
        break;
      }
      case 'prowl': {   // r6: roaming is what it does: room to room, upstairs and down, opening any door that isn't latched
        if (!this.wp) {
          let cs;
          if (this.lab) cs = LV.lab.R.H.cells;
          else { const mf = this.myFl(), other = this.h.stair && RNG() < 0.3, pool = this.h.rooms.filter(r => ((r.fl || 0) === mf) !== other); cs = pick(pool.length ? pool : this.h.rooms).cells; }
          this.wp = cellPt(pick(cs), 0.9, 0.35);
        }
        spd = WR9_ROAM[G.diff] * wrK9(); const r = this.goH(this.wp.x, this.wp.z, spd, dt); look = Math.sin(t * 1.2) * 0.6;
        if (play && d < 0.85 && this.inHouse(PL.cell)) { this.lk = { x: PL.x, z: PL.z }; this.wake('touch'); break; }
        if (r < 0.8) { this.wp = null; if (RNG() < 0.45) { this.st = 'rest'; this.stT = 0; this.restT = rnd(2.5, 7); } }
        if (r === 0 && this.stT > 3) { this.wp = null; this.stT = 0; }   // no way there (a latched door): pick somewhere else
        break;
      }
      case 'return': {
        const r = this.goH(this.home.x, this.home.z, 1.2, dt); spd = 1.2;
        if (r < 0.4) { this.st = 'rest'; this.stT = 0; this.restT = rnd(3, 7); }
        break;
      }
    }
    if (this.rig.sk && this.st !== 'gone') {   // skinned: clawing at a latched door, crouched while dormant
      rigWant(this.rig, this.atDoor && this.st === 'bang' ? 'scratch' : null, { upper: true, loop: true, fade: 0.2 });
      if (!(this instanceof Subject)) rigBase(this.rig, this.st === 'dormant' ? 'cidle' : null);
    }
    this.atDoor = false;
    this.animate(dt, spd, amp, { lean, armL, armR, look, drop });
    this.sync();
  }
  // navigate, opening closed (unlatched) doors on the way
  navDoors(x, z, spd, dt, F) {
    const r = this.navTo(x, z, spd, dt, F);
    const cx = cellOf(this.x), cy = cellOf(this.z);
    for (let k = 0; k < 4; k++) {
      const dr = doorOn(cx, cy, k); if (!dr || dr.target || dr.latched) continue;
      if (dist2(dr.mx, dr.mz, this.x, this.z) < 1.15 && (k === this.dir || dist2(dr.mx, dr.mz, x, z) < dist2(this.x, this.z, x, z))) {
        this.doorT += dt; if (this.doorT > 0.5) { this.doorT = 0; setDoor(dr, true); FX.glitch = Math.max(FX.glitch, 0.3); }
        return r;
      }
    }
    this.doorT = 0; return r;
  }
  animate(dt, spd, amp, o) {
    const a = Math.max(amp, clamp(this.spd / 2.2, 0, 1.2));
    this.ph += this.spd * dt * 3.1;
    animHuman(this.rig, this.ph, a, { lean: o.lean, armL: o.armL, armR: o.armR, look: o.look, drop: o.drop, armA: 0.6, legA: 0.6, elL: -0.5, elR: -0.5 });
    if (this.rig.jaw) this.rig.jaw.rotation.x = 0.25 + (this.st === 'chase' || this.st === 'wake' ? 0.35 + Math.sin(FX.t * 13) * 0.12 : 0);
    if (a > 0.2 && this.st !== 'climb') stepPhase(this, dt, 0.7, () => footAt9(this, 'wstep', this.st === 'chase' || this.st === 'hunt' || this.st === 'lured' ? 0.95 : 0.7, 1.1, 26));
  }
}

// ================= THE LAB SUBJECT =================
class Subject extends Wretch {
  constructor() {
    super(null, cIdx(LAB_X + 2, 11), { lab: true, gown: true });
    this.place(cellCenter(LAB_X + 2), 11 * CELL + 1.0, Math.PI); this.home = { x: this.x, z: this.z }; this.hyaw = Math.PI;
    this.st = 'held'; this.cage = { x: (LAB_X + 2.5) * CELL, z: 2.95 * CELL }; this.dis = 0;
  }
  inCage() { return cellOf(this.x) === LAB_X + 2 && (cellOf(this.z) === 2 || cellOf(this.z) === 3); }
  update(dt) {
    const d = this.d, t = FX.t, play = G.state === 'play';
    this.stT += dt; this.atkCd -= dt; this.scrCd -= dt;
    let spd = 0, lean = 0.7, armL = -0.4, armR = -0.4, look = 0, drop = -0.06, amp = 0;
    switch (this.st) {
      case 'held': { this.face(this.hyaw, 2, dt); lean = 0.95; armL = armR = 0.05; look = Math.sin(t * 0.7) * 0.2; if (d > 26) { if (this.shown) this.cull(); return; } break; }
      case 'burst': { lean = 0.4; armL = armR = -1.1; look = Math.sin(t * 20) * 0.2; if (this.stT > 1.3) { this.st = 'lured'; this.stT = 0; } break; }
      case 'lured': {
        const r = this.navTo(this.cage.x, this.cage.z, 2.3, dt); spd = 2.3; look = Math.sin(t * 3) * 0.3; lean = 0.85;
        if (d < 1.9 && play && los(this.x, this.z, PL.x, PL.z)) { this.st = 'hunt'; this.stT = 0; }
        if (r < 0.5) { this.st = 'sniff'; this.stT = 0; G9.sniffs = (G9.sniffs || 0) + 1; if (G9.sniffs === 1) later(0.5, () => radio9('trap')); }
        break;
      }
      case 'sniff': {
        lean = 1.1; drop = -0.12; look = Math.sin(t * 5) * 0.5; armL = armR = 0.1;
        this.rig.head.rotation.x = 0.4 + Math.sin(t * 9) * 0.1;
        if (Math.floor(this.stT * 2.5) !== Math.floor((this.stT - dt) * 2.5)) playS(bpick('click'), { pos: this.pos(1.0), vol: 0.35, rate: 0.6 });
        if (this.stT > 5.2) { this.st = 'hunt'; this.stT = 0; playS(bpick('scrHi'), { pos: this.pos(1.3), vol: 1.1, rate: 1.2 }); }
        break;
      }
      case 'hunt': {
        G.chase = Math.max(G.chase, 0.8); PL.fear = Math.max(PL.fear, 0.9);
        const F = this.field(PL.cell), mine = F[this.cell()];
        spd = [3.0, 3.4, 3.8][G.diff] * (0.8 + 0.4 * Math.max(0, Math.sin(t * 6.5)));
        if (mine >= 0 && inLab9()) this.navTo(PL.x, PL.z, spd, dt, F); else spd = 0;
        amp = 1.2; lean = 0.6; armL = armR = -0.7;
        if (d < 1.05 && this.atkCd <= 0 && play) this.attack();
        if (this.stT > 11 || mine < 0) { this.st = 'lured'; this.stT = 0; }
        break;
      }
      case 'trapped': {
        lean = 0.5; armL = -1.4 + Math.sin(t * 9) * 0.5; armR = -1.4 + Math.cos(t * 8) * 0.5; look = Math.sin(t * 4) * 0.6;
        this.face(Math.atan2(PL.x - this.x, PL.z - this.z), 3, dt);
        if (Math.floor(t * 0.7) !== Math.floor((t - dt) * 0.7) && RNG() < 0.6) { SFX9.clang(P9(this.pos(1.2))); FX.glitch = Math.max(FX.glitch, 0.25); }
        break;
      }
      case 'cure': {
        const k = this.stT; lean = 0.3 + Math.sin(t * 17) * 0.3; armL = -1.8 + Math.sin(t * 23) * 0.6; armR = -1.8 + Math.cos(t * 19) * 0.6; look = Math.sin(t * 31) * 0.5; drop = -0.1 * k / 7;
        this.dis = smooth(3, 7, k); setDissolve(this.rig.mat, this.dis);
        if (k > 7.2) { this.present = false; this.st = 'gone'; setRigVisible(this.rig, false); }
        break;
      }
      case 'gone': return;
    }
    this.animate(dt, spd, amp, { lean, armL, armR, look, drop });
    this.sync();
  }
  cull() { if (this.st === 'gone') { this.shown = false; setRigVisible(this.rig, false); return; } super.cull(); }
}

// ================= DR. HALE =================
class Hale extends Agent {
  constructor(x, z, yaw) {
    super(buildHale(), 0.3); mergeRig(this.rig); this.place(x, z, yaw);
    Object.assign(this, { st: 'lying', stT: 0, rise: 0, shadowR: 0.5, alive: true, cardOut: false, look: 0 });
    this.rig.card.isVisible = false; setDissolve(this.rig.mat, 1);
  }
  update(dt) {
    const t = FX.t; this.stT += dt;
    let spd = 0, st = { lean: 0.05, look: 0 };
    const toP = Math.atan2(PL.x - this.x, PL.z - this.z);
    switch (this.st) {
      case 'lying': setDissolve(this.rig.mat, 1 - smooth(0, 2.5, this.stT)); if (this.rig.sk) rigPlay(this.rig, 'getup', { hold: true, rate: 0, fade: 0, w: 1 }); if (this.stT > 3.5) { this.st = 'rise'; this.stT = 0; if (this.rig.sk && this.rig.sk.act) this.rig.sk.act.rate = 0.62; } break;
      case 'rise': this.rise = smooth(0, 2.4, this.stT); if (this.stT > 2.6) { this.st = 'talk'; this.stT = 0; if (this.rig.sk) rigStop(this.rig, 0.6); haleTalk(); } break;
      case 'talk': this.face(toP, 3, dt); st = { lean: 0.12, look: Math.sin(t * 0.8) * 0.15, armR: this.rig.sk ? 0 : -0.2 + Math.sin(t * 2) * 0.1 }; break;
      case 'give': this.face(toP, 4, dt); st = { lean: 0.08, armR: -1.25, elR: -0.3, look: 0 }; break;
      case 'walk': { const r = this.navTo(this.goal.x, this.goal.z, 1.3, dt); spd = 1.3; if (r < 0.35) { this.st = 'wait'; this.stT = 0; } break; }
      case 'wait': this.face(toP, 2, dt); st = { lean: 0.1, look: Math.sin(t * 0.5) * 0.2, armL: -0.1 }; break;
    }
    const r = this.rig, lie = r.sk ? 0 : 1 - this.rise;   // skinned: the get-up clip does the rising
    this.ph += this.spd * dt * 3.2;
    if (r.sk) rigBase(r, this.st === 'talk' ? 'talk' : this.st === 'wait' ? 'fold' : null);
    animHuman(r, this.ph, clamp(this.spd / 1.3, 0, 1), st);
    if (lie > 0.001) {   // blend from lying on the floor to standing
      r.hips.rotation.x = -Math.PI / 2 * lie * 0.92; r.hips.position.y = lerp(r.hipH, 0.2, lie);
      r.kn[0].rotation.x += 0.6 * lie; r.sh[0].rotation.z = -1.0 * lie; r.sh[1].rotation.z = 0.8 * lie; r.head.rotation.y = 0.6 * lie + Math.sin(t * 3) * 0.1 * lie;
    } else r.hips.rotation.x = 0;
    this.sync();
  }
}

// ================= setup / per-frame =================
function initAI9() {
  Object.assign(AI, { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null, flick: 0 });
  Object.assign(AI9, { watch: [], wretches: [], subject: null, hale: null, streets: null });
  const enter = LV.houses.filter(h => h.enter), extra = shuffle(enter.filter(h => !h.red && !h.cans && Math.hypot(h.hx - 2, h.hz - 6) > 11)).slice(0, [0, 1, 2][G.diff]);
  for (const h of [...enter.filter(h => h.red), ...enter.filter(h => h.cans), ...extra]) {
    // it can be anywhere in the house (either floor) - just not in the terminal room, the entry hall or on the stairs
    const busy = new Set(h.stair ? h.stair.cells : []);
    let rooms = h.rooms.filter(r => r !== h.entryRoom && r !== h.termRoom && r.cells.some(c => !busy.has(c)));
    if (RNG() < 0.5) { const far = rooms.filter(r => (r.fl || 0) !== (h.termRoom.fl || 0)); if (far.length) rooms = far; }
    const r = pick(rooms.length ? rooms : h.rooms), free = r.cells.filter(c => !busy.has(c)), c = pick(free.length ? free : r.cells);
    const w = new Wretch(h, c); h.wretch = w; AI.all.push(w); AI9.wretches.push(w);
  }
  AI9.subject = new Subject(); AI.all.push(AI9.subject);
}
function spawnWatch() {
  const S = streetCells9(); let best = -1, bd = -1;
  for (let k = 0; k < 40; k++) { const c = pick(S), x = cellCenter(c % N), z = cellCenter((c / N) | 0), d = dist2(x, z, PL.x, PL.z); if (d > 45 && d < 90 && !los(PL.x, PL.z, x, z)) { best = c; break; } if (d > bd) { bd = d; best = c; } }
  const p = cellPt(best, 0.5, 0.4), w = new Watch(AI9.watch.length); w.place(p.x, p.z, rnd(0, TAU));
  AI.all.push(w); AI9.watch.push(w); return w;
}
// threats for the compass: Wretches in the house you're in (either floor) or chasing close by, the Watch when near
function foes9() {
  const out = [], pb = LV.bld[cIdx(cellOf(PL.x), cellOf(PL.z))], P = phys9(PL.x, PL.z);
  const add = (a, maxD, ch, kind) => {
    const q = phys9(a.x, a.z), d = Math.hypot(q[0] - P[0], q[1] - P[1]); if (d > maxD) return;
    const dy = q[2] + (a.yOff || 0) - P[2];
    out.push({ ang: Math.atan2(q[0] - P[0], q[1] - P[1]), d, k: clamp(1 - d / maxD, 0.2, 1), ch, kind, fl: dy > 1.5 ? 1 : dy < -1.5 ? -1 : 0 });
  };
  for (const w of AI9.wretches) {
    if (!w.present) continue;
    const ch = ['wake', 'chase', 'bang', 'climb'].includes(w.st), inH = w.h && w.h.id === pb;
    if (inH) add(w, 24, ch, w.sus > 0.3 ? 'ws' : 'w'); else if (ch) add(w, 20, ch, 'w');
  }
  for (const w of AI9.watch) { const ch = w.st === 'chase' || w.st === 'notice'; add(w, ch ? 30 : FX.t - w.whistled < 3.5 ? 90 : 16, ch, 'm'); }   // r6: a whistle gives him away for a moment
  const s = AI9.subject; if (s && ['burst', 'lured', 'sniff', 'hunt'].includes(s.st)) add(s, 20, s.st === 'hunt', 'w');
  return out.sort((a, b) => a.d - b.d).slice(0, 3);
}
function updateAI9(dt) {
  PL.fear = 0; PL.interf = 0; AI.flick = 0; G.chase = 0;
  for (const a of AI.all) a.update(dt);
  // the nearest restless Wretch wheezes, so you can hear where it is
  let bw = null, bd = 14;
  for (const w of AI9.wretches) { if (!w.present || (w.st === 'dormant' && w.sus < 0.3)) continue; const pd = physD9(w); if (pd < bd) { bd = pd; bw = w; } }
  if (AU.ctx && !AI9.wz) { AI9.wz = mkGrowlLoop(); if (AI9.wz.src) AI9.wz.src.playbackRate.value = 1.45; }
  if (AI9.wz) {
    if (bw) AI9.wz.set(bw.x, 1.3 + (bw.yOff || 0), bw.z, PL.x, PL.z);
    setGain(AI9.wz, bw && G.state === 'play' ? (['chase', 'climb', 'bang'].includes(bw.st) ? 0.6 : 0.3) * clamp(1.15 - bd / 14, 0, 1) : 0, 0.3);
  }
  AI.visT -= dt;
  if (AI.visT <= 0) { AI.visT = 0.1; for (const a of AI.all) if (a.st !== 'dormant' || a.d < 30) a.cull(); }
  const cs = [];
  for (const a of AI.all) if (a.shown && a.shadowR > 0) { const d = a.d; if (d < 22) cs.push([d, a]); }
  cs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 8; i++) { const a = cs[i] && cs[i][1]; if (a) setShadowCaster(i, a.x, a.z, a.shadowR, 0.6); else setShadowCaster(i, 0, 0, 0, 0); }
  // Watch torches: slots 1-2 + volumetric beams
  const tl = AI9.watch.map(w => [w.d, w]).filter(([d]) => d < 40).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 2; i++) {
    const w = tl[i] && tl[i][1], b = W.beams[i];
    if (!w) { clearSlot(1 + i); if (b) placeBeam(b, null, null, 0); continue; }
    const m = worldMat(w.rig.el[1]), tip = BABYLON.Vector3.TransformCoordinates(V3(0, -0.93, 0.05), m), dir = BABYLON.Vector3.TransformNormal(DOWN, m).normalize();
    const fl = hash1(Math.floor(FX.t * 14) + w.i * 7) < 0.03 ? 0.3 : 1;
    setSlot(1 + i, tip, 4.2 * fl, dir, Math.cos(0.36), [1, 0.88, 0.66], 24, true, 0.1);
    if (b) placeBeam(b, tip, dir, w.shown ? 0.07 * fl : 0);
  }
}
