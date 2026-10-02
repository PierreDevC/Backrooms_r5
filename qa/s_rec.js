module.exports = async (page, logs) => {
  await page.evaluate(() => { window.__BR.DBG.ts = 6; });
  await page.click('#btnPlay');
  await page.waitForFunction(() => window.__BR.G.state === 'play' && window.__BR.AU.bankDone === window.__BR.AU.bankN, null, { timeout: 150000 });
  await page.evaluate(() => {
    const B = window.__BR, A = B.AU; B.DBG.ts = 1; B.ENG().stopRenderLoop(); B.G.grace = 9999;
    for (const h of B.AI.howlers) h.place(1, 1);
    B.SUBS.q.length = 0; B.SUBS.cur = null; B.SUBS.t = 0; B.G.radioT = 999; B.G.ambT = 999;
    const dest = A.ctx.createMediaStreamDestination(); A.master.connect(dest);
    const rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 128000 }); window.__chunks = []; rec.ondataavailable = e => window.__chunks.push(e.data); rec.start(); window.__rec = rec;
    window.__log = []; const T0 = performance.now(); let last = '';
    window.__drv = setInterval(() => { B.simStep(1 / 30); const s = B.SUBS.cur; const k = s ? s.who + ': ' + s.text.slice(0, 40) : ''; if (k !== last) { last = k; if (k) window.__log.push(((performance.now() - T0) / 1000).toFixed(1) + 's ' + k); } }, 1000 / 30);
    const P = B.PL, at = (t, f) => setTimeout(f, t * 1000);
    at(0.5, () => { B.K.add('KeyW'); setTimeout(() => B.K.clear(), 4000); });
    at(6, () => B.SFX.flash(true));
    at(13, () => { const e = B.AI.exps[1]; e.place(P.x + 1.6, P.z + 0.3, 0); e.st = 'idle'; e.talks = 0; e.talk(); });
    at(24, () => B.takeTape(B.W.tapes[0]));
    at(33, () => { B.SFX.howl({ x: P.x + 9, y: 2.2, z: P.z }); });
    at(35, () => { for (let i = 0; i < 4; i++) setTimeout(() => B.SFX.heavyStep({ x: P.x + 6 - i * 0.6, y: 0.1, z: P.z }), i * 600); });
    at(38.5, () => { const m = B.AI.mimic; B.say('???', B.VO_TXT.mimic[1], { pos: { x: P.x + 7, z: P.z + 2 }, vo: 'mim2_1', mode: 'mimic' }); });
    at(42.5, () => B.say('', '…turn around…', { vo: 'wh0', mode: 'whisper' }));
    at(47, () => { const e = B.AI.exps[3]; e.place(P.x + 8, P.z, 0); B.say(e.name, B.VO_TXT.flee[1], { pos: e, vo: 'e3_flee1', vol: 1.8 }); setTimeout(() => B.SFX.scream({ x: P.x + 12, y: 1.5, z: P.z }, 0), 1600); });
    at(52, () => { B.SFX.thunk(); B.say('L. REYES', B.VO_TXT.story.lights, { radio: true, vo: 'e2_lights' }); });
  });
  await page.waitForTimeout(61000);
  const b64 = await page.evaluate(() => new Promise(res => { clearInterval(window.__drv); window.__rec.onstop = async () => { const b = new Blob(window.__chunks, { type: 'audio/webm' }); const ab = await b.arrayBuffer(); let s = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); res(btoa(s)); }; window.__rec.stop(); }));
  require('fs').writeFileSync('/data/qa/rec.webm', Buffer.from(b64, 'base64'));
  logs.push('QA subs\n' + (await page.evaluate(() => window.__log.join('\n'))));
};
