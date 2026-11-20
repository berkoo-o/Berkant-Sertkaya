// "Was ändert sich 2027 für dich?" – tear-off calendar on a dark desk, one continuous camera move
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {clamp,lerp,ease,eo,ei,eio,ebk,win,track,applyPose,ctex,grain,rng,RED,REDS,hdr,roundRect,ringPath} from './util.js';
import {buildCalendar,PW,PH,TW,TH,PY,PZ} from './calendar.js';
import * as P from './props.js';

await Promise.all(['400 20px Poppins','500 20px Poppins','600 30px Poppins','700 96px Poppins','800 96px "Inter Tight"','600 40px Caveat','700 40px Caveat'].map(f=>document.fonts.load(f)));
const W=1080,H=1920;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.NoToneMapping;
document.body.insertBefore(renderer.domElement,document.getElementById('vig'));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x07070b);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=0.32;
const cam=new THREE.PerspectiveCamera(26,W/H,0.02,30);
const composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,samples:4}));
composer.addPass(new RenderPass(scene,cam));const bloom=new UnrealBloomPass(new THREE.Vector2(W,H),0.24,0.5,0.96);composer.addPass(bloom);composer.addPass(new OutputPass());

// ------------------------------------------------------------------ room: dark backdrop with violet and red light, desk with a fine grid
{const bd=ctex(1024,768,(g,w,h)=>{g.fillStyle='#07070b';g.fillRect(0,0,w,h);
   let r=g.createRadialGradient(w*0.24,h*0.3,10,w*0.24,h*0.3,w*0.62);r.addColorStop(0,'rgba(104,70,235,0.30)');r.addColorStop(1,'rgba(104,70,235,0)');g.fillStyle=r;g.fillRect(0,0,w,h);
   r=g.createRadialGradient(w*0.78,h*0.72,10,w*0.78,h*0.72,w*0.5);r.addColorStop(0,'rgba(224,30,43,0.20)');r.addColorStop(1,'rgba(224,30,43,0)');g.fillStyle=r;g.fillRect(0,0,w,h);grain(g,w,h,5,2);});
 const b=new THREE.Mesh(new THREE.PlaneGeometry(10,7.5),new THREE.MeshBasicMaterial({map:bd.tex}));b.position.set(0,1.6,-3.2);scene.add(b);
 const gr=ctex(2048,2048,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);const step=w/96;g.strokeStyle='rgba(255,255,255,1)';g.lineWidth=1.4;for(let i=0;i<=96;i++){g.globalAlpha=i%4===0?0.9:0.45;g.beginPath();g.moveTo(i*step,0);g.lineTo(i*step,h);g.stroke();g.beginPath();g.moveTo(0,i*step);g.lineTo(w,i*step);g.stroke();}
   g.globalAlpha=1;g.globalCompositeOperation='destination-in';const f=g.createRadialGradient(w/2,h/2,w*0.04,w/2,h/2,w*0.48);f.addColorStop(0,'rgba(0,0,0,1)');f.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=f;g.fillRect(0,0,w,h);});
 const desk=new THREE.Mesh(new THREE.PlaneGeometry(4.8,4.8),new THREE.MeshStandardMaterial({color:0x060608,roughness:0.62,metalness:0.0,emissive:0xffffff,emissiveMap:gr.tex,emissiveIntensity:0.022}));
 desk.rotation.x=-Math.PI/2;desk.position.z=0.2;desk.receiveShadow=true;scene.add(desk);
 const gl=ctex(256,256,(g,w,h)=>{const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(224,30,43,0.55)');r.addColorStop(0.5,'rgba(224,30,43,0.16)');r.addColorStop(1,'rgba(224,30,43,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.7),new THREE.MeshBasicMaterial({map:gl.tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.3}));glow.rotation.x=-Math.PI/2;glow.position.set(0,0.0012,0.02);scene.add(glow);}
// ------------------------------------------------------------------ lights: cool key from the right, violet and red rims, a warm focus spot that follows the action
scene.add(new THREE.HemisphereLight(0x9aa6c8,0x08080c,0.24));
const key=new THREE.SpotLight(0xe3ecff,21,0,0.5,0.85,2);key.position.set(1.35,1.9,1.55);key.target.position.set(0,0.14,0.12);scene.add(key);scene.add(key.target);
key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.near=1.2;key.shadow.camera.far=4.5;key.shadow.bias=-0.00025;key.shadow.normalBias=0.012;key.shadow.radius=4;
const warm=new THREE.DirectionalLight(0xffe2c6,0.32);warm.position.set(-2,1.4,1.6);scene.add(warm);
const rimV=new THREE.PointLight(0x7a5cff,1.3,0,2);rimV.position.set(-0.85,0.75,-0.55);scene.add(rimV);
const rimR=new THREE.PointLight(0xff2a3a,0.55,0,2);rimR.position.set(0.75,0.28,-0.45);scene.add(rimR);
const focus=new THREE.SpotLight(0xfff1e2,0,0,0.42,0.9,2);scene.add(focus);scene.add(focus.target);

// ------------------------------------------------------------------ calendar and its pages (voice time)
const cal=buildCalendar(scene);
const TEAR={cover:6.72,jan1:41.7,flip:[48.22,48.38,48.53,48.67,48.8,48.92],jul1:63.22,jul10:73.45};
cal.setTear(0,TEAR.cover,0.85);cal.setTear(1,TEAR.jan1,0.85);TEAR.flip.forEach((t,i)=>cal.setTear(2+i,t,0.62));cal.setTear(8,TEAR.jul1,0.8);cal.setTear(9,1e9,0.36); // the July page stays: the outro happens over the overview
const RING={jan1:[7.95,8.75],jan19:[46.3,47.1],jul1:[49.55,50.2],jul10:[63.7,64.45]};
const R1=cal.addRing(1,...RING.jan1,5),R2=cal.addRing(2,...RING.jan19,8),R3=cal.addRing(8,...RING.jul1,12),R4=cal.addRing(9,...RING.jul10,4);
// sticky note "geplant" on the 1st of January page, slapped on at "Geplant"
const NOTE={t:26.85,x:262,y:1000,s:330,rot:-0.07,w0:27.15,w1:28.0,u0:28.05,u1:28.35};
cal.pages[1].draws.push({key:t=>t<NOTE.t?null:[clamp((t-NOTE.t)/0.25,0,1),clamp((t-NOTE.w0)/(NOTE.w1-NOTE.w0),0,1),clamp((t-NOTE.u0)/(NOTE.u1-NOTE.u0),0,1)].map(v=>v.toFixed(3)).join(),
  draw:(g,t)=>{const a=eo((t-NOTE.t)/0.25);const sc=lerp(1.25,1,a);g.save();g.translate(NOTE.x,NOTE.y);g.rotate(NOTE.rot+(1-a)*0.08);g.scale(sc,sc);g.globalAlpha=clamp(a*2,0,1);
    g.shadowColor='rgba(0,0,0,0.35)';g.shadowBlur=lerp(40,18,a);g.shadowOffsetY=lerp(26,9,a);g.fillStyle='#f1e49b';g.fillRect(-NOTE.s/2,-NOTE.s/2,NOTE.s,NOTE.s);g.shadowColor='transparent';
    g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(-NOTE.s/2,-NOTE.s/2,NOTE.s,40);g.fillStyle='rgba(120,100,30,0.08)';g.fillRect(-NOTE.s/2,NOTE.s/2-60,NOTE.s,60);
    const wr=clamp((t-NOTE.w0)/(NOTE.w1-NOTE.w0),0,1);if(wr>0){g.save();g.beginPath();g.rect(-NOTE.s/2,-NOTE.s/2,NOTE.s*(0.1+0.82*wr),NOTE.s);g.clip();g.fillStyle='rgba(58,62,72,0.95)';g.font='700 98px Caveat';g.textAlign='center';g.fillText('geplant',0,6);g.restore();}
    const ul=clamp((t-NOTE.u0)/(NOTE.u1-NOTE.u0),0,1);if(ul>0){g.strokeStyle='rgba(58,62,72,0.9)';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(-120,38);g.quadraticCurveTo(0,30,-120+240*ul,44-8*ul);g.stroke();}
    g.restore();}});
