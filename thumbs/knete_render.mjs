// Knete-Motive rendern: node thumbs/knete_render.mjs [name…]  → thumbs/motive_knete/<name>.png (transparent, 1080 × 1920)   (Server Port 8780 im Hauptordner)
import {chromium} from 'playwright';
import fs from 'node:fs';
const ALL = ['gesetze', 'bankrun1', 'bankrun2', 'geldautomat', 'strom', 'rundfunk', 'merz', 'jahr2027', 'paket', 'tuev', 'umwelt', 'autobahn', 'benzin', 'kennzeichen', 'wasserscheide', 'genz', 'blackfriday', 'brutto'];
const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
fs.mkdirSync('thumbs/motive_knete', {recursive: true});
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
for (const n of names) {const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', n, e.message));
  await p.goto(`http://localhost:8780/thumbs/knete.html?m=${n}`); await p.waitForFunction('window.ready===true', null, {timeout: 300000});
  await p.screenshot({path: `thumbs/motive_knete/${n}.png`, omitBackground: true}); console.log('ok', n); await p.close();}
await b.close();
