// „Was kostet ein Kind, bis es 18 ist?“ – Kinderzimmer, das mitwächst (27.11.2026). Kein Knete-Look (Wunsch des Nutzers), Looks 2 und 3 mit sehr vielen Details.
// Ein aufgeschnittenes Kinderzimmer (Boden, Rückwand mit Fenster und Heizkörper, linke Wand) in drei Altersstufen:
// 0 Kleinkind (Gitterbett mit Mobile, Wickelkommode, Stillsessel, Schaukelpferd, Spielteppich), 1 Schulkind (Bett, Schreibtisch, Regal, Straßenteppich, Sitzsack),
// 2 Teenager (Bett mit Lichterkette, Schreibtisch mit Monitor und PC, Gaming-Stuhl, Gitarre, Wäschekorb). Der rote Teddy ist in jedem Alter dabei (roter Faden).
// Zeitleiste zur Stimme (voice/words.json, Take 1, die Stimme beginnt bei 0,15 s): die Möbel wechseln mit dem Alter, ab „Bis zum achtzehnten Geburtstag“ läuft
// ein Zeitraffer durch alle drei Alter, oben zählt der Betrag auf 174.000 € hoch. Seite: zimmer.html?s=2|3 (Look), &t=<s> Standbild, &a=0|1|2 ein Alter fest.
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

const Q = new URLSearchParams(location.search), STYLE = +(Q.get('s') || 2), FIXA = Q.get('a') != null ? +Q.get('a') : -1;
const W = 1080, H = 1920, PI = Math.PI, RED = 0xE01E2B, VO = 0.15, OUT0 = 38.75, END_V = 42.5;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u, seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = u => u * u * (3 - 2 * u), smr = u => u * u * u * (u * (u * 6 - 15) + 10), eo = u => 1 - Math.pow(1 - u, 3), eio = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const back = u => {if (u <= 0) return 0; if (u >= 1) return 1; const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);};
await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '700 40px Poppins', '800 96px "Inter Tight"', '500 170px Poppins'].map(f => document.fonts.load(f)));
const WORDS = (await (await fetch('voice/words.json')).json()).words;
let seed = 11; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------ renderer and helpers
const MOTIF = !!Q.get('motif');   // motif=1: the room alone on a transparent background (for the thumbnail)
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true, alpha: MOTIF});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(26, W / H, 0.05, 80);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
const grp = (par, x = 0, y = 0, z = 0, ry = 0) => {const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); return g;};
const rb = (w, h, d, r = 0.02) => new RoundedBoxGeometry(w, h, d, 3, Math.max(0.0005, Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005)));
const MC = new Map(); const M = (c, o = {}) => {const k = c + JSON.stringify(o, (key, val) => val && val.isTexture ? val.uuid : val); if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({color: c, roughness: 0.72, ...o})); return MC.get(k);};
const tex = (w, h, draw, rep) => {const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) {t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);} return t;};
const noise = (w, amp, n = 4000) => {const t = tex(w, w, (g) => {g.fillStyle = '#808080'; g.fillRect(0, 0, w, w); for (let i = 0; i < n; i++) {const v = R() < 0.5 ? 255 : 0;
  g.fillStyle = `rgba(${v},${v},${v},${amp})`; g.fillRect(R() * w, R() * w, 1 + R() * 2, 1 + R() * 2);}}, [1, 1]); t.colorSpace = THREE.NoColorSpace; return t;};
const NZ = noise(256, 0.18), NZF = noise(512, 0.35, 30000);
const T2 = (g, s, x, y, font, col, align = 'center') => {g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y);};
const hexs = c => '#' + new THREE.Color(c).getHexString();
const glow = (c, i) => new THREE.MeshStandardMaterial({color: c, emissive: c, emissiveIntensity: i, roughness: 0.4});
const fabric = (c) => M(c, {roughness: 0.95, bumpMap: NZF, bumpScale: 0.5});
const pic = (w, h, draw, o = {}) => M(0xffffff, {map: tex(w, h, draw), roughness: o.r ?? 0.6});

function woodTex(base, rows, seams = true, size = 1024) {return tex(size, size, (g, w, h) => {const c = new THREE.Color(base), rh = h / rows;
  for (let r = 0; r < rows; r++) {let x = -R() * 400; while (x < w) {const len = 300 + R() * 420, k = 0.9 + R() * 0.2, cc = c.clone().multiplyScalar(k);
      g.fillStyle = '#' + cc.getHexString(); g.fillRect(x, r * rh, len, rh);
      for (let i = 0; i < 14; i++) {const y0 = r * rh + R() * rh; g.strokeStyle = `rgba(70,40,20,${0.05 + R() * 0.07})`; g.lineWidth = 0.6 + R() * 1.6; g.beginPath();
        for (let xx = 0; xx <= len; xx += 20) g.lineTo(x + xx, y0 + Math.sin((xx + i * 37) / (60 + i * 7)) * 2.4); g.stroke();}
      if (seams) {g.fillStyle = 'rgba(60,35,20,0.45)'; g.fillRect(x, r * rh, 2, rh);} x += len;}
    if (seams) {g.fillStyle = 'rgba(60,35,20,0.4)'; g.fillRect(0, r * rh, w, 2);}}});}

// ------------------------------------------------------------------ looks: 2 = evening with lamps and soft depth of field, 3 = sunny morning as a miniature (tilt-shift)
const LOOK = {
  2: {bg: 0x0b0c12, cut: 0x24252e, slab: 0x1a1b22, exp: 1.25, env: 0.07, hemi: [0x8090c0, 0x201820, 0.16], sun: [0x8fa8ff, 0.7, 40], fill: 0.0},
  3: {bg: 0xf0e3d0, cut: 0xf7efe4, slab: 0xe6d6c0, exp: 0.98, env: 0.42, hemi: [0xffe8cc, 0xcdb79c, 0.62], sun: [0xffcf96, 4.0, 30], fill: 0.4}}[STYLE];
renderer.toneMappingExposure = LOOK.exp; scene.background = new THREE.Color(LOOK.bg); scene.environmentIntensity = LOOK.env;
scene.add(new THREE.HemisphereLight(...LOOK.hemi));
const NIGHT = STYLE === 2;

// ------------------------------------------------------------------ the room (cut open like a dollhouse)
const X0 = -1.7, X1 = 1.7, Z0 = -1.5, Z1 = 1.5, WH = 2.5, TK = 0.12, WX0 = 0.3, WX1 = 1.3, WY0 = 0.9, WY1 = 2.05;
const PAINT = [new THREE.Color(0xdde8d8), new THREE.Color(0xd5e3ef), new THREE.Color(0x6f7b8d)], CURC = [new THREE.Color(0xf3e6d6), new THREE.Color(0xf5e7a8), new THREE.Color(0x3c4350)];
const cutM = M(LOOK.cut, {roughness: 0.9}), slabM = M(LOOK.slab, {roughness: 0.9});
const paintM = new THREE.MeshStandardMaterial({color: PAINT[0].clone(), roughness: 0.92, bumpMap: NZ, bumpScale: 0.35});
const floorM = M(0xffffff, {map: woodTex(0xc99c6b, 16, true, 2048), roughness: 0.55, bumpMap: NZ, bumpScale: 0.2});
const ROOM = new THREE.Group(); scene.add(ROOM);
add(ROOM, new THREE.BoxGeometry(X1 - X0 + TK, 0.16, Z1 - Z0 + TK), [slabM, slabM, floorM, slabM, slabM, slabM], (X0 - TK + X1) / 2, -0.08, (Z0 - TK + Z1) / 2);
const wallBox = (x0, x1, y0, y1, z0, z1, inner) => {const mats = [cutM, cutM, cutM, cutM, cutM, cutM]; mats[inner] = paintM;
  return add(ROOM, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mats, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);};
wallBox(X0 - TK, WX0, 0, WH, Z0 - TK, Z0, 4); wallBox(WX1, X1, 0, WH, Z0 - TK, Z0, 4); wallBox(WX0, WX1, 0, WY0, Z0 - TK, Z0, 4); wallBox(WX0, WX1, WY1, WH, Z0 - TK, Z0, 4);
wallBox(X0 - TK, X0, 0, WH, Z0, Z1, 0);
{const ghost = new THREE.MeshBasicMaterial({colorWrite: false, depthWrite: false});   // they only cast shadows, so the sun comes in through the window only
  add(ROOM, new THREE.BoxGeometry(X1 - X0 + 0.4, 0.1, Z1 - Z0 + 0.4), ghost, 0, WH + 0.05, 0).receiveShadow = false;
  add(ROOM, new THREE.BoxGeometry(0.1, WH, Z1 - Z0 + 0.4), ghost, X1 + 0.05, WH / 2, 0).receiveShadow = false;}
const white = M(0xf8f6f2, {roughness: 0.5}), skirt = M(0xfbf8f3, {roughness: 0.6}), metal = M(0x2b2d33, {roughness: 0.35, metalness: 0.6}), chrome = M(0xd9dde3, {roughness: 0.25, metalness: 0.8});
const wood = M(0xffffff, {map: woodTex(0xd8b48a, 14, false), roughness: 0.55});
add(ROOM, rb(X1 - X0, 0.08, 0.018, 0.006), skirt, 0, 0.04, Z0 + 0.009); add(ROOM, rb(0.018, 0.08, Z1 - Z0, 0.006), skirt, X0 + 0.009, 0.04, 0);
// window: reveal, frame with a cross bar, handles, glass, sill, curtains with tie-backs on a rod, radiator below
const curM = new THREE.MeshStandardMaterial({color: CURC[0].clone(), roughness: 0.95, side: THREE.DoubleSide, bumpMap: NZF, bumpScale: 0.4});
{const fr = M(0xfdfbf7, {roughness: 0.45}), cx = (WX0 + WX1) / 2, cy = (WY0 + WY1) / 2, ww = WX1 - WX0, wh = WY1 - WY0, zf = Z0 - TK / 2;
  for (const [w, h, x, y] of [[ww, 0.06, cx, WY0 + 0.03], [ww, 0.06, cx, WY1 - 0.03], [0.06, wh, WX0 + 0.03, cy], [0.06, wh, WX1 - 0.03, cy], [0.045, wh, cx, cy], [ww, 0.045, cx, WY0 + wh * 0.72]])
    add(ROOM, rb(w, h, 0.07, 0.01), fr, x, y, zf);
  for (const sx of [-1, 1]) {add(ROOM, rb(0.02, 0.03, 0.03, 0.006), chrome, cx + sx * 0.045, cy - 0.05, zf + 0.05); add(ROOM, rb(0.016, 0.09, 0.016, 0.006), chrome, cx + sx * 0.045, cy - 0.09, zf + 0.065);}
  const gl = add(ROOM, new THREE.PlaneGeometry(ww - 0.1, wh - 0.1), new THREE.MeshStandardMaterial({color: 0xcfe2f0, roughness: 0.05, transparent: true, opacity: NIGHT ? 0.18 : 0.1, depthWrite: false}), cx, cy, zf + 0.005, false);
  gl.receiveShadow = false;
  add(ROOM, rb(ww + 0.14, 0.04, 0.2, 0.012), fr, cx, WY0 - 0.02, Z0 + 0.06);
  const rod = M(0xd9d2c8, {roughness: 0.4, metalness: 0.3}); add(ROOM, new THREE.CylinderGeometry(0.012, 0.012, ww + 0.62, 12).rotateZ(PI / 2), rod, cx, WY1 + 0.2, Z0 + 0.13);
  for (const sx of [-1, 1]) {add(ROOM, new THREE.SphereGeometry(0.022, 12, 10), rod, cx + sx * (ww / 2 + 0.31), WY1 + 0.2, Z0 + 0.13); add(ROOM, rb(0.012, 0.06, 0.09, 0.004), rod, cx + sx * (ww / 2 + 0.27), WY1 + 0.17, Z0 + 0.08);}
  for (const sx of [-1, 1]) {const g = new THREE.PlaneGeometry(0.3, 1.62, 40, 30), p = g.attributes.position;   // gathered by a tie-back
    for (let i = 0; i < p.count; i++) {const x = p.getX(i), y = p.getY(i), yy = (y + 0.81) / 1.62, pinch = Math.exp(-Math.pow((yy - 0.42) / 0.12, 2)) * 0.45;
      p.setX(i, x * (1 - pinch) + sx * pinch * 0.05); p.setZ(i, 0.022 * Math.sin(x / 0.3 * PI * 7) * (1 + pinch));}
    g.computeVertexNormals(); add(ROOM, g, curM, cx + sx * (ww / 2 + 0.17), WY1 + 0.19 - 0.81, Z0 + 0.13);
    add(ROOM, new THREE.TorusGeometry(0.05, 0.012, 8, 20), M(0xd8b48a, {roughness: 0.6}), cx + sx * (ww / 2 + 0.17) + sx * 0.03, WY1 + 0.19 - 1.62 * 0.58, Z0 + 0.14).scale.set(1, 0.5, 1);}
  const rad = grp(ROOM, cx, 0, Z0 + 0.07); const rm = M(0xf7f6f2, {roughness: 0.35});
  add(rad, rb(0.86, 0.5, 0.07, 0.015), rm, 0, 0.45, 0); for (let i = 0; i < 17; i++) add(rad, rb(0.025, 0.46, 0.018, 0.006), rm, -0.4 + i * 0.05, 0.45, 0.04);
  add(rad, new THREE.CylinderGeometry(0.03, 0.03, 0.06, 18), rm, 0.48, 0.66, 0.02); add(rad, new THREE.CylinderGeometry(0.035, 0.035, 0.05, 20).rotateX(PI / 2), M(0xffffff, {roughness: 0.4}), 0.48, 0.66, 0.06);
  for (const x of [-0.38, 0.38]) {add(rad, new THREE.CylinderGeometry(0.011, 0.011, 0.2, 10), chrome, x, 0.1, 0.0); add(rad, new THREE.CylinderGeometry(0.02, 0.02, 0.01, 12), chrome, x, 0.005, 0.0);}}
