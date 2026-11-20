// function. – „Was wäre, wenn alle gleichzeitig ihr Geld abheben?“
// One continuous camera move through a miniature town. ?s=1 tilt-shift miniature, ?s=2 isometric board.
// All times below are voice times (take 2, bankrun/voice/words_take2.json); the voice starts 0.15 s into the video.
// Kürzung (Wunsch des Nutzers, 20.11.2026): „Deutschland 1931“ und „Und einfach mehr Geld drucken?“ sind gestrichen. Die Zeiten
// bleiben die der ganzen Aufnahme; im Video fehlt der Abschnitt CUT_A … CUT_B (ot() rechnet Videozeit in Aufnahmezeit um).
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {clamp, lerp, ease, eo, ei, eio, ebk, win, rng, ctex, roundRect} from './util.js';
import {L, BLD, FACTORY, PAL, buildTown} from './town.js';
import {choreo, buildPeople, poseAll, R_P} from './people.js';

// every weight drawn on a canvas must be loaded here first, otherwise the first drawing falls back to a serif font (700: „Bargeld“ on the cash machines)
await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '700 40px Poppins', '800 90px "Inter Tight"'].map(f => document.fonts.load(f)));
const W = 1080, H = 1920;
const S = +(new URLSearchParams(location.search).get('s') || 1); const P = PAL[S];
const VO = 0.15, END_V = 89.0;
const CUT_A = 45.07, CUT_B = 62.94, CUT_D = CUT_B - CUT_A, END_N = END_V - CUT_D;   // audio.py schneidet die Stimme an denselben Stellen
const ot = tv => tv < CUT_A ? tv : tv + CUT_D, nt = t => t < CUT_A ? t : t - CUT_D;

