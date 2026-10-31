// A collider has the same vertical extent as its visible supporting object.
// Low wall caps that have sunk below the terrain can be stepped over.
const obstacleBeforeVertical15=obstacle;
obstacle=function(x,z,w,d,type='solid'){
 obstacleBeforeVertical15(x,z,w,d,type);const c=colliders.at(-1);if(!/(wall|parapet|rail|counter)/i.test(type))return;
 const recent=world?.children.slice(-14)??[];let best=null,score=Infinity;
 for(const o of recent){if(!o.isMesh||o.isInstancedMesh||!o.geometry||o.userData.terrain)continue;o.updateWorldMatrix(true,false);o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld),cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,bw=b.max.x-b.min.x,bd=b.max.z-b.min.z;if(Math.abs(cx-x)>Math.max(.3,w*.2)||Math.abs(cz-z)>Math.max(.3,d*.2)||bw<w*.65||bd<d*.65||bw>w*2.3||bd>d*2.3)continue;const s=Math.abs(cx-x)+Math.abs(cz-z)+Math.abs(bw-w)+Math.abs(bd-d);if(s<score){score=s;best=b;}}
 if(best){c.top=best.max.y;c.bottom=best.min.y;c.verticalExtent=true;}
};
staticFree=function(x,z,r=.4){
 if(x<LAND.minX+r||x>LAND.maxX-r||z<LAND.minZ+r||z>LAND.maxZ-r||waterGround(x,z))return false;
 if(!sceneBuildFilter&&activeScene?.kind!=='overworld'&&!inSceneBounds(x,z,-r))return false;
 const floor=heightAt(x,z);for(const c of colliderGrid.get(colliderKey(x,z))??(colliderGrid.size?[]:colliders)){
  if(c.requestBoard32&&!state.flags.prologue_complete)continue;
  if(Math.abs(x-c.x)>=c.w+r||Math.abs(z-c.z)>=c.d+r)continue;
  if(c.verticalExtent&&(c.top<=floor+.2||c.bottom>=floor+2.7))continue;
  return false;
 }return true;
};
