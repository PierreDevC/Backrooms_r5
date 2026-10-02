const { chromium } = require('/vercel/sandbox/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log(m.text()));
  await p.goto('file:///data/qa5/jazz.html');
  for (let i = 0; i < 60; i++) { const d = await p.evaluate(() => window.done); if (d) { console.log('done', d); break; } await p.waitForTimeout(1000); }
  await b.close(); process.exit(0);
})();
