import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
const input=process.argv[2]??'index.html',out='output/elyndor/runtime-v36';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--allow-file-access-from-files','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:960,height:600}});
page.on('pageerror',e=>console.error(e.stack));page.setDefaultTimeout(240000);
try{
 await page.addInitScript(()=>localStorage.setItem('elyndor-settings-v3',JSON.stringify({voices:false,volume:0})));
 await page.goto(pathToFileURL(path.resolve(input)).href);
 await page.waitForFunction(()=>window.__ely&&title19.ready&&!title19.busy);
 await page.evaluate(()=>{title19.stopped=true;state.mode='explore';state.encounterDistance=-1e6;window.__forceWorldBake36=true;macroGrid15=null;macroBridgePlans15.clear();});
 await page.evaluate(()=>changeJourneyScene('overworld'));
 await page.waitForFunction(()=>!gameLoading);
 const data=await page.evaluate(()=>{
  const encode=v=>{const a=new Uint8Array(v.buffer,v.byteOffset,v.byteLength);let s='';for(let i=0;i<a.length;i+=16384)s+=String.fromCharCode(...a.subarray(i,i+16384));return btoa(s);};
  const sourceTrees=scenery.trees.filter(t=>!t.barrier46),trees=new Float32Array(sourceTrees.length*6);
  sourceTrees.forEach((t,i)=>trees.set([t.x,t.y,t.z,t.h,t.scale,t.species30??0],i*6));
  const waters=world.children.filter(m=>m.userData.freshwater38),bridgeProof=(world.userData.bridges??[]).map(b=>{
   const u={x:Math.cos(b.angle),z:Math.sin(b.angle)},a={x:b.x-u.x*(b.length/2+.4),z:b.z-u.z*(b.length/2+.4)},c={x:b.x+u.x*(b.length/2+.4),z:b.z+u.z*(b.length/2+.4)},ray=new THREE.Raycaster(V3(b.x,100,b.z),V3(0,-1,0)),water=ray.intersectObjects(waters,false)[0]?.point.y,blocked=[];
   const count=Math.ceil(b.length+4);for(let i=0;i<=count;i++){const x=mix(a.x,c.x,i/count),z=mix(a.z,c.z,i/count);if(!staticFree(x,z,.48))blocked.push({x,z,wet:waterGround(x,z),colliders:colliders.filter(q=>Math.abs(q.x-x)<q.w+.5&&Math.abs(q.z-z)<q.d+.5).map(q=>q.type)});}
   return{x:b.x,z:b.z,length:b.length,water,deck:heightAt(b.x,b.z),bed:macroGround(b.x,b.z),centerWet:hydroSample38(b.x,b.z).wet,banksDry:!hydroSample38(b.x-u.x*b.length/2,b.z-u.z*b.length/2).wet&&!hydroSample38(b.x+u.x*b.length/2,b.z+u.z*b.length/2).wet,walkable:edgeFree(a,c,.48),blocked};
  });
  return{version:36,traversalTerrain:typeof traversalTerrain==='undefined'?null:traversalTerrain.version,bridgeProof,traversalBase:typeof traversalTerrain!=='undefined'&&traversalTerrain.baseGrid?{count:traversalTerrain.baseGrid.length,data:encode(traversalTerrain.baseGrid)}:undefined,source:'Actual generated overworld, native positions and height field',grid:{count:macroGrid15.length,data:encode(macroGrid15)},trees:{count:sourceTrees.length,stride:6,data:encode(trees)},bounds:[LAND.minX,LAND.maxX,LAND.minZ,LAND.maxZ]};
 });
 if(data.traversalTerrain>=3){
  fs.writeFileSync(out+'/bridge-proof.json',JSON.stringify(data.bridgeProof,null,2));console.log(JSON.stringify({bridges:data.bridgeProof}));
  if(!data.bridgeProof.length||data.bridgeProof.some(b=>!Number.isFinite(b.water)||!b.centerWet||!b.banksDry||!b.walkable||b.deck<b.water+.6||b.bed>b.water-.2))throw new Error('A bridge must cross real rendered water with a submerged bed and dry, walkable approaches.');
 }
 const inputs=['relief-data-v18.js','atlas-data-v18.js','geography-v15.js','geography-v17.js','atlas-v18.js','forest-v30.js','world-v18.js','overworld-v16.js','settlements-v15.js','hydrology-v38.js','world-art-v38.js','levels-v39.js','systems/level-plans.js','systems/poi-exits.js','systems/poi-entries.js','systems/traversal-terrain.js','systems/compact-overworld.js','systems/world-landmarks.js','systems/jrpg-geography.js','systems/jrpg-layout-data.js','systems/jrpg-levels.js','systems/jrpg-boundaries.js'];
 data.inputs=Object.fromEntries(inputs.map(name=>['elyndor/'+name,crypto.createHash('sha256').update(fs.readFileSync('elyndor/'+name)).digest('hex')]));
 data.sourceArtifactSha256=crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex');
 fs.writeFileSync(out+'/world-bake.json',JSON.stringify(data));
 fs.writeFileSync('elyndor/world-bake-v36.js','// Offline cache of the actual overworld; regenerate with bake-world-v36.mjs.\nconst BAKED_WORLD36='+JSON.stringify(data)+';\n');
 console.log(JSON.stringify({trees:data.trees.count,heightSamples:data.grid.count,traversalTerrain:data.traversalTerrain,bytes:fs.statSync(out+'/world-bake.json').size}));
}finally{await browser.close();}
