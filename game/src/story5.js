// ---------- Level 5 · doors, keys, valves, the elevator, the emergency exit, pickups ----------
const DOORC5 = { room: [0.42, 0.19, 0.09], warp: [0.42, 0.19, 0.09], closet: [0.58, 0.56, 0.5], service: [0.4, 0.42, 0.4] };
function buildDoors5() {
  W9.doorAnim = new Set();
  for (const e of LV.ek.values()) {
    if (e.kind !== 'door') continue;
    const horiz = e.d === 1 || e.d === 3, [mx, mz] = edgeMid(e.x, e.y, e.d), nx = e.x + DX[e.d], ny = e.y + DY[e.d];
    const fr = e.from || [e.x, e.y], to = fr[0] === e.x && fr[1] === e.y ? [nx, ny] : [e.x, e.y];   // doors swing away from the side you meet them
    const s = horiz ? (to[1] === Math.max(e.y, ny) ? 1 : -1) : (to[0] === Math.max(e.x, nx) ? 1 : -1);
    const metal = e.dk === 'service', col = DOORC5[e.dk] || DOORC5.room;
    const hinge = tnode(null, horiz ? mx - DOORW / 2 + 0.03 : mx, 0, horiz ? mz : mz - DOORW / 2 + 0.03);
    const mesh = doorLeaf(col, metal); mesh.parent = hinge;
    const c0 = horiz ? 0 : -Math.PI / 2, c1 = c0 + (horiz ? -s : s) * 1.62;
    const bx = horiz ? [mx - DOORW / 2, mz - WT / 2, mx + DOORW / 2, mz + WT / 2] : [mx - WT / 2, mz - DOORW / 2, mx + WT / 2, mz + DOORW / 2];
    const startOpen = e.dk === 'room' ? RNG() < 0.35 : false;
    const dr = { e, key: eKey(e.x, e.y, e.d), horiz, s, hinge, mesh, c0, c1, bx, mx, mz, house: -1, dk: e.dk, metal, open: startOpen ? 1 : 0, target: startOpen ? 1 : 0,
      latched: false, locked: e.dk === 'service', solid: addSolid(bx[0], bx[1], bx[2], bx[3], 'door'), shake: 0, cull: 26, bangs: 0 };
    LV.solids[dr.solid].off = startOpen; if (!startOpen) markDyn(bx[0], bx[1], bx[2], bx[3], 1);
    hinge.rotation.y = startOpen ? c1 : c0;
    W9.doors.push(dr); W9.doorAt.set(dr.key, dr);
    if (e.dk === 'service') W5.svDoor = dr;
    W.interact.push({ x: mx, z: mz, y: 1.1, r: 1.75, door: dr, label: () => doorLabel5(dr), ok: () => true, act: () => useDoor5(dr) });
  }
}
function doorLabel5(dr) {
  const p = doorLabel5p(dr); if (p) return p;   // r6: the guest's door, the master key
  if (dr.locked) return G5.keys >= 3 ? 'UNLOCK THE STAFF DOOR' : `LOCKED · STAFF ONLY · KEYS ${G5.keys}/3`;
  return dr.target ? 'CLOSE DOOR' : 'OPEN DOOR';
}
function useDoor5(dr) {
  if (useDoor5p(dr)) return;
  if (dr.locked) {
    if (G5.keys >= 3) { unlockStaff5(dr); return; }
    SFX9.rattle(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.15);
    toast(G5.keys ? `LOCKED · ${3 - G5.keys} MORE KEY${G5.keys === 2 ? '' : 'S'} NEEDED` : 'LOCKED · THREE LOCKS, THREE KEYS', 2.2);
    if (!G5.staffTried) { G5.staffTried = true; if (G5.phase === 'arrive') setPhase5('keys'); }
    return;
  }
  useDoor(dr);
}
// snap a door to a state without animation (used when a vestibule hands you over to its twin)
function snapDoor5(dr, open) {
  const v = open ? 1 : 0; W9.doorAnim.delete(dr);
  if (dr.target !== v) { LV.navVer++; LV.solids[dr.solid].off = !!open; markDyn(dr.bx[0], dr.bx[1], dr.bx[2], dr.bx[3], open ? 0 : 1); }
  dr.target = dr.open = v; dr.hinge.rotation.y = open ? dr.c1 : dr.c0;
}

