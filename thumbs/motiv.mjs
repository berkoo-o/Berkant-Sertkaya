// Freigestellte Motive (PNG mit transparentem Hintergrund) für das Thumbnail-System: node thumbs/motiv.mjs   (Server Port 8780 im Hauptordner)
import {chromium} from 'playwright';
const jobs = [['gesetze', '/gesetze/podest.html?cover=1&bg=0'], ['vermoegen', '/vermoegen/knete.html?cover=1&ct=35&bg=0']];
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
for (const [name, url] of jobs) {const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8780' + url); await p.waitForFunction('window.ready===true', null, {timeout: 600000});
  await p.screenshot({path: `thumbs/motive/${name}.png`, omitBackground: true}); console.log('ok', name); await p.close();}
await b.close();
