// Stil 1 „Spieltisch Noir“: dunkler Club-Raum, smaragdgrüner Filz, Lederpolster, Nussbaum, Chips, Whisky-Glas, Pendelleuchte mit Lichtkegel und Staub,
// Lamellenwand mit Fallblatt-Tafel, Flaschenregal; Tiefenschärfe, Bloom, Körnung.
import {THREE, W, H, PI, RED, clamp, lerp, seg, sm, eo, eio, V3, rng, tex, rr, suit, drawFace, drawBack, makeDeck, poseDeck, makeThread, flapBoard, camPath, T, CT} from './core.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

export const GRADE = {uniforms: {tDiffuse: {value: null}, t: {value: 0}, vig: {value: 0.55}, grain: {value: 0.045}, tint: {value: new THREE.Vector3(1.0, 0.98, 0.95)}},
  vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float t, vig, grain; uniform vec3 tint; varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p, vec2(12.9898,78.233)) + t*7.13) * 43758.5453);}
    void main(){vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - 0.5; q.x *= 0.62; float d = length(q);
      c.rgb *= tint; c.rgb *= 1.0 - vig * smoothstep(0.18, 0.62, d); c.rgb += (h(vUv * vec2(1080.0, 1920.0)) - 0.5) * grain; gl_FragColor = c;}`};

export async function build({renderer, scene, cam}) {
  const R = rng(11);
  renderer.toneMappingExposure = 0.95; scene.background = new THREE.Color(0x070708);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22;
  const add = (par, geo, m, x = 0, y = 0, z = 0, sh = true) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
  const std = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: 0.6, ...o});
  const noise = (g, w, h, n, a, cols) => {for (let i = 0; i < n; i++) {g.fillStyle = cols[i % cols.length].replace('A', (a * (0.4 + R() * 0.6)).toFixed(3)); g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2.5);}};
  const rrShape = (w, d, r) => {const s = new THREE.Shape(), x = w / 2, y = d / 2; s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.absarc(x - r, -y + r, r, -PI / 2, 0); s.lineTo(x, y - r); s.absarc(x - r, y - r, r, 0, PI / 2);
    s.lineTo(-x + r, y); s.absarc(-x + r, y - r, r, PI / 2, PI); s.lineTo(-x, -y + r); s.absarc(-x + r, -y + r, r, PI, PI * 1.5); return s;};
  const flat = (shape, m, y, seg = 48) => {const g = new THREE.ShapeGeometry(shape, seg); g.rotateX(-PI / 2); const o = add(scene, g, m, 0, y, 0, false); return o;};
  const FW = 7.4, FD = 4.8, FR = 1.9;

  // ---------------------------------------------------------------- table: felt with printed gold lines, walnut race track, padded leather rail, body
  const feltT = tex(2048, 1330, (g, w, h) => {g.fillStyle = '#0d4336'; g.fillRect(0, 0, w, h); noise(g, w, h, 90000, 0.08, ['rgba(255,255,255,A)', 'rgba(0,0,0,A)', 'rgba(40,140,110,A)']);
    const cx = w / 2, cy = h / 2; g.strokeStyle = 'rgba(214,176,96,0.75)'; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, cy + 40, 760, 470, 0, 0, PI * 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy + 40, 735, 448, 0, 0, PI * 2); g.stroke();
    [['S', -1, 0], ['H', 1, 0], ['C', 0, -1], ['D', 0, 1]].forEach(([s, sx, sy]) => {g.fillStyle = 'rgba(12,67,54,1)'; g.beginPath(); g.arc(cx + sx * 760, cy + 40 + sy * 470, 30, 0, 7); g.fill(); suit(g, s, cx + sx * 760, cy + 40 + sy * 470, 38, 'rgba(214,176,96,0.9)');});
    g.fillStyle = 'rgba(214,176,96,0.8)'; g.font = '600 34px "Inter Tight"'; g.textAlign = 'center'; g.letterSpacing = '10px'; g.fillText('EINE VON 8 × 10⁶⁷ REIHENFOLGEN', cx, cy - 500);
    g.font = '600 26px "Inter Tight"'; g.fillText('52 KARTEN · 4 FARBEN · 13 WERTE', cx, cy + 600); g.letterSpacing = '0px';
    for (let i = 0; i < 2; i++) {g.strokeStyle = 'rgba(214,176,96,0.55)'; g.lineWidth = 2; rr(g, cx - 1.6 * 160 + i * 0, cy + 260, 0, 0, 0);}
    for (const sx of [-1, 1]) {g.strokeStyle = 'rgba(214,176,96,0.6)'; g.lineWidth = 3; rr(g, cx + sx * 520 - 70, cy - 150, 140, 196, 14); g.stroke(); g.setLineDash([8, 8]); rr(g, cx + sx * 520 - 58, cy - 138, 116, 172, 10); g.stroke(); g.setLineDash([]);}});
  const feltBump = tex(1024, 666, (g, w, h) => {g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); noise(g, w, h, 60000, 0.25, ['rgba(255,255,255,A)', 'rgba(0,0,0,A)']);}, {linear: true});
  {const s = rrShape(FW, FD, FR), g = new THREE.ShapeGeometry(s, 48), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / FW + 0.5, p.getY(i) / FD + 0.5); g.rotateX(-PI / 2);
    add(scene, g, new THREE.MeshStandardMaterial({map: feltT, roughness: 0.96, bumpMap: feltBump, bumpScale: 1.2, color: 0xffffff}), 0, 0, 0, false);}
  const woodT = tex(1024, 256, (g, w, h) => {g.fillStyle = '#4a2a1a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {const y = R() * h; g.strokeStyle = `rgba(${20 + R() * 40},${10 + R() * 20},${5},${0.25 + R() * 0.35})`; g.lineWidth = 0.6 + R() * 2.4; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 + Math.sin(x * 0.043 + i * 2) * 1.5); g.stroke();}}, {repeat: [6, 1]});
  {const outer = rrShape(FW + 0.56, FD + 0.56, FR + 0.28); outer.holes.push(rrShape(FW, FD, FR)); const g = new THREE.ExtrudeGeometry(outer, {depth: 0.05, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 48});
    g.rotateX(-PI / 2); add(scene, g, new THREE.MeshPhysicalMaterial({map: woodT, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08}), 0, -0.03, 0, false);}
  const leatherT = tex(1024, 128, (g, w, h) => {g.fillStyle = '#17151a'; g.fillRect(0, 0, w, h); noise(g, w, h, 20000, 0.12, ['rgba(255,255,255,A)', 'rgba(0,0,0,A)']);
    g.strokeStyle = 'rgba(190,170,140,0.55)'; g.lineWidth = 2.2; g.setLineDash([10, 7]); for (const y of [h * 0.3, h * 0.7]) {g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();}}, {repeat: [36, 1]});
  {const pts = rrShape(FW + 1.2, FD + 1.2, FR + 0.6).getSpacedPoints(220).map(p => V3(p.x, 0.15, -p.y)); const c = new THREE.CatmullRomCurve3(pts, true);
    add(scene, new THREE.TubeGeometry(c, 440, 0.25, 24, true), new THREE.MeshStandardMaterial({map: leatherT, roughness: 0.42, metalness: 0.0}), 0, 0, 0, false);}
  {const g = new THREE.ExtrudeGeometry(rrShape(FW + 1.5, FD + 1.5, FR + 0.75), {depth: 0.9, bevelEnabled: false, curveSegments: 48}); g.rotateX(-PI / 2);
    add(scene, g, std(0x121114, {roughness: 0.35}), 0, -1.0, 0, false);
    add(scene, new THREE.CylinderGeometry(0.9, 1.3, 6, 40), std(0x0f0e10, {roughness: 0.4}), 0, -4.1, 0, false);}
  add(scene, new THREE.PlaneGeometry(80, 80).rotateX(-PI / 2), std(0x0b0b0d, {roughness: 0.25, metalness: 0.2}), 0, -7, 0, false);

  // ---------------------------------------------------------------- cards
  const P = {bg: '#fbfaf6', red: '#c8202f', ink: '#18181d', ink2: '#1d1d24', gold: '#d4a84c', navy: '#22305e', skin: '#f1c7a1', frame: '#f4efe4', paper: true};
  const backT = tex(512, 715, (g, w, h) => drawBack(g, w, h, {bg: '#1b2a55', line: 'rgba(212,168,76,0.26)', accent: '#d4a84c', edge: '#fbfaf6'}));
  const cards = makeDeck(scene, {face: id => new THREE.MeshStandardMaterial({map: tex(512, 715, (g, w, h) => drawFace(g, w, h, id, P)), roughness: 0.38}),
    backMat: new THREE.MeshStandardMaterial({map: backT, roughness: 0.36}), edgeMat: std(0xf1eee6, {roughness: 0.8})});
  const ORIGIN = V3(0, 0.002, 0.15);
  const thread = makeThread(scene, ORIGIN, new THREE.MeshStandardMaterial({color: RED, emissive: RED, emissiveIntensity: 0.55, roughness: 0.45}));

  // ---------------------------------------------------------------- chips, dealer button, card box, whisky glass
  const CHIP = [['#1c1c21', '#f2efe8', '500'], ['#efebe3', '#2a4a9c', '1'], ['#2a4a9c', '#f2efe8', '10'], ['#2d7a5a', '#f2efe8', '25'], ['#5b3f92', '#f3d27a', '100'], ['#c99a3e', '#1c1c21', '1K']];
  const chipM = CHIP.map(([b, s, val]) => {const side = tex(256, 32, (g, w, h) => {g.fillStyle = b; g.fillRect(0, 0, w, h); g.fillStyle = s; for (let i = 0; i < 6; i++) g.fillRect(i * w / 6 + 8, 0, 18, h);});
    const top = tex(256, 256, (g, w, h) => {g.fillStyle = b; g.fillRect(0, 0, w, h); g.fillStyle = s; for (let i = 0; i < 6; i++) {g.save(); g.translate(w / 2, h / 2); g.rotate(i * PI / 3); g.fillRect(-14, -128, 28, 30); g.restore();}
      g.strokeStyle = s; g.lineWidth = 4; g.setLineDash([6, 6]); g.beginPath(); g.arc(w / 2, h / 2, 78, 0, 7); g.stroke(); g.setLineDash([]);
      g.fillStyle = b; g.beginPath(); g.arc(w / 2, h / 2, 70, 0, 7); g.fill(); g.fillStyle = s; g.font = '800 54px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(val, w / 2, h / 2 + 3);});
    return [new THREE.MeshStandardMaterial({map: side, roughness: 0.35}), new THREE.MeshStandardMaterial({map: top, roughness: 0.35}), new THREE.MeshStandardMaterial({map: top, roughness: 0.35})];});
  const chipG = new THREE.CylinderGeometry(0.195, 0.195, 0.034, 40);
  const stack = (x, z, n, ci, wob = 0.012) => {for (let i = 0; i < n; i++) {const c = add(scene, chipG, chipM[ci], x + (R() - 0.5) * wob, 0.017 + i * 0.0345, z + (R() - 0.5) * wob); c.rotation.y = R() * 6;}};
  [[-2.15, -0.55, 14, 0], [-2.55, -0.2, 9, 3], [-2.25, 0.05, 6, 4], [-2.7, -0.8, 17, 2], [2.35, 0.65, 12, 1], [2.75, 0.35, 7, 5], [2.5, 0.05, 15, 4], [2.15, 1.05, 4, 3], [-2.5, 1.25, 8, 2], [-2.1, 1.5, 3, 5]]
    .forEach(([x, z, n, c]) => stack(x, z, n, c));
  for (let i = 0; i < 5; i++) {const c = add(scene, chipG, chipM[i % 6], -1.65 + i * 0.33 + (R() - 0.5) * 0.1, 0.017, 2.05 + (R() - 0.5) * 0.15); c.rotation.set((R() - 0.5) * 0.05, R() * 6, 0);}
  {const t = tex(256, 256, (g, w, h) => {g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.strokeStyle = '#18181d'; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h / 2, 104, 0, 7); g.stroke();
      g.fillStyle = '#18181d'; g.font = '800 46px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DEALER', w / 2, h / 2 + 2);});
    const m = new THREE.MeshStandardMaterial({color: 0xf4f2ec, roughness: 0.3}); add(scene, new THREE.CylinderGeometry(0.24, 0.24, 0.06, 48), [m, new THREE.MeshStandardMaterial({map: t, roughness: 0.3}), m], 1.75, 0.03, 1.75);}
  {const box = new THREE.Group(); scene.add(box); box.position.set(2.05, 0, -1.25); box.rotation.y = 0.45;
    const face = tex(512, 716, (g, w, h) => {drawBack(g, w, h, {bg: '#1b2a55', line: 'rgba(212,168,76,0.22)', accent: '#d4a84c', edge: '#1b2a55'}); g.fillStyle = '#d4a84c'; g.font = '800 64px "Inter Tight"'; g.textAlign = 'center'; g.fillText('PLAYING CARDS', w / 2, 120);});
    const sideM = std(0x1b2a55, {roughness: 0.4}), m = [sideM, sideM, new THREE.MeshStandardMaterial({map: face, roughness: 0.4}), sideM, sideM, sideM];
    add(box, new RoundedBoxGeometry(0.67, 0.2, 0.93, 3, 0.012), m.map(x => x), 0, 0.1, 0);
    const flap = add(box, new THREE.BoxGeometry(0.66, 0.008, 0.2), sideM, 0, 0.2, -0.46 - 0.1); flap.rotation.x = -0.5; flap.position.set(0, 0.24, -0.55);}
  {const glassM = new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.04, transmission: 1, thickness: 0.06, ior: 1.5, metalness: 0, transparent: true});
    const prof = [[0, 0], [0.31, 0], [0.33, 0.02], [0.34, 0.86], [0.32, 0.86], [0.31, 0.1], [0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y));
    const gx = 2.7, gz = -1.95; add(scene, new THREE.CylinderGeometry(0.42, 0.42, 0.02, 48), std(0x2a2420, {roughness: 0.7}), gx, 0.01, gz);
    add(scene, new THREE.LatheGeometry(prof, 64), glassM, gx, 0.02, gz);
    add(scene, new THREE.CylinderGeometry(0.305, 0.305, 0.3, 48), new THREE.MeshPhysicalMaterial({color: 0xc06a1c, roughness: 0.1, transmission: 0.55, thickness: 0.3, transparent: true, opacity: 0.92}), gx, 0.27, gz, false);
    for (const [dx, dz, ry] of [[-0.08, 0.04, 0.4], [0.1, -0.06, 1.1]]) {const c = add(scene, new RoundedBoxGeometry(0.2, 0.18, 0.2, 3, 0.03), new THREE.MeshPhysicalMaterial({color: 0xe8f4ff, roughness: 0.15, transmission: 0.9, thickness: 0.2}), gx + dx, 0.42, gz + dz, false); c.rotation.set(0.3, ry, 0.2);}}

  // ---------------------------------------------------------------- pendant lamp with light cone and dust
  const LAMP = V3(0, 6.6, 0.3);
  {const shade = new THREE.Group(); shade.position.copy(LAMP); scene.add(shade);
    add(shade, new THREE.CylinderGeometry(0.35, 1.25, 0.9, 64, 1, true), new THREE.MeshStandardMaterial({color: 0x111113, roughness: 0.35, metalness: 0.6, side: THREE.DoubleSide}), 0, 0, 0, false);
    add(shade, new THREE.CylinderGeometry(0.34, 1.23, 0.88, 64, 1, true), new THREE.MeshStandardMaterial({color: 0xd9a35a, emissive: 0xffc878, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.8, side: THREE.BackSide}), 0, 0, 0, false);
    add(shade, new THREE.SphereGeometry(0.26, 24, 16), new THREE.MeshBasicMaterial({color: new THREE.Color(0xffe1b0).multiplyScalar(4)}), 0, -0.3, 0, false);
    add(shade, new THREE.CylinderGeometry(0.012, 0.012, 8, 8), std(0x111111), 0, 4.4, 0, false);
    const coneT = tex(64, 256, (g, w, h) => {const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,220,170,0.9)'); gr.addColorStop(0.6, 'rgba(255,210,160,0.25)'); gr.addColorStop(1, 'rgba(255,210,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);});
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 4.2, 6.4, 64, 1, true), new THREE.MeshBasicMaterial({map: coneT, transparent: true, opacity: 0.075, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide}));
    cone.position.set(0, -3.4, 0); shade.add(cone);}
  const spot = new THREE.SpotLight(0xffd6a0, 30, 16, 0.5, 0.75, 1.6); spot.position.copy(LAMP).add(V3(0, -0.35, 0)); spot.target.position.set(0, 0, 0.4);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.00015; spot.shadow.normalBias = 0.01; spot.shadow.radius = 4; scene.add(spot, spot.target);
  scene.add(new THREE.HemisphereLight(0x33424d, 0x120d09, 0.35));
  const rim = new THREE.DirectionalLight(0x5fd0c0, 0.9); rim.position.set(-5, 4, -7); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffe6c8, 0.2); fill.position.set(4, 3, 8); scene.add(fill);
  const dust = (() => {const n = 420, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), seed = []; for (let i = 0; i < n; i++) {const r = Math.sqrt(R()) * 2.6, a = R() * 7, y = 0.4 + R() * 5.6; seed.push([r, a, y, R()]);}
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const dot = tex(32, 32, (c, w, h) => {const gr = c.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,240,215,1)'); gr.addColorStop(1, 'rgba(255,240,215,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);});
    const pts = new THREE.Points(g, new THREE.PointsMaterial({size: 0.035, map: dot, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false})); scene.add(pts);
    return v => {seed.forEach(([r, a, y, s], i) => {const rr2 = r * (0.4 + y / 6.6 * 0.6); p[i * 3] = Math.cos(a + v * 0.05 * (s - 0.5)) * rr2 + Math.sin(v * 0.3 + i) * 0.05; p[i * 3 + 1] = y + Math.sin(v * 0.2 + i * 1.7) * 0.12; p[i * 3 + 2] = 0.3 + Math.sin(a + v * 0.05 * (s - 0.5)) * rr2;}); g.attributes.position.needsUpdate = true;};})();

  // ---------------------------------------------------------------- back wall: wood slats, LED strip, split-flap board, bottle shelf, bokeh lights
  const WZ = -5.2;
  add(scene, new THREE.PlaneGeometry(40, 20), std(0x141215, {roughness: 0.9}), 0, 2, WZ - 0.1, false);
  {const slat = new THREE.BoxGeometry(0.16, 9, 0.12), m = new THREE.MeshStandardMaterial({map: woodT, roughness: 0.55, color: 0x8a6a55}); const im = new THREE.InstancedMesh(slat, m, 70); const o = new THREE.Object3D();
    for (let i = 0; i < 70; i++) {o.position.set(-12.25 + i * 0.35, 2.4, WZ); o.updateMatrix(); im.setMatrixAt(i, o.matrix);} im.receiveShadow = true; scene.add(im);
    add(scene, new THREE.BoxGeometry(24, 0.05, 0.05), new THREE.MeshBasicMaterial({color: new THREE.Color(0xffc27a).multiplyScalar(3)}), 0, 6.9, WZ + 0.12, false);}
  const BW = 2.7, BH = 2.95, BY = 2.35, BZ = WZ + 0.35;
  const boardC = document.createElement('canvas'); boardC.width = 1024; boardC.height = 1118; const boardG = boardC.getContext('2d'); const boardT = new THREE.CanvasTexture(boardC); boardT.colorSpace = THREE.SRGBColorSpace; boardT.anisotropy = 8;
  {add(scene, new RoundedBoxGeometry(BW + 0.26, BH + 0.62, 0.22, 3, 0.04), std(0x0c0c0e, {roughness: 0.3, metalness: 0.5}), 0, BY + 0.18, BZ - 0.1, false);
    add(scene, new THREE.PlaneGeometry(BW, BH), new THREE.MeshStandardMaterial({map: boardT, roughness: 0.5, emissive: 0xffffff, emissiveMap: boardT, emissiveIntensity: 0.25}), 0, BY, BZ + 0.015, false);
    const lab = tex(1024, 96, (g, w, h) => {g.fillStyle = '#0c0c0e'; g.fillRect(0, 0, w, h); g.fillStyle = '#d4a84c'; g.font = '600 40px "Inter Tight"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '8px'; g.fillText('MÖGLICHE REIHENFOLGEN', w / 2, h / 2 + 2);});
    add(scene, new THREE.PlaneGeometry(BW, BW * 96 / 1024), new THREE.MeshBasicMaterial({map: lab}), 0, BY + BH / 2 + 0.2, BZ + 0.016, false);
    for (const sx of [-1, 1]) {const arm = new THREE.Group(); arm.position.set(sx * 0.9, BY + BH / 2 + 0.55, BZ + 0.05); scene.add(arm); add(arm, new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), std(0x18181a), 0, 0, 0.25, false).rotation.x = PI / 2;
      const hd = add(arm, new THREE.CylinderGeometry(0.07, 0.1, 0.22, 20), std(0x18181a, {metalness: 0.6, roughness: 0.3}), 0, -0.06, 0.52, false); hd.rotation.x = 0.9;
      const bs = new THREE.SpotLight(0xffe2b8, 18, 6, 0.6, 0.6, 1.5); bs.position.set(sx * 0.9, BY + BH / 2 + 0.4, BZ + 0.6); bs.target.position.set(sx * 0.6, BY, BZ); scene.add(bs, bs.target);}}
  // bottle shelves left and right of the board (out of focus most of the time)
  const bottleProf = [[0, 0], [0.16, 0], [0.17, 0.02], [0.17, 0.62], [0.12, 0.74], [0.055, 0.8], [0.05, 1.0], [0.06, 1.02], [0, 1.02]].map(([x, y]) => new THREE.Vector2(x, y));
  const bottleG = new THREE.LatheGeometry(bottleProf, 28), BCOL = [0x5a3a1a, 0x2f5a3a, 0x8a5a20, 0x223a5a, 0x6a2030, 0xb08a40, 0x3a3a3a];
  for (const sx of [-1, 1]) for (let row = 0; row < 3; row++) {const y = 0.9 + row * 1.5, x0 = sx * 2.6, xs = sx * 5.6;
    add(scene, new THREE.BoxGeometry(3.4, 0.06, 0.5), std(0x2a1d16, {map: woodT}), (x0 + xs) / 2, y, WZ + 0.3, false);
    add(scene, new THREE.BoxGeometry(3.4, 0.03, 0.03), new THREE.MeshBasicMaterial({color: new THREE.Color(0xffb46a).multiplyScalar(2.2)}), (x0 + xs) / 2, y - 0.05, WZ + 0.52, false);
    for (let i = 0; i < 7; i++) {const b = add(scene, bottleG, new THREE.MeshPhysicalMaterial({color: BCOL[(i + row * 3) % BCOL.length], roughness: 0.15, metalness: 0, clearcoat: 1, emissive: BCOL[(i + row) % BCOL.length], emissiveIntensity: 0.25}), x0 + sx * (0.3 + i * 0.44), y + 0.03, WZ + 0.3, false);
      b.scale.setScalar(0.8 + R() * 0.45);}}
  {const n = 70, dot = tex(64, 64, (c, w, h) => {const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.75, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);});
    for (let i = 0; i < n; i++) {const s = new THREE.Sprite(new THREE.SpriteMaterial({map: dot, color: [0xffc070, 0xff9a50, 0x7fe0d0, 0xffe0b0][i % 4], transparent: true, opacity: 0.35 + R() * 0.4, blending: THREE.AdditiveBlending, depthWrite: false}));
      const sx = R() < 0.5 ? -1 : 1; s.position.set(sx * (3 + R() * 9), 0.6 + R() * 6, WZ - 1 - R() * 5); s.scale.setScalar(0.08 + R() * 0.12); scene.add(s);}}

  // ---------------------------------------------------------------- camera and post
  const CAM = [[0, 0, 0.1, 0.15, 6.3, 0, 15], [2.7, 0, 0.12, 0.15, 5.6, 4, 17], [3.9, 0, 0.12, 0.15, 5.8, 6, 20], [4.9, 0, 0.3, 0.4, 6.6, 4, 36],
    [5.6, 0, 0.0, 0.7, 7.6, 6, 56], [6.8, 0, 0.0, 0.7, 6.9, -10, 60], [8.1, 0, 0.0, 0.7, 6.5, -24, 50], [9.1, 0, BY + 0.12, BZ, 14.4, 0, 4], [11.2, 0, BY + 0.12, BZ, 13.6, 5, 3],
    [12.3, 0, 1.0, -1.2, 16.5, 20, 16], [13.5, 0, 1.0, -1.2, 15.8, 26, 15]];
  const camAt = camPath(cam, CAM);
  const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
  const bokeh = new BokehPass(scene, cam, {focus: 6, aperture: 0.0028, maxblur: 0.009}); composer.addPass(bokeh);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.22, 0.5, 0.95));
  composer.addPass(new OutputPass()); const grade = new ShaderPass(GRADE); composer.addPass(grade);
  let lastBoard = -1;
  return {update(v) {poseDeck(cards, v, ORIGIN); thread(v); dust(v); const qv = camAt(v);
      bokeh.uniforms.focus.value = qv[4] * 0.98; bokeh.uniforms.aperture.value = lerp(0.0028, 0.0016, seg(v, 11.4, 12.4)); grade.uniforms.t.value = v;
      const fb = Math.round(v * 30); if (fb !== lastBoard) {flapBoard(boardG, 1024, 1118, v, 8.4, {bg: '#0a0a0c', cell: '#1d1d21', cell2: '#18181c', digit: '#f3efe6', hinge: '#050506', pin: '#2c2c31'}); boardT.needsUpdate = true; lastBoard = fb;}},
    render() {composer.render();}};}
