import {chromium} from 'playwright';
// usage: node collide.mjs t0 t1 [step]  -> does the cash bundle intersect the shop counter or the wooden figures?
const t0=+process.argv[2],t1=+process.argv[3],dt=+(process.argv[4]||1/30);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:540,height:960}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8777/kalender.html');await p.waitForFunction('window.ready===true',null,{timeout:300000});
const res=await p.evaluate(([t0,t1,dt])=>{const THREE=window.THREE_DBG,O=window.DBGOBJ;const out=[];
  const pts=[];const N=6;for(let i=0;i<=N;i++)for(let j=0;j<=N;j++)for(let k=0;k<=2;k++){const x=-0.075+0.15*i/N,z=-0.0405+0.081*j/N,y=0.024*k/2;if(i===0||i===N||j===0||j===N||k!==1)pts.push(new THREE.Vector3(x,y,z));}
  const inPoly=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  const dSeg=(P,x,y)=>{let m=1;for(let i=0,j=P.length-1;i<P.length;j=i++){const [ax,ay]=P[j],[bx,by]=P[i];const vx=bx-ax,vy=by-ay,l=vx*vx+vy*vy||1;const u=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/l));m=Math.min(m,Math.hypot(ax+u*vx-x,ay+u*vy-y));}return m;};
  const inv=new THREE.Matrix4(),v=new THREE.Vector3();
  for(let t=t0;t<=t1+1e-6;t+=dt){window.setT(t);const c=O.cash.G;if(!c.visible)continue;c.updateMatrixWorld(true);const W=pts.map(q=>q.clone().applyMatrix4(c.matrixWorld));
    let hit=[];
    if(O.shop.G.visible){O.shop.G.updateMatrixWorld(true);inv.copy(O.shop.G.matrixWorld).invert();let d=0;for(const w of W){v.copy(w).applyMatrix4(inv);
      const inBody=Math.abs(v.x)<0.1&&v.y<0.075&&v.y>0&&Math.abs(v.z)<0.0375,inTop=Math.abs(v.x)<0.105&&v.y>=0.075&&v.y<0.081&&Math.abs(v.z)<0.0425;if(inBody||inTop)d=Math.max(d,0.081-v.y);}if(d>0)hit.push('shop '+d.toFixed(4));}
    for(const k of ['ma','mb']){const m=O[k];if(!m.G.visible)continue;m.B.updateMatrixWorld(true);inv.copy(m.B.matrixWorld).invert();let n=0;
      for(const w of W){v.copy(w).applyMatrix4(inv);if(Math.abs(v.z)<0.017+0.0005&&(inPoly(m.poly,v.x,v.y)||dSeg(m.poly,v.x,v.y)<0.0035))n++;}if(n)hit.push(k+' pts '+n);}
    if(hit.length)out.push(t.toFixed(3)+' '+hit.join(', '));}
  return out;},[t0,t1,dt]);
console.log(res.join('\n'));console.log('done',res.length);await b.close();
