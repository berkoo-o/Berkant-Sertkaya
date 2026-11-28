import {chromium} from 'playwright';
// usage: node stills.mjs outDir t1 t2 ...   (voice-time seconds; the video adds 0.15 s)
const out=process.argv[2];const ts=process.argv.slice(3).map(Number);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error'||m.text().startsWith('DBG'))console.log('CON',m.text())});
await p.goto('http://localhost:8777/'+(process.env.PAGE||'kalender.html'));
await p.waitForFunction('window.ready===true',null,{timeout:300000});
for(const t of ts){const f=Math.round((t+0.15)*30);const t0=Date.now();await p.evaluate(f=>renderAt(f),f);await p.screenshot({path:`${out}/t${t.toFixed(2).padStart(5,'0')}.jpg`,type:'jpeg',quality:90,timeout:180000});console.log('t',t,'ms',Date.now()-t0);}
await b.close();
