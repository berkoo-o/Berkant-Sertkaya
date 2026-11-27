// Knete-Motive für die Thumbnails (Wunsch des Nutzers 22.11.2026: „mach alle in Knete oder Wem-gehört-Deutschland-Stil“).
// Jedes Video bekommt ein eigenes kleines Knetmodell auf der lila Knetplatte aus „Wem gehört Deutschland?“, mit denselben Pastellfarben,
// derselben Knete-Struktur und demselben weichen Licht. Rot bleibt dem roten Faden des jeweiligen Videos vorbehalten.
// Aufruf: knete.html?m=<name>   (transparenter Hintergrund; node thumbs/knete_render.mjs rendert alle nach thumbs/motive_knete/)
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {TTFLoader} from 'three/addons/loaders/TTFLoader.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';

await Promise.all(['800 90px "Inter Tight"', '600 40px Poppins'].map(f => document.fonts.load(f)));
const Q = new URLSearchParams(location.search), MOT = Q.get('m') || 'gesetze';
const W = 1080, H = 1920, RED = 0xE01E2B, PI = Math.PI;
let seed = 23; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(+(Q.get('pr') || 1)); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0); document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
const cam = new THREE.PerspectiveCamera(24, W / H, 0.05, 80);
const S = new THREE.Group(); scene.add(S);

// ------------------------------------------------------------------ helpers (same clay recipe as vermoegen/src/knete.js)
const tex = (w, h, draw) => {const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;};
const add = (par, geo, m, x = 0, y = 0, z = 0) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; par.add(o); return o;};
const grp = (par, x = 0, y = 0, z = 0, ry = 0) => {const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); return g;};
const rbox = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, Math.max(0.0005, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)));
const clayBump = tex(512, 512, (g, w, h) => {g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {const x = R() * w, y = R() * h, r = 2 + R() * 12; const gr = g.createRadialGradient(x, y, 0, x, y, r); const v = R() < 0.5 ? 255 : 0;
    gr.addColorStop(0, `rgba(${v},${v},${v},0.09)`); gr.addColorStop(1, 'rgba(128,128,128,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);}
  g.lineWidth = 1.2; for (let i = 0; i < 40; i++) {const x = R() * w, y = R() * h; g.strokeStyle = 'rgba(70,70,70,0.10)'; for (let k = 0; k < 6; k++) {g.beginPath(); g.arc(x, y, 5 + k * 3.5, R() * 3, R() * 3 + 2.5); g.stroke();}}});
clayBump.wrapS = clayBump.wrapT = THREE.RepeatWrapping; clayBump.colorSpace = THREE.NoColorSpace;
const clay = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.93, bumpMap: clayBump, bumpScale: 2.2, ...o});
const redClay = () => clay(RED, {bumpScale: 1.3, emissive: RED, emissiveIntensity: 0.14});
const glass = (c = 0xcfe6ff, op = 0.38) => new THREE.MeshStandardMaterial({color: c, roughness: 0.12, metalness: 0.05, transparent: true, opacity: op, depthWrite: false});
const PAL = {grass: 0x8fd18a, street: 0x6b6f86, walk: 0xf3e3c8, cream: 0xf3ece0, white: 0xf6f4f8, dark: 0x3e3f5a, ink: '#2b2b38',
  peach: 0xf6b38f, sky: 0x9cc8f2, yellow: 0xf7dd7c, lilac: 0xc4a8f0, mint: 0x9fe0c6, pink: 0xf2a7c3, apricot: 0xffd2a6, sage: 0xb8d8a0, purple: 0x8f74d6, deep: 0x5b4a9a,
  tree: [0x5fc46a, 0x4fb07a, 0x7fcf5a], hair: [0x3b2a20, 0x8a5a3a, 0xd9a441, 0x2b2b33, 0x6b4a2a, 0xc9c3b8]};
const face = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
const BODY = [0x5b8ef0, 0xf2a7c3, 0x9fe0c6, 0xf7dd7c, 0xa47ce0, 0xf6b38f, 0x6f8fb0, 0x58b48c, 0xffd2a6];
// a flat picture on a face (labels, screens, number plates): transparent canvas, slightly in front of the face
function decal(par, w, h, t, x, y, z, o = {}) {const m = new THREE.MeshStandardMaterial({map: t, transparent: true, roughness: o.rough ?? 0.85, bumpMap: clayBump, bumpScale: o.bump ?? 0.5,
    emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? t : null, emissiveIntensity: o.glow || 0});
  const p = add(par, new THREE.PlaneGeometry(w, h), m, x, y, z); p.castShadow = false; if (o.ry) p.rotation.y = o.ry; if (o.rx) p.rotation.x = o.rx; return p;}
const FONT = new FontLoader().parse(new TTFLoader().parse(await (await fetch('node_modules/@fontsource/inter-tight/files/inter-tight-latin-800-normal.woff')).arrayBuffer()));
function text3d(par, s, size, depth, m) {const g = new TextGeometry(s, {font: FONT, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: size * 0.02, bevelSegments: 3});
  g.computeBoundingBox(); const b = g.boundingBox; g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -(b.min.z + b.max.z) / 2); return add(par, g, m);}
// the purple clay plate with the cream top (like „Wem gehört Deutschland?“), small bushes in the chosen corners
function plinth(w, d, bush = [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {add(S, rbox(w, 0.3, d, 0.12), clay(PAL.purple, {bumpScale: 1.4}), 0, -0.17, 0);
  add(S, rbox(w - 0.12, 0.05, d - 0.12, 0.03), clay(PAL.walk), 0, -0.025, 0);
  for (const [sx, sz] of bush) {const b = add(S, new THREE.IcosahedronGeometry(0.11, 2), clay(PAL.tree[Math.floor(R() * 3)]), sx * (w / 2 - 0.19), 0.07, sz * (d / 2 - 0.19)); b.scale.y = 0.75;}}
function person(par, x, z, o = {}) {const G = grp(par, x, o.y || 0, z, o.ry || 0); G.scale.setScalar(o.s || 1);
  const body = clay(o.body ?? BODY[Math.floor(R() * BODY.length)]), leg = clay(o.leg ?? PAL.dark), skin = clay(o.skin ?? 0xf3c9a5);
  for (const sx of [-1, 1]) add(G, new THREE.CylinderGeometry(0.039, 0.036, 0.18, 14), leg, sx * 0.036, 0.09, 0);
  add(G, new THREE.CapsuleGeometry(0.09, 0.135, 6, 16), body, 0, 0.3, 0);
  for (const sx of [-1, 1]) {if ((o.up || []).includes(sx)) {const a = add(G, new THREE.CapsuleGeometry(0.0204, 0.11, 4, 10), body, sx * 0.105, 0.44, 0.01); a.rotation.z = -sx * 0.28; continue;}
    const a = add(G, new THREE.CapsuleGeometry(0.0204, 0.09, 4, 10), body, sx * 0.0945, 0.294, 0); a.rotation.z = -sx * 0.1;}
  add(G, new THREE.SphereGeometry(0.072, 20, 16), skin, 0, 0.495, 0);
  for (const sx of [-1, 1]) add(G, new THREE.SphereGeometry(0.0102, 8, 6), clay(0x22222a, {bumpScale: 0}), sx * 0.0255, 0.504, 0.0645).castShadow = false;
  if (o.helmet) {add(G, new THREE.SphereGeometry(0.082, 18, 10, 0, PI * 2, 0, PI * 0.5), clay(o.helmet), 0, 0.51, 0); add(G, new THREE.CylinderGeometry(0.098, 0.098, 0.01, 24), clay(o.helmet), 0, 0.512, 0.004);}
  else add(G, new THREE.SphereGeometry(0.0765, 18, 10, 0, PI * 2, 0, PI * 0.42), clay(o.hair ?? PAL.hair[Math.floor(R() * PAL.hair.length)]), 0, 0.504, -0.006);
  if (o.pack) add(G, rbox(0.12, 0.14, 0.06, 0.02), clay(o.pack), 0, 0.32, -0.11);
  return G;}
function tree(par, x, z, s = 1, y = 0) {const T = grp(par, x, y, z); T.scale.setScalar(s);
  add(T, new THREE.CylinderGeometry(0.02, 0.026, 0.14, 10), clay(0xa0704a), 0, 0.07, 0);
  add(T, new THREE.IcosahedronGeometry(0.15, 2), clay(PAL.tree[Math.floor(R() * 3)]), 0, 0.27, 0); if (R() < 0.6) add(T, new THREE.IcosahedronGeometry(0.1, 2), clay(PAL.tree[Math.floor(R() * 3)]), 0.06, 0.4, 0.02); return T;}
function car(par, x, z, c, ry = 0, s = 1, y = 0) {const C = grp(par, x, y + 0.022 * s, z, ry); C.scale.setScalar(s); const m = clay(c);
  add(C, rbox(0.34, 0.08, 0.16, 0.035), m, 0, 0.06, 0); add(C, rbox(0.2, 0.07, 0.15, 0.03), m, -0.02, 0.13, 0);
  for (const sx of [-1, 1]) add(C, rbox(0.004, 0.045, 0.12, 0.002), clay(0xdff0ff, {roughness: 0.3, bumpScale: 0}), -0.02 + sx * 0.1005, 0.13, 0);
  for (const [wx, wz] of [[-0.11, 0.08], [0.11, 0.08], [-0.11, -0.08], [0.11, -0.08]]) add(C, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 14).rotateX(PI / 2), clay(PAL.dark), wx, 0.03, wz);
  return C;}
function house(par, x, z, c, roof, w = 0.42, h = 0.36, ry = 0) {const G = grp(par, x, 0, z, ry);
  const wt = tex(256, 256, (g, ww, hh) => {g.fillStyle = '#' + new THREE.Color(c).getHexString(); g.fillRect(0, 0, ww, hh); g.fillStyle = '#5b5a8a';
    for (const [px, py] of [[0.2, 0.25], [0.6, 0.25], [0.2, 0.6], [0.6, 0.6]]) {g.beginPath(); g.roundRect(px * ww, py * hh, ww * 0.2, hh * 0.2, 6); g.fill();}});
  const wm = clay(0xffffff, {map: wt}), pm = clay(c);
  add(G, rbox(w, h, w, 0.05), [wm, wm, pm, pm, wm, wm], 0, h / 2, 0);
  const r = new THREE.Shape(); r.moveTo(-w / 2 - 0.03, 0); r.lineTo(w / 2 + 0.03, 0); r.lineTo(0, w * 0.4); r.closePath();
  const g = new THREE.ExtrudeGeometry(r, {depth: w + 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3}); g.translate(0, 0, -(w + 0.04) / 2);
  add(G, g, clay(roof), 0, h, 0); return G;}
const coinTopT = tex(256, 256, (g, w, h) => {g.fillStyle = '#f4c34f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d99a2b'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, 7); g.stroke();
  g.fillStyle = '#d6952a'; g.font = '800 140px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', w / 2 - 4, h / 2 + 6);});
const coinSideM = clay(0xe2a632, {roughness: 0.5, metalness: 0.25, bumpScale: 0.8}), coinTopM = new THREE.MeshStandardMaterial({map: coinTopT, roughness: 0.45, metalness: 0.25, bumpMap: clayBump, bumpScale: 0.6});
const CR = 0.085, CH = 0.034, coinGeo = new THREE.CylinderGeometry(CR, CR, CH, 36);
function coins(par, x, z, n, y = 0) {for (let i = 0; i < n; i++) {const m = add(par, coinGeo, [coinSideM, coinTopM, coinTopM], x + (R() - 0.5) * 0.012, y + CH * (i + 0.5), z + (R() - 0.5) * 0.012); m.rotation.y = R() * 6;}}
const T2 = (g, s, x, y, font, col, align = 'center') => {g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y);};
// a tube that lies on the ground (and on hills): xz points, height from a surface function
function groundTube(pts, surf, r, m, lift = 0.0) {const P = pts.map(([x, z, y]) => new THREE.Vector3(x, y ?? (surf(x, z) + r * 0.7 + lift), z));
  const cv = new THREE.CatmullRomCurve3(P); const fine = cv.getSpacedPoints(160).map(p => (p.y = Math.max(p.y, surf(p.x, p.z) + r * 0.7 + lift), p));
  return add(S, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fine), 240, r, 10), m);}
// a license plate texture (EU strip, letters, two small seals)
function plateTex(city, rest, redCity = false) {return tex(1040, 232, (g, w, h) => {g.fillStyle = '#fbfaf6'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill();
  g.lineWidth = 9; g.strokeStyle = '#2b2b38'; g.beginPath(); g.roundRect(14, 14, w - 28, h - 28, 20); g.stroke();
  g.fillStyle = '#3b5fc6'; g.beginPath(); g.roundRect(18, 18, 108, h - 36, [16, 0, 0, 16]); g.fill();
  for (let k = 0; k < 12; k++) {const a = k / 12 * PI * 2; g.fillStyle = '#f7d54a'; g.beginPath(); g.arc(72 + Math.cos(a) * 28, 78 + Math.sin(a) * 28, 5, 0, 7); g.fill();}
  T2(g, 'D', 72, 165, '800 58px "Inter Tight"', '#fff');
  g.font = '800 150px "Inter Tight"'; const cw = g.measureText(city).width; T2(g, city, 160, h / 2 + 6, '800 150px "Inter Tight"', redCity ? '#E01E2B' : '#2b2b38', 'left');
  const sx = 160 + cw + 52; for (const [yy, c] of [[82, '#9cc8f2'], [150, '#8fd18a']]) {g.fillStyle = c; g.beginPath(); g.arc(sx, yy, 26, 0, 7); g.fill(); g.strokeStyle = '#2b2b38'; g.lineWidth = 3; g.stroke();}
  T2(g, rest, sx + 52, h / 2 + 6, '800 150px "Inter Tight"', '#2b2b38', 'left');});}

// ------------------------------------------------------------------ the motifs
const MOTIFS = {};
let VIEW = {az: -0.32, el: 0.4, fov: 24};

