// Gemeinsamer Baukasten für Knete-Videos (Look von „Wem gehört Deutschland?“, Knete-Fassung): Materialien, Figuren, Münzen,
// Kamera-Fit, Texte (Titel, große Zahl, Untertitel, Quelle, Logo) und die schlichte 2D-Outro aus dem Gesetze-Video.
// Benutzt von blackfriday/ und brutto/ (22.11.2026). Seiten laden three über ihre importmap.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {TTFLoader} from 'three/addons/loaders/TTFLoader.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
export {THREE};

export const W = 1080, H = 1920, RED = 0xE01E2B, PI = Math.PI, FPS = 30;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const sm = u => u * u * (3 - 2 * u), smr = u => u * u * u * (u * (u * 6 - 15) + 10);
export const eo = u => 1 - Math.pow(1 - u, 3), ei = u => u * u * u, eio = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
export const back = u => {if (u <= 0) return 0; if (u >= 1) return 1; const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);};
export const popIn = (t, a, d = 0.35) => back(seg(t, a, a + d));
export const hash = n => {const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
let seed = 23; export const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '800 96px "Inter Tight"'].map(f => document.fonts.load(f)));
const ttf = async u => new FontLoader().parse(new TTFLoader().parse(await (await fetch(u)).arrayBuffer()));
export const FONT = await ttf('node_modules/@fontsource/inter-tight/files/inter-tight-latin-800-normal.woff');

// ------------------------------------------------------------------ renderer, scene, light (as in vermoegen/src/knete.js)
export const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, alpha: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
export const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
export const cam = new THREE.PerspectiveCamera(26, W / H, 0.05, 80);
export const hemi = new THREE.HemisphereLight(0xffe8f0, 0x6a5a80, 0.85); scene.add(hemi);
export const key = new THREE.DirectionalLight(0xffeedd, 2.0); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 5; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.015;
scene.add(key, key.target);
export const rim = new THREE.DirectionalLight(0x9a88ff, 0.7); scene.add(rim);
export const focus = new THREE.SpotLight(0xfff2e0, 0, 14, 0.42, 0.85, 1.2); scene.add(focus, focus.target);
export function lightRig(cx, cz, ext) {key.position.set(cx - 4, 8, cz + 6); key.target.position.set(cx, 0, cz); Object.assign(key.shadow.camera, {left: -ext, right: ext, top: ext, bottom: -ext, near: 1, far: 30});
  key.shadow.camera.updateProjectionMatrix(); rim.position.set(cx + 5, 3, cz - 4);}

// ------------------------------------------------------------------ clay helpers (same recipe as the clay video and the thumbnails)
export const tex = (w, h, draw) => {const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;};
export const add = (par, geo, m, x = 0, y = 0, z = 0) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; par.add(o); return o;};
export const grp = (par, x = 0, y = 0, z = 0, ry = 0) => {const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); return g;};
export const rbox = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, Math.max(0.0005, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)));
const clayBump = tex(512, 512, (g, w, h) => {g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {const x = R() * w, y = R() * h, r = 2 + R() * 12; const gr = g.createRadialGradient(x, y, 0, x, y, r); const v = R() < 0.5 ? 255 : 0;
    gr.addColorStop(0, `rgba(${v},${v},${v},0.09)`); gr.addColorStop(1, 'rgba(128,128,128,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);}
  g.lineWidth = 1.2; for (let i = 0; i < 40; i++) {const x = R() * w, y = R() * h; g.strokeStyle = 'rgba(70,70,70,0.10)'; for (let k = 0; k < 6; k++) {g.beginPath(); g.arc(x, y, 5 + k * 3.5, R() * 3, R() * 3 + 2.5); g.stroke();}}});
clayBump.wrapS = clayBump.wrapT = THREE.RepeatWrapping; clayBump.colorSpace = THREE.NoColorSpace;
export const clay = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.93, bumpMap: clayBump, bumpScale: 2.2, ...o});
export const redClay = (glow = 0.14) => clay(RED, {bumpScale: 1.3, emissive: RED, emissiveIntensity: glow});
export const glass = (c = 0xcfe6ff, op = 0.38) => new THREE.MeshStandardMaterial({color: c, roughness: 0.12, metalness: 0.05, transparent: true, opacity: op, depthWrite: false});
export const PAL = {grass: 0x8fd18a, street: 0x6b6f86, walk: 0xf3e3c8, cream: 0xf3ece0, white: 0xf6f4f8, dark: 0x3e3f5a, ink: '#2b2b38',
  peach: 0xf6b38f, sky: 0x9cc8f2, yellow: 0xf7dd7c, lilac: 0xc4a8f0, mint: 0x9fe0c6, pink: 0xf2a7c3, apricot: 0xffd2a6, sage: 0xb8d8a0, purple: 0x8f74d6, deep: 0x5b4a9a,
  tree: [0x5fc46a, 0x4fb07a, 0x7fcf5a], hair: [0x3b2a20, 0x8a5a3a, 0xd9a441, 0x2b2b33, 0x6b4a2a], skin: [0xf3c9a5, 0xe0a87e, 0xc08a62, 0x8f5f40, 0xf6d3b8]};
