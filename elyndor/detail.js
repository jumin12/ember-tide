// A second pass of modeled joinery, carved masonry and planted scene composition.
const originalBuilding=building;
archRoof=function(group,w,d,h,style){
 const p=[],uv=[];function tri(a,b,c,coords){p.push(...a,...b,...c);uv.push(...coords);}
 const L=[-w/2,0,-d/2],R=[w/2,0,-d/2],T=[0,h,-d/2],Lf=[-w/2,0,d/2],Rf=[w/2,0,d/2],Tf=[0,h,d/2],u=d/2,v=Math.hypot(w/2,h)/2;
 tri(L,Lf,T,[0,0,u,0,0,v]);tri(Lf,Tf,T,[u,0,u,v,0,v]);tri(R,T,Rf,[0,0,0,v,u,0]);tri(T,Tf,Rf,[0,v,u,v,u,0]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();const o=mesh(g,material('slate','#c6d1d7'),0,0,0,group);
 for(const zz of[-d/2,d/2]){const panel=new THREE.BufferGeometry();panel.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,0,zz,w/2,0,zz,0,h,zz],3));panel.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));panel.computeVertexNormals();const a=mesh(panel,material('plaster','#d3c4a3',{side:THREE.DoubleSide}),0,0,0,group);o.add(a);beam(V3(-w/2,0,zz+.04),V3(0,h,zz+.04),.105,'wood','#776046',o);beam(V3(0,h,zz+.04),V3(w/2,0,zz+.04),.105,'wood','#776046',o);beam(V3(0,0,zz+.05),V3(0,h,zz+.05),.07,'wood','#7c6546',o);}
 beam(V3(0,h,-d/2-.06),V3(0,h,d/2+.06),.09,'slate','#88979b',o);return o;
};
function smallWindow(g,x,y,z,side=false){const t=new THREE.Group();t.position.set(x,y,z);if(side)t.rotation.y=Math.PI/2;g.add(t);box(0,0,0,.85,1.1,.12,'wood','#4d4638',t);box(0,0,.08,.65,.88,.035,'','#ebbb70',t,{emissive:'#fbb65f',emissiveIntensity:.28});for(let xx of[-.4,0,.4])box(xx,0,.13,.07,1.16,.1,'wood','#786347',t);box(0,.02,.14,.84,.065,.08,'wood','#6d5a40',t);box(0,-.6,.13,1.04,.12,.3,'wall','#b4aa8b',t);}
function ropeWrap(parent,x,y,z,r=.18){for(let i=0;i<5;i++){const o=mesh(new THREE.TorusGeometry(r,.025,4,9),material('cloth','#c4b38a'),x,y+i*.045,z,parent);o.rotation.x=Math.PI/2;}}
function fernHouse(x,z,w,d,variant){const y=groundAt(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);const h=2.75,open=variant===2;box(0,.2,0,w+.5,.4,d+.5,'wall','#8e8e6d',g);box(0,.48,0,w,.18,d,'wood','#b09967',g);
 if(!open){box(0,1.75,0,w,2.7,d,'wood','#8e7951',g);for(let xx=-w/2+.3;xx<w/2;xx+=.27)box(xx,1.6,d/2+.05,.1,2.35,.11,'wood',Math.floor(xx*4)%2?'#9e8557':'#ac9565',g);box(-w*.18,1.6,d/2+.13,.94,2.1,.16,'wood','#62513a',g);for(let xx of[w*.23]){smallWindow(g,xx,1.9,d/2+.12);for(let k=0;k<6;k++)box(xx-.44+k*.17,1.9,d/2+.25,.06,1.1,.06,'wood','#a38b60',g);}}
 for(const xx of[-w/2,w/2])for(const zz of[-d/2,d/2]){box(xx,1.9,zz,.24,3.5,.24,'wood','#9c8252',g);ropeWrap(g,xx,2.7,zz);}
 const path=[];for(let i=0;i<=16;i++){let t=i/16*Math.PI;path.push(V3(-Math.cos(t)*(w/2+.45),h+Math.sin(t)*1.35,d/2+.5));}const curve=new THREE.CatmullRomCurve3(path);mesh(new THREE.TubeGeometry(curve,20,.15,7,false),material('wood','#a48b58'),0,0,0,g);
 const geo=new THREE.BufferGeometry(),verts=[],uv=[],idx=[];for(let k=0;k<=24;k++){const t=k/24*Math.PI;for(const zz of[-d/2-.5,d/2+.5]){verts.push(-Math.cos(t)*(w/2+.45),h+Math.sin(t)*1.35,zz);uv.push(zz/2,k/24*2);}}for(let i=0;i<24;i++){let a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,material('wood','#8f8050',{side:THREE.DoubleSide}),0,0,0,g);
 for(let i=0;i<12;i++){const xx=(i/11-.5)*w,cy=h+Math.sin((i+.5)/12*Math.PI)*1.35;plant(x+xx,z-d/3,.8,'ivy',y+cy);}
 const awning=box(0,2.8,d/2+.65,w*.8,.045,1.3,'cloth','#ddd0a2',g);awning.rotation.x=.12;for(let xx of[-w*.37,w*.37])beam(V3(xx,2.6,d/2+1.23),V3(xx,3,d/2+.05),.045,'wood','#a08955',g);lantern(w*.4,2.2,d/2+.32,g);
 for(let i=0;i<4;i++)box(-w*.18,.1+i*.11,d/2+1.35-i*.32,1.8,.14,.34,'wood','#b69b68',g);for(let xx of[-w/2+.2,w/2-.2])box(xx,.8,d/2+.3,.1,1.6,.1,'wood','#ae9158',g);barrel(x+w*.42,z+d/2+.45);obstacle(x,z,w+.2,d+.2,'building');world.userData.buildings.push(g);return g;
}
function reliefShelter(x,z,w,d){const y=groundAt(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);for(let xx of[-w/2,w/2])for(let zz of[-d/2,d/2]){box(xx,1.65,zz,.18,3.3,.18,'wood','#977c52',g);ropeWrap(g,xx,2.9,zz);}box(0,.11,0,w,.22,d,'wood','#9b845b',g);const roof=archRoof(g,w+.6,d+.6,1.1,'cloth');roof.material=material('cloth','#e0d3ab',{side:THREE.DoubleSide});roof.position.y=3.05;box(0,1.5,-d/2,w,2.6,.06,'cloth','#b6b395',g);box(0,.85,0,w*.6,.12,.9,'wood','#a3885f',g);for(let xx of[-w*.25,w*.25])box(xx,.4,0,.1,.8,.7,'wood','#8d7851',g);lantern(w*.4,2.3,d/2,g);barrel(x+w*.4,z+d/2+.5);obstacle(x,z,w,d,'shelter');return g;}
building=function(x,z,w,d,v,kit){if(kit==='fern')return fernHouse(x,z,w,d,v);if(kit==='relief')return reliefShelter(x,z,w,d);const g=originalBuilding(x,z,w,d,v,kit),h=4.9+(v%2)*.8;
 for(const zz of[-d*.25,d*.22]){smallWindow(g,w/2+.09,1.5,zz,true);smallWindow(g,w/2+.09,h-1.35,zz,true);}for(const yy of[.65,2.5,h-.1])box(w/2+.06,yy,0,.14,.16,d+.15,'wood','#806747',g);for(let zz=-d/2;zz<=d/2;zz+=1.35)box(w/2+.07,h/2,zz,.14,h,.14,'wood','#6d583f',g);
 for(let yy=.35;yy<1.7;yy+=.33)for(let xx of[-w/2,w/2])box(xx,yy,d/2+.06,.42,.28,.22,'wall','#c1b393',g);
 if(v%2===1){const bx=w*.12,bz=d/2+.7;box(bx,2.4,bz,w*.65,.18,1.2,'wood','#a48b5b',g);for(let xx=-w*.15;xx<w*.45;xx+=.35){box(xx,2.85,bz+.55,.06,.85,.07,'wood','#997f50',g);}box(bx,3.25,bz+.55,w*.7,.09,.12,'wood','#a68c5c',g);for(let xx of[-w*.22,w*.45])beam(V3(xx,1.5,d/2+.08),V3(xx,2.4,bz+.55),.07,'wood','#8c744e',g);}
 for(let i=0;i<9;i++){let xx=x-w*.44+i*.15,zz=z+d/2+.13;plant(xx,zz,.55,'ivy',g.position.y+1.5+i*.19);}
 if(v===0||v===3){const bx=w*.2,bz=d/2+1.05;box(bx,.95,bz,2.1,.14,.75,'wood','#a48d5d',g);for(let xx of[bx-.85,bx+.85])box(xx,.45,bz,.1,.9,.6,'wood','#8a7650',g);for(let i=0;i<12;i++){const q=mesh(new THREE.IcosahedronGeometry(.07,1),material('grass',['#ab7145','#bb9f48','#84924c'][i%3]),bx+(i%6-2.5)*.23,1.08,bz+(Math.floor(i/6)-.5)*.22,g);}}
 return g;};
