// „Weihnachtsgeld: Warum bleibt davon so wenig?“ im Knete-Look (26.11.2026). Eine Knetplatte mit vier Stationen:
// A Tannenbaum mit rotem Umschlag (roter Faden), aus dem eine Karte steigt und von „3.000 €“ auf „1.684 €“ kippt,
// B zwei Gruppen mit je zehn Figuren (mit Tarifvertrag bekommen acht ein rotes Geschenk, ohne nur vier),
// C zwei Geldtürme „Gehalt“ und „Weihnachtsgeld“ (je 3.000 €, 1.000 € = 0,55 Einheiten wie im Brutto-Video),
// D zwölf Monatsblöcke als Jahresgehalt, das rote Weihnachtsgeld landet oben beim höchsten Steuersatz.
// Rechnung 2026 (Steuerklasse I, keine Kinder, keine Kirchensteuer, Zusatzbeitrag 2,9 %): Gehalt netto 2.054,42 € (LSt 293,08 €),
// Weihnachtsgeld 3.000 € netto 1.683,50 € (LSt 664 €), Sozialabgaben jeweils 652,50 €. Alle Zeiten sind Stimm-Zeiten (voice/words.json, Take 1).
import {THREE, RED, PI, clamp, lerp, seg, sm, eo, eio, popIn, V3, renderer, scene, cam, lightRig, tex, add, grp, rbox, clay, redClay, PAL, T2, fitText,
  decal, plinth, person, arm, still, tree, fit, K, makeCam, makeOverlays, outro, dimLights} from '../../kit/knete_kit.js';

const VO = 0.15, OUT0 = 39.3, END_V = 43.05;
const WORDS = (await (await fetch('voice/words.json')).json()).words;
const S = new THREE.Group(); scene.add(S);
const BGFX = document.getElementById('bgfx');
plinth(S, 9.8, 2.6, [[-1, -1], [1, -1], [-1, 1], [1, 1]]);
lightRig(0, 0, 5.6);
const mat = (par, w, d, c) => add(par, rbox(w, 0.03, d, 0.012), clay(c, {bumpScale: 2.6}), 0, 0.015, 0);
const label = (par, w, h, lines, x, y, z, bg = 0xfbf8f1) => {const g = grp(par, x, y, z); add(g, rbox(w, h, 0.03, 0.02), bg === RED ? redClay(0.1) : clay(bg), 0, 0, 0);
  decal(g, w - 0.01, h - 0.01, tex(Math.round(w * 1000), Math.round(h * 1000), (c, ww, hh) => {const n = lines.length; lines.forEach(([s, f, col], i) => {
    T2(c, s, ww / 2, hh * (i + 0.5) / n + 3, fitText(c, s, ww - 24, f.split(' ')[0], +f.split(' ')[1].replace('px', ''), f.split(' ').slice(2).join(' ')), col || '#2b2b38');});}), 0, 0, 0.016, {bump: 0.2}); return g;};
const sign = (par, x, z, w, text, col) => {const g = grp(par, x, 0, z); for (const sx of [-1, 1]) add(g, rbox(0.04, 0.66, 0.04, 0.015), clay(0xe7dfd0), sx * (w / 2 - 0.12), 0.33, 0);
  label(g, w, 0.24, [[text, '800 110px "Inter Tight"', col]], 0, 0.78, 0); return g;};

// ------------------------------------------------------------------ A: Christmas tree, the red envelope, the card flips from 3.000 € to 1.684 €
const AX = -3.85, A = grp(S, AX, 0, -0.1); mat(A, 1.9, 1.4, PAL.sky);
{const T = grp(A, -0.35, 0, -0.3); add(T, new THREE.CylinderGeometry(0.06, 0.07, 0.2, 12), clay(0xa0704a), 0, 0.1, 0);
  [[0.48, 0.5, 0.42], [0.38, 0.45, 0.75], [0.27, 0.38, 1.04]].forEach(([r, h, y], i) => add(T, new THREE.ConeGeometry(r, h, 24), clay(PAL.tree[i % 3]), 0, y, 0));
  add(T, new THREE.IcosahedronGeometry(0.075, 1), clay(PAL.yellow, {emissive: PAL.yellow, emissiveIntensity: 0.25}), 0, 1.28, 0);
  [[0.25, 0.42, 0.28, PAL.yellow], [-0.22, 0.5, 0.3, PAL.lilac], [0.12, 0.78, 0.25, PAL.sky], [-0.15, 0.85, 0.2, PAL.yellow], [0.05, 1.02, 0.17, PAL.lilac], [0.3, 0.3, 0.05, PAL.sky]]
    .forEach(([x, y, z, c]) => add(T, new THREE.SphereGeometry(0.045, 14, 10), clay(c, {roughness: 0.5}), x, y, z));}
