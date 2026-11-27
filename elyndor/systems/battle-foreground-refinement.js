// A final shared quality gate, applied to each of the twenty authored sets.
// Keep the natural details subordinate to the painted landmarks.
localStone125=function(b,x,z,sx,sy,sz,variant=0,key=STAGE_SETS125[encounter53.selected].stone){
 const seed=(variant*13+Math.floor(Math.abs(x*17+z*31)))%24,g=arenaGeometry88(b,'scenic-rock134-'+seed,()=>{const g=riverRock134(seed).clone();g.userData.weathered104=true;return g;}),m=detailedStone105(key,b);
 sy=Math.max(sy,Math.sqrt(sx*sz)*.31);const rotation=new THREE.Quaternion().setFromAxisAngle(axis24,b.rng()*TAU),size=V3(sx,sy,sz);
 const footprint=g.boundingBox.clone().applyMatrix4(new THREE.Matrix4().compose(V3(x,0,z),rotation,size));
 const seat=Math.min(arenaFloor88(b,x,z),arenaFloor88(b,footprint.min.x,z),arenaFloor88(b,footprint.max.x,z),arenaFloor88(b,x,footprint.min.z),arenaFloor88(b,x,footprint.max.z));
 const at=V3(x,seat-sy*.22,z),box=footprint.translate(V3(0,at.y,0));
 if(!supportedRear113(b,x,z,Math.max(sx,sz))||stanceIntersects105(box,fighterStances105(b))||stoneOccludes105(box,b,fighterSightlines105(b)))return;
 arenaInstance88(b,'stage134-'+key+'-'+seed,g,m,at,size,rotation);b.counts.rocks++;
};
const dressBefore134=dressPiece125;
dressPiece125=function(b,kind,p,s){
 const {x,z}=p;
 if(kind==='stalagmites'){
  const m=detailedStone105('rockSlate',b);
  for(let i=0;i<4;i++){
   const a=i*2.399,xx=x+Math.cos(a)*s*.45,zz=z+Math.sin(a)*s*.40,h=s*(.65+(i%3)*.43),r=s*(.22+(i%2)*.055),points=[];
   for(let j=0;j<=18;j++){const t=j/18,bulb=Math.pow(1-t,.63)*(.76+.12*Math.sin(t*13+i));points.push(new THREE.Vector2(j===18?0:r*(bulb+.20*Math.exp(-t*15)),t*h));}
   const g=new THREE.LatheGeometry(points,20),pos=g.attributes.position;
   for(let j=0;j<pos.count;j++){const t=pos.getY(j)/h;pos.setX(j,pos.getX(j)+Math.sin(t*3+i)*r*t*.18);pos.setZ(j,pos.getZ(j)+Math.cos(t*4+i)*r*t*.15);}g.computeVertexNormals();
   referencePiece101(b,'eroded cave flowstone with rounded crown',g,m,V3(xx,arenaFloor88(b,xx,zz)-.035,zz));
  }return;
 }
 return dressBefore134(b,kind,p,s);
};
function cleanForeground134(b){
 if(b.foreground134)return;const stats={stage:encounter53.selected,removedPlants:0,removedWaterTriangles:0,stoneFootprints:0},stones=[],matrix=new THREE.Matrix4();
 // The legacy physical river could float as a broad strip over the painted
 // panorama. Keep water only where the actual level has a supported wet bank.
 const water=b.reflect89?.surface;
 if(water){const g=water.geometry,p=g.attributes.position,idx=g.index,indices=[],limit=idx?idx.count:p.count;
  for(let i=0;i<limit;i+=3){const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j),x=ids.reduce((a,j)=>a+p.getX(j),0)/3,z=ids.reduce((a,j)=>a+p.getZ(j),0)/3,y=ids.reduce((a,j)=>a+p.getY(j),0)/3;
   if(supportedRear113(b,x,z,.1)&&arenaFloor88(b,x,z)<y+.06)indices.push(...ids);else stats.removedWaterTriangles++;
  }g.setIndex(indices);water.visible=indices.length>0;b.reflect89.suppressed134=!water.visible;
 }
 // Instance boxes are local to the arena. Reuse the real mineral silhouettes,
 // so grass cannot sprout through the new outcrops or on paving/cave floors.
 for(const o of b.group.children)if(o.isInstancedMesh&&o.material?.userData.weathered104){o.geometry.computeBoundingBox();for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);stones.push(o.geometry.boundingBox.clone().applyMatrix4(matrix).expandByScalar(.08));}}
 stats.stoneFootprints=stones.length;
 for(const o of b.group.children){
  const vegetation=o.material?.userData.realVegetation103;if(!o.isInstancedMesh||!vegetation)continue;let write=0;
  for(let i=0;i<o.count;i++){
   o.getMatrixAt(i,matrix);const e=matrix.elements,x=e[12],z=e[14],blocked=(!HABITATS126[encounter53.selected].cover)||arenaWet89(b,x,z)>.06||stones.some(q=>x>q.min.x&&x<q.max.x&&z>q.min.z&&z<q.max.z);
   if(blocked){stats.removedPlants++;continue;}o.setMatrixAt(write++,matrix);
  }o.count=write;o.instanceMatrix.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();
 }
 b.stoneClearance105=null;clearFighterStones105(b);b.group.updateMatrixWorld(true);b.foreground134=stats;if(stageDepth59.summary)stageDepth59.summary.foreground134=stats;
}
const polishScenesBefore134=buildStageScenery59;
buildStageScenery59=function(...args){const r=polishScenesBefore134(...args),b=arena88.current;if(b?.foreground133)cleanForeground134(b);return r;};
const reflectBefore134=reflectArena89;
reflectArena89=function(b,...args){if(b.reflect89?.suppressed134)return;return reflectBefore134(b,...args);};

