// Latest RE037 review approves the lens. Only the physical foreground is
// dressed here; the panorama, camera, combat footprints and lighting stay put.
const FOREGROUND133={
 waterfall:{pods:[[-19,5,'ferns',1.6],[19,9,'ferns',1.3],[-6,15,'wetBank',.65],[7,19,'ferns',.8]],cover:1.1},
 woodland:{pods:[[-19,7,'gnarledRoot',1.3],[18,12,'mushrooms',1],[-6,17,'ferns',1.1],[7,20,'leafLitter',1.5]],cover:.85},
 orchard:{pods:[[-18,6,'appleCrates',.8],[19,13,'flowers',1.2],[-7,18,'softTufts',1.4],[6,21,'daisies',1]],cover:.72},
 ruins:{pods:[[-19,8,'masonry',1.2],[19,11,'fallenDrum',.6],[-6,18,'splitSlab',.5],[8,22,'masonry',.8]],cover:0},
 cavern:{pods:[[-18,7,'slate',.8],[20,12,'quartz',.35],[-7,18,'stalagmites',.35],[7,21,'slate',.5]],cover:0},
 mountain:{pods:[[-19,7,'talus',1.2],[18,12,'alpineTufts',1.4],[-6,17,'hillScree',.75],[7,21,'alpineTufts',1]],cover:.35},
 snow:{pods:[[-19,7,'snowLedge',.65],[19,12,'iceRim',.55],[-7,18,'frozenLog',.45],[7,22,'snowLedge',.4]],cover:0},
 coast:{pods:[[-19,7,'driftwood',.6],[19,12,'saltTufts',1.6],[-7,18,'shorePebbles',.8],[8,21,'saltTufts',1.2]],cover:.38},
 royalRoad:{pods:[[-20,8,'formalPlanter',.7],[20,12,'avenuePier',1.1],[-7,19,'pavedSteps',.65],[8,22,'masonry',.6]],cover:0},
 moonlit:{pods:[[-19,7,'mushrooms',1.4],[19,12,'gnarledRoot',.8],[-6,18,'ferns',1.2],[7,22,'mushrooms',.8]],cover:.82},
 grassMeadow:{pods:[[-19,7,'daisies',1.8],[19,12,'softTufts',1.8],[-7,18,'daisies',1.2],[7,22,'daisies',1.4]],cover:1.25},
 grassRiver:{pods:[[-19,7,'reeds',1],[19,12,'washedSlab',.65],[-7,18,'reeds',.7],[7,22,'softTufts',1.5]],cover:.95},
 grassFlowers:{pods:[[-19,7,'flowers',2],[19,12,'ferns',1.3],[-7,18,'flowers',1.5],[7,22,'flowers',1.6]],cover:1.2},
 grassDowns:{pods:[[-19,7,'heather',1.6],[19,12,'chalkSeam',.7],[-7,18,'heather',1.2],[7,22,'saltTufts',1.1]],cover:.75},
 grassWindmill:{pods:[[-19,7,'wheat',1.4],[19,12,'cartWheel',.65],[-7,18,'wheat',.9],[7,22,'softTufts',1.3]],cover:.7},
 grassAutumn:{pods:[[-19,7,'autumnLog',.7],[19,12,'leafLitter',2],[-7,18,'leafLitter',1.7],[7,22,'ferns',.8]],cover:.85},
 grassStones:{pods:[[-19,7,'splitSlab',.7],[19,12,'heather',1.8],[-7,18,'heather',1.1],[7,22,'stoneRing',.7]],cover:.9},
 grassHills:{pods:[[-19,7,'hillScree',1.1],[19,12,'alpineTufts',1.4],[-7,18,'slateRidge',.6],[7,22,'alpineTufts',1.2]],cover:.62},
 grassBirch:{pods:[[-19,7,'birchLogs',.65],[19,12,'bluebells',1.7],[-7,18,'bluebells',1.1],[7,22,'rootMoss',.7]],cover:1.1},
 grassTwilight:{pods:[[-19,7,'seedheads',1.2],[19,12,'violetTufts',1.6],[-7,18,'seedheads',.8],[7,22,'violetTufts',1.3]],cover:.9}
};
function polishForeground133(b){
 const stage=encounter53.selected,plan=FOREGROUND133[stage],habitat=HABITATS126[stage],rng=seeded(133037+Object.keys(FOREGROUND133).indexOf(stage)*107),stats={stage,grass:0,plants:0,pods:[],clearStances:true};
 b.queries126={stances:fighterStances105(b),lines:fighterSightlines105(b)};b.authoring101=true;
 for(const [index,[kindX,depth,kind,baseSize]]of plan.pods.entries()){
  // Low off-centre islands sit in the visible foreground, not on the image
  // seam. Sightline/stance tests also cover the two mobile orientations.
  const point=bankPoint93(b,kindX<0?(index<2?.045:.28):(index<2?.955:.79),index<2?.84:1.06);if(!point)continue;
  const {x,z}=point,size=baseSize*.62,radius=Math.min(1.4,size*1.1),height=/Log|Root|Crates|Drum|Wheel|Pier/.test(kind)?size*1.6:Math.min(size,.8);
  if(!marginFree126(b,x,z,radius,height))continue;
  dressPiece125(b,kind,V3(x,arenaFloor88(b,x,z),z),size);stats.pods.push({kind,x,z,size});
 }
 const g=arenaGeometry88(b,'rooted-foreground133',()=>{const g=curvedGrass102(b.mobile).clone();g.translate(0,.465,0);return g;}),m=arenaCoverMaterial102(b,'grassBlades');
 // Interlocking turf masses leave a worn central trail and small irregular
 // bare patches. The actual actor rectangles remain completely clear.
 if(plan.cover)for(let i=0,n=Math.round((b.mobile?1000:2200)*plan.cover);i<n;i++){
  const point=bankPoint93(b,.015+rng()*.97,.53+rng()*.56);if(!point)continue;
  const {x,z}=point,field=Math.sin(x*.83+stage.length)*Math.cos(z*.79)+Math.sin(x*1.91+z*.53)*.40;
  const trail=Math.exp(-Math.pow((x+Math.sin(z*.15)*2.5)/3.5,2));
  if(field<-.18||rng()<trail*.78||!marginFree126(b,x,z,.20,.55))continue;
  const s=.48+rng()*.37,h=s*(.60+rng()*.28);
  arenaGrassInstanceBefore102(b,'foreground133-living-turf',g,m,V3(x,arenaFloor88(b,x,z)-.02,z),V3(s,h,s),new THREE.Quaternion().setFromAxisAngle(axis24,rng()*TAU));stats.grass++;
  if(i%37===0&&habitat.plants){const kind=habitat.plants==='fern'?'fern':rng()<habitat.flowers*3?'flowers':null;if(kind){botanical92(b,x,z,kind,.30+rng()*.18);stats.plants++;}}
 }
 b.authoring101=false;flushReference101(b);flushBefore89(b);b.batches.clear();
 // Newly batched plants inherit the same stage-specific pigment treatment as
 // existing plants, rather than reintroducing the generic lime green material.
 const seen=new Set(),palette=SURFACE_PALETTES132[stage];b.group.traverse(o=>{for(const mat of Array.isArray(o.material)?o.material:[o.material])if(mat&&!seen.has(mat)){
  seen.add(mat);materialFinish103(mat);bindStageAir97(mat,b);
  if(palette.grass&&mat.userData.realVegetation103&&mat.userData.realVegetation103!=='flowers'&&!mat.userData.backgroundChroma132)matchProp132(mat,palette.grass,.45);
 }});
 b.stoneClearance105=null;clearFighterStones105(b);b.group.updateMatrixWorld(true);b.foreground133=stats;if(stageDepth59.summary)stageDepth59.summary.foreground133=stats;
}
const foregroundBefore133=buildStageScenery59;
buildStageScenery59=function(...args){const r=foregroundBefore133(...args),b=arena88.current;if(b?.surface132&&!b.foreground133)polishForeground133(b);return r;};

