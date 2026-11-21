// „Diese 5 Gesetze haben Deutschland richtig wütend gemacht“ – Podest-Fassung (Stil 5 Violett, vom Nutzer gewählt am 21.11.2026).
// Fünf abgerundete Pastell-Podeste als Treppe von Platz 5 bis Platz 1. Jeder Platz hat eine eigene Animation mit Kamerazoom:
// 5 Soldat salutiert, Schüler streiken im Kreis · 4 Traktor springt an und qualmt, die Steuerhilfe fliegt weg und kommt halb zurück,
// eine Traktorkolonne rollt vorbei · 3 Heizkörper heizt, die Ampel hat es eilig, das rote § stoppt alles · 2 Treppe, Absperrgitter,
// die Menge stürmt die Stufen · 1 Stempel auf dem Hartz-IV-Antrag, der Platz füllt sich mit Menschen. Am Ende ein Fragezeichen-Podest.
// Outro (21.11.2026 neu, Wunsch des Nutzers „einfach eine 2D-Animation“): dunkelvioletter 2D-Abspann, das rote § ploppt auf und fliegt als Punkt hinter „function“.
// Rot ist nur das Paragrafenzeichen (roter Faden) und das Logo. Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 2);
// im Video beginnt die Stimme bei 0,15 s.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {TTFLoader} from 'three/addons/loaders/TTFLoader.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';

await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '800 96px "Inter Tight"'].map(f => document.fonts.load(f)));
const ttf = async u => new FontLoader().parse(new TTFLoader().parse(await (await fetch(u)).arrayBuffer()));
const FONT = await ttf('node_modules/@fontsource/inter-tight/files/inter-tight-latin-800-normal.woff');
const LOGOF = await ttf('node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff');

const W = 1080, H = 1920, VO = 0.15, RED = 0xE01E2B, OUT0 = 54.6, END_V = 58.4;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = u => u * u * (3 - 2 * u), smr = u => u * u * u * (u * (u * 6 - 15) + 10);
const eo = u => 1 - Math.pow(1 - u, 3), ei = u => u * u * u, eio = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const back = u => {if (u <= 0) return 0; if (u >= 1) return 1; const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);};
const pop = (t, a, d = 0.35) => back(seg(t, a, a + d));
const hash = n => {const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};

// ---------------- renderer, scene, light ----------------
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, alpha: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)];   // things that sink in the outro vanish below the floor
const scene = new THREE.Scene(); scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
const sun = new THREE.DirectionalLight(0xfff6ee, 1.7); sun.position.set(-3, 6.5, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 10;
Object.assign(sun.shadow.camera, {left: -4, right: 4, top: 4, bottom: -4}); sun.shadow.bias = -0.0005; scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffffff, 0x6a56e0, 0.75));
{const f = new THREE.DirectionalLight(0xe8e0ff, 0.7); f.position.set(4, 2.5, 3); scene.add(f);}
const rng = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(5);
const tex = (w, h, draw) => {const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;};
const css = c => '#' + new THREE.Color(c).getHexString();
const M = (c, o = {}) => new THREE.MeshPhysicalMaterial({color: c, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, ...o});
const add = (par, geo, m, x = 0, y = 0, z = 0) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; par.add(o); return o;};
const rb = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
const grp = (par, x = 0, y = 0, z = 0) => {const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); return g;};
{const sh = add(scene, new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({color: 0x24166e, opacity: 0.42}), 0, 0.002, 0); sh.castShadow = false;}
const AZ0 = -16 * Math.PI / 180;

function textGeo(font, s, size, depth, bevel = true) {
  const g = new TextGeometry(s, {font, size, depth, curveSegments: 10, bevelEnabled: bevel, bevelThickness: depth * 0.25, bevelSize: size * 0.022, bevelSegments: 2});
  g.computeBoundingBox(); return g;}
function centered(g, cx = true) {const b = g.boundingBox; g.translate(cx ? -(b.min.x + b.max.x) / 2 : 0, -b.min.y, -(b.min.z + b.max.z) / 2); g.computeBoundingBox(); return g;}
const paraMat = new THREE.MeshPhysicalMaterial({color: RED, emissive: 0xff1626, emissiveIntensity: 0.06, roughness: 0.3, clearcoat: 0.8});

// ---------------- podiums ----------------
const PW = 0.76, NAVY = 0x2a2350;
const PX = i => -1.5 + i * 0.75, PZ = i => 0.62 - i * 0.31, PH = i => 0.5 + i * 0.2;
const PCOL = [0x6fe3c4, 0x6cc0ff, 0xffd45e, 0xc9b8ff, 0xffffff];
const LAB = ['WEHRDIENST', 'AGRARDIESEL', 'HEIZUNGSGESETZ', 'CORONA-REGELN', 'HARTZ IV'];
function podium(x, z, h, col, num, label) {
  const G = grp(scene, x, 0, z); const B = grp(G);   // B is the part that sinks in the outro
  add(B, new RoundedBoxGeometry(PW, h, PW, 6, 0.11), M(col), 0, h / 2, 0);
  const ng = centered(textGeo(FONT, num, 0.23, 0.03)), nh = ng.boundingBox.max.y;
  const pillH = 0.098, gap = 0.035, blk = nh + gap + pillH, top = h / 2 + blk / 2;   // number and name sit in the middle of the front
  add(B, ng, M(NAVY), 0, top - nh, PW / 2 - 0.004);
  const pt = tex(512, 96, (g, w, hh) => {g.fillStyle = css(NAVY); g.fillRect(0, 0, w, hh); g.fillStyle = '#fff'; g.font = `600 ${label.length > 12 ? 40 : 46}px Poppins`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, hh / 2 + 3);});
  const pm = M(NAVY); add(B, new RoundedBoxGeometry(0.52, pillH, 0.016, 4, 0.044), [pm, pm, pm, pm, M(0xffffff, {map: pt, clearcoat: 0.3}), pm], 0, h / 2 - blk / 2 + pillH / 2, PW / 2 + 0.002);
  return {G, B, h, x, z};}
const POD = [0, 1, 2, 3, 4].map(i => podium(PX(i), PZ(i), PH(i), PCOL[i], String(5 - i), LAB[i]));
const PQ = podium(-2.25, 0.93, 0.42, 0xffffff, '?', 'DEIN TIPP?'); PQ.G.scale.setScalar(0.0001);

// ---------------- people ----------------
const SKIN = [0xf3c9a5, 0xe0b088, 0xc98f6a, 0xf6d2b4, 0xd9a27a], HAIR = [0x5a3a2a, 0x2b2b33, 0xe0b060, 0x8a5a3a, 0x1b1b20];
const PEOPLE = [0x5b8ef0, 0xf5c451, 0x58b48c, 0xa47ce0, 0xffffff, 0x3e3f5a, 0xef8fb5, 0xf08a6c, 0x6fd0e0];
const SIGNC = ['#ffffff', '#fff3b8', '#d8ecff', '#dcf5e6', '#efe6ff'];
const signTexCache = {};
function signMat(text, bg) {
  const key = text + bg; if (signTexCache[key]) return signTexCache[key];
  const t = tex(240, 160, (g, w, h) => {g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2350'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const words = text.split(' '); if (words.length > 1) {g.font = '800 44px "Inter Tight"'; g.fillText(words[0], w / 2, h * 0.34); g.fillText(words.slice(1).join(' '), w / 2, h * 0.7);}
    else {g.font = `800 ${text.length > 9 ? 36 : 58}px "Inter Tight"`; g.fillText(text, w / 2, h / 2 + 3);}});
  return (signTexCache[key] = M(0xffffff, {map: t, clearcoat: 0.2}));}
const camoTex = tex(256, 256, (g, w, h) => {g.fillStyle = '#7d8656'; g.fillRect(0, 0, w, h); for (const [c, n, r] of [['#4f5a33', 90, 9], ['#6b5a3a', 70, 8], ['#2a2a22', 80, 5], ['#9aa06a', 40, 7]])
  {g.fillStyle = c; for (let i = 0; i < n; i++) {const x0 = rng() * w, y0 = rng() * h; g.beginPath(); for (let k = 0; k < 3; k++) g.arc(x0 + (rng() - 0.5) * r * 1.6, y0 + (rng() - 0.5) * r * 1.6, r * (0.5 + rng() * 0.6), 0, 7); g.fill();}}});
