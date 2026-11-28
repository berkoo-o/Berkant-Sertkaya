// Test „A und B haben dieselbe Farbe“ (Schachbrett-Schatten nach Adelson), 27.11.2026: modernes Fotostudio mit Hohlkehle, Schachbrett auf einem Podest, grüner Zylinder mit Schatten.
// Die Helligkeit ist ausgerechnet: Feld A (dunkel, im Licht) und Feld B (hell, im Schatten) kommen exakt gleich hell aus dem Renderer. Der Beweisbalken nimmt die Farbe direkt aus dem fertigen Bild.
import {THREE, W, H, PI, FPS, clamp, lerp, seg, sm, eo, eio, V3, rng, tex, rr, overlays, camPath} from '../../karten/src/core.js';
import {GRADE} from '../../karten/src/s1.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

await Promise.all(['600 40px "Inter Tight"', '800 40px "Inter Tight"', '400 40px Poppins', '800 64px Poppins'].map(f => document.fonts.load(f)));
const END = 8.6;
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 200);
scene.background = new THREE.Color(0xd9d5ce);
const R = rng(5);
const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
const lam = c => new THREE.MeshLambertMaterial({color: c});
const std = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.6, ...o});

// ------------------------------------------------------------------ light (white only, so the board stays exact): ambient a, sun d at 35° from the back right
const AMB = 0.6, SUN = 2.0, ELEV = 35 * PI / 180, HD = V3(0.781, 0, -0.625).normalize();
scene.add(new THREE.AmbientLight(0xffffff, AMB));
const sun = new THREE.DirectionalLight(0xffffff, SUN); sun.position.set(HD.x * Math.cos(ELEV) * 12, Math.sin(ELEV) * 12 + 0.64, HD.z * Math.cos(ELEV) * 12); sun.target.position.set(0, 0.64, 0);
sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 14; sun.shadow.blurSamples = 24; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.0; Object.assign(sun.shadow.camera, {left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30}); scene.add(sun, sun.target);
const LIT = AMB + SUN * Math.sin(ELEV), LIGHT = 0.42, DARK = LIGHT * AMB / LIT;   // dark square in the light = light square in the shadow

// ------------------------------------------------------------------ studio: cyclorama (floor, cove, back wall), tape marks, two softboxes on stands, camera on a tripod, side table, cables
const cyc = lam(0xd6d2cb);
add(scene, new THREE.PlaneGeometry(30, 12).rotateX(-PI / 2), cyc, 0, 0, 1.5, false);
{const g = new THREE.CylinderGeometry(2.5, 2.5, 30, 48, 1, true, PI, PI / 2); g.rotateZ(PI / 2); add(scene, g, new THREE.MeshLambertMaterial({color: 0xd6d2cb, side: THREE.BackSide}), 0, 2.5, -4.5, false);
  add(scene, new THREE.PlaneGeometry(30, 14), cyc, 0, 9.5, -7.0, false);}
for (const [x, z, r] of [[-2.2, 1.6, 0.3], [2.4, 1.9, -0.2], [0, 2.6, 0.1]]) for (const s of [1, -1]) {const t = add(scene, new THREE.PlaneGeometry(0.34, 0.06).rotateX(-PI / 2), lam(0xe8c547), x, 0.002, z, false); t.rotation.y = r + s * PI / 4;}
function stand(x, z, ry, h) {const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G); const metal = std(0x1b1b1f, {metalness: 0.7, roughness: 0.35});
  for (let i = 0; i < 3; i++) {const a = i * PI * 2 / 3, l = add(G, new THREE.CylinderGeometry(0.018, 0.018, 0.75, 8), metal, Math.cos(a) * 0.28, 0.2, Math.sin(a) * 0.28); l.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);}
  add(G, new THREE.CylinderGeometry(0.025, 0.03, h, 10), metal, 0, h / 2 + 0.1, 0); return G;}