// ================= story objects =================
const WING5 = { W: 'WEST WING', N: 'NORTH WING', E: 'EAST WING' };
function buildStory5() {
  const B = W5.B;
  W.itemMat = actMat('items', { spec: 0.8, shin: 50, emis: 1, wrap: 0.3 });
  // housekeeping keys: one ring on the key board of each closet
  for (const r of LV.rooms) {
    if (r.t !== 'closet') continue;
    const c = r.cells[0], x = c % N, y = (c / N) | 0;
    let dd = 0; for (const e of LV.ek.values()) if (e.kind === 'door' && e.dk === 'closet' && e.x + DX[e.d] === x && e.y + DY[e.d] === y) dd = e.d;
    const kb = atWall5({ x, y, d: dd, c }, 0, 0); keyBoard5(B, kb);
    const sd = [(dd + 1) % 4, (dd + 3) % 4].find(q => edgeVal(x, y, q) === 1) ?? (dd + 1) % 4;
    placeF5(B, { x, y, d: sd, c }, 0.2, 'shelf', { hw: 0.7 });
    { const q = atWall5({ x, y, d: (sd + 2) % 4, c }, -0.8, 0); B.add(q, 'Cylinder', { diameterTop: 0.34, diameterBottom: 0.3, height: 0.32, tessellation: 12 }, [0.55, 0.5, 0.2], 0, [0, 0.16, 0.3]); B.add(q, 'Cylinder', { diameter: 0.025, height: 1.3, tessellation: 5 }, [0.5, 0.36, 0.2], 0, [0.05, 0.8, 0.3], [0.15, 0, 0.1]); }
    const mesh = mkMerged(W.itemMat, P => {
      P('Torus', { diameter: 0.07, thickness: 0.008, tessellation: 14 }, [0.85, 0.66, 0.26], 0.6, [0, 0, 0], [Math.PI / 2, 0, 0]);
      for (const a of [-0.35, 0.3]) { P('Box', { width: 0.012, height: 0.075, depth: 0.004 }, [0.8, 0.62, 0.24], 0.5, [Math.sin(a) * 0.05, -0.06, 0], [0, 0, a]); }
      P('Box', { width: 0.045, height: 0.06, depth: 0.004 }, [0.86, 0.3, 0.2], 0.2, [0.005, -0.1, 0.004]);
    }, 'key5');
    const p = localPt(kb, 0.12, 1.36, 0.08); mesh.position.copyFrom(p); mesh.rotation.y = kb.rotation.y;
    const k = { id: r.key, mesh, x: p.x, z: p.z, y: 1.36, taken: false, cell: c };
    W5.keys.push(k);
    W.interact.push({ x: p.x, z: p.z, y: 1.36, r: 1.8, label: () => 'TAKE THE HOUSEKEEPING KEY', ok: () => !k.taken, act: () => takeKey5(k) });
  }
  // boiler valves: a red wheel on each machine hall's wall, a gauge on the boiler
  for (const h of LV.bhalls) {
    const slots = wallSlots5(h.cells).filter(s => !s.door), bc = h.boiler;
    const s = slots.sort((a, b) => dist2(...edgeMid(b.x, b.y, b.d), bc.x, bc.z) - dist2(...edgeMid(a.x, a.y, a.d), bc.x, bc.z))[0];
    const r = atWall5(s, 0, 0); slotUse5(s, 0, 1.0);
    B.add(r, 'Box', { width: 0.5, height: 0.5, depth: 0.02 }, [0.3, 0.3, 0.28], 0, [0, 1.3, 0.01]);
    B.add(r, 'Cylinder', { diameter: 0.1, height: 0.28, tessellation: 10 }, COL5.iron, 0, [0, 1.3, 0.14], [Math.PI / 2, 0, 0]);
    B.pipe(rootPt(r, 0.35, 0.4, 0.12), rootPt(r, 0.35, CEIL, 0.12), 0.09, COL5.rust); B.pipe(rootPt(r, 0, 1.3, 0.12), rootPt(r, 0.35, 1.3, 0.12), 0.07, COL5.rust);
    plaqueOn(r, -0.42, 1.72, 'VALVE ' + (h.valve + 1), 0.22, 0.07);
    const wheel = mkMerged(W9.propMat, P => {
      P('Torus', { diameter: 0.5, thickness: 0.045, tessellation: 22 }, COL5.valve, 0, [0, 0, 0], [Math.PI / 2, 0, 0]);
      for (let i = 0; i < 3; i++) P('Box', { width: 0.48, height: 0.03, depth: 0.03 }, COL5.valve, 0, [0, 0, 0], [0, 0, i * Math.PI / 3]);
      P('Cylinder', { diameter: 0.09, height: 0.06, tessellation: 10 }, COL5.iron, 0, [0, 0, 0], [Math.PI / 2, 0, 0]);
    }, 'valve5');
    const p = localPt(r, 0, 1.3, 0.3); wheel.position.copyFrom(p); wheel.rotation.set(0, r.rotation.y, 0);
    const g = bc && h.gauge; let needle = null;
    if (g) { const pv = tnode(null, g.x, g.y, g.z); pv.rotation.y = bc.ry; needle = mkMerged(W9.propMat, P => { P('Box', { width: 0.012, height: 0.14, depth: 0.008 }, [0.7, 0.05, 0.03], 0.2, [0, 0.06, 0]); }, 'needle5'); needle.parent = pv; needle.position.z = 0.02; needle.rotation.z = -1.1; }
    const sp = localPt(r, 0.35, 2.3, 0.2);
    const v = { h, i: h.valve, mesh: wheel, x: p.x, z: p.z, y: 1.3, ang: 0, turned: false, needle, steam: { x: sp.x, y: 2.3, z: sp.z } };
    W5.valves.push(v);
    W.interact.push({ x: p.x, z: p.z, y: 1.3, r: 1.9, label: () => G5.turning && G5.turning.v === v ? 'TURNING…' : 'TURN THE VALVE', ok: () => !v.turned, act: () => startValve5(v) });
  }
  // the emergency exit at the end of the boiler room
  {
    const e = LV.ek.get(eKey(28, 32, 0)), [mx, mz] = edgeMid(28, 32, 0), bx = mx + WT / 2 + 1.3 - 0.02;
    const r = atWall5({ x: 28, y: 32, d: 0 }, 0, 0);
    const pv = tnode(null, bx, 0, mz - DOORW / 2 + 0.03); pv.rotation.y = -Math.PI / 2;
    const leaf = doorLeaf([0.34, 0.36, 0.34], true); leaf.parent = pv;
    B.add(propRoot(bx - 0.01, mz, -Math.PI / 2), 'Box', { width: DOORW - 0.1, height: 0.06, depth: 0.1 }, [0.72, 0.72, 0.7], 0, [0, 1.0, 0.1]);
    const wm = actMat('exitWhite5', { emis: 1 }); setEmi(wm, 0);
    const white = mkMerged(wm, P => { P('Box', { width: 0.05, height: DOORH, depth: DOORW }, [1, 1, 1], 1, [0, 0, 0]); }, 'exitWhite'); white.position.set(bx + 0.4, DOORH / 2, mz);
    const S = dynTexPlane('exit5', 0.9, 0.3, 256, 86, r, [0, DOORH + 0.3, 0.035], 1.8);
    for (let i = 0; i < 5; i++) B.add(propRoot(mx - 0.4 - i * 0.18, mz, 0), 'Box', { width: 0.09, height: 0.003, depth: DOORW }, [0.82, 0.68, 0.1], 0, [0, 0.003, 0]);
    W5.exit = { x: mx - 0.5, z: mz, y: 1.1, pv, leaf, white, wm, sign: S, open: 0, on: false, e, lamp: { x: mx - 0.3, y: DOORH + 0.3, z: mz } };
    drawExit5(false);
    W.interact.push({ x: mx - WT / 2 - 0.12, z: mz, y: 1.1, r: 1.9, label: () => G5.phase === 'exit' ? 'PUSH THE EMERGENCY EXIT' : 'EMERGENCY EXIT · SEALED', ok: () => G.state === 'play', act: () => useExit5() });
  }
  // elevator doors (open while you arrive, then the car leaves without you)
  {
    const [mx, mz] = edgeMid(16, 28, 1), bm = W9.propMat, leaves = [];
    for (const s of [-1, 1]) {
      const m = mkMerged(bm, P => { P('Box', { width: DOORW / 2 - 0.01, height: DOORH - 0.02, depth: 0.05 }, COL5.brass, 0, [0, DOORH / 2, 0]);
        for (const y of [0.55, 1.2, 1.8]) P('Box', { width: DOORW / 2 - 0.12, height: 0.02, depth: 0.056 }, COL5.gold, 0, [0, y, 0]);
        P('Box', { width: 0.02, height: DOORH - 0.1, depth: 0.056 }, [0.3, 0.22, 0.1], 0, [-s * (DOORW / 4 - 0.02), DOORH / 2, 0]); }, 'elev5');
      m.position.set(mx + s * DOORW / 4, 0, mz); leaves.push(m);
    }
    const sol = addSolid(mx - DOORW / 2, mz - WT / 2, mx + DOORW / 2, mz + WT / 2, 'door');
    W5.elev = { x: mx, z: mz, leaves, sol, open: 0, want: 0, gone: false, light: { x: mx, y: 2.4, z: mz + 1.6 } };
    markDyn(mx - DOORW / 2, mz - WT / 2, mx + DOORW / 2, mz + WT / 2, 1);
    const cb = W5.callBtn;
    W.interact.push({ x: cb.x, z: cb.z, y: cb.y, r: 1.6, label: () => 'CALL THE ELEVATOR', ok: () => W5.elev.gone, act: () => callElev5() });
  }
  // front desk: the bell and the housekeeping note
  { const r = W5.deskR, bp = localPt(r, 0.7, 1.16, 1.55), np = localPt(r, -0.5, 1.16, 1.55);
    B.add(propRoot(bp.x, bp.z, 0), 'Cylinder', { diameter: 0.12, height: 0.02, tessellation: 14 }, COL5.black, 0, [0, 1.13, 0]);
    B.add(propRoot(bp.x, bp.z, 0), 'Sphere', { diameter: 0.1, segments: 10, slice: 0.5 }, COL5.gold, 0.05, [0, 1.14, 0]);
    B.add(propRoot(np.x, np.z, 0.4), 'Box', { width: 0.16, height: 0.004, depth: 0.22 }, [0.95, 0.93, 0.85], 0.08, [0.2, 1.156, 0.05]);
    W5.bell = { x: bp.x, y: 1.16, z: bp.z };
    W.interact.push({ x: bp.x, z: bp.z, y: 1.16, r: 1.7, label: () => 'RING THE BELL', ok: () => true, act: () => ringBell5() });
    W.interact.push({ x: np.x, z: np.z, y: 1.16, r: 1.7, label: () => 'READ THE NOTE', ok: () => true, act: () => readNote5() });
  }
  // stair voids: you walk into the flight and the tape cuts to the landing below
  const sv = LV.svStair; addSolid(sv.x * CELL, sv.y * CELL + 1.35, (sv.x + 1) * CELL, (sv.y + 1) * CELL, 'stair');
  const ar = LV.arrive5; addSolid(ar.x * CELL, ar.y * CELL, (ar.x + 1) * CELL, ar.y * CELL + 1.7, 'stair');
  buildPlaces5();   // r6
}
function drawExit5(on) {
  const S = W5.exit.sign, c = S.ctx, w = 256, h = 86;
  c.fillStyle = on ? '#021a08' : '#1a0302'; c.fillRect(0, 0, w, h);
  c.strokeStyle = on ? '#1c8a3a' : '#8a1c14'; c.lineWidth = 6; c.strokeRect(4, 4, w - 8, h - 8);
  c.fillStyle = on ? '#6dff9a' : '#ff4a36'; c.font = 'bold 58px Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EXIT', w / 2, h / 2 + 3);
  S.dt.update(); W5.exit.on = on;
}
function buildItems5(diff) {
  const mat = W.itemMat, cells = [];
  for (const g of LV.guest) cells.push(...g.cells);
  for (const r of LV.rooms) if (r.t === 'closet' || r.t === 'boiler' || r.t === 'landing' || r.t === 'serv') cells.push(...r.cells);
  for (const c of shuffle(LV.mazeCells.slice()).slice(0, 10)) cells.push(c);
  shuffle(cells); const used = new Set();
  const place = type => {
    for (const c of cells) {
      if (used.has(c)) continue; used.add(c);
      const p = { x: cellCenter(c % N) + rnd(-1.1, 1.1), z: cellCenter((c / N) | 0) + rnd(-1.1, 1.1) }; collide(p, 0.3);
      if (cellOf(p.x) !== c % N || cellOf(p.z) !== ((c / N) | 0)) continue;
      const root = tnode(null, p.x, 0, p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, mat);
      const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
      return;
    }
  };
  for (let i = 0; i < [7, 6, 4][diff]; i++) place('battery');
  for (let i = 0; i < [12, 8, 5][diff]; i++) place('water');   // r4.4: more almond water the easier it is
}
