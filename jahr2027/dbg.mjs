import {chromium} from 'playwright';
// usage: node dbg.mjs out.jpg tv x y z d az el   (camera override)
const [,,out,tv,...c]=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8777/kalender.html');await p.waitForFunction('window.ready===true',null,{timeout:300000});
if(c.length)await p.evaluate(c=>{window.DBG=c.map(Number);},c);
await p.evaluate(f=>renderAt(f),Math.round((+tv+0.15)*30));await p.screenshot({path:out,type:'jpeg',quality:88});await b.close();