MOTIFS.gesetze = () => {   // five podiums 5 → 1 with the five laws (without the red §, Wunsch des Nutzers)
  plinth(4.15, 1.95, [[-1, -1], [1, 1]]);
  const cols = [PAL.mint, PAL.sky, PAL.yellow, PAL.lilac, PAL.peach], hs = [0.42, 0.56, 0.7, 0.84, 1.0], labs = ['WEHRDIENST', 'AGRARDIESEL', 'HEIZUNGSGESETZ', 'CORONA-REGELN', 'HARTZ IV'];
  const P = hs.map((h, i) => {const G = grp(S, -1.5 + i * 0.75, 0, 0.18 - i * 0.09); add(G, rbox(0.66, h, 0.66, 0.07), clay(cols[i]), 0, h / 2, 0);
    const fh = h - 0.12, t = tex(512, Math.round(512 * fh / 0.54), (g, w, hh) => {T2(g, String(5 - i), w / 2, hh * 0.42, `800 ${Math.min(330, hh * 0.6)}px "Inter Tight"`, PAL.ink);
      g.fillStyle = 'rgba(255,255,255,0.88)'; g.beginPath(); g.roundRect(34, hh - 118, w - 68, 80, 32); g.fill(); T2(g, labs[i], w / 2, hh - 76, `800 ${labs[i].length > 12 ? 40 : 50}px "Inter Tight"`, PAL.ink);});
    decal(G, 0.54, fh, t, 0, h / 2, 0.332); return G;});
  // 5 Wehrdienst: a soldier with helmet and backpack
  person(P[0], 0, 0, {y: hs[0], body: 0x7d8a55, leg: 0x5a6340, helmet: 0x6b7848, pack: 0x5a6340, ry: 0.25, s: 1.05});
  // 4 Agrardiesel: a tractor with a puff of smoke
  {const T = grp(P[1], 0.02, hs[1], 0.02, 0.55); const gm = clay(0x58b48c);
    add(T, rbox(0.42, 0.1, 0.18, 0.03), gm, 0.02, 0.12, 0); add(T, rbox(0.2, 0.12, 0.16, 0.04), gm, 0.12, 0.22, 0);
    add(T, rbox(0.18, 0.2, 0.2, 0.03), clay(0xcfe6f7, {roughness: 0.4, bumpScale: 0.5}), -0.08, 0.31, 0); add(T, rbox(0.23, 0.035, 0.24, 0.015), gm, -0.08, 0.425, 0);
    for (const sz of [-1, 1]) {add(T, new THREE.CylinderGeometry(0.11, 0.11, 0.07, 24).rotateX(PI / 2), clay(PAL.dark), -0.09, 0.11, sz * 0.135); add(T, new THREE.CylinderGeometry(0.05, 0.05, 0.075, 16).rotateX(PI / 2), clay(PAL.yellow), -0.09, 0.11, sz * 0.137);
      add(T, new THREE.CylinderGeometry(0.065, 0.065, 0.05, 20).rotateX(PI / 2), clay(PAL.dark), 0.15, 0.065, sz * 0.11); add(T, new THREE.CylinderGeometry(0.03, 0.03, 0.055, 12).rotateX(PI / 2), clay(PAL.yellow), 0.15, 0.065, sz * 0.112);}
    add(T, new THREE.CylinderGeometry(0.013, 0.013, 0.15, 10), clay(PAL.dark), 0.17, 0.34, -0.05);
    [[0.18, 0.46, 0.04], [0.15, 0.55, 0.055], [0.1, 0.66, 0.07]].forEach(([x, y, r]) => add(T, new THREE.SphereGeometry(r, 16, 12), clay(0xeceaf2, {bumpScale: 1}), x, y, -0.05));}
  // 3 Heizungsgesetz: a heat pump
  {const Hp = grp(P[2], 0, hs[2], 0.02, 0.3);
    for (const sx of [-1, 1]) add(Hp, rbox(0.08, 0.04, 0.2, 0.015), clay(PAL.dark), sx * 0.15, 0.02, 0);
    add(Hp, rbox(0.48, 0.34, 0.22, 0.05), clay(PAL.white), 0, 0.21, 0);
    add(Hp, new THREE.CylinderGeometry(0.12, 0.12, 0.02, 32).rotateX(PI / 2), clay(0x5d5f7a), -0.08, 0.21, 0.11);
    for (const r of [0.12, 0.075]) add(Hp, new THREE.TorusGeometry(r, 0.01, 8, 32), clay(0xdedbe6), -0.08, 0.21, 0.122);
    for (let k = 0; k < 3; k++) {const b = add(Hp, rbox(0.1, 0.035, 0.01, 0.01), clay(0xdedbe6), -0.08, 0.21, 0.125); b.rotation.z = k * 2.09; b.geometry.translate(0.05, 0, 0);}
    for (let k = 0; k < 4; k++) add(Hp, rbox(0.12, 0.014, 0.01, 0.005), clay(0xc9c5d4), 0.15, 0.13 + k * 0.05, 0.111);}
  // 2 Corona-Regeln: a face mask leaning on a little stand
  {add(P[3], rbox(0.16, 0.13, 0.1, 0.03), clay(PAL.cream), 0, hs[3] + 0.065, -0.08);
    const Mk = grp(P[3], 0, hs[3] + 0.108, 0.03); Mk.rotation.set(-0.38, 0.2, 0);
    add(Mk, rbox(0.36, 0.21, 0.05, 0.045), clay(0x9cd7e8, {bumpScale: 1.4}), 0, 0, 0);
    for (const y of [-0.05, 0, 0.05]) add(Mk, rbox(0.33, 0.012, 0.016, 0.005), clay(0x82bfd4), 0, y, 0.027);
    for (const sx of [-1, 1]) {const l = add(Mk, new THREE.TorusGeometry(0.065, 0.009, 6, 22), clay(PAL.white), sx * 0.2, 0, -0.005); l.scale.x = 0.75;}}
  // 1 Hartz IV: a clipboard with a letter from the job centre
  {add(P[4], rbox(0.2, 0.15, 0.1, 0.03), clay(PAL.cream), 0, hs[4] + 0.075, -0.07);
    const Cb = grp(P[4], 0, hs[4] + 0.215, 0.05); Cb.rotation.set(-0.3, -0.12, 0);
    add(Cb, rbox(0.34, 0.44, 0.03, 0.02), clay(0xc49a64), 0, 0, 0);
    decal(Cb, 0.29, 0.37, tex(290, 370, (g, w, h) => {g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, w, h); T2(g, 'JOBCENTER', 22, 40, '800 30px "Inter Tight"', PAL.ink, 'left');
      T2(g, 'Bescheid', 22, 84, '600 24px Poppins', '#6a6a7a', 'left'); g.fillStyle = '#c9c5d4'; for (let k = 0; k < 7; k++) g.fillRect(22, 120 + k * 30, k % 3 === 2 ? 150 : 240, 9);
      g.strokeStyle = '#9a96aa'; g.lineWidth = 5; g.beginPath(); g.arc(215, 320, 32, 0, 7); g.stroke();}), 0, -0.01, 0.017);
    add(Cb, rbox(0.12, 0.05, 0.04, 0.015), clay(0xc9ccd6, {roughness: 0.5}), 0, 0.205, 0.02);}
  // das rote § über Podest 1 hat der Nutzer am 22.11.2026 entfernen lassen
  VIEW = {az: -0.28, el: 0.36, fov: 24};
};

