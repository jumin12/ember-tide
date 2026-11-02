import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import crypto from 'node:crypto';
const input=process.argv[2]??'index.html',label=process.argv.includes('--baseline')?'baseline':'fixed',out=process.env.ELY_AIR_OUT??'output/elyndor/flicker-v40';fs.mkdirSync(out,{recursive:true});
const report={sha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),errors:[]};
const b=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
try{
 const p=await b.newPage({viewport:{width:1280,height:800}});p.setDefaultTimeout(180000);p.on('pageerror',e=>report.errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});await p.addInitScript(()=>localStorage.setItem('elyndor-settings-v3',JSON.stringify({voices:false,volume:0})));await p.goto(pathToFileURL(path.resolve(input)).href);await p.waitForFunction(()=>window.__ely&&title19.ready&&!title19.busy);await p.click('#start-btn');await p.waitForFunction(()=>!gameLoading);
 await p.evaluate(()=>{while(dialogue)nextDialogue();manualUntil=performance.now()+1e7;state.worldMinutes=1050;state.settings.weather='clear';setupParty([-121,106]);for(let i=0;i<10;i++)tick(1/60);updateCamera(1,true);render();});
 report.gpu=await p.evaluate(()=>{
  // A uniform 40m depth plane isolates the actual scattering shader from
  // geometry edges. Native cloud artwork remains unchanged; the white shadow
  // fixture removes shadow-texel boundaries from this continuity measurement.
  const u=air35.material.uniforms,t=air35.target,px=Math.floor(t.width/2),py=Math.floor(t.height/2),uv=V3((px+.5)/t.width*2-1,(py+.5)/t.height*2-1,0),view=V3(0,0,-40).applyMatrix4(camera.projectionMatrix),z=view.z*.5+.5;
  const depth=new THREE.DataTexture(new Float32Array([z,z,z,1]),1,1,THREE.RGBAFormat,THREE.FloatType),white=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);depth.needsUpdate=white.needsUpdate=true;
  const saved={};for(const key of ['depth','shadowMap','origin','cameraWorld','cover','power','density','colour','time','sun','cloudHeight'])saved[key]=u[key];
  u.depth={value:depth};u.shadowMap={value:white};u.origin={value:camera.position.clone()};u.cameraWorld={value:camera.matrixWorld.clone()};u.cover={value:.65};u.power={value:8};u.density={value:.006};u.colour={value:new THREE.Color(1,1,1)};u.time={value:0};u.sun={value:V3(.37,.65,.67).normalize()};u.cloudHeight={value:55};
  const matrix=camera.matrixWorld.clone(),origin=camera.position.clone(),end=uv.clone();end.z=z*2-1;end.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(matrix);const base=Math.round(end.x*3)/3-end.x,target=renderer.getRenderTarget(),auto=renderer.shadowMap.autoUpdate,pending=renderer.shadowMap.needsUpdate;
  const half=t.texture.type===THREE.HalfFloatType,buffer=half?new Uint16Array(4):new Uint8Array(4),samples=[];
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;
  try{for(let cell=-12;cell<=12;cell++){
   const colours=[];for(const epsilon of [-.003,-.001,.001,.003]){const offset=base+cell/3+epsilon;u.origin.value.copy(origin);u.origin.value.x+=offset;u.cameraWorld.value.copy(matrix);u.cameraWorld.value.elements[12]+=offset;renderer.setRenderTarget(t);renderer.render(air35.scene,air35.camera);renderer.readRenderTargetPixels(t,px,py,1,1,buffer);colours.push(Array.from(buffer).slice(0,3).map(v=>half?THREE.DataUtils.fromHalfFloat(v):v/255));}
   const delta=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));samples.push({cell,boundaryDelta:delta(colours[1],colours[2]),controlDelta:Math.max(delta(colours[0],colours[1]),delta(colours[2],colours[3])),colour:colours[1]});
  }}finally{for(const[key,value]of Object.entries(saved))u[key]=value;renderer.setRenderTarget(target);renderer.shadowMap.autoUpdate=auto;renderer.shadowMap.needsUpdate=pending;depth.dispose();white.dispose();}
  return{format:half?'half-float':'byte',samples,maxBoundaryDelta:Math.max(...samples.map(s=>s.boundaryDelta)),maxControlDelta:Math.max(...samples.map(s=>s.controlDelta))};
 });
 // Two half-float quantization steps at the measured ~0.03 radiance; byte
 // targets have a larger quantization floor and are covered by device QA.
 report.pass=!report.errors.length&&report.gpu.samples.every(s=>s.colour.every(v=>Number.isFinite(v)&&v>0))&&(label==='baseline'||report.gpu.maxBoundaryDelta<=(report.gpu.format==='half-float'?1/32768:1/255));
 if(!report.pass)process.exitCode=1;
}catch(e){report.failure=e.stack;report.pass=false;process.exitCode=1;}finally{fs.writeFileSync(out+'/air-'+label+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await b.close();}
