const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = async page => {
  const output = process.env.BR_QA_OUT || __dirname;
  const check = (condition, message) => { assert.ok(condition, message); console.log('QA PASS ' + message); };
  const touch = await page.evaluate(() => navigator.maxTouchPoints > 0);
  const use = async () => { if (touch) await page.locator('#touch button[data-k="KeyE"]').tap(); else await page.keyboard.press('e'); };
  await page.evaluate(() => { const game = window.__BR; game.DBG.ts = 0; game.G.diff = 0; game.G.state = 'title'; game.goLevel18(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.M18.tiles?.length === 8, null, { timeout: 120000 });
  const first = await page.evaluate(() => {
    const game = window.__BR;
    for (let step = 0; step < 400 && game.G.state !== 'play'; step++) game.simStep(0.05);
    game.G.grace = 10000;
    const tiles = game.M18.tiles;
    game.PL.x = (tiles[0].x0 + tiles[0].x1) / 2; game.PL.z = tiles[0].z1 + 0.7; game.PL.cell = -1;
    game.PL.yaw = Math.PI; game.PL.pitch = 0.2;
    for (let step = 0; step < 5; step++) game.simStep(0.05);
    game.updateHUD(0.2);
    return { visible: !document.getElementById('pianoHint').classList.contains('hide'),
      how: document.getElementById('pianoHow').textContent, goal: document.getElementById('pianoGoal').textContent,
      played: document.getElementById('pianoPlayed').textContent };
  });
  check(first.visible && /step off to repeat/i.test(first.how) && /bare floor/i.test(first.how), 'piano instructions appear before stepping on a key');
  check(/birthday card/i.test(first.goal) && /dark east walk/i.test(first.goal) && !/RED/.test(first.goal), 'the clue locates the birthday card without revealing the undiscovered tune');
  check(/No notes yet/.test(first.played), 'the note display starts empty');
  const lessonFocus = await page.evaluate(() => {
    const game = window.__BR, lesson = game.M18.lessonAt, tiles = game.M18.tiles;
    game.PL.x = lesson.x; game.PL.z = tiles[0].z1 + 0.3; game.PL.cell = -1;
    game.PL.yaw = Math.atan2(lesson.x - game.PL.x, lesson.z - game.PL.z); game.PL.pitch = -0.08;
    for (let step = 0; step < 5; step++) game.simStep(0.05);
    game.PL.focus = game.findInteract();
    return game.PL.focus?.label();
  });
  check(lessonFocus === 'READ THE FLOOR PIANO LESSON', 'the actual poster is reachable through the normal interaction focus');
  await use();
  await page.waitForFunction(() => !document.getElementById('doc').classList.contains('hide'));
  const lesson = await page.evaluate(() => {
    const game = window.__BR; game.updateHUD(0.2);
    return { text: document.getElementById('docB').textContent,
      saved: game.TASKS.docs.some(document => document.id === 'pianoLesson18'),
      sub: game.TASKS.list.find(task => task.id === 'piano18')?.sub,
      hidden: document.getElementById('pianoHint').classList.contains('hide') };
  });
  check(/step off and back on/i.test(lesson.text) && /look down/i.test(lesson.text) && /party room/i.test(lesson.text), 'readable lesson explains repeated notes, replay controls and where to find the tune');
  check(lesson.saved && /bare floor/i.test(lesson.sub), 'lesson and mechanical clues are retained in FIELD NOTES');
  check(lesson.hidden, 'the piano overlay hides while reading a document');
  await page.screenshot({ path: path.join(output, 'r7_2_piano_lesson.png') });
  await use();
  await page.waitForFunction(() => document.getElementById('doc').classList.contains('hide'));
  const card = await page.evaluate(() => {
    const game = window.__BR; game.card18();
    const text = document.getElementById('docB').textContent;
    game.interact(); game.updateHUD(0.2);
    return { text, goal: [...document.querySelectorAll('#pianoGoal span')].map(element => element.textContent) };
  });
  check(/RED · RED · BLUE · BLUE · PURPLE · PURPLE · BLUE/.test(card.text) && /step off and back on/i.test(card.text), 'birthday card supplies the tune and the repeated-note clue');
  check(card.goal.join(',') === 'RED,RED,BLUE,BLUE,PURPLE,PURPLE,BLUE', 'learned tune stays visible at the piano as labelled colour chips');
  const automatic = await page.evaluate(() => {
    const game = window.__BR, tile = game.M18.tiles[0];
    game.PL.x = (tile.x0 + tile.x1) / 2; game.PL.z = (tile.z0 + tile.z1) / 2;
    game.PL.cell = -1; game.PL.yaw = 0; game.PL.pitch = 1.0;
    for (let step = 0; step < 5; step++) game.simStep(0.05);
    game.PL.focus = game.findInteract(); game.updateHUD(0.2);
    return { sequence: [...game.M18.seq], focus: game.PL.focus?.label(), played: document.getElementById('pianoPlayed').textContent,
      action: document.getElementById('pianoAction').textContent };
  });
  check(automatic.sequence.join(',') === '0' && /RED/.test(automatic.played), 'stepping onto RED registers one visible note');
  check(automatic.focus === 'PLAY RED AGAIN', 'looking down offers an explicit replay prompt');
  check(automatic.action === (touch ? 'USE · ' : '[E] ') + 'PLAY RED AGAIN', 'the clue panel includes the platform-specific replay control');
  await use();
  await page.waitForFunction(() => window.__BR.M18.seq.length === 2);
  check(await page.evaluate(() => window.__BR.M18.seq.join(',') === '0,0'), (touch ? 'touch USE' : 'keyboard E') + ' repeats the note without moving');
  await page.evaluate(() => {
    const game = window.__BR, tile = game.M18.tiles[0];
    game.PL.z = tile.z1 + 0.4; game.simStep(0.05);
    game.PL.z = (tile.z0 + tile.z1) / 2; game.simStep(0.05); game.updateHUD(0.2);
  });
  check(await page.evaluate(() => window.__BR.M18.seq.join(',') === '0,0,0'), 'stepping off and back onto the same key repeats it');
  const checkpoint = await page.evaluate(() => {
    const game = window.__BR; game.die('forgotten'); game.cpRetry();
    return { state: game.G.state, sequence: game.M18.seq.length, tile: game.M18.tile, song: game.M18.song,
      lesson: game.TASKS.docs.some(document => document.id === 'pianoLesson18') };
  });
  check(checkpoint.state === 'play' && checkpoint.sequence === 0 && checkpoint.tile === -1 && checkpoint.song && checkpoint.lesson,
    'checkpoint clears the unfinished performance and retains learned clues');
  const wrong = await page.evaluate(() => {
    const game = window.__BR;
    const stepOn = index => {
      const tile = game.M18.tiles[index]; game.PL.x = (tile.x0 + tile.x1) / 2; game.PL.z = tile.z1 + 0.4;
      game.simStep(0.05); game.PL.z = (tile.z0 + tile.z1) / 2; game.simStep(0.05);
      game.PL.z = tile.z1 + 0.4; game.simStep(0.05);
    };
    for (const index of [1, 2, 3, 2, 1, 0, 6]) stepOn(index);
    game.updateHUD(0.2);
    return { played: game.M18.played, status: document.getElementById('pianoStatus').textContent,
      notes: [...document.querySelectorAll('#pianoPlayed span')].map(element => element.textContent) };
  });
  check(!wrong.played && /start again/i.test(wrong.status) && wrong.notes.length === 7, 'a wrong tune remains visible and explains how to retry');
  await page.evaluate(() => {
    const game = window.__BR, tiles = game.M18.tiles;
    game.PL.x = (tiles[0].x0 + tiles[7].x1) / 2; game.PL.z = tiles[0].z1 + 2.4;
    game.PL.yaw = Math.PI; game.PL.pitch = 0.25; game.PL.cell = -1;
    for (let step = 0; step < 5; step++) game.simStep(0.05);
    game.FX.glitch = 0; game.FX.hurt = 0; game.PL.shake = 0; game.updateHUD(0.2);
  });
  await page.screenshot({ path: path.join(output, 'r7_2_piano_feedback.png') });
  const overlap = await page.evaluate(() => {
    const panel = document.getElementById('pianoHint').getBoundingClientRect();
    return ['toast', 'subs'].filter(id => {
      const element = document.getElementById(id), bounds = element.getBoundingClientRect();
      return element.classList.contains('show') && panel.left < bounds.right && panel.right > bounds.left && panel.top < bounds.bottom && panel.bottom > bounds.top;
    });
  });
  check(overlap.length === 0, 'active subtitles and toasts do not cover the piano clues');
  const solved = await page.evaluate(() => {
    const game = window.__BR;
    for (const index of [0, 0, 4, 4, 5, 5, 4]) {
      const tile = game.M18.tiles[index]; game.PL.x = (tile.x0 + tile.x1) / 2; game.PL.z = tile.z1 + 0.4;
      game.simStep(0.05); game.PL.z = (tile.z0 + tile.z1) / 2; game.simStep(0.05);
      game.PL.z = tile.z1 + 0.4; game.simStep(0.05);
    }
    game.updateHUD(0.2);
    const status = document.getElementById('pianoStatus').textContent;
    game.chest18(); game.updateHUD(0.2);
    return { played: game.M18.played, status, key: game.M18.key, hidden: document.getElementById('pianoHint').classList.contains('hide') };
  });
  check(solved.played && /toy box is open/i.test(solved.status) && solved.key && solved.hidden, 'correct tune opens the box and the overlay retires after collecting its key');
  const layout = await page.evaluate(() => {
    const game = window.__BR; game.M18.key = false; game.updateHUD(0.2);
    const panel = document.getElementById('pianoHint'), bounds = panel.getBoundingClientRect();
    return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: innerWidth, height: innerHeight,
      scroll: panel.scrollWidth, client: panel.clientWidth };
  });
  check(layout.left >= 0 && layout.right <= layout.width && layout.top >= 0 && layout.bottom <= layout.height && layout.scroll <= layout.client + 1,
    'piano clues fit the viewport without horizontal overflow');
  await page.screenshot({ path: path.join(output, 'r7_2_piano_complete.png') });
  const teardown = await page.evaluate(() => {
    const game = window.__BR; game.G.state = 'loading'; game.teardownScene();
    return { hidden: document.getElementById('pianoHint').classList.contains('hide'), active: document.body.classList.contains('pianoactive'), errors: game.ERRS.n };
  });
  check(teardown.hidden && !teardown.active && teardown.errors === 0, 'scene teardown clears the piano overlay with no recovered errors');
};
