// function. – „A und B haben exakt dieselbe Farbe“ (Schachbrett-Schatten nach Adelson), ganzes Video, 27.11.2026. Helles Fotostudio mit Hohlkehle, Schachbrett auf einem Podest, grüner Zylinder.
// Die Helligkeit ist ausgerechnet: Feld A (dunkel, im Licht) und Feld B (hell, im Schatten) kommen exakt gleich hell aus dem Renderer. Pipette, Balken und Maske nehmen die Farbe direkt aus dem fertigen Bild.
// Zeiten = Videozeit, die Stimme beginnt bei 0,15 s (voice/words.json, Take 1).
import {THREE, W, H, PI, FPS, clamp, lerp, seg, sm, eo, eio, back, V3, rng, tex, rr, overlays, camPath} from '../../karten/src/core.js';
import {GRADE} from '../../karten/src/s1.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

await Promise.all(['600 40px "Inter Tight"', '800 40px "Inter Tight"', '400 40px Poppins', '600 34px Poppins', '800 64px Poppins', '500 170px Poppins'].map(f => document.fonts.load(f)));
const VO = 0.15, OUT0 = 35.3, END = 38.4;
const WORDS = (await (await fetch('voice/words.json')).json()).words;
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 200);
scene.background = new THREE.Color(0xd9d5ce);
const R = rng(5);
const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
const lam = c => new THREE.MeshLambertMaterial({color: c});
const std = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.6, ...o});

// ------------------------------------------------------------------ light (white only, so the board stays exact): ambient a, sun d at 35° from the back right
const AMB = 0.6, SUN = 2.0, ELEV = 35 * PI / 180, HD = V3(0.781, 0, -0.625).normalize();
scene.add(new THREE.AmbientLight(0xffffff, AMB));
const sun = new THREE.DirectionalLight(0xffffff, SUN); sun.position.set(HD.x * Math.cos(ELEV) * 12, Math.sin(ELEV) * 12 + 0.64, HD.z * Math.cos(ELEV) * 12); sun.target.position.set(0, 0.64, 0);
sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 14; sun.shadow.blurSamples = 24; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.0; Object.assign(sun.shadow.camera, {left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30}); scene.add(sun, sun.target);
const LIT = AMB + SUN * Math.sin(ELEV), LIGHT = 0.42, DARK = LIGHT * AMB / LIT;   // dark square in the light = light square in the shadow

// ------------------------------------------------------------------ studio: cyclorama (floor, cove, back wall), tape marks, two softboxes on stands, camera on a tripod, side table, cables
const cyc = lam(0xd6d2cb);
add(scene, new THREE.PlaneGeometry(30, 12).rotateX(-PI / 2), cyc, 0, 0, 1.5, false);
{const g = new THREE.CylinderGeometry(2.5, 2.5, 30, 48, 1, true, PI, PI / 2); g.rotateZ(PI / 2); add(scene, g, new THREE.MeshLambertMaterial({color: 0xd6d2cb, side: THREE.BackSide}), 0, 2.5, -4.5, false);
  add(scene, new THREE.PlaneGeometry(30, 14), cyc, 0, 9.5, -7.0, false);}
for (const [x, z, r] of [[-2.2, 1.6, 0.3], [2.4, 1.9, -0.2], [0, 2.6, 0.1]]) for (const s of [1, -1]) {const t = add(scene, new THREE.PlaneGeometry(0.34, 0.06).rotateX(-PI / 2), lam(0xe8c547), x, 0.002, z, false); t.rotation.y = r + s * PI / 4;}
function stand(x, z, ry, h) {const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G); const metal = std(0x1b1b1f, {metalness: 0.7, roughness: 0.35});
  for (let i = 0; i < 3; i++) {const a = i * PI * 2 / 3, l = add(G, new THREE.CylinderGeometry(0.018, 0.018, 0.75, 8), metal, Math.cos(a) * 0.28, 0.2, Math.sin(a) * 0.28); l.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);}
  add(G, new THREE.CylinderGeometry(0.025, 0.03, h, 10), metal, 0, h / 2 + 0.1, 0); return G;}
