// Level 2 surges: steam fills the heat bar fast outside cover and a full bar burns hard; cover keeps you safe; the tunnels' own heat never fills the bar
const assert = require('node:assert/strict');
module.exports = async (page) => {
  const check = (c, m) => { assert.ok(c, m); console.log('QA PASS ' + m); };
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  const run = (diff) => page.evaluate(async (diff) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = diff; B.goLevel2(null); }, diff);
  const res = {};
  for (const diff of [0, 1, 2]) {
    await run(diff);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 400000 });
    res[diff] = await page.evaluate(() => { const B = window.__BR, C = 3.6; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); B.G.grace = 1e9; B.PP2.surgesOn = true; B.PP2.step = 3;
      const revive = () => { if (B.G.state === 'dead') { if (B.cpAvail()) B.cpRetry(); else { B.G.state = 'play'; B.G.cause = ''; } } };
      const surge = (x, z) => { revive(); for (let i = 0; i < 40; i++) B.simStep(0.05); B.PL.hp = 100; B.GP2.heat = 0.2; B.endSurge2(); B.GP2.surgeT = 0.05; B.PL.x = x * C; B.PL.z = z * C; B.PL.cell = -1;
        let full = -1, t = 0; const tr = []; for (; t < 30 && B.G.state === 'play'; t += 0.5) { for (let k = 0; k < 10; k++) { B.PL.x = x * C; B.PL.z = z * C; B.simStep(0.05); } if (full < 0 && B.GP2.heat >= 0.999) full = t - 11; if (t % 2 === 0) tr.push(Math.round(B.GP2.heat * 100) + '/' + Math.round(B.PL.hp)); if (!B.GP2.surge && t > 12) break; }
        return { full, hp: Math.round(B.PL.hp), state: B.G.state, cause: B.G.cause, tr: tr.join(' ') }; };
      const shelter = surge(26.5, 29.5), open = surge(27.5, 36.5);
      // ten minutes in the hottest gallery, no surge: the bar stops short of full and nothing burns
      revive(); for (let i = 0; i < 40; i++) B.simStep(0.05); B.endSurge2(); B.GP2.surgeT = 1e9; B.PL.hp = 100; B.GP2.heat = 0; B.PL.x = 3.5 * C; B.PL.z = 40.2 * C; B.PL.cell = -1;
      for (let i = 0; i < 600 * 4; i++) { B.PL.x = 3.5 * C; B.PL.z = 40.2 * C; B.PL.san = 100; B.simStep(0.25); }
      return { open, shelter, ambient: { heat: +B.GP2.heat.toFixed(2), hp: Math.round(B.PL.hp) } }; });
    console.log('STEAM ' + diff + ' ' + JSON.stringify(res[diff]));
  }
  check(res[1].open.full > 0 && res[1].open.full <= 6, `Normal: steam fills the heat bar ${res[1].open.full} s after it arrives, in an open tunnel`);
  check(res[1].open.state === 'dead' && res[1].open.cause === 'steam', 'Normal: a whole surge in the open kills you (SCALDED)');
  check(res[0].open.state === 'play' && res[0].open.hp < 80, `Easy: a whole surge in the open hurts badly but you live (${res[0].open.hp} HP)`);
  check(res[2].open.state === 'dead', 'Nightmare: a whole surge in the open kills you');
  for (const d of [0, 1, 2]) check(res[d].shelter.state === 'play' && res[d].shelter.hp === 100 && res[d].shelter.full < 0, `difficulty ${d}: a refuge keeps you safe`);
  for (const d of [0, 1, 2]) check(res[d].ambient.heat <= 0.9 && res[d].ambient.hp === 100, `difficulty ${d}: ten minutes in the hottest room never fills the bar`);
};
