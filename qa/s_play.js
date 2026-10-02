module.exports = async (page, logs) => {
  const B = 'window.__BR';
  const fr = n => page.waitForTimeout(n * 1100);
  await page.evaluate(() => { const B = window.__BR; B.startGame(); B.beginPlay(); document.getElementById('blue').classList.add('hide'); B.FX.fadeB = 0; B.G.grace = 9999; });
  const st = await page.evaluate(() => { const B = window.__BR, LV = B.LV; const a = [], d = []; for (let c = 0; c < LV.cellLight.length; c++) (LV.dark[c] ? d : a).push(LV.cellLight[c] * 2); a.sort((x, y) => x - y); d.sort((x, y) => x - y); const q = (v, p) => v[Math.floor(p * (v.length - 1))]; return { lit: [q(a, 0.05), q(a, 0.25), q(a, 0.5), q(a, 0.95)], dark: [q(d, 0.05), q(d, 0.5), q(d, 0.95)], nd: d.length }; });
  logs.push('QA light ' + JSON.stringify(st));
  await fr(4);
  const shot = async (name, setup) => {
    await page.evaluate(`(${setup})()`);
    await page.evaluate(() => { window.__BR.G.state = 'play'; });
    await fr(3);
    await page.evaluate(() => { window.__BR.G.state = 'paused'; window.__BR.FX.fadeB = 0; });
    await fr(2);
    await page.screenshot({ path: `/data/qa/${name}.png` });
    const info = await page.evaluate(() => { const B = window.__BR; return { hp: B.PL.hp, st: B.G.state, light: B.PL.light.toFixed(2), fk: B.PL.fk.toFixed(2) }; });
    logs.push('QA ' + name + ' ' + JSON.stringify(info));
  };
  await shot('p_spawn', () => {});
  await shot('p_explorer', () => { const B = window.__BR, P = B.PL, e = B.AI.exps[0]; P.flash = true; e.place(P.x + Math.sin(P.yaw) * 3.5, P.z + Math.cos(P.yaw) * 3.5, P.yaw + Math.PI + 0.5); e.st = 'idle'; e.stT = 0; e.dur = 99; });
  await shot('p_howler', () => { const B = window.__BR, P = B.PL, e = B.AI.exps[0], h = B.AI.howlers[0]; e.place(1, 1); h.place(P.x + Math.sin(P.yaw) * 4.5, P.z + Math.cos(P.yaw) * 4.5, P.yaw + Math.PI); h.st = 'feed'; h.stT = -99; });
}