// RE017: recognizable village architecture, using the full-size POI roof and
// material vocabulary inside the existing individually seated building lots.
const smallHouseBefore133=house16;
house16=function(parent,spec,key,index,atlas=false){
 const g=smallHouseBefore133(parent,spec,key,index,atlas);let root=parent;while(root&&!root.userData.naturalMiniature71)root=root.parent;if(!root)return g;
 const {w,d,h}=spec;
 // Replace the old floating slope pair and single-sided attic panels, retaining
 // walls, glazing, doors, orientations, floor heights and every actual gate.
 for(const o of [...g.children])if(o.isGroup||o.geometry?.attributes.position?.count===3||Math.abs(o.position.y-(h+w*.12))<.001||Math.abs(o.rotation.z)>.1)o.removeFromParent();
 const timber='#846a4b',face=d/2+.18;
 const main=roof121(g,0,0,w+.65,d+.75,h+.08,w*.31);main.name='POI-style closed miniature roof';
 const purpose=key==='brookstead'?['inn','forge','mill','home'][index%4]:key==='alder'?['lodge','shop','orchard','home'][index%4]:key==='fern'?['lodge','home','shrine'][index%3]:key==='harbor'?['warehouse','shop','home','fishery'][index%4]:'home';
 if(['inn','lodge'].includes(purpose))roof121(g,-w*.13,d*.20,w*.43,d*.68,h+.04,w*.24);
 for(const side of[-1,1]){
  const z=side*face;
  for(const hand of[-1,1])beam(V3(hand*w*.46,h*.56,z),V3(hand*w*.25,h-.05,z),.065,'darkWood',timber,g);
 }
 if(key==='brookstead'&&purpose==='inn'){
  porch121(g,0,face,w*.90,1.4,2.13,false);block16(g,-w*.28,3.05,face+.23,1.15,.65,.18,'wood','#a58b5c');
 }else if(purpose==='forge'){
  const xx=-w*.30;block16(g,xx,1.25,face+.28,1.35,.65,.75,'wall','#8f9788');
  block16(g,xx,1.61,face+.28,.88,.08,.51,'darkWood','#543e2a');
  const hood=piece16(g,new THREE.CylinderGeometry(.26,.65,.75,4),'wall','#9da18d',xx,2.40,face+.12);hood.rotation.y=Math.PI/4;
  block16(g,xx,3.14,face-.22,.46,1.55,.47,'wall','#a5aa96');
 }else if(['shop','warehouse','fishery'].includes(purpose)){
  porch121(g,0,face,w*.85,1.15,2.15,purpose==='shop');
  for(const hand of[-1,1])crate121(g,hand*w*.33,.18,face+.55,.48);
 }
 // The mill's joined capstan and rope spool identify the river workshop even
 // at traversal scale. A water wheel is used only beside actual river water.
 if(purpose==='mill'){
  const xx=-w*.34;block16(g,xx,.9,face+.42,.15,1.8,.18,'wood',timber);
  const spindle=piece16(g,new THREE.CylinderGeometry(.21,.21,.8,10),'wood','#a89770',xx,1.2,face+.42);spindle.rotation.z=Math.PI/2;
  for(let i=0;i<5;i++){const rope=piece16(g,new THREE.TorusGeometry(.225,.023,4,12),'cloth','#b7aa88',xx-.24+i*.12,1.2,face+.42);rope.rotation.y=Math.PI/2;}
 }
 g.userData.identity133=purpose;root.userData.identities133??=[];root.userData.identities133.push(purpose);return g;
};

