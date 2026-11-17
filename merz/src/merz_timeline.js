// =================================================================== timeline (voice: merz/voice/take1.mp3, natural speed, starts at 0.2 s; this test covers the first five sentences)
const O=13.6,END=O+2.25;
const C=(tx,ty,tz,d,az,el)=>({t:[tx,ty,tz],d,az,el});
const SEG=[
 [0,2.3,C(-0.45,0.45,-0.1,22.6,36,39),C(-0.45,0.45,-0.1,21.8,37,39.5),'lin'],
 [2.3,5.4,C(-0.45,0.45,-0.1,21.8,37,39.5),C(-0.6,0.17,-1.4,2.6,28,38),'io'],
 [5.4,9.0,C(-0.6,0.17,-1.4,2.6,28,38),C(-0.6,0.21,-1.6,0.98,22,24),'io'],
 [9.0,10.8,C(-0.6,0.21,-1.6,0.98,22,24),C(-0.6,0.21,-1.6,0.92,20,23.5),'lin'],
 [10.8,12.3,C(-0.6,0.21,-1.6,0.92,20,23.5),C(0.62,0.42,1.25,4.4,10,20),'io'],
 [12.3,O,C(0.62,0.42,1.25,4.4,10,20),C(0.62,0.42,1.25,4.25,11,20.5),'lin'],
 [O,O+1.4,C(0.62,0.42,1.25,4.25,11,20.5),C(-0.6,2.3,-1.0,22,36,32),'io'],
 [O+1.4,END+0.1,C(-0.6,2.3,-1.0,22,36,32),C(-0.6,2.32,-1.0,21.8,36.4,32),'lin'],
];
//@@FOCUS_AND_CAM@@
const SUBS=[[0.28,1.95,'Nur zehn Prozent.'],[2.3,5.35,'So wenige waren im Oktober mit Kanzler Merz zufrieden.'],[5.5,9.05,'Schlechter stand im ARD-Deutschlandtrend noch kein Kanzler da.'],[9.25,10.85,'Nicht einmal Olaf Scholz.'],[11.0,O+0.3,'Im Mai waren es noch sechzehn Prozent.']];
const NUMS=[[0.12,5.38,'10 %','waren im Oktober mit Merz zufrieden'],[11.0,O+0.1,'16 %','waren es im Mai 2026']];
const TITLES=[[5.5,9.1,'So unbeliebt war<br>noch kein Kanzler'],[9.2,10.95,'Nicht einmal<br>Olaf Scholz']];
const SRC='Quelle: ARD-Deutschlandtrend (Infratest dimap), Mai bis Oktober 2026\nStand 17.11.2026 · Modell vereinfacht';
const titleEl=document.getElementById('title'),numEl=document.getElementById('num'),subEl=document.getElementById('sub'),srcEl=document.getElementById('src'),logoEl=document.getElementById('logo');srcEl.innerHTML=SRC.replace('\n','<br>');
const tags=[0,1,2].map(i=>document.getElementById('tag'+i));
function tag(i,txt,p,op,dx=0,dy=0){const e=tags[i];if(op<=0.01){e.style.opacity=0;return;}const q=proj(p);e.textContent=txt;const hw=e.offsetWidth/2+24;e.style.left=clamp(q[0]+dx,hw,W-hw)+'px';e.style.top=clamp(q[1]+dy,430,1330)+'px';e.style.opacity=op;}
const M4=new THREE.Matrix4(),CL=new THREE.Color();
const DOT_T0=1.05,DOT_T1=1.95,LSEED=[0.0,0.6,0.25,0.85,0.4,0.1,0.7,0.5];
function letterB(i,o){const u=o-0.85-i*0.1;if(u<0)return 0;const s=LSEED[i];let b;if(u<0.035)b=1;else if(u<0.1)b=0.1;else if(u<0.135)b=0.85;else if(u<0.2+s*0.04)b=0.22;else b=1;if(s>0.55&&u>0.42&&u<0.46)b=0.35;const land=o-DOT_T1;if(land>0)b*=1+0.4*Math.max(0,1-land/0.45);return b;}
const logoL=new THREE.DirectionalLight(RED,0);logoL.position.set(1.5,10,5);scene.add(logoL);
const DOORON=new THREE.Color(1.05,0.86,0.55);
function setTime(t){
  setCam(t);setFocus(t>=O?Math.max(0,1-ease((t-O-0.1)/0.5)):1-0.55*win(t,4.8,11.5,0.8));tags.forEach(e=>e.style.opacity=0);const o=t-O;const OF=k=>o>0?1-ease((o-0.08-k*0.55)/0.22):1;
  {let lb=0;if(o>0){for(let i=0;i<8;i++)lb+=Math.min(1.3,letterB(i,o));lb/=8;}logoL.intensity=0.55*lb;const pk=o>0?lerp(1,0.3,ease(o/0.8)):1;PLED.forEach(([m,c])=>m.color.copy(c).multiplyScalar(pk));}
  BLD.forEach(b=>{const L=OF(b.order);b.L=L;b.ms.forEach(m=>m.emissiveIntensity=L*0.4*m.userData.k);if(b.roofM)b.roofM.emissiveIntensity=0.2+0.3*L;if(b.doorL)b.doorL.color.copy(hdr(0xffd9a0,0.12+2.6*L));b.pool.material.opacity=0.8*L;});
  PARKM.forEach(pm=>{pm.material.emissiveIntensity=0.06+0.42*OF(0.6);});
  WIN.forEach((w,i)=>{if(w.b.L>w.thr){if(w.tv){CL.setRGB(0.42,0.6,1.0).multiplyScalar(0.62+0.38*Math.sin(t*9+w.tv)*Math.sin(t*3.1+w.tv*2));winMesh.setColorAt(i,CL);}else winMesh.setColorAt(i,w.col);}else winMesh.setColorAt(i,WOFF);});winMesh.instanceColor.needsUpdate=true;
  SHOPS.forEach(s=>s.m.color.copy(WOFF).lerp(s.c,clamp(s.b.L,0,1)));AGM.forEach(m=>m.emissiveIntensity=lerp(0.24,0.44,OF(0.5)));
  SLAMPS.forEach(l=>{const q=OF(l.o);l.b.material.color.copy(hdr(l.col,0.12+3.4*q));l.p.material.opacity=0.62*q;});
  BOLL.forEach(l=>{const q=OF(0.5);l.b.material.color.copy(hdr(LED,0.1+3.0*q));l.p.material.opacity=0.55*q;});
  // Reichstag: floodlit sandstone and lit windows, warm hall light (dimmed while the spotlight is on Merz), spotlight from "Kanzler Merz" on
  {const L=OF(0.7);rs.AW.forEach((c,i)=>rs.winM.setColorAt(i,CL.copy(WOFF).lerp(c,clamp(L,0,1))));rs.winM.instanceColor.needsUpdate=true;rs.door.color.copy(WOFF).lerp(DOORON,L);
   SAND.emissiveIntensity=0.1+0.24*L;SAND2.emissiveIntensity=0.1+0.22*L;CUTM.emissiveIntensity=0.15+0.38*L;rs.domeLed.color.copy(hdr(LED,0.12+2.6*L));rs.domeGlass.emissiveIntensity=0.08+0.24*L;rs.eagle.color.setScalar(0.25+0.62*L);
   const sp=ease((t-3.75)/0.45)*OF(0.2);rs.spot.intensity=6.0*sp;rs.hall.intensity=0.55*L*(1-0.6*sp);rs.seatM.emissiveIntensity=0.18+0.25*L*(1-0.35*sp);}
  // the red speaking-time lamp on the lectern (red thread): glows all the time, gone once it has flown into the logo
  {const on=o>DOT_T0?0:1;rs.lampM.color.copy(hdr(RED,0.3+3.6*on*(0.82+0.18*Math.sin(t*5))));rs.lampH.material.opacity=on;rs.lampH.scale.setScalar(clamp(rs.lamp.getWorldPosition(V).distanceTo(cam.position)*0.018,0.035,0.4));}
  // 100 lights on the lawn: 90 go out row by row from the back, the front row of 10 stays on
  GRID.forEach(g=>{let k=clamp((t-0.05)/0.3,0,1);if(g.row<9)k*=1-ease((t-(0.72+g.row*0.085))/0.16);else k*=1+0.3*ease((t-1.55)/0.3);k*=OF(0.3);g.m.color.copy(hdr(0xffe2b0,0.1+2.8*k));g.h.material.color.copy(hdr(0xffe2b0,0.6*k));});
  // LED columns May 16 %, September 13 %, October 10 %
  COLS.forEach((c,i)=>{const u=eo((t-c.t0)/0.6);const h=Math.max(0.001,c.v*0.05*u);const pu=Math.max(0.001,ease((t-c.t0+0.15)/0.2));c.pl.scale.set(pu,1,pu);c.c.scale.y=h;c.cap.position.y=PAVE_H+0.03+h+0.01;const k=(t>c.t0?1:0)*OF(0.4);
    c.m.color.copy(hdr(0xcfe0ff,0.5*k));c.c.visible=c.cap.visible=u>0.005;c.cap.material.color.copy(hdr(0xffffff,2.4*k*u));c.p.material.opacity=0.6*k*u;
    tag(i,c.lab+' '+c.v+' %',[c.x,PAVE_H+0.03+h+0.17,c.z],win(t,c.t0+0.35,O-0.02,0.25));});
  if(t<10.9)tag(0,'Friedrich Merz',[rs.head[0],rs.head[1]+0.012,rs.head[2]],win(t,3.95,9.0),0,-44);
  boat.position.set(-1.4+0.09*t,PAVE_H+0.006,(SPREE.z0+SPREE.z1)/2);
  // traffic
  AG.forEach(a=>{const Lp=a.path.L;const s=((a.s0+a.v*t)%Lp+Lp)%Lp;const p1=a.path.at((s+a.half)%Lp),p0=a.path.at((s-a.half+Lp)%Lp);a.G.position.set((p0[0]+p1[0])/2,0,(p0[2]+p1[2])/2);a.G.rotation.y=Math.atan2(-(p1[2]-p0[2]),p1[0]-p0[0]);
    if(a.legs){const ph=s/a.stride*6.2832;a.legs[0].rotation.z=0.55*Math.sin(ph);a.legs[1].rotation.z=-0.55*Math.sin(ph);a.G.position.y=PAVE_H+0.0022*Math.abs(Math.cos(ph));}});
  // overlay text
  const s=SUBS.find(q=>t>=q[0]&&t<q[1]);subEl.textContent=s?s[2]:'';subEl.style.opacity=s?Math.min(1,(t-s[0])/0.15+0.2)*clamp((O+0.3-t)/0.3,0,1):0;
  const nm=NUMS.find(q=>t>=q[0]&&t<q[1]);let nop=0;
  if(nm){numEl.innerHTML=nm[2]+'<small>'+nm[3]+'</small>';nop=Math.min(clamp((t-nm[0])/0.2,0,1),clamp((nm[1]-t)/0.2,0,1));numEl.style.transform=`scale(${1+0.06*(1-ease((t-nm[0])/0.35))})`;numEl.style.transformOrigin='0 0';}
  numEl.style.opacity=nop;const tt=TITLES.find(q=>t>=q[0]&&t<q[1]);if(tt){titleEl.innerHTML=tt[2];titleEl.style.opacity=Math.min(clamp((t-tt[0])/0.3,0,1),clamp((tt[1]-t)/0.2,0,1))*(1-nop);}else titleEl.style.opacity=0;
  srcEl.style.opacity=0.95*clamp((O+0.2-t)/0.3,0,1);logoEl.style.opacity=1-eo((t-O)/0.3);
}
