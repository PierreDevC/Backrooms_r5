module.exports = async (page, logs) => {
  await page.evaluate(() => { window.__BR.DBG.ts = 4; });
  await page.click('#btnPlay');
  const t0 = Date.now();
  await page.waitForFunction(() => window.__BR.AU.bankN && window.__BR.AU.bankDone === window.__BR.AU.bankN, null, { timeout: 90000 }).catch(() => logs.push('BANK TIMEOUT'));
  logs.push('QA bank ms ' + (Date.now() - t0) + ' ' + await page.evaluate(() => { const A = window.__BR.AU; return `done ${A.bankDone}/${A.bankN} buffers ${Object.keys(A.buf).length} ctx ${A.ctx.state}`; }));
  // every referenced voice key must exist
  logs.push('QA missing ' + await page.evaluate(() => {
    const B = window.__BR, T = B.VO_TXT, need = ['intro1', 'intro2', 'tape1', 'tape2', 'tape3', 'tape4'];
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 3; k++) need.push(`e${i}_greet${k}`, `e${i}_dist${k}`, `e${i}_flee${k}`);
      for (let k = 0; k < 8; k++) need.push(`e${i}_rig${k}`);
      for (const t of T.tipIds[i]) need.push(`e${i}_tip${t}`);
      need.push(`e${i}_chat0`, `e${i}_chat1`); for (const s of Object.keys(T.story)) need.push(`e${i}_${s}`);
    }
    for (const v of [0, 2]) for (let k = 0; k < T.mimic.length; k++) need.push(`mim${v}_${k}`);
    for (let k = 0; k < T.whisper.length; k++) need.push('wh' + k);
    return need.filter(k => !B.AU.buf[k]).join(',') || 'none (' + need.length + ' checked)';
  }));
  // output meter
  await page.evaluate(() => { const A = window.__BR.AU; A.an = A.ctx.createAnalyser(); A.an.fftSize = 2048; A.master.connect(A.an); window.__rms = () => { const d = new Float32Array(2048); A.an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); }; });
  await page.waitForFunction(() => window.__BR.G.state === 'play', null, { timeout: 120000 });
  await page.evaluate(() => { window.__BR.DBG.ts = 1; window.__BR.G.grace = 9999; });
  await page.waitForTimeout(2500);
  logs.push('QA intro sub ' + await page.evaluate(() => { const S = window.__BR.SUBS; return S.cur ? `${S.cur.who} t=${S.t.toFixed(2)} q=${S.q.length}` : 'none'; }));
  const meter = []; for (let i = 0; i < 6; i++) { meter.push(await page.evaluate(() => window.__rms().toFixed(4))); await page.waitForTimeout(400); }
  logs.push('QA rms during radio ' + meter.join(' '));
  // each sampled SFX returns a duration (>0 means the sample path played)
  logs.push('QA sfx ' + await page.evaluate(() => {
    const B = window.__BR, S = B.SFX, P = B.PL, p = { x: P.x + 3, y: 1.5, z: P.z };
    const r = { step: S.step(1, false), wstep: S.step(2, true), heavy: S.heavyStep(p), howl: S.howl(p), scrLo: S.screech(p, false), scrHi: S.screech(p, true), clicks: S.clicks(p), crack: S.crack(p), giggle: S.giggle(p),
      screamM: S.scream(p, 0), screamF: S.scream(p, 1), jump: S.jumpscare(), pick: S.pickup(), search: S.search(), flash: S.flash(true), batt: S.battery(), drink: S.drink(), tape: S.tape(), door: S.door(p), thunk: S.thunk(), up: S.thunk(true), whisper: S.whisper(), sting: S.sting(), far: S.far(p) };
    return Object.entries(r).map(([k, v]) => k + '=' + (typeof v === 'number' ? v.toFixed(2) : v)).join(' ');
  }));
  await page.waitForTimeout(800);
  logs.push('QA rms after sfx ' + await page.evaluate(() => window.__rms().toFixed(4)));
  // explorer conversation + mimic + whisper + tape through the subtitle queue
  const r = await page.evaluate(() => {
    const B = window.__BR, P = B.PL, S = B.SUBS; S.q.length = 0; S.cur = null; S.t = 0;
    const e = B.AI.exps[1]; e.place(P.x + 1.5, P.z, 0); e.st = 'idle'; e.talk(); return 'talk queued ' + S.q.length;
  });
  logs.push('QA ' + r);
  for (let i = 0; i < 3; i++) { await page.waitForTimeout(1500); logs.push('QA sub ' + await page.evaluate(() => { const S = window.__BR.SUBS; return S.cur ? `${S.cur.who}: ${S.cur.text.slice(0, 50)} t=${S.t.toFixed(2)} q=${S.q.length}` : 'none'; })); }
  await page.evaluate(() => { const B = window.__BR; B.takeTape(B.W.tapes[0]); });
  await page.waitForTimeout(1500);
  logs.push('QA tape sub ' + await page.evaluate(() => { const S = window.__BR.SUBS; return S.q.map(s => s.who).join('|') + ' cur=' + (S.cur && S.cur.who) + ' t=' + S.t.toFixed(2); }));
  logs.push('QA growl ' + await page.evaluate(() => { const h = window.__BR.AI.howlers[0]; return h && h.growl ? (h.growl.synth ? 'synth' : 'sample') : 'none'; }) + ' breath ' + await page.evaluate(() => !!window.__BR.AU.breathSrc));
};
