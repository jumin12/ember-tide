// Elemental effects use bounded, prewarmed 3D geometry and textured particles.
const battleArt={bursts:0,charges:0,contactFrames:[],scheduled:[],lastCue:null};
// Side-on ranks leave every silhouette readable, including a four-person party.
battleFormation=function(center,i,enemy=false,count=state.members.length){const n=count;return enemy?{x:center.x-4.8-(i%2)*3.4-Math.floor(i/2)*.8,z:center.z+(i-1)*3}:{x:center.x+4-Math.max(0,n-2)*.8+i*1.8,z:center.z+((n-1)/2-i)*2.1};};
function ribbonGeometry(){const g=new THREE.BufferGeometry(),p=[],uv=[],idx=[],n=56;for(let i=0;i<=n;i++){const t=i/n,a=-2.4+t*4.8;for(let j=0;j<2;j++){const r=1+(j?1:-1)*Math.sin(Math.PI*t)*.18;p.push(Math.cos(a)*r,Math.sin(a)*r,Math.sin(t*Math.PI)*.15);uv.push(t,j);}}for(let i=0;i<n;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
const initBeforeElementalBanks=initCombatVfx;
initCombatVfx=function(){initBeforeElementalBanks();if(combatVfx.shapes.ribbon)return;const glow=map=>new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});combatVfx.shapes.ribbon=makeShapeBank('ribbon-v13',ribbonGeometry(),glow(textures.fxEnergy),64);combatVfx.shapes.nova=makeShapeBank('nova-v13',new THREE.SphereGeometry(1,20,12),glow(textures.fxFire),16);combatVfx.shapes.shield=makeShapeBank('shield-v13',new THREE.IcosahedronGeometry(1,2),new THREE.MeshStandardMaterial({map:textures.fxIce,emissiveMap:textures.fxIce,emissive:'#6bb5d4',emissiveIntensity:1,color:'#a5e2f2',transparent:true,opacity:.65,roughness:.2,metalness:.25,depthWrite:false,side:THREE.DoubleSide}),16);};
function effectBeam(a,b,color,width=.12,duration=.3,delay=0){const d=b.clone().sub(a),q=new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),d.clone().normalize());shapeEffect('beam',a.clone().add(b).multiplyScalar(.5),color,duration,{rotation:q,scale:V3(width,d.length(),width),delay,opacity:.9});}
function lightningStrike(to,color,strong){for(let k=0;k<(strong?4:2);k++){let p=to.clone().add(V3((k-.5)*1.1,5.5+k*.7,(k%2-.5)*.9));for(let j=0;j<7;j++){const n=to.clone().add(V3((Math.random()-.5)*(1-j/7)*1.6,(6-j)*.8,(Math.random()-.5)*.6));effectBeam(p,n,color,.12,.28,k*.035);p=n;}effectBeam(p,to,'#e0fbff',.07,.2,k*.035);}}
const castBeforeElementalFX=castFX;
castFX=function(kind,from,to,strong=false,impactOnly=false){
 if(combatVfx.world!==world)initCombatVfx();battleArt.bursts++;const power=strong?1.35:1,ground=to.clone();ground.y=heightAt(to.x,to.z)+.11;const horizontal=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)),sound={blade:'blade-impact',impact:'heavy-impact',arrow:'arrow-impact',fire:'fire-impact',ice:'ice-impact',heal:'heal',wardheal:'heal',ward:'ward',arcane:'arcane',ascend:'ascension',portal:'light-restore'};
 playSound(sound[kind]??'arcane',strong?.75:.5);
 if(kind==='fire'){
  effectLight(to,'#ffa044',strong?42:30,1.15);if(!impactOnly)combatProjectile(kind,from,to,.24,strong);
  shapeEffect('nova',to,'#ffe4ab',.28,{scale:V3(.2,.2,.2),expand:12*power,opacity:.7});shapeEffect('nova',to,'#ff7a35',.7,{scale:V3(.45,.65,.45),expand:3*power,rise:1,opacity:.48});
  for(let i=0;i<4;i++)shapeEffect('ribbon',to.clone().add(V3(0,i*.4,0)),i%2?'#ff8d39':'#ffd79b',.65+i*.05,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(.65+i*.67,i*.9,1.2)),scale:V3(1.2,1.2,1.2).multiplyScalar(power),spin:i%2?3:-3,expand:1.7,delay:i*.035});
  shapeEffect('ring',ground,'#ffb65f',.65,{rotation:horizontal,scale:V3(.35,.35,.35),expand:9*power});emitParticles('fire',to,'#ffb65c',strong?66:44,power,{speed:2.3,gravity:-.5,duration:1.15,size:.65,endSize:.06});emitParticles('smoke',to,'#8a7164',strong?24:16,power,{size:.8,endSize:3.4,speed:1.4,duration:1.45});emitParticles('spark',to,'#ffdb8a',34,1.4,{speed:5,gravity:7,size:.11,duration:.8});
 }else{
  // Preserve existing target/rule semantics; add a distinct spatial silhouette.
  const silent=sfx;sfx=()=>{};try{castBeforeElementalFX(kind,from,to,strong,impactOnly);}finally{sfx=silent;}
  if(kind==='blade'||kind==='impact'){
   for(let i=0;i<(strong?3:2);i++)shapeEffect('ribbon',to,'#fff0bd',.22+i*.045,{rotation:camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.2,i*.3,-.7+i*.9))),scale:V3(2.1*power,1.7*power,1),spin:i%2?5:-5,expand:1.1,delay:i*.025,opacity:.9});
   shapeEffect('ring',ground,'#cdbb8b',.4,{rotation:horizontal,scale:V3(.35,.35,.35),expand:6,opacity:.4});
  }else if(kind==='arcane'){
   lightningStrike(to,strong?'#a4ddff':'#82c6ed',strong);for(let i=0;i<3;i++)shapeEffect('ribbon',to,'#96d8ff',.45,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(i*1.1,.7,i*.9)),scale:V3(.6,.6,.6).multiplyScalar(power),expand:3,spin:i%2?4:-4});effectLight(to,'#8accff',strong?35:24,.6);
  }else if(kind==='ice'){
   for(let i=0;i<3;i++)shapeEffect('ribbon',to,'#dbfaff',.8,{rotation:horizontal,scale:V3(.8+i*.3,.8+i*.3,.8+i*.3),spin:2+i,rise:.8,expand:.8,delay:i*.08});emitParticles('spark',to,'#c9f3ff',24,.8,{gravity:2,speed:3,duration:1.2,size:.09});
  }else if(['heal','ward','wardheal','ascend'].includes(kind)){
   const color=kind==='ascend'?'#c3e8ff':kind==='ward'?'#8ecbe7':'#a6f1d0';if(kind==='ward'||kind==='ascend')shapeEffect('shield',to.clone().add(V3(0,.1,0)),color,1.35,{scale:V3(1.15,1.65,1.15).multiplyScalar(power),opacity:.26,expand:.12});
   for(let i=0;i<4;i++)shapeEffect('ribbon',ground.clone().add(V3(0,i*.35,0)),color,1.2,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2+i*.15,0,i*1.7)),scale:V3(.7+i*.15,.7+i*.15,.7+i*.15),rise:.6,spin:i%2?1.5:-1.5,expand:.3,delay:i*.05,opacity:.5});
  }
 }
 if(strong&&state.settings.motion!==false)post.material.uniforms.flash.value=Math.max(post.material.uniforms.flash.value,.08);
};
const projectileBeforeElemental=combatProjectile;
combatProjectile=function(kind,from,to,duration,strong=false){playSound(kind==='arrow'?'bow':kind==='fire'?'fire-charge':'arcane',.35);projectileBeforeElemental(kind,from,to,duration,strong);if(kind!=='fire'&&kind!=='arcane')return;const c=kind==='fire'?'#ffc773':'#a8dfff';for(let i=0;i<3;i++)shapeEffect('ribbon',from,c,duration,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(i*.9,.7,i*1.5)),scale:V3(.35,.35,.35),spin:i%2?8:-8,opacity:.7,projectile:{from:from.clone(),to:to.clone(),kind}});};
const actionBeforeCharged=startActionAnimation;
startActionAnimation=function(opts){actionBeforeCharged(opts);const a=opts.actor;if(!a||!battle?.animation)return;const id=a.characterId??a.id;if(a.action==='attack'){playSound(a.enemy&&['wolf','boar'].includes(id)?'monster-'+id:id==='tavin'?'bow':'blade-swing',.4);return;}if(a.action!=='cast')return;battleArt.charges++;const p=V3(a.x,heightAt(a.x,a.z)+.85,a.z),color=id==='lysa'?'#ffba76':id==='mira'?'#9cebc7':'#8dcefa';for(let i=0;i<2;i++)shapeEffect('ribbon',p,color,opts.duration*.55,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(i?Math.PI/2:.5,i*.7,i)),scale:V3(.75,.75,.75),spin:i?3:-3,expand:-.6,opacity:.5});emitParticles('spark',p,color,12,.4,{speed:.3,gravity:-.1,duration:.55,size:.09});};
// No attack animation can drag an actor through its target or scenery.
const cueBeforeMeleeSpacing=startActionAnimation;
startActionAnimation=function(opts){const id=opts.actor?.characterId??opts.actor?.id;if(!opts.lunge&&id==='bren'&&opts.actor.action==='attack')opts={...opts,lunge:battle.enemies[battle.target]?.actor};if(opts.lunge&&!edgeFree(opts.actor,opts.lunge,.5))opts={...opts,lunge:null};return cueBeforeMeleeSpacing(opts);};
const hitBeforeContact=applyLiveChainHit;applyLiveChainHit=function(c,hit){if(c.t/c.duration<.72){c.pendingContact=hit;return;}hitBeforeContact(c,hit);};
const chainBeforeAudible=battleAction;battleAction=function(type,index){chainBeforeAudible(type,index);if(type==='attack'&&battle?.combo)playSound(battle.combo.id==='tavin'?'bow':'blade-swing',.4);};
const animateBeforeVictoryDissolve=updateBattleRetreat;
updateBattleRetreat=function(a,dt){if(!['wolf','boar'].includes(a.id))return animateBeforeVictoryDissolve(a,dt);a.speed=0;a.dissolveTime=(a.dissolveTime??0)+dt;a.mesh.material.transparent=true;a.mesh.material.opacity=Math.max(0,1-a.dissolveTime/.5);if(a.dissolveTime>=.5)a.mesh.visible=a.shadow.visible=false;};
