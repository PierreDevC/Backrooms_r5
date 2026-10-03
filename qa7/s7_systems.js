module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel7(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    window.T = { step(s) { for (let i = 0; i < s * 20; i++) B.simStep(0.05); }, st() { return { state: B.G.state, hp: Math.round(B.PL.hp), cause: B.G.cause, errs: B.ERRS.n, last: B.ERRS.last }; } }; });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  await run('shadow-hunt', () => { const B = window.__BR, C = 3.6, S = B.AIS7.shadow; B.PS7.met = true; S.st = 'patrol'; S.gone = false; B.PL.x = 50 * C; B.PL.z = 50 * C; B.PL.cell = -1; B.G37.ey = 0.22; B.PL.hp = 100; S.place(46 * C, 50 * C, 0); S.y = -5;
    const prey = S.playerPrey(), r = []; for (let i = 0; i < 40; i++) { B.PL.noise = 0.5; for (let k = 0; k < 10; k++) B.simStep(0.05); r.push(S.st[0] + Math.round(S.d) + ':' + Math.round(B.PL.hp)); if (B.G.state !== 'play') break; } return [prey, r.join(' '), T.st()]; });
  await run('shadow-flare', () => { const B = window.__BR, C = 3.6, S = B.AIS7.shadow; if (B.G.state !== 'play') { B.cpRetry(); T.step(6); } B.PL.hp = 100; B.PL.x = 50 * C; B.PL.z = 50 * C; B.PL.cell = -1; B.PS7.flares = 2; S.st = 'hunt'; S.gone = false; S.place(46 * C, 50 * C, 0); S.atkCd = 0; B.useFlare7(); const r = []; for (let i = 0; i < 12; i++) { for (let k = 0; k < 10; k++) B.simStep(0.05); r.push(S.st[0] + Math.round(S.d)); } return [r.join(' '), B.lit7(B.PL.x, B.PL.z), T.st()]; });
  await run('lit', () => { const B = window.__BR, C = 3.6; return { open: B.lit7(50 * C, 50 * C), rig: B.lit7(30 * C, 22 * C), beforeGen: B.lit7(31 * C, 17 * C) }; });
  await run('gulper', () => { const B = window.__BR, C = 3.6; if (B.G.state !== 'play') { B.cpRetry(); T.step(6); } B.PL.hp = 100; B.PL.x = 17 * C; B.PL.z = 52 * C; B.PL.cell = -1; B.G37.ey = -4; const f = B.AIS7.fish[1]; f.aggro(); f.place(18 * C, 52 * C, 0); const r = []; for (let i = 0; i < 16; i++) { B.G37.breath = 1; for (let k = 0; k < 10; k++) { B.G37.ey = -4; B.simStep(0.05); } r.push(Math.round(B.PL.hp)); } return [r.join(' '), T.st(), f.st]; });
  await run('drown', () => { const B = window.__BR, C = 3.6; if (B.G.state !== 'play') { B.cpRetry(); T.step(6); } B.PL.hp = 100; B.PL.x = 40 * C; B.PL.z = 20 * C; B.PL.cell = -1; B.G37.ey = -3; B.G37.breath = 0.01; for (let i = 0; i < 300 && B.G.state === 'play'; i++) { B.G37.ey = -3; B.simStep(0.05); } return T.st(); });
  await run('retry', () => { const B = window.__BR; B.cpRetry(); T.step(6); const a = T.st(); a.shadow = B.AIS7.shadow.st; a.breath = B.G37.breath; return a; });
};
