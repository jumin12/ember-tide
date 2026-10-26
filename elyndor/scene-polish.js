// Texture density, deliberate town composition, and foreground cutaways.
const propMaterial=material;
material=function(key,color='#ffffff',opts={}){
 const m=propMaterial(key,color,opts);m.userData.textureKey=key;if(!m.map||key==='slate'||m.userData.physicalUV)return m;
 m.userData.physicalUV=true;m.bumpMap=null;
 m.onBeforeCompile=sh=>{
  sh.vertexShader='varying vec3 vPropPos,vPropNormal,vPropScale;\n'+sh.vertexShader;
  sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vPropScale=vec3(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz),length(modelMatrix[2].xyz));
   vPropPos=position*vPropScale;vPropNormal=normal;`);
  sh.fragmentShader='varying vec3 vPropPos,vPropNormal,vPropScale;\n'+sh.fragmentShader;
  const grain=key==='wood';const density=key==='plaster'?.48:key==='cloth'?.75:key==='metal'?.8:.52;
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`
   vec3 pn=pow(abs(normalize(vPropNormal)),vec3(6.));pn/=max(.001,pn.x+pn.y+pn.z);
   vec2 px=vPropPos.zy,py=vPropPos.xz,pz=vPropPos.xy;
   ${grain?'if(vPropScale.z>vPropScale.y)px=px.yx;if(vPropScale.x>vPropScale.z)py=py.yx;if(vPropScale.x>vPropScale.y)pz=pz.yx;':''}
   vec4 surface=texture2D(map,px*${density})*pn.x+texture2D(map,py*${density})*pn.y+texture2D(map,pz*${density})*pn.z;
   diffuseColor*=surface;`);
 };
 m.customProgramCacheKey=()=>`ely-physical-uv-${key}`;return m;
};
const cutawayUniforms={circles:{value:Array.from({length:4},()=>new THREE.Vector4(-10,-10,.01,.01))},depths:{value:new Float32Array([0,0,0,0])},resolution:{value:new THREE.Vector2(1280,800)}};
function closestLane(x,z,s=currentScene()){
 let best={distance:Infinity,x:0,z:0};for(let i=1;i<s.path.length;i++){const a=s.path[i-1],b=s.path[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1),px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(x-px,z-pz);if(d<best.distance)best={distance:d,x:px,z:pz};}return best;
}
const laneFacingBuilding=building;
building=function(x,z,w,d,v,kit){
 const objects=new Set(world.children),start=colliders.length,plantStart=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length])),g=laneFacingBuilding(x,z,w,d,v,kit);
 const lane=closestLane(x,z),angle=Math.round(Math.atan2(lane.x-x,lane.z-z)/(Math.PI/2))*Math.PI/2;
 if(Math.abs(angle)>.01){
  for(const o of world.children.slice())if(o!==g&&!objects.has(o))g.attach(o);
  const rotation=new THREE.Matrix4().makeTranslation(x,0,z).multiply(new THREE.Matrix4().makeRotationY(angle)).multiply(new THREE.Matrix4().makeTranslation(-x,0,-z));
  for(const[k,a]of Object.entries(world.userData.plantMatrices))for(let i=plantStart[k];i<a.length;i++)a[i].premultiply(rotation);
  const swap=Math.abs(Math.sin(angle))>.5;for(const c of colliders.slice(start)){const p=V3(c.x,0,c.z).applyMatrix4(rotation);c.x=p.x;c.z=p.z;if(swap)[c.w,c.d]=[c.d,c.w];}
  g.rotation.y=angle;
 }
 g.userData.plantRanges=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([key,a])=>[key,{start:plantStart[key],end:a.length}]));
 g.updateMatrixWorld(true);g.userData.door=g.localToWorld(V3(-w*.17,0,d/2+.9));g.userData.front=V3(Math.sin(angle),0,Math.cos(angle));
 if(['brook','capital'].includes(kit))architecturalDetails(g,w,d,v,kit);
 return g;
};
function architecturalDetails(g,w,d,v,kit){
 const h=4.9+(v%2)*.8;
 // Individual inset masonry, joinery, shutters and eaves give the shared kit scale.
 for(let yy=.4;yy<1.6;yy+=.38)for(let xx=-w/2+.25;xx<w/2;xx+=.68){const q=box(xx+(Math.round(yy*3)%2)*.18,yy,d/2+.045,.6,.3,.1,'wall','#b4ad95',g);q.rotation.z=Math.sin(xx*7+yy)*.015;}
 for(const xx of[-w*.28,w*.27]){
  for(const sign of[-1,1]){box(xx+sign*.61,3.4,d/2+.16,.24,1.35,.1,'wood',v%2?'#647268':'#716e4e',g);for(let k=0;k<5;k++)box(xx+sign*.61,2.88+k*.25,d/2+.23,.25,.05,.045,'wood','#8b805e',g);}
  box(xx,4.12,d/2+.17,1.33,.13,.33,'wood','#9d8864',g);
 }
 for(let xx=-w/2;xx<=w/2;xx+=.58){const a=V3(xx,h-.18,d/2+.48),b=V3(xx,h-.48,d/2+.12);beam(a,b,.045,'wood','#8d7856',g);}
 if(v===2||kit==='capital'){
  for(const xx of[-w/2-.07,w/2+.07]){box(xx,h*.5,d/2+.1,.32,h,.24,'wall','#c5bea8',g);box(xx,h-.1,d/2+.13,.55,.22,.4,'wall','#d0c8af',g);}
 }
 if(v===3){const dormer=new THREE.Group();dormer.position.set(w*.2,h+.55,d*.22);g.add(dormer);box(0,.48,0,1.55,.96,1.6,'plaster','#bdb69c',dormer);smallWindow(dormer,0,.5,.85);const roof=archRoof(dormer,1.85,1.8,.8,'brook');roof.position.y=.96;}
}
function cutawayMaterial(base,fade,whole=false){
 const m=base.clone(),compile=base.onBeforeCompile,key=base.customProgramCacheKey();
 m.onBeforeCompile=sh=>{
  compile(sh);sh.uniforms.uCutFade=fade;sh.uniforms.uCutWhole={value:whole?1:0};sh.uniforms.uCutCircles=cutawayUniforms.circles;sh.uniforms.uCutDepths=cutawayUniforms.depths;sh.uniforms.uCutResolution=cutawayUniforms.resolution;
  sh.vertexShader='varying float vCutDepth;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvCutDepth=-mvPosition.z;');
  sh.fragmentShader='uniform float uCutFade,uCutWhole;uniform vec4 uCutCircles[4];uniform float uCutDepths[4];uniform vec2 uCutResolution;varying float vCutDepth;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
   float cut=0.;vec2 cp=gl_FragCoord.xy/uCutResolution;
   for(int i=0;i<4;i++){vec4 c=uCutCircles[i];float ellipse=length((cp-c.xy)/c.zw);float nearParty=1.-smoothstep(.78,1.,ellipse);cut=max(cut,nearParty*step(vCutDepth+.12,uCutDepths[i]));}
   float dither=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
   if(uCutWhole>.5&&uCutFade>.985)discard;
   if(dither<max(cut,uCutWhole)*uCutFade)discard;`);
 };
 m.customProgramCacheKey=()=>key+'-party-cutaway-v1';world.userData.ownedMaterials??=[];world.userData.ownedMaterials.push(m);return m;
}
function prepareCutaways(){
 const groups=[...new Set([...(world.userData.buildings??[]),...(world.userData.occlusionGroups??[])])];world.updateMatrixWorld(true);world.userData.cutaways=[];
 for(const group of groups){const fade={value:0},cache=new Map();group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const base=o.material;let whole=(world.userData.buildings??[]).includes(group);if(group.userData.openInterior){whole=false;let p=o;while(p&&p!==group){if(p.userData.roof)whole=true;p=p.parent;}}const key=base.uuid+'-'+whole;if(!cache.has(key))cache.set(key,cutawayMaterial(base,fade,whole));o.material=cache.get(key);});world.userData.cutaways.push({group,fade,target:0,box:new THREE.Box3().setFromObject(group)});}
 for(const o of world.children)if(o.isInstancedMesh&&o.material?.map===textures.leaves)o.material=cutawayMaterial(o.material,{value:1});
}
function updateCutaways(dt){
 if(!world||!camera)return;const w=post.target.width,h=post.target.height;cutawayUniforms.resolution.value.set(w,h);
 const party=[player,...followers].filter(a=>a?.mesh.visible),rays=[];
 for(let i=0;i<4;i++){
  const a=party[i],c=cutawayUniforms.circles.value[i];if(!a||state.mode==='title'||(battle&&!world.userData.continuous)){c.set(-10,-10,.01,.01);cutawayUniforms.depths.value[i]=0;continue;}
  const root=a.mesh.localToWorld(V3(0,.05,0)),top=a.mesh.localToWorld(V3(0,a.size,0)),mid=a.mesh.localToWorld(V3(0,a.size*.5,0)),p=mid.clone().project(camera),bot=root.clone().project(camera),up=top.clone().project(camera);
  const ry=Math.max(.045,Math.abs(up.y-bot.y)*.32+.018);c.set(p.x*.5+.5,p.y*.5+.5,ry*h/w*.73,ry);cutawayUniforms.depths.value[i]=-mid.clone().applyMatrix4(camera.matrixWorldInverse).z;rays.push({ray:new THREE.Ray(camera.position.clone(),mid.clone().sub(camera.position).normalize()),distance:camera.position.distanceTo(mid)});
 }
 const hit=V3();for(const o of world.userData.cutaways??[]){o.target=rays.some(r=>r.ray.intersectBox(o.box,hit)&&camera.position.distanceTo(hit)<r.distance-.3)?1:0;o.fade.value=mix(o.fade.value,o.target,1-Math.exp(-dt*12));const hidden=o.fade.value>.985;if(o.group.userData.plantRanges&&o.group.userData.plantsHidden!==hidden){setBuildingPlantsHidden(o.group,hidden);o.group.userData.plantsHidden=hidden;}}
}
const previousWorldBuild=buildWorld;
buildWorld=function(id,spawn){for(const t of world?.userData.signTextures??[])t.dispose();for(const m of world?.userData.ownedMaterials??[])m.dispose();previousWorldBuild(id,spawn);dressScene();placeStoryActors();prepareCutaways();updateCamera(1,true);updateCutaways(1);};
function gardenEdge(x,z,w,d){
 if(!staticFree(x,z,.9)||actors.some(a=>a.mesh.visible&&Math.hypot(a.x-x,a.z-z)<2.7))return;
 const y=groundAt(x,z);for(const zz of[-d/2,d/2]){box(x,y+.33,z+zz,w,.65,.32,'wall','#cec3a2');box(x,y+.7,z+zz,w+.12,.12,.42,'wall','#d8cfb4');}for(const xx of[-w/2,w/2])box(x+xx,y+.33,z,.32,.65,d,'wall','#c5b895');
 obstacle(x,z,w+.2,d+.2,'planter');for(let k=0;k<Math.ceil(w*8);k++)plant(x+(k%8/7-.5)*w*.8,z+(Math.floor(k/8)%3-1)*d*.25,.55+k%3*.07,'flower',y+.42);
}
function dressScene(){
 const s=currentScene();if(inside(s)||s.view==='battle')return;
 if(state.scene==='highmere'){
  const council=building(3,-12.8,5.3,4.3,2,'capital');
  for(const[type,label]of[['councilDoor','Council'],['archiveDoor','Archives'],['innDoor','Inn']]){
   const o=interactables.find(o=>o.type===type);if(!o)continue;const house=type==='councilDoor'?council:world.userData.buildings.slice().sort((a,b)=>Math.hypot(a.position.x-o.x,a.position.z-o.z)-Math.hypot(b.position.x-o.x,b.position.z-o.z))[0];
   if(!house?.userData.door)continue;const p=house.userData.door.clone().addScaledVector(house.userData.front,.75);o.x=p.x;o.z=p.z;o.visualHeight=1.05;servicePlaque(house,label);
  }
 }
 if(['brook','capital'].includes(s.kit)&&s.view==='town'){
  const starts=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length]));
  for(const h of s.houses??[]){const[x,z,w,d]=h;gardenEdge(x+w*.55,z+d/2+.8,1.4,.85);gardenEdge(x-w*.52,z+d/2+.8,1.3,.8);}
  // Garden islands frame the paved square; keep every main lane and door apron open.
  if(s.plaza)for(const p of [[-10,-7,3.2,1.6],[8,-9,3.4,1.5],[-14,11,3,1.3],[16,10,2.5,1.2]])gardenEdge(...p);
  buildExtraLeaves(world.userData.leafMatrices.length,starts);
 }
 if(!inside(s)&&s.view!=='battle')distantTerrain(s);
 for(const o of interactables)if(o.type==='exit')routeSign(o);
}
function servicePlaque(g,label){
 const canvas=document.createElement('canvas');canvas.width=384;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#3b3022';c.fillRect(0,0,384,96);c.strokeStyle='#c4a66b';c.lineWidth=5;c.strokeRect(4,4,376,88);c.textAlign='center';c.textBaseline='middle';c.font='39px Georgia';c.fillStyle='#eddbac';c.fillText(label,192,49);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const material=new THREE.MeshStandardMaterial({map,roughness:.85});const point=g.worldToLocal(g.userData.door.clone());const plaque=mesh(new THREE.PlaneGeometry(2.1,.525),material,point.x,2.9,point.z-.65,g.userData.facadeShell??g);world.userData.signTextures??=[];world.userData.signTextures.push(map);world.userData.ownedMaterials??=[];world.userData.ownedMaterials.push(material);
}
function routeSign(o){
 const y=heightAt(o.x,o.z),g=new THREE.Group();g.position.set(o.x,y,o.z);world.add(g);box(-1.25,1.05,0,.11,2.1,.11,'wood','#978260',g);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=112;const ctx=canvas.getContext('2d');ctx.fillStyle='#172b2ce8';ctx.fillRect(1,1,510,110);ctx.strokeStyle='#c5ac75';ctx.lineWidth=2;ctx.strokeRect(2,2,508,108);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#eddfb7';ctx.font='27px Georgia';const label=o.label.length>31?o.label.split(' · ').at(-1):o.label;ctx.fillText(label+'  ›',256,56,478);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.minFilter=THREE.LinearFilter;const m=new THREE.SpriteMaterial({map,depthTest:true,transparent:true}),sprite=new THREE.Sprite(m);sprite.scale.set(4.7,1.03,1);sprite.position.set(0,2.7,0);g.add(sprite);world.userData.signTextures??=[];world.userData.signTextures.push(map);world.userData.ownedMaterials??=[];world.userData.ownedMaterials.push(m);
}
function distantTerrain(s){
 for(let layer=0;layer<3;layer++){
  const g=new THREE.PlaneGeometry(150,34,90,18);g.rotateX(-Math.PI/2);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const peak=5+layer*3+Math.sin(x*.066+layer*2)*3.5+Math.sin(x*.17+layer)*1.6;p.setY(i,Math.max(-2,peak*Math.sin((z+17)/34*Math.PI)+noise(x*.3,z*.4)*1.3));}
  g.computeVertexNormals();const o=mesh(g,material('rock',['#818e86','#6e8184','#647b84'][layer]),0,-1,-47-layer*22);o.castShadow=false;
 }
}
function canalBanks(s){
 for(const side of[-1,1])for(let z=-36;z<36;z+=1.8){
  const x=riverCenter(z,s)+side*4.8,y=groundAt(x,z,s),next=riverCenter(z+1.8,s)+side*4.8,angle=Math.atan2(next-x,1.8);
  const wall=box(x,-1.6,z,.45,(y+2.9)*2,1.84,'wall','#a4aa93');wall.position.y=(y-2.9)/2;wall.scale.y=y+2.9;wall.rotation.y=angle;
  const cap=box(x,y+.15,z,.64,.3,1.84,'wall','#c6c5a7');cap.rotation.y=angle;
  if(!world.userData.bridge||Math.abs(z-world.userData.bridge.z)>3.1)obstacle(x,z,.65,1.85,'canal edge');
  if(Math.round(z/1.8)%4===0){box(x,y+.4,z,.8,.6,.8,'wall','#b9b69a');box(x,y+.74,z,.95,.14,.95,'wall','#d0c9aa');}
 }
}

