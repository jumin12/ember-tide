// Local coordinates are centred on the original walkable court. The occupied
// plots come from the same foundations used by the overworld collision map.
function landmarkDrum(parent,x,y,z,lower,upper,h,kind,tint,sides=12){
 const geo=geo16('landmark-drum-'+[lower,upper,h,sides].join('/'),()=>new THREE.CylinderGeometry(upper,lower,h,sides));
 return landmarkPiece(parent,geo,kind,tint,x,y+h*.5,z);
}
function landmarkBoulder(parent,x,y,z,w,h,d,kind='rock',tint='#abc0ad',turn=0){
 const geo=geo16('landmark-weathered-stone',()=>new THREE.IcosahedronGeometry(1,0));
 const rock=landmarkPiece(parent,geo,kind,tint,x,y,z,w,h,d);rock.rotation.set(.12,turn,-.09);return rock;
}
function landmarkHoop(parent,x,y,z,r,thickness,kind='bronze',tone='#c69c50'){
 const geo=geo16('landmark-ring-'+[r,thickness].join('/'),()=>new THREE.TorusGeometry(r,thickness,6,32));
 return landmarkPiece(parent,geo,kind,tone,x,y,z);
}
function landmarkLamp(parent,x,y,z,wallDepth=0){
 const g=landmarkGroup(parent,x,y,z);
 g.userData.lanternCenter=.29;
 landmarkDrum(g,0,-.06,0,.34,.30,.12,'bronze','#ad8956',6);
 landmarkDrum(g,0,.06,0,.23,.28,.48,'window','#ffc47a',6);
 landmarkDrum(g,0,.54,0,.37,.09,.21,'metal','#8f8a77',6);
 for(const a of [0,2.09,4.19])landmarkBlock(g,Math.sin(a)*.26,.31,Math.cos(a)*.26,.05,.5,.05,'bronze','#977b50');
 if(wallDepth){
  // A ventilated cap hangs from an iron arm fixed into the post or masonry.
  landmarkDrum(g,0,.72,0,.113,.12,.105,'metal','#736d61',6);
  landmarkHoop(g,0,.87,0,.098,.024,'bronze','#a08a65');
  landmarkBlock(g,0,.97,-wallDepth/2,.071,.075,wallDepth+.11,'metal','#777467');
  landmarkBlock(g,0,.76,-wallDepth,.22,.56,.082,'metal','#827b69');
  beam(V3(0,.58,-wallDepth+.022),V3(0,.94,-wallDepth*.28),.036,'metal','#81765e',g);
 }
}
function landmarkTree(parent,x,z,height,fruit=false){
 const tree=landmarkGroup(parent,x,0,z);tree.scale.setScalar(height/3.6);
 landmarkDrum(tree,0,0,0,.26,.14,1.95,'wood','#90765a',7);
 for(let i=0;i<5;i++){
  const a=i*2.4,s=i===4?.84:1,cx=i===4?0:Math.sin(a)*.82,cz=i===4?0:Math.cos(a)*.72,cy=i===4?3.15:2.35+.14*(i%2);
  landmarkTimber(tree,V3(0,1,0),V3(cx,cy,cz),.14);
  const crown=landmarkPiece(tree,branchSpray66(17),'leafSpray',i%2?'#c4cc9b':'#b7c99f',cx,cy,cz,s,s*.89,s);crown.rotation.y=a;
  if(fruit)for(const offset of [-.42,.38])landmarkBoulder(tree,cx+offset,cy-.21,cz+.45*s,.13,.14,.12,'fruit','#d79449',a);
 }
}
function landmarkFir(parent,x,z,h){
 landmarkDrum(parent,x,0,z,.24,.13,h*.65,'wood','#95836c',7);
 for(let tier=0;tier<5;tier++){
  const r=h*(.25-tier*.040),y=h*(.23+tier*.15);
  for(let i=0;i<7;i++){
   const a=i*TAU/7+tier*1.87,tip=landmarkGroup(parent,x+Math.sin(a)*r*.50,y,z+Math.cos(a)*r*.50,a);
   const bough=landmarkBoulder(tip,0,0,0,r*.51,r*.32,r*.68,'shrub','#688875',0);bough.rotation.x=.28;
   if((tier+i)%4!==1){const cap=landmarkBoulder(tip,0,r*.16,.015,r*.44,r*.16,r*.60,'snowCap','#c4dadc',0);cap.rotation.x=.28;}
  }
 }
}
function landmarkRoyalTower(parent,x,z,h){
 landmarkDrum(parent,x,0,z,1.57,1.42,.8,'wall','#b8ad96',10);
 landmarkDrum(parent,x,.65,z,1.30,1.24,h-.65,'wall','#ddd1b9',10);
 for(const y of [1.07,h-1.15,h-.36])landmarkDrum(parent,x,y,z,1.39,1.44,.17,'cobble','#d3c5a7',10);
 for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const bay=landmarkGroup(parent,x,0,z,a);
  landmarkBlock(bay,0,h-1.75,1.21,.32,1.02,.13,'darkWood','#493d33');
  landmarkBlock(bay,0,h-1.63,1.29,.14,.62,.07,'window','#ffcb80');
 }
 landmarkDrum(parent,x,h,z,1.67,.08,3.25,'glazedTile','#99aecd',10);
 landmarkDrum(parent,x,h+3.23,z,.09,.045,.80,'bronze','#d1ac64',8);
 landmarkBlock(parent,x+.36,h+3.77,z,.70,.32,.065,'cloth','#527f93');
}
function landmarkCrownHall(parent){
 landmarkBlock(parent,0,.47,0,11,.94,6.1,'wall','#c3bdab');
 landmarkBlock(parent,0,3.20,0,10.6,4.55,5.75,'wall','#dcd0b9');
 for(const side of [-1,1]){
  const bay=landmarkGroup(parent,0,0,0,side<0?Math.PI:0);
  landmarkBlock(bay,0,4.85,2.91,10.8,.23,.24,'cobble','#d7cbb6');
  for(const x of [-3.9,-2.55,2.55,3.9])landmarkWindow(bay,x,3.05,2.98,.56,1.55);
  landmarkBlock(bay,0,1.47,2.99,1.60,2.55,.18,'door','#77573d');
  for(const x of [-1.27,1.27]){
   landmarkBlock(bay,x,3.36,3.02,.51,2.06,.13,'cloth','#466c91');
   landmarkBlock(bay,x,3.72,3.11,.49,.15,.07,'bronze','#dbc17e');
  }
 }
 landmarkRoof(parent,10.8,6,5.44,2.86,'#94a9c9',false,'glazedTile');
 for(const s of [-1,1]){
  const face=landmarkGroup(parent,0,5.72,s*3.20,s<0?Math.PI:0);
  landmarkHoop(face,0,.62,0,.61,.12,'cobble','#dcd1b6');
  const glass=landmarkDrum(face,0,.62,.01,.50,.50,.06,'window','#ffd088',12);glass.rotation.x=Math.PI/2;
  for(const a of [0,Math.PI/3,-Math.PI/3])landmarkBlock(face,0,.63,.11,.075,1.02,.075,'bronze','#bca276').rotation.z=a;
 }
 for(const x of [-6,6])for(const z of [-2.5,2.15])landmarkRoyalTower(parent,x,z,z<0?7.9:6.6);
 for(const x of [-3.8,3.8])landmarkLamp(parent,x,1.1,3.16);
}
function landmarkWard(parent,w,d,command=false){
 const h=2.0,rise=1.55;
 landmarkBlock(parent,0,.14,0,w,.27,d,'wood','#ae956e');
 landmarkCanvasFly(parent,w,d,h,rise,command);
 for(const s of [-1,1]){
  for(const z of [-d*.47,d*.47])landmarkBlock(parent,s*w*.46,1.12,z,.14,2.24,.14,'wood','#9c784f');
  landmarkBlock(parent,s*w*.47,1.27,0,.11,1.52,d*.93,'cloth','#d2c6a9');
  landmarkBlock(parent,s*w*.47,1.55,0,.14,.14,d*.93,'cloth','#687c7d');
  const x=s*w*.26;
  landmarkBlock(parent,x,.52,0,.98,.34,d*.64,'wood','#ab8458');
  landmarkBlock(parent,x,.75,0,1.01,.18,d*.64,'cloth','#e5dcc5');
  landmarkBlock(parent,x,.86,.12,1.02,.11,d*.31,'cloth','#6a9594');
  landmarkBlock(parent,x,.89,-d*.22,.74,.15,.4,'cloth','#fff3db');
 }
 landmarkTimber(parent,V3(0,.3,d*.48),V3(0,h+rise,d*.48),.11);
 landmarkLamp(parent,w*.38,.76,d*.42);
}
function landmarkCanvasFly(parent,w,d,h,rise,command){
 // The ridge is tensioned between the end poles. The cloth sags between
 // lashings, with stitched seams, a dyed border and reinforced corners.
 const material='cloth',colour=command?'#c1cfb6':'#eedfc0';
 for(const side of [-1,1]){
  const geo=geo16('landmark-tent-fly-'+[w,d,h,rise,side].join('/'),()=>{
   const pts=[],uv=[],indices=[];
   for(let row=0;row<=8;row++)for(let col=0;col<=6;col++){
    const t=col/6,u=row/8,loose=Math.sin(t*Math.PI),sag=Math.sin(u*Math.PI);
    pts.push(side*t*(w*.5+.27),h+rise*(1-t)-.28*loose-.17*sag+.057*Math.cos(u*Math.PI*8)*loose,(u-.5)*(d+.71));
    uv.push(t,u);if(col&&row){const k=row*7+col;indices.push(k-8,k-7,k,k-8,k,k-1);}
   }
   if(side>0)indices.reverse();
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
  });
  landmarkPiece(parent,geo,material,colour,0,0,0);
  for(const s of [-1,1]){
   const x=side*(w*.5+.27),z=s*(d*.5+.33);
   landmarkTimber(parent,V3(x,h,z),V3(x+side*.45,.11,z+s*.28),.052,'#d0b482');
   landmarkBlock(parent,x+side*.45,.15,z+s*.28,.12,.30,.12,'wood','#a9885e');
  }
  const band=landmarkBlock(parent,side*(w*.5+.24),h-.19,0,.08,.24,d+.65,'cloth',command?'#65888b':'#859da1');
  band.rotation.z=-side*.09;
 }
 for(const s of [-1,1])landmarkBlock(parent,0,(h+rise)*.5,s*d*.48,.13,h+rise,.13,'wood','#987951');
}
function landmarkPress(parent){
 landmarkBlock(parent,0,.24,0,2.85,.47,2.45,'wall','#bdb39d');
 for(const x of [-1.02,1.02])landmarkBlock(parent,x,1.80,0,.33,3.05,.43,'wood','#a08050');
 landmarkBlock(parent,0,3.22,0,2.60,.40,.55,'wood','#b19268');
 landmarkDrum(parent,0,.48,0,.94,.97,.85,'wood','#bc9264');
 for(const y of [.59,1.13])landmarkDrum(parent,0,y,0,.98,.98,.10,'metal','#8b8879');
 landmarkDrum(parent,0,1.36,0,.83,.83,.20,'wood','#c1a075');
 landmarkDrum(parent,0,1.50,0,.17,.17,1.79,'metal','#938e7f');
 landmarkBlock(parent,0,2.50,0,1.65,.14,.16,'wood','#b18c5b');
 landmarkBarrel(parent,1.49,.7,.83);
}
function landmarkBoat(parent){
 // A clinker-built hull on a shipwright's stocks, above the high-water line.
 for(const z of [-1.62,1.59]){
  landmarkBlock(parent,0,.20,z,2.83,.35,.42,'wood','#8b704e');
  for(const s of [-1,1])landmarkTimber(parent,V3(s*1.32,.25,z),V3(s*.74,1.10,z),.21);
 }
 const stations=[[-3.35,.02,1.17],[-2.32,.79,.52],[-.65,1.14,.35],[1,1.1,.37],[2.45,.67,.57],[3.18,.07,.96]];
 for(let i=1;i<stations.length;i++){
  const [az,aw,ay]=stations[i-1],[bz,bw,by]=stations[i];
  for(const side of [-1,1])for(let j=0;j<4;j++){
   const t=j/4,breadth=t=>.12+.88*Math.sqrt(t),a=V3(side*aw*breadth(t),ay+t*.98,az),b=V3(side*bw*breadth(t),by+t*.98,bz);
   const t2=(j+1)/4,c=V3(side*bw*breadth(t2),by+t2*.98,bz),d=V3(side*aw*breadth(t2),ay+t2*.98,az);
   const panel=geo16('landmark-hull-'+[i,side,j].join('/'),()=>{
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...a.toArray(),...b.toArray(),...c.toArray(),...d.toArray()],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,.25,0,.25],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;
   });
   landmarkPiece(parent,panel,'wood',j%2?'#ad8152':'#c09968',0,0,0);
   if(j===3)landmarkTimber(parent,d,c,.105,'#dec297');
  }
 }
 for(const z of [-1.25,0,1.34])landmarkBlock(parent,0,1.20,z,1.76,.14,.33,'wood','#c7a16d');
 landmarkDrum(parent,0,.77,0,.105,.065,4.84,'wood','#c5a473');
 const yard=landmarkBlock(parent,0,4.56,.03,2.48,.13,.16,'wood','#b99b6b');yard.rotation.z=.13;
 const sail=landmarkBlock(parent,0,4.43,.04,2.24,.26,.32,'cloth','#e6d9bd');sail.rotation.z=.13;
 for(const z of [-2.95,2.77])landmarkTimber(parent,V3(0,5.35,0),V3(0,1.62,z),.048,'#bdad8b');
}
function landmarkCrane(parent){
 landmarkBlock(parent,0,.27,0,2.9,.53,2.55,'wall','#b9b1a2');
 landmarkDrum(parent,0,.55,0,.38,.31,3.7,'wood','#96734f');
 landmarkTimber(parent,V3(-.8,3.59,0),V3(2.38,4.76,0),.26);
 landmarkTimber(parent,V3(.11,2.35,0),V3(1.55,4.43,0),.19);
 landmarkHoop(parent,2.16,4.52,0,.21,.065);
 landmarkBlock(parent,2.16,3.13,0,.058,2.70,.058,'wood','#bcaa87');
 landmarkBarrel(parent,2.16,.76,.85);landmarkBarrel(parent,-.93,.67);
}
function landmarkCrystal(parent,x,y,z,r,h,tint){
 const profile=[[.07,0],[.66,.12],[1,.40],[.82,.76],[.05,1]];
 const geo=geo16('landmark-quartz-prism',()=>{const g=new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),6).toNonIndexed();g.computeVertexNormals();return g;});
 return landmarkPiece(parent,geo,'lightFacets',tint,x,y,z,r,h,r);
}
function landmarkRelay(parent,tall=false){
 const radius=tall?2.25:1.8;
 landmarkDrum(parent,0,0,0,radius+.26,radius,.48,'wall','#bab6a5',12);
 landmarkDrum(parent,0,.47,0,radius*.88,radius*.80,.30,'bronze','#a88f5d',12);
 const pivot=tall?3.0:2.58;
 for(const s of [-1,1]){
  landmarkDrum(parent,s*(radius-.12),.42,0,.48,.34,pivot-.42,'wall','#c7c8b6',8);
  landmarkDrum(parent,s*(radius-.12),pivot-.24,0,.46,.46,.25,'bronze','#b4914c',8);
 }
 const ring=landmarkHoop(parent,0,pivot,0,radius-.22,.15);ring.rotation.y=-.26;
 const latitude=landmarkHoop(parent,0,pivot,0,radius-.38,.092);latitude.rotation.set(1.09,.47,.19);
 if(tall){const polar=landmarkHoop(parent,0,pivot,0,radius-.62,.094);polar.rotation.set(.37,1.12,.14);}
 landmarkCrystal(parent,0,pivot-.91,0,.46,1.82,'#75d9d0');
}
function landmarkCairn(parent,x,z,h,snow=false){
 for(let i=0;i<4;i++){
  const w=h*(.34-i*.054),y=h*(.12+.21*i);
  landmarkBoulder(parent,x,y,z,w,h*.18,w*.90,'rock','#a6adab',i);
  if(snow&&i>=2)landmarkBoulder(parent,x,y+h*.09,z,w*.92,h*.097,w*.82,'snowCap','#ecf1e9',i);
 }
}
function landmarkArch(parent){
 // Individual voussoirs leave a real opening through the wall.
 for(const s of [-1,1])for(let j=0;j<3;j++)
  landmarkBlock(parent,s*2.05,.38+j*.67,0,.85,.65,1.46,'wall',j%2?'#c6c4b4':'#adb6a6');
 for(let i=0;i<11;i++){
  const geo=geo16('landmark-arch-segment-'+i,()=>{
   const start=i*Math.PI/11+.009,end=(i+1)*Math.PI/11-.009,outer=i===5?2.56:2.46,inner=1.64;
   const shape=new THREE.Shape();shape.moveTo(inner*Math.cos(start),inner*Math.sin(start));shape.lineTo(outer*Math.cos(start),outer*Math.sin(start));
   shape.lineTo(outer*Math.cos(end),outer*Math.sin(end));shape.lineTo(inner*Math.cos(end),inner*Math.sin(end));shape.closePath();
   return new THREE.ExtrudeGeometry(shape,{depth:i===5?1.62:1.44,bevelEnabled:true,bevelSegments:1,bevelSize:.024,bevelThickness:.025});
  });
  landmarkPiece(parent,geo,'wall',i%3?'#b5bdaf':'#dacdb2',0,1.98,i===5?-.81:-.72);
 }
}
function landmarkSanctuary(parent,key){
 const colours={fernClearing:'#83dbc0',alderClearing:'#8cd8da',reliefClearing:'#9aceee',siteClearing:'#a4d6cf'};
 const tint=colours[key];
 if(key==='siteClearing'){landmarkRelay(parent,true);return;}
 landmarkDrum(parent,0,0,0,2.58,2.46,.38,'wall','#b9bda8',12);
 landmarkDrum(parent,0,.38,0,1.95,1.8,.37,'cobble','#d1c6ac',12);
 landmarkDrum(parent,0,.75,0,.98,1.14,.37,'bronze','#bca16c',10);
 landmarkCrystal(parent,0,1.02,0,.85,3.1,tint);
 if(key==='fernClearing'){
  const arch=landmarkGroup(parent,0,0,-1.45,-.15);landmarkArch(arch);
  for(let i=0;i<7;i++){const vine=landmarkPiece(arch,branchSpray66(12),'leafSpray','#b2c590',-2.05+i*.13,2.15+i*.30,.73,.32,.36,.21);vine.rotation.z=i*.52;}
 }else if(key==='alderClearing'){
  for(const s of [-1,1]){
   const fin=landmarkGroup(parent,s*1.83,.18,0,s*.25);
   landmarkBlock(fin,0,1.66,0,.55,3.22,.71,'wall','#c9be9c').rotation.z=-s*.18;
   landmarkBlock(fin,s*.29,3.30,0,.64,.22,.79,'bronze','#c4a15e');
   landmarkCrystal(fin,s*.30,3.4,0,.26,.8,tint);
  }
 }else{
  for(const s of [-1,1]){
   landmarkDrum(parent,s*1.73,.4,-.68,.43,.31,2.95,'wall','#cac5ae',8);
   landmarkLamp(parent,s*1.73,3.34,-.68);
  }
  const roof=landmarkGroup(parent,0,3.88,-.70);
  landmarkRoof(roof,3.75,1.42,0,.91,'#b0c9c2',true,'cloth');
  for(const s of [-1,1])landmarkBlock(parent,s*1.73,3.64,-.68,.12,.63,.12,'bronze','#b09a70');
 }
}

