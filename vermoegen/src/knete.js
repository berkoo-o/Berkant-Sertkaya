// function. – „Wem gehört eigentlich Deutschland?“ als Knete-Modell (Stil 6, vom Nutzer gewählt am 21.11.2026).
// Neufassung, weil die Stadt-Fassung unverständlich war: zehn Knetfiguren stehen für je ein Zehntel der Haushalte
// (von arm nach reich, die reichste ist rot), 100 Münzen sind alles, was die Haushalte besitzen.
// Alle Zeiten sind Stimm-Zeiten (voice/knete/words_take1.json); im Video beginnt die Stimme bei 0,15 s.
// Seite knete.html: setT(t) zeigt einen Stimm-Zeitpunkt, renderFrame(f) ein Videobild, CHECK() prüft alle Flugbahnen.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {TTFLoader} from 'three/addons/loaders/TTFLoader.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {clamp, lerp, ease, eo, ei, eio, ebk, win, rng} from './util.js';

await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '800 90px "Inter Tight"'].map(f => document.fonts.load(f)));
const W = 1080, H = 1920, VO = 0.15, OUT0 = 73.45, END_V = 77.2, RED = 0xE01E2B;
const R = rng(23);

// ------------------------------------------------------------------ renderer and scene (dark violet room like the style test, model floats in it)
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
renderer.setSize(W, H); renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0);
document.body.insertBefore(renderer.domElement, document.body.firstChild);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
const cam = new THREE.PerspectiveCamera(26, W / H, 0.05, 80);
const W0 = new THREE.Group(); scene.add(W0);
const tex = (w, h, draw) => {const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;};
const hex = c => '#' + new THREE.Color(c).getHexString();
const add = (par, geo, m, x = 0, y = 0, z = 0) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; par.add(o); return o;};
const rbox = (w, h, d, r = 0.05) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));

// ------------------------------------------------------------------ clay: matte, soft lumps and fingerprints (same recipe as the style test)
const clayBump = tex(512, 512, (g, w, h) => {g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {const x = R() * w, y = R() * h, r = 2 + R() * 12; const gr = g.createRadialGradient(x, y, 0, x, y, r); const v = R() < 0.5 ? 255 : 0;
    gr.addColorStop(0, `rgba(${v},${v},${v},0.09)`); gr.addColorStop(1, 'rgba(128,128,128,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);}
  g.lineWidth = 1.2; for (let i = 0; i < 40; i++) {const x = R() * w, y = R() * h; g.strokeStyle = 'rgba(70,70,70,0.10)'; for (let k = 0; k < 6; k++) {g.beginPath(); g.arc(x, y, 5 + k * 3.5, R() * 3, R() * 3 + 2.5); g.stroke();}}});
clayBump.wrapS = clayBump.wrapT = THREE.RepeatWrapping; clayBump.colorSpace = THREE.NoColorSpace;
const clay = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.93, bumpMap: clayBump, bumpScale: 2.2, ...o});
const PAL = {grass: 0x8fd18a, street: 0x6b6f86, walk: 0xf3e3c8, houses: [0xf6b38f, 0x9cc8f2, 0xf7dd7c, 0xc4a8f0, 0x9fe0c6, 0xf2a7c3, 0xffd2a6, 0xb8d8a0], roof: [0x8a6fd0, 0xe07f6a, 0x6f9fd8, 0xd9a03f],
  tree: [0x5fc46a, 0x4fb07a, 0x7fcf5a], car: [0x5b8ef0, 0xf5c451, 0x58b48c, 0xef8fb5]};
const winTex = (wall, win_, cols, rows) => tex(256, 256, (g, w, h) => {g.fillStyle = wall; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows;
  for (let i = 0; i < cols; i++) for (let k = 0; k < rows; k++) {const x = i * cw + cw * 0.25, y = k * rh + rh * 0.22; g.fillStyle = win_; g.beginPath(); g.roundRect(x, y, cw * 0.5, rh * 0.55, 6); g.fill();}});

// ------------------------------------------------------------------ the plate: purple clay slab, cream plaza in front, street, green town behind
const PX0 = -2.5, PX1 = 2.5, PZ0 = -3.1, PZ1 = 1.65, PCX = (PX0 + PX1) / 2, PCZ = (PZ0 + PZ1) / 2;
add(W0, rbox(PX1 - PX0, 0.34, PZ1 - PZ0, 0.13), clay(0x8f74d6, {bumpScale: 1.4}), PCX, -0.19, PCZ);
add(W0, rbox(PX1 - PX0 - 0.12, 0.05, PZ1 - PZ0 - 0.12, 0.03), clay(PAL.walk), PCX, -0.025, PCZ);
const ZST = -1.27;
add(W0, rbox(PX1 - PX0 - 0.16, 0.02, -1.47 - (PZ0 + 0.08), 0.01), clay(PAL.grass, {bumpScale: 3}), PCX, 0.004, (-1.47 + PZ0 + 0.08) / 2);
add(W0, rbox(PX1 - PX0 - 0.12, 0.022, 0.34, 0.008), clay(PAL.street), PCX, 0.007, ZST);
for (let x = PX0 + 0.25; x < PX1 - 0.2; x += 0.42) add(W0, rbox(0.17, 0.01, 0.03, 0.004), clay(0xf7f1e6), x, 0.019, ZST);

// ------------------------------------------------------------------ the town behind the plaza (what the money is: firms, rental blocks, shares)
function flag(par, y, sc) {
  const F = new THREE.Group(); F.position.set(0, y, 0); par.add(F); F.userData.sc = sc; F.visible = false;
  add(F, new THREE.CylinderGeometry(0.009, 0.009, 0.3, 10), clay(0xf3ece0), 0, 0.15, 0);
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.09, -0.01, 0.17, -0.045); sh.quadraticCurveTo(0.09, -0.07, 0, -0.095); sh.closePath();
  const cloth = add(F, new THREE.ExtrudeGeometry(sh, {depth: 0.012, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.005, bevelSegments: 2}), clay(RED, {bumpScale: 1.2}), 0.006, 0.3, -0.006); cloth.rotation.y = -0.5;
  add(F, new THREE.SphereGeometry(0.014, 12, 10), clay(0xf3ece0), 0, 0.305, 0); F.userData.cloth = cloth;
  return F;}
const TOWN = {};
function building(o) {
  const G = new THREE.Group(); G.position.set(o.x, 0, o.z); G.rotation.y = o.ry || 0; W0.add(G);
  const c = o.col ?? PAL.houses[(o.c || 0) % PAL.houses.length];
  const cols = Math.max(2, Math.round(o.w * 3)), rows = Math.max(2, Math.round(o.h * 3));
  const wm = new THREE.MeshStandardMaterial({map: winTex(hex(c), '#5b5a8a', cols, rows), roughness: .93, bumpMap: clayBump, bumpScale: 2.2}), pm = clay(c);
  let top = o.h;
  if (o.t === 'boerse') {
    add(G, rbox(o.w, o.h, o.d, 0.05), clay(0xf1ece2), 0, o.h / 2, 0);
    for (let i = 0; i < 5; i++) add(G, new THREE.CylinderGeometry(0.035, 0.04, o.h * 0.62, 14), clay(0xfaf6ee), -o.w * 0.4 + i * o.w * 0.2, o.h * 0.31, o.d / 2 + 0.06);
    add(G, rbox(o.w + 0.06, 0.05, o.d + 0.16, 0.02), clay(0xfaf6ee), 0, o.h * 0.64, 0.04);
    const ped = new THREE.Shape(); ped.moveTo(-o.w / 2 - 0.03, 0); ped.lineTo(o.w / 2 + 0.03, 0); ped.lineTo(0, 0.2); ped.closePath();
    const pg = new THREE.ExtrudeGeometry(ped, {depth: 0.08, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2}); add(G, pg, clay(0xfaf6ee), 0, o.h, o.d / 2 - 0.06);
    // share ticker on the front: a dark band with green numbers that runs slowly
    const tk = tex(1024, 64, (g, w, h) => {g.fillStyle = '#23263a'; g.fillRect(0, 0, w, h); g.font = '800 40px "Inter Tight"'; g.textBaseline = 'middle';
      const items = ['DAX ▲ 1,2 %', 'AKTIEN ▲ 0,8 %', 'MDAX ▲ 0,5 %', 'DAX ▲ 1,2 %']; let x = 20; for (const s of items) {g.fillStyle = '#7ee08f'; g.fillText(s, x, h / 2 + 2); x += g.measureText(s).width + 60;}});
    tk.wrapS = THREE.RepeatWrapping; tk.repeat.set(0.45, 1); TOWN.ticker = tk;
    add(G, new THREE.PlaneGeometry(o.w * 0.9, 0.09), new THREE.MeshStandardMaterial({map: tk, emissive: 0xffffff, emissiveMap: tk, emissiveIntensity: 0.35, roughness: 0.6}), 0, o.h * 0.78, o.d / 2 + 0.002);
    const bt = tex(512, 96, (g, w, h) => {g.fillStyle = '#faf6ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2b38'; g.font = '800 70px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BÖRSE', w / 2, h / 2 + 4);});
    add(G, new THREE.PlaneGeometry(o.w * 0.62, 0.115), new THREE.MeshStandardMaterial({map: bt, roughness: 0.85}), 0, o.h * 0.64 + 0.001, o.d / 2 + 0.121).castShadow = false;
    top = o.h + 0.2;
  } else {
    add(G, rbox(o.w, o.h, o.d, 0.06), [wm, wm, pm, pm, wm, wm], 0, o.h / 2, 0);
    if (o.t === 'house' || o.t === 'villa') {const r = new THREE.Shape(); r.moveTo(-o.w / 2 - 0.03, 0); r.lineTo(o.w / 2 + 0.03, 0); r.lineTo(0, o.w * 0.36); r.closePath();
      const g = new THREE.ExtrudeGeometry(r, {depth: o.d + 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3}); g.translate(0, 0, -(o.d + 0.04) / 2);
      add(G, g, clay(PAL.roof[(o.c || 0) % PAL.roof.length]), 0, o.h, 0); top = o.h + o.w * 0.36;}
    else add(G, rbox(o.w + 0.05, 0.06, o.d + 0.05, 0.025), clay(0xfaf3e8), 0, o.h + 0.03, 0);
    add(G, rbox(Math.min(0.12, o.w * 0.25), 0.16, 0.03, 0.012), clay(0x7a5a8a), 0, 0.08, o.d / 2 + 0.005);
  }
  if (o.t === 'factory') {G.userData.puffs = [];
    for (const [x, hh] of [[-0.28, 0.75], [0.0, 0.6]]) {add(G, new THREE.CylinderGeometry(0.065, 0.08, hh, 16), clay(0xf6b38f), x, o.h + hh / 2, -0.15);
      for (let k = 0; k < 3; k++) {const p = add(G, new THREE.SphereGeometry(0.09, 14, 12), clay(0xf4f1f7, {bumpScale: 1}), x, o.h + hh + 0.08, -0.15); p.castShadow = false; G.userData.puffs.push({p, x, y: o.h + hh + 0.06, k});}}
    for (let i = 0; i < 3; i++) {const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.25, 0); s.lineTo(0, 0.14); s.closePath(); const g = new THREE.ExtrudeGeometry(s, {depth: o.d * 0.7, bevelEnabled: true, bevelSize: .01, bevelThickness: .01}); g.translate(0, 0, -o.d * 0.35);
      add(G, g, clay(0xf7dd7c), 0.06 + i * 0.13 - 0.2, o.h + 0.06, 0.12);}}
  if (o.t === 'tower') {add(G, rbox(o.w * 0.6, 0.12, o.d * 0.6, 0.04), clay(0xffffff), 0, o.h + 0.06, 0); top = o.h + 0.12;}
  if (o.t === 'villa') add(G, rbox(0.3, 0.02, 0.13, 0.008), clay(0x46b6e0, {roughness: .4, bumpScale: .4}), 0.05, 0.02, o.d / 2 + 0.12);
  const rec = {G, o, top};
  if (o.flag) {rec.F = flag(G, top, o.fs || 1.6); rec.F.position.x = o.fx || 0; rec.F.position.z = o.fz || 0;}
  if (o.key) TOWN[o.key] = rec;
  return rec;}
