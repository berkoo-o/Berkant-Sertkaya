// function. – „Diese Reihenfolge gab es noch nie“ im Look „Spieltisch Noir“ (gewählt am 27.11.2026), ganzes Video als One-Take.
// Stationen auf dem Spieltisch von links nach rechts: Globus (Atome der Erde), Fächer mit rotem Faden (Mitte), zweites Spiel mit Mischzähler (siebenmal);
// an der Wand die Fallblatt-Tafel (erst 52!, danach das Gedankenexperiment mit acht Milliarden Menschen). Zeiten = Videozeit, die Stimme beginnt bei 0,15 s (voice/words.json, Take 1).
import {THREE, W, H, PI, RED, FPS, clamp, lerp, seg, sm, eo, eio, back, V3, rng, tex, rr, suit, drawFace, drawBack, makeDeck, poseDeck, makeThread, camPath, T, CT, BIG, overlays} from './core.js';
import {GRADE} from './s1.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {OBB} from 'three/addons/math/OBB.js';

await Promise.all(['600 40px "Inter Tight"', '800 40px "Inter Tight"', '400 40px Poppins', '500 170px Poppins', '600 20px Poppins'].map(f => document.fonts.load(f)));
const VO = 0.15, OUT0 = 41.0, END = 44.1;
const WORDS = (await (await fetch('voice/words.json')).json()).words;

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 200);
const R = rng(11);
renderer.toneMappingExposure = 0.95; scene.background = new THREE.Color(0x070708);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22;
const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
const std = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.6, ...o});
const noise = (g, w, h, n, a, cols) => {for (let i = 0; i < n; i++) {g.fillStyle = cols[i % cols.length].replace('A', (a * (0.4 + R() * 0.6)).toFixed(3)); g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2.5);}};
const rrShape = (w, d, r) => {const s = new THREE.Shape(), x = w / 2, y = d / 2; s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.absarc(x - r, -y + r, r, -PI / 2, 0); s.lineTo(x, y - r); s.absarc(x - r, y - r, r, 0, PI / 2);
  s.lineTo(-x + r, y); s.absarc(-x + r, y - r, r, PI / 2, PI); s.lineTo(-x, -y + r); s.absarc(-x + r, -y + r, r, PI, PI * 1.5); return s;};
const FW = 7.4, FD = 4.8, FR = 1.9;
const brass = new THREE.MeshStandardMaterial({color: 0xc9a25a, roughness: 0.28, metalness: 0.9});

// ------------------------------------------------------------------ table: felt with printed gold lines, walnut race track, padded leather rail, body
const feltT = tex(2048, 1330, (g, w, h) => {g.fillStyle = '#0d4336'; g.fillRect(0, 0, w, h); noise(g, w, h, 90000, 0.08, ['rgba(255,255,255,A)', 'rgba(0,0,0,A)', 'rgba(40,140,110,A)']);
  const cx = w / 2, cy = h / 2; g.strokeStyle = 'rgba(214,176,96,0.75)'; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, cy + 40, 760, 470, 0, 0, PI * 2); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy + 40, 735, 448, 0, 0, PI * 2); g.stroke();
  [['S', -1, 0], ['H', 1, 0], ['C', 0, -1], ['D', 0, 1]].forEach(([s, sx, sy]) => {g.fillStyle = 'rgba(12,67,54,1)'; g.beginPath(); g.arc(cx + sx * 760, cy + 40 + sy * 470, 30, 0, 7); g.fill(); suit(g, s, cx + sx * 760, cy + 40 + sy * 470, 38, 'rgba(214,176,96,0.9)');});
  g.fillStyle = 'rgba(214,176,96,0.8)'; g.font = '600 34px "Inter Tight"'; g.textAlign = 'center'; g.letterSpacing = '10px'; g.fillText('EINE VON 8 × 10⁶⁷ REIHENFOLGEN', cx, cy - 500);
  g.font = '600 26px "Inter Tight"'; g.fillText('52 KARTEN · 4 FARBEN · 13 WERTE', cx, cy + 600); g.letterSpacing = '0px';});
const feltBump = tex(1024, 666, (g, w, h) => {g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); noise(g, w, h, 60000, 0.25, ['rgba(255,255,255,A)', 'rgba(0,0,0,A)']);}, {linear: true});
{const s = rrShape(FW, FD, FR), g = new THREE.ShapeGeometry(s, 48), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / FW + 0.5, p.getY(i) / FD + 0.5); g.rotateX(-PI / 2);
  add(scene, g, new THREE.MeshStandardMaterial({map: feltT, roughness: 0.96, bumpMap: feltBump, bumpScale: 1.2, color: 0xffffff}), 0, 0, 0, false);}