MOTIFS.geldautomat = () => {   // the cash machine with a 100-euro note coming out of the slot
  plinth(2.7, 1.95, [[-1, -1], [1, -1], [1, 1]]);
  const A = grp(S, 0.25, 0, -0.18);
  add(A, rbox(1.1, 0.95, 0.72, 0.08), clay(PAL.sky), 0, 0.475, 0);
  add(A, rbox(1.1, 0.9, 0.5, 0.08), clay(PAL.lilac), 0, 1.4, -0.11);
  add(A, rbox(1.16, 0.22, 0.62, 0.07), clay(PAL.cream), 0, 1.93, -0.08);
  decal(A, 0.95, 0.14, tex(760, 112, (g, w, h) => T2(g, '€  GELDAUTOMAT', w / 2, h / 2 + 4, '800 66px "Inter Tight"', '#5b4a9a')), 0, 1.93, 0.232);
  add(A, rbox(0.74, 0.54, 0.06, 0.04), clay(PAL.dark), 0, 1.47, 0.15);
  decal(A, 0.64, 0.44, tex(640, 440, (g, w, h) => {g.fillStyle = '#dff0ff'; g.fillRect(0, 0, w, h); g.fillStyle = '#9cc8f2'; g.fillRect(0, 0, w, 78);
    T2(g, 'Betrag wählen', w / 2, 42, '800 44px "Inter Tight"', '#2b3a6a');
    [['50 €', 40, 120], ['100 €', 340, 120], ['200 €', 40, 270], ['500 €', 340, 270]].forEach(([s, x, y], k) => {g.fillStyle = k === 1 ? '#7ee08f' : '#ffffff'; g.beginPath(); g.roundRect(x, y, 260, 110, 22); g.fill();
      T2(g, s, x + 130, y + 58, '800 52px "Inter Tight"', '#2b3a6a');});}), 0, 1.47, 0.183, {glow: 0.35, bump: 0.1, rough: 0.5});
  const L = grp(A, 0, 1.0, 0.25); L.rotation.x = 0.32;
  add(L, rbox(0.94, 0.06, 0.34, 0.03), clay(PAL.cream), 0, 0, 0);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) add(L, rbox(0.072, 0.03, 0.055, 0.012), clay(0xfffdf8), -0.3 + c * 0.09, 0.04, -0.105 + r * 0.07);
  [PAL.grass, PAL.yellow, PAL.pink].forEach((c, r) => add(L, rbox(0.11, 0.03, 0.055, 0.012), clay(c), -0.0, 0.04, -0.105 + r * 0.07));
  add(L, rbox(0.22, 0.05, 0.12, 0.02), clay(PAL.dark), 0.27, 0.04, -0.02); add(L, rbox(0.16, 0.012, 0.02, 0.004), clay(0x22222a), 0.27, 0.066, -0.02);
  add(L, new THREE.SphereGeometry(0.018, 12, 10), redClay(), 0.27, 0.07, 0.07);
  add(A, rbox(0.6, 0.09, 0.07, 0.03), clay(PAL.dark), 0, 0.72, 0.36);
  const note = grp(A, 0, 0.73, 0.43); note.rotation.x = 0.12;
  add(note, rbox(0.46, 0.012, 0.28, 0.004), clay(0x9fd8b0, {bumpScale: 0.8}), 0, 0, 0.0);
  decal(note, 0.44, 0.26, tex(440, 260, (g, w, h) => {g.fillStyle = '#a9dfba'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5fa27a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#c9ecd4'; g.beginPath(); g.arc(300, 130, 70, 0, 7); g.fill(); T2(g, '100', 40, 80, '800 80px "Inter Tight"', '#2f6a4a', 'left'); T2(g, 'EURO', 40, 200, '800 40px "Inter Tight"', '#2f6a4a', 'left');}), 0, 0.007, 0, {rx: -PI / 2});
  add(A, rbox(1.14, 0.1, 0.76, 0.05), clay(PAL.purple), 0, 0.05, 0);
  person(S, -0.78, 0.42, {body: PAL.pink, hair: 0x8a5a3a, ry: 0.75, s: 2.3});
  VIEW = {az: -0.38, el: 0.3, fov: 24};
};

MOTIFS.strom = () => {   // wind turbine on a hill, a red cable runs over the ground to the plug in the socket
  plinth(3.3, 2.1, [[1, -1], [-1, 1]]);
  add(S, rbox(1.55, 0.024, 1.8, 0.01), clay(PAL.grass, {bumpScale: 3}), -0.8, 0.012, -0.02);
  const MX = -0.85, MZ = -0.3, MR = 0.55, MH = 0.36;
  const mound = add(S, new THREE.SphereGeometry(MR, 32, 16, 0, PI * 2, 0, PI / 2), clay(0x7fcf5a, {bumpScale: 3}), MX, 0.01, MZ); mound.scale.y = MH / MR;
  const surf = (x, z) => {const d = Math.hypot(x - MX, z - MZ); return d < MR ? 0.01 + MH * Math.sqrt(1 - (d / MR) ** 2) : 0.0;};
  const Tw = grp(S, MX, MH - 0.02, MZ);
  const wm = clay(PAL.white);
  add(Tw, new THREE.CylinderGeometry(0.045, 0.085, 2.0, 24), wm, 0, 1.0, 0);
  add(Tw, rbox(0.18, 0.17, 0.38, 0.06), wm, 0, 2.06, -0.05);
  add(Tw, new THREE.SphereGeometry(0.03, 12, 10), redClay(), 0, 2.16, -0.17);
  const hub = grp(Tw, 0, 2.06, 0.17); add(hub, new THREE.SphereGeometry(0.075, 20, 16), wm, 0, 0, 0); add(hub, new THREE.ConeGeometry(0.06, 0.1, 20).rotateX(PI / 2), wm, 0, 0, 0.08);
  for (let k = 0; k < 3; k++) {const a = PI / 2 + 0.3 + k * 2 * PI / 3, B = grp(hub, 0, 0, 0.02); B.rotation.z = a - PI / 2;
    const bl = add(B, new THREE.CapsuleGeometry(0.045, 0.72, 6, 14), wm, 0, 0.45, 0); bl.scale.set(1, 1, 0.32);}
  add(Tw, rbox(0.06, 0.12, 0.02, 0.01), clay(PAL.lilac), 0, 0.12, 0.08);
  // socket on a little peach wall on the right, with the plug in it
  const So = grp(S, 0.95, 0, 0.05, -0.35);
  add(So, rbox(0.78, 0.9, 0.16, 0.06), clay(PAL.peach), 0, 0.45, 0);
  add(So, rbox(0.42, 0.42, 0.05, 0.08), clay(0xfaf6ee), 0, 0.47, 0.1);
  add(So, new THREE.CylinderGeometry(0.15, 0.15, 0.03, 32).rotateX(PI / 2), clay(0xe6e0d6), 0, 0.47, 0.125);
  add(So, new THREE.CylinderGeometry(0.11, 0.12, 0.16, 28).rotateX(PI / 2), clay(PAL.white), 0, 0.47, 0.215);
  for (let k = 0; k < 4; k++) add(So, new THREE.TorusGeometry(0.115, 0.008, 6, 24), clay(0xdedbe6), 0, 0.47, 0.17 + k * 0.03);
  add(So, new THREE.CylinderGeometry(0.045, 0.06, 0.08, 18).rotateX(PI / 2), clay(PAL.white), 0, 0.47, 0.33);
  So.updateMatrixWorld(true); const p0 = new THREE.Vector3(0, 0.47, 0.36).applyMatrix4(So.matrixWorld), p1 = new THREE.Vector3(0, 0.3, 0.52).applyMatrix4(So.matrixWorld);
  groundTube([[p0.x, p0.z, p0.y], [p1.x, p1.z, p1.y], [p1.x - 0.08, p1.z + 0.2], [0.25, 0.62], [-0.3, 0.52], [-0.65, 0.12], [MX + 0.02, MZ + 0.15]], surf, 0.028, redClay());
  house(S, 1.0, -0.6, PAL.sky, 0xe07f6a, 0.46, 0.4, -0.2); tree(S, 0.42, -0.62, 0.9); tree(S, -1.35, 0.55, 0.8);
  VIEW = {az: -0.3, el: 0.3, fov: 24};
};

MOTIFS.rundfunk = () => {   // the old TV without reception and the coins of the licence fee
  plinth(2.9, 1.95, [[-1, -1], [1, -1]]);
  const T = grp(S, -0.2, 0, -0.12, 0.14);
  for (const [x, z] of [[-0.5, 0.24], [0.5, 0.24], [-0.5, -0.24], [0.5, -0.24]]) {const l = add(T, new THREE.CylinderGeometry(0.022, 0.03, 0.28, 10), clay(PAL.deep), x, 0.13, z); l.rotation.z = Math.sign(x) * 0.12;}
  add(T, rbox(1.45, 1.02, 0.82, 0.17), clay(PAL.peach), 0, 0.77, 0);
  add(T, rbox(0.98, 0.78, 0.06, 0.1), clay(PAL.dark), -0.16, 0.77, 0.4);
  decal(T, 0.86, 0.66, tex(860, 660, (g, w, h) => {const bars = ['#f6f4f8', '#f7dd7c', '#9fe0c6', '#8fd18a', '#c4a8f0', '#f2a7c3', '#9cc8f2'];
    bars.forEach((c, k) => {g.fillStyle = c; g.fillRect(k * w / 7, 0, w / 7 + 1, h * 0.62);});
    g.fillStyle = '#3e3f5a'; g.fillRect(0, h * 0.62, w, h * 0.38);
    for (let i = 0; i < 9000; i++) {const v = Math.floor(R() * 255); g.fillStyle = `rgba(${v},${v},${v},0.22)`; g.fillRect(R() * w, R() * h, 3, 3);}
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.roundRect(w / 2 - 250, h * 0.74, 500, 92, 46); g.fill(); T2(g, 'KEIN EMPFANG', w / 2, h * 0.74 + 48, '800 54px "Inter Tight"', PAL.ink);}),
    -0.16, 0.77, 0.434, {glow: 0.25, bump: 0.1, rough: 0.45});
  add(T, rbox(0.26, 0.82, 0.04, 0.04), clay(PAL.apricot), 0.53, 0.77, 0.41);
  for (const y of [1.0, 0.8]) {add(T, new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24).rotateX(PI / 2), clay(PAL.deep), 0.53, y, 0.45); add(T, rbox(0.016, 0.07, 0.02, 0.006), clay(PAL.cream), 0.53, y + 0.02, 0.485);}
  for (let k = 0; k < 5; k++) add(T, rbox(0.17, 0.016, 0.012, 0.006), clay(0xb98a6e), 0.53, 0.44 + k * 0.045, 0.432);
  add(T, new THREE.SphereGeometry(0.025, 12, 10), redClay(), 0.53, 0.64, 0.435);
  add(T, new THREE.SphereGeometry(0.11, 20, 12, 0, PI * 2, 0, PI / 2), clay(PAL.deep), 0.1, 1.27, 0);
  for (const s of [-1, 1]) {const a = s * 0.45, rod = add(T, new THREE.CylinderGeometry(0.012, 0.012, 0.72, 8), clay(0xc9ccd6, {roughness: 0.5}), 0.1 - Math.sin(a) * 0.36, 1.33 + Math.cos(a) * 0.36, 0); rod.rotation.z = a;
    add(T, new THREE.SphereGeometry(0.028, 12, 10), clay(PAL.cream), 0.1 - Math.sin(a) * 0.73, 1.33 + Math.cos(a) * 0.73, 0);}
  coins(S, 0.95, 0.35, 7); coins(S, 1.1, 0.0, 4); coins(S, 0.78, 0.62, 2);
  {const c = add(S, coinGeo, [coinSideM, coinTopM, coinTopM], 0.55, CR + 0.002, 0.7); c.rotation.set(PI / 2, 0, 0.25);}
  VIEW = {az: -0.3, el: 0.3, fov: 24};
};

MOTIFS.merz = () => {   // the Reichstag with its glass dome, on the lawn a little poll chart whose last bar is red
  plinth(3.4, 2.35, [[-1, 1], [1, -1]]);
  add(S, rbox(3.0, 0.024, 0.78, 0.01), clay(PAL.grass, {bumpScale: 3}), 0, 0.012, 0.7);
  const B = grp(S, 0, 0, -0.38), stone = 0xf1ece2;
  const wt = (cols, rows) => tex(512, 256, (g, w, h) => {g.fillStyle = '#f1ece2'; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows; g.fillStyle = '#8a7cc0';
    for (let i = 0; i < cols; i++) for (let k = 0; k < rows; k++) {g.beginPath(); g.roundRect(i * cw + cw * 0.3, k * rh + rh * 0.22, cw * 0.4, rh * 0.56, [12, 12, 3, 3]); g.fill();}});
  const wmF = clay(0xffffff, {map: wt(12, 2)}), wmS = clay(0xffffff, {map: wt(7, 2)}), pm = clay(stone);
  add(B, rbox(2.15, 0.08, 1.22, 0.03), clay(0xe2d9c8), 0, 0.04, 0);
  add(B, rbox(2.0, 0.6, 1.1, 0.05), [wmS, wmS, pm, pm, wmF, wmF], 0, 0.38, 0);
  const tw = clay(0xffffff, {map: wt(2, 3)});
  for (const [x, z] of [[-0.92, -0.47], [0.92, -0.47], [-0.92, 0.47], [0.92, 0.47]]) {add(B, rbox(0.42, 0.8, 0.42, 0.05), [tw, tw, pm, pm, tw, tw], x, 0.48, z); add(B, rbox(0.46, 0.05, 0.46, 0.02), clay(0xfaf6ee), x, 0.905, z);
    const F = grp(B, x, 0.93, z); add(F, new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), clay(PAL.cream), 0, 0.17, 0);
    const fl = decal(F, 0.2, 0.12, tex(120, 72, (g, w, h) => {['#2b2b33', '#d8524c', '#f2c14e'].forEach((c, k) => {g.fillStyle = c; g.fillRect(0, k * h / 3, w, h / 3 + 1);});}), 0.1, 0.27, 0, {bump: 0.3}); fl.material.side = THREE.DoubleSide; fl.castShadow = true;}
  add(B, rbox(1.1, 0.08, 0.3, 0.03), clay(0xe2d9c8), 0, 0.04, 0.62);
  for (let i = 0; i < 6; i++) add(B, new THREE.CylinderGeometry(0.04, 0.045, 0.5, 16), clay(0xfaf6ee), -0.4 + i * 0.16, 0.33, 0.66);
  add(B, rbox(1.0, 0.09, 0.24, 0.03), clay(0xfaf6ee), 0, 0.625, 0.6);
  decal(B, 0.8, 0.05, tex(800, 50, (g, w, h) => T2(g, 'DEM DEUTSCHEN VOLKE', w / 2, h / 2 + 2, '800 38px "Inter Tight"', '#8a7f70')), 0, 0.625, 0.722);
  {const sh = new THREE.Shape(); sh.moveTo(-0.52, 0); sh.lineTo(0.52, 0); sh.lineTo(0, 0.2); sh.closePath();
    add(B, new THREE.ExtrudeGeometry(sh, {depth: 0.2, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2}), clay(0xfaf6ee), 0, 0.67, 0.5);}
  const D = grp(B, 0, 0.68, -0.05);
  add(D, rbox(0.95, 0.06, 0.95, 0.03), clay(0xe2d9c8), 0, 0.03, 0);
  add(D, new THREE.SphereGeometry(0.4, 40, 20, 0, PI * 2, 0, PI / 2), glass(0xd6ecff, 0.42), 0, 0.06, 0).castShadow = false;
  for (let k = 0; k < 8; k++) {const r = add(D, new THREE.TorusGeometry(0.4, 0.009, 6, 32, PI), clay(0xdfe3ee, {roughness: 0.5}), 0, 0.06, 0); r.rotation.y = k * PI / 8;}
  for (const f of [0.35, 0.65, 0.88]) {const r = add(D, new THREE.TorusGeometry(0.4 * Math.cos(f * PI / 2 * 0.95), 0.008, 6, 40), clay(0xdfe3ee, {roughness: 0.5}), 0, 0.06 + 0.4 * Math.sin(f * PI / 2 * 0.95), 0); r.rotation.x = PI / 2;}
  add(D, new THREE.CylinderGeometry(0.13, 0.02, 0.3, 20), clay(0xe8ecf4, {roughness: 0.35, metalness: 0.2}), 0, 0.22, 0);
  // poll chart on the lawn: approval sinks, the last bar is red
  const Ch = grp(S, 1.02, 0, 0.72, -0.45);
  add(Ch, rbox(0.74, 0.05, 0.28, 0.02), clay(PAL.cream), 0, 0.025, 0);
  [[0.5, PAL.sky], [0.4, PAL.lilac], [0.3, PAL.yellow], [0.17, RED]].forEach(([h, c], i) => add(Ch, rbox(0.13, h, 0.13, 0.03), c === RED ? redClay() : clay(c), -0.25 + i * 0.165, 0.05 + h / 2, 0));
  {const ar = new THREE.Shape(); ar.moveTo(0, 0); ar.lineTo(0.05, 0.05); ar.lineTo(0.02, 0.05); ar.lineTo(0.02, 0.17); ar.lineTo(-0.02, 0.17); ar.lineTo(-0.02, 0.05); ar.lineTo(-0.05, 0.05); ar.closePath();
    const a = add(Ch, new THREE.ExtrudeGeometry(ar, {depth: 0.03, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2}), redClay(), 0.245, 0.27, -0.015); a.scale.setScalar(1.1);}
  tree(S, -1.25, 0.72, 0.85); tree(S, -0.85, 0.86, 0.7); tree(S, 0.45, 0.88, 0.6);
  VIEW = {az: -0.3, el: 0.42, fov: 24};
};

MOTIFS.jahr2027 = () => {   // tear-off calendar on 1 January 2027, circled with the red pen; piggy bank, coins, Deutschlandticket
  plinth(2.9, 1.95, [[-1, -1], [1, -1]]);
  add(S, rbox(1.28, 0.08, 0.5, 0.04), clay(PAL.purple), -0.25, 0.04, -0.25);
  const K = grp(S, -0.25, 0.07, -0.25); K.rotation.x = -0.13;
  add(K, rbox(1.16, 1.5, 0.1, 0.06), clay(PAL.lilac), 0, 0.75, -0.07);
  add(K, rbox(1.0, 1.2, 0.12, 0.025), clay(0xfbf7ef, {bumpScale: 1}), 0, 0.64, 0.04);
  decal(K, 0.96, 1.16, tex(480, 580, (g, w, h) => {g.fillStyle = '#9cc8f2'; g.fillRect(0, 0, w, 120); T2(g, 'JANUAR 2027', w / 2, 64, '800 52px "Inter Tight"', '#ffffff');
    T2(g, '1', w / 2, 310, '800 260px "Inter Tight"', PAL.ink);
    g.strokeStyle = '#E01E2B'; g.lineWidth = 13; g.lineCap = 'round'; g.beginPath(); for (let a = 0; a <= 7.1; a += 0.05) {const r = 150 + a * 3, x = w / 2 + Math.cos(a - 1.2) * r * 0.82, y = 305 + Math.sin(a - 1.2) * r; a ? g.lineTo(x, y) : g.moveTo(x, y);} g.stroke();
    T2(g, 'Freitag · Neujahr', w / 2, 520, '600 34px Poppins', '#6a6a7a');}), 0, 0.64, 0.101);
  add(K, rbox(1.1, 0.17, 0.24, 0.07), clay(PAL.deep), 0, 1.3, 0.02);
  for (const x of [-0.3, 0.3]) {const r = add(K, new THREE.TorusGeometry(0.05, 0.012, 8, 20), clay(0xc9ccd6, {roughness: 0.4}), x, 1.25, 0.14); r.rotation.y = PI / 2;}
  // the red felt pen lying in front
  {const P = grp(S, 0.28, 0.048, 0.56, 0.45); const pr = redClay();
    add(P, new THREE.CylinderGeometry(0.046, 0.046, 0.46, 20).rotateZ(PI / 2), pr, 0, 0, 0);
    add(P, new THREE.CylinderGeometry(0.05, 0.05, 0.17, 20).rotateZ(PI / 2), clay(0xb81624, {bumpScale: 1}), -0.29, 0.002, 0);
    add(P, rbox(0.14, 0.014, 0.02, 0.006), clay(0xb81624), -0.27, 0.05, 0);
    add(P, new THREE.CylinderGeometry(0.03, 0.046, 0.06, 18).rotateZ(-PI / 2), clay(PAL.cream), 0.26, 0, 0); add(P, new THREE.ConeGeometry(0.02, 0.05, 14).rotateZ(-PI / 2), pr, 0.31, 0, 0);}
  // piggy bank
  {const Pg = grp(S, 0.92, 0, -0.02, -0.65), pk = clay(PAL.pink);
    const b = add(Pg, new THREE.SphereGeometry(0.27, 28, 20), pk, 0, 0.34, 0); b.scale.set(1.28, 1, 1);
    add(Pg, new THREE.CylinderGeometry(0.09, 0.095, 0.08, 22).rotateZ(PI / 2), pk, 0.36, 0.32, 0);
    for (const s of [-1, 1]) {add(Pg, new THREE.SphereGeometry(0.016, 8, 6), clay(0xc9708f), 0.401, 0.33, s * 0.03); add(Pg, new THREE.SphereGeometry(0.018, 8, 6), clay(0x22222a, {bumpScale: 0}), 0.27, 0.43, s * 0.11);
      const e = add(Pg, new THREE.ConeGeometry(0.06, 0.09, 4), pk, 0.15, 0.6, s * 0.12); e.rotation.set(s * 0.3, 0, -0.35);}
    for (const [x, z] of [[-0.18, -0.13], [-0.18, 0.13], [0.16, -0.13], [0.16, 0.13]]) add(Pg, new THREE.CylinderGeometry(0.055, 0.05, 0.12, 14), pk, x, 0.06, z);
    add(Pg, rbox(0.14, 0.012, 0.03, 0.006), clay(0x9a4f6a), -0.02, 0.612, 0);
    const tl = add(Pg, new THREE.TorusGeometry(0.035, 0.012, 8, 16, PI * 1.5), pk, -0.36, 0.38, 0); tl.rotation.y = PI / 2;}
  coins(S, 0.75, 0.42, 5); coins(S, 0.98, 0.62, 3); coins(S, 1.15, 0.5, 2);
  {const C = grp(S, -0.95, 0.008, 0.58, 0.35); add(C, rbox(0.4, 0.014, 0.26, 0.02), clay(0x7f6fe0), 0, 0, 0);
    decal(C, 0.38, 0.24, tex(380, 240, (g, w, h) => {g.fillStyle = '#7f6fe0'; g.fillRect(0, 0, w, h); T2(g, 'Deutschland', 24, 50, '800 40px "Inter Tight"', '#fff', 'left'); T2(g, 'ticket', 24, 96, '800 40px "Inter Tight"', '#fff', 'left');
      g.fillStyle = '#fff'; g.fillRect(250, 130, 96, 96); g.fillStyle = '#2b2b38'; for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) if (R() < 0.5) g.fillRect(258 + i * 14, 138 + k * 14, 12, 12);}), 0, 0.008, 0, {rx: -PI / 2});}
  VIEW = {az: -0.3, el: 0.36, fov: 24};
};

