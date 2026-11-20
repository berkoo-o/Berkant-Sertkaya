// function. – Videos auf dem eigenen PC mit der Grafikkarte rendern.
//
// Aufruf (in PowerShell im Projektordner):
//   node render-pc.mjs                → aktueller Auftrag aus pc-auftrag.json (so startet ihn „Video rendern.cmd“)
//   node render-pc.mjs <ordner> [auftrag]
//   z. B. node render-pc.mjs bankrun test   → liest bankrun/test.render.json
//         node render-pc.mjs bankrun        → liest bankrun/render.json
//
// Das Skript installiert beim ersten Start selbst, was fehlt (three, Schriften, Playwright und den
// Render-Browser), startet einen kleinen lokalen Webserver, rendert jedes Bild der Seite und gibt es
// direkt an ffmpeg weiter. Die fertigen Dateien landen in pc-out/<ordner>/ (wird von git ignoriert).
//
// Aufbau einer *.render.json:
//   { "page": "seite.html", "width": 1080, "height": 1920, "fps": 30,
//     "jobs": [ { "name": "Datei", "query": "?s=1", "frames": 2300,
//                 "audio": [ { "file": "mix_music.m4a", "suffix": "_mit_Musik" } ] },
//               { "name": "Standbild", "query": "?s=2", "still": true } ] }
// Die Seite setzt window.ready=true, sobald sie fertig geladen ist, und stellt für Videos
// window.renderFrame(f) bereit, das Bild Nummer f (ab 0) zeichnet. Das Ergebnis ist nur vom Bild
// abhängig, nicht von der Reihenfolge, deshalb können mehrere Tabs parallel rendern.

import {spawn, spawnSync} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WIN = process.platform === 'win32';
const fail = msg => { console.error('\n✖ ' + msg + '\n'); process.exit(1); };
// Ohne Angaben (Doppelklick auf „Video rendern.cmd“) gilt der aktuelle Auftrag aus pc-auftrag.json.
let [, , folder, task = 'render'] = process.argv;
if (!folder || folder === 'auto') {
  const a = JSON.parse(fs.readFileSync(path.join(ROOT, 'pc-auftrag.json'), 'utf8'));
  folder = a.folder; task = a.task || 'render';
  console.log(`▶ Aktueller Auftrag: ${a.title || folder + ' / ' + task}`);
}
const sec = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';

if (!folder) fail('Bitte den Ordner angeben, zum Beispiel: node render-pc.mjs bankrun test');
if (+process.versions.node.split('.')[0] < 18) fail('Node.js ist zu alt. Bitte installieren: winget install --id OpenJS.NodeJS.LTS -e');
const cfgFile = path.join(ROOT, folder, task === 'render' ? 'render.json' : `${task}.render.json`);
if (!fs.existsSync(cfgFile)) fail(`Auftrag nicht gefunden: ${path.relative(ROOT, cfgFile)}. Hast du vorher "git pull" gemacht?`);
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
const Wd = cfg.width || 1080, Hd = cfg.height || 1920, FPS = cfg.fps || 30;

// ---------- 1. Werkzeuge prüfen und fehlende Pakete installieren ----------
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, {cwd: ROOT, stdio: 'inherit', shell: WIN, ...opts});
if (spawnSync('ffmpeg', ['-version'], {stdio: 'ignore', shell: WIN}).status !== 0)
  fail('ffmpeg fehlt. Bitte in PowerShell eingeben: winget install --id Gyan.FFmpeg -e\n  Danach PowerShell schließen und neu öffnen.');
const need = ['three/package.json', 'playwright/package.json', '@fontsource/poppins/package.json', '@fontsource/inter-tight/package.json'];
if (!need.every(p => fs.existsSync(path.join(ROOT, 'node_modules', p)))) {
  console.log('▶ Installiere die Pakete (nur beim ersten Mal) …');
  if (run('npm', ['install', '--no-package-lock', '--no-audit', '--no-fund']).status !== 0) fail('npm install hat nicht geklappt.');
}
const {chromium} = await import('playwright');
if (!fs.existsSync(chromium.executablePath())) {
  console.log('▶ Lade den Render-Browser herunter (nur beim ersten Mal, etwa 150 MB) …');
  if (run('npx', ['playwright', 'install', 'chromium']).status !== 0) fail('Der Render-Browser konnte nicht geladen werden.');
}

// ---------- 2. kleiner Webserver für die Projektdateien ----------
const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary'};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const i = p.indexOf('/node_modules/');                       // jede Seite nutzt die Pakete im Hauptordner
  let file = i >= 0 ? path.join(ROOT, 'node_modules', p.slice(i + 14)) : path.join(ROOT, p);
  file = path.normalize(file);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store'});
  fs.createReadStream(file).pipe(res);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const BASE = `http://127.0.0.1:${server.address().port}/${folder}/${cfg.page}`;