function notePt(tx,ty){const c=Math.cos(NOTE.rot),s=Math.sin(NOTE.rot);return [NOTE.x+tx*c-ty*s,NOTE.y+tx*s+ty*c];}

// ------------------------------------------------------------------ objects
const cash=P.mkCash(scene),slip=P.mkSlip(scene),ticket=P.mkTicket(scene),binder=P.mkBinder(scene),depot=P.mkDepot(scene),piggy=P.mkPiggy(scene),kg=P.mkLetterKG(scene),bars=P.mkBars(scene);
const lic=P.mkLicense(scene),stack=P.mkCoinStack(scene),env=P.mkEnvelope(scene),shop=P.mkShop(scene),ma=P.mkMeeple(scene,'#d8bb8c','#8f6b40',11),mb=P.mkMeeple(scene,'#9e6c47','#50331f',12),marker=P.mkMarker(scene),pencil=P.mkPencil(scene);
const EM=[0,0.2,0.07],HERO=[0,0.0,0.33];
// cash above the counter: tilted to the camera, lowest corner 4 mm above the counter top (0.081 * 1.3)
const CASH_YC=0.081*1.3+0.0478*Math.sin(0.6)*1.3+0.004;
// private hand-over: figures A/B (scale ms), the bundle (scale cs) lands next to A's right foot and slides to just before B's left foot
const HAND=(()=>{const ms=1.2,cs=0.85,xa=-0.19,xbm=0.19,fe=0.047*ms;const h={ms,cs,xa,xbm,z:0.33,da:67.92,db:68.08,fall:0.3,ytop:0.85,hop:69.58,la:69.95,lb:70.02,lift:0.45,
  xb0:xa+fe*Math.cos(0.18)+0.017*ms*Math.sin(0.18)+0.002+0.075*cs,xb1:xbm-fe-0.012-0.075*cs,s0:69.0,s1:69.55};
  const T=track([[68.86,{p:[0,0,0]}],[69.0,{p:[0.26,0,0]}],[69.17,{p:[0,0,0],e:'in'}],[69.27,{p:[-0.045,0,0],e:'out'}],[69.37,{p:[0,0,0],e:'in'}],[69.44,{p:[0.014,0,0],e:'out'}],[69.5,{p:[0,0,0],e:'in'}]]);
  h.tip=t=>t<68.86||t>69.5?0:T(t).p[0];return h;})();
const HP=(dx=0,dy=0,dz=0)=>[HERO[0]+dx,HERO[1]+dy,HERO[2]+dz];
// park spots on the desk for the final overview (two columns left and right of the calendar, three rows)
// parking spots just outside the frame (left column 1-5, right column 6-10); for the overview they glide into a closer formation
const PX=0.48,FX=0.3,FZ=[0.0,0.15,0.3,0.45,0.6];const lay=(o,x,z,y=0)=>({p:[x,y+(o.p?o.p[1]:0),z],r:o.r,s:o.s});
const LIE=[-Math.PI/2,0,0];const BASE={slip:{p:[0,0.0025],r:[-Math.PI/2,0,0.12],s:0.9},ticket:{p:[0,0.0012],r:[-Math.PI/2,0,-0.1],s:1},depot:{p:[0,0],r:[0,0.35,0],s:0.95},piggy:{p:[0,0],r:[0,0.6,0],s:0.95},
  kg:{p:[0,0.002],r:[-Math.PI/2,0,0.1],s:0.9},bars:{p:[0,0],r:[0,-0.25,0],s:0.95},lic:{p:[0,0.0012],r:[-Math.PI/2,0,-0.08],s:1},stack:{p:[0,0],r:[0,0,0],s:1},env:{p:[0,0.0025],r:[-Math.PI/2,0,0.06],s:0.95},cash:{p:[0,0],r:[0,-0.3,0],s:1}};
const COL={slip:[-1,0],ticket:[-1,1],depot:[-1,2],piggy:[-1,3],kg:[-1,4],bars:[1,0],lic:[1,1],stack:[1,2],env:[1,3],cash:[1,4]};
const mkSpot=(k,x)=>{const b=BASE[k],c=COL[k];return {p:[c[0]*x,b.p[1],FZ[c[1]]],r:b.r,s:b.s};};
const PARK={},FORM={};for(const k in BASE)PARK[k]=mkSpot(k,PX);PARK.binder={p:[-0.62,0,-0.25],r:[0,0.3,0],s:0.75};
const LEAN=1.0,CL=Math.cos(LEAN);
// tilt back first, then turn around the vertical (flip: show the back side), as XYZ angles close to the naive ones so the tracks interpolate smoothly
function leanR(ry,flip=0){const Q=(x,y,z)=>new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z));const q=Q(0,ry,0).multiply(Q(-LEAN,0,0));if(flip)q.multiply(Q(0,Math.PI,0));
  const e=new THREE.Euler().setFromQuaternion(q,'XYZ'),ref=[-LEAN,ry+(flip?Math.PI:0),0],W=(a,r)=>a+2*Math.PI*Math.round((r-a)/(2*Math.PI));
  const c=[[e.x,e.y,e.z],[e.x+Math.PI,Math.PI-e.y,e.z+Math.PI]].map(v=>v.map((a,i)=>W(a,ref[i])));const d=v=>v.reduce((s,a,i)=>s+(a-ref[i])**2,0);return d(c[0])<=d(c[1])?c[0]:c[1];}
const lean=(h,sc,x,z,ry)=>({p:[x,h*sc/2*CL,z],r:leanR(ry),s:sc});
Object.assign(FORM,{slip:lean(0.215,0.85,-0.33,0.3,0.25),ticket:lean(0.086,1.1,-0.165,0.3,0.12),depot:{p:[0,0,0.3],r:[0,0.3,0],s:0.95},piggy:{p:[0.165,0,0.3],r:[0,-0.5,0],s:0.95},kg:lean(0.19,0.85,0.33,0.3,-0.25),
  bars:{p:[-0.295,0,0.58],r:[0,0.3,0],s:1.0},lic:lean(0.086,1.1,-0.148,0.58,0.12),stack:{p:[0,0,0.58],r:[0,0,0],s:1.15},env:lean(0.115,0.9,0.148,0.58,-0.12),cash:{p:[0.295,0,0.58],r:[0,-0.35,0],s:0.9}});
const pk=(o,t,e='io')=>[t,{p:o.p,r:o.r,s:o.s,e}];
// one track per object: emerge from the page, present in front of the calendar, then park
function hero(tIn,tOut,tPark,park,rot,opt={}){const hp=opt.hp||HP(),s=opt.s||1.45;const parkKey=opt.lay?[tPark,{p:park.p,r:park.r,s:park.s,e:'out',ep:'io'}]:pk(park,tPark);
  return track([[tIn-0.01,{p:EM,r:[0,0,0],s:0}],[tIn,{p:EM,r:[0.6,0,0],s:0.12}],[tIn+0.62,{p:hp,r:rot,s,e:'back',k:1.2,ep:opt.ep}],
  [tOut,{p:[hp[0]+(opt.drift||0.006),hp[1]+0.004,hp[2]],r:[rot[0],rot[1]+(opt.spin||0.12),rot[2]],s}],parkKey,pk(park,69.95+(opt.k||0)*0.05),[70.75+(opt.k||0)*0.05,{p:opt.form.p,r:opt.form.r,s:opt.form.s,e:'io',ep:'out'}],pk(opt.form,73.35),[76.5,{p:park.p,r:park.r,s:park.s,e:'out',ep:'io'}]]);}
