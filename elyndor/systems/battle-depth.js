// Authored PixelLab plates form the distant landscape, not a screen overlay.
// The clearing is reconstructed in world space and dressed with lit 3D scenery.
const BATTLE_SCENERY59={
 waterfall:{trees:'oak',water:true,falls:true,rocks:18,ferns:80,grass:180,leaf:'#bec999',stone:'#b5b9a5'},
 woodland:{trees:'oak',dense:true,rocks:10,ferns:110,grass:170,leaf:'#8eaa69',stone:'#9ca58b'},
 orchard:{trees:'orchard',wall:true,rocks:6,ferns:30,grass:170,leaf:'#c2bd72',stone:'#c8bb95'},
 ruins:{trees:'oak',ruins:true,rocks:20,ferns:75,grass:100,leaf:'#a9b78a',stone:'#b6b49e'},
 cavern:{cave:true,water:true,crystals:true,rocks:30,ferns:15,grass:0,leaf:'#608d8b',stone:'#859696'},
 mountain:{trees:'pine',rocks:25,ferns:20,grass:100,leaf:'#89956e',stone:'#a8a6aa'},
 snow:{trees:'pine',snow:true,rocks:20,ferns:0,grass:15,leaf:'#cadcdb',stone:'#c8d4d8'},
 coast:{water:true,coast:true,rocks:23,ferns:20,grass:80,leaf:'#a5ad7a',stone:'#b9b7a0'},
 royalRoad:{trees:'cypress',wall:true,ruins:true,rocks:4,ferns:45,grass:70,leaf:'#a2b278',stone:'#c9c0a7'},
 moonlit:{trees:'oak',dense:true,rocks:14,ferns:100,grass:150,leaf:'#8fa6a4',stone:'#a5b4b7'},
 grassMeadow:{trees:'oak',water:true,falls:true,rocks:12,ferns:30,grass:280,leaf:'#aec386',stone:'#adb49b'},
 grassRiver:{trees:'oak',water:true,rocks:15,ferns:50,grass:260,leaf:'#b2c18b',stone:'#b3bca6'},
 grassFlowers:{trees:'oak',water:true,falls:true,flowers:true,rocks:12,ferns:50,grass:250,leaf:'#b5c88d',stone:'#b0b89f'},
 grassDowns:{coast:true,rocks:13,ferns:15,grass:250,leaf:'#b8bf87',stone:'#cac8b0'},
 grassWindmill:{trees:'oak',wall:true,rocks:6,ferns:20,grass:260,leaf:'#c0bb7d',stone:'#c2b397'},
 grassAutumn:{trees:'autumn',rocks:10,ferns:25,grass:240,leaf:'#c4a066',stone:'#bfb198'},
 grassStones:{stones:true,rocks:22,ferns:30,grass:220,leaf:'#b4c18f',stone:'#b1b69c'},
 grassHills:{trees:'pine',rocks:24,ferns:25,grass:230,leaf:'#a9b87c',stone:'#aaa99b'},
 grassBirch:{trees:'birch',rocks:10,ferns:45,grass:250,leaf:'#b2c68b',stone:'#bac0a4'},
 grassTwilight:{trees:'oak',rocks:12,ferns:35,grass:240,leaf:'#b5ac9e',stone:'#aea9b1'}
};
const stageDepth59={group:null,stage:null,aspect:0,occluders:[],time:{value:0},water:{value:0},foliage:{value:1},falls:{value:0},stats:{builds:0,disposed:0,geometryCreated:0,geometryDisposed:0},geometries:[],materials:[]};
function clearStageDepth59(){
 const q=stageDepth59;if(q.group){q.group.removeFromParent();q.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of q.geometries)g.dispose();for(const m of q.materials)m.dispose();q.stats.disposed++;}
 q.group=null;q.stage=null;q.geometries=[];q.materials=[];q.occluders=[];
 if(encounter53.resources){encounter53.resources.backdrop.visible=true;encounter53.resources.floor.visible=true;}
}
function geometry59(g){stageDepth59.geometries.push(g);stageDepth59.stats.geometryCreated++;g.addEventListener('dispose',()=>stageDepth59.stats.geometryDisposed++);return g;}
function material59(m){stageDepth59.materials.push(m);return m;}
function stageAverage59(texture,rect=[.05,.05,.95,.95]){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=24;const ctx=canvas.getContext('2d',{willReadFrequently:true}),im=texture.image;ctx.drawImage(im,rect[0]*im.width,(1-rect[3])*im.height,(rect[2]-rect[0])*im.width,(rect[3]-rect[1])*im.height,0,0,24,24);const data=ctx.getImageData(0,0,24,24).data,color=new THREE.Color(0,0,0),sample=new THREE.Color();for(let i=0;i<data.length;i+=4){sample.setRGB(data[i]/255,data[i+1]/255,data[i+2]/255,THREE.SRGBColorSpace);color.add(sample);}return color.multiplyScalar(1/(24*24));
}
function stageMaterial59(key,color,wind=false,cutout=false){
 const spec=BATTLE_SCENERY59[stageDepth59.stage],autumn=spec.trees==='autumn',birch=spec.trees==='birch';
 const tint=new THREE.Color(color).lerp(new THREE.Color('#ffffff'),.65);
 const nativeKey=key==='rock'?'stage59_stone':key==='leaves'?'stage59_canopy':key==='pineCanopy'?'stage59_pine':key;
 const m=material59(new THREE.MeshStandardMaterial({map:textures[nativeKey]??textures[key]??null,color:tint,roughness:.98,metalness:0,side:cutout||wind?THREE.DoubleSide:THREE.FrontSide,alphaTest:cutout?.42:0}));
 const foliage=key==='leaves'||key==='pineCanopy';if(foliage){m.color.set('#ffffff');m.alphaTest=.23;}
 m.onBeforeCompile=s=>{
  s.uniforms.stageWind59=stageDepth59.time;
  s.uniforms.stageTint59={value:new THREE.Color(encounter53.phase55==='night'?'#9eadd0':spec.cave?'#b0cad0':'#ffffff').multiplyScalar(encounter53.phase55==='night'?.36:spec.cave?.72:1)};
  s.fragmentShader='uniform vec3 stageTint59;\n'+s.fragmentShader;
  if(foliage||key==='rock'){
   s.uniforms.stageProjector59={value:stageDepth59.projector};s.uniforms.stageCrop59={value:stageDepth59.crop};s.uniforms.stageOffset69={value:stageDepth59.photoOffset69??new THREE.Vector2(.5,.5)};s.uniforms.stagePhoto59={value:encounter53.resources.material.uniforms.map.value};
   s.vertexShader='uniform mat4 stageProjector59;varying vec4 sourceProjection59;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
    vec4 sourcePoint59=vec4(position,1.);
    #ifdef USE_INSTANCING
     sourcePoint59=instanceMatrix*sourcePoint59;
    #endif
    sourceProjection59=stageProjector59*modelMatrix*sourcePoint59;`);
   s.fragmentShader='uniform sampler2D stagePhoto59;uniform vec2 stageCrop59,stageOffset69;varying vec4 sourceProjection59;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    vec2 photoUV59=(sourceProjection59.xy/sourceProjection59.w*.5)*stageCrop59+stageOffset69;
    photoUV59=1.-abs(mod(photoUV59,2.)-1.);vec3 scenePigment59=texture2D(stagePhoto59,photoUV59).rgb;`);
  }
  if(foliage)s.fragmentShader=s.fragmentShader.replace('vec3 scenePigment59=texture2D(stagePhoto59,photoUV59).rgb;',`vec3 scenePigment59=texture2D(stagePhoto59,photoUV59).rgb;
   float leafGap59=dot(diffuseColor.rgb,vec3(.24,.63,.13));diffuseColor.a*=smoothstep(.008,.055,leafGap59);
   float sceneGreen59=smoothstep(.008,.07,scenePigment59.g-max(scenePigment59.r*.84,scenePigment59.b*.94));
   diffuseColor.a*=mix(.15,1.,sceneGreen59);diffuseColor.rgb=mix(diffuseColor.rgb*1.3,scenePigment59, .83);`);
  if(key==='rock'){
   s.uniforms.stageStone59={value:new THREE.Color(spec.stone)};
   s.fragmentShader='uniform vec3 stageStone59;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('vec3 scenePigment59=texture2D(stagePhoto59,photoUV59).rgb;',`vec3 scenePigment59=texture2D(stagePhoto59,photoUV59).rgb;
    float stoneDetail59=dot(texture2D(map,vMapUv*1.3).rgb,vec3(.24,.63,.13));
    diffuseColor.rgb=scenePigment59*(.96+.04*sqrt(max(.0,stoneDetail59)));`);
  }
  if(autumn&&key==='leaves')s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float amber59=dot(diffuseColor.rgb,vec3(.24,.63,.13));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(amber59*1.65,amber59*.95,amber59*.28),.92);`);
  if(birch&&key==='bark')s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float bark59=dot(diffuseColor.rgb,vec3(.24,.63,.13));diffuseColor.rgb=mix(vec3(.22,.24,.19),vec3(.76,.78,.68),smoothstep(.025,.19,bark59));`);
  if(spec.snow&&key==='pineCanopy')s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.71,.79,.82),smoothstep(.10,.72,normalize(vNormal).y)*.94);`);
  if(wind){s.vertexShader='uniform float stageWind59;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 windPoint59=vec4(position,1.);
   #ifdef USE_INSTANCING
    windPoint59=instanceMatrix*windPoint59;
   #endif
   float bend59=sin(stageWind59*.83+windPoint59.x*.46+windPoint59.z*.35)+.35*sin(stageWind59*1.29+windPoint59.z*.72);
   transformed.x+=bend59*.10*max(0.,position.y+${key===null?'0.':'.5'});transformed.z+=bend59*.04*max(0.,position.y+${key===null?'0.':'.5'});`);}
  // Keep the native PixelLab albedo visible in both direct light and shade.
  s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`float illumination59=dot(outgoingLight,vec3(.24,.63,.13))/max(.01,dot(diffuseColor.rgb,vec3(.24,.63,.13)));
   vec3 light59=normalize((viewMatrix*vec4(-.6,.8,.6,0.)).xyz);
   float shape59=.77+.23*max(0.,dot(normal,light59));
   outgoingLight=diffuseColor.rgb*shape59*mix(.88,1.,smoothstep(.3,1.1,illumination59))*${foliage||key==='rock'?'mix(vec3(1.),stageTint59,.12)':'stageTint59'};
   #include <opaque_fragment>`);
 };
 m.customProgramCacheKey=()=>`stage59-${key}-${autumn}-${birch}-${!!spec.snow}-${wind?'wind':'solid'}-${cutout?'cut':'opaque'}`;return m;
}
function makeStageLandscape59(reference,spec){
 const q=stageDepth59,c=encounter53,cols=100,rows=60,positions=[],uvs=[],indices=[],aspect=reference.aspect,imageAspect=c.resources.material.uniforms.imageAspect.value;
 const cropX=Math.min(1,aspect/imageAspect)/1.08,cropY=Math.min(1,imageAspect/aspect)/1.08,offsetY69=typeof mobileBattle69==='function'&&mobileBattle69()&&innerWidth>innerHeight?cropY*.5:.5,eye=reference.position.clone();q.photoOffset69=new THREE.Vector2(.5,offsetY69);
 // A ray-reconstructed ground flows continuously into middle-distance hills
 // and a distant curved landscape. UVs stay attached to those actual surfaces.
 const point=(u,v)=>{
  const ray=V3((u-.5)*2,(v-.5)*2,.5).unproject(reference).sub(eye).normalize();
  const mound=(x,y,sx,sy,h)=>h*Math.exp(-Math.pow((u-x)/sx,2)-Math.pow((v-y)/sy,2));
  const rockRelief=mound(.075,.10,.13,.12,1.5)+mound(.92,.13,.12,.13,1.3)+mound(.12,.35,.10,.065,.9)+mound(.88,.35,.09,.07,1.1);
  const ground=(c.floorY-.025+rockRelief-eye.y)/ray.y;
  const low=V3((u-.5)*2,(.40-.5)*2,.5).unproject(reference).sub(eye).normalize(),seam=(c.floorY-.025-eye.y)/low.y;
  let distance;
  if(v<.40&&ground>0)distance=ground;else{const t=smooth(.40,.90,v);distance=mix(seam,150,t);const edge=Math.pow(clamp(Math.abs((u-.5)*2),0,1),3);distance-=edge*(spec.dense||spec.cave?20:8)*smooth(.42,.7,v);
   // Broad, softly joined depth volumes follow the painted tree framing,
   // cliffs and architecture. The painting supplies its actual silhouette.
   const left=mound(.07,.73,.19,.30,1),right=mound(.94,.73,.19,.30,1),feature=clamp(Math.max(left,right),0,1);
   distance=mix(distance,spec.trees?45:spec.cave?55:70,feature*.84);
  }
  return eye.clone().addScaledVector(ray,clamp(distance,8,240));
 };
 for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const u=mix(-.38,1.38,x/cols),v=mix(-.32,1.28,y/rows),p=point(u,v);positions.push(...p.toArray());uvs.push((u-.5)*cropX+.5,(v-.5)*cropY+offsetY69);}
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geometry=geometry59(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const m=material59(new THREE.MeshBasicMaterial({map:c.resources.material.uniforms.map.value,side:THREE.DoubleSide,toneMapped:false}));
 m.onBeforeCompile=s=>{
  s.uniforms.stageTime59=q.time;s.uniforms.stageWater59=q.water;s.uniforms.stageFalls59=q.falls;s.uniforms.stageFoliage59=q.foliage;
  s.uniforms.stageFloor59={value:textures[spec.ruins||spec.cave?'stage59_stone':'stage59_clearing']??textures.earth};
  s.uniforms.stageFloorAverage59={value:stageAverage59(textures[spec.ruins||spec.cave?'stage59_stone':'stage59_clearing']??textures.earth)};
  s.vertexShader='varying vec3 stageWorld59;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nstageWorld59=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='uniform float stageTime59,stageWater59,stageFalls59,stageFoliage59;uniform sampler2D stageFloor59;uniform vec3 stageFloorAverage59;varying vec3 stageWorld59;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec2 sceneUV59=1.-abs(mod(vMapUv,2.)-1.);vec3 original59=texture2D(map,sceneUV59).rgb;
   float green59=smoothstep(.012,.095,original59.g-max(original59.r*.88,original59.b*.98));
   float canopy59=smoothstep(.40,.62,sceneUV59.y)*smoothstep(.15,.43,abs(sceneUV59.x-.5));
   float field59=1.-smoothstep(.22,.36,sceneUV59.y);
   sceneUV59.x+=green59*(canopy59*.0015+field59*.0006)*sin(stageTime59*.8+sceneUV59.y*35.+sceneUV59.x*21.)*stageFoliage59;
   float blue59=smoothstep(.02,.13,original59.b-original59.r)*smoothstep(.30,.40,sceneUV59.y)*(1.-smoothstep(.55,.60,sceneUV59.y))*stageWater59;
   float cascade59=stageFalls59*smoothstep(.48,.53,sceneUV59.x)*(1.-smoothstep(.69,.73,sceneUV59.x))*smoothstep(.52,.61,sceneUV59.y)*(1.-smoothstep(.92,.96,sceneUV59.y));
   sceneUV59.x+=sin(sceneUV59.y*240.+stageTime59*1.4)*.0014*blue59;
   sceneUV59.y+=sin(sceneUV59.y*110.+stageTime59*3.8+sceneUV59.x*24.)*.00055*cascade59;
   vec4 sampledDiffuseColor=texture2D(map,sceneUV59);
   float sparkle59=pow(max(0.,sin(sceneUV59.x*320.+sin(sceneUV59.y*90.)*3.+stageTime59*1.2)),22.)*pow(max(0.,sin(sceneUV59.y*290.-stageTime59*.9)),8.);
   sampledDiffuseColor.rgb+=blue59*sparkle59*.025;
   vec2 floorUV59=stageWorld59.xz*.095;
   vec3 nearGround59=mix(texture2D(stageFloor59,floorUV59).rgb,texture2D(stageFloor59,floorUV59*.87+vec2(.37,.63)).rgb,.5+.3*sin(stageWorld59.x*.13+sin(stageWorld59.z*.17)));
   float groundGrain59=clamp(dot(nearGround59,vec3(.24,.63,.13))/max(.025,dot(stageFloorAverage59,vec3(.24,.63,.13))),.85,1.15);
   sampledDiffuseColor.rgb*=mix(1.,groundGrain59,(1.-smoothstep(.0,.18,vMapUv.y))*.18);
   diffuseColor*=sampledDiffuseColor;
   #endif`);
 };m.customProgramCacheKey=()=> 'stage59-painted-landscape';
 const mesh=new THREE.Mesh(geometry,m);mesh.name='World-space PixelLab terrain and distant landscape';mesh.frustumCulled=false;q.group.add(mesh);q.landscape=mesh;q.reference=reference.clone();q.point=point;q.projector=new THREE.Matrix4().multiplyMatrices(q.reference.projectionMatrix,q.reference.matrixWorldInverse);q.crop=new THREE.Vector2(cropX,cropY);
 if(spec.water){
  // Thin water surfaces sit on the reconstructed lake/cascade. Their geometry
  // and flow remain in the landscape when the camera dollies or turns.
  for(const falling of spec.falls?[false,true]:[false]){
   const coords=[],waterUV=[],ii=[],nx=24,ny=falling?30:12,rect=falling?[.48,.53,.72,.93]:[.11,.35,.89,.59];
   for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){const u=mix(rect[0],rect[2],x/nx),v=mix(rect[1],rect[3],y/ny),p=point((u-.5)/cropX+.5,(v-offsetY69)/cropY+.5);p.lerp(eye,.00015);coords.push(...p.toArray());waterUV.push(u,v);}
   for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*(nx+1)+x,b=a+nx+1;ii.push(a,b,a+1,b,b+1,a+1);}
   const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(waterUV,2));g.setIndex(ii);
   const wm=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,uniforms:{map:{value:c.resources.material.uniforms.map.value},time:q.time,falling:{value:falling?1:0}},vertexShader:'uniform float time,falling;varying vec2 waterUV;void main(){waterUV=uv;vec3 p=position;p.y+=sin(time*.8+position.x*.7)*.012*(1.-falling);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:`uniform sampler2D map;uniform float time,falling;varying vec2 waterUV;
    void main(){vec3 c=texture2D(map,waterUV).rgb;float blue=smoothstep(.02,.14,c.b-c.r);float white=smoothstep(.42,.78,min(c.r,min(c.g,c.b)));float flow=pow(max(0.,sin(waterUV.y*(falling>0.?300.:230.)+time*(falling>0.?5.2:1.1)+sin(waterUV.x*180.)*2.)),16.);float mask=falling>0.?white:blue;gl_FragColor=vec4(mix(c,vec3(.77,.91,.96),.35),mask*flow*(falling>0.?.13:.075));
    #include <colorspace_fragment>
    }`}));const water=new THREE.Mesh(g,wm);water.frustumCulled=false;water.name=falling?'Flowing 3D waterfall':'Animated 3D water surface';q.group.add(water);
  }
 }
}
function buildStageScenery59(){
 const q=stageDepth59,c=encounter53;if(!c.active||!battle)return;
 if(q.group&&q.stage===c.selected&&Math.abs(q.aspect-camera.aspect)<.01)return;
 clearStageDepth59();q.stage=c.selected;q.aspect=camera.aspect;q.stats.builds++;q.group=new THREE.Group();q.group.name='Three-dimensional '+BATTLE_STAGES53[c.selected].name;c.scene.add(q.group);
 const spec=BATTLE_SCENERY59[c.selected],random=seeded(59000+Object.keys(BATTLE_SCENERY59).indexOf(c.selected)*701),night=c.phase55==='night',baseY=c.floorY;
 for(const key of['stage59_clearing','stage59_stone','stage59_canopy','stage59_pine']){const t=textures[key];if(t){t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=4;t.needsUpdate=true;}}
 q.water.value=spec.water?1:0;q.falls.value=spec.falls?1:0;q.foliage.value=spec.cave||spec.snow?0:1;
 c.resources.backdrop.visible=false;c.resources.floor.visible=true;
 makeStageLandscape59(camera,spec);
 // The native painted tree crowns and boulders are reconstructed into the
 // depth surface. Additional foliage only supplies fine near-ground motion;
 // no repeated spheres, cones, floating rocks or oversized plant clumps.
 const grassPositions=[],grassColors=[];
 for(let i=0;i<5;i++){const a=i*2.399,x=Math.cos(a)*.035,z=Math.sin(a)*.035,h=.09+random()*.11,w=.008+random()*.008,dx=Math.cos(a)*h*.25,dz=Math.sin(a)*h*.25;grassPositions.push(x-w,0,z,x+w,0,z,x+dx,h,z+dz);for(let j=0;j<3;j++)grassColors.push(j===2?.85:.58,j===2?.96:.72,.35);}
 const grassGeo=geometry59(new THREE.BufferGeometry());grassGeo.setAttribute('position',new THREE.Float32BufferAttribute(grassPositions,3));grassGeo.setAttribute('color',new THREE.Float32BufferAttribute(grassColors,3));grassGeo.computeVertexNormals();
 const gm=stageMaterial59(null,spec.snow?'#bbc6c9':spec.trees==='autumn'?'#8b803d':'#697c3d',true);gm.vertexColors=true;gm.color.set(spec.snow?'#bbc6c9':spec.trees==='autumn'?'#8b803d':'#697c3d');
 const count=spec.snow||spec.cave?0:Math.min(100,Math.floor(spec.grass*.38)),grass=new THREE.InstancedMesh(grassGeo,gm,count),matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();
 for(let i=0;i<count;i++){const u=.05+random()*.90,v=.025+random()*.11,ray=V3((u-.5)*2,(v-.5)*2,.5).unproject(q.reference).sub(q.reference.position).normalize(),t=(baseY-q.reference.position.y)/ray.y,p=q.reference.position.clone().addScaledVector(ray,t);rotation.setFromAxisAngle(V3(0,1,0),random()*TAU);const scale=.6+random()*.5;matrix.compose(p,rotation,V3(scale,scale,scale));grass.setMatrixAt(i,matrix);}
 grass.name='Fine wind-swaying 3D grass';grass.frustumCulled=false;grass.castShadow=false;grass.receiveShadow=true;q.group.add(grass);
 let physicalRocks=0;
 if(['waterfall','woodland','ruins','cavern','mountain','snow','coast','grassFlowers','grassStones'].includes(c.selected)){
  const geometry=geometry59(new THREE.IcosahedronGeometry(1,2)),pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),n=1+.12*Math.sin(x*6+z*4)*Math.cos(y*7-z*3);pos.setXYZ(i,x*n,Math.max(-.65,y*n),z*n);}geometry.computeVertexNormals();
  const rocks=new THREE.InstancedMesh(geometry,stageMaterial59('rock',spec.stone),2);
  for(let i=0;i<2;i++){const u=i?.975:.025,v=.018,ray=V3((u-.5)*2,(v-.5)*2,.5).unproject(q.reference).sub(q.reference.position).normalize(),t=(baseY-q.reference.position.y)/ray.y,p=q.reference.position.clone().addScaledVector(ray,t),s=.8;rotation.setFromAxisAngle(V3(0,1,0),i*1.7);p.y=baseY+s*.4;matrix.compose(p,rotation,V3(s*1.3,s*.65,s));rocks.setMatrixAt(i,matrix);q.occluders.push(new THREE.Box3(V3(p.x-s*1.3,baseY,p.z-s),V3(p.x+s*1.3,baseY+s*1.1,p.z+s)));}
  rocks.name='3D rocks';rocks.castShadow=false;rocks.receiveShadow=true;rocks.frustumCulled=false;q.group.add(rocks);physicalRocks=2;
 }
 q.group.updateMatrixWorld(true);q.summary={reconstructedTrees:!!spec.trees,reconstructedRocks:true,physicalRocks,grass:count,water:!!spec.water,falls:!!spec.falls,meshes:q.group.children.length};

}
function stageCameraClear59(p,cast){
 const q=stageDepth59;if(!q.group)return true;const ray=new THREE.Ray();for(const a of cast){const target=V3(a.x,a.mesh.position.y+a.size*.55,a.z),length=p.distanceTo(target);ray.set(p,target.clone().sub(p).normalize());for(const box of q.occluders){if(box.containsPoint(p))return false;const hit=ray.intersectBox(box,V3());if(hit&&hit.distanceTo(p)<length-.9)return false;}}return true;
}
const depthActivateBefore59=activateStage53;activateStage53=function(...args){clearStageDepth59();return depthActivateBefore59(...args);};
const depthDeactivateBefore59=deactivateStage53;deactivateStage53=function(...args){clearStageDepth59();return depthDeactivateBefore59(...args);};
const depthCameraBefore59=updateCamera;updateCamera=function(...args){const r=depthCameraBefore59(...args);if(encounter53.active&&battle)buildStageScenery59();return r;};
const depthRenderBefore59=render;render=function(...args){stageDepth59.time.value=clock;return depthRenderBefore59(...args);};
const depthBootBefore59=boot;boot=async function(...args){const r=await depthBootBefore59(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const data=JSON.parse(before());data.battleScenery={active:!!stageDepth59.group,stage:stageDepth59.stage,worldSpace:true,details:stageDepth59.summary,stats:{...stageDepth59.stats}};return JSON.stringify(data);};return r;};