const TOWNLIST = [
  {key: 'fab', t: 'factory', x: -1.75, z: -2.6, w: 1.0, d: 0.7, h: 0.7, col: 0xc4a8f0, flag: 1, fx: 0.31, fz: 0.2},
  {key: 'tower', t: 'tower', x: -0.74, z: -2.62, w: 0.56, d: 0.55, h: 1.8, col: 0x9cc8f2},
  {key: 'a3', t: 'block', x: 0.29, z: -2.62, w: 0.72, d: 0.54, h: 1.05, c: 3, flag: 1},
  {key: 'a1', t: 'block', x: 1.28, z: -2.62, w: 0.82, d: 0.56, h: 1.25, c: 1, flag: 1},
  {t: 'house', x: 2.07, z: -2.6, w: 0.5, d: 0.5, h: 0.44, c: 4},
  {t: 'house', x: -2.09, z: -1.86, w: 0.46, d: 0.46, h: 0.42, c: 5},
  {key: 'a2', t: 'block', x: -1.28, z: -1.88, w: 0.78, d: 0.54, h: 0.95, c: 0, flag: 1},
  {t: 'villa', x: -0.34, z: -1.86, w: 0.7, d: 0.52, h: 0.5, c: 2},
  {key: 'boerse', t: 'boerse', x: 0.62, z: -1.9, w: 1.0, d: 0.6, h: 0.82, flag: 1, fx: 0.3, fz: -0.12},
  {t: 'house', x: 1.48, z: -1.86, w: 0.44, d: 0.44, h: 0.4, c: 6},
  {t: 'house', x: 2.11, z: -1.86, w: 0.42, d: 0.42, h: 0.38, c: 7}];
const BLD = TOWNLIST.map(building);
const TREES = [];
function tree(x, z, s = 1) {const T = new THREE.Group(); T.position.set(x, 0.01, z); T.scale.setScalar(s); W0.add(T);
  add(T, new THREE.CylinderGeometry(0.02, 0.026, 0.14, 10), clay(0xa0704a), 0, 0.07, 0);
  add(T, new THREE.IcosahedronGeometry(0.15, 2), clay(PAL.tree[Math.floor(R() * 3)]), 0, 0.27, 0); if (R() < 0.5) add(T, new THREE.IcosahedronGeometry(0.1, 2), clay(PAL.tree[Math.floor(R() * 3)]), 0.06, 0.4, 0.02);
  TREES.push(T); return T;}
// trees only where they touch no building (footprint check, the crown is about 0.15 * size wide)
const TREE_SKIPPED = [];
for (const [x, z, sz] of [[-0.265, -2.62, 0.8], [-1.135, -2.72, 0.6], [0.76, -2.7, 0.62], [2.4, -2.25, 0.6], [-0.79, -1.82, 0.55], [1.8, -1.95, 0.55], [-2.35, -2.95, 0.55], [1.3, -3.0, 0.5], [-0.3, -3.0, 0.5]]) {
  const r = 0.155 * sz + 0.02; const hit = TOWNLIST.some(o => Math.abs(x - o.x) < o.w / 2 + r && Math.abs(z - o.z) < o.d / 2 + (o.t === 'boerse' ? 0.2 : 0) + r);
  if (hit || x - r < PX0 + 0.06 || x + r > PX1 - 0.06 || z - r < PZ0 + 0.06) TREE_SKIPPED.push([x, z]); else tree(x, z, sz);}
function car(x, z, c, ry = 0) {const C = new THREE.Group(); C.position.set(x, 0.022, z); C.rotation.y = ry; C.scale.setScalar(1.15); W0.add(C); const m = clay(PAL.car[c % PAL.car.length]);
  add(C, rbox(0.34, 0.08, 0.16, 0.035), m, 0, 0.06, 0); add(C, rbox(0.2, 0.07, 0.15, 0.03), m, -0.02, 0.13, 0);
  for (const [wx, wz] of [[-0.11, 0.08], [0.11, 0.08], [-0.11, -0.08], [0.11, -0.08]]) add(C, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 14).rotateX(Math.PI / 2), clay(0x3e3f5a), wx, 0.03, wz);}
car(-1.6, ZST - 0.07, 0); car(0.95, ZST + 0.07, 1, Math.PI);
// small bushes at the corners of the plaza
for (const [x, z] of [[-2.3, -0.98], [-2.28, 1.45], [2.3, -0.98], [2.3, 1.45]]) {const b = add(W0, new THREE.IcosahedronGeometry(0.12, 2), clay(PAL.tree[Math.floor(R() * 3)]), x, 0.08, z); b.scale.y = 0.75;}

// ------------------------------------------------------------------ the ten figures: each stands for a tenth of the households, from poor (1) to rich (10, red with top hat)
const XF = i => -1.67 + i * 0.38, ZF = 0.55, COLX = i => XF(i) + 0.2, COLZ = ZF - 0.15;
// what each figure wears shows how rich it is (Wunsch des Nutzers, 21.11.2026): 1 almost homeless, then step by step up to 10 in red with gold
const GOLD = new THREE.MeshStandardMaterial({color: 0xf2c14e, metalness: 0.65, roughness: 0.3, bumpMap: clayBump, bumpScale: 0.4, emissive: 0x7a5200, emissiveIntensity: 0.12});
const STYLE = [
  {body: 0x7d7468, leg: 0x4a4540, hair: 0x3b2a20, beanie: 0x5a5f6b, scarf: 0x8a6a5a, patches: [0x9b8a6a, 0x6a7d8a], ground: 'sleepingbag', slouch: 0.05},
  {body: 0x8c8f86, leg: 0x55524e, hair: 0xd9a441, beanie: 0x6f5a4a, patches: [0x6a7d8a], ground: 'bottles', slouch: 0.04},
  {body: 0x6f8fb0, leg: 0x3e3f5a, hair: 0x2b2b33, hood: true, cap: 0x3e4a5a},
  {body: 0x5b8ef0, leg: 0x3e3f5a, hair: 0x8a5a3a, helmet: true, vest: 0xf59a3c},
  {body: 0xa47ce0, leg: 0x3e3f5a, hair: 0x5a3b2a, backpack: 0x3e4a5a},
  {body: 0xf3f0ea, leg: 0x34364a, hair: 0xc9c3b8, tie: 0x4a6ad0},
  {body: 0xef8fb5, leg: 0x34364a, hair: 0x3b2a20, collar: true, watch: 0xc9ccd6},
  {body: 0x6f6a8a, leg: 0x2b2d3a, hair: 0x6b4a2a, shirt: true, tie: 0x2f8f8a, watch: 0xc9ccd6},
  {body: 0x2c3550, leg: 0x22242e, hair: 0x2b2b33, shirt: true, tie: 'gold', watch: 'gold', shades: true, briefcase: true},
  {body: RED, leg: 0x22242e, tophat: true, chain: true, monocle: true, buttons: true, cane: true, watch: 'gold'}];