const TR={
  cash:track([[0,{p:HP(0,0.066,0),r:[0.95,-0.32,0.05],s:1.3}],[2.6,{p:HP(0.004,0.07,0),r:[0.92,-0.2,0.04],s:1.3}],[3.6,{p:[0.6,0.0,0.15],r:[0,-0.3,0],s:1,e:'out',ep:'io'}],[61.35,{p:[0.6,0.0,0.15],r:[0,-0.3,0],s:1}],
    [62.1,{p:HP(0,0.066,0),r:[0.9,-0.28,0.04],s:1.3,e:'io',ep:'out'}],[64.2,{p:HP(0,0.068,0),r:[0.9,-0.2,0.04],s:1.3}],[64.6,{p:HP(0,CASH_YC,0.01),r:[0.6,-0.1,0],s:1.3}],[67.45,{p:HP(0,CASH_YC,0.01),r:[0.6,-0.05,0],s:1.3}],
    [68.0,{p:[HAND.xb0,0,HAND.z],r:[0,0.06,0],s:HAND.cs}],[HAND.s0,{p:[HAND.xb0,0,HAND.z],r:[0,0.06,0],s:HAND.cs}],[HAND.s1,{p:[HAND.xb1,0,HAND.z],r:[0,-0.03,0],s:HAND.cs,e:'o2'}],
    [69.95,{p:[HAND.xb1,0,HAND.z],r:[0,-0.03,0],s:HAND.cs}],pk(FORM.cash,70.95),pk(FORM.cash,73.35),pk(PARK.cash,76.5)]),
  slip:hero(8.5,14.85,15.6,PARK.slip,[-0.3,0.2,-0.03],{hp:HP(0,0.118,0.02),s:1.0,form:FORM.slip,k:0,ep:'out',lay:1}),
  ticket:hero(14.95,19.3,20.0,PARK.ticket,[-0.3,-0.22,0.04],{hp:HP(0,0.075,0),s:1.35,form:FORM.ticket,k:1}),
  binder:track([[19.33,{p:EM,r:[0,0,0],s:0}],[19.34,{p:EM,r:[0,0,0],s:0.12}],[19.95,{p:HP(-0.04,0,-0.05),r:[0,0.5,0],s:0.8,e:'back',k:1.1,ep:'out'}],[21.4,{p:HP(-0.04,0,-0.05),r:[0,0.56,0],s:0.8}],pk(PARK.binder,22.6)]),
  depot:hero(21.8,26.65,27.4,PARK.depot,[0.1,-0.45,0],{hp:HP(0.02,0.0155,0),s:1.4,spin:0.3,form:FORM.depot,k:2,ep:'out'}),
  piggy:hero(30.72,36.0,36.7,PARK.piggy,[0.08,-0.75,0],{hp:HP(0,0.006,0),s:1.25,spin:0.35,form:FORM.piggy,k:3}),
  kg:hero(36.05,38.62,39.3,PARK.kg,[-0.28,0.18,-0.02],{hp:HP(0,0.114,0.02),s:1.05,form:FORM.kg,k:4,ep:'out',lay:1}),
  bars:hero(38.66,41.62,42.3,PARK.bars,[0,-0.3,0],{hp:HP(0,0.0005,0.01),s:1.75,spin:0.2,form:FORM.bars,k:5,ep:'out'}),
  lic:(()=>{const LP={p:PARK.lic.p,r:[PARK.lic.r[0],PARK.lic.r[1]+Math.PI,PARK.lic.r[2]],s:1},LF={p:FORM.lic.p,r:leanR(0.12,1),s:FORM.lic.s};
    return track([[41.99,{p:[0.5,0.27,0.66],r:[-0.7,-1.5,0.7],s:0}],[42.0,{p:[0.5,0.27,0.66],r:[-0.7,-1.5,0.7],s:1.35}],[42.9,{p:[-0.045,0.0675,0.56],r:[-0.24,0.34,-0.04],s:1.35,e:'out'}],
      [45.35,{p:[-0.042,0.0705,0.56],r:[-0.23,0.4,-0.03],s:1.35}],[46.15,{p:[-0.05,0.0675,0.46],r:[-0.27,0.3,-0.05],s:1.3}],[47.15,{p:[-0.046,0.0685,0.46],r:[-0.27,0.32,-0.05],s:1.3}],
      [47.95,{p:[0.02,0.062,0.52],r:[-0.25,Math.PI+0.04,0.03],s:1.38,e:'io'}],[48.5,{p:[0.025,0.064,0.52],r:[-0.25,Math.PI+0.08,0.03],s:1.38}],[49.3,{p:LP.p,r:LP.r,s:1,e:'out',ep:'io'}],
      [70.25,{p:LP.p,r:LP.r,s:1}],[71.05,{p:LF.p,r:LF.r,s:LF.s,e:'io',ep:'out'}],[73.35,{p:LF.p,r:LF.r,s:LF.s}],[76.5,{p:LP.p,r:LP.r,s:1,e:'out',ep:'io'}]]);})(),
  stack:hero(49.3,52.78,53.4,PARK.stack,[0.1,0,0],{hp:HP(0,0.006,0.01),s:1.75,spin:0.4,form:FORM.stack,k:7,ep:'out'}),
  env:hero(52.85,61.3,62.0,PARK.env,[-0.2,-0.16,0.02],{hp:HP(0,0.09,0),s:1.25,drift:0.003,spin:0.05,form:FORM.env,k:8}),
};
const SHOP=track([[64.45,{p:[-0.7,0,0.34],r:[0,0.3,0],s:1.3}],[65.0,{p:[0,0,0.34],r:[0,0,0],s:1.3,e:'out'}],[67.25,{p:[0,0,0.34],r:[0,0,0],s:1.3}],[67.75,{p:[0.72,0,0.3],r:[0,-0.3,0],s:1.3,e:'in'}]]);
// private hand-over (v3): two wooden board-game figures are put down on the desk, A tips over to B and flicks the bundle across, friction stops it, B hops; then both are lifted away
function meepleAnim(t){[[ma,HAND.xa,HAND.da,HAND.la],[mb,HAND.xbm,HAND.db,HAND.lb]].forEach(([m,x,t0,tl],i)=>{const G=m.G,B=m.B;
    if(t<t0||t>tl+HAND.lift){G.visible=false;return;}G.visible=true;G.scale.setScalar(HAND.ms);G.rotation.set(0,i?-0.18:0.18,0);
    let y=0,rx=0,rz=0;const u=(t-t0)/HAND.fall;if(u<1)y=HAND.ytop*(1-u*u);else{const d=t-t0-HAND.fall;y=0.005*Math.abs(Math.sin(d*17))*Math.exp(-d*13);rx=0.09*Math.exp(-d*7)*Math.sin(d*21);}
    if(i===0)rz=-HAND.tip(t);else{const v=(t-HAND.hop)/0.24;if(v>0&&v<1)y+=0.024*Math.sin(Math.PI*v);const d=t-HAND.hop-0.24;if(d>0)rx+=0.045*Math.exp(-d*8)*Math.sin(d*22);}
    const w=(t-tl)/HAND.lift;if(w>0)y+=1.25*w*w;
    // rock on the foot edges: front/back edge for rx, right/left foot for rz, so the figure never sinks into the desk
    const pz=rx>0?m.hz:-m.hz,px=rz<0?m.hx:-m.hx;B.rotation.set(rx,0,rz);B.position.set(px-px*Math.cos(rz),-px*Math.sin(rz)+pz*Math.sin(rx),pz-pz*Math.cos(rx));G.position.set(x,y,HAND.z);});}
// red marker strokes on the cash bundle (local coordinates on its top face)
function mkStroke(parent,pts,width,y){const N=pts.length-1;const pos=[];for(let i=0;i<=N;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(N,i+1)];const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;const nx=-dz/l,nz=dx/l;const w=width*(0.85+0.3*Math.sin(i*1.7));
  pos.push(pts[i][0]+nx*w/2,y,pts[i][1]+nz*w/2,pts[i][0]-nx*w/2,y,pts[i][1]-nz*w/2);}const idx=[];for(let i=0;i<N;i++){const a=2*i;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:RED,roughness:0.6,emissive:new THREE.Color(RED),emissiveIntensity:0.25,transparent:true,opacity:0.94,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
  parent.add(m);return {m,N,pts,y,set(u){g.setDrawRange(0,6*Math.round(N*clamp(u,0,1)));m.visible=u>0.001;},tip(u){const k=clamp(u,0,1)*N,i=Math.min(N-1,Math.floor(k)),f=k-i;return [lerp(pts[i][0],pts[i+1][0],f),y,lerp(pts[i][1],pts[i+1][1],f)];}};}