const woodT = tex(1024, 256, (g, w, h) => {g.fillStyle = '#4a2a1a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) {const y = R() * h; g.strokeStyle = `rgba(${20 + R() * 40},${10 + R() * 20},${5},${0.25 + R() * 0.35})`; g.lineWidth = 0.6 + R() * 2.4; g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 + Math.sin(x * 0.043 + i * 2) * 1.5); g.stroke();}}, {repeat: [6, 1]});
const walnut = new THREE.MeshPhysicalMaterial({map: woodT, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08});
{const outer = rrShape(FW + 0.56, FD + 0.56, FR + 0.28); outer.holes.push(rrShape(FW, FD, FR)); const g = new THREE.ExtrudeGeometry(outer, {depth: 0.05, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 48});
  g.rotateX(-PI / 2); add(scene, g, walnut, 0, -0.03, 0, false);}
const leatherT = tex(1024, 128, (g, w, h) => {g.fillStyle = '#17151a'; g.fillRect(0, 0, w, h); noise(g, w, h, 20000, 0.12, ['rgba(255,255,255,A)', 'rgba(0,0,0,A)']);
  g.strokeStyle = 'rgba(190,170,140,0.55)'; g.lineWidth = 2.2; g.setLineDash([10, 7]); for (const y of [h * 0.3, h * 0.7]) {g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();}}, {repeat: [36, 1]});
{const pts = rrShape(FW + 1.2, FD + 1.2, FR + 0.6).getSpacedPoints(220).map(p => V3(p.x, 0.15, -p.y)); const c = new THREE.CatmullRomCurve3(pts, true);
  add(scene, new THREE.TubeGeometry(c, 440, 0.25, 24, true), new THREE.MeshStandardMaterial({map: leatherT, roughness: 0.42, metalness: 0.0}), 0, 0, 0, false);}
{const g = new THREE.ExtrudeGeometry(rrShape(FW + 1.5, FD + 1.5, FR + 0.75), {depth: 0.9, bevelEnabled: false, curveSegments: 48}); g.rotateX(-PI / 2);
  add(scene, g, std(0x121114, {roughness: 0.35}), 0, -1.0, 0, false);
  add(scene, new THREE.CylinderGeometry(0.9, 1.3, 6, 40), std(0x0f0e10, {roughness: 0.4}), 0, -4.1, 0, false);}
add(scene, new THREE.PlaneGeometry(80, 80).rotateX(-PI / 2), std(0x0b0b0d, {roughness: 0.25, metalness: 0.2}), 0, -7, 0, false);

// ------------------------------------------------------------------ cards: the shuffled deck in the middle (fan + red thread) and a second deck on the right (shuffled seven times)
const P = {bg: '#fbfaf6', red: '#c8202f', ink: '#18181d', ink2: '#1d1d24', gold: '#d4a84c', navy: '#22305e', skin: '#f1c7a1', frame: '#f4efe4', paper: true};
const backT = tex(512, 715, (g, w, h) => drawBack(g, w, h, {bg: '#1b2a55', line: 'rgba(212,168,76,0.26)', accent: '#d4a84c', edge: '#fbfaf6'}));
const faceT = {}; const faceTex = id => faceT[id] || (faceT[id] = tex(512, 715, (g, w, h) => drawFace(g, w, h, id, P)));
const deckOpts = () => ({face: id => new THREE.MeshStandardMaterial({map: faceTex(id), roughness: 0.38}), backMat: new THREE.MeshStandardMaterial({map: backT, roughness: 0.36}), edgeMat: std(0xf1eee6, {roughness: 0.8})});
const cards = makeDeck(scene, deckOpts()), ORIGIN = V3(0, 0.002, 0.15);
const threadM = new THREE.MeshStandardMaterial({color: RED, emissive: RED, emissiveIntensity: 0.55, roughness: 0.45}), thread = makeThread(scene, ORIGIN, threadM);
const D2 = V3(2.25, 0.002, 0.4), cards2 = makeDeck(scene, deckOpts());
// seven riffles: the first one slower, then faster; between two riffles the squared deck rests (the swap of the order inside a squared face-down deck is invisible)
const RIF = []; {let s = 31.2; for (let k = 0; k < 7; k++) {const d = k === 0 ? 1.1 : 0.72; RIF.push([s, d]); s += k === 0 ? 1.1 : 0.75;}}
const deck2T = v => {if (v < RIF[0][0]) return 0; let t = 3.2; for (const [s, d] of RIF) if (v >= s) t = 0.35 + clamp((v - s) / d) * 2.85; return t;};
const shuffles = v => RIF.filter(([s, d]) => v >= s + d * 0.982).length;   // counted when the deck is squared again

// ------------------------------------------------------------------ chips, dealer button, card box, whisky glass (moved aside for the globe and the second deck)
const CHIP = [['#1c1c21', '#f2efe8', '500'], ['#efebe3', '#2a4a9c', '1'], ['#2a4a9c', '#f2efe8', '10'], ['#2d7a5a', '#f2efe8', '25'], ['#5b3f92', '#f3d27a', '100'], ['#c99a3e', '#1c1c21', '1K']];
const chipM = CHIP.map(([b, s, val]) => {const side = tex(256, 32, (g, w, h) => {g.fillStyle = b; g.fillRect(0, 0, w, h); g.fillStyle = s; for (let i = 0; i < 6; i++) g.fillRect(i * w / 6 + 8, 0, 18, h);});
  const top = tex(256, 256, (g, w, h) => {g.fillStyle = b; g.fillRect(0, 0, w, h); g.fillStyle = s; for (let i = 0; i < 6; i++) {g.save(); g.translate(w / 2, h / 2); g.rotate(i * PI / 3); g.fillRect(-14, -128, 28, 30); g.restore();}
    g.strokeStyle = s; g.lineWidth = 4; g.setLineDash([6, 6]); g.beginPath(); g.arc(w / 2, h / 2, 78, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = b; g.beginPath(); g.arc(w / 2, h / 2, 70, 0, 7); g.fill(); g.fillStyle = s; g.font = '800 54px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(val, w / 2, h / 2 + 3);});
  return [new THREE.MeshStandardMaterial({map: side, roughness: 0.35}), new THREE.MeshStandardMaterial({map: top, roughness: 0.35}), new THREE.MeshStandardMaterial({map: top, roughness: 0.35})];});
const chipG = new THREE.CylinderGeometry(0.195, 0.195, 0.034, 40);
const stack = (x, z, n, ci, wob = 0.012) => {for (let i = 0; i < n; i++) {const c = add(scene, chipG, chipM[ci], x + (R() - 0.5) * wob, 0.017 + i * 0.0345, z + (R() - 0.5) * wob); c.rotation.y = R() * 6;}};
[[-2.6, -0.75, 14, 0], [-2.98, -0.32, 9, 3], [-2.25, -1.08, 6, 4], [-3.0, -1.12, 17, 2], [-2.7, 1.32, 8, 2], [-2.22, 1.6, 3, 5],
  [3.15, 1.25, 12, 1], [2.72, 1.55, 7, 5], [3.28, -0.3, 15, 4], [2.12, 1.62, 4, 3]].forEach(([x, z, n, c]) => stack(x, z, n, c));
for (let i = 0; i < 5; i++) {const c = add(scene, chipG, chipM[i % 6], -1.75 + i * 0.3 + (R() - 0.5) * 0.06, 0.017, 2.12 + (R() - 0.5) * 0.08); c.rotation.set((R() - 0.5) * 0.05, R() * 6, 0);}
{const t = tex(256, 256, (g, w, h) => {g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.strokeStyle = '#18181d'; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h / 2, 104, 0, 7); g.stroke();
    g.fillStyle = '#18181d'; g.font = '800 46px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DEALER', w / 2, h / 2 + 2);});
  const m = new THREE.MeshStandardMaterial({color: 0xf4f2ec, roughness: 0.3}); add(scene, new THREE.CylinderGeometry(0.24, 0.24, 0.06, 48), [m, new THREE.MeshStandardMaterial({map: t, roughness: 0.3}), m], 1.42, 0.03, 1.98);}
{const box = new THREE.Group(); scene.add(box); box.position.set(1.5, 0, -1.4); box.rotation.y = 0.45;
  const face = tex(512, 716, (g, w, h) => {drawBack(g, w, h, {bg: '#1b2a55', line: 'rgba(212,168,76,0.22)', accent: '#d4a84c', edge: '#1b2a55'}); g.fillStyle = '#d4a84c'; g.font = '800 64px "Inter Tight"'; g.textAlign = 'center'; g.fillText('PLAYING CARDS', w / 2, 120);});
  const sideM = std(0x1b2a55, {roughness: 0.4}), m = [sideM, sideM, new THREE.MeshStandardMaterial({map: face, roughness: 0.4}), sideM, sideM, sideM];
  add(box, new RoundedBoxGeometry(0.67, 0.2, 0.93, 3, 0.012), m, 0, 0.1, 0);
  const flap = add(box, new THREE.BoxGeometry(0.66, 0.008, 0.2), sideM, 0, 0.24, -0.55); flap.rotation.x = -0.5;}
{const glassM = new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.04, transmission: 1, thickness: 0.06, ior: 1.5, metalness: 0, transparent: true});
  const prof = [[0, 0], [0.31, 0], [0.33, 0.02], [0.34, 0.86], [0.32, 0.86], [0.31, 0.1], [0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y));
  const gx = 2.75, gz = -1.85; add(scene, new THREE.CylinderGeometry(0.42, 0.42, 0.02, 48), std(0x2a2420, {roughness: 0.7}), gx, 0.01, gz);
  add(scene, new THREE.LatheGeometry(prof, 64), glassM, gx, 0.02, gz);
  add(scene, new THREE.CylinderGeometry(0.305, 0.305, 0.3, 48), new THREE.MeshPhysicalMaterial({color: 0xc06a1c, roughness: 0.1, transmission: 0.55, thickness: 0.3, transparent: true, opacity: 0.92}), gx, 0.27, gz, false);
  for (const [dx, dz, ry] of [[-0.08, 0.04, 0.4], [0.1, -0.06, 1.1]]) {const c = add(scene, new RoundedBoxGeometry(0.2, 0.18, 0.2, 3, 0.03), new THREE.MeshPhysicalMaterial({color: 0xe8f4ff, roughness: 0.15, transmission: 0.9, thickness: 0.2}), gx + dx, 0.42, gz + dz, false); c.rotation.set(0.3, ry, 0.2);}}

// ------------------------------------------------------------------ desk globe (left station): antique sea, parchment continents, brass meridian, walnut foot, engraved plaque
const LAND = [
  [[-168, 66], [-162, 70], [-150, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 70], [-80, 63], [-90, 58], [-94, 58], [-82, 52], [-78, 57], [-65, 60], [-60, 55], [-56, 52], [-66, 45], [-70, 43], [-76, 38], [-76, 35], [-81, 31], [-80, 25],
    [-82, 29], [-85, 30], [-90, 29], [-97, 27], [-97, 22], [-92, 18], [-88, 21], [-87, 16], [-83, 10], [-79, 9], [-77, 8], [-80, 7], [-85, 11], [-88, 13], [-92, 14], [-96, 16], [-105, 20], [-110, 24], [-112, 29], [-115, 30], [-117, 33], [-121, 35], [-124, 40],
    [-124, 46], [-123, 49], [-130, 54], [-135, 58], [-142, 60], [-150, 60], [-155, 58], [-160, 58], [-165, 61], [-166, 64]],
  [[-77, 8], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-40, -21], [-45, -23], [-48, -26], [-53, -33], [-57, -37], [-62, -39], [-65, -42], [-66, -47], [-69, -51], [-68, -55], [-72, -53], [-75, -48], [-74, -42], [-73, -37],
    [-71, -30], [-70, -18], [-75, -15], [-80, -6], [-81, -3], [-80, 0], [-78, 3], [-77, 6]],
  [[-10, 36], [-9, 43], [-2, 43], [-1, 46], [-5, 48], [0, 50], [5, 53], [8, 57], [5, 60], [5, 62], [12, 66], [18, 70], [25, 71], [30, 70], [40, 68], [45, 68], [55, 70], [60, 70], [70, 73], [80, 73], [90, 76], [100, 77], [110, 76], [120, 73], [130, 71], [140, 72],
    [150, 71], [160, 70], [170, 70], [180, 68], [180, 65], [175, 62], [165, 60], [160, 55], [157, 51], [155, 57], [150, 59], [142, 59], [138, 55], [140, 48], [135, 43], [130, 42], [127, 39], [126, 35], [121, 37], [122, 31], [121, 28], [117, 24], [110, 21],
    [108, 17], [109, 12], [105, 9], [103, 10], [100, 13], [100, 7], [103, 1], [98, 8], [98, 16], [94, 17], [92, 22], [88, 22], [85, 20], [80, 15], [78, 8], [76, 10], [73, 18], [72, 21], [67, 24], [62, 25], [57, 26], [55, 22], [59, 22], [52, 16], [45, 13], [43, 15],
    [39, 21], [35, 28], [33, 31], [35, 36], [30, 36], [27, 37], [26, 40], [23, 40], [24, 37], [22, 37], [20, 40], [19, 42], [13, 45], [16, 41], [18, 40], [16, 38], [12, 38], [10, 44], [7, 43], [3, 43], [3, 42], [0, 39], [-1, 37], [-6, 36]],
  [[-17, 21], [-16, 28], [-10, 30], [-6, 36], [0, 36], [10, 37], [11, 33], [20, 32], [30, 31], [32, 31], [34, 28], [38, 20], [43, 12], [51, 12], [51, 10], [48, 5], [43, 0], [40, -5], [39, -10], [40, -15], [35, -20], [35, -24], [32, -29], [27, -34], [20, -35],
    [18, -32], [15, -26], [12, -17], [13, -10], [12, -5], [9, -1], [9, 4], [5, 6], [-2, 5], [-8, 4], [-13, 8], [-17, 13], [-17, 17]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
  [[114, -22], [115, -34], [118, -35], [124, -33], [132, -32], [138, -35], [141, -38], [146, -39], [150, -37], [153, -32], [153, -25], [150, -22], [146, -19], [142, -11], [141, -17], [136, -12], [131, -11], [126, -14], [122, -18]],
  [[-73, 78], [-60, 82], [-35, 83], [-20, 80], [-20, 72], [-30, 68], [-42, 60], [-50, 63], [-55, 70], [-62, 76]],
  [[-5, 50], [1, 51], [2, 53], [-2, 56], [-5, 58], [-6, 56], [-3, 54], [-5, 52]], [[-10, 52], [-6, 52], [-6, 55], [-10, 54]], [[-24, 64], [-14, 64], [-14, 66], [-22, 66]],
  [[130, 31], [132, 34], [136, 34], [141, 36], [142, 40], [141, 43], [145, 44], [141, 45], [140, 40], [136, 36], [131, 34]],
  [[95, 5], [106, -6], [104, -6], [95, 2]], [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]], [[131, -1], [141, -3], [150, -10], [141, -9], [135, -4]],
  [[172, -35], [178, -38], [174, -41], [171, -45], [167, -46], [172, -41]], [[-85, 22], [-74, 20], [-77, 21], [-84, 23]],
  [...Array.from({length: 37}, (_, i) => [-180 + i * 10, -68 - 4 * Math.sin(i * 1.3) - 3 * Math.sin(i * 0.5)]), [180, -90], [-180, -90]]];