for (const [x, z, ry] of [[-3.3, -1.2, 0.9], [3.6, 0.4, -1.1]]) {const G = stand(x, z, ry, 2.6); const B = new THREE.Group(); B.position.set(0, 2.9, 0); B.rotation.x = -0.25; G.add(B);
  add(B, new RoundedBoxGeometry(1.3, 1.0, 0.45, 3, 0.04), std(0x141417, {roughness: 0.5}), 0, 0, -0.1);
  add(B, new THREE.PlaneGeometry(1.18, 0.88), new THREE.MeshBasicMaterial({color: 0xfdfbf6}), 0, 0, 0.13, false);}
{const G = stand(2.6, -2.2, -0.6, 1.25), C = new THREE.Group(); C.position.set(0, 1.45, 0); G.add(C);
  add(C, new RoundedBoxGeometry(0.34, 0.24, 0.2, 3, 0.03), std(0x18181b, {roughness: 0.4}), 0, 0, 0);
  add(C, new THREE.CylinderGeometry(0.075, 0.085, 0.22, 24).rotateX(PI / 2), std(0x101012, {roughness: 0.3, metalness: 0.4}), 0, 0, 0.2);
  add(C, new THREE.CircleGeometry(0.06, 24), std(0x2a3a55, {roughness: 0.05, metalness: 0.6}), 0, 0, 0.311, false);
  add(C, new THREE.SphereGeometry(0.015, 10, 8), new THREE.MeshBasicMaterial({color: 0xff3b30}), 0.12, 0.08, 0.1, false);}
{const T = new THREE.Group(); T.position.set(-2.7, 0, -2.4); scene.add(T); add(T, new THREE.CylinderGeometry(0.42, 0.42, 0.04, 40), std(0xf2efe9, {roughness: 0.4}), 0, 0.72, 0);
  add(T, new THREE.CylinderGeometry(0.03, 0.05, 0.7, 12), std(0x1b1b1f, {metalness: 0.7}), 0, 0.36, 0); add(T, new THREE.CylinderGeometry(0.22, 0.22, 0.02, 30), std(0x1b1b1f, {metalness: 0.7}), 0, 0.01, 0);
  add(T, new THREE.CylinderGeometry(0.06, 0.05, 0.13, 24), std(0xfafafa, {roughness: 0.3}), -0.15, 0.805, 0.08);
  const cols = [0xc9312b, 0x2f6fd6, 0xf2c230, 0x2fa05a, 0xf2f2f2, 0xf07a1f]; for (let i = 0; i < 27; i++) {const x = i % 3, y = Math.floor(i / 9), z = Math.floor(i / 3) % 3;
    add(T, new RoundedBoxGeometry(0.058, 0.058, 0.058, 2, 0.008), std(cols[(x + y * 2 + z * 3) % 6], {roughness: 0.35}), 0.12 + (x - 1) * 0.06, 0.77 + y * 0.06, -0.06 + (z - 1) * 0.06);}}
for (const [p0, p1] of [[[-3.3, -1.2], [-1.6, 1.2]], [[3.6, 0.4], [2.2, 2.4]]]) {const pts = []; for (let i = 0; i <= 12; i++) {const u = i / 12; pts.push(V3(lerp(p0[0], p1[0], u) + Math.sin(u * 6) * 0.25, 0.012, lerp(p0[1], p1[1], u) + Math.cos(u * 5) * 0.2));}
  add(scene, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.012, 8), std(0x121214, {roughness: 0.5}), 0, 0, 0, false);}

// ------------------------------------------------------------------ pedestal, board (5 × 5), the green cylinder
add(scene, new RoundedBoxGeometry(3.4, 0.5, 3.4, 3, 0.04), std(0xf4f2ee, {roughness: 0.7}), 0, 0.25, 0);
add(scene, new RoundedBoxGeometry(2.86, 0.14, 2.86, 3, 0.03), std(0x3a2a20, {roughness: 0.45}), 0, 0.57, 0);
const BY = 0.641, SQ = 0.5, sq = [];
for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {const light = (i + j) % 2 === 0, m = lam(0); m.color.setRGB(light ? LIGHT : DARK, light ? LIGHT : DARK, light ? LIGHT : DARK);
  const o = add(scene, new THREE.PlaneGeometry(SQ, SQ).rotateX(-PI / 2), m, (i - 2) * SQ, BY, (j - 2) * SQ, false); sq.push(o);}
const CYL = new THREE.Group(); CYL.position.set(0.75, BY, -0.6); scene.add(CYL);
add(CYL, new THREE.CylinderGeometry(0.42, 0.42, 1.4, 64), std(0x3f9a55, {roughness: 0.55}), 0, 0.7, 0);
const A = V3(-0.5, BY, -1.0), B = V3(0, BY, 0);   // A = dark square (1,0) in the light, B = light square (2,2) in the shadow