const FIG = [], SPARKS = [];
function person(i) {const G = new THREE.Group(); G.position.set(XF(i), 0, ZF); W0.add(G); const B = new THREE.Group(); G.add(B); const k = 3.0, st = STYLE[i];
  const mat = c => c === 'gold' ? GOLD : clay(c);
  const leg = clay(st.leg), skin = clay(0xf3c9a5), body = clay(st.body, i === 9 ? {bumpScale: 1.6} : {});
  for (const sx of [-1, 1]) add(B, new THREE.CylinderGeometry(0.013 * k, 0.012 * k, 0.06 * k, 14), leg, sx * 0.012 * k, 0.03 * k, 0);
  add(B, new THREE.CapsuleGeometry(0.03 * k, 0.045 * k, 6, 16), body, 0, 0.1 * k, 0);
  for (const sx of [-1, 1]) {const a = add(B, new THREE.CapsuleGeometry(0.0068 * k, 0.03 * k, 4, 10), body, sx * 0.0315 * k, 0.098 * k, 0); a.rotation.z = -sx * 0.1;}
  add(B, new THREE.SphereGeometry(0.024 * k, 20, 16), skin, 0, 0.165 * k, 0);
  for (const sx of [-1, 1]) add(B, new THREE.SphereGeometry(0.0034 * k, 8, 6), clay(0x22222a, {bumpScale: 0}), sx * 0.0085 * k, 0.168 * k, 0.0215 * k).castShadow = false;
  const front = 0.089;
  // head: hair, knitted beanie, hard hat or top hat
  if (st.beanie) {add(B, new THREE.SphereGeometry(0.077, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.44), clay(st.beanie, {bumpScale: 3}), 0, 0.516, -0.004);
    const brim = add(B, new THREE.TorusGeometry(0.068, 0.012, 8, 24), clay(st.beanie, {bumpScale: 3}), 0, 0.528, -0.004); brim.rotation.x = Math.PI / 2;}
  else if (st.helmet) {add(B, new THREE.SphereGeometry(0.08, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), clay(0xf5c451, {roughness: 0.6}), 0, 0.512, 0);
    add(B, new THREE.CylinderGeometry(0.094, 0.094, 0.008, 24), clay(0xf5c451, {roughness: 0.6}), 0, 0.514, 0.006);}
  else if (st.tophat) {add(B, new THREE.CylinderGeometry(0.028 * k, 0.028 * k, 0.004 * k, 20), clay(0x2b2b33), 0, 0.184 * k, 0); add(B, new THREE.CylinderGeometry(0.018 * k, 0.019 * k, 0.03 * k, 18), clay(0x2b2b33), 0, 0.2 * k, 0);
    add(B, new THREE.CylinderGeometry(0.0605, 0.0605, 0.018, 24), GOLD, 0, 0.567, 0);}
  else if (st.cap) {add(B, new THREE.SphereGeometry(0.0765, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.44), clay(st.cap), 0, 0.506, -0.002); const br = add(B, rbox(0.07, 0.008, 0.06, 0.004), clay(st.cap), 0.03, 0.535, 0.075); br.rotation.y = -0.6;}
  else add(B, new THREE.SphereGeometry(0.0255 * k, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), clay(st.hair), 0, 0.168 * k, -0.002 * k);
  // poor: patches, a scarf, a slight stoop; worker: vest with a light stripe; student: backpack; hoodie: the hood behind the neck
  (st.patches || []).forEach((c, n) => {const pt = add(B, rbox(0.036, 0.034, 0.008, 0.004), clay(c), n ? -0.035 : 0.03, n ? 0.24 : 0.33, front - 0.004); pt.rotation.z = n ? 0.25 : -0.2;});
  if (st.scarf) {const sc = add(B, new THREE.TorusGeometry(0.058, 0.02, 10, 22), clay(st.scarf, {bumpScale: 3}), 0, 0.44, 0); sc.rotation.x = Math.PI / 2; add(B, rbox(0.026, 0.085, 0.014, 0.006), clay(st.scarf, {bumpScale: 3}), 0.032, 0.385, 0.078).rotation.z = 0.12;}
  if (st.vest) {add(B, new THREE.CapsuleGeometry(0.094, 0.075, 6, 16), clay(st.vest), 0, 0.325, 0); add(B, new THREE.CylinderGeometry(0.0955, 0.0955, 0.014, 22), clay(0xe8e8ee, {roughness: 0.5}), 0, 0.3, 0);}
  if (st.hood) {const h = add(B, new THREE.TorusGeometry(0.052, 0.026, 10, 22), body, 0, 0.44, -0.035); h.rotation.x = Math.PI / 2 - 0.45;}
  if (st.backpack) {add(B, rbox(0.11, 0.13, 0.055, 0.02), clay(st.backpack), 0, 0.32, -0.112); for (const sx of [-1, 1]) add(B, rbox(0.014, 0.14, 0.01, 0.004), clay(st.backpack), sx * 0.04, 0.33, front - 0.006);}
  // middle to rich: collar or shirt and tie, watches
  if (st.collar) for (const sx of [-1, 1]) {const c = add(B, rbox(0.035, 0.02, 0.01, 0.004), clay(0xffffff), sx * 0.02, 0.43, 0.075); c.rotation.z = sx * 0.5;}
  if (st.shirt) add(B, rbox(0.045, 0.13, 0.01, 0.005), clay(0xf7f5f0), 0, 0.38, front - 0.003);
  if (st.tie) {add(B, rbox(0.022, 0.1, 0.012, 0.004), mat(st.tie), 0, 0.37, front + 0.002); add(B, rbox(0.026, 0.02, 0.014, 0.005), mat(st.tie), 0, 0.427, front - 0.004);}
  if (st.watch) {const w = add(B, new THREE.TorusGeometry(0.021, 0.006, 8, 18), mat(st.watch), 0.101, 0.255, 0); w.rotation.x = Math.PI / 2; add(B, new THREE.CylinderGeometry(0.009, 0.009, 0.006, 12).rotateZ(Math.PI / 2), mat(st.watch), 0.122, 0.255, 0.004);}
  if (st.shades) {for (const sx of [-1, 1]) add(B, rbox(0.032, 0.02, 0.008, 0.005), clay(0x15151c, {roughness: 0.3, bumpScale: 0}), sx * 0.026, 0.505, 0.068); add(B, rbox(0.022, 0.006, 0.006, 0.002), clay(0x15151c, {bumpScale: 0}), 0, 0.509, 0.07);}
  if (st.briefcase) {const bc = new THREE.Group(); bc.position.set(0.13, 0.165, 0.01); B.add(bc); add(bc, rbox(0.1, 0.075, 0.028, 0.01), clay(0x6b4a2a), 0, 0, 0);
    const hd = add(bc, new THREE.TorusGeometry(0.016, 0.004, 6, 14, Math.PI), clay(0x3a2a1a), 0, 0.037, 0); hd.rotation.z = 0; add(bc, rbox(0.022, 0.012, 0.008, 0.003), GOLD, 0, 0.02, 0.016);}
  // the richest: gold chain with a euro medallion, gold buttons, monocle, gold cane, sparkles
  if (st.chain) {const ch = add(B, new THREE.TorusGeometry(0.056, 0.0075, 8, 28, Math.PI), GOLD, 0, 0.425, 0.084); ch.rotation.z = Math.PI;
    const md = add(B, new THREE.CylinderGeometry(0.022, 0.022, 0.007, 20).rotateX(Math.PI / 2), GOLD, 0, 0.36, front + 0.006); SPARKS.push({o: B, p: [0, 0.36, front + 0.015], ph: 0.1});}
  if (st.buttons) for (const y of [0.31, 0.27, 0.23]) add(B, new THREE.SphereGeometry(0.0085, 10, 8), GOLD, 0, y, front + 0.001);
  if (st.monocle) {const m = add(B, new THREE.TorusGeometry(0.019, 0.004, 8, 18), GOLD, 0.0255, 0.505, 0.071); add(B, new THREE.CylinderGeometry(0.0018, 0.0018, 0.1, 6), GOLD, 0.045, 0.455, 0.074).rotation.z = 0.25;}
  if (st.cane) {const cn = new THREE.Group(); cn.position.set(-0.128, 0, 0.035); cn.rotation.z = -0.06; B.add(cn); add(cn, new THREE.CylinderGeometry(0.008, 0.008, 0.33, 10), clay(0x23232b), 0, 0.165, 0);
    add(cn, new THREE.SphereGeometry(0.019, 14, 10), GOLD, 0, 0.335, 0); add(cn, new THREE.CylinderGeometry(0.009, 0.009, 0.02, 10), GOLD, 0, 0.01, 0); SPARKS.push({o: cn, p: [0, 0.345, 0.01], ph: 0.55});}
  if (st.tophat) SPARKS.push({o: B, p: [0.045, 0.57, 0.04], ph: 0.8});
  if (st.tie === 'gold') SPARKS.push({o: B, p: [0.122, 0.26, 0.012], ph: 0.3});
  B.rotation.x = st.slouch || 0;
  // things on the ground next to the poorest (where the others have their coin stacks)
  if (st.ground === 'sleepingbag') {const g = new THREE.Group(); g.position.set(XF(i) + 0.2, 0, COLZ + 0.02); g.rotation.y = 0.35; W0.add(g);
    add(g, new THREE.CylinderGeometry(0.048, 0.048, 0.17, 18).rotateZ(Math.PI / 2), clay(0x5f6f5a, {bumpScale: 2.5}), 0, 0.048, 0);
    for (const x of [-0.045, 0.045]) {const st2 = add(g, new THREE.TorusGeometry(0.049, 0.006, 6, 18), clay(0x3a3328), x, 0.048, 0); st2.rotation.y = Math.PI / 2;}
    add(g, rbox(0.12, 0.012, 0.09, 0.004), clay(0xb08a5a), 0.02, 0.006, 0.09).rotation.y = -0.2;}
  if (st.ground === 'bottles') {const g = new THREE.Group(); g.position.set(XF(i) + 0.2, 0, COLZ + 0.02); g.rotation.y = -0.25; W0.add(g);
    add(g, rbox(0.1, 0.085, 0.07, 0.015), clay(0x7fa8d8, {roughness: 0.5, bumpScale: 1}), 0, 0.0425, 0);
    [[-0.025, 0x5f9f6a], [0.005, 0x8a5a30], [0.032, 0x5f9f6a]].forEach(([x, c], n) => {add(g, new THREE.CylinderGeometry(0.011, 0.013, 0.07, 12), clay(c, {roughness: 0.35, bumpScale: 0.5}), x, 0.09 + n * 0.008, 0.005 - n * 0.008);
      add(g, new THREE.CylinderGeometry(0.006, 0.006, 0.014, 8), clay(0xe8e8ee), x, 0.132 + n * 0.008, 0.005 - n * 0.008);});}
  G.rotation.y = (R() - 0.5) * 0.16; FIG.push({G, B, i}); return G;}
// little four-point sparkles that light up now and then on the gold
const sparkT = tex(128, 128, (g, w, h) => {const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(0.25, 'rgba(255,230,150,0.55)'); gr.addColorStop(1, 'rgba(255,220,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,252,235,0.95)'; g.beginPath(); g.moveTo(64, 2); g.lineTo(70, 58); g.lineTo(126, 64); g.lineTo(70, 70); g.lineTo(64, 126); g.lineTo(58, 70); g.lineTo(2, 64); g.lineTo(58, 58); g.closePath(); g.fill();});
for (let i = 0; i < 10; i++) person(i);
for (const sp of SPARKS) {const m = new THREE.Sprite(new THREE.SpriteMaterial({map: sparkT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending})); m.position.set(...sp.p); m.scale.setScalar(1e-3); sp.o.add(m); sp.m = m;}
const FIG_TOP = 0.66, FIG_R = 0.12;

// number tiles in front of the figures (1 = poorest tenth, 10 = richest)
const TILE = [];
for (let i = 0; i < 10; i++) {const tt = tex(256, 256, (g, w, h) => {g.fillStyle = '#f7f1e4'; g.fillRect(0, 0, w, h); g.fillStyle = i === 9 ? '#E01E2B' : '#2b2b38'; g.font = '800 150px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), w / 2, h / 2 + 8);});
  const top = new THREE.MeshStandardMaterial({map: tt, roughness: 0.9, bumpMap: clayBump, bumpScale: 0.8, emissive: 0xffe9b8, emissiveIntensity: 0});
  const m = add(W0, new THREE.CylinderGeometry(0.092, 0.096, 0.03, 32), [clay(0xf2eadb), top, top], XF(i), 0.015, 0.93); m.rotation.y = Math.PI / 2; TILE.push({m, top});}

// ------------------------------------------------------------------ coins (clay gold with a pressed-in euro sign)
const CR = 0.085, CH = 0.034;
const coinTopT = tex(256, 256, (g, w, h) => {g.fillStyle = '#f4c34f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d99a2b'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, 7); g.stroke();
  g.fillStyle = '#d6952a'; g.font = '800 140px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', w / 2 - 4, h / 2 + 6);});
const coinSideM = clay(0xe2a632, {roughness: 0.5, metalness: 0.25, bumpScale: 0.8, emissive: 0xffc860, emissiveIntensity: 0});
const coinTopM = new THREE.MeshStandardMaterial({map: coinTopT, roughness: 0.45, metalness: 0.25, bumpMap: clayBump, bumpScale: 0.6, emissive: 0xffc860, emissiveIntensity: 0});
const coinGeo = new THREE.CylinderGeometry(CR, CR, CH, 36);
const mkCoin = () => {const m = add(W0, coinGeo, [coinSideM, coinTopM, coinTopM]); m.rotation.order = 'YXZ'; return m;};
const slotPos = (col, s) => [COLX(col), CH * (s + 0.5), COLZ];
// the 100 coins lie on the plaza behind the figures; sorted from left to right, so the poorer figures get the coins from the left
const FIELD = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) FIELD.push([-1.9 + c * 0.2, CH / 2 + 0.001, -0.12 - r * 0.19]);
FIELD.sort((a, b) => a[0] - b[0] || b[2] - a[2]);
const SH0 = [0, 0, 1, 1, 1, 5, 8, 12, 18, 54];   // Modell vereinfacht: Bundesbank 2023, oberste 10 % = 54 %, ärmere Hälfte 2–3 %
const COINS = [];   // {m, start:[x,y,z], segs:[{t0, dur, col, slot, apex}], popT}
{const POOR = [-0.7, -0.3, 0.1].map(x => FIELD.findIndex(p => Math.abs(p[0] - x) < 0.01 && Math.abs(p[2] + 0.12) < 0.01)); const REST = FIELD.filter((p, i) => !POOR.includes(i));
  let idx = 0; const byCol = {}; for (const col of [9, 5, 6, 7, 8]) {byCol[col] = []; for (let s = 0; s < SH0[col]; s++) byCol[col].push(REST[idx++]);}
  for (const col of [5, 6, 7, 8]) byCol[col].sort((a, b) => Math.hypot(a[0] - COLX(col), a[2] - COLZ) - Math.hypot(b[0] - COLX(col), b[2] - COLZ)); [2, 3, 4].forEach((c, k) => byCol[c] = [FIELD[POOR[k]]]);
  // farthest coins first at an even speed: every later coin stays behind the one before it, so the stream never touches
  const D = p => Math.hypot(p[0] - COLX(9), p[2] - COLZ); const rich = byCol[9].slice().sort((a, b) => D(b) - D(a));
  for (let j = 0; j < rich.length; j++) {const p = rich[j]; COINS.push({start: p, segs: [{t0: 1.45 + j * 0.05 + Math.max(0, j - 46) * 0.035, dur: 0.38 + D(p) / 8, col: 9, slot: j}]});}
  // each column gets its coins in an even rhythm over the same 1.3 s
  [5, 6, 7, 8].forEach((col, ci) => byCol[col].forEach((p, k) => COINS.push({start: p, segs: [{t0: 4.0 + ci * 0.017 + k * 0.088, dur: 0.45 + Math.hypot(p[0] - COLX(col), p[2] - COLZ) / 8, col, slot: k, io: true}]})));
  // the poorer half: one coin each for figures 3, 4 and 5, on „zwei“, „bis“, „drei“
  [2, 3, 4].forEach((c, k) => COINS.push({start: byCol[c][0], segs: [{t0: 8.22 + k * 0.3, dur: 0.55, col: c, slot: 0, io: true}]}));}
