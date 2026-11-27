// Kartenspiel-Video (Stiltest 27.11.2026): gemeinsamer Kern für alle Looks.
// 52 gezeichnete Karten, Mischen (Riffle) ohne Durchdringung, Brücke, Umdrehen, Rosetten-Fächer, roter Faden, Fallblatt-Zahl, Texte, Kamera.
import * as THREE from 'three';
export {THREE};
export const W = 1080, H = 1920, PI = Math.PI, FPS = 30, RED = 0xE01E2B;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const sm = u => u * u * (3 - 2 * u), smr = u => u * u * u * (u * (u * 6 - 15) + 10);
export const eo = u => 1 - Math.pow(1 - u, 3), ei = u => u * u * u, eio = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
export const back = u => {if (u <= 0) return 0; if (u >= 1) return 1; const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);};
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
export const tex = (w, h, draw, o = {}) => {const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = o.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.anisotropy = 8; if (o.repeat) {t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...o.repeat);} return t;};
export const rr = (g, x, y, w, h, r) => {g.beginPath(); g.roundRect(x, y, w, h, r);};

await Promise.all(['400 40px Poppins', '500 40px Poppins', '600 40px Poppins', '800 96px "Inter Tight"', '600 40px "Inter Tight"'].map(f => document.fonts.load(f)));

