// Travel-scale artwork is sampled in world coordinates. Routes, water depth,
// trees and landmark entrances still use the authored terrain and transforms.
const valenneArt={woodland:null,surfaces:null,river:null,loading:null};
const travelArtLoad=loadAssets;
loadAssets=async function(...args){
 const result=await travelArtLoad.apply(this,args);
 if(!valenneArt.loading)valenneArt.loading=loadValenneArt().catch(error=>{
  console.warn('The Valenne travel artwork could not load.',error);
  valenneArt.loading=null;
 });
 await valenneArt.loading;
 return result;
};
async function loadValenneArt(){
 const folder='elyndor/assets/valenne-travel/';
 const names=['woodland','meadow-and-stone','landscape'];
 const images=await Promise.all(names.map(async name=>{
  const image=new Image();image.src=folder+name+'.webp';await image.decode();return image;
 }));
 const source=images[1],canvas=document.createElement('canvas');
 canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
 const t=new THREE.DataArrayTexture(new Uint8Array(pixels.data.buffer),canvas.width,canvas.width,canvas.height/canvas.width);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;
 t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 t.userData.pinnedMap17=true;t.needsUpdate=true;valenneArt.surfaces=t;
 const trees=new THREE.Texture(images[0]);trees.colorSpace=THREE.SRGBColorSpace;
 trees.userData.pinnedMap17=true;trees.needsUpdate=true;valenneArt.woodland=trees;
 // Retain the original blue pigment and fine brushwork at their native resolution.
 const landscape=images[2],tile=landscape.width,strip=document.createElement('canvas');
 strip.width=strip.height=tile;
 strip.getContext('2d').drawImage(landscape,0,3*tile,tile,tile,0,0,tile,tile);
 const river=new THREE.CanvasTexture(strip);river.flipY=false;river.colorSpace=THREE.SRGBColorSpace;
 river.wrapS=river.wrapT=THREE.RepeatWrapping;river.anisotropy=t.anisotropy;
 river.userData.pinnedMap17=true;valenneArt.river=river;
}

