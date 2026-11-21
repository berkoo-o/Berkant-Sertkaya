// function. – „Wem gehört eigentlich Deutschland?“ (Stil 10, Stadt aus Geld, One Take)
// Alle Zeiten sind Stimm-Zeiten (Take 1, voice/words_take1.json); im Video beginnt die Stimme bei 0,15 s.
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {clamp, lerp, ease, eo, ei, eio, ebk, win, rng} from './util.js';
import {RED, ground, tex, M, add, rbox, ROAD, ROADB, WALK, RA, RB, BLOCKS, rrLoop, blockLoop, winTex, GOLD, GOLDTOP, noteSide, noteTop, moneyMats,
  PAL, owned, ALLB, flagMesh, waveFlag, building, moneyTower, coinPile, person, poseWalk, car, bike, tree, lamp} from './city.js';

await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '700 40px Poppins', '800 90px "Inter Tight"'].map(f => document.fonts.load(f)));
const W = 1080, H = 1920, VO = 0.15, END_V = 70.0;
const Q = new URLSearchParams(location.search), FAST = Q.has('fast');
const R = rng(21);

// ------------------------------------------------------------------ renderer, scene, tilt-shift
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true}); renderer.setSize(W, H); renderer.setPixelRatio(1);
document.body.insertBefore(renderer.domElement, document.body.firstChild);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.localClippingEnabled = true;
const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
const SKY_DAY = new THREE.Color(0xa9c3d4), SKY_NIGHT = new THREE.Color(0x1c2236);
scene.background = SKY_DAY.clone(); scene.fog = new THREE.Fog(SKY_DAY.clone(), 20, 60);
const cam = new THREE.PerspectiveCamera(24, W / H, 0.05, 90);
const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
const TiltShader = {uniforms: {tDiffuse: {value: null}, dir: {value: new THREE.Vector2(1 / W, 0)}, r: {value: 0.5}, band: {value: 0.08}, fall: {value: 0.26}, amt: {value: 3.0}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 dir; uniform float r, band, fall, amt; varying vec2 vUv;
    void main(){ float k = smoothstep(band, band+fall, abs(vUv.y-r)) * amt; vec2 d = dir*k; vec4 s = vec4(0.0);
      s += texture2D(tDiffuse, vUv-6.0*d)*0.022; s += texture2D(tDiffuse, vUv-5.0*d)*0.04; s += texture2D(tDiffuse, vUv-4.0*d)*0.066; s += texture2D(tDiffuse, vUv-3.0*d)*0.096;
      s += texture2D(tDiffuse, vUv-2.0*d)*0.122; s += texture2D(tDiffuse, vUv-1.0*d)*0.141; s += texture2D(tDiffuse, vUv)*0.146; s += texture2D(tDiffuse, vUv+1.0*d)*0.141;
      s += texture2D(tDiffuse, vUv+2.0*d)*0.122; s += texture2D(tDiffuse, vUv+3.0*d)*0.096; s += texture2D(tDiffuse, vUv+4.0*d)*0.066; s += texture2D(tDiffuse, vUv+5.0*d)*0.04; s += texture2D(tDiffuse, vUv+6.0*d)*0.022;
      gl_FragColor = s; }`};
const tilt = []; for (const d of [[1 / W, 0], [0, 1 / H], [1.6 / W, 0], [0, 1.6 / H]]) {const p = new ShaderPass(TiltShader); p.uniforms.dir.value.set(d[0], d[1]); composer.addPass(p); tilt.push(p);}
composer.addPass(new OutputPass());
const CANVAS = renderer.domElement;
const W0 = new THREE.Group(); scene.add(W0);

// ------------------------------------------------------------------ ground, roads, sidewalks
const pave = new THREE.MeshStandardMaterial({color: 0x8fbf6a, roughness: .95});   // grass between the outer blocks
add(W0, new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), pave, 0, 0, 0, false);
function rrShape(hx, hz, r) {const s = new THREE.Shape(); r = Math.min(r, hx - 1e-3, hz - 1e-3); s.moveTo(-hx + r, -hz); s.lineTo(hx - r, -hz); s.quadraticCurveTo(hx, -hz, hx, -hz + r); s.lineTo(hx, hz - r);
  s.quadraticCurveTo(hx, hz, hx - r, hz); s.lineTo(-hx + r, hz); s.quadraticCurveTo(-hx, hz, -hx, hz - r); s.lineTo(-hx, -hz + r); s.quadraticCurveTo(-hx, -hz, -hx + r, -hz); return s;}
function ring(hx, hz, r, w, y, mat) {const s = rrShape(hx + w / 2, hz + w / 2, r + w / 2); s.holes.push(rrShape(hx - w / 2, hz - w / 2, Math.max(0.02, r - w / 2)));
  const g = new THREE.ShapeGeometry(s, 8); g.rotateX(Math.PI / 2); const m = add(W0, g, mat, 0, y, 0, false); m.material.side = THREE.DoubleSide; return m;}
const asph = new THREE.MeshStandardMaterial({color: 0x45464d, roughness: .85}), bikeM = new THREE.MeshStandardMaterial({color: 0x9a5a4a, roughness: .85}), walkM = new THREE.MeshStandardMaterial({color: 0xe4ddd0, roughness: .85});
ring(RA.hx, RA.hz, RA.r, ROAD, 0.004, asph); ring(RB.hx, RB.hz, RB.r, ROADB, 0.004, asph);
for (const s of [-1, 1]) ring(RB.hx + s * 0.24, RB.hz + s * 0.24, RB.r + s * 0.24, 0.1, 0.005, bikeM);
// lane markings: dashed centre line on both rings
for (const [L, n] of [[rrLoop(RA.hx, RA.hz, RA.r), 0], [rrLoop(RB.hx, RB.hz, RB.r), 0]]) for (let s = 0; s < L.len; s += 0.34) {const [x, z, dx, dz] = L.at(s); const m = add(W0, new THREE.BoxGeometry(0.16, 0.004, 0.022), M(0xf2efe6), x, 0.008, z, false); m.rotation.y = Math.atan2(-dz, dx);}
// sidewalks around every block (raised kerb), green lots and the plaza paving
const PLAZA_T = tex('plazaT', 512, 512, (g, w, h) => {g.fillStyle = '#d9c9ae'; g.fillRect(0, 0, w, h); const r = rng(3); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {g.fillStyle = ['#d2c0a2', '#ddcfb6', '#c9b593', '#e3d6bf'][Math.floor(r() * 4)]; g.fillRect(x + 1, y + 1, 30, 30);}
  g.strokeStyle = 'rgba(160,120,90,0.5)'; g.lineWidth = 10; g.strokeRect(40, 40, w - 80, h - 80);}); PLAZA_T.wrapS = PLAZA_T.wrapT = THREE.RepeatWrapping; PLAZA_T.repeat.set(2.2, 1.5);
const blockList = Object.entries(BLOCKS);
for (const [k, b] of blockList) {const cx = (b[0] + b[1]) / 2, cz = (b[2] + b[3]) / 2, hx = (b[1] - b[0]) / 2, hz = (b[3] - b[2]) / 2;
  const s = rrShape(hx + WALK, hz + WALK, 0.14); s.holes.push(rrShape(hx, hz, 0.06)); const g = new THREE.ExtrudeGeometry(s, {depth: 0.022, bevelEnabled: false}); g.rotateX(-Math.PI / 2);
  add(W0, g, walkM, cx, 0, cz, false).receiveShadow = true;
  add(W0, new THREE.BoxGeometry(hx * 2, 0.014, hz * 2), k === 'plaza' ? new THREE.MeshStandardMaterial({map: PLAZA_T, roughness: .85}) : M(k === 'south_e' || k === 'south_w' ? 0x7fc45a : 0xbfb4a2, {roughness: .9}), cx, 0.007, cz, false).receiveShadow = true;}
// zebra crossings where the pedestrian streets meet the rings (nobody crosses: decoration)
for (const [x, z, ry] of [[0, -RA.hz, 0], [0, RA.hz, 0], [-RA.hx, 0, 1], [RA.hx, 0, 1], [0, -RB.hz, 0], [0, RB.hz, 0], [-RB.hx, 0, 1], [RB.hx, 0, 1]]) for (let i = -2; i <= 2; i++) {
  const m = add(W0, new THREE.BoxGeometry(0.05, 0.004, ry ? 0.34 : 0.34), M(0xf2efe6), ry ? x : x + i * 0.09, 0.009, ry ? z + i * 0.09 : z, false); if (ry) m.rotation.y = Math.PI / 2;}

// ------------------------------------------------------------------ the plaza: ten figures, one per ten percent of households
const PLAZA = new THREE.Group(); W0.add(PLAZA);
add(PLAZA, rbox(3.3, 0.06, 0.34, 0.02), M(0xe9e3d6), 0, 0.03, -0.02);
const DEC = []; const DX = i => -1.35 + i * 0.3;
const decShirts = [0x5b8ef0, 0xf5c451, 0x58b48c, 0xa47ce0, 0xe7e2d8, 0x3e3f5a, 0xef8fb5, 0xf08a6c, 0x6fd0e0];
for (let i = 0; i < 10; i++) {const p = person(PLAZA, {k: 2.1, shirt: decShirts[i % 9], red: i === 9, hat: i === 9}); p.G.position.set(DX(i), 0.06, -0.02); DEC.push(p);
}
// two plates on the front of the podium: the poorer half and the richest tenth
for (const [txt, x, w, col] of [['Die ärmere Hälfte', (DX(0) + DX(4)) / 2, 1.42, '#3a3d48'], ['Die reichsten 10 %', DX(9), 0.42, '#E01E2B']]) {
  const tg = tex('plate' + txt, Math.round(w * 600), 64, (g, ww, h) => {g.fillStyle = '#f7f3ea'; g.fillRect(0, 0, ww, h); g.fillStyle = col; g.font = `700 ${txt.length > 17 ? 34 : 40}px Poppins`; g.textAlign = 'center'; g.fillText(txt, ww / 2, 46);});
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.1), new THREE.MeshStandardMaterial({map: tg, roughness: .6})); pl.position.set(x, 0.031, 0.152); pl.rotation.x = -0.35; PLAZA.add(pl);}
// what each tenth owns: coin piles for the poorer half, money stacks for the rest, a huge tower for the richest tenth (54 %)
const STK = [0, 0, 0, 0, 0, 0.24, 0.42, 0.66, 1.08, 3.24];
const piles = [], stacks = [];
for (let i = 0; i < 10; i++) {if (i < 5) {const c = coinPile(PLAZA, DX(i), 0.34, 2 + (i % 2), 0.55); c.visible = false; piles.push(c);}
  else {const w = i === 9 ? 0.26 : 0.2, d = i === 9 ? 0.2 : 0.16; const s = moneyTower(PLAZA, DX(i), 0.36, w, d, STK[i]); s.G.position.y = -STK[i]; stacks.push({...s, i, h: STK[i]});}}
const towerFlag = flagMesh(1.6); towerFlag.position.set(DX(9), 3.24, 0.36); PLAZA.add(towerFlag); towerFlag.visible = false;
// fountain, market stalls, spectators, trees around the plaza
{add(PLAZA, new THREE.CylinderGeometry(0.34, 0.37, 0.07, 32), M(0xe9e3d6), 0, 0.035, -0.75); add(PLAZA, new THREE.CylinderGeometry(0.3, 0.3, 0.02, 32), M(0x6fb8e0, {roughness: .15, metalness: .1}), 0, 0.072, -0.75);
 add(PLAZA, new THREE.CylinderGeometry(0.03, 0.05, 0.18, 12), M(0xe9e3d6), 0, 0.12, -0.75);}
const jets = []; for (let i = 0; i < 6; i++) {const a = i / 6 * Math.PI * 2; const j = add(PLAZA, new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshStandardMaterial({color: 0xdff2ff, transparent: true, opacity: 0.8, roughness: .1}), Math.cos(a) * 0.12, 0.2, -0.75 + Math.sin(a) * 0.12, false); jets.push([j, a]);}
for (const [x, c] of [[-1.45, 0], [-1.05, 1], [1.05, 2], [1.45, 3]]) {const S = new THREE.Group(); S.position.set(x, 0, -0.82); PLAZA.add(S);
  add(S, new THREE.BoxGeometry(0.3, 0.1, 0.16), M(0xb88a5a), 0, 0.05, 0); const aw = add(S, new THREE.BoxGeometry(0.34, 0.012, 0.22), M(PAL.awn[c]), 0, 0.2, 0.02); aw.rotation.x = 0.15;
  for (const sx of [-0.15, 0.15]) add(S, new THREE.CylinderGeometry(0.005, 0.005, 0.2, 6), M(0x6b4a33), sx, 0.1, -0.06);
  for (let k = 0; k < 4; k++) add(S, new THREE.SphereGeometry(0.018, 8, 6), M([0xe04a3a, 0xf2b33c, 0x6ab04a, 0xf07a5a][k]), -0.1 + k * 0.065, 0.115, 0.02);}
for (const [x, z] of [[-1.62, -1.02], [1.62, -1.02], [-1.62, 1.02], [1.62, 1.02], [-1.62, 0.0], [1.62, 0.0]]) tree(PLAZA, x, z, 1.1);
// flower beds and benches in the front part of the plaza
for (const x of [-1.05, 1.05]) {add(PLAZA, rbox(0.62, 0.05, 0.26, 0.02), M(0x9a7a5a), x, 0.025, 0.88); add(PLAZA, rbox(0.56, 0.02, 0.2, 0.01), M(0x5a8a3a), x, 0.055, 0.88);
  for (let i = 0; i < 14; i++) add(PLAZA, new THREE.SphereGeometry(0.018, 8, 6), M([0xf25a6a, 0xf5c84a, 0xa58be0, 0xffffff, 0xf2906e][i % 5]), x - 0.25 + (i % 7) * 0.083, 0.075, 0.84 + Math.floor(i / 7) * 0.08);}
for (const x of [-0.45, 0.45]) {const Bn = new THREE.Group(); Bn.position.set(x, 0, 0.98); PLAZA.add(Bn); add(Bn, rbox(0.24, 0.025, 0.08, 0.01), M(0xc9915a), 0, 0.07, 0); add(Bn, rbox(0.24, 0.07, 0.015, 0.006), M(0xc9915a), 0, 0.11, -0.035);
  for (const sx of [-0.1, 0.1]) add(Bn, new THREE.BoxGeometry(0.015, 0.06, 0.06), M(0x3a3d48), sx, 0.03, 0);}
const statics = [];   // standing people (spectators), with their positions for the self check
for (const [x, z, ry] of [[-1.5, 0.55, 2.6], [-1.3, 0.75, 2.8], [1.5, 0.6, -2.6], [1.62, 0.5, -2.7], [-0.6, -0.42, 0.3], [0.5, -0.45, -0.2], [-0.25, -1.0, 0], [0.3, -1.02, 0.4], [-1.2, -0.55, 0.5], [1.25, -0.55, -0.4]]) {
  const p = person(PLAZA, {}); p.G.position.set(x, 0.014, z); p.G.rotation.y = ry; statics.push({p, x, z});}

// ------------------------------------------------------------------ the blocks between the rings
const recs = {};
const B = (key, o) => {const r = building(W0, o); if (key) recs[key] = r; return r;};
// north-west: factory (Firmen) and two apartment blocks owned by the richest (Mietshäuser)
B('fabA', {x: -3.55, z: -3.0, w: 1.5, d: 1.2, h: 0.62, col: 0xb9a58a, own: 1, clip: 1, fx: 0.4, fs: 2.0});
B('fabB', {x: -2.05, z: -2.95, w: 1.1, d: 1.0, h: 0.52, col: 0xc9b49a, own: 1, clip: 1});
const chimneys = []; for (const [x, z, h] of [[-3.95, -3.35, 0.95], [-3.6, -3.35, 0.8]]) chimneys.push(add(recs.fabA.B, new THREE.CylinderGeometry(0.06, 0.08, h, 14), new THREE.MeshStandardMaterial({color: 0x8a6a5a, roughness: .7, clippingPlanes: [ground]}), x + 3.55, h / 2, z + 3.0));
for (let i = 0; i < 4; i++) {const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.28, 0); s.lineTo(0, 0.16); s.closePath(); const g = new THREE.ExtrudeGeometry(s, {depth: 0.8, bevelEnabled: false}); g.translate(0, 0, -0.4);
  add(recs.fabA.B, g, new THREE.MeshStandardMaterial({color: 0x9aa7b3, roughness: .5, clippingPlanes: [ground]}), -0.55 + i * 0.3, 0.64, 0.15);}
B('aptN1', {x: -1.2, z: -3.25, w: 0.62, d: 0.9, h: 1.05, c: 1, own: 1, balc: 1});
B('aptN2', {x: -0.55, z: -2.65, w: 0.5, d: 0.62, h: 0.85, c: 9, own: 1, balc: 1});
// north-east: stock exchange (Aktien) with a ticker and two office towers
B('boerse', {x: 1.25, z: -3.05, w: 1.5, d: 1.0, h: 0.72, col: 0xeee8da, own: 1, clip: 1, kind: 'block'});
{const G = recs.boerse.B; for (let i = 0; i < 6; i++) add(G, new THREE.CylinderGeometry(0.035, 0.04, 0.5, 14), new THREE.MeshStandardMaterial({color: 0xf6f1e6, roughness: .6, clippingPlanes: [ground]}), -0.6 + i * 0.24, 0.27, 0.54);
 const r = new THREE.Shape(); r.moveTo(-0.72, 0); r.lineTo(0.72, 0); r.lineTo(0, 0.22); r.closePath(); const g = new THREE.ExtrudeGeometry(r, {depth: 0.2, bevelEnabled: false}); add(G, g, new THREE.MeshStandardMaterial({color: 0xf6f1e6, roughness: .6, clippingPlanes: [ground]}), 0, 0.53, 0.42);
 add(G, new THREE.BoxGeometry(1.48, 0.05, 0.18), new THREE.MeshStandardMaterial({color: 0xf6f1e6, roughness: .6, clippingPlanes: [ground]}), 0, 0.52, 0.51);}
const tick = document.createElement('canvas'); tick.width = 2048; tick.height = 64; const tickT = new THREE.CanvasTexture(tick); tickT.colorSpace = THREE.SRGBColorSpace; tickT.wrapS = THREE.RepeatWrapping;
{const g = tick.getContext('2d'); g.fillStyle = '#0c1018'; g.fillRect(0, 0, 2048, 64); g.font = '700 38px Poppins'; let x = 10;
 for (const [s, v, up] of [['DAX', '+1,2 %', 1], ['MDAX', '+0,4 %', 1], ['SAP', '+2,1 %', 1], ['SIEMENS', '−0,3 %', 0], ['ALLIANZ', '+0,8 %', 1], ['BMW', '+1,5 %', 1], ['BASF', '−0,6 %', 0], ['TELEKOM', '+0,9 %', 1]]) {
   g.fillStyle = '#e8eef8'; g.fillText(s, x, 46); x += g.measureText(s).width + 14; g.fillStyle = up ? '#4fe08a' : '#ffb84a'; g.fillText((up ? '▲ ' : '▼ ') + v, x, 46); x += g.measureText('▲ ' + v).width + 50;}}
const ticker = add(recs.boerse.B, new THREE.BoxGeometry(1.2, 0.07, 0.012), [M(0x0c1018), M(0x0c1018), M(0x0c1018), M(0x0c1018), new THREE.MeshBasicMaterial({map: tickT, toneMapped: false, clippingPlanes: [ground]}), M(0x0c1018)], 0, 0.62, 0.523, false);
B('towerA', {x: 2.75, z: -3.2, w: 0.7, d: 0.7, h: 2.3, kind: 'glass', tint: '#7fa8d0', own: 1, clip: 1});
B('towerB', {x: 3.85, z: -2.85, w: 0.6, d: 0.62, h: 1.7, kind: 'glass', tint: '#8fc0b8', own: 1, clip: 1});
B(null, {x: 3.85, z: -3.65, w: 0.55, d: 0.42, h: 0.6, c: 4, kind: 'shop'});
// east: a courtyard of apartment houses (tenants); the courtyard is closed by the landlord's office (owned, becomes money)
const doors = [];
for (const [i, x] of [2.95, 3.42, 3.89].entries()) for (const s of [-1, 1]) {const r = B(`apt${s < 0 ? 'N' : 'S'}${i}`, {x, z: s * 0.75, w: 0.44, d: 0.8, h: 0.75 + ((i + (s > 0)) % 3) * 0.18, c: [0, 2, 4, 7, 8, 10][i * 2 + (s > 0)], balc: 1, ry: s < 0 ? 0 : Math.PI, own: 1});
  doors.push({x, z: s * 0.36, s, rec: r});}
B('landlord', {x: 4.36, z: 0, w: 1.1, d: 0.36, h: 0.9, col: 0xd8cbb8, own: 1, clip: 1, ry: -Math.PI / 2, fs: 1.3});
for (const [x, z] of [[2.95, -1.36], [3.6, -1.36], [4.25, -1.36], [2.95, 1.36], [3.6, 1.36], [4.25, 1.36]]) tree(W0, x, z, 0.9);
// west: school, shops, a small church, parking
B(null, {x: -3.9, z: -1.2, w: 1.0, d: 0.5, h: 0.55, c: 2}); B(null, {x: -3.05, z: -1.2, w: 0.5, d: 0.5, h: 0.75, c: 5, kind: 'shop'}); B(null, {x: -3.9, z: -0.56, w: 0.9, d: 0.44, h: 0.4, c: 6, kind: 'shop'});
B(null, {x: -3.1, z: -0.56, w: 0.5, d: 0.44, h: 0.5, c: 3, kind: 'house'});
B(null, {x: -3.95, z: 1.2, w: 0.95, d: 0.6, h: 0.9, c: 8, balc: 1}); B(null, {x: -3.0, z: 1.2, w: 0.5, d: 0.6, h: 0.6, c: 11, kind: 'shop'});
{const C = new THREE.Group(); C.position.set(-3.6, 0, 0.55); W0.add(C); add(C, rbox(0.55, 0.38, 0.32, 0.02), M(0xf1ebde), 0, 0.19, 0); const r = new THREE.Shape(); r.moveTo(-0.3, 0); r.lineTo(0.3, 0); r.lineTo(0, 0.2); r.closePath();
 const g = new THREE.ExtrudeGeometry(r, {depth: 0.34, bevelEnabled: false}); g.translate(0, 0, -0.17); g.rotateY(Math.PI / 2); add(C, g, M(0x7a5a4a), 0, 0.38, 0);
 add(C, rbox(0.16, 0.75, 0.16, 0.01), M(0xf1ebde), 0.34, 0.375, 0); const sp = new THREE.ConeGeometry(0.11, 0.3, 4); sp.rotateY(Math.PI / 4); add(C, sp, M(0x3f7a6a), 0.34, 0.9, 0);}
// south-west: family houses with gardens; the hero house (Einfamilienhaus) with a car in the drive
const HERO = {x: -1.55, z: 3.0};
for (const [x, z, c] of [[-4.1, 2.55, 0], [-3.45, 2.55, 3], [-2.8, 2.55, 6], [-4.1, 3.45, 8], [-3.45, 3.45, 2], [-2.8, 3.45, 10], [-2.15, 2.5, 4]]) {B(null, {x, z, w: 0.42, d: 0.38, h: 0.3, c, kind: 'house', ry: z > 3 ? 0 : Math.PI}); tree(W0, x + 0.25, z + (z > 3 ? 0.22 : -0.22), 0.7);}
B('hero', {x: HERO.x, z: HERO.z, w: 0.52, d: 0.44, h: 0.32, col: 0xf2d58c, kind: 'house', roof: 0x9a4a3a});
add(W0, new THREE.BoxGeometry(0.16, 0.006, 0.5), M(0x9a958c), HERO.x - 0.38, 0.016, HERO.z + 0.45, false);
const heroCar = car(W0, 'car', 0x2f6db5); heroCar.G.position.set(HERO.x - 0.38, 0.0, HERO.z + 0.42); heroCar.G.rotation.y = Math.PI / 2;
for (let i = 0; i < 9; i++) add(W0, new THREE.BoxGeometry(0.012, 0.06, 0.012), M(0xf2efe6), HERO.x - 0.2 + i * 0.09, 0.03, HERO.z + 0.7);
add(W0, new THREE.BoxGeometry(0.75, 0.008, 0.012), M(0xf2efe6), HERO.x + 0.16, 0.055, HERO.z + 0.7);
// the value of the household as a stack next to the house: house + savings + shares, minus the loan
const STX = HERO.x + 0.78, STZ = HERO.z + 0.12, LINE = 0.78;
const LAY = [[0, 0.44, 'Haus'], [0.44, 0.2, 'Erspartes'], [0.64, 0.24, 'Aktien']];
const layers = LAY.map(([y0, h]) => {const g = new THREE.Group(); g.position.set(STX, y0, STZ); W0.add(g); const m = add(g, new THREE.BoxGeometry(0.3, h, 0.22), moneyMats(0.3, h, false), 0, h / 2, 0); g.visible = false; return {g, m, h, y0};});
const debt = new THREE.Group(); debt.position.set(STX, 0.88, STZ); W0.add(debt);
{const t = tex('kredit', 256, 96, (g, w, h) => {g.fillStyle = '#5a5f6c'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '700 46px Poppins'; g.textAlign = 'center'; g.fillText('Kredit', w / 2, 64);});
 const side = new THREE.MeshStandardMaterial({color: 0x5a5f6c, roughness: .6}); add(debt, new THREE.BoxGeometry(0.31, 0.1, 0.23), [side, side, side, side, new THREE.MeshStandardMaterial({map: t, roughness: .6}), side], 0, -0.05, 0);} debt.visible = false;
const lineG = new THREE.Group(); lineG.position.set(STX, LINE, STZ); W0.add(lineG); lineG.visible = false;
{const dm = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.95, toneMapped: false}); for (let i = 0; i < 8; i++) for (const z of [-0.13, 0.13]) add(lineG, new THREE.BoxGeometry(0.06, 0.016, 0.016), dm, -0.32 + i * 0.09, 0, z, false);
 const t = tex('top10', 256, 80, (g, w, h) => {g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.roundRect(4, 8, w - 8, h - 16, 26); g.fill(); g.fillStyle = '#1b1d24'; g.font = '700 40px Poppins'; g.textAlign = 'center'; g.fillText('Top 10 %', w / 2, 54);});
 const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: t, toneMapped: false, depthTest: false})); sp.scale.set(0.3, 0.094, 1); sp.position.set(0.0, 0.12, 0.13); lineG.add(sp);}
const label = (txt, col = '#1b1d24') => {const t = tex('lab' + txt, 320, 80, (g, w, h) => {g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.roundRect(4, 8, w - 8, h - 16, 26); g.fill(); g.fillStyle = col; g.font = '700 38px Poppins'; g.textAlign = 'center'; g.fillText(txt, w / 2, 53);});
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: t, toneMapped: false, depthTest: false, transparent: true})); sp.scale.set(0.36, 0.09, 1); sp.renderOrder = 10; W0.add(sp); return sp;};
const labs = [label('Haus'), label('Erspartes'), label('Aktien'), label('− Schulden', '#5a5f6c')];
// piggy bank and a little share chart in the garden
const pig = new THREE.Group(); pig.position.set(HERO.x + 0.3, 0, HERO.z + 0.42); pig.rotation.y = -0.6; W0.add(pig);
{const pm = M(0xf2a7c3, {roughness: .5}); const b = add(pig, new THREE.SphereGeometry(0.06, 16, 12), pm, 0, 0.07, 0); b.scale.set(1.25, 1, 1); add(pig, new THREE.CylinderGeometry(0.022, 0.022, 0.02, 12).rotateZ(Math.PI / 2), pm, 0.077, 0.07, 0);
 for (const [x, z] of [[-0.04, -0.03], [-0.04, 0.03], [0.04, -0.03], [0.04, 0.03]]) add(pig, new THREE.CylinderGeometry(0.01, 0.01, 0.03, 8), pm, x, 0.015, z);
 for (const z of [-0.025, 0.025]) add(pig, new THREE.ConeGeometry(0.014, 0.025, 8), pm, 0.045, 0.12, z); add(pig, new THREE.BoxGeometry(0.03, 0.004, 0.006), M(0x5a2a3a), 0, 0.131, 0);}
const pigCoins = [0, 1, 2].map(() => {const c = add(W0, new THREE.CylinderGeometry(0.03, 0.03, 0.008, 18), [GOLD, GOLDTOP, GOLDTOP], 0, 0, 0); c.visible = false; return c;});
const chart = new THREE.Group(); chart.position.set(HERO.x + 0.62, 0, HERO.z + 0.48); W0.add(chart);
{add(chart, new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6), M(0x3a3a40), 0, 0.1, 0); const t = tex('chart', 200, 140, (g, w, h) => {g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2b8a4a'; g.lineWidth = 9; g.beginPath();
   [[14, 118], [52, 92], [84, 104], [120, 62], [150, 74], [186, 24]].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.strokeStyle = '#d8d8d8'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);});
 add(chart, new THREE.BoxGeometry(0.17, 0.12, 0.008), [M(0xffffff), M(0xffffff), M(0xffffff), M(0xffffff), new THREE.MeshStandardMaterial({map: t, roughness: .6}), M(0xffffff)], 0, 0.24, 0);}
// south-east: a park with a ferris wheel, a construction site with a crane
const wheel = new THREE.Group(); wheel.position.set(2.2, 0.95, 3.0); W0.add(wheel); const cabins = [];
{for (const z of [-0.08, 0.08]) {add(wheel, new THREE.TorusGeometry(0.78, 0.014, 8, 64), M(0xf2efe6, {metalness: .3}), 0, 0, z); for (let i = 0; i < 12; i++) {const a = i / 12 * Math.PI * 2; const sp = add(wheel, new THREE.CylinderGeometry(0.006, 0.006, 0.78, 6), M(0xf2efe6), Math.cos(a) * 0.39, Math.sin(a) * 0.39, z); sp.rotation.z = a - Math.PI / 2;}}
 for (let i = 0; i < 12; i++) {const c = new THREE.Group(); wheel.add(c); add(c, rbox(0.11, 0.09, 0.12, 0.02), M(PAL.awn[i % 6], {roughness: .4}), 0, -0.07, 0); add(c, new THREE.CylinderGeometry(0.004, 0.004, 0.05, 6), M(0x9a9a9a), 0, -0.01, 0); cabins.push(c);}}
for (const s of [-1, 1]) {const leg = add(W0, new THREE.CylinderGeometry(0.02, 0.03, 1.1, 8), M(0xe9e6df, {metalness: .3}), 2.2 + s * 0.3, 0.48, 3.0 - 0.14); leg.rotation.z = s * 0.3; const leg2 = leg.clone(); leg2.position.z = 3.14; W0.add(leg2);}
for (const [x, z] of [[0.6, 2.4], [0.9, 3.6], [1.3, 2.3], [3.2, 2.3], [3.4, 3.7], [0.55, 3.2], [1.5, 3.75]]) tree(W0, x, z, 1.1);
const crane = new THREE.Group(); crane.position.set(4.05, 0, 2.95); W0.add(crane);
{for (let i = 0; i < 9; i++) add(crane, new THREE.BoxGeometry(0.07, 0.17, 0.07), M(0xf2b33c, {wireframe: false}), 0, 0.085 + i * 0.17, 0); const jib = new THREE.Group(); jib.position.y = 1.55; crane.add(jib); crane.userData.jib = jib;
 add(jib, new THREE.BoxGeometry(1.3, 0.05, 0.05), M(0xf2b33c), 0.35, 0, 0); add(jib, rbox(0.12, 0.1, 0.1, 0.02), M(0x3a3d48), -0.25, -0.03, 0); add(jib, new THREE.CylinderGeometry(0.003, 0.003, 0.7, 4), M(0x22232a), 0.8, -0.35, 0);
 add(jib, rbox(0.14, 0.06, 0.1, 0.01), M(0xd8cfbf), 0.8, -0.72, 0);
 add(W0, rbox(0.7, 0.24, 0.5, 0.01), M(0xcfc6b6), 3.55, 0.12, 2.6); for (let i = 0; i < 4; i++) add(W0, new THREE.BoxGeometry(0.02, 0.38, 0.02), M(0x9a9590), 3.25 + i * 0.2, 0.19, 2.37);}

// ------------------------------------------------------------------ north beyond ring B: the hill with the villas of the super-rich
const HILL = {x: -1.2, z: -7.6, y: 0.62};
{const pts = []; for (let i = 0; i <= 16; i++) {const u = i / 16; pts.push(new THREE.Vector2(2.4 - 2.4 * u * u * 0.32 - (u > 0.72 ? (u - 0.72) * 3.2 : 0), HILL.y * Math.sin(Math.min(1, u * 1.35) * Math.PI / 2)));}
 pts.push(new THREE.Vector2(0, HILL.y)); const g = new THREE.LatheGeometry(pts.reverse(), 48); add(W0, g, M(0x7fae5a, {roughness: .95, side: THREE.DoubleSide}), HILL.x, 0, HILL.z);}
const HG = new THREE.Group(); HG.position.set(HILL.x, HILL.y, HILL.z); W0.add(HG);
add(HG, new THREE.CylinderGeometry(1.25, 1.25, 0.02, 48), M(0x8fc46a), 0, 0.0, 0, false);
B('villa', {x: HILL.x - 0.1, z: HILL.z + 0.15, w: 0.9, d: 0.55, h: 0.3, col: 0xf6f3ec, kind: 'block', own: 0}); recs.villa.G.position.y = HILL.y;
add(recs.villa.B, rbox(0.5, 0.18, 0.4, 0.01), M(0xf6f3ec), -0.15, 0.39, -0.05); add(recs.villa.B, new THREE.BoxGeometry(0.5, 0.15, 0.01), new THREE.MeshStandardMaterial({color: 0x9fc8e6, roughness: .1, metalness: .3}), -0.15, 0.39, 0.155);
B('villa2', {x: HILL.x + 0.9, z: HILL.z - 0.55, w: 0.6, d: 0.45, h: 0.28, col: 0xece6da, kind: 'block'}); recs.villa2.G.position.y = HILL.y;
add(HG, new THREE.BoxGeometry(0.5, 0.012, 0.26), M(0x4fb6e6, {roughness: .1, metalness: .1}), 0.65, 0.016, 0.55);   // pool
for (let i = 0; i < 16; i++) {const a = i / 16 * Math.PI * 2; add(HG, rbox(0.42, 0.09, 0.07, 0.02), M(0x4f8d3a, {roughness: .9}), Math.cos(a) * 1.18, 0.045, Math.sin(a) * 1.18).rotation.y = -a + Math.PI / 2;}
const heli = new THREE.Group(); heli.position.set(HILL.x - 0.8, HILL.y + 0.012, HILL.z - 0.55); W0.add(heli);
{add(heli, new THREE.CylinderGeometry(0.22, 0.22, 0.006, 32), M(0x5a5f6c), 0, 0, 0, false); const t = tex('heliH', 128, 128, (g, w, h) => {g.fillStyle = '#5a5f6c'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 96px "Inter Tight"'; g.textAlign = 'center'; g.fillText('H', w / 2, 98);});
 const p = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map: t})); p.position.y = 0.004; heli.add(p);
 const body = add(heli, new THREE.SphereGeometry(0.08, 16, 12), M(0x2b2b30, {metalness: .4, roughness: .3}), 0, 0.09, 0); body.scale.set(1.4, 0.9, 0.9); add(heli, new THREE.BoxGeometry(0.22, 0.025, 0.025), M(0x2b2b30), -0.17, 0.1, 0);
 const rot = new THREE.Group(); rot.position.y = 0.17; heli.add(rot); add(rot, new THREE.BoxGeometry(0.5, 0.006, 0.025), M(0x1b1b20), 0, 0, 0); add(rot, new THREE.BoxGeometry(0.025, 0.006, 0.5), M(0x1b1b20), 0, 0, 0); heli.userData.rot = rot;}
// the inheritance: an old and a young person in front of the villa, a stack of money with a red ribbon changes hands
const OLD = person(W0, {shirt: 0x4a4e5a, pants: 0x2b2b33, hairCol: 0xe4e0d8, hair: true}), YOUNG = person(W0, {shirt: 0x6fd0e0, pants: 0x3a4a6a});
OLD.G.position.set(HILL.x - 0.32, HILL.y + 0.012, HILL.z + 0.62); OLD.G.rotation.y = Math.PI / 2; YOUNG.G.position.set(HILL.x + 0.02, HILL.y + 0.012, HILL.z + 0.62); YOUNG.G.rotation.y = -Math.PI / 2;
add(OLD.G, new THREE.CylinderGeometry(0.004, 0.004, 0.13, 6), M(0x6b4a33), 0.035, 0.065, 0.02);
const gift = new THREE.Group(); W0.add(gift);
{for (let i = 0; i < 3; i++) add(gift, new THREE.BoxGeometry(0.09, 0.022, 0.05), [moneyMats(0.09, 0.022, false)[0], moneyMats(0.09, 0.022, false)[0], new THREE.MeshStandardMaterial({map: noteTop}), new THREE.MeshStandardMaterial({map: noteTop}), moneyMats(0.09, 0.022, false)[0], moneyMats(0.09, 0.022, false)[0]], 0, 0.011 + i * 0.023, 0);
 const rb = new THREE.MeshStandardMaterial({color: RED, roughness: .5, emissive: RED, emissiveIntensity: .15}); add(gift, new THREE.BoxGeometry(0.094, 0.072, 0.008), rb, 0, 0.035, 0); add(gift, new THREE.BoxGeometry(0.008, 0.072, 0.054), rb, 0, 0.035, 0);
 for (const s of [-1, 1]) {const l = add(gift, new THREE.TorusGeometry(0.012, 0.004, 6, 12), rb, s * 0.012, 0.078, 0); l.rotation.y = s * 0.6;}}

// ------------------------------------------------------------------ the river in the south with a footbridge and boats
const RIV = {z0: 5.65, z1: 6.55};
const waterT = tex('water', 256, 256, (g, w, h) => {g.fillStyle = '#4f8fb8'; g.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 260; i++) {g.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.12})`; g.fillRect(r() * w, r() * h, 10 + r() * 30, 2);}});
waterT.wrapS = waterT.wrapT = THREE.RepeatWrapping; waterT.repeat.set(16, 1);
const water = add(W0, new THREE.PlaneGeometry(40, RIV.z1 - RIV.z0).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map: waterT, roughness: .15, metalness: .15}), 0, -0.02, (RIV.z0 + RIV.z1) / 2, false);
for (const z of [RIV.z0, RIV.z1]) add(W0, new THREE.BoxGeometry(40, 0.06, 0.08), M(0xb8b0a0), 0, 0.0, z, false);
add(W0, new THREE.BoxGeometry(40, 0.05, RIV.z1 - RIV.z0), M(0x2f5a78), 0, -0.05, (RIV.z0 + RIV.z1) / 2, false);
{const br = new THREE.Group(); br.position.set(-0.6, 0, (RIV.z0 + RIV.z1) / 2); W0.add(br); add(br, rbox(0.42, 0.04, 1.3, 0.01), M(0xd8d0c0), 0, 0.08, 0); for (const s of [-1, 1]) add(br, new THREE.BoxGeometry(0.02, 0.06, 1.3), M(0x9a9590), s * 0.2, 0.13, 0);}
const boats = [[-9, 0.11, 0x2f6db5, 5.9], [8, -0.09, 0xf2b33c, 6.3]].map(([x0, v, c, z]) => {const G = new THREE.Group(); W0.add(G); add(G, rbox(0.42, 0.07, 0.14, 0.03), M(0xf6f3ec), 0, 0.0, 0); add(G, rbox(0.18, 0.07, 0.1, 0.02), M(c), -0.05, 0.07, 0); return {G, x0, v, z};});