// ------------------------------------------------------------------ camera and post (no vignette: it would change A and B differently)
const CAM = [[0, 0, 0.75, -0.1, 12.6, -10, 37], [4.0, 0, 0.75, -0.1, 12.2, -6, 38], [END + 0.2, 0, 0.8, -0.15, 12.9, 4, 35]];
const camAt = camPath(cam, CAM);
const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
composer.addPass(new OutputPass()); const grade = new ShaderPass(GRADE); grade.uniforms.vig.value = 0; grade.uniforms.grain.value = 0.025; composer.addPass(grade);

// ------------------------------------------------------------------ 2D: letters A and B, the proof bar in the colour measured from the rendered picture
const fx = document.getElementById('fx').getContext('2d'), glc = document.getElementById('gl'), probe = document.createElement('canvas'); probe.width = probe.height = 15; const pg = probe.getContext('2d', {willReadFrequently: true});
const scr = p => {const q = p.clone().project(cam); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H];};
function sample(x, y) {pg.drawImage(glc, x - 7, y - 7, 15, 15, 0, 0, 15, 15); const d = pg.getImageData(0, 0, 15, 15).data; let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) {r += d[i]; g += d[i + 1]; b += d[i + 2];} const n = d.length / 4; return [r / n, g / n, b / n];}
function draw2d(v) {fx.clearRect(0, 0, W, H); const [ax, ay] = scr(A), [bx, by] = scr(B), ca = sample(ax, ay), cb = sample(bx, by);
  const la = sm(seg(v, 0.6, 1.0)); fx.font = '800 64px Poppins'; fx.textAlign = 'center'; fx.textBaseline = 'middle';
  for (const [s, x, y] of [['A', ax, ay - 92], ['B', bx, by - 92]]) {fx.globalAlpha = la; fx.lineWidth = 10; fx.strokeStyle = 'rgba(20,20,24,0.85)'; fx.strokeText(s, x, y); fx.fillStyle = '#ffffff'; fx.fillText(s, x, y);
    fx.strokeStyle = '#ffffff'; fx.lineWidth = 3; fx.beginPath(); fx.moveTo(x, y + 38); fx.lineTo(x, y + 70); fx.stroke();}
  const grow = eio(seg(v, 3.2, 4.4)), fade = 1 - sm(seg(v, 5.8, 6.3));
  if (grow > 0 && fade > 0) {fx.globalAlpha = fade; fx.strokeStyle = `rgb(${ca.map(Math.round).join(',')})`; fx.lineCap = 'round'; fx.lineWidth = 46; fx.beginPath(); fx.moveTo(ax, ay); fx.lineTo(lerp(ax, bx, grow), lerp(ay, by, grow)); fx.stroke();
    fx.strokeStyle = 'rgba(255,255,255,0.0)';}
  fx.globalAlpha = 1; window.__AB = {a: ca.map(Math.round), b: cb.map(Math.round)};}

const TEXT = {TITLES: [[-0.3, 3.1, 'A und B haben<br>dieselbe Farbe.'], [3.3, 6.0, 'Wirklich.<br>Exakt dieselbe.'], [6.2, END + 1, 'Ohne Schatten sieht<br>man, wie hell B ist.']], NUMS: [],
  SUBS: [[0.1, 3.1, 'Feld A sieht dunkel aus, Feld B hell.'], [3.3, 6.0, 'Der Balken hat genau die Farbe von A und geht nahtlos in B über.'], [6.2, END + 1, 'Dein Gehirn rechnet den Schatten einfach heraus.']],
  SRCS: [[-0.3, END + 1, 'Nach Edward Adelson, MIT 1995 · Test · Modell vereinfacht']]};
const ov = overlays(TEXT);
function update(v) {camAt(v); grade.uniforms.t.value = v; CYL.position.y = BY + 7 * eio(seg(v, 6.3, 7.8)); ov(v);}
window.TOTAL = Math.round(END * FPS);
window.renderFrame = f => {update(f / FPS); composer.render(); draw2d(f / FPS);};
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round((q0 != null ? +q0 : 0) * FPS)); window.ready = true;