const globeT = tex(2048, 1024, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1c3440'); gr.addColorStop(0.5, '#2b5262'); gr.addColorStop(1, '#1c3440'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  noise(g, w, h, 40000, 0.06, ['rgba(255,255,255,A)', 'rgba(0,0,0,A)']);
  const X = lo => (lo + 180) / 360 * w, Y = la => (90 - la) / 180 * h;
  g.strokeStyle = 'rgba(214,186,120,0.3)'; g.lineWidth = 1.6; for (let lo = -180; lo <= 180; lo += 15) {g.beginPath(); g.moveTo(X(lo), 0); g.lineTo(X(lo), h); g.stroke();}
  for (let la = -75; la <= 75; la += 15) {g.beginPath(); g.moveTo(0, Y(la)); g.lineTo(w, Y(la)); g.stroke();}
  g.strokeStyle = 'rgba(214,186,120,0.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, Y(0)); g.lineTo(w, Y(0)); g.stroke();
  g.setLineDash([10, 8]); g.lineWidth = 2; for (const la of [23.4, -23.4]) {g.beginPath(); g.moveTo(0, Y(la)); g.lineTo(w, Y(la)); g.stroke();} g.setLineDash([]);
  for (const poly of LAND) {g.beginPath(); poly.forEach(([lo, la], i) => i ? g.lineTo(X(lo), Y(la)) : g.moveTo(X(lo), Y(la))); g.closePath();
    g.fillStyle = '#e2cf9f'; g.fill(); g.strokeStyle = 'rgba(92,60,28,0.85)'; g.lineWidth = 2.6; g.stroke();
    g.save(); g.clip(); g.strokeStyle = 'rgba(150,110,60,0.25)'; g.lineWidth = 7; g.stroke(); g.restore();}
  g.fillStyle = 'rgba(232,214,170,0.55)'; g.font = 'italic 600 30px "Inter Tight"'; g.textAlign = 'center'; g.letterSpacing = '9px';
  [['ATLANTIK', -38, 22], ['PAZIFIK', -140, 8], ['INDISCHER OZEAN', 78, -24]].forEach(([s, lo, la]) => g.fillText(s, X(lo), Y(la))); g.letterSpacing = '0px';});
