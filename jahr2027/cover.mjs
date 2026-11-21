import {chromium} from 'playwright';
const out=process.argv[2]||'cover.png';
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8777/cover.html');await p.waitForFunction('window.ready===true',null,{timeout:300000});
await p.evaluate(()=>renderCover());await p.screenshot({path:out});await b.close();