// The grove biases the species mix; the individual roll keeps neighbours distinct.
function valenneTreeStyle(t){
 if(!valenneArt.surfaces||Math.max(...climateAt105(t.x,t.z))>.48)return null;
 const seed=Math.sin(t.x*19.13+t.z*73.29)*42751.23,roll=seed-Math.floor(seed);
 const grove=groundNoise104(t.x*.045,t.z*.045);
 if(t.species30===4)return roll<.67?'spruce':'pine';
 if(t.species30===3&&roll<.53)return 'willow';
 if(t.species30===1&&roll<.62)return 'birch';
 if(roll<.19)return grove>.5?'pine':'spruce';
 if(roll<.39)return grove>.48?'birch':'willow';
 return roll<.68?'oak':'maple';
}
const valenneCrowns=['oak','birch','willow','spruce','maple','pine'];
function valenneTreePlane(height){
 const key='valenne-woodland-plane-'+height;
 if(sharedGeo[key])return sharedGeo[key];
 const h=height,g=new THREE.PlaneGeometry(h,h);
 g.translate(0,h/2-h*6/256,0);
 g.computeBoundingBox();g.boundingBox.min.z=g.boundingBox.min.x;g.boundingBox.max.z=g.boundingBox.max.x;g.computeBoundingSphere();
 return sharedGeo[key]=g;
}
// The shadow camera must cast the same physical leaf card that the player sees.
const valenneCrownRight={value:V3(1,0,0)};
const valenneRenderBefore=render;
render=function(...args){
 if(activeScene?.kind==='overworld'){
  camera.updateMatrixWorld();valenneCrownRight.value.setFromMatrixColumn(camera.matrixWorld,0);
  valenneCrownRight.value.y=0;valenneCrownRight.value.normalize();
 }
 return valenneRenderBefore.apply(this,args);
};
function valenneTreeMaterial(depth=false){
 const options={map:valenneArt.woodland,alphaTest:.26,side:THREE.DoubleSide};
 const m=depth?new THREE.MeshDepthMaterial({...options,depthPacking:THREE.RGBADepthPacking}):
  new THREE.MeshStandardMaterial({...options,roughness:1,metalness:0,envMapIntensity:.1});
 m.userData.treeViewCompiled=true;
 m.onBeforeCompile=s=>{
  s.uniforms.travelMain=forest30.main;s.uniforms.crownRight=valenneCrownRight;
  s.vertexShader='uniform vec3 crownRight; attribute float crownCell; attribute float treeViewHidden; uniform float travelMain;\n'+s.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
   float cell=floor(crownCell);vec2 treeUV=uv;
   if(fract(crownCell)>.25)treeUV.x=1.-treeUV.x;
   vMapUv=(treeUV+vec2(mod(cell,4.),1.-floor(cell/4.)))/vec2(4.,2.);`).replace('#include <begin_vertex>',`
   #include <begin_vertex>
   vec3 side=${depth?'crownRight':'normalize(vec3(viewMatrix[0][0],0.,viewMatrix[2][0])+vec3(1e-7,0.,0.))'};
   transformed.x=position.x*dot(side,instanceMatrix[0].xyz/max(length(instanceMatrix[0].xyz),.00001));
   transformed.z=position.x*dot(side,instanceMatrix[2].xyz/max(length(instanceMatrix[2].xyz),.00001));
   ${depth?'':'if(treeViewHidden>.5&&travelMain>.5)transformed=vec3(0.);'}`);
  if(!depth){
   s.vertexShader='varying vec2 crownUV; varying float conifer;\n'+s.vertexShader.replace('float cell=floor(crownCell);',
    'crownUV=uv;float cell=floor(crownCell);conifer=(cell==3.||cell==5.)?1.:0.;');
   s.uniforms.canopySun=weather.sun;
   // Receive shadows on the sun-facing surface of the crown. Reading the
   // shadow map on the paper-thin centre plane causes striped self-shadow.
   s.vertexShader='uniform vec3 canopySun;\n'+s.vertexShader.replace('#include <shadowmap_vertex>',`
    #ifdef USE_SHADOWMAP
     vec3 crownLift=canopySun*(.16+.58*uv.y)*length(instanceMatrix[1].xyz);
     worldPosition.xyz+=crownLift;
    #endif
    #include <shadowmap_vertex>
    #ifdef USE_SHADOWMAP
     worldPosition.xyz-=crownLift;
    #endif`);
   s.fragmentShader='varying vec2 crownUV; varying float conifer;\n'+s.fragmentShader.replace('#include <map_fragment>',`
   #include <map_fragment>
   vec3 pigment=diffuseColor.rgb;
   float foliage=smoothstep(-.025,.08,pigment.g-pigment.b)*smoothstep(.07,.33,crownUV.y);
   vec3 leafTint=mix(vec3(.36,.61,.34),vec3(.27,.53,.47),conifer);
   diffuseColor.rgb*=mix(vec3(.52,.51,.46),leafTint,foliage);
   diffuseColor.rgb*=mix(.71,1.04,smoothstep(.12,.77,crownUV.y));`).replace('#include <normal_fragment_maps>',`
   #include <normal_fragment_maps>
   // A rounded crown catches the same sun and sky as the meadow. Its normals
   // follow the visible canopy even as the camera-facing leaf card turns.
   vec2 shell=clamp(vec2((crownUV.x-.5)*2.,(crownUV.y-.49)*2.),-1.,1.);
   vec3 right=normalize(vec3(viewMatrix[0][0],0.,viewMatrix[2][0])+vec3(1.e-7,0.,0.));
   vec3 facing=cross(right,vec3(0.,1.,0.));
   vec3 canopy=normalize(right*shell.x*.76+vec3(0.,.66+shell.y*.56,0.)+facing*(.55-.23*dot(shell,shell)));
   normal=normalize(mat3(viewMatrix)*canopy);`);
  }
 };
 m.customProgramCacheKey=()=>depth?'valenne-tree-shadow':'valenne-lit-canopy';
 if(!depth)addCloudLighting(m);return m;
}

