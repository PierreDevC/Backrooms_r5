// ---------- r8 · Level 37 story: the hub (Abara, the plant, the pit, the booth panel, the flood, the two endings) ----------
// Written with the backrooms-dialogue skill. Text only; nothing here is voiced. Full line ledger: docs/LEVEL37.md.
// The spine: Abara needs her cassette (Pell's camcorder is in the pit with it) -> the plant -> drain the Shallows -> the pit -> she tells you the three wings
// -> each wing keeps one thing (hotel: the ROOM 233 CARD; hospital: the DISCHARGE WRISTBAND; Water World: NEW_VIDEO.AVI) -> the booth panel has three slots
// -> the video plays, the Dive Well floods, you swim up to the hatch. Or you sit down with Abara.
const P37 = { keys: {} };
function resetP37() {
  for (const k of Object.keys(P37)) delete P37[k];
  Object.assign(P37, { met: false, intro: 0, topics: {}, quest: false, kettleKey: false, plant: false, drained: false, cam: false, cass: false, tapeRead: false, ret: false, told: false, boothRead: false, plantRead: false,
    keys: { hotel: false, hosp: false, tape: false }, panel: { hotel: false, hosp: false, tape: false }, played: false, stay: false, vend: {}, locker: false, board: false, gatesUsed: {},
    hotel: { book: false, bell: 0, drawer: false, sw: false, timed: false, vaultKey: false, card: false, seen: false, t: 0, warn: false, draw: false },
    hosp: { seen: false, nv: false, ticket: false, linen: false, linenDone: false, lanyard: false, iv: false, ivDone: false, chart: false, chartDone: false, stamps: 0, form: false, roster: false, board: false, sayT: 0, paT: 0 },
    ww: { seen: false, map: false, gen: false, ctrl: false, tape: false, tanks: 0, note: false, paT: 0 }, radioT: 0, hintT: 0 });
}
resetP37();
const wingsDone37 = () => (P37.keys.hotel ? 1 : 0) + (P37.keys.hosp ? 1 : 0) + (P37.keys.tape ? 1 : 0);
const OUT9 = 'M.E.G. OUTPOST 9', HALE_R = 'DR. HALE';
const near37 = (p, r = 3) => p && dist2(PL.x, PL.z, p.x, p.z) < r;
function sayAb37(t, o = {}) { const N = AI37.abara; say('ABARA', t, Object.assign({ pos: N ? { x: N.x, z: N.z } : null, dur: 4.2 }, o)); }

// ----- phases and objectives -----
function setPhase37(p) { if (p) G37.phase = p; objective(obj37()); tasks37(); }
function obj37() {
  if (G37.flood) return G37.hatchReady ? 'OPEN THE HATCH' : 'SWIM UP · THE HATCH IS AT THE TOP';
  switch (G37.phase) {
    case 'arrive': return 'FIND DRY GROUND · THE CABANA, WEST OF THE SHALLOWS';
    case 'dry': return P37.quest ? (P37.plant ? (P37.drained ? 'FIND THE CASSETTE AND THE CAMCORDER · THE PIT' : 'DRAIN THE SHALLOWS · THE PUMP ROOM') : 'THE PLANT KEY · UNDER THE KETTLE') : 'TALK TO ABARA';
    case 'wings': { const w = wingsDone37(); return `THE THREE WINGS · ${w}/3 · EACH KEEPS ONE THING`; }
    case 'finale': return 'THE LIFEGUARD BOOTH · THE PANEL HAS THREE SLOTS';
  }
  return '';
}
function tasks37() {
  task('dry', 'FIND DRY GROUND · THE CABANA', { quiet: true }); if (P37.met) taskDone('dry', 'THE CABANA · ABARA', true);
  if (P37.quest) {
    task('cass', 'ABARA\'S CASSETTE · TAPE FOUR, IN THE PIT', { quiet: true, sub: 'PELL\'S CAMCORDER WENT DOWN WITH IT' });
    task('kettle', 'THE PLANT KEY · UNDER THE KETTLE', { quiet: true }); if (P37.kettleKey) taskDone('kettle', 'THE PLANT KEY', true);
    task('drain', 'DRAIN THE SHALLOWS · GATE THREE, THE PUMP ROOM', { quiet: true }); if (P37.drained) taskDone('drain', 'THE SHALLOWS ARE DRAINED', true);
    if (P37.cass && P37.cam) taskDone('cass', 'THE CASSETTE · AND PELL\'S CAMCORDER', true);
  }
  if (P37.told) {
    task('wings', `THE THREE WINGS · ${wingsDone37()}/3`, { quiet: true, sub: 'HOTEL · HOSPITAL · PARK. EACH KEEPS ONE THING' }); if (wingsDone37() >= 3) taskDone('wings', 'ALL THREE WINGS', true);
    task('hotel', 'THE LUKEWARM HOTEL · THE ROOM 233 CARD', { quiet: true, sub: 'THE PIT CORRIDOR, SOUTH' }); if (P37.keys.hotel) taskDone('hotel', 'THE ROOM 233 CARD', true);
    task('hosp', 'WELLBORN HOSPITAL · THE DISCHARGE WRISTBAND', { quiet: true, sub: 'DOWN THE DIVE WELL AND ALONG, OR DRAIN IT' }); if (P37.keys.hosp) taskDone('hosp', 'THE DISCHARGE WRISTBAND', true);
    task('park', 'WATER WORLD · NEW_VIDEO.AVI', { quiet: true, sub: 'THE EAST END OF THE LAP POOL, THE LONG DARK TUNNEL' }); if (P37.keys.tape) taskDone('park', 'NEW_VIDEO.AVI', true);
  }
  if (wingsDone37() >= 3) { task('panel', 'SEAT ALL THREE IN THE LIFEGUARD PANEL', { quiet: true }); if (P37.played) taskDone('panel', 'THE PANEL IS FULL', true); }
  hotelTasks37(); hospTasks37(); wwTasks37();
}
function target37() {
  const pc = cell37(PL.x, PL.z); const P = W37.pos;
  if (G37.flood) return G37.hatchReady ? W37.hatch : { x: W37.hatch.x, z: W37.hatch.z };
  if (G37.phase === 'arrive') return { x: cc37(24), z: cc37(35) };
  if (G37.phase === 'dry') {
    if (!P37.met || !P37.quest) return AI37.abara;
    if (!P37.kettleKey) return P.kettle;
    if (!P37.plant) return { x: 20 * CELL - 0.8, z: cc37(34) };
    if (!P37.drained) { const g = W37.gates[0]; return g; }
    return { x: cc37(35), z: cc37(41) };
  }
  if (G37.phase === 'wings') return wingTarget37();
  if (G37.phase === 'finale') return P.panel || P.deskB;
  return null;
}

