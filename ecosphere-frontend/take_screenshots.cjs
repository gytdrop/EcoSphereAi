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

  // Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await wait(1000);
  await page.click('button[type="submit"]');
  await wait(3000);
  
  // 1. Dashboard Hover
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
  await wait(2000);
  // Hover over the center of the chart container (approx coordinates)
  await page.mouse.move(600, 500);
  await wait(1000);
  await page.screenshot({ path: '../assets/dashboard-hover.png', fullPage: true });
  console.log('Saved dashboard-hover.png');

  // 2. Environmental Modal
  await page.goto('http://localhost:5173/environmental', { waitUntil: 'domcontentloaded' });
  await wait(2000);
  // Try to click the add button if it exists
  try {
    await page.click('.btn-primary');
    await wait(1000);
    await page.screenshot({ path: '../assets/environmental-modal.png', fullPage: true });
    console.log('Saved environmental-modal.png');
  } catch (e) {
    console.log('Could not find environmental modal button');
  }

  // 3. Social Modal
  await page.goto('http://localhost:5173/social', { waitUntil: 'domcontentloaded' });
  await wait(2000);
  try {
    await page.click('.btn-primary');
    await wait(1000);
    await page.screenshot({ path: '../assets/social-modal.png', fullPage: true });
    console.log('Saved social-modal.png');
  } catch (e) {}

  // 4. Simulator Results
  await page.goto('http://localhost:5173/simulator', { waitUntil: 'domcontentloaded' });
  await wait(2000);
  try {
    // Change a slider value
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="range"]');
      if (inputs.length > 0) {
        inputs[0].value = 80;
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await wait(500);
    await page.click('.btn-primary');
    await wait(3000); // Wait for simulation to finish
    await page.screenshot({ path: '../assets/simulator-result.png', fullPage: true });
    console.log('Saved simulator-result.png');
  } catch (e) {
    console.log('Error in simulator: ' + e.message);
  }

  // 5. AI Advisor Output
  await page.goto('http://localhost:5173/ai-advisor', { waitUntil: 'domcontentloaded' });
  await wait(2000);
  try {
    await page.click('#run-advisor-btn'); // Run Analysis
    await wait(8000); // AI generation takes a few seconds
    await page.screenshot({ path: '../assets/ai-advisor-result.png', fullPage: true });
    console.log('Saved ai-advisor-result.png');
  } catch (e) {
    console.log('Error in ai advisor: ' + e.message);
  }

  await browser.close();
  console.log('Done generating interactive screenshots!');
})();
