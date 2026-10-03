// Level-select menu: open/close, keyboard safety, and fresh starts for Level 0, 9 (r4.4), 5 and 18.
const assert = (c, m) => { if (!c) throw new Error(m); console.log('QA PASS ' + m); };
const out = n => require('path').join(process.env.BR_QA_OUT, n);
module.exports = async (page) => {
  const vis = id => page.evaluate(i => !document.getElementById(i).classList.contains('hide'), id);
  const st = () => page.evaluate(() => window.__BR.G.state);
  const body = c => page.evaluate(k => document.body.classList.contains(k), c);
  const W = async (fn, arg, ms = 240000) => page.waitForFunction(fn, arg, { timeout: ms });
  const backToTitle = async () => {   // real player path: pause (releases pointer lock) → QUIT TO MENU
    await W(() => window.__BR.G.state === 'play'); await page.evaluate(() => window.__BR.pauseGame());
    await page.click('#btnQuit'); await W(() => window.__BR.G.state === 'title' && !document.getElementById('title').classList.contains('hide'));
    console.log('QA PASS quit to menu via pause');
  };
  await page.waitForTimeout(400);
  assert(await vis('title'), 'title visible');
  assert(await page.evaluate(() => !!document.getElementById('btnLevels') && !document.getElementById('btnL5') && !document.getElementById('btnL18')), 'SELECT LEVEL replaces locked L5/L18 continue buttons');
  await page.screenshot({ path: out('title.png') });
  // keyboard: Enter on focused SELECT LEVEL opens the list instead of starting Level 0
  await page.focus('#btnLevels'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  assert(await vis('levels') && await st() === 'title' && !(await vis('brief')), 'Enter on SELECT LEVEL opens level list only');
  const labels = await page.$$eval('.lvPick', b => b.map(x => x.dataset.level + ':' + x.innerText.replace(/\s+/g, ' ').trim()));
  console.log('QA levels ' + JSON.stringify(labels));
  assert(labels.length === 5 && labels[0].startsWith('0:') && labels[1].startsWith('9:') && labels[2].startsWith('5:') && labels[3].startsWith('18:') && labels[4].startsWith('37:'), 'five options: Level 0, 9, 5, 18, 37');
  assert(await page.evaluate(() => document.activeElement && document.activeElement.dataset.level === '0'), 'focus moves to Level 0 option');
  await page.screenshot({ path: out('levels.png') });
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  assert(await vis('title') && !(await vis('levels')), 'Esc returns to title');
  await page.click('#btnLevels'); await page.click('#levels .back'); await page.waitForTimeout(150);
  assert(await vis('title'), 'BACK returns to title');
  // Level 9 (r4.4)
  await page.click('#btnLevels'); await page.click('.lvPick[data-level="9"]');
  await W(() => document.body.classList.contains('lvl9') && ['intro', 'play', 'brief9'].includes(window.__BR.G.state));
  if (await st() === 'brief9') { console.log('QA Level 9 briefing shown on first visit'); await page.click('#briefSkip'); await W(() => ['intro', 'play'].includes(window.__BR.G.state), null, 30000); }
  assert(await body('lvl9') && !(await body('lvl5')) && !(await body('lvl18')), 'Level 9 option starts Level 9');
  assert(await page.evaluate(() => window.__BR.G9.from && window.__BR.G9.from.time === 0 && window.__BR.G9.from.tapes === 4 && window.__BR.G9.data === 0), 'Level 9 starts fresh');
  await page.waitForTimeout(1500); await page.screenshot({ path: out('l9_start.png') });
  await backToTitle();
  // Level 5
  await page.click('#btnLevels'); await page.click('.lvPick[data-level="5"]');
  await W(() => document.body.classList.contains('lvl5') && ['intro', 'play'].includes(window.__BR.G.state));
  assert(await body('lvl5') && !(await body('lvl18')), 'Level 5 option starts Level 5 (not Level 18)');
  assert(await page.evaluate(() => window.__BR.G5.from && window.__BR.G5.from.time === 0 && window.__BR.G5.from.tapes === 4), 'Level 5 starts fresh');
  await page.waitForTimeout(1500); await page.screenshot({ path: out('l5_start.png') });
  await backToTitle();
  // Level 18
  await page.click('#btnLevels'); await page.click('.lvPick[data-level="18"]');
  await W(() => document.body.classList.contains('lvl18') && ['intro', 'play'].includes(window.__BR.G.state));
  assert(await body('lvl18') && !(await body('lvl5')), 'Level 18 option starts Level 18');
  assert(await page.evaluate(() => window.__BR.G18.phase === 'arrive'), 'Level 18 starts at arrival');
  await page.waitForTimeout(1500); await page.screenshot({ path: out('l18_start.png') });
  await backToTitle();
  // Level 0 (normal PLAY TAPE path: briefing first if unseen, then intro)
  await page.click('#btnLevels'); await page.click('.lvPick[data-level="0"]'); await page.waitForTimeout(300);
  if (await vis('brief')) { console.log('QA brief shown for first Level 0 play'); await page.click('#briefSkip'); }
  await W(() => ['intro', 'play'].includes(window.__BR.G.state), null, 30000);
  assert(!(await body('lvl5')) && !(await body('lvl9')) && !(await body('lvl18')) && ['intro', 'play'].includes(await st()), 'Level 0 option starts Level 0');
  await page.waitForTimeout(1500); await page.screenshot({ path: out('l0_start.png') });
};
