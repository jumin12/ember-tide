// Natural botanical silhouettes replace the large, flat-coloured triangle
// blades and polygon daisies. All surfaces remain opaque alpha cutouts with
// Standard PBR shading, clean depth writes and a rooted, height-weighted sway.
function groundcoverGeometry102(kind,far=false){
 if(kind==='grassBlades')return curvedGrass102(far);
 const key='natural-cover102-'+kind+'-'+far;if(sharedGeo[key])return sharedGeo[key];const p=[],uv=[],n=far?2:3,grass=kind==='grassBlades',flower=kind==='flowers',height=grass?.73:flower?.88:.72,width=grass?1.12:flower?.53:.98;
 const put=(q,u,v)=>{p.push(q.x,q.y,q.z);uv.push(u,v)};
 for(let i=0;i<n;i++){const a=i*Math.PI/n+.21,right=V3(Math.cos(a),0,Math.sin(a)),out=V3(-Math.sin(a),0,Math.cos(a)),point=(u,v)=>right.clone().multiplyScalar((u-.5)*width).addScaledVector(out,Math.sin(v*Math.PI)*.065).add(V3(0,-.465+v*height,0));
  for(let j=0;j<3;j++){const v=j/3,w=(j+1)/3;for(const [u,t]of[[0,v],[1,v],[0,w],[1,v],[1,w],[0,w]])put(point(u,t),u,t)}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();g.boundingSphere.radius+=.3;g.userData.naturalCover102=true;return sharedGeo[key]=g;
}
function groundcoverMaterial102(kind,range){
 const m=new THREE.MeshStandardMaterial({map:environment102.maps.get(kind==='flowers'?'daisies102':kind==='fern'?'fernFine102':'grassLushFine102'),bumpMap:environment102.maps.get('botanicalLeaf102'),bumpScale:.018,color:'#eeeedd',roughness:kind==='grassBlades'?.94:.87,metalness:0,side:THREE.DoubleSide,alphaTest:kind==='grassBlades'?.075:.18,alphaToCoverage:false,transparent:false,depthWrite:true});m.uniformsForDistance={range:range??{value:new THREE.Vector2(76,88)}};addCloudLighting(m);lightPaintedSurface82(m);
 if(kind==='grassBlades'){m.map=environment102.maps.get('botanicalLeaf102');m.alphaTest=0;m.userData.curvedGrass102=true}else if(kind==='fern')m.alphaTest=.68;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);Object.assign(s.uniforms,{worldCover102:{value:environment102.groundcover},coverRects102:{value:environment102.coverRects},windTime:windUniforms.time,windStrength:windUniforms.strength,actor:typeof botanicalFocus103!=='undefined'?botanicalFocus103:windUniforms.actor,plantRange:m.uniformsForDistance.range});s.vertexShader='attribute float botanicalStyle102;varying float styleCover102;uniform float windTime,windStrength;uniform vec3 actor;uniform vec2 plantRange;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   styleCover102=botanicalStyle102;vec3 rootCover102=(instanceMatrix*vec4(0.,-.465,0.,1.)).xyz;float flexCover102=max(0.,position.y+.465);float swayCover102=sin(windTime*1.1+rootCover102.x*.34+rootCover102.z*.27)*.027*windStrength;float bendCover102=max(0.,1.-distance(rootCover102.xz,actor.xz)/1.05);transformed.xz+=(vec2(.8,.32)*swayCover102+normalize(rootCover102.xz-actor.xz+vec2(.001))*bendCover102*.14)*flexCover102;float visibleCover102=1.-smoothstep(plantRange.x,plantRange.y,distance(rootCover102.xz,actor.xz));transformed=vec3(transformed.x*visibleCover102,-.465+(transformed.y+.465)*visibleCover102,transformed.z*visibleCover102);`);
  s.fragmentShader=microRelief102+'uniform highp sampler2DArray worldCover102;uniform vec4 coverRects102[5];varying float styleCover102;float heightCover102;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',kind==='grassBlades'?`vec3 bladeArt102=texture2D(map,vMapUv*vec2(.36,1.)+vec2(.32,0.)).rgb;bladeArt102*=mix(vec3(.81,.93,.77),vec3(1.02,1.03,.91),clamp(styleCover102,0.,1.));bladeArt102*=mix(.73,1.,smoothstep(0.,.65,vMapUv.y));diffuseColor.rgb*=bladeArt102;heightCover102=dot(bladeArt102,vec3(.2126,.7152,.0722));`:`vec4 rectCover102=coverRects102[int(floor(styleCover102+.5))];vec4 plantCover102=texture(worldCover102,vec3(rectCover102.xy+vec2(vMapUv.x,1.-vMapUv.y)*rectCover102.zw,floor(styleCover102+.5)));diffuseColor*=plantCover102;heightCover102=dot(plantCover102.rgb,vec3(.2126,.7152,.0722));`);s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','normal=worldMicroNormal102(-vViewPosition,normal,vec2(dFdx(heightCover102),dFdy(heightCover102))*.018,faceDirection);');s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(heightCover102-.5)*.055,.80,.98);');
 };m.customProgramCacheKey=()=>key+'-natural-groundcover102-'+kind;m.userData={...m.userData,naturalCover102:true,pbr102:{normal:'matched native lamina microrelief',roughness:kind==='grassBlades'?.94:.87,metalness:0,alphaCut:true}};return m;
}
function curvedGrass102(far=false){
 const key='curved-opaque-grass102-'+far;if(sharedGeo[key])return sharedGeo[key];const n=far?4:8,segments=far?2:4,rng=seeded(102683),p=[],uv=[],indices=[];
 for(let blade=0;blade<n;blade++){
  const a=blade*2.399963+rng()*.6,dir=V3(Math.cos(a),0,Math.sin(a)),right=V3(-Math.sin(a),0,Math.cos(a)),root=V3(dir.x*(.025+rng()*.11),-.465,dir.z*(.025+rng()*.11)),height=.43+rng()*.34,lean=.19+rng()*.36,width=.017+rng()*.019,offset=p.length/3;
  for(let j=0;j<=segments;j++){const t=j/segments,center=root.clone().addScaledVector(dir,lean*t*t).add(V3(0,height*(t-.13*t*t),0)),w=width*Math.pow(1-t,.65)*(.72+.28*Math.sin(t*Math.PI));for(let side=-1;side<=1;side++){const point=center.clone().addScaledVector(right,side*w).addScaledVector(dir,side===0?Math.sin(t*Math.PI)*.009:0);p.push(...point.toArray());uv.push((side+1)*.5,t)}}
  for(let j=0;j<segments;j++)for(let k=0;k<2;k++){const v=offset+j*3+k;indices.push(v,v+1,v+3,v+1,v+4,v+3)}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.boundingSphere.radius+=.2;g.userData={curvedBlades102:true,blades:n,segments,opaque:true,folded:true};return sharedGeo[key]=g;
}
const naturalPlantsBefore102=buildPlants;
buildPlants=function(...args){const r=naturalPlantsBefore102(...args),materials=new Map();for(const im of world.userData.plantMeshes??[]){const kind=im.userData.plantKey;if(!['grassBlades','flowers','fern'].includes(kind)||im.userData.naturalCover102)continue;im.userData.naturalCover102=true;
  const old=im.material;if(!materials.has(kind))materials.set(kind,groundcoverMaterial102(kind,old.uniformsForDistance?.range));im.material=materials.get(kind);
  const styles=Float32Array.from(im.userData.plantOriginal??[],(matrix,i)=>{const e=matrix.elements,patch=Math.sin(Math.floor(e[12]/4.7)*31.7+Math.floor(e[14]/4.7)*17.3);return kind==='fern'?4:kind==='flowers'?patch>.10?2:3:patch>-.12?0:1}),attribute=new THREE.InstancedBufferAttribute(styles,1),clone=far=>{const g=shareGeometry36(groundcoverGeometry102(kind,far));g.setAttribute('botanicalStyle102',attribute);world.userData.botanicalOwned30??=new Set();world.userData.botanicalOwned30.add(g);return g};
  im.geometry=im.userData.detailedGeometry=clone(false);im.userData.distantGeometry=clone(true);im.castShadow=false;im.receiveShadow=true;im.computeBoundingSphere();
 }world.userData.naturalGroundcover102={native:true,grass:2,flowers:2,ferns:1,rooted:true,pbr:true,seasonalPatchVariation:true};return r;};
// Some authored building flower boxes call plant() and others keep a cached
// batch. This same builder covers both, preserving their visibility masks.
const naturalFinishBefore102=finishWorld102;
finishWorld102=function(){naturalFinishBefore102();lushGrass102();for(const m of typeof exactAtlas67!=='undefined'?exactAtlas67.terrainMaterials:[])groundMaterial102(m);if(world.userData.environment102)world.userData.environment102.groundcover={...world.userData.naturalGroundcover102,lush:world.userData.lushGrass102};};
function lushGrass102(){
 if(world.userData.lushGrass102||activeScene.kind==='interior')return;
 const macro=activeScene.kind==='overworld';delete world.userData.terrainSampler64;const ground=terrainSampler64().sample;let added=0,seated=0;
 for(const im of world.userData.plantMeshes??[]){if(im.userData.plantKey!=='grassBlades'||!im.userData.naturalCover102)continue;
  const rows=[],indices=[],sources=im.userData.plantOriginal??[],q=new THREE.Matrix4();
  for(let i=0;i<sources.length;i++){
   im.getMatrixAt(i,q);const source=q.clone(),e=source.elements;rows.push(source);indices.push(im.userData.globalPlantIndices?.[i]??i);if(Math.abs(e[5])<.0001)continue;
   const x=e[12],z=e[14],scale=V3().setFromMatrixScale(source),h=ground(x,z);e[13]=h+.465*scale.y-.025;seated++;
   const rng=seeded(Math.round(x*319.1+z*673.3+102971)),n=macro?2:7;
   for(let j=0;j<n;j++){const angle=rng()*TAU,reach=.24+rng()*.65,xx=x+Math.cos(angle)*reach,zz=z+Math.sin(angle)*reach;
    if(macro){if(traversalWet(xx,zz)||macroRoadInfo15(xx,zz).d<3.45)continue}else if(!inSceneBounds(xx,zz,0)||roadDistance(xx,zz)<3.4||waterGround(xx,zz)||!staticFree(xx,zz,.14))continue;
    const y=ground(xx,zz);if(Math.abs(y-h)>.40)continue;const s=scale.clone().multiplyScalar(.83+rng()*.43),m=new THREE.Matrix4().compose(V3(xx,y+.465*s.y-.03,zz),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),rng()*TAU),s);rows.push(m);indices.push(im.userData.globalPlantIndices?.[i]??i);added++;
   }
  }
  // Uniformly distribute density reductions through each patch. A prefix of
  // the old ordered rows removed whole strips of visible meadow on phones.
  const shuffle=seeded(102879+Math.floor((rows[0]?.elements[12]??0)*31+(rows[0]?.elements[14]??0)*73));for(let i=rows.length-1;i>0;i--){const j=Math.floor(shuffle()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];[indices[i],indices[j]]=[indices[j],indices[i]];}
  const data=new Float32Array(rows.length*16);rows.forEach((m,i)=>data.set(m.elements,i*16));
  // Allocate a matching-capacity draw object. Replacing instanceMatrix on a
  // previously uploaded object left some drivers using its old vertex binding.
  const dense=new THREE.InstancedMesh(im.geometry,im.material,rows.length);dense.userData=im.userData;dense.name=im.name;dense.castShadow=false;dense.receiveShadow=true;dense.onBeforeRender=im.onBeforeRender;dense.instanceMatrix.array.set(data);dense.instanceMatrix.needsUpdate=true;dense.userData.total=rows.length;dense.userData.plantOriginal=rows;dense.userData.globalPlantIndices=indices;
  im.parent?.add(dense);im.removeFromParent();const worldIndex=world.userData.plantMeshes.indexOf(im);if(worldIndex>=0)world.userData.plantMeshes[worldIndex]=dense;const perfIndex=perf.plants.indexOf(im);if(perfIndex>=0)perf.plants[perfIndex]=dense;im.dispose();
  const styles=new THREE.InstancedBufferAttribute(Float32Array.from(rows,m=>Math.sin(Math.floor(m.elements[12]/4.7)*31.7+Math.floor(m.elements[14]/4.7)*17.3)>-.12?0:1),1);for(const g of new Set([dense.geometry,dense.userData.detailedGeometry,dense.userData.distantGeometry]))g.setAttribute('botanicalStyle102',styles);dense.computeBoundingSphere();dense.computeBoundingBox();
 }
 world.userData.lushGrass102={added,seated,width:1.12,localMultiplier:8,macroMultiplier:3,instanced:true,coveragePreserved:true};
}