// sky behind the window (only seen through the glass)
{const sky = tex(512, 512, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h);
    if (NIGHT) {gr.addColorStop(0, '#0b1330'); gr.addColorStop(0.7, '#1d2b55'); gr.addColorStop(1, '#3a3f6e');} else {gr.addColorStop(0, '#9cc3e6'); gr.addColorStop(0.55, '#f3d9b0'); gr.addColorStop(1, '#ffc98a');}
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (NIGHT) {for (let i = 0; i < 120; i++) {g.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.6})`; g.fillRect(R() * w, R() * h * 0.7, 1.4, 1.4);} g.fillStyle = '#fdf6dc'; g.beginPath(); g.arc(w * 0.62, h * 0.3, 26, 0, 7); g.fill();
      for (let i = 0; i < 9; i++) {const bw = 40 + R() * 50, bh = 60 + R() * 120, x = i * 60 - 10; g.fillStyle = '#1a2142'; g.fillRect(x, h - bh, bw, bh); g.fillStyle = '#f6d28a'; for (let k = 0; k < 6; k++) if (R() < 0.5) g.fillRect(x + 8 + (k % 2) * 18, h - bh + 14 + Math.floor(k / 2) * 22, 8, 10);}}
    else for (let i = 0; i < 7; i++) {const x = R() * w, y = h * (0.15 + R() * 0.4); g.fillStyle = 'rgba(255,255,255,0.55)'; for (let k = 0; k < 5; k++) {g.beginPath(); g.arc(x + k * 22, y + Math.sin(k) * 6, 18 + R() * 10, 0, 7); g.fill();}}});
  const sp = add(scene, new THREE.PlaneGeometry(1.55, 1.6), new THREE.MeshBasicMaterial({map: sky, toneMapped: false}), 0.675, 1.4, Z0 - TK - 0.32, false); sp.receiveShadow = false;
  if (!NIGHT) {const lf = M(0x9ab463, {roughness: 0.9}); for (const [x, y, r] of [[1.12, 1.3, 0.2], [1.2, 1.7, 0.2], [0.9, 1.12, 0.16]]) add(scene, new THREE.IcosahedronGeometry(r, 2), lf, x, y, Z0 - TK - 0.24).scale.z = 0.25;}}
// wall clock over the window (the hands turn; fast in the time-lapse)
const CLOCK = grp(ROOM, 0.8, 2.29, Z0 + 0.02);
add(CLOCK, new THREE.CylinderGeometry(0.12, 0.12, 0.03, 40).rotateX(PI / 2), M(0x2b2d33, {roughness: 0.4}));
add(CLOCK, new THREE.CircleGeometry(0.105, 40), pic(256, 256, (g, w, h) => {g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2d33';
  for (let i = 0; i < 12; i++) {const a = i * PI / 6; g.save(); g.translate(w / 2 + Math.sin(a) * 104, h / 2 - Math.cos(a) * 104); g.rotate(a); g.fillRect(-3, -10, 6, i % 3 ? 14 : 22); g.restore();}}), 0, 0, 0.016, false);
const HANDS = [[0.065, 0.012], [0.09, 0.008]].map(([l, w]) => {const g = grp(CLOCK, 0, 0, 0.02 + w); add(g, rb(w, l, 0.004, 0.002), M(0x2b2d33), 0, l / 2 - 0.01, 0, false); return g;});
add(CLOCK, new THREE.CylinderGeometry(0.01, 0.01, 0.01, 12).rotateX(PI / 2), M(0x2b2d33), 0, 0, 0.034, false);
// growth chart on the back wall; the marks are added age by age
const MX = -0.27, MH = 1.95;
{const t = tex(128, 2048, (g, w, h) => {g.fillStyle = '#f2dcb0'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(150,100,50,0.12)'; for (let i = 0; i < 30; i++) g.fillRect(0, R() * h, w, 1 + R() * 2);
    for (let cm = 0; cm <= MH * 100; cm += 5) {const y = h - (cm / (MH * 100)) * h; g.fillStyle = '#7a5a3a'; g.fillRect(0, y - 1, cm % 50 === 0 ? 46 : cm % 10 === 0 ? 30 : 16, 2);
      if (cm % 50 === 0 && cm > 0) T2(g, String(cm), 66, y + 2, '600 30px Poppins', '#7a5a3a');}});
  add(ROOM, rb(0.09, MH, 0.015, 0.006), M(0xffffff, {map: t, roughness: 0.6}), MX, 0.1 + MH / 2, Z0 + 0.008);
  add(ROOM, new THREE.SphereGeometry(0.035, 14, 10), M(0xf7dd7c, {roughness: 0.5}), MX, 0.1 + MH + 0.03, Z0 + 0.02);}
const MARKS = [[0.5, '1 J.', 0], [0.86, '2 J.', 0], [1.16, '6 J.', 1], [1.33, '9 J.', 1], [1.55, '12 J.', 2], [1.68, '15 J.', 2]].map(([m, l, a]) => {const g = grp(ROOM, MX + 0.01, m, Z0 + 0.018);
  add(g, rb(0.075, 0.006, 0.004, 0.002), M(0x3a3f6e), 0.0, 0, 0, false);
  add(g, new THREE.PlaneGeometry(0.11, 0.04), new THREE.MeshStandardMaterial({map: tex(220, 80, (c, w, h) => T2(c, l, w / 2, h / 2 + 2, '700 52px Poppins', '#3a3f6e')), transparent: true, roughness: 0.7}), 0.1, 0.02, 0.001, false);
  g.userData.age = a; return g;});
add(ROOM, rb(0.08, 0.08, 0.012, 0.01), M(0xfbfbf8, {roughness: 0.4}), 0.05, 0.3, Z0 + 0.006); add(ROOM, rb(0.08, 0.08, 0.012, 0.01), M(0xfbfbf8, {roughness: 0.4}), -0.45, 1.05, Z0 + 0.006);
add(ROOM, rb(0.03, 0.04, 0.008, 0.004), M(0xe7e3dc), -0.45, 1.05, Z0 + 0.014); add(ROOM, rb(0.08, 0.08, 0.012, 0.01), M(0xfbfbf8, {roughness: 0.4}), 1.5, 0.3, Z0 + 0.006);
for (const x of [0.035, 0.065]) add(ROOM, new THREE.CircleGeometry(0.006, 8), M(0x555555), x, 0.3, Z0 + 0.013, false);

// ------------------------------------------------------------------ people (smooth, slightly stylized; joints for posing)
const SKIN = 0xf1c8a6;
const PROP = {toddler: {hip: 0.34, thigh: 0.15, shin: 0.15, foot: 0.04, torso: 0.25, sw: 0.18, hw: 0.05, limb: 0.036, upper: 0.12, fore: 0.11, head: 0.112, neck: 0.025, depth: 0.14},
  kid: {hip: 0.66, thigh: 0.3, shin: 0.3, foot: 0.06, torso: 0.39, sw: 0.25, hw: 0.068, limb: 0.042, upper: 0.21, fore: 0.19, head: 0.108, neck: 0.04, depth: 0.15},
  teen: {hip: 0.86, thigh: 0.4, shin: 0.4, foot: 0.06, torso: 0.52, sw: 0.33, hw: 0.085, limb: 0.05, upper: 0.29, fore: 0.26, head: 0.112, neck: 0.06, depth: 0.19}};
function human(par, x, z, ry, o) {const P = PROP[o.type], G = grp(par, x, 0, z, ry), HP = grp(G, 0, P.hip, 0);
  const skin = M(SKIN, {roughness: 0.6}), shirt = M(o.shirt, {roughness: 0.85, bumpMap: NZF, bumpScale: 0.15}), pants = M(o.pants, {roughness: 0.85, bumpMap: NZF, bumpScale: 0.15}),
    shoe = M(o.shoes, {roughness: 0.6}), sole = M(o.sole ?? 0xf4f2ee, {roughness: 0.7}), hair = M(o.hair, {roughness: 0.75});
  const legs = [-1, 1].map(s => {const L = grp(HP, s * P.hw, 0, 0); add(L, new THREE.SphereGeometry(P.limb * 1.18, 16, 12), pants);
    add(L, new THREE.CapsuleGeometry(P.limb * 1.15, P.thigh, 6, 16), pants, 0, -P.thigh / 2, 0);
    const K = grp(L, 0, -P.thigh, 0); add(K, new THREE.CapsuleGeometry(P.limb, P.shin, 6, 16), pants, 0, -P.shin / 2, 0);
    if (o.cuffs) add(K, new THREE.CylinderGeometry(P.limb * 1.08, P.limb * 1.08, 0.025, 14), M(o.cuffs), 0, -P.shin + 0.02, 0);
    const F = grp(K, 0, -P.shin, 0); add(F, rb(P.limb * 2.3, P.foot, P.limb * 3.9, P.foot * 0.45), shoe, 0, -P.foot / 2, P.limb * 0.8);
    if (o.type !== 'toddler') {add(F, rb(P.limb * 2.4, P.foot * 0.3, P.limb * 4.0, P.foot * 0.14), sole, 0, -P.foot * 0.86, P.limb * 0.8);
      for (let i = 0; i < 3; i++) add(F, rb(P.limb * 1.4, 0.004, 0.006, 0.002), sole, 0, 0.002, P.limb * (0.9 + i * 0.45), false);}
    return {L, K, F};});
  add(HP, new THREE.SphereGeometry(P.sw * 0.42, 20, 14), pants, 0, 0.01, 0).scale.set(1, 0.55, P.depth / (P.sw * 0.84));
  const TJ = grp(HP, 0, 0, 0);
  {const prof = [[0, 0.78], [0.1, 0.82], [0.35, 0.78], [0.6, 0.86], [0.82, 0.92], [0.93, 0.8], [0.985, 0.48], [1, 0.05]].map(([y, r]) => new THREE.Vector2(r * P.sw / 2, y * P.torso));
    const tm = add(TJ, new THREE.LatheGeometry(prof, 28), shirt, 0, 0, 0); tm.scale.z = P.depth / (P.sw * 0.92);
    if (o.print) add(TJ, new THREE.PlaneGeometry(P.sw * 0.42, P.sw * 0.42), new THREE.MeshStandardMaterial({map: o.print, transparent: true, roughness: 0.8}), 0, P.torso * 0.62, P.depth / 2 + 0.004, false);
    if (o.hood) {add(TJ, new THREE.TorusGeometry(P.head * 0.62, P.limb * 0.7, 10, 22), shirt, 0, P.torso + 0.005, -0.02).rotation.x = PI / 2 - 0.25;
      for (const s of [-1, 1]) add(TJ, new THREE.CylinderGeometry(0.004, 0.004, 0.13, 6), M(0xf4f2ee), s * 0.035, P.torso - 0.08, P.depth / 2 + 0.01, false);
      add(TJ, rb(P.sw * 0.5, P.torso * 0.22, 0.01, 0.01), M(new THREE.Color(o.shirt).multiplyScalar(0.88).getHex(), {roughness: 0.9}), 0, P.torso * 0.25, P.depth / 2 + 0.003, false);}
    if (o.buttons) for (let i = 0; i < 3; i++) add(TJ, new THREE.SphereGeometry(0.008, 8, 6), M(0xffffff, {roughness: 0.3}), 0, P.torso * (0.45 + i * 0.15), P.depth / 2 + 0.004, false);}
  add(TJ, new THREE.CylinderGeometry(P.head * 0.32, P.head * 0.36, P.neck + 0.05, 14), skin, 0, P.torso + P.neck / 2 - 0.01, 0);
  const HJ = grp(TJ, 0, P.torso + P.neck + P.head * 0.92, 0), h = P.head;
  add(HJ, new THREE.SphereGeometry(h, 32, 24), skin).scale.set(1, 1.04, 0.97);
  const dark = M(0x2a2228, {roughness: 0.3}), whiteB = new THREE.MeshBasicMaterial({color: 0xffffff});
  for (const s of [-1, 1]) {add(HJ, new THREE.SphereGeometry(h * 0.105, 14, 12), dark, s * h * 0.34, h * 0.03, h * 0.9, false).scale.set(1, 1.15, 0.6);
    add(HJ, new THREE.SphereGeometry(h * 0.032, 8, 6), whiteB, s * h * 0.34 + h * 0.03, h * 0.07, h * 0.955, false);
    const eb = add(HJ, new THREE.CapsuleGeometry(h * 0.025, h * 0.12, 4, 8), hair, s * h * 0.35, h * 0.27, h * 0.9, false); eb.rotation.z = PI / 2 + s * 0.12;
    add(HJ, new THREE.SphereGeometry(h * 0.2, 14, 10), skin, s * h * 0.98, 0, 0).scale.set(0.45, 0.95, 0.75);
    const ch = add(HJ, new THREE.SphereGeometry(h * 0.13, 12, 10), M(0xf2998a, {transparent: true, opacity: 0.35, roughness: 0.8}), s * h * 0.56, -h * 0.2, h * 0.78, false); ch.scale.z = 0.4;}
  add(HJ, new THREE.SphereGeometry(h * 0.1, 12, 10), M(0xe9b393, {roughness: 0.6}), 0, -h * 0.12, h * 0.98, false);
  const mo = add(HJ, new THREE.TorusGeometry(h * 0.13, h * 0.022, 6, 16, PI * 0.8), M(0x8a3f3a, {roughness: 0.5}), 0, -h * 0.36, h * 0.92, false); mo.rotation.z = PI + PI * 0.1;
  {const cap = add(HJ, new THREE.SphereGeometry(h * 1.05, 32, 18, 0, PI * 2, 0, PI * (o.type === 'toddler' ? 0.42 : 0.5)), hair, 0, h * 0.02, -h * 0.06); cap.rotation.x = -0.3;
    if (o.type === 'toddler') {const t = add(HJ, new THREE.TorusGeometry(h * 0.12, h * 0.04, 8, 14, PI * 1.3), hair, 0.0, h * 1.02, 0.02); t.rotation.y = PI / 2;}
    if (o.type === 'kid') {const f = add(HJ, new THREE.SphereGeometry(h * 0.62, 20, 12), hair, 0.0, h * 0.62, h * 0.42); f.scale.set(1.3, 0.42, 0.7); f.rotation.x = 0.3;}
    if (o.type === 'teen') {const f = add(HJ, new THREE.SphereGeometry(h * 0.6, 20, 12), hair, -h * 0.18, h * 0.66, h * 0.45); f.scale.set(1.45, 0.46, 0.75); f.rotation.set(0.35, 0, 0.22);
      const b = add(HJ, new THREE.SphereGeometry(h * 0.96, 24, 16), hair, 0, -h * 0.05, -h * 0.2); b.scale.set(1.02, 0.95, 0.9);
      for (const [x, y, z] of [[0.3, 0.95, 0.1], [-0.4, 0.9, -0.1], [0.05, 1.02, -0.3]]) add(HJ, new THREE.SphereGeometry(h * 0.28, 12, 10), hair, x * h, y * h, z * h);}}
  const arms = [-1, 1].map(s => {const S = grp(TJ, s * (P.sw / 2 - P.limb * 0.2), P.torso - P.limb * 1.7, 0); add(S, new THREE.SphereGeometry(P.limb * 1.1, 14, 12), shirt);
    add(S, new THREE.CapsuleGeometry(P.limb * 0.98, P.upper, 6, 14), shirt, 0, -P.upper / 2, 0); const E = grp(S, 0, -P.upper, 0);
    add(E, new THREE.CapsuleGeometry(P.limb * 0.86, P.fore, 6, 14), o.longSleeves ? shirt : skin, 0, -P.fore / 2, 0);
    if (o.longSleeves) add(E, new THREE.CylinderGeometry(P.limb * 0.95, P.limb * 0.95, 0.03, 14), M(new THREE.Color(o.shirt).multiplyScalar(0.85).getHex(), {roughness: 0.9}), 0, -P.fore + 0.005, 0);
    const Hd = grp(E, 0, -P.fore, 0); add(Hd, new THREE.SphereGeometry(P.limb * 1.08, 14, 12), skin, 0, -P.limb * 0.4, 0).scale.set(0.9, 1.1, 0.75);
    add(Hd, new THREE.CapsuleGeometry(P.limb * 0.32, P.limb * 0.5, 4, 8), skin, -s * P.limb * 0.6, -P.limb * 0.2, P.limb * 0.35).rotation.z = s * 0.6;
    S.rotation.z = s * 0.08; return {S, E, Hd};});
  return {G, HP, TJ, HJ, legs, arms, P};}
function teddy(par, x, y, z, s = 1, ry = 0) {const G = grp(par, x, y, z, ry); G.scale.setScalar(s); const m = M(RED, {roughness: 0.95, bumpMap: NZF, bumpScale: 0.6}),
    lt = M(0xf3b7a8, {roughness: 0.9}), dk = M(0x1d1416, {roughness: 0.3});
  add(G, new THREE.SphereGeometry(0.07, 20, 16), m, 0, 0.075, 0).scale.set(1, 1.12, 0.9); add(G, new THREE.SphereGeometry(0.04, 14, 12), lt, 0, 0.065, 0.05).scale.z = 0.45;
  add(G, new THREE.SphereGeometry(0.058, 20, 16), m, 0, 0.18, 0.005);
  for (const s2 of [-1, 1]) {add(G, new THREE.SphereGeometry(0.022, 12, 10), m, s2 * 0.042, 0.228, -0.005).scale.z = 0.6; add(G, new THREE.SphereGeometry(0.012, 10, 8), lt, s2 * 0.042, 0.228, 0.006).scale.z = 0.4;
    add(G, new THREE.SphereGeometry(0.008, 8, 6), dk, s2 * 0.022, 0.19, 0.052, false);
    const a = add(G, new THREE.CapsuleGeometry(0.019, 0.05, 4, 10), m, s2 * 0.072, 0.1, 0.01); a.rotation.z = s2 * 0.7;
    const l = add(G, new THREE.CapsuleGeometry(0.022, 0.04, 4, 10), m, s2 * 0.04, 0.02, 0.04); l.rotation.x = PI / 2 - 0.2;}
  add(G, new THREE.SphereGeometry(0.024, 12, 10), lt, 0, 0.17, 0.05).scale.z = 0.7; add(G, new THREE.SphereGeometry(0.009, 8, 6), dk, 0, 0.177, 0.07, false);
  const bow = M(0xf4f1ea, {roughness: 0.8}); for (const s2 of [-1, 1]) add(G, new THREE.SphereGeometry(0.016, 10, 8), bow, s2 * 0.018, 0.128, 0.05).scale.set(1.3, 0.8, 0.5);
  return G;}
function plush(par, x, y, z, c, ry = 0, kind = 'bunny', s = 1) {const G = grp(par, x, y, z, ry); G.scale.setScalar(s); const m = fabric(c), dk = M(0x1d1416, {roughness: 0.3});
  add(G, new THREE.SphereGeometry(0.06, 16, 12), m, 0, 0.06, 0).scale.set(1, 1.1, 0.9); add(G, new THREE.SphereGeometry(0.05, 16, 12), m, 0, 0.15, 0.01);
  for (const s2 of [-1, 1]) {add(G, new THREE.SphereGeometry(0.007, 8, 6), dk, s2 * 0.018, 0.16, 0.055, false);
    if (kind === 'bunny') {const e = add(G, new THREE.CapsuleGeometry(0.013, 0.08, 4, 8), m, s2 * 0.022, 0.23, 0); e.rotation.z = -s2 * 0.15;}
    else add(G, new THREE.SphereGeometry(0.035, 12, 10), m, s2 * 0.05, 0.16, -0.005).scale.set(0.35, 1, 0.9);
    add(G, new THREE.CapsuleGeometry(0.016, 0.03, 4, 8), m, s2 * 0.055, 0.07, 0.02).rotation.z = s2 * 0.6;}
  if (kind === 'elephant') add(G, new THREE.CapsuleGeometry(0.012, 0.05, 4, 8), m, 0, 0.12, 0.06).rotation.x = 0.5;
  return G;}
function books(par, x0, y, n, cols, z = 0, d = 0.19) {let x = x0; for (let i = 0; i < n; i++) {const bw = 0.03 + R() * 0.025, bh = 0.2 + R() * 0.09;
  const b = add(par, rb(bw, bh, d, 0.004), M(cols[i % cols.length], {roughness: 0.7}), x + bw / 2, y + bh / 2 + 0.011, z);
  add(par, rb(bw + 0.001, 0.012, d * 0.9, 0.002), M(0xf4f1ea, {roughness: 0.7}), x + bw / 2, y + bh * 0.8 + 0.011, z + 0.002, false);
  if (i === n - 1 && R() < 0.6) {b.rotation.z = -0.25; b.position.x += 0.03;} x += bw + 0.003;} return x;}
function frame(par, x, y, z, w, h, draw, fc = 0xf4f1ea) {const G = grp(par, x, y, z); add(G, rb(w, h, 0.02, 0.006), M(fc, {roughness: 0.5}), 0, 0, 0);
  add(G, new THREE.PlaneGeometry(w * 0.82, h * 0.82), pic(256, Math.round(256 * h / w), draw), 0, 0, 0.011, false); return G;}
function plant(par, x, y, z, s = 1, pot = 0xf4f1ea) {const G = grp(par, x, y, z); G.scale.setScalar(s); add(G, new THREE.CylinderGeometry(0.06, 0.045, 0.1, 18), M(pot, {roughness: 0.6}), 0, 0.05, 0);
  add(G, new THREE.CylinderGeometry(0.055, 0.055, 0.01, 16), M(0x5a3c25), 0, 0.098, 0); const lf = M(0x4f9e5a, {roughness: 0.7});
  for (let i = 0; i < 9; i++) {const a = i * 2.4, l = add(G, new THREE.SphereGeometry(0.04, 10, 8), lf, Math.cos(a) * 0.035, 0.15 + (i % 3) * 0.035, Math.sin(a) * 0.035); l.scale.set(0.45, 1.5, 0.25); l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6);}
  return G;}
function basket(par, x, z, items, c = 0xd8c3a0) {const G = grp(par, x, 0, z); const bm = M(c, {roughness: 0.9, bumpMap: NZF, bumpScale: 1.2});
  add(G, new THREE.CylinderGeometry(0.2, 0.17, 0.34, 28, 1, true), M(c, {roughness: 0.9, bumpMap: NZF, bumpScale: 1.2, side: THREE.DoubleSide}), 0, 0.17, 0);
  add(G, new THREE.CylinderGeometry(0.17, 0.17, 0.01, 28), bm, 0, 0.005, 0); add(G, new THREE.TorusGeometry(0.2, 0.012, 8, 32), bm, 0, 0.34, 0).rotation.x = PI / 2;
  items.forEach(([cc, sx, sy, sz, rx, rz], i) => {const o = add(G, new THREE.SphereGeometry(0.1, 14, 10), fabric(cc), sx, 0.28 + sy, sz); o.scale.set(1.3, 0.45, 1.0); o.rotation.set(rx, i, rz);}); return G;}
const LIGHTS = []; let BEAM = null;
function practical(par, x, y, z, c, I, age, dist = 3.2, shadow = false) {const p = new THREE.PointLight(c, 0, dist, 1.6); p.position.set(x, y, z); par.add(p); p.userData = {I: NIGHT ? I : I * 0.12, age};
  if (shadow && NIGHT) {p.castShadow = true; p.shadow.mapSize.set(512, 512); p.shadow.bias = -0.002;} LIGHTS.push(p); return p;}
const EMIT = [];   // emissive parts that follow their age (lamps, LEDs, screens)
const emitM = (c, i, age) => {const m = glow(c, 0); m.userData = {I: NIGHT ? i : i * 0.35, age}; EMIT.push(m); return m;};
function deskLamp(par, x, y, z, ry, c, age) {const L = grp(par, x, y, z, ry); const m = M(c, {roughness: 0.4});
  add(L, new THREE.CylinderGeometry(0.06, 0.07, 0.02, 20), m, 0, 0.01, 0); add(L, new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), m, 0, 0.17, 0).rotation.z = 0.25;
  add(L, new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8), m, 0.1, 0.38, 0).rotation.z = -1.1;
  add(L, new THREE.ConeGeometry(0.07, 0.11, 20, 1, true), M(c, {roughness: 0.4, side: THREE.DoubleSide}), 0.2, 0.39, 0).rotation.z = 0.6;
  add(L, new THREE.SphereGeometry(0.022, 12, 10), emitM(0xffd9a0, 3, age), 0.18, 0.36, 0, false); return L;}

// ------------------------------------------------------------------ the three ages (each top-level child of AG[a] pops in and out on its own)
const AG = [0, 1, 2].map(() => grp(ROOM));
const ITEM = (a, x = 0, y = 0, z = 0, ry = 0) => grp(AG[a], x, y, z, ry);
const KIDS = [];
// ---------- age 0: toddler
{const C = ITEM(0, -1.33, 0, -0.84); const cw = M(0xfbfaf6, {roughness: 0.5}), L = 1.2, Wd = 0.62, Hh = 0.95;
  for (const [x, z] of [[-Wd / 2, -L / 2], [Wd / 2, -L / 2], [-Wd / 2, L / 2], [Wd / 2, L / 2]]) {add(C, rb(0.05, Hh, 0.05, 0.012), cw, x, Hh / 2, z); add(C, new THREE.SphereGeometry(0.03, 12, 10), cw, x, Hh + 0.01, z);}
  for (const y of [0.3, Hh - 0.02]) {add(C, rb(0.035, 0.035, L, 0.01), cw, -Wd / 2, y, 0); add(C, rb(0.035, 0.035, L, 0.01), cw, Wd / 2, y, 0); add(C, rb(Wd, 0.035, 0.035, 0.01), cw, 0, y, -L / 2); add(C, rb(Wd, 0.035, 0.035, 0.01), cw, 0, y, L / 2);}
  for (let i = 1; i < 14; i++) {const z = -L / 2 + i * L / 14; for (const x of [-Wd / 2, Wd / 2]) add(C, new THREE.CylinderGeometry(0.009, 0.009, Hh - 0.32, 8), cw, x, 0.3 + (Hh - 0.32) / 2, z);}
  for (let i = 1; i < 7; i++) {const x = -Wd / 2 + i * Wd / 7; for (const z of [-L / 2, L / 2]) add(C, new THREE.CylinderGeometry(0.009, 0.009, Hh - 0.32, 8), cw, x, 0.3 + (Hh - 0.32) / 2, z);}
  add(C, rb(Wd - 0.04, 0.1, L - 0.04, 0.03), fabric(0xf4f1ea), 0, 0.36, 0);
  const starT = tex(256, 256, (g, w, h) => {g.fillStyle = '#bfdcc8'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; for (let i = 0; i < 18; i++) {const x = (i * 53) % w, y = (i * 97) % h; g.beginPath(); for (let k = 0; k < 10; k++) {const r = k % 2 ? 6 : 14, a = k * PI / 5; g.lineTo(x + Math.sin(a) * r, y - Math.cos(a) * r);} g.fill();}});
  add(C, rb(Wd - 0.06, 0.05, L * 0.55, 0.025), M(0xffffff, {map: starT, roughness: 0.95, bumpMap: NZF, bumpScale: 0.4}), 0, 0.43, 0.2);
  add(C, rb(0.34, 0.07, 0.2, 0.035), fabric(0xffffff), 0, 0.44, -0.42);
  for (const [x, z, w, d] of [[0, -L / 2 + 0.035, Wd - 0.06, 0.03], [-Wd / 2 + 0.035, -0.2, 0.03, 0.75]]) add(C, rb(w, 0.16, d, 0.012), fabric(0xe7cfee), x, 0.49, z);
  plush(C, 0.12, 0.42, -0.25, 0xc9d8f0, -0.4, 'elephant', 0.8);
  {const arm = M(0xfbfaf6, {roughness: 0.5}), px = Wd / 2, pz = -L / 2 + 0.03, top = Hh + 0.55, ex = 0, ez = -0.2;
    add(C, new THREE.CylinderGeometry(0.012, 0.012, top - Hh + 0.02, 8), arm, px, (Hh + top) / 2, pz);
    const dx = ex - px, dz = ez - pz, len = Math.hypot(dx, dz), ar = add(C, new THREE.CylinderGeometry(0.01, 0.01, len, 8), arm, (px + ex) / 2, top, (pz + ez) / 2);
    ar.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(dx, 0, dz).normalize()); add(C, new THREE.SphereGeometry(0.014, 10, 8), arm, px, top, pz);
    add(C, new THREE.CylinderGeometry(0.0025, 0.0025, 0.08, 4), M(0xffffff), ex, top - 0.04, ez, false);
    const MB = grp(C, ex, top - 0.08, ez); MB.name = 'mobile'; add(MB, new THREE.TorusGeometry(0.17, 0.008, 6, 30), arm, 0, 0, 0).rotation.x = PI / 2;
    [[0xf7dd7c, 'star'], [0x9cc8f2, 'cloud'], [0xc4a8f0, 'moon'], [0x9fe0c6, 'star'], [0xf6b38f, 'cloud']].forEach(([c, k], i) => {const a = i * PI * 2 / 5 + 0.4, x = Math.cos(a) * 0.17, z = Math.sin(a) * 0.17, len = 0.1 + (i % 3) * 0.05;
      add(MB, new THREE.CylinderGeometry(0.0025, 0.0025, len, 4), M(0xffffff), x, -len / 2, z, false);
      const g = k === 'star' ? new THREE.OctahedronGeometry(0.045, 0) : k === 'moon' ? new THREE.TorusGeometry(0.035, 0.016, 8, 16, PI * 1.3) : new THREE.SphereGeometry(0.04, 12, 10);
      const o = add(MB, g, M(c, {roughness: 0.6}), x, -len - 0.04, z); if (k === 'cloud') o.scale.set(1.5, 0.8, 0.7); if (k === 'star') o.scale.z = 0.4;});}}
{const Dd = ITEM(0, -1.45, 0, 0.75); add(Dd, rb(0.48, 0.84, 0.9, 0.02), white, 0, 0.44, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(Dd, new THREE.CylinderGeometry(0.018, 0.014, 0.04, 10), wood, sx * 0.2, 0.01, sz * 0.4);
  for (let i = 0; i < 3; i++) {add(Dd, rb(0.012, 0.24, 0.84, 0.006), M(0xf2eee8, {roughness: 0.5}), 0.245, 0.17 + i * 0.27, 0); add(Dd, new THREE.SphereGeometry(0.018, 10, 8), M(0xd8b48a, {roughness: 0.4}), 0.26, 0.17 + i * 0.27, 0);}
  add(Dd, rb(0.46, 0.08, 0.62, 0.04), fabric(0xbfe3d0), 0, 0.9, 0.1); for (let i = 0; i < 4; i++) add(Dd, rb(0.13, 0.05, 0.11, 0.015), M(0xffffff, {roughness: 0.8}), -0.1, 0.885 + i * 0.05, -0.36);
  {const b = grp(Dd, 0.08, 0.86, -0.32); add(b, rb(0.16, 0.12, 0.14, 0.02), M(0xd8c3a0, {roughness: 0.9, bumpMap: NZF, bumpScale: 1.4}), 0, 0.06, 0);
    add(b, new THREE.CylinderGeometry(0.018, 0.018, 0.1, 12), M(0xf7f3ea, {roughness: 0.3}), -0.03, 0.15, 0); add(b, new THREE.CylinderGeometry(0.014, 0.014, 0.08, 12), M(0x9fe0c6, {roughness: 0.3}), 0.035, 0.14, 0.02);}
  const bm = grp(Dd, 0.12, 0.86, 0.37); add(bm, rb(0.06, 0.09, 0.04, 0.015), M(0xfbfbf8, {roughness: 0.3}), 0, 0.045, 0); add(bm, new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), M(0xfbfbf8), 0.02, 0.12, 0);
  add(bm, new THREE.SphereGeometry(0.006, 6, 6), emitM(0x7fe08a, 2, 0), -0.015, 0.07, 0.021, false);
  const nl = grp(Dd, 0.05, 0.86, 0.12); add(nl, new THREE.CylinderGeometry(0.045, 0.05, 0.02, 18), wood, 0, 0.01, 0); add(nl, new THREE.TorusGeometry(0.06, 0.03, 12, 24, PI * 1.25), emitM(0xffe2a8, 2.2, 0), 0, 0.09, 0).rotation.z = -0.4;
  practical(Dd, 0.05, 0.98, 0.12, 0xffc27a, 1.8, 0, 3.2, false);
  const ws = grp(Dd, -0.18, 1.45, 0.05); add(ws, rb(0.16, 0.025, 0.55, 0.008), wood, 0, 0, 0);
  plush(ws, 0, 0.012, -0.15, 0xf6d8a8, PI / 2, 'bunny', 0.75); for (const [z, c] of [[0.05, 0xc9d8f0], [0.16, 0xe7cfee]]) {add(ws, new THREE.CylinderGeometry(0.035, 0.035, 0.08, 16), M(0xffffff, {transparent: true, opacity: 0.6, roughness: 0.1}), 0, 0.05, z); add(ws, new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16), M(c), 0, 0.04, z);}}
{const Ch = ITEM(0, 0.82, 0, -1.02, -0.25); const f = fabric(0xe9c46a);
  add(Ch, rb(0.72, 0.16, 0.6, 0.06), f, 0, 0.33, 0.05); add(Ch, rb(0.72, 0.6, 0.16, 0.07), f, 0, 0.66, -0.24); for (const s of [-1, 1]) add(Ch, rb(0.13, 0.3, 0.62, 0.06), f, s * 0.36, 0.47, 0.04);
  for (const [x, z] of [[-0.3, -0.22], [0.3, -0.22], [-0.3, 0.3], [0.3, 0.3]]) add(Ch, new THREE.CylinderGeometry(0.02, 0.014, 0.26, 8), wood, x, 0.13, z);
  add(Ch, rb(0.34, 0.26, 0.1, 0.05), fabric(0xf4f1ea), 0.1, 0.55, -0.12).rotation.x = -0.2;
  const knit = M(0xffffff, {map: tex(256, 256, (g, w, h) => {g.fillStyle = '#9fc9b4'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3; for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 16) {g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 12); g.lineTo(x + 16, y); g.stroke();}}), roughness: 0.95, bumpMap: NZF, bumpScale: 1});
  add(Ch, rb(0.4, 0.025, 0.3, 0.01), knit, -0.08, 0.423, 0.12).rotation.y = 0.25;}   // folded knitted blanket on the seat
{const Fs = ITEM(0, 0.55, 0, -0.42); add(Fs, rb(0.36, 0.16, 0.28, 0.05), fabric(0xe9c46a), 0, 0.17, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(Fs, new THREE.CylinderGeometry(0.014, 0.01, 0.1, 8), wood, sx * 0.14, 0.05, sz * 0.1);}
{const St = ITEM(0, 1.38, 0, -0.95); add(St, new THREE.CylinderGeometry(0.17, 0.17, 0.025, 28), wood, 0, 0.5, 0); add(St, new THREE.CylinderGeometry(0.02, 0.025, 0.5, 10), wood, 0, 0.25, 0); add(St, new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24), wood, 0, 0.01, 0);
  add(St, new THREE.CylinderGeometry(0.03, 0.03, 0.12, 16), M(0xffffff, {transparent: true, opacity: 0.75, roughness: 0.1}), -0.05, 0.575, 0.03); add(St, new THREE.CylinderGeometry(0.028, 0.028, 0.07, 16), M(0xfffbf0), -0.05, 0.55, 0.03);
  add(St, new THREE.CylinderGeometry(0.02, 0.026, 0.03, 12), M(0x9cc8f2, {roughness: 0.4}), -0.05, 0.645, 0.03); add(St, new THREE.SphereGeometry(0.014, 10, 8), M(0xf2d0a0, {roughness: 0.4}), -0.05, 0.67, 0.03);
  plant(St, 0.06, 0.512, -0.03, 0.7, 0xc9d8f0);}
{const rg = ITEM(0, 0.25, 0, 0.35); add(rg, new THREE.CylinderGeometry(0.85, 0.85, 0.012, 64), M(0xffffff, {roughness: 0.95, map: tex(512, 512, (g, w, h) => {g.fillStyle = '#f4ede2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e2d2bd'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w * 0.44, 0, 7); g.stroke(); for (let i = 0; i < 40; i++) {g.fillStyle = ['#bfdcc8', '#f6d8a8', '#c9d8f0', '#e7cfee'][i % 4]; g.beginPath(); g.arc(R() * w, R() * h, 7 + R() * 6, 0, 7); g.fill();}}), bumpMap: NZF, bumpScale: 0.6}), 0, 0.006, 0, false);}
[[0.82, 0.07, 0.62, 0xf7dd7c, 0.3, 'A'], [0.96, 0.07, 0.68, 0x9cc8f2, -0.2, 'B'], [0.88, 0.19, 0.66, 0xc4a8f0, 0.6, 'C'], [0.66, 0.07, 0.8, 0x9fe0c6, 0.1, 'D']].forEach(([x, y, z, c, r, l]) => {
  const b = ITEM(0, x, y - 0.06, z, r); add(b, rb(0.12, 0.12, 0.12, 0.012), [M(c), M(c), M(c), M(c), pic(128, 128, (g, w, h) => {g.fillStyle = hexs(c); g.fillRect(0, 0, w, h); T2(g, l, w / 2, h / 2 + 4, '800 88px "Inter Tight"', '#ffffff');}), M(c)], 0, 0.06, 0);});
{const T = ITEM(0, -0.42, 0, 0.62); add(T, new THREE.CylinderGeometry(0.07, 0.075, 0.03, 20), wood, 0, 0.015, 0); add(T, new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), wood, 0, 0.15, 0);
  [0x9fe0c6, 0xf7dd7c, 0x9cc8f2, 0xc4a8f0].forEach((c, i) => add(T, new THREE.TorusGeometry(0.06 - i * 0.01, 0.022 - i * 0.002, 10, 24), M(c, {roughness: 0.5}), 0, 0.05 + i * 0.045, 0).rotation.x = PI / 2);}
{const B = ITEM(0, 1.05, 0, 0.12); add(B, new THREE.SphereGeometry(0.09, 24, 18), M(0xffffff, {roughness: 0.5, map: tex(256, 128, (g, w, h) => {['#9cc8f2', '#f7dd7c', '#9fe0c6', '#f6b38f'].forEach((c, i) => {g.fillStyle = c; g.fillRect(i * w / 4, 0, w / 4, h);});})}), 0, 0.09, 0);}
{const Hs = ITEM(0, 1.15, 0, 1.0, -0.9); const hm = M(0xf6e3c4, {roughness: 0.55}); for (const sz of [-1, 1]) add(Hs, new THREE.TorusGeometry(0.42, 0.014, 8, 40, 0.95), wood, 0, 0.43, sz * 0.09).rotation.z = -PI / 2 - 0.475;
  for (const [x, z] of [[-0.15, -0.09], [0.15, -0.09], [-0.15, 0.09], [0.15, 0.09]]) add(Hs, new THREE.CylinderGeometry(0.018, 0.016, 0.26, 8), wood, x, 0.14, z).rotation.z = x > 0 ? -0.25 : 0.25;
  add(Hs, new THREE.CapsuleGeometry(0.07, 0.24, 6, 16), hm, 0, 0.3, 0).rotation.z = PI / 2; const hd = grp(Hs, 0.2, 0.42, 0); add(hd, new THREE.CapsuleGeometry(0.045, 0.09, 6, 12), hm, 0, 0, 0).rotation.z = -0.6;
  add(hd, new THREE.SphereGeometry(0.05, 14, 10), hm, 0.05, 0.05, 0).scale.set(1.4, 0.9, 0.9); for (const sz of [-1, 1]) {add(hd, new THREE.SphereGeometry(0.008, 6, 6), M(0x1d1416), 0.08, 0.075, sz * 0.035, false); add(hd, new THREE.ConeGeometry(0.014, 0.04, 8), hm, 0.02, 0.105, sz * 0.025);}
  for (let i = 0; i < 5; i++) add(hd, new THREE.SphereGeometry(0.018, 8, 6), M(0xc9a36a), -0.03 + i * 0.015, 0.06 - i * 0.03, 0);
  add(Hs, rb(0.12, 0.025, 0.15, 0.01), fabric(0x9cc8f2), -0.02, 0.37, 0); add(Hs, new THREE.CapsuleGeometry(0.012, 0.06, 4, 6), M(0xc9a36a), -0.17, 0.26, 0).rotation.z = 0.8;}
{const Tb = ITEM(0, -0.95, 0, 1.15, 0.2); add(Tb, rb(0.52, 0.3, 0.34, 0.03), wood, 0, 0.15, 0); add(Tb, rb(0.48, 0.02, 0.3, 0.008), M(0xd2a77a), 0, 0.302, 0);
  add(Tb, rb(0.2, 0.06, 0.01, 0.01), M(0xf7dd7c, {roughness: 0.5}), 0, 0.17, 0.172); plush(Tb, -0.12, 0.25, -0.02, 0xf6d8a8, 0.2, 'bunny', 0.8); add(Tb, new THREE.SphereGeometry(0.05, 14, 10), M(0x9fe0c6, {roughness: 0.4}), 0.12, 0.3, 0.02);
  add(Tb, rb(0.1, 0.1, 0.02, 0.01), M(0xc4a8f0), 0.03, 0.31, -0.08).rotation.x = 0.4;}
{const Ss = ITEM(0, 0.55, 0, 0.85, 0.5); add(Ss, rb(0.16, 0.16, 0.16, 0.025), M(0xf6b38f, {roughness: 0.5}), 0, 0.08, 0); for (const [x, c] of [[-0.04, 0xf7dd7c], [0.04, 0x9cc8f2]]) add(Ss, new THREE.CylinderGeometry(0.025, 0.025, 0.012, 3), M(c), x, 0.165, 0);}
for (const [x, z, r, c, t] of [[-0.05, 0.95, 0.4, 0x9cc8f2, 'Mond'], [0.08, 1.05, -0.3, 0xf6d8a8, 'Ente']]) {const Bk = ITEM(0, x, 0, z, r); add(Bk, rb(0.16, 0.025, 0.16, 0.008), M(c, {roughness: 0.6}), 0, 0.013, 0);
  add(Bk, new THREE.PlaneGeometry(0.13, 0.13), pic(128, 128, (g, w, h) => {g.fillStyle = hexs(c); g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w / 2, h * 0.42, 30, 0, 7); g.fill(); T2(g, t, w / 2, h * 0.82, '700 24px Poppins', '#3a3f6e');}), 0, 0.027, 0, false).rotation.x = -PI / 2;}
{const Dk = ITEM(0, 0.62, 0, 1.18, 0.6); const y = M(0xf7dd7c, {roughness: 0.5}); add(Dk, rb(0.16, 0.08, 0.1, 0.03), y, 0, 0.085, 0); add(Dk, new THREE.SphereGeometry(0.045, 14, 10), y, 0.07, 0.15, 0);
  add(Dk, new THREE.ConeGeometry(0.02, 0.04, 10), M(0xf6b38f), 0.12, 0.145, 0).rotation.z = -PI / 2; for (const [x, sz] of [[-0.04, -1], [0.04, 1]]) add(Dk, new THREE.CylinderGeometry(0.035, 0.035, 0.015, 16).rotateX(PI / 2), wood, x, 0.035, sz * 0.06);
  for (const sz of [-1, 1]) add(Dk, new THREE.SphereGeometry(0.006, 6, 6), M(0x1d1416), 0.1, 0.165, sz * 0.022, false);}
{const Lb = ITEM(0, -0.55, 0, -1.2); basket(Lb, 0, 0, [[0xf6d38a, 0, 0.02, 0, 0.2, 0.1], [0xc9d8f0, 0.04, 0.06, 0.03, -0.3, 0.2]], 0xe8dcc6);}
{const W0 = ITEM(0, 0, 0, 0); const st = M(0xf7dd7c, {roughness: 0.8});
  for (const [x, y, s] of [[-1.55, 2.2, 1], [-1.0, 2.25, 0.85], [-0.6, 2.3, 0.6]]) add(W0, new THREE.OctahedronGeometry(0.045 * s, 0), st, x, y, Z0 + 0.012, false).scale.z = 0.2;
  const pts = []; for (let i = 0; i <= 12; i++) {const u = i / 12; pts.push(V3(X0 + 0.01, 1.95 - Math.sin(u * PI) * 0.18, -1.45 + u * 1.25));}
  const curve = new THREE.CatmullRomCurve3(pts); add(W0, new THREE.TubeGeometry(curve, 40, 0.004, 6), M(0xf4f1ea), 0, 0, 0, false);
  for (let i = 1; i < 12; i++) {const p = curve.getPoint(i / 12), f = add(W0, new THREE.ConeGeometry(0.045, 0.1, 3), M([0x9fe0c6, 0xf7dd7c, 0xc9d8f0, 0xe7cfee, 0xf6b38f][i % 5], {roughness: 0.8}), p.x + 0.012, p.y - 0.05, p.z, false);
    f.rotation.set(PI, 0, 0); f.scale.x = 0.15;}
  frame(W0, -0.75, 1.55, Z0 + 0.012, 0.26, 0.32, (g, w, h) => {g.fillStyle = '#f6efe4'; g.fillRect(0, 0, w, h); g.fillStyle = '#e59a5a'; g.beginPath(); g.moveTo(w * 0.2, h * 0.7); g.lineTo(w * 0.5, h * 0.25); g.lineTo(w * 0.8, h * 0.7); g.fill();
    g.beginPath(); g.moveTo(w * 0.28, h * 0.42); g.lineTo(w * 0.33, h * 0.18); g.lineTo(w * 0.42, h * 0.36); g.fill(); g.beginPath(); g.moveTo(w * 0.72, h * 0.42); g.lineTo(w * 0.67, h * 0.18); g.lineTo(w * 0.58, h * 0.36); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(w * 0.4, h * 0.6); g.lineTo(w * 0.5, h * 0.7); g.lineTo(w * 0.6, h * 0.6); g.fill(); T2(g, 'Fuchs', w / 2, h * 0.86, '600 26px Poppins', '#8a6a4a');});
  frame(W0, -0.75, 1.15, Z0 + 0.012, 0.26, 0.32, (g, w, h) => {g.fillStyle = '#eef3f6'; g.fillRect(0, 0, w, h); g.fillStyle = '#9aa7b8'; g.beginPath(); g.arc(w / 2, h * 0.5, 50, 0, 7); g.fill();
    for (const sx of [-1, 1]) {g.beginPath(); g.arc(w / 2 + sx * 38, h * 0.3, 18, 0, 7); g.fill();} T2(g, 'Bär', w / 2, h * 0.86, '600 26px Poppins', '#6a7788');});
  const cs = grp(W0, -1.2, 1.38, Z0 + 0.06); for (const [x, y, s] of [[0, 0, 0.09], [-0.11, -0.02, 0.07], [0.11, -0.02, 0.07]]) add(cs, new THREE.SphereGeometry(s, 16, 12), white, x, y, 0).scale.set(1.2, 0.8, 0.5);
  add(cs, rb(0.36, 0.02, 0.1, 0.008), wood, 0, -0.07, 0.02); plush(cs, 0.08, -0.06, 0.03, 0xe7cfee, 0, 'bunny', 0.5);}
{const ws = ITEM(0, 0.8, 0, 0); plant(ws, -0.35, WY0, Z0 + 0.07, 0.6, 0xe7cfee); add(ws, new THREE.SphereGeometry(0.04, 14, 10), emitM(0xffe8b0, 1.5, 0), 0.3, WY0 + 0.04, Z0 + 0.07).scale.set(1, 0.9, 0.6);}
{const K = human(ITEM(0, 0, 0, 0), 0.18, 0.42, 0.45, {type: 'toddler', shirt: 0xf6d38a, pants: 0xf6d38a, shoes: 0xffffff, hair: 0x9a6a44, buttons: true});
  K.HP.position.y = 0.045; for (const [i, l] of K.legs.entries()) {l.L.rotation.x = -PI / 2 + 0.08; l.L.rotation.z = (i ? 1 : -1) * 0.28;}
  for (const [i, s] of [[0, -1], [1, 1]]) {K.arms[i].S.rotation.set(-0.95, 0, s * -0.3); K.arms[i].E.rotation.x = -0.75;}
  teddy(K.TJ, 0, 0.03, K.P.depth / 2 + 0.05, 0.95, 0); K.HJ.rotation.set(0.12, 0, 0.05); KIDS[0] = K;}
// ---------- age 1: school child
function bed(par, blanketMat, pillowC, frameM) {const B = grp(par, -1.185, 0, -0.5);
  add(B, rb(0.95, 0.24, 1.95, 0.03), frameM, 0, 0.17, 0); for (const [x, z] of [[-0.42, -0.92], [0.42, -0.92], [-0.42, 0.92], [0.42, 0.92]]) add(B, rb(0.06, 0.06, 0.06, 0.01), frameM, x, 0.03, z);
  add(B, rb(0.9, 0.16, 1.88, 0.05), fabric(0xf7f5f0), 0, 0.36, 0); add(B, rb(0.95, 0.82, 0.06, 0.03), frameM, 0, 0.45, -0.97);
  add(B, rb(0.56, 0.11, 0.34, 0.05), fabric(pillowC), 0, 0.49, -0.7); add(B, rb(0.96, 0.07, 1.3, 0.035), blanketMat, 0, 0.455, 0.29).rotation.x = -0.012;
  add(B, rb(0.98, 0.2, 0.05, 0.02), blanketMat, 0, 0.37, 0.95).rotation.x = 0.05; return B;}
function shelf(par, items) {const S = grp(par, -1.51, 0, 0.95, PI / 2); const h = 1.45, w = 0.8, d = 0.3;
  for (const sx of [-1, 1]) add(S, rb(0.025, h, d, 0.008), white, sx * w / 2, h / 2, 0); add(S, rb(w, h, 0.012, 0.004), white, 0, h / 2, -d / 2 + 0.006);
  [0.02, 0.37, 0.72, 1.07, 1.44].forEach(y => add(S, rb(w, 0.022, d, 0.006), white, 0, y, 0)); items(S, w, d); return S;}
function desk(par) {const D = grp(par, 0.8, 0, -1.2); add(D, rb(1.0, 0.035, 0.56, 0.01), wood, 0, 0.735, 0);
  for (const [x, z] of [[-0.46, -0.24], [-0.46, 0.24], [0.46, -0.24], [0.46, 0.24]]) add(D, rb(0.035, 0.72, 0.035, 0.008), white, x, 0.36, z); return D;}
const rocketT = tex(512, 512, (g, w, h) => {g.fillStyle = '#7fb3e0'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) {const x = (i * 137) % w, y = (i * 211) % h; g.save(); g.translate(x, y); g.rotate(-0.6); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(-6, -18, 12, 30); g.beginPath(); g.moveTo(-6, -18); g.lineTo(0, -30); g.lineTo(6, -18); g.fill(); g.fillStyle = '#f7dd7c'; g.fillRect(-4, 12, 8, 8); g.restore();}
  g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 40; i++) g.fillRect(R() * w, R() * h, 3, 3);});
{const B = bed(ITEM(1, 0, 0, 0), M(0xffffff, {map: rocketT, roughness: 0.95, bumpMap: NZF, bumpScale: 0.5}), 0xffffff, wood);
  teddy(B, -0.15, 0.49, -0.68, 1.0, 0.5); plush(B, 0.18, 0.5, -0.72, 0x9fe0c6, -0.3, 'bunny', 0.85);
  const ob = grp(B, 0.1, 0.495, 0.25, 0.4); add(ob, rb(0.24, 0.012, 0.17, 0.004), M(0xfbfaf6), 0, 0.006, 0); add(ob, rb(0.25, 0.006, 0.18, 0.003), M(0x5fb98a), 0, -0.002, 0);}
{const Nt = ITEM(1, -0.55, 0, -1.32); add(Nt, rb(0.36, 0.46, 0.32, 0.02), white, 0, 0.23, 0); add(Nt, rb(0.012, 0.18, 0.28, 0.006), M(0xf2eee8), 0.18, 0.3, 0); add(Nt, new THREE.SphereGeometry(0.015, 8, 6), wood, 0.19, 0.3, 0);
  const ac = grp(Nt, -0.06, 0.46, 0.05, 0.4); add(ac, new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20).rotateX(PI / 2), M(0x9cc8f2, {roughness: 0.4}), 0, 0.05, 0); add(ac, new THREE.CircleGeometry(0.036, 20), M(0xfbfaf6), 0, 0.05, 0.016, false);
  for (const sx of [-1, 1]) add(ac, new THREE.SphereGeometry(0.016, 10, 8), M(0x9cc8f2, {roughness: 0.4}), sx * 0.03, 0.095, 0);
  const lm = grp(Nt, 0.08, 0.46, -0.04); add(lm, new THREE.CylinderGeometry(0.04, 0.05, 0.03, 16), M(0xf7dd7c), 0, 0.015, 0); add(lm, new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), M(0xf4f1ea), 0, 0.1, 0);
  add(lm, new THREE.CylinderGeometry(0.06, 0.085, 0.1, 20, 1, true), emitM(0xfff0cc, 0.8, 1), 0, 0.2, 0); practical(Nt, 0.08, 0.67, -0.04, 0xffd29a, 1.0, 1, 2.4, false);}
{const D = desk(ITEM(1, 0, 0, 0)); deskLamp(D, -0.38, 0.75, -0.12, 0.3, 0xf7f3ea, 1);
  const gb = grp(D, 0.33, 0.75, -0.1); add(gb, new THREE.CylinderGeometry(0.05, 0.06, 0.02, 16), wood, 0, 0.01, 0); add(gb, new THREE.TorusGeometry(0.105, 0.006, 6, 30, PI), M(0xc9a650, {metalness: 0.5, roughness: 0.4}), 0, 0.13, 0).rotation.z = PI / 2 + 0.4;
  add(gb, new THREE.SphereGeometry(0.095, 24, 18), M(0xffffff, {roughness: 0.5, map: tex(256, 128, (g, w, h) => {g.fillStyle = '#5fa3d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#9fd18a';
    for (const [x, y, rx, ry] of [[0.2, 0.35, 0.08, 0.14], [0.28, 0.65, 0.05, 0.14], [0.52, 0.3, 0.06, 0.08], [0.55, 0.55, 0.06, 0.14], [0.72, 0.35, 0.12, 0.1], [0.85, 0.7, 0.05, 0.05]]) {g.beginPath(); g.ellipse(x * w, y * h, rx * w, ry * h, 0, 0, 7); g.fill();}})}), 0, 0.13, 0);
  books(D, -0.12, 0.735, 4, [0xf6b38f, 0x9fe0c6, 0x6f8fb0, 0xf7dd7c], 0.12);
  const nb = grp(D, 0.02, 0.755, 0.1, 0.15); add(nb, rb(0.3, 0.008, 0.22, 0.003), M(0xfbfaf6), 0, 0, 0); add(nb, new THREE.PlaneGeometry(0.13, 0.2), pic(128, 196, (g, w, h) => {g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9d8f0'; for (let i = 1; i < 12; i++) {g.beginPath(); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke();} g.fillStyle = '#f7dd7c'; g.beginPath(); g.arc(70, 60, 22, 0, 7); g.fill(); g.fillStyle = '#5fb98a'; g.fillRect(20, 130, 90, 30);}), 0.07, 0.005, 0, false).rotation.x = -PI / 2;
  const pc = grp(D, 0.2, 0.752, 0.1); add(pc, new THREE.CylinderGeometry(0.035, 0.03, 0.09, 14), M(0xc4a8f0), 0, 0.045, 0); [[0xf7dd7c, -0.15], [0x5fb98a, 0], [0x9cc8f2, 0.15], [0xf6b38f, 0.25]].forEach(([c, r], i) => add(pc, new THREE.CylinderGeometry(0.005, 0.005, 0.15, 6), M(c), Math.sin(r) * 0.02, 0.12, (i - 1.5) * 0.008).rotation.z = r);
  add(D, rb(0.25, 0.004, 0.03, 0.002), M(0xf7dd7c), 0.15, 0.755, 0.22).rotation.y = 0.1; add(D, rb(0.04, 0.015, 0.025, 0.006), M(0xf6b38f), 0.3, 0.76, 0.2);
  const cr = grp(D, -0.3, 0.752, 0.18, -0.2); add(cr, rb(0.12, 0.02, 0.08, 0.004), M(0xf7dd7c), 0, 0.01, 0); [0x5fb98a, 0x6f8fb0, 0xf6b38f, 0xc4a8f0].forEach((c, i) => add(cr, new THREE.CylinderGeometry(0.005, 0.005, 0.1, 6).rotateZ(PI / 2), M(c), 0, 0.025, -0.025 + i * 0.016));
  const ch = grp(ITEM(1, 0, 0, 0), 0.7, 0, -0.68, PI + 0.3); add(ch, rb(0.4, 0.04, 0.38, 0.012), wood, 0, 0.44, 0); add(ch, rb(0.4, 0.3, 0.03, 0.012), wood, 0, 0.66, -0.18);
  for (const [x, z] of [[-0.17, -0.16], [0.17, -0.16], [-0.17, 0.16], [0.17, 0.16]]) add(ch, rb(0.03, 0.44, 0.03, 0.008), M(0x9cc8f2, {roughness: 0.5}), x, 0.22, z);
  add(ch, rb(0.38, 0.06, 0.07, 0.025), fabric(0x6f8fb0), 0.0, 0.82, -0.18); add(ch, rb(0.36, 0.26, 0.025, 0.012), fabric(0x6f8fb0), 0.0, 0.68, -0.21);}   // jacket over the chair back
shelf(ITEM(1, 0, 0, 0), (S, w, d) => {books(S, -w / 2 + 0.03, 0.02, 9, [0xf6b38f, 0x9cc8f2, 0xf7dd7c, 0x9fe0c6, 0xc4a8f0, 0x6f8fb0]); books(S, -w / 2 + 0.03, 0.37, 6, [0x9fe0c6, 0xf7dd7c, 0x6f8fb0, 0xc4a8f0]);
  const dn = grp(S, 0.2, 0.38, 0.0, -0.4); const dm = M(0x58b48c, {roughness: 0.6}); add(dn, new THREE.SphereGeometry(0.06, 14, 10), dm, 0, 0.06, 0).scale.set(1.4, 0.9, 0.8);
  add(dn, new THREE.CapsuleGeometry(0.02, 0.08, 4, 8), dm, 0.07, 0.12, 0).rotation.z = -0.6; add(dn, new THREE.SphereGeometry(0.03, 12, 10), dm, 0.11, 0.17, 0).scale.set(1.4, 0.9, 0.9);
  add(dn, new THREE.ConeGeometry(0.03, 0.12, 10), dm, -0.11, 0.06, 0).rotation.z = PI / 2 + 0.3; for (const [x, z] of [[-0.04, -0.03], [0.04, -0.03], [-0.04, 0.03], [0.04, 0.03]]) add(dn, new THREE.CylinderGeometry(0.014, 0.014, 0.04, 8), dm, x, 0.02, z);
  for (let i = 0; i < 4; i++) add(dn, new THREE.ConeGeometry(0.012, 0.03, 4), M(0xf7dd7c), -0.05 + i * 0.03, 0.115 - Math.abs(i - 1.5) * 0.005, 0);
  books(S, -0.1, 0.72, 5, [0xf6b38f, 0x9cc8f2, 0xf7dd7c]); const car = grp(S, -0.22, 1.1, 0.03); add(car, rb(0.16, 0.05, 0.08, 0.02), M(0xf7dd7c, {roughness: 0.4}), 0, 0.035, 0); add(car, rb(0.08, 0.04, 0.07, 0.015), M(0x9cc8f2, {roughness: 0.2}), -0.01, 0.075, 0);
  for (const [x, z] of [[-0.05, -0.04], [0.05, -0.04], [-0.05, 0.04], [0.05, 0.04]]) add(car, new THREE.CylinderGeometry(0.018, 0.018, 0.015, 12).rotateX(PI / 2), metal, x, 0.018, z);
  const lg = grp(S, 0.15, 1.09, 0.0); [[0xf7dd7c, 0, 0], [0x5fb98a, 0.025, 0.04], [0x6f8fb0, -0.02, 0.08], [0xf6b38f, 0.01, 0.12]].forEach(([c, x, y]) => {add(lg, rb(0.09, 0.04, 0.05, 0.004), M(c, {roughness: 0.3}), x, y + 0.02, 0);
    for (const sx of [-1, 1]) add(lg, new THREE.CylinderGeometry(0.01, 0.01, 0.008, 10), M(c, {roughness: 0.3}), x + sx * 0.022, y + 0.044, 0);});
  const md = grp(S, 0.28, 1.09, 0.08); add(md, new THREE.CylinderGeometry(0.03, 0.03, 0.006, 20).rotateX(PI / 2), M(0xd4af37, {metalness: 0.7, roughness: 0.3}), 0, 0.12, 0); add(md, rb(0.02, 0.1, 0.004, 0.002), M(0x6f8fb0), 0, 0.18, -0.002);});
{const Mp = ITEM(1, -1.2, 1.55, Z0 + 0.008); add(Mp, rb(0.7, 0.46, 0.012, 0.004), M(0xffffff, {map: tex(700, 460, (g, w, h) => {g.fillStyle = '#cfe6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#8fcf7e';
      for (const [x, y, rx, ry, r] of [[0.2, 0.33, 0.1, 0.13, 0.3], [0.27, 0.68, 0.05, 0.15, 0.2], [0.49, 0.28, 0.06, 0.07, 0], [0.52, 0.55, 0.07, 0.15, 0], [0.7, 0.32, 0.15, 0.11, 0], [0.82, 0.72, 0.06, 0.05, 0]]) {g.beginPath(); g.ellipse(x * w, y * h, rx * w, ry * h, r, 0, 7); g.fill();}
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; for (let i = 1; i < 6; i++) {g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke();}
      g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.strokeRect(0, 0, w, h); T2(g, 'WELTKARTE', w / 2, h - 34, '700 28px Poppins', '#3a6a8a');}), roughness: 0.6}), 0, 0, 0);
  for (const [x, y] of [[-0.33, 0.21], [0.33, 0.21], [-0.33, -0.21], [0.33, -0.21]]) add(Mp, new THREE.SphereGeometry(0.01, 8, 6), M(0xf6b38f, {roughness: 0.3}), x, y, 0.01, false);}
{const Pb = ITEM(1, -0.52, 1.45, Z0 + 0.01); Pb.scale.setScalar(0.85); add(Pb, rb(0.42, 0.34, 0.02, 0.008), M(0xc9a372, {roughness: 0.95, bumpMap: NZF, bumpScale: 1}), 0, 0, 0); add(Pb, rb(0.44, 0.36, 0.015, 0.006), wood, 0, 0, -0.004);
  [[-0.1, 0.07, 0.14, 0.12, (g, w, h) => {g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#f7dd7c'; g.beginPath(); g.arc(w * 0.75, h * 0.25, 20, 0, 7); g.fill(); g.fillStyle = '#f6b38f'; g.fillRect(w * 0.2, h * 0.5, w * 0.35, h * 0.35); g.fillStyle = '#c9775a'; g.beginPath(); g.moveTo(w * 0.15, h * 0.5); g.lineTo(w * 0.375, h * 0.25); g.lineTo(w * 0.6, h * 0.5); g.fill(); g.fillStyle = '#5fb98a'; g.fillRect(0, h * 0.85, w, h * 0.15);}, -0.08],
   [0.1, 0.06, 0.13, 0.15, (g, w, h) => {g.fillStyle = '#fff6c9'; g.fillRect(0, 0, w, h); T2(g, 'STUNDENPLAN', w / 2, 20, '700 15px Poppins', '#3a3f6e'); g.strokeStyle = '#9cc8f2'; g.lineWidth = 2; for (let i = 1; i < 6; i++) {g.beginPath(); g.moveTo(10, 30 + i * 30); g.lineTo(w - 10, 30 + i * 30); g.stroke(); g.beginPath(); g.moveTo(i * w / 6, 36); g.lineTo(i * w / 6, h - 8); g.stroke();}}, 0.05],
   [-0.08, -0.09, 0.12, 0.09, (g, w, h) => {g.fillStyle = '#d5ecf7'; g.fillRect(0, 0, w, h); g.fillStyle = '#6f8fb0'; g.beginPath(); g.arc(w * 0.3, h * 0.6, 22, 0, 7); g.fill(); g.beginPath(); g.arc(w * 0.62, h * 0.58, 26, 0, 7); g.fill(); g.fillStyle = '#f1c8a6'; g.beginPath(); g.arc(w * 0.3, h * 0.32, 12, 0, 7); g.fill(); g.beginPath(); g.arc(w * 0.62, h * 0.3, 14, 0, 7); g.fill();}, 0.1],
   [0.11, -0.1, 0.1, 0.08, (g, w, h) => {g.fillStyle = '#f6b38f'; g.fillRect(0, 0, w, h); T2(g, 'Sport Di!', w / 2, h / 2, '700 22px Poppins', '#3a3f6e');}, -0.12]].forEach(([x, y, w, h, d, r], i) => {
    add(Pb, new THREE.PlaneGeometry(w, h), pic(128, Math.round(128 * h / w), d), x, y, 0.012, false).rotation.z = r; add(Pb, new THREE.SphereGeometry(0.007, 6, 6), M([0xf6b38f, 0x9fe0c6, 0xf7dd7c, 0xc4a8f0][i]), x, y + h / 2 - 0.012, 0.016, false);});}
{const Rg = ITEM(1, 0.45, 0, 0.45); add(Rg, rb(1.5, 0.012, 1.0, 0.005), M(0xffffff, {roughness: 0.95, bumpMap: NZF, bumpScale: 0.5, map: tex(768, 512, (g, w, h) => {g.fillStyle = '#9fcf8a'; g.fillRect(0, 0, w, h);
    const road = () => {g.beginPath(); g.moveTo(60, 120); g.lineTo(w - 60, 120); g.moveTo(200, 120); g.lineTo(200, h - 60); g.moveTo(60, h - 120); g.lineTo(w - 60, h - 120); g.moveTo(560, 120); g.lineTo(560, h - 120); g.stroke();};
    g.strokeStyle = '#6b6f86'; g.lineWidth = 54; g.lineCap = 'round'; road(); g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.setLineDash([18, 16]); road(); g.setLineDash([]);
    g.fillStyle = '#9cc8f2'; g.beginPath(); g.ellipse(380, 270, 90, 50, 0, 0, 7); g.fill(); for (let i = 0; i < 10; i++) {g.fillStyle = '#5fa85a'; g.beginPath(); g.arc(300 + (i % 5) * 40, 220 + Math.floor(i / 5) * 110, 14, 0, 7); g.fill();}
    for (const [x, y, c] of [[660, 300, '#f6b38f'], [100, 300, '#f7dd7c']]) {g.fillStyle = c; g.fillRect(x - 30, y - 30, 60, 50); g.fillStyle = '#c9775a'; g.beginPath(); g.moveTo(x - 38, y - 30); g.lineTo(x, y - 60); g.lineTo(x + 38, y - 30); g.fill();}})}), 0, 0.006, 0, false);
  for (const [x, z, r, c] of [[-0.35, -0.28, 0, 0x6f8fb0], [0.25, 0.3, PI / 2, 0xf7dd7c]]) {const car = grp(Rg, x, 0.012, z, r); add(car, rb(0.1, 0.035, 0.05, 0.012), M(c, {roughness: 0.4}), 0, 0.03, 0); add(car, rb(0.05, 0.03, 0.045, 0.01), M(0xcfe2f0, {roughness: 0.2}), -0.005, 0.058, 0);
    for (const [cx, cz] of [[-0.03, -0.025], [0.03, -0.025], [-0.03, 0.025], [0.03, 0.025]]) add(car, new THREE.CylinderGeometry(0.012, 0.012, 0.01, 10).rotateX(PI / 2), metal, cx, 0.012, cz);}}
{const Fb = ITEM(1, 1.05, 0, 0.75); add(Fb, new THREE.IcosahedronGeometry(0.1, 3), M(0xffffff, {roughness: 0.5, map: tex(256, 128, (g, w, h) => {g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2d33'; for (let i = 0; i < 12; i++) {g.beginPath(); g.arc(R() * w, R() * h, 12, 0, 7); g.fill();}})}), 0, 0.1, 0);}
{const Bb = ITEM(1, 1.2, 0, 1.05, -0.5); const kt = M(0xffffff, {map: tex(256, 128, (g, w, h) => {g.fillStyle = '#e9c46a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 3;   // knitted pouf
    for (let x = 0; x < w; x += 12) for (let y = 0; y < h; y += 12) {g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + 10); g.lineTo(x + 12, y); g.stroke();}}), roughness: 0.95, bumpMap: NZF, bumpScale: 1.2});
  add(Bb, new THREE.CylinderGeometry(0.22, 0.23, 0.26, 32), kt, 0, 0.15, 0); add(Bb, new THREE.TorusGeometry(0.205, 0.035, 10, 32), kt, 0, 0.28, 0).rotation.x = PI / 2; add(Bb, new THREE.CylinderGeometry(0.205, 0.205, 0.04, 32), kt, 0, 0.29, 0);
  add(Bb, new THREE.TorusGeometry(0.215, 0.03, 10, 32), kt, 0, 0.03, 0).rotation.x = PI / 2;}
for (const [x, z, r] of [[-0.3, 1.2, 0.3], [-0.18, 1.26, 0.1]]) {const s = ITEM(1, x, 0, z, r); add(s, rb(0.075, 0.05, 0.19, 0.025), M(0x6f8fb0, {roughness: 0.6}), 0, 0.03, 0); add(s, rb(0.08, 0.015, 0.195, 0.006), M(0xffffff), 0, 0.008, 0);
  add(s, rb(0.06, 0.004, 0.06, 0.002), M(0xf7dd7c), 0, 0.056, 0.03, false);}
for (const [x, z, c, r] of [[-0.05, 0.95, 0xf7dd7c, 0.3], [0.05, 1.02, 0x9cc8f2, -0.4], [0.12, 0.92, 0x5fb98a, 0.8], [-0.02, 1.06, 0xf6b38f, 1.2]]) {const lb = ITEM(1, x, 0, z, r); add(lb, rb(0.045, 0.02, 0.025, 0.004), M(c, {roughness: 0.3}), 0, 0.01, 0); for (const sx of [-1, 1]) add(lb, new THREE.CylinderGeometry(0.006, 0.006, 0.006, 8), M(c, {roughness: 0.3}), sx * 0.011, 0.023, 0);}
{const ws = ITEM(1, 0.8, 0, 0); const cc = grp(ws, -0.38, WY0, Z0 + 0.07); add(cc, new THREE.CylinderGeometry(0.035, 0.03, 0.05, 14), M(0xf6b38f), 0, 0.025, 0); add(cc, new THREE.CapsuleGeometry(0.02, 0.05, 4, 8), M(0x5fa85a), 0, 0.09, 0);
  const rk = grp(ws, 0.3, WY0, Z0 + 0.07); add(rk, new THREE.CylinderGeometry(0.02, 0.02, 0.12, 12), M(0xf4f1ea, {roughness: 0.4}), 0, 0.08, 0); add(rk, new THREE.ConeGeometry(0.02, 0.05, 12), M(0x6f8fb0), 0, 0.165, 0);
  for (let i = 0; i < 3; i++) add(rk, rb(0.004, 0.04, 0.025, 0.002), M(0x6f8fb0), Math.cos(i * 2.1) * 0.02, 0.03, Math.sin(i * 2.1) * 0.02).rotation.y = -i * 2.1;}
{const K = human(ITEM(1, 0, 0, 0), 0.25, 0.3, 0.42, {type: 'kid', shirt: 0x5fb98a, pants: 0x46659a, shoes: 0x6f8fb0, sole: 0xffffff, hair: 0x6b4a2e, cuffs: 0x3d5a88,
    print: tex(128, 128, (g, w, h) => {g.fillStyle = '#f7dd7c'; g.beginPath(); for (let k = 0; k < 10; k++) {const r = k % 2 ? 22 : 50, a = k * PI / 5; g.lineTo(w / 2 + Math.sin(a) * r, h / 2 - Math.cos(a) * r);} g.fill();})});
  const bp = grp(K.TJ, 0, K.P.torso * 0.55, -K.P.depth / 2 - 0.07); add(bp, rb(0.27, 0.3, 0.13, 0.04), M(0xf2b134, {roughness: 0.6}), 0, 0, 0);
  add(bp, rb(0.22, 0.12, 0.03, 0.02), M(0x3d6fa8, {roughness: 0.5}), 0, -0.05, 0.075); add(bp, rb(0.06, 0.02, 0.035, 0.008), M(0xdfe3ea, {metalness: 0.6, roughness: 0.3}), 0, 0.02, 0.09);
  for (const s of [-1, 1]) {add(bp, rb(0.06, 0.06, 0.01, 0.005), glow(0xfff1a0, 0.2), s * 0.08, -0.08, -0.068, false); add(K.TJ, rb(0.03, 0.28, 0.012, 0.006), M(0x3d6fa8), s * 0.07, K.P.torso * 0.6, K.P.depth / 2 + 0.006).rotation.x = 0.05;}
  K.arms[0].S.rotation.set(-0.15, 0, -0.18); K.arms[0].E.rotation.x = -0.25; K.arms[1].S.rotation.set(0.1, 0, 0.2); K.arms[1].E.rotation.x = -0.15; K.HJ.rotation.set(0.0, 0.1, -0.04); KIDS[1] = K;}
// ---------- age 2: teenager
{const B = bed(ITEM(2, 0, 0, 0), fabric(0x4a5568), 0xd5d9e0, M(0x3b3f48, {roughness: 0.6}));
  add(B, rb(0.5, 0.1, 0.3, 0.05), fabric(0x9aa1ad), 0.2, 0.5, -0.62).rotation.y = 0.2;
  add(B, rb(0.05, 0.025, 0.04, 0.012), M(0xfbfbf8, {roughness: 0.3}), -0.3, 0.507, 0.55);}
{const Lk = ITEM(2, 0, 0, 0); const n = 11, pts = []; for (let i = 0; i <= 20; i++) {const u = i / 20; pts.push(V3(-1.66 + u * 1.0, 1.32 - Math.sin(u * PI) * 0.12 - 0.04 * Math.sin(u * PI * 2), Z0 + 0.03));}
  const cv = new THREE.CatmullRomCurve3(pts); add(Lk, new THREE.TubeGeometry(cv, 60, 0.003, 5), M(0x2b2d33), 0, 0, 0, false);
  for (let i = 1; i < n; i++) {const p = cv.getPoint(i / n); add(Lk, new THREE.SphereGeometry(0.014, 10, 8), emitM(0xffd59a, 2.6, 2), p.x, p.y - 0.012, p.z + 0.005, false);}
  practical(Lk, -1.15, 1.25, -1.3, 0xffc27a, 0.9, 2, 2.0, false);}
{const D = desk(ITEM(2, 0, 0, 0)); const scr = tex(640, 380, (g, w, h) => {const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2b3a78'); gr.addColorStop(1, '#7a3fa0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 6; i++) g.fillRect(40, 60 + i * 44, 220 + R() * 300, 14); g.fillStyle = '#9fe0c6'; g.fillRect(40, 330, 160, 18); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(470, 40, 140, 300);});
  add(D, rb(0.18, 0.012, 0.14, 0.004), metal, 0, 0.758, -0.12); add(D, rb(0.04, 0.24, 0.02, 0.006), metal, 0, 0.87, -0.15);
  add(D, rb(0.62, 0.37, 0.03, 0.01), M(0x15161a, {roughness: 0.3}), 0, 1.05, -0.13);
  const sm2 = new THREE.MeshStandardMaterial({map: scr, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 0, roughness: 0.4}); sm2.userData = {I: NIGHT ? 1.6 : 0.85, age: 2}; EMIT.push(sm2);
  add(D, new THREE.PlaneGeometry(0.59, 0.34), sm2, 0, 1.05, -0.113, false);
  for (const [x, c] of [[-0.27, 0xf7dd7c], [-0.22, 0x9fe0c6]]) add(D, new THREE.PlaneGeometry(0.045, 0.045), M(c, {roughness: 0.8}), x, 1.2, -0.112, false).rotation.z = 0.1;
  const kb = grp(D, -0.03, 0.753, 0.12); add(kb, rb(0.42, 0.018, 0.13, 0.006), M(0x2b2d33, {roughness: 0.5}), 0, 0.009, 0);
  add(kb, new THREE.PlaneGeometry(0.4, 0.11), new THREE.MeshStandardMaterial({map: tex(400, 110, (g, w, h) => {g.fillStyle = '#2b2d33'; g.fillRect(0, 0, w, h); for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) {g.fillStyle = '#3d4049'; g.fillRect(4 + c * 26.3, 4 + r * 21, 23, 18);}}),
    emissive: 0x8a7dff, emissiveIntensity: NIGHT ? 0.25 : 0.0, roughness: 0.6}), 0, 0.019, 0, false).rotation.x = -PI / 2;
  add(D, rb(0.24, 0.004, 0.2, 0.002), M(0x15161a, {roughness: 0.9}), 0.32, 0.755, 0.1); add(D, rb(0.06, 0.02, 0.1, 0.02), M(0x2b2d33, {roughness: 0.4}), 0.32, 0.765, 0.1);
  const hp = grp(D, -0.4, 0.75, 0.02); add(hp, new THREE.CylinderGeometry(0.04, 0.05, 0.015, 16), metal, 0, 0.008, 0); add(hp, new THREE.CylinderGeometry(0.008, 0.008, 0.24, 8), metal, 0, 0.12, 0);
  add(hp, new THREE.TorusGeometry(0.075, 0.012, 8, 20, PI), M(0x2b2d33), 0, 0.2, 0).rotation.y = 0.3; for (const s of [-1, 1]) add(hp, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16).rotateZ(PI / 2), M(0x9fe0c6), s * 0.072 * Math.cos(0.3), 0.2, -s * 0.072 * Math.sin(0.3));
  add(D, new THREE.CylinderGeometry(0.03, 0.03, 0.11, 16), M(0x58b48c, {metalness: 0.4, roughness: 0.3}), 0.45, 0.8, -0.05); const mg = grp(D, 0.22, 0.752, -0.18); add(mg, new THREE.CylinderGeometry(0.035, 0.032, 0.09, 16), M(0xf4f1ea, {roughness: 0.3}), 0, 0.045, 0);
  add(mg, new THREE.TorusGeometry(0.022, 0.007, 6, 12, PI), M(0xf4f1ea, {roughness: 0.3}), 0.035, 0.05, 0).rotation.z = -PI / 2;
  deskLamp(D, -0.33, 0.75, -0.2, 0.6, 0x2b2d33, 2);
  const pcT = grp(D, 0.32, 0, 0.0); add(pcT, rb(0.2, 0.44, 0.42, 0.01), M(0x15161a, {roughness: 0.3}), 0, 0.23, 0);
  for (const [y, z] of [[0.33, 0.1], [0.33, -0.1], [0.13, 0.1]]) add(pcT, new THREE.TorusGeometry(0.06, 0.008, 8, 24), emitM(0xa070ff, 2.2, 2), -0.105, y, z, false).rotation.y = PI / 2;
  practical(pcT, -0.25, 0.25, 0, 0xa070ff, 0.6, 2, 1.4, false); practical(D, 0, 1.05, 0.15, 0x8a7dff, 1.4, 2, 2.6, false); practical(D, -0.25, 1.15, -0.1, 0xffc27a, 1.2, 2, 3.2, true);
  const ch = grp(ITEM(2, 0, 0, 0), 0.75, 0, -0.62, PI + 0.5); const cm = M(0x2b2d33, {roughness: 0.5}); add(ch, rb(0.46, 0.08, 0.44, 0.03), cm, 0, 0.48, 0); add(ch, rb(0.44, 0.62, 0.07, 0.05), cm, 0, 0.85, -0.22);
  add(ch, rb(0.3, 0.42, 0.075, 0.04), M(0x9fe0c6, {roughness: 0.6}), 0, 0.86, -0.2); add(ch, new THREE.CylinderGeometry(0.025, 0.025, 0.3, 10), metal, 0, 0.3, 0);
  for (const s of [-1, 1]) {add(ch, rb(0.05, 0.025, 0.28, 0.01), cm, s * 0.25, 0.65, 0.02); add(ch, rb(0.025, 0.14, 0.03, 0.008), metal, s * 0.25, 0.57, 0.05);}
  for (let i = 0; i < 5; i++) {const a = i * PI * 2 / 5; add(ch, rb(0.26, 0.025, 0.035, 0.01), metal, Math.cos(a) * 0.13, 0.07, Math.sin(a) * 0.13).rotation.y = -a; add(ch, new THREE.SphereGeometry(0.025, 10, 8), cm, Math.cos(a) * 0.25, 0.025, Math.sin(a) * 0.25);}
  add(ch, rb(0.46, 0.3, 0.05, 0.03), fabric(0x7a8a6a), 0, 1.02, -0.27).rotation.x = 0.2;}
{const cb = ITEM(2, 0, 0, 0); add(cb, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0.8, 0.85, -1.36), V3(0.85, 0.6, -1.42), V3(0.95, 0.3, -1.44), V3(1.2, 0.05, -1.44), V3(1.48, 0.25, -1.46)]), 30, 0.005, 5), M(0x15161a), 0, 0, 0, false);}
shelf(ITEM(2, 0, 0, 0), (S, w, d) => {books(S, -w / 2 + 0.03, 0.02, 7, [0x3b3f48, 0x6f7b8d, 0x9fe0c6, 0x2b2d33]); const sp = grp(S, 0.22, 0.38, 0); add(sp, rb(0.18, 0.26, 0.18, 0.03), M(0x2b2d33, {roughness: 0.4}), 0, 0.13, 0);
  for (const [y, r] of [[0.18, 0.05], [0.07, 0.03]]) add(sp, new THREE.CircleGeometry(r, 20), M(0x15161a, {roughness: 0.6}), 0, y, 0.091, false);
  plant(S, -0.2, 0.73, 0, 1.0); books(S, 0.0, 0.72, 4, [0x6f7b8d, 0xc4a8f0, 0x3b3f48]); const tr = M(0xd4af37, {metalness: 0.7, roughness: 0.3});
  add(S, new THREE.CylinderGeometry(0.035, 0.02, 0.08, 14), tr, 0.2, 1.15, 0); add(S, rb(0.06, 0.03, 0.06, 0.008), M(0x2b2d33), 0.2, 1.1, 0); for (const sx of [-1, 1]) add(S, new THREE.TorusGeometry(0.015, 0.004, 6, 12, PI), tr, 0.2 + sx * 0.035, 1.16, 0).rotation.z = sx * PI / 2;
  const sn = grp(S, -0.15, 1.085, 0.02, 0.4); add(sn, rb(0.1, 0.06, 0.26, 0.03), M(0xf4f2ee, {roughness: 0.6}), 0, 0.03, 0); add(sn, rb(0.105, 0.02, 0.265, 0.008), M(0x9fe0c6), 0, 0.01, 0);
  add(S, rb(w - 0.06, 0.012, 0.012, 0.004), emitM(0xa070ff, 3, 2), 0, 1.425, d / 2 - 0.02, false); add(S, rb(w - 0.06, 0.012, 0.012, 0.004), emitM(0xa070ff, 3, 2), 0, 0.705, d / 2 - 0.02, false);
  practical(S, 0, 1.3, 0.25, 0xa070ff, 1.0, 2, 2.0, false);});
{const Gt = ITEM(2, 0.06, 0, Z0 + 0.14); const gw = M(0xc98d4a, {roughness: 0.45}), gd = M(0x2b1f18, {roughness: 0.5}); const G = grp(Gt, 0, 0.05, 0); G.rotation.x = -0.12;
  add(G, new THREE.CylinderGeometry(0.17, 0.17, 0.08, 28).rotateX(PI / 2), gw, 0, 0.22, 0); add(G, new THREE.CylinderGeometry(0.13, 0.13, 0.08, 28).rotateX(PI / 2), gw, 0, 0.44, 0);
  add(G, new THREE.CircleGeometry(0.045, 20), gd, 0, 0.36, 0.041, false); add(G, rb(0.05, 0.5, 0.025, 0.008), gd, 0, 0.78, 0.02); add(G, rb(0.08, 0.13, 0.025, 0.01), gd, 0, 1.08, 0.02); add(G, rb(0.1, 0.015, 0.02, 0.004), gd, 0, 0.16, 0.045);
  for (let i = 0; i < 6; i++) add(G, new THREE.CylinderGeometry(0.0012, 0.0012, 0.9, 4), chrome, -0.0125 + i * 0.005, 0.62, 0.046, false);
  for (const sx of [-1, 1]) for (const k of [0, 1, 2]) add(G, new THREE.CylinderGeometry(0.007, 0.007, 0.02, 8).rotateZ(PI / 2), chrome, sx * 0.05, 1.04 + k * 0.03, 0.02);
  add(Gt, rb(0.3, 0.02, 0.2, 0.008), metal, 0, 0.01, 0.05); for (const sx of [-1, 1]) add(Gt, rb(0.02, 0.1, 0.02, 0.006), metal, sx * 0.12, 0.06, 0.08);}
{const P = ITEM(2, 0, 0, 0); const p1 = tex(400, 560, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6b38f'); gr.addColorStop(1, '#7a3fa0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,240,220,0.9)'; g.beginPath(); g.arc(w / 2, h * 0.42, 90, 0, 7); g.fill(); T2(g, 'SUMMER', w / 2, h * 0.84, '800 70px "Inter Tight"', '#fbf3e6');});
  const p2 = tex(400, 560, (g, w, h) => {g.fillStyle = '#1d1f26'; g.fillRect(0, 0, w, h); g.strokeStyle = '#9fe0c6'; g.lineWidth = 10; for (let i = 0; i < 5; i++) {g.beginPath(); g.arc(w / 2, h * 0.45, 30 + i * 28, 0, 7); g.stroke();}
    T2(g, 'LEVEL UP', w / 2, h * 0.86, '800 62px "Inter Tight"', '#f4f1ea');});
  add(P, rb(0.4, 0.56, 0.01, 0.004), M(0xffffff, {map: p1, roughness: 0.6}), -1.42, 1.72, Z0 + 0.008); add(P, rb(0.4, 0.56, 0.01, 0.004), M(0xffffff, {map: p2, roughness: 0.6}), -0.92, 1.8, Z0 + 0.008);
  for (const [x, y] of [[-1.42, 2.0], [-0.92, 2.08]]) add(P, rb(0.12, 0.025, 0.006, 0.003), M(0xeae6dc, {transparent: true, opacity: 0.8}), x, y - 0.005, Z0 + 0.015, false);
  const hk = grp(P, -0.52, 1.62, Z0 + 0.02); add(hk, rb(0.3, 0.04, 0.02, 0.01), wood, 0, 0, 0); for (const sx of [-1, 0, 1]) add(hk, new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8).rotateX(PI / 2), metal, sx * 0.1, -0.005, 0.03);
  const capM = M(0x2b2d33, {roughness: 0.8}); add(hk, new THREE.SphereGeometry(0.07, 18, 12, 0, PI * 2, 0, PI / 2), capM, -0.1, -0.05, 0.07).rotation.x = 0.7; add(hk, rb(0.1, 0.008, 0.07, 0.004), capM, -0.1, -0.06, 0.13).rotation.x = 0.7;
  add(hk, rb(0.16, 0.3, 0.05, 0.03), fabric(0x58b48c), 0.1, -0.17, 0.05);}
{const Rg = ITEM(2, 0.35, 0, 0.4); add(Rg, rb(1.6, 0.02, 1.1, 0.008), fabric(0x9aa1ad), 0, 0.01, 0, false);
  const pz = grp(Rg, 0.15, 0.02, 0.42, 0.3); add(pz, rb(0.32, 0.015, 0.32, 0.004), M(0xd9b98a, {roughness: 0.9}), 0, 0.008, 0); add(pz, rb(0.32, 0.32, 0.008, 0.004), M(0xd9b98a, {roughness: 0.9}), 0, 0.16, -0.16).rotation.x = -0.25;
  add(pz, new THREE.CylinderGeometry(0.14, 0.14, 0.012, 32), M(0xffffff, {roughness: 0.8, map: tex(256, 256, (g, w, h) => {g.fillStyle = '#e8b062'; g.beginPath(); g.arc(w / 2, h / 2, 126, 0, 7); g.fill(); g.fillStyle = '#e07a3a'; g.beginPath(); g.arc(w / 2, h / 2, 108, 0, 7); g.fill();
    g.fillStyle = '#f6e6b0'; for (let i = 0; i < 20; i++) {g.beginPath(); g.arc(40 + R() * 176, 40 + R() * 176, 10, 0, 7); g.fill();} g.fillStyle = '#7a3a2a'; for (let i = 0; i < 9; i++) {g.beginPath(); g.arc(50 + R() * 156, 50 + R() * 156, 12, 0, 7); g.fill();}
    g.strokeStyle = 'rgba(120,60,30,0.6)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) {g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(i * PI / 4) * 126, h / 2 + Math.sin(i * PI / 4) * 126); g.stroke();}})}), 0, 0.022, 0.0);
  const ctl = grp(Rg, 0.45, 0.02, -0.15, 0.6); add(ctl, rb(0.14, 0.035, 0.08, 0.025), M(0xf4f2ee, {roughness: 0.4}), 0, 0.018, 0); for (const sx of [-1, 1]) add(ctl, new THREE.CylinderGeometry(0.011, 0.011, 0.012, 10), M(0x2b2d33), sx * 0.035, 0.04, 0);
  const db = grp(Rg, 0.62, 0.02, 0.25, 0.3); add(db, new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8).rotateZ(PI / 2), chrome, 0, 0.04, 0); for (const sx of [-1, 1]) add(db, new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10).rotateZ(PI / 2), metal, sx * 0.09, 0.04, 0);}
{const Sn = ITEM(2, 0, 0, 0); const sn = M(0xf4f2ee, {roughness: 0.6}); for (const [x, z, r] of [[0.95, 0.85, 0.4], [1.08, 0.93, 0.1]]) {const s = grp(Sn, x, 0, z, r); add(s, rb(0.1, 0.06, 0.26, 0.03), sn, 0, 0.035, 0); add(s, rb(0.105, 0.02, 0.265, 0.008), M(0x9fe0c6), 0, 0.01, 0);
  for (let i = 0; i < 3; i++) add(s, rb(0.06, 0.004, 0.006, 0.002), M(0x2b2d33), 0, 0.066, 0.02 + i * 0.025, false);}}
{const Bp = ITEM(2, -0.55, 0, 0.62, -0.3); add(Bp, rb(0.3, 0.4, 0.15, 0.06), M(0x3b3f48, {roughness: 0.7}), 0, 0.2, 0); add(Bp, rb(0.24, 0.16, 0.04, 0.03), M(0x4a5568, {roughness: 0.7}), 0, 0.14, 0.09); add(Bp, rb(0.12, 0.012, 0.01, 0.004), chrome, 0, 0.27, 0.105);}
{const Sk = ITEM(2, 1.5, 0, Z0 + 0.06); const deck = grp(Sk, 0, 0.42, 0.0); deck.rotation.x = 0.1;   // skateboard leaning against the back wall, graphic and wheels to the room
  add(deck, rb(0.2, 0.8, 0.02, 0.012), M(0x2b2d33, {roughness: 0.7}), 0, 0, 0); add(deck, new THREE.PlaneGeometry(0.18, 0.62), pic(128, 400, (g, w, h) => {g.fillStyle = '#f6b38f'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a3fa0'; for (let i = 0; i < 7; i++) g.fillRect(0, i * 60, w, 24); T2(g, 'SK8', w / 2, h / 2, '800 52px "Inter Tight"', '#fbf3e6');}), 0, 0, 0.011, false);
  for (const y of [-0.28, 0.28]) {add(deck, rb(0.14, 0.03, 0.03, 0.01), chrome, 0, y, 0.025); for (const sx of [-1, 1]) add(deck, new THREE.CylinderGeometry(0.028, 0.028, 0.03, 14).rotateZ(PI / 2), M(0xf7dd7c), sx * 0.075, y, 0.045);}}
{const Lb = ITEM(2, 1.2, 0, 1.05); basket(Lb, 0, 0, [[0x2b2d33, 0, 0.03, 0, 0.2, 0.1], [0x6d8fb3, 0.05, 0.08, 0.03, -0.3, 0.2], [0xf4f1ea, -0.06, 0.1, -0.02, 0.4, -0.3]], 0x9aa1ad);
  add(Lb, new THREE.CapsuleGeometry(0.025, 0.12, 4, 8), fabric(0xf4f1ea), 0.22, 0.03, 0.05).rotation.z = PI / 2;}
{const ws = ITEM(2, 0.8, 0, 0); plant(ws, -0.38, WY0, Z0 + 0.07, 0.7, 0x2b2d33); const sp = grp(ws, 0.33, WY0, Z0 + 0.07); add(sp, new THREE.CylinderGeometry(0.04, 0.04, 0.12, 18), M(0x2b2d33, {roughness: 0.5}), 0, 0.06, 0);
  add(sp, new THREE.TorusGeometry(0.03, 0.004, 6, 18), emitM(0x9fe0c6, 2, 2), 0, 0.121, 0, false).rotation.x = PI / 2;}
teddy(ITEM(2, -1.5, 1.455, 0.82, PI / 2 - 0.2), 0, 0, 0, 1.0, 0);
{const K = human(ITEM(2, 0, 0, 0), -0.62, -0.25, PI / 2 - 0.35, {type: 'teen', shirt: 0x6d8fb3, pants: 0x30343c, shoes: 0xf4f2ee, sole: 0xdedede, longSleeves: true, hood: true, hair: 0x5a3c25});
  K.HP.position.y = 0.465; for (const [i, l] of K.legs.entries()) {l.L.rotation.x = -PI / 2 + 0.06; l.K.rotation.x = PI / 2 - 0.02; l.L.rotation.z = (i ? 1 : -1) * 0.06;}
  K.arms[1].S.rotation.set(-0.75, 0, 0.12); K.arms[1].E.rotation.x = -1.55; K.arms[0].S.rotation.set(-0.3, 0, -0.35); K.arms[0].E.rotation.x = -0.25;
  const ph = grp(K.arms[1].Hd, 0, -0.05, 0.02); add(ph, rb(0.07, 0.14, 0.012, 0.01), M(0x15161a, {roughness: 0.3}), 0, 0, 0).rotation.x = -0.6;
  add(ph, new THREE.PlaneGeometry(0.06, 0.125), glow(0x9cc8f2, 0.9), 0, 0.004, 0.0075, false).rotation.x = -0.6;
  K.HJ.rotation.set(0.38, -0.1, 0); K.TJ.rotation.x = 0.08; KIDS[2] = K;}
// the three labels for „Wohnen, Essen und Kleidung“ (cards on a thin line to their object; they face the camera)
const TAGS = [['Wohnen', V3(-1.15, 1.05, -0.15), V3(-1.15, 0.55, -0.15), 15.62], ['Essen', V3(0.98, 0.72, 0.62), V3(0.5, 0.06, 0.82), 16.22], ['Kleidung', V3(0.88, 1.52, -0.38), V3(0.88, 1.18, -0.38), 16.66]].map(([s, p, q, t]) => {
  const G = grp(scene, p.x, p.y + 0.04, p.z); const card = grp(G); card.scale.setScalar(1.6); add(card, rb(0.42, 0.15, 0.012, 0.03), M(0xfbf8f3, {roughness: 0.6}), 0, 0, 0, false);
  add(card, new THREE.PlaneGeometry(0.4, 0.13), new THREE.MeshStandardMaterial({map: tex(400, 130, (g, w, h) => T2(g, s, w / 2, h / 2 + 4, '700 66px Poppins', '#2b2b38')), transparent: true, roughness: 0.6}), 0, 0, 0.007, false);
  const top = V3(p.x, p.y - 0.08, p.z), dv = top.clone().sub(q), ln = add(scene, new THREE.CylinderGeometry(0.003, 0.003, 1, 6), M(0xfbf8f3), (top.x + q.x) / 2, (top.y + q.y) / 2, (top.z + q.z) / 2, false);
  ln.scale.y = dv.length(); ln.quaternion.setFromUnitVectors(V3(0, 1, 0), dv.normalize());
  const dot = add(scene, new THREE.SphereGeometry(0.012, 10, 8), M(0xfbf8f3), q.x, q.y, q.z, false); return {G, card, ln, dot, t, h: ln.scale.y};});
// the Kindergeld letter drops onto the bed
const LETTER = grp(scene, -0.98, 0, 0.28, 0.35); LETTER.scale.setScalar(1.35); add(LETTER, rb(0.24, 0.006, 0.16, 0.003), M(0xf7dd7c, {roughness: 0.6}), 0, 0, 0, false);
add(LETTER, new THREE.PlaneGeometry(0.22, 0.14), new THREE.MeshStandardMaterial({map: tex(330, 210, (g, w, h) => {g.strokeStyle = 'rgba(120,90,30,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * 0.55); g.lineTo(w, 0); g.stroke();
  T2(g, 'Kindergeld', w / 2, h * 0.75, '700 44px Poppins', '#5a4a1a');}), transparent: true, roughness: 0.6}), 0, 0.004, 0, false).rotation.x = -PI / 2;

// ------------------------------------------------------------------ light
const sunDir = (el, az) => V3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
const sun = new THREE.DirectionalLight(LOOK.sun[0], LOOK.sun[1]);
{const d = sunDir(LOOK.sun[2] * PI / 180, PI - 0.55); sun.position.copy(V3(0.8, 0.9, -1.5).addScaledVector(d, 9)); sun.target.position.set(0.8, 0.0, -0.5); scene.add(sun, sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; Object.assign(sun.shadow.camera, {left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20});
  if (LOOK.fill) {const f = new THREE.DirectionalLight(0xfff6ee, LOOK.fill); f.position.set(3, 4, 6); scene.add(f);}
  if (!NIGHT) {const corners = [[WX0 + 0.05, WY0 + 0.05], [WX1 - 0.05, WY0 + 0.05], [WX1 - 0.05, WY1 - 0.05], [WX0 + 0.05, WY1 - 0.05]].map(([x, y]) => V3(x, y, Z0 - 0.02));
    const fl = corners.map(p => p.clone().addScaledVector(d, -p.y / d.y));
    const pos = [], al = []; const quad = (a, b, c2, e, aa, ab, ac, ae) => {pos.push(...a.toArray(), ...b.toArray(), ...c2.toArray(), ...a.toArray(), ...c2.toArray(), ...e.toArray()); al.push(aa, ab, ac, aa, ac, ae);};
    for (let i = 0; i < 4; i++) {const j = (i + 1) % 4; quad(corners[i], corners[j], fl[j], fl[i], 1, 1, 0, 0);}
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('a', new THREE.Float32BufferAttribute(al, 1));
    const m = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'attribute float a; varying float va; void main(){va=a; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying float va; void main(){gl_FragColor=vec4(vec3(1.0,0.78,0.5)*0.09*(0.25+0.75*va),1.0);}'});
    BEAM = new THREE.Mesh(g, m); BEAM.renderOrder = 5; scene.add(BEAM);}}

// ------------------------------------------------------------------ timeline: which age is shown (each item pops with a small left-to-right delay)
// the room changes as a wave from left to right: at each place the old piece shrinks away first, then the new one grows (never both at once)
const CHG = [[-9, 0], [8.4, 1], [10.75, 2], [17.6, 0], [18.75, 1], [19.95, 2]], SWEEP = 0.5;
const vis = (a, v, k = 0.5) => {if (FIXA >= 0) return a === FIXA ? 1 : 0; let s = 0;
  CHG.forEach(([t0, age], i) => {if (age !== a) return; const t1 = i + 1 < CHG.length ? CHG[i + 1][0] : 1e9, d = k * SWEEP;
    const inn = i === 0 ? 1 : eo(seg(v, t0 + d + 0.3, t0 + d + 0.58)), out = 1 - sm(seg(v, t1 + d, t1 + d + 0.22)); s = Math.max(s, Math.min(inn, out));}); return s;};
// every top-level child of an age group is one item; a wrapper at the origin gets its pivot moved to the bottom centre of its content
ROOM.updateMatrixWorld(true);
const ITEMS = [];
AG.forEach((g, a) => [...g.children].forEach(o => {let it = o;
  if (o.position.lengthSq() === 0) {const b = new THREE.Box3().setFromObject(o), c = b.getCenter(V3(0, 0, 0)); c.y = b.min.y; const piv = grp(g, c.x, c.y, c.z); for (const ch of [...o.children]) piv.attach(ch); g.remove(o); it = piv;}
  const p = it.getWorldPosition(V3(0, 0, 0)); ITEMS.push({o: it, a, k: clamp((p.x + 1.8) / 3.6 * 0.8 + (p.z + 1.5) / 3.0 * 0.2)});}));

// ------------------------------------------------------------------ camera
function fit(pts, az, el, fov, band = {}) {const B = {x0: 70, x1: 1010, y0: 560, y1: 1380, ...band}, c = new THREE.PerspectiveCamera(fov, W / H, 0.05, 80);
  const A = az * PI / 180, E = el * PI / 180, dir = V3(Math.cos(E) * Math.sin(A), Math.sin(E), Math.cos(E) * Math.cos(A));
  let t = new THREE.Box3().setFromPoints(pts).getCenter(V3(0, 0, 0)), d = 10;
  for (let it = 0; it < 60; it++) {c.position.copy(t).addScaledVector(dir, d); c.lookAt(t); c.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) {const q = p.clone().project(c), px = (q.x + 1) / 2 * W, py = (1 - q.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);}
    const s = Math.max((x1 - x0) / (B.x1 - B.x0), (y1 - y0) / (B.y1 - B.y0)), vh = 2 * d * Math.tan(fov / 2 * PI / 180), right = V3(1, 0, 0).applyQuaternion(c.quaternion), up = V3(0, 1, 0).applyQuaternion(c.quaternion);
    t = t.clone().addScaledVector(right, ((x0 + x1) / 2 - (B.x0 + B.x1) / 2) / H * vh * 0.8).addScaledVector(up, -((y0 + y1) / 2 - (B.y0 + B.y1) / 2) / H * vh * 0.8); d *= 1 + (s - 1) * 0.6;}
  return [t.x, t.y, t.z, d];}
const roomPts = [V3(X0 - TK, -0.16, Z0 - TK), V3(X1, -0.16, Z0 - TK), V3(X0 - TK, WH, Z0 - TK), V3(X1, WH, Z0 - TK), V3(X0 - TK, WH, Z1), V3(X0 - TK, -0.16, Z1), V3(X1, -0.16, Z1)];
const AZ = NIGHT ? 30 : 26, EL = NIGHT ? 12 : 34, FOV = NIGHT ? 30 : 22; cam.fov = FOV; cam.updateProjectionMatrix();
const FR = fit(roomPts, AZ, EL, FOV, NIGHT ? {x0: 10, x1: 1070, y0: 470, y1: 1460} : {});
const KR = (t, dk = 1, da = 0, de = 0, tg = null) => [t, ...(tg || FR.slice(0, 3)), FR[3] * dk, AZ + da, EL + de];
const KEYS = [[0, 0.2, 0.42, 0.4, FR[3] * 0.3, AZ - 6, EL - 2], [1.2, 0.2, 0.42, 0.4, FR[3] * 0.33, AZ - 4, EL - 1], KR(4.0), KR(8.5, 0.96, 1), KR(9.3), KR(10.8, 0.97, -1), KR(11.6), KR(14.2, 0.97),
  KR(15.2, 0.86, 2, 2, [-0.05, 0.75, 0.0]), KR(17.4, 0.84, 3, 2, [-0.05, 0.75, 0.0]), KR(18.2, 1.02, -4, 2), KR(21.6, 1.02, 6, 3), KR(26.4, 0.98, 3, 1), KR(29.8, 0.95),
  KR(31.0, 0.8, -2, 4, [-0.6, 0.6, -0.1]), KR(35.0, 0.78, -1, 4, [-0.6, 0.6, -0.1]), KR(36.2), KR(OUT0, 0.98, 1), KR(OUT0 + 1.0, 1.05, 2, 2), KR(END_V + 1, 1.06, 2, 2)];
function camAt(v) {let k = 0; while (k < KEYS.length - 2 && v >= KEYS[k + 1][0]) k++;
  const a = KEYS[k], b = KEYS[k + 1], u = smr(seg(v, a[0], b[0])), q = a.map((x, i) => lerp(x, b[i], u));
  const [, tx, ty, tz, d, az, el] = q, A = (az + 0.25 * Math.sin(v * 0.21)) * PI / 180, E = (el + 0.15 * Math.sin(v * 0.27 + 0.7)) * PI / 180;
  cam.position.set(tx + d * Math.cos(E) * Math.sin(A), ty + d * Math.sin(E), tz + d * Math.cos(E) * Math.cos(A)); cam.lookAt(tx, ty, tz); cam.updateMatrixWorld(); return q;}

// ------------------------------------------------------------------ post-processing
const rt = new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType, samples: 4});
const composer = new EffectComposer(renderer, rt); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
let bokeh = null;
if (!NIGHT) {const ao = new GTAOPass(scene, cam, W, H); ao.updateGtaoMaterial({radius: 0.35, distanceExponent: 1.4, thickness: 1.0, scale: 1.0, samples: 16}); ao.blendIntensity = 0.75; composer.addPass(ao);
  const r0 = ao.render.bind(ao); ao.render = (...a) => {const hid = [BEAM, ...TAGS.flatMap(t => [t.G, t.ln, t.dot])].filter(Boolean).map(o => [o, o.visible]); hid.forEach(([o]) => o.visible = false); r0(...a); hid.forEach(([o, vv]) => o.visible = vv);};}
if (NIGHT) {bokeh = new BokehPass(scene, cam, {focus: 6, aperture: 0.0014, maxblur: 0.006}); composer.addPass(bokeh);}
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), NIGHT ? 0.55 : 0.1, 0.6, NIGHT ? 0.82 : 0.95));
composer.addPass(new OutputPass());
if (!NIGHT) {const hs = new ShaderPass(HorizontalTiltShiftShader), vs = new ShaderPass(VerticalTiltShiftShader); hs.uniforms.h.value = 2.2 / W; vs.uniforms.v.value = 2.2 / H; hs.uniforms.r.value = vs.uniforms.r.value = 0.48; composer.addPass(hs); composer.addPass(vs);}
const GRADE = new ShaderPass({uniforms: {tDiffuse: {value: null}, t: {value: 0}, vig: {value: NIGHT ? 0.5 : 0.2}, grain: {value: NIGHT ? 0.04 : 0.02}, tint: {value: NIGHT ? V3(1.0, 0.97, 0.94) : V3(1.03, 1.0, 0.95)}},
  vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float t, vig, grain; uniform vec3 tint; varying vec2 vUv; float h(vec2 p){return fract(sin(dot(p, vec2(12.9898,78.233)) + t*7.13) * 43758.5453);}
    void main(){vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - 0.5; q.x *= 0.62; float d = length(q); c.rgb *= tint; c.rgb *= 1.0 - vig * smoothstep(0.18, 0.62, d); c.rgb += (h(vUv * vec2(1080.0, 1920.0)) - 0.5) * grain; gl_FragColor = c;}`});
