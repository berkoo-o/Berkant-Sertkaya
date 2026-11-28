// Thumbnail-Motiv: das Kinderzimmer freigestellt (transparent): node kind/motif.mjs <look> <alter> <datei>   (Server Port 8780 im Hauptordner)
import {chromium} from 'playwright';
const [,, s = '3', a = '1', out = 'thumbs/motive_knete/kind.png'] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(`http://localhost:8780/kind/zimmer.html?s=${s}&a=${a}&motif=1`); await p.waitForFunction('window.ready===true', null, {timeout: 300000});
await p.screenshot({path: out, omitBackground: true}); console.log('ok', out); await b.close();
