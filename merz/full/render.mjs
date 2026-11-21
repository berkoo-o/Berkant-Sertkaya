import {chromium} from 'playwright';
import {execSync} from 'child_process';
import fs from 'fs';
const [,,from=0,to,outDir='frames',step=1]=process.argv;
fs.mkdirSync(outDir,{recursive:true});
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('console',m=>console.log('PAGE',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(''+'http://localhost:8776/'+(process.env.PAGE||'index.html')+'');
await p.waitForFunction('window.ready===true',null,{timeout:900000});
const total=await p.evaluate('TOTAL');const end=to?+to:total;
for(let f=+from;f<end;f+=+step){await p.evaluate(f=>renderAt(f),f);
  await p.screenshot({path:`${outDir}/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:93,timeout:180000});}
await b.close();
