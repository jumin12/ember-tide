// Native generated art, twelve different cels per clip. No warped stills or
// procedural mesh flames form the primary silhouette of an ability.
const abilityAtlases145={records:new Map(),ready:false,pending:null,errors:[]};
const ABILITY_SHEETS145={celFire:'fire',celFrost:'frost',celHeal:'heal',celWard:'ward',celArcane:'arcane',celSlash:'slash',celAscend:'impact',celShot:'arcane'};
const ABILITY_CEL_VERTEX145=`attribute vec2 phase145;varying vec2 uv145,info145;varying vec3 tint145,normal145,world145;uniform float time145;
void main(){uv145=uv;info145=phase145;tint145=instanceColor;mat4 model145=modelMatrix*instanceMatrix;vec4 w=model145*vec4(position,1.);world145=w.xyz;normal145=normalize(mat3(model145)*normal);vec4 eye=viewMatrix*w,clip=projectionMatrix*eye;
 // Actors stand upright while particle cards face the pitched camera. Bias
 // depth by their upper extent, preserving projected size and contact point;
 // otherwise a tall target slices a horizontal strip out of the spell.
 float bias=min(4.,length(model145[1].xyz)*.5*abs(viewMatrix[1].z));vec4 front=projectionMatrix*vec4(eye.xy,eye.z+bias,eye.w);clip.z=front.z/front.w*clip.w;gl_Position=clip;}`;
function warmAbilitySheets145(){
 if(abilityAtlases145.pending)return abilityAtlases145.pending;
 abilityAtlases145.pending=Promise.all([...new Set(Object.values(ABILITY_SHEETS145))].map(async name=>{
  const image=new Image(),texture=new THREE.Texture();texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.name='Generated ability '+name;
  const row={image,texture,ready:false};abilityAtlases145.records.set(name,row);image.src='elyndor/assets/runtime-v145/effects/'+name+'.webp';await image.decode();texture.image=image;texture.needsUpdate=true;row.ready=true;
 })).then(()=>{abilityAtlases145.ready=true;}).catch(error=>{abilityAtlases145.errors.push(error.message);console.error('Ability artwork: '+error.message);throw error;});
 return abilityAtlases145.pending;
}
const ABILITY_CEL_FRAGMENT145=`varying vec2 uv145,info145;varying vec3 tint145,normal145,world145;uniform float time145,style145;uniform sampler2D sheet145;
vec4 cel145(float frame){vec2 cell=vec2(mod(frame,4.),2.-floor(frame/4.));vec2 inset=vec2(.5/384.,.5/341.333333);vec2 local=clamp(uv145,inset,1.-inset);return texture2D(sheet145,(cell+local)/vec2(4.,3.));}
void main(){float at=clamp(info145.y,0.,1.)*11.,f=floor(at),blend=fract(at);vec4 a=cel145(f),b=cel145(min(11.,f+1.));
 // Interpolate premultiplied light, so low-alpha RGB never leaves dark boxes
 // or pale veils. Suppress the generator's very faint ambient backdrop.
 float aa=smoothstep(.065,.95,a.a)*a.a,bb=smoothstep(.065,.95,b.a)*b.a;float alpha=mix(aa,bb,blend);vec3 rgb=mix(a.rgb*aa,b.rgb*bb,blend)/max(.00001,alpha);
 vec2 edge=min(uv145,1.-uv145);alpha*=smoothstep(0.,.065,min(edge.x,edge.y))*info145.x;
 if(alpha<.004)discard;gl_FragColor=vec4(rgb*1.18,min(.98,alpha));}`;
const abilitySheetBeginBefore145=beginBattle;
beginBattle=function(...args){warmAbilitySheets145().catch(()=>{});return abilitySheetBeginBefore145(...args);};
const abilitySheetCoverBefore145=advanceEncounterCover53;
advanceEncounterCover53=function(dt){const c=encounter53;if(c.phase==='enter'&&!c.swapped&&!abilityAtlases145.ready&&!abilityAtlases145.errors.length&&c.time+dt>c.duration*.44){if(c.time<c.duration*.44)abilitySheetCoverBefore145(c.duration*.44-c.time);return;}return abilitySheetCoverBefore145(dt);};
const abilityCelInitBefore145=initAbility145;
initAbility145=function(){const p=abilityCelInitBefore145();if(p.cels145)return p;for(const[name,style]of Object.entries({celFire:0,celFrost:1,celHeal:2,celWard:3,celArcane:4,celSlash:5,celAscend:6,celShot:7})){
 const b=abilityBatch145(p.group,name,new THREE.PlaneGeometry(1,1),style,32);b.mesh.material.vertexShader=ABILITY_CEL_VERTEX145;b.mesh.material.fragmentShader=ABILITY_CEL_FRAGMENT145;b.mesh.material.uniforms.sheet145={value:abilityAtlases145.records.get(ABILITY_SHEETS145[name])?.texture??null};b.mesh.material.needsUpdate=true;p.batches[name]=b;
 }p.cels145=true;return p;};