export const BODY = [0x5b8ef0, 0xf2a7c3, 0x9fe0c6, 0xf7dd7c, 0xa47ce0, 0xf6b38f, 0x6f8fb0, 0x58b48c, 0xffd2a6];
export const T2 = (g, s, x, y, font, col, align = 'center') => {g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y);};
export function fitText(g, s, maxW, weight = 800, start = 120, fam = '"Inter Tight"') {let fs = start; g.font = `${weight} ${fs}px ${fam}`; while (g.measureText(s).width > maxW && fs > 8) {fs -= 2; g.font = `${weight} ${fs}px ${fam}`;} return g.font;}
export function decal(par, w, h, t, x, y, z, o = {}) {const m = new THREE.MeshStandardMaterial({map: t, transparent: true, roughness: o.rough ?? 0.85, bumpMap: clayBump, bumpScale: o.bump ?? 0.5,
    emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? t : null, emissiveIntensity: o.glow || 0, side: o.double ? THREE.DoubleSide : THREE.FrontSide});
  const p = add(par, new THREE.PlaneGeometry(w, h), m, x, y, z); p.castShadow = false; if (o.ry) p.rotation.y = o.ry; if (o.rx) p.rotation.x = o.rx; return p;}
export function text3d(par, s, size, depth, m, align = 'center') {const g = new TextGeometry(s, {font: FONT, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: size * 0.02, bevelSegments: 3});
  g.computeBoundingBox(); const b = g.boundingBox; g.translate(align === 'center' ? -(b.min.x + b.max.x) / 2 : -b.min.x, -b.min.y, -(b.min.z + b.max.z) / 2); return add(par, g, m);}
export function plinth(par, w, d, bush = [[-1, -1], [1, -1], [-1, 1], [1, 1]], col = PAL.purple) {add(par, rbox(w, 0.34, d, 0.13), clay(col, {bumpScale: 1.4}), 0, -0.19, 0);
  add(par, rbox(w - 0.12, 0.05, d - 0.12, 0.03), clay(PAL.walk), 0, -0.025, 0);
  for (const [sx, sz] of bush) {const b = add(par, new THREE.IcosahedronGeometry(0.12, 2), clay(PAL.tree[Math.floor(R() * 3)]), sx * (w / 2 - 0.2), 0.075, sz * (d / 2 - 0.2)); b.scale.y = 0.75;}}
// a clay figure with legs and arms that can move (arms pivot at the shoulder: rotation.z = side * angle, 0.1 = down, 2.8 = up)
export function person(par, x, z, o = {}) {const G = grp(par, x, o.y || 0, z, o.ry || 0); G.scale.setScalar(o.s || 1); const B = grp(G);
  const body = clay(o.body ?? BODY[Math.floor(R() * BODY.length)]), leg = clay(o.leg ?? PAL.dark), skin = clay(o.skin ?? PAL.skin[Math.floor(R() * PAL.skin.length)]);
  const legs = [-1, 1].map(sx => {const L = grp(G, sx * 0.036, 0.18, 0); add(L, new THREE.CylinderGeometry(0.039, 0.036, 0.18, 14), leg, 0, -0.09, 0); return L;});
  add(B, new THREE.CapsuleGeometry(0.09, 0.135, 6, 16), body, 0, 0.3, 0);
  const arms = [-1, 1].map(sx => {const A = grp(B, sx * 0.0945, 0.385, 0); A.userData.sx = sx; add(A, new THREE.CapsuleGeometry(0.0204, 0.09, 4, 10), body, 0, -0.085, 0);
    const hand = grp(A, 0, -0.16, 0); A.rotation.z = sx * 0.1; A.userData.hand = hand; return A;});
  const head = grp(B, 0, 0.495, 0);
  add(head, new THREE.SphereGeometry(0.072, 20, 16), skin, 0, 0, 0);
  for (const sx of [-1, 1]) add(head, new THREE.SphereGeometry(0.0102, 8, 6), clay(0x22222a, {bumpScale: 0}), sx * 0.0255, 0.009, 0.0645).castShadow = false;
  if (o.hat) o.hat(head); else add(head, new THREE.SphereGeometry(0.0765, 18, 10, 0, PI * 2, 0, PI * 0.42), clay(o.hair ?? PAL.hair[Math.floor(R() * PAL.hair.length)]), 0, 0.009, -0.006);
  if (o.pack) add(B, rbox(0.12, 0.14, 0.06, 0.02), clay(o.pack), 0, 0.32, -0.11);
  if (o.tie) {add(B, rbox(0.045, 0.13, 0.01, 0.005), clay(0xf7f5f0), 0, 0.38, 0.086); add(B, rbox(0.022, 0.1, 0.012, 0.004), clay(o.tie), 0, 0.37, 0.091);}
  return {G, B, legs, arms, head};}