// ------------------------------------------------------------------ the rest of the town around ring B (static, fills the picture)
const inHill = (x, z) => Math.hypot(x - HILL.x, z - HILL.z) < 2.9; const FILLOWN = [];
{const sx = 1.35, sz = 1.25; for (let gx = -11; gx <= 11; gx++) for (let gz = -10; gz <= 10; gz++) {const x = gx * sx, z = gz * sz;
  if (Math.abs(x) < RB.hx + 0.95 && Math.abs(z) < RB.hz + 0.95) continue; if (inHill(x, z)) continue; if (z > RIV.z0 - 0.75 && z < RIV.z1 + 0.65) continue;
  const r = R(); if (r < 0.1) {tree(W0, x, z, 1.2); tree(W0, x + 0.35, z + 0.25, 1.0); continue;}
  const kind = r < 0.35 ? 'house' : r < 0.5 ? 'shop' : 'block'; const w = 0.55 + R() * 0.45, d = 0.5 + R() * 0.4, h = kind === 'house' ? 0.3 + R() * 0.15 : 0.45 + R() * (Math.abs(z) < 7 ? 1.1 : 0.6);
  const own = (w * d * h > 0.32 && kind !== 'house') ? R() < 0.9 : R() < 0.3;
  const rec = B(null, {x, z, w, d, h, kind, balc: R() < 0.4, own, clip: own, fs: 3.2}); if (own) FILLOWN.push(rec); if (R() < 0.5) tree(W0, x + w / 2 + 0.12, z + d / 2 + 0.1, 0.8);
  if (R() < 0.25) {const c = car(W0, 'car'); c.G.position.set(x - w / 2 - 0.2, 0, z); c.G.rotation.y = Math.PI / 2;}
  add(W0, new THREE.BoxGeometry(0.3, 0.006, sz), M(0x5a5b62), x + 0.67, 0.002, z, false); add(W0, new THREE.BoxGeometry(sx, 0.006, 0.3), M(0x5a5b62), x, 0.002, z + 0.62, false);}}