// ----- arrival -----
function arrive37() {
  later(1.6, () => say(OUT9, 'Nine. Camera, there is water on your carrier. A lot of it.', { radio: true }));
  later(9, () => say(OUT9, 'Nine. Find a floor that isn\'t wet and stand on it.', { radio: true }));
  if (flag('hale9') === 'saved') later(20, () => say(HALE_R, 'Hale. If this reaches the pool: walk or swim, but don\'t float. Whatever you do in warm water, do it on purpose.', { radio: true }));
  later(26, () => toast('[C] DIVE · LOOK DOWN AND SWIM TO GO DEEPER · BREATHE AT THE SURFACE', 4));
}

// ----- the hub's objects -----
function buildStory37() {
  const P = W37.pos, I = o => { W.interact.push(o); return o; };
  W.itemMat = actMat('items', { spec: 0.8, shin: 50, emis: 1, wrap: 0.3 });
  if (W37.tower) I({ x: P.towerBase.x, z: P.towerBase.z, y: 1.2, r: 1.8, label: () => 'CLIMB THE TOWER · TEN METRES', ok: () => !G37.onTower && G.state === 'play', act: () => climbTower37() });
  // Abara's corner: the kettle (and the key under it), the lockers, the vending machine, the board
  { const it = I({ x: P.kettle.x, z: P.kettle.z, y: 0.7, r: 1.8, label: () => P37.kettleKey ? 'THE KETTLE' : 'LIFT THE KETTLE', ok: () => G.state === 'play', act: () => kettle37() }); }
  I({ x: P.lockers.x, z: P.lockers.z, y: 1.1, r: 1.9, label: () => P37.locker ? 'THE LOCKERS · EMPTY NOW' : 'OPEN THE LOCKERS', ok: () => G.state === 'play', act: () => lockers37() });
  I({ x: P.vend.x, z: P.vend.z, y: 1.1, r: 1.8, label: () => P37.vend.cab ? 'VENDING MACHINE · EMPTY' : 'VENDING MACHINE · WATER', ok: () => G.state === 'play', act: () => vend37('cab', 'cabana') });
  I({ x: P.board.x, z: P.board.z, y: 1.5, r: 1.9, label: () => 'READ THE BOARD', ok: () => G.state === 'play', act: () => readBoard37() });
  // the plant: log, three gates
  I({ x: P.plantLog.x, z: P.plantLog.z, y: 0.85, r: 1.8, label: () => 'READ THE PLANT LOG', ok: () => G.state === 'play', act: () => readPlantLog37() });
  for (const g of W37.gates) {
    const it = I({ x: g.x, z: g.z, y: 1.4, r: 1.9, label: () => holdBusy(it) ? `TURNING THE WHEEL… ${holdPct(it)}%` : `${g.name} GATE · ${LV.basins[g.basin].tgt < -0.5 ? 'REFILL' : 'DRAIN'}`, ok: () => G.state === 'play' && !g.busy, act: () => gate37(g, it) });
  }
  // the pit: Pell's camcorder and the cassette
  { const px = cc37(34) + 0.4, pz = cc37(41) - 0.6;
    const cam = mkMerged(W.itemMat, Q => { Q('Box', { width: 0.16, height: 0.12, depth: 0.3 }, [0.12, 0.12, 0.13], 0.1, [0, 0.06, 0]); Q('Cylinder', { diameter: 0.08, height: 0.1, tessellation: 12 }, [0.04, 0.04, 0.06], 0.2, [0, 0.07, 0.19], [Math.PI / 2, 0, 0]); Q('Sphere', { diameter: 0.02, segments: 5 }, [1, 0.1, 0.05], 1, [0.04, 0.13, 0.08]); }, 'pellcam'); cam.position.set(px, -2.4, pz); cam.rotation.y = 0.8;
    const cas = mkMerged(W.itemMat, Q => { Q('Box', { width: 0.1, height: 0.02, depth: 0.064 }, [0.8, 0.8, 0.76], 0.5, [0, 0.01, 0]); Q('Box', { width: 0.06, height: 0.004, depth: 0.03 }, [0.1, 0.1, 0.1], 0, [0, 0.022, 0]); }, 'cass37'); cas.position.set(px + 0.8, -2.4, pz + 0.4); cas.rotation.y = 0.3;
    W37.pit = { cam, cas, px, pz };
    I({ x: px, z: pz, y: -2.2, r: 1.7, label: () => 'TAKE THE CAMCORDER · P. PELL', ok: () => !P37.cam && G.state === 'play', act: () => takePellCam37() });
    I({ x: px + 0.8, z: pz + 0.4, y: -2.2, r: 1.7, label: () => 'TAKE THE CASSETTE · TAPE FOUR', ok: () => !P37.cass && G.state === 'play', act: () => takeCassette37() }); }
  // the booth: the lifeguard log, the panel, the television, the hatch
  I({ x: P.deskB.x, z: P.deskB.z, y: 0.85, r: 1.8, label: () => 'READ THE LIFEGUARD LOG', ok: () => G.state === 'play', act: () => readGuardLog37() });
  { const it = I({ x: P.panel.x, z: P.panel.z, y: 1.3, r: 1.9, label: () => panelLabel37(), ok: () => G.state === 'play' && !P37.played, act: () => panel37() }); W37.panelIt = it; }
  if (W37.hatch) { const h = W37.hatch, it = I({ x: h.x, z: h.z, y: h.y - 0.4, r: 2.4, label: () => holdBusy(it) ? `OPENING THE HATCH… ${holdPct(it)}%` : 'OPEN THE HATCH', ok: () => G.state === 'play' && G37.flood && G37.hatchReady, act: () => hatch37(it) }); W37.hatchIt = it; }
  // Abara: sit down with her (the other ending)
  I({ get x() { return AI37.abara ? AI37.abara.x : 0; }, get z() { return AI37.abara ? AI37.abara.z : 0; }, y: 0.5, r: 2.2, label: () => 'SIT DOWN WITH ABARA · STAY', ok: () => G.state === 'play' && P37.ret && wingsDone37() >= 1 && !G37.flood && near37(AI37.abara, 3.2) && P37.staySeen, act: () => stay37() });
  buildWingStory37();
}
function kettle37() {
  if (!P37.quest) { sayAb37('Leave the kettle. It\'s hot. It\'s always hot.'); return; }
  if (P37.kettleKey) { toast('THE KETTLE IS HOT', 1.6); return; }
  P37.kettleKey = true; SFX.pickup(); toast('A KEY ON A TAG · PLANT', 2.4); setPhase37(); cpSave('THE PLANT KEY');
  W37.gates.forEach(g => g.busy = false);
}
function lockers37() {
  if (P37.locker) return; P37.locker = true; PL.water += 2; PL.spare++; SFX.pickup(); toast('ALMOND WATER ×2 · A SPARE BATTERY', 2.6);
  later(0.8, () => sayAb37('Take what\'s yours. Nothing in there is mine.'));
}
function vend37(k, where) {
  if (P37.vend[k]) return; P37.vend[k] = true; PL.water++; SFX.pickup(); toast('A BOTTLE · ALMOND WATER', 2);
  if (where === 'cabana') later(0.6, () => sayAb37('It takes nothing and gives you water. Don\'t ask it for more.'));
}
function readBoard37() {
  SFX.click(); readDoc('board37', 'CABANA · NOTICES', ['POOL RULES: shower first. No running. No glass. No diving in the shallows (we mean it).', 'LOST PROPERTY goes to the booth. Lost swimmers go to the booth. The booth is staffed.', 'If you stop hearing the filters, count to twenty and look for a wall.', 'Please return towels to the rack. Blue ones are clean. (in pencil, under it:) she is right about the blue ones'], { kind: 'board' });
}
function readPlantLog37() {
  P37.plantRead = true; SFX.click();
  readDoc('plant37', 'PLANT LOG · NIGHTS', ['GATE 1 · LAP POOL. Low: the east tunnel is walkable and dark. High: it is under. Go under if you must. Count.', 'GATE 2 · DIVE WELL. Low: there is a stair at the bottom, west side, to wherever it goes. High: that stair is under six metres. Pumps run for about thirty seconds.', 'GATE 3 · SHALLOWS. Low: the pit runs out to the south wall, and there is a corridor in the wall.', 'Never run two gates together. The pumps complain. The pumps always complain.', 'Water in the well does not come up on its own. If it comes up, somebody has played the video.', '(someone else, in biro) the wheel is a hold, not a click. it takes three seconds and it feels like longer'], { kind: 'log' });
  if (!P37.drained && P37.plant) tasks37();
}
function gate37(g, it) {
  if (holdBusy(it)) return; const B = LV.basins[g.basin], low = B.tgt > g.low + 0.3 ? g.low : 0;
  SFX37.pump(P9(g)); SFX9.rattle && SFX9.rattle(P9(g)); makeNoise(0.3);
  holdStart(it, 3, () => { g.busy = false; B.tgt = low; B.speed = g.id === 'well' ? 0.2 : 0.11; SFX37[low < 0 ? 'drain' : 'fill'](P9({ x: PL.x, y: 1, z: PL.z })); makeNoise(0.4);
    toast(low < 0 ? `${g.name} · DRAINING` : `${g.name} · FILLING`, 2.6); P37.gatesUsed[g.id] = true;
    if (g.id === 'sh' && low < 0) { later(26, () => { P37.drained = true; toast('THE SHALLOWS ARE EMPTY', 2.6); setPhase37(); cpSave('THE SHALLOWS DRAINED'); if (!P37.cass) later(2, () => say(OUT9, 'Nine. Your carrier just cleared. First time all hour.', { radio: true })); }); }
    if (g.id === 'well' && low < 0) later(1, () => toast('THE STAIR AT THE BOTTOM OF THE WELL IS DRY', 2.6)); }, { r: 2.4, cancel: 'YOU LET GO OF THE WHEEL', noise: 0.2, tick: dt => { g.mesh.rotation.z += dt * (low < 0 ? 2.4 : -2.4); } });
}
function takePellCam37() { P37.cam = true; W37.pit.cam.setEnabled(false); SFX.pickup(); toast('PELL\'S CAMCORDER · TAPE SEVEN INSIDE', 2.6); pitCheck37(); }
function takeCassette37() { P37.cass = true; W37.pit.cas.setEnabled(false); SFX.pickup(); toast('A CASSETTE · S.A. · TAPE FOUR', 2.4); pitCheck37(); }
function pitCheck37() {
  tasks37(); if (P37.cam && P37.cass) { cpSave('THE PIT'); later(2, () => toast('BRING THEM BACK TO ABARA', 2.4)); }
}
// ----- Abara -----
// each E on her says the next thing she has to say; some of it waits on what you've done
function talkAbara37() {
  const N = AI37.abara, A = (t, d = 0) => later(d, () => sayAb37(t));
  if (!P37.met) {
    P37.met = true; P37.intro = 1; G37.phase = 'dry'; A('Don\'t drip on the cot.'); A('Towels are on the rack. The blue ones are clean.', 3.4); A('Camera, right? I know the harness. You\'re the third I\'ve seen come through that door.', 7); A('Abara. Relief team. Nobody has been relieved.', 12);
    later(15, () => { setPhase37('dry'); cpSave('THE CABANA'); });
    later(24, () => say(OUT9, 'Nine. Somebody just told you not to drip on a cot. That was not one of ours.', { radio: true })); return;
  }
  if (!P37.quest) {   // before she has asked for anything
    const T = P37.topics;
    if (!T.water) { T.water = true; A('Don\'t drink it. Sit in it all you like. That\'s the trouble.'); A('Three weeks by my watch. My watch says three hours. I don\'t trust either number.', 4); return; }
    if (!T.team) { T.team = true; A('Kowalczyk went up the stairs in the blue house and the stairs weren\'t there. Lund went after him. I stayed with the radio.'); A('The radio was a pool. I won\'t explain that any better.', 5.4); return; }
    if (!T.pell) {
      T.pell = true; A('There was a Camera before you. Pell. Tall. Hummed when he was thinking.'); A('He left his camcorder in the pit and my cassette went in after it. I was cleaning it. I\'d like tape four back.', 4.6);
      A('Plant\'s through the west door. Key\'s under the kettle. Don\'t tell me it\'s a pump room, I know what it is.', 10);
      later(11, () => { P37.quest = true; setPhase37('dry'); toast('NEW OBJECTIVE · ABARA\'S CASSETTE', 2.8); }); return;
    }
  }
  if (P37.quest && !(P37.cam && P37.cass)) {
    const k = P37.drained ? 'drained' : P37.plant ? 'plant' : P37.kettleKey ? 'key' : 'ask';
    if (k === 'ask') A('Kettle. Under it. It isn\'t a riddle.'); else if (k === 'key') A('West door, then. The wheel marked SHALLOWS. Hold it. It\'s a long three seconds.');
    else if (k === 'plant') A('Gate three. Run it down and walk to the bottom. Don\'t swim, you\'ll lose the camcorder and I\'ll lose the tape.');
    else A('The pit. South end. Mind the step.'); return;
  }
  if (P37.quest && P37.cam && P37.cass && !P37.ret) {
    P37.ret = true; SFX.pickup(); A('That\'s four. That\'s definitely four.'); A('He had a tape in there too? Put it on the table. I\'ll listen later. Not now.', 4.6);
    later(8, () => { tasks37(); P37.tapeRead = true; readDoc('pell37', 'TAPE SEVEN · P. PELL', PELL37, { kind: 'log' }); });
    later(9, () => { P37.told = true; setPhase37('wings'); cpSave('THREE WINGS'); }); return;
  }
  if (P37.ret && !P37.told2) {
    P37.told2 = true; A('Right. Three doors, none of them out.'); A('Pit corridor, south: a hotel. Down the well and along: a hospital. East end of the lane pool: a park.', 3.6);
    A('Each one keeps something. You\'ll know it because somebody won\'t let you take it.', 9); A('The lifeguard\'s panel has three slots. I count them every morning. I\'m not saying anything by it.', 13.4); return;
  }
  // later visits: what she says about what you have done
  const w = wingsDone37(), T = P37.topics;
  if (P37.keys.hotel && !T.hotel) { T.hotel = true; A('Hotel. Did the music follow you? It follows me.'); return; }
  if (P37.keys.hosp && !T.hosp) { T.hosp = true; hospAbara37(A); return; }
  if (P37.keys.tape && !T.park) { T.park = true; A('You drank from the tanks? Nobody drinks from the tanks.'); A('I did once. It was very good. That was the problem with it.', 4); return; }
  if (w >= 1 && !T.stay) { T.stay = true; P37.staySeen = true; A('There\'s a second cot. I\'m not saying anything. It\'s there.'); return; }
  if (w >= 3) { A(pick(['You\'ll go up. I know. Leave the kettle on. I\'ll hear it from here.', 'Go on. Tell somebody the water was warm.'])); return; }
  A(pick(['Drink something. You look like a drowned tape.', 'Hold the wheel longer than you think you need to.', 'The booth is on the north side of the deep end. The door sticks.', 'I haven\'t tried. I\'m only saying the slots are there.']));
}
function hospAbara37(A) {
  const f = RUN.f, dead = f.dead0 && f.dead0.length ? f.dead0 : [];
  A('Anybody I know?');
  A('Kowalczyk and Lund. On a roster. Porters, it says. Lund would have gone after him.', 3);
  if (dead.length) A(`${dead[0].replace(/^[A-Z]\. /, '').split(' ')[0]}. That sounds like someone who'd want the shifts changed.`, 8.5);
  else A('Nine would want that. I\'m not calling Nine.', 8.5);
}
const PELL37 = ['Is it on. Okay. Tape seven. I stopped counting days, the camcorder keeps its own.', 'Water\'s warm. That\'s my whole complaint. M.E.G. wants a map, so: pool, pool, large pool, pool with a diving board that isn\'t one.',
  'A woman here, relief team, says she\'s been here three hours. I\'ve been here since Tuesday. I\'m recording this so one of us is right.', 'Last one. Leaving the camera in the pit for the next person. If it\'s you: keep it rolling, but stand up now and then.', 'I sat down on the fourth. It was a good fourth.'];
