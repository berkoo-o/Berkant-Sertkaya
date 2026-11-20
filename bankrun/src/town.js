// town.js – the miniature town around the bank for both styles
// S=1: tilt-shift miniature (realistic, saturated, warm sun, ground goes on beyond the model)
// S=2: isometric board (pastel colours on a thick tile, dark background)
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ctex, rng, roundRect} from './util.js';

// ------------------------------------------------------------------ layout (world units, y up, +z towards the viewer)
export const L = {
  loop: {cx: 0, cz: -0.475, hx: 2.3, hz: 1.475, r: 0.35},   // centre line of the ring road around the bank block
  RW: 0.42, SW: 0.36, OSW: 0.30,                               // road, inner and outer sidewalk width
  bank: {x0: -0.78, x1: 0.78, z0: -0.52, z1: 0.42, h: 0.86},
  atmX: [0.30, 0.47, 0.64], atmUserZ: 0.565, queueZ: 0.64, laneZ: 0.735,
  doors: {L1f: [-1.31, 0.42], L1s: [-1.70, 0.0], R1f: [1.31, 0.42], B1s: [-1.70, -1.07]},
  tower: {x: 0, z: -1.12}, stack: {x: 0.55, z: -1.12},
  tile: {x0: -3.9, x1: 3.9, z0: -3.625, z1: 2.725},
};
// the block inside the ring: buildings must stay inside x ±1.73, z -1.38 … 0.43
export const BLD = {
  L1: {x0: -1.70, x1: -0.92, z0: -0.42, z1: 0.42, h: 1.15, c: 0, roof: 'flat', doors: [['+z', -1.31], ['-x', 0.0]]},
  R1: {x0: 0.92, x1: 1.70, z0: -0.42, z1: 0.42, h: 0.95, c: 1, roof: 'gable', doors: [['+z', 1.31]]},
  B1: {x0: -1.70, x1: -0.98, z0: -1.36, z1: -0.78, h: 0.85, c: 2, roof: 'gable', doors: [['-x', -1.07], ['-z', -1.34]]},
  B2: {x0: 0.98, x1: 1.70, z0: -1.36, z1: -0.78, h: 1.25, c: 3, roof: 'flat', doors: []},
  // outside the ring: front row (doors to the street at z 1.55), side columns and back row with the factory
  F1: {x0: -3.55, x1: -2.75, z0: 1.55, z1: 2.30, h: 0.90, c: 4, roof: 'gable', doors: [['-z', -3.15]]},
  F7: {x0: 2.75, x1: 3.55, z0: 1.55, z1: 2.30, h: 0.85, c: 5, roof: 'gable', doors: [['-z', 3.15]]},
  La: {x0: -3.75, x1: -2.95, z0: -1.55, z1: -0.80, h: 1.10, c: 1, roof: 'flat', doors: [['+x', -1.17]]},
  Lb: {x0: -3.75, x1: -2.95, z0: -0.45, z1: 0.35, h: 0.85, c: 4, roof: 'gable', doors: [['+x', -0.05]]},
  Ra: {x0: 2.95, x1: 3.75, z0: -1.60, z1: -0.90, h: 0.90, c: 6, roof: 'gable', doors: [['-x', -1.25]]},
  Rb: {x0: 2.95, x1: 3.75, z0: -0.60, z1: 0.25, h: 1.35, c: 2, roof: 'flat', doors: [['-x', -0.17]]},
  K1: {x0: -3.55, x1: -2.60, z0: -3.45, z1: -2.55, h: 1.00, c: 3, roof: 'flat', doors: [['+z', -3.07]]},
  K2: {x0: -2.30, x1: -1.20, z0: -3.45, z1: -2.55, h: 1.40, c: 5, roof: 'flat', doors: [['+z', -1.75]]},
  K3: {x0: -1.00, x1: 0.30, z0: -3.45, z1: -2.55, h: 0.95, c: 0, roof: 'gable', doors: [['+z', -0.35]]},
  K4: {x0: 2.85, x1: 3.60, z0: -3.45, z1: -2.55, h: 1.10, c: 6, roof: 'flat', doors: [['+z', 3.22]]},
};
export const FACTORY = {x0: 0.60, x1: 2.60, z0: -3.45, z1: -2.55, h: 0.62, gateX: 1.6};

