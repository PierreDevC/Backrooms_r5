// ---------- AI: the things in the walls, and the people in suits ----------
const AI = { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null, flick: 0, visT: 0 };
const _pv = V3(), TORCH_TIP = V3(0, -0.49, 0.02), DOWN = V3(0, -1, 0);

// merge every rig bone's static parts into one mesh (few draw calls per character)
function mergeRig(r) {
  const nodes = [r.root, ...r.root.getDescendants(false, n => !(n instanceof BABYLON.AbstractMesh))];
  nodes.forEach(n => n.computeWorldMatrix(true));
  for (const n of nodes) {
    const ms = n.getChildMeshes(true);
    if (ms.length < 2) continue;
    ms.forEach(m => m.computeWorldMatrix(true));
    const mat = ms[0].material, merged = BABYLON.Mesh.MergeMeshes(ms, true, true);
    if (!merged) continue;
    merged.bakeTransformIntoVertices(n.getWorldMatrix().clone().invert());
    merged.parent = n; merged.material = mat; merged.isPickable = false; merged.hasVertexAlpha = false;
  }
  r.__vis = undefined;
}
function worldMat(node) {
  const chain = []; for (let n = node; n; n = n.parent) chain.push(n);
  for (let i = chain.length - 1; i >= 0; i--) chain[i].computeWorldMatrix(true);
  return node.getWorldMatrix();
}
function losWide(x0, z0, x1, z1, r) {
  if (!los(x0, z0, x1, z1)) return false;
  const dx = x1 - x0, dz = z1 - z0, d = Math.hypot(dx, dz) || 1, px = -dz / d * r, pz = dx / d * r;
  return los(x0 + px, z0 + pz, x1 + px, z1 + pz) && los(x0 - px, z0 - pz, x1 - px, z1 - pz);
}
function camSees(x, y, z, pad = 1.04) {
  BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(x, y, z, CAM.getViewMatrix(), _pv);
  if (_pv.z < 0.1) return false;
  const ty = Math.tan(CAM.fov / 2) * pad, tx = ty * ENG.getAspectRatio(CAM);
  return Math.abs(_pv.x / _pv.z) < tx && Math.abs(_pv.y / _pv.z) < ty;
}
function inBeam(x, y, z, range, cosA = 0.9) {
  if (PL.fk < 0.3) return false;
  const c = CAM.position, dx = x - c.x, dy = y - c.y, dz = z - c.z, d = Math.hypot(dx, dy, dz);
  return d < range && (dx * PL.bdir.x + dy * PL.bdir.y + dz * PL.bdir.z) / d > cosA;
}
// can the player actually make this point out on screen?
function playerCanSee(x, y, z) {
  if (!camSees(x, y, z)) return false;
  const d = dist2(x, z, PL.x, PL.z);
  if (d > 1.2 && !los(PL.x, PL.z, x, z)) return false;
  if (FX.nv > 0.5 || d < 3.2) return true;
  if (lightAt(x, z) > 0.06) return true;
  return inBeam(x, y, z, 22, 0.9);
}
function playerVis() { return clamp(PL.light * 2.5, 0, 1) + PL.fk * 0.8; }
function seesPlayer(a, maxD, fovCos = 0.2) {
  const d = a.d; if (d > maxD) return false;
  const ang = Math.atan2(PL.x - a.x, PL.z - a.z);
  if (d > 2.2 && Math.cos(angDiff(a.yaw, ang)) < fovCos) return false;
  if (!los(a.x, a.z, PL.x, PL.z)) return false;
  return d < 3.5 + playerVis() * maxD * (PL.ck > 0.5 ? 0.65 : 1);
}
function randCell(fx, fz, minD, maxD, filt) {
  const F = bfs(cellOf(fx), cellOf(fz)), c = [];
  for (let i = 0; i < N * N; i++) if (F[i] >= minD && F[i] <= maxD && (!filt || filt(i))) c.push(i);
  return c.length ? pick(c) : -1;
}
function farCell(minD, maxD, filt) {
  const F = PL.field, c = []; let best = -1, bd = -1;
  for (let i = 0; i < N * N; i++) {
    if (F[i] < 0 || (filt && !filt(i))) continue;
    const x = cellCenter(i % N), z = cellCenter((i / N) | 0);
    if (los(PL.x, PL.z, x, z) && dist2(x, z, PL.x, PL.z) < 30) continue;
    if (F[i] >= minD && F[i] <= maxD) c.push(i);
    if (F[i] > bd) { bd = F[i]; best = i; }
  }
  return c.length ? pick(c) : best;
}
function cellPt(c, j = 0.9, r = 0.35) { const p = { x: cellCenter(c % N) + rnd(-j, j), z: cellCenter((c / N) | 0) + rnd(-j, j) }; collide(p, r); return p; }
// next waypoint down a BFS field, lining up with doorways first
function navWay(a, F) {
  const cx = cellOf(a.x), cy = cellOf(a.z), cur = F[cIdx(cx, cy)];
  if (cur <= 0) return null;
  let best = -1, bd = cur;
  for (let d = 0; d < 4; d++) {
    if (!passable(cx, cy, d) || (a.edgeFn && !a.edgeFn(cx, cy, d))) continue;
    const nd = F[cIdx(cx + DX[d], cy + DY[d])];
    if (nd < 0) continue;
    if (nd < bd || (nd === bd && best >= 0 && d === a.dir)) { bd = nd; best = d; }
  }
  if (best < 0) return null;
  a.dir = best;
  const [mx, mz] = edgeMid(cx, cy, best), door = edgeVal(cx, cy, best) === 2;
  const lat = DX[best] ? a.z - mz : a.x - mx;
  if (door && Math.abs(lat) > 0.3) return { x: mx - DX[best] * 0.6, z: mz - DY[best] * 0.6 };
  return { x: mx + DX[best] * 0.9, z: mz + DY[best] * 0.9 };
}