composer.addPass(GRADE);

// ------------------------------------------------------------------ texts (title, big number, subtitles, source, logo)
const $ = id => document.getElementById(id);
const wordsN = WORDS.filter(w => !w.text.startsWith('[') && !w.text.endsWith(']'));
const SUBG = [[8, 'Was kostet ein Kind, bis es 18 ist?'], [2, 'Schätz mal.'], [7, 'Für ein Kleinkind geben Eltern im Schnitt'], [6, 'rund 680 Euro im Monat aus.'],
  [5, 'Für ein Schulkind fast 800.'], [6, 'Und für einen Teenager über 950.'], [6, 'Etwa die Hälfte davon geht für'], [5, 'Wohnen, Essen und Kleidung drauf.'],
  [6, 'Bis zum 18. Geburtstag kommen so'], [4, 'rund 174.000 Euro zusammen.'], [6, 'Das sind die neuesten amtlichen Zahlen,'], [5, 'und sie stammen von 2018.'],
  [9, 'Mit den Preisen von heute sind es über 200.000.'], [8, 'Der Staat zahlt 259 Euro Kindergeld im Monat.'], [6, 'Das deckt nur etwa ein Viertel.'],
  [5, 'Hättest du so viel geschätzt?'], [4, 'Schreib’s in die Kommentare.']];
