// Native-resolution redraws preserve each original battle location, including
// real paired nighttime lighting. Only the selected scenery is decoded.
const BATTLE_ART99={
 waterfall:{landmark:.46,fall:[.54,.49,.82,.85],spray:[[.62,.49],[.70,.49],[.77,.49]]},
 woodland:{landmark:.43},orchard:{landmark:.44},ruins:{landmark:.44},
 cavern:{landmark:.44},mountain:{landmark:.43},snow:{landmark:.43},
 coast:{landmark:.43},royalRoad:{landmark:.43},moonlit:{landmark:.43},
 grassMeadow:{landmark:.43,fall:[.59,.54,.76,.86],spray:[[.61,.55],[.66,.55],[.71,.55]]},
 grassFlowers:{landmark:.43,fall:[.56,.55,.72,.86],spray:[[.59,.56],[.64,.56],[.69,.56]]},
 grassDowns:{landmark:.43},grassWindmill:{landmark:.43},
 grassAutumn:{landmark:.43,fall:[.36,.60,.41,.71],spray:[[.38,.61],[.39,.61],[.40,.61]]},
 grassStones:{landmark:.43},grassHills:{landmark:.43},grassBirch:{landmark:.43},
 grassTwilight:{landmark:.43},grassRiver:{landmark:.43}
};
function battleArtStage99(stage=encounter53.selected){return BATTLE_ART99[stage];}
for(const [stage,q]of Object.entries(BATTLE_ART99)){
 BATTLE_STAGE_PAIRS55[stage]={day:'battle99_'+stage+'_day',night:'battle99_'+stage+'_night'};
 STAGECRAFT94[stage].fall=q.fall??[0,0,0,0];
}
// The redrawn clearings expose warm earth and stone rather than a uniform
// green lawn. Reuse the game's detailed physical surfaces in those areas.
for(const stage of ['waterfall','woodland','orchard','moonlit'])ARENAS88[stage].ground='earth';
Object.assign(STAGECRAFT94.cavern,{key:'#e0e6d6',soil:'#d6cfc0'});
const heightArtBefore99=arenaHeight88;
function stageEdge99(b){return Math.min(fightingHollow93(b).back-25,-68);}
arenaHeight88=function(b,x,z){
 const h=heightArtBefore99(b,x,z);if(!b.hybridKey90)return h;
 const edge=stageEdge99(b),crest=edge+23+Math.sin(x*.13)*3.2+Math.cos(x*.31)*1.5;
 const ridge=Math.exp(-(((z-crest)/7.5)**2))*(b.spec.cave?3.8:b.spec.dense?3.3:2.6+.65*Math.sin(x*.19));
 const wet=b.spec.river||b.spec.sea?arenaWet89(b,x,z):0;
 return Math.max(h,ridge*(1-smooth(.12,.75,wet)));
};
const artCache99=new Map(),prepareArtBefore99=preparePainting90;
preparePainting90=async function(stage,phase){
 const key=paintingKey90(stage,phase);let texture;
 try{texture=await prepareArtBefore99(stage,phase);}catch(error){hybrid90.pending.delete(key);throw error;}
 artCache99.delete(key);artCache99.set(key,texture);
 // Keep the current panorama until its scene has finished using it. Four HD
 // plates fit comfortably in memory without decoding the other 36 at boot.
 for(const [old,t]of artCache99){
  if(artCache99.size<=4)break;
  if(old===key||arena88.current?.plate90===t)continue;
  const palette=hybrid90.palettes.get(t);palette?.low.dispose();hybrid90.palettes.delete(t);
  t.dispose();delete textures[old];hybrid90.pending.delete(old);artCache99.delete(old);
 }
 return texture;
};
const landscapeArtBefore99=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 landscapeArtBefore99(b);const m=b.landscape90.material;
 b.plateFit97.value=innerHeight>innerWidth&&innerWidth<760?.96:.62;
 if(innerHeight>innerWidth&&innerWidth<760)b.window90.x-=.11;
 b.plate90.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 if(b.sky89)b.coverage89.value=.045;
 b.landscape90.name='Native HD battle painting on calibrated landscape depth';
 b.hdArt99={key:paintingKey90(encounter53.selected,encounter53.phase55),native:[b.plate90.image.width,b.plate90.image.height],phase:encounter53.phase55,source:'HD redraw of original PixelLab layout',sharedProjection:true};
 m.userData.hd97={...m.userData.hd97,generatedHD:true,centreFit:b.plateFit97.value};
 // The lower part extends behind the physical set. It is concealed by the
 // opaque stage and its ridgeline, rather than dissolved across the floor.
 const g=b.landscape90.geometry,p=g.attributes.position,uv=g.attributes.uv,ref=b.reference90,eye=ref.position,origin=b.group.position,nx=128,ny=82;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const k=j*(nx+1)+i,U=uv.getX(k),V=j/ny,x=(U-.5)/b.crop90.x+.5,y=b.window90.x+V*b.window90.y;
  const ray=V3(x*2-1,y*2-1,.5).unproject(ref).sub(eye).normalize(),z=origin.z-105-7*Math.sin(U*Math.PI)**2*Math.sin(V*Math.PI),at=eye.clone().addScaledVector(ray,(z-eye.z)/ray.z).sub(origin);
  p.setXYZ(k,at.x,at.y,at.z);uv.setY(k,V);
 }
 p.needsUpdate=uv.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
 m.fragmentShader=m.fragmentShader.replace('*smoothstep(.30,.39,v.y)','');m.needsUpdate=true;
};
// The physical floor ends behind a real irregular bank. It never samples
// the background picture, so painted rocks cannot dissolve into 3D objects.
const groundArtBefore99=blendHybridGround90;
blendHybridGround90=function(b){
 groundArtBefore99(b);const ground=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),g=ground.geometry,p=g.attributes.position,indices=g.index.array,keep=[],edge=stageEdge99(b);
 for(let i=0;i<indices.length;i+=3)if(Math.max(p.getZ(indices[i]),p.getZ(indices[i+1]),p.getZ(indices[i+2]))>=edge-14)keep.push(indices[i],indices[i+1],indices[i+2]);
 g.setIndex(keep);g.computeBoundingSphere();const m=ground.material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.transparent=false;m.alphaTest=0;
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=s.fragmentShader.replace(/vec4 projected90=hybridProjector90\*vec4\(groundWorld89,1\.\);[\s\S]*?(?=#include <opaque_fragment>)/,'');m.userData.stageOnly99={projectedFloor:s.fragmentShader.includes('vec4 projected90='),opaque:!m.transparent};};
 m.customProgramCacheKey=()=>key()+'-physical-stage-only99';m.needsUpdate=true;
};
const dressLayerBefore99=dressHybrid90;
dressHybrid90=function(b){
 dressLayerBefore99(b);const r=b.rng,edge=stageEdge99(b),s=b.spec;let rocks=0,trees=0;
 const clumps=[[-47,-3,2.3],[-34,2,1.8],[-22,0,1.6],[-9,2,1.1],[5,-1,1.4],[19,1,1.7],[32,-2,2.0],[46,-5,2.5]];
 for(let i=0;i<clumps.length;i++){
  const [x,dz,size]=clumps[i],z=edge+23+Math.sin(x*.13)*3.2+Math.cos(x*.31)*1.5+dz;
  if(arenaWet89(b,x,z)>.7)continue;
  outcrop93(b,x,z,size*(s.cave?1.15:.85));rocks++;
  if(s.trees&&!s.cave&&i%3===1&&Math.abs(x)>9){arenaTree88(b,x+1,z-2,.55+r()*.30,s.trees);trees++;}
  if(!s.cave&&!s.snow)for(let j=0;j<5;j++)botanical92(b,x+(r()-.5)*3,z+1+r()*2,j===0?'flowers':'fern',.30+r()*.25);
 }
 b.layering99={physicalEdge:edge,opaqueRidgeline:true,rocks,trees,paintedFloor:false,paintedWater:false};
};
// Water uses the same actual POI water surface as before. The distant
// picture remains beyond the stage, with no projected painting on the water.
const waterArtBefore99=arenaWater88;
arenaWater88=function(b){
 waterArtBefore99(b);if(!b.hybridKey90||!b.reflect89)return;
 const m=b.reflect89.surface.material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...a){
  before.call(this,s,...a);
  s.fragmentShader=s.fragmentShader.replace('coverage62*(.22+fresnel62*.55)','coverage62*(.075+fresnel62*.18)');
 };
 m.customProgramCacheKey=()=>key()+'-physical-water99';m.needsUpdate=true;
};
// Native HD detail needs only gentle distance diffusion. Actors, the action
// floor, and interface remain outside this far-background treatment.
const postArtBefore99=makeArenaPost89;
makeArenaPost89=function(){
 const p=postArtBefore99();if(p.material.userData.hdArt99)return p;
 p.material.userData.hdArt99=true;
 p.material.fragmentShader=p.material.fragmentShader.replace('farFocus*2.0*displayScale97','farFocus*.8*displayScale97').replace('mix(mix(.68,.24,phoneSharp92),.58,farFocus)','mix(mix(.68,.24,phoneSharp92),.22,farFocus)').replace('coc*mix(.68,.58,farFocus)','coc*mix(.68,.22,farFocus)');
 p.material.needsUpdate=true;return p;
};
const buildArtBefore99=buildStageScenery59;
buildStageScenery59=function(...args){
 const result=buildArtBefore99(...args),b=arena88.current;if(!b?.hdArt99||b.solidArt99)return result;
 const water=b.reflect89?.surface.material,seen=new Set();let solids=0,cutouts=0;
 b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){
  if(!m?.isMeshStandardMaterial||m===water||seen.has(m))continue;seen.add(m);
  m.opacity=1;m.transparent=false;m.depthWrite=true;
  if(o.name==='Actual level ground and carved water banks')m.alphaTest=0;
  if(m.alphaTest>0)cutouts++;solids++;m.needsUpdate=true;
 }});
 b.solidArt99={materials:solids,cutouts,opaque:true};
 if(stageDepth59.summary)stageDepth59.summary.hdArt99={...b.hdArt99,opaqueScenery:true};
 return result;
};
