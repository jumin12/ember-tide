// Build each facade once. Real recessed openings, continuous roofs and fitted
// joinery replace the accumulated, intersecting additions of the older houses.
const architecture31={houses:0,windows:0,doors:0};
function window31(parent,x,y,z,angle=0,scale=1){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;g.scale.setScalar(scale);parent.add(g);
 box(0,0,0,1.45,1.74,.16,'darkWood','#3c302a',g);
 box(0,0,.095,1.13,1.43,.035,'plaster','#95aaae',g,{emissive:'#ffc376',emissiveIntensity:.36,roughness:.27,metalness:.12});
 for(const xx of[-.59,0,.59])box(xx,0,.16,.075,1.5,.075,'wood','#8c6945',g);
 for(const yy of[-.73,0,.73])box(0,yy,.17,1.26,.075,.09,'wood','#9d764a',g);
 for(const side of[-1,1]){box(side*.87,0,.04,.36,1.68,.13,'wood',side<0?'#7b6247':'#8b6d4a',g);for(const yy of[-.53,.53])box(side*.87,yy,.12,.34,.06,.045,'metal','#586265',g);}
 box(0,-.91,.11,1.88,.18,.46,'wall','#c6c3a7',g);box(0,.96,.06,1.64,.18,.31,'darkWood','#97724a',g);architecture31.windows++;return g;
}
function door31(g,x,z){
 box(x,1.58,z-.05,2.03,2.92,.23,'darkWood','#302a24',g);
 for(let i=0;i<7;i++)box(x-.77+i*.257,1.58,z+.055,.242,2.72,.12,'wood',i%3?'#987449':'#a37e50',g);
 for(const side of[-1,1]){box(x+side*1.05,1.63,z+.04,.19,3.18,.35,'darkWood','#836542',g);for(const yy of[.7,2.42])box(x-.7,yy,z+.14,.38,.09,.045,'metal','#48575b',g);}
 box(x,3.23,z+.05,2.31,.22,.4,'darkWood','#a27b4c',g);box(x,.20,z+.12,2.33,.18,.6,'wall','#d3c9ad',g);
 const handle=mesh(new THREE.TorusGeometry(.095,.026,5,10),material('metal','#c5a05c',{metalness:.65,roughness:.35}),x+.59,1.38,z+.16,g);handle.rotation.x=.1;
 architecture31.doors++;
}
function leanRoof31(g,cx,z,width,depth,height,key='slate',colour='#a4b9c9'){
 const p=[cx-width/2,height,z,cx-width/2,height-.38,z+depth,cx+width/2,height,z,cx+width/2,height,z,cx-width/2,height-.38,z+depth,cx+width/2,height-.38,z+depth],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,depth*.17,width*.17,0,width*.17,0,0,depth*.17,width*.17,depth*.17],2));geo.computeVertexNormals();mesh(geo,material(key,colour,{side:THREE.DoubleSide}),0,0,0,g);
 beam(V3(cx-width/2,height-.4,z+depth),V3(cx+width/2,height-.4,z+depth),.09,'darkWood','#927047',g);
 for(const side of[-1,1])beam(V3(cx+side*width/2,height,z),V3(cx+side*width/2,height-.38,z+depth),.065,'wood','#9a754a',g);
}
brookHouse=function(x,z,w,d,kind){
 const y=groundAt(x,z),h=kind==='inn'?6.1:kind==='mill'?3.5:5.5,g=new THREE.Group(),roofShell=new THREE.Group(),doorX=-w*.15,front=d/2+.12,rng=seeded(Math.floor(x*91+z*73)),tone=['#e9d9b8','#ddd3ba','#eadcc5'][Math.floor(rng()*3)];g.position.set(x,y,z);world.add(g);g.add(roofShell);
 g.userData={worldHouse:true,brookHouse:true,kind,footprint:{w,d},front:V3(0,0,1),door:V3(x+doorX,y,z+d/2+1.1),roofShell,architecture24:{westFacade:true,roofChart:true},architecture31:{openings:[],door:[doorX,front],roofRise:w*.31,variant:Math.floor(rng()*3)}};
 const panel=(xx,yy,zz,ww,hh,dd,key='plaster',c=tone)=>box(xx,yy,zz,ww,hh,dd,key,c,g);
 panel(0,.16,0,w+.35,.32,d+.35,'wall','#b9bba7');
 panel(0,h/2+.2,-d/2+.13,w,h,.26);for(const s of[-1,1])panel(s*(w/2-.13),h/2+.2,0,.26,h,d-.25);
 const left=-w/2,right=w/2,dl=doorX-1.02,dr=doorX+1.02;
 panel((left+dl)/2,h/2+.2,d/2-.13,dl-left,h,.26);panel((dr+right)/2,h/2+.2,d/2-.13,right-dr,h,.26);panel(doorX,(h+3.32)/2+.1,d/2-.13,2.04,h-3.12,.26);
 for(const side of[-1,1]){panel(side*w/2,h/2+.2,0,.22,h+.35,d+.1,'darkWood','#7a6045');for(const zz of[-d/2,d/2])panel(side*w/2,h/2+.2,zz,.27,h+.38,.27,'darkWood','#775b3e');}
 for(const yy of[.75,3.15,h+.1]){for(const side of[-1,1])panel(side*(w/2+.05),yy,0,.18,.17,d+.12,'wood','#9a774c');if(yy>3.0)panel(0,yy,front,w+.16,.18,.19,'wood','#9a774c');else{panel((left+dl)/2,yy,front,dl-left,.16,.18,'wood','#9a774c');panel((dr+right)/2,yy,front,right-dr,.16,.18,'wood','#9a774c');}}
 panel(0,h*.80,front,.16,h*.38,.18,'darkWood','#886742');
 door31(g,doorX,front);g.userData.architecture31.openings.push({kind:'door',x:doorX,y:1.63,w:2.31,h:3.18,face:'front'});
 function win(xx,yy,zz,angle=0,face='front',s=1){window31(g,xx,yy,zz,angle,s);g.userData.architecture31.openings.push({kind:'window',x:xx,y:yy,w:2.1*s,h:2.02*s,face});}
 win(w*.29,1.95,front+.04);if(h>4.5){win(-w*.30,h-1.0,front+.04,0,'front',.88);win(w*.30,h-1.0,front+.04,0,'front',.88);}
 for(const side of[-1,1])for(const zz of[-d*.25,d*.25])win(side*(w/2+.10),h>4.5?h-1.2:1.95,zz,side*Math.PI/2,side<0?'west':'east',.88);
 const roof=archRoof(roofShell,w+.85,d+.9,w*.31,'brook');roof.position.y=h+.2;
 for(const side of[-1,1]){const zz=side*(d/2+.48);for(const sx of[-1,1])beam(V3(sx*(w/2+.43),h+.18,zz),V3(0,h+.2+w*.31,zz),.10,'darkWood','#795b3c',roofShell);beam(V3(0,h+.23,zz),V3(0,h+w*.31-.12,zz),.08,'wood','#967248',roofShell);}
 if(w>10&&kind!=='mill')window31(roofShell,0,h+w*.135,d/2+.49,0,.66);
 for(const side of[-1,1]){panel(side*(w/2+.14),h+.12,0,.24,.18,d+.8,'darkWood','#7f6041');for(const zz of[-d*.3,d*.3])beam(V3(side*(w/2-.02),h-.5,zz),V3(side*(w/2+.27),h+.12,zz),.075,'wood','#a48050',g);}
 const chimneyX=-w*.31,chimneyZ=-d*.24,base=h+w*.31*(1-Math.abs(chimneyX)/(w/2));box(chimneyX,base+.95,chimneyZ,.85,2.3,.85,'wall','#bfc0ad',roofShell);box(chimneyX,base+2.13,chimneyZ,1.12,.18,1.12,'wall','#d2cdb5',roofShell);box(chimneyX,base+2.25,chimneyZ,.65,.06,.65,'darkWood','#352b24',roofShell);
 const canopy=kind==='inn'?Math.min(w*.70,10.5):kind==='shop'?Math.min(w*.66,8):kind==='forge'?Math.min(w*.54,6):Math.min(w*.45,4.4),depth=kind==='inn'?2.25:1.8,canopyX=kind==='shop'?0:doorX;
 leanRoof31(g,canopyX,front+.02,canopy,depth,3.48,kind==='shop'?'cloth':'slate',kind==='shop'?'#d7cbaa':'#9cb0c0');
 for(const side of[-1,1]){const xx=canopyX+side*(canopy/2-.12),zz=front+depth-.08;panel(xx,1.54,zz,.15,3.08,.15,'wood','#98784f');beam(V3(xx,2.6,zz),V3(xx,3.08,zz-.6),.065,'wood','#b08a54',g);obstacle(x+xx,z+zz,.19,.19,'porch post');}
 for(let i=0;i<3;i++){const zz=front+.45+i*.39,top=.25-i*.07;panel(doorX,top-.09,zz,2.7,.18,.42,'wall','#cec6ad');}
 world.userData.entrySteps31??=[];world.userData.entrySteps31.push({owner:g,x:doorX,z:front+.45,y:y+.25,width:2.7});
 for(const xx of[-w*.42,w*.43])lantern(xx,2.65,front+.35,g);
 if(['inn','shop','forge'].includes(kind))brookSign(g,kind==='inn'?'innSign':kind==='forge'?'forgeSign':'shopSign',w*.36,3.7,front+.55);
 for(const xx of[-w*.30,w*.30])if(h>4.5){panel(xx,h-2.24,front+.20,1.95,.29,.45,'wood','#9e7b4c');for(let k=0;k<4;k++)plant(x+xx+(k-1.5)*.36,z+front+.28,.43,'flower',y+h-2.06);}
 for(const side of[-1,1])for(let j=0;j<4;j++)plant(x+side*(w/2+.04),z-d*.15,.55,'ivy',y+.55+j*.65);
 obstacle(x,z,w+.12,d+.12,'building');world.userData.buildings.push(g);architecture31.houses++;return g;
};
fernHouse=function(x,z,w,d,variant=0){
 const y=groundAt(x,z),g=new THREE.Group(),front=d/2+.1,dx=-w*.18;g.position.set(x,y,z);g.userData={worldHouse:true,kind:'forest-home',footprint:{w,d},front:V3(0,0,1),door:V3(x+dx,y,z+front+.8),architecture31:{theme:'forest',door:[dx,front],openings:[]}};world.add(g);
 box(0,.15,0,w+.3,.3,d+.3,'wall','#a9ad90',g);box(0,1.7,-d/2+.12,w,3.1,.24,'wood','#9e8860',g);for(const s of[-1,1])box(s*(w/2-.12),1.7,0,.24,3.1,d,'wood','#9e8860',g);
 const dl=dx-.9,dr=dx+.9;box((-w/2+dl)/2,1.7,d/2-.12,dl+w/2,3.1,.24,'wood','#a18b61',g);box((w/2+dr)/2,1.7,d/2-.12,w/2-dr,3.1,.24,'wood','#a18b61',g);box(dx,2.98,d/2-.12,1.8,.54,.24,'wood','#9a8057',g);
 const door=new THREE.Group();door.position.set(dx,0,front);door.scale.setScalar(.78);g.add(door);door31(door,0,0);window31(g,w*.28,1.85,front+.03,0,.70);
 for(const s of[-1,1]){window31(g,s*(w/2+.05),1.85,0,s*Math.PI/2,.68);for(const zz of[-d/2,d/2]){box(s*w/2,1.7,zz,.23,3.4,.23,'darkWood','#77643f',g);ropeWrap(g,s*w/2,2.7,zz,.15);}}
 const p=[],uv=[],indices=[],n=24;for(let i=0;i<=n;i++){const a=i/n*Math.PI;for(const zz of[-d/2-.4,d/2+.4]){p.push(-Math.cos(a)*(w/2+.4),3.15+Math.sin(a)*1.6,zz);uv.push((zz+d/2)*.17,i/n*w*.18);}}for(let i=0;i<n;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}const roof=new THREE.BufferGeometry();roof.setAttribute('position',new THREE.Float32BufferAttribute(p,3));roof.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));roof.setIndex(indices);roof.computeVertexNormals();mesh(roof,material('wood',variant%2?'#8c8056':'#938159',{side:THREE.DoubleSide}),0,0,0,g);
 for(const side of[-1,1]){const verts=[],tex=[],zz=side*(d/2+.05);for(let i=0;i<n;i++){const a=i/n*Math.PI,b=(i+1)/n*Math.PI;for(const v of[[0,3.15,zz],[-Math.cos(a)*w/2,3.15+Math.sin(a)*1.5,zz],[-Math.cos(b)*w/2,3.15+Math.sin(b)*1.5,zz]]){verts.push(...v);tex.push(v[0]*.17,v[1]*.17);}}const end=new THREE.BufferGeometry();end.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));end.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));end.computeVertexNormals();mesh(end,material('wood','#ac9669',{side:THREE.DoubleSide}),0,0,0,g);}
 leanRoof31(g,dx,front+.01,3.1,1.3,2.96,'wood','#ac976c');for(const s of[-1,1]){box(dx+s*1.4,1.28,front+1.22,.14,2.56,.14,'wood','#9e8657',g);obstacle(x+dx+s*1.4,z+front+1.22,.18,.18,'porch post');}lantern(w*.40,2.4,front+.3,g);
 for(let i=0;i<2;i++)box(dx,.10-i*.06,front+.5+i*.4,2.15,.16,.43,'wood','#baa274',g);obstacle(x,z,w+.12,d+.12,'building');world.userData.buildings.push(g);architecture31.houses++;return g;
};
reliefShelter=function(x,z,w,d){
 const g=new THREE.Group();g.position.set(x,groundAt(x,z),z);g.userData={worldHouse:true,kind:'relief-pavilion',footprint:{w,d},front:V3(0,0,1),door:V3(x,g.position.y,z+d/2),architecture31:{theme:'open pavilion',walkThrough:true}};world.add(g);
 for(const xx of[-w/2,w/2])for(const zz of[-d/2,d/2]){box(xx,1.6,zz,.2,3.2,.2,'wood','#9b8058',g);ropeWrap(g,xx,2.8,zz,.16);obstacle(x+xx,z+zz,.25,.25,'pavilion post');}
 box(0,.06,0,w,.12,d,'wood','#a28e67',g);box(0,1.5,-d/2,w,2.9,.08,'cloth','#a9ad93',g);obstacle(x,z-d/2,w,.12,'pavilion back');
 const p=[],uv=[],idx=[],rows=12;for(let i=0;i<=rows;i++){const t=i/rows,xx=(t-.5)*(w+.65),yy=3.18+Math.sin(t*Math.PI)*.95;for(const zz of[-d/2-.35,d/2+.35]){p.push(xx,yy,zz);uv.push(t*w*.17,(zz+d/2)*.17);}}for(let i=0;i<rows;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,material('cloth','#ded2ac',{side:THREE.DoubleSide}),0,0,0,g);
 beam(V3(0,4.12,-d/2-.25),V3(0,4.12,d/2+.25),.07,'wood','#947a50',g);box(0,.85,-d*.22,w*.6,.14,1,'wood','#b39b6d',g);for(const xx of[-w*.24,w*.24])box(xx,.42,-d*.22,.12,.84,.8,'wood','#92774e',g);obstacle(x,z-d*.22,w*.6,1,'relief table');lantern(w*.38,2.6,0,g);world.userData.buildings.push(g);return g;
};
const entryHeightBefore31=heightAt;heightAt=function(x,z,...args){let h=entryHeightBefore31(x,z,...args);for(const q of world?.userData.entrySteps31??[]){if(q.owner.parent!==world)continue;const a=q.owner.rotation.y,c=Math.cos(a),s=Math.sin(a),dx=x-q.owner.position.x,dz=z-q.owner.position.z,lx=dx*c-dz*s-q.x,lz=dx*s+dz*c-q.z;if(Math.abs(lx)>q.width*.5||lz<-.21||lz>1)continue;h=Math.max(h,q.y-Math.floor(Math.max(0,lz+.20)/.39)*.07);}return h;};
// All settlement houses share the fitted kit, including their rear facades.
// Keep planted window boxes attached to the same individual-building cutaway.
for(const name of ['brook','fern']){
 const original=name==='brook'?brookHouse:fernHouse;
 const build=function(...args){const start=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length])),g=original(...args);g.userData.plantRanges=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,{start:start[k],end:a.length}]));return g;};
 if(name==='brook')brookHouse=build;else fernHouse=build;
}
building=function(x,z,w,d,v,kit){
 const start=colliders.length,g=kit==='fern'?fernHouse(x,z,w,d,v):kit==='relief'?reliefShelter(x,z,w,d):brookHouse(x,z,w,d,'home'),lane=closestLane(x,z),angle=Math.round(Math.atan2(lane.x-x,lane.z-z)/(Math.PI/2))*Math.PI/2;
 if(kit!=='fern'&&kit!=='relief')for(const xx of[-w*.28,w*.28])window31(g,xx,4.3,-d/2-.1,Math.PI,.83);
 if(Math.abs(angle)>.01){const rotation=new THREE.Matrix4().makeTranslation(x,0,z).multiply(new THREE.Matrix4().makeRotationY(angle)).multiply(new THREE.Matrix4().makeTranslation(-x,0,-z));for(const[k,r]of Object.entries(g.userData.plantRanges??{}))for(let i=r.start;i<r.end;i++)world.userData.plantMatrices[k][i].premultiply(rotation);const swap=Math.abs(Math.sin(angle))>.5;for(const c of colliders.slice(start)){const p=V3(c.x,0,c.z).applyMatrix4(rotation);c.x=p.x;c.z=p.z;if(swap)[c.w,c.d]=[c.d,c.w];}g.rotation.y=angle;}
 g.updateMatrixWorld(true);g.userData.door=g.localToWorld(V3(-w*(kit==='fern'?.18:kit==='relief'?0:.15),0,d/2+1.1));g.userData.front=V3(Math.sin(angle),0,Math.cos(angle));return g;
};
const treeEntranceBefore31=buildSolidTree;
buildSolidTree=function(x,z,...args){for(const g of world?.userData.buildings??[]){if(g.parent!==world||!g.userData.architecture31||!g.userData.door)continue;const d=g.userData.door,f=g.userData.front,dx=x-d.x,dz=z-d.z,along=dx*f.x+dz*f.z,across=dx*f.z-dz*f.x;if(along>-.4&&along<4.8&&Math.abs(across)<2.2)return null;}return treeEntranceBefore31(x,z,...args);};
openHall=function(id,w,d,kind){
 const p=AT(id);if(sceneBuildFilter&&!inSceneBounds(p.x,p.z,20))return null;const y=groundAt(p.x,p.z),g=new THREE.Group(),facade=new THREE.Group(),roof=new THREE.Group(),h=5.8,opening=4.4;g.position.set(p.x,y,p.z);g.add(facade,roof);world.add(g);
 g.userData={worldHouse:true,openInterior:true,footprint:{w,d},facadeShell:facade,roofShell:roof,front:V3(0,0,1),door:V3(p.x,y,p.z+d/2+1),architecture31:{theme:kind,walkThrough:true}};
 const floor=box(0,-.06,0,w,.12,d,kind==='inn'?'wood':'cobble','#d5c4a4',g);world.userData.walkSurfaces.push(floor);
 for(const side of[-1,1]){box(side*w/2,h/2,0,.4,h,d,'plaster','#dfd5bd',g);obstacle(p.x+side*w/2,p.z,.4,d,'hall wall');const fw=(w-opening)/2,cx=side*(opening/2+fw/2);box(cx,h/2,d/2,fw,h,.38,'plaster','#e9dbc1',facade);obstacle(p.x+cx,p.z+d/2,fw,.38,'hall wall');window31(facade,cx,2.8,d/2+.27,0,.9);for(const zz of[-d/2,d/2])box(side*w/2,h/2,zz,.28,h+.15,.28,'darkWood','#826240',g);for(const zz of[-d*.23,d*.23])window31(g,side*(w/2+.22),3.1,zz,side*Math.PI/2,.86);}
 box(0,h/2,-d/2,w,h,.4,'plaster','#ded1b8',g);obstacle(p.x,p.z-d/2,w,.4,'hall wall');
 box(0,4.97,d/2,w,1.66,.38,'plaster','#e1d2b6',facade);for(const x of[-opening/2,opening/2])box(x,2.1,d/2+.1,.28,4.2,.55,'wall','#c5c0a6',facade);box(0,4.16,d/2+.12,opening+.65,.26,.63,'wall','#d6cbb0',facade);box(0,.12,d/2+.4,opening+.6,.24,.8,'wall','#d2c4a4',facade);
 for(const yy of[.55,h])for(const side of[-1,1])box(side*w/2,yy,0,.2,.18,d+.3,'wood','#9b7950',g);
 const r=archRoof(roof,w+.9,d+.9,w*.31,'brook');r.position.y=h;for(const side of[-1,1])beam(V3(side*(w/2+.44),h,d/2+.47),V3(0,h+w*.31,d/2+.47),.11,'wood','#896847',roof);window31(roof,0,h+w*.13,d/2+.5,0,.75);
 leanRoof31(facade,0,d/2+.2,opening+1.3,1.7,4.4);for(const x of[-opening/2-.25,opening/2+.25])lantern(x,3.3,d/2+.55,facade);
 for(const x of[-w*.35,w*.35])lantern(x,2.8,-d*.26,g);
 servicePlaque(g,kind==='council'?'Council':kind==='archives'?'Royal Archives':'The Lantern Inn');world.userData.buildings.push(g);return g;
};
// Soft warm windows switch on at dusk; forge emissions stay active all day.
const staticBefore31=staticAtlasMaterial;staticAtlasMaterial=function(){const m=staticBefore31();if(m.userData.windows31)return m;m.userData.windows31=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.uniforms.windowNight31=celestial31.night;sh.fragmentShader='uniform float windowNight31;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('totalEmissiveRadiance+=tileColor.rgb*vEmission;','float e31=max(vEmission.r,max(vEmission.g,vEmission.b));totalEmissiveRadiance+=tileColor.rgb*vEmission*(e31>1.?1.:mix(.10,1.35,windowNight31));');};m.customProgramCacheKey=()=>key+'-dusk-windows31';m.needsUpdate=true;return m;};

const roomDoorBefore31=roomDoor29;let roomDoorMode31='';
roomDoor29=function(x,z){if(roomDoorMode31==='shop')x=10.8;if(roomDoorMode31==='archives')x=0;const before=world.children.length;roomDoorBefore31(x,z);world.userData.roomBackDoor31={x,z,width:2.45};for(const o of world.children.slice(before))o.userData.backDoor31=true;};
const fixturesBefore31=buildRoomFixtures29;
buildRoomFixtures29=function(spec,id){roomDoorMode31=spec.type;
 if(spec.type==='shop')return shopInterior31(spec,id);
 if(id==='aidOffice')return aidInterior31(spec,id);
 fixturesBefore31(spec,id);roomDoorMode31='';world.userData.interiorDesign31={id,doorsClear:true,theme:spec.type};
};
function shopInterior31(spec,id){
 roomDoor29(0,-8.92);const forge=spec.category==='equipment';
 for(const x of[-11.4,11.4])for(const z of[-3,3.4]){roomCandle(x,3.5,z);roomPlant29(x*.95,0,z+1.4,1.2,true);}
 for(const x of[-8,-3.4,2])stockedShelf29(x,-8.2,3.4,!forge&&x===2,Math.floor(x+38));
 if(forge){
  // Separate racks face the customer, above their own low storage cabinets.
  for(const x of[-8,-3.4,2]){roomBox29(x,1.0,-7.25,3.3,2,.6,'panel29','#c5a071');for(let i=0;i<3;i++){const px=x-.85+i*.85;roomBox29(px,3.3,-6.83,.09,1.6,.09,'metal','#bdc7c5');roomBox29(px,2.6,-6.78,.5,.08,.15,'metal','#d8bb73');roomBox29(px,2.35,-6.79,.1,.45,.12,'darkWood','#795539');}obstacle(x,-7.2,3.5,1,'weapon cabinet');}
 }
 roomBox29(0,.77,-3.4,13,1.54,1.5,'panel29','#d9b783');roomBox29(0,1.63,-3.4,13.5,.18,1.85,'wood','#e0bf8c');obstacle(0,-3.4,13.5,1.85,'shop counter');
 for(const x of[-5.5,5.5])roomCandle(x,1.8,-3.4);for(let i=0;i<5;i++)roomBottle29(-2.4+i*.9,1.8,-3.4,i,.8);
 roomRug29(0,1.6,9,5.3);roomPainting29(7,5.4,-8.9,3.7,1.8);roomPlant29(8.3,0,1.3,1.7,true);
 for(const x of[-10,10]){roomCrate(x,4.1,1.1);barrel(x,-5.2);}
 createInteraction('shop',0,-5,'Browse equipment and provisions',id==='brookForge'?'worker':'merchant');createInteraction('villager',5,-5.3,'Talk to the apprentice',id==='brookForge'?'capital-post':'worker');
 world.userData.interiorDesign31={id,doorsClear:true,theme:forge?'smithy':'provisions'};roomDoorMode31='';
}
function aidInterior31(spec,id){
 roomDoorMode31='council';roomDoor29(-8,-8.92);roomPainting29(0,4.9,-8.89,4.2,2);for(const x of[-10.8,10.8]){roomCandle(x,3.6,-7.8);roomBanner29(x,-8.85);roomPlant29(x,0,-5.6,1.4);}
 roomBox29(0,.7,-4,8,1.4,2.2,'panel29','#d1ae77');roomBox29(0,1.49,-4,8.4,.18,2.5,'wood','#e1bf8a');obstacle(0,-4,8.4,2.5,'aid desk');
 for(const x of[-2.8,2.8])roomCandle(x,1.65,-4);roomBox29(0,1.61,-4,1.6,.03,1,'landscape29','#eadbb5');roomBooks29(-1.8,1.62,-4.1,4,31);
 stockedShelf29(7.5,-8.2,4,true,31);roomRug29(0,1,10,5.5);for(const x of[-8,8])roomChairFacing29(x,1,x<0?-2:2,1);
 createInteraction('council',0,-6.2,'Deliver your report','capital-stall');world.userData.interiorDesign31={id,doorsClear:true,theme:'aid office'};roomDoorMode31='';
}
// The authored footprint is local to each house. Rotate its visibility bounds
// with the building, preserving the entire roof and the open doorway approach.
const fittedCutawayBefore31=prepareCutaways;
prepareCutaways=function(...args){const r=fittedCutawayBefore31(...args);if(activeScene.kind==='overworld')return r;for(const c of world.userData.cutaways??[]){const g=c.group,a=g.userData.architecture31,f=g.userData.footprint;if(!a||!f||a.walkThrough||g.userData.openInterior)continue;const top=a.theme==='forest'?4.9:(g.userData.kind==='inn'?6.1:g.userData.kind==='mill'?3.5:5.5)+(a.roofRise??f.w*.31)+.3;g.updateMatrixWorld(true);c.core17=new THREE.Box3(V3(-f.w/2,.25,-f.d/2),V3(f.w/2,top,f.d/2)).applyMatrix4(g.matrixWorld);}return r;};
