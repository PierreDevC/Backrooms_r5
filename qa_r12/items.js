// r12 items: the belt (wheel picks, Q uses), timed effects with rings beside the meters, lasting gains that carry to the next level,
// and Level 9's flashlight batteries (night shot still runs on the camcorder battery)
const assert = require('node:assert/strict');
module.exports = async (page) => {
  const check = (c, m) => { assert.ok(c, m); console.log('QA PASS ' + m); };
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play', 'brief9'].includes(window.__BR.G.state), null, { timeout: 400000 });
  const r = await page.evaluate(() => {
    const B = window.__BR, PL = B.PL, out = {};
    if (B.G.state === 'brief9') B.startIntro9();
    for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    B.G.grace = 1e9; B.AI9.watch.length = 0;
    out.start = { fbatt: PL.fbatt, cells: PL.cells, sel: PL.sel, up: { ...PL.up } };
    Object.assign(PL, { bars: 2, drinks: 2, cells: 1, water: 1, hp: 60, san: 60 });
    const wheel = dy => { dispatchEvent(new WheelEvent('wheel', { deltaY: dy, cancelable: true })); B.simStep(0.15); };
    wheel(100); out.sel1 = PL.sel; wheel(100); out.sel2 = PL.sel; wheel(-100); out.sel3 = PL.sel;
    for (let i = 0; i < 6; i++) wheel(10); out.selTrack = PL.sel;   // a trackpad's small deltas add up to one step
    B.updateHUD(0.3); out.beltOpen = document.getElementById('beltWrap').classList.contains('open'); out.beltName = document.getElementById('beltName').textContent;
    // use the bar with Q
    PL.sel = 'bar'; B.K.add('KeyQ'); B.JUST.add('KeyQ'); B.simStep(0.05); B.K.delete('KeyQ');
    B.updateHUD(0.3);
    out.bar = { bars: PL.bars, fed: PL.fedT, mend: PL.mendT, up: { ...PL.up }, hpMax: B.hpMax(), rings: ['hp', 'st', 'sa'].map(s => document.querySelectorAll('#fx_' + s + ' .ef').length), kHp: getComputedStyle(document.getElementById('hpBar').parentNode).width };
    const hp0 = PL.hp; PL.lastHurt = B.FX.t; for (let i = 0; i < 100; i++) B.simStep(0.1); out.mendGain = +(PL.hp - hp0).toFixed(1);
    // the drink
    PL.sel = 'drink'; B.useSel(); B.updateHUD(0.3);
    out.drink = { drinks: PL.drinks, wired: PL.wiredT, focus: PL.focusT, up: { ...PL.up }, sanMax: B.sanMax(), rings: ['hp', 'st', 'sa'].map(s => document.querySelectorAll('#fx_' + s + ' .ef').length) };
    // sanity in the dark: focus halves the loss
    const darkLoss = (focus) => { PL.san = 80; PL.focusT = focus ? 30 : 0; PL.flash = false; PL.nv = false; const L = B.lightAt; let s = 0; for (let i = 0; i < 20; i++) { PL.light = 0; B.simStep(0.05); } return 80 - PL.san; };
    // flashlight: its own batteries
    PL.flash = false; PL.nv = false; PL.fbatt = 50; PL.batt = 80;
    B.K.add('KeyF'); B.JUST.add('KeyF'); B.simStep(0.05); B.K.delete('KeyF'); out.flashOn = PL.flash;
    for (let i = 0; i < 100; i++) B.simStep(0.1);
    out.fl10 = { fbatt: +PL.fbatt.toFixed(2), batt: +PL.batt.toFixed(2) };
    PL.fbatt = 0.05; for (let i = 0; i < 5; i++) B.simStep(0.1); out.dead = { flash: PL.flash, fbatt: PL.fbatt };
    B.K.add('KeyF'); B.JUST.add('KeyF'); B.simStep(0.05); B.K.delete('KeyF'); out.reload = { flash: PL.flash, fbatt: PL.fbatt, cells: PL.cells };
    PL.flash = false; PL.nv = true; const b0 = PL.batt, f0 = PL.fbatt; for (let i = 0; i < 50; i++) B.simStep(0.1); out.nv = { batt: +(b0 - PL.batt).toFixed(2), fbatt: +(f0 - PL.fbatt).toFixed(2) }; PL.nv = false;
    B.updateHUD(0.3); out.fbHud = !document.getElementById('fbatt').classList.contains('hide');
    // pick-ups of every kind
    const kinds = {}; for (const it of B.W.items) kinds[it.type] = (kinds[it.type] || 0) + 1; out.kinds = kinds;
    out.carry = B.carryFrom9(); out.errs = B.ERRS.n;
    return out;
  });
  console.log('ITEMS ' + JSON.stringify(r));
  check(r.start.fbatt === 80 && r.start.cells === 1 && r.start.sel === 'water' && r.start.up.vit === 0, 'Level 9 on Normal: flashlight at 80%, one spare pack, belt on almond water, no gains yet');
  check(r.sel1 === 'bar' && r.sel2 === 'drink' && r.sel3 === 'bar' && r.selTrack === 'drink', `the wheel steps along the belt (${r.sel1}, ${r.sel2}, ${r.sel3}; trackpad ${r.selTrack})`);
  check(r.beltOpen && /ENERGY DRINK ×2/.test(r.beltName), 'the belt shows the picked item by name');
  check(r.bar.bars === 1 && r.bar.fed > 50 && r.bar.mend > 30 && r.bar.rings[0] === 1 && r.bar.rings[1] === 1 && r.bar.rings[2] === 0, 'Q eats the bar: MEND ring beside VIT, FED ring beside STA');
  check(r.bar.up.vit === 2 && r.bar.hpMax === 102 && Math.abs(r.bar.up.sta - 0.01) < 1e-6, 'the bar leaves a lasting gain: max VIT 102, stamina +1%');
  check(r.mendGain > 3.5, `MEND heals over time with the regen held off (+${r.mendGain} VIT in 10 s)`);
  check(r.drink.drinks === 1 && r.drink.wired > 30 && r.drink.focus > 30 && r.drink.rings[1] >= 2 && r.drink.rings[2] === 1, 'the drink: WIRED ring beside STA, FOCUS ring beside SAN');
  check(r.drink.sanMax === 102 && Math.abs(r.drink.up.sta - 0.04) < 1e-6, 'the drink leaves stamina +3% and max SAN +2');
  check(r.flashOn && r.fl10.fbatt < 50 - 4 && r.fl10.fbatt > 50 - 7 && Math.abs(r.fl10.batt - 80) < 0.01, `the flashlight drains its own batteries, not the camcorder (${r.fl10.fbatt}%, camcorder ${r.fl10.batt}%)`);
  check(!r.dead.flash && r.reload.flash && r.reload.fbatt > 99.5 && r.reload.cells === 0, 'a dead flashlight goes out; F loads the spare pack and lights it again');
  check(r.nv.batt > 3 && r.nv.fbatt === 0, 'night shot runs on the camcorder battery');
  check(r.fbHud, 'the LIGHT battery meter shows in Level 9');
  check(r.carry.up.vit === 2 && r.carry.up.san === 2 && r.carry.bars === 1 && r.carry.drinks === 1, 'the gains and the stored items go with you to the next level');
  check(r.errs === 0, 'no frame errors');
};
