// Visibility follows the actual party even during a covered scene handoff or
// a paused developer camera. It must not use the old wind actor's zero origin.
const botanicalFocus103={value:V3()};
const vegetationCameraBefore103=updateCamera;
updateCamera=function(...args){if(player&&!encounter53.active)botanicalFocus103.value.set(player.x,heightAt(player.x,player.z),player.z);return vegetationCameraBefore103(...args);};

// True curved laminae and modeled flower heads. These are geometry, not
// intersecting photographs of a whole plant. Every leaflet joins its rachis.
function plantSculpt103(kind,far=false){
 const key='plant-sculpt103-'+kind+'-'+far;if(sharedGeo[key])return sharedGeo[key];const p=[],uv=[],col=[],indices=[],rng=seeded(kind==='fern'?103113:103119);
 const patch=(a,b,width,color,cupping=.10,steps=3)=>{const d=b.clone().sub(a),right=V3(-d.z,.12,d.x).normalize();if(right.length()<.1)right.set(1,0,0);const start=p.length/3;
  for(let j=0;j<=steps;j++){const t=j/steps,c=a.clone().addScaledVector(d,t),w=width*Math.pow(Math.sin(t*Math.PI),.7);c.y+=Math.sin(t*Math.PI)*cupping;
   for(let s=-1;s<=1;s++){const q=c.clone().addScaledVector(right,s*w);q.y-=Math.abs(s)*Math.sin(t*Math.PI)*cupping*.55;p.push(...q.toArray());uv.push((s+1)*.5,t);col.push(...color)}}
  for(let j=0;j<steps;j++)for(let s=0;s<2;s++){const i=start+j*3+s;indices.push(i,i+1,i+3,i+1,i+4,i+3)}};
 const stem=(a,b,r=.008,color=[.34,.49,.20])=>{const d=b.clone().sub(a),right=V3(-d.z,0,d.x).normalize();if(right.length()<.1)right.set(1,0,0);const n=far?3:4,start=p.length/3,up=right.clone().cross(d).normalize();
  for(const [c,w]of [[a,r],[b,r*.55]])for(let i=0;i<n;i++){const t=i/n*TAU,q=c.clone().addScaledVector(right,Math.cos(t)*w).addScaledVector(up,Math.sin(t)*w);p.push(...q.toArray());uv.push(i/n,c===a?0:1);col.push(...color)}for(let i=0;i<n;i++){const j=(i+1)%n;indices.push(start+i,start+j,start+n+i,start+j,start+n+j,start+n+i)}};
 if(kind==='flowers'){
  for(let i=0;i<(far?1:3);i++){const a=i*2.399,root=V3(Math.cos(a)*.12,-.465,Math.sin(a)*.12),top=root.clone().add(V3(.03*Math.sin(a),.40+rng()*.21,.03*Math.cos(a)));stem(root,top,.006);
   for(let j=0;j<2;j++){const from=root.clone().lerp(top,.26+j*.22),angle=a+j*2.3,to=from.clone().add(V3(Math.cos(angle)*.11,.045,Math.sin(angle)*.11));patch(from,to,.024,[.35,.50,.23],.025,2)}
   const petals=far?7:10;for(let j=0;j<petals;j++){const angle=j/petals*TAU,to=top.clone().add(V3(Math.cos(angle)*.078,.005+Math.sin(angle*2)*.008,Math.sin(angle)*.078));patch(top,to,.019,[.95,.94,.82],.018,far?2:3)}
   for(let j=0;j<6;j++){const a=j/6*TAU;patch(top.clone().add(V3(-.008,0,0)),top.clone().add(V3(Math.cos(a)*.021,.012,Math.sin(a)*.021)),.009,[.85,.62,.10],.003,1)}
  }
 }else if(kind==='fern'){
  for(let f=0;f<(far?4:6);f++){const angle=f*2.399,dir=V3(Math.cos(angle),0,Math.sin(angle)),side=V3(-dir.z,0,dir.x),length=.37+rng()*.24,point=t=>V3(0,-.465,0).addScaledVector(dir,length*t*.78).add(V3(0,length*(1.22*t-.72*t*t),0));
   const count=far?6:9;let previous=point(0);for(let j=1;j<=count;j++){const t=j/count,c=point(t);stem(previous,c,.004,[.31,.43,.18]);previous=c;
    if(j<count)for(const s of[-1,1]){const reach=length*.28*Math.pow(Math.sin(t*Math.PI),.7),tip=c.clone().addScaledVector(side,s*reach).addScaledVector(dir,reach*.38).add(V3(0,.012,0));patch(c,tip,reach*.24,[.63,.73,.42],.014,far?1:2)}}
  }
 }else{
  for(let branch=0;branch<(far?5:9);branch++){const a=branch*2.399,root=V3(0,-.465,0),top=V3(Math.cos(a)*(.16+rng()*.14),-.12+rng()*.16,Math.sin(a)*(.16+rng()*.14));stem(root,top,.012,[.24,.30,.14]);
   for(let j=1;j<5;j++)for(const s of[-1,1]){const from=root.clone().lerp(top,j/5),angle=a+s*.8,to=from.clone().add(V3(Math.cos(angle)*.13,.045,Math.sin(angle)*.13));patch(from,to,.035,[.67,.76,.45],.025,far?2:3)}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();g.boundingSphere.radius+=.2;g.userData={sculpt103:kind,connected:true,modeledLeaves:true};return sharedGeo[key]=g;
}
function vegetationMaterial103(kind,battleStage=null){
 const flower=kind==='flowers',map=environment102.maps.get(flower?'petal102':'botanicalLeaf102'),m=new THREE.MeshStandardMaterial({map,bumpMap:map,bumpScale:flower?.008:kind==='grassBlades'?.002:.012,color:flower?'#f1efdc':kind==='grassBlades'?'#ffffff':'#a6ba83',vertexColors:kind!=='grassBlades',roughness:.93,metalness:0,side:THREE.DoubleSide,alphaTest:0,transparent:false,depthWrite:true});
 addCloudLighting(m);lightPaintedSurface82(m);const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.growthTime103=battleStage?stageDepth59.time:windUniforms.time;s.uniforms.growthWind103=windUniforms.strength;s.uniforms.thinLeafFill103={value:battleStage?(battleStage.night?.055:.31):.16};
  s.fragmentShader='uniform float thinLeafFill103;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=max(outgoingLight,diffuseColor.rgb*thinLeafFill103);\n#include <opaque_fragment>');
  if(kind==='grassBlades'){s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`vec3 epidermis103=texture2D(map,vMapUv*vec2(.4,1.)+vec2(.3,0.)).rgb;float vein103=dot(epidermis103,vec3(.21,.72,.07));vec3 bladePigment103=vec3(.17,.28,.055)*mix(.78,1.16,smoothstep(.025,.42,vein103));diffuseColor.rgb*=bladePigment103;`);}
  s.vertexShader='uniform float growthTime103,growthWind103;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 plantRoot103=vec3(0.);
   #ifdef USE_INSTANCING
    plantRoot103=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
   #endif
   float stemHeight103=max(0.,position.y+.465);float gust103=sin(growthTime103*1.1+plantRoot103.x*.37+plantRoot103.z*.28)*.027*growthWind103;transformed.xz+=vec2(.82,.37)*gust103*stemHeight103;`);
 };m.customProgramCacheKey=()=>key+'-opaque-real-botany103-'+kind+'-'+!!battleStage;m.uniformsForDistance={range:{value:new THREE.Vector2(90,110)}};m.userData.realVegetation103=kind;m.userData.pbr103={roughness:.93,metalness:0,modeled:true};return m;
}
const plantGeoBefore103=groundcoverGeometry102;
groundcoverGeometry102=function(kind,far=false){return ['fern','flowers','shrub'].includes(kind)?plantSculpt103(kind,far):plantGeoBefore103(kind,far)};
groundcoverMaterial102=function(kind,range){const m=vegetationMaterial103(kind);if(range)m.uniformsForDistance={range};return m;};
arenaCoverMaterial102=function(b,kind){const id='sculpt103-'+kind;if(b.materials.has(id))return b.materials.get(id);const m=material59(vegetationMaterial103(kind,b));bindArenaWeather89(m,b);b.materials.set(id,m);return m;};
const sculptPlantBuildBefore103=buildPlants;
buildPlants=function(...args){const r=sculptPlantBuildBefore103(...args);for(const im of world.userData.plantMeshes??[]){if(im.userData.plantKey!=='shrub')continue;im.material=vegetationMaterial103('shrub');im.geometry=im.userData.detailedGeometry=shareGeometry36(plantSculpt103('shrub'));im.userData.distantGeometry=shareGeometry36(plantSculpt103('shrub',true));world.userData.botanicalOwned30??=new Set();world.userData.botanicalOwned30.add(im.geometry);world.userData.botanicalOwned30.add(im.userData.distantGeometry)}return r;};
// Small spatial batches keep the newly dense grass affordable and correctly
// culled. A distant chunk never switches an entire town to the lowest LOD.
function partitionGrass103(){
 if(world.userData.grass103||activeScene.kind==='interior')return;const macro=activeScene.kind==='overworld',cell=macro?48:24,old=[...(world.userData.plantMeshes??[])],buckets=new Map();
 for(const im of old){if(im.userData.plantKey!=='grassBlades')continue;for(let i=0;i<im.userData.plantOriginal.length;i++){const m=im.userData.plantOriginal[i],e=m.elements;if(Math.abs(e[5])<.001)continue;const id=Math.floor(e[12]/cell)+','+Math.floor(e[14]/cell);if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push({m,global:im.userData.globalPlantIndices?.[i]??i})}im.removeFromParent();world.userData.plantMeshes.splice(world.userData.plantMeshes.indexOf(im),1);const index=perf.plants.indexOf(im);if(index>=0)perf.plants.splice(index,1);im.dispose();}
 const m=vegetationMaterial103('grassBlades');let count=0;
 for(const [key,rows]of buckets){const[x,z]=key.split(',').map(Number),g=shareGeometry36(curvedGrass102(false)),far=shareGeometry36(curvedGrass102(true)),im=new THREE.InstancedMesh(g,m,rows.length);rows.forEach((q,i)=>im.setMatrixAt(i,q.m));im.userData={plantKey:'grassBlades',plantOriginal:rows.map(q=>q.m),globalPlantIndices:rows.map(q=>q.global),total:rows.length,center:V3((x+.5)*cell,0,(z+.5)*cell),detailedGeometry:g,distantGeometry:far,realVegetation103:true};im.receiveShadow=true;im.castShadow=false;im.computeBoundingSphere();im.computeBoundingBox();world.add(im);perf.plants.push(im);world.userData.plantMeshes.push(im);world.userData.botanicalOwned30??=new Set();world.userData.botanicalOwned30.add(g);world.userData.botanicalOwned30.add(far);count+=rows.length;}
 world.userData.grass103={chunks:buckets.size,count,realCurvedBlades:true,cell,shaderRebuilt:true};
}
const lushGrassBefore103=lushGrass102;
lushGrass102=function(){lushGrassBefore103();partitionGrass103();};
const denseBattleFlushBefore103=flushArena88;
flushArena88=function(b){
 if(!b.midfield103&&!b.spec.cave&&!b.spec.snow){b.midfield103=true;const rng=seeded(103741+encounter53.selected.length*77),g=arenaGeometry88(b,'midfield-grass103',()=>{const g=curvedGrass102(b.mobile).clone();g.translate(0,.465,0);return g}),m=arenaCoverMaterial102(b,'grassBlades');let count=0;
  const feet=[player,...followers,...battle.enemies.map(e=>e.actor)].map(a=>{const p=battle.rankHomes87?.get(a)??a;return V3(p.x-b.group.position.x,0,p.z-b.group.position.z)});
  for(let i=0;i<(b.mobile?11000:25000);i++){const x=-48+rng()*96,z=-26+rng()*51;if(arenaWet89(b,x,z)>.08)continue;const patch=.5+.25*Math.sin(x*.23+Math.sin(z*.31))+.25*Math.sin(z*.41-x*.17);if(patch<rng()*.55)continue;
   const h=arenaFloor88(b,x,z),nearFoot=feet.some(p=>Math.hypot(p.x-x,p.z-z)<1.15),s=.42+rng()*.42,short=nearFoot?.33:z>15?.8:1;if(Math.abs(h-arenaFloor88(b,x+.3,z))>.25)continue;arenaGrassInstanceBefore102(b,'midfield-grass103',g,m,V3(x,h-.025,z),V3(s,s*.78*short,s),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),rng()*TAU));count++;}
  b.counts.midfieldGrass103=count;
 }
 const r=denseBattleFlushBefore103(b);for(const o of b.group.children)if(o.material?.userData.realVegetation103){o.castShadow=false;
  // The legacy small-grass builder turns vertexColors on after obtaining this
  // shared material. Curved blades deliberately use native lamina pigment;
  // midfield geometry has no colour attribute, whose WebGL default is black.
  if(o.material.userData.realVegetation103==='grassBlades'&&o.material.vertexColors){o.material.vertexColors=false;o.material.needsUpdate=true;}
 }return r;
};

function leafyBough103(count=42){
 const key='modeled-bough103-'+count;if(sharedGeo[key])return sharedGeo[key];const p=[],uv=[],idx=[],rng=seeded(103587),put=(v,u,w)=>{p.push(...v.toArray());uv.push(u,w)},n=count>=40?112:64;
 // A central, connected twig branches into tapered side shoots; laminae curl
 // above their midribs. The same surface receives actual scene light/shadow.
 const leaf=(base,angle,length,width)=>{const dir=V3(Math.cos(angle),.24+rng()*.35,Math.sin(angle)).normalize(),right=V3(-Math.sin(angle),0,Math.cos(angle)),start=p.length/3;
  for(let j=0;j<=3;j++){const t=j/3,c=base.clone().addScaledVector(dir,length*t);c.y+=Math.sin(t*Math.PI)*length*.12;const w=width*Math.sin(t*Math.PI);for(let side=-1;side<=1;side++){const v=c.clone().addScaledVector(right,side*w);v.y-=Math.abs(side)*Math.sin(t*Math.PI)*length*.08;put(v,(side+1)*.5,t)}}for(let j=0;j<3;j++)for(let k=0;k<2;k++){const i=start+j*3+k;idx.push(i,i+1,i+3,i+1,i+4,i+3)}};
 for(let i=0;i<n;i++){const t=(i+.5)/n,a=i*2.399963,y=1-2*t,r=Math.sqrt(Math.max(0,1-y*y))*(.68+rng()*.30),base=V3(Math.cos(a)*r,.85+y*.65,Math.sin(a)*r);leaf(base,a+(rng()-.5)*1.3,.30+rng()*.27,.074+rng()*.065);const root=V3(0,0,0),right=V3(-Math.sin(a),0,Math.cos(a)),start=p.length/3;put(root.clone().addScaledVector(right,.006),0,0);put(root.clone().addScaledVector(right,-.006),1,0);put(base,0.5,1);idx.push(start,start+1,start+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.setAttribute('botanicalRight102',new THREE.Float32BufferAttribute(new Float32Array(p.length),3));g.setAttribute('botanicalUp102',new THREE.Float32BufferAttribute(new Float32Array(p.length),3));g.setAttribute('modeledLeaf103',new THREE.Float32BufferAttribute(new Float32Array(p.length/3).fill(1),1));g.computeBoundingSphere();g.userData.realLeaves103=true;return sharedGeo[key]=g;
}
function foliageShader103(m,depth=false){
 if(!m||m.userData.foliage103)return;m.userData.foliage103=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.lamina103={value:environment102.maps.get('botanicalLeaf102')};s.uniforms.needles103={value:envPbr103.maps.get('pineNeedles103:albedo')};s.vertexShader='attribute float modeledLeaf103;varying float leafMode103;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nleafMode103=modeledLeaf103;');s.fragmentShader='uniform sampler2D lamina103,needles103;varying float leafMode103;\n'+s.fragmentShader;
  if(depth)s.fragmentShader=s.fragmentShader.replace('if(trunk30<.5&&sampleLeaf30(leafUV30,species30).a<.36)discard;','if(leafMode103<.5&&trunk30<.5&&sampleLeaf30(leafUV30,species30).a<.36)discard;');
  else s.fragmentShader=s.fragmentShader.replace('diffuseColor*=botany30;',`if(leafMode103>.5&&trunk30<.5){vec3 lamina=texture2D(lamina103,leafUV30*vec2(.5,1.)+vec2(.25,0.)).rgb;if(abs(species30-4.)<.1||abs(species30-6.)<.1)lamina=texture2D(needles103,leafUV30).rgb;lamina*=abs(species30-2.)<.1?vec3(1.32,.63,.26):vec3(.85,.95,.76);botany30=vec4(lamina,1.);}diffuseColor*=botany30;`);
 };m.customProgramCacheKey=()=>key+'-sculpted-leaf103-'+depth;
}
const foliageForestBefore103=buildSolidForest;
buildSolidForest=function(...args){const r=foliageForestBefore103(...args);for(const im of scenery.forestMeshes){if(im.userData.forestKind==='trunk')continue;const lods=im.userData.nativeLods30;if(!lods)continue;const g=shareGeometry36(leafyBough103());for(const key of ['treeKind','treeSpecies30','treeViewHidden'])g.setAttribute(key,lods[0].attributes[key]);lods[0]=g;im.userData.fullGeometry=g;im.geometry=g;for(const far of lods.slice(1))if(!far.attributes.modeledLeaf103)far.setAttribute('modeledLeaf103',new THREE.Float32BufferAttribute(new Float32Array(far.attributes.position.count),1));foliageShader103(im.material);foliageShader103(im.customDepthMaterial,true);im.computeBoundingSphere();im.computeBoundingBox();}return r;};
const battleLeavesBefore103=flushPoiTrees89;
flushPoiTrees89=function(b){const r=battleLeavesBefore103(b);for(const im of b.group.children){if(im.name!=='POI native botanical canopy')continue;const old=im.geometry,g=geometry59(leafyBough103(b.mobile?24:42).clone());for(const key of ['treeKind','treeSpecies30','treeViewHidden'])if(old.attributes[key])g.setAttribute(key,old.attributes[key]);im.geometry=g;foliageShader103(im.material);foliageShader103(im.customDepthMaterial,true);im.computeBoundingSphere();im.computeBoundingBox();}return r;};
const grassBudgetBefore103=updateRenderBudget;
updateRenderBudget=function(...args){const r=grassBudgetBefore103(...args);if(!player)return r;const mobile=matchMedia('(pointer:coarse)').matches,macro=activeScene.kind==='overworld';for(const im of perf.plants){if(!im.userData.realVegetation103)continue;const d=Math.hypot(im.userData.center.x-player.x,im.userData.center.z-player.z);im.visible=im.visible&&d<(macro?150:96);im.geometry=d<(mobile?18:30)?im.userData.detailedGeometry:im.userData.distantGeometry;im.count=Math.floor(im.userData.total*(mobile?(d>50?.50:.78):1));im.castShadow=false;}return r;};
