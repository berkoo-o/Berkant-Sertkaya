// =================================================================== helpers for lamps and lit windows
const hillH=()=>0,hillN=()=>new THREE.Vector3(0,1,0);
const wpos=(o,p)=>{const v=new THREE.Vector3(...p);o.updateWorldMatrix(true,false);o.localToWorld(v);return [v.x,v.y,v.z];};
//@@LAMPHELPERS@@
// =================================================================== REICHSTAG, cut open like a dollhouse: sandstone shell without a roof over the hall, four corner towers, portico with six columns,
// the back half of the glass dome (the front half is cut away), plenary hall with 630 seats, eagle wall, presidium, government benches, visitors' galleries,
// the lectern with the red speaking-time lamp (the red thread of this video) and a small figure of Friedrich Merz
const RS={x:-0.6,z:-1.15,w:3.4,d:2.4};const rs={};
const SAND=new THREE.MeshStandardMaterial({color:0xd9ccb2,roughness:.85,emissive:0xb9ab92,emissiveIntensity:.32});
const SAND2=new THREE.MeshStandardMaterial({color:0xbcae94,roughness:.88,emissive:0x9c8f76,emissiveIntensity:.3});
const CUTM=new THREE.MeshStandardMaterial({color:0xf1e9d8,roughness:.8,emissive:0xe2d8c4,emissiveIntensity:.5});
const eagleTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const cx=256;g.fillStyle='#979ca6';
  for(const s of [-1,1]){g.beginPath();g.moveTo(cx+s*40,170);g.quadraticCurveTo(cx+s*120,70,cx+s*236,112);const tips=6;
    for(let i=0;i<tips;i++){const u=i/(tips-1);const tx=cx+s*lerp(238,92,u),ty=lerp(150,338,u);const nx=cx+s*lerp(214,84,u+0.5/(tips-1)),ny=lerp(140,318,u+0.5/(tips-1));
      g.quadraticCurveTo(tx+s*10,ty-6,tx,ty+14);if(i<tips-1)g.lineTo(nx,ny);}
    g.lineTo(cx+s*50,300);g.closePath();g.fill();}
  g.beginPath();g.ellipse(cx,248,64,98,0,0,7);g.fill();
  g.beginPath();g.arc(cx+6,126,40,0,7);g.fill();
  g.beginPath();g.moveTo(cx-24,112);g.quadraticCurveTo(cx-74,112,cx-70,140);g.lineTo(cx-56,134);g.lineTo(cx-30,146);g.closePath();g.fill();
  g.beginPath();g.moveTo(cx-46,330);g.lineTo(cx+46,330);g.lineTo(cx+74,410);for(let i=0;i<5;i++){const x0=cx+74-i*29.6;g.quadraticCurveTo(x0-15,428,x0-29.6,410);}g.closePath();g.fill();
  for(const s of [-1,1]){g.fillRect(cx+s*30-9,322,18,52);for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(cx+s*30+k*10-5,370);g.lineTo(cx+s*30+k*13,394);g.lineTo(cx+s*30+k*10+5,370);g.fill();}}
  g.fillStyle='#d9dadf';g.beginPath();g.arc(cx-14,116,6,0,7);g.fill();});
