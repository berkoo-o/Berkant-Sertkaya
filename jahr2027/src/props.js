// the objects that grow out of the calendar pages, plus the red marker and the pencil
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {clamp,lerp,ease,eo,ctex,grain,roundRect,rng,RED,REDS,INK,GRAPH} from './util.js';

const std=(c,r=0.8,m=0,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,...extra});
function M(parent,geo,mat,x=0,y=0,z=0,cast=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;}
// gently bent sheet of paper (bend along x)
function sheetGeo(w,h,bend=0.004,sx=16,sy=4){const g=new THREE.PlaneGeometry(w,h,sx,sy);const a=g.attributes.position.array;for(let i=0;i<a.length;i+=3){const u=a[i]/(w/2);a[i+2]+=bend*(1-u*u);}g.computeVertexNormals();return g;}
function paper(w,h,tw,draw,opt={}){const th=Math.round(tw*h/w);const T=ctex(tw,th,draw);const G=new THREE.Group();
  const f=M(G,sheetGeo(w,h,opt.bend??0.003),new THREE.MeshStandardMaterial({map:T.tex,color:0xd2cdc5,roughness:0.9}));const b=M(G,f.geometry,new THREE.MeshStandardMaterial({color:opt.back??0xdcd6ca,roughness:0.95,side:THREE.BackSide}));return {G,T,f,b,tw,th};}

// ------------------------------------------------------------------ sketch look for things that are only planned
const GRAD=(()=>{const d=new Uint8Array([90,170,255]);const t=new THREE.DataTexture(d,3,1,THREE.RedFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t;})();
const HATCH=ctex(256,256,(g,w,h)=>{g.fillStyle='#efebe2';g.fillRect(0,0,w,h);g.strokeStyle='rgba(70,74,84,0.16)';g.lineWidth=2;for(let i=-h;i<w;i+=11){g.beginPath();g.moveTo(i,h);g.lineTo(i+h,0);g.stroke();}},{repeat:true});
HATCH.tex.repeat.set(3,3);
export function sketchFill(c=0xece8de){return new THREE.MeshToonMaterial({color:c,gradientMap:GRAD,map:HATCH.tex});}
const outlineMats={};
function outlineMat(w,c=0x3b3f47){const k=w+'_'+c;if(outlineMats[k])return outlineMats[k];const m=new THREE.MeshBasicMaterial({color:c,side:THREE.BackSide});
  m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','vec3 transformed = position + normal * '+w.toFixed(5)+';');};m.customProgramCacheKey=()=>'ol'+k;return outlineMats[k]=m;}
export function outline(mesh,w=0.0011,c=0x3b3f47){let g=mesh.geometry.clone();g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g,1e-4);g.computeVertexNormals();
  const o=new THREE.Mesh(g,outlineMat(w,c));o.castShadow=false;mesh.add(o);return o;}

// ------------------------------------------------------------------ tools
export function mkMarker(scene){const G=new THREE.Group();scene.add(G);const P=new THREE.Group();G.add(P); // tip at origin, barrel along +y
  const red=std(RED,0.45,0,{emissive:new THREE.Color(RED),emissiveIntensity:0.12});const white=std(0xeceae5,0.35,0.0);const grey=std(0x2a2a30,0.5,0.1);
  M(P,new THREE.CylinderGeometry(0.0011,0.0034,0.008,16),std(RED,0.7,0,{emissive:new THREE.Color(RED),emissiveIntensity:0.35}),0,0.004,0);
  M(P,new THREE.CylinderGeometry(0.0036,0.0078,0.014,28),grey,0,0.015,0);
  M(P,new THREE.CylinderGeometry(0.0085,0.0085,0.096,36),white,0,0.07,0);
  M(P,new THREE.CylinderGeometry(0.0087,0.0087,0.012,36),red,0,0.052,0);
  M(P,new THREE.CylinderGeometry(0.0096,0.0092,0.036,36),red,0,0.128,0);
  M(P,new THREE.SphereGeometry(0.0096,24,12,0,Math.PI*2,0,Math.PI/2),red,0,0.146,0);
  M(P,new THREE.BoxGeometry(0.003,0.03,0.004),red,0,0.124,0.0105);
  return {G,P};}
export function mkPencil(scene){const G=new THREE.Group();scene.add(G);const P=new THREE.Group();G.add(P);
  const body=std(0x5d6472,0.55,0.05,{flatShading:true});
  M(P,new THREE.CylinderGeometry(0.0004,0.0013,0.004,6),std(0x2e3036,0.4,0.3),0,0.002,0);
  M(P,new THREE.CylinderGeometry(0.0013,0.0056,0.017,6),std(0xdcc3a1,0.85,0,{flatShading:true}),0,0.0125,0);
  M(P,new THREE.CylinderGeometry(0.0056,0.0056,0.115,6),body,0,0.078,0);
  M(P,new THREE.CylinderGeometry(0.0058,0.0058,0.009,20),std(0xb4b6bb,0.3,0.9),0,0.14,0);
  M(P,new THREE.CylinderGeometry(0.0055,0.0055,0.009,20),std(0xc9c1b6,0.9,0),0,0.149,0);
  return {G,P};}

// ------------------------------------------------------------------ 10: cash bundle (100 notes of 100 euro)
function noteTex(){return ctex(512,284,(g,w,h)=>{const L=g.createLinearGradient(0,0,w,h);L.addColorStop(0,'#9cbc96');L.addColorStop(0.5,'#7fa585');L.addColorStop(1,'#6b9377');g.fillStyle=L;g.fillRect(0,0,w,h);
  g.globalAlpha=0.25;for(let i=0;i<9;i++){g.strokeStyle='#e9f2e2';g.lineWidth=1.5;g.beginPath();g.ellipse(330,150,40+i*14,24+i*9,0.3,0,7);g.stroke();}g.globalAlpha=1;
  g.fillStyle='rgba(235,242,230,0.55)';roundRect(g,300,70,130,150,10);g.fill();g.fillStyle='rgba(60,95,70,0.5)';g.fillRect(318,95,22,105);g.fillRect(352,95,22,105);g.fillRect(386,95,22,105);g.fillRect(310,85,110,14);
  g.fillStyle='#2f5a43';g.font='800 92px "Inter Tight"';g.fillText('100',28,104);g.font='600 30px Poppins';g.fillText('EURO',34,150);g.font='800 54px "Inter Tight"';g.fillText('100',406,262);
  g.fillStyle='#d8c46a';for(let k=0;k<12;k++){const a=k/12*Math.PI*2;g.beginPath();g.arc(120+Math.cos(a)*34,215+Math.sin(a)*34,4,0,7);g.fill();}grain(g,w,h,10,3);});}
export function mkCash(scene){const G=new THREE.Group();scene.add(G);const L=0.150,Hh=0.024,D=0.081;
  const top=noteTex();const side=ctex(256,64,(g,w,h)=>{g.fillStyle='#cfdcc6';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){g.fillStyle=`rgba(70,105,80,${0.18+0.18*Math.random()})`;g.fillRect(0,y,w,1);}});
  const sm=std(0xffffff,0.9,0,{map:side.tex});const tm=std(0xffffff,0.75,0,{map:top.tex});
  const stack=M(G,new THREE.BoxGeometry(L,Hh,D),[sm,sm,tm,sm,sm,sm],0,Hh/2,0);
  const band=ctex(512,160,(g,w,h)=>{g.fillStyle='#ece3cc';g.fillRect(0,0,w,h);g.fillStyle='#3c3a33';g.font='800 84px "Inter Tight"';g.textAlign='center';g.fillText('10.000 €',w/2,112);grain(g,w,h,8,4);});
  const bm=std(0xffffff,0.85,0,{map:band.tex});const bs=std(0xe2d8bf,0.9);
  const bandM=M(G,new THREE.BoxGeometry(0.03,Hh+0.002,D+0.002),[bs,bs,bm,bs,bs,bs],0,Hh/2,0);
  // the label sits across the band: rotate the texture so the text reads along the band
  band.tex.center.set(0.5,0.5);band.tex.rotation=Math.PI/2;band.tex.repeat.set(1,1);
  return {G,L,H:Hh,D,band,top};}