function drawAbilityCel145(q,key,position,color,width,height,opacity,phase){if(!abilityAtlases145.records.get(ABILITY_SHEETS145[key])?.ready)return;drawAbility145(key,position,V3(width,height,1),camera.quaternion,color,opacity,phase);}
const abilitySpatialDrawBefore145=drawAbilityPacket145;
drawAbilityPacket145=function(q){
 const t=clamp(q.age/q.life,0,1),ease=smooth(0,.09,t)*(1-smooth(.68,1,t)),body=q.body,look=abilityColor145(q),front=abilityFront145(q.target,q.point),ground=abilityGround145(q),radius=clamp(body.width*.58,.8,2.3),boost=q.strong?1.17:1;
 if(q.kind==='charge'){
  if(!q.actor?.mesh.visible)return;const at=abilityHand145(q.actor),color=q.element==='fire'?'#ffad52':q.element==='ice'?'#a3eaff':look.color;
  const key=q.element==='fire'?'celFire':q.element==='ice'?'celFrost':q.element==='heal'||q.element==='wardheal'?'celHeal':q.element==='ward'?'celWard':'celArcane';drawAbilityCel145(q,key,at,color,1.25,1.25,ease*.90,.10+Math.sin(t*Math.PI)*.31);abilityLight145(at,color,ease*10);return;
 }
 if(q.kind==='shot'){
  // The modeled arrow is a supporting spatial accent. Magical shots use
  // luminous 2D cels and a trail of small separately animated sprite packets.
  if(q.element==='arrow')return abilitySpatialDrawBefore145(q);
  const end=q.target?abilityFront145(q.target,q.to):q.to,current=q.from.clone().lerp(end,t),color=q.element==='fire'?'#ff9d3f':['heal','ward','wardheal'].includes(q.element)?look.color:'#66caff';current.y+=Math.sin(t*Math.PI)*.22;
  const key=q.element==='fire'?'celFire':['heal','ward','wardheal'].includes(q.element)?'celHeal':'celShot';drawAbilityCel145(q,key,current,color,q.strong?1.55:1.18,q.strong?1.55:1.18,.98,.18+t*.25);
  abilityMotes145(q,current,color,12,.16,.4,false);
  abilityLight145(current,color,18);return;
 }
 let key='celArcane',color=look.color,width=clamp(body.width*1.65,2.7,7.1)*boost,height=clamp(body.height*1.20,3.1,7.8)*boost;
 if(q.kind==='fire'){key='celFire';color='#ffae43';}
 else if(q.kind==='ice'){key='celFrost';color='#a5ecff';}
 else if(q.kind==='heal'){key='celHeal';width=clamp(body.width*1.65,2.7,5.3)*boost;height=clamp(body.height*1.24,3.1,7)*boost;}
 else if(q.kind==='ward'){key='celWard';color='#8bdcff';width=clamp(body.width*1.5,2.6,6.3)*boost;height=clamp(body.height*1.2,3,7.4)*boost;}
 else if(q.kind==='ascend'){key='celAscend';color=look.accent;}
 else if(['blade','arrow','impact'].includes(q.kind)){key=q.kind==='blade'?'celSlash':'celAscend';color=q.kind==='blade'?'#66c6ff':look.accent;}
 // The authored fire has a low ignition point; place that point at the feet.
 // Peak contact cels arrive quickly, then unravel instead of waiting until
 // after the damage reaction to become a readable impact.
 const contact=front.clone();if(q.kind==='fire')contact.y=ground.y+height*.24;
 const phase=t<.18?t/.18*.48:.48+(t-.18)/.82*.52;
 drawAbilityCel145(q,key,contact,color,width,height,ease,phase);
 // These accents stay secondary to the 2D spell: ground light, drifting
 // particles, tiny crystal fragments or a handful of leaves, never pillars.
 if(['heal','ward','ascend','ice','fire'].includes(q.kind))drawAbility145('seal',ground,V3(radius*2.5,radius*2.5,1),abilityFlat145,color,ease*.53,t);
 abilityMotes145(q,front,q.kind==='fire'?'#ffd987':color,q.strong?44:30,radius*(q.kind==='fire'?2.2:1.4),q.kind==='heal'?body.height*.65:3.0,!['heal','ward','ascend'].includes(q.kind));
 if(q.kind==='ice')for(let i=0;i<8;i++){const a=i*2.399,age=q.age,p=front.clone().add(V3(Math.cos(a)*age*radius,age*(1.3+i%3*.4)-age*age*1.4,Math.sin(a)*age*radius));if(p.y>ground.y+.1)drawAbility145('crystal',p,V3(.055,.12,.05),new THREE.Quaternion().setFromEuler(new THREE.Euler(age*3,a,age*2)),'#b8eeff',ease,t);}
 if(q.kind==='heal'&&q.owner==='tavin')for(let i=0;i<6;i++){const f=(i/6+q.age*.4)%1,a=i*2.399+q.age,p=ground.clone().add(V3(Math.cos(a)*radius*.65,.2+f*body.height,Math.sin(a)*radius*.65));drawAbility145('leaf',p,V3(.16,.12,.28),new THREE.Quaternion().setFromEuler(new THREE.Euler(f,a,.4)),look.color,ease*Math.sin(f*Math.PI),f);}
 abilityLight145(front,q.kind==='fire'?'#ffb45e':color,ease*(q.kind==='fire'?q.strong?60:42:q.strong?38:26));
};