camoTex.wrapS = camoTex.wrapT = THREE.RepeatWrapping;
function person(par, o = {}) {
  const k = o.k || 1, G = grp(par), sg = 12, i = o.i || 0;
  const bm = o.bodyMat || M(o.body ?? PEOPLE[i % PEOPLE.length], {roughness: 0.5, clearcoat: 0.5}), lm = o.legMat || M(o.legs ?? 0x3e3f5a, {roughness: 0.6, clearcoat: 0.3});
  const skin = M(SKIN[i % SKIN.length], {roughness: 0.6, clearcoat: 0.2});
  const legs = [], arms = [];
  for (const sx of [-1, 1]) {const P = grp(G, sx * 0.013 * k, 0.07 * k, 0); add(P, new THREE.CylinderGeometry(0.012 * k, 0.012 * k, 0.07 * k, sg), lm, 0, -0.035 * k, 0);
    if (o.boots) add(P, rb(0.03 * k, 0.016 * k, 0.04 * k, 0.006 * k), M(0x1d1d22, {roughness: 0.5}), 0, -0.062 * k, 0.005 * k); legs.push(P);}
  const body = grp(G); add(body, new THREE.CapsuleGeometry(0.029 * k, 0.05 * k, 4, sg), bm, 0, 0.113 * k, 0);
  add(body, new THREE.SphereGeometry(0.023 * k, sg, sg), skin, 0, 0.187 * k, 0);
  if (o.helmet) {const hm = M(0xffffff, {map: camoTex, roughness: 0.8, clearcoat: 0.05});
    const s = add(body, new THREE.SphereGeometry(0.027 * k, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm, 0, 0.19 * k, 0); s.scale.set(1, 0.9, 1.12);
    const r = add(body, new THREE.TorusGeometry(0.027 * k, 0.0025 * k, 6, 28).rotateX(Math.PI / 2), M(0x5a6238, {roughness: 0.8, clearcoat: 0.05}), 0, 0.191 * k, 0); r.scale.set(1.05, 1, 1.18);}
  else {const hr = add(body, new THREE.SphereGeometry(0.0245 * k, sg, sg, 0, Math.PI * 2, 0, Math.PI * 0.5), M(HAIR[i % HAIR.length], {roughness: 0.7, clearcoat: 0.2}), 0, 0.19 * k, -0.003 * k); hr.rotation.x = -0.35;}
  if (o.pack) add(body, rb(0.042 * k, 0.052 * k, 0.026 * k, 0.008 * k), M(o.pack), 0, 0.12 * k, -0.038 * k);
  for (const sx of [-1, 1]) {const P = grp(body, sx * 0.034 * k, 0.15 * k, 0); add(P, new THREE.CapsuleGeometry(0.009 * k, 0.045 * k, 3, 8), o.armMat || bm, 0, -0.03 * k, 0); P.rotation.z = sx * 0.15; arms.push(P);}
  let sign = null;
  if (o.sign) {sign = grp(body, 0.069 * k, 0, 0); arms[1].rotation.z = 2.6;
    add(sign, new THREE.CylinderGeometry(0.004 * k, 0.004 * k, 0.24 * k, 6), M(0xd9a86c, {roughness: 0.6}), 0, 0.25 * k, 0);
    const e = M(0xf0f0f0); add(sign, new THREE.BoxGeometry(0.15 * k, 0.1 * k, 0.008 * k), [e, e, e, e, signMat(o.sign, SIGNC[i % SIGNC.length]), signMat(o.sign, SIGNC[i % SIGNC.length])], 0, 0.33 * k, 0.012 * k);}
  return {G, body, legs, arms, sign, k};}
function walk(p, ph, amp = 0.5) {p.legs[0].rotation.x = amp * Math.sin(ph); p.legs[1].rotation.x = -amp * Math.sin(ph); p.body.position.y = Math.abs(Math.sin(ph)) * 0.006 * p.k;}
function still(p) {p.legs[0].rotation.x = 0; p.legs[1].rotation.x = 0; p.body.position.y = 0;}

// ---------------- objects on the podiums ----------------
// 5: soldier with Flecktarn uniform and helmet (salutes at „Wehrdienst“)
const camoM = M(0xffffff, {map: camoTex, roughness: 0.8, clearcoat: 0.05});
const SOLD = person(POD[0].B, {k: 2.35, bodyMat: camoM, legMat: camoM, armMat: camoM, boots: true, helmet: true, i: 0});
SOLD.G.position.set(0, POD[0].h, 0.02); SOLD.G.rotation.y = -0.22;
// 4: tractor (engine starts, smoke from the exhaust)
function tractor(par, col, s = 1) {
  const G = grp(par); G.scale.setScalar(s); const B = grp(G);
  const c = M(col, {roughness: 0.4}), dark = M(0x222228, {roughness: 0.5}), tyre = M(0x1d1d22, {roughness: 0.9, clearcoat: 0}), hub = M(0xf5c451);
  add(B, rb(0.3, 0.035, 0.08, 0.01), dark, 0.02, 0.07, 0);
  add(B, rb(0.19, 0.085, 0.1, 0.022), c, 0.07, 0.11, 0);
  add(B, rb(0.006, 0.06, 0.07, 0.002), dark, 0.166, 0.105, 0);
  add(B, new THREE.BoxGeometry(0.12, 0.12, 0.12), new THREE.MeshPhysicalMaterial({color: 0xbfe6ff, transparent: true, opacity: 0.5, roughness: 0.1, clearcoat: 1, depthWrite: false}), -0.07, 0.19, 0).castShadow = false;
  for (const [px, pz] of [[-0.127, -0.057], [-0.127, 0.057], [-0.013, -0.057], [-0.013, 0.057]]) add(B, new THREE.BoxGeometry(0.008, 0.13, 0.008), c, px, 0.19, pz);
  add(B, rb(0.15, 0.016, 0.14, 0.006), c, -0.07, 0.262, 0);
  for (const sz of [-1, 1]) {add(G, new THREE.CylinderGeometry(0.07, 0.07, 0.045, 24).rotateX(Math.PI / 2), tyre, -0.07, 0.07, sz * 0.078);
    add(G, new THREE.CylinderGeometry(0.036, 0.036, 0.048, 16).rotateX(Math.PI / 2), hub, -0.07, 0.07, sz * 0.079);
    add(B, rb(0.15, 0.014, 0.055, 0.005), c, -0.07, 0.148, sz * 0.078);
    add(G, new THREE.CylinderGeometry(0.042, 0.042, 0.03, 18).rotateX(Math.PI / 2), tyre, 0.11, 0.042, sz * 0.058);
    add(G, new THREE.CylinderGeometry(0.02, 0.02, 0.032, 12).rotateX(Math.PI / 2), hub, 0.11, 0.042, sz * 0.059);}
  add(B, new THREE.CylinderGeometry(0.006, 0.006, 0.1, 8), dark, 0.11, 0.2, 0.03);
  return {G, B, pipe: new THREE.Vector3(0.11, 0.255, 0.03)};}
const TRAC = tractor(POD[1].B, 0x46b04a, 1.65); TRAC.G.position.y = POD[1].h; TRAC.G.rotation.y = -0.55;
// smoke puffs (a fixed pool, positions are a pure function of time)
const SMOKE = []; {const sm0 = new THREE.SphereGeometry(1, 16, 12); for (let j = 0; j < 14; j++) {const m = new THREE.Mesh(sm0, new THREE.MeshStandardMaterial({color: 0xeeeaf6, roughness: 1, transparent: true, opacity: 0, depthWrite: false})); m.visible = false; scene.add(m); SMOKE.push(m);}}
// the tax relief as a gold euro coin
const COIN = grp(POD[1].B, -0.34, POD[1].h + 0.58, 0.12); COIN.scale.setScalar(0.0001);
{const gm = new THREE.MeshPhysicalMaterial({color: 0xffcf5a, metalness: 0.75, roughness: 0.32, emissive: 0x6a4a10, emissiveIntensity: 0.35}); add(COIN, new THREE.CylinderGeometry(0.1, 0.1, 0.022, 40).rotateX(Math.PI / 2), gm);
  const et = tex(128, 128, (g, w, h) => {g.fillStyle = '#ffd36a'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a6a10'; g.font = '800 92px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('€', w / 2, h / 2 + 6);});
  add(COIN, new THREE.CircleGeometry(0.082, 40), new THREE.MeshPhysicalMaterial({map: et, metalness: 0.6, roughness: 0.35, emissive: 0xffffff, emissiveMap: et, emissiveIntensity: 0.25}), 0, 0, 0.0115); COIN.rotation.y = -0.3;}
// 3: radiator with thermostat, heat waves, the traffic light („Ampel“)
const RAD = grp(POD[2].B, 0, POD[2].h, -0.06); RAD.rotation.y = 0.32; RAD.scale.setScalar(1.15);
let DIAL;
{const wm = M(0xf1f1ee, {roughness: 0.35});
  for (let i = 0; i < 9; i++) add(RAD, rb(0.042, 0.3, 0.09, 0.016), wm, -0.2 + i * 0.05, 0.2, 0);
  for (const y of [0.07, 0.33]) add(RAD, new THREE.CylinderGeometry(0.016, 0.016, 0.46, 14).rotateZ(Math.PI / 2), wm, 0, y, 0);
  for (const sx of [-1, 1]) add(RAD, rb(0.03, 0.06, 0.08, 0.008), wm, sx * 0.17, 0.03, 0);
  add(RAD, new THREE.CylinderGeometry(0.034, 0.034, 0.07, 24).rotateZ(Math.PI / 2), wm, 0.28, 0.33, 0);
  DIAL = grp(RAD, 0.316, 0.33, 0);
  const dial = tex(128, 128, (g, w, h) => {g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3a44'; g.font = '800 30px "Inter Tight"'; g.textAlign = 'center'; for (const [t, a] of [['1', -1.2], ['3', 0], ['5', 1.2]]) g.fillText(t, w / 2 + 40 * Math.sin(a), h / 2 - 40 * Math.cos(a) + 10);
    g.fillStyle = '#2a2350'; g.fillRect(w / 2 - 3, h / 2 - 2, 6, 30);});
  const dm = add(DIAL, new THREE.CircleGeometry(0.033, 24), M(0xffffff, {map: dial}), 0, 0, 0); dm.rotation.y = Math.PI / 2;
  add(RAD, new THREE.CylinderGeometry(0.012, 0.012, 0.08, 10), M(0xb8b8bc, {metalness: 0.8, roughness: 0.3}), 0.28, 0.03, 0);}
const HEAT = []; for (let i = 0; i < 4; i++) {const pts = []; for (let k = 0; k <= 16; k++) pts.push(new THREE.Vector3(0.018 * Math.sin(k / 16 * Math.PI * 3 + i), k / 16 * 0.2, 0));
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.006, 6), new THREE.MeshBasicMaterial({color: 0xffb04a, transparent: true, opacity: 0, depthWrite: false}));
  m.position.set(-0.15 + i * 0.1, 0.36, 0); RAD.add(m); HEAT.push(m);}
