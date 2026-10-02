const path = require('path');
let pw; try { pw=require('playwright'); } catch(e) { pw=require('/vercel/sandbox/node_modules/playwright'); }
const {chromium}=pw;
process.env.BR_QA_OUT=process.env.BR_QA_OUT||__dirname;
const fs = require('fs');
(async () => {
  const file = process.argv[2], steps = process.argv[3] || 'title', W = +(process.argv[4] || 1280), H = +(process.argv[5] || 720);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || (require('fs').existsSync('/usr/local/bin/chromium')?'/usr/local/bin/chromium':'/usr/bin/chromium'), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const logs = { push: s => console.log(s) };
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning' || m.text().startsWith('QA')) console.log(m.type() + ': ' + m.text().slice(0, 600)); });
  page.on('crash', () => console.log('QA PAGE CRASH')); page.on('close', () => console.log('QA PAGE CLOSE'));
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message + '\n' + (e.stack || '').slice(0, 800)));
  await page.route('**/babylon.js', r => r.fulfill({ body: fs.readFileSync(path.join(__dirname, '..', 'qa', 'babylon.js')), contentType: 'application/javascript' }));
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  if (!process.env.BR_SHOW_BRIEF9) await page.addInitScript(() => { try { localStorage.setItem('br_brief9', '1'); } catch (e) {} });   // r4.3: older scripts expect Level 9 to start without its first-run briefing
  if (process.env.SEED) await page.addInitScript((seed) => { let s = seed >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, +process.env.SEED);
  await page.goto('file://' + file + '?debug' + (process.env.BR_QS || ''), { waitUntil: 'load' });
  const t0 = Date.now();
  await page.waitForFunction(() => window.__BR && window.__BR.G.state === 'title', null, { timeout: 180000 }).catch(e => logs.push('TIMEOUT title'));
  logs.push('QA load ms ' + (Date.now() - t0));
  const script = require(steps);
  await script(page, logs);
  
  await browser.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