const ENV = grp(A, 0.25, 0, 0.25); ENV.rotation.y = -0.15;
add(ENV, rbox(0.66, 0.44, 0.06, 0.03), redClay(0.12), 0, 0.22, 0);
decal(ENV, 0.6, 0.13, tex(600, 130, (g, w, h) => T2(g, 'Weihnachtsgeld', w / 2, h / 2 + 4, fitText(g, 'Weihnachtsgeld', w - 30, 800, 80), '#ffffff')), 0, 0.14, 0.031, {bump: 0.2});
const CARD = grp(ENV, 0, 0.25, 0); CARD.visible = false;
add(CARD, rbox(0.56, 0.28, 0.02, 0.01), clay(0xfbf8f1, {bumpScale: 1}), 0, 0, 0);
decal(CARD, 0.54, 0.26, tex(540, 260, (g, w, h) => {T2(g, '3.000 €', w / 2, h / 2 + 6, '800 128px "Inter Tight"', '#2b2b38');}), 0, 0, 0.011, {bump: 0.15});
decal(CARD, 0.54, 0.26, tex(540, 260, (g, w, h) => {T2(g, '1.684 €', w / 2, h / 2 + 6, '800 128px "Inter Tight"', '#E01E2B');}), 0, 0, -0.011, {bump: 0.15, rx: PI});
const FIGA = person(A, 0.72, 0.42, {body: PAL.mint, hair: 0x3b2a20, ry: -0.9, s: 1.05});

// ------------------------------------------------------------------ B: two groups of ten, with and without a collective agreement
const GX = [-1.85, 0.0], GIFTS = [[0, 1, 2, 4, 5, 6, 8, 9], [0, 3, 6, 8]];
const ROWS = [...[-0.585, -0.325, -0.065, 0.195, 0.455].map(x => [x, -0.18]), ...[-0.455, -0.195, 0.065, 0.325, 0.585].map(x => [x, 0.2])];
const COLS = [PAL.sky, PAL.peach, PAL.lilac, PAL.yellow, 0x6f8fb0, PAL.pink, PAL.sage, PAL.apricot, PAL.mint, 0xa47ce0];
const GROUPS = GX.map((gx, g) => {const G = grp(S, gx, 0, 0); mat(G, 1.55, 1.25, g ? PAL.pink : PAL.mint);
  sign(G, 0, -0.5, 1.15, g ? 'ohne Tarifvertrag' : 'mit Tarifvertrag', '#5b4a9a');
  const figs = ROWS.map(([x, z], i) => {const p = person(G, x, z, {body: COLS[(i + g * 3) % 10], s: 0.92}); return {p, i};});
  const gifts = GIFTS[g].map((i, k) => {const [x, z] = ROWS[i]; const b = grp(G, x, 0.3, z + 0.13); b.userData.t = (g ? 11.1 : 8.7) + k * (g ? 0.22 : 0.16);
    add(b, rbox(0.13, 0.12, 0.1, 0.02), redClay(0.12), 0, 0, 0); add(b, rbox(0.03, 0.125, 0.105, 0.008), clay(0xfbf8f1), 0, 0, 0); add(b, rbox(0.135, 0.125, 0.03, 0.008), clay(0xfbf8f1), 0, 0, 0);
    for (const sx of [-1, 1]) add(b, new THREE.SphereGeometry(0.025, 10, 8), clay(0xfbf8f1), sx * 0.025, 0.075, 0).scale.set(1.2, 0.8, 0.8); return b;});
  return {G, figs, gifts};});