class Agent {
  constructor(rig, rad) {
    Object.assign(this, { rig, rad, x: 0, z: 0, yaw: 0, spd: 0, ph: 0, fc: -1, F: null, stuckT: 0, unT: 0, ux: 0, uz: 0, dir: -1,
      st: 'idle', stT: 0, present: true, shown: true, shadowR: 0.55, alive: true });
  }
  get d() { return dist2(this.x, this.z, PL.x, PL.z); }
  cell() { return cIdx(cellOf(this.x), cellOf(this.z)); }
  pos(y = 1.4) { return { x: this.x, y, z: this.z, pl: { x: PL.x, z: PL.z } }; }
  place(x, z, yaw = this.yaw) { this.x = x; this.z = z; this.yaw = yaw; this.fc = -1; this.sync(); }
  sync() { const r = this.rig.root; r.position.x = this.x; r.position.z = this.z; r.rotation.y = this.yaw; }
  face(yaw, k, dt) { this.yaw += angDiff(this.yaw, yaw) * Math.min(1, k * dt); }
  // r5: personal space - a walking agent slides off other ground agents instead of merging into them (two Howlers converging, Forgotten in a corridor)
  sep(p) {
    if (this.noSep) return;
    for (const o of AI.all) {
      if (o === this || o.noSep || o.body || o.present === false || o.alive === false) continue;
      const dx = p.x - o.x, dz = p.z - o.z, rr = this.rad + o.rad, d2 = dx * dx + dz * dz;
      if (d2 >= rr * rr) continue;
      const d = Math.sqrt(d2), k = (rr - d) * 0.6;
      if (d > 1e-4) { p.x += dx / d * k; p.z += dz / d * k; } else { p.x += Math.sin(this.yaw + 1.57) * k; p.z += Math.cos(this.yaw + 1.57) * k; }
    }
  }
  step(tx, tz, spd, dt, turnK = 7) {
    const dx = tx - this.x, dz = tz - this.z, d = Math.hypot(dx, dz);
    if (d < 0.03) { this.spd = damp(this.spd, 0, 8, dt); return d; }
    const want = Math.atan2(dx, dz); this.face(want, turnK, dt);
    const al = Math.max(0.3, Math.cos(angDiff(this.yaw, want)));
    const k = Math.min(d, spd * al * dt), ox = this.x, oz = this.z, p = { x: ox, z: oz }, ns = Math.min(4, Math.ceil(k / 0.15) || 1);
    for (let i = 0; i < ns; i++) { p.x += dx / d * k / ns; p.z += dz / d * k / ns; if (i === ns - 1) this.sep(p); collide(p, this.rad); }   // r5: substeps never skip a wall
    this.x = p.x; this.z = p.z;
    const m = Math.hypot(p.x - ox, p.z - oz); this.spd = damp(this.spd, m / Math.max(dt, 1e-4), 10, dt);
    if (spd > 0.4 && m < spd * dt * 0.2) this.stuckT += dt; else this.stuckT = Math.max(0, this.stuckT - dt * 2);
    return d;
  }
  field(gc) { if (gc !== this.fc || this.fv !== LV.navVer) { this.fc = gc; this.fv = LV.navVer; this.F = bfs(gc % N, (gc / N) | 0, this.cellFn, this.edgeFn); } return this.F; }
  navTo(gx, gz, spd, dt, F) {
    const d = dist2(this.x, this.z, gx, gz);
    if (this.unT > 0) { this.unT -= dt; this.step(this.x + this.ux, this.z + this.uz, spd * 0.7, dt, 10); return d; }
    if (this.stuckT > 1.0) { this.stuckT = 0; const a = rnd(0, TAU); this.ux = Math.sin(a); this.uz = Math.cos(a); this.unT = 0.45; this.dir = -1; }
    const gc = cIdx(cellOf(gx), cellOf(gz));
    if (gc === this.cell() || (d < 10 && losWide(this.x, this.z, gx, gz, this.rad + 0.06))) { this.step(gx, gz, spd, dt); return d; }
    const w = navWay(this, F || this.field(gc));
    this.step(w ? w.x : gx, w ? w.z : gz, spd, dt);
    return d;
  }
  cull() {
    const d = this.d; let v = this.present && d < 38;
    if (v && d > 4) {
      const px = -(this.z - PL.z) / d * 0.45, pz = (this.x - PL.x) / d * 0.45;
      v = los(PL.x, PL.z, this.x, this.z) || los(PL.x, PL.z, this.x + px, this.z + pz) || los(PL.x, PL.z, this.x - px, this.z - pz);
    }
    this.shown = v; setRigVisible(this.rig, v);
  }
  update() {}
}
function setGain(v, g, tc = 0.25) { if (v && AU.ctx) v.g.gain.setTargetAtTime(AU.muted ? 0 : g, AU.ctx.currentTime, tc); }

