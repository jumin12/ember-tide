// The waterfall, foam and nearest shore are in one painting. Animate its source
// coordinates so a change of lens cannot send spray across a foreground rock.
const battleSprayBeds={
 waterfall:[.618,.522,.094,.306],grassMeadow:[.625,.544,.048,.167],
 grassFlowers:[.620,.555,.060,.290],grassAutumn:[.383,.603,.025,.081]
};
const marginLandscapeBefore=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 const result=marginLandscapeBefore(b),stage=encounter53.selected,bed=battleSprayBeds[stage];
 if(!bed)return result;
 const m=b.landscape90.material;
 // The optional open-field backdrop set places its shoreline further away.
 const source=b.backdrop135?{waterfall:[.619,.597,.08,.235],grassMeadow:[.675,.650,.032,.15],
  grassFlowers:[.677,.630,.043,.20],grassAutumn:[.382,.640,.023,.08]}[stage]:bed;
 m.uniforms.sprayBed={value:new THREE.Vector4(...source)};m.uniforms.sprayMotion={value:1};
 m.uniforms.water.value=0;m.uniforms.fall.value=0;m.uniforms.flowMask94.value.set(0,0,0,0);
 m.fragmentShader='uniform vec4 sprayBed;uniform float sprayMotion;\n'+m.fragmentShader;
 const sample='vec3 rgb=samplePlate97(map,uv);';
 m.fragmentShader=m.fragmentShader.replace(sample,`
  vec2 waterSite=plateUV97(v)-sprayBed.xy;
  float across=abs(waterSite.x)/sprayBed.z;
  float column=(1.-smoothstep(.38,.76,across))*smoothstep(.004,.032,waterSite.y)*
     (1.-smoothstep(.83,1.,waterSite.y/sprayBed.w));
  float pool=(1.-smoothstep(.64,1.03,across))*
     smoothstep(-.040,-.027,waterSite.y)*(1.-smoothstep(-.009,.002,waterSite.y));
  float cool=smoothstep(.008,.13,original.b-original.r);
  float whitewater=smoothstep(.045,.41,min(original.b,min(original.g,original.r)))*(1.-green);
  float spray=(1.-smoothstep(.58,1.,length(waterSite/vec2(sprayBed.z,.032)-vec2(0.,.35))))*whitewater;
  uv.y+=sprayMotion*column*whitewater*.00062*sin(uv.y*235.+time*4.3+uv.x*22.);
  uv.x+=sprayMotion*pool*cool*.00062*sin(uv.y*257.+time*1.14);
  ${sample}
  float curl=.5+.5*sin(waterSite.x*136.-time*.66+1.6*sin(waterSite.y*122.+time*.47));
  rgb+=sprayMotion*spray*curl*vec3(.026,.032,.034)*(.18+.82*min(1.,original.b*2.));
 `);
 m.needsUpdate=true;return result;
};

