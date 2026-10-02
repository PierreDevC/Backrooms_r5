// ---------- r6 narrative layer: run flags, task list (main + optional), documents, FIELD NOTES, hold actions ----------
// RUN.f carries story choices from level to level inside one run. startGame (Level 0) clears it; a level started from
// SELECT LEVEL keeps whatever is there (empty on a fresh page), so every reader must treat a missing flag as "unknown".
const RUN = { f: {} };
function runReset() { RUN.f = {}; }
function flag(k, v) { if (v !== undefined) RUN.f[k] = v; return RUN.f[k]; }

// ----- tasks: one list per level. opt = optional lead. The HUD line stays with each level's own obj function. -----
const TASKS = { list: [], docs: [], lvl: '' };
function tasksReset(lvl) { TASKS.list.length = 0; TASKS.docs.length = 0; TASKS.lvl = lvl || ''; docClose(true); HOLD.cur = null; }
function task(id, text, o = {}) {
  let t = TASKS.list.find(q => q.id === id);
  if (!t) {
    t = { id, text, opt: !!o.opt, done: false, failed: false, hidden: !!o.hidden, sub: o.sub || '' };
    TASKS.list.push(t);
    if (!t.hidden && !o.quiet && G.state === 'play') later(o.delay ?? 0.2, () => toast((t.opt ? 'NEW LEAD · ' : 'OBJECTIVE · ') + t.text, 2.8));
  } else {
    if (text) t.text = text;
    if (o.sub !== undefined) t.sub = o.sub;
    if (o.hidden !== undefined) {
      const was = t.hidden; t.hidden = o.hidden;
      if (was && !t.hidden && !o.quiet && G.state === 'play') later(o.delay ?? 0.2, () => toast((t.opt ? 'NEW LEAD · ' : 'OBJECTIVE · ') + t.text, 2.8));
    }
  }
  return t;
}
function taskOf(id) { return TASKS.list.find(q => q.id === id) || null; }
function taskDone(id, text, quiet) {
  const t = taskOf(id); if (!t || t.done || t.failed) return false;
  t.done = true; t.hidden = false; if (text) t.text = text;
  if (!quiet && t.opt && G.state === 'play') toast('LEAD CLOSED · ' + t.text, 2.6);
  return true;
}
function taskFail(id, text) { const t = taskOf(id); if (!t || t.done || t.failed) return; t.failed = true; t.hidden = false; if (text) t.text = text; }

// ----- documents: a paper overlay that does not pause the tape. E closes it; walking away closes it too. -----
const DOC = { open: false, id: '', x: 0, z: 0, t: 0 };
function readDoc(id, title, body, o = {}) {
  const paras = Array.isArray(body) ? body : [body];
  if (!TASKS.docs.find(d => d.id === id)) TASKS.docs.push({ id, title, body: paras, kind: o.kind || 'note' });
  docShow(title, paras, o.kind);
  DOC.open = true; DOC.id = id; DOC.x = PL.x; DOC.z = PL.z; DOC.t = clamp(4 + paras.join(' ').split(/\s+/).length * 0.32, 6, 26);
  SFX.click();
}
function docShow(title, paras, kind) {
  const el = $('doc'); el.className = 'kind-' + (kind || 'note');
  $('docT').textContent = title;
  const b = $('docB'); b.innerHTML = '';
  for (const p of paras) { const d = document.createElement('p'); d.textContent = p; b.appendChild(d); }
  $('docHint').textContent = IS_TOUCH ? 'USE · CLOSE' : '[E] CLOSE · [J] FIELD NOTES';
}
function docClose(silent) { if (!DOC.open && !silent) return; DOC.open = false; const el = $('doc'); if (el) el.className = 'hide'; }
function docTick(dt) {
  if (!DOC.open) return;
  DOC.t -= dt;
  if (DOC.t <= 0 || G.state !== 'play' || dist2(PL.x, PL.z, DOC.x, DOC.z) > 3.2) docClose();
}

