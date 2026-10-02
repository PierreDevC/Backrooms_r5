// r5 character QA: stage skinned characters in front of the camera (time frozen) and screenshot poses
const OUT = process.env.BR_QA_OUT + '/', TAG = process.env.TAG || 'c', LV = +(process.env.LV || 0);
module.exports = async (page) => {
  await page.addStyleTag({ content: '*{transition:none!important} #osd,#subs,#toast,#hud{opacity:0!important}' });
  await page.evaluate((L) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1;
    if (L === 0) B.startGame(true); else if (L === 9) { B.G9.from = null; B.goLevel9(null); } else if (L === 5) { B.G5.from = null; B.goLevel5(null); } else { B.G18.from = null; B.goLevel18(null); } }, LV);
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 300000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 600 && B.G.state !== 'play'; i++) B.simStep(0.05); B.DBG.ts = 0; });
  const info = await page.evaluate(() => { const B = window.__BR; return { n: B.SKN.rigs.length, kinds: B.SKN.rigs.map(r => r.sk.P.outfit).join(',') }; });
  console.log('QA chr rigs', JSON.stringify(info));
  const shots = JSON.parse(process.env.SHOTS || '[]');
  let i = 0;
  for (const s of shots) {
    await page.evaluate((s) => {
      const B = window.__BR, P = B.PL;
      const pool = { exp: B.AI.exps, howl: B.AI.howlers, watch: B.AI9 && B.AI9.watch, wretch: B.AI9 && B.AI9.wretches, hale: B.AI9 && B.AI9.hale && [B.AI9.hale], subject: B.AI9 && B.AI9.subject && [B.AI9.subject] }[s.who];
      let a = pool && pool[s.idx || 0];
      if (window.__spawned) { window.__spawned.root.dispose(); window.__spawned = null; }
      if (s.spawn) { const mk = { exp: () => B.buildExplorerSk({ flashlight: true }), howl: B.buildHowlerSk, watch: B.buildWatchSk, wretch: () => B.buildWretchSk({}), subject: () => B.buildWretchSk({ gown: true }), hale: B.buildHaleSk, forgotten: B.buildForgottenSk }[s.spawn];
        const r = mk(); B.mergeRig(r); window.__spawned = r;
        a = { rig: r, place(x, z, y) { r.root.position.set(x, 0, z); r.root.rotation.y = y; } }; }
      if (!a) return;
      const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), d = s.d || 2.4;
      const x = P.x + fx * d + (s.side || 0) * fz, z = P.z + fz * d - (s.side || 0) * fx;
      a.place(x, z, P.yaw + Math.PI + (s.turn || 0)); a.present = true; a.shown = true;
      a.rig.root.getChildMeshes(false).forEach(m => m.isVisible = true); a.rig.__vis = true;
      const k = a.rig.sk; if (k) { k.px = null; k.spd = s.spd || 0; k.u = s.u || 0; k.ti = s.ti || 0; if (s.clip) B.rigPlay(a.rig, s.clip, { w: 1, t: s.ct || 0, fade: 0, hold: true }); }
      P.pitch = s.pitch ?? 0.12; P.flash = s.fl !== 0; P.fk = s.fl !== 0 ? 1 : 0;
      // hide every other agent so shots are clean
      for (const o of B.AI.all || []) if (o !== a && o.rig && o.rig.root) { o.rig.root.getChildMeshes(false).forEach(m => m.isVisible = false); o.rig.__vis = false; o.shown = false; }
    }, s);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: OUT + `chr/${TAG}_${i++}.jpg`, quality: 85 });
  }
  console.log('QA chr done', i, JSON.stringify(await page.evaluate(() => window.__BR.ERRS)));
};
