// Renderer and simulation budgets. The map and authored sprite frames remain intact.
const perf={building:false,heights:new Map(),materials:new Map(),plants:[],staticMeshes:[],lastReflection:-100,lastShadow:-100,frames:0,drawCalls:0,triangles:0,scale:1,slow:0,fast:0,revision:2};
const makeAuthoredActor=createActor;
createActor=function(...args){const a=makeAuthoredActor(...args);if(a)a.mesh.layers.enable(1);return a;};
const readQualitySettings=loadSettings;
loadSettings=function(){readQualitySettings();if(state.settings.renderRevision!==perf.revision){state.settings.quality='balanced';state.settings.renderRevision=perf.revision;}};
const exactGround=groundAt;
// Grade the approaches across the full bridge width. Sampling the bank at the
// centre line alone left a half-metre lip at the western bridge's outer lane.
const bridgeGrades=[...[97,-8,-80,-180].map(z=>({x:riverX(z),z,length:z===-180?35:23,width:8})),...[97,55].map(z=>({x:-132,z,length:13,width:7}))].map(b=>({...b,left:Math.max(.25,exactGround(b.x-b.length/2,b.z)),right:Math.max(.25,exactGround(b.x+b.length/2,b.z))}));
function gradedGround(x,z){let y=exactGround(x,z);for(const b of bridgeGrades){const end=Math.abs(x-b.x)-b.length/2,dz=Math.abs(z-b.z);if(end< -1.25||end>4.5||dz>b.width/2+1.2)continue;const weight=smooth(-1.25,-.5,end)*(1-smooth(0,4.5,end))*(1-smooth(b.width/2-.15,b.width/2+1.2,dz)),bank=x<b.x?b.left:b.right;y=mix(y,bank,weight);}return y;}
groundAt=function(x,z){
 if(perf.building)return gradedGround(x,z);
 const tx=Math.floor(x/8),tz=Math.floor(z/8),key=(tx+512)*1024+tz+512;let tile=perf.heights.get(key);
 if(!tile){tile=new Float32Array(1089);tile.fill(NaN);perf.heights.set(key,tile);if(perf.heights.size>200)perf.heights.delete(perf.heights.keys().next().value);}
 const fx=(x-tx*8)*4,fz=(z-tz*8)*4,ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz,a=iz*33+ix,b=a+1,c=a+33,d=c+1;
 if(Number.isNaN(tile[a]))tile[a]=gradedGround(tx*8+ix*.25,tz*8+iz*.25);
 if(Number.isNaN(tile[b]))tile[b]=gradedGround(tx*8+(ix+1)*.25,tz*8+iz*.25);
 if(Number.isNaN(tile[c]))tile[c]=gradedGround(tx*8+ix*.25,tz*8+(iz+1)*.25);
 if(Number.isNaN(tile[d]))tile[d]=gradedGround(tx*8+(ix+1)*.25,tz*8+(iz+1)*.25);
 return mix(mix(tile[a],tile[b],u),mix(tile[c],tile[d],u),v);
};
function compatibleMaterial(base){
 if(!base.isMeshStandardMaterial||base.transparent||base.emissiveIntensity>0&&base.emissive.getHex()!==0)return null;
 const key=[base.map?.uuid,base.side,base.roughness,base.metalness,base.alphaTest,base.userData.physicalUV?'world':'uv'].join('|');
 let m=perf.materials.get(key);if(!m){m=base.clone();m.color.set(0xffffff);m.vertexColors=true;m.onBeforeCompile=base.onBeforeCompile;m.customProgramCacheKey=()=>base.customProgramCacheKey()+'-baked-tints';perf.materials.set(key,m);}return m;
}
mergeGroup=function(group){
 group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),buckets=new Map(),removed=[];
 group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;const source=o.material,m=compatibleMaterial(source)??source,key=m.uuid;if(!buckets.has(key))buckets.set(key,{m,g:[]});const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(m!==source){const colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=source.color.r;colors[i+1]=source.color.g;colors[i+2]=source.color.b;}g.setAttribute('color',new THREE.BufferAttribute(colors,3));}buckets.get(key).g.push(g);removed.push(o);});
 for(const o of removed)o.removeFromParent();for(const{m,g:list}of buckets.values()){const out=new THREE.BufferGeometry();for(const a of['position','normal','uv',...(m.vertexColors?['color']:[])]){const size=a==='uv'?2:3,arr=new Float32Array(list.reduce((n,g)=>n+g.attributes.position.count*size,0));let at=0;for(const g of list){const src=g.attributes[a]?.array??new Float32Array(g.attributes.position.count*size).fill(a==='color'?1:0);arr.set(src,at);at+=src.length;}out.setAttribute(a,new THREE.BufferAttribute(arr,size));}out.computeBoundingSphere();const o=new THREE.Mesh(out,m);o.castShadow=o.receiveShadow=true;group.add(o);for(const g of list)g.dispose();}
};
// Batch a full patch of ground cover per draw. Sixteen-metre cells created
// hundreds of tiny colour and shadow submissions around a single town view.
// Per-instance masks, wind and building ownership remain independent.
buildPlants=function(){
 const card=sharedGeo.card??=new THREE.PlaneGeometry(1,1,1,3);perf.plants=[];
 const cellSize=32,make=(matrices,key,leaf=false)=>{const cells=new Map();matrices.forEach((m,index)=>{const e=m.elements,k=Math.floor(e[12]/cellSize)+','+Math.floor(e[14]/cellSize);if(!cells.has(k))cells.set(k,[]);cells.get(k).push({m,index});});
  for(const list of cells.values()){
   // Stable interleaving keeps density reductions evenly spread, including crossed cards.
   list.sort((a,b)=>((a.index*2654435761)>>>0)-((b.index*2654435761)>>>0));
   const m=windMaterial(key,leaf);if(key==='grassBlades'){m.map=textures.grass;m.alphaTest=0;m.color.set('#b4c49a');}if(leaf)m.color.set('#cfdbc2');
   const im=new THREE.InstancedMesh(key==='grassBlades'?(sharedGeo.grass??=grassGeometry()):card,m,list.length);im.castShadow=false;im.receiveShadow=true;list.forEach((q,i)=>im.setMatrixAt(i,q.m));im.computeBoundingSphere();im.computeBoundingBox();im.userData.globalPlantIndices=list.map(q=>q.index);im.userData.plantKey=key;im.userData.plantOriginal=list.map(q=>q.m);im.userData.total=list.length;
   const e=list[0].m.elements;im.userData.center=V3(Math.floor(e[12]/cellSize)*cellSize+cellSize/2,0,Math.floor(e[14]/cellSize)*cellSize+cellSize/2);world.userData.plantMeshes??=[];world.userData.plantMeshes.push(im);world.add(im);perf.plants.push(im);
  }
 };make(world.userData.leafMatrices,'leaves',true);for(const[k,v]of Object.entries(world.userData.plantMatrices))make(v,k);world.userData.leafCount=world.userData.leafMatrices.length;
};
const batchBeforeOptimization=batchLandscape;
batchLandscape=function(){const crowns=(world.userData.occlusionGroups??[]).map(g=>({x:g.position.x,z:g.position.z,h:g.userData.treeHeight??6,s:g.userData.treeScale??1}));batchBeforeOptimization();
 const empty=[];world.traverse(o=>{if(o!==world&&o.isGroup&&!o.children.length)empty.push(o);});for(const o of empty)o.removeFromParent();
 // Static canopies supply the broad, soft tree shadows; leaf cards keep full visible detail.
 const matrices=[];for(const p of crowns){const y=groundAt(p.x,p.z);for(let j=0;j<2;j++){const s=(j?1.65:2.1)*p.s,m=new THREE.Matrix4();m.compose(V3(p.x+(j?.35:-.15)*p.s,y+p.h*(j?.85:.65),p.z),new THREE.Quaternion(),V3(s,1.4*p.s,s*.9));matrices.push(m);}}
 const proxy=new THREE.InstancedMesh(sharedGeo.canopyShadow??=new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}),matrices.length);matrices.forEach((m,i)=>proxy.setMatrixAt(i,m));proxy.castShadow=true;proxy.layers.set(1);proxy.name='shadow-canopies';proxy.geometry.setDrawRange(0,0);proxy.onBeforeShadow=()=>proxy.geometry.setDrawRange(0,Infinity);proxy.onAfterShadow=()=>proxy.geometry.setDrawRange(0,0);world.add(proxy);world.userData.canopyShadow=proxy;
};
function prepareBudgetedWorld(){
 perf.staticMeshes=[];world.updateMatrixWorld(true);
 world.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!actors.some(a=>a.mesh===o||a.shadow===o)&&!world.userData.sunshafts?.beams.includes(o)&&!world.userData.lightSites.some(s=>s.group===o.parent||s.core===o)){o.layers.enable(1);perf.staticMeshes.push(o);o.matrixAutoUpdate=false;o.updateMatrix();}});
 for(const g of world.userData.buildings??[])g.traverse(o=>{if(o.isMesh)o.layers.enable(1);});
 for(const a of actors){a.mesh.layers.enable(1);a.shadow.castShadow=false;}
 camera.layers.enable(1);sun.shadow.camera.layers.set(1);sun.shadow.mapSize.set(state.settings.quality==='high'?1536:1024,state.settings.quality==='high'?1536:1024);sun.shadow.camera.left=sun.shadow.camera.bottom=-25;sun.shadow.camera.right=sun.shadow.camera.top=25;sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=.025;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;
 scene.fog.near=36;scene.fog.far=112;perf.lastShadow=perf.lastReflection=-100;
 const droplets=new THREE.InstancedMesh(sharedGeo.droplet??=new THREE.SphereGeometry(.024,4,3),new THREE.MeshBasicMaterial({color:'#c3dee0',transparent:true,opacity:.62}),96);droplets.castShadow=false;droplets.frustumCulled=false;world.add(droplets);world.userData.droplets=droplets;
 createTorchFlames();
 updateRenderBudget(true);
}
const buildBeforeOptimization=buildWorld;
buildWorld=function(id,spawn){perf.building=true;const oldWorld=world;try{buildBeforeOptimization(id,spawn);}finally{perf.building=false;}if(world!==oldWorld){perf.heights.clear();prepareBudgetedWorld();}};
function updateRenderBudget(force=false){
 if(!player||!camera)return;const p=restoration?cameraTarget:player,high=state.settings.quality==='high',low=state.settings.quality==='low';
 for(const im of perf.plants){const d=Math.hypot(im.userData.center.x-p.x,im.userData.center.z-p.z),leaf=im.userData.plantKey==='leaves';const far=leaf?105:low?64:high?110:88;im.visible=d<far+(scenery.software?24:12);im.count=im.userData.total;if(!leaf&&im.userData.detailedGeometry){im.geometry=d<26?im.userData.detailedGeometry:im.userData.distantGeometry;im.material.uniformsForDistance?.range.value.set(far-12,far);}}
 // Only nearby static fragments can affect a view through the atmospheric horizon.
 for(const g of world.userData.staticChunks??[])g.visible=Math.hypot(g.userData.center.x-p.x,g.userData.center.z-p.z)<115;
 for(const g of world.userData.buildings??[])g.visible=Math.hypot(g.position.x-p.x,g.position.z-p.z)<115;
}
// The reflection pass is physically correct, but need not re-render an unchanged landscape every frame.
const physicalReflection=updateReflection;
updateReflection=function(){if(!water?.visible)return;const p=player??cameraTarget,near=channelDistance(p.x,p.z)<38||restoration;const interval=state.settings.quality==='high'?.065:state.settings.quality==='low'?.25:.12;if(!near||clock-perf.lastReflection<interval)return;perf.lastReflection=clock;const pending=renderer.shadowMap.needsUpdate;renderer.shadowMap.needsUpdate=false;physicalReflection();renderer.shadowMap.needsUpdate=pending;};
render=function(){if(!renderer)return;
 updateCutaways(0);updateRenderBudget();
 const interval=state.settings.quality==='high'?1/30:state.settings.quality==='low'?1/10:1/20;if(clock-perf.lastShadow>=interval){renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;perf.lastShadow=clock;}
 updateReflection();renderer.setRenderTarget(post.target);renderer.render(scene,camera);renderer.setRenderTarget(null);post.material.uniforms.time.value=clock;post.material.uniforms.strength.value=state.settings.quality==='low'?.35:1;renderer.render(post.scene,post.camera);
};
// Reuse a few particle meshes rather than allocating scene objects for every fountain droplet.
const updateBeforeOptimization=updateWorldFX;
updateWorldFX=function(dt){
 const fountains=world.userData.fountains;world.userData.fountains=[];updateBeforeOptimization(dt);world.userData.fountains=fountains;
 if(frameIndex%12===0)updateRenderBudget();
 const droplets=world.userData.droplets;if(droplets){let count=0;const matrix=new THREE.Matrix4();for(const p of fountains??[]){if(Math.hypot(p.x-player.x,p.z-player.z)>32)continue;for(let i=0;i<32;i++){const t=(clock*.6+i/32)%1,a=i*2.399,r=.3+t*1.0;matrix.makeTranslation(p.x+Math.cos(a)*r,p.y+Math.sin(t*Math.PI)*.4-t*1.1,p.z+Math.sin(a)*r);droplets.setMatrixAt(count++,matrix);}}droplets.count=count;droplets.visible=count>0;if(count)droplets.instanceMatrix.needsUpdate=true;}
 for(const o of world.userData.torchMeshes??[])o.quaternion.copy(camera.quaternion);
};
// UI cards and atlas geometry only rebuild when their values change.
let hudValue='',lastRadar=-10,lastCompass=-10;
const hudBeforeOptimization=updateHUD;
updateHUD=function(){if(!player)return;const value=JSON.stringify([state.mode,state.beat,state.scene,state.gold,Math.floor(state.worldMinutes),state.members.map(id=>[id,state.characters[id].hp,state.characters[id].mp,state.characters[id].charge,state.characters[id].level,state.characters[id].ascended])]);
 if(value!==hudValue){hudValue=value;hudBeforeOptimization();lastRadar=clock;return;}
 if(clock-lastRadar>.6){lastRadar=clock;const r=$('#overworld-radar');if(r)r.innerHTML=worldMapSVG('radar');}
 if(clock-lastCompass>.2){lastCompass=clock;const g=waypoint??objectiveTarget(),el=$('#overworld-compass');if(g&&el){const b=screenBasis(),dx=g.x-player.x,dz=g.z-player.z,angle=Math.atan2(dx*b.right.x+dz*b.right.z,-(dx*b.down.x+dz*b.down.z))*180/Math.PI;const needle=el.querySelector('.compass-needle'),distance=el.querySelector('b');if(needle)needle.style.transform='rotate('+angle+'deg)';if(distance)distance.textContent=Math.round(Math.hypot(dx,dz))+' m';}}
};
updateLighting=function(){if(!world)return;const h=state.worldMinutes/60%24,day=Math.max(0,Math.sin((h-6)/12*Math.PI)),night=1-smooth(0,.18,day),sunset=Math.max(0,1-Math.abs(h-18)/2),dawn=Math.max(0,1-Math.abs(h-6)/1.8),p=restoration?cameraTarget:player??{x:0,z:0},y=heightAt(p.x,p.z);
 sun.position.set(p.x-27*Math.cos((h-6)/12*Math.PI),y+13+day*33,p.z+24);sun.target.position.set(p.x,y,p.z);sun.target.updateMatrixWorld();sun.intensity=mix(.23,3.0,Math.sqrt(day));sun.color.set('#f2e8d8').lerp(new THREE.Color('#f6b779'),Math.max(dawn,sunset)*.65).lerp(new THREE.Color('#a1b3ce'),night);
 hemi.color.set('#c7cbd1').lerp(new THREE.Color('#8c96af'),night);hemi.groundColor.set('#756d60');hemi.intensity=mix(.52,.95,day);renderer.toneMappingExposure=mix(1.03,1.08,day);
 scene.fog.color.set('#a3a49f').lerp(new THREE.Color('#aa9583'),sunset*.45).lerp(new THREE.Color('#343b4a'),night*.9);scene.background.copy(scene.fog.color);
 const lamps=(world.userData.lampSources??[]).slice().sort((a,b)=>(a.x-p.x)**2+(a.z-p.z)**2-((b.x-p.x)**2+(b.z-p.z)**2));world.userData.lanterns.forEach((l,i)=>{if((battle&&i>=6)||(l.userData.effectUntil??0)>clock)return;if(lamps[i])l.position.copy(lamps[i]);l.color.set('#ffb163');l.intensity=lamps[i]?mix(1.2,14,night+sunset*.15):0;});
 for(const s of world.userData.lightSites??[])s.glow.intensity=Math.hypot(s.x-p.x,s.z-p.z)<55?(state.restoredLights?.includes(s.id)?12:4):0;
};
const initializePost=setupPost;
setupPost=function(){initializePost();post.target.texture.type=THREE.HalfFloatType;post.material.fragmentShader=`
 uniform sampler2D colorTex,depthTex;uniform vec2 resolution,nearFar;uniform float focus,strength,flash,time;varying vec2 vUv;
 float depthAt(float d){float z=d*2.-1.;return 2.*nearFar.x*nearFar.y/(nearFar.y+nearFar.x-z*(nearFar.y-nearFar.x));}
 void main(){
  vec3 col=texture2D(colorTex,vUv).rgb;
  float vertical=smoothstep(.18,.48,abs(vUv.y-.5));
  // Equal physical edge widths on wide and tall displays. Corners use the
  // stronger edge, so the two bands never double the blur over the party.
  float aspect=max(1.,resolution.x/resolution.y);
  float horizontal=smoothstep(.18,.48,.5-min(vUv.x,1.-vUv.x)*aspect);
  float blur=max(vertical,horizontal)*strength;
  vec3 soft=col;
  if(blur>.005){
   vec2 off=vec2(max(.7,blur*5.))/resolution;
   soft=col*.2;
   for(int k=0;k<8;k++){
    float a=float(k)*.785398;
    soft+=texture2D(colorTex,clamp(vUv+vec2(cos(a),sin(a))*off,vec2(0.),vec2(1.))).rgb*.1;
   }
   col=mix(col,soft,blur*.85);
  }
  col+=max(soft-vec3(1.0),vec3(0.))*.18;
  float vignette=1.-smoothstep(.19,.82,length((vUv-.5)*vec2(1.,1.08)));
  col*=mix(.82,1.,vignette);col+=flash*.22;gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`;};
