// r12 loot: on every level energy bars / drinks on the floor, drawers against walls, one locked chest, its key in a drawer, two optional tasks.
// BR_LOOT_LEVELS=9,0 limits the levels. Screenshots of an open drawer and the open chest go to BR_QA_OUT.
const assert = require('node:assert/strict');
const path = require('path');
// (the level order matters for 0: it is the scene the page boots into)
const ALL = { 0: 'startGame', 9: 'goLevel9', 5: 'goLevel5', 18: 'goLevel18', 37: 'goLevel37', 2: 'goLevel2', 7: 'goLevel7' };
module.exports = async (page) => {
  const check = (c, m) => { assert.ok(c, m); console.log('QA PASS ' + m); };
  page.on('pageerror', e => console.log('PAGEERROR ' + e.message));
  const levels = (process.env.BR_LOOT_LEVELS || '9,0,5,18,37,2,7').split(',').map(Number);
  for (const lv of levels) {
    await page.evaluate(([lv, fn]) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN && (B.RUN.f = {}); if (lv === 0) B.startGame(true); else { try { B.G9.from = null; } catch (e) {} B[fn](null); } }, [lv, ALL[lv]]);
    await page.waitForFunction(() => ['intro', 'play', 'brief9', 'brief'].includes(window.__BR.G.state), null, { timeout: 400000 });
    const r = await page.evaluate(() => {
      const B = window.__BR, { PL, G, W } = B, o = {}; if (G.state === 'brief9') B.startIntro9();
      for (let i = 0; i < 500 && G.state !== 'play'; i++) B.simStep(0.05);
      G.grace = 1e9; for (const a of B.AI.all || []) { a.update = () => {}; }
      const L = W.loot; o.lvl = B.LVs ? 1 : 0; if (!L) return { none: true };
      const items = () => ({ spare: PL.spare, bars: PL.bars || 0, drinks: PL.drinks || 0, water: PL.water, cells: PL.cells || 0 });
      o.units = L.units.length; o.chest = !!L.chest; o.floor = { bar: W.items.filter(i => i.type === 'bar').length, drink: W.items.filter(i => i.type === 'drink').length, cells: W.items.filter(i => i.type === 'cells').length }; o.theme = [L.T.chest, L.T.key]; o.keyUnit = !!L.keyUnit;
      o.tasks0 = ['lootkey', 'lootchest'].map(id => { const t = B.taskOf(id); return t ? [t.opt, t.done, t.hidden] : null; });
      o.labels = new Set(W.interact.map(i => { try { return i.label && i.label(); } catch (e) { return ''; } }).filter(s => /DRAWER|LOCKED/.test(s)));
      o.labels = [...o.labels];
      // aim at the first drawer unit and the chest from their fronts: the game must pick them as the focus
      const aim = (spot, label) => { const x = spot.x, z = spot.z; PL.x = spot.fx; PL.z = spot.fz; PL.cell = -1; PL.yaw = Math.atan2(x - spot.fx, z - spot.fz); PL.pitch = Math.atan2(1.62 - 0.5, 0.75); for (let i = 0; i < 4; i++) B.simStep(0.05); const f = PL.focus; return !!f && f.label() === label; };
      o.aimUnit = aim(L.units[0].spot, 'OPEN DRAWER'); o.aimChest = aim(L.chest.spot, 'LOCKED · NEEDS THE ' + L.T.key);
      // locked without the key
      const b0 = items(); B.lootOpenChest(L.chest); o.lockedStays = !L.chest.open && JSON.stringify(items()) === JSON.stringify(b0);
      // search drawers until the key turns up
      let opened = 0, got = 0; const b1 = items();
      for (const u of L.units) { while (u.next < u.drawers.length && !L.hasKey) { B.lootOpenDrawer(u); opened++; } if (L.hasKey) break; }
      o.drawersToKey = opened; o.hasKey = L.hasKey;
      o.tasksKey = ['lootkey', 'lootchest'].map(id => { const t = B.taskOf(id); return t ? [t.opt, t.done, t.hidden] : null; });
      // open every remaining drawer, then the chest
      for (const u of L.units) while (u.next < u.drawers.length) B.lootOpenDrawer(u);
      const b2 = items(); o.fromDrawers = Object.keys(b2).reduce((a, k) => a + (b2[k] - b1[k]), 0);
      o.labelAfter = aim(L.units[0].spot, 'OPEN DRAWER');   // all open: nothing left to focus on
      for (let i = 0; i < 60; i++) B.simStep(0.05);
      B.lootOpenChest(L.chest); const b3 = items(); o.fromChest = Object.keys(b3).reduce((a, k) => a + (b3[k] - b2[k]), 0); o.chestOpen = L.chest.open;
      for (let i = 0; i < 80; i++) B.simStep(0.05);
      o.lid = +L.chest.hinge.rotation.x.toFixed(2); o.drawerOut = +L.units[0].drawers[0].m.position.z.toFixed(2);
      o.tasksEnd = ['lootkey', 'lootchest'].map(id => { const t = B.taskOf(id); return t ? [t.opt, t.done] : null; });
      o.errs = B.ERRS.n; o.sp = [L.units[0].spot.fx, L.units[0].spot.fz, L.units[0].spot.x, L.units[0].spot.z, L.chest.spot.fx, L.chest.spot.fz, L.chest.spot.x, L.chest.spot.z];
      return o;
    });
    console.log('QA level', lv, JSON.stringify(r));
    check(!r.none, `level ${lv}: loot built`);
    const nm = r.theme[0];
    check(r.units >= 4 && r.chest && r.keyUnit, `level ${lv}: ${r.units} drawer units, a ${nm} and its key placed`);
    check(r.floor.bar >= 2 && r.floor.drink >= 1 && (lv !== 9 || r.floor.cells >= 2), `level ${lv}: floor pickups ${JSON.stringify(r.floor)}`);
    check(r.tasksKey[0] && r.tasksKey[0][1] && r.tasksKey[1] && !r.tasksKey[1][2], `level ${lv}: finding the key ticks the key task and opens the chest task`);
    check(r.tasks0[0] && r.tasks0[0][0] === true && !r.tasks0[0][2] && r.tasks0[1] === null, `level ${lv}: the key task starts as an optional lead, the chest task waits for the key`);
    check(r.aimUnit && r.aimChest, `level ${lv}: standing in front and looking at a drawer unit / the chest makes it the focus`);
    check(r.lockedStays && r.hasKey && r.chestOpen, `level ${lv}: the ${nm} stays shut without the key (nothing given) and opens with it`);
    check(r.fromChest >= 8 && r.fromDrawers >= 1, `level ${lv}: the chest gave ${r.fromChest} things at once, the drawers ${r.fromDrawers}`);
    check(r.tasksEnd[0][1] && r.tasksEnd[1][1], `level ${lv}: both tasks done`);
    check(r.lid < -1 && r.drawerOut > 0.28, `level ${lv}: the lid swings up (${r.lid}) and the drawers slide out (${r.drawerOut} m)`);
    check(!r.labelAfter, `level ${lv}: opened drawers are no longer offered`);
    check(r.errs === 0, `level ${lv}: no frame errors`);
    // screenshots
    await page.evaluate(() => { const B = window.__BR, L = B.W.loot, s = L.chest.spot, { PL } = B; PL.x = s.x + s.nx * 1.7; PL.z = s.z + s.nz * 1.7; PL.cell = -1; PL.yaw = Math.atan2(-s.nx, -s.nz); PL.pitch = 0.66; PL.flash = true; PL.batt = 100; for (let i = 0; i < 8; i++) B.simStep(0.05); });
    await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1500); await page.screenshot({ path: path.join(process.env.BR_QA_OUT || '.', `loot_${lv}_chest.png`) });
    await page.evaluate(() => { const B = window.__BR, L = B.W.loot, s = L.units[0].spot, { PL } = B; PL.x = s.x + s.nx * 1.7; PL.z = s.z + s.nz * 1.7; PL.cell = -1; PL.yaw = Math.atan2(-s.nx, -s.nz); PL.pitch = 0.62; B.DBG.ts = 1; for (let i = 0; i < 8; i++) B.simStep(0.05); B.DBG.ts = 0; });
    await page.waitForTimeout(1500); await page.screenshot({ path: path.join(process.env.BR_QA_OUT || '.', `loot_${lv}_drawers.png`) }); await page.evaluate(() => { window.__BR.DBG.ts = 1; });
  }
};
