// „3.000 € brutto: So viel bleibt dir“ im Knete-Look (Wunsch des Nutzers 22.11.2026: kurze Videos mit mehreren Szenen).
// Eine Knetplatte mit Stationen: A Büro mit Chef und Mitarbeiter, daneben ein Wagen mit dem Geldturm (3.639 € = was du den Chef kostest),
// B großer Lohnzettel, D fünf Häuser (Rentenversicherung, Krankenkasse, Pflege, Arbeitsagentur, Finanzamt). Der Wagen rollt zu den Häusern,
// jede Scheibe des Turms fliegt in ihr Haus, sobald Tom sie nennt. Übrig bleibt der rote Netto-Teil (roter Faden), der Mitarbeiter holt ihn ab.
// Rechnung 2026 (Steuerklasse I, keine Kinder, keine Kirchensteuer, durchschnittlicher Zusatzbeitrag 2,9 %): RV 279,00 · KV 262,50 · PV 72,00 · AV 39,00 ·
// Lohnsteuer 293,08 → netto 2.054,42 €; Arbeitgeber zusätzlich RV 279 · KV 262,50 · PV 54 · AV 39 · Insolvenzgeld 4,50 = 639 € (ohne U1/U2 und Unfallversicherung).
// Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 2); im Video beginnt die Stimme bei 0,15 s.
import {THREE, W, H, RED, PI, clamp, lerp, seg, sm, eo, ei, eio, back, popIn, hash, V3, R, renderer, scene, cam, lightRig, tex, add, grp, rbox, clay, redClay, glass, PAL, BODY, T2, fitText,
  decal, text3d, plinth, person, arm, walk, still, tree, winTex, hex, fit, K, makeCam, makeOverlays, outro, dimLights} from '../../kit/knete_kit.js';

const VO = 0.15, OUT0 = 38.75, END_V = 42.5;
const WORDS = (await (await fetch('voice/words.json')).json()).words;
const S = new THREE.Group(); scene.add(S);
plinth(S, 9.4, 2.9, [[-1, -1], [1, -1], [-1, 1], [1, 1]]);
add(S, rbox(9.0, 0.02, 0.5, 0.01), clay(0xe7dccb, {bumpScale: 2}), 0, 0.01, 0.95);
lightRig(0, 0, 5.4);
for (const [x, z, s] of [[-4.4, 0.6, 0.7], [-1.82, -0.55, 0.6], [0.22, -0.6, 0.6], [-0.15, 1.05, 0.5]]) tree(S, x, z, s);
const mat = (par, w, d, c) => add(par, rbox(w, 0.03, d, 0.012), clay(c, {bumpScale: 2.6}), 0, 0.015, 0);
const label = (par, w, h, lines, x, y, z, o = {}) => {const g = grp(par, x, y, z); add(g, rbox(w, h, 0.03, 0.02), clay(0xfbf8f1), 0, 0, 0);
  decal(g, w - 0.01, h - 0.01, tex(Math.round(w * 1000), Math.round(h * 1000), (c, ww, hh) => {const n = lines.length; lines.forEach(([s, f, col], i) => {c.font = f; T2(c, s, ww / 2, hh * (i + 0.5) / n + 3, fitText(c, s, ww - 24, f.split(' ')[0], +f.split(' ')[1].replace('px', ''), f.split(' ').slice(2).join(' ')), col || '#2b2b38');});}), 0, 0, 0.016, {bump: 0.2}); return g;};

