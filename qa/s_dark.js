module.exports = async (page, logs) => {
  const fr = n => page.waitForTimeout(n * 1100);
  await page.evaluate(() => { const B = window.__BR; B.startGame(); B.beginPlay(); document.getElementById('blue').classList.add('hide'); B.FX.fadeB = 0; B.G.grace = 9999;
    const h = B.LV.halls.reduce((a, b) => a.w * a.h > b.w * b.h ? a : b), C = 3.6;
    B.PL.x = (h.x0 + 0.5) * C; B.PL.z = (h.y0 + 0.5) * C; B.PL.yaw = Math.atan2(h.w, h.h); B.PL.pitch = 0.05;
    for (const e of B.AI.exps) e.place(1, 1); for (const e of B.AI.howlers) e.place(2, 2); if (B.AI.mimic) B.AI.mimic.place(3, 3);
    for (const s of B.AI.smilers) s.place(4, 4);
  });
  await fr(3);
  const ahead = (d, side = 0) => `var P = window.__BR.PL, X = P.x + Math.sin(P.yaw) * ${d} + Math.cos(P.yaw) * ${side}, Z = P.z + Math.cos(P.yaw) * ${d} - Math.sin(P.yaw) * ${side};`;
  const shot = async (name, setup, frames = 3) => {
    await page.evaluate(`(() => { ${setup} })()`);
    await page.evaluate(() => { const B = window.__BR; B.G.state = 'play'; });
    await fr(frames);
    await page.evaluate(() => { const B = window.__BR; B.G.state = 'paused'; B.FX.fadeB = 0; document.getElementById('subs').innerHTML = ''; });
    await fr(2);
    await page.screenshot({ path: `/data/qa/${name}.png` });
    const info = await page.evaluate(() => { const B = window.__BR; const o = { light: B.PL.light.toFixed(2), ls: B.FX.lightScale.toFixed(2), exp: B.FX.exposure.toFixed(2) }; for (const a of B.AI.all) if (a.shown && a.d < 15) o[a.constructor.name + (a.i ?? '')] = [a.d.toFixed(1), a.st, a.present]; return o; });
    logs.push('QA ' + name + ' ' + JSON.stringify(info));
  };
  await shot('d_nvlit', `window.__BR.PL.nv = true;`);
  await shot('d_beam', `window.__BR.PL.nv = false; window.__BR.PL.flash = false; ${ahead(4.5, 0)} var E = window.__BR.AI.exps; E[0].place(X, Z, P.yaw - Math.PI/2 + 0.2); E[0].st='idle'; E[0].dur=99; window.__BR.G.blackout = 999;`, 5);
  await shot('d_smiler', `window.__BR.AI.exps[0].place(1,1); ${ahead(6, 0.4)} const s = window.__BR.AI.smilers[0]; s.gone = 0; s.present = true; s.place(X, Z, P.yaw + Math.PI); s.st = 'lurk';`);
  await shot('d_flash', `window.__BR.PL.flash = true;`, 2);
  await shot('d_nvdark', `window.__BR.PL.flash = false; window.__BR.PL.nv = true;`);
  await shot('d_crawler', `window.__BR.PL.nv = false; window.__BR.G.blackout = 0; const s = window.__BR.AI.smilers[0]; s.place(5, 5); ${ahead(3.5, 0.2)} const c = window.__BR.AI.crawler; c.active = true; c.present = true; c.fade = 0; c.firstSeen = true; c.place(X, Z, P.yaw + Math.PI + 0.7);`, 8);
};