const GX = -2.1, GZ = 0.35, GR = 0.46, GY = 0.96;
const globe = new THREE.Group(); globe.position.set(GX, 0, GZ); globe.rotation.y = 0.95; scene.add(globe);
add(globe, new THREE.CylinderGeometry(0.29, 0.33, 0.08, 56), walnut, 0, 0.04, 0);
add(globe, new THREE.CylinderGeometry(0.2, 0.24, 0.035, 48), brass, 0, 0.098, 0);
add(globe, new THREE.CylinderGeometry(0.022, 0.034, GY - GR - 0.04 - 0.11, 16), brass, 0, 0.11 + (GY - GR - 0.04 - 0.11) / 2, 0);
add(globe, new THREE.SphereGeometry(0.045, 20, 14), brass, 0, GY - GR - 0.05, 0);
add(globe, new THREE.TorusGeometry(GR + 0.035, 0.012, 12, 120), brass, 0, GY, 0);
const tilt = new THREE.Group(); tilt.position.set(0, GY, 0); tilt.rotation.z = 23.4 * PI / 180; globe.add(tilt);
const sphere = add(tilt, new THREE.SphereGeometry(GR, 96, 64), new THREE.MeshPhysicalMaterial({map: globeT, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2}));
for (const sy of [-1, 1]) add(tilt, new THREE.CylinderGeometry(0.012, 0.012, 0.07, 10), brass, 0, sy * (GR + 0.02), 0);
{const pl = tex(512, 128, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e2c27c'); gr.addColorStop(0.5, '#b98d45'); gr.addColorStop(1, '#8a6730'); g.fillStyle = gr; rr(g, 2, 2, w - 4, h - 4, 14); g.fill();
    g.strokeStyle = 'rgba(60,40,15,0.6)'; g.lineWidth = 3; rr(g, 10, 10, w - 20, h - 20, 9); g.stroke(); g.fillStyle = '#3a2810'; g.font = '800 40px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('ERDE · RUND 10⁵⁰ ATOME', w / 2, h / 2 + 2);});
  const plaque = add(scene, new THREE.PlaneGeometry(0.42, 0.105), new THREE.MeshStandardMaterial({map: pl, roughness: 0.3, metalness: 0.6}), GX + 0.02, 0.05, GZ + 0.345, false);
  plaque.rotation.x = -0.55;}

// ------------------------------------------------------------------ shuffle counter next to the second deck: small desk flip counter „GEMISCHT … MAL“
const CNT = new THREE.Group(); CNT.position.set(2.55, 0, -0.76); CNT.rotation.y = -0.1; scene.add(CNT);   // on four brass legs so the riffling halves never cover it
add(CNT, new RoundedBoxGeometry(0.66, 0.58, 0.24, 3, 0.03), std(0x0c0c0e, {roughness: 0.3, metalness: 0.5}), 0, 0.42, 0);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {add(CNT, new THREE.CylinderGeometry(0.016, 0.02, 0.13, 10), brass, sx * 0.26, 0.065, sz * 0.08); add(CNT, new THREE.SphereGeometry(0.026, 12, 8), brass, sx * 0.26, 0.012, sz * 0.08);}
const cntC = document.createElement('canvas'); cntC.width = 512; cntC.height = 446; const cntG = cntC.getContext('2d'); const cntT = new THREE.CanvasTexture(cntC); cntT.colorSpace = THREE.SRGBColorSpace; cntT.anisotropy = 8;
add(CNT, new THREE.PlaneGeometry(0.6, 0.523), new THREE.MeshStandardMaterial({map: cntT, roughness: 0.45, emissive: 0xffffff, emissiveMap: cntT, emissiveIntensity: 0.18}), 0, 0.42, 0.121, false);
function drawCounter(v) {const g = cntG, w = 512, h = 446; g.fillStyle = '#0b0b0d'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d4a84c'; g.font = '600 40px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '8px'; g.fillText('GEMISCHT', w / 2 + 4, 50); g.fillText('MAL', w / 2 + 4, 404); g.letterSpacing = '0px';
  const n = shuffles(v), x = 151, y = 92, ww = 210, hh = 262; let tc = -1; for (let k = 0; k < 7; k++) {const t = RIF[k][0] + RIF[k][1] * 0.982; if (v >= t && v < t + 0.2) tc = t;}
  g.fillStyle = '#1d1d21'; rr(g, x, y, ww, hh, 12); g.fill(); g.fillStyle = '#18181c'; rr(g, x, y + hh / 2, ww, hh / 2, [0, 0, 12, 12]); g.fill();
  const u = tc < 0 ? 1 : (v - tc) / 0.2, ch = String(u < 0.5 && tc >= 0 ? n - 1 : n);
  g.save(); rr(g, x, y, ww, hh, 12); g.clip(); g.font = '800 200px "Inter Tight"'; g.fillStyle = '#f3efe6'; g.translate(x + ww / 2, y + hh / 2 + 8); g.scale(1, Math.max(0.06, Math.abs(Math.cos(PI * u)))); g.fillText(ch, 0, 0); g.restore();
  g.fillStyle = '#050506'; g.fillRect(x, y + hh / 2 - 2, ww, 4); g.fillStyle = '#2c2c31'; for (const sx of [x + 3, x + ww - 11]) g.fillRect(sx, y + hh / 2 - 8, 8, 16);
  cntT.needsUpdate = true;}

// ------------------------------------------------------------------ pendant lamp with light cone and dust, focus light that follows the station being shown
const LAMP = V3(0, 6.6, 0.3);
{const shade = new THREE.Group(); shade.position.copy(LAMP); scene.add(shade);
  add(shade, new THREE.CylinderGeometry(0.35, 1.25, 0.9, 64, 1, true), new THREE.MeshStandardMaterial({color: 0x111113, roughness: 0.35, metalness: 0.6, side: THREE.DoubleSide}), 0, 0, 0, false);
  add(shade, new THREE.CylinderGeometry(0.34, 1.23, 0.88, 64, 1, true), new THREE.MeshStandardMaterial({color: 0xd9a35a, emissive: 0xffc878, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.8, side: THREE.BackSide}), 0, 0, 0, false);
  add(shade, new THREE.SphereGeometry(0.26, 24, 16), new THREE.MeshBasicMaterial({color: new THREE.Color(0xffe1b0).multiplyScalar(4)}), 0, -0.3, 0, false);
  add(shade, new THREE.CylinderGeometry(0.012, 0.012, 8, 8), std(0x111111), 0, 4.4, 0, false);
  const coneT = tex(64, 256, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,220,170,0.9)'); gr.addColorStop(0.6, 'rgba(255,210,160,0.25)'); gr.addColorStop(1, 'rgba(255,210,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);});
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 4.2, 6.4, 64, 1, true), new THREE.MeshBasicMaterial({map: coneT, transparent: true, opacity: 0.075, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide}));
  cone.position.set(0, -3.4, 0); shade.add(cone);}