// ------------------------------------------------------------------ 1: pay slip
export function mkSlip(scene){const P=paper(0.165,0.215,700,null,{bend:0.004});scene.add(P.G);const g=P.T.g,w=P.tw,h=P.th;
  function draw(wage,mini,hiWage,hiMini){g.setTransform(1,0,0,1,0,0);g.fillStyle='#f7f4ee';g.fillRect(0,0,w,h);grain(g,w,h,7,8);
    g.fillStyle='#1f1f25';g.fillRect(0,0,w,92);g.fillStyle='#f4f1ea';g.font='800 40px "Inter Tight"';g.letterSpacing='4px';g.fillText('LOHNABRECHNUNG',40,60);g.letterSpacing='0px';
    g.fillStyle='#6b6b73';g.font='500 27px Poppins';g.fillText('Januar 2027',40,140);g.textAlign='right';g.fillText('Personal-Nr. 0815',w-40,140);g.textAlign='left';
    const row=(y,a,b,hi,bold)=>{if(hi>0){g.fillStyle=`rgba(255,226,120,${0.55*hi})`;roundRect(g,26,y-46,w-52,64,10);g.fill();}g.fillStyle='#2a2a31';g.font=(bold?'600 ':'500 ')+'33px Poppins';g.fillText(a,40,y);g.textAlign='right';g.font='700 36px "Inter Tight"';g.fillText(b,w-40,y);g.textAlign='left';
      g.fillStyle='rgba(30,30,35,0.12)';g.fillRect(40,y+22,w-80,2);};
    const eur=v=>v.toFixed(2).replace('.',',')+' €';
    row(236,'Stundenlohn',eur(wage),hiWage,true);row(318,'Stunden',(160).toString(),0);row(400,'Brutto',(wage*160).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' €',0);
    g.fillStyle='rgba(30,30,35,0.35)';g.fillRect(40,470,w-80,3);
    row(560,'Minijob-Grenze',Math.round(mini)+' €',hiMini,true);
    g.fillStyle='#8a8a92';g.font='500 24px Poppins';g.fillText('gesetzlicher Mindestlohn ab 01.01.2027',40,h-48);P.T.tex.needsUpdate=true;}
  draw(13.9,603,0,0);let k='';return {G:P.G,set(w2,m2,a,b){const kk=w2.toFixed(2)+m2.toFixed(0)+a.toFixed(2)+b.toFixed(2);if(kk!==k){k=kk;draw(w2,m2,a,b);}}};}

