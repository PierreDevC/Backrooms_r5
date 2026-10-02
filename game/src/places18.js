// ---------- r6 · Level 18 places and story: the art room, the crayons, a fifth drawing, the lost and found, an ending that remembers ----------
const P18 = {};
function resetP18() { for (const k of Object.keys(P18)) delete P18[k]; Object.assign(P18, { crayons: false, camera: false, lost: false, seenArt: false, letterTold: false, colorT: 0 }); }
resetP18();
const ART18 = { x0: 13, y0: 17, x1: 15, y1: 19 };

// ----- layout (genLayout18, before the fake doors are handed out) -----
function planPlaces18(room, rect, way) {
  LV.art = null;
  for (let y = ART18.y0; y <= ART18.y1; y++) for (let x = ART18.x0; x <= ART18.x1; x++) if (LV.zone[cIdx(x, y)] !== Z18.VOID) return;
  LV.art = rect(room(Z18.CLASS, R18Z.PRE, 'art'), ART18.x0, ART18.y0, ART18.x1, ART18.y1);
  way(14, 20, 3, 'door', { dk: 'art', plate: 'ART ROOM', col: 1, from: [14, 20] });
}
function lightPlaces18() {
  if (!LV.art) return;
  for (const c of LV.art.cells) { const x = c % N, y = (c / N) | 0; if ((x + y) % 2 === 0) { LV.panels.push({ x: cellCenter(x), z: cellCenter(y), y: CEIL, state: 1, rot: 0, w: 0.62, l: 1.22 }); LV.fixtures.push({ x: cellCenter(x), z: cellCenter(y), state: 1, seed: RNG(), I: 0.5, rad: 8, sc: 2.6 }); } }
}

