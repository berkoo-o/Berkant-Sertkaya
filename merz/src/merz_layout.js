// streets for the Bundestag model: the Reichstag block in the middle with a road all round, offices on the left, offices and an open plaza with LED columns on the right, the river Spree at the back, a row of houses with a park at the front
const ST={A:{z:3.4,x0:-5.0,x1:5.0},D:{z:-3.2,x0:-5.0,x1:5.0},B:{x:2.0,z0:-3.2,z1:3.4},C:{x:-3.2,z0:-3.2,z1:3.4},F:{x:5.0,z0:-3.2,z1:3.4},W:{x:-5.0,z0:-3.2,z1:3.4}};
const roadDist=(x,z)=>{let d=9;for(const k in ST){const s=ST[k];if('z' in s){if(x>s.x0-0.2&&x<s.x1+0.2)d=Math.min(d,Math.abs(z-s.z));}else{if(z>s.z0-0.2&&z<s.z1+0.2)d=Math.min(d,Math.abs(x-s.x));}}return d;};
{const dg=new THREE.PlaneGeometry(0.16,0.022);dg.rotateX(-Math.PI/2);const P=[];for(const k of ['A','D']){const s=ST[k];for(let x=s.x0+0.15;x<s.x1;x+=0.34)P.push([x,s.z,0]);}for(const k of ['B','C','F','W']){const s=ST[k];for(let z=s.z0+0.15;z<s.z1;z+=0.34)P.push([s.x,z,1]);}
 const im=new THREE.InstancedMesh(dg,new THREE.MeshBasicMaterial({color:0x8e8e8a}),P.length);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler();P.forEach((p,i)=>{E.set(0,p[2]?Math.PI/2:0,0);Q.setFromEuler(E);M.compose(new THREE.Vector3(p[0],0.004,p[1]),Q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,M);});town.add(im);}
// landscape tiles
const PARKM=[];function tile(x0,x1,z0,z1,c,y=0.005,em=0.16){const mm=new THREE.MeshStandardMaterial({color:c,roughness:.95,emissive:c,emissiveIntensity:em});const m=mesh(town,new THREE.PlaneGeometry(x1-x0,z1-z0),mm,(x0+x1)/2,y,(z0+z1)/2,false,true);m.rotation.x=-Math.PI/2;m.userData.c=[(x0+x1)/2,(z0+z1)/2];return m;}
const SW=0.235,PAVE_H=0.009;
const ASPH=new THREE.MeshStandardMaterial({color:0x3b3d42,roughness:.92,emissive:0x2b2d32,emissiveIntensity:.4});
const PAVM=new THREE.MeshStandardMaterial({color:0xc2bfb7,roughness:.9,emissive:0xa9a69e,emissiveIntensity:.25});
const PLOTM=new THREE.MeshStandardMaterial({color:0x9c9991,roughness:.92,emissive:0x87847c,emissiveIntensity:.22});
{const g=new THREE.PlaneGeometry(10.6,7.3);g.rotateX(-Math.PI/2);mesh(town,g,ASPH,0,0.002,0.1,false,true);}
const pave=(x0,x1,z0,z1,r=0.12,plot=true)=>{mesh(town,rrSlab(x1-x0,z1-z0,r,PAVE_H),PAVM,(x0+x1)/2,0,(z0+z1)/2,false,true);
  if(plot){const g=rrSlab(x1-x0-0.21,z1-z0-0.21,Math.max(0.03,r-0.1),0.001);mesh(town,g,PLOTM,(x0+x1)/2,PAVE_H,(z0+z1)/2,false,true);}};
for(const [x0,x1,z0,z1] of [[-5.0,-3.2,-3.2,3.4],[-3.2,2.0,-3.2,3.4],[2.0,5.0,-3.2,3.4]])pave(x0+SW,x1-SW,z0+SW,z1-SW);
pave(-5.3,5.3,3.4+SW,5.3,0.05,false);pave(-5.3,5.3,-5.3,-3.2-SW,0.05,false);
{const bars=[];const zebra=(cx,cz,along)=>{for(let i=-2;i<=2;i++)bars.push(along==='x'?[cx+i*0.075,cz,0]:[cx,cz+i*0.075,1]);};
 for(const [x,z,d] of [[-3.2+0.55,3.4,'x'],[2.0-0.55,3.4,'x'],[2.0+0.55,3.4,'x'],[-3.2,3.4-0.55,'z'],[2.0,3.4-0.55,'z'],[-3.2+0.55,-3.2,'x'],[2.0-0.55,-3.2,'x'],[2.0,-3.2+0.55,'z']])zebra(x,z,d);
 const bg=new THREE.PlaneGeometry(0.036,0.4);bg.rotateX(-Math.PI/2);const im=new THREE.InstancedMesh(bg,new THREE.MeshBasicMaterial({color:0xa3a39e}),bars.length);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler();
 bars.forEach((b,i)=>{E.set(0,b[2]?Math.PI/2:0,0);Q.setFromEuler(E);M.compose(new THREE.Vector3(b[0],0.004,b[1]),Q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,M);});town.add(im);}
