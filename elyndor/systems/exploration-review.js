// RE094: reuse the existing slope-aware contact batch. Directional sprite
// shadows and every combat contact retain their existing behavior.
const contactsBefore119=updateContacts39;
updateContacts39=function(...args){
 const result=contactsBefore119(...args),q=world?.userData.contacts39;
 if(!q||battle||encounter53.active||!['poi','overworld','interior'].includes(activeScene?.kind))return result;
 const alpha=q.mesh.geometry.attributes.contactAlpha39;let index=0;
 for(const a of actors){
  if(index>=q.mesh.count)break;
  if(!a.mesh.visible||!a.mesh.parent||a.mesh.material.opacity<.03)continue;
  if(a===player||followers.includes(a)){
   const p=a.mesh.position,macro=activeScene.kind==='overworld',size=clamp(a.size*(macro?.40:.64),.95,macro?2.4:2.8);
   q.dummy.position.set(p.x,heightAt(p.x,p.z)+.065,p.z);
   q.dummy.scale.set(size,1,size);q.dummy.rotation.set(0,0,0);q.dummy.updateMatrix();
   q.mesh.setMatrixAt(index,q.dummy.matrix);alpha.setX(index,macro?((state.worldMinutes+1440)%1440>=360&&(state.worldMinutes+1440)%1440<1170?.58:0):.43);
   // Circular contact remains fixed in world scale at every heading and speed.
   // Night uses the real moon/lamp shadow rather than a daylight contact disc.
   const casts=macro?alpha.getX(index)===0:true;
   if(a.mesh.castShadow!==casts){a.mesh.castShadow=casts;shadow36.last=-100;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;}
  }
  index++;
 }
 q.mesh.instanceMatrix.needsUpdate=true;alpha.needsUpdate=true;return result;
};