function buildRegionalLandmark(site,key,place,footprints){
 const lot=(index,angle=0)=>{
  const f=footprints[index],g=place(f.x-site.x,f.z-site.z,angle);
  // A level sill intersects the terrain on all sides of the original footing.
  g.position.y=f.floor-macroGround(site.x,site.z)-.10;
  return g;
 };
 if(key==='highmere'){
  landmarkCrownHall(lot(0));
  const inn=lot(1,.15);landmarkHouse(inn,4.20,3.6,3.36,1.9,'#93a9bb',true);landmarkAwning(inn,0,2.42,2.90,1.92);
  const archive=lot(2,-.19);landmarkHouse(archive,4,3.65,3.72,2.07,'#a6b7c4');landmarkLamp(archive,1.29,.58,2.16);
 }else if(key==='fern'){
  const hall=lot(0,-.16);landmarkHouse(hall,5.1,3.95,3.68,2.26,'#91ad91',true,'glazedTile');
  landmarkAwning(hall,0,2.68,4.28,2.13);landmarkBarrel(hall,-2.43,1.68);
  const hut=lot(1,.28);landmarkHouse(hut,3.78,3.07,2.64,1.83,'#aac1a0',false,'glazedTile');
  const woodlot=lot(2,-.24);landmarkRoof(woodlot,3.8,3.1,1.97,1.3,'#93ae93',true,'glazedTile');
  for(const x of [-1.64,1.64])for(const z of [-1.34,1.34])landmarkBlock(woodlot,x,1.0,z,.23,2.05,.23,'wood','#957153');
  for(let j=0;j<2;j++)for(let i=0;i<4-j;i++){
   const log=landmarkDrum(woodlot,-1.06+i*.67+j*.30,.47+j*.5,1.04,.26,.27,2.17,'wood','#b99765',9);log.position.z-=1.08;log.position.y-=1.08;log.rotation.x=Math.PI*.5;
  }
  if(footprints[3])landmarkTree(lot(3),0,0,3.55);
 }else if(key==='alder'){
  const cider=lot(0,.10);landmarkHouse(cider,3.77,4.97,3.65,2.19,'#afb5c4',true);
  const press=lot(1,-.18);landmarkPress(press);landmarkTree(press,0,-1.83,2.85,true);
  const shed=lot(2,-.23);landmarkHouse(shed,2.95,3.66,2.88,1.71,'#abb7ab');
  const market=lot(3,.12);landmarkRoof(market,3.28,3.28,2.15,1.18,'#cf9864',true,'cloth');
  for(const x of [-1.46,1.46])for(const z of [-1.5,1.5])landmarkBlock(market,x,1.1,z,.18,2.2,.18,'wood','#9f754f');
  landmarkBlock(market,0,.83,.62,2.67,.32,.96,'wood','#bb966a');
  for(let i=0;i<8;i++)landmarkBoulder(market,-.96+(i%4)*.57,1.11,.43+Math.floor(i/4)*.38,.24,.20,.22,'fruit',i%3?'#e3a250':'#b9c362',i);
  landmarkTree(shed,-.32,-2.37,3.36,true);
 }else if(key==='harbor'){
  const yard=lot(0,-1.27);landmarkBoat(yard);
  const customs=lot(1,.23);landmarkHouse(customs,4.5,3.55,3.58,1.85,'#96b4bd',true,'glazedTile');
  const warehouse=lot(2,-.14);landmarkHouse(warehouse,4.31,3.2,2.81,1.39,'#a4b8c7');landmarkBarrel(warehouse,-1.54,2.07);landmarkBarrel(warehouse,-.73,2.03,.8);
  const crane=lot(3,.35);landmarkCrane(crane);
  if(footprints[4]){
   const beacon=lot(4);
   landmarkDrum(beacon,0,0,0,1.06,.63,3.36,'wall','#cbc9b8',10);
   landmarkDrum(beacon,0,3.33,0,.88,.88,.21,'bronze','#bda473',10);
   const light=landmarkGroup(beacon,0,3.56,0);light.scale.setScalar(1.9);landmarkLamp(light,0,0,0);
  }
 }else if(key==='relief'){
  for(let i=0;i<4;i++)landmarkWard(lot(i,i%2?-.19:.15),i<2?4.86:3.75,i<2?3.52:3.16,i===3);
  if(footprints[4]){
   const stores=lot(4);landmarkBarrel(stores,-.54,0);landmarkBarrel(stores,.24,-.26,.88);
   landmarkBlock(stores,.60,.28,.41,.92,.55,.69,'wood','#bc996f');
  }
 }else if(key==='snow'){
  const lodge=lot(0,.17);landmarkHouse(lodge,4.54,3.78,2.7,2.04,'#a7bfcb',true);
  landmarkRoof(lodge,4.57,3.81,2.79,2.05,'#e6ece7',true,'snowCap');
  // Only the exposed ridge is frosted. The low country remains temperate.
  landmarkFir(place(-6.4,-5.6),0,0,4.4);landmarkFir(place(4.8,-4.9),0,0,5.65);
  landmarkCairn(place(4.3,1.25),0,0,3.05,true);
 }else if(key==='depths'){
  // The buried repair hall is east of the road into this remnant.
  const ruin=place(3.6,-2.55,-.47);
  for(const [x,z,w,h,d] of [[-2.6,-1.5,1.63,2.7,2.0],[2.45,-1.3,1.7,2.47,1.85],[-1.05,-2.9,2.26,3.1,1.47],[1.35,-2.9,1.82,2.51,1.54]])
   landmarkBoulder(ruin,x,h*.66,z,w,h,d,'rock','#9aab99',x);
  landmarkArch(ruin);landmarkHoop(ruin,0,2.03,-1.33,1.27,.21,'bronze','#ac9163');
  landmarkCrystal(ruin,0,.26,-1.20,.39,1.84,'#80cabb');
  for(const s of [-1,1]){landmarkDrum(ruin,s*2.12,0,1.17,.49,.39,.78,'wall','#b4b3a1');landmarkLamp(ruin,s*2.12,.78,1.17);}
 }else if(key==='alderRemnant'){
  const work=lot(0,-.34);
  landmarkRelay(work);
  for(const s of [-1,1]){
   const brace=landmarkGroup(work,0,0,s*2.7);
   landmarkBlock(brace,0,.39,0,2.8,.76,1.13,'wall','#b9b5a1');
   landmarkBlock(brace,0,.92,0,2.37,.27,1.18,'bronze','#aa8e5b');
  }
 }else if(key==='nearbySite'){
  const control=lot(0,-.24);
  for(const s of [-1,1]){
   const tower=landmarkGroup(control,0,0,s*2.4);
   landmarkDrum(tower,0,0,0,1.26,.91,.62,'cobble','#b8b69d',8);
   landmarkDrum(tower,0,.60,0,.87,.68,s===1?2.37:4.27,'wall','#c3c5ad',6);
   const cap=s===1?2.97:4.87;
   landmarkDrum(tower,0,cap,0,.91,.75,.32,'bronze','#bca371',6);
   landmarkCrystal(tower,0,cap+.22,0,.48,1.28,'#90d7d5');
  }
  landmarkBlock(control,0,.47,0,1.92,.94,2.28,'wall','#aab1a3');
  const panel=landmarkBlock(control,0,1.16,0,1.78,.23,1.83,'bronze','#b79d68');panel.rotation.x=.27;
  for(let j=0;j<3;j++)landmarkBlock(control,-.48+j*.48,1.31,.10,.13,.095,.85,'lightFacets','#88d4cd').rotation.x=.27;
 }else if(POIS[key].kind==='clearing')landmarkSanctuary(lot(0,-.12),key);
}

