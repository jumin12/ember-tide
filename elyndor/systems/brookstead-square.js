// Continuous, terrain-fitted paving completes the square. It shares the
// town's PBR cobbles instead of a bright, level disc cutting into the terrace.
const fountainBefore122=brookFountain;
const townPaving122=new WeakMap();
function pavingMaterial122(){
 if(townPaving122.has(world))return townPaving122.get(world);
 const m=new THREE.MeshStandardMaterial({map:environment102.maps.get('cobbleOld'),color:'#b7bead',roughness:.93,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});m.userData.textureKey='cobbleOld';m.userData.walkablePaving=true;addCloudLighting(m);lightPaintedSurface82(m);materialFinish103(m);townPaving122.set(world,m);return m;
}
brookFountain=function(){
 const start=world.children.length,emitterCount=world.userData.fountains.length;fountainBefore122();
 const g=world.children.slice(start).find(o=>o.isGroup&&o.children[0]?.geometry?.type==='CircleGeometry');if(!g)return;
 // The rebuilt basin owns its pump-gated spray. Discard the old crown emitter.
 world.userData.fountains.length=emitterCount;
 const {x,z,r}=BROOK.plaza,rows=14,segments=96,positions=[],uv=[],indices=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=segments;i++){
  const a=i/segments*TAU,rad=r*j/rows,xx=Math.cos(a)*rad,zz=Math.sin(a)*rad;
  positions.push(xx,heightAt(x+xx,z+zz)+.058-g.position.y,zz);uv.push((x+xx)*.30,(z+zz)*.30);
  if(i&&j){const k=j*(segments+1)+i;indices.push(k-segments-2,k,k-1,k-segments-2,k-segments-1,k);}
 }
 const paving=g.children[0],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingSphere();
 paving.geometry.dispose();paving.geometry=geo;paving.rotation.set(0,0,0);paving.position.set(0,0,0);paving.material=pavingMaterial122();paving.receiveShadow=true;paving.name='Complete terrain-fitted Brookstead square';
 // Seat the concentric stone inlays on the same surface, around every side.
 for(const o of g.children.slice(1))if(o.geometry?.type==='BoxGeometry'&&o.position.y<.10){const xx=x+o.position.x,zz=z+o.position.z;o.position.y=heightAt(xx,zz)+.075-g.position.y;o.material=material('wall','#879485');}
 g.userData.square122={complete:true,radius:r,terrainFitted:true,radialCourses:rows};
 rebuildBasin123(g,x,z);
 world.userData.square122=g.userData.square122;
};
function fountainStone123(tint,dressed=false){
 const m=new THREE.MeshPhysicalMaterial({color:tint,roughness:.93,metalness:0});
 m.userData.keepSolidForPlayerReveal=true;
 addCloudLighting(m);lightPaintedSurface82(m);
 const before=m.onBeforeCompile,key=m.customProgramCacheKey(),layer=surfaceLayer102('wall');
 const density=(48/512)*(layer===1?.47:.65)*(dressed?2.65:1);
 m.onBeforeCompile=function(shader,...args){
  before.call(this,shader,...args);
  shader.uniforms.fountainStoneArt123={value:environment102.surfaces};
  shader.uniforms.fountainStoneDetail123={value:envPbr103.surfaceData};
  shader.uniforms.fountainDay123=waterLight62.day;
  const varyings='varying vec3 fountainStonePoint123, fountainStoneAxis123;\n';
  shader.vertexShader=varyings+shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   fountainStonePoint123=(modelMatrix*vec4(transformed,1.)).xyz;
   fountainStoneAxis123=mat3(modelMatrix)*objectNormal;`);
  // Match the original masonry atlas and world scale. Blend on rounded sides so
  // turning around the basin cannot expose a hard change of projection.
  shader.fragmentShader=varyings+(dressed?`
   float stoneHash221(vec3 cell){cell=fract(cell*.1031);cell+=dot(cell,cell.yxz+33.33);return fract((cell.x+cell.y)*cell.z);}
   float stoneNoise221(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(mix(stoneHash221(i),stoneHash221(i+vec3(1,0,0)),f.x),mix(stoneHash221(i+vec3(0,1,0)),stoneHash221(i+vec3(1,1,0)),f.x),f.y),
     mix(mix(stoneHash221(i+vec3(0,0,1)),stoneHash221(i+vec3(1,0,1)),f.x),mix(stoneHash221(i+vec3(0,1,1)),stoneHash221(i+vec3(1,1,1)),f.x),f.y),f.z);}
   `:'')+
   'uniform highp sampler2DArray fountainStoneArt123, fountainStoneDetail123;\nuniform float fountainDay123;\n'+
   shader.fragmentShader.replace('#include <map_fragment>',`
    vec3 stoneUV123=fountainStonePoint123*${density};
    vec3 stoneWeights123=pow(abs(normalize(fountainStoneAxis123)),vec3(8.));
    stoneWeights123/=dot(stoneWeights123,vec3(1.));
    vec3 stoneX123=vec3(stoneUV123.zy,${layer}.0);
    vec3 stoneY123=vec3(stoneUV123.xz,${layer}.0);
    vec3 stoneZ123=vec3(stoneUV123.xy,${layer}.0);
    vec3 limestone123=texture(fountainStoneArt123,stoneX123).rgb*stoneWeights123.x+
      texture(fountainStoneArt123,stoneY123).rgb*stoneWeights123.y+
      texture(fountainStoneArt123,stoneZ123).rgb*stoneWeights123.z;
    diffuseColor.rgb*=${dressed?'vec3(.80,.84,.82)*(.36+.23*stoneNoise221(fountainStonePoint123*2.3)+.15*stoneNoise221(fountainStonePoint123*12.)+.10*clamp(limestone123.g,0.,.7))':'limestone123*vec3(1.20,1.18,1.37)'};
    // fountain mortar`)
   .replace('#include <normal_fragment_maps>',`
    vec4 detailX123=texture(fountainStoneDetail123,stoneX123);
    vec4 detailY123=texture(fountainStoneDetail123,stoneY123);
    vec4 detailZ123=texture(fountainStoneDetail123,stoneZ123);
    vec2 bendX123=detailX123.rg*2.-1.,bendY123=detailY123.rg*2.-1.,bendZ123=detailZ123.rg*2.-1.;
    vec3 relief123=vec3(0.,bendX123.y,bendX123.x)*stoneWeights123.x+
      vec3(bendY123.x,0.,bendY123.y)*stoneWeights123.y+
      vec3(bendZ123.x,bendZ123.y,0.)*stoneWeights123.z;
    normal=normalize(normal+mat3(viewMatrix)*relief123*${dressed?".08":".34"});
    roughnessFactor=dot(vec3(detailX123.a,detailY123.a,detailZ123.a),stoneWeights123);`)
   .replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
    // Restore the pale bounce from the original courtyard stone.
    reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.055,.054,.067)*mix(.18,1.,fountainDay123);`);
 };
 m.customProgramCacheKey=()=>key+'-fountain-masonry123-'+layer+'-'+dressed;
 return m;
}
function basinRing123(parent,outer,inner,y,depth,tint){
 const shape=new THREE.Shape();shape.absarc(0,0,outer,0,TAU,false);const hole=new THREE.Path();hole.absarc(0,0,inner,0,TAU,true);shape.holes.push(hole);
 const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:64});geometry.rotateX(-Math.PI/2);
 const o=mesh(geometry,fountainStone123(tint),0,y,0,parent);o.name='Continuous circular fountain masonry';return o;
}
const brookFountainDesign221={poolRadius:2.64,waterY:.64,impact:1.94,angle:.32,outlets:4,
 mouth:[1.12,1.26],lip:[1.05,1.30]};
function brookFountainRunning221(){return state.mode!=='title'&&state.flags.pump_repaired===true;}
function brookHardware221(color,metalness,roughness,brass=false){
 const m=new THREE.MeshPhysicalMaterial({color,metalness,roughness,envMap:surface67.outdoor});
 m.userData.preserveSurfaceShader=true;m.userData.keepSolidForPlayerReveal=true;
 // Catch broad sky light on the curved casting, even on the shaded side of the square.
 addCloudLighting(m);const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(sh,...args){
  before.call(this,sh,...args);sh.uniforms.hardwareDay221=waterLight62.day;
  if(brass){
   // Use the casting texture for tooling marks while retaining the alloy's gold color.
   sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`
    #ifdef USE_MAP
     float grain221=dot(texture2D(map,vMapUv).rgb,vec3(.21,.72,.07));
     diffuseColor.rgb*=.68+.29*grain221;
    #endif`);
  }
  sh.fragmentShader='uniform float hardwareDay221;\n'+sh.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
   vec3 wn221=inverseTransformDirection(normal,viewMatrix);
   float wrap221=.36+.64*pow(clamp(.50+dot(wn221,vec3(-.35,.40,.26)),0.,1.),2.);
   float daylight221=mix(.09,1.,hardwareDay221);
   reflectedLight.indirectDiffuse+=diffuseColor.rgb*wrap221*daylight221*${brass?'.34':'.69'};
   reflectedLight.indirectSpecular+=diffuseColor.rgb*daylight221*${brass?'.31':'.48'}*pow(1.-abs(dot(normal,normalize(vViewPosition))),2.3);`);
 };
 m.customProgramCacheKey=()=>key+(brass?'-brook-brass':'-brook-cast-metal');return m;
}
function brookHandPump221(root){
 const iron=brookHardware221('#74675a',.32,.44);
 const edge=brookHardware221('#ac8f67',.38,.37);
 const stone=fountainStone123('#bdb396',true),base=fountainStone123('#92917d',true);
 const bore=new THREE.MeshPhysicalMaterial({color:'#252924',roughness:.84});
 const body=new THREE.Group();body.position.set(-.32,0,-.10);root.add(body);
 mesh(new THREE.BoxGeometry(.87,.18,.90),base,0,.09,0,body);
 function turn(profile,mat){
  const g=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),28);
  return mesh(g,mat,0,0,0,body);
 }
 turn([[.30,.17],[.31,.20],[.31,.24],[.25,.27],[.21,.39],[.16,.54],[.16,.73],
  [.20,.76],[.20,.81],[.17,.84],[.172,1.51],[.198,1.55],[.198,1.62],[.165,1.65],
  [.165,1.88],[.21,1.91],[.21,1.98],[.16,2.01],[.12,2.06],[.10,2.16],[0,2.16]],iron);
 for(const [r,y] of [[.304,.23],[.20,.79],[.197,1.59],[.21,1.96]]){
  const band=mesh(new THREE.TorusGeometry(r,.014,6,28),edge,0,y,0,body);band.rotation.x=Math.PI/2;
 }
 for(const x of [-.22,.22])for(const z of [-.22,.22])mesh(new THREE.CylinderGeometry(.038,.045,.034,6),edge,x,.194,z,body);
 const pivot=mesh(new THREE.CylinderGeometry(.097,.097,.28,14),edge,0,2.13,0,body);pivot.rotation.x=Math.PI/2;
 const lever=new THREE.CatmullRomCurve3([V3(.07,2.10,.12),V3(-.09,2.22,.12),V3(-.29,2.20,.12),
  V3(-.51,2.04,.13),V3(-.82,1.74,.14),V3(-1.13,1.46,.15)]);
 mesh(new THREE.TubeGeometry(lever,24,.046,10,false),iron,0,0,0,body).name='Cast pump lever';
 beam(V3(-.96,1.60,.15),V3(-1.53,1.16,.17),.083,'wood','#b58750',body);
 const spout=new THREE.CubicBezierCurve3(V3(.13,1.54,.04),V3(.55,1.67,.17),V3(.81,1.55,.29),V3(.92,1.30,.45));
 mesh(new THREE.TubeGeometry(spout,20,.075,12,false),iron,0,0,0,body);
 const tip=spout.getPoint(1),axis=spout.getTangent(1);
 const collar=mesh(new THREE.TorusGeometry(.077,.015,8,20),edge,tip.x,tip.y,tip.z,body);
 collar.quaternion.setFromUnitVectors(V3(0,0,1),axis);
 mesh(new THREE.CircleGeometry(.067,20),bore,tip.x,tip.y,tip.z,body).quaternion.copy(collar.quaternion);
 function bowlOutline(w,h,r){
  const s=new THREE.Shape();s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);
  s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);
  s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);return s;
 }
 const outline=bowlOutline(.80,.58,.18);outline.holes.push(bowlOutline(.61,.398,.15));
 const wall=new THREE.ExtrudeGeometry(outline,{depth:.40,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,curveSegments:6});wall.rotateX(-Math.PI/2);
 mesh(wall,stone,.78,.065,.70,root).name='Hollow limestone pump trough';
 const floor=new THREE.ShapeGeometry(bowlOutline(.78,.56,.17));floor.rotateX(-Math.PI/2);
 mesh(floor,base,.78,.09,.70,root);
 const surface=new THREE.ShapeGeometry(bowlOutline(.62,.405,.15));surface.rotateX(-Math.PI/2);
 const water=mesh(surface,new THREE.MeshPhysicalMaterial({color:'#62847a',roughness:.19,clearcoat:1,envMap:surface67.outdoor,envMapIntensity:.52}),.78,.355,.70,root);water.castShadow=false;
 const source=tip.clone().add(body.position),contact=V3(.75,.355,.62);
 const on={value:Number(!!state.flags.pump_repaired)};
 water.material.onBeforeCompile=shader=>{
  shader.uniforms.troughTime221=windUniforms.time;shader.uniforms.troughFlow221=on;
  shader.vertexShader='varying vec2 troughPoint221;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntroughPoint221=position.xz;');
  shader.fragmentShader='varying vec2 troughPoint221;uniform float troughTime221,troughFlow221;\n'+shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec2 fromJet=troughPoint221-vec2(-.03,-.08);float dist221=length(fromJet);
   float ring=cos(dist221*54.-troughTime221*8.)*exp(-dist221*5.)*troughFlow221;
   vec2 slope=fromJet/max(.028,dist221)*ring*.26;
   normal=normalize(normal+mat3(viewMatrix)*vec3(slope.x,0.,slope.y));
   diffuseColor.rgb+=vec3(.05,.07,.065)*max(0.,ring);`);
 };
 const stream=new THREE.CubicBezierCurve3(source,V3(.67,1.14,.44),V3(.74,.75,.58),contact);
 return {stream,contact,on};
}
function fountainCourse221(parent,outer,inner,y,depth,count,offset,tint){
 // Each voussoir has a bevel and a small open joint over the continuous mortar bed.
 const positions=[],indices=[],profile=[[inner+.035,0],[outer-.035,0],[outer,.035],[outer,depth-.035],
  [outer-.035,depth],[inner+.035,depth],[inner,depth-.035],[inner,.035]];
 for(let i=0;i<count;i++){
  const start=positions.length/3,step=TAU/count,angle=offset+i*step;
  for(let j=0;j<=5;j++)for(const [r,h] of profile){
   const a=angle+.005+j/5*(step-.010);positions.push(r*Math.cos(a),y+h,r*Math.sin(a));
  }
  for(let j=0;j<5;j++)for(let k=0;k<8;k++){
   const a=start+j*8+k,b=start+j*8+(k+1)%8;indices.push(a,b,a+8,b,b+8,a+8);
  }
  for(let k=1;k<7;k++)indices.push(start,start+k+1,start+k,start+40,start+40+k,start+41+k);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
 mesh(g,fountainStone123(tint,true),0,0,0,parent).name='Jointed limestone basin course';
}
function fountainPillar221(basin,x,z,level){
 const d=brookFountainDesign221,carving=new THREE.Group();carving.rotation.y=-d.angle;basin.add(carving);
 const stone=fountainStone123('#b9af98',true),cap=fountainStone123('#cfc2a4',true),foot=fountainStone123('#939780',true);
 function block(bottom,top,lo,hi,mat){
  const g=new THREE.CylinderGeometry(top*Math.SQRT2,bottom*Math.SQRT2,hi-lo,4);
  g.rotateY(Math.PI/4);return mesh(g,mat,0,(lo+hi)/2,0,carving);
 }
 block(.93,.93,.37,.62,foot);block(.93,.84,.62,.73,foot);
 // Cut three recessed watercourses directly into each of the four tapered faces.
 const positions=[],indices=[],cols=52,rows=44;
 for(let side=0;side<4;side++){
  const start=positions.length/3,angle=side*Math.PI/2,c=Math.cos(angle),sn=Math.sin(angle);
  for(let j=0;j<=rows;j++){
   // Concentrate the cuts' vertices in the inscription band.
   const y=j<3?mix(.71,1.63,j/3):j>rows-3?mix(2.03,2.15,(j-rows+3)/3):mix(1.63,2.03,(j-3)/(rows-6));
   const radius=mix(.84,.66,(y-.71)/1.44);
   for(let i=0;i<=cols;i++){
    const u=(i/cols*2-1)*radius,wave=y-1.83-.045*Math.sin(u*14.5);
    const dist=Math.abs(wave-clamp(Math.round(wave/.113),-1,1)*.113);
    const cut=(1-smooth(.008,.040,dist))*(1-smooth(.32,.40,Math.abs(u)));
    const face=radius-.031*cut;
    positions.push(c*u+sn*face,y,c*face-sn*u);
    if(i&&j){const n=start+j*(cols+1)+i;indices.push(n-cols-2,n-cols-1,n,n-cols-2,n,n-1);}
   }
  }
 }
 const faceGeo=new THREE.BufferGeometry();faceGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));faceGeo.setIndex(indices);faceGeo.computeVertexNormals();
 const beforeCarve=stone.onBeforeCompile,stoneKey=stone.customProgramCacheKey();
 stone.onBeforeCompile=function(shader,...args){
  beforeCarve.call(this,shader,...args);shader.uniforms.springOrigin221={value:V3(x,level,z)};
  shader.fragmentShader='uniform vec3 springOrigin221;\n'+shader.fragmentShader.replace('// fountain mortar',`
   vec3 spring=fountainStonePoint123-springOrigin221;
   vec2 local=mat2(cos(${d.angle}),-sin(${d.angle}),sin(${d.angle}),cos(${d.angle}))*spring.xz;
   float along=abs(local.x)>abs(local.y)?local.y:local.x;
   // Each side of the stone was cut in its own outward orientation.
   if(abs(local.x)>abs(local.y))along*=-sign(local.x);else along*=sign(local.y);
   float relief=spring.y-1.83-.045*sin(along*14.5);
   float width=abs(relief-clamp(floor(relief/.113+.5),-1.,1.)*.113);
   float aa=clamp(fwidth(relief),.003,.025);
   float recess=(1.-smoothstep(.014,.022+aa,width))*(1.-smoothstep(.32,.40,abs(along)));
   diffuseColor.rgb*=1.-recess*.58;
   diffuseColor.rgb*=mix(vec3(.77,.85,.71),vec3(1.),smoothstep(.65,1.06,spring.y+.05*sin(along*16.)));`);
 };stone.customProgramCacheKey=()=>stoneKey+'-cut-spring';
 mesh(faceGeo,stone,0,0,0,carving).name='Carved spring pillar';
 block(.685,.765,2.13,2.19,cap);block(.765,.765,2.19,2.27,cap);block(.765,.62,2.27,2.39,cap);
 const brass=brookHardware221('#a07c4a',.64,.35,true);
 const polished=brookHardware221('#c9a268',.73,.24,true);
 const bore=brookHardware221('#493522',.48,.54,true);
 const portY=d.mouth[1]+.07;
 for(let i=0;i<d.outlets;i++){
  const port=new THREE.Group();port.rotation.y=-i*TAU/d.outlets;carving.add(port);
  const boss=mesh(new THREE.CylinderGeometry(.195,.22,.13,32),brass,.77,portY,0,port);boss.rotation.z=-Math.PI/2;
  const bead=mesh(new THREE.TorusGeometry(.173,.013,8,32),polished,.836,portY,0,port);bead.rotation.y=Math.PI/2;
  const curve=new THREE.CubicBezierCurve3(V3(.77,portY,0),V3(.91,portY+.03,0),V3(...d.lip,0),V3(...d.mouth,0));
  mesh(new THREE.TubeGeometry(curve,12,.105,12,false),brass,0,0,0,port);
  const end=V3(...d.mouth,0),axis=curve.getTangent(1),ring=mesh(new THREE.TorusGeometry(.087,.020,10,28),polished,end.x,end.y,0,port);
  ring.quaternion.setFromUnitVectors(V3(0,0,1),axis);
  const inset=end.clone().addScaledVector(axis,-.025);
  const opening=mesh(new THREE.CircleGeometry(.093,28),bore,inset.x,inset.y,0,port);opening.quaternion.copy(ring.quaternion);
 }
}
function rebuildBasin123(g,x,z){
 // The old polygon of radial boxes left gaps and could be buried by terrain.
 // Replace the basin itself, independently from the surrounding plaza.
 const removed=new Set();
 for(const o of [...g.children])if(o!==g.children[0]&&Math.hypot(o.position.x,o.position.z)<3.5){removed.add(o);o.removeFromParent();}
 world.userData.supplyJets=(world.userData.supplyJets??[]).filter(o=>!removed.has(o));
 const heights=[];for(let j=0;j<=4;j++)for(let i=0;i<64;i++){const a=i/64*TAU,rad=j/4*3.18;heights.push(heightAt(x+Math.cos(a)*rad,z+Math.sin(a)*rad));}
 const high=Math.max(...heights),low=Math.min(...heights),level=high+.12,basin=new THREE.Group();basin.position.y=level-g.position.y;basin.name='Complete elevated fountain basin';g.add(basin);
 const foundationDepth=Math.max(.28,level-low+.12);
 mesh(new THREE.CylinderGeometry(3.16,3.20,foundationDepth,96),fountainStone123('#a9b3a3'),0,-foundationDepth/2+.035,0,basin);
 basinRing123(basin,2.96,2.65,.02,.79,'#797d66');
 fountainCourse221(basin,3.00,2.63,.04,.39,24,.12,'#aba489');
 fountainCourse221(basin,3.06,2.59,.44,.39,24,.12+Math.PI/24,'#c8bc99');
 const waterMat=new THREE.MeshPhysicalMaterial({color:'#377c7b',roughness:.16,metalness:0,envMap:surface67.outdoor,envMapIntensity:.55,clearcoat:.8,clearcoatRoughness:.12});
 const d=brookFountainDesign221;
 const pool=mesh(new THREE.CircleGeometry(d.poolRadius,96),waterMat,0,d.waterY,0,basin);pool.rotation.x=-Math.PI/2;pool.castShadow=false;pool.name='Unbroken circular fountain pool';pool.userData.dynamicWater=true;
 fountainPillar221(basin,x,z,level);
 const blocker=colliders.find(c=>c.type==='fountain'&&Math.hypot(c.x-x,c.z-z)<.1);if(blocker)blocker.w=blocker.d=3.05;
 g.userData.square122.basin123={continuous:true,innerRadius:2.59,outerRadius:3.06,groundHigh:high,groundLow:low,base:level,minimumClearance:level-high};
 world.userData.fountain123={basin,pool,base:level,x,z};
}
const plazaApproachMaterials132=new WeakMap();
function plazaApproachMaterial132(){
 if(plazaApproachMaterials132.has(world))return plazaApproachMaterials132.get(world);
 const source=pavingMaterial122(),m=source.clone(),before=source.onBeforeCompile,key=source.customProgramCacheKey();
 m.userData={...source.userData,plazaBoundary132:true};
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.publicCircle132={value:new THREE.Vector3(BROOK.plaza.x,BROOK.plaza.z,BROOK.plaza.r-.025)};
  s.vertexShader='varying vec2 routeWorld132;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nrouteWorld132=(modelMatrix*vec4(transformed,1.)).xz;');
  s.fragmentShader='uniform vec3 publicCircle132;varying vec2 routeWorld132;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(distance(routeWorld132,publicCircle132.xy)<publicCircle132.z)discard;');
 };m.customProgramCacheKey=()=>key+'-unbroken-public-plaza132';plazaApproachMaterials132.set(world,m);return m;
}
function townWalk122(route,width=2.6){
 const p=[],uv=[],indices=[];let distance=0;
 for(let k=1;k<route.length;k++){
  const a=route[k-1],b=route[k],length=Math.hypot(b.x-a.x,b.z-a.z);if(length<.02)continue;
  const n=Math.max(1,Math.ceil(length/.50)),dx=(b.x-a.x)/length,dz=(b.z-a.z)/length;
  for(let j=0;j<=n;j++){
   const t=j/n,x=mix(a.x,b.x,t),z=mix(a.z,b.z,t);
   for(const side of[-1,1]){const xx=x-dz*side*width/2,zz=z+dx*side*width/2;p.push(xx,heightAt(xx,zz)+.052,zz);uv.push(side<0?0:width*.30,(distance+t*length)*.30);}
   if(j){const v=p.length/3-4;indices.push(v,v+1,v+2,v+1,v+3,v+2);}
  }
  distance+=length;
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const m=plazaApproachMaterial132();
 const o=new THREE.Mesh(g,m);o.name='Continuous Brookstead cottage walk';o.receiveShadow=true;o.userData.frontagePath110=true;world.add(o);
 return{route,width,length:distance};
}
const frontWalkBefore122=frontagePath110;
frontagePath110=function(g,route){return activeScene.key==='brookstead'?{owner:g,...townWalk122(route,g.userData.kind==='home'?2.3:2.8)}:frontWalkBefore122(g,route);};
// The rear garden cottage has an explicit lane into the north of the square.
// Include it in planning before front-door paths and vegetation are fitted.
const streetsBefore122=streetLines110;
// The west approach must end outside the complete plaza, not cut through its
// left arc. Geometry and the walking-height function share this same plan.
BROOK.crossStairs={start:-131.6,length:7,z:68.5,depth:5,lo:3.8,hi:6.2};
const westStair123=STEPS19.find(s=>s.axis==='x'&&s.z===68.5);
Object.assign(westStair123,{x:BROOK.crossStairs.start-BROOK.crossStairs.length/2,len:BROOK.crossStairs.length,w:BROOK.crossStairs.depth});
const clipStairsBefore123=clipStairGround17;
clipStairGround17=function(g,steps){return clipStairsBefore123(g,activeScene?.key==='brookstead'?steps.map(s=>s.x===-132&&s.z===68.5?{...s,x:westStair123.x,w:westStair123.len,d:westStair123.w}:s):steps);};
// House foundation blending previously raised the west part of the square
// after its paving was built. The public plaza has priority over that blend.
const seatedSquareBefore123=seatedGround45;
seatedGround45=function(x,z,base){
 const old=seatedSquareBefore123(x,z,base);if(activeScene?.key!=='brookstead')return old;
 const radial=Math.hypot(x-BROOK.plaza.x,z-BROOK.plaza.z),weight=1-smooth(BROOK.plaza.r+2.4,BROOK.plaza.r+5.4,radial);return mix(old,3.8,weight);
};
const squareHeightBefore123=heightAt;
heightAt=function(x,z,...args){
 if(activeScene?.key==='brookstead'&&!encounter53.active&&Math.hypot(x-BROOK.plaza.x,z-BROOK.plaza.z)<=BROOK.plaza.r+.15)return 3.8;
 return squareHeightBefore123(x,z,...args);
};
const NORTH_LANE_WIDTH122=2.6;
const NORTH_LANES122=[
 [[-129.5,34.3],[-129.5,41],[-127,47],[-124,53],[-121,55]],
 [[-150.35,42.3],[-150.35,46],[-140,46],[-133,44],[-129.5,41]]
];
streetLines110=function(){const lines=streetsBefore122();return activeScene.key==='brookstead'?[...lines,...NORTH_LANES122,[[-143,68.5],[-138.6,68.5],[-131.6,68.5],[-128,68.5]]]:lines;};
const fitTownBefore122=fitVillage110;
fitVillage110=function(){
 if(activeScene.key!=='brookstead'||world.userData.townLayout122)return fitTownBefore122();
 // This lane is continuous all the way from the rear house to the square.
 const lanes=NORTH_LANES122.map(line=>line.map(([x,z])=>({x,z}))),rear=lanes[0];for(const lane of lanes)townWalk122(lane,NORTH_LANE_WIDTH122);
 townWalk122([{x:-142.8,z:68.5},{x:-138.6,z:68.5}],2.6);townWalk122([{x:-131.6,z:68.5},{x:-128,z:68.5}],2.6);
 fitTownBefore122();
 const backHouse=world.userData.villageStreets110.houses.find(h=>Math.abs(h.at[0]+128)<1&&Math.abs(h.at[1]-29)<1);
 if(backHouse?.connected)backHouse.path.push(...rear.slice(1).map(p=>[p.x,p.z]));
 const weaver=world.userData.villageStreets110.houses.find(h=>Math.abs(h.at[0]+149)<1&&Math.abs(h.at[1]-37)<1);
 if(weaver?.connected)weaver.path.push(...lanes[1].slice(1).map(p=>[p.x,p.z]));
 // Remove cover from the entire new lane, including the part beyond the
 // short doorway connector. Window boxes and tall planting are untouched.
 const matrix=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0);
 for(const o of[...world.userData.plantMeshes??[],...world.userData.ecology104?.meshes??[]]){
  if(!o.isInstancedMesh)continue;
  for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);const e=matrix.elements,x=e[12],z=e[14];if(e[13]>heightAt(x,z)+1.2||!lanes.some(line=>line.slice(1).some((b,k)=>segmentDistance(x,z,[line[k].x,line[k].z],[b.x,b.z])<1.6)))continue;zero.setPosition(x,e[13],z);o.setMatrixAt(i,zero);o.userData.plantOriginal?.[i]?.copy(zero);}
  o.instanceMatrix.needsUpdate=true;
 }
 const houses=world.userData.buildings.filter(g=>g.userData.brookHouse),details=[];
 // Small planted frontages sit beside the entry, never on its path. All
 // positions are transformed with the actual street-facing building.
 for(const g of houses){
  const {w,d}=g.userData.footprint,dx=g.userData.architecture31.door[0];g.updateWorldMatrix(true,false);
  for(const side of[-1,1]){
   const lx=side*(w/2-.85),local=V3(lx,0,d/2+2.1),at=g.localToWorld(local);
   if(Math.abs(lx-dx)<2.1||waterGround(at.x,at.z)||!inSceneBounds(at.x,at.z,0))continue;
   const nearRoute=world.userData.villageStreets110.houses.some(h=>h.connected&&h.path.slice(1).some((b,i)=>segmentDistance(at.x,at.z,h.path[i],b)<2.0));if(nearRoute)continue;
   const pot=new THREE.Group();pot.position.set(at.x,heightAt(at.x,at.z),at.z);pot.rotation.y=g.rotation.y;pot.name='Street-side planted cottage frontage';world.add(pot);
   planter121(pot,0,.33,0,1.35);for(const hand of[-1,1])box(hand*.60,.18,0,.18,.35,.70,'wall','#b8bba7',pot);mergeGroup(pot);
   details.push({house:g.name,position:pot.position.toArray()});
  }
 }
 // Two quiet corners frame the square without obstructing its spoke routes.
 for(const [x,z,a]of[[-127.5,58.5,-.55],[-115,69.1,2.6]]){
  if(waterGround(x,z)||!staticFree(x,z,.45))continue;
  bench(x,z,a);details.push({bench:[x,z]});
 }
 // The garden belongs beside the rear cottage, away from the public lane.
 if(staticFree(-119.3,40,.4)&&!waterGround(-119.3,40)){
  const garden=new THREE.Group();garden.position.set(-119.3,heightAt(-119.3,40),40);garden.name='Rear cottage kitchen garden';world.add(garden);
  for(const x of[-1.05,1.05]){
   box(x,.12,0,1.65,.24,3.2,'earth','#625c40',garden);
   for(const side of[-1,1]){box(x+side*.84,.18,0,.10,.34,3.4,'wood','#8a7b56',garden);box(x,.18,side*1.63,1.75,.34,.10,'wood','#8a7b56',garden);}
   for(let j=0;j<5;j++)planter121(garden,x,.05,-1.2+j*.60,.78);
  }
  for(const side of[-1,1])box(side*2,.85,-2.1,.14,1.7,.14,'darkWood','#7e6c4b',garden);
  for(const y of[.65,1.2])beam(V3(-2,y,-2.1),V3(2,y,-2.1),.035,'wood','#a39267',garden);
  mergeGroup(garden);details.push({garden:garden.position.toArray()});
 }
 world.userData.townLayout122={rearLane:rear.map(p=>[p.x,p.z]),northLanes:lanes.map(line=>line.map(p=>[p.x,p.z])),paths:world.userData.villageStreets110.paths,details,square:world.userData.square122};
 world.updateMatrixWorld(true);rebuildColliderGrid();
};

