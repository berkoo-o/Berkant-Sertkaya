// usage: node stills.mjs <style> <out-prefix> t1 t2 …   (voice times; server on port 8778 in bankrun/)
// also: node stills.mjs <style> check   → runs the collision self-check
import {chromium} from 'playwright';
const [,,s,out,...ts]=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('CON',m.text().slice(0,300))});
await p.goto('http://localhost:8778/modell.html?s='+s);
await p.waitForFunction('window.ready===true',null,{timeout:240000});
if(out==='check'){const r=await p.evaluate(()=>window.CHECK(1/15));console.log(JSON.stringify(r));}
else for(const t of ts){await p.evaluate(tv=>window.setT(+tv),t);await p.screenshot({path:`${out}_${t}.jpg`,type:'jpeg',quality:88});}
await b.close();
