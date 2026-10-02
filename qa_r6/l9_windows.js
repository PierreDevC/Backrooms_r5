// r6 QA: Level 9 windows you can see through (ground floor openings, upstairs portals), LOOK OUTSIDE, deadbolts.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1500); await page.screenshot({ path: path.join(out, 'r6_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 0; B.RUN.f = {}; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, LV, W } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    for (const w of B.AI9.watch || []) w.place(5, 5, 0);
    o.wins = LV.winList.length; o.holes = LV.winList.filter(w => w.hole && !w.up).length; o.portals = LV.winList.filter(w => w.portal).length;
    o.look = W.interact.filter(i => i.win).length; o.portalMesh = !!B.PORT9.mesh;
    // a ground window of an enterable house that is not the Hale or Watch house, and one upstairs portal of the same house if possible
    const g = LV.winList.find(w => w.hole && !w.up && LV.winList.some(u => u.portal && u.h === w.h)) || LV.winList.find(w => w.hole && !w.up);
    window.__QW = { g, u: LV.winList.find(u => u.portal && u.h === g.h) || LV.winList.find(u => u.portal) };
    return o;
  });
  console.log('QA windows ' + JSON.stringify(a));
  ok(a.holes > 20 && a.portals > 20 && a.look === a.holes + a.portals && a.portalMesh, 'real windows downstairs, portals upstairs, LOOK OUTSIDE on each');
  const stand = (which, inside, back, name) => page.evaluate(([which, inside, back]) => {
    const B = window.__BR, { PL, CELL } = B, w = window.__QW[which], DX = [1, 0, -1, 0], DY = [0, 1, 0, -1], x = which === 'u' ? w.ux : w.x, y = which === 'u' ? w.uy : w.y;
    const mx = (x + 0.5) * 3.6 + DX[w.d] * 1.8, mz = (y + 0.5) * 3.6 + DY[w.d] * 1.8, s = inside ? -1 : 1;
    PL.x = mx + DX[w.d] * back * s; PL.z = mz + DY[w.d] * back * s; PL.cell = -1; PL.yaw = Math.atan2(-DX[w.d] * s, -DY[w.d] * s); PL.pitch = 0.05; PL.flash = false;
    for (let i = 0; i < 10; i++) B.simStep(0.05);
    return { pl: [PL.x, PL.z].map(v => +v.toFixed(2)), portalOn: B.PORT9.on, k: B.PORT9.k };
  }, [which, inside, back]).then(async r => { await shot(name); return r; });
  const g1 = await stand('g', true, 1.4, 'win_ground_inside');
  const g2 = await stand('g', false, 3.0, 'win_ground_outside');
  const u1 = await stand('u', true, 1.4, 'win_upstairs_portal');
  console.log('QA stand ' + JSON.stringify({ g1, g2, u1 }));
  ok(u1.portalOn && u1.k > 0.5, 'upstairs portal renders while you face it');
  // LOOK OUTSIDE from upstairs
  const pk = await page.evaluate(() => { const B = window.__BR, { PL, W } = B, w = window.__QW.u, it = W.interact.find(i => i.win === w); PL.x = it.x; PL.z = it.z; PL.yaw = w.look.yaw; for (let i = 0; i < 3; i++) B.simStep(0.05); const lab = it.label(); it.act(); for (let i = 0; i < 30; i++) B.simStep(0.05); const C = B.CAM(); return { lab, lab2: it.label(), peek: !!B.PEEK9.rec, k: +B.PEEK9.k.toFixed(2), camD: +Math.hypot(C.position.x - w.look.x, C.position.z - w.look.z).toFixed(2), portal: B.PORT9.on }; });
  await shot('win_peek_upstairs');
  const pk2 = await page.evaluate(() => { const B = window.__BR, { PL } = B; PL.x += 0.6; for (let i = 0; i < 20; i++) B.simStep(0.05); return { peek: !!B.PEEK9.rec }; });
  console.log('QA peek ' + JSON.stringify({ pk, pk2 })); ok(pk.lab === 'LOOK OUTSIDE' && pk.lab2 === 'STOP LOOKING' && pk.peek && pk.camD < 0.2 && pk.portal, 'LOOK OUTSIDE puts the camcorder at the glass (portal live upstairs)'); ok(!pk2.peek, 'stepping away ends it');
  // you cannot climb through a ground-floor window
  const col = await page.evaluate(() => { const B = window.__BR, { PL } = B, w = window.__QW.g, DX = [1, 0, -1, 0], DY = [0, 1, 0, -1], mx = (w.x + 0.5) * 3.6 + DX[w.d] * 1.8, mz = (w.y + 0.5) * 3.6 + DY[w.d] * 1.8;
    PL.x = mx - DX[w.d] * 0.6; PL.z = mz - DY[w.d] * 0.6; PL.cell = -1; PL.yaw = Math.atan2(DX[w.d], DY[w.d]); for (let i = 0; i < 60; i++) { B.K.add('KeyW'); B.simStep(0.05); } B.K.delete('KeyW');
    const side = (PL.x - mx) * DX[w.d] + (PL.z - mz) * DY[w.d]; return { side: +side.toFixed(2) }; });
  console.log('QA collide ' + JSON.stringify(col)); ok(col.side < 0, 'the sill still blocks: you stay inside');
  // deadbolt
  const db = await page.evaluate(() => { const B = window.__BR, { PL, W9 } = B, dr = W9.doors.find(d => d.dk === 'front' && d.turn); dr.target = 1; B.setDoor(dr, false); for (let i = 0; i < 30; i++) B.simStep(0.05);
    const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1], e = dr.e; PL.x = dr.mx - DX[e.d] * 1.0; PL.z = dr.mz - DY[e.d] * 1.0; PL.cell = -1; PL.yaw = Math.atan2(DX[e.d], DY[e.d]); PL.pitch = 0.1; PL.flash = true;
    const r0 = dr.turn.rotation.z; B.latchDoor(dr); for (let i = 0; i < 20; i++) B.simStep(0.05); window.__QD = dr; return { latched: dr.latched, lk: dr.lk, rot0: r0, rot1: +dr.turn.rotation.z.toFixed(2), bolt: +(dr.bolt.position.x - dr.boltX).toFixed(3) }; });
  await page.evaluate(() => { const B = window.__BR, dr = window.__QD, { PL } = B; const p = dr.turn.getAbsolutePosition(); PL.yaw = Math.atan2(p.x - PL.x, p.z - PL.z); PL.pitch = -Math.atan2(p.y - 1.62, Math.hypot(p.x - PL.x, p.z - PL.z)); PL.zoomT = true; for (let i = 0; i < 20; i++) B.simStep(0.05); });
  await shot('deadbolt_locked');
  await page.evaluate(() => { window.__BR.PL.zoomT = false; });
  console.log('QA deadbolt ' + JSON.stringify(db)); ok(db.latched && db.lk === 1 && Math.abs(db.rot1 + 1.57) < 0.02 && db.bolt > 0.04, 'latching turns the thumb-turn and throws the bolt');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