const valenneGroundBefore=groundMaterial102;
groundMaterial102=function(material){
 const r=valenneGroundBefore.apply(this,arguments);
 if(activeScene?.kind!=='overworld'||!valenneArt.surfaces||!material?.userData.ground102||material.userData.valenneMeadow)return r;
 material.userData.valenneMeadow=true;
 const before=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=function(s,...args){
  before.call(this,s,...args);
  // Both original uniforms sample the same texture array. Share their unit
  // to keep the travel shader within the existing mobile sampler budget.
  s.fragmentShader=s.fragmentShader.replace(/uniform highp sampler2DArray (worldGround102|variationArt104);/g,'').replace(/\bvariationArt104\b/g,'worldGround102');
  s.uniforms.travelSurface={value:valenneArt.surfaces};
  s.fragmentShader='uniform highp sampler2DArray worldGround102,travelSurface;\n'+s.fragmentShader.replace('float lum=dot(result,vec3(.2126,.7152,.0722));',`
   // Plan-view clover and moss use equal world units on both axes. A second
   // orientation drifts in over broad patches instead of warping the texels.
   float meadow=(1.-path)*(1.-smoothstep(.17,.45,slope))*
      (1.-smoothstep(.15,.78,max(max(climate.r,climate.g),max(climate.b,climate.a))));
   vec2 sodUV=p.xz*.080;
   vec3 clover=texture(travelSurface,vec3(sodUV,0.)).rgb;
   vec3 moss=texture(travelSurface,vec3(mat2(.60,.80,-.80,.60)*sodUV*1.36+vec2(.37,.63),0.)).rgb;
   vec3 bed=mix(clover,moss,smoothstep(.29,.72,broad+(fine-.5)*.18));
   bed*=mix(vec3(.97,1.30,1.16),vec3(1.35,1.52,1.06),smoothstep(.26,.75,broad));
   result=mix(result,bed,meadow*.76);
   vec2 laneUV=mat2(.86,.51,-.51,.86)*p.xz*vec2(.087,.112)+.19*vec2(broad,fine);
   vec3 flagstones=texture(travelSurface,vec3(laneUV,1.)).rgb*vec3(1.94,1.80,1.50);
   result=mix(result,flagstones,path*(1.-climate.r*.8)*.94);
   float lum=dot(result,vec3(.2126,.7152,.0722));`);
 };
 material.customProgramCacheKey=()=>key+'-valenne-painted-earth';material.needsUpdate=true;return r;
};

// Distances across the channel and travel time along it form a continuous
// surface coordinate frame. A second on this axis covers more ground in a
// narrow reach. Accumulating travel time also keeps the crests stable on bends.
function valenneRiverCoordinates(mesh){
 const geometry=mesh.geometry;
 if(geometry.hasAttribute('riverFrame'))return;
 // The five authored drainages are followed by unordered lake skeletons in the atlas.
 const reaches=MACRO_RIVERS15.slice(0,5).map(points=>{
  let elapsed=0;
  const segments=[];
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
   if(!length)continue;
   const width=(a.width+b.width)*.5,speed=1.52-.57*smooth(2.6,7.7,width);
   segments.push({a,b,tx:dx/length,tz:dz/length,length,speed,start:elapsed});
   elapsed+=length/speed;
  }
  return {segments,elapsed};
 });
 // Align tributary clocks with the receiving reach at the actual confluences.
 const main=reaches[0].segments,joins=[];
 for(const branch of reaches.slice(1)){
  const end=branch.segments.at(-1).b;
  let nearest=Infinity,joinTime=0;
  for(const s of main){
   const u=clamp((end.x-s.a.x)*s.tx+(end.z-s.a.z)*s.tz,0,s.length);
   const d=Math.hypot(end.x-s.a.x-u*s.tx,end.z-s.a.z-u*s.tz);
   if(d<nearest){nearest=d;joinTime=s.start+u/s.speed;}
  }
  if(nearest>1.5)continue;
  joins.push(end);
  for(const s of branch.segments)s.start+=joinTime-branch.elapsed;
 }
 const byStart=new WeakMap();
 for(const r of reaches)for(const s of r.segments)byStart.set(s.a,s);
 const positions=geometry.getAttribute('position'),frame=new Float32Array(positions.count*4);
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i)+mesh.position.x,z=positions.getZ(i)+mesh.position.z;
  const candidates=MACRO_RIVER_GRID15.get(Math.floor(x/32)+','+Math.floor(z/32));
  let closest=Infinity,segment,along=0;
  for(const entry of candidates??[]){
   const s=byStart.get(entry.a);
   if(!s)continue;
   const dx=x-s.a.x,dz=z-s.a.z,projected=dx*s.tx+dz*s.tz,u=clamp(projected,0,s.length);
   const d=(dx-u*s.tx)**2+(dz-u*s.tz)**2;
   if(d<closest){closest=d;segment=s;along=projected;}
  }
  if(!segment)continue;
  const {a,b,tx,tz,length,speed,start}=segment,across=(z-a.z)*tx-(x-a.x)*tz;
  const width=mix(a.width,b.width,clamp(along/length,0,1)),distance=Math.sqrt(closest);
  let influence=1-smooth(width+1.2,width+8,distance);
  for(const join of joins)influence*=.58+.42*smooth(2,10,Math.hypot(x-join.x,z-join.z));
  frame.set([start+along/speed,across,Math.min(1,Math.abs(across)/Math.max(.5,width)),influence],4*i);
 }
 geometry.setAttribute('riverFrame',new THREE.BufferAttribute(frame,4));
}

