// prüft alle sichtbaren Schilder (Sprites): ragen sie über den Bildrand?
import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8780/vermoegen/modell.html');
await p.waitForFunction('window.ready===true',null,{timeout:600000});
const r=await p.evaluate(async()=>{const {THREE,scene,cam}=window.DBGO; const out=[]; const M=24;
  for(let t=0;t<=70.0001;t+=0.1){window.setT(t); cam.updateMatrixWorld(); const R=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0), U=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1);
    scene.traverseVisible(o=>{if(!o.isSprite||(o.material.opacity??1)<0.05)return; const c=o.getWorldPosition(new THREE.Vector3()), s=o.getWorldScale(new THREE.Vector3());
      let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const [a,bb] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const v=c.clone().addScaledVector(R,a*s.x/2).addScaledVector(U,bb*s.y/2).project(cam); const px=(v.x+1)/2*1080, py=(1-v.y)/2*1920; x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);}
      const onscreen=x1>0&&x0<1080&&y1>0&&y0<1920; if(onscreen&&(x0<M||x1>1080-M||y0<M||y1>1920-M)) out.push([+t.toFixed(1),(o.material.map?.image?.width+'x'+o.material.map?.image?.height+'@'+c.x.toFixed(2)+','+c.y.toFixed(2)+','+c.z.toFixed(2)),Math.round(x0),Math.round(x1),Math.round(y0),Math.round(y1),+(o.material.opacity??1).toFixed(2)]);});}
  return out;});
const by={}; for(const e of r){const k=e[1]+''; (by[k]=by[k]||[]).push(e);} 
for(const k in by){const a=by[k]; console.log(k, a.length,'Bilder, von',a[0][0],'bis',a[a.length-1][0]); for(const e of a.filter((_,i)=>i%5===0).slice(0,12)) console.log('   ',JSON.stringify(e));}
console.log('fertig,',r.length,'Treffer');
await b.close();
