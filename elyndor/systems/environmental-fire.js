// Ordinary fires have a common optical treatment. Their opening, fuel and
// intensity control the silhouette. Combat spell effects use their own art.
const ENVIRONMENT_FIRE163={
 hearth:{width:1.74,height:1.77,heat:1.05,embers:1,smoke:1,speed:1},
 inn:{width:2.36,height:2.23,heat:1.12,embers:1,smoke:1,speed:.88},
 forge:{width:1.40,height:1.11,heat:1.34,embers:1,smoke:.65,speed:1.32},
 torch:{width:.61,height:1.05,heat:1.06,embers:.48,smoke:.24,speed:1.18},
 candle:{width:.18,height:.31,heat:.84,embers:0,smoke:0,speed:.54}
};
function environmentFire163(parent,kind,x,y,z,scale=1){
 const profile=ENVIRONMENT_FIRE163[kind],seed=(x*2.31+z*1.27+y*.35)%43;
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{
  time:windUniforms.time,seed:{value:seed},heat:{value:profile.heat},
  embers:{value:profile.embers},smoke:{value:profile.smoke},speed:{value:profile.speed}
 },vertexShader:`
 varying vec2 fireUv; varying float fireDistance;
 void main(){
  fireUv=uv;vec3 base=modelMatrix[3].xyz;
  vec3 eye=cameraPosition-base;
  vec2 heading=normalize(vec2(eye.z,-eye.x)+vec2(.0001));
  vec3 p=base+vec3(heading.x,0.,heading.y)*position.x*length(modelMatrix[0].xyz);
  p.y+=position.y*length(modelMatrix[1].xyz);
  vec4 v=viewMatrix*vec4(p,1.);fireDistance=-v.z;gl_Position=projectionMatrix*v;
 }`,fragmentShader:`
 uniform float time,seed,heat,embers,smoke,speed;
 varying vec2 fireUv; varying float fireDistance;
 float gasNoise(vec2 p){
  vec2 cell=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  vec4 corners=fract(sin(vec4(dot(cell,vec2(81.7,249.9)),dot(cell+vec2(1.,0.),vec2(81.7,249.9)),
   dot(cell+vec2(0.,1.),vec2(81.7,249.9)),dot(cell+1.,vec2(81.7,249.9))))*4328.159);
  return mix(mix(corners.x,corners.y,f.x),mix(corners.z,corners.w,f.x),f.y);
 }
 vec2 ribbon(vec2 p,float root,float width,float height,float phase,float t){
  float y=p.y/height;
  float fold=y*(.084*sin(p.y*8.7-t*3.8+phase)+.052*sin(p.y*20.-t*5.5+phase));
  float filaments=gasNoise(vec2(p.x*23.+phase,p.y*16.-t*3.6));
  fold+=y*y*(filaments-.5)*.16;
  float r=width*pow(max(.015,1.-y),.91)*(.71+.29*filaments);
  float u=(p.x-root-fold)/max(.009,r);
  float aa=min(.65,max(.035,fwidth(u)*.60));
  float rise=smoothstep(-.012,.036,y)*(1.-smoothstep(.66,1.,y));
  float contour=(1.-smoothstep(1.-aa,1.+aa,abs(u)))*rise;
  float ribbonCenter=.23*sin(p.y*20.-t*4.2+phase)+.13*sin(p.y*37.-t*5.1+phase);
  float hot=(1.-smoothstep(.035,.25+aa*.57,abs(u-ribbonCenter)))*contour;
  return vec2(contour,hot);
 }
 void main(){
  vec2 p=fireUv-vec2(.5,0.);float t=time*speed+seed;
  vec2 rear=ribbon(p,-.18,.155,.65+.12*sin(t*2.1),1.4,t);
  vec2 tall=ribbon(p,.045,.179,.89+.11*sin(t*2.7+.9),3.2,t);
  vec2 right=ribbon(p,.22,.128,.59+.14*sin(t*2.5+2.),5.2,t);
  vec2 lead=ribbon(p,-.08,.148,.56+.13*sin(t*3.6+1.8),6.1,t*1.10);
  vec2 base=ribbon(p,.09,.158,.39+.08*sin(t*4.+3.),.1,t*1.15);
  vec2 left=ribbon(p,-.25,.118,.36+.09*sin(t*3.2+.8),2.1,t*1.06);
  float body=1.-(1.-rear.x*.60)*(1.-tall.x*.66)*(1.-right.x*.62)*(1.-lead.x*.73)*(1.-base.x*.69)*(1.-left.x*.56);
  float hot=max(max(rear.y,tall.y)*.69,max(right.y*.73,max(max(lead.y,base.y),left.y*.63)));
  float heel=1.-smoothstep(.02,.52,p.y);
  float gas=gasNoise(vec2(p.x*23.+sin(p.y*8.-t)*.9,p.y*9.-t*2.6));
  gas=.73*gas+.27*gasNoise(vec2(p.x*47.,p.y*26.-t*4.1));
  float gaps=gasNoise(vec2(p.x*16.+sin(p.y*24.-t*3.7)*.75,p.y*17.-t*4.7));
  body*=mix(.38,1.,smoothstep(.20,.64,gas*.62+gaps*.38));hot*=.46+.54*smoothstep(.18,.72,gas);
  vec3 flame=mix(vec3(.66,.027,.001),vec3(1.48,.29,.008),body*.70+hot*.27);
  flame=mix(flame,vec3(2.18,1.16,.29),clamp(hot*(.76+.23*heel),0.,1.))*heat;
  vec2 bed=(p-vec2(0.,.10))*vec2(3.1,6.0);
  float glow=exp(-dot(bed,bed))*.17;
  float drift=p.x-.06*sin(p.y*12.-t*.9)-.13*sin(p.y*5.-t*.62);
  float vapor=exp(-drift*drift*34.)*smoothstep(.37,.66,p.y)*(1.-smoothstep(.72,1.,p.y));
  vapor*=smoke*(.018+.12*pow(gasNoise(vec2(drift*22.,p.y*15.-t*.91)),1.9));
  float sparks=0.;
  if(embers>0.)for(int i=0;i<10;i++){
   float k=float(i),travel=fract(t*(.36+k*.052)+k*.371);
   float life=travel*(1.5-.5*travel);
   vec2 q=p-vec2(sin(k*3.71+seed)*.26+sin(t*.75+k)*life*.12,.095+life*.89);
   float pulse=smoothstep(0.,.12,travel)*(1.-smoothstep(.52,1.,travel));
   sparks+=exp(-dot(q*vec2(1.,.72),q*vec2(1.,.72))*mix(9500.,25500.,fract(k*.373)))*pulse*(.43+.57*fract(k*.61));
  }
  sparks=clamp(sparks*embers,0.,1.);
  float border=1.-smoothstep(.43,.50,abs(p.x));
  float total=body+glow+vapor+sparks;
  float alpha=total*border*(1.-smoothstep(45.,104.,fireDistance));
  if(alpha<.009)discard;
  vec3 color=(body*flame+glow*vec3(.94,.18,.018)+vapor*vec3(.18,.12,.085)+sparks*vec3(2.1,1.28,.52))/max(.001,total);
  gl_FragColor=vec4(color,min(alpha,.96));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
 m.userData.homeOwned139=true;
 const geometry=sharedGeo.environmentFire163??=new THREE.PlaneGeometry(1,1).translate(0,.5,0);
 const fire=new THREE.Mesh(geometry,m);
 fire.name=kind+' · layered environmental flame';
 fire.position.set(x,y,z);fire.scale.set(profile.width*scale,profile.height*scale,1);
 fire.userData.dynamicFX=true;fire.userData.environmentFire163=kind;
 parent.add(fire);return fire;
}
function firelight163(time,phase=0){
 return 1+.078*Math.sin(time*2.8+phase)+.041*Math.sin(time*5.1+phase*1.7);
}
function bindFirelight163(light,phase){
 (world.userData.fireLights163??=[]).push({light,phase,power:light.intensity});
}
const worldEffectsBeforeFire163=updateWorldFX;
updateWorldFX=function(...args){
 const result=worldEffectsBeforeFire163(...args);
 for(const f of world?.userData.fireLights163??[])f.light.intensity=f.power*firelight163(clock,f.phase);
 return result;
};
function hearthStone163(variant){
 const key='dressedHearthStone'+variant;
 if(sharedGeo[key])return sharedGeo[key];
 const shape=new THREE.Shape(),random=seeded(166339+variant*17);
 const points=[[-.465,-.36],[-.42,-.46],[-.17,-.467],[.17,-.458],[.37,-.468],[.466,-.35],[.459,0],[.465,.36],[.37,.465],[.07,.46],[-.22,.47],[-.39,.465],[-.464,.34],[-.46,-.04]];
 points.forEach(([x,y],i)=>shape[i?'lineTo':'moveTo'](x*.98+(random()-.5)*.042,y*.98+(random()-.5)*.048));
 shape.closePath();
 return sharedGeo[key]=new THREE.ExtrudeGeometry(shape,{depth:.93,bevelSize:.031,bevelThickness:.034,bevelSegments:2,steps:1}).translate(0,0,-.465);
}
function hearthFuelMaterial163(home){
 const fuel=new THREE.MeshStandardMaterial({map:envPbr103.maps.get('woodWeathered101:albedo')??textures.bark,color:home?'#594a40':'#4e423c',roughness:.96});
 addCloudLighting(fuel);lightPaintedSurface82(fuel);
 const compile=fuel.onBeforeCompile,key=fuel.customProgramCacheKey();fuel.userData.homeOwned139=true;
 fuel.onBeforeCompile=function(shader,...args){
  compile.call(this,shader,...args);
  shader.uniforms.emberTime163=windUniforms.time;
  shader.fragmentShader='uniform float emberTime163;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   #ifdef USE_MAP
    vec2 grain=vMapUv;
    float axial=abs(sin(37.699*grain.x+.54*sin(grain.y*29.)+.22*sin(grain.y*91.)));
    float crossGrain=abs(sin(grain.y*43.+1.3*sin(grain.x*31.4)+.22*sin(grain.y*83.)));
    float fissure=max((1.-smoothstep(.035,.12,axial))*.91,(1.-smoothstep(.03,.14,crossGrain))*exp(-3.2*axial));
    float heat=smoothstep(.04,.25,grain.y)*(1.-smoothstep(.75,1.,grain.y));
    diffuseColor.rgb*=.50+.50*(1.-fissure);
    totalEmissiveRadiance+=vec3(1.27,.106,.002)*fissure*heat*(.55+.26*sin(emberTime163*3.+grain.y*10.+grain.x*7.));
   #endif
  `);
 };
 fuel.customProgramCacheKey=()=>key+'-embers-in-fuel163';return fuel;
}
function hearthStoneFinish163(name,tint){
 const map=envPbr103.maps.get(name+':albedo')??environment102.maps.get(name),normalRough=envPbr103.maps.get(name+':normalRough');
 const m=new THREE.MeshStandardMaterial({map,color:tint,roughness:.92});
 addCloudLighting(m);lightPaintedSurface82(m);
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.userData.homeOwned139=true;
 m.onBeforeCompile=function(s,...args){
  before.call(this,s,...args);s.uniforms.hearthStoneNR={value:normalRough};
  const vary='varying vec3 hearthStonePosition,hearthStoneNormal;\n';
  s.vertexShader=vary+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   hearthStonePosition=(modelMatrix*vec4(transformed,1.)).xyz;
   hearthStoneNormal=inverseTransformDirection(transformedNormal,viewMatrix);`);
  s.fragmentShader=vary+'uniform sampler2D hearthStoneNR;\n'+normalBasis103+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   vec3 hf=hearthStonePosition*.73;
   vec3 weights=pow(abs(normalize(hearthStoneNormal)),vec3(6.));weights/=dot(weights,vec3(1.));
   vec2 xy=hf.xy+vec2(.48,.10),xz=hf.xz+vec2(.23,.61),zy=hf.zy+vec2(.72,.34);
   vec3 stoneArt=texture2D(map,zy).rgb*weights.x+texture2D(map,xz).rgb*weights.y+texture2D(map,xy).rgb*weights.z;
   vec3 broad=texture2D(map,hf.xy*.28+hf.zz*.1).rgb;
   vec3 mineral=vec3(.25)+stoneArt*.77;
   diffuseColor.rgb*=mineral*mix(1.55,2.10,dot(broad,vec3(.23,.57,.20)));
   vec4 nrX=texture2D(hearthStoneNR,zy),nrY=texture2D(hearthStoneNR,xz),nrZ=texture2D(hearthStoneNR,xy);`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(dot(vec3(nrX.a,nrY.a,nrZ.a),weights),.72,.97);');
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`
   vec3 stoneNormal=normal;
   vec3 nx=vec3((nrX.rg*2.-1.)*.43,nrX.b*2.-1.);
   vec3 ny=vec3((nrY.rg*2.-1.)*.43,nrY.b*2.-1.);
   vec3 nz=vec3((nrZ.rg*2.-1.)*.43,nrZ.b*2.-1.);
   normal=normalize(dataNormal103(-vViewPosition,stoneNormal,zy,nx)*weights.x+dataNormal103(-vViewPosition,stoneNormal,xz,ny)*weights.y+dataNormal103(-vViewPosition,stoneNormal,xy,nz)*weights.z);`);
 };m.customProgramCacheKey=()=>key+'-hearth-world-mineral-'+name;return m;
}
function masonryHearth163(parent,{key,tint,scale=1,forge=false,home=false,region='brookstead'}){
 const country=region==='fern'||region==='alder',dressed=region==='highmere'||region==='harbor';
 const mortar=new THREE.Color(tint).multiplyScalar(.31),random=seeded(forge?166435:country?166436:dressed?166437:166438);
 const stone=(variation=1)=>new THREE.Color(tint).multiplyScalar(Math.round(variation*24)/24);
 const mineral=forge||key==='stoneSlate'?'rockSlate':country?'rockMoss':dressed||key==='wall'?'rockLimestone':'rockGranite';
 const finishes=new Map();
 const finish=(materialKey,color)=>{
  const name=materialKey==='rock'?'rockSlate':mineral,id=name+color;
  if(!finishes.has(id))finishes.set(id,hearthStoneFinish163(name,color));
  return finishes.get(id);
 };
 const block=(name,x,y,z,w,h,d,color,materialKey=key)=>{
  const o=mesh(hearthStone163(Math.floor(random()*6)),finish(materialKey,color.getStyle()),x,y,z,parent);
  o.scale.set(w,h,d);
  o.name=name;o.castShadow=o.receiveShadow=true;return o;
 };
 block('Weathered hearth plinth',0,.105,.06,3.14,.21,2.27,stone(.70));
 for(let col=0;col<5;col++)for(let row=0;row<2;row++)block('Fitted hearth flagstone',(col-2)*.601,.224,.62-row*.72,.588,.10,.705,stone(.83+random()*.13));
 block('Soot-dark firebox back',0,1.32,-.94,2.44,2.17,.22,mortar,'rock');
 for(const side of[-1,1]){
  block('Soot-dark firebox return',side*1.113,1.19,-.28,.45,1.95,1.36,stone(.48));
  for(let row=0;row<5;row++){
   const y=.402+row*.328;
   block('Staggered jamb course',side*(1.15+(random()-.5)*.046),y+(random()-.5)*.019,.43+(random()-.5)*.065,
    .69-(row%2)*.042,.322+random()*.027,.46,stone(.78+random()*.22));
  }
  block('Recessed arch backing',side*1.10,2.11,-.052,.57,.62,.44,mortar);
 }
 const spring=1.66,outer=1.20,inner=.89;
 for(let i=0;i<9;i++){
  const a=(i+.024)/9*Math.PI,b=(i+.976)/9*Math.PI,shape=new THREE.Shape(),r=i===4?outer+.065:outer;
  shape.moveTo(r*Math.cos(a),spring+r*.62*Math.sin(a));
  shape.absellipse(0,spring,r,r*.62,a,b,false,0);
  shape.lineTo(inner*Math.cos(b),spring+inner*.62*Math.sin(b));
  shape.absellipse(0,spring,inner,inner*.62,b,a,true,0);
  shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:i===4?.47:.41,curveSegments:4,bevelEnabled:true,bevelThickness:.013,bevelSize:.007,bevelSegments:2,steps:1});
  const face=mesh(geometry,finish(key,stone(.84+random()*.16).getStyle()),0,0,.16,parent);face.name=i===4?'Projecting arch keystone':'Cut arch stone';face.castShadow=face.receiveShadow=true;
 }
 for(const side of[-1,1])block('Mantel corbel',side*1.12,2.15,.21,.56,.21,1.45,stone(.85));
 block('Carved mantel bed',0,2.43,-.16,3.00,.13,1.54,stone(.80));
 block('Projecting mantel cap',0,2.555,-.13,forge?2.92:3.16,dressed?.19:.16,1.76,stone(.97));
 const shaft=forge?1.82:2.18;
 block('Mortar-backed chimney core',0,3.275,-.72,shaft-.065,1.28,1.02,mortar);
 for(let row=0;row<4;row++){
  const left=.24+random()*.13,right=.24+random()*.13;
  const widths=[shaft*left,shaft*(1-left-right),shaft*right];if(row%2)widths.reverse();
  let edge=-shaft/2;
  for(const width of widths){
   block('Staggered chimney course',edge+width/2,2.79+row*.322,-.69,width-.016,.31,1.12,stone(.77+random()*.18));
   edge+=width;
  }
 }
 const logMaterial=hearthFuelMaterial163(home);
 for(let i=0;i<3;i++){
  const log=mesh(new THREE.CylinderGeometry(.105,.153,i===0?1.47:1.23,10),logMaterial,(i-1)*.10,.34+i*.062,.30-i*.26,parent);
  log.rotation.set(.06*i,.1+i*.40,Math.PI/2);log.name='Charred split fuel';
 }
 const coalMaterial=new THREE.MeshStandardMaterial({color:'#321e17',emissive:'#9f3210',emissiveIntensity:.47,roughness:.93});
 if(home)coalMaterial.userData.homeOwned139=true;
 const coalGeometry=sharedGeo.fireCoals163??=new THREE.IcosahedronGeometry(.072,0);
 for(let i=0;i<12;i++){const coal=mesh(coalGeometry,coalMaterial,(random()-.5)*1.58,.27+random()*.045,.02+random()*.49,parent);coal.rotation.y=random()*TAU;coal.scale.set(1.2,.64,.82);}
 parent.scale.set(scale,Math.min(scale,1.34),1);
}