// Cut actual rails and posts out of pedestrian corridors before static
// batching. Removing collision alone would leave a visible fence across them.
function fenceCorridors123(){
 const lines=streetLines110().map(p=>({p,pad:activeScene.key==='brookstead'?2.35:2.1}));
 const primary=lines.map(q=>q.p);
 for(const g of world.userData.buildings??[]){
  const f=g.userData.footprint;if(!f||!g.userData.door)continue;
  for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2]){
   const start=frontagePoint110(g,a,1.0),road=nearestStreet110(start.x,start.z,primary),toward=(road.x-start.x)*Math.sin(a)+(road.z-start.z)*Math.cos(a);
   if(road.d<24&&toward>-.3)lines.push({p:[[start.x,start.z],[road.x,road.z]],pad:1.75});
  }
 }
 return lines;
}
function clearFenceSpan123(a,b,lines){
 const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.3));
 for(let i=0;i<=n;i++){const x=mix(a[0],b[0],i/n),z=mix(a[1],b[1],i/n);if(activeScene.key==='brookstead'&&!brookStairClear132(x,z,.45))return false;for(const q of lines)for(let j=1;j<q.p.length;j++)if(segmentDistance(x,z,q.p[j-1],q.p[j])<q.pad+.22)return false;}
 return true;
}
function gardenFence123(a,b,wood=true,solid=false){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.05)return;
 const n=Math.ceil(length/1.4),lines=fenceCorridors123(),group=new THREE.Group();group.name='Path-cleared garden fence';world.add(group);let gaps=0,kept=0;
 world.userData.fences123??=[];
 const brook=activeScene.key==='brookstead',posts=brook?(world.userData.gardenPosts123??=new Set()):null;
 const points=Array.from({length:n+1},(_,i)=>[mix(a[0],b[0],i/n),mix(a[1],b[1],i/n)]);
 const spans=points.slice(1).map((end,i)=>clearFenceSpan123(points[i],end,lines)&&!waterGround(...points[i])&&!waterGround(...end));
 for(let i=0;i<n;i++){
  if(!spans[i]||(brook&&!spans[i-1]&&!spans[i+1])){gaps++;continue;}
  const start=points[i],end=points[i+1];
  const y0=heightAt(...start),y1=heightAt(...end),key=wood?'wood':'wall',tint=wood?'#a48d60':'#a9b5a4';
  for(const [p,y]of[[start,y0],[end,y1]]){
   if(posts){const site=key+'/'+p[0].toFixed(3)+'/'+p[1].toFixed(3);if(posts.has(site))continue;posts.add(site);}
   box(p[0],y+.62,p[1],wood?.19:.42,1.24,wood?.19:.42,key,tint,group);if(wood)box(p[0],y+1.27,p[1],.26,.12,.26,'wood','#b9a16d',group);
  }
  for(const h of[.45,.95])beam(V3(start[0],y0+h,start[1]),V3(end[0],y1+h,end[1]),wood?.07:.15,key,tint,group);
  if(solid)obstacle((start[0]+end[0])/2,(start[1]+end[1])/2,Math.max(.19,Math.abs(end[0]-start[0])),Math.max(.19,Math.abs(end[1]-start[1])),'garden fence');
  world.userData.fences123.push({a:start,b:end,wood,solid,clearance:true});kept++;
 }
 if(kept)mergeGroup(group);else group.removeFromParent();
 world.userData.fenceGaps123=(world.userData.fenceGaps123??0)+gaps;
}
const brookFenceBefore123=brookFence;
brookFence=function(x,z,xx,zz){
 if(activeScene?.kind!=='poi')return brookFenceBefore123(x,z,xx,zz);
 return gardenFence123([x,z],[xx,zz],true,true);
};
const fenceBefore123=fence;
fence=function(a,b,wood=true){if(activeScene?.kind==='poi')return gardenFence123(a,b,wood,false);return fenceBefore123(a,b,wood);};
