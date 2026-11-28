// Local architecture is placed against an authored street plan. A facade,
// doorway, planted window box and its collision rotate together.
const authoredGroundBefore46=groundAt,authoredGroundLevels46=new Map();
const districtStairPlans={
 highmere:[[-84,-88,-82,-102,7.8,4.5],[-70,-117,-70,-135,7.1,5.6]],
 fern:[[93.5,68.4,92.1,56.7,4.95,3.85]],
 alder:[[133,-101.5,132,-115.8,5.15,4.0]],
 harbor:[[318,63.1,319,48.2,5.28,5.4]]
};
function districtShoulder(key,x,z){
 let y=0;
 for(const [sx,sz,ex,ez,width,rise] of districtStairPlans[key]??[]){
  const dx=ex-sx,dz=ez-sz,length=Math.hypot(dx,dz);
  const t=((x-sx)*dx+(z-sz)*dz)/(length*length);
  if(t<=.32||t>=1)continue;
  const side=Math.abs((x-sx)*dz-(z-sz)*dx)/length-width*.5;
  y+=rise*(1-smooth(0,1,t))*smooth(.32,.45,t)*smooth(.32,1.62,side)*(1-smooth(8.6,12.5,side));
 }
 return y;
}
// The lip of each planted terrace follows the lane below it. The last two
// metres at each end grade into the lane so the upper garden has an approach.
const townGardenShelves={
 highmere:[[-122,-98,-112,-115,2.6,2.9,10],[-65,-40,-118,-122,2.2,3.0,10],[-115,-93,-72,-74,2.7,1.42,8],[-62,-40,-73,-75,2.1,1.67,8]],
 fern:[[57,83,68,69,3.3,2.24,9],[103,133,66,63,3.5,2.64,9],[98,119,102,99,1.6,1.35,6]],
 alder:[[99,125,-106,-102,1.8,2.3,8],[141,160,-105,-102,2.4,2.52,9],[139,156,-81,-79,2.5,1.35,7]],
 harbor:[[277,306,55,53,2.3,2.02,9],[330,358,51,53,2.2,1.96,7]]
};
function gardenShelfLip(s,x){const u=(x-s[0])/(s[1]-s[0]);return mix(s[2],s[3],u)+s[4]*Math.sin(Math.PI*u);}
function gardenShelfEnd(s,x){return smooth(s[0],s[0]+3.8,x)*(1-smooth(s[1]-3.8,s[1],x));}
function gardenShelfHeight(key,x,z){
 let y=0;
 for(const s of townGardenShelves[key]??[]){
  if(x<=s[0]||x>=s[1])continue;
  const back=gardenShelfLip(s,x)-z;
  if(back<=-.44||back>s[6])continue;
  y+=s[5]*gardenShelfEnd(s,x)*smooth(-.44,.95,back)*(1-smooth(s[6]*.48,s[6],back));
 }
 return y;
}
function districtRelief(key,x,z){
 if(key==='highmere')return 4.5*(1-smooth(-103,-87,z))+5.6*(1-smooth(-135,-116,z))+districtShoulder(key,x,z)+gardenShelfHeight(key,x,z);
 if(key==='alder')return 4.0*(1-smooth(-116,-100,z))+.98*smooth(136,152,x)+districtShoulder(key,x,z)+gardenShelfHeight(key,x,z);
 if(key==='fern'){
  const upland=3.85*(1-smooth(56,70,z)),innRise=2.68*smooth(103,119,x)*smooth(78,96,z);
  const bank=3.45*Math.exp(-((x-127)**2/138+(z-97)**2/42));
  // The portal is cut into the face of the bank. The path in front of its
  // treads retains a clear floor, while turf wraps both stone shoulders.
  const cut=(1-smooth(2.11,4.25,Math.abs(x-127)))*smooth(98.3,101.2,z);
  return upland+innRise+bank*(1-cut)+districtShoulder(key,x,z)+gardenShelfHeight(key,x,z);
 }
 return 0;
}
groundAt=function(x,z,...args){
 const p=activeScene?.kind==='poi'&&JRPG_LAYOUTS46[activeScene.key];if(!p||['camp','harbor'].includes(p.theme))return authoredGroundBefore46(x,z,...args);
 const relief=districtRelief(activeScene.key,x,z);
 if(p.theme==='city'||p.theme==='orchard')return authoredGroundBefore46(x,z,...args)+relief;
 const main=p.courts[0];let level=authoredGroundLevels46.get(activeScene.key);if(level===undefined){level=authoredGroundBefore46(main[0],main[1]);authoredGroundLevels46.set(activeScene.key,level);}
 let distance=Infinity;for(const[cx,cz,r]of p.courts)distance=Math.min(distance,Math.hypot(x-cx,z-cz)-r);
 for(const route of [...p.routes,...p.loops??[]])for(let i=1;i<route.length;i++)distance=Math.min(distance,segmentDistance(x,z,route[i-1],route[i])-6.2);
 const target=level+clamp((z-main[1])*.018+(x-main[0])*.008,-2,2),centre=Math.hypot(x-main[0],z-main[1]);const flattened=mix(target,level,1-smooth(main[2]-3,main[2]+3,centre)),blend=smooth(0,13,distance);return relief+(blend===0?flattened:mix(flattened,authoredGroundBefore46(x,z,...args),blend));
};
const valleyWatercourses={
 fern:{x0:34,x1:167,x:94,w:3.85,span:8.20,level:1.82,slope:.017,
  centre:x=>106.4+12.1*Math.tanh((x-69)/22)+3.5*Math.sin((x-94)*.060)},
 alder:{x0:65,x1:202,x:91,w:4.10,span:8.75,level:.48,slope:.006,
  centre:x=>-60.7+9.95*Math.tanh((x-104)/21)+2.60*Math.sin((x-111)*.048)+12.6*smooth(92,112,x)}
};
function streamWidth(q,x){return 2.38+.48*Math.cos((x-q.x)*.126)+.29*Math.sin((x-q.x)*.27);}
function streamLevel(q,x){return q.level+(x-q.x)*q.slope;}
const groundBeforeValleyStreams=groundAt;
groundAt=function(x,z,...rest){
 const ground=groundBeforeValleyStreams(x,z,...rest),q=activeScene?.kind==='poi'&&valleyWatercourses[activeScene.key];
 if(!q||x<q.x0||x>q.x1)return ground;
 const across=Math.abs(z-q.centre(x)),w=streamWidth(q,x);
 if(across>w+4.6)return ground;
 const waterY=streamLevel(q,x),bed=waterY-.98+1.30*smooth(w-.96,w+.44,across);
 return mix(bed,ground,smooth(w+.44,w+4.60,across));
};
function placeHouse46(spec,kit){
 const[x,z,w,d,turn=0,role]=spec,first=colliders.length,plants=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length]));
 const g=kit==='forest'?woodlandHouse(x,z,w,d,role):kit==='camp'?reliefShelter(x,z,w,d):kit==='city'?royalHouse(x,z,w,d):brookHouse(x,z,w,d,'home',role);
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
  PLACES.council=[-92,-131];PLACES.aidOffice=[-55,-104];
  for(const[id,w,d,kind,turn]of[['council',15.3,12.8,'council',1],['aidOffice',12,10,'council',0],['archives',16,13,'archives',0],['inn',14,12,'inn',-1]]){const first=colliders.length,plants=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length])),g=openHall(id,w,d,kind);if(g){orientHouse46(g,turn*Math.PI/2,first,plants);g.userData.authored46=true;g.userData.interior46=id==='inn'?'highmereInn':id;}}
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
