// Stil 3 „Kartenstadt“: helle Tilt-Shift-Miniatur. Das Kartenspiel liegt riesig auf einem runden Platz, ringsum winzige Leute, ein Ring mit fahrenden Autos,
// Kartenhäuser als Wahrzeichen, moderne Häuser mit Dachdetails, Bäume, Laternen, Bänke, eine Fallblatt-Tafel wie am Bahnhof.
import {THREE, W, H, PI, RED, clamp, lerp, seg, sm, eo, eio, V3, rng, tex, rr, suit, drawFace, drawBack, makeDeck, poseDeck, makeThread, flapBoard, camPath, CW, CL} from './core.js';
import {GRADE} from './s1.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

const TiltShader = {uniforms: {tDiffuse: {value: null}, dir: {value: new THREE.Vector2(1 / W, 0)}, r: {value: 0.52}, band: {value: 0.1}, fall: {value: 0.26}, amt: {value: 2.6}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 dir; uniform float r, band, fall, amt; varying vec2 vUv;
    void main(){ float k = smoothstep(band, band+fall, abs(vUv.y-r)) * amt; vec2 d = dir*k; vec4 s = vec4(0.0);
      s += texture2D(tDiffuse, vUv-6.0*d)*0.022; s += texture2D(tDiffuse, vUv-5.0*d)*0.04; s += texture2D(tDiffuse, vUv-4.0*d)*0.066; s += texture2D(tDiffuse, vUv-3.0*d)*0.096;
      s += texture2D(tDiffuse, vUv-2.0*d)*0.122; s += texture2D(tDiffuse, vUv-1.0*d)*0.141; s += texture2D(tDiffuse, vUv)*0.146; s += texture2D(tDiffuse, vUv+1.0*d)*0.141;
      s += texture2D(tDiffuse, vUv+2.0*d)*0.122; s += texture2D(tDiffuse, vUv+3.0*d)*0.096; s += texture2D(tDiffuse, vUv+4.0*d)*0.066; s += texture2D(tDiffuse, vUv+5.0*d)*0.04; s += texture2D(tDiffuse, vUv+6.0*d)*0.022;
      gl_FragColor = s; }`};
const SAT = {uniforms: {tDiffuse: {value: null}, sat: {value: 1.18}}, vertexShader: TiltShader.vertexShader,
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float sat; varying vec2 vUv; void main(){vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(0.299,0.587,0.114)); c.rgb = mix(vec3(l), c.rgb, sat); gl_FragColor = c;}'};

export async function build({renderer, scene, cam}) {
  const R = rng(33);
  renderer.toneMappingExposure = 1.0; scene.background = new THREE.Color(0xefe9df); scene.fog = new THREE.Fog(0xefe9df, 16, 34);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
  const std = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.75, ...o});
  const inst = (geo, mat, list, sh = true) => {const im = new THREE.InstancedMesh(geo, mat, list.length), o = new THREE.Object3D();
    list.forEach((L, i) => {o.position.set(L[0], L[1], L[2]); o.rotation.set(0, L[3] || 0, 0); o.scale.set(L[4] || 1, L[5] || L[4] || 1, L[6] || L[4] || 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); if (L[7] !== undefined) im.setColorAt(i, new THREE.Color(L[7]));});
    im.castShadow = sh; im.receiveShadow = true; scene.add(im); return im;};
  const STAGE = V3(0, 0, 0.73), PLAZA = 1.95, RING0 = 2.15, RING1 = 2.75, WALK1 = 3.15;

  // ---------------------------------------------------------------- ground: paving, plaza with radial pattern, ring road, sidewalks, grass, side streets
  const groundT = tex(1024, 1024, (g, w, h) => {g.fillStyle = '#e7e1d6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,150,135,0.25)'; g.lineWidth = 1.5; for (let i = 0; i <= 32; i++) {g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke();}}, {repeat: [14, 14]});
  add(scene, new THREE.PlaneGeometry(80, 80).rotateX(-PI / 2), std(0xffffff, {map: groundT}), 0, -0.02, 0, false);
  const plazaT = tex(2048, 2048, (g, w, h) => {const c = w / 2; g.fillStyle = '#7d8794'; g.fillRect(0, 0, w, h);
    for (let r = 60; r < 1024; r += 46) {g.strokeStyle = 'rgba(225,228,234,0.28)'; g.lineWidth = 2; g.beginPath(); g.arc(c, c, r, 0, PI * 2); g.stroke(); const n = Math.round(r / 14);
      for (let i = 0; i < n; i++) {const a = i / n * PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); g.lineTo(c + Math.cos(a) * (r + 46), c + Math.sin(a) * (r + 46)); g.stroke();}}
    g.strokeStyle = '#c9b48a'; g.lineWidth = 10; g.beginPath(); g.arc(c, c, 990, 0, PI * 2); g.stroke();});
  add(scene, new THREE.CircleGeometry(PLAZA, 96).rotateX(-PI / 2), std(0xffffff, {map: plazaT, roughness: 0.85}), STAGE.x, 0.0, STAGE.z, false);
  const roadT = tex(2048, 64, (g, w, h) => {g.fillStyle = '#5f6472'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f1ea'; for (let x = 0; x < w; x += 64) g.fillRect(x, h / 2 - 3, 32, 6);}, {repeat: [6, 1]});
  {const g = new THREE.RingGeometry(RING0, RING1, 128, 1), p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) {const a = Math.atan2(p.getY(i), p.getX(i)), r = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, a / PI / 2 + 0.5, (r - RING0) / (RING1 - RING0));}
    g.rotateX(-PI / 2); add(scene, g, std(0xffffff, {map: roadT, roughness: 0.9}), STAGE.x, 0.004, STAGE.z, false);}
  add(scene, new THREE.RingGeometry(PLAZA, RING0, 128).rotateX(-PI / 2), std(0xd9d2c5), STAGE.x, 0.012, STAGE.z, false);
  add(scene, new THREE.RingGeometry(RING1, WALK1, 128).rotateX(-PI / 2), std(0xd9d2c5), STAGE.x, 0.012, STAGE.z, false);
  for (const a of [0.5, 1.6, 2.6, 3.7, 4.7, 5.6]) {const m = add(scene, new THREE.PlaneGeometry(0.42, RING1 - RING0).rotateX(-PI / 2), std(0x5f6472, {map: tex(128, 128, (g, w, h) => {g.fillStyle = '#5f6472'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f1ea'; for (let x = 6; x < w; x += 22) g.fillRect(x, 0, 12, h);})}), 0, 0.006, 0, false);
    m.position.set(STAGE.x + Math.cos(a) * (RING0 + RING1) / 2, 0.006, STAGE.z + Math.sin(a) * (RING0 + RING1) / 2); m.rotation.y = -a + PI / 2;}
  // radial side streets going out of the ring
  for (const a of [0.2, 1.25, 2.3, 3.35, 4.4, 5.45]) {const m = add(scene, new THREE.PlaneGeometry(0.55, 14).rotateX(-PI / 2), std(0xffffff, {map: tex(64, 1024, (g, w, h) => {g.fillStyle = '#5f6472'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f1ea'; for (let y = 0; y < h; y += 48) g.fillRect(w / 2 - 2, y, 4, 24);})}), 0, 0.003, 0, false);
    m.position.set(STAGE.x + Math.cos(a) * (WALK1 + 7), 0.003, STAGE.z + Math.sin(a) * (WALK1 + 7)); m.rotation.y = -a + PI / 2;}

  // ---------------------------------------------------------------- the giant deck (cards in a teal design)
  const P = {bg: '#fbfaf6', red: '#c8202f', ink: '#18181d', ink2: '#1d1d24', gold: '#e0b04a', navy: '#1f6f78', skin: '#f1c7a1', frame: '#f4efe4', paper: true};
  const backT = tex(512, 715, (g, w, h) => drawBack(g, w, h, {bg: '#1f6f78', line: 'rgba(255,255,255,0.22)', accent: '#f6efe0', edge: '#fbfaf6'}));
  const cards = makeDeck(scene, {face: id => new THREE.MeshStandardMaterial({map: tex(512, 715, (g, w, h) => drawFace(g, w, h, id, P)), roughness: 0.5}),
    backMat: new THREE.MeshStandardMaterial({map: backT, roughness: 0.5}), edgeMat: std(0xf4f1ea, {roughness: 0.85})});
  const ORIGIN = V3(0, 0.004, 0.15);
  const thread = makeThread(scene, ORIGIN, new THREE.MeshStandardMaterial({color: RED, emissive: RED, emissiveIntensity: 0.25, roughness: 0.5}));

  // ---------------------------------------------------------------- tiny people: crowd around the deck, walkers on the sidewalk (closed circles)
  const BODY = [0x3f6fd8, 0xf2a7c3, 0x5fbf9a, 0xf3c74e, 0x8a68d6, 0xf08a5d, 0x2e3a59, 0x9bb0c9, 0xffffff, 0x4fa3a5], SKIN = [0xf1c7a1, 0xd9a27a, 0xb07a52, 0x7a4f33];
  const crowd = []; {for (let i = 0; i < 260; i++) {const a = R() * PI * 2, r = 1.32 + Math.pow(R(), 0.8) * 0.55; crowd.push([STAGE.x + Math.cos(a) * r, STAGE.z + Math.sin(a) * r, Math.atan2(-Math.cos(a), -Math.sin(a)) + (R() - 0.5) * 0.6, BODY[i % BODY.length], SKIN[i % 4], R()]);}}
  const walkers = []; for (let i = 0; i < 70; i++) walkers.push({r: R() < 0.5 ? 2.03 + R() * 0.08 : 2.87 + R() * 0.2, a0: R() * PI * 2, sp: (R() < 0.5 ? -1 : 1) * (0.05 + R() * 0.05), b: BODY[(i * 3) % BODY.length], s: SKIN[i % 4], ph: R() * 6});
  const N = crowd.length + walkers.length, bodyG = new THREE.CapsuleGeometry(0.0115, 0.026, 4, 8), headG = new THREE.SphereGeometry(0.0105, 10, 8), legG = new THREE.CylinderGeometry(0.006, 0.006, 0.022, 6);
  const bodies = new THREE.InstancedMesh(bodyG, std(0xffffff), N), heads = new THREE.InstancedMesh(headG, std(0xffffff), N), legs = new THREE.InstancedMesh(legG, std(0x2f3342), N * 2);
  for (const m of [bodies, heads, legs]) {m.castShadow = true; m.receiveShadow = true; scene.add(m);}
  [...crowd.map(c => [c[3], c[4]]), ...walkers.map(w => [w.b, w.s])].forEach(([b, s], i) => {bodies.setColorAt(i, new THREE.Color(b)); heads.setColorAt(i, new THREE.Color(s));});
  const o3 = new THREE.Object3D();
  const placePeople = v => {let i = 0; const put = (x, z, ry, bob, leg) => {o3.rotation.set(0, ry, 0); o3.position.set(x, 0.042 + bob, z); o3.updateMatrix(); bodies.setMatrixAt(i, o3.matrix);
      o3.position.set(x, 0.074 + bob, z); o3.updateMatrix(); heads.setMatrixAt(i, o3.matrix);
      for (const k of [0, 1]) {const sx = k ? 0.005 : -0.005; o3.position.set(x + Math.cos(ry) * sx, 0.011, z - Math.sin(ry) * sx); o3.rotation.set(leg * (k ? 1 : -1), ry, 0); o3.updateMatrix(); legs.setMatrixAt(i * 2 + k, o3.matrix);} i++;};
    for (const c of crowd) {const look = sm(seg(v, 1.0 + c[5], 2.0 + c[5])) * 0; put(c[0], c[1], c[2] + Math.sin(v * 0.8 + c[5] * 9) * 0.15, Math.max(0, Math.sin(v * 5 + c[5] * 20)) * 0.004 * (v > 2.6 && v < 4.2 ? 1 : 0.2), 0);}
    for (const w of walkers) {const a = w.a0 + v * w.sp / w.r * 6, x = STAGE.x + Math.cos(a) * w.r, z = STAGE.z + Math.sin(a) * w.r, ry = Math.atan2(-Math.sin(a) * Math.sign(w.sp), Math.cos(a) * Math.sign(w.sp)) + 0;
      put(x, z, Math.atan2(-Math.sin(a), Math.cos(a)) * 0 + (w.sp > 0 ? -a : PI - a), Math.abs(Math.sin(v * 9 + w.ph)) * 0.003, Math.sin(v * 9 + w.ph) * 0.5);}
    for (const m of [bodies, heads, legs]) m.instanceMatrix.needsUpdate = true;};

  // ---------------------------------------------------------------- cars on the ring road (two lanes, opposite directions)
  const CARC = [0xf3c74e, 0x3f6fd8, 0xf2f0ea, 0x2e3a59, 0xe8795a, 0x5fbf9a, 0x9aa3b5, 0xf2a7c3];
  const cars = Array.from({length: 22}, (_, i) => ({lane: i % 2, a0: i / 22 * PI * 2 + R() * 0.12, c: CARC[i % CARC.length]}));
  const carB = new THREE.InstancedMesh(new RoundedBoxGeometry(0.2, 0.055, 0.1, 2, 0.02), std(0xffffff, {roughness: 0.35, metalness: 0.2}), cars.length);
  const carT = new THREE.InstancedMesh(new RoundedBoxGeometry(0.11, 0.045, 0.088, 2, 0.018), std(0x9fc6e0, {roughness: 0.1, metalness: 0.3}), cars.length);
  const wheels = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.019, 0.019, 0.1, 10).rotateX(PI / 2), std(0x1d1e24), cars.length * 2);
  for (const m of [carB, carT, wheels]) {m.castShadow = true; scene.add(m);} cars.forEach((c, i) => carB.setColorAt(i, new THREE.Color(c.c)));
  const placeCars = v => {cars.forEach((c, i) => {const r = c.lane ? RING0 + 0.17 : RING1 - 0.17, dir = c.lane ? 1 : -1, a = c.a0 + dir * v * 0.16, x = STAGE.x + Math.cos(a) * r, z = STAGE.z + Math.sin(a) * r, ry = -a + (dir > 0 ? 0 : PI) - PI / 2 * 0 + PI / 2 * dir * 0;
      const yaw = Math.atan2(-Math.cos(a) * dir, -Math.sin(a) * dir) + PI / 2;
      o3.rotation.set(0, yaw, 0); o3.position.set(x, 0.045, z); o3.updateMatrix(); carB.setMatrixAt(i, o3.matrix);
      o3.position.set(x, 0.088, z); o3.updateMatrix(); carT.setMatrixAt(i, o3.matrix);
      for (const k of [0, 1]) {const off = k ? 0.06 : -0.06; o3.position.set(x + Math.cos(yaw) * off, 0.02, z - Math.sin(yaw) * off); o3.updateMatrix(); wheels.setMatrixAt(i * 2 + k, o3.matrix);}});
    for (const m of [carB, carT, wheels]) m.instanceMatrix.needsUpdate = true;};

  // ---------------------------------------------------------------- buildings: modern blocks with windows and roof details; card houses as landmarks
  const winT = (wall, win, cols, rows) => tex(256, 256, (g, w, h) => {g.fillStyle = wall; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows;
    for (let i = 0; i < cols; i++) for (let k = 0; k < rows; k++) {g.fillStyle = win; g.fillRect(i * cw + cw * 0.18, k * rh + rh * 0.2, cw * 0.64, rh * 0.55); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(i * cw + cw * 0.18, k * rh + rh * 0.2, cw * 0.64, rh * 0.08);}});
  const WALLS = [['#f4efe6', '#7fa7c4'], ['#f1d9c4', '#5f86a6'], ['#dfe6ea', '#6f8fb0'], ['#f3e3b8', '#6b8aa8'], ['#e6dcf2', '#6c7fae'], ['#d8e9de', '#668ea8'], ['#f6d8d0', '#6a88a8']];
  const blocks = [];
  for (let ring = 0; ring < 3; ring++) {const n = 11 + ring * 5, r = 3.75 + ring * 1.55;
    for (let i = 0; i < n; i++) {const a = i / n * PI * 2 + ring * 0.21 + (R() - 0.5) * 0.08; const da = s => Math.abs(Math.atan2(Math.sin(a - s), Math.cos(a - s))); if ([0.2, 1.25, 2.3, 3.35, 4.4, 5.45].some(s => da(s) < 0.16 + 0.05 / (ring + 1))) continue;
      if (ring === 0 && [0.725, 1.775, 2.825, 3.875, 5.975, 4.925].some(s => da(s) < 0.34)) continue; if (ring === 1 && da(4.925) < 0.2) continue;
      const x = STAGE.x + Math.cos(a) * r, z = STAGE.z + Math.sin(a) * r, w = 0.55 + R() * 0.4, d = 0.5 + R() * 0.35, hgt = 0.4 + R() * (0.7 + ring * 0.55) + (ring === 2 ? R() * 0.9 : 0);
      blocks.push({x, z, w, d, h: hgt, ry: -a + PI / 2, c: WALLS[(i + ring) % WALLS.length]});}}
  for (const b of blocks) {const G = new THREE.Group(); G.position.set(b.x, 0, b.z); G.rotation.y = b.ry; scene.add(G);
    const fl = Math.max(2, Math.round(b.h / 0.16)), wm = std(0xffffff, {map: winT(b.c[0], b.c[1], Math.max(2, Math.round(b.w / 0.12)), fl), roughness: 0.6}), wm2 = std(0xffffff, {map: winT(b.c[0], b.c[1], Math.max(2, Math.round(b.d / 0.12)), fl), roughness: 0.6}), roofM = std(0xcfc8bc);
    add(G, new THREE.BoxGeometry(b.w, b.h, b.d), [wm2, wm2, roofM, roofM, wm, wm], 0, b.h / 2, 0);
    add(G, new THREE.BoxGeometry(b.w + 0.03, 0.03, b.d + 0.03), std(0xb9b1a4), 0, b.h + 0.015, 0);
    add(G, new THREE.BoxGeometry(b.w + 0.02, 0.07, b.d + 0.02), std(0x8c94a4, {roughness: 0.4}), 0, 0.035, 0);
    const k = R(); if (k < 0.35) {for (let j = 0; j < 3; j++) add(G, new THREE.BoxGeometry(0.08, 0.05, 0.06), std(0xdcdcdc, {metalness: 0.5, roughness: 0.4}), (R() - 0.5) * b.w * 0.6, b.h + 0.055, (R() - 0.5) * b.d * 0.6);}
    else if (k < 0.6) {add(G, new THREE.BoxGeometry(b.w * 0.7, 0.03, b.d * 0.6), std(0x8fcf7a), 0, b.h + 0.045, 0); for (let j = 0; j < 4; j++) add(G, new THREE.SphereGeometry(0.035, 10, 8), std(0x5fae5a), (R() - 0.5) * b.w * 0.6, b.h + 0.085, (R() - 0.5) * b.d * 0.5);}
    else if (k < 0.8) {add(G, new THREE.CylinderGeometry(0.06, 0.06, 0.1, 14), std(0x9c7a5a), b.w * 0.2, b.h + 0.12, 0); for (const sx of [-1, 1]) add(G, new THREE.CylinderGeometry(0.006, 0.006, 0.08, 6), std(0x555555), b.w * 0.2 + sx * 0.04, b.h + 0.05, 0);}
    else {for (let j = 0; j < 4; j++) {const sp = add(G, new THREE.BoxGeometry(0.11, 0.008, 0.07), std(0x2c3e66, {metalness: 0.4, roughness: 0.25}), -b.w * 0.25 + j % 2 * 0.14, b.h + 0.05, -b.d * 0.15 + Math.floor(j / 2) * 0.1); sp.rotation.x = -0.35;}}}
  // card houses (A-frames of cards with flat cards as floors) on the inner ring between the streets
  const faceCache = {}, cardFace = id => faceCache[id] ||= new THREE.MeshStandardMaterial({map: tex(256, 358, (g) => {g.scale(0.5, 0.5); drawFace(g, 512, 715, id, P);}), roughness: 0.55});
  const backM = new THREE.MeshStandardMaterial({map: backT, roughness: 0.55}), edgeM = std(0xf4f1ea);
  const cardHouse = (x, z, ry, lv, seed) => {const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G);
    const cl = CL * 0.55, cw = CW * 0.55, ang = 1.1, hh = cl * Math.sin(ang), half = cl * Math.cos(ang) / 2, step = 2 * half + 0.02, slab = new THREE.BoxGeometry(0.008, cl, cw);
    for (let L = 0; L < lv; L++) {const n = lv - L, y0 = L * (hh + 0.008);
      for (let i = 0; i < n; i++) {const cx = (i - (n - 1) / 2) * step;
        for (const sx of [-1, 1]) {const f = cardFace((seed + i * 7 + L * 13 + (sx > 0 ? 5 : 0)) % 52), mats = sx < 0 ? [backM, f, edgeM, edgeM, edgeM, edgeM] : [f, backM, edgeM, edgeM, edgeM, edgeM];
          const m = add(G, slab, mats, cx + sx * half, y0 + hh / 2, 0); m.rotation.z = sx * (PI / 2 - ang);}}
      if (L < lv - 1) add(G, new THREE.BoxGeometry(n * step - 0.04, 0.008, cw), [edgeM, edgeM, backM, backM, edgeM, edgeM], 0, y0 + hh + 0.004, 0);}
    return G;};
  [[0.725, 4], [1.775, 3], [2.825, 4], [3.875, 3], [5.975, 4]].forEach(([a, lv], i) => cardHouse(STAGE.x + Math.cos(a) * 3.75, STAGE.z + Math.sin(a) * 3.75, -a - PI / 2, lv, i * 11));

  // ---------------------------------------------------------------- trees, lamps, benches
  const trees = [], lamps = [], benches = [];
  for (let i = 0; i < 64; i++) {const a = i / 64 * PI * 2; trees.push([STAGE.x + Math.cos(a) * 3.02, 0, STAGE.z + Math.sin(a) * 3.02, R() * 6, 0.8 + R() * 0.4]);}
  for (let i = 0; i < 40; i++) {const a = i / 40 * PI * 2 + 0.05; lamps.push([STAGE.x + Math.cos(a) * 1.98, 0, STAGE.z + Math.sin(a) * 1.98, 0]);}
  for (let i = 0; i < 16; i++) {const a = i / 16 * PI * 2 + 0.1; benches.push([STAGE.x + Math.cos(a) * 1.86, 0.012, STAGE.z + Math.sin(a) * 1.86, -a]);}
  for (let i = 0; i < 90; i++) {const a = R() * PI * 2, r = 9 + R() * 7; trees.push([STAGE.x + Math.cos(a) * r, 0, STAGE.z + Math.sin(a) * r, R() * 6, 0.9 + R() * 0.6]);}
  inst(new THREE.CylinderGeometry(0.012, 0.016, 0.12, 6).translate(0, 0.06, 0), std(0x8a6a4a), trees);
  inst(new THREE.IcosahedronGeometry(0.085, 1).translate(0, 0.17, 0), std(0xffffff, {roughness: 0.9}), trees.map((t, i) => [...t.slice(0, 5), t[4], t[4], [0x6fbf62, 0x58a95a, 0x86c96a, 0x4f9a5e][i % 4]]));
  inst(new THREE.CylinderGeometry(0.004, 0.005, 0.16, 6).translate(0, 0.08, 0), std(0x3a3f4c, {metalness: 0.5}), lamps);
  inst(new THREE.SphereGeometry(0.014, 10, 8).translate(0, 0.165, 0), new THREE.MeshStandardMaterial({color: 0xfff3d6, emissive: 0xffe2a8, emissiveIntensity: 0.6}), lamps, false);
  inst(new THREE.BoxGeometry(0.07, 0.012, 0.025).translate(0, 0.015, 0), std(0xb07a4a), benches);

  // ---------------------------------------------------------------- split-flap board like at a train station, behind the plaza
  const BA = 4.925, BX = STAGE.x + Math.cos(BA) * 3.7, BY = 1.35, BZ = STAGE.z + Math.sin(BA) * 3.7, BW = 1.55, BH = 1.7, BRY = Math.atan2(-BX + STAGE.x, STAGE.z - BZ);
  const boardC = document.createElement('canvas'); boardC.width = 1024; boardC.height = 1124; const boardG = boardC.getContext('2d'); const boardT = new THREE.CanvasTexture(boardC); boardT.colorSpace = THREE.SRGBColorSpace;
  {const G = new THREE.Group(); G.position.set(BX, 0, BZ); G.rotation.y = BRY; scene.add(G);
    for (const sx of [-1, 1]) add(G, new THREE.BoxGeometry(0.07, BY, 0.07), std(0x2e3442, {metalness: 0.6, roughness: 0.35}), sx * (BW / 2 - 0.12), BY / 2 - 0.2, -0.05);
    add(G, new RoundedBoxGeometry(BW + 0.12, BH + 0.24, 0.1, 3, 0.03), std(0x23262e, {metalness: 0.5, roughness: 0.35}), 0, BY + 0.06, -0.06);
    add(G, new THREE.PlaneGeometry(BW, BH), new THREE.MeshStandardMaterial({map: boardT, roughness: 0.5, emissive: 0xffffff, emissiveMap: boardT, emissiveIntensity: 0.15}), 0, BY, -0.005, false);
    add(G, new THREE.BoxGeometry(BW + 0.3, 0.04, 0.32), std(0xf2efe8), 0, BY + BH / 2 + 0.2, 0.02);
    const lab = tex(1024, 80, (g, w, h) => {g.fillStyle = '#23262e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3c74e'; g.font = '600 40px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '6px'; g.fillText('MÖGLICHE REIHENFOLGEN', w / 2, h / 2 + 2);});
    add(G, new THREE.PlaneGeometry(BW, BW * 80 / 1024), new THREE.MeshBasicMaterial({map: lab}), 0, BY + BH / 2 + 0.06, 0.0);}

  // ---------------------------------------------------------------- light, camera, post (tilt-shift)
  scene.add(new THREE.HemisphereLight(0xdfeeff, 0xd8c7ad, 0.8));
  const sun = new THREE.DirectionalLight(0xfff0dc, 1.9); sun.position.set(-6, 10, 5); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, {left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40}); sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.008; sun.shadow.radius = 3; scene.add(sun);
  const CAM = [[0, 0, 0.08, 0.15, 6.2, 0, 24], [2.7, 0, 0.1, 0.15, 5.6, 6, 26], [3.9, 0, 0.1, 0.15, 5.8, 10, 30], [4.9, 0, 0.3, 0.45, 7.0, 8, 42],
    [5.6, 0, 0.0, 0.73, 8.0, 10, 58], [6.8, 0, 0.0, 0.73, 7.2, -8, 62], [8.1, 0, 0.0, 0.73, 6.9, -20, 52], [9.1, BX, BY + 0.2, BZ, 9.8, BRY * 180 / PI, 10], [11.2, BX, BY + 0.2, BZ, 9.3, BRY * 180 / PI + 6, 9],
    [12.3, 0, 0.3, -0.6, 15.5, -8, 40], [13.5, 0, 0.3, -0.6, 14.6, -2, 38]];
  const camAt = camPath(cam, CAM);
  const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
  const tilt = []; for (const d of [[1 / W, 0], [0, 1 / H], [1.6 / W, 0], [0, 1.6 / H]]) {const p = new ShaderPass(TiltShader); p.uniforms.dir.value.set(d[0], d[1]); composer.addPass(p); tilt.push(p);}
  composer.addPass(new OutputPass()); composer.addPass(new ShaderPass(SAT)); const grade = new ShaderPass(GRADE); grade.uniforms.vig.value = 0.25; grade.uniforms.grain.value = 0.025; composer.addPass(grade);
  let lastBoard = -1;
  return {update(v) {poseDeck(cards, v, ORIGIN); thread(v); placePeople(v); placeCars(v); camAt(v); grade.uniforms.t.value = v;
      tilt.forEach((p, i) => {p.uniforms.amt.value = (i < 2 ? 2.6 : 2.1) * lerp(1, 0.55, sm(seg(v, 8.6, 9.2)) * (1 - 0.55 * sm(seg(v, 11.4, 12.2))));});
      const fb = Math.round(v * 30); if (fb !== lastBoard) {flapBoard(boardG, 1024, 1124, v, 8.4, {bg: '#1a1d24', cell: '#2a2e38', cell2: '#252832', digit: '#f6f2ea', hinge: '#14161b', pin: '#3a3f4c'}); boardT.needsUpdate = true; lastBoard = fb;}},
    render() {composer.render();}};}
