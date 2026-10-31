// Capability-aware budgets and a real-time simulation independent of GPU speed.
const readCapabilitySettings=loadSettings;
loadSettings=function(){readCapabilitySettings();if(scenery.software&&state.settings.quality==='balanced')perf.scale=.7;};
function softwareBudget(){return scenery.software&&state.settings.quality!=='high';}
function terrainDetailGeometry(g,step){
 // Preserve every original perimeter vertex. Border fans stitch coarse interiors
 // to full-detail neighbours without cracks or artificial vertical skirts.
 const grid=Math.round(Math.sqrt(g.attributes.position.count))-1,stride=grid+1,out=new THREE.BufferGeometry(),points=[],lookup=new Map(),indices=[];
 step=Math.min(step,grid);while(grid%step!==0&&step>1)step--;
 const vertex=(x,y)=>{const key=x+','+y;if(!lookup.has(key)){lookup.set(key,points.length);points.push([x,y]);}return lookup.get(key);};
 for(let y=0;y<grid;y+=step)for(let x=0;x<grid;x+=step){const polygon=[[x,y]];
  for(let j=x===0?1:step;j<=step;j+=x===0?1:step)polygon.push([x,y+j]);
  for(let j=y+step===grid?1:step;j<=step;j+=y+step===grid?1:step)polygon.push([x+j,y+step]);
  for(let j=x+step===grid?1:step;j<=step;j+=x+step===grid?1:step)polygon.push([x+step,y+step-j]);
  for(let j=y===0?1:step;j<=step;j+=y===0?1:step)polygon.push([x+step-j,y]);
  polygon.pop();const center=vertex(x+step/2,y+step/2);for(let j=0;j<polygon.length;j++)indices.push(center,vertex(...polygon[j]),vertex(...polygon[(j+1)%polygon.length]));
 }
 for(const[key,a]of Object.entries(g.attributes)){const data=new Float32Array(points.length*a.itemSize);points.forEach(([x,y],i)=>{const ix=Math.floor(x),iy=Math.floor(y),nx=Math.min(grid,ix+1),ny=Math.min(grid,iy+1),u=x-ix,v=y-iy;for(let k=0;k<a.itemSize;k++)data[i*a.itemSize+k]=mix(mix(a.array[(iy*stride+ix)*a.itemSize+k],a.array[(iy*stride+nx)*a.itemSize+k],u),mix(a.array[(ny*stride+ix)*a.itemSize+k],a.array[(ny*stride+nx)*a.itemSize+k],u),v);});out.setAttribute(key,new THREE.BufferAttribute(data,a.itemSize));}
 out.setIndex(indices);out.computeBoundingSphere();return out;
}
function simpleGrassGeometry(){if(sharedGeo.simpleVolumeGrass)return sharedGeo.simpleVolumeGrass;const p=[],u=[],c=[];for(let i=0;i<3;i++){const a=i*2.399,side=[-Math.sin(a)*.025,Math.cos(a)*.025],tip=[Math.cos(a)*.2,.35+i*.08,Math.sin(a)*.2],v=[[-side[0],-.44,-side[1]],[side[0],-.44,side[1]],[tip[0]+side[0]*.3,tip[1],tip[2]+side[1]*.3],[-side[0],-.44,-side[1]],[tip[0]+side[0]*.3,tip[1],tip[2]+side[1]*.3],tip];for(const q of v){p.push(...q);c.push(.48,.68,.36);}u.push(0,0,1,0,1,1,0,0,1,1,0,1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return sharedGeo.simpleVolumeGrass=g;}
function softwareFlowerGeometry(){
 if(sharedGeo.simpleVolumeFlower)return sharedGeo.simpleVolumeFlower;
 const p=[],uv=[],colors=[],tri=(a,b,c,ca,cb=ca,cc=ca)=>{p.push(...a,...b,...c);uv.push(0,0,1,0,.5,1);colors.push(...ca,...cb,...cc);},green=[.36,.56,.29],cream=[.96,.94,.82],gold=[.94,.68,.16];
 tri([-.012,-.44,0],[.012,-.44,0],[.012,.32,.04],green);tri([-.012,-.44,0],[.012,.32,.04],[-.012,.32,.04],green);
 for(let i=0;i<4;i++){const a=i*Math.PI/2,b=(i+1)*Math.PI/2;tri([0,.35,.04],[Math.cos(a)*.13,.30,Math.sin(a)*.13+.04],[Math.cos(b)*.13,.30,Math.sin(b)*.13+.04],gold,cream,cream);}
 tri([0,-.12,.01],[-.20,.04,-.02],[-.04,.10,.06],green);tri([0,-.24,.01],[.18,-.06,.04],[.02,.01,.08],green);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return sharedGeo.simpleVolumeFlower=g;
}
function applyCapabilityBudget(){
 const limited=softwareBudget(),size=limited?512:state.settings.quality==='high'?1536:1024,type=limited?THREE.BasicShadowMap:THREE.PCFSoftShadowMap;
 if(renderer.shadowMap.type!==type){renderer.shadowMap.type=type;world?.traverse(o=>{if(o.material)o.material.needsUpdate=true;});}
 if(sun.shadow.mapSize.x!==size){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(size,size);renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;}
 reflectionTarget.setSize(limited?256:state.settings.quality==='high'?640:480,limited?160:state.settings.quality==='high'?384:288);
 for(const[l,i]of(world?.userData.lanterns??[]).map((l,i)=>[l,i]))l.visible=!limited||i<2;
}
const prepareCapabilityWorld=prepareBudgetedWorld;
prepareBudgetedWorld=function(){prepareCapabilityWorld();applyCapabilityBudget();for(const m of scenery.forestMeshes){m.userData.fullGeometry=m.geometry;for(const[level,key]of[[1,'farGeometry'],[0,'simpleGeometry']]){const g=m.userData.forestKind==='trunk'||m.userData.forestKind==='pine'?forestGeometry(m.userData.forestKind).clone():new THREE.IcosahedronGeometry(1,level);g.setAttribute('treeKind',m.geometry.attributes.treeKind);m.userData[key]=g;}}for(const m of world.userData.terrainChunks){m.userData.fullGeometry=m.geometry;m.userData.farGeometry=terrainDetailGeometry(m.geometry,2);m.userData.simpleGeometry=terrainDetailGeometry(m.geometry,3);m.geometry.computeBoundingSphere();m.userData.center=m.geometry.boundingSphere.center.clone();}updateRenderBudget(true);};
const disposeCapabilityWorld=buildWorld;
buildWorld=function(...args){const before=world,old=[...(scenery.forestMeshes??[]),...(world?.userData.terrainChunks??[])];disposeCapabilityWorld(...args);if(before!==world)for(const m of old)for(const g of new Set([m.userData.fullGeometry,m.userData.farGeometry,m.userData.simpleGeometry].filter(Boolean)))g.dispose();};
const updateGeometryBudget=updateRenderBudget;
updateRenderBudget=function(force=false){const previous=lastPlantBudget;updateGeometryBudget(force);if(!force&&previous===lastPlantBudget)return;if(!player)return;const p=restoration?cameraTarget:player;for(const m of scenery.forestMeshes){const d=Math.hypot(m.userData.center.x-p.x,m.userData.center.z-p.z);if(m.userData.fullGeometry)m.geometry=softwareBudget()?(d>14?m.userData.simpleGeometry:m.userData.farGeometry):d>30?m.userData.farGeometry:m.userData.fullGeometry;}for(const m of world?.userData.terrainChunks??[]){if(!m.userData.fullGeometry)continue;const d=Math.hypot(m.userData.center.x-p.x,m.userData.center.z-p.z);m.geometry=softwareBudget()?m.userData.simpleGeometry:d>100?m.userData.farGeometry:m.userData.fullGeometry;}if(softwareBudget())for(const m of perf.plants){if(m.userData.plantKey==='grassBlades')m.geometry=simpleGrassGeometry();else if(m.userData.plantKey==='flowers')m.geometry=softwareFlowerGeometry();else if(m.userData.distantGeometry)m.geometry=m.userData.distantGeometry;}};
const exactOcclusion=updateCutaways;let occlusionCache=null;
updateCutaways=function(){if(!player||!camera)return;const party=[player,...followers,...(battle?.enemies??[]).map(e=>e.actor)],same=occlusionCache&&occlusionCache.world===world&&occlusionCache.mode===state.mode&&occlusionCache.camera.distanceToSquared(camera.position)<.000001&&party.length===occlusionCache.party.length&&party.every((a,i)=>(a.x-occlusionCache.party[i].x)**2+(a.z-occlusionCache.party[i].z)**2<.000001);if(same&&clock-occlusionCache.time<.1)return;exactOcclusion();occlusionCache={world,mode:state.mode,camera:camera.position.clone(),party:party.map(a=>({x:a.x,z:a.z})),time:clock};};
resize=function(){
 scenery.pausedTab=null;const high=state.settings.quality==='high',low=state.settings.quality==='low',limited=softwareBudget(),scale=low?(limited?.5:.8):perf.scale,budget=limited?450000:high?3000000:low?750000:1400000;
 const ratio=Math.min(devicePixelRatio,high?1.5:1,Math.sqrt(budget/(innerWidth*innerHeight))),w=Math.max(320,Math.round(innerWidth*scale)),h=Math.max(240,Math.round(innerHeight*scale));
 renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);post.target.setSize(Math.round(w*ratio),Math.round(h*ratio));post.material.uniforms.resolution.value.set(w*ratio,h*ratio);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
};
const capabilityMenu=renderMenu;
renderMenu=function(){capabilityMenu();const quality=$('#setting-quality');if(quality){const change=quality.onchange;quality.onchange=e=>{change(e);if(softwareBudget())perf.scale=.7;applyCapabilityBudget();resize();updateRenderBudget(true);};}};
updateReflection=function(){
 if(!water?.visible||!player)return;const interval=softwareBudget()?.65:state.settings.quality==='high'?.1:state.settings.quality==='low'?.35:.18;
 if(clock-perf.lastReflection<interval||channelDistance(player.x,player.z)>32&&!restoration)return;perf.lastReflection=clock;const pending=renderer.shadowMap.needsUpdate;renderer.shadowMap.needsUpdate=false;const hidden=scenery.trees.filter(t=>t.hidden);for(const t of hidden)hideTree(t,false);try{physicalReflection();}finally{for(const t of hidden)hideTree(t,true);renderer.shadowMap.needsUpdate=pending;}
};
const completeSceneRender=render;
render=function(){return completeSceneRender();};
const displayPacing={last:0,samples:[],period:1000/60};
loop=function(now){
 requestAnimationFrame(loop);const interval=now-displayPacing.last;displayPacing.last=now;if(!scenery.software&&interval>3&&interval<25){displayPacing.samples.push(interval);if(displayPacing.samples.length>60)displayPacing.samples.shift();if(displayPacing.samples.length>=30){const sorted=displayPacing.samples.slice().sort((a,b)=>a-b),refresh=sorted[Math.floor(sorted.length/2)],hz=1000/refresh;let divisor=Math.max(1,Math.round(hz/60));if(hz/divisor<50)divisor=Math.max(1,divisor-1);displayPacing.period=refresh*divisor;}}
 if(document.hidden||now<scenery.lastPaint-.5)return;scenery.lastPaint=Math.max(scenery.lastPaint+displayPacing.period,now+.1);if(!lastFrame)lastFrame=now;const elapsed=Math.min((now-lastFrame)/1000,.25);lastFrame=now;
 if(menu){if(scenery.pausedTab!==menu.tab){render();scenery.pausedTab=menu.tab;}return;}scenery.pausedTab=null;const live=performance.now()>manualUntil;
 if(live)for(let remaining=elapsed;remaining>.00001;remaining-=1/60)tick(Math.min(remaining,1/60));render();
 if(live&&state.mode==='explore'&&state.settings.quality==='balanced'&&++perf.frames>12){const minimum=softwareBudget()?.5:.68,maximum=softwareBudget()?.78:1;perf.slow=elapsed>displayPacing.period/1000*1.6?perf.slow+1:Math.max(0,perf.slow-1);perf.fast=elapsed<displayPacing.period/1000*1.2?perf.fast+1:0;if(perf.slow>5&&perf.scale>minimum){perf.scale=Math.max(minimum,perf.scale-.06);perf.slow=0;resize();}else if(perf.fast>300&&perf.scale<maximum){perf.scale=Math.min(maximum,perf.scale+.02);perf.fast=0;resize();}}
};
