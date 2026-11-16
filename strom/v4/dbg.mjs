import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message,(e.stack||'').split('\n').slice(0,4).join(' | ')));p.on('console',m=>console.log('CON',m.type(),m.text().slice(0,300)));
await p.goto('http://localhost:8769/modell.html');
try{await p.waitForFunction('window.ready===true',null,{timeout:+(process.argv[2]||40000)});console.log('READY');}catch(e){console.log('TIMEOUT');}
await b.close();