// ------------------------------------------------------------------ C: two money towers of 3.000 €, the same social charges, very different wage tax
const U = 0.55 / 1000, CX = [1.6, 2.5], CZ = 0.05;
const TW = [{name: 'Gehalt', slices: [['netto', 2054.42, RED, '2.054 €'], ['lst', 293.08, 0xb9b4d6, '293 €'], ['sv', 652.5, PAL.mint, '652,50 €']]},
  {name: 'Weihnachtsgeld', slices: [['netto', 1683.5, RED, '1.684 €'], ['lst', 664, 0xb9b4d6, '664 €'], ['sv', 652.5, PAL.mint, '652,50 €']]}].map((t, j) => {
  const C = grp(S, CX[j], 0, CZ); add(C, rbox(0.66, 0.06, 0.66, 0.025), clay(0xc49a64), 0, 0.1, 0);
  for (const [x, z] of [[-0.25, 0.27], [0.25, 0.27], [-0.25, -0.27], [0.25, -0.27]]) add(C, new THREE.CylinderGeometry(0.065, 0.065, 0.04, 20).rotateX(PI / 2), clay(PAL.dark), x, 0.065, z);
  const COL = grp(C, 0, 0.13, 0); const sl = {}; let y = 0;
  t.slices.forEach(([k, eur, c, txt]) => {const h = eur * U, g = grp(COL, 0, y + h / 2, 0); add(g, rbox(0.5, h, 0.5, Math.min(0.03, h / 2 - 0.001)), c === RED ? redClay(0.12) : clay(c), 0, 0, 0);
    const lh = Math.min(0.17, h - 0.03), L = c === RED ? label(g, 0.44, 0.2, [['netto', '600 64px Poppins', '#ffffff'], [txt, '800 96px "Inter Tight"', '#ffffff']], 0, h / 2 - 0.2, 0.266, RED)
      : label(g, 0.4, lh, [[txt, '800 100px "Inter Tight"']], 0, 0, 0.266); sl[k] = {g, L, h}; y += h;});
  const top = 0.13 + y, title = label(C, 0.74, 0.28, [[t.name, '700 96px Poppins', '#5b4a9a'], ['3.000 €', '800 110px "Inter Tight"']], 0, top + 0.22, 0);
  return {C, sl, title, top};});

// ------------------------------------------------------------------ D: twelve monthly blocks = the year's salary, the red Christmas bonus lands on top
const DX = 3.85, D = grp(S, DX, 0, -0.05); mat(D, 1.6, 1.3, PAL.yellow);
const BH = 0.085, MONTHS = Array.from({length: 12}, (_, i) => {const b = add(D, rbox(0.52, BH - 0.006, 0.42, 0.02), clay([PAL.lilac, 0xb9a3ea][i % 2]), 0.2, 0.03 + BH * (i + 0.5), 0); b.userData.t = 30.6 + i * 0.07; return b;});
const STACKTOP = 0.03 + 12 * BH;
const XMAS = grp(D, 0.2, 0, 0); add(XMAS, rbox(0.54, BH + 0.01, 0.44, 0.02), redClay(0.15), 0, 0, 0);
decal(XMAS, 0.46, 0.07, tex(460, 70, (g, w, h) => T2(g, 'Weihnachtsgeld', w / 2, h / 2 + 3, fitText(g, 'Weihnachtsgeld', w - 20, 800, 54), '#ffffff')), 0, 0, 0.221, {bump: 0.1});
label(D, 0.5, 0.13, [['12 × Gehalt', '800 84px "Inter Tight"']], 0.2, 0.32, 0.23);
{const R0 = grp(D, -0.35, 0, 0.05); const h = STACKTOP + BH + 0.06;   // the tax-rate scale next to the stack: low at the bottom, highest at the top
  add(R0, rbox(0.1, h, 0.1, 0.03), clay(0xffffff, {map: tex(16, 256, (g, w, hh) => {const gr = g.createLinearGradient(0, hh, 0, 0); gr.addColorStop(0, '#9fe0c6'); gr.addColorStop(0.55, '#f7dd7c'); gr.addColorStop(1, '#f6b38f'); g.fillStyle = gr; g.fillRect(0, 0, w, hh);})}), 0, h / 2, 0);
  add(R0, new THREE.ConeGeometry(0.09, 0.14, 18), clay(0xf6b38f), 0, h + 0.07, 0);
  label(R0, 0.36, 0.11, [['niedrig', '600 70px Poppins', '#6a6a7a']], -0.02, 0.16, 0.08);}