const spot = new THREE.SpotLight(0xffd6a0, 30, 16, 0.62, 0.75, 1.6); spot.position.copy(LAMP).add(V3(0, -0.35, 0)); spot.target.position.set(0, 0, 0.4);
spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.00015; spot.shadow.normalBias = 0.01; spot.shadow.radius = 4; scene.add(spot, spot.target);
scene.add(new THREE.HemisphereLight(0x33424d, 0x120d09, 0.35));
const rim = new THREE.DirectionalLight(0x5fd0c0, 0.9); rim.position.set(-5, 4, -7); scene.add(rim);
const fill = new THREE.DirectionalLight(0xffe6c8, 0.2); fill.position.set(4, 3, 8); scene.add(fill);
const focus = new THREE.SpotLight(0xffe4c4, 0, 9, 0.4, 0.9, 1.6); scene.add(focus, focus.target);
const dust = (() => {const n = 420, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), seed = []; for (let i = 0; i < n; i++) {const r = Math.sqrt(R()) * 2.6, a = R() * 7, y = 0.4 + R() * 5.6; seed.push([r, a, y, R()]);}
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const dot = tex(32, 32, (c, w, h) => {const gr = c.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,240,215,1)'); gr.addColorStop(1, 'rgba(255,240,215,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);});
  const pts = new THREE.Points(g, new THREE.PointsMaterial({size: 0.035, map: dot, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false})); scene.add(pts);
  return v => {seed.forEach(([r, a, y, s], i) => {const rr2 = r * (0.4 + y / 6.6 * 0.6); p[i * 3] = Math.cos(a + v * 0.05 * (s - 0.5)) * rr2 + Math.sin(v * 0.3 + i) * 0.05; p[i * 3 + 1] = y + Math.sin(v * 0.2 + i * 1.7) * 0.12; p[i * 3 + 2] = 0.3 + Math.sin(a + v * 0.05 * (s - 0.5)) * rr2;}); g.attributes.position.needsUpdate = true;};})();

// ------------------------------------------------------------------ back wall: wood slats, LED strip, split-flap board, bottle shelves, bokeh lights
const WZ = -5.2;
add(scene, new THREE.PlaneGeometry(40, 20), std(0x141215, {roughness: 0.9}), 0, 2, WZ - 0.1, false);
{const slat = new THREE.BoxGeometry(0.16, 9, 0.12), m = new THREE.MeshStandardMaterial({map: woodT, roughness: 0.55, color: 0x8a6a55}); const im = new THREE.InstancedMesh(slat, m, 70); const o = new THREE.Object3D();
  for (let i = 0; i < 70; i++) {o.position.set(-12.25 + i * 0.35, 2.4, WZ); o.updateMatrix(); im.setMatrixAt(i, o.matrix);} im.receiveShadow = true; scene.add(im);
  add(scene, new THREE.BoxGeometry(24, 0.05, 0.05), new THREE.MeshBasicMaterial({color: new THREE.Color(0xffc27a).multiplyScalar(3)}), 0, 6.9, WZ + 0.12, false);}
