// One circular contact per fighter, seated on the rendered combat floor.
// This is separate from the directional light shadow and from target rings.
const contactMaterialBefore134=makeContacts39;
makeContacts39=function(...args){const r=contactMaterialBefore134(...args),m=world.userData.contacts39.mesh.material;
 m.fragmentShader=m.fragmentShader.replace('exp(-r*r*3.2)*(1.-smoothstep(.7,1.,r))','exp(-r*r*2.1)*(1.-smoothstep(.78,1.,r))').replace('vec4(.045,.065,.075,a)','vec4(.02,.028,.035,a)');m.needsUpdate=true;return r;
};
function battleContacts134(b){
 if(!b.contacts134){
  const source=world.userData.contacts39;if(!source)return;
  const g=geometry59(source.mesh.geometry.clone()),m=material59(source.mesh.material.clone());
  const mesh=new THREE.InstancedMesh(g,m,32);mesh.name='Circular fighter contact shadows';mesh.frustumCulled=false;mesh.renderOrder=-1;mesh.count=0;b.group.add(mesh);
  b.contacts134={mesh,dummy:new THREE.Object3D(),rows:[]};
 }
 const q=b.contacts134,alpha=q.mesh.geometry.attributes.contactAlpha39,slope=q.mesh.geometry.attributes.contactSlope39,cast=[player,...followers,...battle.enemies.map(e=>e.actor)];let i=0;q.rows=[];
 for(const a of cast){
  if(!a?.mesh.visible||!a.mesh.parent||a.mesh.material.opacity<.03||i===32)continue;
  const id=a.visualId??a.id,silhouette=silhouette87(id),diameter=clamp(silhouette.width*a.size*1.20,1.05,9.5),x=a.x-b.group.position.x,z=a.z-b.group.position.z,r=diameter*.27;
  const y=arenaFloor88(b,x,z),sx=(arenaFloor88(b,x+r,z)-arenaFloor88(b,x-r,z))/(2*r),sz=(arenaFloor88(b,x,z+r)-arenaFloor88(b,x,z-r))/(2*r);
  q.dummy.position.set(x,y+.045,z);q.dummy.scale.set(diameter,1,diameter);q.dummy.rotation.set(0,0,0);q.dummy.updateMatrix();q.mesh.setMatrixAt(i,q.dummy.matrix);
  slope.setXY(i,clamp(sx,-.7,.7),clamp(sz,-.7,.7));alpha.setX(i,.86*a.mesh.material.opacity);
  q.rows.push({id,x,z,y,diameter,alpha:alpha.getX(i)});i++;
 }
 q.mesh.count=i;q.mesh.instanceMatrix.needsUpdate=alpha.needsUpdate=slope.needsUpdate=true;
}
const renderContactsBefore134=renderArena89;
renderArena89=function(c){
 const b=arena88.current;if(!b||!battle)return renderContactsBefore134(c);battleContacts134(b);
 // Suppress the old billboard contacts only for this draw. Their visibility
 // is restored before exploration resumes, including on a failed frame.
 const old=[world.userData.contacts39?.mesh,player?.shadow,...followers.map(a=>a.shadow),...battle.enemies.map(e=>e.actor?.shadow)].filter(Boolean).map(o=>[o,o.visible]);
 try{for(const[o]of old)o.visible=false;return renderContactsBefore134(c);}finally{for(const[o,visible]of old)o.visible=visible;}
};