// ------------------------------------------------------------------ card size (1 unit = 10 cm): poker card 63 × 88 mm
export const CW = 0.63, CL = 0.88, CT = 0.0042, CRAD = 0.035;
const SUITS = ['S', 'H', 'C', 'D'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const isRed = id => SUITS[Math.floor(id / 13)] === 'H' || SUITS[Math.floor(id / 13)] === 'D';

// suit symbols as filled vector shapes centred on (0,0), s = height
export function suit(g, s, x, y, size, col, rot = 0) {g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; const k = size;
  const circ = (cx, cy, r) => {g.beginPath(); g.arc(cx * k, cy * k, r * k, 0, PI * 2); g.fill();};
  const poly = p => {g.beginPath(); p.forEach(([a, b], i) => i ? g.lineTo(a * k, b * k) : g.moveTo(a * k, b * k)); g.closePath(); g.fill();};
  const stem = () => {g.beginPath(); g.moveTo(-0.03 * k, 0.12 * k); g.quadraticCurveTo(-0.02 * k, 0.42 * k, -0.2 * k, 0.5 * k); g.lineTo(0.2 * k, 0.5 * k); g.quadraticCurveTo(0.02 * k, 0.42 * k, 0.03 * k, 0.12 * k); g.closePath(); g.fill();};
  if (s === 'H') {circ(-0.235, -0.17, 0.262); circ(0.235, -0.17, 0.262); poly([[-0.488, -0.1], [0, 0.48], [0.488, -0.1], [0, -0.18]]);}
  if (s === 'S') {circ(-0.235, 0.06, 0.25); circ(0.235, 0.06, 0.25); poly([[-0.47, 0.13], [0, -0.5], [0.47, 0.13], [0, 0.2]]); stem();}
  if (s === 'C') {circ(0, -0.24, 0.215); circ(-0.235, 0.06, 0.215); circ(0.235, 0.06, 0.215); circ(0, -0.02, 0.12); stem();}
  if (s === 'D') {g.beginPath(); g.moveTo(0, -0.5 * k); g.quadraticCurveTo(0.12 * k, -0.18 * k, 0.37 * k, 0); g.quadraticCurveTo(0.12 * k, 0.18 * k, 0, 0.5 * k);
    g.quadraticCurveTo(-0.12 * k, 0.18 * k, -0.37 * k, 0); g.quadraticCurveTo(-0.12 * k, -0.18 * k, 0, -0.5 * k); g.fill();}
  g.restore();}

const PIPS = {2: [[1, .2], [1, .8]], 3: [[1, .2], [1, .5], [1, .8]], 4: [[0, .2], [2, .2], [0, .8], [2, .8]], 5: [[0, .2], [2, .2], [1, .5], [0, .8], [2, .8]],
  6: [[0, .2], [2, .2], [0, .5], [2, .5], [0, .8], [2, .8]], 7: [[0, .2], [2, .2], [1, .35], [0, .5], [2, .5], [0, .8], [2, .8]],
  8: [[0, .2], [2, .2], [1, .35], [0, .5], [2, .5], [1, .65], [0, .8], [2, .8]], 9: [[0, .2], [2, .2], [0, .4], [2, .4], [1, .5], [0, .6], [2, .6], [0, .8], [2, .8]],
  10: [[0, .2], [2, .2], [1, .3], [0, .4], [2, .4], [0, .6], [2, .6], [1, .7], [0, .8], [2, .8]]};

// a card face; P = palette {bg, red, ink, gold, navy, skin, frame, glow}
export function drawFace(g, w, h, id, P) {const s = SUITS[Math.floor(id / 13)], r = RANKS[id % 13], col = isRed(id) ? P.red : P.ink;
  g.fillStyle = P.bg; g.fillRect(0, 0, w, h);
  if (P.paper) {const R = rng(id * 31 + 7); for (let i = 0; i < 900; i++) {g.fillStyle = `rgba(0,0,0,${0.012 + R() * 0.02})`; g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2);}}
  if (P.glow) {g.shadowColor = col; g.shadowBlur = P.glow;}
  if (P.line) {g.strokeStyle = P.line; g.lineWidth = 3; rr(g, 14, 14, w - 28, h - 28, 26); g.stroke();}
  // corner indices (top left and, turned, bottom right)
  for (const rot of [0, PI]) {g.save(); g.translate(w / 2, h / 2); g.rotate(rot); g.translate(-w / 2, -h / 2);
    g.fillStyle = col; g.font = `800 ${r === '10' ? 78 : 88}px "Inter Tight"`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.letterSpacing = r === '10' ? '-6px' : '0px';
    g.fillText(r, 62, 104); g.letterSpacing = '0px'; suit(g, s, 62, 150, 58, col); g.restore();}
  const cx = [0.3 * w, 0.5 * w, 0.7 * w];
  if (r === 'A') {suit(g, s, w / 2, h / 2, s === 'S' ? 270 : 230, col);
    if (s === 'S') {g.strokeStyle = col; g.lineWidth = 3; for (const rad of [175, 192]) {g.beginPath(); g.arc(w / 2, h / 2 + 6, rad, 0, PI * 2); g.stroke();}
      g.font = '600 22px "Inter Tight"'; g.fillStyle = col; g.textAlign = 'center'; g.fillText('52 ! · 8,07 × 10⁶⁷', w / 2, h / 2 + 238);}}
  else if (PIPS[r]) for (const [c, y] of PIPS[r]) suit(g, s, cx[c], 90 + y * (h - 180), 82, col, y > 0.5 ? PI : 0);
  else court(g, w, h, s, r, col, P);
  g.shadowBlur = 0;}

