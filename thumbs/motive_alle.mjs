// Freigestellte Motive aller Videos aus den bisherigen Cover-Seiten: node thumbs/motive_alle.mjs [name…]   (Server Port 8780 im Hauptordner)
// Die 2D-Ebenen (Hintergrund, Glow, Schrift) werden ausgeblendet, übrig bleibt nur das 3D-Motiv mit transparentem Hintergrund.
import {chromium} from 'playwright';
const JOBS = {
  geldautomat: '/geldautomat/cover_atm_modern.html?mode=clean',
  strom: '/strom/v4/cover_strom.html',
  rundfunk: '/rundfunk/cover/cover_gez.html?v=2&txt=0',
  rundfunk_turm: '/rundfunk/cover/cover_turm.html',
  merz: '/merz/cover/cover_merz.html',
  jahr2027: '/jahr2027/cover_clean.html?v=1',
  bankrun1: '/bankrun/cover/cover_bankrun.html?v=1',
  bankrun2: '/bankrun/cover/cover_bankrun.html?v=2',
  paket: '/paket-test/cover3.html?mode=clean'};
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
for (const n of names) {const p = await b.newPage({viewport: {width: 1080, height: 1920}}); p.on('pageerror', e => console.log('ERR', n, e.message));
  try {await p.goto('http://localhost:8780' + JOBS[n]); await p.waitForFunction('window.ready===true', null, {timeout: 300000}); await p.waitForTimeout(300);
    await p.evaluate(() => {for (const c of document.querySelectorAll('canvas')) if (c.id === 'bg' || c.id === 'fg' || c.getContext('2d')) c.style.display = 'none';
      for (const e of document.body.querySelectorAll('div,span,p,h1,h2,img')) e.style.display = 'none';
      document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';});
    await p.screenshot({path: `thumbs/motive/${n}.png`, omitBackground: true}); console.log('ok', n);}
  catch (e) {console.log('FEHLER', n, e.message.split('\n')[0]);}
  await p.close();}
await b.close();
