// =================================================================== timeline (voice: merz/voice/take1.mp3, natural speed, starts at 0.2 s)
const O=41.6,END=O+2.25;
const C=(tx,ty,tz,d,az,el)=>({t:[tx,ty,tz],d,az,el});
const SEG=[
 [0,2.3,C(-0.45,0.45,-0.1,22.6,36,39),C(-0.45,0.45,-0.1,21.8,37,39.5),'lin'],
 [2.3,5.4,C(-0.45,0.45,-0.1,21.8,37,39.5),C(-0.6,0.17,-1.4,2.6,28,38),'io'],
 [5.4,9.0,C(-0.6,0.17,-1.4,2.6,28,38),C(-0.6,0.21,-1.6,0.98,22,24),'io'],
 [9.0,10.8,C(-0.6,0.21,-1.6,0.98,22,24),C(-0.6,0.21,-1.6,0.92,20,23.5),'lin'],
 [10.8,12.3,C(-0.6,0.21,-1.6,0.92,20,23.5),C(0.62,0.42,1.25,4.4,10,20),'io'],
 [12.3,13.3,C(0.62,0.42,1.25,4.4,10,20),C(0.62,0.42,1.25,4.3,11,20.5),'lin'],
 [13.3,14.9,C(0.62,0.42,1.25,4.3,11,20.5),C(3.5,0.32,2.2,5.4,6,36),'io'],
 [14.9,22.5,C(3.5,0.32,2.2,5.4,6,36),C(3.5,0.36,2.15,5.0,4,35),'lin'],
 [22.5,23.6,C(3.5,0.36,2.15,5.0,4,35),C(-0.45,0.1,1.55,4.2,24,52),'io'],
 [23.6,25.9,C(-0.45,0.1,1.55,4.2,24,52),C(-0.45,0.1,1.5,4.0,26,54),'lin'],
 [25.9,27.4,C(-0.45,0.1,1.5,4.0,26,54),C(-3.6,0.3,-2.2,3.4,62,25),'io'],
 [27.4,31.0,C(-3.6,0.3,-2.2,3.4,62,25),C(-3.6,0.3,-2.2,3.2,64,26),'lin'],
 [31.0,32.8,C(-3.6,0.3,-2.2,3.2,64,26),C(-0.6,0.19,-1.48,1.6,24,30),'io'],
 [32.8,35.4,C(-0.6,0.19,-1.48,1.6,24,30),C(-0.6,0.21,-1.56,1.25,20,27),'lin'],
 [35.4,36.6,C(-0.6,0.21,-1.56,1.25,20,27),C(0.8,0.42,1.2,4.6,10,20),'io'],
 [36.6,38.3,C(0.8,0.42,1.2,4.6,10,20),C(0.8,0.42,1.2,4.45,11,20.5),'lin'],
 [38.3,39.8,C(0.8,0.42,1.2,4.45,11,20.5),C(-0.45,0.45,-0.1,22.0,40,40),'io'],
 [39.8,O,C(-0.45,0.45,-0.1,22.0,40,40),C(-0.45,0.45,-0.1,21.6,43,40),'lin'],
 [O,O+1.4,C(-0.45,0.45,-0.1,21.6,43,40),C(-0.6,2.3,-1.0,22,36,32),'io'],
 [O+1.4,END+0.1,C(-0.6,2.3,-1.0,22,36,32),C(-0.6,2.32,-1.0,21.8,36.4,32),'lin'],
];
//@@FOCUS_AND_CAM@@
const SUBS=[[0.28,1.95,'Nur zehn Prozent.'],[2.3,5.35,'So wenige waren im Oktober mit Kanzler Merz zufrieden.'],[5.5,9.05,'Schlechter stand im ARD-Deutschlandtrend noch kein Kanzler da.'],[9.25,10.85,'Nicht einmal Olaf Scholz.'],[11.0,13.3,'Im Mai waren es noch sechzehn Prozent.'],[13.4,14.7,'Aber warum?'],[14.85,17.2,'Im Wahlkampf stand Merz für die Schuldenbremse.'],[17.35,19.35,'Kurz nach der Wahl lockerte er sie,'],[19.45,22.5,'unter anderem für 500 Milliarden Euro neue Schulden.'],[22.75,25.9,'Fast zwei Drittel halten sein Handeln für unglaubwürdig.'],[26.05,27.4,'Dazu kommt die Wirtschaft:'],[27.45,31.1,'Sie wuchs 2025 nur um 0,2 Prozent.'],[31.3,33.5,'Also der unbeliebteste Kanzler?'],[33.7,35.5,'Laut Deutschlandtrend: ja.'],[35.65,38.2,'Auch wenn es im November wieder zwölf Prozent waren.'],[38.35,39.95,'Kann Merz das noch drehen?'],[40.07,O+0.3,'Schreib’s in die Kommentare.']];
const NUMS=[[0.12,5.38,'10 %','waren im Oktober mit Merz zufrieden'],[11.0,13.35,'16 %','waren es im Mai 2026'],[19.45,22.55,'500 Mrd. €','Sondervermögen auf Kredit (März 2025)'],[22.8,25.95,'64 %','halten sein Handeln für unglaubwürdig (Ipsos, Januar 2026)'],[27.45,31.1,'+0,2 %','Wirtschaftswachstum 2025 (Destatis)'],[36.7,38.3,'12 %','waren es im November 2026']];
const TITLES=[[5.5,9.1,'So unbeliebt war<br>noch kein Kanzler'],[9.2,10.95,'Nicht einmal<br>Olaf Scholz'],[13.4,14.75,'Aber warum?'],[14.85,17.25,'Im Wahlkampf: für<br>die Schuldenbremse'],[17.35,19.4,'Nach der Wahl:<br>gelockert'],[26.05,27.45,'Dazu kommt<br>die Wirtschaft'],[31.3,33.55,'Der unbeliebteste<br>Kanzler?'],[33.7,35.6,'Laut Deutschlandtrend:<br>ja.'],[38.35,O+0.1,'Kann Merz das<br>noch drehen?']];
const SRC='Quellen: ARD-Deutschlandtrend (Infratest dimap), Ipsos, Destatis, Deutscher Bundestag\nStand 17.11.2026 · Modell vereinfacht';
const titleEl=document.getElementById('title'),numEl=document.getElementById('num'),subEl=document.getElementById('sub'),srcEl=document.getElementById('src'),logoEl=document.getElementById('logo');srcEl.innerHTML=SRC.replace('\n','<br>');
const tags=[0,1,2,3].map(i=>document.getElementById('tag'+i));
function tag(i,txt,p,op,dx=0,dy=0){const e=tags[i];if(op<=0.01){e.style.opacity=0;return;}const q=proj(p);e.textContent=txt;const hw=e.offsetWidth/2+24;e.style.left=clamp(q[0]+dx,hw,W-hw)+'px';e.style.top=clamp(q[1]+dy,430,1330)+'px';e.style.opacity=op;}
const M4=new THREE.Matrix4(),CL=new THREE.Color();
const DOT_T0=1.05,DOT_T1=1.95,LSEED=[0.0,0.6,0.25,0.85,0.4,0.1,0.7,0.5];
function letterB(i,o){const u=o-0.85-i*0.1;if(u<0)return 0;const s=LSEED[i];let b;if(u<0.035)b=1;else if(u<0.1)b=0.1;else if(u<0.135)b=0.85;else if(u<0.2+s*0.04)b=0.22;else b=1;if(s>0.55&&u>0.42&&u<0.46)b=0.35;const land=o-DOT_T1;if(land>0)b*=1+0.4*Math.max(0,1-land/0.45);return b;}
const logoL=new THREE.DirectionalLight(RED,0);logoL.position.set(1.5,10,5);scene.add(logoL);
const DOORON=new THREE.Color(1.05,0.86,0.55);
function setTime(t){
  setCam(t);setFocus(t>=O?Math.max(0,1-ease((t-O-0.1)/0.5)):1-0.55*Math.max(win(t,4.8,11.5,0.8),win(t,31.4,35.6,0.8)));tags.forEach(e=>e.style.opacity=0);const o=t-O;const OF=k=>o>0?1-ease((o-0.08-k*0.55)/0.22):1;
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
  GRID.forEach(g=>{let k=clamp((t-0.05)/0.3,0,1);if(g.row<9)k*=1-ease((t-(0.72+g.row*0.085))/0.16);else k*=1+0.3*ease((t-1.55)/0.3);k*=OF(0.3)*(1-ease((t-22.55)/0.25));const ord=g.row*10+g.col;const kc=(ord<64?ease((t-(22.95+ord*0.022))/0.14):0)*OF(0.3);g.m.color.copy(hdr(0xffe2b0,0.1+2.8*k)).add(CL.copy(hdr(0xa9c6ff,2.6*kc)));g.h.material.color.copy(hdr(0xffe2b0,0.6*k)).add(CL.copy(hdr(0x9ec0ff,0.55*kc)));});
  // LED columns May 16 %, September 13 %, October 10 %
  COLS.forEach((c,i)=>{const u=eo((t-c.t0)/0.6);const h=Math.max(0.001,c.v*0.05*u);const pu=Math.max(0.001,ease((t-c.t0+0.15)/0.2));c.pl.scale.set(pu,1,pu);c.c.scale.y=h;c.cap.position.y=PAVE_H+0.03+h+0.01;const k=(t>c.t0?1:0)*OF(0.4);
    c.m.color.copy(hdr(0xcfe0ff,0.5*k));c.c.visible=c.cap.visible=u>0.005;c.cap.material.color.copy(hdr(0xffffff,2.4*k*u));c.p.material.opacity=0.6*k*u;
    tag(i,c.lab+' '+c.v+' %',[c.x,PAVE_H+0.03+h+0.17,c.z],Math.max(c.t0<30?win(t,c.t0+0.35,13.35,0.25):0,win(t,Math.max(35.95,c.t0+0.35),38.3,0.25)));});
  if(t>14.8&&t<19.0)tag(0,'Schuldenbremse',[BAR.x0+bar.L*0.5,PAVE_H+0.2,BAR.z],win(t,14.95,18.3),0,-26);
  if(t<10.9)tag(0,'Friedrich Merz',[rs.head[0],rs.head[1]+0.012,rs.head[2]],win(t,3.95,9.0),0,-44);
  // barrier lifts at "lockerte", five coin stacks grow behind it, warm light on the plaza
  {const a=ease((t-BAR.t0)/(BAR.t1-BAR.t0));bar.G.rotation.z=1.32*a;bar.leds.forEach((m,i)=>m.color.copy(hdr(LED,(0.2+2.4*(a<0.02?(Math.sin(t*6+i)>0?1:0.25):1))*OF(0.5))));bar.bm.emissiveIntensity=0.1+0.25*OF(0.5);updateDebt(t);bar.pool.material.opacity=0.85*clamp((t-DT0)/(DT1-DT0),0,1)*OF(0.5);}
  // factory: dim windows, the LED chart draws its almost flat line at "Sie wuchs nur um 0,2 Prozent"
  {const L=OF(0.6);fac.wins.forEach((w,j)=>w.m.color.copy(WOFF).lerp(w.col,L*(0.45+0.2*win(t,27.4,31.2,0.4)*(0.85+0.15*Math.sin(t*7+j)))));fac.wm.emissiveIntensity=0.12+0.2*L;const r=clamp((t-27.65)/1.5,0.001,1);fac.chart.scale.x=r;fac.chartTex.repeat.set(r,1);fac.chartM.color.setScalar(clamp((t-27.5)/0.3,0,1)*OF(0.6));}
  boat.position.set(-1.4+0.09*t,PAVE_H+0.006,(SPREE.z0+SPREE.z1)/2);
  // traffic
  AG.forEach(a=>{const Lp=a.path.L;const s=((a.s0+a.v*t)%Lp+Lp)%Lp;const p1=a.path.at((s+a.half)%Lp),p0=a.path.at((s-a.half+Lp)%Lp);a.G.position.set((p0[0]+p1[0])/2,0,(p0[2]+p1[2])/2);a.G.rotation.y=Math.atan2(-(p1[2]-p0[2]),p1[0]-p0[0]);
    if(a.legs){const ph=s/a.stride*6.2832;a.legs[0].rotation.z=0.55*Math.sin(ph);a.legs[1].rotation.z=-0.55*Math.sin(ph);a.G.position.y=PAVE_H+0.0022*Math.abs(Math.cos(ph));}});
  // overlay text
  const s=SUBS.find(q=>t>=q[0]&&t<q[1]);subEl.textContent=s?s[2]:'';subEl.style.opacity=s?Math.min(1,(t-s[0])/0.15+0.2)*clamp((O+0.3-t)/0.3,0,1):0;
  const nm=NUMS.find(q=>t>=q[0]&&t<q[1]);let nop=0;
  if(nm){let txt=nm[2];if(txt==='500 Mrd. €')txt=Math.round(500*eo((t-19.55)/2.3))+' Mrd. €';numEl.innerHTML=txt+'<small>'+nm[3]+'</small>';nop=Math.min(clamp((t-nm[0])/0.2,0,1),clamp((nm[1]-t)/0.2,0,1));numEl.style.transform=`scale(${1+0.06*(1-ease((t-nm[0])/0.35))})`;numEl.style.transformOrigin='0 0';}
  numEl.style.opacity=nop;const tt=TITLES.find(q=>t>=q[0]&&t<q[1]);if(tt){titleEl.innerHTML=tt[2];titleEl.style.opacity=Math.min(clamp((t-tt[0])/0.3,0,1),clamp((tt[1]-t)/0.2,0,1))*(1-nop);}else titleEl.style.opacity=0;
  srcEl.style.opacity=0.95*clamp((O+0.2-t)/0.3,0,1);logoEl.style.opacity=1-eo((t-O)/0.3);
}
