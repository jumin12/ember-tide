// Three.js tests each chunk against each camera, including reflection and shadow
// cameras. A distance test on the chunk centre must not hide a visible edge.
const viewCoverage={shadowWidth:0,shadowHeight:0,footprint:[],frames:0};
const selectWorldLod=updateRenderBudget;
updateRenderBudget=function(force=false){
 selectWorldLod(force);if(!world)return;
 for(const m of [...perf.plants,...scenery.forestMeshes,...world.userData.terrainChunks??[]]){
  m.visible=true;m.frustumCulled=true;
  if(m.material.uniformsForDistance)m.material.uniformsForDistance.range.value.set(10000,11000);
 }
 for(const g of [...world.userData.staticChunks??[],...world.userData.buildings??[]])g.visible=true;
};
function fitVisibleShadows(){
 if(!player||!camera||!sun)return;camera.updateMatrixWorld();sun.updateMatrixWorld(true);sun.target.updateMatrixWorld(true);sun.shadow.updateMatrices(sun);
 const c=sun.shadow.camera,base=heightAt(player.x,player.z),points=[],direction=sun.position.clone().sub(sun.target.position).normalize(),reach=clamp(18/Math.max(.2,direction.y),12,65);
 for(const y of[base-4,base+20])for(const [x,z]of[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]){
  const ray=new THREE.Ray(camera.position.clone(),V3(x,z,.5).unproject(camera).sub(camera.position).normalize()),t=(y-ray.origin.y)/ray.direction.y;if(t<=0)continue;
  const p=ray.at(Math.min(t,camera.far*.95),V3());points.push(p);points.push(p.clone().add(V3(direction.x*reach,18,direction.z*reach)));
 }
 if(!points.length)return;
 const box=new THREE.Box3().setFromPoints(points.map(p=>p.clone().applyMatrix4(c.matrixWorldInverse))),width=Math.ceil((box.max.x-box.min.x+12)/8)*8,height=Math.ceil((box.max.y-box.min.y+12)/8)*8;
 const right=V3().setFromMatrixColumn(c.matrixWorld,0),up=V3().setFromMatrixColumn(c.matrixWorld,1),stepX=width/sun.shadow.mapSize.x,stepY=height/sun.shadow.mapSize.y;
 const originX=right.dot(c.position),originY=up.dot(c.position),cx=Math.round(((box.min.x+box.max.x)/2+originX)/stepX)*stepX-originX,cy=Math.round(((box.min.y+box.max.y)/2+originY)/stepY)*stepY-originY;
 c.left=cx-width/2;c.right=cx+width/2;c.bottom=cy-height/2;c.top=cy+height/2;c.near=Math.max(.1,-box.max.z-35);c.far=Math.max(c.near+10,-box.min.z+35);c.updateProjectionMatrix();sun.shadow.updateMatrices(sun);
 viewCoverage.shadowWidth=width;viewCoverage.shadowHeight=height;viewCoverage.footprint=points.slice(0,16).map(p=>p.toArray());viewCoverage.frames++;
}
const renderWithVisibleGeometry=render;
render=function(){if(renderer&&world)fitVisibleShadows();renderWithVisibleGeometry();};