function placeStoryActors(){
 for(const a of actors.filter(a=>a.npc)){
  if(staticFree(a.x,a.z,.4))continue;
  let target=null;
  for(let radius=.25;radius<8&&!target;radius+=.25)for(let k=0;k<24;k++){
   const angle=k*Math.PI/12,q={x:a.x+Math.cos(angle)*radius,z:a.z+Math.sin(angle)*radius};
   if(staticFree(q.x,q.z,.5)&&!actors.some(b=>b!==a&&b.mesh.visible&&dist(b,q)<1)){target=q;break;}
  }
  if(!target)continue;a.x=target.x;a.z=target.z;a.home={...target};a.mesh.position.set(a.x,heightAt(a.x,a.z)+.015,a.z);a.shadow.position.set(a.x,heightAt(a.x,a.z)+.018,a.z);
  for(const o of interactables)if(o.actor===a){o.x=a.x;o.z=a.z;}
 }
 world.userData.npcChoices=(world.userData.npcChoices??[]).filter(p=>staticFree(p.x,p.z,.5));
}

function registerPlantMesh(mesh,key,start,matrices){
 mesh.userData.plantKey=key;mesh.userData.plantStart=start;mesh.userData.plantOriginal=matrices.map(m=>m.clone());world.userData.plantMeshes??=[];world.userData.plantMeshes.push(mesh);
}
function setBuildingPlantsHidden(group,hidden){
 const matrix=new THREE.Matrix4(),zero=V3(0,0,0);
 for(const im of world.userData.plantMeshes??[]){const range=group.userData.plantRanges?.[im.userData.plantKey];if(!range)continue;let changed=false;
  for(let n=range.start;n<range.end;n++){const i=n-im.userData.plantStart;if(i<0||i>=im.count)continue;matrix.copy(im.userData.plantOriginal[i]);if(hidden)matrix.scale(zero);im.setMatrixAt(i,matrix);changed=true;}
  if(changed)im.instanceMatrix.needsUpdate=true;
 }
}