const RATE = label(D, 0.36, 0.16, [['28 %', '800 120px "Inter Tight"', '#E01E2B']], -0.33, STACKTOP + BH / 2 + 0.02, 0.2);

// ------------------------------------------------------------------ the bubble at the end
const BUB = grp(S, 0.2, 2.35, 0.2); {add(BUB, rbox(0.8, 0.5, 0.12, 0.2), clay(0xfbfaf6, {bumpScale: 1.2}), 0, 0, 0); const tl = add(BUB, new THREE.ConeGeometry(0.08, 0.18, 16), clay(0xfbfaf6, {bumpScale: 1.2}), -0.18, -0.3, 0); tl.rotation.z = -0.4;
  decal(BUB, 0.7, 0.42, tex(560, 340, (g, w, h) => {T2(g, '?', w / 2, h / 2 + 10, '800 260px "Inter Tight"', '#5b4a9a');}), 0, 0, 0.061, {bump: 0.2});}

// ------------------------------------------------------------------ camera
S.updateMatrixWorld(true);
const wx = (G, x, y, z) => G.localToWorld(V3(x, y, z));
const ptsA = [[-0.95, 0, -0.75], [1.1, 0, -0.75], [-0.95, 1.4, -0.4], [1.1, 0, 0.75], [-0.95, 0, 0.75], [0.4, 1.0, 0.25]].map(p => wx(A, ...p));
const ptsB = [V3(GX[0] - 0.8, 0, 0.65), V3(GX[1] + 0.8, 0, 0.65), V3(GX[0] - 0.8, 0.95, -0.5), V3(GX[1] + 0.8, 0.95, -0.5)];
const ptsBg = gx => [V3(gx - 0.8, 0, 0.65), V3(gx + 0.8, 0, 0.65), V3(gx - 0.8, 0.95, -0.5), V3(gx + 0.8, 0.95, -0.5)];
const ptsC = [V3(CX[0] - 0.4, 0, 0.45), V3(CX[1] + 0.4, 0, 0.45), V3(CX[0] - 0.42, TW[0].top + 0.38, CZ), V3(CX[1] + 0.42, TW[1].top + 0.38, CZ)];
const ptsD = [wx(D, -0.8, 0, 0.65), wx(D, 0.8, 0, 0.65), wx(D, -0.6, STACKTOP + 0.3, 0), wx(D, 0.6, STACKTOP + 0.3, 0)];
const ptsW = [V3(-4.9, -0.36, 1.3), V3(4.9, -0.36, 1.3), V3(-4.9, 0, -1.3), V3(4.9, 0, -1.3), V3(1.5, 2.05, 0.05), V3(0.2, 2.65, 0.2), V3(-4.1, 1.4, -0.4)];
const FA0 = fit(ptsA, -8, 12), FA = fit(ptsA, -12, 14), FB = fit(ptsB, -8, 16), FB1 = fit(ptsBg(GX[0]), -10, 15), FB2 = fit(ptsBg(GX[1]), -10, 15), FC = fit(ptsC, -10, 10), FD = fit(ptsD, -12, 12),
  FW = fit(ptsW, -34, 28, {y0: 560}), FO = fit(ptsW, -34, 26, {y0: 640, y1: 1300});
const CAM = [K(0, FA0, 0.98), K(2.6, FA0, 0.92), K(4.9, FA, 0.95), K(5.8, FB), K(7.6, FB, 0.97), K(8.4, FB1), K(10.5, FB1, 0.95), K(11.2, FB2), K(12.5, FB2, 0.95), K(13.4, FC), K(30.0, FC, 0.9),
  K(30.9, FD), K(35.2, FD, 0.94), K(36.2, FW), K(OUT0, FW, 0.97), K(OUT0 + 1.0, FO), K(END_V + 1, FO)];
const camAt = makeCam(CAM);