const line=(a,b,n=24,wob=0.0015,seed=1)=>{const r=rng(seed);return Array.from({length:n+1},(_,i)=>{const u=i/n;return [lerp(a[0],b[0],u)+(r()-0.5)*wob,lerp(a[1],b[1],u)+Math.sin(u*3.1)*0.003];});};
const TOPY=cash.H+0.0016;
const S0=mkStroke(cash.G,line([-0.07,0.024],[0.07,-0.02],28,0.001,3),0.0075,TOPY);
const SX1=mkStroke(cash.G,line([-0.062,-0.033],[0.062,0.033],22,0.001,5),0.0075,TOPY+0.0003),SX2=mkStroke(cash.G,line([-0.062,0.033],[0.062,-0.033],22,0.001,7),0.0075,TOPY+0.0006);
const STROKES={s0:[1.55,2.3],x1:[65.85,66.16],x2:[66.24,66.55]};

// ------------------------------------------------------------------ marker and pencil: rest on the desk, travel in an arc, follow the stroke tip
const Y=new THREE.Vector3(0,1,0),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_n=new THREE.Vector3();
const PAGE_N=new THREE.Vector3(0,Math.sin(0.16),Math.cos(0.16));
function toolQ(n,side=1){_v.copy(n).multiplyScalar(0.62).add(new THREE.Vector3(0.42*side,0.42,0.12)).normalize();return new THREE.Quaternion().setFromUnitVectors(Y,_v);}
const REST={marker:{p:new THREE.Vector3(0.40,0.0095,0.2),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0.5,-Math.PI/2+0.0))},pencil:{p:new THREE.Vector3(-0.40,0.006,0.2),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-0.4,Math.PI/2))}};
// actions: [tTravelIn, tDraw0, tDraw1, tOut, tipFn(u)->{p,n}]
const pagePt=(px,py)=>cal.pagePoint(px,py,0.0005);
function ringTip(Rp){return u=>{const i=Math.min(Rp.length-1,Math.floor(clamp(u,0,1)*(Rp.length-1)));return {p:pagePt(Rp[i][0],Rp[i][1]),n:PAGE_N};};}
const _w=new THREE.Vector3();function objTip(obj,localFn,nLocal){return u=>{obj.updateMatrixWorld();const l=localFn(u);_w.set(l[0],l[1],l[2]).applyMatrix4(obj.matrixWorld);const n=new THREE.Vector3(...nLocal).transformDirection(obj.matrixWorld);return {p:_w.clone(),n};};}
const strokeTip=(S)=>objTip(cash.G,u=>S.tip(u),[0,1,0]);
const MARK=[[0.85,STROKES.s0[0],STROKES.s0[1],2.85,strokeTip(S0)],[7.45,...RING.jan1,9.25,ringTip(R1)],[45.85,...RING.jan19,47.65,ringTip(R2)],[49.12,...RING.jul1,50.75,ringTip(R3)],
  [63.3,...RING.jul10,65.1,ringTip(R4)],[65.1,STROKES.x1[0],STROKES.x2[1],67.15,u=>u<0.5?strokeTip(SX1)(u*2):strokeTip(SX2)((u-0.5)*2)]];
// outro: the marker writes the logo; the tip path is set up further down
// outro v7 (Wunsch des Nutzers 20.11.2026: „mach was anderes“, gewählt: „10 Kreise werden zum Punkt“, 1,5 Sekunden)
const OUT={t0:73.45,end:74.95};
function noteTip(u){const x=-NOTE.s/2+NOTE.s*(0.1+0.82*u)-NOTE.s/2*0.0,y=6-26+16*Math.sin(u*Math.PI*14);const q=notePt(x+NOTE.s*0.0,y);return {p:pagePt(q[0],q[1]),n:PAGE_N};}
const kgTip=(px,py)=>objTip(kg.G,()=>[(px/kg.tw-0.5)*0.15,(0.5-py/kg.th)*0.19,0.004],[0,0,1]);
const PENC=[[26.72,NOTE.w0,NOTE.u1,28.9,u=>{if(u<0.74)return noteTip(u/0.74);const v=(u-0.74)/0.26;const q=notePt(-120+240*v,40-6*v);return {p:pagePt(q[0],q[1]),n:PAGE_N};}],
  [36.6,37.0,38.3,38.95,u=>{if(u<0.2){const v=u/0.2;return kgTip(30+270*v,352-8*v)(0);}if(u<0.62){const v=(u-0.2)/0.42;return kgTip(326+v*270,350+14*Math.sin(v*Math.PI*10))(0);}const v=(u-0.62)/0.38;const a=-2.4+v*6.8;return kgTip(460+Math.cos(a)*165,352+Math.sin(a)*92)(0);}]];
function toolPose(tool,acts,t,rest,side){let best=null;for(const a of acts){if(t>=a[0]&&t<=a[3]){best=a;break;}}
  if(!best){tool.G.position.copy(rest.p);tool.G.quaternion.copy(rest.q);return false;}
  const [ti,d0,d1,to,fn]=best;let tip,q;
  if(t<d0){const u=eio((t-ti)/(d0-ti));const s=fn(0);const qd=toolQ(s.n,side);const hov=s.p.clone().addScaledVector(s.n,0.012*(1-ease((t-d0+0.12)/0.12)));
    const p=rest.p.clone().lerp(hov,u);p.y+=0.07*Math.sin(u*Math.PI);tool.G.position.copy(p);tool.G.quaternion.copy(rest.q).slerp(qd,ease(u*1.3));return true;}
  if(t<=d1){const u=(t-d0)/(d1-d0);const s=fn(u);tool.G.position.copy(s.p).addScaledVector(s.n,0.0004);tool.G.quaternion.copy(toolQ(s.n,side));return true;}
  const u=eio((t-d1)/(to-d1));const s=fn(1);const p=s.p.clone().addScaledVector(s.n,0.01*u).lerp(rest.p,u);p.y+=0.06*Math.sin(u*Math.PI);tool.G.position.copy(p);tool.G.quaternion.copy(toolQ(s.n,side)).slerp(rest.q,u);return true;}

