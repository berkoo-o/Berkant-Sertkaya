// usage: node shot.mjs "knete_test.html?v=1" out.png   (1080x1920 PNG; server on port 8780 im Hauptordner)
import {chromium} from 'playwright';
const [,,page,out]=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});
await p.goto('http://localhost:8780/vermoegen/'+page);
await p.waitForFunction('window.ready===true',null,{timeout:300000});
await p.screenshot({path:out,type:'png'});await b.close();
