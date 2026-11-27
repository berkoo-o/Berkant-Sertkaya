// Stiltest-Bilder des Kinderzimmers: node kind/shot_zimmer.mjs <ordner> [s1,s2] [a1,a2]   (Server Port 8780 im Hauptordner)
import {chromium} from 'playwright';
const [,, dir = '.', ss = '1,2,3', aa = '0,1,2'] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
for (const s of ss.split(',')) for (const a of aa.split(',')) {
  const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  p.on('pageerror', e => console.log('ERR', s, a, e.message)); p.on('console', m => {if (m.type() === 'error') console.log('CON', m.text());});
  await p.goto(`http://localhost:8780/kind/zimmer.html?s=${s}&a=${a}`);
  await p.waitForFunction('window.ready===true', null, {timeout: 300000});
  await p.screenshot({path: `${dir}/z_s${s}_a${a}.png`, type: 'png'}); console.log('shot', s, a); await p.close();}
await b.close();
