// Grade real floors around authored structures. A centre-point height alone
// lets a hillside cut through the far wall or half of a crystal's pedestal.
const seatedDecalBefore45=groundDecal;
groundDecal=function(...args){const mesh=seatedDecalBefore45(...args);mesh.userData.groundDecal45=true;return mesh;};
function seatingWeight45(x,z,p){const dx=x-p.x,dz=z-p.z,c=Math.cos(p.angle),s=Math.sin(p.angle),lx=dx*c-dz*s,lz=dx*s+dz*c,d=p.radius?Math.max(0,Math.hypot(dx,dz)-p.radius):Math.hypot(Math.max(0,Math.abs(lx)-p.w/2),Math.max(0,Math.abs(lz)-p.d/2));return d>=p.blend?0:1-smooth(0,p.blend,d);}
function seatedGround45(x,z,base){
 const patches=activeScene?.kind==='poi'&&world?.userData.seating45?.patches;if(!patches)return base;
 let sum=base,total=1;
 for(const p of patches){const blend=seatingWeight45(x,z,p);if(blend<=0)continue;if(blend>1-1e-8)return p.level;const weight=blend/(1-blend);sum+=p.level*weight;total+=weight;}
 return sum/total;
}
const seatedGroundBefore45=groundAt;
groundAt=function(x,z,...args){return seatedGround45(x,z,seatedGroundBefore45(x,z,...args));};
const seatedHeightBefore45=heightAt;
function authoredFloor45(x,z){
 if(thresholdSpan39(x,z)||(world.userData.bridges??[]).some(b=>{const p=bridgeLocal15(b,x,z);return Math.abs(p.u)<b.length/2+.15&&Math.abs(p.v)<b.width/2;}))return true;
 if((world.userData.stairTreads??[]).some(s=>Math.abs(z-s.z)<.31&&Math.abs(x-s.x)<2.12))return true;
 return(world.userData.steps19??[]).some(s=>{const p=stairLocal19(s,x,z);return Math.abs(p.cross)<=s.w/2+.15&&p.along>=-s.len/2-.1&&p.along<=s.len/2+(s.landing??0)+.1;});
}
function originalRoadFloor45(x,z,base){
 let best=null,distance=Infinity;
 for(const q of world.userData.seating45?.profiles??[]){const dx=x-q.a[0],dz=z-q.a[1],t=(dx*q.dx+dz*q.dz)/q.len,u=dx*q.dz-dz*q.dx;if(t<0||t>1||Math.abs(u)>q.w/2-.1||Math.abs(u)>=distance)continue;best={q,t,u};distance=Math.abs(u);}
 if(!best)return base;const{q,t,u}=best,fx=clamp((u/q.w+.5)*8,0,7.999999),fz=clamp(t*q.rows,0,q.rows-.000001),ix=Math.floor(fx),iz=Math.floor(fz),sx=fx-ix,sz=fz-iz,n=iz*9+ix,a=q.p[n*3+1],b=q.p[(n+9)*3+1],c=q.p[(n+10)*3+1],d=q.p[(n+1)*3+1];return sx+sz<=1?a+(d-a)*sx+(b-a)*sz:c+(b-c)*(1-sx)+(d-c)*(1-sz);
}
heightAt=function(x,z,...args){
 const original=seatedHeightBefore45(x,z,...args),q=activeScene?.kind==='poi'&&world?.userData.seating45;if(!q)return original;
 if(!q.patches.some(p=>seatingWeight45(x,z,p)>0))return original;
 // Bridges and authored stair treads keep their physical deck heights.
 if(authoredFloor45(x,z))return original;
 let h=seatedGround45(x,z,originalRoadFloor45(x,z,seatedGroundBefore45(x,z,...args)));
 for(const step of world.userData.entrySteps31??[]){if(step.owner.parent!==world)continue;const a=step.owner.rotation.y,c=Math.cos(a),s=Math.sin(a),dx=x-step.owner.position.x,dz=z-step.owner.position.z,lx=dx*c-dz*s-step.x,lz=dx*s+dz*c-step.z;if(Math.abs(lx)<=step.width*.5&&lz>=-.21&&lz<=1)h=Math.max(h,step.y-Math.floor(Math.max(0,lz+.20)/.39)*.07);}
 return h;
};
function seatTerrain45(){
 if(activeScene.kind!=='poi'||world.userData.seating45)return;
 const patches=[];
 for(const g of world.userData.buildings??[]){const f=g.userData.footprint;if(g.parent!==world||!f)continue;patches.push({x:g.position.x,z:g.position.z,w:f.w+1.1,d:f.d+1.1,angle:g.rotation.y,level:g.position.y-.025,blend:8});}
 for(const light of world.userData.lightSites??[])patches.push({x:light.x,z:light.z,radius:6,angle:0,level:light.group.position.y-.025,blend:12});
 const profiles=(world.userData.routeSupports32?.profiles??[]).map(p=>({...p,p:p.p.array.slice()}));
 const q=world.userData.seating45={patches,profiles};if(!patches.length)return;
 const inverse=new THREE.Matrix4(),point=V3(),seen=new Set(),surfaces=[...world.userData.terrainChunks??[]];
 world.userData.routeSupports32?.group.traverse(o=>{if(o.isMesh)surfaces.push(o);});
 for(const mesh of surfaces){const g=mesh.userData.fullGeometry??mesh.geometry;if(seen.has(g)||!g?.attributes.position)continue;seen.add(g);mesh.updateMatrixWorld(true);inverse.copy(mesh.matrixWorld).invert();const p=g.attributes.position,offset=mesh.userData.routeSupport32 ? .018 : 0;
  for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);if(patches.some(p=>seatingWeight45(point.x,point.z,p)>0)&&!authoredFloor45(point.x,point.z))point.y=seatedGround45(point.x,point.z,point.y-offset)+offset;point.applyMatrix4(inverse);p.setXYZ(i,point.x,point.y,point.z);}
  p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();mesh.geometry=g;
 }
 // Keep grass and tree roots attached to the regraded ground. Their stored
 // matrices and occlusion bounds receive the same vertical correction.
 const foliage=new Set([...perf.plants,...scenery.forestMeshes]),matrix=new THREE.Matrix4();
 for(const mesh of perf.plants){let changed=false;for(let i=0;i<(mesh.userData.total??mesh.count);i++){mesh.getMatrixAt(i,matrix);const x=matrix.elements[12],z=matrix.elements[14];if(!patches.some(p=>seatingWeight45(x,z,p)>0))continue;const old=seatedGroundBefore45(x,z),delta=seatedGround45(x,z,old)-old;if(Math.abs(delta)<1e-5)continue;matrix.elements[13]+=delta;mesh.setMatrixAt(i,matrix);changed=true;}if(changed){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}}
 for(const t of scenery.trees){const target=seatedGround45(t.x,t.z,t.y),delta=target-t.y;if(Math.abs(delta)<1e-5)continue;t.y=target;for(const b of [t.box,...t.cover30??[]].filter(Boolean)){b.min.y+=delta;b.max.y+=delta;}for(const b of t.bindings??[]){b.matrix.elements[13]+=delta;b.mesh.setMatrixAt(b.index,b.matrix);b.mesh.instanceMatrix.needsUpdate=true;foliage.add(b.mesh);}}
 for(const mesh of foliage)if(mesh.isInstancedMesh)mesh.computeBoundingSphere();
 heightCache41.cells.clear();heightCache41.frame=-1;roadNavGraph=null;treeCutCache30=null;q.surfaces=seen.size;
 const decalRay=new THREE.Raycaster();
 world.traverse(mesh=>{if(!mesh.userData.groundDecal45||!mesh.geometry?.attributes.position)return;mesh.updateMatrixWorld(true);inverse.copy(mesh.matrixWorld).invert();const g=mesh.geometry,p=g.attributes.position;for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);decalRay.set(V3(point.x,200,point.z),V3(0,-1,0));const visible=decalRay.intersectObjects(surfaces,false)[0]?.point.y??-Infinity;point.y=Math.max(heightAt(point.x,point.z),visible)+.045;point.applyMatrix4(inverse);p.setXYZ(i,point.x,point.y,point.z);}p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();});
 for(const a of actors)updateActor(a,0);
}
const seatedBuildBefore45=buildWorld;
buildWorld=function(...args){const result=seatedBuildBefore45(...args);seatTerrain45();return result;};