// One authored set replaces the three accumulated dressing/planting recipes.
// Coordinates are within the native battle field, so the same composition
// also fits a portrait lens. Each habitat has its own unequal natural groups.
// Architecture and manufactured dressing stay out of the physical battle set.
const STAGING161={
 waterfall:[['wetBank',.07,.59,.74],['ferns',.17,.79,1.12],['mossStones',.92,.81,.53],['ferns',.85,1.02,.72]],
 woodland:[['ferns',.065,.63,1.30],['lowMoss',.10,.88,.61],['ferns',.91,.94,1.20],['ferns',.83,.68,.80]],
 orchard:[['flowers',.12,.92,1.10],['softTufts',.86,.71,1.15],['flowers',.90,1.02,.80]],
 ruins:[],
 cavern:[['stalagmites',.047,.61,.76],['slate',.93,.72,.76],['slate',.11,.98,.49]],
 mountain:[['granite',.055,.63,.88],['talus',.91,.79,.86],['alpineTufts',.13,.97,.95],['talus',.17,.74,.55]],
 snow:[],
 coast:[['chalk',.95,.60,.77],['shorePebbles',.10,.81,.70],['saltTufts',.90,.94,1.20],['saltTufts',.19,.70,.85]],
 royalRoad:[],
 moonlit:[['lowMoss',.06,.61,.58],['ferns',.12,.89,.95],['ferns',.92,.79,1.04]],
 grassMeadow:[['lowMoss',.035,.72,.70],['daisies',.14,.95,1.40],['softTufts',.96,.88,1.40],['daisies',.83,1.04,1.10]],
 grassRiver:[['ferns',.075,.64,1.05],['washedSlab',.93,.71,.62],['riverGravel',.13,.95,.66],['softTufts',.90,.97,1.00]],
 grassFlowers:[['flowerStone',.03,.72,.75],['flowers',.13,.95,1.65],['flowers',.97,.82,1.45],['ferns',.88,1.03,.85]],
 grassDowns:[['chalkSeam',.025,.72,1.10],['heather',.14,.98,1.35],['heather',.97,.85,1.45],['chalkSeam',.90,1.05,.60]],
 grassWindmill:[['softTufts',.10,.72,1.32],['softTufts',.87,.88,1.04]],
 grassAutumn:[['leafLitter',.14,.74,1.60],['rustStone',.94,.78,.52],['leafLitter',.88,1.03,1.45]],
 grassStones:[['heather',.14,.95,1.30],['heather',.86,1.04,1.10]],
 grassHills:[['slateRidge',.025,.66,.80],['hillScree',.11,.94,1.10],['slateRidge',.98,.78,1.10],['alpineTufts',.88,1.04,1.15]],
 grassBirch:[['bluebells',.12,.74,1.36],['rootMoss',.94,.69,.54],['bluebells',.86,.97,1.30]],
 grassTwilight:[['eveningSlab',.058,.69,.68],['violetTufts',.89,.94,1.08],['softTufts',.18,.89,.79]]
};
// Coverage, size of the flowing patch masses, blade height, worn lane width.
const SWARD161={waterfall:[1,4.3,.60,1.1],woodland:[.75,5.7,.48,1.4],orchard:[.70,4.7,.46,2.1],ruins:[0,1,0,0],cavern:[0,1,0,0],mountain:[.38,3.1,.32,1.9],snow:[0,1,0,0],coast:[.40,4.1,.42,2.2],royalRoad:[0,1,0,0],moonlit:[.72,5.6,.50,1.4],grassMeadow:[1.10,6.5,.52,1.1],grassRiver:[.95,5.2,.57,1.3],grassFlowers:[1.05,5.4,.48,1.1],grassDowns:[.70,6.7,.37,1.9],grassWindmill:[.67,5.1,.43,2.2],grassAutumn:[.70,5.3,.43,1.6],grassStones:[.80,4.8,.44,1.5],grassHills:[.58,4.6,.34,1.9],grassBirch:[.95,5.8,.49,1.2],grassTwilight:[.82,5.5,.52,1.4]};
const stagedDressBefore161=dressPiece125,stagedMarginsBefore161=growMargins126,stagedGroupsBefore161=scenicGroups126,stagedForegroundBefore161=polishForeground133;
dressPiece125=function(b,...args){if(!STAGING161[encounter53.selected])return stagedDressBefore161(b,...args);};
growMargins126=function(b,...args){return STAGING161[encounter53.selected]?{grass:0,plants:0,banks:0,deferred161:true}:stagedMarginsBefore161(b,...args);};
scenicGroups126=function(b,...args){return STAGING161[encounter53.selected]?0:stagedGroupsBefore161(b,...args);};
polishForeground133=function(b,...args){if(!STAGING161[encounter53.selected])return stagedForegroundBefore161(b,...args);b.foreground133={stage:encounter53.selected,grass:0,plants:0,pods:[],clearStances:true,deferred161:true};};

