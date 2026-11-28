import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message,(e.stack||'').split('\n').slice(0,3).join(' | ')));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text().slice(0,300))});
await p.goto('http://localhost:8770/modell.html');
try{await p.waitForFunction('window.ready===true',null,{timeout:90000});console.log('READY');}catch(e){console.log('TIMEOUT');}
await b.close();
