// A botanical crown is made of connected woody shoots and individually cupped
// leaf surfaces. All three LODs remain geometry; no branch photographs or fans.
const botany104={materials:new WeakMap(),version:104};
function bough104(species=0,lod=0){
 const key='living-bough104-'+species+'-'+lod;if(sharedGeo[key])return sharedGeo[key];
 const pine=species===4,willow=species===3,rng=seeded(104031+species*107),p=[],uv=[],colour=[],surface=[],phase=[],idx=[];
 const vertex=(v,u,w,c,type,flutter)=>{p.push(...v.toArray());uv.push(u,w);colour.push(...c);surface.push(type);phase.push(flutter);};
 const tube=(a,b,r)=>{const dir=b.clone().sub(a).normalize(),right=V3().crossVectors(dir,Math.abs(dir.y)>.9?V3(1,0,0):V3(0,1,0)).normalize(),up=V3().crossVectors(dir,right),start=p.length/3,n=lod===2?3:5;
  for(const [at,scale]of [[a,1],[b,.50]])for(let j=0;j<n;j++){const t=j/n*TAU;vertex(at.clone().addScaledVector(right,Math.cos(t)*r*scale).addScaledVector(up,Math.sin(t)*r*scale),j/n,at===a?0:1,[.75,.72,.63],0,0);}
  for(let j=0;j<n;j++){const k=(j+1)%n;idx.push(start+j,start+k,start+n+j,start+k,start+n+k,start+n+j);}
 };
 const leaf=(root,direction,len,width,seed,type=1)=>{const d=direction.clone().normalize(),across=V3().crossVectors(d,Math.abs(d.y)>.85?V3(1,0,0):V3(0,1,0)).normalize().applyAxisAngle(d,(seed-.5)*2.3),fold=V3().crossVectors(across,d).normalize(),start=p.length/3,steps=lod===0?3:2;
  for(let j=0;j<=steps;j++){const t=j/steps,mid=root.clone().addScaledVector(d,len*t).addScaledVector(fold,Math.sin(t*Math.PI)*len*.13),w=width*Math.pow(Math.sin(t*Math.PI),pine?.65:.78);for(let s=-1;s<=1;s++){const v=mid.clone().addScaledVector(across,s*w).addScaledVector(fold,-Math.abs(s)*len*.035*Math.sin(t*Math.PI));vertex(v,(s+1)*.5,t,[.88+seed*.12,.90+seed*.10,.84+seed*.16],type,seed);}}
  for(let j=0;j<steps;j++)for(let s=0;s<2;s++){const a=start+j*3+s;idx.push(a,a+1,a+3,a+1,a+4,a+3);}
 };
 const shoots=lod===0?10:lod===1?7:5,count=lod===0?(pine?18:12):lod===1?6:3;
 const root=V3(),leader=V3(.025,.62,0);tube(root,leader,.025);
 for(let j=0;j<shoots;j++){
  const a=j*2.399963+species*.31,t=(j+.5)/shoots,start=root.clone().lerp(leader,.12+t*.75),reach=(pine?.83:1.05)*(.72+rng()*.28),tip=start.clone().add(V3(Math.cos(a)*reach,(willow?-.45:pine?.03+rng()*.25:-.28+rng()*.97),Math.sin(a)*reach));
  const elbow=start.clone().lerp(tip,.56).add(V3(0,.08,0));tube(start,elbow,.014);tube(elbow,tip,.008);
  for(let n=0;n<count;n++){
   const f=(n+.6)/count,at=start.clone().lerp(tip,f);at.y+=Math.sin(f*Math.PI)*.045;
   const side=n%2?-1:1,angle=a+side*(pine?1.08:.78),droop=willow?-.45:(rng()-.5)*(pine?.62:1.6),dir=V3(Math.cos(angle),droop,Math.sin(angle));
   const coverage=lod===0?1:lod===1?1.35:1.85,len=((pine?.23:.22)+(pine?.10:.18)*rng())*coverage,width=(pine?.039:species===1?.059:.077)*(pine?1:.85+rng()*.5)*coverage;
   leaf(at,dir,len,width,rng());
   if(pine&&lod<2)leaf(at,V3(Math.cos(angle+.32),.38,Math.sin(angle+.32)),len*.84,width*.7,rng());
  }
  if(species===5&&j%2===0){for(let petal=0;petal<5;petal++){const angle=petal/5*TAU;leaf(tip,V3(Math.cos(angle),.20,Math.sin(angle)),.095,.037,rng(),2);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colour,3));g.setAttribute('leafSurface104',new THREE.Float32BufferAttribute(surface,1));g.setAttribute('leafPhase104',new THREE.Float32BufferAttribute(phase,1));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.boundingSphere.radius+=.12;g.userData={modeledBotany104:true,connectedShoots:true,leaves:shoots*count*(pine&&lod<2?2:1),species,lod};return sharedGeo[key]=g;
}
const treeVertex104=`attribute float treeViewHidden;uniform float mainView104,windTime104,windPower104;`;
function animateCrown104(shader,trunk=false){
 Object.assign(shader.uniforms,{mainView104:forest30.main,windTime104:windUniforms.time,windPower104:windUniforms.strength});
 shader.vertexShader=treeVertex104+(trunk?'':'attribute float leafSurface104,leafPhase104,treeKind;varying float leafSkin104;')+'\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 ${trunk?'':`leafSkin104=leafSurface104;vec3 root104=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;float flex104=smoothstep(0.,1.2,length(position))*(treeKind>.5&&treeKind<1.5?0.:1.);float gust104=sin(windTime104*.84+root104.x*.13+root104.z*.17)*.025+sin(windTime104*1.73+root104.x*.27)*.012;transformed.xz+=vec2(.85,.36)*gust104*windPower104*flex104;transformed.y+=sin(windTime104*(2.5+leafPhase104)+leafPhase104*31.+root104.x*.11)*.009*windPower104*leafSurface104*flex104;`}
 transformed*=1.-treeViewHidden*mainView104;`);
}
function treeMaterial104(species,trunk=false,battleStage=null,depth=false){
 if(depth){const m=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});m.onBeforeCompile=s=>{animateCrown104(s,trunk);s.uniforms.mainView104={value:0};if(battleStage)s.uniforms.windTime104=stageDepth59.time;};m.customProgramCacheKey=()=>`botanical-shadow104-${trunk}`;return m;}
 const bark=species===1?'barkBirch':species===4?'barkPine':'barkOak',map=trunk?envPbr103.maps.get(bark+':albedo'):environment102.maps.get('botanicalLeaf102');
 const m=new THREE.MeshStandardMaterial({map,color:trunk?'#c7c4b7':'#ffffff',roughness:trunk?.94:.88,metalness:0,side:THREE.DoubleSide,vertexColors:!trunk,alphaTest:0,transparent:false});m.envMap=null;
 if(trunk){m.normalMap=envPbr103.maps.get(bark+':normalRough')??null;m.normalScale.setScalar(.20);}
 addCloudLighting(m);lightPaintedSurface82(m);if(battleStage)bindArenaWeather89(m,battleStage);
 const before=m.onBeforeCompile,cache=m.customProgramCacheKey();m.onBeforeCompile=function(s,...args){before.call(this,s,...args);animateCrown104(s,trunk);if(battleStage)s.uniforms.windTime104=stageDepth59.time;
  if(trunk)s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv.y*=max(.35,length(instanceMatrix[1].xyz)*.7);\n#ifdef USE_NORMALMAP\nvNormalMapUv.y*=max(.35,length(instanceMatrix[1].xyz)*.7);\n#endif');
  if(!trunk){const autumn=species===2&&battleStage&&(battleStage.spec.autumn||battleStage.spec.trees==='autumn');Object.assign(s.uniforms,{barkArt104:{value:envPbr103.maps.get(bark+':albedo')},leafTint104:{value:new THREE.Color(autumn?'#ae773f':species===4?'#5d8054':species===1?'#789c48':species===3?'#739456':species===5?'#80a05e':'#678344')},snowCover104:{value:battleStage?.spec.snow||(!battleStage&&activeScene.key==='snow')?1:0},leafDay104:battleStage?{value:battleStage.night?.04:1}:celestial31.day});
   s.fragmentShader='uniform sampler2D barkArt104;uniform vec3 leafTint104;uniform float leafDay104,snowCover104;varying float leafSkin104;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`vec3 veinArt104=texture2D(map,vMapUv*.72+vec2(.14,.08)).rgb;float veinTone104=clamp(dot(veinArt104,vec3(.21,.72,.07))*2.7,.76,1.18);vec3 leafArt104=leafTint104*veinTone104;if(leafSkin104>1.5)leafArt104=vec3(.86,.73,.72)*veinTone104;vec3 woodArt104=texture2D(barkArt104,vMapUv*vec2(.22,.8)).rgb;vec3 skin104=mix(woodArt104,leafArt104,min(1.,leafSkin104));float snowUp104=smoothstep(.35,.8,dot(normalize(vNormal),normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz)));skin104=mix(skin104,vec3(.76,.82,.84),snowCover104*snowUp104*.88);diffuseColor.rgb*=skin104;`);
   s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`float thin104=leafSkin104*mix(.045,.22,leafDay104);outgoingLight=max(outgoingLight,diffuseColor.rgb*thin104);\n#include <opaque_fragment>`);
  }
 };m.customProgramCacheKey=()=>cache+`-anatomical104-${species}-${trunk}`;m.userData={...m.userData,treeViewCompiled:true,botany104:true,species104:species,trunk104:trunk,opaque104:true};return m;
}
// Use narrower, rounded unit branches with stable, shared sockets. The tapered
// ends overlap their parent by only a few millimetres, not by a floating gap.
function branchCylinder104(){return sharedGeo.branchCylinder104??=new THREE.CylinderGeometry(.185,.22,1,14,5);}
const connectedBefore104=connectedTree102;
connectedTree102=function(t,force=false){
 if(!t)return t;if(t.tree104&&!force)return t;connectedBefore104(t,true);
 const rng=seeded(Math.round(t.x*131.7+t.z*237.3+104119)),h=t.h,s=t.scale,pine=t.species30===4,birch=t.species30===1,willow=t.species30===3,turn=rng()*TAU,lean=(rng()-.5)*(pine?.13:.43)*s;
 t.trunks=[];t.crowns=[];t.joints102={count:0,maxGap:0};t.rootGap102=0;
 const at=v=>V3(t.x+lean*v,t.y+h*v,t.z+Math.sin(v*2.3)*.09*s),matrix=(p,size,q=new THREE.Quaternion())=>new THREE.Matrix4().compose(p,q,size);
 const limb=(a,b,r)=>{const d=b.clone().sub(a),len=d.length();if(len<.001)return;t.trunks.push(matrix(a.clone().add(b).multiplyScalar(.5),V3(r/.22,len+.014*s,r/.22),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize())));t.joints102.count++;};
 const sections=5;for(let i=0;i<sections;i++)limb(at(i/sections*.95-(i===0?.01:0)),at((i+1)/sections*.95),s*(birch?.125:pine?.18:.23)*(1-i/sections*.75));
 const crown=(p,a,w,vertical)=>t.crowns.push(matrix(p,V3(w,vertical,w*(.85+rng()*.20)),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),-a)));
 if(pine){for(let tier=0;tier<7;tier++)for(let j=0;j<5;j++){const v=.22+tier*.105,a=turn+j*TAU/5+tier*1.17,reach=(2.25-tier*.27)*s*(.86+rng()*.20),root=at(v),elbow=root.clone().add(V3(Math.cos(a)*reach*.58,-.09*s,Math.sin(a)*reach*.58)),tip=root.clone().add(V3(Math.cos(a)*reach,.08*s,Math.sin(a)*reach));limb(root,elbow,(.052-tier*.005)*s);limb(elbow,tip,(.032-tier*.003)*s);crown(elbow.clone().lerp(tip,.42),a,reach*.78,.83*s);}}
 else for(let j=0;j<6;j++){const v=(birch?.39:.34)+j*.082,a=turn+j*2.399963,reach=(birch?1.20:willow?2.12:1.8)*s*(.82+rng()*.32),root=at(v),elbow=root.clone().add(V3(Math.cos(a)*reach*.58,h*.10,Math.sin(a)*reach*.58)),tip=elbow.clone().add(V3(Math.cos(a)*reach*.42,h*(willow?.065:.105),Math.sin(a)*reach*.42));limb(root,elbow,(birch?.050:.070)*s);limb(elbow,tip,.038*s);
  crown(elbow.clone().lerp(tip,.30),a,(birch?.86:1.06)*s,(willow?1.22:1.10)*s);
  for(const side of[-1,1]){const angle=a+side*.52,end=tip.clone().add(V3(Math.cos(angle)*.48*s,willow?-.24*s:.05*s,Math.sin(angle)*.48*s));limb(tip,end,.018*s);crown(end,angle,(birch?.88:1.10)*s,(willow?1.32:1.04)*s);}}
 crown(at(.94),turn,(pine?.50:.78)*s,.80*s);
 for(let i=0;i<3;i++){const a=turn+i*TAU/3,root=V3(t.x+Math.cos(a)*.28*s,t.y-.06*s,t.z+Math.sin(a)*.28*s);limb(root,at(.035),.052*s);}
 t.cover30=t.crowns.map(m=>new THREE.Box3(V3(-1.5,-.6,-1.5),V3(1.5,1.4,1.5)).applyMatrix4(m));t.box=new THREE.Box3(V3(t.x-.4*s,t.y-.12*s,t.z-.4*s),V3(t.x+.4*s,t.y+h,t.z+.4*s));for(const box of t.cover30)t.box.union(box);t.tree104=true;t.branch102=true;t.connectedGrowth62=true;return t;
};
naturalTree66=t=>connectedTree102(t);growTree62=naturalTree66;
buildSolidForest=function(){
 scenery.trees=world.userData.solidTrees??[];scenery.forestMeshes=[];world.userData.treePoints=scenery.trees.map(t=>V3(t.x,t.y,t.z));const buckets=new Map(),materials=new Map(),depths=new Map(),macro=activeScene.kind==='overworld',cell=macro?48:32;
 for(const t of scenery.trees){connectedTree102(t,true);t.bindings=[];for(const trunk of[true,false]){const id=Math.floor(t.x/cell)+','+Math.floor(t.z/cell)+','+t.species30+','+trunk;if(!buckets.has(id))buckets.set(id,{entries:[],trunk,species:t.species30,center:V3(Math.floor(t.x/cell)*cell+cell*.5,t.y,Math.floor(t.z/cell)*cell+cell*.5)});for(const matrix of trunk?t.trunks:t.crowns)buckets.get(id).entries.push({t,matrix});}}
 for(const {entries,trunk,species,center}of buckets.values()){
  const mask=new THREE.InstancedBufferAttribute(new Float32Array(entries.length),1).setUsage(THREE.DynamicDrawUsage),make=source=>{const g=shareGeometry36(source);g.setAttribute('treeViewHidden',mask);return g;};
  const lods=trunk?[make(branchCylinder104()),null,null]:[0,1,2].map(l=>make(bough104(species,l)));if(trunk)lods[1]=lods[2]=lods[0];const id=species+'-'+trunk;if(!materials.has(id)){materials.set(id,treeMaterial104(species,trunk));depths.set(id,treeMaterial104(species,trunk,null,true));}
  const o=new THREE.InstancedMesh(lods[0],materials.get(id),entries.length);o.name='Modeled '+(trunk?'connected branches':'botanical crown')+' '+species;o.userData={forest:true,forestKind:trunk?'trunk':'canopy30',center,entries,nativeLods30:lods,treeViewMask:mask,fullGeometry:lods[0],farGeometry:lods[1],simpleGeometry:lods[2],botany104:true,species104:species};o.castShadow=o.receiveShadow=true;o.customDepthMaterial=depths.get(id);
  entries.forEach((e,i)=>{o.setMatrixAt(i,e.matrix);e.t.bindings.push({mesh:o,index:i,matrix:e.matrix});});o.onBeforeRender=(r,s,c)=>{forest30.main.value=c===camera?1:0;};o.computeBoundingSphere();o.computeBoundingBox();world.add(o);scenery.forestMeshes.push(o);
 }
 world.userData.solidForestMeshes=scenery.forestMeshes;world.userData.leafCount=scenery.trees.reduce((n,t)=>n+t.crowns.length,0);world.userData.forest30={species:Array.from(new Set(scenery.trees.map(t=>t.species30))).sort(),trees:scenery.trees.length,clusters:world.userData.leafCount,batches:scenery.forestMeshes.length,modeled104:true};
};
// Battle groves use exactly the same anatomy, material response and wind as
// the local forest, grouped by species instead of mixing their leaf shapes.
flushPoiTrees89=function(b){const rows=b.nativeTrees89;if(!rows)return;
 for(const trunk of[true,false]){const bySpecies=new Map();for(const row of trunk?rows.trunks:rows.leaves){if(!bySpecies.has(row.species))bySpecies.set(row.species,[]);bySpecies.get(row.species).push(row);}
  for(const [species,list]of bySpecies){const g=geometry59((trunk?branchCylinder104():bough104(species,b.mobile?1:0)).clone());g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(list.length),1));const m=material59(treeMaterial104(species,trunk,b)),o=new THREE.InstancedMesh(g,m,list.length);list.forEach((r,i)=>o.setMatrixAt(i,r.matrix));o.castShadow=o.receiveShadow=true;o.customDepthMaterial=material59(treeMaterial104(species,trunk,b,true));o.name=trunk?'POI native connected trunks':'POI native botanical canopy';o.userData.botany104=true;o.onBeforeRender=(r,s,c)=>{forest30.main.value=c===camera?1:0;};o.computeBoundingSphere();o.computeBoundingBox();b.group.add(o);b.counts.instances+=list.length;b.counts.batches++;}
 }
 b.modeledBotany104=true;
};
const forestBudgetBefore104=updateRenderBudget;
updateRenderBudget=function(...args){const r=forestBudgetBefore104(...args);if(!player||!world)return r;const phone=matchMedia('(pointer:coarse)').matches;for(const o of scenery.forestMeshes){if(!o.userData.botany104||o.userData.forestKind==='trunk')continue;const d=Math.hypot(o.userData.center.x-player.x,o.userData.center.z-player.z);o.geometry=o.userData.nativeLods30[d<(phone?22:42)?0:d<(phone?62:100)?1:2];}return r;};
// Even the distant continent crowns are small 3D shoots. Their leaf area is
// increased at lower detail to retain the silhouette without alpha billboards.
buildOverworldForestLod26=function(){
 const group=new THREE.Group(),bins=new Map();group.name='Modeled distant woodland';for(const t of scenery.trees){const species=t.species30??0;if(!bins.has(species))bins.set(species,[]);bins.get(species).push(t);}
 for(const [species,trees]of bins){const g=shareGeometry36(bough104(species,2));g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(trees.length),1));const m=treeMaterial104(species),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.vertexShader=s.vertexShader.replace('#include <project_vertex>','vec3 farRoot104=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;transformed*=smoothstep(180.,240.,distance(cameraPosition.xz,farRoot104.xz));\n#include <project_vertex>');};m.customProgramCacheKey=()=>key+'-distant104';
  const o=new THREE.InstancedMesh(g,m,trees.length),d=new THREE.Object3D();trees.forEach((t,i)=>{d.position.set(t.x,t.y+t.h*.72,t.z);d.scale.set(t.scale*2.65,t.scale*1.65,t.scale*2.65);d.rotation.y=t.x*.19+t.z*.21;d.updateMatrix();o.setMatrixAt(i,d.matrix);});o.onBeforeRender=()=>{forest30.main.value=0;};o.castShadow=false;o.receiveShadow=true;o.userData={distantScenery26:true,botany104:true};o.computeBoundingSphere();group.add(o);
 }
 world.userData.landscape26.group.add(group);world.userData.overworldForestLod26=group;
};
// Older retained/background builders enter through these factories directly.
// Keep their matrices and spatial batches, but remove their photographic leaf
// cards as well. Fine foliage remains exclusive to the close tree renderer.
const backgroundForestGeometry104=forestGeometry;
forestGeometry=function(kind){return kind==='trunk'?branchCylinder104():kind==='oak'?bough104(0,2):kind==='pine'?bough104(4,2):backgroundForestGeometry104(kind);};
sprayGeometry30=()=>bough104(0,2);
forestMaterial30=trunk=>treeMaterial104(0,!!trunk);
forestDepth30=()=>treeMaterial104(0,false,null,true);