// ------------------------------------------------------------------ piggy bank: walks in from the left, three coins drop into its slot, it turns and trots off again
const PIG={in0:30.72,in1:32.3,tu0:32.2,tu1:32.8,out0:35.45,wo0:35.7,out1:36.7,x0:-0.37,z:0.33,yaw:-0.72,S:1.25,STR:0.11,coin:[33.98,34.32,34.66],fall:0.55,V:0.48,A:0.12};
function pigX(t){if(t<PIG.in1){const u=clamp((t-PIG.in0)/(PIG.in1-PIG.in0),0,1);return PIG.x0*(1-u)*(1-u);}if(t<PIG.wo0)return 0;const tau=t-PIG.wo0;return -PIG.V*(tau-PIG.A*(1-Math.exp(-tau/PIG.A)));}
function pigPhase(t){const s=t<PIG.wo0?pigX(t)-PIG.x0:-PIG.x0-pigX(t);return 2*Math.PI*s/PIG.STR+Math.PI*clamp((t-PIG.tu0)/(PIG.tu1-PIG.tu0),0,1)+Math.PI*clamp((t-PIG.out0)/(PIG.wo0+0.08-PIG.out0),0,1);}
function pigAmp(t){const dt=0.02,v=Math.abs(pigX(t+dt)-pigX(t-dt))/(2*dt);return Math.max(0.55*clamp(v/0.3,0,1),0.3*Math.max(win(t,PIG.tu0,PIG.tu1,0.12),win(t,PIG.out0,PIG.wo0+0.08,0.1)));}
function pigYaw(t){if(t<PIG.tu0)return 0;if(t<PIG.out0)return lerp(0,PIG.yaw,eio((t-PIG.tu0)/(PIG.tu1-PIG.tu0)))+0.04*Math.sin(t*1.7)*clamp((t-PIG.tu1)/0.4,0,1);return lerp(PIG.yaw,-Math.PI,eio((t-PIG.out0)/(PIG.wo0+0.1-PIG.out0)));}
function piggyAnim(t){const B=piggy.B;
  if(t<PIG.in0||t>PIG.out1){applyPose(piggy.G,TR.piggy(t));B.position.set(0,0,0);B.rotation.set(0,0,0);B.scale.set(1,1,1);piggy.legs.forEach(L=>L.rotation.z=0);piggy.Hd.rotation.set(0,0,0);piggy.tail.rotation.set(0,0,0);piggy.ears.forEach(E=>E.rotation.set(0,0,0));piggy.coins.forEach(c=>c.visible=false);return;}
  const G=piggy.G;G.visible=true;G.scale.setScalar(PIG.S);G.rotation.set(0,pigYaw(t),0);
  let hop=0;{const u=(t-34.95)/0.34;if(u>0&&u<1)hop=0.013*Math.sin(Math.PI*u);}G.position.set(pigX(t),hop,PIG.z);
  const ph=pigPhase(t),amp=pigAmp(t),k=amp/0.55;
  piggy.legs.forEach((L,i)=>{L.rotation.z=amp*Math.sin(ph+(i===0||i===3?0:Math.PI));});
  let dip=0,ear=0;PIG.coin.forEach(tc=>{const d=t-tc;if(d>0&&d<0.8){dip+=-0.0036*Math.exp(-d*7)*Math.cos(d*24);ear+=0.45*Math.exp(-d*9)*Math.sin(d*30);}});
  const still=1-clamp(k*2,0,1);B.position.set(0,0.0026*k*Math.abs(Math.sin(ph)),0);B.rotation.set(0.035*k*Math.sin(ph),0,0.012*k*Math.sin(2*ph));B.scale.set(1-dip*3,1+0.011*still*Math.sin(t*5.2)+dip*9,1-dip*3);
  piggy.Hd.rotation.set(0,0,0.24*win(t,33.3,34.9,0.35)+0.035*k*Math.sin(2*ph+0.6));piggy.ears.forEach((E,i)=>E.rotation.set(ear*(i?1:-1)+0.06*Math.sin(t*3.1+i),0,0));
  piggy.tail.rotation.set(0.55*Math.sin(t*15)*Math.max(win(t,34.0,35.5,0.3),0.35*k),0,0);
  piggy.coins.forEach((c,i)=>{const tc=PIG.coin[i],t0=tc-PIG.fall,r=0.0112;if(t<t0||t>tc+0.06){c.visible=false;return;}c.visible=true;let y,tilt;
    if(t<tc){const u=(t-t0)/PIG.fall;y=lerp(0.40,piggy.SLOT+r,u*u);tilt=0.35*(1-u)*(1-u)*Math.sin(u*9+i*1.7);}else{y=lerp(piggy.SLOT+r,piggy.SLOT-r*1.35,(t-tc)/0.06);tilt=0;}
    c.position.set(0,y,0);c.rotation.set(Math.PI/2+tilt,0,0);});}
// ------------------------------------------------------------------ licence: the old card flies in, its issue date lights up, at "umtauschen" it turns over into the new EU card
function licAnim(t){applyPose(lic.G,TR.lic(t));if(t<41.99||t>49.35)return;
  {const u=(t-42.0)/0.9;if(u>0&&u<1){lic.G.position.y+=0.07*Math.sin(Math.PI*u);lic.G.position.z+=0.03*Math.sin(Math.PI*u);}}
  {const u=(t-47.15)/0.8;if(u>0&&u<1){lic.G.position.y+=0.018*Math.sin(Math.PI*u);lic.G.position.z+=0.045*Math.sin(Math.PI*u);lic.G.rotation.x+=0.12*Math.sin(Math.PI*u);}}
  if(t>42.9&&t<48.5)lic.G.position.y+=0.0018*Math.sin(t*1.9+7);
  lic.hl.material.opacity=win(t,43.25,45.5,0.25);{const u=(t-48.0)/0.55;lic.sweep.offset.x=lerp(-0.6,0.6,clamp(u,0,1));lic.sheen.material.opacity=0.24*win(t,47.98,48.6,0.12);}}
// scene cameras for these two scenes, blended over the main camera so that everything outside them stays exactly as it was
function pigCam(t){const up=ease((t-33.3)/0.5)*(1-ease((t-35.0)/0.6));return [lerp(-0.05,0,ease((t-30.9)/1.4)),lerp(0.095,0.122,up),0.335,Math.log(lerp(1.56,1.44,ease((t-30.8)/2.6))),lerp(13,9,ease((t-30.8)/4.5)),lerp(10,12.5,up)];}
function licCamA(t){const u=ease((t-42.3)/3.0);return [lerp(-0.05,-0.04,u),0.13,0.36,Math.log(lerp(1.78,1.66,u)),lerp(-14,-9,u),lerp(8,9.5,u)];}
function licCamB(t){const u=ease((t-47.0)/1.0);return [0.015,lerp(0.14,0.13,u),0.33,Math.log(lerp(2.0,1.86,u)),lerp(-3,-6,u),10.5];}
const SCAM=[{a:30.55,ai:0.7,b:35.5,bo:0.8,f:pigCam},{a:42.3,ai:0.7,b:45.3,bo:0.8,f:licCamA},{a:47.0,ai:0.5,b:47.9,bo:0.45,f:licCamB}];
function blendCam(v,t){for(const s of SCAM){const w=ease((t-s.a)/s.ai)*(1-ease((t-s.b)/s.bo));if(w>0){const c=s.f(t);v=v.map((x,j)=>lerp(x,c[j],w));}}return v;}
// ------------------------------------------------------------------ camera: monotone cubic through keyframes (voice time)
const C=(tx,ty,tz,d,az,el)=>[tx,ty,tz,Math.log(d),az,el];
const KEYS=[
 [0.0,C(0,0.142,0.2,2.732,-6,12)],[2.4,C(0,0.142,0.2,2.571,-3,12)],[4.4,C(0,0.196,0.1,2.36,5,13.5)],[6.5,C(0,0.202,0.1,2.303,2,10)],
 [8.1,C(0,0.182,0.12,2.464,3,11)],[9.7,C(0,0.152,0.24,2.447,-4,13)],[12.6,C(0,0.147,0.25,2.313,-6,14)],
 [15.4,C(0,0.152,0.24,2.447,3,13)],[18.6,C(0,0.152,0.25,2.336,1,13)],[19.9,C(-0.02,0.152,0.22,2.559,-3,13)],[22.4,C(0,0.142,0.25,2.447,4,14)],[25.8,C(0,0.142,0.26,2.336,6,14)],
 [27.4,C(-0.03,0.162,0.14,2.250,-5,11)],[29.6,C(-0.03,0.162,0.14,2.196,-4,11)],[31.4,C(0,0.142,0.26,2.392,4,14)],[35.6,C(0,0.142,0.26,2.280,6,14)],
 [36.7,C(0,0.152,0.26,2.225,-3,14)],[38.3,C(0,0.152,0.26,2.169,-4,14)],[39.3,C(0,0.142,0.26,2.392,3,14)],[41.3,C(0,0.142,0.26,2.336,4,14)],
 [42.2,C(0,0.182,0.12,2.571,0,11)],[43.2,C(0,0.152,0.24,2.447,-4,13)],[45.7,C(0,0.172,0.2,2.447,-2,12)],[46.6,C(0,0.182,0.12,2.464,0,11)],
 [48.4,C(0,0.192,0.1,2.732,2,11)],[49.8,C(0,0.182,0.12,2.571,0,11)],[50.9,C(0,0.142,0.26,2.392,5,14)],[52.4,C(0,0.142,0.26,2.313,6,14)],
 [53.6,C(0,0.152,0.26,2.392,-3,13)],[56.6,C(0,0.162,0.28,2.169,-2,12)],[60.6,C(0,0.162,0.28,2.114,-1,12)],
 [62.2,C(0,0.152,0.24,2.559,0,13)],[63.9,C(0,0.182,0.12,2.571,0,11)],[65.3,C(0,0.132,0.3,2.392,4,16)],[67.6,C(0,0.132,0.3,2.313,3,16)],[68.8,C(0,0.1,0.33,2.6,0,13)],
 [70.6,C(0,0.1,0.36,3.32,0,30)],[73.1,C(0,0.1,0.36,3.2,2,29)],[75.0,C(0,0.1,0.36,3.1,2,29)]];
