const playerReveal={circle:{value:new THREE.Vector4()},floorPlane:{value:new THREE.Vector4()},frontPlane:{value:new THREE.Vector4()},blockSize:{value:1},copies:new WeakMap(),sources:new WeakMap(),
 viewport:new THREE.Vector2(),foot:V3(),center:V3(),depth:V3(),ray:new THREE.Raycaster(),hit:V3(),hits:[],
 buildings:new WeakMap(),scenes:new WeakMap(),always:{value:1}};

function playerRevealMaterial(source,building){
 source=playerReveal.sources.get(source)??source;
 if(!source?.depthWrite||source.isRawShaderMaterial||source.userData.keepSolidForPlayerReveal)return source;
 const lots=!!building?.lots;
 const copies=lots?(building.lotCopies??=new WeakMap()):building?.copies??playerReveal.copies;
 const cached=copies.get(source);
 if(cached)return cached;

 // Shared materials can also be used by ground meshes. Give blockers a
 // separate shader while retaining their PBR maps, wind and alpha tests.
 const material=source.clone();
 if(source.isShaderMaterial)material.uniforms=source.uniforms;
 if(lots)material.defaultAttributeValues={...material.defaultAttributeValues,landmarkLot:[0]};
 material.customProgramCacheKey=()=>source.customProgramCacheKey()+(lots?'-player-reveal-lots':'-player-reveal-sightline');
 material.onBeforeCompile=function(shader,renderer){
  source.onBeforeCompile.call(this,shader,renderer);
  // Some props copy the shader hook when creating a scene-specific material.
  shader.uniforms.playerRevealOccludes=building?.occludes??playerReveal.always;
  if(shader.fragmentShader.includes('void applyPlayerReveal()'))return;
  shader.uniforms.playerRevealCircle=playerReveal.circle;
  shader.uniforms.playerRevealFloor=playerReveal.floorPlane;
  shader.uniforms.playerRevealFront=playerReveal.frontPlane;
  shader.uniforms.playerRevealBlock=playerReveal.blockSize;
  if(lots){
   shader.vertexShader='attribute float landmarkLot;varying float revealLot;\n'+shader.vertexShader.replace(/void\s+main\s*\(\s*(?:void\s*)?\)\s*\{/,main=>main+'\nrevealLot=landmarkLot;');
  }
  shader.fragmentShader=`
   ${lots?'varying float revealLot;':''}
   uniform vec4 playerRevealCircle,playerRevealFloor,playerRevealFront;
   uniform float playerRevealBlock,playerRevealOccludes;
   float playerRevealBayer2(vec2 p){
    vec2 cell=mod(p,2.);
    return 2.*abs(cell.x-cell.y)+cell.y;
   }
   void applyPlayerReveal(){
    if(playerRevealOccludes<.5 || playerRevealCircle.z<=0. || gl_FragCoord.w*playerRevealCircle.w<=1.)return;
    ${lots?'if(mod(floor(playerRevealOccludes/exp2(floor(revealLot+.5))),2.)<.5)return;':''}
    float radius=length(gl_FragCoord.xy-playerRevealCircle.xy);
    if(radius>=playerRevealCircle.z)return;
    if(dot(playerRevealFront.xyz,vec3(gl_FragCoord.xy,1.))+playerRevealFront.w*gl_FragCoord.w<=0.)return;
    // Even when merged with vertical scenery, paving below the actor is solid.
    float height=dot(playerRevealFloor.xyz,vec3(gl_FragCoord.xy,1.))+playerRevealFloor.w*gl_FragCoord.w;
    if(height<=0.)return;
    float opening=1.-smoothstep(playerRevealCircle.z*.71,playerRevealCircle.z,radius);
    vec2 pixel=floor(gl_FragCoord.xy/playerRevealBlock);
    float bayer=(4.*playerRevealBayer2(pixel)+playerRevealBayer2(floor(pixel*.5))+.5)/16.;
    if(opening>bayer)discard;
   }
  `+shader.fragmentShader.replace(/void\s+main\s*\(\s*(?:void\s*)?\)\s*\{/,main=>main+'\napplyPlayerReveal();');
 };
 copies.set(source,material);
 playerReveal.sources.set(material,source);
 return material;
}

// A wide cutout can overlap a house even when its walls miss the actor.
// Only open the building if a rendered surface crosses the camera-to-torso ray.
function revealBuilding114(root){
 let b=playerReveal.buildings.get(root);
 if(!b){
  b={root,box:new THREE.Box3(),meshes:[],copies:new WeakMap(),occludes:{value:0}};
  playerReveal.buildings.set(root,b);
 }
 return b;
}
function updateBuildingSightlines114(c,center,clearance=.035){
 const q=playerReveal,cache=q.scenes.get(world);if(!cache?.list.length)return;
 const ray=q.ray,origin=ray.ray.origin,direction=ray.ray.direction;
 origin.setFromMatrixPosition(c.matrixWorld);
 if(cache.origin.equals(origin)&&cache.center.equals(center)&&cache.clearance===clearance)return;
 cache.origin.copy(origin);cache.center.copy(center);cache.clearance=clearance;
 direction.subVectors(center,origin);
 ray.far=direction.length()-clearance;direction.normalize();
 for(const b of cache.list){
  b.occludes.value=0;
  if(!b.meshes.length||!b.root.visible||!ray.ray.intersectBox(b.box,q.hit)||
     (!b.box.containsPoint(origin)&&q.hit.distanceToSquared(origin)>ray.far*ray.far))continue;
  if(b.core&&!b.lots){
   // Porches, trim and overhanging eaves can touch the player beside a house.
   // Only open the shell after its footprint actually crosses the sightline.
   const local=b.localRay.copy(ray.ray).applyMatrix4(b.inverse);
   if(!b.core.containsPoint(local.origin)&&(!local.intersectBox(b.core,q.hit)||
      q.hit.applyMatrix4(b.root.matrixWorld).distanceToSquared(origin)>ray.far*ray.far))continue;
  }
  for(const mesh of b.meshes){
   if(!mesh.layers.test(c.layers))continue;
   let part=mesh;while(part!==b.root&&part?.visible)part=part.parent;
   if(part!==b.root)continue;
   mesh.raycast(ray,q.hits);
   if(!q.hits.length)continue;
   if(!b.lots){q.hits.length=0;b.occludes.value=1;break;}
   const lots=mesh.geometry.attributes.landmarkLot;
   for(const hit of q.hits)b.occludes.value|=1<<(lots?lots.getX(hit.face.a):0);
   q.hits.length=0;
  }
 }
}
function updatePlayerReveal(r,c){
 const q=playerReveal,circle=q.circle.value,actor=state.mode==='action'?eventAction?.actor:player,mesh=actor?.mesh;
 if(!mesh?.visible||battle||gameLoading||transition||!c.isPerspectiveCamera||
    (state.mode!=='explore'&&state.mode!=='dialogue'&&state.mode!=='action'))return;
 c.updateWorldMatrix(true,false);
 mesh.updateWorldMatrix(true,false);
 q.foot.setFromMatrixPosition(mesh.matrixWorld);
 q.center.set(0,actor.size*.48,0).applyMatrix4(mesh.matrixWorld);
 // Use the upright sprite's depth, even where the billboard tilts to face the camera.
 q.depth.copy(q.foot);
 q.depth.y+=q.center.distanceTo(q.foot)/(mesh.userData.physicalDepth68?Math.max(.2,Math.abs(c.matrixWorld.elements[5])):1);
 const viewDepth=-q.hit.copy(q.depth).applyMatrix4(c.matrixWorldInverse).z;
 if(viewDepth<=c.near)return;

 const clearance=actorRadius(actor)*.4;
 updateBuildingSightlines114(c,q.depth,clearance);
 q.center.project(c);
 if(Math.abs(q.center.x)>1.1||Math.abs(q.center.y)>1.1)return;
 const floorY=q.foot.y,fx=q.foot.x,fz=q.foot.z;
 q.foot.project(c);
 const target=r.getRenderTarget();
 const vp=target?.viewport;
 if(vp)q.viewport.set(vp.z,vp.w);
 else r.getDrawingBufferSize(q.viewport);
 const {x:width,y:height}=q.viewport;
 // Convert a camera ray's screen coordinates to world height per unit depth.
 // Dividing the plane test by depth lets the shader use gl_FragCoord.w directly.
 const projection=c.projectionMatrix.elements,view=c.matrixWorld.elements;
 const rayX=view[1]/projection[0],rayY=view[5]/projection[5],originX=vp?.x??0,originY=vp?.y??0;
 const dx=2*rayX/width,dy=2*rayY/height;
 q.floorPlane.value.set(dx,dy,rayX*(projection[8]-1)+rayY*(projection[9]-1)-view[9]-dx*originX-dy*originY,view[13]-floorY-.13);
 // A wall beside or behind the actor's feet stays opaque at every height.
 const horizontal=Math.hypot(view[12]-fx,view[14]-fz);
 if(horizontal>.01){
  const nx=(view[12]-fx)/horizontal,nz=(view[14]-fz)/horizontal;
  const rx=(nx*view[0]+nz*view[2])/projection[0],ry=(nx*view[4]+nz*view[6])/projection[5];
  const sx=2*rx/width,sy=2*ry/height;
  q.frontPlane.value.set(sx,sy,rx*(projection[8]-1)+ry*(projection[9]-1)-nx*view[8]-nz*view[10]-sx*originX-sy*originY,horizontal-clearance);
 }else q.frontPlane.value.set(0,0,0,1);
 const pixelRatio=width / Math.max(1,r.domElement.clientWidth);
 const halfHeight=Math.hypot((q.center.x-q.foot.x)*width,(q.center.y-q.foot.y)*height)*.5;
 q.blockSize.value=Math.max(1,Math.round(2*pixelRatio));
 circle.set((vp?.x??0)+(q.center.x+1)*width*.5,(vp?.y??0)+(q.center.y+1)*height*.5,
  Math.SQRT2*Math.max(12*pixelRatio,halfHeight*1.62),viewDepth-.035);
}

// Register the completed world, including structures added by the builder.
function registerPlayerOccluders114(){
 if(!world)return;
 const actorMeshes=new Set(actors.map(a=>a.mesh)),terrain=new Set([...(world.userData.terrainChunks??[]),...(world.userData.walkSurfaces??[])]),buildings=new Set(world.userData.buildings??[]),trees=new Set(scenery.forestMeshes);
 const sceneReveal={list:[],origin:V3(Infinity,0,0),center:V3()};
 playerReveal.scenes.set(world,sceneReveal);
 const solid=new Set([world.userData.pump,world.userData.fountain123?.basin].filter(Boolean));
 let occluders=0;world.updateMatrixWorld(true);
 const chunks=new Set(world.userData.staticChunks??[]);if(world.userData.homeRoomShell139)chunks.add(world.userData.homeRoomShell139);
 for(const root of new Set([...buildings,...chunks])){
  const b=revealBuilding114(root);b.meshes.length=0;b.box.makeEmpty();b.occludes.value=0;
  const f=root.userData.footprint;
  if(f?.w>.2&&f.d>.2&&!root.userData.walkThrough){
   b.core=new THREE.Box3(V3(-f.w/2+.06,-1000,-f.d/2+.06),V3(f.w/2-.06,1000,f.d/2-.06));
   b.inverse=new THREE.Matrix4().copy(root.matrixWorld).invert();b.localRay=new THREE.Ray();
  }
  sceneReveal.list.push(b);
 }
 world.traverse(o=>{
  if(!o.isMesh||!o.geometry)return;
  const materials=Array.isArray(o.material)?o.material:[o.material];
  if(!materials.some(m=>m?.depthWrite))return;
  let architecture=null,chunk=null,effect=false,actor=false;
  for(let p=o;p&&p!==world;p=p.parent){
   if(!architecture&&buildings.has(p))architecture=revealBuilding114(p);
   if(!chunk&&chunks.has(p))chunk=revealBuilding114(p);
   effect||=!!p.userData.dynamicFX||solid.has(p)||!!p.userData.keepSolidForPlayerReveal;
   actor||=actorMeshes.has(p);
  }
  const ground=terrain.has(o)||o.userData.terrain||o.geometry.attributes.pathMix||o.geometry.attributes.terrainRoad||o.userData.plantKey||o.userData.frontagePath110||o===water||o.userData.waterRole||o.userData.water62===true||o.userData.freshwater38||materials.every(m=>m?.userData.walkablePaving);
  let blocksPlayer=false;
  if(!battle&&!actor&&!effect&&!ground&&!materials.every(m=>m?.userData.keepSolidForPlayerReveal)){
   if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   // Shared unit boxes/cylinders carry their actual dimensions in the transform.
   const bounds=o.geometry.boundingBox?.clone().applyMatrix4(o.matrixWorld);
   blocksPlayer=!!architecture||trees.has(o)||o.userData.geology62!==undefined||!!bounds&&bounds.max.y-bounds.min.y>.75;
   if(!architecture&&blocksPlayer&&chunk&&!o.isInstancedMesh)architecture=chunk;
   if(architecture&&bounds){architecture.box.union(bounds);architecture.meshes.push(o);}
  }
  o.userData.groundSurface69=!!ground;
  markGroundStencil63(o);
  const copies=materials.map(m=>blocksPlayer?playerRevealMaterial(m,architecture):playerReveal.sources.get(m)??m);
  if(copies.some((copy,i)=>copy!==materials[i]))o.material=Array.isArray(o.material)?copies:copies[0];
  if(blocksPlayer)occluders++;
 });
 world.userData.playerVisibility114={occluders,mode:'dithered-player-cutout',playerOnly:true};
}
const visibilityBuildBefore114=buildWorld;
buildWorld=function(...args){const result=visibilityBuildBefore114(...args);registerPlayerOccluders114();return result;};

// Evaluate on the player camera draw so the cutout follows movement and resize.
// Reflection, shadow and map passes retain their complete scenery.
const visibilityPostBefore114=setupPost;
setupPost=function(...args){
 const result=visibilityPostBefore114(...args),draw=renderer.render;
 renderer.render=function(s,c){
  if(s!==scene||c!==camera)return draw.call(this,s,c);
  if(world&&!world.userData.playerVisibility114)registerPlayerOccluders114();
  updatePlayerReveal(this,c);
  try{return draw.call(this,s,c);}
  finally{playerReveal.circle.value.z=0;}
 };
 return result;
};
