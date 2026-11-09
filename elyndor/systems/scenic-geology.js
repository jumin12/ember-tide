// High-resolution weathering, fracture planes and erosion describe different
// kinds of rock. Smooth bevels catch light; texture cannot replace the form.
rockGeometry62=function(kind=0){
 kind=((kind%24)+24)%24;const key='weathered-stone104-'+kind;if(sharedGeo[key])return sharedGeo[key];
 const k=kind%12,forms=[[1.15,1,.92],[1.65,.42,.94],[.67,1.90,.73],[1.10,.64,1.04],[1.52,.74,.87],[.99,1.25,.91],[1.18,.38,.88],[1.38,.52,1.13],[.59,2.10,.75],[1.54,.65,1.13],[1.18,.94,.98],[.85,1.48,.89]],f=forms[k],phase=k*.713;
 const g=new THREE.SphereGeometry(1,36,24),p=g.attributes.position,ledge=[1,4,7,9].includes(k),river=k===6;
 for(let i=0;i<p.count;i++){
  let x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),h=(y+1)*.5;
  const broad=1+.11*Math.sin(x*3.1+z*2.6+phase)+.09*Math.sin(y*3.7-x*2.4+phase*1.8),grain=river?0:.014*Math.sin(x*24+y*18+phase)*Math.cos(z*23-y*13);
  const planar=river?1:Math.min(1, .86/(Math.max(.001,x*Math.cos(phase)+z*Math.sin(phase))+.10),.91/(Math.max(.001,x*Math.cos(phase+2.2)+z*Math.sin(phase+2.2))+.09));
  const groove=river?0:.055*Math.exp(-Math.pow((x*.61+z*.42-y*.18+.14*Math.sin(y*5+phase))*16,2))*Math.sin(h*Math.PI);
  const r=broad*(.68+planar*.32)+grain-groove; x*=r;z*=r;
  if(ledge){const layer=Math.sin((h*6+Math.sin(a)*.11)*TAU);x*=1+layer*.028;z*=1+layer*.028;y*=.90;}
  y=Math.max(-.65,y);const topCut=.82+.12*Math.sin(a+phase)+.05*Math.sin(a*3+phase);y=Math.min(y,topCut);
  p.setXYZ(i,(x+y*.08*Math.sin(phase))*f[0],(y*.98+.42)*f[1],(z+y*.07*Math.cos(phase))*f[2]);
 }
 g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData={geology62:k,native102:true,weathered104:true,roundedBevels:true,vertices:p.count,form:environment62.rockNames[k]};return sharedGeo[key]=g;
};
const mineralMaterials104=new WeakMap();
rockMaterial62=function(biome=0){
 const owner=environment102.battle&&arena88.current?arena88.current.group:world;if(!mineralMaterials104.has(owner))mineralMaterials104.set(owner,new Map());const cache=mineralMaterials104.get(owner),kind=Math.min(3,Math.max(0,Math.floor(biome)));
 if(cache.has(kind))return cache.get(kind);const name=['rockMoss','rockGranite','rockLimestone','rockSlate'][kind],map=envPbr103.maps.get(name+':albedo')??environment102.maps.get(name),m=new THREE.MeshStandardMaterial({map,color:'#e7e7e0',roughness:.95,metalness:0});m.envMap=null;m.userData={geology62:true,mineral102:true,weathered104:true};addCloudLighting(m);lightPaintedSurface82(m);
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...args){before.call(this,s,...args);Object.assign(s.uniforms,{mineralNR104:{value:envPbr103.maps.get(name+':normalRough')??envPbr103.maps.get('stoneGranite:normalRough')},mineralMoss104:{value:environment102.maps.get('moss')}});
  s.vertexShader='varying vec3 mineralWorld104,mineralNormal104;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
  vec4 mineralP104=vec4(transformed,1.);vec3 mineralN104=objectNormal;
  #ifdef USE_INSTANCING
   mineralP104=instanceMatrix*mineralP104;mat3 im104=mat3(instanceMatrix);mineralN104/=vec3(dot(im104[0],im104[0]),dot(im104[1],im104[1]),dot(im104[2],im104[2]));mineralN104=im104*mineralN104;
  #endif
  mineralWorld104=(modelMatrix*mineralP104).xyz;mineralNormal104=normalize(mat3(modelMatrix)*mineralN104);`);
  s.fragmentShader='uniform sampler2D mineralNR104,mineralMoss104;varying vec3 mineralWorld104,mineralNormal104;float mineralHeight104;\n'+microRelief102+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`vec3 weights104=pow(abs(normalize(mineralNormal104)),vec3(4.));weights104/=max(.001,dot(weights104,vec3(1.)));vec3 coord104=mineralWorld104*.42;
   vec3 stone104=texture2D(map,coord104.zy).rgb*weights104.x+texture2D(map,coord104.xz).rgb*weights104.y+texture2D(map,coord104.xy).rgb*weights104.z;
   float habitat104=.5+.25*sin(mineralWorld104.x*.91+sin(mineralWorld104.z*.74))+.25*sin(mineralWorld104.z*.62-mineralWorld104.x*.3);float moss104=smoothstep(.25,.85,mineralNormal104.y)*smoothstep(.42,.78,habitat104)*${kind===0?'.58':kind===3?'.12':'.24'};
   stone104=mix(stone104,texture2D(mineralMoss104,coord104.xz*.8).rgb*.85,moss104);diffuseColor.rgb*=stone104;mineralHeight104=dot(stone104,vec3(.21,.72,.07));`);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','normal=worldMicroNormal102(-vViewPosition,normal,vec2(dFdx(mineralHeight104),dFdy(mineralHeight104))*.035,faceDirection);');
 };m.customProgramCacheKey=()=>key+'-weathered-triplanar104-'+kind;cache.set(kind,m);return m;
};
// The same detailed stone models serve the arena's large outcrops as well as
// loose talus. Keep the original terrain/contact placement calculation.
rockMesh89=kind=>rockGeometry62(kind%12).clone();