// lamps and trees along the rings (kerb side, outside the walking lanes)
const lamps = [];
for (const [L, off] of [[rrLoop(RA.hx, RA.hz, RA.r), ROAD / 2 + 0.025], [rrLoop(RA.hx, RA.hz, RA.r), -(ROAD / 2 + 0.025)], [rrLoop(RB.hx, RB.hz, RB.r), ROADB / 2 + 0.025], [rrLoop(RB.hx, RB.hz, RB.r), -(ROADB / 2 + 0.025)]]) for (let s = 0.3; s < L.len; s += 1.15) {
  const [x, z, dx, dz] = L.at(s); const nx = dz, nz = -dx; const px = x + nx * off, pz = z + nz * off; if (Math.abs(px) < 0.45 || Math.abs(pz) < 0.45) continue; lamps.push(lamp(W0, px, pz));}

// ------------------------------------------------------------------ moving things: cars, buses, bikes, people, all on closed loops
const LANES = [];   // {L, v, s0[], objs[]}
function lane(hx, hz, r, off, dir, v, kinds, spacing) {const L = rrLoop(hx + off, hz + off, r + off, dir); const n = Math.floor(L.len / spacing); const objs = [];
  for (let i = 0; i < n; i++) {const k = kinds[i % kinds.length]; const o = k === 'bike' ? bike(W0) : car(W0, k); objs.push({...o, s0: i * L.len / n + R() * 0.1});} LANES.push({L, v, objs}); return LANES[LANES.length - 1];}
