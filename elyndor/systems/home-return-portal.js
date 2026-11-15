// RE116: the permanent return threshold on the private plot. Town summons,
// travel destinations, interaction radii and saved housing data stay native.
const RETURN_LAYERS148=['depth','upper','middle','lower'];
const returnArt148={texture:null,layers:[],promise:null};
function warmReturnArt148(){
 if(returnArt148.texture)return Promise.resolve(returnArt148.texture);
 if(!returnArt148.promise){const mobile=mobileStartup116(),loader=new THREE.TextureLoader();returnArt148.promise=Promise.all(RETURN_LAYERS148.map(name=>new Promise((resolve,reject)=>loader.load('elyndor/assets/runtime-v148/homeward-'+name+(mobile?'-mobile':'')+'.webp',t=>{
  t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());t.userData.returnCurrent148=name;pinMapResource17(t);textures['homeward148_'+name]=t;resolve(t);
 },undefined,reject)))).then(maps=>{returnArt148.texture=maps[0];returnArt148.layers=maps.slice(1);return maps[0];}).catch(e=>{returnArt148.promise=null;throw e;});}return returnArt148.promise;
}
function bindReturnLayers148(p){const fx=p.return148;fx.uniforms.current148.value=returnArt148.texture;fx.uniforms.artReady148.value=1;fx.uniforms.depthSmoke153.value=returnArt148.layers[1];fx.uniforms.smokeUpper154.value=returnArt148.layers[0];fx.uniforms.smokeLower154.value=returnArt148.layers[2];fx.uniforms.smokeReady153.value=1;for(let i=0;i<fx.currents.children.length;i++){const u=fx.currents.children[i].material.uniforms;u.current148.value=returnArt148.layers[i];u.ready148.value=1;}}
const returnPrepareBefore148=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){if(state.scene==='homePlot139'){await warmReturnArt148();for(const p of world.userData.homePortals139??[])if(p.return148)bindReturnLayers148(p);}return returnPrepareBefore148(...args);};
function returnStoneUV148(g,offset=0){
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 if(uv)for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,(nx>.6?z:x)*.68+offset,(ny>.6?z:y)*.68+offset*.41);}
 return g;
}
function returnBevel148(w,h,d,bevel=.025){
 const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:d-2*bevel,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,steps:1});g.translate(0,0,-d/2+bevel);return g;
}
function returnStoneMaterial148(tint,seed=0){
 const map=environment102.maps.get('rockLimestone')??textures.rockA,nr=envPbr103.maps.get('rockLimestone:normalRough');
 const m=new THREE.MeshPhysicalMaterial({map,color:tint,bumpMap:nr?null:map,bumpScale:.042,normalMap:nr??null,normalScale:new THREE.Vector2(.45,.45),roughness:.84,metalness:0});
 m.userData.returnStone148=true;
 // Fine age stains follow the actual masonry, rather than another painted
 // layer hovering above it. Most stone remains clean and readable.
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 stonePoint148;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstonePoint148=position;');s.fragmentShader='varying vec3 stonePoint148;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float damp148=.5+.5*sin(stonePoint148.x*6.1+sin(stonePoint148.y*8.2+${seed.toFixed(2)})*1.7+stonePoint148.z*5.);
 float age148=smoothstep(.69,.96,damp148)*.20;diffuseColor.rgb*=mix(vec3(1.),vec3(.55,.68,.40),age148);`);};m.customProgramCacheKey=()=> 'return-weathered-stone148-'+seed;return m;
}
function buildReturnArch148(p){
 const frame=new THREE.Group();frame.name='Weathered Homeward arch';p.group.add(frame);
 const materials=['#c1c7b4','#b4bdaa','#cbd0bb'].map((c,i)=>returnStoneMaterial148(c,i+1));
 const add=(geo,x,y,z,variant=0)=>{const o=new THREE.Mesh(returnStoneUV148(geo,variant*.271),materials[variant%materials.length]);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;frame.add(o);return o;};
 const block=(x,y,z,w,h,d,v=0,b=.024)=>add(returnBevel148(w,h,d,b),x,y,z,v);
 // Voussoirs are full-depth individual stones with narrow recessed joints.
 // Two concentric courses make the archivolt substantial from oblique views.
 for(let course=0;course<2;course++)for(let i=0;i<17;i++){
  const lo=1.075+course*.29,hi=lo+.284,a=i*Math.PI/17+.004,b=(i+1)*Math.PI/17-.004,s=new THREE.Shape();
  s.absarc(0,0,hi,a,b,false);s.absarc(0,0,lo,b,a,true);s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:.80,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,steps:1,curveSegments:3});geo.translate(0,0,-.40);add(geo,0,3.12,0,(i+course)%3);
 }
 for(const sign of[-1,1]){
  // Joined square piers behind rounded engaged shafts, raised on plinths.
  for(let j=0;j<6;j++)block(sign*1.345,.58+j*.445,-.035,.51,.433,.84,j%3);
  for(const [y,w,h,d]of[[.37,.79,.16,1.03],[.50,.64,.13,.91],[2.94,.64,.12,.94],[3.06,.80,.13,1.02],[3.20,.88,.11,1.10]])block(sign*1.34,y,.005,w,h,d,2);
  for(const face of[-1,1]){
   for(const x of[sign*1.20,sign*1.46]){
    add(new THREE.CylinderGeometry(.079,.093,2.29,12,1),x,1.73,face*.43,1);
    for(const y of[.59,2.86])add(new THREE.CylinderGeometry(.116,.116,.075,14),x,y,face*.43,2);
   }
   block(sign*1.345,1.72,face*.405,.095,2.22,.11,0,.012);
  }
 }
 // The small stone gable and pyramid echo the reference's restrained crest.
 for(const face of[-1,1])for(const sign of[-1,1]){const o=block(sign*.245,4.285,face*.435,.61,.115,.15,2,.015);o.rotation.z=-sign*.52;}
 const cap=add(new THREE.ConeGeometry(.18,.41,4),0,4.96,.0,2);cap.rotation.y=Math.PI/4;
 block(0,4.77,0,.34,.09,.32,1,.02);
 mergeGroup(frame);frame.traverse(o=>{if(o.isMesh)o.userData.dynamicFX=true;});
 // Paving is actual masonry on a stepped, solid cylindrical threshold.
 const footMaterial=returnStoneMaterial148('#afb6a2',4),base=new THREE.Group();base.name='Grounded threshold';p.group.add(base);
 for(const [r,y,h]of[[1.79,.075,.15],[1.75,.185,.07],[1.72,.265,.09]]){
  const geo=new THREE.CylinderGeometry(r,r+.012,h,64,1),o=new THREE.Mesh(returnStoneUV148(geo),footMaterial);o.position.y=y;o.castShadow=o.receiveShadow=true;o.userData.dynamicFX=true;base.add(o);
 }
 const paving=new THREE.Group(),pavingMaterial=returnStoneMaterial148('#bdc5b5',5);paving.name='Individually fitted threshold flagstones';
 const clip=(poly,axis,edge,sign)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],inside=sign*(a[axis]-edge)>=0,next=sign*(b[axis]-edge)>=0;if(inside)out.push(a);if(inside!==next){const t=(edge-a[axis])/(b[axis]-a[axis]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;};
 for(let row=-3;row<=3;row++)for(let column=-3;column<=3;column++){
  const x=column*.59+(row%2?.295:0),z=row*.53;let poly=Array.from({length:64},(_,i)=>[Math.cos(i/64*TAU)*1.697,Math.sin(i/64*TAU)*1.697]);
  for(const[axis,edge,sign]of[[0,x-.285,1],[0,x+.285,-1],[1,z-.255,1],[1,z+.255,-1]])poly=clip(poly,axis,edge,sign);if(poly.length<3)continue;
  const s=new THREE.Shape();poly.forEach(([x,z],i)=>i?s.lineTo(x,z):s.moveTo(x,z));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.018,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1,steps:1});geo.rotateX(-Math.PI/2);geo.translate(0,.313,0);returnStoneUV148(geo);
  const o=new THREE.Mesh(geo,pavingMaterial);o.castShadow=o.receiveShadow=true;paving.add(o);
 }
 mergeGroup(paving);paving.traverse(o=>{if(o.isMesh)o.userData.dynamicFX=true;});base.add(paving);
 p.shell146=frame;p.foot146=base;return{frame,base};
}
const returnNoise148=`
 float hash148(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
 float noise148(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash148(i),hash148(i+vec2(1,0)),f.x),mix(hash148(i+vec2(0,1)),hash148(i+1.),f.x),f.y);}
 float cloud148(vec2 p){return noise148(p)*.57+noise148(p*2.13+4.3)*.28+noise148(p*4.07-3.2)*.15;}
 float opening148(vec2 p){return min(p.y-.285,p.y<3.12?1.065-abs(p.x):1.065-length(p-vec2(0.,3.12)));}
 // A changing stream field bends individual parts of the approved wisps.
 // Its incommensurate eddies have no common pivot or whole-image rotation.
 vec2 fluidCurrent152(vec2 p,float t,float layer){
  float a=p.x*4.7+p.y*2.3+t*.21+layer*1.91,b=p.y*5.3-p.x*1.7-t*.19-layer*2.13;
  vec2 curl=vec2(2.3*cos(a)+5.3*sin(b),-4.7*cos(a)+1.7*sin(b))*.012;
  curl+=vec2(sin(p.y*8.1+p.x*2.9-t*.31+layer),cos(p.x*7.3-p.y*3.1+t*.27-layer))*.018;
  return p+curl+vec2(sin(t*.17+p.y*3.+layer)*.022,cos(t*.12+p.x*4.-layer)*.025);
 }
 vec4 fluidSample152(sampler2D image,vec2 p){
  if(any(lessThan(p,vec2(0.)))||any(greaterThan(p,vec2(1.))))return vec4(0.);
  vec4 c=texture2D(image,p);vec2 edge=min(p,1.-p);c.a*=smoothstep(0.,.018,min(edge.x,edge.y));return c;
 }
