// ---------- r7 · Level 5: female deathmoths, their acid, and Mothex ----------
// Lore (Backrooms wiki, Deathmoths): males are the smaller ones and scare easily; females are huge, hostile and produce acid;
// both can be tamed with almond water. Here: Mothex kills the males (the moths you have met all level) and does nothing to a female
// except make her angry. A female hangs at her nest; noise, a light held on her or a sprayed can wakes her and she spits acid from
// the air, never straying far from her nest. Pour almond water into her bowl and she comes down to drink and is calm for good.
const FEM5 = { acid: [], pud: [], mist: [], am: null, mm: null };
class MothF extends Agent {
  constructor(n) {
    super(buildMoth({ fem: true }), 0.75); mergeRig(this.rig); this.noSep = true; this.rig.root.scaling.setAll(2.05);
    Object.assign(this, { nest: n, fem: true, fed: !!n.fed, st: 'roost', stT: 0, y: n.y, stir: 0, spitCd: 2.5, wph: rnd(0, TAU), roll: 0, pitch: 0, orbA: rnd(0, TAU), angryT: 0, calmT: 0, shadowR: 0.9, i: 99, boil: !!n.boil, chitCd: 0, lastSeen: 0 });
    this.place(n.x, n.z, rnd(0, TAU));
  }
  sync() { const r = this.rig.root; r.position.set(this.x, this.y, this.z); r.rotation.set(this.pitch, this.yaw, this.roll); }
  provoke(why) {
    if (this.fed) { if (why === 'spray') toast('SHE DOES NOT EVEN LOOK UP', 1.8); return; }
    if (why === 'spray' && !ST5.sprayTip) { ST5.sprayTip = true; later(0.4, () => toast('THE SPRAY DOES NOTHING TO HER', 2.4)); }
    if (this.st === 'angry') { this.angryT = 0; return; }
    this.st = 'angry'; this.stT = 0; this.angryT = 0; this.spitCd = 1.1; this.stir = 1;
    SFX5.screech(this.pos(this.y)); SFX5.burst(this.pos(this.y)); FX.glitch = Math.max(FX.glitch, 0.5);
  }
  feed() { this.fed = true; this.nest.fed = true; this.st = 'drink'; this.stT = 0; this.stir = 0; }
  reset() { this.st = this.fed ? 'calm' : 'roost'; this.stT = 0; this.stir = 0; this.angryT = 0; this.place(this.nest.x, this.nest.z, this.yaw); this.y = this.nest.y; }
  hover(tx, tz, spd, dt) {
    const dx = tx - this.x, dz = tz - this.z, d = Math.hypot(dx, dz); if (d < 0.02) return d;
    this.face(Math.atan2(dx, dz), 3, dt); const k = Math.min(d, spd * dt), p = { x: this.x + dx / d * k, z: this.z + dz / d * k }; collideW(p, 0.5); this.x = p.x; this.z = p.z; return d;
  }
  update(dt) {
    const t = FX.t, n = this.nest, d = this.d, play = G.state === 'play'; this.stT += dt; this.spitCd -= dt; this.chitCd -= dt;
    if (this.st === 'roost' && d > 30) { if (this.shown) this.cull(); return; }
    let alt = n.y, flap = 0, fold = true;
    const top = ceil5(this.cell()) - 0.6;
    switch (this.st) {
      case 'roost': {   // hanging at the nest; she notices noise, a light held on her, or you walking right under her
        this.x = damp(this.x, n.x, 2, dt); this.z = damp(this.z, n.z, 2, dt);
        if (play && !this.fed) {
          const near = d < 11 && los(this.x, this.z, PL.x, PL.z);
          let s = -0.25;
          if (near && PL.noise > 0.12) s += PL.noise * 2.6;
          if (near && PL.fk > 0.5 && inBeam(this.x, this.y, this.z, 11, 0.94)) s += [0.55, 0.8, 1.1][G.diff];
          if (d < 2.6) s += 0.7;
          this.stir = clamp(this.stir + s * dt, 0, 1.2);
          if (this.stir > 0.5 && this.chitCd <= 0 && d < 16) { this.chitCd = 4; SFX5.chitter(this.pos(this.y)); }
          if (this.stir >= 1) this.provoke('stir');
        }
        break;
      }
      case 'angry': {   // off the nest, circling within reach of it, spitting at you whenever she can see you
        fold = false; flap = 11; G.chase = Math.max(G.chase, 0.7); PL.fear = Math.max(PL.fear, 0.8);
        const sees = play && d < 17 && los(this.x, this.z, PL.x, PL.z);
        this.angryT = sees ? 0 : this.angryT + dt; if (sees) this.lastSeen = t;
        this.orbA += dt * 0.7;
        const R = Math.min(n.leash, 3.4), tx = n.x + Math.sin(this.orbA) * R * 0.7, tz = n.z + Math.cos(this.orbA) * R * 0.7;
        let gx = tx, gz = tz;
        if (sees) { const a = Math.atan2(PL.x - n.x, PL.z - n.z), r2 = Math.min(n.leash, Math.max(0, d - 4.5)); gx = n.x + Math.sin(a) * r2 * 0.6 + Math.sin(this.orbA * 2) * 1.2; gz = n.z + Math.cos(a) * r2 * 0.6 + Math.cos(this.orbA * 2) * 1.2; }
        this.hover(gx, gz, 2.4, dt); if (sees) this.face(Math.atan2(PL.x - this.x, PL.z - this.z), 4, dt);
        alt = clamp(2.6 + 0.3 * Math.sin(t * 1.3), 1.8, top);
        if (sees && this.spitCd <= 0 && play) { this.spitCd = [2.7, 2.2, 1.7][G.diff] + rnd(0, 0.6); spit5(this); }
        if (this.angryT > 7 || this.stT > 26) { this.st = 'settle'; this.stT = 0; }
        break;
      }
      case 'settle': {
        fold = false; flap = 7; const r = this.hover(n.x, n.z, 1.6, dt); alt = n.y;
        if (r < 0.4 && Math.abs(this.y - n.y) < 0.3) { this.st = this.fed ? 'calm' : 'roost'; this.stT = 0; this.stir = 0.2; }
        break;
      }
      case 'drink': {   // down to the bowl, wings slow
        fold = false; flap = 5; const b = n.bowl, r = this.hover(b.x + 0.5, b.z + 0.2, 1.8, dt);
        alt = r < 0.6 ? b.y + 0.55 : 2.2; if (r < 0.6) this.face(Math.atan2(b.x - this.x, b.z - this.z), 2, dt);
        if (this.stT > 9) { this.st = 'settle'; this.stT = 0; }
        break;
      }
      case 'calm': { this.x = damp(this.x, n.x, 2, dt); this.z = damp(this.z, n.z, 2, dt); break; }
    }
    this.y = damp(this.y, clamp(alt, 0.6, top + 0.4) + (fold ? 0 : Math.sin(t * 1.9) * 0.1), 2.2, dt);
    this.pitch = damp(this.pitch, fold ? -0.3 : 0.08, 3, dt); this.roll = damp(this.roll, 0, 3, dt);
    this.wph += dt * flap * TAU * 0.5;
    const A = fold ? (hash1(Math.floor(t * 1.5 + 3)) < 0.05 ? 0.25 : 0) : 0.7, sweep = fold ? 1.2 : 0.25;
    for (const W of this.rig.wings) { const lift = fold ? -0.3 + A * Math.sin(t * 24) : 0.12 + A * Math.sin(this.wph + (W.fore ? 0 : 0.5)); W.n.rotation.set(0, W.s * (W.fore ? sweep : sweep + 0.35), W.s * lift); }
    this.sync();
  }
}
// ----- acid -----
function acidMat5() { if (!FEM5.am) { FEM5.am = actMat('acid5', { emis: 1 }); setEmi(FEM5.am, 0.5, 1.6, 0.2); } return FEM5.am; }
function spit5(m) {
  const sx = m.x + Math.sin(m.yaw) * 0.7, sz = m.z + Math.cos(m.yaw) * 0.7, sy = m.y - 0.2, D = Math.hypot(PL.x - sx, PL.z - sz), T = clamp(D / 10, 0.35, 1.3), g = 7;
  const tx = PL.x + (PL.vx || 0) * T * 0.7, tz = PL.z + (PL.vz || 0) * T * 0.7, ty = 1.15;
  const mesh = mkMerged(acidMat5(), P => { P('Sphere', { diameter: 0.2, segments: 6 }, [0.5, 1, 0.3], 1, [0, 0, 0]); P('Sphere', { diameter: 0.13, segments: 5 }, [0.6, 1, 0.4], 1, [0, 0, -0.14]); }, 'acid5');
  mesh.position.set(sx, sy, sz);
  FEM5.acid.push({ x: sx, y: sy, z: sz, vx: (tx - sx) / T, vz: (tz - sz) / T, vy: (ty - sy + 0.5 * g * T * T) / T, g, t: 0, mesh });
  SFX5.spit(m.pos(m.y));
}
function puddle5(x, z) {
  const mesh = mkMerged(acidMat5(), P => { P('Cylinder', { diameter: 0.9, height: 0.01, tessellation: 14 }, [0.3, 0.7, 0.2], 0.6, [0, 0, 0]); for (let i = 0; i < 4; i++) P('Cylinder', { diameter: rnd(0.15, 0.3), height: 0.012, tessellation: 8 }, [0.35, 0.8, 0.25], 0.7, [rnd(-0.5, 0.5), 0, rnd(-0.5, 0.5)]); }, 'puddle5');
  mesh.position.set(x, 0.012, z); FEM5.pud.push({ x, z, t: 0, mesh, hitT: 0 });
  SFX5.splat({ x, y: 0.1, z, pl: { x: PL.x, z: PL.z } });
}
function acidTick5(dt) {
  for (let i = FEM5.acid.length - 1; i >= 0; i--) {
    const a = FEM5.acid[i], ox = a.x, oz = a.z; a.t += dt; a.vy -= a.g * dt; a.x += a.vx * dt; a.y += a.vy * dt; a.z += a.vz * dt; a.mesh.position.set(a.x, a.y, a.z);
    const hitP = G.state === 'play' && Math.hypot(a.x - PL.x, a.z - PL.z) < 0.55 && a.y > 0.2 && a.y < 1.95;
    const wall = !los(ox, oz, a.x, a.z) || a.y < 0.05 || a.t > 3;
    if (hitP) { hurt(16, 'acid'); PL.san = Math.max(0, PL.san - 6); FX.glitch = Math.max(FX.glitch, 1.2); SFX5.splat({ x: PL.x, y: 1.2, z: PL.z, pl: { x: PL.x, z: PL.z } }); }
    if (hitP || wall) { if (!hitP) puddle5(clamp(a.x, ox - 1, ox + 1), clamp(a.z, oz - 1, oz + 1)); a.mesh.dispose(); FEM5.acid.splice(i, 1); }
  }
  for (let i = FEM5.pud.length - 1; i >= 0; i--) {
    const p = FEM5.pud[i]; p.t += dt; const k = 1 - smooth(5, 7, p.t); p.mesh.scaling.set(k, 1, k);
    if (G.state === 'play' && k > 0.3 && Math.hypot(p.x - PL.x, p.z - PL.z) < 0.5 * k) { p.hitT -= dt; if (p.hitT <= 0) { p.hitT = 0.5; hurt(2.5, 'acid'); } }
    if (p.t > 7) { p.mesh.dispose(); FEM5.pud.splice(i, 1); }
  }
}
// ----- Mothex -----
function useSpray5() {
  if (LVL !== 5 || G.state !== 'play' || !ST5.hasSpray) return;
  if (FEM5.cd > FX.t) return;
  if (ST5.spray <= 0) { SFX.click(); toast('THE CAN IS EMPTY', 1.4); return; }
  ST5.spray--; FEM5.cd = FX.t + 0.75; makeNoise(0.12); tasksState5();
  const f = CAM.getDirection(BABYLON.Axis.Z), cp = CAM.position;
  SFX5.spray({ x: cp.x + f.x, y: cp.y, z: cp.z + f.z, pl: { x: PL.x, z: PL.z } });
  mist5(cp, f);
  let hit = 0;
  for (const m of AI5.moths) {
    if (!m.alive) continue;
    const dx = m.x - cp.x, dy = m.y - cp.y, dz = m.z - cp.z, d = Math.hypot(dx, dy, dz), R = m.fem ? 5.5 : 4.4;
    if (d > R || (dx * f.x + dy * f.y + dz * f.z) / (d || 1) < (d < 1.4 ? 0.3 : 0.8) || !los(cp.x, cp.z, m.x, m.z)) continue;
    if (m.fem) m.provoke('spray'); else { m.die(); hit++; }
  }
  if (hit && !ST5.killTip) { ST5.killTip = true; later(0.6, () => toast('IT DROPS', 1.6)); }
  if (!ST5.spray) later(0.8, () => toast('MOTHEX · EMPTY', 1.8));
}
function mistMat5() { if (!FEM5.mm) { const m = new BABYLON.StandardMaterial('mist5', SCN); m.disableLighting = true; m.emissiveColor = new BABYLON.Color3(0.55, 0.6, 0.55); m.alpha = 0.2; m.backFaceCulling = false; FEM5.mm = m; MATS.std = (MATS.std || []).concat([m]); } return FEM5.mm; }
function mist5(cp, f) {
  for (let i = 0; i < 9; i++) {
    const m = BABYLON.MeshBuilder.CreateSphere('mist5', { diameter: 0.3, segments: 4 }, SCN); m.material = mistMat5(); m.isPickable = false; m._sortD = 100; m.__noPortal = true;
    const a = rnd(-0.18, 0.18), b = rnd(-0.12, 0.12), sp = rnd(3, 5.5);
    const v = { x: f.x + a * f.z, y: f.y + b, z: f.z - a * f.x };
    m.position.set(cp.x + f.x * 0.45, cp.y - 0.12, cp.z + f.z * 0.45);
    FEM5.mist.push({ m, vx: v.x * sp, vy: v.y * sp, vz: v.z * sp, t: 0, life: rnd(0.6, 1.0) });
  }
}
function mistTick5(dt) {
  for (let i = FEM5.mist.length - 1; i >= 0; i--) {
    const q = FEM5.mist[i]; q.t += dt; const k = q.t / q.life, drag = Math.exp(-dt * 3);
    q.vx *= drag; q.vy = q.vy * drag - dt * 0.3; q.vz *= drag; q.m.position.x += q.vx * dt; q.m.position.y += q.vy * dt; q.m.position.z += q.vz * dt;
    q.m.scaling.setAll(1 + k * 4); q.m.visibility = Math.max(0, 1 - k);
    if (k >= 1) { q.m.dispose(); FEM5.mist.splice(i, 1); }
  }
}
function femaleInit5() {
  DEATH_TXT.acid = ['SHE SPAT', 'The lens fogs green and the picture eats in from the edges.'];
  FEM5.acid.length = 0; FEM5.pud.length = 0; FEM5.mist.length = 0; FEM5.am = null; FEM5.mm = null; FEM5.cd = 0;
  for (const n of W5.fnests || []) { const m = new MothF(n); AI.all.push(m); AI5.moths.push(m); if (n.fed) m.st = 'calm'; }
}
function femaleTick5(dt) { acidTick5(dt); mistTick5(dt); }
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { FEM5, MothF, useSpray5, spit5, femaleTick5 }));
