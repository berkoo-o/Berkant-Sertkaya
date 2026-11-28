// city.js – die bunte Stadt für „Wem gehört eigentlich Deutschland?“ (Stil 10, Stadt aus Geld)
// Aufbau: zwei Ringstraßen (A innen, B außen) mit Verkehr, dazwischen Blöcke; Fußgängerstraßen ohne Autos;
// außerhalb von Ring B Hügel mit Villen (Nordwesten), Fluss (Süden) und ruhige Randbebauung.
// Alles, was sich bewegt, läuft auf geschlossenen Runden, die sich nie kreuzen (Ringe sind konzentrisch, Fußgänger laufen um ihren Block).
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {clamp, lerp, rng} from './util.js';

export const RED = 0xE01E2B;
const R = rng(5);
export const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.0);   // buildings and money towers sink into / grow out of the ground
const texCache = new Map();
export const tex = (key, w, h, draw) => {if (key && texCache.has(key)) return texCache.get(key); const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (key) texCache.set(key, t); return t;};
const hex = c => '#' + new THREE.Color(c).getHexString();
const matCache = new Map();
export const M = (c, o = {}) => {const k = c + JSON.stringify(o); if (!o.noCache && matCache.has(k)) return matCache.get(k); const {noCache, ...oo} = o; const m = new THREE.MeshStandardMaterial({color: c, roughness: .72, ...oo}); matCache.set(k, m); return m;};
export const add = (par, geo, m, x = 0, y = 0, z = 0, shadow = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; par.add(o); return o;};
export const rbox = (w, h, d, r = 0.03, s = 2) => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));

// ------------------------------------------------------------------ layout
export const ROAD = 0.44, ROADB = 0.6, WALK = 0.22;
export const RA = {hx: 2.2, hz: 1.6, r: 0.42}, RB = {hx: 5.0, hz: 4.4, r: 0.6};
// blocks between the rings (building zones; the sidewalk runs around each block just outside these bounds)
const inA = {x: RA.hx - ROAD / 2 - WALK, z: RA.hz - ROAD / 2 - WALK}, outA = {x: RA.hx + ROAD / 2 + WALK, z: RA.hz + ROAD / 2 + WALK}, inB = {x: RB.hx - ROADB / 2 - WALK, z: RB.hz - ROADB / 2 - WALK};
export const BLOCKS = {
  plaza: [-inA.x, inA.x, -inA.z, inA.z],
  north_w: [-inB.x, -0.25, -inB.z, -outA.z], north_e: [0.25, inB.x, -inB.z, -outA.z],
  south_w: [-inB.x, -0.25, outA.z, inB.z], south_e: [0.25, inB.x, outA.z, inB.z],
  west_n: [-inB.x, -outA.x, -outA.z + 0.5, -0.25], west_s: [-inB.x, -outA.x, 0.25, outA.z - 0.5],
  east: [outA.x, inB.x, -outA.z + 0.5, outA.z - 0.5]};   // 0.5 wide footpaths separate the east/west blocks from the north/south ones

// rounded-rectangle loop: at(s) → [x, z, dx, dz]; clockwise seen from above (+x right, +z towards the viewer)
export function rrLoop(hx, hz, r, dir = 1) {
  const P = []; const N = 10; r = Math.min(r, hx - 1e-3, hz - 1e-3);
  const C = [[hx - r, hz - r, 0], [-(hx - r), hz - r, Math.PI / 2], [-(hx - r), -(hz - r), Math.PI], [hx - r, -(hz - r), 1.5 * Math.PI]];
  for (const [cx, cz, a0] of C) for (let i = 0; i <= N; i++) {const a = a0 + i / N * Math.PI / 2; P.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);}
  if (dir < 0) P.reverse(); P.push(P[0]);
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const len = L[L.length - 1];
  const at = s => {s = ((s % len) + len) % len; let i = 1; while (L[i] < s) i++; const u = (s - L[i - 1]) / (L[i] - L[i - 1] || 1); const a = P[i - 1], b = P[i];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), (b[0] - a[0]) / l, (b[1] - a[1]) / l];};
  return {at, len, P};}