function mkMerz(par,x,y,z){const G=new THREE.Group();G.position.set(x,y,z);par.add(G);
  const MS=(c,e,i=.5,r=.7)=>new THREE.MeshStandardMaterial({color:c,roughness:r,emissive:e,emissiveIntensity:i});
  const suit=MS(0x27355a,0x1d2944),lap=MS(0x324472,0x253458),skin=MS(0xe8c6aa,0x8f6c58,.35,.65),hairM=MS(0xbdbdb8,0x75756f,.35,.85),shirt=MS(0xf4f4f2,0xbdbdbb,.4,.6),tie=MS(0x2e4c9a,0x1d3270,.5,.5),shoe=MS(0x1a1b1f,0x0e0f11,.3,.5);
  const body=new THREE.Group();G.add(body);
  for(const s of [-1,1]){mesh(body,new THREE.CylinderGeometry(0.0062,0.0052,0.056,10),suit,s*0.0068,0.028,0);box(body,0.0085,0.005,0.015,shoe,s*0.0068,0.0025,0.002,false);}
  {const g=new THREE.CylinderGeometry(0.0146,0.0118,0.034,22);g.scale(1,1,0.62);mesh(body,g,suit,0,0.073,0);}
  {const g=new THREE.CapsuleGeometry(0.0064,0.016,6,12);g.rotateZ(Math.PI/2);g.scale(1,1,0.82);mesh(body,g,suit,0,0.0872,-0.0004);}
  {const v=new THREE.Shape();v.moveTo(-0.0052,0);v.lineTo(0.0052,0);v.lineTo(0,-0.0165);v.closePath();mesh(body,new THREE.ShapeGeometry(v),shirt,0,0.0912,0.0094,false,false);
   mesh(body,new THREE.BoxGeometry(0.0026,0.0135,0.001),tie,0,0.0838,0.0099,false,false);mesh(body,new THREE.BoxGeometry(0.0034,0.0022,0.0012),tie,0,0.0903,0.0099,false,false);
   for(const sd of [-1,1]){const l=new THREE.Shape();l.moveTo(sd*0.0052,0);l.lineTo(sd*0.0104,-0.0045);l.lineTo(sd*0.0014,-0.0175);l.closePath();const m=mesh(body,new THREE.ShapeGeometry(l),lap,0,0.0912,0.0097,false,false);m.rotation.y=sd*0.18;}}
  mesh(body,new THREE.CylinderGeometry(0.0041,0.0045,0.008,12),skin,0,0.0938,0);
  // arms in the root group (not in the swaying body), hands resting on the tilted lectern top; elbow from a two-bone solve
  const arms=[];{const th=0.22,c=Math.cos(th),sn=Math.sin(th),S=0.78,ZM=-0.432,hz=-0.4145,hx=0.0155;const ptop=z=>{const lz=(z+0.40-0.0025*sn)/c;return 0.044+0.0025*c-lz*sn;};
   for(const s of [-1,1]){const H=new THREE.Vector3(s*hx/S,(ptop(hz)+0.0029*S+0.0003)/S,(hz-ZM)/S);const wz=hz-0.0032*S*c;const Wp=new THREE.Vector3(s*(hx/S-0.0004),(ptop(wz)+0.0032*S+0.0005)/S,(wz-ZM)/S);
    // elbow beside the body, slightly out and back (searched so the forearm clears the raised back edge of the lectern top)
    const Sh=new THREE.Vector3(s*0.0152,0.0872,0),E=new THREE.Vector3(s*0.0246,0.0711,0.0039);
    const A=new THREE.Group();G.add(A);
    mesh(A,mergeGeometries([rodGeo(Sh.toArray(),E.toArray(),0.0041,10),rodGeo(E.toArray(),Wp.toArray(),0.0032,10),new THREE.SphereGeometry(0.0038,12,8).translate(E.x,E.y,E.z),new THREE.SphereGeometry(0.0032,10,8).translate(Wp.x,Wp.y,Wp.z)]),suit,0,0,0,true,false);
    const hm=mesh(A,new THREE.CapsuleGeometry(0.0029,0.004,4,8),skin,H.x,H.y,H.z,true,false);hm.rotation.x=Math.PI/2+th;arms.push(A);}}
  const head=new THREE.Group();head.position.set(0,0.1035,0);body.add(head);
  {// one smooth head: ellipsoid with a slightly narrower, longer chin (no separate jaw sphere, so no hard seam across the face)
   const g=new THREE.SphereGeometry(0.0078,48,36);g.scale(0.9,1.16,1.0);{const P=g.attributes.position;for(let k=0;k<P.count;k++){const y=P.getY(k)/0.00905;if(y<0){const q=y*y;P.setX(k,P.getX(k)*(1-0.12*q));P.setY(k,P.getY(k)*(1+0.06*q));P.setZ(k,P.getZ(k)*(1-0.05*q)+0.0006*q*Math.max(0,P.getZ(k))/0.0078);}}g.computeVertexNormals();}mesh(head,g,skin,0,0,0,true,false);
   const nose=new THREE.SphereGeometry(0.0016,10,8);nose.scale(0.75,1.25,1.0);mesh(head,nose,skin,0,-0.0006,0.0079,false,false);
   const hg=new THREE.SphereGeometry(0.0075,24,10,Math.PI*0.97,Math.PI*1.06,Math.PI*0.4,Math.PI*0.3);hg.scale(0.95,1.16,1.05);mesh(head,hg,hairM,0,0,0,false,false);
   for(const sd of [-1,1]){const e=new THREE.SphereGeometry(0.0019,8,6);e.scale(0.5,1,0.8);mesh(head,e,skin,sd*0.0071,-0.0004,-0.0004,false,false);
     const br=mesh(head,new THREE.BoxGeometry(0.0034,0.0006,0.0008),hairM,sd*0.0028,0.0031,0.0074,false,false);br.rotation.z=-sd*0.12;}
   const gm=new THREE.MeshStandardMaterial({color:0xe6eef8,roughness:.1,metalness:.3,emissive:0xa9bdd2,emissiveIntensity:.55,transparent:true,opacity:.75});const fm=MS(0x9aa2ae,0x5c6270,.4,.4);
   for(const sd of [-1,1]){mesh(head,new THREE.CircleGeometry(0.0023,16),gm,sd*0.0029,0.0013,0.0083,false,false);mesh(head,new THREE.BoxGeometry(0.0004,0.0004,0.0074),fm,sd*0.0056,0.0016,0.0045,false,false);}
   mesh(head,new THREE.BoxGeometry(0.0013,0.0004,0.0004),fm,0,0.0017,0.0085,false,false);
   mesh(head,new THREE.BoxGeometry(0.0032,0.0005,0.0006),MS(0xb07a6a,0x6a4038,.35,.6),0,-0.0047,0.0069,false,false);}
  G.userData={body,head,arms};return G;}
{const G=new THREE.Group();G.position.set(RS.x,0,RS.z);town.add(G);rs.G=G;const hw=RS.w/2,hd=RS.d/2,T=0.12,WH=0.58,B0=0.07,FL=B0+0.02,BZ=-0.74;
 box(G,RS.w+0.1,B0,RS.d+0.1,SAND2,0,B0/2,0);
 const wall=(w,d,x,z)=>{box(G,w,WH-B0,d,SAND,x,B0+(WH-B0)/2,z);box(G,w+0.006,0.014,d+0.006,CUTM,x,WH+0.007,z,false);};
 wall(RS.w,T,0,hd-T/2);wall(RS.w,T,0,-hd+T/2);wall(T,RS.d-2*T,hw-T/2,0);wall(T,RS.d-2*T,-hw+T/2,0);
 {const g=rrSlab(RS.w+0.04,RS.d+0.04,0.005,0.03,0.05);g.translate(0,WH-0.07,0);mesh(G,g,SAND2,0,0,0);}
 // block behind the eagle wall (the only part with a roof), the dome sits on its front edge
 box(G,RS.w-2*T,WH-B0,(BZ)-(-hd+T),SAND,0,B0+(WH-B0)/2,(BZ+(-hd+T))/2);box(G,RS.w-2*T,0.014,0.02,CUTM,0,WH+0.007,BZ-0.01,false);
 // corner towers
 for(const sx of [-1,1])for(const sz of [-1,1]){const x=sx*(hw-0.2),z=sz*(hd-0.2);box(G,0.46,0.86-B0,0.46,SAND,x,B0+(0.86-B0)/2,z);box(G,0.5,0.035,0.5,SAND2,x,0.86,z);box(G,0.36,0.05,0.36,SAND2,x,0.9,z);}
 // arched windows on all facades and towers (instanced, lit from inside)
 const archS=new THREE.Shape();archS.moveTo(-0.032,0);archS.lineTo(0.032,0);archS.lineTo(0.032,0.07);archS.absarc(0,0.07,0.032,0,Math.PI,false);archS.lineTo(-0.032,0);
 const AW=[];const addW=(x,y,z,ry)=>AW.push([x,y,z,ry]);
 for(const y of [0.13,0.34]){for(let x=-hw+0.5;x<=hw-0.5+1e-6;x+=0.17){if(Math.abs(x)<0.62)continue;addW(x,y,hd+0.002,0);addW(x,y,-hd-0.002,Math.PI);}
   for(let z=-hd+0.48;z<=hd-0.48+1e-6;z+=0.17){addW(hw+0.002,y,z,Math.PI/2);addW(-hw-0.002,y,z,-Math.PI/2);}}
 for(const sx of [-1,1])for(const sz of [-1,1]){const x=sx*(hw-0.2),z=sz*(hd-0.2);for(const y of [0.2,0.52]){addW(x,y,z+sz*0.232,sz>0?0:Math.PI);addW(x+sx*0.232,y,z,sx>0?Math.PI/2:-Math.PI/2);}}
 rs.winM=new THREE.InstancedMesh(new THREE.ShapeGeometry(archS),new THREE.MeshBasicMaterial({color:0xffffff}),AW.length);
 {const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler();AW.forEach((w,i)=>{E.set(0,w[3],0);Q.setFromEuler(E);M.compose(new THREE.Vector3(w[0],w[1],w[2]),Q,new THREE.Vector3(1,1,1));rs.winM.setMatrixAt(i,M);rs.winM.setColorAt(i,new THREE.Color(0,0,0));});G.add(rs.winM);}
 rs.AW=AW.map(()=>{const k=0.85+0.3*rnd2();return new THREE.Color(1.0*k,0.8*k,0.5*k);});
 // portico: steps, six columns, entablature, pediment, lit entrance
 {const pz=hd;box(G,1.3,0.035,0.42,SAND2,0,0.0175,pz+0.17);box(G,1.2,0.035,0.34,SAND2,0,0.0525,pz+0.13);box(G,1.12,0.03,0.28,SAND,0,0.085,pz+0.1);
  const colG=new THREE.CylinderGeometry(0.03,0.034,0.4,14);for(let i=0;i<6;i++)mesh(G,colG,SAND,-0.45+i*0.18,0.3,pz+0.15);
  box(G,1.06,0.06,0.22,SAND,0,0.53,pz+0.1);
  {const s=new THREE.Shape();s.moveTo(-0.55,0);s.lineTo(0.55,0);s.lineTo(0,0.17);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:0.22,bevelEnabled:false});g.translate(0,0,-0.11);mesh(G,g,SAND2,0,0.56,pz+0.1);}
  rs.door=new THREE.MeshBasicMaterial({color:0x101114});const dp=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.3),rs.door);dp.position.set(0,0.25,pz+0.003);G.add(dp);}
 // the back half of the glass dome with ribs, the cut edge, an LED ring at its foot and the mirror funnel
 {const R=0.5,cz=BZ,y0=WH+0.02;const gm=new THREE.MeshStandardMaterial({color:0xbfd6ff,roughness:.1,metalness:.2,transparent:true,opacity:.16,emissive:0x5a7aa8,emissiveIntensity:.3,side:THREE.DoubleSide,depthWrite:false});
  const glass=new THREE.Mesh(new THREE.SphereGeometry(R,40,16,Math.PI,Math.PI,0,Math.PI/2),gm);glass.position.set(0,y0,cz);glass.renderOrder=3;G.add(glass);rs.domeGlass=gm;
  const rm=new THREE.MeshStandardMaterial({color:0xd5d9e0,roughness:.4,metalness:.5,emissive:0x8a92a0,emissiveIntensity:.35});const RG=[];const sp=(ph,th,r=R)=>new THREE.Vector3(-r*Math.cos(ph)*Math.sin(th),y0+r*Math.cos(th),cz+r*Math.sin(ph)*Math.sin(th));
  for(let i=0;i<=12;i++){const ph=Math.PI+i/12*Math.PI;const pts=[];for(let k=0;k<=16;k++)pts.push(sp(ph,k/16*Math.PI/2));RG.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,0.006,5,false));}
  for(const th of [0.38,0.78,1.15]){const pts=[];for(let k=0;k<=24;k++)pts.push(sp(Math.PI+k/24*Math.PI,th));RG.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),32,0.005,5,false));}
  mesh(G,mergeGeometries(RG),rm,0,0,0,false,false);
  mesh(G,new THREE.CylinderGeometry(R+0.02,R+0.03,0.05,40,1,true,Math.PI/2,Math.PI),SAND2,0,y0-0.005,cz);
  {const pts=[];for(let k=0;k<=32;k++){const a=k/32*Math.PI;pts.push(new THREE.Vector3(R*Math.cos(a),y0+R*Math.sin(a),cz));}mesh(G,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,0.008,6,false),CUTM,0,0,0,false,false);}
  {const pts=[];for(let k=0;k<=32;k++)pts.push(sp(Math.PI+k/32*Math.PI,Math.PI/2,R+0.035));pts.forEach(p=>p.y=y0+0.022);rs.domeLed=glowMat(LED,0);mesh(G,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,0.007,6,false),rs.domeLed,0,0,0,false,false);}
  const fm=new THREE.MeshStandardMaterial({color:0xe6ecf5,roughness:.3,metalness:.3,emissive:0xa8b4c8,emissiveIntensity:.55,side:THREE.DoubleSide});const fn=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.035,0.36,24,1,true,Math.PI/2,Math.PI),fm);fn.position.set(0,y0+0.21,cz);G.add(fn);}
 // plenary hall: carpet, eagle wall, presidium, lectern, government benches, galleries
 const CARPET=new THREE.MeshStandardMaterial({color:0x8a90a0,roughness:.95,emissive:0x5c6272,emissiveIntensity:.3});
 box(G,RS.w-2*T,0.02,hd-T-BZ,CARPET,0,B0+0.01,(hd-T+BZ)/2,false);
 box(G,1.5,0.46,0.012,new THREE.MeshStandardMaterial({color:0xdfe0e4,roughness:.8,emissive:0xb9bbc2,emissiveIntensity:.22}),0,B0+0.25,BZ+0.006,false);
 rs.eagle=new THREE.MeshBasicMaterial({map:eagleTex,transparent:true,color:0xdddddd});{const e=new THREE.Mesh(new THREE.PlaneGeometry(0.44,0.44),rs.eagle);e.position.set(0,B0+0.27,BZ+0.014);G.add(e);}
 const DESK=new THREE.MeshStandardMaterial({color:0x9ba3b4,roughness:.6,emissive:0x6a7282,emissiveIntensity:.35});
 box(G,0.95,0.04,0.16,new THREE.MeshStandardMaterial({color:0x6d7484,roughness:.8,emissive:0x474d5a,emissiveIntensity:.35}),0,FL+0.02,BZ+0.09,true);box(G,0.8,0.055,0.05,DESK,0,FL+0.04+0.0275,BZ+0.13,true);
 const LECT=new THREE.MeshStandardMaterial({color:0xc8ccd5,roughness:.55,emissive:0x8c919c,emissiveIntensity:.35});
 box(G,0.052,0.042,0.034,LECT,0,FL+0.021,-0.40,true);{const tp=box(G,0.058,0.005,0.04,LECT,0,FL+0.044,-0.40,false);tp.rotation.x=0.22;}box(G,0.054,0.004,0.036,mat(0x8d939c,.5,.3),0,FL+0.002,-0.40,false);
 for(const s of [-1,1]){mesh(G,rodGeo([s*0.008,FL+0.046,-0.388],[s*0.004,FL+0.07,-0.405],0.0005,4),mat(0x1c1d21,.5,.4),0,0,0,false,false);mesh(G,new THREE.SphereGeometry(0.0015,6,5),mat(0x1c1d21,.5,.4),s*0.004,FL+0.0705,-0.405,false,false);}
 // the red speaking-time lamp on the lectern
 {const lamp=new THREE.Group();lamp.position.set(0.02,FL+0.048,-0.386);G.add(lamp);rs.lampM=glowMat(RED,3);mesh(lamp,new THREE.SphereGeometry(0.003,12,10),rs.lampM,0,0,0,false,false);rs.lampH=halo(lamp,RED,1.2,0.06);rs.lamp=lamp;}
 rs.merz=mkMerz(G,0,FL,-0.432);rs.merz.scale.setScalar(0.78);
 box(G,0.05,0.035,0.55,DESK,1.06,FL+0.0175,-0.47,true);box(G,0.05,0.035,0.55,DESK,-1.06,FL+0.0175,-0.47,true);
 for(const s of [-1,1]){box(G,0.14,0.02,1.7,SAND2,s*(hw-T-0.07),0.35,0.16,true);box(G,0.01,0.05,1.7,CUTM,s*(hw-T-0.145),0.38,0.16,false);}
 // seats: 630 in eight arcs around the lectern (five blocks with aisles), government and Bundesrat benches, visitors' galleries
 const seatG=(()=>{const a=new THREE.BoxGeometry(0.022,0.012,0.02);a.translate(0,0.006,0);const b=new THREE.BoxGeometry(0.022,0.026,0.005);b.translate(0,0.013,-0.0085);return mergeGeometries([a,b]);})();
 const SP=[],GP=[];
 {const cz=-0.42,rows=8,r0=0.34,dr=0.13,A=58*Math.PI/180,gap=0.05,blocks=5;const rads=[...Array(rows)].map((_,i)=>r0+i*dr);const sum=rads.reduce((a,b)=>a+b,0);let left=630;
  rads.forEach((r,i)=>{const n=i<rows-1?Math.round(630*r/sum):left;left-=n;const eff=2*A-(blocks-1)*gap,per=eff/n;for(let k=0;k<n;k++){const u=(k+0.5)*per;const bi=Math.min(blocks-1,Math.floor(u/(eff/blocks)));const th=-A+u+bi*gap;SP.push([r*Math.sin(th),FL+i*0.006,cz+r*Math.cos(th),th+Math.PI]);}});}
 for(let z=-0.72;z<=-0.22;z+=0.05){GP.push([1.13,FL,z,-Math.PI/2]);GP.push([-1.13,FL,z,Math.PI/2]);}
 for(let z=-0.6;z<=0.95;z+=0.05){GP.push([hw-T-0.1,0.36,z,-Math.PI/2]);GP.push([-(hw-T-0.1),0.36,z,Math.PI/2]);}
 rs.nSeats=SP.length;
 const SEATM=new THREE.MeshStandardMaterial({color:0x5d5ad6,roughness:.7,emissive:0x3c3aa8,emissiveIntensity:.4});rs.seatM=SEATM;
 const inst=(arr,m)=>{const im=new THREE.InstancedMesh(seatG,m,arr.length);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler();arr.forEach((p,i)=>{E.set(0,p[3],0);Q.setFromEuler(E);M.compose(new THREE.Vector3(p[0],p[1],p[2]),Q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,M);});im.castShadow=true;im.receiveShadow=true;G.add(im);return im;};
 rs.seats=inst(SP,SEATM);inst(GP,new THREE.MeshStandardMaterial({color:0x7a77dc,roughness:.7,emissive:0x4a48a8,emissiveIntensity:.35}));
 for(let i=0;i<3;i++)inst([[(i-1)*0.12,FL+0.04,BZ+0.06,0]],SEATM);
 {const rb=rnd2;const occ=[];SP.forEach(p=>{const cen=1-Math.abs(Math.atan2(p[0],p[2]+0.42))/1.1;if(rb()<0.42+0.25*cen)occ.push(p);});GP.forEach((p,i)=>{if(rb()<(p[1]>0.3?0.35:0.6))occ.push(p);});for(let i=0;i<3;i++)occ.push([(i-1)*0.12,FL+0.04,BZ+0.06,0]);
  const n=occ.length;const torsoG=(()=>{const g=new THREE.CapsuleGeometry(0.0062,0.0095,4,10);g.scale(1,1,0.7);return g;})(),lapG=new THREE.BoxGeometry(0.0118,0.0055,0.0125),headG=new THREE.SphereGeometry(0.0047,12,10),hairG=new THREE.SphereGeometry(0.0050,12,8,0,Math.PI*2,0,Math.PI*0.52);
  const SUITS=[0x2b3346,0x3a3f4a,0x1f2430,0x4a4f5a,0x5a4a3a,0x3e5a7a,0x7a6a5a,0x2f4f4f,0x8a8f99,0x5a3f5a,0x6f7a8a,0xb9b2a3],SK=[0xdcbfa2,0xc9a182,0x9c7558,0xe3c9ae,0xd8b394],HR=[0x2b2118,0x4a3a2a,0x8a8a88,0xc8b48a,0x6b4a2a,0xd2d2cf,0x1c1a18];
  const mk=(g,c)=>{const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.75,emissive:0x2a2a30,emissiveIntensity:.5});const im=new THREE.InstancedMesh(g,m,n);im.castShadow=true;G.add(im);return im;};
  const T=mk(torsoG),Lp=mk(lapG),Hd=mk(headG),Hr=mk(hairG);rs.mp={T,Lp,Hd,Hr,occ,anim:[]};const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),P=new THREE.Vector3(),S1=new THREE.Vector3(1,1,1),C=new THREE.Color();
  occ.forEach((p,i)=>{const sc=0.92+0.16*rb();const cs=SUITS[Math.floor(rb()*SUITS.length)];const f=(lx,ly,lz)=>{P.set(lx,ly,lz).applyAxisAngle(new THREE.Vector3(0,1,0),p[3]);return [p[0]+P.x,p[1]+P.y,p[2]+P.z];};
   const put=(im,pos,ry,rx=0)=>{E.set(rx,p[3]+ry,0,'YXZ');Q.setFromEuler(E);M.compose(new THREE.Vector3(...pos),Q,new THREE.Vector3(sc,sc,sc));im.setMatrixAt(i,M);};
   put(T,f(0,0.012+0.0112*sc,-0.0035),0,-0.1);put(Lp,f(0,0.0145,0.0035),0);const hp=f(0,0.012+0.0258*sc,-0.002);const ry=(rb()-0.5)*0.5;put(Hd,hp,ry);put(Hr,[hp[0],hp[1]+0.0004,hp[2]],ry);
   T.setColorAt(i,C.set(cs));Lp.setColorAt(i,C.set(cs).multiplyScalar(0.8));Hd.setColorAt(i,C.set(SK[Math.floor(rb()*SK.length)]));Hr.setColorAt(i,C.set(HR[Math.floor(rb()*HR.length)]));
   if(rb()<0.16)rs.mp.anim.push({i,hp,base:p[3]+ry,sc,ph:rb()*6.28,sp:0.25+0.35*rb(),am:0.35+0.4*rb()});});
  [T,Lp,Hd,Hr].forEach(im=>{im.instanceColor.needsUpdate=true;});}
 // the president of the Bundestag behind the desk is already seated above; nothing else changes in the hall
 // lights: warm hall light, the spotlight on the lectern
 rs.hall=new THREE.PointLight(0xffe6c4,0,3.2,2);rs.hall.position.set(RS.x,0.8,RS.z+0.1);scene.add(rs.hall);
 rs.spot=new THREE.SpotLight(0xfff0dc,0,3,0.2,0.55,2);rs.spot.position.set(RS.x+0.4,1.15,RS.z-0.429+0.75);rs.spot.target.position.set(RS.x,FL+0.06,RS.z-0.429);scene.add(rs.spot);scene.add(rs.spot.target);
 rs.head=[RS.x,FL+0.081,RS.z-0.432];}