// ================= THE HOWLER =================
class Howler extends Agent {
  constructor(i) {
    super(buildEntity(), 0.34); mergeRig(this.rig);
    Object.assign(this, { i, st: 'wander', percT: 0, howlCd: 10, atkCd: 0, lost: 0, blind: 0, lk: null, wt: null, pause: 0, seen: false, callT: rnd(120, 180), seeCd: 0, calls: 0,
      tw: { y: 0, x: 0, z: 0 }, twT: 0, hy: 0, hx: 0, hz: 0, lean: 0, sph: 0, prey: null, shadowR: 0.6 });
  }
  startChase() {
    this.st = 'chase'; this.stT = 0; this.lost = 0;
    if (this.seeCd <= 0) {   // r7: the scream when it sees you: a distorted shriek from the thing itself, not a stock sting
      this.seeCd = 7; SFX.howlSee(this.pos(2.2), this); PL.shake = Math.max(PL.shake, 0.7); PL.fear = 1;
      FX.glitch = Math.max(FX.glitch, 1.8); FX.hurt = Math.max(FX.hurt, 0.25);
    } else FX.glitch = Math.max(FX.glitch, 0.7);
  }
  attack() {
    this.atkCd = 3; SFX.jumpscare(); SFX.screech(this.pos(2.1), false);
    if (this.rig.sk) rigPlay(this.rig, 'hook', { upper: true, fade: 0.08, restart: true, rate: 1.2 });
    const dx = PL.x - this.x, dz = PL.z - this.z, dd = Math.hypot(dx, dz) || 1; PL.kx = dx / dd * 6; PL.kz = dz / dd * 6;
    PL.lookAt = { x: this.x, y: 2.25, z: this.z }; PL.lookK = 0.5;
    hurt(45, 'howler');
    if (G.state === 'play') { this.st = 'retreat'; this.stT = 0; this.blind = 7; const c = randCell(this.x, this.z, 4, 8); this.wt = c >= 0 ? cellPt(c) : { x: this.x, z: this.z }; }
  }
  update(dt) {
    const d = this.d, t = FX.t, play = G.state === 'play';
    this.stT += dt; this.howlCd -= dt; this.atkCd -= dt; this.blind -= dt; this.percT -= dt; this.seeCd -= dt;
    // r7: its territorial call, every 2-3 minutes, from wherever it is on the map (near or across the level)
    if (play) this.callT -= dt;
    if (this.callT <= 0 && play) {
      if (this.st === 'wander') { this.callT = rnd(120, 180); this.calls++; this.pause = Math.max(this.pause, 2.8); SFX.howlCall(this.pos(2.4), this); FX.glitch = Math.max(FX.glitch, d < 25 ? 0.5 : 0.15); PL.fear = Math.max(PL.fear, clamp(1 - d / 60, 0, 0.6)); }
      else this.callT = 6;
    }
    const chaseSpd = [3.2, 3.85, 4.35][G.diff];
    if (this.percT <= 0) {
      this.percT = 0.18; this.seen = false;
      if (play && G.time > G.grace && this.blind <= 0) {
        this.seen = seesPlayer(this, 26);
        if (this.seen) { this.lk = { x: PL.x, z: PL.z }; this.lost = 0; if (this.st !== 'chase') this.startChase(); }
        else if (PL.noise > 0.05 && !['chase', 'retreat', 'hunt'].includes(this.st)) {
          const R = PL.noise * 17;
          if (d < R) {
            const geo = los(this.x, this.z, PL.x, PL.z) ? d : (PL.field[this.cell()] + 0.5) * CELL * 1.1;
            if (geo < R) {
              this.lk = { x: PL.x + rnd(-1.2, 1.2), z: PL.z + rnd(-1.2, 1.2) };
              if (this.st !== 'investigate') { this.st = 'investigate'; this.stT = 0; SFX.clicks(this.pos(2.2)); }
            }
          }
        }
      }
      if (this.st === 'wander' && this.stT > 5 && RNG() < 0.05) {
        const e = AI.exps.find(e => e.alive && dist2(e.x, e.z, this.x, this.z) < 15 && los(e.x, e.z, this.x, this.z));
        if (e) { this.prey = e; this.st = 'hunt'; this.stT = 0; e.threat = this; if (this.howlCd <= 0) { SFX.howl(this.pos(2.2)); this.howlCd = 16; } }
      }
    }
    const sees = this.seen;
    switch (this.st) {
      case 'wander': {
        if (!this.wt || this.stT > 35 || dist2(this.x, this.z, this.wt.x, this.wt.z) < 0.8) {
          // the level "pulls" it toward the camera over time: some wander goals are picked near the player
          const drawn = play && G.time > G.grace * 0.6 && RNG() < 0.3 + 0.1 * G.tapes;
          let c = -1;
          if (drawn) { const cs = []; for (let k = 0; k < N * N; k++) { const f = PL.field[k]; if (f >= 2 && f <= 6) cs.push(k); } if (cs.length) c = pick(cs); }
          if (c < 0) c = randCell(this.x, this.z, 3, 12);
          this.wt = c >= 0 ? cellPt(c) : { x: this.x, z: this.z }; this.stT = 0; this.pause = Math.max(this.pause, RNG() < 0.4 ? rnd(2, 6) : 0);
        }
        if (this.pause > 0) { this.pause -= dt; this.spd = damp(this.spd, 0, 6, dt); } else this.navTo(this.wt.x, this.wt.z, 1.3, dt);
        break;
      }
      case 'investigate':
        if (this.navTo(this.lk.x, this.lk.z, 2.4, dt) < 0.9 || this.stT > 22) { this.st = 'search'; this.stT = 0; this.wt = null; }
        break;
      case 'chase': {
        if (!sees) this.lost += dt;
        const ramp = Math.min(1, 0.55 + this.stT * 0.35);
        if (sees || this.lost < 1.4) this.navTo(PL.x, PL.z, chaseSpd * ramp, dt, PL.field);
        else if (this.navTo(this.lk.x, this.lk.z, chaseSpd * 0.85, dt) < 0.9 || this.lost > 6) { this.st = 'search'; this.stT = 0; this.wt = null; }
        if (play && d < 1.35 && this.atkCd <= 0 && los(this.x, this.z, PL.x, PL.z)) this.attack();
        break;
      }
      case 'search': {
        if (!this.wt || dist2(this.x, this.z, this.wt.x, this.wt.z) < 0.8) {
          const c = randCell(this.lk ? this.lk.x : this.x, this.lk ? this.lk.z : this.z, 0, 2); this.wt = c >= 0 ? cellPt(c) : { x: this.x, z: this.z }; this.pause = rnd(0.5, 2.5);
        }
        if (this.pause > 0) { this.pause -= dt; this.spd = damp(this.spd, 0, 6, dt); this.face(this.yaw + Math.sin(t * 1.3) * 2, 1.5, dt); }
        else this.navTo(this.wt.x, this.wt.z, 1.7, dt);
        if (this.stT > 13) { this.st = 'wander'; this.stT = 0; this.wt = null; }
        break;
      }
      case 'hunt': {
        const e = this.prey;
        if (!e || !e.alive || this.stT > 25) { this.st = 'wander'; this.prey = null; this.wt = null; break; }
        this.navTo(e.x, e.z, 3.5, dt);
        if (dist2(this.x, this.z, e.x, e.z) < 1.2) { e.die(this); this.st = 'feed'; this.stT = 0; this.face(Math.atan2(e.x - this.x, e.z - this.z), 20, 1); }
        break;
      }
      case 'feed':
        this.spd = damp(this.spd, 0, 8, dt);
        if (this.stT > 9) { this.st = 'wander'; this.stT = 0; this.wt = null; this.prey = null; }
        break;
      case 'retreat':
        this.navTo(this.wt.x, this.wt.z, 2.6, dt);
        if (this.stT > 5) { this.st = 'wander'; this.stT = 0; this.wt = null; }
        break;
    }
    // ---- animation ----
    const r = this.rig, amp = clamp(this.spd / 3.2, 0, 1.25), prev = this.sph, chasing = this.st === 'chase' ? 1 : 0, feed0 = this.st === 'feed', feed = feed0 && !r.sk;
    if (r.sk) rigWant(r, feed0 ? 'kneel' : null, { range: [1.0, 3.6], loop: false, fade: 0.5, t: 0.45 });   // skinned: kneels over the body
    this.sph += this.spd * dt * 2.0;
    if (this.spd > 0.5 && d < 34 && Math.floor(this.sph / Math.PI) !== Math.floor(prev / Math.PI)) SFX.heavyStep(this.pos(0.1));
    this.twT -= dt;
    if (this.twT <= 0) { this.twT = rnd(0.15, 1.6); this.tw = { y: rnd(-0.7, 0.7), x: rnd(-0.35, 0.3), z: rnd(-0.8, 0.8) * (RNG() < 0.4 ? 1 : 0.2) }; }
    let ty = this.tw.y;
    if (chasing || (sees && d < 20)) ty = clamp(angDiff(this.yaw, Math.atan2(PL.x - this.x, PL.z - this.z)), -1.1, 1.1) + this.tw.y * 0.15;
    this.hy = damp(this.hy, ty, 16, dt); this.hx = damp(this.hx, this.tw.x, 16, dt); this.hz = damp(this.hz, this.tw.z, 20, dt);
    this.lean = damp(this.lean, chasing * 0.42 + (feed ? 0.95 : 0), 4, dt);
    animHuman(r, this.sph, amp, {
      legA: 0.62, armA: 0.18 + amp * 0.28, armL: -0.2 * chasing - (feed ? 1.0 : 0) + Math.sin(t * 0.6) * 0.05, armR: -0.2 * chasing - (feed ? 1.2 : 0) + Math.sin(t * 0.7 + 1) * 0.05,
      armZ: 0.08 + 0.06 * Math.sin(t * 0.9), elL: -0.3 - (feed ? 0.9 : 0) - chasing * 0.3, elR: -0.25 - (feed ? 0.7 : 0) - chasing * 0.45,
      lean: 0.1 + this.lean, look: this.hy, lookX: -this.lean * 0.75 + this.hx, lookZ: this.hz, drop: feed ? -0.45 : 0 });
    if (feed0 && hash1(Math.floor(t * 5) + this.i) < 0.3) r.head.rotation.x += 0.35;
    this.sync();
    setEmi(r.mat, chasing ? 1.2 : 0.3);
    // ---- sound & dread ----
    if ((!this.growl || (this.growl.synth && AU.buf.growlLoop)) && AU.ctx) { if (this.growl) { try { this.growl.g.disconnect(); } catch (e) {} } this.growl = mkGrowlLoop(); }
    if (this.growl) {
      this.growl.set(this.x, 2.1, this.z, PL.x, PL.z);
      setGain(this.growl, { wander: 0.2, investigate: 0.34, search: 0.3, chase: 0.9, hunt: 0.6, feed: 0.55, retreat: 0.4 }[this.st] * (G.state === 'title' ? 0 : 1), 0.3);
      this.growl.setChase(chasing);
    }
    if (d < 24 && this.shown) PL.fear = Math.max(PL.fear, chasing ? 0.45 + 0.55 * (1 - d / 24) : (1 - d / 24) * 0.45);
    AI.flick = Math.max(AI.flick, clamp(1 - d / 15, 0, 1) * (chasing ? 1 : 0.55));
    PL.interf = Math.max(PL.interf, clamp(1 - d / 9, 0, 1));
    G.chase = Math.max(G.chase, chasing ? clamp(1 - d / 30, 0.3, 1) : 0);
  }
}