// ------------------------------------------------------------------ 2: Deutschlandticket (neutral design, no operator branding)
export function mkTicket(scene){const G=new THREE.Group();scene.add(G);const W=0.137,Hh=0.086;
  const T=ctex(820,515,null);const g=T.g,w=820,h=515;
  function draw(price,flip){g.setTransform(1,0,0,1,0,0);const L=g.createLinearGradient(0,0,w,h);L.addColorStop(0,'#16223d');L.addColorStop(1,'#2a3d66');g.fillStyle=L;g.fillRect(0,0,w,h);
    g.strokeStyle='rgba(255,255,255,0.16)';g.lineWidth=5;g.lineCap='round';[[[-20,380],[180,300],[330,330],[520,210],[860,240]],[[-20,200],[150,250],[300,150],[470,180],[860,90]]].forEach(pl=>{g.beginPath();pl.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();pl.slice(1,-1).forEach(p=>{g.fillStyle='rgba(255,255,255,0.4)';g.beginPath();g.arc(p[0],p[1],9,0,7);g.fill();});});
    g.fillStyle='#ffffff';g.font='700 58px Poppins';g.fillText('Deutschlandticket',44,96);g.fillStyle='rgba(255,255,255,0.7)';g.font='500 30px Poppins';g.fillText('Monatsabo · Januar 2027',46,142);
    g.fillStyle='#f5f6fa';roundRect(g,590,250,190,190,14);g.fill();const r=rng(5);g.fillStyle='#16223d';for(let y=0;y<9;y++)for(let x=0;x<9;x++){if(r()>0.5||((x<3||x>5)&&(y<3||y>5)&&!(x>2&&x<6)&&!(y>2&&y<6)&&r()>0.2))g.fillRect(606+x*18.5,266+y*18.5,16,16);}
    g.fillStyle='rgba(255,255,255,0.75)';g.font='500 30px Poppins';g.fillText('Preis pro Monat',46,368);
    g.save();g.translate(46,452);if(flip!==0){g.scale(1,Math.max(0.05,Math.abs(Math.cos(flip*Math.PI))));}g.fillStyle='#ffffff';g.font='800 92px "Inter Tight"';g.textBaseline='middle';g.fillText(price,0,-12);g.restore();T.tex.needsUpdate=true;}
  draw('63,00 €',0);const face=std(0xffffff,0.35,0.0,{map:T.tex});const edge=std(0x1d2a48,0.4);
  const card=M(G,new RoundedBoxGeometry(W,Hh,0.0022,2,0.0012),edge);const fp=M(G,new THREE.PlaneGeometry(W-0.0006,Hh-0.0006),face,0,0,0.00112,false);
  // rounded corners on the face via alpha map
  const am=ctex(256,160,(g2,w2,h2)=>{g2.fillStyle='#000';g2.fillRect(0,0,w2,h2);g2.fillStyle='#fff';roundRect(g2,0,0,w2,h2,14);g2.fill();});face.alphaMap=am.tex;face.transparent=true;
  let k='';return {G,set(p,f){const kk=p+f.toFixed(2);if(kk!==k){k=kk;draw(p,f);}}};}

// ------------------------------------------------------------------ 3: Riester binder and the new depot
export function mkBinder(scene){const G=new THREE.Group();scene.add(G);const P=new THREE.Group();G.add(P);
  const cover=std(0x50627a,0.75);const sp=ctex(200,760,(g,w,h)=>{g.fillStyle='#50627a';g.fillRect(0,0,w,h);grain(g,w,h,8,9);g.fillStyle='#f3efe6';roundRect(g,26,70,w-52,420,10);g.fill();
    g.save();g.translate(w/2+18,280);g.rotate(-Math.PI/2);g.fillStyle='#22252b';g.font='800 62px "Inter Tight"';g.textAlign='center';g.letterSpacing='5px';g.fillText('RIESTER',0,0);g.letterSpacing='0px';g.restore();
    g.save();g.translate(w/2-38,280);g.rotate(-Math.PI/2);g.fillStyle='#6a6e78';g.font='500 26px Poppins';g.textAlign='center';g.fillText('Altersvorsorge',0,0);g.restore();
    g.fillStyle='#2a3240';g.beginPath();g.arc(w/2,600,40,0,7);g.fill();g.fillStyle='#8b96a6';g.beginPath();g.arc(w/2,600,30,0,7);g.fill();});
  const spm=std(0xffffff,0.75,0,{map:sp.tex});const Wd=0.062,Hh=0.27,D=0.215;
  M(P,new THREE.BoxGeometry(Wd,Hh,D),[cover,cover,cover,cover,spm,cover],0,Hh/2,0);
  const pages=std(0xeee9de,0.95);M(P,new THREE.BoxGeometry(Wd-0.008,Hh-0.012,D-0.004),pages,0,Hh/2,-0.004);
  return {G,P,mat:[cover,spm],H:Hh};}