const KT=KEYS.map(k=>k[0]),KV=KEYS.map(k=>k[1]);
const KM=[0,1,2,3,4,5].map(j=>{const n=KT.length,d=[],tg=new Array(n).fill(0);for(let i=0;i<n-1;i++)d.push((KV[i+1][j]-KV[i][j])/(KT[i+1]-KT[i]));
  for(let i=1;i<n-1;i++){if(d[i-1]*d[i]<=0)continue;const h0=KT[i]-KT[i-1],h1=KT[i+1]-KT[i],w1=2*h1+h0,w2=h1+2*h0;tg[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}return tg;});
function camAt(t){let i=0;while(i<KT.length-2&&t>KT[i+1])i++;const h=KT[i+1]-KT[i],u=clamp((t-KT[i])/h,0,1),u2=u*u,u3=u2*u;const a=2*u3-3*u2+1,b=u3-2*u2+u,c=-2*u3+3*u2,e=u3-u2;
  return [0,1,2,3,4,5].map(j=>a*KV[i][j]+b*h*KM[j][i]+c*KV[i+1][j]+e*h*KM[j][i+1]);}
const CAMT=[0,0,0];
function setCam(t){const v=blendCam(camAt(t),t);const d=Math.exp(v[3]);const az=(v[4]+0.3*Math.sin(t*0.23)+0.18*Math.sin(t*0.51+1.3))*Math.PI/180,el=(v[5]+0.15*Math.sin(t*0.31+0.7))*Math.PI/180;
  CAMT[0]=v[0];CAMT[1]=v[1];CAMT[2]=v[2];cam.position.set(v[0]+d*Math.sin(az)*Math.cos(el),v[1]+d*Math.sin(el),v[2]+d*Math.cos(az)*Math.cos(el));cam.lookAt(v[0],v[1],v[2]);
  if(window.DBG){const [x,y,z,dd,a2,e2]=window.DBG;const A=a2*Math.PI/180,E=e2*Math.PI/180;cam.position.set(x+dd*Math.sin(A)*Math.cos(E),y+dd*Math.sin(E),z+dd*Math.cos(A)*Math.cos(E));cam.lookAt(x,y,z);}
  cam.updateProjectionMatrix();cam.updateMatrixWorld();}
const V=new THREE.Vector3();const proj=p=>{V.set(p[0],p[1],p[2]).project(cam);return [(V.x+1)/2*W,(1-V.y)/2*H];};

// ------------------------------------------------------------------ overlay text (voice time)
const SUBS=[[0.15,2.45,'Ab Juli darfst du nicht mehr alles bar bezahlen.'],[2.95,4.85,'Und das ist nur eine von zehn Sachen,'],[4.85,7.55,'die sich 2027 für dich ändern.'],
 [7.62,9.47,'Am 1. Januar steigt der Mindestlohn'],[9.47,11.22,'auf 14,60 Euro,'],[11.25,12.64,'und im Minijob darfst du dann'],[12.64,14.82,'633 Euro verdienen.'],
 [14.9,16.78,'Das Deutschlandticket wird wieder teurer'],[16.78,19.3,'und kostet 66,80 Euro.'],[19.32,21.7,'Riester gibt es für neue Verträge nicht mehr.'],
 [21.75,23.72,'Dafür kommt das Altersvorsorgedepot'],[23.72,26.65,'mit bis zu 540 Euro Zuschuss im Jahr.'],[26.7,28.6,'Geplant, aber noch nicht endgültig'],[28.6,30.2,'beschlossen sind drei Dinge:'],
 [30.65,32.45,'Mit der Frühstart-Rente soll der Staat'],[32.45,33.5,'für Kinder ab sechs'],[33.5,35.9,'10 Euro im Monat in ein Depot zahlen.'],[36.1,38.6,'Das Kindergeld soll um 8 Euro steigen.'],
 [38.65,39.86,'Und wer keine Kinder hat,'],[39.86,41.62,'soll mehr für die Pflege zahlen.'],[41.78,43.0,'Wer einen Kartenführerschein'],[43.0,45.62,'von 2002 bis 2004 hat,'],[45.62,48.2,'muss ihn bis zum 19. Januar umtauschen.'],
 [48.25,49.95,'Im Juli steigen die Renten,'],[49.95,52.75,'nach aktueller Prognose um rund 4 Prozent.'],[52.8,54.36,'Ab Juli müssen junge Männer'],[54.36,56.68,'ab Jahrgang 2008 zur Musterung,'],
 [56.68,59.0,'zum ersten Mal seit 2011.'],[59.0,61.2,'Der Wehrdienst selbst bleibt freiwillig.'],[61.55,62.75,'Und das mit dem Bargeld?'],[63.15,65.5,'Ab dem 10. Juli darfst du bei Händlern'],
 [65.5,67.88,'nichts mehr über 10.000 Euro bar bezahlen.'],[67.95,69.95,'Unter Privatleuten bleibt es erlaubt.'],[70.2,71.85,'Was davon trifft dich am meisten?'],[71.95,73.4,'Schreib’s in die Kommentare.']];
const NUMS=[[9.72,12.6,'14,60 €','Mindestlohn pro Stunde (bisher 13,90 €)'],[12.64,14.88,'633 €','Minijob-Grenze im Monat (bisher 603 €)'],[17.3,19.3,'66,80 €','Deutschlandticket pro Monat (bisher 63 €)'],
 [24.25,26.65,'540 €','maximaler Zuschuss pro Jahr'],[33.55,35.95,'10 €','pro Monat für jedes Kind ab 6 · geplant'],[37.25,38.62,'267 €','Kindergeld pro Kind (bisher 259 €) · geplant'],
 [39.85,41.62,'0,9 %','Pflege-Zuschlag Kinderlose · geplant'],[46.25,48.2,'19.01.','Umtausch-Frist für Karten von 2002–2004'],
 [51.62,52.78,'+4 %','Rentenerhöhung zum 1. Juli (Prognose)'],[54.75,56.68,'2008','Musterung ab diesem Jahrgang (Männer)'],[65.85,67.9,'10.000 €','Bargeld-Grenze bei Händlern (EU)']];
const TITLES=[[0.0,7.6,'Das ändert sich<br>2027 für dich'],[7.62,9.7,'Mindestlohn<br>steigt'],[14.9,17.3,'Deutschlandticket<br>wird teurer'],[19.3,21.72,'Riester: keine<br>neuen Verträge'],[21.75,24.25,'Neu: Alters&shy;vorsorge&shy;depot'],
 [26.7,30.6,'Geplant, aber noch<br>nicht beschlossen'],[30.65,33.55,'Frühstart-Rente'],[36.08,37.25,'Mehr Kindergeld'],[38.65,39.85,'Kinderlose zahlen<br>mehr für Pflege'],[41.75,46.25,'Kartenführerschein<br>von 2002 bis 2004?'],
 [48.25,51.62,'Renten steigen'],[52.82,54.75,'Pflicht-Musterung'],[56.68,59.0,'Erstmals<br>seit 2011'],[59.0,61.3,'Wehrdienst bleibt<br>freiwillig'],[61.45,63.15,'Und das Bargeld?'],[63.15,65.85,'Ab 10. Juli:<br>Bargeld-Grenze'],
 [67.95,70.1,'Privat weiter<br>erlaubt'],[70.15,73.5,'Was trifft dich<br>am meisten?']];
const CNT=[[7.95,1],[14.95,2],[19.32,3],[30.68,4],[36.08,5],[38.66,6],[41.78,7],[48.25,8],[52.82,9],[61.45,10]];
const SRC='Quellen: Bundesregierung, Bundestag, Deutsche Rentenversicherung, EU-Verordnung 2024/1624, Koordinierungsrat Deutschlandticket\nStand 19.11.2026 · Darstellung vereinfacht';
const titleEl=document.getElementById('title'),numEl=document.getElementById('num'),subEl=document.getElementById('sub'),srcEl=document.getElementById('src'),logoEl=document.getElementById('logo'),cntEl=document.getElementById('cnt');srcEl.innerHTML=SRC.replace('\n','<br>');
const ov=document.getElementById('ov');const shadeEl=document.getElementById('shade');const tags=Array.from({length:10},(_,i)=>{const e=document.createElement('div');e.className='tag';e.textContent=String(i+1);ov.appendChild(e);return e;});
const TAGOBJ=()=>[slip.G,ticket.G,depot.G,piggy.G,kg.G,bars.G,lic.G,stack.G,env.G,cash.G];
function overlay(t){const O2=OUT.t0;
  const s=SUBS.find(q=>t>=q[0]&&t<q[1]);subEl.textContent=s?s[2]:'';subEl.style.opacity=s?Math.min(1,(t-s[0])/0.18+0.15):0;subEl.style.transform=s?`translateY(${(1-eo((t-s[0])/0.3))*8}px)`:'none';
  const nm=NUMS.find(q=>t>=q[0]&&t<q[1]);let nop=0;
  if(nm){numEl.innerHTML=nm[2]+'<small>'+nm[3]+'</small>';nop=Math.min(clamp((t-nm[0])/0.2,0,1),clamp((nm[1]-t)/0.2,0,1));const pi=eo((t-nm[0])/0.45);numEl.style.transform=`translateY(${(1-pi)*20}px) scale(${1+0.05*(1-pi)})`;numEl.style.transformOrigin='0 0';}
  numEl.style.opacity=nop;numEl.style.filter=`blur(${(1-Math.min(1,nm?(t-nm[0])/0.3:1))*6}px)`;
  const tt=TITLES.find(q=>t>=q[0]&&t<q[1]);if(tt){titleEl.innerHTML=tt[2];const ti=t<0.05?1:eo((t-tt[0])/0.4),to=clamp((tt[1]-t)/0.25,0,1);titleEl.style.opacity=Math.min(ti,to)*(1-nop);titleEl.style.transform=`translateY(${(1-ti)*18-(1-to)*8}px)`;titleEl.style.filter=`blur(${(1-ti)*5}px)`;}else titleEl.style.opacity=0;
  let cn=0,ct=0;for(const [tc,n] of CNT)if(t>=tc){cn=n;ct=tc;}if(cn>0&&t<70.1){const pop=1+0.35*Math.max(0,1-(t-ct)/0.35);cntEl.innerHTML=`<b style="transform:scale(${pop.toFixed(3)})">${cn}</b>/10`;cntEl.style.opacity=clamp((t-7.95)/0.3,0,1);}else cntEl.style.opacity=t<70.4&&cn>0?clamp((70.4-t)/0.3,0,1):0;
  srcEl.style.opacity=0.95*clamp((O2+0.2-t)/0.3,0,1);logoEl.style.opacity=1-eo((t-O2)/0.3);
  // number tags over the parked objects in the overview
  const tk=Math.min(win(t,70.55,73.4,0.3));const objs=TAGOBJ();tags.forEach((e,i)=>{const op=tk*clamp((t-70.55-i*0.07)/0.2,0,1);if(op<=0.01){e.style.opacity=0;return;}const o=objs[i];o.updateMatrixWorld();const b=new THREE.Box3().setFromObject(o);const q=proj([(b.min.x+b.max.x)/2,b.max.y+0.03,(b.min.z+b.max.z)/2]);e.style.left=q[0]+'px';e.style.top=q[1]+'px';e.style.opacity=op;e.style.transform=`translate(-50%,-50%) scale(${lerp(0.6,1,eo((t-70.55-i*0.07)/0.3))})`;});}

// ------------------------------------------------------------------ outro v7: the ten red rings. After the last sentence the red marker stroke circles each of the ten objects
// in the overview, then the rings lift off, swirl together and merge into one red dot; "function" appears in front of it
const RG={draw0:73.45,draw1:73.74,fly0:73.78,fly1:74.12,let0:74.1,let1:74.42};
const fwc=document.getElementById('fw').getContext('2d');
const RLOGO=(()=>{const g=document.createElement('canvas').getContext('2d');const sz=176,tr=-0.04*sz;g.font=`500 ${sz}px Poppins`;
  const ws=[...'function'].map(c=>g.measureText(c).width),dw=g.measureText('.').width;const tw=ws.reduce((a,b)=>a+b,0)+tr*8;const x0=W/2-(tw+dw)/2,base=1490;
  const xs=[];let x=x0;ws.forEach(w=>{xs.push(x);x+=w+tr;});const m=g.measureText('.');const dr=(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)/2;
  return {sz,x0,base,xs,tw,dot:{x:x+(m.actualBoundingBoxRight-m.actualBoundingBoxLeft)/2+m.actualBoundingBoxLeft,y:base-dr,r:dr}};})();
const _bx=new THREE.Box3(),_cv=new THREE.Vector3();
function objRing(o){_bx.setFromObject(o);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let i=0;i<8;i++){_cv.set(i&1?_bx.max.x:_bx.min.x,i&2?_bx.max.y:_bx.min.y,i&4?_bx.max.z:_bx.min.z);const q=proj([_cv.x,_cv.y,_cv.z]);
  x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}return {cx:(x0+x1)/2,cy:(y0+y1)/2,rx:Math.min(150,(x1-x0)/2*0.82+20),ry:Math.min(150,(y1-y0)/2*0.82+18)};}
