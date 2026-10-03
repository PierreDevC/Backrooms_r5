const path = require('path');
let pw; try { pw=require('playwright'); } catch(e) { pw=require('/vercel/sandbox/node_modules/playwright'); }
const {chromium}=pw;
process.env.BR_QA_OUT=process.env.BR_QA_OUT||__dirname;
const fs = require('fs');
const failures = [];
const allowedError = process.env.BR_QA_ALLOW_ERROR && new RegExp(process.env.BR_QA_ALLOW_ERROR);
const checkLog = message => { if (/QA FAIL|PAGEERROR|QA PAGE CRASH|\[recovered /.test(message) && !(allowedError && allowedError.test(message))) failures.push(message); };
const originalLog = console.log;
console.log = (...values) => { checkLog(values.join(' ')); originalLog(...values); };
(async () => {
  const file = process.argv[2], steps = process.argv[3] || 'title', W = +(process.argv[4] || 1280), H = +(process.argv[5] || 720);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || (require('fs').existsSync('/usr/local/bin/chromium')?'/usr/local/bin/chromium':'/usr/bin/chromium'), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, hasTouch: process.env.BR_QA_TOUCH === '1' });
  const logs = { push: s => console.log(s) };
  page.on('console', m => { if (m.type() === 'error' && !(allowedError && allowedError.test(m.text()))) failures.push(m.text()); if (m.type() === 'error' || m.type() === 'warning' || m.text().startsWith('QA')) console.log(m.type() + ': ' + m.text().slice(0, 600)); });
  page.on('crash', () => console.log('QA PAGE CRASH')); page.on('close', () => console.log('QA PAGE CLOSE'));
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message + '\n' + (e.stack || '').slice(0, 800)));
  await page.route('**/babylon.js', r => r.fulfill({ body: fs.readFileSync(path.join(__dirname,'../qa/babylon.js')), contentType: 'application/javascript' }));
  await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  if (!process.env.BR_SHOW_BRIEF9) await page.addInitScript(() => { try { localStorage.setItem('br_brief9', '1'); } catch (e) {} });   // r4.3: older scripts expect Level 9 to start without its first-run briefing
  await page.goto('file://' + file + '?debug' + (process.env.BR_QA_QUERY ? '&' + process.env.BR_QA_QUERY : ''), { waitUntil: 'load' });
  const t0 = Date.now();
  await page.waitForFunction(() => window.__BR && window.__BR.G.state === 'title', null, { timeout: 180000 });
  logs.push('QA load ms ' + (Date.now() - t0));
  const script = require(steps);
  await script(page, logs);
  
  if (failures.length) throw new Error('QA failures: ' + failures.join('\n'));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => { console.log = originalLog; });
