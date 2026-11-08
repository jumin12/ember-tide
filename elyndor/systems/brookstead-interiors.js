// Authored, navigable cutaway rooms. The footprint and fixtures stay
// identical through the solar cycle; daylight and practical lights do the work.
const brookRooms66=new Set(Object.keys(INTERIORS));
// Reading a record must keep the full authored passage. The ambient chatter
// shortcut otherwise reduces it to one bubble and immediately advances it.
const recordDialogueBefore67=startDialogue;
startDialogue=function(...args){if(activeScene?.key!=='archives'||ambientSpeaker?.type!=='records')return recordDialogueBefore67(...args);const speaker=ambientSpeaker;ambientSpeaker=null;try{return recordDialogueBefore67(...args)}finally{ambientSpeaker=speaker}};
const interior66={day:{value:1},time:{value:0},built:0};
let roomSupportCapture66=false;
function captureRoomProp66(name,x,y,z,build){
 const start=world.children.length,result=build(),nodes=world.children.slice(start);if(!roomSupportCapture66)return result;
 for(const o of nodes)o.userData.roomProp66=true;world.userData.supportedProps66??=[];world.userData.supportedProps66.push({name,x,y,z,nodes});return result;
}
const bottleSupportBefore66=roomBottle29,mugSupportBefore66=roomMug29,booksSupportBefore66=roomBooks29,plantSupportBefore66=roomPlant29;
roomBottle29=function(x,y,z,...args){return captureRoomProp66('bottle',x,y,z,()=>bottleSupportBefore66(x,y,z,...args));};
roomMug29=function(x,y,z,...args){return captureRoomProp66('mug',x,y,z,()=>mugSupportBefore66(x,y,z,...args));};
roomBooks29=function(x,y,z,...args){return captureRoomProp66('books',x,y,z,()=>booksSupportBefore66(x,y,z,...args));};
roomPlant29=function(x,y,z,s=1,flowers=false){if(!roomSupportCapture66)return plantSupportBefore66(x,y,z,s,flowers);return captureRoomProp66('potted plant',x,y,z,()=>{
 const pot=mesh(geo16('room66-clay-pot',()=>new THREE.LatheGeometry([[.14,0],[.20,.04],[.24,.32],[.26,.36],[.23,.39]].map(([r,y])=>new THREE.Vector2(r,y)),12)),roomMaterial29('terracotta86','#ffffff'),x,y,z);pot.scale.setScalar(s);
 mesh(geo16('room66-soil',()=>new THREE.CircleGeometry(.22,12)),roomMaterial29('earth','#514a36'),x,y+.36*s,z).rotation.x=-Math.PI/2;
 const leafKey='room66-living-leaves';let leaf=matCache.get(leafKey);if(!leaf){leaf=new THREE.MeshStandardMaterial({map:textures.leafOak30,alphaTest:.35,side:THREE.DoubleSide,roughness:.96,color:'#c1cfaa',emissive:'#2c4427',emissiveMap:textures.leafOak30,emissiveIntensity:.11});matCache.set(leafKey,leaf);}
 for(let i=0;i<5;i++){const a=i*2.399963,xx=x+Math.cos(a)*.17*s,zz=z+Math.sin(a)*.17*s,h=(.50+(i%3)*.1)*s;roomPart66('Potted plant stem',xx,y+.32*s+h*.4,zz,.017*s,h*.8,.017*s,'bark','#6e8051');const crown=mesh(branchSpray66(10),leaf,xx,y+.38*s+h,zz);crown.scale.set(.25*s,.30*s,.27*s);crown.rotation.y=a;}
 });};