// =================================================================== STATS: 100 lights on the lawn (satisfaction in %) and three LED columns on the plaza (ARD-Deutschlandtrend May, September, October 2026)
const GRID=[];{const cx=RS.x,cz=1.62,sp=0.15;const postG=new THREE.CylinderGeometry(0.006,0.008,0.05,6);postG.translate(0,0.025+PAVE_H,0);const P=[];
 for(let r=0;r<10;r++)for(let c=0;c<10;c++)P.push([cx+(c-4.5)*sp,cz+(r-4.5)*sp,r,c]);
 const im=new THREE.InstancedMesh(postG,mat(0x3a3d44,.6,.4),P.length);const M=new THREE.Matrix4();P.forEach((p,i)=>{M.makeTranslation(p[0],0,p[1]);im.setMatrixAt(i,M);});town.add(im);
 const bulbG=new THREE.SphereGeometry(0.017,12,10);
 P.forEach(p=>{const m=new THREE.MeshBasicMaterial({color:0x000000});mesh(town,bulbG,m,p[0],PAVE_H+0.066,p[1],false,false);const h=halo(town,0xffe2b0,0.0,0.17);h.position.set(p[0],PAVE_H+0.066,p[1]);GRID.push({m,h,row:p[2],col:p[3],x:p[0],z:p[1]});});
 for(let x=cx-0.9;x<=cx+0.91;x+=0.2)for(let z=cz-0.9;z<=cz+0.91;z+=0.2)KO.push([x,z,0.12]);}
