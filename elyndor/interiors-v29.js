// Human-scale, front-facing cutaway rooms. Decorations share the same lighting
// and batched geometry as the furniture; none is a painted room backdrop.
const rooms29={built:0,flames:0};
function roomMaterial29(key,color,opts={}){
 // Illustrated rugs and paintings have one UV chart, never triplanar repeats.
 const id='room29-'+key+color+JSON.stringify(opts);if(matCache.has(id))return matCache.get(id);
 const m=new THREE.MeshStandardMaterial({map:textures[key],bumpMap:['panel29','hearth29'].includes(key)?textures[key]:null,bumpScale:.025,color,roughness:.88,...opts});matCache.set(id,m);return m;
}
function roomBox29(x,y,z,w,h,d,key='wood',color='#d9bb8c',opts={}){
 const o=box(x,y,z,w,h,d,key,color,world,opts);
 if(['panel29','hearth29','rug29','landscape29','cloth'].includes(key))o.material=roomMaterial29(key,color,opts);
 if(['panel29','hearth29'].includes(key)){
  const cache='room29-'+w+'-'+h+'-'+d;
  if(!sharedGeo[cache]){const g=sharedGeo.box.clone(),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
   for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));const u=nx>=ny&&nx>=nz?p.getZ(i)*d:p.getX(i)*w,v=ny>=nx&&ny>=nz?p.getZ(i)*d:p.getY(i)*h;uv.setXY(i,u*.36,v*.36);}sharedGeo[cache]=g;
  }o.geometry=sharedGeo[cache];
 }
 return o;
}
function roomBottle29(x,y,z,k=0,s=1){
 const colors=['#417d8a','#75946a','#b48146','#4e5a82','#b7a58b'];
 const m=roomMaterial29(k===4?'plaster':'metal',colors[k%5],{roughness:.38,metalness:.12});
 mesh(new THREE.CylinderGeometry(.11*s,.16*s,.4*s,10),m,x,y+.2*s,z);
 mesh(new THREE.CylinderGeometry(.055*s,.085*s,.2*s,8),m,x,y+.49*s,z);
 roomBox29(x,y+.6*s,z,.1*s,.08*s,.1*s,'wood','#ae8c57');
}
function roomMug29(x,y,z){
 const m=material('metal','#afa28b',{roughness:.45,metalness:.48});
 mesh(new THREE.CylinderGeometry(.13,.11,.27,10),m,x,y+.14,z);
 const handle=mesh(new THREE.TorusGeometry(.095,.025,5,10),m,x+.15,y+.14,z);handle.rotation.y=Math.PI/2;
 mesh(new THREE.CircleGeometry(.105,10),material('darkWood','#674124'),x,y+.278,z).rotation.x=-Math.PI/2;
}
function roomBooks29(x,y,z,n,seed=1){
 const rng=seeded(seed),colors=['#4e6770','#8a4e37','#bc985f','#778266','#574d65','#c9b48b'];
 let xx=x;
 for(let i=0;i<n;i++){const w=.14+rng()*.12,h=.4+rng()*.25;
  roomBox29(xx,y+h/2,z,w,h,.37,'cloth',colors[i%colors.length]);
  for(const yy of[.08,h-.09])roomBox29(xx,y+yy,z+.195,w*.9,.026,.025,'metal','#d9bc77');
  xx+=w+.022;
 }
}
function stockedShelf29(x,z,width=4,books=false,seed=1){
 const rng=seeded(seed);
 for(const side of[-1,1])roomBox29(x+side*width/2,2.55,z,.15,5.1,.55,'darkWood','#b09164');
 roomBox29(x,2.5,z-.26,width,5,.12,'panel29','#d2ad7c');
 for(const y of[.35,1.35,2.4,3.5,4.55]){
  roomBox29(x,y,z,width+.16,.12,.76,'wood','#dbbb84');
  roomBox29(x,y-.1,z+.34,width+.1,.12,.08,'darkWood','#c49a55');
  if(books){roomBooks29(x-width*.44,y+.07,z+.07,Math.floor(width*3.3),seed+Math.floor(y*10));continue;}
  for(let i=0;i<Math.floor(width*1.8);i++){
   const px=x-width*.42+i*.56;
   if((i+Math.floor(y*3))%4===0){for(let j=0;j<3;j++)mesh(new THREE.CylinderGeometry(.21,.2,.035,12),material('metal','#c5b89d',{roughness:.65}),px,y+.09+j*.05,z+.08);}
   else if(i%5===0)roomMug29(px,y+.08,z+.08);
   else roomBottle29(px,y+.07,z+.02,Math.floor(rng()*5),.8+rng()*.28);
  }
 }
}
function roomPlant29(x,y,z,s=1,flowers=false){
 mesh(new THREE.CylinderGeometry(.22*s,.14*s,.37*s,10),material('plaster','#a2764f'),x,y+.185*s,z);
 const rng=seeded(Math.round((x+20)*77+(z+20)*37));
 for(let i=0;i<9;i++){
  const a=i*2.4,r=.12+rng()*.22,h=.35+rng()*.4;
  const stem=roomBox29(x+Math.cos(a)*r*s,y+(.3+h*.5)*s,z+Math.sin(a)*r*s,.025*s,h*s,.025*s,'bark','#65804c');
  const leaf=mesh(new THREE.IcosahedronGeometry(.18*s,0),roomMaterial29('oakCanopy',i%2?'#d5dfaf':'#e0e6ae',{emissive:'#586b33',emissiveIntensity:.13}),stem.position.x,y+(.3+h)*s,stem.position.z);leaf.scale.set(1.3,.4,.55);leaf.rotation.z=a;
  if(flowers&&i%2===0)mesh(new THREE.SphereGeometry(.085*s,6,4),material('cloth',i%4?'#e7cf8a':'#dba4a4'),stem.position.x,leaf.position.y+.055*s,stem.position.z);
 }
}
function roomRug29(x,z,w,d,rotation=0){
 const o=mesh(new THREE.PlaneGeometry(w,d),roomMaterial29('rug29','#e0c6a0',{roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),x,.012,z);o.rotation.set(-Math.PI/2,0,rotation);o.castShadow=false;return o;
}
function roomChair29(x,z,angle=0){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=angle;g.userData.interiorFixture29=true;world.add(g);
 box(0,.55,0,.75,.14,.78,'wood','#c8a16c',g);
 for(const a of[-1,1])for(const b of[-1,1])box(a*.28,.28,b*.29,.09,.55,.09,'darkWood','#a58054',g);
 for(const a of[-1,1])box(a*.28,1,-.31,.09,1.05,.1,'wood','#bd9660',g);
 for(const y of[.85,1.22])box(0,y,-.31,.7,.17,.1,'wood','#d1ae79',g);
 obstacle(x,z,.85,.85,'chair');
 world.userData.chairs29??=[];world.userData.chairs29.push(g);return g;
}
function roomChairFacing29(x,z,tx,tz){
 const g=roomChair29(x,z,Math.atan2(tx-x,tz-z));g.userData.seatingTarget29=V3(tx,0,tz);return g;
}
function roomTable29(x,z,r=1.4){
 const m=material('wood','#debb80');mesh(new THREE.CylinderGeometry(r,r,.18,24),m,x,1.05,z);
 for(const a of[-1,1])for(const b of[-1,1])roomBox29(x+a*r*.45,.48,z+b*r*.45,.16,.96,.16,'darkWood','#b18c59');
 obstacle(x,z,r*2,r*2,'table');roomCandle(x,1.18,z);roomMug29(x+.55,1.15,z+.18);roomBottle29(x-.5,1.15,z-.15,2,.85);
 const plate=mesh(new THREE.CylinderGeometry(.3,.28,.04,14),material('plaster','#cfbd91'),x+.35,1.18,z-.5);
 for(let i=0;i<3;i++){const bread=mesh(new THREE.SphereGeometry(.12,8,5),material('wood','#cfac61'),plate.position.x+(i-1)*.12,1.28,z-.5);bread.scale.set(.8,.6,1.3);}
 roomChairFacing29(x-r-1,z,x,z);roomChairFacing29(x+r+1,z,x,z);
}
function roomPainting29(x,y,z,w=3.5,h=1.9){
 roomBox29(x,y,z,w+.25,h+.25,.15,'darkWood','#8e6335');roomBox29(x,y,z+.09,w+.08,h+.08,.07,'metal','#c09a50');
 roomBox29(x,y,z+.14,w,h,.03,'landscape29','#fff3da');
}
function roomDoor29(x,z){
 roomBox29(x,2.1,z,2,4.2,.18,'wood','#b08b57');
 for(const a of[-1,1])roomBox29(x+a*1.12,2.25,z+.08,.2,4.5,.3,'darkWood','#bf995f');
 roomBox29(x,4.48,z+.08,2.4,.24,.3,'darkWood','#c7a16c');
 mesh(new THREE.SphereGeometry(.075,8,6),material('metal','#dbb963'),x+.65,1.8,z+.2);
}
function roomBanner29(x,z,color='#3f536b'){
 roomBox29(x,3.8,z,1.25,3.2,.07,'cloth',color);roomBox29(x,5.45,z+.02,1.55,.12,.18,'metal','#d4ae66');
 const seal=mesh(new THREE.PlaneGeometry(.8,.8),new THREE.MeshStandardMaterial({map:textures.runeSeal,transparent:true,alphaTest:.08,depthWrite:false,color:'#ddba74',roughness:.8}),x,3.75,z+.06);seal.castShadow=false;
}
function roomFire29(x,z){
 // An open stone surround, rather than a black rectangle pasted onto a block.
 for(const side of[-1,1])roomBox29(x+side*1.65,1.65,z,.85,3.3,1.25,'hearth29','#d9b88e');
 roomBox29(x,3.1,z,4.1,.65,1.25,'hearth29','#d7b88d');
 roomBox29(x,3.6,z,4.7,.25,1.65,'wood','#d1ae77');
 roomBox29(x,.17,z+.55,4.5,.34,2.1,'hearth29','#d0b999');
 const lining=roomBox29(x,1.45,z-.46,2.8,2.6,.1,'rock','#24170f');lining.material=roomMaterial29('rock','#24170f');
 for(const dz of[-.28,.25]){const log=mesh(new THREE.CylinderGeometry(.2,.24,2.3,9),roomMaterial29('bark','#64412b'),x,.5,z+dz);log.rotation.z=Math.PI/2;}
 for(let i=0;i<7;i++)mesh(new THREE.IcosahedronGeometry(.13,0),roomMaterial29('rock','#a14214',{emissive:'#ff570b',emissiveIntensity:.6,roughness:1}),x-1+i*.32,.4,z+.24);
 for(let i=-2;i<=2;i++)roomBox29(x+i*.42,.62,z+.55,.05,.75,.05,'metal','#7c6652');
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){vec2 p=vUv;float n=noise(vec2(p.x*6.,p.y*4.-time*2.5))*.6+noise(vec2(p.x*12.,p.y*7.-time*4.))*.3;
 float width=(1.-p.y)*.45;float shape=1.-smoothstep(width*.35,width+.08,abs(p.x-.5+sin(p.y*9.-time*2.)*.04));float a=shape*smoothstep(1.,.1,p.y)*smoothstep(.02,.16,p.y)*smoothstep(.10,.55,n-p.y*.25);
 vec3 c=mix(vec3(1.,.09,.002),vec3(1.,.45,.055),1.-p.y);gl_FragColor=vec4(c*.95,a*.88);}`});
 const flame=mesh(new THREE.PlaneGeometry(2.7,2.5),m,x,1.7,z+.45);flame.castShadow=flame.receiveShadow=false;flame.userData.dynamicFX=true;
 world.userData.roomFlame29=flame;world.userData.roomHearth29=V3(x,1.8,z+1.3);rooms29.flames++;
 obstacle(x,z,4.8,2.5,'hearth');roomPainting29(x,5,-8.89,3.7,1.8);
}
function buildRoomFixtures29(spec,id){
 const inn=spec.type==='inn',shop=spec.type==='shop',archive=spec.type==='archives';
 roomDoor29(spec.type==='council'?-5.8:1,-8.92);
 for(const x of[-11,3.3,11.2]){roomCandle(x,3.6,-8.55);roomBox29(x,3.15,-8.6,.5,.14,.65,'wood','#c6a06a');}
 for(const x of[-11.9,11.9])for(const z of[-3,4]){roomCandle(x,2.9,z);roomPlant29(x*.93,.13,z+1.4,1.35,true);}
 if(inn){
  stockedShelf29(-6,-8.23,8.3,false,29);
  roomBox29(-4.7,.63,-4.2,10.8,1.26,1.55,'panel29','#d7bd9c');roomBox29(-4.7,1.36,-4.2,11.25,.18,1.95,'wood','#e4c08a');
  for(const x of[-9.9,-7.5,-5,-2.5,.5])roomBox29(x,.63,-3.39,.14,1.26,.12,'darkWood','#af8552');
  for(const y of[.16,1.18])roomBox29(-4.7,y,-3.37,10.9,.16,.14,'wood','#d4ab6c');
  roomBox29(-3.6,.68,-3.25,1.1,1.15,.07,'rug29','#bea77b');
  obstacle(-4.7,-4.2,10.95,1.95,'inn counter');
  for(const x of[-9.3,-.2])roomCandle(x,1.47,-4.2);roomPlant29(-8,1.47,-4.2,.8,true);
  for(let i=0;i<4;i++)roomMug29(-6.3+i*.72,1.47,-4.3);
  roomFire29(8,-7.6);roomBanner29(3.5,-8.85,'#813f3c');
  roomBox29(9.6,.75,-1.1,3.9,1.5,1.1,'panel29','#d2aa74');obstacle(9.6,-1.1,4,1.2,'sideboard');
  for(let i=0;i<5;i++)roomBottle29(8.1+i*.62,1.52,-1.1,i,.95);roomPlant29(10.9,1.52,-1.1,.9);
  roomBox29(9.5,.9,-.49,2,1.3,.035,'rug29','#dcc3a0');
  roomRug29(-5.9,1.8,6.2,4.5);roomRug29(2.4,2.3,5.9,4.4,Math.PI/2);
  roomTable29(-5.8,1.7,1.25);roomTable29(2.4,2.1,1.25);
  for(const[x,z]of[[6,-5],[10.5,-4.4]])roomChairFacing29(x,z,8,-7.6);
  for(const x of[-10.6,-9.5])barrel(x,-6.5);roomPlant29(-10.4,1.4,-6.5,.75,true);
  createInteraction('inn',-4.5,-5.8,'Rest at the inn',id==='highmereInn'?'capital-inn':'innkeeper');
  createInteraction('sleep',5.4,3.6,'Rest by the hearth until morning');
 }else if(shop){
  for(const x of[-7.5,0,7.5])stockedShelf29(x,-8.2,4.1,x===0,37+x);
  roomBox29(0,.85,-3.4,14,1.7,1.5,'panel29','#dfb77f');roomBox29(0,1.78,-3.4,14.5,.16,1.8,'wood','#e4c291');obstacle(0,-3.4,14,1.8,'shop counter');
  for(const x of[-7.1,7.1]){roomBox29(x,.85,-1.9,1.25,1.7,3.9,'panel29','#d1a66e');roomBox29(x,1.78,-1.9,1.55,.16,4.2,'wood','#dec08a');obstacle(x,-1.9,1.4,4,'counter return');}
  for(const x of[-5.2,5.2]){roomCandle(x,1.92,-3.5);roomPlant29(x,1.92,-1,.9,true);}
  roomRug29(0,1.3,8.2,4.7);roomPainting29(0,5.5,-8.9,4.2,1.5);
  for(const x of[-10,10]){roomCrate(x,2.6,1.2);roomCrate(x,4,1);barrel(x,-5.5);}
  for(let i=0;i<4;i++){const x=-3+i*1.9;roomBox29(x,1.9,-3.45,.08,.08,.85,'metal','#dcccad');roomBox29(x,1.9,-2.99,.5,.06,.1,'metal','#caa163');}
  if(spec.category==='equipment')for(let i=0;i<7;i++){const x=-5.8+i*1.85;roomBox29(x,5.05,-8.62,.1,1.6,.09,'metal','#bfc6ba');roomBox29(x,4.5,-8.56,.55,.09,.13,'metal','#ceb276');roomBox29(x,4.2,-8.55,.11,.5,.12,'darkWood','#8e6749');}
  createInteraction('shop',0,-5,'Browse equipment and provisions',({brookShop:'merchant',highmereShop:'capital-stall',fernShop:'fern-hunter',alderShop:'alder-market'})[id]);
  createInteraction('villager',5,-5.3,id==='fernShop'?'Talk to the potter':'Talk to the apprentice',({brookShop:'worker',highmereShop:'capital-post',fernShop:'fern-potter',alderShop:'alder-orchard'})[id]);
 }else if(archive){
  for(const x of[-8,-3.5,3.5,8])stockedShelf29(x,-8.25,3.7,true,60+x);
  for(const x of[-10.5,10.5])for(const z of[-3.5,1.7]){stockedShelf29(x,z,2.3,true,90+z);obstacle(x,z,2.5,1.3,'bookcase');}
  roomBox29(0,.8,-3,8,1.6,2,'panel29','#c3a36e');roomBox29(0,1.66,-3,8.3,.18,2.2,'wood','#dfc18d');obstacle(0,-3,8.3,2.2,'archive desk');
  for(const x of[-2.7,2.7])roomCandle(x,1.8,-3);roomBox29(0,1.78,-3,2,.03,1.3,'landscape29','#e6d3aa');
  roomRug29(0,2,7,5);roomTable29(3.2,2.3,1.2);roomPlant29(-6,.1,4,1.5);
  createInteraction('archivist',0,-5.3,'Speak with the archivist','courier');createInteraction('records',2,-1.6,'Read the connected records');
 }else{
  roomRug29(0,-.5,17,7.2);roomBox29(0,.65,-4,14,1.3,2.6,'panel29','#d7b67c');roomBox29(0,1.4,-4,14.6,.18,2.9,'wood','#e0c291');obstacle(0,-4,14.6,3,'council table');
  for(const x of[-5,0,5]){roomCandle(x,1.54,-4);if(x)roomChairFacing29(x,-6.2,x,-4);}for(const x of[-9,9]){roomBanner29(x,-8.85);roomPlant29(x,0,-6.3,1.8);}
  roomPainting29(0,4.7,-8.85,5,2.5);createInteraction('council',0,-6.2,'Present your findings','elder');
 }
}
buildJourneyInterior=function(id,spawn){
 resetJourneyWorld(id);const spec=INTERIORS[id];state.interiorReturn??={id:POIS[spec.poi].id,poi:spec.poi,spawn:POIS[spec.poi].spawn};state.poi=spec.poi;world.userData.interior=spec.type;world.userData.rooms29={type:spec.type};
 const floor=roomBox29(0,-.16,0,25,.3,19,spec.type==='shop'?'interiorFloor':'wood','#e0bc8b');floor.castShadow=false;floor.userData.terrain=true;world.userData.terrain=floor;world.userData.walkSurfaces=[floor];
 roomBox29(0,4.4,-9.3,25,8.8,.55,'panel29','#a79d8d');for(const x of[-12.3,12.3])roomBox29(x,4.4,-.5,.45,8.8,18,'panel29','#a1988b');
 for(let x=-12;x<=12;x+=3){roomBox29(x,3.4,-8.95,.23,6.8,.27,'darkWood','#c39b64');roomBox29(x,6.65,-9.1,3.2,.25,.75,'wood','#d3aa70');}
 for(const y of[.22,1.12,5.9])roomBox29(0,y,-8.94,25,.18,.19,'wood','#caa570');
 for(const x of[-12,12])for(let z=-8;z<=8;z+=3.2)roomBox29(x,3.4,z,.32,6.8,.23,'darkWood','#bb9463');
 for(const x of[-11.97,11.97])for(const z of[-4,3.8]){roomBox29(x,3.5,z,.2,2.2,1.6,'window','#bcbaa0',{emissive:'#ffc07b',emissiveIntensity:.12});roomBox29(x,2.3,z,.5,.2,2,'wood','#d5ae71');}
 obstacle(0,-9.3,25,.7,'interior wall');for(const x of[-12.3,12.3])obstacle(x,-.5,.7,18,'interior wall');
 buildRoomFixtures29(spec,id);
 for(const o of interactables){if(id==='aidOffice'&&o.type==='council')o.label='Deliver your report';if(id==='brookForge'&&o.type==='shop')o.label='Browse weapons and armor';if(['shop','inn','archivist','council'].includes(o.type))o.radius=o.type==='council'?4.6:o.type==='archivist'?4.2:3.7;if(o.actor){o.actor.scripted=true;o.actor.face='south';o.actor.home={x:o.actor.x,z:o.actor.z};o.actor.action='idle';npcs.push(o.actor);}}
 createInteraction('interiorExit',0,8,'Return outside');Object.assign(interactables.at(-1),{radius:2.3,visualHeight:.2});
 const fixtures=new THREE.Group(),dynamic=new Set(actors.flatMap(a=>[a.mesh,a.shadow]));fixtures.userData.center=V3();fixtures.userData.chunk=true;world.add(fixtures);
 for(const o of [...world.children])if((o.isMesh||o.userData.interiorFixture29)&&!dynamic.has(o)&&o!==floor&&!o.userData.dynamicFX&&!world.userData.candles?.some(c=>c.mesh===o))fixtures.attach(o);
 mergeGroup(fixtures);world.userData.staticChunks=[fixtures];world.userData.lampSources=[];const old=[];world.traverse(o=>{if(o.isPointLight){world.userData.lampSources.push(o.position.clone());old.push(o);}});for(const l of old)l.removeFromParent();
 world.userData.lanterns=[];for(let i=0;i<6;i++){const l=new THREE.PointLight('#ffd1a0',18,18,2);world.add(l);world.userData.lanterns.push(l);}
 sceneBuildFilter=false;finishJourneyWorld(spawn??[0,5]);scene.background.set('#100d0c');scene.fog.near=70;scene.fog.far=160;rooms29.built++;
};
const cameraBefore29=updateCamera;
updateCamera=function(dt,instant=false){
 if(activeScene?.kind!=='interior'||battle||restoration||!player)return cameraBefore29(dt,instant);
 const narrow=clamp((1.4-camera.aspect)/.6,0,1),look=V3(clamp(player.x*mix(.28,1,narrow),-mix(2,8.5,narrow),mix(2,8.5,narrow)),1.55,clamp(-3+player.z*.3,-4.2,-.5)),offset=V3(0,10.8,23.2).multiplyScalar(state.settings.zoom??1);
 cameraTarget.lerp(look,instant?1:1-Math.exp(-dt*6));camera.position.copy(cameraTarget).add(offset);camera.fov=38;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);
 for(const a of actors){a.mesh.quaternion.copy(camera.quaternion);a.shadow.visible=a.mesh.visible;}sideCameraStats.angle=Math.atan2(offset.y,offset.z)*180/Math.PI;
};
const lightBefore29=updateLighting;
updateLighting=function(){
 lightBefore29();if(!world||!player||activeScene?.kind!=='interior')return;
 sun.color.set('#ffdaad');sun.intensity=1.65;sun.position.set(-9,19,8);sun.target.position.set(0,0,-3);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);
 hemi.color.set('#e9d9bf');hemi.groundColor.set('#7f5941');hemi.intensity=1.1;if(skyBounce17){skyBounce17.color.set('#ffd4a0');skyBounce17.intensity=.65;}
 renderer.toneMappingExposure=1.2;sceneryLight.direction.value.copy(sun.position).sub(sun.target.position).normalize();weather.sun.value.copy(sceneryLight.direction.value);sceneryLight.shadowStrength.value=.32;
 const sources=world.userData.lampSources??[],anchors=[V3(-6,3,-4.1),V3(1,3,2),world.userData.roomHearth29??V3(8,3,-4),V3(-9,3,3)];
 world.userData.lanterns.forEach((l,i)=>{if((l.userData.effectUntil??0)>clock)return;l.position.copy(anchors[i]??sources[(i*3)%Math.max(1,sources.length)]??anchors[0]);l.color.set(i===2?'#ffad61':'#ffd4a1');l.intensity=(i===2?24:17)*(1+Math.sin(clock*2.7+i)*.025);l.distance=18;l.decay=2;});
};
const fxBefore29=updateWorldFX;
updateWorldFX=function(dt){fxBefore29(dt);const f=world?.userData.roomFlame29;if(f)f.material.uniforms.time.value=clock;};