const AMP = grp(POD[2].B, -0.25, POD[2].h, 0.25); AMP.scale.setScalar(0.0001); const LAMPS = [];
{add(AMP, new THREE.CylinderGeometry(0.008, 0.01, 0.2, 10), M(0x3a3a44), 0, 0.1, 0); add(AMP, rb(0.07, 0.17, 0.05, 0.012), M(0x2b2b33, {roughness: 0.5}), 0, 0.27, 0);
  [[0x4a2028, 0x000000], [0x7a6420, 0xffc83a], [0x1f5a3a, 0x3ee08a]].forEach(([c, e], k) => {const m = add(AMP, new THREE.SphereGeometry(0.019, 16, 12), new THREE.MeshPhysicalMaterial({color: c, emissive: e, emissiveIntensity: 0, roughness: 0.2, clearcoat: 1}), 0, 0.322 - k * 0.051, 0.022); LAMPS.push(m);});}
// 2: face mask on an acrylic stand
const MASK = grp(POD[3].B, 0, POD[3].h + 0.024 + 0.115 * Math.sin(1.15), 0.04); MASK.rotation.set(1.15, -0.25, 0); MASK.scale.setScalar(1.15); let MASKP;
{const mt = tex(256, 128, (g, w, hh) => {g.fillStyle = '#9fcbe6'; g.fillRect(0, 0, w, hh); for (const y of [0.3, 0.5, 0.7]) {g.fillStyle = 'rgba(40,80,110,0.28)'; g.fillRect(0, y * hh - 3, w, 6); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, y * hh + 3, w, 4);}
    g.fillStyle = '#d9e9f2'; g.fillRect(0, 0, w, 10); g.fillRect(0, hh - 10, w, 10); g.fillRect(0, 0, 10, hh); g.fillRect(w - 10, 0, 10, hh);});
  const mg = new THREE.PlaneGeometry(0.34, 0.2, 24, 1); const pa = mg.attributes.position; for (let i = 0; i < pa.count; i++) {const u = pa.getX(i) / 0.17; pa.setZ(i, 0.05 * (1 - u * u));} mg.computeVertexNormals(); mg.rotateX(-Math.PI / 2);
  MASKP = add(MASK, mg, M(0xffffff, {map: mt, roughness: 0.9, clearcoat: 0, side: THREE.DoubleSide}));
  add(MASK, new THREE.BoxGeometry(0.1, 0.004, 0.006), M(0xdfe4e8, {metalness: 0.5}), 0, 0.0, -0.098);
  for (const sx of [-1, 1]) {const l = add(MASK, new THREE.TorusGeometry(0.07, 0.0045, 6, 28), M(0xf4f4f0), sx * 0.215, -0.004, 0); l.rotation.x = Math.PI / 2; l.scale.set(0.7, 1, 1);}
  const ac = new THREE.MeshPhysicalMaterial({color: 0xdfe8ff, transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, depthWrite: false});
  const st = add(POD[3].B, new THREE.BoxGeometry(0.3, 0.22, 0.012), ac, 0, POD[3].h + 0.11, -0.06); st.rotation.set(-0.38, -0.25, 0); st.castShadow = false;
  add(POD[3].B, new THREE.BoxGeometry(0.3, 0.012, 0.12), ac, 0, POD[3].h + 0.006, -0.02).rotation.y = -0.25;}
// stairs in front of podium 2 (the steps of the Reichstag) and crowd barriers
const STAIRS = grp(POD[3].B); STAIRS.scale.set(1, 0.0001, 1);
for (let k = 0; k < 4; k++) {const top = 0.2 - k * 0.05, z0 = PW / 2 - 0.01, z1 = PW / 2 + (k + 1) * 0.1; add(STAIRS, rb(0.7, top, z1 - z0, 0.012), M(0xe2d8ff), 0, top / 2, (z0 + z1) / 2);}
const STEP = z => {const d = z - PW / 2; return d < 0 ? 0.2 : d > 0.4 ? 0 : 0.2 - Math.floor(d / 0.1) * 0.05 - 0.05 + 0.05;};   // floor height of the stairs at local z
const BARR = []; for (let k = 0; k < 3; k++) {const B = grp(POD[3].B, -0.24 + k * 0.24, 0, PW / 2 + 0.55); B.scale.setScalar(0.0001); const mm = M(0xc8ccd6, {metalness: 0.6, roughness: 0.35});
  const F = grp(B);
  add(F, new THREE.BoxGeometry(0.21, 0.008, 0.008), mm, 0, 0.11, 0); add(F, new THREE.BoxGeometry(0.21, 0.008, 0.008), mm, 0, 0.03, 0);
  for (let j = 0; j < 7; j++) add(F, new THREE.BoxGeometry(0.004, 0.08, 0.004), mm, -0.09 + j * 0.03, 0.07, 0);
  for (const sx of [-1, 1]) {add(F, new THREE.BoxGeometry(0.008, 0.115, 0.008), mm, sx * 0.105, 0.0575, 0); add(F, new THREE.BoxGeometry(0.012, 0.006, 0.07), mm, sx * 0.105, 0.003, 0);}
  BARR.push({B, F});}