// ------------------------------------------------------------------ A: the office with the boss and the employee
const A = grp(S, -3.3, 0, -0.25); mat(A, 2.2, 1.3, PAL.lilac);
{const wt = clay(0xffffff, {map: winTex(hex(PAL.sky), '#5b5a8a', 4, 3)}), pm = clay(PAL.sky);
  // the front has no window where the door is, so the door does not cover half a window
  const wf = clay(0xffffff, {map: tex(256, 256, (g, w, h) => {g.fillStyle = hex(PAL.sky); g.fillRect(0, 0, w, h); const cw = w / 4, rh = h / 3; g.fillStyle = '#5b5a8a';
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) if (!(i === 0 && k === 2)) {g.beginPath(); g.roundRect(i * cw + cw * 0.25, k * rh + rh * 0.22, cw * 0.5, rh * 0.55, 6); g.fill();}})});
  add(A, rbox(1.7, 1.15, 0.45, 0.06), [wt, wt, pm, pm, wf, wt], 0, 0.575, -0.38);
  add(A, rbox(1.76, 0.06, 0.5, 0.03), clay(0xfaf3e8), 0, 1.18, -0.38); add(A, rbox(0.24, 0.42, 0.03, 0.02), clay(PAL.deep), -0.6375, 0.21, -0.15);
  // the company sign stands on the roof on two short legs, above the windows (not in front of them)
  {const rs = grp(A, 0.3, 1.21, -0.3); for (const sx of [-1, 1]) add(rs, rbox(0.04, 0.1, 0.04, 0.015), clay(0xe7dfd0), sx * 0.26, 0.05, 0);
    label(rs, 0.74, 0.2, [['FIRMA', '800 120px "Inter Tight"', '#5b4a9a']], 0, 0.19, 0);}
  add(A, rbox(0.62, 0.05, 0.32, 0.02), clay(0xc49a64), -0.45, 0.36, 0.2); for (const sx of [-1, 1]) add(A, rbox(0.04, 0.34, 0.28, 0.01), clay(0xb08a5a), -0.45 + sx * 0.27, 0.17, 0.2);
  add(A, rbox(0.2, 0.012, 0.14, 0.006), clay(PAL.dark), -0.5, 0.39, 0.22); const sc = add(A, rbox(0.2, 0.13, 0.01, 0.006), clay(PAL.dark), -0.5, 0.45, 0.15); sc.rotation.x = -0.3;}
const CHEF = person(A, -0.05, 0.25, {body: 0x3e3f5a, leg: 0x2b2d3a, tie: PAL.deep, hair: 0x6b4a2a, ry: 0.35, s: 1.08});
const EMP = person(A, -0.95, 0.4, {body: PAL.mint, hair: 0x3b2a20, ry: 0.5, s: 1.0});
const QM = grp(S, 0, 0, 0); {const q = text3d(QM, '?', 0.32, 0.08, clay(PAL.deep, {bumpScale: 1}), 'center'); q.position.y = 0;}

// ------------------------------------------------------------------ the money tower on a little cart: 1.000 € = 0.55 units high
const U = 0.55 / 1000;
const SL = [['netto', 2054.42, RED], ['lohnsteuer', 293.08, 0xb9b4d6], ['av', 39.0, PAL.yellow], ['pv', 72.0, PAL.pink], ['kv', 262.5, PAL.mint], ['rv', 279.0, PAL.sky], ['chef', 639.0, PAL.lilac]];
const CART = grp(S, -2.25, 0, 0.3);
add(CART, rbox(0.66, 0.06, 0.66, 0.025), clay(0xc49a64), 0, 0.1, 0);
const WHEELS = []; for (const [x, z] of [[-0.25, 0.27], [0.25, 0.27], [-0.25, -0.27], [0.25, -0.27]]) {const w = add(CART, new THREE.CylinderGeometry(0.065, 0.065, 0.04, 20).rotateX(PI / 2), clay(PAL.dark), x, 0.065, z); WHEELS.push(w);}
const COL = grp(CART, 0, 0.13, 0); const SLICE = {}; {let y = 0; SL.forEach(([k, eur, c]) => {const h = eur * U, g = grp(COL, 0, y + h / 2, 0);
  const m = add(g, rbox(0.5, h, 0.5, Math.min(0.03, h / 2 - 0.001)), k === 'netto' ? redClay(0.12) : clay(c, {transparent: true, opacity: 1}), 0, 0, 0); SLICE[k] = {g, m, y: y + h / 2, h, eur, c}; y += h;}); COL.userData.top = y;}
const TOTALL = label(CART, 0.62, 0.2, [['3.639 €', '800 130px "Inter Tight"']], 0, 0.13 + COL.userData.top + 0.16, 0.0);
const CHEFL = label(SLICE.chef.g, 0.42, 0.16, [['+ 639 € Chef', '800 80px "Inter Tight"', '#5b4a9a']], 0, 0, 0.266);
const NETL = label(SLICE.netto.g, 0.46, 0.2, [['netto', '600 64px Poppins', '#ffffff'], ['2.054 €', '800 96px "Inter Tight"', '#ffffff']], 0, 0.25, 0.266);
NETL.children[0].material = redClay(0.1);

