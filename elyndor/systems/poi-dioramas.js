// Authored miniature courts, not scattered full-sized houses. Each destination
// has one dry foundation, a legible front gate and a road up to that gate.
const dioramas67={sites:new Map(),ready:false,keys:Object.keys(POIS),archetypes:{brookstead:'riverside village',fern:'woodland hamlet',highmere:'royal citadel',alder:'market town',relief:'canvas aid camp',harbor:'stone harbor'}};
const courtBlockBefore67=block16;
block16=function(parent,x,y,z,w,h,d,map='wall',...rest){const o=courtBlockBefore67(parent,x,y,z,w,h,d,map,...rest);let root=parent;while(root&&!root.userData.diorama67)root=root.parent;if(root&&!['window','door','innSign','shopSign','forgeSign','lightFacets'].includes(map))o.geometry=geo16('court-uv67-'+map+'-'+w+'-'+h+'-'+d,()=>{const g=new THREE.BoxGeometry(1,1,1),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,density=['wall','rock','cobble'].includes(map)?.085:map==='slate'?.13:.18;for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));uv.setXY(i,(nx>=ny&&nx>=nz?p.getZ(i)*d:p.getX(i)*w)*density,(ny>=nx&&ny>=nz?p.getZ(i)*d:p.getY(i)*h)*density);}return g});return o;};
function rebuildRoadIndex67(){MACRO_SEGMENTS15.splice(0,MACRO_SEGMENTS15.length,...MACRO_ROADS15.flatMap(r=>r.p.slice(1).map((b,i)=>({a:r.p[i],b,ya:macroGround(...r.p[i]),yb:macroGround(...b)}))));MACRO_ROAD_GRID15.clear();for(const s of MACRO_SEGMENTS15)for(let x=Math.floor((Math.min(s.a[0],s.b[0])-12)/32);x<=Math.floor((Math.max(s.a[0],s.b[0])+12)/32);x++)for(let z=Math.floor((Math.min(s.a[1],s.b[1])-12)/32);z<=Math.floor((Math.max(s.a[1],s.b[1])+12)/32);z++){const k=x+','+z;if(!MACRO_ROAD_GRID15.has(k))MACRO_ROAD_GRID15.set(k,[]);MACRO_ROAD_GRID15.get(k).push(s);}roadNavGraph=null;}
function prepareDioramas67(){
 if(dioramas67.ready)return;prepareMacroGrid15();
 for(const[key,p]of Object.entries(POIS)){
  const town=p.kind==='town',w=key==='highmere'?35:town?29:19,d=key==='highmere'?29:town?23:17,candidates=[];
  for(let r=0;r<=72;r+=6)for(let i=0;i<(r?20:1);i++){
   const x=p.node[0]+Math.sin(i*TAU/20)*r,z=p.node[1]+Math.cos(i*TAU/20)*r,road=macroRoadInfo15(x,z);if(!road.segment||traversalWet(x,z)||road.d<Math.min(w,d)/2+2)continue;
   const q=[mix(road.segment.a[0],road.segment.b[0],road.t),mix(road.segment.a[1],road.segment.b[1],road.t)],a=Math.round(Math.atan2(q[0]-x,q[1]-z)/(Math.PI/2))*Math.PI/2,c=Math.cos(a),s=Math.sin(a),ys=[];let clear=true;
   for(let ix=0;ix<=6&&clear;ix++)for(let iz=0;iz<=5;iz++){const xx=x+(ix/6-.5)*w*c+(iz/5-.5)*d*s,zz=z-(ix/6-.5)*w*s+(iz/5-.5)*d*c;if(traversalWet(xx,zz)||macroRoadInfo15(xx,zz).d<2.5){clear=false;break;}ys.push(macroGround(xx,zz));}
   if(!clear)continue;const gate=[x+s*(d/2+3.2),z+c*(d/2+3.2)],nearest=macroRoadInfo15(...gate);if(!nearest.segment)continue;const join=[mix(nearest.segment.a[0],nearest.segment.b[0],nearest.t),mix(nearest.segment.a[1],nearest.segment.b[1],nearest.t)];
   const steps=Math.ceil(Math.hypot(join[0]-gate[0],join[1]-gate[1]));for(let j=0;j<=steps;j++)if(traversalWet(mix(gate[0],join[0],j/(steps||1)),mix(gate[1],join[1],j/(steps||1)))){clear=false;break;}if(!clear)continue;
   if([...dioramas67.sites.values()].some(q=>Math.hypot(x-q.x,z-q.z)<Math.hypot(w,d)/2+Math.hypot(q.w,q.d)/2+3))continue;
   const range=Math.max(...ys)-Math.min(...ys);candidates.push({key,x,z,w,d,a,floor:Math.max(...ys)+.15,depth:Math.max(.7,range+.4),gate,join,score:r*.20+range*3+nearest.d*.25});
  }
  candidates.sort((a,b)=>a.score-b.score);const site=candidates[0];if(!site)throw Error('No dry miniature court for '+key);dioramas67.sites.set(key,site);
 }
 for(const site of dioramas67.sites.values())MACRO_ROADS15.push({kind:'trail',jrpgBranch46:true,diorama67:site.key,p:[site.join,site.gate]});rebuildRoadIndex67();dioramas67.ready=true;
}
function miniatureTree67(root,x,z,pine=false,scale=1){
 const trunk=piece16(root,geo16('mini-tree67',()=>new THREE.CylinderGeometry(.09,.17,2.6,7)),'bark','#aa987b',x,1.3*scale,z,scale,scale,scale);
 const key='mini-leaf67-'+pine;let m=matCache.get(key);if(!m){m=new THREE.MeshStandardMaterial({map:pine?textures.leafPine30:textures.leafOak30,alphaTest:.36,side:THREE.DoubleSide,color:'#bdd1a3',roughness:.9});addCloudLighting(m);matCache.set(key,m);}
 for(let i=0;i<4;i++){const a=i*2.399963,r=pine?.10:.55,leaf=new THREE.Mesh(branchSpray66(16),m);leaf.position.set(x+Math.cos(a)*r*scale,(2.1+i*.34)*scale,z+Math.sin(a)*r*scale);leaf.scale.setScalar((pine?1.05-i*.16:.87)*scale);leaf.rotation.y=a;leaf.castShadow=leaf.receiveShadow=true;root.add(leaf);}
}
function keepDiorama67(root){
 block16(root,0,4.2,-3,17,8.4,10,'plaster','#d8d7c5');roof16(root,0,8.4,-3,18,4.8,11.5,'#718fae');
 for(const side of[-1,1]){const face=piece16(root,geo16('royal-gable67',()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-9,0,0,9,0,0,0,4.8,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));g.computeVertexNormals();return g}),'plaster','#dbdac8',0,8.4,-3+side*5.55);if(side<0)face.rotation.y=Math.PI;}
 for(const x of[-9,9])for(const z of[-8,2])miniatureTurret66(root,x,.1,z,1.1,z<0?13.7:11.7,false,'#6b88ad');miniatureTurret66(root,0,5,-5,1.1,12.4,false,'#6e8db1');
 for(const x of[-5.5,-2.5,2.5,5.5]){block16(root,x,5.2,2.08,.8,2.8,.1,'window','#c7dde0');block16(root,x,2,2.2,.25,4,.5,'wall','#c0c4b5');}block16(root,0,2.05,2.12,2.2,4.1,.1,'door','#a18f70');
 const arch=geo16('royal-portal67',()=>{const s=new THREE.Shape();s.moveTo(-1.7,0);s.lineTo(-1.7,3.1);s.quadraticCurveTo(-1.4,4.4,0,5.2);s.quadraticCurveTo(1.4,4.4,1.7,3.1);s.lineTo(1.7,0);s.closePath();const h=new THREE.Path();h.moveTo(-1.1,0);h.lineTo(1.1,0);h.lineTo(1.1,3);h.quadraticCurveTo(.9,3.9,0,4.5);h.quadraticCurveTo(-.9,3.9,-1.1,3);h.closePath();s.holes.push(h);return new THREE.ExtrudeGeometry(s,{depth:.28,bevelEnabled:false,curveSegments:10});});piece16(root,arch,'wall','#c3c9b9',0,.02,2.2);
 for(const side of[-1,1]){block16(root,side*6.5,5.3,2.26,1.0,2.4,.08,'cloth','#3b6086');block16(root,side*6.5,6.57,2.3,1.3,.10,.18,'metal','#c3ad76');}
 for(const side of[-1,1])house16(root,{x:side*10.7,z:8.1,y:0,w:5,d:4.3,h:4,a:side>0?-Math.PI/2:Math.PI/2},'highmere',side+1);
}
function buildTownCourt67(root,key,site){
 if(key==='highmere'){keepDiorama67(root);return 3;}
 const presets={brookstead:[[-6,-5,8,6,5.8],[7,-5,5.4,4.7,4.5],[-8,5,5.2,4.6,4.3],[7.4,4.4,5.4,4.7,4.2]],fern:[[-4,-5,9,5.8,4.5],[7,-3,5,4.4,3.6],[-7.5,4,5.8,4.5,3.9]],alder:[[-6,-5,7,5,5.6],[6,-5,6,4.6,4.9],[-8,4.5,5,4,4.2],[7,5,5,4,4.3]],harbor:[[-6,-5,8,5.7,5.3],[6,-5,6.2,5,4.3],[-7,4.3,6.5,4.7,4.3],[7,4.2,5.7,4.7,4.5]],relief:[[-6,-4.5,7,5.5,3.4],[6,-4.5,6.5,5.5,3.2],[-7,4.4,5.5,4.7,2.8],[7,4.4,5.5,4.7,2.8]]};
 for(const[q,i]of presets[key].map((q,i)=>[q,i])){const[x,z,w,d,h]=q;if(key==='relief'){const g=new THREE.Group();g.position.set(x,0,z);root.add(g);roof16(g,0,1.7,0,w,2.3,d,'#d3c8a9');for(const side of[-1,1])block16(g,side*w*.47,.85,0,.14,1.7,d,'cloth','#c7bda3');for(const side of[-1,1])block16(g,side*w*.47,1.5,d*.5,.10,3,.10,'wood','#a08b66');}else house16(root,{x,z,y:0,w,d,h,a:0},key,i);}
 if(key==='brookstead'){roof16(root,-6,2.5,-1.25,7,1.15,2,'#738b9c');for(const x of[-8.7,-3.3])block16(root,x,1.2,-.4,.16,2.4,.16,'wood','#a18a62');block16(root,-2.7,3.5,-1.8,1,.7,.08,'innSign','#d2b98a');}
 if(key==='alder'){for(const x of[-3.3,3.3]){block16(root,x,.6,4,1.8,1.2,1,'crateFace','#baa181');const awning=block16(root,x,2.4,4,2.8,.12,2.2,'cloth',x<0?'#8c9c78':'#a08a6b');awning.rotation.x=.1;}}
 if(key==='harbor'){for(const x of[-3,3])block16(root,x,.4,6,1,.8,1,'crateFace','#ac9271');}
 return presets[key].length;
}
function buildSiteCourt67(root,key,p){
 if(p.kind==='clearing'){
  piece16(root,geo16('site67-plinth',()=>new THREE.CylinderGeometry(2.5,2.8,.55,12)),'wall','#c5cab9',0,.3,-2);piece16(root,geo16('site67-light',()=>new THREE.OctahedronGeometry(1,0)),'lightFacets','#8fcfd7',0,2.65,-2,.85,2.05,.85);
  for(const side of[-1,1]){block16(root,side*5,2.1,-4,.75,4.2,.75,'wall','#b6c2b4');block16(root,side*5,4.35,-4,1.05,.3,1.05,'metal','#baa674');}miniatureTree67(root,-6,-5.7,key!=='fernClearing',.65);
 }else if(p.kind==='trail'){
  for(const x of[-2.8,2.8])for(const z of[-4.5,.5])block16(root,x,2.6,z,.45,5.2,.45,'wood','#998566');roof16(root,0,5.2,-2,7.1,2.6,6.8,key==='snow'?'#9eb3bc':'#708b82');block16(root,0,1.4,-4.6,5.3,2.8,.5,'wall','#b5bfae');miniatureTree67(root,-6,-4.5,true,.8);
 }else{
  for(const side of[-1,1]){block16(root,side*3.2,2.7,-2,1.6,5.4,2.2,'wall','#bbc2ae');block16(root,side*3.2,5.5,-2,2,.35,2.6,'wall','#c5cbb9');block16(root,side*6.2,.9,-5,1.1,1.8,4,'wall','#a8b59f');}block16(root,0,5.7,-2,7.7,.7,2.4,'wall','#bec6b3');block16(root,0,2,-2.5,3.9,4,.15,'darkWood','#40554c');for(let i=0;i<5;i++)block16(root,-6+i*.6,.22,1.5+(i%2)*.7,.6,.44,.7,'rock','#aab6a0');
 }
 return 1;
}
function buildDiorama67(key,p){
 const q=dioramas67.sites.get(key),g=new THREE.Group(),c=Math.cos(q.a),s=Math.sin(q.a),ww=Math.abs(c)*q.w+Math.abs(s)*q.d,dd=Math.abs(c)*q.d+Math.abs(s)*q.w;g.position.set(q.x,q.floor,q.z);g.rotation.y=q.a;g.name=p.name+' miniature court';g.userData={miniatureIdentity66:key,poiLandmark45:key,diorama67:true,persistentLandmark16:true,siteFootprints45:[{x:q.x,z:q.z,w:ww,d:dd,floor:q.floor}]};world.add(g);world.userData.buildings.push(g);world.userData.landmarks45??={};world.userData.landmarks45[key]=g;
 block16(g,0,-q.depth/2,0,q.w,q.depth,q.d,'wall','#b5bba5');block16(g,0,.045,0,q.w-.35,.09,q.d-.35,'grass','#aec28c');block16(g,0,.11,1,3.3,.08,q.d-1,'cobble','#d3c4a4');
 const town=p.kind==='town',timber=['fern','relief'].includes(key),wallColor=key==='highmere'?'#c3c6b4':timber?'#9b8765':'#aaa98e',wallMap=timber?'wood':'wall',wallH=timber?.7:1.3;for(const side of[-1,1]){block16(g,side*(q.w/2-.25),wallH/2,0,.5,wallH,q.d,wallMap,wallColor);block16(g,side*(q.w+6)/4,wallH/2,q.d/2-.25,(q.w-6)/2,wallH,.5,wallMap,wallColor);}block16(g,0,wallH/2,-q.d/2+.25,q.w,wallH,.5,wallMap,wallColor);
 // The gateway stands on the approach road, independently of the raised
 // courtyard. Its two footings meet their own terrain samples; the stairs
 // have solid risers extending below the ground instead of hovering boxes.
 const ground=(x,z)=>heightAt(q.x+x*c+z*s,q.z-x*s+z*c)-q.floor,gateZ=q.d/2+3.2,gateGround=ground(0,gateZ),bases=[ground(-3.4,gateZ),ground(3.4,gateZ)],gateTop=Math.max(Math.max(gateGround,...bases)+4.3,3.55);
 for(const[i,side]of[-1,1].entries()){const bottom=bases[i]-.08,h=gateTop-bottom;block16(g,side*3.4,bottom+h/2,gateZ,.65,h,.65,'wall','#c2c6b3');block16(g,side*3.4,gateTop+.15,gateZ,1.0,.3,1.0,'metal','#b6a472');}
 if(town&&key!=='relief')roof16(g,0,gateTop+.15,gateZ,8.4,1.7,1.8,key==='fern'?'#7f9683':'#738aa4');else block16(g,0,gateTop+.1,gateZ,7.6,.2,.35,wallMap,wallColor);
 const steps=Math.max(3,Math.ceil(Math.abs(.15-gateGround)/.28)),run=3.2/steps;q.grounding67={gateGround:gateGround+q.floor,footings:bases.map(y=>y+q.floor),stepCount:steps,top:q.floor+.15,firstTread:gateGround+q.floor+.08,largestRise:Math.abs(.15-gateGround)/steps};
 const treads=[];for(let i=0;i<steps;i++){const z=q.d/2+(i+.5)*run,top=mix(.15,gateGround+.08,(i+1)/steps),bottom=Math.min(ground(-2.5,z-run/2),ground(2.5,z-run/2),ground(-2.5,z+run/2),ground(2.5,z+run/2),top)-.2;block16(g,0,(top+bottom)/2,z,5.6,top-bottom,run+.02,'wall','#c6c3ad');treads.push({z,depth:run,y:q.floor+top});}
 const threshold=geo16('diorama-threshold67-'+key,()=>{const v=new THREE.PlaneGeometry(6.2,1.4,8,2);v.rotateX(-Math.PI/2);const a=v.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,ground(a.getX(i),gateZ+a.getZ(i))+.055);v.translate(0,0,gateZ);v.computeVertexNormals();return v;});piece16(g,threshold,'cobble','#c6c3ad',0,0,0);
 const count=town?buildTownCourt67(g,key,q):buildSiteCourt67(g,key,p);if(town){for(const side of[-1,1])miniatureTree67(g,side*(q.w/2-2),-q.d/2+2,key==='fern',.85);}
 const profile={site:q,treads,c,s};(world.userData.dioramaWalk67??=[]).push(profile);const grid=world.userData.dioramaHeightGrid67??=new Map(),cx=q.x+s*(q.d/2+1.6),cz=q.z+c*(q.d/2+1.6),hx=(Math.abs(c)*8+Math.abs(s)*5)/2,hz=(Math.abs(c)*5+Math.abs(s)*8)/2;for(let ix=Math.floor((cx-hx)/16);ix<=Math.floor((cx+hx)/16);ix++)for(let iz=Math.floor((cz-hz)/16);iz<=Math.floor((cz+hz)/16);iz++){const k=(ix+128)*256+iz+128;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(profile);}mergeGroup(g);
 obstacle(q.x,q.z,ww,dd,'miniature diorama');createInteraction('location',q.gate[0],q.gate[1],'Enter '+p.name);Object.assign(interactables.at(-1),{poi:key,radius:5.5,visualHeight:.2,diorama67:true});
 world.userData.miniatures??=[];world.userData.miniatures.push({key,buildings:count,uniquePlan:true,boxedCourt:true,entrance:[...q.gate],archetype:dioramas67.archetypes[key]??p.kind});return g;
}
worldTownModel=buildDiorama67;worldSiteModel45=buildDiorama67;
const dioramaHeightBefore67=heightAt;
heightAt=function(x,z,...args){let h=dioramaHeightBefore67(x,z,...args);if(activeScene?.kind!=='overworld'||sceneBuildFilter||perf.building)return h;const profiles=world?.userData.dioramaHeightGrid67?.get((Math.floor(x/16)+128)*256+Math.floor(z/16)+128);if(!profiles)return h;for(const {site:q,treads,c,s}of profiles){const dx=x-q.x,dz=z-q.z,lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>2.8||lz<q.d/2||lz>=q.d/2+3.18)continue;const i=clamp(Math.floor((lz-q.d/2)/3.2*treads.length),0,treads.length-1);h=Math.max(h,treads[i].y+.012);}return h;};
const dioramaOverworldBefore67=buildJourneyOverworld;
buildJourneyOverworld=function(...args){prepareDioramas67();return dioramaOverworldBefore67(...args)};
const dioramaTreesBefore67=buildSolidTree;
buildSolidTree=function(x,z,...args){if(activeScene?.kind==='overworld')for(const q of dioramas67.sites.values()){const dx=x-q.x,dz=z-q.z,c=Math.cos(q.a),s=Math.sin(q.a);if(Math.abs(dx*c-dz*s)<q.w/2+3&&Math.abs(dx*s+dz*c)<q.d/2+3)return null;}return dioramaTreesBefore67(x,z,...args)};
worldEntrancePoint45=function(key){const q=dioramas67.sites.get(key);return q?{x:q.gate[0],z:q.gate[1]}:{x:POIS[key].node[0],z:POIS[key].node[1]};};
nearbyWorldEntrance=function(){if(!player||activeScene?.kind!=='overworld')return null;return interactables.filter(o=>o.type==='location'&&interactionAvailable(o)&&dist(player,o)<(o.diorama67?5.5:12)).sort((a,b)=>dist(player,a)-dist(player,b))[0]??null;};
const dioramaCameraBefore67=updateCamera;
updateCamera=function(dt=1/60,instant=false){const r=dioramaCameraBefore67(dt,instant);if(!compactWorld44()||!player)return r;const offset=V3(28,100,108).multiplyScalar(state.settings.zoom??1);camera.position.copy(cameraTarget).add(offset);camera.fov=34;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);faceNativeHumanoids66();sideCameraStats.angle=Math.atan2(offset.y,Math.hypot(offset.x,offset.z))*180/Math.PI;return r;};
returnToOverworld=function(){const p=POIS[activeScene.key]??POIS[state.interiorReturn?.poi],q=p&&dioramas67.sites.get(Object.keys(POIS).find(k=>POIS[k]===p));if(q)return changeJourneyScene('overworld',[q.gate[0]+Math.sin(q.a)*4,q.gate[1]+Math.cos(q.a)*4]);return changeJourneyScene('overworld',state.overworldPosition??POIS.brookstead.node);};
