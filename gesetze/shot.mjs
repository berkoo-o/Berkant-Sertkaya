// usage: node shot.mjs <prefix> t1 t2 …   (Standbilder der Podest-Szene zu Stimm-Zeiten; Server Port 8780 im Hauptordner)
//        node shot.mjs check              (Kollisionsprüfung, siehe check() in src/podest.js)
import {chromium} from 'playwright';
const [,, prefix, ...ts] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1080, height: 1920}});
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('CON', m.text()));
await p.goto('http://localhost:8780/gesetze/podest.html' + (process.env.Q || ''));
await p.waitForFunction('window.ready===true', null, {timeout: 240000});
if (prefix === 'check') {console.log(JSON.stringify(await p.evaluate(() => window.CHECK()), null, 1));}
else for (const t of ts) {await p.evaluate(t => window.renderFrame(Math.round((t + 0.15) * 30)), +t); await p.screenshot({path: `${prefix}_${t}.png`, type: 'png'}); console.log('shot', t);}
await b.close();
