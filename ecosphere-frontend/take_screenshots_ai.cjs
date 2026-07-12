const puppeteer = require('puppeteer');
const fs = require('fs');
const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });

  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await wait(1000);
  await page.click('button[type="submit"]');
  await wait(3000);

  await page.goto('http://localhost:5173/ai-advisor', { waitUntil: 'domcontentloaded' });
  await wait(2000);
  await page.click('#run-advisor-btn');
  await wait(10000); // Give AI time to respond
  await page.screenshot({ path: '../assets/ai-advisor-result.png', fullPage: true });
  console.log('Saved ai-advisor-result.png');
  await browser.close();
})();
