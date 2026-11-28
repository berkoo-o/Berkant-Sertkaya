// Standbilder des Kinderzimmers: node kind/shot_zimmer.mjs <ordner> <looks, z. B. 2,3> <a0,a1,a2 | t1.0,t7.5,…>   (Server Port 8780 im Hauptordner)
// a<n> = ein Alter fest (Detailprüfung), t<s> = Zeitpunkt im Video (Stimm-Zeit). Für Zeitpunkte wird die Seite je Look nur einmal geladen.
import {chromium} from 'playwright';
const [,, dir = '.', ss = '2,3', spec = 'a0,a1,a2'] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const open = async q => {const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', q, e.message));
  p.on('console', m => {if (m.type() === 'error') console.log('CON', m.text());}); await p.goto(`http://localhost:8780/kind/zimmer.html?${q}`); await p.waitForFunction('window.ready===true', null, {timeout: 300000}); return p;};
for (const s of ss.split(',')) {const items = spec.split(',');
  if (items[0][0] === 'a') for (const a of items) {const p = await open(`s=${s}&a=${a.slice(1)}`); await p.screenshot({path: `${dir}/z_s${s}_${a}.png`}); console.log('shot', s, a); await p.close();}
  else {const p = await open(`s=${s}`); for (const t of items) {const v = +t.slice(1); await p.evaluate(v => window.renderFrame(Math.round((v + 0.15) * 30)), v); await p.screenshot({path: `${dir}/z_s${s}_t${v}.png`}); console.log('shot', s, t);} await p.close();}}
await b.close();
