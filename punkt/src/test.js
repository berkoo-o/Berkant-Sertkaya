// Test „Der rote Punkt verschwindet“ (blinder Fleck), 27.11.2026: erst das Mitmach-Bild (Kreuz und roter Punkt, auf dem Handy etwa 5 cm auseinander),
// dann ein 3D-Augenmodell im Horizontalschnitt: Das Licht vom Kreuz fällt auf die Netzhautgrube, das Licht vom roten Punkt genau auf den Sehnervkopf.
import {THREE, W, H, PI, RED, FPS, clamp, lerp, seg, sm, eo, eio, V3, rng, tex, rr, overlays, camPath} from '../../karten/src/core.js';
import {GRADE} from '../../karten/src/s1.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

await Promise.all(['600 40px "Inter Tight"', '800 40px "Inter Tight"', '400 40px Poppins', '600 34px Poppins'].map(f => document.fonts.load(f)));
const END = 8.6, FADE0 = 4.4, FADE1 = 5.2;
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 200);
scene.background = new THREE.Color(0x08080b);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.3;
const R = rng(7);
const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
const std = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.55, ...o});

// ------------------------------------------------------------------ studio: dark floor that reflects a little, curved back wall, pedestal with brass ring
add(scene, new THREE.CircleGeometry(14, 64).rotateX(-PI / 2), std(0x0d0d11, {roughness: 0.32, metalness: 0.4}), 0, 0, 0, false);
{const g = new THREE.CylinderGeometry(9, 9, 12, 96, 1, true, PI * 0.6, PI * 0.8); add(scene, g, std(0x121218, {roughness: 0.9, side: THREE.BackSide}), 0, 6, 0, false);}
const PED = new THREE.Group(); scene.add(PED);
add(PED, new THREE.CylinderGeometry(0.95, 1.05, 0.5, 72), std(0x16161b, {roughness: 0.35, metalness: 0.3}), 0, 0.25, 0);
add(PED, new THREE.TorusGeometry(0.97, 0.018, 12, 96).rotateX(PI / 2), std(0xc9a25a, {metalness: 0.9, roughness: 0.25}), 0, 0.5, 0);
add(PED, new THREE.CylinderGeometry(0.03, 0.04, 0.55, 16), std(0xc9a25a, {metalness: 0.9, roughness: 0.25}), 0, 0.77, 0);
{const t = tex(512, 96, (g, w, h) => {g.fillStyle = '#c9a25a'; rr(g, 2, 2, w - 4, h - 4, 12); g.fill(); g.fillStyle = '#2a1d0c'; g.font = '800 40px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '6px'; g.fillText('AUGE · HORIZONTALSCHNITT', w / 2, h / 2 + 2);});
  const p = add(PED, new THREE.PlaneGeometry(0.9, 0.17), new THREE.MeshStandardMaterial({map: t, metalness: 0.7, roughness: 0.3}), 0, 0.27, 1.02, false); p.rotation.x = -0.08;}

// ------------------------------------------------------------------ the eye (radius 1), cut horizontally: only the lower half, the optical axis points to +z
const E = new THREE.Group(); E.position.set(0, 2.05, 0); scene.add(E);
const D2R = PI / 180, LAT = {phiStart: -PI / 2, phiLength: PI};
const arc = (rad, b0, b1, n = 48, cy = 0) => Array.from({length: n + 1}, (_, i) => {const b = (b0 + (b1 - b0) * i / n) * D2R; return new THREE.Vector2(Math.max(1e-4, rad * Math.sin(b)), cy + rad * Math.cos(b));});
const lathe = (pts, m) => {const g = new THREE.LatheGeometry(pts, 96, LAT.phiStart, LAT.phiLength); g.rotateX(PI / 2); return add(E, g, m);};
// section cap: the closed profile (r, along-axis) laid into the cut plane on both sides of the axis
const cap = (pts, m) => {const s = new THREE.Shape(pts); for (const sx of [1, -1]) {const g = new THREE.ShapeGeometry(s, 4); g.rotateX(PI / 2); const o = add(E, g, m, 0, 0.0008, 0, false); o.scale.x = sx;}};
function layer(r0, r1, b0, b1, outM, inM, capM) {const o = arc(r0, b0, b1), i = arc(r1, b1, b0); lathe(o, outM); lathe(i.slice().reverse(), inM); cap([...o, ...i], capM);}
const side = {side: THREE.DoubleSide};
// retina inner surface: warm orange fundus, macula at the back pole, pale optic disc 23° nasal, vessels from the disc
const B_RET = 62, B_DISC = 157;
const fundus = tex(1024, 512, (g, w, h) => {g.fillStyle = '#d98557'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) {g.fillStyle = `rgba(${150 + R() * 60},${60 + R() * 40},${40},${0.08 + R() * 0.08})`; g.fillRect(R() * w, R() * h, 2 + R() * 5, 2 + R() * 5);}
  const gm = g.createLinearGradient(0, h * 0.86, 0, h); gm.addColorStop(0, 'rgba(120,50,30,0)'); gm.addColorStop(1, 'rgba(110,45,28,0.75)'); g.fillStyle = gm; g.fillRect(0, 0, w, h);
  const dv = (B_DISC - B_RET) / (180 - B_RET) * h, du = 0;   // disc at the left edge (nasal), on the cut
  g.strokeStyle = 'rgba(122,40,44,0.85)'; g.lineCap = 'round';
  for (let k = 0; k < 9; k++) {const a = -1.2 + k * 0.3, len = 260 + R() * 240; let x = du + 8, y = dv; g.lineWidth = 9 - k % 3 * 2; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 14; s++) {x += Math.cos(a + Math.sin(s * 0.7 + k) * 0.35) * len / 14; y += Math.sin(a + Math.sin(s * 0.9 + k) * 0.35) * len / 14 * 0.7; g.lineTo(x, y);} g.stroke();}
  const gd = g.createRadialGradient(du, dv, 4, du, dv, 70); gd.addColorStop(0, '#fff2c8'); gd.addColorStop(0.65, '#f4d79a'); gd.addColorStop(1, 'rgba(244,215,154,0)'); g.fillStyle = gd; g.beginPath(); g.ellipse(du, dv, 70, 62, 0, 0, 7); g.fill();}, {});
