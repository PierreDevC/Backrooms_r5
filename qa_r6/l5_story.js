// r6 QA: Level 5 manager's office, register and night audit, the guest behind the locked door, the rye, the master-key route, Hale on the radio.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1300); await page.screenshot({ path: path.join(out, 'r6_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN.f = { hale9: 'saved', nine0: true }; B.G5.from = null; B.goLevel5(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W5 && window.__BR.W5.keys && window.__BR.W5.keys.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, W, LV5, P5, W5 } = B, LV = LV5(), o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    o.state = G.state; o.office = !!LV.office5; o.pruitt = LV.pruitt && LV.pruitt.num; o.prDoor = !!(W5.p5 && W5.p5.door && W5.p5.door.locked);
    o.subs = [B.SUBS.cur && B.SUBS.cur.who + ':' + B.SUBS.cur.text].concat(B.SUBS.q.map(s => s.who + ':' + s.text)).join(' / ');
    for (let i = 0; i < 40; i++) B.simStep(0.05); o.subs2 = B.SUBS.cur && B.SUBS.cur.who + ':' + B.SUBS.cur.text;
    B.radio5('eyes'); o.eyes = B.SUBS.q.slice(-1)[0].who; B.SUBS.q.length = 0;
    o.labels = W.interact.map(i => { try { return i.label(); } catch (e) { return ''; } }).filter(l => /REGISTER|AUDIT|SWITCHBOARD|RYE|KNOCK/.test(l));
    o.tasks = B.TASKS.list.map(t => t.id);
    return o;
  });
  console.log('QA l5 start ' + JSON.stringify(a));
  ok(a.state === 'play' && a.office && a.pruitt && a.prDoor, 'office built; a guest room is locked for the guest'); ok(/DR\. HALE/.test(a.subs + a.subs2), 'Hale speaks from the car when he was saved');
  ok(a.eyes === 'DR. HALE', 'Hale takes over some radio lines'); ok(a.labels.length >= 5, 'register, audit, switchboard, rye and the door are usable: ' + a.labels.join(','));
  const go = (re) => page.evaluate((src) => { const B = window.__BR, { W, PL } = B, re = new RegExp(src), it = W.interact.filter(i => { try { return re.test(i.label()) && i.ok(); } catch (e) { return false; } })[0]; if (!it) return false; PL.x = it.x; PL.z = it.z; PL.cell = -1; for (let i = 0; i < 3; i++) B.simStep(0.05); it.act(); return true; }, re.source);
  const b = {};
  b.reg = await go(/GUEST REGISTER/); b.audit = await go(/NIGHT AUDIT/);
  await page.evaluate(() => { const B = window.__BR, { PL, W5 } = B; for (let i = 0; i < 10; i++) B.simStep(0.05); });
  await shot('office5');
  b.sw = await go(/SWITCHBOARD/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 200; i++) B.simStep(0.05); return { pr: B.P5.pr, lead: B.taskOf('pruitt') && B.taskOf('pruitt').sub, rye: !!B.taskOf('rye'), obj: document.getElementById('objective').textContent, docs: B.TASKS.docs.map(d => d.id) }; }));
  b.take = await go(/TAKE THE RYE/); b.leave = await go(/LEAVE THE RYE/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 300; i++) B.simStep(0.05); return { pr2: B.P5.pr, keyOut: B.P5.keyOut }; }));
  await shot('pruitt_door');
  b.key = await go(/MASTER KEY/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, { W5, PL } = B; B.simStep(0.05); const o = { master: B.P5.master, phase: B.G5.phase, label: B.W.interact.find(i => i.door === W5.svDoor).label(), cp: B.CP.on && B.CP.on.label }; PL.x = W5.svDoor.mx; PL.z = W5.svDoor.mz; B.W.interact.find(i => i.door === W5.svDoor).act(); for (let i = 0; i < 40; i++) B.simStep(0.05); o.phase2 = B.G5.phase; o.locked = W5.svDoor.locked; o.staffTask = B.taskOf('staff').done; o.keysTask = B.taskOf('keys').text; return o; }));
  b.open = await go(/OPEN ROOM/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 40; i++) B.simStep(0.05); return { opened: B.P5.opened, empty: B.taskOf('open5') && B.taskOf('open5').text }; }));
  console.log('QA l5 story ' + JSON.stringify(b));
  ok(b.reg && b.audit && b.docs.includes('register5') && b.docs.includes('audit5'), 'register and night audit read'); ok(b.sw && b.pr === 'asked' && b.rye && /RYE/.test(b.obj), 'switchboard reaches the guest, who asks for rye');
  ok(b.take && b.leave && b.pr2 === 'given' && b.keyOut, 'rye left at the door, the key comes out'); ok(b.key && b.master && /MASTER KEY/.test(b.label) && b.cp === 'MASTER KEY', 'master key taken; staff door accepts it');
  ok(b.phase2 === 'stairs' && !b.locked && b.staffTask && /NOT NEEDED/.test(b.keysTask), 'staff door opens with no housekeeping keys'); ok(b.open && b.opened && /EMPTY/.test(b.empty || ''), 'his room is empty');
  const c = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W5, G5 } = B, o = {};
    B.startTp5(true); for (let i = 0; i < 40; i++) B.simStep(0.05); o.boil = G5.boilSeen;
    B.ST5.reset = true;   // r7: the State Floor's fire lock is covered by qa_r7/l5_state.js
    for (const v of W5.valves) B.finishValve5(v); for (let i = 0; i < 40; i++) B.simStep(0.05); o.phase = G5.phase; o.tasks = B.TASKS.list.filter(t => !t.opt).map(t => t.id + (t.done ? '✓' : ''));
    PL.x = W5.exit.x; PL.z = W5.exit.z; B.useExit5(); o.state = G.state; return o;
  });
  console.log('QA l5 end ' + JSON.stringify(c)); ok(c.boil && c.phase === 'exit' && c.state === 'won', 'boilers vented, exit taken');
  await page.waitForFunction(() => window.__BR.G18 && window.__BR.G18.from && ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 }).catch(() => {});
  const f = await page.evaluate(() => window.__BR.RUN.f); console.log('QA l5 flags ' + JSON.stringify(f));
  ok(f.pruitt5 === 'opened' && f.staff5 === 'master' && f.register5 && f.hale9 === 'saved', 'Level 5 choices carried');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
