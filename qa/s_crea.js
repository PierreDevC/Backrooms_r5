module.exports = async (page, logs) => {
  const fr = n => page.waitForTimeout(n * 1100);
  await page.evaluate(() => { const B = window.__BR; B.startGame(); B.beginPlay(); document.getElementById('blue').classList.add('hide'); B.FX.fadeB = 0; B.G.grace = 9999;
    // move player to a big hall and look along it
    const h = B.LV.halls.reduce((a, b) => a.w * a.h > b.w * b.h ? a : b), C = 3.6;
    B.PL.x = (h.x0 + 0.5) * C; B.PL.z = (h.y0 + 0.5) * C; B.PL.yaw = Math.atan2(h.w, h.h); B.PL.pitch = 0.05;
    for (const e of B.AI.exps) e.place(1, 1); for (const e of B.AI.howlers) e.place(2, 2); if (B.AI.mimic) B.AI.mimic.place(3, 3);
  });
  await fr(3);
  const ahead = (d, side = 0) => `var P = window.__BR.PL, X = P.x + Math.sin(P.yaw) * ${d} + Math.cos(P.yaw) * ${side}, Z = P.z + Math.cos(P.yaw) * ${d} - Math.sin(P.yaw) * ${side};`;
  const shot = async (name, setup, frames = 3) => {
    await page.evaluate(`(() => { ${setup} })()`);
    await page.evaluate(() => { window.__BR.G.state = 'play'; });
    await fr(frames);
    await page.evaluate(() => { window.__BR.G.state = 'paused'; window.__BR.FX.fadeB = 0; });
    await fr(2);
    await page.screenshot({ path: `/data/qa/${name}.png` });
    const info = await page.evaluate(() => { const B = window.__BR; const o = { light: B.PL.light.toFixed(2), hp: B.PL.hp }; for (const a of B.AI.all) if (a.shown && a.d < 15) o[a.constructor.name + (a.i ?? '')] = [a.d.toFixed(1), a.st, a.present]; return o; });
    logs.push('QA ' + name + ' ' + JSON.stringify(info));
  };
  await shot('c_hall', `window.__BR.PL.flash = false;`);
  await shot('c_explorers', `${ahead(5, -1)} var E = window.__BR.AI.exps; E[0].place(X, Z, P.yaw + Math.PI - 0.4); E[0].st='idle'; E[0].dur=99; ${ahead(8, 1.6)} E[1].place(X, Z, P.yaw + 0.3); E[1].st = 'idle'; E[1].dur = 99;`);
  await shot('c_howler', `var E = window.__BR.AI.exps; E[0].place(1,1); E[1].place(1,2); ${ahead(5, 0.5)} const h = window.__BR.AI.howlers[0]; h.place(X, Z, P.yaw + Math.PI + 0.3); h.st = 'search'; h.stT = -99; h.pause = 99; h.wt = {x: X, z: Z};`);
  await shot('c_crawler', `window.__BR.AI.howlers[0].place(2,2); ${ahead(4, 0.3)} const c = window.__BR.AI.crawler; c.active = true; c.present = true; c.fade = 0; c.place(X, Z, P.yaw + Math.PI + 0.6);`);
  await shot('c_mimic', `window.__BR.AI.crawler.place(4,4); window.__BR.AI.crawler.active = false; window.__BR.AI.crawler.present = false; ${ahead(4.6, 0)} const m = window.__BR.AI.mimic; m.place(X, Z, P.yaw + Math.PI); m.st = 'reveal'; m.stT = 0.95;`, 2);
  await shot('c_nv', `window.__BR.AI.mimic.place(3,3); window.__BR.AI.mimic.st='pose'; window.__BR.PL.nv = true; window.__BR.FX.lightScale = 0.02;`);
};