// 1: clipboard with the Hartz IV form, and the stamp
const CLIP = grp(POD[4].B, 0, POD[4].h, 0); CLIP.rotation.y = 0.1; let STAMP, INK, BOARD;
{const form = tex(360, 480, (g, w, hh) => {g.fillStyle = '#f7f6f1'; g.fillRect(0, 0, w, hh); g.fillStyle = '#2b2b33'; g.font = '800 34px "Inter Tight"'; g.fillText('Antrag auf', 26, 62); g.fillText('Arbeitslosengeld II', 26, 100);
    g.font = '500 20px Poppins'; g.fillStyle = 'rgba(40,40,50,0.7)'; g.fillText('Jobcenter', 26, 136);
    g.strokeStyle = 'rgba(40,40,50,0.55)'; g.lineWidth = 2; for (let y = 170; y < hh - 30; y += 38) {g.strokeRect(26, y, 20, 20); g.fillStyle = 'rgba(40,40,50,0.3)'; g.fillRect(60, y + 7, 130 + ((y * 7) % 140), 7);}});
  BOARD = grp(CLIP, 0, 0, -0.05); BOARD.rotation.x = -0.32;
  add(BOARD, rb(0.36, 0.48, 0.016, 0.01), M(0xd9a86c, {roughness: 0.6}), 0, 0.24, 0);
  add(BOARD, new THREE.BoxGeometry(0.31, 0.41, 0.003), [M(0xf7f6f1), M(0xf7f6f1), M(0xf7f6f1), M(0xf7f6f1), M(0xc9c9c6, {map: form, roughness: 0.9, clearcoat: 0}), M(0xf7f6f1)], 0, 0.225, 0.0095);
  add(BOARD, rb(0.14, 0.04, 0.03, 0.008), M(0xb8b8bc, {metalness: 0.85, roughness: 0.3}), 0, 0.455, 0.012);
  const leg = add(CLIP, new THREE.BoxGeometry(0.02, 0.365, 0.012), M(0xb98a54), 0, 0.165, -0.262); leg.rotation.x = 0.44;
  const pen = add(CLIP, new THREE.CylinderGeometry(0.008, 0.008, 0.24, 12).rotateZ(Math.PI / 2), M(0x23232b), 0.05, 0.008, 0.2); pen.rotation.y = 0.5;
  const it = tex(256, 120, (g, w, h) => {g.strokeStyle = '#3550a0'; g.lineWidth = 9; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#3550a0'; g.font = '800 58px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HARTZ IV', w / 2, h / 2 + 4);});
  INK = add(BOARD, new THREE.PlaneGeometry(0.2, 0.094), new THREE.MeshBasicMaterial({map: it, transparent: true, opacity: 0, depthWrite: false, toneMapped: false}), 0.02, 0.16, 0.0115); INK.rotation.z = 0.12; INK.castShadow = false;
  STAMP = grp(BOARD, 0.02, 0.16, 0.3); STAMP.rotation.x = Math.PI / 2; STAMP.scale.setScalar(0.0001);
  add(STAMP, rb(0.2, 0.03, 0.095, 0.01), M(0x2a2350), 0, 0.015, 0); add(STAMP, new THREE.CylinderGeometry(0.02, 0.026, 0.1, 18), M(0xd9a86c, {roughness: 0.5}), 0, 0.08, 0);
  add(STAMP, new THREE.SphereGeometry(0.036, 20, 14), M(0xd9a86c, {roughness: 0.5}), 0, 0.15, 0);}

// ---------------- the red paragraph sign (red thread) ----------------
const PARA = add(scene, centered(textGeo(FONT, '§', 0.46, 0.1)), paraMat);
// hover spot above each podium (world)
const HOV = [1.1, 1.6, 1.62, 1.5, 1.92].map((y, i) => new THREE.Vector3(PX(i) + (i === 1 ? 0.08 : 0), y, PZ(i) + (i === 2 ? -0.12 : 0.05)));

// ---------------- students (place 5), tractor convoy (place 4), corona crowd (place 2), big crowd (place 1) ----------------
const STUD = []; const SC = {x: -1.45, z: 1.45, rx: 0.55, rz: 0.2};
for (let j = 0; j < 7; j++) STUD.push(person(scene, {i: j + 2, pack: [0xffd45e, 0x6cc0ff, 0xef8fb5, 0x6fe3c4][j % 4], sign: j % 2 === 0 ? 'SCHULSTREIK' : null}));
const CONV = []; for (let j = 0; j < 6; j++) {const T = tractor(scene, [0x46b04a, 0x3f7fd0, 0x9ccf4a][j % 3], 0.75); T.G.visible = false; CONV.push(T);}
const CORO = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {const p = person(POD[3].B, {i: r * 3 + c + 1, sign: (r + c) % 2 === 0 ? ['NEIN!', 'STOPP!', 'SO NICHT!'][(r + c) % 3] : null});
  p.G.scale.setScalar(0.0001); CORO.push({p, r, c, x: -0.22 + c * 0.22, zs: PW / 2 + 0.72 + r * 0.1 + (c % 2) * 0.03, zt: PW / 2 + 0.05 + (3 - r) * 0.1 + 0.0});}
// in local coordinates of podium 2: r = 0 goes to the top step (it starts closest to the stairs, so nobody overtakes anybody)
CORO.forEach(o => {o.zs = PW / 2 + 0.72 + o.r * 0.1; o.zt = PW / 2 + 0.05 + o.r * 0.1;});
const CROWD = []; {
  const free = (x, z) => {
    for (let i = 0; i < 5; i++) {const dx = Math.abs(x - PX(i)), dzF = z - (PZ(i) + PW / 2); if (dx < PW / 2 + 0.12 && z > PZ(i) - PW / 2 - 0.1 && dzF < 0.5) return false;}
    if (x > -2.75 && x < -1.75 && z > 0.45 && z < 1.85) return false;                       // the question-mark podium
    if (x > PX(3) - 0.45 && x < PX(3) + 0.45 && z < PZ(3) + PW / 2 + 1.0) return false;        // stairs and corona crowd
    if (z < -0.35 || z > 2.0 || x < -2.6 || x > 2.5) return false;
    return true;};
  let tries = 0; const pts = [];
  while (pts.length < 64 && tries++ < 20000) {const x = -2.6 + rng() * 5.1, z = -0.35 + rng() * 2.35; if (!free(x, z)) continue; if (pts.some(([a, b]) => Math.hypot(a - x, b - z) < 0.17)) continue; pts.push([x, z]);}
  const c1 = new THREE.Vector2(PX(4), PZ(4) + PW / 2);
  pts.map(([x, z]) => ({x, z, d: Math.hypot(x - c1.x, z - c1.y)})).sort((a, b) => a.d - b.d).forEach((q, n) => {
    const p = person(scene, {i: n + 3, sign: n % 3 === 0 ? ['NEIN!', 'STOPP!', 'SO NICHT!', 'WIR SIND HIER'][n % 4] : null}); p.G.position.set(q.x, 0, q.z); p.G.rotation.y = AZ0 + (hash(n) - 0.5) * 0.5; p.G.scale.setScalar(0.0001);
    CROWD.push({p, t0: 42.35 + n * 0.042 + hash(n + 9) * 0.08, ph: hash(n + 3) * 6.28, x: q.x, z: q.z});});}

// ---------------- confetti and floating shapes ----------------
const CONF = [], CCOL = [0x6fe3c4, 0x6cc0ff, 0xffd45e, 0xffffff, 0xc9b8ff, 0xffb3e6];
{const shapes = [new RoundedBoxGeometry(0.07, 0.03, 0.008, 2, 0.004), new THREE.SphereGeometry(0.022, 14, 10), new THREE.TorusGeometry(0.028, 0.008, 8, 20)];
  let n = 0, tries = 0;
  while (n < 46 && tries++ < 4000) {const x = -2.3 + rng() * 4.6, y = 0.15 + rng() * 1.6, z = -1.8 + rng() * 2.6;
    if ([0, 1, 2, 3, 4].some(i => Math.abs(x - PX(i)) < PW / 2 + 0.2 && Math.abs(z - PZ(i)) < PW / 2 + 0.25 && y < PH(i) + 0.95)) continue;
    if (HOV.some(v => Math.hypot(x - v.x, y - v.y - 0.25, z - v.z) < 0.6)) continue;
    if (z > 0.2 && Math.abs(x) < 1.95) continue;
    const m = add(scene, shapes[n % 3], M(CCOL[n % CCOL.length])); m.castShadow = false; CONF.push({m, p: new THREE.Vector3(x, y, z), r: new THREE.Euler(rng() * 6, rng() * 6, rng() * 6), ph: rng() * 6.28}); n++;}
  }
const BLOBS = [];
for (const [x, y, z, r, c] of [[-2.5, 1.15, -2.4, 0.2, 0xffd45e], [2.1, 0.45, -1.9, 0.14, 0xffb3e6], [-2.3, 0.4, -1.6, 0.12, 0x6fe3c4]]) {const m = add(scene, new THREE.SphereGeometry(r, 40, 24), M(c)); m.position.set(x, y, z); m.castShadow = false; BLOBS.push({m, y, ph: x * 3});}
{const ring = add(scene, new THREE.TorusGeometry(0.2, 0.045, 20, 60), M(0xffb3e6), -2.2, 1.95, -3.2); ring.rotation.set(1.0, 0.4, 0); ring.castShadow = false; BLOBS.push({m: ring, y: 1.95, ph: 1});}
// sparkles around the paragraph sign
const STARS = []; {const st = tex(128, 128, (g, w, h) => {const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.quadraticCurveTo(w / 2, h / 2, w, h / 2); g.quadraticCurveTo(w / 2, h / 2, w / 2, h); g.quadraticCurveTo(w / 2, h / 2, 0, h / 2); g.quadraticCurveTo(w / 2, h / 2, w / 2, 0); g.fill();});
  for (const [dx, dy, sc] of [[-0.34, 0.4, 0.16], [0.3, -0.1, 0.12], [0.36, 0.45, 0.09], [-0.3, -0.08, 0.08]]) {const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: st, transparent: true, depthWrite: false})); sp.scale.setScalar(sc); scene.add(sp); STARS.push({sp, dx, dy, sc});}}