const originalFountain=fountain;
fountain=function(){originalFountain();const y=groundAt(0,-3);for(const radius of[1.75,2])for(let i=0;i<16;i++){const a=i*TAU/16,o=box(Math.cos(a)*radius,y+.09,-3+Math.sin(a)*radius,.7,.18,.4,'wall','#c2b797');o.rotation.y=-a;}for(let i=0;i<8;i++){const a=i*TAU/8,p0=V3(Math.cos(a)*.3,y+1.56,-3+Math.sin(a)*.3),p1=V3(Math.cos(a)*.85,y+1.9,-3+Math.sin(a)*.85),p2=V3(Math.cos(a)*1.17,y+.4,-3+Math.sin(a)*1.17),curve=new THREE.QuadraticBezierCurve3(p0,p1,p2);const o=mesh(new THREE.TubeGeometry(curve,12,.016,4,false),material('','#aacfd4',{emissive:'#739dab',emissiveIntensity:.12,transparent:true,opacity:.65,roughness:.12}),0,0,0);o.castShadow=false;}for(let i=0;i<4;i++){let a=i*Math.PI/2;flowerBed(Math.cos(a)*3,-3+Math.sin(a)*3,1.6,.75);}};
function castleBackdrop(){const y=groundAt(0,-20),g=new THREE.Group();g.position.set(0,y,-23);world.add(g);box(0,3.4,0,26,6.8,5,'wall','#d0d0b9',g);for(let xx of[-13,-6,6,13]){mesh(new THREE.CylinderGeometry(1.5,1.65,10,12),material('wall','#c5c7b3'),xx,5,0,g);const roof=mesh(new THREE.ConeGeometry(2,4,12),material('slate','#b1c0cd'),xx,12,0,g);for(let yy of[2.5,5,7.5]){smallWindow(g,xx,yy,1.62);box(xx,yy-.7,1.6,1.2,.12,.2,'wall','#adb7ab',g);}beam(V3(xx,14,0),V3(xx,15.5,0),.035,'metal','#ccb477',g);box(xx+.4,15,0,.8,.55,.04,'cloth','#3e6380',g);}for(let x=-12;x<=12;x+=1.4)box(x,7.1,2.5,.8,.8,.6,'wall','#c8c6af',g);}
const originalTree=tree;
tree=function(x,z,scale,type,random){if(['town','battle'].includes(currentScene().view)&&Math.abs(x)<31&&Math.abs(z)<22)return null;return originalTree(x,z,scale,type,random);};
const originalBuildWorld=buildWorld;
buildWorld=function(id,spawn){originalBuildWorld(id,spawn);const s=currentScene(),rand=seeded(s.seed+987),leafStart=world.userData.leafMatrices.length,plantStart=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,v])=>[k,v.length]));if(['town','battle'].includes(s.view))for(const[x,z,sz]of [[5,-11,1],[-28,-16,1.1],[28,-19,1.2],[-25,19,.9],[25,20,.8]]){if(!colliders.some(c=>Math.abs(x-c.x)<c.w+1&&Math.abs(z-c.z)<c.d+1))originalTree(x,z,sz,'oak',rand);}if(id==='highmere')castleBackdrop();if(id==='square'||id==='entrance'||id==='lane'||id==='alder'){for(const[x,z]of[[-12,7],[14,7],[22,-5],[-22,-2]]){if(staticFree(x,z,.8))flowerBed(x,z,2,.75);}}buildExtraLeaves(leafStart,plantStart);updateLighting();sun.shadow.needsUpdate=true;};
function buildExtraLeaves(start,plantStart){const list=world.userData.leafMatrices.slice(start);if(list.length){const m=new THREE.InstancedMesh(sharedGeo.card,windMaterial('leaves',true),list.length);list.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=m.receiveShadow=true;world.add(m);}for(const[k,all]of Object.entries(world.userData.plantMatrices)){const added=all.slice(plantStart[k]);if(!added.length)continue;const o=new THREE.InstancedMesh(sharedGeo.card,windMaterial(k),added.length);registerPlantMesh(o,k,plantStart[k],added);added.forEach((a,i)=>o.setMatrixAt(i,a));o.receiveShadow=true;world.add(o);}}
const originalGround=groundAt;
groundAt=function(x,z,s=currentScene()){let y=originalGround(x,z,s);if(s.view==='world'&&!s.river)y+=smooth(8,19,roadDistance(x,z,s))*smooth(0,12,-z)*(3+Math.sin(x*.11)*1.2);return y;};