layer(1.0, 0.955, 38, 180, std(0xf1ece4, {roughness: 0.5}), std(0x3a2a26, side), std(0xf6f1ea, side));                   // sclera
layer(0.955, 0.935, 50, 180, std(0x4a2a22, side), std(0x4a2a22, side), std(0x5a3026, side));                           // choroid
{const o = arc(0.935, B_RET, 180), i = arc(0.915, 180, B_RET); lathe(o, std(0xd98557, side));
  const gi = new THREE.LatheGeometry(i.slice().reverse(), 96, LAT.phiStart, LAT.phiLength); gi.rotateX(PI / 2);
  const uv = gi.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - uv.getY(k));
  add(E, gi, new THREE.MeshStandardMaterial({map: fundus, roughness: 0.6, side: THREE.DoubleSide})); cap([...o, ...i], std(0xe7a06c, side));}    // retina
// cornea (clear), iris (half ring), lens (half ellipsoid), ciliary body
{const cy = 0.228, rc = 0.832, o = arc(rc, 0, 47.8, 32, cy), i = arc(rc - 0.03, 47.8, 0, 32, cy);
  const m = new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.04, transmission: 1, thickness: 0.05, ior: 1.38, transparent: true, side: THREE.DoubleSide});
  lathe(o, m); cap([...o, ...i], new THREE.MeshStandardMaterial({color: 0xdfeef6, transparent: true, opacity: 0.55, side: THREE.DoubleSide}));}
{const t = tex(512, 512, (g, w, h) => {const c = w / 2; g.fillStyle = '#3b6a7a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) {const a = R() * PI * 2, r0 = 70 + R() * 30, r1 = 180 + R() * 70;
      g.strokeStyle = `rgba(${90 + R() * 80},${130 + R() * 70},${120 + R() * 50},${0.35 + R() * 0.3})`; g.lineWidth = 2 + R() * 3; g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); g.stroke();}
    g.strokeStyle = '#1d3540'; g.lineWidth = 14; g.beginPath(); g.arc(c, c, 245, 0, 7); g.stroke(); g.fillStyle = '#0b0b0d'; g.beginPath(); g.arc(c, c, 62, 0, 7); g.fill();});
  const ir = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.6, 96, 1, PI, PI), new THREE.MeshStandardMaterial({map: t, roughness: 0.6, side: THREE.DoubleSide})); ir.position.z = 0.7; E.add(ir);
  const ring = new THREE.RingGeometry(0.13, 0.6, 96, 1, PI, PI), uv = ring.attributes.uv, p = ring.attributes.position; for (let k = 0; k < uv.count; k++) uv.setXY(k, p.getX(k) / 1.2 + 0.5, p.getY(k) / 1.2 + 0.5); ir.geometry = ring;}
{const g = new THREE.SphereGeometry(0.36, 64, 32, 0, PI * 2, PI / 2, PI / 2); g.scale(1, 1, 0.46);
  const m = new THREE.MeshPhysicalMaterial({color: 0xfff3d6, roughness: 0.08, transmission: 0.85, thickness: 0.2, ior: 1.42, transparent: true});
  add(E, g, m, 0, 0, 0.52); const c = add(E, new THREE.CircleGeometry(0.36, 64).rotateX(-PI / 2), new THREE.MeshStandardMaterial({color: 0xc9b48a, roughness: 0.4, transparent: true, opacity: 0.75}), 0, 0.001, 0.52, false); c.scale.set(1, 1, 0.46);}