export const arm = (p, side, a) => {const A = p.arms[side < 0 ? 0 : 1]; A.rotation.z = A.userData.sx * a;};
export function walk(p, ph, amp = 0.5) {p.legs[0].rotation.x = amp * Math.sin(ph); p.legs[1].rotation.x = -amp * Math.sin(ph); p.B.position.y = Math.abs(Math.sin(ph)) * 0.012;}
export function still(p) {p.legs[0].rotation.x = 0; p.legs[1].rotation.x = 0; p.B.position.y = 0;}
export function tree(par, x, z, s = 1, y = 0) {const T = grp(par, x, y, z); T.scale.setScalar(s);
  add(T, new THREE.CylinderGeometry(0.02, 0.026, 0.14, 10), clay(0xa0704a), 0, 0.07, 0);
  add(T, new THREE.IcosahedronGeometry(0.15, 2), clay(PAL.tree[Math.floor(R() * 3)]), 0, 0.27, 0); if (R() < 0.6) add(T, new THREE.IcosahedronGeometry(0.1, 2), clay(PAL.tree[Math.floor(R() * 3)]), 0.06, 0.4, 0.02); return T;}
export function winTex(wall, win, cols, rows) {return tex(256, 256, (g, w, h) => {g.fillStyle = wall; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows;
  for (let i = 0; i < cols; i++) for (let k = 0; k < rows; k++) {g.fillStyle = win; g.beginPath(); g.roundRect(i * cw + cw * 0.25, k * rh + rh * 0.22, cw * 0.5, rh * 0.55, 6); g.fill();}});}
export const hex = c => '#' + new THREE.Color(c).getHexString();
// coins (clay gold with a pressed-in euro sign)
const coinTopT = tex(256, 256, (g, w, h) => {g.fillStyle = '#f4c34f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d99a2b'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, 7); g.stroke();
  g.fillStyle = '#d6952a'; g.font = '800 140px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', w / 2 - 4, h / 2 + 6);});
export const coinMats = [clay(0xe2a632, {roughness: 0.5, metalness: 0.25, bumpScale: 0.8}), new THREE.MeshStandardMaterial({map: coinTopT, roughness: 0.45, metalness: 0.25, bumpMap: clayBump, bumpScale: 0.6})];
export const CR = 0.085, CH = 0.034; export const coinGeo = new THREE.CylinderGeometry(CR, CR, CH, 36);
export const mkCoin = par => {const m = add(par, coinGeo, [coinMats[0], coinMats[1], coinMats[1]]); m.rotation.order = 'YXZ'; return m;};