function bank(par, x, z, label = 'B A N K') {const B = grp(par, x, 0, z);
  add(B, rbox(1.9, 0.07, 1.12, 0.03), clay(0xe2d9c8), 0, 0.035, 0); add(B, rbox(1.78, 0.07, 1.0, 0.03), clay(0xece5d8), 0, 0.105, 0);
  add(B, rbox(1.6, 0.95, 0.72, 0.05), clay(0xf1ece2), 0, 0.615, -0.08);
  add(B, rbox(0.3, 0.46, 0.04, 0.03), clay(PAL.deep), 0, 0.37, 0.29);
  for (const sx of [-1, 1]) add(B, rbox(0.24, 0.32, 0.03, 0.03), clay(0x8a7cc0), sx * 0.5, 0.6, 0.285);
  for (let i = 0; i < 6; i++) {const cx = -0.7 + i * 0.28; add(B, new THREE.CylinderGeometry(0.05, 0.056, 0.8, 18), clay(0xfaf6ee), cx, 0.54, 0.42); add(B, rbox(0.14, 0.04, 0.14, 0.012), clay(0xfaf6ee), cx, 0.95, 0.42);}
  add(B, rbox(1.72, 0.14, 0.34, 0.03), clay(0xfaf6ee), 0, 1.04, 0.33);
  if (label) decal(B, 0.7, 0.1, tex(560, 80, (g, w, h) => T2(g, label, w / 2, h / 2 + 3, '800 60px "Inter Tight"', '#8a7f70')), 0, 1.04, 0.502);
  add(B, rbox(1.64, 0.06, 0.78, 0.03), clay(0xe7dfd0), 0, 1.12, -0.08);
  const sh = new THREE.Shape(); sh.moveTo(-0.86, 0); sh.lineTo(0.86, 0); sh.lineTo(0, 0.34); sh.closePath();
  add(B, new THREE.ExtrudeGeometry(sh, {depth: 0.3, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2}), clay(0xfaf6ee), 0, 1.11, 0.18);
  return B;}
function atm(par, x, z, ry, txt) {const A = grp(par, x, 0, z, ry);
  add(A, rbox(0.42, 0.8, 0.34, 0.05), clay(PAL.lilac), 0, 0.4, 0); add(A, rbox(0.46, 0.1, 0.38, 0.04), clay(PAL.cream), 0, 0.85, 0);
  add(A, rbox(0.32, 0.22, 0.03, 0.02), clay(PAL.dark), 0, 0.6, 0.17);
  decal(A, 0.28, 0.18, tex(280, 180, (g, w, h) => {g.fillStyle = '#2a2c40'; g.fillRect(0, 0, w, h); T2(g, txt, w / 2, h / 2 + 4, '800 74px "Inter Tight"', '#ff4a55');}), 0, 0.6, 0.187, {glow: 0.6, bump: 0});
  add(A, rbox(0.3, 0.05, 0.12, 0.02), clay(PAL.cream), 0, 0.44, 0.2); add(A, rbox(0.2, 0.03, 0.03, 0.01), clay(PAL.dark), 0, 0.3, 0.17);
  return A;}

MOTIFS.bankrun1 = () => {   // everyone queues at the bank, the cash machine says LEER
  plinth(3.4, 2.35, [[-1, -1], [1, 1]]);
  bank(S, -0.3, -0.5); atm(S, 1.0, -0.35, -0.25, 'LEER');
  const Qp = [[-0.3, 0.15], [-0.52, 0.32], [-0.78, 0.42], [-1.05, 0.48], [-1.3, 0.62], [-1.32, 0.9], [-1.05, 0.95], [-0.78, 0.98], [0.98, 0.12], [1.12, 0.42], [0.92, 0.66]];
  Qp.forEach(([x, z], i) => person(S, x, z, {ry: (i < 8 ? face(x, z, -0.3, 0.06) : face(x, z, 1.0, -0.35)) + (R() - 0.5) * 0.6, s: 0.95 + R() * 0.1}));
  tree(S, 0.4, 0.85, 0.7);
  VIEW = {az: -0.32, el: 0.4, fov: 24};
};

MOTIFS.bankrun2 = () => {   // the open vault is almost empty, the queue waits in front of it
  plinth(3.3, 2.25, [[1, -1], [1, 1]]);
  const V = grp(S, 0.2, 0, -0.45), steel = 0xb9b4d6;
  add(V, rbox(1.75, 1.4, 0.9, 0.1), clay(steel), 0, 0.7, 0);
  add(V, rbox(1.85, 0.1, 1.0, 0.04), clay(PAL.purple), 0, 0.05, 0);
  add(V, new THREE.CylinderGeometry(0.47, 0.47, 0.03, 48).rotateX(PI / 2), clay(0x34304a, {bumpScale: 0.6}), 0, 0.72, 0.452);
  for (const y of [0.58, 0.86]) {add(V, rbox(0.74, 0.035, 0.16, 0.012), clay(PAL.cream), 0, y, 0.53);}
  coins(V, -0.15, 0.53, 1, 0.5975); coins(V, 0.2, 0.53, 2, 0.8775);
  add(V, new THREE.TorusGeometry(0.5, 0.045, 12, 48), clay(0xd9dce6, {roughness: 0.5}), 0, 0.72, 0.455);
  add(V, new THREE.SphereGeometry(0.06, 16, 12, 0, PI * 2, 0, PI / 2), redClay(), 0, 1.4, 0.3);
  const Dg = grp(V, 0.5, 0.72, 0.52); Dg.rotation.y = 1.95;
  const dm = clay(0xd9dce6, {roughness: 0.55, metalness: 0.15});
  add(Dg, new THREE.CylinderGeometry(0.47, 0.47, 0.14, 48).rotateX(PI / 2), dm, -0.48, 0, 0.07);
  add(Dg, new THREE.CylinderGeometry(0.3, 0.3, 0.03, 40).rotateX(PI / 2), clay(0xc5c9d6), -0.48, 0, -0.012);
  for (let k = 0; k < 8; k++) {const a = k * PI / 4, b = add(Dg, new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12), clay(0xeef0f5, {roughness: 0.4}), -0.48 + Math.cos(a) * 0.47, Math.sin(a) * 0.47, 0.07); b.rotation.z = a - PI / 2;}
  const wh = grp(Dg, -0.48, 0, 0.16); add(wh, new THREE.TorusGeometry(0.15, 0.02, 10, 32), clay(0xa9adbd), 0, 0, 0);
  for (let k = 0; k < 3; k++) {const s = add(wh, rbox(0.3, 0.025, 0.025, 0.01), clay(0xa9adbd), 0, 0, 0); s.rotation.z = k * PI / 3;}
  add(Dg, new THREE.CylinderGeometry(0.04, 0.04, 0.3, 12), clay(0xa9adbd), 0, 0, 0.0);
  const Qp = [[-0.35, 0.25], [-0.62, 0.38], [-0.9, 0.48], [-1.18, 0.58], [-1.36, 0.85], [-1.08, 0.92], [-0.8, 0.95], [-0.52, 0.98]];
  Qp.forEach(([x, z], i) => person(S, x, z, {ry: face(x, z, 0.2, 0.0) + (R() - 0.5) * 0.6, s: 0.95 + R() * 0.1}));
  VIEW = {az: -0.36, el: 0.36, fov: 24};
};

