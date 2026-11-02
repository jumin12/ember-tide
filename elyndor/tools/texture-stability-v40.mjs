import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import crypto from 'node:crypto';
const input=process.argv[2]??'index.html',baseline=process.argv.includes('--baseline'),out='output/elyndor/flicker-v40/'+(baseline?'baseline':'fixed');fs.mkdirSync(out,{recursive:true});
const report={artifact:input,sha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),errors:[],cases:[],scenes:[]};
const b=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11','--allow-file-access-from-files']});
try{
 const p=await b.newPage({viewport:{width:1440,height:900}});p.setDefaultTimeout(180000);p.on('pageerror',e=>report.errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,1000));});await p.addInitScript(()=>localStorage.setItem('elyndor-settings-v3',JSON.stringify({voices:false,volume:0})));
 await p.goto(pathToFileURL(path.resolve(input)).href);await p.waitForFunction(()=>window.__ely&&title19.ready&&!title19.busy);await p.click('#start-btn');await p.waitForFunction(()=>!gameLoading);
 await p.evaluate(()=>{while(dialogue)nextDialogue();manualUntil=performance.now()+1e7;state.encounterDistance=-1e6;state.settings.weather='clear';state.worldMinutes=960;tutorialState16().hidden=true;mentorState17().hidden=true;$('#mentor17')?.classList.add('hidden');updateGuide16();});
 report.cases=await p.evaluate(()=>{
  const cases=[],origin=[player.x,player.z];state.settings.quality='balanced';
  for(let tier=0;tier<4;tier++){
   device33.forceTier=tier;
   const tests=[
    ['terrain',world.userData.terrainChunks.find(m=>m.userData.fullGeometry&&m.userData.farGeometry&&m.userData.fullGeometry.attributes.position.count!==m.userData.farGeometry.attributes.position.count),[28,38,62,100][tier],'geometry'],
    ['forest',scenery.forestMeshes.find(m=>m.userData.forestKind==='canopy30'&&m.userData.nativeLods30),tier<2?(tier===0?32:55):[35,46,65,85][tier],'geometry'],
    ['plants',perf.plants.find(m=>m.userData.detailedGeometry&&m.userData.distantGeometry&&m.userData.detailedGeometry!==m.userData.distantGeometry),[18,23,34,42][tier],'geometry'],
    ['treeShadow',scenery.forestMeshes.find(m=>m.userData.forestKind==='canopy30'),tier<2?85:145,'castShadow']
   ];
   if(tier>0)tests.push(['plantShadow',perf.plants.find(m=>m.userData.plantKey==='grassBlades'),tier>1?32:20,'castShadow']);
   for(const[kind,m,threshold,property]of tests){
    if(!m)continue;const c=m.userData.center,read=()=>property==='geometry'?m.geometry.id:m.castShadow,set=d=>{player.x=c.x;player.z=c.z+d;updateRenderBudget(true);};
    set(threshold-16);const near=read(),frames=[];for(let i=0;i<24;i++){set(threshold+(i%2?.025:-.025));frames.push(read());}
    set(threshold+16);const far=read();set(threshold-16);const returned=read();
    cases.push({tier,kind,threshold,oscillationMetres:.05,flips:frames.slice(1).filter((v,i)=>v!==frames[i]).length,near,far,returned,stillAdapts:near!==far&&near===returned});
   }
  }
  device33.forceTier=null;setupParty(origin);return cases;
 });
 for(const[id,spawn]of [['entrance',[-121,106]],['brookInn',null],['fern',null],['overworld',null],['entrance',[-153,79]]]){
  await p.evaluate(([id,spawn])=>changeJourneyScene(id,spawn),[id,spawn]);await p.waitForFunction(()=>!gameLoading);await p.evaluate(()=>{while(dialogue)nextDialogue();manualUntil=performance.now()+1e7;for(let i=0;i<8;i++)tick(1/60);updateCamera(1,true);render();});
  await p.screenshot({path:out+'/'+id+'.png'});report.scenes.push(await p.evaluate(()=>({key:activeScene.key,playerVisible:player.mesh.visible,followersVisible:followers.every(a=>a.mesh.visible),programs:renderer.info.programs.length,textures:renderer.info.memory.textures})));
 }
 report.pass=!report.errors.length&&report.cases.length>=12&&report.cases.every(c=>c.stillAdapts&&(baseline||c.flips===0))&&report.scenes.every(s=>s.playerVisible&&s.followersVisible);
 if(!report.pass)process.exitCode=1;
}catch(e){report.failure=e.stack;report.pass=false;process.exitCode=1;}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await b.close();}
