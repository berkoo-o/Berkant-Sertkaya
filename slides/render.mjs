// Foto-Slides rendern: node slides/render.mjs [akku nap brot]  → slides/final/<name>_1.png, _2.png (1080 × 1350)   (Server Port 8780 im Hauptordner)
import {chromium} from 'playwright';
import fs from 'node:fs';
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['akku', 'nap', 'brot'];
fs.mkdirSync('slides/final', {recursive: true});
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1080, height: 1350}, deviceScaleFactor: 1});
for (const n of names) for (const s of [1, 2]) {
  await p.goto(`http://localhost:8780/slides/slides.html?p=${n}&s=${s}`); await p.waitForFunction('window.ready===true');
  await p.locator('#slide').screenshot({path: `slides/final/${n}_${s}.png`}); console.log('ok', n, s);}
await b.close();
