// Current Trello visual targets: neutral travel daylight, readable fighter art,
// natural battlefield pigments, and Fern Hollow's woodland gathering halls.
const daylight115={sun:new THREE.Color('#f1f6ff'),ground:new THREE.Color('#829b94'),bounce:new THREE.Color('#dfebf4')};
const lightBefore115=updateLighting;
updateLighting=function(...args){
 const r=lightBefore115(...args);if(activeScene?.kind!=='overworld'||!usesLandscapeLight54())return r;
 const day=celestial31.day.value,neutral=day*(1-poiLight54.warm.value)*.68;
 sun.color.lerp(daylight115.sun,neutral);hemi.groundColor.lerp(daylight115.ground,neutral*.52);
 if(skyBounce17)skyBounce17.color.lerp(daylight115.bounce,neutral*.66);
 lighting34.colour.value.copy(sun.color);waterLight62.key.value.copy(sun.color);waterLight62.sky.value.copy(hemi.color);
 return r;
};

// Grade the sampled material before BRDF lighting. The distant painting,
// reflections, actors, UI, and scene exposure never inherit this local grade.
const turf115=`vec3 richTurf115(vec3 c){float l=dot(c,vec3(.2126,.7152,.0722));return max(vec3(0.),mix(vec3(l),c,1.13)*vec3(.92,.99,.91));}\n`;
const battleGroundBefore115=hdGroundMaterial100;
hdGroundMaterial100=function(b){
 const m=battleGroundBefore115(b),before=m.onBeforeCompile,key=m.customProgramCacheKey();
 const green=!b.spec.cave&&!b.spec.snow&&!b.spec.coast;
 if(green)m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.fragmentShader=turf115+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('// Height-aware, feathered boundaries;',`base100=richTurf115(base100);other100=richTurf115(other100);${!b.spec.ruins&&!b.spec.royal?'trail100*=vec3(1.10,.94,.82);':''}\n// Height-aware, feathered boundaries;`);
  // A legacy gray mix flattened the native grass and dirt after sampling.
  // Restore their chroma once, while the physical light still shapes shadows.
  s.fragmentShader=s.fragmentShader.replace('ground100=mix(vec3(luma100),ground100,.90);','ground100=max(vec3(0.),mix(vec3(luma100),ground100,1.07));');
 };m.customProgramCacheKey=()=>key+'-natural-battle115-'+green;return m;
};
const plantsBefore115=vegetationMaterial103;
vegetationMaterial103=function(kind,b=null){
 const m=plantsBefore115(kind,b);if(!b||kind==='flowers'||b.spec.autumn||b.spec.twilight)return m;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.fragmentShader=turf115+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('livingTurf105(texture2D(map,vMapUv).rgb)','richTurf115(livingTurf105(texture2D(map,vMapUv).rgb))');};m.customProgramCacheKey=()=>key+'-rich-battle-leaf115';return m;
};
const renderBattleBefore115=renderArena89;
renderArena89=function(...args){
 if(!arena88.current||!battle)return renderBattleBefore115(...args);
 const b=arena88.current,saved=[];
 // The same soft face bounce lights both sides of the encounter. Retain the
 // directional shading, native sprite pigments and each environment's mood.
 for(const a of[player,...followers,...battle.enemies.map(e=>e.actor)]){if(!a?.mesh.visible)continue;const m=a.mesh.material;saved.push([m,m.emissive.clone(),m.emissiveIntensity]);m.emissive.set(b.night?'#afc8e9':b.spec.cave?'#a6d4e1':'#fff4e3');m.emissiveIntensity+=b.night?.105:b.spec.cave?.20:.34;}
 try{return renderBattleBefore115(...args);}finally{for(const[m,c,power]of saved){m.emissive.copy(c);m.emissiveIntensity=power;}}
};