// ---------------- camera path ----------------
// Every shot is framed automatically: the listed points must fit into the free band between the text at the top
// (title or big number) and the subtitles at the bottom, as large as possible.
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const OBJTOP = [0.52, 0.46, 0.45, 0.3, 0.5];
const podPts = (i, full = true) => {const x = PX(i), z = PZ(i), h = PH(i), r = PW / 2, lo = full ? 0 : h / 2 - 0.17; return [V3(x - r, h, z - r), V3(x + r, h, z - r), V3(x - r, h, z + r), V3(x + r, h, z + r), V3(x - r, lo, z + r), V3(x + r, lo, z + r)];};
const PARAH = PARA.geometry.boundingBox.max.y + 0.03;
const paraTop = i => [V3(HOV[i].x - 0.16, HOV[i].y + PARAH, HOV[i].z), V3(HOV[i].x + 0.16, HOV[i].y + PARAH, HOV[i].z)];
const zoomPts = i => [...podPts(i, false), V3(PX(i), PH(i) + OBJTOP[i], PZ(i)), ...paraTop(i)];
const allPts = () => [0, 1, 2, 3, 4].flatMap(i => [...podPts(i), V3(PX(i), PH(i) + OBJTOP[i], PZ(i))]);
function fit(pts, az, el, band = {}) {
  const B = {x0: 95, x1: 985, y0: 505, y1: 1365, ...band}, c = new THREE.PerspectiveCamera(26, W / H, 0.05, 80);
  const A = az * Math.PI / 180, E = el * Math.PI / 180, dir = V3(Math.cos(E) * Math.sin(A), Math.sin(E), Math.cos(E) * Math.cos(A));
  const box = new THREE.Box3().setFromPoints(pts); let t = box.getCenter(V3(0, 0, 0)), d = 10;
  for (let it = 0; it < 40; it++) {
    c.position.copy(t).addScaledVector(dir, d); c.lookAt(t); c.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of pts) {const q = p.clone().project(c), px = (q.x + 1) / 2 * W, py = (1 - q.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);}
    const s = Math.max((x1 - x0) / (B.x1 - B.x0), (y1 - y0) / (B.y1 - B.y0));
    const vh = 2 * d * Math.tan(13 * Math.PI / 180), right = V3(1, 0, 0).applyQuaternion(c.quaternion), up = V3(0, 1, 0).applyQuaternion(c.quaternion);
    const ox = ((x0 + x1) / 2 - (B.x0 + B.x1) / 2) / H * vh, oy = ((y0 + y1) / 2 - (B.y0 + B.y1) / 2) / H * vh;
    t = t.clone().addScaledVector(right, ox * 0.8).addScaledVector(up, -oy * 0.8); d *= 1 + (s - 1) * 0.6;}
  return [t.x, t.y, t.z, d, az, el];}
const K = (t, f, push = 1) => [t, ...f.slice(0, 3), f[3] * push, f[4], f[5]];
const F_HOOK0 = fit([...allPts(), ...paraTop(4)], -24, 15, {y0: 560}), F_HOOK = fit([...allPts(), ...paraTop(4)], -16, 17, {y0: 560});
const F_ONE = fit([...podPts(4), V3(PX(4), PH(4) + 0.5, PZ(4)), ...paraTop(4)], -12, 14, {y0: 560});
const F5 = fit(zoomPts(0), -14, 13), F5S = fit([...podPts(0), V3(PX(0), PH(0) + 0.52, PZ(0)), V3(SC.x - SC.rx - 0.1, 0, SC.z), V3(SC.x + SC.rx + 0.1, 0, SC.z), V3(SC.x, 0, SC.z + SC.rz + 0.08), V3(SC.x, 0.4, SC.z - SC.rz), ...paraTop(0)], -10, 20);
const F4 = fit([...zoomPts(1), V3(PX(1) - 0.42, PH(1) + 0.75, PZ(1) + 0.12)], -16, 13), F4C = fit([...podPts(1), V3(PX(1), PH(1) + 0.46, PZ(1)), V3(-1.9, 0, 1.3), V3(0.9, 0, 1.3), V3(-1.9, 0.3, 1.05), ...paraTop(1)], -14, 19);
const F3 = fit([...zoomPts(2), V3(PX(2) - 0.25, PH(2) + 0.36, PZ(2) + 0.25)], -16, 13);
const F2 = fit(zoomPts(3), -18, 13), F2C = fit([...podPts(3), V3(PX(3) - 0.38, 0, PZ(3) + PW / 2 + 1.1), V3(PX(3) + 0.38, 0, PZ(3) + PW / 2 + 1.1), V3(PX(3), PH(3) + 0.3, PZ(3)), ...paraTop(3)], -20, 19);
const F1 = fit(zoomPts(4), -14, 13), FW = fit([...allPts(), ...paraTop(4), V3(PX(0), 0, 1.75), V3(PX(4), 0, 0.5)], -16, 26);
const FQ = fit([...allPts(), ...paraTop(4), ...[-2.63, -1.87].flatMap(x => [V3(x, 0, 1.31), V3(x, 0.42, 0.55)])], -18, 25), FO = fit(allPts(), -16, 18, {y0: 600, y1: 1300});
const CAM = [
  K(0.0, F_HOOK0, 1.02), K(3.7, F_HOOK), K(4.2, F_HOOK), K(5.3, F_ONE), K(7.0, F_ONE, 0.96),
  K(8.3, F5), K(10.0, F5, 0.88), K(11.0, F5S), K(14.0, F5S, 0.96),
  K(15.1, F4), K(18.9, F4, 0.9), K(20.0, F4C), K(23.9, F4C, 0.96),
  K(25.0, F3), K(30.9, F3, 0.88), K(31.7, F3, 0.86),
  K(33.1, F2), K(34.8, F2, 0.88), K(35.8, F2C), K(39.8, F2C, 0.96),
  K(40.9, F1), K(42.1, F1, 0.88), K(44.0, FW), K(50.6, FW, 0.97),
  K(51.6, FQ), K(54.5, FQ, 0.98), K(55.7, FO), K(END_V + 1, FO)];
console.log('CAM', JSON.stringify({F5, F4, F3, F2, F1, FW}));
const cam = new THREE.PerspectiveCamera(26, W / H, 0.05, 80);
function camAt(v, out = cam) {
  let k = 0; while (k < CAM.length - 2 && v >= CAM[k + 1][0]) k++;
  const a = CAM[k], b = CAM[k + 1], u = smr(seg(v, a[0], b[0])), q = a.map((x, i) => lerp(x, b[i], u));
  const [, tx, ty, tz, d, az, el] = q, A = az * Math.PI / 180, E = el * Math.PI / 180;
  out.position.set(tx + d * Math.cos(E) * Math.sin(A), ty + d * Math.sin(E), tz + d * Math.cos(E) * Math.cos(A)); out.lookAt(tx, ty, tz); out.updateMatrixWorld(); return out;}

// ---------------- text overlays ----------------
const $ = id => document.getElementById(id);
const titleEl = $('title'), numEl = $('num'), subEl = $('sub'), srcEl = $('src'), logoEl = $('logo');
const SUBS = [[0.05, 4.05, 'Diese fünf Gesetze haben Deutschland richtig wütend gemacht.'], [4.1, 7.35, 'Und Nummer eins hat sogar eine neue Partei hervorgebracht.'],
  [7.45, 10.12, 'Platz fünf: der neue Wehrdienst.'], [10.12, 14.18, 'Dagegen streiken immer wieder Zehntausende Schüler in rund hundert Städten.'],
  [14.18, 16.58, 'Platz vier: der Agrardiesel.'], [16.58, 19.16, 'Weil eine Steuerhilfe für Bauern wegfallen sollte,'], [19.16, 21.48, 'rollten Tausende Traktoren nach Berlin,'],
  [21.48, 24.02, 'und die Regierung ruderte teilweise zurück.'], [24.02, 26.5, 'Platz drei: das Heizungsgesetz.'], [26.5, 28.5, 'Die Ampel wollte es so schnell beschließen,'],
  [28.5, 32.26, 'dass das Bundesverfassungsgericht die Abstimmung kurz vorher stoppte.'], [32.26, 34.84, 'Platz zwei: die Corona-Regeln.'], [34.84, 36.84, 'Monatelang gab es Großdemos,'],
  [36.84, 39.95, 'und Hunderte stürmten sogar die Treppe vor dem Reichstag.'], [39.95, 42.1, 'Platz eins: Hartz IV.'], [42.1, 46.36, 'An einem einzigen Tag gingen über 200.000 Menschen auf die Straße,'],
  [46.36, 50.75, 'und aus der Wut entstand eine neue Partei, die später in der Linken aufging.'], [50.85, 52.9, 'Und welches Gesetz fehlt hier?'], [53.1, 54.6, 'Schreib’s in die Kommentare.']];