// the super-rich (≈ 60 %): six coins hop from the tops of columns 9, 8, 7, 6 onto the red column; first ghost slots show what is missing
const HOPS = [[8, 17], [8, 16], [7, 11], [7, 10], [6, 7], [5, 4]];
HOPS.forEach(([col, slot], j) => {const c = COINS.find(o => o.segs[0].col === col && o.segs[0].slot === slot); c.segs.push({t0: 27.25 + j * 0.21, dur: 0.75, col: 9, slot: 54 + j, io: true});});
const GHOST_T = 24.4;
const ghostM = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.7, transparent: true, opacity: 0.6, roughness: 0.6, depthWrite: false});
const GHOSTS = Array.from({length: 6}, (_, j) => {const m = new THREE.Mesh(coinGeo, ghostM.clone()); const p = slotPos(9, 54 + j); m.position.set(p[0], p[1], p[2]); W0.add(m); return m;});
// rent: one coin pops up above each renter (figures 1–6) and flies to the owner, the red figure
const RENT_T = 54.0;
for (let i = 0; i < 6; i++) COINS.push({start: [XF(i), 0.84, ZF], popT: 53.62 + i * 0.1, segs: [{t0: RENT_T + i * 0.2, dur: 0.95, col: 9, slot: 60 + i, io: true}]});
// inheritance: a stack of eight coins tied with a red ribbon comes down onto the red column
const GIFT_T0 = 59.3, GIFT_T1 = 60.2, GIFT_N = 8, GIFT_S0 = 66;
const GIFT = new THREE.Group(); W0.add(GIFT);
{for (let s = 0; s < GIFT_N; s++) {const m = new THREE.Mesh(coinGeo, [coinSideM, coinTopM, coinTopM]); m.castShadow = m.receiveShadow = true; m.position.y = CH * (s + 0.5); GIFT.add(m);}
  const rib = clay(RED, {bumpScale: 1.0}), hh = CH * GIFT_N;
  add(GIFT, rbox(0.032, hh + 0.012, 2 * CR + 0.014, 0.008), rib, 0, hh / 2, 0); add(GIFT, rbox(2 * CR + 0.014, hh + 0.012, 0.032, 0.008), rib, 0, hh / 2, 0);
  for (const s of [-1, 1]) {const l = add(GIFT, new THREE.TorusGeometry(0.034, 0.011, 10, 24), rib, s * 0.03, hh + 0.03, 0); l.rotation.set(0, 0, s * 0.5);}
  add(GIFT, new THREE.SphereGeometry(0.018, 12, 10), rib, 0, hh + 0.012, 0);}
for (const c of COINS) {c.m = mkCoin(); c.ry = R() * 6.28;}

// position of a flying coin: rises mostly straight up, travels, and drops straight down onto its slot (so it never cuts through a figure or a column)
// lat: sideways bow (neighbours in a stream take different lanes, so they never touch in the air)
function flyPos(a, b, apex, u, io = false) {
  // a lob: up to the top of the arc by 40 % of the flight, then falling faster and faster; sideways it starts quick and slows down,
  // so the last quarter is a straight drop onto the stack (that keeps a stream of coins from touching)
  const ua = 0.32, y = u < ua ? lerp(a[1], apex, 1 - (1 - u / ua) ** 2) : lerp(apex, b[1], ((u - ua) / (1 - ua)) ** 2);
  const v = clamp(u / 0.75, 0, 1), w = io ? ease(v) : 1 - (1 - v) ** 1.6;
  return [lerp(a[0], b[0], w), y, lerp(a[2], b[2], w)];}
// top of a column (number of coins resting there) at time t, from the coin schedule
function restCount(col, t) {let n = 0; for (const c of COINS) {const r = restOf(c, t); if (r && r.col === col) n++;} if (t >= GIFT_T1 && col === 9) n += GIFT_N; return n;}
function restOf(c, t) {let r = null; for (const s of c.segs) if (t >= s.t0 + s.dur) r = s; return r;}
// apex of each flight: high enough over the column it lands on and over everything it passes
// a coin only needs to clear the figures' heads if its path passes close to one; otherwise it makes a low hop
const nearFig = (a, b) => {for (let i = 0; i < 10; i++) {const px = XF(i) - a[0], pz = ZF - a[2], dx = b[0] - a[0], dz = b[2] - a[2], L2 = dx * dx + dz * dz || 1; const u = clamp((px * dx + pz * dz) / L2, 0, 1);
  if (Math.hypot(a[0] + dx * u - XF(i), a[2] + dz * u - ZF) < FIG_R + CR + 0.03) return true;} return false;};
// within one column every coin gets the same rule for its height, so a later coin is never below an earlier one on the way down
const NEED = {};
for (const c of COINS) {let prev = c.start; c.segs.forEach(s => {const b = slotPos(s.col, s.slot); if (nearFig(prev, b)) NEED[s.col] = true; prev = b;});}
for (const c of COINS) {let prev = c.start; c.segs.forEach((s, j) => {const b = slotPos(s.col, s.slot); const over = CH * (s.slot + 1);
  s.a = prev; s.b = b; s.apex = Math.max(Math.max(prev[1], over) + (s.col === 9 ? 0.45 : 0.3) + (j > 0 ? 0.12 : 0), NEED[s.col] ? FIG_TOP + 0.4 : 0) + (s.up || 0); prev = b;});}
function coinAt(c, t) {
  // returns {p:[x,y,z], rx, vis, sc}
  if (c.popT !== undefined && t < c.segs[0].t0) {const p = clamp((t - c.popT) / 0.28, 0, 1); return {p: c.start, rx: 0, vis: p > 0, sc: Math.max(1e-3, ebk(p, 2))};}
  for (const s of c.segs) {if (t < s.t0) return {p: s.a, rx: 0, vis: true, sc: 1}; if (t < s.t0 + s.dur) {const u = (t - s.t0) / s.dur; return {p: flyPos(s.a, s.b, s.apex, u, s.io), rx: 0.45 * Math.sin(Math.PI * clamp(u / 0.55, 0, 1)), vis: true, sc: 1, fly: true};}}
  const s = c.segs[c.segs.length - 1]; return {p: s.b, rx: 0, vis: true, sc: 1};}

// ------------------------------------------------------------------ signs with the thresholds and a dashed line through the gap between two figures
const SIGNS = [];
function sign(txt, x, t0) {const G = new THREE.Group(); G.position.set(x, 0, 0.0); W0.add(G);
  const st = tex(512, 200, (g, w, h) => {g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, w, h); g.fillStyle = '#23232d'; g.font = '800 104px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 6);});
  add(G, new THREE.CylinderGeometry(0.016, 0.018, 0.86, 12), clay(0xf3ece0), 0, 0.43, 0);
  add(G, rbox(0.46, 0.19, 0.035, 0.02), [clay(0xf3ece0), clay(0xf3ece0), clay(0xf3ece0), clay(0xf3ece0), new THREE.MeshStandardMaterial({map: st, roughness: 0.85, bumpMap: clayBump, bumpScale: 0.6}), clay(0xf3ece0)], -0.13, 0.93, 0.02);
  const dashes = []; for (const z of [0.08, 0.165, 0.25, 0.72, 0.805, 0.89, 0.975, 1.06, 1.145]) dashes.push(add(W0, rbox(0.022, 0.008, 0.05, 0.004), clay(0xffffff, {bumpScale: 0.5}), x, 0.004, z));
  G.visible = false; const S = {G, dashes, t0, x}; SIGNS.push(S); return S;}
// gap between the column of figure 9 and figure 10, and between figure 5 and figure 6
const S780 = sign('780.000 €', (COLX(8) + CR + XF(9)) / 2, 35.95);
const S103 = sign('103.000 €', (COLX(4) + CR + XF(5)) / 2, 45.95);

// ------------------------------------------------------------------ what counts as wealth: house, savings, shares, minus debts (in front of the richest figures)
const PROPS = [];
function prop(build, x, t0) {const G = new THREE.Group(); G.position.set(x, 0, 1.32); W0.add(G); build(G); G.visible = false; PROPS.push({G, t0}); return G;}
prop(G => {add(G, rbox(0.2, 0.15, 0.17, 0.03), clay(0xf7dd7c), 0, 0.075, 0); const r = new THREE.Shape(); r.moveTo(-0.125, 0); r.lineTo(0.125, 0); r.lineTo(0, 0.1); r.closePath();
  const g = new THREE.ExtrudeGeometry(r, {depth: 0.19, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2}); g.translate(0, 0, -0.095); add(G, g, clay(0xe07f6a), 0, 0.15, 0);
  add(G, rbox(0.045, 0.08, 0.02, 0.008), clay(0x7a5a8a), 0, 0.04, 0.088); for (const sx of [-1, 1]) add(G, rbox(0.04, 0.04, 0.02, 0.006), clay(0x5b5a8a), sx * 0.06, 0.09, 0.088);}, 1.0, 39.42);
prop(G => {const pink = clay(0xf2a7c3); const b = add(G, new THREE.SphereGeometry(0.1, 24, 18), pink, 0, 0.12, 0); b.scale.set(1.15, 0.92, 0.95);
  add(G, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 18).rotateX(Math.PI / 2), clay(0xe98fb2), 0, 0.12, 0.105); for (const sx of [-1, 1]) {add(G, new THREE.SphereGeometry(0.0055, 8, 6), clay(0x22222a, {bumpScale: 0}), sx * 0.04, 0.16, 0.085); add(G, new THREE.ConeGeometry(0.025, 0.04, 12), pink, sx * 0.05, 0.215, 0.02);}
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(G, new THREE.CylinderGeometry(0.02, 0.02, 0.05, 10), pink, sx * 0.06, 0.025, sz * 0.05);
  add(G, rbox(0.05, 0.008, 0.012, 0.003), clay(0x7a4a6a), 0, 0.205, 0);}, 1.33, 39.98);