// First layer is what shows through wear; second is what gathers in pockets.
// A mineral court, stone vault or snowfield has its own deposits.
const battleSoils={
 waterfall:['earthForest','moss','green'],woodland:['earthForest','leafLitter','wood'],
 orchard:['earthTrail','leafLitter','wood'],ruins:['gravelRiver','moss','paved'],
 cavern:['basalt102','gravelRiver','mineral'],mountain:['gravelRiver','grassDry','alpine'],
 snow:['stoneGranite','snow','snow'],coast:['sandCoast','gravelRiver','coast'],
 royalRoad:['gravelRiver','earthTrail','paved'],moonlit:['earthForest','moss','wood'],
 grassMeadow:['earthTrail','grassLush','green'],grassRiver:['gravelRiver','moss','green'],
 grassFlowers:['earthTrail','grassLush','green'],grassDowns:['earthTrail','grassDry','alpine'],
 grassWindmill:['earthTrail','grassDry','field'],grassAutumn:['earthForest','leafLitter','wood'],
 grassStones:['gravelRiver','moss','alpine'],grassHills:['stoneGranite','grassDry','alpine'],
 grassBirch:['earthForest','leafLitter','wood'],grassTwilight:['earthForest','moss','green']
};
function battlefieldFootprint(group){
 const homes=fighterStances105({group}),lx=Math.min(...homes.map(h=>h.minX)),rx=Math.max(...homes.map(h=>h.maxX));
 const back=Math.min(...homes.map(h=>h.minZ)),front=Math.max(...homes.map(h=>h.maxZ));
 return {homes,back,front,x:(lx+rx)*.5,z:(front+back)*.5,w:Math.max(5,(rx-lx)*.5),d:Math.max(3.3,(front-back)*.5)};
}
// All battle cameras look down the Z axis toward the far bank. Test the
// nearest *surface* of a prop, with extra depth behind each sprite's width.
function onDistantBattleBank(field,left,right,nearZ){
 return nearZ<=field.back-3.4&&field.homes.every(home=>
  right<home.minX-1.45||left>home.maxX+1.45||nearZ<=home.minZ-6.2);
}
// Reserve the ground across the entire formation and the gap the player sees
// between its silhouettes. The two tests agree even for staggered rows.
function battleLane(group,field,arena){
 const lens=arena?.reference90??camera,origin=group.position,point=V3();
 const left=Math.min(...field.homes.map(s=>s.minX)),right=Math.max(...field.homes.map(s=>s.maxX));
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 for(const actor of [player,...followers,...battle.enemies.map(e=>e.actor)]){
  const home=battle.rankHomes87?.get(actor)??actor,shape=silhouette87(actor.visualId??actor.id);
  const base=arena?encounter53.floorY:heightAt(home.x,home.z);
  for(const side of [shape.left,shape.right])for(const h of [0,shape.height]){
   point.set(home.x+side*actor.size,base+h*actor.size,home.z).project(lens);
   x0=Math.min(x0,point.x);x1=Math.max(x1,point.x);y0=Math.min(y0,point.y);y1=Math.max(y1,point.y);
  }
 }
 return bounds=>{
  if(bounds.max.x>=left&&bounds.min.x<=right&&bounds.max.z>=field.back-.55&&bounds.min.z<=field.front+.55)return true;
  let l=Infinity,r=-Infinity,b=Infinity,t=-Infinity;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   point.set(x,y,z).add(origin).project(lens);l=Math.min(l,point.x);r=Math.max(r,point.x);b=Math.min(b,point.y);t=Math.max(t,point.y);
  }
  return r>x0-.015&&l<x1+.015&&t>y0-.021&&b<y1+.021;
 };
}
function battleLaneObstacle(name,bounds,mineral=false){
 if(mineral||/stone|rock|pebble|gravel|rubble|slab|gardenEdging/i.test(name))return true;
 if(!/twig|branch|driftwood|\blogs?\b|timber|stump|fallen|crate|debris|wreck/i.test(name))return false;
 return Math.max(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z)>1.35||bounds.max.y-bounds.min.y>.80;
}
function marginWeight(x,z,q){
 const fx=(x-q.x)/(q.w+2.5),fz=(z-q.z)/(q.d+2.9);
 return smooth(.72,1.32,Math.hypot(fx,fz*.88));
}
function battlefieldMask(q,stage,stones,story){
 const size=192,extentX=story?q.w+14:48,extentZ=story?q.d+13:53;
 const rect=new THREE.Vector4(q.x-extentX,q.z-extentZ,2*extentX,2*extentZ);
 const data=new Uint8Array(size*size*4),seed=(Object.keys(battleSoils).indexOf(stage)+1)*7.13;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=rect.x+(i+.5)/size*rect.z,z=rect.y+(j+.5)/size*rect.w,edge=marginWeight(x,z,q);
  const n=groundNoise104(x*.155+seed,z*.147-seed),bend=groundNoise104(x*.28,z*.28+seed)-.5;
  const folds=groundNoise104(x*.29+bend*1.6-seed,z*.32+seed),pockets=n*.67+folds*.33;
  const shoulder=(.34+.66*edge),worn=(1-edge)*(.19+.14*n),o=(j*size+i)*4;
  data[o]=255*clamp(worn+shoulder*smooth(.39,.70,pockets)*.87,0,1);
  data[o+1]=255*shoulder*smooth(.61,.32,pockets)*(.39+.45*folds);
  data[o+2]=0;
  data[o+3]=255*(story?1-smooth(.70,.98,Math.max(Math.abs(x-q.x)/extentX,Math.abs(z-q.z)/extentZ)):1);
 }
 // Bake an irregular, feathered contact at each real mineral footprint.
 // Only the shaded base and the soil immediately around it are affected.
 for(const {x,z,rx,rz,yaw} of stones){
  const radius=Math.max(rx,rz)*1.48,c=Math.cos(yaw),s=Math.sin(yaw);
  const grid=(v,min,span)=>clamp(Math.floor((v-min)*size/span),0,size-1);
  for(let j=grid(z-radius,rect.y,rect.w);j<=grid(z+radius,rect.y,rect.w);j++)
   for(let i=grid(x-radius,rect.x,rect.z);i<=grid(x+radius,rect.x,rect.z);i++){
    const dx=rect.x+(i+.5)*rect.z/size-x,dz=rect.y+(j+.5)*rect.w/size-z;
    const r=Math.hypot((dx*c-dz*s)/rx,(dx*s+dz*c)/rz),contact=1-smooth(.55,1.38,r),o=(j*size+i)*4;
    data[o+2]=Math.max(data[o+2],Math.round(contact*255));
    data[o]=Math.max(data[o],Math.round(contact*145));
   }
 }
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;
 return {texture,rect};
}
function bindBattlefloorFinish(material,layer,stage,story){
 const palette=battleSoils[stage],indices=palette.slice(0,2).map(k=>GROUND102.indexOf(k));
 const family=palette[2],baseStrength=family==='paved'?.46:family==='snow'?.29:.85;
 const old=material.onBeforeCompile,id=material.customProgramCacheKey();
 material.onBeforeCompile=function(shader,...args){
  old.call(this,shader,...args);
  const xz=story?'vGround.xz':'surfaceWorld132.xz',albedo=story?'worldGround102':'marginAlbedo',normalMap=story?'groundNR103':'marginNormals';
  const origin=layer.origin;
  if(story&&!shader.fragmentShader.includes('varying vec3 vGround'))return;
  Object.assign(shader.uniforms,{marginRect:{value:layer.rect},marginOrigin:{value:origin},marginMask:{value:layer.texture},
   marginLayers:{value:new THREE.Vector2(...indices)}});
  if(!story){shader.uniforms.marginAlbedo={value:environment102.ground};shader.uniforms.marginNormals={value:envPbr103.groundData};}
  shader.fragmentShader=(story?'':'uniform highp sampler2DArray marginAlbedo,marginNormals;\n')+
   'uniform sampler2D marginMask;uniform vec4 marginRect;uniform vec2 marginOrigin,marginLayers;\n'+shader.fragmentShader;
  const setup=`
   vec2 marginLocal=${xz}-marginOrigin;
   vec4 deposit=texture2D(marginMask,(marginLocal-marginRect.xy)/marginRect.zw);
   vec2 soilUV=mat2(.956,.293,-.293,.956)*marginLocal*.32;
   vec2 mossUV=mat2(.75,-.66,.66,.75)*marginLocal*.41+vec2(8.12,11.31);
   vec3 soil=texture(${albedo},vec3(soilUV,marginLayers.x)).rgb;
   vec3 moss=texture(${albedo},vec3(mossUV,marginLayers.y)).rgb;
   vec3 luma=vec3(.2126,.7152,.0722);
   float soilW=clamp(deposit.r+(dot(soil,luma)-.17)*.65,0.,1.)*deposit.a*${baseStrength.toFixed(2)};
   float mossW=clamp(deposit.g+(dot(moss,luma)-.15)*.54,0.,.83)*deposit.a*${baseStrength.toFixed(2)};
   ${story?'float road=clamp(vGroundBlend.x,0.,1.);soilW*=mix(.72,.12,road);mossW*=mix(.72,.07,road);':''}
   vec3 baseInk=${story?'diffuseColor.rgb':'pigment132'};
   float baseLum=max(.035,dot(baseInk,luma));
   // Preserve the contrast within a tile. Normalizing each individual texel
   // would wash its pits, grains and leaf veins back into a single colour.
   soil=mix(vec3(dot(soil,luma)),soil,.84)*clamp(.66+baseLum*1.7,.81,1.27);
   moss=mix(vec3(dot(moss,luma)),moss,.79)*clamp(.78+baseLum*1.5,.85,1.35);
   vec3 localHue=clamp(baseInk/baseLum,vec3(.63),vec3(1.44));
   soil*=mix(vec3(1.),localHue,.30);moss*=mix(vec3(1.),localHue,.23);
   vec3 finished=mix(mix(baseInk,soil,soilW),moss,mossW)*(1.-.48*deposit.b*deposit.a);
  `;
  if(story){
   const anchor='#include <lights_fragment_begin>';
   const shaded=`diffuseColor.rgb=finished;material.diffuseColor=finished*(1.-metalnessFactor);`;
   shader.fragmentShader=shader.fragmentShader.replace(anchor,setup+shaded+marginNormals()+anchor);
  }else{
   const anchor='relief132=dot(pigment132,vec3(.2126,.7152,.0722));';
   shader.fragmentShader=shader.fragmentShader.replace(anchor,setup+'pigment132=finished;'+anchor)
    .replace('#include <lights_fragment_begin>',marginNormals()+'\n#include <lights_fragment_begin>');
  }
  function marginNormals(){return `
   vec4 soilNR=texture(${normalMap},vec3(soilUV,marginLayers.x)),mossNR=texture(${normalMap},vec3(mossUV,marginLayers.y));
   vec3 dpX=dFdx(-vViewPosition),dpY=dFdy(-vViewPosition);
   vec3 sn=vec3(soilNR.xy*2.-1.,max(.35,soilNR.z*2.-1.));
   vec3 mn=vec3(mossNR.xy*2.-1.,max(.35,mossNR.z*2.-1.));
   vec3 tS=dpX*dFdy(soilUV).y-dpY*dFdx(soilUV).y,bS=dpY*dFdx(soilUV).x-dpX*dFdy(soilUV).x;
   vec3 tM=dpX*dFdy(mossUV).y-dpY*dFdx(mossUV).y,bM=dpY*dFdx(mossUV).x-dpX*dFdy(mossUV).x;
   normal=normalize(normal+(tS*sn.x+bS*sn.y)*inversesqrt(max(1e-9,max(dot(tS,tS),dot(bS,bS))))*soilW*.42
                          +(tM*mn.x+bM*mn.y)*inversesqrt(max(1e-9,max(dot(tM,tM),dot(bM,bM))))*mossW*.38);
   roughnessFactor=clamp(mix(roughnessFactor,mix(soilNR.a,mossNR.a,mossW),soilW+mossW*.28),.68,.99);
   material.roughness=roughnessFactor;
  `;}
 };
 material.customProgramCacheKey=()=>id+'-battle-deposits-'+stage+(story?'-local':'');
 material.needsUpdate=true;
}

