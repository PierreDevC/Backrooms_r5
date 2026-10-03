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
  await run('talk', () => { const B = window.__BR; for (let i = 0; i < 4; i++) { B.talkAbara37(); T.step(14); } return [T.st(), B.P37.quest]; });
  await run('quest', () => { T.act(/KETTLE/); T.act(/UNLOCK THE PLANT/, 1); T.step(2); return [T.st(), T.log.slice(-3)]; });
  await run('gate', () => { const B = window.__BR; T.act(/SHALLOWS GATE/, 4); T.step(40); return [T.st(), T.log.slice(-2), B.P37.drained]; });
  await run('pit', () => { T.act(/CAMCORDER/); T.act(/CASSETTE/); for (let i = 0; i < 3; i++) { window.__BR.talkAbara37(); T.step(1); } return [T.st(), T.log.slice(-2), window.__BR.P37.told]; });
  await run('plant2', () => { const B = window.__BR; return [B.P37.cam, B.P37.cass, B.P37.ret, B.P37.told, B.G37.phase]; });
  await run('told', () => { const B = window.__BR; for (let i = 0; i < 3; i++) { B.talkAbara37(); T.step(16); } return [B.P37.ret, B.P37.told, B.P37.told2, B.G37.phase, B.obj37()]; });
  await run('hotel', () => { const B = window.__BR; T.act(/GUEST BOOK/); T.act(/SPEAK TO TEAGUE/); T.step(5); B.talkTeague37(); T.step(8); B.talkTeague37(); T.step(2);
    T.act(/OPEN THE DRAWER/); T.act(/UNLOCK 204/, 1.5); T.act(/TAKE THE STOPWATCH/); B.talkTeague37(); T.step(8); B.talkTeague37(); T.step(1);
    const N = B.AI37.teague; B.PL.x = N.inter.x - 1; B.PL.z = N.inter.z; T.step(22); return [B.P37.hotel, T.st()]; });
  await run('vault', () => { const B = window.__BR; T.act(/UNLOCK 233/, 1.5); T.act(/ROOM 233 CARD/); T.step(3); return [B.P37.keys, B.obj37(), T.log.slice(-3)]; });
  await run('hosp', () => { const B = window.__BR; T.act(/TAKE A NUMBER/); T.act(/WHITEBOARD/); T.act(/DISCHARGE FORM/); B.PL.nv = true; T.step(2);
    T.act(/TAKE THE LINEN/); T.act(/GIVE THE LINEN/); T.act(/ASK FOR THE LANYARD/); T.act(/UNLOCK THE PHARMACY/, 1.5); T.act(/IV BAG/); T.act(/GIVE THE IV/); T.act(/TAKE THE CHART/); T.act(/FILE THE CHART/); T.act(/HAND IN/); T.step(8);
    return [B.P37.hosp, B.P37.keys, T.log.slice(-6)]; });
  await run('ww', () => { const B = window.__BR; B.PL.nv = false; T.act(/PARK MAP/); T.act(/DRINK FROM/); T.act(/START THE GENERATOR/, 4); T.act(/UNLOCK CONTROL/, 1.5); T.act(/NOTE ON THE MONITOR/); T.act(/TAKE THE TAPE/); T.step(2); return [B.P37.ww, B.P37.keys, B.G37.waves]; });
  await run('panel', () => { const B = window.__BR; T.act(/SEAT/); T.act(/SEAT/); T.act(/SEAT/); T.step(5); const ph = B.G37.phase; T.act(/PLAY THE VIDEO/); T.step(40); return [ph, T.st(), B.obj37(), !!B.AI37.fish]; });
  await run('hatch', () => { const B = window.__BR, LV = B.LV37(), W = LV.basins[B.BAS37.WELL]; const r = [W.y, W.tgt, LV.dry.well.h, B.G37.hatchReady]; T.step(60); r.push(W.y, B.G37.hatchReady, B.W37.hatch.y, B.PL.x, B.PL.z, B.G37.ey); return r; });
  await run('win', () => { const B = window.__BR; B.PL.hp = 100; T.act(/OPEN THE HATCH/, 4); T.step(6); return [B.G.state, B.G37.ending, T.log.slice(-1)]; });
  console.log((await page.evaluate(() => T.log)).join('\n'));
};
