// r7 QA: Level 5 State Floor: the portal doors (all three pairs, both ways), the fire lock on the exit, the Gold Room keys, security,
// the fire key under the female deathmoth, almond water in her bowl, Mothex (kills males, not females), acid, the reset and the exit.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1300); await page.screenshot({ path: path.join(out, 'r7_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN.f = {}; B.G5.from = null; B.goLevel5(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W5 && window.__BR.W5.keys && window.__BR.W5.keys.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, LV = B.LV5(), o = {};
    for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    for (let i = 0; i < 60; i++) B.simStep(0.05);
    o.state = B.G.state; o.st = !!LV.st5; o.warps = LV.warps.length; o.ports = B.PORT5.list.length;
    o.fem = B.AI5.moths.filter(m => m.fem).length; o.gold = B.AI5.moths.filter(m => m.loyal).length;
    o.labels = B.W.interact.map(i => { try { return i.label(); } catch (e) { return ''; } }).filter(l => /RESERVATIONS|OFFICER|MOTHEX|PEST|MONITORS|SECURITY LOG|FIRE|BOWL|INNER DOOR/.test(l));
    // every portal: the inner door faces void, the twin's real door exists
    o.voidOk = B.PORT5.list.every(P => { const c = B.cIdx(P.v.vx + P.v.fx, P.v.vy + P.v.fz); return LV.zone[c] === 0; });
    return o;
  });
  console.log('QA l5 state start ' + JSON.stringify(a));
  ok(a.state === 'play' && a.st && a.warps === 3 && a.ports === 6 && a.voidOk, 'State Floor built; three vestibule pairs, six portal doors, each inner door backs onto nothing');
  ok(a.fem === 2 && a.gold >= 2, 'two females (East Room, far boiler hall) and the Gold Room males');
  ok(['RESERVATIONS', 'OFFICER', 'MOTHEX', 'PEST', 'MONITORS', 'SECURITY LOG', 'FIRE', 'BOWL', 'INNER DOOR'].every(k => a.labels.some(l => l.includes(k))), 'State Floor interactables: ' + a.labels.length);
  // ---- portals: walk through each inner door; you come out of the twin's real door, facing its corridor ----
  const cross = await page.evaluate(() => {
    const B = window.__BR, LV = B.LV5(), res = [];
    for (const P of B.PORT5.list) {
      const v = P.v, t = P.t; B.PL.x = v.cx - v.fx * 0.6; B.PL.z = v.cz - v.fz * 0.6; B.PL.cell = -1; B.PL.yaw = Math.atan2(v.fx, v.fz); B.PL.pitch = 0; B.PL.vx = B.PL.vz = 0;
      for (let i = 0; i < 3; i++) B.simStep(0.05);
      if (!P.dr.target) B.portalOpen5(P.dr); for (let i = 0; i < 20; i++) B.simStep(0.05);
      const w0 = B.G5.warps, on = B.PORT5.on && B.PORT5.P === P; B.K.add('KeyW'); for (let i = 0; i < 40 && B.G5.warps === w0; i++) B.simStep(0.05); B.K.delete('KeyW'); for (let i = 0; i < 4; i++) B.simStep(0.05);
      const cx = Math.floor(B.PL.x / 3.6), cz = Math.floor(B.PL.z / 3.6), out = { x: t.vx - t.fx, y: t.vy - t.fz };
      const fwd = Math.sin(B.PL.yaw) * -t.fx + Math.cos(B.PL.yaw) * -t.fz;
      res.push({ ok: B.G5.warps === w0 + 1 && cx === out.x && cz === out.y && fwd > 0.9, on, cell: [cx, cz], want: [out.x, out.y] });
    }
    return { res, errs: B.ERRS.n };
  });
  console.log('QA portals ' + JSON.stringify(cross));
  ok(cross.res.every(r => r.on), 'the open inner door renders the twin side (portal camera on) for every door');
  ok(cross.res.every(r => r.ok), 'every inner door carries you out of the twin\'s real door, facing its corridor');
  // the portal, seen from the ballroom vestibule
  await page.evaluate(() => { const B = window.__BR, LV = B.LV5(), v = LV.st5.va, P = B.PORT5.list.find(q => q.v === v); B.PL.x = v.cx - v.fx * 1.3; B.PL.z = v.cz - v.fz * 1.3; B.PL.cell = -1; B.PL.yaw = Math.atan2(v.fx, v.fz) + 0.15; B.PL.pitch = 0.02; if (!P.dr.target) B.portalOpen5(P.dr); for (let i = 0; i < 20; i++) B.simStep(0.05); });
  await shot('portal5');
  // ---- the fire lock: valves done but the exit stays shut ----
  const f = await page.evaluate(() => {
    const B = window.__BR, o = {};
    B.G5.keys = 3; B.unlockStaff5(B.W5.svDoor); for (let i = 0; i < 60; i++) B.simStep(0.05);
    B.setPhase5('valves'); for (const v of B.W5.valves) { if (!v.turned) B.finishValve5(v); } for (let i = 0; i < 40; i++) B.simStep(0.05);
    o.phase = B.G5.phase; o.obj = document.getElementById('objective').textContent; o.exitOn = B.W5.exit.on;
    B.useExit5(); o.toast = document.getElementById('toast').textContent; o.task = !!B.taskOf('fire5'); o.st = B.G.state;
    return o;
  });
  console.log('QA fire ' + JSON.stringify(f));
  ok(f.phase === 'fire' && !f.exitOn && /STATE FLOOR|SECURITY/.test(f.obj) && /FIRE LOCK/.test(f.toast) && f.task && f.st === 'play', 'all valves vented, but the exit is fire-locked: objective sends you to the State Floor');
  const go = (re) => page.evaluate((src) => { const B = window.__BR, { W, PL } = B, re = new RegExp(src), it = W.interact.filter(i => { try { return re.test(i.label()) && i.ok(); } catch (e) { return false; } })[0]; if (!it) return false; PL.x = it.x; PL.z = it.z; PL.cell = -1; for (let i = 0; i < 3; i++) B.simStep(0.05); it.act(); for (let i = 0; i < 3; i++) B.simStep(0.05); return true; }, re.source);
  const b = {};
  b.lock0 = await page.evaluate(() => { const B = window.__BR, d = B.W5.st.secDoor; B.PL.x = d.mx; B.PL.z = d.mz - 0.8; B.PL.cell = -1; B.simStep(0.05); for (const it of B.W.interact) if (it.door === d) { const l = it.label(); it.act(); return l; } });
  b.book = await go(/READ THE RESERVATIONS/); await page.evaluate(() => window.__BR.docClose && window.__BR.docClose());
  b.obj1 = await page.evaluate(() => document.getElementById('objective').textContent);
  // the Gold Room's males: Mothex kills them; flashlight off they keep circling
  b.circling = await page.evaluate(() => window.__BR.AI5.moths.filter(m => m.loyal && m.st === 'circle').length);
  b.spray = await go(/TAKE THE MOTHEX/); b.pest = await go(/PEST CONTROL/); await page.evaluate(() => window.__BR.docClose && window.__BR.docClose());
  Object.assign(b, await page.evaluate(() => {
    const B = window.__BR, m = B.AI5.moths.find(q => q.loyal && q.alive), o = {}; o.n0 = B.ST5.spray;
    B.PL.x = m.x - 2.0; B.PL.z = m.z; B.PL.cell = -1; B.PL.yaw = Math.PI / 2; m.y = 1.7; B.simStep(0.02); B.PL.yaw = Math.PI / 2; B.PL.pitch = 0; B.playerCamera(0.02);
    const keep = { x: m.x, z: m.z }; m.place(keep.x, keep.z); m.st = 'circle'; B.useSpray5(); o.dead = !m.alive; o.n1 = B.ST5.spray;
    for (let i = 0; i < 40; i++) B.simStep(0.05); o.y = m.y; return o;
  }));
  b.keys = await go(/TAKE THE OFFICER'S KEYS/);
  b.unlock = await page.evaluate(() => { const B = window.__BR, d = B.W5.st.secDoor; B.PL.x = d.mx; B.PL.z = d.mz - 0.8; B.PL.cell = -1; B.simStep(0.05); for (const it of B.W.interact) if (it.door === d) { const l = it.label(); it.act(); for (let i = 0; i < 40; i++) B.simStep(0.05); return { l, open: d.target, sec: B.ST5.sec }; } });
  b.cctv = await go(/WATCH THE MONITORS/);
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 30; i++) B.simStep(0.05); });
  await page.evaluate(() => { const B = window.__BR, d = B.W5.st.secDoor; B.PL.x = d.mx + 0.4; B.PL.z = d.mz + 1.6; B.PL.cell = -1; B.PL.yaw = Math.PI - 0.4; B.PL.pitch = -0.05; for (let i = 0; i < 6; i++) B.simStep(0.05); });
  await shot('security5');
  b.panel0 = await go(/FIRE LOCK PANEL · NO KEY/);
  Object.assign(b, await page.evaluate(() => ({ obj2: document.getElementById('objective').textContent, fk: !!window.__BR.taskOf('firekey5') })));
  // the East Room female: spray does nothing; breaking the glass wakes her; she spits; almond water calms her for good
  Object.assign(b, await page.evaluate(() => {
    const B = window.__BR, F = B.AI5.moths.find(m => m.fem && !m.boil), o = {};
    B.PL.x = F.x - 3; B.PL.z = F.z + 0.5; B.PL.cell = -1; B.PL.yaw = Math.atan2(F.x - B.PL.x, F.z - B.PL.z); B.PL.pitch = -0.45; B.simStep(0.02); B.PL.yaw = Math.atan2(F.x - B.PL.x, F.z - B.PL.z);
    const up = Math.atan2(F.y - 1.6, Math.hypot(F.x - B.PL.x, F.z - B.PL.z)); B.PL.pitch = -up; B.playerCamera(0.02);
    B.useSpray5(); o.femAlive = F.alive; o.femSt = F.st;
    for (let i = 0; i < 60; i++) B.simStep(0.05); o.acid = B.FEM5.acid.length + B.FEM5.pud.length; o.hp = B.PL.hp;
    return o;
  }));
  await shot('eastroom5');
  b.glass = await go(/BREAK THE GLASS/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 20; i++) B.simStep(0.05); return { fkey: B.ST5.fireKey, hp2: B.PL.hp }; }));
  await page.evaluate(() => { const B = window.__BR; B.PL.water = Math.max(B.PL.water, 2); B.PL.hp = 100; });
  b.bowl = await page.evaluate(() => { const B = window.__BR, F = B.AI5.moths.find(m => m.fem && !m.boil), it = B.W.interact.find(i => i.x === F.nest.bowl.x && i.z === F.nest.bowl.z); if (!it) return false; B.PL.x = it.x - 0.8; B.PL.z = it.z; B.PL.cell = -1; B.simStep(0.05); it.act(); return true; });
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, F = B.AI5.moths.find(m => m.fem && !m.boil); for (let i = 0; i < 300; i++) { B.PL.hp = 100; B.simStep(0.05); } const a0 = B.FEM5.acid.length; F.provoke('stir'); B.useSpray5(); for (let i = 0; i < 20; i++) B.simStep(0.05); return { fed: F.fed, fst: F.st, after: B.FEM5.acid.length - a0 }; }));
  // turn the fire key
  b.turn = await go(/TURN THE FIRE KEY/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, r = B.LV5().st5.panelR; for (let i = 0; i < 50; i++) { B.PL.x = r.position.x - 0.7; B.PL.z = r.position.z; B.simStep(0.05); } return { reset: B.ST5.reset, phase: B.G5.phase, exitOn: B.W5.exit.on, obj3: document.getElementById('objective').textContent, tasks: B.TASKS.list.map(t => t.id + (t.done ? '✓' : '')) }; }));
  b.win = await page.evaluate(() => { const B = window.__BR; B.useExit5(); for (let i = 0; i < 20; i++) B.simStep(0.05); return B.G.state; });
  console.log('QA l5 state story ' + JSON.stringify(b));
  ok(/LOCKED · SECURITY/.test(b.lock0), 'security office is locked at first');
  ok(b.book && /TABLE 9/.test(b.obj1), 'the reservation book points at table 9');
  ok(b.circling >= 2, 'Gold Room males circle the chandeliers');
  ok(b.spray && b.pest && b.dead && b.n1 === b.n0 - 1 && b.y < 0.3, 'Mothex: one pump kills a male; it drops to the floor');
  ok(b.keys && b.unlock && /OFFICER/.test(b.unlock.l) && b.unlock.open && b.unlock.sec, 'the officer\'s keys open security');
  ok(b.cctv && b.panel0 && /FIRE KEY/.test(b.obj2) && b.fk, 'the panel needs the fire key; objective sends you to the East Room');
  ok(b.femAlive && b.femSt === 'angry', 'Mothex does not kill a female; it makes her angry');
  ok(b.acid > 0 || b.hp < 100, 'an angry female spits acid');
  ok(b.glass && b.fkey, 'the fire key comes out of the case');
  ok(b.bowl && b.fed && b.after === 0, 'almond water in her bowl: she is calm for good, even when sprayed');
  ok(b.turn && b.reset && b.phase === 'exit' && b.exitOn && /EMERGENCY EXIT/.test(b.obj3), 'turning the fire key resets the lock; the exit opens');
  ok(b.win === 'won', 'the exit lets you out');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