lane(RA.hx, RA.hz, RA.r, 0.1, 1, 0.42, ['car'], 1.45); lane(RA.hx, RA.hz, RA.r, -0.1, -1, 0.42, ['car'], 1.6);
lane(RB.hx, RB.hz, RB.r, 0.12, 1, 0.46, ['car', 'car', 'bus', 'car'], 1.6); lane(RB.hx, RB.hz, RB.r, -0.12, -1, 0.46, ['car', 'bus', 'car', 'car'], 1.7);
lane(RB.hx, RB.hz, RB.r, 0.24, 1, 0.22, ['bike'], 2.2); lane(RB.hx, RB.hz, RB.r, -0.24, -1, 0.22, ['bike'], 2.4);
const WALKERS = [];   // {loop, s0, v, p}
for (const [k, b] of blockList) for (const [off, dir, sp] of [[0.07, 1, 0.72], [0.15, -1, 0.9]]) {const L = blockLoop(b, off, dir); const n = Math.floor(L.len / sp);
  for (let i = 0; i < n; i++) {if (R() < 0.25) continue; const p = person(W0, {}); WALKERS.push({L, s0: i * L.len / n, v: 0.13, p, block: k});}}

// ------------------------------------------------------------------ flags: every owned thing; pop-up order by distance from the centre
for (const r of owned) {r.flag.visible = false; const wp = new THREE.Vector3(); r.G.getWorldPosition(wp); r.d = Math.hypot(wp.x, wp.z);}
owned.sort((a, b) => a.d - b.d);
const VILLAS = [recs.villa, recs.villa2].map(r => {const F = flagMesh(1.3); F.position.set(0, r.top, 0); r.G.add(F); F.visible = false; return F;});
// buildings that turn into money towers (companies, shares, the landlord's office)
const CONV = ['fabA', 'fabB', 'boerse', 'towerA', 'towerB', 'landlord'].map((k, i) => {const r = recs[k]; const o = r.o; const th = k === 'landlord' ? 0.8 : Math.max(o.h * 1.5, o.h + 0.5);
  const mt = moneyTower(W0, o.x, o.z, o.w * 0.92, o.d * 0.92, th, o.ry || 0); mt.G.position.y = -th; return {k, r, mt, th, t0: 22.95 + i * 0.27};});
