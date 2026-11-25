// Landscape light, water detail and contact effects share the native simulation clock.
(() => {
  'use strict';
  const time={value:0}, sunlight={value:1}, hitAge={value:1}, magicImpact={value:0};
  const impactTint={value:new THREE.Vector3(.26,.73,1.)};
  const contactScreen={value:new THREE.Vector2()}, contactStrength={value:0};
  const contactWorld=V3(), projected=V3(), viewAxis=V3();
  const strikeWorld=V3();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let contactAt=-Infinity, contactPower=0;
  const landscape={value:0}, fountain={value:new THREE.Vector2()}, hasFountain={value:0};
  let owner=null, group=null, hitMesh=null, struckAt=-Infinity;
  // In-world battles have real steps, terraces and slopes. The regular
  // scene pass can light the visible terrain directly from its depth buffer.
  const storyLights=Array.from({length:4},()=>new THREE.Vector4(0,0,0,-1000));
  const storyTints=storyLights.map(()=>new THREE.Vector4());
  const storyPower={value:0};
  // Shade visible surfaces from the actual cast, projectile and contact positions.
  // Uniform slots reference the existing light pool; they have no scene ownership.
  const bounceSources=Array.from({length:4},()=>new THREE.Vector4());
  const bounceColours=bounceSources.map(()=>new THREE.Vector4());
  const bounceCount={value:0},bounceEye={value:V3()},bounceTint=new THREE.Color();
  const bounceUniforms={bounceSources:{value:bounceSources},bounceColours:{value:bounceColours},bounceCount,bounceEye};
  const bounceShader=`
    uniform vec4 bounceSources[4],bounceColours[4];uniform vec3 bounceEye;uniform int bounceCount;
    vec3 battleBounce(vec3 ink,vec3 surface){
      vec3 view=surface-bounceEye;float depth=length(view);view/=max(depth,.001);
      vec3 spill=vec3(0.),bloom=vec3(0.);
      for(int i=0;i<4;i++){
        if(i>=bounceCount)break;
        vec4 lamp=bounceSources[i],colour=bounceColours[i];
        vec3 off=surface-lamp.xyz;float dist2=dot(off,off)/(lamp.w*lamp.w);
        float bounce=exp(-dist2*2.1);
        vec3 eyeLight=lamp.xyz-bounceEye;float along=dot(eyeLight,view);
        vec3 radial=eyeLight-view*along;
        float r2=dot(radial,radial)/(lamp.w*lamp.w);
        // Forward scatter is occluded by closer actors, allowing for sprite depth bias.
        float visible=smoothstep(-1.65,-.20,depth-along)*step(.01,along);
        spill+=colour.rgb*colour.w*bounce;
        bloom+=colour.rgb*colour.w*visible*(.22*exp(-r2*24.)+.13*exp(-r2*5.));
      }
      vec3 headroom=1.-clamp(ink,0.,1.);
      return ink+headroom*(1.-exp(-spill*(.37+.40*ink)-bloom));
    }`;
  function bounceSlot(point,radius,r,g,b,power){
    const i=bounceCount.value++;
    bounceSources[i].set(point.x,point.y,point.z,radius);
    bounceColours[i].set(r,g,b,power);
  }
  function updateBounce(quiet){
    bounceCount.value=0;
    if(!battle)return;
    bounceEye.value.copy(camera.position);
    const gain=quiet?.38:1, age=(clock-struckAt)/.43;
    if(age>=0&&age<1){
      const tint=impactTint.value;
      bounceSlot(strikeWorld,3.4+contactPower*2,tint.x,tint.y,tint.z,
        gain*(.65+.60*contactPower)*Math.pow(1-age,1.7));
    }
    const pool=ability145.pool;
    if(!pool||pool.root!==brenRoot82())return;
    for(const lamp of pool.lights){
      if(lamp.power<.25||bounceCount.value>=bounceSources.length)break;
      // A ward and heal at the same point share one local exposure.
      let duplicate=false;
      for(let i=0;i<bounceCount.value;i++){
        const p=bounceSources[i];
        if(Math.abs(p.x-lamp.pos.x)+Math.abs(p.y-lamp.pos.y)+Math.abs(p.z-lamp.pos.z)<.25)duplicate=true;
      }
      if(duplicate)continue;
      bounceTint.set(lamp.color);
      bounceSlot(lamp.pos,2.1+Math.min(2.9,lamp.power*.074),bounceTint.r,bounceTint.g,bounceTint.b,
        gain*Math.min(1.35,lamp.power*.038));
    }
  }
  let activeStory=null,storyCursor=0,lastStoryLight=-Infinity;
  let storyCasters=[];
  const hiddenCasters=new Set();
  function refreshStoryShadows(){
    shadow36.last=-100;shadow36.due=true;
    renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;
  }
  // Story cameras cut away architecture that would hide the cast. The
  // ordinary colour-only cutaway would leave its silhouette on the floor.
  const originalSight=reapplyCombatSight18;
  reapplyCombatSight18=function(...args){
    const result=originalSight.apply(this,args);
    if(!activeStory)return result;
    let changed=false;
    for(const mesh of storyCasters){
      if(mesh.userData.viewHidden&&mesh.castShadow){
        mesh.castShadow=false;hiddenCasters.add(mesh);changed=true;
      }else if(!mesh.userData.viewHidden&&hiddenCasters.delete(mesh)){
        mesh.castShadow=true;changed=true;
      }
    }
    if(changed)refreshStoryShadows();
    return result;
  };
  const groundPattern=`float spellGlow(vec2 xy,float u,float pattern){
    float r=length(xy),a=atan(xy.y,xy.x+.00001);
    float front=.19+.63*(1.-pow(1.-u,2.));
    float veins=.40+.60*pow(abs(cos(a*3.+u)),5.);
    float rim=exp(-abs(r-front)*33.)*mix(veins,1.,pattern);
    float facets=exp(-abs(r-front*.76)*62.)*veins;
    float wash=exp(-r*r*(5.3+2.*u))*(.54+.18*(1.-u));
    return (wash+rim*.57+facets*.34)*pow(1.-u,1.45)*(1.-smoothstep(.86,1.,r));
  }`;
  const commonVertex = `varying vec2 p;
    void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
  const noise = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
    float cloud(vec2 p){return n(p)*.53+n(p*2.07)*.29+n(p*4.2)*.13+n(p*8.5)*.05;}`;

  function layer(geometry, fragment, options = {}) {
    const material = new THREE.ShaderMaterial({
      uniforms: {t:time,age:hitAge,sunlight,impactTint,magicImpact}, vertexShader: commonVertex,
      fragmentShader:'varying vec2 p; uniform float t,age,sunlight,magicImpact;uniform vec3 impactTint;\n'+noise+'\n'+fragment,
      transparent:true, depthWrite:false, side:THREE.DoubleSide,
      toneMapped:false, ...options
    });
    const mesh = new THREE.Mesh(geometry,material);
    group.add(mesh);
    return mesh;
  }

  function buildTown(f) {
    const pool = layer(new THREE.CircleGeometry(2.16,80), `
      void main(){
        vec2 d=(p-.5)*2.;float r=length(d);
        float ripple=length(d-vec2(.29,-.19));
        float waves=sin(ripple*49.-t*2.5+1.2*n(d*6.));
        float caustic=sin(d.x*18.+3.1*sin(d.y*8.+t*.6)+t*.4)
                     +sin(d.y*16.+3.5*cos(d.x*8.-t*.47));
        float glint=pow(max(0.,waves),11.)*smoothstep(.36,.69,n(d*7.+vec2(t*.11,0.)));
        float vein=pow(max(0.,1.-abs(caustic)*.85),5.);
        float reflection=glint*.44+vein*.095;float edge=1.-smoothstep(.89,1.,r);
        vec3 c=mix(vec3(.26,.72,.77),vec3(.99,.91,.63),glint);
        gl_FragColor=vec4(c,reflection*edge*(.24+.76*sunlight));
      }`);
    pool.rotation.x=-Math.PI/2;
    pool.position.set(f.x,f.base+.675,f.z);
    pool.renderOrder=7;

    const rays=layer(new THREE.PlaneGeometry(19,16),`
      void main(){
        float s=p.x+.37*p.y;
        float bands=exp(-pow((s-.46)*19.,2.))*.62+exp(-pow((s-.60)*34.,2.))
                   +exp(-pow((s-.77)*22.,2.))*.52;
        float a=bands*smoothstep(.02,.44,p.y)*(1.-smoothstep(.81,1.,p.y));
        a*=.55+.45*cloud(vec2(p.x*6.,p.y*2.)+vec2(t*.060,0.));
        gl_FragColor=vec4(.99,.78,.44,a*.15*sunlight);
      }`,{blending:THREE.AdditiveBlending});
    rays.position.set(f.x-4,f.base+5.1,f.z-4.3);
    const count=76, points=new Float32Array(count*3);
    const rng=seeded(372);
    for(let i=0;i<count;i++){
      points[i*3]=(rng()-.5)*22;points[i*3+1]=.5+rng()*5.2;points[i*3+2]=(rng()-.5)*16;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(points,3));
    const motes=new THREE.Points(geo,new THREE.ShaderMaterial({
      uniforms:{t:time,sunlight},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:`uniform float t;varying float light;void main(){vec3 q=position;
        float k=position.x*2.4+position.z;q.x+=sin(t*.36+k)*.47;q.y+=sin(t*.62+k)*.36;
        q.z+=cos(t*.24+k)*.24;vec4 eye=modelViewMatrix*vec4(q,1.);
        gl_Position=projectionMatrix*eye;gl_PointSize=clamp(68./-eye.z,1.,3.8);
        light=.2+.65*pow(.5+.5*sin(t*1.3+k),2.);}`,
      fragmentShader:`uniform float sunlight;varying float light;void main(){float r=length(gl_PointCoord-.5)*2.;
        gl_FragColor=vec4(1.,.84,.53,(1.-smoothstep(.22,1.,r))*light*sunlight);}`
    }));
    motes.position.set(f.x,f.base,f.z);
    group.add(motes);
  }

  function seeded(seed){
    return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  }

  function buildBank(b) {
    const rng=seeded(514);
    const terrain=b.group.children.find(mesh=>mesh.name==='Actual level ground and carved water banks');
    if(!terrain)return;
    const banks=b.terrainJoin?[terrain,b.terrainJoin]:[terrain];
    const field=battlefieldFootprint(b.group),inLane=battleLane(b.group,field,b),bounds=new THREE.Box3();
    for(const mesh of banks)mesh.updateWorldMatrix(true,false);
    const ray=new THREE.Raycaster(),down=V3(0,-1,0);
    function bed(x,z){
      ray.set(b.group.localToWorld(V3(x,70,z)),down);
      const top=ray.intersectObjects(banks,false)[0];
      return top?b.group.worldToLocal(top.point).y:null;
    }
    const rockRows=[];
    const shore=x=>apronEdge113(b,x)+1.1;
    // Clustered, low wet stones interrupt the silhouette at the waterline.
    const clusters=[[-23,1.1],[-14,.44],[-9.4,.84],[-5.1,.32],[-1.6,.57],[2.4,.26],[6.7,1.05],[12.7,.37],[17.2,.84],[26,.60]];
    for(const [x,scale] of clusters){
      const z=shore(x)+.62+rng()*.58;
      for(let j=0;j<7;j++){
        const xx=x+(rng()-.5)*3.7*scale,zz=z+(rng()-.5)*1.4,s=scale*(j===0?.55:.10+rng()*.32);
        const sx=s*(1.1+rng()),sy=s*(.42+rng()*.54),sz=s*.9,radius=Math.hypot(sx,sy,sz)*1.22;
        if(!supportedRear113(b,xx,zz,radius)||!onDistantBattleBank(field,xx-radius,xx+radius,zz+radius))continue;
        const h=bed(xx,zz);
        if(h===null)continue;
        bounds.min.set(xx-radius,h-sy,zz-radius);bounds.max.set(xx+radius,h+sy,zz+radius);
        if(!inLane(bounds))rockRows.push([xx,h-s*.18,zz,sx,sy,sz,rng()*6,rng()]);
      }
    }
    const stoneGeo=new THREE.IcosahedronGeometry(1,1), stoneMat=new THREE.MeshStandardMaterial({
      roughness:.68,metalness:.04,color:'#f3e5bf',
      map:textures.env62_stone??null
    });
    const stoneVertices=stoneGeo.attributes.position;
    for(let i=0;i<stoneVertices.count;i++){
      const x=stoneVertices.getX(i),y=stoneVertices.getY(i),z=stoneVertices.getZ(i);
      const cut=1+.13*Math.sin(x*4+z*2.1)+.10*Math.cos(y*5.1-z*3.8);
      stoneVertices.setXYZ(i,x*cut+.13*y,Math.min(.78,y*cut+.07*x),z*cut);
    }
    stoneGeo.computeVertexNormals();
    stoneMat.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 stonePoint,stoneNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nstoneNormal=normal;stonePoint=(instanceMatrix*vec4(position,1.)).xyz;');
      shader.fragmentShader='varying vec3 stonePoint,stoneNormal;\n'+noise.replace(/\b(hash|n|cloud)\b/g,name=>'rock'+name)+'\n'+shader.fragmentShader.replace('#include <map_fragment>',
        `#include <map_fragment>
        float patina=rockcloud(stonePoint.xz*2.5);
        float cap=smoothstep(.23,.84,stoneNormal.y+patina*.58-.3);
        diffuseColor.rgb=mix(diffuseColor.rgb*.84,diffuseColor.rgb*vec3(.82,.97,.69)+vec3(.015,.020,.005),cap*.67);`);
    };
    const stones=new THREE.InstancedMesh(stoneGeo,stoneMat,rockRows.length),dummy=new THREE.Object3D();
    const tint=new THREE.Color();
    rockRows.forEach(([x,y,z,sx,sy,sz,angle,t],i)=>{
      dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(.12,angle,.22*t);dummy.updateMatrix();
      stones.setMatrixAt(i,dummy.matrix);stones.setColorAt(i,tint.setHSL(.15+t*.09,.10+t*.07,.51+t*.31));
    });
    stones.name='Silverfall shoreline stones';stones.receiveShadow=true;group.add(stones);
    const leaves=[],colors=[];
    for(const [x,scale] of clusters.filter((_,i)=>i%3!==0)){
      for(let j=0;j<13;j++){
        const a=rng()*Math.PI*2,r=.18+rng()*.46,xx=x+Math.cos(a)*r,zz=shore(x)+Math.sin(a)*r+.25;
        if(!onDistantBattleBank(field,xx-.25,xx+.25,zz+.25))continue;
        const y=bed(xx,zz);if(y===null)continue;
        const h=(.29+rng()*.42)*Math.max(.65,scale),w=.018+rng()*.026;
        leaves.push(xx-w,y,zz,xx+w,y,zz,xx+Math.cos(a)*.19,y+h,zz+Math.sin(a)*.18);
        colors.push(.11,.17,.065,.11,.19,.07,.50,.52+rng()*.14,.20);
      }
    }
    const blades=new THREE.BufferGeometry();blades.setAttribute('position',new THREE.Float32BufferAttribute(leaves,3));
    blades.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));blades.computeVertexNormals();
    group.add(new THREE.Mesh(blades,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})));

  }

  function makeStrike(){
    hitMesh=layer(new THREE.PlaneGeometry(1,1),`void main(){
      vec2 q=(p-.5)*2.;float radius=length(q);
      float life=pow(max(0.,1.-age),1.8);
      float u=clamp(q.x/.96,0.,1.), taper=pow(1.-u,.78);
      float bend=.25*sin(u*2.6)+.04*u,side=abs(q.y-bend);
      float trail=smoothstep(-.03,.06,q.x)*(1.-smoothstep(.83,.98,q.x));
      float arc=exp(-pow(side/(.009+.073*taper),2.))*trail*taper;
      float filament=exp(-pow((q.y-bend-.045*taper)/.012,2.))*trail*taper;
      float core=exp(-radius*28.);float ray=exp(-abs(q.y+q.x*.48)*100.)*exp(-abs(q.x)*8.);
      float sparks=0.;for(int i=0;i<12;i++){float iF=float(i),a=iF*2.399+.75;
        vec2 d=vec2(cos(a),sin(a));float distance=(.11+age*.64)*(.45+fract(iF*.618));
        vec2 v=q-d*distance;float along=dot(v,d),side=dot(v,vec2(-d.y,d.x));
        sparks+=exp(-along*along*500.-side*side*13000.);}
      float ring=exp(-abs(radius-(.18+age*.58))*43.)*(.52+.48*cos(atan(q.y,q.x+.00001)*6.-age*3.));
      vec3 c=impactTint*mix(arc,ring,magicImpact)+mix(impactTint,vec3(1.),.65)*filament*(1.-magicImpact);
      float back=clamp(-q.x,0.,1.);
      float sweep=exp(-pow((q.y+.40*back-.19*back*back)/(.014+.055*back),2.));
      sweep*=smoothstep(.015,.12,back)*(1.-smoothstep(.5,.91,back));
      c+=mix(impactTint,vec3(1.),.25)*sweep*(1.-magicImpact);
      float wake=exp(-pow((q.y-bend+.105*taper)/(.013+.032*taper),2.))*trail*taper;
      float needle=exp(-abs(q.y+.28*q.x)*115.)*exp(-abs(q.x)*4.1);
      float cross=exp(-abs(q.x-q.y*.20)*142.)*exp(-abs(q.y)*7.3);
      float shoulder=exp(-radius*7.5);
      c+=impactTint*(wake*(1.-magicImpact)*.82+shoulder*.58);
      c+=mix(vec3(1.,.55,.17),impactTint,.45+.55*magicImpact)*sparks*.90;
      c+=mix(impactTint,vec3(1.,.98,.87),.78)*(core*1.85+ray+needle*.96+cross*.72);
      gl_FragColor=vec4(c,life*(1.-smoothstep(.87,.995,max(abs(q.x),abs(q.y)))));
    }`,{blending:THREE.AdditiveBlending});
    hitMesh.visible=false;hitMesh.renderOrder=19;
  }

  // Use the existing depth reconstruction. Sun breaks move over land in
  // metres, so panning the camera never drags a cloud across the screen.
  const originalPost=setupPost;
  setupPost=function(...args){
    const result=originalPost.apply(this,args), material=post.material;
    Object.assign(material.uniforms,{landscapeLight:landscape,directLight:sunlight,basinXZ:fountain,basinPresent:hasFountain});
    Object.assign(material.uniforms,{storyLights:{value:storyLights},storyTints:{value:storyTints},storyPower,storyTime:time,contactScreen,contactStrength});
    Object.assign(material.uniforms,bounceUniforms);
    material.fragmentShader='uniform vec4 storyLights[4],storyTints[4];uniform float storyPower,storyTime,contactStrength;uniform vec2 contactScreen;\n'+groundPattern+material.fragmentShader;
    material.fragmentShader=bounceShader+'\nuniform float landscapeLight,directLight,basinPresent;uniform vec2 basinXZ;\n'+material.fragmentShader;
    const end=material.fragmentShader.lastIndexOf('}');
    material.fragmentShader=material.fragmentShader.slice(0,end)+`
      if(landscapeLight>.5){
        vec3 ink=gl_FragColor.rgb;
        float lum=dot(ink,vec3(.22,.70,.08)), high=smoothstep(.25,.85,lum);
        vec3 tone=mix(vec3(.82,.91,1.06),vec3(1.11,1.045,.94),high);
        vec3 paint=mix(vec3(lum),ink,.95)*mix(vec3(.98,1.,1.025),tone,.43+.57*directLight);
        vec3 pos=(poiCamera55*vec4(centre55,1.)).xyz;
        float solid=1.-smoothstep(nearFar.y*.86,nearFar.y*.98,d);
        if(landscapeLight<1.5){
          vec2 canopy=pos.xz*.23+pos.y*vec2(-.14,.085);
          canopy+=vec2(sin(time*.33+canopy.y),cos(time*.24+canopy.x))*.037;
          float leaves=.65*poiNoise55(canopy)+.35*poiNoise55(canopy*2.17);
          float gaps=smoothstep(.28,.72,leaves+.09*cos(pos.x*.79+pos.z*.31));
          vec2 edge=pos.xz-basinXZ-vec2(0.,2.);
          gaps=max(gaps,basinPresent*.90*exp(-dot(edge,edge)*.043));
          vec3 sunPatch=paint*mix(vec3(.71,.80,.95),vec3(1.18,1.095,.94),gaps);
          sunPatch+=vec3(.073,.045,.008)*gaps*smoothstep(.2,.75,lum);
          paint=mix(paint,sunPatch,solid*directLight*(1.-smoothstep(58.,130.,d)));
        }else{
          vec2 field=pos.xz*.047+vec2(time*.009,-time*.003);
          float opening=smoothstep(.30,.69,.72*poiNoise55(field)+.28*poiNoise55(field*2.7));
          float meadow=smoothstep(.015,.19,ink.g-max(ink.r,ink.b));
          vec3 valley=paint*mix(vec3(.72,.85,.97),vec3(1.16,1.08,.87),opening);
          valley+=meadow*opening*vec3(.053,.029,.001);
          float dust=smoothstep(focus+4.,focus+100.,d)*(.58+.42*poiNoise55(pos.xz*.024));
          vec3 haze=mix(vec3(.46,.61,.72),vec3(.79,.77,.63),opening*directLight);
          paint=mix(paint,valley,directLight*solid);
          paint=mix(paint,haze,solid*dust*(.055+.12*directLight));
        }
        gl_FragColor.rgb=paint;
      }
      if(storyPower>.001){
        vec3 ground=(poiCamera55*vec4(centre55,1.)).xyz;
        float upward=smoothstep(.40,.86,(mat3(poiCamera55)*normal55).y);
        for(int i=0;i<4;i++){
          vec4 source=storyLights[i],tint=storyTints[i];
          float age=(storyTime-source.w)/.68;
          if(age<0.||age>=1.)continue;
          vec3 delta=ground-source.xyz;
          float surface=upward*(1.-smoothstep(.35,1.2,abs(delta.y)));
          float glow=spellGlow(delta.xz/abs(tint.w),age,step(0.,tint.w));
          gl_FragColor.rgb+=tint.rgb*glow*surface*storyPower*(1.-gl_FragColor.rgb)*.76;
        }
      }
      if(contactStrength>.001){
        vec2 delta=(vUv-contactScreen)*vec2(resolution.x/max(1.,resolution.y),1.);
        float local=exp(-dot(delta,delta)*27.);
        gl_FragColor.rgb*=1.-contactStrength*(1.-local)*.13;
        gl_FragColor.rgb+=contactStrength*local*gl_FragColor.rgb*(1.-gl_FragColor.rgb)*.24;
      }
      if(bounceCount>0)gl_FragColor.rgb=battleBounce(gl_FragColor.rgb,(poiCamera55*vec4(centre55,1.)).xyz);
    }`;
    material.needsUpdate=true;
    return result;
  };

  // Ochre along the trail and cooler turf beside it keep the route legible
  // at travel scale. Reuse the road mask from the actual terrain mesh.
  const originalGround=groundMaterial102;
  groundMaterial102=function(material){
    const result=originalGround.apply(this,arguments);
    if(activeScene?.kind!=='overworld'||!material?.userData.ground102||material.userData.travelPigment)return result;
    material.userData.travelPigment=true;
    const compile=material.onBeforeCompile, cacheKey=material.customProgramCacheKey();
    material.onBeforeCompile=function(shader,...args){
      compile.call(this,shader,...args);
      shader.fragmentShader=shader.fragmentShader.replace('float lum=dot(result,vec3(.2126,.7152,.0722));',`
        float dryGrass=(1.-path)*(1.-smoothstep(.10,.43,slope))*(1.-max(max(climate.r,climate.g),max(climate.b,climate.a)));
        float field= smoothstep(.22,.79,noiseWorld102(p.xz*.067+14.));
        result*=mix(vec3(1.),mix(vec3(.75,.85,.92),vec3(1.11,1.06,.87),field),dryGrass);
        result*=mix(vec3(1.),vec3(1.14,1.055,.91),path);
        float lum=dot(result,vec3(.2126,.7152,.0722));`);
    };
    material.customProgramCacheKey=()=>cacheKey+'-travel-pigment';
    material.needsUpdate=true;
    return result;
  };

  // Scattered sedges give the waterline a broken silhouette at travel scale.
  // The shore index already knows which side is water and where bridges cross.
  const nativeBanks=dressRiverbanks103;
  dressRiverbanks103=function(...args){
    const result=nativeBanks.apply(this,args);
    if(activeScene?.kind!=='overworld'||world.userData.riverSedges)return result;
    const edges=new Set([...traversalShoreCells.values()].flat()), rng=seeded(8041);
    const positions=[],colours=[];
    for(const e of edges){
      const length=Math.sqrt(e.length2);
      if(length<.6)continue;
      const samples=Math.ceil(length/7);
      for(let k=0;k<samples;k++){
        const t=(k+.15+rng()*.70)/samples;
        const x=e.x+e.dx*t,z=e.z+e.dz*t;
        if(Math.sin(x*.12+Math.cos(z*.09))<-.24||rng()<.25)continue;
        const side=traversalWet(x+e.dz/length,z-e.dx/length)?-1:1;
        const nx=side*e.dz/length,nz=-side*e.dx/length;
        if(macroRoadInfo15(x,z).d<5||spans38.some(b=>{
          const p=bridgeLocal15(b,x,z);return Math.abs(p.u)<b.length*.5+4&&Math.abs(p.v)<b.width*.5+2;
        }))continue;
        for(let j=0;j<6;j++){
          const inland=.25+rng()*1.25,along=(rng()-.5)*3.1;
          const xx=x+nx*inland+e.dx/length*along,zz=z+nz*inland+e.dz/length*along;
          if(traversalWet(xx,zz))continue;
          const y=macroGround(xx,zz)-.04,h=.32+rng()*.85,angle=rng()*Math.PI*2;
          const w=.065+rng()*.06,dx=Math.cos(angle),dz=Math.sin(angle);
          positions.push(xx-w*dz,y,zz+w*dx,xx+w*dz,y,zz-w*dx,xx+dx*.29,y+h,zz+dz*.29);
          colours.push(.08,.15,.05,.12,.20,.07,.39+rng()*.18,.47+rng()*.12,.18);
        }
      }
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
    geo.computeVertexNormals();
    const reeds=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({side:THREE.DoubleSide,vertexColors:true}));
    reeds.receiveShadow=true;reeds.name='Riverbank sedges';world.add(reeds);world.userData.riverSedges=reeds;
    return result;
  };

  // Frame the opening from the bridge parapet while the party is talking.
  const originalCamera=updateCamera, bridgeLook=V3(), bridgeOffset=V3(9,6,10);
  updateCamera=function(...args){
    const result=originalCamera.apply(this,args);
    if(!player||!dialogue||battle||activeScene?.key!=='brookstead'||currentBeat()[0]!=='arrival')return result;
    if(Math.hypot(player.x+142.3,player.z-120)>3.5)return result;
    bridgeLook.set(player.x,heightAt(player.x,player.z)+1.28,player.z);
    camera.position.copy(bridgeLook).add(bridgeOffset);
    camera.fov=camera.aspect<.85?46:34;camera.lookAt(bridgeLook);
    camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
    focusPoint.copy(bridgeLook);post.material.uniforms.focus.value=bridgeOffset.length();
    faceNativeHumanoids66();
    return result;
  };

  const stageColour={value:new THREE.Vector3(1,1,1)};
  const originalArenaPost=makeArenaPost89;
  makeArenaPost89=function(...args){
    const pass=originalArenaPost.apply(this,args), m=pass.material;
    if(m.uniforms.stageColour)return pass;
    m.uniforms.stageColour=stageColour;
    Object.assign(m.uniforms,bounceUniforms,{contactScreen,contactStrength,
      bounceInverse:{value:camera.projectionMatrixInverse},bounceCamera:{value:camera.matrixWorld}});
    m.fragmentShader=bounceShader+'\nuniform mat4 bounceInverse,bounceCamera;uniform vec3 stageColour;uniform vec2 contactScreen;uniform float contactStrength;\n'+m.fragmentShader
      .replace('texture2D(gaussianImage132,v).rgb,coc*','texture2D(gaussianImage132,v).rgb,coc*(1.-.82*farFocus)*');
    const end=m.fragmentShader.lastIndexOf('}');
    m.fragmentShader=m.fragmentShader.slice(0,end)+`
      vec3 ink=gl_FragColor.rgb;
      float lum=dot(ink,vec3(.22,.70,.08)), high=smoothstep(.23,.85,lum);
      vec3 tone=mix(vec3(.83,.93,1.07),stageColour,high);
      vec3 paint=mix(vec3(lum),ink,.96)*tone;
      // Preserve a bright subject plane surrounded by quieter distant paint.
      float castPlane=(1.-farFocus)*(1.-nearFocus);
      paint+=ink*(vec3(1.)-ink)*castPlane*.13;
      vec2 delta=(v-contactScreen)*vec2(pixels.x/max(1.,pixels.y),1.);
      float centre=exp(-dot(delta,delta)*27.);
      paint*=1.-contactStrength*(1.-centre)*(.14+.12*farFocus);
      paint+=contactStrength*centre*castPlane*ink*(vec3(1.)-ink)*.26;
      gl_FragColor.rgb=paint;
      if(bounceCount>0){
        vec4 eye=bounceInverse*vec4(v*2.-1.,texture2D(depth,v).r*2.-1.,1.);
        gl_FragColor.rgb=battleBounce(paint,(bounceCamera*vec4(eye.xyz/eye.w,1.)).xyz);
      }
    }`;
    m.needsUpdate=true;
    return pass;
  };

  const originalImpact=chainImpact141;
  chainImpact141=function(combo,position,strong){
    const result=originalImpact.apply(this,arguments);
    if(!battle||!hitMesh||owner!==(encounter53.active?arena88.current?.group:world))return result;
    const point=chainImpactPosition141(combo,position);
    strikeWorld.copy(point);contactWorld.copy(point);contactAt=clock;contactPower=strong?1:.56;
    // Move the ribbon just in front of the sprite plane so the drawn impact
    // stays visible across both screen-facing fighters and large enemy meshes.
    camera.getWorldDirection(viewAxis);point.addScaledVector(viewAxis,-.42);
    hitMesh.position.copy(group.worldToLocal(point));
    const arc=combo.id==='bren'||combo.id==='tavin';
    magicImpact.value=arc?0:1;
    if(combo.id==='bren')impactTint.value.set(.22,.70,1.);
    else if(combo.id==='lysa')impactTint.value.set(1.,.35,.12);
    else if(combo.id==='tavin')impactTint.value.set(1.,.70,.22);
    else if(combo.id==='soren')impactTint.value.set(.59,.30,1.);
    else impactTint.value.set(.23,.95,.64);
    hitMesh.quaternion.copy(camera.quaternion);
    const side=combo.target.actor.x>=combo.actor.x?1:-1;
    hitMesh.rotateZ(side*([.23,-.26,.44][combo.step]??0));
    const size=strong?6.8:4.1;
    hitMesh.scale.set(size*side,size,1);
    struckAt=clock;
    return result;
  };

  const spellColours={
    fire:[1.,.26,.035],ice:[.20,.72,1.],arcane:[.57,.24,1.],
    ascend:[1.,.67,.22],ward:[.27,.52,1.],heal:[.20,1.,.52],wardheal:[.30,1.,.67]
  };
  const pools=[];
  let nextPool=0;
  function spellPool(){
    const mesh=layer(new THREE.PlaneGeometry(1,1),groundPattern+`
      uniform vec3 element;uniform float born,pattern;
      void main(){
        float u=clamp((t-born)/.68,0.,1.);
        gl_FragColor=vec4(element*spellGlow((p-.5)*2.,u,pattern),1.);
      }`,{blending:THREE.AdditiveBlending});
    Object.assign(mesh.material.uniforms,{element:{value:V3()},born:{value:0},pattern:{value:0}});
    mesh.rotation.x=-Math.PI/2;mesh.renderOrder=6;
    return mesh;
  }
  const originalCast=castFX;
  castFX=function(kind,from,to,strong,...args){
    const result=originalCast.call(this,kind,from,to,strong,...args);
    const arena=encounter53.active?arena88.current:null,tint=spellColours[kind];
    if(!battle||!tint||!group||owner!==(arena?.group??world))return result;
    contactWorld.copy(to);contactAt=clock;contactPower=strong?.85:.65;
    if(!arena){
      const slot=storyCursor++%storyLights.length;
      storyLights[slot].set(to.x,heightAt(to.x,to.z)+.045,to.z,clock);
      const healing=kind==='heal'||kind==='wardheal';
      storyTints[slot].set(...tint,(healing?1:-1)*(strong?3.6:2.65));
      lastStoryLight=clock;
      return result;
    }
    // Reuse at most four patches for party-wide healing and simultaneous hits.
    const slot=nextPool++%4,mesh=pools[slot]??(pools[slot]=spellPool());
    mesh.position.copy(group.worldToLocal(to.clone()));
    mesh.position.y=arenaHeight88(arena,mesh.position.x,mesh.position.z)+.065;
    mesh.scale.setScalar(strong?7.2:5.3);mesh.visible=true;
    const u=mesh.material.uniforms;
    u.element.value.set(...tint);u.born.value=clock;u.pattern.value=kind==='heal'||kind==='wardheal'?1:0;
    return result;
  };
  function clearLayers(){
    if(!group)return;
    group.removeFromParent();
    group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();if(o.isInstancedMesh)o.dispose();});
    group=null;owner=null;hitMesh=null;struckAt=contactAt=-Infinity;pools.length=0;nextPool=0;
  }
  const originalRender=render;
  render=function(...args){
    const arena=encounter53.active?arena88.current:null;
    const outdoor=!!player&&usesLandscapeLight54();
    const basin=outdoor&&activeScene.key==='brookstead'&&world?.userData.fountain123;
    const story=battle&&!encounter53.active?battle:null;
    const next=arena?.group||((basin||story)?world:null);
    if(activeStory!==story){
      if(hiddenCasters.size){
        for(const mesh of hiddenCasters)mesh.castShadow=true;
        hiddenCasters.clear();refreshStoryShadows();
      }
      storyCasters=[];
      if(story)world.traverse(mesh=>{
        if(mesh.isMesh&&mesh.castShadow&&'viewHidden' in mesh.userData)storyCasters.push(mesh);
      });
      activeStory=story;lastStoryLight=struckAt=contactAt=-Infinity;
      for(const light of storyLights)light.w=-1000;
    }
    landscape.value=outdoor?(activeScene.kind==='overworld'?2:1):0;
    sunlight.value=activeScene?.key==='depths'?0:celestial31.day.value*(1.-weather.rain.value*.89)*(1.-weather.cloud.value*.32);
    hasFountain.value=basin?1:0;
    if(basin)fountain.value.set(basin.x,basin.z);
    if(next!==owner){
      clearLayers();
      if(next){
        owner=next;group=new THREE.Group();group.name='Landscape light and impact detail';
        group.userData.dynamicFX=true;owner.add(group);
        if(arena){
          const palette=BATTLE_STAGES53[encounter53.selected];
          const fill=new THREE.Color(palette?.key??'#ffffff');
          stageColour.value.set(1.02+fill.r*.07,1.02+fill.g*.04,.98+fill.b*.07);
          if(encounter53.selected==='waterfall')buildBank(arena);
          makeStrike();
        }else if(basin)buildTown(basin);
      }
    }
    if(story&&group&&!hitMesh)makeStrike();
    time.value=clock;
    const elapsed=clock-contactAt;
    const quiet=reducedMotion.matches||state?.settings?.motion===false;
    updateBounce(quiet);
    storyPower.value=story&&clock-lastStoryLight<.68 ? (quiet ? .55 : 1) : 0;
    contactStrength.value=arena||story?contactPower*(1.-smooth(.02,.40,elapsed)):0;
    if(quiet)contactStrength.value*=.35;
    if(contactStrength.value>.001){
      projected.copy(contactWorld).project(camera);
      contactScreen.value.set(projected.x*.5+.5,projected.y*.5+.5);
    }
    if(hitMesh){hitAge.value=Math.max(0,(clock-struckAt)/.43);hitMesh.visible=hitAge.value<1;}
    for(const m of pools)if(clock-m.material.uniforms.born.value>=.68)m.visible=false;
    return originalRender.apply(this,args);
  };
})();