// ------------------------------------------------------------------ palettes
export const PAL = {
  1: {grass: 0x6c9748, lawn: 0x7aa853, street: 0x3a3b40, walk: 0xc9c2b4, curb: 0xdcd6ca, line: 0xf1eee6,
      houses: [0xd9c3a0, 0xb8806a, 0xe6dfd0, 0xa9b6c4, 0xcfa97c, 0x9fb59a, 0xe2b8a0], roofs: [0x7a4b3a, 0x8d5a44, 0x5f6b78],
      flat: 0x8f8a84, bank: 0xdcd3c2, glass: '#3e4b5c', frame: '#efe9dc', door: '#4a3a30', tree: 0x4f7d3a, tree2: 0x6b9440, trunk: 0x6b4a33,
      cars: [0x2f6db5, 0xe0b13a, 0xe9e6df, 0x3d7a4d], skin: [0xe8c2a0, 0xc99a74, 0x8d5f43, 0xf0d2b8],
      shirts: [0x2f5d8a, 0xe6c34a, 0x3d7a4d, 0x7b4a8c, 0xe7e2d8, 0x2b2b30, 0xd77fa1, 0x5d8fb8, 0xc58a3e, 0x8aa6a3, 0x4b5a76], pants: [0x2d3340, 0x3d4a66, 0x7a6a55, 0x1f1f24]},
  2: {grass: 0xa6dcb0, lawn: 0xb7e5bd, street: 0x6e7290, walk: 0xeae6f3, curb: 0xffffff, line: 0xffffff,
      houses: [0xf4bba3, 0xa9c8f2, 0xf6e4a2, 0xc9b5f0, 0xaee2d2, 0xf7c9de, 0xd8e8a8], roofs: [0x8079cc, 0x9a8fe0, 0x6f6ab8],
      flat: 0xdcd8ee, bank: 0xf6f3fb, glass: '#5b6194', frame: '#ffffff', door: '#6a5f9a', tree: 0x63b56f, tree2: 0x7cc47a, trunk: 0x9a7a62,
      cars: [0x5b8ef0, 0xf5b84a, 0xffffff, 0x58b48c], skin: [0xf6d2b4, 0xe0b090, 0xa87656, 0xffe0c8],
      shirts: [0x5b6ee1, 0xf5c451, 0x58b48c, 0xa47ce0, 0xffffff, 0x3e3f5a, 0xef8fb5, 0x7fb0f0, 0xf09a5c, 0x8fd0c8, 0x6d78a8], pants: [0x3e3f5a, 0x55608e, 0xa89a88, 0x2c2c3a]},
};

const M = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: .8, ...o});
function add(par, geo, mat, x = 0, y = 0, z = 0, shadow = true) {
  const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; par.add(o); return o;
}
// rounded rectangle path in the xz plane, written as a THREE.Shape in (x, -z) so that rotateX(-PI/2) maps it back
function rr(shape, cx, cz, hx, hz, r) {
  const x0 = cx - hx, x1 = cx + hx, y0 = -cz - hz, y1 = -cz + hz;
  shape.moveTo(x0 + r, y0); shape.lineTo(x1 - r, y0); shape.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x1, y1 - r); shape.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x0 + r, y1); shape.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x0, y0 + r); shape.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}
function ring(cx, cz, o, i, depth, mat, y = 0) {
  const s = rr(new THREE.Shape(), cx, cz, o[0], o[1], o[2]); const h = rr(new THREE.Path(), cx, cz, i[0], i[1], i[2]); s.holes.push(h);
  const g = depth > 0 ? new THREE.ExtrudeGeometry(s, {depth, bevelEnabled: false, curveSegments: 16}) : new THREE.ShapeGeometry(s, 16);
  g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.y = y; m.receiveShadow = true; m.castShadow = false; return m;
}
function slab(cx, cz, hx, hz, r, depth, mat, y = 0) {
  const s = rr(new THREE.Shape(), cx, cz, hx, hz, r);
  const g = depth > 0 ? new THREE.ExtrudeGeometry(s, {depth, bevelEnabled: false, curveSegments: 16}) : new THREE.ShapeGeometry(s, 16);
  g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.y = y; m.receiveShadow = true; return m;
}
// point on the ring-road centre line by arc length (starts at the front middle, runs to +x, counter-clockwise seen from above)
export function loopPath() {
  const {cx, cz, hx, hz, r} = L.loop; const sx = hx - r, sz = hz - r; const q = Math.PI / 2 * r;
  const segs = [ // [length, fn(u)->[x,z,dirx,dirz]]
    [sx, u => [cx + u * sx, cz + hz, 1, 0]],
    [q, u => {const a = Math.PI / 2 - u * Math.PI / 2; return [cx + sx + r * Math.cos(a), cz + sz + r * Math.sin(a), Math.sin(a), -Math.cos(a)];}],
    [2 * sz, u => [cx + hx, cz + sz - u * 2 * sz, 0, -1]],
    [q, u => {const a = -u * Math.PI / 2; return [cx + sx + r * Math.cos(a), cz - sz + r * Math.sin(a), Math.sin(a), -Math.cos(a)];}],
    [2 * sx, u => [cx + sx - u * 2 * sx, cz - hz, -1, 0]],
    [q, u => {const a = -Math.PI / 2 - u * Math.PI / 2; return [cx - sx + r * Math.cos(a), cz - sz + r * Math.sin(a), Math.sin(a), -Math.cos(a)];}],
    [2 * sz, u => [cx - hx, cz - sz + u * 2 * sz, 0, 1]],
    [q, u => {const a = Math.PI - u * Math.PI / 2; return [cx - sx + r * Math.cos(a), cz + sz + r * Math.sin(a), Math.sin(a), -Math.cos(a)];}],
    [sx, u => [cx - sx + u * sx, cz + hz, 1, 0]],
  ];
  const total = segs.reduce((a, s) => a + s[0], 0);
  const at = s => {s = ((s % total) + total) % total; for (const [len, f] of segs) {if (s <= len) return f(len > 0 ? s / len : 0); s -= len;} return segs[0][1](0);};
  return {total, at};
}