// ----- building (end of buildStory18) -----
function buildPlaces18() {
  const B = W18.B; W18.p18 = {};
  if (LV.art) buildArt18(B);
  buildLostFound18(B);
}
function buildArt18(B) {
  const X0 = ART18.x0 * CELL, Z0 = ART18.y0 * CELL, X1 = (ART18.x1 + 1) * CELL, Z1 = (ART18.y1 + 1) * CELL, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  // three easels along the north wall; the middle one holds a drawing that isn't one of the four
  const W_ = [0.75, 0.55, 0.32];
  for (let i = 0; i < 3; i++) {
    const x = X0 + 2.2 + i * 3.1, r = propRoot(x, Z0 + 1.1, 0);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.04, height: 1.6, depth: 0.04 }, COL18.wood, 0, [s * 0.32, 0.78, 0], [0.12, 0, s * 0.08]);
    B.add(r, 'Box', { width: 0.04, height: 1.5, depth: 0.04 }, COL18.wood, 0, [0, 0.72, -0.32], [-0.32, 0, 0]);
    B.add(r, 'Box', { width: 0.8, height: 0.04, depth: 0.08 }, COL18.wood2, 0, [0, 0.72, 0.1]);
    const k = twin(r);
    if (i === 1) {
      const S = paperPlane18('pic18_camera', 0.5, 0.38, 256, 196, k, [0, 1.0, 0.13], 0.5, drawCamera18); S.mesh.rotation.x = -0.12;
      const p = localPt(k, 0, 1.0, 0.6); W18.p18.cam = { S, x: p.x, z: p.z };
      W.interact.push({ x: p.x, z: p.z, y: 1.0, r: 1.8, label: () => 'TAKE THE DRAWING', ok: () => !P18.camera && G.state === 'play', act: () => takeCamera18() });
    } else { const S = paperPlane18('art18_' + i, 0.5, 0.38, 256, 196, k, [0, 1.0, 0.13], 0.45, (c, w, h) => drawScribble18(c, w, h, i)); S.mesh.rotation.x = -0.12; }
    solidLocal(r, -0.42, -0.4, 0.42, 0.2);
  }
  // the paint table with the crayon tub, little chairs, a drying line of paintings
  kidTable18(B, cx, cz + 1.4, 0, 6, COL18.yel || [0.95, 0.74, 0.1]);
  const t = propRoot(cx + 0.35, cz + 1.4, 0.3), tk = twin(t);
  const C6 = [[0.89, 0.28, 0.24], [0.94, 0.54, 0.14], [0.88, 0.69, 0], [0.23, 0.63, 0.29], [0.18, 0.5, 0.82], [0.54, 0.36, 0.78]];
  const tub = mkMerged(W.itemMat, P => { P('Cylinder', { diameter: 0.26, height: 0.16, tessellation: 14 }, [0.2, 0.46, 0.84], 0.15, [0, 0.08, 0]); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; P('Cylinder', { diameter: 0.022, height: 0.12, tessellation: 6 }, C6[i % 6], 0.3, [Math.sin(a) * 0.07, 0.19, Math.cos(a) * 0.07], [Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2]); } }, 'crayons18');
  tub.parent = tk; tub.position.set(0, 0.52, 0);
  const tp = localPt(tk, 0, 0.55, 0); W18.p18.tub = { mesh: tub, x: tp.x, z: tp.z };
  W.interact.push({ x: tp.x, z: tp.z, y: 0.6, r: 1.9, label: () => 'TAKE THE CRAYONS', ok: () => !P18.crayons && G.state === 'play', act: () => takeCrayons18() });
  const line = propRoot(cx, Z1 - 1.2, 0); B.add(line, 'Cylinder', { diameter: 0.01, height: X1 - X0 - 1.2, tessellation: 4 }, [0.9, 0.9, 0.86], 0, [0, 2.15, 0], [0, 0, Math.PI / 2]);
  const lk = twin(line);
  for (let i = 0; i < 6; i++) { const S = paperPlane18('dry18_' + i, 0.36, 0.28, 128, 98, lk, [-3.6 + i * 1.45, 1.92, 0], 0.4, (c, w, h) => drawScribble18(c, w, h, i + 3)); S.mesh.rotation.z = rnd(-0.08, 0.08); W18.signs && W18.signs.push(S); }
  rug18(B, cx - 1.6, cz - 0.2, 1.1);
  for (let i = 0; i < 5; i++) block18(B, cx - 2.6 + rnd(-0.6, 0.6), cz - 1 + rnd(-0.5, 0.5));
  W18.p18.art = { x0: X0, z0: Z0, x1: X1, z1: Z1 };
}
function buildLostFound18(B) {
  // a cardboard box under the coat hooks by the Sunshine Room door
  const r = atWall5({ x: 7, y: 20, d: 1 }, 0.4, 0);
  B.add(r, 'Box', { width: 0.7, height: 0.45, depth: 0.5 }, [0.62, 0.46, 0.28], 0, [0, 0.225, 0.3]);
  for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.7, height: 0.02, depth: 0.26 }, [0.58, 0.43, 0.26], 0, [0, 0.46, 0.3 + s * 0.2], [s * 0.6, 0, 0]);
  B.add(r, 'Box', { width: 0.2, height: 0.12, depth: 0.12 }, COL18.red, 0, [-0.15, 0.48, 0.3]); B.add(r, 'Box', { width: 0.16, height: 0.06, depth: 0.2 }, COL18.blue || [0.16, 0.42, 0.85], 0, [0.15, 0.47, 0.25], [0, 0.4, 0]);
  plateOn18(twin(r), 0, 0.66, 'LOST & FOUND', 0.6, 0.14);
  solidLocal(r, -0.38, 0, 0.38, 0.58);
  const p = localPt(r, 0, 0.4, 0.8);
  W.interact.push({ x: p.x, z: p.z, y: 0.4, r: 1.8, label: () => 'LOOK IN THE LOST & FOUND', ok: () => G.state === 'play', act: () => readLost18() });
}
function drawCamera18(c, w, h) {
  paper18(c, w, h, '#f7f2e4'); const P = ['#e2483c', '#f08a24', '#e0b000', '#3aa04a', '#2f7fd0', '#8a5cc8', '#e05a9a', '#7a4e2a', '#222222'], s = Math.min(w, h);
  crayonLine18(c, [[w * 0.78, h * 0.86], [w * 0.88, h * 0.3], [w * 0.98, h * 0.86], [w * 0.78, h * 0.86]], P[3], 7); crayonFill18(c, w * 0.8, h * 0.4, w * 0.96, h * 0.84, '#3aa04a', 5);
  crayonCircle18(c, w * 0.88, h * 0.26, 6, P[2], 3, P[2]);
  stick18(c, w * 0.34, h * 0.38, h * 0.46, P[4], { hair: P[7] });
  crayonFill18(c, w * 0.42, h * 0.44, w * 0.62, h * 0.58, '#222222', 6); crayonCircle18(c, w * 0.66, h * 0.51, s * 0.06, P[8], 4, '#555555');
  crayonCircle18(c, w * 0.47, h * 0.42, 4, P[0], 3, P[0]);
  crayonText18(c, 'ME', w * 0.24, h * 0.3, 20, P[8]);
  crayonText18(c, 'DADS CAMRA', w * 0.5, h * 0.12, 22, P[0], -0.04);
}
function drawScribble18(c, w, h, k) {
  paper18(c, w, h, ['#f7f2e4', '#fff8e0', '#eef6ff', '#fdf0f4', '#f2fbe8', '#fff4e4', '#f6f1e2', '#eaf2ff', '#fbf3e6'][k % 9]);
  const P = ['#e2483c', '#f08a24', '#e0b000', '#3aa04a', '#2f7fd0', '#8a5cc8', '#e05a9a'], R = mulberry32(1000 + k * 77);
  for (let i = 0; i < 5; i++) { const pts = []; for (let j = 0; j < 4; j++) pts.push([w * (0.1 + R() * 0.8), h * (0.15 + R() * 0.75)]); crayonLine18(c, pts, P[(k + i) % 7], 5); }
  if (k % 2) crayonCircle18(c, w * 0.8, h * 0.2, Math.min(w, h) * 0.1, P[2], 4, '#f3c230');
}

