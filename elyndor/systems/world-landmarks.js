// Readable destination silhouettes use the existing world palette. Each base
// sits above its complete footprint, rather than sampling only one terrain point.
function worldSiteModel45(key,p){
 let [x,z]=p.node;const root=new THREE.Group(),radius=p.kind==='clearing'?3.2:4.5;
 const clear=(x,z)=>{
  if(Object.values(POIS).some(q=>q.kind==='town'&&Math.hypot(x-q.node[0],z-q.node[1])<75)||macroRoadInfo15(x,z).d<radius+4.5||spans38.some(b=>{const q=bridgeLocal15(b,x,z);return Math.abs(q.u)<b.length/2+radius+3&&Math.abs(q.v)<b.width/2+radius+1;}))return false;
  return[[0,0],...[-1,1].flatMap(dx=>[-1,1].map(dz=>[dx*radius,dz*radius]))].every(([dx,dz])=>macroGround(x+dx,z+dz)>=0&&!hydroSample38(x+dx,z+dz).wet);
 };
 if(!clear(x,z))outer:for(let r=2;r<=18;r+=2)for(let i=0;i<24;i++){const a=i*TAU/24,xx=p.node[0]+Math.cos(a)*r,zz=p.node[1]+Math.sin(a)*r;if(clear(xx,zz)){x=xx;z=zz;break outer;}}
 const floor=Math.max(macroGround(x,z),...[-1,1].flatMap(dx=>[-1,1].map(dz=>macroGround(x+dx*radius,z+dz*radius))));
 root.position.set(x,floor+.04,z);root.userData.poiLandmark45=key;root.userData.siteFootprints45=[{x,z,w:radius*2,d:radius*2,floor:floor+.04}];root.userData.persistentLandmark16=true;root.name='destination-'+key;world.add(root);world.userData.buildings.push(root);
 const stone=(xx,yy,zz,w,h,d)=>block16(root,xx,yy,zz,w,h,d,'wall','#bbc5b2');
 if(p.kind==='clearing'){
  for(const[r,h,y]of[[3.2,.6,.1],[2.65,.4,.6],[2.1,.35,.98]])piece16(root,geo16('world-light-plinth45-'+r,()=>new THREE.CylinderGeometry(r,r+.12,h,12)),'wall','#c3c9b4',0,y,0);
  const crystal=piece16(root,geo16('world-light45',()=>new THREE.OctahedronGeometry(1.55,1)),'lightFacets','#9cd9d2',0,3.8,0,1,1.6,1);crystal.material.emissive.set('#76aaa9');crystal.material.emissiveMap=crystal.material.map;crystal.material.emissiveIntensity=.25;
  for(const side of[-1,1]){stone(side*2.55,1.1,0,.5,1.7,.5);block16(root,side*2.55,2,0,.65,.22,.65,'metal','#baa878');}
  obstacle(x,z,4.8,4.8,'world Light pedestal');
 }else if(p.kind==='trail'){
  stone(0,.08,0,7,.65,5.6);for(const dx of[-2.8,2.8])for(const dz of[-2,2]){block16(root,dx,2.2,dz,.5,4.2,.5,'wood','#9c8059');obstacle(x+dx,z+dz,.65,.65,'world watchpost');}
  roof16(root,0,4.4,0,7.2,2.1,6.1,key==='snow'?'#b1c6c8':'#7d9e96',false);stone(-3,1.2,0,.55,2.1,4.2);stone(3,1.2,0,.55,2.1,4.2);
 }else{
  stone(0,-.08,0,9,.8,7.5);for(const side of[-1,1]){stone(side*3.1,2.7,0,1.55,5.5,2.1);stone(side*3.1,5.55,0,2,.45,2.5);obstacle(x+side*3.1,z,1.9,2.5,'world ruin pier');}
  stone(0,5.7,0,7.6,.9,2.4);block16(root,0,5.75,1.24,1.3,.6,.08,'metal','#baa97d');
 }
 root.updateMatrixWorld(true);createInteraction('location',x,z+8,'Enter '+p.name);Object.assign(interactables.at(-1),{poi:key,radius:10,visualHeight:.2});
 world.userData.landmarks45??={};world.userData.landmarks45[key]=root;
}
