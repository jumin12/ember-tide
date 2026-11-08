// Native PixelLab Pro art is composited as animated, depth-tested world
// geometry. Small fixed pools provide detail without one mesh per spark.
const spellArt35={bursts:0,charges:0,keys:{slash35:'fx35FlameSlash',impact35:'fx35Impact',arcane35:'fx35Arcane',frost35:'fx35Frost',heal35:'fx35Healing',smoke35:'fx35Smoke'}};
const artInitBefore35=initCombatVfx;
initCombatVfx=function(...args){const r=artInitBefore35(...args);for(const [key,texture] of Object.entries(spellArt35.keys)){if(combatVfx.banks[key]||!textures[texture])continue;const b=makeParticleBank(textures[texture],key!=='smoke35',key==='smoke35'?48:24);b.dirty35=true;
  const grid=new THREE.PlaneGeometry(1,1,10,10),g=b.mesh.geometry;g.setIndex(grid.index);g.setAttribute('position',grid.attributes.position);g.setAttribute('uv',grid.attributes.uv);b.mesh.renderOrder=key==='smoke35'?5:6;
  b.mesh.material.vertexShader='varying float ageArt35;\n'+b.mesh.material.vertexShader.replace('vec4 eye=modelViewMatrix','ageArt35=t;q.x+=sin(age*7.+uv.y*8.)*sin(uv.y*3.14159265)*.045;vec4 eye=modelViewMatrix');
  b.mesh.material.fragmentShader='varying float ageArt35;\n'+b.mesh.material.fragmentShader.replace('float a=sampleColor.a*alpha;','float a=sampleColor.a*alpha;float breakup35=fract(sin(dot(floor(tex*128.),vec2(12.9898,78.233)))*43758.5453);a*=1.-smoothstep(.68,1.,ageArt35+breakup35*.16);').replace('sampleColor.rgb*tint*glow*light','sampleColor.rgb*tint*glow*light*(1.25-ageArt35*.3)');
  b.mesh.material.uniforms.glow.value=key==='smoke35'?1:2.2;b.mesh.material.needsUpdate=true;combatVfx.banks[key]=b;
 }return r;};
function artBurst35(kind,pos,size,duration,angle=0,delay=0,spin=0,rise=0){const b=combatVfx.banks[kind];if(!b)return;emitParticles(kind,pos,'#ffffff',1,1,{size,endSize:size*1.35,duration,delay,spread:0,speed:0,gravity:0});const e=b.entries[(b.cursor+b.capacity-1)%b.capacity];e.pos=[pos.x,pos.y,pos.z];e.vel=[0,rise,0];e.duration=duration;e.gravity=0;e.size=[size,size*1.35,angle,spin];e.fade=kind==='smoke35'?1.5:.85;b.dirty35=true;spellArt35.bursts++;}
const artCastBefore35=castFX;
castFX=function(kind,from,to,strong=false,impactOnly=false){const r=artCastBefore35(kind,from,to,strong,impactOnly);if(!battle)return r;const p=to.clone(),scale=strong?1.2:1;p.y=Math.max(p.y,heightAt(p.x,p.z)+1.5);
 if(kind==='fire'){
  artBurst35('slash35',p,7.5*scale,.9,-.25,0,.5);artBurst35('slash35',p.clone().add(V3(.3,.5,.15)),6.8*scale,1.15,1.1,.10,-.4);artBurst35('impact35',p.clone().add(V3(0,.4,.2)),6.5*scale,.9,0,.035,.12);artBurst35('smoke35',p.clone().add(V3(0,1,0)),3.5,2.8,0,.2,.13,.8);
 }else if(['arcane','ascend'].includes(kind)){
  artBurst35('arcane35',p,7*scale,1.1,.1,0,1.4);artBurst35('arcane35',p.clone().add(V3(.25,.5,.2)),5.5*scale,1.35,-.6,.1,-1.1);
 }else if(kind==='ice'){
  artBurst35('frost35',p.clone().add(V3(0,1,0)),7*scale,1.3,0);artBurst35('arcane35',p,5,.85,.5,.15,-.5);artBurst35('smoke35',p,2,1.8,0,.3,.1,.4);
 }else if(['heal','wardheal','ward'].includes(kind)){
  artBurst35('heal35',p.clone().add(V3(0,.7,0)),5.8*scale,1.7,0,0,.2,.25);if(strong)artBurst35('heal35',p,4.5,1.9,Math.PI,.1,-.2,.2);
 }else if(kind==='blade'){
  artBurst35('slash35',p,strong?6.8:4.8,strong?.6:.4,strong?-.5:.3,0,strong?1.2:-.6);if(strong)artBurst35('impact35',p,4.2,.5,0,.04);
 }else if(kind==='arrow'||kind==='impact')artBurst35('impact35',p,strong?4:2.4,.4,0,0,.1);
 return r;
};
const chargeArtBefore35=startActionAnimation;
startActionAnimation=function(opts){const r=chargeArtBefore35(opts),a=opts.actor;if(!a||!battle||a.action!=='cast'||opts.authoredMagic84)return r;const id=a.characterId??a.id;if(id==='bren'&&assets.sprites[a.visualId??a.id]?.frames.drivingSlash)return r;const p=V3(a.x,heightAt(a.x,a.z)+1.2,a.z),key=id==='lysa'?'slash35':id==='mira'?'heal35':'arcane35';artBurst35(key,p,3.7,Math.max(.55,opts.duration*.65),id==='lysa'?-.4:0,0,.6,.3);spellArt35.charges++;return r;};
