// Register the completed scene, including props added after the original
// world builder. The shared depth/stencil attachment tests actual covered
// pixels, including animated leaf gaps and multiple overlapping obstructions.
// This needs one player-pose draw, no raycast scan and no opacity changes.
function registerPlayerOccluders114(){
 if(!world)return;
 const actorMeshes=new Set(actors.map(a=>a.mesh)),terrain=new Set(world.userData.terrainChunks??[]),buildings=new Set(world.userData.buildings??[]),trees=new Set(scenery.forestMeshes);
 let occluders=0;world.updateMatrixWorld(true);
 world.traverse(o=>{
  if(!o.isMesh||o===visibility63.mesh||!o.geometry)return;
  const materials=Array.isArray(o.material)?o.material:[o.material];
  if(!materials.some(m=>m?.depthWrite))return;
  let architecture=false,effect=false,actor=false;
  for(let p=o;p&&p!==world;p=p.parent){architecture||=buildings.has(p);effect||=!!p.userData.dynamicFX;actor||=actorMeshes.has(p);}
  const ground=terrain.has(o)||o.userData.terrain||o.geometry.attributes.pathMix||o.geometry.attributes.terrainRoad||o.userData.plantKey||o.userData.frontagePath110||o===water||o.userData.waterRole||o.userData.water62===true||o.userData.freshwater38;
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
  // Shared unit boxes/cylinders carry their real dimensions in the transform.
  const bounds=o.geometry.boundingBox?.clone().applyMatrix4(o.matrixWorld),height=bounds?bounds.max.y-bounds.min.y:0;
  const valid=!actor&&!effect&&!ground&&(architecture||trees.has(o)||o.userData.geology62!==undefined||height>.75);
  o.userData.groundSurface69=!!ground;markOccluder63(o,valid);if(valid)occluders++;
 });
 world.userData.playerVisibility114={occluders,mode:'nearest-surface-depth-stencil',playerOnly:true,sceneryOpacityUnchanged:true};
}
const visibilityBuildBefore114=buildWorld;
buildWorld=function(...args){const result=visibilityBuildBefore114(...args);registerPlayerOccluders114();return result;};

// Synchronize at the actual main-camera draw as well as simulation updates.
// Cached arrivals, menus, resize and direct camera moves can render between
// ticks. Secondary views, water mirrors, atlas and combat never reveal actors.
const visibilityPostBefore114=setupPost;
setupPost=function(...args){
 const result=visibilityPostBefore114(...args),draw=renderer.render;
 renderer.render=function(s,c){
  if(s===scene&&c===camera){
   if(world&&!world.userData.playerVisibility114)registerPlayerOccluders114();
   syncSilhouette63();
  }
  return draw.call(this,s,c);
 };
 return result;
};
