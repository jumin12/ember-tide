// Brookstead's authored, traversable diorama. Geometry, height and navigation
// share coordinates; the reference is never pasted over the playable world.
const BROOK={minX:-181,maxX:-78,minZ:27,maxZ:140,plaza:{x:-121,z:63,r:10.5},
 houses:[[-111,94,13,10.5,'inn'],[-116,46,9,8,'shop'],[-141,66,12,9,'forge'],[-156,92,8,7,'mill'],[-149,37,9,8,'home'],[-128,29,10,8,'home'],[-98,47,8,7,'home'],[-86,108,8,7,'home']]};
PLACES.approach=[-142.3,120];
function inBrook(x,z,pad=0){return x>BROOK.minX-pad&&x<BROOK.maxX+pad&&z>BROOK.minZ-pad&&z<BROOK.maxZ+pad;}
const areaBeforeBrook=areaAt;
areaAt=function(x,z){if(inBrook(x,z)){if(z>126)return'approach';if(z>109)return'entrance';if(x<-151&&z<103)return'waterworks';if(z>79)return'lane';return'square';}return areaBeforeBrook(x,z);};
Object.assign(TOWNS.find(t=>t.id==='square'),{x:BROOK.plaza.x,z:BROOK.plaza.z,r:62});
const roadsBeforeBrook=roadInfo;
roadInfo=function(x,z){const r=roadsBeforeBrook(x,z);return inBrook(x,z)?{...r,kind:'lane'}:r;};
function brookChannel(z){return -163-3*Math.sin(clamp((z-30)/70,0,1)*Math.PI)+30*smooth(92,122,z)+7*smooth(140,180,z);}
function brookWidth(z){return 4.2+.42*Math.sin(z*.17)+.28*Math.sin(z*.053)+1.05*smooth(104,117,z);}
function brookWaterLevel(z){return 6.15-1.6*smooth(63,76,z)-3*smooth(79.2,80.8,z)-2.95*smooth(97.2,98.8,z);}
const bridgeBeforeBrook=makeBridge;
makeBridge=function(x,z,length=20,width=6,stone=true){
 if(Math.abs(x+133)>.1||z!==120)return bridgeBeforeBrook(x,z,length,width,stone);
 const left=groundAt(x-length/2,z),right=groundAt(x+length/2,z),b={x,z,length,width,left,right};world.userData.bridges.push(b);
 const deck=xx=>mix(left,right,(xx+length/2)/length)+Math.sin((xx+length/2)/length*Math.PI)*.45+.12;
 const span=6.1,shape=new THREE.Shape();shape.moveTo(-length/2,-2.9);shape.lineTo(-length/2,deck(-length/2)-.16);
 for(let i=1;i<=40;i++){const xx=mix(-length/2,length/2,i/40);shape.lineTo(xx,deck(xx)-.16);}shape.lineTo(length/2,-2.9);shape.lineTo(span,-2.9);shape.lineTo(span,-.9);
 for(let i=1;i<=40;i++){const a=i/40*Math.PI;shape.lineTo(Math.cos(a)*span,-.9+Math.sin(a)*1.92);}shape.lineTo(-span,-2.9);shape.closePath();
 const solid=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,steps:1});solid.translate(0,0,-width/2);mesh(solid,material('wall','#b6c0c4'),x,0,z);
 const dg=new THREE.PlaneGeometry(length,width,40,4);dg.rotateX(-Math.PI/2);const p=dg.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,deck(p.getX(i)));dg.computeVertexNormals();const walk=mesh(dg,material('cobble','#edf0e5'),x,.012,z);walk.castShadow=false;world.userData.walkSurfaces.push(walk);
 for(const side of[-1,1]){
  for(let xx=-length/2+.4;xx<length/2;xx+=.8){const y=deck(xx);for(let row=0;row<3;row++)box(x+xx,y+.17+row*.24,z+side*width/2,.77,.215,.53,'wall',row%2?'#b6c0c4':'#d9dccb');box(x+xx,y+.83,z+side*width/2,.82,.16,.68,'wall','#edf0e5');}
  for(let i=0;i<23;i++){const a=(i+.5)/23*Math.PI,xx=Math.cos(a)*span,yy=-.9+Math.sin(a)*1.92;const block=box(x+xx,yy,z+side*(width/2+.02),.72,.37,.62,'wall','#d9dccb');block.rotation.z=Math.atan2(-1.92*Math.cos(a),span*Math.sin(a));}
  obstacle(x,z+side*width/2,length,.55,'bridge rail');
 }
};
const brookBaseLand=baseLand;
function brookLand(x,z){let h=1.3+2.5*(1-smooth(76,83,z))+2.4*(1-smooth(-135,-129,x))*(1-smooth(72,79,z));const bank=1-smooth(7,13,Math.abs(x-brookChannel(z)));if(z>25&&z<190)h=mix(h,Math.max(h,brookWaterLevel(z)+1.1),bank);const plaza=1-smooth(BROOK.plaza.r,BROOK.plaza.r+2.5,Math.hypot(x-BROOK.plaza.x,z-BROOK.plaza.z));return mix(h,3.8,plaza);}
baseLand=function(x,z){let old=brookBaseLand(x,z);const riverBank=1-smooth(7,13,Math.abs(x-brookChannel(z)));old=mix(old,Math.max(old,brookWaterLevel(z)+1.1),riverBank);if(!inBrook(x,z,9))return old;const edge=Math.min(x-BROOK.minX,BROOK.maxX-x,z-BROOK.minZ,BROOK.maxZ-z);return mix(old,brookLand(x,z),smooth(-8,3,edge));};
channelDistance=function(x,z){return Math.min(Math.abs(x-riverX(z))-riverWidth(z),Math.abs(x-brookChannel(z))-brookWidth(z));};
const groundBeforeBrook=groundAt;
groundAt=function(x,z){if(!inBrook(x,z,10)&&Math.abs(x-brookChannel(z))>13)return groundBeforeBrook(x,z);const base=baseLand(x,z),bank=channelDistance(x,z);let bed=-3.6;if(z<98&&Math.abs(x-brookChannel(z))<7)bed=brookWaterLevel(z)-1.8;return mix(bed,base,smooth(-1.25,2.3,bank));};
const terrainBeforeBrook=addContinuousTerrain;
addContinuousTerrain=function(){terrainBeforeBrook();for(const chunk of world.userData.terrainChunks){
 const positions=chunk.geometry.attributes.position,paths=chunk.geometry.attributes.pathMix;
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);if(!inBrook(x,z))continue;const d=roadDistance(x,z),jitter=noise(x*1.8,z*1.8)*.26;paths.setX(i,1-smooth(2.05+jitter,3.25+jitter,d));}paths.needsUpdate=true;
 const material=chunk.material,compile=material.onBeforeCompile;material.onBeforeCompile=shader=>{
 compile(shader);shader.vertexShader='attribute float riverMix;varying float vBrookRiver;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBrookRiver=riverMix;');shader.fragmentShader='varying float vBrookRiver;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('float riverbed=1.-smoothstep(-2.8,-1.1,vGround.y);','float riverbed=vBrookRiver;').replaceAll('*.35','*.25').replace('vGround.xz*.57','vGround.xz*.31').replace('vGround.xz*.4','vGround.xz*.42').replace('vGround.xz*.32','vGround.xz*.25');
 };material.customProgramCacheKey=()=> 'brook-physical-ground-v8';}};
