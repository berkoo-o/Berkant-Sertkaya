// people.js – the little figures and everything they do
// Every figure only walks on fixed lanes of the sidewalk, keeps its distance in the queue and appears or
// disappears only through house doors. checkPeople() in main.js samples the whole video for collisions.
import * as THREE from 'three';
import {L} from './town.js';
import {clamp, lerp, rng} from './util.js';

export const R_P = 0.026;            // body radius used for the collision check
const V = 0.30, VH = 0.34;           // walking speed in the queue and on the way home (units per second)

// ------------------------------------------------------------------ polyline helpers
function poly(pts) {const seg = []; let tot = 0; for (let i = 0; i < pts.length - 1; i++) {const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, l, tot]); tot += l;} return {pts, seg, len: tot};}
function at(P, s) {s = clamp(s, 0, P.len); for (const [a, b, l, s0] of P.seg) {if (s <= s0 + l + 1e-9) {const u = l > 0 ? (s - s0) / l : 0; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), (b[0] - a[0]) / (l || 1), (b[1] - a[1]) / (l || 1)];}}
  const [a, b, l] = P.seg[P.seg.length - 1]; return [b[0], b[1], (b[0] - a[0]) / l, (b[1] - a[1]) / l];}
// the queue line: in front of the bank to the left, around the corner and along the left side street
const QP = (() => {const pts = [[0.20, L.queueZ], [-1.81, L.queueZ]]; for (let i = 1; i <= 8; i++) {const a = Math.PI / 2 + i / 8 * Math.PI / 2; pts.push([-1.81 + 0.1 * Math.cos(a), L.queueZ - 0.1 + 0.1 * Math.sin(a)]);}
  pts.push([-1.91, -1.5]); return poly(pts);})();
export const Q = QP;
const sOnSide = z => QP.seg[0][2] + Math.PI / 2 * 0.1 + (L.queueZ - 0.1 - z);   // arc length of a point (-1.91, z) on the side part
function qSub(sa, sb) {const n = Math.max(2, Math.ceil(Math.abs(sb - sa) / 0.02)); const out = []; for (let i = 0; i <= n; i++) {const p = at(QP, lerp(sa, sb, i / n)); out.push([p[0], p[1]]);} return out;}
const slotS = k => k * 0.1;
const qYaw = s => {const p = at(QP, s); return Math.atan2(-p[2], -p[3]);};   // face towards the head of the queue
const join = (...ps) => {const out = []; for (const p of ps) for (const q of p) {const l = out[out.length - 1]; if (!l || Math.hypot(l[0] - q[0], l[1] - q[1]) > 1e-6) out.push(q);} return out;};

// ------------------------------------------------------------------ agents
// plan: list of segments {t0,t1,kind:'stand'|'walk',...}; vis: [tAppear,tGone]; door fades at path ends
class Agent {
  constructor(id) {this.id = id; this.segs = []; this.t = -1e9; this.pos = null; this.yaw = 0; this.appear = null; this.gone = null; this.looks = [];}
  standAt(x, z, yaw, t0) {this.pos = [x, z]; this.yaw = yaw; this.t = t0; this.segs.push({kind: 'stand', t0, x, z, yaw}); return this;}
  walk(t0, pts, v = V, opt = {}) {
    if (t0 < this.t - 1e-6) t0 = this.t;
    const P = poly(pts); const t1 = t0 + P.len / v;
    // close the previous standing segment
    this.segs.push({kind: 'walk', t0, t1, P, v, appear: !!opt.appear, enter: !!opt.enter});
    const e = at(P, P.len); this.pos = [e[0], e[1]]; this.t = t1;
    if (opt.enter) this.gone = t1; else {this.yaw = opt.endYaw ?? Math.atan2(e[2], e[3]); this.segs.push({kind: 'stand', t0: t1, x: e[0], z: e[1], yaw: this.yaw});}
    return t1;
  }
  look(t0, t1, dy) {this.looks.push([t0, t1, dy]);}
  state(t) {
    if (this.appear !== null && t < this.appear) return null; if (this.gone !== null && t >= this.gone) return null;
    let cur = null; for (const s of this.segs) {if (s.t0 <= t) cur = s; else break;}
    if (!cur) cur = this.segs[0];
    if (cur.kind === 'stand') {let yaw = cur.yaw; for (const [a, b, dy] of this.looks) {const u = clamp((t - a) / 0.45, 0, 1) * (1 - clamp((t - (b - 0.45)) / 0.45, 0, 1)); yaw += dy * u * u * (3 - 2 * u);}
      return {x: cur.x, z: cur.z, yaw, moving: 0, dist: 0, scale: 1};}
    if (t >= cur.t1) {const e = at(cur.P, cur.P.len); return {x: e[0], z: e[1], yaw: Math.atan2(e[2], e[3]), moving: 0, dist: cur.P.len, scale: cur.enter ? 0 : 1};}
    const s = (t - cur.t0) * cur.v; const p = at(cur.P, s);
    // heading: look a little ahead and behind so corners are smooth
    const a = at(cur.P, Math.max(0, s - 0.03)), b = at(cur.P, Math.min(cur.P.len, s + 0.03)); const yaw = Math.atan2(b[0] - a[0], b[1] - a[1]);
    let scale = 1; if (cur.appear) scale = Math.min(scale, clamp(s / 0.1, 0, 1)); if (cur.enter) scale = Math.min(scale, clamp((cur.P.len - s) / 0.1, 0, 1));
    const ramp = clamp(s / 0.06, 0, 1) * clamp((cur.P.len - s) / 0.06, 0, 1);
    return {x: p[0], z: p[1], yaw, moving: 0.35 + 0.65 * ramp, dist: s + cur.t0 * 0.37, scale};
  }
}