MOTIFS.genz = () => {   // Gen-Z-Protest: junge Knetfiguren mit Schildern und Handys vor dem Parlament, vorne das rote Megafon
  plinth(3.3, 2.35, [[-1, -1], [1, -1]]);
  const Gv = bank(S, 0, -0.62, 'PARLAMENT');
  add(Gv, new THREE.SphereGeometry(0.3, 32, 16, 0, PI * 2, 0, PI / 2), clay(0xe7dfd0), 0, 1.15, -0.1);
  add(Gv, new THREE.CylinderGeometry(0.06, 0.07, 0.08, 16), clay(0xfaf6ee), 0, 1.47, -0.1);
  {const F = grp(Gv, 0, 1.5, -0.1); add(F, new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), clay(PAL.cream), 0, 0.17, 0);
    const fl = decal(F, 0.22, 0.13, tex(120, 72, (g, w, h) => {['#2b2b33', '#d8524c', '#f2c14e'].forEach((c, k) => {g.fillStyle = c; g.fillRect(0, k * h / 3, w, h / 3 + 1);});}), 0.11, 0.27, 0, {bump: 0.3}); fl.material.side = THREE.DoubleSide; fl.castShadow = true;}
  const SIGNS = [['GEN Z', '#fbf8f1'], ['HÖRT UNS ZU', '#f7dd7c'], ['ZUKUNFT?', '#9fe0c6'], ['WIR SIND LAUT', '#f2a7c3'], ['#GENZ', '#9cc8f2']];
  const HAIR = [0x3b2a20, 0x8a5a3a, 0xd9a441, 0x2b2b33, 0x6b4a2a, 0x9a7fe0, 0x6fc3d0], SKIN = [0xf3c9a5, 0xe0a87e, 0xc08a62, 0x8f5f40, 0xf6d3b8];
  const sign = (G, sx, k) => {add(G, new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8), clay(0xa0704a), sx * 0.13, 0.66, 0);
    const [txt, bg] = SIGNS[k % SIGNS.length]; add(G, rbox(0.4, 0.22, 0.02, 0.012), clay(new THREE.Color(bg).getHex(), {bumpScale: 1}), sx * 0.13, 0.9, 0.012);
    decal(G, 0.38, 0.2, tex(380, 200, (g, w, h) => {g.fillStyle = bg; g.fillRect(0, 0, w, h); let fs = 70; g.font = `800 ${fs}px "Inter Tight"`; while (g.measureText(txt).width > w - 40) {fs -= 2; g.font = `800 ${fs}px "Inter Tight"`;} T2(g, txt, w / 2, h / 2 + 4, g.font, PAL.ink);}), sx * 0.13, 0.9, 0.0235, {bump: 0.3});};
  const phone = (G, sx) => {add(G, rbox(0.05, 0.09, 0.012, 0.008), clay(PAL.dark, {bumpScale: 0.3}), sx * 0.13, 0.57, 0.03);
    decal(G, 0.04, 0.075, tex(40, 75, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9cc8f2'); gr.addColorStop(1, '#c4a8f0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);}), sx * 0.13, 0.57, 0.0372, {glow: 0.5, bump: 0});};
  const CREW = [
    [-0.92, 0.05, 'sign', -1], [-0.45, 0.0, 'sign', 1], [0.02, 0.04, 'sign', 1], [0.62, 0.02, 'sign', 1],
    [-1.08, 0.42, 'phone', -1], [-0.55, 0.4, 'none', 0], [0.0, 0.38, 'phone', -1], [0.55, 0.42, 'phone', 1], [1.02, 0.4, 'sign', 1],
    [-0.8, 0.8, 'phone', 1], [-0.27, 0.82, 'mega', 1], [0.3, 0.8, 'none', 0], [0.82, 0.78, 'phone', -1]];
  let k = 0;
  CREW.forEach(([x, z, what, sx]) => {const G = person(S, x, z, {ry: (R() - 0.5) * 0.4, up: what === 'none' ? [] : [sx], s: 0.98 + R() * 0.08, hair: HAIR[Math.floor(R() * HAIR.length)], skin: SKIN[Math.floor(R() * SKIN.length)], pack: R() < 0.45 ? BODY[Math.floor(R() * BODY.length)] : undefined});
    if (what === 'sign') sign(G, sx, k++);
    if (what === 'phone') phone(G, sx);
    if (what === 'mega') {const Mg = grp(G, sx * 0.13, 0.53, 0.07); Mg.rotation.x = -0.35; const rm = redClay();
      add(Mg, new THREE.CylinderGeometry(0.075, 0.025, 0.18, 24, 1, true).rotateX(PI / 2), rm, 0, 0, 0.1).material.side = THREE.DoubleSide;
      add(Mg, new THREE.CylinderGeometry(0.028, 0.028, 0.06, 16).rotateX(PI / 2), rm, 0, 0, -0.01); add(Mg, rbox(0.025, 0.06, 0.03, 0.008), clay(PAL.dark), 0, -0.04, -0.01);}});
  tree(S, -1.35, -0.25, 0.8); tree(S, 1.35, -0.2, 0.75);
  VIEW = {az: -0.22, el: 0.32, fov: 24};
};

MOTIFS.blackfriday = () => {   // shop with awning and the big red sale sign, shoppers with bags
  plinth(2.9, 1.95, [[-1, -1], [1, -1]]);
  const A = grp(S, 0, 0, -0.35);
  add(A, rbox(1.7, 1.05, 0.6, 0.06), clay(PAL.peach), 0, 0.525, 0);
  decal(A, 1.0, 0.5, tex(760, 400, (g, w, h) => {g.fillStyle = '#cfe6f7'; g.fillRect(0, 0, w, h); [[90, 150, 160, 110, '#5b4a9a'], [300, 190, 120, 90, '#f7dd7c'], [470, 130, 200, 130, '#3e3f5a'], [60, 290, 140, 40, '#f2a7c3'], [320, 300, 160, 40, '#9fe0c6']].forEach(([x, y, ww, hh, c]) => {g.fillStyle = c; g.beginPath(); g.roundRect(x, y, ww, hh, 12); g.fill();});}), 0.25, 0.45, 0.302);
  add(A, rbox(0.3, 0.62, 0.03, 0.03), clay(PAL.deep), -0.55, 0.31, 0.3);
  {const aw = grp(A, 0, 0.84, 0.32); aw.rotation.x = 0.55; add(aw, rbox(1.7, 0.03, 0.34, 0.012), clay(0xffffff, {map: tex(512, 64, (g, w, h) => {for (let i = 0; i < 8; i++) {g.fillStyle = i % 2 ? '#f3ece0' : '#c4a8f0'; g.fillRect(i * w / 8, 0, w / 8 + 1, h);}})}), 0, 0, 0.17);}
  add(A, rbox(1.2, 0.24, 0.06, 0.04), clay(PAL.cream), 0, 1.2, 0.05); decal(A, 1.1, 0.2, tex(880, 160, (g, w, h) => T2(g, 'SALE  SALE', w / 2, h / 2 + 4, '800 120px "Inter Tight"', '#5b4a9a')), 0, 1.2, 0.082);
  const sg = grp(S, 0.66, 0, 0.5); add(sg, new THREE.CylinderGeometry(0.26, 0.3, 0.08, 32), clay(PAL.cream), 0, 0.04, 0);
  const t = text3d(sg, '-50%', 0.42, 0.12, redClay()); t.position.y = 0.08 + 0.21; t.rotation.y = -0.15;
  [[-0.95, 0.4, 0.5, PAL.sky, PAL.yellow], [-0.55, 0.6, 0.2, PAL.mint, PAL.lilac]].forEach(([x, z, ry, c, b]) => {const P = person(S, x, z, {body: c, ry, s: 1.15}); add(P, rbox(0.12, 0.14, 0.05, 0.015), clay(b), 0.13, 0.2, 0.02);});
  VIEW = {az: -0.3, el: 0.32, fov: 24};
};

MOTIFS.brutto = () => {   // the money tower on its cart: coloured slices for pension, health, care, unemployment, tax, the red net part at the bottom
  plinth(3.0, 2.0, [[-1, -1], [1, 1]]);
  const C = grp(S, -0.25, 0, 0.2);
  add(C, rbox(0.7, 0.06, 0.7, 0.025), clay(0xc49a64), 0, 0.1, 0);
  for (const [x, z] of [[-0.26, 0.29], [0.26, 0.29], [-0.26, -0.29], [0.26, -0.29]]) add(C, new THREE.CylinderGeometry(0.07, 0.07, 0.04, 20).rotateX(PI / 2), clay(PAL.dark), x, 0.07, z);
  const U = 0.5 / 1000; let y = 0.13; [[2054, RED], [293, 0xb9b4d6], [39, PAL.yellow], [72, PAL.pink], [262, PAL.mint], [279, PAL.sky]].forEach(([e, c]) => {const h = e * U;
    add(C, rbox(0.54, h, 0.54, Math.min(0.03, h / 2 - 0.001)), c === RED ? redClay() : clay(c), 0, y + h / 2, 0); y += h;});
  {const L = grp(C, 0, 0.62, 0.29); add(L, rbox(0.46, 0.2, 0.03, 0.02), redClay(), 0, 0, 0); decal(L, 0.44, 0.19, tex(440, 190, (g, w, h) => {T2(g, 'netto', w / 2, 52, '600 46px Poppins', '#ffffff'); T2(g, '2.054 €', w / 2, 128, '800 76px "Inter Tight"', '#ffffff');}), 0, 0, 0.016, {bump: 0.2});}
  {const L = grp(C, 0, y + 0.16, 0); add(L, rbox(0.56, 0.18, 0.03, 0.02), clay(0xfbf8f1), 0, 0, 0); decal(L, 0.54, 0.17, tex(540, 170, (g, w, h) => T2(g, '3.000 €', w / 2, h / 2 + 4, '800 110px "Inter Tight"', '#2b2b38')), 0, 0, 0.016, {bump: 0.2});}
  [[0.55, PAL.sky, 0x6f9fd8], [1.05, PAL.mint, 0x58b48c], [0.85, 0xb9b4d6, 0x7a72a8]].forEach(([x, c, r], i) => house(S, x, -0.5 + (i === 2 ? 0.0 : 0) - (i === 1 ? 0.05 : 0), c, r, 0.42, 0.42, -0.1));
  const fl = add(S, rbox(0.4, 0.1, 0.4, 0.03), clay(PAL.lilac), 0.35, 1.35, -0.05); fl.rotation.set(0.3, 0.5, 0.2);
  person(S, 0.45, 0.5, {body: PAL.mint, ry: -0.5, s: 1.2});
  VIEW = {az: -0.3, el: 0.3, fov: 24};
};

MOTIFS.paket = () => {   // the parcel with the red tape, a smaller one and the delivery van
  plinth(3.3, 2.0, [[-1, -1], [1, 1]]);
  const P = grp(S, -0.55, 0, 0.05, 0.22), kraft = 0xdcae74;
  add(P, rbox(1.15, 0.72, 0.85, 0.05), clay(kraft), 0, 0.36, 0);
  add(P, rbox(0.22, 0.014, 0.87, 0.005), redClay(), 0, 0.721, 0);
  for (const s of [-1, 1]) add(P, rbox(0.22, 0.3, 0.014, 0.005), redClay(), 0, 0.57, s * 0.428);
  decal(P, 0.36, 0.24, tex(360, 240, (g, w, h) => {g.fillStyle = '#fbf8f1'; g.beginPath(); g.roundRect(0, 0, w, h, 14); g.fill(); g.fillStyle = '#c9c5d4';
    for (let k = 0; k < 3; k++) g.fillRect(24, 30 + k * 30, k ? 200 : 260, 12); g.fillStyle = '#2b2b38'; for (let i = 0; i < 40; i++) {const bw = 2 + Math.floor(R() * 5); g.fillRect(24 + i * 7.5, 140, bw, 70);}}), 0.34, 0.33, 0.427);
  decal(P, 0.18, 0.2, tex(180, 200, (g, w, h) => {g.strokeStyle = '#6a5a4a'; g.lineWidth = 12; g.lineCap = 'round'; for (const x of [55, 125]) {g.beginPath(); g.moveTo(x, 170); g.lineTo(x, 40); g.moveTo(x - 30, 70); g.lineTo(x, 34); g.lineTo(x + 30, 70); g.stroke();}}), -0.4, 0.42, 0.427);
  {const P2 = grp(S, 0.55, 0, 0.58, -0.15); add(P2, rbox(0.5, 0.38, 0.42, 0.04), clay(0xe8c08a), 0, 0.19, 0); add(P2, rbox(0.1, 0.012, 0.43, 0.004), clay(0xf3e3c8), 0, 0.381, 0);}
  {const Vn = grp(S, 1.0, 0, -0.32, -0.55), vm = clay(PAL.sky); Vn.scale.setScalar(0.85);
    add(Vn, rbox(0.82, 0.5, 0.46, 0.08), vm, -0.08, 0.34, 0); add(Vn, rbox(0.3, 0.3, 0.45, 0.07), vm, 0.45, 0.24, 0);
    add(Vn, rbox(0.03, 0.16, 0.36, 0.02), clay(0xdff0ff, {roughness: 0.3, bumpScale: 0}), 0.585, 0.32, 0); add(Vn, rbox(0.08, 0.15, 0.003, 0.002), clay(0xdff0ff, {roughness: 0.3, bumpScale: 0}), 0.44, 0.31, 0.226);
    decal(Vn, 0.3, 0.24, tex(300, 240, (g, w, h) => {g.fillStyle = '#dcae74'; g.beginPath(); g.roundRect(70, 50, 160, 140, 14); g.fill(); g.fillStyle = '#E01E2B'; g.fillRect(135, 50, 30, 140);}), -0.08, 0.36, 0.232);
    for (const [x, z] of [[-0.3, 0.2], [0.38, 0.2], [-0.3, -0.2], [0.38, -0.2]]) {add(Vn, new THREE.CylinderGeometry(0.085, 0.085, 0.06, 20).rotateX(PI / 2), clay(PAL.dark), x, 0.085, z); add(Vn, new THREE.CylinderGeometry(0.035, 0.035, 0.065, 12).rotateX(PI / 2), clay(PAL.cream), x, 0.085, z);}}
  VIEW = {az: -0.3, el: 0.36, fov: 24};
};

function discTex(bg, draw) {const t = tex(512, 512, (g, w, h) => {g.fillStyle = bg; g.fillRect(0, 0, w, h); draw(g, w, h);}); t.center.set(0.5, 0.5); t.rotation = PI / 2; return t;}
function disc(par, x, y, z, r, t, side, ry = 0) {const G = grp(par, x, 0, z, ry);
  add(G, rbox(r * 0.9, 0.07, 0.34, 0.03), clay(PAL.cream), 0, 0.035, 0); add(G, rbox(0.12, y - r * 0.6, 0.08, 0.03), clay(PAL.cream), 0, (y - r * 0.6) / 2 + 0.05, -0.06);
  const topM = new THREE.MeshStandardMaterial({map: t, roughness: 0.85, bumpMap: clayBump, bumpScale: 1});
  add(G, new THREE.CylinderGeometry(r, r, 0.1, 64).rotateX(PI / 2), [clay(side, {bumpScale: 1.4}), topM, clay(side)], 0, y, 0.02);
  return G;}

MOTIFS.tuev = () => {   // the TÜV sticker: year in the middle, the month at the top
  plinth(2.7, 1.9, [[-1, -1], [1, -1]]);
  const t = discTex('#e5303b', (g, w, h) => {g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2, w * 0.46, 0, 7); g.stroke();
    for (let m = 1; m <= 12; m++) {const a = -PI / 2 + m / 12 * PI * 2; g.save(); g.translate(w / 2 + Math.cos(a) * w * 0.37, h / 2 + Math.sin(a) * h * 0.37); g.rotate(a + PI / 2); T2(g, String(m), 0, 0, '800 50px "Inter Tight"', '#fff'); g.restore();}
    g.fillStyle = '#1d1b22'; g.beginPath(); g.moveTo(w / 2 - 22, 0); g.lineTo(w / 2 + 22, 0); g.lineTo(w / 2 + 9, h * 0.075); g.lineTo(w / 2 - 9, h * 0.075); g.closePath(); g.fill();
    T2(g, '26', w / 2, h / 2 + 8, '800 180px "Inter Tight"', '#1d1b22');});
  disc(S, 0.25, 0.8, -0.15, 0.66, t, 0xc71f2c, -0.18);
  {const Pl = grp(S, -0.55, 0, 0.45, 0.32); add(Pl, rbox(0.2, 0.1, 0.18, 0.03), clay(PAL.cream), 0, 0.05, -0.04);
    const pp = grp(Pl, 0, 0.125, 0); pp.rotation.x = -0.2; add(pp, rbox(1.06, 0.24, 0.035, 0.03), clay(0xfbfaf6), 0, 0, 0); decal(pp, 1.04, 0.232, plateTex('K', 'FN 26'), 0, 0, 0.019, {bump: 0.2});}
  car(S, -0.75, -0.35, PAL.sky, 0.5, 2.3);
  VIEW = {az: -0.28, el: 0.3, fov: 24};
};

MOTIFS.umwelt = () => {   // the green sticker in front, yellow and red behind, little cars on the ring road
  plinth(3.1, 2.05, []);
  const road = add(S, new THREE.TorusGeometry(0.8, 0.1, 10, 80), clay(PAL.street, {bumpScale: 1.4}), 0, 0.012, 0.02); road.rotation.x = PI / 2; road.scale.set(1.38, 1, 0.16 * 0 + 1); road.scale.z = 0.12;
  const grass = add(S, new THREE.CylinderGeometry(0.69, 0.69, 0.024, 64), clay(PAL.grass, {bumpScale: 3}), 0, 0.012, 0.02); grass.scale.x = 1.38;
  for (let k = 0; k < 28; k++) {const a = k / 28 * PI * 2; const d = add(S, rbox(0.06, 0.006, 0.015, 0.003), clay(0xf7f1e6), Math.cos(a) * 0.8 * 1.38, 0.028, 0.02 + Math.sin(a) * 0.8); d.rotation.y = -Math.atan2(Math.cos(a) * 0.8, -Math.sin(a) * 0.8 * 1.38);}
  const nt = (bg, n) => discTex(bg, (g, w, h) => {g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h / 2, w * 0.46, 0, 7); g.stroke();
    T2(g, n, w / 2, h * 0.38, '800 230px "Inter Tight"', '#1d1b22'); g.fillStyle = '#fbfaf6'; g.beginPath(); g.roundRect(w * 0.18, h * 0.62, w * 0.64, h * 0.17, 16); g.fill();
    T2(g, 'K · FN 4', w / 2, h * 0.71, '800 50px "Inter Tight"', '#2b2b38');});
  disc(S, -0.72, 0.52, -0.3, 0.34, nt('#f7d54a', '3'), 0xd9b43a, 0.35);
  disc(S, 0.74, 0.52, -0.3, 0.34, nt('#e5303b', '2'), 0xc71f2c, -0.35);
  disc(S, 0.0, 0.6, 0.1, 0.48, nt('#5fc46a', '4'), 0x46a352, -0.05);
  [[0.4, PAL.sky], [1.5, PAL.yellow], [2.6, PAL.pink], [3.6, PAL.mint], [4.7, PAL.lilac], [5.6, PAL.apricot]].forEach(([a, c]) => {const x = Math.cos(a) * 0.8 * 1.38, z = 0.02 + Math.sin(a) * 0.8;
    car(S, x, z, c, Math.atan2(-Math.cos(a) * 0.8, -Math.sin(a) * 0.8 * 1.38), 0.8);});
  VIEW = {az: -0.22, el: 0.42, fov: 24};
};

