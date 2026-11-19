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
  float fold=y*(.105*sin(p.y*8.7-t*3.8+phase)+.043*sin(p.y*20.-t*5.5+phase));
  float r=width*pow(max(.015,1.-y),.77)*(.86+.14*sin(t*3.+phase));
  float u=(p.x-root-fold)/max(.009,r);
  float aa=min(.65,max(.035,fwidth(u)*.60));
  float rise=smoothstep(-.012,.036,y)*(1.-smoothstep(.66,1.,y));
  float contour=(1.-smoothstep(1.-aa,1.+aa,abs(u)))*rise;
  float ribbonCenter=.23*sin(p.y*20.-t*4.2+phase)+.13*sin(p.y*37.-t*5.1+phase);
  float hot=(1.-smoothstep(.065,.31+aa*.6,abs(u-ribbonCenter)))*contour;
  return vec2(contour,hot);
 }
 void main(){
  vec2 p=fireUv-vec2(.5,0.);float t=time*speed+seed;
  vec2 rear=ribbon(p,-.13,.19,.77+.13*sin(t*2.1),1.4,t);
  vec2 tall=ribbon(p,.03,.18,.87+.12*sin(t*2.7+.9),3.2,t);
  vec2 right=ribbon(p,.18,.15,.65+.13*sin(t*2.5+2.),5.2,t);
  vec2 lead=ribbon(p,-.09,.17,.48+.13*sin(t*3.6+1.8),6.1,t*1.10);
  vec2 base=ribbon(p,.10,.15,.36+.09*sin(t*4.+3.),.1,t*1.15);
  float body=1.-(1.-rear.x*.46)*(1.-tall.x*.65)*(1.-right.x*.59)*(1.-lead.x*.67)*(1.-base.x*.58);
  float hot=max(max(rear.y,tall.y)*.66,max(right.y*.74,max(lead.y,base.y)));
  float heel=1.-smoothstep(.02,.52,p.y);
  float gas=gasNoise(vec2(p.x*23.+sin(p.y*8.-t)*.9,p.y*9.-t*2.6));
  gas=.73*gas+.27*gasNoise(vec2(p.x*47.,p.y*26.-t*4.1));
  body*=.64+.36*gas;hot*=.40+.60*smoothstep(.22,.72,gas);
  vec3 flame=mix(vec3(.78,.054,.004),vec3(1.47,.43,.027),body*.72+hot*.25);
  flame=mix(flame,vec3(1.85,1.02,.24),clamp(hot*(.73+.20*heel),0.,1.))*heat;
  vec2 bed=(p-vec2(0.,.10))*vec2(3.1,6.0);
  float glow=exp(-dot(bed,bed))*.17;
  float drift=p.x-.06*sin(p.y*12.-t*.9)-.13*sin(p.y*5.-t*.62);
  float vapor=exp(-drift*drift*34.)*smoothstep(.37,.66,p.y)*(1.-smoothstep(.72,1.,p.y));
  vapor*=smoke*(.06+.055*sin(p.y*38.-t*1.9+sin(drift*17.)));
  float sparks=0.;
  if(embers>0.)for(int i=0;i<6;i++){
   float k=float(i),travel=fract(t*(.36+k*.052)+k*.371);
   float life=travel*(1.5-.5*travel);
   vec2 q=p-vec2(sin(k*3.71+seed)*.21+sin(t*.75+k)*life*.11,.16+life*.79);
   float pulse=smoothstep(0.,.12,travel)*(1.-smoothstep(.52,1.,travel));
   sparks+=exp(-dot(q*vec2(1.,.66),q*vec2(1.,.66))*16000.)*pulse;
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
 const points=[[-.465,-.37],[-.41,-.465],[.38,-.465],[.465,-.39],[.465,.37],[.39,.465],[-.38,.465],[-.465,.38]];
 points.forEach(([x,y],i)=>shape[i?'lineTo':'moveTo'](x*.98+(random()-.5)*.026,y*.98+(random()-.5)*.030));
 shape.closePath();
 return sharedGeo[key]=new THREE.ExtrudeGeometry(shape,{depth:.93,bevelSize:.031,bevelThickness:.034,bevelSegments:2,steps:1}).translate(0,0,-.465);
}
function hearthFuelMaterial163(home){
 const base=home?homeSurface139('barkPine86','#524137'):roomMaterial29('bark','#513930');
 const fuel=base.clone(),compile=base.onBeforeCompile,key=base.customProgramCacheKey();
 fuel.userData.homeOwned139=true;fuel.color.multiplyScalar(.67);
 fuel.onBeforeCompile=function(shader,...args){
  compile.call(this,shader,...args);
  shader.uniforms.emberTime163=windUniforms.time;
  shader.fragmentShader='uniform float emberTime163;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   #ifdef USE_MAP
    vec2 grain=vMapUv;
    float split=abs(grain.x-.42-.042*sin(grain.y*39.)-.027*sin(grain.y*77.));
    float branches=abs(sin(grain.y*25.+2.5*sin(grain.x*11.)));
    float fissure=(1.-smoothstep(.006,.024,split))*.94;
    fissure=max(fissure,(1.-smoothstep(.04,.13,branches))*exp(-16.*split));
    float heat=smoothstep(.02,.25,grain.y)*(1.-smoothstep(.72,.98,grain.y));
    totalEmissiveRadiance+=vec3(1.32,.17,.012)*fissure*heat*(.69+.16*sin(emberTime163*3.+grain.y*18.));
   #endif
  `);
 };
 fuel.customProgramCacheKey=()=>key+'-embers-in-fuel163';return fuel;
}
function masonryHearth163(parent,{key,tint,scale=1,forge=false,home=false,region='brookstead'}){
 const country=region==='fern'||region==='alder',dressed=region==='highmere'||region==='harbor';
 const mortar=new THREE.Color(tint).multiplyScalar(.31),random=seeded(forge?166435:country?166436:dressed?166437:166438);
 const stone=(variation=1)=>new THREE.Color(tint).multiplyScalar(variation);
 const finish=(materialKey,color)=>materialKey==='hearth29'?roomMaterial29('hearth29',color):material(materialKey,color);
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
   block('Staggered jamb course',side*(1.16+(random()-.5)*.026),y,.43+(random()-.5)*.05,
    .69-(row%2)*.042,.315,.46,stone(.79+random()*.19));
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
  const widths=row%2?[shaft*.24,shaft*.52,shaft*.24]:[shaft*.34,shaft*.33,shaft*.33];
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