prop(G => {add(G, rbox(0.24, 0.17, 0.025, 0.02), clay(0xfbf8f1), 0, 0.16, 0); add(G, new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), clay(0xa0704a), 0, 0.05, -0.03);
  const pts = [[-0.09, 0.1], [-0.04, 0.13], [0.0, 0.115], [0.05, 0.17], [0.09, 0.2]]; for (let i = 0; i < pts.length - 1; i++) {const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const L = Math.hypot(x1 - x0, y1 - y0);
    const s = add(G, rbox(L + 0.012, 0.014, 0.012, 0.005), clay(0x4fb07a, {bumpScale: 0.6}), (x0 + x1) / 2, (y0 + y1) / 2, 0.016); s.rotation.z = Math.atan2(y1 - y0, x1 - x0);}
  const a = add(G, new THREE.ConeGeometry(0.018, 0.035, 10), clay(0x4fb07a), 0.095, 0.21, 0.016); a.rotation.z = -0.65;}, 1.66, 40.86);
prop(G => {const dt = tex(256, 128, (g, w, h) => {g.fillStyle = '#6d6f80'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3f1f7'; g.font = '800 54px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('− Kredit', w / 2, h / 2 + 3);});
  const gm = clay(0x6d6f80); add(G, rbox(0.27, 0.13, 0.14, 0.025), [gm, gm, gm, gm, new THREE.MeshStandardMaterial({map: dt, roughness: 0.9, bumpMap: clayBump, bumpScale: 0.8}), gm], 0, 0.065, 0);}, 2.04, 42.42);
const PROPS_OUT = 43.5;

// ------------------------------------------------------------------ outro: the logo as red clay letters on the plaza, the red figure hops forward and becomes the dot
const FONT = new FontLoader().parse(new TTFLoader().parse(await (await fetch('node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff')).arrayBuffer()));
const LZ = 1.3, LSIZE = 0.72, LOGO = [], LOGO_T0 = 73.95;
let LX0 = 0, LX1 = 0; const DOT = {x: 0, r: 0};
{const sc = LSIZE / FONT.data.resolution; let x = 0; const parts = [];
  for (const ch of 'function') {const shapes = FONT.generateShapes(ch, LSIZE);
    const geo = new THREE.ExtrudeGeometry(shapes, {depth: 0.08, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.012, bevelSegments: 4, curveSegments: 10});
    geo.computeBoundingBox(); const bb = geo.boundingBox, cx = (bb.min.x + bb.max.x) / 2; geo.translate(-cx, 0.013, -0.04); parts.push({geo, x: x + cx}); x += FONT.data.glyphs[ch].ha * sc - 0.041 * LSIZE;}
  const dg = new THREE.ShapeGeometry(FONT.generateShapes('.', LSIZE)); dg.computeBoundingBox(); const db = dg.boundingBox;
  const dotX = x + (db.min.x + db.max.x) / 2; DOT.r = (db.max.x - db.min.x) / 2; const total = dotX + DOT.r; LX0 = 0.12 - total / 2; LX1 = LX0 + total; DOT.x = LX0 + dotX;
  const mat = clay(RED, {bumpScale: 1.3, emissive: RED, emissiveIntensity: 0.22});
  for (const p of parts) {const m = new THREE.Mesh(p.geo, mat); m.castShadow = m.receiveShadow = true; m.position.set(LX0 + p.x, 0, LZ); m.visible = false; W0.add(m); LOGO.push(m);}}
const BALL = add(W0, new THREE.SphereGeometry(1, 32, 24), clay(RED, {bumpScale: 1.3, emissive: RED, emissiveIntensity: 0.22})); BALL.visible = false;
const BALL_T = {squash: 74.55, morph: 74.75, fly: 74.85, land: 75.45};

// ------------------------------------------------------------------ light: soft warm key with shadows, violet rim, a focus light that follows the camera target
const hemi = new THREE.HemisphereLight(0xffe8f0, 0x6a5a80, 0.85); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffeedd, 2.0); key.position.set(-4, 8, 6); key.target.position.set(0, 0, -0.6); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 5;
Object.assign(key.shadow.camera, {left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 25}); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.015; scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x9a88ff, 0.7); rim.position.set(5, 3, -4); scene.add(rim);
const focus = new THREE.SpotLight(0xfff2e0, 0, 14, 0.42, 0.85, 1.2); scene.add(focus, focus.target);

// ------------------------------------------------------------------ camera (voice time): target x,y,z, half frame height at the target, azimuth, elevation, fov
const C = (x, y, z, s, az, el, fov = 26) => [x, y, z, Math.log(s), az, el, fov];
// fit a world box into the free band between title and subtitles (x 70–1010, y 500–1350): returns the camera key
const BAND = [70, 1010, 500, 1350];
function fit(box, az, el, fov = 26, m = 1) {const [x0, x1, y0, y1, z0, z1] = box; const T = new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); let sz = Math.max(x1 - x0, y1 - y0);
  const c = new THREE.PerspectiveCamera(fov, W / H, 0.05, 100), v = new THREE.Vector3(), ar = az * Math.PI / 180, er = el * Math.PI / 180;
  const dir = new THREE.Vector3(Math.sin(ar) * Math.cos(er), Math.sin(er), Math.cos(ar) * Math.cos(er));
  for (let it = 0; it < 40; it++) {const d = sz / Math.tan(fov / 2 * Math.PI / 180); c.position.copy(T).addScaledVector(dir, d); c.lookAt(T); c.updateMatrixWorld(); c.updateProjectionMatrix();
    let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9; for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) {v.set(x, y, z).project(c); const px = (v.x + 1) / 2 * W, py = (1 - v.y) / 2 * H; bx0 = Math.min(bx0, px); bx1 = Math.max(bx1, px); by0 = Math.min(by0, py); by1 = Math.max(by1, py);}
    const k = Math.max((bx1 - bx0) / (BAND[1] - BAND[0]), (by1 - by0) / (BAND[3] - BAND[2])) * m; const wpp = 2 * sz / H;
    const right = new THREE.Vector3().setFromMatrixColumn(c.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(c.matrixWorld, 1);
    T.addScaledVector(right, ((bx0 + bx1) / 2 - (BAND[0] + BAND[1]) / 2) * wpp).addScaledVector(up, -((by0 + by1) / 2 - (BAND[2] + BAND[3]) / 2) * wpp); sz *= 0.5 + 0.5 * k;}
  return C(T.x, T.y, T.z, sz, az, el, fov);}
const WIDE = [-2.45, 2.45, 0, 1.9, -2.9, 1.15], ROWH = [-1.85, 2.1, 0, 1.95, -0.95, 0.9], ROWT = [-1.85, 2.1, 0, 2.1, -0.2, 1.15], ROW = [-1.85, 2.1, 0, 2.65, -0.2, 1.1];
const KEYS = [
  [0.0, fit(WIDE, 0, 26, 24, 1.0)], [1.7, fit(ROWH, 0, 25, 24, 1.0)], [5.7, fit(ROWH, -0.5, 25, 24, 0.98)],
  [7.2, fit([-1.85, 0.12, 0, 0.72, 0.0, 1.0], -6, 22)], [10.1, fit([-1.85, 0.12, 0, 0.72, 0.0, 1.0], -5, 22, 26, 0.98)],
  [12.0, fit(ROWT, 0, 25, 24, 1.0)], [18.9, fit(ROWT, 0.5, 25, 24, 0.98)],
  [20.8, fit([0.95, 2.1, 0, 2.15, 0.3, 0.7], 8, 18)], [23.4, fit([0.95, 2.1, 0, 2.15, 0.3, 0.7], 9, 18, 26, 0.98)],
  [26.6, fit([0.3, 2.1, 0, 2.7, 0.3, 0.7], 6, 20)], [28.9, fit([0.3, 2.1, 0, 2.7, 0.3, 0.7], 5, 20, 26, 0.98)],
  [30.4, fit([-2.15, 1.75, 0.2, 2.0, -2.9, -1.6], -3, 18)], [32.9, fit([-2.15, 1.75, 0.2, 2.0, -2.9, -1.6], -2, 18, 26, 0.98)],
  [34.8, fit([0.85, 2.2, 0, 2.15, 0.0, 1.45], 8, 22)], [37.6, fit([0.85, 2.2, 0, 2.15, 0.0, 1.45], 7, 22, 26, 0.98)], [39.3, fit([0.8, 2.25, 0, 1.0, 0.1, 1.5], 4, 24)], [43.2, fit([0.8, 2.25, 0, 1.0, 0.1, 1.5], 3, 24, 26, 0.98)],
  [45.0, fit([-0.65, 0.95, 0, 1.15, 0.0, 1.15], -2, 22)], [47.4, fit([-0.65, 0.95, 0, 1.15, 0.0, 1.15], -2, 22, 26, 0.98)],
  [49.3, fit([-1.85, 0.45, 0, 1.3, -2.1, 1.0], -4, 24)], [53.0, fit([-1.85, 0.45, 0, 1.3, -2.1, 1.0], -3, 24, 26, 0.98)],
  [54.3, fit(ROW, 0, 25, 24)], [56.8, fit(ROW, 0.5, 25, 24, 0.98)],
  [58.8, fit([1.2, 2.25, 0.35, 2.75, 0.0, 0.6], -8, 20)], [62.2, fit([1.2, 2.25, 0.35, 2.75, 0.0, 0.6], -8, 20, 26, 0.98)], [66.4, fit([0.4, 2.2, 0, 2.75, 0.0, 1.0], -2, 22)],
  [69.2, fit(ROW, 0, 25, 24)], [73.3, fit(ROW, 0, 25, 24, 0.99)],
  [74.5, fit([LX0 - 0.08, LX1 + 0.08, 0, 0.62, LZ - 0.1, LZ + 0.1], 0, 7, 26, 1.0)], [END_V, fit([LX0 - 0.08, LX1 + 0.08, 0, 0.62, LZ - 0.1, LZ + 0.1], 0, 7, 26, 0.94)]];
