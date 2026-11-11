// The atlas retains the actual playable geometry/materials. It does not bake
// another terrain mesh, repaint the water, or replace trees with map symbols.
const exactAtlas67={scene:null,held:new Set(),sources:[],forests:[],plants:[],landmarks:new Map(),terrainMaterials:new Set(),waterUniforms:[],sun:null,hemi:null,nativeSize:false,stats:{meshes:0,sharedGeometry:0,instanceCopies:0}};
function holdAtlas67(resource){if(!resource||exactAtlas67.held.has(resource))return;exactAtlas67.held.add(resource);const dispose=resource.dispose;resource.dispose=function(...args){if(!exactAtlas67.held.has(this))return dispose.apply(this,args)};}
function holdMaterial67(m){holdAtlas67(m);for(const v of Object.values(m))if(v?.isTexture)holdAtlas67(v);if(m.userData.climateTexture109)holdAtlas67(m.userData.climateTexture109);for(const u of Object.values(m.uniforms??{}))if(u.value?.isTexture)holdAtlas67(u.value);}
function captureCompletedAtlas67(){
 if(exactAtlas67.scene)return;world.updateMatrixWorld(true);const s=exactAtlas67.scene=new THREE.Scene();s.background=scene.background.clone();s.fog=new THREE.Fog(scene.fog.color,1600,3600);const excluded=new Set(actors.flatMap(a=>[a.mesh,a.shadow]));
 function copy(src,parent){
  if(excluded.has(src)||src.userData.dynamicFX||src.userData.sunshafts||src.userData.distantScenery26||src.userData.backdrop||src.name==='retained-static-source-handles35')return;
  let dst;
  if(src.isMesh||src.isPoints){const mats=Array.isArray(src.material)?src.material:[src.material];if(mats.some(m=>m.isShaderMaterial)&&!src.userData.dynamicWater&&!src.userData.water62&&!src.userData.ocean38&&!src.userData.freshwater38&&!src.userData.gentleWater)return;
   const geometry=src.userData.nativeLods30?.[0]??src.userData.fullGeometry??src.geometry;holdAtlas67(geometry);for(const g of src.userData.nativeLods30??[])holdAtlas67(g);mats.forEach(holdMaterial67);if(src.userData.terrain)mats.forEach(m=>exactAtlas67.terrainMaterials.add(m));for(const m of mats){const u=waterUniforms62.get(m);if(u&&!exactAtlas67.waterUniforms.includes(u))exactAtlas67.waterUniforms.push(u);}
   if(src.isInstancedMesh){dst=new THREE.InstancedMesh(geometry,src.material,src.userData.total??src.count);dst.instanceMatrix=src.instanceMatrix.clone();if(src.instanceColor)dst.instanceColor=src.instanceColor.clone();dst.count=src.count;dst.userData.lods67=src.userData.nativeLods30;dst.userData.center67=src.userData.center?.clone();if(src.userData.forest||src.userData.boundaryForest50)exactAtlas67.forests.push(dst);if(src.userData.plantKey){dst.userData.plantKey=src.userData.plantKey;exactAtlas67.plants.push(dst);}dst.computeBoundingSphere();exactAtlas67.stats.instanceCopies++;}
   else dst=src.isPoints?new THREE.Points(geometry,src.material):new THREE.Mesh(geometry,src.material);
   dst.castShadow=src.castShadow;dst.receiveShadow=src.receiveShadow;dst.customDepthMaterial=src.customDepthMaterial;if(dst.customDepthMaterial)holdMaterial67(dst.customDepthMaterial);dst.userData.sourceObject67=src.uuid;dst.userData.sourceGeometry67=geometry.uuid;exactAtlas67.sources.push({source:src.uuid,geometry,dst});exactAtlas67.stats.meshes++;exactAtlas67.stats.sharedGeometry++;
  }else if(src.isLight){dst=src.clone();if(dst.isPointLight)dst.castShadow=false;}
  else dst=new THREE.Group();
  dst.name=src.name;dst.position.copy(src.position);dst.quaternion.copy(src.quaternion);dst.scale.copy(src.scale);dst.matrix.copy(src.matrix);dst.matrixAutoUpdate=false;dst.visible=true;parent.add(dst);for(const child of src.children)copy(child,dst);
  const location=src.userData.miniatureIdentity66??src.userData.poiLandmark45;
  if(POIS[location]&&src.userData.atlasBounds118)exactAtlas67.landmarks.set(location,src.userData.atlasBounds118.clone());return dst;
 }
 for(const child of world.children)copy(child,s);
 for(const src of scene.children.filter(o=>o.isLight)){const d=src.clone();if(src===sun){exactAtlas67.sun=d;d.shadow.mapSize.set(1024,1024);d.shadow.camera.left=d.shadow.camera.bottom=-160;d.shadow.camera.right=d.shadow.camera.top=160;d.shadow.camera.far=600;d.shadow.bias=-.00015;d.shadow.normalBias=.025;d.shadow.radius=3;s.add(d.target);}if(src===hemi)exactAtlas67.hemi=d;s.add(d);}
 s.userData={source:'exact playable overworld meshes',geometryShared:true,modelsShared:true,waterShared:true,treePositionsShared:true,lowResolutionCopy:false};macroMap17.scene=s;macroMap17.near=[];macroMap17.far=[];
 exactAtlas67.shore={texture:shoreState62.texture.value,bounds:shoreState62.bounds.value.clone()};holdAtlas67(exactAtlas67.shore.texture);
}
captureMacroMap17=function(){};
const completeWorldBefore67=buildWorld;
buildWorld=function(...args){const r=completeWorldBefore67(...args);if(activeScene?.kind==='overworld'&&!exactAtlas67.scene)captureCompletedAtlas67();return r;};
// The atlas is built once alongside the real continent, including its normal
// forest batches. Scene-owned objects can be disposed without losing its data.
const realNatureBefore67=buildMacroNature15;
buildMacroNature15=function(...args){const preparation=loading36.mapPreparation;loading36.mapPreparation=false;try{return realNatureBefore67(...args)}finally{loading36.mapPreparation=preparation}};
function atlasMarkerPositions67(rect,c){for(const q of atlas3d.markers){const site=typeof dioramas67!=='undefined'?dioramas67.sites.get(q.node.dataset.location):null,x=site?.x??q.x,z=site?.z??q.z,v=V3(x,atlasHeight(x,z)+4,z).project(c);q.node.style.left=(v.x*.5+.5)*rect.width+'px';q.node.style.top=(-v.y*.5+.5)*rect.height+'px';q.node.style.visibility=v.z>1||Math.abs(v.x)>1.02||Math.abs(v.y)>1.02?'hidden':'visible';}const n=$('#atlas-heading-north');if(n)n.style.transform='rotate('+atlas3d.yaw+'rad)';}
function outdoorAtlasLight67(){
 const q=samplePoiLight54(state.worldMinutes/60),day=celestial31.day.value,rain=weather.rain.value,a=(state.worldMinutes/60-6)*Math.PI/12,direction=V3(Math.cos(a),Math.sin(a),Math.sin(a)*.44).normalize();if(direction.y<-.035)direction.negate();
 const saved=[],set=(u,v)=>{saved.push([u,u.value?.clone?u.value.clone():u.value]);if(u.value?.copy)u.value.copy(v);else u.value=v;};
 for(const[u,v]of[[weather.sun,direction],[sceneryLight.direction,direction],[waterLight62.sun,direction],[waterLight62.day,day],[waterLight62.key,q.c[0]],[waterLight62.sky,q.c[1]],[waterLight62.power,q.n[0]],[lighting34.colour,q.c[0]],[lighting34.warm,q.n[4]],[lighting34.foliage,day*(.28+q.n[4]*.13)*(1-rain*.65)]])set(u,v);
 const exposure=renderer.toneMappingExposure;renderer.toneMappingExposure=q.n[3]+mix(.025,-.015,day);surface67.day.value=day;
 const light=exactAtlas67.sun;if(light){light.color.copy(q.c[0]);light.intensity=q.n[0]*mix(1.22,1,day)*lighting34.horizon.value*(1-rain*.52)+weather.lightning*4;light.target.position.copy(atlas3d.target);light.position.copy(atlas3d.target).addScaledVector(direction,220);light.target.updateMatrixWorld();}
 if(exactAtlas67.hemi){exactAtlas67.hemi.color.copy(q.c[1]);exactAtlas67.hemi.groundColor.copy(q.c[2]);exactAtlas67.hemi.intensity=q.n[1]*mix(1.35,1.08,day)*(1-rain*.13);}
 for(const l of exactAtlas67.scene.children){if(l.isAmbientLight)l.intensity=mix(.065,.055,day);else if(l.isDirectionalLight&&l!==light){l.color.copy(q.c[3]);l.intensity=q.n[2]*mix(1.55,1.10,day)*(1-rain*.20);}}
 exactAtlas67.scene.background.copy(q.c[4]).lerp(q.c[1],rain*.56);exactAtlas67.scene.fog.color.copy(exactAtlas67.scene.background);
 const materials=[];for(const m of exactAtlas67.held)if(m.isMeshStandardMaterial&&m.envMap&&m!==scenery.staticAtlas){materials.push([m,m.envMap]);m.envMap=surface67.outdoor;}
 return()=>{for(const[u,v]of saved){if(u.value?.copy)u.value.copy(v);else u.value=v;}renderer.toneMappingExposure=exposure;for(const[m,env]of materials)m.envMap=env;};
}
drawAtlas3d=function(){
 const area=$('#atlas3d-view');if(!area||menu?.tab!=='map'||!exactAtlas67.scene)return;ensureExploration();buildAtlas3d();const rect=area.getBoundingClientRect(),ratio=Math.min(1.5,devicePixelRatio||1),width=Math.round(innerWidth*ratio),height=Math.round(innerHeight*ratio);
 const size=renderer.getSize(new THREE.Vector2());if(size.x!==width||size.y!==height)renderer.setSize(width,height,false);exactAtlas67.nativeSize=true;const c=atlas3d.camera;c.aspect=rect.width/rect.height;const r=atlas3d.distance,pitch=atlas3d.pitch;c.position.set(atlas3d.target.x+Math.sin(atlas3d.yaw)*Math.cos(pitch)*r,atlas3d.target.y+Math.sin(pitch)*r,atlas3d.target.z+Math.cos(atlas3d.yaw)*Math.cos(pitch)*r);c.lookAt(atlas3d.target);c.updateProjectionMatrix();c.updateMatrixWorld();
 const sourceDay=surface67.day.value,sourceMode=forest30.main.value,sourceEnv=scenery.staticAtlas?.envMap,shoreTexture=shoreState62.texture.value,shoreBounds=shoreState62.bounds.value.clone(),shoreEnabled=shoreState62.enabled.value,exterior=weather.exterior.value,windTime=windUniforms.time.value,reflect=exactAtlas67.waterUniforms.map(u=>u.reflect62.value);shoreState62.texture.value=exactAtlas67.shore.texture;shoreState62.bounds.value.copy(exactAtlas67.shore.bounds);shoreState62.enabled.value=1;weather.exterior.value=1;windUniforms.time.value=performance.now()*.001;for(const u of exactAtlas67.waterUniforms)u.reflect62.value=0;surface67.day.value=Math.max(.3,poiLight54.day.value);if(scenery.staticAtlas)scenery.staticAtlas.envMap=surface67.outdoor;forest30.main.value=0;
 const restoreOutdoor=outdoorAtlasLight67();
 const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));
 for(const m of exactAtlas67.forests){const center=m.userData.center67??m.boundingSphere?.center??m.position,d=c.position.distanceTo(center);if(m.userData.lods67)m.geometry=m.userData.lods67[d<180?0:d<350?1:2];m.visible=!m.boundingSphere||frustum.intersectsObject(m);m.castShadow=d<280;}
 for(const m of exactAtlas67.plants){m.visible=c.position.distanceTo(m.boundingSphere?.center??m.position)<260;}
 const old=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha(),fog=exactAtlas67.scene.fog;fog.near=Math.max(900,r*1.4);fog.far=Math.max(2200,r*3);
 try{renderer.setClearColor(exactAtlas67.scene.background,1);renderAtlasPresentation119(rect,ratio,c);}
 finally{restoreOutdoor();renderer.setScissorTest(false);renderer.setViewport(0,0,width,height);renderer.setClearColor(old,alpha);surface67.day.value=sourceDay;forest30.main.value=sourceMode;shoreState62.texture.value=shoreTexture;shoreState62.bounds.value.copy(shoreBounds);shoreState62.enabled.value=shoreEnabled;weather.exterior.value=exterior;windUniforms.time.value=windTime;exactAtlas67.waterUniforms.forEach((u,i)=>u.reflect62.value=reflect[i]);if(scenery.staticAtlas)scenery.staticAtlas.envMap=sourceEnv;}
 atlas3d.frames++;atlasMarkerPositions67(rect,c);
};
const nativeMapRenderBefore67=render;
render=function(...args){if(exactAtlas67.nativeSize&&menu?.tab!=='map'){exactAtlas67.nativeSize=false;resizeNow33();}return nativeMapRenderBefore67(...args)};
const exactMenuBefore67=renderAtlasMenu;
renderAtlasMenu=function(...args){const first=!atlas3d.hasOpened;const r=exactMenuBefore67(...args);if(first){atlas3d.pitch=Math.atan2(100,Math.hypot(28,108));atlas3d.yaw=Math.atan2(28,108);drawAtlas3d();}installAtlasPicking118();return r;};