// ----- the booth -----
function readGuardLog37() {
  P37.boothRead = true; SFX.click();
  readDoc('guard37', 'LIFEGUARD LOG', ['06:00 Pool open.', '06:05 Pool open.', '06:10 No swimmers. Water 27. Water 27. Water 27.', 'The panel has three slots and a label under each: HOTEL, HOSPITAL, PARK. Somebody labelled them for me. Not me.', 'The video goes in the slot marked PARK. Do not play it with the Dive Well open. Ref: the incident.', 'If the level moves, go UP. The hatch is in the roof. It is not locked. Nothing here is locked. That\'s the thing about it.'], { kind: 'log' });
  tasks37();
}
const SLOTN37 = { hotel: 'THE ROOM 233 CARD', hosp: 'THE DISCHARGE WRISTBAND', tape: 'NEW_VIDEO.AVI' };
function panelLabel37() {
  for (const k of ['hotel', 'hosp', 'tape']) if (P37.keys[k] && !P37.panel[k]) return `SEAT ${SLOTN37[k]} · SLOT ${['hotel', 'hosp', 'tape'].indexOf(k) + 1}`;
  if (P37.panel.hotel && P37.panel.hosp && P37.panel.tape) return 'PLAY THE VIDEO';
  const left = ['hotel', 'hosp', 'tape'].filter(k => !P37.panel[k]).length; return `THE PANEL · ${left} SLOT${left === 1 ? '' : 'S'} EMPTY`;
}
function panel37() {
  for (const k of ['hotel', 'hosp', 'tape']) if (P37.keys[k] && !P37.panel[k]) {
    P37.panel[k] = true; SFX.click(); SFX.pickup(); toast(`${SLOTN37[k]} · SEATED`, 2.4); makeNoise(0.1);
    const n = (P37.panel.hotel ? 1 : 0) + (P37.panel.hosp ? 1 : 0) + (P37.panel.tape ? 1 : 0);
    if (n === 3) { later(1.4, () => { setPhase37('finale'); cpSave('THE PANEL IS FULL'); }); later(2, () => say(OUT9, 'Nine. Whatever you just did, my board says the level is about to move. Keep your head up.', { radio: true })); }
    tasks37(); return;
  }
  if (P37.panel.hotel && P37.panel.hosp && P37.panel.tape) { startFlood37(); return; }
  SFX.click(); toast('THE SLOTS ARE LABELLED · HOTEL · HOSPITAL · PARK', 2.6);
}
// ----- the flood -----
function startFlood37() {
  if (G37.flood) return; P37.played = true; G37.flood = 1; G37.hatchReady = false; G37.floodT = 0;
  SFX37.vcr(P9(W37.pos.tv ? { x: W37.pos.tv.x, y: 1.1, z: W37.pos.tv.z } : { x: PL.x, y: 1, z: PL.z })); drawTv37(true); toast('NEW_VIDEO.AVI · PLAYING', 2.4); setPhase37(); cpSave('THE VIDEO');
  later(2.6, () => { SFX37.alarm({ x: PL.x, y: 2, z: PL.z, pl: { x: PL.x, z: PL.z } }); say('PA', 'The Deep is now open.', { dur: 3.6 }); FX.glitch = 1.6; });
  later(3.6, () => { sluice37(true); const B = LV.basins[BAS37.WELL]; G37.wellY0 = B.tgt; B.tgt = LV.dry.well.h - 0.9; B.speed = 0.15; for (const c of LV.dry.well.cells) if (LV.bas[c] < 0 && LV.fh[c] < 9) { LV.bas[c] = BAS37.WELL; } });
  later(4.2, () => { for (const d of W9.doors) if (d.dk === 'booth') { setDoor(d, false); d.locked = true; } SFX37.slam(P9({ x: PL.x, y: 1, z: PL.z })); });
  later(8, () => sayAb37('Camera. Swim up. Not across.', { radio: true, dur: 3.2 }));
  later(14, () => spawnFish37('well'));
  W37.hatchIt && null;
}
function sluice37(close) { for (const d of W9.doors) if (d.e && d.e.sign === 'DEEP END') ; W37.sluice = W37.sluice || { x: 35 * CELL - 0.1, z: 26 * CELL + 0.5 }; if (close) { if (W37.sluiceI === undefined) { W37.sluiceI = LV.solids.length; addSolid(34.5 * CELL, 26 * CELL + 0.3, 36.5 * CELL + 0.1, 26 * CELL + 0.9, 'sluice'); } else LV.solids[W37.sluiceI].off = false; SFX37.slam(P9(W37.sluice)); } else if (W37.sluiceI !== undefined) LV.solids[W37.sluiceI].off = true; }
function floodTick37(dt) {
  G37.floodT += dt; const B = LV.basins[BAS37.WELL], top = LV.dry.well.h;
  // the hatch can be opened once the surface is within reach of it
  G37.hatchReady = B.y > top - 1.6 && !G37.onTower;
  if (G37.hatchReady && !G37.warns.hatch) { G37.warns.hatch = true; toast('THE HATCH IS WITHIN REACH', 2.6); setPhase37(); }
  if (G37.floodT > 3 && Math.floor(G37.floodT) % 22 === 0 && Math.floor(G37.floodT - dt) % 22 !== 0) say('PA', pick(['Please keep your arms and legs inside the water.', 'The Deep is open. The Deep is open.', 'Lost belongings may be collected at the surface.']), { dur: 3.4 });
}
function stopFlood37() {}
function hatch37(it) {
  if (holdBusy(it)) return; SFX37.creak(P9(W37.hatch)); holdStart(it, 2.4, () => { win37('surface'); }, { r: 3, cancel: 'YOU LET GO OF THE HATCH', noise: 0.1 });
}
function stay37() {
  P37.stay = true; sayAb37('Good. Shoes off.', { dur: 2.6 }); later(2.6, () => win37('stay'));
}
// ----- the television in the booth -----
function drawTv37(playing) {
  const tv = W37.tvScreen; if (!tv) return; const c = tv.ctx, w = 256, h = 192;
  c.fillStyle = '#05080a'; c.fillRect(0, 0, w, h);
  if (playing) { for (let i = 0; i < 700; i++) { const v = 40 + Math.random() * 110; c.fillStyle = `rgb(${v * 0.7},${v},${v * 0.8})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 1); } c.fillStyle = '#cfe8d8'; c.font = 'bold 13px monospace'; c.fillText('NEW_VIDEO.AVI', 10, 18); c.fillText('00:00:00 ◄◄', 10, h - 12); c.strokeStyle = '#8fd0b0'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 120); for (let x = 0; x <= w; x += 8) c.lineTo(x, 120 + Math.sin(x * 0.12) * 14); c.stroke(); }
  else { c.fillStyle = '#12301e'; c.font = 'bold 14px monospace'; c.fillText('NO SIGNAL', 80, 96); }
  tv.dt.update();
}
// ----- level-wide per frame -----
function places37Events(dt) {
  if (G.state !== 'play') return;
  const pc = cell37(PL.x, PL.z), z = LV.zone[pc], P = W37.pos;
  // first steps into the Cabana: Nine has nothing to say, the room has a person in it
  if (G37.phase === 'arrive' && LV.room[pc] === LV.dry.cab.id) { setPhase37('dry'); }
  // the plant: unlocked with the key from under the kettle
  if (P37.kettleKey && !P37.plant) for (const d of W9.doors) if (d.dk === 'plant' && d.locked && dist2(PL.x, PL.z, d.mx, d.mz) < 2.2) { /* handled in useDoor37 */ }
  // idle hint on the radio
  P37.hintT += dt; if (P37.hintT > 240 && !G37.flood && P37.told && wingsDone37() < 3) { P37.hintT = 0; say(OUT9, pick(['Nine. You\'ve been in the water a while. Pick a door.', 'Nine. Three doors and you\'ve used none. Not complaining.']), { radio: true }); }
  for (const g of W37.gates) { const B = LV.basins[g.basin]; if (g.needle && B) g.needle.rotation.z = lerp(1.2, -1.2, clamp((B.y - g.low) / -g.low, 0, 1)); }
  hotelEvents37(dt, z); hospEvents37(dt, z); wwEvents37(dt, z);
  // the pit things only show once you can see them (they are always there; draining just makes it easy)
  if (W37.pit) { const ok = LV.basins[BAS37.SH].y < -1.0; W37.pit.cam.setEnabled(!P37.cam); W37.pit.cas.setEnabled(!P37.cass); }
}
function doorLabel37(dr) {
  const e = dr.e, d = dr.dk;
  if (d === 'plant' && dr.locked) return P37.kettleKey ? 'UNLOCK THE PLANT · THE KEY FROM THE KETTLE' : 'LOCKED · PLANT · STAFF ONLY';
  if (d === 'hotel' && e.hroom === 204 && dr.locked) return P37.hotel.drawer ? 'UNLOCK 204 · THE ROOM KEY' : 'LOCKED · 204';
  if (d === 'vault' && dr.locked) return P37.hotel.vaultKey ? 'UNLOCK 233 · THE BRASS KEY' : 'LOCKED · 233';
  if (d === 'hosp' && e.plaque === 'PHARMACY' && dr.locked) return P37.hosp.lanyard ? 'UNLOCK THE PHARMACY · THE LANYARD' : 'LOCKED · PHARMACY';
  if (d === 'staff' && e.plaque === 'CONTROL' && dr.locked) return P37.ww.gen ? 'UNLOCK CONTROL' : 'LOCKED · NO POWER';
  if (dr.locked) return 'LOCKED';
  return dr.target ? 'CLOSE DOOR' : 'OPEN DOOR';
}
function useDoor37(dr) {
  const e = dr.e, d = dr.dk;
  if (dr.locked) {
    const ok = (d === 'plant' && P37.kettleKey) || (d === 'hotel' && e.hroom === 204 && P37.hotel.drawer) || (d === 'vault' && P37.hotel.vaultKey) || (d === 'hosp' && e.plaque === 'PHARMACY' && P37.hosp.lanyard) || (d === 'staff' && e.plaque === 'CONTROL' && P37.ww.gen);
    if (!ok) { SFX9.rattle(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.15); toast(d === 'plant' ? 'LOCKED · THE KEY IS UNDER THE KETTLE (ASK ABARA)' : 'LOCKED', 2); if (d === 'plant' && !P37.quest) toast('LOCKED · PLANT · STAFF ONLY', 2); return; }
    dr.locked = false; SFX5.unlock(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.15);
    if (d === 'plant') { P37.plant = true; setPhase37(); cpSave('THE PLANT'); }
    later(0.9, () => setDoor(dr, true)); return;
  }
  useDoor(dr);
}
function buildItems37(diff) {
  const mat = W.itemMat, cells = [];
  for (const k of ['cab', 'booth', 'plant', 'lobby', 'cafe', 'r201', 'r202', 'r203', 'adm', 'hcorr', 'laundry', 'nurses', 'records', 'foyer', 'plaza', 'dome', 'scorr']) { const r = LV.dry[k] || LV.dry['sh']; if (!r) continue; for (const c of r.cells) if (LV.bas[c] < 0) cells.push(c); }
  shuffle(cells); const used = new Set();
  const place = type => {
    for (const c of cells) {
      if (used.has(c)) continue; used.add(c);
      const p = { x: cellCenter(c % N) + rnd(-1.1, 1.1), z: cellCenter((c / N) | 0) + rnd(-1.1, 1.1) }; collide(p, 0.3);
      if (cellOf(p.x) !== c % N || cellOf(p.z) !== ((c / N) | 0) || LV.bas[cell37(p.x, p.z)] >= 0) continue;
      const root = tnode(null, p.x, floorY37(p.x, p.z), p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, mat);
      const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
      return;
    }
  };
  for (let i = 0; i < [6, 5, 3][diff]; i++) place('battery');
  for (let i = 0; i < [9, 6, 3][diff]; i++) place('water');
}
// ----- endings -----
function flags37() { flag('ending37', G37.ending); flag('wings37', wingsDone37()); }
function endCard37() {
  const f = RUN.f, S = [];
  if (G37.ending === 'stay') {
    S.push('The camcorder is on the tile beside the second cot, still recording a ceiling.');
    S.push('Abara pours two. The water in the kettle is the filter\'s, not the pool\'s. She is particular about that.');
    if (P37.keys.hosp && f.dead0 && f.dead0.length) S.push('Somewhere along a corridor of wards, a roster has one more name on it than it had this morning.');
    if (P37.keys.hotel) S.push('The lobby music has moved a little closer.');
    S.push('The tape runs for six more hours. Nobody comes to take it out.');
    return ['STILL WATER', S.join(' ')];
  }
  S.push('The hatch opens on a ceiling fan and an ordinary light. Water runs off the lens for a long time.');
  if (f.hale9 === 'saved') S.push('A radio in another room is saying Hale\'s name, then yours.');
  if (f.dead0 && f.dead0.length) S.push(`On a shift you will never see, someone called ${f.dead0[0].replace(/^[A-Z]\. /, '')} is changing a bulb he was told to change.`);
  if (f.lost0 === 0) S.push('Nine reads the four names off the lobby board, and all four answer.');
  if (P37.keys.hotel) S.push('There is a brass key in your pocket that wasn\'t there when you went in. It says 233.');
  if (f.camera18) S.push('The camcorder is still running. You let it.'); else S.push('The tape runs out on the step.');
  S.push('Behind you, a kettle goes on.');
  return ['SURFACED', S.join(' ')];
}
function cpRespawnFlood37() {
  if (!G37.flood) return;
  G37.flood = 0; G37.hatchReady = false; G37.warns.hatch = false; const B = LV.basins[BAS37.WELL]; B.tgt = G37.wellY0 ?? 0; B.speed = 0.2; sluice37(false);
  P37.played = false; for (const d of W9.doors) if (d.dk === 'booth') d.locked = false; if (AI37.fish) { AI37.fish.dispose && AI37.fish.dispose(); AI37.fish = null; }
  drawTv37(false);
}
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { P37, talkAbara37, kettle37, gate37, readPlantLog37, takePellCam37, takeCassette37, panel37, startFlood37, floodTick37, hatch37, stay37, endCard37, doorLabel37, useDoor37, wingsDone37, obj37, panelLabel37, resetP37, tasks37 }));
