// A final shared quality gate, applied to each of the twenty authored sets.
// Habitat identities and the approved camera/panorama/lens remain unchanged.
STAGE_SETS125.grassTwilight.extra=[...(STAGE_SETS125.grassTwilight.extra??[]),'woodWeathered101'];
localStone125=function(b,x,z,sx,sy,sz,variant=0,key=STAGE_SETS125[encounter53.selected].stone){
 const seed=(variant*13+Math.floor(Math.abs(x*17+z*31)))%24,g=arenaGeometry88(b,'scenic-rock134-'+seed,()=>{const g=riverRock134(seed).clone();g.userData.weathered104=true;return g;}),m=detailedStone105(key,b);
 sy=Math.max(sy,Math.sqrt(sx*sz)*.43);const rotation=new THREE.Quaternion().setFromAxisAngle(axis24,b.rng()*TAU),at=V3(x,arenaFloor88(b,x,z)-sy*.11,z),size=V3(sx,sy,sz),box=g.boundingBox.clone().applyMatrix4(new THREE.Matrix4().compose(at,rotation,size));
 if(!supportedRear113(b,x,z,Math.max(sx,sz))||stanceIntersects105(box,fighterStances105(b))||stoneOccludes105(box,b,fighterSightlines105(b)))return;
 arenaInstance88(b,'stage134-'+key+'-'+seed,g,m,at,size,rotation);b.counts.rocks++;
};
const dressBefore134=dressPiece125;
const stoneCrops134=new Map(),cropRects134={royalRoad:[1364,402,43,119],ruins:[1069,399,29,110]},prepareCropsBefore134=preparePainting90;
preparePainting90=async function(stage,phase){
 const result=await prepareCropsBefore134(stage,phase);
 if(cropRects134[stage]&&!stoneCrops134.has(stage)){
  // Albedo comes from the daylight reference. Cropping the night painting
  // would bake darkness into the texture and then shade it a second time.
  const image=textures[paintingKey90(stage,'day')]?.image??await loadImage116('elyndor/assets/source/battle-hd-v99/'+stage+'-day.webp','stone-crop134-'+stage),rect=cropRects134[stage],c=document.createElement('canvas');c.width=rect[2];c.height=rect[3];
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,rect[0]/1672*image.width,rect[1]/941*image.height,rect[2]/1672*image.width,rect[3]/941*image.height,0,0,c.width,c.height);
  const pixels=ctx.getImageData(0,0,c.width,c.height),mean=[0,0,0],n=pixels.data.length/4;
  for(let i=0;i<pixels.data.length;i+=4)for(let k=0;k<3;k++)mean[k]+=pixels.data[i+k]/n;
  for(let i=0;i<pixels.data.length;i+=4)for(let k=0;k<3;k++)pixels.data[i+k]=clamp([186,182,169][k]+(pixels.data[i+k]-mean[k])*.70,45,238);
  ctx.putImageData(pixels,0,0);stoneCrops134.set(stage,c);
 }return result;
};
function paintedStone134(b,id,rect){
 const key='panorama-stone134-'+id;if(b.materials.has(key))return b.materials.get(key);
 const c=stoneCrops134.get(encounter53.selected);if(!c)throw Error('Daylight stone crop was not prepared for '+encounter53.selected);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());b.ownedTextures.push(map);
 const m=material59(new THREE.MeshStandardMaterial({map,bumpMap:map,bumpScale:.018,roughness:.87,metalness:0,color:'#ffffff'}));lightPaintedSurface82(m);bindArenaWeather89(m,b);m.userData.crop134={id,rect:cropRects134[encounter53.selected],source:encounter53.selected,sourcePhase:'day',albedoBalanced:true,opaque:true};b.materials.set(key,m);return m;
}
dressPiece125=function(b,kind,p,s){
 const {x,z}=p;
 if(kind==='avenuePier'){
  const y=arenaFloor88(b,x,z),stone=detailedStone105('rockLimestone',b),face=paintedStone134(b,'carved avenue pier',[1364,402,43,119]);
  for(const [at,w,h]of[[.08,.85,.16],[s*.49,.60,s-.22],[s-.03,.85,.16]])referenceBox101(b,'panorama-matched pier plinth shaft and cornice',[x,y+at,z],[w,h,.65],stone);
  // The ornament is a cropped opaque surface on an actual solid pier. It has
  // a lit bevelled frame and four real side faces, not a camera-facing cutout.
  for(const side of[-1,1])referencePiece101(b,'original carved stone panel in solid pier',new THREE.BoxGeometry(.43,s*.69,.018),face,V3(x,y+s*.48,z+side*.332));
  const points=[[.12,0],[.18,.04],[.17,.11],[.12,.15],[.22,.29],[.25,.34],[.21,.39]].map(v=>new THREE.Vector2(...v));
  referencePiece101(b,'carved stone urn finial',new THREE.LatheGeometry(points,20),stone,V3(x,y+s+.06,z));return;
 }
 if(kind==='column'||kind==='brokenColumn'){
  const y=arenaFloor88(b,x,z),h=s,stone=detailedStone105('rockLimestone',b),shaft=paintedStone134(b,'fluted ruin column',[1069,399,29,110]);
  referenceBox101(b,'ruin column stepped square plinth',[x,y+.13,z],[1.1,.26,1.1],stone);
  referencePiece101(b,'carved ruin column base',new THREE.CylinderGeometry(.43,.55,.19,24),stone,V3(x,y+.34,z));
  const g=new THREE.CylinderGeometry(.36,.40,Math.max(.3,h-.66),32,8),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),r=1-.045*(.5+.5*Math.cos(a*16));p.setX(i,p.getX(i)*r);p.setZ(i,p.getZ(i)*r);}g.computeVertexNormals();
  referencePiece101(b,'fluted solid shaft with original painted stone texture',g,shaft,V3(x,y+.43+(h-.66)/2,z));
  if(kind==='column'){referencePiece101(b,'ruin capital moulding',new THREE.CylinderGeometry(.57,.39,.22,24),stone,V3(x,y+h-.12,z));referenceBox101(b,'ruin capital square abacus',[x,y+h+.02,z],[1.18,.15,1.18],stone);}return;
 }
 if(kind==='stalagmites'){
  const m=detailedStone105('rockSlate',b);
  for(let i=0;i<4;i++){
   const a=i*2.399,xx=x+Math.cos(a)*s*.45,zz=z+Math.sin(a)*s*.40,h=s*(.65+(i%3)*.43),r=s*(.22+(i%2)*.055),points=[];
   for(let j=0;j<=18;j++){const t=j/18,bulb=Math.pow(1-t,.63)*(.76+.12*Math.sin(t*13+i));points.push(new THREE.Vector2(j===18?0:r*(bulb+.20*Math.exp(-t*15)),t*h));}
   const g=new THREE.LatheGeometry(points,20),pos=g.attributes.position;
   for(let j=0;j<pos.count;j++){const t=pos.getY(j)/h;pos.setX(j,pos.getX(j)+Math.sin(t*3+i)*r*t*.18);pos.setZ(j,pos.getZ(j)+Math.cos(t*4+i)*r*t*.15);}g.computeVertexNormals();
   referencePiece101(b,'eroded cave flowstone with rounded crown',g,m,V3(xx,arenaFloor88(b,xx,zz)-.035,zz));
  }return;
 }
 if(kind==='masonry'||kind==='pavedSteps'){
  // Actual weathered architectural blocks, rather than a pile of identical
  // flattened natural stones. Keep the centre of the avenue unobstructed.
  if(kind==='pavedSteps'&&Math.abs(x)<9)return;
  const m=detailedStone105('rockLimestone',b),n=kind==='masonry'?5:2;
  for(let i=0;i<n;i++){
   const xx=x+(i%3-1)*s*.54,zz=z+Math.floor(i/3)*s*.52,h=s*(.17+(i%2)*.07),w=s*(.42+(i%3)*.09),d=s*.35,shape=new THREE.Shape();
   shape.moveTo(-w/2+.025,-d/2);shape.lineTo(w/2-.025,-d/2);shape.lineTo(w/2,-d/2+.025);shape.lineTo(w/2,d/2-.025);shape.lineTo(w/2-.025,d/2);shape.lineTo(-w/2,d/2);shape.closePath();
   const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSize:Math.min(.025,h*.15),bevelThickness:.015,bevelSegments:2,steps:1});g.rotateX(-Math.PI/2);
   referencePiece101(b,'chipped masonry with bevelled edges',g,m,V3(xx,arenaFloor88(b,xx,zz)+.02,zz),V3(1,1,1),new THREE.Quaternion().setFromAxisAngle(axis24,(b.rng()-.5)*.55));
  }return;
 }
 if(kind==='oldStump'){
  const y=arenaFloor88(b,x,z),bark=referenceMat101(b,'barkOak','#8b8a77'),end=referenceMat101(b,'woodWeathered101','#b3a081');
  referencePiece101(b,'tapered weathered stump',new THREE.CylinderGeometry(.29*s,.45*s,.49*s,16,4,true),bark,V3(x,y+.22*s,z));
  referencePiece101(b,'recessed exposed stump end grain',new THREE.CylinderGeometry(.277*s,.28*s,.025*s,24),end,V3(x,y+.455*s,z));rootNetwork101(b,x,z,s*.56);return;
 }
 return dressBefore134(b,kind,p,s);
};
function cleanForeground134(b){
 if(b.foreground134)return;const stats={stage:encounter53.selected,removedPlants:0,removedWaterTriangles:0,stoneFootprints:0},stones=[],matrix=new THREE.Matrix4();
 // The legacy physical river could float as a broad strip over the painted
 // panorama. Keep water only where the actual level has a supported wet bank.
 const water=b.reflect89?.surface;
 if(water){const g=water.geometry,p=g.attributes.position,idx=g.index,indices=[],limit=idx?idx.count:p.count;
  for(let i=0;i<limit;i+=3){const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j),x=ids.reduce((a,j)=>a+p.getX(j),0)/3,z=ids.reduce((a,j)=>a+p.getZ(j),0)/3,y=ids.reduce((a,j)=>a+p.getY(j),0)/3;
   if(supportedRear113(b,x,z,.1)&&arenaFloor88(b,x,z)<y+.06)indices.push(...ids);else stats.removedWaterTriangles++;
  }g.setIndex(indices);water.visible=indices.length>0;b.reflect89.suppressed134=!water.visible;
 }
 // Instance boxes are local to the arena. Reuse the real mineral silhouettes,
 // so grass cannot sprout through the new outcrops or on paving/cave floors.
 for(const o of b.group.children)if(o.isInstancedMesh&&o.material?.userData.weathered104){o.geometry.computeBoundingBox();for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);stones.push(o.geometry.boundingBox.clone().applyMatrix4(matrix).expandByScalar(.08));}}
 stats.stoneFootprints=stones.length;
 for(const o of b.group.children){
  const vegetation=o.material?.userData.realVegetation103;if(!o.isInstancedMesh||!vegetation)continue;let write=0;
  for(let i=0;i<o.count;i++){
   o.getMatrixAt(i,matrix);const e=matrix.elements,x=e[12],z=e[14],blocked=(!HABITATS126[encounter53.selected].cover)||arenaWet89(b,x,z)>.06||stones.some(q=>x>q.min.x&&x<q.max.x&&z>q.min.z&&z<q.max.z);
   if(blocked){stats.removedPlants++;continue;}o.setMatrixAt(write++,matrix);
  }o.count=write;o.instanceMatrix.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();
 }
 b.stoneClearance105=null;clearFighterStones105(b);b.group.updateMatrixWorld(true);b.foreground134=stats;if(stageDepth59.summary)stageDepth59.summary.foreground134=stats;
}
const polishScenesBefore134=buildStageScenery59;
buildStageScenery59=function(...args){const r=polishScenesBefore134(...args),b=arena88.current;if(b?.foreground133)cleanForeground134(b);return r;};
const reflectBefore134=reflectArena89;
reflectArena89=function(b,...args){if(b.reflect89?.suppressed134)return;return reflectBefore134(b,...args);};
