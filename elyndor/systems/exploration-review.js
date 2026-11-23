// RE094: reuse the existing slope-aware contact batch. Directional sprite
// shadows and every combat contact retain their existing behavior.
const contactsBefore119=updateContacts39;
// Cache only the nearby floor mesh candidates. Ray hits use the rendered
// triangles, including raised roads and plaza repairs, rather than an analytic
// height that can sit below them. Stationary contacts do no further ray work.
const contactFloor133={world:null,surfaces:[],ray:new THREE.Raycaster(),down:V3(0,-1,0)};
function contactSeat133(a,size){
 const q=contactFloor133,p=a.mesh.position;
 if(q.world!==world){q.world=world;q.sample=terrainSampler64().sample;q.surfaces=[...new Set([...(world.userData.walkSurfaces??[]),...(world.userData.routeSupports32?.group.children??[])])].filter(o=>o.isMesh).map(o=>{o.updateMatrixWorld(true);return{o,box:new THREE.Box3().setFromObject(o)};});}
 const old=a.contactSeat133;
 if(old?.world===world&&Math.hypot(old.x-p.x,old.z-p.z)<.10&&Math.abs(old.size-size)<.001)return old;
 const floors=q.surfaces.filter(v=>p.x>=v.box.min.x-size&&p.x<=v.box.max.x+size&&p.z>=v.box.min.z-size&&p.z<=v.box.max.z+size).map(v=>v.o);
 const sample=(x,z)=>{const analytic=q.sample(x,z);if(!floors.length)return analytic;q.ray.set(V3(x,analytic+2,z),q.down);q.ray.far=4;const hit=q.ray.intersectObjects(floors,false).find(h=>Math.abs(h.point.y-analytic)<1.4);return hit?.point.y??analytic;};
 const r=size*.28,y=sample(p.x,p.z),sx=(sample(p.x+r,p.z)-sample(p.x-r,p.z))/(2*r),sz=(sample(p.x,p.z+r)-sample(p.x,p.z-r))/(2*r);
 return a.contactSeat133={world,x:p.x,z:p.z,size,y:y+.045,sx:clamp(sx,-.9,.9),sz:clamp(sz,-.9,.9)};
}
updateContacts39=function(...args){
 const result=contactsBefore119(...args),q=world?.userData.contacts39;
 if(!q||battle||encounter53.active||!['poi','overworld','interior'].includes(activeScene?.kind))return result;
 const alpha=q.mesh.geometry.attributes.contactAlpha39,slope=q.mesh.geometry.attributes.contactSlope39;let index=0;
 for(const a of actors){
  if(index>=q.mesh.count)break;
  if(!a.mesh.visible||!a.mesh.parent||a.mesh.material.opacity<.03)continue;
  if(a===player||followers.includes(a)||a.npc){
   const p=a.mesh.position,macro=activeScene.kind==='overworld',visual=macro&&a.party?overworldPartyVisual159/1.60:1,size=clamp(a.size*Math.abs(a.mesh.scale.x)*(macro?.78:.86),1.15*visual,(macro?5.4:3.8)*visual),seat=contactSeat133(a,size);
   q.dummy.position.set(p.x,seat.y,p.z);
   q.dummy.scale.set(size,1,size);q.dummy.rotation.set(0,0,0);q.dummy.updateMatrix();
   q.mesh.setMatrixAt(index,q.dummy.matrix);slope.setXY(index,seat.sx,seat.sz);alpha.setX(index,macro?((state.worldMinutes+1440)%1440>=360&&(state.worldMinutes+1440)%1440<1170?.86:0):a.npc?.78:.82);
   // Circular contact remains fixed in world scale at every heading and speed.
   // Night uses the real moon/lamp shadow rather than a daylight contact disc.
   const casts=macro?alpha.getX(index)===0:true;
   if(a.mesh.castShadow!==casts){a.mesh.castShadow=casts;shadow36.last=-100;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;}
  }
  index++;
 }
 q.mesh.renderOrder=3;q.mesh.instanceMatrix.needsUpdate=true;alpha.needsUpdate=slope.needsUpdate=true;return result;
};

// The legacy animation update re-enabled projected sprite shadows after the
// overworld's circular-contact pass disabled them. Apply that same day/night
// policy at the end of each actor update, invalidating depth only on a real
// change instead of toggling it twice every simulation tick.
const contactActorBefore155=updateActor;
updateActor=function(a,...args){
 const previous=a?.mesh?.castShadow,result=contactActorBefore155(a,...args);
 if(!a?.mesh||battle||encounter53.active||state.mode==='title'||activeScene?.kind!=='overworld'||!(a.party||a.npc))return result;
 const minute=(state.worldMinutes%1440+1440)%1440,night=minute<360||minute>=1170;
 a.mesh.castShadow=night&&!a.pixelReleased&&a.mesh.visible;
 if(a.mesh.castShadow!==previous){shadow36.last=-100;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;}
 return result;
};
