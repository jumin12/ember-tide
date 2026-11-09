// Location-specific habitats follow the authored courts, approach roads,
// buildings and existing woodland. Routes, story anchors and water stay clear.
const PLACE_ECOLOGY104={
 brookstead:{name:'riverside cottage gardens',flora:'garden',stone:2,density:.70,mist:.74,sky:'#c4dce2'},
 fern:{name:'old forest village and fern banks',flora:'woodland',stone:0,density:1.15,mist:1.16,sky:'#b5d1ce'},
 highmere:{name:'limestone terraces and formal planting',flora:'formal',stone:2,density:.70,mist:.65,sky:'#c6dbe6'},
 alder:{name:'orchard verges and wildflower meadows',flora:'orchard',stone:2,density:1.00,mist:.80,sky:'#c7d9d4'},
 patrol:{name:'woodland track and mossy talus',flora:'woodland',stone:0,density:1.15,mist:1.12,sky:'#b8cfce'},
 depths:{name:'damp limestone ruins and shade plants',flora:'ruin',stone:3,density:.65,mist:1.30,sky:'#a7c5ca'},
 alderRemnant:{name:'overgrown fallen masonry and woodland',flora:'ruin',stone:0,density:.95,mist:1.06,sky:'#b6cdd0'},
 nearbySite:{name:'exposed relay terraces and alpine scrub',flora:'alpine',stone:1,density:.65,mist:.95,sky:'#c2d4dc'},
 relief:{name:'camp verges and worn woodland shoulders',flora:'woodland',stone:1,density:.78,mist:.86,sky:'#c1d3d2'},
 snow:{name:'wind-scoured northern pass',flora:'snow',stone:3,density:.40,mist:1.12,sky:'#b7cede'},
 harbor:{name:'coastal stone banks and salt-tolerant scrub',flora:'coast',stone:2,density:.60,mist:1.20,sky:'#b6d2df'},
 fernClearing:{name:'ancient forest sanctuary',flora:'woodland',stone:0,density:1.15,mist:1.20,sky:'#b1cfc8'},
 alderClearing:{name:'meadow sanctuary and pale limestone',flora:'orchard',stone:2,density:1.00,mist:.94,sky:'#c0d8ce'},
 reliefClearing:{name:'sheltered relay grove',flora:'woodland',stone:0,density:.95,mist:1.04,sky:'#b7cfce'},
 siteClearing:{name:'rocky river sanctuary',flora:'ruin',stone:3,density:.80,mist:1.18,sky:'#abcbd2'},
 overworld:{name:'connected river valleys, woodland and downs',flora:'woodland',stone:0,density:.80,mist:1.06,sky:'#b9d0dc'}
};
function ecology104(){return PLACE_ECOLOGY104[activeScene.kind==='overworld'?'overworld':activeScene.key]??PLACE_ECOLOGY104.fern;}
function addScenicEcology104(){
 if(!['poi','overworld'].includes(activeScene.kind)||world.userData.ecology104)return;
 const profile=ecology104(),macro=activeScene.kind==='overworld',phone=matchMedia('(pointer:coarse)').matches,rng=seeded(104771+Math.round(activeScene.bounds[0]*37)),ground=terrainSampler64().sample,bins=new Map(),materials=new Map(),summary={identity:profile.name,plantings:0,stones:0,wood:0,batches:0,actorClearance:3,meshes:[]};
 const wet=(x,z)=>macro?traversalWet(x,z):waterGround(x,z),road=(x,z)=>macro?macroRoadInfo15(x,z).d:roadDistance(x,z),anchorClear=(x,z,r=3)=>![...interactables,...actors].some(o=>Math.hypot(x-o.x,z-o.z)<r);
 const free=(x,z,r=.25)=>inSceneBounds(x,z,0)&&!wet(x,z)&&road(x,z)>3.8&&staticFree(x,z,r)&&anchorClear(x,z);
 const material=(kind)=>{if(!materials.has(kind))materials.set(kind,kind==='leaf'?treeMaterial104(0):vegetationMaterial103(kind));return materials.get(kind);};
 const submit=(kind,g,m,x,y,z,sx,sy,sz,angle=0)=>{const id=kind+'|'+Math.floor(x/(macro?64:24))+','+Math.floor(z/(macro?64:24));if(!bins.has(id))bins.set(id,{kind,g,m,rows:[],center:V3(Math.floor(x/(macro?64:24))*(macro?64:24)+(macro?32:12),0,Math.floor(z/(macro?64:24))*(macro?64:24)+(macro?32:12))});bins.get(id).rows.push(new THREE.Matrix4().compose(V3(x,y,z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),angle),V3(sx,sy,sz)));};
 const plantAt=(kind,x,z,s)=>{if(!free(x,z))return;const g=kind==='leaf'?bough104(0,phone?1:0):plantSculpt103(kind,phone),y=ground(x,z)+(kind==='leaf'?-.02:.465*s)-.025;submit(kind,g,material(kind),x,y,z,s,s,s,rng()*TAU);summary.plantings++;};
 const rockAt=(x,z,s,kind)=>{if(!free(x,z,s*.4))return;const g=rockGeometry62(kind),sy=s*(.35+rng()*.34),y=ground(x,z)-g.boundingBox.min.y*sy-.055*s;submit('stone'+kind,g,rockMaterial62(profile.stone),x,y,z,s,sy,s*(.7+rng()*.6),rng()*TAU);summary.stones++;};
 const patch=(x,z,size=1)=>{
  const woods=['woodland','ruin'].includes(profile.flora),snow=profile.flora==='snow',coast=profile.flora==='coast',count=Math.round((phone?8:15)*profile.density);
  for(let j=0;j<count;j++){const a=rng()*TAU,r=Math.sqrt(rng())*2.7*size,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;if(snow){if(j%3===0)rockAt(xx,zz,.20+rng()*.36,[3,7,10,11][j%4]);continue;}
   const kind=woods?(j%5===0?'leaf':j%3===0?'flowers':'fern'):coast?(j%5===0?'leaf':'grassBlades'):j%5===0?'leaf':j%3===0?'fern':'flowers';
   if(kind==='grassBlades'){if(free(xx,zz)){const s=.38+rng()*.28;submit('coastalGrass',curvedGrass102(phone),material('grassBlades'),xx,ground(xx,zz)+.465*s-.025,zz,s,s,s,rng()*TAU);summary.plantings++;}}
   else plantAt(kind,xx,zz,(kind==='leaf'?.34:kind==='fern'?.70:.45)*( .70+rng()*.72)*size);
  }
  if(!['formal','garden','orchard'].includes(profile.flora))for(let j=0;j<4;j++){const a=rng()*TAU,r=rng()*2*size;rockAt(x+Math.cos(a)*r,z+Math.sin(a)*r,(.16+rng()*.42)*size,[0,1,3,4,6,7,9,10][j*2%8]);}
 };
 // Undergrowth is clustered around woody habitat rather than evenly stamped
 // on every square metre. Town frontages receive smaller planted groupings.
 const selected=scenery.trees.filter((t,i)=>i%(macro?11:3)===0&&(!macro||t.y<28));
 for(const t of selected){const a=rng()*TAU,r=1.2+rng()*1.8;patch(t.x+Math.cos(a)*r,t.z+Math.sin(a)*r,macro?1.15:.82+rng()*.35);}
 const layout=JRPG_LAYOUTS46[activeScene.key];if(layout&&!macro){
  for(const [cx,cz,r]of layout.courts)for(let j=0;j<13;j++){const a=j/13*TAU+.12,x=cx+Math.cos(a)*(r+2.8),z=cz+Math.sin(a)*(r+2.8);patch(x,z,.75+rng()*.24);}
  for(const line of[...layout.routes,...layout.loops??[]])for(let j=1;j<line.length;j++){const a=line[j-1],b=line[j],len=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(1,Math.floor(len/9));for(let k=0;k<steps;k++)for(const side of[-1,1]){const t=(k+.5)/steps,w=5+rng()*1.8,x=mix(a[0],b[0],t)+(b[1]-a[1])/len*w*side,z=mix(a[1],b[1],t)-(b[0]-a[0])/len*w*side;patch(x,z,.75);}}
 }
 // Brookstead retains its continuous authored street; plant beside its actual
 // houses and footpaths instead of inventing a second street plan.
 if(activeScene.key==='brookstead')for(const g of world.userData.buildings??[]){const box=new THREE.Box3().setFromObject(g);if(box.isEmpty())continue;for(const side of[-1,1])patch(box.getCenter(V3()).x+side*(box.max.x-box.min.x)*.63,box.max.z+1.5,.65);}
 // Authored diagonal pockets break up the large courts, leaving the central
 // interaction and all approach/loop corridors open. Low edging is walkable.
 summary.courtGardens=0;const courtPlan=layout??(activeScene.key==='brookstead'?{courts:[[-118,70,15]],routes:[],loops:[]}:null);
 if(courtPlan&&!macro)for(const [cx,cz,r]of courtPlan.courts.slice(0,2))for(const angle of[.78,2.36,3.93,5.5]){
  const x=cx+Math.cos(angle)*r*.68,z=cz+Math.sin(angle)*r*.68,radius=profile.flora==='formal'?1.5:1.8;
  let lane=Infinity;for(const line of[...courtPlan.routes,...courtPlan.loops??[]])for(let j=1;j<line.length;j++)lane=Math.min(lane,segmentDistance(x,z,line[j-1],line[j]));
  if(lane<radius+3.6||wet(x,z)||!anchorClear(x,z,radius+2.5)||!staticFree(x,z,radius))continue;const h=ground(x,z);if(Math.max(...[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>Math.abs(ground(x+a*radius,z+b*radius)-h)))>.14)continue;
  const snowBed=profile.flora==='snow',bed=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*1.02,.10,40),new THREE.MeshStandardMaterial({map:environment102.maps.get(snowBed?'snow':'earthForest'),roughness:.98,color:snowBed?'#ffffff':'#d3ceb7'}));bed.position.set(x,h+.035,z);bed.name='Low planted court island';bed.receiveShadow=true;bed.updateMatrix();bed.matrixAutoUpdate=false;world.add(bed);
  for(let j=0;j<19;j++){const a=j/19*TAU,s=.18+rng()*.05,xx=x+Math.cos(a)*radius,zz=z+Math.sin(a)*radius,g=rockGeometry62([1,3,6,7][j%4]),sy=s*.5;submit('gardenEdging'+j%4,g,rockMaterial62(profile.stone),xx,ground(xx,zz)-g.boundingBox.min.y*sy+.02,zz,s*1.4,sy,s,rng()*TAU);summary.stones++;}
  for(let j=0;j<(phone?16:32);j++){const a=rng()*TAU,rr=Math.sqrt(rng())*radius*.78,xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr,kind=snowBed?'leaf':j%5===0?'leaf':j%3===0?'fern':'flowers',s=(kind==='leaf'?.40:kind==='fern'?.80:.60)*(.78+rng()*.4),g=kind==='leaf'?bough104(snowBed?4:0,phone?1:0):plantSculpt103(kind,phone);submit(kind,g,material(kind),xx,ground(xx,zz)+.08+(kind==='leaf'?0:.465*s)-.02,zz,s,s,s,rng()*TAU);summary.plantings++;}
  if(!snowBed)for(let j=0;j<(phone?30:65);j++){const a=rng()*TAU,rr=Math.sqrt(rng())*radius*.86,xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr,s=.52+rng()*.24;submit('gardenGrass',curvedGrass102(phone),material('grassBlades'),xx,ground(xx,zz)+.08+.465*s*.85,zz,s,s*.85,s,rng()*TAU);summary.plantings++;}
  summary.courtGardens++;
 }
 for(const {kind,g,m,rows,center}of bins.values()){
  const geo=shareGeometry36(g),far=shareGeometry36(kind==='leaf'?bough104(0,2):kind==='fern'||kind==='flowers'?plantSculpt103(kind,true):kind==='coastalGrass'||kind==='gardenGrass'?curvedGrass102(true):g);if(kind==='leaf'){const mask=new THREE.InstancedBufferAttribute(new Float32Array(rows.length),1);geo.setAttribute('treeViewHidden',mask);far.setAttribute('treeViewHidden',mask);}const o=new THREE.InstancedMesh(geo,m,rows.length);rows.forEach((matrix,i)=>o.setMatrixAt(i,matrix));o.name='Ecological planting · '+kind;o.castShadow=kind.startsWith('stone');o.receiveShadow=true;o.userData={ecology104:true,center,total:rows.length,detailedGeometry:geo,distantGeometry:far};o.computeBoundingSphere();o.computeBoundingBox();o.updateMatrix();o.matrixAutoUpdate=false;world.add(o);summary.meshes.push(o);summary.batches++;
 }
 world.userData.ecology104=summary;world.updateMatrixWorld(true);
}
const finishEcologyBefore104=finishWorld102;
finishWorld102=function(){finishEcologyBefore104();if(envPbr103.ready)addScenicEcology104();};
const detailBudgetBefore104=updateRenderBudget;
updateRenderBudget=function(...args){const r=detailBudgetBefore104(...args);if(!player||!world)return r;const macro=activeScene.kind==='overworld',phone=matchMedia('(pointer:coarse)').matches;for(const o of world.userData.ecology104?.meshes??[]){const d=Math.hypot(o.userData.center.x-player.x,o.userData.center.z-player.z);o.visible=d<(macro?185:105);o.geometry=d<(phone?22:40)?o.userData.detailedGeometry:o.userData.distantGeometry;o.castShadow=o.name.includes('stone')&&d<(macro?55:35);}return r;};
// A canopy backdrop is for distant crowns, not an oversized set of triangles
// beside the party. Replace those old background sprays with modeled shoots.
const backgroundBefore104=sameForest26;
sameForest26=function(entries,kind,parent){if(!entries.length)return;const start=parent.children.length;backgroundBefore104(entries,kind,parent);for(const o of parent.children.slice(start)){if(!o.isInstancedMesh||kind==='trunk')continue;const species=kind==='pine'?4:0,g=shareGeometry36(bough104(species,2));g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(entries.length),1));o.geometry=g;o.material=treeMaterial104(species);o.userData.modeledBackground104=true;o.computeBoundingSphere();o.computeBoundingBox();}};
// Habitat-appropriate stage borders: foliage stays clear of the fight, roads
// remain paved, and cold/underground stages use scree instead of lush flowers.
const battleDressingBefore104=dressHybrid90;
dressHybrid90=function(b){battleDressingBefore104(b);const rng=seeded(104881+Object.keys(ARENAS88).indexOf(encounter53.selected)*173),s=b.spec,paved=['royalRoad','ruins'].includes(encounter53.selected);let plants=0,stones=0;
 for(const side of[-1,1])for(let i=0;i<10;i++){
  const x=side*(20+rng()*22),z=-9-i*3.5+rng()*2;if(arenaWet89(b,x,z)>.08||!detailFree92(b,x,z,2))continue;
  if(s.cave||s.snow||s.ground==='barren'){for(let j=0;j<4;j++){arenaRock88(b,x+(rng()-.5)*3,z+(rng()-.5)*3,.18+rng()*.55,.15+rng()*.55,.20+rng()*.55,[1,3,5,7,10,11][j%6]);stones++;}}
  else{for(let j=0;j<(b.mobile?5:10);j++){const xx=x+(rng()-.5)*4,zz=z+(rng()-.5)*3,coast=s.sea||s.coast;if(coast){const size=.45+rng()*.35,g=arenaGeometry88(b,'coastal-tussock104',()=>curvedGrass102(b.mobile).clone()),m=arenaCoverMaterial102(b,'grassBlades');if(detailFree92(b,xx,zz,.8))arenaInstance88(b,'coastal-tussock104',g,m,V3(xx,arenaFloor88(b,xx,zz)+.465*size-.02,zz),V3(size,size,size),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),rng()*TAU));}else botanical92(b,xx,zz,s.dense?'fern':j%3===0?'flowers':'fern',.45+rng()*.38);plants++;}if(i%3===0){arenaRock88(b,x,z,1.0+rng(),.55+rng()*.55,1.0+rng(),[0,3,6,9][i%4]);stones++;}}
 }
 b.ecology104={plantIslands:20,plants,stones,identity:SCENE_REFERENCE101[encounter53.selected]?.props??[],paved};
};
// Replace the old solid white water discs with a genuinely hollow stone well,
// a recessed light-responsive water surface, and connected winding hardware.
const wellCourtBefore104=conceptCourt38;
conceptCourt38=function(key){const start=world.children.length,r=wellCourtBefore104(key);
 for(const g of world.children.slice(start)){if(!g.isGroup)continue;const body=g.children.find(o=>o.geometry?.type==='CylinderGeometry'&&Math.abs(o.geometry.parameters.radiusTop-1.75)<.01&&Math.abs(o.geometry.parameters.height-.8)<.01);if(!body)continue;
  const waterDisc=g.children.find(o=>o.geometry?.type==='CylinderGeometry'&&Math.abs(o.geometry.parameters.radiusTop-1.45)<.01);body.removeFromParent();if(waterDisc)waterDisc.removeFromParent();
  const stone=new THREE.MeshStandardMaterial({map:environment102.maps.get('masonry102'),normalMap:envPbr103.maps.get('masonry102:normalRough'),roughness:.94,color:'#d1d0c1'});stone.normalScale.setScalar(.25);addCloudLighting(stone);lightPaintedSurface82(stone);
  const points=[[1.28,.04],[1.28,.62],[1.36,.75],[1.91,.75],[1.96,.66],[1.84,.57],[1.84,.07],[1.92,.03]].map(([x,y])=>new THREE.Vector2(x,y));const wall=new THREE.Mesh(new THREE.LatheGeometry(points,64),stone);wall.castShadow=wall.receiveShadow=true;wall.name='Hollow masonry well';g.add(wall);
  const water=new THREE.MeshStandardMaterial({color:'#295e68',normalMap:envPbr103.maps.get('waveHeight103:normalRough'),normalScale:new THREE.Vector2(.27,.27),roughness:.19,metalness:0,envMap:surface67.outdoor,envMapIntensity:.55});const before=water.onBeforeCompile;water.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.wellTime104=windUniforms.time;s.vertexShader='uniform float wellTime104;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvNormalMapUv+=vec2(wellTime104*.018,wellTime104*.011);');};water.customProgramCacheKey=()=> 'physical-well-water104';
  const surface=new THREE.Mesh(new THREE.CircleGeometry(1.27,64),water);surface.rotation.x=-Math.PI/2;surface.position.y=.40;surface.receiveShadow=true;surface.name='Recessed rippling well water';g.add(surface);
  const wood=new THREE.MeshStandardMaterial({map:environment102.maps.get('woodWeathered101'),roughness:.88,color:'#c0af8e'});addCloudLighting(wood);const postGeo=new THREE.CylinderGeometry(.11,.14,2.75,12),beamGeo=new THREE.CylinderGeometry(.12,.12,3.6,12);
  for(const side of[-1,1]){const o=new THREE.Mesh(postGeo,wood);o.position.set(side*1.62,1.32,0);o.castShadow=o.receiveShadow=true;g.add(o);}const beam=new THREE.Mesh(beamGeo,wood);beam.rotation.z=Math.PI/2;beam.position.y=2.65;beam.castShadow=true;g.add(beam);
  const ropeMat=new THREE.MeshStandardMaterial({map:envPbr103.maps.get('canvas102:albedo'),roughness:1,color:'#a38c60'}),rope=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1.78,8),ropeMat);rope.position.set(0,1.67,0);g.add(rope);
  const bucket=new THREE.Mesh(new THREE.LatheGeometry([[.24,0],[.28,.03],[.30,.38],[.25,.38],[.23,.07]].map(([x,y])=>new THREE.Vector2(x,y)),16),wood);bucket.position.set(0,.69,0);bucket.castShadow=true;g.add(bucket);g.userData.well104=true;
 }
 return r;};
