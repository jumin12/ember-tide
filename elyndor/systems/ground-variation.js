// Independently authored surface variants, sampled in irregular world-space
// patches. Geometry, path masks and vegetation all describe the same ground.
GROUND102.push('meadowMosaic104','trailMosaic104','forestMosaic104','cobbleMosaic104');
const surfaceVariation104=`
uniform highp sampler2DArray variationArt104;
float hash104(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise104(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash104(i),hash104(i+vec2(1.,0.)),f.x),mix(hash104(i+vec2(0.,1.)),hash104(i+1.),f.x),f.y);}
vec3 patchArt104(vec2 p,float layer){
 vec2 cell=floor(p*.18),f=fract(p*.18);f=f*f*(3.-2.*f);
 vec2 a=vec2(hash104(cell),hash104(cell+19.1))*27.,b=vec2(hash104(cell+vec2(1.,0.)),hash104(cell+vec2(1.,0.)+19.1))*27.;
 vec2 c=vec2(hash104(cell+vec2(0.,1.)),hash104(cell+vec2(0.,1.)+19.1))*27.,d=vec2(hash104(cell+1.),hash104(cell+20.1))*27.;
 return mix(mix(texture(variationArt104,vec3(p+a,layer)).rgb,texture(variationArt104,vec3(p+b,layer)).rgb,f.x),mix(texture(variationArt104,vec3(p+c,layer)).rgb,texture(variationArt104,vec3(p+d,layer)).rgb,f.x),f.y);
}
`;
function variationUniform104(s){s.uniforms.variationArt104={value:environment102.ground};s.fragmentShader=surfaceVariation104+s.fragmentShader;}
const groundVariationBefore104=groundMaterial102;
groundMaterial102=function(m){groundVariationBefore104(m);if(!m?.userData.ground102||m.userData.variation104)return;m.userData.variation104=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);variationUniform104(s);
  s.fragmentShader=s.fragmentShader.replace('vec3 turf=mix(lush,dry,patches*.24);',`float meadow104=smoothstep(.28,.73,noise104(p.xz*.085+8.));lush=mix(lush,patchArt104(uv*.92,14.),meadow104*.72);vec3 turf=mix(lush,dry,patches*.42);`);
  s.fragmentShader=s.fragmentShader.replace('float shade=(1.-smoothstep',`humus=mix(humus,patchArt104(uv*.81,16.),.30+.50*noise104(p.xz*.11));float shade=(1.-smoothstep`);
  s.fragmentShader=s.fragmentShader.replace('float edge=4.*road',`dirt=mix(dirt,patchArt104(uv*1.1,15.),.24+.60*noise104(p.xz*.09+13.));float edge=4.*road`);
  s.fragmentShader=s.fragmentShader.replace('result=mix(result,mix(dirt,stonePath*.76,paving),path);',`float stain104=noise104(p.xz*.17+31.)*.65+noise104(p.xz*.48)*.35;float pavingPatch104=smoothstep(.30,.75,noise104(p.xz*.075+11.));if(pavingStyle102<.5){vec3 cobble104=texture(variationArt104,vec3(p.xz*.15+3.7,17.)).rgb;stonePath=mix(stonePath,cobble104,.25+.70*pavingPatch104);}stonePath*=mix(vec3(.75,.80,.76),vec3(1.13,1.08,.98),smoothstep(.23,.80,stain104));stonePath=mix(stonePath,groundSample102(uv*.88,9.),smoothstep(.65,.85,stain104)*.15);result=mix(result,mix(dirt,stonePath*.82,paving),path);`);
 };m.customProgramCacheKey=()=>key+'-native-ground-variation104';m.needsUpdate=true;};
const battleVariationBefore104=hdGroundMaterial100;
hdGroundMaterial100=function(b){const m=battleVariationBefore104(b),before=m.onBeforeCompile,key=m.customProgramCacheKey(),p=profile100();
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);variationUniform104(s);
  const layer=k=>/grass|moss/.test(k)?14:/earth|leafLitter/.test(k)?16:-1;
  const a0=layer(p[0]),a1=layer(p[1]),a2=/earth|sandChalk/.test(p[2])?15:-1;
  s.fragmentShader=s.fragmentShader.replace('// Height-aware, feathered boundaries;',`${a0>=0?'base100=mix(base100,patchArt104(uv100*.94,'+a0+'.),smoothstep(.23,.80,broad100)*.62);':''}${a1>=0?'other100=mix(other100,patchArt104(uv100*.83+7.,'+a1+'.),smoothstep(.27,.74,broken100)*.60);':''}${a2>=0?'trail100=mix(trail100,patchArt104(uv100*1.02,15.),.28+.51*grainNoise100(local100*.12+17.));':''}trail100*=mix(vec3(.82,.86,.80),vec3(1.12,1.07,.97),grainNoise100(local100*.16+5.));\n// Height-aware, feathered boundaries;`);
 };m.customProgramCacheKey=()=>key+'-battle-native-variation104';m.userData.variation104=true;return m;};