// ------------------------------------------------------------------ facade textures
// windows (and doors) as a transparent decal; a second canvas holds the lit windows for the evening
function facadeTex(S, P, w, h, doorsU, seed) {
  const pxu = 300, cw = Math.max(64, Math.round(w * pxu)), ch = Math.max(64, Math.round(h * pxu));
  const A = ctex(cw, ch), E = ctex(cw, ch); const g = A.g, e = E.g; const r = rng(seed);
  g.clearRect(0, 0, cw, ch); e.fillStyle = '#000'; e.fillRect(0, 0, cw, ch);
  const floors = Math.max(2, Math.round(h / 0.27)), cols = Math.max(2, Math.round(w / 0.19));
  const fh = ch / floors, fw = cw / cols;
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const x = c * fw + fw * 0.26, y = f * fh + fh * 0.2, ww = fw * 0.48, hh = fh * 0.5;
    const cxu = (c + 0.5) / cols;
    if (f === floors - 1 && doorsU.some(u => Math.abs(u - cxu) < 0.6 / cols)) continue;   // ground floor: the door takes this bay
    g.fillStyle = P.frame; g.fillRect(x - 4, y - 4, ww + 8, hh + 8);
    if (S === 1) {g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 6, y + hh + 4, ww + 12, 5);}    // sill shadow
    g.fillStyle = P.glass; g.fillRect(x, y, ww, hh);
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x, y, ww * 0.35, hh);                // reflection
    if (r() < 0.62) {e.fillStyle = `rgba(255,${200 + Math.floor(r() * 30)},${130 + Math.floor(r() * 40)},1)`; e.fillRect(x, y, ww, hh);}
  }
  for (const u of doorsU) {
    const dw = 0.095 * pxu, dh = 0.2 * pxu, x = u * cw - dw / 2, y = ch - dh;
    g.fillStyle = P.frame; g.fillRect(x - 5, y - 5, dw + 10, dh + 5);
    g.fillStyle = P.door; g.fillRect(x, y, dw, dh);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + dw * 0.18, y + dh * 0.12, dw * 0.64, dh * 0.3);
    e.fillStyle = 'rgba(255,214,150,1)'; e.fillRect(x + dw * 0.18, y + dh * 0.12, dw * 0.64, dh * 0.3);
  }
  A.tex.needsUpdate = true; E.tex.needsUpdate = true;
  return {map: A.tex, emissiveMap: E.tex};
}

// ------------------------------------------------------------------ builders
export function buildTown(scene, S) {
  const P = PAL[S]; const T = {glow: [], lamps: [], doorsWorld: {}, carMats: [], trees: [], lampPos: []};
  const W0 = new THREE.Group(); scene.add(W0); T.root = W0;
  const {cx, cz, hx, hz, r} = L.loop, RW = L.RW;
  const roadMat = M(P.street, {roughness: .92}), walkMat = M(P.walk, {roughness: .9}), lawnMat = M(P.lawn, {roughness: .95}), lineMat = M(P.line, {roughness: .6});
  // ground
  if (S === 1) {
    add(W0, new THREE.PlaneGeometry(80, 80).rotateX(-Math.PI / 2), M(P.grass, {roughness: .98}), 0, -0.001, 0, false);
  } else {
    const t = L.tile, tw = t.x1 - t.x0, td = t.z1 - t.z0, tcx = (t.x0 + t.x1) / 2, tcz = (t.z0 + t.z1) / 2;
    add(W0, new RoundedBoxGeometry(tw + 0.3, 0.34, td + 0.3, 4, 0.07), M(0x3b3768, {roughness: .55}), tcx, -0.17 - 0.004, tcz);
    add(W0, new THREE.BoxGeometry(tw, 0.02, td), M(P.grass, {roughness: .95}), tcx, -0.009, tcz, false);
    add(W0, new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), M(0x08080d, {roughness: 1}), 0, -0.5, 0, false);
  }
  // ring road, inner sidewalk ring with curb, outer sidewalk ring, lawn inside the block
  W0.add(ring(cx, cz, [hx + RW / 2, hz + RW / 2, r + RW / 2], [hx - RW / 2, hz - RW / 2, r - RW / 2], 0, roadMat, 0.002));
  W0.add(ring(cx, cz, [hx - RW / 2, hz - RW / 2, r - RW / 2], [hx - RW / 2 - L.SW, hz - RW / 2 - L.SW, 0.02], 0.025, walkMat, 0));
  W0.add(ring(cx, cz, [hx + RW / 2 + L.OSW, hz + RW / 2 + L.OSW, r + RW / 2 + L.OSW], [hx + RW / 2, hz + RW / 2, r + RW / 2], 0.025, walkMat, 0));
  W0.add(slab(cx, cz, hx - RW / 2 - L.SW, hz - RW / 2 - L.SW, 0.02, 0.012, lawnMat, 0));
  // curb lines (thin light strips at the road edges)
  W0.add(ring(cx, cz, [hx - RW / 2 + 0.012, hz - RW / 2 + 0.012, r - RW / 2 + 0.012], [hx - RW / 2, hz - RW / 2, r - RW / 2], 0.03, M(P.curb), 0));
  W0.add(ring(cx, cz, [hx + RW / 2, hz + RW / 2, r + RW / 2], [hx + RW / 2 - 0.012, hz + RW / 2 - 0.012, r + RW / 2 - 0.012], 0.03, M(P.curb), 0));
  // centre dashes along the ring
  const LP = loopPath(); T.loop = LP;
  for (let s = 0.2; s < LP.total - 0.1; s += 0.34) {const [x, z, dx, dz] = LP.at(s); const d = add(W0, new THREE.BoxGeometry(0.16, 0.004, 0.022), lineMat, x, 0.004, z, false); d.rotation.y = Math.atan2(-dz, dx);}
  // zebra crossing in front of the bank's left part
  for (let i = 0; i < 6; i++) add(W0, new THREE.BoxGeometry(0.035, 0.004, 0.36), lineMat, -1.0 + i * 0.07, 0.004, 1.0, false);
  // style 1: the town goes on beyond the model (straight roads and more houses, all out of focus most of the time)
  if (S === 1) extraTown(W0, P);
  // buildings
  let k = 0; for (const [name, o] of Object.entries(BLD)) house(W0, S, P, name, o, T, k++);
  factory(W0, S, P, T);
  park(W0, S, P, T);
  bank(W0, S, P, T);
  // trees on the outer sidewalks (never where people walk) and in the courtyard
  const TREES = [[-2.66, 1.36], [2.66, 1.36], [-1.95, 2.35], [1.95, 2.4], [-0.7, 2.52], [0.8, 2.56], [-2.66, -1.0], [-2.66, -2.31], [2.66, 0.35], [2.66, -2.31], [-0.6, -1.2], [-0.62, -0.72],
                 [-3.25, -2.15], [3.3, -2.15], [-3.3, 0.6], [3.3, 0.55], [0.45, -2.31]];
  TREES.forEach(([x, z], i) => tree(W0, S, P, x, z, 0.8 + 0.3 * ((i * 37) % 10) / 10, T));
  // street lamps on the outer sidewalks
  const LAMPS = [[-2.2, 1.31, 0], [2.05, 1.31, 0], [-2.62, 0.62, 1], [2.62, -0.6, 1], [-1.0, -2.26, 2], [2.1, -2.26, 2], [-2.62, -1.6, 1]];
  LAMPS.forEach(([x, z, f]) => lamp(W0, S, P, x, z, f, T));
  return T;
}