// Small folded leaves and forked, weathered stems are real surfaces. Each
// population is instanced, receives the stage light and has no collision body.
function marginLeafGeometry(litter){
 return geo16('battle-margin-'+(litter?'fallen-leaves':'rosette'),()=>{
  const p=[],uv=[],col=[],idx=[],rng=seeded(litter?920:631);
  for(let j=0;j<(litter?5:9);j++){
   const a=j*2.399+rng()*.7,c=Math.cos(a),s=Math.sin(a),r=litter?rng()*.61:0;
   const x=c*r,z=s*r,length=litter?.35+rng()*.3:.44+rng()*.42,w=(.16+rng()*.11)*length;
   const h=litter?.055+rng()*.035:.20+rng()*.30,base=j*5;
   for(const [along,side,y,u,v,tint] of [[0,0,.006,.5,0,.47],[.48,-w,h*.61,0,.46,.81],[.46,0,h,.5,.46,.99],[.48,w,h*.53,1,.46,.74],[1,0,h*.44,.5,1,.92]]){
    p.push(x+c*along*length-s*side,y,z+s*along*length+c*side);uv.push(u,v);col.push(tint,tint,tint*.93);
   }
   for(const k of [0,1,2,0,2,3,1,4,2,2,4,3])idx.push(base+k);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(idx);g.computeVertexNormals();return g;
 });
}
function marginTwigGeometry(){
 return geo16('battle-margin-fallen-stem',()=>{
  const points=[],normals=[],uv=[];
  for(const [start,end,r] of [[[0,.04,0],[.53,.07,.10],.037],[[.53,.07,.10],[1.17,.05,.03],.027],[[.42,.06,.08],[.71,.11,.35],.021]]){
   const a=V3(...start),b=V3(...end),dir=b.clone().sub(a);
   const g=new THREE.CylinderGeometry(r*.47,r,dir.length(),5).toNonIndexed();
   g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),dir.normalize()));
   const mid=a.add(b).multiplyScalar(.5);g.translate(mid.x,mid.y,mid.z);
   points.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);g.dispose();
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;
 });
}
function marginFernGeometry(){
 return geo16('battle-margin-fern',()=>{
  const positions=[],uv=[],indices=[];
  // Three arched, intersecting fans have open silhouettes from either side.
  for(let j=0;j<3;j++){
   const a=j*2.399,c=Math.cos(a),s=Math.sin(a);
   for(let k=0;k<3;k++)for(const side of [-1,1]){
    const t=k*.5,h=t*(1.04-.43*t),reach=t*t*.52,w=.56;
    positions.push(c*side*w+s*reach,h,-s*side*w+c*reach);uv.push((side+1)*.5,t);
   }
   const k=j*6;for(const n of [0,1,2,1,3,2,2,3,4,3,5,4])indices.push(k+n);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 });
}
function marginStoneGeometry(variant){
 return geo16('battle-margin-bank-stone-'+variant,()=>{
  const g=new THREE.SphereGeometry(1,22,15),p=g.attributes.position,phase=variant*1.67;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   const bed=.91+.11*Math.sin(z*4.8+x*3.1+phase)+.065*Math.sin(y*8.1+x*4.6+phase);
   const crown=.49+y*.46-.09*x+.055*Math.sin(x*7+phase)*Math.sin(z*5.7+phase);
   p.setXYZ(i,x*bed+.12*y,Math.max(-.03,crown),z*bed+.11*x*y);
  }
  g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData.weathered104=true;return g;
 });
}
function buildMarginScatter(stage,group,q,b,inLane){
 const family=battleSoils[stage][2],mineral=['mineral','snow','paved'].includes(family);
 const rng=seeded(33241+Object.keys(battleSoils).indexOf(stage)*7001),stones=[],buckets=new Map(),nearBuckets=new Map();
 const matrix=new THREE.Matrix4(),at=V3(),size=V3(),turn=new THREE.Quaternion(),up=V3(0,1,0),box=new THREE.Box3();
 const lines=b?fighterSightlines105(b):[],height=b?(x,z)=>arenaFloor88(b,x,z):(x,z)=>heightAt(x+group.position.x,z+group.position.z)-group.position.y;
 if(!b)for(const actor of [player,...followers,...battle.enemies.map(e=>e.actor)]){
  const home=battle.rankHomes87?.get(actor)??actor,shape=silhouette87(actor.visualId??actor.id);
  for(const side of [shape.left*.72,(shape.left+shape.right)*.5,shape.right*.72])for(const level of [.16,.50,.84]){
   const target=V3(home.x+side*actor.size,heightAt(home.x,home.z)+level*shape.height*actor.size,home.z);
   const direction=target.sub(camera.position),distance=direction.length();
   lines.push({ray:new THREE.Ray(camera.position.clone(),direction.normalize()),distance});
  }
 }
 const lens=b?.reference90??camera,field=battleField91(),worldOrigin=group.position;
 const floorY=b?encounter53.floorY:heightAt(q.x+worldOrigin.x,q.z+worldOrigin.z);
 const point=V3(),safeScreens=[];
 function screenBox(x0,x1,y0,y1,z0,z1){
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const x of [x0,x1])for(const y of [y0,y1])for(const z of [z0,z1]){
   point.set(x,y,z).add(worldOrigin).project(lens);
   const u=.5+.5*point.x,v=.5-.5*point.y;
   left=Math.min(left,u);right=Math.max(right,u);top=Math.min(top,v);bottom=Math.max(bottom,v);
  }
  return {left,right,top,bottom};
 }
 for(const a of [player,...followers,...battle.enemies.map(e=>e.actor)]){
  const home=battle.rankHomes87?.get(a)??a,s=silhouette87(a.visualId??a.id);
  const x=home.x-worldOrigin.x,z=home.z-worldOrigin.z,y=height(x,z);
  safeScreens.push(screenBox(x+s.left*a.size,x+s.right*a.size,y,y+s.height*a.size,z,z));
 }
 function clearOfCast(bounds){
  if(q.homes.some(s=>bounds.max.x>s.minX-.65&&bounds.min.x<s.maxX+.65&&
     bounds.max.z>s.minZ-3.0&&bounds.min.z<s.maxZ+.82))return false;
  const a=screenBox(bounds.min.x,bounds.max.x,bounds.min.y,bounds.max.y,bounds.min.z,bounds.max.z);
  return safeScreens.every(s=>a.right<s.left-.012||a.left>s.right+.012||
    a.bottom<s.top-.016||a.top>s.bottom+.016);
 }
 function clearNearCorner(x,y,z,r,h){
  if(z-r<q.front-.38||q.homes.some(s=>Math.hypot(Math.max(s.minX-x,0,x-s.maxX),Math.max(s.minZ-z,0,z-s.maxZ))<r+1.4))return false;
  const a=screenBox(x-r,x+r,y-.15,y+h,z-r,z+r);
  if(a.right<.008||a.left>.992||a.top>(field.top+field.height)/innerHeight||
     (a.left<.76&&a.right>.24))return false;
  return safeScreens.every(s=>a.right<s.left-.038||a.left>s.right+.038||a.bottom<s.top-.045||a.top>s.bottom+.045);
 }
 function batch(collection,type,x,y,z,sx,sy,sz,yaw){
  turn.setFromAxisAngle(up,yaw);matrix.compose(at.set(x,y,z),turn,size.set(sx,sy,sz));
  const g=geometryFor(type);if(!g.boundingBox)g.computeBoundingBox();
  box.copy(g.boundingBox).applyMatrix4(matrix);
  if(battleLaneObstacle(type,box)&&inLane(box))return false;
  if(!collection.has(type))collection.set(type,[]);
  collection.get(type).push(matrix.clone());return true;
 }
 // Test authored stone groups too. Their individual pieces can extend
 // beyond the patch centre after rotation or scaling.
 if(b)for(const o of group.children){
  if(!o.isInstancedMesh)continue;
  const rock=!!o.material?.userData.weathered104;
  if(!rock&&(!o.name.startsWith('Physical ')||o.material?.userData.realVegetation103))continue;
  if(rock&&o.name.startsWith('Physical stage134-')){
   const variant=Number(o.name.split('-').at(-1))||0;o.geometry=marginStoneGeometry(variant%8);
  }
  const bounds=o.geometry.boundingBox??(o.geometry.computeBoundingBox(),o.geometry.boundingBox);
  let write=0;const colour=new THREE.Color();
  for(let i=0;i<o.count;i++){
   o.getMatrixAt(i,matrix);matrix.decompose(at,turn,size);
   box.copy(bounds).applyMatrix4(matrix);
   if(battleLaneObstacle(o.name,box,rock)&&inLane(box)||rock&&!onDistantBattleBank(q,box.min.x,box.max.x,box.max.z)&&!clearOfCast(box))continue;
   const rx=(bounds.max.x-bounds.min.x)*size.x*.5,rz=(bounds.max.z-bounds.min.z)*size.z*.5;
   if(rock&&rx>.16&&rz>.16){
    at.y-=Math.min(.24,size.y*.18);matrix.compose(at,turn,size);
    stones.push({x:at.x,z:at.z,rx,rz,yaw:Math.atan2(matrix.elements[8],matrix.elements[10])});
   }
   o.setMatrixAt(write,matrix);if(o.instanceColor){o.getColorAt(i,colour);o.setColorAt(write,colour);}write++;
  }
  o.count=write;o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;o.computeBoundingSphere();o.computeBoundingBox();
 }
 const occupied=stones.slice(),anchors=[];
 for(let i=0;i<15;i++){
  const x=q.x+(i-7+(rng()-.5)*.9)*(q.w+13)/7;
  const z=b?apronEdge113(b,x)+1.0+rng()*1.35:q.back-6.7-rng()*4.4;
  anchors.push({x,z,scale:.55+rng()*.60});
 }
 // Restore the uneven clumps on the two shoulders and the near lip of the old stage layout.
 for(let i=0;i<19;i++){
  const side=i%2?-1:1,front=i%4===2;
  const x=q.x+(front?(rng()-.5)*2:side*(.85+rng()*.58))*(q.w+2.1);
  const z=q.z+(front?1.02+rng()*.88:(rng()-.54)*2.6)*(q.d+2.1);
  anchors.push({x,z,scale:.72+rng()*.93,shoulder:true});
 }
 // Two broken groups enter the picture from the camera side. Fit them to
 // the exposed field above the touch controls and seat them on the 3D floor.
 const ray=new THREE.Ray(),groundRay=new THREE.Raycaster(),storyGround=[];
 if(!b)world.traverse(o=>{if(o.visible&&o.isMesh&&o.material?.userData.ground102)storyGround.push(o);});
 const corners=[[.028,.91,.68],[.078,.978,1.03],[.168,1.015,.66],[.971,.855,.72],[.957,.947,.90],[.873,1.01,.70]];
 if(!b&&mobileBattle69())corners.push([.10,.84,.50],[.90,.84,.50],[.16,.90,.48],[.84,.90,.48]);
 function groundAtScreen(u,screenY){
  const direction=V3(u*2-1,1-screenY*2,.5).unproject(lens).sub(lens.position).normalize();
  if(direction.y>=-.025)return false;
  ray.set(lens.position,direction);
  if(storyGround.length){
   groundRay.ray.copy(ray);const surface=groundRay.intersectObjects(storyGround,false)[0];
   if(!surface)return false;point.copy(surface.point).sub(worldOrigin);
  }else{
   let y=floorY;
   for(let j=0;j<3;j++){
    ray.at((y-ray.origin.y)/direction.y,point).sub(worldOrigin);y=height(point.x,point.z)+worldOrigin.y;
   }
  }
  return true;
 }
 for(const [u,v,scale] of corners){
  if(groundAtScreen(u,(field.top+field.height*v)/innerHeight))anchors.push({x:point.x,z:point.z,scale,near:true});
 }
 for(const [u,v] of [[.23,.91],[.49,.96],[.74,.87],[.45,.65],[.80,.63]]){
  if(groundAtScreen(u+(rng()-.5)*.08,(field.top+field.height*(v+(rng()-.5)*.042))/innerHeight))
   anchors.push({x:point.x,z:point.z,scale:.86+rng()*.69,shoulder:true});
 }
 const clutter=family==='wood'?1.25:family==='paved'?.49:family==='snow'?.53:1;
 for(const anchor of anchors){
  for(let i=0;i<Math.round((b?.mobile?14:21)*clutter);i++){
   const a=rng()*TAU,r=Math.sqrt(rng())*anchor.scale,x=anchor.x+Math.cos(a)*r*2.12,z=anchor.z+Math.sin(a)*r*.93;
   const near=!!anchor.near,collection=near?nearBuckets:buckets;
   const t=rng(),large=i===0&&(near||rng()<.78),stone=large||t<(mineral?.87:family==='coast'?.46:.24);
   const twig=!stone&&(family==='coast'||family==='wood'||family==='field')&&t>.86;
   const litter=!stone&&!twig&&(mineral||family==='wood'&&t<.74||family==='field'&&t>.58||t>.83);
   if(family==='snow'&&!stone)continue;
   const s=(large?.43+rng()*.43:stone?.10+rng()*.24:twig?.40+rng()*.47:.25+rng()*.43)*(near?(family==='paved'?1.18:1.55):1);
   const rx=s*(stone?1.12:1),rz=s*(stone?.76:.74),h=stone?s*(large?.70:.51):s*.54;
   // Enclose every rotation of the uneven crown, stems and leaves.
   const radius=Math.max(rx,rz)*1.48;
   if(!near&&!anchor.shoulder&&!onDistantBattleBank(q,x-radius,x+radius,z+radius)||occupied.some(f=>Math.abs(x-f.x)<rx*.57+f.rx*.73&&Math.abs(z-f.z)<rz*.57+f.rz*.73))continue;
   if(b){
    if(arenaWet89(b,x,z)>.04||!supportedRear113(b,x,z,radius))continue;
   }else{
    if(waterGround(x,z))continue;
    if(near){
     // A non-walkable verge may still carry real terrain. Respect its
     // buildings and trees without treating the navigation boundary as a wall.
     const objects=colliderGrid.get(colliderKey(x,z))??[];
     if(objects.some(c=>Math.abs(c.x-x)<c.w+rx&&Math.abs(c.z-z)<c.d+rz))continue;
    }else if(!staticFree(x,z,s+.1))continue;
   }
   const y=height(x,z);
   const slope=Math.abs(height(x+rx,z)-height(x-rx,z))+Math.abs(height(x,z+rz)-height(x,z-rz));
   if(!Number.isFinite(y)||near&&!clearNearCorner(x,y,z,radius,s*.85)||slope>s*(near&&!b?1.22:.81))continue;
   box.min.set(x-rx,y-.16,z-rz);box.max.set(x+rx,y+h,z+rz);
   if(anchor.shoulder&&!clearOfCast(box)||stanceIntersects105(box,q.homes)||stoneOccludes105(box,{group},lines))continue;
   const yaw=rng()*TAU;
   if(stone){
    const which=rng()<.5?'stone-a':'stone-b';if(!batch(collection,which,x,y-h*.31,z,rx,h,rz,yaw))continue;
    const rock={x,z,rx,rz,yaw};stones.push(rock);occupied.push(rock);
   }else{
    const fern=!twig&&!litter&&['green','wood'].includes(family)&&t<.68;
    batch(collection,twig?'twigs':litter?'litter':fern?'fern':'rosettes',x,y+(litter?.019:.009),z,s,s,s,yaw);
   }
  }
 }
 // Frame the party with two pockets of real scenery. The closer one sits on
 // the last exposed strip of floor above the cards or the touch command dock.
 const flank=new Map(),corner=new Map(),portrait=innerHeight>innerWidth;
 const fieldBottom=(field.top+field.height)/innerHeight;
 const rightHUD=['#battle-party','#battle-command'].map(id=>document.querySelector(id)?.getBoundingClientRect())
  .filter(r=>r&&r.width>0&&r.height>0&&r.right>.85*innerWidth&&r.top>.5*innerHeight);
 const exposedBottom=Math.min(fieldBottom,...rightHUD.map(r=>r.top/innerHeight),
  !rightHUD.length&&!mobileBattle69()?1-104/innerHeight:1);
 const party=safeScreens.slice(0,1+followers.length),outer=Math.max(...party.map(s=>s.right));
 const feet=Math.max(...party.map(s=>s.bottom));
 const sprig=['green','wood'].includes(family)?'fronds':mineral?'stone-b':'tussock';
 const accent=mineral?'stone-a':family==='coast'||family==='field'?'tussock':'flowers';
 const debris=family==='wood'?'litter':['coast','field'].includes(family)?'twigs':'stone-b';
 function geometryFor(key){
  if(key.startsWith('stone'))return marginStoneGeometry(key==='stone-a'?2:5);
  if(key==='fronds'||key==='flowers')return plantSculpt103(key==='fronds'?'fern':'flowers');
  if(key==='tussock')return curvedGrass102(false);
  if(key==='fern')return marginFernGeometry();
  if(key==='twigs')return marginTwigGeometry();
  return marginLeafGeometry(key==='litter');
 }
 function placePocket(collection,u,v,unit){
  // Two different profiles: an isolated outcrop beside the party and a
  // more broken, overlapping cluster that enters from the camera edge.
  const close=collection===corner,flip=rng()<.5?-1:1;
  const pieces=close?
   [['stone-a',.30,.12,.97],[sprig,-.84,.08,1.16],[accent,-1.25,.02,.95],[accent,-1.51,.21,.56],
    ['stone-b',1.35,-.24,.55],[sprig,1.74,-.34,.84],[debris,-1.62,.38,.38],['stone-b',-.92,.56,.34],
    [sprig,2.24,.19,.54],['stone-a',-2.06,.53,.22]]:
   [['stone-b',0,0,.77],[sprig,.76,-.13,1.03],[accent,1.1,-.21,.88],[sprig,1.43,.05,.65],['stone-a',-.93,.28,.46],
    [debris,-1.71,.35,.29],['stone-b',1.68,.41,.24]];
  for(const [key,dx,dy,weight] of pieces){
   const px=u+flip*(dx+(rng()-.5)*.22)*unit/innerWidth;
   const py=v+(dy+(rng()-.5)*.17)*unit/innerHeight;
   if(px<.66||px>1.009||!groundAtScreen(px,py))continue;
   const {x,y,z}=point,depth=-point.clone().add(worldOrigin).applyMatrix4(lens.matrixWorldInverse).z;
   const s=unit*weight*(.91+.16*rng())*2*depth/(innerWidth*lens.projectionMatrix.elements[0]);
   if(!Number.isFinite(s)||s<=0)continue;
   const rock=key.startsWith('stone'),rx=s*(rock?1.12:1),rz=s*(rock?.75:1);
   const h=s*(rock?(family==='paved'?.55:.85):1.27),yaw=rng()*TAU;
   const sculpt=key==='fronds'||key==='flowers'||key==='tussock';
   const base=y+(rock?-h*.22:sculpt?.465*h:.012);
   matrix.compose(at.set(x,base,z),turn.setFromAxisAngle(up,yaw),size.set(rx,h,rz));
   const g=geometryFor(key);if(!g.boundingBox)g.computeBoundingBox();
   box.copy(g.boundingBox).applyMatrix4(matrix);
   if(b?(arenaWet89(b,x,z)>.04||!supportedRear113(b,x,z,rx)):waterGround(x,z))continue;
   if(!b&&(colliderGrid.get(colliderKey(x,z))??[]).some(c=>Math.abs(x-c.x)<c.w+rx*.72&&Math.abs(z-c.z)<c.d+rz*.72))continue;
   if(q.homes.some(home=>Math.hypot(Math.max(home.minX-box.max.x,0,box.min.x-home.maxX),
      Math.max(home.minZ-box.max.z,0,box.min.z-home.maxZ))<.92)||stoneOccludes105(box,{group},lines))continue;
   const a=screenBox(box.min.x,box.max.x,box.min.y,box.max.y,box.min.z,box.max.z);
   const gap=portrait?.018:.027;
   if(a.left>=.997||a.right<=.68||a.top>=exposedBottom-.004||
      safeScreens.some(s=>a.left<s.right+gap&&a.right>s.left-gap&&a.top<s.bottom+.026&&a.bottom>s.top-.026))continue;
   // Any object level with the cast must lie on its outside, even when
   // perspective makes a gap between two heroes look large enough to fill.
   if(a.left<outer+gap&&a.top<feet+.026)continue;
   if(rock&&occupied.some(f=>Math.abs(x-f.x)<rx*.54+f.rx*.58&&Math.abs(z-f.z)<rz*.53+f.rz*.55))continue;
   if(!batch(collection,key,x,base,z,rx,h,rz,yaw))continue;
   if(rock){const foot={x,z,rx,rz,yaw};stones.push(foot);occupied.push(foot);}
  }
 }
 const unit=Math.min(innerWidth*.032,field.height*.054);
 const flankU=clamp(outer+(1-outer)*.57,.88,.968);
 // In portrait the outer hero stands close to the bezel. The higher patch
 // of ground beside their shoulder has room for the whole outcrop.
 const flankV=Math.min(feet-(portrait?.108:.036),(field.top+field.height*.81)/innerHeight,exposedBottom-.10);
 placePocket(flank,flankU,flankV,unit*(portrait?.82:.80));
 if(portrait&&Array.from(flank.values()).reduce((n,rows)=>n+rows.length,0)<3){
  // Some story formations reach the right bezel. Continue the same verge
  // diagonally toward the viewer, in the exposed ground below their feet.
  const forward=Math.min(exposedBottom-.041,feet+(exposedBottom-feet)*.52);
  placePocket(flank,.938,forward,unit*.83);
  if(!flank.size)placePocket(flank,.854,Math.min(forward+.047,exposedBottom-.04),unit*.70);
 }else if(!flank.size)placePocket(flank,.963,Math.min(feet+.046,exposedBottom-.075),unit*.65);
 placePocket(corner,portrait?.91:.903,exposedBottom-unit*.56/innerHeight,unit*1.09);
 if(!corner.size)placePocket(corner,.852,exposedBottom-.027,unit*.79);
 const materials=[],rockKey=STAGE_SETS125[stage].stone,rockMap=environment102.maps.get(rockKey)??textures.rock;
 const stoneMat=new THREE.MeshStandardMaterial({color:family==='snow'?'#dbdedc':'#b8b3a5',map:rockMap,roughness:.86});
 const mineralData=envPbr103.maps.get(rockKey+':normalRough');
 if(mineralData){stoneMat.normalMap=mineralData;stoneMat.normalScale.setScalar(.35);}else{stoneMat.bumpMap=rockMap;stoneMat.bumpScale=.065;}
 const plants=new THREE.MeshStandardMaterial({map:environment102.maps.get('botanicalLeaf102')??textures.grass,color:family==='alpine'||family==='field'?'#c3b785':'#c2c5a6',roughness:.91,vertexColors:true,side:THREE.DoubleSide});
 const fernMat=new THREE.MeshStandardMaterial({map:environment102.maps.get('fernFine102'),color:'#c5c7a4',alphaTest:.35,roughness:.93,side:THREE.DoubleSide});
 const leaves=new THREE.MeshStandardMaterial({map:environment102.maps.get('leafLitter')??textures.earth,color:family==='wood'?'#caab7a':'#b5ad87',roughness:.98,vertexColors:true,side:THREE.DoubleSide});
 const wood=new THREE.MeshStandardMaterial({map:textures.wood,color:'#ad9980',roughness:.96});
 materials.push(stoneMat,plants,fernMat,leaves,wood);
 for(const m of materials){if(b){bindArenaWeather89(m,b);bindStageAir97(m,b);material59(m);}else addCloudLighting(m);}
 // A paler, broken mineral crown and an earth-stained foot follow the same
 // directional light as the native floor rather than a pre-lit decal.
 const stoneCompile=stoneMat.onBeforeCompile,stoneKey=stoneMat.customProgramCacheKey();
 stoneMat.onBeforeCompile=function(sh,...args){
  stoneCompile.call(this,sh,...args);sh.vertexShader='varying vec3 marginStoneP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmarginStoneP=position;');
  sh.fragmentShader='varying vec3 marginStoneP;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float patina=sin(marginStoneP.x*13.+sin(marginStoneP.z*9.))*sin(marginStoneP.z*6.);
   float top=smoothstep(.44,.82,marginStoneP.y+patina*.18);
   diffuseColor.rgb*=mix(vec3(.66,.63,.56),vec3(1.06,1.05,1.00),smoothstep(.05,.72,marginStoneP.y));
   diffuseColor.rgb=mix(diffuseColor.rgb,${family==='snow'?'vec3(.69,.75,.80)':
    ['green','wood','alpine'].includes(family)?'diffuseColor.rgb*vec3(.83,1.06,.71)+vec3(.014,.018,.006)':'diffuseColor.rgb*vec3(1.06,1.03,.97)'},top*.63);`);
 };stoneMat.customProgramCacheKey=()=>stoneKey+'-margin-weathering-'+family;
 let count=0;
 const botany=new Map();
 for(const [collection,label] of [[buckets,''],[nearBuckets,'foreground '],[flank,'right flank '],[corner,'right corner ']])for(const [key,rows] of collection){
  const rock=key.startsWith('stone'),g=geometryFor(key);
  let mat=rock?stoneMat:key==='twigs'?wood:key==='litter'?leaves:key==='fern'?fernMat:plants;
  if(key==='fronds'||key==='flowers'||key==='tussock'){
   if(!botany.has(key)){
    const kind=key==='fronds'?'fern':key==='tussock'?'grassBlades':'flowers';
    const m=vegetationMaterial103(kind,b);
    if(b){bindArenaWeather89(m,b);bindStageAir97(m,b);material59(m);}
    botany.set(key,m);materials.push(m);
   }
   mat=botany.get(key);
  }
  const mesh=new THREE.InstancedMesh(g,mat,rows.length);mesh.name='Battlefield '+label+key;mesh.castShadow=rock;mesh.receiveShadow=true;
  rows.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();group.add(mesh);count+=rows.length;
 }
 if(b)for(const o of group.children){
  if(o.isInstancedMesh&&o.name.startsWith('Physical stage134-')&&o.material?.userData.weathered104){
   o.material=stoneMat;
  }
 }
 return {stones,count,materials};
}
// Read the existing ground pigment, including the painted bank at the rear.
// A tuft needs a green root and a surrounding patch, even in a night battle.
function battleGrowthField(floors,cx,cz,story){
 const scan=new THREE.Scene(),materials=new Map(),bounds=new THREE.Box3(),box=new THREE.Box3();
 const nightBank=!story&&encounter53.phase55==='night';
 for(const floor of floors){
  floor.updateWorldMatrix(true,false);
  if(!floor.geometry.boundingBox)floor.geometry.computeBoundingBox();
  bounds.union(box.copy(floor.geometry.boundingBox).applyMatrix4(floor.matrixWorld));
  // Both pieces of an arena bank share the same underlying ground pigment.
  const source=story?floor.material:floors[0].material;
  let m=materials.get(source);
  if(!m){
   m=source.clone();materials.set(source,m);
   m.onBeforeCompile=function(shader,...args){
    source.onBeforeCompile.call(this,shader,...args);
    const road=story&&shader.fragmentShader.includes('varying vec3 vGround')?'*(1.-smoothstep(.12,.54,vGroundBlend.x))':'';
    const bank=shader.fragmentShader.includes('varying vec4 contactColor,groundWash;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`
     vec3 soilInk=diffuseColor.rgb;
     vec2 greenRatios=soilInk.gg/max(vec2(.001),soilInk.rb);
     ${bank?`vec3 bankInk=mix(soilInk,groundWash.rgb,groundWash.a)*(1.-contactColor.a)+contactColor.rgb;
       // The painted verge can veto a planting. Blue night light does not describe soil.
       vec2 bankRatios=bankInk.gg/max(vec2(.001),bankInk.rb);
       greenRatios.x=min(greenRatios.x,bankRatios.x);
       ${nightBank?'':'greenRatios.y=min(greenRatios.y,bankRatios.y);'}`:''}
     float green=smoothstep(1.02,1.13,greenRatios.x)*smoothstep(1.08,1.26,greenRatios.y)${road};
     gl_FragColor=vec4(green,green,green,1.);`);
   };
   m.customProgramCacheKey=()=>source.customProgramCacheKey()+(nightBank?'-night-ground-growth':'-ground-growth');
   m.side=THREE.DoubleSide;m.transparent=false;m.depthWrite=true;
  }
  const layer=new THREE.Mesh(floor.geometry,m);layer.matrixAutoUpdate=false;layer.matrix.copy(floor.matrixWorld);scan.add(layer);
 }
 const spanX=story?bounds.max.x-bounds.min.x:96,spanZ=story?bounds.max.z-bounds.min.z:106;
 const x0=story?bounds.min.x:cx-spanX*.5,z0=story?bounds.min.z:cz-spanZ*.5;
 const width=clamp(Math.ceil(spanX*4),4,1024),height=clamp(Math.ceil(spanZ*4),4,1024);
 const lens=new THREE.OrthographicCamera(-spanX*.5,spanX*.5,spanZ*.5,-spanZ*.5,.1,bounds.max.y-bounds.min.y+4);
 lens.up.set(0,0,-1);lens.position.set(x0+spanX*.5,bounds.max.y+2,z0+spanZ*.5);lens.lookAt(lens.position.x,bounds.min.y-1,lens.position.z);
 const target=new THREE.WebGLRenderTarget(width,height,{depthBuffer:true});
 const previous=renderer.getRenderTarget(),face=renderer.getActiveCubeFace(),level=renderer.getActiveMipmapLevel();
 const clear=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha(),shadow=renderer.shadowMap.needsUpdate;
 const rgba=new Uint8Array(width*height*4);
 try{
  renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.clear();renderer.render(scan,lens);
  renderer.readRenderTargetPixels(target,0,0,width,height,rgba);
 }finally{
  renderer.setRenderTarget(previous,face,level);renderer.setClearColor(clear,alpha);renderer.shadowMap.needsUpdate=shadow;
  target.dispose();for(const m of materials.values())m.dispose();
 }
 const dx=Math.max(1,Math.round(.32*width/spanX)),dz=Math.max(1,Math.round(.32*height/spanZ));
 return {allows(x,z){
  const col=Math.floor((x-x0)*width/spanX),row=Math.floor((z0+spanZ-z)*height/spanZ);
  if(col<dx||row<dz||col>=width-dx||row>=height-dz)return false;
  const i=4*(row*width+col);
  if(rgba[i]<115)return false;
  const neighbors=Number(rgba[i-4*dx]>=105)+Number(rgba[i+4*dx]>=105)+
   Number(rgba[i-4*width*dz]>=105)+Number(rgba[i+4*width*dz]>=105);
  return neighbors>=3;
 }};
}
function isBattleGroundcover(mesh){
 const kind=mesh.userData.plantKey||mesh.material?.userData.realVegetation103;
 return kind==='grassBlades'||/^Battlefield (?:right flank |right corner )?tussock$/.test(mesh.name);
}
function fitBattleGroundcover(root,field,restore){
 root.updateWorldMatrix(true,true);
 const matrix=new THREE.Matrix4(),base=V3(),tint=new THREE.Color();
 let examined=0,rejected=0,kept=0;
 root.traverse(mesh=>{
  if(!mesh.isInstancedMesh||!isBattleGroundcover(mesh))return;
  const native=restore&&!mesh.parent?.userData.dynamicFX;
  const original=mesh.instanceMatrix;
  let write=0,saved;
  // Native POI vegetation can change draw distance and draw count during a
  // fight. Preserve its instance order, LOD masks and the original buffer.
  for(let i=0,n=native?original.count:mesh.count;i<n;i++){
   mesh.getMatrixAt(i,matrix);base.setFromMatrixPosition(matrix).applyMatrix4(mesh.matrixWorld);
   examined++;
   if(!field.allows(base.x,base.z)){
    rejected++;
    if(native){
     if(!saved){saved=original.array.slice();restore.push(()=>{original.array.set(saved);original.needsUpdate=true;});}
     // Put the blade below the terrain for this fight, retaining its normal matrix.
     matrix.elements[13]-=1200;mesh.setMatrixAt(i,matrix);
    }
    continue;
   }
   kept++;
   if(!native){
    if(write!==i)mesh.setMatrixAt(write,matrix);
    if(i!==write&&mesh.instanceColor){mesh.getColorAt(i,tint);mesh.setColorAt(write,tint);}
    write++;
   }
  }
  if(!native){mesh.count=write;mesh.computeBoundingBox();mesh.computeBoundingSphere();if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
  if(!native||saved)mesh.instanceMatrix.needsUpdate=true;
 });
 return {examined,rejected,kept};
}

const marginBuildBefore=buildStageScenery59;
buildStageScenery59=function(...args){
 const result=marginBuildBefore.apply(this,args),b=arena88.current;
 if(!b?.cleanup161||b.marginStudy)return result;
 const stage=encounter53.selected,q=battlefieldFootprint(b.group),scatter=buildMarginScatter(stage,b.group,q,b,battleLane(b.group,q,b));
 const data=battlefieldMask(q,stage,scatter.stones,false);data.origin=new THREE.Vector2(b.group.position.x,b.group.position.z);
 b.ownedTextures.push(data.texture);
 const floor=b.group.children.find(o=>o.name==='Actual level ground and carved water banks');
 // The transparent rim delegates to this same material's compile hook.
 bindBattlefloorFinish(floor.material,data,stage,false);
 if(b.terrainJoin)b.terrainJoin.material.needsUpdate=true;
 let groundcover={examined:0,rejected:0,kept:0};
 if(b.group.children.some(mesh=>mesh.isInstancedMesh&&mesh.count>0&&isBattleGroundcover(mesh))){
  const growth=battleGrowthField(b.terrainJoin?[floor,b.terrainJoin]:[floor],q.x+b.group.position.x,q.z+b.group.position.z,false);
  groundcover=fitBattleGroundcover(b.group,growth);
 }
 b.marginStudy={count:scatter.count,footprints:scatter.stones.length,habitat:battleSoils[stage][2],groundcover};
 return result;
};

// Story battles remain in their POI. Borrow only the ground meshes in this
// scene and restore their exact original materials when the encounter ends.
const storyMarginStages={brookstead:'grassRiver',fern:'woodland',depths:'cavern',patrol:'grassAutumn',alderRemnant:'ruins',nearbySite:'grassStones'};
let currentStoryMargin=null;
function clearNearbyStoryRocks(field,inLane){
 const restore=[],transform=new THREE.Matrix4(),bounds=new THREE.Box3(),tint=new THREE.Color();
 world.updateMatrixWorld(true);
 const screens=[player,...followers,...battle.enemies.map(e=>e.actor)].map(a=>{
  const home=battle.rankHomes87?.get(a)??a,s=silhouette87(a.visualId??a.id),y=heightAt(home.x,home.z);
  return projectedBounds21(new THREE.Box3(V3(home.x+s.left*a.size,y,home.z),V3(home.x+s.right*a.size,y+s.height*a.size,home.z)));
 });
 function inFight(mesh,mineral){
  if(!battleLaneObstacle(mesh.name,bounds,mineral))return false;
  // Raised banks in the story POIs can project into the gap from well behind
  // the back row. Test each prop's full extent, including large boulders.
  if(bounds.max.x<field.x-field.w-35||bounds.min.x>field.x+field.w+35||
     bounds.min.z>field.front+30||bounds.max.z<field.back-45)return false;
  if(inLane(bounds)||field.homes.some(s=>bounds.max.x>s.minX-.65&&bounds.min.x<s.maxX+.65&&
     bounds.max.z>s.minZ-3&&bounds.min.z<s.maxZ+.82))return true;
  const a=projectedBounds21(bounds);
  return screens.some(s=>a.x1>s.x0-.024&&a.x0<s.x1+.024&&a.y1>s.y0-.032&&a.y0<s.y1+.032);
 }
 world.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const mineral=mesh.userData.geology62!==undefined||mesh.userData.localGeology62||
     mesh.geometry.userData.geology62!==undefined||mesh.userData.naturalRock;
  if(!mineral&&!mesh.userData.ecology104)return;
  if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
  const original=mesh.geometry.boundingBox.clone();
  for(const lod of [mesh.userData.detailedGeometry,mesh.userData.distantGeometry]){
   if(!lod||lod===mesh.geometry)continue;
   if(!lod.boundingBox)lod.computeBoundingBox();original.union(lod.boundingBox);
  }
  if(!mesh.isInstancedMesh){
   bounds.copy(original).applyMatrix4(mesh.matrixWorld);
   if(inFight(mesh,mineral)){const mask=mesh.layers.mask;mesh.layers.mask=0;restore.push(()=>{mesh.layers.mask=mask;});}
   return;
  }
  const count=mesh.count;let write=0,matrices,colors;
  for(let i=0;i<count;i++){
   mesh.getMatrixAt(i,transform);bounds.copy(original).applyMatrix4(transform).applyMatrix4(mesh.matrixWorld);
   if(inFight(mesh,mineral)){
    if(!matrices){matrices=mesh.instanceMatrix.array.slice();colors=mesh.instanceColor?.array.slice();}
    continue;
   }
   if(write!==i){
    mesh.setMatrixAt(write,transform);
    if(mesh.instanceColor){mesh.getColorAt(i,tint);mesh.setColorAt(write,tint);}
   }
   write++;
  }
  if(!matrices)return;
  mesh.count=write;mesh.instanceMatrix.needsUpdate=true;if(colors)mesh.instanceColor.needsUpdate=true;
  restore.push(()=>{
   mesh.count=count;mesh.instanceMatrix.array.set(matrices);mesh.instanceMatrix.needsUpdate=true;
   if(colors){mesh.instanceColor.array.set(colors);mesh.instanceColor.needsUpdate=true;}
  });
 });
 return restore;
}
function clearStoryMargin(){
 if(!currentStoryMargin)return;
 const {group,terrain,materials,texture,restoreRocks}=currentStoryMargin;
 for(const [mesh,original,copy] of terrain)if(mesh.material===copy)mesh.material=original;
 for(const restore of restoreRocks)restore();
 group.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});
 for(const m of materials)m.dispose();texture.dispose();currentStoryMargin=null;
}
function updateStoryMargin(){
 const stage=storyMarginStages[activeScene?.key],story=battle&&!encounter53.active&&battle.kind!=='random'&&stage?battle:null;
 // A story encounter can start while the camera is still leaving exploration.
 // Re-seat its two near corners once the actual command view has settled.
 const idle=story&&story.status==='choose'&&!story.combo&&!story.animation&&!introLocked58();
 const old=currentStoryMargin;
 // The portrait story lens can finish its horizontal fit one frame after
 // its height and eye are final. Use the live view for ray/ground placement.
 if(story)camera.updateMatrixWorld();
 const projection=camera.projectionMatrix.elements;
 const reframed=old&&idle&&(camera.position.distanceToSquared(old.eye)>1||
  camera.quaternion.angleTo(old.orientation)>.014||[0,5,8,9].some(i=>Math.abs(projection[i]-old.frustum[i])>.021)||
  innerWidth!==old.width||innerHeight!==old.height);
 const sameGround=old&&old.story===story&&old.world===world&&old.homes===story?.rankHomes87;
 if(old&&(old.story!==story||old.world!==world||old.homes!==story?.rankHomes87||reframed))clearStoryMargin();
 if(!story||currentStoryMargin||!player||!battle.enemies.length||battle.enemies.some(e=>!e.actor)||!environment102.ground)return;
 const group=new THREE.Group();group.name='Story battlefield margins';group.userData.dynamicFX=true;world.add(group);
 const q=battlefieldFootprint(group),inLane=battleLane(group,q,null),restoreRocks=clearNearbyStoryRocks(q,inLane);
 const scenery=buildMarginScatter(stage,group,q,null,inLane),data=battlefieldMask(q,stage,scenery.stones,true);
 data.origin=new THREE.Vector2();const copies=new Map(),terrain=[];
 world.traverse(mesh=>{
  const old=mesh.material;
  if(!mesh.isMesh||!old?.userData.ground102)return;
  let m=copies.get(old);if(!m){
   m=old.clone();m.onBeforeCompile=old.onBeforeCompile;m.customProgramCacheKey=()=>old.customProgramCacheKey();
   bindBattlefloorFinish(m,data,stage,true);copies.set(old,m);
  }
  terrain.push([mesh,old,m]);mesh.material=m;
 });
 const growth=(sameGround&&old.growth)||(terrain.length?battleGrowthField(terrain.map(([mesh])=>mesh),q.x,q.z,true):null);
 if(growth)group.userData.groundcover=fitBattleGroundcover(world,growth,restoreRocks);
 group.userData.count=scenery.count;group.userData.groundMeshes=terrain.length;
 currentStoryMargin={story,growth,homes:story.rankHomes87,eye:camera.position.clone(),orientation:camera.quaternion.clone(),
  frustum:projection.slice(),width:innerWidth,height:innerHeight,
  world,group,terrain,restoreRocks,materials:[...scenery.materials,...copies.values()],texture:data.texture};
}
const marginRenderBefore=render;
render=function(...args){updateStoryMargin();return marginRenderBefore.apply(this,args);};
