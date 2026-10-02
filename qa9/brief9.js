// Level 9 briefing flow: first arrival shows the 4-slide LEVEL 9 BRIEFING → ENTER LEVEL 9 → intro → play;
// pause → FIELD BRIEFING → back to pause; second arrival skips it; Level 0 HOW TO PLAY unchanged; noise meter shows in Level 9 only.
const OUT = process.env.BR_QA_OUT || __dirname;
module.exports = async (page) => {
  const W = page.viewportSize().width, H = page.viewportSize().height, tagS = `${W}x${H}`;
  const ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
  const st = () => page.evaluate(() => window.__BR.G.state);
  const vis = id => page.evaluate(id => { const e = document.getElementById(id); if (!e) return false; for (let a = e; a; a = a.parentElement) { if (a.classList && a.classList.contains('hide')) return false; const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return e.getClientRects().length > 0; }, id);
  const txt = id => page.evaluate(id => document.getElementById(id).textContent, id);
  await page.evaluate(() => { localStorage.removeItem('br_brief9'); localStorage.setItem('br_brief', '1'); });
  // title HOW TO PLAY: Level 0 briefing as before
  await page.click('#btnHow');
  ok((await txt('briefKick')).startsWith('FIELD BRIEFING · 1 / 4'), 'title HOW TO PLAY opens the Level 0 briefing: ' + await txt('briefKick'));
  ok(await page.evaluate(() => document.getElementById('briefImg').src === window.__BR.BRIEF && document.getElementById('briefImg').src.length > 1000 ? true : document.getElementById('briefImg').src.startsWith('data:image/webp')), 'Level 0 slide image present');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  ok(await vis('title'), 'Esc closes it back to the title');
  // first arrival in Level 9
  await page.evaluate(() => { const B = window.__BR; B.G.diff = 1; B.goLevel9(null); });
  await page.waitForFunction(() => ['brief9', 'intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  ok(await st() === 'brief9', 'first arrival waits on the briefing (state ' + await st() + ')');
  ok(await vis('brief'), 'briefing screen visible');
  const slides = [];
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(150);
    const s = await page.evaluate(() => ({ kick: document.getElementById('briefKick').textContent, t: document.getElementById('briefTitle').textContent, next: document.getElementById('briefNext').textContent, skip: document.getElementById('briefSkip').textContent, img: document.getElementById('briefImg').src.slice(0, 30), imgOk: document.getElementById('briefImg').naturalWidth, alt: document.getElementById('briefImg').alt.slice(0, 40),
      over: (() => { const p = document.querySelector('.briefPanel').getBoundingClientRect(); return p.right > innerWidth + 1 || p.bottom > innerHeight + 1; })() }));
    slides.push(s);
    await page.screenshot({ path: `${OUT}/brief9_${tagS}_${i + 1}.png` });
    if (i < 3) await page.click('#briefNext');
  }
  console.log('QA slides ' + JSON.stringify(slides));
  ok(slides.every((s, i) => s.kick === `LEVEL 9 BRIEFING · ${i + 1} / 4`), 'kicker LEVEL 9 BRIEFING · i / 4');
  ok(slides.map(s => s.t).join('|') === 'YOUR OBJECTIVE|THE NEIGHBORHOOD WATCH|THE WRETCHES|STAY QUIET', 'slide titles');
  ok(slides.every(s => s.imgOk === 960), 'all four Level 9 images decode at 960 px');
  ok(slides[3].next === '▶ ENTER LEVEL 9' && slides[0].skip === 'SKIP »', 'last button ENTER LEVEL 9, skip button SKIP');
  ok(slides.every(s => !s.over), 'panel fits the viewport');
  await page.click('#briefNext');
  await page.waitForTimeout(150);
  ok(await st() === 'intro', 'ENTER LEVEL 9 starts the intro (state ' + await st() + ')');
  ok(await page.evaluate(() => localStorage.getItem('br_brief9')) === '1', 'br_brief9 saved');
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 600 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  ok(await st() === 'play', 'intro hands over to play');
  await frames();
  ok(await vis('noise9'), 'noise meter visible in Level 9');
  await page.screenshot({ path: `${OUT}/hud9_${tagS}.png` });
  // pause → FIELD BRIEFING → back
  await page.evaluate(() => window.__BR.pauseGame()); await page.waitForTimeout(150);
  ok(await vis('btnPBrief'), 'pause menu shows FIELD BRIEFING in Level 9');
  await page.screenshot({ path: `${OUT}/pause9_${tagS}.png` });
  await page.click('#btnPBrief'); await page.waitForTimeout(150);
  ok((await txt('briefKick')) === 'LEVEL 9 BRIEFING · 1 / 4' && (await txt('briefSkip')) === 'CLOSE ×', 'pause briefing opens on slide 1 with CLOSE ×');
  for (let i = 0; i < 3; i++) await page.click('#briefNext');
  ok((await txt('briefNext')) === '◀ BACK TO PAUSE', 'pause briefing last button: ' + await txt('briefNext'));
  await page.click('#briefNext'); await page.waitForTimeout(150);
  ok(await vis('pause') && await st() === 'paused', 'back on the pause menu, still paused');
  ok(await page.evaluate(() => document.activeElement && document.activeElement.id) === 'btnPBrief', 'focus returns to FIELD BRIEFING');
  await page.click('#btnPBrief'); await page.waitForTimeout(100); await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  ok(await vis('pause') && await st() === 'paused', 'Esc also closes it back to pause');
  // REWIND (restart Level 9): no briefing the second time
  await page.click('#btnRestart');
  await page.waitForFunction(() => ['brief9', 'intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  ok(await st() === 'intro', 'second arrival goes straight to the intro (state ' + await st() + ')');
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 600 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  // quit to the menu → Level 0: no FIELD BRIEFING in its pause menu, no noise meter
  await page.evaluate(() => window.__BR.pauseGame()); await page.waitForTimeout(100); await page.click('#btnQuit');
  await page.waitForFunction(() => window.__BR.G.state === 'title', null, { timeout: 240000 });
  await page.evaluate(() => window.__BR.startGame(true));
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  ok(!(await vis('noise9')), 'no noise meter right after entering Level 0'); await frames();
  ok(!(await vis('noise9')), 'no noise meter in Level 0');
  await page.evaluate(() => window.__BR.pauseGame()); await page.waitForTimeout(100);
  ok(!(await vis('btnPBrief')), 'Level 0 pause menu has no FIELD BRIEFING');
  // Esc on a fresh Level 9 briefing skips to the intro
  await page.click('#btnQuit'); await page.waitForFunction(() => window.__BR.G.state === 'title', null, { timeout: 240000 });
  await page.evaluate(() => { localStorage.removeItem('br_brief9'); window.__BR.goLevel9(null); });
  await page.waitForFunction(() => ['brief9', 'intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  ok(await st() === 'intro' && !(await vis('brief')), 'Esc skips the fresh Level 9 briefing into the intro');
};