function extraTown(W0, P) {
  const roadMat = M(P.street, {roughness: .92}), walkMat = M(P.walk, {roughness: .9});
  // straight roads continuing the ring outward
  const R = (x, z, w, d) => add(W0, new THREE.BoxGeometry(w, 0.004, d), roadMat, x, 0.002, z, false);
  R(-8.4, 1.0, 12, 0.42); R(8.4, 1.0, 12, 0.42); R(-8.4, -1.95, 12, 0.42); R(8.4, -1.95, 12, 0.42);
  R(-2.3, 6.4, 0.42, 7.2); R(2.3, 6.4, 0.42, 7.2); R(-2.3, -9.8, 0.42, 15); R(2.3, -9.8, 0.42, 15);
  R(0, 3.3, 30, 0.42); R(0, -4.0, 30, 0.42);
  const r = rng(91); let k = 0;
  const cells = [];
  for (let x = -9; x <= 9; x += 1.15) for (let z = -9; z <= 6; z += 1.1) {
    if (x > -4.1 && x < 4.1 && z > -3.8 && z < 2.9) continue;
    if (Math.abs(z - 3.3) < 0.55 || Math.abs(z + 4.0) < 0.55 || Math.abs(z - 1.0) < 0.5 || Math.abs(z + 1.95) < 0.5) continue;
    if (Math.abs(x - 2.3) < 0.55 || Math.abs(x + 2.3) < 0.55) continue;
    cells.push([x, z]);
  }
  for (const [x, z] of cells) {
    if (r() < 0.18) {tree(W0, 1, P, x + (r() - 0.5) * 0.3, z + (r() - 0.5) * 0.3, 0.9 + r() * 0.4, null); continue;}
    const w = 0.6 + r() * 0.35, d = 0.55 + r() * 0.35, h = 0.5 + r() * 1.1;
    house(W0, 1, P, 'x' + k, {x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, h, c: k % 7, roof: r() < 0.45 ? 'gable' : 'flat', doors: [], far: true}, null, 100 + k++);
  }
}

function house(W0, S, P, name, o, T, seed) {
  const w = o.x1 - o.x0, d = o.z1 - o.z0, h = o.h, cx = (o.x0 + o.x1) / 2, cz = (o.z0 + o.z1) / 2;
  const G = new THREE.Group(); G.position.set(cx, 0, cz); W0.add(G);
  const col = P.houses[o.c % P.houses.length];
  add(G, new RoundedBoxGeometry(w, h, d, 2, Math.min(0.025, w / 8)), M(col, {roughness: .85}), 0, h / 2, 0);
  add(G, new THREE.BoxGeometry(w + 0.012, 0.045, d + 0.012), M(new THREE.Color(col).multiplyScalar(0.72), {roughness: .9}), 0, 0.0225, 0);   // plinth
  // facade decals with windows (+ doors)
  const mats = [];
  const faces = [['+z', w, 0, d / 2, 0], ['-z', w, Math.PI, -d / 2, 0], ['+x', d, Math.PI / 2, w / 2, 1], ['-x', d, -Math.PI / 2, -w / 2, 1]];
  faces.forEach(([f, fw, ry, off, side], i) => {
    if (o.far && (f === '-z')) return;
    const doorsU = (o.doors || []).filter(dd => dd[0] === f).map(dd => {
      const v = dd[1];
      if (f === '+z') return (v - (cx - fw / 2)) / fw; if (f === '-z') return ((cx + fw / 2) - v) / fw;
      if (f === '+x') return ((cz + fw / 2) - v) / fw; return (v - (cz - fw / 2)) / fw;});
    const tx = facadeTex(S, P, fw - 0.03, h - 0.07, doorsU, seed * 7 + i);
    const m = new THREE.MeshStandardMaterial({map: tx.map, transparent: true, roughness: .5, emissiveMap: tx.emissiveMap, emissive: new THREE.Color(1, 0.86, 0.62), emissiveIntensity: 0, depthWrite: false});
    mats.push(m);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(fw - 0.03, h - 0.07), m); p.rotation.y = ry;
    if (side) p.position.set(off + Math.sign(off) * 0.0035, (h - 0.07) / 2 + 0.01, 0); else p.position.set(0, (h - 0.07) / 2 + 0.01, off + Math.sign(off) * 0.0035);
    p.renderOrder = 1; G.add(p);
    (o.doors || []).filter(dd => dd[0] === f).forEach(dd => {
      if (!T) return; const key = name + f;
      T.doorsWorld[key] = f === '+z' ? [dd[1], o.z1] : f === '-z' ? [dd[1], o.z0] : f === '+x' ? [o.x1, dd[1]] : [o.x0, dd[1]];});
  });
  // roof
  if (o.roof === 'gable') {
    const along = w >= d, span = along ? d : w, len = (along ? w : d) + 0.04, rh = 0.36 * span;
    const s = new THREE.Shape(); s.moveTo(-span / 2 - 0.03, 0); s.lineTo(span / 2 + 0.03, 0); s.lineTo(0, rh); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth: len, bevelEnabled: false}); g.translate(0, 0, -len / 2); if (along) g.rotateY(Math.PI / 2);
    add(G, g, M(P.roofs[seed % P.roofs.length], {roughness: .7}), 0, h, 0);
  } else {
    add(G, new THREE.BoxGeometry(w + 0.02, 0.03, d + 0.02), M(P.flat, {roughness: .85}), 0, h + 0.012, 0);
    add(G, new THREE.BoxGeometry(w * 0.32, 0.06, d * 0.3), M(new THREE.Color(P.flat).multiplyScalar(0.85)), w * 0.15, h + 0.055, -d * 0.12);   // roof box
  }
  if (T && !o.far) T.glow.push({mats, x: cx, z: cz, order: (seed * 5) % 13});
  return G;
}

