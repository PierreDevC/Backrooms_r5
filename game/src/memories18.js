// ---------- r7 · Level 18: more of the preschool, more of the dark ----------
// A door you draw goes to anybody's house unless your name is on it. Your name tag is in your cubby (CUBBIES, off the corridor), the
// cubby key is in the music room's toy chest, and the chest opens when someone plays the class song on the floor piano. Nobody wrote
// the song down except on your birthday card, and your birthday is one of the rooms hanging in the dark off the east walk.
// Optional: the field-trip bus, also hanging in the dark, with a lunchbox nobody opened.
const M18 = {};
function resetM18() {
  for (const k of Object.keys(M18)) delete M18[k];
  Object.assign(M18, { song: false, played: false, key: false, cubby: false, name: false, signed: false, seen: {}, seq: [], tile: -1, wish: false, lunch: false, chestK: 0, hopT: 0 });
}
resetM18();
const MEM18 = { music: { x0: 16, y0: 17, x1: 18, y1: 19 }, cubby: { x0: 7, y0: 21, x1: 11, y1: 22 }, party: { x0: 37, y0: 12, x1: 38, y1: 14 }, bus: { x0: 37, y0: 20, x1: 37, y1: 24 } };
const PIANO18 = [['RED', '#e2483c', [0.86, 0.2, 0.15]], ['ORANGE', '#f08a24', [0.94, 0.52, 0.14]], ['YELLOW', '#e0b000', [0.95, 0.78, 0.12]], ['GREEN', '#3aa04a', [0.26, 0.64, 0.3]],
  ['BLUE', '#2f7fd0', [0.18, 0.44, 0.86]], ['PURPLE', '#8a5cc8', [0.54, 0.36, 0.78]], ['PINK', '#e05a9a', [0.93, 0.48, 0.66]], ['WHITE', '#f4f4f0', [0.94, 0.94, 0.9]]];
const PNOTE18 = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3];
const SONG18 = [0, 0, 4, 4, 5, 5, 4];   // twinkle, twinkle, little star (C C G G A A G)
const PIANO_LESSON18 = ['Step onto a colour to play a note.', 'To play it twice, step off and back on.', 'Walk on the bare floor between colours.',
  'The tune is on your birthday card.', 'Find it in the party room off the dark east walk.'];
const box18 = k => { const q = MEM18[k]; return { X0: q.x0 * CELL, Z0: q.y0 * CELL, X1: (q.x1 + 1) * CELL, Z1: (q.y1 + 1) * CELL }; };

// ----- layout (genLayout18, after the art room, before the fake doors) -----
function planMem18(room, rect, way) {
  LV.music = LV.cubby = LV.party = LV.bus = null;
  const free = q => { for (let y = q.y0; y <= q.y1; y++) for (let x = q.x0; x <= q.x1; x++) if (LV.zone[cIdx(x, y)] !== Z18.VOID) return false; return true; };
  const R = (k, z, t) => rect(room(z, R18Z.PRE, t), MEM18[k].x0, MEM18[k].y0, MEM18[k].x1, MEM18[k].y1);
  if (free(MEM18.music)) { LV.music = R('music', Z18.MUSIC, 'music'); way(17, 20, 3, 'door', { dk: 'music', plate: 'MUSIC', col: 2, from: [17, 20] }); }
  if (free(MEM18.cubby)) { LV.cubby = R('cubby', Z18.CUBBY, 'cubby'); way(9, 20, 1, 'door', { dk: 'cubby', plate: 'CUBBIES', col: 3, from: [9, 20] }); }
  if (free(MEM18.party) && LV.zone[cIdx(36, 13)] === Z18.VWALK) { LV.party = rect(room(Z18.PARTY, R18Z.VE, 'party'), 37, 12, 38, 14); way(36, 13, 0, 'door', { dk: 'party', col: 1, from: [36, 13] }); }
  if (free(MEM18.bus) && LV.zone[cIdx(36, 22)] === Z18.VWALK) { LV.bus = rect(room(Z18.BUS, R18Z.VE, 'bus'), 37, 20, 37, 24); way(36, 22, 0, 'hole', { from: [36, 22] }); }
}
function lightMem18() {
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  const panel = (x, z, st, o = {}) => { LV.panels.push({ x, z, y: CEIL, state: st, rot: o.rot || 0, w: 0.62, l: 1.22 }); if (st) F(x, z, { state: st, I: o.I ?? 0.5, rad: o.rad ?? 8, sc: o.sc ?? 2.4 }); };
  if (LV.music) for (const c of LV.music.cells) { const x = c % N, y = (c / N) | 0; if ((x + y) % 2 === 1) panel(cellCenter(x), cellCenter(y), 1, { I: 0.55, rad: 9, sc: 2.8 }); }
  if (LV.cubby) { panel(cellCenter(8), cellCenter(21) + 0.4, 2, { I: 0.42, rad: 8 }); panel(cellCenter(10), cellCenter(22) - 0.4, 1, { I: 0.3, rad: 7 }); }
  if (LV.party) { const B = box18('party'); M18.cake = { x: (B.X0 + B.X1) / 2, z: (B.Z0 + B.Z1) / 2 }; F(M18.cake.x, M18.cake.z, { I: 0.34, rad: 6.5, sc: 1.8, y: 1.0 }); LV.bulbs.push({ x: M18.cake.x + 0.9, z: M18.cake.z - 1.6, y: 2.6, kind: 'shade', state: 2 }); F(M18.cake.x + 0.9, M18.cake.z - 1.6, { state: 2, I: 0.2, rad: 5, sc: 1.4 }); }
  if (LV.bus) for (const y of [21, 23]) { const x = cellCenter(37), z = cellCenter(y); F(x, z, { I: 0.24, rad: 5.5, sc: 1.6, state: y === 23 ? 2 : 1 }); LV.bulbs.push({ x, z, y: 2.3, kind: 'bare', state: y === 23 ? 2 : 1, cord: 0.15 }); }
}