// ------------------------------------------------------------------ camera: fit points into the free band between the top text and the subtitles
export function fit(pts, az, el, band = {}) {
  const B = {x0: 95, x1: 985, y0: 520, y1: 1365, ...band}, c = new THREE.PerspectiveCamera(26, W / H, 0.05, 80);
  const A = az * PI / 180, E = el * PI / 180, dir = V3(Math.cos(E) * Math.sin(A), Math.sin(E), Math.cos(E) * Math.cos(A));
  const box = new THREE.Box3().setFromPoints(pts); let t = box.getCenter(V3(0, 0, 0)), d = 10;
  for (let it = 0; it < 40; it++) {
    c.position.copy(t).addScaledVector(dir, d); c.lookAt(t); c.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of pts) {const q = p.clone().project(c), px = (q.x + 1) / 2 * W, py = (1 - q.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);}
    const s = Math.max((x1 - x0) / (B.x1 - B.x0), (y1 - y0) / (B.y1 - B.y0));
    const vh = 2 * d * Math.tan(13 * PI / 180), right = V3(1, 0, 0).applyQuaternion(c.quaternion), up = V3(0, 1, 0).applyQuaternion(c.quaternion);
    const ox = ((x0 + x1) / 2 - (B.x0 + B.x1) / 2) / H * vh, oy = ((y0 + y1) / 2 - (B.y0 + B.y1) / 2) / H * vh;
    t = t.clone().addScaledVector(right, ox * 0.8).addScaledVector(up, -oy * 0.8); d *= 1 + (s - 1) * 0.6;}
  return [t.x, t.y, t.z, d, az, el];}
export const boxPts = (x0, x1, y0, y1, z0, z1) => [V3(x0, y0, z0), V3(x1, y0, z0), V3(x0, y1, z0), V3(x1, y1, z0), V3(x0, y0, z1), V3(x1, y0, z1), V3(x0, y1, z1), V3(x1, y1, z1)];
export const K = (t, f, push = 1) => [t, ...f.slice(0, 3), f[3] * push, f[4], f[5]];
export function makeCam(CAM) {return v => {let k = 0; while (k < CAM.length - 2 && v >= CAM[k + 1][0]) k++;
  const a = CAM[k], b = CAM[k + 1], u = smr(seg(v, a[0], b[0])), q = a.map((x, i) => lerp(x, b[i], u));
  const [, tx, ty, tz, d, az, el] = q, A = (az + 0.25 * Math.sin(v * 0.21)) * PI / 180, E = (el + 0.15 * Math.sin(v * 0.27 + 0.7)) * PI / 180;
  cam.position.set(tx + d * Math.cos(E) * Math.sin(A), ty + d * Math.sin(E), tz + d * Math.cos(E) * Math.cos(A)); cam.lookAt(tx, ty, tz); cam.updateMatrixWorld();
  // the place we are looking at is always well lit (CLAUDE.md: „immer das Licht haben, wo wir gerade sind“)
  focus.position.set(tx + 0.6, ty + 3.2, tz + 1.8); focus.target.position.set(tx, ty, tz); focus.target.updateMatrixWorld(); focus.intensity = 9; focus.angle = clamp(0.2 + d * 0.018, 0.25, 0.5);
  return {tx, ty, tz, d};};}

// ------------------------------------------------------------------ text overlays (title, big number, subtitles, source, logo), like the laws video
const $ = id => document.getElementById(id);
const fadeIn = (v, a, b, f = 0.22) => Math.min(seg(v, a, a + f), 1 - seg(v, b - f, b));
export function makeOverlays({SUBS, NUMS, TITLES, SRCS, OUT0, num = null}) {const titleEl = $('title'), numEl = $('num'), subEl = $('sub'), srcEl = $('src'), logoEl = $('logo');
  let lastNum = '', lastTitle = '', lastSrc = '', lastSub = '';
  return v => {
    const ti = TITLES.find(q => v >= q[0] && v < q[1]); const tt = ti ? ti[2] : ''; if (tt !== lastTitle) {titleEl.textContent = tt; lastTitle = tt;}
    titleEl.style.opacity = ti ? fadeIn(v, ti[0], ti[1]) : 0; titleEl.style.transform = ti ? `translateY(${(1 - eo(seg(v, ti[0], ti[0] + 0.4))) * 14}px)` : 'none';
    const n = NUMS.find(q => v >= q[0] && v < q[1]);
    if (n) {const big = typeof n[2] === 'function' ? n[2](v) : n[2]; const html = big + '<small>' + n[3] + '</small>'; if (html !== lastNum) {numEl.innerHTML = html; lastNum = html;}
      const a = NUMS.indexOf(n), cont = n[4] === 'cont'; numEl.style.opacity = cont ? 1 - seg(v, n[1] - 0.22, n[1]) : fadeIn(v, n[0], n[1]);
      numEl.style.transform = `translateY(${(1 - eo(seg(v, n[0], n[0] + 0.35))) * (cont ? 0 : 16)}px)`;}
    else numEl.style.opacity = 0;
    const s = SUBS.find(q => v >= q[0] && v < q[1]); const st = s ? s[2] : ''; if (st !== lastSub) {subEl.textContent = st; lastSub = st;}
    subEl.style.opacity = s ? Math.min(1, (v - s[0]) / 0.18 + 0.15) * (1 - seg(v, OUT0 - 0.1, OUT0 + 0.2)) : 0; subEl.style.transform = s ? `translateY(${(1 - eo(seg(v, s[0], s[0] + 0.3))) * 8}px)` : 'none';
    const r = SRCS.find(q => v >= q[0] && v < q[1]); const rt = r ? r[2] : ''; if (rt !== lastSrc) {srcEl.textContent = rt; lastSrc = rt;} srcEl.style.opacity = r ? fadeIn(v, r[0], r[1]) : 0;
    logoEl.style.opacity = 1 - seg(v, OUT0, OUT0 + 0.35);};}