// ================= THE CRAWLER (moves only when unobserved) =================
class Crawler extends Agent {
  constructor() {
    super(buildCrawler(), 0.4); mergeRig(this.rig);
    Object.assign(this, { active: false, present: false, dorm: 0, unseen: 0, seenT: 0, cph: 0, twv: 0, twT: 0, clickT: 0, fade: 1, firstSeen: false, atk: 0, shadowR: 0.9 });
    setRigVisible(this.rig, false);
  }
  activate() { if (this.active) return; this.active = true; this.respawn(); }
  respawn() {
    const c = farCell(8, 15); if (c < 0) { this.dorm = 5; return; }
    const p = cellPt(c, 0.8, 0.4); this.place(p.x, p.z, Math.atan2(PL.x - p.x, PL.z - p.z));
    this.present = true; this.fade = 1; this.atk = 0; setDissolve(this.rig.mat, 0.99);
  }
  attack() {
    this.atk = 1.1; SFX.jumpscare(); SFX.screech(this.pos(0.8), true); FX.glitch = 2;
    this.yaw = Math.atan2(PL.x - this.x, PL.z - this.z); this.sync();
    PL.lookAt = { x: this.x + Math.sin(this.yaw) * 0.6, y: 0.8, z: this.z + Math.cos(this.yaw) * 0.6 }; PL.lookK = 1.0;
    hurt(30, 'crawler');
  }
  update(dt) {
    if (!this.active) return;
    if (this.dorm > 0) { this.present = false; this.dorm -= dt; if (this.dorm <= 0) this.respawn(); return; }
    const d = this.d, t = FX.t, r = this.rig;
    if (this.atk > 0) {
      this.atk -= dt; r.jaw.rotation.x = 0.95; r.body.position.y = 0.8; r.neck.rotation.x = -0.7;
      setDissolve(r.mat, clamp((0.45 - this.atk) / 0.45, 0, 1));
      if (this.atk <= 0) { this.dorm = rnd(35, 55) * [1.3, 1, 0.75][G.diff]; this.present = false; setDissolve(r.mat, 0); r.neck.rotation.x = -0.35; }
      return;
    }
    this.fade = Math.max(0, this.fade - dt * 0.8); setDissolve(r.mat, this.fade * 0.99);
    const hx = this.x + Math.sin(this.yaw) * 0.75, hz = this.z + Math.cos(this.yaw) * 0.75;
    const obs = G.state === 'play' && (playerCanSee(this.x, 0.65, this.z) || playerCanSee(hx, 0.75, hz));
    if (obs) {
      this.seenT += dt; this.unseen = 0; this.spd = 0;
      if (!this.firstSeen && d < 16 && this.fade < 0.3) { this.firstSeen = true; SFX.sting(); FX.glitch = Math.max(FX.glitch, 0.9); }
      this.twT -= dt; if (this.twT <= 0) { this.twT = rnd(0.6, 3); this.twv = RNG() < 0.5 ? rnd(-0.9, 0.9) : 0; if (this.twv && d < 14) SFX.crack(this.pos(0.7)); }
      if (d < 16) PL.fear = Math.max(PL.fear, 0.65 * (1 - d / 16));
    } else {
      this.unseen += dt; this.seenT = 0;
      if (G.state === 'play') this.navTo(PL.x, PL.z, [3.5, 4.3, 5.1][G.diff] * (d < 4 ? 0.8 : d > 16 ? 1.25 : 1), dt, PL.field);
      this.cph += this.spd * dt * 3.4;
      this.clickT -= dt; if (this.clickT <= 0 && d < 26 && this.spd > 0.5) { this.clickT = rnd(0.25, 0.8); SFX.clicks(this.pos(0.5)); }
      if (G.state === 'play' && d < 1.45 && this.unseen > 0.12) this.attack();
    }
    r.neck.rotation.y = clamp(angDiff(this.yaw, Math.atan2(PL.x - this.x, PL.z - this.z)), -1.1, 1.1) * 0.8;
    animCrawler(r, this.cph, clamp(this.spd / 4, 0, 1.2), obs ? 0 : t, this.twv * (obs ? 1 : 0));
    this.sync();
    PL.interf = Math.max(PL.interf, clamp(1 - d / 6, 0, 1) * 0.6);
  }
}

