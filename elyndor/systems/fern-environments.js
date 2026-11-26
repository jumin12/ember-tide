// The existing village plots lead into full-size woodland rooms. New scene IDs
// coexist with the retired fernShop save alias.
const fernRoomSpecs={
 fernCanopyInn:{name:'Fern Hollow Inn',type:'inn',sub:'Guest hall and sleeping alcoves',staff:[.1,-5.55],customer:[.1,-2.43],hearth:[-6.65,1.85,-5.35]},
 fernHollowSmithy:{name:'Fern Hollow Smithy',type:'shop',category:'equipment',sub:'Forge and outfitter',staff:[4.1,-5.7],customer:[4.1,-2.55],hearth:[-5.95,1.8,-5.45]},
 fernHollowSupplies:{name:'Fern Hollow Supplies',type:'shop',category:'supplies',sub:'Provisions for the woodland road',staff:[4.2,-5.7],customer:[4.2,-2.55]}
};
for(const [id,spec] of Object.entries(fernRoomSpecs)){
 INTERIORS[id]={...spec,poi:'fern'};SCENES[id]={name:spec.name,sub:spec.sub,view:'interior',kit:spec.type,seed:741,path:[],interact:[]};brookRooms66.add(id);
}
function hallFrame(g,forge){
 // An open south wall lets the camera look under the full-length coopered roof.
 const point=(a,z)=>V3(10.30*Math.sin(a),3.98+4.80*Math.cos(a),z);
 const staves=30,end=Math.PI/2;
 for(let i=0;i<staves;i++){
  const a=point(-end+i*Math.PI/staves,0),b=point(-end+(i+1)*Math.PI/staves,0);
  const plank=dressedBlock(g,(a.x+b.x)/2,(a.y+b.y)/2,-.40,Math.hypot(b.x-a.x,b.y-a.y)+.022,.12,15.34,'wood',['#94816c','#a08c75','#91806d'][i%3],3.68);
  plank.rotation.z=Math.atan2(b.y-a.y,b.x-a.x);plank.castShadow=false;
 }
 for(const z of [-7.41,-4.10,-.66,2.87,6.81]){
  const arc=Array.from({length:15},(_,i)=>point(-end+Math.PI*i/14,z));
  for(const p of arc)p.y-=.17;
  boundTimber(g,arc,.19,true);
  for(const sign of [-1,1]){
   const x=sign*9.76;
   boundTimber(g,[V3(x,.18,z),V3(x,2.44,z),V3(sign*9.48,4.65,z),V3(sign*8.68,5.86,z)],.20,false);
   dressedBlock(g,x,.30,z,.59,.58,.68,'ashlar','#aaa496',1.7);
  }
 }
 for(const x of [-7.48,-3.76,0,3.76,7.48]){
  dressedBlock(g,x,2.82,-7.45,3.49,2.65,.14,forge?'ashlar':'reed',forge?'#aeaa9c':'#c4ae8c',2.9);
 }
 for(const side of [-1,1]){
  for(const z of [.35,5.15])boundTimber(g,[V3(side*9.94,.15,z),V3(side*9.86,3,z),V3(side*9.23,5.35,z),V3(side*8.02,6.65,z)],.18);
  for(const z of [-4.28,.35]){const end=side*9.16;beam(V3(end,5.20,z),V3(end,5.20,z+4.36),.095,'wood','#b1976f',g);}
  for(const y of [.41,2.01])box(side*9.75,y,-.05,.20,.19,15.0,'wood','#a48b69',g);
  const lining=landmarkGroup(g,side*9.8,0,-.07,-side*Math.PI/2);
  for(const zz of [-5.48,-1.90,1.68,5.26]){
   dressedBlock(lining,zz,1.24,0,3.39,1.39,.16,forge?'ashlar':'reed',forge?'#a5a398':'#bbae92',2.55);
   box(zz-1.72,1.24,.12,.16,1.56,.19,'wood','#9c8264',lining);
  }
  for(const z of [-4.28,.35,5.15]){
   boundTimber(g,[V3(side*9.56,3.50,z),V3(side*9.22,4.65,z),V3(side*8.40,5.69,z),V3(side*7.72,5.98,z)],.13);
  }
 }
 for(const x of [-7.6,-3.72,0,3.72,7.6])wovenBay(g,x,5.10,-7.37,3.33,1.57,x!==0);
 const pediment=landmarkGroup(g,0,4.86,-7.07);
 const arch=new THREE.Shape();arch.moveTo(-2.94,0);arch.lineTo(-2.94,.54);
 arch.quadraticCurveTo(-1.62,1.79,0,1.93);arch.quadraticCurveTo(1.62,1.79,2.94,.54);arch.lineTo(2.94,0);arch.closePath();
 const board=new THREE.ExtrudeGeometry(arch,{depth:.15,bevelEnabled:true,bevelSegments:2,bevelSize:.045,bevelThickness:.04});
 mesh(board,craftSurface('wood','#8b725b'),0,0,0,pediment);
 for(const y of [.10,.29])box(0,y,.18,5.94,.10,.15,'darkWood','#746052',pediment);
 fernCrest(pediment,0,.98,.28,1.23);
 // Low entrance rails terminate before the central aisle and the exit trigger.
 for(const s of [-1,1]){
  for(const z of [4.95,6.70]){
   const x=s*(z===4.95?8.90:6.46);
   dressedBlock(g,x,.40,z,.61,.80,.61,'ashlar','#bcb7a7',2.1);
   dressedBlock(g,x,1.01,z,.33,.70,.33,'wood','#ada18a',2.3);
   landmarkDrum(g,x,1.36,z,.28,.18,.20,'wood','#c3b599',8);
  }
  for(const y of [.63,1.18])beam(V3(s*8.90,y,4.95),V3(s*6.46,y,6.70),y>.8?.11:.069,'wood','#b8a386',g);
  obstacle(s*8.90,4.95,.62,.62,'hall rail');obstacle(s*6.46,6.70,.62,.62,'hall rail');
  for(const t of [.25,.5,.75])obstacle(s*mix(8.90,6.46,t),mix(4.95,6.70,t),.69,.55,'hall rail');
 }
}
function fernCounter(x,z,w){
 roomPart66('Joinered counter',x,.70,z,w,1.38,1.39,'wood','#ad8f6e');
 roomPart66('Polished counter top',x,1.46,z,w+.30,.18,1.64,'wood','#d0b18b');
 for(let i=-1;i<=1;i++)wovenBay(world,x+i*w*.31,.73,z+.725,w*.27,.91);
 obstacle(x,z,w+.1,1.52,'merchant counter');
}
function guestCurtain(g,x,z,sign){
 const geo=new THREE.PlaneGeometry(1,1,10,12),pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const u=pos.getX(i)+.5,v=.5-pos.getY(i),gather=.18+.82*Math.min(1,Math.abs(v-.69)*2.45);pos.setXYZ(i,sign*(.04+(u-.06)*.99*gather),4.0-v*3.43,.12*Math.sin(5*Math.PI*u)*gather+.06*Math.sin(v*3));}
 geo.computeVertexNormals();mesh(geo,craftSurface('cloth','#78958b'),x,0,z,g);
 box(x+sign*.14,1.63,z+.02,.35,.10,.20,'canvas86','#cbb68c',g);
}
function fernBed(g,x,z){
 box(x,.4,z,2.12,.44,3.44,'wood','#a28665',g);box(x,.72,z,2.02,.28,3.31,'cloth','#d8c9aa',g);
 dressedBlock(g,x,.93,z+.41,2.04,.23,2.28,'embroidery','#c7d0b4',0);box(x,.99,z-1.1,1.48,.32,.66,'cloth','#ded1b5',g);
 box(x,1.01,z-1.67,2.20,1.49,.18,'wood','#ab8c69',g);obstacle(x,z,2.18,3.5,'guest bed');
 for(const side of [-1,1]){const xx=x+side*1.15;box(xx,2,z+1.62,.13,4,.16,'wood','#a48a65',g);guestCurtain(g,xx,z+1.65,-side);}
 box(x,4,z+1.65,2.53,.14,.17,'wood','#b99c74',g);
 for(const side of [-1,1]){
  const xx=x+side*1.14;
  landmarkDrum(g,xx,4.0,z+1.64,.15,.085,.27,'wood','#ba9970');
  beam(V3(xx,3.91,z+1.65),V3(xx,3.91,z-1.65),.093,'wood','#967c5d',g);
  box(xx,2.02,z-1.65,.17,3.83,.17,'wood','#9d805e',g);
 }
 dressedBlock(g,x,3.90,z,2.25,.13,3.35,'reed','#b5a584',2.77);
 dressedBlock(g,x,3.73,z+1.70,2.41,.52,.10,'embroidery','#bfc9ad',0);
}
function canopyHearth(g,x,z,forge){
 const bed=landmarkGroup(g,x,0,z);
 masonryHearth163(bed,{key:'hearth29',tint:forge?'#929088':'#b7a28a',forge,region:'fern',scale:1.47});
 world.userData.roomFlame29=environmentFire163(world,forge?'forge':'inn',x,.43,z+.10,forge?1.55:1.02);
 world.userData.roomHearth29=V3(x,1.8,z+1.3);obstacle(x,z,4.82,2.42,'stone hearth');
}
function innFixtures(g){
 canopyHearth(g,-6.65,-5.45,false);fernCounter(.1,-4.13,4.25);
 const rack=landmarkGroup(g,.15,2.56,-7.18);box(0,0,0,3.35,.83,.13,'wood','#b99b77',rack);
 for(let i=0;i<6;i++){const x=(i-2.5)*.46;beam(V3(x,.11,0),V3(x,.15,.25),.046,'bronze','#cca866',rack);landmarkHoop(rack,x,-.10,.21,.12,.032);box(x,-.30,.21,.061,.24,.055,'bronze','#ceac68',rack);box(x+.051,-.38,.21,.13,.07,.06,'bronze','#ceac68',rack);}
 for(const side of [-1,1]){const page=roomPart66('Open guest register',-.42+side*.25,1.64,-4.02,.52,.10,.62,'plaster','#e4d4ad');page.rotation.z=side*.10;}
 roomPlant29(1.47,1.55,-4.14,1.12,true);roomLantern66(-1.57,1.55,-4.19);
 roomTable29(-6.55,-.62,1.11);roomTable29(-6.76,2.82,1.03);
 fernBed(g,5.1,-5.44);fernBed(g,8.14,-5.44);fernBed(g,7.85,.32);
 dressedBlock(g,.12,.035,1.78,3.85,.055,5.14,'reed','#9f997e',2.67);
 dressedBlock(g,.12,.070,1.78,3.46,.030,4.77,'embroidery','#d7c8aa',0);
 for(const [x,z,size] of [[4.72,2.81,1.48],[-8.56,-3.9,1.36],[8.8,-3.08,.92]]){
  landmarkDrum(g,x,0,z,.36,.51,.67,'clay','#a08268');gardenFern(g,x,.63,z,size,x);
 }
 for(const s of [-1,1]){
  const end=s<0?-7.9:7.70;
  for(let i=0;i<5;i++){const frond=gardenFern(g,end+s*i*.28,5.92-i*.25,-4.25,1.08-i*.07,i*.9);frond.rotation.z=s*(1.52+i*.12);}
 }
}
function smithGrinder(g,x,z){
 const frame=landmarkGroup(g,x,0,z,-.38);
 for(const s of [-1,1]){
  for(const t of [-1,1])beam(V3(s*.55,.06,t*.53),V3(s*.46,1.19,0),.10,'darkWood','#7b6959',frame);
  box(s*.50,.40,0,.15,.16,1.02,'wood','#927957',frame);
 }
 const wheel=mesh(geo16('fern-grindstone',()=>new THREE.CylinderGeometry(.74,.74,.29,22)),detailedStone105('rockGranite'),0,1.16,0,frame);wheel.rotation.z=Math.PI/2;
 beam(V3(-.7,1.16,0),V3(.77,1.16,0),.079,'metal','#929b95',frame);
 beam(V3(.77,1.16,0),V3(.77,.87,.31),.054,'metal','#96958b',frame);beam(V3(.77,.87,.31),V3(.99,.87,.31),.071,'wood','#a79172',frame);
}
function smithFixtures(g){
 canopyHearth(g,-5.95,-5.45,true);anvil67(-5.14,-1.45);
 const trough=landmarkGroup(g,-8.34,0,-1.58);landmarkDrum(trough,0,0,0,.85,.96,.88,'wood','#a08564',14);landmarkDrum(trough,0,.89,0,.82,.83,.02,'window','#71959b',14);for(const y of [.19,.68])landmarkHoop(trough,0,y,0,.89,.06,'metal','#737b78').rotation.x=Math.PI/2;
 obstacle(-8.34,-1.58,1.95,1.95,'quenching tub');
 weaponRack66(-.75,-7.16,3.76);stockedRoomShelf66(6.7,-7.03,4.38,3);
 fernCounter(4.1,-4.20,5.1);forgeTool66(2.77,1.55,-4.23,-.38);roomBooks29(5.9,1.55,-4.23,2,7);
 armorStand66(8.08,-1.35);weaponRack66(7.72,.77,2.88);obstacle(7.72,.77,3,.5,'freestanding weapon rack');
 for(const side of [-1,1])roomPart66('Workshop bench legs',-6.62+side*1.48,.68,2.87,.33,1.36,1.2,'darkWood','#a28560');
 roomPart66('Hammering bench',-6.62,1.43,2.87,3.55,.22,1.37,'wood','#b99e77');forgeTool66(-6.18,1.54,2.87,.10);obstacle(-6.62,2.87,3.57,1.39,'smith workbench');
 for(let i=0;i<4;i++)roomPart66('Stack of iron billets',-7.50+i*.17,1.63,2.74,.14,.16,.76,'metal','#808d8d');
 roomPlant29(8.75,0,4.07,1.28);
 const hood=landmarkGroup(g,-5.95,0,-6.78);
 for(const [y,w,h,d] of [[3.36,3.37,.55,1.54],[3.92,2.81,.59,1.44],[4.56,2.24,.73,1.36],[5.66,1.59,1.50,1.23],[6.47,1.87,.18,1.44]]){
  dressedBlock(hood,0,y,0,w,h,d,'ashlar','#807c73',2.43);
 }
 const apron=dressedBlock(g,-5.91,.055,-3.98,4.75,.10,2.49,'ashlar','#797b78',2.1);
 apron.name='Hearth apron';smithGrinder(g,-7.62,1.51);
 const tools=landmarkGroup(g,-3.13,0,-6.97);
 dressedBlock(tools,0,2.63,0,2.09,2.72,.16,'wood','#988068',2.1);
 for(let i=0;i<4;i++){
  const xx=(i-1.5)*.46,top=3.63-.18*(i%2);
  beam(V3(xx,top,.17),V3(xx-.10,top-1.12,.17),.049,'metal','#a09c90',tools);
  if(i%2===0)box(xx-.051,top-1.09,.17,.36,.19,.22,'metal','#9b9f99',tools);
  else for(const s of [-1,1])beam(V3(xx-.075,top-.57,.17),V3(xx+s*.14,top-1.25,.17),.033,'metal','#a4a299',tools);
 }
}
function produceBasket(g,x,z,tone){
 const bowl=landmarkGroup(g,x,.02,z),base=new THREE.LatheGeometry([[.31,0],[.41,.06],[.57,.39],[.56,.59],[.50,.61],[.49,.42]].map(([a,b])=>new THREE.Vector2(a,b)),16);
 mesh(base,craftSurface('reed','#beab88'),0,0,0,bowl);
 landmarkHoop(bowl,0,.56,0,.54,.045,'canvas86','#ceb287').rotation.x=Math.PI/2;
 for(let i=0;i<12;i++){const a=i*2.40,r=i<8?.35:.17;landmarkBoulder(bowl,Math.cos(a)*r,.53+(i<8?0:.15),Math.sin(a)*r,.15,.15,.16,'fruit',tone,a);}
 obstacle(x,z,1.16,1.16,'produce basket');
}
function supplyFixtures(g){
 stockedRoomShelf66(-6.82,-7.05,4.65,2);stockedRoomShelf66(-1.54,-7.06,4.55,1);stockedRoomShelf66(6.8,-7.05,4.70,5);
 fernCounter(4.2,-4.18,5.24);const cloth=landmarkGroup(g,4.18,0,-3.43);
 dressedBlock(cloth,0,.87,.096,2.35,1.34,.12,'embroidery','#e4d9bc',0);
 const scale=landmarkGroup(g,2.56,1.55,-4.21);
 landmarkDrum(scale,0,0,0,.35,.27,.13,'bronze','#a98b5d');box(0,.58,0,.09,1.04,.1,'bronze','#c49e68',scale);
 beam(V3(-.60,1.05,0),V3(.60,1.09,0),.044,'bronze','#b49667',scale);
 for(const s of [-1,1]){for(const dz of [-.20,.20])beam(V3(s*.56,1.07,0),V3(s*.56,.58,dz),.015,'bronze','#c4ab7f',scale);landmarkDrum(scale,s*.56,.51,0,.10,.28,.10,'bronze','#bc9b67');}
 roomRoll66(5.8,1.55,-4.27,.66);roomBooks29(6.38,1.55,-4.24,2,4);
 for(const [x,z,color] of [[-7.34,-1.85,'#bc6250'],[-8.45,-.92,'#b99a55'],[-6.77,-.74,'#809155'],[-7.98,.38,'#a97748']])produceBasket(g,x,z,color);
 for(const [x,z] of [[-8.42,2.11],[-7.32,2.24],[7.91,.96]])roomBag66(x,0,z,1.18);
 for(let i=0;i<7;i++){const x=-8.45+i*.66,y=5.04+.13*Math.cos(i*1.3);beam(V3(x,6.03,-5.28),V3(x,y,-5.28),.022,'canvas86','#b2a07a',g);for(let j=0;j<4;j++)landmarkBoulder(g,x+Math.cos(j*2)*.12,y-.21-j*.045,-5.28+Math.sin(j*2)*.12,.12,.34,.1,'shrub',i%3?'#879277':'#a4a380',i+j);}
 boundTimber(g,[V3(-8.46,6.04,-5.28),V3(-6.43,5.87,-5.28),V3(-4.44,6.04,-5.28)],.04,false);
 roomPlant29(8.83,0,3.04,1.49);roomRug29(1.78,-.69,3.65,2.5);
 const display=landmarkGroup(g,-4.91,0,-5.68);
 const ropePoint=(u,v)=>V3(-3.84+7.68*u,5.36+.45*v-.49*Math.sin(u*Math.PI)-.23*Math.sin(v*Math.PI),1.52-3.12*v);
 for(let n=0;n<=16;n++){
  const u=n/16,points=[];for(let j=0;j<=4;j++)points.push(ropePoint(u,j/4));boundTimber(display,points,.030,false);
 }
 for(let n=0;n<=6;n++){
  const v=n/6,points=[];for(let j=0;j<=8;j++)points.push(ropePoint(j/8,v));boundTimber(display,points,.039,false);
 }
 for(let i=0;i<6;i++){
  const p=ropePoint((i+.6)/6,.14+.32*(i%2)),len=.40+.33*(i%3);beam(p,p.clone().add(V3(0,-len,0)),.036,'canvas86','#b5a481',display);
  const spray=gardenFern(display,p.x,p.y-len,p.z,.65+.20*(i%3),i*.87);spray.rotation.z=Math.PI-.1*Math.sin(i);
 }
 const draper=landmarkGroup(g,8.53,0,1.56,Math.PI/2);
 dressedBlock(draper,0,.48,0,3.8,.90,1.22,'wood','#a39273',2.33);
 for(let i=0;i<4;i++){
  const x=-1.28+i*.83;
  for(let j=0;j<2+(i%2);j++)dressedBlock(draper,x+.036*j,1.01+j*.14,0,.77,.139,1.09,j===1?'embroidery':'reed',['#a3afa0','#bfab8b','#a49179','#c3b293'][i],0);
 }
}
function buildFernFixtures(id){
 const spec=fernRoomSpecs[id],inn=spec.type==='inn',forge=spec.category==='equipment';
 const floor=world.userData.terrain,geo=floor.geometry.clone(),uv=geo.attributes.uv,source=forge?'cobbleOld':'oakBoards102';
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(forge?7:4.5),uv.getY(i)*(forge?5.4:4));
 floor.geometry=geo;floor.material=new THREE.MeshStandardMaterial({map:environment102.maps.get(source),normalMap:envPbr103.maps.get(source+':normalRough'),color:forge?'#a7a498':'#b6a086',roughness:.91});
 floor.material.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat woodValue=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)); diffuseColor.rgb=mix(vec3(woodValue),diffuseColor.rgb,.62);');
 };
 const g=landmarkGroup(world);g.name='Fern Hollow joinery';g.userData.interiorFixture29=true;hallFrame(g,forge);
 if(inn)innFixtures(g);else if(forge)smithFixtures(g);else supplyFixtures(g);
 for(const side of [-1,1]){roomLantern66(side*8.89,4.36,-4.30);beam(V3(side*8.89,5.97,-4.30),V3(side*8.89,5.08,-4.30),.025,'metal','#a38b64',g);}
 createInteraction(inn?'inn':'shop',...spec.customer,inn?'Speak to the innkeeper':forge?'Browse weapons and armor':'Browse woodland supplies',inn?'innkeeper':forge?'worker':'merchant');
}
const fernCaveDoor=[127,102],remnantStair=[99,21];
const forestBeforeCaveApproach=buildSolidTree;
buildSolidTree=function(x,z,...args){
 if(activeScene?.key==='fern'&&Math.hypot((x-fernCaveDoor[0])*.98,(z-fernCaveDoor[1]-3)*.71)<7.0)return null;
 return forestBeforeCaveApproach(x,z,...args);
};
function chamberRock(parent,x,y,z,w,h,d,kind,variant){
 const form=Math.abs(Math.round(variant*3))%8;
 const geo=geo16('fern-chamber-crag-'+form,()=>{
  const rock=rockGeometry62(form).clone();rock.computeBoundingBox();const size=rock.boundingBox.getSize(V3()),center=rock.boundingBox.getCenter(V3());
  rock.translate(-center.x,-center.y,-center.z);rock.scale(2/size.x,2/size.y,2/size.z);return rock;
 });
 const o=mesh(geo,detailedStone105(kind),x,y,z,parent);o.scale.set(w,h,d);o.rotation.y=variant;o.rotation.z=.09*Math.sin(variant);return o;
}
function caveMouth(x,z){
 const g=landmarkGroup(world,x,groundAt(x,z),z);
 const shadow=mesh(new THREE.CircleGeometry(1,24),new THREE.MeshBasicMaterial({color:'#161c19'}),0,1.12,-1.57,g);shadow.scale.set(2.16,2.74,1);
 for(let i=0;i<11;i++){const a=Math.PI*i/10;chamberRock(g,2.62*Math.cos(a),.12+3.63*Math.sin(a),-1.40,.94,1.04,1.27,i%3?'rockMoss':'rockGranite',i*1.74);}
 for(const side of [-1,1]){chamberRock(g,side*3.51,.74,-2.20,1.92,1.66,2.25,'rockMoss',side);chamberRock(g,side*3.46,.48,-.55,1.56,.94,1.24,'rockMoss',side*1.6);}
 for(const [xx,yy,zz,w,h,d,angle] of [[-3.83,1.42,-3.75,2.31,1.61,1.89,.72],[3.68,1.65,-3.81,2.27,1.95,1.86,2.41],[-1.90,2.82,-4.22,1.76,1.14,1.51,.35],[1.1,3.06,-4.59,2.17,.97,1.35,.28],[-4.82,.46,-1.42,1.82,.91,1.63,.42]]){
  chamberRock(g,xx,yy,zz,w,h,d,'rockMoss',angle);
 }
 for(const [xx,yy,zz,size] of [[-3.53,1.31,-.16,1.11],[3.91,1.13,-.38,1.34],[-2.91,3.91,-2.38,.76],[2.5,3.94,-1.91,.90],[-4.54,.62,.65,.83]])gardenFern(g,xx,yy,zz,size,xx);
 for(let i=0;i<3;i++)box(0,.04+i*.10,-i*.38,3.16,.14,.55,'rock','#b6b1a1',g).material=detailedStone105('rockLimestone');
 {
  // The reference threshold is a timber entrance let into the rock.
  // Put the jambs on the stone shoulders, clear of the working stair.
  const trim=landmarkGroup(g,0,0,-.32);
  for(const side of [-1,1]){
   boundTimber(trim,[V3(side*2.12,.10,.37),V3(side*2.13,1.47,.35),V3(side*1.82,2.75,.32),V3(side*1.02,3.46,.17),V3(0,3.80,.16)],.15);
   landmarkLamp(trim,side*2.21,1.76,.45,.36);
  }
  fernCrest(trim,0,2.95,.69,.81);
 }
 obstacle(x-3,z-1.45,2.35,2.85,'cave rock');obstacle(x+3,z-1.45,2.35,2.85,'cave rock');
}
function remnantStage(x,z){
 const g=landmarkGroup(world,x,groundAt(x,z),z),rng=seeded(104752);
 const floor=world.userData.remnantWalk={x,z,courses:[],steps:[]};
 // The bronze reflects the small stair opening and cool stone enclosure.
 // With an outdoor environment probe the reflection inside this vault is black.
 const brass=new THREE.ShaderMaterial({
  uniforms:{grain:{value:environment102.maps.get('iron102')}},
  vertexShader:`
   #include <common>
   varying vec3 worldNormal, worldPoint;
   void main(){
    worldNormal=inverseTransformDirection(normalize(normalMatrix*normal),viewMatrix);
    worldPoint=(modelMatrix*vec4(position,1.)).xyz;
    gl_Position=projectionMatrix*viewMatrix*vec4(worldPoint,1.);
   }`,
  fragmentShader:`
   uniform sampler2D grain;
   varying vec3 worldNormal,worldPoint;
   void main(){
    vec3 n=normalize(worldNormal),l=normalize(vec3(-.74,.72,.28)),v=normalize(cameraPosition-worldPoint);
    float fleck=texture2D(grain,vec2(worldPoint.x+worldPoint.z,worldPoint.y)*.46).r;
    float patina=smoothstep(.38,.80,fleck+.12*sin(worldPoint.y*2.4+worldPoint.x*1.7));
    vec3 bronze=mix(vec3(.195,.132,.077),vec3(.068,.110,.103),.26+patina*.65);
    float edge=pow(1.-max(dot(n,v),0.),3.);
    vec3 c=bronze*(.52+.65*max(dot(n,l),0.))*(.85+.32*fleck);
    c+=vec3(.35,.29,.19)*pow(max(dot(n,normalize(l+v)),0.),24.)+edge*vec3(.065,.062,.054);
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 });
 // Broad flagstones taper into the native floor around the dais.
 const stone=['#9da4a0','#b0b0a1','#9da39d','#abaea4'];
 for(let course=0;course<3;course++){
  const inner=[1.78,3.72,5.55][course],outer=[3.69,5.51,7.28][course],n=14+course*5;
  floor.courses.push({r:outer,y:g.position.y+.34-course*.055});
  for(let i=0;i<n;i++){
   const a=(i+course*.4)*TAU/n+.005,b=a+TAU/n-.011;
   const contour=new THREE.Shape();contour.absarc(0,0,outer,a,b,false);contour.absarc(0,0,inner,b,a,true);contour.closePath();
   const geo=new THREE.ExtrudeGeometry(contour,{depth:.12,bevelEnabled:false,curveSegments:20});geo.rotateX(-Math.PI/2);
   const tint=['#828982','#919286','#858e89'][course];
   const stoneTile=craftSurface('ashlar',tint);
   const p=geo.attributes.position,uv=geo.attributes.uv;
   for(let k=0;k<p.count;k++)uv.setXY(k,p.getX(k)*.23+.21,p.getZ(k)*.23+.35);
   mesh(geo,stoneTile,0,.09+(.13-course*.055),0,g);
  }
 }
 for(const [r,y] of [[3.55,.354],[6.88,.249]]){const band=landmarkHoop(g,0,y,0,r,.033,'bronze','#947d60');band.material=brass;band.rotation.x=Math.PI/2;}
 for(let i=0;i<16;i+=4){
  const a=i*TAU/16,seal=landmarkGroup(g,Math.sin(a)*4.48,.313,Math.cos(a)*4.48,a);
  if(i%4===0){const plate=box(0,0,0,.72,.045,.99,'bronze','#b49869',seal);plate.material=brass;}
  const glyph=landmarkGroup(seal,0,.05,0);glyph.rotation.x=-Math.PI/2;
  remnantGlyph(glyph,.55,i%4);
 }
 for(const [r,y,h,tone] of [[2.62,.23,.28,'#858e89'],[2.46,.51,.36,'#939890'],[2.31,.87,.31,'#858b84'],[2.18,1.18,.17,'#a1a69b']]){
  const tier=landmarkDrum(g,0,y,0,r,r-.035,h,'wall',tone,24);tier.material=craftSurface('ashlar',tone);
  floor.courses.push({r:r-.035,y:g.position.y+y+h});
 }
 // The two low front treads meet the circular flagstones before the service points.
 for(let i=0;i<2;i++){
  const step=dressedBlock(g,0,.28+.125*i,2.79-i*.35,1.76+i*.22,.18+.25*i,.52,'ashlar','#959d92',1.85);
  floor.steps.push({x,z:z+step.position.z,w:.88+i*.11,d:.26,y:g.position.y+step.position.y+.09+.125*i});
 }
 const profile=[[.74,0],[.74,.20],[.61,.35],[.61,.58],[.49,.73],[.44,4.05],[.53,4.18],[.54,4.36],[.68,4.45],[.65,4.75],[.52,4.81],[.44,4.93],[.39,5.19],[.14,5.34]];
 const shaft=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),8).toNonIndexed();shaft.computeVertexNormals();
 mesh(shaft,brass,0,1.35,0,g);
 for(const [y,r] of [[1.56,.72],[1.95,.62],[2.09,.54],[5.55,.53],[5.83,.70],[6.12,.61]])landmarkDrum(g,0,y,0,r,r,.082,'bronze','#b4a27a',8).material=brass;
 for(let i=0;i<8;i++){const a=(i+.5)*TAU/8,face=landmarkGroup(g,Math.sin(a)*.433,2.18,Math.cos(a)*.433,a);
  box(0,1.54,0,.283,2.88,.04,'darkWood','#626e65',face);
  for(const s of [-1,1]){const strip=box(s*.157,1.52,.022,.034,2.94,.046,'bronze','#ac946c',face);strip.material=brass;}
  for(let j=0;j<4;j++)remnantGlyph(landmarkGroup(face,0,.45+j*.64,.028),.275,(i+j)%4);
 }
 for(const side of [-1,1]){
  const fin=landmarkGroup(g,side*1.09,1.34,-.14),h=side<0?4.09:3.19;fin.rotation.z=-side*.12;
  const outline=new THREE.Shape();outline.moveTo(-.37,0);outline.lineTo(.44,0);outline.lineTo(.31,h*.72);outline.lineTo(.23,h*.92);outline.lineTo(-.08,h);outline.lineTo(-.20,h*.82);outline.lineTo(-.35,h*.79);outline.closePath();
  const shard=new THREE.ExtrudeGeometry(outline,{depth:.61,bevelEnabled:true,bevelSize:.055,bevelThickness:.05,bevelSegments:1});
  mesh(shard,detailedStone105('rockSlate'),0,0,-.31,fin);
  for(let j=0;j<3;j++)remnantGlyph(landmarkGroup(fin,.02,.55+j*h*.20,.37),.45,(j+1)%4);
 }
 obstacle(x,z,3.6,3.6,'remnant device');
 // Keep the front open for the game camera and the original southern approach.
 for(let i=0;i<=28;i++){
  const a=(-1.60+i/28*3.20),xx=Math.sin(a)*17.4,zz=-Math.cos(a)*13.2;
  if(xx>11&&zz>-5.2)continue;
  if(zz<-8&&Math.abs(xx-5.7)<4.70)continue;
  if(Math.abs(x+xx-remnantStair[0])<5.1&&Math.abs(z+zz-remnantStair[1]+3.1)<6.0)continue;
  const ht=4.4+rng()*2.5;chamberRock(g,xx,1.55,zz,2.8+rng(),ht,2.75,i%4?'rockSlate':'rockGranite',a+rng()*2);
  chamberRock(g,xx*.97,ht*.79,zz+.2,3.4,1.35,2.75,i%3?'rockSlate':'rockMoss',a+.91);
  if(i%2===0){chamberRock(g,xx*1.07,ht+1.5,zz-1.4,4.25,1.95,3.45,'rockSlate',a+.36);chamberRock(g,xx*.89,-.15,zz+1.37,2.1,1.13,1.74,'rockMoss',a-.55);}
  if(i%3===0){for(let j=0;j<3;j++){const rx=xx+(j-1)*.43;boundTimber(g,[V3(rx,ht*.92,zz+1.51),V3(rx-.43,ht*.69,zz+1.68),V3(rx+.14,ht*.46,zz+1.92),V3(rx-.21,ht*(.23+.16*rng()),zz+1.87)],.038,false);}}
 }
 const steps=landmarkGroup(world,remnantStair[0],groundAt(...remnantStair),remnantStair[1]);
 const niche=landmarkGroup(g,5.7,.14,-9.76,-.13);
 for(const side of [-1,1])for(let i=0;i<4;i++)
  dressedBlock(niche,side*1.93,.51+i*.96,-.35,.76,.94,1.65,'ashlar',i%2?'#727c78':'#828781',1.8);
 for(let i=0;i<11;i++){
  const a=(i+.5)*Math.PI/11,stone=dressedBlock(niche,1.94*Math.cos(a),3.88+1.94*Math.sin(a),-.35,.61,.75,1.66,'ashlar',i%3?'#838982':'#979b90',1.7);
  stone.rotation.z=a-Math.PI/2;
 }
 const recess=new THREE.Shape();recess.moveTo(-1.68,0);recess.lineTo(1.68,0);recess.absarc(0,3.88,1.68,0,Math.PI,false);recess.closePath();
 mesh(new THREE.ShapeGeometry(recess),craftSurface('ashlar','#3e4b4e'),0,0,-1.14,niche);
 for(const [xx,yy,zz,w,h,d,a] of [[-4.4,8.96,-12.2,6.75,1.55,3.9,.75],[4.2,8.39,-12.6,4.95,2.21,3.7,1.17],[10.6,6.95,-8.9,4.61,1.77,3.5,2.73]]){
  chamberRock(g,xx,yy,zz,w,h,d,'rockSlate',a);
  for(let j=0;j<3;j++){const ax=xx-1.53+j*1.24,az=zz+d*.59;
   boundTimber(g,[V3(ax,yy-1.0,az),V3(ax-.35,yy-1.91,az+.47),V3(ax+.18,yy-2.86-.35*j,az+.66),V3(ax-.23,yy-3.63-.42*j,az+.72)],.059,false);
  }
 }
 const limestone=detailedStone105('rockLimestone');
 const wornTreads=['#121915','#263129','#41493c'].map(tint=>{
  const m=limestone.clone();m.onBeforeCompile=limestone.onBeforeCompile;m.customProgramCacheKey=limestone.customProgramCacheKey;
  m.emissive.set(tint);return m;
 });
 for(let i=0;i<10;i++){
  const y=.23+i*.35,z=-i*.49,step=box(0,y*.5,z,3.43,y,.52,'wall',stone[i%4],steps);step.material=detailedStone105('rockSlate');
  const tread=box(0,y+.047,z+.04,3.52,.094,.56,'wall',stone[i%4],steps);tread.material=wornTreads[Math.min(2,Math.floor(i/3.4))];
  floor.steps.push({x:steps.position.x,z:steps.position.z+z+.04,w:1.76,d:.28,y:steps.position.y+y+.094});
 }
 for(const side of [-1,1])for(let i=0;i<4;i++){
  const xx=side*(2.40+.14*Math.sin(i*2+side)),zz=-i*1.25,yy=.62+i*.57;
  chamberRock(steps,xx,yy,zz,.72,.82+i*.09,.97,i%3?'rockSlate':'rockMoss',side+i);
  const curb=dressedBlock(steps,side*1.94,yy-.23,zz,.57,.67,1.29,'ashlar','#9d9e8e',2.3);curb.rotation.z=side*.047*Math.sin(i);
 }
 for(const side of [-1,1])for(let i=0;i<3;i++)
  dressedBlock(steps,side*2.14,3.27+i*.71,-4.92,.68,.70,2.09,'ashlar','#939b92',1.87);
 for(let i=0;i<11;i++){
  const a=(i+.5)*Math.PI/11,block=dressedBlock(steps,2.14*Math.cos(a),4.95+2.14*Math.sin(a),-4.92,.64,.75,2.09,'ashlar','#9ea196',1.87);
  block.rotation.z=a-Math.PI/2;
 }
 const light=mesh(new THREE.CircleGeometry(1,32),new THREE.ShaderMaterial({
  vertexShader:'varying vec2 passage;void main(){passage=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 passage;void main(){
   float x=passage.x,y=passage.y;
   float ridge=.29+.043*sin(x*7.6)+.078*cos(x*3.2)+.016*sin(43.*x);
   vec3 morning=mix(vec3(.61,.68,.64),vec3(.84,.87,.78),smoothstep(.26,.91,y));
   vec3 hill=mix(vec3(.30,.37,.33),vec3(.52,.60,.53),smoothstep(.09,.44,y));
   gl_FragColor=vec4(mix(hill,morning,smoothstep(ridge-.016,ridge+.016,y)),1.);
  }`
 }),0,4.64,-4.94,steps);light.scale.set(1.75,2.07,1);light.name='Daylight beyond the stone stair';
 const shaftMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec2 shaftUv;void main(){shaftUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 shaftUv;void main(){float soft=sin(3.14159*shaftUv.x)*sin(3.14159*shaftUv.y);gl_FragColor=vec4(.79,.85,.73,soft*soft*.065);}'});
 for(let i=0;i<3;i++){const shaft=mesh(new THREE.PlaneGeometry(1.16+i*.24,7.5),shaftMat,-.57+i*.80,3.03,-1.54,steps);shaft.rotation.x=-.78;shaft.rotation.z=.21;shaft.castShadow=false;}
}
const heightBeforeRemnantWalk=heightAt;
heightAt=function(x,z,...args){
 let y=heightBeforeRemnantWalk(x,z,...args);
 const floor=world?.userData.remnantWalk;if(!floor||activeScene?.key!=='depths')return y;
 const radius=Math.hypot(x-floor.x,z-floor.z);
 for(const course of floor.courses)if(radius<=course.r)y=Math.max(y,course.y);
 for(const step of floor.steps)if(Math.abs(x-step.x)<=step.w&&Math.abs(z-step.z)<=step.d)y=Math.max(y,step.y);
 return y;
};
function remnantGlyph(g,size,form){
 const strokes=[[[0,.43],[0,-.40]],[[-.33,.22],[0,.0]],[[0,.0],[.33,.23]]];
 if(form%2)strokes.push([[0,.42],[.30,.23]]);
 if(form>1)strokes.push([[-.29,-.15],[0,-.39]],[[0,-.39],[.29,-.14]]);
 for(const [a,b] of strokes)beam(V3(a[0]*size,a[1]*size,.012),V3(b[0]*size,b[1]*size,.012),size*.044,'metal','#c1b391',g);
}
const relayBeforeFernStage=mechanism46;
mechanism46=function(x,z){if(activeScene?.key==='depths')remnantStage(x,z);else relayBeforeFernStage(x,z);};
const lightBeforeRemnantStage=updateLighting;
updateLighting=function(...args){
 const result=lightBeforeRemnantStage(...args);if(battle)return result;
 const room=fernRoomSpecs[activeScene?.key];
 if(room){
  // Sky light through the clerestory balances the existing pools of firelight.
  // Retain the solar intensity, night progression and local lantern controls.
  const day=interior66.day.value;
  hemi.color.set(day>.2?'#d4e5e8':'#a7b7c7');hemi.groundColor.set(room.category==='equipment'?'#686765':'#766f61');
  hemi.intensity=.54+.63*day;sun.color.set(day>.2?'#f2eee4':'#91b7df');sun.intensity=.16+1.95*day;
  if(skyBounce17){skyBounce17.color.set('#cfdbdb');skyBounce17.intensity=.37;}
  for(const [i,lamp] of (world.userData.lanterns??[]).entries())
   if(i>0&&!(lamp.userData.effectUntil>clock))lamp.color.set('#ffe6c7');
  return result;
 }
 if(activeScene?.key!=='depths')return result;
 sun.color.set('#dce6dd');sun.intensity=.84;
 hemi.color.set('#bfccd1');hemi.groundColor.set('#656e68');hemi.intensity=.92;
 return result;
};
const doorsBeforeFernStage=addInteriorDoors;
addInteriorDoors=function(...args){
 const result=doorsBeforeFernStage(...args),key=activeScene?.key;if(key==='fern'){
  for(const g of world.userData.buildings){
   const id=g.userData.fernInterior;if(!id)continue;
   // Fire billboards need the actual hearth transform after the masonry is batched.
   if(g.userData.forgeMouth)environmentFire163(g,'forge',...g.userData.forgeMouth,.70);
   const door=g.userData.door;createInteraction('interiorDoor',door.x,door.z,'Enter '+fernRoomSpecs[id].name);Object.assign(interactables.at(-1),{interior:id,radius:2.65});
  }
  caveMouth(...fernCaveDoor);
 }
 if(key==='fern'||key==='depths'){const place=key==='fern'?fernCaveDoor:remnantStair;createInteraction('remnantPassage',place[0],place[1]+1.12,key==='fern'?'Descend to the underground remnant':'Climb to Fern Hollow');interactables.at(-1).radius=2.85;}
 return result;
};
const actionBeforeFernStage=act;
act=function(o){
 if(o?.type!=='remnantPassage')return actionBeforeFernStage(o);
 if(dialogue||menu||eventAction||transition||battle)return;
 const down=activeScene.key==='fern';if(down){const reason=canExit({to:'depths'});if(reason){toast(reason);return;}}
 const place=down?remnantStair:fernCaveDoor;return changeJourneyScene(POIS[down?'depths':'fern'].id,[place[0],place[1]+2.62]);
};
const serviceBeforeFernStage=handleInteriorInteraction;
handleInteriorInteraction=function(o){
 const spec=fernRoomSpecs[activeScene?.key];if(!spec||!['shop','inn'].includes(o.type))return serviceBeforeFernStage(o);
 const inn=o.type==='inn',smith=spec.category==='equipment';
 startDialogue([[inn?'Innkeeper':smith?'Smith':'Provisioner',inn?'Come in from the trail. The beds by the hearth are ready.':smith?'Set your gear on the bench. Let’s see what will hold up on the trail.':'The baskets are fresh this morning. What do you need for the road?']],()=>openMenu(inn?'inn':'shop'));return true;
};
const menuBeforeFernStage=renderMenu;
renderMenu=function(...args){const result=menuBeforeFernStage(...args);const spec=fernRoomSpecs[activeScene?.key];if(spec&&menu?.tab==='shop')$('#menu-title').textContent=spec.name;return result;};
