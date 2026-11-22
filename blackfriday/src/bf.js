// „Black Friday: Sind die Rabatte echt?“ im Knete-Look (Wunsch des Nutzers 22.11.2026: zwei kurze Videos, „nicht nur ein Bild, sondern mehrere Szenen“).
// Eine Knetplatte mit fünf Stationen, die Kamera fährt von Station zu Station: A Laden mit dem roten „-50%“-Schild (dreht sich zu „-8%“),
// B Regal, das sich mit 100 Produkten füllt, C fünf Produkte mit Preisschildern vor dem November-Preisverlauf, E Fernseher mit UVP-Trick,
// F großes Handy mit Preisverlauf, am Ende die ganze Platte mit Sprechblase. Rot ist nur das Rabatt-Schild (roter Faden) und das Logo.
// Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 1); im Video beginnt die Stimme bei 0,15 s.
import {THREE, W, H, RED, PI, clamp, lerp, seg, sm, eo, ei, eio, back, popIn, hash, V3, R, renderer, scene, cam, lightRig, tex, add, grp, rbox, clay, redClay, glass, PAL, BODY, T2, fitText,
  decal, text3d, plinth, person, arm, walk, still, tree, fit, boxPts, K, makeCam, makeOverlays, outro, dimLights, mkCoin} from '../../kit/knete_kit.js';

const VO = 0.15, OUT0 = 36.6, END_V = 40.4;
const WORDS = (await (await fetch('voice/words.json')).json()).words;
const S = new THREE.Group(); scene.add(S);
// the stations stand in one row along a shopping street, so no station hides another; the walkway runs in front of them
const XS = [-4.5, -2.25, 0, 2.25, 4.5], ZS = -0.2;
plinth(S, 11.6, 2.9, [[-1, -1], [1, -1], [-1, 1], [1, 1]]);
add(S, rbox(11.2, 0.02, 0.62, 0.01), clay(0xe7dccb, {bumpScale: 2}), 0, 0.01, 0.92);
lightRig(0, 0, 6.2);
const mat = (par, w, d, c) => add(par, rbox(w, 0.03, d, 0.012), clay(c, {bumpScale: 2.6}), 0, 0.015, 0);
for (const [x, z, s] of [[-3.375, -1.12, 0.7], [-1.125, -1.12, 0.65], [1.125, -1.12, 0.7], [3.375, -1.12, 0.65], [-5.45, -0.3, 0.7], [5.45, -0.3, 0.7]]) tree(S, x, z, s);

// ------------------------------------------------------------------ A: the shop with the big red sale sign (-50% turns into -8%)
const A = grp(S, XS[0], 0, ZS); mat(A, 1.85, 1.3, PAL.pink);
add(A, rbox(1.55, 1.05, 0.55, 0.06), clay(PAL.peach), 0, 0.525, -0.3);
decal(A, 0.95, 0.5, tex(760, 400, (g, w, h) => {g.fillStyle = '#cfe6f7'; g.fillRect(0, 0, w, h); g.fillStyle = '#b6d6ee'; g.fillRect(0, h * 0.72, w, h * 0.28);
  [[90, 150, 160, 110, '#5b4a9a'], [300, 190, 120, 90, '#f7dd7c'], [470, 130, 200, 130, '#3e3f5a'], [60, 290, 140, 40, '#f2a7c3'], [320, 300, 160, 40, '#9fe0c6'], [520, 300, 140, 40, '#c4a8f0']].forEach(([x, y, ww, hh, c]) => {g.fillStyle = c; g.beginPath(); g.roundRect(x, y, ww, hh, 12); g.fill();});
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 10; g.beginPath(); g.moveTo(60, 40); g.lineTo(180, 0); g.moveTo(110, 60); g.lineTo(260, 0); g.stroke();}), 0.2, 0.45, -0.023);
add(A, rbox(1.0, 0.06, 0.04, 0.02), clay(PAL.cream), 0.2, 0.17, -0.01);
add(A, rbox(0.3, 0.62, 0.03, 0.03), clay(PAL.deep), -0.52, 0.31, -0.02);
{const aw = grp(A, 0, 0.84, 0.02); aw.rotation.x = 0.55;
  add(aw, rbox(1.55, 0.03, 0.34, 0.012), clay(0xffffff, {map: tex(512, 64, (g, w, h) => {for (let i = 0; i < 8; i++) {g.fillStyle = i % 2 ? '#f3ece0' : '#c4a8f0'; g.fillRect(i * w / 8, 0, w / 8 + 1, h);}})}), 0, 0, 0.17);}