const mergeBeforeBrookDensity=mergeGroup;
mergeGroup=function(group){mergeBeforeBrookDensity(group);for(const child of group.children){const g=child.geometry;if(!g?.attributes.tile||g.userData.brookDensity)continue;const uv=g.attributes.uv,tile=g.attributes.tile;for(let i=0;i<uv.count;i++){const scale=tile.getX(i)===3?.65:.5;uv.setXY(i,uv.getX(i)*scale,uv.getY(i)*scale);}uv.needsUpdate=true;g.userData.brookDensity=true;}};
const brookHeight=heightAt;
heightAt=function(x,z){
 if(Math.abs(x+132)<3.5&&Math.abs(z-68.5)<2.5){const t=clamp((-128.5-x)/7,0,.9999);return 3.8+2.4*Math.ceil(t*10)/10+.035;}
 for(const [cx,cz,w,len,lo,hi]of[[-124,79.5,5.2,7,1.3,3.8],[-101,79.5,5,7,1.3,3.8],[-140,75.5,4.8,7,3.8,6.2]]){
  if(Math.abs(x-cx)<w/2&&Math.abs(z-cz)<len/2){const t=clamp((cz+len/2-z)/len,0,.9999);return lo+(hi-lo)*Math.ceil(t*10)/10+.035;}
 }
 return brookHeight(x,z);
};
function brookPlanter(x,z,scale=.75,purple=false,parent=world,local=false){
 if(!local&&(roadDistance(x,z)<3.2||waterGround(x,z)))return null;
 const y=local?0:heightAt(x,z),g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
 const profile=[V3(.26,0),V3(.32,.08),V3(.4,.55),V3(.44,.6),V3(.43,.68),V3(.34,.68)].map(p=>new THREE.Vector2(p.x*scale,p.y*scale));
 mesh(new THREE.LatheGeometry(profile,10),material('earth',purple?'#8b604b':'#b88b60'),0,0,0,g);
 const soil=mesh(new THREE.CircleGeometry(.34*scale,12),material('earth','#45302a'),0,.61*scale,0,g);soil.rotation.x=-Math.PI/2;
 if(!local){plant(x,z,.7*scale,'flower',y+.75*scale);plant(x+.1*scale,z,.5*scale,'fern',y+.65*scale);}
 return g;
}
function brookBeamBox(g,x,y,z,w,h,d,key='wood',color='#ffffff'){return box(x,y,z,w,h,d,key,color,g);}
function brookImage(g,key,x,y,z,w,h){
 if(!textures[key])return null;const m=new THREE.MeshStandardMaterial({map:textures[key],alphaTest:.42,roughness:.9,side:THREE.DoubleSide});m.userData.textureKey=key;
 return mesh(new THREE.PlaneGeometry(w,h),m,x,y,z,g);
}
function brookSign(g,key,x,y,z){
 beam(V3(x,y+.8,z-.6),V3(x,y+.8,z+.25),.045,'metal','#576572',g);
 for(const dx of[-.42,.42])beam(V3(x+dx,y+.8,z+.25),V3(x+dx,y+.4,z+.25),.025,'metal','#576572',g);
 box(x,y,z,.08,1.3,.95,'darkWood','#765738',g).rotation.y=Math.PI/2;
 const p=brookImage(g,key,x,y,z+.5,1.45,1.45);if(p)p.material.polygonOffset=true;
}
function brookWindow(g,x,y,z,side=false){
 const a=new THREE.Group();a.position.set(x,y,z);a.rotation.y=side?Math.PI/2:0;g.add(a);
 box(0,0,0,1.35,1.65,.18,'darkWood','#45302a',a);
 box(0,0,.12,1.02,1.3,.035,'cloth','#f5d8b7',a,{emissive:'#ffb652',emissiveIntensity:.45});
 for(const xx of[-.54,0,.54])box(xx,0,.18,.09,1.46,.09,'wood','#674737',a);
 for(const yy of[-.62,0,.62])box(0,yy,.19,1.19,.08,.09,'wood','#674737',a);
 for(const xx of[-.85,.85]){box(xx,0,.1,.38,1.65,.1,'wood','#765738',a);for(const yy of[-.52,.52])box(xx,yy,.18,.4,.065,.05,'metal','#55666a',a);}
 box(0,-.9,.12,1.8,.17,.45,'wall','#d9dccb',a);box(0,.95,.1,1.65,.18,.31,'wood','#aa7d51',a);
 brookImage(a,'window',0,0,.245,1.13,1.49);
}
function brookHouse(x,z,w,d,kind){
 const h=kind==='inn'?6.1:kind==='mill'?3.5:kind==='shop'?5:5.5,y=groundAt(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);
 g.userData={worldHouse:true,brookHouse:true,kind,footprint:{w,d},front:V3(0,0,1),door:V3(x-w*.15,y,z+d/2+1.1)};
 const roofShell=new THREE.Group();g.add(roofShell);g.userData.roofShell=roofShell;
 box(0,.12,0,w+.6,.45,d+.6,'wall','#d9dccb',g);
 if(kind==='mill'){for(const xx of[-w*.38,w*.38])for(const zz of[-d*.38,d*.38])box(xx,-.8,zz,.72,2.1,.72,'wall','#a8b2a7',g);for(const zz of[-d*.36,d*.36])box(0,-.06,zz,w+1,.3,.25,'wood','#8a6041',g);}
 box(0,h/2+.25,0,w,h,d,'plaster','#efe1bd',g);
 box(0,.53,0,w-.25,.12,d-.25,'wood','#c59b69',g);
 // The foundation and all visible quoin courses are separate shallow stonework.
 for(let row=0;row<3;row++)for(let xx=-w/2+.38;xx<w/2;xx+=.78){const q=box(xx+(row%2)*.18,.35+row*.26,d/2+.06,.7,.22,.17,'wall','#a8b2a7',g);q.rotation.z=Math.sin(xx*9+row)*.014;}
 for(const xx of[-w/2,w/2])for(const zz of[-d/2,d/2])box(xx,h/2+.25,zz,.27,h+.5,.27,'darkWood','#674737',g);
 for(const yy of[1.05,h*.53,h]){box(0,yy,d/2+.09,w+.25,.2,.22,'wood','#8a6041',g);box(w/2+.09,yy,0,.22,.2,d+.25,'wood','#8a6041',g);}
 for(let xx=-w/2+2;xx<w/2;xx+=2.55)box(xx,h*.76,d/2+.1,.16,h*.47,.18,'wood','#8a6041',g);
 for(let zz=-d/2+1.6;zz<d/2;zz+=2.4)box(w/2+.1,h/2,zz,.18,h,.16,'wood','#8a6041',g);
 for(const xx of[-w*.08,w*.08])beam(V3(xx,h*.55,d/2+.16),V3(xx+(xx<0?1:-1),h*.94,d/2+.16),.075,'darkWood','#674737',g);
 const roofHeight=w*.31,roof=archRoof(roofShell,w+1.25,d+1.4,roofHeight,'brook');roof.position.y=h+.15;
 // Thin raised slate courses make the silhouette and light-catching eaves physical.
 for(const side of[-1,1])for(let row=1;row<=8;row++){
  const t=row/8,xx=side*t*(w/2+.62),yy=h+.2+roofHeight*(1-t);
  beam(V3(xx,yy,-d/2-.75),V3(xx,yy,d/2+.75),.027,'slate','#84929b',roofShell);
 }
 for(const zz of[-d/2-.73,d/2+.73]){beam(V3(-w/2-.62,h+.14,zz),V3(0,h+roofHeight+.22,zz),.12,'wood','#674737',roofShell);beam(V3(0,h+roofHeight+.22,zz),V3(w/2+.62,h+.14,zz),.12,'wood','#674737',roofShell);}
 // Exposed pegged trusses follow each gable's actual triangular profile.
 for(const side of[-1,1]){const zz=side*(d/2+.04);
  box(0,h+roofHeight*.45,zz,.22,roofHeight*.9,.2,'darkWood','#674737',roofShell);
  for(const sx of[-1,1]){
   beam(V3(0,h+.24,zz),V3(sx*w*.34,h+roofHeight*.31,zz),.105,'wood','#8a6041',roofShell);
   beam(V3(sx*w*.3,h+.24,zz),V3(sx*w*.3,h+roofHeight*.34,zz),.08,'wood','#8a6041',roofShell);
  }
  if(side===1&&kind!=='mill')brookWindow(roofShell,0,h+roofHeight*.35,zz+.15);
 }
 for(const xx of[-w/2-.2,w/2+.2]){
  box(xx,h+.04,0,.28,.2,d+1.2,'darkWood','#674737',roofShell);
  for(const zz of[-d*.35,0,d*.35])beam(V3(xx,h-.55,zz),V3(xx*.94,h-.03,zz),.085,'wood','#aa7d51',g);
 }
 // Lower diagonal braces and stone side courses prevent blank box facades.
 for(const side of[-1,1]){
  const xx=side*(w/2+.13);
  for(const zz of[-d*.25,d*.24])beam(V3(xx,1.1,zz-.65),V3(xx,h*.52,zz+.65),.085,'wood','#8a6041',g);
  for(let row=0;row<3;row++)for(let zz=-d/2+.38;zz<d/2;zz+=.78)box(xx,.35+row*.26,zz+(row%2)*.16,.18,.22,.71,'wall','#b6c0c4',g);
 }
 const cx=-w*.32,cz=-d*.22,ch=h+roofHeight*.8;
 box(cx,ch-.7,cz,1.05,3.2,1.05,'wall','#b6c0c4',roofShell);
 for(let row=0;row<8;row++){box(cx,ch-2.1+row*.4,cz+.54,1.12,.065,.06,'plaster','#d9dccb',roofShell);if(row%2===0)box(cx+.54,ch-1.93+row*.4,cz,.05,.32,1.08,'wall','#a8b2a7',roofShell);}
 box(cx,ch+.97,cz,1.36,.22,1.36,'wall','#d9dccb',roofShell);box(cx,ch+1.1,cz,.8,.08,.8,'darkWood','#2b1c1e',roofShell);
 const doorX=-w*.15,front=d/2+.14;
 box(doorX,1.73,front,1.9,2.95,.21,'darkWood','#45302a',g);brookImage(g,'door',doorX,1.77,front+.13,1.8,3);
 for(const xx of[doorX-1.06,doorX+1.06])box(xx,1.66,front,.16,3.1,.33,'wood','#aa7d51',g);
 box(doorX,3.19,front,2.3,.18,.45,'wood','#aa7d51',g);
 for(let n=0;n<4;n++)box(doorX,.04+n*.1,d/2+1.2-n*.29,2.9,.15,.36,'wall','#d9dccb',g);
 brookWindow(g,w*.28,1.95,front);if(kind!=='mill'){brookWindow(g,-w*.31,h-1.18,front);brookWindow(g,w*.3,h-1.18,front);}
 for(const zz of[-d*.24,d*.25])brookWindow(g,w/2+.13,kind==='mill'?1.9:h-1.2,zz,true);
 for(const xx of(kind==='mill'?[w*.28]:[-w*.33,w*.28])){
  box(xx,h-2.3,front+.23,1.95,.4,.63,'wood','#aa7d51',g);
  for(let k=0;k<5;k++)plant(x+xx+(k-2)*.31,z+d/2+.35,.46,'flower',y+h-2.05);
 }
 if(kind==='inn'){
  const wing=new THREE.Group();wing.position.set(w*.37,0,-d*.18);wing.rotation.y=Math.PI/2;g.add(wing);
  box(w*.35,2.35,d*.1,d*.65+1.5,4.7,w*.6,'plaster','#efe1bd',g);
  box(w*.35+(d*.65+1.5)/2,2.35,d*.1,.2,4.7,w*.6,'wood','#8a6041',g);
  brookWindow(g,w*.35+(d*.65+1.5)/2+.13,2.3,d*.22,true);
  obstacle(x+w*.35,z+d*.1,d*.65+1.5,w*.6,'building');
  const r=archRoof(roofShell,w*.6,d*.65+1.5,w*.15,'brook');r.position.set(w*.35,h-1.2,d*.1);r.rotation.y=Math.PI/2;
  brookSign(g,'innSign',w*.35,3.3,front+.75);
 }else if(kind==='shop'){
  const verts=[],uv=[],ind=[],ww=w*.76,depth=3.2;
  for(let j=0;j<=8;j++)for(let i=0;i<=16;i++){const t=j/8,u=i/16;verts.push((u-.5)*ww,3.65-t*.65+Math.sin(t*Math.PI)*.14,front+t*depth);uv.push(u*3,t);}
  for(let j=0;j<8;j++)for(let i=0;i<16;i++){const a=j*17+i;ind.push(a,a+17,a+1,a+1,a+17,a+18);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ind);geo.computeVertexNormals();mesh(geo,material('cloth','#f7edda',{side:THREE.DoubleSide}),0,0,0,g);
  for(const xx of[-ww/2,ww/2])box(xx,1.55,front+depth,.15,3.2,.15,'wood','#aa7d51',g);
  const counterX=w*.22,counterW=w*.46;box(counterX,1,front+2.25,counterW,.17,.8,'wood','#c59b69',g);
  for(const xx of[counterX-counterW*.38,counterX+counterW*.38])box(xx,.48,front+2.25,.17,1,.7,'wood','#8a6041',g);
  obstacle(x+counterX,z+front+2.25,counterW,.8,'market stall');
  brookSign(g,'shopSign',-w*.35,4.1,front+.4);
 }else if(kind==='forge'){
  const shed=new THREE.Group();shed.position.set(-w*.48,0,d*.2);g.add(shed);
  for(const xx of[-2.4,2.4])box(xx,1.65,1.6,.22,3.3,.22,'wood','#8a6041',shed);
  box(0,3.5,.2,5.6,.2,4.5,'slate','#6184a3',shed).rotation.x=.07;
  box(-1.2,1.1,-.4,2.3,2.2,1.8,'wall','#a8b2a7',shed);box(-1.2,1.25,.53,1.48,.9,.05,'darkWood','#2b1c1e',shed);
  box(-1.2,1.2,.57,1.1,.33,.04,'cloth','#d69e70',shed,{emissive:'#ff721c',emissiveIntensity:2.4});
  box(1,.8,1.3,1.6,.3,.7,'metal','#55666a',shed);box(1,.45,1.3,.5,.6,.48,'metal','#55666a',shed);
  brookSign(g,'forgeSign',w*.36,3.65,front+.5);
 }
 // Flower boxes and climbing vines frame openings instead of covering them.
 for(const side of[-1,1])for(let j=0;j<5;j++)plant(x+side*(w*.5+.07),z+d*.28,.78,'ivy',y+.7+j*.6);
 if(kind==='inn'||kind==='home'){
  const pw=w*.58,pz=front+1.55;
  for(const xx of[-pw/2,pw/2]){box(xx,1.5,pz+.8,.19,3,.19,'wood','#aa7d51',g);beam(V3(xx,2.0,pz+.8),V3(xx,2.9,pz+.12),.075,'wood','#c59b69',g);}
  const porch=box(0,3.18,pz,pw+.7,.16,3.1,'slate','#6184a3',g);porch.rotation.x=.13;
  for(let row=0;row<5;row++)beam(V3(-pw/2-.35,3.2-row*.08,front+.2+row*.6),V3(pw/2+.35,3.2-row*.08,front+.2+row*.6),.022,'slate','#84929b',g);
  for(const xx of[-pw/2,pw/2])obstacle(x+xx,z+pz+.8,.23,.23,'porch post');
 }
 if(kind==='inn'||kind==='forge'){
  const dormer=new THREE.Group();dormer.position.set(w*.22,h+roofHeight*.32,d*.15);roofShell.add(dormer);
  box(0,.73,.45,2.3,1.5,1.65,'plaster','#efe1bd',dormer);const dr=archRoof(dormer,2.8,2.2,.9,'brook');dr.position.y=1.45;brookWindow(dormer,0,.68,1.32);
 }
 for(const xx of[-w*.4,w*.44]){lantern(xx,2.7,front+.45,g);brookPlanter(x+xx,z+d/2+.85,1.15,xx>0);}
 for(let i=0;i<3;i++){const xx=x+w*.45+i*.8,zz=z+d*.35;if(roadDistance(xx,zz)>3.5)barrel(xx,zz);}
 obstacle(x,z,w+.2,d+.2,'building');world.userData.buildings.push(g);return g;
}
function brookFence(x0,z0,x1,z1){
 const length=Math.hypot(x1-x0,z1-z0),n=Math.ceil(length/1.8);
 for(let i=0;i<n;i++){const t=i/n,x=mix(x0,x1,t),z=mix(z0,z1,t),y=heightAt(x,z),nx=mix(x0,x1,(i+1)/n),nz=mix(z0,z1,(i+1)/n),ny=heightAt(nx,nz),mx=(x+nx)/2,mz=(z+nz)/2;
  if(roadDistance(mx,mz)<3.5||waterGround(mx,mz))continue;
  for(const [xx,zz,yy]of[[x,z,y],[nx,nz,ny]]){box(xx,yy+.63,zz,.22,1.26,.22,'wood','#8a6041');box(xx,yy+1.3,zz,.3,.13,.3,'wood','#c59b69');box(xx,yy+.1,zz,.34,.25,.34,'wall','#a8b2a7');}
  for(const h of[.45,.95])beam(V3(x,y+h,z),V3(nx,ny+h,nz),.095,'wood','#c59b69');
  obstacle(mx,mz,Math.max(.18,Math.abs(nx-x)),Math.max(.18,Math.abs(nz-z)),'garden fence');
 }
}
function brookWall(x0,x1,z,bottom,top,gaps=[]){
 for(let x=x0;x<x1;x+=1.15){if(gaps.some(([a,b])=>x>a&&x<b))continue;
  for(let y=bottom+.22,row=0;y<top;y+=.43,row++)box(x+(row%2)*.15,y,z,1.08,.38,.75,'wall',row%3?'#b6c0c4':'#d9dccb');
  box(x,top+.06,z,1.15,.18,.96,'wall','#d9dccb');obstacle(x,z,1.15,.75,'terrace wall');
 }
}
function brookStairs(x,z,w,len,lo,hi){
 for(let i=0;i<10;i++){const depth=len/10,zz=z+len/2-(i+.5)*depth,top=lo+(hi-lo)*(i+1)/10;
  const o=box(x,(top+lo)/2-.03,zz,w,top-lo+.06,depth+.035,'cobble','#d9dccb');world.userData.walkSurfaces.push(o);
  box(x,top+.01,zz+depth*.43,w+.06,.06,.13,'wall','#edf0e5');
 }
 for(const s of[-1,1]){const xx=x+s*(w/2+.32);beam(V3(xx,lo+.9,z+len/2),V3(xx,hi+.9,z-len/2),.07,'wood','#c59b69');for(const dz of[-len/2,len/2])box(xx,heightAt(xx,z+dz)+.55,z+dz,.4,1.1,.4,'wall','#d9dccb');}
}
function brookFountain(){
 const {x,z,r}=BROOK.plaza,y=heightAt(x,z),g=new THREE.Group();g.position.set(x,y+.025,z);world.add(g);
 const paving=mesh(new THREE.CircleGeometry(r,96),material('cobble','#edf0e5'),0,.035,0,g);paving.rotation.x=-Math.PI/2;
 const uv=paving.geometry.attributes.uv,p=paving.geometry.attributes.position;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*.84,p.getY(i)*.84);
 for(const rad of[4.2,7.2,10.1]){const count=Math.round(rad*TAU/.69);for(let i=0;i<count;i++){const a=i/count*TAU,o=box(Math.cos(a)*rad,.052,Math.sin(a)*rad,.68,.035,.4,'wall','#c8cebd',g);o.rotation.y=-a+Math.PI/2;}}
 for(let i=0;i<24;i++){const a=i/24*TAU,o=box(Math.cos(a)*2.5,.5,Math.sin(a)*2.5,.72,.7,.53,'wall',i%3?'#b6c0c4':'#d9dccb',g);o.rotation.y=-a;box(Math.cos(a)*2.5,.9,Math.sin(a)*2.5,.76,.15,.64,'wall','#edf0e5',g).rotation.y=-a;}
 const waterDisk=mesh(new THREE.CircleGeometry(2.24,48),new THREE.MeshStandardMaterial({color:'#3a9291',roughness:.12,metalness:.15,transparent:true,opacity:.88}),0,.69,0,g);waterDisk.rotation.x=-Math.PI/2;waterDisk.castShadow=false;
 for(const [radius,yy,h]of[[.76,.5,1.2],[1.1,1.5,.23],[.4,2.0,1],[.62,2.6,.19]])mesh(new THREE.CylinderGeometry(radius,radius*1.05,h,16),material('wall','#d9dccb'),0,yy,0,g);
 for(let i=0;i<8;i++){const a=i/8*TAU,curve=new THREE.QuadraticBezierCurve3(V3(Math.cos(a)*.48,2.71,Math.sin(a)*.48),V3(Math.cos(a)*1.1,2.1,Math.sin(a)*1.1),V3(Math.cos(a)*1.8,.72,Math.sin(a)*1.8));const stream=mesh(new THREE.TubeGeometry(curve,18,.026,5,false),material('cloth','#c3d4d6',{transparent:true,opacity:.7,emissive:'#3a9291',emissiveIntensity:.12}),0,0,0,g);stream.castShadow=false;stream.userData.dynamicWater=true;world.userData.supplyJets??=[];world.userData.supplyJets.push(stream);}
 world.userData.fountains.push(V3(x,y+2.75,z));obstacle(x,z,5.3,5.3,'fountain');
 for(const a of[.5,1.7,2.9,4.1,5.3])brookPlanter(x+Math.cos(a)*4,z+Math.sin(a)*4,1.05,a>3);
}
const priorBrookSettlements=buildSettlements;
buildSettlements=function(){
 priorBrookSettlements();
 for(const spec of BROOK.houses)brookHouse(...spec);
 brookWall(-135,-94,76,1.3,3.8,[[-128,-120],[-105,-97]]);brookWall(-157,-132,72,3.8,6.2,[[-144,-136]]);
 brookStairs(-124,79.5,5.2,7,1.3,3.8);brookStairs(-101,79.5,5,7,1.3,3.8);brookStairs(-140,75.5,4.8,7,3.8,6.2);
 for(let i=0;i<10;i++){const xx=-128.5-(i+.5)*.7,top=3.8+2.4*(i+1)/10;box(xx,(top+3.8)/2-.03,68.5,.735,top-3.8+.06,5,'cobble','#d9dccb');box(xx+.29,top+.015,68.5,.13,.06,5.1,'wall','#edf0e5');}
 brookFountain();
 bench(-130,60,Math.PI/2);bench(-110,73,-Math.PI/2);
 for(const f of[[-121,105,-103,105],[-100,103,-100,95],[-103,88,-100,88],[-116,72,-112,72],[-108,57,-100,57],[-100,57,-100,63],[-157,82,-151,82],[-161,100,-155,100],[-93,119,-81,119],[-81,119,-81,112],[-120,36,-108,36],[-96,130,-82,130],[-82,130,-82,122],[-96,130,-96,124]])brookFence(...f);
 for(const [x,z]of[[-146,117],[-125,117],[-128,74],[-130,63],[-111,65],[-108,52],[-146,75],[-159,80],[-160,66],[-106,102],[-95,109]]){const y=heightAt(x,z);box(x,y+1.7,z,.17,3.4,.17,'darkWood','#8a6041');beam(V3(x,y+3.4,z),V3(x+.7,y+3.4,z),.07,'wood','#aa7d51');lantern(x+.7,y+2.96,z);}
 world.userData.brookstead={terraces:[1.3,3.8,6.2],referenceLayout:true};
};
// The water steps down through two real cascades, then passes below the entry
// bridge. Each elevated pool owns a reflection plane and target.
function brookRibbon(z0,z1,center,width,main=false){
 const verts=[],uv=[],across=[],index=[],rows=Math.ceil((z1-z0)*1.5),cols=12;
 for(let j=0;j<=rows;j++){const z=mix(z0,z1,j/rows);for(let i=0;i<=cols;i++){const a=i/cols*2-1;verts.push(center(z)+a*width(z),0,z);uv.push(i/cols,j/rows);across.push(a);}}
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i;index.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(across,1));g.setIndex(index);g.computeVertexNormals();return g;
}
function brookWaterfall(z,top,bottom,halfSpan=.8){
 const x=brookChannel(z),positions=[],uv=[],across=[],normals=[],indices=[],cols=12,rows=32;
 // The lip and toe share the river's exact bank widths, vertices and normals.
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
  const t=j/rows,zz=z-halfSpan+t*halfSpan*2,a=i/cols*2-1,yy=mix(top,bottom,t*t*(3-2*t));
  positions.push(brookChannel(zz)+a*(brookWidth(zz)+1.05)-x,yy-top,zz-z);
  const n=V3(0,1,-(bottom-top)*6*t*(1-t)/(halfSpan*2)).normalize();normals.push(n.x,n.y,n.z);uv.push(i/cols,t);across.push(a);
 }
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i;indices.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
 const g=new THREE.BufferGeometry();for(const [name,data,size]of[['position',positions,3],['normal',normals,3],['uv',uv,2],['riverAcross',across,1]])g.setAttribute(name,new THREE.Float32BufferAttribute(data,size));g.setIndex(indices);g.computeBoundingSphere();g.computeBoundingBox();
 const old=water;buildWater({waterX:0});const o=water;water=old;o.geometry.dispose();o.geometry=g;o.position.set(x,top,z);o.userData.dynamicWater=true;o.userData.waterfall=true;o.userData.join={z,top,bottom,halfSpan};
 const pools=world.userData.waterPools,upper=pools.find(p=>p.position.y===top),lower=pools.find(p=>p.position.y===bottom)??old,r=o.material.userData.riverReflection;
 r.matrix=lower.userData.reflMatrix;r.texture=lower.userData.poolTarget?.texture??reflectionTarget.texture;r.upperMatrix=upper.userData.reflMatrix;r.upperTexture=upper.userData.poolTarget.texture;r.cascade=z;r.span=halfSpan;
 const bounds=g.boundingBox.clone().translate(o.position);o.userData.joinBounds=bounds;upper.userData.poolPatches.push(bounds);if(lower.userData.poolPatches)lower.userData.poolPatches.push(bounds);
 world.userData.brookFalls??=[];world.userData.brookFalls.push(o.material);world.userData.brookFallObjects??=[];world.userData.brookFallObjects.push(o);
 const w=(brookWidth(z)+1.05)*2,fp=[],random=seeded(Math.round(z*87));for(let i=0;i<80;i++)fp.push((random()-.5)*w,.08+random()*.18,.8+random()*.9);
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));fg.computeBoundingSphere();
 const uniforms={time:brookHydraulics.time,flow:brookHydraulics.flow,daylight:brookHydraulics.light};
 const fm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,
 vertexShader:'uniform float time,flow;varying float foamVisible;void main(){foamVisible=.25+.75*flow;vec3 p=position;p.y+=max(0.,sin(time*2.+position.x*13.))*.12*flow;vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;gl_PointSize=clamp(24./max(1.,-v.z),1.,4.);}',
 fragmentShader:'uniform float flow,daylight;varying float foamVisible;void main(){float a=1.-smoothstep(.15,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(vec3(.80,.94,.96)*daylight,a*.5*flow*foamVisible);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
 const foam=new THREE.Points(fg,fm);foam.position.set(x,bottom,z);foam.renderOrder=2;foam.userData.dynamicWater=true;world.add(foam);
}
buildGlobalWater=function(){
 const initialHead=state.flags.gate_open?(state.flags.pump_repaired?4.68:4.85):6.15;brookHydraulics.head.value=initialHead;
 brookHydraulics.flow.value=state.flags.gate_open?(state.flags.pump_repaired?.72:.28):.025;brookHydraulics.time.value=0;
 buildWater({waterX:-43});water.geometry.dispose();water.geometry=brookRibbon(-290,210,riverX,z=>riverWidth(z)+2);const main=water;
 // Add the lower branch to the main plane without changing its reflection level.
 const branch=brookRibbon(98.8,221,brookChannel,z=>brookWidth(z)+1.05),merged=new THREE.BufferGeometry(),a=main.geometry.toNonIndexed(),b=branch.toNonIndexed();
 for(const key of['position','normal','uv','riverAcross']){const aa=a.attributes[key],bb=b.attributes[key],data=new Float32Array(aa.array.length+bb.array.length);data.set(aa.array);data.set(bb.array,aa.array.length);merged.setAttribute(key,new THREE.BufferAttribute(data,aa.itemSize));}main.geometry.dispose();main.geometry=merged;a.dispose();b.dispose();branch.dispose();
 world.userData.waterPools=[];
 for(const [z0,z1,level]of[[-290,69.8,initialHead],[70.2,79.2,4.55],[80.8,97.2,1.55]]){
  buildWater({waterX:-139});const pool=water;pool.geometry.dispose();pool.geometry=brookRibbon(z0,z1,brookChannel,z=>brookWidth(z)+1.05);pool.position.y=level;pool.userData.terracedWater=true;pool.userData.waterRole=z1<70?'reservoir':z0<80?'headrace':'millrace';
  const target=new THREE.WebGLRenderTarget(scenery.software?256:640,scenery.software?144:360),compile=pool.material.onBeforeCompile;pool.userData.poolTarget=target;
  pool.material.onBeforeCompile=sh=>{compile(sh);sh.uniforms.reflectionTex.value=target.texture;};pool.material.customProgramCacheKey=()=> 'brook-pool-'+level;
  pool.geometry.computeBoundingBox();pool.userData.poolBounds=pool.geometry.boundingBox.clone().translate(V3(0,level,0));pool.userData.poolPatches=[];for(let z=z0;z<z1;z+=20){const xs=[brookChannel(z),brookChannel(Math.min(z+20,z1))];pool.userData.poolPatches.push(new THREE.Box3(V3(Math.min(...xs)-6,level-.1,z),V3(Math.max(...xs)+6,level+.1,Math.min(z+20,z1))));}pool.userData.levelPatchCount=pool.userData.poolPatches.length;world.userData.waterPools.push(pool);
 }
 water=main;brookWaterfall(70,initialHead,4.55,.2);brookWaterfall(80,4.55,1.55);brookWaterfall(98,1.55,-1.4);
 world.userData.connectedWater=true;world.userData.waterCourse=CANAL_COURSE;world.userData.waterPatches=[];
 for(let z=-290;z<210;z+=24){const a=riverX(z),b=riverX(z+24);world.userData.waterPatches.push(new THREE.Box3(V3(Math.min(a,b)-10,-1.6,z),V3(Math.max(a,b)+10,-1.2,z+24)));}
 for(let z=98;z<221;z+=20){const a=brookChannel(z),b=brookChannel(z+20);world.userData.waterPatches.push(new THREE.Box3(V3(Math.min(a,b)-6,-1.6,z),V3(Math.max(a,b)+6,-1.2,z+20)));}
 // Refresh the lower reflection even when only the cascade is on screen.
 for(const fall of world.userData.brookFallObjects)if(fall.userData.join.bottom===main.position.y)world.userData.waterPatches.push(fall.geometry.boundingBox.clone().translate(fall.position));
 const random=seeded(38211);
 for(let z=30;z<160;z+=1.45)for(const side of[-1,1]){
  const x=brookChannel(z)+side*(brookWidth(z)+.65),y=baseLand(x,z),level=brookWaterLevel(z),bridge=world.userData.bridges.some(b=>Math.abs(z-b.z)<b.width/2+.5&&Math.abs(x-b.x)<b.length/2);
  if(!bridge){
   if(z<98||z>113&&z<126){const top=Math.max(level+.5,y+.08);for(let row=0;row<(top-level+1.5)/.5;row++)box(x,level-1.25+row*.5,z,.85,.46,1.43,'wall',row%3?'#b6c0c4':'#a8b2a7');box(x,top,z,.96,.2,1.49,'wall','#d9dccb');obstacle(x,z,.8,1.45,'canal parapet');}
   else for(let k=0;k<3;k++){const rx=x+side*(random()*.8-.2),rz=z+(random()-.5)*1.3;if(roadDistance(rx,rz)<3.5)continue;const s=.42+random()*.62,o=mesh(sharedGeo.brookBankRock??=new THREE.IcosahedronGeometry(1,1),material('rock','#c3c9b8'),rx,groundAt(rx,rz)+s*.12,rz);o.scale.set(s*.8,s*.65,s*1.2);o.rotation.set(random()*.3,random()*TAU,random()*.3);}
  }
  if(random()<.4&&!bridge){const rx=x+side*(.4+random()*.8),rz=z+random()*.5;if(roadDistance(rx,rz)>3){plant(rx,rz,.55+random()*.3,'fern');plant(rx+side*.3,rz+.4,.4,'flower');}}
 }
};
const canalBeforeBrook=buildWorkingCanal;
buildWorkingCanal=function(){canalBeforeBrook();world.userData.gate.userData.brookSluice=true;world.userData.gate.position.set(brookChannel(70),state.flags.gate_open?7.6:5.45,70);world.userData.crank.position.set(brookChannel(70)+5.7,groundAt(brookChannel(70)+5.7,70)+1.3,70);world.userData.waterwheel.position.set(-169,4,91);for(const c of colliders)if(c.type==='winch'&&c.z===47){c.x=brookChannel(70)+5.7;c.z=70;}
 const gx=brookChannel(70);for(const xx of[gx-5.1,gx+5.1]){box(xx,6.1,70,.43,4.8,.43,'darkWood','#8a6041');box(xx,4.1,70,.9,.7,.9,'wall','#b6c0c4');}box(gx,8.55,70,11.2,.45,.5,'wood','#aa7d51');
 for(const xx of[gx-2,gx+2])beam(V3(xx,8.5,70),V3(xx,5.6,70),.035,'metal','#84929b');beam(V3(-169,4,91),V3(-155,4,91),.13,'wood','#8a6041');
};
const disposeBeforeBrook=disposeContinuousWorld;
disposeContinuousWorld=function(){for(const p of world?.userData.waterPools??[])p.userData.poolTarget.dispose();disposeBeforeBrook();};
const reflectionsBeforeBrook=updateReflection;
updateReflection=function(){
 const falls=world?.userData.brookFallObjects??[],fallVisibility=falls.map(o=>o.visible);falls.forEach(o=>o.visible=false);
 try{reflectionsBeforeBrook();}finally{falls.forEach((o,i)=>o.visible=fallVisibility[i]);}if(!player||!world?.userData.waterPools?.length||Math.abs(player.x-brookChannel(player.z))>90)return;
 const oldWater=water,oldTarget=reflectionTarget,all=[oldWater,...world.userData.waterPools,...falls],hidden=scenery.trees.filter(t=>t.hidden);
 for(const t of hidden)hideTree(t,false);
 camera.updateMatrixWorld();liveWaterMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);liveWaterFrustum.setFromProjectionMatrix(liveWaterMatrix);
 const shadowDirty=renderer.shadowMap.needsUpdate,sunDirty=sun.shadow.needsUpdate;
 // Reflection views reuse this frame's physical shadow map. Rebuilding it
 // for each water height costs several extra full-world depth renders.
 renderer.shadowMap.needsUpdate=false;sun.shadow.needsUpdate=false;
 try{for(const pool of world.userData.waterPools){if(!pool.userData.poolPatches.some(box=>liveWaterFrustum.intersectsBox(box)))continue;const visible=all.map(o=>o.visible);all.forEach(o=>o.visible=o===pool);water=pool;reflectionTarget=pool.userData.poolTarget;try{physicalReflection();liveSurfaceStats.poolReflections=(liveSurfaceStats.poolReflections??0)+1;}finally{all.forEach((o,i)=>o.visible=visible[i]);}}}
 finally{renderer.shadowMap.needsUpdate=shadowDirty;sun.shadow.needsUpdate=sunDirty;water=oldWater;reflectionTarget=oldTarget;for(const t of hidden)hideTree(t,true);}
};
const natureBeforeBrook=buildNature;
const plantGeometryBeforeBrook=plantGeometry;
plantGeometry=function(kind){if(kind!=='shrub')return plantGeometryBeforeBrook(kind);if(sharedGeo.brookShrub)return sharedGeo.brookShrub;const g=forestGeometry('oak').clone();g.scale(.62,.6,.62);g.translate(0,.22,0);g.computeBoundingSphere();return sharedGeo.brookShrub=g;};
const plantsBeforeBrook=buildPlants;
buildPlants=function(){plantsBeforeBrook();for(const mesh of world.userData.plantMeshes??[]){if(mesh.userData.plantKey!=='flowers'||mesh.material.userData.brookPetals)continue;const material=mesh.material,compile=material.onBeforeCompile;material.onBeforeCompile=shader=>{compile(shader);shader.vertexShader=shader.vertexShader.replace('#include <color_vertex>',`#include <color_vertex>
  float variety=fract(sin(instanceMatrix[3].x*12.9898+instanceMatrix[3].z*7.233)*43758.5453);
  if(color.r>.7&&color.b>.65){vec3 petal=variety<.18?vec3(.92,.30,.64):variety<.38?vec3(.40,.57,1.):variety<.51?vec3(1.,.83,.49):vec3(1.);vColor.rgb*=petal;}`);};material.customProgramCacheKey=()=> 'brook-petal-varieties-v8';material.userData.brookPetals=true;material.needsUpdate=true;}};
