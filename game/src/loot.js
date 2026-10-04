// ---------- r12 · loot on every level: energy bars and drinks on the floor, drawers against the walls, one locked chest and the key to it ----------
// Each level's own buildItemsN still places almond water and camcorder batteries; it then calls buildLoot(cells, diff, opts) with the cells it likes.
//   floor   : energy bars, energy drinks (and flashlight cell packs on Level 9, where the flashlight has its own batteries)
//   drawers : chests of drawers flush to plain walls, three drawers each; E opens the next closed one (some are empty, some hold two things)
//   chest   : one per level, locked, holds most of what the level gives in one place; the key is in a drawer far from it (optional tasks: find the key, open the chest)
// The words are UI register (labels, toasts, task lines); each level names its chest and key in LOOT_THEME.
const LOOT_N = { battery: 'CAMCORDER BATTERY', bar: 'ENERGY BAR', drink: 'ENERGY DRINK', water: 'ALMOND WATER', cells: 'FLASHLIGHT BATTERIES' };
const LOOT_FLOOR = { bar: [4, 3, 2], drink: [3, 3, 1], cells: [3, 2, 1] };            // [Easy, Normal, Nightmare], on top of the level's own water and batteries
const LOOT_CHEST = { bar: [4, 3, 2], drink: [3, 3, 2], battery: [3, 2, 1], water: [3, 2, 1], cells: [3, 2, 1] };
const LOOT_UNITS = [10, 8, 6];                                                       // drawer units before the level's own factor
// chest / key names and colours per level: body wood or metal, drawer fronts, metalwork, scale of the drawer count
const LOOT_THEME = {
  0: { chest: 'LOCKBOX', key: 'LOCKBOX KEY', body: [0.5, 0.5, 0.46], front: [0.58, 0.58, 0.52], metal: [0.7, 0.7, 0.68], k: 1.2 },
  9: { chest: 'FOOTLOCKER', key: 'FOOTLOCKER KEY', body: [0.3, 0.32, 0.22], front: [0.4, 0.28, 0.17], metal: [0.62, 0.6, 0.55], k: 1.6 },
  5: { chest: 'LUGGAGE TRUNK', key: 'TRUNK KEY', body: [0.3, 0.17, 0.1], front: [0.38, 0.22, 0.12], metal: [0.8, 0.62, 0.22], k: 1.4 },
  18: { chest: 'TOY CHEST', key: 'TOY CHEST KEY', body: [0.35, 0.5, 0.78], front: [0.92, 0.74, 0.2], metal: [0.85, 0.85, 0.82], k: 1.0 },
  37: { chest: 'STORAGE CHEST', key: 'STORAGE KEY', body: [0.56, 0.6, 0.6], front: [0.46, 0.55, 0.55], metal: [0.74, 0.76, 0.75], k: 1.2 },
  2: { chest: 'TOOL CHEST', key: 'TOOL CHEST KEY', body: [0.5, 0.12, 0.1], front: [0.55, 0.14, 0.1], metal: [0.6, 0.6, 0.6], k: 1.0 },
  7: { chest: 'SEA CHEST', key: 'SEA CHEST KEY', body: [0.26, 0.19, 0.13], front: [0.34, 0.25, 0.17], metal: [0.45, 0.43, 0.4], k: 0.9 },
};
function giveLoot(type, n = 1) {
  if (type === 'battery') PL.spare += n; else if (type === 'bar') PL.bars = (PL.bars || 0) + n; else if (type === 'drink') PL.drinks = (PL.drinks || 0) + n;
  else if (type === 'cells') PL.cells = (PL.cells || 0) + n; else PL.water += n;
}
const lootLabel = type => 'TAKE ' + LOOT_N[type];
// is a rectangle clear of every solid (props, walls, furniture)?
function lootRectFree(x0, z0, x1, z1) {
  for (let bz = Math.max(0, Math.floor(z0 / BK)); bz <= Math.min(NBK - 1, Math.floor(z1 / BK)); bz++) for (let bx = Math.max(0, Math.floor(x0 / BK)); bx <= Math.min(NBK - 1, Math.floor(x1 / BK)); bx++)
    for (const si of LV.buckets[bz * NBK + bx]) { const b = LV.solids[si]; if (!b.off && x0 < b.x1 && x1 > b.x0 && z0 < b.z1 && z1 > b.z0) return false; }
  return true;
}
// a spot flush against a plain wall of cell c for a unit w wide and dp deep, never in a cell with a door, gate or window on any side
function lootWallSpot(c, w, dp) {
  const x = c % N, y = (c / N) | 0, ek = LV.ek;
  for (let d = 0; d < 4; d++) { const v = edgeVal(x, y, d); if (v === 2 || (ek && ek.has(eKey(x, y, d))) || (LV.win9 && LV.win9.has(eKey(x, y, d)))) return null; }
  for (const d of shuffle([0, 1, 2, 3])) {
    if (edgeVal(x, y, d) !== 1) continue;
    const room = CELL / 2 - w / 2 - 0.45; if (room < 0) continue;
    const [px, pz, ry] = wallPt(x, y, d, 0, rnd(-room, room)), nx = Math.sin(ry), nz = Math.cos(ry), cx = px + nx * (dp / 2 + 0.03), cz = pz + nz * (dp / 2 + 0.03);
    const alongX = Math.abs(nx) > 0.5, hx = alongX ? dp / 2 : w / 2, hz = alongX ? w / 2 : dp / 2, fx = cx + nx * (dp / 2 + 0.7), fz = cz + nz * (dp / 2 + 0.7);
    if (cellOf(cx) !== x || cellOf(cz) !== y) continue;
    if (!lootRectFree(cx - hx - 0.01, cz - hz - 0.01, cx + hx + 0.01, cz + hz + 0.01) || !lootRectFree(fx - 0.28, fz - 0.28, fx + 0.28, fz + 0.28)) continue;
    return { x: cx, z: cz, ry, nx, nz, hx, hz, fx, fz, c, d };
  }
  return null;
}
const lootSummary = (got) => Object.entries(got).filter(([, n]) => n > 0).map(([t, n]) => LOOT_N[t] + ' +' + n).join(' · ');
function lootTypes() { return flashOwn() ? ['water', 'bar', 'drink', 'battery', 'cells'] : ['water', 'bar', 'drink', 'battery']; }
function lootRoll() {   // what one drawer holds
  if (RNG() < 0.4) return {};
  const t = lootTypes(), w = { water: 25, bar: 25, drink: 18, battery: 18, cells: 14 }, out = {};
  for (let k = 0; k < (RNG() < 0.2 ? 2 : 1); k++) { let r = RNG() * t.reduce((a, q) => a + w[q], 0), pick_ = t[0]; for (const q of t) { r -= w[q]; if (r <= 0) { pick_ = q; break; } } out[pick_] = (out[pick_] || 0) + 1; }
  return out;
}
// ----- models: a chest of drawers (static body plus one mesh per drawer so it can slide) and a trunk with a hinged lid -----
function lootBuildUnit(mat, T, spot, y, nDraw) {
  const root = tnode(null, spot.x, y, spot.z); root.rotation.y = spot.ry;
  const Wd = 0.9, H = 0.86, D = 0.46, hD = (H - 0.26) / nDraw, drawers = [];
  attach(mkMerged(mat, P => {
    P('Box', { width: Wd, height: H - 0.1, depth: D }, T.body, 0, [0, 0.05 + (H - 0.1) / 2, 0]);
    P('Box', { width: Wd + 0.04, height: 0.04, depth: D + 0.03 }, T.body.map(v => v * 1.12), 0, [0, H - 0.02, 0.005]);
    P('Box', { width: Wd - 0.08, height: 0.08, depth: D - 0.06 }, T.body.map(v => v * 0.55), 0, [0, 0.04, 0]);
  }, 'lootBody'), root);
  for (let i = 0; i < nDraw; i++) {
    const cy = 0.12 + hD / 2 + i * (hD + 0.02) + 0.04;
    const m = mkMerged(mat, P => {
      P('Box', { width: Wd - 0.1, height: hD, depth: 0.03 }, T.front, 0, [0, cy, D / 2 + 0.004]);
      P('Box', { width: 0.22, height: 0.022, depth: 0.03 }, T.metal, 0, [0, cy + hD * 0.15, D / 2 + 0.03]);
      P('Box', { width: Wd - 0.16, height: 0.014, depth: D - 0.08 }, T.body.map(v => v * 0.45), 0, [0, cy - hD / 2 + 0.03, -0.04]);
      for (const s of [-1, 1]) P('Box', { width: 0.014, height: hD - 0.06, depth: D - 0.08 }, T.body.map(v => v * 0.6), 0, [s * (Wd - 0.17) / 2, cy, -0.04]);
    }, 'lootDrawer');
    attach(m, root); drawers.push({ m, open: false, z: 0, items: {}, key: false });
  }
  const hx = spot.hx, hz = spot.hz; addSolid(spot.x - hx, spot.z - hz, spot.x + hx, spot.z + hz, 'prop');
  return { root, drawers, spot, next: 0, y };
}
function lootBuildChest(mat, T, spot, y) {
  const root = tnode(null, spot.x, y, spot.z); root.rotation.y = spot.ry; const Wd = 0.95, D = 0.56;
  attach(mkMerged(mat, P => {
    P('Box', { width: Wd, height: 0.4, depth: D }, T.body, 0, [0, 0.24, 0]);
    P('Box', { width: Wd - 0.06, height: 0.05, depth: D - 0.06 }, T.body.map(v => v * 0.5), 0, [0, 0.03, 0]);
    for (const s of [-1, 1]) P('Box', { width: 0.06, height: 0.42, depth: D + 0.02 }, T.metal, 0, [s * 0.32, 0.24, 0]);
    P('Box', { width: 0.12, height: 0.13, depth: 0.025 }, T.metal, 0, [0, 0.4, D / 2 + 0.01]);
    P('Sphere', { diameter: 0.025, segments: 5 }, [0.08, 0.07, 0.06], 0, [0, 0.4, D / 2 + 0.025]);
  }, 'chestBase'), root);
  const hinge = tnode(root, 0, 0.44, -D / 2);
  attach(mkMerged(mat, P => {
    P('Box', { width: Wd + 0.02, height: 0.14, depth: D + 0.02 }, T.front, 0, [0, 0.07, D / 2]);
    P('Box', { width: Wd - 0.02, height: 0.05, depth: D - 0.08 }, T.front.map(v => v * 1.1), 0, [0, 0.16, D / 2]);
    for (const s of [-1, 1]) P('Box', { width: 0.06, height: 0.17, depth: D + 0.03 }, T.metal, 0, [s * 0.32, 0.075, D / 2]);
    P('Box', { width: 0.08, height: 0.06, depth: 0.025 }, T.metal, 0, [0, 0.02, D + 0.012]);
  }, 'chestLid'), hinge);
  addSolid(spot.x - spot.hx, spot.z - spot.hz, spot.x + spot.hx, spot.z + spot.hz, 'prop');
  return { root, hinge, spot, open: false, a: 0, y };
}
// ----- the whole thing -----
function buildLoot(cells, diff, o = {}) {
  const T = LOOT_THEME[LVL] || LOOT_THEME[9], mat = actMat('loot', { spec: 0.35, shin: 24, wrap: 0.3, emis: 1 }), ys = o.y || (() => 0), okp = o.ok || (() => true), skip = o.skipCell || (() => false);
  const L = W.loot = { units: [], chest: null, hasKey: false, T, floor: { bar: 0, drink: 0, cells: 0 }, mat }, imat = W.itemMat || mat;
  const pool = shuffle(cells.filter(c => !skip(c))), used = new Set();
  // ---- floor: bars, drinks, flashlight cells ----
  if (!o.noFloor) for (const type of ['bar', 'drink', 'cells']) {
    if (type === 'cells' && !flashOwn()) continue;
    for (let n = LOOT_FLOOR[type][diff], tries = 0; n > 0 && tries < 400; tries++) {
      const c = pool[(tries + (type === 'bar' ? 0 : type === 'drink' ? 31 : 67)) % pool.length]; if (c === undefined || used.has(c)) continue;
      const p = { x: cellCenter(c % N) + rnd(-1.1, 1.1), z: cellCenter((c / N) | 0) + rnd(-1.1, 1.1) }; collide(p, 0.3);
      if (cellOf(p.x) !== c % N || cellOf(p.z) !== ((c / N) | 0) || !okp(p.x, p.z)) continue;
      used.add(c); n--; L.floor[type]++;
      const root = tnode(null, p.x, ys(p.x, p.z), p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, imat);
      const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => lootLabel(type), ok: () => !it.taken, act: () => takeItem(it) });
    }
  }
  // ---- drawers ----
  const want = Math.round(LOOT_UNITS[diff] * T.k * (o.k ?? 1)), spots = [];
  for (const c of shuffle(pool.slice())) {
    if (L.units.length >= want) break;
    const sp = lootWallSpot(c, 0.9, 0.46); if (!sp || !okp(sp.x, sp.z) || L.units.some(u => Math.hypot(u.spot.x - sp.x, u.spot.z - sp.z) < 5)) continue;
    const u = lootBuildUnit(mat, T, sp, ys(sp.x, sp.z), 3); L.units.push(u);
    u.drawers.forEach(d => { d.items = lootRoll(); });
    W.interact.push({ x: sp.x + sp.nx * 0.2, z: sp.z + sp.nz * 0.2, y: 0.5, r: 2.2, label: () => 'OPEN DRAWER', ok: () => G.state === 'play' && u.next < u.drawers.length, act: () => lootOpenDrawer(u) });
  }
  // ---- the chest (far from the spawn when there is room) and the key, in the drawer unit farthest from it ----
  const sx = PL.x || 0, sz = PL.z || 0;
  for (const c of shuffle(pool.slice())) {
    const sp = lootWallSpot(c, 0.95, 0.56); if (!sp || !okp(sp.x, sp.z) || L.units.some(u => Math.hypot(u.spot.x - sp.x, u.spot.z - sp.z) < 3)) continue;
    L.chest = lootBuildChest(mat, T, sp, ys(sp.x, sp.z)); const ch = L.chest;
    W.interact.push({ x: sp.x + sp.nx * 0.25, z: sp.z + sp.nz * 0.25, y: 0.45, r: 2.2, label: () => L.hasKey ? 'UNLOCK THE ' + T.chest : 'LOCKED · NEEDS THE ' + T.key, ok: () => G.state === 'play' && !ch.open, act: () => lootOpenChest(ch) });
    break;
  }
  if (L.chest && L.units.length) {
    const far = L.units.slice().sort((a, b) => Math.hypot(b.spot.x - L.chest.spot.x, b.spot.z - L.chest.spot.z) - Math.hypot(a.spot.x - L.chest.spot.x, a.spot.z - L.chest.spot.z))[0];
    const d = far.drawers[rndi(0, far.drawers.length - 1)]; d.key = true; L.keyUnit = far;
    task('lootkey', 'FIND THE KEY TO THE ' + T.chest, { opt: true, quiet: true, sub: 'CHECK THE DRAWERS' });
  }
  return L;
}
function lootOpenDrawer(u) {
  const d = u.drawers[u.next++]; if (!d) return; d.open = true; SFX.click && SFX.click(); SFX.thunk && SFX.thunk();
  const L = W.loot, T = L.T, got = Object.assign({}, d.items);
  for (const [t, n] of Object.entries(got)) giveLoot(t, n);
  if (d.key) { L.hasKey = true; task('lootchest', 'OPEN THE ' + T.chest, { opt: true, sub: 'YOU HAVE THE KEY' }); taskDone('lootkey', T.key, true); SFX.pickup(); toast(T.key + ' +1', 2.6); }
  else if (Object.keys(got).length) { SFX.pickup(); toast(lootSummary(got), 2.6); }
  else toast('EMPTY', 1.4);
  makeNoise(0.08);
}
function lootOpenChest(ch) {
  const L = W.loot, T = L.T;
  if (!L.hasKey) { SFX.click && SFX.click(); toast('LOCKED · FIND THE ' + T.key, 2.2); return; }
  ch.open = true; SFX.thunk && SFX.thunk(); SFX.pickup(); makeNoise(0.2);
  const got = {}; for (const t of lootTypes()) { const n = (LOOT_CHEST[t] || [0, 0, 0])[G.diff]; if (n) { got[t] = n; giveLoot(t, n); } }
  taskDone('lootchest', T.chest + ' OPENED', true); toast(lootSummary(got), 4);
  // what is in it, on show
  const root = tnode(ch.root, 0, 0.27, 0); let i = 0; for (const t of Object.keys(got)) { const r = tnode(root, -0.3 + (i++ % 4) * 0.2, 0, -0.12 + (i > 3 ? 0.2 : 0)); r.rotation.y = rnd(0, TAU); itemModel(t, r, W.itemMat || L.mat); }
}
function lootTick(dt) {
  const L = W.loot; if (!L) return;
  for (const u of L.units) for (const d of u.drawers) if (d.open && d.z < 0.299) { d.z = damp(d.z, 0.3, 9, dt); d.m.position.z = d.z; }
  const c = L.chest; if (c && c.open && c.a < 1.19) { c.a = damp(c.a, 1.2, 6, dt); c.hinge.rotation.x = -c.a; }
}
