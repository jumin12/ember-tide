// Individually placed Homeward landings belong to each town's streetscape.
// No center-of-town search: markets, wells, door courts and quays stay clear.
const HOME_FRONTAGES140={
 brookstead:{portal:[-132,84.5],keeper:[-129,86],keeperApproach:[-129,88],yaw:0,approach:[0,3.1],court:[4.15,2.25],shortLead:true,scale:.76,finish:'cobble',tone:'#b6b7a3',plants:[],label:'Garden landing between the left stairways'},
 fern:{portal:[84,63],keeper:[87.5,65.5],yaw:-.26,scale:.78,finish:'cobbleB',tone:'#b2bca5',plants:[[-2.25,-.9],[2.25,-.9]],label:'Woodland lane landing'},
 highmere:{portal:[-89,-94],keeper:[-85.5,-91.5],yaw:.10,scale:.78,finish:'cobble',tone:'#c5c8bd',plants:[[2.25,-.8]],label:'Hall-side landing'},
 alder:{portal:[129,-103],keeper:[124.5,-104],keeperApproach:[124.5,-106],yaw:.14,scale:.76,finish:'cobbleB',tone:'#c2bba4',plants:[[-2.25,-1]],label:'Market garden landing'},
 relief:{portal:[17,-144],keeper:[20,-141.5],yaw:.16,scale:.76,finish:'cobbleB',tone:'#bbbda9',plants:[[-2.25,-.7]],label:'Wayfarer landing'},
 harbor:{portal:[310,62.5],keeper:[314,65],yaw:.12,scale:.76,finish:'cobble',tone:'#bdc5bd',plants:[[-2.25,-.65]],label:'Upper harbor landing'}
};
// The Brookstead arch sits on the existing flat ground at the foot of the
// left stair pair. Its paving follows that ground; no raised earth shelf is
// imposed on the planted slope behind it.
function homeSitePoint140(site,x,z){const c=Math.cos(site.yaw),s=Math.sin(site.yaw);return {x:site.portal[0]+x*c+z*s,z:site.portal[1]-x*s+z*c};}
function onHomeLanding140(site,x,z,pad=0){
 const dx=x-site.portal[0],dz=z-site.portal[1],c=Math.cos(site.yaw),s=Math.sin(site.yaw),u=dx*c-dz*s,v=dx*s+dz*c;
 if(Math.hypot(x-site.keeper[0],z-site.keeper[1])<2.2+pad)return true;
 const [rx,rz]=site.court??[3.15,2.85];if((u/(rx+pad))**2+((v-.55)/(rz+pad))**2<1)return true;
 const a=homeSitePoint140(site,0,2),b=homeSitePoint140(site,0,site.shortLead?2.8:5.1);return segmentDistance(x,z,[a.x,a.z],[b.x,b.z])<1.0+pad;
}
// Reserve the authored landing before the native trees and garden beds are
// batched. The surrounding planting remains, without a trunk or border across
// the portal court, and without hiding foliage only after shadows are baked.
function brookHomeCourt140(x,z){return activeScene?.kind==='poi'&&activeScene.key==='brookstead'&&!encounter53.active&&onHomeLanding140(HOME_FRONTAGES140.brookstead,x,z,.45);}
function brookHomeSightline140(x,z){const site=HOME_FRONTAGES140.brookstead;return activeScene?.kind==='poi'&&activeScene.key==='brookstead'&&!encounter53.active&&Math.abs(x-site.portal[0])<2.4&&z>site.portal[1]+4&&z<site.portal[1]+23;}
const homeCourtTreeBefore140=buildSolidTree;
buildSolidTree=function(x,z,...args){if(brookHomeCourt140(x,z)||brookHomeSightline140(x,z))return null;return homeCourtTreeBefore140(x,z,...args);};
const homeCourtBedBefore140=brookRouteClear132;
brookRouteClear132=function(x,z,...args){const site=HOME_FRONTAGES140.brookstead,clear=activeScene?.key==='brookstead'&&homeFootingClear141(site,x,z,1.15);return !clear&&homeCourtBedBefore140(x,z,...args);};
// Let the native habitat planner reserve complete gardens, rather than
// cutting a portal-shaped hole out of an existing raised flower bed.
const homeEcologyBefore141=addScenicEcology104;
addScenicEcology104=function(...args){
 const site=activeScene?.kind==='poi'&&HOME_FRONTAGES140[activeScene.key];if(!site)return homeEcologyBefore141(...args);
 const anchors=[site.portal,site.keeper].map(([x,z])=>({x,z,type:'homeGroundReservation141'}));interactables.push(...anchors);
 try{return homeEcologyBefore141(...args);}finally{for(const a of anchors){const i=interactables.indexOf(a);if(i>=0)interactables.splice(i,1);}}
};
const homeLandingFreeBefore140=staticFree;
staticFree=function(x,z,r=.4,...args){
 const site=world?.userData.townHousing140;
 // A short, designed shoulder makes the new landing reachable. Only the old
 // route mask is bypassed here; actual scenery and water still block movement.
 if(activeScene?.kind==='poi'&&site&&onHomeLanding140(site,x,z,-Math.min(r,.5)))return boundaryFreeBefore46(x,z,r,...args);
 return homeLandingFreeBefore140(x,z,r,...args);
};
function homeLandingMesh140(site,parent){
 // The town's original terrain is the floor. Keep only the arch's actual
 // stone foot, with no circular paving decal, extra kerb or floating flags.
 for(const [x,z]of site.plants){const p=homeSitePoint140(site,x,z);if(!boundaryFreeBefore46(p.x,p.z,.55))continue;const pot=homeDecorModel139('homePlant139',parent,homeStyle139(activeScene.key));pot.position.set(p.x,heightAt(p.x,p.z)+.045,p.z);pot.scale.setScalar(.74);obstacle(p.x,p.z,.78,.78,'portal planter');}
}
function homeFootingClear141(site,x,z,pad=0){
 if(Math.hypot(x-site.portal[0],z-site.portal[1])<site.scale*1.68+pad)return true;
 if(Math.hypot(x-site.keeper[0],z-site.keeper[1])<1.2+pad)return true;
 const a=homeSitePoint140(site,0,1.5),b=homeSitePoint140(site,...(site.approach??[0,4.5]));
 return segmentDistance(x,z,[a.x,a.z],[b.x,b.z])<.72+pad;
}
function homeFootBox141(site){const [x,z]=site.portal,y=groundAt(x,z),r=1.65*site.scale+.26;return new THREE.Box3(V3(x-r,y-.08,z-r),V3(x+r,y+.65,z+r));}
function clearHomeFootingRocks141(site){
 world.updateMatrixWorld(true);const protectedBox=homeFootBox141(site),matrix=new THREE.Matrix4(),combined=new THREE.Matrix4(),box=new THREE.Box3(),zero=V3(0,0,0),removed=[];
 const meshes=[];world.traverse(o=>{if(o.isMesh&&(o.geometry.userData.geology62!==undefined||o.userData.naturalRock||o.userData.localGeology62||o.userData.debris62||o.userData.ecology104&&/stone|gardenEdging/.test(o.name)))meshes.push(o);});
 for(const o of meshes){o.geometry.computeBoundingBox();if(o.isInstancedMesh){let changed=false;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);combined.multiplyMatrices(o.matrixWorld,matrix);box.copy(o.geometry.boundingBox).applyMatrix4(combined);if(!box.intersectsBox(protectedBox))continue;matrix.scale(zero);o.setMatrixAt(i,matrix);for(const q of world.userData.localRocks62??[])if(q.mesh===o&&q.index===i)q.scale.set(0,0,0);removed.push({kind:'rock',instance:i});changed=true;}if(changed)o.instanceMatrix.needsUpdate=true;}
  else{box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);if(box.intersectsBox(protectedBox)){o.removeFromParent();removed.push({kind:'rock',name:o.name});}}
 }
 colliders=colliders.filter(c=>!['rock','boulder','weathered crag'].includes(c.type)||!protectedBox.intersectsBox(new THREE.Box3(V3(c.x-c.w,-100,c.z-c.d),V3(c.x+c.w,100,c.z+c.d))));
 world.userData.homeFooting141={nativeGround:groundAt(...site.portal),removedRocks:removed.length,protectedRadius:1.65*site.scale+.26};
}
function seatTownPortal141(portal){
 const foot=portal.children.find(o=>o.geometry?.type==='CylinderGeometry');if(!foot)return;
 portal.updateWorldMatrix(true,true);const p=foot.geometry.attributes.position,at=V3();
 for(let i=0;i<p.count;i++)if(p.getY(i)<0){at.fromBufferAttribute(p,i);foot.localToWorld(at);at.y=heightAt(at.x,at.z)-.028;foot.worldToLocal(at);p.setY(i,at.y);}
 p.needsUpdate=true;foot.geometry.computeVertexNormals();foot.geometry.computeBoundingBox();foot.geometry.computeBoundingSphere();foot.userData.groundSeated141=true;
}
function clearHomeLandingCover140(site){
 let cleared=0;const matrix=new THREE.Matrix4(),combined=new THREE.Matrix4(),box=new THREE.Box3(),protectedBox=homeFootBox141(site),zero=V3(0,0,0),position=V3(),meshes=new Set(world.userData.plantMeshes??[]);
 world.updateMatrixWorld(true);world.traverse(o=>{if(o.isInstancedMesh&&(o.geometry.userData.sculpt103||o.material?.userData.realVegetation103))meshes.add(o);});
 for(const im of meshes){const kind=im.userData.plantKey??im.geometry.userData.sculpt103??im.material?.userData.realVegetation103;if(!['grassBlades','flowers','fern','shrub'].includes(kind))continue;let changed=false;im.geometry.computeBoundingBox();
  for(let i=0;i<im.count;i++){im.getMatrixAt(i,matrix);combined.multiplyMatrices(im.matrixWorld,matrix);position.setFromMatrixPosition(combined);box.copy(im.geometry.boundingBox).applyMatrix4(combined);if(!box.intersectsBox(protectedBox)&&!homeFootingClear141(site,position.x,position.z,.12))continue;matrix.scale(zero);im.setMatrixAt(i,matrix);if(im.userData.plantOriginal?.[i])im.userData.plantOriginal[i].copy(matrix);cleared++;changed=true;}
  if(changed)im.instanceMatrix.needsUpdate=true;
 }
 return cleared;
}
function addTownHousing140(){
 const site=HOME_FRONTAGES140[activeScene?.key];if(activeScene?.kind!=='poi'||!site||world.userData.homeKeeper139)return;
 world.userData.townHousing140=site;
 clearHomeFootingRocks141(site);
 const [x,z]=site.portal,[kx,kz]=site.keeper,y=heightAt(x,z),first=colliders.length,root=new THREE.Group();root.name=site.label;world.add(root);
 homeLandingMesh140(site,root);const portal=homePortal139(x,z,'Visit your home','townHomePortal139');portal.position.y=y;portal.rotation.y=site.yaw;portal.scale.setScalar(site.scale);portal.userData.townPortal140=true;seatTownPortal141(portal);
 // The round stone foot is solid too, rather than allowing boots through it.
 const body=colliders.at(-1);body.w=body.d=1.65*site.scale;body.homePortal140=true;
 const service=interactables.at(-1),entry=homeSitePoint140(site,0,2.15);Object.assign(service,{x:entry.x,z:entry.z,radius:2.9,visualHeight:1.6});
 rebuildColliderGrid();const actor=createHomeKeeper139(kx,kz),front=homeSitePoint140(site,...(site.approach??[0,4.5]));
 const approach=(x,z)=>{const options=[{x,z},...Array.from({length:16},(_,i)=>({x:x+Math.cos(i/16*TAU)*1.2,z:z+Math.sin(i/16*TAU)*1.2}))];return options.find(p=>staticFree(p.x,p.z,.55)&&findRoute(player,p,[]));};
 const keeperApproach=approach(...(site.keeperApproach??[kx,kz+1.9])),portalApproach=approach(front.x,front.z);
 if(actor){actor.home={x:kx,z:kz};actor.mesh.layers.enable(1);actor.interaction.approach139=keeperApproach;}
 const cleared=clearHomeLandingCover140(site);for(const group of [root,portal])group.traverse(o=>{o.layers.enable(1);if(o.isMesh&&!o.userData.dynamicFX){o.updateMatrix();perf.staticMeshes.push(o);}});
 world.userData.homeService139={x,z,y,label:site.label,yaw:site.yaw,scale:site.scale,approach140:portalApproach,keeperApproach140:keeperApproach,cleared140:cleared,colliders:colliders.slice(first)};
 world.userData.homeNeedsRegister139=true;world.userData.navCache?.clear();roadNavGraph=null;rebuildColliderGrid();world.updateMatrixWorld(true);renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;shadowBudget138.at=-Infinity;
}
