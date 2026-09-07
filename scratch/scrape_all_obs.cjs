const puppeteer = require('puppeteer');
const fs = require('fs');

const deptIds = {
    'SNT': '284', 'ALM': '4', 'ARB': '6', 'CIN': '24', 'FRA': '54', 'HUK': '66',
    'ISP': '73', 'ITA': '75', 'ITB': '76', 'JPN': '80', 'RUS': '277',
    'BHB': '20', 'ECN': '40', 'EKO': '41', 'END': '46', 'ISL': '74', 'VBA': '306'
};

const deptsToFetch = Object.keys(deptIds);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let allScheduleHTMLs = {};

  for (const dept of deptsToFetch) {
    console.log('Fetching', dept, '...');
    try {
      await page.goto('https://obs.itu.edu.tr/public/DersProgram', {waitUntil: 'domcontentloaded'});
      await page.select('#dersBransKoduId', deptIds[dept]);
      
      await page.click('button.btn-block.btn-primary');
      
      // Wait for table to appear
      await page.waitForSelector('table', {timeout: 10000});
      await new Promise(r => setTimeout(r, 500)); // allow rendering
      
      const html = await page.evaluate(() => {
        const table = document.querySelector('table');
        return table ? table.outerHTML : '';
      });
      console.log(`Fetched ${dept}, length: ${html.length}`);
      allScheduleHTMLs[dept] = html;
    } catch(e) {
      console.log('Error on', dept, e.message);
    }
  }
  
  fs.writeFileSync('c:/Users/EMRE/Desktop/Sihirbaz/scratch/scraped_schedules.json', JSON.stringify(allScheduleHTMLs));
  console.log('Done fetching schedules.');
  
  await browser.close();
})();