const RSEEDS=[3,7,11,5,9,13,4,8,12,6];
function ringsOutro(t){fwc.clearRect(0,0,W,H);if(t<RG.draw0)return;const objs=TAGOBJ();
  // the scene steps back a little so the logo reads
  const dk=0.6*ease((t-RG.fly0)/0.45);if(dk>0){fwc.fillStyle=`rgba(7,7,11,${dk.toFixed(3)})`;fwc.fillRect(0,0,W,H);}
  const D=RLOGO.dot;let arrived=0;
  fwc.save();fwc.lineCap='round';fwc.lineJoin='round';
  objs.forEach((o,i)=>{const R=objRing(o);const d0=RG.draw0+i*0.018,du=clamp((t-d0)/0.2,0,1);if(du<=0)return;
    const P=ringPath(R.cx,R.cy,R.rx,R.ry,RSEEDS[i],Math.PI*2+0.5,-2.2+i*0.7);
    const f0=RG.fly0+i*0.012,ta=RG.fly1-0.1+i*0.011,fu=clamp((t-f0)/(ta-f0),0,1);if(fu>=1){arrived++;return;}
    // flight: curved path into the dot, the ring shrinks and spins
    const drawRing=(u,alpha)=>{const e=eio(u);const side=i%2?1:-1;const mx=(R.cx+D.x)/2+side*(170+i*12),my=(R.cy+D.y)/2-120;
      const cx=(1-e)*(1-e)*R.cx+2*(1-e)*e*mx+e*e*D.x,cy=(1-e)*(1-e)*R.cy+2*(1-e)*e*my+e*e*D.y;const k=lerp(1,D.r*0.9/Math.max(R.rx,R.ry),e);const rot=e*side*2.4;
      fwc.save();fwc.translate(cx,cy);fwc.rotate(rot);fwc.scale(k,k);fwc.translate(-R.cx,-R.cy);fwc.globalAlpha=alpha;fwc.strokeStyle=REDS;fwc.lineWidth=9/Math.max(k,0.35);
      const n=Math.max(2,Math.floor((P.length-1)*du));fwc.beginPath();fwc.moveTo(P[0][0],P[0][1]);for(let j=1;j<=n;j++)fwc.lineTo(P[j][0],P[j][1]);fwc.stroke();
      fwc.globalAlpha=alpha*0.3;fwc.lineWidth=4/Math.max(k,0.35);fwc.strokeStyle='#ff5a64';fwc.stroke();fwc.restore();};
    if(fu>0)for(let g=3;g>=1;g--){const ug=clamp((t-g*0.025-f0)/(ta-f0),0,1);if(ug>0)drawRing(ug,0.16*(4-g)/3);}
    drawRing(fu,0.95);});
  fwc.restore();
  // the dot grows with every ring that arrives and pops once at the end
  if(arrived>0){const last=RG.fly1-0.1+9*0.011;const pop=clamp((t-last)/0.22,0,1);const base=D.r*(0.45+0.55*arrived/10);
    const r=arrived<10?base:D.r*(pop<0.5?lerp(1,1.3,eo(pop/0.5)):lerp(1.3,1,ease((pop-0.5)/0.5)));
    fwc.save();fwc.shadowColor='rgba(255,40,55,0.9)';fwc.shadowBlur=26;fwc.fillStyle=REDS;fwc.beginPath();fwc.arc(D.x,D.y,r,0,7);fwc.fill();fwc.restore();}
  // "function" appears letter by letter in front of the dot
  fwc.save();fwc.font=`500 ${RLOGO.sz}px Poppins`;fwc.fillStyle='#ee2433';fwc.shadowColor='rgba(255,40,55,0.75)';fwc.shadowBlur=22;
  [...'function'].forEach((c,i)=>{const u=clamp((t-RG.let0-i*0.032)/0.24,0,1);if(u<=0)return;const e=eo(u);fwc.globalAlpha=e;fwc.filter=u<1?`blur(${((1-e)*8).toFixed(2)}px)`:'none';
    fwc.fillText(c,RLOGO.xs[i],RLOGO.base+(1-e)*26);});fwc.restore();}

