// usage: node cover.mjs out.png [query]   (renders cover_strom.html as a 1080x1920 PNG)
import {chromium} from 'playwright';
const [,,out,q='']=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});
await p.goto('http://localhost:8769/cover_strom.html'+q);
await p.waitForFunction('window.ready===true',null,{timeout:120000});
await p.screenshot({path:out,type:'png'});await b.close();
