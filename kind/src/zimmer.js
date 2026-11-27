// „Was kostet ein Kind, bis es 18 ist?“ – Stiltest „Kinderzimmer, das mitwächst“ (27.11.2026, Wunsch des Nutzers: nicht im Knete-Look).
// Ein aufgeschnittenes Kinderzimmer (Puppenhaus-Schnitt: Boden, Rückwand mit Fenster, linke Wand). Dasselbe Zimmer in drei Altersstufen:
// a=0 Kleinkind (Gitterbett mit Mobile, Wickelkommode, Stillsessel, Spielteppich), a=1 Schulkind (Bett, Schreibtisch, Ranzen, Regal, Weltkarte),
// a=2 Teenager (Bett, Schreibtisch mit Monitor, Gaming-Stuhl, Gitarre, LED-Leiste). Der rote Teddy ist in jedem Alter dabei (roter Faden).
// An der Rückwand hängt eine Messlatte, auf der die Größe des Kindes markiert ist.
// Looks: s=1 helles Puppenhaus bei Tag, s=2 filmischer Abend mit Lampenlicht und Unschärfe, s=3 sonniger Morgen als Miniatur mit Tilt-Shift.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {HorizontalTiltShiftShader} from 'three/addons/shaders/HorizontalTiltShiftShader.js';
import {VerticalTiltShiftShader} from 'three/addons/shaders/VerticalTiltShiftShader.js';

const Q = new URLSearchParams(location.search), STYLE = +(Q.get('s') || 1), AGE = +(Q.get('a') || 0);
const W = 1080, H = 1920, PI = Math.PI, RED = 0xE01E2B;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u;
await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '800 96px "Inter Tight"'].map(f => document.fonts.load(f)));
let seed = 11; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------ renderer and helpers
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(26, W / H, 0.05, 80);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
const grp = (par, x = 0, y = 0, z = 0, ry = 0) => {const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); return g;};
const rb = (w, h, d, r = 0.02) => new RoundedBoxGeometry(w, h, d, 3, Math.max(0.0005, Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005)));
const M = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.72, ...o});
const tex = (w, h, draw, rep) => {const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) {t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);} return t;};
const noise = (w, amp, n = 4000) => {const t = tex(w, w, (g) => {g.fillStyle = '#808080'; g.fillRect(0, 0, w, w); for (let i = 0; i < n; i++) {const v = R() < 0.5 ? 255 : 0;
  g.fillStyle = `rgba(${v},${v},${v},${amp})`; g.fillRect(R() * w, R() * w, 1 + R() * 2, 1 + R() * 2);}}, [1, 1]); t.colorSpace = THREE.NoColorSpace; return t;};
const NZ = noise(256, 0.18), NZF = noise(512, 0.35, 30000);
const T2 = (g, s, x, y, font, col, align = 'center') => {g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y);};

// wood: planks with grain (floor) or a calm grain (furniture)
function woodTex(base, rows, seams = true, size = 1024) {return tex(size, size, (g, w, h) => {const c = new THREE.Color(base), rh = h / rows;
  for (let r = 0; r < rows; r++) {let x = -R() * 400; while (x < w) {const len = 300 + R() * 420, k = 0.9 + R() * 0.2, cc = c.clone().multiplyScalar(k);
      g.fillStyle = '#' + cc.getHexString(); g.fillRect(x, r * rh, len, rh);
      for (let i = 0; i < 14; i++) {const y0 = r * rh + R() * rh; g.strokeStyle = `rgba(70,40,20,${0.05 + R() * 0.07})`; g.lineWidth = 0.6 + R() * 1.6; g.beginPath();
        for (let xx = 0; xx <= len; xx += 20) g.lineTo(x + xx, y0 + Math.sin((xx + i * 37) / (60 + i * 7)) * 2.4); g.stroke();}
      if (seams) {g.fillStyle = 'rgba(60,35,20,0.45)'; g.fillRect(x, r * rh, 2, rh);} x += len;}
    if (seams) {g.fillStyle = 'rgba(60,35,20,0.4)'; g.fillRect(0, r * rh, w, 2);}}});}

// ------------------------------------------------------------------ looks
const LOOK = {
  1: {bg: 0xece6dd, cut: 0xf6f2ec, slab: 0xe2d9cc, exp: 1.0, env: 0.55, hemi: [0xffffff, 0xd8cfc4, 0.75], sun: [0xfff3e2, 3.2, 52], fill: 0.55, sky: 'day'},
  2: {bg: 0x0b0c12, cut: 0x24252e, slab: 0x1a1b22, exp: 1.25, env: 0.07, hemi: [0x8090c0, 0x201820, 0.16], sun: [0x8fa8ff, 0.7, 40], fill: 0.0, sky: 'night'},
  3: {bg: 0xf0e3d0, cut: 0xf7efe4, slab: 0xe6d6c0, exp: 0.98, env: 0.42, hemi: [0xffe8cc, 0xcdb79c, 0.62], sun: [0xffcf96, 4.0, 30], fill: 0.4, sky: 'morning'}}[STYLE];
renderer.toneMappingExposure = LOOK.exp; scene.background = new THREE.Color(LOOK.bg); scene.environmentIntensity = LOOK.env;
scene.add(new THREE.HemisphereLight(...LOOK.hemi));

// ------------------------------------------------------------------ the room (cut open like a dollhouse): floor, back wall with a window, left wall
const X0 = -1.7, X1 = 1.7, Z0 = -1.5, Z1 = 1.5, WH = 2.5, TK = 0.12, WX0 = 0.3, WX1 = 1.3, WY0 = 0.9, WY1 = 2.05;
const PAINT = [0xdde8d8, 0xd5e3ef, 0x6f7b8d][AGE];
const cutM = M(LOOK.cut, {roughness: 0.9}), slabM = M(LOOK.slab, {roughness: 0.9}), paintM = M(PAINT, {roughness: 0.92, bumpMap: NZ, bumpScale: 0.35});
const floorM = M(0xffffff, {map: woodTex(0xc99c6b, 16, true, 2048), roughness: 0.55, bumpMap: NZ, bumpScale: 0.2});
const ROOM = new THREE.Group(); scene.add(ROOM);
add(ROOM, new THREE.BoxGeometry(X1 - X0 + TK, 0.16, Z1 - Z0 + TK), [slabM, slabM, floorM, slabM, slabM, slabM], (X0 - TK + X1) / 2, -0.08, (Z0 - TK + Z1) / 2);
const wallBox = (x0, x1, y0, y1, z0, z1, inner) => {const mats = [cutM, cutM, cutM, cutM, cutM, cutM]; mats[inner] = paintM;
  return add(ROOM, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mats, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);};
wallBox(X0 - TK, WX0, 0, WH, Z0 - TK, Z0, 4); wallBox(WX1, X1, 0, WH, Z0 - TK, Z0, 4); wallBox(WX0, WX1, 0, WY0, Z0 - TK, Z0, 4); wallBox(WX0, WX1, WY1, WH, Z0 - TK, Z0, 4);
wallBox(X0 - TK, X0, 0, WH, Z0, Z1, 0);
// invisible right wall and ceiling: they only cast shadows, so the sun comes in through the window only
{const ghost = new THREE.MeshBasicMaterial({colorWrite: false, depthWrite: false});
  add(ROOM, new THREE.BoxGeometry(X1 - X0 + 0.4, 0.1, Z1 - Z0 + 0.4), ghost, 0, WH + 0.05, 0).receiveShadow = false;
  add(ROOM, new THREE.BoxGeometry(0.1, WH, Z1 - Z0 + 0.4), ghost, X1 + 0.05, WH / 2, 0).receiveShadow = false;}
