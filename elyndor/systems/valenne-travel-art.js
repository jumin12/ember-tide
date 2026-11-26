// Travel-scale artwork is sampled in world coordinates. Routes, water depth,
// trees and landmark entrances still use the authored terrain and transforms.
const valenneArt={surfaces:null,river:null,loading:null};
const travelArtLoad=loadAssets;
loadAssets=async function(...args){
 const result=await travelArtLoad.apply(this,args);
 if(!valenneArt.loading)valenneArt.loading=loadValenneArt().catch(error=>{
  console.warn('The Valenne travel artwork could not load.',error);
  valenneArt.loading=null;
 });
 await valenneArt.loading;
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
 function crown(x,y,z,rx,ry,rz,turn,tint,needle=false,outer=false){
  const first=skin.length,n=outer?(lod===2?7:10):lod===0?(needle?26:18):lod===1?(needle?20:14):(needle?15:11);
  // Each bough has a shaded undercut, a projecting lip and a sloping sunlit top.
  // Keep the lip in the distant mesh so the tier still reads at travel distance.
  const profile=needle?[[.04,-.16,.55],[.69,-.31,.61],[1,-.23,.79],[.82,.02,1.04],[.38,.51,1.02],[.02,.85,1.08]]:
                       [[.04,-.66,.55],[.62,-.60,.66],[1,-.19,.80],[.92,.22,1.01],[.61,.70,1.08],[.025,1,1.08]];
  const rows=lod===2||outer?profile.filter((_,j)=>j!==1&&j!==4):profile;
  const sweep=(a,h)=>1+(needle?.16:.12)*Math.sin(a*(needle?7:5)+turn*1.9+h*.42)+.084*Math.sin(a*3-turn+h*.58);
  for(const [radius,h,tone] of rows)for(let i=0;i<n;i++){
   const a=i*TAU/n+turn,scallop=Math.sin(a*(needle?7:5)+turn*1.9+h*.42);
   const notch=Math.sin(a*3.0-turn+h*.58),r=radius*sweep(a,h)*(lod===2?1.065:1);
   const lip=(needle?.17:.13)*scallop*radius,down=style==='willow'?.28*Math.max(0,scallop)*radius:0;
   vertex(x+rx*r*Math.cos(a),y+ry*(h+lip-down),z+rz*r*Math.sin(a),true,
    tint*(tone+.055*scallop+.035*notch));
  }
  connect(first,n,rows.length);
  // Paired leaves grow along the outside twig. Separate roots and folded
  // blades leave small sky gaps and catch light on different faces.
  if(lod===2)return;
  const count=needle?16:outer?6:12,keep=lod===1?2:1;
  for(let k=0;k<count;k+=keep){
   const a=k*2.399963+turn,t=needle?-.07+.15*Math.sin(k*5.7):-.42+1.15*((k+.5)/count);
   const row=profile.findIndex((p,j)=>(!needle||j>=3)&&p[1]>t),lo=profile[row-1],hi=profile[row];
   const rad=mix(lo[0],hi[0],(t-lo[1])/(hi[1]-lo[1]))*sweep(a,t)*.97,dx=Math.cos(a),dz=Math.sin(a);
   const cx=x+dx*rx*rad,cz=z+dz*rz*rad,cy=y+t*ry;
   const reach=(needle?.36:.30)*Math.min(rx,rz),width=(needle?.095:style==='willow'?.085:style==='oak'?.16:.13)*rx;
   const drop=style==='willow'?.39*ry:needle?.13*ry:.038+.06*Math.sin(a);
   for(let j=-1;j<=1;j++){
    const v=skin.length,jx=dx-dz*j*.73,jz=dz+dx*j*.73;
    const baseX=cx+dx*(j===0?.10:-.11)*rx,baseZ=cz+dz*(j===0?.10:-.11)*rz;
    const midX=baseX+jx*reach*.52,midZ=baseZ+jz*reach*.52;
    const tone=tint*(.95+.13*Math.sin(a*7+j*2)),ridge=.10*ry;
    vertex(baseX,cy+.05,baseZ,true,tone*.72,.5,.02);
    vertex(midX-jz*width*.56,cy+ridge*.32,midZ+jx*width*.56,true,tone*.95,0,.52);
    vertex(midX,cy+ridge,midZ,true,tone*1.19,.5,.54);
    vertex(midX+jz*width*.56,cy+ridge*.15,midZ-jx*width*.56,true,tone*.83,1,.52);
    vertex(baseX+jx*reach,cy-drop,baseZ+jz*reach,true,tone*1.04,.5,1);
    indices.push(v,v+1,v+2,v,v+2,v+3,v+1,v+4,v+2,v+2,v+4,v+3);
   }
  }

 }
 if(form.tiers){
  for(let i=0;i<form.tiers;i++){
   const t=i/(form.tiers-1),y=mix(form.base+.49,form.top-.55,t);
   const r=form.width*(.16+.84*Math.pow(1-t,.83))*(.94+.1*random());
   const height=(form.top-form.base)/form.tiers*(style==='spruce'?1.24:1.12);
   crown(lean*t+.15*Math.sin(i*2),y,.12*Math.cos(i*1.4),r,height,r*(.90+.08*random()),i*1.83,.88+.14*t,true);
  }
 }else{
  const whorls=[3,form.lobes-5,2],lower=form.base+.58,upper=form.top-1.24;
  for(let tier=0;tier<whorls.length;tier++)for(let branch=0;branch<whorls[tier];branch++){
   const t=tier*.5,a=seed*.51+tier*2.15+TAU*branch/whorls[tier]+(random()-.5)*.38;
   const y=mix(lower,upper,t)+(random()-.5)*.38;
   const r=form.width*mix(.67,.46,t)*(.93+.14*random()),reach=form.width*mix(.67,.36,t);
   const x=lean*t+Math.cos(a)*reach,z=Math.sin(a)*reach;
   const ry=(style==='willow'?1.16:style==='birch'?.91:style==='oak'?.81:.96)*(.91+.17*random());
   const depth=r*(.85+.19*random());
   limb(lean*.4,Math.max(.9,y-1.10),.03,x,y,z,.095,.036);
   const tone=.88+.18*t;
   const spread=lod===2?1.04:.83;
   crown(x,y+.13*ry,z,r*spread,ry*.92,depth*spread,a,tone);
   // A broad branch divides at its outer end. Offset the two terminal sprays
   // below the main pad so its scalloped silhouette survives distant filtering.
   if(lod===2)continue;
   for(const side of [-1,1]){
    const fan=a+side*(style==='birch'?.86:1.05);
    crown(x+Math.cos(fan)*r*.63,y-ry*(style==='willow'?.39:.23),
     z+Math.sin(fan)*depth*.63,r*.56,ry*(style==='willow'?.80:.50),depth*.56,fan,tone*(side<0?.93:1.01),false,true);
   }
  }
  crown(lean,form.top-.78,.05,form.width*.46,.83,form.width*.41,seed*.4,1.06);
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
function woodlandCrownMaterial(depth=false){
 const m=depth?new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking}):
  new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96,metalness:0});
 m.userData.treeViewCompiled=true;
 if(depth)return m;
 addCloudLighting(m);
 const compile=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(shader,...args){
  compile.call(this,shader,...args);shader.uniforms.woodlandMain=forest30.main;
  shader.vertexShader='attribute float woodlandLeaf,treeViewHidden; uniform float woodlandMain; varying vec3 leafPoint; varying float isCanopy;\n'+shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nleafPoint=position;isCanopy=woodlandLeaf;transformed*=1.-treeViewHidden*woodlandMain;');
  shader.uniforms.crownLeaves={value:leafReliefTile(false)};shader.uniforms.crownNeedles={value:leafReliefTile(true)};
  shader.vertexShader='attribute vec2 leafBlade;varying vec2 bladeUV;varying vec3 branchNormal;\n'+shader.vertexShader.replace('leafPoint=position;', 'bladeUV=leafBlade;branchNormal=normal;leafPoint=position;');
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
    if(bladeUV.y>.0){
     float ridge=1.-smoothstep(.035,.11+fwidth(bladeUV.x),abs(bladeUV.x-.5));
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
 const brook=local&&!basin&&activeScene.key==='brookstead';
 const ribbon=brook&&(o.userData.waterRole||o.userData.waterfall||o===water);
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
     basin?'pool=stream62;vec2 channel=pool;float bank=0.,river=0.,flowTime=time62;':
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
   float facet=mix(poolSlope,slope,river);
   float signedFace=facet*(.49+.51*riffle)+river*fine*(.55+.76*riffle);
   float edgeGlint=smoothstep(.39,.99,signedFace);
   vec3 pigment=mix(vec3(.009,.032,.058),vec3(.027,.074,.082),shelf);
   pigment*=.78+.23*exposure+.18*broad;
   vec3 waterColour=pigment*mix(vec3(.41,.49,.68),vec3(1.),daylight);
   vec3 sheen=mix(vec3(.039,.063,.11),vec3(.115,.184,.216),daylight);
   sheen*=.72+.43*sky62;
   waterColour=mix(waterColour,ink,.82)*(.99+.12*clamp(signedFace,-1.,1.));
   float brokenCrest=edgeGlint*(.12+.88*riffle)*(.48+.52*smoothstep(.017,.072,dot(ink,vec3(.21,.72,.07))));
   waterColour+=sheen*(brokenCrest*(.14+.22*clearSun)+.14*ribbons*river);
   float foam=driftingFoam(mix(pool,channel,river),flowTime,bank,shelf,signedFace);
   vec3 froth=mix(vec3(.095,.14,.20),vec3(.42,.59,.63),daylight);
   waterColour=mix(waterColour,froth,clamp(foam*mix(.21+.43*bank,.63,river),0.,.55));
   ${travel?`if(reflect62>.5){
    vec2 dir=normalize(flow62+vec2(.0001));
    vec2 uv=reflected62.xy/max(.001,reflected62.w)+.008*(dir*facet+vec2(-dir.y,dir.x)*fine);
    float facing=1.-max(0.,view62.y);
    waterColour=mix(waterColour,texture2D(mirror62,clamp(uv,.002,.998)).rgb,mirrorCoverage62(reflected62)*(.045+.16*facing*facing));
   }`:''}
   vec2 downstream=normalize(mix(drift,flow62,river)+vec2(.0001));
   vec2 tilted=downstream*facet*.22+vec2(-downstream.y,downstream.x)*fine*.19;
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
 m.userData.paintedWater=basin?'basin':ribbon?'millstream':o.userData.millrace?'miniature-millrace':coast?'coast':local?'pond':'travel';
 m.customProgramCacheKey=()=>key+'-valenne-surface-'+m.userData.paintedWater;m.needsUpdate=true;return m;
};

// The live world and the atlas share the detailed geometry. Keep the original
// root and its game-owned footprint and entrance records through scene swaps.
const landmarkModels=new Map(),landmarkInstances=new WeakMap();
function installRegionalLandmark(root,template,site,atlas){
 if(!root||landmarkInstances.has(root))return;
 const retired=new THREE.Group();retired.add(...root.children.slice());retired.visible=false;root.add(retired);
 const model=template.clone(true);root.add(model);model.position.y-=root.position.y;
 model.traverse(o=>{
  if(!o.isMesh)return;
  if(atlas){holdAtlas67(o.geometry);holdMaterial67(o.material);}
  else o.material=playerRevealMaterial(o.material);
 });
 model.updateWorldMatrix(true,true);
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
 landmarkInstances.set(root,{wheel:model.getObjectByName('Brookstead waterwheel')});
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
  sun.shadow.needsUpdate=renderer.shadowMap.needsUpdate=true;
 }
 return result;
};
// One practical light follows the nearest visible cluster. Windows and crystals
// everywhere else still feed the HDR bloom pass through their own emissive maps.
function updateLandmarkLight(){
 const sources=world?.userData.landmarkLamps;
 if(!sources?.length||activeScene?.kind!=='overworld'||!player)return;
 let light=world.userData.landmarkPractical;
 if(!light){
  light=new THREE.PointLight(0xffbb77,0,13,2);light.name='Nearest landmark light';
  world.add(light);world.userData.landmarkPractical=light;
 }
 const day=celestial31.day.value;
 if(day>.94){light.intensity=0;return;}
 if(light.userData.nextCheck>clock&&light.userData.nextCheck<clock+1)return;
 light.userData.nextCheck=clock+.15;
 let closest=null,best=70*70;
 for(const s of sources){
  const d=(player.x-s.at.x)**2+(player.z-s.at.z)**2;if(d<best){best=d;closest=s;}
 }
 light.intensity=closest?18*(1-day)**1.3*(1-THREE.MathUtils.smoothstep(Math.sqrt(best),45,70)):0;
 if(closest){light.position.copy(closest.at);light.position.y+=.35;light.color.set(closest.tint);}
}
const valenneLabelsBefore=updateWorldLabels44;
updateWorldLabels44=function(){
 valenneLabelsBefore();
 updateLandmarkLight();
 const brook=world?.userData.landmarks45?.brookstead,wheel=brook&&landmarkInstances.get(brook)?.wheel;
 if(wheel)wheel.rotation.z=clock*.38;
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