const COLS=[];{const z=1.62;[[0.32,'Mai',16,11.75],[0.64,'Sep.',13,12.15],[0.96,'Okt.',10,12.55],[1.28,'Nov.',12,36.75]].forEach(([x,lab,v,t0],i)=>{const pl=box(town,0.22,0.02,0.22,mat(0x8d939c,.5,.4),x,PAVE_H+0.01,z,true);pl.scale.set(0.001,1,0.001);
  const m=glowMat(0xd8e6ff,0);const g=new THREE.BoxGeometry(0.15,1,0.15);g.translate(0,0.5,0);const c=mesh(town,g,m,x,PAVE_H+0.03,z,false,false);c.scale.y=0.001;
  const cap=mesh(town,new THREE.BoxGeometry(0.165,0.016,0.165),glowMat(0xffffff,0),x,PAVE_H+0.04,z,false,false);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4),new THREE.MeshBasicMaterial({map:poolTex,color:hdr(0xd8e6ff,0.45),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));p.rotation.x=-Math.PI/2;p.position.set(x,PAVE_H+0.006,z);town.add(p);
  COLS.push({c,m,cap,p,pl,x,z,v,lab,t0});KO.push([x,z,0.18]);});}

// =================================================================== DEBT: a barrier (the Schuldenbremse) across the plaza on the right; it lifts and five stacks of euro coins grow behind it (500 Mrd. € Sondervermögen on credit)
const COIN_R=0.085;
const coinG=(()=>{const sh=new THREE.Shape();sh.absarc(0,0,COIN_R,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,COIN_R*0.7,0,Math.PI*2,true);sh.holes.push(hole);
  const ring=new THREE.ExtrudeGeometry(sh,{depth:0.011,bevelEnabled:true,bevelThickness:0.003,bevelSize:0.003,bevelSegments:2,curveSegments:28});ring.translate(0,0,-0.0055);ring.clearGroups();
  const core=new THREE.CylinderGeometry(COIN_R*0.7,COIN_R*0.7,0.015,28);core.rotateX(Math.PI/2);return mergeGeometries([ring,core.toNonIndexed()],true);})();