add(A, rbox(1.1, 0.24, 0.06, 0.04), clay(PAL.cream), 0, 1.2, -0.26);
decal(A, 1.0, 0.2, tex(800, 160, (g, w, h) => T2(g, 'SALE  SALE  SALE', w / 2, h / 2 + 4, '800 110px "Inter Tight"', '#5b4a9a')), 0, 1.2, -0.228);
const SIGN = grp(A, 0.38, 0, 0.36); add(SIGN, new THREE.CylinderGeometry(0.2, 0.24, 0.07, 32), clay(PAL.cream), 0, 0.035, 0);
const SIGNR = grp(SIGN, 0, 0.07, 0);
const S50 = text3d(SIGNR, '-50%', 0.3, 0.1, redClay(0.2)); S50.position.z = 0.055;
const S8 = text3d(SIGNR, '-8%', 0.3, 0.1, redClay(0.2)); S8.position.z = -0.055; S8.rotation.y = PI;
const SHOP = [[-0.62, 0.42, 1.25], [-0.3, 0.6, 1.6]].map(([x, z, ry], i) => {const p = person(A, x, z, {body: [PAL.sky, PAL.mint][i], ry, s: 1.0});
  const bag = grp(p.arms[0].userData.hand); add(bag, rbox(0.1, 0.12, 0.045, 0.012), clay([PAL.yellow, PAL.lilac][i]), 0, -0.05, 0); return {p, i};});

// ------------------------------------------------------------------ B: the shelf that fills with 100 products, a magnifier looks along it
const B = grp(S, XS[1], 0, ZS); mat(B, 1.85, 1.3, PAL.sky);
add(B, rbox(1.8, 1.45, 0.08, 0.03), clay(PAL.cream), 0, 0.725, -0.3);
for (const sx of [-1, 1]) add(B, rbox(0.07, 1.45, 0.36, 0.02), clay(0xe7dfd0), sx * 0.865, 0.725, -0.14);
const SHY = [0.1, 0.38, 0.66, 0.94, 1.22];
SHY.forEach(y => add(B, rbox(1.66, 0.035, 0.34, 0.012), clay(0xe7dfd0), 0, y, -0.14));
const ITEMS = []; {const cols = [PAL.peach, PAL.sky, PAL.yellow, PAL.lilac, PAL.mint, PAL.pink, PAL.apricot, PAL.sage, 0x6f8fb0, PAL.deep];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) {const k = r * 20 + c, h = 0.08 + hash(k) * 0.12, w = 0.055 + hash(k + 7) * 0.02, x = -0.76 + c * 0.08, y = SHY[r] + 0.0175;
    const kind = Math.floor(hash(k + 3) * 3), m = clay(cols[Math.floor(hash(k + 11) * cols.length)]);
    const o = kind === 1 ? add(B, new THREE.CylinderGeometry(w * 0.45, w * 0.45, h, 14), m, x, y + h / 2, -0.1) : add(B, rbox(w, h, 0.09, 0.012), m, x, y + h / 2, -0.1);
    o.userData = {y: y + h / 2, t: 9.1 + c * 0.045 + r * 0.06}; ITEMS.push(o);}}
const MAG = grp(B, -0.9, 0.7, 0.35); {add(MAG, new THREE.TorusGeometry(0.17, 0.028, 12, 40), clay(PAL.deep), 0, 0, 0); add(MAG, new THREE.CircleGeometry(0.16, 40), glass(0xe6f4ff, 0.3), 0, 0, 0).castShadow = false;
  const hd = add(MAG, rbox(0.06, 0.26, 0.05, 0.02), clay(PAL.deep), 0.16, -0.2, 0); hd.rotation.z = 0.6;}

// ------------------------------------------------------------------ C: five products with price tags in front of the November price curve
const C = grp(S, XS[2], 0, ZS); mat(C, 2.05, 1.3, PAL.yellow);
add(C, rbox(1.95, 1.25, 0.08, 0.04), clay(PAL.cream), 0, 1.0, -0.42);
for (const sx of [-1, 1]) add(C, rbox(0.06, 0.4, 0.06, 0.02), clay(0xe7dfd0), sx * 0.8, 0.2, -0.42);
const DAYX = d => -0.84 + (d - 1) / 29 * 1.68, CY0 = 0.62, CY1 = 1.38;
decal(C, 1.88, 1.18, tex(1100, 690, (g, w, h) => {g.fillStyle = '#c4a8f0'; g.beginPath(); g.roundRect(0, 0, w, 120, [26, 26, 0, 0]); g.fill(); T2(g, 'NOVEMBER 2025', w / 2, 64, '800 70px "Inter Tight"', '#ffffff');
  g.strokeStyle = 'rgba(91,74,154,0.16)'; g.lineWidth = 3; for (let k = 0; k < 4; k++) {const y = 170 + k * 100; g.beginPath(); g.moveTo(40, y); g.lineTo(w - 40, y); g.stroke();}
  for (let d = 1; d <= 30; d++) {const x = w / 2 + DAYX(d) / 1.88 * w, y = 625, bf = d === 28; g.fillStyle = bf ? '#E01E2B' : (d === 11 || d === 24 ? '#9fe0c6' : '#efe8da'); g.beginPath(); g.roundRect(x - 16, y - 22, 32, 44, 8); g.fill();
    if (d === 1 || d % 5 === 0 || d === 28 || d === 11 || d === 24) T2(g, String(d), x, y + 2, '800 20px "Inter Tight"', bf ? '#ffffff' : '#5b4a9a');}
  T2(g, 'Black Friday', w / 2 + DAYX(28) / 1.88 * w - 20, 578, '800 26px "Inter Tight"', '#E01E2B', 'right');}), 0, 1.0, -0.378);
