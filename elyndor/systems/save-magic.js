// A continuously orbiting volume of light, rather than a fixed illuminated
// wire. Geometry is uploaded once; flow, orbit, glow and motes run on the GPU.
function runeMaterial67(fragment,orbit=false){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:saveRune66.time},vertexShader:`uniform float time;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;${orbit?'float a=time*.44+p.y*.16;mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a));p.xz=r*p.xz;p.x+=sin(time*.7+p.y*1.3)*.09;':''}gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:'varying vec2 vUv;uniform float time;\n'+fragment});}
buildSaveRune66=function(o){
 const root=new THREE.Group();root.name='Swirling wayfarer light';root.userData.saveRune66=true;root.position.set(o.x,heightAt(o.x,o.z)+.07,o.z);world.add(root);
 const ground=new THREE.Group();root.add(ground);
 const seal=new THREE.Mesh(new THREE.PlaneGeometry(5.4,5.4,16,16),runeMaterial67(`
 float band(float d,float r,float w){return 1.-smoothstep(w,w+fwidth(d)*1.1,abs(d-r));}
 void main(){vec2 p=(vUv-.5)*2.;float d=length(p),a=atan(p.y,p.x);float pulse=.88+.12*sin(time*1.7);
 float rings=band(d,.69,.007)+band(d,.64,.004)+band(d,.53,.005);
 float angle=a+time*.115,sector=fract(angle/6.2831853*32.),glyph=step(.12,sector)*step(sector,.70);
 float rune=band(d,.59,.024)*glyph*(.5+.5*step(.45,fract(sector*3.+floor(angle/6.2831853*32.)*.37)));
 float inner=band(d,.47,.005)*(0.5+.5*sin(a*12.-time*.32));float halo=exp(-pow(d/.66,4.))*.07+exp(-abs(d-.65)*45.)*.08;
 gl_FragColor=vec4(vec3(.13,.79,1.18)*pulse,clamp(rings*.72+rune*.75+inner*.34+halo,0.,.92));}`));seal.rotation.x=-Math.PI/2;seal.position.y=.01;ground.add(seal);
 const star=new THREE.Shape();for(let i=0;i<32;i++){const a=i*Math.PI/16,r=i%4===0?1.12:i%2===0?.56:.19;if(i)star.lineTo(Math.sin(a)*r,Math.cos(a)*r);else star.moveTo(Math.sin(a)*r,Math.cos(a)*r);}star.closePath();const centre=new THREE.Mesh(new THREE.ShapeGeometry(star),new THREE.MeshBasicMaterial({color:'#ffe5a0',side:THREE.DoubleSide,transparent:true,opacity:.93,depthWrite:false}));centre.rotation.x=-Math.PI/2;centre.position.y=.025;ground.add(centre);mergeGroup(ground);
 const paths=[];for(let k=0;k<2;k++)paths.push(new THREE.CatmullRomCurve3(Array.from({length:65},(_,i)=>{const t=i/64,a=t*TAU*(k?1.15:1.55)+k*Math.PI,r=(1.25-k*.15)*(1-t*.55);return V3(Math.cos(a)*r,.12+t*(k?3.25:4.7),Math.sin(a)*r);})));
 for(const[k,path]of paths.entries()){
  const geo=new THREE.TubeGeometry(path,112,k?.025:.032,5,false),core=new THREE.Mesh(geo,runeMaterial67(`void main(){float head=fract(vUv.x-time*.13),flow=.20+.8*pow(.5+.5*cos(head*6.2831853),6.);float ends=sin(vUv.x*3.14159265);gl_FragColor=vec4(.17,.84,1.28,ends*flow*.86);}`,true));core.name='Orbiting energy ribbon';root.add(core);
  const halo=new THREE.Mesh(new THREE.TubeGeometry(path,80,.10,5,false),runeMaterial67(`void main(){float flow=.35+.65*pow(.5+.5*cos((vUv.x-time*.13)*6.2831853),5.);gl_FragColor=vec4(.05,.56,1.,sin(vUv.x*3.14159265)*flow*.10);}`,true));halo.name='Soft ribbon light';root.add(halo);
 }
 const n=96,rng=seeded(Math.round(o.x*721+o.z*117)),seed=new Float32Array(n*4);for(let i=0;i<seed.length;i++)seed[i]=rng();const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(n*3),3));geo.setAttribute('seed67',new THREE.BufferAttribute(seed,4));
 const motes=new THREE.Points(geo,new THREE.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:saveRune66.time},vertexShader:`attribute vec4 seed67;uniform float time;varying float alpha;void main(){float t=fract(seed67.y+time*(.08+seed67.w*.035)),a=seed67.x*6.28318+time*(.35+seed67.z*.32),r=(.45+seed67.z*1.25)*(1.-t*.45);vec3 p=vec3(cos(a)*r,.10+t*4.5,sin(a)*r);alpha=smoothstep(0.,.15,t)*(1.-smoothstep(.7,1.,t))*(.65+.35*sin(time*1.8+seed67.x*12.));vec4 v=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp((2.+seed67.w*2.5)*55./max(12.,-v.z),1.4,5.);gl_Position=projectionMatrix*v;}`,fragmentShader:'varying float alpha;void main(){vec2 p=abs(gl_PointCoord-.5);float a=1.-smoothstep(.02,.50,min(p.x,p.y)+max(p.x,p.y)*.6);gl_FragColor=vec4(.28,.85,1.,a*alpha);}'}));motes.frustumCulled=false;root.add(motes);
 const light=new THREE.PointLight('#8be6ff',3.2,6,2);light.position.y=.8;light.userData.dynamicFX=true;root.add(light);
 world.userData.saveRune66??=[];world.userData.saveRune66.push({x:o.x,z:o.z,root,ground,motes:n,arcs:2,orbiting:true,light});return root;
};
const runeRenderBefore67=render;
render=function(...args){const t=saveRune66.time.value=performance.now()*.001;for(const q of world?.userData.saveRune66??[])if(q.light){q.light.position.set(Math.cos(t*.44)*.55,1.0+Math.sin(t*.8)*.15,Math.sin(t*.44)*.55);q.light.intensity=3.2+Math.sin(t*1.3)*.35;}return runeRenderBefore67(...args);};
const roomSealBefore67=createSaveCircle;
createSaveCircle=function(x,z,...args){const inn=activeScene?.kind==='interior'&&INTERIORS[activeScene.key]?.type==='inn',result=roomSealBefore67(inn?-6:x,inn?5.55:z,...args);if(inn){const rune=world.userData.saveRune66.at(-1);rune.root.scale.setScalar(.62);rune.root.userData.reservedFloorBay67=true;}return result;};
