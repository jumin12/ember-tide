// Regional light, surface colour, practical details and restrained movement
// are authored against the original twenty landscape paintings.
const STAGECRAFT94={
 waterfall:{key:'#fff0cd',sky:'#a8d0d6',soil:'#c7d3af',sun:3.5,fill:.82,x:-24,kind:'basin',fall:[.46,.44,.72,.85],mist:.035},
 woodland:{key:'#ffe4ad',sky:'#a7c5bb',soil:'#c9b998',sun:2.8,fill:.88,x:-20,kind:'wood',leaves:16,mist:.025},
 orchard:{key:'#ffe1a4',sky:'#c7d5be',soil:'#ddc598',sun:3.25,fill:.83,x:22,kind:'farm',leaves:10},
 ruins:{key:'#ffefc7',sky:'#bad1ca',soil:'#c7c9b1',sun:3.35,fill:.82,x:-23,kind:'ruin',mist:.02},
 cavern:{key:'#b6dfea',sky:'#719ba6',soil:'#adb9bb',sun:1.55,fill:.82,x:-15,kind:'crystal',mist:.025},
 mountain:{key:'#ffe5b4',sky:'#b9cfdf',soil:'#d3bd99',sun:3.55,fill:.82,x:-27,kind:'ridge'},
 snow:{key:'#fff2da',sky:'#bdcfe4',soil:'#e5edf3',sun:2.65,fill:.94,x:-22,kind:'snow'},
 coast:{key:'#ffe8bc',sky:'#b7d7df',soil:'#e3cfa9',sun:3.45,fill:.90,x:26,kind:'shore',mist:.018},
 royalRoad:{key:'#ffe4af',sky:'#c1d3cd',soil:'#d5c9ac',sun:3.4,fill:.85,x:-21,kind:'royal'},
 moonlit:{key:'#e9e8c7',sky:'#adc8bc',soil:'#c7c6ad',sun:2.9,fill:.86,x:-23,kind:'elder',leaves:8,mist:.03},
 grassMeadow:{key:'#fff0cb',sky:'#abd4d1',soil:'#cbd8ad',sun:3.5,fill:.88,x:-24,kind:'meadow',fall:[.50,.40,.83,.84],mist:.025},
 grassRiver:{key:'#ffedc4',sky:'#b6d2c8',soil:'#d0d6b1',sun:3.4,fill:.86,x:-24,kind:'river'},
 grassFlowers:{key:'#fff0bf',sky:'#b9d5cb',soil:'#cbd7ad',sun:3.35,fill:.9,x:-21,kind:'flowers',fall:[.43,.39,.71,.87],leaves:9},
 grassDowns:{key:'#ffecc5',sky:'#b4d0dc',soil:'#d8cdab',sun:3.5,fill:.88,x:23,kind:'shore'},
 grassWindmill:{key:'#ffe0a6',sky:'#cfcead',soil:'#dfc998',sun:3.2,fill:.83,x:25,kind:'farm',leaves:12},
 grassAutumn:{key:'#ffd193',sky:'#c6c6bb',soil:'#dfbb8c',sun:3.25,fill:.84,x:24,kind:'autumn',leaves:34,fall:[.45,.35,.59,.60]},
 grassStones:{key:'#ffedc1',sky:'#b9d5ce',soil:'#cdd6b2',sun:3.3,fill:.88,x:-22,kind:'stones',leaves:7},
 grassHills:{key:'#ffe9bd',sky:'#b6d1d5',soil:'#cbd4ab',sun:3.4,fill:.86,x:-25,kind:'ridge'},
 grassBirch:{key:'#fff0cd',sky:'#bbd5c6',soil:'#d0d8b4',sun:3.3,fill:.90,x:-22,kind:'birch',leaves:18},
 grassTwilight:{key:'#ffca95',sky:'#b5b9d0',soil:'#cfb1a5',sun:2.6,fill:.88,x:-25,kind:'dusk',leaves:8,mist:.025}
};
const regionalLightBefore94=arenaLight89;
arenaLight89=function(b){
 regionalLightBefore94(b);const p=STAGECRAFT94[encounter53.selected];if(!p||!b.hybridKey90)return;const c=encounter53;
 sun.color.set(b.night?'#a9cbed':p.key);sun.intensity=b.night?1.45:p.sun;hemi.color.set(b.night?'#91abc5':p.sky);hemi.groundColor.set(b.night?'#394956':'#777361');hemi.intensity=b.night?.78:p.fill;
 sun.position.set(c.center.x+p.x,c.floorY+(b.spec.twilight?19:30),c.center.z-19);sun.target.position.set(c.center.x,c.floorY,c.center.z-4);sun.target.updateMatrixWorld();sun.shadow.radius=b.spec.dense?4.5:3.6;b.exposure89=b.night?1.09:1.02;
};
const regionalTreeBefore94=arenaTree88;
arenaTree88=function(b,x,z,size=1,kind=b.spec.trees){
 const orchard=b.hybridKey90&&kind==='orchard',first=b.nativeTrees89?.leaves.length??0;regionalTreeBefore94(b,x,z,size,orchard?'oak':kind);if(!orchard)return;
 const crowns=b.nativeTrees89.leaves.slice(first),n=Math.min(b.mobile?5:9,crowns.length),g=arenaGeometry88(b,'orchard-fruit94',()=>new THREE.IcosahedronGeometry(.13,1)),m=arenaMaterial88(b,null,'#b64a2c');m.roughness=.67;
 for(let i=0;i<n;i++){const crown=crowns[Math.floor(i/n*crowns.length)].matrix,p=V3(),q=new THREE.Quaternion(),s=V3();crown.decompose(p,q,s);p.y-=s.y*.25;arenaInstance88(b,'orchard-fruit94',g,m,p,V3(size,size,size));}
};
const regionalTreeFlushBefore94=flushPoiTrees89;
flushPoiTrees89=function(b){regionalTreeFlushBefore94(b);if(!b.hybridKey90)return;for(const o of b.group.children){if(o.name!=='POI native botanical canopy')continue;const m=o.material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(s,...a){before.call(this,s,...a);if(s.uniforms.localSnow39)s.uniforms.localSnow39={value:b.spec.snow?1:0};};m.customProgramCacheKey=()=>key()+'-regional-snow94-'+!!b.spec.snow;}}
const regionalFenceBefore94=arenaFence88;
function propFoot94(b,x,z,w,d){const y=Math.min(...[-1,1].flatMap(s=>[-1,1].map(t=>arenaFloor88(b,x+s*w/2,z+t*d/2))));(b.propRoots94??=[]).push({x,z,w,d,base:y,kind:'foundation'});return y;}
function levelBuildingSite94(b,x,z,w,d,build){
 if(!b.hybridKey90)return build();const ground=b.floor,feet=[-1,1].flatMap(a=>[-1,1].map(c=>arenaFloor88(b,x+a*w/2,z+c*d/2))),low=Math.min(...feet),top=Math.max(...feet);
 b.floor=(xx,zz)=>Math.abs(xx-x)<=w/2+.1&&Math.abs(zz-z)<=d/2+.1?top:ground(xx,zz);try{build();}finally{b.floor=ground;}
 arenaBox88(b,[x,(low+top)/2,z],[w+.10,Math.max(.12,top-low)+.12,d+.10],'wallA','#b8bbab');(b.propRoots94??=[]).push({x,z,w,d,base:low,kind:'building footing'});
}
const regionalHouseBefore94=arenaHouse88,regionalMillBefore94=arenaWindmill88;
arenaHouse88=function(b,x,z,w=11,d=8){return levelBuildingSite94(b,x,z,w,d,()=>regionalHouseBefore94(b,x,z,w,d));};
arenaWindmill88=function(b,x,z){return levelBuildingSite94(b,x,z,6.5,6.5,()=>regionalMillBefore94(b,x,z));};
arenaFence88=function(b,x,z,length,angle=0){
 if(!b.hybridKey90)return regionalFenceBefore94(b,x,z,length,angle);const n=Math.ceil(length/2.8),dx=Math.cos(angle),dz=Math.sin(angle),posts=[];
 for(let i=0;i<=n;i++){const t=-length/2+i/n*length,xx=x+dx*t,zz=z+dz*t,y=arenaFloor88(b,xx,zz);posts.push([xx,y,zz]);arenaBox88(b,[xx,y+.72,zz],[.18,1.44,.18],'wood','#c7b18a');}
 for(let i=1;i<posts.length;i++)for(const h of[.44,1.06]){const a=posts[i-1],c=posts[i];arenaBeam88(b,[a[0],a[1]+h,a[2]],[c[0],c[1]+h,c[2]],.07,'wood','#cdb58d');}
};
const regionalArchBefore94=arenaArch88;
arenaArch88=function(b,x,z,width=10,height=10){
 if(!b.hybridKey90)return regionalArchBefore94(b,x,z,width,height);const r=width/2+1,feet=[arenaFloor88(b,x-r,z),arenaFloor88(b,x+r,z)],spring=Math.max(...feet)+height*.67,stone='#c9c9b6';
 for(const[i,side]of[-1,1].entries()){const xx=x+side*r,y=propFoot94(b,xx,z,2.6,3.2),h=spring-y;arenaBox88(b,[xx,y+h/2,z],[2,h,2.7],'wallA',stone);arenaBox88(b,[xx,y+.27,z],[2.6,.54,3.2],'wall',stone);arenaBox88(b,[xx,spring-.12,z],[2.25,.40,2.9],'wallA',stone);}
 for(let i=0;i<13;i++){const a=(i+.5)/13*Math.PI,g=arenaGeometry88(b,'box',()=>new THREE.BoxGeometry(1,1,1));arenaInstance88(b,'arch',g,arenaMaterial88(b,'wallA',stone),V3(x+Math.cos(a)*r,spring+Math.sin(a)*r,z),V3(r*Math.PI/13+.10,1.3,2.7),new THREE.Quaternion().setFromAxisAngle(V3(0,0,1),a-Math.PI/2));}b.counts.arches++;
};
const regionalBridgeBefore94=arenaBridgeStone89;
arenaBridgeStone89=function(b,x,z,width=4.5,length=14){
 if(!b.hybridKey90)return regionalBridgeBefore94(b,x,z,width,length);const n=20,start=arenaFloor88(b,x,z-length/2)+.13,end=arenaFloor88(b,x,z+length/2)+.13;
 for(let i=0;i<n;i++){const t=i/(n-1),zz=z+(t-.5)*length,top=mix(start,end,t)+Math.sin(t*Math.PI)*1.3;arenaBox88(b,[x,top-.22,zz],[width,.44,length/n+.05],'cobble','#cec9b5');for(const side of[-1,1]){arenaBox88(b,[x+side*width/2,top+.42,zz],[.4,.84,length/n+.07],'wallA','#c4c8b7');if(i%5===0){arenaBox88(b,[x+side*width/2,top+.57,zz],[.62,1.14,.65],'wall','#d2d0bd');const foot=arenaFloor88(b,x+side*width/2,zz);arenaBox88(b,[x+side*width/2,(foot+top)/2-.10,zz],[.45,Math.max(.2,top-foot),.5],'wallA','#aab3ad');}}}b.counts.bridges++;
};
function windLeaves94(b,p){
 if(!p.leaves||b.spec.snow||b.spec.cave)return;const n=Math.round(p.leaves*(b.mobile?.55:1)),positions=[],uv=[],seeds=[];
 for(let i=0;i<n;i++){const x=-28+b.rng()*56,y=1+b.rng()*10,z=-12-b.rng()*30;for(const[dx,dy,u,v]of[[-.11,-.07,0,0],[.11,-.07,1,0],[-.11,.07,0,1],[.11,-.07,1,0],[.11,.07,1,1],[-.11,.07,0,1]]){positions.push(x+dx,y+dy,z);uv.push(u,v);seeds.push(b.rng(),i/n);}}
 const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('leafSeed94',new THREE.Float32BufferAttribute(seeds,2));
 const m=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:stageDepth59.time,map:{value:arenaTexture88(b.spec.autumn?'leafMaple30':p.kind==='birch'?'leafBirch30':'leafOak30')},tint:{value:new THREE.Color(b.night?'#708e87':b.spec.autumn?'#d7a464':'#b4bf7c')}},vertexShader:'attribute vec2 leafSeed94;uniform float time;varying vec2 v;varying float fade;void main(){v=uv;vec3 p=position;p.y=mod(p.y-time*(.12+leafSeed94.y*.11),11.);p.x+=sin(time*.36+leafSeed94.y*41.)*.7+time*.025;p.z+=sin(time*.25+leafSeed94.y*19.)*.5;fade=smoothstep(.5,1.8,p.y)*(1.-smoothstep(9.,11.,p.y));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'uniform sampler2D map;uniform vec3 tint;varying vec2 v;varying float fade;void main(){vec4 c=texture2D(map,v);float a=c.a*fade*.68;if(a<.08)discard;gl_FragColor=vec4(c.rgb*tint,a);}'})),o=new THREE.Mesh(g,m);o.name='Sparse wind-borne regional leaves';o.frustumCulled=false;b.group.add(o);b.stagecraft94.leaves=n;
}
function placeRegionalProps94(b,p){
 const q=fightingHollow93(b),back=q.back-10;
 const anchor=(u,v)=>{const a=bankPoint93(b,u,v);return a&&detailFree92(b,a.x,a.z,1.8)&&a.z<q.back-2?a:null;};
 if(['wood','birch','autumn','elder'].includes(p.kind)){const a=anchor(.15,.52);if(a){arenaLog89(b,a.x,a.z,.8,-.25);for(let i=0;i<6;i++)botanical92(b,a.x+2+i*.25,a.z+.7,'fern',.42);b.stagecraft94.props++;}}
 if(['farm','royal'].includes(p.kind)){const a=anchor(.88,.52);if(a){for(let i=0;i<2;i++){const x=a.x+i*1.3,z=a.z-i*.7,y=propFoot94(b,x,z,1.18,1.05);arenaBox88(b,[x,y+.48,z],[1.05,.96,.9],'crateFace','#d2bb94',i*.12);}arenaLog89(b,a.x-2,a.z-1,.55,.3);b.stagecraft94.props+=3;}}
 if(p.kind==='ruin'){for(const u of[.12,.84]){const a=anchor(u,.48);if(!a)continue;for(let i=0;i<4;i++){const x=a.x+i*.62,z=a.z-i*.55,y=arenaFloor88(b,x,z);arenaBox88(b,[x,y+.23,z],[1.1,.46,.85],'wallA','#c1c6ad',.1+i*.25);}scree92(b,a.x,a.z,1.1);b.stagecraft94.props+=4;}}
 if(['shore','river'].includes(p.kind)){for(const u of[.10,.90]){const a=anchor(u,.51);if(!a)continue;arenaLog89(b,a.x,a.z,.72,u<.5?.45:-.2);scree92(b,a.x+1,a.z,.8);for(let i=0;i<8;i++)botanical92(b,a.x-1+i*.3,a.z+(i%2)*.5,'fern',.3);b.stagecraft94.props++;}}
 if(['meadow','flowers','stones'].includes(p.kind)){for(let i=0;i<28;i++){const x=q.left+1+b.rng()*(q.right-q.left-2),z=back-b.rng()*9;if(arenaWet89(b,x,z)>.1)continue;botanical92(b,x,z,'flowers',.38+b.rng()*.23);}b.stagecraft94.props+=28;}
 if(p.kind==='ridge'){for(const u of[.09,.88]){const a=anchor(u,.49);if(!a)continue;arenaRock88(b,a.x,a.z,2.2,2.8,1.4,2);scree92(b,a.x,a.z,1.3);b.stagecraft94.props++;}}
 if(p.kind==='snow'){const a=anchor(.88,.51);if(a){for(let i=0;i<4;i++){const x=a.x+i*.6,z=a.z-i*.35,y=arenaFloor88(b,x,z);arenaRock88(b,x,z,.8,.6+i*.13,.7,i+3,y);}b.stagecraft94.props+=4;}}
 if(p.kind==='crystal'){for(const side of[-1,1]){const x=side*15,z=back-4,y=arenaFloor88(b,x,z);arenaRock88(b,x,z,1.6,.7,1.2,6,y);scree92(b,x,z,1.2);b.stagecraft94.props++;}}
}
const regionalDressBefore94=dressHybrid90;
dressHybrid90=function(b){
 regionalDressBefore94(b);const p=STAGECRAFT94[encounter53.selected];if(!p)return;b.stagecraft94={region:encounter53.selected,props:0,leaves:0,backgroundEffects:true};
 // Set the final local fill after the generic dressing has been constructed.
 const front=b.group.children.find(o=>o.isDirectionalLight&&o!==sun);if(front){front.color.set(b.night?'#b7cee1':'#ffefd8');front.intensity=b.night?.78:b.spec.dense?.86:.78;}hemi.intensity=b.night?.78:p.fill;
 const ground=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),colors=ground.geometry.attributes.color,tint=new THREE.Color(b.night?'#c1cdd1':p.soil);for(let i=0;i<colors.count;i++)colors.setXYZ(i,tint.r,tint.g,tint.b);colors.needsUpdate=true;ground.material.normalScale.setScalar(b.spec.snow?.20:.34);
 placeRegionalProps94(b,p);windLeaves94(b,p);
 if(p.mist)arenaMist89(b,4,5,Math.min(-34,fightingHollow93(b).back-15),31,5,p.mist*(b.night?.65:1));
 if(b.particles89){const m=b.particles89.material;m.uniforms.pixel94={value:Math.min(2,devicePixelRatio||1)};m.vertexShader='uniform float pixel94;'+m.vertexShader;m.vertexShader=m.vertexShader.replace('gl_PointSize=clamp(', 'gl_PointSize=pixel94*clamp(');m.uniforms.moteTint94={value:new THREE.Color(b.spec.cave?'#83d3e3':b.spec.autumn?'#eac189':b.night?'#9dd9d7':'#f4dfad')};m.fragmentShader='uniform vec3 moteTint94;'+m.fragmentShader;m.fragmentShader=m.fragmentShader.replace('gl_FragColor=vec4(c,a);','gl_FragColor=vec4(c*moteTint94,a*.72);');m.needsUpdate=true;}
};
const paintedEffectsBefore94=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 paintedEffectsBefore94(b);const p=STAGECRAFT94[encounter53.selected],m=b.landscape90.material;if(p?.kind==='dusk'&&!b.night&&b.clouds89){b.clouds89.material.uniforms.cloudLight31.value.set('#e5bd9a');b.clouds89.material.uniforms.cloudShade31.value.set('#787a9b');}Object.assign(m.uniforms,{flowMask94:{value:new THREE.Vector4(...(p?.fall??[0,0,0,0]))},cloudPower94:{value:b.spec.cave?0:b.night?.006:.022},crystal94:{value:b.spec.cave?1:0}});
 m.fragmentShader='uniform vec4 flowMask94;uniform float cloudPower94,crystal94;'+m.fragmentShader;
 m.fragmentShader=m.fragmentShader.replace('vec3 rgb=texture2D(map,uv).rgb;',`float flow94=smoothstep(flowMask94.x,flowMask94.x+.025,uv.x)*(1.-smoothstep(flowMask94.z-.025,flowMask94.z,uv.x))*smoothstep(flowMask94.y,flowMask94.y+.035,uv.y)*(1.-smoothstep(flowMask94.w-.035,flowMask94.w,uv.y));flow94*=step(.01,flowMask94.z)*smoothstep(.18,.65,min(original.r,min(original.g,original.b)));uv.y+=flow94*sin(uv.y*260.+time*5.2+uv.x*17.)*.0007;vec3 rgb=texture2D(map,uv).rgb;float land94=green*(1.-smoothstep(.82,.95,uv.y));float shade94=sin(uv.x*12.+uv.y*7.+time*.018)*sin(uv.y*9.-time*.024);rgb*=1.+shade94*cloudPower94*land94;float cyan94=smoothstep(.06,.26,rgb.b-rgb.r)*smoothstep(.04,.17,rgb.g-rgb.r)*smoothstep(.3,.65,uv.y)*smoothstep(.12,.32,abs(uv.x-.5));rgb+=vec3(.002,.009,.012)*cyan94*crystal94*(.6+.4*sin(time*.7+uv.x*13.));`);m.needsUpdate=true;
};
