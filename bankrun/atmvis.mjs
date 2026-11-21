// prints, per style, the screen height (px) of the largest cash machine for every frame → which frames show the machines
import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for (const s of [1,2]) {const p=await b.newPage({viewport:{width:1080,height:1920}}); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('http://localhost:8778/modell.html?s='+s); await p.waitForFunction('window.ready===true',null,{timeout:240000});
  const r=await p.evaluate(()=>{const o=[];for(let f=0;f<2675;f++)o.push(Math.round(window.atmSeen(f/30-0.15)));return o;});
  console.log('S'+s+' '+JSON.stringify(r)); await p.close();}
await b.close();
