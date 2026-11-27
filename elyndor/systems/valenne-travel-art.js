// Travel-scale artwork is sampled in world coordinates. Routes, water depth,
// trees and landmark entrances still use the authored terrain and transforms.
const valenneArt={surfaces:null,river:null,loading:null};
const travelArtLoad=loadAssets;
loadAssets=async function(...args){
 if(!valenneArt.loading)valenneArt.loading=loadValenneArt().catch(error=>{
  console.warn('The Valenne travel artwork could not load.',error);
  valenneArt.loading=null;
 });
 const [result]=await Promise.all([travelArtLoad.apply(this,args),valenneArt.loading]);
 return result;
};
async function loadValenneArt(){
 const folder='elyndor/assets/valenne-travel/';
 const names=['meadow-and-stone','landscape'];
 const images=await Promise.all(names.map(async name=>{
  const image=new Image();image.src=folder+name+'.webp';await image.decode();return image;
 }));
 const source=images[0],canvas=document.createElement('canvas');
 canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
 const t=new THREE.DataArrayTexture(new Uint8Array(pixels.data.buffer),canvas.width,canvas.width,canvas.height/canvas.width);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;
 t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 t.userData.pinnedMap17=true;t.needsUpdate=true;valenneArt.surfaces=t;
 // Retain the original blue pigment and fine brushwork at their native resolution.
 const landscape=images[1],tile=landscape.width,strip=document.createElement('canvas');
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
// Crown profiles are modeled in the same seven-unit frame as the rooted trees.
// The same branch positions are retained at every level of detail.
const woodlandForms={
 oak:   {width:2.18,base:2.35,top:6.45,lobes:8,leaf:'#62964f',bark:'#796345'},
 birch: {width:1.37,base:2.55,top:7.15,lobes:7,leaf:'#86a852',bark:'#c2bda2'},
 willow:{width:2.07,base:1.83,top:6.55,lobes:8,leaf:'#77965c',bark:'#786c4d'},
 maple: {width:1.94,base:2.17,top:6.85,lobes:7,leaf:'#77a24f',bark:'#82674a'},
 spruce:{width:1.75,base:.72,top:7.12,tiers:8,leaf:'#56875f',bark:'#785d41'},
 pine:  {width:1.87,base:1.42,top:6.96,tiers:6,leaf:'#698b58',bark:'#866748'}
};
function woodlandCrownGeometry(style,lod){
 const key='woodland-crown-'+style+'-'+lod;
 if(sharedGeo[key])return sharedGeo[key];
 const form=woodlandForms[style],seed=Object.keys(woodlandForms).indexOf(style)+1,random=seeded(seed*751+843);
 const positions=[],colours=[],skin=[],leafUV=[],indices=[];
 const leaf=new THREE.Color(form.leaf),bark=new THREE.Color(form.bark);
 function vertex(x,y,z,isLeaf,tone,u=0,v=0){
  positions.push(x,y,z);skin.push(isLeaf?(form.tiers?2:1):0);leafUV.push(u,v);
  const ink=isLeaf?leaf:bark;
  colours.push(ink.r*tone,ink.g*tone,ink.b*tone);
 }
 function connect(first,n,rows){
  for(let j=0;j<rows-1;j++)for(let i=0;i<n;i++){
   const a=first+j*n+i,b=first+j*n+(i+1)%n;
   indices.push(a,a+n,b,b,a+n,b+n);
  }
 }
 function limb(x,y,z,endX,endY,endZ,r,tip){
  const first=skin.length,n=lod===2?4:6;
  for(let end=0;end<2;end++)for(let i=0;i<n;i++){
   const a=i*TAU/n,rad=end?tip:r;
   vertex((end?endX:x)+Math.cos(a)*rad,end?endY:y,(end?endZ:z)+Math.sin(a)*rad,false,.78+.2*Math.cos(a-.7));
  }
  connect(first,n,2);
 }
 const lean=style==='pine'?.31:style==='birch'?-.22:.11;
 limb(0,-.06,0,lean,form.top*.78,.09,style==='birch'?.14:.22,.065);
 // Build from the stem out. Each shoot has a folded upper surface and
 // separated tips along its sides, so the outline survives mip filtering.
 function spray(x,y,z,a,length,width,rise,droop,tone,needle){
  const first=skin.length,c=Math.cos(a),s=Math.sin(a);
  if(lod===2){
   // At this scale four folded triangles carry the same cutout and silhouette.
   for(const [u,v,lift,tint] of [[0,0,0,.75],[.52,-1,-.16,.92],[.49,0,.32,1.16],[.54,1,-.22,.86],[1,0,0,1.04]]){
    const side=v*width,bend=rise*u-droop*u*u+lift*width;
    vertex(x+c*length*u-s*side,y+bend,z+s*length*u+c*side,true,tone*tint,2.5+v*.5,u);
   }
   indices.push(first,first+2,first+1,first,first+3,first+2,first+1,first+2,first+4,first+2,first+3,first+4);
   return;
  }
  const steps=lod===0?5:2;
  for(let i=0;i<=steps;i++){
   const t=i/steps,arc=Math.sin(t*Math.PI),rib=rise*t-droop*t*t+arc*width*.42;
   const bow=Math.sin(t*2.2+a)*width*.23*t;
   const span=width*(.02+Math.pow(arc,needle?.65:.74))*(1.16-.35*t);
   for(let side=-1;side<=1;side++){
    const tip=side!==0&&(i+(side<0?1:0))%2===1;
    const u=length*t+(tip?length*(needle?.16:.085):0)*arc;
    const v=bow+side*span*(tip?1.19:.77);
    vertex(x+c*u-s*v,y+rib-Math.abs(side)*span*(tip?.54:.31),z+s*u+c*v,true,
      tone*(side===0?1.14:tip?1.02:.82)*(.82+.22*t),2.5+side*.50,t);
   }
  }
  for(let j=0;j<steps;j++)for(let i=0;i<2;i++){
   const v=first+3*j+i;indices.push(v,v+1,v+3,v+1,v+4,v+3);
  }
 }
 // An oak limb carries several small convex packets of leaves. Distort a
 // rounded envelope along its own sloping axis; no horizontal tree-wide rings.
 function foliage(x,y,z,a,r,h,w,tone,phase){
  const first=skin.length,n=lod===0?12:lod===1?8:7;
  const c=Math.cos(a),s=Math.sin(a),latitudes=lod===0?[-1,-.58,-.03,.54,1]:[-1,-.32,.46,1];
  for(const lat of latitudes)for(let k=0;k<n;k++){
   const theta=k*TAU/n+.19*lat,cs=Math.cos(theta),sn=Math.sin(theta);
   const notch=Math.sin(3*theta+phase)+.54*Math.cos(5*theta-phase+lat*.38);
   const band=Math.sqrt(Math.max(.002,1-lat*lat))*(1+.16*notch);
   const u=cs*band*r+r*lat*.20,v=sn*band*w;
   const level=lat*h+u*.28+band*h*(.21*notch+.12*sn);
   vertex(x+(c*u-s*v)*.77,y+level*.73,z+(s*u+c*v)*.77,true,tone*(.86+.16*lat+.08*notch+.045*cs));
  }
  connect(first,n,latitudes.length);
  const count=lod===0?20:lod===1?10:5;
  for(let j=0;j<count;j++){
   const th=2.399963*j+phase,cs=Math.cos(th),sn=Math.sin(th);
   const level=1.55*((j+.5)/count)-.66,band=Math.sqrt(1-level*level);
   const u=cs*r*.68*band,v=sn*w*.68*band;
   spray(x+c*u-s*v,y+h*level*.84+u*.28,z+s*u+c*v,a+th,
    r*(.81+.19*Math.cos(th*3)),w*(style==='willow'?.34:.43),h*(.34+.32*level),
    h*(style==='willow'?.97:.32),tone*(1.01+.12*sn),false);
  }
 }
 if(form.tiers){
  // Short inner shoots overlap around the leader. The longer sprays extend
  // beyond this core with visible gaps between their tips.
  const first=skin.length,sides=lod===2?9:13;
  for(let row=0;row<=form.tiers*2;row++){
   const t=row/(form.tiers*2),y=mix(form.base+.38,form.top+.015,t);
   const r=form.width*Math.pow(1-t,.85)*(row%2?.44:.67);
   for(let j=0;j<sides;j++){
    const a=j*TAU/sides+.22*Math.sin(row*1.4);
    const fringe=Math.sin(5*a+row*.77),radius=r*(1+.13*fringe);
    vertex(lean*t+Math.cos(a)*radius,y+r*.12*fringe,.09*t+Math.sin(a)*radius,
     true,.71+.15*t+(row%2?.11:0)+fringe*.07);
   }
  }
  connect(first,sides,form.tiers*2+1);
  for(let tier=0;tier<form.tiers;tier++){
   const t=tier/(form.tiers-1),y=mix(form.base+.74,form.top-.65,t);
   const radius=form.width*(.17+.83*Math.pow(1-t,.82));
   const branches=tier>form.tiers-3?5:7;
   for(let j=0;j<branches;j++){
    const a=tier*2.39996+j*TAU/branches+(random()-.5)*.4;
    const len=radius*(.82+.26*random()),dy=(random()-.5)*.34;
    const bx=lean*t,by=y+dy,bz=.09*t;
    const h=(style==='spruce'?.62:.49)*(.56+.44*(1-t));
    spray(bx,by,bz,a,len,len*.37,h,-.04+len*.36,.81+.16*t,true);
    for(const side of [-1,1]){
     const start=.37*len,aa=a+side*(.55+.13*Math.sin(a));
     spray(bx+Math.cos(a)*start,by+h*.28,bz+Math.sin(a)*start,aa,len*.64,len*.22,
      h*.42,len*.34,.92+.11*t,true);
    }
   }
  }
  limb(lean,form.top*.77,.09,lean,form.top+.02,.09,.068,.013);
  for(let k=0;k<5;k++)spray(lean,form.top-.60,.09,k*2.4,.30,.13,.74,.18,1.04,true);
 }else{
  for(let i=0;i<form.lobes;i++){
   const t=i/(form.lobes-1),a=seed*.63+i*2.399963+(random()-.5)*.49;
   const y=mix(form.base+.13,form.top-1.10,t)+(random()-.5)*.38;
   const reach=form.width*(.32+.57*Math.sin((.21+.79*t)*Math.PI))*(.89+.16*random());
   const c=Math.cos(a),s=Math.sin(a),bx=lean*t+c*reach*.71,bz=s*reach*.71;
   const radius=form.width*(.34+.13*Math.sin(t*Math.PI)),h=(style==='oak'?.87:style==='willow'?1.19:1.06)*(.91+.15*random());
   const tone=.86+t*.18+.07*Math.sin(i*4.1);
   limb(lean*t,Math.max(.68,y-1.0),0,bx,y+.10,bz,.112-t*.05,.036);
   foliage(bx,y+.18,bz,a,radius,h*.86,radius*.76,tone,a);
   for(const side of [-1,1]){
    const dir=a+side*(.59+.17*Math.cos(i)),out=radius*(side<0?.87:.65);
    const fl=side<0?.72:.57;
    foliage(bx+Math.cos(dir)*out,y+(side<0?.35:-.30)*h,bz+Math.sin(dir)*out,
      dir,radius*fl,h*(style==='willow'?.93:fl),radius*fl*.86,tone*(side<0?1.05:.91),a+side*1.71);
   }
  }
  foliage(lean,form.top-.55,.09,seed,form.width*.38,.65,form.width*.32,1.05,seed*1.7);
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
 g.setAttribute('woodlandLeaf',new THREE.Float32BufferAttribute(skin,1));
 g.setAttribute('leafBlade',new THREE.Float32BufferAttribute(leafUV,2));g.setIndex(indices);
 g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 return sharedGeo[key]=g;
}
// Bake overlapping shoots once. A linear relief tile gives each blade a
// shadowed underside, a sunward cheek and a raised midrib at travel scale.
const travelLeafRelief=new Map();
function leafReliefTile(needle){
 if(travelLeafRelief.has(needle))return travelLeafRelief.get(needle);
 const size=256,c=document.createElement('canvas');c.width=c.height=size;
 const ctx=c.getContext('2d'),rng=seeded(needle?8971:4273);
 const grey=v=>'rgb('+[v,v,v].join(',')+')';
 function leaf(x,y,angle,length,spread,ink){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.fillStyle=grey(ink-36);ctx.beginPath();ctx.moveTo(0,0);
  ctx.quadraticCurveTo(length*.39,-spread,length,0);
  ctx.quadraticCurveTo(length*.51,spread*1.3,0,0);ctx.fill();
  ctx.fillStyle=grey(ink+17);ctx.beginPath();ctx.moveTo(0,0);
  ctx.quadraticCurveTo(length*.39,-spread,length,0);
  ctx.quadraticCurveTo(length*.55,-spread*.15,0,0);ctx.fill();
  ctx.restore();
 }
 // Repeat complete sprigs across the tile edges, including their shadows.
 const side=needle?8:7;
 for(let j=0;j<side;j++)for(let i=0;i<side;i++){
  const x=(i+rng())*size/side,y=(j+rng())*size/side,angle=rng()*TAU;
  const n=needle?7:4,length=(needle?11:17)*(1+rng()*.46);
  const tone=110+Math.round(rng()*86);
  for(const tx of [-size,0,size])for(const ty of [-size,0,size]){
   const xx=x+tx,yy=y+ty;
   if(xx< -40||xx>size+40||yy< -40||yy>size+40)continue;
   for(let k=0;k<n;k++)for(const sign of [-1,1]){
    const t=k/(n-1),reach=length*(1-.38*t),u=(t-.5)*length*1.05;
    leaf(xx+Math.cos(angle)*u,yy+Math.sin(angle)*u,angle+sign*(1.03-.72*t),
     reach,reach*(needle?.20:.49),Math.round(tone+17*t));
   }
  }
 }
 // Smaller shaded shoots show through the gaps in the outside layer.
 const shoots=document.createElement('canvas');shoots.width=shoots.height=size;
 shoots.getContext('2d').drawImage(c,0,0);
 ctx.fillStyle='#393939';ctx.fillRect(0,0,size,size);
 ctx.save();ctx.translate(size,0);ctx.rotate(Math.PI/2);ctx.scale(.5,.5);ctx.translate(41,69);ctx.globalAlpha=.62;
 ctx.fillStyle=ctx.createPattern(shoots,'repeat');ctx.fillRect(-41,-69,2*size,2*size);
 ctx.restore();ctx.drawImage(shoots,0,0);
 const map=new THREE.CanvasTexture(c);map.wrapS=map.wrapT=THREE.RepeatWrapping;
 map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 map.userData.pinnedMap17=true;travelLeafRelief.set(needle,map);return map;
}
// Transparent gaps belong to the sprig itself, including in the sun shadow.
let woodlandSprigMap;
function woodlandSprigs(){
 if(woodlandSprigMap)return woodlandSprigMap;
 const c=document.createElement('canvas');c.width=512;c.height=256;
 const ctx=c.getContext('2d'),rng=seeded(91367);
 for(let kind=0;kind<2;kind++){
  const offset=kind*256;
  ctx.save();ctx.translate(offset,0);ctx.beginPath();ctx.rect(2,2,252,252);ctx.clip();
  ctx.lineCap='round';ctx.lineWidth=kind?5:4;ctx.strokeStyle='#74796f';
  ctx.beginPath();ctx.moveTo(128,254);ctx.quadraticCurveTo(117,148,130,6);ctx.stroke();
  const pairs=kind?18:8;
  for(let row=0;row<pairs;row++)for(const side of [-1,1]){
   const t=(row+.4)/pairs,bend=Math.sin(t*Math.PI),root=245-t*216+(rng()-.5)*13;
   const dx=side*((kind?20:30)+bend*(67+15*rng())),dy=-(kind?33:40)*(1-.46*t);
   const mid=126-6*bend,stem=.82*dx,angle=Math.atan2(dy,dx);
   ctx.strokeStyle='#7c8176';ctx.lineWidth=kind?2:3;
   ctx.beginPath();ctx.moveTo(mid,root);ctx.quadraticCurveTo(mid+stem*.48,root+dy*.25,mid+stem,root+dy);ctx.stroke();
   const count=kind?7:4;
   for(let k=0;k<count;k++){
    const u=(k+.2)/count,len=(kind?19:29)*(1.24-.29*u)*(.83+rng()*.31);
    const width=len*(kind?.15:.41),tint=Math.round(136+64*rng()+18*u);
    ctx.save();ctx.translate(mid+stem*u,root+dy*u*u);ctx.rotate(angle+side*((k%2?1:-1)*.58));
    ctx.fillStyle='rgb('+[tint,tint,tint].join(',')+')';ctx.beginPath();ctx.moveTo(0,0);
    ctx.quadraticCurveTo(len*.39,-width,len,0);ctx.quadraticCurveTo(len*.47,width*.77,0,0);ctx.fill();
    ctx.fillStyle='rgb('+[tint-37,tint-37,tint-37].join(',')+')';ctx.beginPath();ctx.moveTo(0,0);
    ctx.quadraticCurveTo(len*.53,width*.13,len,0);ctx.quadraticCurveTo(len*.47,width*.77,0,0);ctx.fill();ctx.restore();
   }
  }
  ctx.restore();
 }
 const t=new THREE.CanvasTexture(c);t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 t.userData.pinnedMap17=true;return woodlandSprigMap=t;
}
function woodlandCrownMaterial(depth=false){
 const m=depth?new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking}):
  new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96,metalness:0});
 m.userData.treeViewCompiled=true;
 m.side=THREE.DoubleSide;m.shadowSide=THREE.DoubleSide;
 if(!depth)addCloudLighting(m);
 const compile=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(shader,...args){
  compile.call(this,shader,...args);
  shader.uniforms.woodlandSprigs={value:woodlandSprigs()};
  shader.vertexShader='attribute vec2 leafBlade;attribute float woodlandLeaf;varying vec3 sprigUV;\n'+shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nsprigUV=vec3(leafBlade,woodlandLeaf);');
  shader.fragmentShader='uniform sampler2D woodlandSprigs;varying vec3 sprigUV;\n'+shader.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
   if(sprigUV.x>1.5){
    vec2 uv=vec2((sprigUV.x-2.+step(1.5,sprigUV.z))*.5,sprigUV.y);
    vec4 sprig=texture2D(woodlandSprigs,uv);
    if(sprig.a<.24)discard;
    ${depth?'':'diffuseColor.rgb*=mix(.82,1.36,sprig.r);'}
   }`);
  if(depth)return;
  shader.uniforms.woodlandMain=forest30.main;
  shader.vertexShader='attribute float treeViewHidden; uniform float woodlandMain; varying vec3 leafPoint; varying float isCanopy;\n'+shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nleafPoint=position;isCanopy=woodlandLeaf;transformed*=1.-treeViewHidden*woodlandMain;');
  shader.uniforms.crownLeaves={value:leafReliefTile(false)};shader.uniforms.crownNeedles={value:leafReliefTile(true)};
  shader.vertexShader='varying vec2 bladeUV;varying vec3 branchNormal;\n'+shader.vertexShader.replace('leafPoint=position;', 'bladeUV=leafBlade;branchNormal=normal;leafPoint=position;');
  shader.fragmentShader='uniform sampler2D crownLeaves,crownNeedles;varying vec2 bladeUV;varying vec3 leafPoint,branchNormal;varying float isCanopy;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float bladeRelief=0.;
   if(isCanopy>.5){
    vec3 weights=pow(abs(normalize(branchNormal)),vec3(10.));weights/=max(.0001,dot(weights,vec3(1.)));
    vec3 p=leafPoint*mix(.39,.31,step(1.5,isCanopy))+vec3(.59,.17,.81);
    vec3 brush;
    if(isCanopy>1.5)brush=texture2D(crownNeedles,p.zy).rgb*weights.x+texture2D(crownNeedles,p.xz).rgb*weights.y+texture2D(crownNeedles,p.xy).rgb*weights.z;
    else brush=texture2D(crownLeaves,p.zy).rgb*weights.x+texture2D(crownLeaves,p.xz).rgb*weights.y+texture2D(crownLeaves,p.xy).rgb*weights.z;
    float cluster=smoothstep(.22,.79,brush.r);
    bladeRelief=brush.r*.042;
    diffuseColor.rgb*=.78+.53*cluster;
    diffuseColor.rgb+=vec3(.005,.010,.002)*cluster*cluster;
    if(bladeUV.x>1.5){
     float ridge=1.-smoothstep(.035,.11+fwidth(bladeUV.x),abs(bladeUV.x-2.5));
     diffuseColor.rgb*=.93+.11*ridge;
    }
   }`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
    vec3 rx=cross(sy,normal),ry=cross(normal,sx);
    float area=dot(sx,rx);
    vec3 ridgeNormal=abs(area)*normal-sign(area)*(rx*dFdx(bladeRelief)+ry*dFdy(bladeRelief));
    if(abs(area)>1e-7)normal=normalize(ridgeNormal);
   `).replace('#include <opaque_fragment>', 'outgoingLight=max(outgoingLight,diffuseColor.rgb*.18);\n#include <opaque_fragment>');
 };
 m.customProgramCacheKey=()=>key+'-sculpted-woodland';
 return m;
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
 uniform sampler2D riverPainting;
 float noise62(vec2 p);
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
  vec2 body=vec2(.112+.776*fract(q.x),q.y);
  return textureGrad(riverPainting,body,(brush*dx)*vec2(.776,1.),(brush*dy)*vec2(.776,1.)).rgb;
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
 }
 // Fast midstream crests, slower split filaments on the banks and quiet
 // gaps have separate length scales. All three move with the channel.
 float driftingFoam(vec2 channel,float time,float bank,float shelf,float crest){
  vec2 moving=channel-vec2(time*.78,0.);
  float reach=noise62(channel*vec2(.102,.175)+19.);
  float shear=noise62(moving*vec2(.16,.31)+33.)-.5;
  vec2 grid=vec2(moving.x*.21,moving.y*.47+shear*.75);
  grid.x+=.73*floor(grid.y);
  vec4 seed=packetRandom(floor(grid)+vec2(17.,71.));
  vec2 d=fract(grid)-vec2(.5,.29+.42*seed.y);
  float along=d.x/(.19+.29*seed.x),tip=max(0.,1.-along*along);
  float curl=(seed.z-.5)*(.34*along*along+.17*along)+.06*sin(3.*along+6.*seed.x);
  float width=(.013+.035*seed.w)*tip;
  float aa=clamp(fwidth(channel.y)*.24,.006,.07);
  float edge=1.-smoothstep(width,width+aa,abs(d.y-curl));
  float fork=1.-smoothstep(width*.52,width*.52+aa,abs(d.y-curl-.14*tip));
  float feather=noise62(moving*vec2(.92,2.4)+vec2(.065*time,17.));
  float lace=max(edge,.56*fork*step(.63,seed.z))*tip*smoothstep(.23,.68,feather);
  float broken=smoothstep(.27,.72,noise62(moving*vec2(.135,.22)-8.));
  float shoal=smoothstep(.32,.93,.25*reach+.67*bank+.26*shelf);
  float cap=smoothstep(.40,.91,crest)*smoothstep(.48,.8,feather)*(.12+.28*reach);
  return (lace*shoal+cap)*broken;
 }`;

const valenneRiverBefore=waterMaterial62;
waterMaterial62=function(o,...args){
 const m=valenneRiverBefore.call(this,o,...args),local=activeScene?.kind==='poi'&&!args[1];
 const travel=activeScene?.kind==='overworld'&&o.userData.freshwater38;
 const openSea=activeScene?.kind==='overworld'&&!travel&&o===water;
 if((!travel&&!local&&!openSea)||!valenneArt.river)return m;
 if(travel)valenneRiverCoordinates(o);
 const basin=local&&o===world.userData.fountain123?.pool;
 const brook=local&&activeScene.key==='brookstead';
 const ribbon=brook&&!basin&&(o.userData.waterRole||o.userData.waterfall||o===water);
 const coast=openSea||(local&&activeScene.key==='harbor');
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(shader,...params){
  before.call(this,shader,...params);
  shader.uniforms.riverPainting={value:valenneArt.river};
  if(travel){
   shader.vertexShader='attribute vec4 riverFrame; varying vec4 channelFrame;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nchannelFrame=riverFrame;');
   shader.fragmentShader='varying vec4 channelFrame;\n'+shader.fragmentShader;
  }else{
   // Keep the native reflection solve, including both sides of a spillway.
   shader.fragmentShader=shader.fragmentShader.replace('if(reflect62>.5){vec2 ripple62=',
    'vec3 sceneMirror=vec3(0.);float sceneMirrorWeight=0.;if(reflect62>.5){vec2 ripple62=')
    .replace('gl_FragColor.rgb=mix(gl_FragColor.rgb,mirrorColour62,',
     'sceneMirror=mirrorColour62;sceneMirrorWeight=coverage62*(.18+.31*fresnel62)*(cascade62>.5?.15:1.);gl_FragColor.rgb=mix(gl_FragColor.rgb,mirrorColour62,');
  }
  const marker='#include <tonemapping_fragment>';
  shader.fragmentShader=valenneWavePackets+shader.fragmentShader.replace(marker,`{
   vec2 p=worldWater62.xz;
   vec2 drift=normalize(vec2(.08,.12));
   vec2 pool=vec2(dot(p,drift),dot(p,vec2(-drift.y,drift.x)));
   ${travel?'vec2 channel=channelFrame.xy;float bank=channelFrame.z,river=channelFrame.w,flowTime=time62;':
     ribbon?'vec2 channel=vec2(p.y-worldWater62.y*.66,across62*5.);float bank=abs(across62),river=1.,flowTime=advection108;':
     'vec2 channel=pool;float bank=1.-smoothstep(.12,1.25,waterDepth62),river=0.,flowTime=time62;'}
   ${local?'channel*=2.65;pool*=2.65;flowTime*=2.65;':''}
   ${o.userData.millrace?'channel*=1.72;flowTime*=1.72;':''}
   float daylight=day62,clearSun=daylight*(1.-.69*cloud62);
   float shelf=exp(-.52*waterDepth62),exposure=noise62(p*.074+vec2(81.,49.));
   float riffle=clamp(.21+.59*smoothstep(.24,.78,exposure)+.21*shelf,0.,1.);
   float broad=noise62(pool*vec2(.31,.18)-vec2(.13*time62,0.));
   vec2 footprint=fwidth(channel);
   float fineDetail=1.-smoothstep(.14,.66,max(footprint.x,footprint.y));
   float waveDetail=1.-smoothstep(.32,1.45,footprint.x);
   float slope=.0,fine=.0,ribbons=.0;
   if(river>.001){
    slope=riverPackets(channel*vec2(1.63,1.24),flowTime*1.63)*waveDetail;
    vec2 moving=channel-vec2(flowTime*1.09,0.);
    vec2 warp=vec2(noise62(moving*vec2(.43,.58)+7.),noise62(moving*vec2(.19,.34)-21.));
    fine=noise62(vec2(2.7*moving.x+.46*moving.y,.83*moving.y)+2.45*warp)-.5;
    fine*=fineDetail;
    vec2 margin=channel-vec2(.69*flowTime,0.);
    float meander=noise62(margin*vec2(.17,.32)+37.);
    float strand=noise62(vec2(.32*margin.x,2.9*margin.y+3.7*meander));
    ribbons=smoothstep(.58,.88,strand)*smoothstep(.32,.73,meander)*(.15+.85*bank*bank);
   }
   float poolSlope=(broad-.5)*1.5+(noise62(pool*vec2(1.36,.57)-vec2(.41*time62,0.))-.5)*.58;
   vec2 paintCoord=channel-vec2(flowTime*.96,0.);
   vec2 brushWarp=vec2(noise62(paintCoord*vec2(.13,.23)+6.),noise62(paintCoord*vec2(.22,.14)-18.))-.5;
   vec2 brushUV=paintCoord*vec2(.064,.121)+brushWarp*vec2(.09,.14);
   vec2 lakeUV=pool*vec2(.050,.073)-vec2(.019*time62,0.)+.08*broad;
   vec3 ink=${travel?'mix(brokenPainting(lakeUV,.9),brokenPainting(brushUV,bank),river)':
     ribbon?'brokenPainting(brushUV,bank)':'brokenPainting(lakeUV,.9)'};
   ink*=.65+smoothstep(.011,.082,dot(ink,vec3(.21,.72,.07)))*1.12;
   ink*=mix(vec3(1.83,.91,.43),vec3(1.99,1.42,.93),daylight);
   float facet=${basin?'fountainFlow124*poolSlope':'mix(poolSlope,slope,river)'};
   float signedFace=facet*(.49+.51*riffle)+river*fine*(.55+.76*riffle);
   float edgeGlint=smoothstep(.39,.99,signedFace);
   vec3 pigment=mix(vec3(.009,.032,.058),vec3(.027,.074,.082),shelf);
   pigment*=.78+.23*exposure+.18*broad;
   vec3 waterColour=pigment*mix(vec3(.41,.49,.68),vec3(1.),daylight);
   vec3 sheen=mix(vec3(.039,.063,.11),vec3(.115,.184,.216),daylight);
   sheen*=.72+.43*sky62;
   waterColour=mix(waterColour,ink,${basin?'.28+.54*fountainFlow124':'.82'})*(.99+.12*clamp(signedFace,-1.,1.));
   float brokenCrest=edgeGlint*(.12+.88*riffle)*(.48+.52*smoothstep(.017,.072,dot(ink,vec3(.21,.72,.07))));
   waterColour+=sheen*(brokenCrest*(.14+.22*clearSun)+.14*ribbons*river);
   float foam=${basin?'0.':'driftingFoam(mix(pool,channel,river),flowTime,bank,shelf,signedFace)'};
   vec3 froth=mix(vec3(.095,.14,.20),vec3(.42,.59,.63),daylight);
   waterColour=mix(waterColour,froth,clamp(foam*mix(.21+.43*bank,.63,river),0.,.55));
   ${travel?`if(reflect62>.5){
    vec2 dir=normalize(flow62+vec2(.0001));
    vec2 uv=reflected62.xy/max(.001,reflected62.w)+.008*(dir*facet+vec2(-dir.y,dir.x)*fine);
    float facing=1.-max(0.,view62.y);
    waterColour=mix(waterColour,texture2D(mirror62,clamp(uv,.002,.998)).rgb,mirrorCoverage62(reflected62)*(.045+.16*facing*facing));
   }`:''}
   vec2 downstream=normalize(mix(drift,flow62,river)+vec2(.0001));
   vec2 tilted=${basin?'vec2(waveX62,waveZ62)':'downstream*facet*.22+vec2(-downstream.y,downstream.x)*fine*.19'};
   vec3 waveNormal=normalize(vec3(tilted.x,1.,tilted.y));
   float sunFlash=pow(max(0.,dot(waveNormal,half62)),112.)*clearSun*keyPower62;
   ${!travel?`float nativeLight=dot(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse,vec3(.21,.72,.07))/max(.015,dot(diffuseColor.rgb,vec3(.21,.72,.07)));
   waterColour*=clamp(.63+.32*nativeLight,.62,1.21);
   waterColour=mix(waterColour,froth,clamp(foam62*.87,0.,.76));
   waterColour=mix(waterColour,sceneMirror,sceneMirrorWeight);
   gl_FragColor.rgb=mix(waterColour,gl_FragColor.rgb,${coast?'.28':'.12'})+key62*.10*sunFlash;`:
   'gl_FragColor.rgb=waterColour+key62*(.12*sunFlash);'}
   }
   ${marker}`);
 };
 m.userData.paintedWater=basin?'fountain':ribbon?'millstream':o.userData.millrace?'miniature-millrace':coast?'coast':local?'pond':'travel';
 m.customProgramCacheKey=()=>key+'-valenne-surface-'+m.userData.paintedWater;m.needsUpdate=true;return m;
};

