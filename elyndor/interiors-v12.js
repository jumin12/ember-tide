// Complete cutaway interiors: walls, fixtures, characters and interactions share
// the same physical floor. Each entrance returns to its real exterior doorway.
const INTERIORS={
 brookInn:{name:'The Lantern Inn',type:'inn',poi:'brookstead'},brookShop:{name:'Riverstone Supplies',type:'shop',poi:'brookstead'},
 highmereInn:{name:'The Wayfarer’s Rest',type:'inn',poi:'highmere'},highmereShop:{name:'Highmere Outfitters',type:'shop',poi:'highmere'},
 fernShop:{name:'Fern Hollow Provisions',type:'shop',poi:'fern'},alderShop:{name:'Alderbridge Trading House',type:'shop',poi:'alder'},
 council:{name:'Highmere Council Chamber',type:'council',poi:'highmere'},archives:{name:'The Royal Archives',type:'archives',poi:'highmere'}
};
for(const[id,q]of Object.entries(INTERIORS))SCENES[id]={name:q.name,sub:'Interior · '+(q.type==='shop'?'Equipment and provisions':q.type==='inn'?'A warm hearth and a place to rest':q.type==='archives'?'Records of the old network':'The royal council'),view:'interior',kit:q.type,seed:741,path:[],interact:[]};
function addInteriorDoors(){
 if(activeScene.kind!=='poi')return;const key=activeScene.key;
 const links=key==='brookstead'?[['shop','brookShop'],['inn','brookInn']]:key==='highmere'?[['innDoor','highmereInn'],['councilDoor','council'],['archiveDoor','archives'],['shop','highmereShop']]:key==='fern'?[['shop','fernShop']]:key==='alder'?[['shop','alderShop']]:[];
 for(const[type,id]of links){const o=interactables.find(o=>o.type===type);if(o&&INTERIORS[id]){o.interior=id;o.label='Enter '+INTERIORS[id].name;o.radius=2.6;}}
 if(key==='alder'&&!interactables.some(o=>o.interior==='alderShop')){createInteraction('interiorDoor',119,-96,'Enter Alderbridge Trading House');Object.assign(interactables.at(-1),{interior:'alderShop',radius:2.7});}
}
const INTERIOR_CHATTER={apprentice:['Apprentice','We are checking the stock for travelers. Let the clerk know what you need.'],potter:['Potter','I make the jars for the salves. The clerk keeps the remedies stocked.'],innkeeper:['The innkeeper','A warm meal and a little rest can make the next road easier.']};
function handleInteriorInteraction(o){
 if(activeScene?.kind==='interior'&&o.type==='villager'){const[speaker,text]=INTERIOR_CHATTER[activeScene.key==='fernShop'?'potter':'apprentice'];showSpeechBubble(o.actor,text,speaker);return true;}
 if(o.type==='interiorExit'){const r=state.interiorReturn??{id:'entrance',poi:'brookstead',spawn:POIS.brookstead.spawn};changeJourneyScene(r.id,r.spawn);return true;}
 if(activeScene?.kind==='poi'&&o.interior){state.interiorReturn={id:state.scene,poi:activeScene.key,spawn:[player.x,player.z]};changeJourneyScene(o.interior,[0,5]);return true;}
 if(activeScene?.kind==='interior'&&o.type==='shop'){if(activeScene.key==='highmereShop'){startDialogue([['Highmere outfitter','A good blade and a full satchel. What can I help you find?']],()=>openMenu('shop'));return true;}startDialogue([['Weapon shop clerk','A good blade and a full satchel. What can I help you find?']],()=>openMenu('shop'));return true;}
 if(activeScene?.kind==='interior'&&o.type==='inn'){if(activeScene.key==='highmereInn'){startDialogue([['Inn steward','Welcome in. The hearth is warm, and there is supper on the table. Take a moment to rest.']],()=>openMenu('inn'));return true;}startDialogue([['Innkeeper','Welcome in. The hearth is warm, and there is supper on the table. Take a moment to rest.']],()=>openMenu('inn'));return true;}
 return false;
}
function interiorShelf(x,z,width=3.2){for(const side of[-1,1])box(x+side*width/2,2.3,z,.16,4.6,.2,'darkWood','#a1794b');for(const y of[.3,1.4,2.5,3.6]){box(x,y,z,width,.13,.9,'wood','#bc9363');for(let i=0;i<5;i++){const px=x-width*.36+i*width*.18,k=i%3;if(k===0){mesh(new THREE.CylinderGeometry(.14,.21,.32,8),material('metal','#8aa8a1',{roughness:.35}),px,y+.22,z);mesh(new THREE.SphereGeometry(.18,8,6),material('lightFacets','#6ba79d',{emissive:'#55887d',emissiveIntensity:.18}),px,y+.35,z);}else box(px,y+.3,z,.22,.5,.48,k===1?'cloth':'wood',k===1?'#667a87':'#c4a171');}}}
function roomCrate(x,z,s=1){const y=.5*s;box(x,y,z,s,s,s,'crateFace','#b8a27a');obstacle(x,z,s+.15,s+.15,'interior crate');}
function roomCandle(x,y,z){mesh(new THREE.CylinderGeometry(.09,.13,.12,7),material('metal','#b59b5c'),x,y,z);box(x,y+.18,z,.08,.32,.08,'plaster','#efe1bd');const flame=mesh(new THREE.ConeGeometry(.075,.25,7),new THREE.MeshBasicMaterial({color:'#ffcb79'}),x,y+.45,z);world.userData.candles??=[];world.userData.candles.push({mesh:flame,x,z});lantern(x,y+.5,z);}
function buildJourneyInterior(id,spawn){
 resetJourneyWorld(id);const spec=INTERIORS[id];state.interiorReturn??={id:POIS[spec.poi].id,poi:spec.poi,spawn:POIS[spec.poi].spawn};state.poi=spec.poi;world.userData.interior=spec.type;
 const floor=box(0,-.16,0,25,.3,19,spec.type==='inn'?'wood':'interiorFloor','#ded5bc');floor.castShadow=false;floor.userData.terrain=true;world.userData.terrain=floor;world.userData.walkSurfaces=[floor];world.userData.terrainChunks=[];
 box(0,2.7,-9.3,25,5.4,.55,'darkWood','#a49577');for(const x of[-12.3,12.3])box(x,2.7,-.5,.45,5.4,18,'wood','#8b795e');
 for(let x=-12;x<=12;x+=3){box(x,2.8,-8.95,.23,5.6,.27,'wood','#c4af87');box(x,5.45,-9.1,3.2,.25,.75,'darkWood','#b59c71');}for(const x of[-12,12])for(let z=-8;z<=8;z+=3.2)box(x,2.6,z,.32,5.2,.23,'darkWood','#b59c71');
 for(const z of[-8,-2,5])for(const x of[-11.95,11.95]){box(x,1.3,z,.4,.3,2,'wall','#a5b3aa');box(x,3.4,z,.18,1.9,1.4,'window','#c7e0cf');}
 obstacle(0,-9.3,25,.7,'interior wall');for(const x of[-12.3,12.3])obstacle(x,-.5,.7,18,'interior wall');
 if(spec.type==='shop'){
  for(const x of[-7.5,0,7.5])interiorShelf(x,-8.15,4);
  // The rear counter leaves two clear customer aisles and a spacious foreground.
  box(0,.85,-3.4,14,1.7,1.5,'darkWood','#967b56');box(0,1.78,-3.4,14.5,.16,1.8,'wall','#c3c7b5');obstacle(0,-3.4,14,1.8,'shop counter');
  for(const x of[-7.1,7.1]){box(x,.85,-1.9,1.25,1.7,3.9,'darkWood','#9d805b');box(x,1.78,-1.9,1.55,.16,4.2,'wall','#c3c7b5');obstacle(x,-1.9,1.4,4,'counter return');}
  if(id!=='brookShop')for(let i=0;i<6;i++){const x=-4.8+i*1.9,y=3.2;box(x,y,-8.8,.1,2,.1,'metal','#bbc6be');const sword=box(x,y+.4,-8.65,.12,1.8,.09,'metal','#cbd8cf');sword.rotation.z=(i%2-.5)*.12;box(x,y-.25,-8.6,.6,.09,.13,'metal','#c9aa68');box(x,y-.5,-8.65,.12,.45,.14,'wood','#8f7155');}
  for(const x of[-9.7,9.7]){roomCrate(x,1.7,1.25);roomCrate(x,3.1,1.1);barrel(x,-5.9);}
  for(const x of[-5,5])roomCandle(x,1.92,-3.5);
  createInteraction('shop',0,-5,'Browse equipment and provisions',({brookShop:'merchant',highmereShop:'capital-stall',fernShop:'fern-hunter',alderShop:'alder-market'})[id]);interactables.at(-1).actor.scripted=true;
  createInteraction('villager',5,-5.3,id==='fernShop'?'Talk to the potter':'Talk to the apprentice',({brookShop:'worker',highmereShop:'capital-post',fernShop:'fern-potter',alderShop:'alder-orchard'})[id]);interactables.at(-1).actor.scripted=true;
 }else if(spec.type==='inn'){
  box(-4.7,.85,-4,10.5,1.7,1.5,'darkWood','#947855');box(-4.7,1.78,-4,11,.16,1.8,'wood','#d2b986');obstacle(-4.7,-4,10.6,1.8,'inn counter');interiorShelf(-6,-8.1,8);
  createInteraction('inn',-4.5,-5.6,'Rest at the inn',id==='highmereInn'?'capital-inn':'innkeeper');interactables.at(-1).actor.scripted=true;
  // A travelers' lounge: hearth, maps, reading shelves and a music corner.
  box(8,1.5,-7,5,3,1.4,'wall','#aab4a6');box(8,3.1,-7,5.5,.25,1.8,'wood','#bda170');box(8,1.2,-6.2,2.3,1.8,.14,'darkWood','#272b29');obstacle(8,-7,5.5,2,'hearth');
  for(const x of[6.6,9.4])roomCandle(x,3.3,-7);for(const x of[5.2,10.5]){box(x,.7,-3.2,.6,1.4,.6,'wood','#9f815a');box(x,1.4,-3.2,.9,.18,.9,'wood','#c8ab78');obstacle(x,-3.2,1,1,'lounge stand');}
  interiorShelf(8,-.3,4.5);obstacle(8,-.3,4.8,1.5,'reading shelf');box(8,2.4,1.5,4.1,2.6,.13,'wood','#b8a174');box(8,2.4,1.6,3.7,2.2,.12,'cloth','#cdd3b4');
  for(const[x,z]of[[-7,1.3],[-1,1.5]]){mesh(new THREE.CylinderGeometry(1.5,1.5,.18,12),material('wood','#d2b080'),x,1.05,z);mesh(new THREE.CylinderGeometry(.13,.22,1,7),material('darkWood','#8a6847'),x,.5,z);obstacle(x,z,3,3,'table');roomCandle(x,1.18,z);for(const s of[-1,1]){box(x+s*1.8,.55,z,.8,.15,.8,'wood','#b29970');obstacle(x+s*1.8,z,.9,.9,'chair');for(const a of[-1,1])box(x+s*1.8+a*.28,.28,z,.08,.55,.65,'darkWood','#9c7f55');}}
  createInteraction('sleep',3.5,3.5,'Rest by the hearth until morning');
 }else if(spec.type==='archives'){
  for(const x of[-8,-3,3,8])interiorShelf(x,-8.1,3.8);for(const x of[-10,10])for(const z of[-4,1]){interiorShelf(x,z,2);obstacle(x,z,2.2,1.3,'bookcase');}
  box(0,.8,-3,9,1.6,2,'wood','#a58b63');obstacle(0,-3,9,2,'archive desk');for(const x of[-2.5,2.5])roomCandle(x,1.75,-3);createInteraction('archivist',0,-5.3,'Speak with the archivist','courier');interactables.at(-1).actor.scripted=true;createInteraction('records',2,-1.6,'Read the connected records');
 }else{
  box(0,.75,-4,15,1.5,2.8,'darkWood','#a28b62');box(0,1.55,-4,15.5,.15,3,'wood','#c5ae7a');obstacle(0,-4,15,3,'council table');for(const x of[-5,0,5])roomCandle(x,1.7,-4);for(const x of[-8.8,8.8]){box(x,3.2,-8.8,2.3,3.7,.14,'cloth','#3c667d');mesh(new THREE.OctahedronGeometry(.55,0),material('metal','#d4bd7d'),x,3.2,-8.55);}createInteraction('council',0,-6.2,'Present your findings','elder');interactables.at(-1).actor.scripted=true;
 }
 for(const o of interactables){if(['shop','inn','archivist','council'].includes(o.type))o.radius=o.type==='council'?4.6:o.type==='archivist'?4.2:3.7;}
 for(const o of interactables)if(o.actor){o.actor.face='south';o.actor.home={x:o.actor.x,z:o.actor.z};o.actor.action='idle';npcs.push(o.actor);}
 createInteraction('interiorExit',0,8,'Return outside');Object.assign(interactables.at(-1),{radius:2.3,visualHeight:.2});
 // Opaque fixtures batch by texture; actors and candle flames stay independent.
 const fixtures=new THREE.Group(),dynamic=new Set(actors.flatMap(a=>[a.mesh,a.shadow]));fixtures.userData.center=V3();fixtures.userData.chunk=true;world.add(fixtures);for(const o of [...world.children])if(o.isMesh&&!dynamic.has(o)&&o!==floor&&!world.userData.candles?.some(c=>c.mesh===o))fixtures.attach(o);mergeGroup(fixtures);world.userData.staticChunks=[fixtures];world.userData.lampSources=[];const oldLamps=[];world.traverse(o=>{if(o.isPointLight){world.userData.lampSources.push(o.position.clone());oldLamps.push(o);}});for(const l of oldLamps)l.removeFromParent();for(let i=0;i<6;i++){const l=new THREE.PointLight(i%2?'#accfca':'#ffc58a',i<4?12:0,20,2);l.position.set(i%2?8:-8,4,i<2?-5:3);world.add(l);world.userData.lanterns.push(l);}sceneBuildFilter=false;finishJourneyWorld(spawn??[0,5]);scene.background.set('#111315');scene.fog.near=70;scene.fog.far=160;
}
