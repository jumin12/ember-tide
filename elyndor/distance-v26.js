// The distance is geometry: wooded hills, working fields and small settlements.
// Fine foreground vegetation keeps its bounded budget; the overworld has a
// separate dimensional canopy LOD instead of drawing every distant leaf.
const distance26={built:0,trees:0,houses:0},distanceNear26={camera:new THREE.PerspectiveCamera(),main:new THREE.Frustum(),mirror:new THREE.Frustum(),m:new THREE.Matrix4()};
const colorfulDistanceMaterial26=distantMaterial26;
distantMaterial26=function(...args){const m=colorfulDistanceMaterial26(...args),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.vertexShader=sh.vertexShader.replace(/gl_Position\.z=min\(gl_Position\.z,gl_Position\.w\*\.999(?:85|75)\);/g,'');sh.fragmentShader=sh.fragmentShader.replace('clamp(.18+haze26*.80+wetAmount*.06,0.,.96)','clamp(.025+haze26*.62+wetAmount*.10,0.,.77)');};m.customProgramCacheKey=()=>key+'-clear-colour26';return m;};
const foregroundShadowFit26=fitVisibleShadows;
fitVisibleShadows=function(){const far=camera.far;camera.far=Math.min(far,320);try{return foregroundShadowFit26();}finally{camera.far=far;}};
const distanceLightingBefore26=updateLighting;
const distanceDay26=new THREE.Color('#a8cdb8'),distanceNight26=new THREE.Color('#18334e'),distanceRain26=new THREE.Color('#739da6');
updateLighting=function(){distanceLightingBefore26();if(!activeScene||activeScene.kind==='interior')return;const day=cinema22.day.value,rain=weather.rain.value,macro=activeScene.kind==='overworld';scene.fog.color.copy(distanceNight26).lerp(distanceDay26,day);if(activeScene.key==='snow')scene.fog.color.lerp(new THREE.Color('#bfdbea'),day*.75);scene.fog.color.lerp(distanceRain26,rain*.32);scene.fog.near=mix(macro?220:145,90,rain);scene.fog.far=mix(macro?1550:1150,650,rain);scene.background.copy(scene.fog.color);distantHazeRange26.value.set(scene.fog.near,scene.fog.far);};