// The live world and the atlas share the detailed geometry. Keep the original
// root and its game-owned footprint and entrance records through scene swaps.
const landmarkModels=new Map(),landmarkInstances=new WeakMap(),atlasFountainSpills=new WeakMap();
function installRegionalLandmark(root,template,site,atlas){
 if(!root||landmarkInstances.has(root))return;
 const retired=new THREE.Group();retired.add(...root.children.slice());retired.visible=false;root.add(retired);
 const model=template.clone(true);root.add(model);model.position.y-=root.position.y;
 const building=atlas?null:revealBuilding114(root);
 if(building){building.box.makeEmpty();building.meshes.length=0;building.lots=true;}
 model.updateWorldMatrix(true,true);
 model.traverse(o=>{
  if(!o.isMesh)return;
  if(atlas){holdAtlas67(o.geometry);holdMaterial67(o.material);}
  else{
   let p=o;while(p!==model&&!p.userData.keepSolidForPlayerReveal)p=p.parent;
   if(p.userData.keepSolidForPlayerReveal||!o.material.depthWrite)return;
   o.material=playerRevealMaterial(o.material,building);
   if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
   building.meshes.push(o);building.box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));
  }
 });
 const bounds=new THREE.Box3().setFromObject(model);
 root.userData.atlasBounds118=bounds;root.userData.travelNameAnchor=V3(site.x-1,bounds.max.y+.75,site.z);
 if(atlas)exactAtlas67.landmarks.set(site.key,bounds.clone());
 else{
  if(site.key==='brookstead'){
   const race=prepareBrooksteadRace(site),gate=race.west;
   world.userData.bridges.push({x:gate.x,z:gate.z,width:3.12,length:6.70,angle:0,left:race.bank,right:race.bank,approach38:0,brooksteadMillBridge:true});
  }
  const lamps=world.userData.landmarkLamps??=[];
  for(const [x,y,z,tint] of template.userData.lampSources)lamps.push({at:model.localToWorld(V3(x,y,z)),tint});
 }
 const spills=model.getObjectByName('Brookstead fountain spills');
 if(spills){spills.visible=brookFountainRunning221();if(atlas)atlasFountainSpills.set(exactAtlas67.scene,spills);}
 landmarkInstances.set(root,{wheel:model.getObjectByName('Brookstead waterwheel'),spills});
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
  const data=world.userData;
  if(!data.landmarkFieldReady&&data.landmarkLamps?.length){
   buildLampField33([...(data.lampSources??[]),...data.landmarkLamps.map(lamp=>lamp.at)]);
   data.landmarkFieldReady=true;
  }
  updateLandmarkLight();
  sun.shadow.needsUpdate=renderer.shadowMap.needsUpdate=true;
 }
 return result;
};
// The ground light and emissive windows belong to every landmark. One
// supplemental light gives nearby models and travellers directional shading.
function updateLandmarkLight(){
 const sources=world?.userData.landmarkLamps;
 if(!sources?.length||activeScene?.kind!=='overworld'||!player)return;
 let light=world.userData.landmarkPractical;
 if(!light){
  light=new THREE.PointLight(0xffbb77,0,13,2);light.name='Nearest landmark light';
  world.add(light);world.userData.landmarkPractical=light;
 }
 const u=light.userData,focus=cameraTarget,day=celestial31.day.value;
 if(!u.focus||u.focus.distanceToSquared(focus)>1){
  let best=70*70;u.target=null;
  for(const lamp of sources){
   const d=((focus.x-lamp.at.x)**2+(focus.z-lamp.at.z)**2)*(lamp===u.source ? .85 : 1);
   if(d<best){best=d;u.target=lamp;}
  }
  (u.focus??=V3()).copy(focus);
 }
 const step=4*clamp(clock-(u.time??clock),0,.2);u.time=clock;
 if(!u.source){u.source=u.target;u.gain=u.gain??1;}
 if(u.source!==u.target){u.gain=Math.max(0,u.gain-step);if(!u.gain)u.source=u.target;}
 else u.gain=Math.min(1,u.gain+step);
 if(!u.source){light.intensity=0;return;}
 const p=u.source.at,d=Math.hypot(focus.x-p.x,focus.z-p.z);
 light.position.copy(p);light.position.y+=.35;light.color.set(u.source.tint);
 light.intensity=18*(1-day)**1.3*(1-THREE.MathUtils.smoothstep(d,45,70))*u.gain;
}
const valenneLabelsBefore=updateWorldLabels44;
updateWorldLabels44=function(){
 valenneLabelsBefore();
 updateLandmarkLight();
 const brook=world?.userData.landmarks45?.brookstead,model=brook&&landmarkInstances.get(brook);
 if(model?.wheel)model.wheel.rotation.z=clock*.38;
 if(model?.spills)model.spills.visible=brookFountainRunning221();
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
