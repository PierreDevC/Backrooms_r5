const { chromium } = require('/vercel/sandbox/node_modules/playwright');
const fs = require('fs');
(async () => {
  const file = process.argv[2], steps = process.argv[3] || 'title', W = +(process.argv[4] || 1280), H = +(process.argv[5] || 720);
  const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning' || m.text().startsWith('QA')) logs.push(m.type() + ': ' + m.text().slice(0, 600)); });
  page.on('pageerror', e => logs.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '').slice(0, 800)));
  await page.route('**/babylon.js', r => r.fulfill({ body: fs.readFileSync('/data/qa/babylon.js'), contentType: 'application/javascript' }));
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  if (!process.env.BR_SHOW_BRIEF9) await page.addInitScript(() => { try { localStorage.setItem('br_brief9', '1'); } catch (e) {} });   // r4.3: older scripts expect Level 9 to start without its first-run briefing
  await page.goto('file://' + file + '?debug', { waitUntil: 'load' });
  const t0 = Date.now();
  await page.waitForFunction(() => window.__BR && window.__BR.G.state === 'title', null, { timeout: 180000 }).catch(e => logs.push('TIMEOUT title'));
  logs.push('QA load ms ' + (Date.now() - t0));
  const script = require(steps);
  await script(page, logs);
  console.log(logs.join('\n'));
  await browser.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