const KT = KEYS.map(k => k[0]), KV = KEYS.map(k => k[1]);
const KM = [0, 1, 2, 3, 4, 5, 6].map(j => {const n = KT.length, d = [], tg = new Array(n).fill(0); for (let i = 0; i < n - 1; i++) d.push((KV[i + 1][j] - KV[i][j]) / (KT[i + 1] - KT[i]));
  for (let i = 1; i < n - 1; i++) {if (d[i - 1] * d[i] <= 0) continue; const h0 = KT[i] - KT[i - 1], h1 = KT[i + 1] - KT[i], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; tg[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);} return tg;});
function camAt(t) {let i = 0; while (i < KT.length - 2 && t > KT[i + 1]) i++; const h = KT[i + 1] - KT[i], u = clamp((t - KT[i]) / h, 0, 1), u2 = u * u, u3 = u2 * u;
  const a = 2 * u3 - 3 * u2 + 1, b = u3 - 2 * u2 + u, c = -2 * u3 + 3 * u2, e = u3 - u2; return [0, 1, 2, 3, 4, 5, 6].map(j => a * KV[i][j] + b * h * KM[j][i] + c * KV[i + 1][j] + e * h * KM[j][i + 1]);}
const CAMT = new THREE.Vector3();
const CAMQ = new URLSearchParams(location.search).get('cam');
const COVERQ = new URLSearchParams(location.search).get('cover'), COVER_S = +(new URLSearchParams(location.search).get('cs') || 1.22);
function setCam(t) {const v = CAMQ ? (q => [q[0], q[1], q[2], Math.log(q[3]), q[4], q[5], q[6] || 26])(CAMQ.split(',').map(Number)) : COVERQ ? (w => {w[3] += Math.log(COVER_S); return w;})(camAt(56)) : camAt(t), size = Math.exp(v[3]); const az = (v[4] + 0.15 * Math.sin(t * 0.17)) * Math.PI / 180, el = (v[5] + 0.08 * Math.sin(t * 0.23 + 0.7)) * Math.PI / 180;
  CAMT.set(v[0], v[1], v[2]); const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  cam.fov = v[6]; const d = size / Math.tan(v[6] / 2 * Math.PI / 180); cam.position.copy(CAMT).addScaledVector(dir, d); cam.near = Math.max(0.05, d * 0.2); cam.far = d + 20;
  cam.lookAt(CAMT); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return size;}

// ------------------------------------------------------------------ text: subtitles, big numbers, titles (channel look), labels on the model
const SUBS = [[0.13, 2.98, 'Die reichsten zehn Prozent besitzen mehr als die Hälfte'], [3.02, 5.85, 'von allem, was den Haushalten in Deutschland gehört.'], [6.1, 7.45, 'Und die ärmere Hälfte?'],
  [7.7, 10.1, 'Zusammen nur zwei bis drei Prozent.'], [10.28, 12.28, 'Stell dir vor, hundert Münzen sind alles,'], [12.3, 14.76, 'was die Haushalte in Deutschland besitzen.'],
  [14.78, 17.5, 'Jede Figur steht für ein Zehntel der Haushalte,'], [17.52, 18.98, 'von arm bis reich.'], [19.0, 21.82, 'Die rote Figur, also die reichsten zehn Prozent,'], [21.85, 23.56, 'hat 54 Münzen.'],
  [23.58, 27.16, 'Rechnet man die Superreichen dazu, die bei Umfragen kaum mitmachen,'], [27.18, 28.97, 'sind es sogar rund 60.'], [28.99, 32.92, 'Ihr Vermögen steckt vor allem in Firmen, Mietshäusern und Aktien.'],
  [33.0, 35.35, 'Aber ab wann gehört man eigentlich dazu?'], [35.55, 39.12, 'Ab rund 780.000 Euro Vermögen pro Haushalt.'], [39.15, 41.26, 'Also Haus, Erspartes und Aktien'], [41.27, 43.46, 'zusammengerechnet, minus Schulden.'],
  [43.56, 47.47, 'Die Hälfte der Haushalte hat dagegen weniger als 103.000 Euro.'], [47.5, 50.68, 'Ein großer Grund: Mehr als die Hälfte wohnt zur Miete,'], [50.7, 53.38, 'so viele wie in keinem anderen Land der EU.'],
  [53.4, 56.92, 'Und die Miete fließt jeden Monat an die, denen die Häuser gehören.'], [57.05, 60.34, 'Dazu wird viel Vermögen nicht verdient, sondern vererbt.'], [60.5, 63.74, 'Allein 2024 wurden über 113 Milliarden Euro'],
  [63.76, 66.22, 'vererbt und verschenkt.'], [66.4, 68.95, 'Und das ist nur der Teil, den das Finanzamt erfasst.'], [69.1, 71.05, 'Und du? Welche Figur bist du?'], [71.35, 73.3, 'Schreib deine Nummer in die Kommentare.']];
const NUMS = [[1.85, 6.05, 'COUNT', 'besitzen die reichsten 10 % der Haushalte'], [7.8, 10.25, '2–3 %', 'besitzt die ärmere Hälfte zusammen'],
  [27.84, 30.35, '≈ 60 %', 'mit den Superreichen, die in Umfragen fehlen'], [35.92, 39.15, '780.000 €', 'Vermögen pro Haushalt: ab hier gehört man zu den reichsten 10 %'],
  [45.9, 47.5, '< 103.000 €', 'hat die Hälfte der Haushalte (Median)'], [50.08, 53.4, '58 %', 'der Haushalte wohnen zur Miete, mehr als in jedem anderen EU-Land'],
  [62.88, 66.3, '113 Mrd. €', 'wurden 2024 vererbt und verschenkt']];
const TITLES = [[-0.5, 1.85, 'Wem gehört eigentlich<br>Deutschland?'], [6.05, 7.8, 'Und die ärmere<br>Hälfte?'], [10.25, 14.76, '100 Münzen = alles,<br>was Haushalte besitzen'],
  [14.76, 19.0, '1 Figur = 10 %<br>der Haushalte'], [19.0, 23.56, 'Rot: die reichsten<br>10 %'], [23.56, 27.84, 'Plus die<br>Superreichen'], [30.35, 33.0, 'Firmen, Mietshäuser,<br>Aktien'],
  [33.0, 35.92, 'Ab wann gehört<br>man dazu?'], [39.15, 43.5, 'Haus + Erspartes<br>+ Aktien − Schulden'], [43.5, 45.9, 'Und die Mitte?'], [47.5, 50.08, 'Ein großer Grund:<br>die Miete'],
  [53.4, 57.05, 'Die Miete fließt<br>zu den Eigentümern'], [57.05, 62.88, 'Verdient oder<br>vererbt?'], [66.3, 69.05, 'Nur, was das<br>Finanzamt sieht'], [69.05, OUT0, 'Welche Figur<br>bist du?']];
const SRC = 'Quellen: Deutsche Bundesbank (Vermögensbefragung 2023), IW Köln, Statistisches Bundesamt, Eurostat\nStand 21.11.2026 · Modell vereinfacht';
const $ = id => document.getElementById(id);
const titleEl = $('title'), numEl = $('num'), subEl = $('sub'), srcEl = $('src'), logoEl = $('logo'), fadeEl = $('fade'), shadeEl = $('shade');
srcEl.innerHTML = SRC.replace('\n', '<br>');
const lab = $('lab').getContext('2d'), endc = $('end').getContext('2d');
const _v = new THREE.Vector3();
const P2 = (x, y, z) => {_v.set(x, y, z).project(cam); return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H];};
const PILLS = [];
function pill(txt, cx, cy, col, a, bg = 'rgba(255,255,255,0.96)') {if (a <= 0.001) return; lab.save(); lab.globalAlpha = a; lab.font = '800 36px "Inter Tight"'; const w = lab.measureText(txt).width + 48;
  const x = clamp(cx - w / 2, 40, W - 40 - w); lab.fillStyle = bg; lab.shadowColor = 'rgba(0,0,0,0.35)'; lab.shadowBlur = 12; lab.beginPath(); lab.roundRect(x, cy - 27, w, 54, 27); lab.fill(); lab.shadowBlur = 0;
  lab.fillStyle = col; lab.textAlign = 'center'; lab.textBaseline = 'middle'; lab.fillText(txt, x + w / 2, cy + 2); lab.restore(); PILLS.push([txt, x, cy - 27, w, 54, cx]);}
function bracket(i0, i1, a, z = 1.12, col = '#ffffff') {if (a <= 0.001) return null; const p0 = P2(XF(i0) - 0.15, 0, z), p1 = P2(XF(i1) + 0.15, 0, z); const u = eo(a);
  lab.save(); lab.globalAlpha = Math.min(1, a * 1.5); lab.strokeStyle = col; lab.lineWidth = 5; lab.lineCap = 'round'; lab.lineJoin = 'round'; const xm = (p0[0] + p1[0]) / 2, y = (p0[1] + p1[1]) / 2 + 6;
  lab.beginPath(); lab.moveTo(xm - (xm - p0[0]) * u, y - 18); lab.lineTo(xm - (xm - p0[0]) * u, y); lab.lineTo(xm + (p1[0] - xm) * u, y); lab.lineTo(xm + (p1[0] - xm) * u, y - 18); lab.stroke(); lab.restore(); return [xm, y + 44];}
function bracketTop(i0, i1, a, y = 0.86) {if (a <= 0.001) return null; const p0 = P2(XF(i0) - 0.15, y, ZF), p1 = P2(XF(i1) + 0.15, y, ZF); const u = eo(a);
  lab.save(); lab.globalAlpha = Math.min(1, a * 1.5); lab.strokeStyle = '#ffffff'; lab.lineWidth = 5; lab.lineCap = 'round'; lab.lineJoin = 'round'; const xm = (p0[0] + p1[0]) / 2, yy = (p0[1] + p1[1]) / 2 - 6;
  lab.beginPath(); lab.moveTo(xm - (xm - p0[0]) * u, yy + 18); lab.lineTo(xm - (xm - p0[0]) * u, yy); lab.lineTo(xm + (p1[0] - xm) * u, yy); lab.lineTo(xm + (p1[0] - xm) * u, yy + 18); lab.stroke(); lab.restore(); return [xm, yy - 44];}
