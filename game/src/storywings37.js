// ---------- r8 · Level 37 story: the three wings ----------
// HOTEL (L233): a swimmer who can't start a race without her father's stopwatch; the door that isn't a door. HOSPITAL (L130): three chores for the Staff, who only show up
// on night shot, a roster of names, a discharge form. WATER WORLD (L43): a generator, a control room, the almond-water tanks, and a tape somebody hid in the wave machine.
const swS37 = (t, o = {}) => { const N = AI37.teague; say('TEAGUE', t, Object.assign({ pos: N ? { x: N.x, z: N.z } : null, dur: 4.4 }, o)); };
const staff37 = k => AI37.staff.find(s => s.key === k);

function buildWingStory37() {
  const P = W37.pos, I = o => { W.interact.push(o); return o; };
  // ===== hotel =====
  I({ x: P.guestbook.x, z: P.guestbook.z, y: 1.14, r: 1.8, label: () => 'READ THE GUEST BOOK', ok: () => G.state === 'play', act: () => guestBook37() });
  I({ x: P.bell.x, z: P.bell.z, y: 1.14, r: 1.7, label: () => 'RING THE BELL', ok: () => G.state === 'play', act: () => bell37() });
  I({ x: P.drawer.x, z: P.drawer.z, y: 0.8, r: 1.7, label: () => P37.hotel.drawer ? 'THE DRAWER · EMPTY' : 'OPEN THE DRAWER', ok: () => G.state === 'play', act: () => drawer37() });
  I({ x: P.nightstand.x, z: P.nightstand.z, y: 0.6, r: 1.7, label: () => P37.hotel.sw ? 'THE NIGHTSTAND · A CARD' : 'TAKE THE STOPWATCH', ok: () => LV.dry.r204 && G.state === 'play', act: () => stopwatch37() });
  I({ x: P.vaultTable.x, z: P.vaultTable.z, y: 0.85, r: 1.6, label: () => 'TAKE THE ROOM 233 CARD', ok: () => !P37.keys.hotel && G.state === 'play', act: () => takeCard37() });
  I({ x: P.cafeVend.x, z: P.cafeVend.z, y: 1.1, r: 1.8, label: () => P37.vend.cafe ? 'VENDING MACHINE · EMPTY' : 'VENDING MACHINE · WATER', ok: () => G.state === 'play', act: () => vend37('cafe', 'hotel') });
  I({ x: P.cafePool.x, z: P.cafePool.z, y: 0.8, r: 3.4, label: () => 'READ THE TRAY SIGN', ok: () => G.state === 'play' && dist2(PL.x, PL.z, P.cafePool.x, P.cafePool.z) < 3.4, act: () => { SFX.click(); readDoc('tray37', 'CAFETERIA', ['PLEASE CLEAR YOUR OWN TRAY.', 'PLEASE DO NOT SWIM IN THE CAFETERIA POOL. (someone has circled DO NOT)', 'The drawings on the walls are not yours to take. They are somebody\'s.'], { kind: 'board' }); } });
  // ===== hospital =====
  I({ x: P.ticket.x, z: P.ticket.z, y: 1.0, r: 1.7, label: () => P37.hosp.ticket ? 'NOW SERVING 0 · YOURS: 1' : 'TAKE A NUMBER', ok: () => G.state === 'play', act: () => ticket37() });
  I({ x: P.whiteboard.x, z: P.whiteboard.z, y: 1.6, r: 2.2, label: () => 'READ THE WHITEBOARD', ok: () => G.state === 'play', act: () => whiteboard37() });
  I({ x: P.linen.x, z: P.linen.z, y: 1.4, r: 1.8, label: () => 'TAKE THE LINEN', ok: () => !P37.hosp.linen && G.state === 'play', act: () => { P37.hosp.linen = true; SFX.pickup(); toast('LINEN · FOR WARD 3', 2.2); hospTasks37(); setPhase37(); } });
  I({ x: P.drip.x, z: P.drip.z, y: 1.4, r: 1.8, label: () => 'TAKE AN IV BAG', ok: () => !P37.hosp.iv && G.state === 'play', act: () => { P37.hosp.iv = true; SFX.pickup(); toast('AN IV BAG · FOR WARD 5', 2.2); hospTasks37(); setPhase37(); } });
  I({ x: P.recordsDesk.x, z: P.recordsDesk.z, y: 0.9, r: 1.8, label: () => P37.hosp.chart ? 'THE CHART · TAKEN' : 'TAKE THE CHART', ok: () => G.state === 'play', act: () => takeChart37() });
  I({ x: P.rosterSpot.x, z: P.rosterSpot.z, y: 0.9, r: 1.8, label: () => 'READ THE STAFF ROSTER', ok: () => G.state === 'play', act: () => roster37() });
  I({ x: P.formDesk.x, z: P.formDesk.z, y: 0.9, r: 1.8, label: () => P37.hosp.form ? 'THE FORM · TAKEN' : 'TAKE THE DISCHARGE FORM', ok: () => !P37.hosp.form && G.state === 'play', act: () => { P37.hosp.form = true; SFX.pickup(); toast('A DISCHARGE FORM · THREE STAMPS', 2.4); hospTasks37(); setPhase37(); } });
  // ===== water world =====
  I({ x: P.map.x, z: P.map.z, y: 1.5, r: 2.0, label: () => 'READ THE PARK MAP', ok: () => G.state === 'play', act: () => parkMap37() });
  for (const t of P.tanks) I({ x: t.x, z: t.z, y: 1.2, r: 2.2, label: () => t.taken ? t.name + ' · EMPTY' : 'DRINK FROM ' + t.name, ok: () => !t.taken && G.state === 'play', act: () => tank37(t) });
  { const it = I({ x: P.genSw.x, z: P.genSw.z, y: 1.2, r: 1.9, label: () => P37.ww.gen ? 'THE GENERATOR · RUNNING' : holdBusy(it) ? `PRIMING… ${holdPct(it)}%` : 'START THE GENERATOR', ok: () => !P37.ww.gen && G.state === 'play', act: () => generator37(it) }); }
  I({ x: P.ctrl.x, z: P.ctrl.z, y: 1.0, r: 1.8, label: () => 'READ THE NOTE ON THE MONITOR', ok: () => G.state === 'play', act: () => ctrlNote37() });
  I({ x: P.breakTable.x, z: P.breakTable.z, y: 1.1, r: 1.8, label: () => 'READ THE STAFF ROOM NOTICES', ok: () => G.state === 'play', act: () => breakNote37() });
  I({ x: P.tapeSpot.x, z: P.tapeSpot.z, y: -2.8, r: 1.9, label: () => 'TAKE THE TAPE · NEW_VIDEO.AVI', ok: () => !P37.keys.tape && G.state === 'play', act: () => takeVideo37() });
  I({ x: P.wwVend.x, z: P.wwVend.z, y: 1.1, r: 1.8, label: () => P37.vend.ww ? 'VENDING MACHINE · EMPTY' : 'VENDING MACHINE · WATER', ok: () => G.state === 'play', act: () => vend37('ww', 'park') });
}