const landlordConv = CONV.find(c => c.k === 'landlord');
for (const r of FILLOWN) {const o = r.o; const th = o.h * 1.45 + 0.25; const mt = moneyTower(W0, o.x, o.z, o.w * 0.92, o.d * 0.92, th, o.ry || 0); mt.G.position.y = -th;
  CONV.push({k: 'fill', r, mt, th, t0: 22.95 + clamp((Math.hypot(o.x, o.z) - 5) / 9, 0, 1) * 1.5 + R() * 0.2});}

// ------------------------------------------------------------------ rent: coins at the doors of the tenants, rolling to the landlord's money tower
const doorPiles = doors.map(d => {const c = coinPile(W0, d.x + 0.12, d.z + d.s * 0.04, 2, 0.7); c.visible = false; return c;});
const ROLL = doors.map((d, i) => ({d, t0: 46.75 + i * 0.32, coin: (() => {const c = add(W0, new THREE.CylinderGeometry(0.05, 0.05, 0.016, 22).rotateX(Math.PI / 2), [GOLD, GOLDTOP, GOLDTOP], 0, 0, 0); c.visible = false; return c;})()}));
const rollPath = d => {const zc = d.s * 0.09; return [[d.x + 0.12, d.z - d.s * 0.06], [d.x + 0.12, zc], [4.1, zc]];};

// ------------------------------------------------------------------ light and time of day
const sun = new THREE.DirectionalLight(0xffe6c4, 1.9); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, {left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 30}); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.01; scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3a3020, 0.55); scene.add(hemi);
const focus = new THREE.SpotLight(0xfff0dc, 0, 9, 0.5, 0.75, 1.4); scene.add(focus, focus.target);
const C_SUN_DAY = new THREE.Color(0xffe6c4), C_SUN_DUSK = new THREE.Color(0xff9a5a);
function night(t) {return clamp(0.3 * eio((t - 38) / 6) + 0.25 * eio((t - 49) / 8) + 0.15 * eio((t - 63) / 4), 0, 0.75);}

