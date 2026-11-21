// ---------- motif: TV tower from the video. Glass shaft with an elevator full of coins and a spiral stair, a big glass pod with a little TV studio inside
// (news desk, cameras, monitor wall, studio lamps) and a pile of euro coins, LED ring, antenna with red-white bands and the red aviation light on top.
// A thin red cable runs from the base up the shaft into the pod (the red thread).
const T=tv;const lerp=(a,b,u)=>a+(b-a)*u;const SB=0.07,ST=1.62,rS=y=>lerp(0.2,0.13,(y-SB)/(ST-SB));
add(T,new THREE.CylinderGeometry(0.78,0.82,0.07,64),DARK,0,0.035,0);add(T,new THREE.TorusGeometry(0.78,0.009,8,80).rotateX(Math.PI/2),REDM,0,0.07,0);
add(T,new THREE.CylinderGeometry(0.34,0.36,0.05,40),PAN,0,0.095,0);for(let i=0;i<16;i++){const a=i/16*6.283;add(T,new THREE.CylinderGeometry(0.013,0.013,0.022,8),LIL,Math.cos(a)*0.3,0.128,Math.sin(a)*0.3);}
// curved broadcasting building around the foot (like the ARD building in the video)
{const R0=0.42,R1=0.68,a0=-0.9,a1=2.3,H=0.24;const s=new THREE.Shape();const n=40;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;if(i)s.lineTo(R1*Math.sin(a),-R1*Math.cos(a));else s.moveTo(R1*Math.sin(a),-R1*Math.cos(a));}for(let i=n;i>=0;i--){const a=a0+(a1-a0)*i/n;s.lineTo(R0*Math.sin(a),-R0*Math.cos(a));}
 const g=new THREE.ExtrudeGeometry(s,{depth:H,bevelEnabled:true,bevelThickness:0.01,bevelSize:0.01,bevelSegments:2,curveSegments:24});g.rotateX(-Math.PI/2);add(T,g,BODY,0,0.07,0);
 const band=new THREE.Mesh(new THREE.CylinderGeometry(R1+0.013,R1+0.013,0.08,64,1,true,a0+0.05,a1-a0-0.1),new THREE.MeshBasicMaterial({color:0xffd9a0,toneMapped:false}));band.position.y=0.07+H*0.5;T.add(band);
 const pts=[];for(let i=0;i<=60;i++){const a=a0+(a1-a0)*i/60;pts.push(new THREE.Vector3((R1+0.02)*Math.sin(a),0.07+H+0.015,(R1+0.02)*Math.cos(a)));}add(T,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),80,0.008,6),new THREE.MeshBasicMaterial({color:0xe8eeff,toneMapped:false}));}
// glass shaft with flanges, elevator rails, a cabin carrying coins and a spiral stair
glass(T,new THREE.CylinderGeometry(rS(ST),rS(SB),ST-SB,40,1,true),0,(ST+SB)/2,0,.16);
for(const y of [SB+0.32,0.75,1.2,ST])add(T,new THREE.TorusGeometry(rS(y)+0.004,0.012,8,48).rotateX(Math.PI/2),LIL,0,y,0);
for(const s of [-1,1])rod(T,[s*0.05,SB+0.3,-0.06],[s*0.05,ST,-0.06],0.006,LIL);
{const cab=new THREE.Group();cab.position.set(0,0.95,-0.02);T.add(cab);RB(cab,0.12,0.13,0.1,NAVY,0,0,0,0.012);const w=new THREE.Mesh(new THREE.PlaneGeometry(0.08,0.06),new THREE.MeshBasicMaterial({color:0xffe0b0,toneMapped:false}));w.position.set(0,0.02,0.051);cab.add(w);
 for(let i=0;i<3;i++)coin(cab,(i-1)*0.03,0.075+i*0.012,0.0,-Math.PI/2+0.2*(i-1),0,i);}
for(let i=0;i<34;i++){const a=i*0.62,y=SB+0.33+i*0.038;if(y>ST-0.04)break;const r=rS(y)-0.035;const st=RB(T,0.06,0.008,0.03,LIL,Math.cos(a)*r,y,Math.sin(a)*r,0.003);st.rotation.y=-a;}
// the red thread: a cable from the base up into the pod
{const P=[[0.02,0.13,0.05],[0.03,0.4,0.06],[0.03,1.0,0.07],[0.02,ST,0.06],[0.05,1.86,0.1],[0.12,1.93,0.18]];const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P.map(p=>new THREE.Vector3(...p))),120,0.011,10),REDM);t.renderOrder=7;T.add(t);}
// pod: lower cone, floor, glass drum with bright rings, studio inside, upper cap with LED ring
const PY=1.86,PR=0.74,PH=0.5;
add(T,new THREE.CylinderGeometry(PR-0.02,rS(ST)+0.02,0.2,48),BODY,0,ST+0.1,0);add(T,new THREE.CylinderGeometry(PR,PR,0.04,56),PAN,0,PY,0);
{const g=new THREE.CylinderGeometry(PR+0.02,PR+0.02,PH,64,1,true);glass(T,g,0,PY+PH/2+0.02,0,.13);for(const y of [PY+0.025,PY+PH+0.02])add(T,new THREE.TorusGeometry(PR+0.022,0.01,8,72).rotateX(Math.PI/2),M(0xcfc8ff,{emissive:0x8a7cff,emissiveIntensity:.6}),0,y,0);
 for(let i=0;i<16;i++){const a=i/16*6.283;rod(T,[Math.cos(a)*(PR+0.02),PY+0.03,Math.sin(a)*(PR+0.02)],[Math.cos(a)*(PR+0.02),PY+PH+0.01,Math.sin(a)*(PR+0.02)],0.004,LIL);}}
