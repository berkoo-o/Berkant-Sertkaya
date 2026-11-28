// Testbilder: node karten/shot.mjs <stil> <ausgabe-präfix> t1 t2 …  (Sekunden der Test-Zeitleiste)
import {chromium} from 'playwright';
const [,, s, prefix, ...ts] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1080, height: 1920}});
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => {if (m.type() === 'error' || m.type() === 'warning') console.log('CON', m.text().slice(0, 300));});
const t0 = Date.now(); await p.goto(`http://localhost:8780/karten/test.html?s=${s}`); await p.waitForFunction('window.ready===true', null, {timeout: 300000});
console.log('load', ((Date.now() - t0) / 1000).toFixed(1), 's');
for (const t of ts) {const t1 = Date.now(); await p.evaluate(f => window.renderFrame(f), Math.round(+t * 30)); await p.screenshot({path: `${prefix}_${t}.png`, type: 'png'}); console.log('shot', t, ((Date.now() - t1) / 1000).toFixed(1), 's');}
await b.close();