roomBottle29=function(x,y,z,k=0,s=1){return captureRoomProp66('glass bottle',x,y,z,()=>{const id='glass-bottle67-'+k;let m=matCache.get(id);if(!m){m=new THREE.MeshPhysicalMaterial({color:['#527d77','#81966e','#ad8a56','#697c96','#c2b899'][k%5],roughness:.20,metalness:0,clearcoat:.65,clearcoatRoughness:.15,transparent:true,opacity:.95});m.userData.surface67='glass67';matCache.set(id,m);}mesh(geo16('glass-bottle-body67',()=>new THREE.CylinderGeometry(.11,.16,.4,10)),m,x,y+.2*s,z).scale.setScalar(s);mesh(geo16('glass-bottle-neck67',()=>new THREE.CylinderGeometry(.055,.085,.2,8)),m,x,y+.49*s,z).scale.setScalar(s);roomPart66('Bottle cork',x,y+.60*s,z,.10*s,.08*s,.10*s,'wood','#a58a69');});};
const roomPaintingBefore67=roomPainting29;
roomPainting29=function(...args){if(roomSupportCapture66&&args[2]<-8)return;return roomPaintingBefore67(...args);};
function checkRoomSupports66(){
 world.updateMatrixWorld(true);const supports=world.children.filter(o=>o.isMesh&&!o.userData.roomProp66&&!o.userData.dynamicFX&&!actors.some(a=>a.mesh===o||a.shadow===o));
 const ray=new THREE.Raycaster(),rows=[];ray.ray.direction.set(0,-1,0);
 for(const prop of world.userData.supportedProps66??[]){ray.ray.origin.set(prop.x,prop.y+.025,prop.z);ray.near=0;ray.far=1;const hits=ray.intersectObjects(supports,false),hit=hits[0];rows.push({name:prop.name,x:prop.x,y:prop.y,z:prop.z,gap:hit?prop.y-hit.point.y:null,supported:!!hit&&Math.abs(prop.y-hit.point.y)<.075});}
 world.userData.propSupports66=rows;return rows;
}
// Keep the original PixelLab grain and rug weaving, with a restrained walnut
// and indigo palette. This material pass changes no source image pixels.
const roomMaterialBefore66=roomMaterial29;
roomMaterial29=function(key,color,opts={}){
 const m=roomMaterialBefore66(key,color,opts);
 if(!['panel29','rug29'].includes(key)||m.userData.room66)return m;
 m.userData.room66=true;const before=m.onBeforeCompile,cache=m.customProgramCacheKey();
 m.onBeforeCompile=s=>{before(s);s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float value66=dot(diffuseColor.rgb,vec3(.25,.55,.20));
 ${key==='panel29'?'diffuseColor.rgb=vec3(1.04,.86,.65)*(.12+value66*.62);':'diffuseColor.rgb=mix(vec3(.025,.070,.10),vec3(.70,.52,.27),smoothstep(.14,.64,value66));'}
 `);};m.customProgramCacheKey=()=>cache+'-room66-'+key;return m;
};
function roomPart66(name,x,y,z,w,h,d,key='wood',color='#c8b28b'){
 const o=roomBox29(x,y,z,w,h,d,key,color);o.name=name;return o;
}
function windowedSideWall66(x,windows,key,color){
 let from=-7.95;for(const z of windows){const left=z-.85,right=z+.85;if(left>from)roomPart66('Solid cutaway wall pier',x,3.8,(from+left)/2,.4,7.6,left-from,key,color);roomPart66('Wall below open window',x,1.14,z,.4,2.28,1.7,key,color);roomPart66('Wall above open window',x,6.16,z,.4,2.88,1.7,key,color);from=right;}if(from<7.55)roomPart66('Solid cutaway wall pier',x,3.8,(from+7.55)/2,.4,7.6,7.55-from,key,color);
}
function backWall67(key,door){
 const holes=[{x:-3.8,y:6.5,w:1.28,h:1.08},{x:3.8,y:6.5,w:1.28,h:1.08},...(door?[{x:0,y:2.3,w:2.5,h:4.6}]:[])],xs=[-10.5,10.5,...holes.flatMap(q=>[q.x-q.w/2,q.x+q.w/2])].sort((a,b)=>a-b),ys=[0,7.6,...holes.flatMap(q=>[q.y-q.h/2,q.y+q.h/2])].sort((a,b)=>a-b);
 for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){const x=(xs[i]+xs[i-1])/2,y=(ys[j]+ys[j-1])/2,w=xs[i]-xs[i-1],h=ys[j]-ys[j-1];if(w<.001||h<.001||holes.some(q=>Math.abs(x-q.x)<q.w/2&&Math.abs(y-q.y)<q.h/2))continue;roomPart66('Solid back wall around opening',x,y,-7.9,w,h,.45,key,'#b5ad99');}
 world.userData.wallOpenings67=holes;
}
function backRail67(name,y,h,key,color,door){if(door&&y<4.7)for(const side of[-1,1])roomPart66(name,side*5.875,y,-7.57,9.25,h,.18,key,color);else roomPart66(name,0,y,-7.57,21,h,.18,key,color);}
function roomBag66(x,y,z,s=1,color='#aa926d'){
 const start=world.children.length;
 const m=roomMaterial29('canvas86',color),bag=mesh(geo16('room66-seated-sack',()=>new THREE.LatheGeometry([[.22,.01],[.30,.07],[.35,.28],[.32,.54],[.22,.70],[.095,.78],[.13,.9],[.065,.95]].map(([r,y])=>new THREE.Vector2(r,y)),12)),m,x,y,z);bag.scale.set(s,s,s*.88);bag.name='Grounded tied provision sack';
 mesh(geo16('room66-tie',()=>new THREE.TorusGeometry(.10,.018,4,12)),roomMaterial29('wood','#86704c'),x,y+.78*s,z).rotation.x=Math.PI/2;
 if(roomSupportCapture66){const nodes=world.children.slice(start);nodes.forEach(o=>o.userData.roomProp66=true);(world.userData.supportedProps66??=[]).push({name:'sack',x,y,z,nodes});}
}
function roomRoll66(x,y,z,s=1,color='#899281'){
 const start=world.children.length;
 const o=mesh(geo16('room66-roll',()=>new THREE.CylinderGeometry(.20,.20,1,10)),roomMaterial29('wool86',color),x,y+.21*s,z);o.rotation.z=Math.PI/2;o.scale.setScalar(s);o.name='Rolled travelling blanket';
 for(const dx of[-.27,.27]){const t=mesh(geo16('room66-roll-tie',()=>new THREE.TorusGeometry(.205,.016,4,12)),roomMaterial29('wood','#826f50'),x+dx*s,y+.21*s,z);t.rotation.y=Math.PI/2;t.scale.setScalar(s);}
 if(roomSupportCapture66){const nodes=world.children.slice(start);nodes.forEach(o=>o.userData.roomProp66=true);(world.userData.supportedProps66??=[]).push({name:'cloth roll',x,y,z,nodes});}
}
function stockedRoomShelf66(x,z,w=3.5,seed=1){
 for(const dx of[-w/2,w/2])roomPart66('Shelf upright',x+dx,2.1,z,.13,4.2,.53,'darkWood','#99836c');
 roomPart66('Recessed shelf back',x,2.1,z-.22,w,4.1,.10,'panel29','#a18a6c');
 for(let row=0;row<4;row++){const y=.30+row*1.05;roomPart66('Stocked timber shelf',x,y,z,w+.12,.11,.8,'wood','#beaa87');
  for(let i=0;i<Math.max(4,Math.floor(w*2.1));i++){const count=Math.max(4,Math.floor(w*2.1)),xx=x-w*.43+i*w*.86/(count-1),k=(i+row+seed)%4;if(k===0)roomBag66(xx,y+.055,z,.48,'#bcae83');else if(k===1)roomRoll66(xx,y+.055,z,.42,'#7e8d87');else if(k===2)roomBottle29(xx,y+.055,z,seed%5,.8);else roomPart66('Packed shelf provisions',xx,y+.24,z,.31,.36,.35,'crateFace','#b09a76');}
 }
}
function weaponRack66(x,z,w=4.4){
 roomPart66('Weapon display backing',x,3.15,z,w,3.8,.18,'darkWood','#8b7d68');
 for(const y of[1.5,4.9])roomPart66('Weapon rack crossbar',x,y,z+.13,w+.15,.13,.18,'wood','#c1a579');
 const bladeGeometry=geo16('tapered-sword67',()=>{const shape=new THREE.Shape();shape.moveTo(-.105,0);shape.lineTo(.105,0);shape.lineTo(.075,1.55);shape.lineTo(0,1.85);shape.lineTo(-.075,1.55);shape.closePath();return new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelThickness:.018,bevelSize:.025,bevelSegments:1,steps:1});});
 for(let i=0;i<4;i++){
  const xx=x-w*.32+i*w*.64/3,g=new THREE.Group();g.position.set(xx,2.55,z+.29);g.rotation.z=(i%2?1:-1)*.025;g.name='Complete forged sword';g.userData.interiorFixture29=true;world.add(g);
  const blade=new THREE.Mesh(bladeGeometry,roomMaterial29('metal','#c5cdd0',{metalness:.88,roughness:.28}));blade.castShadow=blade.receiveShadow=true;g.add(blade);
  for(const[name,y,ww,hh,key,color]of[['Sword crossguard',0,.54,.10,'metal','#b8a37b'],['Leather-bound sword grip',-.30,.12,.49,'darkWood','#665042'],['Sword pommel',-.59,.22,.15,'metal','#b5a17d']]){const o=roomPart66(name,0,y,.03,ww,hh,.13,key,color);g.add(o);}
  roomPart66('Sword display support hook',xx,2.48,z+.24,.64,.065,.34,'metal','#9a947c');
 }
 world.userData.weaponRack67={x,z,width:w,swords:4,completeAssemblies:true};
}
function forgeTool66(x,y,z,angle=0){
 const ray=new THREE.Raycaster(V3(x,y+.04,z),V3(0,-1,0),0,.18),hit=ray.intersectObjects(world.children.filter(o=>o.isMesh&&!o.userData.roomProp66),false)[0];y=hit?.point.y??y;
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;g.name='Complete forged smith hammer';g.userData.interiorFixture29=true;world.add(g);
 const part=(geometry,material,name,position)=>{const o=new THREE.Mesh(geometry,material);o.name=name;o.position.copy(position);o.castShadow=o.receiveShadow=true;g.add(o);return o},steel=roomMaterial29('metal','#9ca9b1',{metalness:.88,roughness:.34});
 const head=geo16('rounded-hammer-head67',()=>{const s=new THREE.Shape(),w=.28,h=.13,r=.045;s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);const geo=new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:false,curveSegments:3});geo.translate(0,0,-.11);return geo});part(head,steel,'Forged hammer head',V3(0,.13,-.34));
 for(const side of[-1,1])part(geo16('hammer-face67',()=>new THREE.BoxGeometry(.025,.21,.18)),roomMaterial29('metal','#c4cdd2',{metalness:.88,roughness:.26}),'Striking face',V3(side*.282,.13,-.34));
 const a=V3(0,.075,.49),b=V3(0,.13,-.34),delta=b.clone().sub(a),handle=part(geo16('hammer-ash-handle67',()=>new THREE.CylinderGeometry(.055,.065,1,10)),roomMaterial29('wood','#b49a71'),'Ash hammer handle',a.clone().add(b).multiplyScalar(.5));handle.scale.y=delta.length();handle.quaternion.setFromUnitVectors(V3(0,1,0),delta.clone().normalize());
 for(let i=0;i<5;i++){const t=.07+i*.045,p=a.clone().lerp(b,t),ring=part(geo16('hammer-grip67',()=>new THREE.TorusGeometry(.065,.009,4,10)),roomMaterial29('leather86','#ffffff'),'Bound leather grip',p);ring.quaternion.setFromUnitVectors(V3(0,0,1),delta.clone().normalize());}
 const collar=part(geo16('hammer-collar67',()=>new THREE.CylinderGeometry(.080,.080,.06,10)),steel,'Head socket ferrule',V3(0,.123,-.19));collar.quaternion.copy(handle.quaternion);g.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(g);
 (world.userData.hammers67??=[]).push({x,y,z,angle,bottom:bounds.min.y,parts:g.children.length,complete:true});if(roomSupportCapture66){g.userData.roomProp66=true;(world.userData.supportedProps66??=[]).push({name:'seated smith hammer',x,y,z,nodes:[g]});}
}
function anvil67(x,z){
 const start=world.children.length,metal=roomMaterial29('metal','#71808a',{metalness:.88,roughness:.38}),face=roomMaterial29('metal','#b6c2c9',{metalness:.9,roughness:.25});
 const stump=mesh(geo16('anvil-stump67',()=>new THREE.CylinderGeometry(.66,.73,.88,14)),roomMaterial29('bark','#8b785c'),x,.44,z);stump.name='Solid oak anvil stump';for(const y of[.14,.75]){const hoop=mesh(geo16('stump-hoop67',()=>new THREE.CylinderGeometry(.685,.685,.07,14,1,true)),metal,x,y,z);hoop.name='Stump iron hoop';}
 const body=geo16('forged-anvil-body67',()=>{const s=new THREE.Shape();s.moveTo(-.64,.02);s.lineTo(.60,.02);s.lineTo(.60,.14);s.quadraticCurveTo(.22,.19,.22,.32);s.quadraticCurveTo(.25,.46,.70,.50);s.lineTo(.70,.65);s.lineTo(-.72,.65);s.lineTo(-.72,.51);s.quadraticCurveTo(-.27,.44,-.27,.31);s.quadraticCurveTo(-.29,.20,-.64,.14);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.65,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:2,curveSegments:6});g.translate(0,0,-.325);return g});mesh(body,metal,x,.88,z).name='Forged anvil waist and feet';
 const plate=geo16('anvil-face67',()=>{const s=new THREE.Shape();s.moveTo(-.95,-.35);s.lineTo(.70,-.35);s.lineTo(.70,.35);s.lineTo(-.95,.35);s.closePath();const hole=new THREE.Path();hole.moveTo(-.84,-.02);hole.lineTo(-.84,.12);hole.lineTo(-.70,.12);hole.lineTo(-.70,-.02);hole.closePath();s.holes.push(hole);const g=new THREE.ExtrudeGeometry(s,{depth:.06,bevelEnabled:false});g.rotateX(-Math.PI/2);return g});mesh(plate,face,x,1.56,z).name='Flat striking face with hardy hole';roomPart66('Anvil heel',x-.79,1.40,z,.31,.30,.63,'metal','#78868e');roomPart66('Recess beneath hardy hole',x-.77,1.552,z-.05,.14,.012,.14,'darkWood','#1f292e');
 const horn=geo16('rounded-anvil-horn67',()=>{const p=[],uv=[],indices=[],rows=12,sides=14;for(let i=0;i<=rows;i++){const t=i/rows,r=Math.pow(1-t,.80);for(let j=0;j<=sides;j++){const a=j/sides*TAU;p.push(.65+t*1.12,.50+t*.04+Math.sin(a)*Math.max(.003,r*.24),Math.cos(a)*Math.max(.003,r*.31));uv.push(t,j/sides);if(i<rows&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g});mesh(horn,face,x,.88,z).name='Smoothly tapered anvil horn';
 obstacle(x+.35,z,2.95,1.55,'anvil and stump');world.userData.anvil67={x,z,base:0,face:1.62,horn:'rounded tapered',hardyHole:true,stumpTop:.88};
}
function roomLantern66(x,y,z){
 const start=world.children.length;
 const brass=roomMaterial29('metal','#917044',{metalness:.65,roughness:.38}),glass=roomMaterial29('plaster','#ffe9b8',{emissive:'#ffbc62',emissiveIntensity:1.4});
 const body=mesh(geo16('room66-lantern',()=>new THREE.CylinderGeometry(.17,.2,.52,6)),glass,x,y+.3,z);body.name='Amber glass lantern';body.userData.dynamicFX=true;
 for(const yy of[y,y+.60]){const cap=mesh(geo16('room66-lantern-cap',()=>new THREE.CylinderGeometry(.27,.24,.10,6)),brass,x,yy,z);cap.name='Lantern brass cap';}
 for(let i=0;i<4;i++){const a=i*Math.PI/2;roomPart66('Lantern metal frame',x+Math.cos(a)*.16,y+.3,z+Math.sin(a)*.16,.028,.6,.028,'metal','#7b684e');}
 const loop=mesh(geo16('room66-loop',()=>new THREE.TorusGeometry(.12,.022,5,12)),brass,x,y+.78,z);loop.name='Lantern hanging loop';
 if(roomSupportCapture66&&y<3){const nodes=world.children.slice(start);nodes.forEach(o=>o.userData.roomProp66=true);(world.userData.supportedProps66??=[]).push({name:'standing lantern',x,y,z,nodes});}
}
function ropeCoil66(x,y,z,s=1,vertical=false){
 const start=world.children.length;
 const m=roomMaterial29('canvas86','#c7bba1');for(let i=0;i<5;i++){const o=mesh(geo16('room66-rope-'+i,()=>new THREE.TorusGeometry(.28+i*.045,.028,5,24)),m,x,y+.04+i*.025,z);o.scale.setScalar(s);o.rotation.x=vertical?0:Math.PI/2;}
 if(roomSupportCapture66&&!vertical){const nodes=world.children.slice(start);nodes.forEach(o=>o.userData.roomProp66=true);(world.userData.supportedProps66??=[]).push({name:'rope coil on crate',x,y,z,nodes});}
}
function armorStand66(x,z){
 roomPart66('Armor oak plinth',x,.10,z,1.05,.20,.88,'darkWood','#b09b7b');roomPart66('Armor display post',x,1.69,z,.10,3.18,.10,'wood','#bca179');roomPart66('Shoulder support',x,2.48,z,.92,.10,.13,'darkWood','#a79173');
 const steel=roomMaterial29('metal','#c3ccd1',{metalness:.9,roughness:.29}),trim=roomMaterial29('metal','#ad9162',{metalness:.82,roughness:.34});
 const chest=mesh(geo16('cuirass67',()=>new THREE.LatheGeometry([[.24,-.58],[.25,-.32],[.37,.12],[.42,.36],[.33,.55],[.20,.65]].map(([r,y])=>new THREE.Vector2(r,y)),16)),steel,x,2.10,z);chest.scale.z=.63;chest.name='Shaped steel cuirass';
 for(let i=0;i<3;i++){const skirt=mesh(geo16('fauld67-'+i,()=>new THREE.CylinderGeometry(.26+i*.035,.30+i*.035,.13,12,1,true)),steel,x,1.55-i*.12,z);skirt.scale.z=.65;skirt.name='Overlapping fauld plate';}
 for(const side of[-1,1]){const g=geo16('pauldron67',()=>{const g=new THREE.SphereGeometry(.31,10,5,0,Math.PI*2,0,Math.PI*.53);g.scale(1,.75,.85);return g;});const p=mesh(g,steel,x+side*.47,2.45,z);p.rotation.z=side*.33;p.name='Shoulder plate';roomPart66('Pauldron leather strap',x+side*.45,2.30,z+.17,.10,.30,.06,'darkWood','#6d5341');}
 mesh(geo16('gorget67',()=>new THREE.CylinderGeometry(.18,.24,.18,12)),steel,x,2.83,z);
 const helm=mesh(geo16('armet67',()=>new THREE.LatheGeometry([[.24,0],[.27,.16],[.27,.34],[.22,.49],[.08,.59],[0,.60]].map(([r,y])=>new THREE.Vector2(r,y)),16)),steel,x,2.92,z);helm.scale.z=.87;helm.name='Forged armet helmet';
 roomPart66('Recessed helmet eye slit',x,3.18,z+.232,.37,.055,.025,'darkWood','#17232b');roomPart66('Helmet nose guard',x,3.10,z+.257,.045,.26,.04,'metal','#bac5ca');
 for(const side of[-1,1])roomPart66('Helmet cheek plate',x+side*.17,3.04,z+.21,.13,.25,.07,'metal','#c3ccd1');
 for(const y of[1.67,2.63]){const band=mesh(geo16('cuirass-trim67-'+y,()=>new THREE.TorusGeometry(y<2?.26:.23,.018,4,16)),trim,x,y,z);band.rotation.x=Math.PI/2;band.scale.y=.65;}
 roomPart66('Blue cloth under armor',x,1.15,z-.01,.50,.55,.14,'cloth','#385776');
 world.userData.armorDisplays67??=[];world.userData.armorDisplays67.push({x,z,parts:18,cuirass:'shaped shell',helmet:'armet',floor:0});
 obstacle(x,z,1.35,1.05,'armor display plinth');
}
function enrichRoom66(id){
 const type=INTERIORS[id].type;
 // The wall silhouette is a cutaway: all rails and braces terminate at the
 // wall. No roof members cross the playable room or the camera's sightline.
 for(const side of[-1,1])for(const z of[-6,-2,2,6])roomPart66('Wall oak pilaster',side*10.02,3.65,z,.23,7.3,.22,'darkWood','#9d8c73');
 for(const x of[-8.4,-4.8,4.8,8.9]){const y=type==='inn'?6.05:5.20;roomPart66('Brass lantern wall bracket',x,y+.65,-7.42,.10,.14,.62,'metal','#9b8159');roomLantern66(x,y,-7.02);}
 for(const x of[-9.5,9.5]){roomPlant29(x,0,5.5,1.35,true);roomPart66('Wall planter shelf',Math.sign(x)*9.65,5.48,-1.3,1.2,.14,1,'wood','#a59377');roomPart66('Planter shelf wall bracket',Math.sign(x)*10.02,5.26,-1.3,.38,.45,.5,'wood','#a59377');roomPlant29(x,5.55,-1.3,1.0);}
 const counters=type==='inn'?[[-5.1,-4.9,8.5,1.36]]:id==='brookForge'?[[.2,-5,4.5,1.5]]:type==='shop'?[[-4.8,-4.2,7,1.46]]:[];
 for(const[x,z,w,h]of counters){const front=z+.74;for(const y of[.14,h-.11])roomPart66('Counter framed rail',x,y,front,w+.1,.13,.13,'darkWood','#a5906e');for(let i=0;i<5;i++)roomPart66('Counter panel stile',x-w*.48+i*w*.24,h*.5,front,.11,h-.2,.14,'wood','#ae9a79');}
 if(type==='inn'){
  roomBanner29(2.5,-7.48,'#723f45');stockedRoomShelf66(8.9,-2.8,1.8,7);obstacle(8.9,-2.8,2,1,'hearth dresser');
  roomPart66('Sideboard',8.7,.63,.9,2.2,1.26,1.1,'panel29','#b7a184');roomPart66('Sideboard top',8.7,1.32,.9,2.45,.14,1.25,'wood','#c6ae87');obstacle(8.7,.9,2.4,1.3,'sideboard');
  for(const x of[8,8.6,9.2]){roomBottle29(x,1.4,.8,0,.9);roomMug29(x,1.4,1.15);}roomLantern66(8.7,1.42,1.35);
  for(const [x,z]of[[-9,2],[-9,3.1]])roomCrate(x,z,.8);
  roomLantern66(-1.6,1.50,-4.8);roomPart66('Cloak wall peg',9.98,3.48,5,.65,.12,.12,'wood','#957e5b');
 }else if(id==='brookForge'){
  for(const x of[2.5,4.4])armorStand66(x,1.0);
  roomRug29(3.45,1,4.3,2.2);roomPart66('Tool bench',-6.4,.75,4.8,5.4,1.5,1.55,'panel29','#a99880');roomPart66('Tool bench surface',-6.4,1.57,4.8,5.7,.15,1.75,'wood','#bbaa8c');obstacle(-6.4,4.8,5.7,1.8,'tool bench');
  for(let i=0;i<4;i++)forgeTool66(-7.9+i*.9,1.65,4.8,.9);roomLantern66(-8.7,1.65,4.9);
  for(const x of[-2.9,-2.3]){roomPart66('Forge iron poker',x,2.1,-7.25,.045,3.1,.05,'metal','#778084');roomPart66('Poker handle',x,3.6,-7.25,.16,.12,.12,'metal','#9d9276');roomPart66('Poker wall hook',x,3.55,-7.48,.24,.08,.60,'metal','#9a927a');}
  roomPart66('Bellows trestle',-9,.75,-5.1,1.4,1.5,.8,'wood','#a18a68');const bellows=roomPart66('Leather forge bellows',-9,1.8,-5.1,1.3,.68,.8,'cloth','#895741');bellows.rotation.z=-.18;
  roomPart66('Quenching tub floor',-2.5,.05,-1.4,1.4,.10,1.15,'darkWood','#8c8068');for(const side of[-1,1]){roomPart66('Quenching tub wall',-2.5+side*.64,.4,-1.4,.12,.8,1.15,'darkWood','#8c8068');roomPart66('Quenching tub wall',-2.5,.4,-1.4+side*.515,1.4,.8,.12,'darkWood','#8c8068');}const water=roomPart66('Quenching water',-2.5,.63,-1.4,1.14,.025,.88,'metal','#6a949d');water.material=new THREE.MeshPhysicalMaterial({color:'#5f8084',roughness:.22,metalness:0,clearcoat:.7});water.material.userData.surface67='glass67';water.castShadow=false;obstacle(-2.5,-1.4,1.6,1.3,'quenching tub');
  roomLantern66(2.1,1.67,-4.75);roomBooks29(-.5,1.67,-4.65,3,66);
 }else if(type==='shop'){
  // Tall travel-goods shelving frames the right aisle; low displays frame
  // the left, leaving a continuous two-person route to the service counter.
  stockedRoomShelf66(8.7,1.7,2.2,12);obstacle(8.7,1.7,2.4,1,'travel shelving');
  roomPart66('Folded cloth display',-6,.65,1.4,4.1,1.3,1.8,'panel29','#ac987a');roomPart66('Display top',-6,1.37,1.4,4.35,.14,2,'wood','#c6af89');obstacle(-6,1.4,4.4,2,'provision display');
  for(let i=0;i<4;i++){roomRoll66(-7.4+i*.85,1.46,1.1,.7,['#526a7b','#a1745c','#7a8667','#b6ae8a'][i]);roomBag66(-7.4+i*.85,1.46,1.9,.6);}
  ropeCoil66(7.7,1.06,4.7,.75);ropeCoil66(8.7,2.2,2.2,1.3,true);roomPart66('Coiled rope display peg',8.7,2.80,1.95,.10,.10,.6,'wood','#937e59');roomLantern66(-7.9,1.44,.75);
  for(const [x,z]of[[-9,-5.5],[9,-2],[7.7,4.7]]){roomCrate(x,z,1.05);roomPart66('Crate iron binding',x,.55,z+.55,1.1,.10,.05,'metal','#8f8e7a');}
  roomBanner29(2.7,-7.48,'#365875');roomLantern66(-2.1,1.61,-3.7);roomPlant29(-7.9,1.61,-4.65,.85,true);
 }
}
function buildBrookFixtures66(id){
 const spec=INTERIORS[id];
 if(spec.type==='inn'){
  stockedShelf29(-5.5,-7.25,7.6,false,66);
  roomPart66('Inn service counter',-5.1,.68,-4.9,8.5,1.36,1.4,'panel29','#b59d78');roomPart66('Polished bar top',-5.1,1.42,-4.9,8.9,.15,1.75,'wood','#c3ab85');obstacle(-5.1,-4.9,8.8,1.75,'inn counter');
  for(const x of[-8.8,-6.8,-4.8,-2.8]){roomMug29(x,1.51,-4.9);roomBottle29(x+.35,1.51,-5.15,1,.65);}roomCandle(-8.7,1.52,-4.8);roomPlant29(-1.5,1.52,-4.9,.8,true);
  roomFire29(6,-6.6);roomPainting29(6,4.7,-7.34,3.4,1.5);
  roomRug29(-4.4,1.5,5.7,4.5);roomRug29(3.8,1.8,5.2,4.8);
  roomTable29(-4.4,1.4,1.05);roomTable29(3.7,1.7,1.05);
  for(const [x,z]of[[-4.4,-.65],[-4.4,3.5],[3.7,-.4],[3.7,3.7]])roomChairFacing29(x,z,x,z<0?1:1.8);
  roomPart66('Wall bench seat',-9.3,.62,.5,.8,.18,5,'wood','#baa17c');roomPart66('Wall bench back',-9.65,1.15,.5,.12,1.05,5,'darkWood','#9e886c');for(const z of[-1.5,2.5])for(const x of[-9.55,-9.05])roomPart66('Bench support leg',x,.27,z,.12,.54,.12,'darkWood','#927b60');obstacle(-9.3,.5,1.1,5.2,'wall bench');
  roomPart66('Inn guest cloak',9.82,2.5,5,.12,2,1.25,'cloth','#77877b');roomCrate(8.7,5,.85);roomBag66(9.3,0,4.5,.95);roomRoll66(8.8,.85,5,.9,'#8f6757');
  for(const [x,z]of[[-9,-6.5],[-8.3,-6.8]])barrel(x,z);
  createInteraction('inn',1.1,-3.8,'Rest at the inn',id==='highmereInn'?'capital-inn':'innkeeper');createInteraction('sleep',6.2,-2.2,'Rest by the hearth until morning');
 }else if(id==='brookForge'){
  roomFire29(-6,-6.6);const hood=mesh(geo16('room66-forge-hood',()=>{const g=new THREE.CylinderGeometry(.9,1.95,1.8,4,1,false);g.rotateY(Math.PI/4);return g;}),roomMaterial29('metal','#626a6a'),-6,4.55,-6.7);hood.scale.z=.7;hood.name='Tapered forge hood';roomPart66('Forge chimney',-6,6.40,-7,1.8,2.4,1.1,'wall','#a19b87');
  anvil67(-4.8,-.1);
  weaponRack66(7,-7.35,4.2);
  roomPart66('Smith workbench',.2,.75,-5,4.5,1.5,1.4,'darkWood','#a08a68');roomPart66('Workbench top',.2,1.57,-5,4.9,.18,1.75,'wood','#bda580');obstacle(.2,-5,4.9,1.9,'smith counter');
  for(const [x,a]of[[-1.6,-.4],[.5,.25],[1.6,-.2]])forgeTool66(x,1.67,-5.35,a);
  for(let i=0;i<5;i++){const m=roomPart66('Stored iron billet',3+i*.53,.22,-6.15,.42,.35,.8,'metal','#7e898d');m.rotation.y=i*.13;}
  const wheel=mesh(geo16('room66-grindstone',()=>new THREE.CylinderGeometry(.75,.75,.28,20)),roomMaterial29('wall','#a9afa5'),-8.8,1.15,.8);wheel.rotation.z=Math.PI/2;wheel.name='Grindstone';for(const dx of[-.5,.5])roomPart66('Grindstone trestle leg',-8.8+dx,.56,.8,.14,1.12,1.4,'wood','#9a8366');roomPart66('Grindstone axle',-8.8,1.15,.8,1.3,.14,.14,'metal','#9aa5a4');obstacle(-8.8,.8,1.7,2,'grindstone');
  for(const [x,z]of[[-9,-3.5],[-8.2,-3.5]])barrel(x,z);roomCrate(-8.3,2.7,1.1);roomBag66(-6.5,0,2,.8,'#5e625c');
  for(let i=0;i<9;i++)mesh(geo16('room66-coal',()=>new THREE.IcosahedronGeometry(.16,0)),roomMaterial29('rock','#262b2b'),-7.5+(i%3)*.22,.28+Math.floor(i/3)*.08,-3.2+(i%2)*.2);
  createInteraction('shop',-.4,-1,'Talk to the blacksmith · weapons and armor','worker');
 }else if(spec.type==='shop'){
  for(const [x,w,seed]of[[-6,5.2,1],[.5,4,2],[6.3,3.7,3]])stockedRoomShelf66(x,-7.2,w,seed);
  roomPart66('Provision shop counter',-4.8,.73,-4.2,7,1.46,1.45,'panel29','#b9a07b');roomPart66('Counter top',-4.8,1.53,-4.2,7.4,.16,1.75,'wood','#cfb68d');obstacle(-4.8,-4.2,7.4,1.8,'supply counter');
  roomCandle(-7.5,1.63,-4.15);roomBooks29(-6.8,1.64,-4.2,5,66);roomBottle29(-2.4,1.64,-4.2,1,.8);roomPart66('Open shop ledger',-4,1.65,-4.1,1.1,.04,.8,'plaster','#d4ccaf');
  roomPart66('Travel goods display',4.7,.65,.3,3.8,1.3,2.1,'wood','#bda37f');obstacle(4.7,.3,4,2.3,'travel display');
  for(const [x,z,s]of[[3.5,-.2,.9],[5.8,.5,.75],[4.5,.5,.85]])roomBag66(x,1.30,z,s);roomRoll66(5.1,1.30,-.35,.9,'#7c8f83');
  roomRug29(-1.8,1.7,5.2,4.4);for(const [x,z,s]of[[-8.8,3.7,1.1],[-7.9,4.5,.8],[8.5,4.8,1.1]])roomCrate(x,z,s);for(const [x,z]of[[-9,-1.5],[9,-4.9]])barrel(x,z);
  roomBag66(-8.6,1.10,3.7,.8);
  createInteraction('shop',.0,-2.5,'Browse equipment and provisions','merchant');
 }else buildCivicFixtures67(id);
}
function buildCivicFixtures67(id){
 const archive=INTERIORS[id].type==='archives',aid=id==='aidOffice';
 if(archive){
  for(const x of[-7.9,-3.8,3.8,7.9]){stockedShelf29(x,-7.15,3.25,true,Math.round(x*10+200));obstacle(x,-7.15,3.5,1,'archive bookcase');}
  roomPart66('Archivist desk',0,.75,-3.6,7.4,1.5,1.6,'panel29','#a99980');roomPart66('Archive desk top',0,1.60,-3.6,7.8,.18,1.85,'wood','#c2b191');obstacle(0,-3.6,7.9,2,'archivist desk');
  roomBooks29(-3,1.70,-3.8,5,67);roomMug29(3,1.70,-3.4);roomLantern66(-3.3,1.70,-3.4);roomPart66('Open archive register',.8,1.72,-3.4,1.4,.045,.8,'plaster','#d8d1b6');
  roomRug29(0,1.8,8.2,5.5);roomTable29(-5.6,2.4,1.05);roomTable29(5.6,2.4,1.05);for(const x of[-5.6,5.6])roomChairFacing29(x,4.4,x,2.4);
  createInteraction('archivist',-.8,-1,'Speak to the archivist','courier');interactables.push({id:'records',type:'records',x:2,z:-1.4,label:'Read the network records',radius:2.2,visualHeight:1.3});roomPart66('Reading lectern foot',2,.08,-1.4,1.05,.16,.8,'darkWood','#968469');roomPart66('Reading lectern post',2,.66,-1.4,.18,1.16,.18,'wood','#b19e7c');const rest=roomPart66('Sloping lectern book rest',2,1.30,-1.4,1.4,.12,.9,'wood','#bca785');rest.rotation.x=.18;const book=roomPart66('Open network record',2,1.38,-1.4,1.16,.055,.70,'plaster','#dbd2b5');book.rotation.x=.18;
 }else{
  for(const side of[-1,1]){stockedShelf29(side*7.8,-7.15,2.6,true,side+70);obstacle(side*7.8,-7.15,2.9,1,'council records cabinet');roomBanner29(side*5.5,-7.46,aid?'#657e79':'#4a6587');}
  roomPart66(aid?'Aid officer desk':'Council conference table',0,.76,-2.9,10.3,1.52,2.35,'panel29','#ae9d7c');roomPart66('Civic table top',0,1.62,-2.9,10.7,.20,2.6,'wood','#c2ad86');obstacle(0,-2.9,10.8,2.7,'civic table');
  for(const x of[-4.2,4.2]){roomLantern66(x,1.73,-3.0);roomBooks29(x-.4,1.73,-2.5,3,69);}
  roomPart66('Council map and paperwork',0,1.74,-2.8,2.6,.035,1.6,'plaster','#d0c7a6');roomRug29(0,1.3,10.8,5.6);
  for(const x of[-3.5,0,3.5])roomChairFacing29(x,-5.2,x,-2.9);for(const x of[-3.5,3.5])roomChairFacing29(x,-.7,x,-2.9);
  createInteraction('council',0,-.3,aid?'Deliver the report':'Speak to the council','elder');
  if(aid){roomPart66('Aid parcel sorting bench',-7.4,.7,2.4,3.7,1.4,1.4,'wood','#aa9877');obstacle(-7.4,2.4,4,1.6,'parcel bench');for(const x of[-8.5,-7.4,-6.3])roomBag66(x,1.40,2.4,.8);for(const [x,z]of[[7.6,2.5],[8,4]])roomCrate(x,z,.9);}
 }
}
function buildRoomAir66(){
 const g=new THREE.BufferGeometry(),p=new Float32Array(64*3),rng=seeded(66013);for(let i=0;i<64;i++)p.set([(rng()-.5)*18,.6+rng()*5,(rng()-.5)*13],i*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,uniforms:{time:interior66.time,day:interior66.day},vertexShader:'uniform float time;varying float a;void main(){vec3 p=position;p.y+=sin(time*.21+p.x)*.24;p.x+=sin(time*.13+p.z)*.13;vec4 v=modelViewMatrix*vec4(p,1.);gl_PointSize=1.5;gl_Position=projectionMatrix*v;a=.12+.10*sin(time*.37+p.x+p.z);}',fragmentShader:'uniform float day;varying float a;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.86,.62,(1.-smoothstep(.1,.5,d))*a*(.3+day*.7));}'});
 const dust=new THREE.Points(g,m);dust.name='Slow interior dust';dust.userData.dynamicFX=true;world.add(dust);
 const shaftMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{day:interior66.day,time:interior66.time},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float day,time;void main(){float soft=sin(vUv.y*3.14159);float drift=.8+.2*sin(vUv.y*14.+vUv.x*23.+time*.12);gl_FragColor=vec4(1.,.88,.66,soft*drift*day*.018);}'});
 for(let i=0;i<3;i++){const from=V3(-9.7,4.1,-3.8+(i-1)*.40),to=V3(-1.7+i*.4,.08,1.6+(i-1)*1.2),delta=from.clone().sub(to);const shaft=new THREE.Mesh(geo16('room66-window-shaft',()=>new THREE.CylinderGeometry(.11,.62,1,10,1,true)),shaftMaterial);shaft.position.copy(from).add(to).multiplyScalar(.5);shaft.scale.y=delta.length();shaft.quaternion.setFromUnitVectors(V3(0,1,0),delta.normalize());shaft.name='Soft window daylight';shaft.userData.dynamicFX=true;world.add(shaft);}
}
const brookInteriorBefore66=buildJourneyInterior;
buildJourneyInterior=function(id,spawn){
 if(!brookRooms66.has(id))return brookInteriorBefore66(id,spawn);
 resetJourneyWorld(id);const spec=INTERIORS[id];activeScene.bounds=[-10.1,10.1,-7.65,7.65];state.interiorReturn??={id:POIS[spec.poi].id,poi:spec.poi,spawn:[...POIS[spec.poi].spawn]};state.poi=spec.poi;world.userData.interior=spec.type;
 const floor=roomPart66('Walkable room floor',0,-.16,0,21,.3,16,id==='brookForge'?'wall':'wood',id==='brookForge'?'#aaa18c':'#b7ab91');floor.castShadow=false;floor.userData.terrain=true;world.userData.terrain=floor;world.userData.walkSurfaces=[floor];
 const wallKey=spec.type==='inn'?'wood':'wall',guestDoor=spec.type==='inn';backWall67(wallKey,guestDoor);windowedSideWall66(-10.3,[-3.8,3.6],wallKey,'#b1a78f');windowedSideWall66(10.3,[2.9],wallKey,'#b1a78f');
 backRail67('Walnut wainscot',1.05,2.1,'panel29','#c9b798',guestDoor);for(const x of[-10.03,10.03])roomPart66('Side wall wainscot',x,1.05,-.2,.16,2.1,15.5,'panel29','#c0ae8f');
 for(const x of[-10,-6.7,-1.5,1.5,6.7,10])roomPart66('Structural wall post',x,3.7,-7.58,.23,7.4,.28,'darkWood','#a08c6d');
 for(const y of[.25,2.13,5.8,7.45]){backRail67('Back wall timber rail',y,.2,'wood','#b09a77',guestDoor);for(const x of[-10.02,10.02])roomPart66('Side wall timber rail',x,y,-.2,.23,.2,15.4,'wood','#b09a77');}
 world.userData.windows66=[];for(const [x,z]of[[-10.04,-3.8],[-10.04,3.6],[10.04,2.9]]){const pane=roomPart66('Lead-glass window',x,3.5,z,.08,2.3,1.5,'window','#c1d6d8');pane.material=new THREE.MeshStandardMaterial({map:textures.window,color:'#9eb9c3',emissive:'#bed0d3',emissiveIntensity:.25,transparent:true,opacity:.94,roughness:.22});pane.castShadow=false;pane.userData.dynamicFX=true;world.userData.windows66.push(pane);for(const yy of[2.28,4.72])roomPart66('Window frame',x,yy,z,.27,.14,1.8,'darkWood','#a38b65');for(const dz of[-.82,0,.82])roomPart66('Window mullion',x,3.5,z+dz,.16,2.3,.09,'darkWood','#8f7958');roomPart66('Window crossbar',x,3.5,z,.17,.09,1.65,'darkWood','#8f7958');roomPart66('Window sill',x,2.25,z,.5,.18,2,'wood','#bca479');}
 for(const x of[-3.8,3.8]){const pane=roomPart66('High lead-glass transom',x,6.5,-7.61,1.1,1.0,.08,'window','#c1d6d8');pane.material=new THREE.MeshStandardMaterial({map:textures.window,color:'#9eb9c3',emissive:'#bed0d3',emissiveIntensity:.25,transparent:true,opacity:.94,roughness:.22});pane.castShadow=false;pane.userData.dynamicFX=true;world.userData.windows66.push(pane);for(const side of[-1,1]){roomPart66('Transom oak frame',x+side*.62,6.5,-7.53,.12,1.25,.19,'darkWood','#9a8564');roomPart66('Transom oak frame',x,6.5+side*.58,-7.53,1.35,.12,.19,'darkWood','#9a8564');}roomPart66('Transom mullion',x,6.5,-7.52,.05,1.0,.12,'metal','#817458');}
 if(guestDoor){roomDoor29(0,-7.54);createInteraction('sleep',0,-6.1,'Rest in the guest rooms');}
 roomPart66('Exterior door stone threshold',0,.025,7.25,2.7,.08,.48,'wall','#bdb6a1');
 obstacle(0,-7.9,21,.6,'interior wall');for(const x of[-10.3,10.3])obstacle(x,-.2,.6,15.6,'interior wall');
 roomDoorMode31='';roomSupportCapture66=true;try{buildBrookFixtures66(id);enrichRoom66(id);}finally{roomSupportCapture66=false;}checkRoomSupports66();
 for(const o of interactables){if(o.actor&&(o.type==='inn'||o.type==='shop')){const inn=spec.type==='inn',forge=id==='brookForge',p=inn?[-4.5,-6.35]:forge?[.2,-6.5]:[-4.5,-5.65],anchor=inn?[-4.5,-3.55]:forge?[.2,-3.45]:[-4.5,-2.8];o.actor.x=p[0];o.actor.z=p[1];o.x=anchor[0];o.z=anchor[1];o.serviceAnchor68=true;updateActor(o.actor,0);}if(o.type==='shop'||o.type==='inn')o.radius=2.65;if(o.type==='council')o.radius=4.6;if(o.type==='archivist')o.radius=4.2;if(o.actor){o.actor.scripted=true;o.actor.face='south';o.actor.home={x:o.actor.x,z:o.actor.z};o.actor.action='idle';o.actor.speed=0;updateActor(o.actor,0);npcs.push(o.actor);}}
 createInteraction('interiorExit',0,7.1,'Return outside');Object.assign(interactables.at(-1),{radius:2.3,visualHeight:.2});
 const fixtures=new THREE.Group();fixtures.name='Authored cutaway '+id;fixtures.userData.chunk=true;fixtures.userData.center=V3();world.add(fixtures);const dynamic=new Set(actors.flatMap(a=>[a.mesh,a.shadow]));
 for(const o of[...world.children])if((o.isMesh||o.userData.interiorFixture29)&&!dynamic.has(o)&&o!==floor&&!o.userData.dynamicFX&&!world.userData.candles?.some(c=>c.mesh===o))fixtures.attach(o);
 mergeGroup(fixtures);world.userData.staticChunks=[fixtures];const lamps=[];world.traverse(o=>{if(o.isPointLight)lamps.push(o);});lamps.forEach(o=>o.removeFromParent());
 world.userData.lanterns=[];for(let i=0;i<6;i++){const l=new THREE.PointLight('#ffc68b',0,8,2);world.add(l);world.userData.lanterns.push(l);}buildRoomAir66();
 world.userData.room66={key:id,identity:spec.type==='inn'?'hearth and hospitality':id==='brookForge'?'forge and weapon workshop':spec.type==='shop'?'provisions and travelling goods':spec.type==='archives'?'royal records and reading room':id==='aidOffice'?'aid parcels and reports':'royal council chamber',footprint:[21,16],geometryAcrossTime:true,ceilingMembers:0};
 sceneBuildFilter=false;finishJourneyWorld(spawn??[0,5]);scene.background.set('#14171a');scene.fog.near=55;scene.fog.far=110;interior66.built++;
};
const cameraBeforeRooms66=updateCamera;
updateCamera=function(dt,instant=false){
 if(!brookRooms66.has(activeScene?.key)||battle||restoration||!player)return cameraBeforeRooms66(dt,instant);
 const narrow=clamp((1.4-camera.aspect)/.6,0,1),look=V3(clamp(player.x*mix(.14,1,narrow),-mix(.8,8,narrow),mix(.8,8,narrow)),2.15,clamp(-2.9+player.z*.20,-3.9,-1.1)),offset=V3(0,8.8,24).multiplyScalar(state.settings.zoom??1);
 cameraTarget.lerp(look,instant?1:1-Math.exp(-dt*6));camera.position.copy(cameraTarget).add(offset);camera.fov=34;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);
 for(const a of actors){a.mesh.quaternion.copy(camera.quaternion);a.shadow.visible=a.mesh.visible;}
};
const roomLightBefore66=updateLighting;
updateLighting=function(...args){const r=roomLightBefore66(...args);if(!brookRooms66.has(activeScene?.key)||activeScene.kind!=='interior')return r;
 const h=(state.worldMinutes/60)%24,day=smooth(5.5,8,h)*(1-smooth(17,19.5,h)),night=1-day;interior66.day.value=day;
 sun.color.set(day>.2?'#ffe8c2':'#91b7df');sun.intensity=.16+day*2.4;sun.position.set(-9,15,5);sun.target.position.set(1,0,-2);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);
 hemi.color.set(day>.2?'#d6e1df':'#9cacc2');hemi.groundColor.set('#705849');hemi.intensity=.43+day*.38;if(skyBounce17){skyBounce17.color.set('#dfb891');skyBounce17.intensity=.27;}renderer.toneMappingExposure=1.12;
 const forge=activeScene.key==='brookForge',inn=INTERIORS[activeScene.key]?.type==='inn',hearth=inn?V3(6,1.7,-5.8):forge?V3(-6,1.7,-5.8):V3(-7.4,2,-4.1),anchors=[hearth,V3(-8,3,-.8),V3(8,3,.7),V3(-4,2.6,-4),V3(4,3,-4.5),V3(0,3.4,3)];
 world.userData.lanterns.forEach((l,i)=>{if((l.userData.effectUntil??0)>clock)return;l.position.copy(anchors[i]);l.color.set(i===0&&forge?'#ff9a42':'#ffc486');l.intensity=(i===0?(forge?25:inn?21:12):8)*(1+night*.62)*(1+Math.sin(clock*(1.8+i*.17)+i)*.018);l.distance=i===0?9:7;l.decay=2;});
 for(const m of world.userData.windows66??[])m.material.emissiveIntensity=.08+day*.30;
 sceneryLight.direction.value.copy(sun.position).sub(sun.target.position).normalize();weather.sun.value.copy(sceneryLight.direction.value);sceneryLight.shadowStrength.value=.47;
 return r;
};
const roomFxBefore66=updateWorldFX;
updateWorldFX=function(...args){const r=roomFxBefore66(...args);interior66.time.value=clock;return r;};