// ------------------------------------------------------------------ camera (voice time): target x,y,z, half frame height, azimuth, elevation
const C = (x, y, z, s, az, el, fov = 24) => [x, y, z, Math.log(s), az, el, fov];
const KEYS = [
  [0.0, C(0.2, 0.4, -2.5, 4.2, -22, 52)], [3.2, C(0.15, 0.4, -2.2, 3.9, -18, 50)], [5.9, C(0.1, 0.3, -0.6, 3.3, -12, 44)],
  [7.6, C(0.0, 0.28, 0.3, 2.35, -6, 27)], [9.9, C(0.1, 0.28, 0.32, 2.2, -5, 25)],
  [11.2, C(1.0, 1.1, 0.35, 1.35, -14, 16)], [12.6, C(1.15, 2.7, 0.3, 1.6, -18, 24)],
  [14.6, C(0.2, 0.6, -1.4, 3.6, -16, 46)], [16.6, C(-2.5, 0.4, -2.9, 2.2, -14, 36)], [17.5, C(-0.9, 0.45, -2.9, 2.1, -10, 35)], [18.4, C(1.2, 0.45, -2.9, 2.1, -6, 33)],
  [19.6, C(0.3, 0.6, -4.4, 2.2, -10, 36)], [21.0, C(-1.2, 0.85, -7.3, 1.45, -16, 30)], [22.6, C(-0.3, 0.5, -3.1, 4.6, -14, 54)], [24.9, C(0.1, 0.5, -2.9, 4.9, -16, 56)],
  [26.6, C(-0.9, 0.4, 1.8, 2.6, -20, 42)], [28.2, C(-1.12, 0.45, 3.1, 1.3, -16, 25)], [31.7, C(-1.08, 0.48, 3.1, 1.22, -13, 23)], [35.9, C(-1.02, 0.5, 3.08, 1.25, -10, 23)],
  [37.4, C(1.8, 0.4, 1.6, 2.6, 30, 48)], [38.9, C(3.2, 0.1, 0.0, 1.45, 76, 68)], [43.6, C(3.2, 0.1, 0.0, 1.4, 80, 67)], [46.6, C(3.25, 0.12, 0.0, 1.45, 84, 67)], [49.5, C(3.3, 0.25, -0.2, 1.7, 80, 62)],
  [50.9, C(1.2, 0.8, -3.4, 3.6, 30, 48)], [52.1, C(-1.36, 0.76, -6.98, 0.75, -12, 22)], [56.4, C(-1.32, 0.76, -7.0, 0.7, -4, 21)], [61.0, C(-1.1, 0.82, -6.85, 1.2, 6, 27)],
  [63.6, C(0.0, 0.6, -1.6, 4.0, -8, 48)], [66.6, C(0.4, 0.8, 0.0, 5.0, -14, 54)], [70.0, C(0.6, 1.2, 0.1, 5.6, -16, 58)]];
const KT = KEYS.map(k => k[0]), KV = KEYS.map(k => k[1]);
const KM = [0, 1, 2, 3, 4, 5, 6].map(j => {const n = KT.length, d = [], tg = new Array(n).fill(0); for (let i = 0; i < n - 1; i++) d.push((KV[i + 1][j] - KV[i][j]) / (KT[i + 1] - KT[i]));
  for (let i = 1; i < n - 1; i++) {if (d[i - 1] * d[i] <= 0) continue; const h0 = KT[i] - KT[i - 1], h1 = KT[i + 1] - KT[i], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; tg[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);} return tg;});
function camAt(t) {let i = 0; while (i < KT.length - 2 && t > KT[i + 1]) i++; const h = KT[i + 1] - KT[i], u = clamp((t - KT[i]) / h, 0, 1), u2 = u * u, u3 = u2 * u;
  const a = 2 * u3 - 3 * u2 + 1, b = u3 - 2 * u2 + u, c = -2 * u3 + 3 * u2, e = u3 - u2; return [0, 1, 2, 3, 4, 5, 6].map(j => a * KV[i][j] + b * h * KM[j][i] + c * KV[i + 1][j] + e * h * KM[j][i + 1]);}
const CAMT = new THREE.Vector3();
function setCam(t) {const v = camAt(t), size = Math.exp(v[3]); const az = (v[4] + 0.3 * Math.sin(t * 0.21) + 0.15 * Math.sin(t * 0.47 + 1.3)) * Math.PI / 180, el = (v[5] + 0.15 * Math.sin(t * 0.29 + 0.7)) * Math.PI / 180;
  CAMT.set(v[0], v[1], v[2]); const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  cam.fov = v[6]; const d = size / Math.tan(v[6] / 2 * Math.PI / 180); cam.position.copy(CAMT).addScaledVector(dir, d); cam.near = Math.max(0.03, d * 0.06); cam.far = d + 45;
  scene.fog.near = d + 4; scene.fog.far = d + 26; cam.lookAt(CAMT); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); return size;}

// ------------------------------------------------------------------ overlay text (voice time)
const SUBS = [[0.13, 3.05, 'Die reichsten zehn Prozent besitzen mehr als die Hälfte'], [3.05, 5.95, 'von allem, was den Haushalten in Deutschland gehört.'], [6.2, 7.6, 'Und die ärmere Hälfte?'],
  [7.8, 10.2, 'Zusammen nur zwei bis drei Prozent.'], [10.38, 12.6, 'Stell dir Deutschland als eine Stadt vor.'], [12.62, 16.33, 'Alles, was den reichsten zehn Prozent gehört, bekommt eine rote Fahne:'],
  [16.35, 19.24, 'vor allem Firmen, Mietshäuser und Aktien.'], [19.26, 22.82, 'Rechnet man die Superreichen dazu, die bei Umfragen kaum mitmachen,'], [22.85, 24.9, 'sind es sogar rund 60 Prozent.'],
  [25.3, 27.95, 'Aber ab wann gehört man eigentlich dazu?'], [28.2, 31.65, 'Ab rund 780.000 Euro Vermögen pro Haushalt.'], [31.74, 36.1, 'Also Haus, Erspartes und Aktien zusammengerechnet, minus Schulden.'],
  [36.36, 40.35, 'Die Hälfte der Haushalte hat dagegen weniger als 103.000 Euro.'], [40.38, 43.65, 'Ein großer Grund: Mehr als die Hälfte wohnt zur Miete,'], [43.66, 46.34, 'so viele wie in keinem anderen Land der EU.'],
  [46.35, 49.62, 'Die Miete fließt jeden Monat an die, denen die Häuser gehören.'], [49.86, 53.1, 'Und viel Vermögen wird nicht verdient, sondern vererbt.'], [53.18, 56.36, 'Allein 2024 wurden über 113 Milliarden Euro'],
  [56.38, 58.6, 'vererbt und verschenkt.'], [58.92, 61.45, 'Und das ist nur der Teil, den das Finanzamt erfasst.'], [61.7, 65.0, 'Und du? Glaubst du, du gehörst zu den reichsten zehn Prozent?'], [65.33, 66.72, 'Schreib’s in die Kommentare.']];
const NUMS = [[7.82, 10.25, '2–3 %', 'besitzt die ärmere Hälfte zusammen'], [12.62, 16.3, '54 %', 'besitzen die reichsten 10 % (Bundesbank, 2023)'], [22.85, 25.1, '≈ 60 %', 'mit den Superreichen'],
  [28.2, 31.7, '780.000 €', 'Vermögen pro Haushalt: ab hier gehörst du zu den reichsten 10 %'], [38.6, 40.4, '103.200 €', 'hat der mittlere Haushalt (Median)'],
  [41.6, 43.7, '58 %', 'der Haushalte wohnen zur Miete (Zensus 2022)'], [56.38, 58.7, '113 Mrd. €', 'vererbt und verschenkt 2024 (vom Finanzamt erfasst)']];
const TITLES = [[0.0, 6.2, 'Wem gehört eigentlich<br>Deutschland?'], [6.2, 7.82, 'Und die ärmere<br>Hälfte?'], [10.25, 12.62, 'Stell dir eine<br>Stadt vor'], [16.3, 19.26, 'Firmen, Mietshäuser,<br>Aktien'],
  [19.26, 22.85, 'Die Superreichen'], [25.1, 28.2, 'Ab wann gehört<br>man dazu?'], [31.7, 36.3, 'Haus + Erspartes<br>+ Aktien − Schulden'], [36.3, 38.6, 'Und die andere<br>Hälfte?'],
  [43.7, 49.62, 'Die Miete fließt<br>zu den Eigentümern'], [49.62, 56.38, 'Verdient oder<br>vererbt?'], [58.7, 61.6, 'Nur, was das<br>Finanzamt sieht'], [61.6, 66.72, 'Gehörst du<br>dazu?']];
const SRC = 'Quellen: Deutsche Bundesbank, IW Köln, Statistisches Bundesamt, Eurostat\nStand 20.11.2026 · Modell vereinfacht';
const $ = id => document.getElementById(id);
const subwEl = $('subw'), titleEl = $('title'), numEl = $('num'), subEl = $('sub'), srcEl = $('src'), logoEl = $('logo'), fadeEl = $('fade'), shadeEl = $('shade');
srcEl.innerHTML = SRC.replace('\n', '<br>');
const OUT0 = 66.72;
function overlay(t) {
  const s = SUBS.find(q => t >= q[0] && t < q[1]); subEl.textContent = s ? s[2] : ''; subEl.style.opacity = s ? Math.min(1, (t - s[0]) / 0.18 + 0.15) : 0; subEl.style.transform = s ? `translateY(${(1 - eo((t - s[0]) / 0.3)) * 8}px)` : 'none'; subwEl.style.opacity = s ? 1 : clamp(1 - (t - OUT0) / 0.3, 0, 1);
  const nm = NUMS.find(q => t >= q[0] && t < q[1]); let nop = 0;
  if (nm) {numEl.innerHTML = nm[2] + '<small>' + nm[3] + '</small>'; nop = Math.min(clamp((t - nm[0]) / 0.2, 0, 1), clamp((nm[1] - t) / 0.2, 0, 1)); const pi = eo((t - nm[0]) / 0.45); numEl.style.transform = `translateY(${(1 - pi) * 20}px) scale(${1 + 0.05 * (1 - pi)})`; numEl.style.transformOrigin = '0 0';}
  numEl.style.opacity = nop; numEl.style.filter = `blur(${(1 - Math.min(1, nm ? (t - nm[0]) / 0.3 : 1)) * 6}px)`;
  const tt = TITLES.find(q => t >= q[0] && t < q[1]);
  if (tt) {titleEl.innerHTML = tt[2]; const ti = t < 0.05 ? 1 : eo((t - tt[0]) / 0.4), to = clamp((tt[1] - t) / 0.25, 0, 1); titleEl.style.opacity = Math.min(ti, to) * (1 - nop); titleEl.style.transform = `translateY(${(1 - ti) * 18 - (1 - to) * 8}px)`; titleEl.style.filter = `blur(${(1 - ti) * 5}px)`;}
  else titleEl.style.opacity = 0;
  srcEl.style.opacity = 0.95 * clamp((OUT0 + 0.1 - t) / 0.3, 0, 1); logoEl.style.opacity = 1 - eo((t - OUT0) / 0.35);
  shadeEl.style.opacity = (1 - 0.6 * eio((t - OUT0) / 0.8)).toFixed(3);
}

