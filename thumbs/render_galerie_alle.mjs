// Galerie-Thumbnails für alle Videos: node thumbs/render_galerie_alle.mjs [name…]  → thumbs/final/Thumbnail_<name>.png (1080 × 1920)   (Server Port 8780)
import {chromium} from 'playwright';
import fs from 'node:fs';
const ALL = ['gesetze', 'vermoegen', 'bankrun1', 'bankrun2', 'geldautomat', 'strom', 'rundfunk', 'merz', 'jahr2027', 'paket', 'tuev', 'umwelt', 'autobahn', 'benzin', 'kennzeichen', 'wasserscheide'];
const names = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
fs.mkdirSync('thumbs/final', {recursive: true});
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', e.message));
for (const n of names) {await p.goto(`http://localhost:8780/thumbs/galerie.html?v=${n}`); await p.waitForFunction('window.ready===true', null, {timeout: 60000});
  await p.screenshot({path: `thumbs/final/Thumbnail_${n}.png`}); console.log('ok', n);}
await b.close();