const originalIndoor=indoor;
indoor=function(s){originalIndoor(s);obstacle(0,-20,60,1,'wall');for(const x of[-30,30])obstacle(x,0,.5,40,'wall');
 const g=new THREE.Group();world.add(g);
 if(s.kit==='hall'){
  obstacle(6,-3,9,2,'council desk');
  for(let x of[-22,-12,-2,8,18,26]){smallWindow(g,x,3,-19.4);box(x,1.15,-18.95,2,.16,.7,'wood','#937648',g);box(x,2.7,-19.1,1.2,2.5,.04,'cloth','#4b6c78',g);lantern(x+1.5,2.7,-18.5,g);}
  for(let x of[-16,16]){box(x,.5,-10,4,1,1.3,'wood','#967b51',g);for(let xx of[-1.5,1.5])box(x+xx,.24,-8.7,.8,.48,.8,'wood','#9a8059',g);}
 }else if(s.kit==='inn'){
  obstacle(6,-3,5,3,'bed');box(9,.55,-3,1.2,1.1,1.2,'wood','#9b815a',g);smallWindow(g,4,2.7,-19.4);for(let x of[-17,-7,13,23]){box(x,2,-19.2,2,3.1,.15,'wood','#705d49',g);smallWindow(g,x,2.5,-19.1);lantern(x+1.4,2.6,-18.8,g);}box(11,.45,-10,4,.9,1.8,'wood','#9d805a',g);
 }else if(s.kit==='archives'){
  for(let x of[-20,-11,2,15,23]){box(x,.55,-9,3.5,1.1,1.4,'wood','#997c55',g);box(x,1.16,-9,1.4,.08,.9,'cloth','#d7c69e',g);for(let j=0;j<4;j++)box(x+1,.17+j*.2,-9,.55,.18,.8,'cloth',['#525e59','#6d5648','#736650'][j%3],g);obstacle(x,-9,3.5,1.4,'reading desk');lantern(x,2.6,-12,g);}
 }
 if(s.kit!=='cave'){for(let x=-27;x<29;x+=5){beam(V3(x,5.6,-19),V3(x,5.6,0),.12,'wood','#786346',g);box(x,2.7,-19,.28,5.4,.28,'wood','#776345',g);}for(let k=0;k<10;k++)box(-17+k*2,.012,4-k*.3,2.05,.025,3.8,'cloth','#586d69',g);}
};
