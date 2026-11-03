// Local architecture is placed against an authored street plan. A facade,
// doorway, planted window box and its collision rotate together.
const authoredGroundBefore46=groundAt,authoredGroundLevels46=new Map();
groundAt=function(x,z,...args){
 const base=authoredGroundBefore46(x,z,...args),p=activeScene?.kind==='poi'&&JRPG_LAYOUTS46[activeScene.key];if(!p||['city','orchard','camp','harbor'].includes(p.theme))return base;
 const main=p.courts[0];let level=authoredGroundLevels46.get(activeScene.key);if(level===undefined){level=authoredGroundBefore46(main[0],main[1]);authoredGroundLevels46.set(activeScene.key,level);}
 let distance=Infinity;for(const[cx,cz,r]of p.courts)distance=Math.min(distance,Math.hypot(x-cx,z-cz)-r);
 for(const route of [...p.routes,...p.loops??[]])for(let i=1;i<route.length;i++)distance=Math.min(distance,segmentDistance(x,z,route[i-1],route[i])-6.2);
 const target=level+clamp((z-main[1])*.018+(x-main[0])*.008,-2,2),centre=Math.hypot(x-main[0],z-main[1]);return mix(mix(target,level,1-smooth(main[2]-3,main[2]+3,centre)),base,smooth(0,13,distance));
};
function placeHouse46(spec,kit){
 const[x,z,w,d,turn=0]=spec,first=colliders.length,plants=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length]));
 const g=kit==='forest'?woodlandHouse(x,z,w,d):kit==='camp'?reliefShelter(x,z,w,d):kit==='city'?royalHouse(x,z,w,d):brookHouse(x,z,w,d,'home');
 orientHouse46(g,turn*Math.PI/2,first,plants);g.userData.authored46=true;return g;
}
function orientHouse46(g,angle,first,plants){
 const x=g.position.x,z=g.position.z,m=new THREE.Matrix4().makeTranslation(x,0,z).multiply(new THREE.Matrix4().makeRotationY(angle)).multiply(new THREE.Matrix4().makeTranslation(-x,0,-z));
 if(Math.abs(angle)>.001){for(const c of colliders.slice(first)){const q=V3(c.x,0,c.z).applyMatrix4(m);c.x=q.x;c.z=q.z;if(Math.abs(Math.sin(angle))>.5)[c.w,c.d]=[c.d,c.w];}for(const[k,start]of Object.entries(plants))for(let i=start;i<world.userData.plantMatrices[k].length;i++)world.userData.plantMatrices[k][i].premultiply(m);g.rotation.y=angle;g.userData.door?.applyMatrix4(m);g.userData.front?.applyAxisAngle(V3(0,1,0),angle);}
}
const authoredSettlementsBefore46=buildSettlements;
buildSettlements=function(...args){
 const spec=activeScene?.kind==='poi'&&JRPG_LAYOUTS46[activeScene.key];if(!spec||activeScene.key==='harbor')return authoredSettlementsBefore46(...args);
 for(const house of spec.houses??[])placeHouse46(house,spec.theme);
 if(activeScene.key==='highmere'){
  PLACES.council=[-71,-134];PLACES.aidOffice=[-62,-107];
  for(const[id,w,d,kind,turn]of[['council',18,15,'council',0],['aidOffice',12,10,'council',0],['archives',16,13,'archives',0],['inn',14,12,'inn',-1]]){const first=colliders.length,plants=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length])),g=openHall(id,w,d,kind);if(g){orientHouse46(g,turn*Math.PI/2,first,plants);g.userData.authored46=true;g.userData.interior46=id==='inn'?'highmereInn':id;}}
 }
};
function mechanism46(x,z){
 const g=new THREE.Group(),y=groundAt(x,z);g.position.set(x,y,z);g.userData={mechanism:true,kind:'ancient relay',footprint:{w:6,d:6},authored46:true};world.add(g);world.userData.buildings.push(g);world.userData.designedFocals46??=[];world.userData.designedFocals46.push(g);
 for(const[r,h,yy]of[[3,.3,.1],[2.45,.3,.4],[1.7,.35,.72]])mesh(new THREE.CylinderGeometry(r,r+.1,h,12),material('wall','#b9c2ae'),0,yy,0,g);
 for(const r of[.75,1.35]){const ring=mesh(new THREE.TorusGeometry(r,.12,8,24),material('metal','#ac9870',{metalness:.42}),0,1.15,0,g);ring.rotation.x=-Math.PI/2;}
 for(const side of[-1,1]){box(side*1.55,1.65,0,.48,2.4,.65,'wall','#b9c4b0',g);box(side*1.55,2.92,0,.8,.25,.9,'wall','#d3d0b8',g);}box(0,1.7,0,.55,2.4,.55,'metal','#8b9b91',g);obstacle(x,z,3.6,3.6,'mechanism');
}
const authoredRuinsBefore46=buildRuins;
buildRuins=function(...args){
 if(activeScene?.kind!=='poi')return authoredRuinsBefore46(...args);
 const key=activeScene.key;if(POIS[key].kind==='clearing'){const site=LIGHT_SITES.find(s=>s.area===key);if(site)lightModel(site);return;}
 const sites={depths:[110,25],alderRemnant:[208,-101],nearbySite:[-76,-196],relief:[24,-153]};if(sites[key])mechanism46(...sites[key]);
};
const authoredInteractionsBefore46=addWorldInteractions;
addWorldInteractions=function(...args){
 if(activeScene?.kind!=='poi')return authoredInteractionsBefore46(...args);
 const key=activeScene.key,p=POIS[key],used=new Set();
 for(const[id,s]of Object.entries(OLD_SCENES))for(const spec of s.interact??[]){let[type,x,z,label,actorId]=spec;const owner=JRPG_OWNER46[type]??(p.aliases.includes(id)?key:null);if(owner!==key||used.has(type)&&!['shop','chest'].includes(type))continue;
  if(type==='guard')actorId='guardEnemy';if(used.has(type)){const q=AT(id,x,z);x=q.x;z=q.z;}else [x,z]=INTERACTION_POS[type]??[...PLACES[id]];
  if(actorId&&interactables.some(o=>o.actorId===actorId))actorId=null;createInteraction(type,x,z,label,actorId);const o=interactables.at(-1);o.area=id;if(o.actor)o.actor.story=true;used.add(type);
 }
};
const authoredResidentsBefore46=addRegionalResidents;
const authoredVillagersBefore46=setupWorldVillagers;
setupWorldVillagers=function(...args){if(activeScene?.kind==='poi'&&JRPG_LAYOUTS46[activeScene.key])return;return authoredVillagersBefore46(...args);};
addRegionalResidents=function(...args){
 if(activeScene?.kind!=='poi')return authoredResidentsBefore46(...args);const key=activeScene.key;if(POIS[key].kind!=='town')return;
 const prior=new Set(actors);authoredResidentsBefore46(...args);const prefix={fern:'fern-',alder:'alder-',highmere:'capital-',relief:'relief-',brookstead:'brook-',harbor:'harbor-'}[key],removed=actors.filter(a=>!prior.has(a)&&a.resident&&!a.instanceId?.startsWith(prefix));
 for(const a of removed){a.mesh.removeFromParent();a.shadow.removeFromParent();}actors=actors.filter(a=>!removed.includes(a));npcs=npcs.filter(a=>!removed.includes(a));interactables=interactables.filter(o=>!removed.includes(o.actor));
};
const authoredCourtBefore46=conceptCourt38;
conceptCourt38=function(key){
 const plan=JRPG_LAYOUTS46[key];if(!plan||key==='harbor')return authoredCourtBefore46(key);
 world.userData.concept38={name:plan.theme+' · Authored plaza and approach',reservedRoadShoulder:4.5};
 if(POIS[key].kind==='town'&&key!=='relief'){
  const[x,z]=plan.courts[0],y=groundAt(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);
  mesh(new THREE.CylinderGeometry(1.75,1.95,.8,14),material('wall','#c7cbb5'),0,.4,0,g);mesh(new THREE.CylinderGeometry(1.45,1.45,.05,14),material('window','#86b7bb',{emissive:'#497d82',emissiveIntensity:.15}),0,.83,0,g);obstacle(x,z,3.5,3.5,'town well');
  for(const[dx,dz,angle]of[[-9,3,Math.PI/2],[9,3,-Math.PI/2]])if(staticFree(x+dx,z+dz,1))bench(x+dx,z+dz,angle);
 }
 if(key==='highmere'){
  const y=groundAt(-70,-157),g=new THREE.Group();g.position.set(-70,y,-157);world.add(g);box(0,5,0,28,10,7,'wall','#c8ccb8',g);for(const side of[-1,1]){mesh(new THREE.CylinderGeometry(2.2,2.6,14,10),material('wall','#cbd1bd'),side*15,7,0,g);mesh(new THREE.ConeGeometry(3,4.2,10),material('slate','#7899aa'),side*15,16,0,g);}obstacle(-70,-157,34,8,'palace wall');
 }
 const rng=seeded(46100+Math.round(plan.core[0]*13));for(const[x,z,r]of plan.courts)for(let i=0;i<28;i++){const a=i*TAU/28,xx=x+Math.cos(a)*(r+2),zz=z+Math.sin(a)*(r+2);if(roadDistance(xx,zz)<4||waterGround(xx,zz))continue;plant(xx,zz,.45+rng()*.25,i%4?'flowers':'fern');}
};
const authoredNatureBefore46=buildNature;
buildNature=function(...args){const result=authoredNatureBefore46(...args);for(const g of world.userData.designedFocals46??[])if(g.parent===world&&!world.userData.buildings.includes(g))world.userData.buildings.push(g);return result;};
const authoredObjectiveBefore46=objectiveScene;
objectiveScene=function(...args){return currentBeat()[0]==='fernRepair'?POIS.depths.id:authoredObjectiveBefore46(...args);};
const authoredDoorsBefore46=addInteriorDoors;
addInteriorDoors=function(...args){const result=authoredDoorsBefore46(...args);if(activeScene?.kind==='poi'&&JRPG_LAYOUTS46[activeScene.key])for(const o of interactables.filter(o=>o.interior)){const g=world.userData.buildings.find(g=>g.userData.interior46===o.interior);if(g){o.x=g.userData.door.x;o.z=g.userData.door.z;}}return result;};
const authoredDistantHouseBefore46=distantHouse26;
distantHouse26=function(...args){return activeScene?.kind==='poi'&&JRPG_LAYOUTS46[activeScene.key]?new THREE.Group():authoredDistantHouseBefore46(...args);};
// A rotated facade can extend beyond the old inset occlusion box. Test its
// actual shell so a foreground house cannot hide the party on a public street.
const authoredCutsBefore46=updateCutaways,authoredRay46=new THREE.Raycaster();
updateCutaways=function(...args){
 const result=authoredCutsBefore46(...args);if(activeScene?.kind!=='poi'||!JRPG_LAYOUTS46[activeScene.key]||!player||state.mode==='title')return result;
 const targets=[player,...followers].filter(a=>a.mesh.visible).flatMap(a=>[.35,.9].map(h=>V3(a.x,heightAt(a.x,a.z)+a.size*h,a.z)));
 for(const c of world.userData.cutaways??[]){if(!(c.group.userData.authored46&&c.group.userData.door)&&c.group.userData.landmark!=='Highmere gate')continue;let covered=false;
  for(const point of targets){const delta=point.clone().sub(camera.position),distance=delta.length();authoredRay46.set(camera.position,delta.normalize());authoredRay46.far=distance-.35;if(!authoredRay46.ray.intersectsBox(c.box))continue;if(authoredRay46.intersectObjects(c.meshes,false).length){covered=true;break;}}
  if(covered)c.until=clock+.18;const hidden=covered||clock<c.until;c.hidden=hidden;c.fade.value=c.target=hidden?1:0;for(const m of c.meshes)m.userData.viewHidden=hidden;if(c.group.userData.plantRanges&&c.group.userData.plantsHidden!==hidden){setBuildingPlantsHidden(c.group,hidden);c.group.userData.plantsHidden=hidden;}
 }
 return result;
};