// ----- furniture -----
function furnishMem18(B) {
  if (LV.music) furnishMusic18(B);
  if (LV.cubby) furnishCubby18(B);
  if (LV.party) furnishParty18(B);
  if (LV.bus) furnishBus18(B);
}
function furnishMusic18(B) {
  const R = box18('music'), cx = (R.X0 + R.X1) / 2;
  // the floor piano: eight big coloured keys along the north wall (each lights up when you step on it)
  M18.tiles = [];
  const tw = 0.62, z0 = R.Z0 + 0.45, z1 = z0 + 1.35;
  for (let i = 0; i < 8; i++) {
    const x0 = cx - 4 * tw + i * tw, m = actMat('ptile18_' + i, { emis: 1 }); setEmi(m, 0.05);
    const mesh = mkMerged(m, P => { P('Box', { width: tw - 0.04, height: 0.022, depth: z1 - z0 }, PIANO18[i][2], 1, [0, 0, 0]); P('Box', { width: tw - 0.26, height: 0.024, depth: 0.22 }, [0.08, 0.08, 0.09], 0, [0, 0.001, -(z1 - z0) / 2 + 0.2]); }, 'ptile18');
    mesh.position.set(x0 + tw / 2, 0.011, (z0 + z1) / 2);
    M18.tiles.push({ i, x0: x0 + 0.02, x1: x0 + tw - 0.02, z0, z1, m, lit: 0 });
  }
  B.add(propRoot(cx, (z0 + z1) / 2, 0), 'Box', { width: 8 * tw + 0.12, height: 0.01, depth: z1 - z0 + 0.12 }, [0.12, 0.12, 0.14], 0, [0, 0.004, 0]);
  { const r = atWall5({ x: 17, y: 17, d: 3 }, 0, 0), k = twin(r);   // the poster over the piano
    M18.lessonAt = localPt(r, 0, 1.75, 0.06);
    M18.poster = paperPlane18('song18', 2.2, 1.2, 640, 352, k, [0, 1.75, 0.012], 0.55, (c, w, h) => { paper18(c, w, h, '#fbf8ef'); crayonText18(c, 'PLAY OUR SONG!', w / 2, 36, 34, '#e2483c', -0.03);
      for (let line = 0; line < 4; line++) crayonText18(c, PIANO_LESSON18[line], w / 2, 78 + line * 32, 23, '#34464a', 0);
      for (let i = 0; i < 8; i++) { crayonCircle18(c, 50 + i * 77, 222, 13, PIANO18[i][1], 3, PIANO18[i][1]); crayonText18(c, PIANO18[i][0], 50 + i * 77, 253, 14, '#34464a', 0); }
      crayonText18(c, 'and the toy box opens', w / 2, 310, 23, '#2f7fd0', 0.02); }); }
  // the toy chest (locked) against the east wall: its lid lifts when the song is played
  { const r = atWall5({ x: 18, y: 18, d: 0 }, 0, 0), RD = [0.72, 0.2, 0.16];
    B.add(r, 'Box', { width: 1.1, height: 0.55, depth: 0.6 }, RD, 0, [0, 0.29, 0.32]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.06, height: 0.5, depth: 0.62 }, COL18.yel, 0, [s * 0.45, 0.29, 0.32]);
    const pv = tnode(twin(r), 0, 0.57, 0.02), lid = mkMerged(W18.propMat, P => { P('Box', { width: 1.14, height: 0.08, depth: 0.64 }, [0.78, 0.24, 0.18], 0, [0, 0.04, 0.32]); P('Box', { width: 0.16, height: 0.1, depth: 0.04 }, COL18.yel, 0, [0, 0.0, 0.64]); }, 'chestLid18');
    lid.parent = pv; M18.lid = pv; solidLocal(r, -0.58, 0, 0.58, 0.66);
    const p = localPt(r, 0, 0.6, 0.95); M18.chest = { x: p.x, z: p.z, r }; }
  // instruments, chairs in a half circle, a rug
  { const r = propRoot(cx - 1.4, R.Z1 - 1.6, 0.4); B.add(r, 'Cylinder', { diameter: 0.5, height: 0.36, tessellation: 18 }, COL18.blue, 0, [0, 0.18, 0]); B.add(r, 'Cylinder', { diameter: 0.52, height: 0.02, tessellation: 18 }, [0.95, 0.94, 0.9], 0, [0, 0.37, 0]); addSolid(r.position.x - 0.28, r.position.z - 0.28, r.position.x + 0.28, r.position.z + 0.28, 'prop'); }
  { const r = propRoot(cx + 1.3, R.Z1 - 1.4, -0.3); kidTable18(B, r.position.x, r.position.z, -0.3, 2, COL18.green);
    for (let i = 0; i < 8; i++) B.add(r, 'Box', { width: 0.06, height: 0.02, depth: 0.32 - i * 0.025 }, PIANO18[i][2], 0, [-0.26 + i * 0.075, 0.56, 0]); }
  rug18(B, cx, R.Z1 - 2.6, 1.0);
  for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45, q = propRoot(cx + Math.sin(a) * 1.6, R.Z1 - 2.6 + Math.cos(a) * 1.6 - 1.6, a + Math.PI); kidChair18(B, q, KIDC18[i]); }
  placeF18(B, { x: 16, y: 18, d: 2, c: cIdx(16, 18) }, 0, 'shelf', { hw: 0.7 });
  for (const [x, y, d] of [[16, 19, 1], [18, 19, 1]]) artOn18(atWall5({ x, y, d }, 0, 0), 0, 1.5, 0.4, (x * 3) % 16);
}
function cubbyUnit18(B, r, names, mine) {   // a tall cubby unit: three rows of three, each slot labelled
  const W = 1.5, H = 1.55, D = 0.42, c = COL18.wood2;
  B.add(r, 'Box', { width: W, height: H, depth: 0.02 }, c.map(v => v * 0.8), 0, [0, H / 2, 0.01]);
  for (let j = 0; j <= 3; j++) B.add(r, 'Box', { width: W, height: 0.03, depth: D }, c, 0, [0, 0.04 + j * (H - 0.06) / 3, D / 2]);
  for (let i = 0; i <= 3; i++) B.add(r, 'Box', { width: 0.03, height: H, depth: D }, c, 0, [-W / 2 + i * W / 3, H / 2, D / 2]);
  const k = twin(r); let my = null;
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    const x = -W / 2 + (i + 0.5) * W / 3, y = 0.06 + j * (H - 0.06) / 3, nm = names.shift() || '';
    plateOn18(k, x, y + 0.44, nm || '?', 0.34, 0.085, D + 0.005);
    if (mine && i === 1 && j === 1) { my = { x, y }; continue; }
    const q = RNG(), col = pick(KIDC18);
    if (q < 0.4) { B.add(r, 'Box', { width: 0.3, height: 0.34, depth: 0.18 }, col, 0, [x, y + 0.18, 0.18]); B.add(r, 'Box', { width: 0.2, height: 0.12, depth: 0.04 }, col.map(v => v * 0.7), 0, [x, y + 0.12, 0.28]); }
    else if (q < 0.65) { B.add(r, 'Box', { width: 0.26, height: 0.18, depth: 0.12 }, col, 0, [x, y + 0.09, 0.2]); B.add(r, 'Box', { width: 0.12, height: 0.03, depth: 0.03 }, COL18.steel, 0, [x, y + 0.2, 0.2]); }
    else if (q < 0.8) for (const s of [-0.06, 0.06]) B.add(r, 'Box', { width: 0.09, height: 0.14, depth: 0.2 }, col, 0, [x + s, y + 0.07, 0.24]);
  }
  solidLocal(r, -W / 2, 0, W / 2, D + 0.04);
  return my;
}
function furnishCubby18(B) {
  const R = box18('cubby');
  const N1 = ['MAX', 'LILY', 'SAM', 'EMMA', 'NOAH', 'ZOE', 'BEN', 'AVA', 'JOSH', 'KAYLA', 'TOMMY', 'MIA', 'LEO', 'RUBY', 'OWEN', 'NORA', 'ELI', 'IVY', 'JACK', 'ROSE', 'ALEX', 'GRACE', 'FINN', 'JUNE', 'COLE', 'HAZEL', 'REID'];
  const names = shuffle(N1.slice());
  for (const [x, along] of [[8, 0], [10, 0]]) cubbyUnit18(B, atWall5({ x, y: 22, d: 1 }, along, 0), names, false);
  const r = atWall5({ x: 9, y: 22, d: 1 }, 0, 0), my = cubbyUnit18(B, r, names.slice(0, 4).concat(['', ...names.slice(4)]), true);
  M18.myCubby = { r: twin(r), x: my.x, y: my.y };
  // your cubby: a little padlock on a hasp over an empty slot (nothing is in it yet: it opens with the key)
  { const k = M18.myCubby.r, door = mkMerged(W18.propMat, P => { P('Box', { width: 0.44, height: 0.44, depth: 0.025 }, COL18.wood, 0, [0.22, 0.22, 0]); P('Box', { width: 0.1, height: 0.12, depth: 0.02 }, [0.85, 0.7, 0.2], 0, [0.4, 0.22, 0.02]); P('Torus', { diameter: 0.06, thickness: 0.012, tessellation: 10 }, COL18.steel, 0, [0.4, 0.3, 0.03]); }, 'myCubbyDoor18');
    const pv = tnode(k, my.x - 0.22, my.y, 0.43); door.parent = pv; M18.cubbyDoor = pv;
    const bag = mkMerged(W18.propMat, P => { P('Box', { width: 0.3, height: 0.34, depth: 0.2 }, COL18.blue, 0, [0, 0.17, 0]); P('Box', { width: 0.22, height: 0.12, depth: 0.04 }, COL18.yel, 0, [0, 0.12, 0.11]); P('Box', { width: 0.16, height: 0.1, depth: 0.004 }, [0.95, 0.95, 0.92], 0.1, [0, 0.25, 0.102]); }, 'myBag18');
    bag.parent = k; bag.position.set(my.x, my.y + 0.02, 0.2); M18.bag = bag; }
  for (const x of [7, 11]) placeF18(B, { x, y: 21, d: x === 7 ? 2 : 0, c: cIdx(x, 21) }, 0, 'hooks', { hw: 0.7 });
  placeF18(B, { x: 7, y: 22, d: 2, c: cIdx(7, 22) }, 0, 'bench', { hw: 0.7 });
  for (let i = 0; i < 6; i++) { const r = propRoot(R.X0 + 1.2 + i * 0.45, R.Z0 + 0.7 + rnd(-0.1, 0.1), rnd(-0.3, 0.3)), c = pick(KIDC18); for (const s of [-0.07, 0.07]) B.add(r, 'Box', { width: 0.09, height: 0.16, depth: 0.22 }, c, 0, [s, 0.08, 0]); }
  for (const [x, y, d] of [[8, 21, 3], [11, 22, 0]]) artOn18(atWall5({ x, y, d }, 0, 0), 0, 1.6, 0.36, (x + y) % 16);
}
function furnishParty18(B) {
  const R = box18('party'), c = M18.cake;
  { const r = propRoot(c.x, c.z, 0); B.add(r, 'Box', { width: 1.6, height: 0.04, depth: 1.0 }, [0.95, 0.92, 0.95], 0, [0, 0.62, 0]); B.add(r, 'Box', { width: 1.64, height: 0.3, depth: 1.04 }, [0.98, 0.8, 0.88], 0, [0, 0.5, 0]);
    for (const sx of [-0.74, 0.74]) for (const sz of [-0.44, 0.44]) B.add(r, 'Box', { width: 0.04, height: 0.6, depth: 0.04 }, COL18.white, 0, [sx, 0.3, sz]);
    B.add(r, 'Cylinder', { diameter: 0.44, height: 0.2, tessellation: 20 }, [0.98, 0.94, 0.88], 0, [0, 0.74, 0]); B.add(r, 'Cylinder', { diameter: 0.46, height: 0.04, tessellation: 20 }, COL18.pink, 0, [0, 0.83, 0]);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, x = Math.sin(a) * 0.13, z = Math.cos(a) * 0.13; B.add(r, 'Cylinder', { diameter: 0.014, height: 0.1, tessellation: 5 }, KIDC18[i], 0, [x, 0.9, z]); }
    const fl = mkMerged(W18.lensFl || W18.propMat, P => { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; P('Sphere', { diameter: 0.025, segments: 4 }, [1, 0.8, 0.4], 1, [Math.sin(a) * 0.13, 0.965, Math.cos(a) * 0.13], null, [1, 1.6, 1]); } }, 'flames18');
    fl.parent = twin(r); M18.flames = fl;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3, x = Math.sin(a) * 0.62, z = Math.cos(a) * 0.38; B.add(r, 'Cylinder', { diameter: 0.18, height: 0.01, tessellation: 12 }, pick(KIDC18), 0, [x, 0.645, z]); B.add(r, 'Cylinder', { diameterTop: 0, diameterBottom: 0.12, height: 0.16, tessellation: 10 }, pick(KIDC18), 0, [x * 0.8, 0.72, z * 0.8]); }
    addSolid(c.x - 0.86, c.z - 0.56, c.x + 0.86, c.z + 0.56, 'prop');
    for (const [sx, sz, a] of [[-0.5, -0.8, 0], [0.4, -0.8, 0], [-0.5, 0.8, Math.PI], [0.45, 0.8, Math.PI], [-1.1, 0, Math.PI / 2]]) kidChair18(B, propRoot(c.x + sx, c.z + sz, a + rnd(-0.2, 0.2)), pick(KIDC18)); }
  for (let i = 0; i < 4; i++) { const r = propRoot(R.X1 - 0.6, R.Z0 + 0.8 + i * 0.55, rnd(0, 1)), s = rnd(0.25, 0.42), col = pick(KIDC18); B.add(r, 'Box', { width: s, height: s * 0.8, depth: s }, col, 0, [0, s * 0.4, 0]); B.add(r, 'Box', { width: s + 0.01, height: 0.04, depth: 0.05 }, COL18.white, 0, [0, s * 0.8 + 0.01, 0]); B.add(r, 'Box', { width: 0.05, height: 0.04, depth: s + 0.01 }, COL18.white, 0, [0, s * 0.8 + 0.01, 0]); }
  for (let i = 0; i < 9; i++) balloon3d18(W18.ballG, R.X0 + rnd(0.5, R.X1 - R.X0 - 0.5), R.Z0 + rnd(0.5, R.Z1 - R.Z0 - 0.5), 2.35, pick(KIDC18));
  { const r = atWall5({ x: 38, y: 13, d: 0 }, 0, 0), k = twin(r); paperPlane18('bday18', 2.0, 0.5, 512, 128, k, [0, 2.0, 0.012], 0.6, (cx, w, h) => { paper18(cx, w, h, '#fff6fb'); const T = 'HAPPY BIRTHDAY!'; for (let i = 0; i < T.length; i++) crayonText18(cx, T[i], 26 + i * 33, 74, 44, PIANO18[i % 7][1], (i % 2 ? 0.08 : -0.08)); }); }
  for (let i = 0; i < 7; i++) { const x = R.X0 + 0.3 + i * (R.X1 - R.X0 - 0.6) / 6; B.add(null, 'Box', { width: 0.04, height: 0.004, depth: R.Z1 - R.Z0 - 0.3 }, pick(KIDC18), 0, [x, 2.5 - (i % 2) * 0.12, (R.Z0 + R.Z1) / 2], [0.08 * (i % 3 - 1), 0, 0]); }
  artOn18(atWall5({ x: 37, y: 12, d: 3 }, 0, 0), 0, 1.5, 0.42, 3); artOn18(atWall5({ x: 38, y: 14, d: 1 }, 0, 0), 0, 1.5, 0.42, 11);
}
function furnishBus18(B) {
  const R = box18('bus'), GS = [0.2, 0.42, 0.3], X0 = R.X0 + WT / 2, X1 = R.X1 - WT / 2;
  for (let z = R.Z0 + 1.9; z < R.Z1 - 0.4; z += 0.86) for (const side of [-1, 1]) {
    if (side < 0 && z > 79.2 && z < 82.8) continue;   // the doorway
    const x = side < 0 ? X0 + 0.48 : X1 - 0.48, r = propRoot(x, z, Math.PI);
    B.add(r, 'Box', { width: 0.9, height: 0.14, depth: 0.42 }, GS, 0, [0, 0.46, 0]); B.add(r, 'Box', { width: 0.9, height: 0.66, depth: 0.1 }, GS.map(v => v * 0.9), 0, [0, 0.8, -0.24], [-0.1, 0, 0]);
    B.add(r, 'Box', { width: 0.92, height: 0.05, depth: 0.12 }, COL18.steel, 0, [0, 1.14, -0.24]); B.add(r, 'Box', { width: 0.05, height: 0.4, depth: 0.05 }, COL18.steel, 0, [side * -0.42, 0.2, 0]);
    solidLocal(r, -0.46, -0.3, 0.46, 0.22);
  }
  { const r = propRoot(X0 + 0.55, R.Z0 + 0.9, Math.PI); B.add(r, 'Box', { width: 0.5, height: 0.12, depth: 0.5 }, COL18.black, 0, [0, 0.5, 0]); B.add(r, 'Box', { width: 0.5, height: 0.6, depth: 0.1 }, COL18.black, 0, [0, 0.82, -0.25]);
    B.add(r, 'Torus', { diameter: 0.46, thickness: 0.035, tessellation: 18 }, COL18.black, 0, [0, 1.0, 0.45], [1.0, 0, 0]); solidLocal(r, -0.3, -0.3, 0.3, 0.6); }
  B.add(propRoot((X0 + X1) / 2, R.Z0 + 0.3, 0), 'Box', { width: X1 - X0, height: 0.9, depth: 0.5 }, [0.16, 0.16, 0.17], 0, [0, 0.45, 0]);
  const sky = (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7fbde9'); g.addColorStop(0.7, '#d9eef8'); g.addColorStop(1, '#9ccf7a'); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  { const r = atWall5({ x: 37, y: 20, d: 3 }, 0, 0), S = paperPlane18('busfront18', X1 - X0 - 0.2, 0.8, 256, 80, twin(r), [0, 1.55, 0.012], 1.8, sky); W18.winMats.push(S.mat); }
  for (let y = 20; y <= 24; y++) for (const d of [0, 2]) { if (d === 2 && y === 22) continue; const r = atWall5({ x: 37, y, d }, 0, 0), S = paperPlane18('buswin18_' + y + d, 2.6, 0.62, 256, 62, twin(r), [0, 1.45, 0.012], 1.5, sky); W18.winMats.push(S.mat); B.add(r, 'Box', { width: 0.06, height: 0.7, depth: 0.03 }, COL18.steel, 0, [0, 1.45, 0.02]); }
  { const r = atWall5({ x: 37, y: 20, d: 3 }, 0, 0), k = twin(r); plateOn18(k, 0, 2.08, 'FIELD TRIP!', 0.7, 0.16, 0.02); }
  const L = { x: X1 - 0.48, z: R.Z1 - 1.35 }; B.add(propRoot(L.x, L.z, 0.3), 'Box', { width: 0.3, height: 0.2, depth: 0.12 }, COL18.red, 0, [0, 0.63, 0]); B.add(propRoot(L.x, L.z, 0.3), 'Box', { width: 0.14, height: 0.04, depth: 0.04 }, COL18.yel, 0, [0, 0.75, 0]);
  M18.lunchAt = { x: L.x, z: L.z };
}

// ----- story objects (end of buildPlaces18) -----
function buildMem18() {
  if (LV.music) {
    W.interact.push({ get x() { return PL.x + Math.sin(PL.yaw) * 0.35; }, get z() { return PL.z + Math.cos(PL.yaw) * 0.35; }, y: 0.25, r: 1.0, label: () => M18.tile >= 0 ? `PLAY ${PIANO18[M18.tile][0]} AGAIN` : '', ok: () => M18.tile >= 0 && G.state === 'play', act: () => pianoNote18(M18.tile) });
    const lesson = M18.lessonAt; W.interact.push({ x: lesson.x, z: lesson.z, y: lesson.y, r: 2.2, label: () => 'READ THE FLOOR PIANO LESSON', ok: () => G.state === 'play', act: () => readPianoLesson18() });
    const C = M18.chest; W.interact.push({ x: C.x, z: C.z, y: 0.6, r: 1.8, label: () => M18.played ? 'TAKE THE CUBBY KEY' : 'THE TOY BOX · IT WON\'T OPEN', ok: () => G.state === 'play' && !M18.key, act: () => chest18() });
  }
  if (LV.cubby) { const k = M18.myCubby, p = localPt(k.r, k.x, k.y + 0.22, 0.8); M18.cubbyAt = { x: p.x, z: p.z };
    W.interact.push({ x: p.x, z: p.z, y: k.y + 0.25, r: 1.8, label: () => M18.cubby ? 'TAKE YOUR NAME TAG' : M18.key ? 'UNLOCK YOUR CUBBY' : 'A CUBBY WITH NO NAME · LOCKED', ok: () => G.state === 'play' && !M18.name, act: () => cubby18() }); }
  if (LV.party) { const c = M18.cake;
    W.interact.push({ x: c.x - 0.55, z: c.z + 0.2, y: 0.66, r: 1.8, label: () => 'OPEN THE BIRTHDAY CARD', ok: () => G.state === 'play', act: () => card18() });
    W.interact.push({ x: c.x, z: c.z, y: 0.95, r: 1.9, label: () => 'MAKE A WISH', ok: () => G.state === 'play' && !M18.wish, act: () => wish18() });
    { const r = propRoot(c.x - 0.55, c.z + 0.2, 0.3), cardM = mkMerged(W18.propMat, P => { P('Box', { width: 0.2, height: 0.006, depth: 0.15 }, [0.95, 0.6, 0.75], 0.05, [0.05, 0, 0]); P('Box', { width: 0.2, height: 0.006, depth: 0.15 }, [0.98, 0.96, 0.9], 0.05, [-0.06, 0.03, 0], [0, 0, -0.5]); }, 'card18'); cardM.parent = r; cardM.position.y = 0.645; } }
  if (LV.bus) { const L = M18.lunchAt; W.interact.push({ x: L.x, z: L.z, y: 0.7, r: 1.8, label: () => M18.lunch ? 'THE LUNCHBOX · EMPTY NOW' : 'OPEN THE LUNCHBOX', ok: () => G.state === 'play', act: () => lunch18() }); }
}
// ----- the floor piano -----
function readPianoLesson18() {
  M18.seen.chest = true;
  readDoc('pianoLesson18', 'OUR FLOOR PIANO', ['PLAY OUR SONG AND THE TOY BOX OPENS', ...PIANO_LESSON18,
    'You can also look down at a key and use it to play that colour again.'], { kind: 'board' });
  memTasks18(); setPhase18();
}
function pianoHUD18() {
  const panel = $('pianoHint'), tiles = M18.tiles;
  const near = LVL === 18 && G.state === 'play' && !DOC.open && !M18.key && tiles && LV.zone[cell18(PL.x, PL.z)] === Z18.MUSIC &&
    PL.x > tiles[0].x0 - 1.5 && PL.x < tiles[7].x1 + 1.5 && PL.z > tiles[0].z0 - 1 && PL.z < tiles[0].z1 + 3;
  panel.classList.toggle('hide', !near); document.body.classList.toggle('pianoactive', !!near); if (!near) return;
  const notes = sequence => sequence.map(index => `<span style="border-color:${PIANO18[index][1]}">${PIANO18[index][0]}</span>`).join('');
  const action = PL.focus && PL.focus.label(), label = action === 'READ THE FLOOR PIANO LESSON' ? 'READ LESSON' : action && /TOY BOX|CUBBY KEY/.test(action) ? 'TOY BOX' : action;
  hset('pianoAction', label ? (IS_TOUCH ? 'USE · ' : '[E] ') + label : '');
  hset('pianoHow', 'Step on a colour. Step off to repeat. Move between colours on the bare floor.');
  hset('pianoGoal', M18.song || M18.played ? notes(SONG18) : 'Find your birthday card in the party room off the dark east walk.', 'innerHTML');
  hset('pianoPlayed', M18.played ? notes(SONG18) : M18.seq.length ? notes(M18.seq) : 'No notes yet.', 'innerHTML');
  hset('pianoStatus', M18.played ? 'The toy box is open. Take the cubby key.' : !M18.song ? 'Read the card to learn the tune.' :
    M18.seq.length === SONG18.length ? 'Wrong tune. Start again at the first colour.' : 'Take your time. There is no beat to match.');
  document.body.style.setProperty('--pianoBottom', (panel.getBoundingClientRect().bottom + 10).toFixed(0) + 'px');
}
function pianoNote18(i, auto) {
  const T = M18.tiles[i]; T.lit = 1; SFX18.note(i); makeNoise(0.06);
  if (M18.played) return;
  M18.seq.push(i); if (M18.seq.length > SONG18.length) M18.seq.shift();
  if (M18.seq.length === SONG18.length && M18.seq.every((v, k) => v === SONG18[k])) songDone18();
  else if (!auto && M18.seq.length === SONG18.length && !M18.song && !M18.hintT) { M18.hintT = 1; later(1, () => toast('IT DOESN\'T SOUND LIKE ANYTHING YET', 2)); }
}
function songDone18() {
  M18.played = true; M18.seq.length = 0; SFX18.chime(); later(0.5, () => SFX18.chime()); FX.fadeW = Math.max(FX.fadeW, 0.3); G18.flash = 0.3; PL.san = Math.min(100, PL.san + 8);
  toast('THE TOY BOX CLICKS OPEN', 2.6); later(1.0, () => say('THE CHILDREN', 'You remembered our song.', { dur: 4, mode: 'whisper' }));
  taskDone('piano18', 'OUR SONG · PLAYED', true); setPhase18(); cpSave('OUR SONG');
}
function chest18() {
  if (!M18.played) { SFX18.paper(); toast(M18.song ? 'IT WANTS THE SONG FROM YOUR CARD · ON THE FLOOR PIANO' : 'PLAY OUR SONG, SAYS THE POSTER', 2.4); M18.seen.chest = true; memTasks18(); setPhase18(); return; }
  M18.key = true; SFX.pickup(); toast('THE CUBBY KEY · A RIBBON ON IT', 2.4); taskDone('ckey18', 'THE CUBBY KEY', true); setPhase18(); cpSave('THE CUBBY KEY');
}
function card18() {
  SFX18.paper(); for (let k = 0; k < SONG18.length; k++) later(0.45 + k * 0.38, () => SFX18.note(SONG18[k], 0.5));
  const first = !M18.song; M18.song = true;
  readDoc('card18', 'A BIRTHDAY CARD', ['HAPPY BIRTHDAY FROM THE SUNSHINE ROOM', 'your song, so you dont forget it:', SONG18.map(i => PIANO18[i][0]).join(' · '),
    'play it on the floor piano in MUSIC. step off between colours. step off and back on to play a colour twice.', 'you cried when we sang. then you laughed. then cake.', 'love, everybody (and dino)'], { kind: 'board' });
  if (first) { taskDone('song18', 'THE SONG · FROM YOUR BIRTHDAY CARD', true); memTasks18(); setPhase18(); cpSave('YOUR BIRTHDAY'); }
}
function wish18() {
  M18.wish = true; if (M18.flames) M18.flames.setEnabled(false); SFX18.whoosh(); PL.san = Math.min(100, PL.san + 12); FX.glitch = Math.max(FX.glitch, 0.3);
  later(1.0, () => say('', '…you wished you could go home…', { mode: 'whisper' })); toast('YOU BLOW OUT THE CANDLES', 2);
}
function lunch18() {
  if (!M18.lunch) { M18.lunch = true; PL.san = Math.min(100, PL.san + 15); PL.water++; SFX.pickup(); toast('A JUICE BOX OF ALMOND WATER · AND A NOTE', 2.6); task('bus18', 'THE FIELD TRIP', { opt: true, quiet: true }); taskDone('bus18', 'THE FIELD TRIP · YOUR LUNCHBOX', true); }
  SFX18.paper();
  readDoc('lunch18', 'A NOTE IN YOUR LUNCHBOX', ['Have a good trip. Stay with your buddy.', 'Don\'t trade the cookies.', 'I\'ll be at the gate at three.', '— Mom'], { kind: 'note' });
}
function cubby18() {
  if (!M18.key) { SFX18.paper(); toast('A SMALL PADLOCK · THE TEACHER HAS THE KEY', 2.2); M18.seen.cubby = true; memTasks18(); setPhase18(); return; }
  if (!M18.cubby) {
    M18.cubby = true; SFX18.creak(P9({ x: M18.cubbyAt.x, z: M18.cubbyAt.z })); M18.cubbyOpenT = 0.001; taskDone('cubby18', 'YOUR CUBBY · OPEN', true);
    later(1.4, () => { FX.glitch = Math.max(FX.glitch, 0.9); PL.fear = Math.max(PL.fear, 0.8); spawnForgotten18({}); });   // something heard the lock
    return;
  }
  M18.name = true; if (M18.bag) M18.bag.setEnabled(false); SFX18.paper(); SFX.pickup(); FX.fadeW = Math.max(FX.fadeW, 0.4); G18.flash = 0.4;
  toast('HELLO MY NAME IS · YOUR HANDWRITING', 2.8); later(0.7, () => say('MEMORY', 'You can\'t read it anymore. It\'s yours, though. You can tell from the R.', { dur: 6 }));
  taskDone('nametag18', 'YOUR NAME TAG', true); cpSave('YOUR NAME TAG');
  if (G18.phase === 'name') setPhase18(); else setPhase18();
}
// the door: once coloured it also needs your name
function needName18() { return !!LV.cubby && !M18.signed; }
function signDoor18() {
  M18.signed = true; const X = W18.exitDoor; drawExit18(X.S.ctx, 256, 444, false, true); X.S.dt.update();
  taskDone('sign18', 'YOUR NAME IS ON THE DOOR', true); openDoor18();
}
// ----- objectives -----
function memTasks18() {
  if (!LV.cubby) return;
  const started = G18.phase === 'name' || P18.letterTold || M18.seen.cubby || M18.seen.chest || M18.song;
  if (!started) return;
  task('name18', 'YOUR NAME FOR THE DOOR', { quiet: G18.phase !== 'name', sub: 'A DOOR WITH NO NAME ON IT GOES TO ANYBODY\'S HOUSE' });
  task('nametag18', 'YOUR NAME TAG · YOUR CUBBY (CUBBIES)', { quiet: true });
  if (M18.seen.cubby || M18.seen.chest || M18.song || M18.key) task('ckey18', 'THE CUBBY KEY · THE TOY BOX, MUSIC ROOM', { quiet: true });
  if (M18.seen.chest || M18.song) { task('piano18', 'PLAY OUR SONG ON THE FLOOR PIANO', { quiet: true, sub: PIANO_LESSON18.slice(0, 3).join(' ') }); task('song18', 'THE SONG · YOUR BIRTHDAY, OFF THE DARK EAST OF THE PLAYLAND', { quiet: true }); }
  if (M18.song) taskDone('song18', 'THE SONG · FROM YOUR BIRTHDAY CARD', true);
  if (M18.played) taskDone('piano18', 'OUR SONG · PLAYED', true);
  if (M18.key) taskDone('ckey18', 'THE CUBBY KEY', true);
  if (M18.name) { taskDone('nametag18', 'YOUR NAME TAG', true); taskDone('name18', 'YOUR NAME FOR THE DOOR', true); }
  if (G18.phase === 'name' && M18.name) task('sign18', 'WRITE YOUR NAME ON THE DOOR', { quiet: true });
}
function objName18() {
  if (M18.name) return 'WRITE YOUR NAME ON THE DOOR YOU DREW';
  if (M18.key) return M18.cubby ? 'TAKE YOUR NAME TAG' : 'OPEN YOUR CUBBY · CUBBIES';
  if (M18.played) return 'TAKE THE CUBBY KEY · THE TOY BOX';
  if (M18.song) return 'PLAY THE SONG ON THE FLOOR PIANO · MUSIC ROOM';
  if (M18.seen.chest) return 'FIND THE SONG · YOUR BIRTHDAY CARD, IN THE DARK';
  if (M18.seen.cubby) return 'THE CUBBY KEY · THE MUSIC ROOM';
  return 'THE DOOR NEEDS YOUR NAME · YOUR CUBBY';
}
function targetMem18() {
  const tl = M18.tiles; if (M18.name) return W18.exitDoor;
  if (M18.key) return M18.cubbyAt;
  if (M18.played) return M18.chest;
  if (M18.song) return tl ? { x: (tl[0].x0 + tl[7].x1) / 2, z: tl[0].z1 } : M18.chest;
  if (M18.seen.chest && M18.cake) return M18.cake;
  if (M18.seen.cubby) return M18.chest;
  return M18.cubbyAt;
}
// ----- per frame -----
function mem18Events(dt) {
  const pc = cell18(PL.x, PL.z), z = LV.zone[pc], nm = { [Z18.MUSIC]: 'MUSIC ROOM', [Z18.CUBBY]: 'CUBBIES', [Z18.PARTY]: 'YOUR BIRTHDAY', [Z18.BUS]: 'THE FIELD TRIP' }[z];
  if (nm && !M18.seen[z]) { M18.seen[z] = true; toast(nm, 2.4); SFX.beep(1100, 0.05); if (z === Z18.PARTY) later(1.2, () => say('', '…happy birthday to you…', { mode: 'whisper' })); if (z === Z18.BUS) later(1.0, () => say('', '…buddy system… hold hands…', { mode: 'whisper' })); }
  if (M18.tiles) {   // the floor piano: stepping onto a key plays it
    let cur = -1; for (const T of M18.tiles) if (PL.x > T.x0 && PL.x < T.x1 && PL.z > T.z0 && PL.z < T.z1) { cur = T.i; break; }
    if (cur !== M18.tile) { M18.tile = cur; if (cur >= 0 && G.state === 'play') pianoNote18(cur); }
    for (const T of M18.tiles) { T.lit = Math.max(0, T.lit - dt * 1.6); const k = M18.played ? 0.35 + 0.25 * Math.sin(FX.t * 3 + T.i) : 0.05; setEmi(T.m, k + T.lit * 2.2); }
  }
  if (M18.lid) { M18.chestK = damp(M18.chestK, M18.played ? 1 : 0, 3, dt); M18.lid.rotation.x = -1.2 * M18.chestK; }
  if (M18.cubbyDoor && M18.cubbyOpenT) { M18.cubbyOpenT = Math.min(1, M18.cubbyOpenT + dt * 1.5); M18.cubbyDoor.rotation.y = -1.9 * smooth(0, 1, M18.cubbyOpenT); }
}
// ----- sounds -----
SFX18.note = (i, v = 1) => shot((d, t) => { const f = PNOTE18[i]; tone(d, t, 0.9, 'triangle', f, f, 0.16 * v, 0.004); tone(d, t, 0.5, 'sine', f * 2, f * 2, 0.05 * v, 0.004); nz(d, t, 0.04, 'lowpass', 400, 1, 0.12 * v, 0.002); return 1; }, null, 0.9);
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { M18, pianoNote18, chest18, card18, cubby18, wish18, lunch18, signDoor18, objName18, targetMem18, memTasks18 }));
