// The existing village plots lead into full-size woodland rooms. New scene IDs
// coexist with the retired fernShop save alias.
const fernRoomSpecs={
 fernCanopyInn:{name:'Fern Hollow Inn',type:'inn',sub:'Guest hall and sleeping alcoves',staff:[.1,-5.55],customer:[.1,-2.43],hearth:[-6.65,1.85,-5.35]},
 fernHollowSmithy:{name:'Fern Hollow Smithy',type:'shop',category:'equipment',sub:'Forge and outfitter',staff:[4.1,-5.7],customer:[4.1,-2.55],hearth:[-5.95,1.8,-5.45]},
 fernHollowSupplies:{name:'Fern Hollow Supplies',type:'shop',category:'supplies',sub:'Provisions for the woodland road',staff:[4.2,-5.7],customer:[4.2,-2.55]}
};
for(const [id,spec] of Object.entries(fernRoomSpecs)){
 INTERIORS[id]={...spec,poi:'fern',bounds:[-10.1,10.1,-14.02,7.65]};SCENES[id]={name:spec.name,sub:spec.sub,view:'interior',kit:spec.type,seed:741,path:[],interact:[]};brookRooms66.add(id);
}
// Adzed poles keep their grain lengthwise around bends. Tapered forks and
// wound lashings break up the silhouette of the coopered ceiling.
function hallTimber(parent,points,r,lash=false){
 const curve=new THREE.CatmullRomCurve3(points);
 const geo=new THREE.TubeGeometry(curve,Math.max(12,points.length*4),r,10,false);
 const uv=geo.attributes.uv;
 for(let k=0;k<uv.count;k++){const u=uv.getX(k),v=uv.getY(k);uv.setXY(k,v*1.85,u*curve.getLength()*.31);}
 mesh(geo,craftSurface('agedOak','#c3b7a2'),0,0,0,parent);
 if(lash)for(const t of [.16,.50,.84]){
  const at=curve.getPointAt(t),axis=curve.getTangentAt(t),joint=landmarkGroup(parent,at.x,at.y,at.z);
  joint.quaternion.setFromUnitVectors(V3(0,1,0),axis);
  const coils=[];for(let j=0;j<=54;j++){
   const a=j*TAU/12;coils.push(V3((r+.043)*Math.cos(a),(j/54-.5)*r*2.05,(r+.043)*Math.sin(a)));
  }
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coils),54,.047,5,false),craftSurface('reed','#c5b48a'),0,0,0,joint);
 }
}
function hallFrame(g,forge){
 // An open south wall lets the camera look under the full-length coopered roof.
 const point=(a,z)=>V3(10.30*Math.sin(a),3.98+4.80*Math.cos(a),z);
 const staves=30,end=Math.PI/2;
 const tympanum=new THREE.Shape();tympanum.moveTo(-10.30,4.03);
 for(let j=1;j<=48;j++){const angle=-Math.PI/2+j*Math.PI/48;tympanum.lineTo(10.30*Math.sin(angle),4.03+4.80*Math.cos(angle));}
 tympanum.closePath();
 for(const x of [-3.66,3.66]){
  const opening=new THREE.Path();opening.moveTo(x-.75,6.27);opening.lineTo(x+.75,6.27);opening.lineTo(x+.75,7.41);opening.lineTo(x-.75,7.41);opening.closePath();
  tympanum.holes.push(opening);fernWindowBay(g,x,-7.48,1.50,1.14,0,6.84);
 }
 const gable=new THREE.ShapeGeometry(tympanum,24),guv=gable.attributes.uv;
 for(let i=0;i<guv.count;i++)guv.setXY(i,guv.getX(i)*.29,guv.getY(i)*.29);
 mesh(gable,craftSurface('planedOak','#afa697'),0,0,-7.54,g);
 // The truss follows the inside face of the gable and ends at the collar.
 hallTimber(g,[V3(-8.53,5.95,-7.25),V3(-5.12,7.28,-7.25),V3(0,8.40,-7.25),V3(5.12,7.28,-7.25),V3(8.53,5.95,-7.25)],.13);
 for(const x of [-7.88,-5.68,-2.49,0,2.49,5.68,7.88]){
  const h=4.03+4.75*Math.sqrt(1-(x/10.3)**2);
  dressedBlock(g,x,(h+4.08)/2,-7.36,.13,h-4.08,.18,'agedOak','#afa38a',1.9);
 }
 for(let i=0;i<staves;i++){
  const a=point(-end+i*Math.PI/staves,0),b=point(-end+(i+1)*Math.PI/staves,0);
  const plank=dressedBlock(g,(a.x+b.x)/2,(a.y+b.y)/2,-.40,Math.hypot(b.x-a.x,b.y-a.y)+.022,.13,15.34,'reed',['#928575','#a2967d','#887f70'][i%3],1.71);
  plank.rotation.z=Math.atan2(b.y-a.y,b.x-a.x);plank.castShadow=false;
 }
 for(const z of [-7.41,-4.10,-.66,2.87,6.81]){
  const arc=Array.from({length:15},(_,i)=>point(-end+Math.PI*i/14,z));
  for(const p of arc)p.y-=.17;
  hallTimber(g,arc,.24,true);
  for(const sign of [-1,1]){
   const x=sign*9.76;
   hallTimber(g,[V3(x,.18,z),V3(x,2.44,z),V3(sign*9.48,4.65,z),V3(sign*8.68,5.86,z)],.29,true);
   hallTimber(g,[V3(x,3.04,z),V3(sign*9.04,4.21,z+.18),V3(sign*8.28,5.51,z+.33),V3(sign*7.03,6.86,z+.32)],.15);
   dressedBlock(g,x,.30,z,.59,.58,.68,'ashlar','#aaa496',1.7);
  }
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
 for(const x of [-7.36,-3.72,3.72,7.36]){
  const w=3.12,h=1.35;
  dressedBlock(g,x,5.10,-7.35,w,h,.16,'reed','#938a73',2.15);
  for(const dir of [-1,1])for(let k=-4;k<=4;k++){
   const x0=Math.max(-w/2,k*.44-h/2),x1=Math.min(w/2,k*.44+h/2);
   if(x1>x0)beam(V3(x+x0,5.10+dir*(x0-k*.44),-7.20),V3(x+x1,5.10+dir*(x1-k*.44),-7.20),.024,'darkWood','#93816b',g);
  }
 }
 const pediment=landmarkGroup(g,0,4.86,-7.07);
 const arch=new THREE.Shape();arch.moveTo(-2.94,0);arch.lineTo(-2.94,.54);
 arch.quadraticCurveTo(-1.62,1.79,0,1.93);arch.quadraticCurveTo(1.62,1.79,2.94,.54);arch.lineTo(2.94,0);arch.closePath();
 const board=new THREE.ExtrudeGeometry(arch,{depth:.15,bevelEnabled:true,bevelSegments:2,bevelSize:.045,bevelThickness:.04});
 const bp=board.attributes.position,bu=board.attributes.uv;
 for(let i=0;i<bp.count;i++)bu.setXY(i,clamp((bp.getX(i)+2.94)/5.88,.002,.998),clamp(bp.getY(i)/1.93,.002,.998));
 mesh(board,craftSurface('carvedFern','#e1d6bd'),0,0,0,pediment);
 for(const y of [.10,.29])box(0,y,.18,5.94,.10,.15,'darkWood','#746052',pediment);
 for(const s of [-1,1]){
  hallTimber(pediment,[V3(s*2.91,.54,.19),V3(s*2.15,1.13,.20),V3(s*1.12,1.65,.20),V3(0,1.91,.20)],.057);
 }
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
 const g=landmarkGroup(world,x,0,z),segments=9,r=w*.5;
 const nose=u=>.48+.72*(1-u*u);
 function apron(y,h,lip,tone){
  const shape=new THREE.Shape();shape.moveTo(-r-lip,.78+lip);shape.lineTo(r+lip,.78+lip);
  for(let i=0;i<=segments;i++){
   const u=1-2*i/segments;shape.lineTo(u*(r+lip),-nose(u)-lip);
  }
  shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelThickness:.035,bevelSize:.04,bevelSegments:2});
  const p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+r)/(2*r),(p.getY(i)+1.24)/2.04);
  geo.rotateX(-Math.PI/2);
  // Place the actual top in the room's support layer so the normal prop
  // support and placement checks can raycast it along with other tabletops.
  if(y>1){const top=mesh(geo,craftSurface('planedOak',tone),x,y,z,world);top.name='Polished counter top';}
  else mesh(geo,craftSurface('planedOak',tone),0,y,0,g);
 }
 apron(.12,1.25,0,'#a99174');apron(.07,.16,.07,'#817765');apron(1.40,.11,.17,'#d1bd9c');
 for(let i=0;i<segments;i++){
  const u=-1+(2*i+1)/segments,dx=u*r,front=nose(u),bay=landmarkGroup(g,dx,.72,front,Math.atan(1.44*u/r));
  const width=w/segments*Math.hypot(1,1.44*u/r);
  dressedBlock(bay,0,0,.033,width*.89,.88,.052,i===4?'carvedFern':'reed',i===4?'#d0bea0':'#aa997e',i===4?0:1.52);
  for(const y of [-.42,.42])dressedBlock(bay,0,y,.085,width,.07,.085,'planedOak','#a49177',1.4);
  dressedBlock(bay,width*.5,0,.059,.083,1.2,.12,'agedOak','#b7a385',1.5);
  obstacle(x+dx,z+(front-.78)/2,w/segments,front+.78,'merchant counter');
 }
}
function guestCurtain(g,x,z,sign){
 const geo=new THREE.PlaneGeometry(1,1,10,12),pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const u=pos.getX(i)+.5,v=.5-pos.getY(i),gather=.18+.82*Math.min(1,Math.abs(v-.69)*2.45);pos.setXYZ(i,sign*(.04+(u-.06)*.99*gather),4.0-v*3.43,.12*Math.sin(5*Math.PI*u)*gather+.06*Math.sin(v*3));}
 geo.computeVertexNormals();mesh(geo,craftSurface('loomLinen','#e9e3d3'),x,0,z,g);
 box(x+sign*.14,1.63,z+.02,.35,.10,.20,'canvas86','#cbb68c',g);
}
function canopyHearth(g,x,z,forge){
 const bed=landmarkGroup(g,x,0,z);
 masonryHearth163(bed,{key:'hearth29',tint:forge?'#929088':'#b7a28a',forge,region:'fern',scale:1.47});
 world.userData.roomFlame29=environmentFire163(world,forge?'forge':'inn',x,.43,z+.10,forge?1.55:1.02);
 world.userData.roomHearth29=V3(x,1.8,z+1.3);obstacle(x,z,4.82,2.42,'stone hearth');
}
function innFixtures(g){
 canopyHearth(g,-6.65,-5.45,false);fernCounter(.1,-4.13,5.05);
 // Built-in wall storage continues behind the desk and ends at the chimney.
 stockedRoomShelf66(-3.48,-7.07,2.16,1);
 for(const x of [-1.60,-.81,-.02,.77,1.56])dressedBlock(g,x,2.24,-7.27,.77,4.36,.17,'planedOak','#b1a38c',1.52);
 dressedBlock(world,.02,3.65,-6.97,3.86,.15,.64,'agedOak','#c1b394',2.15);
 roomBooks29(-1.46,3.725,-6.92,5,9);
 dressedBlock(g,1.25,3.03,-6.79,.68,.97,.055,'sageLinen','#ddd8c0',0);
 const rack=landmarkGroup(g,.15,2.56,-7.18);box(0,0,0,3.35,.83,.13,'wood','#b99b77',rack);
 for(let i=0;i<6;i++){const x=(i-2.5)*.46;beam(V3(x,.11,0),V3(x,.15,.25),.046,'bronze','#cca866',rack);landmarkHoop(rack,x,-.10,.21,.12,.032);box(x,-.30,.21,.061,.24,.055,'bronze','#ceac68',rack);box(x+.051,-.38,.21,.13,.07,.06,'bronze','#ceac68',rack);}
 for(const side of [-1,1]){const page=roomPart66('Open guest register',-.42+side*.25,1.64,-4.02,.52,.10,.62,'plaster','#e4d4ad');page.rotation.z=side*.10;}
 roomPlant29(1.47,1.55,-4.14,1.12,true);roomLantern66(-1.57,1.55,-4.19);
 for(const [x,z,r] of [[-6.55,-.62,1.11],[-6.76,2.82,1.03]]){
  const carpet=mesh(new THREE.CircleGeometry(r*2.04,42),craftSurface('sageLinen','#b1a48b'),x,.023,z,g);carpet.rotation.x=-Math.PI/2;
  for(const rr of [1.87,1.97])landmarkHoop(g,x,.032,z,r*rr,.024,'canvas86','#ac9d81').rotation.x=Math.PI/2;
  roomTable29(x,z,r);
  const top=world.children.find(o=>o.isMesh&&o.position.x===x&&o.position.z===z&&o.position.y===1.05);
  if(top)top.material=craftSurface('planedOak','#b7a990');
 }
 guestWing(g);
 const mantel=landmarkGroup(g,-6.65,0,-5.45);
 dressedBlock(mantel,0,3.16,.38,4.58,.25,1.68,'ashlar','#9b9786');
 for(const s of [-1,1])dressedBlock(mantel,s*1.91,2.79,.75,.32,.64,.58,'ashlar','#888477');
 const keys=landmarkGroup(g,.1,0,-7.01);
 for(const s of [-1,1]){
  dressedBlock(keys,s*1.99,2.32,-.02,.25,3.52,.31,'wood','#88765d');
  dressedBlock(keys,s*1.71,3.70,.09,.67,.12,.42,'wood','#baab8b');
 }
 dressedBlock(keys,0,4.10,.02,4.18,.19,.57,'wood','#988366');
 for(const side of [-1,1])guestCurtain(keys,side*2.02,0,-side);
 dressedBlock(g,.12,.035,4.57,3.45,.055,2.03,'reed','#a49479',2.67);
 dressedBlock(g,.12,.070,4.57,3.18,.030,1.78,'sageLinen','#cfbfa2',0);
 for(const [x,z,size] of [[-8.56,-3.9,1.36]]){
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
 weaponRack66(4.65,-6.93,3.76);
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
 // A riveted, convex shield hangs in front of the sword board.
 const shield=landmarkGroup(g,4.62,3.02,-6.55);
 const bowl=new THREE.LatheGeometry([[.01,.27],[.28,.25],[.60,.19],[.88,.04],[.94,0],[.96,-.09]].map(([u,v])=>new THREE.Vector2(u,v)),32);
 bowl.rotateX(Math.PI/2);const steel=new THREE.MeshStandardMaterial({color:'#8c9897',roughness:.54,metalness:.19,side:THREE.DoubleSide});
 mesh(bowl,steel,0,0,0,shield);
 landmarkHoop(shield,0,0,.025,.92,.065,'bronze','#b5a17a');
 landmarkHoop(shield,0,0,.24,.38,.028,'bronze','#a99a78');
 const boss=mesh(geo16('smith-boss',()=>new THREE.SphereGeometry(.25,16,10)),material('metal','#a4aa9d'),0,0,.265,shield);boss.scale.z=.51;
 for(let i=0;i<12;i++){const a=TAU*i/12;landmarkBoulder(shield,.80*Math.sin(a),.80*Math.cos(a),.09,.042,.042,.036,'metal','#c0ab84',a);}
 for(let i=0;i<9;i++){
  const a=(i+.5)*Math.PI/9,wedge=dressedBlock(g,-5.95+1.27*Math.cos(a),1.37+1.13*Math.sin(a),-4.46,.49,.43,.52,'ashlar',i%3?'#87857b':'#a19b89',1.18);wedge.rotation.z=a-Math.PI/2;
 }
 for(const side of [-1,1])for(let i=0;i<3;i++)dressedBlock(g,-5.95+side*1.29,.41+i*.37,-4.46,.46,.34,.53,'ashlar','#858377',1.27);
 // The flared smoke chamber feeds directly into the narrower masonry flue.
 const mantle=new THREE.CylinderGeometry(1.07,2.19,2.53,4,1,false);mantle.rotateY(Math.PI/4);
 const bell=mesh(mantle,craftSurface('laidFlags','#c8c4b5'),-5.95,3.81,-6.02,g);bell.scale.z=.92;
 dressedBlock(g,-5.95,2.54,-6.02,3.41,.20,3.19,'laidFlags','#b6b3a3',2.16);
 const apronMat=craftSurface('laidFlags','#b2afa1');apron.material=apronMat;
 const forgeMat=craftSurface('ashlar','#948e81');
 for(const [x,z,r] of [[-5.24,-1.63,2.19],[-5.8,2.80,1.66]]){
  const ring=landmarkHoop(g,x,.11,z,r,.049,'rock','#8f8876');ring.material=forgeMat;ring.rotation.x=Math.PI/2;
 }
 // Low ash bin next to the fire mouth, with a bellows nozzle feeding the hearth.
 const blast=landmarkGroup(g,-8.25,0,-4.68,.20);
 dressedBlock(blast,0,.24,0,1.14,.47,.95,'agedOak','#84735d',1.6);
 for(let i=0;i<4;i++)landmarkBoulder(blast,0,.50+i*.09,0,.56-i*.036,.14,.42,'hide','#7e6450',0);
 beam(V3(.27,.69,0),V3(1.05,.74,-.12),.078,'metal','#7d827d',blast);
 beam(V3(-.37,.85,0),V3(-.72,.96,.06),.065,'wood','#958363',blast);
 obstacle(-8.25,-4.68,1.14,.95,'forge bellows');
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
 stockedRoomShelf66(-6.82,-7.05,4.65,2);stockedRoomShelf66(-1.54,-13.62,4.55,1);stockedRoomShelf66(6.8,-7.05,4.70,5);
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
 const display=landmarkGroup(g,3.68,0,-4.95);
 const sail=new THREE.PlaneGeometry(7.35,2.65,24,12),sailPos=sail.attributes.position;
 for(let i=0;i<sailPos.count;i++){const x=sailPos.getX(i),z=sailPos.getY(i),u=x/7.35+.5,v=z/2.65+.5;sailPos.setXYZ(i,x,5.48-.66*Math.sin(Math.PI*u)-.22*Math.sin(Math.PI*v)+.066*Math.cos(24*u),z);}
 sail.computeVertexNormals();mesh(sail,craftSurface('loomLinen','#eee7d5'),0,0,0,display);
 for(const sx of [-3.57,3.57])beam(V3(sx,5.48,1.24),V3(sx,6.28,1.33),.035,'canvas86','#b5a684',display);
 const ropePoint=(u,v)=>V3(-3.60+7.20*u,5.46+.08*v-.66*Math.sin(u*Math.PI)-.22*Math.sin(v*Math.PI),1.32-2.64*v);
 for(let j=0;j<42;j++){
  const p=ropePoint((j+.5)/42,0),tip=p.clone().add(V3(.03,-.23-.075*Math.cos(j*.91),.08));
  beam(p,tip,.024,'canvas86','#e1d6bb',display);
 }
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
 const seal=landmarkGroup(g,.35,.084,1.38);seal.rotation.x=-Math.PI/2;
 for(const r of [1.40,1.49])landmarkHoop(seal,0,0,0,r,.030,'wood','#bcaa8a');
 fernCrest(seal,0,-.16,.014,.91);
 // Crockery and folded goods fill the side bays between window openings.
 for(const [side,z] of [[1,-2.92],[-1,.15]]){
  const rack=landmarkGroup(g,side*9.58,0,z,-side*Math.PI/2);
  for(const u of [-1.15,1.15])dressedBlock(rack,u,1.76,0,.13,3.48,.43,'agedOak','#94866e',1.68);
  for(const y of [1.68,2.69]){
   dressedBlock(rack,0,y,0,2.50,.14,.64,'planedOak','#b4a68b',1.54);
   for(let j=0;j<4;j++){
    const u=-.83+j*.56,rr=.15+.035*((j+side+2)%3);
    landmarkDrum(rack,u,y+.07,.025,rr*.63,rr,.19,'clay',j%2?'#b79c7b':'#9ca99f',14);
    landmarkDrum(rack,u,y+.26,.025,rr,rr*.73,.10,'clay',j%2?'#b79c7b':'#9ca99f',14);
   }
  }
 }
 const draper=landmarkGroup(g,8.53,0,1.56,Math.PI/2);
 dressedBlock(draper,0,.48,0,3.8,.90,1.22,'wood','#a39273',2.33);
 for(let i=0;i<4;i++){
  const x=-1.28+i*.83;
  for(let j=0;j<2+(i%2);j++)dressedBlock(draper,x+.036*j,1.01+j*.14,0,.77,.139,1.09,j===1?'embroidery':'reed',['#a3afa0','#bfab8b','#a49179','#c3b293'][i],0);
 }
}
function fernWindowLight(g,forge){
 // Each soft-edged pool is cast from a modeled side-wall opening. The leads
 // divide the light into panes, which fade with the normal day/night cycle.
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{day:interior66.day},
 vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec2 v;uniform float day;void main(){vec2 p=v;float edge=smoothstep(0.,.075,p.x)*smoothstep(0.,.075,1.-p.x)*smoothstep(0.,.09,p.y)*smoothstep(0.,.09,1.-p.y);vec2 lead=abs(fract(p*vec2(3.,4.))-.5);float bars=1.-smoothstep(.415,.495,max(lead.x,lead.y));gl_FragColor=vec4(.94,.82,.61,edge*(.045+.20*bars)*day);}`});
 for(const [side,z] of [[-1,-3.8],[-1,3.6],[1,2.9]]){
  const panel=landmarkGroup(g,side*9.85,3.5,z,-side*Math.PI/2);
  for(const dz of [-.47,.47])box(dz,0,0,.061,2.29,.09,'metal','#776f5d',panel);
  for(const y of [-.58,.58])box(0,y,0,1.48,.066,.09,'metal','#776f5d',panel);
  if(side>0)continue;
  const geo=new THREE.PlaneGeometry(1,1);const p=geo.attributes.position;
  for(let j=0;j<p.count;j++){const u=p.getX(j)+.5,v=p.getY(j);p.setXYZ(j,side*(8.35-u*4.10),forge?.135:.096,z+.43+u*1.10+v*(1.79+u*.34));}
  m.side=THREE.DoubleSide;
  const light=mesh(geo,m,0,0,0,world);light.name='Daylight through the leaded panes';light.userData.dynamicFX=true;light.castShadow=light.receiveShadow=false;
 }
}
function fernFixtureContact(inn,forge){
 const contact=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 v;void main(){vec2 q=abs(v*2.-1.);float a=1.-smoothstep(.31,1.,pow(pow(q.x,3.)+pow(q.y,3.),.3333));gl_FragColor=vec4(.12,.105,.082,a*.34);}'});
 const pads=inn?[[.1,-4.13,5.38,2.74],[-6.55,-.62,3.1,2.86],[-6.76,2.82,3.06,2.87]]:
  forge?[[4.1,-4.2,6.45,2.77],[-5.95,-5.45,5.65,3.28],[-6.62,2.87,4.52,2.38],[-5.14,-1.45,2.95,2.18]]:
  [[4.2,-4.18,6.61,2.77],[-7.53,-.88,4.15,3.56],[8.53,1.56,2.06,4.47],[-1.54,-7.06,4.92,1.85]];
 for(const [x,z,w,d] of pads){
  const mat=mesh(new THREE.PlaneGeometry(w,d),contact,x,.035,z,world);mat.rotation.x=-Math.PI/2;mat.castShadow=mat.receiveShadow=false;mat.userData.dynamicFX=true;
 }
}
function buildFernThreshold(g,forge){
 // The camera looks through the open end of the hall. Seat the timberwork
 // into rubble footings and leave the full middle span for the entrance.
 for(const s of [-1,1]){
  const x=s*7.82,z=5.99,wing=landmarkGroup(g,x,0,z);
  for(let row=0;row<2;row++)for(let j=0;j<3;j++){
   const xx=s*(j*.62+.15),stone=dressedBlock(wing,xx,.23+row*.39,0,.62,.40,.80,'laidFlags',j%2?'#a8aaa1':'#b9b8aa',1.58);
   stone.rotation.y=.035*Math.sin(j+row);
  }
  hallTimber(wing,[V3(0,.54,0),V3(-s*.08,2.88,.04),V3(s*.24,4.44,0),V3(s*.83,5.60,-.23)],.27,true);
  hallTimber(wing,[V3(0,1.90,0),V3(s*.43,2.55,0),V3(s*1.36,2.70,.04)],.125);
  for(const yy of [1.02,1.67])hallTimber(wing,[V3(0,yy,0),V3(s*.79,yy-.13,.03),V3(s*1.66,yy+.09,.07)],.088);
  obstacle(x+s*.75,z,2.0,.80,'entrance wing wall');
  if(!forge){landmarkDrum(wing,s*.89,.82,0,.28,.44,.51,'clay','#918b70');gardenFern(wing,s*.89,1.30,0,1.13,s);}
 }
 for(let i=-3;i<=3;i++)dressedBlock(g,i*.81,.037,6.83,.79,.064,.98,'laidFlags',i%2?'#bdb9aa':'#a69e90',1.74);
}
// Solid walls and their collision have the same footprint. A room opening is
// the gap between two jambs and the curved underside of a real lintel.
function fernWall(g,x,z,w,d,h,key='limePlaster',tone='#d0c8af'){
 dressedBlock(g,x,h*.5,z,w,h,d,key,tone,2.02);
 dressedBlock(g,x,.30,z,w+.05,.60,d+.05,'laidFlags','#a5a397',1.78);
 obstacle(x,z,w,d,'room wall');
}
function fernWindowBay(g,x,z,width,height,angle=0,mid=3.37){
 const group=landmarkGroup(g,x,0,z,angle);
 const glass=box(0,mid,-.12,width,height,.05,'window','#dddaca',group);
 glass.material=roomWindowMaterial66();glass.castShadow=false;glass.userData.dynamicFX=true;
 // Keep the live glazing outside the static room batch.
 world.attach(glass);world.userData.windows66.push(glass);
 for(const sign of [-1,1]){
  dressedBlock(group,sign*width*.5,mid,0,.15,height+.30,.44,'agedOak','#ab9981',1.52);
  dressedBlock(group,0,mid+sign*height*.5,0,width+.31,.15,.49,'agedOak','#bfac90',1.73);
 }
 for(const u of [-.25,0,.25])box(width*u,mid,.055,.055,height,.085,'metal','#776c58',group);
 for(const q of [-.25,.15])box(0,mid+q*height,.055,width,.048,.085,'metal','#776c58',group);
}
function buildFernEnvelope(id){
 const forge=fernRoomSpecs[id].category==='equipment',g=landmarkGroup(world);
 g.userData.interiorFixture29=true;world.userData.windows66=[];
 for(const side of [-1,1]){
  const x=side*10.30,openings=side<0?[-10.52,-3.80,3.60]:[-10.65,2.90];
  let from=-14.26;
  for(const z of openings){
   const a=z-1.24,b=z+1.24;
   fernWall(g,x,(from+a)/2,.37,a-from,7.55);
   const pane=landmarkGroup(g,x,0,z,-side*Math.PI/2);
   dressedBlock(pane,0,.98,0,2.52,1.96,.39,'agedOak','#a69a80',2.33);
   dressedBlock(pane,0,6.04,0,2.52,3.03,.39,'loomLinen','#bdb09a',1.94);
   obstacle(x,z,.37,b-a,'window wall');
   fernWindowBay(g,x,z,2.44,2.57,-side*Math.PI/2);from=b;
  }
  fernWall(g,x,(from+7.66)/2,.37,7.66-from,7.55);
 }
 // Rear windows light the rooms on the far side of the partitions.
 let from=-10.4;
 for(const x of [-6.80,.75,6.72]){
  const a=x-1.12,b=x+1.12;
  fernWall(g,(from+a)/2,-14.22,a-from,.45,6.38,forge?'laidFlags':'loomLinen');
  dressedBlock(g,x,1.02,-14.22,b-a,2.04,.45,'agedOak','#a99a82',1.95);
  dressedBlock(g,x,5.54,-14.22,b-a,1.79,.45,'loomLinen','#b6ae98',1.95);
  obstacle(x,-14.22,b-a,.45,'rear window wall');fernWindowBay(g,x,-14.18,b-a,2.58);from=b;
 }
 fernWall(g,(from+10.4)/2,-14.22,10.4-from,.45,6.38);
 // Join the long nave to the lower roof of the rear wing.
 for(const x of [-7.3,-2.47,2.47,7.3]){
  const slope=dressedBlock(g,x,6.36,-10.95,5.03,.20,6.70,'agedOak','#a1957f',1.93);slope.rotation.x=-.10;
 }
 for(const x of [-8.8,-5.3,-1.8,1.8,5.3,8.8])
  hallTimber(g,[V3(x,6.10,-13.97),V3(x,6.28,-11.05),V3(x,6.52,-7.7)],.14);
}
function fernRoomArch(g,cx,z,w,rise,forge,curtains=false){
 const half=w*.5,spring=2.30,height=spring+rise+.74;
 const shape=new THREE.Shape();
 shape.moveTo(-half,0);shape.lineTo(-half,spring);
 shape.absellipse(0,spring,half,rise,Math.PI,0,true,0);
 shape.lineTo(half,height);shape.lineTo(-half,height);shape.closePath();
 const lintel=new THREE.ExtrudeGeometry(shape,{depth:.50,curveSegments:20,bevelEnabled:false});
 mesh(lintel,craftSurface(forge?'laidFlags':'planedOak',forge?'#b7b8ac':'#ad9e83'),cx,0,z-.28,g);
 for(const side of [-1,1]){
  const x=cx+side*(half+.13);
  fernWall(g,x,z,.28,.68,height,forge?'laidFlags':'agedOak','#a59a86');
  hallTimber(g,[V3(x,.17,z+.23),V3(x,1.45,z+.28),V3(cx+side*half,2.48,z+.31),V3(cx+side*half*.78,spring+rise*.74,z+.33),V3(cx+side*half*.36,spring+rise*.95,z+.35),V3(cx,spring+rise+.09,z+.32)],forge?.11:.16,!forge);
  if(curtains)guestCurtain(g,x,z+.28,-side);
 }
 dressedBlock(g,cx,height+.025,z,w+.58,.12,.68,'agedOak','#9c8c73',2.37);
 // Flush spandrel joinery sits above the arch; the passage itself stays open.
 for(const sign of [-1,1]){
  hallTimber(g,[V3(cx+sign*(half+.10),spring+.77,z+.28),V3(cx+sign*half*.81,spring+rise+.14,z+.30),V3(cx+sign*.30,height-.15,z+.30)],.071);
 }
}
function guestWing(g){
 const rooms=[[3.06,-6.10],[5.96,-3.96],[8.86,-1.82]],w=2.90,right=10.31;
 fernWall(g,-4.19,-7.60,11.61,.34,5.09);
 for(const [x,front] of rooms){
  const left=x-w/2,back=-13.92,depth=front-back;
  fernWall(g,left,(front+back)/2,.29,depth,4.70,'limePlaster','#c8bda6');
  fernRoomArch(g,x,front,w-.50,1.61,false,true);
  const eave=front+(-7.54-front)*.5;
  for(const sign of [-1,1])dressedBlock(g,x+sign*w*.47,4.67,eave,.21,.25,Math.abs(front+7.54)+.10,'agedOak','#928774',2.22);
  for(let i=0;i<9;i++){
   const xx=(i-4)/9*w,archY=.43*Math.cos(xx/w*Math.PI);
   dressedBlock(g,x+xx,4.79+archY,eave,w/9+.02,.13,Math.abs(front+7.54)+.20,'reed','#a19884',1.9);
  }
  const vault=new THREE.PlaneGeometry(1,1,18,7),p=vault.attributes.position;
  for(let i=0;i<p.count;i++){const u=p.getX(i)*Math.PI,a=p.getY(i)+.5;
   p.setXYZ(i,w*.50*Math.sin(u),2.65+1.62*Math.cos(u),back+a*depth);}
  vault.computeVertexNormals();mesh(vault,craftSurface('loomLinen','#c4bba6'),x,0,0,g);
  for(const z of [back+.55,front-depth*.48]){
   const arc=Array.from({length:15},(_,i)=>{const a=i*Math.PI/14;return V3(x+w*.49*Math.cos(a),2.61+1.62*Math.sin(a),z);});
   hallTimber(g,arc,.10);
  }
  // A bed takes one side of the deep chamber. Its near jamb and the
  // transverse partition screen the sleeping space from the common hall.
  const across=x<4,bedX=across?x:x+.57,bedZ=back+(across?1.94:2.50);
  const bed=landmarkGroup(g,bedX,0,bedZ,across?Math.PI/2:0);
  bed.scale.set(across?1:.82,1,across?.81:.91);
  dressedBlock(bed,0,.36,0,1.47,.38,2.96,'planedOak','#c2b49a',1.54);
  dressedBlock(bed,0,.68,0,1.43,.27,2.89,'loomLinen','#e4dcca',2.5);
  dressedBlock(bed,0,.76,-1.48,1.52,.85,.15,'carvedFern','#c5b59d',0);
  const pillow=mesh(geo16('fern-bed-pillow',()=>new THREE.SphereGeometry(1,18,12)),craftSurface('loomLinen','#efe5d1'),0,.88,-.96,bed);pillow.scale.set(.56,.12,.35);
  const quilt=new THREE.PlaneGeometry(1,1,20,12),qp=quilt.attributes.position;
  for(let i=0;i<qp.count;i++){
   const u=qp.getX(i)*2,v=qp.getY(i)+.5,edge=Math.max(0,Math.abs(u)-.76)/.24;
   qp.setXYZ(i,Math.sign(u)*(.71*Math.min(1,Math.abs(u)/.76)+.066*edge),.844-.31*edge+.018*Math.cos(v*17+u*2),-.53+1.95*v);
  }
  quilt.computeVertexNormals();mesh(quilt,craftSurface('sageLinen','#e2dcc3'),0,0,0,bed);
  obstacle(bedX,bedZ,across?2.51:1.25,across?1.53:2.82,'guest bed');
  const end=x-.71;
  dressedBlock(world,end,.43,back+.69,.76,.83,.72,'agedOak','#b9ac95',1.62);
  roomLantern66(end,.87,back+.69);obstacle(end,back+.69,.76,.72,'bedside cabinet');
  const sash=landmarkGroup(g,left+.15,0,front-1.23,Math.PI/2);
  for(const y of [.77,2.93])dressedBlock(sash,0,y,0,2.16,.14,.13,'agedOak','#af9f87',1.72);
  // A shallow peg shelf and a folded coverlet fit against the inner wall.
  const linen=landmarkGroup(g,left+.16,0,-8.03,Math.PI/2);
  dressedBlock(linen,0,2.64,0,1.85,.14,.59,'planedOak','#b8aa94',1.66);
  for(const side of [-1,1]){
   beam(V3(side*.65,2.27,0),V3(side*.65,2.59,.24),.055,'darkWood','#a59579',linen);
   dressedBlock(linen,side*.40,2.79,0,.70,.16,.49,'sageLinen','#d3c8ad',0);
  }
  for(const u of [-.58,0,.58])landmarkDrum(linen,u,2.28,.085,.06,.075,.17,'agedOak','#ab947a',8);
 }
 fernWall(g,right,(-1.82-13.92)/2,.25,12.10,4.69);
 // Stepped partitions let each private chamber open directly onto the hall.
 for(let i=1;i<rooms.length;i++){
  const [x,front]=rooms[i],last=rooms[i-1][1];
  fernWall(g,x-w/2,(last+front)/2,.30,front-last,4.68,'limePlaster','#b9ac93');
 }
 for(const [x,front] of rooms){
  dressedBlock(g,x,.033,front+.35,1.48,.047,.85,'reed','#b6a284',2.12);
  const peg=landmarkGroup(g,x+w*.36,1.67,front+.28);
  dressedBlock(peg,0,.12,0,.20,.31,.07,'bronze','#a18e66');
 }
 world.userData.fernBays=[['west guest room',3.06,-9.65],['middle guest room',5.60,-9.04],['east guest room',8.39,-9.04]];
}
function fernTradeRoom(g,forge){
 const cx=forge?-.68:-2.17,half=forge?1.91:1.67,z=-7.40;
 const left=cx-half-.26,right=cx+half+.26;
 fernWall(g,(-10.12+left)/2,z,left+10.12,.51,5.00,forge?'laidFlags':'agedOak');
 fernWall(g,(10.12+right)/2,z,10.12-right,.51,5.00,forge?'laidFlags':'agedOak');
 fernRoomArch(g,cx,z,half*2,forge?1.87:1.51,forge);
 // Shelving and wall returns lead the eye from the portal into a room
 // occupied on three sides, leaving a person-wide aisle to the back.
 const ax=cx-2.78,bx=cx+3.65;
 for(const x of [ax,bx])fernWall(g,x,-10.75,.32,6.69,5.00,forge?'laidFlags':'agedOak','#a89d87');
 const bench=landmarkGroup(g,ax+.51,0,-10.87);
 dressedBlock(world,ax+.51,.88,-10.87,.86,.21,3.52,'planedOak','#bdad91',1.78);
 for(const s of [-1,1])dressedBlock(bench,0,.41,s*1.40,.62,.81,.24,'agedOak','#998d78');
 obstacle(ax+.51,-10.87,.86,3.52,'stockroom bench');
 if(forge){
  forgeTool66(ax+.51,.99,-10.57,.57);roomBag66(bx-.79,0,-9.61,.91);
  const rack=landmarkGroup(g,cx+.06,0,-13.64);
  dressedBlock(rack,0,1.92,0,4.20,3.73,.17,'planedOak','#a99e89',1.94);
  for(const y of [.41,1.22,3.36])dressedBlock(rack,0,y,.15,4.32,.14,.41,'agedOak','#beae97',2.45);
  for(let i=0;i<5;i++){
   const x=-1.63+i*.81,y=3.15-(i%2)*.17;
   box(x,y,.29,.06,.11,.20,'bronze','#ab916e',rack);
   beam(V3(x,y,.36),V3(x+.085,y-1.12,.36),.061,i%2?'wood':'metal','#9f9486',rack);
   if(i%2)box(x+.07,y-1.12,.36,.48,.22,.24,'metal','#929799',rack);
   else for(const sign of [-1,1])beam(V3(x+.04,y-.47,.35),V3(x+sign*.16,y-1.38,.35),.041,'metal','#9ba5a4',rack);
   dressedBlock(rack,x,.56,.20,.64,.13,.26,'iron102','#949da1',1.13);
  }
 }
 else{for(let j=-1;j<=1;j++)roomBottle29(ax+.51,.99,-10.87+j*.72,j+2,1.13);}
 for(const sign of [-1,1]){
  const at=cx+sign*(half+.62);
  dressedBlock(world,at,2.53,z+.41,.76,.20,.74,'planedOak','#c1b399',1.92);
  beam(V3(at,2.03,z+.21),V3(at,2.48,z+.66),.077,'darkWood','#9d8d77',g);
  roomLantern66(at,2.65,z+.44);
 }
 roomLantern66(cx,3.06,-12.8);
 beam(V3(cx,3.90,-12.8),V3(cx,6.22,-12.8),.023,'metal','#a39982',g);
 world.userData.fernBays=[[forge?'smith’s finishing room':'provision stockroom',cx,-11.84]];
}
function buildFernFixtures(id){
 const spec=fernRoomSpecs[id],inn=spec.type==='inn',forge=spec.category==='equipment';
 const floor=world.userData.terrain,geo=floor.geometry.clone(),uv=geo.attributes.uv,source=forge?'ruinSlabs101':'oakBoards102';
 for(let i=0;i<uv.count;i++){
  const u=uv.getX(i),v=uv.getY(i);
  uv.setXY(i,forge?u*7:v*13.5,forge?v*5.4:u*3.40);
 }
 const surface=settlementSurfaces.get(forge?'laidFlags':'planedOak')??environment102.maps.get(source);
 floor.geometry=geo;floor.material=new THREE.MeshStandardMaterial({map:surface,bumpMap:surface,bumpScale:forge?.035:.019,color:forge?'#bbbcb1':'#c4bcb3',roughness:.89});
 floor.material.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat woodValue=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)); diffuseColor.rgb=mix(vec3(woodValue),diffuseColor.rgb,.31)*1.19;');
 };
 const g=landmarkGroup(world);g.name='Fern Hollow joinery';g.userData.interiorFixture29=true;hallFrame(g,forge);fernWindowLight(g,forge);
 if(inn)innFixtures(g);else if(forge)smithFixtures(g);else supplyFixtures(g);
 if(!inn)fernTradeRoom(g,forge);
 buildFernThreshold(g,forge);fernFixtureContact(inn,forge);
 // The common cutaway shell provides window openings. Finish its exposed oak
 // and lath with the room's aged surfaces before the static geometry is batched.
 for(const o of world.children){
  if(!o.isMesh||!o.name||o.userData.dynamicFX)continue;
  if(/wall panel|wall infill|cutaway wall pier|wall below|wall above|wall section|back wall|side wall|wainscot|structural wall post|shelf back|shelf upright|shelf provisions|stocked timber shelf|timber rail|weapon display backing|rack crossbar/i.test(o.name)){
   const stone=forge&&/wall section|infill/i.test(o.name);
   o.material=craftSurface(stone?'ashlar':'silverCedar',stone?'#a5a296':/shelf|weapon|wainscot/i.test(o.name)?'#b8a999':'#c3b6a5');
  }
 }
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
 let surface=detailedStone105(kind);
 if(activeScene.key==='depths'){
  const materials=world.userData.remnantStone??=new Map();
  if(!materials.has(kind)){
   const rock=surface.clone();rock.onBeforeCompile=surface.onBeforeCompile;rock.customProgramCacheKey=surface.customProgramCacheKey;
   rock.color.set(kind==='rockMoss'?'#949784':kind==='rockSlate'?'#989799':'#a3a09b');materials.set(kind,rock);
  }surface=materials.get(kind);
 }
 const o=mesh(geo,surface,x,y,z,parent);o.scale.set(w,h,d);o.rotation.y=variant;o.rotation.z=.09*Math.sin(variant);return o;
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
 for(let i=0;i<5;i++)dressedBlock(g,0,.32-i*.069,.93-i*.44,3.16,.14,.46,'ashlar',i%2?'#a8a899':'#b9b5a2',1.62);
 {
  // The reference threshold is a timber entrance let into the rock.
  // Put the jambs on the stone shoulders, clear of the working stair.
  const trim=landmarkGroup(g,0,0,-.32);
  const shelter=landmarkGroup(trim,0,0,-.74);
  // A short shingled weather hood is keyed into the hillside on the uphill side.
  // Recessed timber tunnel under a planted brow. Leave the lowest opening
  // unobstructed so the descending stone steps lead into actual shadow.
  for(let i=0;i<4;i++){
   const zz=.90-i*.88;
   for(const s of [-1,1]){
    dressedBlock(shelter,s*1.94,1.43,zz,.28,2.86,.32,'agedOak','#82725b',1.61);
    hallTimber(shelter,[V3(s*1.93,2.49,zz),V3(s*1.58,3.12,zz),V3(s*.73,3.62,zz),V3(0,3.75,zz)],.18);
   }
  }
  for(let i=-4;i<=4;i++){
   const xx=i*.54,cap=dressedBlock(shelter,xx,3.83-.135*i*i,-.02,.62,.23,3.38,'barkCourses','#a9a18a',2.2);
   cap.rotation.z=-.22*i;
   if(Math.abs(i)>1)gardenFern(shelter,xx,cap.position.y+.12,-.85,.39+.12*Math.abs(i),i);
  }
  for(const s of [-1,1]){
   dressedBlock(trim,s*2.18,.30,1.00,.65,.71,.66,'ashlar','#a3a18e');
   hallTimber(trim,[V3(s*2.18,.58,1.00),V3(s*2.15,1.88,1.00),V3(s*2.09,2.98,.99)],.19,true);
   hallTimber(trim,[V3(s*2.10,2.42,.98),V3(s*1.62,3.01,.98),V3(s*.76,3.75,.93),V3(0,4.08,.87)],.13);
   obstacle(x+s*2.18,z+.68,.62,.66,'entry footing');
  }
  for(const side of [-1,1]){
   boundTimber(trim,[V3(side*2.12,.10,.37),V3(side*2.13,1.47,.35),V3(side*1.82,2.75,.32),V3(side*1.02,3.46,.17),V3(0,3.80,.16)],.15);
   landmarkLamp(trim,side*2.21,1.76,.45,.36);
  }
  fernCrest(trim,0,3.45,1.02,.65);
 }
 obstacle(x-3,z-1.45,2.35,2.85,'cave rock');obstacle(x+3,z-1.45,2.35,2.85,'cave rock');
}
function remnantStage(x,z){
 const g=landmarkGroup(world,x,groundAt(x,z),z),rng=seeded(104752);
 const dx=2.42,dz=-.74,pedestal=landmarkGroup(g,dx,0,dz);
 const floor=world.userData.remnantWalk={x:x+dx,z:z+dz,courses:[],steps:[]};
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
 for(let course=0;course<2;course++){
  const inner=[1.78,3.72,5.55,7.30,9.75][course],outer=[3.69,5.51,7.28,9.72,12.52][course],n=14+course*4;
  const yTop=Math.max(.09,.34-course*.055);
  floor.courses.push({r:outer,y:g.position.y+yTop});
  for(let i=0;i<n;i++){
   const a=(i+course*.4)*TAU/n+.005,b=a+TAU/n-.011;
   const contour=new THREE.Shape();contour.absarc(0,0,outer,a,b,false);contour.absarc(0,0,inner,b,a,true);contour.closePath();
   const geo=new THREE.ExtrudeGeometry(contour,{depth:.12,bevelEnabled:false,curveSegments:20});geo.rotateX(-Math.PI/2);
   const tint=['#bbb29e','#c5bead','#aeaa9a','#aba799','#aaa69a'][(i*3+course)%5];
   const stoneTile=craftSurface(course<2?'rockLimestone':'laidFlags',tint);
   const p=geo.attributes.position,uv=geo.attributes.uv;
   for(let k=0;k<p.count;k++)uv.setXY(k,p.getX(k)*.23+.21,p.getZ(k)*.23+.35);
   mesh(geo,stoneTile,0,yTop-.12,0,pedestal);
  }
 }
 for(const [r,y] of [[3.55,.354],[5.26,.301]]){const band=landmarkHoop(pedestal,0,y,0,r,.033,'bronze','#947d60');band.material=brass;band.rotation.x=Math.PI/2;}
 // The vault occupies a rectangular excavation. Only the device stands
 // on a circular dais; the broad processional floor runs into the side nave.
 const flagColors=['#b1aea2','#a4a598','#bbb6a5','#abad9d'];
 const batches=flagColors.map(()=>({vertices:[],uv:[]}));
 const flagY=(dx,dz)=>Math.max(.052,groundAt(x+dx,z+dz)-g.position.y+.035);
 for(let row=0;row<15;row++){
  const zz=-13.9+row*1.9;
  for(let col=0;col<16;col++){
   const xx=-18.4+col*2.5+(row%2)*1.16;
   if(Math.hypot(xx-dx,zz-dz)<3.18)continue;
   const left=xx-1.23,right=xx+1.23,back=zz-.93,front=zz+.93;
   const notch=.07+.12*(.5+.5*Math.sin(col*2.44+row));
   const poly=[[left+notch,back],[right-.11,back],[right,back+.15],[right,front-notch],[right-notch,front],[left+.08,front],[left,front-.13],[left,back+notch]];
   const buf=batches[(row*7+col*3)%4];
   for(let j=0;j<poly.length;j++){
    for(const [u,v] of [[xx,zz],poly[(j+1)%poly.length],poly[j]]){
     buf.vertices.push(u,flagY(u,v),v);buf.uv.push(u*.20+.2*row,v*.20+.13*col);
    }
   }
  }
 }
 batches.forEach(({vertices,uv},i)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();mesh(geo,craftSurface('rockLimestone',flagColors[i]),0,0,0,g);});
 for(let i=0;i<16;i+=4){
  const a=i*TAU/16,seal=landmarkGroup(pedestal,Math.sin(a)*4.48,.313,Math.cos(a)*4.48,a);
  const plate=box(0,0,0,.72,.045,.99,'bronze','#b49869',seal);plate.material=brass;
  for(const side of [-1,1]){
   const vein=box(side*.12,-.035,.77,.056,.04,.53,'bronze','#a99066',seal);vein.material=brass;
  }
  const glyph=landmarkGroup(seal,0,.05,0);glyph.rotation.x=-Math.PI/2;
  remnantGlyph(glyph,.55,i/4);
 }
 for(const [r,y,h,tone] of [[2.62,.23,.28,'#858e89'],[2.46,.51,.36,'#939890'],[2.31,.87,.31,'#858b84'],[2.18,1.18,.17,'#a1a69b']]){
  const tier=landmarkDrum(pedestal,0,y,0,r,r-.035,h,'wall',tone,24);tier.material=craftSurface('ashlar',tone);
  floor.courses.push({r:r-.035,y:g.position.y+y+h});
 }
 // The two low front treads meet the circular flagstones before the service points.
 for(let i=0;i<2;i++){
  const step=dressedBlock(pedestal,0,.28+.125*i,2.79-i*.35,1.76+i*.22,.18+.25*i,.52,'ashlar','#959d92',1.85);
  floor.steps.push({x:x+dx,z:z+dz+step.position.z,w:.88+i*.11,d:.26,y:g.position.y+step.position.y+.09+.125*i});
 }
 const profile=[[.74,0],[.74,.20],[.61,.35],[.61,.58],[.49,.73],[.44,4.05],[.53,4.18],[.54,4.36],[.68,4.45],[.65,4.75],[.52,4.81],[.44,4.93],[.39,5.19],[.14,5.34]];
 const mast=landmarkGroup(pedestal,0,1.35,0);mast.scale.set(.92,1.38,.92);
 const shaft=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),16);shaft.computeVertexNormals();
 mesh(shaft,brass,0,0,0,mast);
 for(const [y,r] of [[1.56,.72],[1.95,.62],[2.09,.54],[5.55,.53],[5.83,.70],[6.12,.61]])landmarkDrum(mast,0,y-1.35,0,r,r,.082,'bronze','#b4a27a',16).material=brass;
 for(let i=0;i<8;i++){const a=(i+.5)*TAU/8,face=landmarkGroup(mast,Math.sin(a)*.433,.83,Math.cos(a)*.433,a);
  box(0,1.54,0,.283,2.88,.04,'darkWood','#626e65',face);
  for(const s of [-1,1]){const strip=box(s*.157,1.52,.022,.034,2.94,.046,'bronze','#ac946c',face);strip.material=brass;}
  for(let j=0;j<4;j++)remnantGlyph(landmarkGroup(face,0,.45+j*.64,.028),.275,(i+j)%4);
 }
 for(const side of [-1,1]){
  const fin=landmarkGroup(pedestal,side*1.36,1.34,-.14),h=side<0?3.79:5.02;fin.rotation.z=-side*.16;fin.scale.x=1.52;
  const outline=new THREE.Shape();outline.moveTo(-.37,0);outline.lineTo(.44,0);outline.lineTo(.31,h*.72);outline.lineTo(.23,h*.92);outline.lineTo(-.08,h);outline.lineTo(-.20,h*.82);outline.lineTo(-.35,h*.79);outline.closePath();
  const shard=new THREE.ExtrudeGeometry(outline,{depth:.61,bevelEnabled:true,bevelSize:.055,bevelThickness:.05,bevelSegments:1});
  mesh(shard,detailedStone105('rockSlate'),0,0,-.31,fin);
  for(let j=0;j<3;j++)remnantGlyph(landmarkGroup(fin,.02,.55+j*h*.20,.37),.45,(j+1)%4);
 }
 obstacle(x+dx,z+dz,3.6,3.6,'remnant device');
 // Keep the front open for the game camera and the original southern approach.
 for(let i=0;i<=28;i++){
  const a=(-1.60+i/28*3.20),xx=Math.sin(a)*17.4,zz=-Math.cos(a)*13.2;
  if(xx>11&&zz>-5.2)continue;
  if(zz<-8&&xx>.65&&xx<13.5)continue;
  if(Math.abs(x+xx-remnantStair[0])<5.1&&Math.abs(z+zz-remnantStair[1]+3.1)<6.0)continue;
  const ht=4.4+rng()*2.5;chamberRock(g,xx,1.55,zz,2.8+rng(),ht,2.75,i%4?'rockSlate':'rockGranite',a+rng()*2);
  chamberRock(g,xx*.97,ht*.79,zz+.2,3.4,1.35,2.75,i%3?'rockSlate':'rockMoss',a+.91);
  if(i%2===0){chamberRock(g,xx*1.07,ht+1.5,zz-1.4,4.25,1.95,3.45,'rockSlate',a+.36);chamberRock(g,xx*.89,-.15,zz+1.37,2.1,1.13,1.74,'rockMoss',a-.55);}
  if(i%4===1&&zz<-2){
   gardenFern(g,xx*.93,.16,zz+2.21,.82+.48*rng(),a);
   chamberRock(g,xx*.95,.07,zz+2.42,.55,.31,.66,'rockMoss',a*.8);
  }
  if(i%3===0){for(let j=0;j<3;j++){const rx=xx+(j-1)*.43;boundTimber(g,[V3(rx,ht*.92,zz+1.51),V3(rx-.43,ht*.69,zz+1.68),V3(rx+.14,ht*.46,zz+1.92),V3(rx-.21,ht*(.23+.16*rng()),zz+1.87)],.038,false);}}
 }
 const steps=landmarkGroup(world,remnantStair[0],groundAt(...remnantStair),remnantStair[1]);
 // A continuous, stratified soffit connects the hanging rock to the wall
 // above the recess. The front and the rising daylight stair remain open.
 const vv=[],tex=[];
 for(let i=0;i<16;i++){
  const x0=-6.4+i*1.30,x1=x0+1.30;
  const lip=u=>[u,8.62+.46*Math.sin(u*.82)+.25*Math.cos(u*2.04),-8.95+.63*Math.sin(u*.67)];
  const face=u=>[u,8.96+.27*Math.cos(u*1.31),-13.50];
  const cap=u=>[u,10.89+.52*Math.cos(u*.46),-11.52];
  for(const tri of [[lip(x0),face(x1),face(x0)],[lip(x0),lip(x1),face(x1)],[lip(x0),cap(x1),lip(x1)],[lip(x0),cap(x0),cap(x1)]]){
   for(const p of tri){vv.push(...p);tex.push(p[0]*.28,(p[2]+p[1]*.62)*.34);}
  }
 }
 const ceiling=new THREE.BufferGeometry();ceiling.setAttribute('position',new THREE.Float32BufferAttribute(vv,3));ceiling.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));ceiling.computeVertexNormals();
 mesh(ceiling,craftSurface('rockSlate','#959b90'),0,0,0,g);
 const niche=landmarkGroup(g,5.7,.14,-9.76);
 for(const side of [-1,1])for(let i=0;i<4;i++)
  dressedBlock(niche,side*1.93,.51+i*.96,-.35,.76,.94,1.65,'ashlar',i%2?'#727c78':'#828781',1.8);
 for(let i=0;i<11;i++){
  const a=(i+.5)*Math.PI/11,stone=dressedBlock(niche,1.94*Math.cos(a),3.88+1.94*Math.sin(a),-.35,.61,.75,1.66,'ashlar',i%3?'#838982':'#979b90',1.7);
  stone.rotation.z=a-Math.PI/2;
 }
 // The right-hand archivolt opens onto a dogleg passage and a little
 // instrument chamber. Its doorway, wall openings and floor share one plan.
 const nx=x+5.7,nz=z-9.76;
 function galleryWall(u,v,w,d){
  dressedBlock(niche,u,2.54,v,w,5.08,d,'laidFlags','#868e82',2.48);
  obstacle(nx+u,nz+v,w,d,'excavated wall');
 }
 galleryWall(-2.02,-3.88,.66,8.85);galleryWall(2.02,-1.56,.66,4.20);
 galleryWall(1.92,-8.28,8.57,.66);galleryWall(6.03,-5.39,.60,5.63);
 galleryWall(4.06,-2.66,4.29,.50);
 for(const [u,v,w,d] of [[0,-3.42,3.63,8.93],[3.88,-5.39,4.65,5.51]]){
  dressedBlock(niche,u,.055,v,w,.22,d,'laidFlags','#a6a696',2.33);
  floor.steps.push({x:nx+u,z:nz+v,w:w/2,d:d/2,y:g.position.y+.305});
  dressedBlock(niche,u,5.13,v,w+.45,.46,d,'rockSlate','#747b74',2.61);
 }
 for(const xx of [-1.15,1.05])for(let j=0;j<3;j++){
  const mark=landmarkGroup(niche,xx,1.57+j*.60,-7.93);remnantGlyph(mark,.73,j+1);
 }
 dressedBlock(niche,4.75,.58,-6.98,1.81,1.15,.82,'ashlar','#9ba394',1.69);
 obstacle(nx+4.75,nz-6.98,1.81,.82,'stone instrument table');
 landmarkDrum(niche,4.72,1.16,-6.98,.32,.43,.26,'bronze','#b2a284');
 const instrument=landmarkGroup(niche,4.72,1.81,-6.98);
 for(const angle of [-.62,.73]){const ring=landmarkHoop(instrument,0,0,0,.38,.036,'bronze','#c8b785');ring.rotation.y=angle;ring.rotation.z=angle*.41;}
 beam(V3(0,-.43,0),V3(0,.42,0),.039,'metal','#b6ac91',instrument);
 landmarkLamp(niche,3.54,2.66,-7.39,.56);
 // Register the sconce with the same bounded light pool used by other POIs.
 (world.userData.lampSources??=[]).push(V3(nx+3.54,g.position.y+3.05,nz-7.13));
 world.userData.remnantAnnex=[nx+4.15,nz-5.17];
 world.userData.remnantGalleryDoor=[nx,nz];
 for(const [xx,yy,zz,w,h,d,a] of [[-4.4,8.96,-12.2,6.75,1.55,3.9,.75],[4.2,8.39,-12.6,4.95,2.21,3.7,1.17],[10.6,6.95,-8.9,4.61,1.77,3.5,2.73]]){
  chamberRock(g,xx,yy,zz,w,h,d,'rockSlate',a);
  for(let j=0;j<3;j++){const ax=xx-1.53+j*1.24,az=zz+d*.59;
   boundTimber(g,[V3(ax,yy-1.0,az),V3(ax-.35,yy-1.91,az+.47),V3(ax+.18,yy-2.86-.35*j,az+.66),V3(ax-.23,yy-3.63-.42*j,az+.72)],.059,false);
  }
 }
 const limestone=detailedStone105('rockLimestone');
 const wornTreads=['#121915','#263129','#41493c'].map(tint=>{
  const m=limestone.clone();m.onBeforeCompile=limestone.onBeforeCompile;m.customProgramCacheKey=limestone.customProgramCacheKey;
  m.color.set('#b1ad9c');m.emissive.set(tint);m.emissiveIntensity=.33;return m;
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
 }),0,5.03,-8.62,steps);light.scale.set(2.66,2.61,1);light.name='Daylight beyond the stone stair';
 for(const s of [-1,1])for(let j=0;j<3;j++)chamberRock(steps,s*(2.55+.17*j),4.14+.12*j,-5.63-j*.92,.75,1.81,1.25,'rockGranite',s*(j+.46));
 for(const s of [-1,1]){
  chamberRock(steps,s*2.08,5.48,-5.22,.72,1.71,1.22,'rockSlate',s*2.18);
  const canopy=landmarkGroup(steps,s*.69,5.91,-5.76);
  for(let j=0;j<3;j++)hallTimber(canopy,[V3(s*(.70-j*.21),.73,.07),V3(s*(.35-j*.15),.25,.12),V3(-s*j*.055,-.18-j*.13,.09)],.034);
 }
 const shaftMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec2 shaftUv;void main(){shaftUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 shaftUv;void main(){float soft=sin(3.14159*shaftUv.x)*sin(3.14159*shaftUv.y);gl_FragColor=vec4(.79,.85,.73,soft*soft*.095);}'});
 for(let i=0;i<3;i++){const shaft=mesh(new THREE.PlaneGeometry(1.08+i*.25,10.7),shaftMat,.33+i*.72,3.45,-1.46,steps);shaft.rotation.x=-.83;shaft.rotation.z=.43;shaft.castShadow=false;}
 const spill=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 v;void main(){float a=1.-smoothstep(.09,1.,length((v-.5)*2.));float shadow=.78+.22*smoothstep(-.75,.75,sin(v.x*27.+v.y*4.));gl_FragColor=vec4(.90,.77,.57,.23*a*a*shadow);}'});
 const pool=mesh(new THREE.PlaneGeometry(5.15,8.86),spill,1.39,.43,2.76,steps);pool.rotation.order='YXZ';pool.rotation.x=-Math.PI/2;pool.rotation.y=.41;pool.castShadow=false;pool.userData.dynamicFX=true;
 const grains=[],random=seeded(9064);
 for(let i=0;i<11;i++){const t=random();grains.push(steps.position.x-.58+t*1.8+(random()-.5)*1.13,steps.position.y+.80+t*3.02,steps.position.z+2.82-t*5.12+(random()-.5)*.69);}
 const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(grains,3));
 const dust=new THREE.Points(dustGeo,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{clockTime:windUniforms.time},
  vertexShader:'uniform float clockTime;varying float light;void main(){vec3 p=position;p.x+=.14*sin(p.z+clockTime*.29);p.y+=.17*cos(p.x+clockTime*.19);light=.14+.09*sin(p.z*2.+clockTime*.24);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=1.8;}',
  fragmentShader:'varying float light;void main(){gl_FragColor=vec4(.91,.82,.68,(1.-smoothstep(.06,.5,length(gl_PointCoord-.5)))*light);}' }));
 dust.name='Dust in the stair light';dust.userData.dynamicFX=true;world.add(dust);
}
const requestsBeforeRemnant=buildLocalRequests16;
buildLocalRequests16=function(...args){
 const result=requestsBeforeRemnant(...args);
 if(activeScene.key!=='depths')return result;
 const board=world.userData.localRequests16?.props.find(o=>o.type==='localBoard')?.requestProp;
 if(board&&!board.userData.remnantTablet){
  board.clear();board.userData.remnantTablet=true;
  dressedBlock(board,0,.18,0,1.48,.36,.32,'rockSlate','#a29c87',1.3);
  dressedBlock(board,0,.64,0,1.31,.71,.25,'ashlar','#9c9889',1.3);
  dressedBlock(board,0,.72,.14,1.06,.46,.045,'iron102','#a69878',1.21);
  for(let i=0;i<3;i++)box(0,.83-i*.105,.17,.73-i*.13,.021,.018,'bronze','#bfb393',board);
 }
 return result;
};
const heightBeforeRemnantWalk=heightAt;
heightAt=function(x,z,...args){
 let y=heightBeforeRemnantWalk(x,z,...args);
 if(activeScene?.key==='highmere'){
  const data=world?.userData;
  if(data?.palaceSteps&&Math.abs(x+70)<3.9&&z< -141.6)for(const tread of data.palaceSteps)if(Math.abs(x-tread.x)<=tread.w&&Math.abs(z-tread.z)<=tread.d+.006)return tread.y;
 }
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
  hemi.intensity=.50+.76*day;sun.color.set(day>.2?'#f5efe1':'#91b7df');sun.intensity=.16+1.79*day;
  if(skyBounce17){skyBounce17.color.set('#d9e4e1');skyBounce17.intensity=.32+.37*day;}
  for(const [i,lamp] of (world.userData.lanterns??[]).entries())
   if(i>0&&!(lamp.userData.effectUntil>clock))lamp.color.set('#ffe6c7');
  return result;
 }
 if(activeScene?.key!=='depths')return result;
 sun.color.set('#eedec1');sun.intensity=1.23;
 sun.position.set(87,22,12);sun.target.position.set(109,groundAt(109,26),27);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);
 sceneryLight.direction.value.copy(sun.position).sub(sun.target.position).normalize();
 hemi.color.set('#b7c3c7');hemi.groundColor.set('#696558');hemi.intensity=.71;
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
const cameraBeforeRemnantGallery=updateCamera;
updateCamera=function(dt,instant=false){
 const result=cameraBeforeRemnantGallery(dt,instant),door=world?.userData.remnantGalleryDoor;
 if(!door||activeScene?.key!=='depths'||!player||battle||restoration)return result;
 const u=player.x-door[0],v=player.z-door[1];
 if(u< -1.76||u>5.78||v>2.5||v< -7.98||(u>1.72&&v> -2.92))return result;
 const enter=1-smooth(-2.05,2.50,v),turn=smooth(.4,3.9,u),y=heightAt(player.x,player.z);
 const eye=V3(mix(player.x,Math.max(door[0]-.93,player.x-3.28),turn),y+3.03,player.z+mix(3.45,1.12,turn));
 const aim=V3(player.x+turn*.56,y+1.48,player.z-mix(.67,1.15,turn));
 camera.position.lerp(eye,enter);focusPoint.lerp(aim,enter);camera.fov=mix(camera.fov,55,enter);
 camera.lookAt(focusPoint);camera.updateProjectionMatrix();camera.updateMatrixWorld();post.material.uniforms.focus.value=camera.position.distanceTo(focusPoint);
 for(const actor of actors)actor.mesh.quaternion.copy(camera.quaternion);
 return result;
};
const menuBeforeFernStage=renderMenu;
renderMenu=function(...args){const result=menuBeforeFernStage(...args);const spec=fernRoomSpecs[activeScene?.key];if(spec&&menu?.tab==='shop')$('#menu-title').textContent=spec.name;return result;};
