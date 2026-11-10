// Compact settlements and adventure silhouettes grow out of the actual terrain.
// Their named gateways share the full-size POI's entrance registry.
const miniatures71={version:71,gateCount:0};
function miniWorld71(q,x,z){const c=Math.cos(q.a),s=Math.sin(q.a);return{x:q.x+x*c+z*s,z:q.z-x*s+z*c};}
function miniLocal71(q,x,z){const c=Math.cos(q.a),s=Math.sin(q.a),dx=x-q.x,dz=z-q.z;return{x:dx*c-dz*s,z:dx*s+dz*c};}
const courtPrepareBefore71=prepareDioramas67;
prepareDioramas67=function(){
 courtPrepareBefore71();if(miniatures71.ready)return;miniatures71.ready=true;
 MACRO_ROADS15.splice(0,MACRO_ROADS15.length,...MACRO_ROADS15.filter(r=>!r.diorama67));
 for(const[key,q]of dioramas67.sites){
  q.legacyGate71=[...q.gate];q.hub71={x:0,z:1.5};q.gates71=[];
  const rows=entranceDescriptors64(key),c=Math.cos(q.a),s=Math.sin(q.a);
  for(const row of rows){
   const n=Math.hypot(...row.dir)||1,dir=row.dir.map(v=>v/n),lx=dir[0]*c-dir[1]*s,lz=dir[0]*s+dir[1]*c;
   const edge=Math.min((q.w*.5-1.4)/Math.max(.001,Math.abs(lx)),(q.d*.5-1.4)/Math.max(.001,Math.abs(lz)));let reach=edge;
   for(let i=0;i<8;i++){const at=miniWorld71(q,lx*reach,lz*reach);if([-3.8,0,6].every(v=>!traversalWet(at.x+dir[0]*v,at.z+dir[1]*v)))break;reach-=.75;}
   const local={x:lx*reach,z:lz*reach},at=miniWorld71(q,local.x,local.z),gate={id:row.id,side:row.side,dir,x:at.x,z:at.z,local,outer:[at.x+dir[0]*6,at.z+dir[1]*6]};q.gates71.push(gate);miniatures71.gateCount++;
  }
  const old=q.legacyGate71;q.primary71=[...q.gates71].sort((a,b)=>Math.hypot(a.x-old[0],a.z-old[1])-Math.hypot(b.x-old[0],b.z-old[1]))[0];q.gate=[q.primary71.x,q.primary71.z];
 }
 // Each regional road ends at its real gateway. There are no decorative
 // spokes ending in a field and no obsolete road tail to the old town dot.
 for(const[key,q]of dioramas67.sites){
  const source=roadNetwork71.locations.get(key),hub=miniWorld71(q,q.hub71.x,q.hub71.z),avoid=(x,z)=>{const p=miniLocal71(q,x,z);return (p.x/(q.w*.42))**2+(p.z/(q.d*.42))**2<1;};
  for(const link of source.links){
   const gate=q.gates71.find(g=>g.side===link.side),road=link.road,points=link.end?[...road.p].reverse():[...road.p];if(!gate)continue;let connection=null;
   for(let i=1;i<points.length;i++){
    const at=points[i],distance=Math.hypot(at[0]-q.x,at[1]-q.z);if(distance<Math.hypot(q.w,q.d)*.5+12)continue;if(distance>150)break;const path=regionalConnection71(gate.outer,at,avoid);if(path){connection={index:i,path:bendRoad71(path)};break;}
   }
   if(!connection){roadNetwork71.connections.push({key,id:gate.id,connected:false});continue;}
   const inner=[[hub.x,hub.z],[gate.x,gate.z],...connection.path,...points.slice(connection.index+1)];road.p=link.end?inner.reverse():inner;road.entrances71??=[];road.entrances71.push(gate.id);roadNetwork71.connections.push({key,id:gate.id,connected:true,join:connection.path.at(-1),points:connection.path});
  }
 }
 rebuildRoadIndex67();
};
// Registered terrain lanes already have feathered, naturally textured shoulders.
// No second coplanar ribbon or square texture decal is needed.
function miniatureLane71(){}
function miniFooting71(root,q,x,z,w,d,a=0){
 const c=Math.cos(a),s=Math.sin(a),samples=[];for(const sx of[-1,0,1])for(const sz of[-1,0,1]){const xx=x+sx*w*.5*c+sz*d*.5*s,zz=z-sx*w*.5*s+sz*d*.5*c,pt=miniWorld71(q,xx,zz);samples.push(macroGround(pt.x,pt.z));}
 const y=Math.max(...samples)+.07,bottom=Math.min(...samples)-.2,h=y-bottom,g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=a;root.add(g);
 const foundation=block16(g,0,-h*.5,0,w+.12,h,d+.12,'wall','#b0b6a2');foundation.name='Individual terrain-seated stone footing';
 const worldPt=miniWorld71(q,x,z),angle=q.a+a,ww=Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*d,dd=Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*d;obstacle(worldPt.x,worldPt.z,ww,dd,'miniature building');root.userData.siteFootprints45.push({x:worldPt.x,z:worldPt.z,w:ww,d:dd,floor:y});return g;
}
function miniatureGateway71(root,q,gate,key){
 const loc=gate.local,dir=gate.dir,localDir=miniLocal71(q,q.x+dir[0],q.z+dir[1]),right={x:localDir.z,z:-localDir.x},stone=key==='highmere'||key==='harbor',post=stone?'wall':'wood';
 for(const side of[-1,1]){const x=loc.x+right.x*3.0*side,z=loc.z+right.z*3.0*side,at=miniWorld71(q,x,z),y=macroGround(at.x,at.z),h=stone?3.8:3.2;block16(root,x,y+h/2,z,stone?.7:.32,h,stone?.7:.32,post,stone?'#c2c4b0':'#9b825d');if(stone)block16(root,x,y+h+.12,z,.9,.24,.9,'wall','#d0ceba');else{const cap=block16(root,x,y+h+.08,z,.50,.15,.5,'darkWood','#7d6c4e');cap.rotation.y=q.a;}if(side===1){const sign=block16(root,x,y+1.35,z,.90,.55,.13,'wood','#b8a27b');sign.rotation.y=Math.atan2(dir[0],dir[1])-q.a;}}
 if(POIS[key].kind==='town'){
  const at=miniWorld71(q,loc.x,loc.z),y=macroGround(at.x,at.z)+(stone?3.8:3.2),n=new THREE.Group();n.position.set(loc.x,y,loc.z);n.rotation.y=Math.atan2(localDir.x,localDir.z);root.add(n);block16(n,0,0,0,7.0,.22,.38,post,stone?'#bfc4b1':'#8c7856');if(key!=='relief')roof16(n,0,.12,0,7.2,.9,1.6,key==='fern'?'#718e77':'#71859a');
 }
 const start={x:loc.x-localDir.x*3.5,z:loc.z-localDir.z*3.5},outside={x:loc.x+localDir.x*5.5,z:loc.z+localDir.z*5.5};miniatureLane71(root,q,[start,loc,outside],3.4,key==='highmere'?'cobble':'earth');
 createInteraction('location',gate.x,gate.z,'Enter '+POIS[key].name);Object.assign(interactables.at(-1),{poi:key,entranceId64:gate.id,worldGate71:gate,radius:3.7,visualHeight:.2,diorama67:true});
}
function miniatureRocks71(root,q,x,z,size=1,kind=0){const at=miniWorld71(q,x,z),o=new THREE.Mesh(rockGeometry62(kind),rockMaterial62(q.key==='snow'?1:0));o.position.set(x,macroGround(at.x,at.z)+size*.1,z);o.scale.set(size,size*.8,size);o.rotation.y=x*.3+z*.8;o.castShadow=o.receiveShadow=true;root.add(o);return o;}
function miniatureWoodland71(root,q,random){
 for(let i=0;i<14;i++){const a=i*2.399963,x=Math.cos(a)*(q.w*.46+random()),z=Math.sin(a)*(q.d*.44+random());if(q.gates71.some(g=>Math.hypot(g.local.x-x,g.local.z-z)<5))continue;const at=miniWorld71(q,x,z);if(traversalWet(at.x,at.z))continue;const t=new THREE.Group();t.position.set(x,macroGround(at.x,at.z),z);root.add(t);miniatureTree67(t,0,0,q.key==='fern'||q.key==='snow'||i%4===0,.64+random()*.40);}
}
const MINIATURE_HOMES71={brookstead:[[-7.4,-5.2,7,5.2,5.2,-.12],[7.8,-5.0,5,4.5,4.0,.18],[-8.0,5.4,5,4.2,3.6,-.23],[7.8,5.4,4.6,4.2,3.5,.16]],fern:[[-6.5,-5.4,6.6,4.8,4.2,-.16],[7.4,-4.9,4.7,4.1,3.5,.22],[-7.0,5.5,4.6,4,3.4,-.29]],alder:[[-7.0,-5.1,6.3,4.8,5.0,-.13],[7.5,-5.1,5.7,4.5,4.3,.11],[-8,5.3,4.7,3.9,3.8,-.23],[7.4,5.2,4.9,4,3.7,.2]],harbor:[[-7.3,-5.2,6.9,5.0,4.8,-.12],[7.5,-4.8,5.5,4.3,4.2,.16],[-7.5,5.4,5.3,4.3,3.8,-.14],[7.4,5.5,4.8,4.1,3.8,.18]],relief:[[-7,-4.8,6.0,4.5,3,-.1],[7,-4.5,5.8,4.6,3,.22],[-7,5.4,4.6,3.9,2.5,-.2],[7,5.3,4.6,3.9,2.5,.15]]};
function miniatureHomes71(root,q,key){
 if(key==='highmere'){
  const g=miniFooting71(root,q,0,-6,18,10);g.scale.setScalar(.82);keepDiorama67(g);for(const child of [...g.children])if(child.userData.landmarkHouse45)child.removeFromParent();
  for(const[x,z,a]of[[-10,5,Math.PI-.04],[9,6,Math.PI+.04]]){const g=miniFooting71(root,q,x,z,4.6,4.1,a);house16(g,{x:0,z:0,y:0,w:4.6,d:4.1,h:4.2,a:0},key,x<0?1:2);}
  // Short rounded defensive remnants sit behind the keep, not around a square.
  for(let i=0;i<9;i++){const a=Math.PI+(.15+i*.095)*Math.PI,x=Math.cos(a)*14,z=Math.sin(a)*11-1,at=miniWorld71(q,x,z),m=block16(root,x,macroGround(at.x,at.z)+.8,z,2.0,1.6,.55,'wall','#adb6a5');m.rotation.y=-a;}
  return 3;
 }
 let count=0;for(const[x,z,w,d,h,variation]of MINIATURE_HOMES71[key]??[]){
  // Keep a full walking-width lane at every actual local exit.
  const lane=q.gates71.find(g=>segmentDistance(x,z,[q.hub71.x,q.hub71.z],[g.local.x,g.local.z])<Math.min(w,d)*.48+2.0);if(lane)continue;
  const a=(z>q.hub71.z?Math.PI:0)+variation*.18;
  const g=miniFooting71(root,q,x,z,w,d,a);if(key==='relief'){roof16(g,0,1.4,0,w,2,d,'#c8bfa4');for(const side of[-1,1]){block16(g,side*w*.47,.7,0,.14,1.4,d,'cloth','#b9b39b');block16(g,side*w*.47,1.4,d*.5,.12,2.8,.12,'wood','#907d58');}}else house16(g,{x:0,z:0,y:0,w,d,h,a:0},key,count);count++;
 }
 return count;
}
function miniatureAdventure71(root,q,key,p){
 const at=(x,z)=>{const pt=miniWorld71(q,x,z);return macroGround(pt.x,pt.z);};
 if(p.kind==='clearing'){
  const g=miniFooting71(root,q,0,-3,5.5,5.0);g.children[0].visible=false;piece16(g,geo16('light-ring71',()=>new THREE.CylinderGeometry(2.7,3,.40,16)),'wall','#bdc8b7',0,.2,0);piece16(g,geo16('light-crystal71',()=>new THREE.OctahedronGeometry(1,0)),'lightFacets','#9fd7d0',0,2.6,0,1,2.1,1);
  for(const[i,a]of[2.6,3.8,4.7,5.6].entries()){const x=Math.cos(a)*5,z=-3+Math.sin(a)*4.5,o=block16(root,x,at(x,z)+1.0,z,.6,2.0+i*.22,.7,'wall','#afbba7');o.rotation.y=a;miniatureRocks71(root,q,x+.5,z+.4,.55,i);}
 }else if(key==='depths'){
  // A shadowed stone mouth surrounded by distinct outcrops, with no plinth.
  const x=0,z=-4,y=at(x,z),g=new THREE.Group();g.position.set(x,y,z);root.add(g);const face=new THREE.Shape();face.moveTo(-2.3,0);face.lineTo(2.3,0);face.lineTo(2.3,2.1);face.quadraticCurveTo(0,6,-2.3,2.1);face.closePath();piece16(g,new THREE.ShapeGeometry(face),'darkWood','#182421',0,.08,.15);for(const[x,z,s,k]of[[-4,-4,2.4,8],[-2.5,-6,2.4,2],[1.0,-6,2.6,5],[3.8,-4.7,2.7,11],[-5.5,-2.0,1.3,3],[5.7,-1.7,1.2,0]])miniatureRocks71(root,q,x,z,s,k);
 }else if(p.kind==='trail'){
  const g=miniFooting71(root,q,-4,-3,5.2,4.6,.12);for(const x of[-2.2,2.2])for(const z of[-1.8,1.8])block16(g,x,2,z,.25,4,.25,'wood','#97845f');roof16(g,0,4,0,5.9,2.1,5.4,key==='snow'?'#bdcbd0':'#748b7c');miniatureRocks71(root,q,5,-4,1.8,key==='snow'?8:4);
 }else{
  const g=miniFooting71(root,q,-1,-4,7,3.2);g.children[0].visible=false;for(const side of[-1,1]){block16(g,side*2.7,2,0,1.05,4,1.5,'wall','#b2bea9');const cap=block16(g,side*2.7,4.2,0,1.4,.35,1.9,'wall','#bfc6b0');cap.rotation.z=side*.06;}const lintel=block16(g,0,4.4,0,6.5,.55,1.8,'wall','#b8c1ab');lintel.rotation.z=.025;for(let i=0;i<5;i++)miniatureRocks71(root,q,-6+i*.6,-5+(i%2),.5+i*.08,i);
 }
 return 1;
}
function buildMiniature71(key,p){
 const q=dioramas67.sites.get(key),root=new THREE.Group();root.position.set(q.x,0,q.z);root.rotation.y=q.a;root.name=p.name+' landscape miniature';root.userData={miniatureIdentity66:key,poiLandmark45:key,diorama67:true,naturalMiniature71:true,persistentLandmark16:true,siteFootprints45:[]};world.add(root);world.userData.buildings.push(root);world.userData.landmarks45??={};world.userData.landmarks45[key]=root;
 const hub=q.hub71;for(const gate of q.gates71){const mid={x:mix(hub.x,gate.local.x,.52),z:mix(hub.z,gate.local.z,.52)};miniatureLane71(root,q,[hub,mid,gate.local],key==='highmere'?3.8:2.9,key==='highmere'?'cobble':'earth');miniatureGateway71(root,q,gate,key);}
 const old=miniLocal71(q,...q.legacyGate71);miniatureLane71(root,q,[old,{x:old.x*.55,z:old.z*.55},hub],3.1,key==='highmere'?'cobble':'earth');
 const count=p.kind==='town'?miniatureHomes71(root,q,key):miniatureAdventure71(root,q,key,p);miniatureWoodland71(root,q,seeded(71009+Object.keys(POIS).indexOf(key)*839));
 for(const[x,z,s,k]of[[-q.w*.43,-q.d*.38,.7,3],[q.w*.43,q.d*.38,.75,6],[-q.w*.45,q.d*.37,.55,0]])if(!q.gates71.some(g=>Math.hypot(g.local.x-x,g.local.z-z)<4.5))miniatureRocks71(root,q,x,z,s,k);
 root.updateMatrixWorld(true);mergeGroup(root);world.userData.miniatures??=[];world.userData.miniatures.push({key,buildings:count,uniquePlan:true,boxedCourt:false,entrance:[...q.gate],entrances:q.gates71.map(g=>({id:g.id,side:g.side,x:g.x,z:g.z})),archetype:dioramas67.archetypes[key]??p.kind});return root;
}
worldTownModel=buildMiniature71;worldSiteModel45=buildMiniature71;
nearbyWorldEntrance=function(){if(!player||activeScene?.kind!=='overworld')return null;return interactables.filter(o=>o.type==='location'&&interactionAvailable(o)&&dist(player,o)<(o.worldGate71?3.7:o.diorama67?5.5:12)).sort((a,b)=>dist(player,a)-dist(player,b))[0]??null;};
const miniatureEnterBefore71=enterPoi;
enterPoi=function(key,id=null){const gate=poiEntry.confirming;if(gate?.worldGate71&&gate.poi===key)id=gate.entranceId64;return miniatureEnterBefore71(key,id);};
const directionalWorldBefore71=worldSpawn64;
worldSpawn64=function(key,gate){const site=dioramas67.sites.get(key),entry=site?.gates71?.find(g=>g.id===gate.id);if(!entry)return directionalWorldBefore71(key,gate);const r=actorRadius(player)+.1;for(const reach of[4.8,6.3,3.9,7.5,9])for(const across of[0,-1,1,-2,2]){const p={x:entry.x+entry.dir[0]*reach-entry.dir[1]*across,z:entry.z+entry.dir[1]*reach+entry.dir[0]*across};if(staticFree(p.x,p.z,r)&&!waterGround(p.x,p.z)&&edgeFree(p,entry,r))return p;}travelWarning64(key,'Gateway '+gate.id+' has no dry outward lane.');return directionalWorldBefore71(key,gate);};
