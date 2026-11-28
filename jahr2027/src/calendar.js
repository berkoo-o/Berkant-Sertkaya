// the tear-off desk calendar: stand, page block, header bar and pages that curl, tear and fly away
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {clamp,lerp,ease,eo,ei,eio,ctex,grain,ringPath,strokePath,rng,REDS,INK} from './util.js';

export const PW=0.30,PH=0.36,TW=1024,TH=Math.round(1024*PH/PW),PY=0.20,PZ=0.0245;
const WD=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MN=['JANUAR','FEBRUAR','MÄRZ','APRIL','MAI','JUNI','JULI','AUGUST','SEPTEMBER','OKTOBER','NOVEMBER','DEZEMBER'];
function kw(d){const t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));const day=(t.getUTCDay()+6)%7;t.setUTCDate(t.getUTCDate()-day+3);const f=new Date(Date.UTC(t.getUTCFullYear(),0,4));return 1+Math.round(((t-f)/864e5-3+((f.getUTCDay()+6)%7))/7);}

function drawPaper(g,w,h,seed){g.fillStyle='#f2ede3';g.fillRect(0,0,w,h);const r=g.createRadialGradient(w*0.45,h*0.45,w*0.1,w*0.5,h*0.5,w*0.9);r.addColorStop(0,'rgba(255,255,255,0.18)');r.addColorStop(1,'rgba(120,100,70,0.10)');g.fillStyle=r;g.fillRect(0,0,w,h);grain(g,w,h,9,seed);}
function spaced(g,txt,x,y,sp){g.letterSpacing=sp+'px';g.fillText(txt,x,y);g.letterSpacing='0px';}

function drawDate(g,def,seed){const w=TW,h=TH;drawPaper(g,w,h,seed);const d=new Date(Date.UTC(2027,def.m,def.d));
  g.fillStyle='#1c1c22';g.fillRect(0,0,w,214);g.fillStyle='rgba(255,255,255,0.06)';g.fillRect(0,206,w,8);
  g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='#f4f1ea';g.font='800 100px "Inter Tight"';spaced(g,MN[def.m],w/2+5,142,10);
  g.font='600 40px Poppins';g.fillStyle='rgba(244,241,234,0.55)';g.textAlign='left';g.fillText('KW '+kw(d),48,134);g.textAlign='right';g.fillText('2027',w-48,134);
  g.textAlign='center';g.fillStyle=INK;g.font='800 610px "Inter Tight"';g.letterSpacing='-24px';g.fillText(String(def.d),w/2+8,872);g.letterSpacing='0px';
  g.font='500 86px Poppins';g.fillStyle='#45454d';g.fillText(WD[d.getUTCDay()],w/2,1010);
  g.fillStyle='rgba(23,23,28,0.16)';g.fillRect(90,1062,w-180,3);
  if(def.note){g.font='500 46px Poppins';g.fillStyle='#7a7a83';g.fillText(def.note,w/2,1146);}
  g.font='800 610px "Inter Tight"';g.letterSpacing='-24px';const m=g.measureText(String(def.d));g.letterSpacing='0px';return {cx:w/2+6,cy:652,rx:Math.max(250,m.width/2+95),ry:300};}
function drawCover(g){const w=TW,h=TH;g.fillStyle='#19191e';g.fillRect(0,0,w,h);const r=g.createRadialGradient(w*0.5,h*0.42,40,w*0.5,h*0.5,w*0.95);r.addColorStop(0,'rgba(255,255,255,0.07)');r.addColorStop(1,'rgba(0,0,0,0.25)');g.fillStyle=r;g.fillRect(0,0,w,h);grain(g,w,h,7,11);
  g.textAlign='center';g.fillStyle='rgba(239,234,224,0.5)';g.font='600 42px Poppins';spaced(g,'KALENDER',w/2+9,420,18);
  g.fillStyle='#efeae0';g.font='800 330px "Inter Tight"';g.letterSpacing='-10px';g.fillText('2027',w/2+5,760);g.letterSpacing='0px';
  g.fillStyle='rgba(239,234,224,0.22)';g.fillRect(w/2-150,830,300,3);g.fillStyle='rgba(239,234,224,0.45)';g.font='500 40px Poppins';g.fillText('365 Tage',w/2,910);}
function drawBlank(g){drawPaper(g,TW,TH,23);g.strokeStyle='rgba(60,70,90,0.07)';g.lineWidth=2;for(let y=120;y<TH-60;y+=64){g.beginPath();g.moveTo(70,y);g.lineTo(TW-70,y);g.stroke();}}