// Each overlapping packet has its own wavelength, heading and curvature. Its
// envelope and individual crests travel at slightly different speeds.
const valenneWavePackets=`
 varying vec4 channelFrame;
 uniform sampler2D riverPainting;
 vec4 packetRandom(vec2 cell){
  vec4 h=fract(cell.xyxy*vec4(.1031,.0973,.1099,.1137));
  h+=dot(h,h.wzxy+33.33);
  return fract((h.xxyz+h.yzzw)*h.zywx);
 }
 // Triangular patches shuffle the painting without introducing rectangular
 // seams. Explicit gradients keep its brush edges crisp across patch borders.
 vec3 paintedPatch(vec2 uv,vec2 cell,vec2 dx,vec2 dy,float bank){
  vec4 r=packetRandom(cell+vec2(27.,53.));
  vec2 origin=vec2((cell.x+.5*cell.y)/2.23,cell.y/2.58);
  float angle=mix(1.31,.08,max(smoothstep(.42,.94,bank),.63*r.x*r.x))+(r.z-.5)*.64;
  float cs=cos(angle),sn=sin(angle);
  mat2 brush=mat2(cs,-sn,sn,cs)*mat2(.85+.45*r.x,0.,.17*(r.z-.5),.82+.4*r.w);
  vec2 offset=brush*(uv-origin),q=offset+r.yz;
  // Most patches use uninterrupted strokes. Occasionally expose one curved
  // lip from the painting, stretched and tipped with that patch's current.
  float curl=step(.77,r.w);
  vec2 body=vec2(.112+.776*fract(q.x),q.y);
  vec2 rim=vec2(.052+.036*r.x,.25+.036*(r.y-.5))+offset*vec2(.71,1.24);
  vec2 scale=mix(vec2(.776,1.),vec2(.71,1.24),curl);
  return textureGrad(riverPainting,mix(body,rim,curl),(brush*dx)*scale,(brush*dy)*scale).rgb;
 }
 vec3 brokenPainting(vec2 uv,float bank){
  vec2 dx=dFdx(uv),dy=dFdy(uv),p=mat2(2.23,0.,-1.29,2.58)*uv;
  vec2 cell=floor(p),f=fract(p);
  float halfCell=step(1.,f.x+f.y);
  vec3 weights=abs(vec3(1.-f.x-f.y,f.x-halfCell,f.y-halfCell));
  weights*=weights;weights/=dot(weights,vec3(1.));
  return weights.x*paintedPatch(uv,cell+halfCell,dx,dy,bank)
        +weights.y*paintedPatch(uv,cell+vec2(1.-halfCell,halfCell),dx,dy,bank)
        +weights.z*paintedPatch(uv,cell+vec2(halfCell,1.-halfCell),dx,dy,bank);
 }
 float riverPackets(vec2 coord,float time){
  vec2 grid=(coord-vec2(time,0.))/vec2(4.7,3.35),base=floor(grid),f=fract(grid);
  float slope=0.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
   vec2 cell=vec2(float(x),float(y));
   vec4 r=packetRandom(base+cell);
   vec2 d=f-cell-(.12+.76*r.xy);
   float w=max(0.,1.-dot(d*d,vec2(1.08,1.48)));
   float phase=d.x*mix(12.,24.,r.z)+d.y*((r.w-.5)*5.+d.y*(r.x-.5)*13.);
   slope+=w*w*cos(phase+6.283*r.y-time*(.31+.63*r.w));
  }
  return slope;
 }`;