function overlay(t) {
  lab.clearRect(0, 0, W, H); PILLS.length = 0;
  const s = SUBS.find(q => t >= q[0] && t < q[1]); subEl.textContent = s ? s[2] : ''; subEl.style.opacity = s ? Math.min(1, (t - s[0]) / 0.18 + 0.15) : 0; subEl.style.transform = s ? `translateY(${(1 - eo((t - s[0]) / 0.3)) * 8}px)` : 'none';
  const nm = NUMS.find(q => t >= q[0] && t < q[1]); let nop = 0;
  if (nm) {let big = nm[2]; if (big === 'COUNT') {let n = 0; for (const c of COINS) {const r = restOf(c, t); if (r && r.col === 9) n++;} big = Math.min(54, n) + ' %';}
    numEl.innerHTML = big + '<small>' + nm[3] + '</small>'; nop = Math.min(clamp((t - nm[0]) / 0.2, 0, 1), clamp((nm[1] - t) / 0.2, 0, 1)); const pi = eo((t - nm[0]) / 0.45); numEl.style.transform = `translateY(${(1 - pi) * 20}px) scale(${1 + 0.05 * (1 - pi)})`; numEl.style.transformOrigin = '0 0';}
  numEl.style.opacity = nop; numEl.style.filter = `blur(${(1 - Math.min(1, nm ? (t - nm[0]) / 0.3 : 1)) * 6}px)`;
  const tt = TITLES.find(q => t >= q[0] && t < q[1]);
  if (tt) {titleEl.innerHTML = tt[2]; const ti = t < 0.05 ? 1 : eo((t - tt[0]) / 0.4), to = clamp((tt[1] - t) / 0.25, 0, 1); titleEl.style.opacity = Math.min(ti, to) * (1 - nop); titleEl.style.transform = `translateY(${(1 - ti) * 18 - (1 - to) * 8}px)`; titleEl.style.filter = `blur(${(1 - ti) * 5}px)`;}
  else titleEl.style.opacity = 0;
  const outA = clamp((OUT0 + 0.3 - t) / 0.3, 0, 1); srcEl.style.opacity = 0.95 * outA; logoEl.style.opacity = outA; $('subw').style.opacity = outA;
  // labels on the model
  const under = i => P2(XF(i), 0, 1.12)[1] + 44;
  {const p = P2(XF(9), 0, ZF + 0.3); pill('Reichste 10 %', p[0], p[1] + 36, '#E01E2B', win(t, 0.55, 6.0, 0.3));}
  {const a = win(t, 6.55, 10.3, 0.35); const b = bracket(0, 4, clamp((t - 6.55) / 0.45, 0, 1) * clamp((10.3 - t) / 0.35, 0, 1), ZF + 0.3); if (b) pill('Ärmere Hälfte', b[0], b[1], '#17171c', a);}
  pill('arm', P2(XF(0), 0, 1.12)[0], under(0), '#17171c', win(t, 17.72, 19.5, 0.25)); pill('reich', P2(XF(9), 0, 1.12)[0], under(9), '#E01E2B', win(t, 18.22, 19.5, 0.25));
  const topY = n => CH * n + 0.2;
  pill('54 Münzen', P2(COLX(9), topY(54), COLZ)[0], P2(COLX(9), topY(54), COLZ)[1] - 30, '#17171c', win(t, 22.1, 23.7, 0.25));
  pill('60 Münzen', P2(COLX(9), topY(60), COLZ)[0], P2(COLX(9), topY(60), COLZ)[1] - 30, '#17171c', win(t, 28.15, 29.5, 0.25));
  for (const [k, txt, t0] of [['fab', 'Firmen', 30.6], ['a1', 'Mietshäuser', 31.2], ['boerse', 'Aktien', 32.0]]) {const r = TOWN[k]; const p = P2(r.o.x, r.top + 0.62, r.o.z); pill(txt, p[0], p[1], '#17171c', win(t, t0, 33.2, 0.25));}
  {const a = win(t, 49.6, 53.5, 0.35); const b = bracketTop(0, 5, clamp((t - 49.6) / 0.45, 0, 1) * clamp((53.5 - t) / 0.35, 0, 1)); if (b) pill('Wohnen zur Miete', b[0], b[1], '#17171c', a);}
  {const p = P2(COLX(9), CH * 70, COLZ); pill('Erbe', p[0] - 105, p[1], '#E01E2B', win(t, 60.25, 62.9, 0.25));}
}

// ------------------------------------------------------------------ outro (Wunsch des Nutzers beim 2027-Video): das rote „function.“ zwei Sekunden mittig auf dunklem Grund
function drawEnd(t) {fadeEl.style.opacity = '0';}

// ------------------------------------------------------------------ per-frame state
function setTime(t) {
  const size = setCam(t);
  // light: the place we look at is always lit; the rest dims a little while we talk about the poorer half
  const dim = 1 - 0.34 * win(t, 6.35, 10.25, 0.5);
  key.intensity = 2.0 * dim; hemi.intensity = 0.85 * (0.55 + 0.45 * dim); scene.environmentIntensity = 0.4 * dim;
  focus.position.set(CAMT.x + 0.6, CAMT.y + 3.2, CAMT.z + 1.8); focus.target.position.copy(CAMT); focus.target.updateMatrixWorld(); focus.intensity = 6 + 16 * (1 - dim);
  focus.angle = clamp(0.22 + size * 0.07, 0.25, 0.5);
  // figures: the red one hops when it is named; everyone breathes a little
  for (const F of FIG) {const ph = F.i * 1.7; let hop = 0, sq = 1; if (F.i === 9) {const p = clamp((t - 0.28) / 0.42, 0, 1); hop = 0.13 * Math.sin(Math.PI * p); const l = t - 0.7; if (l > 0 && l < 0.22) sq = 1 - 0.12 * Math.sin(Math.PI * l / 0.22);}
    if (F.i < 6) {const p = clamp((t - 53.55 - F.i * 0.1) / 0.36, 0, 1); hop = Math.max(hop, 0.05 * Math.sin(Math.PI * p));}
    F.B.position.y = hop; F.B.scale.set(1 + (1 - sq) * 0.6, sq * (1 + 0.012 * Math.sin(t * 2.1 + ph)), 1 + (1 - sq) * 0.6); F.B.rotation.y = 0.05 * Math.sin(t * 0.45 + ph);}
  // number tiles pop in from left to right; in the end they light up one after another
  TILE.forEach((T, i) => {const p = clamp((t - 15.3 - i * 0.2) / 0.32, 0, 1); T.m.visible = p > 0; T.m.scale.setScalar(Math.max(1e-3, ebk(p, 2))); T.top.emissiveIntensity = 0.55 * win(t, 69.9 + i * 0.09, 70.55 + i * 0.09, 0.18);});
  // coins
  coinSideM.emissiveIntensity = coinTopM.emissiveIntensity = 0.35 * win(t, 11.5, 12.7, 0.4);
  for (const c of COINS) {const s = coinAt(c, t); c.m.visible = s.vis; c.m.position.set(s.p[0], s.p[1], s.p[2]); c.m.rotation.set(s.rx, c.ry, 0); const sy = s.sy || 1; c.m.scale.set(s.sc, s.sc * sy, s.sc);}
  GHOSTS.forEach((g, j) => {const land = 27.25 + j * 0.21 + 0.75; const a = clamp((t - GHOST_T - j * 0.06) / 0.3, 0, 1) * clamp((land - t) / 0.08, 0, 1); g.visible = a > 0.001; g.material.opacity = (0.55 + 0.2 * Math.sin(t * 6 + j)) * a;});
  {const top = CH * 66; const u = clamp((t - GIFT_T0) / (GIFT_T1 - GIFT_T0), 0, 1); GIFT.visible = t >= GIFT_T0; const y = lerp(top + 3.4, top, eo(u)); GIFT.position.set(COLX(9), y, COLZ);
    const l = t - GIFT_T1; GIFT.scale.set(1, l > 0 && l < 0.2 ? 1 - 0.1 * Math.sin(Math.PI * l / 0.2) : 1, 1); GIFT.rotation.y = 0.6 * (1 - eo(u));}
  // signs and dashed lines
  for (const S of SIGNS) {const p = clamp((t - S.t0) / 0.4, 0, 1); S.G.visible = p > 0; S.G.scale.setScalar(Math.max(1e-3, ebk(p, 1.8)));
    S.dashes.forEach((d, k) => {const q = clamp((t - S.t0 - 0.15 - k * 0.045) / 0.18, 0, 1); d.visible = q > 0; d.scale.set(1, 1, Math.max(1e-3, ebk(q, 1.5)));});}
  // props
  PROPS.forEach((P, k) => {const p = clamp((t - P.t0) / 0.38, 0, 1), o = clamp((t - PROPS_OUT - k * 0.08) / 0.3, 0, 1); const s = ebk(p, 1.8) * (1 - ei(o)); P.G.visible = s > 0.002; P.G.scale.setScalar(Math.max(1e-3, s));});
  // flags pop up on what the richest own: firms, rental blocks, shares
  const FL = [['fab', 30.62], ['a2', 31.2], ['a3', 31.32], ['a1', 31.44], ['boerse', 32.04]];
  for (const [k, t0] of FL) {const F = TOWN[k].F; const p = clamp((t - t0) / 0.42, 0, 1); F.visible = p > 0; F.scale.setScalar(Math.max(1e-3, ebk(p, 2.2) * F.userData.sc)); F.userData.cloth.rotation.y = -0.5 + 0.12 * Math.sin(t * 3 + t0);}
  // factory smoke, ticker, trees
  for (const r of BLD) if (r.G.userData.puffs) for (const pf of r.G.userData.puffs) {const ph = (t * 0.22 + pf.k / 3) % 1; pf.p.position.set(pf.x + 0.06 * ph, pf.y + 0.4 * ph, -0.15 - 0.03 * ph); pf.p.scale.setScalar(Math.max(1e-3, (0.55 + 0.7 * ph) * Math.sin(Math.PI * Math.min(1, ph * 1.15))));}
  TOWN.ticker.offset.x = t * 0.03;
  TREES.forEach((T, i) => {T.rotation.z = 0.025 * Math.sin(t * 0.9 + i);});
  for (const sp of SPARKS) {const ph = (t * 0.45 + sp.ph) % 1, a = ph < 0.16 ? Math.sin(Math.PI * ph / 0.16) : 0; sp.m.visible = a > 0.01; sp.m.scale.setScalar(0.075 * a + 1e-3); sp.m.material.rotation = t * 1.5 + sp.ph * 6; sp.m.material.opacity = a;}
  // outro: lights go down except on the logo, the clay letters pop up one by one, the red figure squashes into a ball that hops onto the dot
  {const o = eio((t - OUT0) / 0.7); key.intensity *= 1 - 0.55 * o; hemi.intensity *= 1 - 0.6 * o; scene.environmentIntensity *= 1 - 0.6 * o; rim.intensity = 0.7 * (1 - 0.5 * o); focus.intensity *= 1 - o;
    LOGO.forEach((m, i) => {const p = clamp((t - LOGO_T0 - i * 0.07) / 0.36, 0, 1); m.visible = p > 0; const sy = Math.max(1e-3, ebk(p, 2.2)); m.scale.set(1 + 0.25 * (1 - p) * p * 4, sy, 1);});
    const F = FIG[9]; const q = clamp((t - BALL_T.squash) / (BALL_T.morph - BALL_T.squash), 0, 1), mo = clamp((t - BALL_T.morph) / 0.15, 0, 1);
    if (t >= BALL_T.squash) {const k = 1 - mo; F.B.scale.set((1 + 0.15 * ease(q)) * k + 1e-3, (1 - 0.25 * ease(q)) * k + 1e-3, (1 + 0.15 * ease(q)) * k + 1e-3); F.B.position.y = 0.3 * mo; F.G.visible = mo < 1;}
    else F.G.visible = true;
    BALL.visible = t >= BALL_T.morph; if (BALL.visible) {const u = clamp((t - BALL_T.fly) / (BALL_T.land - BALL_T.fly), 0, 1), r0 = 0.1, r = lerp(r0, DOT.r, ease(u));
      const a = [XF(9), 0.3, ZF], b = [DOT.x, DOT.r * 0.92, LZ]; const y = lerp(a[1], b[1], u) + 0.55 * Math.sin(Math.PI * u);
      BALL.position.set(lerp(a[0], b[0], ease(u)), t < BALL_T.fly ? 0.3 : y, lerp(a[2], b[2], ease(u))); const l = t - BALL_T.land;
      const sq = l > 0 && l < 0.24 ? 1 - 0.35 * Math.sin(Math.PI * l / 0.24) * Math.exp(-l * 4) : 1; const g = t < BALL_T.fly ? r0 * eo(mo) : r;
      BALL.scale.set(g * (2 - sq), g * sq * 0.92, g * (2 - sq)); if (l > 0) BALL.position.y = DOT.r * 0.92 * sq; BALL.rotation.set(u * 6, u * 2, 0);}}
  overlay(t); drawEnd(t);
}