for (const [x, z, ry] of [[-3.3, -1.2, 0.9], [3.6, 0.4, -1.1]]) {const G = stand(x, z, ry, 2.6); const B = new THREE.Group(); B.position.set(0, 2.9, 0); B.rotation.x = -0.25; G.add(B);
  add(B, new RoundedBoxGeometry(1.3, 1.0, 0.45, 3, 0.04), std(0x141417, {roughness: 0.5}), 0, 0, -0.1);
  add(B, new THREE.PlaneGeometry(1.18, 0.88), new THREE.MeshBasicMaterial({color: 0xfdfbf6}), 0, 0, 0.13, false);}
{const G = stand(3.3, 2.0, -0.9, 1.25), C = new THREE.Group(); C.position.set(0, 1.45, 0); G.add(C);
  add(C, new RoundedBoxGeometry(0.34, 0.24, 0.2, 3, 0.03), std(0x18181b, {roughness: 0.4}), 0, 0, 0);
  add(C, new THREE.CylinderGeometry(0.075, 0.085, 0.22, 24).rotateX(PI / 2), std(0x101012, {roughness: 0.3, metalness: 0.4}), 0, 0, 0.2);
  add(C, new THREE.CircleGeometry(0.06, 24), std(0x2a3a55, {roughness: 0.05, metalness: 0.6}), 0, 0, 0.311, false);
  add(C, new THREE.SphereGeometry(0.015, 10, 8), new THREE.MeshBasicMaterial({color: 0xff3b30}), 0.12, 0.08, 0.1, false);}
{const T = new THREE.Group(); T.position.set(-2.7, 0, -2.4); scene.add(T); add(T, new THREE.CylinderGeometry(0.42, 0.42, 0.04, 40), std(0xf2efe9, {roughness: 0.4}), 0, 0.72, 0);
  add(T, new THREE.CylinderGeometry(0.03, 0.05, 0.7, 12), std(0x1b1b1f, {metalness: 0.7}), 0, 0.36, 0); add(T, new THREE.CylinderGeometry(0.22, 0.22, 0.02, 30), std(0x1b1b1f, {metalness: 0.7}), 0, 0.01, 0);
  add(T, new THREE.CylinderGeometry(0.06, 0.05, 0.13, 24), std(0xfafafa, {roughness: 0.3}), -0.15, 0.805, 0.08);
  const cols = [0xc9312b, 0x2f6fd6, 0xf2c230, 0x2fa05a, 0xf2f2f2, 0xf07a1f]; for (let i = 0; i < 27; i++) {const x = i % 3, y = Math.floor(i / 9), z = Math.floor(i / 3) % 3;
    add(T, new RoundedBoxGeometry(0.058, 0.058, 0.058, 2, 0.008), std(cols[(x + y * 2 + z * 3) % 6], {roughness: 0.35}), 0.12 + (x - 1) * 0.06, 0.77 + y * 0.06, -0.06 + (z - 1) * 0.06);}}
for (const [p0, p1] of [[[-3.3, -1.2], [-1.6, 1.2]], [[3.6, 0.4], [2.2, 2.4]]]) {const pts = []; for (let i = 0; i <= 12; i++) {const u = i / 12; pts.push(V3(lerp(p0[0], p1[0], u) + Math.sin(u * 6) * 0.25, 0.012, lerp(p0[1], p1[1], u) + Math.cos(u * 5) * 0.2));}
  add(scene, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.012, 8), std(0x121214, {roughness: 0.5}), 0, 0, 0, false);}