const SUBS = []; {let i = 0; SUBG.forEach(([n, s]) => {SUBS.push([wordsN[i].start - 0.05, wordsN[i + n - 1].end + 0.25, s]); i += n;}); for (let k = 0; k < SUBS.length - 1; k++) SUBS[k][1] = Math.min(SUBS[k][1], SUBS[k + 1][0]);}
const fmt = n => Math.round(n).toLocaleString('de-DE') + ' €';
const COUNT = v => {const a = 679 * 72, b = a + 785 * 72, c = b + 953 * 72; if (v < 18.75) return a * eio(seg(v, 17.75, 18.75)); if (v < 19.95) return a + (b - a) * eio(seg(v, 18.85, 19.95)); return b + (c - b) * eio(seg(v, 20.05, 21.2));};
const NUMS = [[6.45, 8.75, '679 €', 'im Monat für ein Kind unter 6 Jahren'], [9.95, 10.9, '≈ 785 €', 'im Monat für ein Kind von 6 bis 12 Jahren'],
  [12.55, 14.1, '953 €', 'im Monat für Jugendliche von 12 bis 18 Jahren'], [14.45, 17.75, '≈ 50 %', 'davon für Wohnen, Essen und Kleidung'],
  [17.85, 28.45, v => fmt(Math.round(COUNT(v) / 1000) * 1000), 'bis zum 18. Geburtstag, mit den Preisen von 2018'], [28.45, 29.95, '216.000 €', 'mit den Preisen von heute (hochgerechnet)'],
  [30.75, 33.62, '259 €', 'Kindergeld im Monat, bis 18 rund 56.000 €'], [33.65, 35.45, '≈ 26 %', 'der Kosten deckt das Kindergeld']];