// ------------------------------------------------------------------ the whole choreography (voice time)
export function choreo() {
  const A = []; const mk = () => {const a = new Agent(A.length); A.push(a); return a;};
  const ATMX = L.atmX, UZ = L.atmUserZ, QZ = L.queueZ, LZ = L.laneZ; const [R1x, R1z] = L.doors.R1f;
  const atmUser = [0, 1, 2].map(i => mk().standAt(ATMX[i], UZ, Math.PI, -1));
  const queue = []; for (let k = 0; k < 20; k++) {const s = slotS(k), p = at(QP, s); queue.push(mk().standAt(p[0], p[1], qYaw(s), -1));}
  const slotOf = new Map(queue.map((a, k) => [a, k]));
  // somebody leaves a cash machine: back to the outer lane, to the right and into the house on the right
  const leaveAtm = (i, t) => {const a = atmUser[i]; a.walk(t, [[ATMX[i], UZ], [ATMX[i], LZ], [R1x, LZ], [R1x, R1z - 0.002]], V, {enter: true}); atmUser[i] = null;};
  // the first in the queue walks to the free machine, everybody else moves up one place (ripple from the front)
  const nextToAtm = (i, t) => {const a = queue.shift(); const p0 = a.pos;
    a.walk(t, [[p0[0], p0[1]], [ATMX[i], QZ], [ATMX[i], UZ]], V, {endYaw: Math.PI}); atmUser[i] = a;
    queue.forEach((b, k) => {const s0 = slotS(slotOf.get(b)), s1 = slotS(k); if (s1 >= s0 - 1e-6) return; b.walk(t + 0.14 + 0.09 * k, qSub(s0, s1), V, {endYaw: qYaw(s1)}); slotOf.set(b, k);});};
  // somebody comes out of a door and walks to the end of the queue
  const join_ = (t, door, side) => {const a = mk(); const k = queue.length; const s1 = slotS(k); const [dx, dz] = door;
    const zIn = dz; const s0 = sOnSide(zIn);
    a.appear = t; a.segs.push({kind: 'stand', t0: -1e9, x: dx, z: dz, yaw: -Math.PI / 2}); a.t = t;
    a.walk(t, join([[dx - 0.002, dz], [-1.91, dz]], qSub(s0, s1)), V, {appear: true, endYaw: qYaw(s1)});
    queue.push(a); slotOf.set(a, k); return a;};
  const L1s = L.doors.L1s, B1s = L.doors.B1s;

  // hook: two people come out of the house on the left, the queue moves twice
  join_(0.55, L1s); join_(1.75, L1s);
  leaveAtm(0, 2.3); nextToAtm(0, 2.72);
  leaveAtm(2, 3.9); nextToAtm(2, 4.4);
  // the machines are being emptied (voice 22.4 … 25.5)
  leaveAtm(1, 22.45); nextToAtm(1, 22.85);
  leaveAtm(0, 23.55); nextToAtm(0, 23.95);
  // people at the machines look at each other when the screens turn red
  atmUser.forEach((a, i) => {const dy = [0.75, -0.5, -0.8][i]; a.look(25.35 + i * 0.12, 36.0, dy); a.look(44.0, 50.0, -dy * 0.6);});
  // a few in the queue look around now and then
  queue.forEach((a, k) => {if (k % 3 === 1) a.look(26.0 + (k % 5) * 0.4, 30.5 + (k % 4) * 0.5, (k % 2 ? 0.7 : -0.7));});
  // panic: more and more people come out of the house at the back and join the queue
  for (let i = 0; i < 8; i++) join_(72.95 + i * 0.36, B1s);
  // "Ihre Einlagen sind sicher": everybody goes home
  const H0 = 81.95;
  atmUser.forEach((a, i) => {if (!a) return; a.walk(H0, [[ATMX[i], UZ], [R1x, UZ], [R1x, R1z - 0.002]], VH, {enter: true});});
  const [L1fx, L1fz] = L.doors.L1f; const sTurn = 0.20 - L1fx;   // arc length where the queue passes the left house's front door
  const n = queue.length;
  queue.forEach((a, k) => {const s0 = slotS(slotOf.get(a)); const t0 = H0 + 0.35 + 0.05 * (n - 1 - k);
    if (s0 < 1.0) a.walk(t0, join(qSub(s0, sTurn), [[L1fx, L1fz - 0.002]]), VH, {enter: true});
    else {const sSide = sOnSide(L1s[1]); a.walk(t0, join(qSub(s0, sSide), [[L1s[0] - 0.002, L1s[1]]]), VH, {enter: true});}
  });
  return A;
}