// ---------- 3. Browser mit Grafikkarte starten ----------
const gpuArgs = WIN ? ['--use-angle=d3d11'] : process.platform === 'darwin' ? ['--use-angle=metal'] : [];
const args = ['--ignore-gpu-blocklist', '--enable-gpu', '--enable-unsafe-swiftshader', ...gpuArgs];
let browser;
try { browser = await chromium.launch({channel: 'chromium', args}); }
catch { browser = await chromium.launch({args}); }

async function openPage(query) {
  const page = await browser.newPage({viewport: {width: Wd, height: Hd}});
  page.on('pageerror', e => console.log('  Seitenfehler:', e.message));
  await page.goto(BASE + (query || ''));
  await page.waitForFunction('window.ready===true', null, {timeout: 300000});
  return page;
}
{ // welche Grafikkarte rendert?
  const p = await browser.newPage();
  const gpu = await p.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl'); if (!gl) return 'keine (WebGL fehlt)';
    const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); });
  await p.close();
  console.log(`▶ Grafik: ${gpu}`);
  if (/swiftshader|llvmpipe|software/i.test(gpu)) console.log('  Hinweis: Die Grafikkarte wird nicht benutzt, es rechnet der Prozessor. Das klappt trotzdem, dauert aber länger.');
}

// ---------- 4. Aufträge abarbeiten ----------
const OUT = path.join(ROOT, 'pc-out', folder);
fs.mkdirSync(OUT, {recursive: true});
const ff = (a, opts = {}) => spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a], {stdio: ['pipe', 'inherit', 'inherit'], ...opts});
const finished = p => new Promise((ok, no) => p.on('close', c => c === 0 ? ok() : no(new Error('ffmpeg Fehler ' + c))));
const tabs = Math.max(1, Math.min(cfg.tabs || 4, Math.floor(os.cpus().length / 2)));
const made = [];
const t0all = Date.now();

for (const job of cfg.jobs) {
  const t0 = Date.now();
  if (job.still) {
    const page = await openPage(job.query);
    const file = path.join(OUT, job.name + '.png');
    await page.screenshot({path: file, type: 'png'});
    await page.close();
    made.push(file);
    console.log(`✔ ${job.name}.png (${sec(Date.now() - t0)})`);
    continue;
  }
  const N = job.frames;
  console.log(`▶ ${job.name}: ${N} Bilder mit ${tabs} Tabs …`);
  const pages = await Promise.all(Array.from({length: tabs}, () => openPage(job.query)));
  const tmp = path.join(OUT, job.name + '.video.mp4');
  const enc = ff(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
    '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), tmp]);
  const encDone = finished(enc);
  const ready = new Map(); let next = 0, flushing = false, lastLog = Date.now();
  async function flush() {
    if (flushing) return; flushing = true;
    while (ready.has(next)) {
      const b = ready.get(next); ready.delete(next); next++;
      if (!enc.stdin.write(b)) await once(enc.stdin, 'drain');
      if (Date.now() - lastLog > 3000 || next === N) {
        lastLog = Date.now();
        const fps = next / ((Date.now() - t0) / 1000), rest = (N - next) / fps;
        process.stdout.write(`\r  ${next}/${N} Bilder · ${fps.toFixed(1).replace('.', ',')} Bilder/s · noch etwa ${Math.ceil(rest / 60)} min   `);
      }
    }
    flushing = false;
  }
  await Promise.all(pages.map(async (page, w) => {
    for (let f = w; f < N; f += tabs) {
      while (f - next > 48) await new Promise(r => setTimeout(r, 5));   // nicht zu weit vorauslaufen
      await page.evaluate(n => window.renderFrame(n), f);
      ready.set(f, await page.screenshot({type: 'jpeg', quality: 95}));
      flush();
    }
  }));
  while (next < N) { await flush(); await new Promise(r => setTimeout(r, 5)); }
  enc.stdin.end(); await encDone; process.stdout.write('\n');
  await Promise.all(pages.map(p => p.close()));
  const outs = job.audio && job.audio.length ? job.audio : [{suffix: ''}];
  for (const a of outs) {
    const file = path.join(OUT, job.name + (a.suffix || '') + '.mp4');
    const audioIn = a.file ? ['-i', path.join(ROOT, folder, a.file), '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : [];
    await finished(ff(['-i', tmp, ...audioIn, '-c:v', 'copy', '-movflags', '+faststart', file]));
    made.push(file);
  }
  fs.unlinkSync(tmp);
  console.log(`✔ ${job.name} fertig in ${sec(Date.now() - t0)} (${(N / ((Date.now() - t0) / 1000)).toFixed(1).replace('.', ',')} Bilder/s)`);
}

await browser.close(); server.close();
console.log(`\nAlles fertig in ${sec(Date.now() - t0all)}. Die Dateien liegen in:\n  ${OUT}`);
for (const f of made) console.log('  · ' + path.basename(f));
if (WIN) spawn('explorer', [OUT], {detached: true, stdio: 'ignore'}).unref();