// Read the same repeating, warped albedo used by the physical floor. The
// mask follows its turf pockets instead of an unrelated mathematical trail.
const turfStudies161=new WeakMap(),linear161=Float32Array.from({length:256},(_,i)=>{const c=i/255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)});
function turfSampler161(b){
 const ground=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),image=ground.material.map.image;let study=turfStudies161.get(image);
 if(!study){const c=document.createElement('canvas');c.width=c.height=192;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,192,192);study={pixels:ctx.getImageData(0,0,192,192).data,size:192};turfStudies161.set(image,study);}
 const {pixels,size}=study,fract=v=>v-Math.floor(v),channel=(x,y,k)=>linear161[pixels[((y+size)%size*size+(x+size)%size)*4+k]],sample=(u,v,k)=>{const x=fract(u)*size-.5,y=(1-fract(v))*size-.5,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;return mix(mix(channel(ix,iy,k),channel(ix+1,iy,k),fx),mix(channel(ix,iy+1,k),channel(ix+1,iy+1,k),fx),fy);};
 return(x,z)=>{const u=(x+b.group.position.x)*SURFACES132[encounter53.selected],v=(z+b.group.position.z)*SURFACES132[encounter53.selected],wx=groundNoise104(u*.26,v*.26)-.5,wy=groundNoise104(u*.26+19.7,v*.26+19.7)-.5,w=.25+.5*groundNoise104(u*.17+4.9,v*.17+4.9),rgb=[];
  for(let k=0;k<3;k++)rgb[k]=mix(sample(u+wx*.24,v+wy*.24,k),sample(.8*u-.6*v+13.17-wx*.24,.6*u+.8*v+7.83-wy*.24,k),w);
  const[r,g,bl]=rgb,turf=smooth(1.01,1.20,g/Math.max(.001,r))*smooth(1.08,1.38,g/Math.max(.001,bl)),warm=smooth(1.15,1.65,r/Math.max(.001,bl))*smooth(1.05,1.40,g/Math.max(.001,bl));
  // Woodland leaf mould and dry alpine soil support short growth too. Neutral
  // mineral colours still fail this test, and the worn lane remains sparse.
  const olive=(1-smooth(1.03,1.26,r/Math.max(.001,g)))*smooth(1.18,1.65,g/Math.max(.001,bl));
  return b.spec.autumn?warm:Math.max(turf,encounter53.selected==='coast'?olive*.86:0,['woodland','mountain','orchard'].includes(encounter53.selected)?warm*(b.spec.dense?.67:.58):0);
 };
}
function stagedFootprint161(kind,size){
 const scatter=/wetBank|mossStones|talus|hillScree|riverGravel|shorePebbles/.test(kind);
 return{rx:Math.max(.45,size*(scatter?1.65:1.25)),rz:Math.max(.40,size*(scatter?1.25:.95)),height:Math.max(.5,size*1.1)};
}
function stageObjects161(b,stats){
 const occupied=[],field=battlefieldFootprint(b.group),stances=field.homes,lines=fighterSightlines105(b);b.queries126={stances,lines};b.authoring101=true;b.nativeTrees89={trunks:[],leaves:[]};
 for(const[kind,u,v,baseSize]of STAGING161[encounter53.selected]){
  const size=baseSize*.64,shape=stagedFootprint161(kind,size),side=u<.5?-1:1;
  const baseX=field.x+(u-.5)*2*(field.w+11);let accepted;
  for(const shift of [0,2.4,-2.2,4.6]){
   const x=baseX+side*shift,z=apronEdge113(b,x)+Math.max(shape.rx,shape.rz)+.95+.55*v;
   const y=arenaFloor88(b,x,z),box=new THREE.Box3(V3(x-shape.rx,y-.08,z-shape.rz),V3(x+shape.rx,y+shape.height,z+shape.rz));
   if(!onDistantBattleBank(field,box.min.x,box.max.x,box.max.z)||!supportedRear113(b,x,z,Math.max(shape.rx,shape.rz))||arenaWet89(b,x,z)>.05||stoneOccludes105(box,b,lines)||occupied.some(q=>Math.abs(x-q.x)<shape.rx+q.rx+.35&&Math.abs(z-q.z)<shape.rz+q.rz+.35))continue;
   // Low scenery rests on one bank rather than straddling a hollow.
   const heights=[[-shape.rx,0],[shape.rx,0],[0,-shape.rz],[0,shape.rz]].map(([xx,zz])=>arenaFloor88(b,x+xx,z+zz));if(Math.max(...heights)-Math.min(...heights)>.45)continue;
   accepted={kind,x,z,size,...shape};break;
  }
  if(!accepted){stats.skippedProps++;continue;}stagedDressBefore161(b,kind,V3(accepted.x,arenaFloor88(b,accepted.x,accepted.z),accepted.z),size);occupied.push(accepted);
 }
 b.authoring101=false;flushReference101(b);flushPoiTrees89(b);flushBefore89(b);b.batches.clear();stats.placements=occupied;b.identity125.placements=occupied;b.foreground133.pods=occupied;
 return occupied;
}