function factory(W0, S, P, T) {
  const o = FACTORY, w = o.x1 - o.x0, d = o.z1 - o.z0, cx = (o.x0 + o.x1) / 2, cz = (o.z0 + o.z1) / 2;
  const G = new THREE.Group(); G.position.set(cx, 0, cz); W0.add(G);
  const col = S === 1 ? 0xb9b2a6 : 0xe9e4f6;
  add(G, new RoundedBoxGeometry(w, o.h, d, 2, 0.02), M(col), 0, o.h / 2, 0);
  // sawtooth roof
  const n = 5, sw = w / n;
  for (let i = 0; i < n; i++) {
    const s = new THREE.Shape(); s.moveTo(-sw / 2, 0); s.lineTo(sw / 2, 0); s.lineTo(sw / 2, 0.2); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth: d - 0.02, bevelEnabled: false}); g.translate(0, 0, -(d - 0.02) / 2);
    add(G, g, M(S === 1 ? 0x6f7680 : 0x8f88d8, {roughness: .7}), -w / 2 + sw * (i + 0.5), o.h, 0);
    }
  // chimney with two light bands
  add(G, new THREE.CylinderGeometry(0.06, 0.075, 1.1, 20), M(S === 1 ? 0xa85f45 : 0xf3b6a0), 0.75, 0.55, -0.22);
  add(G, new THREE.CylinderGeometry(0.063, 0.063, 0.04, 20), M(0xf1eee6), 0.75, 0.95, -0.22);
  // big gate facing the street (+z) and a row of high windows
  const gate = ctex(512, 256, (g, cw, ch) => {g.clearRect(0, 0, cw, ch);
    for (let i = 0; i < 9; i++) {const x = 22 + i * 54; if (i === 4) continue; g.fillStyle = P.frame; g.fillRect(x - 3, 28, 40, 56); g.fillStyle = P.glass; g.fillRect(x, 31, 34, 50);}
    g.fillStyle = S === 1 ? '#5d6670' : '#6a5f9a'; g.fillRect(cw / 2 - 52, 110, 104, 146); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3;
    for (let y = 122; y < 256; y += 14) {g.beginPath(); g.moveTo(cw / 2 - 52, y); g.lineTo(cw / 2 + 52, y); g.stroke();}});
  const gm = new THREE.MeshStandardMaterial({map: gate.tex, transparent: true, depthWrite: false, roughness: .6});
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, o.h - 0.04), gm); gp.position.set(0, (o.h - 0.04) / 2, d / 2 + 0.004); gp.renderOrder = 1; G.add(gp);
  T.doorsWorld.FABgate = [cx + (FACTORY.gateX - cx), o.z1];
}

