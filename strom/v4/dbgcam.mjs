// usage: node dbgcam.mjs out.jpg frame tx ty tz dist az el   (free camera for checks)
import {chromium} from 'playwright';
const [,,out,f,...c]=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8769/modell.html');
await p.waitForFunction('window.ready===true',null,{timeout:300000});
await p.evaluate(([c,f])=>{window.DBG=c.map(Number);document.getElementById('ov').style.display='none';document.getElementById('shade').style.display='none';return renderAt(+f);},[c,f]);
await p.screenshot({path:out,type:'jpeg',quality:92});
await b.close();
