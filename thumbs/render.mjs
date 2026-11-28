// Thumbnail-System rendern: node thumbs/render.mjs [stil…]   → thumbs/out/S<n>_<video>.png (9:16) und _3x4.png   (Server Port 8780 im Hauptordner)
import {chromium} from 'playwright';
import fs from 'node:fs';
const styles = process.argv.slice(2).length ? process.argv.slice(2) : ['1', '2', '3', '4'];
fs.mkdirSync('thumbs/out', {recursive: true});
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', e.message));
for (const s of styles) for (const v of ['gesetze', 'vermoegen']) {
  await p.goto(`http://localhost:8780/thumbs/thumb.html?s=${s}&v=${v}`); await p.waitForFunction('window.ready===true', null, {timeout: 60000});
  await p.screenshot({path: `thumbs/out/S${s}_${v}.png`}); await p.screenshot({path: `thumbs/out/S${s}_${v}_3x4.png`, clip: {x: 0, y: 240, width: 1080, height: 1440}}); console.log('ok', s, v);}
await b.close();
