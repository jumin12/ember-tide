// A continuous astral opening, anchored to the threshold's actual transform.
function makeHomeCorona147(p){
 const g=new THREE.Group();g.name='Homeward astral corona';world.add(g);g.userData.dynamicFX=true;
 const u={time:{value:0},charge:{value:0},flash:{value:0},fade:{value:0}},geo=new THREE.PlaneGeometry(5.4,6.5),m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:u,vertexShader:'varying vec2 uv147;void main(){uv147=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 uv147;uniform float time,charge,flash,fade;
 void main(){vec2 p=(uv147-.5)*vec2(4.2,3.0);float r=length(p),a=atan(p.y,p.x),t=time;
 float corona=0.;for(int i=0;i<3;i++){float k=float(i),rr=.88+k*.13+.016*sin(a*5.+t*2.+k);float line=exp(-pow((r-rr)/(.008+k*.003),2.));float arc=pow(.5+.5*sin(a*(2.+k)-t*(1.2+k*.3)+k*2.),2.);corona+=line*(.18+.82*arc);}
 float runes=pow(max(0.,cos((a-t*.07)*12.)),30.)*exp(-pow((r-1.08)/.036,2.));float spokes=pow(max(0.,sin(a*21.+t*.2)),60.)*exp(-pow((r-1.15)/.12,2.))*flash;
 float wave=exp(-pow((r-(.3+flash*1.25))/.026,2.))*flash;
 float alpha=(corona*charge+runes*charge*.6+spokes*.7+wave*.6)*fade;
 if(alpha<.003)discard;vec3 c=mix(vec3(.12,.40,1.1),vec3(.38,1.,1.5),clamp(corona,0.,1.));c+=vec3(1.1,.72,.20)*runes*.65;gl_FragColor=vec4(c,clamp(alpha,0.,.85));}`});
 const corona=new THREE.Mesh(geo,m);corona.position.set(0,2.23,.41);corona.userData.dynamicFX=true;g.add(corona);
 const shardGeo=new THREE.OctahedronGeometry(.075,0),shards=new THREE.InstancedMesh(shardGeo,new THREE.MeshStandardMaterial({color:'#a7e9e8',emissive:'#239dcb',emissiveIntensity:1.2,metalness:.5,roughness:.24}),18);shards.userData.dynamicFX=true;shards.frustumCulled=false;g.add(shards);
 return{group:g,uniforms:u,shards,matrix:new THREE.Matrix4(),rotation:new THREE.Quaternion(),scale:V3(),position:V3()};
}
const homePortalSpectacleBefore147=homePortal139;
homePortal139=function(...args){const g=homePortalSpectacleBefore147(...args),p=g.userData.portal144;p.spectacle147=makeHomeCorona147(p);
 for(const o of p.shell146.children)o.material.color.multiply(new THREE.Color('#a1bcc4'));
 // Keep a deep, opaque destination behind the luminous filaments. A portal
 // is an opening with depth, rather than a translucent sheet over the town.
 const m=p.material;m.fragmentShader=m.fragmentShader.replace('float rr146=length',`vec2 vp147=(p-vec2(0.,2.16))*vec2(.90,.48);float vr147=length(vp147),va147=atan(vp147.y,vp147.x);float vt147=time*.40;
 vec3 deep147=mix(vec3(.006,.012,.046),vec3(.018,.12,.29),smoothstep(.05,.95,vr147));
 float arms147=0.;for(int k147=0;k147<3;k147++){float branch147=float(k147)*2.0944;float sw147=sin(va147+vr147*8.-vt147+branch147);arms147+=pow(max(0.,sw147),26.)*(.18+.82*smoothstep(.10,.85,vr147));}
 float dust147=pow(noise144(vp147*24.+vec2(vt147*.4,-vt147*.2)),23.)*15.;float aurora147=pow(.5+.5*sin(va147*3.-vr147*10.+vt147),8.);
 col=mix(col,deep147,.72)+vec3(.025,.22,.66)*arms147*(.8+energy*.6)+vec3(.12,.5,.7)*aurora147*.2+vec3(.68,.88,1.)*dust147;
 float rr146=length`);m.needsUpdate=true;return g;};
const homeSpectacleTickBefore147=tick;
tick=function(dt){const r=homeSpectacleTickBefore147(dt);for(const p of world?.userData.homePortals139??[]){const fx=p.spectacle147;if(!fx)continue;const reveal=homeReveal146?.portal===p,age=reveal?homeReveal146.age:0,owned=p.group.visible,entry=homeTransit144?.portal===p;
 fx.group.visible=owned||reveal&&age>.5;if(!fx.group.visible)continue;p.group.updateWorldMatrix(true,false);fx.group.matrix.copy(p.group.matrixWorld);fx.group.matrixAutoUpdate=false;fx.group.matrixWorldNeedsUpdate=true;
 const swell=smooth(1.4,3.3,age)*(1-smooth(4.5,5.4,age)),burst=smooth(2.65,3.12,age)*(1-smooth(3.12,4.1,age));
 fx.uniforms.time.value=clock;fx.uniforms.charge.value=reveal?mix(swell,.10,smooth(4.3,5.4,age)):entry?.10+.35*p.energy:.10;fx.uniforms.flash.value=burst;fx.uniforms.fade.value=reveal?smooth(1.0,1.6,age):1;fx.shards.visible=reveal&&swell>.001;
 for(let i=0;i<18;i++){const a=i/18*TAU+clock*.14,spiral=reveal?swell:0,rad=1.45+.16*Math.sin(clock*1.3+i);fx.position.set(Math.cos(a)*rad,2.2+Math.sin(a)*2.45,.18+.16*Math.sin(a*2.+clock));fx.rotation.setFromEuler(new THREE.Euler(clock*.55+i,clock*.4+i*.7,a));fx.scale.setScalar(spiral*(.60+i%3*.16));fx.matrix.compose(fx.position,fx.rotation,fx.scale);fx.shards.setMatrixAt(i,fx.matrix);}fx.shards.instanceMatrix.needsUpdate=true;
 if(reveal){p.light.color.copy(new THREE.Color('#efbf67')).lerp(new THREE.Color('#4bafff'),smooth(2.25,3.55,age)).lerp(new THREE.Color('#68ced9'),smooth(4.3,5.4,age));p.light.intensity+=burst*5.5;p.fx146.light.intensity*=1.15;}
 }return r;};
