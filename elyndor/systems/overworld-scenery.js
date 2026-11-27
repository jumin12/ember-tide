// Whole miniature trees retain their silhouette at travel distance. Native
// bark/lamina textures, opaque PBR surfaces and wind still light the geometry;
// local POIs and battle trees keep their close botanical models.
function travelTreeGeometry157(species=0,variant=0,lod=0){
 const key=`travel-tree160-${species}-${variant}-${lod}`;if(sharedGeo[key])return sharedGeo[key];
 const pine=species===4,birch=species===1,willow=species===3,form=variant%3,H=pine?7.8:7.0,rng=seeded(157313+species*937+variant*419),pos=[],uv=[],colors=[],skin=[],phase=[],kind=[],index=[];
 const put=(p,u,v,leaf=1,tone=1)=>{pos.push(...p.toArray());uv.push(u,v);colors.push(tone,tone,leaf?tone*.97:tone*.95);skin.push(leaf);phase.push(rng());kind.push(leaf?0:1)};
 const tube=(a,b,r0,r1,n=lod===2?5:8)=>{const axis=b.clone().sub(a).normalize(),right=V3().crossVectors(axis,Math.abs(axis.y)>.92?V3(1,0,0):V3(0,1,0)).normalize(),side=V3().crossVectors(axis,right).normalize(),base=pos.length/3;
  for(const[p,r]of[[a,r0],[b,r1]])for(let j=0;j<n;j++){const t=j/n*TAU;put(p.clone().addScaledVector(right,Math.cos(t)*r).addScaledVector(side,Math.sin(t)*r),j/n,p.y*.45,0,.9)}
  for(let j=0;j<n;j++){const k=(j+1)%n;index.push(base+j,base+k,base+n+j,base+k,base+n+k,base+n+j)}
 };
 const lean=(form===2?.55:form===1?.12:-.18)*(birch?.7:1),stem=t=>V3(lean*t*t,H*t,Math.sin(t*2+variant)*.14*t),sections=lod===2?3:5;
 for(let i=0;i<sections;i++)tube(stem(i/sections),stem((i+1)/sections),(.23-i/sections*.17)*(birch?.72:1),(.23-(i+1)/sections*.17)*(birch?.72:1));
 for(let j=0;j<3;j++){const a=j*TAU/3+variant;tube(V3(Math.cos(a)*.38,-.045,Math.sin(a)*.38),stem(.10),.055,.10,5)}
 const shell=(center,width,height,seed,conifer=false)=>{
  const leaves=lod===0?60:lod===1?34:12,steps=lod===2?2:3;
  for(let leaf=0;leaf<leaves;leaf++){
   const f=(leaf+.5)/leaves,a=leaf*2.399963+seed,level=conifer?f:(f-.5),reach=width*(conifer?1-f*.73:Math.sqrt(Math.max(.08,1-Math.pow(f*2-1,2))))*(.53+rng()*.35),branch=center.clone().add(V3(Math.cos(a)*reach*.68,level*height*.68,Math.sin(a)*reach*.68));
   const outward=V3(Math.cos(a),conifer?.35:.10+(rng()-.5)*.9,Math.sin(a)).normalize(),right=V3().crossVectors(outward,V3(0,1,0)).normalize(),up=V3().crossVectors(right,outward).normalize(),coverage=lod===0?1.16:lod===1?1.49:2.04,len=(conifer?.72:.79)*coverage*(.84+rng()*.30),w=(conifer?.24:.29)*coverage;
   tube(center,branch,.014,.005,3);
   const base=pos.length/3;
   for(let row=0;row<=steps;row++){const t=row/steps,mid=branch.clone().addScaledVector(outward,len*t).addScaledVector(up,Math.sin(t*Math.PI)*len*.22),span=w*Math.pow(Math.sin(t*Math.PI),.65);
    for(const side of[-1,0,1])put(mid.clone().addScaledVector(right,side*span).addScaledVector(up,-Math.abs(side)*Math.sin(t*Math.PI)*len*.09),(side+1)*.5,t,1,.67+.22*f+.12*t+rng()*.09);
   }
   for(let row=0;row<steps;row++)for(let j=0;j<2;j++){const q=base+row*3+j;index.push(q,q+1,q+3,q+1,q+4,q+3)}
  }
 };
 if(pine){
  const tiers=form===1?8:form===2?6:7;
  for(let j=0;j<tiers;j++){const t=j/(tiers-1),y=(form===1?1.45:.95)+t*(form===1?5.3:5.7),reach=(2.12-t*1.70)*(form===1?.74:form===2?1.1:1)*(1+Math.sin(j*2+variant)*.14),center=stem(y/H).add(V3(Math.sin(j*1.7)*.10*(1-t),0,Math.sin(j*2.1+variant)*.13));
   tube(stem((y+.12)/H),center,.055*(1-t*.7),.03,5);shell(center,reach,1.22+.13*(1-t),j*.81+variant,true);
   if(lod<2)for(let branch=0;branch<3;branch++){const a=branch*TAU/3+j*.93;tube(center,center.clone().add(V3(Math.cos(a)*reach*.74,.30,Math.sin(a)*reach*.74)),.045*(1-t*.75),.018,5)}
  }
 }else{
  const count=form===1?4:form===2?6:5;
  for(let j=0;j<count;j++){const shape=seeded(160019+species*197+variant*31+j*997),a=j*2.399963+variant*.83+(shape()-.5)*.40,y=(form===1?3.80:form===2?3.05:3.35)+(j/(count-1))*1.92+(shape()-.5)*.28,reach=(form===1?.72:form===2?1.65:1.25)*(birch?.78:willow?1.15:1)*(.78+shape()*.36),center=V3(Math.cos(a)*reach+lean*.6,y+.55,Math.sin(a)*reach);
   tube(stem(.37+j*.060),center,birch?.075:.11,.035,lod===2?5:7);
   shell(center,(form===1?1.12:form===2?1.75:1.55)*(birch?.82:willow?1.12:1),(form===1?2.12:form===2?1.75:1.90)*(willow?1.17:1),j*.91+variant);
  }
  shell(stem(form===1?.9:.84),form===1?.95:birch?1.20:1.45,birch?2.7:2.4,variant+5.3);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('leafSurface104',new THREE.Float32BufferAttribute(skin,1));g.setAttribute('leafPhase104',new THREE.Float32BufferAttribute(phase,1));g.setAttribute('treeKind',new THREE.Float32BufferAttribute(kind,1));g.setIndex(index);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.boundingSphere.radius+=.18;
 g.userData={travelTree157:true,species,variant,lod,height:H,form160:['broad','slender','windswept'][form],opaque:true,triangles:index.length/3};return sharedGeo[key]=g;
}

const travelForestBefore157=buildSolidForest;
function rootedTravelMaterial157(m){
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...args){before.call(this,s,...args);
  s.vertexShader=s.vertexShader.replace('gust104*windPower104*flex104;','gust104*windPower104*flex104*uv.y;').replace('windPower104*leafSurface104*flex104;','windPower104*leafSurface104*flex104*uv.y;');
  if(!m.isMeshDepthMaterial)s.fragmentShader=s.fragmentShader.replace('vec3 leafArt104=leafTint104*veinTone104;',`
   float fold=vMapUv.x-.5,aa=fwidth(vMapUv.x);
   float midrib=1.-smoothstep(.025,.10+aa,abs(fold));
   float shoulders=1.-smoothstep(.31,.51,abs(fold));
   float pigment=.84+.18*shoulders+.13*midrib+.12*fold;
   vec3 leafArt104=leafTint104*pigment*mix(.83,1.19,smoothstep(.035,.24,dot(veinArt104,vec3(.21,.72,.07))));`);
 };m.customProgramCacheKey=()=>key+'-rooted-travel157';return m;
}
buildSolidForest=function(...args){
 if(activeScene?.kind!=='overworld')return travelForestBefore157(...args);
 scenery.trees=[...new Set([...(world.userData.solidTrees??[]),...(world.userData.boundaryTrees50??[])])];scenery.forestMeshes=[];world.userData.treePoints=scenery.trees.map(t=>V3(t.x,t.y,t.z));
 const bins=new Map(),materials=new Map(),depths=new Map(),cell=64;let oldInstances=0;
 for(const t of scenery.trees){
  const species=t.species30??0,variant=Math.abs(Math.floor(t.x*13+t.z*17))%3,H=species===4?7.8:7;
  const style=valenneTreeStyle(t),tile=style?cell*1.5:cell;
  const key=[Math.floor(t.x/tile),Math.floor(t.z/tile),style??species,style?0:variant].join(',');
  const seed=n=>{const v=Math.sin(t.x*127.1+t.z*311.7+n)*43758.5453;return v-Math.floor(v)},sx=.79+seed(17)*.46,sz=style?sx:.84+seed(43)*.34,sy=.80+seed(71)*.40;
  const matrix=new THREE.Matrix4().compose(V3(t.x,t.y,t.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),Math.sin(t.x*31+t.z*17)*TAU),V3(t.scale*sx,t.h/(style?7:H)*sy,t.scale*sz));t.growth160=[sx,sy,sz];
  if(!bins.has(key))bins.set(key,{species,style,variant,H,center:V3(Math.floor(t.x/tile)*tile+tile/2,t.y,Math.floor(t.z/tile)*tile+tile/2),rows:[]});bins.get(key).rows.push({t,matrix,style});oldInstances+=(t.trunks?.length??0)+(t.crowns?.length??0);t.bindings=[];
 }
 for(const {species,style,variant,H,center,rows}of bins.values()){
  const mask=new THREE.InstancedBufferAttribute(new Float32Array(rows.length),1).setUsage(THREE.DynamicDrawUsage),lods=[0,1,2].map(lod=>{const g=shareGeometry36(style?woodlandCrownGeometry(style,lod):travelTreeGeometry157(species,variant,lod));g.setAttribute('treeViewHidden',mask);return g});
  const materialKey=style?'woodland':species;
  if(!materials.has(materialKey)){
   materials.set(materialKey,style?woodlandCrownMaterial():rootedTravelMaterial157(treeMaterial104(species)));
   depths.set(materialKey,style?woodlandCrownMaterial(true):rootedTravelMaterial157(treeMaterial104(species,false,null,true)));
  }
  const o=new THREE.InstancedMesh(lods[0],materials.get(materialKey),rows.length);o.name='Travel woodland '+materialKey;
  o.userData={forest:true,forestKind:'canopy30',center,entries:rows,nativeLods30:lods,treeViewMask:mask,fullGeometry:lods[0],farGeometry:lods[1],simpleGeometry:lods[2],botany104:true,species104:species,travelTree157:true};o.castShadow=o.receiveShadow=true;o.customDepthMaterial=depths.get(materialKey);
  rows.forEach((r,i)=>{o.setMatrixAt(i,r.matrix);o.setColorAt(i,new THREE.Color().setRGB(.92+.07*Math.sin(r.t.x*.17),.96+.04*Math.cos(r.t.z*.14),.93+.05*Math.sin(r.t.x*.11+r.t.z*.13)));r.t.bindings.push({mesh:o,index:i,matrix:r.matrix});r.t.travelMatrix157=r.matrix;r.t.travelVariant157=variant;r.t.travelStyle=r.style});
  o.onBeforeRender=(r,s,c)=>{forest30.main.value=c===camera?1:0};o.computeBoundingBox();o.computeBoundingSphere();world.add(o);scenery.forestMeshes.push(o);
 }
 world.userData.solidForestMeshes=scenery.forestMeshes;world.userData.leafCount=scenery.trees.length;world.userData.forest30={species:[...new Set(scenery.trees.map(t=>t.species30??0))],trees:scenery.trees.length,clusters:scenery.trees.length,batches:scenery.forestMeshes.length,modeled104:true};
 world.userData.woodland157={trees:scenery.trees.length,batches:scenery.forestMeshes.length,oldInstances,newInstances:scenery.trees.length,variants:3,forms160:['broad','slender','windswept'],individualGrowth160:true,opaque:true};
};

