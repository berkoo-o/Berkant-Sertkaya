// Stiltest Kartenspiel: lädt den Look aus s<n>.js und spielt den gemeinsamen Ablauf (Mischen, Brücke, Umdrehen, Fächer, roter Faden, Zahl).
import {THREE, W, H, FPS, overlays, TEXT} from './core.js';
const S = +(new URLSearchParams(location.search).get('s') || 1);
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true});
renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, W / H, 0.05, 200);
const look = await (await import(`./s${S}.js`)).build({renderer, scene, cam});
const ov = overlays(look.text || TEXT);
window.TOTAL = Math.round(13.5 * FPS);
window.renderFrame = f => {const v = f / FPS; look.update(v); ov(v); look.render(v);};
window.renderFrame(0); window.ready = true;
