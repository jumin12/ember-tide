// Fitted regional architecture follows the current Drive POI concepts. Every
// surface uses native material art; doors, steps and cutaway bounds share the
// same physical footprint.
function royalHouse(x,z,w,d,variant=0){
  const y=groundAt(x,z),h=5.5,front=d/2+.12,doorX=-w*.15,g=new THREE.Group(),roofShell=new THREE.Group();g.position.set(x,y,z);g.add(roofShell);world.add(g);
  g.userData={worldHouse:true,kind:'royal-home',footprint:{w,d},front:V3(0,0,1),door:V3(x+doorX,y,z+front+1),roofShell,architecture31:{theme:'royal',openings:[],door:[doorX,front],roofRise:w*.29}};
  const panel=(xx,yy,zz,ww,hh,dd,key='wall',color='#d8d7c5')=>box(xx,yy,zz,ww,hh,dd,key,color,g);
  panel(0,.17,0,w+.32,.34,d+.32);panel(0,h/2+.2,-d/2+.13,w,h,.26);
  for(const side of[-1,1])panel(side*(w/2-.13),h/2+.2,0,.26,h,d-.25);
  const left=-w/2,right=w/2,dl=doorX-1.02,dr=doorX+1.02;
  panel((left+dl)/2,h/2+.2,d/2-.13,dl-left,h,.26);panel((dr+right)/2,h/2+.2,d/2-.13,right-dr,h,.26);panel(doorX,(h+3.32)/2+.1,d/2-.13,2.04,h-3.12,.26);
  for(const yy of[.45,3.15,h+.17]){panel(0,yy,front,w+.3,.18,.35,'wall','#eeead6');for(const side of[-1,1])panel(side*(w/2+.035),yy,0,.27,.18,d+.2,'wall','#e6e3d0');}
  for(const side of[-1,1]){panel(side*(w/2-.12),h/2+.18,front+.07,.38,h+.2,.36,'wall','#ede8d5');panel(side*(w/2-.12),.3,front+.1,.65,.27,.62,'wall','#c7cabc');}
  door31(g,doorX,front);g.userData.architecture31.openings.push({kind:'door',x:doorX,y:1.63,w:2.31,h:3.18,face:'front'});
  for(const xx of[-w*.29,w*.29]){window31(g,xx,4.35,front+.06,0,.86);g.userData.architecture31.openings.push({kind:'window',x:xx,y:4.35,w:1.8,h:1.8,face:'front'});}
  window31(g,w*.28,1.93,front+.06,0,.86);for(const side of[-1,1])window31(g,side*(w/2+.10),3.9,0,side*Math.PI/2,.9);
  const roof=archRoof(roofShell,w+.9,d+.9,w*.29,'brook');roof.position.y=h+.2;
  for(const side of[-1,1]){beam(V3(-w/2-.42,h+.18,side*(d/2+.47)),V3(0,h+.2+w*.29,side*(d/2+.47)),.075,'wall','#d9dacb',roofShell);beam(V3(0,h+.2+w*.29,side*(d/2+.47)),V3(w/2+.42,h+.18,side*(d/2+.47)),.075,'wall','#d9dacb',roofShell);}
  for(let i=0;i<3;i++){const zz=front+.45+i*.39,top=.25-i*.07;panel(doorX,top-.09,zz,2.7,.18,.42,'wall','#d9d6bf');}
  world.userData.entrySteps31??=[];world.userData.entrySteps31.push({owner:g,x:doorX,z:front+.45,y:y+.25,width:2.7});
  for(const xx of[doorX-1.5,doorX+1.5]){panel(xx,1.65,front+.12,.25,3.15,.3,'wall','#e4dfcb');panel(xx,3.22,front+.12,.48,.14,.48,'wall','#f0e7cd');}
  panel(doorX,3.38,front+.14,3.35,.21,.65,'wall','#e9e2cb');lantern(w*.42,2.6,front+.4,g);
  for(const xx of[-w*.3,w*.3])for(let i=0;i<3;i++)plant(x+xx+(i-1)*.28,z+front+.3,.33,'flower',y+3.45);
  obstacle(x,z,w+.12,d+.12,'building');world.userData.buildings.push(g);architecture31.houses++;return g;
}
function woodlandHouse(x,z,w,d,variant=0){
 const y=groundAt(x,z),h=4.4,front=d/2+.1,g=new THREE.Group(),roofShell=new THREE.Group();g.position.set(x,y,z);g.add(roofShell);world.add(g);g.userData={worldHouse:true,kind:'forest-pavilion',footprint:{w,d},front:V3(0,0,1),door:V3(x,y,z+front+1),roofShell,architecture31:{theme:'forest-house',openings:[{kind:'door',x:0,y:1.63,w:2.31,h:3.18,face:'front'}],door:[0,front],roofRise:w*.28}};
 const timber=variant%2?'#9a8260':'#ac9470',stone='#aab2a0';box(0,.22,0,w+.5,.44,d+.4,'rock',stone,g);box(0,2.4,-d/2+.12,w,4.2,.24,'wood',timber,g);
 for(const side of[-1,1]){box(side*(w/2-.12),2.35,-d*.15,.24,4.3,d*.7,'wood',timber,g);for(const zz of[-d/2+.1,front]){box(side*(w/2-.2),h/2+.2,zz,.33,h,.33,'bark','#826b4b',g);box(side*(w/2-.2),.45,zz,.7,.45,.7,'wall',stone,g);}box(side*(w*.33),.9,front,.24,1.5,.24,'wood',timber,g);box(side*(w*.34),1.42,front,w*.27,.16,.18,'darkWood','#887347',g);box(side*w*.33,2.9,front,.12,1.1,.16,'wood',timber,g);}
 box(0,h+.05,front,w+.5,.28,.36,'darkWood','#8b7957',g);const roof=archRoof(roofShell,w+1.4,d+1.5,w*.28,'brook');roof.position.y=h+.15;roof.traverse(o=>{if(o.isMesh&&o.material?.userData.textureKey==='slate')o.material=material('wood',variant%2?'#6d7e65':'#7d896b',{side:THREE.DoubleSide});});
 door31(g,0,front);for(const side of[-1,1]){window31(g,side*(w/2+.14),2.7,-d*.1,side*Math.PI/2,.8);lantern(side*(w*.42),2.6,front+.35,g);}for(let i=0;i<3;i++)box(0,.24-i*.065,front+.4+i*.4,2.7,.2,.42,'rock',stone,g);
 obstacle(x,z,w+.12,d+.12,'building');world.userData.buildings.push(g);architecture31.houses++;return g;
};


