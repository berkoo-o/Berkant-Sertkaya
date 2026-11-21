// Prüf-Render in der Cloud: Bilder von podest.html in ein Video (nur zur Kontrolle, das fertige Video rendert der PC)
// usage: node preview_podest.mjs out.mp4 [tabs] [von] [bis]
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const [, , out, tabsA, fromA, toA] = process.argv;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const tabs = +(tabsA || 3);
const pages = await Promise.all(Array.from({length: tabs}, async () => {const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('http://localhost:8780/gesetze/podest.html'); await p.waitForFunction('window.ready===true', null, {timeout: 600000}); return p;}));
const N = await pages[0].evaluate(() => window.TOTAL); const F0 = +(fromA || 0), F1 = Math.min(N, +(toA || N)); const n = F1 - F0;
const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', out], {stdio: ['pipe', 'inherit', 'inherit']});
const done = new Promise(r => enc.on('close', r)); const ready = new Map(); let next = 0, flushing = false; const t0 = Date.now(); let last = 0;
async function flush() {if (flushing) return; flushing = true; while (ready.has(next)) {const buf = ready.get(next); ready.delete(next); next++; if (!enc.stdin.write(buf)) await once(enc.stdin, 'drain');
  if (Date.now() - last > 60000) {last = Date.now(); console.log(`${next}/${n} · ${(next / ((Date.now() - t0) / 1000)).toFixed(2)} fps`);}} flushing = false;}
await Promise.all(pages.map(async (p, w) => {for (let i = w; i < n; i += tabs) {while (i - next > 24) await new Promise(r => setTimeout(r, 10));
  await p.evaluate(f => window.renderFrame(f), F0 + i); ready.set(i, await p.screenshot({type: 'jpeg', quality: 92})); flush();}}));
while (next < n) {await flush(); await new Promise(r => setTimeout(r, 10));}
enc.stdin.end(); await done; await b.close(); console.log(`fertig: ${n} Bilder in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