`;
function returnDepthMaterial148(u){return new THREE.ShaderMaterial({uniforms:u,side:THREE.DoubleSide,transparent:false,depthWrite:true,toneMapped:false,vertexShader:'varying vec2 gatePoint148;void main(){gatePoint148=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec2 gatePoint148;uniform float time,energy,artReady148,smokeReady153,smokeAmount153;uniform sampler2D current148,depthSmoke153,smokeUpper154,smokeLower154;uniform vec3 eye148;${returnNoise148}
 vec3 backgroundWisp154(sampler2D image,vec2 uv,vec2 drift,float phase){float a=fract(phase),b=fract(phase+.5),blend=smoothstep(0.,1.,abs(a*2.-1.));vec4 first=fluidSample152(image,uv+drift*(a-.5)),second=fluidSample152(image,uv+drift*(b-.5));return mix(first.rgb*first.a,second.rgb*second.a,blend);}
 void main(){float face154=gl_FrontFacing?1.:-1.;vec2 p=vec2(gatePoint148.x*face154,gatePoint148.y),uv=vec2(p.x/2.13+.5,(p.y-.285)/3.90),view=clamp(vec2(eye148.x*face154,eye148.y)/max(2.,abs(eye148.z)),vec2(-1.),vec2(1.));
 vec2 depth=(uv-vec2(.55,.37))*vec2(1.,1.8);float r=length(depth);uv+=view*.018*(1.-smoothstep(.2,1.2,r));uv=fluidCurrent152(uv,time*.30,3.);
 float billow=cloud148(vec2(p.x*.86,(p.y-2.1)*.58)+vec2(sin(time*.12+p.y)*.14,-time*.035));
 vec3 blue=mix(vec3(.006,.038,.20),vec3(.018,.18,.50),smoothstep(.30,.76,billow));
 // Replace the old near-black negative space, preserving the existing bright
 // blue-white image detail. The opaque blue chamber still blocks the world.
 vec3 art=texture2D(current148,clamp(uv,vec2(.002),vec2(.998))).rgb;
 vec3 color=max(blue,art*artReady148);
 // These softer currents fill the picture background on BOTH faces. Their
 // independent flow leaves the approved bright foreground wisps readable.
 vec2 field154=vec2(p.x/2.13+.5,(p.y-.285)/3.90)+view*.035;
 vec2 rear=field154+vec2(.07,-.04);
 rear=fluidCurrent152(rear,time*.24+6.,4.6);
 vec2 drift=vec2(sin(rear.y*5.-time*.09)*.09,-.10+cos(rear.x*5.+time*.07)*.025);
 vec3 smoke=backgroundWisp154(depthSmoke153,rear,drift,time*.023+.27)*.72;
 smoke+=backgroundWisp154(smokeUpper154,fluidCurrent152(field154+vec2(.08,-.02),time*.19+14.,5.6),vec2(-.07,.08),time*.019+.61)*.55;
 smoke+=backgroundWisp154(smokeLower154,fluidCurrent152(field154+vec2(-.10,.045),time*.205+21.,6.7),vec2(.075,-.09),time*.021+.13)*.55;
 color+=smoke*vec3(.065,.20,.37)*smokeReady153*smokeAmount153;
 float edge=opening148(p),rim=exp(-max(0.,edge)*25.);color+=vec3(.025,.16,.40)*rim*.38;color*=1.+energy*.12;gl_FragColor=vec4(color,1.);
 }`});}