const BW = 2.7, BH = 2.95, BY = 2.35, BZ = WZ + 0.35;
const boardC = document.createElement('canvas'); boardC.width = 1024; boardC.height = 1118; const boardG = boardC.getContext('2d'); const boardT = new THREE.CanvasTexture(boardC); boardT.colorSpace = THREE.SRGBColorSpace; boardT.anisotropy = 8;
const labA = new THREE.MeshBasicMaterial({transparent: true}), labB = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
{add(scene, new RoundedBoxGeometry(BW + 0.26, BH + 0.62, 0.22, 3, 0.04), std(0x0c0c0e, {roughness: 0.3, metalness: 0.5}), 0, BY + 0.18, BZ - 0.1, false);
  add(scene, new THREE.PlaneGeometry(BW, BH), new THREE.MeshStandardMaterial({map: boardT, roughness: 0.5, emissive: 0xffffff, emissiveMap: boardT, emissiveIntensity: 0.25}), 0, BY, BZ + 0.015, false);
  const lab = s => tex(1024, 96, (g, w, h) => {g.fillStyle = '#0c0c0e'; g.fillRect(0, 0, w, h); g.fillStyle = '#d4a84c'; g.font = '600 40px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '8px'; g.fillText(s, w / 2, h / 2 + 2);});
  labA.map = lab('MÖGLICHE REIHENFOLGEN'); labB.map = lab('GEDANKENEXPERIMENT');
  add(scene, new THREE.PlaneGeometry(BW, BW * 96 / 1024), labA, 0, BY + BH / 2 + 0.2, BZ + 0.016, false);
  add(scene, new THREE.PlaneGeometry(BW, BW * 96 / 1024), labB, 0, BY + BH / 2 + 0.2, BZ + 0.018, false);
  for (const sx of [-1, 1]) {const arm = new THREE.Group(); arm.position.set(sx * 0.9, BY + BH / 2 + 0.55, BZ + 0.05); scene.add(arm); add(arm, new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), std(0x18181a), 0, 0, 0.25, false).rotation.x = PI / 2;
    const hd = add(arm, new THREE.CylinderGeometry(0.07, 0.1, 0.22, 20), std(0x18181a, {metalness: 0.6, roughness: 0.3}), 0, -0.06, 0.52, false); hd.rotation.x = 0.9;
    const bs = new THREE.SpotLight(0xffe2b8, 18, 6, 0.6, 0.6, 1.5); bs.position.set(sx * 0.9, BY + BH / 2 + 0.4, BZ + 0.6); bs.target.position.set(sx * 0.6, BY, BZ); scene.add(bs, bs.target);}}
const bottleProf = [[0, 0], [0.16, 0], [0.17, 0.02], [0.17, 0.62], [0.12, 0.74], [0.055, 0.8], [0.05, 1.0], [0.06, 1.02], [0, 1.02]].map(([x, y]) => new THREE.Vector2(x, y));
const bottleG = new THREE.LatheGeometry(bottleProf, 28), BCOL = [0x5a3a1a, 0x2f5a3a, 0x8a5a20, 0x223a5a, 0x6a2030, 0xb08a40, 0x3a3a3a];
for (const sx of [-1, 1]) for (let row = 0; row < 3; row++) {const y = 0.9 + row * 1.5, x0 = sx * 2.6, xs = sx * 5.6;
  add(scene, new THREE.BoxGeometry(3.4, 0.06, 0.5), std(0x2a1d16, {map: woodT}), (x0 + xs) / 2, y, WZ + 0.3, false);
  add(scene, new THREE.BoxGeometry(3.4, 0.03, 0.03), new THREE.MeshBasicMaterial({color: new THREE.Color(0xffb46a).multiplyScalar(2.2)}), (x0 + xs) / 2, y - 0.05, WZ + 0.52, false);
  for (let i = 0; i < 7; i++) {const b = add(scene, bottleG, new THREE.MeshPhysicalMaterial({color: BCOL[(i + row * 3) % BCOL.length], roughness: 0.15, metalness: 0, clearcoat: 1, emissive: BCOL[(i + row) % BCOL.length], emissiveIntensity: 0.25}), x0 + sx * (0.3 + i * 0.44), y + 0.03, WZ + 0.3, false);
    b.scale.setScalar(0.8 + R() * 0.45);}}
{const n = 70, dot = tex(64, 64, (c, w, h) => {const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.75, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);});
  for (let i = 0; i < n; i++) {const s = new THREE.Sprite(new THREE.SpriteMaterial({map: dot, color: [0xffc070, 0xff9a50, 0x7fe0d0, 0xffe0b0][i % 4], transparent: true, opacity: 0.35 + R() * 0.4, blending: THREE.AdditiveBlending, depthWrite: false}));
    const sx = R() < 0.5 ? -1 : 1; s.position.set(sx * (3 + R() * 9), 0.6 + R() * 6, WZ - 1 - R() * 5); s.scale.setScalar(0.08 + R() * 0.12); scene.add(s);}}

// ------------------------------------------------------------------ the board: first 52! (68 digits), then the thought experiment (games shuffled, none twice)
const A0 = 9.9, SW0 = 21.0, C0 = 22.0, C1 = 25.8, D0 = 27.6, D1 = 28.3, LEAD = 72 - 68;
const FINAL = '35677' + '29481603752940618357204'.slice(0, 23), P_END = Math.log10(3.5677e27);
const SPIN = 'ABCDEFGHIJKLMNOPRSTUVWZ0123456789';
const spinCh = (n, t) => SPIN[Math.abs(Math.floor(t * 22 + n * 0.37)) % SPIN.length];
function counter(t) {if (t < C0) return '0'.padStart(36, ' '); if (t >= C1) return FINAL.padStart(36, ' ');
  const u = (t - C0) / (C1 - C0), p = P_END * (1 - (1 - u) * (1 - u)), e = Math.floor(p), m = Math.pow(10, p - e).toFixed(6).replace('.', ''), f = Math.floor(t * 30);
  let s = ''; for (let i = 0; i <= e; i++) s += i < 7 ? m[i] : String((i * 7919 + f * 104729 + i * f * 31) % 10); return s.padStart(36, ' ');}
function charA(n, t) {const i = n - LEAD; if (i < 0 || t < A0) return ' '; const stop = A0 + 0.3 + i * 0.024 + (i % 5) * 0.05; return t >= stop ? BIG[i] : String(Math.floor((t - A0) * 22 + i * 0.37) % 10);}
function charB(n, t) {const r = Math.floor(n / 9), c = n % 9;
  if (r === 0) return 'GEMISCHT:'[c];
  if (r >= 1 && r <= 4) return counter(t)[n - 9];
  if (r === 6) {const ch = 'DOPPELT: '[c], tc = D0 + c * 0.04; return ch === ' ' || t < tc ? ' ' : t < tc + 0.3 ? spinCh(n, t) : ch;}
  if (r === 7 && c === 8) return t < D1 ? ' ' : t < D1 + 0.3 ? String(Math.floor(t * 22) % 10) : '0';
  return ' ';}
function cellChar(n, t) {const ts = SW0 + (n % 9) * 0.035 + Math.floor(n / 9) * 0.06; if (t < ts) return charA(n, t);
  if (t < ts + 0.4) return (charA(n, ts) === ' ' && charB(n, ts + 0.4) === ' ') ? ' ' : spinCh(n, t); return charB(n, t);}