// ------------------------------------------------------------------ render hooks and self check
window.TOTAL = Math.round((END_V + VO) * 30);
function drawAt(tv) {setTime(tv); renderer.render(scene, cam);}
window.renderFrame = f => drawAt(f / 30 - VO);
window.setT = tv => drawAt(tv);
// coins in flight must not touch figures, other columns, signs or each other; resting stacks must have no gaps
const _e = new THREE.Euler(), _n = new THREE.Vector3(), _n2 = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _q = new THREE.Quaternion();
function discHit(A, B) {const axes = o => {_e.set(o.rx, o.ry, 0, 'YXZ'); _q.setFromEuler(_e); return [new THREE.Vector3(0, 1, 0).applyQuaternion(_q), new THREE.Vector3(1, 0, 0).applyQuaternion(_q), new THREE.Vector3(0, 0, 1).applyQuaternion(_q)];};
  const test = (P, Q) => {const [n, u, v] = axes(P), [nq] = axes(Q); const c = new THREE.Vector3(...P.p), cq = new THREE.Vector3(...Q.p);
    for (let k = 0; k < 40; k++) {const r = k < 32 ? CR : CR * 0.5, ang = (k % 32) / (k < 32 ? 32 : 8) * Math.PI * 2; for (const h of [-CH / 2, CH / 2]) {_a.copy(c).addScaledVector(u, Math.cos(ang) * r).addScaledVector(v, Math.sin(ang) * r).addScaledVector(n, h);
      _b.copy(_a).sub(cq); const d = _b.dot(nq); if (Math.abs(d) < CH / 2 && _b.addScaledVector(nq, -d).length() < CR) return true;}} return false;};
  return test(A, B) || test(B, A);}
window.CHECK = (step = 1 / 30) => {const bad = []; let minCC = 9;
  for (let t = 0; t <= END_V; t += step) {const fly = [];
    for (const c of COINS) {const s = coinAt(c, t); if (!s.fly) continue; fly.push({p: s.p, rx: s.rx, ry: c.ry}); const [x, y, z] = s.p; const seg = c.segs.find(q => t >= q.t0 && t < q.t0 + q.dur);
      for (let i = 0; i < 10; i++) if (Math.hypot(x - XF(i), z - ZF) < FIG_R + CR && y < FIG_TOP + CR) bad.push(['fig', +t.toFixed(2), i, +y.toFixed(2)]);
      for (let col = 0; col < 10; col++) {if (col === seg.col || (seg.a[0] === COLX(col) && seg.a[2] === COLZ)) continue; const n = restCount(col, t); if (n && Math.hypot(x - COLX(col), z - COLZ) < 2 * CR && y < CH * n + CR) bad.push(['col', +t.toFixed(2), col, +y.toFixed(2)]);}
      if (seg.col !== undefined) {const n = restCount(seg.col, t); if (Math.hypot(x - COLX(seg.col), z - COLZ) < 2 * CR && y < CH * n - 0.001) bad.push(['own', +t.toFixed(2), seg.col, n, +y.toFixed(3)]);}}
    for (let i = 0; i < fly.length; i++) for (let j = i + 1; j < fly.length; j++) {const d = Math.hypot(fly[i].p[0] - fly[j].p[0], fly[i].p[1] - fly[j].p[1], fly[i].p[2] - fly[j].p[2]); minCC = Math.min(minCC, d); if (d < 2 * CR && discHit(fly[i], fly[j])) bad.push(['cc', +t.toFixed(2), +d.toFixed(3)]);}
    for (let col = 0; col < 10; col++) {const sl = COINS.map(c => {const r = restOf(c, t); return r && r.col === col ? r.slot : -1;}).filter(v => v >= 0).sort((a, b) => a - b); sl.forEach((v, k) => {if (v !== k) bad.push(['gap', +t.toFixed(2), col, v, k]);});}}
  return {n: bad.length, minCC: +minCC.toFixed(3), bad: bad.slice(0, 40)};};
// labels must stay inside the picture and away from the subtitle band
window.CHECK_LABELS = (step = 0.1) => {const bad = []; for (let t = 0; t <= OUT0; t += step) {setTime(t); for (const p of PILLS) {if (p[1] < 36 || p[1] + p[3] > W - 36 || p[2] < 470 || p[2] + p[4] > 1400) bad.push([+t.toFixed(1), p[0], Math.round(p[1]), Math.round(p[2])]);}} return {n: bad.length, bad: bad.slice(0, 40)};};
window.DBGO = {THREE, scene, cam, COINS, FIG, TOWN, coinAt, discHit, TREE_SKIPPED};
// ---- channel cover look (like geldautomat/cover_atm_modern.html?mode=clean): dark #07070B, violet and red light, floor grid,
//      red light pool under the motif, soft glow over bright parts. Used by ?cover=1 for the clean thumbnail.
function coverBackground(CX, CY) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; c.style.position = 'absolute'; c.style.left = '0'; c.style.top = '0'; c.style.zIndex = '-1';
  document.body.insertBefore(c, document.body.firstChild); document.documentElement.style.background = '#07070B'; document.body.style.background = 'transparent';
  const bg = c.getContext('2d'), W2 = 1080, H2 = 1920; bg.fillStyle = '#07070B'; bg.fillRect(0, 0, W2, H2);
  const blob = (x, y, r, col) => {const g = bg.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); bg.fillStyle = g; bg.fillRect(0, 0, W2, H2);};
  blob(430, CY - 400, 760, 'rgba(96,78,255,0.34)'); blob(900, CY + 80, 620, 'rgba(224,30,43,0.20)'); blob(120, CY + 280, 500, 'rgba(60,40,200,0.16)');
  bg.save(); bg.strokeStyle = 'rgba(170,160,255,0.10)'; bg.lineWidth = 1.5; const hz = CY - 90;
  for (let i = -14; i <= 14; i++) {bg.beginPath(); bg.moveTo(CX + i * 26, hz); bg.lineTo(CX + i * 190, H2); bg.stroke();}
  for (let k = 0; k < 9; k++) {const y = hz + Math.pow(k / 8, 2.1) * (H2 - hz); bg.beginPath(); bg.moveTo(0, y); bg.lineTo(W2, y); bg.stroke();}
  const f = bg.createLinearGradient(0, hz - 10, 0, hz + 170); f.addColorStop(0, '#07070B'); f.addColorStop(1, 'rgba(7,7,11,0)'); bg.fillStyle = f; bg.fillRect(0, hz - 12, W2, 190);
  const f2 = bg.createLinearGradient(0, H2 - 220, 0, H2); f2.addColorStop(0, 'rgba(7,7,11,0)'); f2.addColorStop(1, 'rgba(7,7,11,.95)'); bg.fillStyle = f2; bg.fillRect(0, H2 - 220, W2, 220); bg.restore();
  bg.save(); bg.translate(CX, CY); bg.scale(1, 0.24); const g = bg.createRadialGradient(0, 0, 0, 0, 0, 520); g.addColorStop(0, 'rgba(224,30,43,0.55)'); g.addColorStop(.55, 'rgba(224,30,43,0.16)'); g.addColorStop(1, 'rgba(224,30,43,0)');
  bg.fillStyle = g; bg.beginPath(); bg.arc(0, 0, 520, 0, Math.PI * 2); bg.fill(); bg.restore();
  const v = bg.createLinearGradient(0, 0, 0, 700); v.addColorStop(0, 'rgba(7,7,11,.4)'); v.addColorStop(1, 'rgba(7,7,11,0)'); bg.fillStyle = v; bg.fillRect(0, 0, W2, 700);}
function coverGlow(src) {   // cheap bloom on top, keeps the transparent WebGL background
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; c.style.position = 'absolute'; c.style.left = '0'; c.style.top = '0'; c.style.pointerEvents = 'none'; document.body.appendChild(c);
  const g = c.getContext('2d'); g.globalCompositeOperation = 'lighter'; g.filter = 'blur(22px) brightness(1.1)'; g.globalAlpha = 0.2; g.drawImage(src, 0, 0);}
// ?cover=1: clean thumbnail in the channel cover look (the whole clay model in the middle, no text, safe for the 3:4 crop); &ct= time of the scene
if (COVERQ) {for (const id of ['ov', 'shade', 'lab', 'fade', 'end']) {const e = document.getElementById(id); if (e) e.style.display = 'none';}
  hemi.intensity = 0.55; hemi.groundColor.set(0x14080c);
  {const r1 = new THREE.DirectionalLight(0xff3344, 1.6); r1.position.set(4, 2.5, -3); scene.add(r1); const r2 = new THREE.DirectionalLight(0x8a78ff, 1.0); r2.position.set(-4, 2, -2); scene.add(r2);}
  drawAt(+(new URLSearchParams(location.search).get('ct') || 30));
  const box = new THREE.Box3(); for (const x of [-2.5, 2.5]) for (const z of [1.65 + 0.12]) box.expandByPoint(new THREE.Vector3(x, -0.25, z));
  const q = new THREE.Vector3(0, -0.25, 1.77).project(cam); coverBackground(540, (1 - q.y) / 2 * H - 30); coverGlow(renderer.domElement);
  window.renderFrame = () => {}; window.ready = true;}
else {drawAt(0); window.ready = true;}
