// ---------- r9 · Level 2 story: the phones, Ida, the three regulators, the breakers, Benny, the lift, the two endings ----------
// Written with the backrooms-dialogue skill. See docs/LEVEL2.md for the line ledger and new canon.
const PP2 = {};
function resetPP2() {
  for (const k of Object.keys(PP2)) delete PP2[k];
  Object.assign(PP2, { phoneMet: false, met: false, step: 0, surgesOn: false, regs: { w: false, n: false, e: false }, power: false, crowbar: false, wheel: false, wheelFit: false, valveOpen: false, idcard: false, idGiven: false, timecard: false,
    logs: {}, bennyHeard: false, bennyStep: 0, order: shuffle([1, 2, 3, 4]), pulled: [], tapped: false, liftReady: false, liftOpen: false, pending: [], hintT: 0, seen: {}, idaFront: false, topics: {}, vend: {} });
}
resetPP2();
const IDA_P = () => AIP2.ida ? { x: AIP2.ida.x, z: AIP2.ida.z } : null;
function sayIda2(t, o = {}) { say('IDA', t, Object.assign({ pos: o.phone ? null : IDA_P(), radio: !!o.phone, dur: 4 }, o)); }
function sayBenny2(t, o = {}) { say('BENNY', t, Object.assign({ pos: WP2.pos.benny, dur: 4 }, o)); }
const regsDone2 = () => (PP2.regs.w ? 1 : 0) + (PP2.regs.n ? 1 : 0) + (PP2.regs.e ? 1 : 0);

// ----- objectives -----
// phases only move forward (a delayed call from an earlier conversation must not undo a later one)
const PH2 = ['arrive', 'office', 'regs'];
function setPhase2(p) { if (p && PH2.indexOf(p) >= PH2.indexOf(GP2.phase)) GP2.phase = p; objective(obj2()); tasks2(); }
function obj2() {
  if (PP2.liftOpen) return 'RIDE THE LIFT UP';
  if (PP2.liftReady) return 'THE GAMMA LIFT · NORTH-EAST OF THE SWITCHYARD';
  switch (GP2.phase) {
    case 'arrive': return PP2.phoneMet ? 'THE BOILER OFFICE · NORTH ALONG THE PIPE' : 'ANSWER THE PHONE';
    case 'office': return 'TALK TO IDA · THE BOILER OFFICE';
    case 'regs': return `SHUT THE REGULATORS · ${regsDone2()}/3`;
  }
  return '';
}
function tasks2() {
  task('phone', 'ANSWER THE PHONE', { quiet: true }); if (PP2.phoneMet) taskDone('phone', 'THE PHONE · IDA', true);
  if (PP2.phoneMet) { task('office', 'THE BOILER OFFICE', { quiet: true }); if (PP2.met) taskDone('office', 'IDA · THE BOILER OFFICE', true); }
  if (PP2.step >= 3) {
    task('regs', `THE REGULATORS · ${regsDone2()}/3`, { quiet: true, sub: 'TURN EACH ONE FULLY CLOSED' }); if (regsDone2() >= 3) taskDone('regs', 'ALL THREE REGULATORS', true);
    task('rw', 'REGULATOR W · THE LOW GALLERIES (WEST)', { quiet: true, sub: 'THE FAR SOUTH-WEST CORNER' }); if (PP2.regs.w) taskDone('rw', 'REGULATOR W · SHUT', true);
    task('power', 'POWER · THE SWITCHYARD BREAKERS (NORTH)', { quiet: true, sub: PP2.tapped ? 'THE FOREMAN TAPPED THE ORDER' : 'WATCH THE FOREMAN' }); if (PP2.power) taskDone('power', 'THE BREAKERS · ON', true);
    task('rn', 'REGULATOR N · THE SWITCHYARD', { quiet: true, sub: PP2.power ? '' : 'NEEDS POWER FIRST' }); if (PP2.regs.n) taskDone('rn', 'REGULATOR N · SHUT', true);
    task('re', 'REGULATOR E · THE END OF THE LONG PIPE (EAST)', { quiet: true, sub: PP2.wheel ? (PP2.wheelFit ? '' : 'FIT THE WHEEL') : PP2.valveOpen ? 'BENNY HAS THE WHEEL' : 'THE VALVE ROOM DOOR IS JAMMED' }); if (PP2.regs.e) taskDone('re', 'REGULATOR E · SHUT', true);
    if (PP2.bennyHeard || PP2.crowbar) { task('crowbar', 'A BAR FOR THE VALVE ROOM DOOR', { quiet: true, opt: true, sub: 'THE GAMMA TEAM\'S STORE · WEST' }); if (PP2.crowbar) taskDone('crowbar', 'THE CROWBAR', true); }
    if (PP2.logs.l1 || PP2.logs.l2 || PP2.logs.l3) { const n = Object.keys(PP2.logs).length; task('gamma', `GAMMA TEAM · ${n}/3 LOGS`, { quiet: true, opt: true }); if (n >= 3) taskDone('gamma', 'GAMMA TEAM · ALL THREE LOGS', true); }
    if (PP2.idcard) { task('idc', 'THE ID CARD · I. MULCAHY', { quiet: true, opt: true, sub: 'SHOW IT TO IDA' }); if (PP2.idGiven) taskDone('idc', 'IDA · THE CARD', true); }
  }
  if (PP2.liftReady) { task('lift', 'THE GAMMA LIFT', { quiet: true }); if (PP2.liftOpen) taskDone('lift', 'THE LIFT IS OPEN', true); }
}
function target2() {
  const P = WP2.pos;
  if (PP2.liftOpen) return P.liftCar;
  if (PP2.liftReady) return P.liftPanel;
  if (!PP2.phoneMet) return WP2.phones.find(p => p.key === 'sump');
  if (!PP2.met) return IDA_P();
  if (PP2.step < 3) return IDA_P();
  const z = LV.reg[cell2(PL.x, PL.z)];
  const west = () => PP2.regs.w ? null : P.wreg, north = () => PP2.regs.n ? null : (!PP2.power ? (PP2.tapped ? P.bank : P.foreman) : P.nreg);
  const east = () => PP2.regs.e ? null : (PP2.wheel ? P.ereg : PP2.valveOpen ? P.benny : PP2.crowbar ? P.valveDoor : (PP2.bennyHeard ? P.crowbar : P.valveDoor));
  const pick_ = z === R2Z.WEST ? west() || north() || east() : z === R2Z.NORTH ? north() || east() || west() : z === R2Z.EAST ? east() || west() || north() : west() || north() || east();
  return pick_;
}