// ------------------------------------------------------------------ texts
const wordsN = WORDS.filter(w => !w.text.startsWith('[') && !w.text.endsWith(']'));
const SUBG = [[3, '3.000 Euro Weihnachtsgeld?'], [6, 'Auf dem Konto landen knapp 1.700.'], [7, 'Überhaupt bekommt nur etwa jeder Zweite Weihnachtsgeld.'],
  [7, 'Mit Tarifvertrag sind es fast acht von zehn,'], [4, 'ohne nur gut vier.'], [7, 'Nehmen wir 3.000 Euro brutto, Steuerklasse eins.'],
  [8, 'Von deinem normalen Gehalt bleiben rund 2.050 Euro.'], [8, 'Vom Weihnachtsgeld in gleicher Höhe nur knapp 1.700.'], [4, 'Die Sozialabgaben sind gleich.'],
  [9, 'Aber die Lohnsteuer ist mehr als doppelt so hoch:'], [6, 'rund 660 statt knapp 300 Euro.'], [8, 'Denn das Weihnachtsgeld kommt oben auf dein Jahresgehalt,'],
  [7, 'und dort ist der Steuersatz am höchsten.'], [3, 'Bekommst du Weihnachtsgeld?'], [4, 'Schreib’s in die Kommentare.']];
const SUBS = []; {let i = 0; SUBG.forEach(([n, s]) => {SUBS.push([wordsN[i].start - 0.05, wordsN[i + n - 1].end + 0.25, s]); i += n;}); for (let k = 0; k < SUBS.length - 1; k++) SUBS[k][1] = Math.min(SUBS[k][1], SUBS[k + 1][0]);}
const NUMS = [[3.75, 5.3, '1.684 €', 'bleiben von 3.000 € Weihnachtsgeld'], [5.45, 8.45, '52 %', 'der Beschäftigten bekommen 2026 Weihnachtsgeld'], [8.5, 11.0, '78 %', 'mit Tarifvertrag'],
  [11.02, 12.8, '42 %', 'ohne Tarifvertrag'], [13.4, 16.15, '3.000 €', 'brutto · Steuerklasse I · keine Kinder'], [16.2, 19.68, '2.054 €', 'netto vom normalen Gehalt'],
  [19.72, 22.95, '1.684 €', 'netto vom Weihnachtsgeld in gleicher Höhe'], [23.0, 24.82, '652,50 €', 'Sozialabgaben, bei beiden gleich'], [25.1, 30.5, '664 €', 'Lohnsteuer aufs Weihnachtsgeld statt 293 € aufs Gehalt'],
  [31.85, 35.6, '28 %', 'Steuersatz auf die obersten Euro deines Jahres']];
const TITLES = [[-1, 3.7, 'Weihnachtsgeld: Warum bleibt so wenig?'], [35.7, OUT0, 'Bekommst du Weihnachtsgeld?']];
const SRCS = [[-1, 12.8, 'Quelle: WSI-Tarifarchiv (Lohnspiegel.de-Befragung 2025/26, nicht repräsentativ) · Modell vereinfacht'],
  [12.85, 35.6, 'Rechnung 2026: Steuerklasse I, keine Kinder, keine Kirchensteuer, Zusatzbeitrag 2,9 %, Weihnachtsgeld = ein Monatsgehalt · Modell vereinfacht']];
const overlays = makeOverlays({SUBS, NUMS, TITLES, SRCS, OUT0});

