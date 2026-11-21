import {chromium} from 'playwright';
// usage: node clipcheck.mjs t0 t1 [step]  -> lowest visible point of every prop over time (voice time)
const t0=+process.argv[2],t1=+process.argv[3],dt=+(process.argv[4]||1/30);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:540,height:960}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8777/kalender.html');await p.waitForFunction('window.ready===true',null,{timeout:300000});
const res=await p.evaluate(([t0,t1,dt])=>{const THREE=window.THREE_DBG;const out=[];const v=new THREE.Vector3();
  function minY(o){let m=Infinity;o.updateMatrixWorld(true);(function rec(n){if(!n.visible)return;if(n.isMesh&&n.geometry&&!n.userData.isOutline){const pos=n.geometry.attributes.position;const mw=n.matrixWorld;
      const step=Math.max(1,Math.floor(pos.count/4000));for(let i=0;i<pos.count;i+=step){v.fromBufferAttribute(pos,i).applyMatrix4(mw);if(v.y<m)m=v.y;}}n.children.forEach(rec);})(o);return m;}
  for(let t=t0;t<=t1+1e-6;t+=dt){window.setT(t);for(const k in window.DBGOBJ){const o=window.DBGOBJ[k].G;if(!o||!o.visible)continue;if(o.scale.x<0.02)continue;const m=minY(o);if(m<-0.0012)out.push([+t.toFixed(3),k,+m.toFixed(4)]);}}
  return out;},[t0,t1,dt]);
// compress into ranges per object
const by={};for(const [t,k,m] of res){(by[k]=by[k]||[]).push([t,m]);}
for(const k in by){let a=by[k],seg=[a[0]];const segs=[];for(let i=1;i<a.length;i++){if(a[i][0]-a[i-1][0]>dt*1.5){segs.push(seg);seg=[];}seg.push(a[i]);}segs.push(seg);
  for(const s of segs){const mn=Math.min(...s.map(x=>x[1]));console.log(k.padEnd(7),s[0][0].toFixed(2),'-',s[s.length-1][0].toFixed(2),'min y',mn.toFixed(4));}}
console.log('done',res.length);await b.close();
