// usage: node knete_shot.mjs <out-prefix> t1 t2 …   (Stimm-Zeiten; Server auf Port 8780 im Hauptordner)
//        node knete_shot.mjs check                (Flugbahnen und Beschriftungen prüfen)
import {chromium} from 'playwright';
const [,,out,...ts]=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('CON',m.text().slice(0,300))});
const t0=Date.now();
await p.goto('http://localhost:8780/vermoegen/knete.html');
await p.waitForFunction('window.ready===true',null,{timeout:600000});
console.log('geladen in',((Date.now()-t0)/1000).toFixed(1),'s');
if(out==='check'){console.log(JSON.stringify(await p.evaluate(()=>window.CHECK(1/30))));console.log(JSON.stringify(await p.evaluate(()=>window.CHECK_LABELS(0.1))));}
else for(const t of ts){const a=Date.now();await p.evaluate(tv=>window.setT(+tv),t);await p.screenshot({path:`${out}_${t}.jpg`,type:'jpeg',quality:86});console.log(t,((Date.now()-a)/1000).toFixed(1),'s');}
await b.close();
