import{chromium}from'playwright';import fs from'node:fs';import path from'node:path';import{pathToFileURL}from'node:url';
const out='output/elyndor/pixellab-v10/world';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--allow-file-access-from-files','--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11']});
const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],report={};p.setDefaultTimeout(240000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await p.goto(pathToFileURL(path.resolve('index.html')).href);await p.waitForFunction(()=>window.__ely);await p.click('#start-btn');await p.waitForFunction(()=>document.querySelector('#load-screen').classList.contains('hidden'),null,{timeout:120000});await p.keyboard.press('Space');await p.keyboard.press('Space');
 await p.evaluate(()=>{manualUntil=performance.now()+600000;state.settings.voices=false;state.settings.volume=0;state.encounterDistance=-100000;});
 report.joins=await p.evaluate(()=>world.userData.brookFallObjects.flatMap(fall=>{
  const rows=[],g=fall.geometry,cols=13,join=fall.userData.join;
  for(const [row,z,y]of[[0,join.z-.8,join.top],[32,join.z+.8,join.bottom]]){
   const pool=world.userData.waterPools.find(o=>o.position.y===y)??water,pp=pool.geometry.attributes.position,fp=g.attributes.position,fn=g.attributes.normal;let maxGap=0,maxNormal=0;
   for(let col=0;col<cols;col++){const i=row*cols+col,v=V3().fromBufferAttribute(fp,i).add(fall.position);let gap=Infinity;for(let j=0;j<pp.count;j++){if(Math.abs(pp.getZ(j)+pool.position.z-z)>.0001)continue;gap=Math.min(gap,v.distanceTo(V3().fromBufferAttribute(pp,j).add(pool.position)));}maxGap=Math.max(maxGap,gap);maxNormal=Math.max(maxNormal,V3().fromBufferAttribute(fn,i).distanceTo(V3(0,1,0)));}
   rows.push({fall:join.z,end:row?'toe':'lip',z,y,maxGap,maxNormal,physical:fall.material.isMeshStandardMaterial===true,sameColor:fall.material.color.equals(pool.material.color),sameRoughness:fall.material.roughness===pool.material.roughness,registered:fall.parent===world,controlsShared:fall.material.userData.riverReflection.cascade===join.z});
  }return rows;
 }));
 report.approaches=await p.evaluate(()=>{
  const rows=[];for(const town of TOWNS)for(const offset of [0,8]){const objects=interactables.filter(o=>Math.hypot(o.x-town.x,o.z-town.z)<town.r+5);for(const o of objects){const goal=safePoint(o),start=safePoint({x:town.x+offset,z:town.z+offset}),path=findRoute(start,goal);rows.push({start,room:roomAt(start.x,start.z)?.id,town:town.id,type:o.type,free:staticFree(goal.x,goal.z,.52),route:!!path,valid:!!path&&path.every((q,i)=>edgeFree(i?path[i-1]:start,q,.36)),offset:Math.hypot(goal.x-o.x,goal.z-o.z)});}}
  return rows;
 });
 for(const [name,hour,gate,pump]of[['day-closed',14,false,false],['day-restored',14,true,true],['night-restored',22,true,true]]){
  await p.evaluate(({hour,gate,pump})=>{state.worldMinutes=hour*60;state.flags.gate_open=gate;state.flags.pump_repaired=pump;setupParty([-155,84]);for(let i=0;i<300;i++)tick(1/60);updateLighting();updateCamera(1,true);toastTime=0;$('#toast').classList.remove('show');updateHUD();render();},{hour,gate,pump});
  await p.screenshot({path:out+'/'+name+'.png'});
 }
 report.reflectionTargets=await p.evaluate(()=>world.userData.brookFallObjects.map(o=>{const r=o.material.userData.riverReflection;return{z:o.userData.join.z,distinct:r.texture!==r.upperTexture,upperMatrix:r.upperMatrix===world.userData.waterPools.find(p=>p.position.y===o.userData.join.top).userData.reflMatrix};}));
 report.errors=errors;report.pass=report.joins.every(r=>r.maxGap<.00005&&r.maxNormal<.00001&&r.physical&&r.sameColor&&r.sameRoughness&&r.registered&&r.controlsShared)&&report.approaches.every(r=>r.free&&r.route&&r.valid)&&report.reflectionTargets.every(r=>r.distinct&&r.upperMatrix)&&!errors.length;
 fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({pass:report.pass,joins:report.joins,approaches:report.approaches.length,failedApproaches:report.approaches.filter(r=>!r.free||!r.route||!r.valid),errors}));if(!report.pass)process.exitCode=1;
}catch(e){report.failure=e.stack;report.errors=errors;fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.error(e);process.exitCode=1;}finally{await browser.close();}
