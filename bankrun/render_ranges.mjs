// Renders only some frame ranges of modell.html (e.g. after a change that is not visible everywhere) into a lossless video.
// usage: node render_ranges.mjs <style 1|2> <out.mkv> '<[[a,b],…]>' [tabs]   (frames a … b-1, server on port 8778 in bankrun/)
// assemble.py then puts these frames into the existing video and keeps all other frames.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const [, , s, out, rangesJ, tabsA] = process.argv;
const frames = []; for (const [a, b] of JSON.parse(rangesJ)) for (let f = a; f < b; f++) frames.push(f);
const tabs = +(tabsA || 2), N = frames.length;
const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const pages = await Promise.all(Array.from({length: tabs}, async () => {const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  p.on('pageerror', e => console.log('ERR', e.message)); await p.goto('http://localhost:8778/modell.html?s=' + s); await p.waitForFunction('window.ready===true', null, {timeout: 300000}); return p;}));
const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-qp', '0', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out], {stdio: ['pipe', 'inherit', 'inherit']});
const done = new Promise(r => enc.on('close', r));
const ready = new Map(); let next = 0, flushing = false; const t0 = Date.now(); let last = 0;
async function flush() {if (flushing) return; flushing = true;
  while (ready.has(next)) {const buf = ready.get(next); ready.delete(next); next++; if (!enc.stdin.write(buf)) await once(enc.stdin, 'drain');
    if (Date.now() - last > 30000) {last = Date.now(); console.log(`${next}/${N} · ${(next / ((Date.now() - t0) / 1000)).toFixed(2)} fps`);}}
  flushing = false;}
await Promise.all(pages.map(async (p, w) => {for (let i = w; i < N; i += tabs) {while (i - next > 24) await new Promise(r => setTimeout(r, 10));
  await p.evaluate(f => window.renderFrame(f), frames[i]); ready.set(i, await p.screenshot({type: 'png'})); flush();}}));
while (next < N) {await flush(); await new Promise(r => setTimeout(r, 10));}
enc.stdin.end(); await done; await b.close(); console.log(`fertig: ${N} Bilder in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