// Boundary woodland is authored after the first nature batch. Reuse its exact
// tree descriptors and retire its separate old branch draws, without changing
// the traversable boundary field, tree locations or any collision rule.
const travelBoundaryBefore157=buildBoundary46;
buildBoundary46=function(...args){
 const r=travelBoundaryBefore157(...args);if(activeScene?.kind!=='overworld'||world.userData.boundaryWhole157||!world.userData.boundaryTrees50?.length)return r;
 const old=new Set([...scenery.forestMeshes,...world.children.filter(o=>o.userData.boundaryForest50)]),geometries=new Set(),materials=new Set();
 for(const o of old){o.removeFromParent();for(const g of o.userData.nativeLods30??[o.geometry])if(g)geometries.add(g);if(o.material)materials.add(o.material);if(o.customDepthMaterial)materials.add(o.customDepthMaterial);o.dispose?.();}
 for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
 buildSolidForest();world.userData.boundaryWhole157=true;treeCutCache30=null;return r;
};

// Keep visibility/selection bounds attached to the whole native model rather
// than the retired individual boughs, including every wind/LOD extremity.
const travelFinishBefore157=finishWorld102;
finishWorld102=function(...args){
 const r=travelFinishBefore157(...args);if(activeScene?.kind!=='overworld')return r;finishTravelMeadow160();if(world.userData.travelBounds157)return r;
 for(const t of scenery.trees){if(!t.travelMatrix157)continue;const g=t.travelStyle?woodlandCrownGeometry(t.travelStyle,0):travelTreeGeometry157(t.species30??0,t.travelVariant157,0);t.box=g.boundingBox.clone().applyMatrix4(t.travelMatrix157).expandByScalar(.15);t.cover30=[t.box];}
 treeCutCache30=null;world.userData.travelBounds157=true;return r;
};