const valenneRiverBefore=waterMaterial62;
waterMaterial62=function(o,...args){
 const m=valenneRiverBefore.call(this,o,...args);
 if(activeScene?.kind!=='overworld'||!o.userData.freshwater38||!valenneArt.river)return m;
 valenneRiverCoordinates(o);
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(shader,...params){
  before.call(this,shader,...params);
  shader.uniforms.riverPainting={value:valenneArt.river};
  shader.vertexShader='attribute vec4 riverFrame; varying vec4 channelFrame;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nchannelFrame=riverFrame;');
  shader.fragmentShader=valenneWavePackets+shader.fragmentShader.replace('#include <tonemapping_fragment>',`
   vec2 channel=channelFrame.xy,p=worldWater62.xz;
   float bank=channelFrame.z,river=channelFrame.w;
   vec2 drift=normalize(vec2(.08,.12));
   vec2 pool=vec2(dot(p,drift),dot(p,vec2(-drift.y,drift.x)));
   float daylight=day62,clearSun=daylight*(1.-.69*cloud62);
   float shelf=exp(-.52*waterDepth62),exposure=noise62(p*.074+vec2(81.,49.));
   float riffle=clamp(.21+.59*smoothstep(.24,.78,exposure)+.21*shelf,0.,1.);
   float broad=noise62(pool*vec2(.31,.18)-vec2(.13*time62,0.));
   vec2 footprint=fwidth(channel);
   float fineDetail=1.-smoothstep(.14,.66,max(footprint.x,footprint.y));
   float waveDetail=1.-smoothstep(.32,1.45,footprint.x);
   float slope=.0,fine=.0,ribbons=.0;
   if(river>.001){
    slope=riverPackets(channel*vec2(1.63,1.24),time62*1.63)*waveDetail;
    vec2 moving=channel-vec2(time62*1.09,0.);
    vec2 warp=vec2(noise62(moving*vec2(.43,.58)+7.),noise62(moving*vec2(.19,.34)-21.));
    fine=noise62(vec2(2.7*moving.x+.46*moving.y,.83*moving.y)+2.45*warp)-.5;
    fine*=fineDetail;
    vec2 margin=channel-vec2(.69*time62,0.);
    float meander=noise62(margin*vec2(.17,.32)+37.);
    float strand=noise62(vec2(.32*margin.x,2.9*margin.y+3.7*meander));
    ribbons=smoothstep(.58,.88,strand)*smoothstep(.32,.73,meander)*(.15+.85*bank*bank);
   }
   float poolSlope=(broad-.5)*1.5+(noise62(pool*vec2(1.36,.57)-vec2(.41*time62,0.))-.5)*.58;
   vec2 paintCoord=channel-vec2(time62*.96,0.);
   vec2 brushWarp=vec2(noise62(paintCoord*vec2(.13,.23)+6.),noise62(paintCoord*vec2(.22,.14)-18.))-.5;
   vec2 brushUV=paintCoord*vec2(.064,.121)+brushWarp*vec2(.09,.14);
   vec3 ink=brokenPainting(brushUV,bank);
   vec3 lakeInk=brokenPainting(pool*vec2(.050,.073)-vec2(.019*time62,0.)+.08*broad,.9);
   ink=mix(lakeInk,ink,river);
   ink*=.65+smoothstep(.011,.082,dot(ink,vec3(.21,.72,.07)))*1.12;
   ink*=mix(vec3(1.83,.91,.43),vec3(1.99,1.42,.93),daylight);
   float facet=mix(poolSlope,slope,river);
   float signedFace=facet*(.49+.51*riffle)+river*fine*(.55+.76*riffle);
   float edgeGlint=smoothstep(.39,.99,signedFace);
   vec3 pigment=mix(vec3(.009,.032,.058),vec3(.027,.074,.082),shelf);
   pigment*=.78+.23*exposure+.18*broad;
   vec3 waterColour=pigment*mix(vec3(.41,.49,.68),vec3(1.),daylight);
   vec3 sheen=mix(vec3(.039,.063,.11),vec3(.115,.184,.216),daylight);
   sheen*=.72+.43*sky62;
   waterColour=mix(waterColour,ink,.82)*(.99+.12*clamp(signedFace,-1.,1.));
   float brokenCrest=edgeGlint*(.12+.88*riffle)*(.48+.52*smoothstep(.017,.072,dot(ink,vec3(.21,.72,.07))));
   waterColour+=sheen*(brokenCrest*(.14+.22*clearSun)+.14*ribbons*river);
   if(reflect62>.5){
    vec2 dir=normalize(flow62+vec2(.0001));
    vec2 uv=reflected62.xy/max(.001,reflected62.w)+.008*(dir*facet+vec2(-dir.y,dir.x)*fine);
    float facing=1.-max(0.,view62.y);
    waterColour=mix(waterColour,texture2D(mirror62,clamp(uv,.002,.998)).rgb,mirrorCoverage62(reflected62)*(.045+.16*facing*facing));
   }
   vec2 downstream=normalize(mix(drift,flow62,river)+vec2(.0001));
   vec2 tilted=downstream*facet*.22+vec2(-downstream.y,downstream.x)*fine*.19;
   vec3 waveNormal=normalize(vec3(tilted.x,1.,tilted.y));
   float sunFlash=pow(max(0.,dot(waveNormal,half62)),112.)*clearSun*keyPower62;
   gl_FragColor.rgb=waterColour+key62*(.12*sunFlash);
   #include <tonemapping_fragment>`);
 };
 m.customProgramCacheKey=()=>key+'-valenne-channel-waves';m.needsUpdate=true;return m;
};