const PRICE = [1.0, 0.97, 0.98, 0.94, 0.96, 0.92, 0.95, 0.9, 0.86, 0.84, 0.55, 0.8, 0.86, 0.88, 0.85, 0.82, 0.84, 0.8, 0.78, 0.76, 0.74, 0.72, 0.7, 0.5, 0.68, 0.7, 0.66, 0.62, 0.6, 0.64];
const pY = p => CY0 + (p - 0.4) / 0.65 * (CY1 - CY0);
const LINEPTS = PRICE.map((p, i) => V3(DAYX(i + 1), pY(p), -0.36));
const LINE = add(C, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(LINEPTS, false, 'catmullrom', 0.2), 300, 0.014, 10), clay(PAL.deep, {bumpScale: 0.8}));
const LINEN = LINE.geometry.index.count;
const DOTS = [[11, 0x58b48c], [24, 0x58b48c], [28, RED]].map(([d, c]) => {const m = add(C, new THREE.SphereGeometry(0.04, 18, 14), c === RED ? redClay(0.25) : clay(c), DAYX(d), pY(PRICE[d - 1]), -0.34); m.userData = {d}; return m;});
const PROD = [], PX = [-0.8, -0.4, 0, 0.4, 0.8];
function product(par, k) {const G = grp(par, 0, 0.16, 0);
  if (k === 0) {add(G, rbox(0.34, 0.21, 0.035, 0.02), clay(PAL.dark), 0, 0.15, 0); add(G, rbox(0.3, 0.17, 0.004, 0.004), clay(0x6f8fb0, {roughness: 0.4, bumpScale: 0.3}), 0, 0.15, 0.019); add(G, rbox(0.03, 0.05, 0.03, 0.01), clay(PAL.dark), 0, 0.03, 0); add(G, rbox(0.14, 0.012, 0.07, 0.006), clay(PAL.dark), 0, 0.006, 0);}
  if (k === 1) {const b = add(G, new THREE.TorusGeometry(0.08, 0.016, 10, 30, PI), clay(PAL.lilac), 0, 0.09, 0); for (const sx of [-1, 1]) add(G, new THREE.CylinderGeometry(0.035, 0.035, 0.035, 20).rotateZ(PI / 2), clay(PAL.deep), sx * 0.08, 0.06, 0);}
  if (k === 2) {add(G, rbox(0.26, 0.03, 0.1, 0.014), clay(0xfbfaf6), 0, 0.015, 0); add(G, rbox(0.2, 0.07, 0.09, 0.03), clay(PAL.sky), -0.02, 0.06, 0); add(G, rbox(0.08, 0.06, 0.08, 0.025), clay(PAL.sky), -0.08, 0.11, 0);}
  if (k === 3) {add(G, rbox(0.24, 0.05, 0.16, 0.02), clay(0xf6f4f8), 0, 0.025, 0); for (const sx of [-1, 1]) {const c = add(G, rbox(0.08, 0.025, 0.05, 0.012), clay(PAL.dark), sx * 0.08, 0.065, 0.1); c.rotation.y = sx * 0.3;}}
  if (k === 4) {add(G, new THREE.CylinderGeometry(0.06, 0.07, 0.1, 22), clay(PAL.pink), 0, 0.05, 0); add(G, new THREE.CylinderGeometry(0.012, 0.012, 0.3, 10), clay(0xc9ccd6, {roughness: 0.5}), 0, 0.22, -0.02); add(G, rbox(0.08, 0.025, 0.03, 0.01), clay(PAL.dark), 0, 0.37, -0.02);}
  return G;}
const tagTex = (price, col, arrow) => tex(240, 150, (g, w, h) => {g.fillStyle = col; g.beginPath(); g.roundRect(0, 0, w, h, 22); g.fill(); g.fillStyle = 'rgba(0,0,0,0.12)'; g.beginPath(); g.arc(30, 30, 10, 0, 7); g.fill();
  T2(g, price, arrow ? w / 2 - 14 : w / 2, h / 2 + 4, '800 64px "Inter Tight"', '#2b2b38'); if (arrow) {g.fillStyle = '#2f8f6a'; g.beginPath(); g.moveTo(w - 38, h / 2 + 26); g.lineTo(w - 58, h / 2 - 4); g.lineTo(w - 18, h / 2 - 4); g.closePath(); g.fill(); g.fillRect(w - 44, h / 2 - 30, 12, 28);}});