// ================= THE SMILER (lives in the dark) =================
class Smiler extends Agent {
  constructor(home, i) {
    super(buildSmiler(), 0.3); mergeRig(this.rig);
    Object.assign(this, { home, i, st: 'lurk', burn: 0, gone: 0, glow: 0, fleeT: 0, shadowR: 0, noSep: true });
    this.relocate(false);
  }
  relocate(nearP) {
    const cand = [];
    for (let c = 0; c < N * N; c++) {
      const cx = c % N, cy = (c / N) | 0, x = cellCenter(cx), z = cellCenter(cy);
      if (nearP) { const f = PL.field[c]; if (f < 3 || f > 6) continue; }
      else if (!LV.dark[c] || Math.hypot(cx - this.home.x, cy - this.home.y) > this.home.r + 0.6 || baseLight(x, z, 1) * 0.667 > 0.1) continue;
      if (dist2(x, z, PL.x, PL.z) < 9) continue;
      cand.push(c);
    }
    if (!cand.length) { this.gone = 5; return; }
    const p = cellPt(pick(cand), 0.8, 0.3); this.place(p.x, p.z, Math.atan2(PL.x - p.x, PL.z - p.z));
    this.st = 'lurk'; this.present = true; this.burn = 0; setDissolve(this.rig.mat, 0);
  }
  flee() { if (this.st === 'flee') return; this.st = 'flee'; this.fleeT = 1.1; this.burn = 0; SFX.giggle(this.pos(1.6)); }
  attack() {
    SFX.jumpscare(); SFX.giggle(this.pos(1.6)); PL.lookAt = { x: this.x, y: 1.62, z: this.z }; PL.lookK = 0.6;
    hurt(35, 'smiler'); this.st = 'flee'; this.fleeT = 0.9;
  }
  update(dt) {
    if (this.gone > 0) { this.present = false; this.gone -= dt; if (this.gone <= 0) this.relocate(FX.lightScale < 0.25 && G.state === 'play'); setGain(this.whine, 0); return; }
    const d = this.d, t = FX.t, Lh = lightAt(this.x, this.z), blackout = FX.lightScale < 0.25;
    if (Lh > 0.12 && this.st !== 'flee') { this.gone = rnd(3, 8); this.present = false; return; }
    const play = G.state === 'play';
    const hit = play && inBeam(this.x, 1.6, this.z, 16, 0.94) && los(PL.x, PL.z, this.x, this.z);
    this.burn = hit ? this.burn + dt : Math.max(0, this.burn - dt * 0.6);
    if (this.burn > [0.8, 1.1, 1.5][G.diff]) this.flee();
    const face = Math.atan2(PL.x - this.x, PL.z - this.z), pDark = PL.light < 0.1;
    switch (this.st) {
      case 'lurk':
        this.spd = 0; this.face(face, 2.5, dt);
        if (play && G.time > 25 && d < 17 && pDark && los(this.x, this.z, PL.x, PL.z)) { this.st = 'stalk'; this.stT = 0; SFX.whisper(); }
        break;
      case 'stalk': {
        this.stT += dt;
        if (!pDark && d > 3) { this.st = 'lurk'; break; }
        const ox = this.x, oz = this.z;
        this.navTo(PL.x, PL.z, [1.0, 1.35, 1.75][G.diff] * (hit ? 0.15 : 1) * (blackout ? 1.25 : 1), dt, PL.field);
        const nc = this.cell();
        if ((!LV.dark[nc] && !blackout) || lightAt(this.x, this.z) > 0.11) { this.x = ox; this.z = oz; }
        if (play && d < 1.15) this.attack();
        break;
      }
      case 'flee': {
        this.fleeT -= dt;
        this.step(this.x - Math.sin(face) * 3, this.z - Math.cos(face) * 3, 3.5, dt, 3);
        setDissolve(this.rig.mat, clamp(1 - this.fleeT / 1.1, 0, 1));
        if (this.fleeT <= 0) { this.gone = rnd(14, 24); this.present = false; }
        break;
      }
    }
    this.yaw = this.st === 'flee' ? this.yaw : this.yaw;
    this.glow = damp(this.glow, clamp(1 - Lh * 9, 0, 1) * (this.st === 'flee' ? 0.5 : 1), 5, dt);
    setEmi(this.rig.mat, this.glow * (0.85 + 0.15 * noise1(t * 3 + this.i * 7)));
    const f = this.rig.face; f.position.y = 1.62 + Math.sin(t * 0.8 + this.i) * 0.03; f.rotation.z = Math.sin(t * 0.37 + this.i) * 0.09; f.rotation.x = Math.sin(t * 0.5) * 0.05;
    this.sync();
    if (!this.whine && AU.ctx) this.whine = mkWhineLoop();
    if (this.whine) { this.whine.set(this.x, 1.6, this.z, PL.x, PL.z); setGain(this.whine, play ? (this.st === 'stalk' ? 0.55 : 0.18) * clamp(1 - d / 16, 0, 1) : 0, 0.4); }
    if (this.shown && this.glow > 0.3 && d < 14) PL.fear = Math.max(PL.fear, (this.st === 'stalk' ? 0.8 : 0.45) * (1 - d / 14));
    PL.interf = Math.max(PL.interf, clamp(1 - d / 7, 0, 1) * 0.7);
  }
}

// ================= EXPEDITION MEMBERS (hazmat suits) =================
const EXP = [
  { name: 'K. MARSH', tint: [0.86, 0.68, 0.16] }, { name: 'D. OKAFOR', tint: [0.9, 0.57, 0.14], f: 1 },
  { name: 'L. REYES', tint: [0.8, 0.73, 0.28], f: 1 }, { name: 'T. BRANDT', tint: [0.83, 0.63, 0.2] }];
