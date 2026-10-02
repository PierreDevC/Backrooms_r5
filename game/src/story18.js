// ---------- Level 18 · story objects: the painted door, your four drawings, the MY MEMORIES board, the door you draw, notes, the music box, the slides ----------
const DRAW18 = {
  family: { name: 'MOMMY & DADDY', slot: 0, line: 'Saturdays at the play place. They sat at the little table and watched you. You never told them you were sorry.' },
  dog: { name: 'BISCUIT', slot: 1, line: 'Biscuit. You were supposed to close the gate. You told everyone you had.' },
  monster: { name: 'MY ROOM', slot: 2, line: 'The monster in the closet. It was never a monster. It was always just the coat on the hook.' },
  house: { name: 'OUR HOUSE', slot: 3, line: 'The house on Maple Street. The yellow kitchen. You said you would go back one day. You never went back.' },
};
const NOTE18 = {
  desk: 'To the grown-up who fell in —  You forgot us. That\'s okay, everybody does. Your drawings are still here but they got lost all over. Find all four and pin them on the MY MEMORIES board, then you can draw yourself a door. Dino will help you. Don\'t let the tall one catch you in the dark. It only looks like someone you know.  — the Children',
  nap: 'NAP TIME RULES:  RED slide = bedtime.  YELLOW slide = ball pit.  BLUE slide = outside to play.  GREEN slide = back to class.  Hold on tight and NO climbing up the wrong way!',
};
// ----- crayon pictures -----
function drawPic18(c, id, w, h) {
  paper18(c, w, h, id === 'house' ? '#fff8e0' : '#f7f2e4');
  const s = Math.min(w, h), P = ['#e2483c', '#f08a24', '#e0b000', '#3aa04a', '#2f7fd0', '#8a5cc8', '#e05a9a', '#7a4e2a', '#222222'];
  if (id === 'family') {
    crayonLine18(c, [[0, h * 0.86], [w, h * 0.84]], P[3], 10);
    crayonCircle18(c, w * 0.85, h * 0.16, s * 0.1, P[2], 5, P[2]);
    stick18(c, w * 0.27, h * 0.3, h * 0.5, P[4], { hair: P[7] });
    stick18(c, w * 0.52, h * 0.3, h * 0.48, P[6], { dress: P[6], hair: P[2] });
    stick18(c, w * 0.74, h * 0.52, h * 0.3, P[0], { hair: P[7] });
    crayonText18(c, 'ME', w * 0.74, h * 0.46, 20, P[8]);
  } else if (id === 'dog') {
    crayonLine18(c, [[0, h * 0.84], [w, h * 0.86]], P[3], 10);
    crayonCircle18(c, w * 0.48, h * 0.58, s * 0.2, P[7], 6, '#b98a50');
    crayonCircle18(c, w * 0.72, h * 0.44, s * 0.13, P[7], 6, '#b98a50');
    crayonLine18(c, [[w * 0.66, h * 0.36], [w * 0.62, h * 0.52]], P[7], 7); crayonCircle18(c, w * 0.76, h * 0.42, 4, P[8], 3, P[8]);
    for (const x of [0.36, 0.44, 0.54, 0.62]) crayonLine18(c, [[w * x, h * 0.7], [w * x, h * 0.82]], P[7], 6);
    crayonLine18(c, [[w * 0.3, h * 0.55], [w * 0.2, h * 0.42]], P[7], 6);
    crayonLine18(c, [[w * 0.66, h * 0.62], [w * 0.8, h * 0.62]], P[0], 5);
    crayonText18(c, 'BISCUIT', w * 0.5, h * 0.14, 28, P[0], -0.05);
  } else if (id === 'monster') {
    c.fillStyle = '#2b2f5a'; c.globalAlpha = 0.25; c.fillRect(0, 0, w, h); c.globalAlpha = 1;
    crayonLine18(c, [[w * 0.12, h * 0.95], [w * 0.12, h * 0.1], [w * 0.52, h * 0.1], [w * 0.52, h * 0.95]], P[7], 6);
    crayonFill18(c, w * 0.14, h * 0.12, w * 0.5, h * 0.93, '#1a1a1a', 6);
    crayonCircle18(c, w * 0.28, h * 0.4, 6, '#ffffff', 3, '#fff'); crayonCircle18(c, w * 0.38, h * 0.4, 6, '#ffffff', 3, '#fff');
    crayonLine18(c, [[w * 0.24, h * 0.55], [w * 0.3, h * 0.6], [w * 0.36, h * 0.55], [w * 0.42, h * 0.6]], '#ffffff', 3);
    crayonLine18(c, [[w * 0.6, h * 0.7], [w * 0.95, h * 0.7]], P[4], 8); crayonFill18(c, w * 0.6, h * 0.58, w * 0.95, h * 0.7, '#3f8fe0', 6);
    crayonCircle18(c, w * 0.66, h * 0.55, s * 0.06, P[7], 3, '#f3d2a8');
    crayonText18(c, 'NO!', w * 0.76, h * 0.25, 30, P[0], 0.1);
  } else {
    crayonCircle18(c, w * 0.14, h * 0.16, s * 0.09, P[2], 5, '#f3c230');
    crayonLine18(c, [[0, h * 0.88], [w, h * 0.87]], P[3], 12);
    crayonFill18(c, w * 0.3, h * 0.42, w * 0.78, h * 0.86, '#f3c230', 7);
    crayonLine18(c, [[w * 0.26, h * 0.44], [w * 0.54, h * 0.18], [w * 0.82, h * 0.44], [w * 0.26, h * 0.44]], P[0], 7);
    crayonFill18(c, w * 0.48, h * 0.62, w * 0.6, h * 0.86, '#7a4e2a', 6);
    crayonFill18(c, w * 0.35, h * 0.52, w * 0.44, h * 0.62, '#9fd0f0', 5); crayonFill18(c, w * 0.64, h * 0.52, w * 0.73, h * 0.62, '#9fd0f0', 5);
    crayonLine18(c, [[w * 0.7, h * 0.3], [w * 0.7, h * 0.18], [w * 0.75, h * 0.18], [w * 0.75, h * 0.34]], P[8], 5);
    crayonText18(c, 'MAPLE ST', w * 0.5, h * 0.97 - 8, 18, P[4]);
  }
}
function drawBoard18(c, w, h) {
  c.fillStyle = '#b98a58'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 1800; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '90,56,28' : '230,196,150'},${0.12 + Math.random() * 0.18})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  c.strokeStyle = '#6b4424'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14);
  const T = 'MY MEMORIES', PC = ['#e2483c', '#f08a24', '#e0b000', '#3aa04a', '#2f7fd0', '#8a5cc8', '#e05a9a'];
  c.font = 'bold 40px "Comic Sans MS", "Trebuchet MS", sans-serif'; c.textBaseline = 'middle'; let x = w / 2 - c.measureText(T).width / 2;
  for (let i = 0; i < T.length; i++) { c.fillStyle = PC[i % PC.length]; c.fillText(T[i], x, 42); x += c.measureText(T[i]).width; }
  const ids = ['family', 'dog', 'monster', 'house'], sw = (w - 60) / 4, sh = sw * 0.76;
  ids.forEach((id, i) => {
    const x0 = 30 + i * sw + 6, y0 = 84, ww = sw - 12, hh = sh;
    if (G18.pinned.includes(id)) {
      const P = W18.drawings.find(d => d.id === id); c.save(); c.translate(x0 + ww / 2, y0 + hh / 2); c.rotate((i % 2 ? 1 : -1) * 0.05); c.drawImage(P.S.ctx.canvas, -ww / 2, -hh / 2, ww, hh); c.restore();
      c.fillStyle = '#d23a2a'; c.beginPath(); c.arc(x0 + ww / 2, y0 + 4, 6, 0, TAU); c.fill();
    } else { c.setLineDash([10, 8]); c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 4; c.strokeRect(x0, y0, ww, hh); c.setLineDash([]); c.fillStyle = 'rgba(255,255,255,0.8)'; c.font = 'bold 44px "Comic Sans MS", sans-serif'; c.textAlign = 'center'; c.fillText('?', x0 + ww / 2, y0 + hh / 2); c.textAlign = 'left'; }
    c.fillStyle = '#fbf8ef'; c.fillRect(x0 + 4, y0 + hh + 10, ww - 8, 30); c.fillStyle = '#2a2a2a'; c.font = 'bold 17px "Comic Sans MS", sans-serif'; c.textAlign = 'center'; c.fillText(DRAW18[id].name, x0 + ww / 2, y0 + hh + 26); c.textAlign = 'left';
  });
}
function drawExit18(c, w, h, done) {
  if (done) { drawDoor18(c, w, h, { glow: true, fill: '#f3c230', line: '#b07a10', word: 'HOME', wordCol: '#e2483c', sun: true, bg: '#fff8e4' }); return; }
  paper18(c, w, h, '#f4efe0');
  c.globalAlpha = 0.35; crayonLine18(c, [[w * 0.18, h * 0.96], [w * 0.18, h * 0.12], [w * 0.5, h * 0.12]], '#666666', 4); c.globalAlpha = 1;
  crayonText18(c, 'MY DOOR', w / 2, h * 0.06 + 10, 26, '#8a8a8a');
  crayonText18(c, '(not done)', w / 2, h * 0.55, 20, '#9a9a9a');
}
// ----- build -----
function buildStory18(T) {
  const B = W18.B;
  W.itemMat = actMat('items', { spec: 0.8, shin: 50, emis: 1, wrap: 0.3 });
  // the door you came in by: only a painting of a door now
  { const r = atWall5({ x: 4, y: 20, d: 2 }, 0, 0);
    const S = paperPlane18('pdoor18', 1.34, 2.3, 256, 440, r, [0, 1.16, 0.012], 0.55, (c, w, h) => drawDoor18(c, w, h, { fill: '#fbfbf6', line: '#9a9a9a', bg: '#dff0fa' }));
    const p = localPt(r, 0, 0, 0.3); W18.paintDoor = { S, x: p.x, z: p.z };
    W.interact.push({ x: p.x, z: p.z, y: 1.2, r: 1.8, label: () => 'OPEN THE DOOR', ok: () => G.state === 'play', act: () => { SFX18.paper(); toast('IT\'S ONLY A PAINTING OF A DOOR', 2.6); if (!G18.paintTip) { G18.paintTip = true; later(1.2, () => say('', '…the way you came in isn\'t there any more…', { mode: 'whisper' })); } } }); }
  // your four drawings, lost all over the place
  const mk = (id, root, pos, rot, w = 0.42, h = 0.32, o = {}) => {
    const S = paperPlane18('pic18_' + id, w, h, 256, 196, root, pos, o.emis ?? 0.45, (c, pw, ph) => drawPic18(c, id, pw, ph));
    if (rot) S.mesh.rotation.x = rot;
    const p = localPt(root, pos[0], pos[1], pos[2]), d = { id, S, x: p.x, y: p.y, z: p.z, taken: false, dig: !!o.dig };
    W18.drawings.push(d);
    W.interact.push({ x: p.x, z: p.z, y: p.y, r: o.r ?? 1.7, label: () => d.dig ? 'DIG THROUGH THE BALLS' : 'TAKE THE DRAWING', ok: () => !d.taken && G.state === 'play' && (!d.dig || inPit18(PL.x, PL.z, 0.2)), act: () => d.dig ? digPit18(d) : takeDrawing18(d) });
    return d;
  };
  { const r = propRoot((PIT18.x0 + PIT18.x1) / 2 + 1.1, (PIT18.z0 + PIT18.z1) / 2 + 0.6, 2.6); mk('family', r, [0, 0.5, 0], 1.25, 0.42, 0.32, { dig: true, r: 1.9, emis: 0.35 }); }
  { const s = W18.stump, r = propRoot(s.x, s.z - 0.52, Math.PI); mk('dog', r, [0, 0.24, 0], -0.3); }
  { const r = W18.bedWall; mk('monster', r, [0, 1.36, 0.014], 0); for (const sx of [-0.2, 0.2]) B.add(r, 'Box', { width: 0.07, height: 0.025, depth: 0.004 }, [0.95, 0.92, 0.75], 0, [sx, 1.51, 0.016], [0, 0, sx * 1.5]); }
  { const r = W18.fridge; mk('house', r, [-0.08, 1.28, 0.708], 0, 0.36, 0.28); for (const [sx, sy] of [[-0.24, 1.4], [0.08, 1.4]]) B.add(r, 'Box', { width: 0.05, height: 0.05, depth: 0.02 }, COL18.red, 0.05, [sx, sy, 0.716]); }
  // the MY MEMORIES board (north wall of the Sunshine Room)
  { const r = atWall5({ x: 10, y: 16, d: 3 }, 1.8, 0);
    B.add(r, 'Box', { width: 1.96, height: 1.2, depth: 0.03 }, COL18.dkwood, 0, [0, 1.5, 0.015]);
    const S = paperPlane18('board18', 1.86, 1.1, 512, 304, r, [0, 1.5, 0.034], 0.5, drawBoard18);
    const p = localPt(r, 0, 0, 0.4); W18.board = { S, x: p.x, z: p.z, r };
    W.interact.push({ x: p.x, z: p.z, y: 1.5, r: 1.9, label: () => G18.carry.length ? `PIN YOUR DRAWING${G18.carry.length > 1 ? 'S' : ''} · ${G18.pinned.length + G18.carry.length}/4` : `MY MEMORIES · ${G18.pinned.length}/4`, ok: () => G.state === 'play' && G18.pinned.length < 4, act: () => pinDrawings18() }); }
  // the door you draw yourself (west wall of the Sunshine Room)
  { const r = atWall5({ x: 8, y: 17, d: 2 }, 1.8, 0);
    const S = paperPlane18('exit18', 1.36, 2.36, 256, 444, r, [0, 1.19, 0.014], 0.45, (c, w, h) => drawExit18(c, w, h, false));
    const p = localPt(r, 0, 0, 0.45), f = localPt(r, 0, 0, 0.05); W18.exitDoor = { S, r, x: p.x, z: p.z, fx: f.x, fz: f.z, on: false, k: 0, yaw: r.rotation.y };
    W.interact.push({ x: p.x, z: p.z, y: 1.2, r: 1.9, label: () => W18.exitDoor.on ? 'WALK THROUGH THE DOOR YOU DREW' : 'A DRAWING OF A DOOR · IT ISN\'T FINISHED', ok: () => G.state === 'play', act: () => { if (W18.exitDoor.on) win18(); else { SFX18.paper(); toast(`IT ISN'T FINISHED · ${4 - G18.pinned.length} MEMOR${4 - G18.pinned.length === 1 ? 'Y' : 'IES'} MISSING`, 2.6); } } }); }
  // notes: the Children's letter on the teacher's desk, the nap-time rules
  { const n = W18.deskNote, r = propRoot(n.x, n.z, 0.12); r.rotation.x = 0; const S = dynTexPlane('note18', 0.28, 0.2, 128, 92, r, [0, n.y + 0.004, 0], 0.5); S.mesh.rotation.x = Math.PI / 2; drawNote18(S.ctx, 128, 92, '#fff8d8'); S.dt.update(); W18.signs.push(S);
    W.interact.push({ x: n.x, z: n.z, y: n.y, r: 1.7, label: () => 'READ THE NOTE', ok: () => G.state === 'play', act: () => readNote18('desk') }); }
  { const r = atWall5({ x: 13, y: 22, d: 2 }, 0.5, 0); const S = paperPlane18('napnote18', 0.36, 0.48, 128, 170, r, [0, 1.4, 0.012], 0.5, (c, w, h) => { paper18(c, w, h, '#fbf8ef'); crayonText18(c, 'NAP', w / 2, 22, 22, '#8a5cc8'); crayonText18(c, 'RULES', w / 2, 46, 20, '#8a5cc8'); [['#d23a2a', 'bed'], ['#e0b000', 'balls'], ['#2f7fd0', 'sun'], ['#3aa04a', 'school']].forEach(([k], i) => { crayonFill18(c, 14, 64 + i * 26, 44, 82 + i * 26, k, 4); crayonLine18(c, [[52, 73 + i * 26], [110, 73 + i * 26]], '#555', 3); }); });
    const p = localPt(r, 0, 0, 0.3); W.interact.push({ x: p.x, z: p.z, y: 1.4, r: 1.7, label: () => 'READ THE NOTE', ok: () => G.state === 'play', act: () => readNote18('nap') }); }
  // the music box on the bookshelf
  { const m = W18.musicBox; W.interact.push({ x: m.x, z: m.z, y: m.y, r: 1.7, label: () => G18.musicT > 0 ? 'THE MUSIC BOX IS PLAYING' : 'WIND THE MUSIC BOX', ok: () => G.state === 'play', act: () => windBox18() }); }
  // the slides: climb one at its bottom end
  for (const S of W18.slides) W.interact.push({ x: S.x, z: S.z, y: 0.7, r: 1.7, label: () => `CLIMB THE ${S.name} SLIDE`, ok: () => G.state === 'play' && !G18.slide, act: () => startSlide18(S) });
}
function drawNote18(c, w, h, bg) { paper18(c, w, h, bg); c.strokeStyle = 'rgba(120,120,200,0.35)'; c.lineWidth = 1; for (let y = 14; y < h; y += 10) { c.beginPath(); c.moveTo(4, y); c.lineTo(w - 4, y); c.stroke(); } for (let i = 0; i < 6; i++) crayonLine18(c, [[10, 16 + i * 11], [w - 12 - (i === 5 ? 50 : Math.random() * 16), 16 + i * 11]], '#3a3a8a', 2); }
const inPit18 = (x, z, m = 0) => x > PIT18.x0 + m && x < PIT18.x1 - m && z > PIT18.z0 + m && z < PIT18.z1 - m;