// ------------------------------------------------------------------ outro: the red flag on the tallest money tower comes loose and writes the logo
const FX = document.createElement('canvas'); FX.width = W; FX.height = H; FX.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'; document.body.insertBefore(FX, $('fade'));
const fx = FX.getContext('2d');
const O = {t0: 66.9, lift: 67.65, write0: 67.65, write1: 69.05, dot: 69.15};
const LOGO = (() => {fx.font = '500 170px Poppins'; fx.letterSpacing = '-7px'; const wF = fx.measureText('function').width, wD = fx.measureText('.').width; const x0 = (W - wF - wD) / 2, base = 1010; fx.letterSpacing = '0px';
  return {x0, base, wF, dotX: x0 + wF + wD * 0.5, dotY: base - 22, dotR: 17};})();
const _v = new THREE.Vector3();
const toScreen = p => {_v.copy(p).project(cam); return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H];};
function drawOutro(t) {fx.clearRect(0, 0, W, H); if (t < O.t0) return;
  const vg = eio((t - O.t0) / 1.0); const g = fx.createRadialGradient(W / 2, H * 0.5, 120, W / 2, H * 0.5, H * 0.75); g.addColorStop(0, `rgba(12,10,14,${0.62 * vg})`); g.addColorStop(1, `rgba(6,5,8,${0.92 * vg})`); fx.fillStyle = g; fx.fillRect(0, 0, W, H);
  // the flag's position on screen while it is still on the tower, then it flies to the start of the writing
  const fp = new THREE.Vector3(); towerFlag.getWorldPosition(fp); fp.y += 0.25; const [sx, sy] = toScreen(fp);
  const sx0 = LOGO.x0 - 30, sy0 = LOGO.base - 60;
  O.sx = sx; O.sy = sy; O.sx0 = sx0; O.sy0 = sy0;
  if (t < O.write0) {ribbonHead(t, 1); return;}
  // writing: the logo appears behind the ribbon head from left to right, the ribbon trails behind like the flag's cloth
  const w = clamp((t - O.write0) / (O.write1 - O.write0), 0, 1), we = ease(w) * 0.85 + w * 0.15; const xr = LOGO.x0 + (LOGO.wF + 10) * we;
  fx.save(); fx.beginPath(); fx.rect(0, 0, xr, H); fx.clip(); fx.fillStyle = '#E01E2B'; fx.font = '500 170px Poppins'; fx.letterSpacing = '-7px'; fx.fillText('function', LOGO.x0, LOGO.base); fx.letterSpacing = '0px'; fx.restore();
  const [, hy] = headAt(Math.min(t, O.write1)); if (t < O.dot) ribbonHead(t, 1 - clamp((t - O.write1) / 0.12, 0, 1));
  // the end of the ribbon becomes the dot
  const d = clamp((t - O.write1) / 0.3, 0, 1); if (d > 0) {const k = d < 0.6 ? 1.35 * eo(d / 0.6) : lerp(1.35, 1, ease((d - 0.6) / 0.4)); const x = lerp(xr, LOGO.dotX, eo(d)), y = lerp(hy, LOGO.dotY, eo(d));
    fx.fillStyle = '#E01E2B'; fx.beginPath(); fx.arc(x, y, LOGO.dotR * k, 0, Math.PI * 2); fx.fill();}}
// position of the ribbon head at time t (stateless, so every frame can be rendered on its own)
function headAt(t) {if (t < O.write0) {const u = eio((t - O.t0) / (O.lift - O.t0)); return [lerp(O.sx, O.sx0, u), lerp(O.sy, O.sy0, u) - Math.sin(u * Math.PI) * 220];}
  const w = clamp((t - O.write0) / (O.write1 - O.write0), 0, 1), we = ease(w) * 0.85 + w * 0.15; return [LOGO.x0 + (LOGO.wF + 10) * we, LOGO.base - 62 + Math.sin(we * Math.PI * 7) * 46];}
function ribbonHead(t, a) {if (a <= 0) return; const trail = []; for (let i = 13; i >= 0; i--) {const tt = t - i * 0.025; if (tt >= O.t0) trail.push(headAt(tt));} const [x, y] = headAt(t);
  fx.save(); fx.globalAlpha = a; fx.lineCap = 'round'; fx.lineJoin = 'round'; fx.strokeStyle = '#E01E2B';
  for (let i = 1; i < trail.length; i++) {fx.lineWidth = 6 + 22 * (i / trail.length); fx.beginPath(); fx.moveTo(trail[i - 1][0], trail[i - 1][1] + Math.sin(t * 9 + i) * 3); fx.lineTo(trail[i][0], trail[i][1]); fx.stroke();}
  fx.fillStyle = '#E01E2B'; fx.beginPath(); fx.moveTo(x, y - 18); fx.quadraticCurveTo(x + 40, y - 6 + Math.sin(t * 11) * 6, x + 62, y + 4); fx.quadraticCurveTo(x + 30, y + 14, x, y + 20); fx.closePath(); fx.fill(); fx.restore();}