// a loop around a block (offset outside its bounds)
export const blockLoop = (b, off, dir = 1) => {const cx = (b[0] + b[1]) / 2, cz = (b[2] + b[3]) / 2; const L = rrLoop((b[1] - b[0]) / 2 + off, (b[3] - b[2]) / 2 + off, 0.12, dir);
  return {len: L.len, at: s => {const p = L.at(s); return [p[0] + cx, p[1] + cz, p[2], p[3]];}};};

// ------------------------------------------------------------------ textures
export const winTex = (wall, win, cols, rows, frame, lit) => tex(['w', wall, win, cols, rows, frame, lit].join(), 256, 256, (g, w, h) => {g.fillStyle = wall; g.fillRect(0, 0, w, h);
  const cw = w / cols, rh = h / rows; for (let i = 0; i < cols; i++) for (let k = 0; k < rows; k++) {const x = i * cw + cw * 0.24, y = k * rh + rh * 0.22;
    if (frame) {g.fillStyle = frame; g.fillRect(x - 3, y - 3, cw * 0.52 + 6, rh * 0.56 + 6);} g.fillStyle = (lit && ((i * 7 + k * 3 + cols * 5) % 5 < 3)) ? lit : win; g.fillRect(x, y, cw * 0.52, rh * 0.56);}});
