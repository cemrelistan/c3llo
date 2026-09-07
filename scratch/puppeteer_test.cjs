const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER_ERROR:', err.toString()));
  await page.goto('http://localhost:5173', {waitUntil: 'networkidle0'});
  
  await page.click('[data-tab="calendar"]');
  await new Promise(r => setTimeout(r, 1000));
  
  const calendarCards = await page.evaluate(() => {
    return document.querySelectorAll('.course-card').length;
  });
  console.log('Calendar cards rendered:', calendarCards);
  
  // also check how many items in sidebar
  const courseCount = await page.evaluate(() => {
    return document.querySelectorAll('.course-checkbox').length;
  });
  console.log('Courses rendered in sidebar:', courseCount);
  
  await browser.close();
})();