function distantLeafMaterial26(lod=false){
 const m=new THREE.MeshLambertMaterial({map:textures.oakCanopy,color:'#c0ca9b',side:THREE.DoubleSide});m.userData.wetResponse25=.14;addCloudLighting(m);const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=sh=>{before(sh);sh.uniforms.distanceWind26=weather.time;sh.vertexShader='uniform float distanceWind26;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec3 anchor26=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 transformed.x+=sin(distanceWind26*.65+anchor26.x*.11+anchor26.z*.08)*.045*(position.y+.8);
 ${lod?'transformed*=smoothstep(190.,265.,length(cameraPosition.xz-anchor26.xz));':''}`);};m.customProgramCacheKey=()=>key+'-distant-leaves26-'+lod;return m;
}
function backdropGround26(apron,x,z,ray){
 if(inSceneBounds(x,z))return heightAt(x,z);ray.set(V3(x,600,z),V3(0,-1,0));const hit=ray.intersectObject(apron,false)[0];return hit?.point.y??beyondGround26(x,z)-.035;
}
function distantHouse26(parent,x,y,z,w,d,wood=false,tower=false){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=Math.round((x*.17+z*.13)/1.57)*1.57;parent.add(g);const h=tower?11:4.4,roof=tower?3.1:2.5;
 box(0,.4,0,w,.9,d,'wall','#c3c9b4',g);box(0,h*.5+.7,0,w-.15,h,d-.15,wood?'wood':'plaster',wood?'#b29364':'#eee1bd',g);
 for(const xx of[-w/2+.07,w/2-.07])for(const zz of[-d/2+.07,d/2-.07])box(xx,h*.5+.7,zz,.2,h+.3,.2,'wood','#7e6040',g);
 for(const yy of[1.25,h*.57,h+.65]){box(0,yy,d/2,.14+w,.16,.18,'wood','#8c6947',g);box(-w/2,yy,0,.18,.16,d,'wood','#8c6947',g);}
 const r=archRoof(g,w+1.0,d+1.0,roof,wood?'fern':'brook');r.position.y=h+.7;
 box(-w*.18,1.65,d/2+.08,1.05,2.4,.14,'darkWood','#694b30',g);for(const xx of[-w*.29,w*.29])for(const zz of[-1,1]){
  const fy=zz>0?h-.6:2.5;box(xx,fy,d/2+.09,.84,1.16,.12,'wood','#664e35',g);box(xx,fy,d/2+.17,.65,.96,.03,'cloth','#e7cb85',g,{emissive:'#ffc372',emissiveIntensity:.7});box(xx,fy,d/2+.20,.05,1.01,.05,'wood','#725a36',g);box(xx,fy,d/2+.20,.68,.05,.05,'wood','#725a36',g);
 }
 box(w*.26,h+roof*.62,-d*.25,.65,2.6,.75,'wall','#c6cbb6',g);box(w*.26,h+roof*.62+1.35,-d*.25,.86,.17,.94,'wall','#d4d5bf',g);
 for(const xx of[-w*.35,w*.35])beam(V3(xx,1.4,d/2+.13),V3(-xx,h*.5,d/2+.13),.055,'wood','#937047',g);
 return g;
}
function distantAtlasMaterial26(base){
 const m=base.clone(),before=base.onBeforeCompile,key=base.customProgramCacheKey();m.onBeforeCompile=before;m.customProgramCacheKey=()=>key;m.fog=true;addCloudLighting(m);m.userData.distantArchitecture26=true;return m;
}
function dressDistantLandscape26(){
 if(activeScene.kind==='interior')return;const q=world.userData.landscape26,group=q.group,apron=group.children.find(o=>o.userData.continuousApron26);if(!apron)return;apron.updateMatrixWorld(true);
 const b=activeScene.bounds,rng=seeded(260517+[...activeScene.key].reduce((n,c)=>n+c.charCodeAt(0)*19,0)),ray=new THREE.Raycaster(),macro=activeScene.kind==='overworld',town=POIS[activeScene.key]?.kind==='town';
 const positions=[],count=macro?0:state.settings.quality==='low'?140:340;
 for(let i=0;i<count*3&&positions.length<count;i++){
  const side=i%4,depth=65+rng()*230,t=rng(),x=side===0?mix(b[0],b[1],t):side===1?b[1]+depth:side===2?mix(b[1],b[0],t):b[0]-depth,z=side===0?b[2]-depth:side===1?mix(b[2],b[3],t):side===2?b[3]+depth:mix(b[3],b[2],t);
  if(activeScene.key==='brookstead'&&z<30&&Math.abs(x-brookChannel(z))<12||activeScene.key==='harbor'&&x>349)continue;
  const y=backdropGround26(apron,x,z,ray);if(!Number.isFinite(y)||y<-.5)continue;positions.push({x,y,z,h:4.5+rng()*3.5,w:2.0+rng()*1.8});
 }
 const crowns=new THREE.InstancedMesh(forestGeometry('oak'),distantLeafMaterial26(),Math.max(1,positions.length)),trunks=new THREE.InstancedMesh(forestGeometry('trunk'),material('bark','#a58e65'),Math.max(1,positions.length)),d=new THREE.Object3D();crowns.count=trunks.count=positions.length;
 for(let i=0;i<positions.length;i++){const p=positions[i];d.position.set(p.x,p.y+p.h*.40,p.z);d.scale.set(1,p.h*.8,1);d.rotation.y=rng()*TAU;d.updateMatrix();trunks.setMatrixAt(i,d.matrix);d.position.y=p.y+p.h*.78;d.scale.set(p.w,p.h*.48,p.w);d.updateMatrix();crowns.setMatrixAt(i,d.matrix);crowns.setColorAt(i,new THREE.Color().setHSL(.20+rng()*.04,.30,.67+rng()*.18));}
 for(const o of[crowns,trunks]){o.frustumCulled=true;o.computeBoundingSphere();o.userData.distantScenery26=true;group.add(o);}addCloudLighting(trunks.material);
 const houses=new THREE.Group();group.add(houses);const plots=[],max=macro?0:town?9:3;
 for(let i=0;i<500&&plots.length<max;i++){
  const side=i%4,depth=75+rng()*125,t=rng(),x=side===0?mix(b[0],b[1],t):side===1?b[1]+depth:side===2?mix(b[1],b[0],t):b[0]-depth,z=side===0?b[2]-depth:side===1?mix(b[2],b[3],t):side===2?b[3]+depth:mix(b[3],b[2],t);
  if(positions.some(p=>Math.hypot(p.x-x,p.z-z)<12)||plots.some(p=>Math.hypot(p.x-x,p.z-z)<25)||activeScene.key==='brookstead'&&Math.abs(x-brookChannel(z))<16||activeScene.key==='harbor'&&x>340)continue;
  const ys=[[-4,-4],[-4,4],[4,-4],[4,4],[0,0]].map(([dx,dz])=>backdropGround26(apron,x+dx,z+dz,ray));if(Math.min(...ys)<0||Math.max(...ys)-Math.min(...ys)>1.9)continue;
  const y=Math.max(...ys)+.06;distantHouse26(houses,x,y,z,6.5+rng()*2,5.5+rng()*2,/fern|depths/.test(activeScene.key));plots.push({x,y,z});
 }
 if(activeScene.key==='brookstead'){
  const x=-78,z=-119,y=backdropGround26(apron,x,z,ray);for(const side of[-1,1])distantHouse26(houses,x+side*8,backdropGround26(apron,x+side*8,z,ray),z,6.2,6.2,false,true);distantHouse26(houses,x,backdropGround26(apron,x,z-4,ray),z-4,9,8,false,true);plots.push({x,y,z,landmark:'Highmere skyline'});
 }
 mergeGroup(houses);houses.traverse(o=>{if(o.isMesh){o.material=distantAtlasMaterial26(o.material);o.castShadow=false;o.receiveShadow=false;o.userData.distantScenery26=true;}});
 q.trees=positions.length;q.plots=plots;q.decorated=true;group.updateMatrixWorld(true);group.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});distance26.built++;distance26.trees=positions.length;distance26.houses=plots.length;
 if(macro)buildOverworldForestLod26();
}
function buildOverworldForestLod26(){
 const trees=scenery.trees,g=sharedGeo.overworldFarCrown26??=new THREE.IcosahedronGeometry(1,0),o=new THREE.InstancedMesh(g,distantLeafMaterial26(true),trees.length),d=new THREE.Object3D();
 for(let i=0;i<trees.length;i++){const t=trees[i],b=t.box,h=Math.max(3,b.max.y-b.min.y),w=Math.max(1,(b.max.x-b.min.x)*.43);d.position.set(t.x,t.y+h*.72,t.z);d.scale.set(w,h*.40,w);d.rotation.y=i*2.39996;d.updateMatrix();o.setMatrixAt(i,d.matrix);o.setColorAt(i,new THREE.Color().setHSL(.21+(i%11)*.002,.3,.68+(i%7)*.02));}
 o.frustumCulled=true;o.computeBoundingSphere();o.userData.distantScenery26=true;world.add(o);world.userData.overworldForestLod26=o;
}
const distanceBuildBefore26=buildWorld;
buildWorld=function(...args){const r=distanceBuildBefore26(...args);if(activeScene.kind!=='interior'){camera.far=1800;camera.updateProjectionMatrix();dressDistantLandscape26();updateLighting();}return r;};
const nearVegetationBudget26=updateRenderBudget;let nearVegetationClock26=-1,nearVegetationWorld26=null;
updateRenderBudget=function(...args){const r=nearVegetationBudget26(...args),groups=world?.userData.vegetationBuckets21;if(activeScene?.kind!=='overworld'||!groups)return r;if(!args[0]&&nearVegetationWorld26===world&&clock-nearVegetationClock26<.09)return r;nearVegetationClock26=clock;nearVegetationWorld26=world;const q=distanceNear26,c=q.camera;c.copy(camera);c.far=320;c.updateProjectionMatrix();c.updateMatrixWorld();q.main.setFromProjectionMatrix(q.m.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));const level=water?.position.y??0;c.position.y=2*level-camera.position.y;c.up.set(0,-1,0);c.lookAt(V3(cameraTarget.x,2*level-cameraTarget.y,cameraTarget.z));c.updateMatrixWorld();q.mirror.setFromProjectionMatrix(q.m.multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));for(const g of groups){const b=g.userData.bounds21;g.visible=q.main.intersectsSphere(b)||q.mirror.intersectsSphere(b)||sun.shadow.getFrustum().intersectsSphere(b);}return r;};
