// A second pass of modeled joinery, carved masonry and planted scene composition.
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
// Woodland housing is owned by systems/world-kit.js.

function reliefShelter(x,z,w,d){const y=groundAt(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);for(let xx of[-w/2,w/2])for(let zz of[-d/2,d/2]){box(xx,1.65,zz,.18,3.3,.18,'wood','#977c52',g);ropeWrap(g,xx,2.9,zz);}box(0,.11,0,w,.22,d,'wood','#9b845b',g);const roof=archRoof(g,w+.6,d+.6,1.1,'cloth');roof.material=material('cloth','#e0d3ab',{side:THREE.DoubleSide});roof.position.y=3.05;box(0,1.5,-d/2,w,2.6,.06,'cloth','#b6b395',g);box(0,.85,0,w*.6,.12,.9,'wood','#a3885f',g);for(let xx of[-w*.25,w*.25])box(xx,.4,0,.1,.8,.7,'wood','#8d7851',g);lantern(w*.4,2.3,d/2,g);barrel(x+w*.4,z+d/2+.5);obstacle(x,z,w,d,'shelter');return g;}
// Regional building placement is owned by systems/world-kit.js.

const originalFountain=fountain;
fountain=function(){originalFountain();const y=groundAt(0,-3);for(const radius of[1.75,2])for(let i=0;i<16;i++){const a=i*TAU/16,o=box(Math.cos(a)*radius,y+.09,-3+Math.sin(a)*radius,.7,.18,.4,'wall','#c2b797');o.rotation.y=-a-Math.PI/2;}for(let i=0;i<8;i++){const a=i*TAU/8,p0=V3(Math.cos(a)*.3,y+1.56,-3+Math.sin(a)*.3),p1=V3(Math.cos(a)*.85,y+1.9,-3+Math.sin(a)*.85),p2=V3(Math.cos(a)*1.17,y+.4,-3+Math.sin(a)*1.17),curve=new THREE.QuadraticBezierCurve3(p0,p1,p2);const o=mesh(new THREE.TubeGeometry(curve,12,.016,4,false),material('','#aacfd4',{emissive:'#739dab',emissiveIntensity:.12,transparent:true,opacity:.65,roughness:.12}),0,0,0);o.castShadow=false;}for(let i=0;i<4;i++){let a=i*Math.PI/2;flowerBed(Math.cos(a)*3,-3+Math.sin(a)*3,1.6,.75);}};
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