// low park in front of the bank (nothing higher than the camera's line of sight to the cash machines)
function park(W0, S, P, T) {
  const G = new THREE.Group(); W0.add(G);
  const path = M(S === 1 ? 0xd6cbb2 : 0xf3eefb, {roughness: .95}), hedge = M(S === 1 ? 0x46703a : 0x7cc48a, {roughness: .9, flatShading: S === 2});
  const stone = M(S === 1 ? 0xbdb6aa : 0xe2def2, {roughness: .8});
  add(G, new THREE.BoxGeometry(4.6, 0.006, 0.16), path, 0, 0.006, 1.66, false);
  add(G, new THREE.BoxGeometry(0.16, 0.006, 1.0), path, 0, 0.006, 2.12, false);
  // fountain
  add(G, new THREE.CylinderGeometry(0.34, 0.36, 0.06, 40), stone, 0, 0.03, 2.08);
  add(G, new THREE.CylinderGeometry(0.30, 0.30, 0.012, 40), new THREE.MeshStandardMaterial({color: S === 1 ? 0x5f8fae : 0x8fc5ee, roughness: .1, metalness: .1}), 0, 0.058, 2.08, false);
  add(G, new THREE.CylinderGeometry(0.035, 0.05, 0.16, 16), stone, 0, 0.1, 2.08);
  add(G, new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), stone, 0, 0.18, 2.08);
  // hedges and flower beds (no strong red)
  [[-1.25, 1.95, 0.9], [1.25, 1.95, 0.9], [-1.25, 2.4, 0.7], [1.3, 2.42, 0.6]].forEach(([x, z, w]) => add(G, new RoundedBoxGeometry(w, 0.075, 0.12, 2, 0.03), hedge, x, 0.0375, z));
  const fl = [0xf2d15c, 0xf5f0e6, 0xb9a2e8, 0xf3a65a]; const r = rng(5);
  for (let i = 0; i < 46; i++) add(G, new THREE.SphereGeometry(0.014, 8, 6), M(fl[i % 4], {roughness: .7}), (r() < 0.5 ? -1 : 1) * (0.55 + r() * 0.35), 0.03, 2.2 + (r() - 0.5) * 0.22, false);
  // benches along the path
  [[-0.7, 1.55], [0.75, 1.55], [-2.0, 1.78], [2.05, 1.78]].forEach(([x, z]) => {add(G, new THREE.BoxGeometry(0.2, 0.012, 0.05), M(S === 1 ? 0x8a6142 : 0xc9a98a), x, 0.05, z); add(G, new THREE.BoxGeometry(0.2, 0.05, 0.01), M(S === 1 ? 0x8a6142 : 0xc9a98a), x, 0.075, z + 0.025);
    [-0.08, 0.08].forEach(dx => add(G, new THREE.BoxGeometry(0.012, 0.045, 0.05), M(0x3a3d44), x + dx, 0.022, z, false));});
  // a small kiosk at the left end
  add(G, new RoundedBoxGeometry(0.3, 0.2, 0.2, 2, 0.02), M(S === 1 ? 0xe9e3d4 : 0xfdf6e8), -2.35, 0.1, 2.25);
  add(G, new THREE.BoxGeometry(0.36, 0.02, 0.26), M(S === 1 ? 0x3f6e8a : 0x7a8fe0), -2.35, 0.21, 2.27);
}

function tree(W0, S, P, x, z, sc, T) {
  const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(sc); W0.add(G);
  add(G, new THREE.CylinderGeometry(0.016, 0.022, 0.16, 10), M(P.trunk), 0, 0.08, 0);
  const geo = S === 2 ? new THREE.IcosahedronGeometry(0.13, 0) : new THREE.SphereGeometry(0.13, 20, 14);
  add(G, geo, M(((x * 13 + z * 7) | 0) % 2 ? P.tree : P.tree2, {roughness: .85, flatShading: S === 2}), 0, 0.27, 0);
  if (S === 1) add(G, new THREE.SphereGeometry(0.085, 16, 12), M(P.tree2, {roughness: .85}), 0.06, 0.34, 0.03);
  if (T) T.trees.push([x, z, 0.13 * sc]);
}

function lamp(W0, S, P, x, z, facing, T) {
  const G = new THREE.Group(); G.position.set(x, 0, z); W0.add(G);
  const pole = M(S === 1 ? 0x3a3d44 : 0x55597a, {metalness: .4, roughness: .5});
  add(G, new THREE.CylinderGeometry(0.007, 0.009, 0.42, 8), pole, 0, 0.235, 0);
  const head = new THREE.MeshStandardMaterial({color: 0xfff3d6, emissive: 0xfff0d0, emissiveIntensity: 0.2});
  add(G, new THREE.BoxGeometry(0.05, 0.012, 0.03), pole, 0, 0.45, 0);
  add(G, new THREE.BoxGeometry(0.04, 0.006, 0.022), head, 0, 0.441, 0, false);
  // soft light pool on the ground for the evening
  const pool = ctex(128, 128, (g, w, h) => {const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,226,170,0.9)'); gr.addColorStop(1, 'rgba(255,226,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);});
  const pm = new THREE.MeshBasicMaterial({map: pool.tex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending});
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62).rotateX(-Math.PI / 2), pm); pl.position.set(0, 0.031, 0); G.add(pl);
  T.lamps.push({head, pool: pm}); T.lampPos.push([x, z]);
}