function drawBoard(v) {const g = boardG, w = 1024, h = 1118, cols = 9, rows = 8, pad = 16, gap = 12, cw = (w - pad * 2 - gap * 2) / cols, ch = (h - pad * 2) / rows;
  g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, w, h);
  for (let n = 0; n < cols * rows; n++) {const c = n % cols, r = Math.floor(n / cols), x = pad + c * cw + Math.floor(c / 3) * gap + 3, y = pad + r * ch + 4, ww = cw - 6, hh = ch - 8;
    g.fillStyle = '#1d1d21'; rr(g, x, y, ww, hh, 7); g.fill(); g.fillStyle = '#18181c'; rr(g, x, y + hh / 2, ww, hh / 2, [0, 0, 7, 7]); g.fill();
    g.fillStyle = '#050506'; g.fillRect(x, y + hh / 2 - 1.5, ww, 3); g.fillStyle = '#2c2c31'; for (const sx of [x + 2, x + ww - 7]) g.fillRect(sx, y + hh / 2 - 5, 5, 10);
    const a = cellChar(n, v); if (a === ' ') continue; const moving = a !== cellChar(n, v - 0.1), fl = (v * 22 + n * 0.37) % 1;
    const hot = v >= SW0 + 0.5 && r === 7 && c === 8;
    g.save(); rr(g, x, y, ww, hh, 7); g.clip(); g.font = `800 ${Math.round(hh * 0.72)}px "Inter Tight"`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = hot ? '#f3d27a' : (v >= SW0 + 0.5 && (r === 0 || r === 6)) ? '#d4a84c' : '#f3efe6';
    g.translate(x + ww / 2, y + hh / 2 + 3); if (moving) g.scale(1, Math.max(0.08, Math.abs(Math.cos(PI * fl)))); g.fillText(a, 0, 0); g.restore();
    g.fillStyle = '#050506'; g.fillRect(x, y + hh / 2 - 1.5, ww, 3);}
  boardT.needsUpdate = true;}

// ------------------------------------------------------------------ camera keys [t, tx, ty, tz, dist, azimuth°, elevation°, focus light, aperture]
const G0 = [GX, 0.7, GZ], K2 = [D2.x, 0.2, D2.z - 0.4];
const CAM = [[0, 0, 0.1, 0.15, 6.3, 0, 15, 0, 0.0028], [2.7, 0, 0.12, 0.15, 5.6, 4, 17, 0, 0.0028], [3.9, 0, 0.12, 0.15, 5.8, 6, 20, 0, 0.0028], [4.9, 0, 0.3, 0.4, 6.6, 4, 36, 0, 0.0026],
  [5.6, 0, 0.0, 0.7, 7.6, 6, 56, 0, 0.0024], [6.8, 0, 0.0, 0.7, 6.9, -10, 60, 0, 0.0024], [8.3, 0, 0.0, 0.7, 6.6, -22, 52, 0, 0.0024],
  [9.6, 0, BY + 0.12, BZ, 14.4, 0, 4, 0, 0.0016], [14.3, 0, BY + 0.12, BZ, 13.4, 4, 3, 0, 0.0016],
  [15.5, ...G0, 5.3, -10, 13, 7, 0.0024], [20.0, ...G0, 4.8, 8, 15, 7, 0.0024],
  [21.2, 0, BY + 0.12, BZ, 14.0, -3, 4, 0, 0.0016], [30.1, 0, BY + 0.12, BZ, 13.2, 3, 3, 0, 0.0016],
  [31.2, ...K2, 6.0, 8, 27, 5, 0.0024], [37.3, ...K2, 5.5, -5, 25, 5, 0.0024],
  [39.0, 0, 1.0, -1.2, 22, -2, 16, 0, 0.0011], [END + 0.1, 0, 1.0, -1.2, 21, 2, 15, 0, 0.0011]];
const camAt = camPath(cam, CAM);
const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
const bokeh = new BokehPass(scene, cam, {focus: 6, aperture: 0.0028, maxblur: 0.009}); composer.addPass(bokeh);
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.22, 0.5, 0.95));
composer.addPass(new OutputPass()); const grade = new ShaderPass(GRADE); composer.addPass(grade);

// ------------------------------------------------------------------ texts (subtitles from the word times of take 1)
const SUBG = ['Wenn du ein Kartenspiel richtig gut mischst,', 'hältst du ziemlich sicher eine Reihenfolge in der Hand,', 'die es noch nie gegeben hat.',
  'Zweiundfünfzig Karten lassen sich auf so viele Arten hintereinanderlegen,', 'dass man ungefähr eine Acht mit siebenundsechzig Nullen schreiben müsste.',
  'Das sind rund sechshundert Billiarden Mal mehr Möglichkeiten,', 'als die ganze Erde Atome hat.', 'Stell dir vor, acht Milliarden Menschen hätten seit dem Urknall', 'jede Sekunde ein Kartenspiel gemischt.',
  'Selbst dann wäre mit großer Sicherheit', 'noch keine Reihenfolge doppelt vorgekommen.', 'Das gilt aber nur, wenn du gut mischst.', 'Mathematiker haben ausgerechnet,',
  'dass man ein Kartenspiel dafür etwa siebenmal mischen muss.', 'Wie oft mischst du?', 'Schreib’s in die Kommentare.'];
const SHOW = {'Zweiundfünfzig': '52', 'siebenundsechzig': '67', 'sechshundert': '600', 'acht Milliarden': '8 Milliarden'};
const SUBS = []; {const wn = WORDS.filter(w => !w.text.startsWith('[') && !w.text.endsWith(']')); let i = 0;
  SUBG.forEach(s => {const n = s.split(' ').length; let txt = s; for (const [k, r] of Object.entries(SHOW)) txt = txt.replace(k, r); SUBS.push([wn[i].start + VO - 0.05, wn[i + n - 1].end + VO + 0.25, txt]); i += n;});
  for (let k = 0; k < SUBS.length - 1; k++) SUBS[k][1] = Math.min(SUBS[k][1], SUBS[k + 1][0]); SUBS[SUBS.length - 1][1] = OUT0;}
