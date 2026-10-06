const puppeteer = require('./frontend/node_modules/puppeteer-core');
const fs = require('fs');

async function test() {
  const outDir = '/tmp/taskflow-audit';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Test 1: Manual typing and form submission
  console.log('1. Testing manual login submission on http://localhost:5173/login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `${outDir}/login-initial.png` });

  // Clear inputs and type credentials
  await page.click('#loginEmail', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('#loginEmail', 'admin@taskflow.dev');

  await page.click('#loginPassword', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('#loginPassword', 'Password123!');

  await page.screenshot({ path: `${outDir}/login-filled.png` });

  console.log('Clicking Sign In button...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation event:', e.message)),
    page.click('button[type="submit"]')
  ]);

  await new Promise(r => setTimeout(r, 1000));
  const currentUrl = page.url();
  console.log('Current URL after manual login:', currentUrl);
  await page.screenshot({ path: `${outDir}/after-manual-login.png` });

  if (!currentUrl.includes('/app')) {
    console.error('FAILED: Did not redirect to /app! Still on:', currentUrl);
    // check errors on page
    const errors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.invalid-feedback, .alert, .text-danger, .badge-danger')).map(el => el.innerText);
    });
    console.log('Detected errors on page:', errors);
  } else {
    console.log('SUCCESS: Manual login redirected to:', currentUrl);
  }

  // Test 2: Public pages from the user screenshots
  const publicPages = [
    { name: 'login', url: 'http://localhost:5173/login' },
    { name: 'security', url: 'http://localhost:5173/security' },
    { name: 'pricing', url: 'http://localhost:5173/pricing' },
    { name: 'solutions', url: 'http://localhost:5173/solutions' },
    { name: 'product', url: 'http://localhost:5173/product' },
  ];

  // Logout first so public pages can be viewed cleanly
  await page.evaluate(() => {
    localStorage.clear();
  });

  for (const p of publicPages) {
    console.log(`Auditing ${p.name} (${p.url})...`);
    await page.goto(p.url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    const path = `${outDir}/${p.name}-desktop-verified.png`;
    await page.screenshot({ path, fullPage: false });
    console.log(`Saved screenshot: ${path}`);
  }

  // Test 3: One-click persona login
  console.log('3. Testing One-Click Exploration (Maya Lin)...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  const personaButtons = await page.$$('button.persona-badge, .d-flex.flex-column.gap-2 button, .quick-persona-btn');
  console.log(`Found ${personaButtons.length} persona buttons.`);
  if (personaButtons.length > 0) {
    await personaButtons[0].click();
    console.log('Clicked first persona button.');
    await new Promise(r => setTimeout(r, 500));
    // Click submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation event:', e.message)),
      page.click('button[type="submit"]')
    ]);
    await new Promise(r => setTimeout(r, 1000));
    console.log('URL after persona click & submit:', page.url());
  }

  await browser.close();
  console.log('Verification script completed.');
}

test().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