add(T,new THREE.CylinderGeometry(0.28,PR+0.03,0.14,56),BODY,0,PY+PH+0.09,0);add(T,new THREE.TorusGeometry(PR+0.025,0.012,8,72).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xe8eeff,toneMapped:false}),0,PY+PH+0.035,0);
// studio: curved desk, two chairs, two cameras on tripods, monitor wall, two studio lamps
{const S=new THREE.Group();S.position.set(0,PY+0.02,0);S.rotation.y=0.55;S.scale.setScalar(1.25);T.add(S);
 {const s=new THREE.Shape();s.absarc(0,0,0.24,Math.PI*1.15,Math.PI*1.85,false);s.absarc(0,0,0.16,Math.PI*1.85,Math.PI*1.15,true);const g=new THREE.ExtrudeGeometry(s,{depth:0.09,bevelEnabled:true,bevelThickness:0.006,bevelSize:0.006,bevelSegments:2,curveSegments:24});g.rotateX(-Math.PI/2);const d=add(S,g,LIGHT,0,0,-0.08);
  const fr=new THREE.Mesh(new THREE.CylinderGeometry(0.245,0.245,0.05,40,1,true,Math.PI*1.15+Math.PI/2,Math.PI*0.7),new THREE.MeshBasicMaterial({color:0x8f7cff,toneMapped:false,side:THREE.DoubleSide}));fr.position.set(0,0.05,-0.08);S.add(fr);}
 for(const x of [-0.08,0.08]){RB(S,0.05,0.06,0.05,NAVY,x,0.03,-0.22,0.01);RB(S,0.05,0.06,0.012,NAVY,x,0.075,-0.25,0.005);}
 for(const [x,z,a] of [[-0.25,0.25,0.5],[0.22,0.28,-0.45]]){const C=new THREE.Group();C.position.set(x,0,z);C.rotation.y=a+Math.PI;S.add(C);for(let k=0;k<3;k++){const b=k*2.094;rod(C,[Math.cos(b)*0.05,0,Math.sin(b)*0.05],[0,0.15,0],0.004,LIL);}
   RB(C,0.06,0.06,0.1,DARK,0,0.18,0,0.01);cylZ(C,0.022,0.04,METAL,0,0.18,0.065,16);add(C,new THREE.SphereGeometry(0.008,8,6),REDM,0.02,0.215,0.03);}
 for(let i=0;i<3;i++){const a=-0.5+i*0.5;const m=new THREE.Group();m.position.set(Math.sin(a)*0.45,0.17,-Math.cos(a)*0.45);m.rotation.y=-a;S.add(m);RB(m,0.17,0.11,0.015,DARK,0,0,0,0.006);const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.15,0.09),new THREE.MeshBasicMaterial({color:[0x6a52ff,0x4aa8e0,0x8f7cff][i],toneMapped:false}));sc.position.z=0.009;m.add(sc);rod(S,[Math.sin(a)*0.45,0,-Math.cos(a)*0.45],[Math.sin(a)*0.45,0.11,-Math.cos(a)*0.45],0.005,LIL);}
 for(const x of [-0.35,0.35]){rod(S,[x,0,0.05],[x,0.34,0.05],0.005,LIL);const l=RB(S,0.05,0.04,0.06,LIGHT,x,0.35,0.05,0.008);l.rotation.x=-0.6;}
 const pl=new THREE.PointLight(0xfff0d8,0.8,0.8,2);pl.position.set(0,0.3,0.1);S.add(pl);}
// a pile of euro coins on the pod floor, more coins dropping in from the cable outlet
{let s=5;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<30;i++){const lay=Math.floor(i/12);const a=1.9+r()*1.1,d=0.4+r()*0.26;coin(T,Math.cos(a)*d,PY+0.03+lay*0.02+r()*0.01,Math.sin(a)*d,-Math.PI/2+(r()-0.5)*0.4,(r()-0.5)*0.3,r()*6.28);}
 coin(T,0.18,PY+0.18,0.24,0.6,0.8,0);coin(T,0.22,PY+0.3,0.2,-0.4,0.3,0.4);const p=new THREE.PointLight(0xffc26a,0.6,0.8,2);p.position.set(-0.2,PY+0.2,0.35);T.add(p);}
// antenna with red-white bands and the red aviation light
{const y0=PY+PH+0.16;add(T,new THREE.CylinderGeometry(0.06,0.1,0.12,24),BODY,0,y0+0.04,0);const rw=M(0xE01E2B,{emissive:0x5a0810,emissiveIntensity:.5,roughness:.4});
 for(let k=0;k<6;k++)add(T,new THREE.CylinderGeometry(0.03-k*0.003,0.033-k*0.003,0.12,16),k%2?BODY:rw,0,y0+0.16+k*0.12,0);const top=y0+0.16+6*0.12-0.02;
 add(T,new THREE.SphereGeometry(0.045,20,14),REDM,0,top+0.03,0);const p=new THREE.PointLight(0xff2030,2.0,1.6,2);p.position.set(0,top+0.05,0.1);T.add(p);}
{const p=new THREE.PointLight(0x9a8cff,0.8,1.2,2);p.position.set(0.3,1.0,0.4);T.add(p);}
