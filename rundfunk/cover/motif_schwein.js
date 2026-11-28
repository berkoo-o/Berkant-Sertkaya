// ---------- motif: a piggy bank in cutaway. The front of the body is cut open (glass cover over the cut), inside it is full of euro coins.
// A coin is dropping into the red slot on the back, rabbit-ear antenna behind the slot (it is a "broadcasting" piggy bank), snout, ears, eyes, curly tail, four legs.
renderer.localClippingEnabled=true;const P=tv;
const PIG=M(0xe6ddff,{roughness:.45}),PINK=M(0xc9b6ff,{roughness:.4}),INNER=M(0x2b2778,{roughness:.6,side:THREE.BackSide});
const RX=0.78,RY=0.6,RZ=0.6,CY0=0.72,CUT=0.18;// body ellipsoid, cut plane at local z = CUT (front part removed)
const clip=new THREE.Plane(new THREE.Vector3(0,0,-1),CUT);// keeps z <= CUT (in world space, updated below)
const body=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),new THREE.MeshStandardMaterial({color:0xe6ddff,roughness:.45,metalness:.1,clippingPlanes:[clip],clipShadows:true}));body.scale.set(RX,RY,RZ);body.position.y=CY0;body.castShadow=true;P.add(body);
const inner=new THREE.Mesh(new THREE.SphereGeometry(0.975,64,48),new THREE.MeshStandardMaterial({color:0x34307a,roughness:.6,side:THREE.BackSide,clippingPlanes:[clip]}));inner.scale.set(RX,RY,RZ);inner.position.y=CY0;P.add(inner);
// cut edge: a bright ellipse ring, and a faint glass cover over the opening
{const k=Math.sqrt(1-(CUT/RZ)**2);const ex=RX*k,ey=RY*k;const pts=[];for(let i=0;i<=96;i++){const a=i/96*6.283;pts.push(new THREE.Vector3(Math.cos(a)*ex,CY0+Math.sin(a)*ey,CUT));}
 add(P,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),160,0.014,8,true),M(0xcfc8ff,{emissive:0x8a7cff,emissiveIntensity:.5}));
 const cap=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshStandardMaterial({color:0x8f86ff,transparent:true,opacity:.1,roughness:.1,depthWrite:false,emissive:0x4a40c0,emissiveIntensity:.25}));cap.scale.set(ex,ey,1);cap.position.set(0,CY0,CUT+0.002);cap.renderOrder=5;P.add(cap);}
// inside: euro coins filling the lower half, a few tumbling in the middle
{let s=9;const r=()=>(s=(s*16807)%2147483647)/2147483647;let n=0;
 for(let lay=0;lay<7;lay++){const y=CY0-RY*0.86+lay*0.045;const k=Math.sqrt(Math.max(0,1-((y-CY0)/RY)**2))*0.9;for(let i=0;i<22;i++){const u=(r()-0.5)*2,v=r();const x=u*RX*k*0.92,z=CUT-0.04-v*RZ*k*1.5;if(z<-RZ*k*0.95)continue;coin(P,x,y+r()*0.02,z,-Math.PI/2+(r()-0.5)*0.6,(r()-0.5)*0.5,r()*6.28);n++;}}
 for(const [x,y,z,a] of [[0.12,CY0+0.12,-0.05,0.6],[-0.2,CY0+0.02,0.0,-0.8],[0.32,CY0-0.02,-0.1,1.4]])coin(P,x,y,z,a,0.9,0.3);
 const p=new THREE.PointLight(0xffc26a,1.2,1.2,2);p.position.set(0,CY0+0.1,CUT+0.25);P.add(p);}
// slot on the back with a red rim and a coin dropping in
{const y=CY0+RY;RB(P,0.36,0.04,0.12,PINK,0,y-0.01,-0.08,0.02);RB(P,0.26,0.03,0.035,DARK,0,y+0.005,-0.08,0.008);
 for(const s of [-1,1])RB(P,0.3,0.014,0.014,REDS,0,y+0.015,-0.08+s*0.027,0.005);for(const s of [-1,1])RB(P,0.014,0.014,0.068,REDS,s*0.145,y+0.015,-0.08,0.005);
 coin(P,0,y+0.13,-0.08,0,Math.PI/2,0);const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,y+0.02,-0.08),new THREE.Vector3(0.02,y-0.2,-0.04),new THREE.Vector3(-0.05,CY0+0.15,0.0),new THREE.Vector3(0.0,CY0-0.1,0.05)]),60,0.01,8),REDM);t.renderOrder=7;P.add(t);
 const p=new THREE.PointLight(0xff2030,1.6,1.2,2);p.position.set(0,y+0.3,0.1);P.add(p);}
// rabbit-ear antenna behind the slot
{const ax=-0.36,ay=CY0+RY*0.86,az=-0.2;add(P,new THREE.SphereGeometry(0.05,16,12),LIL,ax,ay,az);for(const [dx,dz] of [[-0.32,-0.12],[0.22,-0.22]]){const e=[ax+dx,ay+0.58,az+dz];rod(P,[ax,ay,az],e,0.008,METAL);add(P,new THREE.SphereGeometry(0.02,12,10),LIGHT,...e);}}
// snout, nostrils, eyes, ears
{const sx=RX+0.02;cylZ(P,0.2,0.16,PINK,0,0,0).removeFromParent();const sn=add(P,new THREE.CylinderGeometry(0.2,0.22,0.16,40).rotateZ(Math.PI/2),PINK,sx,CY0+0.02,0.02);
 add(P,new THREE.CylinderGeometry(0.2,0.2,0.01,40).rotateZ(Math.PI/2),M(0xb39eff),sx+0.083,CY0+0.02,0.02);for(const s of [-1,1])add(P,new THREE.CylinderGeometry(0.032,0.032,0.02,20).rotateZ(Math.PI/2),DARK,sx+0.086,CY0+0.02,0.02+s*0.07);
 for(const s of [-1,1]){add(P,new THREE.SphereGeometry(0.045,16,12),DARK,RX*0.84,CY0+0.2,s*0.13-0.03);add(P,new THREE.SphereGeometry(0.014,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),RX*0.84+0.035,CY0+0.22,s*0.13-0.02);}
 for(const s of [-1,1]){const e=add(P,new THREE.ConeGeometry(0.12,0.2,4),PINK,RX*0.5,CY0+RY*0.86,s*0.13-0.03);e.rotation.set(s*0.35,0.78,-0.35);}}
// legs and curly tail
for(const [x,z] of [[0.42,0.26],[0.42,-0.26],[-0.42,0.26],[-0.42,-0.26]]){add(P,new THREE.CylinderGeometry(0.1,0.11,0.24,24),PINK,x,0.12,z);add(P,new THREE.CylinderGeometry(0.11,0.11,0.03,24),DARK,x,0.015,z);}
{const pts=[];for(let i=0;i<=40;i++){const u=i/40,a=u*Math.PI*3.2;pts.push(new THREE.Vector3(-RX-0.02-u*0.14,CY0+0.12+Math.sin(a)*0.06,Math.cos(a)*0.06));}add(P,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),80,0.02,8),PINK);}
// keep the clip plane in the pig's frame (tv is rotated and the root is scaled)
scene.updateMatrixWorld(true);{const n=new THREE.Vector3(0,0,-1).transformDirection(P.matrixWorld);const p0=new THREE.Vector3(0,CY0,CUT).applyMatrix4(P.matrixWorld);clip.setFromNormalAndCoplanarPoint(n,p0);}
