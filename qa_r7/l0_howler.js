const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = async page => {
  const out = process.env.BR_QA_OUT || __dirname;
  const check = (condition, message) => { assert.ok(condition, message); console.log('QA PASS ' + message); };
  await page.evaluate(() => {
    const game = window.__BR;
    game.DBG.ts = 0; game.G.diff = 1; game.startGame(true);
    for (let step = 0; step < 160 && game.G.state !== 'play'; step++) game.simStep(0.05);
    game.G.grace = 10000;
  });
  await page.waitForFunction(() => window.__BR.AU.bankDone === window.__BR.AU.bankN, null, { timeout: 60000 });
  const startup = await page.evaluate(() => {
    const game = window.__BR;
    return { state: game.G.state, crawler: game.AI.crawler, classes: game.AI.all.map(agent => agent.constructor.name),
      timers: game.AI.howlers.map(howler => howler.callT), call: game.AU.grp.hcall.length, see: game.AU.grp.hsee.length,
      briefing: game.briefSlides().map(slide => slide.body).join(''), controls: document.querySelector('#controls').textContent };
  });
  check(startup.state === 'play', 'Level 0 starts through the normal forced-briefing-skip path');
  check(startup.crawler === null && !startup.classes.includes('Crawler'), 'Crawler is absent; other Level 0 enemies remain');
  check(startup.timers.every(timer => timer >= 119 && timer <= 180), 'first territorial calls are scheduled 120–180 seconds into play');
  check(startup.call === 3 && startup.see === 3, 'all three calls and three screams decode');
  check(!/crawler/i.test(startup.briefing + startup.controls), 'briefing and controls no longer teach the Crawler mechanic');
  const fallback = await page.evaluate(async () => {
    const game = window.__BR, context = game.AU.ctx, saved = game.AU.buf;
    const pos = { x: game.PL.x + 20, y: 2.4, z: game.PL.z };
    game.AU.ctx = null;
    game.SFX.howlCall(pos); game.SFX.howlSee(pos);
    game.AU.ctx = context;
    await context.suspend();
    game.SFX.howlCall(pos); game.SFX.howlSee(pos);
    await context.resume();
    game.AU.buf = {};
    game.SFX.howlCall(pos); game.SFX.howlSee(pos);
    game.AU.buf = saved;
    return context.state;
  });
  check(fallback === 'running', 'missing, suspended and undecoded audio safely fall back without throwing');
  const calls = await page.evaluate(() => {
    const game = window.__BR, howler = game.AI.howlers[0], recorded = [], original = game.SFX.howlCall;
    game.SFX.howlCall = (pos, owner) => { recorded.push({ x: pos.x, z: pos.z, owner: owner === howler, atOwner: pos.x === howler.x && pos.z === howler.z }); return original(pos, owner); };
    Object.assign(howler, { st: 'wander', stT: 0, callT: 0.1, percT: 10, wt: null });
    const before = { x: howler.x, z: howler.z };
    howler.update(0.05); const early = recorded.length; howler.update(0.05);
    const next = howler.callT, paused = howler.pause > 0;
    howler.update(0.05);
    const count = recorded.length;
    howler.st = 'search'; howler.callT = 0; howler.update(0.05);
    const deferred = recorded.length === count && howler.callT > 0;
    howler.st = 'wander'; howler.callT = 0; howler.update(0.05);
    const source = game.AU.live.findLast(voice => voice.obj === howler);
    const voice = source && { ref: source.p.refDistance, roll: source.p.rolloffFactor, occF: source.occF };
    game.SFX.howlCall = original;
    return { early, count, next, paused, deferred, recorded, before, voice };
  });
  console.log('QA calls ' + JSON.stringify(calls));
  check(calls.early === 0 && calls.count === 1 && calls.next >= 120 && calls.next <= 180 && calls.paused,
    'territorial call pauses the entity and resets its 120–180 second timer');
  check(calls.deferred, 'a busy Howler defers its territorial call');
  check(calls.recorded.every(call => call.owner && call.atOwner),
    'calls originate from the actual Howler');
  check(calls.voice && calls.voice.ref === 16 && calls.voice.roll === 0.42 && calls.voice.occF === 1100,
    'distant calls use long-range positional attenuation and wall muffling');
  const screams = await page.evaluate(() => {
    const game = window.__BR, howler = game.AI.howlers[0], original = game.SFX.howlSee;
    let count = 0;
    game.SFX.howlSee = (pos, owner) => { count++; return original(pos, owner); };
    howler.seeCd = 0; howler.startChase(); howler.startChase(); const first = count;
    howler.seeCd = 0; howler.startChase();
    const source = game.AU.live.findLast(voice => voice.obj === howler), oldX = howler.x;
    howler.x += 1; game.simStep(0);
    const follows = Math.abs(source.p.positionX.value - howler.x) < 0.001;
    howler.x = oldX;
    game.SFX.howlSee = original;
    return { first, count, follows, cooldown: howler.seeCd, shake: game.PL.shake,
      duration: game.SFX.howlSee(howler.pos(2.2), howler) };
  });
  check(screams.first === 1 && screams.count === 2 && screams.cooldown === 7 && screams.shake > 0,
    'chase scream has a seven-second cooldown and camera feedback');
  check(screams.follows && screams.duration > 3, 'scream plays and its panner follows the moving Howler');
  const retry = await page.evaluate(() => {
    const game = window.__BR;
    game.takeTape(game.W.tapes[0]); game.die('howler'); game.cpRetry();
    return { state: game.G.state, tapes: game.G.tapes, crawler: game.AI.crawler,
      voices: game.AU.live.filter(voice => game.AI.howlers.includes(voice.obj)).length,
      timers: game.AI.howlers.map(howler => howler.callT), cooldowns: game.AI.howlers.map(howler => howler.seeCd) };
  });
  check(retry.state === 'play' && retry.tapes === 1 && retry.crawler === null && retry.voices === 0 &&
    retry.timers.every(timer => timer >= 120 && timer <= 180) && retry.cooldowns.every(timer => timer === 0),
    'checkpoint retains the tape, stops Howler audio and resets its timing without a Crawler');
  const camera = await page.evaluate(() => {
    const game = window.__BR, site = game.W.tapes[1], root = site.root;
    const expected = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0.035, 1.44, 0.83), root.computeWorldMatrix(true));
    return { ledError: BABYLON.Vector3.Distance(expected, site.led), parts: root.getChildMeshes().length,
      tape: game.W.interact.some(item => item.x === site.x && item.z === site.z && item.label() === 'TAKE TAPE') };
  });
  check(camera.ledError < 0.00001 && camera.parts > 60 && camera.tape, 'detailed camcorder keeps its tally beacon and tape interaction');
  await page.addStyleTag({ content: '#subs, #toast, #prompt { display: none !important; }' });
  for (const [name, angle, distance] of [['camcorder_front', 0.55, 1.0], ['camcorder_rear', 2.5, 0.85]]) {
    await page.evaluate(([angle, distance]) => {
      const game = window.__BR, root = game.W.tapes[1].root, yaw = root.rotation.y;
      const centerX = root.position.x + Math.sin(yaw) * 0.9, centerZ = root.position.z + Math.cos(yaw) * 0.9;
      game.PL.x = centerX - Math.sin(yaw + angle) * distance; game.PL.z = centerZ - Math.cos(yaw + angle) * distance;
      game.PL.yaw = Math.atan2(centerX - game.PL.x, centerZ - game.PL.z); game.PL.pitch = 0.2;
      game.PL.cell = -1; game.PL.flash = true; game.PL.batt = 100;
      for (let step = 0; step < 40; step++) game.simStep(0.05);
      game.FX.glitch = 0; game.FX.hurt = 0; game.PL.shake = 0; game.PL.san = 100;
    }, [angle, distance]);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, 'r7_1_' + name + '.png') });
  }
  await page.evaluate(() => {
    const game = window.__BR, room = game.P0.camp, howler = game.AI.howlers[0];
    game.PL.x = room.cx; game.PL.z = room.cz - 3; game.PL.cell = -1;
    game.PL.yaw = 0; game.PL.pitch = -0.05;
    howler.place(room.cx, room.cz + 0.5, Math.PI); howler.st = 'wander'; howler.pause = 30;
    howler.wt = { x: room.cx, z: room.cz + 2 }; howler.percT = 30;
    for (let step = 0; step < 20; step++) game.simStep(0.05);
    game.FX.glitch = 0; game.PL.shake = 0; game.PL.san = 100;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, 'r7_1_howler.png') });
  const teardown = await page.evaluate(() => {
    const game = window.__BR, howler = game.AI.howlers[0];
    game.SFX.howlCall(howler.pos(2.4), howler); game.G.state = 'loading'; game.teardownScene();
    return { voices: game.AU.live.length, errors: game.ERRS.n };
  });
  check(teardown.voices === 0 && teardown.errors === 0, 'scene teardown stops positional samples with no recovered errors');
};