export function buildCalendar(scene,shadowLight){
  const CAL=new THREE.Group();scene.add(CAL);
  const dark=new THREE.MeshStandardMaterial({color:0x1d1d23,roughness:0.55,metalness:0.15});
  const darker=new THREE.MeshStandardMaterial({color:0x141418,roughness:0.6,metalness:0.1});
  // base plate on the desk
  const base=new THREE.Mesh(new RoundedBoxGeometry(0.38,0.014,0.16,3,0.006),darker);base.position.set(0,0.007,-0.01);base.castShadow=base.receiveShadow=true;CAL.add(base);
  const TG=new THREE.Group();TG.position.set(0,0.012,0.03);TG.rotation.x=-0.16;CAL.add(TG);
  const back=new THREE.Mesh(new RoundedBoxGeometry(0.345,0.44,0.01,3,0.004),dark);back.position.set(0,0.22,-0.006);back.castShadow=back.receiveShadow=true;TG.add(back);
  // page block with paper edges
  const edge=ctex(64,512,(g,w,h)=>{g.fillStyle='#e9e3d8';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=3){g.fillStyle=`rgba(90,80,65,${0.10+0.08*Math.random()})`;g.fillRect(0,y,w,1);}});
  const edgeM=new THREE.MeshStandardMaterial({map:edge.tex,roughness:0.95});const topM=new THREE.MeshStandardMaterial({color:0xece6db,roughness:0.95});
  const edgeV=ctex(512,64,(g,w,h)=>{g.fillStyle='#e9e3d8';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=3){g.fillStyle=`rgba(90,80,65,${0.10+0.08*Math.random()})`;g.fillRect(x,0,1,h);}});
  const edgeMV=new THREE.MeshStandardMaterial({map:edgeV.tex,roughness:0.95});
  const block=new THREE.Mesh(new THREE.BoxGeometry(PW,PH,0.024),[edgeMV,edgeMV,topM,edgeM,topM,topM]);block.position.set(0,PY,0.012);block.castShadow=block.receiveShadow=true;TG.add(block);
  // header bar that holds the pages
  const hb=ctex(1024,176,(g,w,h)=>{g.fillStyle='#202027';g.fillRect(0,0,w,h);grain(g,w,h,6,5);g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(0,0,w,3);
    g.fillStyle='rgba(255,255,255,0.32)';g.font='600 46px Poppins';g.textAlign='center';spaced(g,'2027',w/2+7,108,14);});
  const hbM=new THREE.MeshStandardMaterial({map:hb.tex,roughness:0.5,metalness:0.2});
  const head=new THREE.Mesh(new RoundedBoxGeometry(0.325,0.056,0.042,3,0.008),[dark,dark,dark,dark,hbM,dark]);head.position.set(0,PY+PH/2+0.026,0.016);head.castShadow=head.receiveShadow=true;TG.add(head);
  // fix the front face of the rounded header to the label material (RoundedBox has one group, so add a thin label plane instead)
  head.material=dark;const lab=new THREE.Mesh(new THREE.PlaneGeometry(0.30,0.05),hbM);lab.position.set(0,PY+PH/2+0.026,0.0372);TG.add(lab);
  // two metal rivets
  [-0.12,0.12].forEach(x=>{const r=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.004,20),new THREE.MeshStandardMaterial({color:0x9a9ca3,metalness:0.9,roughness:0.3}));r.rotation.x=Math.PI/2;r.position.set(x,PY+PH/2+0.026,0.038);TG.add(r);});

  // ---------------------------------------------------------------- pages
  const DEFS=[{kind:'cover'},{d:1,m:0,note:'Neujahr'},{d:19,m:0},{d:1,m:1},{d:12,m:2},{d:6,m:3},{d:20,m:4},{d:14,m:5},{d:1,m:6},{d:10,m:6},{d:31,m:11,note:'Silvester'}];
  const backM=new THREE.MeshStandardMaterial({color:0xdcd5c8,roughness:0.97,side:THREE.BackSide});
  const pages=DEFS.map((def,i)=>{const small=i>=3&&i<=7;const w=small?512:TW,h=small?Math.round(512*TH/TW):TH;
    const base=document.createElement('canvas');base.width=w;base.height=h;const bg=base.getContext('2d');let ring=null;
    if(small){bg.scale(0.5,0.5);}
    if(def.kind==='cover')drawCover(bg);else if(def.kind==='blank')drawBlank(bg);else ring=drawDate(bg,def,31+i);
    const live=ctex(w,h,(g)=>g.drawImage(base,0,0));
    const geo=new THREE.PlaneGeometry(PW,PH,22,28);const P0=geo.attributes.position.array.slice();
    const front=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:live.tex,color:0xcdc8bf,roughness:0.88}));const backm=new THREE.Mesh(geo,backM);
    const G=new THREE.Group();G.add(front);G.add(backm);G.position.set(0,PY,PZ);front.castShadow=true;front.receiveShadow=true;backm.castShadow=true;TG.add(G);
    return {i,def,base,live,geo,P0,G,front,T:1e9,dur:0.8,strokes:[],draws:[],key:'',ring,scale:small?0.5:1};});
  function setTear(i,T,dur){pages[i].T=T;pages[i].dur=dur;}
  // curl: roll the page around a cylinder whose axis sweeps from the bottom right corner to the top left
  const nx=PW*0.55,ny=PH,nl=Math.hypot(nx,ny),N=[nx/nl,ny/nl],DMAX=PW*N[0]+PH*N[1];
  function curl(pg,s,R){const a=pg.geo.attributes.position.array,P0=pg.P0;
    for(let k=0;k<a.length;k+=3){const u=P0[k]+PW/2,v=PH/2-P0[k+1];const d=u*N[0]+v*N[1];let dd=d,z=0;const r=d-s;
      if(r>0){const ph=r/R;if(ph<=Math.PI){dd=s+R*Math.sin(ph);z=R*(1-Math.cos(ph));}else{dd=s-(r-Math.PI*R);z=2*R;}}
      const du=(d-dd);a[k]=u-N[0]*du-PW/2;a[k+1]=PH/2-(v-N[1]*du);a[k+2]=z;}
    pg.geo.attributes.position.needsUpdate=true;pg.geo.computeVertexNormals();}
  function flat(pg){if(pg.isFlat)return;pg.geo.attributes.position.array.set(pg.P0);pg.geo.attributes.position.needsUpdate=true;pg.geo.computeVertexNormals();pg.isFlat=true;}
  // live drawing on a page: strokes (ring, lines) and custom draw functions, all pure functions of t
  function redraw(pg,t){let key='';const act=[];
    for(const s of pg.strokes){if(t>s.t0){const u=clamp((t-s.t0)/(s.t1-s.t0),0,1);key+=u.toFixed(3)+'|';act.push([s,u]);}}
    for(const d of pg.draws){const k=d.key(t);if(k!==null){key+=k+'|';act.push([d,null]);}}
    if(key===pg.key)return;pg.key=key;const g=pg.live.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,pg.live.c.width,pg.live.c.height);g.drawImage(pg.base,0,0);g.scale(pg.scale,pg.scale);
    for(const [s,u] of act){if(u!==null)strokePath(g,s.P,u,s.o);else s.draw(g,t);}g.setTransform(1,0,0,1,0,0);pg.live.tex.needsUpdate=true;}
  function addRing(i,t0,t1,seed=3,o={}){const pg=pages[i];const r=pg.ring;const P=ringPath(r.cx,r.cy,r.rx,r.ry,seed);pg.strokes.push({P,t0,t1,o:{color:REDS,width:30,alpha:0.92,core:0.25,...o}});return P;}
  const TL=new THREE.Vector3();
  function pagePoint(px,py,lift=0.002){TL.set((px/TW-0.5)*PW,PY+(0.5-py/TH)*PH,PZ+lift);TG.updateMatrixWorld();return TL.clone().applyMatrix4(TG.matrixWorld);}
  function update(t){let top=pages.length-1;for(let i=0;i<pages.length;i++){if(t<pages[i].T){top=i;break;}}
    pages.forEach((pg,i)=>{if(i===top){pg.G.visible=true;flat(pg);pg.G.position.set(0,PY,PZ);pg.G.rotation.set(0,0,0);pg.G.scale.setScalar(1);redraw(pg,t);return;}
      const u=(t-pg.T)/pg.dur;if(i<top&&u<1&&u>=0){pg.G.visible=true;pg.isFlat=false;redraw(pg,t);
        const uc=clamp(u/0.62,0,1);const s=lerp(DMAX*1.02,DMAX*0.14,eio(uc))-Math.max(0,u-0.55)*DMAX*1.3;const R=lerp(0.018,0.06,ease(u*1.2));curl(pg,s,R);
        const f=ei(clamp((u-0.42)/0.58,0,1));pg.G.position.set(0.30*f,PY+0.42*f+0.02*Math.sin(u*9)*f,PZ+0.0006+0.32*f);pg.G.rotation.set(-0.9*f,0.45*f,-0.55*f);return;}
      pg.G.visible=false;});
    return top;}
  return {CAL,TG,pages,setTear,addRing,pagePoint,update,DEFS};
}