const NUMS = [[7.45, 14.18, '5', 'Neuer Wehrdienst · seit 2026'], [14.18, 24.02, '4', 'Agrardiesel · 2024'], [24.02, 32.26, '3', 'Heizungsgesetz · 2023'], [32.26, 39.95, '2', 'Corona-Regeln · 2020/21'],
  [39.95, 43.8, '1', 'Hartz IV · 2004'], [43.8, 46.4, 'C', 'Menschen an einem Tag · 30.08.2004'], [46.4, 50.75, '1', 'Hartz IV · daraus entstand die WASG, ab 2007 Teil der Linken']];
const TITLES = [[-1, 7.35, 'Diese 5 Gesetze haben Deutschland richtig wütend gemacht'], [50.85, OUT0, 'Welches Gesetz fehlt?']];
const SRCS = [[-1, 7.35, 'Reihenfolge: eigene Einschätzung nach Größe der Proteste · Modell vereinfacht'], [7.45, 14.18, 'Quelle: ZDFheute, Berliner Zeitung (Zahlen laut Veranstaltern)'],
  [14.18, 24.02, 'Quelle: Deutscher Bauernverband, Polizei Berlin, Bundesregierung'], [24.02, 32.26, 'Quelle: Bundesverfassungsgericht (5.7.2023), Deutscher Bundestag'],
  [32.26, 39.95, 'Quelle: Polizei Berlin, Tagesspiegel (29.8.2020)'], [39.95, 50.75, 'Quelle: Berliner Zeitung, Bundeszentrale für politische Bildung']];
const fadeIn = (v, a, b, f = 0.22) => Math.min(seg(v, a, a + f), 1 - seg(v, b - f, b));
let lastNum = '', lastTitle = '', lastSrc = '', lastSub = '';
function overlays(v) {
  const ti = TITLES.find(q => v >= q[0] && v < q[1]); const tt = ti ? ti[2] : ''; if (tt !== lastTitle) {titleEl.textContent = tt; lastTitle = tt;}
  titleEl.style.opacity = ti ? fadeIn(v, ti[0], ti[1]) : 0; titleEl.style.transform = ti ? `translateY(${(1 - eo(seg(v, ti[0], ti[0] + 0.4))) * 14}px)` : 'none';
  const n = NUMS.find(q => v >= q[0] && v < q[1]);
  if (n) {let big = n[2]; if (big === 'C') {const c = Math.round(200000 * eo(seg(v, 43.85, 44.9)) / 1000) * 1000; big = c.toLocaleString('de-DE') + (v > 44.9 ? '+' : '');}
    const html = big + '<small>' + n[3] + '</small>'; if (html !== lastNum) {numEl.innerHTML = html; lastNum = html;}
    const a = NUMS.indexOf(n), cont = a > 0 && NUMS[a - 1][1] === n[0] && NUMS[a - 1][2].length && (n[2] === 'C' || NUMS[a - 1][2] === 'C');
    numEl.style.opacity = cont ? Math.min(1, 1 - seg(v, n[1] - 0.22, n[1])) : fadeIn(v, n[0], n[1]);
    numEl.style.transform = `translateY(${(1 - eo(seg(v, n[0], n[0] + 0.35))) * (cont ? 0 : 16)}px)`;}
  else numEl.style.opacity = 0;
  const s = SUBS.find(q => v >= q[0] && v < q[1]); const st = s ? s[2] : ''; if (st !== lastSub) {subEl.textContent = st; lastSub = st;}
  subEl.style.opacity = s ? Math.min(1, (v - s[0]) / 0.18 + 0.15) * (1 - seg(v, OUT0 - 0.1, OUT0 + 0.2)) : 0; subEl.style.transform = s ? `translateY(${(1 - eo(seg(v, s[0], s[0] + 0.3))) * 8}px)` : 'none';
  const r = SRCS.find(q => v >= q[0] && v < q[1]); const rt = r ? r[2] : ''; if (rt !== lastSrc) {srcEl.textContent = rt; lastSrc = rt;} srcEl.style.opacity = r ? fadeIn(v, r[0], r[1]) : 0;
  logoEl.style.opacity = 1 - seg(v, OUT0, OUT0 + 0.35);}

// ---------------- the paragraph sign: where is it at time v ----------------
// hops: [start, from podium, to podium]
const HOPS = [[7.55, 4, 0], [14.25, 0, 1], [24.1, 1, 2], [32.35, 2, 3], [40.05, 3, 4]];
const HOPD = 0.75, tmpV = new THREE.Vector3();
function paraState(v) {
  // returns position, rotation y, scale
  let p = HOV[4].clone(), ry = AZ0 * 0.6, s = 1;
  if (v < 1.2) {p.y += 2.5; s = 0.0001;}
  else if (v < 2.0) {const u = seg(v, 1.2, 2.0); p.y += 1.4 * (1 - eo(u)) ; ry += (1 - eo(u)) * Math.PI * 2; s = Math.max(0.0001, eo(seg(v, 1.2, 1.5)));}
  let at = 4;
  for (const [t0, a, b] of HOPS) {if (v >= t0 + HOPD) at = b; else if (v >= t0) {const u = seg(v, t0, t0 + HOPD), e = eio(u); p = HOV[a].clone().lerp(HOV[b], e); p.y += Math.sin(Math.PI * u) * (0.32 + Math.abs(HOV[b].y - HOV[a].y) * 0.5); ry = AZ0 * 0.6 + e * Math.PI * 2; at = -1; break;} else break;}
  if (at >= 0 && v >= 2.0) {p = HOV[at].clone(); p.y += 0.025 * Math.sin(v * 2.2); ry = AZ0 * 0.6 + 0.12 * Math.sin(v * 0.9);}
  // place 3: the sign slams down on the radiator (the court stops the vote)
  if (v >= 31.15 && v < 32.35) {const base = HOV[2].clone(), top = PH(2) + 0.425;
    if (v < 31.42) {p = base.clone(); p.y += 0.22 * eo(seg(v, 31.15, 31.42));}
    else if (v < 31.58) {p = base.clone(); p.y = lerp(base.y + 0.22, top, ei(seg(v, 31.42, 31.58)));}
    else {p = base.clone(); p.y = top + (v < 32.0 ? 0 : (base.y - top) * eio(seg(v, 32.0, 32.3)));}
    p.x = PX(2); p.z = PZ(2) - 0.06;}
  return {p, ry, s, sq: v >= 31.58 && v < 31.75 ? Math.sin(Math.PI * seg(v, 31.58, 31.75)) : 0};}