// The live world and the atlas share the detailed geometry. Keep the original
// root and its game-owned footprint and entrance records through scene swaps.
const landmarkModels=new Map(),landmarkInstances=new WeakMap();
function installRegionalLandmark(root,template,site,atlas){
 if(!root||landmarkInstances.has(root))return;
 const retired=new THREE.Group();retired.add(...root.children.slice());retired.visible=false;root.add(retired);
 const model=template.clone(true);root.add(model);model.position.y-=root.position.y;
 model.traverse(o=>{
  if(!o.isMesh)return;
  if(atlas){holdAtlas67(o.geometry);holdMaterial67(o.material);}
  else o.material=playerRevealMaterial(o.material);
 });
 model.updateWorldMatrix(true,true);
 const bounds=new THREE.Box3().setFromObject(model);
 root.userData.atlasBounds118=bounds;root.userData.travelNameAnchor=V3(site.x-1,bounds.max.y+.75,site.z);
 if(atlas)exactAtlas67.landmarks.set(site.key,bounds.clone());
 else{
  const lamps=world.userData.landmarkLamps??=[];
  for(const [x,y,z,tint] of template.userData.lampSources)lamps.push({at:model.localToWorld(V3(x,y,z)),tint});
 }
 landmarkInstances.set(root,{wheel:model.getObjectByName('Brookstead waterwheel')});
}
const valenneBuildBefore=buildWorld;
buildWorld=function(...args){
 const result=valenneBuildBefore.apply(this,args);
 if(activeScene?.kind==='overworld'){
  for(const [key,site] of dioramas67.sites){
   const live=world.userData.landmarks45?.[key];if(!live)continue;
   let template=landmarkModels.get(key);
   if(!template){template=buildLandmarkModel(site,key,live.userData.siteFootprints45).model;landmarkModels.set(key,template);}
   installRegionalLandmark(live,template,site,false);
   installRegionalLandmark(exactAtlas67.scene?.getObjectByName(live.name),template,site,true);
  }
  sun.shadow.needsUpdate=renderer.shadowMap.needsUpdate=true;
 }
 return result;
};
// One practical light follows the nearest visible cluster. Windows and crystals
// everywhere else still feed the HDR bloom pass through their own emissive maps.
function updateLandmarkLight(){
 const sources=world?.userData.landmarkLamps;
 if(!sources?.length||activeScene?.kind!=='overworld'||!player)return;
 let light=world.userData.landmarkPractical;
 if(!light){
  light=new THREE.PointLight(0xffbb77,0,13,2);light.name='Nearest landmark light';
  world.add(light);world.userData.landmarkPractical=light;
 }
 const day=celestial31.day.value;
 if(day>.94){light.intensity=0;return;}
 if(light.userData.nextCheck>clock&&light.userData.nextCheck<clock+1)return;
 light.userData.nextCheck=clock+.15;
 let closest=null,best=70*70;
 for(const s of sources){
  const d=(player.x-s.at.x)**2+(player.z-s.at.z)**2;if(d<best){best=d;closest=s;}
 }
 light.intensity=closest?18*(1-day)**1.3*(1-THREE.MathUtils.smoothstep(Math.sqrt(best),45,70)):0;
 if(closest){light.position.copy(closest.at);light.position.y+=.35;light.color.set(closest.tint);}
}
const valenneLabelsBefore=updateWorldLabels44;
updateWorldLabels44=function(){
 valenneLabelsBefore();
 updateLandmarkLight();
 const brook=world?.userData.landmarks45?.brookstead,wheel=brook&&landmarkInstances.get(brook)?.wheel;
 if(wheel)wheel.rotation.z=clock*.38;
 if(worldLabels44.classList.contains('hidden'))return;
 for(const label of worldLabels44.children){
  if(label.classList.contains('hidden'))continue;
  const anchor=world.userData.landmarks45?.[label.dataset.poi]?.userData.travelNameAnchor;
  if(!anchor)continue;
  const pos=anchor.clone().project(camera);
  label.style.left=(pos.x*.5+.5)*innerWidth+'px';label.style.top=(.5-pos.y*.5)*innerHeight+'px';
 }
};

