// Strict Level 37 progression regressions. State setup isolates prerequisites;
// cancellation, door crossing, timer invalidation, and swimming use the game loop.
module.exports = async page => {
  const results = [];
  const fresh = async () => {
    await page.evaluate(async () => {
      const B = window.__BR;
      B.DBG.ts = 0; B.G.diff = 1; B.G.state = 'title'; B.G37.from = null;
      await B.goLevel37(null);
      for (let i = 0; i < 120 && B.G.state !== 'play'; i++) B.simStep(0.05);
    });
  };
  const scenario = async (name, fn) => {
    await fresh();
    const data = await page.evaluate(fn);
    for (const [label, ok] of Object.entries(data.checks)) {
      console.log('QA ' + (ok ? 'PASS ' : 'FAIL ') + name + ': ' + label);
      results.push({ name, label, ok });
    }
    console.log('AUDIT ' + name + ' ' + JSON.stringify(data.detail || {}));
  };
  await scenario('stopwatch cancellation', () => {
    const B = window.__BR, N = B.AI37.teague, H = B.P37.hotel;
    Object.assign(H, { met: true, ask: true, sw: true, given: true });
    const step = s => { for (let i = 0; i < s * 20; i++) B.simStep(0.05); };
    const at = () => { B.PL.x = N.inter.x - 1; B.PL.z = N.inter.z; B.PL.cell = -1; step(0.1); };
    at(); B.timeTeague37(); step(1);
    const started = /TIMING/.test(N.inter.label());
    B.PL.x = N.inter.x - 5; step(0.2);
    const cancelled = !N.swimming && !/TIMING/.test(N.inter.label());
    at(); B.timeTeague37(); step(20.2); step(12);
    return { checks: { started, 'walking away resets the swimmer': cancelled, 'retry earns the brass key': H.timed && H.vaultKey }, detail: { label: N.inter.label(), timed: H.timed, key: H.vaultKey, errors: B.ERRS.n } };
  });
  await scenario('stopwatch checkpoint', () => {
    const B = window.__BR, N = B.AI37.teague, H = B.P37.hotel;
    Object.assign(H, { met: true, ask: true, sw: true, given: true });
    const step = s => { for (let i = 0; i < s * 20; i++) B.simStep(0.05); };
    B.PL.x = N.inter.x - 1; B.PL.z = N.inter.z; B.PL.cell = -1; step(0.1);
    B.cpSave('STOPWATCH'); B.timeTeague37(); step(1); B.die('fish'); step(0.2); B.cpRetry(); step(0.2);
    const reset = !N.swimming && !H.timed;
    B.timeTeague37(); step(20.2); step(12);
    return { checks: { 'checkpoint resets incomplete timing': reset, 'checkpoint retry completes timing': H.timed && H.vaultKey, 'inventory retained': H.sw && H.given }, detail: { state: B.G.state, timed: H.timed, key: H.vaultKey, errors: B.ERRS.n } };
  });
  await scenario('booth escape', () => {
    const B = window.__BR, LV = B.LV37(), panel = B.W37.pos.panel;
    const step = s => { for (let i = 0; i < s * 20; i++) B.simStep(0.05); };
    B.P37.told = true; B.G37.phase = 'finale';
    for (const k of ['hotel', 'hosp', 'tape']) B.P37.keys[k] = B.P37.panel[k] = true;
    B.PL.x = panel.x; B.PL.z = panel.z; B.PL.cell = -1; step(0.1);
    B.startFlood37(); step(5);
    const it = B.W.interact.find(it => it.door && it.door.dk === 'booth'), d = it.door;
    const canLeave = !d.locked;
    const target = { x: d.mx - 1.2, z: d.mz };
    for (let i = 0; i < 900 && Math.hypot(B.PL.x - target.x, B.PL.z - target.z) > 0.5; i++) {
      if (!d.target && !d.locked && Math.hypot(B.PL.x - it.x, B.PL.z - it.z) < 2.2) it.act();
      B.NAV.wpT = 0; const w = B.navGuide(target); if (!w) break;
      B.PL.yaw = Math.atan2(w.x - B.PL.x, w.z - B.PL.z);
      B.K.add('KeyW'); B.simStep(0.05); B.K.delete('KeyW');
    }
    const outside = LV.room[B.cell37(B.PL.x, B.PL.z)] !== LV.dry.booth.id;
    return { checks: { 'video leaves an escape while inside': canLeave, 'player walks out through booth door': outside, 'booth locks behind the player': outside && d.locked }, detail: { locked: d.locked, target: d.target, cell: LV.room[B.cell37(B.PL.x, B.PL.z)], booth: LV.dry.booth.id, position: [B.PL.x, B.PL.z], errors: B.ERRS.n } };
  });
  await scenario('flood checkpoint timers', () => {
    const B = window.__BR, LV = B.LV37(), well = LV.basins[B.BAS37.WELL];
    const step = s => { for (let i = 0; i < s * 20; i++) B.simStep(0.05); };
    const d = B.W.interact.find(it => it.door && it.door.dk === 'booth').door;
    well.tgt = -6.3; well.y = -6.3;
    B.PL.x = B.W37.pos.panel.x; B.PL.z = B.W37.pos.panel.z; B.PL.cell = -1;
    B.startFlood37(); B.die('fish'); step(0.05); B.cpRetry(); step(15);
    const safe = !B.G37.flood && !B.AI37.fish && !d.locked && well.tgt === -6.3;
    return { checks: { 'cancelled flood has no delayed locks or fish': safe, 'pre-flood drained target restored': well.tgt === -6.3, 'video can be replayed': !B.P37.played }, detail: { flood: B.G37.flood, fish: !!B.AI37.fish, locked: d.locked, water: well.y, target: well.tgt, errors: B.ERRS.n } };
  });
  await scenario('drain reversal', () => {
    const B = window.__BR, g = B.W37.gates[0], it = B.W.interact.find(i => /SHALLOWS GATE/.test(i.label()));
    const step = s => { for (let i = 0; i < s * 20; i++) B.simStep(0.05); };
    B.P37.met = B.P37.quest = B.P37.plant = B.P37.kettleKey = true;
    B.PL.x = g.x; B.PL.z = g.z + 1; B.PL.cell = -1; step(0.1);
    it.act(); step(3.2); it.act(); step(30);
    const b = B.LV37().basins[g.basin];
    return { checks: { 'refilling does not claim the shallows are drained': !B.P37.drained }, detail: { drained: B.P37.drained, y: b.y, target: b.tgt, objective: B.obj37(), errors: B.ERRS.n } };
  });
  await scenario('late flood checkpoint and replay', () => {
    const B = window.__BR, LV = B.LV37(), well = LV.basins[B.BAS37.WELL];
    const step = s => { for (let i = 0; i < s * 20; i++) B.simStep(0.05); };
    B.PL.x = B.W37.pos.panel.x; B.PL.z = B.W37.pos.panel.z; B.PL.cell = -1;
    B.P37.told = true; for (const k of ['hotel','hosp','tape']) B.P37.keys[k] = B.P37.panel[k] = true;
    B.startFlood37(); step(16); const spawned = !!B.AI37.fish;
    B.die('fish'); step(.05); B.cpRetry(); step(.2);
    const restored = !B.AI37.fish && !B.P37.played && Object.values(B.P37.panel).every(Boolean) && well.tgt === 0;
    B.startFlood37(); step(1); B.die('fish'); step(.05); B.cpRetry(); step(.2);
    B.startFlood37(); step(3.4);
    const oldRunQuiet = well.tgt === 0;
    step(.3); const currentRuns = well.tgt === LV.dry.well.h - .9;
    return { checks: { 'late retry removes the Well fish and retains panel items': spawned && restored, 'old replay cannot raise water early': oldRunQuiet, 'current replay raises the water': currentRuns, 'no recovered error': B.ERRS.n === 0 }, detail: { target:well.tgt, errors:B.ERRS.n } };
  });
  // A second level build must not reuse solid indices or disposed scene objects.
  await page.evaluate(() => { const B = window.__BR; B.startFlood37(); for (let i = 0; i < 100; i++) B.simStep(0.05); });
  const oldIndex = await page.evaluate(() => window.__BR.W37.sluiceI);
  await fresh();
  const reset = await page.evaluate(() => { const B = window.__BR; return { clean: B.W37.sluiceI === undefined, flood: B.G37.flood, keys: B.wingsDone37(), errors: B.ERRS.n }; });
  const resetOK = reset.clean && !reset.flood && reset.keys === 0 && reset.errors === 0;
  console.log('QA ' + (resetOK ? 'PASS ' : 'FAIL ') + 'level restart clears scene-owned flood state');
  console.log('AUDIT restart ' + JSON.stringify({ oldIndex, ...reset }));
  results.push({ name: 'restart', ok: resetOK });
  console.log('AUDIT SUMMARY ' + JSON.stringify({ passed: results.filter(r => r.ok).length, total: results.length }));
};
