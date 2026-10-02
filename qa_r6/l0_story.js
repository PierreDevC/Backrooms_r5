// r6 QA: Level 0 places and story. Rooms carved and reachable, tasks/leads, documents, radio, both power routes, Reyes, exit → Level 9 flags.
const path = require('path');
module.exports = async (page, logs) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, 'r6_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  const lookIn = async (k, name) => {   // stand in a doorway-ish spot of a room looking at its centre
    await page.evaluate((k) => {
      const B = window.__BR, R = B.P0[k], { PL } = B;
      for (const h of B.AI.howlers) h.place(R.cx + 60, R.cz + 60, 0);
      const x = R.X0 + 0.9, z = R.Z0 + 0.9; PL.x = x; PL.z = z; PL.yaw = Math.atan2(R.cx - x, R.cz - z); PL.pitch = -0.12; PL.flash = true; PL.batt = 100;
      for (let i = 0; i < 6; i++) B.simStep(0.05);
    }, k);
    await shot(name);
  };
  await page.evaluate(() => { const B = window.__BR; B.G.diff = 1; B.startGame(true); });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, AI, P0, LV, TASKS } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    o.state = G.state; o.rooms = P0.rooms.map(r => r.k + ':' + r.w + 'x' + r.h + ':doors' + r.doors.length);
    let unreach = 0; for (let c = 0; c < LV.spawnD.length; c++) if (LV.spawnD[c] < 0) unreach++; o.unreach = unreach;
    o.tapeReach = LV.tapeCells.every(c => LV.spawnD[c.y * 34 + c.x] >= 0);
    const e = AI.exps[2]; o.reyesHurt = !!e.hurt; o.reyesIn = B.placeAt0(e.x, e.z) === P0.off;
    o.led = W.exit && W.exit.led.__emi && W.exit.led.__emi.x;
    o.obj = document.getElementById('objective').textContent; o.tasks0 = TASKS.list.map(t => t.id);
    o.pages = W.interact.filter(i => /LOGBOOK PAGE/.test(i.label())).length; o.breakers = W.interact.filter(i => /THROW BREAKER/.test(i.label())).length;
    return o;
  });
  console.log('QA l0 start ' + JSON.stringify(a));
  ok(a.state === 'play', 'Level 0 plays'); ok(a.rooms.length === 3, 'three places carved'); ok(a.unreach === 0 && a.tapeReach, 'every cell and tape reachable after carving');
  ok(a.reyesHurt && a.reyesIn, 'Reyes starts hurt in the flooded office'); ok(a.pages === 3 && a.breakers === 3, 'three logbook pages and three breakers'); ok(a.led === 0, 'exit keypad starts unpowered');
  for (const k of ['camp', 'sub', 'off']) await lookIn(k, 'room_' + k);
  const b = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, AI, P0, TASKS, DOC, HINT } = B, o = {}, act = (re) => { const it = W.interact.find(i => re.test(i.label()) && i.ok()); if (!it) return false; PL.x = it.x + 0.6; PL.z = it.z; it.act(); return true; };
    for (const h of AI.howlers) h.place(P0.camp.cx + 70, P0.camp.cz + 70, 0);
    for (let i = 0; i < 900; i++) B.simStep(0.05);   // 45 s: Brandt's call about the dead keypad
    o.powerTask = !!B.taskOf('power'); o.subs = document.getElementById('subs').textContent;
    PL.x = P0.camp.cx; PL.z = P0.camp.cz; for (let i = 0; i < 4; i++) B.simStep(0.05); o.seenCamp = !!P0.seen.camp; o.radioLead = !!B.taskOf('radio');
    o.board = act(/WHITEBOARD/); o.docOpen = DOC.open; o.docT = document.getElementById('docT').textContent; o.docHidden = document.getElementById('doc').className;
    o.map = act(/HAND-DRAWN MAP/);
    act(/FIELD RADIO/); o.nine = !!B.flag('nine0'); for (let i = 0; i < 90; i++) B.simStep(0.05); o.hintStage = HINT.stage;
    o.crate = act(/SUPPLY CRATE/);
    for (const it of W.interact.filter(i => /LOGBOOK PAGE/.test(i.label()))) { PL.x = it.x + 0.5; PL.z = it.z; it.act(); B.simStep(0.05); }
    o.logs = P0.logs.filter(Boolean).length; o.logDone = P0.logDone; for (let i = 0; i < 70; i++) B.simStep(0.05); o.spare = PL.spare;
    o.docs = TASKS.docs.map(d => d.id);
    return o;
  });
  console.log('QA l0 story ' + JSON.stringify(b));
  ok(b.powerTask, 'power objective appears'); ok(b.seenCamp && b.radioLead, 'entering camp opens the radio lead'); ok(b.board && /WHITEBOARD/.test(b.docT) && b.docHidden !== 'hide', 'whiteboard opens a document');
  ok(b.nine && b.hintStage >= 2, 'camp radio reaches Outpost Nine and locks the tape signal'); ok(b.crate, 'supply crate searchable'); ok(b.logs === 3 && b.logDone, 'logbook complete');
  await page.evaluate(() => { window.__BR.pauseGame(); window.__BR.openNotes(); });
  await page.waitForTimeout(400); await page.screenshot({ path: path.join(out, 'r6_notes0.png') });
  const nt = await page.evaluate(() => ({ main: document.getElementById('notesMain').textContent, opt: document.getElementById('notesOpt').textContent, docs: document.getElementById('notesDocs').textContent }));
  console.log('QA l0 notes ' + JSON.stringify(nt)); ok(/POWER/.test(nt.main) && /LOGBOOK/.test(nt.opt) && /PAGE 3/.test(nt.docs), 'FIELD NOTES lists objectives, leads and documents');
  await page.evaluate(() => { document.getElementById('btnNotesBack').click(); document.getElementById('btnResume').click(); });
  const c = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, AI, P0 } = B, o = {};
    // Reyes: ask, then give water
    const e = AI.exps[2]; PL.x = e.x + 1.2; PL.z = e.z; PL.water = 2; const hp0 = PL.hp = 40;
    e.talk(); o.r1 = P0.reyes; for (let i = 0; i < 160; i++) B.simStep(0.05);
    o.label = e.inter.label(); e.talk(); o.r2 = P0.reyes; o.water = PL.water;
    for (let i = 0; i < 300; i++) B.simStep(0.05); o.hp = PL.hp; o.hurtAfter = !!e.hurt; o.reyesSt = e.st; o.alive = e.alive;
    // breakers
    for (const h of AI.howlers) h.place(P0.sub.cx + 70, P0.sub.cz + 70, 0);
    for (const it of W.interact.filter(i => /THROW BREAKER/.test(i.label()))) { PL.x = it.x; PL.z = it.z; it.act(); for (let i = 0; i < 40; i++) B.simStep(0.05); }
    o.power = P0.power; o.route = P0.route; o.led = W.exit.led.__emi.x; o.cp = B.CP.on && B.CP.on.label;
    o.howlSt = AI.howlers.map(h => h.st);
    // tapes and the door
    for (const s of W.tapes) if (!s.taken) B.takeTape(s);
    for (let i = 0; i < 80; i++) B.simStep(0.05);
    o.obj = document.getElementById('objective').textContent;
    PL.x = W.exit.x; PL.z = W.exit.z; o.exitLabel = W.interact.find(i => /CODE|KEYPAD/.test(i.label())).label();
    B.useExit(); for (let i = 0; i < 200 && G.state === 'play'; i++) { PL.x = W.exit.doorPos.x; PL.z = W.exit.doorPos.z; B.simStep(0.05); }
    o.state = G.state;
    return o;
  });
  console.log('QA l0 end ' + JSON.stringify(c));
  ok(c.r1 === 'asked' && c.r2 === 'helped' && c.water === 1, 'Reyes asks for water, then takes it'); ok(c.hp >= 90 && !c.hurtAfter, 'Reyes heals the player and gets up');
  ok(c.power === 1 && c.route === 'breakers' && c.led > 1, 'three breakers power the keypad'); ok(c.exitLabel === 'ENTER CODE', 'keypad accepts the code once powered'); ok(c.state === 'won', 'exit opens');
  await page.waitForFunction(() => ['intro', 'play', 'brief9'].includes(window.__BR.G.state) && window.__BR.G9.from, null, { timeout: 240000 }).catch(() => {});
  const d = await page.evaluate(() => ({ f: window.__BR.RUN.f, lvl: window.__BR.LV9 ? 9 : '?' }));
  console.log('QA l0 flags ' + JSON.stringify(d)); ok(d.f.power0 === 'breakers' && d.f.reyes0 === 'helped' && d.f.log0 && d.f.nine0, 'Level 0 choices carried as run flags');
  // battery route on a fresh layout
  await page.evaluate(() => { window.__BR.restartGame(false); });
  await page.waitForFunction(() => window.__BR.G.state === 'title', null, { timeout: 240000 });
  await page.evaluate(() => { window.__BR.startGame(true); });
  const e2 = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, AI, P0 } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    o.flagsCleared = !B.flag('power0'); o.led = W.exit.led.__emi.x;
    for (const h of AI.howlers) h.place(-50, -50, 0);
    const bt = W.interact.find(i => /BRANDT'S BATTERY/.test(i.label())); PL.x = bt.x + 0.5; PL.z = bt.z; bt.act(); o.carry = P0.carry && PL.load;
    B.simStep(0.05); o.obj = document.getElementById('objective').textContent;
    const x0 = PL.x; for (let i = 0; i < 20; i++) { B.K.add('KeyW'); B.K.add('ShiftLeft'); B.simStep(0.05); } B.K.clear(); o.run = PL.run; o.spd = +PL.spd.toFixed(2);
    PL.x = W.exit.x; PL.z = W.exit.z; o.label = W.interact.find(i => /BATTERY|KEYPAD|CODE/.test(i.label())).label();
    B.useExit(); for (let i = 0; i < 50; i++) { PL.x = W.exit.x; PL.z = W.exit.z; B.simStep(0.05); }
    o.power = P0.power; o.route = P0.route; o.load = PL.load; o.exitBatt = !!W.p0.exitBatt;
    return o;
  });
  console.log('QA l0 battery ' + JSON.stringify(e2));
  ok(e2.flagsCleared && e2.led === 0, 'a new Level 0 run resets flags and the keypad'); ok(e2.carry && !e2.run && e2.spd < 2.2, 'carrying the battery: no sprint, slower');
  ok(e2.power === 1 && e2.route === 'battery' && !e2.load && e2.exitBatt, 'battery connected at the exit');
  await page.evaluate(() => { const B = window.__BR, P0 = B.P0, { PL } = B; PL.x = B.W.exit.x; PL.z = B.W.exit.z; PL.yaw = Math.atan2(B.W.exit.doorPos.x - PL.x, B.W.exit.doorPos.z - PL.z); for (let i = 0; i < 4; i++) B.simStep(0.05); });
  await shot('exit_battery');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