const glassTex = (tint, cols, rows) => tex(['g', tint, cols, rows].join(), 256, 512, (g, w, h) => {const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, tint); gr.addColorStop(1, '#1c2c44'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(230,240,255,0.55)'; g.lineWidth = 3; for (let i = 0; i <= cols; i++) {g.beginPath(); g.moveTo(i * w / cols, 0); g.lineTo(i * w / cols, h); g.stroke();} for (let k = 0; k <= rows; k++) {g.beginPath(); g.moveTo(0, k * h / rows); g.lineTo(w, k * h / rows); g.stroke();}});
export const noteSide = tex('noteSide', 64, 256, (g, w, h) => {const r = rng(9), cols = ['#8fb27a', '#a5cc8a', '#7fa86c', '#c9dfb0', '#b5d39c']; for (let y = 0; y < h; y += 3) {g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(0, y, w, 3);}
  g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 2); g.fillStyle = '#f3e3b0'; g.fillRect(w * 0.4, 0, w * 0.2, h);});
noteSide.wrapS = noteSide.wrapT = THREE.RepeatWrapping;
export const noteTop = tex('noteTop', 256, 160, (g, w, h) => {g.fillStyle = '#9fc68c'; g.fillRect(0, 0, w, h); g.fillStyle = '#86b277'; g.fillRect(0, 0, w * 0.32, h); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 6;
  g.beginPath(); g.arc(w * 0.62, h * 0.95, h * 0.55, Math.PI, 0); g.stroke(); g.fillStyle = '#f7f3e6'; g.font = '800 54px "Inter Tight"'; g.textAlign = 'right'; g.fillText('100', w - 14, 52); g.fillStyle = '#f3e3b0'; g.fillRect(w * 0.42, 0, w * 0.16, h);});
const coinSide = tex('coinSide', 128, 32, (g, w, h) => {g.fillStyle = '#d9ae58'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,80,20,0.35)'; for (let y = 2; y < h; y += 5) g.fillRect(0, y, w, 1.5);});
coinSide.wrapS = coinSide.wrapT = THREE.RepeatWrapping;
export const GOLD = new THREE.MeshStandardMaterial({color: 0xffffff, map: coinSide, metalness: 0.85, roughness: 0.32});
export const GOLDTOP = new THREE.MeshStandardMaterial({color: 0xe2b65e, metalness: 0.85, roughness: 0.3});

// money stack material set (sides repeat with the height so bundles keep their size); clipped at the ground
export function moneyMats(w, h, clip = true) {const st = noteSide.clone(); st.needsUpdate = true; st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(Math.max(1, Math.round(w * 3.2)), h * 2.6);
  const cp = clip ? {clippingPlanes: [ground]} : {}; const side = new THREE.MeshStandardMaterial({map: st, roughness: .8, ...cp}), top = new THREE.MeshStandardMaterial({map: noteTop, roughness: .75, ...cp});
  return [side, side, top, top, side, side];}

// ------------------------------------------------------------------ building kit
export const PAL = {houses: [0xf2906e, 0x6fa8e0, 0xf5c84a, 0xa58be0, 0x56c4a2, 0xf47fa8, 0xffad5a, 0x7fd07a, 0x5fc0d8, 0xe86a6a, 0xc9a2e8, 0xf6e2b0],
  roofs: [0xc9573a, 0x4f6fae, 0xd9833a, 0x3f8a5a, 0x8a5ab8, 0x2f6f8a], awn: [0x3f8fcf, 0xf2b33c, 0x4fb07a, 0x9a6fd0, 0xf07a5a, 0x2fb0b0],
  cars: [0x2f6db5, 0xe0b13a, 0x3d9a6a, 0xf2f2f2, 0x2b2b30, 0x8a5ad0, 0xf07a4a, 0x5ab0d8, 0xd0d0c8],
  shirts: [0x2f5d8a, 0xe6c34a, 0x3d7a4d, 0x7b4a8c, 0xe7e2d8, 0x2b2b30, 0xd77fa1, 0x8a6a45, 0x4b7fa8, 0xf08a4a, 0x5ab0a0], pants: [0x2b2b33, 0x3a4a6a, 0x5a4a3a, 0x2a3a2a, 0x6a6a72],
  skin: [0xf1c9a5, 0xe0ac84, 0xc68a62, 0x8d5a3c, 0xf5d5bd]};
export const owned = [], ALLB = [];   // everything with a red flag: {G, top(t), flag, ...}
export function flagMesh(sc = 1) {   // the red thread: a small red flag
  const F = new THREE.Group(); F.scale.setScalar(sc);
  add(F, new THREE.CylinderGeometry(0.008, 0.008, 0.32, 8), M(0xe9e6df, {metalness: .4, roughness: .4}), 0, 0.16, 0);
  add(F, new THREE.SphereGeometry(0.012, 10, 8), M(0xe9e6df, {metalness: .4, roughness: .4}), 0, 0.325, 0);
  const cloth = new THREE.Group(); cloth.position.set(0.006, 0.31, 0); F.add(cloth);
  const g = new THREE.PlaneGeometry(0.17, 0.1, 8, 2); g.translate(0.085, -0.05, 0);
  const m = add(cloth, g, new THREE.MeshStandardMaterial({color: RED, roughness: .55, side: THREE.DoubleSide, emissive: RED, emissiveIntensity: 0.12}));
  F.userData = {cloth: m, base: g.attributes.position.array.slice()}; return F;}
export function waveFlag(F, t, k = 1) {const m = F.userData.cloth, p = m.geometry.attributes.position, b = F.userData.base;
  for (let i = 0; i < p.count; i++) {const x = b[i * 3]; p.array[i * 3 + 2] = b[i * 3 + 2] + Math.sin(t * 3.4 + x * 26 + F.id) * 0.009 * (x / 0.17) * k;} p.needsUpdate = true;}

// a box building with window texture on all four sides; kind: 'block' | 'house' | 'tower' | 'shop' | 'glass'
export function building(par, o) {
  const G = new THREE.Group(); G.position.set(o.x, 0, o.z); G.rotation.y = o.ry || 0; par.add(G);
  const B = new THREE.Group(); G.add(B);   // everything that sinks into the ground later
  const c = o.col ?? PAL.houses[(o.c ?? Math.floor(R() * 12)) % PAL.houses.length];
  const cols = Math.max(2, Math.round(o.w * 5)), rows = Math.max(1, Math.round(o.h * 4.2)), colsD = Math.max(2, Math.round(o.d * 5));
  const clip = o.clip ? {clippingPlanes: [ground]} : {};
  let wallF, wallS;
  if (o.kind === 'glass') {wallF = new THREE.MeshStandardMaterial({map: glassTex(o.tint || '#7fa8d0', cols, rows), roughness: .15, metalness: .4, ...clip}); wallS = new THREE.MeshStandardMaterial({map: glassTex(o.tint || '#7fa8d0', colsD, rows), roughness: .15, metalness: .4, ...clip});}
  else {const win = o.kind === 'shop' ? '#33404f' : '#3b4452'; wallF = new THREE.MeshStandardMaterial({map: winTex(hex(c), win, cols, rows, '#efe9dc', null), roughness: .8, ...clip});
    wallS = new THREE.MeshStandardMaterial({map: winTex(hex(c), win, colsD, rows, '#efe9dc', null), roughness: .8, ...clip});
    for (const [m, cc] of [[wallF, cols], [wallS, colsD]]) {m.emissive = new THREE.Color(0xffffff); m.emissiveMap = winTex('#000000', '#000000', cc, rows, null, '#ffb45a'); m.emissiveIntensity = 0;}}
  const plain = new THREE.MeshStandardMaterial({color: c, roughness: .8, ...clip});
  add(B, rbox(o.w, o.h, o.d, 0.02), [wallS, wallS, plain, plain, wallF, wallF], 0, o.h / 2, 0);
  let top = o.h;
  if (o.kind === 'house') {const r = new THREE.Shape(); r.moveTo(-o.w / 2 - 0.03, 0); r.lineTo(o.w / 2 + 0.03, 0); r.lineTo(0, o.w * 0.38); r.closePath();
    const g = new THREE.ExtrudeGeometry(r, {depth: o.d + 0.05, bevelEnabled: false}); g.translate(0, 0, -(o.d + 0.05) / 2);
    add(B, g, new THREE.MeshStandardMaterial({color: o.roof ?? PAL.roofs[Math.floor(R() * PAL.roofs.length)], roughness: .6, ...clip}), 0, o.h, 0); top = o.h + o.w * 0.38;
    if (R() < 0.6) add(B, new THREE.BoxGeometry(0.05, 0.12, 0.05), M(0x8a5a48, clip), o.w * 0.22, o.h + o.w * 0.25, -o.d * 0.15);}
  else {const rc = o.roofCol ?? [0x8f949e, 0x9a7a66, 0x7d8a76, 0xb08870, 0x8a8aa6, 0xa39a8a][Math.floor(R() * 6)];
    add(B, rbox(o.w + 0.03, 0.04, o.d + 0.03, 0.012), new THREE.MeshStandardMaterial({color: rc, roughness: .75, ...clip}), 0, o.h + 0.02, 0); top = o.h + 0.04;
    // roof details: AC units, a water tank or a roof garden
    if (o.kind !== 'glass' && o.w > 0.35) {const k = Math.floor(R() * 3); if (k === 0) for (let i = 0; i < 2; i++) add(B, rbox(0.08, 0.05, 0.08, 0.01), M(0xbfc4c8, clip), (i - 0.5) * 0.14, o.h + 0.065, -o.d * 0.15);
      else if (k === 1) add(B, new THREE.CylinderGeometry(0.05, 0.05, 0.1, 14), M(0x9aa3ad, clip), o.w * 0.2, o.h + 0.09, 0);
      else add(B, rbox(o.w * 0.6, 0.03, o.d * 0.5, 0.01), M(0x6fa85a, clip), 0, o.h + 0.055, 0);}
    if (o.kind === 'glass') {add(B, rbox(o.w * 0.5, 0.1, o.d * 0.5, 0.02), M(0xd8d2c6, clip), 0, o.h + 0.09, 0); top = o.h + 0.14;}}
  // door and awnings on the front
  add(B, new THREE.BoxGeometry(Math.min(0.1, o.w * 0.3), 0.13, 0.012), M(0x5a4a3a, clip), 0, 0.065, o.d / 2 + 0.004, false);
  if (o.kind === 'shop') {const a = PAL.awn[Math.floor(R() * PAL.awn.length)]; const aw = add(B, new THREE.BoxGeometry(o.w * 0.92, 0.012, 0.09), M(a, clip), 0, 0.16, o.d / 2 + 0.045); aw.rotation.x = 0.35;}
  if (o.balc) for (let k = 1; k < rows; k++) add(B, new THREE.BoxGeometry(o.w * 0.8, 0.012, 0.05), M(0xf2efe6, clip), 0, k * o.h / rows + 0.01, o.d / 2 + 0.025, false);
  const rec = {G, B, o, top, wall: [wallF, wallS]}; ALLB.push(rec);
  if (o.own) {const F = flagMesh(o.fs || 2.3); F.position.set(o.fx || 0, top, o.fz || 0); G.add(F); rec.flag = F; owned.push(rec);}
  return rec;}
// a money tower in the footprint of a building: bundles grow out of the ground (clipped), a band every bundle
export function moneyTower(par, x, z, w, d, h, ry = 0) {const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; par.add(G);
  const m = add(G, new THREE.BoxGeometry(w, h, d), moneyMats(w, h), 0, h / 2, 0); return {G, m, h};}
export function coinPile(par, x, z, n = 3, s = 1) {const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); par.add(G);
  for (let k = 0; k < n; k++) {const hh = 0.03 + 0.03 * k; add(G, new THREE.CylinderGeometry(0.045, 0.045, hh, 24), [GOLD, GOLDTOP, GOLDTOP], (k - (n - 1) / 2) * 0.1, hh / 2, (k % 2) * 0.06 - 0.03);}
  return G;}

// ------------------------------------------------------------------ people and vehicles
export function person(par, o = {}) {const G = new THREE.Group(); par.add(G); const k = o.k || 1;
  const shirt = o.shirt ?? PAL.shirts[Math.floor(R() * PAL.shirts.length)], pants = o.pants ?? PAL.pants[Math.floor(R() * PAL.pants.length)], skin = o.skin ?? PAL.skin[Math.floor(R() * PAL.skin.length)];
  const legs = [-1, 1].map(sd => {const pv = new THREE.Group(); pv.position.set(0.011 * sd * k, 0.078 * k, 0); add(pv, new THREE.CylinderGeometry(0.0085 * k, 0.0075 * k, 0.074 * k, 8), M(pants), 0, -0.037 * k, 0); G.add(pv); return pv;});
  add(G, new THREE.CapsuleGeometry(0.0225 * k, 0.046 * k, 3, 10), M(o.red ? RED : shirt), 0, 0.118 * k, 0);
  const arms = [-1, 1].map(sd => {const pv = new THREE.Group(); pv.position.set(0.029 * sd * k, 0.142 * k, 0); add(pv, new THREE.CylinderGeometry(0.0062 * k, 0.0055 * k, 0.058 * k, 8), M(o.red ? RED : shirt), 0, -0.029 * k, 0); pv.rotation.z = 0.08 * sd; G.add(pv); return pv;});
  add(G, new THREE.SphereGeometry(0.0175 * k, 12, 10), M(skin), 0, 0.176 * k, 0);
  if (o.hair !== false && R() < 0.7) add(G, new THREE.SphereGeometry(0.0182 * k, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), M(o.hairCol ?? [0x2a211b, 0x5a3b26, 0x8a6a45, 0x1c1c1e, 0xd9d4cc][Math.floor(R() * 5)]), 0, 0.178 * k, 0);
  if (o.hat) add(G, new THREE.CylinderGeometry(0.016 * k, 0.018 * k, 0.028 * k, 14), M(0x1b1b20), 0, 0.2 * k, 0);
  return {G, legs, arms, k, ph: R() * 6};}
export function poseWalk(p, moving, dist, t) {const ph = dist * 52 / p.k, amp = 0.55 * moving;
  p.legs[0].rotation.x = amp * Math.sin(ph); p.legs[1].rotation.x = -amp * Math.sin(ph); p.arms[0].rotation.x = -amp * 0.8 * Math.sin(ph); p.arms[1].rotation.x = amp * 0.8 * Math.sin(ph);}
export function car(par, kind = 'car', col) {const G = new THREE.Group(); par.add(G); col = col ?? PAL.cars[Math.floor(R() * PAL.cars.length)];
  const L = kind === 'bus' ? 0.56 : 0.3, Hh = kind === 'bus' ? 0.13 : 0.075;
  add(G, rbox(L, Hh, 0.14, 0.025), M(col, {roughness: .35, metalness: .2}), 0, 0.022 + Hh / 2 + 0.01, 0);
  if (kind === 'bus') {add(G, new THREE.BoxGeometry(L * 0.94, 0.04, 0.142), M(0x2a313b, {roughness: .2}), 0, 0.022 + Hh * 0.75, 0);}
  else add(G, rbox(0.17, 0.06, 0.125, 0.022), M(0x2a313b, {roughness: .2}), -0.02, 0.022 + Hh + 0.035, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(G, new THREE.CylinderGeometry(0.026, 0.026, 0.02, 12).rotateX(Math.PI / 2), M(0x18181b), sx * L * 0.32, 0.026, sz * 0.07);
  const hl = new THREE.MeshStandardMaterial({color: 0xfff7e0, emissive: 0xfff2d0, emissiveIntensity: 0.3}); for (const z of [-0.042, 0.042]) add(G, new THREE.BoxGeometry(0.006, 0.016, 0.026), hl, L / 2 + 0.001, 0.07, z, false);
  return {G, hl, L};}
export function bike(par) {const G = new THREE.Group(); par.add(G); for (const x of [-0.045, 0.045]) add(G, new THREE.TorusGeometry(0.024, 0.005, 6, 16), M(0x22232a), x, 0.026, 0);
  add(G, new THREE.BoxGeometry(0.09, 0.006, 0.006), M(PAL.awn[Math.floor(R() * 6)]), 0, 0.045, 0);
  const p = person(G, {}); p.G.position.set(-0.01, 0.0, 0); p.G.scale.setScalar(0.9); p.legs.forEach(l => l.rotation.x = 0.5); p.G.rotation.y = Math.PI / 2; return {G, p};}
export function tree(par, x, z, s = 1, col) {const T = new THREE.Group(); T.position.set(x, 0, z); T.scale.setScalar(s); par.add(T);
  add(T, new THREE.CylinderGeometry(0.016, 0.022, 0.14, 8), M(0x6b4a33), 0, 0.07, 0);
  const c = col ?? [0x4f8d3a, 0x5fa04a, 0x3f7d3a, 0x6aa84a][Math.floor(R() * 4)]; add(T, new THREE.SphereGeometry(0.12, 14, 10), M(c, {roughness: .85}), 0, 0.24, 0); if (R() < 0.5) add(T, new THREE.SphereGeometry(0.08, 12, 9), M(c, {roughness: .85}), 0.05, 0.33, 0.02);
  return T;}
export function lamp(par, x, z) {add(par, new THREE.CylinderGeometry(0.006, 0.008, 0.3, 6), M(0x3a3a40, {metalness: .5}), x, 0.15, z);
  const b = add(par, new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({color: 0xfff2c8, emissive: 0xffe2a0, emissiveIntensity: 0.2}), x, 0.31, z, false); return b;}