function compassIdx(dx, dz) { return Math.round(((Math.atan2(dx, dz) * 180 / Math.PI + 360) % 360) / 45) % 8; }
function compassWord(dx, dz) { const a = (Math.atan2(dx, dz) * 180 / Math.PI + 360) % 360; return ['NORTH', 'NORTH-EAST', 'EAST', 'SOUTH-EAST', 'SOUTH', 'SOUTH-WEST', 'WEST', 'NORTH-WEST'][Math.round(a / 45) % 8]; }
class Explorer extends Agent {
  constructor(i) {
    super(buildExplorer({ flashlight: true, tint: EXP[i].tint }), 0.3); mergeRig(this.rig);
    Object.assign(this, { i, name: EXP[i].name, st: 'idle', dur: rnd(3, 8), gave: false, talks: 0, threat: null, look: 0, lookTo: 0, lookT: 0, sweep: rnd(0, 10), torchLife: 100, searched: false, wt: null, ft: null });
    const self = this;
    this.inter = { get x() { return self.x; }, get z() { return self.z; }, y: 1.45, r: 2.6, label: () => 'TALK TO ' + self.name, ok: () => self.alive && self.st !== 'flee', act: () => self.talk() };
    W.interact.push(this.inter);
  }
  talk() {
    this.st = 'talk'; this.stT = 0; this.talks++;
    if (talk0(this)) return;   // r6: lines that know the story so far
    const open = W.tapes.filter(s => !s.taken);
    let line, vo, i = this.i;
    if (this.talks === 1) {
      const k = Math.floor(RNG() * 3); line = VO_TXT.greet[k]; vo = `e${i}_greet${k}`;
      if (open.length) {
        const s = open.reduce((a, b) => dist2(a.x, a.z, this.x, this.z) < dist2(b.x, b.z, this.x, this.z) ? a : b);
        const dd = Math.round(dist2(s.x, s.z, this.x, this.z) / 5) * 5;
        const di = compassIdx(s.x - this.x, s.z - this.z), c = dd < 32 ? 0 : dd < 80 ? 1 : 2;
        later(0.3, () => say(this.name, `I saw one of our camera rigs to the ${VO_TXT.dirs[di]}. ${VO_TXT.dist[c]}`, { pos: this, vo: [`e${i}_rig${di}`, `e${i}_dist${c}`] }));
      }
      if (!this.gave) {
        this.gave = true; const bat = PL.spare <= PL.water;
        later(1.2, () => { if (bat) { PL.spare++; toast(this.name + ' GAVE YOU A BATTERY'); } else { PL.water++; toast(this.name + ' GAVE YOU ALMOND WATER'); } SFX.pickup(); });
      }
    } else { const ids = VO_TXT.tipIds[i], t = ids[(this.talks - 2) % ids.length]; line = VO_TXT.tips[t]; vo = `e${i}_tip${t}`; }
    say(this.name, line, { pos: this, vo });
  }
  die(killer) {
    this.alive = false; this.st = 'dead'; G.lost++; this.threat = null; this.hurt = false; expDied0(this);
    SFX.scream(this.pos(1.5), EXP[this.i].f);
    if (killer) this.yaw = Math.atan2(killer.x - this.x, killer.z - this.z) + Math.PI;
    this.sync(); poseDead(this.rig, RNG() < 0.5 ? -1 : 1); this.shadowR = 0.8;
    const self = this;
    W.interact.push({ x: this.x, z: this.z, y: 0.3, r: 2.1, label: () => 'SEARCH ' + self.name, ok: () => !self.searched, act: () => { self.searched = true; searchBody(); } });
    later(1.8, () => { SFX.staticBurst(0.35, 0.8); say('RADIO', `[ SIGNAL LOST — ${this.name} ]`, { radio: true }); });
  }
  update(dt) {
    if (!this.alive) { this.torchLife -= dt; return; }
    const d = this.d, t = FX.t, pl = d < 7 && los(this.x, this.z, PL.x, PL.z);
    this.stT += dt;
    let th = null, td = 1e9;
    for (const h of AI.howlers) {
      const hd = dist2(h.x, h.z, this.x, this.z);
      if (hd < td && (h.prey === this || (hd < 12 && los(h.x, h.z, this.x, this.z)))) { th = h; td = hd; }
    }
    if (th && this.st !== 'flee' && !this.hurt) {
      this.st = 'flee'; this.stT = 0; this.threat = th; this.ft = null;
      if (d < 25) { const k = Math.floor(RNG() * 3); say(this.name, VO_TXT.flee[k], { pos: this, vo: `e${this.i}_flee${k}`, vol: 2.4 }); }
    }
    switch (this.st) {
      case 'idle':
        this.spd = damp(this.spd, 0, 6, dt);
        if (pl) this.face(Math.atan2(PL.x - this.x, PL.z - this.z), 1.5, dt);
        if (this.stT > this.dur && !pl) { const c = randCell(this.x, this.z, 1, 4); this.wt = c >= 0 ? cellPt(c, 0.9, 0.3) : { x: this.x, z: this.z }; this.st = 'wander'; this.stT = 0; }
        break;
      case 'wander':
        if (this.navTo(this.wt.x, this.wt.z, 1.1, dt) < 0.7 || this.stT > 25 || (d < 3.5 && pl)) { this.st = 'idle'; this.stT = 0; this.dur = rnd(4, 11); }
        break;
      case 'hurt': hurtUpdate0(this, dt); break;
      case 'talk':
        this.spd = damp(this.spd, 0, 6, dt); this.face(Math.atan2(PL.x - this.x, PL.z - this.z), 5, dt);
        if (this.stT > 7) { this.st = this.hurt ? 'hurt' : 'idle'; this.stT = 0; this.dur = rnd(3, 6); }
        break;
      case 'flee': {
        const h = this.threat;
        if (!this.ft || this.stT > 7 || dist2(this.x, this.z, this.ft.x, this.ft.z) < 0.8) {
          const hx = h ? h.x : this.x, hz = h ? h.z : this.z;
          const c = randCell(this.x, this.z, 3, 7, c => !h || dist2(cellCenter(c % N), cellCenter((c / N) | 0), hx, hz) > dist2(this.x, this.z, hx, hz) + 5);
          this.ft = c >= 0 ? cellPt(c, 0.8, 0.3) : { x: this.x + rnd(-4, 4), z: this.z + rnd(-4, 4) }; if (this.stT > 7) this.stT = 0.01;
        }
        this.navTo(this.ft.x, this.ft.z, 3.5, dt);
        if (this.stT > 9 && (!h || h.prey !== this) && (!h || dist2(h.x, h.z, this.x, this.z) > 16)) { this.st = 'idle'; this.stT = 0; this.threat = null; this.dur = rnd(5, 9); }
        break;
      }
    }
    // head: scan the halls, or look at the player when close
    this.lookT -= dt;
    if (this.lookT <= 0) { this.lookT = rnd(1.5, 4); this.lookTo = rnd(-0.9, 0.9); }
    const lt = (pl && d < 5) || this.st === 'talk' ? clamp(angDiff(this.yaw, Math.atan2(PL.x - this.x, PL.z - this.z)), -1.1, 1.1) : this.st === 'flee' ? 0 : this.lookTo;
    this.look = damp(this.look, lt, 3, dt);
    const r = this.rig, amp = clamp(this.spd / 2.2, 0, 1.35), fleeing = this.st === 'flee';
    this.ph += this.spd * dt * 2.7;
    const talkP = this.st === 'talk' && !r.sk;   // skinned explorers gesture with the talking clip instead
    if (r.sk) rigBase(r, this.st === 'talk' ? 'talk' : null);
    animHuman(r, this.ph, amp, { armR: -1.2 + 0.07 * Math.sin(t * 0.9 + this.sweep) + (fleeing ? 0.3 : 0), elR: -0.25, armA: 0.4, armL: talkP ? -0.35 + 0.15 * Math.sin(t * 3) : 0,
      elL: talkP ? -0.9 : undefined, look: this.look, lookX: this.st === 'talk' ? -0.1 : 0.12, lean: fleeing ? 0.2 : this.hurt ? 0.35 : 0.05, drop: this.hurt && !r.sk ? -0.42 : 0 });
    r.sh[1].rotation.y = this.look * 0.55 + 0.1 * Math.sin(t * 0.6 + this.sweep);
    this.sync();
  }
}

