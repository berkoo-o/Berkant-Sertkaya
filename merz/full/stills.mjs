import {chromium} from 'playwright';
const frames=process.argv.slice(3).map(Number);const out=process.argv[2];
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});
await p.goto('http://localhost:8776/'+(process.env.PAGE||'modell.html'));
await p.waitForFunction('window.ready===true',null,{timeout:300000});
for(const f of frames){await p.evaluate(f=>renderAt(f),f);await p.screenshot({path:`${out}/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:92,timeout:180000});}
await b.close();