// ------------------------------------------------------------------ pedestal, board (5 × 5), the green cylinder
add(scene, new RoundedBoxGeometry(3.4, 0.5, 3.4, 3, 0.04), std(0xf4f2ee, {roughness: 0.7}), 0, 0.25, 0);
add(scene, new RoundedBoxGeometry(2.86, 0.14, 2.86, 3, 0.03), std(0x3a2a20, {roughness: 0.45}), 0, 0.57, 0);
const BY = 0.641, SQ = 0.5, sq = [];
for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {const light = (i + j) % 2 === 0, m = lam(0); m.color.setRGB(light ? LIGHT : DARK, light ? LIGHT : DARK, light ? LIGHT : DARK);
  const o = add(scene, new THREE.PlaneGeometry(SQ, SQ).rotateX(-PI / 2), m, (i - 2) * SQ, BY, (j - 2) * SQ, false); sq.push(o);}
const CYL = new THREE.Group(); CYL.position.set(0.75, BY, -0.6); scene.add(CYL);
add(CYL, new THREE.CylinderGeometry(0.42, 0.42, 1.4, 64), std(0x3f9a55, {roughness: 0.55}), 0, 0.7, 0);
const A = V3(-0.5, BY, -1.0), B = V3(0, BY, 0);   // A = dark square (1,0) in the light, B = light square (2,2) in the shadow

// ------------------------------------------------------------------ the studio lamp the light comes from (only seen in the explanation), with a soft light beam
const LDIR = V3(HD.x * Math.cos(ELEV), Math.sin(ELEV), HD.z * Math.cos(ELEV)), BC = V3(0, BY, 0), LAMP = BC.clone().addScaledVector(LDIR, 4.3);
{const metal = std(0x1b1b1f, {metalness: 0.7, roughness: 0.35}), G = new THREE.Group(); G.position.set(LAMP.x, 0, LAMP.z); scene.add(G);
  for (let i = 0; i < 3; i++) {const a = i * PI * 2 / 3 + 0.4, l = add(G, new THREE.CylinderGeometry(0.022, 0.022, 0.9, 8), metal, Math.cos(a) * 0.34, 0.25, Math.sin(a) * 0.34, false); l.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);}
  add(G, new THREE.CylinderGeometry(0.03, 0.035, LAMP.y - 0.35, 10), metal, 0, (LAMP.y - 0.35) / 2 + 0.1, 0, false);
  const H_ = new THREE.Group(); H_.position.set(0, LAMP.y, 0); G.add(H_); H_.lookAt(BC);
  add(H_, new THREE.CylinderGeometry(0.34, 0.3, 0.62, 40).rotateX(PI / 2), std(0x161618, {roughness: 0.45, metalness: 0.3}), 0, 0, -0.05, false);
  add(H_, new THREE.CircleGeometry(0.3, 40), new THREE.MeshBasicMaterial({color: new THREE.Color(0xfff6e6).multiplyScalar(1.4)}), 0, 0, 0.265, false);
  for (const [x, y, w, h, rx, ry] of [[0, 0.36, 0.62, 0.3, -0.5, 0], [0, -0.36, 0.62, 0.3, 0.5, 0], [0.36, 0, 0.3, 0.62, 0, 0.5], [-0.36, 0, 0.3, 0.62, 0, -0.5]]) {const f = add(H_, new THREE.BoxGeometry(w, h, 0.012), metal, x, y, 0.36, false); f.rotation.set(rx, ry, 0);}
  const yoke = add(G, new THREE.TorusGeometry(0.42, 0.025, 8, 40, PI), metal, 0, LAMP.y, 0, false); yoke.lookAt(BC.x, LAMP.y, BC.z); yoke.rotateZ(PI);
  G.traverse(o => {if (o.isMesh) o.receiveShadow = false;});}   // with VSM, receivers are drawn into the shadow map too: the lamp sits on the light path to B and must not darken it