const TITLES = [[-1, 4.25, 'Was kostet ein Kind<br>bis 18?'], [35.5, OUT0, 'Hättest du so viel<br>geschätzt?']];
const SRCS = [[-1, 17.8, 'Quelle: Statistisches Bundesamt, EVS 2018 (Paare mit einem Kind, Konsumausgaben für das Kind) · Modell vereinfacht'],
  [17.85, 35.45, 'Eigene Rechnung: je 6 Jahre pro Altersstufe · hochgerechnet mit dem Verbraucherpreisindex 2018–2025 · Kindergeld 2026: 259 € · Modell vereinfacht']];
const fadeIn = (v, a, b, f = 0.22) => Math.min(seg(v, a, a + f), 1 - seg(v, b - f, b));
let lastNum = '', lastTitle = '', lastSrc = '', lastSub = '';
function overlays(v) {const ti = TITLES.find(q => v >= q[0] && v < q[1]); const tt = ti ? ti[2] : ''; if (tt !== lastTitle) {$('title').innerHTML = tt; lastTitle = tt;}
  $('title').style.opacity = ti ? fadeIn(v, ti[0], ti[1]) : 0; $('title').style.transform = ti ? `translateY(${(1 - eo(seg(v, ti[0], ti[0] + 0.4))) * 14}px)` : 'none';
  const n = NUMS.find(q => v >= q[0] && v < q[1]);
  if (n) {const big = typeof n[2] === 'function' ? n[2](v) : n[2]; const html = big + '<small>' + n[3] + '</small>'; if (html !== lastNum) {$('num').innerHTML = html; lastNum = html;}
    const cont = n[4] === 'cont'; $('num').style.opacity = cont ? 1 - seg(v, n[1] - 0.22, n[1]) : fadeIn(v, n[0], n[1]); $('num').style.transform = `translateY(${(1 - eo(seg(v, n[0], n[0] + 0.35))) * (cont ? 0 : 16)}px)`;}
  else $('num').style.opacity = 0;
  const s = SUBS.find(q => v >= q[0] && v < q[1]); const st = s ? s[2] : ''; if (st !== lastSub) {$('sub').textContent = st; lastSub = st;}
  $('sub').style.opacity = s ? Math.min(1, (v - s[0]) / 0.18 + 0.15) * (1 - seg(v, OUT0 - 0.1, OUT0 + 0.2)) : 0;
  const r = SRCS.find(q => v >= q[0] && v < q[1]); const rt2 = r ? r[2] : ''; if (rt2 !== lastSrc) {$('src').textContent = rt2; lastSrc = rt2;} $('src').style.opacity = r ? fadeIn(v, r[0], r[1]) : 0;
  $('logo').style.opacity = 1 - seg(v, OUT0, OUT0 + 0.35);}
