// Regional stones share one palette but have weathered, stratified, angular and
// rounded silhouettes. Roads and entrance approaches reserve real clear space.
const naturalRockGeometries=Array.from({length:6},(_,kind)=>{
 const g=new THREE.SphereGeometry(1,kind===2?10:12,8),p=g.attributes.position;
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=Math.sin(x*4.9+kind*2.1+z*3.4)*Math.cos(y*5.7-z*2.3),r=1+n*(kind===0?.07:.14);x*=r;z*=r;
  if(kind===1){x*=.82;y*=1.2;z*=.91;}if(kind===2){x*=1.25;y*=.54;z*=.8;const ledge=1+.09*Math.sin(y*20);x*=ledge;z*=ledge;}if(kind===3){y=Math.min(y,.48+x*.36);z*=1.12;}if(kind===4){x*=.9;y*=.76;z*=1.2;}
  if(y<-.36)y=-.36+(y+.36)*.36;p.setXYZ(i,x,y*r,z);
 }g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData.naturalRock=true;return g;
});
const originalRockMesh=mesh;let rockMaterialWorld=null;const naturalRockMaterials=new Map();
mesh=function(geometry,mat,x,y,z,parent=world){
 const bank=geometry===sharedGeo.brookBankRock,natural=bank||geometry===sharedGeo.rock;
 if(natural){if(rockMaterialWorld!==world){naturalRockMaterials.clear();rockMaterialWorld=world;}const kind=bank?Math.abs(Math.round(x*13+z*7))%3:Math.abs(Math.round(x*17+z*31))%6;
  geometry=naturalRockGeometries[kind];const key=mat.type+mat.color.getHex()+':'+kind;let selected=naturalRockMaterials.get(key);
  if(!selected){selected=mat.clone();selected.onBeforeCompile=mat.onBeforeCompile;selected.customProgramCacheKey=mat.customProgramCacheKey.bind(mat);selected.userData={...mat.userData};selected.color.lerp(new THREE.Color(['#abb5ac','#9baca6','#aaa99c','#b0b5aa','#b9b39f','#8f9c98'][kind]),.24);naturalRockMaterials.set(key,selected);}mat=selected;
 }
 const o=originalRockMesh(geometry,mat,x,y,z,parent);if(natural){o.userData.naturalRock=true;o.userData.bankRock=bank;}return o;
};
const landscapeBeforeClearStreets=batchLandscape;
batchLandscape=function(){
 const rocks=[];world.updateMatrixWorld(true);world.traverse(o=>{if(o.isMesh&&o.userData.naturalRock&&o.parent===world)rocks.push(o);});
 const approaches=(world.userData.buildings??[]).filter(g=>g.userData.door).map(g=>{const door=g.userData.door,dir=door.clone().sub(g.position);dir.y=0;dir.normalize();return{a:[door.x,door.z],b:[door.x+dir.x*4.5,door.z+dir.z*4.5]};});
 const clear=(x,z,r)=>roadDistance(x,z)>r+2.8&&!approaches.some(p=>segmentDistance(x,z,p.a,p.b)<r+1.1)&&!interactables.some(o=>!['villager','elderLight'].includes(o.type)&&Math.hypot(o.x-x,o.z-z)<r+1.15);
 world.userData.rockPlacement={variants:6,moved:0,checked:rocks.length,records:[]};
 for(const o of rocks){const old=o.position.clone(),box=new THREE.Box3().setFromObject(o),radius=Math.max(box.max.x-box.min.x,box.max.z-box.min.z)/2;
  if(!clear(old.x,old.z,radius)){
   let found=null;for(let r=1;r<=16&&!found;r+=.7)for(let i=0;i<20;i++){const a=i*TAU/20,x=old.x+Math.cos(a)*r,z=old.z+Math.sin(a)*r;if(!clear(x,z,radius)||(!o.userData.bankRock&&waterGround(x,z))||!staticFree(x,z,radius*.65))continue;if(o.userData.bankRock&&Math.abs(channelDistance(x,z))>4)continue;found={x,z};break;}
   if(found){o.position.x=found.x;o.position.z=found.z;o.position.y=groundAt(found.x,found.z)+Math.max(.04,o.scale.y*.12);for(const c of colliders)if(c.type==='boulder'&&Math.abs(c.x-old.x)<.01&&Math.abs(c.z-old.z)<.01){c.x=found.x;c.z=found.z;}world.userData.rockPlacement.moved++;}else{o.removeFromParent();colliders=colliders.filter(c=>!(c.type==='boulder'&&Math.hypot(c.x-old.x,c.z-old.z)<.1));continue;}
  }
  world.userData.rockPlacement.records.push({x:o.position.x,z:o.position.z,radius,bank:o.userData.bankRock});
 }
 rebuildColliderGrid();roadNavGraph=null;landscapeBeforeClearStreets();
};