const COINENV=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),0.04).texture;
const coinGold=new THREE.MeshStandardMaterial({color:0xe2bb5e,metalness:.85,roughness:.28,envMap:COINENV,envMapIntensity:1.0,emissive:0x6e4c14,emissiveIntensity:.6});
const coinSilver=new THREE.MeshStandardMaterial({color:0xe2e5ea,metalness:.85,roughness:.25,envMap:COINENV,envMapIntensity:1.0,emissive:0x5e626a,emissiveIntensity:.5});
const BAR={x0:2.45,x1:4.55,z:2.7,t0:17.6,t1:18.4};const bar={};
{const pm=mat(0x3a3d44,.6,.4);for(const x of [BAR.x0,BAR.x1])mesh(town,new THREE.CylinderGeometry(0.028,0.032,0.17,10),pm,x,PAVE_H+0.085,BAR.z);
 box(town,0.1,0.13,0.1,new THREE.MeshStandardMaterial({color:0xc9ccd2,roughness:.5,emissive:0x8d939c,emissiveIntensity:.35}),BAR.x0,PAVE_H+0.065,BAR.z,true);
 box(town,0.05,0.025,0.06,pm,BAR.x1,PAVE_H+0.172,BAR.z,false);
 const G=new THREE.Group();G.position.set(BAR.x0,PAVE_H+0.16,BAR.z);town.add(G);bar.G=G;const L=BAR.x1-BAR.x0-0.01;bar.L=L;
 const st=canvasTex(512,16,(g,w,h)=>{for(let i=0;i<14;i++){g.fillStyle=i%2?'#3a3d44':'#f2f2f0';g.fillRect(i*w/14,0,w/14+1,h);}});
 const bm=new THREE.MeshStandardMaterial({map:st,roughness:.5,emissive:0xffffff,emissiveMap:st,emissiveIntensity:.3});bar.bm=bm;
 const g=new THREE.BoxGeometry(L,0.032,0.026);g.translate(L/2,0,0);mesh(G,g,bm,0,0,0,true,false);
 bar.leds=[];for(let i=1;i<=4;i++){const m=glowMat(LED,0);mesh(G,new THREE.SphereGeometry(0.008,8,6),m,i*L/5,0.021,0,false,false);bar.leds.push(m);}
 KO.push([BAR.x0,BAR.z,0.16],[BAR.x1,BAR.z,0.16]);}