const skirt = M(0xfbf8f3, {roughness: 0.6});
add(ROOM, rb(X1 - X0, 0.08, 0.018, 0.006), skirt, 0, 0.04, Z0 + 0.009); add(ROOM, rb(0.018, 0.08, Z1 - Z0, 0.006), skirt, X0 + 0.009, 0.04, 0);
// window: reveal, frame with a cross bar, glass, sill, curtains on a rod
{const fr = M(0xfdfbf7, {roughness: 0.45}), cx = (WX0 + WX1) / 2, cy = (WY0 + WY1) / 2, ww = WX1 - WX0, wh = WY1 - WY0, zf = Z0 - TK / 2;
  for (const [w, h, x, y] of [[ww, 0.06, cx, WY0 + 0.03], [ww, 0.06, cx, WY1 - 0.03], [0.06, wh, WX0 + 0.03, cy], [0.06, wh, WX1 - 0.03, cy], [0.045, wh, cx, cy], [ww, 0.045, cx, WY0 + wh * 0.72]])
    add(ROOM, rb(w, h, 0.07, 0.01), fr, x, y, zf);
  const gl = add(ROOM, new THREE.PlaneGeometry(ww - 0.1, wh - 0.1), new THREE.MeshStandardMaterial({color: 0xcfe2f0, roughness: 0.05, transparent: true, opacity: STYLE === 2 ? 0.18 : 0.1, depthWrite: false}), cx, cy, zf + 0.005, false);
  gl.receiveShadow = false;
  add(ROOM, rb(ww + 0.14, 0.04, 0.2, 0.012), fr, cx, WY0 - 0.02, Z0 + 0.06);
  const rod = M(0xd9d2c8, {roughness: 0.4, metalness: 0.3}); add(ROOM, new THREE.CylinderGeometry(0.012, 0.012, ww + 0.62, 12).rotateZ(PI / 2), rod, cx, WY1 + 0.2, Z0 + 0.13);
  for (const sx of [-1, 1]) add(ROOM, new THREE.SphereGeometry(0.022, 12, 10), rod, cx + sx * (ww / 2 + 0.31), WY1 + 0.2, Z0 + 0.13);
  const cur = M([0xf3e6d6, 0xf5e7a8, 0x3c4350][AGE], {roughness: 0.95, side: THREE.DoubleSide, bumpMap: NZF, bumpScale: 0.4});
  for (const sx of [-1, 1]) {const g = new THREE.PlaneGeometry(0.3, 1.62, 40, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.022 * Math.sin(p.getX(i) / 0.3 * PI * 7));
    g.computeVertexNormals(); add(ROOM, g, cur, cx + sx * (ww / 2 + 0.17), WY1 + 0.19 - 0.81, Z0 + 0.13);}}