function battleGrassGeometry(mobile){
 const blades=mobile?6:11,segments=mobile?2:3,positions=[],uvs=[],indices=[],random=seeded(162217);
 for(let blade=0;blade<blades;blade++){
  const angle=blade*2.399963+random()*.55;
  const direction=V3(Math.cos(angle),0,Math.sin(angle));
  const across=V3(-direction.z,0,direction.x);
  // Offset three runners within the tuft. Short emerging blades share a
  // root with the arching outer leaves instead of forming an upright comb.
  const runner=blade%3,root=V3(Math.cos(runner*2.4)*.12,0,Math.sin(runner*2.4)*.15)
   .addScaledVector(direction,.02+random()*.085);
  const height=(runner===0?.25:.36)+random()*.31,lean=.13+random()*.23,width=.015+random()*.015;
  const start=positions.length/3;
  for(let segment=0;segment<=segments;segment++){
   const t=segment/segments,mid=root.clone().addScaledVector(direction,lean*t*t);
   mid.y=height*(t-(runner===2?.34:.12)*t*t);
   for(const side of[-1,0,1]){
    const vertex=mid.clone().addScaledVector(across,side*width*Math.pow(1-t,.8));
    if(side===0)vertex.addScaledVector(direction,Math.sin(t*Math.PI)*.012);
    positions.push(vertex.x,vertex.y,vertex.z);uvs.push((side+1)*.5,t);
   }
  }
  for(let j=0;j<segments;j++)for(let k=0;k<2;k++){
   const i=start+j*3+k;indices.push(i,i+1,i+3,i+1,i+4,i+3);
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geometry.setIndex(indices);geometry.computeVertexNormals();
 return geometry;
}
function gradeBattleGroundEdge(b,stage){
 const [swatchRow,width]=BATTLE_GROUND_JOINS[stage];
 const floor=b.group.children.find(o=>o.name==='Actual level ground and carved water banks');
 const material=floor?.material;
 if(!material?.userData.surface132)return;
 // Average contact colours across the plate. Transfer only the broad light
 // and hue at the join. Stonework and water never project onto the floor.
 const canvas=document.createElement('canvas');canvas.width=144;canvas.height=8;
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),image=b.plate90.image;
 // The lower band is painted ground on each plate, even if the camera
 // sees a lake, cliff or masonry on the far side of the join.
 const row=(1-swatchRow)*image.height;
 ctx.drawImage(image,0,row-image.height*.022,image.width,image.height*.044,0,0,144,8);
 const pixels=ctx.getImageData(0,0,144,8).data;
 // Convert the plate's linear display colour to the working lighting space.
 const sceneLight=value=>{
  const color=clamp(value,.0001,.97),a=2.51-2.43*color,b=.03-.59*color;
  return (-b+Math.sqrt(b*b+.56*a*color))/(2*a);
 };
 const swatches=Array.from({length:18},(_,strip)=>{
  const color=V3();
  for(let y=0;y<8;y++)for(let x=strip*8;x<(strip+1)*8;x++){
   const i=(y*144+x)*4;color.x+=linear161[pixels[i]];color.y+=linear161[pixels[i+1]];color.z+=linear161[pixels[i+2]];
  }
  return V3(sceneLight(color.x/64),sceneLight(color.y/64),sceneLight(color.z/64));
 });
 const positions=floor.geometry.attributes.position,contacts=new Float32Array(positions.count*4);
 // Sample only the land below the calibrated join. Low-pass filtering removes
 // painted stones and foliage but keeps the broad pattern of light on the path.
 // Sample both sides of the curved contact line. At the sides of a bank
 // the reference camera can see a different strip of ground than at centre.
 const cols=80,rows=32,upper=Math.min(.96,swatchRow+.055),lower=Math.max(.015,swatchRow-.29);
 canvas.width=cols;canvas.height=rows;ctx.imageSmoothingQuality='high';
 ctx.drawImage(image,0,(1-upper)*image.height,image.width,(upper-lower)*image.height,0,0,cols,rows);
 const patch=ctx.getImageData(0,0,cols,rows).data,groundPaint=[];
 for(let i=0;i<patch.length;i+=4){
  groundPaint.push(V3(...[i,i+1,i+2].map(k=>sceneLight(linear161[patch[k]]))));
 }
 const wash=new Float32Array(positions.count*4),paint=V3(),nextRow=V3();
 // Carry broad pools of light and shade from the painted bank into the
 // clearing. Work in world space so the light stays put during a camera move.
 const lightField=new Float32Array(positions.count*3),average=V3();
 for(const swatch of swatches)average.add(swatch);
 average.divideScalar(swatches.length);
 const luminance=c=>c.x*.2126+c.y*.7152+c.z*.0722,meanLight=Math.max(.012,luminance(average));
 const broad=swatches.map((s,i)=>s.clone().multiplyScalar(.46)
  .addScaledVector(swatches[Math.max(0,i-1)],.21).addScaledVector(swatches[Math.min(17,i+1)],.21)
  .addScaledVector(swatches[Math.max(0,i-2)],.06).addScaledVector(swatches[Math.min(17,i+2)],.06));
 const worldPoint=V3(),sample=V3(),channels=['x','y','z'];
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),z=positions.getZ(i);
  const depth=z-apronEdge113(b,x);
  worldPoint.fromBufferAttribute(positions,i).add(b.group.position).project(b.reference90);
  const u=clamp(worldPoint.x*.5*b.crop90.x,-.5,.5);
  const fit=b.plateFit97.value;
  const source=.5+u/(fit+(1-fit)*4*u*u);
  const strip=clamp(source*swatches.length-.5,0,swatches.length-1),low=Math.floor(strip),fraction=strip-low;
  const rawV=(worldPoint.y*.5+.5-b.window90.x)/b.window90.y;
  const px=clamp(source*cols-.5,0,cols-1),py=clamp((upper-rawV)/(upper-lower)*rows-.5,0,rows-1);
  const x0=Math.floor(px),x1=Math.min(x0+1,cols-1),y0=Math.floor(py)*cols,y1=Math.min(Math.floor(py)+1,rows-1)*cols;
  paint.copy(groundPaint[y0+x0]).lerp(groundPaint[y0+x1],px-x0);
  nextRow.copy(groundPaint[y1+x0]).lerp(groundPaint[y1+x1],px-x0);
  paint.lerp(nextRow,py-Math.floor(py));paint.toArray(wash,i*4);
  wash[i*4+3]=mix(.76,.20,smooth(width*.45,width+14,Math.max(0,depth)));
  const fade=1.-.60*smooth(4,32,Math.max(0,depth));
  sample.copy(broad[low]).lerp(broad[Math.min(low+1,broad.length-1)],fraction);
  const localLight=Math.max(.008,luminance(sample)),gain=clamp(Math.sqrt(localLight/meanLight),.64,1.27);
  for(let j=0;j<3;j++){
   const channel=channels[j];
   const hue=(sample[channel]/localLight)/Math.max(.12,average[channel]/meanLight);
   lightField[i*3+j]=mix(1,gain*clamp(hue,.82,1.19),fade*.76);
  }
  if(depth>=width+2||depth<-.12)continue;
  const weight=(1-smooth(.3,width+2,depth))*.89;
  // Match the local landing and its light pools. The broad swatch just
  // stabilizes the darkest samples; the terrain still supplies its grain.
  nextRow.copy(paint).lerp(sample,.09).multiplyScalar(weight).toArray(contacts,i*4);contacts[i*4+3]=weight;
 }
 floor.geometry.setAttribute('groundContact',new THREE.BufferAttribute(contacts,4));
 floor.geometry.setAttribute('bankLight',new THREE.BufferAttribute(lightField,3));
 floor.geometry.setAttribute('bankWash',new THREE.BufferAttribute(wash,4));
 const baseColor=stageAverage59(material.map);
 const meanPigment=Math.max(.025,.2126*baseColor.r+.7152*baseColor.g+.0722*baseColor.b);
 const compile=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
 material.onBeforeCompile=function(shader,...args){
  compile.call(this,shader,...args);
  shader.uniforms.meanGroundPigment={value:meanPigment};
  shader.vertexShader='attribute vec4 groundContact,bankWash;attribute vec3 bankLight;varying vec3 fieldLight;varying vec4 contactColor,groundWash;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncontactColor=groundContact;fieldLight=bankLight;groundWash=bankWash;');
  shader.fragmentShader='uniform float meanGroundPigment;varying vec3 fieldLight;varying vec4 contactColor,groundWash;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   float bankSun=1.;
   #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    if(receiveShadow&&contactColor.a>.001){
     bankSun=getShadow(directionalShadowMap[0],directionalLightShadows[0].shadowMapSize,
      directionalLightShadows[0].shadowBias,directionalLightShadows[0].shadowRadius,vDirectionalShadowCoord[0]);
    }
   #endif
   float textureDetail=clamp(1.+(relief132/meanGroundPigment-1.)*.24,.78,1.27);
   vec3 lumaBank=vec3(.2126,.7152,.0722);
   float targetLum=max(.004,dot(groundWash.rgb,lumaBank)),litLum=max(.004,dot(outgoingLight,lumaBank));
   vec3 hue=clamp(groundWash.rgb/targetLum/(outgoingLight/litLum+.016),vec3(.68),vec3(1.40));
   float value=clamp(targetLum*clamp(relief132/meanGroundPigment,.48,1.85)/litLum,.53,1.82);
   outgoingLight*=fieldLight*mix(vec3(1.),hue*value,groundWash.a*mix(.30,1.,bankSun));
   outgoingLight=outgoingLight*(1.-contactColor.a)+contactColor.rgb*textureDetail*mix(.38,1.,bankSun);
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=>key()+'-painted-contact-pigment';
 material.needsUpdate=true;
 material.userData.groundContact={swatchRow,swatches:swatches.map(c=>c.toArray())};
 buildBattleGroundJoin(floor,b,width);
}