// ----- story actions -----
function readNote18(k) {
  SFX18.paper();
  const parts=k==='desk' ? ["To the grown-up who fell in: You forgot us. That's okay, everybody does.","Your drawings got lost all over. Find all four and pin them on the MY MEMORIES board.","Then you can draw yourself a door. Dino will help you.","Don't let the tall one catch you in the dark. It only looks like someone you know. — the Children"] : ['NAP TIME: RED = bedtime. YELLOW = ball pit.', 'BLUE = outside to play. GREEN = back to class. Hold on tight!'];
  for(const text of parts) say('NOTE',text,{dur:4.5});
  if (k === 'desk' && !G18.noteRead) { G18.noteRead = true; setPhase18(); }
  if (k === 'nap') G18.napRead = true;
}
function digPit18(d) {
  if (G18.digging) return;
  G18.digging = true; SFX18.rustle(P9({ x: d.x, y: 0.4, z: d.z }), 1.2); makeNoise(0.2); PL.shake = Math.max(PL.shake, 0.25);
  later(1.1, () => { G18.digging = false; d.dig = false; takeDrawing18(d); });
}
function takeDrawing18(d) {
  if (d.taken) return;
  d.taken = true; d.S.mesh.setEnabled(false); G18.carry.push(d.id); G18.found++;
  SFX18.paper(); SFX18.chime(); FX.fadeW = Math.max(FX.fadeW, 0.55); G18.flash = 0.55; FX.glitch = Math.max(FX.glitch, 0.4);
  PL.san = Math.max(0, PL.san - [5, 8, 10][G.diff]);
  toast(`YOUR DRAWING · ${DRAW18[d.id].name} · ${G18.found}/4`, 2.6);
  later(0.6, () => say('MEMORY', DRAW18[d.id].line, { dur: 6.5 }));
  if (d.id === 'monster') later(2.4, () => openCloset18());
  if (G18.found === 2 && G.diff > 0) later(6, () => spawnForgotten18());
  if (G18.phase === 'arrive') setPhase18('memories'); else setPhase18();
  cpSave(`DRAWING ${G18.found}/4`);
}
function pinDrawings18() {
  if (!G18.carry.length) { SFX18.paper(); toast(G18.found ? 'YOUR DRAWINGS ARE ALREADY UP' : 'FOUR EMPTY SPACES · FIND YOUR DRAWINGS', 2.4); if (G18.phase === 'arrive') setPhase18('memories'); return; }
  const n = G18.carry.length; G18.pinned.push(...G18.carry); G18.carry = [];
  SFX18.pin(); later(0.3, () => SFX18.pin()); PL.san = Math.min(100, PL.san + 6 * n);
  const S = W18.board.S; drawBoard18(S.ctx, 512, 304); S.dt.update();
  toast(`PINNED · ${G18.pinned.length}/4`, 2); cpSave(`PINNED ${G18.pinned.length}/4`);
  if (G18.pinned.length >= 4) finishDoor18(); else setPhase18();
}
function finishDoor18() {
  const X = W18.exitDoor; X.on = true;
  for (let i = 0; i < 8; i++) later(0.4 + i * 0.22, () => SFX18.crayon());
  later(2.2, () => { drawExit18(X.S.ctx, 256, 444, true); X.S.dt.update(); FX.fadeW = Math.max(FX.fadeW, 0.4); G18.flash = 0.4; SFX18.chime(); });
  later(3.0, () => say('THE CHILDREN', 'You remembered us. Now you can go home. Use the door you drew.', { dur: 5, mode: 'whisper' }));
  setPhase18('exit');
  for (const f of AI18.fog) f.goAway(8);
}
function windBox18() {
  if (G18.musicT > 0) { toast("THE MUSIC BOX IS STILL PLAYING", 2); return; }
  SFX18.wind(P9(W18.musicBox)); G18.musicT = 40; PL.san = Math.min(100, PL.san + 10);
  if (!G18.boxTip) { G18.boxTip = true; later(1.6, () => toast('THE LULLABY STEADIES YOU', 2.4)); }
}
function openCloset18() {
  const C = W18.closet; if (!C || C.want) return;
  C.want = 1; SFX18.creak(P9({ x: C.x, z: C.z })); FX.glitch = Math.max(FX.glitch, 0.8); PL.fear = Math.max(PL.fear, 0.8);
  later(1.2, () => spawnForgotten18({ closet: true }));
}
// ----- the slides: climb up the chute, a rush of dark, somewhere else -----
const SLIDE_TO18 = {
  bed: () => ({ x: 124.6, z: 101.4, yaw: 0.4 }),
  pit: () => ({ x: (PIT18.x0 + PIT18.x1) / 2 - 0.4, z: (PIT18.z0 + PIT18.z1) / 2 + 0.4, yaw: Math.PI }),
  mead: () => ({ x: 19.4, z: 104.6, yaw: 0.2 }),
  hall: () => ({ x: cellCenter(6), z: cellCenter(20), yaw: Math.PI / 2 }),
};
function startSlide18(S) {
  if (G18.slide) return;
  const to = SLIDE_TO18[S.to]();
  G18.slide = { S, t: 0, to, x0: PL.x, z0: PL.z, yaw0: PL.yaw, moved: false };
  SFX18.squeakStep(); makeNoise(0.15);
  G18.slides[S.id] = true;
}
function slideCam18(dt) {
  const T = G18.slide; if (!T) return;
  T.t += dt; const t = T.t, S = T.S;
  if (!T.moved) {
    PL.x = T.x0; PL.z = T.z0; PL.vx = PL.vz = 0;
    const k = smooth(0, 1.1, t), up = Math.atan2(S.top.x - T.x0, S.top.z - T.z0);
    CAM.position.set(lerp(T.x0, S.top.x, k * 0.45), lerp(1.4, S.top.y - 0.4, k * 0.5), lerp(T.z0, S.top.z, k * 0.45));
    CAM.rotation.set(lerp(PL.pitch, -0.35, smooth(0, 0.5, t)), T.yaw0 + angDiff(T.yaw0, up) * smooth(0, 0.5, t), Math.sin(t * 9) * 0.02);
    FX.fadeB = smooth(0.7, 1.15, t);
    if (t > 0.3 && !T.st1) { T.st1 = 1; SFX18.squeakStep(); }
    if (t >= 1.2) {
      T.moved = true; SFX18.whoosh(); PL.x = T.to.x; PL.z = T.to.z; PL.yaw = T.to.yaw; PL.pitch = -0.1; PL.vx = PL.vz = 0; PL.cell = -1; updateField();
    }
  } else {
    PL.x=T.to.x; PL.z=T.to.z; PL.vx=PL.vz=0;
    FX.fadeB = 1 - smooth(1.9, 2.5, t);
    const k = smooth(1.9, 2.9, t);
    CAM.position.set(PL.x, lerp(0.55, CAM.position.y, k), PL.z); CAM.rotation.x = lerp(0.25, CAM.rotation.x, k);
    if (t > 1.95 && !T.land) { T.land = 1; if (T.S.to === 'pit') SFX18.rustle(P9({ x: PL.x, y: 0.4, z: PL.z }), 1.4); else SFX.step(2, false); PL.shake = Math.max(PL.shake, 0.6); }
    if (t > 2.9) { G18.slide = null; FX.fadeB = 0; if (!G18.slideTip) { G18.slideTip = true; later(0.8, () => toast('THE SLIDES GO WHERE YOU CAN\'T WALK… OR THE LONG WAY', 3)); } }
  }
}