// ----- arrival -----
function arrive2() {
  later(3.5, () => ringPhone2('sump', ['Pick that up.']));
  later(18, () => say(OUT9, 'Nine. Camera, you dropped off our board an hour ago. You\'re reading hot.', { radio: true }));
  if (flag('hale9') === 'saved') later(40, () => say(HALE_R, 'Hale. It is warm where you are. Drink before you are thirsty.', { radio: true }));
}
// ----- phones: Ida rings the one nearest you when she has something to say; any phone gets you a hint -----
function ringPhone2(key, lines) {
  PP2.pending.push(...lines);
  let ph = key && WP2.phones.find(p => p.key === key);
  if (!ph) { let best = 1e9; for (const p of WP2.phones) { const d = dist2(p.x, p.z, PL.x, PL.z); if (d < best) { best = d; ph = p; } } }
  if (!ph) return; ph.ring = 14; SFX2.ring({ x: ph.x, y: 1.6, z: ph.z, pl: { x: PL.x, z: PL.z } }); makeNoise(0.1);
}
function usePhone2(ph) {
  SFX2.pickup(); ph.ring = 0;
  if (!PP2.phoneMet) {
    PP2.phoneMet = true; PP2.pending = [];
    sayIda2('There you are. You came up the sump drain. Nobody comes up the sump drain.', { phone: true });
    if (flag('ending37') === 'surface') sayIda2('You smell of chlorine. I can smell it down the line.', { phone: true, delay: 0.2 });
    sayIda2('Walk north along the pipe. Door says Boiler Office. I\'ll be at the gauges.', { phone: true, delay: 0.4 });
    later(2, () => { setPhase2('arrive'); cpSave('THE PHONE'); }); return;
  }
  if (PP2.pending.length) { for (const l of PP2.pending.splice(0)) sayIda2(l, { phone: true }); return; }
  sayIda2(hint2(), { phone: true });
}
function hint2() {
  if (!PP2.met) return 'Office. North. I\'m not going anywhere.';
  if (PP2.step < 3) return 'Come and see me. I don\'t say it twice on the phone.';
  if (GP2.heat > 0.6) return 'You\'re breathing hard. Cold store. Sit with the door shut a minute.';
  if (!PP2.regs.w) return 'Go west, to the galleries. Mind the water, it\'s hotter than it looks.';
  if (!PP2.power) return 'The Switchyard crew will show you the breakers. Watch the foreman\'s hands.';
  if (!PP2.regs.n) return 'You\'ve got power. North regulator\'s in the cage by the cabinets.';
  if (!PP2.crowbar && !PP2.valveOpen) return 'The valve room door sticks. There\'s a bar in the Gamma Team\'s store, west.';
  if (!PP2.regs.e) return 'East. End of the Long Pipe. Light on it, don\'t run.';
  return 'The lift. Go on.';
}
// ----- Ida, in person -----
function idaLabel2() { if (PP2.idcard && !PP2.idGiven && PP2.met && PP2.step >= 3) return 'SHOW IDA THE ID CARD'; return 'TALK TO IDA'; }
function idaFront2() { sayIda2('Don\'t come round the front.'); later(3.2, () => { if (AIP2.ida && AIP2.ida.d < 2.2) sayIda2('I said don\'t.'); }); }
function talkIda2() {
  const A = (t, d = 0) => later(d, () => sayIda2(t));
  if (!PP2.met) {
    PP2.met = true; PP2.phoneMet = true; PP2.step = 1; setPhase2('office');
    A('Stop at the cot. I\'m working.'); A('Ida. Night engineer. I\'ve been on nights a long time.', 3.2); A('You\'ll want the lift. Everyone wants the lift.', 7.4);
    later(9, () => { setPhase2('office'); cpSave('THE BOILER OFFICE'); }); return;
  }
  if (PP2.step === 1) {
    PP2.step = 2; A('The lift runs on two things it hasn\'t had in years. Power, and the pressure down.'); A('Power\'s in the Switchyard, north. The crew know which breakers. They won\'t tell you. They\'ll show you.', 4.6);
    A('Pressure is three regulators. West in the galleries, north in the Switchyard, east at the end of the Long Pipe.', 10.5); return;
  }
  if (PP2.step === 2) {
    PP2.step = 3; A('Shut each one. All the way. I\'ll see it on the gauges.'); A('When the pipes knock three times, get in a shelter. Green lamp. The steam doesn\'t care what you\'re doing.', 3.8);
    later(10, () => { PP2.surgesOn = regsDone2() < 3; GP2.surgeT = 50; setPhase2('regs'); cpSave('THE REGULATORS'); toast('NEW OBJECTIVE · THREE REGULATORS', 2.8); }); return;
  }
  if (PP2.idcard && !PP2.idGiven) {
    PP2.idGiven = true; SFX.click(); A('Where did you find that.'); A('Keep it.', 3.4); A('No. Take it up with you. Somebody up there should have it.', 5.6); later(7, () => tasks2()); return;
  }
  const T = PP2.topics, n = regsDone2();
  if (Object.keys(PP2.logs).length >= 2 && !T.gamma) { T.gamma = true; A('You\'ve been in their store. Did they leave the stove on?'); A('They always left the stove on.', 3.6); return; }
  if (PP2.valveOpen && !T.benny) { T.benny = true; A('Benny\'s out? He\'ll want you to tell me the coffee was terrible.'); A('It was.', 3.6); return; }
  if (n >= 3) { A(pick(['Go on up. I\'ve got the gauges.', 'It\'s quiet. I don\'t like it quiet. Go on.'])); return; }
  A(pick([hint2(), 'Drink something cold.', 'Keep out of the steam.', 'I can hear you dripping on my floor.']));
}
// ----- the Gamma Team's store: logs, the crowbar, the card -----
const GAMMA2 = {
  l1: ['GAMMA TEAM · DAY 4', 'Pressure in the galleries reads wrong in a consistent way. The night engineer says that\'s how it\'s supposed to be wrong.', 'Hollis wants to vent the whole system. Mulcahy says you don\'t vent a heart.', 'Nobody asked her what she meant.'],
  l2: ['DAY 9', 'Two of the crew have stopped taking their helmets off.', 'Hollis says it\'s the heat.', 'It isn\'t the heat. Their faces are fine. I mean they\'re there. I checked.'],
  l3: ['DAY 15', 'Mulcahy went on nights. She says somebody has to watch the gauges.', 'We\'re going up without her. If you read this: she isn\'t being difficult.', 'She just doesn\'t look like her photo any more.'],
};
function readLog2(k, title) { PP2.logs[k] = true; SFX.click(); readDoc('gamma2' + k, title, GAMMA2[k], { kind: 'log' }); tasks2(); if (Object.keys(PP2.logs).length === 3) cpSave('GAMMA TEAM'); }
function takeCrowbar2() { PP2.crowbar = true; SFX.pickup(); toast('A CROWBAR · RED, CHIPPED', 2.4); if (WP2.crowbarMesh) WP2.crowbarMesh.setEnabled(false); tasks2(); setPhase2(); cpSave('THE CROWBAR'); }
function takeId2() { PP2.idcard = true; SFX.pickup(); readDoc('id2', 'M.E.G. · FIELD ENGINEER', ['I. MULCAHY · NIGHTS', '(the photo is of a woman with dark hair, pinned back. Where her face should be, the print has worn to white.)'], { kind: 'note' }); if (WP2.idMesh) WP2.idMesh.setEnabled(false); tasks2(); }
// ----- the regulators -----
function regLabel2(k) {
  if (PP2.regs[k]) return 'REGULATOR ' + k.toUpperCase() + ' · SHUT';
  if (k === 'n' && !PP2.power) return 'REGULATOR N · NO POWER';
  if (k === 'e' && !PP2.wheelFit) return PP2.wheel ? 'FIT THE VALVE WHEEL' : 'REGULATOR E · THE WHEEL IS MISSING';
  return 'SHUT REGULATOR ' + k.toUpperCase();
}
function useReg2(k, it) {
  if (PP2.regs[k] || holdBusy(it)) return;
  if (k === 'n' && !PP2.power) { SFX2.spark(P9(it)); toast('THE CAGE IS DEAD · NO POWER', 2); return; }
  if (k === 'e' && !PP2.wheelFit) { if (!PP2.wheel) { toast('THE SPINDLE IS BARE · SOMEBODY TOOK THE WHEEL', 2.4); return; } PP2.wheelFit = true; SFX2.lever(P9(it)); toast('THE WHEEL GOES ON', 1.8); if (WP2.ewheel) WP2.ewheel.setEnabled(true); tasks2(); return; }
  SFX2.valve(P9(it)); makeNoise(0.35);
  holdStart(it, 4, () => {
    PP2.regs[k] = true; GP2.regs = regsDone2(); SFX2.pressureDrop(P9(it)); PL.shake = 0.5; toast('REGULATOR ' + k.toUpperCase() + ' · SHUT · ' + GP2.regs + '/3', 2.6);
    if (GP2.surge) endSurge2();
    const L = { w: ['West is shut. I felt that one in my teeth.'], n: ['North is shut. Good crew up there.'], e: ['East is shut. Is Benny with you? Don\'t answer, I can hear him.'] }[k];
    if (GP2.regs >= 3) { L.push('That\'s all three. It\'s gone quiet. Lift\'s live.'); later(2, () => liftReady2()); }
    later(2.5, () => ringPhone2(null, L)); tasks2(); setPhase2(); cpSave('REGULATOR ' + k.toUpperCase());
  }, { r: 2.6, cancel: 'YOU LET GO OF THE WHEEL', noise: 0.3, tick: dt => { const w = WP2.regWheels[k]; if (w) w.rotation.z += dt * 2.2; } });
}
// ----- the Switchyard: the foreman taps the order, you throw the breakers -----
function watchForeman2() {
  if (PP2.power) return; if (PP2.step < 3) { foremanNo2(); return; } const P = WP2.pos.tapPipe, o = PP2.order; PP2.tapped = true; tasks2();
  let t = 0.6; const dots = o.map(n => '·'.repeat(n));
  for (let i = 0; i < 4; i++) { const n = o[i]; later(t, () => SFX2.tap({ x: P.x, y: 1.4, z: P.z, pl: { x: PL.x, z: PL.z } }, n)); t += n * 0.3 + 1.0; }
  say('THE FOREMAN', dots.join('    '), { dur: t + 1.5 });
  later(t + 0.6, () => { if (!PP2.forTip) { PP2.forTip = true; toast('THE BREAKERS ARE NUMBERED 1 TO 4', 2.6); } });
}
// before Ida has sent you, the crew won't let you near the bank (the order, the power and the phone call all assume she has)
function foremanNo2() { SFX2.lever(P9(WP2.pos.bank)); toast('THE FOREMAN PUTS HIS HAND FLAT ON THE BANK', 2.4); }
function pullBreaker2(b) {
  if (PP2.power || b.up) return; if (PP2.step < 3) { foremanNo2(); return; }
  const want = PP2.order[PP2.pulled.length];
  if (b.i + 1 === want) { b.up = true; b.pivot.rotation.x = -0.7; PP2.pulled.push(want); SFX2.lever(P9(b)); if (PP2.pulled.length === 4) powerOn2(); return; }
  SFX2.spark(P9(b)); SFX2.lever(P9(b)); PL.hp -= 4; FX.hurt = 0.4; PL.shake = 0.4; toast('THE BANK TRIPS · ALL FOUR DROP', 2.4);
  for (const q of WP2.pos.breakers) { q.up = false; q.pivot.rotation.x = 0.7; } PP2.pulled = [];
}
function powerOn2() {
  PP2.power = true; SFX2.hum(P9(WP2.pos.bank)); FX.glitch = 0.6; toast('POWER · THE LIFT FEED IS LIVE', 2.6);
  later(1.5, () => { PP2.timeOffer = true; toast('THE FOREMAN HOLDS SOMETHING OUT', 2.4); });
  later(3, () => ringPhone2(null, ['Lights just came up on the lift board. Your crew did that.'])); tasks2(); setPhase2(); cpSave('POWER');
}
function takeTimecard2() { PP2.timecard = true; PP2.timeOffer = false; SFX.pickup(); toast('A TIME CARD · YOUR NAME IS ALREADY ON IT', 2.8); tasks2(); }
function punchIn2(it) {
  if (holdBusy(it)) return; SFX2.clock(P9(it));
  holdStart(it, 2.5, () => { SFX2.clock(P9(it)); win2('shift'); }, { r: 2.2, cancel: 'YOU KEEP THE CARD', noise: 0 });
}
// ----- the valve room: Benny and the wheel -----
function doorLabel2(dr) {
  if (dr.dk === 'valve' && dr.locked) return PP2.crowbar ? (holdBusy(W.interact.find(i => i.door === dr)) ? 'PRYING…' : 'PRY THE DOOR · CROWBAR') : 'JAMMED · VALVE ROOM 4';
  return dr.target ? 'CLOSE DOOR' : 'OPEN DOOR';
}
function useDoor2(dr) {
  if (dr.dk === 'valve' && dr.locked) {
    if (!PP2.crowbar) { SFX9.rattle(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.2); toast('JAMMED · IT NEEDS A BAR', 2); if (!PP2.bennyHeard) bennyDoor2(); return; }
    const it = W.interact.find(i => i.door === dr); if (holdBusy(it)) return;
    SFX2.pry(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.5);
    holdStart(it, 2.6, () => { dr.locked = false; PP2.valveOpen = true; setDoor(dr, true); bennyOut2(); tasks2(); setPhase2(); cpSave('THE VALVE ROOM'); }, { r: 2.2, cancel: 'THE BAR SLIPS', noise: 0.3 });
    return;
  }
  useDoor(dr);
}
function bennyDoor2() {
  if (PP2.bennyHeard) return; PP2.bennyHeard = true; const p = { pos: WP2.pos.valveDoor, mode: 'near' };
  sayBenny2('Hey. Hey! Is that a person? Say something if you\'re a person.', p);
  sayBenny2('Door\'s jammed. I\'ve been sat in here with the wheel in my lap for, I don\'t know. What day is it?', Object.assign({ delay: 0.3 }, p));
  sayBenny2('Get a bar. Anything long. I\'m not walking that pipe again. It lives out there.', Object.assign({ delay: 0.3 }, p));
  tasks2();
}
function bennyOut2() {
  PP2.wheel = true; SFX.pickup();
  sayBenny2('Oh, thank God. You\'ve got a face. Sorry. That\'s a weird thing to say.');
  sayBenny2('Here. The east wheel. I took it off so nobody could turn it while I was in here. Didn\'t think that through.', { delay: 0.3 });
  later(2, () => toast('THE VALVE WHEEL', 2.2));
}
function talkBenny2() {
  const S = ++PP2.bennyStep;
  if (S === 1) { sayBenny2('Keep your light on it and don\'t run. It likes runners.'); sayBenny2('That\'s all I know. That and the coffee here is terrible. Tell Ida I said.', { delay: 0.3 }); return; }
  if (regsDone2() >= 3) { sayBenny2(pick(['Quiet, huh. I\'ll wait. Somebody has to tell the next one about the bar.', 'Go on. I\'ll follow when it\'s properly quiet. Ten minutes. An hour.'])); return; }
  sayBenny2(pick(['I\'m staying put. You go. You\'ll be fine. Probably.', 'Ida never comes out of that office. You noticed that?', 'If you see Hollis, he owes me a radio.']));
}
// ----- the lift -----
function liftReady2() { PP2.liftReady = true; setPhase2(); cpSave('THE LIFT IS LIVE'); later(4, () => say(OUT9, 'Nine. We see a lift moving on a level we don\'t have. If that\'s you, keep the tape running.', { radio: true })); }
function callLift2(it) {
  if (!PP2.liftReady) { SFX2.spark(P9(it)); toast(!PP2.power ? 'THE PANEL IS DEAD' : 'THE PANEL READS: PRESSURE HIGH · ' + regsDone2() + '/3', 2.4); return; }
  if (PP2.liftOpen || holdBusy(it)) return;
  holdStart(it, 1.6, () => { PP2.liftOpen = true; LV.solids[WP2.liftGate].off = true; SFX2.liftMotor(P9(it)); toast('THE GATE FOLDS BACK', 2); setPhase2(); if (WP2.gateMesh) WP2.gateMesh.setEnabled(false); }, { r: 2, cancel: 'YOU LET GO', noise: 0.1 });
}
function rideLift2() { SFX2.liftMotor(P9(WP2.pos.liftCar)); win2('lift'); }
function updateLift2(dt) { for (const p of WP2.phones) if (p.ring > 0) { p.ring -= dt; p.rt = (p.rt || 0) - dt; if (p.rt <= 0) { p.rt = 2.2; SFX2.ring({ x: p.x, y: 1.6, z: p.z, pl: { x: PL.x, z: PL.z } }); } } }