MOTIFS.autobahn = async () => {   // Germany as a clay plate, the A7 in red from Flensburg to Füssen, a big blue A7 sign
  const geo = await (await fetch('../vermoegen/germany.json')).json(), K = 0.72;
  const sh = new THREE.Shape(geo.outline.map(([x, z]) => new THREE.Vector2(x * K, -z * K)));
  const g = new THREE.ExtrudeGeometry(sh, {depth: 0.2, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 3}); g.rotateX(-PI / 2);
  const slab = add(S, g, [clay(PAL.grass, {bumpScale: 2.5}), clay(PAL.purple, {bumpScale: 1.4})], 0, -0.24, 0);
  const ll = (lon, lat) => [0.4014 * (lon - 10.45) * K, -0.64 * (lat - 51.15) * K];
  const flat = () => 0.0;
  const road = (pts, red) => {const m = red ? redClay() : clay(PAL.street, {bumpScale: 1}); const P = pts.map(([lon, lat]) => ll(lon, lat)); const tb = groundTube(P, flat, red ? 0.034 : 0.024, m, -0.012); tb.scale.y = 0.6; return tb;};
  road([[7.47, 51.51], [9.73, 52.37], [11.6, 52.2], [13.4, 52.52]]);                       // A2
  road([[13.4, 52.52], [12.37, 51.34], [11.08, 49.45], [11.58, 48.14]]);                   // A9
  road([[6.96, 50.94], [8.68, 50.11], [9.93, 49.79], [11.08, 49.45]]);                     // A3
  road([[6.96, 50.94], [7.47, 51.51], [8.8, 53.08], [10.0, 53.55]]);                       // A1
  road([[8.68, 50.11], [8.4, 49.01], [7.59, 47.75]]);                                       // A5
  road([[9.18, 48.78], [9.99, 48.4], [11.58, 48.14]]);                                      // A8
  road([[9.43, 54.78], [10.0, 53.55], [9.73, 52.37], [9.5, 51.31], [9.93, 49.79], [9.99, 48.4], [10.7, 47.57]], true);   // A7
  for (const [n, [x, z]] of Object.entries(geo.cities)) {const c = add(S, new THREE.CylinderGeometry(0.055, 0.055, 0.03, 20), clay(PAL.cream), x * K, 0.015, z * K);}
  for (const [lon, lat, ry] of [[9.6, 52.9, 1.3], [9.8, 50.6, 1.6], [10.1, 48.9, 1.4]]) {const [x, z] = ll(lon, lat); car(S, x + 0.06, z, [PAL.sky, PAL.yellow, PAL.mint][Math.floor(R() * 3)], ry, 0.45);}
  for (const [lon, lat] of [[8.0, 52.6], [12.0, 53.3], [7.5, 49.6], [12.6, 48.9], [10.9, 50.9], [13.6, 51.1], [8.6, 48.1]]) {const [x, z] = ll(lon, lat); tree(S, x, z, 0.6);}
  // the big sign in the north-east, so the red line stays visible
  {const [x, z] = ll(12.7, 52.1), Sg = grp(S, x, 0, z, -0.2);
    for (const sx of [-0.24, 0.24]) add(Sg, new THREE.CylinderGeometry(0.022, 0.022, 0.72, 10), clay(0xc9ccd6, {roughness: 0.5}), sx, 0.36, 0);
    add(Sg, rbox(0.86, 0.5, 0.06, 0.08), clay(0x4a7fe0, {bumpScale: 1}), 0, 0.88, 0.02);
    decal(Sg, 0.8, 0.44, tex(800, 440, (g, w, h) => {g.strokeStyle = '#ffffff'; g.lineWidth = 18; g.beginPath(); g.roundRect(26, 26, w - 52, h - 52, 60); g.stroke(); T2(g, 'A7', w / 2, h / 2 + 12, '800 270px "Inter Tight"', '#ffffff');}), 0, 0.88, 0.052, {bump: 0.2});}
  VIEW = {az: -0.18, el: 0.62, fov: 24};
};

MOTIFS.benzin = () => {   // the fuel pump and the litre column: the red part goes to the state
  plinth(2.9, 1.95, [[-1, -1], [1, -1]]);
  const Pm = grp(S, -0.5, 0, -0.15, 0.18);
  add(Pm, rbox(1.0, 0.1, 0.72, 0.04), clay(0xe2d9c8), 0, 0.05, 0);
  add(Pm, rbox(0.64, 0.52, 0.44, 0.07), clay(PAL.lilac), 0, 0.36, 0);
  add(Pm, rbox(0.62, 0.86, 0.42, 0.07), clay(PAL.cream), 0, 1.04, 0);
  add(Pm, rbox(0.7, 0.24, 0.48, 0.07), clay(PAL.lilac), 0, 1.58, 0);
  decal(Pm, 0.6, 0.15, tex(600, 150, (g, w, h) => T2(g, 'Super E10', w / 2, h / 2 + 4, '800 88px "Inter Tight"', '#ffffff')), 0, 1.58, 0.242);
  add(Pm, rbox(0.5, 0.46, 0.04, 0.03), clay(PAL.dark), 0, 1.08, 0.21);
  decal(Pm, 0.44, 0.4, tex(440, 400, (g, w, h) => {g.fillStyle = '#26283a'; g.fillRect(0, 0, w, h);
    [['EURO', '2,11', 80], ['LITER', '1,00', 200], ['€/L', '2,11', 320]].forEach(([a, b, y]) => {T2(g, a, 30, y, '600 34px Poppins', '#a9adc6', 'left'); T2(g, b, w - 30, y, '800 86px "Inter Tight"', '#7ee08f', 'right');});}), 0, 1.08, 0.232, {glow: 0.45, bump: 0});
  for (let k = 0; k < 3; k++) add(Pm, rbox(0.1, 0.06, 0.03, 0.015), clay(0xfffdf8), -0.13 + k * 0.13, 0.75, 0.215);
  add(Pm, rbox(0.09, 0.22, 0.15, 0.03), clay(PAL.dark), 0.355, 0.95, 0.02);
  const nz = grp(Pm, 0.42, 0.9, 0.06); add(nz, rbox(0.07, 0.2, 0.09, 0.025), clay(0x4a4c66), 0, 0, 0); const sp = add(nz, new THREE.CylinderGeometry(0.016, 0.016, 0.16, 10), clay(0xc9ccd6, {roughness: 0.4}), 0.02, 0.1, 0.06); sp.rotation.x = 0.9;
  Pm.updateMatrixWorld(true); const a0 = new THREE.Vector3(0.31, 0.5, 0.1).applyMatrix4(Pm.matrixWorld), a1 = new THREE.Vector3(0.43, 0.8, 0.06).applyMatrix4(Pm.matrixWorld);
  add(S, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a0, new THREE.Vector3(a0.x + 0.08, 0.17, a0.z + 0.1), new THREE.Vector3(a0.x + 0.16, 0.2, a0.z + 0.03), new THREE.Vector3(a1.x + 0.04, 0.5, a1.z), a1]), 60, 0.022, 8), clay(0x4a4c66));
  // litre column: glass with two clay layers
  const C = grp(S, 0.72, 0, 0.18);
  add(C, new THREE.CylinderGeometry(0.36, 0.38, 0.08, 40), clay(PAL.lilac), 0, 0.04, 0);
  add(C, new THREE.CylinderGeometry(0.29, 0.29, 0.55, 40), redClay(), 0, 0.08 + 0.275, 0);
  add(C, new THREE.CylinderGeometry(0.29, 0.29, 0.6, 40), clay(0xf5c451), 0, 0.08 + 0.55 + 0.3, 0);
  add(C, new THREE.CylinderGeometry(0.33, 0.33, 1.2, 40, 1, true), glass(0xe6f2ff, 0.3), 0, 0.68, 0).castShadow = false;
  add(C, new THREE.TorusGeometry(0.33, 0.02, 8, 40), clay(PAL.lilac), 0, 1.28, 0).rotation.x = PI / 2;
  const tg = grp(C, 0.22, 0, 0.5, -0.3); add(tg, new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), clay(PAL.cream), 0, 0.15, 0);
  add(tg, rbox(0.5, 0.24, 0.03, 0.03), clay(0xfbf8f1), 0.1, 0.4, 0); decal(tg, 0.48, 0.22, tex(480, 220, (g, w, h) => {T2(g, '≈ 1 €', w / 2, 72, '800 84px "Inter Tight"', '#E01E2B'); T2(g, 'an den Staat', w / 2, 165, '600 50px Poppins', PAL.ink);}), 0.1, 0.4, 0.017);
  VIEW = {az: -0.3, el: 0.3, fov: 24};
};

MOTIFS.kennzeichen = () => {   // three plates, only Köln has a single letter (red K), the cathedral behind
  plinth(3.1, 2.05, [[1, 1], [-1, -1]]);
  {const D = grp(S, 0.88, 0, -0.2, -0.2), st = clay(0xbdb3a6, {bumpScale: 1.8});
    add(D, rbox(0.62, 0.55, 0.85, 0.04), st, 0, 0.275, -0.25);
    const sh = new THREE.Shape(); sh.moveTo(-0.33, 0); sh.lineTo(0.33, 0); sh.lineTo(0, 0.22); sh.closePath(); add(D, new THREE.ExtrudeGeometry(sh, {depth: 0.85, bevelEnabled: false}), clay(0x9a8f84), 0, 0.55, -0.675);
    for (const sx of [-1, 1]) {add(D, rbox(0.25, 1.1, 0.25, 0.03), st, sx * 0.17, 0.55, 0.22); add(D, new THREE.ConeGeometry(0.16, 0.62, 4).rotateY(PI / 4), st, sx * 0.17, 1.41, 0.22); add(D, new THREE.SphereGeometry(0.025, 10, 8), clay(PAL.cream), sx * 0.17, 1.73, 0.22);
      for (const y of [0.45, 0.8]) add(D, rbox(0.08, 0.2, 0.02, 0.03), clay(0x6b6488), sx * 0.17, y, 0.346);}
    add(D, rbox(0.12, 0.26, 0.02, 0.05), clay(0x6b6488), 0, 0.2, 0.18);}
  const plate = (x, z, s, city, rest, red, lift) => {const G = grp(S, x, 0, z, 0.18); G.scale.setScalar(s); const ph = 0.22 + lift;
    for (const sx of [-0.45, 0.45]) {add(G, new THREE.CylinderGeometry(0.02, 0.02, ph, 8), clay(0xc9ccd6, {roughness: 0.5}), sx, ph / 2, -0.03); add(G, rbox(0.14, 0.04, 0.14, 0.015), clay(PAL.cream), sx, 0.02, -0.03);}
    add(G, rbox(1.32, 0.3, 0.04, 0.035), clay(0xfbfaf6), 0, 0.37 + lift, 0); decal(G, 1.3, 0.29, plateTex(city, rest, red), 0, 0.37 + lift, 0.021, {bump: 0.2});};
  plate(-0.55, -0.5, 0.8, 'NEA', 'FN 7', false, 0.62); plate(-0.38, 0.02, 0.9, 'EU', 'FN 12', false, 0.31); plate(-0.12, 0.55, 1.0, 'K', 'FN 56', true, 0);
  car(S, 0.95, 0.6, PAL.sky, 0.35, 1.5);
  VIEW = {az: -0.3, el: 0.34, fov: 24};
};

MOTIFS.wasserscheide = () => {   // a ridge, a drop on the top, the red line is the divide; left to the North Sea, right to the Black Sea
  plinth(3.5, 2.3, []);
  const BX = 1.1, TX = 0.14, TY = 0.72, Z0 = -0.95, Z1 = 0.3;
  const sh = new THREE.Shape(); sh.moveTo(-BX, 0); sh.lineTo(-TX, TY); sh.quadraticCurveTo(0, TY + 0.07, TX, TY); sh.lineTo(BX, 0); sh.closePath();
  const rg = new THREE.ExtrudeGeometry(sh, {depth: Z1 - Z0, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2});
  add(S, rg, [clay(0x7fcf5a, {bumpScale: 3}), clay(0x6fbf5a, {bumpScale: 3})], 0, 0, Z0);
  const surf = (x, z) => {if (z < Z0 || z > Z1 + 0.02) return 0; const ax = Math.abs(x); if (ax > BX) return 0; if (ax < TX) return TY + 0.07 * (1 - (ax / TX) ** 2) * 0.5 + 0.02; return TY * (BX - ax) / (BX - TX) + 0.02;};
  for (let z = Z0 + 0.06; z < Z1 + 0.01; z += 0.12) add(S, rbox(0.05, 0.03, 0.075, 0.012), redClay(), 0, TY + 0.055, z);
  const blue = clay(0x6fb6f0, {roughness: 0.4, bumpScale: 0.6});
  groundTube([[-0.16, 0.05], [-0.45, 0.12], [-0.7, 0.0], [-0.95, 0.18], [-1.17, 0.24], [-1.25, 0.45], [-1.24, 0.62]], surf, 0.035, blue, -0.005);
  groundTube([[0.16, 0.05], [0.42, -0.06], [0.7, 0.12], [0.95, 0.08], [1.17, 0.24], [1.25, 0.45], [1.24, 0.62]], surf, 0.035, blue, -0.005);
  for (const sx of [-1, 1]) {const p = add(S, new THREE.CylinderGeometry(0.34, 0.34, 0.03, 40), blue, sx * 1.22, 0.015, 0.68); p.scale.x = 1.15;
    const Bt = grp(S, sx * 1.2, 0.03, 0.64, sx * 0.6); add(Bt, rbox(0.16, 0.04, 0.07, 0.02), clay(PAL.cream), 0, 0.02, 0); add(Bt, new THREE.CylinderGeometry(0.006, 0.006, 0.14, 6), clay(0xa0704a), 0, 0.1, 0);
    const sl = new THREE.Shape(); sl.moveTo(0, 0); sl.lineTo(0.07, 0); sl.lineTo(0, 0.11); sl.closePath(); add(Bt, new THREE.ExtrudeGeometry(sl, {depth: 0.006, bevelEnabled: false}), clay(0xfbfaf6), 0.006, 0.05, 0);
    const Sg = grp(S, sx * 0.6, 0, 0.9, -sx * 0.1); add(Sg, new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), clay(0xa0704a), 0, 0.15, 0);
    add(Sg, rbox(0.5, 0.12, 0.025, 0.02), clay(0xfbf8f1), 0, 0.3, 0); decal(Sg, 0.48, 0.11, tex(480, 110, (g, w, h) => T2(g, sx < 0 ? 'NORDSEE' : 'SCHWARZES MEER', w / 2, h / 2 + 3, `800 ${sx < 0 ? 64 : 50}px "Inter Tight"`, '#3b6fa8')), 0, 0.3, 0.014);}
  const Dr = grp(S, 0, TY + 0.36, -0.18); add(Dr, new THREE.SphereGeometry(0.15, 28, 20), clay(0x6fb6f0, {roughness: 0.35, bumpScale: 0.4}), 0, 0, 0); add(Dr, new THREE.ConeGeometry(0.143, 0.24, 28, 1, true), clay(0x6fb6f0, {roughness: 0.35, bumpScale: 0.4}), 0, 0.16, 0);
  add(Dr, new THREE.SphereGeometry(0.035, 12, 10), clay(0xeaf6ff, {roughness: 0.2, bumpScale: 0}), -0.06, 0.05, 0.12).castShadow = false;
  for (const [x, z, s] of [[-0.55, -0.7, 0.7], [-0.8, -0.35, 0.6], [0.62, -0.75, 0.7], [0.82, -0.3, 0.6], [-0.35, -0.85, 0.55], [0.4, 0.2, 0.55]]) tree(S, x, z, s, surf(x, z) - 0.03);
  VIEW = {az: -0.12, el: 0.42, fov: 24};
};