export function mkCoin(r=0.0118,h=0.0026){const T=ctex(128,128,(g,w,hh)=>{g.fillStyle='#d6b25a';g.fillRect(0,0,w,hh);g.strokeStyle='rgba(120,90,30,0.55)';g.lineWidth=5;g.beginPath();g.arc(64,64,52,0,7);g.stroke();g.fillStyle='rgba(120,90,30,0.6)';g.font='800 56px "Inter Tight"';g.textAlign='center';g.fillText('€',64,84);});
  const face=std(0xffffff,0.32,0.85,{map:T.tex});const side=std(0xc9a24a,0.3,0.9);return new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,40),[side,face,face]);}
export function mkDepot(scene){const G=new THREE.Group();scene.add(G);const S=0.12;
  const glass=new THREE.MeshStandardMaterial({color:0xcfe0ff,roughness:0.08,metalness:0,transparent:true,opacity:0.16,depthWrite:false,envMapIntensity:1.6});
  const box=M(G,new RoundedBoxGeometry(S,S,S,3,0.006),glass,0,S/2,0,false);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(S,S,S)),new THREE.LineBasicMaterial({color:new THREE.Color(0xdfe9ff).multiplyScalar(1.6)}));edges.position.y=S/2;G.add(edges);
  M(G,new RoundedBoxGeometry(S+0.012,0.008,S+0.012,2,0.003),std(0x1b1c22,0.5,0.2),0,0.004,0);
  // rising chart line inside
  const pts=[];const r=rng(11);for(let i=0;i<=14;i++){const u=i/14;pts.push(new THREE.Vector3(-S*0.4+u*S*0.8,0.018+u*S*0.66+(r()-0.5)*0.014*(1-u*0.4),-S*0.15));}
  const curve=new THREE.CatmullRomCurve3(pts);const tube=new THREE.TubeGeometry(curve,120,0.0016,8,false);const tm=new THREE.MeshBasicMaterial({color:new THREE.Color(0xffffff).multiplyScalar(2.2)});
  const line=new THREE.Mesh(tube,tm);G.add(line);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.0034,16,12),new THREE.MeshBasicMaterial({color:new THREE.Color(0xffffff).multiplyScalar(3)}));G.add(head);
  const coins=[];for(let i=0;i<7;i++){const c=mkCoin(0.0125,0.003);c.castShadow=true;G.add(c);coins.push(c);}
  const lab=ctex(512,96,(g,w,h)=>{g.fillStyle='#16161b';roundRect(g,0,0,w,h,16);g.fill();g.fillStyle='#f2efe8';g.font='600 40px Poppins';g.textAlign='center';g.fillText('Altersvorsorgedepot',w/2,62);});
  const lp=M(G,new THREE.PlaneGeometry(0.11,0.0206),new THREE.MeshStandardMaterial({map:lab.tex,roughness:0.6,transparent:true}),0,0.004,S/2+0.0075,false);lp.rotation.x=-0.25;lp.position.y=0.017;
  return {G,S,tube,line,head,curve,coins,glass,edges};}

// ------------------------------------------------------------------ 4/5/6: planned things in sketch style
export function mkPiggy(scene){const G=new THREE.Group();scene.add(G);const B=new THREE.Group();G.add(B);const f=sketchFill(0xf0e2e0),fh=sketchFill(0xd8c6c4),dk=new THREE.MeshBasicMaterial({color:0x2c2f36});
  // proportions of a classic piggy bank: oval body high on four short legs, round snout, small ears, curly tail, coin slot on the back
  const BY=0.064;const body=M(B,new THREE.SphereGeometry(0.05,48,32),f,0,BY,0);body.scale.set(1.24,0.95,0.9);outline(body,0.0013);
  const Hd=new THREE.Group();Hd.position.set(0.052,BY+0.006,0);B.add(Hd);
  const sn=M(Hd,new THREE.CylinderGeometry(0.0172,0.0192,0.02,32),f,0.016,-0.007,0);sn.rotation.z=Math.PI/2;outline(sn,0.0011);
  [-1,1].forEach(s=>M(Hd,new THREE.SphereGeometry(0.0033,12,8),dk,0.0262,-0.007,s*0.0068,false));
  [-1,1].forEach(s=>M(Hd,new THREE.SphereGeometry(0.0034,12,8),dk,0.004,0.018,s*0.018,false));
  const ears=[-1,1].map(s=>{const E=new THREE.Group();E.position.set(-0.014,0.031,s*0.022);Hd.add(E);const e=M(E,new THREE.ConeGeometry(0.0115,0.02,20),f,0,0.008,0);e.rotation.z=-0.32;e.rotation.x=s*0.28;outline(e,0.001);return E;});
  // legs hang from hip pivots so they can swing when the pig walks
  const legGeo=new THREE.CylinderGeometry(0.0106,0.0094,0.036,20);legGeo.translate(0,-0.018,0);const hoofGeo=new THREE.CylinderGeometry(0.0096,0.01,0.006,20);hoofGeo.translate(0,-0.039,0);
  const legs=[[0.034,0.022],[0.034,-0.022],[-0.033,0.022],[-0.033,-0.022]].map(([x,z])=>{const L=new THREE.Group();L.position.set(x,BY-0.022,z);B.add(L);const l=M(L,legGeo,f);outline(l,0.001);const h=M(L,hoofGeo,fh);outline(h,0.0009);return L;});
  const tail=new THREE.Group();tail.position.set(-0.062,BY+0.008,0);B.add(tail);const tl=M(tail,new THREE.TorusGeometry(0.0075,0.0021,8,22,Math.PI*1.5),f,-0.006,0.002,0);tl.rotation.y=Math.PI/2;outline(tl,0.0008);
  const SLOT=BY+0.05*0.95;M(B,new THREE.BoxGeometry(0.026,0.0035,0.0048),dk,0.0,SLOT+0.0002,0,false);
  const coins=[0,1,2].map(()=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(0.0112,0.0112,0.0028,32),sketchFill(0xf3e7c4));outline(c,0.0009);c.rotation.x=Math.PI/2;c.visible=false;B.add(c);return c;});
  return {G,B,Hd,ears,legs,tail,coins,SLOT,BY};}