// ---------------- the frame at voice time v ----------------
const _v = new THREE.Vector3(), _q = new THREE.Quaternion();
function setT(v) {
  camAt(v);
  overlays(v);
  // hook: each object hops once (5 → 1)
  const hopObj = (i, o, baseY) => {const a = 0.25 + i * 0.26, u = seg(v, a, a + 0.38); o.position.y = baseY + Math.sin(Math.PI * u) * 0.12;
    const sq = u > 0.85 && u < 1 ? Math.sin(Math.PI * (u - 0.85) / 0.15) * 0.1 : 0; o.scale.y = (o.userData.s ?? 1) * (1 - sq); };
  SOLD.G.userData.s = 1; TRAC.G.userData.s = 1.65; RAD.userData.s = 1.15; MASK.userData.s = 1.15; CLIP.userData.s = 1;
  hopObj(0, SOLD.G, POD[0].h); hopObj(1, TRAC.G, POD[1].h); hopObj(2, RAD, POD[2].h); hopObj(3, MASK, POD[3].h + 0.024 + 0.115 * Math.sin(1.15)); hopObj(4, CLIP, POD[4].h);

  // ---- place 5: soldier marches on the spot and salutes, students strike in a circle
  still(SOLD);
  if (v > 7.9 && v < 9.0) walk(SOLD, (v - 7.9) * 9, 0.45 * Math.sin(Math.PI * seg(v, 7.9, 9.0)));
  {const sal = sm(seg(v, 9.0, 9.35)) * (1 - sm(seg(v, 10.6, 10.95)));
    SOLD.arms[1].rotation.z = lerp(0.15, -2.62, sal) ; SOLD.arms[1].rotation.x = lerp(0, -0.55, sal); SOLD.arms[0].rotation.z = -0.15;}
  {const on = pop(v, 10.25, 0.4) * (1 - sm(seg(v, 14.35, 14.75)));
    STUD.forEach((p, j) => {const vis = on > 0.001; p.G.visible = vis; if (!vis) return;
      const tt = Math.max(0, v - 10.25), phi = j * Math.PI * 2 / STUD.length + tt * 0.5, x = SC.x + SC.rx * Math.cos(phi), z = SC.z + SC.rz * Math.sin(phi);
      p.G.position.set(x, 0, z); const dx = -SC.rx * Math.sin(phi), dz = SC.rz * Math.cos(phi); p.G.rotation.y = Math.atan2(dx, dz);
      p.G.scale.setScalar(Math.max(0.0001, on)); walk(p, tt * 8 + j, 0.5);
      if (p.sign) {const out = Math.atan2(Math.cos(phi) * SC.rz, Math.sin(phi) * SC.rx); p.sign.rotation.y = Math.atan2(Math.cos(phi) / SC.rx, Math.sin(phi) / SC.rz) - p.G.rotation.y; p.sign.position.y = 0.006 * Math.sin(tt * 8 + j);}});}

  // ---- place 4: engine starts, smoke, the tax relief flies away and half of it comes back, convoy
  const engine = seg(v, 15.25, 15.4) * (1 - seg(v, 24.0, 24.4));
  TRAC.B.position.y = engine * 0.004 * Math.sin(v * 70); TRAC.B.rotation.z = engine * 0.012 * Math.sin(v * 53);
  {TRAC.G.updateMatrixWorld(true); const pipe = TRAC.pipe.clone().applyMatrix4(TRAC.B.matrixWorld); const T0 = 15.35, dt = 0.17, life = 1.5, T1 = 24.2;
    SMOKE.forEach((m, j) => {const n = j + SMOKE.length * Math.floor((v - T0 - j * dt) / (SMOKE.length * dt)); const te = T0 + n * dt, age = v - te;
      if (n < 0 || te > T1 || age < 0 || age > life) {m.visible = false; return;}
      m.visible = true; const a = age / life; m.position.set(pipe.x + 0.1 * age + 0.02 * Math.sin(n * 1.7), pipe.y + 0.4 * age - 0.06 * age * age, pipe.z + 0.04 * age * Math.sin(n));
      m.scale.setScalar(0.018 + 0.07 * Math.sqrt(a)); m.material.opacity = 0.62 * (1 - a) * Math.min(1, age / 0.08);});}
  {let s = 0, ox = 0, oy = 0;
    if (v >= 16.95 && v < 18.3) s = pop(v, 16.95, 0.4);
    else if (v >= 18.3 && v < 19.0) {const u = seg(v, 18.3, 19.0); s = 1 - ei(u); ox = -0.55 * eo(u); oy = 0.55 * eo(u);}
    else if (v >= 22.3 && v < 24.4) {const u = seg(v, 22.3, 22.95); s = 0.55 * eo(u) * (1 - sm(seg(v, 24.0, 24.4))); ox = -0.55 * (1 - eo(u)); oy = 0.55 * (1 - eo(u));}
    COIN.scale.setScalar(Math.max(0.0001, s)); COIN.position.set(-0.34 + ox, POD[1].h + 0.58 + oy + 0.02 * Math.sin(v * 2), 0.12); COIN.rotation.y = -0.3 + 0.35 * Math.sin(v * 1.3);}
  CONV.forEach((T, j) => {const x = -3.3 + (v - 19.05) * 1.5 - j * 0.42; const vis = v > 19.0 && x > -3.4 && x < 3.4; T.G.visible = vis; if (!vis) return;
    T.G.position.set(x, 0, 1.17); T.G.rotation.y = 0; T.B.position.y = 0.002 * Math.sin(v * 60 + j);});

  // ---- place 3: the radiator heats, the traffic light is in a hurry, the paragraph sign stops everything
  const heat = sm(seg(v, 25.3, 25.9)) * (1 - sm(seg(v, 31.58, 31.8))) ;
  HEAT.forEach((m, i) => {const c = ((v * 0.55 + i * 0.27) % 1); m.position.y = 0.36 + c * 0.22; m.material.opacity = 0.75 * heat * Math.sin(Math.PI * c);});
  DIAL.rotation.x = -2.2 * sm(seg(v, 25.3, 26.0)) - 6.28 * sm(seg(v, 27.4, 28.45));
  {const s = pop(v, 26.62, 0.38) * (1 - sm(seg(v, 32.1, 32.45))); AMP.scale.setScalar(Math.max(0.0001, s));
    const on = v >= 26.8 && v < 31.58, fast = v >= 27.4 && v < 28.5;
    LAMPS[1].material.emissiveIntensity = on && !fast && v < 27.4 ? 1.6 : 0;
    LAMPS[2].material.emissiveIntensity = on && (fast ? (Math.floor(v * 8) % 2 === 0 ? 2.2 : 0) : v >= 28.5 ? 2.0 : 0);}

  // ---- place 2: mask breathes, stairs and barriers, the crowd storms the stairs
  MASKP.scale.y = 1 + 0.12 * Math.sin(v * 3.2) * seg(v, 33.5, 33.9) * (1 - seg(v, 39.9, 40.3));
  STAIRS.scale.y = Math.max(0.0001, eo(seg(v, 33.55, 34.15))); STAIRS.visible = v > 33.56;
  BARR.forEach((b, k) => {b.B.scale.setScalar(Math.max(0.0001, pop(v, 34.15 + k * 0.1, 0.35))); b.F.rotation.x = -(Math.PI / 2 - 0.08) * ei(seg(v, 37.28 + k * 0.06, 37.55 + k * 0.06));});
  CORO.forEach((o, n) => {const s = pop(v, 34.95 + n * 0.05, 0.35); o.p.G.scale.setScalar(Math.max(0.0001, s));
    const run = seg(v, 37.45 + o.r * 0.06, 38.55 + o.r * 0.06), e = sm(run); const z = lerp(o.zs, o.zt, e);
    let y = STEP(z); if (run > 0 && run < 1) {const fr = ((z - PW / 2) / 0.1) % 1; y += Math.abs(Math.sin(Math.PI * fr)) * 0.03;}
    o.p.G.position.set(o.x + 0.012 * Math.sin(n * 2.1), y, z);
    const turn = run <= 0 ? 0 : run >= 1 ? sm(seg(v, 38.7 + o.r * 0.05, 39.1 + o.r * 0.05)) : 1;
    o.p.G.rotation.y = run <= 0 ? AZ0 * 0.5 + (hash(n) - 0.5) * 0.4 : run < 1 ? Math.PI : lerp(Math.PI, AZ0 * 0.5 + 2 * Math.PI, turn);
    if (run > 0 && run < 1) walk(o.p, run * 22, 0.7); else {still(o.p); o.p.body.position.y = 0.006 * Math.abs(Math.sin(v * 5 + n));}
    if (o.p.sign) o.p.sign.position.y = 0.008 * Math.sin(v * 4 + n);});

  // ---- place 1: stamp, then the big crowd fills the floor, arms go up at „Wut“
  {const a = 41.15, s = pop(v, a, 0.25) * (1 - sm(seg(v, 42.0, 42.25))), z = v < 41.45 ? 0.3 : v < 41.6 ? lerp(0.3, 0.012, ei(seg(v, 41.45, 41.6))) : v < 41.75 ? 0.012 : lerp(0.012, 0.3, eo(seg(v, 41.75, 42.0)));
    STAMP.scale.setScalar(Math.max(0.0001, s)); STAMP.position.z = z; INK.material.opacity = v >= 41.6 ? 0.92 : 0;}
  CROWD.forEach((c, n) => {const s = pop(v, c.t0, 0.4); c.p.G.scale.setScalar(Math.max(0.0001, s)); c.p.G.visible = s > 0.001;
    if (!c.p.G.visible) return; c.p.body.position.y = 0.005 * Math.abs(Math.sin(v * 4.5 + c.ph));
    const wave = sm(seg(v, 46.75 + (c.x + 2.6) * 0.12, 47.05 + (c.x + 2.6) * 0.12)) * (1 - sm(seg(v, 49.6, 50.0)));
    c.p.arms[0].rotation.z = lerp(-0.15, -2.7, wave); if (!c.p.sign) c.p.arms[1].rotation.z = lerp(0.15, 2.7, wave);
    if (c.p.sign) c.p.sign.position.y = 0.01 * Math.sin(v * 4 + c.ph) + 0.03 * wave;});

  // ---- the question-mark podium
  PQ.G.scale.setScalar(Math.max(0.0001, pop(v, 51.0, 0.45)));

  // ---- the paragraph sign
  const P = paraState(v);
  PARA.position.copy(P.p); PARA.rotation.set(0, P.ry, 0); PARA.scale.set(P.s * (1 + 0.18 * P.sq), P.s * (1 - 0.22 * P.sq), P.s);

  // ---- confetti, shapes, sparkles
  CONF.forEach((c, j) => {if (c.burst) return; c.m.visible = true;
    c.m.position.set(c.p.x + 0.04 * Math.sin(v * 0.6 + c.ph), c.p.y + 0.06 * Math.sin(v * 0.45 + c.ph * 1.3), c.p.z); c.m.rotation.set(c.r.x + v * 0.7, c.r.y + v * 0.5, c.r.z); c.m.scale.setScalar(1);});
  BLOBS.forEach(b => {b.m.position.y = b.y + 0.05 * Math.sin(v * 0.7 + b.ph);});
  STARS.forEach((s, k) => {const tw = 0.55 + 0.45 * Math.sin(v * 3 + k * 1.7); s.sp.position.set(PARA.position.x + s.dx, PARA.position.y + 0.23 + s.dy, PARA.position.z + 0.08); s.sp.scale.setScalar(s.sc * tw * P.s); s.sp.material.opacity = (v < OUT0 ? 1 : 1 - seg(v, OUT0, OUT0 + 0.3));});

  // ---- outro
  outro(v);}