// ----- actions -----
function takeCrayons18() {
  P18.crayons = true; W18.p18.tub.mesh.setEnabled(false); SFX18.crayon(); SFX.pickup(); toast('CRAYONS · THE GOOD ONES', 2.4);
  taskDone('art', 'THE ART ROOM · CRAYONS', true);
  if (G18.phase === 'color') { setPhase18(); later(1.2, () => say('', '…now you can finish it…', { mode: 'whisper' })); }
  cpSave('CRAYONS');
}
function takeCamera18() {
  P18.camera = true; const S = W18.p18.cam.S; S.mesh.setEnabled(false);
  SFX18.paper(); SFX18.chime(); FX.fadeW = Math.max(FX.fadeW, 0.45); G18.flash = 0.45; PL.san = Math.min(100, PL.san + 10);
  toast('A FIFTH DRAWING · DAD\'S CAMERA · YOU KEEP THIS ONE', 3);
  later(0.6, () => say('MEMORY', 'Christmas. Dad\'s camera, the heavy one. Keep it rolling, kiddo.', { dur: 6 }));
  task('camera', 'A DRAWING THAT ISN\'T ONE OF THE FOUR', { opt: true, quiet: true }); taskDone('camera', 'DAD\'S CAMERA · YOU KEPT IT', true);
  flag('camera18', true);
}
function readLost18() {
  const f = RUN.f, L = [];
  if (f.power0 === 'battery') L.push('A car battery with a yellow tag. T.B. It\'s dry.');
  if (f.reyes0 === 'helped') L.push('A roll of medical tape. REYES, in marker, on the inside.');
  if (f.log0) L.push('A page from a logbook. Two words, underlined: It answered.');
  if (f.abara9) L.push('A cassette. S.A. on the label. Rewound.');
  if (f.hale9 === 'left') L.push('A photograph of a man with a girl on his shoulders. The glass is clean.');
  if (f.hale9 === 'saved') L.push('A hospital bracelet. HALE, M. Cut off neatly.');
  if (f.pruitt5) L.push('An empty bottle of rye. Gold label.');
  L.push('One red mitten.', 'A green crayon, worn down to a stub.');
  if (f.lost0 > 0) L.push(`A M.E.G. patch. Somebody wrote ${f.lost0} on the back and crossed it out.`);
  readDoc('lost18', 'LOST & FOUND', L, { kind: 'board' });
  if (!P18.lost) { P18.lost = true; task('lost', 'THE LOST & FOUND', { opt: true, quiet: true }); taskDone('lost', 'THE LOST & FOUND · YOU KNOW SOME OF THESE', true); }
}
function readLetter18() {
  readDoc('letter18', 'A LETTER ON THE TEACHER\'S DESK', ['to the grown up who fell in', 'you forgot us. thats ok. everybody does.', 'your drawings got lost all over. find all 4 and pin them on MY MEMORYS.', 'then you can draw a door. you need crayons for doors. dino helps.', 'dont let the tall one get you in the dark. it looks like somebody you know. it isnt.', '— the Children'], { kind: 'board' });
  if (!P18.letterTold) { P18.letterTold = true; if (LV.art && !P18.crayons) task('art', 'THE ART ROOM · CRAYONS FOR THE DOOR', { opt: true, delay: 3 }); }
}
// pinning the fourth drawing: the door is outlined; with crayons it is coloured in at once, without them it waits
function doorReady18() {
  if (P18.crayons || !LV.art) { finishDoor18(); return; }
  setPhase18('color'); later(1.5, () => say('THE CHILDREN', 'It needs colors. The good crayons are in the art room.', { dur: 5, mode: 'whisper' }));
  task('color', 'COLOR IN THE DOOR · CRAYONS IN THE ART ROOM');
}
function exitLabel18() {
  const X = W18.exitDoor; if (X.on) return 'WALK THROUGH THE DOOR YOU DREW';
  if (G18.phase === 'color') return P18.crayons ? (holdBusy(X) ? `COLORING IT IN… ${holdPct(X)}%` : 'COLOR IN THE DOOR') : 'THE DOOR NEEDS COLOR · FIND CRAYONS';
  return 'A DRAWING OF A DOOR · IT ISN\'T FINISHED';
}
function exitUse18() {   // true = handled
  const X = W18.exitDoor; if (X.on || G18.phase !== 'color') return false;
  if (!P18.crayons) { SFX18.paper(); toast('THE ART ROOM HAS CRAYONS', 2.2); return true; }
  holdStart(X, 2.4, () => { taskDone('color', 'THE DOOR IS COLORED IN', true); finishDoor18(); }, { r: 2.4, cancel: 'YOU STOP COLORING', tick: (dt) => { if (Math.floor(FX.t * 4) !== Math.floor((FX.t - dt) * 4)) SFX18.crayon(); } });
  return true;
}
function tasks18() {
  task('dino', 'FOLLOW THE PLUSH DINO', { quiet: true }); if (G18.phase !== 'arrive') taskDone('dino', 'THE SUNSHINE ROOM', true);
  if (G18.phase !== 'arrive') { task('draw', `FIND YOUR DRAWINGS · ${G18.found}/4`, { quiet: true, sub: 'THE BALL PIT, THE MEADOW STUMP, ABOVE YOUR BED, THE FRIDGE' }); if (G18.found >= 4) taskDone('draw', 'FOUR DRAWINGS FOUND', true);
    task('pin', `PIN THEM ON MY MEMORIES · ${G18.pinned.length}/4`, { quiet: true }); if (G18.pinned.length >= 4) taskDone('pin', 'MY MEMORIES · 4/4', true); }
  if (G18.phase === 'exit') { if (taskOf('color')) taskDone('color', 'THE DOOR IS COLORED IN', true); task('home', 'WALK THROUGH THE DOOR YOU DREW', { quiet: true }); }
}
function places18Events(dt) {
  if (LV.art && !P18.seenArt) { const a = W18.p18.art; if (a && PL.x > a.x0 && PL.x < a.x1 && PL.z > a.z0 && PL.z < a.z1) { P18.seenArt = true; toast('THE ART ROOM', 2.4); SFX.beep(1100, 0.05); if (!P18.crayons) task('art', 'THE ART ROOM · CRAYONS FOR THE DOOR', { opt: true, quiet: true }); } }
}
// radio fragments on arrival: whoever is still listening for you
function arrive18() {
  later(0.8, () => { SFX.staticBurst(0.8, 0.6); say('M.E.G. RADIO', '…expedition… can you hear… Level eigh— …don\'t forget…', { dur: 4, radio: true }); });
  if (flag('hale9') === 'saved') later(9, () => say('DR. HALE', '…Hale… I can hear a music box on your carrier… stay where it\'s bright…', { radio: true }));
  else if (flag('nine0') || flag('hale9')) later(9, () => say('OUTPOST 9', '…Nine… we lost your carrier… if you can hear this, keep the tape running…', { radio: true }));
}
// the last card: what the tape remembers of the whole run
function endText18() {
  const f = RUN.f, S = ['The door opens on a porch on Maple Street. It is morning. Somebody has left the light on anyway.'];
  if (f.hale9 === 'saved') S.push('A radio in the kitchen says Hale\'s name, then yours.');
  else if (f.hale9 === 'left') S.push('Far below, somebody is still knocking. Politely.');
  if (f.lost0 !== undefined) S.push(f.lost0 ? `On the lobby band, ${f.lost0 === 1 ? 'one name never answers' : f.lost0 + ' names never answer'} again.` : 'On the lobby band, four voices are arguing about batteries.');
  if (f.reyes0 === 'helped') S.push('One of them is laughing at a bad joke.');
  if (f.pruitt5 === 'opened') S.push('Room ' + (f.pruittN || '') + ' is still empty. You still went in.');
  S.push(P18.camera ? 'The camcorder is still running. You let it.' : 'The tape runs out on the step.');
  S.push('The little green dinosaur stays behind, waiting for the next one who forgot.');
  return S.join(' ').replace('Room  is', 'His room is');
}
function flags18() { flag('camera18', P18.camera); flag('crayons18', P18.crayons); }
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { P18, takeCrayons18, takeCamera18, readLost18, readLetter18, doorReady18, exitUse18, endText18, tasks18 }));