const DS=[2.75,3.15,3.55,3.95,4.35],DN=22,DZ=1.75,CS=0.62,CT=0.0108,DFLY=0.62,DST0=18.55,DSTEP=0.55,DSDUR=1.45;
const DEBT=[];const DCOINS=new THREE.InstancedMesh(coinG,[coinGold,coinSilver],DS.length*DN);DCOINS.castShadow=true;DCOINS.frustumCulled=false;town.add(DCOINS);
{const rb=rnd2;DS.forEach((sx,si)=>{const t0=DST0+si*DSTEP;for(let lv=0;lv<DN;lv++){const land=t0+DSDUR*lv/(DN-1);
   const src=[2.0+0.12*rb(),0.95+0.25*rb(),DZ+0.42-si*0.13+(rb()-0.5)*0.08];const dst=[sx+(rb()-0.5)*0.006,PAVE_H+0.03+lv*CT+CT/2,DZ+(rb()-0.5)*0.006];
   const ctl=[(src[0]+dst[0])/2,Math.max(src[1],dst[1])+0.35+0.1*rb(),(src[2]+dst[2])/2];DEBT.push({src,dst,ctl,land,si,lv,rz:rb()*6.28,tilt:0.7+0.5*rb(),spin:5+4*rb()});}});
 DEBT.sort((a,b)=>a.land-b.land);DEBT.forEach((c,k)=>c.k=k);
 DS.forEach(x=>box(town,0.15,0.03,0.15,mat(0x2a2c31,.6,.3),x,PAVE_H+0.015,DZ,true));
 bar.pool=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.3),new THREE.MeshBasicMaterial({map:poolTex,color:hdr(0xffc870,0.5),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));bar.pool.rotation.x=-Math.PI/2;bar.pool.position.set(3.55,PAVE_H+0.006,DZ);town.add(bar.pool);
 bar.glints=[...Array(12)].map(()=>halo(town,0xffe2a0,1.6,0.14));bar.glints.forEach(g=>g.material.opacity=0);
 bar.tops=DS.map(x=>{const h=halo(town,0xffd27a,1.4,0.5);h.material.opacity=0;return h;});
 bar.done=DS.map((x,si)=>DST0+si*DSTEP+DSDUR);}
