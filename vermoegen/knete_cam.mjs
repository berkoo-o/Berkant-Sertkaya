// usage: node knete_cam.mjs <out-prefix> <t> "x,y,z,s,az,el,fov" …   (Kameravarianten zum Vergleichen)
import {chromium} from 'playwright';
const [,,out,t,...cams]=process.argv;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
for(const [k,c] of cams.entries()){await p.goto('http://localhost:8780/vermoegen/knete.html?cam='+c);await p.waitForFunction('window.ready===true',null,{timeout:600000});
  await p.evaluate(tv=>window.setT(+tv),t);await p.screenshot({path:`${out}_${k}.jpg`,type:'jpeg',quality:80});console.log(k,c);}
await b.close();