// ----- FIELD NOTES: pause sub-screen with every objective, lead and document of this level -----
function openNotes() {
  const L = TASKS.list.filter(t => !t.hidden), main = L.filter(t => !t.opt), opt = L.filter(t => t.opt);
  const row = t => `<li class="${t.done ? 'done' : t.failed ? 'fail' : ''}"><b>${t.done ? '■' : t.failed ? '✕' : '□'}</b> ${esc(t.text)}${t.sub && !t.done ? `<i>${esc(t.sub)}</i>` : ''}</li>`;
  $('notesLvl').textContent = TASKS.lvl || 'FIELD NOTES';
  $('notesMain').innerHTML = main.length ? main.map(row).join('') : '<li class="none">—</li>';
  $('notesOpt').innerHTML = opt.length ? opt.map(row).join('') : '<li class="none">NOTHING YET. LOOK AROUND.</li>';
  const dl = $('notesDocs'); dl.innerHTML = '';
  if (!TASKS.docs.length) dl.innerHTML = '<li class="none">NO DOCUMENTS RECOVERED</li>';
  for (const d of TASKS.docs) {
    const li = document.createElement('li'), btn = document.createElement('button'); btn.className = 'mi docBtn'; btn.textContent = d.title;
    btn.onclick = () => { $('notesRead').innerHTML = `<h3>${esc(d.title)}</h3>` + d.body.map(p => `<p>${esc(p)}</p>`).join(''); $('notesRead').classList.remove('hide'); };
    li.appendChild(btn); dl.appendChild(li);
  }
  $('notesRead').classList.add('hide');
  backTo = 'pause'; show('notes'); $('btnNotesBack').focus({ preventScroll: true });
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function notesKey(code) {   // J from play pauses into the notes; J or Esc inside the notes goes back to the pause menu
  if (code !== 'KeyJ' && !(code === 'Escape' && !$('notes').classList.contains('hide'))) return false;
  if (G.state === 'play' && code === 'KeyJ') { pauseGame(); openNotes(); return true; }
  if (G.state === 'paused' && !$('notes').classList.contains('hide')) { show('pause'); $('btnResume').focus({ preventScroll: true }); return true; }
  if (G.state === 'paused' && code === 'KeyJ') { openNotes(); return true; }
  return false;
}

// ----- hold actions (breakers, batteries, safes): the focus label shows progress; walking off cancels -----
const HOLD = { cur: null };
function holdStart(it, dur, done, o = {}) {
  if (HOLD.cur) return false;
  HOLD.cur = { it, t: 0, dur, done, x: it.x, z: it.z, r: o.r ?? 2.4, tick: o.tick, msg: o.cancel || 'YOU LET GO' };
  if (o.noise) makeNoise(o.noise);
  return true;
}
function holdBusy(it) { return HOLD.cur && (!it || HOLD.cur.it === it); }
function holdPct(it) { return HOLD.cur && HOLD.cur.it === it ? Math.min(99, Math.floor(HOLD.cur.t / HOLD.cur.dur * 100)) : 0; }
function holdTick(dt) {
  const H = HOLD.cur; if (!H) return;
  if (G.state !== 'play') { if (G.state !== 'paused') HOLD.cur = null; return; }
  if (dist2(PL.x, PL.z, H.x, H.z) > H.r) { HOLD.cur = null; toast(H.msg, 1.6); return; }
  H.t += dt; if (H.tick) H.tick(dt, H.t / H.dur);
  if (H.t >= H.dur) { HOLD.cur = null; H.done(); }
}

// ----- shared beat: one line said by whoever of the listed explorers is still alive (Level 0) -----
function aliveExp(i) { const e = AI.exps && AI.exps[i]; return e && e.alive ? e : null; }
function sayExp(i, text, o = {}) {   // radio from a named explorer; silent if that explorer is dead
  const e = aliveExp(i); if (!e) return false;
  say(e.name, text, Object.assign({ radio: e.d > 6, pos: e.d > 6 ? null : e }, o)); return true;
}