function fernRoof115(parent,w,d,y,rise,atlas){
 const nx=16,nz=6,pos=[],uv=[],indices=[];
 for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){const u=x/nx*2-1;pos.push(u*w/2,y+rise*Math.pow(1-Math.abs(u),.87)+Math.pow(Math.abs(u),8)*.22,(z/nz-.5)*d);uv.push(x/nx*2,z/nz*2);}
 for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const a=z*(nx+1)+x,b=a+1,c=a+nx+1;indices.push(a,c,b,b,c,c+1);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
 const roofMat=new THREE.MeshPhysicalMaterial({map:envPbr103.maps.get(canonical103('wood')+':albedo')??textures.wood,normalMap:envPbr103.maps.get(canonical103('wood')+':normalRough'),normalScale:new THREE.Vector2(.20,.20),color:'#a4a58c',roughness:.96,metalness:0,side:THREE.DoubleSide});
 roofMat.onBeforeCompile=s=>{s.uniforms.roofMoss115={value:environment102.maps.get('moss')};s.fragmentShader=`uniform sampler2D roofMoss115;
 float roofHash115(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float roofNoise115(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(roofHash115(i),roofHash115(i+vec2(1.,0.)),f.x),mix(roofHash115(i+vec2(0.,1.)),roofHash115(i+1.),f.x),f.y);}
 `+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
  float roofPatch115=roofNoise115(vMapUv*3.2)*.7+roofNoise115(vMapUv*9.7+12.)*.3;
  float roofMossMask115=smoothstep(.32,.72,roofPatch115)*.66;
  diffuseColor.rgb=mix(diffuseColor.rgb,texture2D(roofMoss115,vMapUv*.85).rgb*vec3(.80,.88,.73),roofMossMask115);`);};roofMat.customProgramCacheKey=()=> 'weathered-fern-roof115';
 addCloudLighting(roofMat);const roof=new THREE.Mesh(geo,roofMat);roof.castShadow=roof.receiveShadow=true;parent.add(roof);
 // Solid timber rafters share the curved roof edge, without detached beams.
 for(const zz of[-d/2,d/2])for(let i=0;i<nx;i++){const u=i/nx*2-1,v=(i+1)/nx*2-1,f=t=>y+rise*Math.pow(1-Math.abs(t),.87)+Math.pow(Math.abs(t),8)*.22;const a=V3(u*w/2,f(u),zz),b=V3(v*w/2,f(v),zz),delta=b.clone().sub(a),o=block16(parent,(a.x+b.x)/2,(a.y+b.y)/2,zz,delta.length()+.035,.11,.15,'darkWood','#716449',atlas);o.rotation.z=Math.atan2(delta.y,delta.x);}
 block16(parent,0,y+rise+.08,0,.19,.18,d+.25,'darkWood','#8a7957',atlas);
}
const houseBefore115=house16;
house16=function(parent,spec,key,index,atlas=false){
 let root=parent;while(root&&!root.userData.naturalMiniature71)root=root.parent;
 if(key!=='fern'||!root)return houseBefore115(parent,spec,key,index,atlas);
 const {x,z,w,d,h,a}=spec,g=new THREE.Group(),hall=index===0,roofY=h*.76;
 g.position.set(x,spec.y,z);g.rotation.y=a;g.name=hall?'Fern Hollow open gathering pavilion':'Fern Hollow timber lodge';g.userData.landmarkHouse45={w,d,h};g.userData.woodland115={gathering:hall,roadFacing:true};parent.add(g);
 (root.userData.woodland115??=[]).push({gathering:hall,roadFacing:true,dimensions:[w,d,h]});
 block16(g,0,.12,0,w+.14,.24,d+.12,'wall','#a6afa0',atlas);
 block16(g,0,.29,0,w-.1,.10,d-.1,'wood','#b1a083',atlas);
 // Warm weathered timber replaces Brookstead's plaster facade and blue roof.
 if(hall){for(const side of[-1,1])block16(g,side*w*.33,.72,-d*.44,w*.27,.16,.18,'wood','#9d8b69',atlas);}
 else block16(g,0,roofY*.48,-d*.44,w-.27,roofY*.92,.20,'wood','#9d8b69',atlas);
 for(const side of[-1,1]){
  block16(g,side*(w*.5-.17),hall?.75:roofY*.48,-d*.14,.20,hall?.15:roofY*.92,d*.60,'wood','#a18f71',atlas);
  for(const zz of[-d*.44,d*.43]){
   block16(g,side*(w*.5-.17),roofY*.5,zz,.22,roofY,.24,'bark','#8b7450',atlas);
   block16(g,side*(w*.5-.17),.41,zz,.36,.28,.39,'wall','#b5b9a5',atlas);
  }
  // Front lattice rails flank a generous visible entrance.
  block16(g,side*w*.34,.97,d*.43,w*.24,.11,.14,'darkWood','#857453',atlas);
  for(let k=0;k<3;k++)block16(g,side*w*.34+(k-1)*w*.08,.67,d*.43,.075,.55,.09,'wood','#a8956e',atlas);
  if(!hall){block16(g,side*w*.28,roofY*.60,-d*.56,.68,.81,.09,'window','#d8cfab',atlas);
  block16(g,side*w*.28,roofY*.60,-d*.62,.05,.83,.08,'wood','#706142',atlas);
  for(const hand of[-1,1])block16(g,side*w*.28+hand*.39,roofY*.60,-d*.61,.12,.95,.13,'darkWood','#756244',atlas);
  block16(g,side*w*.28,roofY*.60+.46,-d*.61,.90,.11,.16,'wood','#b09b71',atlas);
  block16(g,side*w*.28,roofY*.60-.49,-d*.61,.90,.13,.23,'wood','#b09b71',atlas);}
 }
 for(const xx of[-w*.46,0,w*.46])block16(g,xx,roofY*.48,-d*.56,.13,roofY*.95,.12,'darkWood','#776346',atlas);
 if(!hall){block16(g,0,roofY*.44,d*.18,w*.67,roofY*.75,.15,'wood','#9e906f',atlas);block16(g,0,.88,d*.28,.66,1.44,.12,'door','#7a694d',atlas);}
 else{block16(g,0,.67,-d*.16,w*.60,.17,.56,'wood','#b6a17b',atlas);for(const side of[-1,1])block16(g,side*w*.25,.48,-d*.16,.13,.42,.40,'darkWood','#807050',atlas);}
 block16(g,0,.11,d*.5+.25,Math.min(1.55,w*.34),.20,.52,'cobble','#bbc0ab',atlas);
 fernRoof115(g,w+.77,d+.72,roofY,hall?w*.27:w*.32,atlas);
 if(hall){fernRoof115(g,w*.74,d*.72,roofY+w*.25,w*.12,atlas);for(const side of[-1,1])block16(g,side*w*.22,roofY-.4,d*.43,.12,.8,.15,'wood','#a18a5b',atlas);}
 return g;
};
