import crypto from 'node:crypto';
import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const out='output/elyndor/pixellab-v26/clarity';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,channel:'chrome',args:['--allow-file-access-from-files','--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11']});
const p=await b.newPage({viewport:{width:1920,height:1080}}),errors=[],r={};p.setDefaultTimeout(180000);
p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
r.sha256=crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex');
try{
 await p.addInitScript(()=>localStorage.setItem('elyndor-settings-v3',JSON.stringify({voices:false,volume:0})));
 await p.goto(pathToFileURL(path.resolve('index.html')).href);await p.waitForFunction(()=>window.__ely);await p.click('#start-btn');await p.waitForFunction(()=>!gameLoading);
 await p.evaluate(()=>{state.settings.voices=false;state.settings.volume=0;stopRecordedVoice(true);while(dialogue)nextDialogue();state.encounterDistance=-100000;state.worldMinutes=15.5*60;state.settings.weather='clear';weather.rain.value=weather.wet.value=weather.snow.value=0;manualUntil=performance.now()+3600000;setupParty([-133,120]);updateCamera(1,true);updateLighting();tick(1/60);updateCamera(1,true);render();});
 r.graphics=await p.evaluate(()=>({buffer:renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),samples:post.target.samples,scale:perf.scale,yaw:Math.atan2(camera.position.x-cameraTarget.x,camera.position.z-cameraTarget.z)*180/Math.PI,pitch:sideCameraStats.angle,sun:sun.intensity,hemi:hemi.intensity,bounce:skyBounce17.intensity,spriteNearest:actors.every(a=>a.mesh.material.map.magFilter===THREE.NearestFilter),worldAnisotropy:scenery.surfaceArray.anisotropy,forestMaterials:world.userData.clarity23.sharedForestMaterials,fullSceneBlur:post.material.fragmentShader.includes('depthFocus'),replay:!!document.querySelector('#guide-replay')}));
 await p.screenshot({path:out+'/bridge.png'});
 r.roads=await p.evaluate(()=>{let maxError=0;for(let i=0;i<1200;i++){const x=-240+Math.sin(i*7.913)*440,z=-45+Math.cos(i*2.817)*260;let d=65,kind='trail';for(const q of ROAD_GRID.get(Math.floor(x/32)+','+Math.floor(z/32))??[]){if(x<q.minX-55||x>q.maxX+55||z<q.minZ-55||z>q.maxZ+55)continue;const v=segmentDistance(x,z,q.a,q.b);if(v<d){d=v;kind=q.kind;}}for(const t of TOWNS){const v=Math.max(0,Math.hypot(x-t.x,z-t.z)-(t.id==='highmere'?8:t.id==='square'?7:t.id==='fern'?6:4));if(v<d){d=v;kind='lane';}}const actual=roadsBeforeBrook(x,z);const plaza=Math.hypot(Math.max(-128-x,0,x+110),Math.max(48-z,0,z-57));maxError=Math.max(maxError,Math.abs(actual.d-Math.min(d,plaza)));}return {points:1200,maxError};});
 r.directions=[];
 for(const key of ['w','d','s','a','ArrowUp','ArrowRight','ArrowDown','ArrowLeft']){
  await p.evaluate(()=>{setupParty([-133,120]);updateCamera(1,true);keys.clear();});
  const before=await p.evaluate(()=>{const b=screenBasis();return {x:player.x,z:player.z,right:b.right.toArray(),down:b.down.toArray()};});
  await p.keyboard.down(key);await p.evaluate(()=>advanceTime(120));await p.keyboard.up(key);
  const after=await p.evaluate(()=>({x:player.x,z:player.z,face:player.face,followers:followers.map(a=>dist(a,player))}));
  const dx=after.x-before.x,dz=after.z-before.z,axis=['a','d','ArrowLeft','ArrowRight'].includes(key)?before.right:before.down,sign=['a','w','ArrowLeft','ArrowUp'].includes(key)?-1:1;
  r.directions.push({key,...after,screenProgress:(dx*axis[0]+dz*axis[2])*sign});
 }
 for(const [name,x,z,h] of [['residential',-113,106,15.5],['square',-121,69,15.5],['late-afternoon',-113,106,17],['night',-113,106,23]]){
  await p.evaluate(({x,z,h})=>{state.worldMinutes=h*60;const q=safePoint({x,z});setupParty([q.x,q.z]);updateCamera(1,true);updateLighting();for(let i=0;i<6;i++)tick(1/60);updateCamera(1,true);render();},{x,z,h});
  await p.screenshot({path:`${out}/${name}.png`});
 }
 await p.evaluate(()=>{state.worldMinutes=14*60;state.flags.combat_tutorial_complete=true;setupParty([-62,89]);beginBattle('wildlife');battle.intro=0;makeQueue();updateLighting();updateCamera(1,true);render();});await p.screenshot({path:out+'/battle.png'});
 r.battle=await p.evaluate(()=>({yaw:Math.atan2(camera.position.x-cameraTarget.x,camera.position.z-cameraTarget.z)*180/Math.PI,frames:actors.filter(a=>a.party||a.enemy).map(a=>({id:a.id,action:a.frame.action})),cover:world.userData.combatSight18}));
 await p.evaluate(()=>{endBattle('fled');state.flags.prologue_complete=true;});
 await p.evaluate(()=>changeJourneyScene('overworld',[-215,24]));await p.waitForFunction(()=>!gameLoading);
 await p.evaluate(()=>{while(dialogue)nextDialogue();state.worldMinutes=14*60;manualUntil=0;});await p.waitForTimeout(2200);
 r.overworld=await p.evaluate(()=>({gpuMs:clarity23.gpuMs,gpuSamples:clarity23.gpuSamples,queries:clarity23.queries.length,allTrees:scenery.trees.length,cutawayCandidates:world.userData.clarity23.nearTrees.length,buffer:renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),scale:perf.scale}));await p.screenshot({path:out+'/overworld.png'});
 r.errors=errors;r.pass=!errors.length&&r.graphics.buffer[0]===1920&&r.graphics.buffer[1]===1080&&r.graphics.samples>=2&&Math.abs(r.graphics.yaw)<.01&&r.graphics.pitch>20&&r.graphics.pitch<25&&r.graphics.spriteNearest&&!r.graphics.fullSceneBlur&&!r.graphics.replay&&r.directions.every(d=>d.screenProgress>.1)&&r.roads.maxError<1e-8&&r.battle.yaw<2&&r.overworld.scale===1&&r.overworld.cutawayCandidates<r.overworld.allTrees/8&&r.overworld.queries<=8;
 fs.writeFileSync(out+'/report.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r));if(!r.pass)process.exitCode=1;
}catch(e){r.failure=e.stack;r.errors=errors;fs.writeFileSync(out+'/report.json',JSON.stringify(r,null,2));console.error(e);process.exitCode=1;}finally{await b.close();}