// Split existing triangles so both surfaces use the same vertices, material
// detail, light and normals. Only the last few metres need alpha blending.
function buildBattleGroundJoin(floor,b,width){
 const masonry=b.spec.ruins||b.spec.royal;
 const geometry=floor.geometry,position=geometry.attributes.position;
 const distance=new Float32Array(position.count);
 for(let i=0;i<position.count;i++){
  distance[i]=Math.max(0,position.getZ(i)-apronEdge113(b,position.getX(i)));
 }
 const body=[],border=[],indices=geometry.index.array;
 for(let i=0;i<indices.length;i+=3){
  const a=indices[i],c=indices[i+1],d=indices[i+2];
  const dst=Math.min(distance[a],distance[c],distance[d])<width?border:body;
  dst.push(a,c,d);
 }
 if(!border.length||!body.length)return;
 const rimGeometry=geometry59(new THREE.BufferGeometry());
 for(const [name,attribute] of Object.entries(geometry.attributes))rimGeometry.setAttribute(name,attribute);
 rimGeometry.setAttribute('bankDistance',new THREE.BufferAttribute(distance,1));
 rimGeometry.setIndex(border);geometry.setIndex(body);
 const source=floor.material,rimMaterial=material59(source.clone());
 rimMaterial.transparent=true;rimMaterial.depthWrite=true;rimMaterial.forceSinglePass=true;
 rimMaterial.customProgramCacheKey=()=>source.customProgramCacheKey()+'-terrain-join';
 rimMaterial.onBeforeCompile=function(shader,...args){
  source.onBeforeCompile.call(this,shader,...args);
  shader.uniforms.bankWidth={value:width};
  shader.vertexShader='attribute float bankDistance;varying float joinDistance;\n'+shader.vertexShader.replace(
   '#include <begin_vertex>','#include <begin_vertex>\njoinDistance=bankDistance;');
  shader.fragmentShader='uniform float bankWidth;varying float joinDistance;\n'+shader.fragmentShader.replace(
   '#include <opaque_fragment>',`
    float reach=clamp(joinDistance/bankWidth,0.,1.);
    // Carry individual turf patches, sand ripples and stone joints across
    // the transition at different depths. The noise is fixed to the ground.
    vec2 soilPoint=surfaceWorld132.xz;
    float marginShape=grainNoise100(soilPoint*vec2(.24,.31))*.70+grainNoise100(soilPoint*.89)*.30-.5;
    float surfaceGrain=clamp(relief132/meanGroundPigment-1.,-.75,.75);
    float taper=4.*reach*(1.-reach);
    float terrainEdge=reach+taper*(marginShape*${masonry?'.55':'.43'}+surfaceGrain*${masonry?'.12':'.07'});
    float cover=smoothstep(${masonry?'.28,.87':'.14,.94'},terrainEdge);
    // A moving cast shadow belongs to the physical receiver even where
    // the unshadowed ground is see-through.
    cover=mix(cover,1.,(1.-bankSun)*smoothstep(.05,.31,reach));
    if(cover<.001)discard;
    diffuseColor.a*=cover;
    // The plate leaves the depth buffer at the far plane. Focus should
    // settle onto the bank smoothly, independently of individual grains.
    gl_FragDepth=mix(1.,gl_FragCoord.z,smoothstep(.015,.82,reach));
    #include <opaque_fragment>`);
 };
 const rim=new THREE.Mesh(rimGeometry,rimMaterial);
 rim.name='Battle terrain transition';rim.receiveShadow=floor.receiveShadow;
 // Transparent contacts and targeting rings draw at -1 and 0. Composite
 // the backdrop and the rim first, while keeping their normal depth tests.
 b.landscape90.renderOrder=-3;rim.renderOrder=-2;floor.parent.add(rim);
 floor.userData.transitionWidth=width;b.terrainJoin=rim;
}

