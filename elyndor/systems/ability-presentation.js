// Battle-only choreography. Combat rules still own the cast, MP, targets,
// damage and contact time. Geometry and analytic particles replace old cards.
const ability145={pool:null,context:null,serial:0,events:[],suppressed:0,peak:0};
const ABILITY_LOOK145={bren:{color:'#ffd887',accent:'#fff0bd'},soren:{color:'#4ebdff',accent:'#b9efff'},tavin:{color:'#90e8a4',accent:'#e9e0a7'},mira:{color:'#63e3c7',accent:'#e8fff0'},lysa:{color:'#ff873e',accent:'#ffe7a5'}};
function abilityEvent145(type,extra={}){ability145.events.push({type,time:clock,...extra});if(ability145.events.length>160)ability145.events.shift();}
function abilityTarget145(point){let target=null,best=Infinity;for(const a of[player,...followers,...battle?.enemies.map(e=>e.actor)??[]]){if(!a?.mesh.visible)continue;const d=Math.hypot(point.x-a.x,point.z-a.z);if(d<best&&d<1.8){best=d;target=a;}}return target;}
function abilityBody145(a){const b=a?contactSize144(a):{height:2.3,width:1.5};return{height:clamp(b.height,1.5,6.5),width:clamp(b.width,1,5.5)};}
function abilityFront145(a,point,fraction=.52){
 const p=point.clone(),b=abilityBody145(a);if(a)p.set(a.x,heightAt(a.x,a.z)+b.height*fraction,a.z);
 // The readable contact sits on the camera-facing side of the upright sprite.
 // Other geometry keeps real depth testing against both the actor and scenery.
 return p.addScaledVector(camera.position.clone().sub(p).normalize(),clamp(b.width*.17,.28,.68));
}
function abilityHand145(a){
 if(sorenMeta84(a))return sorenPalm85(a).addScaledVector(camera.getWorldDirection(V3()),-.10);
 const b=abilityBody145(a),right=V3(1,0,0).applyQuaternion(camera.quaternion),p=V3(a.x,heightAt(a.x,a.z)+b.height*.68,a.z);return p.addScaledVector(right,a.enemy?.24:-.24).addScaledVector(camera.position.clone().sub(p).normalize(),.16);
}
function abilityFlameGeometry145(){
 const p=[],uv=[],idx=[],rings=15,sides=8;
 for(let j=0;j<=rings;j++){const t=j/rings,r=(.12+.13*Math.sin(t*Math.PI))*Math.pow(1-t,.75)+.001;for(let i=0;i<=sides;i++){const a=i/sides*TAU;p.push(Math.cos(a)*r+Math.sin(t*4.4)*t*.22,t,Math.sin(a)*r+Math.sin(t*3.1)*t*.11);uv.push(i/sides,t);}}
 for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const k=j*(sides+1)+i;idx.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function abilityRibbonGeometry145(){const p=[],uv=[],idx=[];for(let i=0;i<=64;i++){const t=i/64,a=t*TAU*1.32;for(const side of[-1,1]){const r=1+side*.036;p.push(Math.cos(a)*r,t,Math.sin(a)*r);uv.push((side+1)/2,t);}if(i){const k=i*2;idx.push(k-2,k,k-1,k-1,k,k+1);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function abilityCrystalGeometry145(){const pos=[],uv=[],idx=[];for(let i=0;i<6;i++){const a=i*TAU/6,b=(i+1)*TAU/6,k=pos.length/3;pos.push(Math.cos(a)*.38,-.5,Math.sin(a)*.38,Math.cos(b)*.38,-.5,Math.sin(b)*.38,Math.cos(a)*.33,.18,Math.sin(a)*.33,Math.cos(b)*.33,.18,Math.sin(b)*.33,Math.cos(a)*.33,.18,Math.sin(a)*.33,Math.cos(b)*.33,.18,Math.sin(b)*.33,.08,.5,-.03);uv.push(0,0,1,0,0,.68,1,.68,0,.68,1,.68,.5,1);idx.push(k,k+2,k+1,k+1,k+2,k+3,k+4,k+6,k+5);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function abilityLeafGeometry145(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.5,-.26,0,0,0,.12,0,.26,0,0,0,0,.5],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([.5,0,0,.5,.5,.5,1,.5,.5,1],2));g.setIndex([0,1,2,0,2,3,1,4,2,2,4,3]);g.computeVertexNormals();return g;}
const ABILITY_VERTEX145=`attribute vec2 phase145;varying vec2 uv145,info145;varying vec3 tint145,normal145,world145;uniform float time145;
void main(){uv145=uv;info145=phase145;tint145=instanceColor;vec3 p=position;
#ifdef FLAME145
 p.x+=sin(p.y*8.-time145*6.+phase145.y*9.)*p.y*.065;p.z+=cos(p.y*7.-time145*4.+phase145.y*7.)*p.y*.06;
#endif
 vec4 w=modelMatrix*instanceMatrix*vec4(p,1.);world145=w.xyz;normal145=normalize(mat3(modelMatrix*instanceMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
const ABILITY_FRAGMENT145=`varying vec2 uv145,info145;varying vec3 tint145,normal145,world145;uniform float time145;uniform float style145;const float TAU=6.28318530718;
float hash145(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise145(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash145(i),hash145(i+vec2(1,0)),f.x),mix(hash145(i+vec2(0,1)),hash145(i+1.),f.x),f.y);}
void main(){vec2 p=(uv145-.5)*2.;float r=length(p),a=atan(p.y,p.x),alpha=1.,hot=0.;vec3 col=tint145;
 if(style145<.5){float u=uv145.y,flow=noise145(vec2(uv145.x*13.+info145.y*7.,u*7.-time145*4.)),fine=noise145(vec2(uv145.x*31.-time145,u*11.-time145*5.)),heat=clamp(flow*.75+fine*.34+(1.-u)*.35,0.,1.);col=mix(vec3(.72,.012,.001),vec3(1.15,.19,.003),heat);col=mix(col,vec3(1.35,.56,.018),pow(heat,6.));alpha=smoothstep(.30,.78,flow*.72+fine*.28+(1.-u)*.17)*(1.-smoothstep(.65,1.,u))*.68;}
 else if(style145<1.5){float edge=pow(max(0.,1.-abs(p.x)),.55),flow=.6+.4*sin(uv145.y*31.-time145*5.+info145.y*TAU);alpha=edge*smoothstep(0.,.12,uv145.y)*(1.-smoothstep(.82,1.,uv145.y));col=mix(tint145,vec3(1.2,1.5,1.4),pow(edge,12.)*.6)*(.85+flow*.45);}
 else if(style145<2.5){float star=exp(-abs(p.x)*44.)*exp(-abs(p.y)*3.)+exp(-abs(p.y)*44.)*exp(-abs(p.x)*3.),core=exp(-r*r*55.);alpha=star*.75+core*.95;hot=core*.7;}
 else if(style145<3.5){float rr=.65+.015*sin(a*6.+time145),ring=exp(-pow((r-rr)/.010,2.))+exp(-pow((r-.88)/.008,2.))*.45,marks=pow(max(0.,cos(a*12.+info145.y*2.)),28.)*smoothstep(.68,.72,r)*(1.-smoothstep(.80,.84,r));alpha=ring*.8+marks*.7;}
 else if(style145<4.5){float fres=pow(1.-abs(dot(normalize(cameraPosition-world145),normal145)),2.),lit=.4+.6*abs(dot(normal145,normalize(vec3(-.3,.8,.5)))),vein=pow(max(0.,cos(uv145.x*18.+uv145.y*9.+noise145(uv145*12.)*2.)),58.);col=tint145*lit+vec3(.35,.6,.7)*(fres*.7+vein*.28);alpha=.65+fres*.28;}
 else if(style145<5.5){float fres=pow(1.-abs(dot(normalize(cameraPosition-world145),normal145)),3.);float grid=pow(max(0.,cos(uv145.x*TAU*12.)),44.)+pow(max(0.,cos(uv145.y*3.14159*9.)),44.);alpha=.035+fres*.27+grid*.23;col=mix(tint145,vec3(1.1,1.5,1.7),fres);}
 else if(style145<6.5){float n=noise145(p*3.+vec2(time145*.3,info145.y*12.)),edge=1.-smoothstep(.25,.96,r);alpha=edge*edge*(.25+n*.4);col=tint145*(.8+n*.2);}
 else if(style145<7.5){float lit=.45+.55*abs(dot(normal145,normalize(vec3(-.2,1.,.6))));col=tint145*lit;alpha=1.;}
 else if(style145<9.){float aa=max(.002,fwidth(r)),radius=.12+.79*info145.y;alpha=exp(-pow((r-radius)/(.012+aa),2.))*.8+exp(-r*17.)*(1.-info145.y);hot=exp(-r*29.);}
 else{float width=abs(uv145.y-.64),tail=pow(max(0.,sin(uv145.x*3.14159)),.8);float core=exp(-pow(width/.035,2.));alpha=(exp(-pow(width/.16,2.))*.32+core*.7)*tail;col=mix(tint145*.85,vec3(1.2,1.45,1.7),core*.65);}
 alpha*=info145.x;if(alpha<.004)discard;gl_FragColor=vec4(mix(col,vec3(1.7,1.8,1.7),hot),min(.95,alpha));}`;
function abilityBatch145(root,name,geo,style,capacity){
 const info=new Float32Array(capacity*2);geo.setAttribute('phase145',new THREE.InstancedBufferAttribute(info,2).setUsage(THREE.DynamicDrawUsage));
 const mat=new THREE.ShaderMaterial({vertexShader:ABILITY_VERTEX145,fragmentShader:ABILITY_FRAGMENT145,defines:name==='flame'?{FLAME145:1}:{},uniforms:{time145:{value:0},style145:{value:style}},transparent:true,depthTest:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.NormalBlending,toneMapped:false});
 const mesh=new THREE.InstancedMesh(geo,mat,capacity);mesh.count=0;mesh.visible=false;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);for(let i=0;i<capacity;i++)mesh.setColorAt(i,new THREE.Color());mesh.renderOrder=8;mesh.userData.dynamicFX=true;root.add(mesh);return{mesh,info,count:0,capacity};
}
function initAbility145(){
 const root=brenRoot82();if(ability145.pool?.root===root)return ability145.pool;disposeAbility145();const group=new THREE.Group();group.name='Layered ability choreography';root.add(group);
 const make=(name,geo,style,n)=>abilityBatch145(group,name,geo,style,n),pool={root,group,time:0,packets:[],matrix:new THREE.Matrix4(),color:new THREE.Color(),spin:new THREE.Quaternion(),lights:[],counts:{},batches:{
 flame:make('flame',abilityFlameGeometry145(),0,64),ribbon:make('ribbon',abilityRibbonGeometry145(),1,64),mote:make('mote',new THREE.PlaneGeometry(1,1),2,512),seal:make('seal',new THREE.PlaneGeometry(1,1),3,32),crystal:make('crystal',abilityCrystalGeometry145(),4,128),shield:make('shield',new THREE.SphereGeometry(1,20,14),5,12),smoke:make('smoke',new THREE.PlaneGeometry(1,1),6,80),leaf:make('leaf',abilityLeafGeometry145(),7,144),core:make('core',new THREE.IcosahedronGeometry(1,2),4,32),wave:make('wave',new THREE.PlaneGeometry(1,1),8,40),arrow:make('arrow',new THREE.CylinderGeometry(.022,.025,1,5),7,24),blade:make('blade',slashVolumeGeometry(),9,24)}};
 ability145.pool=pool;return pool;
}
function disposeAbility145(){const q=ability145.pool;if(!q)return;q.group.removeFromParent();for(const b of Object.values(q.batches)){b.mesh.dispose();b.mesh.geometry.dispose();b.mesh.material.dispose();}ability145.pool=null;}
function drawAbility145(kind,pos,scale,rotation,color,alpha=1,phase=0){const p=ability145.pool,b=p.batches[kind];if(b.count>=b.capacity)return;const i=b.count++;p.matrix.compose(pos,rotation,scale);b.mesh.setMatrixAt(i,p.matrix);b.mesh.setColorAt(i,p.color.set(color));b.info.set([alpha,phase],i*2);}
function abilityPacket145(kind,target,point,owner,strong=false,options={}){const p=initAbility145();if(p.packets.length>=32)p.packets.shift();const q={kind,target,point:point.clone(),owner,strong,body:abilityBody145(target),age:0,life:kind==='shot'?.3:kind==='charge'?.7:kind==='fire'?1.45:kind==='ice'?1.55:kind==='heal'?1.65:kind==='ward'?1.85:kind==='ascend'?1.8:.85,seed:++ability145.serial,...options};p.packets.push(q);abilityEvent145(kind,{owner,target:target?.id??null,strong,life:q.life});return q;}
function abilityColor145(q){return ABILITY_LOOK145[q.owner]??ABILITY_LOOK145.soren;}
function abilityGround145(q){return q.target?V3(q.target.x,heightAt(q.target.x,q.target.z)+.045,q.target.z):V3(q.point.x,heightAt(q.point.x,q.point.z)+.045,q.point.z);}
const abilityFlat145=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0));
function abilityMotes145(q,origin,color,count,spread,rise,ballistic=false){
 const t=q.age/q.life,b=q.body;for(let i=0;i<count;i++){const a=i*2.399963+q.seed*.9,start=(i%7)*.025,age=Math.max(0,q.age-start),life=q.life-start;if(q.age<start||age>life)continue;const f=age/life,rad=ballistic?(age*spread*(.35+i%5*.12)):(spread*(.35+i%7*.08)*(1-f*.35)),angle=a+(ballistic?0:age*1.6),pos=origin.clone().add(V3(Math.cos(angle)*rad,ballistic?age*rise-age*age*4:f*rise+.10,Math.sin(angle)*rad));
  if(pos.y<heightAt(pos.x,pos.z)+.06)continue;pos.addScaledVector(camera.position.clone().sub(pos).normalize(),.18);const size=(ballistic?.11:.085)*(q.strong?1.3:1)*(1-f*.6);drawAbility145('mote',pos,V3(size,ballistic?size*2.4:size,1),camera.quaternion,color,Math.min(1,f*15)*(1-f),i%2);
 }
}
function abilityLight145(pos,color,power){ability145.pool.lights.push({pos:pos.clone(),color,power});}
function drawAbilityPacket145(q){
 const p=ability145.pool,t=clamp(q.age/q.life,0,1),ease=smooth(0,.16,t)*(1-smooth(.65,1,t)),body=q.body,ground=abilityGround145(q),front=abilityFront145(q.target,q.point),look=abilityColor145(q),radius=clamp(body.width*.58,.8,2.3)*(q.strong?1.18:1),height=body.height,rot=p.spin;
 if(q.kind==='charge'){
  const a=q.actor;if(!a?.mesh.visible)return;const at=abilityHand145(a),f=q.cue?clamp(q.cue.time/(q.cue.duration*q.cue.impactAt),0,1):t;const color=q.element==='fire'?'#ffac65':q.element==='ice'?'#a1e7ff':look.color;
  drawAbility145('core',at,V3(.10,.10,.10).multiplyScalar(.6+f*.6),rot.setFromEuler(new THREE.Euler(q.age,0,q.age*2)),color,ease*.65,t);
  for(let j=0;j<2;j++)drawAbility145('seal',at,V3(.55,.55,.55).multiplyScalar(.65+f*.4),camera.quaternion,color,ease*.8,j*.4);
  for(let i=0;i<12;i++){const a=i*2.399+q.age*1.6,r=(1-f)*.65+.13;drawAbility145('mote',at.clone().add(V3(Math.cos(a)*r,Math.sin(a*1.3)*r,Math.sin(a)*r)),V3(.06,.06,1),camera.quaternion,look.accent,ease,i*.1);}abilityLight145(at,color,ease*10);return;
 }
 if(q.kind==='shot'){
  const end=q.target?abilityFront145(q.target,q.to):q.to,current=q.from.clone().lerp(end,t),direction=end.clone().sub(q.from).normalize();current.y+=Math.sin(t*Math.PI)*.22;const color=q.element==='fire'?'#ff9845':q.element==='arrow'?'#fff0ab':['heal','ward','wardheal'].includes(q.element)?look.color:'#64c8ff';
  if(q.element==='arrow'){const orient=new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),direction);drawAbility145('arrow',current,V3(1,1.35,1),orient,'#c6ad72',1,t);drawAbility145('crystal',current.clone().addScaledVector(direction,.74),V3(.15,.26,.15),orient,'#e2e9df',1,t);for(let i=0;i<3;i++){const fletch=orient.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),i*TAU/3));drawAbility145('leaf',current.clone().addScaledVector(direction,-.55),V3(.16,.7,.32),fletch,'#d8dfc3',1,t);}}
  else{drawAbility145('core',current,V3(.20,.20,.20).multiplyScalar(q.strong?1.4:1),rot.setFromEuler(new THREE.Euler(t*4,t*3,0)),color,.9,t);for(let i=0;i<2;i++)drawAbility145('seal',current,V3(.72,.72,.72),new THREE.Quaternion().setFromAxisAngle(direction,t*5+i).multiply(camera.quaternion),color,.7,t);}
  for(let i=1;i<14;i++){const back=Math.max(0,t-i*.013),at=q.from.clone().lerp(end,back);at.y+=Math.sin(back*Math.PI)*.22;const s=(1-i/15)*.20;drawAbility145(q.element==='fire'?'flame':'mote',at,V3(s,q.element==='fire'?s*1.4:s,1),camera.quaternion,color,(1-i/15)*.7,t);}abilityLight145(current,color,q.element==='arrow'?7:22);return;
 }
 if(q.kind==='heal'||q.kind==='ward'||q.kind==='ascend'){
  const heal=q.kind==='heal',ward=q.kind==='ward',color=ward?'#70cfff':q.kind==='ascend'?look.accent:look.color,bright=look.accent;
  drawAbility145('seal',ground,V3(radius*2.6,radius*2.6,1),abilityFlat145,color,ease*.75,t);
  for(let i=0;i<(ward?2:3);i++){const a=q.age*(i%2?-1.1:1.1)+i*TAU/3,orientation=new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),a);drawAbility145('ribbon',ground,V3(radius*(.64+i*.13),height*(1.05+i*.04),radius*(.64+i*.13)),orientation,i===1?bright:color,ease*(ward?.58:.86),t);}
  if(ward){drawAbility145('shield',ground.clone().add(V3(0,height*.48,0)),V3(radius*1.1,height*.57,radius*1.1),rot.setFromAxisAngle(V3(0,1,0),q.age*.28),color,ease*.7,t);}
  else for(let i=0;i<15;i++){const f=(i/15+q.age*.38)%1,a=i*2.399+q.age*1.1,rad=radius*(.78-.25*f),pos=ground.clone().add(V3(Math.cos(a)*rad,.15+f*height*1.08,Math.sin(a)*rad));drawAbility145(q.owner==='tavin'?'leaf':'crystal',pos,q.owner==='tavin'?V3(.28,.20,.42):V3(.055,.15,.055),rot.setFromEuler(new THREE.Euler(f*.9,a,.4)),i%3?color:bright,ease*Math.sin(f*Math.PI),f);}
  abilityMotes145(q,ground,color,q.strong?40:26,radius,height*1.10,false);drawAbility145('wave',front,V3(radius*.8,radius*.8,1),camera.quaternion,bright,ease*.32,t);abilityLight145(front,color,ease*(q.strong?30:20));return;
 }
 if(q.kind==='fire'){
  const flameHeight=height*(q.strong?1.1:.9),color='#ff9d43';drawAbility145('seal',ground,V3(radius*2.8,radius*2.8,1),abilityFlat145,'#ff9f48',ease*.65,t);
  for(let i=0;i<11;i++){const f=(i*.137+q.age*.95)%1,a=i*2.399+q.age*.6,r=radius*(.58+i%3*.16),pos=ground.clone().add(V3(Math.cos(a)*r,0,Math.sin(a)*r)),h=flameHeight*(.55+i%4*.17)*(.65+.35*Math.sin(f*Math.PI));drawAbility145('flame',pos,V3(radius*.58,h,radius*.58),rot.setFromAxisAngle(V3(0,1,0),a+q.age),i%3?color:'#ffd985',ease*.92,f);}
  drawAbility145('wave',front,V3(radius*2.2,radius*2.2,1),camera.quaternion,'#ffd7a0',Math.pow(1-t,2)*.85,t);abilityMotes145(q,front,'#ffe1a1',38,radius*2.3,height*.85,true);
  for(let i=0;i<6;i++){const age=Math.max(0,q.age-.18-i*.03),f=age/1.5,pos=ground.clone().add(V3(Math.sin(i*2.4)*radius*.7,height*.45+f*height,Math.cos(i*2.4)*radius*.6));drawAbility145('smoke',pos,V3(1.3,1.3,1.3).multiplyScalar(radius*(.45+f*.65)),camera.quaternion,'#535967',ease*.22,t+i*.12);}
  abilityLight145(front,'#ffb265',ease*(q.strong?65:43));return;
 }
 if(q.kind==='ice'){
  drawAbility145('seal',ground,V3(radius*3.2,radius*3.2,1),abilityFlat145,'#b3eaff',ease*.8,t);
  for(let i=0;i<9;i++){const age=Math.max(0,q.age-i*.025),grow=smooth(0,.27,age)*(1-smooth(1.0,1.55,age)),a=i*2.399,r=radius*(.75+i%3*.15),h=height*(.38+i%3*.20)*grow,pos=ground.clone().add(V3(Math.cos(a)*r,h*.48,Math.sin(a)*r));if(grow>.015)drawAbility145('crystal',pos,V3(radius*.30,h,radius*.35),rot.setFromEuler(new THREE.Euler(Math.cos(a)*.28,a,Math.sin(a)*.28)),i%2?'#72cdea':'#c0f0ff',ease,t);}
  for(let i=0;i<20;i++){const a=i*2.399,age=q.age,at=front.clone().add(V3(Math.cos(a)*age*radius,age*(1.8+i%3*.6)-age*age*1.9,Math.sin(a)*age*radius));drawAbility145('crystal',at,V3(.07,.16,.06).multiplyScalar(1-t*.5),rot.setFromEuler(new THREE.Euler(age*3,a+age,age*2)),i%2?'#d6f7ff':'#7ed8f2',ease,t);}
  abilityMotes145(q,front,'#d9f7ff',24,radius*1.6,height*.4,false);for(let i=0;i<5;i++)drawAbility145('smoke',ground.clone().add(V3(Math.sin(i*2.4)*radius*.5,.2+q.age*.4,Math.cos(i*2.4)*radius*.5)),V3(radius*1.1,radius*.4,1),camera.quaternion,'#b2ddeb',ease*.16,t+i*.2);abilityLight145(front,'#b5e9ff',ease*29);return;
 }
 // Physical skills and arcane contacts share a clear front strike, but have
 // distinct silhouettes, particles, orbiting geometry and color choreography.
 const physical=q.kind==='blade'||q.kind==='arrow'||q.kind==='impact',color=q.kind==='blade'?'#68bfff':physical?look.accent:look.color;
 if(q.kind==='blade')for(let i=0;i<2;i++){const orient=camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.18+i*.25,.2,-.8+i*.8+q.age*1.5)));drawAbility145('blade',front,V3(1,1,1).multiplyScalar(clamp(height*.40,1.15,2.6)*(1-i*.13)),orient,i%2?'#b9e9ff':color,ease*(i?.45:.85),t);}
 else if(!physical)for(let i=0;i<3;i++){const orient=new THREE.Quaternion().setFromEuler(new THREE.Euler(.5+i*.6,q.age*1.1+i,0));drawAbility145('ribbon',front.clone().add(V3(0,-height*.30,0)),V3(radius*.8,height*.7,radius*.8),orient,i===1?look.accent:color,ease*.85,t);}
 drawAbility145('wave',front,V3(radius*2.4,radius*2.4,1),camera.quaternion,color,Math.pow(1-t,1.3),t);abilityMotes145(q,front,color,physical?28:42,radius*(physical?4.3:1.9),physical?3.5:height*.6,true);abilityLight145(front,color,ease*(q.strong?48:27));
}
function refreshAbility145(){const p=ability145.pool;if(!p||!battle)return;for(const b of Object.values(p.batches))b.count=0;p.lights=[];for(const q of p.packets)drawAbilityPacket145(q);let count=0;
 for(const[name,b]of Object.entries(p.batches)){b.mesh.count=b.count;b.mesh.visible=b.count>0;b.mesh.material.uniforms.time145.value=p.time;if(b.count){b.mesh.instanceMatrix.needsUpdate=b.mesh.instanceColor.needsUpdate=true;b.mesh.geometry.attributes.phase145.needsUpdate=true;}p.counts[name]=b.count;count+=b.count;}ability145.peak=Math.max(ability145.peak,count);
 // Reuse the two existing contact light slots; no per-particle lights/shadows.
 const lights=p.lights.sort((a,b)=>b.power-a.power).slice(0,2);if(lights.length){const shared=initBrenFX82();for(let i=0;i<lights.length;i++){const q=lights[i],l=shared.lights[i];l.position.copy(q.pos).addScaledVector(camera.position.clone().sub(q.pos).normalize(),1.65);l.position.y+=.7;l.color.set(q.color);l.intensity=q.power*.60;l.userData.life=.04;brenSurface82.positions.value[i].copy(l.position);brenSurface82.powers.value[i].set(l.color.r,l.color.g,l.color.b).multiplyScalar(q.power*.018);}}
}
const abilitySkillBefore145=executeSkill;
executeSkill=function(id,index,...args){const skill=CAST[id]?.skill[index];if(!skill)return abilitySkillBefore145(id,index,...args);ability145.context={id,index,kind:skill[3],label:skill[state.characters[id].ascended?5:0],targetIndex:args[0]};try{return abilitySkillBefore145(id,index,...args);}finally{ability145.context=null;}};
const abilityActionBefore145=startActionAnimation;
startActionAnimation=function(opts){const result=abilityActionBefore145(opts),cue=battle?.animation;if(!cue||cue.actor!==opts.actor||!ability145.context)return result;cue.ability145={...ability145.context};const c=cue.ability145,a=cue.actor;if(!['blade','arrow'].includes(c.kind))abilityPacket145('charge',a,abilityHand145(a),c.id,false,{actor:a,cue,element:c.kind,life:cue.duration*cue.impactAt,recipients:['heal','ward','wardheal'].includes(c.kind)?(c.kind!=='heal'||c.id==='bren'?state.members:[state.members[c.targetIndex]??c.id]).map(actorFor).filter(Boolean):[]});abilityEvent145('cast',{...c,duration:cue.duration,impactAt:cue.impactAt});return result;};
// Remove old single-picture charge/heal/flame cards only during combat.
const abilityArtBefore145=artBurst35;
artBurst35=function(...args){if(battle){ability145.suppressed++;return;}return abilityArtBefore145(...args);};
const abilityCastBefore145=castFX;
castFX=function(kind,from,to,strong=false,impactOnly=false){if(!battle)return abilityCastBefore145(kind,from,to,strong,impactOnly);const a=battle.combo?.actor??battle.animation?.actor,id=a?.characterId??a?.id??currentFighter()??'soren',target=abilityTarget145(to),style=kind==='wardheal'?'heal':kind==='arcane'?'arcane':kind;
 abilityPacket145(style,target,to,id,strong);if(kind==='wardheal')abilityPacket145('ward',target,to,id,strong,{life:1.85});if(kind==='heal'&&battle.animation?.ability145?.kind==='wardheal')abilityPacket145('ward',target,to,id,strong,{life:1.85});playSound(kind==='blade'||kind==='impact'?'blade-impact':kind==='heal'?'heal':kind==='ward'?'ward':kind==='fire'?'fire':'arcane',strong?.7:.5);
};
const abilityProjectileBefore145=combatProjectile;
combatProjectile=function(kind,from,to,duration,strong=false,...args){if(!battle)return abilityProjectileBefore145(kind,from,to,duration,strong,...args);const a=battle.combo?.actor??battle.animation?.actor,id=a?.characterId??a?.id??'soren',cue=battle.animation,life=cue?Math.max(.08,cue.duration*cue.impactAt-cue.time):duration;
 const targets=id==='tavin'&&strong&&cue?.ability145?battle.enemies.filter(e=>e.hp>0).map(e=>e.actor):[abilityTarget145(to)];for(const target of targets){const origin=a?abilityHand145(a):from;abilityPacket145('shot',target,to,id,strong,{from:origin.clone(),to:to.clone(),element:kind,life});}
};
const abilityTickBefore145=tick;
tick=function(dt){const result=abilityTickBefore145(dt),p=ability145.pool;if(p){if(!battle||p.root!==brenRoot82())disposeAbility145();else if(!gameLoading&&!menu&&!devConsole60.open&&!phoneCombat69.manualHelp){const x=battle.combo?.cinema141,step=dt*(x?(chainPaused141()?0:x.fxRate??chainRate141(x)):1);p.time+=step;for(const q of [...p.packets]){q.age+=step;if(q.kind==='charge'&&!q.sent&&q.recipients.length&&q.cue.time>=q.life*.32&&!q.cue.applied){q.sent=true;for(const target of q.recipients)abilityPacket145('shot',target,actorImpactPoint(target),q.owner,q.strong,{from:abilityHand145(q.actor),to:actorImpactPoint(target),element:q.element,life:Math.max(.08,q.life-q.cue.time)});}}p.packets=p.packets.filter(q=>q.age<q.life&&(!q.cue||battle.animation===q.cue&&!q.cue.applied));refreshAbility145();}}return result;};
const abilityEndBefore145=endBattle;
endBattle=function(...args){const r=abilityEndBefore145(...args);if(!battle)disposeAbility145();return r;};
const abilityBootBefore145=boot;
boot=async function(...args){const r=await abilityBootBefore145(...args),previous=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(previous());q.abilities145={events:ability145.events.slice(-12),packets:ability145.pool?.packets.map(p=>({kind:p.kind,target:p.target?.id,owner:p.owner,age:+p.age.toFixed(2),life:p.life}))??[],instances:ability145.pool?.counts??{},suppressedPictureCards:ability145.suppressed};return JSON.stringify(q);};return r;};
// Exercise the actual abilities from the existing Battle lab, including the
// powered-up variants, rather than showing a detached sprite-only simulation.
Object.assign(devWorkbench144,{ability145:'mira:0',ascended145:false});
const abilityDevRenderBefore145=renderDevConsole60;
renderDevConsole60=function(...args){const r=abilityDevRenderBefore145(...args);if(!devConsole60.unlocked||devConsole60.tab!=='battle')return r;const lab=devConsole60.root.querySelector('.dev-combo-lab144');if(!lab)return r;
 lab.insertAdjacentHTML('beforeend','<h3>Ability effects</h3><p>Preview a real cast with its projectile, target effect and environment lighting.</p>'+devSelect60('ability145','Ability',devOptions60(Object.entries(CAST).flatMap(([id,c])=>c.skill.map((s,i)=>[id+":"+i,c.name+' · '+s[0]])),devWorkbench144.ability145))+'<label class="dev-check60"><input type="checkbox" data-dev-field="ascended145"'+(devWorkbench144.ascended145?' checked':'')+'>Ascended version</label><div class="dev-actions60"><button class="dev-primary60" data-dev-action="ability-play145">Play ability</button></div>');if(devConsole60.running||devWorkbench144.loadingAbility145)for(const e of lab.querySelectorAll('input,select,button'))e.disabled=true;return r;
};
const abilityDevFieldBefore145=changeDevField60;
changeDevField60=function(input){const k=input.dataset.devField;if(k==='ability145'){devWorkbench144.ability145=input.value;return;}if(k==='ascended145'){devWorkbench144.ascended145=input.checked;return;}return abilityDevFieldBefore145(input);};
const abilityDevActionBefore145=runDevAction60;
runDevAction60=async function(action){if(action!=='ability-play145'){if(devWorkbench144.loadingAbility145)return;return abilityDevActionBefore145(action);}const q=devConsole60,w=devWorkbench144;if(!q.unlocked||q.running||w.loadingAbility145)return;w.loadingAbility145=true;renderDevConsole60();
 try{const[id,n]=w.ability145.split(':'),index=Number(n);if(!CAST[id]?.skill[index])throw Error('Choose a valid ability.');w.practice=null;await startDevSession60();await leaveDevBattle60();q.party=4;if(!state.members.includes(id)){state.members[state.members.length-1]=id;await ensureSprite116(id);setupParty([player.x,player.z]);}
  await abilityDevActionBefore145('battle');if(q.error||!battle)return;hideDevConsole60();clearBattleIntro58();battle.intro=0;battle.queue=[id];battle.turn=0;battle.status='choose';for(const k of state.members){state.characters[k].mp=stats(k).mp;state.characters[k].hp=Math.round(stats(k).hp*.45);}state.characters[id].ascended=w.ascended145;const a=actorFor(id);if(w.ascended145&&assets.sprites[id+'Ascended']){await ensureSprite116(id+'Ascended');replaceActorArt(a,id+'Ascended');}renderBattle();executeSkill(id,index,0);q.status=CAST[id].name+' · '+CAST[id].skill[index][w.ascended145?5:0];$('#toast')?.classList.remove('show');
 }catch(error){q.error=error.message;q.open=true;}finally{w.loadingAbility145=false;if(q.open)renderDevConsole60();}
};