// ------------------------------------------------------------------ renderer, scene, post
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H); renderer.setPixelRatio(1); document.body.insertBefore(renderer.domElement, document.body.firstChild);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = S === 1 ? 0.95 : 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = S === 1 ? 0.5 : 0.35;
const SKY_DAY = new THREE.Color(S === 1 ? 0xb4c9d6 : 0x07070b), SKY_NIGHT = new THREE.Color(S === 1 ? 0x1c2233 : 0x050508);
scene.background = SKY_DAY.clone(); if (S === 1) scene.fog = new THREE.Fog(SKY_DAY.clone(), 9, 26);
const camP = new THREE.PerspectiveCamera(24, W / H, 0.05, 80);
const camO = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 80);
const cam = S === 1 ? camP : camO;
const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
// tilt-shift: a sharp band around the focus line, blur grows above and below it (two passes each direction)
const TiltShader = {uniforms: {tDiffuse: {value: null}, dir: {value: new THREE.Vector2(1 / W, 0)}, r: {value: 0.5}, band: {value: 0.07}, fall: {value: 0.26}, amt: {value: 3.0}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 dir; uniform float r, band, fall, amt; varying vec2 vUv;
    void main(){ float k = smoothstep(band, band+fall, abs(vUv.y-r)) * amt; vec2 d = dir*k; vec4 s = vec4(0.0);
      s += texture2D(tDiffuse, vUv-6.0*d)*0.022; s += texture2D(tDiffuse, vUv-5.0*d)*0.04; s += texture2D(tDiffuse, vUv-4.0*d)*0.066; s += texture2D(tDiffuse, vUv-3.0*d)*0.096;
      s += texture2D(tDiffuse, vUv-2.0*d)*0.122; s += texture2D(tDiffuse, vUv-1.0*d)*0.141; s += texture2D(tDiffuse, vUv)*0.146; s += texture2D(tDiffuse, vUv+1.0*d)*0.141;
      s += texture2D(tDiffuse, vUv+2.0*d)*0.122; s += texture2D(tDiffuse, vUv+3.0*d)*0.096; s += texture2D(tDiffuse, vUv+4.0*d)*0.066; s += texture2D(tDiffuse, vUv+5.0*d)*0.04; s += texture2D(tDiffuse, vUv+6.0*d)*0.022;
      gl_FragColor = s; }`};
const tilt = [];
if (S === 1) for (const d of [[1 / W, 0], [0, 1 / H], [1.6 / W, 0], [0, 1.6 / H]]) {const p = new ShaderPass(TiltShader); p.uniforms.dir.value.set(d[0], d[1]); composer.addPass(p); tilt.push(p);}
composer.addPass(new OutputPass());
const CANVAS = renderer.domElement;

// ------------------------------------------------------------------ town, people, cars
const T = buildTown(scene, S);
const agents = choreo(); const people = buildPeople(scene, S, P, agents);
const M = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: .7, ...o});
const LP = T.loop; const CAR_V = 0.42;
const cars = [4.88, 6.58, 10.5, 1.4].map((s0, i) => {
  const G = new THREE.Group(); scene.add(G); const col = P.cars[i];
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.07, 0.14, 2, 0.025), M(col, {roughness: .35, metalness: .2})); body.position.y = 0.06; body.castShadow = true; G.add(body);
  const cab = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.06, 0.125, 2, 0.022), M(S === 1 ? 0x2a313b : 0x4b4f80, {roughness: .2})); cab.position.set(-0.02, 0.115, 0); cab.castShadow = true; G.add(cab);
  for (const [x, z] of [[-0.09, 0.07], [0.09, 0.07], [-0.09, -0.07], [0.09, -0.07]]) {const w = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 14).rotateX(Math.PI / 2), M(0x18181b)); w.position.set(x, 0.026, z); G.add(w);}
  const hl = new THREE.MeshStandardMaterial({color: 0xfff7e0, emissive: 0xfff2d0, emissiveIntensity: 0.3});
  for (const z of [-0.042, 0.042]) {const h = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.018, 0.028), hl); h.position.set(0.151, 0.065, z); G.add(h);}
  const tl = new THREE.MeshStandardMaterial({color: 0x5a2a20, emissive: 0xff6a2a, emissiveIntensity: 0.1});
  for (const z of [-0.048, 0.048]) {const h = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.014, 0.02), tl); h.position.set(-0.151, 0.065, z); G.add(h);}
  return {G, s0, hl, tl};
});
function carPose(c, t) {const [x, z, dx, dz] = LP.at(c.s0 + CAR_V * t); return [x - dz * 0.1, z + dx * 0.1, dx, dz];}

// bright rim on glass (fresnel), so transparent objects read clearly
function rimMat(color, k) {return new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
  uniforms: {col: {value: new THREE.Color(color)}, k: {value: k}},
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'uniform vec3 col; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float r = pow(1.0-abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(col*r*k, 1.0); }'});}
// ------------------------------------------------------------------ the tower of account money (1 unit = 1.000 Mrd. €)
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.0);
const TW = {x: L.tower.x, z: L.tower.z, n: 48, hb: 4.0 / 48, w: 0.42, d: 0.26};
const bSide = ctex(128, 32, (g, w, h) => {const r = rng(8); for (let y = 0; y < h; y += 2) {g.fillStyle = ['#7db567', '#a5cc8a', '#6aa356', '#c9dfb0'][Math.floor(r() * 4)]; g.fillRect(0, y, w, 2);}});
const bTop = ctex(256, 160, (g, w, h) => {g.fillStyle = '#9fc68c'; g.fillRect(0, 0, w, h); g.fillStyle = '#86b277'; g.fillRect(0, 0, w * 0.32, h); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 6;
  g.beginPath(); g.arc(w * 0.62, h * 0.95, h * 0.55, Math.PI, 0); g.stroke(); g.fillStyle = '#f7f3e6'; g.font = '800 54px "Inter Tight"'; g.textAlign = 'right'; g.fillText('100', w - 14, 52);});
const bSideM = M(0xffffff, {map: bSide.tex, roughness: .85, clippingPlanes: [ground]}), bTopM = M(0xffffff, {map: bTop.tex, roughness: .8, clippingPlanes: [ground]});
const bandM = new THREE.MeshStandardMaterial({color: 0xf3e3b0, roughness: .5, clippingPlanes: [ground]});
const bundleGeo = new RoundedBoxGeometry(TW.w * 0.97, TW.hb * 0.9, TW.d * 0.97, 1, 0.006), bandGeo = new THREE.BoxGeometry(TW.w * 0.14, TW.hb * 0.94, TW.d * 1.01);
const bundles = Array.from({length: TW.n}, (_, j) => {const G = new THREE.Group(); scene.add(G);
  const m = new THREE.Mesh(new THREE.BoxGeometry(TW.w * 0.97, TW.hb * 0.9, TW.d * 0.97), [bSideM, bSideM, bTopM, bTopM, bSideM, bSideM]); m.castShadow = true; m.receiveShadow = true; G.add(m);
  const b = new THREE.Mesh(bandGeo, bandM); b.castShadow = true; G.add(b);
  return {G, j};});
// ghost outline of the full tower (for "Der Rest ist verliehen")
const ghostM = new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: 0, depthWrite: false});
const ghost = new THREE.Group(); ghost.position.set(TW.x, 0, TW.z); scene.add(ghost);
const ghostRim = rimMat(0xffffff, 0); const ghostFill = new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0, roughness: 0.1, depthWrite: false});
{const bx = new RoundedBoxGeometry(TW.w, 4.0, TW.d, 2, 0.01); const gm = new THREE.Mesh(bx, ghostFill); gm.position.y = 2.0; gm.renderOrder = 2; ghost.add(gm); const gr = new THREE.Mesh(bx, ghostRim); gr.position.y = 2.0; gr.renderOrder = 3; ghost.add(gr);
 const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(TW.w, 4.0, TW.d)); const l = new THREE.LineSegments(g, ghostM); l.position.y = 2.0; ghost.add(l);
 for (let k = 1; k < 4; k++) {const pts = [new THREE.Vector3(-TW.w / 2, k, TW.d / 2 + 0.001), new THREE.Vector3(TW.w / 2, k, TW.d / 2 + 0.001)]; ghost.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ghostM));}}

// where the bundles go: houses, cars and the factory (voice: "Häuser" 20.35, "Autos" 21.0, "Firmen" 21.6)
const DW = T.doorsWorld;
const HOUSE_T = [{door: [DW['B1-z'][0], 0.1, DW['B1-z'][1]], app: [DW['B1-z'][0], 0.16, -1.56]},
  {door: [DW['K2+z'][0], 0.1, DW['K2+z'][1]], app: [DW['K2+z'][0], 0.16, -2.3]},
  {door: [DW['K3+z'][0], 0.1, DW['K3+z'][1]], app: [DW['K3+z'][0], 0.16, -2.3]}];
const FAB_T = {door: [FACTORY.gateX, 0.12, FACTORY.z1], app: [FACTORY.gateX, 0.18, -2.3]};
const flights = [];
for (let i = 0; i < TW.n - 4; i++) {
  const j = TW.n - 1 - i; let kind, tgt, t0;
  if (i < 18) {kind = 'house'; tgt = HOUSE_T[i % 3]; t0 = 18.95 + i * 0.075;}
  else if (i < 30) {kind = 'car'; tgt = cars[(i - 18) % 2]; t0 = 20.3 + (i - 18) * 0.075;}
  else {kind = 'fab'; tgt = FAB_T; t0 = 20.95 + (i - 30) * 0.07;}
  flights.push({j, kind, tgt, t0});
}
const towerTop = 4.0;
function buildFlight(f) {
  const S0 = new THREE.Vector3(TW.x, (f.j + 0.5) * TW.hb, TW.z);
  let A, E, dur;
  if (f.kind === 'car') {dur = 1.25; const ta = f.t0 + dur; const [x, z] = carPose(f.tgt, ta); A = new THREE.Vector3(x, 0.62, z); E = new THREE.Vector3(x, 0.14, z);}
  else {A = new THREE.Vector3(...f.tgt.app); E = new THREE.Vector3(...f.tgt.door); dur = f.kind === 'fab' ? 1.15 : 1.45;}
  const dir = new THREE.Vector3(A.x - S0.x, 0, A.z - S0.z).normalize();
  const P1 = S0.clone().add(dir.clone().multiplyScalar(0.32)).add(new THREE.Vector3(0, 0.3, 0));
  const peakY = Math.max(S0.y + 0.25, 2.2);
  const Pk = new THREE.Vector3(lerp(S0.x, A.x, 0.6), peakY, lerp(S0.z, A.z, 0.6));
  const Aup = A.clone(); Aup.y = f.kind === 'car' ? 1.0 : 0.85;
  const pts = f.kind === 'car' ? [S0, P1, Pk, Aup, A, E] : [S0, P1, Pk, Aup, A, E];
  f.curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); f.dur = dur; f.t1 = f.t0 + dur;
}
flights.forEach(buildFlight);
const flightOf = new Map(flights.map(f => [f.j, f]));
function towerY(t) {return -4.06 * (1 - eio((t - 10.72) / 1.65)) - 0.42 * eio((t - 23.2) / 0.8);}
function poseBundles(t) {
  const y0 = towerY(t);
  for (const b of bundles) {
    const f = flightOf.get(b.j);
    if (!f || t < f.t0) {b.G.visible = t > 10.6 && y0 > -4.0 && !(t > 24.1); b.G.position.set(TW.x, y0 + (b.j + 0.5) * TW.hb, TW.z); b.G.rotation.set(0, 0, 0); b.G.scale.setScalar(1); continue;}
    if (t >= f.t1) {b.G.visible = false; continue;}
    const u = (t - f.t0) / f.dur, uu = eio(u) * 0.35 + u * 0.65; const p = f.curve.getPointAt(clamp(uu, 0, 1));
    const sc = lerp(1, 0.85, eo(u / 0.25)) * (1 - clamp((u - 0.8) / 0.2, 0, 1));
    b.G.visible = sc > 0.01; b.G.position.copy(p); b.G.scale.setScalar(Math.max(0.001, sc));
    const tg = f.curve.getTangentAt(clamp(uu, 0, 1)); b.G.rotation.set(0, Math.atan2(-tg.z, tg.x), 0);
  }
}

// ------------------------------------------------------------------ barrier, glass cover, slip
const barrier = new THREE.Group(); barrier.position.set(-0.765, 0, 0.565); scene.add(barrier);
const postM = M(S === 1 ? 0x5d636c : 0x6d6a9a, {metalness: .3, roughness: .5});
{const p = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.03), postM); p.position.y = 0.075; p.castShadow = true; barrier.add(p);}
const boom = new THREE.Group(); boom.position.y = 0.11; barrier.add(boom);
{const tex = ctex(512, 16, (g, w, h) => {g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = S === 1 ? '#3b4048' : '#5b56a8'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 32, h);});
 const b = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.016, 0.016), M(0xffffff, {map: tex.tex})); b.position.x = 0.44; b.castShadow = true; boom.add(b);
 const sg = ctex(256, 96, (g, w, h) => {g.fillStyle = '#ffffff'; roundRect(g, 2, 2, w - 4, h - 4, 10); g.fill(); g.strokeStyle = '#2b2f36'; g.lineWidth = 5; roundRect(g, 6, 6, w - 12, h - 12, 8); g.stroke();
   g.fillStyle = '#2b2f36'; g.font = '800 40px "Inter Tight"'; g.textAlign = 'center'; g.fillText('GESCHLOSSEN', w / 2, 64);});
 const plate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.075, 0.006), [M(0xffffff), M(0xffffff), M(0xffffff), M(0xffffff), M(0xffffff, {map: sg.tex}), M(0xffffff, {map: sg.tex})]);
 plate.position.set(0.45, -0.047, 0); plate.castShadow = true; boom.add(plate);
 [0.38, 0.52].forEach(x => {const c = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.012, 6), postM); c.position.set(x, -0.007, 0); boom.add(c);});}
function poseBarrier(t) {const grow = eo((t - 38.3) / 0.4) * (1 - eio((t - 63.85) / 0.5));
  barrier.visible = grow > 0.002; barrier.scale.set(1, Math.max(0.001, grow), 1);
  const down = (t < 39.6 ? ebk(clamp((t - 38.8) / 0.6, 0, 1), 1.2) : 1) * (1 - eio((t - 63.25) / 0.5));
  boom.rotation.z = Math.PI / 2 * (1 - down);}
// glass cover over the bank ("gesetzlich geschützt")
const cover = new THREE.Group(); scene.add(cover);
const coverM = new THREE.MeshPhysicalMaterial({color: 0xe9f6ff, transparent: true, opacity: 0.22, roughness: 0.03, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false, envMapIntensity: 3.0, side: THREE.DoubleSide});
const coverZ0 = -0.545, coverZ1 = 0.505, coverH = 1.26;
{const g = new RoundedBoxGeometry(1.70, coverH, coverZ1 - coverZ0, 6, 0.2); const m = new THREE.Mesh(g, coverM); m.position.set(0, coverH / 2, (coverZ0 + coverZ1) / 2); m.renderOrder = 3; cover.add(m);
 const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.70, coverH, coverZ1 - coverZ0)), new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.35}));
 e.position.copy(m.position); e.scale.set(0.997, 0.997, 0.997); cover.add(e); cover.userData.edge = e.material;
 const frame = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.04, coverZ1 - coverZ0 + 0.02), M(S === 1 ? 0x9aa3ad : 0xd7d3f2, {metalness: .6, roughness: .3}));
 frame.geometry = new RoundedBoxGeometry(1.72, 0.04, coverZ1 - coverZ0 + 0.02, 2, 0.015); frame.position.set(0, 0.02, (coverZ0 + coverZ1) / 2);
 const hole = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.05, coverZ1 - coverZ0 - 0.06), new THREE.MeshBasicMaterial({colorWrite: false})); hole.position.copy(frame.position); hole.renderOrder = -1;
 cover.add(frame);
 const cr = new THREE.Mesh(g, rimMat(0xdff2ff, 1.2)); cr.position.copy(m.position); cr.renderOrder = 4; cover.add(cr); cover.userData.rim = cr.material;
 const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), new THREE.MeshStandardMaterial({color: 0xe6f4ff, transparent: true, opacity: 0.4, roughness: 0.05, depthWrite: false})); knob.position.set(0, coverH + 0.035, (coverZ0 + coverZ1) / 2); cover.add(knob);}
function poseCover(t) {const d = t < 66 ? eo((t - 64.3) / 1.1) : 1; const up = eio((t - 71.8) / 0.8); const y = lerp(2.8, 0, d) + 3.2 * up;
  cover.visible = t > 64.25 && t < 72.7; cover.position.y = y; coverM.opacity = 0.22 * (1 - up); cover.userData.edge.opacity = 0.35 * (1 - up); cover.userData.rim.uniforms.k.value = 1.3 * (1 - up);}
// receipt with the logo (outro v2, Wunsch des Nutzers 20.11.2026: neuer, flüssiger): the empty red machine prints a receipt
// that rises out of the printer slot in its lit header; the print scrolls up with the paper, then the red dot pops in
const ATM2 = T.bank.atms[2];
const slipW = 0.09, slipH = 0.086;
const slip = new THREE.Group(); scene.add(slip);
const slipTex = ctex(540, 516, (g, w, h) => {g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,0.045)'; for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 1);
  g.fillStyle = '#a3a3a3'; g.font = '500 22px Poppins'; g.textAlign = 'center'; g.fillText('- - - - - - - - - - - - - - - -', w / 2, 52); g.fillText('- - - - - - - - - - - - - - - -', w / 2, h - 40);
});
// the whole logo is printed in red, like the channel logo (Wunsch des Nutzers, 20.11.2026: „Outro komplett in rot“)
const inkTex = ctex(540, 516, (g, w, h) => {g.clearRect(0, 0, w, h); g.fillStyle = '#E01E2B'; g.font = '500 104px Poppins'; g.letterSpacing = '-3px'; g.textAlign = 'left';
  let fs = 104; while (g.measureText('function.').width > w * 0.86) {fs -= 2; g.font = `500 ${fs}px Poppins`;}
  const wd = g.measureText('function').width, dot = g.measureText('.').width, x0 = (w - wd - dot) / 2, base = h / 2 + fs * 0.32;
  g.fillText('function', x0, base);
  slip.userData.dot = [(x0 + wd + dot * 0.5) / w, (base - fs * 0.085) / h, fs / h];});
inkTex.tex.wrapS = inkTex.tex.wrapT = THREE.ClampToEdgeWrapping;
slipTex.tex.wrapS = slipTex.tex.wrapT = THREE.ClampToEdgeWrapping;
const slipM = new THREE.MeshStandardMaterial({map: slipTex.tex, roughness: .8, emissive: 0xffffff, emissiveMap: slipTex.tex, emissiveIntensity: 0.5});
const slipGeo = new THREE.PlaneGeometry(slipW, slipH); slipGeo.translate(0, slipH / 2, 0);
const slipMesh = new THREE.Mesh(slipGeo, slipM); slip.add(slipMesh);
const inkMesh = new THREE.Mesh(slipGeo, new THREE.MeshBasicMaterial({map: inkTex.tex, transparent: true, depthWrite: false, toneMapped: false})); inkMesh.position.z = 0.0003; slip.add(inkMesh);
const dotM = new THREE.MeshBasicMaterial({color: 0xE01E2B, toneMapped: false, transparent: true, opacity: 0});
const dotMesh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), dotM);
{const [u, v, k] = slip.userData.dot; dotMesh.scale.setScalar(k * slipH * 0.11); dotMesh.userData.base = k * slipH * 0.11; dotMesh.position.set((u - 0.5) * slipW, (1 - v) * slipH, 0.0006); slip.add(dotMesh);}
const slotWorld = new THREE.Vector3(ATM2.x, ATM2.slotY, ATM2.slotZ);
const PRINT = {t0: 86.35, t1: 87.4, dot: 87.6};
function poseSlip(t) {
  const u = clamp((t - PRINT.t0) / (PRINT.t1 - PRINT.t0), 0, 1); const L = slipH * (u < 0.85 ? u / 0.85 * 0.93 : 0.93 + 0.07 * eo((u - 0.85) / 0.15));   // steady feed, gentle stop
  slip.visible = L > 0.0005;
  slip.position.set(slotWorld.x, slotWorld.y, slotWorld.z + 0.002);
  slip.rotation.set(-0.06 * (L / slipH), 0, 0);                          // the paper leans back a little as it gets longer
  slipMesh.scale.y = inkMesh.scale.y = Math.max(0.001, L / slipH);
  for (const tx of [slipTex.tex, inkTex.tex]) {tx.repeat.set(1, L / slipH); tx.offset.set(0, 1 - L / slipH);}   // the top of the print comes out first and rises with the paper
  const d = clamp((t - PRINT.dot) / 0.3, 0, 1); dotM.opacity = d; const k = d < 0.6 ? 1.5 * eo(d / 0.6) : lerp(1.5, 1, ease((d - 0.6) / 0.4));
  dotMesh.scale.setScalar(Math.max(1e-5, dotMesh.userData.base * k));
}

// ------------------------------------------------------------------ light and time of day
const sun = new THREE.DirectionalLight(0xffe6c4, 2.0); sun.position.set(-3.6, 6.2, 3.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left: -5.5, right: 5.5, top: 5.5, bottom: -5.5, near: 0.5, far: 20}); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.01; sun.shadow.radius = S === 2 ? 2 : 5;
scene.add(sun); scene.add(sun.target);
const hemi = new THREE.HemisphereLight(S === 1 ? 0xbfd8ff : 0xdcd6ff, S === 1 ? 0x3a3020 : 0x1a1430, S === 2 ? 1.05 : 0.6); scene.add(hemi);
const rim = new THREE.DirectionalLight(0x8a78ff, S === 2 ? 0.55 : 0.0); rim.position.set(4, 3, -3); scene.add(rim);
const focus = new THREE.SpotLight(0xfff0dc, 0, 6, 0.42, 0.75, 1.4); scene.add(focus); scene.add(focus.target);
const vaultSpot = new THREE.SpotLight(0xfff2d8, 0, 3, 0.35, 0.6, 1.2); vaultSpot.position.set(0.05, 1.8, -0.1); scene.add(vaultSpot); vaultSpot.target.position.set(0.05, 0.06, -0.24); scene.add(vaultSpot.target);
const moon = new THREE.DirectionalLight(0x8fa6ff, 0); moon.position.set(3, 5, 2); scene.add(moon);
function night(t) {return clamp(0.62 * eio((t - CUT_B) / 4.0) + 0.12 * clamp((t - 66) / 14, 0, 1) + 0.18 * clamp((t - 82.4) / 1.6, 0, 1), 0, 0.92);}   // dusk falls while the glass cover comes down
const C_SUN_DAY = new THREE.Color(0xffe6c4), C_SUN_DUSK = new THREE.Color(0xff9a5a);
function bankLit(t) {
  if (t < 35.72) return 1; if (t < 64.1) return 0;
  if (t < 74.75) return 1;
  if (t < 75.5) {const k = Math.floor((t - 74.75) * 18); return [1, 0.2, 1, 1, 0.1, 0.8, 0, 1, 0.3, 0, 0.6, 0, 0, 0.4][k % 14];}
  if (t < 82.0) return 0; return 1;
}
function shutterDown(t) {return eio((t - 35.75) / 0.5) * (1 - eio((t - 63.6) / 0.5)) + eio((t - 75.55) / 0.45) * (1 - eio((t - 81.85) / 0.5));}
function atmState(i, t) {
  if (i === 2) return t >= 24.9 ? 'leer' : 'idle';
  const tl = i === 1 ? 25.2 : 25.5;
  if (i === 0 && t >= 43.33 && t < 44.95) return 'sixty';
  if (t >= tl && t < 64.1) return 'leer'; if (t >= 75.25 + 0.2 * i && t < 82.0) return 'leer'; return 'idle';
}

// ------------------------------------------------------------------ camera (voice time). Values: target x,y,z, half frame height, azimuth, elevation, fov (style 1)
const C = (x, y, z, s, az, el, fov = 24) => [x, y, z, Math.log(s), az, el, fov];
const KEYS = [
  [0.0, C(0.0, 0.25, -0.35, S === 1 ? 4.3 : 6.0, -24, 46)], [3.0, C(0.0, 0.25, -0.25, S === 1 ? 3.6 : 4.4, -20, 42)], [5.4, C(-0.35, 0.2, 0.35, 1.45, -14, 34)], [8.8, C(-0.2, 0.25, 0.25, 1.35, -10, 30)],
  [9.8, C(0, 0.9, -0.6, 2.2, -12, 32)], [11.2, C(0, 2.0, -1.1, 2.75, -14, 30)], [12.6, C(0, 2.05, -1.1, 2.7, -12, 30)],
  [13.6, C(0, 0.25, -0.12, 1.05, -14, 52)], [16.7, C(0.03, 0.15, -0.2, 0.85, -10, 56)], [17.9, C(0, 1.4, -0.7, 2.2, -14, 32)],
  [19.1, C(0, 0.6, -0.5, S === 1 ? 4.0 : 4.8, -18, 46)], [21.9, C(0, 0.4, -0.5, S === 1 ? 4.1 : 5.0, -20, 48)],
  [23.0, C(0.38, 0.24, 0.55, 0.78, -22, 24)], [25.5, C(0.40, 0.24, 0.55, 0.72, -18, 22)], [26.6, C(0.1, 0.3, 0.5, 1.15, -16, 26)], [33.8, C(0.05, 0.3, 0.5, 1.05, -12, 26)],
  [35.2, C(-0.25, 0.26, 0.47, 0.7, -6, 18)], [36.6, C(-0.25, 0.28, 0.5, 0.8, 0, 20)], [37.9, C(-0.2, 0.32, 0.5, 1.15, 8, 26)], [41.6, C(0.0, 0.3, 0.5, 1.0, -4, 24)],
  [42.7, C(0.3, 0.3, 0.5, 0.55, -10, 18)], [44.6, C(0.3, 0.3, 0.5, 0.55, -6, 18)],
  // cut: from the "60 €" machine the camera pulls back to the bank front while barrier and shutter open and the glass cover comes down
  [64.7, C(-0.12, 0.5, 0.05, 1.9, -32, 30)], [70.8, C(-0.3, 0.5, -0.05, 1.8, -56, 36)],
  [72.4, C(-2.0, 0.2, -0.35, 1.45, -72, 48)], [75.8, C(-2.0, 0.2, -0.2, 1.35, -66, 46)], [77.1, C(-0.2, 0.3, 0.35, 1.5, -18, 32)], [81.6, C(-0.1, 0.3, 0.35, 1.45, -14, 30)],
  [83.6, C(0.18, 0.3, 0.42, 1.0, -18, 22)], [85.4, C(0.42, 0.33, 0.45, 0.55, -10, 15)],
  [86.7, C(0.64, 0.37, 0.48, 0.15, -4, 8, 14)], [89.0, C(0.64, 0.38, 0.48, 0.13, -3, 7, 12)]];
const KT = KEYS.map(k => nt(k[0])), KV = KEYS.map(k => k[1]);   // interpolated in video time, so the camera runs smoothly across the cut
const KM = [0, 1, 2, 3, 4, 5, 6].map(j => {const n = KT.length, d = [], tg = new Array(n).fill(0); for (let i = 0; i < n - 1; i++) d.push((KV[i + 1][j] - KV[i][j]) / (KT[i + 1] - KT[i]));
  for (let i = 1; i < n - 1; i++) {if (d[i - 1] * d[i] <= 0) continue; const h0 = KT[i] - KT[i - 1], h1 = KT[i + 1] - KT[i], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; tg[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);} return tg;});
function camAt(to) {const t = nt(to); let i = 0; while (i < KT.length - 2 && t > KT[i + 1]) i++; const h = KT[i + 1] - KT[i], u = clamp((t - KT[i]) / h, 0, 1), u2 = u * u, u3 = u2 * u;
  const a = 2 * u3 - 3 * u2 + 1, b = u3 - 2 * u2 + u, c = -2 * u3 + 3 * u2, e = u3 - u2;
  return [0, 1, 2, 3, 4, 5, 6].map(j => a * KV[i][j] + b * h * KM[j][i] + c * KV[i + 1][j] + e * h * KM[j][i + 1]);}
const CAMT = new THREE.Vector3();
function setCam(t) {
  const v = camAt(t); const size = Math.exp(v[3]); const calm = lerp(1, 0.25, eio((t - 85.4) / 1.4)); const tn = nt(t);
  const az = (v[4] + calm * (0.35 * Math.sin(tn * 0.23) + 0.2 * Math.sin(tn * 0.51 + 1.3))) * Math.PI / 180, el = (v[5] + calm * 0.18 * Math.sin(tn * 0.31 + 0.7)) * Math.PI / 180;
  CAMT.set(v[0], v[1], v[2]);
  const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  if (S === 1) {camP.fov = v[6]; const d = size / Math.tan(v[6] / 2 * Math.PI / 180); camP.position.copy(CAMT).addScaledVector(dir, d); camP.near = Math.max(0.02, d * 0.08); camP.far = d + 40; if (scene.fog) {scene.fog.near = d + 3; scene.fog.far = d + 22;}}
  else {const hh = size, ww = hh * W / H; Object.assign(camO, {left: -ww, right: ww, top: hh, bottom: -hh}); camO.position.copy(CAMT).addScaledVector(dir, 22); camO.near = 0.1; camO.far = 60;}
  cam.lookAt(CAMT); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  if (window.DBG) {const [x, y, z, s, a2, e2] = window.DBG; const A2 = a2 * Math.PI / 180, E2 = e2 * Math.PI / 180; const dd = new THREE.Vector3(Math.sin(A2) * Math.cos(E2), Math.sin(E2), Math.cos(A2) * Math.cos(E2));
    CAMT.set(x, y, z); if (S === 1) {const d = s / Math.tan(12 * Math.PI / 180); camP.fov = 24; camP.position.copy(CAMT).addScaledVector(dd, d);} else {Object.assign(camO, {left: -s * W / H, right: s * W / H, top: s, bottom: -s}); camO.position.copy(CAMT).addScaledVector(dd, 22);}
    cam.lookAt(CAMT); cam.updateProjectionMatrix(); cam.updateMatrixWorld();}
}

// ------------------------------------------------------------------ overlay text (voice time)
const SUBS = [[0.08, 2.0, 'Von 100 Euro auf deutschen Konten'], [2.0, 5.3, 'haben die Banken nicht mal einen Euro als Bargeld da.'], [5.58, 7.2, 'Was passiert also, wenn morgen alle'], [7.2, 9.35, 'gleichzeitig ihr Geld abheben wollen?'],
  [9.57, 12.9, 'Auf den Konten liegen über 4.000 Milliarden Euro.'], [12.92, 15.5, 'In den Tresoren und Automaten aller Banken zusammen'], [15.5, 17.62, 'sind es nur rund 20 Milliarden.'],
  [17.64, 19.55, 'Der Rest ist zum Großteil verliehen:'], [19.55, 22.25, 'als Kredit für Häuser, Autos und Firmen.'], [22.38, 25.55, 'Schon nach wenigen Stunden wären die ersten Automaten leer.'],
  [25.6, 29.65, 'Wie schnell das geht, zeigte 2023 die Silicon Valley Bank:'], [29.68, 31.6, 'An einem einzigen Tag wollten Kunden'], [31.6, 34.25, '42 Milliarden Dollar abziehen.'],
  [34.46, 36.45, 'Am nächsten Morgen war die Bank geschlossen.'], [36.63, 38.15, 'Dann greift der Staat ein.'], [38.24, 41.95, 'In Griechenland blieben die Banken 2015 drei Wochen zu,'],
  [42.0, 44.85, 'am Automaten gab es höchstens 60 Euro am Tag.'],
  [63.25, 65.3, 'Verloren wäre dein Geld trotzdem nicht.'], [65.36, 68.38, 'Bis 100.000 Euro pro Bank sind gesetzlich geschützt'], [68.4, 71.5, 'und müssen innerhalb von 7 Arbeitstagen ausgezahlt werden.'],
  [71.73, 72.85, 'Das Verrückte ist:'], [72.88, 76.05, 'Eine gesunde Bank kann allein durch Panik pleitegehen.'], [76.23, 79.15, 'Deshalb trat Angela Merkel 2008 vor die Kameras'],
  [79.2, 82.35, 'und sagte den Sparern: „Ihre Einlagen sind sicher.“'], [82.54, 84.2, 'Würdest du dein Geld abheben?'], [84.24, 85.62, 'Schreib’s in die Kommentare.']];
const NUMS = [[3.2, 5.45, 'unter 1 €', 'von 100 € auf dem Konto liegt als Bargeld bei der Bank'], [10.85, 12.9, '4.000 Mrd. €', 'auf deutschen Konten'],
  [16.25, 17.62, '20 Mrd. €', 'Bargeld bei allen Banken zusammen'], [31.65, 34.3, '42 Mrd. $', 'an einem Tag abgezogen (Silicon Valley Bank, 2023)'],
  [43.4, 44.9, '60 €', 'pro Tag am Automaten (Griechenland 2015)'], [65.55, 68.38, '100.000 €', 'pro Person und Bank gesetzlich geschützt']];
const TITLES = [[0.0, 3.2, 'Was wäre, wenn alle<br>gleichzeitig ihr Geld<br>abheben?'], [5.45, 9.5, 'Alle wollen<br>gleichzeitig abheben'], [12.92, 16.25, 'Und wie viel<br>als Bargeld?'],
  [17.64, 22.3, 'Der Rest ist<br>verliehen'], [22.38, 25.55, 'Die Automaten<br>werden leer'], [25.6, 31.65, 'Silicon Valley<br>Bank, 2023'], [34.46, 36.55, 'Bank<br>geschlossen'],
  [36.63, 38.24, 'Der Staat<br>greift ein'], [38.24, 43.4, 'Griechenland 2015:<br>3 Wochen zu'],
  [63.25, 65.55, 'Ist dein Geld<br>verloren?'], [68.4, 71.55, 'Auszahlung in<br>7 Arbeitstagen'], [71.73, 76.2, 'Panik allein<br>reicht'], [76.23, 82.45, '2008: „Ihre Einlagen<br>sind sicher“'],
  [82.54, 85.62, 'Würdest du dein<br>Geld abheben?']];
const SRC = 'Quellen: Deutsche Bundesbank, Einlagensicherungsgesetz, kalifornische Finanzaufsicht\nStand 20.11.2026 · Modell vereinfacht';
const subwEl = document.getElementById('subw'), titleEl = document.getElementById('title'), numEl = document.getElementById('num'), subEl = document.getElementById('sub'), srcEl = document.getElementById('src'), logoEl = document.getElementById('logo'), fadeEl = document.getElementById('fade'), shadeEl = document.getElementById('shade');
srcEl.innerHTML = SRC.replace('\n', '<br>');
const OUT0 = 85.62;
function overlay(t) {
  const s = SUBS.find(q => t >= q[0] && t < q[1]); subEl.textContent = s ? s[2] : ''; subEl.style.opacity = s ? Math.min(1, (t - s[0]) / 0.18 + 0.15) : 0; subEl.style.transform = s ? `translateY(${(1 - eo((t - s[0]) / 0.3)) * 8}px)` : 'none'; subwEl.style.opacity = s ? 1 : clamp(1 - (t - OUT0) / 0.3, 0, 1);
  const nm = NUMS.find(q => t >= q[0] && t < q[1]); let nop = 0;
  if (nm) {numEl.innerHTML = nm[2] + '<small>' + nm[3] + '</small>'; nop = Math.min(clamp((t - nm[0]) / 0.2, 0, 1), clamp((nm[1] - t) / 0.2, 0, 1)); const pi = eo((t - nm[0]) / 0.45); numEl.style.transform = `translateY(${(1 - pi) * 20}px) scale(${1 + 0.05 * (1 - pi)})`; numEl.style.transformOrigin = '0 0';}
  numEl.style.opacity = nop; numEl.style.filter = `blur(${(1 - Math.min(1, nm ? (t - nm[0]) / 0.3 : 1)) * 6}px)`;
  const tt = TITLES.find(q => t >= q[0] && t < q[1]);
  if (tt) {titleEl.innerHTML = tt[2]; const ti = t < 0.05 ? 1 : eo((t - tt[0]) / 0.4), to = clamp((tt[1] - t) / 0.25, 0, 1); titleEl.style.opacity = Math.min(ti, to) * (1 - nop); titleEl.style.transform = `translateY(${(1 - ti) * 18 - (1 - to) * 8}px)`; titleEl.style.filter = `blur(${(1 - ti) * 5}px)`;}
  else titleEl.style.opacity = 0;
  srcEl.style.opacity = 0.95 * clamp((OUT0 + 0.1 - t) / 0.3, 0, 1); logoEl.style.opacity = 1 - eo((t - OUT0) / 0.35);
  shadeEl.style.opacity = (1 - 0.75 * eio((t - OUT0) / 0.8)).toFixed(3);
}

// ------------------------------------------------------------------ per-frame state
const bank = T.bank;
bank.shell.forEach(m => {m.userData.decal = !!m.transparent;});
function setBankGlass(op) {
  for (const m of bank.shell) {m.opacity = m.userData.decal ? clamp((op - 0.5) / 0.5, 0, 1) : op; if (m.userData.decal) continue; const tr = op < 0.995; if (m.transparent !== tr) {m.transparent = tr; m.depthWrite = !tr; m.needsUpdate = true;}}
  bank.IN.visible = op < 0.995;
}
let lastGlass = -1;
function setTime(t) {
  setCam(t);
  const n = night(t);
  // sun, sky, lamps
  sun.intensity = (S === 1 ? 1.75 : 1.6) * (1 - 0.9 * n); sun.color.copy(C_SUN_DAY).lerp(C_SUN_DUSK, clamp(n * 1.6, 0, 1));
  hemi.intensity = (S === 2 ? 1.05 : 0.48) * (1 - 0.72 * n); moon.intensity = 0.45 * n; scene.environmentIntensity = (S === 1 ? 0.5 : 0.35) * (1 - 0.7 * n);
  scene.background.copy(SKY_DAY).lerp(SKY_NIGHT, n); if (scene.fog) scene.fog.color.copy(scene.background);
  sun.position.set(CAMT.x - 3.6, 6.2, CAMT.z + 3.4); sun.target.position.set(CAMT.x, 0, CAMT.z); sun.target.updateMatrixWorld();
  const lampOn = clamp((t - 64.4) / 0.6, 0, 1) * clamp(n / 0.4, 0, 1);
  T.lamps.forEach((l, i) => {const on = clamp((t - 64.4 - i * 0.12) / 0.3, 0, 1) * clamp(n / 0.4, 0, 1); l.head.emissiveIntensity = 0.2 + 3.2 * on; l.pool.opacity = 0.5 * on;});
  T.glow.forEach(hs => {const on = clamp((t - 64.6 - hs.order * 0.28) / 0.25, 0, 1); hs.mats.forEach(m => m.emissiveIntensity = 1.25 * on * clamp(n / 0.5, 0.3, 1));});
  cars.forEach(c => {c.hl.emissiveIntensity = 0.3 + 3.0 * lampOn; c.tl.emissiveIntensity = 0.1 + 1.5 * lampOn;});
  // focus light follows the camera target, stronger in the evening
  focus.position.set(CAMT.x + 0.6, CAMT.y + 2.4, CAMT.z + 1.6); focus.target.position.copy(CAMT); focus.target.updateMatrixWorld(); focus.intensity = (S === 1 ? 0.9 : 1.2) + 8 * n;
  focus.distance = 8; focus.angle = 0.5;
  // bank: glass walls for the vault, lights, shutter, screens
  const glass = 1 - 0.94 * eio((t - 13.0) / 0.7) * (1 - eio((t - 17.75) / 0.6)); if (Math.abs(glass - lastGlass) > 1e-4) {setBankGlass(glass); lastGlass = glass;}
  vaultSpot.intensity = 5 * win(t, 13.1, 17.9, 0.5);
  const lit = bankLit(t); bank.inLight.intensity = 1.4 * lit * (0.4 + n); bank.doorM.emissiveIntensity = 0.25 + 1.4 * lit * (0.3 + n); bank.strip.emissiveIntensity = 0.2 + 1.6 * lit;
  bank.win.forEach(m => m.emissiveIntensity = lit * (0.15 + 1.3 * n));
  bank.shutterG.scale.y = Math.max(0.001, shutterDown(t));
  bank.atms.forEach((a, i) => {const st = atmState(i, t); a.set(st); a.glow.intensity = st === 'leer' && i === 2 ? (0.25 + 1.3 * n) * (1 - 0.7 * eio((t - 85.6) / 1.0)) : 0;
    const flick = (i === 2 && t > 24.9 && t < 25.1) || (i === 1 && t > 25.2 && t < 25.36) || (i === 0 && t > 25.5 && t < 25.66) || (i === 0 && t > 43.33 && t < 43.45) ? (Math.floor(t * 40) % 2 ? 0.35 : 1) : 1; a.scrM.color.setScalar(flick);});
  // objects
  poseBundles(t);
  {const gv = win(t, 19.3, 23.4, 0.5); ghostM.opacity = 0.8 * gv; ghostFill.opacity = 0.1 * gv; ghostRim.uniforms.k.value = 0.9 * gv; ghost.visible = gv > 0.003;}
  poseBarrier(t); poseCover(t); poseSlip(t);
  // cars and the idle sway of the figures run on video time, so nothing jumps at the cut
  cars.forEach(c => {const [x, z, dx, dz] = carPose(c, nt(t)); c.G.position.set(x, 0.004, z); c.G.rotation.y = Math.atan2(-dz, dx);});
  poseAll(people, t, nt(t));
  // grading: tilt-shift saturation
  CANVAS.style.filter = S === 1 ? 'saturate(1.22) contrast(1.04)' : 'none';
  {const sz = Math.exp(camAt(t)[3]); tilt.forEach((p, i) => {const ou = eio((t - 85.6) / 1.2); p.uniforms.r.value = 0.5; p.uniforms.band.value = 0.07 + 0.2 * win(t, 10.4, 13.2, 0.5) + 0.16 * ou; p.uniforms.amt.value = 3.0 * clamp(0.45 + sz / 3.2, 0.5, 1) * (i < 2 ? 1 : 0.8) * (1 - 0.45 * win(t, 10.4, 13.2, 0.5));});}
  overlay(t);
}

// ------------------------------------------------------------------ render hooks
window.TOTAL = Math.round((END_N + VO) * 30);
function drawAt(tv) {setTime(ot(tv)); composer.render();   // tv: video time minus VO (after the cut)
  const fv = tv + VO; const fd = Math.min(clamp(fv / 0.25, 0, 1), clamp((END_N - tv) / 0.3, 0, 1)); fadeEl.style.opacity = (1 - fd).toFixed(3);}
window.renderFrame = f => drawAt(f / 30 - VO);
window.setT = tv => drawAt(tv);

// ------------------------------------------------------------------ self check: people, bundles (run in the browser: await CHECK())
const FOOT = Object.entries(BLD).map(([k, o]) => [k, o.x0, o.x1, o.z0, o.z1, o.h + 0.4]).concat([['BANK', L.bank.x0, L.bank.x1, L.bank.z0, L.bank.z1, 1.0], ['FAB', FACTORY.x0, FACTORY.x1, FACTORY.z0, FACTORY.z1, 0.9],
  ['STEPS', -0.75, 0.15, 0.42, 0.49, 0.05]].concat(L.atmX.map((x, i) => ['ATM' + i, x - 0.065, x + 0.065, 0.42, 0.47, 0.4])));
window.CHECK = (step = 1 / 30) => {
  const bad = []; let minPP = 9, minPPt = 0;
  for (let tn = 0; tn <= END_N; tn += step) {const t = ot(tn);
    const st = agents.map(a => a.state(t));
    for (let i = 0; i < st.length; i++) {const a = st[i]; if (!a || a.scale < 0.999) continue;
      for (let j = i + 1; j < st.length; j++) {const b = st[j]; if (!b || b.scale < 0.999) continue; const d = Math.hypot(a.x - b.x, a.z - b.z); if (d < minPP) {minPP = d; minPPt = t;} if (d < 2 * R_P) bad.push(['pp', +t.toFixed(2), i, j, +d.toFixed(3)]);}
      for (const [k, x0, x1, z0, z1] of FOOT) if (a.x > x0 - R_P && a.x < x1 + R_P && a.z > z0 - R_P && a.z < z1 + R_P) bad.push(['pb', +t.toFixed(2), i, k]);
      if (t > 38.3 && t < 64.3 && Math.hypot(a.x + 0.765, a.z - 0.565) < R_P + 0.02) bad.push(['barrier', +t.toFixed(2), i]);
      if (t > 64.3 && t < 72.6 && a.x > -0.86 - R_P && a.x < 0.86 + R_P && a.z > coverZ0 - R_P && a.z < coverZ1 + R_P) bad.push(['cover', +t.toFixed(2), i]);
      for (const [x, z, r] of T.trees) if (Math.hypot(a.x - x, a.z - z) < r * 0.3 + R_P) bad.push(['tree', +t.toFixed(2), i]);
      for (const [x, z] of T.lampPos) if (Math.hypot(a.x - x, a.z - z) < 0.01 + R_P) bad.push(['lamp', +t.toFixed(2), i]);
    }
    // bundles
    poseBundles(t); const vis = bundles.filter(b => b.G.visible && flightOf.get(b.j) && t >= flightOf.get(b.j).t0);
    for (const b of vis) {const p = b.G.position, f = flightOf.get(b.j); const nearEnd = (t - f.t0) / f.dur > 0.78; if (nearEnd) continue;
      for (const [k, x0, x1, z0, z1, h] of FOOT) if (p.x > x0 - 0.1 && p.x < x1 + 0.1 && p.z > z0 - 0.08 && p.z < z1 + 0.08 && p.y < h) bad.push(['bb', +t.toFixed(2), b.j, k]);
      for (const c of vis) if (c !== b && c.j < b.j && b.G.position.distanceTo(c.G.position) < 0.13) bad.push(['b2', +t.toFixed(2), b.j, c.j]);}
  }
  return {minPP: +minPP.toFixed(3), minPPt: +minPPt.toFixed(2), n: bad.length, bad: bad.slice(0, 60)};
};
window.atmPx = tv => {setCam(ot(tv)); let best = 0; const v = new THREE.Vector3();
  for (const x of L.atmX) {let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, ok = false;
    for (const dx of [-0.07, 0.07]) for (const y of [0.05, 0.49]) for (const z of [0.42, 0.51]) {v.set(x + dx, y, z).applyMatrix4(cam.matrixWorldInverse); if (v.z > -0.01) continue; ok = true;
      v.set(x + dx, y, z).project(cam); const px = (v.x + 1) / 2 * W, py = (1 - v.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);}
    if (!ok || x1 < 0 || x0 > W || y1 < 0 || y0 > H) continue; best = Math.max(best, y1 - y0);}
  return best;};
// like atmPx, but only counts a machine when a sample point on it is not hidden behind something opaque (bank, houses, cars)
const _rc = new THREE.Raycaster();
window.atmSeen = tv => {setTime(ot(tv)); const px = window.atmPx(tv); if (px < 6) return 0; scene.updateMatrixWorld(true);
  const occ = []; scene.traverse(o => {if (o.isMesh && o.visible && o.material && !Array.isArray(o.material) && !(o.material.transparent && o.material.opacity < 0.6) && !o.material.isShaderMaterial) occ.push(o);
    else if (o.isMesh && o.visible && Array.isArray(o.material)) occ.push(o);});
  const atmSet = new Set(); T.bank.atms.forEach(a => a.A.traverse(o => atmSet.add(o)));
  const cp = cam.getWorldPosition(new THREE.Vector3()); const v = new THREE.Vector3();
  for (const x of L.atmX) for (const [y, z] of [[0.302, 0.477], [0.36, 0.477], [0.2, 0.477], [0.478, 0.512], [0.1, 0.477]]) {
    v.set(x, y, z); const q = v.clone().project(cam); if (q.x < -1 || q.x > 1 || q.y < -1 || q.y > 1 || q.z > 1) continue;
    const dir = v.clone().sub(cp); const dist = dir.length(); dir.normalize();
    if (cam.isOrthographicCamera) {const o = v.clone().addScaledVector(cam.getWorldDirection(new THREE.Vector3()), -30); _rc.set(o, cam.getWorldDirection(new THREE.Vector3()));}
    else _rc.set(cp, dir);
    const hits = _rc.intersectObjects(occ, false); const target = cam.isOrthographicCamera ? 30 : dist;
    const first = hits.find(h => !atmSet.has(h.object)); if (!first || first.distance > target - 0.03) return px;}
  return 0;};
window.DBGO = {THREE, scene, cam, T, agents, people, bundles, flights, cars, cover, slip, barrier};
drawAt(0); window.ready = true;
