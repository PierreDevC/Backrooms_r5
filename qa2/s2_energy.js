// Level 2 energy bars and energy drinks: placed through the map, picked up, used; the drink makes sprinting cheaper, the bar speeds recovery
const assert = require('node:assert/strict'), path = require('path');
module.exports = async (page) => {
  const check = (c, m) => { assert.ok(c, m); console.log('QA PASS ' + m); };
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel2(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 400000 });
  const r = await page.evaluate(() => { const B = window.__BR, W = B.W; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); B.G.grace = 1e9; B.PL.hp = 80;
    const items = W.items.filter(i => i.type === 'bar' || i.type === 'drink'), bars = items.filter(i => i.type === 'bar'), cans = items.filter(i => i.type === 'drink');
    const zones = new Set(items.map(i => B.LV2().zone[B.cell2(i.x, i.z)]));
    const take = it => { const I = W.interact.find(q => q.it === it); B.PL.x = it.x; B.PL.z = it.z; B.PL.cell = -1; B.simStep(0.05); I.act(); return I.label(); };
    const lb = take(bars[0]), ld = take(cans[0]);
    B.updateHUD(0.3); const inv = document.getElementById('inv').textContent;
    // sprint drain over 2 s, without and with the drink
    const drain = (boost) => { B.PL.x = 27.5 * 3.6; B.PL.z = 44 * 3.6; B.PL.cell = -1; B.PL.yaw = Math.PI; B.PL.vx = B.PL.vz = 0; B.PL.sta = 1; B.PL.exh = false; B.PL.wiredT = 0; if (boost) { B.drinkEnergy(); } const s0 = B.PL.sta; for (let i = 0; i < 40; i++) { B.PL.yaw = Math.PI; B.K.add('ShiftLeft'); B.K.add('KeyW'); B.simStep(0.05); } B.K.delete('ShiftLeft'); B.K.delete('KeyW'); return s0 - B.PL.sta; };
    const d0 = drain(false), d1 = drain(true);
    // recovery over 2 s standing still, without and with the bar
    const rec = (boost) => { B.PL.sta = 0.2; B.PL.exh = false; B.PL.fedT = 0; if (boost) { B.eatBar(); B.PL.sta = 0.2; } for (let i = 0; i < 40; i++) B.simStep(0.05); return B.PL.sta - 0.2; };
    const r0 = rec(false); B.PL.bars = 1; const hp0 = B.PL.hp; const r1 = rec(true);
    return { nb: bars.length, nc: cans.length, zones: zones.size, lb, ld, inv, d0: +d0.toFixed(3), d1: +d1.toFixed(3), r0: +r0.toFixed(3), r1: +r1.toFixed(3), hp: [hp0, B.PL.hp], left: [B.PL.bars, B.PL.drinks], errs: B.ERRS.n };
  });
  console.log('ENERGY ' + JSON.stringify(r));
  check(r.nb === 5 && r.nc === 4 && r.zones >= 3, `Normal: 5 bars and 4 drinks spread over ${r.zones} kinds of room`);
  check(r.lb === 'TAKE ENERGY BAR' && r.ld === 'TAKE ENERGY DRINK' && /BAR ×1 · CAN ×1/.test(r.inv), 'pick-ups show in the inventory line');
  check(r.d1 < r.d0 * 0.5 && r.d0 > 0.2, `the drink makes sprinting cost less (${r.d0} -> ${r.d1} over 2 s)`);
  check(r.r1 > r.r0 * 1.7, `the bar makes stamina come back faster (${r.r0} -> ${r.r1} over 2 s)`);
  check(r.hp[1] > r.hp[0] && r.left[0] === 0 && r.left[1] === 0 && r.errs === 0, 'the bar also restores a little health; both are used up');
};