const beamT = tex(64, 256, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,246,225,0.9)'); gr.addColorStop(0.7, 'rgba(255,246,225,0.25)'); gr.addColorStop(1, 'rgba(255,246,225,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);});
const beamM = new THREE.MeshBasicMaterial({map: beamT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide});
{const len = LAMP.distanceTo(BC) - 0.4, b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.5, len, 48, 1, true), beamM); b.position.copy(LAMP).addScaledVector(LDIR, -(len / 2 + 0.35)); b.quaternion.setFromUnitVectors(V3(0, 1, 0), LDIR); scene.add(b);}
const SHADOWP = V3(0.75, BY, -0.6).addScaledVector(V3(-0.781, 0, 0.625), 1.35);

// ------------------------------------------------------------------ camera keys [t, tx, ty, tz, dist, azimuth°, elevation°] and post (no vignette, no depth of field: both would change A and B differently)
const CAM = [[0, 0, 0.75, -0.1, 12.8, -10, 37], [4.9, 0, 0.75, -0.2, 12.0, -6, 39], [11.0, -0.2, 0.7, -0.45, 10.6, -3, 41], [20.4, -0.1, 0.7, -0.35, 10.9, -1, 41],
  [22.6, 1.0, 1.55, -0.8, 15.5, -30, 23], [27.3, 1.0, 1.55, -0.8, 15.0, -25, 24], [28.7, 0, 0.75, -0.25, 11.4, -4, 39], [31.4, 0, 0.75, -0.25, 11.0, -2, 40],
  [33.0, 0, 1.1, -0.5, 15.5, 4, 30], [END + 0.2, 0, 1.1, -0.5, 15.0, 8, 29]];
const camAt = camPath(cam, CAM);
const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
composer.addPass(new OutputPass()); const grade = new ShaderPass(GRADE); grade.uniforms.vig.value = 0; grade.uniforms.grain.value = 0.025; composer.addPass(grade);

// ------------------------------------------------------------------ 2D: red frames and letters at A and B, pipette readout, proof bar, mask, labels, outro
const T = {ringA: 0.85, ringB: 1.45, pip0: 7.6, pip1: 11.05, bar0: 12.1, bar1: 13.3, barOff: 15.6, mask0: 16.5, mask1: 17.2, maskOff: 20.3, beam0: 21.6, beam1: 27.2, lab: 23.5, lift0: 28.75, lift1: 30.0, down0: 32.6, down1: 33.8};
const fx = document.getElementById('fx').getContext('2d'), glc = document.getElementById('gl'), probe = document.createElement('canvas'); probe.width = probe.height = 15; const pg = probe.getContext('2d', {willReadFrequently: true});
const scr = p => {const q = p.clone().project(cam); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H];};
const quad = c => [[-0.25, -0.25], [0.25, -0.25], [0.25, 0.25], [-0.25, 0.25]].map(([dx, dz]) => scr(V3(c.x + dx, BY, c.z + dz)));
function sample(x, y) {pg.drawImage(glc, x - 7, y - 7, 15, 15, 0, 0, 15, 15); const d = pg.getImageData(0, 0, 15, 15).data; let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) {r += d[i]; g += d[i + 1]; b += d[i + 2];} const n = d.length / 4; return [r / n, g / n, b / n].map(Math.round);}
const path = (q, s = 1) => {const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4; fx.moveTo(cx + (q[0][0] - cx) * s, cy + (q[0][1] - cy) * s); for (let i = 1; i < 4; i++) fx.lineTo(cx + (q[i][0] - cx) * s, cy + (q[i][1] - cy) * s); fx.closePath();};
function pill(x, y, s, right, a) {fx.font = '600 34px Poppins'; const tw = fx.measureText(s).width, bx = right ? x : x - tw - 30; fx.globalAlpha = a; fx.fillStyle = 'rgba(23,23,28,0.86)'; rr(fx, bx, y - 28, tw + 30, 56, 28); fx.fill();
  fx.fillStyle = '#ffffff'; fx.textAlign = 'left'; fx.textBaseline = 'middle'; fx.fillText(s, bx + 15, y + 1); fx.globalAlpha = 1;}
