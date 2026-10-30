// Sculpted ground cover shares the botanical palette, but not one repeated
// flower silhouette. Patch identity is stable in world space as the party moves.
function gardenGeometry30(kind){
 const key='garden30-'+kind;if(sharedGeo[key])return sharedGeo[key];const p=[],uv=[],colors=[],parts=[],centers=[];
 const tri=(a,b,c,col,part=0,center=[0,0,0],tex=[0,0,1,0,.5,1])=>{for(const v of[a,b,c]){p.push(...v);colors.push(...col);parts.push(part);centers.push(...center);}uv.push(...tex);};
 function blade(a,h,w,lean,col,root=[0,-.44,0]){const d=[Math.cos(a),Math.sin(a)],point=(t,s)=>[root[0]+d[0]*lean*t*t-d[1]*s,root[1]+h*t,root[2]+d[1]*lean*t*t+d[0]*s];for(let j=0;j<2;j++){const t=j/2,u=(j+1)/2,A=point(t,-w*(1-t)),B=point(t,w*(1-t)),C=point(u,-w*(1-u)),D=point(u,w*(1-u));tri(A,B,C,col);tri(B,D,C,col);}}
 if(kind==='grassBlades')for(let i=0;i<8;i++){const a=i*2.399963;blade(a,.43+(i%5)*.105,.025+(i%3)*.01,.15+(i%4)*.065,[.35+(i%3)*.035,.57+(i%3)*.025,.20],[(i%3-1)*.05,-.44,Math.sin(i)*.06]);}
 else if(kind==='flowers')for(let k=0;k<3;k++){
  const a=k*2.399963,c=[Math.cos(a)*.21,.24+k*.12,Math.sin(a)*.21];blade(a,c[1]+.44,.012,.06,[.27,.45,.16],[c[0]-.06*Math.cos(a),-.44,c[2]-.06*Math.sin(a)]);
  for(let j=0;j<8;j++){const angle=j*TAU/8,r=.14+(k%2)*.025,tip=[c[0]+Math.cos(angle)*r,c[1]+.04,c[2]+Math.sin(angle)*r],l=[c[0]+Math.cos(angle-.25)*r*.68,c[1]-.015,c[2]+Math.sin(angle-.25)*r*.68],q=[c[0]+Math.cos(angle+.25)*r*.68,c[1]-.015,c[2]+Math.sin(angle+.25)*r*.68];tri(c,l,tip,[1,.97,.88],1,c);tri(c,tip,q,[.96,.94,.84],1,c);}
  for(let j=0;j<7;j++){const a=j*TAU/7,b=(j+1)*TAU/7;tri([c[0],c[1]+.047,c[2]],[c[0]+Math.cos(a)*.038,c[1]+.035,c[2]+Math.sin(a)*.038],[c[0]+Math.cos(b)*.038,c[1]+.035,c[2]+Math.sin(b)*.038],[.94,.62,.12],2,c);}
  for(const sign of[-1,1])blade(a+sign*.9,.34,.075,.2,[.29,.49,.18],[c[0],-.32,c[2]]);
 }
 else if(kind==='fern')for(let k=0;k<7;k++){const a=k*TAU/7;for(let j=1;j<7;j++){const t=j/7,center=[Math.cos(a)*t*.48,-.34+Math.sin(t*Math.PI*.74)*.62,Math.sin(a)*t*.48],width=(1-t*.78)*.17;for(const sign of[-1,1]){const tip=[center[0]+Math.cos(a+sign*.95)*width,center[1]+.035,center[2]+Math.sin(a+sign*.95)*width],edge=[center[0]+Math.cos(a)*.12,center[1]+.01,center[2]+Math.sin(a)*.12],fold=[(center[0]+tip[0]+edge[0])/3,center[1]+.06,(center[2]+tip[2]+edge[2])/3];tri(center,tip,fold,[.3+j*.018,.52+j*.02,.22]);tri(tip,edge,fold,[.34+j*.018,.56+j*.02,.24]);}}}
 else if(kind==='shrub'){
  const g=sprayGeometry30(18).clone();g.scale(.43,.36,.43);g.translate(0,-.01,0);const n=g.attributes.position.count;g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(n*3).fill(1),3));g.setAttribute('botanyPart30',new THREE.Float32BufferAttribute(new Float32Array(n),1));g.setAttribute('botanyCenter30',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));return sharedGeo[key]=g;
 }else return null;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('botanyPart30',new THREE.Float32BufferAttribute(parts,1));g.setAttribute('botanyCenter30',new THREE.Float32BufferAttribute(centers,3));g.computeVertexNormals();g.computeBoundingSphere();g.boundingSphere.radius*=1.65;return sharedGeo[key]=g;
}
const geometryBefore30=plantGeometry;plantGeometry=function(kind){return gardenGeometry30(kind)??geometryBefore30(kind);};
const distantBefore30=distantPlantGeometry;distantPlantGeometry=function(kind){if(kind==='shrub')return gardenGeometry30('shrub');if(kind!=='grassBlades')return distantBefore30(kind);const key='distant-grass30';if(sharedGeo[key])return sharedGeo[key];const source=gardenGeometry30(kind),g=new THREE.BufferGeometry();for(const[name,a]of Object.entries(source.attributes)){const data=new Float32Array(36*a.itemSize);for(let i=0;i<36;i++){const v=Math.floor(i/12)*24+i%12;for(let k=0;k<a.itemSize;k++)data[i*a.itemSize+k]=a.array[v*a.itemSize+k];}g.setAttribute(name,new THREE.BufferAttribute(data,a.itemSize));}g.computeBoundingSphere();return sharedGeo[key]=g;};
const natureBefore30=buildLocalNature;
buildLocalNature=function(){natureBefore30();if(activeScene.kind!=='poi')return;const b=activeScene.bounds,rng=seeded(30444+Math.floor(b[0]*31+b[2]*11));let planted=0;
 for(let x=b[0]+2;x<b[1]-2;x+=1.25)for(let z=b[2]+2;z<b[3]-2;z+=1.25){const d=roadDistance(x,z);if(d<3.5||d>7||rng()>.67||waterGround(x,z)||!staticFree(x,z,.6)||winterAt(x,z)>.5)continue;const patch=Math.sin(x*.17+Math.cos(z*.13))*Math.sin(z*.19-x*.05);if(patch<.12)continue;
  plant(x+(rng()-.5)*.7,z+(rng()-.5)*.7,.60+rng()*.55,patch>.62?'fern':patch>.30?'flower':'shrub');planted++;
 }
 if(activeScene.key==='brookstead')for(const side of[-1,1])for(let z=89;z<104;z+=.65){const x=-111+side*(8.3+rng()*.8);if(waterGround(x,z)||!staticFree(x,z,.4)||roadDistance(x,z)<2.65)continue;plant(x,z,.9+rng()*.4,rng()<.3?'shrub':'flower');plant(x+side*.45,z+.25,.65,'fern');planted+=2;}
 for(let x=b[0]+2;x<b[1]-2;x+=1.05)for(let z=b[2]+2;z<b[3]-2;z+=1.05){const d=roadDistance(x,z),patch=Math.sin(x*.21+Math.sin(z*.14))*Math.cos(z*.18);if(d<3.55||d>11||patch<-.15||rng()>.66||waterGround(x,z)||!staticFree(x,z,.4)||winterAt(x,z)>.5)continue;const px=x+(rng()-.5)*.7,pz=z+(rng()-.5)*.7;plant(px,pz,.55+rng()*.65,patch>.55&&rng()>.38?'flower':rng()>.80?'fern':'grassBlades');planted++;}
 world.userData.botany30={gardenClumps:planted,flowerForms:5,groundCover:['grass tufts','cupped daisies','buttercups','pink clover','bluebells','lavender','folded ferns','leafy shrubs']};
};
const plantsBefore30=buildPlants;
buildPlants=function(){plantsBefore30();const mats=new Map();
 for(const im of world.userData.plantMeshes??[]){const kind=im.userData.plantKey;if(!['flowers','fern','grassBlades','shrub'].includes(kind))continue;const base=im.material;
  if(!mats.has(base)){const m=physicalMaterial28(base);m.uniformsForDistance=base.uniformsForDistance;m.side=THREE.DoubleSide;m.roughness=.87;m.color.set('#ffffff');m.map=kind==='shrub'?(textures.leafOak30??textures.oakCanopy):kind==='flowers'?(textures.petal30??textures.cloth):textures.grass;m.alphaTest=kind==='shrub'?.35:0;m.alphaToCoverage=kind==='shrub';
   const old=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{old(sh);sh.vertexShader='attribute float plantStyle30,botanyPart30;attribute vec3 botanyCenter30;varying float flowerStyle30,flowerPart30;\n'+sh.vertexShader;
    sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
     flowerStyle30=plantStyle30;flowerPart30=botanyPart30;
     if(botanyPart30>.5){vec3 petalOffset30=transformed-botanyCenter30;if(plantStyle30>.5&&plantStyle30<1.5){petalOffset30.xz*=.76;petalOffset30.y+=length(petalOffset30.xz)*.7;}else if(plantStyle30>1.5&&plantStyle30<2.5){petalOffset30*=.76;petalOffset30.y+=length(petalOffset30.xz)*.45;}else if(plantStyle30>2.5&&plantStyle30<3.5){petalOffset30.y=-petalOffset30.y-length(petalOffset30.xz)*.7;petalOffset30.xz*=.7;}else if(plantStyle30>3.5){petalOffset30*=.55;petalOffset30.y+=.08;}transformed=botanyCenter30+petalOffset30;}
     transformed.y=-.44+(transformed.y+.44)*( .82+fract(plantStyle30*.173)*.5);`);
    sh.fragmentShader='varying float flowerStyle30,flowerPart30;\n'+sh.fragmentShader;
    if(kind==='grassBlades')sh.fragmentShader=sh.fragmentShader.replace('vec3 foliageArt=texture2D(map,vMapUv*.23).rgb;diffuseColor.rgb*=mix(vec3(1.),foliageArt*1.8,.27);','vec3 foliageArt=texture2D(map,vMapUv).rgb;diffuseColor.rgb*=mix(vec3(1.),foliageArt*1.8,.18);');
    if(kind==='fern')sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','diffuseColor.rgb*=mix(vec3(1.),texture2D(map,vMapUv).rgb*1.8,.2);');
    if(kind==='flowers')sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
     if(flowerPart30>.5&&flowerPart30<1.5){vec3 petalTint30=flowerStyle30<.5?vec3(1.,.98,.87):flowerStyle30<1.5?vec3(1.,.70,.15):flowerStyle30<2.5?vec3(.96,.45,.58):flowerStyle30<3.5?vec3(.45,.64,1.):vec3(.72,.45,.88);diffuseColor.rgb*=petalTint30;}`);
   };m.customProgramCacheKey=()=>key+'-botanical-forms30-'+kind;m.needsUpdate=true;mats.set(base,m);
  }im.material=mats.get(base);
  world.userData.botanicalOwned30??=new Set();const owned=world.userData.botanicalOwned30;
  const clones=new Map(),clone=g=>{if(!g)return g;if(!clones.has(g)){const copy=g.clone();clones.set(g,copy);owned.add(copy);}return clones.get(g);};im.geometry=clone(im.geometry);im.userData.detailedGeometry=clone(im.userData.detailedGeometry);im.userData.distantGeometry=clone(im.userData.distantGeometry);
  const styles=Float32Array.from({length:im.count},(_,i)=>{const e=im.userData.plantOriginal[i].elements,x=e[12],z=e[14];return Math.floor(Math.abs(Math.sin(Math.floor(x/3.5)*17.3+Math.floor(z/3.5)*31.7)*43758.3)%1*5);}),style=new THREE.InstancedBufferAttribute(styles,1);
  for(const g of new Set([im.geometry,im.userData.detailedGeometry,im.userData.distantGeometry].filter(Boolean))){g.setAttribute('plantStyle30',style);const n=g.attributes.position.count;if(!g.attributes.botanyPart30)g.setAttribute('botanyPart30',new THREE.Float32BufferAttribute(new Float32Array(n),1));if(!g.attributes.botanyCenter30)g.setAttribute('botanyCenter30',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));}
  im.computeBoundingSphere();
 }
};
function backgroundBotany30(g,matrices){g.setAttribute('plantStyle30',new THREE.InstancedBufferAttribute(Float32Array.from(matrices,m=>Math.floor(Math.abs(Math.sin(m.elements[12]*.19+m.elements[14]*.27)*43758.3)%1*5)),1));return g;}
// Both detail levels can have GPU buffers even when only one is currently
// attached. Dispose the complete owned set on travel, including inactive LODs.
const disposeBotanyBefore30=disposeContinuousWorld;
disposeContinuousWorld=function(...args){for(const g of world?.userData.botanicalOwned30??[])g.dispose();return disposeBotanyBefore30(...args);};