// view outside: sky, and a tree in daylight
{const sky = tex(512, 512, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h);
    if (LOOK.sky === 'day') {gr.addColorStop(0, '#8ec2ea'); gr.addColorStop(0.7, '#cfe6f5'); gr.addColorStop(1, '#eaf3f6');}
    if (LOOK.sky === 'night') {gr.addColorStop(0, '#0b1330'); gr.addColorStop(0.7, '#1d2b55'); gr.addColorStop(1, '#3a3f6e');}
    if (LOOK.sky === 'morning') {gr.addColorStop(0, '#9cc3e6'); gr.addColorStop(0.55, '#f3d9b0'); gr.addColorStop(1, '#ffc98a');}
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (LOOK.sky === 'night') {for (let i = 0; i < 120; i++) {g.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.6})`; g.fillRect(R() * w, R() * h * 0.7, 1.4, 1.4);}
      g.fillStyle = '#fdf6dc'; g.beginPath(); g.arc(w * 0.62, h * 0.3, 26, 0, 7); g.fill();}
    else for (let i = 0; i < 7; i++) {const x = R() * w, y = h * (0.15 + R() * 0.4); g.fillStyle = 'rgba(255,255,255,0.55)'; for (let k = 0; k < 5; k++) {g.beginPath(); g.arc(x + k * 22, y + Math.sin(k) * 6, 18 + R() * 10, 0, 7); g.fill();}}});
  // the sky sits right behind the window, so it is only seen through the glass (never beside or above the room)
  const sp = add(scene, new THREE.PlaneGeometry(1.55, 1.6), new THREE.MeshBasicMaterial({map: sky, toneMapped: false}), 0.675, 1.4, Z0 - TK - 0.32, false); sp.receiveShadow = false;
  if (LOOK.sky !== 'night') {const lf = M(LOOK.sky === 'day' ? 0x7dbb6a : 0x9ab463, {roughness: 0.9});
    for (const [x, y, r] of [[1.12, 1.3, 0.2], [1.2, 1.7, 0.2], [0.9, 1.12, 0.16]]) add(scene, new THREE.IcosahedronGeometry(r, 2), lf, x, y, Z0 - TK - 0.24).scale.z = 0.25;}}
// growth chart on the back wall: ruler with the child's height marks (more marks with every age)
{const MX = -0.27, MH = 1.95; const marks = [[0.5, '1 J.'], [0.86, '2 J.'], [1.16, '6 J.'], [1.33, '9 J.'], [1.55, '12 J.'], [1.68, '15 J.']].slice(0, [2, 4, 6][AGE]);
  const t = tex(128, 2048, (g, w, h) => {g.fillStyle = '#f2dcb0'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(150,100,50,0.12)'; for (let i = 0; i < 30; i++) g.fillRect(0, R() * h, w, 1 + R() * 2);
    for (let cm = 0; cm <= MH * 100; cm += 5) {const y = h - (cm / (MH * 100)) * h; g.fillStyle = '#7a5a3a'; g.fillRect(0, y - 1, cm % 50 === 0 ? 46 : cm % 10 === 0 ? 30 : 16, 2);
      if (cm % 50 === 0 && cm > 0) T2(g, String(cm), 66, y + 2, '600 30px Poppins', '#7a5a3a');}
    for (const [m, l] of marks) {const y = h - (m - 0.1) / MH * h; g.fillStyle = '#3a3f6e'; g.fillRect(40, y - 2, 86, 4); T2(g, l, 92, y - 22, '600 26px Poppins', '#3a3f6e');}});
  add(ROOM, rb(0.09, MH, 0.015, 0.006), M(0xffffff, {map: t, roughness: 0.6}), MX, 0.1 + MH / 2, Z0 + 0.008);}
// socket and light switch
add(ROOM, rb(0.08, 0.08, 0.012, 0.01), M(0xfbfbf8, {roughness: 0.4}), 0.05, 0.3, Z0 + 0.006); add(ROOM, rb(0.08, 0.08, 0.012, 0.01), M(0xfbfbf8, {roughness: 0.4}), -1.5, 1.05, Z0 + 0.006);

// ------------------------------------------------------------------ people (smooth, slightly stylized; joints for posing)
const SKIN = 0xf1c8a6, HAIR = [0x9a6a44, 0x6b4a2e, 0x5a3c25][AGE];
const PROP = {toddler: {hip: 0.34, thigh: 0.15, shin: 0.15, foot: 0.04, torso: 0.25, sw: 0.18, hw: 0.05, limb: 0.036, upper: 0.12, fore: 0.11, head: 0.112, neck: 0.025, depth: 0.14},
  kid: {hip: 0.66, thigh: 0.3, shin: 0.3, foot: 0.06, torso: 0.39, sw: 0.25, hw: 0.068, limb: 0.042, upper: 0.21, fore: 0.19, head: 0.108, neck: 0.04, depth: 0.15},
  teen: {hip: 0.86, thigh: 0.4, shin: 0.4, foot: 0.06, torso: 0.52, sw: 0.33, hw: 0.085, limb: 0.05, upper: 0.29, fore: 0.26, head: 0.112, neck: 0.06, depth: 0.19}};
function human(par, x, z, ry, o) {const P = PROP[o.type], G = grp(par, x, 0, z, ry), HP = grp(G, 0, P.hip, 0);
  const skin = M(SKIN, {roughness: 0.6}), shirt = M(o.shirt, {roughness: 0.85, bumpMap: NZF, bumpScale: 0.15}), pants = M(o.pants, {roughness: 0.85, bumpMap: NZF, bumpScale: 0.15}),
    shoe = M(o.shoes, {roughness: 0.6}), sole = M(o.sole ?? 0xf4f2ee, {roughness: 0.7}), hair = M(HAIR, {roughness: 0.75});
  const legs = [-1, 1].map(s => {const L = grp(HP, s * P.hw, 0, 0); add(L, new THREE.SphereGeometry(P.limb * 1.18, 16, 12), pants);
    add(L, new THREE.CapsuleGeometry(P.limb * 1.15, P.thigh, 6, 16), pants, 0, -P.thigh / 2, 0);
    const K = grp(L, 0, -P.thigh, 0); add(K, new THREE.CapsuleGeometry(P.limb, P.shin, 6, 16), o.bareLegs ? skin : pants, 0, -P.shin / 2, 0);
    const F = grp(K, 0, -P.shin, 0); add(F, rb(P.limb * 2.3, P.foot, P.limb * 3.9, P.foot * 0.45), shoe, 0, -P.foot / 2, P.limb * 0.8);
    if (o.type !== 'toddler') add(F, rb(P.limb * 2.4, P.foot * 0.3, P.limb * 4.0, P.foot * 0.14), sole, 0, -P.foot * 0.86, P.limb * 0.8);
    return {L, K, F};});
  add(HP, new THREE.SphereGeometry(P.sw * 0.42, 20, 14), pants, 0, 0.01, 0).scale.set(1, 0.55, P.depth / (P.sw * 0.84));
  const TJ = grp(HP, 0, 0, 0);
  {const prof = [[0, 0.78], [0.1, 0.82], [0.35, 0.78], [0.6, 0.86], [0.82, 0.92], [0.93, 0.8], [0.985, 0.48], [1, 0.05]].map(([y, r]) => new THREE.Vector2(r * P.sw / 2, y * P.torso));
    const tm = add(TJ, new THREE.LatheGeometry(prof, 28), shirt, 0, 0, 0); tm.scale.z = P.depth / (P.sw * 0.92);
    if (o.belt) add(TJ, new THREE.CylinderGeometry(P.sw * 0.4, P.sw * 0.4, P.torso * 0.12, 24), pants, 0, P.torso * 0.04, 0).scale.z = P.depth / (P.sw * 0.84);}
  add(TJ, new THREE.CylinderGeometry(P.head * 0.32, P.head * 0.36, P.neck + 0.05, 14), skin, 0, P.torso + P.neck / 2 - 0.01, 0);
  const HJ = grp(TJ, 0, P.torso + P.neck + P.head * 0.92, 0), h = P.head;
  add(HJ, new THREE.SphereGeometry(h, 32, 24), skin).scale.set(1, 1.04, 0.97);
  const dark = M(0x2a2228, {roughness: 0.3}), white = new THREE.MeshBasicMaterial({color: 0xffffff});
  for (const s of [-1, 1]) {add(HJ, new THREE.SphereGeometry(h * 0.105, 14, 12), dark, s * h * 0.34, h * 0.03, h * 0.9, false).scale.set(1, 1.15, 0.6);
    add(HJ, new THREE.SphereGeometry(h * 0.032, 8, 6), white, s * h * 0.34 + h * 0.03, h * 0.07, h * 0.955, false);
    const eb = add(HJ, new THREE.CapsuleGeometry(h * 0.025, h * 0.12, 4, 8), hair, s * h * 0.35, h * 0.27, h * 0.9, false); eb.rotation.z = PI / 2 + s * 0.12;
    add(HJ, new THREE.SphereGeometry(h * 0.2, 14, 10), skin, s * h * 0.98, 0, 0).scale.set(0.45, 0.95, 0.75);
    const ch = add(HJ, new THREE.SphereGeometry(h * 0.13, 12, 10), M(0xf2998a, {transparent: true, opacity: 0.35, roughness: 0.8}), s * h * 0.56, -h * 0.2, h * 0.78, false); ch.scale.z = 0.4;}
  add(HJ, new THREE.SphereGeometry(h * 0.1, 12, 10), M(0xe9b393, {roughness: 0.6}), 0, -h * 0.12, h * 0.98, false);
  const mo = add(HJ, new THREE.TorusGeometry(h * 0.13, h * 0.022, 6, 16, PI * 0.8), M(0x8a3f3a, {roughness: 0.5}), 0, -h * 0.36, h * 0.92, false); mo.rotation.z = PI + PI * 0.1;
  // hair
  {const cap = add(HJ, new THREE.SphereGeometry(h * 1.05, 32, 18, 0, PI * 2, 0, PI * (o.type === 'toddler' ? 0.42 : 0.5)), hair, 0, h * 0.02, -h * 0.06); cap.rotation.x = -0.3;
    if (o.type === 'toddler') {const t = add(HJ, new THREE.TorusGeometry(h * 0.12, h * 0.04, 8, 14, PI * 1.3), hair, 0.0, h * 1.02, 0.02); t.rotation.y = PI / 2;}
    if (o.type === 'kid') {const f = add(HJ, new THREE.SphereGeometry(h * 0.62, 20, 12), hair, 0.0, h * 0.62, h * 0.42); f.scale.set(1.3, 0.42, 0.7); f.rotation.x = 0.3;}
    if (o.type === 'teen') {const f = add(HJ, new THREE.SphereGeometry(h * 0.6, 20, 12), hair, -h * 0.18, h * 0.66, h * 0.45); f.scale.set(1.45, 0.46, 0.75); f.rotation.set(0.35, 0, 0.22);
      const b = add(HJ, new THREE.SphereGeometry(h * 0.96, 24, 16), hair, 0, -h * 0.05, -h * 0.2); b.scale.set(1.02, 0.95, 0.9);
      for (const [x, y, z] of [[0.3, 0.95, 0.1], [-0.4, 0.9, -0.1], [0.05, 1.02, -0.3]]) add(HJ, new THREE.SphereGeometry(h * 0.28, 12, 10), hair, x * h, y * h, z * h);}}
  const arms = [-1, 1].map(s => {const S = grp(TJ, s * (P.sw / 2 - P.limb * 0.2), P.torso - P.limb * 1.7, 0); add(S, new THREE.SphereGeometry(P.limb * 1.1, 14, 12), shirt);
    add(S, new THREE.CapsuleGeometry(P.limb * 0.98, P.upper, 6, 14), shirt, 0, -P.upper / 2, 0); const E = grp(S, 0, -P.upper, 0);
    add(E, new THREE.CapsuleGeometry(P.limb * 0.86, P.fore, 6, 14), o.longSleeves ? shirt : skin, 0, -P.fore / 2, 0);
    if (o.longSleeves) add(E, new THREE.CylinderGeometry(P.limb * 0.95, P.limb * 0.95, 0.03, 14), M(new THREE.Color(o.shirt).multiplyScalar(0.85), {roughness: 0.9}), 0, -P.fore + 0.005, 0);
    const Hd = grp(E, 0, -P.fore, 0); add(Hd, new THREE.SphereGeometry(P.limb * 1.08, 14, 12), skin, 0, -P.limb * 0.4, 0).scale.set(0.9, 1.1, 0.75); S.rotation.z = s * 0.08; return {S, E, Hd};});
  return {G, HP, TJ, HJ, legs, arms, P};}

// the red teddy: the same in every age (red thread)
function teddy(par, x, y, z, s = 1, ry = 0) {const G = grp(par, x, y, z, ry); G.scale.setScalar(s); const m = M(RED, {roughness: 0.95, bumpMap: NZF, bumpScale: 0.6}),
    lt = M(0xf3b7a8, {roughness: 0.9}), dk = M(0x1d1416, {roughness: 0.3});
  add(G, new THREE.SphereGeometry(0.07, 20, 16), m, 0, 0.075, 0).scale.set(1, 1.12, 0.9); add(G, new THREE.SphereGeometry(0.04, 14, 12), lt, 0, 0.065, 0.05).scale.z = 0.45;
  add(G, new THREE.SphereGeometry(0.058, 20, 16), m, 0, 0.18, 0.005);
  for (const s2 of [-1, 1]) {add(G, new THREE.SphereGeometry(0.022, 12, 10), m, s2 * 0.042, 0.228, -0.005).scale.z = 0.6; add(G, new THREE.SphereGeometry(0.012, 10, 8), lt, s2 * 0.042, 0.228, 0.006).scale.z = 0.4;
    add(G, new THREE.SphereGeometry(0.008, 8, 6), dk, s2 * 0.022, 0.19, 0.052, false);
    const a = add(G, new THREE.CapsuleGeometry(0.019, 0.05, 4, 10), m, s2 * 0.072, 0.1, 0.01); a.rotation.z = s2 * 0.7;
    const l = add(G, new THREE.CapsuleGeometry(0.022, 0.04, 4, 10), m, s2 * 0.04, 0.02, 0.04); l.rotation.x = PI / 2 - 0.2;}
  add(G, new THREE.SphereGeometry(0.024, 12, 10), lt, 0, 0.17, 0.05).scale.z = 0.7; add(G, new THREE.SphereGeometry(0.009, 8, 6), dk, 0, 0.177, 0.07, false);
  return G;}

// ------------------------------------------------------------------ furniture
const wood = M(0xffffff, {map: woodTex(0xd8b48a, 14, false), roughness: 0.55}), white = M(0xf8f6f2, {roughness: 0.5}), metal = M(0x2b2d33, {roughness: 0.35, metalness: 0.6});
const fabric = (c) => M(c, {roughness: 0.95, bumpMap: NZF, bumpScale: 0.5});
function bed(par, blanket, pillowC, frameM) {const B = grp(par, -1.185, 0, -0.5); // along the left wall, head at the back wall
  add(B, rb(0.95, 0.24, 1.95, 0.03), frameM, 0, 0.17, 0); for (const [x, z] of [[-0.42, -0.92], [0.42, -0.92], [-0.42, 0.92], [0.42, 0.92]]) add(B, rb(0.06, 0.06, 0.06, 0.01), frameM, x, 0.03, z);
  add(B, rb(0.9, 0.16, 1.88, 0.05), fabric(0xf7f5f0), 0, 0.36, 0); add(B, rb(0.95, 0.82, 0.06, 0.03), frameM, 0, 0.45, -0.97);
  add(B, rb(0.56, 0.11, 0.34, 0.05), fabric(pillowC), 0, 0.49, -0.7); const bl = add(B, rb(0.96, 0.07, 1.3, 0.035), fabric(blanket), 0, 0.455, 0.29); bl.rotation.x = -0.012;
  add(B, rb(0.98, 0.2, 0.05, 0.02), fabric(blanket), 0, 0.37, 0.95).rotation.x = 0.05; return B;}
function shelf(par, items) {const S = grp(par, -1.51, 0, 0.95, PI / 2); const h = 1.45, w = 0.8, d = 0.3;   // along the left wall, front part; faces +x
  for (const sx of [-1, 1]) add(S, rb(0.025, h, d, 0.008), white, sx * w / 2, h / 2, 0); add(S, rb(w, h, 0.012, 0.004), white, 0, h / 2, -d / 2 + 0.006);
  [0.02, 0.37, 0.72, 1.07, 1.44].forEach(y => add(S, rb(w, 0.022, d, 0.006), white, 0, y, 0)); items(S, w, d); return S;}
function books(par, x0, y, n, cols, z = 0) {let x = x0; for (let i = 0; i < n; i++) {const bw = 0.03 + R() * 0.025, bh = 0.2 + R() * 0.09;
  const b = add(par, rb(bw, bh, 0.19, 0.004), M(cols[i % cols.length], {roughness: 0.7}), x + bw / 2, y + bh / 2 + 0.011, z); if (i === n - 1 && R() < 0.6) {b.rotation.z = -0.25; b.position.x += 0.03;} x += bw + 0.003;} return x;}
function desk(par) {const D = grp(par, 0.8, 0, -1.2); add(D, rb(1.0, 0.035, 0.56, 0.01), wood, 0, 0.735, 0);
  for (const [x, z] of [[-0.46, -0.24], [-0.46, 0.24], [0.46, -0.24], [0.46, 0.24]]) add(D, rb(0.035, 0.72, 0.035, 0.008), white, x, 0.36, z); return D;}
function lamp(par, x, y, z, ry, c = 0xf7f3ea) {const L = grp(par, x, y, z, ry); const m = M(c, {roughness: 0.4});
  add(L, new THREE.CylinderGeometry(0.06, 0.07, 0.02, 20), m, 0, 0.01, 0); const a = add(L, new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), m, 0, 0.17, 0); a.rotation.z = 0.25;
  const a2 = add(L, new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8), m, 0.1, 0.38, 0); a2.rotation.z = -1.1;
  const sh = add(L, new THREE.ConeGeometry(0.07, 0.11, 20, 1, true), M(c, {roughness: 0.4, side: THREE.DoubleSide}), 0.2, 0.39, 0); sh.rotation.z = 0.6;
  const bulb = add(L, new THREE.SphereGeometry(0.022, 12, 10), new THREE.MeshStandardMaterial({color: 0xfff1d0, emissive: 0xffd9a0, emissiveIntensity: STYLE === 2 ? 3 : 0.3}), 0.18, 0.36, 0, false);
  return {L, bulb};}
const LIGHTS = []; let BEAM = null;   // practical lights used in the evening look
function practical(par, x, y, z, c, I, dist = 3.2, shadow = false) {const p = new THREE.PointLight(c, STYLE === 2 ? I : 0, dist, 1.6); p.position.set(x, y, z); par.add(p);
  if (shadow && STYLE === 2) {p.castShadow = true; p.shadow.mapSize.set(1024, 1024); p.shadow.bias = -0.002; p.shadow.radius = 6;} LIGHTS.push(p); return p;}

// ------------------------------------------------------------------ the three ages
let KID, TARGET, OVER;
if (AGE === 0) {
  // crib along the left wall with a mobile, changing dresser, nursing chair under the window, round play rug, toys
  const C = grp(ROOM, -1.33, 0, -0.84); const cw = M(0xfbfaf6, {roughness: 0.5}), L = 1.2, Wd = 0.62, Hh = 0.95;
  for (const [x, z] of [[-Wd / 2, -L / 2], [Wd / 2, -L / 2], [-Wd / 2, L / 2], [Wd / 2, L / 2]]) add(C, rb(0.05, Hh, 0.05, 0.012), cw, x, Hh / 2, z);
  for (const y of [0.3, Hh - 0.02]) {add(C, rb(0.035, 0.035, L, 0.01), cw, -Wd / 2, y, 0); add(C, rb(0.035, 0.035, L, 0.01), cw, Wd / 2, y, 0); add(C, rb(Wd, 0.035, 0.035, 0.01), cw, 0, y, -L / 2); add(C, rb(Wd, 0.035, 0.035, 0.01), cw, 0, y, L / 2);}
  for (let i = 1; i < 14; i++) {const z = -L / 2 + i * L / 14; for (const x of [-Wd / 2, Wd / 2]) add(C, new THREE.CylinderGeometry(0.009, 0.009, Hh - 0.32, 8), cw, x, 0.3 + (Hh - 0.32) / 2, z);}
  for (let i = 1; i < 7; i++) {const x = -Wd / 2 + i * Wd / 7; for (const z of [-L / 2, L / 2]) add(C, new THREE.CylinderGeometry(0.009, 0.009, Hh - 0.32, 8), cw, x, 0.3 + (Hh - 0.32) / 2, z);}
  add(C, rb(Wd - 0.04, 0.1, L - 0.04, 0.03), fabric(0xf4f1ea), 0, 0.36, 0); add(C, rb(Wd - 0.06, 0.05, L * 0.55, 0.025), fabric(0xbfdcc8), 0, 0.43, 0.2);
  add(C, rb(0.34, 0.07, 0.2, 0.035), fabric(0xffffff), 0, 0.44, -0.42);
  // mobile
  // mobile: a pole on the front corner post, an arm over the middle of the crib, the ring hangs on a short string at its end
  {const arm = M(0xfbfaf6, {roughness: 0.5}), px = Wd / 2, pz = -L / 2 + 0.03, top = Hh + 0.55, ex = 0, ez = -0.2;
    add(C, new THREE.CylinderGeometry(0.012, 0.012, top - Hh + 0.02, 8), arm, px, (Hh + top) / 2, pz);
    const dx = ex - px, dz = ez - pz, len = Math.hypot(dx, dz), ar = add(C, new THREE.CylinderGeometry(0.01, 0.01, len, 8), arm, (px + ex) / 2, top, (pz + ez) / 2);
    ar.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(dx, 0, dz).normalize()); add(C, new THREE.SphereGeometry(0.014, 10, 8), arm, px, top, pz);
    add(C, new THREE.CylinderGeometry(0.0025, 0.0025, 0.08, 4), M(0xffffff), ex, top - 0.04, ez, false);
    const MB = grp(C, ex, top - 0.08, ez); add(MB, new THREE.TorusGeometry(0.17, 0.008, 6, 30), arm, 0, 0, 0).rotation.x = PI / 2;
    [[0xf7dd7c, 'star'], [0x9cc8f2, 'cloud'], [0xc4a8f0, 'moon'], [0x9fe0c6, 'star']].forEach(([c, k], i) => {const a = i * PI / 2 + 0.4, x = Math.cos(a) * 0.17, z = Math.sin(a) * 0.17, len = 0.12 + (i % 2) * 0.06;
      add(MB, new THREE.CylinderGeometry(0.0025, 0.0025, len, 4), M(0xffffff), x, -len / 2, z, false);
      const g = k === 'star' ? new THREE.OctahedronGeometry(0.045, 0) : k === 'moon' ? new THREE.TorusGeometry(0.035, 0.016, 8, 16, PI * 1.3) : new THREE.SphereGeometry(0.04, 12, 10);
      const o = add(MB, g, M(c, {roughness: 0.6}), x, -len - 0.04, z); if (k === 'cloud') o.scale.set(1.5, 0.8, 0.7); if (k === 'star') o.scale.z = 0.4;});}
  // changing dresser along the left wall, front
  {const Dd = grp(ROOM, -1.45, 0, 0.75); add(Dd, rb(0.48, 0.84, 0.9, 0.02), white, 0, 0.44, 0); for (let i = 0; i < 3; i++) {add(Dd, rb(0.012, 0.24, 0.84, 0.006), M(0xf2eee8, {roughness: 0.5}), 0.245, 0.17 + i * 0.27, 0);
      add(Dd, new THREE.SphereGeometry(0.018, 10, 8), M(0xd8b48a, {roughness: 0.4}), 0.26, 0.17 + i * 0.27, 0);}
    add(Dd, rb(0.46, 0.08, 0.72, 0.04), fabric(0xbfe3d0), 0, 0.9, 0.04); for (let i = 0; i < 4; i++) add(Dd, rb(0.13, 0.05, 0.11, 0.015), M(0xffffff, {roughness: 0.8}), -0.1, 0.885 + i * 0.05, -0.38);
    add(Dd, new THREE.CylinderGeometry(0.04, 0.045, 0.14, 16), M(0xf7dd7c, {roughness: 0.5}), 0.12, 0.93, -0.4);
    practical(Dd, 0.12, 1.08, -0.4, 0xffc27a, 1.8, 3.2, true);
    const nl = add(Dd, new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshStandardMaterial({color: 0xfff1d0, emissive: 0xffc27a, emissiveIntensity: STYLE === 2 ? 2.2 : 0.2}), 0.12, 1.05, -0.4, false); nl.scale.y = 0.8;}
  // nursing chair under the window
  {const Ch = grp(ROOM, 0.82, 0, -1.05, -0.25); const f = fabric(0xe9c46a);
    add(Ch, rb(0.72, 0.16, 0.6, 0.06), f, 0, 0.33, 0.05); add(Ch, rb(0.72, 0.6, 0.16, 0.07), f, 0, 0.66, -0.24); for (const s of [-1, 1]) add(Ch, rb(0.13, 0.3, 0.62, 0.06), f, s * 0.36, 0.47, 0.04);
    for (const [x, z] of [[-0.3, -0.22], [0.3, -0.22], [-0.3, 0.3], [0.3, 0.3]]) add(Ch, new THREE.CylinderGeometry(0.02, 0.014, 0.26, 8), wood, x, 0.13, z);
    add(Ch, rb(0.34, 0.26, 0.1, 0.05), fabric(0xf4f1ea), 0.1, 0.55, -0.12).rotation.x = -0.2;}
  // play rug and toys
  {const rg = add(ROOM, new THREE.CylinderGeometry(0.85, 0.85, 0.012, 64), M(0xffffff, {roughness: 0.95, map: tex(512, 512, (g, w, h) => {g.fillStyle = '#f4ede2'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#e2d2bd'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w * 0.44, 0, 7); g.stroke(); for (let i = 0; i < 40; i++) {g.fillStyle = ['#bfdcc8', '#f6d8a8', '#c9d8f0', '#e7cfee'][i % 4]; g.beginPath(); g.arc(R() * w, R() * h, 7 + R() * 6, 0, 7); g.fill();}}), bumpMap: NZF, bumpScale: 0.6}), 0.25, 0.006, 0.35, false);
    rg.receiveShadow = true;
    [[0.82, 0.07, 0.62, 0xf7dd7c, 0.3, 'A'], [0.96, 0.07, 0.68, 0x9cc8f2, -0.2, 'B'], [0.88, 0.19, 0.66, 0xc4a8f0, 0.6, 'C'], [0.66, 0.07, 0.8, 0x9fe0c6, 0.1, 'D']].forEach(([x, y, z, c, r, l]) => {
      const b = add(ROOM, rb(0.12, 0.12, 0.12, 0.012), [M(c), M(c), M(c), M(c), M(0xffffff, {map: tex(128, 128, (g, w, h) => {g.fillStyle = '#' + new THREE.Color(c).getHexString(); g.fillRect(0, 0, w, h); T2(g, l, w / 2, h / 2 + 4, '800 88px "Inter Tight"', '#ffffff');})}), M(c)], x, y, z); b.rotation.y = r;});
    {const T = grp(ROOM, -0.42, 0, 0.62); add(T, new THREE.CylinderGeometry(0.07, 0.075, 0.03, 20), wood, 0, 0.015, 0); add(T, new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), wood, 0, 0.15, 0);
      [0x9fe0c6, 0xf7dd7c, 0x9cc8f2, 0xc4a8f0].forEach((c, i) => add(T, new THREE.TorusGeometry(0.06 - i * 0.01, 0.022 - i * 0.002, 10, 24), M(c, {roughness: 0.5}), 0, 0.05 + i * 0.045, 0).rotation.x = PI / 2);}
    add(ROOM, new THREE.SphereGeometry(0.09, 24, 18), M(0xffffff, {roughness: 0.5, map: tex(256, 128, (g, w, h) => {['#9cc8f2', '#f7dd7c', '#9fe0c6', '#f6b38f'].forEach((c, i) => {g.fillStyle = c; g.fillRect(i * w / 4, 0, w / 4, h);});})}), 1.05, 0.09, 0.15);}
  // star decals over the crib
  {const st = M(0xf7dd7c, {roughness: 0.8}); for (const [x, y, s] of [[-1.55, 1.55, 1], [-1.3, 1.85, 0.7], [-1.0, 1.6, 0.85], [-0.75, 1.95, 0.6], [-1.15, 2.15, 0.7]]) add(ROOM, new THREE.OctahedronGeometry(0.045 * s, 0), st, x, y, Z0 + 0.012, false).scale.z = 0.2;}
  KID = human(ROOM, 0.18, 0.42, 0.45, {type: 'toddler', shirt: 0xf6d38a, pants: 0xf6d38a, shoes: 0xffffff});
  KID.HP.position.y = 0.045; for (const l of KID.legs) {l.L.rotation.x = -PI / 2 + 0.08; l.L.rotation.z = (l === KID.legs[0] ? -1 : 1) * 0.28;}
  for (const [i, s] of [[0, -1], [1, 1]]) {KID.arms[i].S.rotation.set(-0.95, 0, s * -0.3); KID.arms[i].E.rotation.x = -0.75;}
  teddy(KID.TJ, 0, 0.03, KID.P.depth / 2 + 0.05, 0.95, 0); KID.HJ.rotation.set(0.12, 0, 0.05);
  TARGET = V3(0.2, 0.35, 0.42); OVER = {title: 'Was kostet ein Kind<br>bis 18?', sub: 'Was kostet ein Kind, bis es 18 ist?'};
} else if (AGE === 1) {
  bed(ROOM, 0x7fb3e0, 0xffffff, wood);
  teddy(ROOM, -1.33, 0.5, -1.15, 1.0, 0.5);
  {const D = desk(ROOM); lamp(D, -0.38, 0.75, -0.12, 0.3);
    const gb = grp(D, 0.33, 0.75, -0.1); add(gb, new THREE.CylinderGeometry(0.05, 0.06, 0.02, 16), wood, 0, 0.01, 0); add(gb, new THREE.TorusGeometry(0.105, 0.006, 6, 30, PI), M(0xc9a650, {metalness: 0.5, roughness: 0.4}), 0, 0.13, 0).rotation.z = PI / 2 + 0.4;
    add(gb, new THREE.SphereGeometry(0.095, 24, 18), M(0xffffff, {roughness: 0.5, map: tex(256, 128, (g, w, h) => {g.fillStyle = '#5fa3d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#9fd18a';
      for (const [x, y, rx, ry] of [[0.2, 0.35, 0.08, 0.14], [0.28, 0.65, 0.05, 0.14], [0.52, 0.3, 0.06, 0.08], [0.55, 0.55, 0.06, 0.14], [0.72, 0.35, 0.12, 0.1], [0.85, 0.7, 0.05, 0.05]]) {g.beginPath(); g.ellipse(x * w, y * h, rx * w, ry * h, 0, 0, 7); g.fill();}})}), 0, 0.13, 0);
    books(D, -0.12, 0.735, 4, [0xf6b38f, 0x9fe0c6, 0x6f8fb0, 0xf7dd7c], 0.12); add(D, rb(0.3, 0.008, 0.22, 0.003), M(0xfbfaf6), 0.0, 0.757, 0.08).rotation.y = 0.15;
    const ch = grp(ROOM, 0.7, 0, -0.68, PI + 0.3); add(ch, rb(0.4, 0.04, 0.38, 0.012), wood, 0, 0.44, 0); add(ch, rb(0.4, 0.3, 0.03, 0.012), wood, 0, 0.66, -0.18);
    for (const [x, z] of [[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]]) add(ch, rb(0.03, 0.44, 0.03, 0.008), M(0x9cc8f2, {roughness: 0.5}), x, 0.22, z);
    practical(D, -0.2, 1.1, -0.05, 0xffc27a, 2.2, 3.4, true);}
  shelf(ROOM, (S, w, d) => {let x = books(S, -w / 2 + 0.03, 0.02, 9, [0xf6b38f, 0x9cc8f2, 0xf7dd7c, 0x9fe0c6, 0xc4a8f0, 0x6f8fb0]); books(S, -w / 2 + 0.03, 0.37, 6, [0x9fe0c6, 0xf7dd7c, 0x6f8fb0, 0xc4a8f0]);
    add(S, rb(0.18, 0.12, 0.14, 0.02), M(0x58b48c), 0.22, 0.44, 0.0); add(S, new THREE.SphereGeometry(0.045, 12, 10), M(0x58b48c), 0.3, 0.54, 0.0);   // a toy dino (simple)
    books(S, -0.1, 0.72, 5, [0xf6b38f, 0x9cc8f2, 0xf7dd7c]); add(S, rb(0.16, 0.07, 0.09, 0.02), M(0xf7dd7c, {roughness: 0.4}), -0.22, 1.11, 0.03);   // toy car
    for (const x of [-0.24, 0.24]) add(S, new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12).rotateX(PI / 2), metal, x * 0.25 - 0.22, 1.08, 0.08);});
  // world map poster over the bed
  {const t = tex(700, 460, (g, w, h) => {g.fillStyle = '#cfe6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#8fcf7e';
      for (const [x, y, rx, ry, r] of [[0.2, 0.33, 0.1, 0.13, 0.3], [0.27, 0.68, 0.05, 0.15, 0.2], [0.49, 0.28, 0.06, 0.07, 0], [0.52, 0.55, 0.07, 0.15, 0], [0.7, 0.32, 0.15, 0.11, 0], [0.82, 0.72, 0.06, 0.05, 0]]) {g.beginPath(); g.ellipse(x * w, y * h, rx * w, ry * h, r, 0, 7); g.fill();}
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; for (let i = 1; i < 6; i++) {g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke();}
      g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.strokeRect(0, 0, w, h);});
    add(ROOM, rb(0.7, 0.46, 0.012, 0.004), M(0xffffff, {map: t, roughness: 0.6}), -1.2, 1.55, Z0 + 0.008);}
  {const rg = add(ROOM, rb(1.5, 0.012, 1.0, 0.005), M(0xffffff, {roughness: 0.95, bumpMap: NZF, bumpScale: 0.5, map: tex(512, 340, (g, w, h) => {g.fillStyle = '#8fb6d8'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f4f1ea'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 4; for (let i = 0; i < 6; i++) {g.beginPath(); g.moveTo(40 + i * 80, 40); g.lineTo(40 + i * 80, h - 40); g.stroke();}})}), 0.45, 0.006, 0.45, false); rg.receiveShadow = true;}
  add(ROOM, new THREE.IcosahedronGeometry(0.1, 3), M(0xffffff, {roughness: 0.5, map: tex(256, 128, (g, w, h) => {g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2d33'; for (let i = 0; i < 12; i++) {g.beginPath(); g.arc(R() * w, R() * h, 12, 0, 7); g.fill();}})}), 1.05, 0.1, 0.75);
  KID = human(ROOM, 0.25, 0.3, 0.42, {type: 'kid', shirt: 0x5fb98a, pants: 0x46659a, shoes: 0x6f8fb0, sole: 0xffffff});
  {const bp = grp(KID.TJ, 0, KID.P.torso * 0.55, -KID.P.depth / 2 - 0.07); add(bp, rb(0.27, 0.3, 0.13, 0.04), M(0xf2b134, {roughness: 0.6}), 0, 0, 0);
    add(bp, rb(0.22, 0.12, 0.03, 0.02), M(0x3d6fa8, {roughness: 0.5}), 0, -0.05, 0.075); add(bp, rb(0.06, 0.02, 0.035, 0.008), M(0xdfe3ea, {metalness: 0.6, roughness: 0.3}), 0, 0.02, 0.09);
    for (const s of [-1, 1]) add(KID.TJ, rb(0.03, 0.28, 0.012, 0.006), M(0x3d6fa8), s * 0.07, KID.P.torso * 0.6, KID.P.depth / 2 + 0.006).rotation.x = 0.05;}
  KID.arms[0].S.rotation.set(-0.15, 0, -0.18); KID.arms[0].E.rotation.x = -0.25; KID.arms[1].S.rotation.set(0.1, 0, 0.2); KID.arms[1].E.rotation.x = -0.15;
  KID.HJ.rotation.set(0.0, 0.1, -0.04);
  TARGET = V3(0.25, 0.7, 0.3); OVER = {num: '≈ 785 €', small: 'im Monat für ein Kind von 6 bis 12 Jahren', sub: 'Für ein Schulkind fast 800.'};
} else {
  bed(ROOM, 0x4a5568, 0xd5d9e0, M(0x3b3f48, {roughness: 0.6}));
  {const D = desk(ROOM); const scr = tex(640, 380, (g, w, h) => {const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2b3a78'); gr.addColorStop(1, '#7a3fa0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 6; i++) g.fillRect(40, 60 + i * 44, 220 + R() * 300, 14); g.fillStyle = '#9fe0c6'; g.fillRect(40, 330, 160, 18);});
    add(D, rb(0.18, 0.012, 0.14, 0.004), metal, 0, 0.758, -0.12); add(D, rb(0.04, 0.24, 0.02, 0.006), metal, 0, 0.87, -0.15);
    add(D, rb(0.62, 0.37, 0.03, 0.01), M(0x15161a, {roughness: 0.3}), 0, 1.05, -0.13); add(D, new THREE.PlaneGeometry(0.59, 0.34), new THREE.MeshStandardMaterial({map: scr, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: STYLE === 2 ? 1.6 : 0.85}), 0, 1.05, -0.113, false);
    add(D, rb(0.42, 0.018, 0.13, 0.006), M(0x2b2d33, {roughness: 0.5}), -0.03, 0.76, 0.12); add(D, rb(0.06, 0.02, 0.1, 0.02), M(0x2b2d33, {roughness: 0.4}), 0.3, 0.76, 0.12);
    const hp = grp(D, -0.38, 0.75, 0.05); add(hp, new THREE.TorusGeometry(0.075, 0.012, 8, 20, PI), M(0x2b2d33), 0, 0.1, 0).rotation.y = 0.3;
    for (const s of [-1, 1]) add(hp, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16).rotateZ(PI / 2), M(0x9fe0c6), s * 0.072 * Math.cos(0.3), 0.1, -s * 0.072 * Math.sin(0.3));
    add(D, new THREE.CylinderGeometry(0.03, 0.03, 0.11, 16), M(0x58b48c, {metalness: 0.4, roughness: 0.3}), 0.42, 0.8, 0.0);
    practical(D, 0, 1.05, 0.15, 0x8a7dff, 1.4, 2.6, false); practical(D, -0.3, 1.25, 0.0, 0xffc27a, 1.4, 3.2, true);
    const ch = grp(ROOM, 0.75, 0, -0.62, PI + 0.5); const cm = M(0x2b2d33, {roughness: 0.5}); add(ch, rb(0.46, 0.08, 0.44, 0.03), cm, 0, 0.48, 0); add(ch, rb(0.44, 0.62, 0.07, 0.05), cm, 0, 0.85, -0.22);
    add(ch, rb(0.3, 0.42, 0.075, 0.04), M(0x9fe0c6, {roughness: 0.6}), 0, 0.86, -0.2); add(ch, new THREE.CylinderGeometry(0.025, 0.025, 0.3, 10), metal, 0, 0.3, 0);
    for (let i = 0; i < 5; i++) {const a = i * PI * 2 / 5; const l = add(ch, rb(0.26, 0.025, 0.035, 0.01), metal, Math.cos(a) * 0.13, 0.07, Math.sin(a) * 0.13); l.rotation.y = -a;
      add(ch, new THREE.SphereGeometry(0.025, 10, 8), cm, Math.cos(a) * 0.25, 0.025, Math.sin(a) * 0.25);}}
  shelf(ROOM, (S, w, d) => {books(S, -w / 2 + 0.03, 0.02, 7, [0x3b3f48, 0x6f7b8d, 0x9fe0c6, 0x2b2d33]); add(S, rb(0.2, 0.2, 0.2, 0.03), M(0x2b2d33, {roughness: 0.4}), 0.22, 0.48, 0);
    add(S, new THREE.CylinderGeometry(0.05, 0.04, 0.12, 16), M(0xf4f1ea), -0.2, 0.79, 0); for (let i = 0; i < 6; i++) {const l = add(S, new THREE.SphereGeometry(0.05, 10, 8), M(0x58b48c), -0.2 + Math.cos(i) * 0.05, 0.9 + (i % 3) * 0.03, Math.sin(i) * 0.05); l.scale.set(0.5, 1.3, 0.3); l.rotation.z = Math.cos(i) * 0.5;}
    books(S, 0.0, 0.72, 4, [0x6f7b8d, 0xc4a8f0, 0x3b3f48]); const tr = M(0xd4af37, {metalness: 0.7, roughness: 0.3}); add(S, new THREE.CylinderGeometry(0.035, 0.02, 0.08, 14), tr, 0.2, 1.13, 0); add(S, rb(0.06, 0.03, 0.06, 0.008), M(0x2b2d33), 0.2, 1.1, 0);
    const led = add(S, rb(w - 0.06, 0.012, 0.012, 0.004), new THREE.MeshStandardMaterial({color: 0xb38cff, emissive: 0xa070ff, emissiveIntensity: STYLE === 2 ? 3 : 1.0}), 0, 1.425, d / 2 - 0.02, false);});
  practical(ROOM, -1.3, 1.25, 0.95, 0xa070ff, 1.0, 2.0, false);
  teddy(ROOM, -1.5, 1.455, 0.82, 1.0, PI / 2 - 0.2);
  // guitar against the back wall, posters
  {const Gt = grp(ROOM, 0.06, 0, Z0 + 0.12); Gt.rotation.x = -0.1; Gt.rotation.z = 0.08; const gw = M(0xc98d4a, {roughness: 0.45}), gd = M(0x2b1f18, {roughness: 0.5});
    add(Gt, new THREE.CylinderGeometry(0.17, 0.17, 0.08, 28).rotateX(PI / 2), gw, 0, 0.22, 0); add(Gt, new THREE.CylinderGeometry(0.13, 0.13, 0.08, 28).rotateX(PI / 2), gw, 0, 0.44, 0);
    add(Gt, new THREE.CircleGeometry(0.045, 20), gd, 0, 0.36, 0.041, false); add(Gt, rb(0.05, 0.5, 0.025, 0.008), gd, 0, 0.78, 0.02); add(Gt, rb(0.08, 0.13, 0.025, 0.01), gd, 0, 1.08, 0.02);}
  {const p1 = tex(400, 560, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6b38f'); gr.addColorStop(1, '#7a3fa0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,240,220,0.9)'; g.beginPath(); g.arc(w / 2, h * 0.42, 90, 0, 7); g.fill(); T2(g, 'SUMMER', w / 2, h * 0.84, '800 70px "Inter Tight"', '#fbf3e6');});
    const p2 = tex(400, 560, (g, w, h) => {g.fillStyle = '#1d1f26'; g.fillRect(0, 0, w, h); g.strokeStyle = '#9fe0c6'; g.lineWidth = 10; for (let i = 0; i < 5; i++) {g.beginPath(); g.arc(w / 2, h * 0.45, 30 + i * 28, 0, 7); g.stroke();}
      T2(g, 'LEVEL UP', w / 2, h * 0.86, '800 62px "Inter Tight"', '#f4f1ea');});
    add(ROOM, rb(0.4, 0.56, 0.01, 0.004), M(0xffffff, {map: p1, roughness: 0.6}), -1.42, 1.6, Z0 + 0.008); add(ROOM, rb(0.4, 0.56, 0.01, 0.004), M(0xffffff, {map: p2, roughness: 0.6}), -0.92, 1.68, Z0 + 0.008);}
  {const rg = add(ROOM, rb(1.6, 0.02, 1.1, 0.008), fabric(0x9aa1ad), 0.35, 0.01, 0.4, false); rg.receiveShadow = true;}
  {const sn = M(0xf4f2ee, {roughness: 0.6}); for (const [x, z, r] of [[0.95, 0.78, 0.4], [1.08, 0.86, 0.1]]) {const s = grp(ROOM, x, 0, z, r); add(s, rb(0.1, 0.06, 0.26, 0.03), sn, 0, 0.035, 0); add(s, rb(0.105, 0.02, 0.265, 0.008), M(0x9fe0c6), 0, 0.01, 0);}}
  KID = human(ROOM, -0.62, -0.25, PI / 2 - 0.35, {type: 'teen', shirt: 0x6d8fb3, pants: 0x30343c, shoes: 0xf4f2ee, sole: 0xdedede, longSleeves: true});
  KID.HP.position.y = 0.465; for (const [i, l] of KID.legs.entries()) {l.L.rotation.x = -PI / 2 + 0.06; l.K.rotation.x = PI / 2 - 0.02; l.L.rotation.z = (i ? 1 : -1) * 0.06;}
  KID.arms[1].S.rotation.set(-0.75, 0, 0.12); KID.arms[1].E.rotation.x = -1.55; KID.arms[0].S.rotation.set(-0.3, 0, -0.35); KID.arms[0].E.rotation.x = -0.25;
  {const ph = grp(KID.arms[1].Hd, 0, -0.05, 0.02); add(ph, rb(0.07, 0.14, 0.012, 0.01), M(0x15161a, {roughness: 0.3}), 0, 0, 0).rotation.x = -0.6;
    add(ph, new THREE.PlaneGeometry(0.06, 0.125), new THREE.MeshStandardMaterial({color: 0x9cc8f2, emissive: 0x9cc8f2, emissiveIntensity: 0.9}), 0, 0.004, 0.0075, false).rotation.x = -0.6;}
  KID.HJ.rotation.set(0.38, -0.1, 0); KID.TJ.rotation.x = 0.08;
  TARGET = V3(-0.55, 0.75, -0.2); OVER = {num: '953 €', small: 'im Monat für Jugendliche von 12 bis 18 Jahren', sub: 'Und für einen Teenager über 950.'};
}

// ------------------------------------------------------------------ light
const sunDir = (el, az) => V3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
{const [c, I, elD] = LOOK.sun, sun = new THREE.DirectionalLight(c, I), d = sunDir(elD * PI / 180, PI - 0.55);
  sun.position.copy(V3(0.8, 0.9, -1.5).addScaledVector(d, 9)); sun.target.position.set(0.8, 0.0, -0.5); scene.add(sun, sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, {left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20});
  if (LOOK.fill) {const f = new THREE.DirectionalLight(0xfff6ee, LOOK.fill); f.position.set(3, 4, 6); scene.add(f);}
  // morning look: a soft beam of light from the window to the floor
  if (STYLE === 3) {const corners = [[WX0 + 0.05, WY0 + 0.05], [WX1 - 0.05, WY0 + 0.05], [WX1 - 0.05, WY1 - 0.05], [WX0 + 0.05, WY1 - 0.05]].map(([x, y]) => V3(x, y, Z0 - 0.02));
    const fl = corners.map(p => {const t = p.y / d.y; return p.clone().addScaledVector(d, -t);});
    const pos = [], al = []; const quad = (a, b, c2, e, aa, ab, ac, ae) => {pos.push(...a.toArray(), ...b.toArray(), ...c2.toArray(), ...a.toArray(), ...c2.toArray(), ...e.toArray()); al.push(aa, ab, ac, aa, ac, ae);};
    for (let i = 0; i < 4; i++) {const j = (i + 1) % 4; quad(corners[i], corners[j], fl[j], fl[i], 1, 1, 0, 0);}
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('a', new THREE.Float32BufferAttribute(al, 1));
    const m = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'attribute float a; varying float va; void main(){va=a; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying float va; void main(){gl_FragColor=vec4(vec3(1.0,0.78,0.5)*0.09*(0.25+0.75*va),1.0);}'});
    const bm = new THREE.Mesh(g, m); bm.renderOrder = 5; scene.add(bm); BEAM = bm;}}
for (const l of LIGHTS) l.intensity *= 1;

// ------------------------------------------------------------------ camera (fit the room into the free band between the top text and the subtitles)
function fit(pts, az, el, fov, band = {}) {const B = {x0: 70, x1: 1010, y0: 560, y1: 1380, ...band}, c = new THREE.PerspectiveCamera(fov, W / H, 0.05, 80);
  const A = az * PI / 180, E = el * PI / 180, dir = V3(Math.cos(E) * Math.sin(A), Math.sin(E), Math.cos(E) * Math.cos(A));
  let t = new THREE.Box3().setFromPoints(pts).getCenter(V3(0, 0, 0)), d = 10;
  for (let it = 0; it < 60; it++) {c.position.copy(t).addScaledVector(dir, d); c.lookAt(t); c.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) {const q = p.clone().project(c), px = (q.x + 1) / 2 * W, py = (1 - q.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);}
    const s = Math.max((x1 - x0) / (B.x1 - B.x0), (y1 - y0) / (B.y1 - B.y0)), vh = 2 * d * Math.tan(fov / 2 * PI / 180), right = V3(1, 0, 0).applyQuaternion(c.quaternion), up = V3(0, 1, 0).applyQuaternion(c.quaternion);
    t = t.clone().addScaledVector(right, ((x0 + x1) / 2 - (B.x0 + B.x1) / 2) / H * vh * 0.8).addScaledVector(up, -((y0 + y1) / 2 - (B.y0 + B.y1) / 2) / H * vh * 0.8); d *= 1 + (s - 1) * 0.6;}
  return {t, d, dir, fov};}
const roomPts = [V3(X0 - TK, -0.16, Z0 - TK), V3(X1, -0.16, Z0 - TK), V3(X0 - TK, WH, Z0 - TK), V3(X1, WH, Z0 - TK), V3(X0 - TK, WH, Z1), V3(X0 - TK, -0.16, Z1), V3(X1, -0.16, Z1)];
const CAMS = {1: () => fit(roomPts, 32, 22, 24), 2: () => fit(roomPts, 30, 12, 30, {x0: 10, x1: 1070, y0: 430, y1: 1500}), 3: () => fit(roomPts, 26, 34, 22)};
const F = CAMS[STYLE](); cam.fov = F.fov; cam.updateProjectionMatrix(); cam.position.copy(F.t).addScaledVector(F.dir, F.d); cam.lookAt(F.t); cam.updateMatrixWorld();

// ------------------------------------------------------------------ post-processing per look
const rt = new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType, samples: 4});
const composer = new EffectComposer(renderer, rt); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
if (STYLE !== 2) {const ao = new GTAOPass(scene, cam, W, H); ao.updateGtaoMaterial({radius: 0.35, distanceExponent: 1.4, thickness: 1.0, scale: 1.0, samples: 16}); ao.blendIntensity = STYLE === 1 ? 0.9 : 0.75; composer.addPass(ao);
  const r0 = ao.render.bind(ao); ao.render = (...a) => {if (BEAM) BEAM.visible = false; r0(...a); if (BEAM) BEAM.visible = true;};}   // the light beam must not get ambient occlusion
if (STYLE === 2) {const fd = cam.position.distanceTo(TARGET); composer.addPass(new BokehPass(scene, cam, {focus: fd, aperture: 0.0016, maxblur: 0.006}));}
if (STYLE !== 1) composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), STYLE === 2 ? 0.55 : 0.1, 0.6, STYLE === 2 ? 0.82 : 0.95));
composer.addPass(new OutputPass());
if (STYLE === 3) {const hs = new ShaderPass(HorizontalTiltShiftShader), vs = new ShaderPass(VerticalTiltShiftShader); hs.uniforms.h.value = 2.2 / W; vs.uniforms.v.value = 2.2 / H;
  hs.uniforms.r.value = vs.uniforms.r.value = 0.48; composer.addPass(hs); composer.addPass(vs);}
const GRADE = new ShaderPass({uniforms: {tDiffuse: {value: null}, vig: {value: [0.12, 0.5, 0.2][STYLE - 1]}, grain: {value: [0.015, 0.04, 0.02][STYLE - 1]}, tint: {value: [V3(1, 1, 1), V3(1.0, 0.97, 0.94), V3(1.03, 1.0, 0.95)][STYLE - 1]}},
  vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float vig, grain; uniform vec3 tint; varying vec2 vUv; float h(vec2 p){return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);}
    void main(){vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - 0.5; q.x *= 0.62; float d = length(q); c.rgb *= tint; c.rgb *= 1.0 - vig * smoothstep(0.18, 0.62, d); c.rgb += (h(vUv * vec2(1080.0, 1920.0)) - 0.5) * grain; gl_FragColor = c;}`});
composer.addPass(GRADE);

// ------------------------------------------------------------------ text overlay for the test
{const $ = id => document.getElementById(id); if (OVER.title) {$('title').innerHTML = OVER.title; $('title').style.opacity = 1;}
  if (OVER.num) {$('num').innerHTML = OVER.num + '<small>' + OVER.small + '</small>'; $('num').style.opacity = 1;}
  $('sub').textContent = OVER.sub; $('src').textContent = 'Quelle: Statistisches Bundesamt, EVS 2018 (Paare mit einem Kind) · Modell vereinfacht';}
window.renderFrame = () => composer.render();
window.renderFrame();
window.ready = true;