export function mkLetterKG(scene){const P=paper(0.15,0.19,640,null,{bend:0.003});scene.add(P.G);const g=P.T.g,w=P.tw,h=P.th;
  function draw(strike,write,ring){g.setTransform(1,0,0,1,0,0);g.fillStyle='#f6f3ec';g.fillRect(0,0,w,h);grain(g,w,h,7,12);
    g.fillStyle='#3d4250';g.font='700 30px Poppins';g.fillText('Familienkasse',40,64);g.fillStyle='#8a8d96';g.font='500 22px Poppins';g.fillText('Kindergeld 2027',40,98);
    g.fillStyle='rgba(30,30,35,0.18)';g.fillRect(40,124,w-80,2);
    g.fillStyle='#4a4d55';g.font='500 30px Poppins';g.fillText('Kindergeld pro Kind',40,214);g.fillText('und Monat:',40,256);
    g.fillStyle='#2b2d33';g.font='800 96px "Inter Tight"';g.fillText('259 €',40,388);
    for(let i=0;i<5;i++){g.fillStyle='rgba(40,40,46,0.10)';g.fillRect(40,470+i*48,w-80-(i%2)*120,14);}
    if(strike>0){g.save();g.strokeStyle='rgba(70,74,84,0.92)';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(30,356);g.lineTo(30+strike*270,346);g.stroke();g.restore();}
    if(write>0){g.save();g.beginPath();g.rect(318,250,write*300,190);g.clip();g.fillStyle='rgba(62,66,76,0.95)';g.font='700 120px Caveat';g.fillText('267 €',326,396);g.restore();}
    if(ring>0){g.save();g.setLineDash([16,12]);g.strokeStyle='rgba(70,74,84,0.85)';g.lineWidth=5;g.beginPath();const N=60;for(let i=0;i<=N*ring;i++){const a=-2.4+i/N*6.8;const rr=1+0.04*Math.sin(3*a);const x=460+Math.cos(a)*165*rr,y=352+Math.sin(a)*92*rr;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.restore();}
    P.T.tex.needsUpdate=true;}
  draw(0,0,0);let k='';return {G:P.G,tw:w,th:h,set(a,b,c){const kk=[a,b,c].map(v=>v.toFixed(3)).join();if(kk!==k){k=kk;draw(a,b,c);}}};}
export function mkBars(scene){const G=new THREE.Group();scene.add(G);const f=sketchFill(0xe9e6df);
  M(G,new RoundedBoxGeometry(0.17,0.008,0.07,2,0.003),std(0x1b1c22,0.5,0.2),0,0.004,0);
  const old=M(G,new THREE.BoxGeometry(0.044,1,0.044),std(0x9aa3b2,0.6),-0.035,0.5,0);old.scale.y=0.054;old.position.y=0.008+0.027;
  const nw=M(G,new THREE.BoxGeometry(0.044,1,0.044),f,0.035,0.5,0);const nwo=outline(nw,0.0012);
  const lab=(txt,sz,x,y,col='#e9e6df',bold=600)=>{const T=ctex(256,96,(g,w,h)=>{g.fillStyle=col;g.font=bold+' '+sz+'px Poppins';g.textAlign='center';g.fillText(txt,w/2,64);});const m=M(G,new THREE.PlaneGeometry(0.06,0.0225),new THREE.MeshBasicMaterial({map:T.tex,transparent:true,depthWrite:false}),x,y,0.024,false);return m;};
  lab('2026',38,-0.035,0.018);lab('2027',38,0.035,0.018);
  const vOld=lab('0,6 %',58,-0.035,0.08,'#f2efe8',700);const vNew=lab('0,9 %',58,0.035,0.11,'#f2efe8',700);
  const title=ctex(512,80,(g,w,h)=>{g.fillStyle='#16161b';roundRect(g,0,0,w,h,14);g.fill();g.fillStyle='#f2efe8';g.font='600 32px Poppins';g.textAlign='center';g.fillText('Pflege-Zuschlag Kinderlose',w/2,52);});
  const tp=M(G,new THREE.PlaneGeometry(0.16,0.025),new THREE.MeshStandardMaterial({map:title.tex,transparent:true,roughness:0.6}),0,0.012,0.042,false);tp.rotation.x=-0.5;
  return {G,old,nw,vOld,vNew,setNew(u){const hh=lerp(0.054,0.081,u);nw.scale.y=hh;nw.position.y=0.008+hh/2;vNew.position.y=0.008+hh+0.02;}};}

// ------------------------------------------------------------------ 7: card driving licence: the old card (front) turns into the new EU card (back); generic sample cards
function licBase(g,w,h,cols,seed){const L=g.createLinearGradient(0,0,w,h);L.addColorStop(0,cols[0]);L.addColorStop(0.55,cols[1]);L.addColorStop(1,cols[2]);g.fillStyle=L;g.fillRect(0,0,w,h);}
function licEU(g,x,y){g.fillStyle='#21308a';roundRect(g,x,y,92,84,8);g.fill();g.fillStyle='#ffd23f';for(let k=0;k<12;k++){const a=k/12*Math.PI*2;g.beginPath();g.arc(x+46+Math.cos(a)*26,y+34+Math.sin(a)*26,3.4,0,7);g.fill();}
  g.fillStyle='#fff';g.font='800 34px "Inter Tight"';g.textAlign='center';g.fillText('D',x+46,y+74);g.textAlign='left';}
function licPhoto(g,x,y,c1,c2){g.fillStyle=c1;roundRect(g,x,y,190,240,12);g.fill();g.fillStyle=c2;g.beginPath();g.arc(x+95,y+90,46,0,7);g.fill();g.beginPath();g.ellipse(x+95,y+222,80,62,0,Math.PI,0);g.fill();}
function licMuster(g,w,h,a){g.save();g.translate(w*0.62,h*0.62);g.rotate(-0.28);g.fillStyle=`rgba(80,40,80,${a})`;g.font='800 92px "Inter Tight"';g.textAlign='center';g.letterSpacing='12px';g.fillText('MUSTER',0,0);g.letterSpacing='0px';g.restore();}
export function mkLicense(scene){const G=new THREE.Group();scene.add(G);const W=0.137,Hh=0.086;
  // old card (issued 2003): faded colours, a yellowish cast, scratches and worn edges
  const OT=ctex(820,515,(g,w,h)=>{licBase(g,w,h,['#e6bfcb','#dccbd9','#c9cde0']);g.globalAlpha=0.16;g.strokeStyle='#7a5a6e';g.lineWidth=1.5;for(let i=0;i<34;i++){g.beginPath();g.ellipse(w*0.7,h*0.5,60+i*13,30+i*8,0.2,0,7);g.stroke();}g.globalAlpha=1;
    licEU(g,34,30);g.fillStyle='#4f3550';g.font='800 50px "Inter Tight"';g.letterSpacing='3px';g.fillText('FÜHRERSCHEIN',150,78);g.letterSpacing='0px';g.font='500 24px Poppins';g.fillText('BUNDESREPUBLIK DEUTSCHLAND',152,112);
    licPhoto(g,40,150,'#b8acb4','#958a96');g.font='500 30px Poppins';const rows=[['1.','MUSTERMANN'],['2.','ERIKA'],['3.','12.08.1984'],['4a.','14.05.2003'],['4c.','Stadt Musterstadt']];
    rows.forEach(([a,b],i)=>{g.fillStyle='#8a6a86';g.fillText(a,262,182+i*50);g.fillStyle='#43303f';g.font=(i===3?'700 ':'500 ')+'30px Poppins';g.fillText(b,320,182+i*50);g.font='500 30px Poppins';});
    g.fillStyle='rgba(67,48,63,0.75)';g.font='600 26px Poppins';g.fillText('9.  B',262,456);licMuster(g,w,h,0.07);
    g.fillStyle='rgba(205,170,95,0.17)';g.fillRect(0,0,w,h);const r=rng(41);g.strokeStyle='rgba(255,255,255,0.35)';g.lineWidth=1.2;for(let i=0;i<26;i++){const x=r()*w,y=r()*h,a=r()*Math.PI,l=20+r()*90;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
    const E=g.createRadialGradient(w/2,h/2,h*0.35,w/2,h/2,w*0.62);E.addColorStop(0,'rgba(90,60,40,0)');E.addColorStop(1,'rgba(90,60,40,0.22)');g.fillStyle=E;g.fillRect(0,0,w,h);grain(g,w,h,11,13);});
  // new EU card (since 2013 design): cleaner colours, fine guilloche, hologram patch, valid for 15 years
  const NT=ctex(820,515,(g,w,h)=>{licBase(g,w,h,['#f6cfdc','#efdcef','#d6def6']);g.strokeStyle='rgba(120,80,140,0.13)';g.lineWidth=1.2;for(let i=0;i<70;i++){g.beginPath();for(let x=0;x<=w;x+=8){const y=40+i*7+10*Math.sin(x*0.02+i*0.35);x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
    licEU(g,34,30);g.fillStyle='#3a2050';g.font='800 50px "Inter Tight"';g.letterSpacing='3px';g.fillText('FÜHRERSCHEIN',150,78);g.letterSpacing='0px';g.font='500 24px Poppins';g.fillText('BUNDESREPUBLIK DEUTSCHLAND',152,112);
    licPhoto(g,40,150,'#c3b6d2','#9d90b4');const H=g.createRadialGradient(205,370,4,205,370,46);['#ff9ad5','#9ee6ff','#c9ff9e','#ffe48a','#ff9ad5'].forEach((c,i)=>H.addColorStop(i/4,c));g.globalAlpha=0.75;g.fillStyle=H;g.beginPath();g.arc(205,370,42,0,7);g.fill();g.globalAlpha=1;
    g.font='500 29px Poppins';const rows=[['1.','MUSTERMANN'],['2.','ERIKA'],['3.','12.08.1984'],['4a.','12.01.2027'],['4b.','11.01.2042'],['4c.','Stadt Musterstadt']];
    rows.forEach(([a,b],i)=>{g.fillStyle='#7a5a96';g.fillText(a,262,176+i*46);g.fillStyle='#2e1f40';g.font=(i===3||i===4?'700 ':'500 ')+'29px Poppins';g.fillText(b,330,176+i*46);g.font='500 29px Poppins';});
    g.fillStyle='rgba(46,31,64,0.75)';g.font='600 26px Poppins';g.fillText('9.  AM  B  L',262,470);licMuster(g,w,h,0.06);grain(g,w,h,5,17);});
  const am=ctex(256,160,(g2,w2,h2)=>{g2.fillStyle='#000';g2.fillRect(0,0,w2,h2);g2.fillStyle='#fff';roundRect(g2,0,0,w2,h2,14);g2.fill();});
  const front=std(0xffffff,0.36,0,{map:OT.tex,alphaMap:am.tex,transparent:true}),back=std(0xeae6ee,0.3,0,{map:NT.tex,alphaMap:am.tex,transparent:true});
  M(G,new RoundedBoxGeometry(W,Hh,0.0022,2,0.0012),std(0xe2c8d6,0.4));M(G,new THREE.PlaneGeometry(W-0.0006,Hh-0.0006),front,0,0,0.00112,false);
  const bp=M(G,new THREE.PlaneGeometry(W-0.0006,Hh-0.0006),back,0,0,-0.00112,false);bp.rotation.y=Math.PI;
  // highlight frame around the issue date on the old card (white, not red: red is the marker's colour)
  const hlT=ctex(512,128,(g,w,h)=>{g.strokeStyle='#ffffff';g.lineWidth=7;roundRect(g,6,6,w-12,h-12,22);g.stroke();});
  const hl=new THREE.Mesh(new THREE.PlaneGeometry(0.05,0.0125),new THREE.MeshBasicMaterial({map:hlT.tex,color:new THREE.Color(0xffffff).multiplyScalar(1.6),transparent:true,opacity:0,depthWrite:false}));hl.position.set(-0.0035,-0.0105,0.0013);G.add(hl);
  // a soft light sweep over the new card right after it has turned
  const sw=ctex(512,64,(g,w,h)=>{const L=g.createLinearGradient(0,0,w,0);L.addColorStop(0,'rgba(255,255,255,0)');L.addColorStop(0.45,'rgba(255,255,255,0)');L.addColorStop(0.5,'rgba(255,255,255,1)');L.addColorStop(0.55,'rgba(255,255,255,0)');L.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=L;g.fillRect(0,0,w,h);});
  sw.tex.wrapS=THREE.ClampToEdgeWrapping;sw.tex.repeat.set(0.5,1);
  const sheen=new THREE.Mesh(new THREE.PlaneGeometry(W-0.002,Hh-0.002),new THREE.MeshBasicMaterial({map:sw.tex,alphaMap:am.tex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));sheen.position.z=-0.0014;sheen.rotation.y=Math.PI;G.add(sheen);sw.tex.center.set(0.5,0.5);sw.tex.rotation=0.45;
  return {G,hl,sheen,sweep:sw.tex};}

// ------------------------------------------------------------------ 8: pension coin stack
export function mkCoinStack(scene,n=24){const G=new THREE.Group();scene.add(G);M(G,new THREE.CylinderGeometry(0.03,0.032,0.008,48),std(0x1b1c22,0.5,0.2),0,0.004,0);
  const r=rng(17);const coins=[];for(let i=0;i<n+1;i++){const c=mkCoin(0.0205,0.0031);c.castShadow=c.receiveShadow=true;c.position.set((r()-0.5)*0.0035,0.008+0.00165+i*0.0034,(r()-0.5)*0.0035);c.rotation.set((r()-0.5)*0.05,i*0.7,(r()-0.5)*0.05);G.add(c);coins.push(c);}return {G,coins,n};}

// ------------------------------------------------------------------ 9: envelope with the letter (flap on the front so the letter reads while it rises)
export function mkEnvelope(scene){const G=new THREE.Group();scene.add(G);const W=0.2,Hh=0.115;
  const env=ctex(900,518,(g,w,h)=>{g.fillStyle='#ece3cf';g.fillRect(0,0,w,h);grain(g,w,h,8,21);g.fillStyle='rgba(255,255,255,0.6)';roundRect(g,50,318,470,160,10);g.fill();g.strokeStyle='rgba(120,110,90,0.35)';g.lineWidth=3;roundRect(g,50,318,470,160,10);g.stroke();
    g.fillStyle='#2c2e35';g.font='700 38px Poppins';g.fillText('Einladung zur Musterung',74,382);g.fillStyle='#5b5e66';g.font='500 30px Poppins';g.fillText('Jahrgang 2008',74,434);
    g.strokeStyle='rgba(120,110,90,0.4)';g.lineWidth=2;roundRect(g,w-160,36,112,130,6);g.stroke();g.fillStyle='rgba(120,110,90,0.4)';g.font='600 21px Poppins';g.textAlign='center';g.fillText('Deutsche',w-104,96);g.fillText('Post',w-104,124);});
  const em=std(0xd4cec2,0.85,0,{map:env.tex});const eb=std(0xc9c0ad,0.9);
  M(G,new THREE.BoxGeometry(W,Hh,0.003),[eb,eb,eb,eb,em,eb]);
  const flapG=new THREE.Group();flapG.position.set(0,Hh/2,0.0017);G.add(flapG);const fs=new THREE.Shape();fs.moveTo(-W/2,0);fs.lineTo(W/2,0);fs.lineTo(0.012,-Hh*0.52);fs.quadraticCurveTo(0,-Hh*0.545,-0.012,-Hh*0.52);fs.closePath();
  const ft=ctex(256,128,(g,w,h)=>{g.fillStyle='#e6dcc5';g.fillRect(0,0,w,h);grain(g,w,h,8,24);});
  const flap=M(flapG,new THREE.ShapeGeometry(fs),new THREE.MeshStandardMaterial({color:0xcfc6b2,roughness:0.9,side:THREE.DoubleSide}));flap.position.z=0.0003;
  const L=paper(0.185,0.105,820,(g,w,h)=>{g.fillStyle='#fbfaf6';g.fillRect(0,0,w,h);grain(g,w,h,5,22);g.fillStyle='#2c2e35';g.font='700 46px Poppins';g.fillText('Musterung',50,90);
    g.fillStyle='#5b5e66';g.font='500 30px Poppins';g.fillText('Jahrgang 2008 · ab Juli 2027',50,142);g.fillStyle='rgba(30,30,35,0.15)';g.fillRect(50,170,w-100,2);
    g.fillStyle='#2c2e35';g.font='500 34px Poppins';g.fillText('Wehrdienst:',50,262);g.font='700 34px Poppins';g.fillText('freiwillig',260,262);g.strokeStyle='#2c2e35';g.lineWidth=4;g.strokeRect(w-170,222,52,52);
    for(let i=0;i<3;i++){g.fillStyle='rgba(40,40,46,0.10)';g.fillRect(50,320+i*40,w-140-(i%2)*160,12);}},{bend:0.0008});
  L.G.position.set(0,0,0);G.add(L.G);
  const tick=ctex(128,128,(g,w,h)=>{g.strokeStyle='#2c2e35';g.lineWidth=12;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(22,66);g.lineTo(52,96);g.lineTo(108,26);g.stroke();});
  const tm=new THREE.MeshBasicMaterial({map:tick.tex,transparent:true,opacity:0,depthWrite:false});const tk=new THREE.Mesh(new THREE.PlaneGeometry(0.0125,0.0125),tm);tk.position.set(0.0600,-0.0035,0.0012);L.G.add(tk);
  return {G,flapG,letter:L.G,tick:tm,H:Hh};}

// ------------------------------------------------------------------ 10b: a small shop counter and two private people
export function mkShop(scene){const G=new THREE.Group();scene.add(G);
  M(G,new RoundedBoxGeometry(0.2,0.075,0.075,2,0.004),std(0x353a46,0.6),0,0.0375,0);M(G,new THREE.BoxGeometry(0.21,0.006,0.085),std(0x23262e,0.5,0.2),0,0.078,0);
  const sign=ctex(512,112,(g,w,h)=>{g.fillStyle='#16161b';roundRect(g,0,0,w,h,14);g.fill();g.fillStyle='#f2efe8';g.font='700 56px Poppins';g.textAlign='center';g.fillText('Händler',w/2,76);});
  const sp=M(G,new THREE.PlaneGeometry(0.1,0.022),new THREE.MeshStandardMaterial({map:sign.tex,transparent:true,roughness:0.6}),0,0.045,0.0381,false);
  return {G};}
export function mkPerson(scene,col){const G=new THREE.Group();scene.add(G);const skin=std(0xd9b89a,0.7),c=std(col,0.75),dk=std(0x2b2d33,0.8);
  [-1,1].forEach(s=>M(G,new THREE.CylinderGeometry(0.0062,0.0055,0.05,14),dk,s*0.0072,0.025,0));
  const t=M(G,new THREE.CapsuleGeometry(0.0125,0.03,6,16),c,0,0.072,0);t.scale.set(1,1,0.72);
  M(G,new THREE.SphereGeometry(0.0115,24,16),skin,0,0.113,0);
  const arms=[-1,1].map(s=>{const A=new THREE.Group();A.position.set(s*0.016,0.088,0);G.add(A);M(A,new THREE.CylinderGeometry(0.0042,0.0038,0.038,10),c,0,-0.019,0);M(A,new THREE.SphereGeometry(0.0045,10,8),skin,0,-0.04,0);return A;});
  return {G,arms};}
