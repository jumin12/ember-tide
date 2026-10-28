// Miniature settlements have their own street plans, skylines and working props.
worldTownModel=function(key,p){
 const[x,z]=p.node,y=macroGround(x,z),root=new THREE.Group();root.position.set(x,y,z);root.userData.worldHouse=true;world.add(root);world.userData.buildings.push(root);
 const plans={brookstead:[[-5,-4,4.2,3.3,3.2,0],[4.2,-3,3.5,3,2.8,.12],[-7,3.7,3,3,2.6,-.15],[5.5,4.5,2.9,2.7,2.5,.2],[0,-9,3.5,3,3.1,0]],highmere:[[-1,-5,5.5,4,4.4,0],[-7,-1,3.5,3,3.2,-.1],[6,0,3.7,3.1,3.8,.1],[-6,5,3.1,3,2.8,0],[5,6,3,2.8,3.1,0]],fern:[[-5,-4,3.4,5.6,2.4,0],[4,-5,4.6,3,2.9,.1],[-6,4,2.8,3,2.1,-.12],[4.8,4,3,3,2.3,.15],[0,-10,3,2.7,2.5,0]],alder:[[-5,-3,4,3.4,2.8,0],[4,-5,3.1,3.2,3.1,.15],[6,4,3.2,3,2.4,-.1],[-5.5,5,3,2.6,2.4,.1]],relief:[[-4,-4,4,3.6,2.5,0],[4,-4,4.2,3.2,2.3,0],[-6,4,2.9,2.7,2.2,-.15],[5,4,3,3,2.4,.1]]};
 const used=[],roadClear=(wx,wz,r)=>!world.userData.bridges.some(b=>Math.abs(wx-b.x)<b.length/2+r+2&&Math.abs(wz-b.z)<b.width/2+r+2)&&macroRoadInfo15(wx,wz).d>r+3.4;
 function house(spec,index){let[dx,dz,w,d,h,angle]=spec,found=null;for(let r=0;r<=8&&!found;r+=1.2)for(let k=0;k<(r?12:1);k++){const a=k*TAU/12,px=dx+Math.cos(a)*r,pz=dz+Math.sin(a)*r,rad=Math.hypot(w,d)*.5;if(Math.hypot(px,pz)>19||macroGround(x+px,z+pz)<0||!roadClear(x+px,z+pz,rad)||used.some(o=>Math.hypot(o.x-px,o.z-pz)<o.r+rad+.5))continue;found={x:px,z:pz,r:rad};break;}if(!found)return;used.push(found);dx=found.x;dz=found.z;
  const g=new THREE.Group();g.position.set(dx,macroGround(x+dx,z+dz)-y,dz);g.rotation.y=angle;root.add(g);const wall=key==='fern'?'#c2bc9a':['#ded0ae','#c6cab7','#d9c6aa','#c9bf9d'][index%4];box(0,h/2,0,w,h,d,'plaster',wall,g);box(0,.15,0,w+.2,.3,d+.2,'wall','#b5c0ad',g);
  for(const side of[-1,1]){const roof=box(side*w*.26,h+w*.16,0,w*.64,.16,d+.7,'slate',key==='fern'?'#79958d':'#7792a9',g);roof.rotation.z=-side*.55;box(side*w*.46,h*.5,d*.5+.035,.12,h,.12,'darkWood','#795535',g);for(const zz of[-d*.5,d*.5])box(side*w*.46,h*.48,zz,.11,h,.12,'wood','#805b3b',g);}
  if(!sharedGeo.miniGable){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-1,0,0,1,0,0,0,1,0],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));geo.computeVertexNormals();sharedGeo.miniGable=geo;}
  for(const side of[-1,1]){const triangle=mesh(sharedGeo.miniGable,material('plaster',wall),0,h,side*(d*.5+.015),g);triangle.scale.set(w*.5,w*.3,1);if(side<0)triangle.rotation.y=Math.PI;beam(V3(-w*.5,h,side*(d*.5+.04)),V3(0,h+w*.3,side*(d*.5+.04)),.055,'darkWood','#8b6240',g);beam(V3(0,h+w*.3,side*(d*.5+.04)),V3(w*.5,h,side*(d*.5+.04)),.055,'darkWood','#8b6240',g);}
  lantern(0,1.85,d*.5+.4,g);
  box(0,h,0,.13,.16,d+.65,'darkWood','#887053',g);for(const yy of[.4,h*.6,h-.05])box(0,yy,d*.5+.07,w,.1,.12,'wood','#a3764d',g);box(0,.78,d*.5+.11,.65,1.4,.09,'door','#c3bea1',g);
  for(const side of[-1,1])box(side*w*.29,h*.62,d*.5+.13,.55,.7,.07,'window','#f0d29c',g);box(w*.3,h+.3,-d*.24,.4,1.1,.42,'wall','#acb7aa',g);box(w*.3,h+.91,-d*.24,.55,.16,.56,'wall','#d0d3be',g);
  // Foundations and collision occupy the same actual footprint, away from roads.
  obstacle(x+dx,z+dz,w+.45,d+.45,'miniature building');
  if(index===0){const canopy=box(0,1.9,d*.5+.65,w*.8,.09,1.1,'cloth',key==='fern'?'#7c9b6b':'#d1bb87',g);canopy.rotation.x=.15;for(const side of[-1,1])box(side*w*.36,.9,d*.5+1,.07,1.8,.07,'wood','#92704a',g);}
  if(index%2===0){const crate=box(w*.61,.23,d*.12,.55,.46,.55,'crateFace','#ba996e',g);crate.rotation.y=.2;mesh(new THREE.CylinderGeometry(.22,.25,.6,8),material('barrelStave','#b89b6f'),-w*.6,.3,d*.23,g);}
 }
 for(const[spec,i]of(plans[key]??plans.alder).map((q,i)=>[q,i]))house(spec,i);
 if(key==='highmere'){const at=used[0]??{x:0,z:-7};for(const side of[-1,1]){const px=at.x+side*3.2,pz=at.z-1;if(!roadClear(x+px,z+pz,1.2))continue;const by=macroGround(x+px,z+pz)-y;mesh(new THREE.CylinderGeometry(.8,1.05,5.8,10),material('wall','#c2cab9'),px,by+2.9,pz,root);mesh(new THREE.ConeGeometry(1.3,2.4,10),material('slate','#7091ad'),px,by+6.8,pz,root);obstacle(x+px,z+pz,2.1,2.1,'city tower');}}
 for(const q of used){if(!roadClear(x+q.x,z+q.z+q.r+1,.4))continue;for(const side of[-1,1]){const px=q.x+side*(q.r-.5),pz=q.z+q.r+.7,by=macroGround(x+px,z+pz)-y;mesh(new THREE.CylinderGeometry(.3,.23,.45,8),material('wood','#a98d63'),px,by+.22,pz,root);mesh(new THREE.SphereGeometry(.43,8,6),material('shrub','#8bb36b'),px,by+.65,pz,root);}}
 // An open forecourt marks the entrance. Its floor marker replaces a portal prop.
 createInteraction('location',x,z+9,'Enter '+p.name);Object.assign(interactables.at(-1),{poi:key,radius:7,visualHeight:.2});groundDecal(x,z+9,textures.exitMarker,3.4,0,'#ead7a2');
 world.userData.miniatures??=[];world.userData.miniatures.push({key,buildings:used.length,uniquePlan:true});
};