MOTIFS.weihnachtsgeld = () => {   // verschneiter Tannenbaum mit Lichterkette, roter Umschlag „Weihnachtsgeld“, die Karte zeigt rot 1.684 €, daneben der Geldturm mit dem roten Netto-Teil
  plinth(3.0, 1.95, [[-1, -1], [1, 1]]);
  const snow = clay(0xf7f9ff, {bumpScale: 1.2, roughness: 0.8});
  const T = grp(S, -0.75, 0, -0.35); add(T, new THREE.CylinderGeometry(0.07, 0.08, 0.2, 12), clay(0xa0704a), 0, 0.1, 0);
  [[0.58, 0.6, 0.48], [0.46, 0.54, 0.88], [0.33, 0.46, 1.23]].forEach(([r, h, y], i) => {add(T, new THREE.ConeGeometry(r, h, 28), clay(PAL.tree[i % 3]), 0, y, 0); add(T, new THREE.ConeGeometry(r * 0.42, h * 0.42, 28), snow, 0, y + h * 0.29 + 0.004, 0);});
  add(T, new THREE.IcosahedronGeometry(0.09, 1), clay(PAL.yellow, {emissive: PAL.yellow, emissiveIntensity: 0.3}), 0, 1.53, 0);
  for (let i = 0; i < 30; i++) {const u = i / 29, y = 0.28 + u * 1.12, r = 0.6 - u * 0.48, a = u * PI * 7.5 + 0.6, c = [0xfff1c4, 0xffd27a, 0xbfe3ff][i % 3];
    add(T, new THREE.SphereGeometry(0.026, 10, 8), new THREE.MeshStandardMaterial({color: c, emissive: c, emissiveIntensity: 0.9}), Math.sin(a) * r, y, Math.cos(a) * r);}
  const E = grp(S, -0.15, 0, 0.35, -0.2); add(E, rbox(0.8, 0.52, 0.07, 0.035), redClay(), 0, 0.26, 0);
  decal(E, 0.72, 0.15, tex(720, 150, (g, w, h) => T2(g, 'Weihnachtsgeld', w / 2, h / 2 + 4, '800 96px "Inter Tight"', '#ffffff')), 0, 0.16, 0.037, {bump: 0.2});
  {const C = grp(E, 0, 0.74, 0); add(C, rbox(0.66, 0.32, 0.025, 0.012), clay(0xfbf8f1, {bumpScale: 1}), 0, 0, 0); decal(C, 0.64, 0.3, tex(640, 300, (g, w, h) => T2(g, '1.684 €', w / 2, h / 2 + 6, '800 150px "Inter Tight"', '#E01E2B')), 0, 0, 0.014, {bump: 0.15});}
  const W = grp(S, 0.95, 0, -0.05); add(W, rbox(0.62, 0.06, 0.62, 0.025), clay(0xc49a64), 0, 0.1, 0);
  for (const [x, z] of [[-0.24, 0.26], [0.24, 0.26], [-0.24, -0.26], [0.24, -0.26]]) add(W, new THREE.CylinderGeometry(0.06, 0.06, 0.04, 20).rotateX(PI / 2), clay(PAL.dark), x, 0.065, z);
  {const U = 0.5 / 1000; let y = 0.13; [[1683.5, RED], [664, 0xb9b4d6], [652.5, PAL.mint]].forEach(([e, c]) => {const h = e * U; add(W, rbox(0.48, h, 0.48, 0.03), c === RED ? redClay() : clay(c), 0, y + h / 2, 0); y += h;});}
  const P = person(S, 0.4, 0.55, {body: PAL.sky, ry: -0.4, s: 1.2, up: [-1, 1]});
  for (const [x, z, r] of [[-1.3, 0.75, 0.12], [1.32, -0.75, 0.11], [0.2, -0.8, 0.09], [-1.25, -0.2, 0.08]]) {const b = add(S, new THREE.SphereGeometry(r, 18, 12), snow, x, 0.0, z); b.scale.y = 0.45;}
  VIEW = {az: -0.25, el: 0.3, fov: 24};
};

MOTIFS.karten = () => {   // Kartenspiel (überarbeitet 27.11.2026): 11 verschiedene Karten (ohne 6 und 9, die man gedreht verwechseln könnte) fächern sich aus ihrer Schachtel auf, der rote Faden läuft über allen Eckzeichen entlang („die eine Reihenfolge“), daneben eine staunende Figur
  plinth(2.7, 1.75, [[-1, -1], [-1, 1]]);
  const RK = ['A', '7', 'K', '3', '10', 'D', '5', 'B', '2', '8', '4'], SU = ['♠', '♥', '♣', '♦'];
  const cardT = (r, su) => tex(420, 600, (g, w, h) => {const col = (su === '♥' || su === '♦') ? '#e0607e' : '#2b2b38', fr = r === '10' ? 64 : 80;
    g.fillStyle = '#fffdf8'; g.beginPath(); g.roundRect(0, 0, w, h, 34); g.fill(); g.strokeStyle = '#eadfcc'; g.lineWidth = 7; g.beginPath(); g.roundRect(12, 12, w - 24, h - 24, 26); g.stroke();
    T2(g, r, 62, 94, `800 ${fr}px "Inter Tight"`, col); T2(g, su, 62, 166, '700 56px "Inter Tight"', col);
    g.save(); g.translate(w - 62, h - 94); g.rotate(PI); T2(g, r, 0, 0, `800 ${fr}px "Inter Tight"`, col); T2(g, su, 0, -72, '700 56px "Inter Tight"', col); g.restore();});
  const FX = -0.2, FZ = -0.05, FS = 1.55, N = 11, CWd = 0.42, CHt = 0.6, PIV = 0.2, OFF = 0.36, pts = [], F = grp(S, FX, 0, FZ);
  // the card box the fan comes out of: front label „52 Karten“, open lid leaning back
  add(F, rbox(0.6, 0.34, 0.36, 0.045), clay(PAL.deep), 0, 0.17, 0);
  add(F, rbox(0.6, 0.012, 0.17, 0.005), clay(PAL.deep), 0, 0.42, -0.24).rotation.x = -0.55;
  decal(F, 0.5, 0.24, tex(500, 240, (g, w, h) => {g.fillStyle = '#f3ece0'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 26); g.fill();
    T2(g, '52 Karten', w / 2, 92, '800 78px "Inter Tight"', '#5b4a9a'); ['♠', '♥', '♣', '♦'].forEach((c, i) => T2(g, c, w / 2 + (i - 1.5) * 62, 178, '700 50px "Inter Tight"', (c === '♥' || c === '♦') ? '#e0607e' : '#2b2b38'));}), 0, 0.17, 0.182, {bump: 0.12});
  for (let k = 0; k < N; k++) {const a = (66 - k * 132 / (N - 1)) * PI / 180, z = -0.1 + k * 0.014, C = grp(F, 0, PIV, z); C.rotation.z = a;
    add(C, rbox(CWd, CHt, 0.01, 0.004), clay(0xfffdf8, {bumpScale: 0.6}), 0, OFF, 0);
    decal(C, CWd, CHt, cardT(RK[k], SU[k % 4]), 0, OFF, 0.0062, {bump: 0.1, glow: 0.12});
    const c = new THREE.Vector3(-0.148, OFF + 0.272, 0.022).applyAxisAngle(new THREE.Vector3(0, 0, 1), a); pts.push(new THREE.Vector3(c.x * FS + FX, (c.y + PIV) * FS, (c.z + z) * FS + FZ));}
  F.scale.setScalar(FS);
  {const m = redClay(); add(S, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 200, 0.0105, 10, false), m);
    pts.forEach(p => add(S, new THREE.SphereGeometry(0.0135, 12, 10), m, p.x, p.y, p.z));}
  person(S, 1.0, 0.3, {body: PAL.sky, hair: 0x8a5a3a, ry: -0.75, s: 1.3, up: [1]});
  VIEW = {az: 0.08, el: 0.22, fov: 24};
};

// ------------------------------------------------------------------ Foto-Beiträge (Slides, 22.11.2026): Hauptmotive, kleine Symbole und Deko
const extr = (shape, d = 0.08) => {const g = new THREE.ExtrudeGeometry(shape, {depth: d, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 16}); g.center(); return g;};
const tubeM = (pts, r, m) => add(S, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 80, r, 14, false), m);
function battery(par, x, z, s = 1, fill = 4) {const B = grp(par, x, 0, z); B.scale.setScalar(s);
  add(B, rbox(0.5, 0.06, 0.5, 0.025), clay(PAL.dark), 0, 0.03, 0);
  for (let i = 0; i < 5; i++) add(B, rbox(0.46, 0.17, 0.46, 0.04), i < fill ? clay(PAL.mint) : glass(0xe8f4ff, 0.35), 0, 0.06 + 0.09 + i * 0.185, 0);
  add(B, rbox(0.5, 0.05, 0.5, 0.025), clay(PAL.dark), 0, 0.06 + 5 * 0.185 + 0.01, 0); add(B, rbox(0.2, 0.08, 0.2, 0.03), clay(PAL.dark), 0, 0.06 + 5 * 0.185 + 0.07, 0); return B;}
function phone(par, x, y, z, s, screen) {const P = grp(par, x, y, z); P.scale.setScalar(s); add(P, rbox(0.62, 1.2, 0.08, 0.1), clay(PAL.dark), 0, 0, 0);
  decal(P, 0.54, 1.08, tex(540, 1080, screen), 0, 0, 0.042, {bump: 0.15, glow: 0.25}); return P;}
function clock(par, x, z, s, col, face) {const C = grp(par, x, 0, z); C.scale.setScalar(s); const m = clay(col);
  const body = add(C, new THREE.CylinderGeometry(0.32, 0.32, 0.18, 40).rotateX(PI / 2), m, 0, 0.42, 0);
  decal(C, 0.5, 0.5, tex(400, 400, (g, w, h) => {g.fillStyle = '#fbf8f1'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill(); face(g, w, h);}), 0, 0.42, 0.092, {bump: 0.15});
  for (const sx of [-1, 1]) {add(C, new THREE.SphereGeometry(0.1, 20, 12, 0, PI * 2, 0, PI / 2), m, sx * 0.2, 0.7, 0).rotation.z = -sx * 0.5; add(C, new THREE.CylinderGeometry(0.025, 0.03, 0.16, 10), clay(PAL.dark), sx * 0.2, 0.12, 0).rotation.z = sx * 0.4;}
  return C;}
function cup(par, x, z, s, col) {const C = grp(par, x, 0, z); C.scale.setScalar(s); add(C, new THREE.CylinderGeometry(0.2, 0.16, 0.36, 32), clay(col), 0, 0.18, 0);
  add(C, new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32), clay(0x6b4a2a, {bumpScale: 0.5}), 0, 0.35, 0); const h = add(C, new THREE.TorusGeometry(0.09, 0.03, 12, 24), clay(col), 0.21, 0.19, 0); h.rotation.y = 0;
  add(C, new THREE.CylinderGeometry(0.28, 0.28, 0.03, 32), clay(PAL.cream), 0, 0.015, 0); return C;}
function loaf(par, x, y, z, s, ry = 0) {const L = grp(par, x, y, z, ry); L.scale.setScalar(s); const b = add(L, new THREE.SphereGeometry(0.5, 40, 24), clay(0xd99a55), 0, 0, 0); b.scale.set(1, 0.55, 0.6);
  for (let i = 0; i < 3; i++) {const c = add(L, new THREE.SphereGeometry(0.1, 16, 10), clay(0xf0cf95), -0.22 + i * 0.22, 0.255, 0); c.scale.set(0.35, 0.18, 1.5); c.rotation.y = 0.5;} return L;}
function slice(par, x, y, z, s, rx = 0) {const L = grp(par, x, y, z); L.scale.setScalar(s); L.rotation.x = rx; const sh = new THREE.Shape(); sh.moveTo(-0.22, -0.2); sh.lineTo(0.22, -0.2); sh.lineTo(0.24, 0.05);
  sh.absarc(0, 0.08, 0.24, 0, PI, false); sh.lineTo(-0.22, -0.2); add(L, extr(sh, 0.04), [clay(0xf3dfb4), clay(0xb87a3c)], 0, 0, 0); return L;}
const star = (r1 = 0.3, r2 = 0.14) => {const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) {const a = PI / 2 + i * PI / 5, r = i % 2 ? r2 : r1; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);} return sh;};
const heart = () => {const sh = new THREE.Shape(); sh.moveTo(0, -0.28); sh.bezierCurveTo(-0.45, 0.0, -0.3, 0.32, 0, 0.14); sh.bezierCurveTo(0.3, 0.32, 0.45, 0.0, 0, -0.28); return sh;};

