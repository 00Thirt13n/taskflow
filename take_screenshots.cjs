const puppeteer = require('./frontend/node_modules/puppeteer-core');
const fs = require('fs');

async function run() {
  const outDir = '/tmp/taskflow-audit';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Authenticate via backend API
  console.log('Logging in via API...');
  const loginRes = await fetch('http://127.0.0.1:8000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: 'admin@taskflow.dev', password: 'Password123!' })
  }).then(r => r.json());

  if (!loginRes.token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }
  console.log('Logged in as:', loginRes.user.name, 'Token received.');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-375', width: 375, height: 667 },
  ];

  // Capture public pages first
  const publicPages = [
    { name: 'landing', url: 'http://localhost:5173/' },
    { name: 'login', url: 'http://localhost:5173/login' },
  ];

  for (const p of publicPages) {
    console.log(`Auditing public ${p.name}...`);
    await page.goto(p.url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 300));
      const filename = `${outDir}/${p.name}-${vp.name}.png`;
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`Saved ${filename}`);
    }
  }

  // Set localStorage authentication
  await page.evaluate((data) => {
    localStorage.setItem('taskflow_token', data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
  }, loginRes);

  const pagesToTest = [
    { name: 'dashboard', url: 'http://localhost:5173/app/home' },
    { name: 'tasks-list', url: 'http://localhost:5173/app/tasks?view=list' },
    { name: 'tasks-board', url: 'http://localhost:5173/app/tasks?view=board' },
    { name: 'projects', url: 'http://localhost:5173/app/projects' },
    { name: 'reports', url: 'http://localhost:5173/app/reports' },
    { name: 'admin-users', url: 'http://localhost:5173/app/admin/users' },
  ];



  for (const p of pagesToTest) {
    console.log(`Auditing ${p.name}...`);
    await page.goto(p.url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 400));
      const filename = `${outDir}/${p.name}-${vp.name}.png`;
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`Saved ${filename}`);
    }
  }

  await browser.close();
  console.log('All authenticated screenshots captured!');
}

run().catch(console.error);
