// Enemy silhouettes set impact scale. The native hit/contact clock still owns
// damage; this layer only presents the contact with pooled analytic VFX.
function contactSize144(a){const b=silhouette87(a.visualId??a.id);return{height:clamp(b.height*a.size,1,9),width:clamp(b.width*a.size,.7,8)};}
function contactPalette144(id,heal=false){return heal?'#68e7ba':({bren:'#4baeff',soren:'#6fceff',mira:'#65e0b8',lysa:'#ff9850',tavin:'#e6c36d'}[id]??'#ffbb66');}
function contactPool144(){const q=chainEffects141();if(q.spectrum144)return q.spectrum144;
 const rows=Array.from({length:12},()=>{const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.NormalBlending,toneMapped:false,uniforms:{age:{value:1},kind:{value:0},tint:{value:new THREE.Color('#5dbbff')},seed:{value:0},power:{value:1}},vertexShader:'varying vec2 uv144;void main(){uv144=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec2 uv144;uniform float age,kind,seed,power;uniform vec3 tint;
 void main(){vec2 p=(uv144-.5)*2.;float r=length(p),angle=atan(p.y,p.x),aa=max(.002,fwidth(r)),alpha=0.,core=0.;
  if(kind<.5){float radius=mix(.12,.90,pow(age,.45)),ring=exp(-pow((r-radius)/(.008+aa),2.));float broken=.35+.65*pow(.5+.5*sin(angle*7.+seed+age*9.),2.);alpha=ring*broken*.6;
   vec2 v=mat2(cos(seed),-sin(seed),sin(seed),cos(seed))*p;float slash=exp(-pow(v.y/(.008+aa),2.))*(1.-smoothstep(.55,.95,abs(v.x)));core=exp(-r*55.)+slash*.65*(1.-age);alpha+=core;}
  else if(kind<1.5){float head=seed+age*2.6,behind=mod(head-angle+6.283185,6.283185),tail=(1.-smoothstep(.05,2.4,behind));float radius=.70+.10*sin(behind*.9),band=exp(-pow((r-radius)/(.035+aa),2.)),edge=exp(-pow((r-(radius+.025))/(.005+aa),2.));alpha=(band*.65+edge)*tail;core=edge*.65;}
  else{float radius=mix(.14,.95,pow(age,.6)),ring=exp(-pow((r-radius)/(.008+aa),2.));float wave=ring*(.3+.7*pow(.5+.5*sin(angle*11.+seed),2.));alpha=wave*.7;core=wave*.3;}
  alpha*=power*pow(max(0.,1.-age),1.3);if(alpha<.003)discard;gl_FragColor=vec4(mix(tint*1.2,vec3(1.8,1.9,2.),min(.9,core)),min(.94,alpha));
 }`});const mesh=new THREE.Mesh(q.geometry,m);mesh.visible=false;mesh.frustumCulled=false;q.group.add(mesh);return{mesh,age:10,duration:.5};});
 return q.spectrum144={rows,cursor:0};
}
function contactLayer144(at,size,color,kind,seed,strong){const pool=contactPool144(),r=pool.rows[pool.cursor++%pool.rows.length];r.age=0;r.duration=strong?.60:.43;r.mesh.position.copy(at);r.mesh.scale.setScalar(size);r.mesh.quaternion.copy(camera.quaternion);if(kind===2){r.mesh.rotation.set(-Math.PI/2,0,seed);r.mesh.position.y=heightAt(at.x,at.z)+.055;}
 const u=r.mesh.material.uniforms;u.kind.value=kind;u.seed.value=seed;u.tint.value.set(color);u.power.value=strong?1:.8;r.mesh.visible=true;return r;
}
function contactScatter144(at,count,color,scale=1,gold=false){const q=chainEffects141(),before=q.particles.length;chainParticles143(q,at,count,gold);for(let i=before;i<q.particles.length;i++){const p=q.particles[i];p.color.set(color);p.velocity.multiplyScalar(scale);p.size*=clamp(scale,.85,1.8);p.life*=gold?1.25:1.1;}}
function illuminateContact144(at,color,height,strong){const p=initBrenFX82(),l=p.lights[1];l.position.copy(at);l.position.y=Math.max(l.position.y,heightAt(at.x,at.z)+.7);l.color.set(color);l.intensity=clamp(22+height*5.0,28,62)*(strong?1.25:1);l.userData.life=strong?.46:.32;
 brenSurface82.positions.value[1].copy(l.position);brenSurface82.powers.value[1].set(l.color.r,l.color.g,l.color.b).multiplyScalar(l.intensity*.03);
}
const impactBefore144=chainImpact141;
chainImpact141=function(c,position,strong){const r=impactBefore144(c,position,strong),q=chainEffects141(),body=contactSize144(c.target.actor),scale=clamp(.95+body.height*.15,1.1,2.05),at=chainImpactPosition141(c,position),color=contactPalette144(c.id),gold=c.id==='bren'||c.id==='tavin';
 const b=q.bursts[(q.cursor-1)%q.bursts.length];b.mesh.scale.setScalar(clamp(1.65+body.height*.58,2.5,6.0)*(strong?1.2:1));b.duration=strong?.55:.40;
 contactLayer144(at,clamp(body.height*1.05,2.5,6.5),color,1,-.6+c.step*.9,strong);contactLayer144(at,clamp(body.width*1.45,2.4,5.8),gold?'#ffc978':color,0,.6+c.step*.8,strong);
 contactScatter144(at,strong?30:18,gold?'#ffcb73':color,scale,true);contactScatter144(at,strong?18:10,color,scale*.75,false);
 if(strong){contactLayer144(V3(c.target.actor.x,.05,c.target.actor.z),clamp(body.width*1.7+1,3.5,7),color,2,1.2,true);q.dustDirection.normalize();}
 illuminateContact144(at,gold?'#ffc16b':color,body.height,strong);return r;
};
const effectsBefore144=updateChainEffects141;
updateChainEffects141=function(dt){const r=effectsBefore144(dt),q=cinematic141.effects,pool=q?.spectrum144;if(!pool)return r;for(const p of pool.rows){p.age+=dt;p.mesh.visible=p.age<p.duration;if(!p.mesh.visible)continue;p.mesh.material.uniforms.age.value=p.age/p.duration;if(p.mesh.material.uniforms.kind.value!==2)p.mesh.quaternion.copy(camera.quaternion);}return r;};
const disposeContactsBefore144=disposeChainEffects141;
disposeChainEffects141=function(){const pool=cinematic141.effects?.spectrum144;if(pool)for(const p of pool.rows)p.mesh.material.dispose();return disposeContactsBefore144();};
// Skill heals and ordinary enemy blows receive the same silhouette-aware
// contact treatment. Combo targets are already handled on their hit frame.
const contactTextBefore144=floatText;
floatText=function(a,text,perfect=false,heal=false){const r=contactTextBefore144(a,text,perfect,heal);if(!battle||!a||a===battle.combo?.target.actor||!(typeof text==='number'||heal&&/^\+\d+/.test(text)))return r;
 const size=contactSize144(a),at=actorImpactPoint(a).addScaledVector(camera.position.clone().sub(actorImpactPoint(a)).normalize(),.30),color=heal?'#70e9b8':a.enemy?contactPalette144(currentFighter()):'#ffd08b';
 contactLayer144(at,clamp(size.height*.85,2.4,5.5),color,0,.7,perfect);contactScatter144(at,heal?18:26,color,clamp(size.height*.2,.8,1.7),!heal);illuminateContact144(at,color,size.height,perfect);return r;
};
