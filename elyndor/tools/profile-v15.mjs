import{chromium}from'playwright';import fs from'node:fs';import path from'node:path';import{pathToFileURL}from'node:url';
const software=process.argv.includes('--software'),out='output/elyndor/pixellab-v15/performance';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--allow-file-access-from-files','--enable-webgl','--ignore-gpu-blocklist','--use-angle='+(software?'swiftshader':'d3d11')]});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],report={software,scenarios:[]};page.setDefaultTimeout(240000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{const start=Date.now();await page.goto(pathToFileURL(path.resolve(process.argv[2]??'elyndor.preview.html')).href);await page.waitForFunction(()=>window.__ely);report.loadMs=Date.now()-start;await page.click('#start-btn');await page.waitForFunction(()=>document.querySelector('#load-screen').classList.contains('hidden'),null,{timeout:120000});await page.keyboard.press('Space');await page.keyboard.press('Space');await page.evaluate(()=>{state.settings.volume=0;state.settings.voices=false;state.encounterDistance=-100000;state.worldMinutes=14*60;});
 report.device=await page.evaluate(()=>({renderer:scenery.rendererName,software:scenery.software}));
 for(const[name,id,x,z]of[['bridge','entrance',-133,120],['square','entrance',-128,67],['forest','fern',87,82],['overworld','overworld',-215,24],['shop','brookShop',0,5]]){
  await page.evaluate(({id,x,z})=>changeJourneyScene(id,[x,z]),{id,x,z});
  await page.evaluate(([x,z])=>{const p=safePoint({x,z});player.x=p.x;player.z=p.z;setupParty([p.x,p.z]);updateCamera(1,true);manualUntil=0;},[x,z]);await page.waitForTimeout(2000);
  const r=await page.evaluate(async()=>{
   const oldRender=render,oldTick=tick,times=[],cost=[],draws=[];let ticks=0;const start=performance.now();renderer.info.autoReset=false;
   render=function(){renderer.info.reset();const a=performance.now();oldRender();times.push(a);cost.push(performance.now()-a);draws.push({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});};tick=function(...a){ticks++;return oldTick(...a);};
   await new Promise(r=>setTimeout(r,4000));const elapsed=performance.now()-start;render=oldRender;tick=oldTick;renderer.info.autoReset=true;
   const intervals=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b),sum=a=>a.reduce((x,y)=>x+y,0)/a.length;
   return{fps:times.length/elapsed*1000,p95FrameMs:intervals[Math.floor(intervals.length*.95)],meanRenderCpuMs:sum(cost),ticks,calls:sum(draws.map(d=>d.calls)),triangles:sum(draws.map(d=>d.triangles)),buffer:renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),scale:perf.scale,shadow:sun.shadow.mapSize.toArray(),programs:renderer.info.programs.length,worldSerial:world.userData.serial};
  });report.scenarios.push({name,...r});console.log(JSON.stringify({name,...r}));await page.screenshot({path:out+'/'+(software?'software':'native')+'-'+name+'.png'});
 }report.errors=errors;fs.writeFileSync(out+'/'+(software?'software':'native')+'.json',JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
}catch(e){report.failure=e.stack;report.errors=errors;fs.writeFileSync(out+'/'+(software?'software':'native')+'.json',JSON.stringify(report,null,2));console.error(e);process.exitCode=1;}finally{await browser.close();}