// A soft contact term grounds the models even below the real-time shadow
// quality tier. Each ring follows the local terrain rather than a flat decal.
function landmarkContactShadows(site,footprints){
 const positions=[],uv=[],indices=[],base=macroGround(site.x,site.z),steps=20;
 for(const f of footprints){
  const start=positions.length/3;
  for(const r of [0,.71,1,1.32])for(let i=0;i<steps;i++){
   const a=i*TAU/steps,x=f.x+Math.cos(a)*(f.w*.52+.35)*r,z=f.z+Math.sin(a)*(f.d*.52+.35)*r;
   positions.push(x-site.x,macroGround(x,z)-base+.09,z-site.z);uv.push(r,0);
  }
  for(let j=0;j<3;j++)for(let i=0;i<steps;i++){
   const a=start+j*steps+i,b=start+j*steps+(i+1)%steps;
   indices.push(a,b,a+steps,b,b+steps,a+steps);
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);
 let mat=landmarkFinishes.get('contact');
 if(!mat){
  mat=new THREE.MeshBasicMaterial({color:'#242026',side:THREE.DoubleSide,transparent:true,depthWrite:false,opacity:.46,polygonOffset:true,polygonOffsetFactor:-1});
  mat.onBeforeCompile=s=>{
   s.vertexShader='varying float footingRadius;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfootingRadius=uv.x;');
   s.fragmentShader='varying float footingRadius;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=1.-smoothstep(.46,1.32,footingRadius);');
  };mat.customProgramCacheKey=()=>'landmark-contact';landmarkFinishes.set('contact',mat);
 }
 const shadow=new THREE.Mesh(geo,mat);shadow.name='Terrain contact shadows';shadow.renderOrder=3;return shadow;
}