function court(g, w, h, s, r, col, P) {const x0 = 118, y0 = 92, fw = w - 236, fh = h - 184;
  g.save(); rr(g, x0, y0, fw, fh, 18); g.fillStyle = P.frame; g.fill(); g.lineWidth = 4; g.strokeStyle = col; g.stroke(); g.clip();
  for (const rot of [0, PI]) {g.save(); g.translate(w / 2, h / 2); g.rotate(rot); g.translate(-w / 2, -h / 2);
    g.beginPath(); g.rect(x0, y0, fw, fh / 2); g.clip();
    const cx = w / 2, hy = y0 + fh * 0.27, hr = 40;
    // robe with stripes
    g.fillStyle = col; g.beginPath(); g.moveTo(cx - 52, hy + 52); g.lineTo(cx + 52, hy + 52); g.lineTo(cx + 140, y0 + fh / 2); g.lineTo(cx - 140, y0 + fh / 2); g.closePath(); g.fill();
    g.fillStyle = P.gold; for (let i = 0; i < 4; i++) g.fillRect(cx - 120 + i * 0, y0 + fh / 2 - 34 + i * 0, 240, 6);
    g.fillStyle = P.navy; g.beginPath(); g.moveTo(cx - 24, hy + 52); g.lineTo(cx + 24, hy + 52); g.lineTo(cx + 46, y0 + fh / 2); g.lineTo(cx - 46, y0 + fh / 2); g.closePath(); g.fill();
    g.fillStyle = P.gold; for (let i = 0; i < 6; i++) {g.beginPath(); g.arc(cx, hy + 74 + i * 22, 5, 0, PI * 2); g.fill();}
    // collar zig-zag
    g.fillStyle = P.bg; g.beginPath(); g.moveTo(cx - 62, hy + 46); for (let i = 0; i <= 8; i++) g.lineTo(cx - 62 + i * 15.5, hy + 46 + (i % 2 ? 22 : 0)); g.lineTo(cx + 62, hy + 40); g.lineTo(cx - 62, hy + 40); g.fill();
    // head
    g.fillStyle = P.skin; g.beginPath(); g.arc(cx, hy, hr, 0, PI * 2); g.fill();
    g.fillStyle = P.ink2 || '#1d1d24'; for (const sx of [-1, 1]) {g.beginPath(); g.arc(cx + sx * 14, hy - 2, 4.2, 0, PI * 2); g.fill();}
    g.fillRect(cx - 9, hy + 17, 18, 3);
    if (r === 'K') {g.fillStyle = P.gold; g.beginPath(); g.moveTo(cx - 44, hy - 26); g.lineTo(cx - 44, hy - 78); g.lineTo(cx - 22, hy - 50); g.lineTo(cx, hy - 88); g.lineTo(cx + 22, hy - 50); g.lineTo(cx + 44, hy - 78); g.lineTo(cx + 44, hy - 26); g.closePath(); g.fill();
      g.fillStyle = P.ink2 || '#1d1d24'; g.fillRect(cx - 36, hy + 24, 72, 12); // beard band
      g.strokeStyle = P.gold; g.lineWidth = 7; g.beginPath(); g.moveTo(cx + 92, y0 + 26); g.lineTo(cx + 92, y0 + fh / 2); g.stroke(); g.fillRect(cx + 74, y0 + 120, 36, 8);}
    if (r === 'Q') {g.fillStyle = P.gold; g.beginPath(); g.ellipse(cx, hy - 36, 46, 18, 0, PI, 0); g.fill();
      for (let i = -2; i <= 2; i++) {g.beginPath(); g.arc(cx + i * 20, hy - 56 - (2 - Math.abs(i)) * 6, 7, 0, PI * 2); g.fill();}
      g.fillStyle = P.ink2 || '#1d1d24'; g.beginPath(); g.ellipse(cx - 44, hy + 16, 13, 46, 0.1, 0, PI * 2); g.fill(); g.beginPath(); g.ellipse(cx + 44, hy + 16, 13, 46, -0.1, 0, PI * 2); g.fill();
      g.fillStyle = P.gold; for (let a = 0; a < 6; a++) {g.beginPath(); g.arc(cx - 92 + Math.cos(a) * 16, y0 + 110 + Math.sin(a) * 16, 9, 0, PI * 2); g.fill();}
      g.strokeStyle = P.navy; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 92, y0 + 126); g.lineTo(cx - 92, y0 + fh / 2); g.stroke();}
    if (r === 'J') {g.fillStyle = P.navy; g.beginPath(); g.ellipse(cx, hy - 30, 50, 24, 0, PI, 0); g.fill(); g.fillRect(cx - 54, hy - 32, 108, 10);
      g.strokeStyle = P.gold; g.lineWidth = 6; g.beginPath(); g.moveTo(cx + 30, hy - 44); g.quadraticCurveTo(cx + 90, hy - 110, cx + 70, hy - 150); g.stroke();
      g.fillStyle = P.ink2 || '#1d1d24'; g.fillRect(cx - 40, hy - 22, 80, 12);
      g.fillStyle = P.gold; g.beginPath(); g.ellipse(cx - 92, y0 + 150, 12, 40, 0.3, 0, PI * 2); g.fill();}
    suit(g, s, x0 + 34, y0 + 40, 40, col);
    g.restore();}
  g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, h / 2); g.lineTo(x0 + fw, h / 2); g.stroke();
  g.fillStyle = P.frame; g.beginPath(); g.arc(w / 2, h / 2, 20, 0, PI * 2); g.fill(); suit(g, s, w / 2, h / 2, 26, col);
  g.restore(); g.lineWidth = 4; g.strokeStyle = col; rr(g, x0, y0, fw, fh, 18); g.stroke();}