// ================= THE MIMIC (not everything in a suit is human) =================
class Mimic extends Agent {
  constructor() {
    super(buildExplorer({ mimic: true, tint: [0.84, 0.69, 0.2] }), 0.3); mergeRig(this.rig);
    Object.assign(this, { st: 'pose', seeT: 0, gone: 0, hy: 0, wt: null });
    const self = this;
    W.interact.push({ get x() { return self.x; }, get z() { return self.z; }, y: 1.45, r: 2.6, label: () => 'TALK TO EXPLORER', ok: () => self.present && (self.st === 'pose' || self.st === 'lure'), act: () => self.reveal() });
    this.relocate(LV.spawnD);
  }
  relocate(F) {
    F = F || PL.field;
    const cand = [];
    for (let c = 0; c < N * N; c++) {
      if (F[c] < 8 || F[c] > 18) continue; const x = cellCenter(c % N), z = cellCenter((c / N) | 0);
      if (los(PL.x, PL.z, x, z) && dist2(x, z, PL.x, PL.z) < 30) continue;
      if ([0, 1, 2, 3].some(d => edgeVal(c % N, (c / N) | 0, d) === 1)) cand.push(c);
    }
    if (!cand.length) { this.gone = 10; return; }
    const c = pick(cand), cx = c % N, cy = (c / N) | 0, walls = [0, 1, 2, 3].filter(d => edgeVal(cx, cy, d) === 1), wd = pick(walls);
    const [mx, mz] = edgeMid(cx, cy, wd), off = rnd(-0.9, 0.9);
    const p = { x: mx - DX[wd] * 0.75 + (DX[wd] ? 0 : off), z: mz - DY[wd] * 0.75 + (DY[wd] ? 0 : off) }; collide(p, 0.3);
    this.place(p.x, p.z, Math.atan2(DX[wd], DY[wd]));
    this.st = 'pose'; this.stT = 0; this.seeT = 0; this.present = true; this.hy = 0;
    setEmi(this.rig.mat, 0); setDissolve(this.rig.mat, 0);
  }
  reveal() {
    if (this.st !== 'pose' && this.st !== 'lure') return;
    this.st = 'reveal'; this.stT = 0; SFX.screech(this.pos(1.6), true); SFX.sting(); FX.glitch = Math.max(FX.glitch, 1.5);
  }
  attack() { SFX.jumpscare(); PL.lookAt = { x: this.x, y: 1.55, z: this.z }; PL.lookK = 0.5; hurt(32, 'mimic'); this.st = 'vanish'; this.stT = 0; }
  update(dt) {
    if (this.gone > 0) { this.present = false; this.gone -= dt; if (this.gone <= 0) this.relocate(); return; }
    const d = this.d, t = FX.t, r = this.rig, play = G.state === 'play';
    this.stT += dt;
    const toP = Math.atan2(PL.x - this.x, PL.z - this.z);
    let look = 0, amp = 0, jit = 0;
    if (play && (this.st === 'pose' || this.st === 'lure')) {   // it borrows the explorers' voices
      this.vT = (this.vT ?? rnd(4, 9)) - dt;
      if (this.vT <= 0 && d > 5 && d < 19) { this.vT = rnd(11, 19); const k = Math.floor(RNG() * VO_TXT.mimic.length), alt = mimicLine0(); say('???', alt ? alt.text : VO_TXT.mimic[k], { pos: this, vo: alt ? null : `mim${RNG() < 0.5 ? 0 : 2}_${k}`, mode: 'mimic', drop: true }); }
    }
    switch (this.st) {
      case 'pose':
        this.spd = 0;
        if (play && d < 4.3 && los(this.x, this.z, PL.x, PL.z)) { this.reveal(); break; }
        if (play && d > 7 && d < 16 && playerCanSee(this.x, 1.4, this.z)) this.seeT += dt; else this.seeT = Math.max(0, this.seeT - dt);
        if (this.seeT > 2.2) {
          const c = randCell(this.x, this.z, 2, 4, c => PL.field[c] > PL.field[this.cell()]);
          if (c >= 0) { this.wt = cellPt(c, 0.6, 0.3); this.st = 'lure'; this.stT = 0; }
          this.seeT = 0;
        }
        break;
      case 'lure':
        if (play && d < 4.3 && los(this.x, this.z, PL.x, PL.z)) { this.reveal(); break; }
        if (this.navTo(this.wt.x, this.wt.z, 1.15, dt) < 0.6 || this.stT > 20) { this.st = 'pose'; this.stT = 0; this.yaw = toP + Math.PI; }
        amp = clamp(this.spd / 2.2, 0, 1);
        break;
      case 'reveal':
        this.spd = 0; look = clamp(angDiff(this.yaw, toP), -3.1, 3.1) * smooth(0, 0.9, this.stT); jit = 0.15;
        setEmi(r.mat, 7 * smooth(0.2, 0.8, this.stT));
        if (this.stT > 1.2) { this.st = 'chase'; this.stT = 0; }
        break;
      case 'chase':
        this.navTo(PL.x, PL.z, [3.3, 3.95, 4.45][G.diff], dt, PL.field);
        amp = clamp(this.spd / 2.6, 0, 1.4); look = clamp(angDiff(this.yaw, toP), -1.2, 1.2); jit = 0.35;
        setEmi(r.mat, 7);
        if (play && d < 1.2) this.attack();
        if (this.stT > 18 || d > 28) { this.st = 'vanish'; this.stT = 0; }
        PL.fear = Math.max(PL.fear, 0.5 + 0.5 * clamp(1 - d / 20, 0, 1));
        break;
      case 'vanish':
        setDissolve(r.mat, clamp(this.stT, 0, 1));
        if (this.stT > 1) { this.gone = rnd(45, 70); this.present = false; setDissolve(r.mat, 0); }
        break;
    }
    this.hy = damp(this.hy, look, this.st === 'reveal' ? 5 : 8, dt);
    this.ph += this.spd * dt * 2.7;
    const j = (k) => jit * (hash1(Math.floor(t * 12) * 1.7 + k) - 0.5);
    animHuman(r, this.ph, amp, { armA: 0.55, armR: j(1) - (this.st === 'chase' ? 0.6 : 0), armL: j(2) - (this.st === 'chase' ? 0.6 : 0), elL: -0.2 + j(3), elR: -0.2 + j(4),
      look: this.hy + j(5), lookX: j(6), lookZ: this.st === 'reveal' ? 0.5 * smooth(0.4, 1.1, this.stT) : j(7) * 2, lean: this.st === 'chase' ? 0.3 : 0.02 });
    if (this.st === 'pose') { r.torso.rotation.x = 0.05 + Math.sin(t * 0.4) * 0.01; r.head.rotation.x = 0.35; }
    this.sync();
  }
}

