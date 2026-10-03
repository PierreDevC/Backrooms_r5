module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel2(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    window.T = { log: [],
      step(s) { for (let i = 0; i < s * 20; i++) { B.PL.hp = Math.max(B.PL.hp, 60); B.simStep(0.05); } },
      act(re, hold) { const it = B.W.interact.find(i => { try { return re.test(i.label()); } catch (e) { return false; } }); if (!it) { T.log.push('NO ' + re); return false; }
        B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); if (it.ok && !it.ok()) { T.log.push('NOTOK ' + re + ' ' + it.label()); return false; } it.act(); T.step(hold || 0.3); T.log.push('ok ' + re + ' | ' + B.obj2()); return true; },
      st() { return { obj: B.obj2(), errs: B.ERRS.n, last: B.ERRS.last, regs: B.GP2.regs, state: B.G.state, hp: Math.round(B.PL.hp), heat: +B.GP2.heat.toFixed(2), surges: B.GP2.surges }; } }; });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  await run('phone', () => { const B = window.__BR; T.step(5); T.act(/ANSWER THE PHONE/); T.step(8); return [T.st(), B.PP2.phoneMet]; });
  await run('ida', () => { const B = window.__BR; for (let i = 0; i < 3; i++) { T.act(/TALK TO IDA/); T.step(13); } return [T.st(), B.PP2.step, B.PP2.surgesOn]; });
  await run('west', () => { const B = window.__BR; T.act(/TAKE THE CROWBAR/); T.act(/READ THE LOGBOOK/); T.act(/READ THE TEAM BOARD/); T.act(/PICK UP THE PAGE/); T.act(/TAKE THE ID CARD/); T.act(/SHUT REGULATOR W/, 5); return [T.st(), B.PP2.regs, B.PP2.crowbar, B.PP2.idcard]; });
  await run('north', () => { const B = window.__BR; T.act(/WATCH THE FOREMAN/, 14); const o = B.PP2.order.slice(); for (const n of o) T.act(new RegExp('THROW BREAKER ' + n)); T.step(4); T.act(/TAKE THE TIME CARD/); T.act(/SHUT REGULATOR N/, 5); return [T.st(), o, B.PP2.power, B.PP2.timecard, B.PP2.regs]; });
  await run('east', () => { const B = window.__BR; T.act(/PRY THE DOOR/, 3.5); T.step(2); T.act(/TALK TO BENNY/); T.act(/FIT THE VALVE WHEEL/); T.act(/SHUT REGULATOR E/, 5); T.step(4); return [T.st(), B.PP2.valveOpen, B.PP2.wheel, B.PP2.regs, B.PP2.liftReady]; });
  await run('card', () => { const B = window.__BR; T.act(/SHOW IDA THE ID CARD/); T.step(8); return [B.PP2.idGiven]; });
  await run('lift', () => { const B = window.__BR; T.act(/CALL THE LIFT/, 2.5); T.act(/RIDE UP/); T.step(9); return [T.st(), B.GP2.ending, B.endCard2()]; });
  console.log((await page.evaluate(() => T.log)).join('\n'));
};