// A sward has short infill, taller blades and irregular roots spread through
// the patch, rather than eight blades emerging from one tiny central point.
function travelGrassGeometry160(far=false){
 const key='travel-sward160-'+far;if(sharedGeo[key])return sharedGeo[key];
 const blades=far?6:18,segments=far?2:3,rng=seeded(160433),p=[],uv=[],indices=[];
 for(let blade=0;blade<blades;blade++){
  const a=blade*2.399963+rng()*.55,dir=V3(Math.cos(a),0,Math.sin(a)),side=V3(-dir.z,0,dir.x),r=.10+Math.sqrt(rng())*.43,root=V3(dir.x*r,-.465,dir.z*r),short=blade%3===0,h=(short?.27:.44)+rng()*(short?.17:.33),lean=.16+rng()*.29,width=(.027+rng()*.024)*(far?1.50:1),base=p.length/3;
  if(far){
   // A distant blade needs only its curved outline. The scaled width
   // remains visible across the river without drawing subpixel folds.
   for(const [t,s] of [[0,-1],[0,1],[.53,-1],[.53,1],[1,0]]){
    const pt=root.clone().addScaledVector(dir,lean*t*t).addScaledVector(side,s*width*(1-t*.68));
    p.push(pt.x,pt.y+h*(t-.12*t*t),pt.z);uv.push((s+1)*.5,t);
   }
   indices.push(base,base+1,base+2,base+1,base+3,base+2,base+2,base+3,base+4);
   continue;
  }
  for(let j=0;j<=segments;j++){const t=j/segments,center=root.clone().addScaledVector(dir,lean*t*t).add(V3(0,h*(t-.12*t*t),0)),w=width*Math.pow(1-t,.72);
   for(const s of[-1,0,1]){const v=center.clone().addScaledVector(side,s*w).addScaledVector(dir,s===0?Math.sin(t*Math.PI)*.013:0);p.push(...v.toArray());uv.push((s+1)*.5,t);}
  }
  for(let j=0;j<segments;j++)for(let k=0;k<2;k++){const q=base+j*3+k;indices.push(q,q+1,q+3,q+1,q+4,q+3);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.boundingSphere.radius+=.15;g.userData={meadow160:true,blades,segments,opaque:true,folded:true};return sharedGeo[key]=g;
}
function finishTravelGrassGeometry160(){
 // Lush grass is partitioned into its final spatial batches by finishWorld102,
 // after buildPlants. Install the geometry on those retained batches.
 for(const m of world.userData.plantMeshes??[]){
  const kind=m.userData.plantKey;
  if(!['grassBlades','flowers'].includes(kind)||m.userData.meadow160||m.userData.meadowFlowerForm!=null)continue;
  const origin=m.userData.plantOriginal?.find(matrix=>matrix.elements[5]!==0)?.elements;
  const form=origin?Math.min(2,Math.floor(groundNoise104(origin[12]*.13,origin[14]*.13)*4.2)):0;
  const geometry=far=>{
   const source=kind==='flowers'?plantSculpt103(kind,far,form):travelGrassGeometry160(far),g=shareGeometry36(source);
   g.userData={...source.userData};world.userData.botanicalOwned30??=new Set();world.userData.botanicalOwned30.add(g);return g;
  };
  const old=new Set([m.geometry,m.userData.detailedGeometry,m.userData.distantGeometry]);m.geometry=m.userData.detailedGeometry=geometry(false);m.userData.distantGeometry=geometry(true);
  if(kind==='flowers')m.userData.meadowFlowerForm=form;else m.userData.meadow160=true;
  m.computeBoundingBox();m.computeBoundingSphere();for(const g of old)g?.dispose();
 }
}
function finishTravelMeadow160(){
 if(world.userData.meadow160||window.__captureVegetation64)return;
 finishTravelGrassGeometry160();
 const start=performance.now(),sample=terrainSampler64().sample,slopes=new Map(),courts=[...dioramas67.sites.values()],position=V3(),scale=V3(),rotation=new THREE.Quaternion(),tilt=new THREE.Quaternion(),up=V3(0,1,0),normal=V3(),lift=V3(),colour=new THREE.Color(),materials=new Set(),stats={instances:0,rooted:0,cleared:0,edgeFit:0,addedInstances:0,batches:0};
 for(const im of world.userData.plantMeshes??[]){if(!im.userData.meadow160)continue;stats.batches++;materials.add(im.material);
  for(let i=0;i<im.userData.plantOriginal.length;i++){
   const matrix=im.userData.plantOriginal[i];scale.setFromMatrixScale(matrix);stats.instances++;if(scale.y<.00001)continue;const e=matrix.elements,x=e[12],y=e[13],z=e[14],cx=Math.round(x/4)*4,cz=Math.round(z/4)*4,key=cx+','+cz;
   let slope=slopes.get(key);if(!slope){slope=[(sample(cx+2,cz)-sample(cx-2,cz))/4,(sample(cx,cz+2)-sample(cx,cz-2))/4];slopes.set(key,slope);}
   const climate=climateAt105(x,z),road=macroRoadInfo15(x,z).d,mouth=mouthSample109(x,z);let available=road-2.5;
   if(traversalShoreCells.has(Math.floor(x/24)+','+Math.floor(z/24)))available=Math.min(available,traversalShoreDistance(x,z)-.35);
   if(mouth)available=Math.min(available,mouth.v-mouth.width-.35);
   for(const q of courts){const dx=x-q.x,dz=z-q.z;if(Math.abs(dx)>q.w+5||Math.abs(dz)>q.d+5)continue;const c=Math.cos(q.a),s=Math.sin(q.a),lx=dx*c-dz*s,lz=dx*s+dz*c;available=Math.min(available,Math.hypot(Math.max(0,Math.abs(lx)-q.w/2),Math.max(0,Math.abs(lz)-q.d/2))-.6);}
   const remove=available<.35||Math.hypot(...slope)>.55||Math.max(...climate)>.65||traversalWet(x,z);
   if(remove){matrix.makeScale(0,0,0);matrix.setPosition(x,y,z);im.setMatrixAt(i,matrix);stats.cleared++;continue;}
   const radius=Math.max(scale.x,scale.z)*1.02;if(radius>available){const fit=available/radius;scale.x*=fit;scale.z*=fit;stats.edgeFit++;}
   matrix.decompose(position,rotation,lift);normal.set(-slope[0],1,-slope[1]).normalize();tilt.setFromUnitVectors(up,normal);rotation.premultiply(tilt);
   lift.set(0,.465*scale.y,0).applyQuaternion(rotation);position.set(x,sample(x,z)-.035,z).add(lift);matrix.compose(position,rotation,scale);im.setMatrixAt(i,matrix);stats.rooted++;
   const tone=(Math.sin(x*.13+Math.cos(z*.08))*.5+.5)*(.72+.28*Math.cos(z*.11));colour.setRGB(.87+tone*.16,.93+tone*.13,.84+tone*.16);im.setColorAt(i,colour);
  }
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingBox();im.computeBoundingSphere();
 }
 for(const m of materials)m.needsUpdate=true;stats.slopeCells=slopes.size;stats.milliseconds=performance.now()-start;world.userData.meadow160=stats;
 seedTravelWildflowers(sample);
}

function seedTravelWildflowers(ground){
 const plots=new Map(),cover=world.userData.plantMeshes??[];
 const material=cover.find(m=>m.userData.plantKey==='flowers')?.material;
 if(!material)return;
 const up=V3(0,1,0),yaw=new THREE.Quaternion(),scale=V3(),spot=V3();
 const rng=seeded(52039),counts=[0,0,0];
 for(const patch of cover){
  if(!patch.userData.meadow160)continue;
  for(const turf of patch.userData.plantOriginal){
   const e=turf.elements,x=e[12],z=e[14];
   // These roots have already passed the checks for roads, water, courts and slopes.
   if(e[5]<.001||rng()>.12)continue;
   const pocket=groundNoise104(x*.15+18,z*.15-7);
   if(pocket<.46)continue;
   const mix=groundNoise104(x*.062-3,z*.062+8)+(rng()-.5)*.20;
   const form=mix<.42?0:mix<.60?1:2;
   const key=[Math.floor(x/48),Math.floor(z/48),form].join(',');
   if(!plots.has(key))plots.set(key,{form,rows:[]});
   const size=1.18+.74*rng(),width=size*(.83+.28*rng());
   spot.set(x,ground(x,z)+.465*size-.026,z);
   plots.get(key).rows.push(new THREE.Matrix4().compose(spot,yaw.setFromAxisAngle(up,rng()*TAU),scale.set(width,size,width)));
   counts[form]++;
  }
 }
 for(const {form,rows} of plots.values()){
  const mesh=new THREE.InstancedMesh(plantSculpt103('flowers',true,form),material,rows.length);
  rows.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.name='Valenne meadow flowers';
  mesh.receiveShadow=true;mesh.computeBoundingSphere();world.add(mesh);
 }
 world.userData.travelFlowerPatches=counts;
}

// A second legacy far layer drew isolated old boughs over the full trees.
// The same spatially culled whole-tree LODs now supply the distant silhouette.
const travelFarBefore157=buildOverworldForestLod26;
buildOverworldForestLod26=function(...args){if(activeScene?.kind!=='overworld')return travelFarBefore157(...args);const g=new THREE.Group();g.name='Travel woodland uses shared whole-tree LODs';world.userData.landscape26.group.add(g);world.userData.overworldForestLod26=g;};
const travelBudgetBefore157=updateRenderBudget;
updateRenderBudget=function(...args){
 const r=travelBudgetBefore157(...args);if(activeScene?.kind!=='overworld'||!player)return r;
 const previous=world.userData.travelBudget157,run=performance106.budgetRuns;if(previous?.run===run&&!args[0])return r;
 const phone=touchDevice33(),range=phone?300:430,shadowRange=phone?110:160;
 // Batches can span both banks of a river. Measure the closest occupied
 // edge so the trees and grass at our feet do not inherit the far-bank LOD.
 // Camera pans and close inspections can look well away from the party.
 const focus=battle||encounter53.active?player:cameraTarget;
 const fieldRadius=camera.position.distanceTo(cameraTarget)*Math.tan(camera.fov*Math.PI/360);
 const centerWeight=mix(.18,.52,smooth(10,23,fieldRadius));
 function distanceToBatch(o){
  const b=o.boundingBox;
  if(!b)return Math.hypot(o.userData.center.x-focus.x,o.userData.center.z-focus.z);
  return Math.hypot(Math.max(0,b.min.x-focus.x,focus.x-b.max.x),Math.max(0,b.min.z-focus.z,focus.z-b.max.z));
 }
 for(const o of scenery.forestMeshes)if(o.userData.travelTree157){
  const d=distanceToBatch(o),lod=o.userData.nativeLods30;
  o.visible=d<range;o.castShadow=o.visible&&d<shadowRange;
  const b=o.boundingBox;
  const middle=b?Math.hypot((b.min.x+b.max.x)*.5-focus.x,(b.min.z+b.max.z)*.5-focus.z):d;
  const detailDistance=mix(d,middle,centerWeight);
  o.geometry=lod[detailDistance<(phone?19:31)?0:detailDistance<(phone?63:94)?1:2];
 }
 if(!battle&&!encounter53.active)for(const m of perf.plants)if(m.userData.meadow160){
  const d=distanceToBatch(m);
  m.visible=true;m.frustumCulled=true;
  m.geometry=stableDistanceLod33(m,'meadowDetail',d,[phone?16:29],5)===0?m.userData.detailedGeometry:m.userData.distantGeometry;
  m.count=Math.ceil(m.userData.total*(phone?.80:1));
 }
 world.userData.travelBudget157={run,range,shadowRange};return r;
};

// Break large sky reflections into the same flowing surface seen close to the
// river. Fine current ribbons are lit water, not glowing cards or a new layer.
const travelWaterBefore157=waterMaterial62;
waterMaterial62=function(...args){
 const m=travelWaterBefore157(...args);if(activeScene?.kind!=='overworld'||m.userData.travelWater157)return m;m.userData.travelWater157=true;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);
  s.fragmentShader=s.fragmentShader.replace('coverage62*(.22+fresnel62*.55)','coverage62*(.13+fresnel62*.36)');
  s.fragmentShader=s.fragmentShader.replace('gl_FragColor.rgb+=key62*(glint62+skyGlint62)*(cascade62>.5?.15:1.);',`
   gl_FragColor.rgb+=key62*(glint62+skyGlint62)*(cascade62>.5?.15:1.);
   vec2 current157=normalize(flow62+vec2(.0001)),flowUV157=vec2(dot(stream62,current157),dot(stream62,vec2(-current157.y,current157.x)));
   float phase157=flowUV157.x*2.9+sin(flowUV157.y*2.15+flowUV157.x*.45)*1.8+noise62(stream62*1.1)*4.;
   float ribbon157=1.-smoothstep(.10,.10+max(.13,fwidth(phase157)*1.15),abs(sin(phase157)));
   float breaks157=smoothstep(.66,.85,noise62(flowUV157*vec2(.86,1.77)+time62*.018));
   gl_FragColor.rgb+=sky62*ribbon157*breaks157*(.009+day62*.019)*(1.-cloud62*.45)*(cascade62>.5?0.:1.);
  `);
 };m.customProgramCacheKey=()=>key+'-travel-current157';m.needsUpdate=true;return m;
};
