const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://obs.itu.edu.tr/public/DersProgram', {waitUntil: 'networkidle0'});
  
  // select department ID 284 (SNT)
  await page.select('#dersBransKoduId', '284');
  
  // click Goster (button type="button" class="btn btn-primary ml-2")
  await page.click('button.btn.btn-primary.ml-2');
  
  // wait for response and table
  await page.waitForResponse(response => response.url().includes('DersProgramSearch') && response.status() === 200);
  await new Promise(r => setTimeout(r, 1000));
  
  // extract table
  const html = await page.evaluate(() => {
    const table = document.querySelector('table');
    return table ? table.outerHTML : '';
  });
  
  console.log('HTML length:', html.length);
  fs.writeFileSync('snt_table.html', html);
  
  await browser.close();
})();
