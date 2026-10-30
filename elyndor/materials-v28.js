// Keep physically based world materials. The former Lambert conversion threw
// away roughness and normal response, so a brighter light could not add detail.
const materials28={normalArray:null,standard:0,forest:0};
lightWorldMaterial=function(base){
 if(base.isMeshStandardMaterial&&!base.map&&!base.transparent){base.map=textures[base.metalness>.24?'metal':base.emissiveIntensity>.3?'cloth':'rock'];base.needsUpdate=true;}
 return base;
};
const materialDensity28=`float scale28(float t){if(t<.5||abs(t-15.)<.5||abs(t-16.)<.5)return 3.2;if(abs(t-2.)<.5||abs(t-17.)<.5)return 4.;if(abs(t-3.)<.5)return 2.1;if(abs(t-4.)<.5||abs(t-5.)<.5)return 1.8;return 1.;}`;
atlasLookup=function(){return `vec2 uv28=vSurfaceUV*scale28(vTile);vec4 tileColor=texture(surfaceArray,vec3(uv28,floor(vTile+.5)));float wear=.97+.045*sin(vSurfaceUV.x*.29+sin(vSurfaceUV.y*.23+vTile))*sin(vSurfaceUV.y*.31+vTile);tileColor.rgb*=wear;`;};
const staticMaterialBefore28=staticAtlasMaterial;
staticAtlasMaterial=function(){
 if(scenery.staticAtlas?.userData.material28)return scenery.staticAtlas;
 const old=staticMaterialBefore28(),m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.87,metalness:0});
 m.userData={...old.userData,material28:true};m.onBeforeCompile=sh=>{
  old.onBeforeCompile(sh);sh.uniforms.detailArray28={value:materials28.normalArray};sh.uniforms.wet28=weather.wet;
  sh.fragmentShader='uniform highp sampler2DArray detailArray28;uniform float wet28;\n'+materialDensity28+'\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec4 detail28=texture(detailArray28,vec3(uv28,floor(vTile+.5)));
   vec3 tangent28=detail28.rgb*2.-1.;tangent28.xy*=.68;
   vec3 q028=dFdx(-vViewPosition),q128=dFdy(-vViewPosition);vec2 s028=dFdx(uv28),s128=dFdy(uv28);
   vec3 s28=q028*s128.y-q128*s028.y,t28=-q028*s128.x+q128*s028.x;
   float norm28=max(dot(s28,s28),dot(t28,t28));
   if(norm28>.00000001){float inv28=inversesqrt(norm28);normal=normalize(mat3(s28*inv28,t28*inv28,normal)*tangent28);}`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat materialRough28=texture(detailArray28,vec3(uv28,floor(vTile+.5))).a;roughnessFactor=mix(materialRough28,materialRough28*.5,wet28*.65);');
  // Dark cracks remain attached to their material, rather than screen-space AO.
  sh.fragmentShader=sh.fragmentShader.replace('#include <aomap_fragment>','#include <aomap_fragment>\nreflectedLight.indirectDiffuse*=mix(.82,1.,smoothstep(.08,.5,dot(tileColor.rgb,vec3(.3,.5,.2))));');
 };
 m.customProgramCacheKey=()=> 'elyndor-pbr-array-v28';scenery.staticAtlas=m;old.dispose();return m;
};
const materialLoadBefore28=loadAssets;
loadAssets=async function(){
 await materialLoadBefore28();
 const size=512,pixels=new Uint8Array(size*size*4*terrainTileNames.length),canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const aliases={cobbleA:'cobbleMoss30',cobbleB:'cobbleMoss30',plasterA:'plaster',rockA:'rock',rockB:'rock',grassA:'grass',earthA:'earth',wallA:'wall'};
 terrainTileNames.forEach((key,i)=>{
  const source=aliases[key]??key,tex=textures['normal28_'+source],rough=source==='slate'?.74:source==='wood'?.84:source==='metal'?.4:.91;
  let data=null;if(tex){tex.colorSpace=THREE.NoColorSpace;tex.needsUpdate=true;ctx.clearRect(0,0,size,size);ctx.drawImage(tex.image,0,0,size,size);data=ctx.getImageData(0,0,size,size).data;}
  for(let p=0;p<size*size;p++){const k=(i*size*size+p)*4,j=p*4;pixels[k]=data?data[j]:128;pixels[k+1]=data?data[j+1]:128;pixels[k+2]=data?data[j+2]:255;pixels[k+3]=Math.round(rough*255);}
 });
 const array=new THREE.DataArrayTexture(pixels,size,size,terrainTileNames.length);array.colorSpace=THREE.NoColorSpace;array.wrapS=array.wrapT=THREE.RepeatWrapping;array.magFilter=THREE.LinearFilter;array.minFilter=THREE.LinearMipmapLinearFilter;array.generateMipmaps=true;array.needsUpdate=true;array.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());materials28.normalArray=array;
};

function physicalMaterial28(base){
 if(!base?.isMeshLambertMaterial)return base;
 const m=new THREE.MeshStandardMaterial({map:base.map,color:base.color,emissive:base.emissive,emissiveMap:base.emissiveMap,emissiveIntensity:base.emissiveIntensity,side:base.side,alphaTest:base.alphaTest,vertexColors:base.vertexColors,fog:base.fog,roughness:.9});
 m.onBeforeCompile=base.onBeforeCompile;m.customProgramCacheKey=()=>base.customProgramCacheKey()+'-pbr28';m.userData={...base.userData};materials28.standard++;return m;
}
// A crown has folded individual leaf fans around a smaller shaded core,
// rather than one textured balloon. Its triangle budget stays close to the
// old sphere, and all crowns still share the same instanced submissions.
function leafVolume28(count){
 const key='leaf-volume28-'+count;if(sharedGeo[key])return sharedGeo[key];
 const core=new THREE.IcosahedronGeometry(.83,1),pos=Array.from(core.attributes.position.array),uv=Array.from(core.attributes.uv.array),rng=seeded(2871+count);
 const put=(a,b,c,coords)=>{pos.push(...a.toArray(),...b.toArray(),...c.toArray());uv.push(...coords);};
 for(let i=0;i<count;i++){
  const y=1-2*(i+.5)/count,a=i*2.399963,r=Math.sqrt(Math.max(0,1-y*y)),rad=.85+rng()*.22;
  const p=V3(Math.cos(a)*r,y*.91,Math.sin(a)*r).multiplyScalar(rad),out=p.clone().normalize();
  const right=V3().crossVectors(out,Math.abs(out.y)>.9?V3(1,0,0):V3(0,1,0)).normalize(),up=V3().crossVectors(right,out).normalize(),s=.11+rng()*.09;
  const top=p.clone().addScaledVector(up,s),bottom=p.clone().addScaledVector(up,-s),left=p.clone().addScaledVector(right,-s*.75),rightP=p.clone().addScaledVector(right,s*.75),center=p.clone().addScaledVector(out,s*.22);
  left.addScaledVector(out,.025);rightP.addScaledVector(out,.025);const u=rng()*.7,v=rng()*.7,w=.16;put(top,bottom,left,[u,v+w,u+w,v,u,v]);put(bottom,top,rightP,[u+w,v,u,v+w,u+w,v+w]);
 }
 core.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();return sharedGeo[key]=g;
}
const surfaceBuildBefore28=buildWorld;
const meadowBefore28=buildLocalNature;
buildLocalNature=function(){
 meadowBefore28();if(activeScene.kind!=='poi'||POIS[activeScene.key]?.kind==='clearing')return;
 const b=activeScene.bounds,rng=seeded(2881+Math.floor(b[0]*17+b[2]*31));let clusters=0;
 for(let x=b[0]+3;x<b[1]-3;x+=3.1)for(let z=b[2]+3;z<b[3]-3;z+=3.1){
  if(clusters>=360||rng()>.4)continue;const px=x+(rng()-.5)*2,pz=z+(rng()-.5)*2,rd=roadDistance(px,pz);
  if(rd<3.7||rd>7.2||waterGround(px,pz)||!staticFree(px,pz,.65)||winterAt(px,pz)>.6)continue;
  for(let i=0;i<4;i++){const xx=px+(rng()-.5)*1.5,zz=pz+(rng()-.5)*1.5;if(roadDistance(xx,zz)<3.5||!staticFree(xx,zz,.25)||waterGround(xx,zz))continue;plant(xx,zz,.35+rng()*.26,'flowers');}clusters++;
 }
 world.userData.flowerClusters28=clusters;
};
buildWorld=function(...args){
 const r=surfaceBuildBefore28(...args),converted=new Map();
 // Share one material across the existing 32m batches, preserving wind and
 // per-instance building/tree masks. No new per-plant draw submissions.
 for(const o of[...scenery.forestMeshes,...world.userData.terrainChunks??[]]){
  const old=o.material;if(!old?.isMeshLambertMaterial)continue;
  if(!converted.has(old)){
   const m=physicalMaterial28(old),before=m.onBeforeCompile,key=m.customProgramCacheKey(),isForest=!!o.userData.forest;
   m.onBeforeCompile=sh=>{before(sh);
    if(isForest){
     // Dark inter-leaf gaps are actual holes in both colour and shadow views.
     sh.fragmentShader=sh.fragmentShader.replace('if(max(leafColor.r,max(leafColor.g,leafColor.b))<.035)discard;','if(max(leafColor.r,max(leafColor.g,leafColor.b))<.015)discard;');
     sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',`float leafBack28=pow(max(0.,dot(normalize(vViewPosition),normal)),2.);outgoingLight+=diffuseColor.rgb*vec3(.13,.19,.045)*leafBack28;\n#include <opaque_fragment>`);
    }
   };m.customProgramCacheKey=()=>key+'-leaf-depth28';converted.set(old,m);
  }o.material=converted.get(old);
  if(o.userData.forest){materials28.forest++;const d=o.customDepthMaterial;if(d&&!d.userData.detail28){const before=d.onBeforeCompile,k=d.customProgramCacheKey();d.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=sh.fragmentShader.replace('max(leaf.r,max(leaf.g,leaf.b))<.035','max(leaf.r,max(leaf.g,leaf.b))<.015');};d.customProgramCacheKey=()=>k+'-leaf-holes28';d.userData.detail28=true;d.needsUpdate=true;}}
 }
 for(const o of scenery.forestMeshes){
  if(o.userData.forestKind!=='oak')continue;
  const attr=o.geometry.attributes.treeKind,old=new Set([o.userData.fullGeometry,o.userData.farGeometry,o.userData.simpleGeometry]);
  for(const[key,count]of[['fullGeometry',72],['farGeometry',36]]){const g=leafVolume28(count).clone();g.setAttribute('treeKind',attr);o.userData[key]=g;}
  o.geometry=o.userData.fullGeometry;for(const g of old)if(g&&g!==o.userData.simpleGeometry)g.dispose();
  o.computeBoundingSphere();o.computeBoundingBox();
 }
 // Ordinary unbatched objects receive the same native material normals.
 world.traverse(o=>{const m=o.material;if(!m?.isMeshStandardMaterial||m.userData.material28||actors.some(a=>a.mesh===o))return;const key=m.userData.textureKey??Object.keys(textures).find(k=>textures[k]===m.map);if(textures['normal28_'+key]){m.normalMap=textures['normal28_'+key];m.normalScale.set(key==='plaster'?.15:.45,key==='plaster'?.15:.45);m.needsUpdate=true;}});
 for(const o of world.userData.terrainChunks??[]){
  const m=o.material;if(m.userData.groundDetail28)continue;m.userData.groundDetail28=true;
  const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{
   before(sh);if(!sh.fragmentShader.includes('vGroundBlend'))return;
   sh.uniforms.stoneNormal28={value:textures.normal28_cobble};sh.uniforms.cliffNormal28={value:textures.normal28_rock};sh.uniforms.grassNormal28={value:textures.normal28_grass};
   sh.fragmentShader='uniform sampler2D stoneNormal28,cliffNormal28,grassNormal28;\n'+sh.fragmentShader;
   sh.fragmentShader=sh.fragmentShader.replace('vec4 surface=mix(grass,earth,.08+mottling*.08);','vec4 surface=mix(grass,earth,.02+mottling*.035);');
   sh.fragmentShader=sh.fragmentShader.replace('texture2D(roadTex,vGround.xz*.16)','texture2D(roadTex,vGround.xz*.3)');
   sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    float road28=clamp(vGroundBlend.x*vGroundBlend.y,0.,1.);vec2 nu28=vGround.xz*.3;
    float slope28=smoothstep(.12,.7,1.-abs(vGroundN.y));vec3 turfNormal28=mix(texture2D(grassNormal28,vGround.xz*.09375).rgb,texture2D(cliffNormal28,vGround.xz*.09375).rgb,slope28);
    vec3 small28=mix(turfNormal28,texture2D(stoneNormal28,nu28).rgb,road28)*2.-1.;
    vec3 groundDetail28=vec3(small28.x,0.,small28.y)*mix(.13,.42,road28);normal=normalize(normal+mat3(viewMatrix)*groundDetail28);`);
  };m.customProgramCacheKey=()=>key+'-ground-detail28';m.needsUpdate=true;
 }
 world.userData.materials28={pbr:true,nativeNormals:true,batchCells:32};return r;
};
