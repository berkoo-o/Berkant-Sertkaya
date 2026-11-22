// Prüfbilder über das ganze Video: node kit/sample.mjs <seite> <ordner> [schritt in s] [tabs]
// Rendert alle <schritt> Sekunden ein Bild (Stimm-Zeit, wie kit/shot.mjs) nach <ordner>/s_<zeit>.png, mehrere Tabs parallel.
import {chromium} from 'playwright';
import fs from 'node:fs';
const [,, page, dir, step = '0.25', tabs = '4'] = process.argv;
fs.mkdirSync(dir, {recursive: true});
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const open = async () => {const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => {if (m.type() === 'error') console.log('CON', m.text());});
  await p.goto('http://localhost:8780/' + page); await p.waitForFunction('window.ready===true', null, {timeout: 240000}); return p;};
const pages = await Promise.all(Array.from({length: +tabs}, open));
const total = await pages[0].evaluate(() => window.TOTAL);
const ts = []; for (let f = 0; f < total; f += Math.round(+step * 30)) ts.push(f);
if (ts[ts.length - 1] !== total - 1) ts.push(total - 1);
let n = 0;
await Promise.all(pages.map(async (p, w) => {for (let i = w; i < ts.length; i += pages.length) {const f = ts[i];
  await p.evaluate(f => window.renderFrame(f), f); await p.screenshot({path: `${dir}/s_${String(f).padStart(5, '0')}.png`, type: 'png'}); n++;}}));
console.log('frames', n, 'of', total);
await b.close();