// ------------------------------------------------------------------ B: the big pay slip
const B = grp(S, -0.75, 0, -0.35); mat(B, 1.5, 1.2, PAL.yellow);
add(B, rbox(0.3, 0.07, 0.3, 0.02), clay(PAL.cream), 0, 0.035, -0.05); add(B, rbox(0.06, 0.5, 0.05, 0.015), clay(0xe7dfd0), 0, 0.3, -0.12);
const SLIP = grp(B, 0, 0.92, -0.05); SLIP.rotation.x = -0.12; add(SLIP, rbox(1.02, 1.22, 0.04, 0.03), clay(0xfbf8f1, {bumpScale: 1}), 0, 0, 0);
decal(SLIP, 0.96, 0.2, tex(960, 200, (g, w, h) => {T2(g, 'Lohnabrechnung', 30, 80, '800 70px "Inter Tight"', '#2b2b38', 'left'); T2(g, 'November 2026', 30, 160, '600 44px Poppins', '#8d867c', 'left');}), 0, 0.47, 0.021, {bump: 0.2});
const SLIPL = [['Brutto', '3.000 €'], ['Steuerklasse', 'I'], ['Kinder', 'keine']].map(([a, b2], i) => {const t = tex(960, 160, (g, w, h) => {g.fillStyle = '#f2ecdf'; g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 26); g.fill();
    T2(g, a, 50, h / 2 + 4, '600 60px Poppins', '#6a6a7a', 'left'); T2(g, b2, w - 50, h / 2 + 4, '800 80px "Inter Tight"', '#2b2b38', 'right');}); return decal(SLIP, 0.94, 0.157, t, 0, 0.17 - i * 0.2, 0.022, {bump: 0.2});});
decal(SLIP, 0.94, 0.3, tex(960, 300, (g, w, h) => {g.fillStyle = 'rgba(91,74,154,0.12)'; for (let k = 0; k < 4; k++) g.fillRect(50, 30 + k * 66, k % 2 ? 560 : 760, 22);}), 0, -0.4, 0.021, {bump: 0.2});

// ------------------------------------------------------------------ D: five houses where the money goes
const HX = [0.68, 1.26, 1.84, 3.72, 4.30], HZ = -0.5;   // the cart stops in the gap at x 2.75, so the tower never hides a house
const HOUSE = [['rv', 'Renten-\nversicherung', PAL.sky, 0x6f9fd8], ['kv', 'Kranken-\nkasse', PAL.mint, 0x58b48c], ['pv', 'Pflege-\nversicherung', PAL.pink, 0xd77fa3],
  ['av', 'Arbeits-\nagentur', PAL.yellow, 0xd9a03f], ['lohnsteuer', 'Finanz-\namt', 0xb9b4d6, 0x7a72a8]].map(([k, name, c, roof], i) => {
  const G = grp(S, HX[i], 0, HZ); const wt = clay(0xffffff, {map: winTex(hex(c), '#5b5a8a', 2, 2)}), pm = clay(c);
  // front: the name sign on a plain wall, the door with one small window on each side (no window behind the sign or the door)
  const wf = clay(0xffffff, {map: tex(256, 256, (g, w, h) => {g.fillStyle = hex(c); g.fillRect(0, 0, w, h); g.fillStyle = '#5b5a8a'; for (const u of [0.08, 0.71]) {g.beginPath(); g.roundRect(u * w, 0.62 * h, 0.21 * w, 0.24 * h, 6); g.fill();}})});
  add(G, rbox(0.46, 0.55, 0.45, 0.05), [wt, wt, pm, pm, wf, wt], 0, 0.275, 0);
  const r = new THREE.Shape(); r.moveTo(-0.26, 0); r.lineTo(0.26, 0); r.lineTo(0, 0.19); r.closePath(); const rg = new THREE.ExtrudeGeometry(r, {depth: 0.49, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2}); rg.translate(0, 0, -0.245);
  add(G, rg, clay(roof), 0, 0.55, 0); add(G, rbox(0.14, 0.22, 0.02, 0.02), clay(PAL.deep), 0, 0.11, 0.226);
  const sign = grp(G, 0, 0.42, 0.236); add(sign, rbox(0.44, 0.17, 0.02, 0.02), clay(0xfbf8f1), 0, 0, 0);
  decal(sign, 0.42, 0.16, tex(420, 160, (g, w, h) => {const L = name.split('\n'); L.forEach((s, j) => T2(g, s, w / 2, h * (j + 0.5) / L.length + 3, fitText(g, s, w - 30, 800, 62), '#2b2b38'));}), 0, 0, 0.011, {bump: 0.2});
  const val = label(G, 0.44, 0.16, [[{rv: '279 €', kv: '262,50 €', pv: '72 €', av: '39 €', lohnsteuer: '293 €'}[k], '800 110px "Inter Tight"']], 0, 0.95, 0.05);
  return {k, G, val, x: HX[i]};});

