// Late-added rocks and retaining stones bypassed the original landscape batch.
// Merge only immutable, unowned world-root surfaces. Buildings, gates, doors,
// actors and all dynamic FX retain their original independent visibility.
const runtime35={sourceMeshes:0,batches:0,shadowFits:0};
const batchWorldBefore35=buildWorld;
buildWorld=function(...args){const r=batchWorldBefore35(...args);world.updateMatrixWorld(true);const groups=new Map(),retired=new THREE.Group();retired.visible=false;retired.userData.dynamicFX=true;retired.name='retained-static-source-handles35';retired.updateMatrixWorld=function(){};world.add(retired);
 const exclude=new Set([water,...actors.flatMap(a=>[a.mesh,a.shadow]),world.userData.gate,world.userData.sluice18?.gate,world.userData.contacts35]);
 const candidates=world.children.filter(o=>o.isMesh&&!o.isInstancedMesh&&!exclude.has(o)&&!o.userData.dynamicFX&&!o.userData.persistent27&&!o.customDepthMaterial&&!Array.isArray(o.material)&&o.material.isMeshStandardMaterial&&!o.material.transparent&&o.material.alphaTest===0&&(/^ely-physical-uv-(wall|rock|cobble)-/.test(o.material.customProgramCacheKey())||!o.matrixAutoUpdate&&o.geometry.attributes.tile));
 for(const o of candidates){const p=V3().setFromMatrixPosition(o.matrixWorld),key=Math.floor(p.x/32)+','+Math.floor(p.z/32);let g=groups.get(key);if(!g){g=new THREE.Group();g.name='immutable-stone-batch35';world.add(g);groups.set(key,g);}g.attach(o);}
 let sources=0,batches=0;for(const g of world.userData.bridgeGroups32??[]){const old=[];g.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!Array.isArray(o.material)&&o.material.isMeshStandardMaterial&&o.material.userData.physicalUV&&!o.material.transparent)old.push(o);});if(old.length<3)continue;const batch=new THREE.Group();g.add(batch);g.updateMatrixWorld(true);for(const o of old)batch.attach(o);const removed=new Set(old);mergeGroup(batch);world.userData.walkSurfaces=(world.userData.walkSurfaces??[]).filter(o=>!removed.has(o));for(const o of old){o.visible=false;retired.add(o);}batch.traverse(o=>{if(o.isMesh){o.userData.routeSupport32=o.userData.noCutaway25=true;o.layers.enable(1);o.matrixAutoUpdate=false;o.updateMatrix();world.userData.walkSurfaces.push(o);batches++;}});g.updateMatrixWorld(true);sources+=old.length;}for(const g of groups.values()){if(g.children.length<3){for(const o of [...g.children])world.attach(o);g.removeFromParent();continue;}const old=[...g.children];mergeGroup(g);for(const o of old){o.visible=false;retired.add(o);}for(const o of g.children){o.layers.enable(1);o.matrixAutoUpdate=false;o.updateMatrix();}g.updateMatrixWorld(true);g.matrixAutoUpdate=false;g.matrixWorldAutoUpdate=false;sources+=old.length;batches+=g.children.length;}
 world.userData.batches35={sources,batches};runtime35.sourceMeshes=sources;runtime35.batches=batches;return r;};
// The old 320m shadow frustum repeatedly submitted distant terrain and trees
// whose shadows cannot reach the active street. Tiered caster distance keeps
// the entire playable foreground covered without changing reflection cadence.
const shadowFitBefore35=fitVisibleShadows;
fitVisibleShadows=function(){const far=camera.far;camera.far=Math.min(far,[80,110,160,240][profile33()]);try{runtime35.shadowFits++;return shadowFitBefore35();}finally{camera.far=far;}};
const budgetBefore35=updateRenderBudget;
updateRenderBudget=function(force=false){const before=budgetAt33,r=budgetBefore35(force);if(!world||!player||(!force&&before===budgetAt33))return r;const t=profile33(),p=restoration?cameraTarget:player;
 for(const m of world.userData.terrainChunks??[]){const c=m.userData.center;if(!c||!m.userData.fullGeometry)continue;const d=Math.hypot(c.x-p.x,c.z-p.z),level=stableDistanceLod33(m,'terrain',d,[[28,38,62,100][t],[70,100,150,220][t]],10);m.geometry=[m.userData.fullGeometry,m.userData.farGeometry,m.userData.simpleGeometry][level];}
 if(t<2)for(const m of scenery.forestMeshes){const d=Math.hypot(m.userData.center.x-p.x,m.userData.center.z-p.z),lod=m.userData.nativeLods30;if(lod)m.geometry=lod[1+stableDistanceLod33(m,'forestLow',d,[t===0?32:55],8)];}
 return r;};

// Diagnostics must not retain an unbounded history over a long play session.
const boundedTickBefore35=tick;tick=function(...args){const r=boundedTickBefore35(...args);if(combatPacing.actionStarts.length>128)combatPacing.actionStarts.splice(0,combatPacing.actionStarts.length-128);return r;};