resize=function(){const high=state.settings.quality==='high',low=state.settings.quality==='low',ratio=Math.min(devicePixelRatio,high?1.5:1.25),scale=low?.78:perf.scale;renderer.setPixelRatio(ratio);const w=Math.max(320,Math.round(innerWidth*scale)),h=Math.max(240,Math.round(innerHeight*scale));renderer.setSize(w,h,false);post.target.setSize(Math.round(w*ratio),Math.round(h*ratio));post.material.uniforms.resolution.value.set(w*ratio,h*ratio);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();};
const menuBeforeOptimization=renderMenu;
renderMenu=function(){menuBeforeOptimization();const quality=$('#setting-quality');if(quality){quality.innerHTML='<option value="balanced">Balanced</option><option value="high">Cinematic</option><option value="low">Performance</option>';quality.value=state.settings.quality;quality.onchange=e=>{state.settings.quality=e.target.value;perf.scale=1;saveSettings();resize();const size=state.settings.quality==='high'?1536:1024;if(sun.shadow.mapSize.x!==size){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(size,size);}renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;updateRenderBudget(true);};}};
loop=function(now){if(!lastFrame)lastFrame=now;const elapsed=Math.min((now-lastFrame)/1000,.12);lastFrame=now;const live=performance.now()>manualUntil;if(live)tick(Math.min(elapsed,.05));render();
 if(live&&state.mode==='explore'&&!menu&&state.settings.quality==='balanced'&&++perf.frames>150){perf.slow=elapsed>.031?perf.slow+1:Math.max(0,perf.slow-1);perf.fast=elapsed<.0175?perf.fast+1:0;if(perf.slow>35&&perf.scale>.76){perf.scale=Math.max(.76,perf.scale-.04);perf.slow=0;resize();}else if(perf.fast>240&&perf.scale<1){perf.scale=Math.min(1,perf.scale+.02);perf.fast=0;resize();}}
 requestAnimationFrame(loop);
};
// Authored landmarks share the same physical roads, heightfield and collision rules.
function addAuthoredGateway(){
 const x=-84,z=-59,y=exactGround(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);world.userData.buildings.push(g);g.userData.landmark='Highmere gate';
 for(const side of[-1,1]){const xx=side*8.3;box(xx,5.2,0,4.5,10.4,4.8,'wall','#c5c8bf',g);for(const yy of[.4,4.2,9.7])box(xx,yy,0,4.9,.35,5.1,'wall','#d3d3c8',g);for(let k=0;k<4;k++)box(xx-1.8+k*1.2,10.7,2.2,.8,.85,.75,'wall','#bdc3b9',g);for(const zz of[-2.1,2.1])smallWindow(g,xx,6.3,zz);box(side*5.8,2.2,0,1.4,4.4,3,'wall','#b7bfb6',g);lantern(side*5.2,2.85,1.8,g);obstacle(x+xx,z,4.7,5,'gate tower');obstacle(x+side*5.8,z,1.4,3,'gate pillar');
  box(xx,5.8,2.46,1.5,3.8,.06,'cloth','#3e596f',g);for(const sign of[-1,1])box(xx+sign*.72,5.8,2.5,.055,3.8,.035,'metal','#c4a963',g);box(xx,3.92,2.5,1.5,.08,.035,'metal','#c4a963',g);}
 for(let i=0;i<19;i++){const a=i/18*Math.PI,o=box(Math.cos(a)*5.1,4.1+Math.sin(a)*3.8,0,.92,.9,3,'wall','#c5c9bf',g);o.rotation.z=a;}
 box(0,8.65,0,12,1.2,3.5,'wall','#c7cbc1',g);for(let i=0;i<9;i++)box(-5.4+i*1.35,9.5,1.45,.8,.8,.7,'wall','#c9cdc2',g);
}
const naturalPlant=plant;
plant=function(x,z,scale=1,type='fern',givenY=null){
 if(world?.userData.placingNature){const town=TOWNS.find(t=>Math.hypot(x-t.x,z-t.z)<t.r*.72);if(town&&town.id!=='fern'){const hash=Math.abs(Math.sin(x*127.1+z*311.7)*43758.5453)%1;if(hash>.24)return;}}
 naturalPlant(x,z,scale,type,givenY);
};
const buildNaturalLandscape=buildNature;
buildNature=function(){world.userData.placingNature=true;try{buildNaturalLandscape();}finally{world.userData.placingNature=false;}};
const continuousHeight=heightAt;
heightAt=function(x,z){for(const s of world?.userData.stairTreads??[])if(Math.abs(z-s.z)<.31&&Math.abs(x-s.x)<2.12)return s.y;return continuousHeight(x,z);};
function addAuthoredDetails(){
 world.userData.stairTreads=[];
 let previous=null;for(let i=0;i<=38;i++){const z=29.7+i*.54,x=118+Math.sin((z-29.7)/20.52*Math.PI)*.6,edge=smooth(0,1.4,z-29.7)*smooth(0,1.4,50.22-z),y=Math.ceil((exactGround(x,z)+edge*.15)/.15)*.15;world.userData.stairTreads.push({x,z,y});const tread=box(x,y-.09,z,4.5,.18,.55,'wood','#b5a587');world.userData.walkSurfaces.push(tread);
  if(i%3===0)for(const side of[-1,1]){box(x+side*2.2,y+.52,z,.13,1.15,.13,'wood','#8b7b60');if(previous)for(const h of[.45,.95])beam(V3(previous.x+side*2.2,previous.y+h,previous.z),V3(x+side*2.2,y+h,z),.045,'cloth','#b8aa87');obstacle(x+side*2.2,z,.22,1.1,'stair rail');}if(i%3===0)previous={x,z,y};
  if(i%9===0)for(const side of[-1,1])lantern(x+side*2.28,y+1.15,z);
 }
 const ax=-105,az=-88,ay=exactGround(ax,az),aid=new THREE.Group();aid.position.set(ax,ay,az);world.add(aid);
 for(const xx of[-3,3])for(const zz of[-2,2])box(xx,1.7,zz,.12,3.4,.12,'wood','#957e5e',aid);const canopy=box(0,3.45,0,6.7,.05,4.7,'cloth','#d3ccb8',aid);canopy.rotation.z=.06;for(let j=0;j<6;j++)box(-2.75+j*1.1,3.3,2.34,1.05,.22,.04,'cloth',j%2?'#bcb59d':'#dad2ba',aid);
 box(-1.9,.8,-.5,1.5,.16,2.5,'wood','#9b8565',aid);box(-1.9,.93,-.5,1.35,.12,2.3,'cloth','#cbd0bd',aid);box(1.35,.65,-.8,1.8,1.3,1.1,'wood','#927c5d',aid);for(let j=0;j<6;j++)box(.75+j%3*.38,1.38,-1.1+Math.floor(j/3)*.4,.24,.18,.3,'cloth','#e7ddc3',aid);obstacle(ax-1.9,az-.5,1.5,2.5,'cot');obstacle(ax+1.35,az-.8,1.8,1.1,'aid supplies');INTERACTION_POS.mira=[ax,az+2.8];
 const hall=world.userData.buildings.find(g=>g.userData.openInterior&&Math.abs(g.position.x+69)<1);
 if(hall){const w=8.4,d=5.8;box(0,.025,.5,w,.035,d,'cloth','#536c7e',hall);for(const xx of[-w/2,w/2])box(xx,.052,.5,.09,.025,d,'cloth','#c7b27b',hall);for(const zz of[-d/2,d/2])box(0,.052,zz+.5,w,.025,.09,'cloth','#c7b27b',hall);for(const side of[-1,1])for(let j=0;j<4;j++){box(side*5.6,.5+j*.85,-3.6,1.25,.12,2.8,'wood','#8e775a',hall);for(let k=0;k<7;k++)box(side*5.6,.85+j*.85,-4.75+k*.36,.8,.55,.23,'cloth',['#687462','#8b6552','#657385'][k%3],hall);}box(0,2.9,-5.68,3.8,3.3,.12,'wood','#8a7962',hall);box(0,2.9,-5.6,3.4,3,.03,'plaster','#85979d',hall,{emissive:'#c2d9e5',emissiveIntensity:.15});for(let j=1;j<6;j++)box(-1.7+j*3.4/6,2.9,-5.54,.025,3,.025,'metal','#65716e',hall);for(let j=1;j<5;j++)box(0,1.4+j*.6,-5.54,3.4,.025,.025,'metal','#65716e',hall);for(const xx of[-1.7,0,1.7])box(xx,2.9,-5.55,.08,3.1,.06,'wood','#a58f6d',hall);box(0,2.9,-5.5,3.5,.08,.06,'wood','#a58f6d',hall);obstacle(-69,-120.4,8.4,1.7,'council desk');}
 for(const[x,z]of[[-119,44],[-116,43],[-107,46]]){const y=exactGround(x,z);box(x,y+.45,z,.9,.9,.9,'wood','#a18b67');for(const h of[.1,.8])box(x,y+h,z,.97,.08,.95,'metal','#7c7964');obstacle(x,z,.95,.95,'stores');}
 world.userData.torchSites=[];for(const[x,z]of[[-121,45],[-110,53],[121.6,49],[121.5,31.5],[-88.5,-55]]){const y=exactGround(x,z);for(let i=0;i<3;i++){const a=i*TAU/3;beam(V3(x+Math.cos(a)*.33,y,z+Math.sin(a)*.33),V3(x,y+1.25,z),.045,'metal','#6b675b');}mesh(new THREE.CylinderGeometry(.2,.1,.18,8),material('metal','#6c6250'),x,y+1.25,z);const light=new THREE.PointLight('#ffad57',7,8,2);light.position.set(x,y+1.65,z);world.add(light);world.userData.torchSites.push(V3(x,y+1.65,z));obstacle(x,z,.45,.45,'torch stand');}
}
function createTorchFlames(){const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:windUniforms.time},vertexShader:'varying vec2 v;varying float dep;uniform float time;void main(){v=uv;vec3 p=position;p.x+=sin(time*7.+uv.y*12.)*.025*uv.y;vec4 q=modelViewMatrix*vec4(p,1.);dep=-q.z;gl_Position=projectionMatrix*q;}',fragmentShader:'varying vec2 v;varying float dep;uniform float time;void main(){float y=v.y,x=abs(v.x-.5+sin(y*13.-time*8.)*.055*y),w=(1.-y)*.3+.015,shape=1.-smoothstep(w*.4,w,x);shape*=smoothstep(0.,.12,y)*(1.-smoothstep(.72,1.,y));float glow=exp(-length((v-vec2(.5,.35))*vec2(4.,2.5))*4.)*.35;vec3 color=mix(vec3(1.,.11,.004),vec3(1.,.73,.18),pow(1.-y,2.))*2.;gl_FragColor=vec4(color,(shape+glow)*(1.-smoothstep(35.,100.,dep)));}'});world.userData.torchMeshes=[];for(const p of world.userData.torchSites??[]){const o=new THREE.Mesh(sharedGeo.torchFlame??=new THREE.PlaneGeometry(.65,.95),material);o.position.copy(p);o.castShadow=false;world.add(o);world.userData.torchMeshes.push(o);}}
// Keep the light count constant across skills and battle entry. This avoids
// compiling a new version of every world shader whenever an effect starts.
let effectLightIndex=0;
const castWithAuthoredEffects=castFX;
castFX=function(...args){const start=fx.length;castWithAuthoredEffects(...args);for(const e of fx.slice(start)){if(!e.light)continue;const source=e.light,slot=world.userData.lanterns[4+(effectLightIndex++%2)];source.removeFromParent();if(slot){slot.position.copy(source.position);slot.color.copy(source.color);slot.intensity=source.intensity;slot.userData.effectUntil=clock+e.duration;slot.userData.effectDuration=e.duration;slot.userData.effectPower=source.intensity;}e.light=null;}};
const prepareAuthoredBattle=prepareBattlefield;
prepareBattlefield=function(kind){const result=prepareAuthoredBattle(kind);result.lights=result.lights.map((source,i)=>{source.removeFromParent();const l=world.userData.lanterns[6+i];l.position.copy(source.position);l.color.copy(source.color);l.intensity=source.intensity;l.userData.power=source.intensity;return l;});return result;};
const restoreAuthoredBattle=restoreBattlefield;
restoreBattlefield=function(b){restoreAuthoredBattle(b);for(const l of world.userData.lanterns)if(!l.parent)world.add(l);};
const advanceBudgetedEffects=updateWorldFX;
updateWorldFX=function(dt){advanceBudgetedEffects(dt);for(const l of world.userData.lanterns){if((l.userData.effectUntil??0)>clock)l.intensity=l.userData.effectPower*(l.userData.effectUntil-clock)/l.userData.effectDuration;}};
