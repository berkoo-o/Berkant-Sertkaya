// Einzelbilder des Noir-Videos nach Bildnummer: node karten/frames_noir.mjs <ordner> f1 f2 …  (Dateien s_<bild>.png wie bei kit/sample.mjs)
import {chromium} from 'playwright';
const [,, dir, ...fs] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', e.message)); p.on('crash', () => console.log('CRASH'));
await p.goto('http://localhost:8780/karten/noir.html'); await p.waitForFunction('window.ready===true', null, {timeout: 300000});
for (const f of fs) {await p.evaluate(f => window.renderFrame(f), +f); await p.screenshot({path: `${dir}/s_${String(f).padStart(5, '0')}.png`, type: 'png'});}
console.log('done', fs.length); await b.close();