// outro (2D, as in the clay videos): the picture gets darker, „function“ fades in letter by letter, the red dot pops in
const endG = $('end').getContext('2d'), LOGO_FS = 170, LOGO_Y = 1010; endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px';
const LW = endG.measureText('function').width, DW = endG.measureText('.').width, DOT = endG.measureText('.');
const LX = W / 2 - (LW + DW) / 2, DOTX = LX + LW + (DOT.actualBoundingBoxRight - DOT.actualBoundingBoxLeft) / 2, DOTR = (DOT.actualBoundingBoxAscent + DOT.actualBoundingBoxDescent) / 2, DOTY = LOGO_Y - DOT.actualBoundingBoxAscent + DOTR;
const LETX = []; {let x = LX; for (const ch of 'function') {LETX.push(x); x = LX + endG.measureText('function'.slice(0, LETX.length)).width;}}
function outro(v) {const u = v - OUT0; endG.clearRect(0, 0, W, H); if (u < 0) return;
  const f = sm(seg(u, 0, 0.45)); const bg = endG.createRadialGradient(W / 2, 980, 60, W / 2, 980, 1250); bg.addColorStop(0, '#2c2247'); bg.addColorStop(0.55, '#1a1430'); bg.addColorStop(1, '#07070b');
  endG.globalAlpha = 0.72 * f; endG.fillStyle = bg; endG.fillRect(0, 0, W, H); endG.globalAlpha = 1;
  {const g = endG.createRadialGradient(W / 2, LOGO_Y - 55, 40, W / 2, LOGO_Y - 55, 560); g.addColorStop(0, `rgba(10,8,20,${0.4 * f})`); g.addColorStop(1, 'rgba(10,8,20,0)'); endG.fillStyle = g; endG.fillRect(0, 0, W, H);}
  const dp = back(seg(u, 1.28, 1.62)), land = seg(u, 1.28, 1.62), sq = land > 0 && land < 1 ? Math.sin(PI * land) * 0.18 : 0;
  if (dp > 0) {endG.save(); endG.fillStyle = '#E01E2B'; endG.beginPath(); endG.ellipse(DOTX, DOTY, DOTR * dp * (1 + sq), DOTR * dp * (1 - sq), 0, 0, PI * 2); endG.fill(); endG.restore();}
  endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px'; endG.fillStyle = '#E01E2B'; endG.textAlign = 'left'; endG.textBaseline = 'alphabetic';
  'function'.split('').forEach((ch, i) => {const a = sm(seg(u, 0.4 + i * 0.07, 0.85 + i * 0.07)); if (a <= 0) return; endG.save(); endG.globalAlpha = a; endG.fillText(ch, LETX[i], LOGO_Y + (1 - a) * 34); endG.restore();});}