function callout(x, y, bx, by, label, col, a) {fx.globalAlpha = a; fx.strokeStyle = 'rgba(23,23,28,0.8)'; fx.lineWidth = 3; fx.beginPath(); fx.moveTo(x, y); fx.lineTo(bx + 180, by); fx.stroke();
  fx.lineWidth = 4; fx.strokeStyle = '#ffffff'; fx.beginPath(); fx.arc(x, y, 16, 0, 7); fx.stroke(); fx.strokeStyle = 'rgba(23,23,28,0.9)'; fx.lineWidth = 2; fx.beginPath(); fx.arc(x, y, 19, 0, 7); fx.stroke();
  fx.fillStyle = 'rgba(255,255,255,0.96)'; rr(fx, bx, by - 62, 360, 124, 22); fx.fill(); fx.fillStyle = `rgb(${col.join(',')})`; rr(fx, bx + 16, by - 46, 92, 92, 14); fx.fill();
  fx.fillStyle = '#17171c'; fx.textAlign = 'left'; fx.textBaseline = 'middle'; fx.font = '800 36px "Inter Tight"'; fx.fillText(label, bx + 126, by - 20);
  fx.font = '600 26px Poppins'; fx.fillStyle = '#4a4a52'; fx.fillText(`R ${col[0]} · G ${col[1]} · B ${col[2]}`, bx + 126, by + 24); fx.globalAlpha = 1;}
// outro (2D, like the other videos): the picture dims, „function“ letter by letter, the red dot pops in
const LOGO_FS = 170, LOGO_Y = 1010; fx.font = `500 ${LOGO_FS}px Poppins`; fx.letterSpacing = '-7px';
const LW = fx.measureText('function').width, DW = fx.measureText('.').width, DOT = fx.measureText('.');
const LX = W / 2 - (LW + DW) / 2, DOTX = LX + LW + (DOT.actualBoundingBoxRight - DOT.actualBoundingBoxLeft) / 2, DOTR = (DOT.actualBoundingBoxAscent + DOT.actualBoundingBoxDescent) / 2, DOTY = LOGO_Y - DOT.actualBoundingBoxAscent + DOTR;
const LETX = []; {let x = LX; for (const ch of 'function') {LETX.push(x); x = LX + fx.measureText('function'.slice(0, LETX.length)).width;}} fx.letterSpacing = '0px';
const endG = document.getElementById('end').getContext('2d');
function outro(v) {const u = v - OUT0; endG.clearRect(0, 0, W, H); if (u < 0) return; const f = sm(seg(u, 0, 0.45)), bg = endG.createRadialGradient(W / 2, 980, 60, W / 2, 980, 1250);
  bg.addColorStop(0, '#2a2a2e'); bg.addColorStop(0.55, '#19191c'); bg.addColorStop(1, '#09090a'); endG.globalAlpha = 0.72 * f; endG.fillStyle = bg; endG.fillRect(0, 0, W, H); endG.globalAlpha = 1;
  const dp = back(seg(u, 1.28, 1.62)), land = seg(u, 1.28, 1.62), sq = land > 0 && land < 1 ? Math.sin(PI * land) * 0.18 : 0;
  if (dp > 0) {endG.fillStyle = '#E01E2B'; endG.beginPath(); endG.ellipse(DOTX, DOTY, DOTR * dp * (1 + sq), DOTR * dp * (1 - sq), 0, 0, PI * 2); endG.fill();}
  endG.font = `500 ${LOGO_FS}px Poppins`; endG.letterSpacing = '-7px'; endG.fillStyle = '#E01E2B'; endG.textAlign = 'left'; endG.textBaseline = 'alphabetic';
  'function'.split('').forEach((ch, i) => {const a = sm(seg(u, 0.4 + i * 0.07, 0.85 + i * 0.07)); if (a <= 0) return; endG.globalAlpha = a; endG.fillText(ch, LETX[i], LOGO_Y + (1 - a) * 34); endG.globalAlpha = 1;});}
