// A shallow fighting hollow opens into raised, layered banks. The actual
// terrain carries these forms, so roots, rubble, light and shadows agree.
const physicalWetBefore93=arenaWet89;
arenaWet89=function(b,x,z){return b.hybridKey90&&!b.spec.river&&!b.spec.sea?0:physicalWetBefore93(b,x,z);};
function fightingHollow93(b){
 if(b.hollow93)return b.hollow93;const c=encounter53,cast=[player,...followers,...battle.enemies.map(e=>e.actor)],box={left:Infinity,right:-Infinity,back:Infinity,front:-Infinity,formation:battle.formationKey91};
 for(const a of cast){const h=battle.rankHomes87?.get(a)??a,pad=Math.max(1.7,a.size*.72),x=h.x-c.center.x,z=h.z-c.center.z;box.left=Math.min(box.left,x-pad);box.right=Math.max(box.right,x+pad);box.back=Math.min(box.back,z-pad);box.front=Math.max(box.front,z+pad);}
 b.hollow93=box;return box;
}
const terrainDepthBefore93=arenaHeight88;
arenaHeight88=function(b,x,z){
 const original=terrainDepthBefore93(b,x,z);if(!b.hybridKey90)return original;const q=fightingHollow93(b),outside=Math.hypot(Math.max(q.left-x,0,x-q.right),Math.max(q.back-z,0,z-q.front));
 // Actions cross the same level hollow as the resting ranks. Its banks
 // grow in a broad transition, without a circular lip or rectangular rim.
 if(outside<.001)return 0;
 const dry=1-smooth(.05,.45,arenaWet89(b,x,z)),rear=1-smooth(q.back-9,q.back-1,z),side=smooth(0,8,Math.max(q.left-x,x-q.right)),front=smooth(q.front,q.front+9,z),edge=smooth(0,5.5,outside),far=1-smooth(63,90,-z);
 const wave=.55+.22*Math.sin(x*.18+z*.073)+.16*Math.sin(z*.24-x*.11),notch=b.spec.river||b.spec.falls?1-.62*Math.exp(-(((x-3)/8)**2)):1;
 const rise=(rear*(b.spec.cave?3.8:b.spec.highland?4.8:3.2)*wave*notch+side*(1.2+wave*.9)+front*.38)*edge*far*dry;
 return original+rise;
};
function bankPoint93(b,u,v){
 const ref=b.reference90,f=battlePresentation91.frame?.field;if(!ref||!f)return null;const p=V3(u*2-1,1-(f.top+v*f.height)/innerHeight*2,.5).unproject(ref),ray=new THREE.Ray(ref.position,p.sub(ref.position).normalize());if(ray.direction.y>=-.014)return null;const at=ray.at((encounter53.floorY-ray.origin.y)/ray.direction.y,V3()).sub(b.group.position);return at.z< -85||at.z>24?null:at;
}
function outcrop93(b,x,z,size=1){
 const r=b.rng,s=b.spec;
 // Interlocking long strata with a talus skirt replace isolated round
 // stones. Unequal heights expose lit facets and recessed contact shadows.
 for(let i=0;i<4;i++){const xx=x+(i-1.5)*size*.82,zz=z+(i%2)*size*.48,h=size*(.75+(i===1?1.05:i===2?.65:.18));if(!detailFree92(b,xx,zz,size*.9))continue;arenaRock88(b,xx,zz,size*(1.4+r()*.4),h,size*(.8+r()*.25),[1,6,7,3][i]);}
 scree92(b,x,z+size,size*.9);
 if(!s.cave&&!s.snow)for(let i=0;i<18;i++){const a=i*2.399,spread=size*(.65+r()*2),xx=x+Math.cos(a)*spread,zz=z+Math.sin(a)*spread*.65;botanical92(b,xx,zz,i%5===0?'flowers':'fern',size*(.25+r()*.22));}
 b.depth93.outcrops++;
}
const dressDepthBefore93=dressHybrid90;
dressHybrid90=function(b){
 dressDepthBefore93(b);const s=b.spec,r=b.rng,q=fightingHollow93(b);b.depth93={terrain:true,outcrops:0,bankTrees:0,rootedDetails:0};
 // Each side is framed at a different depth and height. Lens-relative
 // authoring keeps this layering visible in narrow portrait viewports.
 for(const[u,v,scale]of[[.02,.62,1.65],[.965,.55,1.95],[.18,.45,1.35],[.76,.40,1.0]]){const p=bankPoint93(b,u,v);if(!p||!detailFree92(b,p.x,p.z,2))continue;outcrop93(b,p.x,p.z,scale*(b.mobile?.90:1));}
 const rear=q.back-8;
 for(let i=0;i<7;i++){
  const x=mix(q.left-3,q.right+5,i/6)+(r()-.5)*2,z=rear-3-(i%3)*4-r()*3;if(z< -70||arenaWet89(b,x,z)>.1)continue;
  if(i===1||i===5)outcrop93(b,x,z,s.cave?1.8:1.25);
  if(s.trees&&!s.cave&&(i<2||i>4||s.dense&&i!==3)){arenaTree88(b,x,z,(s.dense?.95:.80)+r()*.42,s.trees);b.depth93.bankTrees++;}
  if(!s.cave&&!s.snow)for(let j=0;j<16;j++){const a=j*2.4,xx=x+Math.cos(a)*(1+r()*2.4),zz=z+Math.sin(a)*(1+r()*2.4);botanical92(b,xx,zz,j%6===0?'flowers':'fern',.45+r()*.35);b.depth93.rootedDetails++;}
 }
 // The closest set pieces are low and clipped by the screen edge; the
 // fighting silhouettes stay clear. They create real parallax on reveals.
 for(const[u,v,scale]of[[.002,.98,.95],[.995,.93,.68]]){const p=bankPoint93(b,u,v);if(p&&detailFree92(b,p.x,p.z,2.8))outcrop93(b,p.x,p.z,scale);}
 const front=b.group.children.find(o=>o.isDirectionalLight&&o!==sun);if(front)front.intensity=b.night?.48:.68;hemi.intensity=b.night?.54:.76;
 if(!s.cave){encounter53.scene.fog=new THREE.Fog(b.palette90.sky,65,180);b.group.children.find(o=>o.name==='Actual level ground and carved water banks').material.fog=false;}
};

const buildReliefBefore93=buildStageScenery59;
buildStageScenery59=function(...a){const b=arena88.current;if(b?.hollow93&&b.hollow93.formation!==battle?.formationKey91&&!battle?.animation&&!battle?.combo&&!introLocked58())b.hybridKey90=null;return buildReliefBefore93(...a);};