// Model bounds are recorded before scenery batching flattens the scene graph.
// Include the open settlement ground, and test only on pointer gestures.
const atlasPick118={ray:new THREE.Raycaster(),point:new THREE.Vector2(),ground:new THREE.Plane(),hit:new THREE.Vector3()};
function atlasSettlementAt118(x,y){
 const area=$('#atlas3d-view');if(!area||!exactAtlas67.scene)return null;const r=area.getBoundingClientRect();
 atlasPick118.point.set((x-r.left)/r.width*2-1,1-(y-r.top)/r.height*2);atlasPick118.ray.setFromCamera(atlasPick118.point,atlas3d.camera);
 let selected=null,nearest=Infinity;
 for(const marker of atlas3d.markers){
  const key=marker.node.dataset.location;if(!key||marker.node.style.visibility==='hidden')continue;
  const bounds=exactAtlas67.landmarks.get(key);
  if(bounds&&atlasPick118.ray.ray.intersectBox(bounds,atlasPick118.hit)){const d=atlasPick118.ray.ray.origin.distanceTo(atlasPick118.hit);if(d<nearest){selected=marker.node;nearest=d;}}
  const q=dioramas67.sites.get(key);if(!q)continue;atlasPick118.ground.set(V3(0,1,0),-q.floor);
  if(!atlasPick118.ray.ray.intersectPlane(atlasPick118.ground,atlasPick118.hit))continue;
  const p=miniLocal71(q,atlasPick118.hit.x,atlasPick118.hit.z),d=atlasPick118.ray.ray.origin.distanceTo(atlasPick118.hit);
  if(Math.abs(p.x)<=q.w/2&&Math.abs(p.z)<=q.d/2&&d<nearest){selected=marker.node;nearest=d;}
 }
 return selected;
}
function installAtlasPicking118(){
 const area=$('#atlas3d-view');if(!area||area.dataset.picking118)return;area.dataset.picking118='ready';
 const down=area.onpointerdown,move=area.onpointermove,up=area.onpointerup,cancel=area.onpointercancel;let gesture=null;
 area.onpointerdown=e=>{if(!e.target.closest('button'))gesture={id:e.pointerId,x:e.clientX,y:e.clientY,button:e.button,moved:false};down?.call(area,e);};
 area.onpointermove=e=>{
  if(gesture){if(e.pointerId!==gesture.id)return;gesture.moved||=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>6;if(gesture.moved)move?.call(area,e);}
  else if(!e.target.closest('button'))area.style.cursor=atlasSettlementAt118(e.clientX,e.clientY)?'pointer':'grab';
 };
 area.onpointerup=e=>{const g=gesture;gesture=null;up?.call(area,e);if(g&&g.id===e.pointerId&&!g.moved&&g.button===0)atlasSettlementAt118(e.clientX,e.clientY)?.click();};
 area.onpointercancel=e=>{gesture=null;cancel?.call(area,e);};
 for(const pin of $$('.atlas-pin')){pin.setAttribute('aria-pressed',String(pin.classList.contains('selected')));pin.addEventListener('click',()=>{for(const p of $$('.atlas-pin'))p.setAttribute('aria-pressed',String(p===pin));});}
}