function draw2d(v) {fx.clearRect(0, 0, W, H); cam.updateMatrixWorld(); const [ax, ay] = scr(A), [bx, by] = scr(B), ca = sample(ax, ay), cb = sample(bx, by), qa = quad(A), qb = quad(B);
  // mask: everything except A and B disappears behind the studio colour
  const mk = sm(seg(v, T.mask0, T.mask1)) * (1 - sm(seg(v, T.maskOff, T.maskOff + 0.5)));
  if (mk > 0) {fx.globalAlpha = mk; fx.fillStyle = '#e9e5de'; fx.beginPath(); fx.rect(0, 0, W, H); path(qa); path(qb); fx.fill('evenodd'); fx.globalAlpha = 1;}
  // proof bar in the colour of A
  const grow = eio(seg(v, T.bar0, T.bar1)), bf = 1 - sm(seg(v, T.barOff, T.barOff + 0.5));
  if (grow > 0 && bf > 0) {fx.globalAlpha = bf; fx.strokeStyle = `rgb(${ca.join(',')})`; fx.lineCap = 'round'; fx.lineWidth = 46; fx.beginPath(); fx.moveTo(ax, ay); fx.lineTo(lerp(ax, bx, grow), lerp(ay, by, grow)); fx.stroke(); fx.globalAlpha = 1;}
  // red frames (the red thread) and the letters
  const fade = 1 - sm(seg(v, OUT0 - 0.1, OUT0 + 0.3));
  [[qa, T.ringA], [qb, T.ringB]].forEach(([q, t0]) => {const p = back(seg(v, t0, t0 + 0.4)); if (p <= 0) return; fx.globalAlpha = fade; fx.strokeStyle = '#E01E2B'; fx.lineWidth = 7; fx.lineJoin = 'round'; fx.beginPath(); path(q, 0.4 + 0.6 * p); fx.stroke(); fx.globalAlpha = 1;});
  fx.font = '800 64px Poppins'; fx.textAlign = 'center'; fx.textBaseline = 'middle';
  for (const [s, x, y, t0] of [['A', ax, ay - 96, T.ringA], ['B', bx, by - 96, T.ringB]]) {const a = sm(seg(v, t0, t0 + 0.3)) * fade; if (a <= 0) continue; fx.globalAlpha = a; fx.lineWidth = 10; fx.strokeStyle = 'rgba(20,20,24,0.85)'; fx.strokeText(s, x, y); fx.fillStyle = '#ffffff'; fx.fillText(s, x, y);
    fx.strokeStyle = '#ffffff'; fx.lineWidth = 3; fx.beginPath(); fx.moveTo(x, y + 38); fx.lineTo(x, y + 66); fx.stroke(); fx.globalAlpha = 1;}
  // pipette readout: both squares measured live from the rendered picture
  const pa = sm(seg(v, T.pip0, T.pip0 + 0.35)) * (1 - sm(seg(v, T.pip1 - 0.3, T.pip1)));
  if (pa > 0) {callout(ax, ay, 70, 1215, 'Feld A', ca, pa); callout(bx, by, 650, 1215, 'Feld B', cb, sm(seg(v, T.pip0 + 0.25, T.pip0 + 0.6)) * (1 - sm(seg(v, T.pip1 - 0.3, T.pip1))));}
  // labels in the explanation: the light comes from the lamp, the cylinder throws the shadow onto B
  const la = sm(seg(v, T.lab - 0.8, T.lab - 0.3)) * (1 - sm(seg(v, T.beam1 - 0.2, T.beam1 + 0.2))), ls = sm(seg(v, T.lab, T.lab + 0.5)) * (1 - sm(seg(v, T.beam1 - 0.2, T.beam1 + 0.2)));
  if (la > 0) {const [x, y] = scr(LAMP); fx.globalAlpha = la; fx.strokeStyle = 'rgba(23,23,28,0.8)'; fx.lineWidth = 3; fx.beginPath(); fx.moveTo(x - 30, y + 30); fx.lineTo(x - 150, y + 150); fx.stroke(); pill(x - 150, y + 150, 'Licht', false, la);}
  if (ls > 0) {const [x, y] = scr(SHADOWP); fx.globalAlpha = ls; fx.strokeStyle = 'rgba(23,23,28,0.8)'; fx.lineWidth = 3; fx.beginPath(); fx.moveTo(x, y); fx.lineTo(x - 160, y + 100); fx.stroke(); fx.fillStyle = 'rgba(23,23,28,0.9)'; fx.beginPath(); fx.arc(x, y, 7, 0, 7); fx.fill(); pill(x - 160, y + 100, 'Schatten', false, ls);}
  fx.globalAlpha = 1; window.__AB = {a: ca, b: cb};}