// ----- building the story's objects -----
function buildStory2() {
  const P = WP2.pos, I = o => { W.interact.push(o); return o; };
  W.itemMat = actMat('items', { spec: 0.8, shin: 50, emis: 1, wrap: 0.3 });
  for (const ph of WP2.phones) I({ x: ph.x, z: ph.z, y: 1.4, r: 1.7, label: () => ph.ring > 0 ? 'ANSWER THE PHONE' : 'PICK UP THE PHONE', ok: () => G.state === 'play', act: () => usePhone2(ph) });
  I({ x: P.calendar.x, z: P.calendar.z, y: 1.5, r: 1.8, label: () => 'READ THE CALENDAR', ok: () => G.state === 'play', act: () => { SFX.click(); readDoc('cal2', 'CALENDAR · BOILER OFFICE', ['Every day is crossed out in the same red pen.', 'The month at the top has been written over so many times it is a black square.'], { kind: 'note' }); } });
  I({ x: P.shiftBoard.x, z: P.shiftBoard.z, y: 1.5, r: 1.8, label: () => 'READ THE SHIFT BOARD', ok: () => G.state === 'play', act: () => { SFX.click(); readDoc('shift2', 'SHIFT BOARD · NIGHTS', ['MON · MULCAHY', 'TUE · MULCAHY', 'WED · MULCAHY', 'THU · MULCAHY', 'FRI · MULCAHY', '(a gap where a card used to be pinned)'], { kind: 'board' }); } });
  // the camp
  I({ x: P.log1.x, z: P.log1.z, y: 0.85, r: 1.8, label: () => 'READ THE LOGBOOK', ok: () => G.state === 'play', act: () => readLog2('l1', 'GAMMA TEAM · LOGBOOK') });
  I({ x: P.log2.x, z: P.log2.z, y: 1.5, r: 1.8, label: () => 'READ THE TEAM BOARD', ok: () => G.state === 'play', act: () => readLog2('l2', 'GAMMA TEAM · BOARD') });
  I({ x: P.log3.x, z: P.log3.z, y: 0.3, r: 1.7, label: () => 'PICK UP THE PAGE', ok: () => G.state === 'play', act: () => readLog2('l3', 'A PAGE ON THE FLOOR') });
  I({ x: P.radio.x, z: P.radio.z, y: 0.9, r: 1.6, label: () => 'THE FIELD RADIO', ok: () => G.state === 'play', act: () => { SFX.staticBurst(0.3, 1.2); toast('ONLY STATIC · THE DIAL IS TAPED AT GAMMA', 2.4); } });
  { const it = I({ x: P.crowbar.x, z: P.crowbar.z, y: 0.65, r: 1.7, label: () => 'TAKE THE CROWBAR', ok: () => !PP2.crowbar && G.state === 'play', act: () => takeCrowbar2() });
    const m = mkMerged(W.itemMat, Q => { Q('Box', { width: 0.04, height: 0.04, depth: 0.78 }, [0.62, 0.1, 0.06], 0.2, [0, 0, 0]); Q('Box', { width: 0.04, height: 0.12, depth: 0.04 }, [0.62, 0.1, 0.06], 0.2, [0, 0.05, 0.38], [0.6, 0, 0]); }, 'crowbar2'); m.position.set(P.crowbar.x, 0.67, P.crowbar.z - 0.7); m.rotation.y = 0.7; WP2.crowbarMesh = m; }
  { I({ x: P.idcard.x, z: P.idcard.z, y: 1.5, r: 1.7, label: () => 'TAKE THE ID CARD', ok: () => !PP2.idcard && G.state === 'play', act: () => takeId2() }); }
  // regulators
  WP2.regWheels = {};
  for (const [k, root, pos] of [['w', WP2.wregRoot, P.wreg], ['n', WP2.nregRoot, P.nreg], ['e', WP2.eregRoot, P.ereg]]) {
    const wheel = mkMerged(WP2.propMat, Q => { Q('Torus', { diameter: 0.6, thickness: 0.06, tessellation: 22 }, [0.85, 0.15, 0.08], 0.1, [0, 0, 0], [Math.PI / 2, 0, 0]); for (let j = 0; j < 3; j++) Q('Box', { width: 0.58, height: 0.04, depth: 0.04 }, [0.85, 0.15, 0.08], 0.1, [0, 0, 0], [0, 0, j * Math.PI / 3]); }, 'regwheel2');
    const wp = localPt(root, 0, 1.25, 1.0); wheel.position.copyFrom(wp); wheel.rotation.y = root.rotation.y; WP2.regWheels[k] = wheel; if (k === 'e') { wheel.setEnabled(false); WP2.ewheel = wheel; }
    const it = I({ x: pos.x, z: pos.z, y: 1.25, r: 2.0, label: () => holdBusy(it) ? `TURNING… ${holdPct(it)}%` : regLabel2(k), ok: () => G.state === 'play' && PP2.step >= 3, act: () => useReg2(k, it) });
  }
  // breakers, the foreman, the clock
  for (const b of P.breakers) I({ x: b.x, z: b.z, y: 1.3, r: 1.3, label: () => PP2.power ? 'BREAKER ' + (b.i + 1) + ' · ON' : 'THROW BREAKER ' + (b.i + 1), ok: () => G.state === 'play' && !PP2.power, act: () => pullBreaker2(b) });
  I({ x: P.tapPipe.x, z: P.tapPipe.z, y: 1.4, r: 2.4, label: () => 'WATCH THE FOREMAN', ok: () => G.state === 'play' && !PP2.power, act: () => watchForeman2() });
  I({ x: P.foreman.x, z: P.foreman.z, y: 1.2, r: 2.2, label: () => 'TAKE THE TIME CARD', ok: () => G.state === 'play' && PP2.timeOffer && !PP2.timecard, act: () => takeTimecard2() });
  { const it = I({ x: P.clock.x, z: P.clock.z, y: 1.4, r: 1.8, label: () => PP2.timecard ? (PP2.liftReady ? (holdBusy(it) ? 'PUNCHING IN…' : 'PUNCH IN · THIS ENDS THE TAPE') : 'THE CLOCK · YOUR SHIFT HASN\'T STARTED') : 'THE TIME CLOCK', ok: () => G.state === 'play', act: () => { if (PP2.timecard && PP2.liftReady) punchIn2(it); else { SFX2.clock(P9(it)); toast('THE CLOCK SAYS 23:47 · IT ALWAYS SAYS 23:47', 2.6); } } }); }
  I({ x: P.bank.x, z: P.bank.z, y: 2.2, r: 2.2, label: () => 'READ THE NOTICE', ok: () => G.state === 'play' && !PP2.power, act: () => { SFX.click(); readDoc('brk2', 'NOTICE · MAIN BREAKERS', ['BREAKER ORDER IS SET BY THE FOREMAN. ASK THE FOREMAN.', 'A WRONG ORDER TRIPS THE BANK.', '(scratched underneath:) he doesn\'t talk. watch his hands'], { kind: 'board' }); } });
  // the lift
  { const it = I({ x: P.liftPanel.x, z: P.liftPanel.z, y: 1.3, r: 1.8, label: () => PP2.liftOpen ? 'THE GATE IS OPEN' : holdBusy(it) ? 'CALLING…' : 'CALL THE LIFT', ok: () => G.state === 'play' && !PP2.liftOpen, act: () => callLift2(it) }); }
  I({ x: P.liftCar.x, z: P.liftCar.z, y: 1.2, r: 2.0, label: () => 'RIDE UP', ok: () => G.state === 'play' && PP2.liftOpen, act: () => rideLift2() });
}
function buildItems2(diff) {
  const mat = W.itemMat, spots = [];
  for (const k of ['coldA', 'coldB', 'coldC', 'camp', 'valve', 'office', 'sump', 'lift', 'shop', 'tank']) { const r = LV.dry[k]; if (r) for (const c of r.cells) spots.push(c); }
  for (const s of LV.shelters2) spots.push(cIdx(s.x, s.y));
  shuffle(spots); const used = new Set();
  const place = type => {
    for (const c of spots) {
      if (used.has(c)) continue; used.add(c);
      const p = { x: cellCenter(c % N) + rnd(-1, 1), z: cellCenter((c / N) | 0) + rnd(-1, 1) }; collide(p, 0.3);
      if (cellOf(p.x) !== c % N || cellOf(p.z) !== ((c / N) | 0)) continue;
      const root = tnode(null, p.x, 0, p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, mat);
      const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : type === 'bar' ? 'TAKE ENERGY BAR' : type === 'drink' ? 'TAKE ENERGY DRINK' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
      return;
    }
  };
  for (let i = 0; i < [6, 5, 3][diff]; i++) place('battery');
  for (let i = 0; i < [9, 7, 4][diff]; i++) place('water');
  for (let i = 0; i < [6, 5, 3][diff]; i++) place('bar');
  for (let i = 0; i < [5, 4, 2][diff]; i++) place('drink');
  const more = []; for (const k of ['spine', 'hall', 'sw', 'tank', 'gall', 'long', 'lcorr']) { const r = LV.dry[k]; if (r) more.push(...r.cells); }
  buildLoot(spots.concat(more), diff, { noFloor: true });   // r12: bars and drinks are already spread here; drawers, the tool chest and its key
}
// ----- per frame -----
function places2Events(dt) {
  if (G.state !== 'play') return;
  const c = cell2(PL.x, PL.z), z = LV.zone[c], S = PP2.seen;
  const enter = (k, txt, fn) => { if (!S[k]) { S[k] = true; toast(txt, 2.8); SFX.beep(1000, 0.05); fn && fn(); } };
  if (z === ZP2.GALL) enter('gall', 'THE LOW GALLERIES');
  if (z === ZP2.SWITCH) enter('sw', 'THE SWITCHYARD');
  if (z === ZP2.LONG) enter('long', 'THE LONG PIPE');
  if (z === ZP2.HALL) enter('hall', 'THE BOILER HALL');
  if (z === ZP2.CAMP) enter('camp', 'GAMMA TEAM · STORE 9');
  if (z === ZP2.LIFT) enter('lift', 'THE GAMMA LIFT');
  // Benny hears you at his door
  const vd = WP2.pos.valveDoor; if (!PP2.bennyHeard && vd && dist2(PL.x, PL.z, vd.x, vd.z) < 7 && PP2.step >= 3) bennyDoor2();
  // the foreman taps the first time you come near the bank
  const tp = WP2.pos.tapPipe; if (!PP2.tapped && PP2.step >= 3 && tp && dist2(PL.x, PL.z, tp.x, tp.z) < 6) watchForeman2();
  // the first surge: Ida says it on every phone
  if (GP2.surge && GP2.surge.st === 'warn' && !GP2.surge.said) { GP2.surge.said = true; if (GP2.surges <= 2) sayIda2(GP2.surges === 1 ? 'That\'s the knock. Shelter. Now.' : 'That\'s the knock again. Shelter.', { phone: true }); }
  // idle hint
  PP2.hintT += dt; if (PP2.hintT > 200 && PP2.step >= 3 && !PP2.liftReady) { PP2.hintT = 0; ringPhone2(null, [hint2()]); }
}
// ----- endings -----
function flags2() { flag('ending2', GP2.ending); flag('regs2', GP2.regs); flag('ida2', PP2.idGiven ? 'card' : ''); flag('benny2', PP2.valveOpen ? 'out' : ''); }
function endCard2() {
  const f = RUN.f, S = [];
  if (GP2.ending === 'shift') {
    S.push('The clock stamps 23:47 on your card. Somebody puts a wrench in your hand.');
    S.push('The camera stays on, pointed at a bank of gauges, for the rest of the night and most of the next.');
    if (PP2.idGiven) S.push('Ida does not turn round. She moves her chair over so there is room at the desk.');
    return ['ON SHIFT', S.join(' ')];
  }
  S.push('The cage rattles up through a hundred metres of pipe. The heat falls away a degree at a time.');
  if (PP2.idGiven) S.push('There is a field engineer\'s card in your pocket, photo side down.');
  if (PP2.valveOpen) S.push('Somewhere under you, a man is telling nobody about a crowbar.');
  if ((PP2.houndStares || 0) > 0) S.push('You never ran.');
  if (f.ending37 === 'surface') S.push('Your sleeves still smell of chlorine.');
  S.push('The doors open on salt air, and a horn a long way off.');
  return ['THE LIFT', S.join(' ')];
}
function cpRespawn2() { if (GP2.surge) endSurge2(); GP2.heat = Math.min(GP2.heat, 0.3); const h = AIP2.hound; if (h) h.goAway(30); }
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { PP2, talkIda2, usePhone2, ringPhone2, useReg2, watchForeman2, pullBreaker2, takeCrowbar2, takeId2, readLog2, useDoor2, talkBenny2, callLift2, rideLift2, punchIn2, takeTimecard2, endCard2, obj2, hint2, regsDone2, resetPP2 }));

// r9: Level 2 voice. A line whose text is in the voice bank (voicebank2.js) plays its clip with the subtitle.
{ const say2raw = say; say = function (who, text, o = {}) { if (LVL === 2 && !o.vo && typeof VOX2 !== 'undefined' && VOX2[text]) o = Object.assign({}, o, { vo: VOX2[text] }); return say2raw(who, text, o); }; }
