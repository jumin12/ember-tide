// Airborne material originates on a specific bank, verge or face of each battle site.
// The positions are in metres relative to the formation, also for fights inside a POI.
const battleWeather=(()=>{
 const quiet=matchMedia('(prefers-reduced-motion: reduce)');
 const profiles={};
 // Horizontal wind components are local to the painted valley, copse or pass.
 // Emitter offsets and widths are in metres relative to the party.
 function site(key,wind,light,tint,...emitters){profiles[key]={wind,light,tint,emitters};}
 site('waterfall',-.75,'water','#9adce2',['gnat',5,6],['pollen',-10,5],['willow',-8,6]);
 site('woodland',.48,'canopy','#ebd99c',['leaf',-8,8]);
 site('orchard',.78,'canopy','#f8d3a1',['blossom',-9,8],['chaff',4,8]);
 site('ruins',-.36,'shaft','#e9e1b5',['mote',-5,5],['leaf',9,4]);
 site('cavern',.10,'crystal','#6ddde9',['crystal',8,6],['drip',-7,4]);
 site('mountain',1.30,'cloud','#c9d9e8',['dust',-6,12],['needle',8,5]);
 site('snow',2.9,'snow','#c1def8',['flake',0,23],['powder',0,17],['blownSnow',0,15]);
 site('coast',-1.48,'water','#abe7e0',['salt',1,14],['sand',-7,9]);
 site('royalRoad',.70,'shaft','#efd5a0',['dust',3,13],['leaf',-10,6]);
 site('moonlit',.32,'canopy','#a4c2b5',['firefly',-4,11],['leaf',10,5]);
 site('grassMeadow',.80,'cloud','#dfecaf',['seed',-3,11],['gnat',8,3]);
 site('grassRiver',-.72,'water','#b1ddcd',['gnat',-6,7],['willow',6,9]);
 site('grassFlowers',.66,'canopy','#eddbbd',['blossom',-6,10],['pollen',8,7]);
 site('grassDowns',1.20,'cloud','#e6dcc0',['chalk',-6,9],['seed',6,9]);
 site('grassWindmill',1.26,'cloud','#f1d298',['chaff',-5,13],['dust',8,5]);
 site('grassAutumn',.99,'canopy','#f0bc87',['copper',-5,11],['seed',10,5]);
 site('grassStones',-.60,'shaft','#c3c8d9',['mote',-9,4],['heather',6,8]);
 site('grassHills',-.94,'cloud','#d6e4c0',['seed',-5,8],['needle',8,8]);
 site('grassBirch',.70,'canopy','#dae7b8',['catkin',-9,7],['leaf',8,5]);
 site('grassTwilight',-.38,'dusk','#cbb3e3',['firefly',0,12],['seed',11,4]);
 site('wildlife',.38,'canopy','#d9ddb2',['gnat',-6,5],['leaf',9,5]);
 site('tavinIntro',-.32,'shaft','#ead5b1',['dust',4,6],['blossom',-9,4]);
 site('commander1',.45,'canopy','#e4d2a4',['leaf',-7,6],['dust',6,7]);
 site('betrayal',.06,'mineral','#b9a98e',['grit',-6,6],['mote',7,4]);
 site('guard',-.65,'canopy','#dfc994',['copper',-8,7],['dust',8,4]);
 site('commander2',.82,'cloud','#dac59f',['dust',0,11],['needle',-9,4]);
 site('commander3',-1.03,'shaft','#edc49b',['sand',5,10],['grit',-9,4]);

 // Each family has its own silhouette and trajectory. Haze and spindrift
 // are soft banks made with a continuous noise field, never flat streak art.
 const air={};
 function medium(key,shape,count,colour,width,height,altitude,lift,drift,period,opacity){
  air[key]={shape,count,colour,width,height,altitude,lift,drift,period,opacity};
 }
 medium('flake',0,540,'#eef6ff',.107,.092,6.6,-6.4,4.8,4.7,.94);
 medium('blownSnow',0,112,'#e3effe',.104,.034,.48,.34,4.3,2.9,.77);
 medium('powder',1,30,'#d9e9fa',3.15,.40,.30,.26,4.9,3.9,.42);
 medium('salt',0,28,'#d5eff1',.043,.053,1.5,-.56,2.4,3.1,.49);
 medium('dust',1,17,'#cbbba0',1.55,.34,.67,.27,2.55,5.8,.21);
 medium('chalk',1,14,'#e8e2d2',1.8,.37,.64,.32,2.8,5,.22);
 medium('sand',1,22,'#dcc8a4',1.7,.24,.53,.20,3.4,4.2,.24);
 medium('leaf',2,1,'#a1a15d',.32,.174,3.6,0,0,12,.94);
 medium('willow',2,1,'#a9a56d',.34,.105,3.2,0,0,11.5,.92);
 medium('copper',2,1,'#bb8147',.34,.213,3.9,0,0,13,.96);
 medium('blossom',2,13,'#f2d4c9',.157,.120,3.6,-2.2,5.2,6.4,.89);
 medium('needle',2,1,'#96925d',.23,.045,2.8,0,0,10,.83);
 medium('chaff',2,15,'#e7c987',.162,.049,2.1,-.65,5.8,4.5,.82);
 medium('catkin',2,12,'#ddd7a0',.151,.061,3.5,-2.1,4.9,6.2,.85);
 medium('heather',2,10,'#ba96a6',.077,.041,1.85,-.52,1.2,5.8,.8);
 medium('pollen',3,15,'#ffdfa0',.065,.065,2.8,.38,1.3,7,.66);
 medium('mote',3,14,'#f6deac',.067,.069,4,.35,.8,8,.60);
 medium('gnat',3,12,'#eadfb3',.054,.055,1.65,.24,.45,3.8,.70);
 medium('firefly',4,9,'#dff29b',.13,.13,2.1,.47,.48,6.6,.84);
 medium('crystal',4,12,'#90e7fa',.105,.14,3,.48,.24,9,.80);
 medium('drip',5,10,'#a6dce8',.037,.16,3.7,-3.4,.09,2.2,.77);
 medium('grit',0,15,'#c6b496',.066,.047,2.6,-1.9,.65,4.4,.70);
 medium('seed',2,12,'#e6e0bf',.123,.061,2.4,-.32,4.1,6.1,.83);
 medium('rain',5,320,'#b8ccd8',.022,.28,7,-5.,1.7,.90,.52);
 const leafForms={leaf:1,copper:2,blossom:3,seed:4,willow:5,needle:8};
 const driftingLeaves=new Set(['leaf','willow','copper','needle']);
 const milestones=['arrival','travelFern','highmere','logs','nearby'];
 const flights=new WeakMap();
 const forestFloors=new Set(['woodland','moonlit','grassBirch','grassAutumn']);
 function aimLeaf(fx,u,band){
  const x=4.8*Math.sin(band*2.16+.9),z=-1.55+1.2*Math.cos(band*1.73);
  u.flightBand.value=band;u.landing.value=forestFloors.has(fx.key)&&band%2===1?1:0;
  if(!u.landing.value)return;
  u.landingPoint.value.set(x,fx.floor(x,z)+.021,z);
  u.groundSlope.value.set((fx.floor(x+.10,z)-fx.floor(x-.10,z))/.20,
   (fx.floor(x,z+.10)-fx.floor(x,z-.10))/.20);
 }
 function settledLeaf(fx,layer,band){
  // Use the final flight pose and geometry for the litter, also when revisiting this glade.
  if(fx.litter.has(band))return;
  const leaf=layer.mesh.clone();leaf.material=material59(layer.mesh.material.clone());
  const u=leaf.material.uniforms;aimLeaf(fx,u,band);u.flightAge.value=1;
  leaf.name='Resting forest leaf';leaf.visible=true;layer.mesh.parent.add(leaf);fx.litter.set(band,leaf);
 }
 function updateLeaf(fx,layer,still){
  const now=state.elapsed;
  if(!battle||!Number.isFinite(now)||state.mode!=='battle')return false;
  let flight=flights.get(battle);
  if(!flight){
   flight={ready:now+16,start:null,site:null,band:0,beat:null};
   flights.set(battle,flight);
  }
  if(still){flight.start=null;flight.ready=now+16;return false;}
  if(flight.start!==null){
   const age=(now-flight.start)/layer.u.period.value;
   if(age>=0&&age<1&&fx.key===flight.site){
    if(layer.u.flightBand.value!==flight.band)aimLeaf(fx,layer.u,flight.band);
    layer.u.flightAge.value=age;return true;
   }
   if(age>=1&&fx.key===flight.site&&layer.u.landing.value){
    state.flags['forestFloorLeaf'+flight.band]=fx.key;settledLeaf(fx,layer,flight.band);
   }
   flight.start=null;
  }
  if(now<flight.ready||battle.status!=='choose'||menu||dialogue||transition)return false;
  const last=state.flags.lastWindLeafBand||0;
  if(last>=milestones.length||now<(state.flags.nextWindLeafTime||0)||flight.beat===state.beat)return false;
  // Resolve named quests against the live story list, which also contains inserted side quests.
  let band=0;
  for(const [i,id] of milestones.entries()){
   const beat=BEATS.findIndex(b=>b[0]===id);
   if(beat>=0&&beat<=state.beat)band=i+1;
  }
  flight.beat=state.beat;
  if(band<=last)return false;
  flight.start=now;flight.site=fx.key;flight.band=band;
  state.flags.lastWindLeafBand=band;state.flags.nextWindLeafTime=now+240;
  aimLeaf(fx,layer.u,band);layer.u.flightAge.value=0;return true;
 }
 const crosswind={waterfall:.25,woodland:-.19,orchard:.25,ruins:.14,cavern:.03,mountain:-.52,snow:-.57,
  coast:.72,royalRoad:-.24,moonlit:.13,grassMeadow:-.21,grassRiver:.40,grassFlowers:.23,grassDowns:-.42,
  grassWindmill:.42,grassAutumn:-.35,grassStones:-.19,grassHills:.47,grassBirch:.28,grassTwilight:-.20,
  wildlife:.18,tavinIntro:.14,commander1:-.17,betrayal:.02,guard:.26,commander2:.26,commander3:-.42};
 const windField={value:new THREE.Vector4()};
 // The derivative of this displacement is the same gust the vegetation feels.
 // Integrating velocity lets a particle speed up as a front passes without
 // pulling it backwards when that front subsides. Coordinates are world metres.
 const gustShader=`
 uniform vec4 battleWind;
 float gustPhase(vec2 p){vec2 d=battleWind.xy/max(.01,length(battleWind.xy));return -.23*dot(p,d)+.105*dot(p,vec2(-d.y,d.x))+battleWind.w;}
 float gustSpeed(float t,float p){return .91+.42*sin(.84*t+p)+.23*sin(1.69*t+p*1.19)+.14*sin(.34*t+p*.72);}
 float gustTravel(float t,float start,float p){return .91*(t-start)
  +.50*(cos(.84*start+p)-cos(.84*t+p))
  +(.23/1.69)*(cos(1.69*start+p*1.19)-cos(1.69*t+p*1.19))
  +(.14/.34)*(cos(.34*start+p*.72)-cos(.34*t+p*.72));}
 `;
 const lightModes=['canopy','water','cloud','shaft','snow','crystal','dusk','mineral'];
 const moonTint=new THREE.Color('#a6bfd5');
 const uniforms={fieldCentre:{value:V3()},fieldLight:{value:new THREE.Vector4()},fieldTint:{value:new THREE.Color()}};
 const lightShader=`
 uniform vec3 fieldCentre,fieldTint;uniform vec4 fieldLight;
 float fieldHash(vec2 v){vec3 p=fract(v.xyx*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
 float fieldNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(fieldHash(i),fieldHash(i+vec2(1,0)),f.x),mix(fieldHash(i+vec2(0,1)),fieldHash(i+1.),f.x),f.y);}
 vec3 siteLight(vec3 ink,vec3 pos){
  vec3 p=pos-fieldCentre;float weight=fieldLight.w*(1.-smoothstep(14.,45.,length(p.xz)))*(1.-smoothstep(5.,15.,abs(p.y)));
  if(weight<=.001)return ink;
  float mode=fieldLight.x,t=fieldLight.y,wind=fieldLight.z;
  vec2 uv=p.xz+vec2(p.y*.36,-p.y*.22);
  float n=fieldNoise(uv*.22+vec2(-t*.065*wind,0.));
  float pool;
  if(mode<.5){pool=smoothstep(.32,.72,.62*n+.38*fieldNoise(uv*.64+vec2(-t*.09*wind,t*.026)));}
  else if(mode<1.5){float r=sin(uv.x*1.2+uv.y*.8+n*5.+t*.64)*sin(uv.x*.53-uv.y*.85+t*.49);
   pool=.29+.70*smoothstep(.14,.88,r)*smoothstep(-1.,7.,-p.z+3.);}
  else if(mode<2.5){pool=smoothstep(.27,.70,fieldNoise(uv*.10+vec2(-t*.041*wind,t*.012)));}
  else if(mode<3.5){pool=exp(-abs(p.x+p.z*.52-3.+2.*n)*.29)*(.61+.39*n);}
  else if(mode<4.5){pool=.17+.80*fieldNoise(uv*vec2(.075,.19)+vec2(-t*.081*wind,0.));}
  else if(mode<5.5){pool=exp(-length((p.xz-vec2(8.,-6.))*vec2(.11,.09)))*(.80+.16*sin(t*.56+uv.x*.21));}
  else if(mode<6.5){pool=.14+.78*exp(-abs(p.x-p.z*.51+5.)*.15)*n;}
  else{pool=exp(-length((p.xz+vec2(7.,2.))*.14))*(.64+.24*n);}
  return ink*(1.-weight*(1.-pool)*.15)+weight*pool*(vec3(1.)-clamp(ink,0.,1.))*fieldTint*(.027+.12*ink);
 }`;
 const vertex=gustShader+`
 attribute vec3 birth;attribute vec4 seed;attribute vec2 bed;
 uniform float exposure,amount,kind,form,period,lift,drift,altitude,flightAge,flightBand;
 uniform float landing;uniform vec3 landingPoint;uniform vec2 groundSlope;
 uniform vec2 dimensions;varying vec2 coord;varying float alpha,grain,face,variant;
 void main(){
  float t=battleWind.z,life=period*mix(.70,1.35,seed.x),lap=t/life+seed.z,age=fract(lap);
  // Fade between flights. A new flight starts from a new release point.
  float launch=fract(sin(dot(vec2(floor(lap),seed.y),vec2(13.17,81.21)))*4336.73);
  bool single=flightAge>=0.;
  if(single){age=flightAge;life=period;launch=fract(seed.y+flightBand*.381966);}
  float phase=6.283*(seed.y+launch),elapsed=age*life;
  vec2 world=(modelMatrix*vec4(birth,1.)).xz,breeze=battleWind.xy;
  float front=gustPhase(world),gust=gustSpeed(t,front),travel=gustTravel(t,t-elapsed,front);
  float strength=length(breeze);
  vec2 dir=breeze/max(strength,.01),crossDir=vec2(-dir.y,dir.x);
  vec3 p=birth;
  p.xz+=dir*((launch-.5)*1.3)+crossDir*((seed.y-.5)*.8);
  p.xz+=breeze*drift*(travel/period);
  float bedY=birth.y+mix(mix(0.,bed.x,smoothstep(0.,.5,age)),bed.y,smoothstep(.5,1.,age));
  float flight=mix(.62,1.36,seed.x),alt=altitude*seed.w;
  float angle=phase;float roll=phase+elapsed*(1.8+seed.z*2.1);
  float shapeScale=mix(.65,1.37,seed.w),widthScale=1.,heightScale=1.;
  float emergence=smoothstep(0.,.13,age)*(1.-smoothstep(.80,1.,age));
  face=1.;variant=seed.y;grain=phase+age*2.;
  float grounded=0.;
  if(single){
   float swing=phase+elapsed*(.94+.18*seed.x);
   p=birth;
   p.z+=.46*sin(.70*swing);
   p.y+=altitude*mix(.96,.57,age)+.23*sin(swing)+.13*sin(.52*swing);
   angle=.16+.43*sin(swing)+.32*sin(.55*swing);
   face=cos(swing*.79+.37*sin(swing));heightScale=.13+.87*abs(face);
   widthScale=.95+.05*cos(swing);shapeScale=1.;emergence=1.;
   if(landing>.5){
    // An eddy carries the leaf out of the trees. Its swing loses amplitude as it touches down.
    float remaining=1.-smoothstep(0.,1.,age);
    float flutter=remaining*sin(phase+elapsed*1.83);
    p=landingPoint+vec3(-6.8*remaining+flutter*.60,altitude*remaining+.46*remaining*sin(3.14159*age)+.23*flutter,
      -1.1*remaining+.50*remaining*sin(swing*.72));
    grounded=smoothstep(.72,1.,age);emergence=smoothstep(0.,.10,age);
    face=mix(face,.78,grounded);grain=phase+min(age,1.)*2.;
   }
  }else if(form>6.5){
   float curl=sin(3.14159*age),crest=smoothstep(.40,1.48,gust);
   p.y=bedY+.04+alt*.37+curl*(.12+crest*(.42+.55*seed.x));
   p.xz+=crossDir*curl*.29*sin(phase+elapsed*2.4);
   widthScale=.80+.88*gust;heightScale=.60+.40*seed.x;
   angle=sign(breeze.x)*(.15+.25*cos(3.14159*age));
   emergence*=.24+.76*crest;face=.84+.16*seed.w;
  }else if(kind<.5&&form>5.5){
   // Fine wind-packed grains advect quickly. Slower clustered flakes catch
   // small eddies; a passing squall carries both in the same general direction.
   float cluster=smoothstep(.36,.87,seed.y);
   p.xz+=crossDir*(.10+.34*cluster)*sin(phase+elapsed*(1.3+seed.x));
   p.xz+=dir*cluster*.18*sin(roll);
   p.y=bedY+alt*.58+(-lift)*flight*(1.-age)+.18*cluster*sin(roll+.6);
   shapeScale*=mix(.60,1.48,cluster);
   angle=atan(lift*flight,breeze.x*drift*gust+.001)+cluster*.56*sin(roll);
   widthScale=mix(1.1+.45*gust,1.,cluster);heightScale=mix(.57,.97,cluster)*(.81+.19*abs(cos(roll)));
   face=.70+.30*abs(cos(roll));
   emergence*=mix(.68,1.,smoothstep(.28,1.38,gust+seed.x*.25));
  }else if(kind<1.5&&kind>.5){
   // Ground-bound streaks rise in short curls, then settle in the lee.
   float curl=sin(3.14159*age)*gust;
   p.y=bedY+.035+alt*.30+curl*(.18+.36*seed.x);
   p.xz+=crossDir*.36*sin(phase+age*4.)*curl;
   angle=.11*sin(phase+age*5.)*sign(breeze.x);
   widthScale=.63+.94*age+.29*gust;heightScale=.63+.55*curl;
   emergence*=.42+.58*smoothstep(.43,1.40,gust);
   grain=phase+elapsed*.46;
  }else if(kind>1.5&&kind<2.5){
   float skim=step(seed.z,.24);
   float flap=sin(phase+elapsed*(2.7+seed.x)+.66*sin(roll*.72));
   float arc=sin(3.14159*age);
   float release=mix(max(.9,abs(lift))+alt*.72,.12+.28*seed.w,skim);
   float landing=mix(alt*.27+.06,.08,skim);
   p.y=bedY+mix(release,landing,smoothstep(0.,1.,age))+arc*(.20+.57*gust+.24*flap)*mix(1.,.39,skim);
   p.xz+=crossDir*(.28+.42*seed.w)*sin(roll*.81)*arc;
   p.xz+=dir*.23*flap*arc;
   angle=sign(breeze.x)*(.22+.49*sin(roll*.67))+phase*.42+elapsed*(.32+seed.w);
   face=cos(roll+flap*.72);heightScale=.19+.81*abs(face);widthScale=.85+.15*abs(sin(roll));
  }else if(kind>2.5&&kind<4.5){
   p.xz+=crossDir*(.20+.23*seed.w)*sin(phase+elapsed*1.5);
   p.y=bedY+.26+alt+age*lift+.24*sin(roll*.74);
   if(kind>3.5)emergence*=.26+.74*pow(.5+.5*sin(phase+t*(1.+seed.x*.42)),2.);
  }else{
   p.y=bedY+.045+alt*.47+max(0.,-lift)*flight*(1.-age);
   angle=atan(-lift*flight,strength*drift*gust+.001)-1.5708;
   if(kind>4.5)angle=sign(breeze.x)*atan(strength*drift*gust/max(.1,-lift*flight));
  }
  vec4 view=modelViewMatrix*vec4(p,1.);vec2 q=position.xy*dimensions*shapeScale*vec2(widthScale,heightScale);
  if(single&&landing<.5){
   // Cross the current lens at the depth of the far verge. Allow one full
   // leaf beyond each side, including during a camera zoom or viewport resize.
   float crossing=age+.034*(sin(6.283185*age+phase)-sin(phase));
   float halfSpan=-view.z/projectionMatrix[0][0];
   view.x=halfSpan*projectionMatrix[2][0]+(2.*crossing-1.)*(halfSpan+length(dimensions));
  }
  vec2 card=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*q;
  vec3 offset=vec3(card,0.);
  if(grounded>0.){
   float yaw=phase+.5*flightBand;vec2 groundOffset=mat2(cos(yaw),sin(yaw),-sin(yaw),cos(yaw))*(vec2(position.x,-position.y)*dimensions);
   float fold=(1.-abs(uv.y*2.-1.))*.009;
   offset=mix(offset,mat3(modelViewMatrix)*vec3(groundOffset.x,dot(groundOffset,groundSlope)+fold,groundOffset.y),grounded);
   emergence*=mix(1.,.80,grounded);
  }
  view.xyz+=offset;
  gl_Position=projectionMatrix*view;coord=uv*2.-1.;alpha=emergence*amount*exposure;
 }`;
 const fragment=`
 uniform float kind,form;uniform vec3 ink;varying vec2 coord;varying float alpha,grain,face,variant;
 float hash(vec2 v){vec3 p=fract(v.xyx*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 void main(){
  vec2 p=coord;float r=dot(p,p),a;vec3 c=ink;
  if(kind<.5){
   float core=1.-smoothstep(.05,.86,r);
   if(form>5.5){
    vec2 off=vec2(.20,.19)*sin(variant*13.);
    float fleck=1.-smoothstep(.02,.27,dot(p-off,p-off));
    float rim=1.-smoothstep(.20,.97,r+.085*sin(atan(p.y,p.x)*5.+grain));
    core=mix(core,.62*rim+.38*fleck,smoothstep(.36,.87,variant));
    c*=mix(vec3(.78,.86,.98),vec3(1.08,1.08,1.05),face);
   }
   a=core;
  }else if(kind<1.5){
   vec2 flow=vec2(p.x*2.4-grain,p.y*1.7);
   float eddy=noise(flow+vec2(1.8*noise(flow*.83+grain*.24),0.));
   float wisps=noise(vec2(p.x*4.7-grain*1.3,p.y*7.+eddy*2.5));
   float ridge=p.y+.22*sin(p.x*3.+grain)-.27*(eddy-.5);
   a=(1.-smoothstep(.34,1.,p.x*p.x+ridge*ridge))*
     smoothstep(.21,.77,.63*eddy+.37*wisps)*(.53+.47*wisps);
  }else if(kind<2.5){
   float bow=.18*(1.-p.x*p.x)*sin(grain);float y=p.y-bow;
   float width=pow(max(0.,1.-p.x*p.x),.78)*(.80-.16*p.x);
   if(form==2.)width*=.76+.23*cos(p.x*11.+.7)+.07*cos(p.x*21.);
   if(form==3.)width=sqrt(max(0.,1.-p.x*p.x))*(.72+.27*p.x);
   if(form==4.)width*=.57+.40*smoothstep(-.4,.7,p.x);
   bool leaf=form==1.||form==2.||form==5.||form==8.;
   float rib=.075*p.x+.11*(1.-p.x*p.x);
   if(leaf){
    y=p.y-rib;float u=clamp((p.x+.68)/1.64,0.,1.);
    width=pow(max(0.,sin(3.14159*u)),form==5.?1.14:.82)*(.96-.24*u);
    if(form==2.)width*=.80+.14*cos(19.*u+.6)+.05*cos(32.*u);
    width*=y>0.?1.:.84;
   }
   float edge=width-abs(y);float aa=clamp(fwidth(edge)*.60,.05,.27);
   a=smoothstep(-aa,aa,edge)*(1.-smoothstep(.89,1.,abs(p.x)));
   if(leaf){
    a*=smoothstep(-.71,-.60,p.x);
    float stalk=(1.-smoothstep(.055,.055+aa,abs(y)))*smoothstep(-1.,-.88,p.x)*(1.-smoothstep(-.65,-.53,p.x));
    a=max(a,stalk);
   }
   float fold=smoothstep(-.13,.18,y),vein=1.-smoothstep(.02,.17,abs(y));
   c*=mix(vec3(.65,.72,.70),vec3(1.16,1.07,.91),variant)*(.81+.19*face+.14*fold+.09*vein);
  }else if(kind<4.5){a=exp(-r*4.2)*(1.-smoothstep(.73,1.,r));c*=1.+.32*exp(-r*9.);}
  else a=(1.-smoothstep(.12,.92,abs(p.x)))*(1.-smoothstep(.48,1.,abs(p.y)));
  if(a*alpha<.006)discard;gl_FragColor=vec4(c,a*alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;
 function create(group,key,field,arena){
  const profile=profiles[key];if(!profile)return null;
  const cave=arena?arena.spec.cave:key==='betrayal',snow=key==='snow';
  const night=arena?arena.night:celestial31.day.value<.23;
  const random=seeded(19741+Object.keys(profiles).indexOf(key)*1469);
  const centre=V3(field.x,0,field.z);
  const floor=(x,z)=>arena?arenaFloor88(arena,x,z):heightAt(x,z);
  centre.y=floor(centre.x,centre.z);centre.add(group.position);
  const layers=[],emitters=profile.emitters.slice(),cross=crosswind[key];
  if(!cave&&!snow)emitters.push(['rain',0,22]);
  if(arena?.particles89)arena.particles89.visible=false;
  if(arena){
   // Animate the existing foliage-colour mask in source coordinates so the
   // outer tree crowns catch the gust while the bank and water keep their shape.
   const paint=arena.landscape90.material;
   paint.uniforms.battleWind=windField;paint.uniforms.windOrigin={value:new THREE.Vector2(centre.x,centre.z)};
   paint.fragmentShader=gustShader+'\nuniform vec2 windOrigin;\n'+paint.fragmentShader.replace(
    'uv.x+=sin(time*.65+uv.y*39.+uv.x*27.)*.00065*green*canopy*foliage;',
    `vec2 grove=windOrigin+vec2((uv.x-.5)*41.,-8.-uv.y*15.);
     float crown=gustSpeed(battleWind.z,gustPhase(grove));
     float flutter=sin(battleWind.z*1.81+uv.y*53.+uv.x*33.)*.22;
     uv+=vec2(battleWind.x,.31*battleWind.y)*(.00095*(crown-.82)+.00055*flutter)*green*canopy*foliage;`);
   paint.needsUpdate=true;
  }
  for(const [name,xOffset,spread] of emitters){
   const m=air[name],count=Math.ceil(m.count*(mobileBattle69()?.49:1));
   const birth=[],seeds=[],beds=[];
   const precipitation=name==='rain'||name==='flake',nearVerge=m.shape===2||name==='powder';
   let plumeX=0,plumeZ=0;
   for(let i=0;i<count;i++){
    const edge=random(),sx=random(),sz=random();
    let x=field.x+xOffset+(sx+random()-1)*spread*1.38;
    let z=field.back-1.2-sz*(precipitation?23:11);
    // Bring a few larger particles close enough to read their shape. Cross
    // the near plane on the outer verges, where the combatants stay clear.
    if(edge<(precipitation?.23:nearVerge?.16:0)){
     const side=xOffset===0?(sx<.5?-1:1):Math.sign(xOffset);
     x=field.x+side*(field.w+1.4+sx*6);z=mix(field.back,field.front+3.1,sz);
    }
    if(name==='blownSnow'){
     // A handful of loose snow leaves each hollow together. Its grains
     // follow separate flights while sharing the local wind front.
     if(i%14===0){plumeX=field.x+(random()-.5)*2*spread;plumeZ=field.back-1-random()*8;}
     x=plumeX+(sx-.5)*3.8;z=plumeZ+(sz-.5)*1.25;
    }
    x-=profile.wind*m.drift*.38;z-=cross*m.drift*.38;
    if(driftingLeaves.has(name)){
     x=field.x;
     z=field.back-1.3-sz*1.6;
    }
    const y=floor(x,z),dx=profile.wind*m.drift,dz=cross*m.drift;
    birth.push(x,y+.035,z);
    beds.push(floor(x+.5*dx,z+.5*dz)-y,floor(x+dx,z+dz)-y);
    seeds.push(random(),random(),random(),random());
   }
   const base=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry().copy(base);base.dispose();
   g.instanceCount=count;g.setAttribute('birth',new THREE.InstancedBufferAttribute(new Float32Array(birth),3));
   g.setAttribute('seed',new THREE.InstancedBufferAttribute(new Float32Array(seeds),4));
   g.setAttribute('bed',new THREE.InstancedBufferAttribute(new Float32Array(beds),2));
   const colour=new THREE.Color(m.colour);
   if(night&&m.shape!==4)colour.lerp(new THREE.Color('#b3c4d8'),.44);
   const u={battleWind:windField,exposure:{value:1},amount:{value:m.opacity},flightAge:{value:-1},flightBand:{value:0},
    landing:{value:0},landingPoint:{value:V3()},groundSlope:{value:new THREE.Vector2()},
    form:{value:name==='blownSnow'?7:name==='flake'?6:leafForms[name]??0},altitude:{value:m.altitude},
    kind:{value:m.shape},period:{value:m.period},lift:{value:m.lift},drift:{value:m.drift},
    dimensions:{value:new THREE.Vector2(m.width,m.height)},ink:{value:colour}};
   const material=new THREE.ShaderMaterial({uniforms:u,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:true,depthWrite:false});
   const mesh=new THREE.Mesh(g,material);mesh.name='Battle weather '+name;mesh.frustumCulled=false;mesh.renderOrder=3;
   group.add(mesh);layers.push({name,mesh,u});if(arena){geometry59(g);material59(material);}
  }
  const localDust=arena?null:world?.userData.dust22?.mesh,dustMask=localDust?.layers.mask;
  if(localDust)localDust.layers.mask=0;
  const fx={key,profile,centre,night,cave,snow,layers,floor,litter:new Map(),phase:random()*6.28,localWorld:arena?null:world,
   nativeWeather:null,nativeMask:0,dispose(){
    if(this.nativeWeather)this.nativeWeather.layers.mask=this.nativeMask;
    if(localDust)localDust.layers.mask=dustMask;
    for(const leaf of this.litter.values()){leaf.removeFromParent();leaf.material.dispose();}
    this.litter.clear();
    for(const {mesh} of layers){mesh.removeFromParent();mesh.material.dispose();mesh.geometry.dispose();}
   }};
  if(forestFloors.has(key)){
   const layer=layers.find(l=>driftingLeaves.has(l.name));
   for(let band=1;band<=milestones.length;band+=2)if(state.flags['forestFloorLeaf'+band]===key)settledLeaf(fx,layer,band);
  }
  update(fx);return fx;
 }
 function update(fx){
  if(!fx){uniforms.fieldLight.value.w=0;windField.value.set(0,0,0,0);return;}
  const still=quiet.matches||state.settings.motion===false,t=still?5:clock;
  const rain=fx.cave||fx.snow?0:weather.rain.value;
  const snow=fx.cave||fx.snow||fx.key==='woodland'?0:weather.snow.value;
  const cloud=fx.cave?0:weather.cloud.value;
  const strength=still?0:1+.27*Math.max(rain,snow);
  windField.value.set(fx.profile.wind*strength,crosswind[fx.key]*strength,t,fx.phase);
  // World precipitation is normally batched around the travel camera. Use
  // the battle field for the duration of the fight, then restore that batch.
  const native=fx.localWorld?.userData.weatherBatch36;
  if(native&&native!==fx.nativeWeather){
   if(fx.nativeWeather)fx.nativeWeather.layers.mask=fx.nativeMask;
   fx.nativeWeather=native;fx.nativeMask=native.layers.mask;native.layers.mask=0;
  }
  for(const layer of fx.layers){
   const {u,name,mesh}=layer;
   if(driftingLeaves.has(name)){
    mesh.visible=updateLeaf(fx,layer,still);
    u.exposure.value=(fx.night?.58:1)*(1.-.65*Math.max(rain,snow));
    for(const leaf of fx.litter.values())leaf.material.uniforms.exposure.value=u.exposure.value;
    continue;
   }
   const precipitation=name==='rain';
   if(precipitation){
    const medium=snow>rain?air.flake:air.rain;
    u.kind.value=medium.shape;u.period.value=medium.period;u.lift.value=medium.lift;u.drift.value=medium.drift;
    u.form.value=snow>rain?6:0;u.altitude.value=medium.altitude;
    u.dimensions.value.set(medium.width,medium.height);u.amount.value=medium.opacity;u.ink.value.set(medium.colour);
   }
   mesh.visible=!still&&(!precipitation||Math.max(rain,snow)>.025);
   u.exposure.value=precipitation?Math.max(rain,snow):(fx.night&&!['firefly','crystal','flake','blownSnow','powder'].includes(name)?.57:1)*(1.-.65*Math.max(rain,snow));
  }
  const {profile}=fx;uniforms.fieldCentre.value.copy(fx.centre);uniforms.fieldTint.value.set(profile.tint);
  if(fx.night&&!fx.cave)uniforms.fieldTint.value.lerp(moonTint,.50);
  uniforms.fieldLight.value.set(lightModes.indexOf(profile.light),t,profile.wind,
   (fx.night&&!fx.cave?.47:1)*(1.-cloud*.29-rain*.46));
 }
 function bind(m,position,reconstruct=''){
  if(m.uniforms.fieldLight)return;
  Object.assign(m.uniforms,uniforms);
  const end=m.fragmentShader.lastIndexOf('}');
  m.fragmentShader=lightShader+'\n'+m.fragmentShader.slice(0,end)+
   '\nif(fieldLight.w>.001){'+reconstruct+'gl_FragColor.rgb=siteLight(gl_FragColor.rgb,'+position+');}\n'+m.fragmentShader.slice(end);
  m.needsUpdate=true;
 }
 function bendCover(shader){
  shader.uniforms.battleWind=windField;
  shader.vertexShader=gustShader+'\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('transformed.xz+=vec2(.82,.37)*gust103*stemHeight103;',`
   vec4 foot=modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.);
   float front=gustPhase(foot.xz),speed=gustSpeed(battleWind.z,front);
   vec2 sway=battleWind.xy*(.09+.22*speed)+vec2(-battleWind.y,battleWind.x)*.047*sin(battleWind.z*2.3+front);
   mat3 axes=mat3(modelMatrix)*mat3(instanceMatrix);
   vec2 localSway=vec2(dot(normalize(axes[0].xz+vec2(.000001)),sway),dot(normalize(axes[2].xz+vec2(.000001)),sway));
   transformed.xz+=mix(vec2(.82,.37)*gust103,localSway*min(1.,stemHeight103*2.1),bladeSoil.a)*stemHeight103;`);
 }
 return {create,update,bind,bendCover};
})();
const weatherWorldPost=setupPost;
setupPost=function(...args){
 const r=weatherWorldPost.apply(this,args);battleWeather.bind(post.material,'(poiCamera55*vec4(centre55,1.)).xyz');return r;
};
const weatherArenaPost=makeArenaPost89;
makeArenaPost89=function(...args){
 const p=weatherArenaPost.apply(this,args);
 battleWeather.bind(p.material,'(bounceCamera*vec4(weatherView.xyz/weatherView.w,1.)).xyz',
  'vec4 weatherView=bounceInverse*vec4(v*2.-1.,texture2D(depth,v).r*2.-1.,1.);');
 return p;
};
const weatherArenaRender=renderArena89;
renderArena89=function(...args){battleWeather.update(arena88.current?.fieldWeather);return weatherArenaRender.apply(this,args);};