const valenneDeckBefore=joinedBridgeDeck38;
joinedBridgeDeck38=function(b){
 const first=world.children.length,result=valenneDeckBefore.apply(this,arguments);
 if(activeScene?.kind!=='overworld'||!valenneArt.surfaces)return result;
 for(const deck of world.children.slice(first)){
  if(!deck.isMesh||!deck.material.isMeshStandardMaterial)continue;
  const m=deck.material,compile=m.onBeforeCompile,cache=m.customProgramCacheKey();m.color.set('#cfd8dc');m.roughness=.79;
  m.onBeforeCompile=function(s,...args){
   compile.call(this,s,...args);s.uniforms.travelSurface={value:valenneArt.surfaces};
   s.uniforms.deckAxis={value:new THREE.Vector2(Math.cos(b.angle),Math.sin(b.angle))};
   s.vertexShader='varying vec2 deckXZ;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ndeckXZ=(modelMatrix*vec4(position,1.)).xz;');
   s.fragmentShader='uniform highp sampler2DArray travelSurface;uniform vec2 deckAxis;varying vec2 deckXZ;\n'+s.fragmentShader.replace('#include <map_fragment>',`
    vec2 paving=vec2(dot(deckXZ,deckAxis)*.12,dot(deckXZ,vec2(-deckAxis.y,deckAxis.x))*.23);
    diffuseColor.rgb*=texture(travelSurface,vec3(paving,2.)).rgb*3.25;`);
  };m.customProgramCacheKey=()=>cache+'-valenne-bridge-stone';m.needsUpdate=true;
 }
 return result;
};