// Irregular habitat islands and flowering verges. Use the existing connected
// tree renderer and spatially culled plant batches; no extra collision walls.
const habitatPlantsBefore133=buildPlants;
const fieldHabitatBefore133=habitat66;
habitat66=function(x,z){const q=fieldHabitatBefore133(x,z);if(activeScene?.kind==='overworld')for(const [key,site]of dioramas67.sites){
 if(POIS[key].kind!=='town')continue;
 for(const [dx,dz,rx,rz]of[[-77,38,26,20],[65,56,25,32],[-12,-79,37,21]]){
  const d=Math.hypot((x-site.x-dx)/rx,(z-site.z-dz)/rz),edge=1-smooth(.66,1.12,d);
  if(edge>0&&q.road>6&&q.bank>4&&q.destination>4&&q.h<31)q.density=Math.max(q.density,edge*.88);
 }
}return q;};
buildPlants=function(...args){
 if(activeScene?.kind==='overworld'&&!world.userData.habitat133){
  const rng=seeded(133017),stats={trees:0,grassPatches:0,flowers:0,collisionsAdded:0},occupied=new Set();
  for(const t of world.userData.solidTrees??[])occupied.add(Math.round(t.x/3)+','+Math.round(t.z/3));
  const oldObstacleCount=colliders.length;
  for(const [key,q]of dioramas67.sites)for(let i=0;i<200;i++){
   const a=rng()*TAU,r=24+Math.sqrt(rng())*100,x=q.x+Math.cos(a)*r,z=q.z+Math.sin(a)*r*.8,id=Math.round(x/3)+','+Math.round(z/3),hab=habitat66(x,z);
   if(occupied.has(id)||hab.destination<8||hab.road<7||hab.bank<5||hab.h>31||traversalWet(x,z))continue;
   // Scalloped edges, separate copses and open views across the river valley.
   if(Math.sin(x*.061+key.length)+Math.cos(z*.047)<-.25)continue;
   const t=buildSolidTree(x,z,.77+rng()*.62,key==='snow'||key==='fern'||rng()<.44?'pine':'oak',rng);
   if(t){occupied.add(id);stats.trees++;}
  }
  // The overworld is intentionally walk-through woodland. Do not restore the
  // tree collision records of the underlying generic scenery constructor.
  for(let i=colliders.length-1;i>=oldObstacleCount;i--)if(colliders[i].type==='tree')colliders.splice(i,1);
  stats.collisionsAdded=colliders.length-oldObstacleCount;
  for(const t of (world.userData.solidTrees??[]).filter((t,i)=>i%3===0)){
   if(t.y>30)continue;
   for(let j=0;j<6;j++){
    const a=rng()*TAU,r=1.2+rng()*4,x=t.x+Math.cos(a)*r,z=t.z+Math.sin(a)*r,hab=habitat66(x,z);
    if(hab.road<3.8||hab.bank<2.7||hab.destination<0||traversalWet(x,z))continue;
    const flower=j===0&&rng()<.55,type=flower?'flower':'grassBlades';plant(x,z,flower?.39:.85+rng()*.48,type,macroGround(x,z));stats.grassPatches++;if(flower)stats.flowers++;
   }
  }
  world.userData.habitat133=stats;
 }
 return habitatPlantsBefore133(...args);
};
