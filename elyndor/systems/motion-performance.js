// Performance budgets are independent of the native sprite/UI raster. Keep
// close scenery detailed and spend fewer vertices on distant/secondary views.
const performance106={world:null,budgetAt:-1,budgetCamera:V3(),reflectionWorld:null,reflectionAt:-1,reflectionCamera:V3(),reflectionResize:-1,budgetRuns:0,budgetReuses:0,reflectionReuses:0,shadowPasses:0,secondaryPasses:0};
const budgetBefore106=updateRenderBudget;
updateRenderBudget=function(force=false){
 if(!world||!player)return budgetBefore106(force);const p=performance106;
 if(!force&&p.world===world&&clock-p.budgetAt<.075&&p.budgetCamera.distanceToSquared(camera.position)<9){p.budgetReuses++;return;}
 p.world=world;p.budgetAt=clock;p.budgetCamera.copy(camera.position);p.budgetRuns++;const result=budgetBefore106(force),phone=touchDevice33();
 for(const o of scenery.forestMeshes){const lod=o.userData.nativeLods30;if(!o.userData.botany104||!lod)continue;const d=Math.hypot(o.userData.center.x-player.x,o.userData.center.z-player.z),trunk=o.userData.forestKind==='trunk';o.geometry=lod[d<(phone?12:30)?0:d<(phone?48:85)?1:2];if(trunk)o.castShadow=o.visible&&d<(activeScene.kind==='overworld'?150:95);}
 for(const o of perf.plants)if(o.userData.realVegetation103){const d=Math.hypot(o.userData.center.x-player.x,o.userData.center.z-player.z);o.geometry=d<(phone?11:24)?o.userData.detailedGeometry:o.userData.distantGeometry;o.castShadow=false;}
 return result;
};
const reflectionBefore106=updateReflection;
updateReflection=function(...args){
 if(!world)return;const p=performance106,now=performance.now(),interval=touchDevice33()?80:45,ready=p.reflectionWorld===world&&p.reflectionResize===device33.resizes;
 if(!gameLoading&&!loading36.active&&ready&&now-p.reflectionAt<interval&&p.reflectionCamera.distanceToSquared(camera.position)<100){p.reflectionReuses++;return;}
 p.reflectionWorld=world;p.reflectionAt=now;p.reflectionResize=device33.resizes;p.reflectionCamera.copy(camera.position);return reflectionBefore106(...args);
};
const buildBefore106=buildWorld;
buildWorld=function(...args){const result=buildBefore106(...args);if(!world||world.userData.performance106)return result;
 for(const o of scenery.forestMeshes){if(!o.userData.botany104||o.userData.forestKind!=='trunk')continue;const lod=o.userData.nativeLods30;if(!lod)continue;
  for(const [i,sides,segments]of [[1,10,2],[2,7,1]]){const source=sharedGeo['branch-lod106-'+i]??=new THREE.CylinderGeometry(.185,.22,1,sides,segments),g=shareGeometry36(source);g.setAttribute('treeViewHidden',o.userData.treeViewMask);lod[i]=g;world.userData.botanicalOwned30??=new Set();world.userData.botanicalOwned30.add(g);}
  o.userData.farGeometry=lod[1];o.userData.simpleGeometry=lod[2];
 }
 world.userData.performance106={nearDetail:true,secondaryGeometry:true,cachedVisibility:true,reflectionHz:touchDevice33()?12.5:22.2};performance106.world=null;performance106.reflectionWorld=null;return result;
};
function secondaryForest106(fn,shadow=false){
 const saved=[],objects=encounter53.active&&arena88.current?arena88.current.secondaryForests106??[]:scenery.forestMeshes;for(const o of objects){const low=o.userData.shadowGeometry106??o.userData.nativeLods30?.[2];if(!o.visible||!o.userData.botany104||!low||shadow&&!o.castShadow)continue;saved.push([o,o.geometry]);o.geometry=low;}
 try{return fn();}finally{for(const[o,g]of saved)o.geometry=g;}
}
const postBefore106=setupPost;
setupPost=function(...args){const result=postBefore106(...args),shadows=renderer.shadowMap.render,draw=renderer.render;
 renderer.shadowMap.render=function(...a){if(!this.needsUpdate)return shadows.apply(this,a);performance106.shadowPasses++;return secondaryForest106(()=>shadows.apply(this,a),true);};
 renderer.render=function(s,c){if(c===reflectionCamera&&s===scene||encounter53.active&&c===arena88.current?.reflect89?.camera){performance106.secondaryPasses++;return secondaryForest106(()=>draw.call(this,s,c));}return draw.call(this,s,c);};return result;
};
const battleSceneryBefore106=buildStageScenery59;
buildStageScenery59=function(...args){const r=battleSceneryBefore106(...args),b=arena88.current;if(!b||b.secondaryForests106)return r;b.secondaryForests106=[];
 for(const o of b.group.children){if(!o.userData.botany104)continue;const trunk=o.name==='POI native connected trunks',g=geometry59(trunk?new THREE.CylinderGeometry(.185,.22,1,7,1):bough104(o.material.userData.species104??0,2).clone());g.setAttribute('treeViewHidden',o.geometry.attributes.treeViewHidden);o.userData.shadowGeometry106=g;b.secondaryForests106.push(o);}return r;
};
const battleLightBefore106=arenaLight89;
arenaLight89=function(...args){const r=battleLightBefore106(...args);sun.shadow.radius=.65;return r;};

