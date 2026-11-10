// A sluice release travels along the bed. Its leading bore, spilling sheets,
// impact foam and current share the same clock and the river's PBR material.
function damState108(){
 return world.userData.dam108??={phase:{value:0},age:{value:-1000},opening:{value:0},falls:{value:[new THREE.Vector4(70,.8,0,0),new THREE.Vector4(80,.8,0,0),new THREE.Vector4(98,.8,0,0)]},stats:{}};
}
function arrival108(z){
 return .22+clamp((z-69.2)/1.6,0,1)*.82+clamp(z-70.8,0,8.4)/4.4+clamp((z-79.2)/1.6,0,1)+clamp(z-80.8,0,16.4)/4.8+clamp((z-97.2)/1.6,0,1)+Math.max(0,z-98.8)/4.2;
}
function front108(age){
 let t=Math.max(0,age-.22);
 for(const [a,b,duration]of[[69.2,70.8,.82],[70.8,79.2,8.4/4.4],[79.2,80.8,1],[80.8,97.2,16.4/4.8],[97.2,98.8,1],[98.8,430,331.2/4.2]]){if(t<=duration)return Math.max(70,mix(a,b,t/duration));t-=duration;}
 return 430;
}
// The front rolls into each cross-section in about one second. Only a small
// damped wake follows it; the whole reach never rises in place on a long timer.
arrival32=arrival108;
sampleCurrent18=function(f,z,q){
 if(!q.released)return f.dry;
 const t=q.age-arrival108(z),wet=smooth(-.16,.95,t),wake=t>0?.095*Math.sin(t*2.7)*Math.exp(-t*.48)*smooth(0,.4,t):0;
 return mix(f.dry,f.natural,wet)+wake;
};
function fallingShape108(t){
 if(t<=.82)return t*t;
 const u=(t-.82)/.18,u2=u*u,u3=u2*u;
 return (2*u3-3*u2+1)*.6724+(u3-2*u2+u)*.18*1.64+(-2*u3+3*u2);
}
const damUpdateBefore108=updateRiver17;
updateRiver17=function(dt){
 damUpdateBefore108(dt);if(activeScene?.key!=='brookstead')return;
 const d=damState108(),q=riverState17();d.age.value=q.released?q.age:-1000;d.opening.value=sluice18.flow.value;
 // Integrating displacement avoids the texture jumping when the gate opens
 // or the pump changes the discharge; multiplying time by speed does not.
 if(dt&&state.mode!=='title'&&!menu&&!gameLoading)d.phase.value+=dt*(.18+2.35*sluice18.flow.value);
};
updateRiverCurrent19=function(){
 if(activeScene?.key!=='brookstead')return;
 const q=riverState17();world.userData.currentMotion19={active:0,speed:q.released?4.2:0,front:front108(q.age),direction:'downstream',gpu:true};
};
updateCascadeJoins18=function(q){
 const d=damState108();
 for(const [index,fall]of(world.userData.brookFallObjects??[]).entries()){
  const j=fall.userData.join,z0=j.z-j.halfSpan,z1=j.z+j.halfSpan;
  const upper=j.z===70?'reservoir':j.z===80?'headrace':'millrace',lower=j.z===70?'headrace':j.z===80?'millrace':'lowerBrook';
  const top=currentLevel18(upper,z0,q),bottom=currentLevel18(lower,z1,q),p=fall.geometry.attributes.position,n=fall.geometry.attributes.normal,depth=fall.geometry.attributes.waterDepth18;
  const arrival=arrival108(z0),flow=q.released?smooth(0,.65,q.age-arrival)*sluice18.flow.value:0;
  // No hanging water curtain before the released current reaches this lip.
  fall.visible=flow>.001;fall.userData.flowWidth17.value=mix(.12,1,flow);fall.position.y=top;j.top=top;j.bottom=bottom;
  const ys=j.rows108??=new Float64Array(33),drop=Math.max(0,top-bottom);
  for(let row=0;row<=32;row++){
   const t=row/32,z=mix(z0,z1,t);let y=top-drop*fallingShape108(t);
   if(index===0&&flow>.001){
    // Flow passes through the moving gate's actual opening and over the stone
    // sill. The upstream pool and downstream toe retain their exact joins.
    const gateBottom=world.userData.gate.position.y-2.15;
    const jet=Math.max(4.04,Math.min(top,gateBottom-.025));
    y=t<.52?mix(top,jet,smooth(0,.52,t)):mix(jet,bottom,fallingShape108((t-.52)/.48));
    if(z>=69.45&&z<=70.55)y=Math.max(y,4.04);
   }
   ys[row]=y;
  }
  for(let row=0;row<=32;row++){
   const t=row/32,z=mix(z0,z1,t),lo=Math.max(0,row-1),hi=Math.min(32,row+1),slope=(ys[hi]-ys[lo])/((hi-lo)*(z1-z0)/32),inv=1/Math.hypot(1,slope);
   const flight=Math.sqrt(2*Math.max(0,top-ys[row])/9.81),wet=q.released?smooth(0,.15,q.age-arrival-flight):0;
   for(let col=0;col<13;col++){const i=row*13+col;p.setY(i,ys[row]-top);n.setXYZ(i,0,inv,-slope*inv);if(depth)depth.setX(i,1.75*wet);}
  }
  p.needsUpdate=n.needsUpdate=true;if(depth)depth.needsUpdate=true;
  // Bounds are updated once from the 33 row heights, not by scanning vertices
  // and allocating normals/bounds on every simulation step.
  fall.geometry.boundingBox.min.y=bottom-top-.1;fall.geometry.boundingBox.max.y=.1;
  fall.geometry.boundingBox.getBoundingSphere(fall.geometry.boundingSphere);
  fall.userData.joinBounds.copy(fall.geometry.boundingBox).translate(fall.position);
  const impact=flow*smooth(0,.18,q.age-arrival-Math.sqrt(2*drop/9.81));
  d.falls.value[index].set(j.z,j.halfSpan,impact,drop);fall.userData.dam108={flow,impact,arrival,top,bottom};
 }
};
const damDrawBefore108=drawCanal41;
drawCanal41=function(){
 if(activeScene?.key!=='brookstead')return damDrawBefore108();
 const data=world?.userData.canal41;if(!data?.dirty)return;
 damDrawBefore108();const q=riverState17(),d=damState108();
 for(const {mesh,rows}of data.pools){
  const n=mesh.geometry.attributes.normal;
  for(let k=0;k<rows.length;k++){const lo=rows[Math.max(0,k-1)],hi=rows[Math.min(rows.length-1,k+1)],slope=(hi.level-lo.level)/(hi.z-lo.z),inv=1/Math.hypot(1,slope);for(const i of rows[k].indices)n.setXYZ(i,0,inv,-slope*inv);}
  n.needsUpdate=true;
 }
 d.age.value=q.released?q.age:-1000;d.opening.value=sluice18.flow.value;
 const progress=world.userData.riverProgress17;
 Object.assign(progress,{front:front108(q.age),settled:q.age>100,model:'bed-following release bore, gravity falls and advected current'});
 d.stats={front:progress.front,phase:d.phase.value,age:q.age,arrivals:[70.8,80.8,98.8,130,221].map(z=>({z,seconds:arrival108(z)})),gpuSpray:world.userData.damSpray108?.geometry.attributes.position.count??0};
};
// Wrap the final PBR shader, retaining its textures, lighting, depth clipping,
// reflection targets and the exact same material on the upstream continuation.
const damWaterBefore108=waterMaterial62;
waterMaterial62=function(o,...args){
 const m=damWaterBefore108(o,...args);if(activeScene?.key!=='brookstead')return m;
 const d=damState108(),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.userData.damWater108=true;
 m.onBeforeCompile=function(s,...a){
  before.call(this,s,...a);Object.assign(s.uniforms,{phase108:d.phase,releaseAge108:d.age,opening108:d.opening,falls108:d.falls});
  s.fragmentShader='uniform float phase108,releaseAge108,opening108;uniform vec4 falls108[3];float travel108(float z){return .22+clamp((z-69.2)/1.6,0.,1.)*.82+clamp(z-70.8,0.,8.4)/4.4+clamp((z-79.2)/1.6,0.,1.)+clamp(z-80.8,0.,16.4)/4.8+clamp((z-97.2)/1.6,0.,1.)+max(0.,z-98.8)/4.2;}\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('vec2 current62=normalize(flow62+vec2(.0001))*(.16+hydraulic62*.28);vec2 stream62=worldWater62.xz-current62*time62;',`float localAge108=releaseAge108-travel108(worldWater62.z);float advection108=mix(phase108,.16*time62+max(0.,localAge108)*2.35,smoothstep(65.,69.2,worldWater62.z));vec2 current62=normalize(flow62+vec2(.0001));vec2 stream62=worldWater62.xz-current62*advection108;stream62.y-=worldWater62.y*.78;`);
  const oldFall='if(cascade62>.5){float face62=1.-abs(normalize(cross(dFdx(worldWater62),dFdy(worldWater62))).y);vec2 fallUV62=vec2(worldWater62.x*.65,worldWater62.y*.8+time62*.42);float streak62=pow(texture2D(waterArt62,fallUV62).g,1.3);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.26,.47,.44)*(.65+streak62),face62*.8);foam62+=face62*streak62*.18*hydraulic62;}';
  s.fragmentShader=s.fragmentShader.replace(oldFall,`
   // One body colour and wave scale across lip, sheet and river. Aeration is
   // broken up by the same foam art instead of painting a mint-coloured wall.
   float bore108=exp(-localAge108*localAge108*1.8)*opening108;
   foam62+=bore108*smoothstep(.27,.8,foamGrain62)*.38;
   for(int i108=0;i108<3;i108++){
    vec4 f108=falls108[i108];float toe108=f108.x+f108.y;
    float impact108=exp(-abs(worldWater62.z-toe108)*2.1)*f108.z*smoothstep(.15,1.2,f108.w);
    foam62+=impact108*smoothstep(.18,.77,foamGrain62)*.55;
   }
   if(cascade62>.5){float face108=1.-abs(normalize(cross(dFdx(worldWater62),dFdy(worldWater62))).y);float ribbons108=noise62(stream62*vec2(22.,2.7))*.65+texture2D(foamArt103,stream62*vec2(.65,.9)).r*.35;float parcels108=noise62(stream62*vec2(8.,11.));foam62+=face108*smoothstep(.59,.82,ribbons108)*parcels108*.22*opening108;}
   foam62=clamp(foam62,0.,.7);
  `);
  // Flowing normals lie in the water's actual tangent plane, including the
  // vertical sheet. The former horizontal-only bump flattened the cascades.
  s.fragmentShader=s.fragmentShader.replace('normal=normalize(normal+mat3(viewMatrix)*fineN62*(cascade62>.5?.22:1.));',`vec3 surfaceN108=normalize(cross(dFdx(worldWater62),dFdy(worldWater62)));if(surfaceN108.y<0.)surfaceN108=-surfaceN108;vec3 down108=normalize(cross(surfaceN108,vec3(1.,0.,0.)));float vertical108=cascade62*(1.-abs(surfaceN108.y));vec2 ribs108=texture2D(waveNR103,vec2(stream62.x*1.2,stream62.y*.06)).rg*2.-1.;waveX62=mix(waveX62,ribs108.x*.16,vertical108);waveZ62=mix(waveZ62,ribs108.y*.035,vertical108);fineN62=vec3(waveX62,0.,0.)+down108*waveZ62;normal=normalize(normal+mat3(viewMatrix)*fineN62*.65);`);
  // The second normal layer must advect with the first, without a speed jump.
  s.fragmentShader=s.fragmentShader.replace('mat2(.8,-.6,.6,.8)*worldWater62.xz*.11+current62*time62*.04','mat2(.8,-.6,.6,.8)*stream62*.11+vec2(3.1,7.3)');
  m.userData.damShader108={sharedPalette:!s.fragmentShader.includes('vec3(.26,.47,.44)'),advected:s.fragmentShader.includes('float advection108='),tangentNormals:s.fragmentShader.includes('vec2 ribs108=')};
 };m.customProgramCacheKey=()=>key+'-coherent-dam108';return m;
};
function makeDamSpray108(){
 const d=damState108(),count=profile33()>1?288:144,p=new Float32Array(count*3),seeds=new Float32Array(count*4),r=seeded(108);
 for(let i=0;i<count;i++){const j=i%3;p.set([brookChannel([70,80,98][j]),0,[70,80,98][j]+.8],i*3);seeds.set([r(),r(),r(),j],i*4);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('spray108',new THREE.BufferAttribute(seeds,4));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,uniforms:{phase108:d.phase,falls108:d.falls,day108:waterLight62.day,levels108:{value:new THREE.Vector3(4.55,1.55,-1.4)}},vertexShader:`
 attribute vec4 spray108;uniform float phase108;uniform vec4 falls108[3];uniform vec3 levels108;varying float alpha108;
 void main(){int k=int(spray108.w);vec4 f=falls108[k];float life=fract(phase108*(.47+spray108.y*.27)+spray108.x);float power=f.z*smoothstep(.2,1.3,f.w);vec3 p=position;
 p.x+=(spray108.x-.5)*7.3*mix(.2,1.,f.z);p.y=levels108[k]+.045+sin(life*3.14159265)*(.12+spray108.y*.42)*power;p.z+=life*(.5+spray108.z*.9);
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.2+spray108.z*1.5)*70./max(4.,-mv.z),1.,6.);alpha108=sin(life*3.14159265)*power*.44;
 }`,fragmentShader:`uniform float day108;varying float alpha108;void main(){vec2 q=gl_PointCoord-.5;float a=(1.-smoothstep(.12,.5,length(q)))*alpha108;if(a<.025)discard;gl_FragColor=vec4(mix(vec3(.16,.23,.28),vec3(.67,.79,.8),day108),a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`});
 const o=new THREE.Points(g,m);o.userData.dynamicFX=true;o.userData.waterMist28=true;o.frustumCulled=false;world.add(o);world.userData.damSpray108=o;
 const before=o.onBeforeRender;o.onBeforeRender=function(...args){before?.apply(this,args);const q=riverState17(),v=m.uniforms.levels108.value;v.set(currentLevel18('headrace',70.8,q),currentLevel18('millrace',80.8,q),currentLevel18('lowerBrook',98.8,q));};
}
const damBuildBefore108=buildWorld;
buildWorld=function(...args){
 const result=damBuildBefore108(...args);if(activeScene?.key!=='brookstead')return result;
 // Retire the old fixed-height additive mist and point foam, which floated
 // above the still-empty reach. The replacement follows each receiving pool.
 if(world.userData.mist28)world.userData.mist28.visible=false;
 for(const o of [...world.children])if(o.isPoints&&o.userData.dynamicWater&&o.material?.fragmentShader?.includes('foamVisible')){o.removeFromParent();o.geometry.dispose();o.material.dispose();}
 makeDamSpray108();if(world.userData.canal41)world.userData.canal41.dirty=true;return result;
};