// ------------------------------------------------------------------ per-frame state
const _q = new THREE.Vector3();
function setTime(t) {
  const size = setCam(t); const n = night(t);
  sun.intensity = 1.9 * (1 - 0.8 * n); sun.color.copy(C_SUN_DAY).lerp(C_SUN_DUSK, clamp(n * 1.5, 0, 1)); hemi.intensity = 0.55 * (1 - 0.6 * n); scene.environmentIntensity = 0.5 * (1 - 0.6 * n);
  scene.background.copy(SKY_DAY).lerp(SKY_NIGHT, n); scene.fog.color.copy(scene.background);
  sun.position.set(CAMT.x - 4, 8, CAMT.z + 4.5); sun.target.position.set(CAMT.x, 0, CAMT.z); sun.target.updateMatrixWorld();
  focus.position.set(CAMT.x + 0.8, CAMT.y + 3, CAMT.z + 2); focus.target.position.copy(CAMT); focus.target.updateMatrixWorld(); focus.intensity = 1.0 + 9 * n;
  const lampOn = clamp((n - 0.25) / 0.2, 0, 1); lamps.forEach(b => b.material.emissiveIntensity = 0.2 + 2.6 * lampOn);
  // windows light up in the evening (switch to the lit textures once, then fade by emissive)
  const winGlow = 1.1 * clamp((n - 0.18) / 0.25, 0, 1); for (const r of ALLB) for (const m of r.wall) if (m.emissiveMap) m.emissiveIntensity = winGlow;
  // flags: pop up across the town (2.3–4.6 s), villas at 20.0, waving
  owned.forEach((r, i) => {const ts = 2.3 + i * (2.3 / owned.length); const p = clamp((t - ts) / 0.45, 0, 1); r.flag.visible = p > 0; r.flag.scale.setScalar(Math.max(1e-3, ebk(p, 2.2) * (r.o.fs || 2.3))); waveFlag(r.flag, t);});
  VILLAS.forEach((F, i) => {const p = clamp((t - 20.0 - i * 0.25) / 0.45, 0, 1); F.visible = p > 0; F.scale.setScalar(Math.max(1e-3, ebk(p, 2.2) * 1.3)); waveFlag(F, t);});
  // highlights: Firmen, Mietshäuser, Aktien
  const hl = (keys, t0) => {const k = win(t, t0, t0 + 1.0, 0.3); for (const key of keys) for (const m of recs[key].wall) {if (m.emissiveMap) m.emissiveIntensity = Math.max(m.emissiveIntensity, 1.4 * k); else {m.emissive = m.emissive || new THREE.Color(); m.emissive.setRGB(0.3 * k, 0.26 * k, 0.16 * k);}}};
  hl(['fabA', 'fabB'], 16.7); hl(['aptN1', 'aptN2'], 17.45); hl(['boerse', 'towerA', 'towerB'], 18.25);
  // the plaza: coin piles (2–3 %) and growing stacks, the huge tower of the richest tenth
  piles.forEach((c, i) => {const p = clamp((t - 8.3 - i * 0.12) / 0.35, 0, 1); c.visible = p > 0; c.scale.setScalar(0.55 * Math.max(1e-3, ebk(p, 2)));});
  stacks.forEach(s => {const t0 = s.i < 9 ? 9.2 + (s.i - 5) * 0.22 : 10.45, dur = s.i < 9 ? 0.6 : 1.9; const p = clamp((t - t0) / dur, 0, 1); const steps = s.i === 9 ? 12 : 3; const q = s.i === 9 ? (Math.floor(p * steps) + ease((p * steps) % 1)) / steps : eio(p);
    s.G.position.y = -s.h * (1 - Math.min(1, q));});
  {const p = clamp((t - 12.35) / 0.45, 0, 1); towerFlag.visible = p > 0 && t < O.t0; towerFlag.scale.setScalar(Math.max(1e-3, ebk(p, 2.2) * 1.6)); waveFlag(towerFlag, t, 1.4);}
  DEC.forEach((p, i) => {p.G.rotation.y = 0.06 * Math.sin(t * 0.8 + i); });
  // conversions: buildings sink, money towers grow; the flag rides on whichever top is higher
  for (const c of CONV) {const s = eio((t - c.t0) / 0.9), r = eio((t - c.t0 - 0.45) / 0.9); const o = c.r.o; c.r.B.position.y = -(o.h + 0.6) * s; c.r.B.visible = s < 0.999;
    c.mt.G.position.y = -c.th * (1 - r); c.mt.G.visible = r > 0.001; const extra = c === landlordConv ? 0.25 * eio((t - 47.2) / 2.4) : 0;
    if (extra) {c.mt.G.scale.y = (c.th + extra) / c.th; c.mt.G.position.y = 0;}
    const top = Math.max(c.r.top - (o.h + 0.6) * s, (c.th + extra) * r); c.r.flag.position.y = Math.max(0.02, top);}
  chimneys.forEach(ch => ch.visible = t < 23.6);
  // the household's stack: house, savings, shares, minus the loan
  lineG.visible = t > 28.4; lineG.scale.x = eio((t - 28.4) / 0.6) + 1e-3;
  const lt = [32.16, 32.66, 33.55];
  layers.forEach((L, i) => {const p = clamp((t - lt[i]) / 0.4, 0, 1); L.g.visible = p > 0; L.g.scale.y = Math.max(1e-3, ebk(p, 1.6)); const sp = labs[i]; sp.visible = p > 0 && t < 38.0; sp.material.opacity = Math.min(p, clamp((38.0 - t) / 0.4, 0, 1));
    sp.position.set(STX - 0.34, L.y0 + L.h / 2, STZ + 0.12);});
  {const p = clamp((t - 33.9) / 0.4, 0, 1), go = eio((t - 35.25) / 0.75); debt.visible = p > 0 && go < 1; debt.scale.y = Math.max(1e-3, ebk(p, 1.6)); debt.position.set(STX + 0.9 * go, 0.88 + 0.08 * p + 0.5 * go, STZ - 0.3 * go); debt.rotation.z = -0.6 * go;
   const sp = labs[3]; sp.visible = p > 0 && t < 38.0; sp.material.opacity = Math.min(p, 1 - go * 0.6, clamp((38 - t) / 0.4, 0, 1)); sp.position.set(STX - 0.34 + 0.9 * go, 0.93 + 0.5 * go, STZ + 0.12);}
  pigCoins.forEach((c, i) => {const p = clamp((t - 32.62 - i * 0.12) / 0.45, 0, 1); c.visible = p > 0 && p < 1; const a = [pig.position.x, 0.14, pig.position.z], b = [STX, 0.5 + i * 0.04, STZ];
    c.position.set(lerp(a[0], b[0], p), lerp(a[1], b[1], p) + Math.sin(p * Math.PI) * 0.25, lerp(a[2], b[2], p)); c.rotation.x = p * 6;});
  pig.rotation.z = -0.35 * win(t, 32.5, 33.1, 0.15); chart.scale.setScalar(1 + 0.12 * win(t, 33.5, 34.3, 0.2));
  // rent: coin piles at the doors, coins roll to the landlord's tower
  doorPiles.forEach((c, i) => {const p = clamp((t - 37.9 - i * 0.1) / 0.35, 0, 1); c.visible = p > 0; c.scale.setScalar(0.7 * Math.max(1e-3, ebk(p, 2)));});
  for (const r of ROLL) {const P = rollPath(r.d); const L1 = Math.abs(P[1][1] - P[0][1]), L2 = Math.abs(P[2][0] - P[1][0]); const dist = (t - r.t0) * 0.55; r.coin.visible = dist > 0 && dist < L1 + L2;
    if (!r.coin.visible) continue; let x, z, dir; if (dist < L1) {x = P[0][0]; z = lerp(P[0][1], P[1][1], dist / L1); dir = Math.PI / 2;} else {x = lerp(P[1][0], P[2][0], (dist - L1) / L2); z = P[1][1]; dir = 0;}
    r.coin.position.set(x, 0.065, z); r.coin.rotation.set(0, dir, 0); r.coin.rotateZ(-dist / 0.05);}
  // inheritance: the old person hands the stack with the red ribbon to the young one
  {const u = eio((t - 52.2) / 0.8); const a = [HILL.x - 0.27, HILL.y + 0.13, HILL.z + 0.62], b = [HILL.x - 0.03, HILL.y + 0.13, HILL.z + 0.62]; gift.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * 0.04, lerp(a[2], b[2], u));
   OLD.arms.forEach(m => m.rotation.x = -1.1 * (1 - u * 0.8)); YOUNG.arms.forEach(m => m.rotation.x = -1.1 * clamp((t - 51.6) / 0.5, 0, 1));}
  // town life
  for (const L of LANES) for (const o of L.objs) {const [x, z, dx, dz] = L.L.at(o.s0 + L.v * t); o.G.position.set(x, 0.0, z); o.G.rotation.y = Math.atan2(-dz, dx); if (o.hl) o.hl.emissiveIntensity = 0.3 + 2.5 * lampOn; if (o.p) poseWalk(o.p, 1, (o.s0 + L.v * t) * 0.6, t);}
  for (const w of WALKERS) {const s = w.s0 + w.v * t; const [x, z, dx, dz] = w.L.at(s); w.p.G.position.set(x, 0.022, z); w.p.G.rotation.y = Math.atan2(dx, dz); poseWalk(w.p, 1, s, t); w.p.G.position.y += 0.003 * Math.abs(Math.sin(s * 52));}
  statics.forEach(({p}, i) => {p.G.rotation.y += 0.0;});
  cabins.forEach((c, i) => {const a = i / 12 * Math.PI * 2 + t * 0.12; c.position.set(Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0); c.rotation.z = 0;}); wheel.rotation.z = 0;
  crane.userData.jib.rotation.y = 0.6 * Math.sin(t * 0.18); heli.userData.rot.rotation.y = t * 0.6;
  jets.forEach(([j, a], i) => {const ph = (t * 1.6 + i / 6) % 1; j.position.set(Math.cos(a) * (0.05 + 0.2 * ph), 0.12 + 0.28 * ph - 0.32 * ph * ph, -0.75 + Math.sin(a) * (0.05 + 0.2 * ph)); j.material.opacity = 0.8 * (1 - ph);});
  boats.forEach(b => {b.G.position.set(b.x0 + b.v * t, 0.0, b.z); b.G.rotation.y = b.v > 0 ? 0 : Math.PI;}); waterT.offset.x = t * 0.01;
  tickT.offset.x = t * 0.08;
  // tilt-shift: sharper band on close shots, wider blur on overviews
  tilt.forEach((p, i) => {p.uniforms.r.value = 0.49; p.uniforms.band.value = 0.09 + 0.07 * clamp((size - 1) / 3, 0, 1); p.uniforms.amt.value = 3.0 * clamp(0.5 + size / 3.0, 0.55, 1) * (i < 2 ? 1 : 0.8);});
  CANVAS.style.filter = 'saturate(1.35) contrast(1.08)';
  overlay(t); drawOutro(t);
}

// ------------------------------------------------------------------ render hooks and self check
window.TOTAL = Math.round((END_V + VO) * 30);
function drawAt(tv) {setTime(tv); composer.render(); const fv = tv + VO; const fd = Math.min(clamp(fv / 0.25, 0, 1), clamp((END_V - tv) / 0.3, 0, 1)); fadeEl.style.opacity = (1 - fd).toFixed(3);}
window.renderFrame = f => drawAt(f / 30 - VO);
window.setT = tv => drawAt(tv);
window.CHECK = (step = 1 / 10) => {let minPP = 9, minPPt = 0, minVV = 9, minVVt = 0; const bad = [];
  const cell = 0.2; for (let t = 0; t <= END_V; t += step) {const P = WALKERS.map(w => w.L.at(w.s0 + w.v * t)); const grid = new Map();
    P.forEach((p, i) => {const k = Math.floor(p[0] / cell) + ',' + Math.floor(p[1] / cell); (grid.get(k) || grid.set(k, []).get(k)).push(i);});
    P.forEach((p, i) => {const gx = Math.floor(p[0] / cell), gz = Math.floor(p[1] / cell); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const j of grid.get((gx + a) + ',' + (gz + b)) || []) if (j > i) {
      const d = Math.hypot(p[0] - P[j][0], p[1] - P[j][1]); if (d < minPP) {minPP = d; minPPt = t;} if (d < 0.052) bad.push(['pp', +t.toFixed(1), i, j, +d.toFixed(3)]);}
      for (const s of statics) {const wp = PLAZA.localToWorld(new THREE.Vector3(s.x, 0, s.z)); if (Math.hypot(p[0] - wp.x, p[1] - wp.z) < 0.052) bad.push(['ps', +t.toFixed(1), i]);}});
    for (const L of LANES) {const Q = L.objs.map(o => L.L.at(o.s0 + L.v * t)); for (let i = 0; i < Q.length; i++) for (let j = i + 1; j < Q.length; j++) {const d = Math.hypot(Q[i][0] - Q[j][0], Q[i][1] - Q[j][1]); if (d < minVV) {minVV = d; minVVt = t;}}}}
  return {walkers: WALKERS.length, minPP: +minPP.toFixed(3), minPPt: +minPPt.toFixed(1), minVV: +minVV.toFixed(3), minVVt: +minVVt.toFixed(1), n: bad.length, bad: bad.slice(0, 40)};};
window.DBGO = {THREE, scene, cam, recs, owned, CONV, WALKERS, LANES};
drawAt(0); window.ready = true;
