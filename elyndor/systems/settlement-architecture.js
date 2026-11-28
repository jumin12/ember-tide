// Full-scale regional buildings. Details live on the owning facade or roof so
// street fitting, occlusion and existing entrance transforms continue to apply.
// A single surface sheet supplies the village joinery, woven linens and cut stone.
// Separate repeatable textures keep the quadrants isolated through mipmapping.
const settlementSurfaces=new Map(),settlementFinishes=new Map();
const loadBeforeSettlementSurfaces=loadAssets;
loadAssets=async function(...args){
 if(settlementSurfaces.size)return loadBeforeSettlementSurfaces(...args);
 const sheets=[['woodland-and-masonry',['cedar','reed','embroidery','ashlar']],['oak-stone-bark-linen',['agedOak','laidFlags','barkCourses','loomLinen']],['fern-house-finishes',['carvedFern','limePlaster','planedOak','sageLinen']]];
 const [result]=await Promise.all([loadBeforeSettlementSurfaces(...args),...sheets.map(async([file,names])=>{
 const image=new Image();image.src='elyndor/assets/settlements/'+file+'.webp';
 try{await image.decode();}catch{return;}
 const tile=Math.floor(image.naturalWidth/2);
 for(const [i,name] of names.entries()){
  const col=i%2,row=Math.floor(i/2);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=tile;
  canvas.getContext('2d').drawImage(image,col*tile,row*tile,tile,tile,0,0,tile,tile);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  t.userData.pinnedMap17=true;settlementSurfaces.set(name,t);
 }
 })]);
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
 const shake=new THREE.CanvasTexture(wood);shake.colorSpace=THREE.SRGBColorSpace;shake.wrapS=shake.wrapT=THREE.RepeatWrapping;shake.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());shake.userData.pinnedMap17=true;
 settlementSurfaces.set('silverCedar',shake);
 return result;
};
function craftSurface(key,tone='#ffffff'){
 const id=key+tone;if(settlementFinishes.has(id))return settlementFinishes.get(id);
 const fallback={cedar:'wood',ashlar:'wall',reed:'canvas86',embroidery:'cloth',agedOak:'wood',laidFlags:'wall',barkCourses:'bark',loomLinen:'cloth',carvedFern:'wood',limePlaster:'plaster',planedOak:'wood',sageLinen:'cloth'};
 const map=settlementSurfaces.get(key)??textures[key]??environment102.maps.get(key)??textures[fallback[key]]??textures.plaster,m=new THREE.MeshStandardMaterial({
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
 const hw=w/2+.81,hd=d/2+.86;
 // Split cedar shakes follow the arched surface. Stagger the joints every course.
 const rows=9,tints=['#aaa293','#9f988c','#b4b0a2','#ada594'];
 const vertices=tints.map(()=>[]),uvs=tints.map(()=>[]);
 const point=(angle,z,lift)=>{
  const tip=Math.pow(Math.abs(z)/hd,3),edge=Math.pow(Math.abs(Math.sin(angle)),4);
  const u=Math.min(1,Math.abs(Math.sin(angle))),slope=.50*Math.cos(angle)+.50*(1-u+.16*Math.sin(Math.PI*u)+.07*smooth(.72,1,u));
  const flare=edge*(.73+.61*tip),sag=(1-tip)*Math.min(.62,rise*.18);
  return [Math.sin(angle)*(hw+lift+.4*tip+flare),h+slope*(rise+lift)-sag+.78*tip+flare*.55,z];
 };
 for(const side of [-1,1])for(let row=0;row<rows;row++){
  const theta=1.42*(1-row/rows),next=theta-1.42/rows-.042;
  for(let tile=0,t=-hd;t<hd-.001;tile++){
   const end=Math.min(hd,t+((tile===0&&row%2)?.36:.72)),tone=(tile*7+row*5+(side+1))%4;
   const notch=.027*Math.sin(tile*7.3+row*2.1),lift=.10+notch;
   const a=point(side*(theta+notch),t+.011,lift),b=point(side*(theta-notch*.42),end-.012,lift),c=point(side*next,end-.012,0),e=point(side*next,t+.011,0);
   const corners=side<0?[a,b,c,a,c,e]:[a,c,b,a,e,c],lip=[a[0],a[1]-.145,a[2]],lipB=[b[0],b[1]-.145,b[2]];
   vertices[tone].push(...[...corners,a,lip,lipB,a,lipB,b].flat());
   const u0=.06+.075*((tile+row)%4),u1=u0+.59,v0=.06,v1=.94;
   const ua=[u0,v0],ub=[u1,v0],uc=[u1,v1],ue=[u0,v1];
   uvs[tone].push(...(side<0?[ua,ub,uc,ua,uc,ue]:[ua,uc,ub,ua,ue,uc]).flat(),...ua,u0,v0+.018,u1,v0+.018,...ua,u1,v0+.018,...ub);t=end;
  }
 }
 tints.forEach((t,i)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices[i],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs[i],2));geo.computeVertexNormals();mesh(geo,craftSurface('agedOak',t),0,0,0,parent);});
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
 // The original closed house registered a solid rectangle. Its replacement
 // has four posts and accessible aisles between the counters.
 const cx=g.position.x,cz=g.position.z;
 const shellIndex=colliders.findIndex(c=>Math.abs(c.x-cx)<.05&&Math.abs(c.z-cz)<.05&&c.w>w*.43&&c.d>d*.43);
 if(shellIndex>=0)colliders.splice(shellIndex,1);
 for(const s of [-1,1])for(const t of [-1,1])obstacle(cx+s*(w/2-.24),cz+t*(d/2-.24),.60,.64,'timber footing');
}
function woodlandDormer(shell,side,z,faceX,sill){
 const frame=landmarkGroup(shell,side*faceX,sill,z,side*Math.PI/2);
 const depth=2.57,half=1.32;
 dressedBlock(frame,0,.47,-.23,2.50,.99,.49,'planedOak','#b4a48d',1.55);
 for(const x of [-.46,.46])courtWindow(frame,x,.50,.045,.67,.72);
 const pediment=new THREE.Shape();pediment.moveTo(-half,.93);pediment.lineTo(0,1.68);pediment.lineTo(half,.93);pediment.closePath();
 mesh(new THREE.ShapeGeometry(pediment),craftSurface('carvedFern','#bcaf96'),0,0,.012,frame);
 for(const sign of [-1,1]){
  dressedBlock(frame,sign*1.19,.51,-depth*.50,.15,1.03,depth,'agedOak','#998c78',1.97);
  const roof=dressedBlock(frame,sign*.70,1.29,-depth*.48,1.70,.16,depth+.56,'barkCourses','#aba594',1.63);
  roof.rotation.z=-sign*.50;
  beam(V3(0,1.72,.22),V3(sign*1.47,.91,.22),.082,'darkWood','#948269',frame);
 }
 dressedBlock(frame,0,.025,.055,2.78,.15,.40,'agedOak','#a2937f',1.90);
}
const woodlandBeforeVillageArt=woodlandHouse;
woodlandHouse=function(x,z,w,d,...args){
 const g=woodlandBeforeVillageArt(x,z,w,d,...args);if(activeScene?.key!=='fern')return g;
 const role=args[0]??'home',shell=g.userData.roofShell;
 const rooms={inn:'fernCanopyInn',provisions:'fernHollowSupplies',smithy:'fernHollowSmithy'};
 g.userData.regionalRole=role;g.userData.fernInterior=rooms[role];if(role==='inn')g.userData.kind='inn';
 const h=4.46,front=d/2+.17; shell.clear();
 if(role==='pavilion')openTimberBay(g,w,d,h);
 fernCanopy(shell,w+(role==='inn'?1.45:0),d,h,role==='smithy'?2.4:role==='pavilion'?3.6:w*.34);
 if(role==='inn'||role==='provisions'){
  const dist=(w*.5+(role==='inn'?1.53:.81))*.72,sill=h+w*.34*.51-.57;
  for(const side of [-1,1])woodlandDormer(shell,side,side*d*.19,dist,sill);
 }
 for(const side of [-1,1]){
  const flank=landmarkGroup(g,side*(w/2+.16),0,0,side*Math.PI/2);
  dressedBlock(flank,0,.47,0,d+.14,.79,.31,'ashlar','#b7b3a0',2.2);
  if(role!=='pavilion'){
   for(const a of [-.32,.30])wovenBay(flank,d*a,2.57,.05,d*.26,2.18);
   foundationGarden(flank,0,.32,d*.58,.69);
   if(role==='inn'||role==='provisions'){
    const bed=landmarkGroup(flank,-d*.32,.44,.27);
    const curve=[V3(0,0,0),V3(.19,.85,.04),V3(-.10,1.76,.05),V3(.29,2.61,.02),V3(.68,3.29,.07)];
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve),14,.046,5,false),craftSurface('agedOak','#878263'),0,0,0,bed);
    for(let i=1;i<curve.length;i++){
     const p=curve[i],spray=landmarkPiece(bed,branchSpray66(11),'leafSpray',i%2?'#99a880':'#adb895',p.x,p.y,p.z,.52,.50,.36);spray.rotation.z=i*.76;
    }
   }
  }
 }
 if(role==='pavilion'){
  for(const side of [-1,1]){box(side*w*.36,.96,0,.68,.24,d*.77,'wood','#b89971',g);wovenBay(g,side*w*.29,1.24,-d*.44,w*.39,1.4);obstacle(x+side*w*.36,z,.68,d*.77,'pavilion bench');}
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
  if(role==='provisions'){
   const stall=landmarkGroup(g,w*.31,0,front+.49);
   for(const s of [-1,1])dressedBlock(stall,s*.73,.66,0,.13,1.02,.68,'wood','#867761');
   dressedBlock(stall,0,1.19,0,1.82,.15,.79,'wood','#a3967d');
   for(let i=-1;i<=1;i++){
    landmarkDrum(stall,i*.56,1.27,.03,.21,.28,.25,'reed','#b4a488',10);
    for(let j=0;j<4;j++)landmarkBoulder(stall,i*.56+.115*Math.cos(j*2.4),1.53+(j===3?.10:0),.03+.11*Math.sin(j*2.4),.105,.12,.10,'fruit',i===0?'#b79652':'#9c6852',j);
   }
   obstacle(x+w*.31,z+front+.49,1.82,.79,'produce table');
  }
  if(role==='smithy'){
   const forge=landmarkGroup(g,-w*.34,.35,front+.35);forge.scale.setScalar(.70);
   masonryHearth163(forge,{key:'hearth29',tint:'#a69980',forge:true,scale:1});
   g.userData.forgeMouth=[-w*.34,.35+.48*.70,front+.35+.09*.70];
   box(-w*.31,5,-d*.17,1.23,5.6,1.23,'wall','#998c75',g);
  }
 }
 if(role!=='pavilion'){
  // A pitched entrance cuts across the longer, swept main roof. Its three
  // nested branch arches frame the door without narrowing the walking aisle.
  const porch=landmarkGroup(shell,0,0,front+.35),half=Math.min(3.16,w*.28);
  for(const s of [-1,1]){
   const eave=s*half,lip=V3(eave,3.36,1.34),crown=V3(0,4.92,1.34);
   const geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.Float32BufferAttribute([eave,3.36,1.40,0,4.99,1.40,0,5.65,-2.85,eave,4.77,-2.85],3));
   geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1.2,0,1.2,1.5,0,1.5],2));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();
   mesh(geo,craftSurface('barkCourses','#b4afa1'),0,0,0,porch);
   boundTimber(porch,[lip,V3(s*half*.74,3.73,1.48),V3(s*half*.3,4.73,1.54),crown],.16);
   boundTimber(porch,[V3(s*half,3.32,1.34),V3(s*half*.94,2.97,1.03),V3(s*half*.93,2.57,.11)],.115);
  }
  fernCrest(porch,0,4.06,1.42,.83);
 }
 if(role!=='pavilion')for(const s of [-1,1]){
  const side=landmarkGroup(g,s*(w/2+.22),0,0,s*Math.PI/2);
  for(const u of [-.31,.30]){
   const xx=d*u;
   dressedBlock(side,xx,2.46,.13,d*.25,1.49,.10,'wood','#574b3c');
   const win=landmarkGroup(side,xx,2.45,.24);
   for(const q of [-1,1]){
    const shutter=dressedBlock(win,q*d*.155,0,.14,.34,1.55,.12,'wood','#85856a');shutter.rotation.y=q*.28;
    box(q*.32,0,.02,.08,1.41,.10,'wood','#b4a185',win);
   }
   box(0,-.04,.04,d*.23,.096,.13,'wood','#b4a185',win);
   dressedBlock(side,xx,1.62,.30,d*.31,.17,.56,'wood','#978371');
  }
  boundTimber(side,[V3(-d*.49,3.94,.18),V3(-d*.22,4.20,.18),V3(d*.14,4.17,.18),V3(d*.48,3.96,.18)],.11);
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
// Upper galleries occupy the existing house plot. Their open fronts reveal
// the inset wall, so balconies read as inhabitable space from the street.
function streetGallery(parent,w,d,y,kind,detached=false){
 const royal=kind==='stone',port=kind==='loft',tone=royal?'#d9d8c9':'#a3967b';
 const width=w*.82,depth=detached?d*.33:Math.min(1.94,d*.20);
 const g=landmarkGroup(parent,0,y,detached?d*.34:d*.50+depth*.41);
 dressedBlock(g,0,.17,0,width+.44,.34,depth+.42,royal?'ashlar':'agedOak',tone,2.18);
 dressedBlock(g,0,1.39,-depth*.43,width,2.54,.29,royal?'ashlar':'agedOak',royal?'#d1d2c5':'#aa9c87',2.31);
 const bays=width>9?4:3,spacing=width/bays;
 for(let j=0;j<=bays;j++){
  const x=-width/2+j*spacing,z=depth*.45;
  dressedBlock(g,x,1.53,z,royal?.31:.22,2.61,royal?.38:.22,royal?'ashlar':'agedOak',tone);
  if(!detached)beam(V3(x,-.78,-depth*.46),V3(x,.01,z),.13,royal?'wall':'wood',royal?'#b5b9ad':'#92816c',g);
  if(royal)dressedBlock(g,x,2.74,z,.55,.24,.56,'ashlar','#e0decf');
  if(j===bays)break;
  const center=x+.5*spacing;
  if(royal){
   const arc=Array.from({length:11},(_,i)=>V3(center+Math.cos(Math.PI*i/10)*spacing*.49,2.40+.83*Math.sin(Math.PI*i/10),z));
   mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc),14,.14,6,false),craftSurface('ashlar','#e5e1d3'),0,0,0,g);
   courtWindow(g,center,.54,-depth*.43+.17,.75,1.57);
  }else{
   for(const s of [-1,1])beam(V3(center+s*spacing*.49,1.94,z),V3(center+s*spacing*.19,2.83,z),.09,'wood','#8e806b',g);
   dressedBlock(g,center,1.31,-depth*.43+.16,spacing*.58,1.77,.10,'agedOak','#645e50');
  }
  dressedBlock(g,center,1.02,z,spacing,.095,.14,royal?'ashlar':'agedOak',tone);
  if(!port)for(const s of [-1,0,1])dressedBlock(g,center+s*spacing*.28,.65,z,.10,.68,.14,royal?'ashlar':'agedOak',tone);
 }
 if(detached){
  const roof=landmarkGroup(g,0,0,0,Math.PI/2);
  landmarkRoof(roof,depth+.46,width+.68,3.13,1.45,'#8795a1',false,'slate');
 }else{
  const pitch=.36,run=depth+.61;
  const hood=dressedBlock(g,0,3.27,0,width+.62,.18,run/Math.cos(pitch),'slate',royal?'#a8b3bb':'#929fa6',2.86);
  hood.rotation.x=pitch;
  dressedBlock(g,0,3.25-run*.5*Math.tan(pitch),run*.5,width+.68,.18,.18,'agedOak','#9f927c',2.2);
 }
}
royalHouse=function(x,z,w,d,...args){
 const g=royalBeforeCityArt(x,z,w,d,...args);if(activeScene?.key!=='highmere')return g;
 const form=Math.abs(Math.round(x+z))%3,shell=g.userData.roofShell,front=d/2+.26;g.userData.regionalRole=['townhouse','merchant residence','corner villa'][form];
 shell.clear();landmarkRoof(shell,w+.13,d+.12,5.69,w*[.33,.24,.41][form],['#8997a5','#b58c70','#97a5ae'][form],false,form===1?'roof':'slate');
 ceremonialArch(g,g.userData.architecture31.door[0],2.93,front,1.34,.89);
 if(form===1){landmarkAwning(g,w*.28,front+.45,w*.34,3.14);}
 if(form===2){const turret=landmarkGroup(shell,-w*.34,4.25,-d*.26);turret.scale.setScalar(.87);landmarkRoyalTower(turret,0,0,3.2);}
 dressCityWalls(g);
 if(form!==2)streetGallery(shell,w,d,3.25,'stone');
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
 if(id==='aidOffice'||id==='archives')streetGallery(shell,w,d,3.60,'stone');
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
 const cx=g.position.x,cz=g.position.z;
 for(const s of [-1,1])obstacle(cx+s*w*.37,cz-d*.22,w*.2,1.6,'stored goods');
 obstacle(cx-w*.31+.86,cz+d*.25,2.48,.81,'stored barrels');
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
brookHouse=function(x,z,w,d,kind,role){
 const g=cottagesBeforeTradeArt(x,z,w,d,kind),region=activeScene?.key;if(!g||!['harbor','alder'].includes(region))return g;
 const f=d/2+.18,shell=g.userData.roofShell??g;
 if(region==='alder'){
  if(role==='stores'){
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
  if(form!==2)streetGallery(shell,w*.86,d,3.14,'workshop');
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
  const office=Math.abs(x-297)<3,store=x===333,workshop=x===351;
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
   for(const s of [-1,1]){
    obstacle(x+s*w*.48,z,.25,d,'warehouse siding');
    const bay=landmarkGroup(g,s*w*.30,0,d*.51+.08);
    dressedBlock(bay,0,1.63,0,w*.26,2.52,.26,'wood','#7a7467');
    for(const side of [-1,1])beam(V3(side*w*.12,.52,.18),V3(-side*w*.12,2.80,.18),.091,'wood','#a8997e',bay);
    dressedBlock(bay,0,2.96,.20,w*.32,.19,.46,'wood','#b3a187');
   }
   const hoist=landmarkGroup(shell,0,0,d*.45);
   loftDoor(hoist,0,2.30,w*.35,1.88);
   for(const s of [-1,1])obstacle(x+s*w*.3,z+d*.51+.08,w*.26,.26,'warehouse cargo doors');
  }else if(office){
   shell.clear();
   const upper=landmarkGroup(shell,0,5.65,0);
   dressedBlock(upper,0,1.16,0,w*.98,2.32,d*.98,'ashlar','#dedacc',2.18);
   for(const s of [-1,1]){
    const face=landmarkGroup(upper,0,0,s*d*.50,s<0?Math.PI:0);
    for(const u of [-.34,-.13,.13,.34])courtWindow(face,w*u,.28,.08,.84,1.63);
    dressedBlock(face,0,.07,.08,w+.17,.24,.41,'ashlar','#b5b8aa');
    dressedBlock(face,0,2.28,.08,w+.30,.22,.45,'ashlar','#c6c8b9');
    const end=landmarkGroup(upper,s*w*.50,0,0,s*Math.PI/2);
    for(const u of [-.27,.27])courtWindow(end,d*u,.31,.025,.85,1.59);
   }
   landmarkRoof(shell,w+.54,d+.54,8.0,w*.32,'#b99685',false,'roofClay86');
   for(const s of [-1,1]){
    const wall=landmarkGroup(g,s*(w*.5+.10),0,0,s*Math.PI/2);
    dressedBlock(wall,0,2.87,0,d,5.43,.25,'ashlar','#d5cdb4',2.23);
    for(const t of [-1,1])courtWindow(wall,t*d*.25,2.69,.14,1.09,1.76);
    dressedBlock(wall,0,.63,0,d,.42,.49,'ashlar','#aca99c',2.52);
   }
   const tower=landmarkGroup(shell,-w*.29,7.65,-d*.21);dressedBlock(tower,0,1.71,0,3.65,3.42,3.20,'ashlar','#d4c9b4',2.5);
   for(const s of [-1,1])for(const t of [-1,1])box(s*1.55,4.42,t*1.31,.25,2.20,.25,'wood','#85745f',tower);
   dressedBlock(tower,0,3.48,0,4.12,.22,3.6,'wood','#a08f76');
   landmarkRoof(tower,4.05,3.70,5.56,1.88,'#8eaba8',false,'glazedTile');
   pennon(g,w*.34,3.13,f+.16,1.28,2.96,'#497784');landmarkLamp(g,w*.30,2.60,f+.32,.46);
   const loggia=landmarkGroup(g,0,0,f+.48);
   for(const s of [-1,1]){
    const xx=s*w*.38;
    dressedBlock(loggia,xx,1.38,.72,.43,2.76,.44,'ashlar','#c5c5b6');
    dressedBlock(loggia,xx,.23,.72,.69,.47,.68,'ashlar','#aaa998');
    obstacle(x+xx,z+f+1.20,.61,.64,'loggia column');
    courtWindow(g,s*w*.30,2.93,f+.02,1.0,1.60);
   }
   dressedBlock(loggia,0,2.93,.41,w*.85,.32,1.8,'ashlar','#c8c8ba');
   for(let j=-3;j<=3;j++)dressedBlock(loggia,j*w*.11,3.30,1.22,.13,.53,.16,'ashlar','#bfbeb0');
   dressedBlock(loggia,0,3.61,1.22,w*.83,.17,.24,'ashlar','#d1cbb6');
  }else if(workshop){
   shedStores(g,w,d,true);
   for(const xx of [-w*.32,0,w*.32])loftDoor(shell,xx,d*.84,w*.28,1.82);
   for(const s of [-1,1]){
    const rack=landmarkGroup(g,s*w*.33,.55,d*.12);
    for(let row=0;row<2;row++)for(let i=0;i<3-row;i++)
     beam(V3((i-1+row*.5)*.38,.23+row*.33,-.55),V3((i-1+row*.5)*.38,.23+row*.33,.95),.19,'canvas86',row?'#b0ac99':'#dbcfaf',rack);
   }
  }
  if(!office&&!store&&!workshop&&z<45){
   // The upper street has occupied two-storey houses. Their stone bases and
   // projecting timber floors overlook the working sheds below.
   shell.clear();dressedBlock(shell,0,6.52,0,w+.27,3.35,d+.18,'loomLinen','#d9d0b9',2.05);
   for(const sx of [-1,0,1]){
    dressedBlock(shell,sx*w*.44,6.51,d*.51,.19,3.33,.38,'agedOak','#867b67',1.93);
    if(sx)courtWindow(shell,sx*w*.23,5.44,d*.52+.06,1.09,1.82);
   }
   dressedBlock(shell,0,4.94,0,w+.66,.30,d+.53,'agedOak','#a69b84',2.23);
   landmarkRoof(shell,w+.48,d+.46,8.14,3.62,x<330?'#a88272':'#879298',false,x<330?'roofClay86':'slate');
   const dorm=landmarkGroup(shell,w*.21,7.56,d*.24);
   landmarkHouse(dorm,2.82,2.44,1.34,1.51,'#879298');
   dressedBlock(shell,-w*.28,8.73,-d*.23,.94,3.82,.95,'ashlar','#bfbbaa',1.82);
  }
  if(!store&&!workshop)quayTimbers(g,w,d,4.48,true);
  if(store||workshop||office)streetGallery(shell,w,d,office?4.30:3.15,'loft');
 }
 return g;
};
// Street fitting may turn a house a second time after its plot is chosen.
// Capture the finished posts, counters and cargo, including the open aisles.
woodlandHouse=ownHouse110(woodlandHouse);
brookHouse=ownHouse110(brookHouse);
function capitalPalace(base){
 const g=landmarkGroup(base,0,8.02,-.48);
 for(const side of [-1,1]){
  const wing=landmarkGroup(g,side*11.65,0,-1.52);
  // A double-depth cloister ties the outlying watchtowers to the main keep.
  dressedBlock(wing,0,2.04,-1.45,9.64,4.08,4.41,'ashlar','#cbd1c6',3.06);
  streetGallery(wing,11.13,5.87,3.97,'stone',true);
  const pavilion=landmarkGroup(wing,side*3.25,7.05,-1.52);
  dressedBlock(pavilion,0,.75,0,2.69,1.50,2.76,'ashlar','#d7d9cb',2);
  landmarkRoof(pavilion,3.04,3.05,1.48,2.63,'#8898a9',false,'slate');
 }
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
 function stonePediment(owner,width,y,z,rise){
  const face=new THREE.Shape();face.moveTo(-width*.5,0);face.lineTo(0,rise);face.lineTo(width*.5,0);face.closePath();
  const geo=new THREE.ShapeGeometry(face),uv=geo.attributes.uv,p=geo.attributes.position;
  for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*.34,p.getY(i)*.34);
  mesh(geo,craftSurface('ashlar','#d4d7cb'),0,y,z,owner);
  for(const s of [-1,1])beam(V3(s*width*.50,y,z+.08),V3(0,y+rise,z+.08),.095,'wall','#d9dacb',owner);
  dressedBlock(owner,0,y+.08,z+.10,width,.17,.32,'ashlar','#d1d2c1');
 }
 stonePediment(portal,7.18,11.22,3.90,2.56);
 for(const side of [-1,1]){
  const wing=landmarkGroup(g,side*8.13,0,0);stonePediment(wing,9.32,6.10,3.63,2.02);
  for(const xx of [-2.06,2.06])courtWindow(wing,xx,6.28,3.68,.57,.81);
 }
 const crest=landmarkGroup(portal,0,11.96,3.99);
 landmarkHoop(crest,0,0,0,.57,.075,'bronze','#b39e69');
 for(let j=0;j<8;j++){const a=j*TAU/8;beam(V3(0,0,.04),V3(.51*Math.cos(a),.51*Math.sin(a),.04),.038,'bronze','#b7a575',crest);}
 for(const s of [-1,1]){
  watchtower(s*4.28,1.59,10.61,2.45,false);watchtower(s*12.83,-.67,8.12,2.70,true);
  royalStandard(g,s*4.28,5.67,2.91);
  for(let i=0;i<4;i++)dressedBlock(base,s*(5.82+i*1.68),8.53,4.29,.43,.83,.53,'ashlar','#d9dccd');
 }
 // Final street fitting adjusts the ground behind the council. Fit the stairs
 // after that work so their foot and the playable street share a height.
 world.userData.palaceStairSite=base.position.clone();
 obstacle(base.position.x,base.position.z+3.46,5.30,.42,'palace doors');
 for(const s of [-1,1])obstacle(base.position.x+s*8.68,base.position.z+4.90,11.91,.52,'palace parapet');
 for(const s of [-1,1]){
  const arcade=landmarkGroup(base,s*8.5,0,5.72);
  for(const a of [-2.1,0,2.1]){
   const face=landmarkGroup(arcade,a,0,0);
   dressedBlock(face,0,2.16,.07,1.70,3.53,.11,'ashlar','#767e78');
   ceremonialArch(face,0,3.49,.20,.89,.78);
   for(const side of [-1,1])dressedBlock(face,side*.94,1.90,.19,.22,3.8,.32,'ashlar','#c5c9bd');
  }
 }
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
function finishPalaceStair(){
 const data=world.userData,site=data.palaceStairSite;
 if(!site||data.palaceSteps)return;
 const base=landmarkGroup(world,site.x,site.y,site.z);
 base.name='Processional palace steps';
 // Land the palace stairs on the space behind the council, with no hanging treads.
 const stairs=world.userData.palaceSteps=[];
 const treadCount=31,pitch=.283,headZ=5.68,lowest=groundAt(base.position.x,base.position.z+headZ+(treadCount-1)*pitch)-base.position.y+.035;
 for(let i=0;i<treadCount;i++){
  const z=headZ+i*pitch,wx=base.position.x,wz=base.position.z+z;
  const top=mix(8.15,lowest,i/(treadCount-1)),bottom=Math.min(-.6,groundAt(wx,wz)-base.position.y-.22),width=5.05+.073*i;
  dressedBlock(base,0,(top+bottom)/2,z,width,top-bottom,pitch+.008,'ashlar',i%4?'#c6cac3':'#d5d7cb',2.83);
  stairs.push({x:wx,z:wz,w:width/2,d:pitch/2,y:base.position.y+top});
 }
 // The top landing ends against the modeled door and retaining wall.
 stairs.push({x:base.position.x,z:base.position.z+4.65,w:2.55,d:.92,y:base.position.y+8.15});
 mergeGroup(base);
}
const courtsBeforeTownArt=conceptCourt38;
function plantCourtShoulders(key){
 const plots={
  fern:[[83,62,4.9,1.96,-.47],[108,62,4.30,1.87,.23],[79,83,4.2,1.64,-.6],[105,92,4.1,1.82,.65],[121,93,4.9,1.65,-.32]],
  alder:[[109,-101,3.82,1.67,-.35],[139,-96,4.10,1.68,.26],[121,-90,3.26,1.57,-.68]],
  highmere:[[-82,-124,4.56,1.70,-.36],[-60,-125,4.5,1.72,.28],[-80,-110,4.2,1.70,-.37],[-87,-98,4.05,1.70,.19]]
 };
 for(const [px,pz,w,d,a] of plots[key]??[]){
  // Mid-block beds occupy the shoulder. Test the whole footprint against
  // projected streets and buildings, with room for two people to pass.
  let spot;
  for(const [dx,dz] of [[0,0],[2,0],[-2,0],[0,-2],[0,2],[2,2],[-2,2]]){
   const x=px+dx,z=pz+dz;
   if(reservedHomeFrontage(key,x,z,Math.hypot(w,d)*.50+.40))continue;
   if(waterGround(x,z)||roadDistance(x,z)<3.4||!staticFree(x,z,Math.hypot(w,d)*.49))continue;
   if(interactables.some(o=>Math.hypot(o.x-x,o.z-z)<4.0))continue;
   spot=[x,z];break;
  }
  if(!spot)continue;
  const [x,z]=spot,bed=landmarkGroup(world,x,groundAt(x,z),z,a),s=Math.sin(a),c=Math.cos(a);
  dressedBlock(bed,0,.15,0,w,.30,d,'earth','#77765b',1.66);
  for(const side of [-1,1]){
   const count=Math.ceil(w/.70);for(let i=0;i<count;i++){
    const xx=w*((i+.5)/count-.5);
    const facing=dressedBlock(bed,xx,.23,side*d*.49,w/count-.029,.41,.24,'ashlar',i%3?'#a3a593':'#b7b4a0',1.35);facing.rotation.z=.024*Math.sin(i*5+side);
   }
   dressedBlock(bed,side*(w*.5-.12),.23,0,.25,.40,d,'ashlar','#a4a590');
  }
  for(let j=0;j<5;j++){
   const u=(j-2)*w*.166,v=Math.sin(j*2.41)*d*.19,h=j%2?.62:.83;
   landmarkBoulder(bed,u,.52,v,h*.79,h*.65,h*.80,'shrub',j%2?'#85986a':'#728860',j*.91);
   gardenFern(bed,u-.18,.31,v+.24,.71+j%3*.12,j*1.82);
   if(j%2===0)for(let k=0;k<3;k++){
    const xx=u+.27*Math.cos(k*2.4),zz=v+.28*Math.sin(k*2.4),yy=.85+k*.085;
    beam(V3(xx-.06,.42,zz),V3(xx,yy,zz),.023,'shrub','#78875e',bed);
    for(let petal=0;petal<4;petal++){const q=petal*Math.PI/2;landmarkBoulder(bed,xx+.057*Math.cos(q),yy,zz+.057*Math.sin(q),.075,.046,.066,'cloth',key==='highmere'?'#cbc5b4':'#a6a4bc',q);}
   }
  }
  // Short masonry sections closely follow the rotated bed perimeter.
  for(let i=0;i<4;i++){
   const off=((i+.5)/4-.5)*w;
   obstacle(x+off*c,z-off*s,Math.abs(w/4*c)+Math.abs(d*s),Math.abs(w/4*s)+Math.abs(d*c),'planted stone bed');
  }
 }
}
conceptCourt38=function(key){
 const start=world.children.length,result=courtsBeforeTownArt(key);if(activeScene?.kind!=='poi')return result;
 plantCourtShoulders(key);
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
  for(const s of [-1,1]){
   for(let i=0;i<6;i++)dressedBlock(base,s*(2.96+i*2.27),8.51,5.31,.33,.89,.43,'ashlar','#e4decb');
   dressedBlock(base,s*8.81,8.98,5.31,11.79,.20,.49,'ashlar','#dedac8',3.8);
   for(const dz of [7.85,10.75]){
    const bed=landmarkGroup(base,s*6.0,0,dz),y=groundAt(base.position.x+s*6,base.position.z+dz)-base.position.y;
    dressedBlock(bed,0,y+.22,0,3.3,.52,2.63,'ashlar','#a6ad9e');
    dressedBlock(bed,0,y+.52,0,3.09,.13,2.41,'earth','#736f52');
    for(const v of [-.73,.73]){landmarkBoulder(bed,v,y+.96,0,.81,.72,.89,'shrub','#829469',v);gardenFern(bed,v,y+.59,.74,.65,dz+v);}
   }
  }
  const [x,z]=JRPG_LAYOUTS46.highmere.courts[0],f=landmarkGroup(world,x,groundAt(x,z)+.84,z);
  landmarkDrum(f,0,0,0,.46,.30,1.22,'wall','#d3c8a9');landmarkDrum(f,0,1.12,0,.32,.97,.42,'wall','#d8cdb4');
  landmarkDrum(f,0,1.53,0,.88,.88,.03,'window','#8faeb1');landmarkDrum(f,0,1.53,0,.18,.06,.47,'bronze','#ad9b75');
 }
 if(key==='alder'){
  const [x,z]=JRPG_LAYOUTS46.alder.courts[0],tree=landmarkGroup(world,x,groundAt(x,z)+.84,z);
  // The meeting tree occupies an island that actually defines the fork in
  // the road. Seats look inward from its outer rim as in the roadside study.
  landmarkDrum(tree,0,-.73,0,3.89,3.76,.68,'wall','#a8aa96',30);
  landmarkDrum(tree,0,-.08,0,3.83,3.78,.17,'wall','#c3c1ac',30);
  landmarkDrum(tree,0,.07,0,3.54,3.54,.11,'earth','#77765a',30);
  landmarkTree(tree,0,.0,10.85);
  for(let i=0;i<22;i++){
   const a=TAU*i/22,r=2.75+.36*Math.sin(i*2.09),u=r*Math.sin(a),v=r*Math.cos(a);
   gardenFern(tree,u,.15,v,.91+.22*Math.sin(i),a);
   if(i%2===0)for(let j=0;j<4;j++)landmarkBoulder(tree,u+.24*Math.sin(j*2),.54+.11*(j%2),v+.21*Math.cos(j*2),.105,.13,.11,'cloth',i%3?'#b1a0ba':'#c7bb99',j);
  }
  for(let i=-5;i<=5;i++){
   const zz=i*.64,extent=Math.sqrt(3.64*3.64-zz*zz);
   obstacle(x,z+zz,extent*2,.65,'meeting-tree island');
  }
  for(let i=0;i<6;i++){
   const a=i*2.40,u=V3(Math.cos(a)*2.05,4.85+.42*(i%3),Math.sin(a)*1.84);
   boundTimber(tree,[V3(0,1.62,0),V3(u.x*.48,3.19,u.z*.37),u],.15,false);
   const leaves=landmarkPiece(tree,branchSpray66(17),'leafSpray',i%2?'#a0b884':'#b4c18a',u.x,u.y,u.z,1.52,1.13,1.53);leaves.rotation.y=a;
  }
  for(const a of [.32,2.42,4.52]){
   gardenFern(tree,Math.sin(a)*1.05,.13,Math.cos(a)*1.05,.78,a);
   const seat=landmarkGroup(tree,Math.sin(a)*4.16,-.77,Math.cos(a)*4.16,a);
   obstacle(x+Math.sin(a)*4.16,z+Math.cos(a)*4.16,1.95*Math.abs(Math.cos(a))+.57*Math.abs(Math.sin(a)),1.95*Math.abs(Math.sin(a))+.57*Math.abs(Math.cos(a)),'stone bench');
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
 landmarkRoof(roof,w+.74,d+.90,4.17,2.15,'#7f8a91',true,'slate');
 for(const s of [-1,1]){
  const z=s*(d*.50+.22);
  beam(V3(-w*.5,4.21,z),V3(0,6.35,z),.13,'wood','#87725a',roof);
  beam(V3(w*.5,4.21,z),V3(0,6.35,z),.13,'wood','#87725a',roof);
  beam(V3(0,4.24,z),V3(0,6.28,z),.13,'wood','#87725a',roof);
  dressedBlock(group,0,4.19,z,w+.25,.22,.26,'wood','#a9967b');
 }
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
 for(const pier of world.userData.piers??[]){
  const deck=landmarkGroup(world,pier.x,pier.y,pier.z),count=Math.ceil(pier.d/.48),pitch=pier.d/count;
  for(let j=0;j<count;j++){
   const z=(j+.5)*pitch-pier.d/2,wz=pier.z+z,h=pierWalkHeight15(pier,wz)-pier.y;
   const plank=dressedBlock(deck,0,h+.012,z,pier.w-.04,.048,pitch-.023,'wood',['#9c8a71','#a3937b','#948675','#a99a80'][j%4],2.35);
   plank.rotation.x=-Math.atan2(pierWalkHeight15(pier,wz+pitch*.5)-pierWalkHeight15(pier,wz-pitch*.5),pitch);
   if(h>.055)dressedBlock(deck,0,h*.50-.02,z,pier.w-.10,h+.03,pitch,'wood','#867c68',2.52);
  }
  for(const side of [-1,1]){
   const edge=side*(pier.w*.5+.10);
   dressedBlock(deck,edge,-.47,0,.29,.47,pier.d+.12,'wood','#756e5e',2.65);
   for(let j=2;j<pier.d-1;j+=3){
    const z=j-pier.d*.5;
    dressedBlock(deck,edge,-.82,z,.42,2.71,.47,'wood','#716d5c',2.17);
    for(const y of [.19,.32])landmarkHoop(deck,edge,y,z,.28,.045,'canvas86','#b6a380').rotation.x=Math.PI/2;
    beam(V3(edge,-1.15,z),V3(edge,-.35,z+1.55),.105,'wood','#746b59',deck);
   }
  }
 }
 for(const wx of [286,315,327,351,359]){
  const hook=landmarkGroup(world,wx,1.76,harborQuayLine(wx)-.23);
  landmarkDrum(hook,0,0,0,.34,.26,.52,'metal','#767c78',12);
  landmarkDrum(hook,0,.47,0,.37,.35,.13,'metal','#909486',12);
  for(let i=0;i<4;i++)landmarkHoop(hook,.64,.065+i*.037,-.56,.30+i*.042,.046,'canvas86','#ae9d7a').rotation.x=Math.PI/2;
 }
 // Hawsers lead from the two berthed boats to the nearest piling. The small
 // cutter out in the bay is at anchor and has no line across the fairway.
 for(const [bow,post] of [[[296.8,2.20,91.2],[301.4,1.95,88]],[[296.8,2.20,98.2],[301.4,1.95,97]],[[346.8,2.64,89.5],[341.1,1.95,88.5]],[[346.8,2.64,98.4],[341.1,1.95,97.5]]]){
  const a=V3(...bow),b=V3(...post),mid=a.clone().lerp(b,.5);mid.y-=.56;
  const rope=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a,mid,b]),12,.055,5,false),craftSurface('reed','#b4a786'),0,0,0,world);
  rope.name='Mooring hawser';
 }
 const wash=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{t:windUniforms.time},
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 v;uniform float t;void main(){float along=v.y*4.0;vec2 p=vec2(v.x,fract(along)-.5);float phase=t*.58+floor(along)*2.37;float arc=length(vec2(p.x*.93,p.y*2.6))+.045*sin(along*6.+phase);float line=pow(.5+.5*cos(arc*19.-phase),8.);float fade=(1.-smoothstep(.16,.92,arc))*smoothstep(.04,.22,v.x)*smoothstep(.0,.055,v.y)*smoothstep(.0,.055,1.-v.y);gl_FragColor=vec4(.62,.75,.73,.18*fade*line);}`});
 for(const pier of world.userData.piers??[])for(const side of [-1,1]){
  const plane=new THREE.PlaneGeometry(1.85,12);plane.rotateX(-Math.PI/2);
  const strip=mesh(plane,wash,pier.x+side*(pier.w/2+.91),.065,pier.z+2.15,world);if(side<0)strip.rotation.y=Math.PI;
  strip.name='Water lapping against pilings';strip.userData.dynamicFX=true;strip.castShadow=strip.receiveShadow=false;
 }
 const wheel=landmarkGroup(cargo,-.57,1.70,.60);landmarkHoop(wheel,0,0,0,.77,.095,'wood','#a88a64');
 for(const [xx,zz,h] of [[-1.70,-.64,.85],[-2.16,.66,.70],[-1.75,-.64,.67]]){const y=h===.67?.85:0;wrappedBale(cargo,xx,y,zz,1.50,h,1.19,'#b9b099');}
 for(let i=0;i<6;i++){const a=i*Math.PI/6;beam(V3(Math.cos(a)*.72,Math.sin(a)*.72,0),V3(-Math.cos(a)*.72,-Math.sin(a)*.72,0),.048,'wood','#a7865e',wheel);}
 const nets=landmarkGroup(world,346,harborGround15(346,77),77);
 for(const x of [-2.2,2.2])box(x,1.54,0,.16,3.08,.16,'wood','#9c805e',nets);
 for(let i=0;i<=12;i++){const t=i/12,x=-2.2+4.4*t,drop=Math.sin(t*Math.PI)*.49;beam(V3(x,2.87-drop,0),V3(x*.95,1.12-drop,.22),.022,'canvas86','#b4ab91',nets);}
 for(let j=0;j<=6;j++){const t=j/6;const pts=[];for(let i=0;i<=6;i++){const u=i/6;pts.push(V3((-2.2+u*4.4)*(1-t*.05),2.87-t*1.75-Math.sin(u*Math.PI)*.49,t*.22));}boundTimber(nets,pts,.027,false);}
 for(const x of [304,338])for(const s of [-1,1]){const bollard=landmarkGroup(world,x+s*(x===304?2.35:2.8),1.62,89);landmarkDrum(bollard,0,0,0,.2,.18,.95,'wood','#957b5c');for(const y of [.55,.66,.77])landmarkHoop(bollard,0,y,0,.21,.043,'canvas86','#bfa980').rotation.x=Math.PI/2;}
};