// Exploration owns a depth-tested player silhouette. Do not replace that
// lifecycle with legacy building/canopy cutaways when applying tree budgets.
// The older cutaways remain available for title and combat presentation.
const treeCuts106={world:null,grid:new Map(),key:'',candidates:[],hidden:new Set(),at:-1,camera:V3(),focus:V3()};
const cutsBefore106=cutsBefore30,explorationCutsBefore106=updateCutaways;
updateCutaways=function(...args){
 if(!battle&&state.mode!=='title')return explorationCutsBefore106(...args);
 visibility63.mode=false;syncSilhouette63();
 const trees=scenery.trees;scenery.trees=[];let result;try{result=cutsBefore106(...args);}finally{scenery.trees=trees;}
 if(!world||!player||battle)return result;const q=treeCuts106,phone=touchDevice33();
 if(q.world!==world){q.world=world;q.grid=new Map();q.key='';q.hidden=new Set();for(const t of trees){const key=Math.floor(t.x/32)+','+Math.floor(t.z/32);if(!q.grid.has(key))q.grid.set(key,[]);q.grid.get(key).push(t);}q.at=-1;}
 const moved=q.camera.distanceToSquared(camera.position)>.0025||Math.hypot(q.focus.x-player.x,q.focus.z-player.z)>.05;
 if(clock-q.at<(moved?(phone?.045:.030):.12))return result;
 q.at=clock;q.camera.copy(camera.position);q.focus.set(player.x,0,player.z);
 const cx=Math.floor(player.x/16),cz=Math.floor(player.z/16),key=cx+','+cz;if(q.key!==key){q.key=key;const next=new Set(q.hidden);for(let x=Math.floor((player.x-85)/32);x<=Math.floor((player.x+85)/32);x++)for(let z=Math.floor((player.z-85)/32);z<=Math.floor((player.z+85)/32);z++)for(const t of q.grid.get(x+','+z)??[])next.add(t);q.candidates=[...next];}
 const rays=[],hit=V3();if(state.mode!=='title')for(const a of[player,...followers].filter(a=>a.mesh.visible))for(const h of[.25,.62,.94]){const delta=V3(a.x,heightAt(a.x,a.z)+a.size*h,a.z).sub(camera.position);rays.push({ray:new THREE.Ray(camera.position.clone(),delta.clone().normalize()),length:delta.length()});}
 const hidden=new Set();for(const t of q.candidates){if(!t.box||Math.hypot(t.x-player.x,t.z-player.z)>85){if(t.hidden)hideTree(t,false);continue;}const occluded=rays.some(p=>p.ray.intersectBox(t.box,hit)&&hit.distanceTo(p.ray.origin)<p.length-.35);if(occluded)t.until=clock+.20;const hide=occluded||clock<t.until;if(hide)hidden.add(t);hideTree(t,hide);}
 for(const t of q.hidden)if(!hidden.has(t))hideTree(t,false);q.hidden=hidden;return result;
};

// Fit a tighter, stable depth map instead of spreading 1024 pixels across a
// whole continent. PCF retains antialiasing with a much narrower penumbra.
const capabilityBefore106=applyCapabilityBudget;
applyCapabilityBudget=function(...args){if(!sun)return capabilityBefore106(...args);const t=profile33(),size=touchDevice33()?(t===0?1024:1536):(t===0?1024:t===3?3072:2048),key=world?.uuid+'|'+t+'|'+innerWidth+'|'+innerHeight+'|'+devicePixelRatio;
 if(performance106.capability===key&&sun.shadow.mapSize.x===size)return;const r=capabilityBefore106(...args);performance106.capability=key;
 if(sun.shadow.mapSize.x!==size){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(size,size);renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;}
 sun.shadow.radius=.65;renderer.shadowMap.type=THREE.PCFShadowMap;return r;
};
const fitBefore106=fitVisibleShadows;
fitVisibleShadows=function(...args){const result=fitBefore106(...args);if(!world||!player||!shadow36.due)return result;
 sun.shadow.radius=.65;sun.shadow.bias=activeScene.kind==='overworld'?-.00016:-.000035;sun.shadow.normalBias=activeScene.kind==='overworld'?.10:.012;
 if(encounter53.active||activeScene.kind==='interior')return result;
 const c=sun.shadow.camera,macro=activeScene.kind==='overworld',aspect=Math.max(1,camera.aspect),width=macro?Math.max(184,136*aspect):Math.max(76,49*aspect),height=macro?192:88;
 sun.shadow.updateMatrices(sun);const right=V3().setFromMatrixColumn(c.matrixWorld,0),up=V3().setFromMatrixColumn(c.matrixWorld,1),sx=width/sun.shadow.mapSize.x,sy=height/sun.shadow.mapSize.y,ox=right.dot(c.position),oy=up.dot(c.position),x=Math.round(ox/sx)*sx-ox,y=Math.round(oy/sy)*sy-oy;
 c.left=x-width/2;c.right=x+width/2;c.bottom=y-height/2;c.top=y+height/2;c.near=.1;c.far=macro?Math.max(320,sun.position.distanceTo(sun.target.position)+240):512;c.updateProjectionMatrix();sun.shadow.updateMatrices(sun);sunlight56.width=width;sunlight56.height=height;viewCoverage.shadowWidth=width;viewCoverage.shadowHeight=height;return result;
};
