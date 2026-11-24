// Travel miniatures use the game's material atlas and the existing sites' coordinates.
const landmarkFinishes=new Map();
function landmarkSlate(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d'),rng=seeded(1851);
 ctx.fillStyle='#364150';ctx.fillRect(0,0,256,256);
 for(let row=0;row<8;row++)for(let col=-1;col<8;col++){
  const x=col*32+(row%2)*16,y=row*32,t=Math.floor(rng()*25);
  ctx.fillStyle='rgb('+(101+t)+','+(118+t)+','+(141+t)+')';ctx.fillRect(x+1,y+1,30,29);
  ctx.fillStyle='#a7b0b9';ctx.fillRect(x+2,y+27,28,2);
  for(let j=0;j<23;j++){ctx.fillStyle=rng()<.6?'#d4deea36':'#243c5224';ctx.fillRect(x+2+rng()*28,y+2+rng()*24,1+rng()*6,1);}
 }
 const tile=new THREE.CanvasTexture(canvas);tile.colorSpace=THREE.SRGBColorSpace;tile.wrapS=tile.wrapT=THREE.RepeatWrapping;
 tile.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return tile;
}
function landmarkFinish(kind,tint){
 const id=kind+'-'+tint;
 if(landmarkFinishes.has(id))return landmarkFinishes.get(id);
 const colours={wall:'#a09c90',cobble:'#928671',earth:'#837862',plaster:'#967954',wood:'#856247',darkWood:'#573e30',window:'#ffc875',rock:'#777b70',shrub:'#52703e',cloth:'#d9cfbb',water:'#315564',door:'#594530',metal:'#847d72'};
 const color=new THREE.Color(colours[kind]??'#b7b7b7').lerp(new THREE.Color(tint),.25);
 const m=new THREE.MeshStandardMaterial({color,roughness:kind==='water'?.42:.85,side:THREE.DoubleSide});
 if(kind==='slate'||kind==='glazedTile'){
  m.color.set(kind==='slate'?'#b4bbc9':tint);m.map=landmarkFinishes.get('slate-map')??landmarkSlate();landmarkFinishes.set('slate-map',m.map);
  m.bumpMap=m.map;m.bumpScale=.055;m.roughness=.63;
 }else if(kind==='leafSpray'){
  m.color.set(tint);m.map=textures.leafOak30;m.alphaTest=.34;m.roughness=.94;
 }else if(kind==='window'||kind==='lightFacets'){
  m.color.set(tint);m.emissive.set(kind==='window'?'#ffa340':tint);m.emissiveIntensity=kind==='window'?1.58:.82;
  if(kind==='lightFacets')m.color.multiplyScalar(.19);
  m.map=kind==='lightFacets'?textures.lightFacets:null;m.roughness=.24;m.envMap=surface67.outdoor;m.envMapIntensity=.5;
 }else{
  const textureKey={bronze:'metal',snowCap:'rock',shrub:'grassA',fruit:'plaster'}[kind]??kind;
  m.map=textures[textureKey]??null;
  if(['cloth','bronze','snowCap','fruit','shrub'].includes(kind))m.color.set(tint);
  else m.color.lerp(new THREE.Color('#e5ccaa'),.18);
  if(kind==='snowCap'){m.map=textures.plaster;m.roughness=.82;}
  if(kind==='shrub'){m.map=textures.plaster;m.color.lerp(new THREE.Color('#9ca858'),.40);}
  if(kind==='bronze'||kind==='metal'){m.metalness=.58;m.roughness=.38;m.envMap=surface67.outdoor;m.envMapIntensity=.75;}
  const normal=textures['normal28_'+textureKey]??envPbr103.maps.get(canonical103(textureKey)+':normalRough');
  if(normal){m.normalMap=normal;m.normalScale.setScalar(kind==='plaster'?.19:.34);}
  else if(m.map){m.bumpMap=m.map;m.bumpScale=kind==='cloth'?.016:.045;}
 }
 m.userData.preserveSurfaceShader=true;
 m.onBeforeCompile=s=>{
  s.uniforms.landmarkDay=celestial31.day;
  // Small roofs and timber bays catch diffuse sky even under a storm at dusk.
  s.fragmentShader='uniform float landmarkDay;\n'+s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   totalEmissiveRadiance*=mix(1.65,.58,landmarkDay);
   ${kind==='lightFacets'?`vec3 facet=normalize(vNormal);
    float flash=pow(abs(dot(facet,normalize(vec3(-.58,.42,.81)))),7.);
    float rim=pow(1.-abs(dot(facet,normalize(vViewPosition))),2.);
    totalEmissiveRadiance*=(.14+.42*max(0.,facet.y)+1.27*flash);
    totalEmissiveRadiance+=vec3(.10,.38,.36)*rim;
    diffuseColor.rgb*=.50+.40*max(0.,facet.x);`:''}`).replace('#include <lights_fragment_end>',`
   #include <lights_fragment_end>
   reflectedLight.indirectDiffuse+=diffuseColor.rgb*mix(vec3(.22,.25,.31),vec3(.14,.15,.16),landmarkDay);
  `);
 };m.customProgramCacheKey=()=>kind==='lightFacets'?'landmark-quartz':'landmark-sky-fill';
 landmarkFinishes.set(id,m);return m;
}
function landmarkPiece(parent,geometry,kind,tint,x,y,z,sx=1,sy=1,sz=1){
 const o=new THREE.Mesh(geometry,landmarkFinish(kind,tint));o.position.set(x,y,z);o.scale.set(sx,sy,sz);
 if(kind==='window'||kind==='lightFacets')o.userData.lampTint=kind==='window'?'#ffb15c':tint;
 o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
function landmarkBlock(parent,x,y,z,w,h,d,kind,tint){
 return landmarkPiece(parent,geo16('box',()=>new THREE.BoxGeometry(1,1,1)),kind,tint,x,y,z,w,h,d);
}
function landmarkGroup(parent,x=0,y=0,z=0,angle=0){
 const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=angle;parent.add(group);return group;
}
function landmarkTimber(parent,a,b,width,tone='#926f4c'){
 const direction=b.clone().sub(a),p=a.clone().lerp(b,.5);
 const beam=landmarkBlock(parent,p.x,p.y,p.z,width,direction.length(),width,'wood',tone);
 beam.quaternion.setFromUnitVectors(V3(0,1,0),direction.normalize());return beam;
}
function landmarkWindow(parent,x,y,z,w,h){
 landmarkBlock(parent,x,y,z,w+.18,h+.19,.14,'darkWood','#815c41');
 landmarkBlock(parent,x,y,z+.09,w,h,.055,'window','#ffb750');
 landmarkBlock(parent,x,y,z+.14,.085,h,.08,'wood','#755037');
 landmarkBlock(parent,x,y-.10,z+.14,w,.085,.08,'wood','#755037');
 landmarkBlock(parent,x,y-h*.5-.09,z+.10,w+.29,.12,.32,'wood','#b89060');
}
function landmarkRoof(parent,w,d,h,rise,tone,open=false,cover='slate'){
 const roof=landmarkGroup(parent,0,h,0),half=(w+.66)*.5,length=d+.7,run=Math.hypot(half,rise);
 for(const side of [-1,1]){
  const panel=geo16('travel-slate-'+[w,d,rise,side].join('-'),()=>{
   const g=new THREE.BufferGeometry(),edge=side*half;
   g.setAttribute('position',new THREE.Float32BufferAttribute([edge,0,-length/2,edge,0,length/2,0,rise,length/2,0,rise,-length/2],3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,length/3.25,0,length/3.25,run/2.25,0,run/2.25],2));
   g.setIndex(side<0?[0,1,2,0,2,3]:[0,2,1,0,3,2]);g.computeVertexNormals();return g;
  });
  landmarkPiece(roof,panel,cover,tone,0,.03,0);
  landmarkBlock(roof,side*half,-.03,0,.14,.19,length+.04,'wood','#98764b');
  const z=side*(d/2+.06);
  if(!open){
   const g=geo16('landmark-gable',()=>{const outline=new THREE.Shape();outline.moveTo(-.5,0);outline.lineTo(.5,0);outline.lineTo(0,1);outline.closePath();return new THREE.ExtrudeGeometry(outline,{depth:.1,bevelEnabled:false})});
   landmarkPiece(parent,g,'plaster','#d8b686',0,h,z-.05,w,rise,1);
   landmarkBlock(parent,0,h+rise*.42,z+side*.09,.16,rise*.82,.16,'wood','#826145');
  }
  for(const sign of [-1,1])landmarkTimber(parent,V3(sign*(w*.5+.22),h,z+side*.15),V3(0,h+rise+.03,z+side*.15),.18);
 }
 landmarkBlock(roof,0,rise+.07,0,.15,.12,length+.14,'metal','#817b70');
}
function landmarkHouse(parent,w,d,h,rise,tone,chimney=false,cover='slate'){
 landmarkBlock(parent,0,.27,0,w+.26,.90,d+.28,'wall','#b6b5a4');
 landmarkBlock(parent,0,(h+.5)/2,0,w,h-.5,d,'plaster','#dec198');
 for(const turn of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const face=landmarkGroup(parent,0,0,0,turn),front=turn%Math.PI===0,width=front?w:d,z=(front?d:w)*.5+.09;
  for(const x of [-.46,0,.46])landmarkBlock(face,x*width,h*.52,z,.18,h-.30,.18,'wood','#966c49');
  for(const y of [.65,h*.52,h-.12])landmarkBlock(face,0,y,z,width,.15,.17,'wood','#9e734d');
  for(const side of [-1,1])landmarkWindow(face,side*width*.25,h*.67,z+.1,Math.min(1,width*.19),h*.32);
  if(front){landmarkBlock(face,0,1.02,z+.15,.88,1.65,.12,'door','#9c7854');landmarkBlock(face,0,.20,z+.36,1.45,.36,.73,'cobble','#c4c2b1');}
 }
 landmarkRoof(parent,w,d,h,rise,tone,false,cover);
 if(chimney){
  const top=h+rise+1.1;
  landmarkBlock(parent,w*.31,(h+top)/2,-d*.28,.67,top-h,.69,'wall','#c8c2ae');
  landmarkBlock(parent,w*.31,top,-d*.28,.84,.26,.85,'wall','#e0d9c6');
  landmarkBlock(parent,w*.31,top+.14,-d*.28,.41,.045,.44,'darkWood','#594e42');
 }
}
function landmarkAwning(parent,x,z,w,y){
 const g=landmarkGroup(parent,x,0,z);
 const cloth=landmarkBlock(g,0,y,0,w,.13,1.65,'cloth','#f3d6a1');cloth.rotation.x=.13;
 landmarkBlock(g,0,y-.18,.78,w,.22,.12,'cloth','#ddbb86');
 for(const side of [-1,1])landmarkBlock(g,side*(w*.5-.12),(y-.18)/2,.74,.14,y-.18,.14,'wood','#a07b50');
}
function landmarkBarrel(parent,x,z,scale=1){
 const g=landmarkGroup(parent,x,.02,z);g.scale.setScalar(scale);
 const body=geo16('travel-cask',()=>new THREE.LatheGeometry([[.31,0],[.38,.21],[.405,.52],[.37,.82],[.31,1],[0,1]].map(([x,y])=>new THREE.Vector2(x,y)),10));
 landmarkPiece(g,body,'wood','#ad885d',0,0,0);
 const hoop=geo16('travel-cask-hoop',()=>new THREE.CylinderGeometry(.396,.396,.075,10,1,true));
 for(const y of [.25,.75])landmarkPiece(g,hoop,'metal','#686966',0,y,0);
}
function landmarkWheel(parent,x,y,z){
 const g=landmarkGroup(parent,x,y,z,-.22);g.name='Brookstead waterwheel';
 const ring=geo16('travel-mill-ring',()=>new THREE.TorusGeometry(1.58,.145,6,24));
 for(const face of [-.48,.48]){
  landmarkPiece(g,ring,'wood','#a7835a',0,0,face);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;landmarkTimber(g,V3(0,0,face),V3(1.53*Math.cos(a),1.53*Math.sin(a),face),.14);
  }
 }
 for(let i=0;i<14;i++){
  const a=i*TAU/14,paddle=landmarkBlock(g,1.6*Math.cos(a),1.6*Math.sin(a),0,.21,.49,1.18,'wood',i%2?'#b28c5f':'#9d754e');paddle.rotation.z=a;
 }
 const hub=landmarkPiece(g,geo16('mill-shaft',()=>new THREE.CylinderGeometry(.23,.23,1.63,10)),'metal','#8c8176',0,0,0);hub.rotation.x=Math.PI/2;
 return g;
}
function landmarkBridge(parent){
 const arch=new THREE.Shape();arch.moveTo(-3.45,0);arch.lineTo(-3.35,1.0);arch.quadraticCurveTo(0,3.50,3.35,1.0);arch.lineTo(3.45,0);
 arch.lineTo(2.15,0);arch.bezierCurveTo(1.93,2.18,-1.93,2.18,-2.15,0);arch.closePath();
 const geometry=geo16('travel-footbridge',()=>new THREE.ExtrudeGeometry(arch,{depth:1.63,bevelEnabled:false,curveSegments:16}));
 landmarkPiece(parent,geometry,'wall','#c7c4b4',0,-.02,-.815);
 for(const side of [-1,1]){
  for(let i=0;i<13;i++){
   const a=(i+.5)*Math.PI/13,x=2.26*Math.cos(a),y=1.65*Math.sin(a);
   const stone=landmarkBlock(parent,x,y,side*.86,.46,.31,.17,'wall',i%3?'#e0d8c1':'#c9c7b9');
   stone.rotation.z=Math.atan2(1.65*Math.cos(a),-2.26*Math.sin(a));
  }
  for(let i=0;i<8;i++){
   const x=-3.06+i*.875,y=2.26-.125*x*x;
   landmarkBlock(parent,x,y+.04,side*.78,.84,.22,.28,'wall','#ded7c3').rotation.z=Math.atan(-.25*x);
  }
 }
}
function landmarkCourt(parent,site,path,tone,map){
 const wet=map==='water',base=macroGround(site.x,site.z),positions=[],uv=[],fade=[];
 const points=path.map(([x,z])=>new THREE.Vector2(x,z));
 const vertex=(v)=>{
  const edge=Math.min(...path.map((a,i)=>segmentDistance(v.x,v.y,a,path[(i+1)%path.length])));
  positions.push(v.x,macroGround(site.x+v.x,site.z+v.y)-base+(wet?.095:.055),v.y);
  uv.push(v.x*.28,v.y*.28);fade.push(Math.min(1,edge/(wet?.28:.86)));
 };
 function triangle(a,b,c){
  if(Math.max(a.distanceToSquared(b),b.distanceToSquared(c),c.distanceToSquared(a))<2.25){vertex(a);vertex(b);vertex(c);return;}
  const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
  triangle(a,ab,ca);triangle(ab,b,bc);triangle(ca,bc,c);triangle(ab,bc,ca);
 }
 for(const [a,b,c] of THREE.ShapeUtils.triangulateShape(points,[]))triangle(points[a],points[c],points[b]);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('margin',new THREE.Float32BufferAttribute(fade,1));
 geo.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({color:wet?'#557d94':tone,map:wet?null:textures.earth,roughness:wet?.30:.96,transparent:true,opacity:wet?.92:.45,side:THREE.DoubleSide,depthWrite:false});
 mat.onBeforeCompile=s=>{
  s.uniforms.millTime=windUniforms.time;
  s.vertexShader='attribute float margin;varying float softEdge;varying vec2 localUV;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsoftEdge=margin;localUV=uv;');
  s.fragmentShader='uniform float millTime;varying float softEdge;varying vec2 localUV;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   diffuseColor.a*=smoothstep(0.,1.,softEdge);
   ${wet?'float wave=sin(localUV.y*47.+sin(localUV.x*9.+millTime*.5)*2.1+millTime*1.6);diffuseColor.rgb+=vec3(.035,.055,.065)*smoothstep(.80,1.,wave);':''}`);
 };mat.customProgramCacheKey=()=>wet?'mill-ripple':'landmark-earth';
 const o=new THREE.Mesh(geo,mat);o.renderOrder=wet?2:1;o.receiveShadow=true;parent.add(o);
}
function buildLandmarkModel(site,key,footprints){
 const model=new THREE.Group();model.name=POIS[key].name+' concept model';
 const base=macroGround(site.x,site.z);
 const place=(x,z,angle=0)=>landmarkGroup(model,x,macroGround(site.x+x,site.z+z)-base,z,angle);
 const rng=seeded(key==='brookstead'?29147:87632),surfaces=new THREE.Group();let wheel=null;
 if(key==='brookstead'){
  // The east/west lane crosses the court. Seat the homes on the original
  // north and south lots and leave the actual road surface exposed between them.
  landmarkCourt(surfaces,site,[[-11,-3],[-10,-7],[-1,-8],[8,-7],[10,-4],[7,-1.9],[-3,-2.0]],'#c5b69d','earth');
  landmarkCourt(surfaces,site,[[-9,4.2],[-3.4,3.8],[4,3.7],[9,3.4],[10,6.7],[7,8.5],[-6,8.8]],'#c5b69d','earth');
  const mill=place(-7.1,-4.85,1.02);landmarkHouse(mill,4.2,5.2,3.25,1.95,'#8c9bac');landmarkAwning(mill,0,3.4,3.15,1.94);
  const tall=place(5.4,-5.5,-.51);landmarkHouse(tall,4.35,4.9,4.62,2.35,'#99a4ba',true);
  const shop=place(7.0,5.85,-.60);landmarkHouse(shop,3.65,4.50,3.15,1.76,'#889bb8');landmarkAwning(shop,0,3.06,3.13,1.89);
  const store=place(-.15,-5.65,.45);landmarkHouse(store,2.6,2.4,1.9,1.15,'#96a8b7');
  landmarkCourt(surfaces,site,[[-10.65,3.8],[-9.5,3.6],[-7.4,4.0],[-6.6,4.9],[-4,5.5],[-3,6.3],[-1.5,8.75],[-2.7,8.98],[-4.65,7.05],[-7.55,6.35],[-8.8,5.1]],'#5d94ac','water');
  landmarkCourt(surfaces,site,[[-11.5,-6.7],[-10.55,-6.9],[-9.55,-5.1],[-8.85,-3.35],[-9.5,-2.8],[-10.6,-4.1]],'#5d94ac','water');
  const wheelBase=place(-10.05,-3.0);wheel=landmarkWheel(wheelBase,0,1.92,0);wheel.scale.setScalar(1.12);
  landmarkBarrel(mill,2.67,1.5);landmarkBarrel(mill,2.72,.65,.79);landmarkBarrel(shop,-2.12,1.55,.85);
  landmarkBridge(place(-5.9,5.50,-.38));
 }else if(key==='patrol'){
  landmarkCourt(surfaces,site,[[-6.4,-3.6],[-4.0,-5.1],[2,-5.5],[5,-3.9],[4.7,-2.25],[-1,-1.85],[-4.5,2.7],[-6.3,2.1]],'#c8b793','earth');
  const shed=place(-3.0,4.0,1.13),w=3.9,d=6.2,h=3.05;
  landmarkBlock(shed,0,.11,0,w+.3,.38,d+.3,'cobble','#b4ab94');
  for(const side of [-1,1])for(const z of [-d*.47,0,d*.47]){
   landmarkBlock(shed,side*w*.45,h*.5,z,.22,h,.22,'wood','#a27a55');
   landmarkTimber(shed,V3(side*w*.45,h-.75,z),V3(side*(w*.45-.65),h,z),.14);
  }
  for(const z of [-2.0,-.8,.6,1.9])landmarkBlock(shed,-.2,.63,z,1.84,.26,.53,'wood','#b7915a');
  for(const z of [-2,0,2]){landmarkBlock(shed,-1.65,h*.52,z,.23,.83,1.88,'wood','#ac855b');landmarkBarrel(shed,-1.29,z+.31,.78);}
  landmarkWindow(shed,-1.38,1.72,-2.45,.48,.62);
  landmarkRoof(shed,w,d,h,1.36,'#92979c',true);
  const hut=place(2.8,-4.8,.91);landmarkHouse(hut,2.75,3.65,2.45,1.35,'#99a6b1',true);landmarkAwning(hut,0,2.67,2.69,1.73);
  const tent=place(-3.0,-3.35,.46);landmarkRoof(tent,2.38,2.5,.25,1.42,'#9a806d',true,'cloth');
  for(const x of [-1.1,1.1])landmarkBlock(tent,x,.43,1.5,.13,.87,.13,'wood','#c39c66');
  for(let i=0;i<3;i++)landmarkBlock(model,-.5,.20-i*.055,2.9+i*.56,1.7,.20,.57,'wall','#c6bdac');
 }else buildRegionalLandmark(site,key,place,footprints);
 const width=key==='brookstead'?9.15:key==='patrol'?7.1:site.w*.36,depth=key==='brookstead'?6.9:key==='patrol'?4.9:site.d*.34;
 const hub=miniWorld71(site,site.hub71.x,site.hub71.z);
 for(let i=0;i<32;i++){
  if(key!=='brookstead'&&key!=='patrol'&&(i%5<2||i%7===0))continue;
  const a=i*TAU/32;if(Math.sin(a)>.64&&Math.cos(a)>.0)continue;
  const x=Math.cos(a)*width+(rng()-.5)*.70,z=Math.sin(a)*depth+(rng()-.5)*.55;
  if(site.gates71.some(g=>segmentDistance(site.x+x,site.z+z,[hub.x,hub.z],g.outer)<2.55))continue;
  if(key!=='brookstead'&&key!=='patrol'&&macroRoadInfo15(site.x+x,site.z+z).d<2.7)continue;
  const y=macroGround(site.x+x,site.z+z)-base;
  const rock=landmarkPiece(model,geo16('landmark-fieldstone',()=>new THREE.IcosahedronGeometry(1,0)),'rock',i%3?'#adae9d':'#c7bea8',x,y+.15,z,.32+rng()*.32,.24+rng()*.22,.37+rng()*.25);
  rock.rotation.y=rng()*TAU;
  if(i%3===0){const leaves=landmarkPiece(model,branchSpray66(12),'leafSpray','#c0c6a0',x+.26,y+.28,z-.25,.49,.53,.52);leaves.rotation.y=a;}
 }
 // Bake the static assembly and the rotating wheel into separate draw batches.
 model.updateMatrixWorld(true);
 const sources=model.userData.lampSources=[];
 model.traverse(o=>{
  if(!o.userData.lampTint)return;
  o.geometry.computeBoundingSphere();const p=o.localToWorld(o.geometry.boundingSphere.center.clone());
  if(!sources.some(s=>Math.hypot(s[0]-p.x,s[1]-p.y,s[2]-p.z)<2.8))
   sources.push([p.x,p.y,p.z,o.userData.lampTint]);
 });
 const wheelSeat=wheel?.parent;
 if(wheel)wheel.removeFromParent();mergeGroup(model);
 for(const child of [...model.children])if(!child.isMesh)child.removeFromParent();
 model.add(surfaces);
 const shadowPlots=footprints.length?footprints:[{x:site.x+3.65,z:site.z-3.3,w:7.8,d:4.8}];
 model.add(landmarkContactShadows(site,shadowPlots));
 if(wheel){mergeGroup(wheel);if(!wheelSeat.parent)model.add(wheelSeat);wheelSeat.add(wheel);}
 model.position.y=base;model.rotation.y=-site.a;
 const gates=landmarkGroup(model,0,-base,0,site.a);
 for(const gate of site.gates71){
  const portal=landmarkGroup(gates);portal.name=gate.id;portal.userData.entranceId=gate.id;
  drawMiniatureGateway71(portal,site,gate,key);
  portal.traverse(o=>{
   if(!o.isMesh)return;
   if(o.material.map===textures.slate)o.material=landmarkFinish('slate','#889cb4');
   else if(o.material.map===textures.wood||o.material.map===textures.darkWood)o.material=landmarkFinish('wood','#917650');
  });
  mergeGroup(portal);
 }
 return {model,wheel};
}