buildNature=function(){natureBeforeBrook();const random=seeded(91023);
 for(const [x,z,s]of[[-119,105,1.2],[-134,61,1.15],[-144,55,.95],[-108,39,1.15],[-150,83,1.05],[-173,78,1.1],[-174,57,.95],[-157,43,1.1],[-96,93,1.1],[-88,122,.9],[-122,127,.9],[-143,131,1.2]]){
  let point=null;for(let r=0;r<=4&&!point;r+=.65)for(let i=0;i<(r?16:1);i++){const a=i*TAU/16,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;if(roadDistance(xx,zz)>4.4&&channelDistance(xx,zz)>2.2&&!colliders.some(c=>Math.abs(c.x-xx)<c.w+.65&&Math.abs(c.z-zz)<c.d+.65)){point={x:xx,z:zz};break;}}
  if(point)buildSolidTree(point.x,point.z,s*1.38,'oak',random);
 }
 rebuildColliderGrid();
 for(let i=0;i<5800;i++){const x=mix(-178,-82,random()),z=mix(30,137,random());if(roadDistance(x,z)<3.9||waterGround(x,z)||!staticFree(x,z,.25))continue;const k=i%9;plant(x,z,.4+random()*.43,k<3?'flower':k===3?'fern':k===4?'shrub':'grassBlades');}
 for(const [cx,cz,r]of[[-119,105,2.4],[-103,99,1.8],[-103,88,1.8],[-115,73,1.8],[-108,57,2.4],[-100,58,2],[-174,78,1.8],[-151,81,1.8],[-88,116,2.4],[-95,119,2]])for(let i=0;i<65;i++){
  const a=random()*TAU,rr=Math.sqrt(random())*r,x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;if(roadDistance(x,z)>3&&!waterGround(x,z)&&staticFree(x,z,.12))plant(x,z,.5+random()*.45,i%4===0?'fern':i%9===0?'shrub':'flower');
 }
 // Dense tended beds have a low woody center and taller flowers at the edges.
 for(const [cx,cz,rx,rz]of[[-120,102,3.4,2],[-101,98,2.4,4],[-102,87,3.5,2.2],[-113,73,3,1.9],[-105,55,3.8,2.1],[-151,81,3.2,2],[-135,58,2.8,3.4],[-99,65,2.4,3.2]]){
  for(let i=0;i<95;i++){const a=random()*TAU,r=Math.sqrt(random()),x=cx+Math.cos(a)*r*rx,z=cz+Math.sin(a)*r*rz;if(roadDistance(x,z)<3.25||waterGround(x,z)||!staticFree(x,z,.18))continue;
   plant(x,z,i%8===0?1.05+random()*.5:.64+random()*.36,i%8===0?'shrub':i%5===0?'fern':'flower');
  }
 }
};
const villagersBeforeBrook=setupWorldVillagers;
setupWorldVillagers=function(){villagersBeforeBrook();const routes={merchant:[[-116,51],[-119,51]],worker:[[-145,72],[-149,72],[-158.5,72.5],[-155,80]],healer:[[-111,63],[-108,57]],guard:[[-146,120],[-125,120]],courier:[[-129,65],[-124,90],[-120,101]],farmer:[[-95,106],[-90,100],[-97,126]],elder:[[-128.8,60],[-126.5,60.5]],innkeeper:[[-114,101.5],[-117,102]]};
 for(const a of npcs){const route=routes[a.id];if(!route||a.story)continue;const p=safePoint({x:route[0][0],z:route[0][1]});a.x=p.x;a.z=p.z;a.home={...p};a.workRoute=route.map(q=>safePoint({x:q[0],z:q[1]}));a.route=null;}
 for(const [id,size,points]of[['sheepEwe',1.25,[[-94,124],[-91,127],[-94,128]]],['sheepLamb',1,[[-87,127],[-89,124],[-86,125]]]]){
  if(!assets.sprites[id])continue;
  const route=points.map(([x,z])=>safePoint({x,z},.35)),p=route[0],a=createActor(id,p.x,p.z,size);a.npc=true;a.animal=true;a.home={...p};a.routine=npcs.length;a.wait=2+npcs.length%3;a.tasks=0;a.workIndex=0;a.workRoute=route;a.workTasks=['Grazing in the meadow','Looking for clover'];a.task=a.workTasks[0];npcs.push(a);
 }
 settleResidents();
};
const cameraBeforeBrook=updateCamera;
updateCamera=function(dt,instant=false){
 if(!player||battle||restoration||!inBrook(player.x,player.z,20))return cameraBeforeBrook(dt,instant);
 let look=V3(player.x,heightAt(player.x,player.z)+1,player.z-1.5),off=V3(23,27,35),zoom=state.settings.zoom;
 if(state.mode==='title'){const millView=state.scene==='approach';look=V3((millView?-140:-127)+Math.sin(titleClock*.035)*1.6,3.4,(millView?104:89)+Math.cos(titleClock*.04)*1.6);off=V3(39,40,52);zoom=1;}
 cameraTarget.lerp(look,instant?1:1-Math.exp(-dt*5));camera.position.copy(cameraTarget).add(off.multiplyScalar(zoom));camera.fov=state.mode==='title'?32:34;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);
 for(const a of actors)a.mesh.quaternion.copy(camera.quaternion);
};
const lightingBeforeBrook=updateLighting;
updateLighting=function(){lightingBeforeBrook();if(!player||roomAt(player.x,player.z))return;
 const hour=(state.worldMinutes/60%24+24)%24,elevation=Math.sin((hour-6)/12*Math.PI),day=Math.max(0,elevation),moon=Math.max(0,Math.sin((hour+6)/12*Math.PI)),skyDay=smooth(-.13,.28,elevation),night=1-skyDay;
 const dawn=1-smooth(0,1.6,Math.abs(hour-6)),dusk=1-smooth(0,1.6,Math.abs(hour-18)),town=inBrook(player.x,player.z,40);
 if(town){sun.intensity=mix(.14+moon*.17,4.6,Math.sqrt(day));hemi.intensity=mix(.27+moon*.14,.64,skyDay);hemi.groundColor.set('#526145');hemi.color.set('#829ac5').lerp(new THREE.Color('#b7d4e5'),skyDay);renderer.toneMappingExposure=mix(1.08,1.05,day);scene.fog.near=mix(100,145,day);scene.fog.far=mix(230,330,day);}
 else{sun.intensity=mix(sun.intensity,.14+moon*.17,night);hemi.intensity=mix(hemi.intensity,.27+moon*.14,night);}
 const nightSky=new THREE.Color('#3c435b').lerp(new THREE.Color('#1f3048'),moon),daySky=new THREE.Color('#b4cbd9');scene.fog.color.copy(nightSky).lerp(daySky,skyDay).lerp(new THREE.Color('#bea1ac'),dawn*.5).lerp(new THREE.Color('#bd8b72'),dusk*.6);scene.background.copy(scene.fog.color);
 sun.color.set('#9db8e0').lerp(new THREE.Color('#fff0ca'),skyDay).lerp(new THREE.Color('#f4b078'),Math.max(dawn,dusk)*.7);
 if(elevation<0){const y=heightAt(player.x,player.z),angle=(hour+6)/12*Math.PI;sun.position.set(player.x-27*Math.cos(angle),y+13+moon*33,player.z+24);}
 sceneryLight.direction.value.copy(sun.position).sub(sun.target.position).normalize();
};
const worldFxBeforeBrook=updateWorldFX;
updateWorldFX=function(dt){worldFxBeforeBrook(dt);
 const gate=world.userData.gate;if(gate)gate.position.y=mix(gate.position.y,state.flags.gate_open?7.6:5.45,1-Math.exp(-dt*2.8));
 const opening=gate?clamp((gate.position.y-5.45)/2.15,0,1):0,target=.025+opening*(state.flags.pump_repaired?.695:.255);
 brookHydraulics.flow.value=mix(brookHydraulics.flow.value,target,1-Math.exp(-dt*1.5));brookHydraulics.time.value+=dt*(.04+brookHydraulics.flow.value*1.8);
 const h=state.worldMinutes/60%24,day=Math.max(0,Math.sin((h-6)/12*Math.PI));brookHydraulics.light.value=.22+.78*Math.sqrt(day);
 for(const jet of world.userData.supplyJets??[]){jet.visible=state.flags.pump_repaired===true;jet.material.opacity=.30+brookHydraulics.flow.value*.45;}
 if(world.userData.waterwheel)world.userData.waterwheel.rotation.x+=dt*(state.flags.gate_open?.44:.12)-dt*brookHydraulics.flow.value*.6;
};
const loadBeforeBrook=loadAssets;
loadAssets=async function(){
 document.documentElement.style.setProperty('--hero-bren',`url("${ASSETS.portraits.bren}")`);document.documentElement.style.setProperty('--hero-soren',`url("${ASSETS.portraits.soren}")`);
 const travellers=document.createElement('div');travellers.className='loading-travellers';travellers.setAttribute('aria-hidden','true');$('#load-screen').append(travellers);
 await loadBeforeBrook();if(!scenery.software){perf.scale=1;if(renderer.getContext().getExtension('EXT_color_buffer_float')){post.target.texture.type=THREE.HalfFloatType;post.target.texture.needsUpdate=true;}}
 $('#load-label').textContent='Building the riverlands…';await new Promise(resolve=>requestAnimationFrame(resolve));
};
window.__brookReference={layout:BROOK,version:8};
const partyBeforeBrook=setupParty;
setupParty=function(point){if(world?.userData.continuous&&colliderGrid.size){const p=safePoint({x:point[0],z:point[1]},.45);point=[p.x,p.z];}partyBeforeBrook(point);};
// Cut away the roof and upper walls of an occluding house, retaining the
// foundation and floor as a readable miniature. Physical shadows stay intact.
const cutawaysBeforeBrook=prepareCutaways;
prepareCutaways=function(){cutawaysBeforeBrook();for(const cut of world.userData.cutaways){if(!cut.group.userData.brookHouse)continue;const roof=cut.group.userData.roofShell;
 for(const mesh of cut.meshes){let p=mesh,isRoof=false;while(p&&p!==cut.group){if(p===roof)isRoof=true;p=p.parent;}if(isRoof)continue;
  if(mesh.material.userData.brookLowerWall)continue;const old=mesh.material,m=old.clone(),compile=old.onBeforeCompile,clip={value:100000};m.userData.brookLowerWall=true;m.onBeforeCompile=sh=>{compile(sh);sh.uniforms.brookClip=clip;sh.vertexShader='varying float vBrookY;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBrookY=(modelMatrix*vec4(position,1.)).y;');sh.fragmentShader='uniform float brookClip;varying float vBrookY;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\nif(vBrookY>brookClip)discard;');};m.customProgramCacheKey=()=>old.customProgramCacheKey()+'-brook-lower-wall';mesh.material=m;
  mesh.onBeforeRender=(renderer,scene,view)=>{clip.value=view===camera&&mesh.userData.viewHidden?cut.group.position.y+.45:100000;};mesh.onAfterRender=()=>{clip.value=100000;};
 }
}};
const buildBeforeBrookTitle=buildWorld;
buildWorld=function(id,spawn=null){if(state.mode==='title'&&id==='square')spawn=[...PLACES.square];return buildBeforeBrookTitle(id,spawn);};
// The map follows the rebuilt river and uses contours sampled from the actual
// world heightfield rather than an unrelated painted geography.
CANAL_COURSE.splice(0,CANAL_COURSE.length,...Array.from({length:74},(_,i)=>{const z=-290+i*7.1;return[brookChannel(z),z];}));
let brookMapContours='';
function brookContours(){if(brookMapContours)return brookMapContours;const lines=[],step=12;
 for(let z=LAND.minZ;z<LAND.maxZ;z+=step)for(let x=LAND.minX;x<LAND.maxX;x+=step){const points=[[x,z],[x+step,z],[x+step,z+step],[x,z+step]],values=points.map(p=>baseLand(...p));
  for(const level of[4,8,12,16]){const hits=[];for(let i=0;i<4;i++){const j=(i+1)%4;if((values[i]>=level)===(values[j]>=level))continue;const t=(level-values[i])/(values[j]-values[i]);hits.push([mix(points[i][0],points[j][0],t),mix(points[i][1],points[j][1],t)]);}for(let i=0;i+1<hits.length;i+=2)lines.push(`M${hits[i][0].toFixed(1)} ${hits[i][1].toFixed(1)}L${hits[i+1][0].toFixed(1)} ${hits[i+1][1].toFixed(1)}`);}
 }return brookMapContours=`<path d="${lines.join('')}" fill="none" stroke="#8a7352" stroke-width=".45" opacity=".26"/>`;
}
const mapBeforeBrook=worldMapSVG;
worldMapSVG=function(mode='region'){let svg=mapBeforeBrook(mode).replace('<circle cx="-110" cy="9" r="7.2" fill="#6f9295"/>','').replace('#e3cda0','#efe1bd').replace('#ae9465','#c59b69');if(mode!=='radar')svg=svg.replace('<g mask="url(#exploration-mask)">',brookContours()+'<g mask="url(#exploration-mask)">');for(const id of['map-hatch','map-vignette','exploration-mask'])svg=svg.replaceAll(id,id+'-'+mode);return svg;};