function groundNoise104(x,z){const fract=v=>v-Math.floor(v),h=(x,z)=>fract(Math.sin(x*127.1+z*311.7)*43758.5453),ix=Math.floor(x),iz=Math.floor(z);let a=fract(x),b=fract(z);a=a*a*(3-2*a);b=b*b*(3-2*b);return mix(mix(h(ix,iz),h(ix+1,iz),a),mix(h(ix,iz+1),h(ix+1,iz+1),a),b);}
function stageSurface104(b,x,z){
 const broad=groundNoise104(x*.063,z*.063),broken=groundNoise104(x*.31+27,z*.31+27)*.65+groundNoise104(x*.93,z*.93)*.35;
 const path=1-smooth(5.5,12.5,Math.abs(x+Math.sin(z*.053)*3.1)+(broken-.5)*7),clearing=1-smooth(.66,1.2,Math.hypot(x/24,(z-2)/18)+(broken-.5)*.34),paved=b.spec.ruins||b.spec.royal;
 let worn=smooth(.22,.76,clamp(Math.max(path*.65,clearing*.58)+(broad-.5)*.62+(broken-.5)*.72,0,.96));if(paved)worn=Math.max(worn,clearing*.94+path*.12);if(b.spec.snow)worn=.14;
 const y=arenaFloor88(b,x,z),dx=(arenaFloor88(b,x+.25,z)-arenaFloor88(b,x-.25,z))/.5,dz=(arenaFloor88(b,x,z+.25)-arenaFloor88(b,x,z-.25))/.5,slope=1-1/Math.sqrt(1+dx*dx+dz*dz),bank=1-smooth(-.4,1,y);
 let grit=clamp(smooth(.11,.40,slope)*.80+smooth(.62,.86,broken)*.27+bank*(1-clearing)*.22,0,.87);if(b.spec.snow)grit*=.34;
 return{worn,grit,paved,slope};
}
// The oldest fine-grass pass also participates in the same habitat mask and
// uses the modeled blade geometry rather than retained unlit triangles.
const fineGeometryBefore104=arenaGeometry88;
arenaGeometry88=function(b,id,create){return id==='fineGrass89'?fineGeometryBefore104(b,'modeled-fine-grass104',()=>{const g=curvedGrass102(b.mobile).clone();g.translate(0,.465,0);return g;}):fineGeometryBefore104(b,id,create);};
const fineInstanceBefore104=arenaInstance88;
arenaInstance88=function(b,key,g,m,...args){if(key==='fineGrass89')m=arenaCoverMaterial102(b,'grassBlades');return fineInstanceBefore104(b,key,g,m,...args);};
const vegetationSurfaceBefore104=flushArena88;
flushArena88=function(b){const result=vegetationSurfaceBefore104(b),cells=new Map(),unit=4;
 const occupy=(x,z,r)=>{for(let xx=Math.floor((x-r)/unit);xx<=Math.floor((x+r)/unit);xx++)for(let zz=Math.floor((z-r)/unit);zz<=Math.floor((z+r)/unit);zz++){const k=xx+','+zz;if(!cells.has(k))cells.set(k,[]);cells.get(k).push({x,z,r});}};
 const matrix=new THREE.Matrix4(),position=V3(),rotation=new THREE.Quaternion(),scale=V3();
 b.group.traverse(o=>{if(!o.isInstancedMesh||!o.geometry?.userData.weathered104)return;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);if(scale.y>.45)occupy(position.x,position.z,Math.max(scale.x,scale.z)*.62);}});
 let kept=0,removed=0;const sampled=[];
 b.group.traverse(o=>{const kind=o.material?.userData.realVegetation103;if(!o.isInstancedMesh||!kind)return;let write=0;
  for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);if(scale.lengthSq()<1e-8)continue;const x=position.x,z=position.z,s=stageSurface104(b,x,z),stone=(cells.get(Math.floor(x/unit)+','+Math.floor(z/unit))??[]).some(q=>Math.hypot(x-q.x,z-q.z)<q.r+.18),footing=(b.propRoots94??[]).some(q=>Math.abs(x-q.x)<q.w/2+.25&&Math.abs(z-q.z)<q.d/2+.25);
   const reject=b.spec.cave||b.spec.snow||arenaWet89(b,x,z)>.08||stone||footing||s.slope>.25||s.grit>.42||s.paved&&s.worn>.16;
   if(reject){removed++;continue;}const salt=b.spec.coast||b.spec.sea&&!b.spec.downs;if(salt&&(kind!=='grassBlades'||groundNoise104(x*.22+51,z*.22)<.48)){removed++;continue;}
   if(kind==='grassBlades'&&s.worn>.48)scale.y*=mix(1,.38,smooth(.48,.95,s.worn));matrix.compose(position,rotation,scale);o.setMatrixAt(write++,matrix);kept++;if(sampled.length<60)sampled.push({x,z,worn:s.worn,grit:s.grit});
  }o.count=write;o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();
 });b.vegetationSurface104={kept,removed,paved:!!(b.spec.ruins||b.spec.royal),sampled,terrainAware:true};return result;};
