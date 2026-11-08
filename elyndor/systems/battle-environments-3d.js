// Twenty physical sets, built from the same native PixelLab surface art as the
// world. No scene photograph, projected painting or screen-space backdrop.
const arena88={textures:new Map(),motion:[],builds:0,disposed:0,current:null};
const ARENAS88={
 waterfall:{ground:'grass',trees:'oak',lake:true,falls:true,cliffs:true,flowers:60},
 woodland:{ground:'grassA',trees:'oak',dense:true,flowers:18},
 orchard:{ground:'grass',trees:'orchard',farm:true,flowers:25},
 ruins:{ground:'cobbleA',trees:'oak',ruins:true,flowers:15},
 cavern:{ground:'env62_stone',cave:true,lake:true,crystals:true,cliffs:true},
 mountain:{ground:'barren',trees:'pine',cliffs:true,highland:true,flowers:10},
 snow:{ground:'snow',trees:'pine',snow:true,cliffs:true,highland:true},
 coast:{ground:'earth',sea:true,cliffs:true,coast:true,flowers:20},
 royalRoad:{ground:'cobble',trees:'oak',royal:true,flowers:22},
 moonlit:{ground:'earth',trees:'oak',dense:true,elder:true,flowers:20},
 grassMeadow:{ground:'grass',trees:'oak',lake:true,falls:true,meadow:true,flowers:80},
 grassRiver:{ground:'grass',trees:'willow',river:true,bridge:true,flowers:65},
 grassFlowers:{ground:'grass',trees:'oak',lake:true,falls:true,flowers:220},
 grassDowns:{ground:'grassA',sea:true,downs:true,flowers:45},
 grassWindmill:{ground:'grass',trees:'oak',farm:true,windmill:true,flowers:65},
 grassAutumn:{ground:'grassA',trees:'autumn',autumn:true,highland:true,flowers:55},
 grassStones:{ground:'grass',trees:'oak',stones:true,flowers:120},
 grassHills:{ground:'grass',trees:'pine',highland:true,flowers:45},
 grassBirch:{ground:'grass',trees:'birch',meadow:true,flowers:100},
 grassTwilight:{ground:'grassA',trees:'oak',twilight:true,flowers:60}
};
function arenaTexture88(key,normal=false){
 const id=key+':'+normal;if(arena88.textures.has(id))return arena88.textures.get(id);
 const original=textures[key];if(!original)return null;const t=original.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1);t.offset.set(0,0);t.rotation=0;t.anisotropy=4;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.colorSpace=normal?THREE.NoColorSpace:THREE.SRGBColorSpace;t.userData.pinnedMap17=true;t.needsUpdate=true;arena88.textures.set(id,t);return t;
}
function arenaMaterial88(b,key,color='#ffffff',options={}){
 const id=[key,color,!!options.wind,!!options.cutout,!!options.emissive].join('|');if(b.materials.has(id))return b.materials.get(id);
 const metallic=['metal','steel86','brass86'].includes(key),glass=key==='lightFacets',m=material59(new THREE.MeshStandardMaterial({map:arenaTexture88(key),color,roughness:metallic?.36:glass?.17:.91,metalness:metallic?.88:0,side:options.cutout?THREE.DoubleSide:THREE.FrontSide,alphaTest:options.cutout?.42:0,envMap:metallic||glass?surface67.outdoor:null,envMapIntensity:b.night?.22:.65}));
 const normal=arenaTexture88('normal28_'+key,true);if(normal&&!options.cutout){m.normalMap=normal;m.normalScale.setScalar(.35);}
 if(options.emissive){m.emissive.set(options.emissive);m.emissiveIntensity=b.night?.85:.12;}
 const before=m.onBeforeCompile,wind=!!options.wind,tiled=!!m.map&&!options.cutout;
 m.onBeforeCompile=s=>{before(s);s.uniforms.arenaTime88=stageDepth59.time;s.vertexShader='uniform float arenaTime88;varying vec3 arenaPosition88,arenaNormal88;\n'+s.vertexShader;
  if(wind)s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 root88=vec4(0.,0.,0.,1.);
   #ifdef USE_INSTANCING
    root88=instanceMatrix*root88;
   #endif
   float bend88=sin(arenaTime88*.82+root88.x*.31+root88.z*.19)+.3*sin(arenaTime88*1.24+root88.z*.28);transformed.x+=bend88*.045*max(0.,position.y+.35);`);
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 p88=vec4(transformed,1.);
   #ifdef USE_INSTANCING
    p88=instanceMatrix*p88;
   #endif
   arenaPosition88=(modelMatrix*p88).xyz;arenaNormal88=inverseTransformDirection(transformedNormal,viewMatrix);`);
  if(tiled){s.fragmentShader='varying vec3 arenaPosition88,arenaNormal88;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec3 weights88=pow(abs(normalize(arenaNormal88)),vec3(4.));weights88/=max(.0001,weights88.x+weights88.y+weights88.z);vec3 p88=arenaPosition88*.19;
   vec3 native88=texture2D(map,p88.zy).rgb*weights88.x+texture2D(map,p88.xz).rgb*weights88.y+texture2D(map,p88.xy).rgb*weights88.z;diffuseColor.rgb*=native88;
   #endif`);}
 };m.customProgramCacheKey=()=>`arena88-native-${tiled}-${wind}`;lightPaintedSurface82(m);b.materials.set(id,m);return m;
}
function arenaGeometry88(b,id,create){if(!b.geometries.has(id))b.geometries.set(id,geometry59(create()));return b.geometries.get(id);}
function arenaInstance88(b,key,geometry,material,position,scale=V3(1,1,1),rotation=new THREE.Quaternion(),color=null){
 const id=key+'|'+material.uuid;if(!b.batches.has(id))b.batches.set(id,{geometry,material,rows:[],colors:[]});const batch=b.batches.get(id);batch.rows.push(new THREE.Matrix4().compose(position,rotation,scale));batch.colors.push(color);
}
function arenaBox88(b,p,size,key='wall',color='#ffffff',angle=0){const g=arenaGeometry88(b,'box',()=>new THREE.BoxGeometry(1,1,1));arenaInstance88(b,'box',g,arenaMaterial88(b,key,color),V3(...p),V3(...size),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),angle));}
function arenaBeam88(b,a,c,width,key='bark',color='#ffffff'){
 const start=V3(...a),end=V3(...c),delta=end.clone().sub(start),g=arenaGeometry88(b,'beam',()=>new THREE.CylinderGeometry(.72,1,1,7,1));arenaInstance88(b,'beam',g,arenaMaterial88(b,key,color),start.add(end).multiplyScalar(.5),V3(width,delta.length(),width),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),delta.normalize()));
}
function arenaRock88(b,x,z,sx=3,sy=3,sz=3,variant=0,y=null){
 const g=arenaGeometry88(b,'rock'+variant,()=>rockGeometry62(variant%12).clone()),key=b.spec.snow?'snow':'env62_stone',m=arenaMaterial88(b,key,b.spec.cave?'#91a7b3':b.spec.autumn?'#b8b09b':'#c5c7b4');
 if(!g.boundingBox)g.computeBoundingBox();const bottom=y??arenaFloor88(b,x,z)-sy*.25;arenaInstance88(b,'rock'+variant,g,m,V3(x,bottom-g.boundingBox.min.y*sy-.10*sy,z),V3(sx,sy,sz),new THREE.Quaternion().setFromEuler(new THREE.Euler((b.rng()-.5)*.12,b.rng()*TAU,(b.rng()-.5)*.1)));
}
function arenaTree88(b,x,z,size=1,kind=b.spec.trees){
 const y=arenaFloor88(b,x,z),rng=b.rng,h=(kind==='pine'?17:14)*size,birch=kind==='birch',pine=kind==='pine',willow=kind==='willow',bark=birch?'bark':pine?'barkPine86':'env62_bark';
 const top=V3(x+(rng()-.5)*size,y+h,z+(rng()-.5)*size),root=V3(x,y-.12,z),fork=V3(x,y+h*.46,z);arenaBeam88(b,root.toArray(),fork.toArray(),(birch?.20:.42)*size,bark,birch?'#e1dfcd':'#a18c70');arenaBeam88(b,fork.toArray(),top.toArray(),.22*size,bark,birch?'#dedacc':'#a18c70');
 const leaf=kind==='pine'?'leafPine30':birch?'leafBirch30':kind==='autumn'?'leafMaple30':willow?'leafWillow30':kind==='orchard'?'leafBlossom30':'leafOak30',leafColor=kind==='autumn'?'#dfa35e':kind==='orchard'?'#ccd49a':pine?'#9fbd9d':willow?'#a1c78a':'#b3d093',m=arenaMaterial88(b,leaf,leafColor,{cutout:true,wind:true}),g=arenaGeometry88(b,'foliage',()=>branchSpray66(16).clone());
 const branches=pine?12:6,turn=rng()*TAU;
 for(let i=0;i<branches;i++){
  const a=turn+i*2.399,level=pine?.30+(i%4)*.15:.56+(i%3)*.10,reach=(pine?3.6*(1-level*.65):willow?5.8:4.6)*size;
  const from=V3(x,y+h*(pine?level:.46),z),tip=V3(x+Math.cos(a)*reach,y+h*(pine?level+.12:level+.12),z+Math.sin(a)*reach);arenaBeam88(b,from.toArray(),tip.toArray(),(pine?.11:.16)*size,bark,birch?'#dedacc':'#9d896e');
  for(let j=0;j<(b.mobile?3:5);j++){const angle=a+j*1.5,spread=(.5+j*.32)*size,p=tip.clone().add(V3(Math.cos(angle)*spread,willow?-j*.56*size:(j%2)*.72*size,Math.sin(angle)*spread)),s=(pine?1.9:2.6)*size;arenaInstance88(b,'foliage',g,m,p,V3(s,s*.75,s),new THREE.Quaternion().setFromEuler(new THREE.Euler((rng()-.5)*.8,angle,(rng()-.5)*.4)));}
 }
 if(kind==='orchard'){const fruit=arenaGeometry88(b,'fruit',()=>new THREE.IcosahedronGeometry(.14,1)),fm=arenaMaterial88(b,null,'#a8442d');for(let i=0;i<9;i++){const a=i*2.4;arenaInstance88(b,'fruit',fruit,fm,V3(x+Math.cos(a)*3.4*size,y+h*.72+(i%3)*size,z+Math.sin(a)*3.4*size),V3(size,size,size));}}
 b.counts.trees++;
}
function arenaPondShape88(b,x,z){
 if(b.spec.sea)return clamp((-z-15)/15,0,1);
 if(b.spec.river){const centre=-34+Math.sin(x*.045)*5;return 1-smooth(6,11,Math.abs(z-centre));}
 if(!b.spec.lake)return 0;return 1-smooth(.91,1.10,Math.hypot(x/(b.spec.cave?25:34),(z+38)/(b.spec.cave?12:18)));
}
function arenaHeight88(b,x,z){
 const s=b.spec,outside=Math.hypot(Math.max(0,Math.abs(x)-25),Math.max(0,-z-15,z-17)),far=smooth(0,70,outside),noise=(Math.sin(x*.052+Math.cos(z*.041))*2.5+Math.sin(z*.065+x*.024)*2)*far;
 let height=Math.max(0,noise)+(s.highland?Math.pow(Math.max(0,-z-55),1.1)*.055:0);
 if(s.highland){const mountain=s.snow||s.ground==='barren',ridge=smooth(50,90,-z)*(1-smooth(185,240,-z)),peaks=Math.pow(Math.abs(Math.sin(x*.033+1.2)+.35*Math.sin(x*.092)),1.3);height+=ridge*(mountain?13+peaks*23:5+peaks*7);}
 if(s.falls)height+=smooth(49,68,-z)*22*Math.exp(-x*x/5200);
 if(s.cave)height=Math.max(0,noise*.23);if(s.sea&&z< -13)height=mix(height,-5,smooth(13,30,-z));
 const wet=arenaPondShape88(b,x,z);height=mix(height,-3.4,wet);
 if(Math.abs(x)<25&&z> -14&&z<17)height=0;return height;
}
function arenaFloor88(b,x,z){return b.floor?b.floor(x,z):arenaHeight88(b,x,z);}
function arenaGround88(b){
 const xs=[-210,-190,-170,-150,-135,-120,-105,-92,-82,-74,-66,...Array.from({length:111},(_,i)=>i-55),66,74,82,92,105,120,135,150,170,190,210],zs=[-230,-210,-190,-175,-160,-145,-130,-118,-106,-96,-86,...Array.from({length:116},(_,i)=>-75+i),48,60,78,105],p=[],uv=[],weights=[],colors=[],index=[];
 for(const z of zs)for(const x of xs){const y=arenaHeight88(b,x,z),s=b.spec,soil=(1-smooth(.65,1.15,Math.hypot(x/24,(z-1)/14)))*(s.meadow||s.ground.startsWith('grass')?.55:1),slope=Math.max(Math.abs(arenaHeight88(b,x+1,z)-arenaHeight88(b,x-1,z)),Math.abs(arenaHeight88(b,x,z+1)-arenaHeight88(b,x,z-1)));
  p.push(x,y-.018,z);uv.push(x*.12,z*.12);weights.push(soil,smooth(1.6,4,slope),0);const tint=new THREE.Color(s.snow?'#e1e9ec':s.cave?'#83929e':s.autumn?'#cab77a':s.coast?'#dfd0a8':s.twilight?'#b4b0a5':'#d2d1b5');colors.push(tint.r,tint.g,tint.b);
 }
 for(let z=0;z<zs.length-1;z++)for(let x=0;x<xs.length-1;x++){const a=z*xs.length+x,c=a+xs.length;index.push(a,c,a+1,a+1,c,c+1);}
 const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('arenaBlend88',new THREE.Float32BufferAttribute(weights,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(index);g.computeVertexNormals();g.computeBoundingSphere();
 const base=b.spec.ground,soil=b.spec.snow?'snow':b.spec.cave?'env62_stone':b.spec.coast?'earth':base.includes('cobble')?base:'earth',m=material59(new THREE.MeshStandardMaterial({map:arenaTexture88(base),normalMap:arenaTexture88('normal28_'+base,true),vertexColors:true,roughness:.93,metalness:0}));m.normalScale.setScalar(.34);
 m.onBeforeCompile=s=>{s.uniforms.arenaSoil88={value:arenaTexture88(soil)};s.uniforms.arenaRock88={value:arenaTexture88(b.spec.snow?'snow':'env62_stone')};s.vertexShader='attribute vec3 arenaBlend88;varying vec3 groundBlend88;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngroundBlend88=arenaBlend88;');s.fragmentShader='uniform sampler2D arenaSoil88,arenaRock88;varying vec3 groundBlend88;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
  vec3 ground88=mix(texture2D(map,vMapUv).rgb,texture2D(arenaSoil88,vMapUv).rgb,groundBlend88.x);ground88=mix(ground88,texture2D(arenaRock88,vMapUv).rgb,groundBlend88.y);diffuseColor.rgb*=ground88;
  #endif`);};m.customProgramCacheKey=()=> 'arena88-physical-ground';lightPaintedSurface82(m);
 const o=new THREE.Mesh(g,m);o.name='Actual level ground and carved water banks';o.receiveShadow=true;b.group.add(o);b.counts.groundVertices=p.length/3;
 // Props sit on the triangles actually rendered, including the coarser far
 // mountain grid; sampling the analytic hill alone can leave roots floating.
 const cell=(axis,v)=>{let lo=0,hi=axis.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(axis[mid]<=v)lo=mid;else hi=mid;}return Math.min(axis.length-2,lo);};
 b.floor=(x,z)=>{const i=cell(xs,x),j=cell(zs,z),tx=clamp((x-xs[i])/(xs[i+1]-xs[i]),0,1),tz=clamp((z-zs[j])/(zs[j+1]-zs[j]),0,1),a=j*xs.length+i,y00=p[a*3+1],y10=p[(a+1)*3+1],y01=p[(a+xs.length)*3+1],y11=p[(a+xs.length+1)*3+1];return tx+tz<=1?y00*(1-tx-tz)+y10*tx+y01*tz:y11*(tx+tz-1)+y10*(1-tz)+y01*(1-tx);};
}
function arenaSky88(b){
 const cave=b.spec.cave,twilight=b.spec.twilight,top=new THREE.Color(cave?'#071522':b.night?'#071426':twilight?'#55547b':'#86b5d7'),horizon=new THREE.Color(cave?'#253945':b.night?'#1c3047':twilight?'#dda789':'#c8d6cf');
 encounter53.scene.background=horizon.clone();encounter53.scene.fog=new THREE.Fog(horizon,cave?85:120,cave?210:310);
 const g=geometry59(new THREE.SphereGeometry(420,40,20)),m=material59(new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:false,uniforms:{top:{value:top},horizon:{value:horizon}},vertexShader:'varying float elevation;void main(){elevation=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top,horizon;varying float elevation;void main(){gl_FragColor=vec4(mix(horizon,top,smoothstep(-.02,.75,elevation)),1.);\n#include <colorspace_fragment>\n}'}));const sky=new THREE.Mesh(g,m);sky.name='Three-dimensional sky dome';sky.renderOrder=-50;sky.frustumCulled=false;b.group.add(sky);
 if(cave)return;
 const cloudGeo=arenaGeometry88(b,'cloud',()=>new THREE.PlaneGeometry(1,1)),cloudMat=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,uniforms:{time:stageDepth59.time,mask:{value:arenaTexture88('cloudMask')},tint:{value:new THREE.Color(b.night?'#52657c':'#f5f1df')},strength:{value:b.night?.13:.26}},vertexShader:'uniform float time;varying vec2 v;void main(){v=uv;vec3 p=position;p.x+=sin(time*.016)*6.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'uniform sampler2D mask;uniform vec3 tint;uniform float strength;varying vec2 v;void main(){float edge=sin(v.x*3.14159265)*sin(v.y*3.14159265);float a=smoothstep(.25,.75,texture2D(mask,v).r)*edge*strength;if(a<.006)discard;gl_FragColor=vec4(tint,a);\n#include <colorspace_fragment>\n}'}));
 for(let i=0;i<5;i++){const o=new THREE.Mesh(cloudGeo,cloudMat);o.position.set(-145+i*72,70+(i%2)*13,-180-(i%3)*22);o.rotation.x=Math.PI*.16;o.scale.set(115,34,1);o.name='Moving cloud volume';b.group.add(o);}
 const moon=arenaGeometry88(b,'sun-moon',()=>new THREE.SphereGeometry(1,18,12)),mm=material59(new THREE.MeshBasicMaterial({color:b.night?'#d6e9ee':'#fff1cb',fog:false})),o=new THREE.Mesh(moon,mm);o.position.set(b.night?-105:-125,95,-235);o.scale.setScalar(b.night?5.2:6.5);o.name=b.night?'Moon':'Distant sun';b.group.add(o);
}
function arenaWater88(b){
 if(!b.spec.lake&&!b.spec.river&&!b.spec.sea)return;
 const p=[],uv=[],depth=[],flow=[],idx=[],nx=b.spec.sea?70:64,nz=32;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  let x,z;if(b.spec.sea){x=mix(-210,210,i/nx);z=mix(-230,-16,j/nz);}else if(b.spec.river){x=mix(-190,190,i/nx);z=-34+Math.sin(x*.045)*5+mix(-10,10,j/nz);}else{x=mix(b.spec.cave?-26:-36,b.spec.cave?26:36,i/nx);z=mix(b.spec.cave?-51:-58,b.spec.cave?-25:-18,j/nz);}
  const bed=arenaFloor88(b,x,z),d=Math.max(0,-.35-bed);p.push(x,-.35,z);uv.push(x*.12,z*.12);depth.push(d);flow.push(.35,1);
 }
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,c=a+nx+1;idx.push(a,c,a+1,a+1,c,c+1);}
 const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('waterDepth18',new THREE.Float32BufferAttribute(depth,1));g.setAttribute('channelFlow39',new THREE.Float32BufferAttribute(flow,2));g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(new Float32Array(depth.length),1));g.setIndex(idx);g.computeVertexNormals();
 const field=new THREE.DataTexture(new Float32Array([encounter53.floorY-3.4,50,50,encounter53.floorY-.35]),1,1,THREE.RGBAFormat,THREE.FloatType);field.needsUpdate=true;b.ownedTextures.push(field);
 const object=new THREE.Mesh(g,new THREE.MeshStandardMaterial());object.material.userData.water18=true;const m=material59(waterMaterial62(object,{texture:field,bounds:new THREE.Vector4(encounter53.center.x-230,encounter53.center.z-240,460,400)}));object.material.dispose();object.material=m;
 const u=waterUniforms62.get(m);u.day62={value:b.night?0:1};u.key62={value:sun.color.clone()};u.sky62={value:hemi.color.clone()};u.sun62={value:sun.position.clone().sub(sun.target.position).normalize()};u.keyPower62={value:b.night?.18:.8};u.hydraulic62={value:.55};u.reflect62={value:0};lightPaintedSurface82(m);
 object.name=b.spec.sea?'Actual three-dimensional ocean':'Flowing water in the carved basin';object.receiveShadow=true;b.group.add(object);b.counts.water++;
 if(b.spec.falls){
  const width=b.spec.meadow?13:18,p=[],uv=[],index=[],rows=24,cols=16;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const t=j/rows,x=(i/cols-.5)*width,y=mix(23,-.25,t),z=-54+t*5+Math.sin(t*5)*.22;p.push(x,y,z);uv.push(i/cols,t);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,c=a+cols+1;index.push(a,c,a+1,a+1,c,c+1);}
  const fg=geometry59(new THREE.BufferGeometry());fg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));fg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));fg.setIndex(index);fg.computeVertexNormals();
  const fm=material59(new THREE.MeshStandardMaterial({map:arenaTexture88('riverSurface18'),color:'#bbd9d6',roughness:.23,metalness:0,side:THREE.DoubleSide,transparent:true,opacity:.88}));fm.onBeforeCompile=s=>{s.uniforms.arenaTime88=stageDepth59.time;s.vertexShader='varying vec2 fallUV88;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfallUV88=uv;');s.fragmentShader='uniform float arenaTime88;varying vec2 fallUV88;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`vec2 flow88=vec2(fallUV88.x*2.4,fallUV88.y*1.8+arenaTime88*.22);vec3 water88=texture2D(map,flow88).rgb;diffuseColor.rgb*=mix(vec3(.60,.77,.78),vec3(1.15),water88.g);diffuseColor.a*=smoothstep(0.,.04,fallUV88.x)*(1.-smoothstep(.96,1.,fallUV88.x));`);};fm.customProgramCacheKey=()=> 'arena88-physical-falls';lightPaintedSurface82(fm);const fall=new THREE.Mesh(fg,fm);fall.name='Flowing waterfall geometry';fall.receiveShadow=true;b.group.add(fall);b.counts.waterfalls++;
 }
}
function arenaFence88(b,x,z,length,angle=0){
 const dx=Math.cos(angle),dz=Math.sin(angle);for(let t=-length/2;t<=length/2;t+=3){const px=x+dx*t,pz=z+dz*t,y=arenaFloor88(b,px,pz);arenaBox88(b,[px,y+.75,pz],[.20,1.5,.20],'wood','#b19b75');}
 for(const h of[.45,1.1])arenaBeam88(b,[x-dx*length/2,arenaFloor88(b,x,z)+h,z-dz*length/2],[x+dx*length/2,arenaFloor88(b,x,z)+h,z+dz*length/2],.08,'wood','#bba780');
}
function arenaRoof88(b,x,y,z,w,h,d,key='slate',color='#b6c6ce'){
 const g=arenaGeometry88(b,'roof',()=>{const g=new THREE.BufferGeometry(),p=[-.5,0,-.5,.5,0,-.5,0,.5,-.5,-.5,0,.5,.5,0,.5,0,.5,.5],uv=[0,0,1,0,.5,1,0,0,1,0,.5,1];g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,2,5,4,2,4,1]);g.computeVertexNormals();return g;});arenaInstance88(b,'roof',g,arenaMaterial88(b,key,color),V3(x,y,z),V3(w,h,d));
}
function arenaHouse88(b,x,z,w=11,d=8){
 const y=arenaFloor88(b,x,z),h=6.5;arenaBox88(b,[x,y+.55,z],[w+1,1.1,d+1],'wall','#c9c6ad');arenaBox88(b,[x,y+3.6,z],[w,h,d],'plasterA','#e6dcc0');arenaRoof88(b,x,y+6.8,z,w+1.5,5,d+1.5);arenaBox88(b,[x+2.6,y+10,z-2],[1.1,4,1.2],'wallA','#c6bfaa');
 for(const dx of[-w/2+.15,0,w/2-.15])arenaBox88(b,[x+dx,y+3.6,z+d/2+.09],[.23,6.5,.25],'timberOld86','#9c8569');for(const yy of[1.1,4.5,6.6])arenaBox88(b,[x,y+yy,z+d/2+.14],[w+.3,.22,.3],'wood','#a98f6c');
 arenaBox88(b,[x-1.5,y+1.65,z+d/2+.18],[1.4,2.8,.15],'darkWood','#9d815f');
 const pane=arenaMaterial88(b,null,'#c6aa70',{emissive:'#ffc77c'});pane.roughness=.18;pane.envMap=surface67.outdoor;pane.envMapIntensity=b.night?.25:.5;
 for(const dx of[-w*.28,w*.28])for(const yy of[2.2,5.3]){arenaBox88(b,[x+dx,y+yy,z+d/2+.2],[1.55,1.6,.2],'darkWood','#9e8769');const g=arenaGeometry88(b,'box',()=>new THREE.BoxGeometry(1,1,1));arenaInstance88(b,'glass',g,pane,V3(x+dx,y+yy,z+d/2+.32),V3(1.23,1.28,.05));arenaBox88(b,[x+dx,y+yy,z+d/2+.37],[.075,1.35,.06],'wood','#9c8569');arenaBox88(b,[x+dx,y+yy,z+d/2+.37],[1.3,.075,.06],'wood','#9c8569');}
 if(b.night){const l=new THREE.PointLight('#ffc077',7,15,2);l.position.set(x,y+3.6,z+d/2+1);b.group.add(l);}b.counts.buildings++;
}
function arenaArch88(b,x,z,width=10,height=10){
 const y=arenaFloor88(b,x,z),stone='#c7c7ae';for(const side of[-1,1]){arenaBox88(b,[x+side*(width/2+1),y+height*.35,z],[2,height*.7,2.7],'wallA',stone);arenaBox88(b,[x+side*(width/2+1),y+.45,z],[2.6,.9,3.2],'wall',stone);}
 const count=13,r=width/2+1;for(let i=0;i<count;i++){const a=(i+.5)/count*Math.PI,px=x+Math.cos(a)*r,py=y+height*.67+Math.sin(a)*r;const g=arenaGeometry88(b,'box',()=>new THREE.BoxGeometry(1,1,1));arenaInstance88(b,'arch',g,arenaMaterial88(b,'wallA',stone),V3(px,py,z),V3(r*Math.PI/count+0.12,1.35,2.7),new THREE.Quaternion().setFromAxisAngle(V3(0,0,1),a-Math.PI/2));}b.counts.arches++;
}
function arenaBridge88(b){
 const x=15,z=-34+Math.sin(15*.045)*5,length=25,y=.8;arenaBox88(b,[x,y,z],[4.2,.55,length],'wood','#c8b18a');for(let i=0;i<15;i++)arenaBox88(b,[x,y+.29,z-length/2+(i+.5)*length/15],[4.25,.07,length/15-.04],'wood','#bfaa83');
 for(const side of[-1,1]){for(let j=0;j<=5;j++){const zz=z-length/2+j*length/5;arenaBox88(b,[x+side*2,y+.9,zz],[.2,1.8,.2],'wood','#a58d6b');arenaBox88(b,[x+side*2,y-1.6,zz],[.28,4,.28],'wood','#95846a');}arenaBeam88(b,[x+side*2,y+1.6,z-length/2],[x+side*2,y+1.6,z+length/2],.10,'wood','#bea77f');}b.counts.bridges++;
}
function arenaWindmill88(b,x,z){
 const y=arenaFloor88(b,x,z);arenaBox88(b,[x,y+5,z],[6.5,10,6.5],'wallA','#d0c6a8');arenaRoof88(b,x,y+10,z,8,6,8,'wood','#ae9671');const rotor=new THREE.Group();rotor.position.set(x,y+9.8,z+3.9);b.group.add(rotor);
 const shaft=new THREE.Mesh(arenaGeometry88(b,'beam',()=>new THREE.CylinderGeometry(.72,1,1,7,1)),arenaMaterial88(b,'wood','#b9a17c'));shaft.rotation.x=Math.PI/2;shaft.scale.set(.35,2,.35);rotor.add(shaft);
 for(let i=0;i<4;i++){const g=new THREE.Group();g.rotation.z=i*Math.PI/2;rotor.add(g);const beam=new THREE.Mesh(arenaGeometry88(b,'box',()=>new THREE.BoxGeometry(1,1,1)),arenaMaterial88(b,'wood','#bda983'));beam.position.y=4;beam.scale.set(.25,9,.25);g.add(beam);const sail=new THREE.Mesh(arenaGeometry88(b,'box',()=>new THREE.BoxGeometry(1,1,1)),arenaMaterial88(b,'canvas86','#e2d7b8'));sail.position.set(.85,5,.05);sail.scale.set(1.65,5,.10);g.add(sail);}
 arena88.motion.push({object:rotor,type:'rotor'});b.counts.windmills++;
}
function arenaDressing88(b){
 const s=b.spec,r=b.rng;
 // Keep the fight floor open. Trees grow in irregular groups around it,
 // with a lower understory and a distant second canopy rather than a wall.
 if(s.trees){
  const count=s.dense?46:s.meadow?22:s.farm?17:28;
  for(let i=0;i<count;i++){
   const side=i%2?-1:1,x=side*(25+r()*47),z=-52+r()*79;
   if(arenaPondShape88(b,x,z)>.2)continue;
   if(s.farm&&side<0&&z< -20)continue;
   arenaTree88(b,x,z,.72+r()*.52);
  }
  for(let i=0;i<(s.dense?28:16);i++){const x=-110+r()*220,z=-86-r()*56;if(!s.falls||Math.abs(x)>24)arenaTree88(b,x,z,1+r()*.65);}
  for(let i=0;i<17;i++){const x=-74+i*9+(r()-.5)*12,z=-36-r()*29;if(arenaPondShape88(b,x,z)>.1||s.falls&&Math.abs(x)<27||s.farm&&x<0)continue;arenaTree88(b,x,z,.65+r()*.8);}
  for(const side of[-1,1])arenaTree88(b,side*26,-8,1.15);
 }
 const n=s.cave?35:s.cliffs?40:22;
 for(let i=0;i<n;i++){
  const x=(i%2?-1:1)*(25+r()*42),z=-60+r()*88;if(arenaPondShape88(b,x,z)>.2)continue;
  const size=.7+r()*2.6;arenaRock88(b,x,z,size,size*(.35+r()*.65),size*(.6+r()*.5),i%12);b.counts.rocks++;
 }
 if(s.cliffs||s.highland||s.downs){
  for(let i=0;i<19;i++){
   const x=-155+i*18+(r()-.5)*14,z=-100-r()*62;
   if(s.sea&&x> -20)continue;
   const scale=12+r()*15;arenaRock88(b,x,z,scale,scale*(s.highland?1.5:.7),scale*.75,5+i%6);b.counts.cliffs++;
  }
 }
 if(s.falls){
  for(const side of[-1,1])for(let i=0;i<7;i++){const x=side*(16+r()*28),z=-61+(r()-.5)*14;arenaRock88(b,x,z,8+r()*5,12+r()*7,7+r()*6,4+i%6,-4);b.counts.cliffs++;}
  // Low stones follow the actual basin shore, never sit on the water sheet.
  for(let i=0;i<28;i++){const a=i/28*TAU,x=Math.cos(a)*36,z=-38+Math.sin(a)*19;if(z< -44)continue;arenaRock88(b,x,z,.8+r()*1.8,.5+r(),.9+r(),i%12);}
 }
 if(s.cave){
  for(let i=0;i<32;i++){const a=i/32*TAU,x=Math.cos(a)*48,z=-22+Math.sin(a)*48;if(z>4&&Math.abs(x)<32)continue;arenaRock88(b,x,z,7+r()*8,12+r()*12,7+r()*6,i%12);}
  for(let i=0;i<20;i++){const x=(i%2?-1:1)*(27+r()*26),z=-45+r()*58,y=arenaFloor88(b,x,z);const g=arenaGeometry88(b,'crystal',()=>new THREE.CylinderGeometry(0,.7,1,5,1)),m=arenaMaterial88(b,'lightFacets','#74bdd2',{emissive:'#266b92'});arenaInstance88(b,'crystal',g,m,V3(x,y+1.5,z),V3(.5+r(),3+r()*4,.5+r()),new THREE.Quaternion().setFromAxisAngle(V3(0,0,1),(r()-.5)*.4));b.counts.crystals++;}
  for(const x of[-27,28]){const l=new THREE.PointLight('#63b9df',12,30,2);l.position.set(x,4,-24);b.group.add(l);}
 }
 if(s.ruins){
  arenaArch88(b,-12,-29,10,10);arenaArch88(b,15,-38,8,8);
  for(let i=0;i<9;i++){const x=-32+i*8,z=-48+(i%2)*5,y=arenaFloor88(b,x,z),h=3+r()*7;arenaBox88(b,[x,y+h/2,z],[2,h,2],'wallA','#b5b99e');arenaBox88(b,[x,y+.45,z],[3,.9,3],'wall','#aeb59a');}
  for(const side of[-1,1])arenaFence88(b,side*29,-1,30,Math.PI/2);
 }
 if(s.royal){
  for(const x of[-17,17]){arenaHouse88(b,x,-48,12,10);const y=arenaFloor88(b,x,-48);arenaBox88(b,[x,y+14,-50],[7,14,7],'wallA','#c5c7b6');arenaRoof88(b,x,y+21,-50,9,8,9);}
  arenaArch88(b,0,-47,18,12);arenaFence88(b,-30,-13,34,Math.PI/2);arenaFence88(b,30,-13,34,Math.PI/2);
 }
 if(s.coast){const x=-29,z=-48,y=1;arenaRock88(b,x,z,10,6,10,0,-5);arenaBox88(b,[x,y+7,z],[7,14,7],'wallA','#cecbb7');arenaRoof88(b,x,y+14,z,9,7,9);b.counts.buildings++;}
 if(s.farm){
  arenaHouse88(b,24,-48,11,8);arenaFence88(b,-28,-20,32,Math.PI/2);arenaFence88(b,26,-23,30,0);
  for(let i=0;i<5;i++)for(let j=0;j<8;j++){const x=29+i*1.1,z=-36+j*1.2,y=arenaFloor88(b,x,z);arenaBeam88(b,[x,y,z],[x,y+.7,z],.035,'grassA','#a6a56a');}
  if(s.trees==='orchard')for(let i=0;i<3;i++)for(let j=0;j<4;j++)arenaTree88(b,-31-i*9,-28-j*10,.67,'orchard');
 }
 if(s.windmill)arenaWindmill88(b,-26,-39);
 if(s.bridge)arenaBridge88(b);
 if(s.trees&&!s.snow){const g=arenaGeometry88(b,'understory',()=>branchSpray66(12).clone()),m=arenaMaterial88(b,'fern','#b0c58a',{cutout:true,wind:true});for(let i=0;i<(b.mobile?70:130);i++){const x=-65+r()*130,z=-65+r()*84;if(Math.abs(x)<21&&z> -16||arenaPondShape88(b,x,z)>.1)continue;const size=.36+r()*.46;arenaInstance88(b,'understory',g,m,V3(x,arenaFloor88(b,x,z)+.2,z),V3(size,size,size),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),r()*TAU));}}
 if(s.stones||s.elder){for(let i=0;i<(s.elder?4:7);i++){const x=-30+i*10,z=-28-(i%2)*6;arenaRock88(b,x,z,1.3,2.8+r()*2,1.2,2);b.counts.standingStones++;}if(s.elder){const l=new THREE.PointLight('#84c8c8',7,23,2);l.position.set(0,3,-29);b.group.add(l);}}
 // Individual narrow blades with a tapered tip, not round grass blobs.
 if(!s.cave&&!s.snow){
  const blade=arenaGeometry88(b,'grass-blades',()=>{const g=new THREE.BufferGeometry(),p=[],uv=[];for(let j=0;j<5;j++){const a=j*2.4,x=Math.cos(a)*.12,z=Math.sin(a)*.12,h=.35+(j%3)*.12;p.push(x-.025,0,z,x+.025,0,z,x+.08,h,z+.025);uv.push(0,0,1,0,.5,1);}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}),m=arenaMaterial88(b,null,s.autumn?'#ad985e':s.twilight?'#8d91aa':'#7f9d58',{cutout:true,wind:true});
  for(let i=0;i<(b.mobile?700:1400);i++){const x=-72+r()*144,z=-78+r()*113;if(Math.abs(x)<21&&z> -14&&z<18||arenaPondShape88(b,x,z)>.18)continue;const y=arenaFloor88(b,x,z),size=.65+r();arenaInstance88(b,'grass-blades',blade,m,V3(x,y-.04,z),V3(size,size,size),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),r()*TAU));b.counts.grass++;}
 }
 const petals=arenaGeometry88(b,'flower',()=>new THREE.SphereGeometry(.10,5,3));
 for(let i=0;i<(s.flowers??0);i++){const x=-48+r()*96,z=-39+r()*66;if(Math.abs(x)<20&&z> -14&&z<17||arenaPondShape88(b,x,z)>.1)continue;const y=arenaFloor88(b,x,z),h=.3+r()*.35;arenaBeam88(b,[x,y,z],[x,y+h,z],.018,null,'#698553');const m=arenaMaterial88(b,null,['#d6c16d','#d2cabb','#b59ac7','#b9bfd0'][i%4]);arenaInstance88(b,'flower',petals,m,V3(x,y+h,z),V3(1.2,.55,1.2));b.counts.flowers++;}
}
function flushArena88(b){
 for(const [key,rows]of b.batches){const o=new THREE.InstancedMesh(rows.geometry,rows.material,rows.rows.length);rows.rows.forEach((m,i)=>o.setMatrixAt(i,m));o.instanceMatrix.needsUpdate=true;o.name='Physical '+key.split('|')[0];o.castShadow=true;o.receiveShadow=true;o.computeBoundingSphere();o.matrixAutoUpdate=false;b.group.add(o);b.counts.instances+=rows.rows.length;b.counts.batches++;}
}
function buildArena88(){
 const q=stageDepth59,c=encounter53;if(!c.active||!battle)return;
 const key=[c.selected,c.phase55].join('|');if(q.group&&arena88.current?.key===key)return;
 clearStageDepth59();q.stage=c.selected;q.aspect=camera.aspect;q.stats.builds++;q.time.value=clock;q.group=new THREE.Group();q.group.name='Physical arena: '+BATTLE_STAGES53[c.selected].name;q.group.position.set(c.center.x,c.floorY,c.center.z);c.scene.add(q.group);
 const b={key,group:q.group,spec:ARENAS88[c.selected],rng:seeded(880127+Object.keys(ARENAS88).indexOf(c.selected)*107),night:c.phase55==='night',mobile:mobileBattle69(),materials:new Map(),geometries:new Map(),batches:new Map(),ownedTextures:[],counts:{trees:0,rocks:0,cliffs:0,crystals:0,buildings:0,arches:0,bridges:0,windmills:0,standingStones:0,flowers:0,grass:0,water:0,waterfalls:0,instances:0,batches:0,groundVertices:0}};
 if(b.night){sun.color.set('#9bbce3');sun.intensity=1.25;hemi.color.set('#708ba8');hemi.intensity=.8;c.resources.fill.intensity=.24;}else if(b.spec.cave){sun.intensity=1.5;hemi.intensity=.85;}
 arena88.current=b;arena88.builds++;c.resources.backdrop.visible=false;c.resources.floor.visible=false;q.occluders=[];
 arenaSky88(b);arenaGround88(b);arenaWater88(b);arenaDressing88(b);flushArena88(b);b.group.updateMatrixWorld(true);
 q.summary={physicalScenery88:true,referenceProjection:false,stage:c.selected,phase:c.phase55,...b.counts};q.landscape=null;
}
buildStageScenery59=buildArena88;
const arenaClearBefore88=clearStageDepth59;
clearStageDepth59=function(...args){const b=arena88.current;if(b){for(const t of b.ownedTextures)t.dispose();arena88.disposed++;arena88.current=null;}arena88.motion=[];return arenaClearBefore88(...args);};
const arenaRenderBefore88=render;
render=function(...args){for(const m of arena88.motion)if(m.type==='rotor')m.object.rotation.z=clock*.18;return arenaRenderBefore88(...args);};
const arenaBootBefore88=boot;
boot=async function(...args){const r=await arenaBootBefore88(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const s=JSON.parse(before());s.physicalArena88=encounter53.active?stageDepth59.summary:null;return JSON.stringify(s);};return r;};
