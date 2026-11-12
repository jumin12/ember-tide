// RE-095: individually authored silhouettes around Brookstead's existing lots.
// Joined roofs, readable timber bays and fitted frontages retain the town's geography.
const BROOK_HOMES121={
 inn:{name:'The Lantern Inn',eaves:6.4,rise:3.25,roof:'cross',tone:'#e7ddc5',timber:'#90704d'},
 forge:{name:'Brookstead Smithy',eaves:4.15,rise:2.55,roof:'smith',tone:'#d6cfb9',timber:'#795c40'},
 shop:{name:'Riverstone Supplies',eaves:4.45,rise:2.60,roof:'gable',tone:'#e8ddc1',timber:'#96734e'},
 mill:{name:'The Mill Workshop',eaves:3.65,rise:2.10,roof:'mill',tone:'#ddd4bb',timber:'#876648'},
 tower:{name:'Riverside Weavers Cottage',eaves:6.85,rise:2.25,roof:'hip',tone:'#e6dbc5',timber:'#8c6b48'},
 garden:{name:'The Kitchen Garden House',eaves:4.20,rise:2.35,roof:'garden',tone:'#e9dfc7',timber:'#977c55'},
 dormer:{name:'The Gabled Cottage',eaves:4.75,rise:2.60,roof:'dormer',tone:'#e2d6bd',timber:'#856548'},
 lodge:{name:'The Orchard House',eaves:5.25,rise:2.15,roof:'lodge',tone:'#e7d7bd',timber:'#92714c'}
};
function brookProfile121(x,z,kind){if(kind!=='home')return BROOK_HOMES121[kind];return BROOK_HOMES121[x<-140?'tower':z<35?'garden':z<70?'dormer':'lodge'];}
function roof121(parent,x,z,w,d,y,rise,rotate=0){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotate;parent.add(g);
 // Continuous slope UVs keep slate courses the same physical size on every
 // roof, including dormers. Each gable is plaster rather than roof tiles.
 const vertices=[[-w/2,0,-d/2],[-w/2,0,d/2],[0,rise,-d/2],[0,rise,d/2],[w/2,0,-d/2],[w/2,0,d/2]],pos=[],uv=[];
 for(const ids of[[0,1,2],[1,3,2],[2,3,4],[3,5,4]])for(const i of ids){const v=vertices[i];pos.push(...v);uv.push(v[2]*.57,(v[0]<0?-1:1)*Math.hypot(v[0],rise-v[1])*.57);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
 const skin=mesh(geo,material('slate','#b7c5cf',{side:THREE.DoubleSide}),0,0,0,g);skin.userData.roof24=true;
 for(const side of[-1,1]){const face=new THREE.BufferGeometry();face.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,0,side*(d/2-.10),w/2,0,side*(d/2-.10),0,rise,side*(d/2-.10)],3));face.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,w*.25,0,w*.125,rise*.25],2));face.computeVertexNormals();mesh(face,material('plaster','#e0d5b8',{side:THREE.DoubleSide}),0,0,0,g);
  beam(V3(-w*.42,.16,side*d/2),V3(w*.42,.16,side*d/2),.075,'wood','#8a704d',g);beam(V3(0,.13,side*d/2),V3(0,rise-.13,side*d/2),.075,'wood','#8a704d',g);
  for(const hand of[-1,1])beam(V3(hand*w*.33,.22,side*d/2),V3(hand*w*.09,rise*.63,side*d/2),.06,'wood','#9c8158',g);
 }
 // Real eaves, ridge caps and joined bargeboards articulate the silhouette.
 for(const side of[-1,1]){box(side*w/2,-.08,0,.16,.22,d+.08,'darkWood','#71583f',g);for(const zz of[-d/2,d/2])beam(V3(side*w/2,-.04,zz),V3(0,rise+.03,zz),.075,'wood','#a48b61',g);}
 for(let zz=-d/2+.17;zz<d/2;zz+=.46)box(0,rise+.06,zz,.28,.12,.49,'slate','#9faeb8',g);
 // Exposed rafter tails and joined fascia give small slate courses a scale.
 for(const side of[-1,1])for(let zz=-d/2+.35;zz<d/2;zz+=.78){
  box(side*(w/2-.20),-.15,zz,.43,.16,.13,'darkWood','#786447',g);
 }
 return g;
}
function hipRoof121(parent,w,d,y,rise){
 const p=[],uv=[],left=-w/2,right=w/2,back=-d/2,front=d/2,ridge=Math.max(.3,w*.19);
 const add=(a,b,c)=>{for(const v of[a,b,c]){p.push(...v);uv.push(v[0]*.49,v[2]*.49+v[1]*.34);}};
 const a=[left,0,back],b=[right,0,back],c=[right,0,front],d0=[left,0,front],l=[-ridge,rise,0],r=[ridge,rise,0];
 add(a,l,b);add(b,l,r);add(b,r,c);add(c,r,d0);add(d0,r,l);add(d0,l,a);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
 const roof=mesh(geometry,material('slate','#b4c2cc',{side:THREE.DoubleSide}),0,y,0,parent);roof.userData.roof24=true;
 for(const[s,e]of[[a,l],[b,r],[c,r],[d0,l]])beam(V3(s[0],y,s[2]),V3(e[0],y+e[1],e[2]),.075,'slate','#a4b4bd',parent);
 return roof;
}
function chimney121(g,x,z,base,height=2.4,width=.90){
 box(x,base+height/2,z,width,height,width,'wall','#c9c7b3',g);
 for(const yy of[base+.16,base+height-.20])box(x,yy,z,width+.16,.18,width+.16,'wall','#ded7bf',g);
 box(x,base+height+.04,z,width+.20,.13,width+.20,'wall','#d5cfbb',g);box(x,base+height+.115,z,width*.66,.035,width*.66,'darkWood','#3f423b',g);
 return[x,base+height+.14,z];
}
function crate121(g,x,y,z,size=.7){
 box(x,y+size/2,z,size,size,size,'wood','#b09467',g);
 for(const side of[-1,1])for(const yy of[y+.1,y+size-.1])box(x,yy,z+side*(size/2+.025),size+.06,.09,.08,'darkWood','#8f704a',g);
 for(const side of[-1,1])beam(V3(x-size*.4,y+size*.15,z+side*(size/2+.07)),V3(x+size*.4,y+size*.85,z+side*(size/2+.07)),.055,'wood','#c0a276',g);
}
function barrel121(g,x,y,z,size=.7){
 const shape=new THREE.CylinderGeometry(size*.40,size*.39,size,14,3),p=shape.attributes.position;
 for(let i=0;i<p.count;i++){const factor=1+.12*Math.cos(p.getY(i)/size*Math.PI);p.setX(i,p.getX(i)*factor);p.setZ(i,p.getZ(i)*factor);}shape.computeVertexNormals();
 mesh(shape,material('wood','#947448'),x,y+size/2,z,g);
 for(const h of[.18,.79]){const hoop=mesh(new THREE.TorusGeometry(size*.43,size*.025,4,14),material('metal','#5e6662',{metalness:.65,roughness:.5}),x,y+size*h,z,g);hoop.rotation.x=Math.PI/2;}
 box(x,y+size+.012,z,size*.65,.025,size*.08,'wood','#b3986e',g);
}
function planter121(g,x,y,z,width=1.8){
 box(x,y,z,width,.30,.48,'wood','#a88a5c',g);box(x,y+.16,z,width-.15,.045,.33,'earth','#544d32',g);
 for(const side of[-1,1])box(x+side*width*.45,y,z,.09,.34,.52,'darkWood','#7f6546',g);
 for(let i=0;i<7;i++){
  const xx=x+(i-3)*width*.115,yy=y+.33+(i%3)*.05;
  for(const side of[-1,1]){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([xx,yy-.15,z,xx+side*.17,yy+.05,z+.07,xx+side*.28,yy-.03,z+.09,xx+side*.14,yy-.08,z+.14],3));geometry.setIndex([0,1,3,1,2,3]);geometry.computeVertexNormals();mesh(geometry,material('grass','#648454',{side:THREE.DoubleSide}),0,0,0,g);}
  for(let petal=0;petal<5;petal++){const a=petal*Math.PI*.4,o=mesh(new THREE.SphereGeometry(.06,5,3),material('cloth',i%3?'#e2dbbf':'#af8bac'),xx+Math.cos(a)*.07,yy+.04,z+Math.sin(a)*.07,g);o.scale.y=.5;}
 }
}
function porch121(g,doorX,front,width,depth,height,cloth=false,cx=doorX){
 if(cloth){
  // Sewn, curved canvas and a scalloped hem, rather than a row of boxes.
  const pos=[],uv=[],idx=[],nx=Math.ceil(width/.42),nz=12;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/nz;pos.push(cx+(u-.5)*width,height-.38*v-.12*Math.sin(v*Math.PI),front+.02+v*depth);uv.push(u*width*.45,v*depth*.45);if(i&&j){const k=j*(nx+1)+i;idx.push(k-nx-2,k-1,k,k-nx-2,k,k-nx-1);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,material('cloth','#e9e1cc',{side:THREE.DoubleSide}),0,0,0,g);
  const hem=[],huv=[],hi=[];
  for(let i=0;i<=nx*8;i++){const u=i/(nx*8),xx=cx+(u-.5)*width,top=height-.38,bottom=top-.14-.09*Math.sin((u*nx%1)*Math.PI);hem.push(xx,top,front+depth+.025,xx,bottom,front+depth+.025);huv.push(u*width,.2,u*width,0);if(i){const k=i*2;hi.push(k-2,k-1,k,k,k-1,k+1);}}
  const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hem,3));hg.setAttribute('uv',new THREE.Float32BufferAttribute(huv,2));hg.setIndex(hi);hg.computeVertexNormals();mesh(hg,material('cloth','#e7ddc1',{side:THREE.DoubleSide}),0,0,0,g);
 }else{
  const before=g.children.length;leanRoof31(g,cx,front+.02,width,depth,height,'slate','#abbac4');
  const roof=g.children[before];if(roof?.geometry.attributes.uv){const uv=roof.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3.35,uv.getY(i)*3.35);uv.needsUpdate=true;}
 }
 for(const side of[-1,1]){const x=cx+side*(width/2-.12),z=front+depth-.10;box(x,(height-.38)/2,z,.18,height-.38,.18,'wood','#a0875d',g);beam(V3(x,height-.95,z),V3(x-side*.52,height-.40,z),.07,'wood','#b3986c',g);}

}
function windowBay121(g,x,y,z,scale=1,angle=0){const bay=window31(g,x,y,z,angle,scale);for(const yy of[-.25,.25])box(0,yy,.222,1.15,.036,.075,'wood','#aa8e5c',bay);g.userData.architecture31.openings.push({kind:'window',x,y,w:2.1*scale,h:2.02*scale,face:angle?'side':'front'});}
function buildBrookHome121(x,z,w,d,kind){
 const p=brookProfile121(x,z,kind),y=groundAt(x,z),h=p.eaves,front=d/2+.12,doorX=-w*.15,g=new THREE.Group(),roof=new THREE.Group();
 const plantStart=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length]));
 g.position.set(x,y,z);g.name=p.name;world.add(g);g.add(roof);
 g.userData={worldHouse:true,brookHouse:true,kind,footprint:{w,d},front:V3(0,0,1),door:V3(x+doorX,y,z+d/2+1.1),roofShell:roof,architecture24:{westFacade:true,roofChart:true},architecture31:{openings:[],door:[doorX,front],roofRise:p.rise,variant:p.roof},authored121:{name:p.name,profile:p.roof,oldLot:[x,z,w,d],eaves:h,peak:h+p.rise,doorPreserved:true}};
 const panel=(xx,yy,zz,ww,hh,dd,key='plaster',tint=p.tone)=>box(xx,yy,zz,ww,hh,dd,key,tint,g),left=-w/2,right=w/2,dl=doorX-1.03,dr=doorX+1.03;
 panel(0,.18,0,w+.25,.36,d+.25,'wall','#babaa5');
 if(kind==='forge'){panel((left-w*.255)/2,(h-.65)/2+.2,-d/2+.13,w*.245,h-.65,.26);panel(w*.1225,h/2+.2,-d/2+.13,w*.755,h,.26);}
 else panel(0,h/2+.2,-d/2+.13,w,h,.26);
 for(const side of[-1,1]){const sh=kind==='forge'&&side<0?h-.65:h;panel(side*(w/2-.13),sh/2+.2,0,.26,sh,d-.24);}
 if(kind==='forge'||kind==='mill')panel((left+dl)/2,h-.85,d/2-.13,dl-left,.70,.26);
 else panel((left+dl)/2,h/2+.2,d/2-.13,dl-left,h,.26);
 panel((dr+right)/2,h/2+.2,d/2-.13,right-dr,h,.26);panel(doorX,(h+3.32)/2+.1,d/2-.13,2.06,h-3.12,.26);
 // Substantial stone plinth, upright joinery and diagonals remain independent
 // of the recessed glazing; no braces cross a window or the front door.
 for(const side of[-1,1]){
  panel(side*(w/2+.02),.60,0,.24,.65,d+.15,'wall','#c3bfaa');
  const sh=kind==='forge'&&side<0?h-.65:h;
  for(const zz of[-d/2,d/2])panel(side*w/2,sh/2+.2,zz,.26,sh+.36,.26,'darkWood',p.timber);
  for(const yy of[1.02,sh+.10,...(h>5.6?[3.45]:[])])panel(side*(w/2+.04),yy,0,.18,.19,d+.1,'wood','#a98b60');
 }
 for(const yy of[1.02,h+.10,...(h>5.6?[3.45]:[])]){
  if(yy<3.2){panel((left+dl)/2,yy,front,dl-left,.18,.19,'wood','#a98b60');panel((dr+right)/2,yy,front,right-dr,.18,.19,'wood','#a98b60');}
  else if(kind==='forge'){panel((left+dl)/2,yy-.65,front,dl-left,.19,.21,'wood','#a98b60');panel((dl+right)/2,yy,front,right-dl,.19,.21,'wood','#a98b60');}
  else panel(0,yy,front,w+.12,.19,.21,'wood','#a98b60');
 }
 door31(g,doorX,front);g.userData.architecture31.openings.push({kind:'door',x:doorX,y:1.63,w:2.31,h:3.18,face:'front'});
 const upper=h>5.6?5.03:2.20;
 windowBay121(g,w*.28,2.15,front+.04,.86);
 if(h>5.6)for(const xx of[-w*.29,w*.29]){windowBay121(g,xx,upper,front+.04,.84);planter121(g,xx,upper-1.02,front+.18,1.62);}
 else if(kind==='home')planter121(g,w*.28,1.20,front+.17,1.7);
 for(const side of[-1,1])for(const zz of[-d*.25,d*.25])windowBay121(g,side*(w/2+.10),h>5.6?4.85:2.18,zz,.78,side*Math.PI/2);
 for(const side of[-1,1])for(const zz of[-d*.35,d*.35])beam(V3(side*(w/2+.13),h-.90,zz-.35),V3(side*(w/2+.13),h-.12,zz+.35),.075,'wood',p.timber,g);
 if(p.roof==='hip')hipRoof121(roof,w+.86,d+.90,h+.20,p.rise);
 else if(p.roof==='cross'||p.roof==='garden'||p.roof==='lodge'){
  roof121(roof,0,0,d+.92,w+.86,h+.20,p.rise,Math.PI/2);
  const dw=p.roof==='cross'?w*.48:w*.36,dx=p.roof==='lodge'?w*.18:doorX;
  roof121(roof,dx,d*.22,dw,d*.65+.64,h+.12,p.rise*.83);
 }else if(p.roof==='smith'){
  roof121(roof,w*.13,0,w*.77,d+.90,h+.20,p.rise);
  const wing=new THREE.Group();wing.rotation.y=-Math.PI/2;wing.position.set(-w*.255,h+.14,0);roof.add(wing);leanRoof31(wing,0,0,d+.8,w*.30,0);
  const course=wing.children[0].geometry.attributes.uv;for(let i=0;i<course.count;i++)course.setXY(i,course.getX(i)*3.35,course.getY(i)*3.35);course.needsUpdate=true;
 }else if(['dormer','mill'].includes(p.roof))roof121(roof,0,0,d+.90,w+.86,h+.20,p.rise,Math.PI/2);
 else roof121(roof,0,0,w+.86,d+.90,h+.20,p.rise);
 if(['hip','dormer','mill'].includes(p.roof)){
  const dw=w*.33,dy=h+p.rise*.44,dz=d*.28,dh=1.42;
  const sill=h+.12,top=dy+dh,df=d*.33;
  // Walls extend into the main slope: the dormer cannot float above it.
  box(0,(sill+top)/2,dz,dw*.90,top-sill,df,'plaster',p.tone,roof);roof121(roof,0,dz,dw+.22,d*.39,top,dw*.34);
  for(const side of[-1,1])box(side*dw*.43,(sill+top)/2,dz+df/2+.05,.13,top-sill,.15,'darkWood',p.timber,roof);
  box(0,dy-.03,dz+df/2+.05,dw*.94,.16,.18,'wood','#a78c60',roof);
  window31(roof,0,dy+dh*.51,dz+d*.165+.08,0,.55);
 }
 if(['cross','garden','lodge'].includes(p.roof)){
  const dx=p.roof==='lodge'?w*.18:doorX,dy=h+p.rise*.40;
  window31(roof,dx,dy,d*.22+(d*.65+.64)/2+.02,0,p.roof==='cross'?.64:.49);
 }
 // Joined facade braces, pegs and the central upper-floor post reproduce the
 // concept's dense timber construction without crossing any glazing.
 if(h>5.6)panel(0,(3.45+h)/2,front+.02,.17,h-3.45,.19,'darkWood',p.timber);
 for(const side of[-1,1]){
  beam(V3(side*w*.47,h-.68,front+.02),V3(side*w*.39,h+.04,front+.02),.07,'wood',p.timber,g);
  for(const yy of[1.04,h+.10])for(const xx of[side*w*.46,side*w*.32]){const peg=mesh(new THREE.CylinderGeometry(.032,.032,.045,5),material('metal','#6f6651',{roughness:.72,metalness:.3}),xx,yy,front+.15,g);peg.rotation.x=Math.PI/2;}
 }
 // Half-timbered bays define complete walls; every brace clears glazing.
 const faceZ=front+.055,post=(xx,y0,y1)=>panel(xx,(y0+y1)/2,faceZ,.20,y1-y0,.24,'darkWood',p.timber);
 const framing=[left+.18,doorX-1.23,doorX+1.23,right-.18];
 for(const xx of framing)post(xx,1.06,h+.1);
 if(kind!=='forge'&&kind!=='mill'){
  const bx=(doorX+1.23+w*.28-1.03)/2;
  if(w*.28-1.03-(doorX+1.23)>.6){post(bx,1.07,h>5.6?3.4:h);beam(V3(bx,1.15,faceZ),V3(w*.28-1.06,3.04,faceZ),.085,'darkWood',p.timber,g);}
 }
 if(h>5.6){
  for(const side of[-1,1])beam(V3(side*.24,3.62,faceZ),V3(side*(w*.29-1.12),h-.20,faceZ),.095,'darkWood',p.timber,g);
  for(const side of[-1,1])for(const zz of[-d*.46,0,d*.46])panel(side*(w/2+.10),(3.45+h)/2,zz,.23,h-3.45,.20,'darkWood',p.timber);
 }else for(const side of[-1,1])panel(side*(w/2+.10),h/2+.5,0,.23,h-.95,.20,'darkWood',p.timber);
 // Small battered masonry courses and tied eaves are shared construction,
 // while the roof and frontage remain unique to each household.
 for(const side of[-1,1])for(let xx=left+.25;xx<right;xx+=.95){
  if(side>0&&xx>dl-.3&&xx<dr+.3)continue;
  panel(xx,.48,side*(d/2+.06),.86,.34,.18,'wall',(Math.round(xx*7)%3)?'#b5b6a3':'#c9c6b0');
 }
 g.userData.authored122={joinedDormers:true,slateCourseScale:.57,timberBays:framing.length,clearEntry:true};
 // The inn's deep shared porch and the shop's cream canvas are recognizable
 // businesses; residential frontages retain smaller individual entry roofs.
 const canopy=kind==='inn'?Math.min(w*.70,10.5):kind==='shop'?Math.min(w*.66,8):kind==='forge'?2.90:kind==='mill'?w*.72:Math.min(w*.43,4.0),depth=kind==='inn'?2.25:1.8;
 porch121(g,doorX,front,canopy,depth,kind==='inn'?3.80:3.48,kind==='shop',kind==='shop'?0:doorX);
 if(kind==='inn'){
  // Small front gable over the door joins the veranda roof, with side seating.
  roof121(g,doorX,front+1.10,3.45,2.60,3.35,.95);box(doorX,3.38,front+2.43,3.1,.18,.18,'wood','#b29463',g);
  for(const xx of[-w*.38,w*.38]){planter121(g,xx,.48,front+.7,.9);barrel121(g,xx,.20,front+1.40,.68);}
  const seating=new THREE.Group();seating.position.set(w/2+.08,0,d*.03);seating.rotation.y=Math.PI/2;g.add(seating);porch121(seating,0,0,d*.55,1.70,3.26,true,0);
  box(0,.91,.85,d*.40,.14,.48,'wood','#a4875e',seating);for(const xx of[-d*.15,d*.15])box(xx,.5,.85,.14,.75,.35,'darkWood','#806441',seating);
  box(0,1.36,.67,d*.40,.40,.12,'wood','#aa8c5d',seating);
 }else if(kind==='forge'){
  const xx=-w*.37,zz=front+.20;
  box(xx,.48,zz,2.12,.96,1.6,'wall','#8f988e',g);box(xx,1.03,zz,1.42,.15,1.13,'darkWood','#454a43',g);
  const coals=box(xx,1.16,zz,1.12,.075,.76,'rock','#4e3023',g,{emissive:'#f06b22',emissiveIntensity:.9});coals.name='Recessed glowing smithy coals';
  box(xx,3.20,zz-.80,1.05,4.70,.95,'wall','#9ea28d',g);
  const glow=new THREE.PointLight('#ff9e41',2.4,5,2);glow.position.set(xx,1.55,zz+.28);g.add(glow);
  const fire=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{fireTime121:windUniforms.time},vertexShader:'varying vec2 fireUV121;void main(){fireUV121=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 fireUV121;uniform float fireTime121;
   void main(){vec2 p=fireUV121;float sway=sin(p.y*8.-fireTime121*4.1)*.055+sin(p.y*17.-fireTime121*6.2)*.026;float width=(1.-p.y)*.43;float edge=abs(p.x-.5+sway);float alpha=(1.-smoothstep(width*.55,width,edge))*smoothstep(0.,.13,p.y)*(1.-smoothstep(.72,1.,p.y));if(alpha<.025)discard;vec3 heat=mix(vec3(1.,.19,.018),vec3(1.,.70,.18),1.-smoothstep(.0,.68,p.y));gl_FragColor=vec4(heat,alpha*.87);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`});
  for(const angle of[0,Math.PI/2]){const flame=new THREE.Mesh(new THREE.PlaneGeometry(1.10,.72),fire);flame.position.set(xx,1.52,zz);flame.rotation.y=angle;flame.name='Animated recessed forge flame';flame.userData.dynamicFX=true;g.add(flame);}
  box(xx,2.30,front-.28,2.15,.12,.14,'darkWood','#8d704a',g);
  for(const px of[-w*.47,dl-.08]){box(px,1.65,front+.02,.24,3.3,.26,'darkWood',p.timber,g);beam(V3(px,2.5,front+.08),V3(px+(px<xx?.65:-.65),3.12,front+.08),.10,'wood','#a08a5d',g);}
  // A fitted stone forge hood joins the same flue, above the fire and tools.
  const hood=new THREE.CylinderGeometry(.58,1.14,1.15,4,1);hood.rotateY(Math.PI/4);mesh(hood,material('wall','#a2a694'),xx,2.82,zz-.22,g);
  const shield=new THREE.Shape();shield.moveTo(-.30,.4);shield.lineTo(.30,.4);shield.lineTo(.28,-.18);shield.quadraticCurveTo(0,-.52,-.28,-.18);shield.closePath();const sg=new THREE.ExtrudeGeometry(shield,{depth:.07,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:1});mesh(sg,material('metal','#849390',{metalness:.72,roughness:.38}),xx+.95,1.50,front+.38,g);
  for(let i=0;i<4;i++){const tx=xx-.72+i*.48;box(tx,1.75,front-.13,.12,1.05,.065,'metal','#b8c5c2',g);box(tx,2.28,front-.13,.38,.08,.11,'metal','#7b8580',g);box(tx,2.47,front-.13,.08,.28,.09,'darkWood','#716048',g);}
  for(let i=0;i<7;i++){const log=mesh(new THREE.CylinderGeometry(.19,.21,1.20,10),material('bark','#93846b'),-w*.40,.39+Math.floor(i/3)*.35,front-3.0+(i%3)*.35,g);log.rotation.z=Math.PI/2;}
  crate121(g,w*.40,.18,front+.47,.75);
 }else if(kind==='shop'){
  const counterX=w*.27;box(counterX,.68,front+.80,w*.35,1.0,.8,'wood','#a48759',g);for(let i=0;i<4;i++)box(counterX-w*.12+i*w*.08,1.27,front+.80,.48,.20,.44,'wood',i%2?'#b2a275':'#8c9a55',g);
  barrel121(g,-w*.43,.18,front+.5,.76);crate121(g,w*.43,.18,front+.55,.58);
 }else if(kind==='mill'){
  const wx=-w*.40,winch=mesh(new THREE.CylinderGeometry(.30,.30,1.1,16),material('wood','#96784e'),wx,1.6,front+.25,g);winch.rotation.z=Math.PI/2;
  for(const side of[-1,1])box(wx+side*.50,1.15,front+.5,.14,2.3,.16,'darkWood','#8f724d',g);
  for(let i=0;i<9;i++){const rope=mesh(new THREE.TorusGeometry(.315,.026,4,16),material('cloth','#a89971'),wx-.36+i*.09,1.6,front+.25,g);rope.rotation.y=Math.PI/2;}
  const wheel=mesh(new THREE.TorusGeometry(.55,.055,5,16),material('darkWood','#745d3f'),wx-.62,1.6,front+.25,g);wheel.rotation.y=Math.PI/2;
  for(let i=0;i<4;i++){const a=i*Math.PI/2;beam(V3(wx-.62,1.6,front+.25),V3(wx-.62,1.6+Math.cos(a)*.53,front+.25+Math.sin(a)*.53),.045,'wood','#a88a5e',g);}
  for(const px of[-w*.46,doorX+1.22]){box(px,1.65,front+.06,.23,3.3,.23,'darkWood',p.timber,g);beam(V3(px,2.6,front+.09),V3(px+.50,3.18,front+.09),.09,'wood','#a58b5c',g);}
  crate121(g,w*.40,.18,front+.70,.65);barrel121(g,w*.40,.18,front+1.35,.60);
 }
 const chimneyX=kind==='forge'?-w*.37:-w*.30,chimneyZ=kind==='forge'?front-.60:-d*.22,base=h+(p.roof==='hip'?p.rise*.60:p.rise*.47),tip=chimney121(roof,chimneyX,chimneyZ,base,kind==='forge'?3.25:2.25,kind==='forge'?1.15:.88);g.userData.authored121.chimney=tip;
 for(let i=0;i<3;i++)panel(doorX,.16-i*.07,front+.46+i*.39,2.7,.18,.42,'wall','#cdc8b3');
 world.userData.entrySteps31??=[];world.userData.entrySteps31.push({owner:g,x:doorX,z:front+.45,y:y+.25,width:2.7});
 for(const xx of[-w*.43,w*.43])lantern(xx,2.7,front+.30,g);
 if(['inn','shop','forge'].includes(kind)){g.userData.pendingServiceSign110=kind==='inn'?'innSign':kind==='forge'?'forgeSign':'shopSign';g.userData.authored121.sign=[doorX,kind==='inn'?5.25:kind==='forge'?4.65:4.55,front+.53];}
 g.userData.plantRanges=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([key,a])=>[key,{start:plantStart[key],end:a.length}]));
 obstacle(x,z,w+.12,d+.12,'building');world.userData.buildings.push(g);architecture31.houses++;return g;
}
const brookBefore121=brookHouse,ownedBrook121=ownHouse110(buildBrookHome121);
brookHouse=function(...args){return activeScene?.key==='brookstead'?ownedBrook121(...args):brookBefore121(...args);};

const signBefore121=brookSign;
brookSign=function(parent,key,...args){
 const p=parent.userData.authored121;if(!p)return signBefore121(parent,key,...args);
 if(!world.userData.fittingSigns110&&!world.userData.villageStreets110){parent.userData.pendingServiceSign110=key;return null;}
 if(parent.userData.serviceSign110)return;const art=textures[key],g=new THREE.Group(),[x,y,z]=p.sign;g.name='Fitted gable service plaque';g.position.set(x,y,z);parent.add(g);
 const w=1.65,h=w*art.image.height/art.image.width;box(0,0,0,w+.22,h+.20,.18,'darkWood','#65503c',g);
 for(const yy of[-h/2-.04,h/2+.04])box(0,yy,.12,w+.3,.12,.15,'wood','#b29762',g);
 for(const xx of[-w/2-.04,w/2+.04])box(xx,0,.12,.12,h+.3,.15,'wood','#b29762',g);
 const m=new THREE.MeshPhysicalMaterial({map:art,color:'#ffffff',roughness:.80,metalness:0});m.userData.authoredSign110=true;m.userData.textureKey=key;addCloudLighting(m);lightPaintedSurface82(m);materialFinish103(m);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);face.position.z=.145;face.receiveShadow=true;g.add(face);
 parent.userData.serviceSign110=key;parent.userData.signPlacement110={key,placement:'joined facade above the entrance',position:[x,y,z],nativeAspect:art.image.width/art.image.height,faceAspect:w/h,windowClashes:0};return g;
};
