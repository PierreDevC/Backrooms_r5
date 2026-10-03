// ---------- r8 · Level 37: the three wings ----------
// THE LUKEWARM HOTEL (Level 233): carpet and wallpaper under pool-warm air, a lobby that plays music to nobody, rooms numbered 201 to 204, a cafeteria with a pool in it,
// a pool court where a swimmer keeps hearing someone count, and a door behind the reception desk that is not on any plan.
// WELLBORN HOSPITAL (Level 130): admissions, a long corridor of wards, laundry, pharmacy, nurses' station, records, theatre. Nobody is ever seen on shift: the Staff only show up in night shot.
// WATER WORLD (Level 43): the park gate under a painted sky, a main building, an aquarium dome of almond water, the staff halls, and the wave pool where the video tape is.
function planHotel37(room, rect, way, setFh, water, SIDE) {
  const H = R37Z.HOTEL, wp = { m: 'hwall', c: [1, 0.96, 0.88], t: [0.42, 0.26, 0.14], tp: 2 }, cr = { m: 'carpet', col: [0.78, 0.5, 0.36] };
  const L = rect(room(Z37.HOTEL, H, 'lobby', { h: 4.3, side: wp, flr: cr, cm: 'hceil', cc: [1, 0.96, 0.9] }), 30, 48, 40, 54, 0);
  way(34, 47, 1, 'arch', { w: 2.0, h: 2.7, from: [34, 47] }); way(35, 47, 1, 'arch', { w: 2.0, h: 2.7, from: [35, 47] });
  way(40, 51, 0, 'arch', { w: 2.6, h: 3.0, from: [40, 51], sign: 'CAFETERIA' }); way(35, 54, 1, 'arch', { w: 3.0, h: 3.0, from: [35, 54], sign: 'POOL' }); way(30, 51, 2, 'arch', { w: 2.2, h: 2.8, from: [30, 51], sign: 'ROOMS 201-204' });
  LV.dry.lobby = L;
  const CF = room(Z37.CAFE, H, 'cafe', { h: 4.0, side: { m: 'hwall', c: [1, 0.98, 0.9], t: [0.5, 0.36, 0.22], tp: 2 }, flr: { m: 'wood', col: [0.95, 0.85, 0.7] }, cm: 'hceil', cc: [1, 0.97, 0.9] });
  rect(CF, 41, 48, 49, 55, 0); water(CF, 43, 50, 47, 53, -1.2, BAS37.CAFE); LV.dry.cafe = CF;
  const CO = rect(room(Z37.HOTEL, H, 'rooms', { h: 3.1, side: wp, flr: cr, cm: 'hceil', cc: [1, 0.95, 0.88] }), 21, 51, 29, 51, 0);
  for (let k = 0; k < 4; k++) {
    const x = 21 + k * 2, num = 201 + k, rm = rect(room(Z37.HOTEL, H, 'hroom' + num, { h: 3.1, side: wp, flr: { m: 'carpet', col: [0.5 + 0.06 * k, 0.4, 0.46] }, cm: 'hceil', cc: [1, 0.95, 0.88], num }), x, 49, x + 1, 50, 0);
    way(x, 51, 3, 'door', { dk: 'hotel', plaque: String(num), from: [x, 51], locked: num === 204, hroom: num }); LV.dry['r' + num] = rm;
  }
  LV.dry.corr37 = CO;
  const V = rect(room(Z37.HOTEL, H, 'vault', { h: 3.0, side: { m: 'hwall', c: [0.6, 0.62, 0.7], t: [0.2, 0.2, 0.24], tp: 2 }, flr: { m: 'carpet', col: [0.35, 0.36, 0.45] }, cm: 'hceil', cc: [0.7, 0.7, 0.75] }), 28, 52, 29, 54, 0);
  way(30, 53, 2, 'door', { dk: 'vault', plaque: '233', from: [30, 53], locked: true }); LV.dry.vault = V;
  const C = room(Z37.POOL, H, 'court', { h: 5.6, side: { m: 'ptw', c: [1, 0.97, 0.9], t: [0.7, 0.55, 0.3], tp: 2 }, flr: { m: 'ptile', col: [1, 0.96, 0.88] }, cm: 'kceil', cc: [1, 0.98, 0.94] });
  rect(C, 28, 55, 48, 66, DECK37); water(C, 30, 57, 46, 64, -1.8, BAS37.HPOOL); LV.dry.court = C;
}
function planHospital37(room, rect, way, setFh, water, SIDE) {
  const H = R37Z.HOSP, wl = { m: 'block', c: [0.82, 0.92, 0.86], t: [0.6, 0.72, 0.66], tp: 2 }, fl = { m: 'lino', col: [0.88, 0.94, 0.9] };
  const ST = room(Z37.HOSP, H, 'hstair', { rel: true, h: 3.2, side: { m: 'wetc', c: [0.7, 0.8, 0.78], t: [0.4, 0.45, 0.45], tp: 1 }, flr: { m: 'wetc', col: [0.7, 0.8, 0.8] }, cm: 'kceil', cc: [0.9, 0.95, 0.93] });
  rect(ST, 24, 13, 24, 13, -4.4); rect(ST, 24, 12, 24, 12, -2.2);
  LV.bas[cIdx(24, 13)] = BAS37.WELL; LV.ch[cIdx(24, 13)] = 2.0; LV.ch[cIdx(24, 12)] = 3.6; LV.dark[cIdx(24, 13)] = 1;
  way(24, 14, 1, 'arch', { w: 1.8, h: 2.3, from: [24, 14], tunnel: true });
  const A = rect(room(Z37.HOSP, H, 'admissions', { h: 3.4, side: wl, flr: fl, cm: 'kceil', cc: [0.96, 1, 0.98] }), 20, 7, 28, 11, 0);
  way(24, 12, 3, 'arch', { w: 2.0, h: 2.7, from: [24, 12] }); LV.dry.adm = A;
  const CO = rect(room(Z37.HOSP, H, 'hcorr', { h: 3.2, side: wl, flr: fl, cm: 'kceil', cc: [0.96, 1, 0.98] }), 12, 6, 38, 6, 0);
  way(24, 7, 3, 'arch', { w: 2.2, h: 2.7, from: [24, 7] }); LV.dry.hcorr = CO;
  [[11, 13], [14, 16], [17, 19], [29, 31], [32, 34], [35, 37]].forEach(([a, b], i) => { const w = rect(room(Z37.HOSP, H, 'ward' + (i + 1), { h: 3.0, side: wl, flr: fl, cm: 'kceil', cc: [0.96, 1, 0.98], num: i + 1 }), a, 3, b, 5, 0); way(a + 1, 6, 3, 'door', { dk: 'hosp', plaque: 'WARD ' + (i + 1), from: [a + 1, 6] }); LV.dry['ward' + (i + 1)] = w; });
  const mk = (id, x0, x1, door, plaque, locked) => { const r = rect(room(Z37.HOSP, H, id, { h: 3.0, side: wl, flr: fl, cm: 'kceil', cc: [0.96, 1, 0.98] }), x0, 7, x1, 10, 0); way(door, 7, 3, 'door', { dk: 'hosp', plaque, from: [door, 7], locked }); LV.dry[id] = r; return r; };
  mk('laundry', 11, 15, 13, 'LAUNDRY'); mk('pharmacy', 16, 19, 17, 'PHARMACY', true); mk('nurses', 29, 32, 30, 'NURSES'); mk('records', 33, 37, 35, 'RECORDS');
  const OT = rect(room(Z37.HOSP, H, 'theatre', { h: 3.4, side: { m: 'block', c: [0.7, 0.88, 0.84], t: [0.5, 0.62, 0.58], tp: 2 }, flr: { m: 'lino', col: [0.7, 0.85, 0.82] }, cm: 'kceil', cc: [0.9, 1, 0.98] }), 39, 3, 40, 10, 0);
  way(38, 6, 0, 'door', { dk: 'hosp', plaque: 'THEATRE', from: [38, 6] }); LV.dry.theatre = OT;
}
function planWorld37(room, rect, way, setFh, water, SIDE) {
  const W = R37Z.WW;
  const PZ = rect(room(Z37.PARK, W, 'plaza', { h: 9.0, side: { m: 'block', c: [0.7, 0.86, 0.96], t: [0.9, 0.9, 0.9], tp: 2 }, flr: { m: 'conc', col: [0.95, 0.95, 0.9] }, cm: 'kceil', cc: [0.6, 0.8, 0.98] }), 56, 41, 70, 48, 0);
  way(69, 40, 1, 'arch', { w: 1.8, h: 2.3, from: [69, 40], tunnel: true }); LV.dry.plaza = PZ;
  const FY = rect(room(Z37.PARK, W, 'foyer', { h: 5.0, side: { m: 'ptw', c: [0.85, 0.97, 1], t: [0.2, 0.5, 0.7], tp: 2 }, flr: { m: 'ptile', col: [0.8, 0.9, 0.95] }, cm: 'kceil', cc: [1, 1, 1] }), 56, 49, 70, 52, 0);
  way(62, 48, 1, 'arch', { w: 3.2, h: 3.4, from: [62, 48], sign: 'WATER WORLD' }); way(63, 48, 1, 'arch', { w: 3.2, h: 3.4, from: [63, 48] }); LV.dry.foyer = FY;
  const DM = rect(room(Z37.DOME, W, 'dome', { h: 6.0, side: { m: 'block', c: [0.3, 0.55, 0.7], t: [0.2, 0.3, 0.4], tp: 2 }, flr: { m: 'ptile', col: [0.5, 0.7, 0.8] }, cm: 'kceil', cc: [0.3, 0.5, 0.6] }), 56, 53, 70, 60, 0);
  way(62, 52, 1, 'arch', { w: 3.2, h: 3.4, from: [62, 52], sign: 'AQUARIUM' }); way(63, 52, 1, 'arch', { w: 3.2, h: 3.4, from: [63, 52] }); LV.dry.dome = DM;
  const sd = { m: 'brick', c: [1, 0.78, 0.6], t: [0.3, 0.2, 0.12], tp: 2 }, sf = { m: 'wetc', col: [0.8, 0.7, 0.6] };
  const SC = rect(room(Z37.STAFF, W, 'scorr', { h: 3.0, side: sd, flr: sf, cm: 'bconc', cc: [0.55, 0.45, 0.38] }), 56, 61, 70, 61, 0);
  way(60, 60, 1, 'door', { dk: 'staff', plaque: 'STAFF ONLY', from: [60, 60] });
  const rr = (id, x0, x1, door, plaque, locked) => { const r = rect(room(Z37.STAFF, W, id, { h: 3.2, side: sd, flr: sf, cm: 'bconc', cc: [0.55, 0.45, 0.38] }), x0, 62, x1, 65, 0); way(door, 62, 3, 'door', { dk: 'staff', plaque, from: [door, 62], locked }); LV.dry[id] = r; return r; };
  rr('gen', 56, 59, 57, 'GENERATOR'); rr('control', 61, 64, 62, 'CONTROL', true); rr('brk', 66, 69, 67, 'STAFF ROOM');
  LV.dry.scorr = SC; for (const c of SC.cells) LV.dark[c] = 1;
  const FIN = room(Z37.WWF, W, 'wavepool', { h: 5.4, side: { m: 'ptw', c: [0.7, 0.92, 1], t: [0.2, 0.45, 0.6], tp: 2 }, flr: { m: 'ptile', col: [0.7, 0.9, 1] }, cm: 'kceil', cc: [0.5, 0.75, 0.85] });
  rect(FIN, 52, 66, 70, 70, DECK37); water(FIN, 53, 67, 69, 69, -3.0, BAS37.WWF);
  way(67, 65, 1, 'door', { dk: 'staff', plaque: 'POOL ACCESS', from: [67, 65] }); LV.dry.fin = FIN;
  LV.ghosts = [[58, 67, 0], [58, 68, 0], [58, 69, 0], [64, 67, 0], [64, 68, 0], [64, 69, 0]];   // glass-and-tile panels you can swim straight through
}
function lightHotel37(F, grid) { for (const k of ['lobby', 'cafe', 'court']) grid(LV.dry[k], 3, { I: 0.52, rad: 12, sc: 4, ox: 1, oy: 1, w: 0.9, l: 0.9 }); for (const k of ['corr37', 'r201', 'r202', 'r203', 'r204', 'vault']) grid(LV.dry[k], 2, { I: 0.4, rad: 6, sc: 2, w: 0.6, l: 0.6 }); }
function lightHospital37(F, grid) { for (const k of ['adm', 'hcorr', 'laundry', 'pharmacy', 'nurses', 'records', 'theatre']) grid(LV.dry[k], 2, { I: 0.5, rad: 8, sc: 3, w: 0.6, l: 1.2, flick: k === 'hcorr' ? 0.1 : 0 }); for (let i = 1; i <= 6; i++) grid(LV.dry['ward' + i], 2, { I: 0.38, rad: 5, sc: 2, w: 0.5, l: 1.0 }); }
function lightWorld37(F, grid) {
  grid(LV.dry.plaza, 3, { I: 0.7, rad: 14, sc: 5, ox: 1, w: 1.2, l: 1.2 }); grid(LV.dry.foyer, 3, { I: 0.55, rad: 11, sc: 4, ox: 1, w: 1.0, l: 1.0 }); grid(LV.dry.dome, 3, { I: 0.4, rad: 10, sc: 4, w: 0.8, l: 0.8, flick: 0.2 });
  for (const c of LV.dry.scorr.cells) if ((c % N) % 3 === 0) F(cellCenter(c % N), cellCenter((c / N) | 0), { I: 0.3, rad: 6, sc: 2, state: RNG() < 0.3 ? 2 : 1 });
  for (const k of ['gen', 'control', 'brk']) grid(LV.dry[k], 2, { I: 0.3, rad: 6, sc: 2, w: 0.5, l: 0.5, flick: 0.25 }); grid(LV.dry.fin, 3, { I: 0.5, rad: 11, sc: 4, w: 1.0, l: 2.0, flick: 0.15 });
}