layer(0.955, 0.86, 40, 52, std(0x5a3026, side), std(0x5a3026, side), std(0x6a382c, side));                              // ciliary body
// optic nerve: half cylinder leaving the eye 23° nasal (to -x), with its section cap and a sheath
{const dir = new THREE.Vector3(-Math.sin(23 * D2R), 0, -Math.cos(23 * D2R)), N = new THREE.Group(); E.add(N); N.position.copy(dir.clone().multiplyScalar(0.92));
  {const A = dir.clone().add(V3(-0.25, 0, -0.1)).normalize(), Z = V3(0, 1, 0), X = new THREE.Vector3().crossVectors(A, Z); N.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, A, Z));}   // local y = nerve axis, local z = up, so the half below the cut stays
  add(N, new THREE.CylinderGeometry(0.15, 0.16, 0.95, 48, 1, false, PI / 2, PI), std(0xf0e2b8, side), 0, 0.475, 0);
  const capM = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.95), std(0xf6e9c4, side)); capM.position.set(0, 0.475, 0.001); N.add(capM);
  add(N, new THREE.CylinderGeometry(0.162, 0.172, 0.9, 48, 1, true, PI / 2, PI), std(0xd8c79c, {roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.6}), 0, 0.5, 0);}

// ------------------------------------------------------------------ light rays: the cross (looked at) to the fovea, the red dot (15° to the right) through the nodal point to the optic disc
const NOD = V3(0, 0.03, 0.48), FOV = V3(0, 0.03, -0.91);
const hit = (() => {const d = V3(-Math.sin(15 * D2R), 0, -Math.cos(15 * D2R)); let t = 0; for (; t < 3; t += 0.001) {const p = NOD.clone().addScaledVector(d, t); if (p.length() > 0.915) break;} return NOD.clone().addScaledVector(d, t);})();
const FAR = 5.2, crossP = V3(0, 0.03, FAR), dotP = NOD.clone().addScaledVector(V3(Math.sin(15 * D2R), 0, Math.cos(15 * D2R)), FAR - 0.4);
function ray(pts, col, glow) {const c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0); const g = new THREE.TubeGeometry(c, 200, 0.014, 10, false);
  const m = new THREE.MeshBasicMaterial({color: new THREE.Color(col).multiplyScalar(glow)}); const o = add(E, g, m, 0, 0, 0, false); const n = g.index.count; return u => {g.setDrawRange(0, Math.floor(n * clamp(u) / 6) * 6); o.visible = u > 0;};}
const rayW = ray([crossP, V3(0, 0.03, 1.06), V3(0, 0.03, 0.52), FOV], 0xfff4e0, 1.1), rayR = ray([dotP, NOD, hit], RED, 2.2);
// the little cross and the red dot hanging in front of the eye (link to the first part)
{const m = new THREE.MeshBasicMaterial({color: 0xffffff}); for (const [w, h] of [[0.34, 0.07], [0.07, 0.34]]) add(E, new THREE.BoxGeometry(w, h, 0.03), m, crossP.x, crossP.y + 0.25, crossP.z, false);}
const dotM = add(E, new THREE.SphereGeometry(0.11, 32, 20), new THREE.MeshBasicMaterial({color: new THREE.Color(RED).multiplyScalar(1.6)}), dotP.x, dotP.y + 0.25, dotP.z, false);
const spotDisc = add(E, new THREE.SphereGeometry(0.035, 20, 14), new THREE.MeshBasicMaterial({color: new THREE.Color(RED).multiplyScalar(2.4)}), hit.x, hit.y, hit.z, false);

// ------------------------------------------------------------------ lights, camera, post
const key = new THREE.SpotLight(0xfff1e0, 34, 20, 0.45, 0.6, 1.6); key.position.set(2.4, 7.5, 3.2); key.target.position.set(0, 1.9, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0002; scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x7fc8ff, 1.2); rim.position.set(-4, 3, -5); scene.add(rim);
scene.add(new THREE.HemisphereLight(0x3a4458, 0x0b0908, 0.5));
const fill = new THREE.PointLight(0xffd9b0, 6, 8, 1.5); fill.position.set(0.5, 3.4, 1.6); scene.add(fill);
const CAM = [[0, 0, 1.95, 0.1, 11.0, 0, 60, 0.0012], [FADE1, 0, 1.95, 0.0, 10.2, 5, 63, 0.0012], [END + 0.2, 0, 1.95, -0.1, 9.4, 11, 66, 0.0012]];
const camAt = camPath(cam, CAM);
const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
const bokeh = new BokehPass(scene, cam, {focus: 6, aperture: 0.0016, maxblur: 0.008}); composer.addPass(bokeh);
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.22, 0.45, 0.92));
composer.addPass(new OutputPass()); const grade = new ShaderPass(GRADE); composer.addPass(grade);

