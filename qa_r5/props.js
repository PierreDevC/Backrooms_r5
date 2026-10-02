// r5 prop QA: for each model kind placed in the level (MDL.log), stand a couple of metres away with line of sight and screenshot it
const OUT = process.env.BR_QA_OUT + '/', TAG = process.env.TAG || 'p', LV = +(process.env.LV || 0), KS = (process.env.KS || '').split(',').filter(Boolean);
const PICK = (process.env.PICK || '0').split(',').map(Number), D = +(process.env.D || 2.0), FL = +(process.env.FL ?? 1);
module.exports = async (page) => {
  await page.addStyleTag({ content: '*{transition:none!important} #osd,#subs,#toast,#hud{opacity:0!important}' });
  await page.evaluate((L) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1;
    if (L === 0) B.startGame(true); else if (L === 9) { B.G9.from = null; B.goLevel9(null); } else if (L === 5) { B.G5.from = null; B.goLevel5(null); } else { B.G18.from = null; B.goLevel18(null); } }, LV);
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 300000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 600 && B.G.state !== 'play'; i++) B.simStep(0.05); B.DBG.ts = 0; for (const o of B.AI.all || []) if (o.rig && o.rig.root) { o.present = false; o.rig.root.getChildMeshes(false).forEach(m => m.isVisible = false); o.rig.__vis = false; } });
  const log = await page.evaluate(() => (window.__BR.MDL && window.__BR.MDL.log) || []);
  const cnt = {}; for (const e of log) cnt[e[0]] = (cnt[e[0]] || 0) + 1;
  console.log('QA props log', log.length, JSON.stringify(cnt));
  if (process.env.AT) { for (const t of process.env.AT.split(';')) log.push(['at', ...t.split(',').map(Number)]); KS.length = 0; KS.push('at'); }
  const kinds = KS.length ? KS : Object.keys(cnt);
  let i = 0;
  for (const k of kinds) for (const pk of PICK) {
    const inst = log.filter(e => e[0] === k); if (!inst.length) { console.log('QA props none', k); continue; }
    const e = inst[pk % inst.length];
    const res = await page.evaluate(([e, D, FL]) => {
      const B = window.__BR, P = B.PL, [k, x, y, z] = e;
      for (const dm of [1, 0.75, 1.35, 0.55]) for (let a = 0; a < 16; a++) {
        const an = a / 16 * Math.PI * 2 + 0.3, d = D * dm, cx = x + Math.sin(an) * d, cz = z + Math.cos(an) * d, q = { x: cx, z: cz };
        B.collide(q, 0.3); if (Math.hypot(q.x - cx, q.z - cz) > 0.01 || !B.los(cx, cz, x, z)) continue;
        P.x = cx; P.z = cz; P.yaw = Math.atan2(x - cx, z - cz); P.pitch = Math.atan2(1.55 - (y + 0.35), d) * 0.9; P.flash = !!FL; P.fk = FL; B.DBG.ts = 0;
        return { k, at: [x, y, z], cam: [+cx.toFixed(2), +cz.toFixed(2)], d: +d.toFixed(2) };
      }
      return { k, at: [x, y, z], cam: null };
    }, [e, D, FL]);
    console.log('QA props', i, JSON.stringify(res));
    if (!res.cam) continue;
    await page.waitForTimeout(2500);
    await page.screenshot({ path: OUT + `props/${TAG}_${i++}_${k}.jpg`, quality: 85 });
  }
  console.log('QA props done', i, JSON.stringify(await page.evaluate(() => window.__BR.ERRS)));
};