const _DM=new THREE.Matrix4(),_DQ=new THREE.Quaternion(),_DE=new THREE.Euler(),_DS=new THREE.Vector3(CS,CS,CS),_DP=new THREE.Vector3(),_DZ=new THREE.Matrix4().makeScale(0,0,0);
const bez3=(a,c,b,u)=>[(1-u)**2*a[0]+2*(1-u)*u*c[0]+u*u*b[0],(1-u)**2*a[1]+2*(1-u)*u*c[1]+u*u*b[1],(1-u)**2*a[2]+2*(1-u)*u*c[2]+u*u*b[2]];
function updateDebt(t){let landed=0;
  DEBT.forEach((c,i)=>{const u=(t-(c.land-DFLY))/DFLY;if(u<0){DCOINS.setMatrixAt(i,_DZ);return;}
    let p,tilt=0,rz=c.rz;if(u<1){const q=1-Math.pow(1-u,1.5);p=bez3(c.src,c.ctl,c.dst,q);tilt=c.tilt*(1-q);rz=c.rz+c.spin*(1-q);}
    else{landed++;const tau=t-c.land;p=c.dst.slice();p[1]+=0.004*Math.exp(-22*tau)*Math.abs(Math.sin(34*tau));tilt=0.09*Math.exp(-16*tau)*Math.sin(40*tau);}
    _DE.set(-Math.PI/2+tilt,0,rz);_DQ.setFromEuler(_DE);_DP.set(p[0],p[1],p[2]);_DM.compose(_DP,_DQ,_DS);DCOINS.setMatrixAt(i,_DM);});
  DCOINS.instanceMatrix.needsUpdate=true;
  // a short glint on every landing coin, a warm glow when a pile is complete
  bar.glints.forEach((g,j)=>{let best=null;for(let k=j;k<DEBT.length;k+=12){if(DEBT[k].land<=t)best=DEBT[k];else break;}const a=best?1-(t-best.land)/0.2:0;if(a>0){g.position.set(best.dst[0],best.dst[1]+0.012,best.dst[2]);g.material.opacity=a;}else g.material.opacity=0;});
  bar.tops.forEach((h,si)=>{const dt=t-bar.done[si];const a=dt>0?Math.exp(-dt*3.2):0;h.material.opacity=0.9*a;h.position.set(DS[si],PAVE_H+0.03+DN*CT+0.02,DZ);});
  return landed;}