// ------------------------------------------------------------------ the bank
function bank(W0, S, P, T) {
  const B = L.bank, w = B.x1 - B.x0, d = B.z1 - B.z0, h = B.h, cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2;
  const G = new THREE.Group(); W0.add(G); const shell = []; const mk = (c, o = {}) => {const m = M(c, o); shell.push(m); return m;};
  const wall = mk(P.bank, {roughness: .7});
  const bodyM = add(G, new THREE.BoxGeometry(w, h, d), wall, cx, h / 2, cz);
  add(G, new THREE.BoxGeometry(w + 0.02, 0.05, d + 0.02), mk(new THREE.Color(P.bank).multiplyScalar(0.82)), cx, 0.025, cz);       // plinth
  add(G, new THREE.BoxGeometry(w + 0.04, 0.035, d + 0.04), mk(new THREE.Color(P.bank).multiplyScalar(0.9)), cx, h + 0.017, cz);   // cornice
  // side and back windows (decals that fade together with the walls)
  const win = [];
  const deco = (fw, fh, x, y, z, ry, seed) => {const tx = facadeTex(S, P, fw, fh, [], seed); const m = new THREE.MeshStandardMaterial({map: tx.map, transparent: true, depthWrite: false, roughness: .5, emissiveMap: tx.emissiveMap, emissive: new THREE.Color(1, 0.9, 0.7), emissiveIntensity: 0});
    shell.push(m); win.push(m); const p = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), m); p.position.set(x, y, z); p.rotation.y = ry; p.renderOrder = 1; G.add(p); return p;};
  deco(d - 0.12, h - 0.16, B.x1 + 0.004, h / 2 + 0.02, cz, Math.PI / 2, 501);
  deco(d - 0.12, h - 0.16, B.x0 - 0.004, h / 2 + 0.02, cz, -Math.PI / 2, 502);
  deco(w - 0.12, h - 0.16, cx, h / 2 + 0.02, B.z0 - 0.004, Math.PI, 503);
  deco(0.42, 0.24, 0.47, 0.66, B.z1 + 0.004, 0, 504);    // upper windows above the cash machines
  // portico: two steps, four columns, beam with the sign, pediment
  const stone = mk(new THREE.Color(P.bank).multiplyScalar(0.94), {roughness: .75});
  add(G, new THREE.BoxGeometry(0.90, 0.022, 0.07), stone, -0.30, 0.011, B.z1 + 0.035);
  add(G, new THREE.BoxGeometry(0.86, 0.022, 0.035), stone, -0.30, 0.033, B.z1 + 0.0175);
  const colX = [-0.66, -0.42, -0.18, 0.06];
  colX.forEach(x => {add(G, new THREE.CylinderGeometry(0.026, 0.03, 0.56, S === 2 ? 10 : 18), stone, x, 0.044 + 0.28, B.z1 + 0.035);
    add(G, new THREE.BoxGeometry(0.07, 0.02, 0.07), stone, x, 0.614, B.z1 + 0.035);});
  add(G, new THREE.BoxGeometry(0.92, 0.075, 0.08), stone, -0.30, 0.66, B.z1 + 0.03);
  {const s = new THREE.Shape(); s.moveTo(-0.49, 0); s.lineTo(0.49, 0); s.lineTo(0, 0.17); s.closePath();
   const g = new THREE.ExtrudeGeometry(s, {depth: 0.08, bevelEnabled: false}); add(G, g, stone, -0.30, 0.6975, B.z1 - 0.01);}
  const sign = ctex(512, 64, (g, cw, ch) => {g.fillStyle = '#' + new THREE.Color(P.bank).multiplyScalar(0.94).getHexString(); g.fillRect(0, 0, cw, ch);
    g.fillStyle = S === 2 ? '#5b56a8' : '#3a3530'; g.font = '800 50px "Inter Tight"'; g.textAlign = 'center'; g.letterSpacing = '22px'; g.fillText('BANK', cw / 2 + 11, 50);});
  const signM = new THREE.MeshStandardMaterial({map: sign.tex, roughness: .7, transparent: true}); shell.push(signM);
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.0775), signM); sp.position.set(-0.30, 0.66, B.z1 + 0.0705); G.add(sp);
  // entrance: glass door with warm light inside, shutter housing above it
  const doorM = new THREE.MeshStandardMaterial({color: S === 1 ? 0x2b3440 : 0x4b4f80, emissive: 0xffd9a0, emissiveIntensity: 0.25, roughness: .3, transparent: true}); shell.push(doorM);
  add(G, new THREE.BoxGeometry(0.16, 0.3, 0.01), doorM, -0.30, 0.044 + 0.15, B.z1 + 0.003);
  add(G, new THREE.BoxGeometry(0.17, 0.035, 0.022), mk(S === 1 ? 0x8a8f96 : 0xc9c6e6, {metalness: .3, roughness: .5}), -0.30, 0.37, B.z1 + 0.012);
  const shutterTex = ctex(64, 128, (g, cw, ch) => {g.fillStyle = S === 1 ? '#9aa0a8' : '#d9d6f0'; g.fillRect(0, 0, cw, ch); g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = 2; for (let y = 4; y < ch; y += 8) {g.beginPath(); g.moveTo(0, y); g.lineTo(cw, y); g.stroke();}});
  const shutterM = new THREE.MeshStandardMaterial({map: shutterTex.tex, metalness: .3, roughness: .5});
  const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.165, 0.31, 0.006), shutterM); shutter.castShadow = true;
  const shutterG = new THREE.Group(); shutterG.position.set(-0.30, 0.355, B.z1 + 0.016); shutterG.add(shutter); shutter.position.y = -0.155; shutterG.scale.y = 0.001; G.add(shutterG);
  // cash machines on the right part of the facade, under a small canopy with a light strip
  add(G, new THREE.BoxGeometry(0.54, 0.022, 0.085), mk(S === 1 ? 0x4a4f58 : 0x6d6a9a, {roughness: .5}), 0.47, 0.425, B.z1 + 0.0425);
  const strip = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xfff6e8, emissiveIntensity: 0.7}); shell.push(strip);
  add(G, new THREE.BoxGeometry(0.5, 0.004, 0.012), strip, 0.47, 0.412, B.z1 + 0.07, false);
  const atms = L.atmX.map((x, i) => atm(G, S, P, x, B.z1, shell, i));
  // interior, only visible while the walls are glass: floor, counter and an open vault with a very small stack of cash
  const IN = new THREE.Group(); IN.visible = false; G.add(IN);
  add(IN, new THREE.BoxGeometry(w - 0.04, 0.012, d - 0.04), M(S === 1 ? 0x6f6458 : 0x8d86b4), cx, 0.05, cz);
  add(IN, new THREE.BoxGeometry(0.9, 0.12, 0.08), M(S === 1 ? 0x7a5a42 : 0xa89ad8), -0.15, 0.116, 0.12);
  const steel = M(S === 1 ? 0x7d838c : 0x9d9ac0, {metalness: .55, roughness: .38});
  const V = new THREE.Group(); V.position.set(0.05, 0.056, -0.24); IN.add(V);
  add(V, new THREE.BoxGeometry(0.44, 0.01, 0.3), steel, 0, 0.005, 0);
  [[0, 0.04, -0.145, 0.44, 0.08, 0.01], [-0.215, 0.04, 0, 0.01, 0.08, 0.3], [0.215, 0.04, 0, 0.01, 0.08, 0.3]].forEach(([x, y, z, a, b, c]) => add(V, new THREE.BoxGeometry(a, b, c), steel, x, y, z));
  {const door = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 28).rotateX(Math.PI / 2), steel); door.position.set(0.17, 0.085, 0.19); door.rotation.y = -1.1; door.castShadow = true; V.add(door);}
  const noteTex = ctex(256, 64, (g, cw, ch) => {g.fillStyle = '#d9cfa8'; g.fillRect(0, 0, cw, ch); for (let y = 0; y < ch; y += 4) {g.fillStyle = y % 8 ? '#9cb58a' : '#c9a36a'; g.fillRect(0, y, cw, 2);}});
  const cashM = [M(0xffffff, {map: noteTex.tex}), M(0xffffff, {map: noteTex.tex}), M(0x7fa66b), M(0x7fa66b), M(0xffffff, {map: noteTex.tex}), M(0xffffff, {map: noteTex.tex})];
  const cash = add(V, new THREE.BoxGeometry(0.11, 0.022, 0.065), cashM, 0, 0.021, 0);
  // warm light inside the bank (switched off when the bank closes)
  const inLight = new THREE.PointLight(0xffd9a0, 0, 1.6, 2); inLight.position.set(-0.1, 0.5, 0.0); G.add(inLight);
  T.bank = {G, shell, wall, win, atms, shutterG, IN, cash, vault: V, doorM, strip, inLight, body: bodyM};
}