// words: a subtitle line from the first word starting at a to the last word ending before b
export function subsFromWords(words, groups) {const W_ = words.filter(w => !w.text.startsWith('[') && !w.text.endsWith(']'));
  let i = 0; return groups.map(g => {const n = g.split(' ').length; const a = W_[i].start, b = W_[i + n - 1].end; i += n; return [a - 0.05, b + 0.25, g];}).map((s, k, all) => k < all.length - 1 ? [s[0], Math.min(s[1], all[k + 1][0]), s[2]] : s);}

// ------------------------------------------------------------------ outro (2D, from the laws video): the picture gets darker, „function“ fades in letter by letter, the red dot pops in
const endEl = $('end'), endG = endEl.getContext('2d');
const LOGO_FS = 170, LOGO_Y = 1010;
endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px';
const LW = endG.measureText('function').width, DW = endG.measureText('.').width, DOT = endG.measureText('.');
const LX = W / 2 - (LW + DW) / 2, DOTX = LX + LW + (DOT.actualBoundingBoxRight - DOT.actualBoundingBoxLeft) / 2, DOTR = (DOT.actualBoundingBoxAscent + DOT.actualBoundingBoxDescent) / 2, DOTY = LOGO_Y - DOT.actualBoundingBoxAscent + DOTR;
const LETX = []; {let x = LX; for (const ch of 'function') {LETX.push(x); x = LX + endG.measureText('function'.slice(0, LETX.length)).width;}}
export function outro(v, OUT0) {const u = v - OUT0; endG.clearRect(0, 0, W, H); if (u < 0) return;
  const f = sm(seg(u, 0, 0.45)); const bg = endG.createRadialGradient(W / 2, 980, 60, W / 2, 980, 1250);
  bg.addColorStop(0, '#2c2247'); bg.addColorStop(0.55, '#1a1430'); bg.addColorStop(1, '#07070b');
  endG.globalAlpha = 0.72 * f; endG.fillStyle = bg; endG.fillRect(0, 0, W, H); endG.globalAlpha = 1;
  {const g = endG.createRadialGradient(W / 2, LOGO_Y - 55, 40, W / 2, LOGO_Y - 55, 560); g.addColorStop(0, `rgba(10,8,20,${0.4 * f})`); g.addColorStop(1, 'rgba(10,8,20,0)'); endG.fillStyle = g; endG.fillRect(0, 0, W, H);}
  const dp = back(seg(u, 1.28, 1.62)), land = seg(u, 1.28, 1.62), sq = land > 0 && land < 1 ? Math.sin(PI * land) * 0.18 : 0;
  if (dp > 0) {endG.save(); endG.fillStyle = '#E01E2B'; endG.beginPath(); endG.ellipse(DOTX, DOTY, DOTR * dp * (1 + sq), DOTR * dp * (1 - sq), 0, 0, PI * 2); endG.fill(); endG.restore();}
  endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px'; endG.fillStyle = '#E01E2B'; endG.textAlign = 'left'; endG.textBaseline = 'alphabetic';
  'function'.split('').forEach((ch, i) => {const a = sm(seg(u, 0.4 + i * 0.07, 0.85 + i * 0.07)); if (a <= 0) return; endG.save(); endG.globalAlpha = a; endG.fillText(ch, LETX[i], LOGO_Y + (1 - a) * 34); endG.restore();});}

// the outro dims the 3D light a little, like the clay video
export function dimLights(v, OUT0) {const o = eio(clamp((v - OUT0) / 0.7)); key.intensity = 2.0 * (1 - 0.5 * o); hemi.intensity = 0.85 * (1 - 0.5 * o); scene.environmentIntensity = 0.4 * (1 - 0.5 * o); focus.intensity *= 1 - o;}
