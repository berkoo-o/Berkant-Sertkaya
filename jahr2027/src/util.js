// shared helpers for the 2027 calendar video
import * as THREE from 'three';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,u)=>a+(b-a)*u;
export const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
export const eo=x=>{x=clamp(x,0,1);return 1-(1-x)**3;};
export const ei=x=>{x=clamp(x,0,1);return x*x*x;};
export const eio=x=>{x=clamp(x,0,1);return x<.5?4*x**3:1-(-2*x+2)**3/2;};
export const ebk=(x,s=1.4)=>{x=clamp(x,0,1);const c3=s+1;return 1+c3*(x-1)**3+s*(x-1)**2;};
export const win=(t,a,b,f=0.25)=>Math.min(clamp((t-a)/f,0,1),clamp((b-t)/f,0,1));
export const rng=seed=>()=>(seed=(seed*16807)%2147483647)/2147483647;
export const RED=0xE01E2B, REDS='#E01E2B', INK='#17171c', PAPER='#f1ece2', GRAPH='#4a4e57';
export const hdr=(c,i)=>new THREE.Color(c).multiplyScalar(i);
// canvas + texture pair; redraw with tex.needsUpdate=true
export function ctex(w,h,draw,opt={}){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(draw)draw(g,w,h);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(opt.repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;}return {c,g,tex:t};}
// paper grain: very fine noise so flat paper does not look like plastic
export function grain(g,w,h,amt=10,seed=7){const r=rng(seed);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(r()-0.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(id,0,0);}
export function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
// keyframe track for object poses: keys [t,{p:[x,y,z],r:[x,y,z],s,e:'io'|'out'|'back'|'lin'}]; easing of a segment is set by the key it ends on
export function track(keys){return t=>{if(t<=keys[0][0])return keys[0][1];for(let i=0;i<keys.length-1;i++){const [t0,a]=keys[i],[t1,b]=keys[i+1];if(t<t1){const u0=(t-t0)/(t1-t0);
  const EZ=e=>e==='o2'?1-(1-u0)*(1-u0):e==='out'?eo(u0):e==='back'?ebk(u0,b.k||1.3):e==='lin'?u0:e==='in'?ei(u0):eio(u0);const u=EZ(b.e||'io'),up=b.ep?EZ(b.ep):u;
  const L3=(p,q,w)=>[lerp(p[0],q[0],w),lerp(p[1],q[1],w),lerp(p[2],q[2],w)];
  // ep: separate easing for the position (e.g. a scale pop with 'back' without the object dipping into the desk)
  return {p:L3(a.p,b.p,up),r:L3(a.r||[0,0,0],b.r||[0,0,0],u),s:lerp(a.s??1,b.s??1,u),v:lerp(a.v??1,b.v??1,u)};}}return keys[keys.length-1][1];};}
export function applyPose(o,q){o.position.set(q.p[0],q.p[1],q.p[2]);o.rotation.set(q.r[0],q.r[1],q.r[2]);o.scale.setScalar(Math.max(1e-4,q.s??1));o.visible=(q.v??1)>0.001&&(q.s??1)>0.002;}
// a hand-drawn ring around (cx,cy) in canvas pixels: returns points with progress so a pen can follow it
export function ringPath(cx,cy,rx,ry,seed=3,sweep=Math.PI*2+0.55,a0=-2.2){const r=rng(seed);const ph=[r()*6,r()*6,r()*6];const P=[];const N=180;
  for(let i=0;i<=N;i++){const u=i/N,a=a0+sweep*u;const k=1+0.035*Math.sin(2*a+ph[0])+0.018*Math.sin(5*a+ph[1])-0.07*u;P.push([cx+Math.cos(a)*rx*k+3*Math.sin(9*u+ph[2]),cy+Math.sin(a)*ry*k]);}return P;}
// marker / pencil stroke along a point list up to progress u (0..1); returns the tip
export function strokePath(g,P,u,o){if(u<=0)return P[0];const n=Math.max(1,Math.floor((P.length-1)*clamp(u,0,1)));g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=o.color;g.globalAlpha=o.alpha??0.93;
  if(o.dash)g.setLineDash(o.dash);g.lineWidth=o.width;g.beginPath();g.moveTo(P[0][0],P[0][1]);for(let i=1;i<=n;i++)g.lineTo(P[i][0],P[i][1]);g.stroke();
  if(o.core){g.globalAlpha=o.core;g.lineWidth=o.width*0.45;g.strokeStyle=o.coreColor||'#ff4a55';g.stroke();}g.restore();return P[n];}
