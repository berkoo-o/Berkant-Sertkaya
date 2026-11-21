// usage: node cover.mjs out.png "?v=1"   (server on port 8778 in bankrun/)
import {chromium} from 'playwright';
const [,,out,q='']=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});
await p.goto('http://localhost:8778/cover/cover_bankrun.html'+q);
await p.waitForFunction('window.ready===true',null,{timeout:180000});
await p.screenshot({path:out,type:'png'});await b.close();
