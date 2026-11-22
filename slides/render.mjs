// Foto-Slides rendern: node slides/render.mjs [akku nap brot]  → slides/final/<name>_1.png, _2.png (1440 × 1920, 3:4 für Instagram; gerendert mit doppelter Auflösung und herunterskaliert)   (Server Port 8780 im Hauptordner)
import {chromium} from 'playwright';
import fs from 'node:fs';
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['akku', 'nap', 'brot'];
fs.mkdirSync('slides/final', {recursive: true});
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1080, height: 1440}, deviceScaleFactor: 2});
for (const n of names) for (const s of [1, 2]) {
  await p.goto(`http://localhost:8780/slides/slides.html?p=${n}&s=${s}`); await p.waitForFunction('window.ready===true');
  await p.locator('#slide').screenshot({path: `slides/final/${n}_${s}_2x.png`}); console.log('ok', n, s);}
await b.close();
// 2160 × 2880 → 1440 × 1920 (Lanczos), damit Schrift und Kanten besonders sauber sind
import {execFileSync} from 'node:child_process';
for (const n of names) for (const s of [1, 2]) {const f = `slides/final/${n}_${s}`; execFileSync('python3', ['-c', `from PIL import Image; Image.open('${f}_2x.png').convert('RGB').resize((1440, 1920), Image.LANCZOS).save('${f}.png', optimize=True); import os; os.remove('${f}_2x.png')`]);}
