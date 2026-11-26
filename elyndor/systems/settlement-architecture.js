// Full-scale regional buildings. Details live on the owning facade or roof so
// street fitting, occlusion and existing entrance transforms continue to apply.
// A single surface sheet supplies the village joinery, woven linens and cut stone.
// Separate repeatable textures keep the quadrants isolated through mipmapping.
const settlementSurfaces=new Map(),settlementFinishes=new Map();
const loadBeforeSettlementSurfaces=loadAssets;
loadAssets=async function(...args){
 const result=await loadBeforeSettlementSurfaces(...args);
 if(settlementSurfaces.size)return result;
 const image=new Image();image.src='elyndor/assets/settlements/woodland-and-masonry.webp';
 try{await image.decode();}catch{return result;}
 const tile=image.naturalWidth/2;
 for(const [name,col,row] of [['cedar',0,0],['reed',1,0],['embroidery',0,1],['ashlar',1,1]]){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=tile;
  canvas.getContext('2d').drawImage(image,col*tile,row*tile,tile,tile,0,0,tile,tile);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  t.userData.pinnedMap17=true;settlementSurfaces.set(name,t);
 }
 // Each modeled shake carries its own lengthwise split grain. The wood grain
 // has no painted shingle joints because those are formed by the mesh edges.
 const wood=document.createElement('canvas');wood.width=128;wood.height=192;
 const ctx=wood.getContext('2d'),pixels=ctx.createImageData(wood.width,wood.height),rng=seeded(82173);
 const fibres=Array.from({length:256},()=>rng()*18-9);
 for(let y=0;y<wood.height;y++)for(let x=0;x<wood.width;x++){
  const bend=x+1.7*Math.sin(y*.024+x*.07)+.85*Math.cos(y*.042);
  const u=(Math.floor(bend)+256)%256;
  const grain=fibres[u]+5*Math.sin(bend*.34)+3*Math.sin(bend*1.62)+rng()*5;
  const value=151+grain-12*Math.pow(y/(wood.height-1),5),p=(y*wood.width+x)*4;
  pixels.data.set([value+4,value+2,value,255],p);
 }
 ctx.putImageData(pixels,0,0);
 const shake=new THREE.CanvasTexture(wood);shake.colorSpace=THREE.SRGBColorSpace;shake.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());shake.userData.pinnedMap17=true;
 settlementSurfaces.set('silverCedar',shake);
 return result;
};
function craftSurface(key,tone='#ffffff'){
 const id=key+tone;if(settlementFinishes.has(id))return settlementFinishes.get(id);
 const fallback={cedar:'wood',ashlar:'wall',reed:'canvas86',embroidery:'cloth'};
 const map=settlementSurfaces.get(key)??textures[key]??textures[fallback[key]]??textures.plaster,m=new THREE.MeshStandardMaterial({
  map,color:tone,bumpMap:map,bumpScale:key==='ashlar'?.066:key==='cedar'?.045:.018,roughness:.9,side:THREE.DoubleSide
 });
 if(['ashlar','reed','wood','embroidery'].includes(key)){
  const pigment=key==='embroidery'?'.72':key==='ashlar'?'.26':'.47';
  m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat grain=dot(diffuseColor.rgb,vec3(.299,.587,.114)); diffuseColor.rgb=mix(grain*vec3(1.01,1.,.99),diffuseColor.rgb,'+pigment+')*1.13;');};
  m.customProgramCacheKey=()=>'regional-pigment-'+pigment;
 }
 m.userData.preserveSurfaceShader=true;settlementFinishes.set(id,m);return m;
}
function dressedBlock(parent,x,y,z,w,h,d,key,tone,span=2.6){
 const geo=geo16('settlement-block-'+[w,h,d,span].join('/'),()=>{
  const block=new THREE.BoxGeometry(w,h,d);
  if(span){const p=block.attributes.position,n=block.attributes.normal,uv=block.attributes.uv;
   for(let i=0;i<p.count;i++){const side=Math.abs(n.getX(i))>.8,top=Math.abs(n.getY(i))>.8;
    uv.setXY(i,(side?p.getZ(i):p.getX(i))/span+.41,(top?p.getZ(i):p.getY(i))/span+.27);
   }
  }
  return block;
 });
 return mesh(geo,craftSurface(key,tone),x,y,z,parent);
}
function gardenFern(g,x,y,z,size,angle=0){
 const crown=landmarkGroup(g,x,y,z,angle);crown.scale.setScalar(size);
 // An arching midrib and paired, tapered leaflets give each frond its outline.
 for(let tone=0;tone<2;tone++){
  const geo=geo16('settlement-fern-fronds-'+tone,()=>{
   const pos=[],uv=[];
   const triangle=(a,b,c)=>{pos.push(...a.toArray(),...b.toArray(),...c.toArray());uv.push(0,0,.5,1,1,0);};
   for(let j=tone;j<9;j+=2){
    const a=j*2.399,dir=V3(Math.sin(a),0,Math.cos(a)),cross=V3(dir.z,0,-dir.x),len=.64+.30*Math.sin(a+1)*Math.sin(a+1);
    const spine=t=>dir.clone().multiplyScalar(len*t).add(V3(0,.04+len*(1.65*t-1.26*t*t),0));
    triangle(spine(0).addScaledVector(cross,-.018),spine(.99),spine(0).addScaledVector(cross,.018));
    for(let k=1;k<9;k++){const t=k/10,spread=(.065+.16*Math.sin(t*Math.PI))*(1-.35*t);
     for(const sign of [-1,1]){
      const base=spine(t-.055),tip=spine(t+.13).addScaledVector(cross,sign*spread);
      tip.y+=.026;const fold=spine(t+.02).addScaledVector(cross,sign*spread*.48);fold.y+=.035;
      triangle(base,tip,fold);triangle(fold,tip,spine(t+.085));
     }
    }
   }
   const result=new THREE.BufferGeometry();result.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));result.computeVertexNormals();return result;
  });
  mesh(geo,craftSurface('plaster',tone?'#729364':'#597c57'),0,0,0,crown);
 }
 return crown;
}
function foundationGarden(g,x,z,width,depth){
 dressedBlock(g,x,.20,z,width,.40,depth,'ashlar','#a4a497',2.4);
 box(x,.41,z,width-.16,.10,depth-.16,'earth','#837655',g);
 const count=Math.max(2,Math.floor(width/.8));for(let i=0;i<count;i++){
  const xx=x+width*((i+.5)/count-.5);gardenFern(g,xx,.47,z+Math.sin(i*2.4)*depth*.16,.61+(i%3)*.14,i*1.27);
 }
}
function scallopedAwning(g,x,z,w,h,depth,cloth='#bba27e'){
 const awning=landmarkGroup(g,x,h,z),geo=new THREE.PlaneGeometry(w,depth,16,6);
 const p=geo.attributes.position;for(let i=0;i<p.count;i++){
  const xx=p.getX(i),t=.5-p.getY(i)/depth;
  p.setXYZ(i,xx,-.43*t-.12*Math.sin(t*Math.PI)+.037*Math.cos(xx*5),depth*t);
 }
 geo.computeVertexNormals();mesh(geo,craftSurface('cloth',cloth),0,0,0,awning);
 for(const side of [-1,1]){const xx=side*(w*.5-.12);
  beam(V3(xx,-h+.05,depth-.06),V3(xx,-.39,depth-.06),.085,'wood','#8c7357',awning);
  beam(V3(xx,-1.03,depth-.04),V3(xx,-.15,depth*.56),.068,'wood','#957959',awning);
 }
 for(let i=0;i<Math.ceil(w/.46);i++){const n=Math.ceil(w/.46),ww=w/n;
  const tab=mesh(geo16('woven-valance',()=>{const shape=new THREE.Shape();shape.moveTo(-.5,0);shape.lineTo(.5,0);shape.lineTo(.5,-.18);shape.quadraticCurveTo(0,-.47,-.5,-.18);shape.closePath();return new THREE.ShapeGeometry(shape);}),craftSurface('cloth',cloth),-w/2+(i+.5)*ww,-.43,depth,awning);tab.scale.x=ww;
 }
}
function quayTimbers(g,w,d,h,front){
 for(const side of [-1,1]){
  const face=landmarkGroup(g,side*(w*.5+.15),0,0,side*Math.PI/2);
  for(const zz of [-.46,0,.46])box(zz*d,h*.54,.04,.16,h*.88,.18,'darkWood','#78624d',face);
  for(const band of [.22,.67,.97])box(0,h*band,0,d,.16,.17,'wood','#8d765a',face);
  for(const sign of [-1,1])beam(V3(sign*d*.43,h*.28,.04),V3(sign*d*.19,h*.64,.04),.105,'darkWood','#80674e',face);
  if(front)box(side*(w/2-.18),h*.54,d/2+.16,.23,h*.91,.22,'wood','#81694e',g);
 }
}
function pennon(parent,x,y,z,width,height,blue='#405d76'){
 const geo=new THREE.PlaneGeometry(width,height,9,12),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const u=p.getX(i)/width+.5,v=.5-p.getY(i)/height;
  p.setXYZ(i,p.getX(i),p.getY(i)-height*.16*Math.max(0,(v-.72)/.28)*(1-Math.abs(u*2-1)),.057*Math.sin(u*10)+.12*v*Math.sin(u*6+.4));
 }
 geo.computeVertexNormals();mesh(geo,craftSurface('cloth',blue),x,y,z,parent);
 box(x,y+height*.5+.07,z,width+.31,.105,.14,'bronze','#c3a269',parent);
 for(const yy of [-.29,.37])box(x,y+height*yy,z+.10,width*.94,.055,.036,'bronze','#d7b777',parent);
 const crest=box(x,y+.08,z+.11,width*.31,width*.31,.05,'bronze','#d6b77b',parent);crest.rotation.z=Math.PI/4;
}

