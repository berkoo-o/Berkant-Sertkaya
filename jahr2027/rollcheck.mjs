import {chromium} from 'playwright';
// does the rolling marker in the outro touch any of the props? (samples along the marker axis against each prop's box)
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:540,height:960}});await p.goto('http://localhost:8777/kalender.html');await p.waitForFunction('window.ready===true',null,{timeout:300000});
const r=await p.evaluate(()=>{const THREE=window.THREE_DBG,O=window.DBGOBJ;const out=[];const box=new THREE.Box3(),v=new THREE.Vector3();
  for(let t=73.45;t<=74.95;t+=1/60){window.setT(t);const m=O.marker.G;m.updateMatrixWorld(true);
    for(const k of ['slip','ticket','depot','piggy','kg','bars','lic','stack','env','cash']){const o=O[k].G;if(!o.visible)continue;box.setFromObject(o,true).expandByScalar(0.0096);
      for(let y=0;y<=0.155;y+=0.005){v.set(0,y,0).applyMatrix4(m.matrixWorld);if(box.containsPoint(v)){out.push(t.toFixed(3)+' '+k);break;}}}}
  return out;});
console.log(r.join('\n')||'no contact');await b.close();