// ------------------------------------------------------------------ the bubble at the end
const BUB = grp(S, 0.6, 1.75, 0.2); {add(BUB, rbox(0.8, 0.5, 0.12, 0.2), clay(0xfbfaf6, {bumpScale: 1.2}), 0, 0, 0); const tl = add(BUB, new THREE.ConeGeometry(0.08, 0.18, 16), clay(0xfbfaf6, {bumpScale: 1.2}), -0.18, -0.3, 0); tl.rotation.z = -0.4;
  decal(BUB, 0.7, 0.42, tex(560, 340, (g, w, h) => {T2(g, '?', w / 2, h / 2 + 10, '800 260px "Inter Tight"', '#5b4a9a');}), 0, 0, 0.061, {bump: 0.2});}

// ------------------------------------------------------------------ timing (voice time)
const CART_X0 = -2.25, CART_X1 = 2.75, CART_ROLL = [12.95, 14.5];
const FLY = {rv: [19.55, 20.6], kv: [22.6, 23.6], pv: [24.9, 25.8], av: [26.7, 27.6], lohnsteuer: [30.25, 31.3]};
const CHEFFLY = [15.0, 16.2];   // the boss's extra part flies to the first four houses
const EMP_PATH = [[-4.25, 0.15], [-4.42, -0.35], [-4.42, -1.0], [-2.0, -1.08], [0.4, -1.1], [3.27, -1.05], [3.27, 0.42]], EMP_T = [14.2, 31.6];

// ------------------------------------------------------------------ camera
S.updateMatrixWorld(true);
const wx = (G, x, y, z) => G.localToWorld(V3(x, y, z));
const TOP = 0.13 + COL.userData.top;
const ptsA = [...[[-1.1, 0, -0.6], [1.1, 0, -0.6], [-1.1, 1.2, -0.6], [-1.1, 0, 0.65]].map(p => wx(A, ...p)), V3(-2.25 + 0.4, 0, 0.7), V3(-2.25 + 0.4, TOP + 0.3, 0.3)];
const ptsB = [[-0.75, 0, 0.6], [0.75, 0, 0.6], [-0.6, 1.55, -0.1], [0.6, 1.55, -0.1]].map(p => wx(B, ...p));
const ptsD = [V3(HX[0] - 0.3, 0, HZ - 0.25), V3(HX[4] + 0.3, 0, HZ - 0.25), V3(HX[0] - 0.3, 1.1, HZ), V3(HX[4] + 0.3, 1.1, HZ), V3(CART_X1 - 0.4, 0, 0.7), V3(CART_X1 + 0.4, 0, 0.7), V3(CART_X1, TOP - 0.3, 0.3)];
const ptsE = [V3(CART_X1 - 0.5, 0, 0.75), V3(3.35, 0, 0.75), V3(CART_X1 - 0.5, 1.4, 0.3), V3(3.35, 1.4, 0.3), V3(CART_X1, 0, -0.2)];
const ptsW = [V3(-4.7, -0.36, 1.45), V3(4.7, -0.36, 1.45), V3(-4.7, 0, -1.45), V3(4.7, 0, -1.45), V3(-3.3, 1.3, -0.6), V3(-3.0, 1.52, -0.55), V3(2.4, 1.4, -0.5), V3(0.6, 2.1, 0.2)];
const FA0 = fit(ptsA, -8, 12), FA = fit(ptsA, -12, 14), FB = fit(ptsB, -8, 10), FC = fit([...ptsD, V3(CART_X1, TOP + 0.2, 0.3)], -12, 13), FD = fit(ptsD, -10, 12), FE = fit(ptsE, -14, 12),
  FW = fit(ptsW, -34, 28, {y0: 560}), FO = fit(ptsW, -34, 26, {y0: 640, y1: 1300});
