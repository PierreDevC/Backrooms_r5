module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel7(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    window.T = { log: [],
      step(s) { for (let i = 0; i < s * 20; i++) { B.PL.hp = Math.max(B.PL.hp, 60); B.G37.breath = Math.max(B.G37.breath, 0.5); B.simStep(0.05); } },
      act(re, hold) { const it = B.W.interact.find(i => { try { return re.test(i.label()) && (!i.ok || i.ok()); } catch (e) { return false; } }); if (!it) { const any = B.W.interact.find(i => { try { return re.test(i.label()); } catch (e) { return false; } }); T.log.push('NO ' + re + (any ? ' (not ok: ' + any.label() + ')' : '')); return false; }
        B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); it.act(); T.step(hold || 0.3); T.log.push('ok ' + re + ' | ' + B.obj7()); return true; },
      st() { return { obj: B.obj7(), errs: B.ERRS.n, last: B.ERRS.last, state: B.G.state, hp: Math.round(B.PL.hp), parts: B.partsDone7() }; } }; });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  await run('ladder', () => { const B = window.__BR; T.step(3); const L = B.WS7.ladders.find(l => l.id === 'rS'); B.PL.x = L.wx; B.PL.z = L.wz; B.PL.cell = -1; T.step(0.5); T.act(/CLIMB UP · THE RIG/, 2.5); const c = B.cell7(B.PL.x, B.PL.z); return [B.LV7().fh[c], T.st()]; });
  await run('kell', () => { const B = window.__BR; const N = B.AIS7.kell; for (let i = 0; i < 4; i++) { T.act(/TALK TO KELL/); T.step(14); } return [T.st(), B.PS7.met, B.PS7.told]; });
  await run('gen', () => { const B = window.__BR; T.act(/START THE GENERATOR/, 5); T.step(12); T.act(/OPEN THE AIR VALVE/, 5); T.step(6); return [T.st(), B.PS7.gen, B.PS7.air, B.GS7.stormTo, B.WS7.buoys.filter(b => b.on).length]; });
  await run('flares', () => { const B = window.__BR; T.act(/TAKE THE FLARES/); return [B.PS7.flares]; });
  await run('tide', () => { const B = window.__BR; T.act(/READ THE TIDE BOARD/); T.act(/READ THE RADIO LOG/); T.act(/READ THE MESS BOARD/); return [Object.keys(B.PS7.logs)]; });
  await run('fen', () => { const B = window.__BR; for (let i = 0; i < 3; i++) { T.act(/TALK TO FEN/); T.step(14); } return [T.st(), B.PS7.fenMet, B.PS7.logs.fen, B.PS7.topics]; });
  await run('ship', () => { const B = window.__BR; T.act(/TAKE THE JERRY CAN/); T.act(/FILL THE JERRY CAN/, 5); T.act(/READ THE MATE'S LOG/); T.act(/READ THE MESS NOTICE/); const L = B.WS7.ladders.find(l => l.id === 'br'); B.PL.x = L.wx; B.PL.z = L.wz; B.PL.cell = -1; T.step(0.5); T.act(/CLIMB UP · THE BRIDGE/, 2.5); T.act(/READ THE CAPTAIN'S LOG/); return [T.st(), B.PS7.fuel, B.PS7.logs]; });
  await run('wreck', () => { const B = window.__BR; T.act(/READ THE LAST RADIO LOG/); for (let i = 0; i < 4; i++) T.act(/TURN DIAL 1/); for (let i = 0; i < 2; i++) T.act(/TURN DIAL 2/); for (let i = 0; i < 7; i++) T.act(/TURN DIAL 3/); T.step(1); T.act(/TAKE THE LENS MOTOR/); return [T.st(), B.PS7.safeOpen, B.PS7.motor]; });
  await run('cape', () => { const B = window.__BR; for (let i = 0; i < 4; i++) { T.act(/TALK TO WREN/); T.step(14); } T.act(/TAKE THE CLAMP/); T.act(/SPLICE THE CABLE/, 5); return [T.st(), B.PS7.wrenMet, B.PS7.clamp, B.PS7.cable]; });
  await run('lamp', () => { const B = window.__BR; const L = B.WS7.ladders.find(l => l.id === 'tw'); B.PL.x = L.wx; B.PL.z = L.wz; B.PL.cell = -1; T.step(0.5); T.act(/CLIMB UP · THE LAMP ROOM/, 2.5); const c = B.cell7(B.PL.x, B.PL.z), fh = B.LV7().fh[c];
    for (let i = 0; i < 3; i++) T.act(/POUR THE FUEL|SEAT THE LENS|CONNECT THE CABLE/); T.act(/LIGHT THE LAMP/, 7); T.step(14); return [fh, T.st(), B.PS7.lit, B.GS7.dawnTo, B.AIS7.shadow.st]; });
  await run('end', () => { const B = window.__BR; T.act(/TALK TO KELL/); T.step(14); const k = B.PS7.key; T.act(/BOARD THE MARLIN/, 1); T.step(9); return [k, B.G.state, B.GS7.ending, B.endCard7()]; });
  console.log((await page.evaluate(() => T.log)).join('\n'));
};