// ================= furnishings =================
function furnishHotel37(B) {
  { const r = wallAt37(30, 49, 2, 1.8); B.add(r, 'Box', { width: 4.4, height: 1.08, depth: 0.7 }, [0.34, 0.2, 0.1], 0, [0, 0.54, 1.6]); B.add(r, 'Box', { width: 4.5, height: 0.06, depth: 0.8 }, [0.8, 0.78, 0.72], 0, [0, 1.1, 1.6]);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) B.add(r, 'Box', { width: 0.26, height: 0.24, depth: 0.2 }, [0.44, 0.28, 0.14], 0, [-1.6 + i * 0.64, 1.3 + j * 0.28, 0.12]);
    solidLocal(r, -2.2, 1.2, 2.2, 2.0); sign37('RECEPTION', twin37(r), [0, 2.6, 0.03], 1.4, 0.3, { bg: '#241608', fg: '#e8c868', line: '#b08a3a', emis: 0.3 });
    W37.pos.desk = localPt(r, 0, 1.1, 0.9); W37.pos.guestbook = localPt(r, -0.8, 1.14, 1.0); W37.pos.drawer = localPt(r, 1.2, 0.8, 0.9); W37.pos.bell = localPt(r, 0.5, 1.14, 1.0); }
  { const r = wallAt37(31, 54, 1, 0, 0);   // the escalator: eight steps into the ceiling, OUT OF SERVICE
    for (let i = 0; i < 8; i++) B.add(r, 'Box', { width: 1.0, height: 0.18, depth: 0.4 }, [0.62, 0.62, 0.64], 0, [0, 0.3 + i * 0.28, 1.0 + i * 0.4]);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.12, height: 1.0, depth: 4.0 }, [0.2, 0.2, 0.22], 0, [s * 0.58, 1.4, 2.3], [-0.62, 0, 0]);
    solidLocal(r, -0.7, 0, 0.7, 4.3); sign37('OUT OF SERVICE\nUSE STAIRS', twin37(r), [0, 1.6, 0.4], 1.2, 0.5, { bg: '#f4e8d0', fg: '#8a1a14', line: '#8a1a14' }); }
  for (const [x, y, d] of [[32, 48, 3], [38, 48, 3], [38, 54, 1]]) { const r = wallAt37(x, y, d, 0); F37.palm(B, r); solidLocal(r, -0.35, 0, 0.35, 0.6); }
  for (const [x, y, ry] of [[36.2, 52, 2.6], [37.6, 50.4, 3.6], [33.4, 51.2, -1.2]]) { const r = pr37(x * CELL, y * CELL, ry, 0); B.add(r, 'Box', { width: 0.8, height: 0.28, depth: 0.8 }, [0.42, 0.1, 0.08], 0, [0, 0.3, 0.4]); B.add(r, 'Box', { width: 0.8, height: 0.6, depth: 0.14 }, [0.4, 0.09, 0.07], 0, [0, 0.66, 0.06], [-0.1, 0, 0]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.12, height: 0.3, depth: 0.8 }, [0.38, 0.08, 0.06], 0, [s * 0.46, 0.5, 0.4]); addSolid(r.position.x - 0.6, r.position.z - 0.6, r.position.x + 0.6, r.position.z + 0.6, 'prop'); }
  { const r = pr37(35.0 * CELL, 51 * CELL, 0, 0); B.add(r, 'Cylinder', { diameter: 1.4, height: 0.05, tessellation: 20 }, [0.7, 0.68, 0.6], 0, [0, 0.45, 0]); B.add(r, 'Cylinder', { diameter: 0.1, height: 0.45, tessellation: 8 }, COL37.brass, 0, [0, 0.22, 0]); addSolid(r.position.x - 0.7, r.position.z - 0.7, r.position.x + 0.7, r.position.z + 0.7, 'prop'); }
  W37.pos.speaker = { x: 35 * CELL, z: 51 * CELL };
  sign37('THE LUKEWARM HOTEL', twin37(wallAt37(36, 54, 1, 0)), [0, 2.6, 0.03], 3.6, 0.55, { bg: '#241608', fg: '#e8c868', line: '#b08a3a', emis: 0.35 });
  // the cafeteria
  for (const [x, y] of [[42, 49], [48, 49], [42, 54], [48, 54], [45, 49], [45, 54]]) { const r = pr37(cc37(x) + (x === 42 ? -0.4 : x === 48 ? 0.4 : 0), cc37(y) + (y === 49 ? -0.3 : 0.3), 0, 0); B.add(r, 'Box', { width: 1.6, height: 0.05, depth: 0.8 }, COL37.wood2, 0, [0, 0.74, 0]); for (const sx of [-0.7, 0.7]) for (const sz of [-0.3, 0.3]) B.add(r, 'Box', { width: 0.05, height: 0.72, depth: 0.05 }, COL37.wood, 0, [sx, 0.36, sz]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 1.6, height: 0.05, depth: 0.34 }, COL37.wood2, 0, [0, 0.44, s * 0.62]); addSolid(r.position.x - 0.9, r.position.z - 0.9, r.position.x + 0.9, r.position.z + 0.9, 'prop'); }
  for (let i = 0; i < 8; i++) { const r = wallAt37(41 + i, 48, 3, 0), k = twin37(r), cols = ['#e2483c', '#f08a24', '#e0b000', '#3aa04a', '#2f7fd0', '#8a5cc8'], S = dynTexPlane('cafedraw', 0.55, 0.42, 128, 98, k, [rnd(-0.6, 0.6), 1.7 + rnd(-0.2, 0.2), 0.02], 0.35), c = S.ctx;
    c.fillStyle = '#fbf6e8'; c.fillRect(0, 0, 128, 98); c.strokeStyle = cols[i % 6]; c.lineWidth = 5; c.beginPath(); c.moveTo(20, 80); c.lineTo(40, 30); c.lineTo(60, 80); c.stroke(); c.strokeStyle = cols[(i + 2) % 6]; c.beginPath(); c.arc(90, 36, 16, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(10, 84); c.lineTo(118, 84); c.stroke(); S.dt.update(); }
  { const r = wallAt37(49, 52, 0, 0); F37.vending(B, r, [0.2, 0.5, 0.7]); solidLocal(r, -0.5, 0, 0.5, 0.85); W37.pos.cafeVend = localPt(r, 0, 1, 1.0); }
  sign37('CAFETERIA\nPLEASE WALK, DON\'T RUN', twin37(wallAt37(41, 49, 2, 0)), [0, 2.4, 0.03], 2.2, 0.6, { bg: '#f4ecd8', fg: '#5a3a1a', line: '#8a6a3a' });
  for (const [x, z] of [[cc37(44), cc37(51)], [cc37(46), cc37(52)]]) { const n = tnode(null, x, 0, z), m = mkMerged(W37.propMat, P => { P('Cylinder', { diameter: 0.5, height: 0.04, tessellation: 12 }, COL37.white, 0, [0, 0.02, 0]); }, 'tray37'); m.parent = n; floater37(n, BAS37.CAFE, 0.0); }
  W37.pos.cafePool = { x: cc37(45), z: cc37(51.5) };
  // the pool court
  for (const x of [29, 31, 33, 38, 40, 42]) { const r = pr37(cc37(x), 56 * CELL + 1.2, Math.PI, DECK37); F37.lounger(B, r, pick([COL37.cream, COL37.white, COL37.teal])); addSolid(r.position.x - 0.4, r.position.z - 0.4, r.position.x + 0.4, r.position.z + 1.1, 'prop'); }
  for (let i = 0; i < 4; i++) { const r = pr37(cc37(31 + i * 4), 66 * CELL + 0.6, 0, DECK37); F37.lounger(B, r, pick([COL37.cream, COL37.white])); addSolid(r.position.x - 0.4, r.position.z - 0.2, r.position.x + 0.4, r.position.z + 1.3, 'prop'); }
  for (const [x, y, d] of [[28, 59, 2], [28, 62, 2], [48, 60, 0]]) { const r = wallAt37(x, y, d, 0); F37.palm(B, r); solidLocal(r, -0.35, 0, 0.35, 0.6); }
  sign37('INDOOR POOL\nWATER TEMPERATURE 27°', twin37(wallAt37(38, 55, 3, 0)), [0, 3.0, 0.03], 2.8, 0.7, { bg: '#f4ecd8', fg: '#17607a', line: '#8a6a3a' });
  { const r = pr37(46 * CELL + 0.8, cc37(60), -Math.PI / 2, DECK37); B.add(r, 'Box', { width: 0.7, height: 0.7, depth: 0.7 }, [0.9, 0.95, 0.96], 0, [0, 0.35, 0]); B.add(r, 'Box', { width: 0.7, height: 0.05, depth: 0.7 }, COL37.teal, 0, [0, 0.72, 0], [0.12, 0, 0]); addSolid(r.position.x - 0.4, r.position.z - 0.4, r.position.x + 0.4, r.position.z + 0.4, 'prop'); }
  W37.pos.swimmer = { x: 47 * CELL + 0.1, z: cc37(61), laneX0: 31 * CELL, laneX1: 46 * CELL - 0.4, laneZ: cc37(60) };
  // the guest rooms
  for (let k = 0; k < 4; k++) {
    const x = 21 + k * 2;
    { const r = wallAt37(x, 49, 3, 1.8); FURN5.bed(B, r, { col: pick([[0.5, 0.12, 0.12], [0.18, 0.3, 0.3], [0.5, 0.42, 0.3]]) }); solidLocal(r, -0.8, 0, 0.8, 2.2); }
    { const q = wallAt37(x, 49, 3, 0.2); B.add(q, 'Box', { width: 0.46, height: 0.56, depth: 0.4 }, COL37.wood2, 0, [0, 0.28, 0.21]); solidLocal(q, -0.25, 0, 0.25, 0.45); if (k === 3) W37.pos.nightstand = localPt(q, 0, 0.6, 0.6); }
    { const r = wallAt37(x + 1, 50, 0, 0); FURN5.painting(B, r, { w: 0.9, h: 0.7, y: 1.7, seed: 0.1 + k * 0.2 }); }
    sign37(String(201 + k), twin37(wallAt37(x, 51, 1, 0)), [0.9, 1.5, 0.03], 0.14, 0.09, { bg: '#241608', fg: '#e8c868', line: '#b08a3a', emis: 0.3 });
  }
  { const r = wallAt37(28, 52, 3, 0.4); B.add(r, 'Box', { width: 0.8, height: 0.05, depth: 0.5 }, [0.15, 0.15, 0.2], 0, [0, 0.8, 0.5]); B.add(r, 'Box', { width: 0.1, height: 0.8, depth: 0.1 }, [0.15, 0.15, 0.2], 0, [0, 0.4, 0.5]); solidLocal(r, -0.45, 0.1, 0.45, 0.9); W37.pos.vaultTable = localPt(r, 0, 0.85, 0.5); }
  sign37('233', twin37(wallAt37(29, 53, 2, 0)), [0, 1.9, 0.03], 0.3, 0.2, { bg: '#241608', fg: '#e8c868', line: '#b08a3a', emis: 0.4 });
}
function furnishHospital37(B) {
  const WB = [0.92, 0.95, 0.93];
  for (const [x, y] of [[21, 8], [21, 10], [27, 8], [27, 10]]) { const r = wallAt37(x, y, x < 24 ? 2 : 0, 0); for (let i = 0; i < 3; i++) { B.add(r, 'Box', { width: 0.5, height: 0.06, depth: 0.5 }, [0.2, 0.4, 0.5], 0, [-0.55 + i * 0.55, 0.46, 0.5]); B.add(r, 'Box', { width: 0.5, height: 0.4, depth: 0.05 }, [0.2, 0.4, 0.5], 0, [-0.55 + i * 0.55, 0.72, 0.28]); } B.add(r, 'Box', { width: 1.7, height: 0.06, depth: 0.1 }, COL37.steel, 0, [0, 0.4, 0.3]); solidLocal(r, -0.9, 0.15, 0.9, 0.8); }
  { const r = wallAt37(23, 7, 3, 0); B.add(r, 'Box', { width: 3.8, height: 1.0, depth: 0.6 }, [0.8, 0.84, 0.84], 0, [0, 0.5, 0.4]); B.add(r, 'Box', { width: 3.8, height: 1.0, depth: 0.04 }, [0.7, 0.85, 0.85], 0.04, [0, 1.6, 0.6]); B.add(r, 'Box', { width: 3.9, height: 0.05, depth: 0.7 }, COL37.steel, 0, [0, 1.02, 0.4]); solidLocal(r, -1.9, 0, 1.9, 0.75);
    sign37('ADMISSIONS\nDISCHARGE', twin37(r), [0, 2.5, 0.05], 2.2, 0.7, { bg: '#e6f2ee', fg: '#2a5a4a', line: '#2a5a4a' }); W37.pos.admDesk = localPt(r, 0, 1.05, 1.1); W37.pos.formSpot = localPt(r, 1.2, 1.06, 0.4); }
  { const r = wallAt37(27, 9, 0, 0); B.add(r, 'Box', { width: 0.4, height: 1.2, depth: 0.3 }, [0.8, 0.84, 0.84], 0, [0, 0.9, 0.15]); B.add(r, 'Box', { width: 0.26, height: 0.12, depth: 0.02 }, [0.05, 0.3, 0.1], 0.9, [0, 1.25, 0.31]); solidLocal(r, -0.25, 0, 0.25, 0.4); W37.pos.ticket = localPt(r, 0, 1.0, 0.7); }
  { const r = wallAt37(24, 11, 1, 0, 0.05), k = twin37(r), S = dynTexPlane('hclock', 0.5, 0.5, 128, 128, k, [0, 2.6, 0.02], 0.5), c = S.ctx; c.fillStyle = '#f4f4ee'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#222'; c.lineWidth = 6; c.beginPath(); c.arc(64, 64, 58, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 24); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(64, 64); c.lineTo(94, 80); c.stroke(); S.dt.update(); }
  for (let x = 13; x <= 37; x += 4) { const r = wallAt37(x, 6, 1, 0); B.add(r, 'Box', { width: 3.4, height: 0.06, depth: 0.08 }, [0.7, 0.78, 0.74], 0, [0, 0.9, 0.06]); }
  for (const x of [15, 22, 31, 36]) { const r = pr37(cc37(x), 6 * CELL + 0.7, 0.05 * x, 0); B.add(r, 'Box', { width: 0.8, height: 0.12, depth: 1.9 }, [0.88, 0.9, 0.9], 0, [0, 0.8, 0]); B.add(r, 'Box', { width: 0.7, height: 0.1, depth: 0.5 }, [0.95, 0.95, 0.92], 0, [0, 0.92, -0.65]); for (const sx of [-0.36, 0.36]) for (const sz of [-0.8, 0.8]) B.add(r, 'Cylinder', { diameter: 0.14, height: 0.06, tessellation: 8 }, COL37.black, 0, [sx, 0.06, sz]); B.add(r, 'Box', { width: 0.04, height: 0.6, depth: 1.5 }, COL37.steel, 0, [0, 0.4, 0]); addSolid(r.position.x - 0.5, r.position.z - 1.1, r.position.x + 0.5, r.position.z + 1.1, 'prop'); }
  sign37('QUIET PLEASE\nPATIENTS RESTING', twin37(wallAt37(24, 6, 3, 0)), [0, 2.4, 0.03], 2.2, 0.6, { bg: '#e6f2ee', fg: '#2a5a4a', line: '#2a5a4a' });
  for (let i = 1; i <= 6; i++) { const w = LV.dry['ward' + i], cx = w.cells[4] % N, cy = (w.cells[4] / N) | 0;
    { const r = pr37(cc37(cx), cc37(cy) - 0.4, 0, 0); B.add(r, 'Box', { width: 1.0, height: 0.12, depth: 2.0 }, [0.85, 0.88, 0.88], 0, [0, 0.62, 0]); B.add(r, 'Box', { width: 0.95, height: 0.14, depth: 1.6 }, [0.92, 0.92, 0.9], 0, [0, 0.76, 0.2]); B.add(r, 'Box', { width: 0.7, height: 0.1, depth: 0.4 }, [0.97, 0.97, 0.94], 0, [0, 0.86, -0.65]); B.add(r, 'Box', { width: 1.0, height: 0.7, depth: 0.06 }, COL37.steel, 0, [0, 0.9, -1.05]); for (const sx of [-0.5, 0.5]) for (const sz of [-0.9, 0.9]) B.add(r, 'Cylinder', { diameter: 0.1, height: 0.3, tessellation: 8 }, COL37.black, 0, [sx, 0.15, sz]);
      addSolid(r.position.x - 0.6, r.position.z - 1.1, r.position.x + 0.6, r.position.z + 1.1, 'prop'); w.bedPos = { x: r.position.x, z: r.position.z }; }
    { const q = pr37(cc37(cx) + 1.4, cc37(cy) + 0.6, 0, 0); B.add(q, 'Cylinder', { diameter: 0.04, height: 1.9, tessellation: 6 }, COL37.chrome, 0, [0, 0.95, 0]); B.add(q, 'Cylinder', { diameter: 0.5, height: 0.04, tessellation: 12 }, COL37.chrome, 0, [0, 0.03, 0]); B.add(q, 'Box', { width: 0.12, height: 0.2, depth: 0.04 }, [0.8, 0.92, 0.96], 0.1, [0.1, 1.7, 0]); addSolid(q.position.x - 0.28, q.position.z - 0.28, q.position.x + 0.28, q.position.z + 0.28, 'prop'); w.dripPos = { x: q.position.x, z: q.position.z }; }
    sign37('WARD ' + i, twin37(wallAt37(cx, 5, 1, 0)), [0, 2.4, 0.03], 0.8, 0.26, { bg: '#e6f2ee', fg: '#2a5a4a', line: '#2a5a4a' }); }
  { const r = wallAt37(11, 7, 3, 0); for (let j = 0; j < 4; j++) { B.add(r, 'Box', { width: 2.0, height: 0.04, depth: 0.5 }, COL37.steel, 0, [0.4, 0.3 + j * 0.5, 0.3]); for (let i = 0; i < 5; i++) B.add(r, 'Box', { width: 0.34, height: 0.16, depth: 0.4 }, [0.94, 0.95, 0.92], 0, [-0.4 + i * 0.4, 0.4 + j * 0.5, 0.3]); } solidLocal(r, -0.7, 0, 1.5, 0.6); W37.pos.linen = localPt(r, 0.4, 1.4, 0.9); }
  { const r = wallAt37(17, 10, 1, 0.6); for (let j = 0; j < 4; j++) B.add(r, 'Box', { width: 3.0, height: 0.04, depth: 0.4 }, COL37.steel, 0, [0, 0.4 + j * 0.45, 0.25]); for (let j = 0; j < 4; j++) for (let i = 0; i < 12; i++) B.add(r, 'Box', { width: 0.18, height: 0.16, depth: 0.3 }, WB.map(v => v * rnd(0.9, 1)), 0, [-1.3 + i * 0.24, 0.5 + j * 0.45, 0.25]); solidLocal(r, -1.6, 0, 1.6, 0.5); W37.pos.drip = localPt(r, 0.2, 1.4, 0.8); }
  { const r = wallAt37(31, 7, 3, 0); B.add(r, 'Box', { width: 2.2, height: 0.05, depth: 0.8 }, [0.7, 0.75, 0.74], 0, [0, 0.8, 0.45]); for (const x of [-1.0, 1.0]) B.add(r, 'Box', { width: 0.06, height: 0.78, depth: 0.7 }, COL37.steel, 0, [x, 0.39, 0.45]); solidLocal(r, -1.2, 0, 1.2, 0.9);
    B.add(r, 'Box', { width: 1.6, height: 1.0, depth: 0.03 }, [0.95, 0.95, 0.95], 0, [0, 1.8, 0.02]); W37.pos.nursesDesk = localPt(r, 0, 0.9, 0.9); W37.pos.formDesk = localPt(r, 0.7, 0.84, 0.7); W37.pos.whiteboard = localPt(r, 0, 1.6, 0.6); }
  { const r = wallAt37(34, 10, 1, 0); for (let i = 0; i < 3; i++) { B.add(r, 'Box', { width: 1.2, height: 2.0, depth: 0.5 }, [0.55, 0.58, 0.58], 0, [-1.3 + i * 1.3, 1.0, 0.25]); for (let j = 0; j < 8; j++) B.add(r, 'Box', { width: 1.1, height: 0.04, depth: 0.46 }, [0.4, 0.42, 0.42], 0, [-1.3 + i * 1.3, 0.25 + j * 0.25, 0.25]); } solidLocal(r, -1.9, 0, 1.9, 0.5);
    const r2 = wallAt37(36, 7, 3, 0.4); B.add(r2, 'Box', { width: 1.2, height: 0.05, depth: 0.7 }, [0.7, 0.75, 0.74], 0, [0, 0.8, 0.4]); solidLocal(r2, -0.7, 0, 0.7, 0.8); W37.pos.recordsDesk = localPt(r2, 0, 0.85, 0.8); W37.pos.rosterSpot = localPt(r2, 0, 0.86, 0.8); }
  { const q = pr37(cc37(40) - 0.0, cc37(6), 0, 0); B.add(q, 'Box', { width: 0.8, height: 0.1, depth: 2.0 }, [0.8, 0.84, 0.84], 0, [0, 0.9, 0]); B.add(q, 'Cylinder', { diameter: 0.14, height: 0.9, tessellation: 8 }, COL37.steel, 0, [0, 0.45, 0]); B.add(q, 'Cylinder', { diameter: 1.4, height: 0.06, tessellation: 18 }, [0.9, 0.92, 0.9], 0.3, [0, 3.0, 0]); addSolid(q.position.x - 0.5, q.position.z - 1.1, q.position.x + 0.5, q.position.z + 1.1, 'prop'); }
  W37.pos.staff = [];
  const add = (key, x, z, ry, task) => W37.pos.staff.push({ key, x, z, ry, task });
  add('admit', cc37(25), 7 * CELL + 1.3, Math.PI, 'desk'); add('laundry', cc37(12) + 1.0, cc37(8), 0.4, 'shelf'); add('pharm', cc37(17), cc37(8), -0.3, 'shelf'); add('nurse1', cc37(30) + 0.3, cc37(8), 1.2, 'desk'); add('records', cc37(34), cc37(9), 2.4, 'file');
  add('ward1', LV.dry.ward1.bedPos.x + 0.9, LV.dry.ward1.bedPos.z, -1.57, 'bed'); add('ward3', LV.dry.ward3.bedPos.x - 0.9, LV.dry.ward3.bedPos.z + 0.2, 1.57, 'bed'); add('ward5', LV.dry.ward5.bedPos.x - 0.9, LV.dry.ward5.bedPos.z, 1.57, 'bed'); add('hall1', cc37(19), 6 * CELL + 1.8, 0.2, 'walk'); add('hall2', cc37(33), 6 * CELL + 1.8, 3.1, 'walk'); add('theatre', cc37(40) - 0.9, cc37(6), -1.57, 'bed');
}
function furnishWorld37(B) {
  const COLW = { blue: [0.2, 0.55, 0.85], yel: [0.98, 0.82, 0.2], pink: [0.95, 0.5, 0.65] };
  for (const [x, y] of [[58, 44], [61, 44], [67, 44]]) F37.bench(B, pr37(cc37(x), cc37(y), Math.PI / 2 * (x > 62 ? 1 : -1), 0), { len: 1.6 });
  for (const [x, y] of [[59, 47], [66, 47]]) { const r = pr37(cc37(x), cc37(y), 0, 0); B.add(r, 'Cylinder', { diameter: 0.6, height: 0.9, tessellation: 12 }, COLW.blue, 0, [0, 0.45, 0]); B.add(r, 'Cylinder', { diameter: 0.64, height: 0.06, tessellation: 12 }, COL37.white, 0, [0, 0.92, 0]); addSolid(r.position.x - 0.35, r.position.z - 0.35, r.position.x + 0.35, r.position.z + 0.35, 'prop'); }
  { const r = pr37(cc37(63), cc37(45), 0, 0); B.add(r, 'Cylinder', { diameter: 3.2, height: 0.5, tessellation: 24 }, [0.85, 0.9, 0.9], 0, [0, 0.25, 0]); B.add(r, 'Cylinder', { diameter: 2.8, height: 0.04, tessellation: 24 }, [0.12, 0.45, 0.55], 0.1, [0, 0.49, 0]); B.add(r, 'Cylinder', { diameter: 0.3, height: 1.3, tessellation: 10 }, [0.85, 0.9, 0.9], 0, [0, 1.1, 0]); B.add(r, 'Sphere', { diameter: 0.7, segments: 10 }, COLW.yel, 0, [0, 1.9, 0]); addSolid(r.position.x - 1.7, r.position.z - 1.7, r.position.x + 1.7, r.position.z + 1.7, 'prop'); W37.pos.fountain = { x: r.position.x, z: r.position.z }; }
  { const r = wallAt37(60, 41, 1, 0); B.add(r, 'Box', { width: 2.2, height: 1.4, depth: 0.08 }, [0.95, 0.95, 0.9], 0, [0, 1.6, 0.04]); sign37('PARK MAP\nYOU ARE HERE', twin37(r), [0, 1.6, 0.1], 2.0, 1.2, { bg: '#f6f2e0', fg: '#1a6a8a', line: '#1a6a8a', emis: 0.4 }); W37.pos.map = localPt(r, 0, 1.4, 1.0); }
  sign37('WATER WORLD\nTHE FUN IS ALWAYS OPEN', twin37(wallAt37(62, 48, 3, 0)), [0, 4.6, 0.03], 4.0, 0.9, { bg: '#2a7ac0', fg: '#ffe040', line: '#ffe040', emis: 0.7 });
  sign37('NO RUNNING · NO DIVING · NO OUTSIDE FOOD', twin37(wallAt37(66, 41, 1, 0)), [0, 2.6, 0.03], 3.4, 0.5, { bg: '#2a7ac0', fg: '#ffffff', line: '#ffffff' });
  for (const [x, y] of [[57, 42], [65, 42]]) { const r = pr37(cc37(x), cc37(y), 0.4, 0); B.add(r, 'Box', { width: 1.6, height: 2.4, depth: 1.2 }, [0.9, 0.35, 0.2], 0, [0, 1.2, 0]); B.add(r, 'Box', { width: 1.7, height: 0.12, depth: 1.3 }, COL37.white, 0, [0, 2.5, 0]); B.add(r, 'Box', { width: 1.0, height: 0.5, depth: 0.04 }, [0.1, 0.3, 0.4], 0.12, [0, 1.6, 0.62]); addSolid(r.position.x - 0.9, r.position.z - 0.9, r.position.x + 0.9, r.position.z + 0.9, 'prop'); }
  { const r = wallAt37(57, 52, 1, 0); B.add(r, 'Box', { width: 3.0, height: 1.0, depth: 0.7 }, COLW.yel, 0, [0, 0.5, 0.4]); B.add(r, 'Box', { width: 3.1, height: 0.05, depth: 0.8 }, COL37.white, 0, [0, 1.02, 0.4]); solidLocal(r, -1.5, 0, 1.5, 0.8); sign37('GIFTS', twin37(r), [0, 2.2, 0.05], 1.2, 0.4, { bg: '#2a7ac0', fg: '#ffe040', line: '#ffe040', emis: 0.6 }); }
  for (const x of [66, 68]) { const r = wallAt37(x, 52, 1, 0); F37.vending(B, r, [0.2, 0.5, 0.75]); solidLocal(r, -0.5, 0, 0.5, 0.85); if (x === 66) W37.pos.wwVend = localPt(r, 0, 1, 1.0); }
  W37.pos.tanks = [];
  for (const [x0, x1, y0, y1, name] of [[57, 60, 54, 56, 'TANK 1 · REEF'], [66, 69, 54, 56, 'TANK 2 · OPEN OCEAN'], [57, 60, 58, 59, 'TANK 3 · KELP'], [66, 69, 58, 59, 'TANK 4 · THE DEEP']]) {
    const cx = (x0 + x1 + 1) / 2 * CELL, cz = (y0 + y1 + 1) / 2 * CELL, w = (x1 - x0 + 1) * CELL - 1.0, d = (y1 - y0 + 1) * CELL - 1.0, r = pr37(cx, cz, 0, 0);
    B.add(r, 'Box', { width: w + 0.2, height: 0.5, depth: d + 0.2 }, [0.15, 0.2, 0.24], 0, [0, 0.25, 0]); B.add(r, 'Box', { width: w, height: 4.6, depth: d }, [0.35, 0.65, 0.7], 0.5, [0, 2.8, 0]); B.add(r, 'Box', { width: w + 0.2, height: 0.3, depth: d + 0.2 }, [0.15, 0.2, 0.24], 0, [0, 5.2, 0]);
    for (let i = 0; i < 9; i++) B.add(r, 'Box', { width: 0.1 + rnd(0, 0.5), height: 0.04, depth: 0.03 }, [0.95, 0.8, 0.5], 0.8, [rnd(-w / 2 + 0.3, w / 2 - 0.3), 0.8 + rnd(0, 3.6), d / 2 + 0.01]);
    addSolid(cx - w / 2 - 0.1, cz - d / 2 - 0.1, cx + w / 2 + 0.1, cz + d / 2 + 0.1, 'prop'); W37.pos.tanks.push({ x: cx, z: cz + d / 2 + 0.7, name, taken: false }); }
  sign37('ALMOND WATER\nFILTERED · DO NOT TAP THE GLASS', twin37(wallAt37(62, 53, 3, 0)), [0, 2.8, 0.03], 3.0, 0.8, { bg: '#0c3a54', fg: '#bfe8f4', line: '#8fd0e8', emis: 0.7 });
  for (let i = 0; i < 5; i++) B.pipe([56 * CELL + 0.3, 2.7 + i * 0.07, 61 * CELL + 0.4 + i * 0.5], [71 * CELL - 0.3, 2.7 + i * 0.07, 61 * CELL + 0.4 + i * 0.5], 0.07 + 0.02 * (i % 2), i % 2 ? COL37.rust : COL37.steel);
  { const r = wallAt37(57, 65, 1, 0); B.add(r, 'Box', { width: 2.4, height: 2.3, depth: 0.6 }, [0.3, 0.32, 0.3], 0, [0, 1.15, 0.3]); B.add(r, 'Cylinder', { diameter: 1.4, height: 1.1, tessellation: 16 }, [0.3, 0.4, 0.3], 0, [0, 0.7, 0.8], [Math.PI / 2, 0, 0]); solidLocal(r, -1.3, 0, 1.3, 1.6); W37.pos.genSw = localPt(r, 0, 1.2, 1.3); }
  { const r = wallAt37(62, 65, 1, 0); B.add(r, 'Box', { width: 2.4, height: 0.05, depth: 0.8 }, COL37.wood2, 0, [0, 0.76, 0.45]); for (const x of [-1.1, 1.1]) B.add(r, 'Box', { width: 0.06, height: 0.74, depth: 0.7 }, COL37.wood, 0, [x, 0.37, 0.45]); solidLocal(r, -1.25, 0, 1.25, 0.9);
    B.add(r, 'Box', { width: 0.7, height: 0.56, depth: 0.6 }, [0.62, 0.6, 0.55], 0, [-0.6, 1.07, 0.4]); B.add(r, 'Box', { width: 0.54, height: 0.4, depth: 0.02 }, [0.05, 0.06, 0.08], 0.1, [-0.6, 1.09, 0.71]); B.add(r, 'Box', { width: 0.6, height: 0.1, depth: 0.5 }, [0.12, 0.12, 0.13], 0, [0.4, 0.84, 0.5]);
    W37.pos.ctrl = localPt(r, 0, 1.0, 1.0); W37.pos.ctrlNote = localPt(r, 0.9, 0.8, 0.8); }
  { const r = wallAt37(67, 65, 1, 0); B.add(r, 'Box', { width: 0.9, height: 1.0, depth: 0.7 }, [0.42, 0.5, 0.55], 0, [0, 0.5, 0.35]); B.add(r, 'Cylinder', { diameter: 0.5, height: 0.1, tessellation: 12 }, [0.8, 0.8, 0.8], 0, [0, 1.05, 0.4]); solidLocal(r, -0.5, 0, 0.5, 0.75); W37.pos.breakTable = localPt(r, 0, 1.1, 1.0); }
  for (const [x, y] of [[53, 66], [61, 66], [69, 66]]) { const r = pr37(cc37(x), cc37(y) - 0.6, 0, DECK37); B.add(r, 'Box', { width: 0.7, height: 2.2, depth: 0.7 }, [0.92, 0.38, 0.2], 0, [0, 1.1, 0]); B.add(r, 'Box', { width: 1.2, height: 0.08, depth: 1.2 }, [0.92, 0.38, 0.2], 0, [0, 2.3, 0]); addSolid(r.position.x - 0.4, r.position.z - 0.4, r.position.x + 0.4, r.position.z + 0.4, 'prop'); }
  { const r = pr37(71 * CELL - 0.4, cc37(68), -Math.PI / 2, -3); B.add(r, 'Box', { width: 3.0, height: 2.4, depth: 0.5 }, [0.25, 0.3, 0.32], 0, [0, 1.2, 0.25]); for (let i = 0; i < 8; i++) B.add(r, 'Box', { width: 0.06, height: 2.0, depth: 0.06 }, [0.5, 0.52, 0.5], 0, [-1.2 + i * 0.34, 1.2, 0.55]); W37.pos.waveMachine = { x: 70 * CELL - 0.6, z: cc37(68) }; }
  for (let i = 0; i < 5; i++) { const n = tnode(null, cc37(54 + i * 3), 0, cc37(67 + (i % 3))), m = mkMerged(W37.propMat, P => { P('Torus', { diameter: 0.7, thickness: 0.18, tessellation: 16 }, i % 2 ? COL37.yellow : COL37.red, 0, [0, 0.08, 0]); }, 'buoy37'); m.parent = n; floater37(n, BAS37.WWF, 0); }
  W37.pos.tapeSpot = { x: 54.5 * CELL, z: cc37(68), y: -3 };
  W37.pos.plazaCenter = { x: cc37(63), z: cc37(46) };
}
