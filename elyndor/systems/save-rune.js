// World-space seal, fine orbiting motes and two flowing energy paths. Gameplay
// still uses the original interaction, safe placement and recording rules.
const saveRune66={time:{value:0},day:{value:1},built:0};
function saveEffectMaterial66(fragment){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:saveRune66.time,day:saveRune66.day},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time,day;\n'+fragment});}
function buildSaveRune66(o){
 const root=new THREE.Group();root.name='Living wayfarer seal';root.position.set(o.x,heightAt(o.x,o.z)+.07,o.z);root.userData.saveRune66=true;world.add(root);
 const ringMat=saveEffectMaterial66('void main(){float pulse=.86+.14*sin(time*1.25);gl_FragColor=vec4(vec3(.15,.83,1.12)*pulse,.88);}');
 for(const [r,w]of[[1.88,.024],[1.72,.016],[1.47,.018]]){const m=new THREE.Mesh(new THREE.RingGeometry(r-w,r+w,96),ringMat);m.rotation.x=-Math.PI/2;root.add(m);}
 const gold=new THREE.MeshBasicMaterial({color:'#fff0a2',transparent:true,opacity:.95,depthWrite:false,side:THREE.DoubleSide});
 const star=new THREE.Shape();for(let i=0;i<32;i++){const a=i*Math.PI/16,r=i%4===0?1.22:i%2===0?.70:.24,x=Math.sin(a)*r,y=Math.cos(a)*r;if(i)star.lineTo(x,y);else star.moveTo(x,y);}star.closePath();const centre=new THREE.Mesh(new THREE.ShapeGeometry(star),gold);centre.rotation.x=-Math.PI/2;centre.position.y=.012;root.add(centre);
 const core=new THREE.Mesh(new THREE.RingGeometry(.18,.23,32),ringMat);core.rotation.x=-Math.PI/2;core.position.y=.016;root.add(core);
 for(let i=0;i<48;i++){const a=i*TAU/48,m=new THREE.Mesh(new THREE.PlaneGeometry(i%4===0?.035:.021,i%4===0?.15:.07),ringMat);m.rotation.set(-Math.PI/2,0,-a);m.position.set(Math.sin(a)*1.60,.007,Math.cos(a)*1.60);root.add(m);}
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(5.2,5.2),saveEffectMaterial66('void main(){float d=length(vUv-.5)*2.;float a=pow(max(0.,1.-d),3.)*(.12+.025*sin(time*.91));gl_FragColor=vec4(.08,.65,.94,a);}'));glow.rotation.x=-Math.PI/2;glow.position.y=-.01;root.add(glow);
 const ground=new THREE.Group();ground.name='Terrain-conforming rune';for(const m of[...root.children])ground.add(m);root.add(ground);mergeGroup(ground);
 const curve=new THREE.CubicBezierCurve3(V3(-.35,.09,.3),V3(3,1.8,-.7),V3(-2.8,3.5,-.5),V3(.75,6.4,-.4));
 const trail=new THREE.Mesh(new THREE.TubeGeometry(curve,80,.016,5,false),saveEffectMaterial66('void main(){float head=fract(time*.105);float flow=pow(max(0.,1.-abs(vUv.x-head)*2.),3.);float a=sin(vUv.x*3.14159)*(.28+flow*.65);gl_FragColor=vec4(.09,.77,1.05,a);}'));trail.name='Flowing magical energy arc';root.add(trail);
 const helix=new THREE.CatmullRomCurve3(Array.from({length:44},(_,i)=>{const t=i/43,a=t*TAU*1.1;return V3(Math.cos(a)*(1.1-t*.45),.16+t*3.7,Math.sin(a)*.7);}));
 const arc=new THREE.Mesh(new THREE.TubeGeometry(helix,70,.009,4,false),saveEffectMaterial66('void main(){float a=sin(vUv.x*3.14159)*(.10+.12*sin(time*.8-vUv.x*12.));gl_FragColor=vec4(.12,.73,1.,a);}'));root.add(arc);
 const n=64,seeds=new Float32Array(n*4),positions=new Float32Array(n*3),rng=seeded(Math.round(o.x*721+o.z*117));for(let i=0;i<n;i++){seeds.set([rng(),rng(),rng(),rng()],i*4);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('seed66',new THREE.BufferAttribute(seeds,4));
 const particles=new THREE.Points(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,uniforms:{time:saveRune66.time},vertexShader:`attribute vec4 seed66;uniform float time;varying float alpha66;void main(){float t=fract(time*(.045+seed66.w*.035)+seed66.z),a=seed66.x*6.28318+time*(.13+seed66.y*.11);vec3 p=vec3(cos(a)*(1.1+seed66.y*.9),t*(2.6+seed66.w*3.),sin(a)*(.75+seed66.y*.7));alpha66=smoothstep(0.,.12,t)*(1.-smoothstep(.7,1.,t))*(.5+.5*pow(sin(time*(1.1+seed66.x)+seed66.y*9.)*.5+.5,3.));vec4 v=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp((1.2+seed66.w*1.5)*70./max(15.,-v.z),1.2,3.8);gl_Position=projectionMatrix*v;}`,fragmentShader:'varying float alpha66;void main(){vec2 d=abs(gl_PointCoord-.5);float star=1.-smoothstep(.1,.5,min(d.x,d.y)+max(d.x,d.y)*.55);gl_FragColor=vec4(.22,.85,1.,star*alpha66*.85);}'}));particles.frustumCulled=false;particles.name='Independent drifting save motes';root.add(particles);
 world.userData.saveRune66??=[];world.userData.saveRune66.push({x:o.x,z:o.z,root,ground,motes:n,arcs:2});saveRune66.built++;return root;
}
function seatSaveRunes66(){for(const s of world.userData.saveRune66??[]){const base=heightAt(s.x,s.z);s.root.position.y=base+.07;for(const m of s.ground.children){const p=m.geometry.attributes.position;const offsets=m.geometry.userData.runeOffsets66??=Array.from(p.array).filter((_,i)=>i%3===1);for(let i=0;i<p.count;i++)p.setY(i,heightAt(s.x+p.getX(i),s.z+p.getZ(i))-base+offsets[i]);p.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();}s.root.updateMatrixWorld(true);}}
const saveCircleBefore66=createSaveCircle;
createSaveCircle=function(...args){let decal;const before=groundDecal;groundDecal=function(...a){decal=before(...a);return decal;};let result;try{result=saveCircleBefore66(...args);}finally{groundDecal=before;}if(decal)decal.visible=false;const o=world.userData.saveCircles.at(-1);buildSaveRune66(o);return result;};
const saveBuildBefore66=buildWorld;
buildWorld=function(...args){const r=saveBuildBefore66(...args);seatSaveRunes66();return r;};
const runeFxBefore66=updateWorldFX;
updateWorldFX=function(...args){const r=runeFxBefore66(...args);saveRune66.time.value=clock;saveRune66.day.value=poiLight54.day.value;return r;};
// Nearby save landmarks keep their placement and light without hiding trees.
// Exploration visibility is handled by the controlled player's silhouette.
