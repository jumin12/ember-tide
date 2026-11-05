// Painting-aligned geometry: the clearing, side banks and distant landscape
// are separate depth surfaces. Native rooted trees and rock volumes use the
// same projected pigment, rather than introducing a conflicting material set.
const combatEnvironment65={built:0,disposed:0,motion:[],last:null};
function buildStageScenery59(){
 const q=stageDepth59,c=encounter53;if(!c.active||!battle)return;if(q.group&&q.stage===c.selected&&Math.abs(q.aspect-camera.aspect)<.01)return;
 clearStageDepth59();q.stage=c.selected;q.aspect=camera.aspect;q.stats.builds++;q.group=new THREE.Group();q.group.name='Reference-matched 3D '+BATTLE_STAGES53[c.selected].name;c.scene.add(q.group);combatEnvironment65.motion=[];
 const spec=BATTLE_SCENERY59[c.selected],night=c.phase55==='night',rng=seeded(65197+Object.keys(BATTLE_SCENERY59).indexOf(c.selected)*107);
 q.time.value=clock;q.water.value=spec.water?1:0;q.falls.value=spec.falls?1:0;q.foliage.value=spec.cave||spec.snow?0:1;c.resources.backdrop.visible=false;c.resources.floor.visible=true;c.scene.fog=null;c.scene.background=new THREE.Color(night?'#152534':'#8fa89d');
 makeStageLandscape59(camera,spec);
 // Keep the actual actor lane level while retaining the raised banks outside
 // it. This is geometry, so contact stays correct during camera movement.
 const cast=[player,...followers,...battle.enemies.map(e=>e.actor)],margin=1.5,
  bounds={minX:Math.min(...cast.map(a=>a.x))-margin,maxX:Math.max(...cast.map(a=>a.x))+margin,minZ:Math.min(...cast.map(a=>a.z))-margin,maxZ:Math.max(...cast.map(a=>a.z))+margin},positions=q.landscape.geometry.attributes.position;
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),outside=Math.hypot(Math.max(bounds.minX-x,0,x-bounds.maxX),Math.max(bounds.minZ-z,0,z-bounds.maxZ)),weight=1-smooth(0,2,outside);if(weight>0)positions.setY(i,mix(positions.getY(i),c.floorY-.025,weight));}
 positions.needsUpdate=true;q.landscape.geometry.computeVertexNormals();
 // Partition the reconstructed geometry into independent ground, banks and
 // distant terrain meshes. No complete scene is left on a single surface.
 const source=q.landscape,g=source.geometry,uv=g.attributes.uv,index=g.index,groups=[[],[],[],[]],used=[new Set(),new Set(),new Set(),new Set()];
 for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)],u=ids.reduce((s,j)=>s+((uv.getX(j)-.5)/q.crop.x+.5),0)/3,v=ids.reduce((s,j)=>s+((uv.getY(j)-.5)/q.crop.y+.5),0)/3,k=v<.4?0:u<.28?1:u>.72?2:3;groups[k].push(...ids);ids.forEach(j=>used[k].add(j));}
 source.removeFromParent();q.landscape=null;
 const names=['Actual 3D clearing and raised foreground banks','Left landscape depth volume','Right landscape depth volume','Distant skyline and terrain'];
 let ground;
 groups.forEach((ids,i)=>{const geometry=geometry59(g.clone());geometry.setIndex(ids);geometry.computeBoundingBox();geometry.computeBoundingSphere();const m=new THREE.Mesh(geometry,source.material);m.name=names[i];m.frustumCulled=false;m.receiveShadow=true;m.userData.combatSurface65=i===0;q.group.add(m);if(i===0)ground=m;});
 q.group.updateMatrixWorld(true);const floorRay=new THREE.Raycaster();
 const floorHeight=(x,z)=>{floorRay.set(V3(x,c.floorY+100,z),V3(0,-1,0));return floorRay.intersectObject(ground,false)[0]?.point.y??NaN;};
 const ray=(u,v)=>V3((u-.5)*2,(v-.5)*2,.5).unproject(q.reference).sub(q.reference.position).normalize(),floorPoint=(u,v)=>{const r=ray(u,v),t=(c.floorY-q.reference.position.y)/r.y;return q.reference.position.clone().addScaledVector(r,clamp(t>0?t:130,5,180));};
 const rockGeos=[0,1,6,9].map(k=>geometry59(rockGeometry62(k).clone())),rockMat=stageMaterial59('rock',spec.stone),rockUV=spec.cave?[[.035,.11],[.965,.12],[.08,.27],[.92,.28]]:[[.018,.07],[.982,.08],[.06,.20],[.94,.21]];
 rockUV.forEach(([u,v],i)=>{const o=new THREE.Mesh(rockGeos[i],rockMat),scale=.35+rng()*.35;o.position.copy(floorPoint(u,v));const seated=floorHeight(o.position.x,o.position.z);if(Number.isFinite(seated))o.position.y=seated;o.rotation.y=rng()*TAU;o.scale.set(scale*1.4,scale*.65,scale);o.name='Solid rock volume matched to the painted bank';o.castShadow=o.receiveShadow=true;q.group.add(o);});
 // The original crown/trunk artwork remains the distant forest. These few
 // genuinely branched foreground trees fit its edges and share its albedo.
 const trees=spec.trees&&!spec.cave&&camera.aspect>=.8?2:0,trunkGeo=geometry59(new THREE.CylinderGeometry(.10,.17,1,7,2)),trunkMat=material59(new THREE.MeshStandardMaterial({map:textures.env62_bark,color:spec.trees==='birch'?'#b6b9a4':'#625438',roughness:1})),leafGeo=geometry59(sprayGeometry30(32).clone()),leafMat=stageMaterial59(spec.trees==='pine'?'pineCanopy':'leaves',spec.leaf,true,true),trunks=new THREE.InstancedMesh(trunkGeo,trunkMat,trees*4),leaves=new THREE.InstancedMesh(leafGeo,leafMat,trees*5),dummy=new THREE.Object3D(),up=V3(0,1,0),rot=new THREE.Quaternion();let ti=0,li=0;
 const branch=(a,b,width)=>{dummy.position.copy(a).lerp(b,.5);dummy.quaternion.copy(rot.setFromUnitVectors(up,b.clone().sub(a).normalize()));dummy.scale.set(width,a.distanceTo(b),width);dummy.updateMatrix();trunks.setMatrixAt(ti++,dummy.matrix);};
 for(let i=0;i<trees;i++){
  const left=i%2===0,u=left?-.045:1.045,v=.18,base=floorPoint(u,v),height=8+rng()*1.4;
  branch(base,base.clone().add(V3(.10,height,0)),2.3);
  for(let j=0;j<3;j++){const angle=j*2.399+i;branch(base.clone().add(V3(0,height*.45,0)),base.clone().add(V3(Math.cos(angle)*1.9,height*.82,Math.sin(angle)*1.6)),.65);}
  for(let j=0;j<5;j++){dummy.position.copy(base).add(V3(Math.cos(j*2.4)*1.5,height*(.77+(j%3)*.06),Math.sin(j*2.4)*1.3));dummy.quaternion.setFromAxisAngle(up,j*1.5);dummy.scale.set(3.6,3.1,3.3);dummy.updateMatrix();leaves.setMatrixAt(li++,dummy.matrix);}
 }
 trunks.name='Connected foreground trunks and branches';leaves.name='Wind-swaying foliage matched to the forest';trunks.castShadow=leaves.castShadow=true;trunks.receiveShadow=leaves.receiveShadow=true;trunks.frustumCulled=leaves.frustumCulled=false;q.group.add(trunks,leaves);
 const blade=geometry59(new THREE.BufferGeometry());blade.setAttribute('position',new THREE.Float32BufferAttribute([-.009,0,0,.009,0,0,.018,.15,.01],3));blade.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));blade.computeVertexNormals();
 const grassCount=spec.cave||spec.snow?0:140,grassMat=stageMaterial59(null,spec.leaf,true),grass=new THREE.InstancedMesh(blade,grassMat,grassCount);
 // Tiny near-ground motion only; no big grass clumps or luminous billboards.
 for(let i=0;i<grassCount;i++){dummy.position.copy(floorPoint(.025+rng()*.95,.025+rng()*.07)).add(V3(0,.014,0));dummy.quaternion.setFromAxisAngle(up,rng()*TAU);dummy.scale.setScalar(.5+rng()*.45);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);}grass.name='Fine rooted wind-blown grass';grass.receiveShadow=true;grass.frustumCulled=false;q.group.add(grass);
 // makeStageLandscape59 supplies independent, reference-aligned flowing lake
 // and waterfall meshes. Their geometry remains in world space during moves.
 q.height65=(x,z)=>floorHeight(c.center.x+x,c.center.z+z);q.group.updateMatrixWorld(true);q.summary={constructed65:true,referenceMatched:true,fullImageGround:false,terrainVertices:used[0].size,environmentVolumes:3,trees,branches:ti,crowns:li,physicalRocks:4,grass:grassCount,water:!!spec.water,falls:!!spec.falls,meshes:q.group.children.length,animated:true,flatCombatPlane:true};combatEnvironment65.built++;combatEnvironment65.last={stage:c.selected,night,summary:q.summary};
}
const environmentClearBefore65=clearStageDepth59;
clearStageDepth59=function(...args){if(stageDepth59.group)combatEnvironment65.disposed++;combatEnvironment65.motion.length=0;const r=environmentClearBefore65(...args);stageDepth59.landscape=null;return r;};
