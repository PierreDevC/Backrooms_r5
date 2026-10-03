const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT;
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel37(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W37 && window.__BR.W37.pos, null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  // helper executed in page: act on the first interactable whose label matches
  await page.evaluate(() => {
    const B = window.__BR; window.T = {
      log: [],
      step(s) { for (let i = 0; i < s * 20; i++) B.simStep(0.05); },
      act(re, hold) { const it = B.W.interact.find(i => { try { return re.test(i.label()) && (!i.ok || i.ok()); } catch (e) { return false; } }); if (!it) { T.log.push('NO ' + re); return false; }
        B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); it.act(); if (hold) T.step(hold); else T.step(0.2); T.log.push('ok ' + re + ' | obj: ' + B.obj37()); return true; },
      st() { return { phase: B.G37.phase, errs: B.ERRS.n, last: B.ERRS.last, wings: B.wingsDone37(), keys: JSON.stringify(B.P37.keys), flood: B.G37.flood, state: B.G.state }; }
    };
  });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  await run('teague', () => { const B = window.__BR; const N = B.AI37.teague; B.P37.hotel.given = true; B.P37.hotel.sw = true; B.P37.hotel.met = true; B.P37.hotel.ask = true; B.P37.told = true;
    B.PL.x = N.inter.x - 1; B.PL.z = N.inter.z; B.PL.cell = -1; B.talkTeague37(); const xs = []; for (let i = 0; i < 24; i++) { B.PL.x = N.inter.x - 1; B.PL.z = N.inter.z; T.step(1); xs.push(+(N.x / 3.6).toFixed(1)); } return [xs.join(' '), B.P37.hotel.timed, B.P37.hotel.vaultKey, T.st()]; });
  await run('fish', () => { const B = window.__BR, LV = B.LV37(); const f = B.AI37.wwf; const hp0 = B.PL.hp; B.P37.keys.tape = true; f.aggro(); const c = f.cells[0]; B.PL.x = (c % 72 + 0.5) * 3.6; B.PL.z = (Math.floor(c / 72) + 0.5) * 3.6; B.PL.cell = -1; const r = []; for (let i = 0; i < 40; i++) { T.step(1); r.push([Math.round(f.d), Math.round(B.PL.hp)]); if (B.G.state !== 'play') break; } return [hp0, r.join('|'), B.G.state, B.G.cause, f.cells.length, f.st, f.shown]; });
};
