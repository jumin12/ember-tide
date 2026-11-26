// Exterior illumination uses the already-rendered surfaces, shadow volume,
// lamp irradiance map and Elder Light. These passes never build scene geometry.
(() => {
  const enabled={value:0}, sunlight={value:0}, twilight={value:0};
  const crystal={value:new THREE.Vector4(0,0,0,0)}, corePosition=new THREE.Vector3();
  const crystalPulse={value:1}, effectTime={value:0}, fountainBase={value:0};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');

  // Apply after the existing lens, using its per-pixel depth and surface normal.
  const setupBefore=setupPost;
  setupPost=function(...args){
    const result=setupBefore.apply(this,args), m=post.material;
    Object.assign(m.uniforms,{extLighting:enabled,extSunStrength:sunlight,extSun:weather.sun,
      extDay:celestial31.day,extTwilight:twilight,extRain:weather.rain,
      extLampField:lampField33.map,extLampBounds:lampField33.bounds,
      extCrystal:crystal,extPulse:crystalPulse,extTime:effectTime,extFountainBase:fountainBase});
    const shader=m.fragmentShader;
    const end=shader.lastIndexOf('}');
    m.fragmentShader=`uniform float extLighting,extSunStrength,extDay,extTwilight,extRain,extPulse,extTime,extFountainBase;
      uniform vec3 extSun;uniform vec4 extLampBounds,extCrystal;uniform sampler2D extLampField;
    `+shader.slice(0,end)+`
      if(extLighting>.5){
        bool local=extLighting<1.5;
        vec3 worldPos=(poiCamera55*vec4(centre55,1.)).xyz;
        vec3 N=mat3(poiCamera55)*normal55;
        vec3 color=gl_FragColor.rgb;
        float luma=dot(color,vec3(.22,.69,.09));
        float skyMask=1.-smoothstep(nearFar.y*.88,nearFar.y*.99,d);
        float incidence=max(0.,dot(N,extSun));
        float visibleSun=extSunStrength*smoothstep(.065,.55,luma)*(.32+.68*incidence);
        float shade=(1.-smoothstep(.13,.61,luma));
        float night=1.-extDay;

        // Warm bounce follows lit surfaces. Skylight lifts deep shade and
        // keeps blue-hour silhouettes legible around the party.
        vec3 warm=mix(vec3(.115,.075,.020),vec3(.22,.105,.02),extTwilight);
        color+=warm*visibleSun*(1.-color)*skyMask;
        color+=vec3(.025,.052,.092)*shade*(.42+night*.85+extRain*.28)*skyMask;
        color*=1.-vec3(.045,.013,0.)*shade*(.5+.5*extDay);

        // The same shadow-marched light volume used by the original game
        // supplies shaft visibility. Depth stops the veil at the first surface.
        float scale=local?1.:3.;
        float farAir=smoothstep(focus+3.*scale,focus+48.*scale,d)*skyMask;
        vec3 airTint=mix(vec3(.48,.63,.77),vec3(.86,.71,.49),extTwilight);
        airTint=mix(vec3(.20,.30,.46),airTint,extDay);
        float vapor=(.085+.14*extTwilight+.10*extRain)*farAir;
        color=mix(color,airTint,vapor);
        vec3 rays=max(vec3(0.),haze35.rgb-broad35*.68);
        color+=min(rays,vec3(.12))*(.45+.75*extTwilight)*extSunStrength*(1.-color);

        if(local){
          vec2 lampUV=(worldPos.xz-extLampBounds.xy)/max(extLampBounds.zw,vec2(.01));
          vec4 lamp=texture2D(extLampField,clamp(lampUV,0.,1.));
          vec2 border=min(lampUV,1.-lampUV);
          float support=smoothstep(0.,.008,min(border.x,border.y));
          float heightAtten=exp(-abs(worldPos.y-(lamp.a*192.-32.))*.43);
          float lamplight=lamp.r*lamp.r*heightAtten*support*(night+.21*extTwilight)*skyMask;
          vec3 reflected=vec3(.43,.225,.085)*(.20+sqrt(max(vec3(0.),color)));
          color+=reflected*lamplight*.22*(.46+.54*max(0.,N.y))*(1.-color);
          if(basinPresent>.5){
            // Fold the original eight jets into one sector to measure distance
            // to the nearest real point of impact inside the circular basin.
            vec2 offset=worldPos.xz-basinXZ;float r=length(offset);
            float water=(1.-smoothstep(2.13,2.20,r))*(1.-smoothstep(.05,.18,abs(worldPos.y-extFountainBase-.64)));
            if(water>.001){
              float angle=atan(offset.y,offset.x+.00001);
              float jet=floor(angle/.78539816+.5)*.78539816;
              float reach=length(offset-1.8*vec2(cos(jet),sin(jet)));
              float phase=reach*2.35-extTime*.91;
              float edge=abs(fract(phase+.5)-.5);
              float wave=(1.-smoothstep(.04,.09+min(.18,fwidth(phase)),edge));
              wave*=smoothstep(.025,.13,reach)*(1.-smoothstep(.44,.89,reach));
              color+=water*wave*(.22+.78*extSunStrength)*vec3(.24,.38,.37)*(1.-color);
            }
          }
          if(extCrystal.w>.0){
            vec3 delta=worldPos-extCrystal.xyz;
            float dist2=dot(delta.xz,delta.xz);
            float facing=max(0.,dot(N,-delta/max(.01,length(delta))));
            float pool=exp(-dist2*.051-abs(delta.y)*.17)*(.15+.85*facing)*skyMask;
            vec3 eye=poiCamera55[3].xyz,ray=normalize(worldPos-eye),axis=extCrystal.xyz-eye;
            float t=dot(axis,ray);
            float occ=step(.05,t)*smoothstep(-1.5,.4,length(worldPos-eye)-t);
            vec3 radial=(axis-t*ray)*vec3(.82,.55,.82);
            float halo=exp(-.62*dot(radial,radial))*occ;
            color+=vec3(.14,.74,.69)*(pool*.65+halo*.37)*extCrystal.w*extPulse*(1.-color);
          }
        }
        gl_FragColor.rgb=color;
      }
    }`;
    m.needsUpdate=true;
    return result;
  };

  const renderBefore=render;
  render=function(...args){
    const outside=player&&usesLandscapeLight54()&&!battle&&state.mode!=='title';
    enabled.value=outside?(activeScene.kind==='overworld'?2:1):0;
    const animated=!motion.matches&&state?.settings?.motion!==false;
    effectTime.value=animated?clock:0;
    const e=celestial31.sun.value.y;
    twilight.value=(1.-smooth(.05,.67,e))*smooth(-.14,.11,e);
    sunlight.value=activeScene?.key==='depths'?0:celestial31.day.value*(1.-.84*weather.rain.value)*(1.-.46*weather.cloud.value);
    crystal.value.w=0;
    if(enabled.value===1){
      fountainBase.value=world.userData.fountain123?.base??0;
      const site=world.userData.lightSites?.[0];
      if(site?.core&&site.core.visible&&site.group.visible){
        site.core.getWorldPosition(corePosition);
        crystal.value.set(corePosition.x,corePosition.y,corePosition.z,1);
        crystalPulse.value=animated ? .94+.06*Math.sin(clock*1.22) : 1;
      }
    }
    return renderBefore.apply(this,args);
  };

  // Paving already has a material mask in local terrain. Rain darkens wet
  // stone and catches skylight at grazing angles, following its live normals.
  const groundBefore=groundMaterial102;
  groundMaterial102=function(m){
    const result=groundBefore.apply(this,arguments);
    if(activeScene?.kind!=='poi'||!m?.userData.ground102||m.userData.rainSheen)return result;
    m.userData.rainSheen=true;
    const compile=m.onBeforeCompile,cache=m.customProgramCacheKey();
    m.onBeforeCompile=function(s,...args){
      compile.call(this,s,...args);
      if(!s.fragmentShader.includes('vGroundBlend'))return;
      Object.assign(s.uniforms,{extWaterMode:enabled,stoneRain:weather.rain,stoneDay:celestial31.day});
      s.fragmentShader='uniform float extWaterMode,stoneRain,stoneDay;\n'+s.fragmentShader.replace('#include <tonemapping_fragment>',`
        if(extWaterMode==1.&&stoneRain>.01){
          float wet=clamp(vGroundBlend.y*vGroundBlend.x,0.,1.)*stoneRain;
          float fresnel=pow(1.-abs(dot(normal,normalize(vViewPosition))),2.);
          float joints=smoothstep(.12,.55,dot(diffuseColor.rgb,vec3(.22,.69,.09)));
          gl_FragColor.rgb*=1.-wet*.21;
          gl_FragColor.rgb+=wet*(.17+.83*fresnel)*(.28+.72*joints)*mix(vec3(.05,.09,.14),vec3(.21,.29,.34),stoneDay);
        }
        #include <tonemapping_fragment>`);
    };
    m.customProgramCacheKey=()=>cache+'-wet-stone';m.needsUpdate=true;return result;
  };

  // Reflections use the water's original moving normal and light direction.
  // The half-vector response breaks across wave crests as the camera moves.
  const waterBefore=waterMaterial62;
  waterMaterial62=function(...args){
    const m=waterBefore.apply(this,args);
    if(!['poi','overworld'].includes(activeScene?.kind)||!m.userData.water62)return m;
    const compile=m.onBeforeCompile,cache=m.customProgramCacheKey();
    m.onBeforeCompile=function(s,...params){
      compile.call(this,s,...params);
      s.uniforms.exteriorWater=enabled;
      s.fragmentShader='uniform float exteriorWater;\n'+s.fragmentShader.replace('#include <tonemapping_fragment>',`
        if(exteriorWater>.5){
          float sheen=pow(max(0.,dot(worldN62,half62)),33.);
          float facet=smoothstep(.30,.77,dot(vec2(waveX62,waveZ62),vec2(.42,-.63))+.47);
          float soft=pow(1.-clamp(dot(worldN62,view62),0.,1.),2.);
          float waterLight=(1.-.78*cloud62)*(1.-.78*foam62)*(cascade62>.5?.3:1.);
          gl_FragColor.rgb+=(key62*(.055+.31*facet)*sheen*keyPower62+
            vec3(.032,.088,.13)*(.23+soft)*(.25+.75*day62))*waterLight;
        }
        #include <tonemapping_fragment>`);
    };
    m.customProgramCacheKey=()=>cache+'-exterior-reflection';m.needsUpdate=true;return m;
  };

  const atlasBefore=prepareAtlasLens119;
  prepareAtlasLens119=function(...args){
    const q=atlasBefore.apply(this,args),m=q.composite;
    if(m.uniforms.atlasSunDirection)return q;
    Object.assign(m.uniforms,{atlasSunDirection:weather.sun,atlasWarmth:twilight});
    m.fragmentShader='uniform vec3 atlasSunDirection;uniform float atlasWarmth;\n'+m.fragmentShader.replace(
      'gl_FragColor=vec4(max(vec3(0.),col),1.);',`
        vec3 plane=cross(dFdx(world),dFdy(world));
        vec3 face=plane/max(.00001,length(plane));if(face.y<0.)face=-face;
        float surface=1.-step(.999999,raw);
        float sunward=max(0.,dot(face,atlasSunDirection));
        float illuminated=day*(1.-rain*.82)*sunward;
        float lightness=dot(col,vec3(.22,.69,.09));
        col*=1.+surface*illuminated*vec3(.20+.12*atlasWarmth,.106,.012);
        col+=surface*(1.-smoothstep(.10,.62,lightness))*vec3(.012,.025,.042);
        col=mix(col,mistColour,behind*surface*(.09+rain*.07));
        gl_FragColor=vec4(max(vec3(0.),col),1.);`);
    m.needsUpdate=true;return q;
  };
})();
