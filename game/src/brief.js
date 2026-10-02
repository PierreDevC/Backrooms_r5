// ---------- field briefings: illustrated slides. 'l0' before the first tape (and from the title menu), 'l9' on the first arrival in Level 9 (and from its pause menu) ----------
// modes: play (→ first tape) · menu (→ title) · l9 (→ Level 9 intro) · pause (→ pause menu)
const BRIEF = { i: 0, mode: 'play', set: 'l0', open: false, tx: null };
const bk = (key, touch) => `<kbd>${IS_TOUCH ? touch : key}</kbd>`;
const bn = n => `<b class="bn">${n}</b>`;
function briefSlides() { return BRIEF.set === 'l9' ? briefSlides9() : briefSlides0(); }
function notesKey0() { return IS_TOUCH ? 'Pause → <b>FIELD NOTES</b> lists your objectives, leads and documents.' : `${bk('J', 'NOTES')} opens <b>FIELD NOTES</b>: objectives, leads and documents.`; }   // r6
function briefSlides0() {
  return [
    { t: 'YOUR OBJECTIVE', alt: 'A lost camcorder on a tripod with the prompt to take its tape; the objective and the TAPES / CODE counters are highlighted.',
      body: `<p class="bLead">Your expedition's camcorders are scattered through Level 0. Each one left a tape behind.</p>
      <ol class="bList">
        <li>${bn(1)}<span>Your current <b>objective</b> is always shown under the compass.</span></li>
        <li>${bn(2)}<span>Find a tripod camcorder, get close and press ${bk('E', 'USE')} to <b>take the tape</b>.</span></li>
        <li>${bn(3)}<span>Every tape adds <b>one digit</b> of the exit code. With all <b>4</b>, follow the <b class="red">red compass marker</b> to the exit door and punch the code in.</span></li>
      </ol><p class="bNote">The exit keypad also needs <b>power</b>: the team left breakers and a battery somewhere. ${notesKey0()}</p>` },
    { t: 'THE TAPE SIGNAL', alt: 'Close-ups of the compass with a tape icon and of the TAPE SIGNAL meter with its bars and arrow.',
      body: `<p class="bLead">Your camcorder can pick up the lost rigs. Watch the meter in the bottom-right corner.</p>
      <ol class="bList">
        <li>${bn(1)}<span>The <b>bars</b> show how close the nearest missing tape is. More bars, closer tape.</span></li>
        <li>${bn(2)}<span>Stuck for a while? The signal <b>locks on</b> and an <b>arrow</b> shows which way to walk. It follows the corridors, not a straight line through walls.</span></li>
        <li>${bn(3)}<span>Still lost? The camcorder <b>beeps</b> when you face the right way, you can <b>hear</b> the lost camera recording, and a <b>tape icon</b> appears on the compass. Survivors may radio in directions.</span></li>
      </ol><p class="bNote">Picking up a tape resets the signal.</p>` },
    { t: 'STAY ALIVE', alt: 'Close-ups of the vitality, stamina and sanity bars, the battery meter and the almond water counter, next to two bottles of almond water on the floor.',
      body: `<ol class="bList">
        <li>${bn(1)}<span><b>VIT</b> is your health. It slowly recovers if nothing hurts you for a while.</span></li>
        <li>${bn(2)}<span><b>STA</b> is stamina. Sprinting (${bk('Shift', 'RUN')}) drains it. Run it dry and you're exhausted and slow.</span></li>
        <li>${bn(3)}<span><b>SAN</b> is sanity. Darkness and the things out there wear it down. Low sanity brings hallucinations, and at zero it starts hurting you.</span></li>
        <li>${bn(4)}<span><b>Battery.</b> The flashlight (${bk('F', 'LIGHT')}) and night shot (${bk('N', 'NV')}) drain it. ${bk('R', 'BATT')} swaps in a spare.</span></li>
        <li>${bn(5)}<span><b>Almond water.</b> Drink with ${bk('Q', 'DRINK')} for +45 sanity and +20 vitality. Pick bottles up and search bodies for more.</span></li>
      </ol>` },
    { t: 'THE THINGS IN THE WALLS', alt: 'Four recorded sightings: the Howler, the Smiler, the Crawler and an explorer in a hazmat suit.',
      body: `<ol class="bList ent">
        <li><span><b>Howler.</b> Hunts by sound and sight. Walk or crouch (${bk('C', 'CRCH')}), and sprint only to escape.</span></li>
        <li><span><b>Smiler.</b> Lives where the lights are dead. Keep your beam on it and it backs off.</span></li>
        <li><span><b>Crawler.</b> Only moves when nobody is looking. Keep watching it.</span></li>
        <li><span><b>Explorers.</b> Survivors in hazmat suits may help, but not everything in a suit is human. Listen to the voice.</span></li>
      </ol><p class="bNote">${IS_TOUCH ? 'The pause button opens the menu.' : '<kbd>Esc</kbd> pauses. The full control list is under CONTROLS.'}</p>` }
  ];
}
function briefSlides9() {
  return [
    { t: 'YOUR OBJECTIVE', alt: 'A red house on a dark street with the M.E.G. map snapshot inset; the objective line, the compass marker, the red houses and the DATA counter are highlighted.',
      body: `<p class="bLead">Level 9 is an endless dark suburb. M.E.G. left an outpost here.</p>
      <ol class="bList">
        <li>${bn(1)}<span>Your <b>objective</b> sits under the compass. The <b>▼ marker</b> points to the next goal.</span></li>
        <li>${bn(2)}<span>Go <b>north-east</b> to the outpost and study the <b>map</b> by its gate (${bk('E', 'USE')}). Reopen it with ${bk('Tab', 'MAP')}.</span></li>
        <li>${bn(3)}<span>Start the terminal in each of the three <b class="red">red houses</b> (${bk('E', 'USE')}) and <b>stay close</b>. At <b>DATA 3/3</b> the gate opens.</span></li>
      </ol><p class="bNote">Each terminal runs <b>PACKET STACK</b>: drop the blocks and complete rows to send the data (${IS_TOUCH ? 'stick to move, turn and drop' : `${bk('A', '')}/${bk('D', '')} move, ${bk('W', '')} turn, ${bk('S', '')} drop`}). Some houses have more to say than others, and there is more than one way out of the lab. ${notesKey0()}</p>` },
    { t: 'THE NEIGHBORHOOD WATCH', alt: 'A tall figure in a dark coat walking down the street with a flashlight; its amber compass blip and a house porch are highlighted.',
      body: `<ol class="bList">
        <li>${bn(1)}<span>The <b>Watch</b> patrols the streets. If its <b>flashlight</b> finds you, it gives chase.</span></li>
        <li>${bn(2)}<span>The <b class="amb">amber blip</b> on the compass shows where it is.</span></li>
        <li>${bn(3)}<span>Break its line of sight: get <b>inside a house</b> and shut the door.</span></li>
      </ol><p class="bNote">Keep your light off when it's near. Running footsteps carry.</p>` },
    { t: 'THE WRETCHES', alt: 'A Wretch asleep in a dark room, with its red compass blip, the door latch prompt and the silent noise meter highlighted.',
      body: `<p class="bLead">Wretches sleep in some houses. They're <b>blind</b> and hunt <b>by sound</b>. Light won't wake them. Noise will.</p>
      <ol class="bList">
        <li>${bn(1)}<span>A <b class="red">red blip</b> marks a Wretch in this house (▲▼ = the other floor).</span></li>
        <li>${bn(2)}<span><b>Crouch</b> (${bk('C', 'CRCH')}) near them. Walking is heard up close, sprinting across the room.</span></li>
        <li>${bn(3)}<span>If one wakes, go quiet and slip away. It hunts where it <b>last heard</b> you, and it can't open a <b>latched</b> door (${bk('RIGHT-CLICK', 'LATCH')}).</span></li>
      </ol>` },
    { t: 'STAY QUIET', alt: 'Close-ups of the NOISE meter while crouching, walking and sprinting, with the amber hearing mark.',
      body: `<ol class="bList">
        <li>${bn(1)}<span>The <b>NOISE</b> bar is how loud you are: crouching keeps it almost empty, walking fills under half, sprinting fills it.</span></li>
        <li>${bn(2)}<span>Near a Wretch an <b class="amb">amber mark</b> shows how loud you can be before it hears you. It slides left as you get closer.</span></li>
        <li>${bn(3)}<span>Past the mark it reads <b class="red">HEARD!</b> The Wretch stirs, and wakes if you keep it up. Stop and your noise fades in a second.</span></li>
      </ol><p class="bNote">Terminals are loud too.</p>` }
  ];
}
function brief9Seen() { try { return localStorage.getItem('br_brief9') === '1'; } catch (e) { return false; } }
function briefSeen() { try { return localStorage.getItem('br_brief') === '1'; } catch (e) { return false; } }
function briefFit() {   // size the text column for the longest slide so the panel stays put
  const tx = $('briefCopy').parentNode; tx.style.minHeight = '';
  let h = 0; const S = briefSlides();
  for (const sl of S) { $('briefTitle').textContent = sl.t; $('briefCopy').innerHTML = sl.body; h = Math.max(h, tx.offsetHeight); }
  tx.style.minHeight = h + 'px';
  const b = tx.parentNode, ov = e => e.scrollHeight > e.clientHeight + 1;
  if (ov(b) || ov(tx)) tx.style.minHeight = '';   // small screens scroll instead
}
function openBrief(mode, set = 'l0') {
  BRIEF.mode = mode; BRIEF.set = set; BRIEF.i = 0; BRIEF.open = true; show('brief'); briefFit(); drawBrief();
  if (document.pointerLockElement) document.exitPointerLock();
  setTimeout(() => { if (BRIEF.open) $('briefNext').focus({ preventScroll: true }); }, 30);
}
function drawBrief() {
  const S = briefSlides(), s = S[BRIEF.i], n = S.length, last = BRIEF.i === n - 1;
  $('briefKick').textContent = `${BRIEF.set === 'l9' ? 'LEVEL 9 BRIEFING' : 'FIELD BRIEFING'} · ${BRIEF.i + 1} / ${n}`;
  $('briefTitle').textContent = s.t; $('briefCopy').innerHTML = s.body;
  const im = $('briefImg'); im.src = (BRIEF.set === 'l9' ? BRIEF_IMG9 : BRIEF_IMG)[BRIEF.i]; im.alt = s.alt;
  $('briefDots').innerHTML = S.map((_, k) => `<button class="${k === BRIEF.i ? 'on' : ''}" data-k="${k}" aria-label="Slide ${k + 1}"></button>`).join('');
  $('briefDots').querySelectorAll('button').forEach(b => b.onclick = () => { BRIEF.i = +b.dataset.k; SFX.click(); drawBrief(); $('briefDots').children[BRIEF.i].focus({ preventScroll: true }); });
  $('briefCopy').parentNode.scrollTop = 0; $('briefCopy').parentNode.parentNode.scrollTop = 0; briefMore();
  $('briefPrev').classList.toggle('off', BRIEF.i === 0);
  if (BRIEF.i === 0 && document.activeElement === $('briefPrev')) $('briefNext').focus({ preventScroll: true });
  const M = BRIEF.mode, fresh = M === 'play' || M === 'l9';
  $('briefNext').textContent = !last ? 'NEXT ▶' : M === 'play' ? '▶ START TAPE' : M === 'l9' ? '▶ ENTER LEVEL 9' : M === 'pause' ? '◀ BACK TO PAUSE' : 'BACK TO MENU';
  $('briefSkip').textContent = fresh ? 'SKIP »' : 'CLOSE ×';
  $('brief').classList.toggle('lastSlide', last);
}
function briefMore() {   // fade the bottom edge while there's more text to scroll to
  const tx = $('briefCopy').parentNode;
  for (const e of [tx, tx.parentNode]) e.classList.toggle('more', getComputedStyle(e).overflowY === 'auto' && e.scrollHeight - e.scrollTop - e.clientHeight > 4);
}
function briefStep(d) {
  const n = briefSlides().length, j = BRIEF.i + d;
  if (j < 0) return;
  if (j >= n) return closeBrief();
  BRIEF.i = j; SFX.click(); drawBrief();
}
function closeBrief() {
  if (!BRIEF.open) return;
  BRIEF.open = false; try { localStorage.setItem(BRIEF.set === 'l9' ? 'br_brief9' : 'br_brief', '1'); } catch (e) {}
  if (BRIEF.mode === 'play') startGame(true);
  else if (BRIEF.mode === 'l9') { lockPointer(); startIntro9(); }
  else if (BRIEF.mode === 'pause') { show('pause'); setTimeout(() => $('btnPBrief').focus({ preventScroll: true }), 30); }
  else { show('title'); setTimeout(() => $('btnHow').focus({ preventScroll: true }), 30); }
}
function briefKey(code) {   // returns true when the key was used by the briefing
  if (!BRIEF.open) return false;
  const onBtn = document.activeElement && document.activeElement.tagName === 'BUTTON';
  if (code === 'ArrowRight' || code === 'KeyD' || ((code === 'Enter' || code === 'Space') && !onBtn)) briefStep(1);
  else if (code === 'ArrowLeft' || code === 'KeyA') briefStep(-1);
  else if (code === 'Escape') closeBrief();
  return true;
}
function bindBrief() {
  $('btnHow').onclick = () => openBrief('menu');
  $('btnPBrief').onclick = () => { if (G.state === 'paused' && LVL === 9) openBrief('pause', 'l9'); };
  $('briefNext').onclick = () => briefStep(1);
  $('briefPrev').onclick = () => briefStep(-1);
  $('briefSkip').onclick = () => closeBrief();
  addEventListener('resize', () => { if (BRIEF.open) { briefFit(); drawBrief(); } });
  const tx = $('briefCopy').parentNode; tx.addEventListener('scroll', briefMore, { passive: true }); tx.parentNode.addEventListener('scroll', briefMore, { passive: true });
  const f = $('briefFig');   // swipe between slides on touch screens
  f.addEventListener('touchstart', e => { BRIEF.tx = e.touches[0].clientX; }, { passive: true });
  f.addEventListener('touchend', e => { if (BRIEF.tx === null) return; const dx = e.changedTouches[0].clientX - BRIEF.tx; BRIEF.tx = null; if (Math.abs(dx) > 50) briefStep(dx < 0 ? 1 : -1); }, { passive: true });
}