// ------------------------------------------------------------------ texts (subtitles from the word times of take 1)
const SUBG = ['Die Felder A und B haben exakt dieselbe Farbe.', 'Glaubst du nicht?', 'A sieht dunkel aus, B hell.', 'Aber auf deinem Bildschirm leuchten beide Stellen genau gleich.',
  'Wenn ich die beiden mit einem Balken in derselben Farbe verbinde,', 'siehst du keinen Übergang.', 'Und wenn ich alles andere wegnehme,', 'bleiben zwei identische graue Felder übrig.',
  'Der Grund: Dein Gehirn misst nicht einfach das Licht.', 'Es sieht den Schatten und rechnet ihn heraus,', 'damit du Farben auch im Schatten richtig erkennst.',
  'Ohne den Zylinder siehst du, wie hell B wirklich ist.', 'Hast du es am Anfang erkannt?', 'Schreib’s in die Kommentare.'];
const SUBS = []; {const wn = WORDS.filter(w => !w.text.startsWith('[') && !w.text.endsWith(']')); let i = 0;
  SUBG.forEach(s => {const n = s.split(' ').length; SUBS.push([wn[i].start + VO - 0.05, wn[i + n - 1].end + VO + 0.25, s]); i += n;});
  for (let k = 0; k < SUBS.length - 1; k++) SUBS[k][1] = Math.min(SUBS[k][1], SUBS[k + 1][0]); SUBS[SUBS.length - 1][1] = OUT0;}
const TEXT = {TITLES: [[-0.3, 4.95, 'A und B haben<br>exakt dieselbe Farbe.'], [20.4, 27.6, 'Dein Gehirn rechnet<br>den Schatten heraus.'], [31.55, OUT0, 'Hast du es am<br>Anfang erkannt?']],
  NUMS: [[T.pip0, T.pip1, 'A = B', 'Gemessen im fertigen Bild: exakt dieselben Farbwerte']], SUBS,
  SRCS: [[-0.3, OUT0, 'Schachbrett-Täuschung nach Edward Adelson, MIT 1995 · Modell vereinfacht']]};
const ov = overlays(TEXT), ovEl = document.getElementById('ov');
function update(v) {camAt(v); grade.uniforms.t.value = v; CYL.position.y = BY + 7 * eio(seg(v, T.lift0, T.lift1)) - 7 * eio(seg(v, T.down0, T.down1));
  beamM.opacity = 0.11 * sm(seg(v, T.beam0, T.beam0 + 0.8)) * (1 - sm(seg(v, T.beam1 - 0.4, T.beam1))); ov(v); ovEl.style.opacity = 1 - seg(v, OUT0, OUT0 + 0.35);}
window.TOTAL = Math.round(END * FPS);
window.renderFrame = f => {update(f / FPS); composer.render(); draw2d(f / FPS); outro(f / FPS);};
const q0 = new URLSearchParams(location.search).get('t'); window.renderFrame(Math.round((q0 != null ? +q0 : 0) * FPS)); window.ready = true;
