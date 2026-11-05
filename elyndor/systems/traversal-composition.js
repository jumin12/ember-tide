// Highmere occupies a dry north-bank terrace. Regional roads meet on land;
// southern travellers share one perpendicular crossing away from that court.
const highmereApproach66={origin:[...POIS.highmere.node],shift:[0,-38]};
{
 const origin=highmereApproach66.origin,at=([x,z])=>[origin[0]+x,origin[1]+z],court=at([0,-38]),south=at([30,35]);
 const densify=points=>{const out=[points[0]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let j=1;j<=steps;j++)out.push([mix(a[0],b[0],j/steps),mix(a[1],b[1],j/steps)]);}return out;};
 for(const road of MACRO_ROADS15){
  if(!(road.atlas18??[]).includes('highmere'))continue;
  const reverse=Math.hypot(road.p.at(-1)[0]-origin[0],road.p.at(-1)[1]-origin[1])<2,points=(reverse?[...road.p].reverse():road.p).filter(p=>Math.hypot(p[0]-origin[0],p[1]-origin[1])>=82);
  if(!points.length)continue;const ids=road.atlas18??[],southern=ids.some(k=>['alderbridge','harbor'].includes(k)),via=ids.includes('fern')?[at([-50,-38])]:ids.includes('relief')?[at([-34,-60])]:[at([35,-53])];
  const path=southern?[south,...points]:[court,...via,...points];road.p=densify(reverse?path.reverse():path);road.approach66=true;
 }
 MACRO_ROADS15.push({kind:'trail',atlas18:['highmere','highmere-crossing66'],approach66:true,p:densify([court,at([30,-38]),south])});
 POIS.highmere.node=court;const ref=atlasPoint18(POIS.highmere.atlas18??'highmere');if(ref){ref.x=(court[0]+1024)/2048*100;ref.y=(court[1]+576)/1152*100;}
 MACRO_SEGMENTS15.splice(0,MACRO_SEGMENTS15.length,...MACRO_ROADS15.flatMap(r=>r.p.slice(1).map((b,i)=>({a:r.p[i],b,ya:Math.max(1.4,macroBase15(...r.p[i])),yb:Math.max(1.4,macroBase15(...b))}))));
 MACRO_ROAD_GRID15.clear();for(const s of MACRO_SEGMENTS15)for(let x=Math.floor((Math.min(s.a[0],s.b[0])-12)/32);x<=Math.floor((Math.max(s.a[0],s.b[0])+12)/32);x++)for(let z=Math.floor((Math.min(s.a[1],s.b[1])-12)/32);z<=Math.floor((Math.max(s.a[1],s.b[1])+12)/32);z++){const key=x+','+z;if(!MACRO_ROAD_GRID15.has(key))MACRO_ROAD_GRID15.set(key,[]);MACRO_ROAD_GRID15.get(key).push(s);}
 traversalTerrain.version=7;traversalTerrain.grid=null;macroGrid15=null;macroArt16.recipes.clear();roadNavGraph=null;planWaterCrossings();highmereApproach66.crossings=spans38.filter(b=>Math.hypot(b.x-origin[0],b.z-origin[1])<75).length;
}
// A continuous habitat field composes woodland, open downs, river verges and
// exposed ridges. It changes dressing only: the authored geography and sealed
// route boundary remain the source of collision, travel and interaction data.
function habitat66(x,z){
 const h=macroGround(x,z),road=macroRoadInfo15(x,z).d,river=macroRiverInfo15(x,z),bank=river.d-river.width;
 let destination=1e4;for(const p of Object.values(POIS))destination=Math.min(destination,Math.hypot(x-p.node[0],z-p.node[1])-(p.kind==='town'?47:31));
 const broad=(Math.sin(x*.013+Math.sin(z*.018)*1.7)+Math.cos(z*.017-x*.008)+2)/4;
 const cluster=(Math.sin(x*.061+Math.cos(z*.037)*2)+Math.cos(z*.049-x*.023)+2)/4;
 const meadow=Math.sin((x+z*.25)*.008+1.3)*Math.cos(z*.011-.7)>.28;
 let density=meadow?.08:mix(.22,.9,smooth(.23,.73,broad));density*=mix(.35,1,smooth(.25,.6,cluster));
 if(h>23)density*=1-smooth(23,38,h);if(bank<10)density*=smooth(3,10,bank);
 density*=smooth(5,15,road)*smooth(0,17,destination);
 return{density,road,bank,destination,h,meadow,cluster};
}
const habitatTreeBefore66=buildSolidTree;
buildSolidTree=function(x,z,speciesScale,type,random,...rest){
 if(activeScene?.kind!=='overworld')return habitatTreeBefore66(x,z,speciesScale,type,random,...rest);
 const q=habitat66(x,z),sample=noise(x*.341+17,z*.379-19);if(sample>q.density)return null;
 const scale=speciesScale*mix(.74,1.16,noise(x*.58,z*.49));return habitatTreeBefore66(x,z,scale,type,random,...rest);
};
const woodlandBefore66=boundaryWoodland47;
boundaryWoodland47=function(f,ground,theme,trees,random){
 const result=woodlandBefore66(f,ground,theme,trees,random);if(!f.overworld)return result;
 let retained=0;for(const tree of trees){const q=habitat66(tree.x,tree.z),depth=-f.distance(tree.x,tree.z);
  // Retain a deep, irregular woodland edge at every traversable boundary.
  // Beyond that edge the field opens into meadows and separate forest masses.
  const edge=1-smooth(7,22,depth),density=Math.max(q.density,edge*.91);
  if(q.destination<3||q.road<6||noise(tree.x*.293+11,tree.z*.317)>density)continue;
  trees[retained++]=tree;
 }trees.length=retained;return result;
};
// Feathered shoulders are authored into the existing road blend attribute.
// Vertex positions, bridge heights and the collision floor remain unchanged.
const terrainBefore66=macroTerrain15;
macroTerrain15=function(...args){const result=terrainBefore66(...args);
 for(const o of world.userData.terrainChunks??[]){const p=o.geometry.attributes.position,road=o.geometry.attributes.terrainRoad;if(!road)continue;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),d=macroRoadInfo15(x,z).d,edge=Math.sin(x*.27+Math.sin(z*.19))*.36+Math.cos(z*.32-x*.1)*.22,width=1.7+Math.sin(x*.043+z*.061)*.24;road.setX(i,1-smooth(width,5.4+edge,d));if(Math.hypot(x-highmereApproach66.origin[0],z-highmereApproach66.origin[1])<160){p.setY(i,macroGround(x,z));const color=o.geometry.attributes.color;if(color){const c=terrainTint38(x,z).lerp(new THREE.Color('#d9c5a3'),1-smooth(1.5,3.4,d));color.setXYZ(i,c.r,c.g,c.b);color.needsUpdate=true;}}}road.needsUpdate=true;p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();
 }return result;
};
function miniatureTurret66(root,x,y,z,r,h,atlas,color='#7f9ead'){
 piece16(root,geo16('miniature-turret66',()=>new THREE.CylinderGeometry(1,1.12,1,12)),'wall','#d0cdb8',x,y+h*.5,z,r,h,r,atlas);
 for(const side of[-1,1])block16(root,x,y+h*.68,z+side*r*1.015,.27,h*.2,.07,'window','#f3d59b',atlas);
 piece16(root,geo16('miniature-turret-roof66',()=>new THREE.ConeGeometry(1.3,1,12)),'slate',color,x,y+h+1.6,z,r,3.2,r,atlas);
 block16(root,x,y+h+3.35,z,.07,.8,.07,'metal','#c4ad74',atlas);
}
const townRecipeBefore66=townRecipe16;
function miniatureLaneDry66(p,start){const r=Math.hypot(...start),end=start.map(v=>v/(r||1)*8),steps=Math.max(2,Math.ceil(r));for(let i=0;i<=steps;i++){const t=i/steps,x=p.node[0]+mix(start[0],end[0],t),z=p.node[1]+mix(start[1],end[1],t);if(traversalWet(x,z)&&!spans38.some(b=>{const q=bridgeLocal15(b,x,z);return Math.abs(q.u)<b.length/2+.5&&Math.abs(q.v)<b.width/2;}))return false;}return true;}
townRecipe16=function(key,p){
 const plan=townRecipeBefore66(key,p);if(plan.authored66)return plan;plan.authored66=true;
 if(key==='highmere'){
  const candidates=[[3,-24],[-23,23],[24,24],[-30,10],[31,10],[-24,-23],[24,-23],[-35,23],[35,23],[0,36],...[28,36,44,50].flatMap(r=>Array.from({length:24},(_,i)=>[Math.cos(i*TAU/24)*r,Math.sin(i*TAU/24)*r]))];
  for(const[dx,dz]of candidates){
   const w=20,d=13,h=8.2,r=Math.hypot(w,d)/2,a=Math.abs(dx)>Math.abs(dz)?(dx>0?-Math.PI/2:Math.PI/2):(dz>0?Math.PI:0),cw=Math.abs(Math.sin(a))>.5?d:w,cd=Math.abs(Math.sin(a))>.5?w:d,ys=[];let clear=miniatureLaneDry66(p,[dx,dz]);
   for(let ix=0;ix<=10&&clear;ix++)for(let iz=0;iz<=7;iz++){const x=p.node[0]+dx+(ix/10-.5)*cw,z=p.node[1]+dz+(iz/7-.5)*cd,y=macroGround(x,z);if(traversalWet(x,z)||macroRoadInfo15(x,z).d<2.7){clear=false;break;}ys.push(y);}
   if(!clear||Math.max(...ys)-Math.min(...ys)>1.8)continue;
   const castle={x:dx,z:dz,y:Math.max(...ys)+.04,w,d,h,a,r,foundation66:Math.max(...ys)-Math.min(...ys)};
   const homes=plan.slice(1).filter(q=>Math.hypot(q.x-dx,q.z-dz)>q.r+r+1);plan.splice(0,plan.length,castle,...homes);break;
  }
 }
 const desired={brookstead:10,fern:8,highmere:10,alder:9,relief:6,harbor:8}[key]??6;
 const offsets=[[-20,-17],[18,-18],[-22,1],[22,2],[-17,18],[17,19],[0,-24],[0,24],[-24,-10],[25,-9],[-24,13],[25,13],[-14,-27],[14,-27],[0,-31],[-26,-21],[26,-21],...[25,32,39].flatMap(r=>Array.from({length:24},(_,i)=>[Math.cos(i*TAU/24)*r,Math.sin(i*TAU/24)*r]))];
 for(const[dx,dz]of offsets){if(plan.length>=desired)break;const w=4.2+(plan.length%3)*.3,d=3.7+(plan.length%2)*.5,h=4.6+(plan.length%3)*.35,r=Math.hypot(w,d)*.5,x=p.node[0]+dx,z=p.node[1]+dz;
  if(macroGround(x,z)<0||traversalWet(x,z)||!miniatureLaneDry66(p,[dx,dz])||macroRoadInfo15(x,z).d<r+4||plan.some(q=>Math.hypot(q.x-dx,q.z-dz)<q.r+r+1.2)||spans38.some(b=>{const q=bridgeLocal15(b,x,z);return Math.abs(q.u)<b.length/2+r+2&&Math.abs(q.v)<b.width/2+r+2;}))continue;
  const ys=[macroGround(x,z),...[-1,1].flatMap(sx=>[-1,1].map(sz=>macroGround(x+sx*w/2,z+sz*d/2)))];if(Math.max(...ys)-Math.min(...ys)>.65)continue;
  plan.push({x:dx,z:dz,y:Math.max(...ys)+.04,w,d,h,a:Math.abs(dx)>Math.abs(dz)?(dx>0?-Math.PI/2:Math.PI/2):(dz>0?Math.PI:0),r});
 }return plan;
};
const settlementDetailsBefore66=addSettlementLandmarks16;
addSettlementLandmarks16=function(root,key,...args){if(key!=='highmere')return settlementDetailsBefore66(root,key,...args);};
const settlementBefore66=settlement16;
settlement16=function(key,p,atlas=false){
 const root=settlementBefore66(key,p,atlas),q=townRecipe16(key,p)[0];if(!q)return root;const y=atlas?atlasHeight(p.node[0]+q.x,p.node[1]+q.z):q.y;
 for(const house of townRecipe16(key,p)){
  const start=[house.x+Math.sin(house.a)*(house.d*.5+.45),house.z+Math.cos(house.a)*(house.d*.5+.45)],radius=Math.hypot(...start);if(radius<10||!miniatureLaneDry66(p,start))continue;const end=start.map(v=>v/radius*8),dx=end[0]-start[0],dz=end[1]-start[1],len=Math.hypot(dx,dz),pos=[],uv=[],steps=Math.max(2,Math.ceil(len));
  const at=(t,side)=>{const x=start[0]+dx*t-dz/len*side*.70,z=start[1]+dz*t+dx/len*side*.70;return[x,(atlas?atlasHeight(p.node[0]+x,p.node[1]+z):macroGround(p.node[0]+x,p.node[1]+z))+.065,z];};
  for(let i=0;i<steps;i++){const a=at(i/steps,-1),b=at(i/steps,1),c=at((i+1)/steps,-1),d=at((i+1)/steps,1);for(const v of[a,b,c,b,d,c]){pos.push(...v);uv.push((v[0]+p.node[0])*.12,(v[2]+p.node[1])*.12);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();const path=piece16(root,g,'earth','#c4b391',0,0,0,1,1,1,atlas);path.castShadow=false;path.name='Miniature village lane';
 }
 if(key==='highmere'){
  // A keep with a tall central hall and four slender blue-roofed towers is
  // the capital's regional silhouette; houses form its lower outer ward.
  root.children.find(g=>g.userData.landmarkHouse45)?.removeFromParent();for(const child of[...root.children])if([sharedGeo['atlas16-tower'],sharedGeo['atlas16-spire']].includes(child.geometry)&&child.geometry)child.removeFromParent();const castle=new THREE.Group();castle.name='Highmere royal keep';castle.position.set(q.x,y,q.z);castle.rotation.y=q.a;root.add(castle);block16(castle,0,-(q.foundation66??0)*.5-.10,0,q.w+.2,(q.foundation66??0)+.85,q.d+.2,'wall','#bdc1ad',atlas);
  block16(castle,0,4.5,0,q.w*.82,9,q.d*.82,'plaster','#d7d4be',atlas);roof16(castle,0,9,0,q.w*.95,5,q.d*.95,'#7497b4',atlas);
  for(const side of[-1,1]){const gable=piece16(castle,geo16('gableFace',()=>new THREE.PlaneGeometry(1,1)),'plaster','#e0deca',0,9,side*q.d*.477,q.w*.95,5,1,atlas);if(side<0)gable.rotation.y=Math.PI;block16(castle,0,8.7,side*q.d*.42,q.w*.84,.3,.35,'wall','#b9c0b7',atlas);}
  const face=q.d*.42+.13;for(const x of[-q.w*.35,-q.w*.18,q.w*.18,q.w*.35]){block16(castle,x,3.9,face,.38,7.8,.6,'wall','#c2c8bc',atlas);block16(castle,x,7.95,face,.58,.35,.75,'wall','#d7d8c4',atlas);}
  for(const side of[-1,1]){block16(castle,side*q.w*.27,5.5,face+.21,1.0,2.6,.06,'cloth','#315e83',atlas);block16(castle,side*q.w*.27,6.85,face+.23,1.25,.1,.16,'metal','#cdb879',atlas);block16(castle,side*q.w*.27,5.55,face+.25,.12,1.5,.05,'metal','#deca89',atlas);}
  const arch=geo16('royal-pointed-arch66',()=>{const outer=new THREE.Shape();outer.moveTo(-1.48,0);outer.lineTo(-1.48,3);outer.quadraticCurveTo(-1.3,4.1,0,4.9);outer.quadraticCurveTo(1.3,4.1,1.48,3);outer.lineTo(1.48,0);outer.closePath();const hole=new THREE.Path();hole.moveTo(-1.02,0);hole.lineTo(1.02,0);hole.lineTo(1.02,3);hole.quadraticCurveTo(.85,3.7,0,4.3);hole.quadraticCurveTo(-.85,3.7,-1.02,3);hole.closePath();outer.holes.push(hole);return new THREE.ExtrudeGeometry(outer,{depth:.24,bevelEnabled:false,curveSegments:10});});
  piece16(castle,arch,'wall','#e0ddc7',0,.10,face+.07,1,1,1,atlas);block16(castle,0,2.1,face+.09,1.95,4.2,.11,'darkWood','#6c6656',atlas);for(const side of[-1,1])block16(castle,side*.42,1.85,face+.2,.035,2.8,.03,'metal','#c8b57f',atlas);
  for(const x of[-q.w*.44,q.w*.44])for(const z of[-q.d*.42,q.d*.42])miniatureTurret66(castle,x,0,z,1.25,12.8+(z<0?2:0),atlas,'#6f91b4');
  miniatureTurret66(castle,0,4,-q.d*.25,1.08,12,atlas,'#7396b7');
  for(const x of[-2.2,0,2.2])block16(castle,x,5.5,q.d*.42+.04,.8,3.8,.12,'window','#d5e4d9',atlas);
  block16(castle,0,2.1,q.d*.43,1.8,4.2,.15,'door','#baa77d',atlas);
 }else if(key==='brookstead'){
  // The Lantern Inn's broad slate roof, chimney, porch and sign anchor the
  // clustered timber houses, matching the inhabited settlement's vocabulary.
  const front=q.z+q.d*.5;roof16(root,q.x,y+2.5,front+1,q.w*.9,1.1,2.4,'#7d929e',atlas);
  for(const side of[-1,1])block16(root,q.x+side*q.w*.40,y+1.25,front+1.6,.15,2.5,.15,'wood','#967c57',atlas);
  block16(root,q.x+q.w*.30,y+q.h+2.1,q.z-q.d*.2,.68,2.9,.7,'wall','#b9b9a3',atlas);
  const homes=root.children.filter(g=>g.userData.landmarkHouse45).sort((a,b)=>traversalShoreDistance(p.node[0]+a.position.x,p.node[1]+a.position.z)-traversalShoreDistance(p.node[0]+b.position.x,p.node[1]+b.position.z)),mill=homes[0];if(mill&&traversalShoreDistance(p.node[0]+mill.position.x,p.node[1]+mill.position.z)<4){const f=mill.userData.landmarkHouse45,wheel=new THREE.Group();wheel.position.set(-f.w*.5-.15,1.65,0);wheel.rotation.y=Math.PI/2;mill.add(wheel);piece16(wheel,geo16('miniature-mill-rim66',()=>new THREE.TorusGeometry(1.45,.12,6,20)),'wood','#998569',0,0,0);for(let i=0;i<10;i++){const a=i*TAU/10;const spoke=block16(wheel,Math.cos(a)*.73,Math.sin(a)*.73,0,1.45,.09,.12,'darkWood','#9c8968',atlas);spoke.rotation.z=a;const paddle=block16(wheel,Math.cos(a)*1.43,Math.sin(a)*1.43,0,.42,.18,.6,'wood','#b29a73',atlas);paddle.rotation.z=a;}}
 }else if(key==='fern'){
  for(const house of root.children.filter(g=>g.userData.landmarkHouse45)){const spec=house.userData.landmarkHouse45;roof16(house,0,spec.h+1.45,0,spec.w*.78,1.15,spec.d*.78,'#728f77',atlas);for(const side of[-1,1])block16(house,side*spec.w*.43,1,spec.d*.65,.15,2,.15,'wood','#9d8864',atlas);}
 }else if(key==='relief'){
  // A canvas field hospital, with a timber supply shelter, is distinct from
  // permanent towns. Keep every existing house footprint/collision intact.
  for(const house of root.children.filter(g=>g.userData.landmarkHouse45)){const spec=house.userData.landmarkHouse45;house.clear();roof16(house,0,2.2,0,spec.w,3.4,spec.d,'#d7cdb0',atlas);for(const side of[-1,1])block16(house,side*spec.w*.46,1.1,0,.13,2.2,spec.d,'cloth','#c4bca0',atlas);block16(house,0,1.2,-spec.d*.46,spec.w,2.4,.1,'cloth','#d8ccb0',atlas);for(const side of[-1,1])block16(house,side*spec.w*.48,1.5,spec.d*.5,.12,3,.12,'wood','#8c7958',atlas);}
 }else if(key==='alder'){
  const pavilion=new THREE.Group();pavilion.position.set(q.x,y,q.z+q.d*.5+1);root.add(pavilion);roof16(pavilion,0,2.8,0,q.w*.82,1.25,2.2,'#a8aa80',atlas);for(const side of[-1,1])block16(pavilion,side*q.w*.36,1.4,.8,.15,2.8,.15,'wood','#a08a60',atlas);
 }else if(key==='harbor'){
  for(const house of root.children.filter(g=>g.userData.landmarkHouse45).slice(0,2)){const spec=house.userData.landmarkHouse45;for(const side of[-1,1])block16(house,side*spec.w*.35,.75,spec.d*.6,.7,1.5,.75,'crateFace','#b7a27e',atlas);block16(house,0,spec.h*.7,spec.d*.51,1.5,.5,.09,'metal','#aa9876',atlas);}
 }
 root.userData.miniatureIdentity66=key;return root;
};
const worldSiteBefore66=worldSiteModel45;
worldSiteModel45=function(key,p){
 const result=worldSiteBefore66(key,p),root=world.userData.landmarks45?.[key];if(!root)return result;
 if(p.kind==='clearing'){
  for(const child of root.children){if(child.geometry?.type==='OctahedronGeometry')child.position.y=3.635;if(Math.abs(Math.abs(child.position.x)-2.55)<.01)child.position.y=child.position.y<1.5?1.65:2.61;}
  for(let i=0;i<5;i++){const a=i*TAU/5+.4,r=3.1,h=i===0?2.5:1.4;const shard=piece16(root,geo16('miniature-light-shard66',()=>new THREE.OctahedronGeometry(1,0)),'lightFacets','#8bc6cd',Math.sin(a)*r,.4+h*.55,Math.cos(a)*r,.28,h*.55,.28);shard.material.emissive.set('#558d9c');shard.material.emissiveIntensity=.18;}
  for(const side of[-1,1]){block16(root,side*2.8,2.2,-1,.45,3.6,.45,'wall','#bdc3ad');block16(root,side*2.8,4.15,-1,.75,.3,.75,'metal','#b5a071');}
 }else if(p.kind==='trail'){
  miniatureTurret66(root,-2.7,.41,-1.5,.72,key==='snow'?7.2:5.5,false,key==='snow'?'#92a7b0':'#799488');
  block16(root,2.5,2.9,-1.8,.09,2.2,.09,'wood','#9f8861');block16(root,2.9,3.4,-1.8,.8,.6,.05,'cloth','#6b8177');
 }else{
  for(const side of[-1,1]){block16(root,side*3.2,1.5,-2.8,1.1,3,1.1,'wall','#b2baa9');block16(root,side*3.2,3.2,-2.8,1.5,.4,1.5,'wall','#c3c9b8');}
  const rubble=seeded(key.length*661);for(let i=0;i<6;i++){const a=rubble()*TAU,r=2+rubble()*2.1;const o=block16(root,Math.cos(a)*r,.595,Math.sin(a)*r,.55+rubble()*.5,.55,.8,'rock','#adb6a3');o.rotation.y=rubble()*TAU;}
  if(key==='depths'){const o=block16(root,0,2,-.8,2.3,3,.35,'darkWood','#45524b');o.name='Shadowed passage';}
 }
 root.userData.miniatureIdentity66=key;return result;
};
// Larger sprites are uniformly scaled and face the lens. The logical radius,
// walk speed, encounter distance and interaction code still use the old scale.
const cameraTraversalBefore66=updateCamera;
updateCamera=function(...args){const result=cameraTraversalBefore66(...args);if(!compactWorld44())return result;for(const a of[player,...followers]){a.mesh.quaternion.copy(camera.quaternion);a.mesh.scale.setScalar(compactTraversal44.partyScale*1.14);}return result;};
const worldCompositionBefore66=buildWorld;
buildWorld=function(...args){const result=worldCompositionBefore66(...args);if(activeScene?.kind==='overworld')world.userData.traversal66={visualPartyFactor:1.14,logicalPartyScale:compactTraversal44.partyScale,habitats:['dense forest','light woodland','open meadow','road shoulder','riverbank','rocky ridge','settlement approach'],miniatureKeys:Object.keys(POIS),boundaryPreserved:world.userData.boundary46?.sealed===true};return result;};
