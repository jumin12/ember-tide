const playerReveal={circle:{value:new THREE.Vector4()},floorPlane:{value:new THREE.Vector4()},blockSize:{value:1},copies:new WeakMap(),sources:new WeakMap(),
 viewport:new THREE.Vector2(),foot:V3(),center:V3(),depth:V3()};

function playerRevealMaterial(source){
 if(!source?.depthWrite||source.isRawShaderMaterial||playerReveal.sources.has(source))return source;
 const cached=playerReveal.copies.get(source);
 if(cached)return cached;

 // Shared materials can also be used by ground meshes. Give blockers a
 // separate shader while retaining their PBR maps, wind and alpha tests.
 const material=source.clone();
 if(source.isShaderMaterial)material.uniforms=source.uniforms;
 material.customProgramCacheKey=()=>source.customProgramCacheKey()+'-player-reveal-above-foot';
 material.onBeforeCompile=function(shader,renderer){
  source.onBeforeCompile.call(this,shader,renderer);
  // Some props copy the shader hook when creating a scene-specific material.
  if(shader.fragmentShader.includes('uniform vec4 playerRevealCircle;'))return;
  shader.uniforms.playerRevealCircle=playerReveal.circle;
  shader.uniforms.playerRevealFloor=playerReveal.floorPlane;
  shader.uniforms.playerRevealBlock=playerReveal.blockSize;
  shader.fragmentShader=`
   uniform vec4 playerRevealCircle,playerRevealFloor;
   uniform float playerRevealBlock;
   float playerRevealBayer2(vec2 p){
    vec2 cell=mod(p,2.);
    return 2.*abs(cell.x-cell.y)+cell.y;
   }
   void applyPlayerReveal(){
    if(playerRevealCircle.z<=0. || gl_FragCoord.w*playerRevealCircle.w<=1.)return;
    float radius=length(gl_FragCoord.xy-playerRevealCircle.xy);
    if(radius>=playerRevealCircle.z)return;
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
 playerReveal.copies.set(source,material);
 playerReveal.sources.set(material,source);
 return material;
}

function updatePlayerReveal(r,c){
 const q=playerReveal,circle=q.circle.value,mesh=player?.mesh;
 if(!mesh?.visible||battle||gameLoading||transition||!c.isPerspectiveCamera||
    (state.mode!=='explore'&&state.mode!=='dialogue'))return;
 c.updateWorldMatrix(true,false);
 mesh.updateWorldMatrix(true,false);
 q.foot.setFromMatrixPosition(mesh.matrixWorld);
 q.center.set(0,player.size*.48,0).applyMatrix4(mesh.matrixWorld);
 // Use the upright sprite's depth, even where the billboard tilts to face the camera.
 q.depth.copy(q.foot);
 q.depth.y+=q.center.distanceTo(q.foot)/(mesh.userData.physicalDepth68?Math.max(.2,Math.abs(c.matrixWorld.elements[5])):1);
 const viewDepth=-q.depth.applyMatrix4(c.matrixWorldInverse).z;
 if(viewDepth<=c.near)return;

 q.center.project(c);
 if(Math.abs(q.center.x)>1.1||Math.abs(q.center.y)>1.1)return;
 const floorY=q.foot.y;
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
 const pixelRatio=width / Math.max(1,r.domElement.clientWidth);
 const halfHeight=Math.hypot((q.center.x-q.foot.x)*width,(q.center.y-q.foot.y)*height)*.5;
 q.blockSize.value=Math.max(1,Math.round(2*pixelRatio));
 circle.set((vp?.x??0)+(q.center.x+1)*width*.5,(vp?.y??0)+(q.center.y+1)*height*.5,
  Math.max(12*pixelRatio,halfHeight*1.62),viewDepth-.035);
}

// Register the completed world, including structures added by the builder.
function registerPlayerOccluders114(){
 if(!world)return;
 const actorMeshes=new Set(actors.map(a=>a.mesh)),terrain=new Set([...(world.userData.terrainChunks??[]),...(world.userData.walkSurfaces??[])]),buildings=new Set(world.userData.buildings??[]),trees=new Set(scenery.forestMeshes);
 let occluders=0;world.updateMatrixWorld(true);
 world.traverse(o=>{
  if(!o.isMesh||!o.geometry)return;
  const materials=Array.isArray(o.material)?o.material:[o.material];
  if(!materials.some(m=>m?.depthWrite))return;
  let architecture=false,effect=false,actor=false;
  for(let p=o;p&&p!==world;p=p.parent){architecture||=buildings.has(p);effect||=!!p.userData.dynamicFX;actor||=actorMeshes.has(p);}
  const ground=terrain.has(o)||o.userData.terrain||o.geometry.attributes.pathMix||o.geometry.attributes.terrainRoad||o.userData.plantKey||o.userData.frontagePath110||o===water||o.userData.waterRole||o.userData.water62===true||o.userData.freshwater38||materials.every(m=>m?.userData.walkablePaving);
  let blocksPlayer=false;
  if(!battle&&!actor&&!effect&&!ground){
   if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   // Shared unit boxes/cylinders carry their actual dimensions in the transform.
   const bounds=o.geometry.boundingBox?.clone().applyMatrix4(o.matrixWorld);
   blocksPlayer=architecture||trees.has(o)||o.userData.geology62!==undefined||!!bounds&&bounds.max.y-bounds.min.y>.75;
  }
  o.userData.groundSurface69=!!ground;
  markGroundStencil63(o);
  const copies=materials.map(m=>blocksPlayer?playerRevealMaterial(m):playerReveal.sources.get(m)??m);
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