function makeReturnRibbons148(shared){
 const group=new THREE.Group();group.name='Fluid upper, middle and lower image currents';
 for(let i=0;i<3;i++){
  const u={time:shared.time,energy:shared.energy,eye148:shared.eye148,current148:{value:returnArt148.layers[i]??null},ready148:{value:returnArt148.layers[i]?1:0},layer148:{value:i},motion148:{value:clock*[.10,.082,.117][i]+i*.23}};
  const geo=new THREE.PlaneGeometry(2.13,3.90,14,24);geo.translate(0,2.235,0);
  const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,depthTest:true,side:THREE.FrontSide,blending:THREE.NormalBlending,toneMapped:false,vertexShader:`
   uniform float motion148,layer148;varying vec2 imageUv148,gate148;varying float currentFace154;
   void main(){vec3 p=position;imageUv148=uv;float wave=motion148*2.4;currentFace154=sign(normal.z);
    p.x+=sin(p.y*1.9+wave+layer148)*.018*currentFace154;p.z+=(sin(p.y*2.1-wave*.7+layer148)*.045+cos(p.x*currentFace154*4.+wave*.6)*.018)*currentFace154;
    gate148=p.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
   fragmentShader:`uniform sampler2D current148;uniform float energy,ready148,motion148,layer148;varying vec2 imageUv148,gate148;varying float currentFace154;${returnNoise148}
    void main(){if(ready148<.5)discard;float edge=opening148(gate148);if(edge<0.)discard;
     vec2 uv=imageUv148;
     uv=fluidCurrent152(uv,motion148*8.,layer148);
     vec2 velocity=vec2(sin(uv.y*5.2+motion148*.9+layer148)*.12,(layer148<1.5?1.:-1.)*.13+cos(uv.x*4.8-motion148*.7-layer148)*.06);
     float a=fract(motion148*.55),b=fract(motion148*.55+.5),blend=smoothstep(0.,1.,abs(a*2.-1.));
     vec4 first=fluidSample152(current148,uv+velocity*(a-.5)),second=fluidSample152(current148,uv+velocity*(b-.5));
     // Blend premultiplied samples so transparent edges never leave a dark
     // outline when independently moving sheets pass over one another.
     float alpha=mix(first.a,second.a,blend);vec3 rgb=mix(first.rgb*first.a,second.rgb*second.a,blend)/max(.001,alpha);
     alpha*=smoothstep(0.,.035,edge)*.82;if(alpha<.003)discard;
     gl_FragColor=vec4(rgb*(1.12+energy*.18),alpha);
    }`});
  const sheet=new THREE.Mesh(geo,m);sheet.position.z=.135+i*.065;sheet.renderOrder=40+i;sheet.userData.dynamicFX=true;sheet.userData.currentLayer148=RETURN_LAYERS148[i+1];sheet.frustumCulled=false;sheet.name=RETURN_LAYERS148[i+1]+' current';group.add(sheet);
 }
 return group;
}
function makeReturnMotes148(u){
 const count=mobileStartup116()?32:56,seeds=new Float32Array(count*3);for(let i=0;i<count;i++)seeds.set([i*.618033988%1,i*.41421356%1,i*.7320508%1],i*3);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(seeds,3));
 const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:`
 uniform float time,pixelHeight148;varying float mote148;varying vec2 gate148;void main(){float life=fract(position.x+time*(.035+position.y*.015)),a=position.y*6.283+life*4.7-time*.12,r=mix(1.02,.08,life);vec3 p=vec3(cos(a)*r,sin(a)*r*1.85+2.0,.18+position.z*.12);gate148=p.xy;mote148=sin(life*3.14159)*(.30+position.z*.35);vec4 eye=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*eye;gl_PointSize=clamp((.015+position.z*.009)*pixelHeight148*projectionMatrix[1][1]/max(1.,-eye.z),1.,4.);}`,fragmentShader:`
 varying float mote148;varying vec2 gate148;${returnNoise148}void main(){if(opening148(gate148)<.02)discard;vec2 p=(gl_PointCoord-.5)*2.;float core=exp(-dot(p,p)*12.),spark=exp(-abs(p.x)*16.)*exp(-abs(p.y)*3.)+exp(-abs(p.y)*16.)*exp(-abs(p.x)*3.);float a=(core+spark*.25)*mote148;if(a<.01)discard;gl_FragColor=vec4(.43,.80,1.15,a);}`});
 const points=new THREE.Points(g,m);points.frustumCulled=false;points.renderOrder=44;points.userData.dynamicFX=true;return points;
}
function makeReturnCaustics148(u){
 const geo=new THREE.CircleGeometry(1.69,64);geo.rotateX(-Math.PI/2);
 const m=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:'varying vec2 floor148;void main(){floor148=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 floor148;uniform float time,energy;${returnNoise148}
 void main(){vec2 p=floor148;float r=length(p),mask=1.-smoothstep(1.15,1.68,r);vec2 flow=vec2(cloud148(p*3.+time*.12),cloud148(p.yx*3.-time*.13));float line=pow(1.-abs(sin((p.x+flow.x*.24)*12.+time*.55)*sin((p.y+flow.y*.22)*10.-time*.38)),15.);float alpha=mask*(.018+line*.18)*(1.+energy*.3);if(alpha<.003)discard;gl_FragColor=vec4(.015,.28,.70,alpha);}`});
 const o=new THREE.Mesh(geo,m);o.position.y=.321;o.userData.dynamicFX=true;o.name='Portal light on threshold';return o;
}
function buildReturnReverse154(p){
 const fx=p.return148;if(fx.reverse154)return;const back=new THREE.Group();back.name='Matching reverse portal face';
 for(const front of fx.currents.children){const o=new THREE.Mesh(front.geometry.clone().scale(-1,1,-1),front.material);o.position.z=-front.position.z;o.renderOrder=front.renderOrder;o.frustumCulled=false;o.name=front.name+' reverse';back.add(o);}
 const motes=new THREE.Points(p.motes.geometry,p.motes.material);motes.rotation.y=Math.PI;motes.frustumCulled=false;back.add(motes);
 const rim=p.group.children.find(o=>o.name==='Luminous inner edge');if(rim){const o=new THREE.Mesh(rim.geometry,rim.material);o.rotation.y=Math.PI;back.add(o);}
 back.traverse(o=>o.userData.dynamicFX=true);p.group.add(back);fx.reverse154=back;
}
function finishReturnPortal148(p){
 // Keep the old resources in the scene's disposal tree, but never render or
 // animate their flattened constellation or external corona on this portal.
 const retired=new THREE.Group();retired.name='Retired return-portal layers';retired.visible=false;
 for(const child of [...p.group.children])retired.add(child);p.group.add(retired);p.group.add(p.light);
 if(p.spectacle147){p.spectacle147.group.visible=false;p.spectacle147=null;}
 buildReturnArch148(p);
 const u={time:p.material.uniforms.time,energy:p.material.uniforms.energy,open146:p.open146,eye148:{value:V3()},pixelHeight148:{value:renderer.domElement.height},current148:{value:returnArt148.texture},artReady148:{value:returnArt148.texture?1:0},depthSmoke153:{value:returnArt148.layers[1]??null},smokeUpper154:{value:returnArt148.layers[0]??null},smokeLower154:{value:returnArt148.layers[2]??null},smokeReady153:{value:returnArt148.layers[1]?1:0},smokeAmount153:{value:1}};
 const material=returnDepthMaterial148(u),gate=new THREE.Mesh(homeAperture144(),material);gate.userData.dynamicFX=true;gate.name='Opaque astral depth';p.group.add(gate);
 p.material=material;p.aperture=gate;p.motes=makeReturnMotes148(u);p.group.add(p.motes);
 const currents=makeReturnRibbons148(u);p.group.add(currents,makeReturnCaustics148(u));
 const pts=[V3(-1.065,.30,.27),V3(-1.065,3.12,.27)];for(let i=1;i<=48;i++){const a=Math.PI-i*Math.PI/48;pts.push(V3(Math.cos(a)*1.065,3.12+Math.sin(a)*1.065,.27));}pts.push(V3(1.065,.30,.27));
 const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal'),rim=new THREE.Mesh(new THREE.TubeGeometry(curve,112,.012,5,false),new THREE.MeshBasicMaterial({color:'#32c4ff',toneMapped:false}));rim.userData.dynamicFX=true;rim.name='Luminous inner edge';p.group.add(rim);
 p.group.traverse(o=>{if(o.isMesh||o.isPoints)o.userData.dynamicFX=true;});
 p.return148={uniforms:u,retired,currents,lightBase:7.0,frame:p.shell146};p.group.name='The Homeward return gate';
 if(state.scene==='homePlot139'||housing139().home)warmReturnArt148().then(()=>bindReturnLayers148(p)).catch(e=>console.error('The Homeward current could not load',e));
}
const homeReturnBuildBefore148=homePortal139;
homePortal139=function(...args){const g=homeReturnBuildBefore148(...args);if(state.scene==='homePlot139')finishReturnPortal148(g.userData.portal144);return g;};
const homeReturnTickBefore148=tick;
tick=function(dt){const r=homeReturnTickBefore148(dt);for(const p of world?.userData.homePortals139??[]){const fx=p.return148;if(!fx)continue;
 p.group.updateWorldMatrix(true,false);fx.uniforms.eye148.value.copy(camera.position);p.group.worldToLocal(fx.uniforms.eye148.value);fx.uniforms.eye148.value.y-=2.1;fx.uniforms.pixelHeight148.value=renderer.domElement.height;
 for(let i=0;i<fx.currents.children.length;i++){const layer=fx.currents.children[i];if(!layer.userData.frozen148)layer.material.uniforms.motion148.value=clock*[.10,.082,.117][i]+i*.23;}
 p.light.color.set('#38aaff');p.light.position.set(0,1.65,0);p.light.distance=7.2;p.light.intensity=(fx.lightBase+p.energy*2.2)*(1.+.045*Math.sin(clock*.67)+.025*Math.sin(clock*1.13));
 }return r;};
const homeReturnBootBefore148=boot;
boot=async function(...args){const r=await homeReturnBootBefore148(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const d=JSON.parse(before());d.homeReturn148={decorateKey:'B',portals:(world?.userData.homePortals139??[]).filter(p=>p.return148).map(p=>({hdReady:!!p.return148.uniforms.artReady148.value,layers:p.return148.currents.children.map(o=>({name:o.userData.currentLayer148,motion:+o.material.uniforms.motion148.value.toFixed(3)})),motes:p.motes.geometry.attributes.position.count,light:+p.light.intensity.toFixed(2)}))};return JSON.stringify(d);};return r;};