function cleanBattleSet161(b){
 if(b.cleanup161||!STAGING161[encounter53.selected])return;const started=performance.now(),stage=encounter53.selected,stats={stage,placements:[],skippedProps:0,grass:0,removedGrass:0,removedPlants:0,mask:'physical floor albedo and terrain',addedDownloads:0},oldGrass=b.group.children.filter(o=>o.isInstancedMesh&&o.material?.userData.realVegetation103==='grassBlades'),budget=oldGrass.reduce((n,o)=>n+o.count,0);
 for(const o of oldGrass){stats.removedGrass+=o.count;o.removeFromParent();o.dispose();}
 stageObjects161(b,stats);
 const solids=[],matrix=new THREE.Matrix4(),stones=b.group.children.filter(o=>o.isInstancedMesh&&o.material?.userData.weathered104);
 for(const o of stones){o.geometry.computeBoundingBox();for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);solids.push(o.geometry.boundingBox.clone().applyMatrix4(matrix).expandByScalar(.12));}}
 const turf=turfSampler161(b),habitat=HABITATS126[stage],spec=SWARD161[stage],rng=seeded(161037+Object.keys(STAGING161).indexOf(stage)*947),stances=fighterStances105(b),q=fightingHollow93(b),blocked=(x,z,r=.18)=>stances.some(s=>x>s.minX-r&&x<s.maxX+r&&z>s.minZ-r&&z<s.maxZ+r)||solids.some(s=>x>s.min.x-r&&x<s.max.x+r&&z>s.min.z-r&&z<s.max.z+r)||stats.placements.some(s=>!['ferns','flowers','daisies','bluebells','softTufts','saltTufts','alpineTufts','violetTufts','heather','leafLitter','seedheads','reeds','wheat'].includes(s.kind)&&Math.abs(x-s.x)<s.rx+r&&Math.abs(z-s.z)<s.rz+r);
 if(habitat.cover&&budget){
  const g=arenaGeometry88(b,'staged-sward161',()=>battleGrassGeometry(b.mobile)),m=arenaCoverMaterial102(b,'grassBlades'),count=Math.min(budget,b.mobile?9500:19000),attempts=Math.min(72000,Math.max(24000,count*12)),seed=Object.keys(STAGING161).indexOf(stage),normal=V3(),up=V3(0,1,0),tilt=new THREE.Quaternion(),yaw=new THREE.Quaternion();
  // Tuft accents authored beside a prop join the same retained batch and
  // budget. Seat their roots consistently instead of layering a second field.
  const accents=b.group.children.filter(o=>o.isInstancedMesh&&o.material?.userData.realVegetation103==='grassBlades'),position=V3(),scale=V3(),rotation=new THREE.Quaternion();
  for(const o of accents){for(let i=0;i<o.count&&stats.grass<count;i++){o.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);if(blocked(position.x,position.z)||arenaWet89(b,position.x,position.z)>.04||turf(position.x,position.z)<.40||!supportedRear113(b,position.x,position.z,.20))continue;position.y=arenaFloor88(b,position.x,position.z)-.025;arenaGrassInstanceBefore102(b,'staged-sward161',g,m,position,scale,rotation);stats.grass++;}o.removeFromParent();o.dispose();}
  stats.accentGrass=stats.grass;
  for(let i=0;i<attempts&&stats.grass<count;i++){
   const x=-27+rng()*54,edge=apronEdge113(b,x),z=edge+.7+rng()*(q.front+15-edge-.7);if(blocked(x,z)||arenaWet89(b,x,z)>.04||!supportedRear113(b,x,z,.20))continue;
   const soil=turf(x,z);if(soil<.40)continue;
   const patch=groundNoise104(x/spec[1]+seed*7.13,z/spec[1]-seed*2.7)*.72+groundNoise104(x*.67+seed,z*.67)*.28,lane=1-smooth(spec[3]*.5,spec[3]*1.6,Math.abs(x+Math.sin(z*.13+seed)*1.7));
   const margin=smooth(.68,1.32,Math.hypot((2*x-q.left-q.right)/(q.right-q.left+3),(2*z-q.back-q.front)/(q.front-q.back+5)));
   const chance=smooth(.29,.70,patch)*spec[0]*soil*(1-lane*.72)*mix(.21,.94,margin);
   if(rng()>chance)continue;const y=arenaFloor88(b,x,z),dx=(arenaFloor88(b,x+.3,z)-arenaFloor88(b,x-.3,z))/.6,dz=(arenaFloor88(b,x,z+.3)-arenaFloor88(b,x,z-.3))/.6;if(Math.hypot(dx,dz)>.48)continue;
   const s=.36+rng()*.39,h=spec[2]*(.50+rng()*.64)*mix(.59,1,smooth(.34,.70,patch)),front=1-smooth(q.front,q.front+12,z);normal.set(-dx,1,-dz).normalize();tilt.setFromUnitVectors(up,normal);yaw.setFromAxisAngle(up,rng()*TAU);tilt.multiply(yaw);
   arenaGrassInstanceBefore102(b,'staged-sward161',g,m,V3(x,y-.025,z),V3(s,h*mix(.78,1,front)*mix(.42,.88,margin),s),tilt);stats.grass++;
  }
 }
 flushBefore89(b);b.batches.clear();
 gradeBattleGroundEdge(b,stage);
 const grass=b.group.children.find(o=>o.name==='Physical staged-sward161');
 if(grass)grass.castShadow=false;
 // Authored ferns/flowers keep their clustered arrangements but cannot emerge
 // from a mineral, a solid prop, paving, a fighter's stance or open water.
 const field=battlefieldFootprint(b.group),plantBounds=new THREE.Box3();
 for(const o of b.group.children){const vegetation=o.material?.userData.realVegetation103;
  const cluster=o.name.startsWith('Physical detail92-')||o.name==='Physical heath101'||o.name==='Physical stage125-autumn-leaves';
  if(!o.isInstancedMesh||(!vegetation&&!cluster)||vegetation==='grassBlades')continue;let write=0;const colour=new THREE.Color();
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
  for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);const e=matrix.elements;plantBounds.copy(o.geometry.boundingBox).applyMatrix4(matrix);
   if(!habitat.cover||!onDistantBattleBank(field,plantBounds.min.x,plantBounds.max.x,plantBounds.max.z)||blocked(e[12],e[14],.12)||arenaWet89(b,e[12],e[14])>.04||turf(e[12],e[14])<.32){stats.removedPlants++;continue;}o.setMatrixAt(write,matrix);if(o.instanceColor){o.getColorAt(i,colour);o.setColorAt(write,colour);}write++;}
  o.count=write;o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();
 }
 const palette=SURFACE_PALETTES132[stage],seen=new Set();b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m||seen.has(m))continue;seen.add(m);materialFinish103(m);bindStageAir97(m,b);if(m.userData.backgroundChroma132)continue;const foliage=m.userData.realVegetation103&&m.userData.realVegetation103!=='flowers'||m.userData.botany104&&!m.userData.trunk104&&!b.spec.autumn;if(foliage&&palette.grass)matchProp132(m,palette.grass,.45);else if(m.userData.weathered104&&palette.stone)matchProp132(m,palette.stone,.50);}});
 b.secondaryForests106=b.group.children.filter(o=>o.userData.botany104);b.stoneClearance105=null;clearFighterStones105(b);b.group.updateMatrixWorld(true);stats.grassBudget=budget;stats.milliseconds=performance.now()-started;b.cleanup161=stats;Object.assign(b.integration126,{grass:stats.grass,groups:stats.placements.length,consolidated161:true});if(stageDepth59.summary)stageDepth59.summary.cleanup161=stats;
}
const stagedSetBefore161=buildStageScenery59;
buildStageScenery59=function(...args){const result=stagedSetBefore161(...args),b=arena88.current;if(b?.foreground134)cleanBattleSet161(b);return result;};
