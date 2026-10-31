import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const out='output/elyndor/pixellab-v32/endurance';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,channel:'chrome',args:['--disable-features=CalculateNativeWinOcclusion','--allow-file-access-from-files','--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11','--enable-precise-memory-info']});
const p=await b.newPage({viewport:{width:1920,height:1080}}),errors=[],r={phases:[],resources:[],acceleratedSeconds:0};p.setDefaultTimeout(180000);
p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const write=()=>fs.writeFileSync(out+'/report.json',JSON.stringify({...r,errors},null,2));
r.sha256=crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex');
try{
 await p.addInitScript(()=>localStorage.setItem('elyndor-settings-v3',JSON.stringify({voices:false,volume:0})));
 await p.goto(pathToFileURL(path.resolve('index.html')).href);await p.waitForFunction(()=>window.__ely);await p.click('#start-btn');await p.waitForFunction(()=>!gameLoading);
 await p.evaluate(()=>{state.settings.voices=false;state.settings.volume=0;stopRecordedVoice(true);while(dialogue)nextDialogue();state.encounterDistance=-100000;state.flags.combat_tutorial_complete=true;state.flags.prologue_complete=true;state.worldMinutes=14*60;state.settings.weather='clear';weather.rain.value=weather.wet.value=weather.snow.value=0;});
 const cdp=await p.context().newCDPSession(p);
 async function visit(id){await p.evaluate(id=>changeJourneyScene(id),id);await p.waitForFunction(()=>!gameLoading);await p.evaluate(()=>{while(dialogue)nextDialogue();manualUntil=performance.now()+3600000;});}
 async function sample(name,seconds=30){
  await p.bringToFront();
  const hardware=[];const monitor=setInterval(()=>{try{hardware.push(execFileSync('nvidia-smi',['--query-gpu=pstate,temperature.gpu,utilization.gpu,clocks.current.graphics,clocks.current.memory,power.draw','--format=csv,noheader,nounits'],{encoding:'utf8',timeout:2000}).trim());}catch{}},5000);monitor.unref();
  const result=await p.evaluate(async({name,seconds})=>{const base=render,draw=[],cpu=[];render=function(...args){const t=performance.now();const result=base(...args);draw.push(t);cpu.push(performance.now()-t);return result;};manualUntil=0;const start=performance.now();await new Promise(r=>setTimeout(r,seconds*1000));const elapsed=performance.now()-start;manualUntil=performance.now()+3600000;render=base;const stat=a=>{a.sort((a,b)=>a-b);return {mean:a.reduce((s,v)=>s+v,0)/a.length,p95:a[Math.floor(a.length*.95)],p99:a[Math.floor(a.length*.99)],max:a.at(-1)};};return {name,seconds:elapsed/1000,fps:draw.length/elapsed*1000,frame:stat(draw.slice(1).map((v,i)=>v-draw[i])),renderCPU:stat(cpu),scale:perf.scale,buffer:renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),gpuMs:clarity23.gpuMs,fx:fx.length,weather:weather.name,device:scenery.rendererName};},{name,seconds});
  clearInterval(monitor);result.hardware=hardware;r.phases.push(result);write();console.log(JSON.stringify(result));
 }
 async function resource(name){await cdp.send('HeapProfiler.collectGarbage');const q=await p.evaluate(()=>({scene:activeScene.key,heap:performance.memory.usedJSHeapSize,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs.length,keepers:sceneProgramKeepers.size,queries:clarity23.queries.length,fx:fx.length,nav:world.userData.navCache?.size,roadCache:constructionCache.roads.size}));r.resources.push({name,...q});write();console.log(JSON.stringify({resources:name,...q}));}
 for(const id of ['fern','brookInn','overworld','highmere','harbor','nearbySite','entrance'])await visit(id);
 await p.evaluate(()=>{setupParty([-133,120]);updateCamera(1,true);state.flags.gate_open=state.flags.pump_repaired=true;state.river17={released:true,age:180};for(let i=0;i<6;i++)tick(1/60);render();});
 await sample('warm-town',30);await resource('warm');
 for(let round=0;round<4;round++){
  for(const id of ['brookInn','fern','overworld','highmere','harbor','entrance'])await visit(id);
  await p.evaluate(()=>{state.members=['bren','soren','tavin','mira','lysa'];setupParty([-62,89]);beginBattle('commander3');battle.intro=0;makeQueue();for(let i=0;i<12;i++)castFX(['fire','ice','arcane','blade'][i%4],player.mesh.position.clone().add(V3(0,1,0)),battle.enemies[0].actor.mesh.position.clone().add(V3(0,1,0)),true);for(let i=0;i<420;i++)tick(1/60);render();endBattle('fled');state.members=['bren','soren'];setupParty([-133,120]);updateCamera(1,true);render();});
  await sample('after-travel-and-battle-'+round,10);await resource('round-'+round);
 }
 // Simulate thirty minutes of continuous NPC paths, world clock, quest guide,
 // water, weather and sound updates. Separate from wall-clock FPS measurements.
 for(let chunk=0;chunk<60;chunk++){await p.evaluate(()=>{manualUntil=performance.now()+3600000;advanceTime(30000,false);});r.acceleratedSeconds+=30;if(chunk%10===9){write();console.log(JSON.stringify({acceleratedSeconds:r.acceleratedSeconds}));}}
 await sample('town-after-thirty-minutes',45);await resource('after-thirty-minutes');
 await visit('overworld');await sample('overworld-extended',60);
 await p.evaluate(()=>{state.settings.weather='storm';weather.rain.value=weather.wet.value=1;weather.cloud.value=1;updateLighting();});await sample('storm-overworld-extended',60);
 await visit('nearbySite');await p.evaluate(()=>{state.settings.weather='clear';weather.rain.value=weather.wet.value=0;state.worldMinutes=14*60;state.members=['bren','soren','tavin','mira','lysa'];const q=__ely.interactions.find(q=>q.type==='commander3');setupParty([q.x,q.z+5]);beginBattle('commander3');battle.intro=0;makeQueue();for(const e of battle.enemies)e.hp=e.maxHp=100000;for(const c of Object.values(state.characters)){c.hp=100000;c.mp=9999;}window.enduranceAuto23=setInterval(()=>{if(!battle)return;if(battle.status==='combo'){const c=battle.combo;if(!c.input&&c.t/c.duration>=.7&&c.t/c.duration<=.82)comboHit();}else if(battle.status==='choose'&&currentFighter()){battleAction('skill',0);if(battle.pending)battleAllyTarget(0);}},25);});
 await sample('continuous-battle-skills',60);await p.screenshot({path:out+'/battle.png'});
 await p.evaluate(()=>{clearInterval(enduranceAuto23);endBattle('fled');state.members=['bren','soren'];});await p.evaluate(()=>{state.settings.weather='clear';weather.rain.value=weather.wet.value=weather.snow.value=0;});await visit('entrance');await p.evaluate(()=>{setupParty([-133,120]);updateCamera(1,true);state.worldMinutes=14*60;for(let i=0;i<600;i++)tick(1/60);render();});
 await sample('final-town',30);await resource('final');await p.screenshot({path:out+'/final-town.png'});
 const warm=r.resources.find(q=>q.name==='round-1'),last=r.resources.at(-1);r.growth={heap:last.heap-warm.heap,geometries:last.geometries-warm.geometries,textures:last.textures-warm.textures,programs:last.programs-warm.programs};
 r.scope='Native headless Chrome with Windows occlusion detection disabled at 1920x1080 on recorded device; uncapped monitor cadence, four repeated travel/combat rounds, thirty simulated minutes plus sustained real-time town, overworld, storm and skill battles. Garbage collection is test-only for retained-memory comparison.';
 r.pass=warm.scene===last.scene&&last.scene==='brookstead'&&!errors.length&&r.phases.every(q=>q.fps>=59&&q.frame.p95<26&&q.scale>=.99)&&r.growth.heap<30e6&&r.growth.geometries<30&&r.growth.textures<4&&r.resources.every(q=>q.queries<=8&&q.roadCache<=50000);write();console.log(JSON.stringify({pass:r.pass,growth:r.growth,errors}));if(!r.pass)process.exitCode=1;
}catch(e){r.failure=e.stack;write();console.error(e);process.exitCode=1;}finally{await b.close();}
