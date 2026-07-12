const puppeteer = require('puppeteer');
const fs = require('fs');

const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });

  if (!fs.existsSync('../assets')) {
    fs.mkdirSync('../assets');
  }

  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await wait(1000);
  await page.type('input[type="email"]', 'admin@eco.com');
  await page.evaluate(() => document.querySelector('input[type="password"]').value = '');
  await page.type('input[type="password"]', 'admin123');
  
  await page.click('button[type="submit"]');
  await wait(3000);
  await page.screenshot({ path: '../assets/dashboard.png', fullPage: true });
  console.log('Saved dashboard.png');

  const pages = ['environmental', 'social', 'governance', 'gamification', 'ai-advisor', 'simulator', 'reports'];
  
  for (const p of pages) {
    await page.goto(`http://localhost:5173/${p}`, { waitUntil: 'domcontentloaded' });
    await wait(2000);
    await page.screenshot({ path: `../assets/${p}.png`, fullPage: true });
    console.log(`Saved ${p}.png`);
  }

  await browser.close();
  console.log('Done!');
})();