// Retained perimeter crowns used smaller photographic sprays. Their old
// occlusion boxes must grow with the replacement modeled leaves and branches.
const botanicalBoundsBefore104=finishWorld102;
finishWorld102=function(...a){const r=botanicalBoundsBefore104(...a);if(!['poi','overworld'].includes(activeScene.kind)||world.userData.botanicalBounds104)return r;
 const stem=branchCylinder104();stem.computeBoundingBox();for(const t of scenery.trees){const species=t.tree104?t.species30??0:0,leaves=bough104(species,t.tree104?0:2);leaves.computeBoundingBox();t.cover30=[];t.box=new THREE.Box3();
  for(const [rows,source]of [[t.trunks??[],stem],[t.crowns??[],leaves]])for(const matrix of rows){const box=source.boundingBox.clone().applyMatrix4(matrix).expandByScalar(.13);t.cover30.push(box);t.box.union(box);}
  for(const bind of t.bindings??[]){const mask=bind.mesh.userData.treeViewMask;if(mask){mask.setX(bind.index,t.hidden?1:0);mask.needsUpdate=true;}}
 }treeCutCache30=null;world.userData.botanicalBounds104=true;return r;};

// Exploration visibility is owned by the player silhouette. Keep every crown
// intact in colour, shadow and reflection views; do not clear whole trees.