// ---------- the hotel ----------
function guestBook37() {
  P37.hotel.book = true; SFX.click();
  const f = RUN.f, L = ['TEAGUE, J. · lane 4 · 233 · departed: (blank)', 'PELL, A. · 204 · departed: (blank)', 'Party of one, M.E.G. (camera) · 204 · no luggage · brought own light', 'OKONKWO party of three · Tuesday · Tuesday · Tuesday'];
  if (f.lost0 > 0 || (f.dead0 && f.dead0.length)) L.splice(3, 0, 'Party of four, M.E.G. · asked for a room by the pool · told it was full');
  readDoc('guest37', 'GUEST BOOK', L, { kind: 'note' }); hotelTasks37();
}
function bell37() { P37.hotel.bell++; SFX5.bell(P9({ x: PL.x, y: 1.2, z: PL.z })); makeNoise(0.2); if (P37.hotel.bell === 3) later(1.4, () => { SFX.whisper(); say('', '…checkout was at eleven…', { mode: 'whisper' }); }); else toast('NOBODY COMES', 1.4); }
function drawer37() {
  if (P37.hotel.drawer) return; P37.hotel.drawer = true; SFX.pickup(); toast('A KEY ON A GREEN TAG · 204', 2.6);
  readDoc('card204', 'HOUSEKEEPING CARD', ['204 stays locked. Guest asked.', 'Do not turn down the bed. He wants it as he left it.', '(He = the guest in 204. We do not know which guest.)'], { kind: 'note' }); hotelTasks37(); cpSave('ROOM 204 KEY');
}
function stopwatch37() {
  if (P37.hotel.sw) { readDoc('splits37', 'CARD ON THE NIGHTSTAND', ['Splits: 29.1 / 30.4 / 31.0 / 30.2.', 'You went out too fast. You always go out too fast.', '— D.'], { kind: 'note' }); return; }
  P37.hotel.sw = true; SFX.pickup(); toast('A STOPWATCH · SILVER · DENTED · 0:00.0', 2.8);
  later(0.8, () => readDoc('splits37', 'CARD ON THE NIGHTSTAND', ['Splits: 29.1 / 30.4 / 31.0 / 30.2.', 'You went out too fast. You always go out too fast.', '— D.'], { kind: 'note' })); hotelTasks37(); setPhase37();
}
function talkTeague37() {
  const H = P37.hotel, N = AI37.teague;
  if (H.timed) { swS37(pick(['Go on. Tell someone it was warm.', 'Lane four is yours if you want it. Nobody swims it.', 'I\'m not going up. I\'m going to do another forty.'])); return; }
  if (!H.met) { H.met = true; swS37('Not yet. Forty lengths.'); swS37('Sorry. I\'m counting, and somebody is counting with me, and he\'s a stroke ahead.', { delay: 3.6 }); return; }
  if (!H.ask) { H.ask = true; swS37('Room 204. There\'s a stopwatch on the nightstand.'); swS37('I can\'t start without it. It\'s silly. It\'s a stopwatch.', { delay: 3.4 }); H.seen = true; hotelTasks37(); setPhase37(); return; }
  if (H.sw && !H.given) { H.given = true; swS37('That\'s his. It\'s dented where he dropped it at Regionals.'); swS37('Press the top when I touch the wall. Not before. Not after.', { delay: 4.4 }); toast('HOLD [E] TO TIME HER', 3); hotelTasks37(); return; }
  if (H.given && !H.timed) { timeTeague37(); return; }
  swS37(pick(['Press the top when I touch the wall.', 'Room 204. Nightstand.']));
}
function timeTeague37() {
  const N = AI37.teague; if (!N || N.swimming) return; const it = N.inter;
  holdStart(it, 20, () => { N.swimming = false; N.lapT = 0; P37.hotel.timed = true; SFX37.stamp(P9({ x: PL.x, y: 1.2, z: PL.z })); toast('TEAGUE · 2:04.1 · 4 LENGTHS', 3);
    swS37('Slow.'); swS37('He\'d have said slow.', { delay: 2.6 }); swS37('He would have been wrong. But he\'d have said it.', { delay: 5.6 });
    swS37('Reception. There\'s a door beside the escalator that isn\'t a door. Here.', { delay: 10 }); later(11.6, () => { P37.hotel.vaultKey = true; SFX5.jingle(P9({ x: PL.x, y: 1.2, z: PL.z })); toast('A BRASS KEY · 233', 2.6); hotelTasks37(); setPhase37(); cpSave('THE BRASS KEY'); });
    swS37('Don\'t read the card. I always read the card.', { delay: 14.5 }); }, { r: 3.2, cancel: 'YOU STOPPED THE WATCH EARLY', noise: 0.04 });
  N.swimming = true; N.lapT = 0; swS37('Go.', { dur: 1.4 });
}
function takeCard37() {
  P37.keys.hotel = true; SFX.pickup(); SFX5.jingle(P9({ x: PL.x, y: 1, z: PL.z })); PL.san = Math.max(0, PL.san - 8); FX.glitch = Math.max(FX.glitch, 0.8); toast('THE ROOM 233 CARD · IT WEIGHS MORE THAN A CARD', 3);
  readDoc('card233', 'ROOM 233 · THE LUKEWARM HOTEL', ['CHECK-OUT 11:00', 'Valid for: one night. Extensions at reception.', '(on the back, in a child\'s writing, in crayon) can we stay one more night'], { kind: 'note' });
  later(1.2, () => { SFX.whisper(); say('', '…one more night…', { mode: 'whisper' }); }); hotelTasks37(); setPhase37(); cpSave('ROOM 233 CARD');
}
function hotelTasks37() {
  const H = P37.hotel; if (!P37.told) return;
  if (H.seen || H.book || H.met) task('swimmer', 'TEAGUE · SHE CAN\'T START WITHOUT HER FATHER\'S STOPWATCH', { quiet: true, sub: 'ROOM 204 · THE KEY IS IN THE RECEPTION DRAWER' });
  if (H.met || H.book) { task('rdrawer', 'THE ROOM 204 KEY · THE RECEPTION DRAWER', { quiet: true, opt: false }); if (H.drawer) taskDone('rdrawer', 'THE ROOM 204 KEY', true); }
  if (H.drawer) { task('stopw', 'THE STOPWATCH · ROOM 204', { quiet: true }); if (H.sw) taskDone('stopw', 'THE STOPWATCH', true); }
  if (H.sw) { task('timeher', 'TIME TEAGUE · FOUR LENGTHS', { quiet: true }); if (H.timed) taskDone('timeher', 'TEAGUE · 2:04.1', true); }
  if (H.vaultKey) { task('vault', 'THE DOOR BESIDE THE ESCALATOR · 233', { quiet: true }); if (P37.keys.hotel) taskDone('vault', 'THE ROOM 233 CARD', true); }
  if (H.timed) taskDone('swimmer', 'TEAGUE · SHE GOT HER TIME', true);
}
function hotelEvents37(dt, z) {
  const H = P37.hotel, inH = z === Z37.HOTEL || z === Z37.CAFE || (LV.room[cell37(PL.x, PL.z)] === LV.dry.court.id);
  if (inH && !H.entered) { H.entered = true; toast('THE LUKEWARM HOTEL', 2.8); SFX.beep(1100, 0.05); later(4, () => toast('THE MUSIC IS NICE', 2.2)); }
  if (inH) { H.t += dt; if (H.t > 70 && !H.warn) { H.warn = true; toast('THE MUSIC HAS BEEN NICE FOR A WHILE', 3); } if (H.t > 70) PL.san = Math.max(0, PL.san - (0.18 + Math.min(0.5, (H.t - 70) / 160)) * dt * [0.6, 1, 1.3][G.diff]); }
  else H.t = Math.max(0, H.t - dt * 1.8);
}
// ---------- the hospital ----------
function ticket37() { P37.hosp.ticket = true; SFX.click(); toast('NOW SERVING 0 · YOURS: 1', 2.6); later(1.4, () => say('PA', 'Now serving number zero.', { dur: 3 })); hospTasks37(); }
function whiteboard37() {
  P37.hosp.board = true; SFX.click();
  readDoc('wb37', 'WHITEBOARD · TODAY', ['BED 3 · LINEN · LAUNDRY, THE SHELF (DON\'T COUNT IT)', 'BED 5 · IV BAG · PHARMACY (LANYARD: HALL, EAST SIDE)', 'CHART · RECORDS → HERE', 'FORM: THREE STAMPS → ADMISSIONS', '(underneath, smaller) nobody is rushing you'], { kind: 'board' }); hospTasks37(); setPhase37();
}
function takeChart37() {
  if (P37.hosp.chart) return; P37.hosp.chart = true; SFX.pickup(); toast('THE CHART · FOR THE NURSES\' STATION', 2.6);
  readDoc('chart37', 'CHART · CAMERA', ['ADMITTED 29 SEP 1996 · 23:47', 'STATUS: PENDING', 'ATTENDING: —', 'NOTES: brought own light. keeps recording. will not put it down.', '(this is not a complaint)'], { kind: 'log' }); hospTasks37(); setPhase37();
}
function roster37() {
  P37.hosp.roster = true; SFX.click(); const f = RUN.f, L = ['KOWALCZYK · LUND · PORTERS · ON STAFF', 'PELL, A. · CAMERA · ON STAFF (NIGHTS)'];
  for (const n of f.dead0 || []) L.push(`${n.replace(/^[A-Z]\. /, '')} · ${pick(['SECURITY', 'MAINTENANCE', 'PORTER', 'LAUNDRY', 'NIGHT DESK'])} · ON STAFF`);
  if (f.pruitt5) L.push('PRUITT, E. · NIGHT PORTER · ON STAFF (SINCE 1951)'); if (f.lusk5) L.push('LUSK · SECURITY · ON STAFF (KEEPS HIS KEYS ON THE TABLE)');
  L.push('(at the bottom) CAMERA · PENDING'); readDoc('roster37', 'STAFF ROSTER · NIGHT SHIFT', L, { kind: 'log' });
  if (!P37.hosp.rosterSaid) { P37.hosp.rosterSaid = true; later(2, () => toast('THEY ARE NOT GONE · THEY ARE ON SHIFT', 3.2)); }
}
function staffLabel37(s) {
  const H = P37.hosp;
  if (s.key === 'ward3' && H.linen && !H.linenDone) return 'GIVE THE LINEN · WARD 3';
  if (s.key === 'ward5' && H.iv && !H.ivDone) return 'GIVE THE IV BAG · WARD 5';
  if (s.key === 'nurse1' && H.chart && !H.chartDone) return 'FILE THE CHART';
  if (s.key === 'hall2' && !H.lanyard) return 'ASK FOR THE LANYARD';
  if (s.key === 'admit' && H.form && H.stamps >= 3 && !P37.keys.hosp) return 'HAND IN THE DISCHARGE FORM';
  return 'SPEAK TO THE STAFF';
}
function stampForm37() { P37.hosp.stamps++; SFX37.stamp(P9({ x: PL.x, y: 1, z: PL.z })); toast(`DISCHARGE FORM · ${P37.hosp.stamps}/3 STAMPS`, 2.4); hospTasks37(); setPhase37(); if (P37.hosp.stamps === 3) later(1.2, () => toast('TAKE IT TO ADMISSIONS', 2.4)); }
function talkStaff37(s) {
  const H = P37.hosp, say_ = (t, d = 0) => later(d, () => say('STAFF', t, { dur: 4, mode: 'whisper' }));
  H.talked = true; s.faceT = 2.5;
  if (s.key === 'ward3' && H.linen && !H.linenDone) { H.linenDone = true; H.linen = 'given'; say_('Thank you.'); say_('Cold in here?', 2.2); stampForm37(); return; }
  if (s.key === 'ward5' && H.iv && !H.ivDone) { H.ivDone = true; say_('Drip. Good.'); stampForm37(); return; }
  if (s.key === 'nurse1' && H.chart && !H.chartDone) { H.chartDone = true; say_('Chart. Then form. Then stamp.'); say_('Pending. They\'re always pending at first.', 3.2); stampForm37(); return; }
  if (s.key === 'hall2' && !H.lanyard) { H.lanyard = true; SFX5.jingle(P9({ x: PL.x, y: 1, z: PL.z })); toast('A LANYARD · PHARMACY', 2.4); say_('Lanyard. Pharmacy. Bring it back.'); hospTasks37(); setPhase37(); return; }
  if (s.key === 'admit' && H.form && H.stamps >= 3 && !P37.keys.hosp) { dischargeDone37(); return; }
  const L = { admit: ['Name? ...Camera. Surname Camera. Take a seat.', 'Your number is one. We are on zero.'], laundry: ['Ward three has been waiting since breakfast. Linen\'s on the shelf. Don\'t count it, it moves.'], pharm: ['Pharmacy is locked. The lanyard is on the one in the hall. Not me.'], nurse1: ['Chart, form, stamp. In that order.'],
    records: ['Everyone\'s in here. Look under your own letter if you like. Most do. Nobody finds it.'], ward1: ['Shh.'], ward3: ['Cold in here?'], ward5: ['Drip.'], hall1: ['Excuse me.'], hall2: ['Mind the bed.'], theatre: ['Not today.'] }[s.key] || ['...'];
  s.said = (s.said || 0); say_(L[Math.min(s.said, L.length - 1)]); s.said++;
}
function dischargeDone37() {
  P37.keys.hosp = true; SFX37.stamp(P9({ x: PL.x, y: 1, z: PL.z })); SFX5.jingle(P9({ x: PL.x, y: 1, z: PL.z })); toast('THE DISCHARGE WRISTBAND', 3);
  later(0.8, () => say('STAFF', 'Discharged.', { dur: 3, mode: 'whisper' })); later(3, () => say('STAFF', 'You\'ll want to leave the way you came. The water level is a formality.', { dur: 5, mode: 'whisper' }));
  PL.san = Math.min(100, PL.san + 12); hospTasks37(); setPhase37(); cpSave('DISCHARGED');
}
function hospTasks37() {
  const H = P37.hosp; if (!P37.told) return; if (!(H.seen || H.board || H.ticket || H.talked)) return;
  task('chores', 'WELLBORN · THREE CHORES, THREE STAMPS · ' + H.stamps + '/3', { quiet: true, sub: 'THE STAFF ONLY SHOW UP IN NIGHT SHOT [N]' }); if (H.stamps >= 3) taskDone('chores', 'THREE STAMPS', true);
  task('linen', 'LINEN FROM THE LAUNDRY · TO WARD 3', { quiet: true }); if (H.linen) task('linen', H.linenDone ? 'WARD 3 · LINEN' : 'LINEN · BRING IT TO WARD 3 (NIGHT SHOT)', { quiet: true }); if (H.linenDone) taskDone('linen', 'WARD 3 · LINEN', true);
  task('iv', 'AN IV BAG · PHARMACY · TO WARD 5', { quiet: true, sub: H.lanyard ? 'YOU HAVE THE LANYARD' : 'THE LANYARD IS ON THE STAFF MEMBER IN THE HALL, EAST SIDE' }); if (H.ivDone) taskDone('iv', 'WARD 5 · IV BAG', true);
  task('chart', 'THE CHART · RECORDS · TO THE NURSES\' STATION', { quiet: true }); if (H.chartDone) taskDone('chart', 'THE CHART · FILED', true);
  if (H.stamps >= 3 && H.form) { task('discharge', 'HAND IN THE FORM · ADMISSIONS', { quiet: true }); if (P37.keys.hosp) taskDone('discharge', 'DISCHARGED', true); }
  else if (!H.form) task('form', 'THE DISCHARGE FORM · THE NURSES\' STATION', { quiet: true }); if (H.form) taskDone('form', 'THE DISCHARGE FORM', true);
}
function hospEvents37(dt, z) {
  const H = P37.hosp, inH = z === Z37.HOSP && LV.room[cell37(PL.x, PL.z)] !== LV.dry.th.id;
  if (inH && !H.seen) { H.seen = true; toast('WELLBORN HOSPITAL', 2.8); SFX.beep(1100, 0.05); later(6, () => say(OUT9, 'Nine. You\'re on a camera feed we don\'t have. Somebody is watching it with you.', { radio: true })); hospTasks37(); }
  if (!inH) return;
  H.sayT += dt; if (H.sayT > 12 && !H.nv && !PL.nv && !H.nvTip) { H.nvTip = true; toast('THE STAFF ONLY SHOW UP IN NIGHT SHOT · [N]', 3.6); }
  if (PL.nv && !H.nv) { H.nv = true; toast('SOMEONE IS AT THE DESK', 2.4); hospTasks37(); }
  H.paT -= dt; if (H.paT <= 0) { H.paT = rnd(38, 64); say('PA', pick(['Visiting hours are over. Visiting hours are over.', 'Bed three, your linen is on its way.', 'Would the owner of a cream Hi-8 please return to Admissions.', 'Now serving number zero.', 'Please keep your voices down. Patients are resting.', 'Doctor to Records. Doctor to Records.']), { dur: 4 }); SFX37.pa({ x: PL.x, y: 3, z: PL.z, pl: { x: PL.x, z: PL.z } }); }
  if (LV.room[cell37(PL.x, PL.z)] === LV.dry.theatre.id) PL.san = Math.max(0, PL.san - 0.5 * dt * [0.6, 1, 1.3][G.diff]);
}
// ---------- water world ----------
function parkMap37() { P37.ww.map = true; SFX.click(); readDoc('map37', 'PARK MAP · YOU ARE HERE', ['1 · THE GATE (you are here)', '2 · MAIN BUILDING · GIFTS · FOOD', '3 · THE AQUARIUM · ALMOND WATER · PLEASE DO NOT TAP THE GLASS', '4 · STAFF · STAFF · STAFF', '5 · THE WAVE POOL · CLOSED FOR THE INCIDENT', '(over the whole map, in marker) the incident is ongoing'], { kind: 'board' }); wwTasks37(); }
function tank37(t) { t.taken = true; P37.ww.tanks++; PL.water++; PL.san = Math.min(100, PL.san + 6); SFX.drink(); toast(t.name + ' · COLD, SWEET · ALMOND WATER +1', 2.6); if (P37.ww.tanks === 1) later(1.2, () => say('', '…you shouldn\'t…', { mode: 'whisper' })); }
function generator37(it) {
  if (holdBusy(it)) return; SFX37.pump(P9({ x: it.x, y: 1, z: it.z })); makeNoise(0.4);
  holdStart(it, 3, () => { P37.ww.gen = true; toast('THE GENERATOR IS RUNNING', 2.6); say('PA', 'Power has been restored to the staff areas.', { dur: 4 }); SFX37.pa({ x: PL.x, y: 3, z: PL.z, pl: { x: PL.x, z: PL.z } }); wwTasks37(); setPhase37(); cpSave('THE GENERATOR'); }, { r: 2.4, cancel: 'IT STALLS', noise: 0.5 });
}
function ctrlNote37() {
  P37.ww.note = true; SFX.click();
  readDoc('ctrl37', 'CONTROL ROOM · NOTE ON THE MONITOR', ['NEW_VIDEO.AVI was on the screen when I came in. It was the first file on the drive.', 'It started the wave machine by itself. The wave machine does not do that.', 'I took the tape out and put it in the machine\'s sump so nobody would play it. I am not proud of how.', 'POOL ACCESS is the door in the staff room. Staff only. Everyone is staff.'], { kind: 'note' }); wwTasks37();
}
function breakNote37() { SFX.click(); readDoc('brk37', 'STAFF ROOM · NOTICES', ['SHIFT SWAPS: nobody wants Fridays.', 'Reminder: the Deep is not a ride.', 'Whoever keeps drawing on the whiteboard: it was funny once.', 'If you hear the PA say the park is open, it isn\'t. Do not go and check.'], { kind: 'board' }); }
function takeVideo37() {
  if (P37.keys.tape) return; P37.keys.tape = true; SFX.pickup(); toast('NEW_VIDEO.AVI · DO NOT PLAY IT IN FRONT OF THE POOL', 3.4); FX.glitch = 1.4; PL.shake = 0.8;
  later(0.6, () => { SFX37.alarm({ x: PL.x, y: 2, z: PL.z, pl: { x: PL.x, z: PL.z } }); say('PA', 'The wave pool is now open.', { dur: 3.4 }); G37.waves = true; if (AI37.wwf) AI37.wwf.aggro(); });
  wwTasks37(); setPhase37(); cpSave('NEW_VIDEO.AVI');
}
function wwTasks37() {
  const W = P37.ww; if (!P37.told) return; if (!(W.seen || W.map)) return;
  task('gen', 'THE GENERATOR · THE STAFF HALLS, WEST', { quiet: true, sub: 'THE CONTROL ROOM HAS NO POWER' }); if (W.gen) taskDone('gen', 'THE GENERATOR IS RUNNING', true);
  if (W.gen) { task('ctrl', 'THE CONTROL ROOM · READ THE NOTE', { quiet: true }); if (W.note) taskDone('ctrl', 'THE NOTE ON THE MONITOR', true); }
  if (W.note || W.gen) { task('video', 'NEW_VIDEO.AVI · THE WAVE MACHINE\'S SUMP · THE STAFF ROOM LEADS THERE', { quiet: true, sub: 'THREE METRES DOWN. SOMETHING SWIMS' }); if (P37.keys.tape) taskDone('video', 'NEW_VIDEO.AVI', true); }
}
function wwEvents37(dt, z) {
  const W = P37.ww, inW = z === Z37.PARK || z === Z37.DOME || z === Z37.STAFF || z === Z37.WWF;
  if (inW && !W.seen) { W.seen = true; toast('WATER WORLD', 2.8); SFX.beep(1100, 0.05); later(3, () => say('PA', 'Water World is now closed. Please make your way to the nearest exit. The nearest exit is behind you.', { dur: 6 })); wwTasks37(); }
  if (!inW) return; W.paT -= dt;
  if (W.paT <= 0) { W.paT = rnd(34, 58); say('PA', pick(['Please remember to take your belongings with you.', 'Lost children will be taken to the front gate. There are no lost children.', 'The Deep is closed due to weather.', 'Please do not tap on the glass.', 'Thank you for visiting Water World.']), { dur: 4.4 }); SFX37.pa({ x: PL.x, y: 3, z: PL.z, pl: { x: PL.x, z: PL.z } }); }
}
// ---------- where to go next ----------
function wingTarget37() {
  const P = W37.pos, pc = cell37(PL.x, PL.z), z = LV.zone[pc], H = P37.hotel, S = P37.hosp, W = P37.ww;
  const inHotel = LV.reg[pc] === R37Z.HOTEL && z !== Z37.TUNNEL, inHosp = LV.reg[pc] === R37Z.HOSP && z === Z37.HOSP, inWW = LV.reg[pc] === R37Z.WW && z !== Z37.TUNNEL;
  const hotelNext = () => { if (H.timed && !P37.keys.hotel) return P.vaultTable; if (H.timed) return null; if (H.sw) return AI37.teague; if (H.drawer) return P.nightstand; if (H.ask) return P.drawer; return AI37.teague || P.desk; };
  const hospNext = () => { if (S.stamps >= 3 && S.form) return staff37('admit'); if (!S.form) return P.formDesk; if (!S.linen) return P.linen; if (!S.linenDone) return staff37('ward3'); if (!S.lanyard) return staff37('hall2'); if (!S.iv) return P.drip; if (!S.ivDone) return staff37('ward5'); if (!S.chart) return P.recordsDesk; return staff37('nurse1'); };
  const wwNext = () => { if (!W.gen) return P.genSw; if (!W.note) return P.ctrl; return P.tapeSpot; };
  if (inHotel && !P37.keys.hotel) return hotelNext(); if (inHosp && !P37.keys.hosp) return hospNext(); if (inWW && !P37.keys.tape) return wwNext();
  // otherwise: the nearest wing still to do
  const ent = { hotel: { x: cc37(34.5), z: 43.2 * CELL }, hosp: { x: 30.6 * CELL, z: cc37(19) }, park: { x: 65 * CELL - 0.5, z: cc37(34) } };
  if (wingsDone37() >= 3) return P.panel || P.deskB;
  if (!P37.keys.hotel) return ent.hotel; if (!P37.keys.hosp) return ent.hosp; return ent.park;
}
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { talkTeague37, talkStaff37, staffLabel37, wingTarget37, timeTeague37 }));