// ------------------------------------------------------------------ the frame at voice time v
function setT(v) {
  camAt(v); overlays(v);
  // A: the card rises out of the envelope, tips over on „siebzehnhundert“ (top away from the camera) and shows 1.684 €
  {const r = eio(seg(v, 1.4, 2.2)); CARD.visible = v > 1.4; CARD.position.y = lerp(0.25, 0.66, r);
    const f = eio(seg(v, 3.85, 4.45)), st = seg(v, 4.45, 5.0); CARD.rotation.x = -f * PI + Math.sin(st * PI * 2) * 0.08 * (1 - st);
    ENV.position.y = Math.sin(PI * seg(v, 0.25, 0.6)) * 0.04;}
  arm(FIGA, -1, 0.1 + 2.0 * sm(seg(v, 4.1, 4.45)) * (1 - sm(seg(v, 5.3, 5.7)))); arm(FIGA, 1, 0.1 + 2.0 * sm(seg(v, 4.1, 4.45)) * (1 - sm(seg(v, 5.3, 5.7))));
  FIGA.G.rotation.y = -0.9 + 0.5 * sm(seg(v, 4.1, 4.5));
  // B: the gifts pop up, eight on the left on „acht von zehn“, four on the right on „gut vier“; who gets one lifts it a little
  GROUPS.forEach(({figs, gifts}, g) => {figs.forEach(({p, i}) => {p.B.position.y = Math.abs(Math.sin(v * 2.1 + i * 0.9 + g)) * 0.005;});
    gifts.forEach(b => {const p = popIn(v, b.userData.t, 0.35); b.visible = p > 0.01; b.scale.setScalar(Math.max(1e-3, p)); b.position.y = 0.3 + 0.03 * Math.sin(PI * seg(v, b.userData.t + 0.3, b.userData.t + 0.9));});});
  // C: towers pop up on „dreitausend Euro brutto“, the net labels on their words, social charges bounce together, the wage tax pulses
  TW.forEach(({C, sl, title}, j) => {const p = popIn(v, 13.45 + j * 0.15, 0.45); C.scale.setScalar(Math.max(1e-3, p)); C.visible = p > 0.01;
    const nl = popIn(v, j ? 21.85 : 18.0, 0.35); sl.netto.L.scale.setScalar(Math.max(1e-3, nl));
    const sv = popIn(v, 23.15 + j * 0.12, 0.35); sl.sv.L.scale.setScalar(Math.max(1e-3, sv)); sl.sv.g.scale.setScalar(1 + 0.05 * Math.sin(PI * seg(v, 23.15, 23.7)));
    const ls = popIn(v, j ? 27.8 : 29.2, 0.35); sl.lst.L.scale.setScalar(Math.max(1e-3, ls)); sl.lst.g.scale.set(1 + (j ? 0.07 : 0.03) * Math.sin(PI * seg(v, 25.2, 26.0)), 1, 1 + (j ? 0.07 : 0.03) * Math.sin(PI * seg(v, 25.2, 26.0)));
    title.scale.setScalar(Math.max(1e-3, popIn(v, 13.7 + j * 0.15, 0.35)));});
  // D: the twelve months stack up, the red Christmas bonus drops on top, „28 %“ pops next to it on „Steuersatz“
  MONTHS.forEach(b => {const p = popIn(v, b.userData.t, 0.3); b.visible = p > 0.01; b.scale.setScalar(Math.max(1e-3, p));});
  {const u = eo(seg(v, 31.9, 32.45)); XMAS.visible = v > 31.75; XMAS.position.y = lerp(STACKTOP + 0.9, STACKTOP + (BH + 0.01) / 2, u) + Math.sin(PI * seg(v, 32.45, 32.75)) * 0.02;
    XMAS.scale.setScalar(Math.max(1e-3, sm(seg(v, 31.75, 31.95))));
    RATE.scale.setScalar(Math.max(1e-3, popIn(v, 34.2, 0.35)));}
  // bubble
  {const p = popIn(v, 35.9, 0.45); BUB.scale.setScalar(Math.max(1e-3, p)); BUB.position.y = 2.35 + Math.sin(v * 2) * 0.03; BUB.visible = p > 0.01;}
  // the snow in the winter-night background falls slowly (the pattern repeats every 1920 px)
  BGFX.style.backgroundPosition = `${Math.sin(v * 0.4) * 12}px ${((v + 1) * 38) % 1920}px`;
  dimLights(v, OUT0); outro(v, OUT0);}

// collision check: the card must never touch the envelope, the Christmas bonus must not sink into the stack
window.CHECK = () => {const out = []; for (let v = 0; v < END_V; v += 0.05) {setT(v);
  if (CARD.visible && v > 2.2) {const bot = CARD.position.y - Math.abs(Math.sin(CARD.rotation.x)) * 0.02 - Math.abs(Math.cos(CARD.rotation.x)) * 0.14; if (bot < 0.45) out.push(['card', v.toFixed(2), bot.toFixed(3)]);}
  if (XMAS.visible && XMAS.position.y - (BH + 0.01) / 2 < STACKTOP - 0.001) out.push(['xmas', v.toFixed(2)]);} return out.slice(0, 20);};
window.setT = setT;
window.TOTAL = Math.round((END_V + VO) * 30);
window.renderFrame = f => {setT(f / 30 - VO); renderer.render(scene, cam);};
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round(((q0 != null ? +q0 : 0) + VO) * 30));
window.ready = true;