// ------------------------------------------------------------------ per-frame state
const _b=new THREE.Box3();
function setTime(t){setCam(t);
  const top=cal.update(t);
  // focus light follows the camera target
  {const fp=new THREE.Vector3(CAMT[0]+0.25,CAMT[1]+1.25,CAMT[2]+0.85);focus.position.copy(fp);focus.target.position.set(CAMT[0],CAMT[1]-0.02,CAMT[2]);focus.target.updateMatrixWorld();
   const k=t>70.3&&t<73.6?0.7:1;focus.intensity=1.5*k;}
  // objects
  const bob=(o,ph)=>{o.position.y+=0.0025*Math.sin(t*1.9+ph);};
  applyPose(cash.G,TR.cash(t));if(t<3.4||(t>61.6&&t<64.6))bob(cash.G,0.3);
  S0.set((t-STROKES.s0[0])/(STROKES.s0[1]-STROKES.s0[0]));S0.m.material.opacity=0.94*(t<61?1:clamp(1-(t-61)/0.4,0,1));SX1.set((t-STROKES.x1[0])/(STROKES.x1[1]-STROKES.x1[0]));SX2.set((t-STROKES.x2[0])/(STROKES.x2[1]-STROKES.x2[0]));
  if(t>61)S0.m.visible=t<61.4;
  applyPose(slip.G,TR.slip(t));if(t>8.5&&t<14.9)bob(slip.G,1);
  slip.set(lerp(13.9,14.6,eio((t-9.7)/0.9)),lerp(603,633,eio((t-12.66)/0.9)),win(t,9.6,12.5,0.3),win(t,12.6,14.9,0.3));
  applyPose(ticket.G,TR.ticket(t));if(t>15&&t<19.3)bob(ticket.G,2);{const f=clamp((t-17.32)/0.38,0,1);ticket.set(f<0.5?'63,00 €':'66,80 €',f>0&&f<1?f:0);}
  applyPose(binder.G,TR.binder(t));{const D=0.215,u=clamp((t-21.02)/0.42,0,1);const th=-Math.PI/2*u*u+(u>=1?0.06*Math.abs(Math.sin((t-21.44)*26))*Math.exp(-(t-21.44)*9):0);
    binder.P.rotation.x=th;binder.P.position.set(0,-(D/2)*Math.sin(th),-(D/2)+(D/2)*Math.cos(th));const g2=clamp((t-21.0)/0.6,0,1);binder.mat[0].color.setRGB(lerp(0.31,0.16,g2),lerp(0.38,0.16,g2),lerp(0.48,0.17,g2));binder.mat[1].color.setScalar(lerp(1,0.45,g2));}
  applyPose(depot.G,TR.depot(t));if(t>21.8&&t<26.6)bob(depot.G,3);
  {const u=eo((t-22.25)/1.4);depot.tube.setDrawRange(0,Math.floor(depot.tube.index.count*u/6)*6);depot.line.visible=u>0.01;const hp=depot.curve.getPointAt(Math.max(0.001,u));depot.head.position.copy(hp);depot.head.visible=u>0.01;
   depot.coins.forEach((c,i)=>{const t0=24.32+i*0.13;const v=clamp((t-t0)/0.32,0,1);const yEnd=0.0095+i*0.003;c.visible=t>t0;c.position.set(0.025*Math.sin(i*2.1)*0.3+0.01,lerp(depot.S+0.06,yEnd,v*v),0.012);c.rotation.set(0.4*(1-v),i,0);});}
  piggyAnim(t);
  applyPose(kg.G,TR.kg(t));if(t>36&&t<38.6)bob(kg.G,5);kg.set(clamp((t-37.0)/0.25,0,1),clamp((t-37.25)/0.52,0,1),clamp((t-37.82)/0.48,0,1));
  applyPose(bars.G,TR.bars(t));bars.setNew(eio((t-39.9)/0.6));
  licAnim(t);
  applyPose(stack.G,TR.stack(t));{const c=stack.coins[stack.n];const v=clamp((t-51.62)/0.42,0,1);c.visible=t>51.5;const yE=0.008+0.0017+stack.n*0.0034;c.position.y=lerp(yE+0.14,yE,v*v)+(v>=1?0.004*Math.max(0,Math.sin((t-52.04)*30))*Math.exp(-(t-52.04)*12):0);
   c.material[1].emissive=new THREE.Color(0xffd27a);c.material[1].emissiveIntensity=1.2*win(t,51.95,52.9,0.3);}
  applyPose(env.G,TR.env(t));if(t>52.8&&t<61.3)bob(env.G,8);env.flapG.rotation.x=2.75*eio((t-55.9)/0.45)+(Math.PI+0.03-2.75)*eio((t-61.35)/0.55);env.letter.position.y=0.072*eio((t-56.25)/0.7);env.tick.opacity=clamp((t-60.45)/0.15,0,1);
  applyPose(shop.G,SHOP(t));shop.G.visible=t>64.45&&t<67.85;
  meepleAnim(t);
  // tools
  ringsOutro(t);
  const mOn=toolPose(marker,MARK,t,REST.marker,1);const pOn=toolPose(pencil,PENC,t,REST.pencil,-1);
  {const o=clamp((t-OUT.t0-0.3)/0.6,0,1);shadeEl.style.opacity=(1-0.55*o).toFixed(3);}
  overlay(t);}

const VO=0.15,END_V=OUT.end;window.TOTAL=Math.round((END_V+VO)*30);
window.renderAt=async f=>{const tv=f/30-VO;setTime(tv);composer.render();const fd=Math.min(clamp((f/30)/0.25,0,1),clamp((END_V-tv)/0.2,0,1));document.body.style.filter=fd<1?`brightness(${fd.toFixed(3)})`:'none';return true;};
window.setTimeV=tv=>{setTime(tv);composer.render();};
window.THREE_DBG=THREE;window.DBGOBJ={cash,slip,ticket,binder,depot,piggy,kg,bars,lic,stack,env,shop,ma,mb,marker,pencil};window.setT=tv=>setTime(tv);
await window.renderAt(0);window.ready=true;