const OLD = ['699 €', '89 €', '119 €', '449 €', '299 €'], NEW = ['649 €', '79 €', '109 €', '409 €', '299 €'];
PX.forEach((x, k) => {const G = grp(C, x, 0, 0.08); add(G, new THREE.CylinderGeometry(0.17, 0.18, 0.32, 32), clay(0xf3ece0), 0, 0.16, 0); const pr = product(G, k); pr.position.y = 0.32;
  const T = grp(G, 0, 0.42, 0.24); T.rotation.x = -0.2; add(G, new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), clay(0xc9ccd6), 0, 0.33, 0.24); const card = grp(T); add(card, rbox(0.2, 0.125, 0.012, 0.012), clay(0xfbfaf6), 0, 0, 0);
  decal(card, 0.19, 0.115, tagTex(OLD[k], '#fbfaf6', false), 0, 0, 0.0065, {bump: 0.2}); const bk = decal(card, 0.19, 0.115, tagTex(NEW[k], k < 4 ? '#9fe0c6' : '#e2ddd3', k < 4), 0, 0, -0.0065, {bump: 0.2}); bk.rotation.y = PI;
  PROD.push({G, card, k});});

// ------------------------------------------------------------------ E: the TV and the trick with the recommended retail price (UVP)
const E = grp(S, XS[3], 0, ZS); mat(E, 1.9, 1.3, PAL.mint);
const TV = grp(E, -0.42, 0, 0.0); add(TV, rbox(0.3, 0.025, 0.16, 0.01), clay(PAL.dark), 0, 0.0125, 0); add(TV, rbox(0.05, 0.3, 0.04, 0.015), clay(PAL.dark), 0, 0.16, -0.02);
add(TV, rbox(0.86, 0.52, 0.05, 0.03), clay(PAL.dark), 0, 0.56, 0); decal(TV, 0.8, 0.46, tex(400, 230, (g, w, h) => {const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9cc8f2'); gr.addColorStop(1, '#c4a8f0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(300, 70, 40, 0, 7); g.fill(); g.fillStyle = '#7fcf5a'; g.beginPath(); g.moveTo(0, h); g.quadraticCurveTo(120, 120, 240, 190); g.quadraticCurveTo(320, 150, w, 200); g.lineTo(w, h); g.fill();}), 0, 0.56, 0.026, {glow: 0.35, bump: 0});
const TAG = grp(TV, 0.36, 0.82, 0.03); {add(TAG, new THREE.CylinderGeometry(0.004, 0.004, 0.14, 6), clay(PAL.cream), 0, -0.07, 0); const c = grp(TAG, 0, -0.2, 0);
  add(c, rbox(0.26, 0.15, 0.02, 0.02), redClay(0.2), 0, 0, 0); decal(c, 0.24, 0.13, tex(260, 140, (g, w, h) => T2(g, '-50%', w / 2, h / 2 + 4, '800 84px "Inter Tight"', '#ffffff')), 0, 0, 0.011, {bump: 0.2}); TAG.userData.card = c;}
const BARS = [['UVP', '999 €', 1.2, 0xfbf8f1], ['echter Preis', '549 €', 0.66, PAL.sky], ['Black Friday', '499 €', 0.6, PAL.lilac]].map(([lab, val, h, c], i) => {
  const G = grp(E, 0.22 + i * 0.27, 0, 0.0); const m = add(G, rbox(0.2, 1, 0.2, 0.03), i === 0 ? clay(c, {transparent: true, opacity: 1}) : clay(c), 0, 0.5, 0);
  const top = grp(G, 0, h, 0); add(top, rbox(0.27, 0.17, 0.03, 0.02), clay(0xfbf8f1), 0, 0.13, 0.02);
  decal(top, 0.26, 0.16, tex(300, 184, (g, w, hh) => {const f = fitText(g, lab, 270, 600, 40, 'Poppins'); T2(g, lab, w / 2, 52, f, '#6a6a7a'); T2(g, val, w / 2, 128, '800 70px "Inter Tight"', '#2b2b38');}), 0, 0.13, 0.036, {bump: 0.2});
  return {G, m, h, top};});
const ARC = (() => {const p0 = V3(0.3, 1.47, 0.06), p2 = V3(0.76, 0.9, 0.06), p1 = V3(0.66, 1.68, 0.06); const cv = new THREE.QuadraticBezierCurve3(p0, p1, p2);
  const t = add(E, new THREE.TubeGeometry(cv, 80, 0.018, 10), redClay(0.2)); const tip = add(E, new THREE.ConeGeometry(0.045, 0.1, 18), redClay(0.2), p2.x, p2.y + 0.05, p2.z); tip.rotation.z = PI; t.userData = {n: t.geometry.index.count, tip}; return t;})();
const DOUBT = person(E, 0.98, 0.42, {body: PAL.peach, ry: -0.7, s: 1.0});

// ------------------------------------------------------------------ F: the big phone with the price history
const F = grp(S, XS[4], 0, ZS); mat(F, 1.9, 1.3, PAL.lilac);
const PH = grp(F, -0.2, 0, -0.15); add(PH, rbox(0.4, 0.08, 0.3, 0.03), clay(PAL.cream), 0, 0.04, 0);
const PHB = grp(PH, 0, 0.08, 0); PHB.rotation.x = -0.12; add(PHB, rbox(0.62, 1.12, 0.07, 0.09), clay(PAL.dark), 0, 0.56, 0);
decal(PHB, 0.54, 1.0, tex(540, 1000, (g, w, h) => {g.fillStyle = '#f6f4f8'; g.beginPath(); g.roundRect(0, 0, w, h, 40); g.fill(); g.fillStyle = '#2b2b38'; g.beginPath(); g.roundRect(w / 2 - 60, 18, 120, 26, 13); g.fill();
  T2(g, 'Preisverlauf', 40, 110, '800 54px "Inter Tight"', '#2b2b38', 'left'); T2(g, 'letzte 3 Monate', 40, 168, '600 30px Poppins', '#8d867c', 'left');
  g.strokeStyle = 'rgba(91,74,154,0.15)'; g.lineWidth = 3; for (let k = 0; k < 5; k++) {const y = 300 + k * 110; g.beginPath(); g.moveTo(40, y); g.lineTo(w - 40, y); g.stroke();}
  T2(g, 'Sep', 70, 860, '600 28px Poppins', '#8d867c'); T2(g, 'Okt', w / 2, 860, '600 28px Poppins', '#8d867c'); T2(g, 'Nov', w - 70, 860, '600 28px Poppins', '#8d867c');
  g.fillStyle = '#9fe0c6'; g.beginPath(); g.roundRect(40, 900, w - 80, 70, 35); g.fill(); T2(g, 'Preisalarm an', w / 2, 936, '800 34px "Inter Tight"', '#1f5a46');}), 0, 0.56, 0.036, {bump: 0.1, glow: 0.2});
const PHP = [0.62, 0.6, 0.64, 0.58, 0.55, 0.6, 0.57, 0.5, 0.52, 0.47, 0.49, 0.45, 0.5, 0.56, 0.54, 0.43].map((p, i, a) => V3(-0.2 + i / (a.length - 1) * 0.4, 0.22 + p * 0.95, 0.04));
const PHL = add(PHB, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(PHP), 200, 0.009, 8), clay(0x58b48c, {bumpScale: 0.3})); const PHLN = PHL.geometry.index.count;
const PHMIN = add(PHB, new THREE.SphereGeometry(0.022, 14, 12), clay(0x58b48c), PHP[15].x, PHP[15].y, 0.045);
const BUYER = person(F, 0.42, 0.18, {body: PAL.yellow, ry: -0.9, s: 1.05});
{const bag = grp(BUYER.arms[0].userData.hand); add(bag, rbox(0.1, 0.12, 0.045, 0.012), clay(PAL.pink), 0, -0.05, 0);}

// ------------------------------------------------------------------ the shoppers on the square in the middle (one closed loop, evenly spaced, so nobody collides)
// a stadium-shaped loop: two lanes 0.5 apart, half circles at the ends; the walkers keep equal distance, so nobody bumps into anybody
// only along the middle stations, so nobody walks in front of the sale sign or the phone
const LOOP = {z: 0.92, hx: 3.0, r: 0.25}; const LOOPL = 4 * LOOP.hx + 2 * PI * LOOP.r;
function loopAt(s) {s = ((s % LOOPL) + LOOPL) % LOOPL; const L1 = 2 * LOOP.hx, L2 = PI * LOOP.r; const arc = (cx, a) => [cx + Math.cos(a) * LOOP.r, LOOP.z + Math.sin(a) * LOOP.r, Math.atan2(Math.sin(a), -Math.cos(a))];
  if (s < L1) return [-LOOP.hx + s, LOOP.z + LOOP.r, PI / 2]; s -= L1;
  if (s < L2) return arc(LOOP.hx, PI / 2 - s / LOOP.r); s -= L2;
  if (s < L1) return [LOOP.hx - s, LOOP.z - LOOP.r, -PI / 2]; s -= L1;
  return arc(-LOOP.hx, -PI / 2 - s / LOOP.r);}
const WALKERS = [PAL.mint, PAL.pink, 0x6f8fb0, PAL.apricot, PAL.yellow].map((c, i) => {const p = person(S, 0, 0, {body: c, s: 0.92}); const bag = grp(p.arms[i % 2].userData.hand);
  add(bag, rbox(0.1, 0.12, 0.045, 0.012), clay([PAL.yellow, PAL.lilac, PAL.sky, PAL.peach, PAL.pink][i]), 0, -0.05, 0); return {p, ph: i / 5};});

// ------------------------------------------------------------------ G: speech bubble over the square at the end
const BUB = grp(S, 0, 1.95, 0.25); {add(BUB, rbox(0.8, 0.5, 0.12, 0.2), clay(0xfbfaf6, {bumpScale: 1.2}), 0, 0, 0); const tl = add(BUB, new THREE.ConeGeometry(0.08, 0.18, 16), clay(0xfbfaf6, {bumpScale: 1.2}), -0.18, -0.3, 0); tl.rotation.z = -0.4;
  decal(BUB, 0.7, 0.42, tex(560, 340, (g, w, h) => {T2(g, '?', w / 2, h / 2 + 10, '800 260px "Inter Tight"', '#5b4a9a');}), 0, 0, 0.061, {bump: 0.2});}

// ------------------------------------------------------------------ camera
const wx = (G, x, y, z) => G.localToWorld(V3(x, y, z));
S.updateMatrixWorld(true);
const ptsA = [[-0.85, 0, -0.58], [0.85, 0, -0.58], [-0.85, 1.32, -0.58], [0.85, 1.32, -0.58], [-0.85, 0, 0.66], [0.85, 0, 0.66]].map(p => wx(A, ...p));
const ptsB = [[-0.92, 0, -0.35], [0.92, 0, -0.35], [-0.92, 1.45, -0.35], [0.92, 1.45, -0.35], [-0.92, 0, 0.5], [0.92, 0, 0.5]].map(p => wx(B, ...p));
const ptsC = [[-1.0, 0.1, 0.45], [1.0, 0.1, 0.45], [-1.0, 0.75, 0.3], [1.0, 0.75, 0.3], [-1.0, 0.5, -0.2], [1.0, 0.5, -0.2]].map(p => wx(C, ...p));
const ptsD = [[-0.98, 0.38, -0.42], [0.98, 0.38, -0.42], [-0.98, 1.62, -0.42], [0.98, 1.62, -0.42], [-0.9, 0.3, 0.3], [0.9, 0.3, 0.3]].map(p => wx(C, ...p));
const ptsE = [[-0.9, 0, 0.6], [0.95, 0, 0.6], [-0.9, 0, -0.2], [0.95, 0, -0.2], [-0.9, 1.0, 0], [0.9, 1.72, 0]].map(p => wx(E, ...p));
const ptsF = [[-0.7, 0, 0.6], [0.8, 0, 0.6], [-0.7, 1.3, -0.2], [0.8, 1.3, -0.2], [0.6, 0, -0.4]].map(p => wx(F, ...p));
const ptsW = [V3(-5.8, -0.36, 1.45), V3(5.8, -0.36, 1.45), V3(-5.8, 0, -1.45), V3(5.8, 0, -1.45), V3(-4.5, 1.35, -0.8), V3(4.5, 1.3, -0.6), V3(0, 1.65, -0.62), V3(0, 2.3, 0.25)];
const FA0 = fit(ptsA, -10, 12), FA = fit(ptsA, -14, 14), FB = fit(ptsB, -10, 10), FC = fit(ptsC, -10, 18), FD = fit(ptsD, -8, 8), FE = fit(ptsE, -12, 11), FF = fit(ptsF, -14, 12), FW = fit(ptsW, -46, 24, {y0: 560}), FO = fit(ptsW, -46, 22, {y0: 640, y1: 1300});
const CAM = [K(0, FA0, 0.98), K(2.4, FA0, 0.9), K(5.6, FA, 0.95), K(6.6, FB), K(11.0, FB, 0.9), K(11.9, FC), K(15.3, FC, 0.92), K(16.2, FD), K(19.8, FD, 0.95),
  K(20.8, FE), K(29.0, FE, 0.9), K(29.9, FF), K(32.1, FF, 0.92), K(33.2, FW), K(OUT0, FW, 0.97), K(OUT0 + 1.0, FO), K(END_V + 1, FO)];
const camAt = makeCam(CAM);

// ------------------------------------------------------------------ texts
const wordsN = WORDS.filter(w => !w.text.startsWith('[') && !w.text.endsWith(']'));
const SUBG = [[3, 'Minus 50 Prozent?'], [11, 'Am Black Friday sparst du im Schnitt gerade mal 8 Prozent.'], [8, 'Das Vergleichsportal Idealo hat letztes Jahr die Preise'],
  [5, 'in 100 beliebten Kategorien verfolgt.'], [8, 'Vier von fünf Produkten waren am Black Friday'], [5, 'zwar billiger als im Oktober,'], [7, 'aber mehr als die Hälfte gab es'],
  [8, 'an einem anderen Tag im November noch günstiger.'], [6, 'Und woher kommen die riesigen Prozente?'], [9, 'Viele Shops rechnen den Rabatt nicht vom echten Preis,'],
  [5, 'sondern von der unverbindlichen Preisempfehlung,'], [4, 'die fast niemand zahlt.'], [6, 'Schau dir also den Preisverlauf an,'], [3, 'bevor du zuschlägst.'],
  [5, 'Was war dein bestes Black-Friday-Schnäppchen?'], [4, 'Schreib’s in die Kommentare.']];
const SUBS = []; {let i = 0; SUBG.forEach(([n, s]) => {SUBS.push([wordsN[i].start - 0.05, wordsN[i + n - 1].end + 0.25, s]); i += n;}); for (let k = 0; k < SUBS.length - 1; k++) SUBS[k][1] = Math.min(SUBS[k][1], SUBS[k + 1][0]);}
const NUMS = [[4.75, 8.95, '8 %', 'durchschnittliche Ersparnis am Black Friday 2025 gegenüber Oktober'], [9.05, 11.42, '100', 'beliebte Kategorien, beobachtet von Idealo'],
  [11.46, 15.48, '4 von 5', 'Produkten waren billiger als im Oktober'], [15.54, 20.1, 'über 50 %', 'gab es an einem anderen Novembertag noch günstiger'],
  [25.3, 27.8, '-50 %', 'vom UVP gerechnet (Beispiel)'], [27.82, 32.1, '-9 %', 'vom echten Preis gerechnet (Beispiel)']];
const TITLES = [[-1, 2.5, 'Black Friday: Sind die Rabatte echt?'], [32.3, OUT0, 'Was war dein bestes Schnäppchen?']];
const SRCS = [[-1, 11.42, 'Quelle: Idealo-Preisanalyse Black Friday 2025 · Modell vereinfacht'], [11.46, 20.1, 'Quelle: Idealo 2025 (79 % günstiger als im Oktober, 52 % an anderen Novembertagen günstiger)'],
  [20.16, 32.1, 'Beispielpreise · UVP = unverbindliche Preisempfehlung des Herstellers · Modell vereinfacht']];
const overlays = makeOverlays({SUBS, NUMS, TITLES, SRCS, OUT0});

// ------------------------------------------------------------------ the frame at voice time v
function setT(v) {
  camAt(v); overlays(v);
  // A: the sign pops up on „Minus“, wobbles, flips to -8% on „acht“
  {const p = popIn(v, 0.2, 0.45); SIGN.scale.setScalar(Math.max(1e-3, p)); const f = eio(seg(v, 4.62, 5.12)); SIGNR.rotation.y = f * PI + Math.sin(PI * f) * 0.2;
    SIGNR.rotation.z = Math.sin(v * 3) * 0.02 * (1 - f); SIGNR.position.y = Math.sin(PI * seg(v, 4.62, 5.12)) * 0.12;}
  S50.visible = SIGNR.rotation.y < PI / 2; S8.visible = !S50.visible;
  SHOP.forEach(({p, i}) => {p.B.position.y = Math.abs(Math.sin(v * 2.2 + i)) * 0.006; if (i === 0) arm(p, 1, 0.1 + 1.9 * sm(seg(v, 0.5, 0.9)) * (1 - sm(seg(v, 3.4, 3.9))) + 1.9 * sm(seg(v, 4.9, 5.3)) * (1 - sm(seg(v, 6.2, 6.6))));
    p.head.rotation.x = i === 1 ? -0.15 : 0;});
  // B: products appear in a wave on „hundert“, the magnifier slides along
  ITEMS.forEach(o => {const p = popIn(v, o.userData.t, 0.3); o.visible = p > 0.01; o.scale.setScalar(Math.max(1e-3, p));});
  {const u = sm(seg(v, 9.4, 11.6)); MAG.position.set(lerp(-0.85, 0.85, u), 0.72 + Math.sin(u * PI * 3) * 0.28, 0.36); MAG.visible = v > 9.2 && v < 12.2; MAG.scale.setScalar(Math.max(1e-3, popIn(v, 9.2, 0.3) * (1 - seg(v, 11.7, 12.0))));}
  // C: four of five tags flip to the lower price, one by one on „Vier von fünf“
  PROD.forEach(({card, k}) => {const f = k < 4 ? eio(seg(v, 12.0 + k * 0.32, 12.45 + k * 0.32)) : 0; card.rotation.y = f * PI; card.position.y = Math.sin(PI * f) * 0.05;});
  {const u = seg(v, 15.7, 18.4); LINE.geometry.setDrawRange(0, Math.floor(u * LINEN / 60) * 60); LINE.visible = u > 0;
    DOTS.forEach(d => {const at = d.userData.d === 28 ? 16.5 : (d.userData.d === 11 ? 18.3 : 18.6); const p = popIn(v, at, 0.35); d.visible = p > 0.01; d.scale.setScalar(Math.max(1e-3, p) * (1 + 0.15 * Math.sin(v * 6) * (v > at + 0.4 ? 1 : 0)));});}
  // E: real price and Black Friday price rise first, then the UVP towers over them, the red arrow shows the big discount, the UVP fades
  {const tag = popIn(v, 20.3, 0.4); TAG.scale.setScalar(Math.max(1e-3, tag)); TAG.userData.card.rotation.z = Math.sin((v - 20.3) * 4) * 0.25 * Math.exp(-Math.max(0, v - 20.3) * 1.2);
    const rise = [seg(v, 25.4, 26.5), seg(v, 23.5, 24.6), seg(v, 24.3, 25.2)];
    BARS.forEach((b, i) => {const u = eo(rise[i]); const h = Math.max(0.001, b.h * u); b.m.scale.y = h; b.m.position.y = h / 2; b.top.position.y = h; b.top.visible = u > 0.02; b.top.scale.setScalar(Math.max(1e-3, popIn(v, [26.4, 24.5, 25.1][i], 0.3)));});
    BARS[0].m.material.opacity = 1 - 0.65 * sm(seg(v, 28.0, 28.8)); BARS[0].m.castShadow = v < 28.4;
    const a = seg(v, 26.6, 27.5); ARC.geometry.setDrawRange(0, Math.floor(a * ARC.userData.n / 60) * 60); ARC.visible = a > 0; ARC.userData.tip.visible = a >= 1; ARC.userData.tip.scale.setScalar(Math.max(1e-3, popIn(v, 27.45, 0.25)));
    DOUBT.head.rotation.y = v > 28.0 && v < 29.4 ? Math.sin((v - 28.0) * 11) * 0.35 * (1 - seg(v, 28.9, 29.4)) : 0; arm(DOUBT, -1, 0.1 + 0.5 * sm(seg(v, 28.0, 28.4)) * (1 - sm(seg(v, 29.0, 29.5)))); arm(DOUBT, 1, 0.1 + 0.5 * sm(seg(v, 28.0, 28.4)) * (1 - sm(seg(v, 29.0, 29.5))));}
  // F: the price history draws itself, the lowest point pops, the buyer nods and lifts the bag
  {const u = seg(v, 29.9, 31.4); PHL.geometry.setDrawRange(0, Math.floor(u * PHLN / 48) * 48); PHL.visible = u > 0; PHMIN.scale.setScalar(Math.max(1e-3, popIn(v, 31.4, 0.3)));
    BUYER.head.rotation.x = v > 31.3 && v < 32.3 ? Math.sin((v - 31.3) * 12) * 0.18 * (1 - seg(v, 31.8, 32.3)) : 0; arm(BUYER, 1, 0.1 + 2.3 * sm(seg(v, 31.5, 31.9)) * (1 - sm(seg(v, 33.0, 33.5))));}
  // the square: shoppers walk round and round
  WALKERS.forEach(({p, ph}) => {const [x, z, h] = loopAt(ph * LOOPL + v * 0.34); p.G.position.set(x, 0, z); p.G.rotation.y = h; walk(p, v * 8 + ph * 7, 0.45);});
  // G: the speech bubble
  {const p = popIn(v, 33.0, 0.45); BUB.scale.setScalar(Math.max(1e-3, p)); BUB.position.y = 1.35 + Math.sin(v * 2) * 0.03; BUB.visible = p > 0.01;}
  dimLights(v, OUT0); outro(v, OUT0);}

// collision check: walkers against each other and against the stations
window.CHECK = () => {const out = []; for (let v = 0; v < END_V; v += 0.1) {setT(v); const P = WALKERS.map(w => w.p.G.position.clone());
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (P[i].distanceTo(P[j]) < 0.26) out.push(['walkers', v.toFixed(1), i, j]);
  P.forEach((p, i) => {if (Math.abs(p.z) > 1.3 || Math.abs(p.x) > 3.4 || p.z < 0.58) out.push(['edge', v.toFixed(1), i]);});} return out.slice(0, 20);};
window.setT = setT;
window.TOTAL = Math.round((END_V + VO) * 30);
window.renderFrame = f => {setT(f / 30 - VO); renderer.render(scene, cam);};
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round(((q0 != null ? +q0 : 0) + VO) * 30));
window.ready = true;