// card back: B = {bg, line, accent, mono}
export function drawBack(g, w, h, B) {g.fillStyle = B.edge || '#fbfaf6'; g.fillRect(0, 0, w, h); g.fillStyle = B.bg; rr(g, 22, 22, w - 44, h - 44, 22); g.fill();
  g.save(); rr(g, 22, 22, w - 44, h - 44, 22); g.clip();
  g.strokeStyle = B.line; g.lineWidth = 2; for (let i = -40; i < 40; i++) {g.beginPath(); g.moveTo(i * 26, 0); g.lineTo(i * 26 + h, h); g.stroke(); g.beginPath(); g.moveTo(i * 26 + h, 0); g.lineTo(i * 26, h); g.stroke();}
  g.restore();
  g.strokeStyle = B.accent; g.lineWidth = 3; rr(g, 40, 40, w - 80, h - 80, 16); g.stroke(); g.lineWidth = 1.5; rr(g, 50, 50, w - 100, h - 100, 12); g.stroke();
  g.fillStyle = B.bg; g.beginPath(); g.arc(w / 2, h / 2, 104, 0, PI * 2); g.fill();
  g.strokeStyle = B.accent; for (const [rad, lw] of [[100, 3], [88, 1.5], [62, 1.5]]) {g.lineWidth = lw; g.beginPath(); g.arc(w / 2, h / 2, rad, 0, PI * 2); g.stroke();}
  for (let i = 0; i < 4; i++) {const a = i * PI / 2 - PI / 2; suit(g, SUITS[i], w / 2 + Math.cos(a) * 75, h / 2 + Math.sin(a) * 75, 22, B.accent);}
  g.fillStyle = B.accent; g.font = '600 46px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('52', w / 2, h / 2 + 2);}

// ------------------------------------------------------------------ card meshes (rounded rectangle, front/back faces + paper edge, bend in the vertex shader)
const shape = (() => {const s = new THREE.Shape(), x = CW / 2, y = CL / 2, r = CRAD; s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r); s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y); s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y); return s;})();
function faceGeo(up) {const g = new THREE.ShapeGeometry(shape, 8); const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / CW + 0.5, p.getY(i) / CL + 0.5);
  g.rotateX(-PI / 2); if (!up) {g.rotateZ(PI);} g.translate(0, up ? CT / 2 : -CT / 2, 0); return subdivide(g);}
