// A world-space road field keeps shoulders smooth across coarse terrain LODs.
// It is rasterized once from the connected routes, never from old bridge axes.
const roadSurface71={texture:null,width:2048,height:1152,segments:0};
function prepareRoadSurface71(){
 if(roadSurface71.texture)return;const q=roadSurface71,data=new Uint8Array(q.width*q.height),sx=q.width/(LAND.maxX-LAND.minX),sz=q.height/(LAND.maxZ-LAND.minZ);
 for(const r of MACRO_ROADS15)for(let i=1;i<r.p.length;i++){
  const a=r.p[i-1],b=r.p[i],dx=b[0]-a[0],dz=b[1]-a[1],length=dx*dx+dz*dz;if(length<.0001)continue;q.segments++;
  const minX=Math.max(0,Math.floor((Math.min(a[0],b[0])-6-LAND.minX)*sx)),maxX=Math.min(q.width-1,Math.ceil((Math.max(a[0],b[0])+6-LAND.minX)*sx)),minZ=Math.max(0,Math.floor((Math.min(a[1],b[1])-6-LAND.minZ)*sz)),maxZ=Math.min(q.height-1,Math.ceil((Math.max(a[1],b[1])+6-LAND.minZ)*sz));
  for(let iz=minZ;iz<=maxZ;iz++)for(let ix=minX;ix<=maxX;ix++){const x=LAND.minX+(ix+.5)/sx,z=LAND.minZ+(iz+.5)/sz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/length,0,1),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t),edge=Math.sin(x*.19+z*.13)*.13+Math.cos(z*.27-x*.07)*.12,paint=Math.round((1-smooth(1.55,4.15+edge,d))*255),at=iz*q.width+ix;if(paint>data[at])data[at]=paint;}
 }
 // Share the existing bank sampler: R retains the bank field, G holds roads.
 // Adding another sampler would exceed the sixteen-unit budget on some GPUs.
 const packed=new Uint8Array(data.length*2),bw=ATLAS_HYDRO38.bank.w,bh=ATLAS_HYDRO38.bank.h;
 for(let z=0;z<q.height;z++)for(let x=0;x<q.width;x++){const fx=clamp((x+.5)/q.width*bw-.5,0,bw-1),fz=clamp((z+.5)/q.height*bh-.5,0,bh-1),ix=Math.min(bw-2,Math.floor(fx)),iz=Math.min(bh-2,Math.floor(fz)),u=fx-ix,v=fz-iz,at=z*q.width+x;packed[at*2]=Math.round(mix(mix(bankBytes39[iz*bw+ix],bankBytes39[iz*bw+ix+1],u),mix(bankBytes39[(iz+1)*bw+ix],bankBytes39[(iz+1)*bw+ix+1],u),v));packed[at*2+1]=data[at];}
 const texture=new THREE.DataTexture(packed,q.width,q.height,THREE.RGFormat,THREE.UnsignedByteType);texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;q.texture=texture;
}
const routeTerrainBefore71=macroTerrain15;
macroTerrain15=function(...args){
 prepareRoadSurface71();const r=routeTerrainBefore71(...args);
 for(const o of world.userData.terrainChunks??[]){
  const p=o.geometry.attributes.position,road=o.geometry.attributes.terrainRoad,color=o.geometry.attributes.color;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),d=roadBefore38(x,z).d,paint=1-smooth(1.55,4.15,d);road?.setX(i,paint);if(color){const tint=terrainTint38(x,z).lerp(new THREE.Color('#d9c5a3'),paint*.8);tint.multiplyScalar(.94+noise(x*.19,z*.19)*.06);color.setXYZ(i,tint.r,tint.g,tint.b);}}
  if(road)road.needsUpdate=true;if(color)color.needsUpdate=true;
  const m=o.material;if(m.userData.connectedRoad71)continue;m.userData.connectedRoad71=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
  m.onBeforeCompile=shader=>{before(shader);shader.uniforms.bankMap39.value=roadSurface71.texture;const at=shader.fragmentShader.search(/void main\s*\(\s*\)\s*\{/);if(at>=0){const fn='float connectedRoadBlend71(){return texture2D(bankMap39,(terrainWorld.xz+vec2(1024.,576.))/vec2(2048.,1152.)).g;}\n';shader.fragmentShader=shader.fragmentShader.slice(0,at)+fn+shader.fragmentShader.slice(at).replace(/\bgroundRoad\b/g,'connectedRoadBlend71()');}};m.customProgramCacheKey=()=>key+'-continuous-road-field71';
 }
 return r;
};
