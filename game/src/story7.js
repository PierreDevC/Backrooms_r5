// ---------- r10 · Level 7 story: the rig, the habitat, the Aurelia, the Halcyon, the cape, the lamp, the three endings ----------
// Written with the backrooms-dialogue skill. See docs/LEVEL7.md for the line ledger and new canon.
const PS7 = {};
function resetPS7() {
  for (const k of Object.keys(PS7)) delete PS7[k];
  Object.assign(PS7, { met: false, topics: {}, kellN: 0, told: false, gen: false, air: false, fenMet: false, fenN: 0, wrenMet: false, wrenN: 0, dial: [0, 0, 0], safeOpen: false, motor: false, motorSeated: false, can: false, fuel: false, fuelSeated: false, clamp: false, cable: false, cableSeated: false,
    lit: false, key: false, flares: 1, logs: {}, taken: {}, stayed: false, hintT: 0, seen: {}, pending: null, kellLit: false, fenLit: false, wrenLit: false });
}
resetPS7();
const OUT7 = 'M.E.G. OUTPOST 9';
const near7 = (p, r = 3.2) => p && dist2(PL.x, PL.z, p.x, p.z) < r;
function sayK7(t, o = {}) { const N = AIS7.kell; say('KELL', t, Object.assign({ pos: N ? { x: N.x, z: N.z } : null, dur: 4.4 }, o)); }
function sayW7(t, o = {}) { const N = AIS7.wren; say('WREN', t, Object.assign({ pos: N ? { x: N.x, z: N.z } : null, dur: 4.4 }, o)); }
function sayF7(t, o = {}) { const N = AIS7.fen; say('FEN', t, Object.assign({ pos: N ? { x: N.x, z: N.z } : null, dur: 4.4 }, o)); }
const partsDone7 = () => (PS7.fuelSeated ? 1 : 0) + (PS7.motorSeated ? 1 : 0) + (PS7.cableSeated ? 1 : 0);
const logCount7 = () => Object.keys(PS7.logs).length;