// ------------------------------------------------------------------ meshes
export function buildPeople(scene, S, P, agents) {
  const r = rng(17); const out = [];
  for (const a of agents) {
    const G = new THREE.Group(); scene.add(G);
    const shirt = P.shirts[Math.floor(r() * P.shirts.length)], pants = P.pants[Math.floor(r() * P.pants.length)], skin = P.skin[Math.floor(r() * P.skin.length)];
    const seg = S === 2 ? 7 : 12, mat = c => new THREE.MeshStandardMaterial({color: c, roughness: .75, flatShading: S === 2});
    const hip = 0.078, legL = 0.074;
    const legs = [-1, 1].map(sd => {const pv = new THREE.Group(); pv.position.set(0.011 * sd, hip, 0); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0075, legL, seg), mat(pants)); m.position.y = -legL / 2; m.castShadow = true; pv.add(m); G.add(pv); return pv;});
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(S === 2 ? 0.025 : 0.0225, 0.046, 4, seg), mat(shirt)); body.position.y = 0.118; body.castShadow = true; G.add(body);
    const arms = [-1, 1].map(sd => {const pv = new THREE.Group(); pv.position.set(0.029 * sd, 0.142, 0); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0055, 0.058, seg), mat(shirt)); m.position.y = -0.029; m.castShadow = true; pv.add(m); pv.rotation.z = 0.08 * sd; G.add(pv); return pv;});
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.0175, seg + 4, seg), mat(skin)); head.position.y = 0.176; head.castShadow = true; G.add(head);
    if (r() < 0.55) {const hair = new THREE.Mesh(new THREE.SphereGeometry(0.0182, seg + 4, seg, 0, Math.PI * 2, 0, Math.PI * 0.52), mat([0x2a211b, 0x5a3b26, 0x8a6a45, 0x1c1c1e][Math.floor(r() * 4)])); hair.position.y = 0.178; hair.rotation.x = -0.2; G.add(hair);}
    out.push({a, G, legs, arms, ph: r() * 6, sway: 0.4 + r() * 0.6});
  }
  return out;
}
export function poseAll(people, t) {
  for (const p of people) {
    const s = p.a.state(t); if (!s || s.scale <= 0.001) {p.G.visible = false; continue;}
    p.G.visible = true; p.G.position.set(s.x, 0.025, s.z); p.G.scale.setScalar(s.scale);
    const idle = s.moving > 0 ? 0 : 0.06 * Math.sin(t * 0.7 * p.sway + p.ph);
    p.G.rotation.y = s.yaw + idle;
    const ph = s.dist * 52; const amp = 0.55 * s.moving;
    p.legs[0].rotation.x = amp * Math.sin(ph); p.legs[1].rotation.x = -amp * Math.sin(ph);
    p.arms[0].rotation.x = -amp * 0.8 * Math.sin(ph); p.arms[1].rotation.x = amp * 0.8 * Math.sin(ph);
    p.G.position.y += 0.0035 * Math.abs(Math.sin(ph)) * s.moving + (s.moving ? 0 : 0.0012 * Math.sin(t * 1.3 + p.ph));
  }
}