const TREES=[];function park(x0,x1,z0,z1,n){PARKM.push(tile(x0,x1,z0,z1,0x7cb158,PAVE_H+0.003,0));for(let i=0;i<n;i++)TREES.push([lerp(x0+0.12,x1-0.12,rnd()),0,lerp(z0+0.12,z1-0.12,rnd())]);}
// river bank and the river Spree at the back, with a small tour boat
PARKM.push(tile(-5.25,5.25,-5.25,-3.55,0x6fa552,PAVE_H+0.002,0));
const SPREE={z0:-4.75,z1:-4.02};
{const wm=new THREE.MeshStandardMaterial({color:0x1c3550,roughness:.12,metalness:.4,emissive:0x1a3a63,emissiveIntensity:.45});const g=new THREE.PlaneGeometry(10.5,SPREE.z1-SPREE.z0);g.rotateX(-Math.PI/2);mesh(town,g,wm,0,PAVE_H+0.007,(SPREE.z0+SPREE.z1)/2,false,true);
 const em=new THREE.MeshStandardMaterial({color:0xc9c4b8,roughness:.8,emissive:0xb9b4a8,emissiveIntensity:.25});for(const z of [SPREE.z0,SPREE.z1])box(town,10.5,0.03,0.05,em,0,0.015,z,false);
 for(let x=-5.0;x<=5.01;x+=0.25)KO.push([x,(SPREE.z0+SPREE.z1)/2,0.45]);}
const boat=new THREE.Group();town.add(boat);
{const hm=new THREE.MeshStandardMaterial({color:0xe8e8ea,roughness:.5,emissive:0xb0b4bc,emissiveIntensity:.35});mesh(boat,new RoundedBoxGeometry(0.5,0.05,0.14,2,0.02),hm,0,0.03,0);mesh(boat,new RoundedBoxGeometry(0.34,0.045,0.11,2,0.015),hm,-0.03,0.075,0);
 const wl=new THREE.MeshBasicMaterial({color:hdr(0xffe0b0,1.6)});for(const s of [-1,1])box(boat,0.3,0.016,0.002,wl,-0.03,0.078,s*0.056,false);mesh(boat,new THREE.SphereGeometry(0.008,6,5),glowMat(0xd8e6ff,2.5),0.24,0.065,0,false,false);}
// blocks: offices on the left, offices on the right (behind the plaza), a row of houses with a park at the front
building(-4.1,-2.2,1.15,1.15,0.95,{roof:'flat'});building(-4.1,-0.7,1.15,1.05,1.35,{roof:'green'});building(-4.1,0.85,0,0,1.7,{round:0.42});building(-4.1,2.35,1.15,1.05,0.7,{roof:'barrel',shop:'x'});
building(3.5,-2.3,2.3,0.95,0.8,{roof:'barrel'});building(2.85,-0.95,1.0,1.0,1.4,{roof:'flat',shop:'x'});building(4.15,-0.95,1.0,1.0,1.05,{roof:'hip'});
building(-4.2,4.45,1.0,0.8,0.75,{roof:'gable'});building(-2.9,4.45,1.0,0.8,1.05,{roof:'flat',shop:'z'});building(1.25,4.45,1.0,0.8,0.9,{roof:'hip',shop:'z'});building(2.55,4.45,0.95,0.8,1.3,{roof:'green'});building(3.95,4.45,0,0,1.15,{round:0.38});
park(-2.2,0.55,3.85,5.15,9);
// plaza for the LED columns on the right, lawn in front of the Reichstag (Platz der Republik) with a path along the front of the building
tile(2.3,4.7,0.05,3.1,0xb3ada2,PAVE_H+0.002,0.14);
PARKM.push(tile(-2.75,1.55,0.42,3.0,0x7cb158,PAVE_H+0.003,0));
tile(-2.75,1.55,0.42,0.6,0xcfc9bd,PAVE_H+0.004,0.22);
for(const z of [0.85,1.35,1.85,2.35,2.8])TREES.push([-2.55,0,z],[1.45,0,z]);
for(let x=-2.6;x<=1.45;x+=0.5)TREES.push([x,0,-2.75]);
for(let x=-4.8;x<=4.8;x+=0.55){TREES.push([x+0.15*rnd(),0,-3.8]);TREES.push([x+0.2*rnd(),0,-5.05]);}
// keep lamps and trees off the Reichstag, the lawn lights and the plaza
for(let x=-2.4;x<=1.21;x+=0.2)for(let z=-2.5;z<=0.45;z+=0.2)KO.push([x,z,0.16]);
for(let x=2.5;x<=4.5;x+=0.25)for(let z=0.3;z<=2.9;z+=0.25)KO.push([x,z,0.16]);
