// ---------- r9 · Level 2: Ida (the Boiler Office), Benny (the valve room), the Facelings on shift, the Hound in the Long Pipe ----------
const AIP2 = { ida: null, benny: null, faces: [], foreman: null, hound: null };
// a Faceling: overalls, a smooth head with nothing on the front of it
function buildFaceling2(o = {}) {
  const mat = actMat('face2', { spec: 0.18, shin: 14, wrap: 0.45, emis: 1 }), root = tnode(null), r = { root, mat, hipH: 0.95 };
  const SUIT = o.suit || [0.28, 0.3, 0.26], SKIN = [0.78, 0.68, 0.6];
  r.body = tnode(root, 0, 0, 0);
  r.torso = tnode(r.body, 0, 0.95, 0);
  part('Capsule', { height: 0.72, radius: 0.19, tessellation: 12 }, r.torso, mat, SUIT, 0, [0, 0.33, 0], null, [1.15, 1, 0.75]);
  part('Box', { width: 0.3, height: 0.05, depth: 0.2 }, r.torso, mat, [0.5, 0.42, 0.18], 0, [0, 0.03, 0]);   // tool belt
  r.head = tnode(r.torso, 0, 0.82, 0);
  part('Sphere', { diameter: 0.25, segments: 14 }, r.head, mat, SKIN, 0, [0, 0, 0], null, [0.92, 1.15, 1]);
  part('Cylinder', { diameter: 0.1, height: 0.12, tessellation: 8 }, r.head, mat, SKIN, 0, [0, -0.15, 0]);
  if (o.cap) part('Sphere', { diameter: 0.27, segments: 10, slice: 0.5 }, r.head, mat, o.cap, 0, [0, 0.03, 0], null, [1, 0.8, 1.05]);
  if (o.hair) part('Sphere', { diameter: 0.27, segments: 10, slice: 0.55 }, r.head, mat, o.hair, 0, [0, 0.02, -0.02], [0.4, 0, 0], [1, 1, 1.05]);
  r.limbs = [];
  for (const s of [-1, 1]) {
    const l = tnode(r.body, s * 0.11, 0.95, 0); part('Capsule', { height: 0.95, radius: 0.075, tessellation: 8 }, l, mat, SUIT, 0, [0, -0.47, 0]); part('Box', { width: 0.12, height: 0.08, depth: 0.25 }, l, mat, [0.12, 0.1, 0.08], 0, [0, -0.92, 0.05]); r.limbs.push(l);
    const a = tnode(r.torso, s * 0.27, 0.62, 0); part('Capsule', { height: 0.72, radius: 0.06, tessellation: 8 }, a, mat, SUIT, 0, [0, -0.34, 0]); part('Sphere', { diameter: 0.1, segments: 6 }, a, mat, SKIN, 0, [0, -0.72, 0]); r.limbs.push(a);
  }
  return r;
}
function animFace2(r, ph, amp, st = {}) {
  const [ll, la, rl, ra] = r.limbs, s = Math.sin(ph);
  ll.rotation.x = s * 0.5 * amp + (st.sit ? -1.45 : 0); rl.rotation.x = -s * 0.5 * amp + (st.sit ? -1.45 : 0);
  la.rotation.x = -s * 0.4 * amp + (st.armL ?? 0); ra.rotation.x = s * 0.4 * amp + (st.armR ?? 0);
  r.torso.rotation.x = (st.lean ?? 0.04); r.head.rotation.y = st.look ?? 0; r.head.rotation.x = st.lookX ?? 0;
  r.torso.position.y = 0.95 + (st.sit ? -0.45 : 0) + Math.abs(Math.cos(ph)) * 0.03 * amp;
}
// ----- Ida: sits at her desk with her back to the door; she will not let you round the front -----
class Ida2 extends Agent {
  constructor() {
    super(buildFaceling2({ suit: [0.24, 0.3, 0.36], cap: [0.32, 0.24, 0.16], hair: [0.32, 0.26, 0.22] }), 0.3); mergeRig(this.rig);
    const P = WP2.pos.ida; this.place(P.x, P.z, P.yaw); this.base = P.yaw; this.turn = 0; this.noSep = true; this.shadowR = 0.45; this.tt = 0;
  }
  update(dt) {
    this.tt += dt; const P = WP2.pos.ida, dx = PL.x - this.x, dz = PL.z - this.z, d = Math.hypot(dx, dz);
    // which side of her is the player on? her front is +yaw direction
    const front = d < 2.6 && (Math.sin(this.base) * dx + Math.cos(this.base) * dz) / Math.max(d, 1e-3) > -0.1;
    if (front && G.state === 'play') { this.turn = damp(this.turn, Math.sign(Math.sin(this.base) * dz - Math.cos(this.base) * dx || 1) * 2.4, 3, dt); if (!PP2.idaFront) { PP2.idaFront = true; idaFront2(); } }
    else this.turn = damp(this.turn, 0, 1.5, dt);
    this.yaw = this.base + this.turn; this.sync(); this.rig.root.position.y = 0;
    animFace2(this.rig, 0, 0, { sit: true, lean: 0.12 + Math.sin(this.tt * 0.5) * 0.02, armL: -1.1 + Math.sin(this.tt * 0.8) * 0.06, armR: -1.0, look: Math.sin(this.tt * 0.23) * 0.25, lookX: 0.1 });
  }
  cull() { const d = this.d; this.shown = d < 28 && (d < 5 || los(PL.x, PL.z, this.x, this.z)); setRigVisible(this.rig, this.shown); }
}
// ----- Benny: shut in the valve room; a man, a hard hat, too much talking -----
class Benny2 extends Agent {
  constructor() { super(buildExplorer({ tint: [0.36, 0.42, 0.5] }), 0.3); mergeRig(this.rig); const P = WP2.pos.benny; this.place(P.x, P.z, -Math.PI / 2); this.noSep = true; this.tt = 0; this.shadowR = 0.45; }
  update(dt) {
    this.tt += dt; const near = this.d < 6 && PP2.valveOpen, want = near ? Math.atan2(PL.x - this.x, PL.z - this.z) : -Math.PI / 2;
    this.face(want, 2.5, dt); animHuman(this.rig, 0, 0, { lean: 0.15, armL: -0.3 + Math.sin(this.tt * 1.7) * 0.15, armR: -0.2, look: Math.sin(this.tt * 0.6) * 0.3 }); this.sync();
  }
  cull() { const d = this.d; this.shown = d < 24 && (d < 4 || los(PL.x, PL.z, this.x, this.z)); setRigVisible(this.rig, this.shown); }
}
// ----- Facelings: they work; they look away from your light -----
class Faceling2 extends Agent {
  constructor(roomId, o = {}) {
    super(buildFaceling2({ suit: pick([[0.28, 0.3, 0.26], [0.36, 0.3, 0.2], [0.24, 0.28, 0.34]]), cap: RNG() < 0.5 ? [0.7, 0.55, 0.1] : null }), 0.28); mergeRig(this.rig);
    this.roomId = roomId; this.cells = LV.rooms[roomId].cells.filter(c => !this.blocked(c)); this.cellFn = c => LV.room[c] !== this.roomId; this.edgeFn = (x, y, d) => !doorClosed(x, y, d);
    const c = o.at ? null : pick(this.cells); this.place(o.at ? o.at.x : cellCenter(c % N), o.at ? o.at.z : cellCenter((c / N) | 0), rnd(0, TAU));
    Object.assign(this, { st: o.still ? 'still' : 'walk', wp: null, wT: 0, shy: 0, tt: rnd(0, 9), stepT: 0, shadowR: 0.4, foreman: !!o.foreman, workYaw: o.yaw ?? 0 });
  }
  blocked(c) { const x = cellCenter(c % N), z = cellCenter((c / N) | 0); for (const s of LV.solids) if (x > s.x0 - 0.4 && x < s.x1 + 0.4 && z > s.z0 - 0.4 && z < s.z1 + 0.4) return true; return false; }
  update(dt) {
    this.tt += dt; const lit = inBeam(this.x, 1.6, this.z, 9, 0.93) && los(PL.x, PL.z, this.x, this.z);
    this.shy = damp(this.shy, lit ? 1 : 0, lit ? 5 : 1.2, dt);
    let amp = 0;
    if (this.st === 'still') { this.face(this.workYaw, 3, dt); }
    else if (this.st === 'walk' && this.shy < 0.5) {
      if (!this.wp) { const c = pick(this.cells); this.wp = { x: cellCenter(c % N) + rnd(-1, 1), z: cellCenter((c / N) | 0) + rnd(-1, 1) }; }
      const d = this.navTo(this.wp.x, this.wp.z, 0.9, dt); amp = clamp(this.spd / 0.9, 0, 1);
      if (d < 0.6) { this.st = 'work'; this.wT = rnd(5, 14); this.wp = null; }
      this.stepT -= dt * this.spd; if (this.stepT <= 0 && this.d < 16) { this.stepT = 0.7; SFX2.facelingStep(this.pos(0.1)); }
    } else if (this.st === 'work') { this.wT -= dt; if (this.wT <= 0) this.st = 'walk'; }
    this.ph += dt * this.spd * 3.2;
    const away = this.shy * 1.3 * (Math.sin(this.tt * 0.3) > 0 ? 1 : -1);
    animFace2(this.rig, this.ph, amp, { lean: this.st === 'work' ? 0.25 : 0.05, armL: this.st === 'work' ? -1.3 + Math.sin(this.tt * 3) * 0.2 : 0, armR: this.st === 'work' ? -1.2 + Math.cos(this.tt * 2.6) * 0.2 : 0, look: away, lookX: this.shy * 0.35 });
    this.sync();
  }
}
// ----- the Hound: low, fast, follows noise and fear. Hold your light on it and keep still, and it backs off. Turn away or run, and it comes. -----
function buildHound2() {
  const mat = actMat('hound2', { spec: 0.25, shin: 20, wrap: 0.3, emis: 1 }), root = tnode(null), r = { root, mat, hipH: 0.55 }, SK = [0.16, 0.14, 0.13], DK = [0.07, 0.06, 0.06];
  r.body = tnode(root, 0, 0.62, 0);
  part('Capsule', { height: 1.2, radius: 0.2, tessellation: 12 }, r.body, mat, SK, 0, [0, 0, 0], [Math.PI / 2, 0, 0], [1, 1, 0.85]);
  for (let i = 0; i < 6; i++) part('Sphere', { diameter: 0.07, segments: 5 }, r.body, mat, DK, 0, [0, 0.19, -0.45 + i * 0.16]);   // spine knuckles
  r.head = tnode(r.body, 0, 0.05, 0.68);
  part('Sphere', { diameter: 0.3, segments: 12 }, r.head, mat, SK, 0, [0, 0, 0.05], null, [0.9, 0.85, 1.2]);
  part('Box', { width: 0.2, height: 0.06, depth: 0.16 }, r.head, mat, DK, 0, [0, -0.11, 0.14]);   // the jaw, hanging
  for (const s of [-1, 1]) part('Sphere', { diameter: 0.045, segments: 6 }, r.head, mat, [0.9, 0.85, 0.7], 0.6, [s * 0.07, 0.04, 0.2]);
  r.legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const l = tnode(r.body, sx * 0.2, 0, sz * 0.45); part('Capsule', { height: 0.85, radius: 0.05, tessellation: 6 }, l, mat, SK, 0, [sx * 0.12, -0.35, sz * 0.05], [0, 0, sx * 0.35]); part('Box', { width: 0.12, height: 0.04, depth: 0.2 }, l, mat, DK, 0, [sx * 0.26, -0.72, sz * 0.1]); r.legs.push(l); }
  return r;
}
class Hound2 extends Agent {
  constructor() {
    super(buildHound2(), 0.4); mergeRig(this.rig);
    this.cellFn = c => LV.zone[c] !== ZP2.LONG; this.edgeFn = (x, y, d) => !doorClosed(x, y, d);
    this.home = LV.dry.long.cells.filter(c => (c % N) === 44 && ((c / N) | 0) > 24); const c = pick(this.home); this.place(cellCenter(c % N), cellCenter((c / N) | 0), 0);
    Object.assign(this, { st: 'roam', wp: null, stare: 0, cool: 0, hitCd: 0, growlT: 3, shadowR: 0.5, alert: 0, chargeT: 0 });
  }
  goAway(t = 25) { this.st = 'gone'; this.cool = t; this.present = false; setRigVisible(this.rig, false); }
  back() { const far = this.home.filter(c => dist2(cellCenter(c % N), cellCenter((c / N) | 0), PL.x, PL.z) > 30); const c = pick(far.length ? far : this.home); this.place(cellCenter(c % N), cellCenter((c / N) | 0), 0); this.present = true; this.st = 'roam'; this.wp = null; }
  update(dt) {
    if (this.st === 'gone') { if (G.state === 'play' && (this.cool -= dt) <= 0 && !PP2.houndGone) this.back(); return; }
    const play = G.state === 'play', d = this.d, inLong = LV.zone[cell2(PL.x, PL.z)] === ZP2.LONG, seen = playerCanSee(this.x, 0.6, this.z), lit = inBeam(this.x, 0.6, this.z, 16, 0.9) && los(PL.x, PL.z, this.x, this.z);
    this.hitCd -= dt; this.growlT -= dt;
    // hearing: noise, running, a ringing phone
    if (play && inLong && this.st === 'roam' && (PL.noise > 0.25 && d < 8 + PL.noise * 22 || (d < 10 && los(PL.x, PL.z, this.x, this.z)))) { this.st = 'hunt'; this.stare = 0; SFX2.houndGrowl(this.pos(0.6)); }
    let sp = 0, amp = 0;
    if (this.st === 'roam') {
      if (!this.wp) { const c = pick(LV.dry.long.cells); this.wp = { x: cellCenter(c % N), z: cellCenter((c / N) | 0) }; }
      const dd = this.navTo(this.wp.x, this.wp.z, 1.4, dt); if (dd < 1) this.wp = null; amp = 0.6;
      if (this.growlT <= 0 && d < 30) { this.growlT = rnd(8, 16); SFX2.houndScrape(this.pos(0.4)); }
    } else if (this.st === 'hunt') {
      if (!inLong || !play) { this.st = 'roam'; this.wp = null; }
      else {
        // the stare-down: the light on it, and you not running
        if (lit && d < 14 && PL.spd < 2.0 && !PL.run) { this.stare += dt; this.spd = damp(this.spd, 0, 6, dt); this.face(Math.atan2(PL.x - this.x, PL.z - this.z), 4, dt); amp = 0.15; if (!PP2.houndStare) { PP2.houndStare = true; toast('KEEP THE LIGHT ON IT · DON\'T RUN', 3); } if (this.stare > [2.0, 2.6, 3.2][G.diff]) { SFX2.houndScrape(this.pos(0.4)); this.st = 'flee'; this.chargeT = 0; PP2.houndStares = (PP2.houndStares || 0) + 1; } }
        else { this.stare = Math.max(0, this.stare - dt * 0.6); const fast = !seen || PL.run || PL.spd > 2.2; sp = fast && d < 12 ? [4.2, 5.0, 5.8][G.diff] : 2.0; this.navTo(PL.x, PL.z, sp, dt); amp = clamp(this.spd / 3, 0.3, 1.4);
          if (fast && d < 12 && this.chargeT <= 0) { this.chargeT = 3; SFX2.houndCharge(this.pos(0.6)); } this.chargeT -= dt;
          G.chase = Math.max(G.chase, clamp(1 - d / 20, 0, 1)); }
        if (d < 1.0 && this.hitCd <= 0) { this.hitCd = 2.5; knock(this, [16, 22, 30][G.diff], 'hound', 5); PL.san = Math.max(0, PL.san - 10); SFX2.houndGrowl(this.pos(0.6)); this.st = 'flee'; }
      }
    } else if (this.st === 'flee') {
      this.chargeT += dt; const ax = this.x - PL.x, az = this.z - PL.z, l = Math.hypot(ax, az) || 1; this.navTo(this.x + ax / l * 6, this.z + az / l * 6, 4.5, dt); amp = 1.2;
      if (this.chargeT > 2.2 || d > 18) this.goAway(rnd(25, 45));
    }
    if (seen && this.present) PL.fear = Math.max(PL.fear, clamp(1 - d / 16, 0, 0.9));
    this.ph += dt * (2 + this.spd * 3);
    this.rig.legs.forEach((l, i) => l.rotation.x = Math.sin(this.ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.5 * amp);
    this.rig.body.position.y = 0.62 + Math.abs(Math.sin(this.ph)) * 0.05 * amp - (this.st === 'hunt' && this.stare > 0 ? 0.15 : 0);
    this.rig.head.rotation.y = Math.sin(this.ph * 0.37) * 0.3; this.rig.head.rotation.z = Math.sin(FX.t * 7) * 0.08 * (this.stare > 0 ? 1 : 0.3);
    this.sync();
  }
}
function initAI2() {
  Object.assign(AI, { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null, flick: 0 }); AIP2.faces = [];
  const I = new Ida2(); AIP2.ida = I; AI.all.push(I);
  W.interact.push({ get x() { return I.x - 0.9; }, get z() { return I.z; }, y: 1.2, r: 2.3, label: () => idaLabel2(), ok: () => G.state === 'play', act: () => talkIda2() });
  const Bn = new Benny2(); AIP2.benny = Bn; AI.all.push(Bn);
  W.interact.push({ get x() { return Bn.x; }, get z() { return Bn.z; }, y: 1.2, r: 2.2, label: () => 'TALK TO BENNY', ok: () => G.state === 'play' && PP2.valveOpen, act: () => talkBenny2() });
  const sw = LV.dry.sw.id, hall = LV.dry.hall.id;
  for (let i = 0; i < 5; i++) { const f = new Faceling2(sw); AIP2.faces.push(f); AI.all.push(f); }
  for (let i = 0; i < 2; i++) { const f = new Faceling2(hall); AIP2.faces.push(f); AI.all.push(f); }
  const fm = WP2.pos.foreman; if (fm) { const f = new Faceling2(sw, { at: fm, still: true, foreman: true, yaw: Math.atan2(WP2.pos.tapPipe.x - fm.x, WP2.pos.tapPipe.z - fm.z) }); AIP2.foreman = f; AIP2.faces.push(f); AI.all.push(f); }
  const H = new Hound2(); AIP2.hound = H; AI.all.push(H);
}
function updateAI2(dt) {
  PL.fear = 0; PL.interf = 0; AI.flick = 0; G.chase = 0;
  for (const a of AI.all) a.update(dt);
  AI.visT -= dt; if (AI.visT <= 0) { AI.visT = 0.1; for (const a of AI.all) a.cull(); }
  const cs = []; for (const a of AI.all) if (a.shown && a.present !== false && a.shadowR > 0) { const d = a.d; if (d < 20) cs.push([d, a]); } cs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 8; i++) { const a = cs[i] && cs[i][1]; if (a) setShadowCaster(i, a.x, a.z, a.shadowR, 0.45); else setShadowCaster(i, 0, 0, 0, 0); }
}
function foes2() { const h = AIP2.hound; if (!h || !h.present || h.st === 'gone' || h.d > 26) return []; return [{ kind: 'f', ang: Math.atan2(h.x - PL.x, h.z - PL.z), d: h.d, k: clamp(1 - h.d / 28, 0, 1), ch: h.st === 'hunt', fl: 0 }]; }