function boundTimber(parent, points, radius, lash=true){
 const curve=new THREE.CatmullRomCurve3(points),segments=Math.max(8,points.length*3);
 mesh(new THREE.TubeGeometry(curve,segments,radius,8,false),material('wood','#bb9670'),0,0,0,parent);
 if(!lash)return;
 for(const t of [.16,.5,.84])for(const offset of [-.011,0,.011]){
  const u=t+offset,p=curve.getPointAt(u),ring=landmarkHoop(parent,p.x,p.y,p.z,radius*1.03,radius*.19,'canvas86','#dbc493');
  ring.quaternion.setFromUnitVectors(V3(0,0,1),curve.getTangentAt(u).normalize());
 }
}
function wovenBay(parent,x,y,z,w,h,glass=false){
 const g=landmarkGroup(parent,x,y,z);
 dressedBlock(g,0,0,0,w,h,.12,glass?'window':'reed',glass?'#c3d4c5':'#c8b193',glass?0:1.46);
 for(const sign of [-1,1])for(let i=-w/2-h;i<w/2;i+=.48){
  const x0=Math.max(-w/2,i),x1=Math.min(w/2,i+h);if(x1<=x0)continue;
  beam(V3(x0,sign*(x0-i-h/2),.09),V3(x1,sign*(x1-i-h/2),.09),glass?.033:.045,'wood','#a68860',g);
 }
 for(const side of [-1,1]){
  box(side*w/2,0,.12,.12,h+.18,.16,'wood','#90744e',g);
  box(0,side*h/2,.12,w+.15,.12,.16,'wood','#b19a72',g);
 }
}
function fernCrest(parent,x,y,z,scale=1){
 const g=landmarkGroup(parent,x,y,z);g.scale.setScalar(scale);
 const spiral=[];for(let i=0;i<=25;i++){const a=i*.34,r=.035+i*.018;spiral.push(V3(Math.cos(a)*r,Math.sin(a)*r,0));}
 boundTimber(g,spiral,.053,false);
 for(const side of [-1,1]){
  beam(V3(side*.31,-.27,0),V3(side*1.26,.33,0),.045,'wood','#ceb48a',g);
  for(let i=0;i<4;i++){const xx=.5+i*.18,yy=-.16+i*.11;
   for(const s of [-1,1])beam(V3(side*xx,yy,0),V3(side*(xx+.18),yy+s*.22,.025),.047,'wood','#ceb48a',g);
  }
 }
}
function fernCanopy(parent,w,d,h,rise){
 const hw=w/2+.62,hd=d/2+.66;
 // Split cedar shakes follow the arched surface. Stagger the joints every course.
 const rows=9,tints=['#ceccc3','#b5b8b0','#d6d1c5','#bdbbb5'];
 const vertices=tints.map(()=>[]),uvs=tints.map(()=>[]);
 const point=(angle,z,lift)=>{
  const tip=Math.pow(Math.abs(z)/hd,3),edge=Math.pow(Math.abs(Math.sin(angle)),4);
  const u=Math.min(1,Math.abs(Math.sin(angle))),slope=.50*Math.cos(angle)+.50*(1-u+.16*Math.sin(Math.PI*u)+.07*smooth(.72,1,u));
  return [Math.sin(angle)*(hw+lift+.31*tip),h+slope*(rise+lift)+tip*(.24+.46*edge),z];
 };
 for(const side of [-1,1])for(let row=0;row<rows;row++){
  const theta=1.42*(1-row/rows),next=theta-1.42/rows-.042;
  for(let tile=0,t=-hd;t<hd-.001;tile++){
   const end=Math.min(hd,t+((tile===0&&row%2)?.36:.72)),tone=(tile*7+row*5+(side+1))%4;
   const a=point(side*theta,t+.008,.035),b=point(side*theta,end-.008,.035),c=point(side*next,end-.008,0),e=point(side*next,t+.008,0);
   const corners=side<0?[a,b,c,a,c,e]:[a,c,b,a,e,c],lip=[a[0],a[1]-.085,a[2]],lipB=[b[0],b[1]-.085,b[2]];
   vertices[tone].push(...[...corners,a,lip,lipB,a,lipB,b].flat());
   const u0=.06+.075*((tile+row)%4),u1=u0+.59,v0=.06,v1=.94;
   const ua=[u0,v0],ub=[u1,v0],uc=[u1,v1],ue=[u0,v1];
   uvs[tone].push(...(side<0?[ua,ub,uc,ua,uc,ue]:[ua,uc,ub,ua,ue,uc]).flat(),...ua,u0,v0+.018,u1,v0+.018,...ua,u1,v0+.018,...ub);t=end;
  }
 }
 tints.forEach((t,i)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices[i],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs[i],2));geo.computeVertexNormals();mesh(geo,craftSurface('silverCedar',t),0,0,0,parent);});
 for(let z=-hd;z<hd;z+=1.02){const len=Math.min(1.02,hd-z);const ridge=dressedBlock(parent,0,point(0,z+len/2,.04)[1]+.02,z+len/2,.36,.15,len+.025,'wood','#998a70',2.6);ridge.rotation.z=.035*Math.sin(z);}
 for(const z of [-hd,0,hd]){
  const pts=[];for(let i=0;i<=8;i++){const a=(i/8-.5)*2.90;pts.push(V3(...point(a,z,.095)));}
  boundTimber(parent,pts,.19);
 }
 for(const side of [-1,1]){
  const z=side*(hd-.07);box(0,h+.32,z,w*.98,.68,.21,'wood','#9c815d',parent);
  const gable=landmarkGroup(parent,0,0,z,side<0?Math.PI:0);
  const outline=new THREE.Shape();outline.moveTo(-hw*.98,0);
  for(let i=0;i<=20;i++){const a=-1.42+i/20*2.84,p=point(a,z,0);outline.lineTo(p[0],p[1]-h);}
  outline.lineTo(hw*.98,0);outline.closePath();
  mesh(new THREE.ShapeGeometry(outline),material('wood','#a48664',{side:THREE.DoubleSide}),0,h,-.06,gable);
  wovenBay(gable,0,h+rise*.44,.05,w*.67,rise*.64);
  const plaque=dressedBlock(gable,0,h+rise*.46,.23,w*.36,rise*.59,.13,'embroidery','#ded0ac',0);
  plaque.name='Woven fiddlehead gable';
  for(const s of [-1,1])boundTimber(gable,[V3(s*w*.48,h+.18,.15),V3(s*w*.39,h+.33,.29),V3(s*w*.25,h+rise*.69,.31),V3(s*w*.085,h+rise*.92,.17)],.10);
 }
}
function openTimberBay(g,w,d,h){
 const shell=g.userData.roofShell;
 for(const child of [...g.children])if(child!==shell)g.remove(child);
 box(0,.21,0,w+.4,.42,d+.4,'wall','#b6b4a1',g);
 box(0,.47,0,w,.12,d,'wood','#b6a082',g);
 for(const s of [-1,1])for(const t of [-1,1]){
  const x=s*(w/2-.24),z=t*(d/2-.24);box(x,.64,z,.64,.38,.64,'wall','#b7ad94',g);
  boundTimber(g,[V3(x,.68,z),V3(x,.9+h*.4,z),V3(x*.94,h,z)],.19);
  beam(V3(x,h-1.15,z),V3(x-s*1.10,h,z),.11,'wood','#a38864',g);
 }
 for(const s of [-1,1])box(0,h,s*(d/2-.24),w,.23,.26,'wood','#af936e',g);
}
const woodlandBeforeVillageArt=woodlandHouse;
woodlandHouse=function(x,z,w,d,...args){
 const g=woodlandBeforeVillageArt(x,z,w,d,...args);if(activeScene?.key!=='fern')return g;
 const plots=[[71,53,'smithy','fernHollowSmithy'],[101,52,'provisions','fernHollowSupplies'],[113,109,'inn','fernCanopyInn'],[135,91,'pavilion']];
 const plot=plots.find(([px,pz])=>Math.hypot(px-x,pz-z)<6),role=plot?.[2]??'home',shell=g.userData.roofShell;
 g.userData.regionalRole=role;g.userData.fernInterior=plot?.[3];if(role==='inn')g.userData.kind='inn';
 const h=4.46,front=d/2+.17; shell.clear();
 if(role==='pavilion')openTimberBay(g,w,d,h);
 fernCanopy(shell,w+(role==='inn'?1.45:0),d,h,role==='smithy'?2.4:role==='pavilion'?3.6:w*.34);
 for(const side of [-1,1]){
  const flank=landmarkGroup(g,side*(w/2+.16),0,0,side*Math.PI/2);
  dressedBlock(flank,0,.47,0,d+.14,.79,.31,'ashlar','#b7b3a0',2.2);
  if(role!=='pavilion'){
   for(const a of [-.32,.30])wovenBay(flank,d*a,2.57,.05,d*.26,2.18);
   foundationGarden(flank,0,.32,d*.58,.69);
  }
 }
 if(role==='pavilion'){
  for(const side of [-1,1]){box(side*w*.36,.96,0,.68,.24,d*.77,'wood','#b89971',g);wovenBay(g,side*w*.29,1.24,-d*.44,w*.39,1.4);}
 }else{
  for(const side of [-1,1])wovenBay(g,side*w*.32,2.45,front,w*.26,1.65,role!=='smithy');
  if(role==='inn'||role==='provisions'){
   if(role==='provisions')scallopedAwning(g,0,front,w*.82,3.80,1.59,'#809589');
   else{
    dressedBlock(g,0,.30,front+.39,w*.95,.32,1.65,'wood','#b09d83');
    const porch=landmarkGroup(g,0,0,front+.48);
    fernCanopy(porch,w*.80,1.27,3.06,1.01);
    for(const s of [-1,1]){
     boundTimber(porch,[V3(s*w*.39,.40,.77),V3(s*w*.39,1.98,.77),V3(s*w*.34,3.27,.77),V3(s*w*.24,3.64,.77)],.14);
     for(const y of [.74,1.25])box(s*w*.31,y,.77,w*.16,.11,.13,'wood','#9d7d54',porch);
    }
   }
   for(const s of [-1,1]){landmarkBarrel(g,s*w*.36,front+.46,1.08);landmarkLamp(g,s*w*.33,3.03,front+1.26,1.24);}
  }
  for(const s of [-1,1]){const xx=s*(w/2-.19);
   boundTimber(g,[V3(xx,.32,front),V3(xx*.98,2.11,front+.12),V3(xx*.88,3.73,front+.20),V3(xx*.69,4.60,front+.11)],.15);
  }
  if(role==='smithy'){
   const forge=landmarkGroup(g,-w*.34,.35,front+.35);forge.scale.setScalar(.70);
   masonryHearth163(forge,{key:'hearth29',tint:'#a69980',forge:true,scale:1});
   g.userData.forgeMouth=[-w*.34,.35+.48*.70,front+.35+.09*.70];
   box(-w*.31,5,-d*.17,1.23,5.6,1.23,'wall','#998c75',g);
  }
 }
 return g;
};
function royalStandard(parent,x,y,z){
 pennon(parent,x,y,z,.94,2.95,'#355b81');
}
// Re-skin only the native masonry boxes. Their footprint, cutaway parent and
// authored door/window gaps stay intact. Scale UVs in building units.
function dressCityWalls(g){
 g.traverse(o=>{
  if(!o.isMesh||o.geometry?.type!=='BoxGeometry'||!o.material?.map)return;
  if(![textures.wall,textures.plaster,textures.cobble].includes(o.material.map))return;
  if(Math.max(o.scale.x,o.scale.y,o.scale.z)<1.7)return;
  const {x:w,y:h,z:d}=o.scale;
  const id='city-ashlar-uv-'+[w,h,d].join('/');
  o.geometry=geo16(id,()=>{
   const geo=o.geometry.clone(),p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;
   for(let i=0;i<p.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.8?p.getZ(i)*d:p.getX(i)*w)/3.6+.23,(Math.abs(n.getY(i))>.8?p.getZ(i)*d:p.getY(i)*h)/3.6+.37);
   return geo;
  });o.material=craftSurface('ashlar','#e5e4db');
 });
}
function courtWindow(g,x,y,z,w,h){
 const shape=new THREE.Shape(),r=w*.5;shape.moveTo(-r,0);shape.lineTo(r,0);shape.lineTo(r,h-r);shape.absarc(0,h-r,r,0,Math.PI,false);shape.closePath();
 mesh(new THREE.ShapeGeometry(shape),material('window','#92b3b7',{side:THREE.DoubleSide}),x,y,z,g);
 for(const side of [-1,1])dressedBlock(g,x+side*(r+.07),y+(h-r)/2,z+.03,.16,h-r,.20,'ashlar','#ece6cd');
 for(let i=0;i<9;i++){const a=(i+.5)*Math.PI/9,arch=dressedBlock(g,x+Math.cos(a)*(r+.065),y+h-r+Math.sin(a)*(r+.065),z+.05,.18,(r+.08)*Math.PI/9+.015,.22,'ashlar','#e3dfc8');arch.rotation.z=a;}
 box(x,y+h*.45,z+.067,.06,h*.90,.055,'bronze','#ac9e76',g);box(x,y+h*.48,z+.07,w,.065,.06,'bronze','#ad9b77',g);
 // A projecting stone sill and a drip edge leave a shadow beneath the glass.
 dressedBlock(g,x,y-.068,z+.10,w+.39,.14,.43,'ashlar','#d3d3c6',1.8);
 dressedBlock(g,x,y-.175,z+.06,w+.20,.078,.26,'ashlar','#b8bcb2',1.8);
 if(w>1.35)for(const sign of [-1,1]){
  const stem=V3(x,y+h*.64,z+.092),tip=V3(x+sign*w*.31,y+h-r*.57,z+.092);
  beam(stem,tip,.037,'bronze','#978c79',g);
 }
}
function ceremonialArch(parent,x,y,z,half,rise){
 const points=[];for(let i=0;i<=10;i++){const a=Math.PI*i/10;points.push(V3(x+Math.cos(a)*half,y+Math.sin(a)*rise,z));}
 mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),14,.21,6,false),material('wall','#e4d5b9'),0,0,0,parent);
 for(const s of [-1,1]){const xx=x+s*half;landmarkDrum(parent,xx,.1,z,.39,.32,.34,'wall','#c1b89f');landmarkDrum(parent,xx,.43,z,.24,.21,y-.43,'wall','#d4cbb7');landmarkDrum(parent,xx,y-.18,z,.35,.38,.21,'wall','#ddd2b9');}
}
const royalBeforeCityArt=royalHouse;
royalHouse=function(x,z,w,d,...args){
 const g=royalBeforeCityArt(x,z,w,d,...args);if(activeScene?.key!=='highmere')return g;
 const form=Math.abs(Math.round(x+z))%3,shell=g.userData.roofShell,front=d/2+.26;g.userData.regionalRole=['townhouse','merchant residence','corner villa'][form];
 shell.clear();landmarkRoof(shell,w+.13,d+.12,5.69,w*[.33,.24,.41][form],['#8997a5','#b58c70','#97a5ae'][form],false,form===1?'roof':'slate');
 ceremonialArch(g,g.userData.architecture31.door[0],2.93,front,1.34,.89);
 if(form===1){landmarkAwning(g,w*.28,front+.45,w*.34,3.14);}
 if(form===2){const turret=landmarkGroup(shell,-w*.34,4.25,-d*.26);turret.scale.setScalar(.87);landmarkRoyalTower(turret,0,0,3.2);}
 dressCityWalls(g);
 return g;
};
const hallsBeforeCityArt=openHall;
openHall=function(id,w,d,kind){
 const g=hallsBeforeCityArt(id,w,d,kind);if(!g||activeScene?.key!=='highmere')return g;
 const f=d/2+.25,shell=g.userData.roofShell,facade=g.userData.facadeShell;g.userData.regionalRole=id;
 if(id!=='inn'){
  const stone=material('wall','#cbd1c9');g.traverse(o=>{if(o.isMesh&&o.material?.map===textures.plaster)o.material=stone;});
  for(const side of [-1,1])for(const end of [-1,1])for(let course=0;course<8;course++){
   const width=course%2?.49:.84;box(side*(w/2-.12),.42+course*.67,end*(d/2-.05),width,.63,1.26-width*.50,'wall',course%3?'#cbd1c8':'#dde0d2',g);
  }
 }
 for(const x of [-w*.33,w*.33])royalStandard(facade,x,3.25,f+.15);
 if(id==='council'){
  shell.clear();
  box(0,5.84,0,w+.48,.54,d+.49,'wall','#d2d1bb',shell);
  for(const s of [-1,1])for(let i=0;i<11;i++)box((i/10-.5)*w,6.46,s*(d/2),.81,.84,.62,'wall','#c8cbb9',shell);
  for(const s of [-1,1])for(let i=1;i<8;i++)box(s*w/2,6.46,(i/8-.5)*d,.61,.84,.84,'wall','#d2d3c1',shell);
  const upper=landmarkGroup(shell,0,5.99,-d*.1);box(0,1.06,0,w*.64,2.12,d*.58,'wall','#cdd0be',upper);landmarkRoof(upper,w*.66,d*.60,2.13,2.68,'#899fb1',false,'glazedTile');
  for(const s of [-1,1]){const tower=landmarkGroup(shell,s*w*.43,3.0,d*.28);landmarkRoyalTower(tower,0,0,4.31);}
  for(const x of [-w*.46,w*.46])landmarkRoyalTower(shell,x,-d*.29,8.1);
  ceremonialArch(facade,0,3.17,f+1,1.85,1.12);
 }else if(id==='archives'){
  for(const x of [-w*.31,0,w*.31])ceremonialArch(g,x,3.45,f+.56,1.64,1.28);
  const lantern=landmarkGroup(shell,0,5.8,-d*.18);landmarkDrum(lantern,0,0,0,2.3,2.0,2.4,'wall','#cdc7af',8);landmarkDrum(lantern,0,2.4,0,2.55,.1,1.9,'slate','#8397a7',8);
 }else if(id==='inn'){landmarkAwning(g,-w*.21,f+.5,w*.43,3.57);landmarkLamp(g,w*.29,2.76,f+.42,.52);}
 else{ceremonialArch(g,0,3.0,f+.25,1.46,.86);for(const s of [-1,1])landmarkWindow(g,s*w*.31,4.41,f,.72,1.20);}
 dressCityWalls(g);
 if(id==='council')for(const s of [-1,1]){
  pennon(facade,s*w*.37,3.48,f+.30,1.27,3.4);
  courtWindow(shell,s*w*.20,6.18,d*.193+.06,.96,1.57);
 }
 return g;
};
function shedStores(g,w,d,warehouse=false){
 const shell=g.userData.roofShell;shell.clear();openTimberBay(g,w,d,3.75);
 if(warehouse){const ridge=landmarkGroup(shell,0,0,0,Math.PI/2);landmarkRoof(ridge,d+.36,w+.30,3.78,2.14,'#83919b',true);}
 else landmarkRoof(shell,w+.36,d+.3,3.78,1.95,'#83919b',true);
 for(const s of [-1,1]){box(s*w*.37,1.0,-d*.22,w*.2,.99,1.6,'crateFace','#b79c73',g);box(s*w*.37,1.74,-d*.22,w*.18,.46,1.38,'cloth',s<0?'#748981':'#ae8e74',g);}
 for(let i=0;i<3;i++)landmarkBarrel(g,-w*.31+i*.86,d*.25,1.15);
}
function wrappedBale(g,x,y,z,w,h,d,tone){
 dressedBlock(g,x,y+h*.5,z,w,h,d,'reed',tone,1.7);
 for(const side of [-1,1]){
  box(x+side*w*.27,y+h+.02,z,.085,.055,d+.04,'canvas86','#cfb789',g);
  box(x+side*w*.27,y+h*.5,z+d*.5+.016,.085,h,.045,'canvas86','#cfb789',g);
 }
}
function loftDoor(g,x,d,w,h){
 const loft=landmarkGroup(g,x,3.85,0);
 dressedBlock(loft,0,h*.5,0,w,h,d,'wood','#a38d70');
 landmarkRoof(loft,w+.26,d+.12,h,1.38,'#b18068',false,'roofClay86');
 for(const s of [-1,1]){
  const face=landmarkGroup(loft,0,0,s*d*.5,s<0?Math.PI:0);
  dressedBlock(face,0,h*.49,.13,w*.73,h*.93,.18,'wood','#819391',1.55);
  for(const t of [-1,1]){
   box(t*w*.37,h*.50,.29,.13,h,.18,'wood','#aa9679',face);
   beam(V3(t*w*.33,.24,.28),V3(0,h*.84,.28),.073,'wood','#bcac91',face);
  }
  box(0,h*.47,.29,.065,h*.88,.07,'metal','#6f7165',face);
  dressedBlock(face,0,.05,.43,w*.92,.15,.88,'wood','#ad9979');
  box(0,h+.27,.74,.20,.23,1.86,'wood','#ac8e65',face);landmarkHoop(face,0,h+.04,1.57,.17,.055,'metal','#9d9a84');
  beam(V3(.09,h+.04,1.59),V3(.09,-.2,1.59),.043,'canvas86','#ad9b79',face);
 }
}
const cottagesBeforeTradeArt=brookHouse;
brookHouse=function(x,z,w,d,kind){
 const g=cottagesBeforeTradeArt(x,z,w,d,kind),region=activeScene?.key;if(!g||!['harbor','alder'].includes(region))return g;
 const f=d/2+.18,shell=g.userData.roofShell??g;
 if(region==='alder'){
  if(Math.abs(x-113)<3||Math.abs(x-128)<3){
   g.userData.regionalRole='covered stores';shedStores(g,w,d);
   const frontPost=w*.5-.24;
   landmarkLamp(g,frontPost,2.32,d*.5+.18,.44);
   for(const s of [-1,1])beam(V3(s*frontPost,2.71,d*.5-.24),V3(s*(frontPost-1.14),3.71,d*.5-.24),.115,'wood','#97836b',g);
   const bay=landmarkGroup(g,-w*.27,.50,-d*.27);
   wrappedBale(bay,0,0,0,2.28,.77,1.37,'#c3ac88');wrappedBale(bay,.12,.79,0,1.81,.56,1.24,'#98a298');
   for(const s of [-1,1]){const end=landmarkGroup(g,s*w*.48,0,0,s*Math.PI/2);wovenBay(end,0,2.52,0,d*.76,1.72); }
   return g;
  }
  const form=Math.abs(Math.round(x))%3;g.userData.regionalRole=['porch cottage','roadside workshop','slate cottage'][form];
  if(g.userData.roofShell){
   shell.clear();landmarkRoof(shell,w+.56,d+.65,5.67,w*[.38,.34,.41][form],['#81909b','#899594','#78909e'][form],false,'slate');
   const flue=landmarkGroup(shell,-w*.27,5.8,-d*.18);
   dressedBlock(flue,0,1.37,0,.97,2.74,.85,'ashlar','#aca894',2.18);
   dressedBlock(flue,0,2.79,0,1.11,.21,1.02,'ashlar','#bab09a');
  }
  if(form!==2){landmarkAwning(g,0,f+.55,w*[.73,.45][form],3.45);landmarkBarrel(g,-w*.33,f+.45,1.07);}
  if(form===1){for(const s of [-1,1]){box(s*w*.35,1.15,f+.06,1.24,.90,.58,'crateFace','#b19170',g);}}
  if(form===2){const dorm=landmarkGroup(shell,w*.24,5.52,d*.18);landmarkHouse(dorm,w*.26,1.84,1.44,1.18,'#81909c');}
  quayTimbers(g,w,d,4.28,true);
  for(const s of [-1,1]){
   const wall=landmarkGroup(g,s*(w*.5+.12),0,0,s*Math.PI/2);
   dressedBlock(wall,0,.47,0,d,.88,.24,'ashlar','#aba99a',2.0);
   for(const dz of [-.32,.32])beam(V3(d*dz,1.12,.16),V3(d*dz*.43,2.71,.16),.10,'wood','#705c4b',wall);
  }
  const sidewall=landmarkGroup(g,w*.5+.16,0,d*.06,Math.PI/2);
  scallopedAwning(sidewall,0,0,d*.56,2.65,.91,'#968e72');
  for(let row=0;row<3;row++)for(let i=0;i<5-row;i++){
   const xx=(i-(4-row)*.5)*.29;beam(V3(xx,.31+row*.21,.14),V3(xx,.31+row*.21,.91),.14,'bark','#907458',sidewall);
  }
 }else{
  const office=Math.abs(x-297)<3,store=Math.abs(x-333)<4,workshop=Math.abs(x-351)<3;
  g.userData.regionalRole=office?'harbor office':store?'bonded warehouse':workshop?'sail loft':'harbor dwelling';
  if(store){
   shedStores(g,w,d,true);
   // The bonded store has enclosed cargo bays and a continuous ridge.
   for(const s of [-1,1]){
    const wall=landmarkGroup(g,s*w*.48,0,0,s*Math.PI/2);
    dressedBlock(wall,0,2.06,0,d,3.06,.25,'wood','#91866f',1.74);
    for(const t of [-1,1]){
     const bay=landmarkGroup(wall,t*d*.26,.49,.17);
     dressedBlock(bay,0,1.22,0,d*.36,2.44,.17,'wood','#817661',1.46);
     for(const v of [-1,1])beam(V3(-d*.16,1.23+v*1.05,.12),V3(d*.16,1.23-v*1.05,.12),.085,'wood','#b29c78',bay);
    }
   }
   for(const s of [-1,1]){wrappedBale(g,s*w*.33, .48,-d*.28,2.24,.84,1.54,'#b5a286');wrappedBale(g,s*w*.33,.48,d*.30,1.5,.71,1.25,'#96a29a');}
  }else if(office){
   shell.clear();landmarkRoof(shell,w+.54,d+.54,5.67,w*.32,'#b99685',false,'roofClay86');
   for(const s of [-1,1]){
    const wall=landmarkGroup(g,s*(w*.5+.10),0,0,s*Math.PI/2);
    dressedBlock(wall,0,2.87,0,d,5.43,.25,'ashlar','#d5cdb4',2.23);
    for(const t of [-1,1])courtWindow(wall,t*d*.25,2.69,.14,1.09,1.76);
    dressedBlock(wall,0,.63,0,d,.42,.49,'ashlar','#aca99c',2.52);
   }
   const tower=landmarkGroup(shell,-w*.29,5.32,-d*.21);dressedBlock(tower,0,1.71,0,3.65,3.42,3.20,'ashlar','#d4c9b4',2.5);
   for(const s of [-1,1])for(const t of [-1,1])box(s*1.55,4.42,t*1.31,.25,2.20,.25,'wood','#85745f',tower);
   dressedBlock(tower,0,3.48,0,4.12,.22,3.6,'wood','#a08f76');
   landmarkRoof(tower,4.05,3.70,5.56,1.88,'#8eaba8',false,'glazedTile');
   pennon(g,w*.34,3.13,f+.16,1.28,2.96,'#497784');landmarkLamp(g,w*.30,2.60,f+.32,.46);
  }else if(workshop){
   shedStores(g,w,d,true);
   for(const xx of [-w*.32,0,w*.32])loftDoor(shell,xx,d*.84,w*.28,1.82);
   for(const s of [-1,1]){
    const rack=landmarkGroup(g,s*w*.33,.55,d*.12);
    for(let row=0;row<2;row++)for(let i=0;i<3-row;i++)
     beam(V3((i-1+row*.5)*.38,.23+row*.33,-.55),V3((i-1+row*.5)*.38,.23+row*.33,.95),.19,'canvas86',row?'#b0ac99':'#dbcfaf',rack);
   }
  }
  if(!store&&!workshop)quayTimbers(g,w,d,4.48,true);
 }
 return g;
};
function capitalPalace(base){
 const g=landmarkGroup(base,0,8.02,-.48);
 dressedBlock(g,0,3.09,0,25.7,6.18,7.14,'ashlar','#dbddcf',3.58);
 for(const side of [-1,1]){
  const wing=landmarkGroup(g,side*8.13,0,0);
  for(const x of [-3.2,-1.08,1.08,3.2])courtWindow(wing,x,1.56,3.63,.91,2.81);
  landmarkRoof(wing,9.2,6.75,6.10,2.02,'#81909c',false,'slate');
  for(const h of [.89,5.93])dressedBlock(wing,0,h,3.70,9.26,.24,.38,'ashlar','#deded2',3.58);
 }
 function watchtower(x,z,h,w,pointed){
  const tower=landmarkGroup(g,x,0,z);
  dressedBlock(tower,0,h*.50,0,w,h,w,'ashlar','#e2e3d8',3.4);
  for(let i=0;i<4;i++){
   const face=landmarkGroup(tower,0,0,0,i*Math.PI/2);
   courtWindow(face,0,h-3.15,w*.5+.025,.64,1.75);
   if(!pointed)for(let k=0;k<3;k++)dressedBlock(face,(k-1)*w*.34,h+.44,w*.45,w*.19,.62,.43,'ashlar','#e3e3d5');
  }
  for(const y of [1.17,h-.95,h+.02])dressedBlock(tower,0,y,0,w+.39,.30,w+.39,'ashlar','#d6d9cd');
  if(pointed)landmarkDrum(tower,0,h+.16,0,w*.88,.04,1.8,'glazedTile','#7f909e',4).rotation.y=Math.PI/4;
 }
 const portal=landmarkGroup(g,0,0,.48);dressedBlock(portal,0,5.62,0,7.21,11.24,7.11,'ashlar','#e4e4d7',3.25);
 dressedBlock(portal,0,1.99,3.59,3.05,3.91,.19,'oakBoards102','#70604e',2.1);
 ceremonialArch(portal,0,3.85,3.74,1.63,1.03);
 courtWindow(portal,0,6.31,3.60,2.05,3.38);
 landmarkRoof(portal,7.1,7.29,11.22,2.56,'#82909b',false,'slate');
 for(const s of [-1,1]){
  watchtower(s*4.28,1.59,10.61,2.45,false);watchtower(s*12.83,-.67,8.12,2.70,true);
  royalStandard(g,s*4.28,5.67,2.91);
  for(let i=0;i<4;i++)dressedBlock(base,s*(5.82+i*1.68),8.53,4.29,.43,.83,.53,'ashlar','#d9dccd');
 }
 for(let i=0;i<7;i++)dressedBlock(base,0,7.97-.27*i,5.78+i*.32,5.2+i*.13,.34,.58,'ashlar','#d8d9ce',2.78);
 // The upper ward follows the two shoulders of the hill. End each curtain
 // before the water, with a full stone foundation down to the terrain.
 for(const s of [-1,1])for(let bay=0;bay<3;bay++){
  const offset=s*(18.15+bay*7.25),wx=base.position.x+offset,wz=base.position.z-2.65-bay*1.60;
  if(waterGround(wx,wz)||waterGround(wx+s*3.62,wz))break;
  const y=groundAt(wx,wz),h=Math.max(4.3,base.position.y+11.82-bay*.64-y),wall=landmarkGroup(world,wx,y,wz);
  dressedBlock(wall,0,h*.5,0,7.68,h,3.40,'ashlar','#c1c9c2',3.27);
  for(const x of [-2.55,0,2.55])courtWindow(wall,x,h-3.48,1.72,.52,1.86);
  for(let i=0;i<6;i++)dressedBlock(wall,-3.28+1.31*i,h+.34,1.39,.57,.69,.62,'ashlar','#d7dbd1',1.4);
  if(bay===0||bay===2){
   const tower=landmarkGroup(wall,s*3.22,0,-.09),r=2.04;
   landmarkDrum(tower,0,0,0,r,r*.97,h+1.5,'ashlar','#d2d6cd',12);
   for(const y of [h-1.1,h+1.46])landmarkDrum(tower,0,y,0,r*1.07,r*1.07,.24,'ashlar','#dce0d4',12);
   landmarkDrum(tower,0,h+1.68,0,r*1.21,.06,2.70,'slate','#8895a7',12);
  }
 }
 // The lower terrace meets the rear of the council grounds. The route
 // occupies the margin between the two buildings rather than their doors.
 for(const s of [-1,1]){
  const terrace=landmarkGroup(base,s*11.65,0,7.42);
  dressedBlock(terrace,0,2.73,0,6.1,5.46,3.32,'ashlar','#b9bdb5',3.05);
  for(const x of [-2.25,2.25])dressedBlock(terrace,x,2.05,1.74,.59,4.1,.63,'ashlar','#bdc1b4',2.25);
  foundationGarden(landmarkGroup(terrace,0,5.47,0),0,0,4.93,1.18);
  for(let j=0;j<13;j++){
   const level=5.37-j*.42;dressedBlock(terrace,0,level*.5,1.83+j*.38,4.01,level,.46,'ashlar','#cfcec0',2.6);
  }
 }
}
const courtsBeforeTownArt=conceptCourt38;
conceptCourt38=function(key){
 const start=world.children.length,result=courtsBeforeTownArt(key);if(activeScene?.kind!=='poi')return result;
 if(key==='alder'||key==='highmere'){
  const well=world.children.slice(start).find(o=>o.userData.well104);
  if(well)for(const child of [...well.children])if(child.name!=='Hollow masonry well'&&(key==='alder'||child.name!=='Recessed rippling well water'))well.remove(child);
 }
 if(key==='highmere'){
  const base=landmarkGroup(world,-70,groundAt(-70,-157),-157);
  dressedBlock(base,0,3.85,0,29.9,7.7,10.55,'ashlar','#d1d0bd',3.65);dressedBlock(base,0,7.88,0,30.5,.48,11.13,'ashlar','#e2decb',3.65);
  for(const x of [-13.2,-8.8,-4.4,0,4.4,8.8,13.2])box(x,3.75,5.25,.86,7.54,.81,'wall','#bdc1ae',base);
  capitalPalace(base);
  for(const s of [-1,1]){const face=landmarkGroup(base,s*8.78,0,5.42);pennon(face,0,4.9,.36,1.53,4.14);
   const terrace=landmarkGroup(base,s*10.83,8.15,3.64);
   foundationGarden(terrace,0,0,5.64,1.43);face.position.y=.04;
  }
  for(let i=-6;i<=6;i++){const px=i*2.34;dressedBlock(base,px,8.51,5.31,.33,.89,.43,'ashlar','#e4decb');}
  dressedBlock(base,0,8.98,5.31,29.19,.20,.49,'ashlar','#dedac8',3.8);
  const [x,z]=JRPG_LAYOUTS46.highmere.courts[0],f=landmarkGroup(world,x,groundAt(x,z)+.84,z);
  landmarkDrum(f,0,0,0,.46,.30,1.22,'wall','#d3c8a9');landmarkDrum(f,0,1.12,0,.32,.97,.42,'wall','#d8cdb4');
  landmarkDrum(f,0,1.53,0,.88,.88,.03,'window','#8faeb1');landmarkDrum(f,0,1.53,0,.18,.06,.47,'bronze','#ad9b75');
 }
 if(key==='alder'){
  const [x,z]=JRPG_LAYOUTS46.alder.courts[0],tree=landmarkGroup(world,x,groundAt(x,z)+.84,z);
  landmarkDrum(tree,0,-.03,0,1.57,1.57,.16,'earth','#797358');landmarkTree(tree,0,0,7.6);
  for(const a of [.32,2.42,4.52]){
   gardenFern(tree,Math.sin(a)*1.05,.13,Math.cos(a)*1.05,.78,a);
   const seat=landmarkGroup(tree,Math.sin(a)*1.67,.03,Math.cos(a)*1.67,a);
   for(const s of [-1,1]){dressedBlock(seat,s*.68,.22,0,.33,.44,.50,'ashlar','#b7b2a3');}
   dressedBlock(seat,0,.51,0,1.95,.16,.57,'wood','#b39e7d');box(0,1.0,-.23,1.88,.23,.13,'wood','#a08b70',seat);
  }
 }
 return result;
};
const quayBeforeTradeArt=harborGardens15;
const shelterBeforeTradeArt=addAtlasFacility18;
addAtlasFacility18=function(...args){
 const old=world.userData.facility18,result=shelterBeforeTradeArt(...args),facility=world.userData.facility18;
 if(old||activeScene?.key!=='alder'||!facility?.group)return result;
 const {w,d,group}=facility,roof=group.userData.roofShell;
 roof.clear();
 landmarkCanvasFly(roof,w+.12,d+.10,4.17,1.95,true);
 for(const side of [-1,1]){
  const z=side*d*.43;
  for(const s of [-1,1]){
   beam(V3(s*w*.44,3.09,z),V3(s*w*.34,4.13,z),.098,'wood','#8e7e67',group);
   beam(V3(s*w*.46,4.22,z),V3(0,6.11,z),.093,'wood','#987e5d',roof);
  }
 }
 for(const s of [-1,1]){
  const bench=landmarkGroup(group,s*w*.28,0,-d*.19);
  dressedBlock(bench,0,.89,0,2.03,.12,.91,'embroidery','#b1bca6',0);
  wrappedBale(bench,s*.77,.98,.02,.71,.41,.65,'#c2b297');
 }
 return result;
};
const boatBeforeTradeArt=harborBoat15;
harborBoat15=function(x,z,scale){
 const boat=boatBeforeTradeArt(x,z,scale);if(activeScene?.key!=='harbor'||!boat?.userData.sail)return boat;
 const shell=boat.userData.sail,cloth=shell.children.find(o=>o.isMesh&&o.geometry.type==='PlaneGeometry');if(!cloth)return boat;
 const geo=new THREE.PlaneGeometry(3.7,3.8,16,12),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const u=p.getX(i)/3.7+.5,v=.5-p.getY(i)/3.8,belly=Math.sin(u*Math.PI);
  p.setXYZ(i,p.getX(i)*(1-.20*v),p.getY(i)-.25*belly*v,.10+.59*belly*Math.sin(Math.PI*v)+.08*belly*v);
 }
 geo.computeVertexNormals();cloth.geometry=geo;cloth.material=craftSurface('canvas86','#e4dac0');
 for(const u of [.24,.50,.76]){
  const pts=[];for(let n=0;n<=9;n++){
   const v=n/9,b=Math.sin(u*Math.PI);pts.push(V3((u-.5)*3.7*(1-.2*v),6.1+(.5-v)*3.8-.25*b*v,.24+.59*b*Math.sin(Math.PI*v)+.08*b*v));
  }boundTimber(shell,pts,.016,false);
 }
 for(const s of [-1,1]){
  beam(V3(0,9.68,0),V3(s*1.72,2.61,-3.48),.040,'canvas86','#bca780',boat);
  beam(V3(0,9.61,0),V3(s*1.72,2.61,3.4),.039,'canvas86','#c8b394',boat);
  beam(V3(s*1.75,2.92,-4.20),V3(s*1.75,2.92,4.20),.065,'wood','#a58b6b',boat);
  for(const zz of [-4.10,-1.72,1.72,4.10])box(s*1.75,2.61,zz,.11,.63,.11,'wood','#8f755c',boat);
 }
 wrappedBale(boat,.46,2.02,2.87,1.32,.67,1.47,'#bfb094');
 return boat;
};
harborGardens15=function(){
 quayBeforeTradeArt();const cargo=landmarkGroup(world,292,harborGround15(292,76),76);cargo.rotation.y=-.53;cargo.scale.setScalar(1.32);landmarkCrane(cargo);
 const wheel=landmarkGroup(cargo,-.57,1.70,.60);landmarkHoop(wheel,0,0,0,.77,.095,'wood','#a88a64');
 for(const [xx,zz,h] of [[-1.70,-.64,.85],[-2.16,.66,.70],[-1.75,-.64,.67]]){const y=h===.67?.85:0;wrappedBale(cargo,xx,y,zz,1.50,h,1.19,'#b9b099');}
 for(let i=0;i<6;i++){const a=i*Math.PI/6;beam(V3(Math.cos(a)*.72,Math.sin(a)*.72,0),V3(-Math.cos(a)*.72,-Math.sin(a)*.72,0),.048,'wood','#a7865e',wheel);}
 const nets=landmarkGroup(world,346,harborGround15(346,77),77);
 for(const x of [-2.2,2.2])box(x,1.54,0,.16,3.08,.16,'wood','#9c805e',nets);
 for(let i=0;i<=12;i++){const t=i/12,x=-2.2+4.4*t,drop=Math.sin(t*Math.PI)*.49;beam(V3(x,2.87-drop,0),V3(x*.95,1.12-drop,.22),.022,'canvas86','#b4ab91',nets);}
 for(let j=0;j<=6;j++){const t=j/6;const pts=[];for(let i=0;i<=6;i++){const u=i/6;pts.push(V3((-2.2+u*4.4)*(1-t*.05),2.87-t*1.75-Math.sin(u*Math.PI)*.49,t*.22));}boundTimber(nets,pts,.027,false);}
 for(const x of [304,338])for(const s of [-1,1]){const bollard=landmarkGroup(world,x+s*(x===304?2.35:2.8),1.62,89);landmarkDrum(bollard,0,0,0,.2,.18,.95,'wood','#957b5c');for(const y of [.55,.66,.77])landmarkHoop(bollard,0,y,0,.21,.043,'canvas86','#bfa980').rotation.x=Math.PI/2;}
};