// ================= director =================
function initAI() {
  for (const b of W.dead) { mergeRig(b.r); const a = new Agent(b.r, 0.3); a.x = b.x; a.z = b.z; a.shadowR = 0.8; a.body = true; a.sync = () => {}; AI.all.push(a); }
  const used = new Set([cIdx(LV.spawn.x, LV.spawn.y)]);
  const ranges = [[2, 4], [6, 11], [10, 17], [14, 26]];
  EXP.forEach((e, i) => {
    let cs = []; for (const [a, b] of [ranges[i], [2, 30]]) { for (let c = 0; c < N * N; c++) if (LV.spawnD[c] >= a && LV.spawnD[c] <= b && !used.has(c)) cs.push(c); if (cs.length) break; }
    const c = pick(cs); used.add(c);
    const ex = new Explorer(i), p = cellPt(c, 0.8, 0.3); ex.place(p.x, p.z, rnd(0, TAU)); AI.exps.push(ex); AI.all.push(ex);
  });
  const nh = [1, 1, 2][G.diff];
  for (let i = 0; i < nh; i++) spawnHowler(i ? 12 : 14);
  AI.crawler = null;   // r7: the Crawler (the one that only moves when you look away) is gone from Level 0
  const ns = Math.min(LV.darkCenters.length, [1, 2, 3][G.diff]);
  for (let i = 0; i < ns; i++) { const s = new Smiler(LV.darkCenters[i], i); AI.smilers.push(s); AI.all.push(s); }
  if (G.diff >= 1) { AI.mimic = new Mimic(); AI.all.push(AI.mimic); }
  placeReyes0();   // r6: Reyes starts hurt in the flooded office
}
function spawnHowler(minCells) {
  const h = new Howler(AI.howlers.length), c = farCell(minCells, 99), p = cellPt(c >= 0 ? c : 0);
  h.place(p.x, p.z, rnd(0, TAU)); AI.howlers.push(h); AI.all.push(h); return h;
}
function updateAI(dt) {
  PL.fear = 0; PL.interf = 0; AI.flick = 0; G.chase = 0;
  for (const a of AI.all) a.update(dt);
  AI.visT -= dt;
  if (AI.visT <= 0) { AI.visT = 0.1; for (const a of AI.all) a.cull(); }
  // contact shadows for the nearest visible bodies
  const cs = [];
  for (const a of AI.all) if (a.shown && a.shadowR > 0) { const d = a.d; if (d < 22) cs.push([d, a]); }
  cs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 8; i++) { const a = cs[i] && cs[i][1]; if (a) setShadowCaster(i, a.x, a.z, a.shadowR, a.body || (!a.alive && a.st === 'dead') ? 0.5 : 0.62); else setShadowCaster(i, 0, 0, 0, 0); }
  // expedition flashlights (slots 1-3) with volumetric beams
  const tl = [];
  for (const e of AI.exps) { if (!e.alive && e.torchLife <= 0) continue; const d = e.d; if (d < 34) tl.push([d, e]); }
  tl.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 3; i++) {
    const e = tl[i] && tl[i][1], b = W.beams[i];
    if (!e) { clearSlot(1 + i); placeBeam(b, null, null, 0); continue; }
    const m = worldMat(e.rig.el[1]);
    const tip = BABYLON.Vector3.TransformCoordinates(TORCH_TIP, m), dir = BABYLON.Vector3.TransformNormal(DOWN, m).normalize();
    const fl = e.alive ? (hash1(Math.floor(FX.t * 20) + e.i * 9) < 0.02 ? 0.4 : 1) : (hash1(Math.floor(FX.t * 9) + e.i) < 0.18 ? 0.15 : 0.85) * clamp(e.torchLife / 25, 0, 1);
    setSlot(1 + i, tip, 3.4 * fl, dir, Math.cos(0.38), [1, 0.9, 0.72], 16, true, 0.12);
    placeBeam(b, tip, dir, e.shown ? (0.035 + 0.09 * clamp(1 - PL.light, 0, 1)) * fl : 0);
  }
}
