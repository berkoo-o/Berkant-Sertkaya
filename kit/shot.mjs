// Standbilder einer Knete-Seite zu Stimm-Zeiten: node kit/shot.mjs <seite> <prefix> t1 t2 …   (z. B. blackfriday/bf.html; Server Port 8780 im Hauptordner)
//                                                node kit/shot.mjs <seite> check   (Kollisionsprüfung, window.CHECK)
import {chromium} from 'playwright';
const [,, page, prefix, ...ts] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1080, height: 1920}});
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => {if (m.type() === 'error') console.log('CON', m.text());});
await p.goto('http://localhost:8780/' + page);
await p.waitForFunction('window.ready===true', null, {timeout: 240000});
if (prefix === 'check') console.log(JSON.stringify(await p.evaluate(() => window.CHECK())));
else for (const t of ts) {await p.evaluate(t => window.renderFrame(Math.round((t + 0.15) * 30)), +t); await p.screenshot({path: `${prefix}_${t}.png`, type: 'png'}); console.log('shot', t);}
await b.close();