function subdivide(g) {return g;}   // the rounded shape is fine enough for the gentle bend
const edgeGeo = (() => {const g = new THREE.ExtrudeGeometry(shape, {depth: CT, bevelEnabled: false, curveSegments: 8}); g.rotateX(-PI / 2); g.translate(0, -CT / 2, 0); return g;})();
const FRONT = faceGeo(true), BACKG = faceGeo(false);
// bend: y += bow * (1 - (z / half)^2)  (middle up), the same for all three parts of a card
function bendify(m, u) {m.onBeforeCompile = sh => {sh.uniforms.uBow = u; sh.vertexShader = 'uniform float uBow;\n' + sh.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\n float zq = transformed.z / ' + (CL / 2).toFixed(4) + '; transformed.y += uBow * (1.0 - zq * zq);');}; m.customProgramCacheKey = () => 'bow'; return m;}
export function makeDeck(par, {face, backMat, edgeMat}) {const cards = [];
  for (let id = 0; id < 52; id++) {const G = new THREE.Group(); par.add(G); const u = {value: 0};
    const fm = bendify(face(id), u), bm = bendify(backMat.clone(), u), em = bendify(edgeMat.clone(), u);
    const f = new THREE.Mesh(FRONT, fm), b = new THREE.Mesh(BACKG, bm), e = new THREE.Mesh(edgeGeo, [new THREE.MeshBasicMaterial({visible: false}), em]);
    for (const m of [f, b, e]) {m.castShadow = true; m.receiveShadow = true; G.add(m);}
    cards.push({id, G, u, f, b, e});}
  return cards;}

// ------------------------------------------------------------------ choreography (time in seconds of the test timeline)
export const T = {cut0: 0.35, cut1: 0.7, down1: 0.85, tilt0: 0.85, tilt1: 1.1, rif0: 1.15, rif1: 2.55, fly: 0.2, sq0: 2.8, sq1: 3.15, br0: 3.25, br1: 3.6, br2: 4.0,
  flip0: 4.1, flip1: 4.95, fan0: 5.0, fan1: 6.5, thr0: 6.7, thr1: 8.0};
export const TILT = 0.34, HALF_OUT = 0.94, PILE_OUT = 0.77, LIFT = 0.012;
const R0 = rng(52); const D0 = Array.from({length: 52}, (_, i) => i).sort(() => R0() - 0.5);   // bottom -> top, face down
const HL = D0.slice(26), HR = D0.slice(0, 26);   // top half goes left, bottom half right
// release sequence: packets of 1-3 cards alternately from the bottoms of both halves
const REL = []; {const R = rng(9); let l = 0, r = 0, side = R() < 0.5 ? 0 : 1;
  while (l < 26 || r < 26) {let n = 1 + (R() < 0.35 ? 1 : 0) + (R() < 0.08 ? 1 : 0); while (n-- > 0) {if (side === 0 && l < 26) REL.push([0, l++]); else if (side === 1 && r < 26) REL.push([1, r++]);} side = 1 - side;}}
const relT = i => T.rif0 + i / 51 * (T.rif1 - T.rif0 - T.fly);
const RIDX = {}; REL.forEach(([s, j], i) => {RIDX[(s ? HR : HL)[j]] = i;});
export const ORDER = REL.map(([s, j]) => (s ? HR : HL)[j]);        // bottom -> top after the riffle (face down)
export const FAN = ORDER.slice().reverse();                         // bottom -> top after turning the deck face up
const q = new THREE.Quaternion(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), e = new THREE.Euler(), v3 = new THREE.Vector3();
const Y = V3(0, 1, 0), Z = V3(0, 0, 1), X = V3(1, 0, 0);
const qYaw = new THREE.Quaternion().setFromAxisAngle(Y, PI / 2), qDown = new THREE.Quaternion().setFromAxisAngle(Z, PI);
const qLand = qYaw.clone().multiply(qDown);   // landscape, face down
const QD1 = new THREE.Quaternion().setFromAxisAngle(Z, PI);   // deck frame after turning over (portrait); card = QD * qDown = identity
export const FAN_PIV = 0.58, FAN_ANG = 5.75;
// fan pose of the card at height level k (0 = bottom): rotate about a pivot beyond the card's bottom edge
export function fanPose(k, u, out) {const phi = (FAN_ANG / 2 - k / 51 * FAN_ANG) * u; q.setFromAxisAngle(Y, phi); out.q.copy(q);
  out.p.set(0, 0, -FAN_PIV).applyQuaternion(q).add(v3.set(0, k * CT + CT / 2, FAN_PIV)); return out;}
const tmp = {p: V3(0, 0, 0), q: new THREE.Quaternion()};
// count of released cards (smooth)
const relCount = v => {let n = 0; for (let i = 0; i < 52; i++) n += clamp((v - relT(i)) / 0.05); return n;};
export function poseDeck(cards, v, origin = V3(0, 0, 0)) {
  const tilt = TILT * eio(seg(v, T.tilt0, T.tilt1)), bowHeld = 0.028 * eio(seg(v, T.tilt0, T.tilt1));
  const pileTop = relCount(v) * CT, sq = eio(seg(v, T.sq0, T.sq1));
  const bb0 = seg(v, T.br0, T.br1), bb1 = seg(v, T.br1, T.br2);
  const bridge = v < T.br1 ? 0.07 * sm(bb0) : bb1 < 1 ? 0.07 * Math.exp(-6 * bb1) * (0.5 + 0.5 * Math.cos(bb1 * 18)) * (1 - bb1) : 0;
  const relSide = side => {let n = 0; for (let i = 0; i < 52; i++) if (REL[i][0] === side) n += clamp((v - relT(i)) / 0.05); return n;};
  const mL = relSide(0), mR = relSide(1);
  for (const c of cards) {const id = c.id, P = c.G.position, Q = c.G.quaternion; let bow = 0;
    const inL = HL.includes(id), half = inL ? HL : HR, j = half.indexOf(id), dir = inL ? -1 : 1, ri = RIDX[id], ts = relT(ri);
    if (v < T.tilt0) {   // whole deck, then cut into two halves side by side (the top half passes above the bottom half)
      const cu = eio(seg(v, T.cut0, T.cut1)), dn = eio(seg(v, T.cut1, T.down1)), k0 = D0.indexOf(id);
      if (inL) P.set(-0.5 * cu, k0 * CT + CT / 2 + LIFT * Math.sin(PI * Math.min(1, cu * 1.4)) * (1 - dn) - 26 * CT * dn, 0);
      else P.set(0.5 * cu, k0 * CT + CT / 2, 0);
      Q.copy(qLand);}
    else if (v < ts) {   // still in its tilted half; the half rides on top of everything already released
      const lev = j - (inL ? mL : mR);
      qa.setFromAxisAngle(Z, -dir * tilt); Q.copy(qa).multiply(qLand);
      P.set(-dir * CL / 2, lev * CT + CT / 2, 0).applyQuaternion(qa).add(v3.set(dir * HALF_OUT, pileTop + 0.002, 0)); bow = bowHeld;}
    else if (v < ts + T.fly) {   // flies down about its outer end, then slides inwards over the other half's cards
      const u = seg(v, ts, ts + T.fly), ang = tilt * (1 - eo(seg(u, 0, 0.65))), slide = eio(seg(u, 0.35, 1));
      const yLand = ri * CT + CT / 2, yStart = pileTop + 0.002 + CT / 2, yy = lerp(Math.max(yStart, yLand), yLand, sm(seg(u, 0, 0.7)));
      qa.setFromAxisAngle(Z, -dir * ang); Q.copy(qa).multiply(qLand);
      P.set(-dir * CL / 2, CT / 2, 0).applyQuaternion(qa).add(v3.set(dir * lerp(HALF_OUT, PILE_OUT, slide), yy - CT / 2, 0));
      bow = bowHeld * Math.exp(-u * 5) * (0.5 + 0.5 * Math.cos(u * 16));}
    else if (v < T.flip0) {P.set(dir * (PILE_OUT - CL / 2) * (1 - sq), ri * CT + CT / 2, 0); Q.copy(qLand); bow = bridge;}
    else if (v < T.fan0) {   // the squared deck turns face up as one block and lands in portrait
      const f = eio(seg(v, T.flip0, T.flip1)); qb.slerpQuaternions(qYaw, QD1, f);
      P.set(0, ri * CT + CT / 2 - 26 * CT, 0).applyQuaternion(qb).add(v3.set(0, 26 * CT + Math.sin(PI * f) * 0.62, 0)); Q.copy(qb).multiply(qDown);}
    else {fanPose(51 - ri, eio(seg(v, T.fan0, T.fan1)), tmp); P.copy(tmp.p); Q.copy(tmp.q);}
    P.add(origin); c.u.value = bow;}}

// corner points of the fanned cards for the red thread (above the index of each card)
export function threadPoints(origin, lift = 0.016) {const pts = [];
  for (let k = 0; k < 52; k++) {fanPose(k, 1, tmp); const p = V3(-CW / 2 + 0.07, CT / 2 + lift, -CL / 2 + 0.13).applyQuaternion(tmp.q).add(tmp.p).add(origin); pts.push(p);} return pts;}
export function makeThread(par, origin, mat, r = 0.0075) {const pts = threadPoints(origin), curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const geo = new THREE.TubeGeometry(curve, 52 * 12, r, 10, false), m = new THREE.Mesh(geo, mat); m.castShadow = true; par.add(m);
  const beads = pts.map(p => {const b = new THREE.Mesh(new THREE.SphereGeometry(r * 1.9, 14, 10), mat); b.position.copy(p); b.castShadow = true; par.add(b); return b;});
  const total = geo.index.count;
  return v => {const u = sm(seg(v, T.thr0, T.thr1)); geo.setDrawRange(0, Math.floor(total * u / 6) * 6); m.visible = u > 0;
    beads.forEach((b, i) => {const s = u > 0 ? clamp((u * 51 - i + 1) / 1.2) : 0; b.scale.setScalar(Math.max(1e-4, back(s))); b.visible = s > 0;});};}

// ------------------------------------------------------------------ the 68-digit number (52!) as a split-flap board drawn on a canvas
export const BIG = '80658175170943878571660636856403766975289505440883277824000000000000';
export function flapBoard(g, w, h, v, a, o) {   // a = start time of the flap roll; 9 columns in groups of three, right-aligned like a written number
  g.clearRect(0, 0, w, h); if (o.bg) {g.fillStyle = o.bg; g.fillRect(0, 0, w, h);}
  const cols = 9, rows = 8, pad = o.pad ?? 16, gap = o.gap ?? 22, cw = (w - pad * 2 - gap * 2) / cols, ch = (h - pad * 2) / rows, lead = cols * rows - 68;
  for (let n = 0; n < cols * rows; n++) {const c = n % cols, r = Math.floor(n / cols), i = n - lead, x = pad + c * cw + Math.floor(c / 3) * gap + 3, y = pad + r * ch + 4, ww = cw - 6, hh = ch - 8;
    g.fillStyle = o.cell; rr(g, x, y, ww, hh, 7); g.fill(); g.fillStyle = o.cell2 || o.cell; rr(g, x, y + hh / 2, ww, hh / 2, [0, 0, 7, 7]); g.fill();
    g.fillStyle = o.hinge; g.fillRect(x, y + hh / 2 - 1.5, ww, 3); g.fillStyle = o.pin || o.hinge; for (const sx of [x + 2, x + ww - 7]) g.fillRect(sx, y + hh / 2 - 5, 5, 10);
    if (i < 0 || v < a) continue;
    const stop = a + 0.3 + i * 0.024 + (i % 5) * 0.05, done = v >= stop, ph = (v - a) * 22 + i * 0.37, fl = ph % 1;
    const d = done ? BIG[i] : String(Math.floor(ph) % 10);
    g.save(); rr(g, x, y, ww, hh, 7); g.clip(); g.font = `800 ${Math.round(hh * 0.72)}px "Inter Tight"`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = (done && o.hot && i >= o.hot[0] && i < o.hot[1]) ? o.hotCol : o.digit; if (o.glow) {g.shadowColor = g.fillStyle; g.shadowBlur = o.glow;}
    g.translate(x + ww / 2, y + hh / 2 + 3); if (!done) g.scale(1, Math.max(0.08, Math.abs(Math.cos(PI * fl)))); g.fillText(d, 0, 0); g.restore();
    g.fillStyle = o.hinge; g.fillRect(x, y + hh / 2 - 1.5, ww, 3);}}

// ------------------------------------------------------------------ text overlays
const $ = id => document.getElementById(id);
const fade = (v, a, b, f = 0.22) => Math.min(seg(v, a, a + f), 1 - seg(v, b - f, b));
export function overlays({TITLES, NUMS, SUBS, SRCS}) {const ti = $('title'), nu = $('num'), su = $('sub'), sr = $('src'); let lt = '', ln = '', ls = '', lr = '';
  return v => {const t = TITLES.find(x => v >= x[0] && v < x[1]); if ((t ? t[2] : '') !== lt) {lt = t ? t[2] : ''; ti.innerHTML = lt;} ti.style.opacity = t ? fade(v, t[0], t[1]) : 0;
    ti.style.transform = t ? `translateY(${(1 - eo(seg(v, t[0], t[0] + 0.4))) * 14}px)` : 'none';
    const n = NUMS.find(x => v >= x[0] && v < x[1]); const nh = n ? n[2] + '<small>' + n[3] + '</small>' : ''; if (nh !== ln) {ln = nh; nu.innerHTML = nh;} nu.style.opacity = n ? fade(v, n[0], n[1]) : 0;
    nu.style.transform = n ? `translateY(${(1 - eo(seg(v, n[0], n[0] + 0.35))) * 16}px)` : 'none';
    const s = SUBS.find(x => v >= x[0] && v < x[1]); if ((s ? s[2] : '') !== ls) {ls = s ? s[2] : ''; su.textContent = ls;} su.style.opacity = s ? fade(v, s[0], s[1], 0.15) : 0;
    const r = SRCS.find(x => v >= x[0] && v < x[1]); if ((r ? r[2] : '') !== lr) {lr = r ? r[2] : ''; sr.textContent = lr;} sr.style.opacity = r ? fade(v, r[0], r[1]) : 0;};}
export const TEXT = {
  TITLES: [[0, 4.6, 'Diese Reihenfolge<br>gab es noch nie.']],
  NUMS: [[5.0, 7.9, '52', 'Karten, jede Reihenfolge ist möglich'], [8.2, 11.7, '8 × 10<sup>67</sup>', 'Möglichkeiten, 52 Karten zu ordnen. Ausgeschrieben hat die Zahl 68 Stellen.']],
  SUBS: [[0.15, 2.4, 'Wenn du ein Kartenspiel gut mischst,'], [2.4, 4.9, 'hältst du eine Reihenfolge in der Hand,'], [4.9, 7.9, 'die es so noch nie gegeben hat.'],
    [8.0, 10.8, '52 Karten lassen sich auf so viele Arten ordnen,'], [10.8, 13.5, 'dass die Zahl 68 Stellen hat.']],
  SRCS: [[0.2, 13.5, 'Kombinatorik: 52! = 8,07 × 10⁶⁷ · Modell vereinfacht']]};

// ------------------------------------------------------------------ camera keys [t, tx, ty, tz, dist, azimuth°, elevation°]
export function camPath(cam, KEYS) {return v => {let k = 0; while (k < KEYS.length - 2 && v >= KEYS[k + 1][0]) k++;
  const a = KEYS[k], b = KEYS[k + 1], u = smr(seg(v, a[0], b[0])), qv = a.map((x, i) => lerp(x, b[i], u));
  const [, tx, ty, tz, d, az, el] = qv, A = (az + 0.3 * Math.sin(v * 0.23)) * PI / 180, E = (el + 0.2 * Math.sin(v * 0.31 + 0.7)) * PI / 180;
  cam.position.set(tx + d * Math.cos(E) * Math.sin(A), ty + d * Math.sin(E), tz + d * Math.cos(E) * Math.cos(A)); cam.lookAt(tx, ty, tz); cam.updateMatrixWorld(); return qv;};}