MOTIFS.slide_akku = () => {   // Handy auf dem Ständer zeigt 80 %, daneben ein großer Knete-Akku mit vier von fünf Feldern, rotes Ladekabel zum Stecker
  plinth(2.7, 1.8, [[-1, -1], [1, 1]]);
  add(S, rbox(0.5, 0.08, 0.36, 0.03), clay(PAL.lilac), -0.45, 0.04, 0.05); const st = add(S, rbox(0.42, 0.5, 0.06, 0.03), clay(PAL.lilac), -0.45, 0.3, -0.12); st.rotation.x = -0.3;
  const P = phone(S, -0.45, 0.68, 0.02, 0.95, (g, w, h) => {g.fillStyle = '#eef6ff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3e3f5a'; g.lineWidth = 16; g.beginPath(); g.roundRect(120, 300, 300, 520, 40); g.stroke();
    g.fillStyle = '#3e3f5a'; g.fillRect(220, 268, 100, 34); g.fillStyle = '#58b48c'; g.beginPath(); g.roundRect(142, 426, 256, 372, 22); g.fill(); T2(g, '80 %', w / 2, 950, '800 120px "Inter Tight"', '#2b2b38'); T2(g, '9:41', w / 2, 120, '600 60px Poppins', '#3e3f5a');});
  P.rotation.x = -0.3;
  battery(S, 0.55, -0.1, 1.15, 4);
  {const pl = grp(S, -1.05, 0, 0.55); add(pl, rbox(0.22, 0.16, 0.26, 0.05), clay(0xfbf8f1), 0, 0.08, 0); for (const sx of [-1, 1]) add(pl, new THREE.CylinderGeometry(0.018, 0.018, 0.1, 10).rotateX(PI / 2), clay(0xc9c3b8, {metalness: 0.4, roughness: 0.4}), sx * 0.05, 0.08, -0.17);}
  tubeM([[-0.45, 0.11, 0.24], [-0.5, 0.04, 0.45], [-0.75, 0.035, 0.62], [-1.05, 0.08, 0.66]], 0.028, redClay());
  VIEW = {az: -0.25, el: 0.28, fov: 24};
};
MOTIFS.slide_nap = () => {   // Knetfigur schläft auf dem Sofa unter einer Decke, Zzz darüber, roter Wecker auf 20 Minuten, Kaffeetasse
  plinth(2.7, 1.8, [[-1, -1], [1, 1]]);
  const So = grp(S, -0.15, 0, -0.1); add(So, rbox(1.6, 0.3, 0.7, 0.1), clay(PAL.sky), 0, 0.2, 0); add(So, rbox(1.6, 0.5, 0.2, 0.1), clay(PAL.sky), 0, 0.5, -0.27);
  for (const sx of [-1, 1]) add(So, rbox(0.2, 0.45, 0.7, 0.09), clay(PAL.sky), sx * 0.75, 0.3, 0); for (const sx of [-1, 1]) add(So, new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), clay(PAL.dark), sx * 0.7, 0.03, 0.28);
  const pil = add(So, rbox(0.34, 0.14, 0.42, 0.07), clay(0xfbf8f1), -0.52, 0.42, 0.02); pil.rotation.z = 0.25;
  const P = person(So, -0.02, 0.05, {body: PAL.mint, hair: 0x3b2a20, s: 1.15}); P.rotation.z = PI / 2; P.position.set(0.02, 0.45, 0.04);
  const bl = add(So, rbox(0.72, 0.2, 0.5, 0.08), clay(PAL.lilac), 0.02, 0.47, 0.04);
  const zz = clay(PAL.deep, {bumpScale: 1}); [[0.16, -0.35, 0.95], [0.12, -0.15, 1.18], [0.09, 0.02, 1.36]].forEach(([sz, x, y]) => {const t = text3d(So, 'Z', sz, 0.05, zz); t.position.set(x, y, 0.05); t.rotation.z = 0.15;});
  const tb = grp(S, 0.95, 0, 0.25); add(tb, new THREE.CylinderGeometry(0.28, 0.28, 0.05, 32), clay(0xc49a64), 0, 0.42, 0); add(tb, new THREE.CylinderGeometry(0.04, 0.05, 0.4, 12), clay(0xb08a5a), 0, 0.2, 0); add(tb, new THREE.CylinderGeometry(0.16, 0.18, 0.03, 24), clay(0xb08a5a), 0, 0.015, 0);
  const ck = clock(tb, -0.05, -0.05, 0.42, RED, (g, w, h) => {T2(g, '20', w / 2, h / 2 + 8, '800 150px "Inter Tight"', '#2b2b38'); T2(g, 'min', w / 2, h / 2 + 100, '600 44px Poppins', '#6a6a7a');}); ck.position.y = 0.44; ck.children.forEach(c => {if (c.material && c.material.color && c.material.color.getHex() === RED) c.material = redClay();});
  cup(tb, 0.13, 0.12, 0.32, PAL.yellow).position.y = 0.445;
  VIEW = {az: -0.25, el: 0.3, fov: 24};
};
MOTIFS.slide_brot = () => {   // Brotlaib und Scheiben auf dem Holzbrett, dahinter ein Kühlschrank mit rotem Verbotsschild, rechts der Tontopf
  plinth(2.7, 1.8, [[-1, -1], [1, 1]]);
  const F = grp(S, -0.75, 0, -0.35); add(F, rbox(0.75, 1.5, 0.6, 0.1), clay(0xf6f4f8), 0, 0.75, 0); add(F, rbox(0.71, 0.02, 0.02, 0.008), clay(0xd6d2dc), 0, 1.02, 0.3);
  for (const y of [0.75, 1.25]) add(F, rbox(0.05, 0.22, 0.05, 0.02), clay(0xc9c3b8), 0.27, y, 0.32);
  {const N = grp(F, -0.02, 0.6, 0.31); add(N, new THREE.TorusGeometry(0.2, 0.04, 14, 40), redClay(), 0, 0, 0); const sl = add(N, rbox(0.38, 0.06, 0.05, 0.02), redClay(), 0, 0, 0); sl.rotation.z = -PI / 4;
    const lb = loaf(N, 0, 0, -0.02, 0.28); lb.rotation.x = PI / 2.4;}
  add(S, rbox(1.2, 0.06, 0.62, 0.03), clay(0xc49a64), 0.25, 0.03, 0.3); loaf(S, 0.05, 0.22, 0.3, 0.95, 0.2);
  [0, 1, 2].forEach(i => {const sl = slice(S, 0.62 + i * 0.07, 0.27, 0.33, 0.9); sl.rotation.y = -0.6;});
  {const T = grp(S, 0.95, 0, -0.35); add(T, new THREE.CylinderGeometry(0.3, 0.25, 0.5, 32), clay(0xc8794f), 0, 0.25, 0); add(T, new THREE.CylinderGeometry(0.33, 0.33, 0.08, 32), clay(0xb86a42), 0, 0.53, 0); add(T, new THREE.SphereGeometry(0.06, 16, 10), clay(0xb86a42), 0, 0.6, 0);}
  VIEW = {az: -0.22, el: 0.3, fov: 24};
};
// kleine Symbole für die zweite Slide (ohne Platte)
MOTIFS.ic_akku1 = () => {battery(S, 0, 0, 1, 4); VIEW = {az: -0.35, el: 0.3, fov: 24};};
MOTIFS.ic_akku2 = () => {const m = clay(0xfbf8f1); add(S, new THREE.CylinderGeometry(0.09, 0.09, 0.9, 24), m, 0, 0.65, 0); add(S, new THREE.SphereGeometry(0.17, 24, 16), clay(0xf28c5a), 0, 0.17, 0);
  add(S, new THREE.CylinderGeometry(0.045, 0.045, 0.75, 16), clay(0xf28c5a), 0, 0.55, 0.03); const sun = add(S, new THREE.SphereGeometry(0.22, 24, 16), clay(PAL.yellow), 0.42, 0.95, -0.1);
  for (let i = 0; i < 8; i++) {const a = i * PI / 4, r = add(S, new THREE.ConeGeometry(0.05, 0.14, 10), clay(PAL.yellow), 0.42 + Math.cos(a) * 0.33, 0.95 + Math.sin(a) * 0.33, -0.1); r.rotation.z = a - PI / 2;} VIEW = {az: -0.2, el: 0.15, fov: 24};};
MOTIFS.ic_akku3 = () => {phone(S, 0, 0.6, 0, 0.9, (g, w, h) => {g.fillStyle = '#eef6ff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3e3f5a'; g.lineWidth = 16; g.beginPath(); g.roundRect(120, 300, 300, 520, 40); g.stroke();
    g.fillStyle = '#3e3f5a'; g.fillRect(220, 268, 100, 34); g.fillStyle = '#f28c5a'; g.beginPath(); g.roundRect(142, 724, 256, 74, 18); g.fill(); T2(g, '20 %', w / 2, 950, '800 120px "Inter Tight"', '#2b2b38');}); VIEW = {az: -0.3, el: 0.15, fov: 24};};
MOTIFS.ic_nap1 = () => {clock(S, 0, 0, 1, PAL.sky, (g, w, h) => {T2(g, '20', w / 2, h / 2 + 8, '800 150px "Inter Tight"', '#2b2b38'); T2(g, 'min', w / 2, h / 2 + 100, '600 44px Poppins', '#6a6a7a');}); VIEW = {az: -0.3, el: 0.2, fov: 24};};
MOTIFS.ic_nap2 = () => {cup(S, 0, 0, 1, PAL.yellow); for (let i = 0; i < 3; i++) add(S, new THREE.SphereGeometry(0.06 - i * 0.01, 14, 10), clay(0xfbf8f1), 0.03 * Math.sin(i * 2), 0.48 + i * 0.13, 0); VIEW = {az: -0.3, el: 0.3, fov: 24};};
MOTIFS.ic_nap3 = () => {add(S, new THREE.SphereGeometry(0.3, 28, 18), clay(PAL.yellow), 0, 0, 0); for (let i = 0; i < 10; i++) {const a = i * PI / 5, r = add(S, new THREE.ConeGeometry(0.06, 0.18, 10), clay(0xf6b38f), Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0); r.rotation.z = a - PI / 2;} VIEW = {az: -0.2, el: 0.1, fov: 24};};
MOTIFS.ic_brot1 = () => {add(S, new THREE.CylinderGeometry(0.3, 0.25, 0.5, 32), clay(0xc8794f), 0, 0.25, 0); add(S, new THREE.CylinderGeometry(0.33, 0.33, 0.08, 32), clay(0xb86a42), 0, 0.53, 0); add(S, new THREE.SphereGeometry(0.06, 16, 10), clay(0xb86a42), 0, 0.6, 0); VIEW = {az: -0.3, el: 0.3, fov: 24};};
MOTIFS.ic_brot2 = () => {[0, 1, 2].forEach(i => slice(S, -0.12 + i * 0.12, 0.25, 0, 1)); add(S, rbox(0.62, 0.6, 0.3, 0.06), glass(0xd6ecff, 0.4), 0, 0.27, 0); add(S, rbox(0.66, 0.06, 0.06, 0.02), clay(PAL.sky), 0, 0.6, 0);
  const fl = add(S, extr(star(0.12, 0.05), 0.02), clay(0xffffff), 0.32, 0.55, 0.16); fl.scale.setScalar(1); VIEW = {az: -0.3, el: 0.2, fov: 24};};
MOTIFS.ic_brot3 = () => {add(S, rbox(0.8, 0.55, 0.55, 0.08), clay(0xf6f4f8), 0, 0.3, 0); decal(S, 0.6, 0.32, tex(600, 320, (g, w, h) => {g.fillStyle = '#3e3f5a'; g.beginPath(); g.roundRect(0, 0, w, h, 30); g.fill(); g.fillStyle = '#f6a04d'; g.beginPath(); g.roundRect(30, 40, w - 60, h - 80, 20); g.fill();}), -0.05, 0.3, 0.28, {glow: 0.6});
  for (let i = 0; i < 2; i++) add(S, new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16).rotateX(PI / 2), clay(PAL.dark), 0.33, 0.42 - i * 0.12, 0.28); VIEW = {az: -0.3, el: 0.2, fov: 24};};
// Deko
MOTIFS.d_star = () => {add(S, extr(star(), 0.08), clay(PAL.yellow)); VIEW = {az: -0.4, el: 0.2, fov: 24};};
MOTIFS.d_heart = () => {add(S, extr(heart(), 0.1), clay(PAL.pink)); VIEW = {az: -0.4, el: 0.2, fov: 24};};
MOTIFS.d_flower = () => {for (let i = 0; i < 5; i++) {const a = i * 2 * PI / 5; add(S, new THREE.SphereGeometry(0.13, 20, 14), clay(0xf7a8c8), Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0).scale.z = 0.5;} add(S, new THREE.SphereGeometry(0.09, 20, 14), clay(PAL.yellow), 0, 0, 0.04); VIEW = {az: -0.3, el: 0.25, fov: 24};};
MOTIFS.d_blob = () => {add(S, new THREE.SphereGeometry(0.2, 24, 16), clay(PAL.mint)); VIEW = {az: -0.3, el: 0.3, fov: 24};};
MOTIFS.d_wave = () => {const P = []; for (let i = 0; i <= 20; i++) P.push([-0.5 + i * 0.05, Math.sin(i / 20 * PI * 2) * 0.1, 0]); tubeM(P, 0.04, clay(PAL.yellow)); VIEW = {az: -0.2, el: 0.2, fov: 24};};

// ------------------------------------------------------------------ build, light, frame, render
await (MOTIFS[MOT] || MOTIFS.gesetze)();
const box = new THREE.Box3().setFromObject(S), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
scene.add(new THREE.HemisphereLight(0xffe8f0, 0x6a5a80, 0.85));
const key = new THREE.DirectionalLight(0xffeedd, 2.0); key.position.set(ctr.x - 4, ctr.y + 8, ctr.z + 6); key.target.position.copy(ctr); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 5;
const ext = Math.max(size.x, size.y, size.z) * 0.85; Object.assign(key.shadow.camera, {left: -ext, right: ext, top: ext, bottom: -ext, near: 1, far: 30}); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.015; scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x9a88ff, 0.7); rim.position.set(ctr.x + 5, ctr.y + 3, ctr.z - 4); scene.add(rim);
// camera: fit the whole model into the frame (width is the limit for the thumbnail)
{const {az, el, fov} = VIEW; cam.fov = fov; cam.updateProjectionMatrix();
  const pts = []; for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
  const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)); const T = ctr.clone(); let d = size.length() * 2.5;
  for (let it = 0; it < 40; it++) {cam.position.copy(T).addScaledVector(dir, d); cam.lookAt(T); cam.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) {const q = p.clone().project(cam); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y);}
    const hh = Math.tan(fov * PI / 360) * d, hw = hh * cam.aspect, right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
    T.addScaledVector(right, (x0 + x1) / 2 * hw * 0.8).addScaledVector(up, (y0 + y1) / 2 * hh * 0.8);
    d *= Math.pow(Math.max((x1 - x0) / 1.9, (y1 - y0) / 1.9), 0.8);}}
renderer.render(scene, cam);
window.ready = true;
