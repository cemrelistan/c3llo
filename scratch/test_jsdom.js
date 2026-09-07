import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('c:/Users/EMRE/Desktop/Sihirbaz/index.html', 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost',
  runScripts: 'dangerously',
  resources: 'usable'
});

dom.window.console.error = function(...args) {
    console.log('BROWSER ERROR:', ...args);
};
dom.window.console.log = function(...args) {
    console.log('BROWSER LOG:', ...args);
};

// Polyfill d3 if needed, but since it's imported in graph.js as d3 we'll see if it crashes.
dom.window.addEventListener('error', (e) => {
    console.log('UNCAUGHT BROWSER ERROR:', e.error);
});
dom.window.addEventListener('unhandledrejection', (e) => {
    console.log('UNHANDLED PROMISE:', e.reason);
});

// Load main.js manually because JSDOM doesn't support ES module scripts natively well
import('file:///c:/Users/EMRE/Desktop/Sihirbaz/src/main.js').then(m => {
    console.log('Main loaded in Node. Trying to instantiate App inside JSDOM context...');
    try {
        // We can't directly run module in JSDOM, but we can look for obvious DOM null references
        // Actually, JSDOM won't execute `<script type="module">`.
        // We'll just run it as a node module. But document is not global.
    } catch(e) {
        console.log(e);
    }
}).catch(e => {
    console.log('IMPORT ERROR:', e);
});