const CAM = [K(0, FA0, 0.98), K(4.3, FA0, 0.93), K(8.2, FA, 0.95), K(9.0, FB), K(12.9, FB, 0.93), K(14.3, FC), K(17.6, FC, 0.96), K(18.6, FD), K(31.4, FD, 0.95),
  K(32.3, FE), K(35.0, FE, 0.93), K(36.0, FW), K(OUT0, FW, 0.97), K(OUT0 + 1.0, FO), K(END_V + 1, FO)];
const camAt = makeCam(CAM);

// ------------------------------------------------------------------ texts
const wordsN = WORDS.filter(w => !w.text.startsWith('[') && !w.text.endsWith(']'));
const SUBG = [[9, 'Du kostest deinen Chef jeden Monat über 3.600 Euro.'], [6, 'Auf deinem Konto landen gut 2.050.'], [4, 'Wo ist der Rest?'],
  [9, 'Nehmen wir 3.000 Euro brutto, Steuerklasse eins, keine Kinder.'], [7, 'Dein Chef legt über 600 Euro obendrauf,'], [5, 'für Rente, Krankenkasse und Co.'],
  [5, 'Von deinen 3.000 gehen dann'], [5, '279 Euro an die Rentenversicherung,'], [5, 'rund 260 an die Krankenkasse,'], [4, '72 an die Pflege'],
  [5, 'und 39 an die Arbeitslosenversicherung.'], [6, 'Dazu kommen knapp 300 Euro Lohnsteuer.'], [5, 'Übrig bleiben rund 2.054 Euro.'], [6, 'Und wie viel bleibt bei dir?'], [4, 'Schreib’s in die Kommentare.']];
const SUBS = []; {let i = 0; SUBG.forEach(([n, s]) => {SUBS.push([wordsN[i].start - 0.05, wordsN[i + n - 1].end + 0.25, s]); i += n;}); for (let k = 0; k < SUBS.length - 1; k++) SUBS[k][1] = Math.min(SUBS[k][1], SUBS[k + 1][0]);}
const NUMS = [[2.35, 4.6, '3.639 €', 'kostest du deinen Chef mindestens (bei 3.000 € brutto)'], [5.8, 8.4, '2.054 €', 'landen auf deinem Konto'],
  [9.15, 12.95, '3.000 €', 'brutto · Steuerklasse I · keine Kinder'], [13.9, 17.85, '+ 639 €', 'zahlt dein Chef zusätzlich für die Sozialversicherung'],
  [19.5, 22.35, '279 €', 'Rentenversicherung (9,3 %)'], [22.6, 24.82, '262,50 €', 'Krankenkasse (7,3 % + 1,45 % Zusatzbeitrag)'], [24.84, 26.35, '72 €', 'Pflegeversicherung (2,4 % ohne Kinder)'],
  [26.4, 29.25, '39 €', 'Arbeitslosenversicherung (1,3 %)'], [29.3, 32.0, '293 €', 'Lohnsteuer'], [32.04, 35.2, '2.054 €', 'bleiben dir netto']];
const TITLES = [[-1, 2.3, '3.000 € brutto: So viel bleibt dir'], [35.25, OUT0, 'Wie viel bleibt bei dir?']];
const SRCS = [[-1, 17.85, 'Rechnung 2026: Steuerklasse I, keine Kinder, keine Kirchensteuer, Zusatzbeitrag 2,9 % (Durchschnitt) · Modell vereinfacht'],
  [17.87, 35.2, 'Quelle: Beitragssätze 2026 (DRV, GKV-Spitzenverband), Lohnsteuer nach § 32a EStG 2026 · Arbeitgeber ohne Umlagen U1/U2 und Unfallversicherung']];