// ------------------------------------------------------------------ the 2D part: cross and red dot exactly where the blind spot test works on a phone (about 5 cm apart, eye about 20 cm away)
const fx = document.getElementById('fx').getContext('2d'), CX = 140, DX = 940, SY = 700, DOTR = 40;
const LABELS = [['Netzhaut', () => E.localToWorld(V3(0.55, 0.02, -0.72)), 50, -150], ['Sehnerv', () => E.localToWorld(V3(-0.62, 0.02, -1.25)), 150, 40], ['blinder Fleck', () => E.localToWorld(hit.clone()), -110, 250]];
function draw2d(v) {fx.clearRect(0, 0, W, H); const a = 1 - sm(seg(v, FADE0, FADE1));
  if (a > 0) {fx.globalAlpha = a; fx.fillStyle = '#0e0e12'; fx.fillRect(0, 0, W, H);
    fx.fillStyle = '#f4f2ee'; fx.fillRect(CX - 34, SY - 7, 68, 14); fx.fillRect(CX - 7, SY - 34, 14, 68);
    const pop = clamp(v / 0.25); fx.fillStyle = '#E01E2B'; fx.beginPath(); fx.arc(DX, SY, DOTR * (0.6 + 0.4 * pop), 0, PI * 2); fx.fill(); fx.globalAlpha = 1;}
  cam.updateMatrixWorld(); fx.font = '600 34px Poppins'; fx.textBaseline = 'middle';
  LABELS.forEach(([s, f, dx, dy], i) => {const al = i === 2 ? sm(seg(v, 6.9, 7.4)) : sm(seg(v, 5.9 + i * 0.3, 6.4 + i * 0.3)); if (al <= 0) return; const p = f().project(cam), x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H;
    const tx = x + dx, ty = y + dy, left = dx < 0, red = i === 2, tw = fx.measureText(s).width; fx.globalAlpha = al;
    fx.strokeStyle = red ? '#E01E2B' : 'rgba(255,255,255,0.85)'; fx.lineWidth = 3; fx.beginPath(); fx.moveTo(x, y); fx.lineTo(tx, ty); fx.stroke();
    fx.fillStyle = red ? '#E01E2B' : '#ffffff'; fx.beginPath(); fx.arc(x, y, 6, 0, 7); fx.fill();
    const bx = left ? tx - tw - 30 : tx, by = ty - 28; fx.fillStyle = red ? '#E01E2B' : 'rgba(12,12,16,0.82)'; rr(fx, bx, by, tw + 30, 56, 28); fx.fill();
    fx.fillStyle = '#ffffff'; fx.textAlign = 'left'; fx.fillText(s, bx + 15, ty + 1); fx.globalAlpha = 1;});}

const TEXT = {TITLES: [[-0.3, FADE0, 'Gleich verschwindet<br>dieser rote Punkt.'], [6.9, END + 1, 'Hier ist dein<br>blinder Fleck.']], NUMS: [],
  SUBS: [[0.1, 2.3, 'Halt dein linkes Auge zu und schau nur aufs Kreuz.'], [2.3, FADE0, 'Jetzt komm mit dem Handy langsam näher.'], [FADE1 - 0.1, 6.9, 'Das Licht vom Punkt fällt genau auf die Stelle,'], [6.9, END + 1, 'an der der Sehnerv das Auge verlässt.']],
  SRCS: [[-0.3, END + 1, 'Test · Modell vereinfacht']]};
const ov = overlays(TEXT);
function update(v) {const qv = camAt(v); bokeh.uniforms.focus.value = qv[4] * 0.98; bokeh.uniforms.aperture.value = qv[7]; grade.uniforms.t.value = v;
  rayW(seg(v, 5.4, 6.2)); rayR(eio(seg(v, 6.1, 6.9))); spotDisc.scale.setScalar(Math.max(1e-3, sm(seg(v, 6.8, 7.1)) * (1 + 0.25 * Math.sin(v * 7)))); spotDisc.visible = v > 6.8;
  dotM.scale.setScalar(1 + 0.08 * Math.sin(v * 5)); E.rotation.y = -0.12 + v * 0.01; ov(v);}
window.TOTAL = Math.round(END * FPS);
window.renderFrame = f => {update(f / FPS); composer.render(); draw2d(f / FPS);};
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round((q0 != null ? +q0 : 0) * FPS)); window.ready = true;
