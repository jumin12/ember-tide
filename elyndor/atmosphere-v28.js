// Art direction within the existing map: warm sun, cool open shadows, a sharp
// playable middle ground, and restrained depth-selective foreground focus.
const lightBefore28=updateLighting;
const gold28=new THREE.Color('#ffdfa0'),sky28=new THREE.Color('#b9d4e6'),earth28=new THREE.Color('#646c4c');
updateLighting=function(){
 lightBefore28();if(!world||!player||activeScene.kind==='interior')return;
 const h=(state.worldMinutes/60%24+24)%24,day=smooth(-.04,.35,Math.sin((h-6)/12*Math.PI)),rain=weather.rain.value;
 const p=restoration?cameraTarget:player,y=heightAt(p.x,p.z);
 sun.position.set(p.x-36,y+48+Math.max(0,Math.sin((h-6)/12*Math.PI))*10,p.z-32);sun.target.position.set(p.x,y,p.z);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);
 weather.sun.value.copy(sun.position).sub(sun.target.position).normalize();sceneryLight.direction.value.copy(weather.sun.value);
 sun.color.lerp(gold28,day*.45);sun.intensity*=1.08;
 hemi.color.lerp(sky28,day*.75);hemi.groundColor.lerp(earth28,day*.75);hemi.intensity=mix(.43,1.5,day)*(1-rain*.1);
 if(skyBounce17)skyBounce17.intensity=mix(battle?.62:.25,1.8,day)*(1-rain*.18);
 renderer.toneMappingExposure=mix(1.13,1.17,day);
};
const postBefore28=setupPost;
const shaftsBefore28=buildShafts24;
buildShafts24=function(){shaftsBefore28();const m=world.userData.shafts24?.group.children[0]?.material;if(m){m.fragmentShader=m.fragmentShader.replace('rim*fade*.025','rim*fade*.045');m.needsUpdate=true;}};
setupPost=function(){
 postBefore28();post.material.fragmentShader=`
 uniform sampler2D colorTex,depthTex,bloom22;uniform vec2 resolution,nearFar;
 uniform float focus,strength,flash,time,bloomAmount22,night22;varying vec2 vUv;
 float depth28(float d){float z=d*2.-1.;return 2.*nearFar.x*nearFar.y/(nearFar.y+nearFar.x-z*(nearFar.y-nearFar.x));}
 void main(){
  vec3 col=texture2D(colorTex,vUv).rgb;float d=depth28(texture2D(depthTex,vUv).r);
  float foreground=1.-smoothstep(focus*.57,focus*.80,d);
  float distant=smoothstep(focus+20.,focus+100.,d)*.3;
  float rim=smoothstep(.40,.53,max(abs(vUv.x-.5),abs(vUv.y-.5)))*.16;
  float blur=max(max(foreground,distant),rim)*min(.85,strength);
  // Eight conditional taps; the sharp play area costs only its centre sample.
  if(blur>.035){vec2 radius=vec2(2.0+blur*6.)/resolution;vec3 total=col*.6;float weight=.6;
   for(int i=0;i<8;i++){float f=float(i)+.5,a=f*2.399963;vec2 uv=clamp(vUv+vec2(cos(a),sin(a))*sqrt(f/8.)*radius,vec2(0.),vec2(1.));float od=depth28(texture2D(depthTex,uv).r);float w=1.-smoothstep(1.5,9.,abs(od-d));total+=texture2D(colorTex,uv).rgb*w;weight+=w;}col=mix(col,total/weight,blur*.85);}
  float lum=dot(col,vec3(.2126,.7152,.0722)),shadow=1.-smoothstep(.12,.9,lum);
  col*=mix(vec3(1.025,1.008,.97),vec3(.95,1.008,1.028),shadow*.45+night22*.25);
  col+=texture2D(bloom22,vUv).rgb*bloomAmount22*.75;
  float vignette=smoothstep(.35,.80,length((vUv-.5)*vec2(1.,1.10)));col*=1.-vignette*.14;
  col+=flash*.22;gl_FragColor=vec4(max(col,vec3(0.)),1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;post.material.needsUpdate=true;
};