function building(x,z,w,d,v,kit){
  const plantStart=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length])),start=colliders.length,g=kit==='fern'?woodlandHouse(x,z,w,d,v):kit==='relief'?reliefShelter(x,z,w,d):kit==='capital'?royalHouse(x,z,w,d,v):brookHouse(x,z,w,d,'home'),lane=closestLane(x,z),angle=Math.round(Math.atan2(lane.x-x,lane.z-z)/(Math.PI/2))*Math.PI/2;
  g.userData.plantRanges=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,{start:plantStart[k],end:a.length}]));
  if(kit!=='fern'&&kit!=='relief'&&kit!=='capital')for(const xx of[-w*.28,w*.28])window31(g,xx,4.3,-d/2-.1,Math.PI,.83);
  if(Math.abs(angle)>.01){const rotation=new THREE.Matrix4().makeTranslation(x,0,z).multiply(new THREE.Matrix4().makeRotationY(angle)).multiply(new THREE.Matrix4().makeTranslation(-x,0,-z));for(const[k,r]of Object.entries(g.userData.plantRanges??{}))for(let i=r.start;i<r.end;i++)world.userData.plantMatrices[k][i].premultiply(rotation);const swap=Math.abs(Math.sin(angle))>.5;for(const c of colliders.slice(start)){const p=V3(c.x,0,c.z).applyMatrix4(rotation);c.x=p.x;c.z=p.z;if(swap)[c.w,c.d]=[c.d,c.w];}g.rotation.y=angle;}
  const doorX=g.userData.architecture31.door?.[0]??-w*.15;g.updateMatrixWorld(true);g.userData.door=g.localToWorld(V3(doorX,0,d/2+1.1));g.userData.front=V3(Math.sin(angle),0,Math.cos(angle));return g;
}

function fernHouse(x,z,w,d,variant=0){return woodlandHouse(x,z,w,d,variant);}
