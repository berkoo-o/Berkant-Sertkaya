// Kollisionsprüfung des Noir-Videos: node karten/check_noir.mjs  (alle Karten gegen die Gegenstände auf dem Tisch, jedes dritte Bild)
import {chromium} from 'playwright';
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://localhost:8780/karten/noir.html'); await p.waitForFunction('window.ready===true', null, {timeout: 300000});
const r = await p.evaluate(() => window.collide(0, window.TOTAL, 3)); console.log('Gegenstände:', r.props, '· Treffer:', r.n); r.hits.forEach(h => console.log(h));
await b.close();