const TEXT = {
  TITLES: [[0, 4.6, 'Diese Reihenfolge<br>gab es noch nie.'], [38.1, OUT0, 'Wie oft mischst du?']],
  NUMS: [[5.0, 9.3, '52', 'Karten, und jede Reihenfolge ist möglich'], [11.15, 14.95, '8 × 10<sup>67</sup>', 'Möglichkeiten, 52 Karten zu ordnen. Ausgeschrieben hat die Zahl 68 Stellen.'],
    [15.2, 20.15, '<span class="mid">600 Billiarden</span>', 'Mal mehr Möglichkeiten, als die Erde Atome hat (etwa 1,3 × 10<sup>50</sup>)'],
    [21.4, 26.1, '8 Mrd.', 'Menschen mischen seit dem Urknall jede Sekunde ein Kartenspiel'], [28.2, 30.6, '0', 'Reihenfolgen doppelt. Die Chance dafür liegt bei etwa 1 zu 13 Billionen.'],
    [36.8, 38.0, '7-mal', 'mischen, dann ist die Reihenfolge wirklich zufällig']],
  SUBS,
  SRCS: [[0.2, 14.95, 'Kombinatorik: 52! = 8,07 × 10⁶⁷ · Modell vereinfacht'], [15.0, 20.2, 'Atome der Erde ≈ 1,33 × 10⁵⁰ (Jefferson Lab) · Modell vereinfacht'],
    [20.3, 30.65, 'Gedankenexperiment: 8,2 Mrd. Menschen (UN 2024), 13,8 Mrd. Jahre (Planck 2018) · Modell vereinfacht'], [30.7, OUT0, 'Bayer & Diaconis 1992: sieben Riffle-Mischungen · Modell vereinfacht']]};
const ov = overlays(TEXT), ovEl = document.getElementById('ov');

// ------------------------------------------------------------------ outro (2D like the clay videos): the picture dims to about 72 %, „function“ letter by letter, the red dot pops in
const endG = document.getElementById('end').getContext('2d');
const LOGO_FS = 170, LOGO_Y = 1010;
endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px';
const LW = endG.measureText('function').width, DW = endG.measureText('.').width, DOT = endG.measureText('.');
const LX = W / 2 - (LW + DW) / 2, DOTX = LX + LW + (DOT.actualBoundingBoxRight - DOT.actualBoundingBoxLeft) / 2, DOTR = (DOT.actualBoundingBoxAscent + DOT.actualBoundingBoxDescent) / 2, DOTY = LOGO_Y - DOT.actualBoundingBoxAscent + DOTR;
const LETX = []; {let x = LX; for (const ch of 'function') {LETX.push(x); x = LX + endG.measureText('function'.slice(0, LETX.length)).width;}}
function outro(v) {const u = v - OUT0; endG.clearRect(0, 0, W, H); if (u < 0) return;
  const f = sm(seg(u, 0, 0.45)), bg = endG.createRadialGradient(W / 2, 980, 60, W / 2, 980, 1250);
  bg.addColorStop(0, '#221b15'); bg.addColorStop(0.55, '#14100d'); bg.addColorStop(1, '#060505');
  endG.globalAlpha = 0.72 * f; endG.fillStyle = bg; endG.fillRect(0, 0, W, H); endG.globalAlpha = 1;
  {const g = endG.createRadialGradient(W / 2, LOGO_Y - 55, 40, W / 2, LOGO_Y - 55, 560); g.addColorStop(0, `rgba(8,6,5,${0.4 * f})`); g.addColorStop(1, 'rgba(8,6,5,0)'); endG.fillStyle = g; endG.fillRect(0, 0, W, H);}
  const dp = back(seg(u, 1.28, 1.62)), land = seg(u, 1.28, 1.62), sq = land > 0 && land < 1 ? Math.sin(PI * land) * 0.18 : 0;
  if (dp > 0) {endG.save(); endG.fillStyle = '#E01E2B'; endG.beginPath(); endG.ellipse(DOTX, DOTY, DOTR * dp * (1 + sq), DOTR * dp * (1 - sq), 0, 0, PI * 2); endG.fill(); endG.restore();}
  endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px'; endG.fillStyle = '#E01E2B'; endG.textAlign = 'left'; endG.textBaseline = 'alphabetic';
  'function'.split('').forEach((ch, i) => {const a = sm(seg(u, 0.4 + i * 0.07, 0.85 + i * 0.07)); if (a <= 0) return; endG.save(); endG.globalAlpha = a; endG.fillText(ch, LETX[i], LOGO_Y + (1 - a) * 34); endG.restore();});}

// ------------------------------------------------------------------ frame
let lastBoard = -1, lastCnt = -1;
function update(v) {poseDeck(cards, v, ORIGIN); thread(v); poseDeck(cards2, deck2T(v), D2); dust(v);
  sphere.rotation.y = +(new URLSearchParams(location.search).get('gr') || 3.5) + (v - 17.5) * 0.16;   // Europe and Africa face the camera during the globe shot
  const qv = camAt(v); focus.position.set(qv[1] + 0.7, qv[2] + 3.4, qv[3] + 1.9); focus.target.position.set(qv[1], qv[2], qv[3]); focus.intensity = qv[7];
  bokeh.uniforms.focus.value = qv[4] * 0.98; bokeh.uniforms.aperture.value = qv[8]; grade.uniforms.t.value = v;
  const fb = Math.round(v * 30); if (fb !== lastBoard) {drawBoard(v); lastBoard = fb;}
  if (fb !== lastCnt) {drawCounter(v); lastCnt = fb;}
  const lb = sm(seg(v, SW0 + 0.2, SW0 + 0.6)); labA.opacity = 1 - lb; labB.opacity = lb;
  ov(v); ovEl.style.opacity = 1 - seg(v, OUT0, OUT0 + 0.35); outro(v);}
// collision check (node karten/check_noir.mjs): every card against the small props on the table (axis-aligned boxes, so it errs on the safe side)
const CARDBOX = new THREE.Box3(V3(-0.315, -0.004, -0.44), V3(0.315, 0.004 + 0.03, 0.44));   // a card incl. the strongest bend
window.collide = (f0, f1, step) => {const props = []; scene.traverse(o => {if (!o.isMesh || o.parent === null) return; const isCard = [...cards, ...cards2].some(c => c.G === o.parent); if (isCard || o.material === threadM) return;
    const b = new THREE.Box3().setFromObject(o), s3 = b.getSize(V3(0, 0, 0)); if (b.min.y < -0.02 || b.max.y > 2 || s3.x > 1.2 || s3.z > 1.2 || o.geometry.type === 'TubeGeometry') return; props.push([o, b]);});
  const hits = []; for (let f = f0; f < f1; f += step) {update(f / FPS); for (const c of [...cards, ...cards2]) {c.G.updateMatrixWorld(true); const ob = new OBB().fromBox3(CARDBOX).applyMatrix4(c.G.matrixWorld);
      for (const [o, b] of props) if (ob.intersectsBox3(b)) hits.push([f, c.id, o.geometry.type, b.min.x.toFixed(2), b.min.z.toFixed(2)].join(' '));}}
  return {props: props.length, hits: [...new Set(hits)], n: hits.length};};
window.TOTAL = Math.round(END * FPS);
window.renderFrame = f => {update(f / FPS); composer.render();};
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round((q0 != null ? +q0 : 0) * FPS)); window.ready = true;