// Outro (Wunsch des Nutzers, 21.11.2026: „einfach eine 2D-Animation“): The picture fades to a dark violet card, the red
// paragraph sign pops up in the middle, shrinks and flies as the dot behind „function“ while the letters fade in one by one.
const endEl = document.getElementById('end'), endG = endEl.getContext('2d');
const LOGO_FS = 170, LOGO_Y = 1010;
endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px';
const LW = endG.measureText('function').width, DW = endG.measureText('.').width, DOT = endG.measureText('.');
const LX = W / 2 - (LW + DW) / 2, DOTX = LX + LW + (DOT.actualBoundingBoxRight - DOT.actualBoundingBoxLeft) / 2 + DOT.actualBoundingBoxLeft * 0, DOTR = (DOT.actualBoundingBoxAscent + DOT.actualBoundingBoxDescent) / 2, DOTY = LOGO_Y - DOT.actualBoundingBoxAscent + DOTR;
const LETX = []; {let x = LX; for (const ch of 'function') {LETX.push(x); x = LX + endG.measureText('function'.slice(0, LETX.length)).width;}}
function outro(v) {
  PARA.castShadow = v < OUT0;
  const u = v - OUT0; endG.clearRect(0, 0, W, H);
  if (u < 0) return;
  // dark violet card over the 3D picture
  const f = sm(seg(u, 0, 0.45)); const bg = endG.createRadialGradient(W / 2, 980, 60, W / 2, 980, 1250);
  bg.addColorStop(0, '#2c2178'); bg.addColorStop(0.55, '#1a1250'); bg.addColorStop(1, '#0b0820');
  endG.globalAlpha = f; endG.fillStyle = bg; endG.fillRect(0, 0, W, H); endG.globalAlpha = 1;
  // the red paragraph sign: pops up in the middle, then flies on an arc into the dot of the logo and becomes a round dot
  const popS = back(seg(u, 0.2, 0.6)), fly = eio(seg(u, 1.05, 1.65)), morph = sm(seg(u, 1.4, 1.65));
  const p0 = {x: W / 2, y: 900}, p1 = {x: DOTX, y: DOTY}, c = {x: (p0.x + p1.x) / 2 + 120, y: Math.min(p0.y, p1.y) - 260};
  const bx = (1 - fly) ** 2 * p0.x + 2 * (1 - fly) * fly * c.x + fly * fly * p1.x, by = (1 - fly) ** 2 * p0.y + 2 * (1 - fly) * fly * c.y + fly * fly * p1.y;
  const size = lerp(330, DOTR * 2.6, eio(seg(u, 1.05, 1.6)));
  const land = seg(u, 1.65, 1.85), sq = land > 0 && land < 1 ? Math.sin(Math.PI * land) * 0.25 : 0;
  if (u >= 0.2) {
    endG.save(); endG.translate(bx, by); endG.rotate((1 - popS) * -0.6 + fly * Math.PI * 2);
    endG.globalAlpha = 1 - morph; endG.fillStyle = '#E01E2B'; endG.font = `800 ${size}px "Inter Tight"`; endG.textAlign = 'center'; endG.textBaseline = 'middle';
    endG.scale(popS || 0.0001, popS || 0.0001); endG.fillText('§', 0, size * 0.04); endG.restore();
    if (morph > 0) {endG.save(); endG.globalAlpha = morph; endG.fillStyle = '#E01E2B'; endG.beginPath(); endG.ellipse(bx, by + DOTR * sq, DOTR * (1 + sq), DOTR * (1 - sq), 0, 0, Math.PI * 2); endG.fill(); endG.restore();}}
  // the letters fade in one by one (slide up a little)
  endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px'; endG.fillStyle = '#E01E2B'; endG.textAlign = 'left'; endG.textBaseline = 'alphabetic';
  'function'.split('').forEach((ch, i) => {const a = sm(seg(u, 1.0 + i * 0.06, 1.42 + i * 0.06)); if (a <= 0) return;
    endG.save(); endG.globalAlpha = a; endG.fillText(ch, LETX[i], LOGO_Y + (1 - a) * 34); endG.restore();});}

// collision check over the whole video: people must not touch each other, podiums, stairs or tractors
window.CHECK = () => {
  const errs = [], wp = new THREE.Vector3(); let n = 0, minPP = 9, minPod = 9, minTr = 9;
  for (let f = 0; f <= Math.round(OUT0 * 15); f++) {const v = f / 15; setT(v); scene.updateMatrixWorld(true); n++;
    const ppl = [];
    for (const p of [...STUD, ...CORO.map(o => o.p), ...CROWD.map(c => c.p)]) {if (!p.G.visible) continue; p.G.getWorldScale(wp); if (wp.x < 0.5) continue; p.G.getWorldPosition(wp); ppl.push({x: wp.x, y: wp.y, z: wp.z, p});}
    for (let i = 0; i < ppl.length; i++) for (let j = i + 1; j < ppl.length; j++) {const d = Math.hypot(ppl[i].x - ppl[j].x, ppl[i].z - ppl[j].z); if (Math.abs(ppl[i].y - ppl[j].y) < 0.1) {minPP = Math.min(minPP, d); if (d < 0.075) errs.push(['people', v.toFixed(2), d.toFixed(3)]);}}
    for (const q of ppl) for (let i = 0; i < 5; i++) {const dx = Math.abs(q.x - PX(i)) - PW / 2, dz = Math.abs(q.z - PZ(i)) - PW / 2, d = Math.hypot(Math.max(dx, 0), Math.max(dz, 0)); minPod = Math.min(minPod, d); if (d < 0.035) errs.push(['podium', i, v.toFixed(2), d.toFixed(3)]);}
    for (const T of CONV) {if (!T.G.visible) continue; T.G.getWorldPosition(wp);
      for (let i = 0; i < 5; i++) {const dx = Math.abs(wp.x - PX(i)) - PW / 2 - 0.15, dz = Math.abs(wp.z - PZ(i)) - PW / 2 - 0.08, d = Math.hypot(Math.max(dx, 0), Math.max(dz, 0)); minTr = Math.min(minTr, d); if (d < 0.01) errs.push(['tractor', i, v.toFixed(2)]);}
      for (const q of ppl) if (Math.hypot(q.x - wp.x, q.z - wp.z) < 0.2) errs.push(['tractor-person', v.toFixed(2)]);}}
  return {frames: n, errors: errs.length, first: errs.slice(0, 12), minPersonPerson: +minPP.toFixed(3), minPersonPodium: +minPod.toFixed(3), minTractorPodium: +minTr.toFixed(3)};};
window.TOTAL = Math.round((END_V + VO) * 30);
window.setT = setT;
window.renderFrame = f => {setT(f / 30 - VO); renderer.render(scene, cam);};
window.DBG = {THREE, scene, cam, POD, CROWD, CORO, STUD, CONV, PARA, SOLD, paraState, HOV, PX, PZ, PH, PW, STEP, CONF};
// ?cover=1: clean thumbnail (no text, the whole staircase large in the middle, safe for the 3:4 crop of the profile grid)
if (new URLSearchParams(location.search).get('cover')) {document.getElementById('ov').style.display = 'none'; document.getElementById('shade').style.display = 'none';
  const f = fit([...allPts(), ...paraTop(4)], -16, 17, {x0: 70, x1: 1010, y0: 470, y1: 1450}); const v0 = 3.2;
  window.renderFrame = () => {setT(v0); const A = f[4] * Math.PI / 180, E = f[5] * Math.PI / 180; cam.position.set(f[0] + f[3] * Math.cos(E) * Math.sin(A), f[1] + f[3] * Math.sin(E), f[2] + f[3] * Math.cos(E) * Math.cos(A)); cam.lookAt(f[0], f[1], f[2]); renderer.render(scene, cam);};}
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round(((q0 != null ? +q0 : 0) + VO) * 30));
window.ready = true;
