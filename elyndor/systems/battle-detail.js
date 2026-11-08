// Layered, rooted scene detail. Keep a real unobstructed action lane, with
// smaller dressing at its feet and larger objects beyond the fighting ranks.
function detailFree92(b,x,z,radius=.6){
 for(const a of[player,...followers,...battle.enemies.map(e=>e.actor)]){const h=battle.rankHomes87?.get(a)??a;if(Math.hypot(x+b.group.position.x-h.x,z+b.group.position.z-h.z)<radius+Math.min(1.2,a.size*.28))return false;}
 return arenaWet89(b,x,z)<.08;
}
function botanical92(b,x,z,kind='fern',size=.6){
 if(!detailFree92(b,x,z,.8))return;const g=arenaGeometry88(b,'detail92-'+kind,()=>plantGeometry(kind).clone()),m=arenaPlantMaterial89(b,kind);
 arenaInstance88(b,'detail92-'+kind,g,m,V3(x,arenaFloor88(b,x,z)+.44*size-.02,z),V3(size,size,size),new THREE.Quaternion().setFromAxisAngle(axis24,b.rng()*TAU));b.detail92.plants++;
}
function scree92(b,x,z,scale=1){
 for(let i=0;i<7;i++){const a=i*2.399,spread=(.35+i*.18)*scale,xx=x+Math.cos(a)*spread,zz=z+Math.sin(a)*spread;if(!detailFree92(b,xx,zz,.45))continue;const s=(.10+b.rng()*.23)*scale;arenaRock88(b,xx,zz,s*1.4,s*.62,s,[0,1,3,6,7,9][i%6]);b.detail92.scree++;}
}
function grove92(b,x,z,size=1){
 const r=b.rng,s=b.spec;
 for(let i=0;i<3;i++){const a=i*2.4,xx=x+Math.cos(a)*(1.2+i*.6)*size,zz=z+Math.sin(a)*(1.2+i*.6)*size;if(!detailFree92(b,xx,zz,1.2))continue;arenaTree88(b,xx,zz,(.57+r()*.35)*size,s.trees);b.detail92.midTrees++;}
 for(let i=0;i<16;i++){const a=i*2.4,xx=x+Math.cos(a)*(1+r()*3.2)*size,zz=z+Math.sin(a)*(1+r()*3.2)*size;botanical92(b,xx,zz,i%4===0?'flowers':'fern',(.38+r()*.33)*size);}
 scree92(b,x+2,z+1,.8*size);
}
function framedBanks92(b){
 const ref=b.reference90,field=battlePresentation91.frame?.field;if(!ref||!field)return;const ray=new THREE.Ray(),c=encounter53,r=b.rng,s=b.spec;
 // Resolve the bank positions from the same stable lens as the formation.
 // A narrow phone therefore retains middle-distance detail instead of
 // cropping all the authored world-space banks off its sides.
 for(const[u,v,scale]of[[.055,.65,1.7],[.945,.62,2.05],[.19,.49,.8],[.72,.44,.65]]){
  const p=V3(u*2-1,1-(field.top+v*field.height)/innerHeight*2,.5).unproject(ref);ray.set(ref.position,p.sub(ref.position).normalize());if(ray.direction.y>=-.012)continue;
  const p0=ray.at((c.floorY-ray.origin.y)/ray.direction.y,V3()).sub(b.group.position),x=p0.x,z=p0.z;if(z< -76||z> -8||!detailFree92(b,x,z,2.1))continue;
  const size=scale*(b.mobile?.85:1),tall=s.cave?1.3:.65;arenaRock88(b,x,z,size*1.45,size*tall,size*.9,6);scree92(b,x,z,size*.85);b.detail92.landmarkPieces++;
  if(!s.cave&&!s.snow)for(let i=0;i<9;i++){const a=i*2.4,xx=x+Math.cos(a)*size*(.7+r()),zz=z+Math.sin(a)*size*(.7+r());botanical92(b,xx,zz,i%3===0?'flowers':'fern',size*(.35+r()*.18));}
 }
}
function clearingDetail92(b){
 const r=b.rng,s=b.spec,geo=arenaGeometry88(b,'small-grass92',()=>{const p=[],uv=[],c=[];for(let i=0;i<6;i++){const a=i*2.399,x=Math.cos(a)*.09,z=Math.sin(a)*.09,h=.10+(i%3)*.045;p.push(x-.009,0,z,x+.009,0,z,x+Math.cos(a)*.03,h,z+.02);uv.push(0,0,1,0,.5,1);c.push(.42,.50,.29,.42,.50,.29,.74,.83,.52);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return g;}),m=arenaMaterial88(b,null,s.autumn?'#b9a277':'#b9c59b',{wind:true,cutout:true});m.vertexColors=true;
 const count=b.mobile?300:600;
 if(!s.cave&&!s.snow)for(let i=0;i<count;i++){const x=-19+r()*38,z=-15+r()*31;if(!detailFree92(b,x,z,.8)||r()<.45&&Math.abs(z-1)<2)continue;const k=.5+r()*.7;arenaInstance88(b,'small-grass92',geo,m,V3(x,arenaFloor88(b,x,z)-.01,z),V3(k,k,k),new THREE.Quaternion().setFromAxisAngle(axis24,r()*TAU));b.detail92.groundBits++;}
 for(let i=0;i<(b.mobile?55:100);i++){const x=-21+r()*42,z=-13+r()*30;if(!detailFree92(b,x,z,.7))continue;const k=.045+r()*.105;arenaRock88(b,x,z,k*1.7,k*.43,k*1.2,[0,3,6,9][i%4]);b.detail92.groundBits++;}
 for(const side of[-1,1])for(let i=0;i<5;i++){const x=side*(15+r()*5),z=5+i*1.5;if(!detailFree92(b,x,z,1))continue;if(!s.cave&&!s.snow)botanical92(b,x,z,i%3===0?'flowers':'fern',.34+r()*.3);scree92(b,x,z,.40);}
}
const dressBefore92=dressHybrid90;
dressHybrid90=function(b){
 dressBefore92(b);const s=b.spec,r=b.rng;b.detail92={midTrees:0,plants:0,scree:0,groundBits:0,landmarkPieces:0};
 // Plant in islands of different depths. The original painting stays far
 // behind the outer grove, while near banks break the flat junction line.
 if(s.trees&&!s.cave){
  for(const side of[-1,1])for(let i=0;i<3;i++)grove92(b,side*(14.5+i*4+r()*2),-14-i*13-r()*4,(s.dense?1:.83)+r()*.16);
  if(!s.falls&&!s.river&&!s.sea&&!s.farm)for(let i=0;i<3;i++)grove92(b,-9+i*9,-43-r()*11,.60+r()*.20);
  for(const side of[-1,1]){arenaLog89(b,side*15,-11-r()*3,.52+r()*.22,side*.4);scree92(b,side*14,-12,.9);}
 }
 for(let i=0;i<(s.cave?16:10);i++){const side=i%2?-1:1,x=side*(12+r()*10),z=-13-r()*32;if(!detailFree92(b,x,z,1))continue;const size=.5+r()*1.15;arenaRock88(b,x,z,size*1.4,size*(s.cave?1.3:.6),size*.8,[0,1,3,6,7,9][i%6]);scree92(b,x,z,.75);b.detail92.landmarkPieces++;}
 if(!s.cave&&!s.snow)for(let i=0;i<(b.mobile?90:180);i++){const x=-18+r()*36,z=-12-r()*35;if(arenaWet89(b,x,z)>.1)continue;botanical92(b,x,z,(s.flowers??0)>55&&i%3!==0?'flowers':'fern',.38+r()*.40);}
 if(s.ruins||s.royal||s.stones){
  for(const side of[-1,1])for(let i=0;i<4;i++){const x=side*(12+i*.65),z=-16-i*2.5,y=arenaFloor88(b,x,z);arenaBox88(b,[x,y+.22,z],[1.4,.44,1.2],'wallA','#c3c3ad',side*(.1+i*.08));scree92(b,x,z,.65);b.detail92.landmarkPieces++;}
  if(s.ruins){arenaArch88(b,16,-34,3.4,3.2);arenaRock88(b,-12,-27,2,.8,1.3,6);}
 }
 if(s.farm){
  for(let row=0;row<4;row++)for(let i=0;i<6;i++){const x=16+row*.7,z=-24-i*.75;botanical92(b,x,z,'fern',.30+r()*.10);}
  arenaFence88(b,16,-20,8,Math.PI/2);scree92(b,17,-19,.7);b.detail92.landmarkPieces++;
 }
 if(s.cave){
  const g=arenaGeometry88(b,'crystal-detail92',()=>new THREE.CylinderGeometry(0,.45,1,6)),m=arenaMaterial88(b,'lightFacets','#94d5de',{emissive:'#216f88'});
  for(const side of[-1,1])for(let i=0;i<6;i++){const x=side*(11+r()*5),z=-17-r()*17,h=.35+r()*1.25;if(!detailFree92(b,x,z,.8))continue;arenaInstance88(b,'crystal-detail92',g,m,V3(x,arenaFloor88(b,x,z)+h*.5,z),V3(.28,h,.28),new THREE.Quaternion().setFromAxisAngle(V3(0,0,1),side*.20));b.detail92.landmarkPieces++;}
 }
 if(s.river||s.sea){for(const side of[-1,1])for(let i=0;i<5;i++){const x=side*(11+i*2.3),z=s.sea?-14:-19+Math.sin(x*.055)*3.4;if(arenaWet89(b,x,z)>.2)continue;arenaRock88(b,x,z,.65+i*.08,.26+i*.03,.5,3+i%4);if(!s.snow)botanical92(b,x,z+1,'fern',.42);}}
 framedBanks92(b);clearingDetail92(b);
};
const groundDetailBefore92=arenaGround88;
arenaGround88=function(b){
 groundDetailBefore92(b);if(!b.hybridKey90)return;const m=b.group.children.find(o=>o.name==='Actual level ground and carved water banks').material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.detailOrigin92={value:new THREE.Vector2(b.group.position.x,b.group.position.z)};s.uniforms.detailTrack92={value:b.spec.ground.startsWith('grass')?.18:0};s.fragmentShader='uniform vec2 detailOrigin92;uniform float detailTrack92;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('clamp(groundBlend88.x*(.38+patch89*.42)+smoothstep(.68,.91,patch89)*.08,0.,1.)','clamp(groundBlend88.x*(.72+patch89*.48)+smoothstep(.62,.90,patch89)*.13,0.,1.)');
  s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb*=ground88;',`vec2 local92=groundWorld89.xz-detailOrigin92;float trail92=(1.-smoothstep(.65,2.4,abs(local92.y-1.2-sin(local92.x*.13)*.8)))*detailTrack92;ground88=mix(ground88,texture2D(arenaSoil88,vMapUv*.93).rgb,trail92);float patina92=soilNoise89(local92*.13);diffuseColor.rgb*=ground88*mix(.94,1.035,patina92);`);
 };m.customProgramCacheKey=()=>key()+'-native-patina92';
};
const landscapeDetailBefore92=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 landscapeDetailBefore92(b);const m=b.landscape90.material;m.fragmentShader=m.fragmentShader.replace('float alpha=1.-smoothstep(.94,1.,v.y);','float edge92=.008*sin(v.x*29.)+.006*sin(v.x*67.);float alpha=(1.-smoothstep(.90+edge92,1.,v.y))*smoothstep(.30,.39,v.y);');m.needsUpdate=true;
 // Match the real sky to the painting's upper atmosphere. The cloud layer
 // stays in the sky rather than forming a bright shelf over the mountains.
 if(b.sky89){const u=b.sky89.material.uniforms,canvas=document.createElement('canvas');canvas.width=32;canvas.height=4;const ctx=canvas.getContext('2d',{willReadFrequently:true}),im=b.plate90.image;ctx.drawImage(im,im.width*.46,0,im.width*.26,im.height*.025,0,0,32,4);const pixels=ctx.getImageData(0,0,32,4).data,sky=new THREE.Color(),sample=new THREE.Color();for(let i=0;i<pixels.length;i+=4){sample.setRGB(pixels[i]/255,pixels[i+1]/255,pixels[i+2]/255,THREE.SRGBColorSpace);sky.add(sample);}sky.multiplyScalar(1/(pixels.length/4));for(const k of['r','g','b']){const y=clamp(sky[k],.0001,.97),a=2.51-2.43*y,c=.03-.59*y;sky[k]=(-c+Math.sqrt(c*c+4*a*.14*y))/(2*a);}u.horizon.value.copy(sky);u.zenith31.value.copy(sky).multiplyScalar(.80);b.coverage89.value=.12;
  if(b.clouds89){const cm=b.clouds89.material;cm.uniforms.cloudLight31.value.set(b.night?'#8ba5c4':'#edf0e8');cm.uniforms.cloudShade31.value.copy(sky).multiplyScalar(.85);}
 }
};
const flushDetailBefore92=flushArena88;
flushArena88=function(b){for(const[key,batch]of b.batches)if(key.startsWith('detail92-'))backgroundBotany30(batch.geometry,batch.rows);return flushDetailBefore92(b);};