const overlays = makeOverlays({SUBS, NUMS, TITLES, SRCS, OUT0});

// ------------------------------------------------------------------ helpers for the flights
const arcPos = (p0, p1, u, hgt) => V3(lerp(p0.x, p1.x, u), lerp(p0.y, p1.y, u) + Math.sin(PI * u) * hgt, lerp(p0.z, p1.z, u));
function pathAt(P, u) {const L = []; let tot = 0; for (let i = 1; i < P.length; i++) {const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); tot += d;}
  let s = clamp(u) * tot; for (let i = 0; i < L.length; i++) {if (s <= L[i] || i === L.length - 1) {const f = clamp(s / L[i]); return [lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f), Math.atan2(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1])];} s -= L[i];}}

// ------------------------------------------------------------------ the frame at voice time v
function setT(v) {
  camAt(v); overlays(v);
  // the cart rolls from the office to the houses
  const cu = eio(seg(v, ...CART_ROLL)); CART.position.x = lerp(CART_X0, CART_X1, cu); WHEELS.forEach(w => {w.rotation.y = 0; w.rotation.z = -(CART.position.x - CART_X0) / 0.065;});
  CART.updateMatrixWorld(true);
  // hook: the total label, then the net part is what you get, the rest turns see-through, a question mark
  TOTALL.scale.setScalar(Math.max(1e-3, popIn(v, 0.15, 0.35) * (1 - seg(v, 8.3, 8.6)))); TOTALL.visible = v < 8.6;
  const ghost = sm(seg(v, 5.6, 6.1)) * (1 - sm(seg(v, 8.2, 8.7)));
  for (const k of ['lohnsteuer', 'av', 'pv', 'kv', 'rv', 'chef']) SLICE[k].m.material.opacity = 1 - 0.6 * ghost;
  NETL.scale.setScalar(Math.max(1e-3, popIn(v, 5.85, 0.35) * (1 - seg(v, 8.3, 8.6)) + popIn(v, 32.1, 0.4)));
  {const q = popIn(v, 7.55, 0.35) * (1 - seg(v, 8.6, 8.9)); QM.visible = q > 0.01; QM.scale.setScalar(Math.max(1e-3, q)); QM.position.set(CART.position.x + 0.42, 0.13 + COL.userData.top - 0.25 + Math.sin(v * 5) * 0.02, 0.35);}
  // the boss points at the tower, the employee looks surprised
  arm(CHEF, -1, 0.1 + 1.2 * sm(seg(v, 0.4, 0.8)) * (1 - sm(seg(v, 3.6, 4.0)))); arm(EMP, 1, 0.1 + 0.9 * sm(seg(v, 5.9, 6.3)) * (1 - sm(seg(v, 8.0, 8.4)))); arm(EMP, -1, 0.1 + 0.9 * sm(seg(v, 7.5, 7.9)) * (1 - sm(seg(v, 8.6, 9.0))));
  // pay slip lines appear on „dreitausend Euro brutto“, „Steuerklasse eins“, „keine Kinder“
  SLIPL.forEach((d, i) => {const p = popIn(v, [9.2, 10.8, 11.96][i], 0.3); d.scale.setScalar(Math.max(1e-3, p)); d.visible = p > 0.01;});
  CHEFL.scale.setScalar(Math.max(1e-3, popIn(v, 13.4, 0.35)));
  // the boss's part flies to the first four houses, then each slice of your 3.000 € on its word
  const roots = {}; let drop = 0;
  {const u = seg(v, ...CHEFFLY), c = SLICE.chef; c.g.visible = u < 1; if (u > 0) {const p0 = CART.localToWorld(V3(0, 0.13 + c.y, 0)), p1 = V3(1.55, 0.8, HZ);
      const w = COL.worldToLocal(arcPos(p0, p1, eio(u), 0.6)); c.g.position.copy(w); c.g.scale.setScalar(Math.max(1e-3, 1 - 0.85 * eio(u)));}
    else {c.g.position.set(0, c.y, 0); c.g.scale.setScalar(1);}}
  for (const [k, [a, b]] of Object.entries(FLY)) {const c = SLICE[k], u = seg(v, a, b); c.g.visible = u < 1;
    if (u > 0) {const h = HOUSE.find(q => q.k === k), p0 = CART.localToWorld(V3(0, 0.13 + c.y, 0)), p1 = V3(h.x, 0.45, HZ + 0.1);
      c.g.position.copy(COL.worldToLocal(arcPos(p0, p1, eio(u), 0.55))); c.g.scale.set(Math.max(1e-3, 1 - 0.75 * eio(u)), 1, Math.max(1e-3, 1 - 0.75 * eio(u))); c.g.rotation.y = eio(u) * 0.8;}
    else {c.g.position.set(0, c.y, 0); c.g.scale.setScalar(1); c.g.rotation.y = 0;}}
  // the houses bounce and show the amount when their slice arrives; the four social houses also bounce when the boss's part arrives
  HOUSE.forEach((h, i) => {const at = FLY[h.k][1], b1 = Math.sin(PI * seg(v, at - 0.05, at + 0.3)) * 0.12, b0 = i < 4 ? Math.sin(PI * seg(v, CHEFFLY[1] - 0.05, CHEFFLY[1] + 0.3)) * 0.08 : 0;
    h.G.scale.set(1 + b1 * 0.5 + b0 * 0.5, 1 + b1 + b0, 1 + b1 * 0.5 + b0 * 0.5); const p = popIn(v, at, 0.35) * (1 - sm(seg(v, 31.5, 31.9)) * (1 - sm(seg(v, 35.3, 35.7)))); h.val.visible = p > 0.01; h.val.scale.setScalar(Math.max(1e-3, p));});   // amounts hide in the close-up (the frame edge would cut them) and come back for the wide shot
  // the employee walks behind the houses to the cart and takes what is left
  {const u = seg(v, ...EMP_T); if (u <= 0) {EMP.G.position.set(-0.95 + A.position.x, 0, 0.4 + A.position.z); EMP.G.rotation.y = 0.5; still(EMP);}
    else {const [x, z, h] = pathAt(EMP_PATH, sm(u)); EMP.G.position.set(x, 0, z); EMP.G.rotation.y = u < 1 ? h : lerp(h, -1.2, sm(seg(v, EMP_T[1], EMP_T[1] + 0.5))); if (u < 1) walk(EMP, v * 9, 0.5); else still(EMP);}
    if (v > 32.3) {arm(EMP, -1, 0.1 + 0.8 * sm(seg(v, 32.4, 32.8)) * (1 - sm(seg(v, 34.6, 35.0)))); arm(EMP, 1, 0.1 + 0.8 * sm(seg(v, 32.4, 32.8)) * (1 - sm(seg(v, 34.6, 35.0))));}}
  // bubble
  {const p = popIn(v, 35.5, 0.45); BUB.scale.setScalar(Math.max(1e-3, p)); BUB.position.y = 1.75 + Math.sin(v * 2) * 0.03; BUB.visible = p > 0.01;}
  dimLights(v, OUT0); outro(v, OUT0);}
// the employee is a child of A at the start; move him to the scene root so he can walk anywhere
S.attach(EMP.G);

window.CHECK = () => {const out = []; for (let v = 0; v < END_V; v += 0.1) {setT(v); const p = EMP.G.position;
  for (const h of HOUSE) if (Math.abs(p.x - h.x) < 0.38 && Math.abs(p.z - HZ) < 0.36) out.push(['house', v.toFixed(1), h.k]);
  if (Math.abs(p.x - CART.position.x) < 0.45 && Math.abs(p.z - CART.position.z) < 0.45) out.push(['cart', v.toFixed(1)]);
  if (Math.abs(p.x - B.position.x) < 0.8 && p.z > -0.95 && p.z < 0.3 && v > EMP_T[0]) out.push(['slip', v.toFixed(1)]);} return out.slice(0, 20);};
window.setT = setT;
window.TOTAL = Math.round((END_V + VO) * 30);
window.renderFrame = f => {setT(f / 30 - VO); renderer.render(scene, cam);};
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round(((q0 != null ? +q0 : 0) + VO) * 30));
window.ready = true;