// ----- objectives -----
function setPhase7(p) { if (p) GS7.phase = p; objective(obj7()); tasks7(); }
function obj7() {
  if (PS7.lit) return 'THE SEA IS CALM · THE BOAT, THE KEEPER, OR THE DEEP';
  if (!PS7.met) return 'CLIMB TO THE RIG · FOLLOW THE LIGHTS';
  if (!PS7.gen) return 'START THE GENERATOR · THE GREY HOUSE, EAST SIDE OF THE DECK';
  if (!PS7.air) return 'OPEN THE AIR VALVE · THE HOUSE AT THE NORTH-EAST CORNER';
  if (!PS7.fenMet) return 'HABITAT ORCA-2 · THE SEABED NORTH OF THE RIG';
  const have = (PS7.fuel ? 1 : 0) + (PS7.motor ? 1 : 0) + (PS7.cable ? 1 : 0);   // carried or spliced, seated or not
  if (have < 3) return `THE LAMP PARTS · ${have}/3 · FUEL · MOTOR · CABLE`;
  if (partsDone7() < 3) return `THE LAMP ROOM · SEAT THE PARTS · ${partsDone7()}/3`;
  return 'THE LAMP ROOM · THE LADDER IN CAPE SORREL';
}
function tasks7() {
  task('rig', 'CLIMB TO THE RIG', { quiet: true }); if (PS7.met) taskDone('rig', 'THE RIG · KELL', true);
  if (!PS7.met) return;
  task('gen', 'THE GENERATOR · THE GREY HOUSE', { quiet: true, sub: 'THE BUOYS AND THE AIR LINE RUN OFF IT' }); if (PS7.gen) taskDone('gen', 'THE GENERATOR IS RUNNING', true);
  if (PS7.gen) { task('air', 'THE AIR VALVE · NORTH-EAST HOUSE', { quiet: true, sub: 'THE HABITAT\'S AIR COMES OFF THIS RIG' }); if (PS7.air) taskDone('air', 'AIR ON FOR HABITAT 2', true); }
  if (PS7.air) { task('fen', 'HABITAT ORCA-2 · FEN', { quiet: true, sub: 'NORTH OF THE RIG · NINE METRES DOWN' }); if (PS7.fenMet) taskDone('fen', 'FEN · FOUND', true); }
  if (PS7.told) {
    task('parts', `THE LAMP PARTS · ${partsDone7()}/3`, { quiet: true, sub: 'SEAT ALL THREE IN THE LAMP ROOM' }); if (partsDone7() >= 3) taskDone('parts', 'ALL THREE PARTS SEATED', true);
    task('fuel', 'FUEL · THE AURELIA', { quiet: true, sub: PS7.fuel ? 'CARRY IT TO THE LAMP ROOM' : PS7.can ? 'FILL THE CAN IN THE ENGINE ROOM' : 'A JERRY CAN ON HER DECK · WEST OF THE RIG' }); if (PS7.fuelSeated) taskDone('fuel', 'FUEL · SEATED', true);
    task('motor', 'THE LENS MOTOR · THE HALCYON', { quiet: true, sub: PS7.safeOpen ? 'TAKE IT' : 'THE BRIDGE SAFE · THE WRECK, NORTH-WEST, TEN METRES DOWN' }); if (PS7.motorSeated) taskDone('motor', 'THE MOTOR · SEATED', true);
    task('cable', 'THE CABLE · WEST OF THE CAPE', { quiet: true, sub: PS7.clamp ? 'THE JUNCTION BOX IS ON THE SEABED' : 'WREN HAS A CLAMP' }); if (PS7.cableSeated) taskDone('cable', 'THE CABLE · LIVE', true);
    task('safe', 'THE SAFE COMBINATION · 3 NUMBERS', { quiet: true, opt: false, sub: `FEN · THE AURELIA'S MATE · THE TIDE BOARD · KNOWN: ${[PS7.logs.fen ? '1' : '_', PS7.logs.mate ? '2' : '_', PS7.logs.tide ? '3' : '_'].join(' ')}` }); if (PS7.safeOpen) taskDone('safe', 'THE SAFE IS OPEN', true);
  }
  if (PS7.logs.dav) { task('dav', 'DAV\'S DINGHY · ADRIFT IN THE OPEN DARK, EAST OF THE HABITAT', { quiet: true, opt: true, sub: 'THE NOTE ON THE BUNK · FLARES WOULD HELP' }); if (PS7.logs.dinghy) taskDone('dav', 'DAV\'S DINGHY · FOUND', true); }
  if (PS7.wrenMet || PS7.logs.cook || PS7.logs.cap) { const n = ['cook', 'mate', 'cap'].filter(k => PS7.logs[k]).length; task('aur', `THE AURELIA'S CREW · ${n}/3`, { quiet: true, opt: true }); if (n >= 3) taskDone('aur', 'THE AURELIA · ALL THREE PAGES', true); }
  if (PS7.lit) { task('end', 'THE SEA IS CALM · CHOOSE', { quiet: true, sub: 'THE BOAT · WREN\'S SECOND CHAIR · THE CABLE DOWN THE TRENCH' }); }
}
function target7() {
  const A_ = p => Array.isArray(p) ? { x: p[0], z: p[2] } : p, r = target7_(); return A_(r);
}
function target7_() {
  const P = WS7.pos;
  if (PS7.lit) return PS7.key ? P.boatBoard : AIS7.kell;
  if (!PS7.met) return AIS7.kell;   // the route finder takes you up the nearest ladder
  const onDeck = LV.room[cell7(PL.x, PL.z)] >= 0 && LV.dry.rig.cells.includes(cell7(PL.x, PL.z));
  if (!PS7.gen) return P.gen;
  if (!PS7.air) return P.airValve;
  if (!PS7.fenMet) return P.fen;
  if (!PS7.fuel) return PS7.can ? P.fuelValve : P.jerrycan;
  if (!PS7.motor) return PS7.safeOpen ? P.motor : (PS7.logs.fen && PS7.logs.mate && PS7.logs.tide ? P.safe : (!PS7.logs.mate ? P.mateLog : !PS7.logs.tide ? P.tide : P.safe));
  if (!PS7.clamp) return PS7.wrenMet ? P.clamp : AIS7.wren;   // she points you at it; the clamp itself is on the cottage bench
  if (!PS7.cable) return P.junction;
  return P.lampPanel;
}
// ----- arrival -----
function arrive7() {
  later(2.5, () => say(OUT7, 'Nine. Camera, your signal is wet. I am not going to ask.', { radio: true }));
  later(8, () => toast('SWIM TO THE LIGHTS · [C] DIVE · BREATHE AT THE SURFACE · [G] FIRES A FLARE', 4));
  if (flag('hale9') === 'saved') later(30, () => say(HALE_R, 'Hale. Nine says you are in the water. Find something to climb.', { radio: true }));
}
// ----- ladders: a short fade, then you are on the other level -----
function updateLadder7(dt) {
  const C = GS7.climb; if (!C) return; C.t += dt; FX.fadeB = C.t < 0.5 ? C.t / 0.5 : Math.max(0, 1 - (C.t - 0.8) / 0.5);
  if (!C.moved && C.t >= 0.5) {
    C.moved = true; const L = C.L, x = C.up ? L.dx : L.wx, z = C.up ? L.dz : L.wz; PL.x = x; PL.z = z; PL.vx = PL.vz = 0; PL.cell = -1;
    const c = cell7(x, z), fh = LV.fh[c], b = LV.bas[c], W0 = b >= 0 ? LV.basins[b].y : -99, wet = b >= 0 && W0 - fh > 1.3;
    G37.ey = wet ? W0 + 0.22 : fh + 1.62; G37.vy = 0; G37.falling = false; G37.under = false; updateField();
    if (C.up && L.pocket) toast(L.id === 'tw' ? 'THE LAMP ROOM' : 'THE BRIDGE', 2);
  }
  if (C.t > 1.4) { GS7.climb = null; FX.fadeB = 0; }
}
function climb7(L, up) { if (GS7.climb || G.state !== 'play') return; GS7.climb = { t: 0, L, up }; SFX37.ladder(); makeNoise(0.1); }
// ----- the objects -----
function buildStory7() {
  const P = WS7.pos, I = o => { W.interact.push(o); return o; }, doc = (k, p, label, title, lines, kind = 'note', r = 1.8) => I({ x: p[0] ?? p.x, z: p[2] ?? p.z, y: p[1] ?? 1.2, r, label: () => label, ok: () => G.state === 'play', act: () => readDoc7(k, title, lines, kind) });
  W.itemMat = actMat('items', { spec: 0.8, shin: 50, emis: 1, wrap: 0.3 });
  for (const L of WS7.ladders) {
    I({ x: L.wx, z: L.wz, y: 1.0, r: 2.3, label: () => 'CLIMB UP · ' + L.name, ok: () => G.state === 'play' && !GS7.climb && (L.pocket || L.pitDeck || depth37(PL.x, PL.z) > 0.5 || LV.fh[cell7(PL.x, PL.z)] < 1.0), act: () => climb7(L, true) });
    I({ x: L.dx, z: L.dz, y: 1.0, r: 1.9, label: () => L.pocket ? 'CLIMB DOWN' : 'CLIMB DOWN INTO THE WATER', ok: () => G.state === 'play' && !GS7.climb && LV.fh[cell7(PL.x, PL.z)] > 0.5, act: () => climb7(L, false) });
  }
  // ===== the rig =====
  doc('messboard', P.messBoard, 'READ THE MESS BOARD', 'MESS · NOTICES', ['DINNER IS AT SIX.', 'WASH YOUR OWN CUP.', 'NO SWIMMING OFF THE NORTH LADDER. (underlined twice)', '(added later, in biro:) if it knocks on the leg, it is not the pipes'], 'board');
  doc('bunknote', P.bunkNote, 'READ THE NOTE ON THE PILLOW', 'NOTE · PILLOW', ['Kell. If you are reading this I took the dinghy to Habitat Two and it did not come back.', 'I\'m not angry. Don\'t come looking.', '— Dav'], 'note');
  doc('kelllog', P.kellLog, 'READ THE RADIO LOG', 'MERIDIAN · RADIO LOG · KELL', ['Day 1. Crew taken off by helicopter. Told to stand by the radio. Stood by.', 'Day 3. Fen went down to Habitat Two to check his air line. The compressor stopped while he was down. Haven\'t heard him since.', 'Day 6. Something moved the water by the south leg. There was no wind.', 'Day 9. The last lamp on the north leg gave out. Only then did I notice the cape lamp was dark.', 'Day 11. Counted the tins. Counted again.'], 'log');
  I({ x: P.tide[0], z: P.tide[2], y: 1.5, r: 1.9, label: () => 'READ THE TIDE BOARD', ok: () => G.state === 'play', act: () => { PS7.logs.tide = true; readDoc7('tide7', 'TIDES · MERIDIAN', ['HW 04:12 · LW 10:31 · HW 16:40', '(down the margin, in pencil:)', 'HALCYON · BRIDGE SAFE · _ _ 7', 'Fen has the first. The Aurelia\'s mate has the second.'], 'board'); tasks7(); } });
  I({ x: P.gen[0], z: P.gen[2], y: 1.0, r: 1.9, label: () => PS7.gen ? 'THE GENERATOR · RUNNING' : holdBusy(genIt) ? `PRIMING… ${holdPct(genIt)}%` : 'START THE GENERATOR', ok: () => G.state === 'play' && !PS7.gen, act: () => startGen7(genIt) }); const genIt = W.interact[W.interact.length - 1];
  I({ x: P.airValve[0], z: P.airValve[2], y: 1.2, r: 1.9, label: () => PS7.air ? 'THE AIR VALVE · OPEN' : !PS7.gen ? 'THE AIR VALVE · NO POWER' : holdBusy(airIt) ? `OPENING… ${holdPct(airIt)}%` : 'OPEN THE AIR VALVE', ok: () => G.state === 'play' && !PS7.air, act: () => openAir7(airIt) }); const airIt = W.interact[W.interact.length - 1];
  pickup7('flare0', P.flareRig, 'TAKE THE FLARES · 2', () => { PS7.flares += 2; toast('FLARES · ' + PS7.flares + ' · [G] FIRES ONE', 2.4); });
  // ===== the Aurelia =====
  doc('cook', P.cook, 'READ THE MESS NOTICE', 'MESS NOTICE · AURELIA', ['DINNER IS AT SIX.', 'Dinner has been at six since March.', 'Nobody has come for it. I keep cooking.', '— Cook'], 'board');
  pickup7('jerry', P.jerrycan, 'TAKE THE JERRY CAN', () => { PS7.can = true; toast('A JERRY CAN · EMPTY', 2.2); tasks7(); });
  I({ x: P.fuelValve[0], z: P.fuelValve[2], y: 1.0, r: 1.9, label: () => PS7.fuel ? 'THE FUEL TANK · DRAINED' : !PS7.can ? 'THE FUEL TANK · YOU NEED A CAN' : holdBusy(fuelIt) ? `FILLING… ${holdPct(fuelIt)}%` : 'FILL THE JERRY CAN', ok: () => G.state === 'play' && !PS7.fuel, act: () => fillFuel7(fuelIt) }); const fuelIt = W.interact[W.interact.length - 1];
  I({ x: P.mateLog[0], z: P.mateLog[2], y: 0.9, r: 1.8, label: () => 'READ THE MATE\'S LOG', ok: () => G.state === 'play', act: () => { PS7.logs.mate = true; readDoc7('mate7', 'AURELIA · MATE\'S LOG', ['03:10. Grounded on a shoal that isn\'t on the chart.', 'The skipper says the chart is right and the sea is wrong.', '04:00. Radioed the Halcyon to ask what she saw. She read out the combination to her chart safe by mistake, as if it were a phone number. I only caught the middle. Two.', 'Then the line went to water.'], 'log'); tasks7(); } });
  I({ x: P.capLog[0], z: P.capLog[2], y: 0.9, r: 1.8, label: () => 'READ THE CAPTAIN\'S LOG', ok: () => G.state === 'play', act: () => { PS7.logs.cap = true; readDoc7('cap7', 'AURELIA · CAPTAIN\'S LOG', ['The soundings go 40, 40, 40, 12, 40.', 'Something went under the hull for an hour. We put every light out. It stayed.', '(last line) I\'ve kept the bridge lamp on. I would rather it knew where I was.'], 'log'); tasks7(); } });
  I({ x: P.shipBell[0], z: P.shipBell[2], y: 1.3, r: 1.8, label: () => 'RING THE SHIP\'S BELL', ok: () => G.state === 'play', act: () => { SFX7.bell(P9({ x: PL.x, y: 10, z: PL.z })); makeNoise(0.9); toast('IT CARRIES A LONG WAY', 2); if (AIS7.shadow && AIS7.shadow.st === 'patrol' && AIS7.shadow.d < 90) { AIS7.shadow.wp = { x: PL.x, z: PL.z }; } } });
  pickup7('flare1', P.flareShip, 'TAKE THE FLARE', () => { PS7.flares++; toast('A FLARE · ' + PS7.flares, 2); });
  // ===== habitat =====
  doc('fenlog', P.fenLog, 'READ THE DIVER\'S LOG', 'HABITAT ORCA-2 · DIVER\'S LOG', ['Day 1. Airline pressure fine.', 'Day 4. Airline pressure gone. Pocket air holding.', 'Day 6. Heard it go over. The habitat shook like a door.', 'Day 9. I talk to the cable. It talks back, a little.'], 'log');
  I({ x: P.airGauge[0], z: P.airGauge[2], y: 1.2, r: 1.9, label: () => 'READ THE AIR GAUGE', ok: () => G.state === 'play', act: () => { SFX.click(); toast(PS7.air ? 'AIR · LINE PRESSURE NORMAL' : 'AIR · LINE PRESSURE 0', 2.4); } });
  pickup7('flare2', P.flareHab, 'TAKE THE FLARE', () => { PS7.flares++; toast('A FLARE · ' + PS7.flares, 2); });
  // ===== the wreck =====
  doc('halcyon', P.halcyonLog, 'READ THE LAST RADIO LOG', 'HALCYON · LAST RADIO', ['Halcyon to anyone. Forty fathoms and a bottom that isn\'t.', 'The Cape Sorrel lens motor is in the chart safe. I am not reading the combination out on the air again.', 'Somebody tell Wren: I brought it as far as I could.'], 'log');
  for (let i = 0; i < 3; i++) { const q = P['dial' + i]; const it = I({ x: q[0], z: q[2], y: q[1], r: 1.1, label: () => PS7.safeOpen ? 'THE SAFE IS OPEN' : `TURN DIAL ${i + 1} · ${PS7.dial[i]}`, ok: () => G.state === 'play' && !PS7.safeOpen, act: () => turnDial7(i) }); }
  pickup7('motor', P.motor, 'TAKE THE LENS MOTOR', () => { PS7.motor = true; SFX.pickup(); toast('THE LENS MOTOR · HEAVY', 3); tasks7(); setPhase7(); cpSave('THE MOTOR'); }, () => PS7.safeOpen && !PS7.motor);
  // ===== the cape =====
  pickup7('clamp', P.clamp, 'TAKE THE CLAMP', () => { PS7.clamp = true; SFX.pickup(); toast('A SPLICE CLAMP', 2.2); tasks7(); setPhase7(); }, () => !PS7.clamp);
  doc('wrenphoto', P.wrenLog, 'LOOK AT THE PHOTOGRAPH', 'A PHOTOGRAPH', ['A man in oilskins on the gallery with a thermos, laughing at whoever holds the camera.', 'On the back: T., 1974. Don\'t let him say he didn\'t.'], 'note');
  doc('tomas', P.tomasLog, 'READ THE KEEPER\'S LOG', 'CAPE SORREL · KEEPER\'S LOG', ['EVERY NIGHT I TURN HER ONCE, AND IT GOES DOWN.', 'Every night since \'71.', 'The night I don\'t, I\'ll find out what it\'s for.', '(in a different hand:) I have not found out. — W.'], 'log');
  { const it = I({ x: P.junction.x, z: P.junction.z, y: P.junction.y, r: 2.2, label: () => PS7.cable ? 'THE JUNCTION · SPLICED' : !PS7.clamp ? 'THE JUNCTION · THE CABLE ENDS HERE' : !PS7.gen ? 'THE JUNCTION · THE LINE IS DEAD' : holdBusy(it) ? `SPLICING… ${holdPct(it)}%` : 'SPLICE THE CABLE', ok: () => G.state === 'play' && !PS7.cable, act: () => splice7(it) }); }
  { const it = I({ x: P.lampPanel[0], z: P.lampPanel[2], y: 1.1, r: 2.0, label: () => lampLabel7(it), ok: () => G.state === 'play' && !PS7.lit, act: () => lampPanel7(it) }); }
  // ===== the pier =====
  doc('shed', P.shedBench, 'READ THE NOTICE', 'BOATHOUSE · NOTICE', ['THE MARLIN IS FUELLED AND READY.', 'Keys are with the radio.', 'Do not take her out in the dark.'], 'board');
  doc('keyhook', P.keyHook, 'LOOK AT THE KEY BOARD', 'KEYS', ['One hook is empty. The tag says MARLIN.'], 'note');
  doc('jackets', P.jackets, 'COUNT THE LIFE JACKETS', 'LIFE JACKETS', ['FOUR PEGS. THREE JACKETS.', '(the fourth peg has a name in marker: DAV)'], 'note');
  doc('fish', P.fishTable, 'LOOK AT THE TABLE', 'A TABLE', ['A row of cleaned fish. Nobody has been cleaning them.'], 'note');
  pickup7('flare3', P.flarePier, 'TAKE THE FLARE', () => { PS7.flares++; toast('A FLARE · ' + PS7.flares, 2); });
  pickup7('flare4', P.flareCape, 'TAKE THE FLARE', () => { PS7.flares++; toast('A FLARE · ' + PS7.flares, 2); });
  I({ x: P.dinghy.x, z: P.dinghy.z, y: 0.9, r: 3.4, label: () => PS7.taken.dinghy ? 'DAV\'S DINGHY · SEARCHED' : 'SEARCH THE DINGHY', ok: () => G.state === 'play' && !PS7.taken.dinghy, act: () => { PS7.taken.dinghy = true; PS7.logs.dinghy = true; PS7.flares += 2; SFX.pickup(); readDoc7('dav7', 'A VOICE RECORDER · THE DINGHY', ['Dav. Third attempt. The outboard floods in the dark, it only runs near the lamps.', 'I can hear the cable from out here. It hums when the buoys come on. It hums lower when they don\'t.', 'If this is found: tell Kell I took the last of the flares and I\'m sorry about the dinghy. I\'m going to drift. It\'s warm out here.'], 'log'); toast('TWO FLARES · ' + PS7.flares, 2.4); tasks7(); } });
  I({ x: P.boatBoard.x, z: P.boatBoard.z, y: 1.4, r: 2.4, label: () => !PS7.lit ? 'THE MARLIN · DON\'T TAKE HER OUT IN THE DARK' : !PS7.key ? 'THE MARLIN · NO KEY' : 'BOARD THE MARLIN · SAIL', ok: () => G.state === 'play', act: () => boardBoat7() });
  I({ x: P.deepCable.x, z: P.deepCable.z, y: 0.4, r: 3.2, label: () => PS7.lit ? 'FOLLOW THE CABLE DOWN' : 'A BLACK CABLE GOES STRAIGHT DOWN', ok: () => G.state === 'play', act: () => followCable7() });
  I({ get x() { return AIS7.wren ? AIS7.wren.x : 0; }, get z() { return AIS7.wren ? AIS7.wren.z : 0; }, y: 0.5, r: 2.2, label: () => 'SIT WITH WREN · THE SECOND COLUMN', ok: () => G.state === 'play' && PS7.lit && PS7.wrenLit && near7(AIS7.wren, 3.2), act: () => keep7() });
}
function readDoc7(k, title, lines, kind) { SFX.click(); readDoc(k, title, lines, { kind }); const m = { cook: 'cook', mate7: 'mate', cap7: 'cap', halcyon: 'halcyon', tomas: 'tomas', fenlog: 'fenlog', kelllog: 'kelllog', bunknote: 'dav' }[k]; if (m) PS7.logs[m] = true; tasks7(); }
// a thing on the floor you can take: a small emissive item with an interact
function pickup7(k, p, label, fn, okf) {
  const it = { x: p.x, z: p.z, y: p.y ?? 0.4, r: 1.8, label: () => label, ok: () => G.state === 'play' && !PS7.taken[k] && (!okf || okf()), act: () => { PS7.taken[k] = true; if (it.mesh) it.mesh.setEnabled(false); SFX.pickup(); fn(); } };
  const m = mkMerged(W.itemMat, Q => { Q('Box', { width: 0.3, height: 0.12, depth: 0.14 }, k.startsWith('flare') ? [0.9, 0.18, 0.1] : k === 'motor' ? [0.5, 0.52, 0.5] : [0.8, 0.75, 0.2], 0.5, [0, 0, 0]); }, 'pick7'); m.position.set(p.x, (p.y ?? 0.4) - 0.28, p.z); m.rotation.y = rnd(0, 3); it.mesh = m; W.interact.push(it); return it;
}
// ----- the rig's machines -----
function startGen7(it) {
  if (PS7.gen || holdBusy(it)) return; if (!PS7.met) { toast('THERE IS A MAN IN THE RADIO SHACK · TALK TO HIM FIRST', 2.6); return; } PS7.told = true; SFX7.genStart(P9({ x: it.x, y: 1.2, z: it.z })); makeNoise(0.6);
  holdStart(it, 4, () => {
    PS7.gen = true; GS7.stormTo = 0.8; for (const b of WS7.buoys) { b.on = true; b.lamp.setEnabled(true); } SFX7.genHum(P9(it)); FX.glitch = 0.6; PL.shake = 0.6; toast('THE GENERATOR IS RUNNING · THE BUOYS COME ON', 3);
    later(1.5, () => say('PA', 'Power restored on Meridian. All hands to stations.', { dur: 4 })); later(8, () => say('PA', 'Weather advisory. Secure all loose equipment.', { dur: 4 }));
    later(3, () => sayK7('That\'s her running. Hear that? First noise on here I didn\'t make.', { radio: true, pos: null })); later(9, () => sayK7('Air house next. Northeast corner, red wheel. There\'s a man on that line.', { radio: true, pos: null }));
    later(14, () => say(OUT7, 'Nine. We saw a light come on near you. We have nothing on that level.', { radio: true }));
    tasks7(); setPhase7(); cpSave('THE GENERATOR');
  }, { r: 2.4, cancel: 'IT STALLS', noise: 0.5 });
}
function openAir7(it) {
  if (PS7.air || holdBusy(it)) return; if (!PS7.gen) { toast('NO POWER TO THE COMPRESSOR', 2); return; } SFX7.valve(P9({ x: it.x, y: 1.2, z: it.z }));
  holdStart(it, 4, () => { PS7.air = true; SFX7.airOn(P9(it)); toast('AIR · HABITAT 2 · LINE OPEN', 2.8); later(1.2, () => say('PA', 'Air supply restored to Habitat Two.', { dur: 4 })); later(4, () => sayK7('He\'ll be shouting for you by now. Down the north side and keep going. Don\'t be clever.', { radio: true, pos: null })); tasks7(); setPhase7(); cpSave('AIR ON'); }, { r: 2.4, cancel: 'YOU LET GO OF THE WHEEL', noise: 0.3 });
}
function fillFuel7(it) {
  if (PS7.fuel || holdBusy(it)) return; if (!PS7.can) { toast('YOU NEED A CAN', 1.8); return; } SFX7.valve(P9({ x: it.x, y: 1, z: it.z }));
  holdStart(it, 4, () => { PS7.fuel = true; SFX.pickup(); toast('THE CAN IS FULL · HEAVY · CARRY IT TO THE LAMP ROOM', 3); tasks7(); setPhase7(); cpSave('FUEL'); }, { r: 2.4, cancel: 'THE PUMP LOSES ITS PRIME', noise: 0.3 });
}
function turnDial7(i) {
  PS7.dial[i] = (PS7.dial[i] + 1) % 10; SFX7.safe(P9(WS7.pos['dial' + i] ? { x: WS7.pos['dial' + i][0], y: 0, z: WS7.pos['dial' + i][2] } : PL)); const m = WS7.dialMeshes[i]; if (m) m.rotation.z += 0.628;
  if (PS7.dial[0] === 4 && PS7.dial[1] === 2 && PS7.dial[2] === 7) { PS7.safeOpen = true; SFX7.safeOpen(P9(WS7.pos.safe)); toast('THE SAFE IS OPEN', 2.4); if (WS7.safeDoor) { WS7.safeDoor.rotation.y += 1.8; } tasks7(); setPhase7(); }
}
function splice7(it) {
  if (PS7.cable || holdBusy(it)) return; if (!PS7.clamp) { toast('THE CABLE ENDS HERE · YOU HAVE NO CLAMP', 2.4); return; } if (!PS7.gen) { toast('THE LINE IS DEAD · THE RIG IS DARK', 2.4); return; }
  holdStart(it, 4, () => { PS7.cable = true; if (WS7.cableFix) WS7.cableFix.setEnabled(true); SFX7.genHum(P9(it)); toast('THE CABLE IS LIVE', 2.4); tasks7(); setPhase7(); cpSave('THE CABLE'); }, { r: 2.6, cancel: 'YOU LET GO OF THE CLAMP', noise: 0.1 });
}
function lampLabel7(it) {
  if (holdBusy(it)) return `LIGHTING… ${holdPct(it)}%`;
  if (PS7.fuel && !PS7.fuelSeated) return 'POUR THE FUEL INTO THE BURNER';
  if (PS7.motor && !PS7.motorSeated) return 'SEAT THE LENS MOTOR';
  if (PS7.cable && !PS7.cableSeated) return 'CONNECT THE CABLE';
  if (partsDone7() >= 3) return 'LIGHT THE LAMP';
  return `THE LAMP PANEL · ${partsDone7()}/3 · FUEL · MOTOR · CABLE`;
}
function lampPanel7(it) {
  if (holdBusy(it)) return;
  if (PS7.fuel && !PS7.fuelSeated) { PS7.fuelSeated = true; SFX7.valve(P9({ x: it.x, y: 17, z: it.z })); toast('FUEL · SEATED · ' + partsDone7() + '/3', 2.4); tasks7(); setPhase7(); cpSave('FUEL SEATED'); return; }
  if (PS7.motor && !PS7.motorSeated) { PS7.motorSeated = true; SFX7.safe(P9({ x: it.x, y: 17, z: it.z })); toast('MOTOR · SEATED · ' + partsDone7() + '/3', 2.4); tasks7(); setPhase7(); cpSave('MOTOR SEATED'); return; }
  if (PS7.cable && !PS7.cableSeated) { PS7.cableSeated = true; SFX7.genHum(P9({ x: it.x, y: 17, z: it.z })); toast('CABLE · LIVE · ' + partsDone7() + '/3', 2.4); tasks7(); setPhase7(); cpSave('CABLE SEATED'); return; }
  if (partsDone7() < 3) { SFX.click(); toast(`THE PANEL IS MISSING ${3 - partsDone7()} · FUEL · MOTOR · CABLE`, 2.6); return; }
  SFX7.lensMotor(P9({ x: it.x, y: 17, z: it.z })); makeNoise(0.2);
  holdStart(it, 5, () => lightLamp7(), { r: 2.6, cancel: 'YOU LET GO OF THE LEVER', noise: 0.1 });
}
function lightLamp7() {
  PS7.lit = true; GS7.litEver = true; GS7.dawnTo = 1; GS7.stormTo = 0; SFX7.lampOn(P9({ x: PL.x, y: 18, z: PL.z })); FX.glitch = 1.2; PL.shake = 0.8; if (WS7.lensGlow) WS7.lensGlow.setEnabled(true); if (WS7.lampGlass) { WS7.lampGlass.visibility = 0.9; }
  toast('THE LAMP IS LIT', 3.4); say('PA', 'Cape Sorrel light is operating.', { dur: 4 });
  later(3, () => { const sh = AIS7.shadow; if (sh) { sh.show(); SFX7.shadowPass(P9({ x: PL.x, y: 0, z: PL.z })); } toast('SOMETHING VERY LARGE GOES DOWN UNDER THE LIGHT', 3.6); PL.shake = 1.0; });
  later(9, () => say(OUT7, 'Nine. Keep the tape running. That is the first light we have had on you.', { radio: true })); later(12, () => { PS7.kellLit = PS7.fenLit = PS7.wrenLit = true; });
  tasks7(); setPhase7(); cpSave('THE LAMP IS LIT');
}
// ----- the endings -----
function boardBoat7() {
  if (!PS7.lit) { toast('NOT IN THE DARK · KELL SAID', 2.2); return; } if (!PS7.key) { toast('THE KEY IS WITH KELL', 2.4); return; }
  SFX37.splashSoft(); win7('sail');
}
function followCable7() {
  if (!PS7.lit) { toast('A BLACK CABLE · IT GOES DOWN WITHOUT A BREAK', 2.6); return; }
  toast('YOU TAKE A BREATH', 1.6); later(0.8, () => win7('deep'));
}
function keep7() { PS7.stayed = true; sayW7('Sit. The pen is on the log. Second column.', { dur: 3.4 }); later(3, () => win7('keeper')); }
// ----- people -----
function talk7(k) { ({ kell: talkKell7, wren: talkWren7, fen: talkFen7 })[k](); }
function hint7() {
  if (!PS7.gen) return 'The generator. Grey house, east side of the deck.';
  if (!PS7.air) return 'The air house. Northeast corner of the deck, red wheel.';
  if (!PS7.fenMet) return 'Fen is in Habitat Two. North of the rig, nine metres down.';
  if (!PS7.fuel) return 'Fuel is on the Aurelia, the ship on the shoal west of the rig. The can is on her deck, the tank is in her engine room.';
  if (!PS7.motor) return 'The motor is in the safe on the Halcyon\'s bridge. North-west of the rig, ten metres down.';
  if (!PS7.clamp) return 'Wren has a clamp. The cape is south of the rig. Keep to the buoys.';
  if (!PS7.cable) return 'The cable is parted west of the cape, on the seabed.';
  return 'Take it all up the tower, to the lamp room.';
}
function talkKell7() {
  const A = (t, d = 0) => later(d, () => sayK7(t)), T = PS7.topics;
  if (!PS7.met) {
    PS7.met = true; setPhase7(); A('Mind the door. The wind takes it.'); A('Kell. Radio. Meridian has had one man on it for eleven days. That is a count, not a complaint.', 3.6); A('You came off a raft. I watched the light on it for an hour before it got here.', 9.4);
    later(12, () => { setPhase7('rig'); cpSave('THE RIG'); }); return;
  }
  if (PS7.lit && !PS7.key) { PS7.key = true; SFX37.splashSoft(); A('The lamp. I saw it from the shack. I haven\'t seen that colour since I came.'); A('Here. The boat key. She\'s fuelled. I did that the first day, in case.', 4.6); A('Or don\'t go. I\'ve got the radio.', 9); later(6, () => { toast('THE MARLIN KEY', 2.4); tasks7(); setPhase7(); }); return; }
  if (!T.lamp) { T.lamp = true; PS7.told = true; A('There\'s a lighthouse south. Cape Sorrel. Wren keeps it. She says it has been dark a year.'); A('She says it wants three things. Fuel, a motor, and a cable. I don\'t know what she means by cable.', 4.4); A('The buoys run out to it. They\'re on the generator. Grey house, east side of the deck.', 11); later(15, () => { tasks7(); setPhase7(); }); return; }
  if (!T.fen) { T.fen = true; A('There\'s a diver in Habitat Two. Fen. Seabed, north of us, nine metres down.'); A('I can\'t raise him. I don\'t know if that\'s the radio or him.', 5.4); return; }
  if (!T.flare) { T.flare = true; A('There are flares on the helipad. Take them.'); A('It won\'t stop it. It makes it think about it.', 3.2); A('Don\'t swim in the open dark. If you have to, bring a light with you.', 6.4); return; }
  if (PS7.lit && !PS7.key) {
    PS7.key = true; SFX37.splashSoft(); A('The lamp. I saw it from the shack. I haven\'t seen that colour since I came.'); A('Here. The boat key. She\'s fuelled. I did that the first day, in case.', 4.6); A('Or don\'t go. I\'ve got the radio.', 9); later(6, () => { toast('THE MARLIN KEY', 2.4); tasks7(); setPhase7(); }); return;
  }
  if (PS7.lit) { A(pick(['Go on, then. Or sit. The kettle\'s hot.', 'I\'ll hold the radio. Somebody should.', 'The wind\'s gone. I keep checking the window.'])); return; }
  A(pick([hint7(), hint7(), 'Keep to the buoys.', 'Is it raining out there? The window\'s salt, I can\'t tell.']));
}
function talkWren7() {
  const A = (t, d = 0) => later(d, () => sayW7(t)), T = PS7.topics;
  if (!PS7.wrenMet) {
    PS7.wrenMet = true; A('Wipe your feet. There is no floor under the mat, it is all rock.'); A('Wren. Keeper. The lamp has been out since the Aurelia went onto the shoal.', 4.6); A('Kell said you were coming. He never says that about anyone.', 9.4); later(11, () => { tasks7(); }); return;
  }
  if (PS7.lit && !T.lit) { T.lit = true; A('There she goes.'); A('Look at the water. It has gone down. It does, for a while.', 2.4); A('Tomas turned her every night for forty years. I turned her for eleven.', 7); A('The log has two columns. One\'s mine. I\'d like the other filled in.', 12); return; }
  if (!T.parts) { T.parts = true; A('Fuel for the burner is in the Aurelia\'s engine room. The motor for the lens went down with the Halcyon.'); A('The lamp takes its power from the rig by a cable under the sea. It parted west of the rock, a few fathoms down.', 6.4); A('The clamp is on my table. Take it.', 12.4); later(13, () => tasks7()); return; }
  if (!T.splice) { T.splice = true; A('You splice it by hand, down there. Do not let go halfway.'); A('The tower door is on the north side. Ladder inside. Mind the third rung.', 6.4); return; }
  if (!T.why) { T.why = true; A('Ships went onto that shoal for fifty years with the lamp lit.'); A('I would like to know who it was lit for.', 5); return; }
  if (PS7.lit) { A(pick(['There is tea. There is a second chair. I am not asking.', 'Tomas would have liked you. He liked anyone who got wet.'])); return; }
  A(pick(['The cable, the fuel, the motor. In any order. Tell me when you have them.', 'Come up for air before you need it.', 'Don\'t swim out here after dark, if you can help it. I know.']));
}
function talkFen7() {
  const A = (t, d = 0) => later(d, () => sayF7(t)), T = PS7.topics;
  if (!PS7.air) { A('Is someone there? The air has gone thin. I can\'t think. The line first, please.'); return; }
  if (!PS7.fenMet) {
    PS7.fenMet = true; PS7.logs.fen = true; A('Is that a person? Say something. I\'ve been answering the cable.'); A('Fen. Diver. Nine days in a tin can, and the air only just came back. I could kiss the rig.', 3.2); A('Sit on the bench. Not the green one. The green one has been talking.', 9.6);
    later(12, () => { tasks7(); setPhase7(); cpSave('FEN'); }); return;
  }
  if (!T.safe) { T.safe = true; A('If it\'s something off the Halcyon, it\'ll be in her bridge safe. Her skipper and I used to talk on the radio.'); A('He read me his combination once, as a joke. I kept the first number. Four.', 4.6); A('The rest he gave to anyone who was listening.', 9.6); later(13, () => tasks7()); return; }
  if (!T.dark) { T.dark = true; A('It doesn\'t bite, mostly. It arrives. Be somewhere with a light on when it does.'); A('And don\'t take the lantern in the Halcyon. It isn\'t a lantern.', 5.2); return; }
  if (PS7.lit && !T.lit) { T.lit = true; A('The lamp! The whole water has gone gold. I can see it from here.'); A('I think I\'ll stay down a bit. Somebody ought to keep the habitat warm.', 4.4); return; }
  A(pick(['Take a flare. There\'s one on the rack.', 'Breathe out slowly on the way up. I say that to everyone.', 'Tell Kell the coffee here is better than his.']));
}
// ----- per frame -----
function places7Events(dt) {
  if (G.state !== 'play') return; updateLadder7(dt);
  const c = cell7(PL.x, PL.z), z = LV.zone[c], S = PS7.seen, enter = (k, txt, fn) => { if (!S[k]) { S[k] = true; toast(txt, 2.8); SFX.beep(1000, 0.05); fn && fn(); } };
  if (z === ZS7.RIG || z === ZS7.QUART) enter('rig', 'MERIDIAN');
  if (z === ZS7.SHIP || z === ZS7.SHIPIN) enter('ship', 'THE AURELIA · AGROUND');
  if (z === ZS7.CAPE || z === ZS7.TOWER || z === ZS7.COTTAGE) enter('cape', 'CAPE SORREL');
  if (z === ZS7.PIER || z === ZS7.SHED) enter('pier', 'THE PIER');
  if (z === ZS7.HAB) enter('hab', 'HABITAT ORCA-2');
  if (z === ZS7.WRECK || z === ZS7.POCKET) enter('wreck', 'THE HALCYON · TEN METRES', () => later(2, () => { const zz = LV.zone[cell7(PL.x, PL.z)]; if (!PS7.lit && (zz === ZS7.WRECK || zz === ZS7.POCKET)) toast('DON\'T TAKE THE LANTERN', 2.4); }));
  if (z === ZS7.LAMP) enter('lamp', 'THE LAMP ROOM');
  // a pocket of air in the wreck and the habitat: the breath comes back
  PS7.hintT += dt; if (PS7.hintT > 220 && PS7.met && !PS7.lit) { PS7.hintT = 0; say(OUT7, 'Nine. ' + hint7(), { radio: true }); }
}
function buildItems7(diff) {
  const mat = W.itemMat, cells = [];
  for (const k of ['rig', 'ship', 'islet', 'pier', 'gen', 'air', 'mess', 'radio', 'bunks', 'qcorr', 'galley', 'cabins', 'shed', 'cottage']) { const r = LV.dry[k]; if (r) for (const c of r.cells) if (LV.room[c] === r.id && LV.bas[c] < 0) cells.push(c); }
  shuffle(cells); const used = new Set();
  const place = type => {
    for (const c of cells) {
      if (used.has(c)) continue; used.add(c);
      const p = { x: cellCenter(c % N) + rnd(-1.1, 1.1), z: cellCenter((c / N) | 0) + rnd(-1.1, 1.1) }; collide(p, 0.3);
      if (cellOf(p.x) !== c % N || cellOf(p.z) !== ((c / N) | 0) || LV.bas[cell7(p.x, p.z)] >= 0) continue;
      const root = tnode(null, p.x, floorY37(p.x, p.z), p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, mat);
      const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
      return;
    }
  };
  for (let i = 0; i < [6, 5, 3][diff]; i++) place('battery');
  for (let i = 0; i < [9, 7, 4][diff]; i++) place('water');
}
// ----- endings -----
function flags7() { flag('ending7', GS7.ending); flag('parts7', partsDone7()); flag('logs7', logCount7()); flag('fen7', PS7.fenMet ? 'met' : ''); }
function endCard7() {
  const f = RUN.f, S = [];
  if (GS7.ending === 'keeper') {
    S.push('Wren writes today\'s date in the second column, in a hand that is not hers.');
    S.push('The lamp turns on its rock. The sea under it stays flat and gold.');
    if (PS7.fenMet) S.push('Far below, a diver puts a kettle on and talks to a cable.');
    if (f.ending2) S.push('The pipes in your sleeves still tick, a long way from where they were.');
    S.push('In the morning there is tea, and the log has one more line in it than it had.');
    return ['KEEPER', S.join(' ')];
  }
  if (GS7.ending === 'deep') {
    S.push('The cable goes down past the end of the gauge. The water gets warmer.');
    S.push('For a while the picture holds a long dark ridge, lit from below.');
    S.push('Somewhere above, the lamp turns and the sea under it lies flat.');
    S.push('The tape runs on, and so does the cable.');
    return ['THE DEEP', S.join(' ')];
  }
  S.push('The Marlin starts on the second pull. Behind you the lamp turns on its rock, and the sea beneath it is flat and lit all the way down.');
  if (PS7.fenMet) S.push('A line of bubbles comes up far off the stern, then stops.');
  if (f.ending37 === 'surface') S.push('Your sleeves are still dry from the first time.');
  if (logCount7() >= 5) S.push('The tape has every log and note they left.');
  S.push('The fog takes the light at about the third mile. The camera is still running.');
  return ['THE CROSSING', S.join(' ')];
}
function cpRespawn7() {
  const s = AIS7.shadow; if (s && s.st !== 'sleep') s.scare(30); GS7.climb = null; G37.breath = 1; G37.falling = false; G37.vy = 0; G37.under = false; FX.under = 0;
  const c = cell7(PL.x, PL.z), fh = LV.fh[c], b = LV.bas[c], W0 = b >= 0 ? LV.basins[b].y : -99, wet = b >= 0 && W0 - fh > 1.3; G37.ey = wet ? W0 + 0.22 : fh + 1.62;
  for (const f of AIS7.fish) { f.st = 'lurk'; f.aggroed = false; f.wp = null; if (f.d < 25 && f.cells.length) { const far = f.cells.filter(k => dist2(cellCenter(k % N), cellCenter((k / N) | 0), PL.x, PL.z) > 28); if (far.length) { const k = pick(far); f.place(cellCenter(k % N), cellCenter((k / N) | 0), rnd(0, TAU)); } } }
}
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { PS7, talk7, turnDial7, startGen7, openAir7, fillFuel7, splice7, lampPanel7, lightLamp7, boardBoat7, followCable7, keep7, endCard7, obj7, hint7, partsDone7, resetPS7, climb7, lit7, updateLadder7 }));
// r10: Level 7 voice. A line whose text is in the voice bank (voicebank7.js) plays its clip with the subtitle.
{ const say7raw = say; say = function (who, text, o = {}) { if (LVL === 7 && !o.vo && typeof VOX7 !== 'undefined' && VOX7[text]) o = Object.assign({}, o, { vo: VOX7[text] }); return say7raw(who, text, o); }; }
