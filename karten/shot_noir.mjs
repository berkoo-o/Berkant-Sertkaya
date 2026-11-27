// Testbilder des Noir-Videos: node karten/shot_noir.mjs <ausgabe-präfix> t1 t2 …  (Sekunden der Videozeit)
import {chromium} from 'playwright';
const [,, prefix, ...ts] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1080, height: 1920}});
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => {if (m.type() === 'error' || m.type() === 'warning') console.log('CON', m.text().slice(0, 300));});
const t0 = Date.now(); await p.goto('http://localhost:8780/karten/noir.html'); await p.waitForFunction('window.ready===true', null, {timeout: 300000});
console.log('load', ((Date.now() - t0) / 1000).toFixed(1), 's');
for (const t of ts) {await p.evaluate(f => window.renderFrame(f), Math.round(+t * 30)); await p.screenshot({path: `${prefix}_${t}.png`, type: 'png'});}
await b.close();