// ------------------------------------------------------------------ the frame at voice time v
const KPOS = [V3(0.18, 0.4, 0.42), V3(0.25, 0.9, 0.3), V3(-0.62, 0.85, -0.25)];
function setT(v) {camAt(v); overlays(v);
  for (const it of ITEMS) {const s = vis(it.a, v, it.k); it.o.visible = s > 0.002; it.o.scale.setScalar(Math.max(1e-3, s));}
  const w = [0, 1, 2].map(a => vis(a, v, 0.5)), ws = w[0] + w[1] + w[2];
  if (ws > 0.01) {const cA = new THREE.Color(0, 0, 0), cB = new THREE.Color(0, 0, 0); w.forEach((x, a) => {cA.r += PAINT[a].r * x / ws; cA.g += PAINT[a].g * x / ws; cA.b += PAINT[a].b * x / ws; cB.r += CURC[a].r * x / ws; cB.g += CURC[a].g * x / ws; cB.b += CURC[a].b * x / ws;});
    paintM.color.copy(cA); curM.color.copy(cB);}
  for (const l of LIGHTS) l.intensity = l.userData.I * vis(l.userData.age, v, 0.5);
  for (const m of EMIT) m.emissiveIntensity = m.userData.I * vis(m.userData.age, v, 0.5);
  MARKS.forEach(g => {const s = FIXA >= 0 ? (g.userData.age <= FIXA ? 1 : 0) : Math.max(...[0, 1, 2].filter(a => a >= g.userData.age).map(a => vis(a, v, 0.3))); g.visible = s > 0.01; g.scale.setScalar(Math.max(1e-3, s));});
  {const tt = v * 0.02 + 6 * sm(seg(v, 17.8, 21.3)) * 12; HANDS[0].rotation.z = -tt / 12 * PI * 2 - 1.2; HANDS[1].rotation.z = -tt * PI * 2 - 0.4;}
  {const mb = ROOM.getObjectByName('mobile'); if (mb) mb.rotation.y = v * 0.5;}
  {const K = KIDS[0]; K.TJ.rotation.z = 0.06 * Math.sin(v * 2.2); K.HJ.rotation.y = 0.15 * Math.sin(v * 0.9); K.HJ.rotation.z = 0.05 + 0.04 * Math.sin(v * 1.3);}
  {const K = KIDS[1]; K.HJ.rotation.y = 0.1 + 0.18 * Math.sin(v * 0.8); K.arms[0].S.rotation.x = -0.15 + 0.05 * Math.sin(v * 1.6);}
  {const K = KIDS[2], look = sm(seg(v, 35.45, 35.9)), wave = seg(v, 35.9, 37.6), up = sm(seg(v, 35.6, 35.95)) * (1 - sm(seg(v, 37.6, 38.1)));
    K.HJ.rotation.set(0.38 * (1 - look) - 0.05 * look, -0.1 + 0.55 * look, 0); K.TJ.rotation.x = 0.08 * (1 - look);
    K.arms[0].S.rotation.set(-0.3 * (1 - up) - 0.2 * up, 0, -0.35 - 2.2 * up); K.arms[0].E.rotation.x = -0.25 - 0.6 * up; K.arms[0].Hd.rotation.z = wave > 0 && wave < 1 ? 0.35 * Math.sin(wave * PI * 6) : 0;}
  TAGS.forEach(({G, card, ln, dot, t}) => {const s = FIXA >= 0 ? 0 : back(seg(v, t, t + 0.35)) * (1 - sm(seg(v, 17.35, 17.6))); G.visible = ln.visible = dot.visible = s > 0.01; G.scale.setScalar(Math.max(1e-3, s));
    ln.scale.x = ln.scale.z = Math.max(1e-3, s); card.quaternion.copy(cam.quaternion);});
  {const u = eo(seg(v, 30.8, 31.25)); LETTER.visible = FIXA < 0 && v > 30.75; LETTER.position.y = lerp(1.3, 0.5, u) + Math.sin(PI * seg(v, 31.25, 31.45)) * 0.01; LETTER.rotation.z = (1 - u) * 0.6; LETTER.rotation.x = (1 - u) * 0.4;}
  if (bokeh) {let best = 0; for (let a = 1; a < 3; a++) if (vis(a, v) > vis(best, v)) best = a; bokeh.uniforms.focus.value = cam.position.distanceTo(KPOS[best]);
    bokeh.uniforms.aperture.value = lerp(0.0014, 0.0003, sm(seg(v, 15.3, 15.6)) * (1 - sm(seg(v, 17.4, 17.8))));}   // the labels stay sharp
  GRADE.uniforms.t.value = v;
  {const o = eio(clamp((v - OUT0) / 0.7)); sun.intensity = LOOK.sun[1] * (1 - 0.5 * o);}
  outro(v);}
window.setT = setT;
window.TOTAL = Math.round((END_V + VO) * 30);
window.renderFrame = f => {setT(f / 30 - VO); composer.render();};
if (MOTIF) {scene.background = null; renderer.setClearColor(0x000000, 0); document.body.style.background = 'transparent'; document.documentElement.style.background = 'transparent'; for (const id of ['shade', 'ov', 'end']) $(id).style.display = 'none';
  const F2 = fit(roomPts, AZ, EL, FOV, {x0: 30, x1: 1050, y0: 330, y1: 1600});
  window.renderFrame = () => {setT(5); const A = AZ * PI / 180, E = EL * PI / 180; cam.position.set(F2[0] + F2[3] * Math.cos(E) * Math.sin(A), F2[1] + F2[3] * Math.sin(E), F2[2] + F2[3] * Math.cos(E) * Math.cos(A));
    cam.lookAt(F2[0], F2[1], F2[2]); cam.updateMatrixWorld(); renderer.render(scene, cam);};}
const q0 = Q.get('t'); window.renderFrame(Math.round(((q0 != null ? +q0 : (FIXA >= 0 ? 5 : 0)) + VO) * 30));
window.ready = true;
