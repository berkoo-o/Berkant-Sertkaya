// Stil 2 „Glas und Neon“: dunkles Studio wie eine Tech-Keynote, spiegelnder Boden mit Raster, schwarze Glaskarten mit leuchtendem Aufdruck
// und leuchtenden Kanten, Bühnenscheibe mit Skala, Ziffernring, HUD-Beschriftungen, Hologramm-Tafel mit Projektor, Lichtsäulen, Sternenstaub.
import {THREE, W, H, PI, RED, clamp, lerp, seg, sm, eo, eio, V3, rng, tex, rr, suit, drawFace, drawBack, makeDeck, poseDeck, makeThread, flapBoard, camPath, BIG, T} from './core.js';
import {GRADE} from './s1.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';

export async function build({renderer, scene, cam}) {
  const R = rng(21), CY = '#62e6ff', PK = '#ff6fb5', VI = '#8f7bff';
  renderer.toneMappingExposure = 1.0; scene.background = new THREE.Color(0x05060c);
  const add = (par, geo, m, x = 0, y = 0, z = 0, sh = false) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; par.add(o); return o;};
  const glow = c => new THREE.MeshBasicMaterial({color: new THREE.Color(c).multiplyScalar(2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending});
  const label = (s, x, y, z, size = 0.11, col = CY, ry = 0, rx = 0, w = 1024) => {const t = tex(w, 128, (g, cw, ch) => {g.font = '600 64px "Inter Tight"'; g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'middle'; g.letterSpacing = '6px'; g.shadowColor = col; g.shadowBlur = 14; g.fillText(s, 12, ch / 2 + 2);});
    const m = add(scene, new THREE.PlaneGeometry(size * w / 128, size), new THREE.MeshBasicMaterial({map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff}), x, y, z); m.rotation.set(rx, ry, 0); return m;};

  // ---------------------------------------------------------------- mirror floor with a fine grid, stage disc with a dial
  const mirror = new Reflector(new THREE.PlaneGeometry(60, 60), {textureWidth: 1080, textureHeight: 1080, color: 0x6a7088}); mirror.rotation.x = -PI / 2; mirror.position.y = -0.07; scene.add(mirror);
  const gridT = tex(2048, 2048, (g, w, h) => {g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(6,8,16,0.55)'); gr.addColorStop(1, 'rgba(6,8,16,0.92)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i <= 64; i++) {const a = i % 8 === 0 ? 0.22 : 0.08; g.strokeStyle = `rgba(98,230,255,${a})`; g.lineWidth = i % 8 === 0 ? 2 : 1; g.beginPath(); g.moveTo(i * w / 64, 0); g.lineTo(i * w / 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 64); g.lineTo(w, i * h / 64); g.stroke();}
    const fade = g.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w / 2); fade.addColorStop(0, 'rgba(5,6,12,0)'); fade.addColorStop(1, 'rgba(5,6,12,1)'); g.fillStyle = fade; g.fillRect(0, 0, w, h);});
  add(scene, new THREE.PlaneGeometry(40, 40).rotateX(-PI / 2), new THREE.MeshBasicMaterial({map: gridT, transparent: true, depthWrite: false}), 0, -0.065, 0);
  const STAGE = V3(0, 0, 0.73);
  {const disc = new THREE.Group(); disc.position.set(STAGE.x, -0.065, STAGE.z); scene.add(disc);
    add(disc, new THREE.CylinderGeometry(1.75, 1.8, 0.06, 96), new THREE.MeshPhysicalMaterial({color: 0x0d111c, roughness: 0.18, metalness: 0.6, clearcoat: 1}), 0, 0.03, 0, false);
    add(disc, new THREE.TorusGeometry(1.775, 0.009, 8, 160).rotateX(PI / 2), glow(CY), 0, 0.055, 0);
    add(disc, new THREE.TorusGeometry(1.81, 0.005, 8, 160).rotateX(PI / 2), glow(VI), 0, 0.01, 0);
    const dial = tex(2048, 2048, (g, w, h) => {const c = w / 2; g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(98,230,255,0.75)'; g.shadowColor = CY; g.shadowBlur = 6;
      for (let i = 0; i < 360; i += 2) {const a = i * PI / 180, r0 = i % 10 === 0 ? 930 : 958; g.lineWidth = i % 30 === 0 ? 4 : 2; g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a) * 985, c + Math.sin(a) * 985); g.stroke();}
      g.font = '600 30px "Inter Tight"'; g.fillStyle = 'rgba(98,230,255,0.85)'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = 0; i < 52; i++) {const a = i / 52 * PI * 2 - PI / 2; g.save(); g.translate(c + Math.cos(a) * 890, c + Math.sin(a) * 890); g.rotate(a + PI / 2); g.fillText(String(i + 1).padStart(2, '0'), 0, 0); g.restore();}
      g.strokeStyle = 'rgba(143,123,255,0.5)'; g.lineWidth = 2; g.setLineDash([14, 10]); g.beginPath(); g.arc(c, c, 845, 0, PI * 2); g.stroke(); g.setLineDash([]);});
    add(disc, new THREE.PlaneGeometry(3.5, 3.5).rotateX(-PI / 2), new THREE.MeshBasicMaterial({map: dial, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}), 0, 0.0605, 0);}

  // ---------------------------------------------------------------- black glass cards with neon print and glowing edges
  const P = {bg: '#06080e', red: PK, ink: CY, ink2: '#06080e', gold: '#ffd27a', navy: VI, skin: '#28305a', frame: '#0a0e1c', line: 'rgba(98,230,255,0.35)', glow: 8};
  const backT = tex(512, 715, (g, w, h) => drawBack(g, w, h, {bg: '#070912', line: 'rgba(143,123,255,0.35)', accent: CY, edge: '#0b0f1c'}));
  const cards = makeDeck(scene, {face: id => {const t = tex(512, 715, (g, w, h) => drawFace(g, w, h, id, P)); return new THREE.MeshPhysicalMaterial({color: 0x10131c, map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.25, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05});},
    backMat: new THREE.MeshPhysicalMaterial({color: 0x161a26, map: backT, emissive: 0xffffff, emissiveMap: backT, emissiveIntensity: 0.9, roughness: 0.12, clearcoat: 1}),
    edgeMat: new THREE.MeshBasicMaterial({color: new THREE.Color(CY).multiplyScalar(0.55)})});
  const ORIGIN = V3(0, 0.002, 0.15);
  const thread = makeThread(scene, ORIGIN, new THREE.MeshBasicMaterial({color: new THREE.Color(RED).multiplyScalar(2.4)}), 0.0065);
  // rotating band of digits around the fan and HUD labels
  const ringT = tex(4096, 128, (g, w, h) => {g.clearRect(0, 0, w, h); g.font = '600 70px "Inter Tight"'; g.fillStyle = CY; g.shadowColor = CY; g.shadowBlur = 10; g.textBaseline = 'middle'; g.letterSpacing = '14px';
    g.fillText((BIG + '  ·  ' + BIG + '  ·  ').slice(0, 120), 10, h / 2);});
  const band = add(scene, new THREE.CylinderGeometry(1.42, 1.42, 0.09, 128, 1, true), new THREE.MeshBasicMaterial({map: ringT, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, opacity: 0}), STAGE.x, 0.32, STAGE.z);
  const hud = [label('n = 52 KARTEN', -1.95, 0.5, 0.9, 0.1, CY, 0.25), label('52! ≈ 8,07 × 10⁶⁷', 0.95, 0.62, -0.25, 0.1, VI, -0.3), label('PERMUTATION #4.716.205…', -1.75, 0.18, 2.05, 0.075, CY, 0.4),
    label('SEED 2026-11-27 · RIFFLE 7/7', 0.6, 0.12, 2.25, 0.07, VI, -0.2)];
  const hudLines = [];
  for (const [a, b] of [[V3(-1.2, 0.48, 0.95), V3(-0.55, 0.05, 0.6)], [V3(0.9, 0.6, -0.2), V3(0.35, 0.05, 0.1)]]) {const g = new THREE.BufferGeometry().setFromPoints([a, b]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({color: new THREE.Color(CY).multiplyScalar(1.5), transparent: true, opacity: 0})); scene.add(l); hudLines.push(l);}

  // ---------------------------------------------------------------- hologram board with projector, light columns, star dust, backdrop
  const BY = 2.45, BZ = -3.2, BW = 2.5, BH = 2.75;
  const boardC = document.createElement('canvas'); boardC.width = 1024; boardC.height = 1126; const boardG = boardC.getContext('2d'); const boardT = new THREE.CanvasTexture(boardC); boardT.colorSpace = THREE.SRGBColorSpace;
  const holo = add(scene, new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({map: boardT, transparent: true, depthWrite: true, blending: THREE.AdditiveBlending, opacity: 0.95}), 0, BY, BZ);
  {const fr = tex(1024, 1126, (g, w, h) => {g.clearRect(0, 0, w, h); g.strokeStyle = CY; g.lineWidth = 6; g.shadowColor = CY; g.shadowBlur = 12; const L = 70;
      for (const [x, y, sx, sy] of [[8, 8, 1, 1], [w - 8, 8, -1, 1], [8, h - 8, 1, -1], [w - 8, h - 8, -1, -1]]) {g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke();}
      g.globalAlpha = 0.12; g.fillStyle = CY; for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 1);});
    add(scene, new THREE.PlaneGeometry(BW + 0.16, BH + 0.17), new THREE.MeshBasicMaterial({map: fr, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}), 0, BY, BZ - 0.01);
    label('MÖGLICHE REIHENFOLGEN · 68 STELLEN', -BW / 2, BY + BH / 2 + 0.16, BZ, 0.09, CY);
    const proj = new THREE.Group(); proj.position.set(0, -0.06, BZ); scene.add(proj);
    add(proj, new THREE.CylinderGeometry(0.42, 0.5, 0.16, 64), new THREE.MeshPhysicalMaterial({color: 0x141826, roughness: 0.2, metalness: 0.8, clearcoat: 1}), 0, 0.08, 0, false);
    add(proj, new THREE.CylinderGeometry(0.3, 0.3, 0.012, 64), glow(CY), 0, 0.165, 0);
    const beamT = tex(64, 256, (g, w, h) => {const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(98,230,255,0.9)'); gr.addColorStop(1, 'rgba(98,230,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);});
    add(proj, new THREE.CylinderGeometry(1.25, 0.3, 1.0, 64, 1, true), new THREE.MeshBasicMaterial({map: beamT, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide}), 0, 0.66, 0);}
  {const colT = tex(64, 512, (g, w, h) => {const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.8, 'rgba(0,0,0,0)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, w, h);});
    for (let i = 0; i < 14; i++) {const x = (i - 6.5) * 1.6 + (R() - 0.5) * 0.5, z = -7 - R() * 4; const m = add(scene, new THREE.PlaneGeometry(0.5, 14), new THREE.MeshBasicMaterial({map: colT, color: new THREE.Color(i % 3 ? VI : CY).multiplyScalar(0.5), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}), x, 6.9, z);
      add(scene, new THREE.BoxGeometry(0.5, 0.05, 0.5), glow(i % 3 ? VI : CY), x, -0.04, z);}
    const bd = tex(1024, 1024, (g, w, h) => {const gr = g.createRadialGradient(w / 2, h * 0.65, 0, w / 2, h * 0.65, w * 0.7); gr.addColorStop(0, '#1a1840'); gr.addColorStop(0.5, '#0b0c1e'); gr.addColorStop(1, '#05060c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);});
    add(scene, new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({map: bd}), 0, 8, -14);}
  const stars = (() => {const n = 2600, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) base.push([(R() - 0.5) * 26, R() * 10, -14 + R() * 18, R()]);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const dot = tex(32, 32, (c, w, h) => {const gr = c.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);});
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({size: 0.03, map: dot, color: 0xa9c8ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false})));
    return v => {base.forEach(([x, y, z, s], i) => {p[i * 3] = x + Math.sin(v * 0.2 + i) * 0.05; p[i * 3 + 1] = (y + v * 0.08 * (0.5 + s)) % 10; p[i * 3 + 2] = z;}); g.attributes.position.needsUpdate = true;};})();

  // ---------------------------------------------------------------- light
  scene.add(new THREE.HemisphereLight(0x5060a0, 0x05060c, 0.5));
  const key = new THREE.DirectionalLight(0xbfd8ff, 1.2); key.position.set(-3, 7, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, {left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20});
  key.shadow.bias = -0.0002; key.shadow.normalBias = 0.01; scene.add(key);
  const rimL = new THREE.PointLight(0xff6fb5, 6, 8, 1.5); rimL.position.set(2.5, 1.2, -1.2); scene.add(rimL);
  const rimR = new THREE.PointLight(0x62e6ff, 6, 8, 1.5); rimR.position.set(-2.5, 1.0, 2.2); scene.add(rimR);
  scene.environment = (() => {const s2 = new THREE.Scene(); s2.background = new THREE.Color(0x05060c); const m = new THREE.MeshBasicMaterial({color: new THREE.Color(CY).multiplyScalar(2)}), m2 = new THREE.MeshBasicMaterial({color: new THREE.Color(VI).multiplyScalar(2)});
    for (let i = 0; i < 6; i++) {const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 0.4), i % 2 ? m : m2); b.position.set(Math.cos(i) * 6, 2, Math.sin(i) * 6); s2.add(b);}
    return new THREE.PMREMGenerator(renderer).fromScene(s2, 0.04).texture;})(); scene.environmentIntensity = 0.8;

  // ---------------------------------------------------------------- camera and post
  const CAM = [[0, 0, 0.1, 0.15, 6.0, -8, 13], [2.7, 0, 0.12, 0.15, 5.4, -3, 15], [3.9, 0, 0.12, 0.15, 5.6, 2, 18], [4.9, 0, 0.3, 0.4, 6.6, 6, 34],
    [5.6, 0, 0.0, 0.7, 7.6, 10, 52], [6.8, 0, 0.0, 0.7, 6.9, -6, 57], [8.1, 0, 0.0, 0.7, 6.6, -22, 46], [9.1, 0, BY + 0.1, BZ, 13.8, 0, 7], [11.2, 0, BY + 0.1, BZ, 13.0, -6, 5],
    [12.3, 0, 1.0, -0.9, 15.5, -24, 17], [13.5, 0, 1.0, -0.9, 14.8, -30, 16]];
  const camAt = camPath(cam, CAM);
  const composer = new EffectComposer(renderer); composer.setSize(W, H); composer.addPass(new RenderPass(scene, cam));
  const bokeh = new BokehPass(scene, cam, {focus: 6, aperture: 0.0016, maxblur: 0.006}); composer.addPass(bokeh);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.6, 0.5, 0.72));
  composer.addPass(new OutputPass()); const grade = new ShaderPass(GRADE); grade.uniforms.vig.value = 0.6; grade.uniforms.grain.value = 0.035; grade.uniforms.tint.value.set(0.97, 1.0, 1.06); composer.addPass(grade);
  let lastBoard = -1;
  return {update(v) {poseDeck(cards, v, ORIGIN); thread(v); stars(v); const qv = camAt(v);
      const hf = sm(seg(v, 6.3, 7.0)); band.material.opacity = hf * 0.85; band.rotation.y = v * 0.12; band.material.map.offset.x = -v * 0.01;
      hud.forEach((m, i) => {m.material.opacity = sm(seg(v, 6.6 + i * 0.25, 7.0 + i * 0.25)) * (0.75 + 0.25 * Math.sin(v * 3 + i));}); hudLines.forEach((l, i) => {l.material.opacity = 0.6 * sm(seg(v, 6.7 + i * 0.3, 7.1 + i * 0.3));});
      holo.material.opacity = 0.85 + 0.1 * Math.sin(v * 9) * Math.sin(v * 2.3);
      bokeh.uniforms.focus.value = qv[4] * 0.98; grade.uniforms.t.value = v;
      const fb = Math.round(v * 30); if (fb !== lastBoard) {flapBoard(boardG, 1024, 1126, v, 8.4, {cell: 'rgba(98,230,255,0.07)', cell2: 'rgba(98,230,255,0.05)', digit: '#bff4ff', hinge: 'rgba(98,230,255,0.25)', pin: 'rgba(98,230,255,0.4)', glow: 16}); boardT.needsUpdate = true; lastBoard = fb;}},
    render() {composer.render();}};}
