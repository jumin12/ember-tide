// Private housing POIs never enter the continent or its destination atlas.
function isHomeScene139(id=state.scene){return id==='homePlot139'||id==='homeInterior139';}
let homeBuilding139=false;
const HOME_PLOT139={name:'Your private home',id:'homePlot139',aliases:[],kind:'home',bounds:[-23,23,-22,25],spawn:[10,15],node:[0,0],exit:[10,15]};
Object.defineProperty(POIS,'homePlot139',{value:HOME_PLOT139,enumerable:false});
Object.defineProperty(districtCore24,'homePlot139',{value:[...HOME_PLOT139.bounds],enumerable:false});
Object.defineProperty(districts24,'homePlot139',{value:{core:[...HOME_PLOT139.bounds],bounds:[...HOME_PLOT139.bounds],roads:[],plots:[]},enumerable:false});
SCENES.homePlot139={name:'Your home',sub:'Private grounds · Enter the house through its front door',view:'town',kit:'brook',seed:139,path:[],interact:[]};
SCENES.homeInterior139={name:'Your home',sub:'Interior · D to decorate',view:'interior',kit:'home',seed:139,path:[],interact:[]};
Object.defineProperty(INTERIORS,'homeInterior139',{value:{name:'Your home',type:'home',poi:'homePlot139'},enumerable:false});
const homePlanBefore139=scenePlan;
scenePlan=function(id){if(id==='homePlot139')return {kind:'poi',key:id,bounds:[...HOME_PLOT139.bounds]};if(id==='homeInterior139'){const l=homeLayout139();return {kind:'interior',key:id,bounds:[-l.w/2+.6,l.w/2-.6,-l.d/2+.6,l.d/2-.35]};}return homePlanBefore139(id);};
const homePoiBefore139=poiFor;
poiFor=function(id){return isHomeScene139(id)?'homePlot139':homePoiBefore139(id);};
const homeGroundBefore139=groundAt,homeHeightBefore139=heightAt,homeWaterBefore139=waterGround,homeFreeBefore139=staticFree;
function homePlotHeight139(x,z){const edge=Math.max(0,Math.abs(x)-23,Math.abs(z+1)-26);return smooth(0,18,edge)*(2.7+1.7*Math.sin(x*.13)*Math.cos(z*.16))+smooth(13,50,edge)*(5+5*Math.sin(x*.041+z*.024)**2);}
groundAt=function(x,z,...a){return state.scene==='homePlot139'?homePlotHeight139(x,z):homeBuilding139||state.scene==='homeInterior139'?0:homeGroundBefore139(x,z,...a);};
heightAt=function(x,z,...a){return state.scene==='homePlot139'?homePlotHeight139(x,z):state.scene==='homeInterior139'?0:homeHeightBefore139(x,z,...a);};
waterGround=function(...a){return isHomeScene139()?false:homeWaterBefore139(...a);};
staticFree=function(x,z,r=.5,...a){
 if(!isHomeScene139())return homeFreeBefore139(x,z,r,...a);
 const [left,right,back,front]=activeScene.bounds;if(x-r<left||x+r>right||z-r<back||z+r>front)return false;
 return !colliders.some(c=>Math.abs(x-c.x)<c.w+r&&Math.abs(z-c.z)<c.d+r);
};
const homeWildBefore139=populateRegionalWildlife;
populateRegionalWildlife=function(...a){if(!isHomeScene139())return homeWildBefore139(...a);};
function homeSurface139(key,color,opts={}){
 const id='home139-'+key+color+JSON.stringify(opts);if(matCache.has(id))return matCache.get(id);
 const source=material(key,color,opts),m=source.clone();m.onBeforeCompile=source.onBeforeCompile;m.customProgramCacheKey=source.customProgramCacheKey.bind(source);m.color.set(color);m.userData={...source.userData,homePigment139:true};matCache.set(id,m);return m;
}
function homeBox139(x,y,z,w,h,d,key,color,parent=world,opts={}){const o=box(x,y,z,w,h,d,key,color,parent,opts);o.material=homeSurface139(key,color,opts);return o;}
const homeLightingBefore139=updateLighting;
updateLighting=function(...a){
 if(state.scene!=='homePlot139')return homeLightingBefore139(...a);
 const key=activeScene.key;activeScene.key=housing139().home?.region??'brookstead';try{return homeLightingBefore139(...a);}finally{activeScene.key=key;}
};
function homePlane139(w,d,key,color,y=0,parent=world,segments=1){
 const geo=new THREE.PlaneGeometry(w,d,segments,segments);geo.rotateX(-Math.PI/2);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w*.33,uv.getY(i)*d*.33);
 if(segments>1){const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,homePlotHeight139(p.getX(i),p.getZ(i)));geo.computeVertexNormals();}
 const o=mesh(geo,homeSurface139(key,color),0,y,0,parent);o.castShadow=false;return o;
}
function homePath139(points,width=2.8,parent=world){
 const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>V3(x,.026,z))),pos=[],uv=[],idx=[];const steps=Math.max(20,points.length*12);
 for(let i=0;i<=steps;i++){const t=i/steps,p=curve.getPoint(t),dir=curve.getTangent(t),side=V3(-dir.z,0,dir.x).normalize().multiplyScalar(width/2);for(const s of[-1,1]){const v=p.clone().addScaledVector(side,s);pos.push(...v.toArray());uv.push((s+1)/2,t);}if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const o=mesh(g,homeGardenMaterial139('path'),0,0,0,parent);o.castShadow=false;o.userData.frontagePath110=true;return o;
}
// The same actual house model is used on its plot and in the purchase preview.
function homeShell139(region,parent){
 const q=homeBuildingStyle139(homeStyle139(region)),g=new THREE.Group(),roof=new THREE.Group(),w=region==='highmere'?13:11.8,d=9,h=region==='highmere'?5.7:4.8;parent.add(g);g.add(roof);g.position.z=-4;
 const panel=(x,y,z,ww,hh,dd,key=q.wallMaterial139,tint=q.wall)=>homeBox139(x,y,z,ww,hh,dd,key,tint,g),front=d/2+.12;
 g.userData={worldHouse:true,kind:'personal-house',footprint:{w,d},front:V3(0,0,1),door:V3(0,0,.62),roofShell:roof,architecture31:{openings:[],door:[0,front],roofRise:2.7},home139:true};
 panel(0,.18,0,w+.25,.36,d+.25,'wall','#c4c5b1');panel(0,h/2+.2,-d/2,w,h,.30);for(const s of[-1,1])panel(s*w/2,h/2+.2,0,.30,h,d);
 for(const s of[-1,1])panel(s*(w/4+.56),h/2+.2,d/2,w/2-1.12,h,.30);
 panel(0,(h+3.45)/2,d/2,2.24,h-3.05,.30);
 const stone=region==='highmere',woodKey=stone?'wall':'wood';
 for(const s of[-1,1])for(const z of[-d/2,d/2])panel(s*w/2,h/2+.2,z,.25,h+.2,.28,woodKey,stone?'#dedbc8':q.wood);
 for(const y of[1,h+.1]){panel(0,y,front,w+.2,.20,.24,woodKey,stone?'#e8e5d2':q.wood);for(const s of[-1,1])panel(s*(w/2+.04),y,0,.24,.20,d+.2,woodKey,stone?'#dedbc8':q.wood);}
 if(!stone)for(const s of[-1,1])beam(V3(s*(w/2-.2),h-1.4,front+.05),V3(s*(w/2-1.4),h,front+.05),.09,'wood',q.wood,g);
 door31(g,0,front);for(const s of[-1,1]){window31(g,s*w*.29,2.6,front+.06,0,.94);window31(g,s*(w/2+.14),2.6,0,s*Math.PI/2,.90);}
 if(region==='fern'){const r=archRoof(roof,w+1.6,d+1.9,2.8,'brook');r.position.y=h+.22;}
 else if(region==='highmere')hipRoof121(roof,w+1,d+1,h+.22,2.8);
 else roof121(roof,0,0,w+1,d+1,h+.22,2.8);
 if(region!=='fern'){roof121(roof,0,2.5,4.7,5.6,h+.08,2.25,0,{y:.94,w:.96,h:1.3});window31(roof,0,h+1.05,5.43,0,.62);}
 roof.traverse(o=>{if(o.isMesh&&o.material?.userData?.textureKey==='slate')o.material=homeSurface139(q.roofMaterial139,q.roof,{side:THREE.DoubleSide});});
 chimney121(roof,-w*.29,-2,h+1.1,3,.92);porch121(g,0,front,5.1,1.4,3.9,region==='harbor');
 for(const s of[-1,1]){planter121(g,s*w*.29,1.48,front+.20,2);barrel121(g,s*(w/2-.6),.10,front+1,.70);}
 if(region==='fern'){for(const s of[-1,1])beam(V3(s*w*.39,.35,front+.9),V3(s*w*.39,4.25,front+.9),.17,'bark',q.wood,g);}
 g.traverse(o=>{if(o.isMesh&&o.material?.userData?.textureKey==='slate')o.material=homeSurface139(q.roofMaterial139,q.roof,{side:THREE.DoubleSide});});
 if(region==='harbor'){for(const s of[-1,1]){const ring=mesh(new THREE.TorusGeometry(.40,.065,6,24),material('metal','#987744',{roughness:.60,metalness:.6}),s*(w*.42),2.1,front+.23,g);ring.rotation.y=.1;}}
 return {g,w,d,h,door:[0,2]};
}
function homePortal139(x,z,label,kind='homeReturn139'){
 const g=new THREE.Group();g.position.set(x,0,z);g.name='Homeward portal';world.add(g);
 const plinth=mesh(new THREE.CylinderGeometry(1.5,1.65,.3,32),material('wall','#bbc5bb'),0,.15,0,g);plinth.receiveShadow=true;
 for(const s of[-1,1]){box(s*1.16,1.8,0,.45,3.45,.55,'wall','#c4cbbd',g);box(s*1.16,.52,0,.66,.27,.74,'wall','#d7d5c0',g);}
 const arch=mesh(new THREE.TorusGeometry(1.18,.25,8,36,Math.PI),material('wall','#c3ccbd'),0,3.35,0,g);
 const trim=mesh(new THREE.TorusGeometry(1.20,.045,6,48),material('metal','#c9ad63',{metalness:.7,roughness:.3}),0,2.1,.10,g);trim.scale.y=1.62;
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;void main(){vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);float flow=pow(.5+.5*sin(a*3.-r*15.+time*2.2),5.);float rim=pow(clamp(r,0.,1.),7.);float core=exp(-r*4.);vec3 c=mix(vec3(.025,.16,.23),vec3(.13,.59,.75),flow*.72+core*.35);c+=rim*vec3(.52,.73,.70);float alpha=(1.-smoothstep(.91,1.,r))*(.6+flow*.35);gl_FragColor=vec4(c,alpha);#include <colorspace_fragment>\n}`.replace(';#include',';\n#include')});
 const gate=mesh(new THREE.PlaneGeometry(2.25,3.65),m,0,2.12,.07,g);gate.castShadow=false;gate.receiveShadow=false;gate.userData.dynamicFX=true;
 const light=new THREE.PointLight('#62c5d4',1.4,7,2);light.position.set(0,2,1);g.add(light);
 world.userData.homePortals139??=[];world.userData.homePortals139.push({group:g,material:m});
 interactables.push({id:kind,type:kind,x,z:z+1.7,radius:3,label,visualHeight:1.7});obstacle(x,z,2.4,.6,'home portal');return g;
}
function createHomeKeeper139(x,z){
 const a=createActor('azarith',x,z,2.35);if(!a)return;
 a.npc=true;a.homeKeeper139=true;a.task='Helping travelers find a home';a.face='south';a.speed=0;
 const o={id:'housing139',type:'housing139',x,z,actorId:'azarith',actor:a,radius:3,label:'Talk to Azarith · Housing',visualHeight:2.8};interactables.push(o);a.interaction=o;
 world.userData.homeKeeper139={a,o};return a;
}
function addTownHousing139(){return addTownHousing140();}
function buildPrivatePlot139(spawn){
 const h=housing139(),q=homeStyle139(),layout=homeLayout139();state.poi='homePlot139';HOME_PLOT139.name=SCENES.homePlot139.name=q.name;SCENES.homePlot139.kit=q.kit;
 const floor=homePlane139(180,180,'grass','#91a384',-.022,world,64);floor.material=homeGardenMaterial139();floor.userData.terrain=true;world.userData.terrain=floor;world.userData.walkSurfaces=[floor];world.userData.terrainChunks=[];
 homePath139([[10,15],[4,12],[0,7],[0,2]],3.2);homePath139([[0,10],[-7,9],[-12,13]],2.4);
 const shell=homeShell139(q.id,world);world.userData.buildings.push(shell.g);obstacle(0,-4,shell.w+.1,shell.d+.1,'home exterior');
 interactables.push({id:'homeDoor139',type:'homeDoor139',x:0,z:2.05,radius:2.4,label:'Enter '+q.name,visualHeight:1.7});
 homePortal139(11,15,'Return to '+(POIS[h.return?.poi]?.name??q.town));createHomeKeeper139(7.5,15.9);
 const rng=seeded(139+[...q.id].reduce((n,c)=>n+c.charCodeAt(0),0));
 for(let i=0;i<180;i++){const a=rng()*TAU,r=i<65?24+rng()*8:30+rng()*29,x=Math.cos(a)*r,z=Math.sin(a)*r-5;if(Math.hypot(x-9,z-17)<12||z>20&&Math.abs(x)<14)continue;tree(x,z,.85+rng()*.65,q.trees,rng);}
 for(const [x,z,s]of[[-15,-10,1.05],[-15,3,.95],[-15,18,.82],[17,-8,1.0],[20,4,.9],[-10,-18,1.1],[10,-18,.95]])tree(x,z,s,q.trees,rng);
 for(let i=0;i<(mobileStartup116()?2100:4200);i++){const x=(rng()-.5)*84,z=(rng()-.5)*78;
  if(Math.abs(x)<shell.w/2+1&&Math.abs(z+4)<6||homePathDistance139(x,z)<2.15||Math.hypot(x-11,z-15)<4.3||Math.hypot(x-7.5,z-16)<2.5)continue;
  plant(x,z,.55+rng()*.65,i%13===0?'flower':i%7===0?'fern':'grassBlades',homePlotHeight139(x,z));
 }
 homeGardenBoundary139(q);dressHomePortalCourt139(q);
 for(const [i,[x,z]]of[[-12,13],[-14,11],[-17,-5],[16,-12]].entries()){const r=mesh(rockGeometry62(i*3+1),rockMaterial62(i%3),x,0,z);r.scale.setScalar(.9+rng()*.5);r.rotation.y=rng()*TAU;}
 buildSolidForest();buildPlants();rebuildHomeDecor139();homeSky139();finishJourneyWorld(spawn??[7.5,19]);makeWorldDust22();updateAtmosphere();world.userData.housing139={region:q.id,layout:h.home.layout,private:true,exteriorDecor:true};
}
function homeSky139(){
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{map:weather.cloudMap,time:weather.time,cover:weather.cloud,day:celestial31.day,night:celestial31.night,twilight:celestial31.twilight,solar:celestial31.sun,moon:celestial31.moon,solarColour:celestial31.colour,horizon:{value:scene.fog.color},zenith31:celestial31.zenith,cloudHeight:weather.height},vertexShader:'varying vec3 skyRay31;void main(){skyRay31=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=vec4(p.xy,p.w*.999999,p.w);}',fragmentShader:skyFragment31});
 const o=new THREE.Mesh(new THREE.SphereGeometry(1450,24,16),m);o.userData.dynamicFX=true;o.frustumCulled=false;o.renderOrder=-50;world.add(o);world.userData.sky27=o;world.userData.celestial31={orbit:true,linkedClouds:true,worldShafts:true};
}
function homeWall139(parent,l,q){
 q=homeBuildingStyle139(q,true);const hw=l.w/2,hd=l.d/2,windows=[-.27*l.w,.27*l.w],edges=[-hw,...windows.flatMap(x=>[x-.80,x+.80]),hw],wallKey=q.wallMaterial139;
 for(let i=0;i<edges.length-1;i+=2){const a=edges[i],b=edges[i+1];homeBox139((a+b)/2,2.65,-hd,b-a,5.3,.36,wallKey,q.wall,parent);}
 homeBox139(0,.875,-hd,l.w,1.75,.36,wallKey,q.wall,parent);homeBox139(0,4.575,-hd,l.w,1.45,.36,wallKey,q.wall,parent);
 for(const x of windows)window31(parent,x,2.8,-hd+.18,0,1.15);
 for(const s of[-1,1]){homeBox139(s*hw,2.5,-hd/2,.36,5,hd,wallKey,q.wall,parent);homeBox139(s*hw,.65,hd/2,.36,1.3,hd,wallKey,q.wall,parent);for(const z of[-hd,-hd/2,0,hd/2,hd])homeBox139(s*hw,z<0?2.5:.74,z,.25,z<0?5:1.5,.25,'wood',q.wood,parent);for(const z of[-hd,hd])homeBox139(0,.28,z,l.w,.3,.4,'wood',q.wood,parent);}
 for(const y of[1.2,5.25])homeBox139(0,y,-hd+.23,l.w,.18,.20,'wood',q.wood,parent);
 for(const x of[-hw,hw,0])homeBox139(x,2.6,-hd+.23,.22,5.2,.24,'wood',q.wood,parent);
 // No roof, overhead beams or ceiling scaffolding in the cutaway interior.
 for(const s of[-1,1]){homeBox139(s*(hw/2+1),.55,hd,hw-2,1.1,.35,wallKey,q.wall,parent);homeBox139(s*1.85,1.6,hd,.22,3.2,.4,'wood',q.wood,parent);}
 if(l===HOME_LAYOUTS139.suite){homeBox139(-5,1.45,-2.8,.30,2.9,7.8,'wood',q.wood,parent);homeBox139(-5,2.96,-2.8,.40,.17,8,'wood',q.wood,parent);}
}
function homeHearth139(l){
 const x=-l.w/2+1.7,z=-l.d/2+1.35,g=new THREE.Group(),finish=(homeAppearanceDraft139??homeAppearance139()).hearth,stoneKey=finish==='slate'?'rockB':finish==='limestone'?'rockA':'rock',stoneColor=finish==='slate'?'#8e9b9d':finish==='limestone'?'#d5d1bd':'#b7b9a3';g.position.set(x,0,z);world.add(g);world.userData.homeHearthRoot139=g;
 box(0,.16,0,3.1,.32,2.5,'wall','#c8c1a9',g);for(const s of[-1,1])box(s*1.15,1.4,-.25,.50,2.6,1.55,stoneKey,stoneColor,g);
 box(0,2.75,-.25,2.9,.32,1.7,'wall','#d1c7ac',g);box(0,1.4,-.95,2.2,2.6,.15,'darkWood','#44433b',g);box(0,3.65,-.85,2.3,1.5,1.2,stoneKey,stoneColor,g);
 for(let i=0;i<4;i++){const o=mesh(new THREE.CylinderGeometry(.14,.17,1.4,9),homeSurface139('barkPine86','#6e5c41'),(i%2-.5)*.5,.42,-.02+(i-1.5)*.25,g);o.rotation.z=Math.PI/2;o.rotation.y=i*.3;}
 const fireMaterial=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 uv139;void main(){uv139=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 uv139;uniform float time;void main(){vec2 p=uv139;float drift=.06*sin(p.y*15.-time*5.)+.035*sin(p.y*29.+time*3.7);float width=(1.-p.y)*(.41+.05*sin(time*6.+p.y*17.));float edge=abs(p.x-.5+drift);float shape=(1.-smoothstep(width*.60,width,edge))*(1.-smoothstep(.72,1.,p.y));float core=clamp((1.-p.y)*1.3-edge*2.,0.,1.);vec3 c=mix(vec3(.96,.15,.015),vec3(1.,.77,.22),core);gl_FragColor=vec4(c,shape*.92);}`});fireMaterial.userData.homeOwned139=true;
 const fire=mesh(new THREE.PlaneGeometry(1.2,1.35),fireMaterial,0,1.0,.30,g);fire.userData.dynamicFX=true;fire.castShadow=false;fire.receiveShadow=false;
 const cross=mesh(new THREE.PlaneGeometry(1.0,1.15),fireMaterial,0,.9,.13,g);cross.rotation.y=Math.PI/2;cross.userData.dynamicFX=true;cross.castShadow=false;cross.receiveShadow=false;
 const lamp=new THREE.PointLight('#ffba68',2.0,9,2);lamp.position.set(0,1.3,.5);g.add(lamp);world.userData.homeFire139={mesh:fire,light:lamp};
}
function buildPrivateInterior139(spawn){
 const h=housing139(),q=homeStyle139(),l=homeLayout139();state.poi='homePlot139';SCENES.homeInterior139.name=q.name;SCENES.homeInterior139.sub=HOME_LAYOUTS139[h.home.layout].name+' · D to decorate';
 const floor=homePlane139(l.w,l.d,q.floor,q.floor==='wood'?'#b9c5ae':'#c9cebd',.008);floor.userData.terrain=true;world.userData.terrain=floor;world.userData.walkSurfaces=[floor];world.userData.terrainChunks=[];world.userData.interior='home';
 const shell=new THREE.Group();world.add(shell);world.userData.homeRoomShell139=shell;homeWall139(shell,l,q);homeHearth139(l);
 for(const v of homeFixed139(l).filter(v=>v.name!=='the entrance aisle'))obstacle(v.x,v.z,v.w,v.d,v.name);
 interactables.push({id:'homeExit139',type:'homeExit139',x:0,z:l.d/2-1.0,radius:2.25,label:'Step outside',visualHeight:.5});
 interactables.push({id:'homeDecor139',type:'homeDecor139',x:-l.w/2+3.8,z:-l.d/2+3.4,radius:3.4,label:'Decorate your home',visualHeight:1});
 rebuildHomeDecor139();finishJourneyWorld(spawn??[0,l.d/2-3.6]);world.userData.housing139={region:q.id,layout:h.home.layout,private:true,interiorDecor:true};
}
function retainTownForHome139(){
 if(activeScene?.kind!=='poi'||isHomeScene139()||!world||locations137.metadata.get(world)?.owner!==state)return false;
 const q=captureNearby69();q.bytes137=locationBytes137(q);q.stamp137=locationStamp137();if(q.bytes137>(mobileStartup116()?64:128)*1024*1024)return false;
 for(const key of [...locations137.entries.keys()])evictLocation137(key);holdNearbyResources69(q);locations137.entries.set(activeScene.key,q);locations137.bytes=q.bytes137;return true;
}
const homeWorldBefore139=buildWorld;
buildWorld=function(id='approach',spawn=null,...a){
 document.body.classList.toggle('home-scene139',isHomeScene139(id));
 if(!isHomeScene139(id)){if(camera?.view?.enabled)camera.clearViewOffset();return homeWorldBefore139(id,spawn,...a);}
 if(!housing139().home){toast('Purchase a home from Azarith first.');return homeWorldBefore139('entrance',POIS.brookstead.spawn);}
 const retained=retainTownForHome139(),dispose=disposeContinuousWorld;
 if(retained){disposeContinuousWorld=()=>scene.remove(world);detachLocationGlobals137();}
 try{activeScene=scenePlan(id);resetJourneyWorld(id);landscapeBounds26=[...activeScene.bounds];homeBuilding139=true;id==='homePlot139'?buildPrivatePlot139(spawn):buildPrivateInterior139(spawn);}
 finally{homeBuilding139=false;disposeContinuousWorld=dispose;}
};
const homeGraphicsBefore139=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...a){addTownHousing139();const r=await homeGraphicsBefore139(...a);if(world.userData.homeNeedsRegister139){registerPlayerOccluders114();delete world.userData.homeNeedsRegister139;}if(isHomeScene139())updateCamera(1,true);return r;};
async function visitHome139(){
 const h=housing139();if(!h.home){toast('Purchase a home to unlock home travel.');return false;}
 if(gameLoading||sceneSwitchPending||poiFade.active||battle)return false;
 if(!isHomeScene139()){
  const poi=activeScene.kind==='interior'?INTERIORS[activeScene.key]?.poi:activeScene.key,p=POIS[poi];
  if(!p){toast('Travel to a settlement before using home travel.');return false;}
  const back=activeScene.kind==='interior'?state.interiorReturn:null;h.return={scene:activeScene.kind==='interior'?(back?.id??p.id):state.scene,poi,x:back?.spawn?.[0]??(activeScene.kind==='interior'?p.spawn[0]:player.x),z:back?.spawn?.[1]??(activeScene.kind==='interior'?p.spawn[1]:player.z)};
 }
 if(world.userData.homeKeeper139)world.userData.homeKeeper139.a.homewardUntil139=clock+3;
 closeHousing139();homeChange139();return changeJourneyScene('homePlot139',[7.5,19]);
}
async function returnFromHome139(){
 const h=housing139(),r=h.return??{scene:POIS[h.home?.region??'brookstead'].id,poi:h.home?.region??'brookstead',x:POIS[h.home?.region??'brookstead'].spawn[0],z:POIS[h.home?.region??'brookstead'].spawn[1]};
 closeHousing139();return changeJourneyScene(r.scene,[r.x,r.z]);
}
const homeActBefore139=act;
act=function(o,...a){
 if(!o)return homeActBefore139(o,...a);
 if(['housing139','townHomePortal139','homeReturn139','homeDoor139','homeExit139','homeDecor139'].includes(o.type)){
  if(menu||dialogue||battle||gameLoading||sceneSwitchPending||dist(player,o)>(o.radius??3))return;
  keys.clear();route=null;
  if(o.type==='housing139'||o.type==='townHomePortal139'){openHousing139('greeting');return;}
  if(o.type==='homeReturn139'){returnFromHome139();return;}
  if(o.type==='homeDoor139'){changeJourneyScene('homeInterior139',[0,homeLayout139().d/2-3.6]);return;}
  if(o.type==='homeExit139'){changeJourneyScene('homePlot139',[0,3.6]);return;}
  startHomeDecor139();return;
 }
 const chest=o.type==='chest',key=o.chest68?.key??state.scene+':'+o.x+':'+o.z,was=state.flags[key],r=homeActBefore139(o,...a);
 if(chest&&!was&&state.flags[key])grantHomeDecor139('chest:'+key,'homePainting139');return r;
};
const homeAvailableBefore139=interactionAvailable;
interactionAvailable=function(o,...a){if(['housing139','townHomePortal139','homeReturn139','homeDoor139','homeExit139','homeDecor139'].includes(o?.type))return !battle&&state.mode==='explore';return homeAvailableBefore139(o,...a);};
const homeCameraBefore139=updateCamera;
updateCamera=function(dt,instant=false,...a){
 const r=homeCameraBefore139(dt,instant,...a);if(!isHomeScene139()||battle||!player)return r;
 const inside=state.scene==='homeInterior139',decor=homeDecor139.active,l=homeLayout139(),portrait=camera.aspect<.8;
 const target=inside?V3(0,1.7,0):decor?V3(0,1.5,1):V3(clamp(player.x*.30,-4,4),1.5,clamp((player.z-4)*.5,-8,10));camera.clearViewOffset();camera.zoom=1;camera.fov=portrait?42:36;camera.aspect=innerWidth/innerHeight;
 let left=0,bottom=0;if(decor){const panel=homeDecor139.root?.querySelector('.home-collection139')?.getBoundingClientRect(),bar=homeDecor139.root?.querySelector('.home-place-toolbar139')?.getBoundingClientRect();if(portrait)bottom=innerHeight-(panel?.top??innerHeight*.52);else{left=(panel?.right??290)+12;bottom=(bar?.height??88)+24;}}
 const availW=Math.max(160,innerWidth-left),availH=Math.max(150,innerHeight-bottom),tan=Math.tan(camera.fov*Math.PI/360),distance=inside?Math.max((l.w+4)/(2*tan*camera.aspect*availW/innerWidth),(l.d*.65+7)/(2*tan*availH/innerHeight)):Math.max(48,34/(2*tan*camera.aspect));
 const offset=V3(inside?.14:.20,.76,1).normalize().multiplyScalar(distance),position=target.clone().add(offset);camera.updateProjectionMatrix();
 if(decor&&(left||bottom))camera.setViewOffset(innerWidth,innerHeight,-left/2,bottom/2,innerWidth,innerHeight);
 camera.position.copy(position);camera.lookAt(target);camera.updateMatrixWorld(true);focusPoint.copy(target);cameraTarget.copy(target);botanicalFocus103.value.set(player.x,0,player.z);
 if(post?.material?.uniforms.focus)post.material.uniforms.focus.value=camera.position.distanceTo(target);return r;
};
const homeTickBefore139=tick;
tick=function(dt){const r=homeTickBefore139(dt);if(!world)return r;
 for(const p of world.userData.homePortals139??[])p.material.uniforms.time.value=clock;
 const f=world.userData.homeFire139;if(f){f.mesh.material.uniforms.time.value=clock;f.mesh.scale.set(1+.07*Math.sin(clock*7),1+.12*Math.sin(clock*9),1);f.mesh.updateMatrix();f.light.intensity=1.9+.10*Math.sin(clock*8.7);}
 updateHomeKeeper139();updateHomeDecor139(dt);return r;
};