// screen states: 'idle' (blue), 'leer' (red), 'sixty' (max. 60 €)
function atm(G, S, P, x, zf, shell, i) {
  const A = new THREE.Group(); A.position.set(x, 0, zf); G.add(A);
  const bodyC = S === 1 ? 0x59606b : 0x7f7cb0;
  add(A, new THREE.BoxGeometry(0.13, 0.33, 0.05), M(bodyC, {roughness: .45, metalness: .2}), 0, 0.22, 0.025);
  add(A, new THREE.BoxGeometry(0.11, 0.08, 0.008), M(0x1d2026, {roughness: .3}), 0, 0.305, 0.052);
  const sc = ctex(256, 184); const draw = (state, k = 1) => {const g = sc.g, w = 256, h = 184; g.save();
    if (state === 'leer') {g.fillStyle = '#E01E2B'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 70px "Inter Tight"'; g.textAlign = 'center'; g.fillText('LEER', w / 2, h / 2 + 25);}
    else if (state === 'sixty') {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2f6fd1'); gr.addColorStop(1, '#1d4ea0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '600 28px Poppins'; g.fillText('Auszahlung', w / 2, 52); g.font = '800 64px "Inter Tight"'; g.fillText('max. 60 €', w / 2, 126); g.font = '500 24px Poppins'; g.fillText('pro Tag', w / 2, 160);}
    else {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, S === 1 ? '#3b82d6' : '#6f8ef2'); gr.addColorStop(1, S === 1 ? '#1f56a8' : '#4c63c9'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,0.95)'; g.textAlign = 'center'; g.font = '700 38px Poppins'; g.fillText('Bargeld', w / 2, 74);
      [['20 €', 40, 108], ['50 €', 136, 108], ['100 €', 40, 146], ['200 €', 136, 146]].forEach(([t, xx, yy]) => {g.fillStyle = 'rgba(255,255,255,0.22)'; roundRect(g, xx, yy - 26, 80, 32, 6); g.fill(); g.fillStyle = '#fff'; g.font = '600 20px Poppins'; g.fillText(t, xx + 40, yy - 3);});}
    g.restore(); sc.tex.needsUpdate = true;};
  draw('idle');
  const scrM = new THREE.MeshBasicMaterial({map: sc.tex, toneMapped: false});
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.094, 0.068), scrM); scr.position.set(0, 0.307, 0.0566); A.add(scr);
  add(A, new THREE.BoxGeometry(0.07, 0.006, 0.03), M(0x2a2d33), 0, 0.235, 0.064);              // keypad shelf
  for (let k = 0; k < 9; k++) add(A, new THREE.BoxGeometry(0.012, 0.003, 0.008), M(0xd9dde3), -0.018 + (k % 3) * 0.018, 0.2395, 0.054 + Math.floor(k / 3) * 0.009, false);
  add(A, new THREE.BoxGeometry(0.075, 0.009, 0.004), M(0x101114), 0, 0.19, 0.0505);             // cash slot
  add(A, new THREE.BoxGeometry(0.03, 0.006, 0.004), M(0x101114), 0.035, 0.262, 0.0505);          // card slot
  const glow = new THREE.PointLight(0xff2030, 0, 0.9, 2); glow.position.set(0, 0.31, 0.14); A.add(glow);
  let cur = 'idle';
  return {A, x, set: (s) => {if (s !== cur) {cur = s; draw(s);}}, scrM, glow, slotY: 0.19, slotZ: zf + 0.0505};
}