// =================================================================== ECONOMY: a factory hall with a sawtooth roof and a chimney on the left, behind the offices; an LED chart on its side shows growth that barely rises (2025: +0.2 %)
const fac={wins:[]};
{const x=-4.1,z=-2.2,w=1.15,d=1.1,h=0.4;const G=new THREE.Group();G.position.set(x,0,z);town.add(G);
 const wm=new THREE.MeshStandardMaterial({color:0xaab0b9,roughness:.8,emissive:0x8a909a,emissiveIntensity:.3});fac.wm=wm;const rm=new THREE.MeshStandardMaterial({color:0x6f757e,roughness:.7,emissive:0x50555e,emissiveIntensity:.3});fac.rm=rm;
 box(G,w,h,d,wm,0,h/2,0);box(G,w+0.02,0.1,d+0.02,mat(0x5d6168,.85),0,0.05,0,true);
 const n=3,tw=d/n;for(let i=0;i<n;i++){const z0=-d/2+i*tw;const s=new THREE.Shape();s.moveTo(-z0,0);s.lineTo(-(z0+tw),0.15);s.lineTo(-(z0+tw),0);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(-w/2,h,0);mesh(G,g,rm,0,0,0);
   fac.wins.push(litWin(G,w-0.08,0.11,0,h+0.07,z0+tw+0.003,0,0xffe4b8));}
 for(let i=0;i<4;i++)fac.wins.push(litWin(G,0.12,0.07,w/2+0.003,0.11,-0.38+i*0.25,Math.PI/2,0xffe4b8));
 for(const dx of [-0.25,0.25]){const p=new THREE.Mesh(new THREE.PlaneGeometry(0.22,0.24),mat(0x3d4148,.7,.3));p.position.set(dx,0.12,d/2+0.003);G.add(p);}
 const cm=new THREE.MeshStandardMaterial({color:0xa8826a,roughness:.85,emissive:0x7a5c48,emissiveIntensity:.3});mesh(G,new THREE.CylinderGeometry(0.045,0.06,1.0,16),cm,-w/2+0.16,0.5,-d/2+0.16);
 for(const y of [0.62,0.9])mesh(G,new THREE.TorusGeometry(0.05,0.008,6,20).rotateX(Math.PI/2),mat(0x5d6168,.6,.3),-w/2+0.16,y,-d/2+0.16);
 // LED chart on the long side facing the Reichstag: a nearly flat line that rises only a tiny bit at the end
 const ct=canvasTex(512,160,(g,W2,H2)=>{g.fillStyle='#0d1626';g.fillRect(0,0,W2,H2);g.strokeStyle='rgba(120,150,200,.18)';g.lineWidth=2;for(let y=30;y<H2;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(W2,y);g.stroke();}
   g.strokeStyle='#cfe4ff';g.lineWidth=9;g.lineCap='round';g.shadowColor='#8fc2ff';g.shadowBlur=16;g.beginPath();g.moveTo(26,100);g.lineTo(440,99);g.lineTo(478,90);g.stroke();
   g.fillStyle='#cfe4ff';g.beginPath();g.moveTo(498,86);g.lineTo(470,80);g.lineTo(476,102);g.closePath();g.fill();});
 box(G,0.02,0.2,0.74,mat(0x2a2c31,.6,.3),w/2+0.01,0.29,0,false);
 fac.chartTex=ct;fac.chartM=new THREE.MeshBasicMaterial({map:ct,color:0x000000});const cg=new THREE.PlaneGeometry(0.7,0.18);cg.translate(0.35,0,0);const cp=new THREE.Mesh(cg,fac.chartM);cp.rotation.y=Math.PI/2;cp.position.set(w/2+0.022,0.29,0.35);G.add(cp);fac.chart=cp;
 for(let xx=x-0.7;xx<=x+0.71;xx+=0.2)for(let zz=z-0.7;zz<=z+0.71;zz+=0.2)KO.push([xx,zz,0.16]);}
const SMOKE=[];{const sm=[-4.1-1.15/2+0.16,1.0,-2.2-1.1/2+0.16];for(let i=0;i<12;i++){const m=new THREE.MeshStandardMaterial({color:0xc9ccd2,roughness:1,emissive:0x8a8e96,emissiveIntensity:.35,transparent:true,opacity:0,depthWrite:false});const o=mesh(town,new THREE.SphereGeometry(0.05,12,10),m,sm[0],sm[1],sm[2],false,false);SMOKE.push({o,m,ph:i/12,base:sm});}}
function updateSmoke(t,L){SMOKE.forEach(s=>{const u=((t/3.6+s.ph)%1+1)%1;s.o.position.set(s.base[0]+0.35*u+0.03*Math.sin(t*0.7+s.ph*9),s.base[1]+0.03+0.62*u,s.base[2]+0.12*u);s.o.scale.setScalar(0.45+1.6*u);s.m.opacity=0.42*Math.sin(Math.PI*Math.min(1,u*1.15))*(1-u)*L;});}
// a second tour boat going the other way on the Spree
const boat2=boat.clone();town.add(boat2);boat2.rotation.y=Math.PI;
