// Rivers and ocean used opposite depth modes: the river sampled a coarse
// continent-wide bed texture, while the ocean trusted old town-bed vertices.
// Give each its appropriate depth owner, retaining the POI water shader/art.
const seaLevel109=-1.4,mouths109=MACRO_RIVERS15.filter(p=>p.length>3&&p.at(-1).y< -1).map(path=>{
 const e=path.at(-1),a=path.at(-5),n=Math.hypot(e.x-a.x,e.z-a.z);return{x:e.x,z:e.z,ux:(e.x-a.x)/n,uz:(e.z-a.z)/n,width:e.width,start:-22,end:42};
});
function mouthSample109(x,z){
 for(const m of mouths109){const dx=x-m.x,dz=z-m.z,u=dx*m.ux+dz*m.uz,v=Math.abs(-dx*m.uz+dz*m.ux);if(u<m.start||u>m.end)continue;const width=m.width*(1+smooth(-4,28,u)*.48)+Math.sin(u*.21)*.30,weight=smooth(-22,-4,u)*(1-smooth(30,42,u));if(v<width+6)return{m,u,v,width,weight};}return null;
}
const wetBefore109=traversalWet;
traversalWet=function(x,z){const q=mouthSample109(x,z);return !!q&&q.v<q.width||wetBefore109(x,z);};
const mouthGroundBefore109=macroGround;
macroGround=function(x,z){
 const y=mouthGroundBefore109(x,z),q=mouthSample109(x,z);if(!q)return y;
 // Open the artificial end-bank into a gently widening estuary. The ocean
 // itself fills it, with no second overlapping mouth plane or raised lip.
 const shoulder=smooth(q.width*.65,q.width+6,q.v),bed=seaLevel109-.85-Math.max(0,q.u)*.045;
 return mix(y,Math.min(y,mix(bed,Math.max(y,seaLevel109+.22),shoulder)),q.weight);
};
const waterHeightBefore109=traversalWaterHeight;
traversalWaterHeight=function(x,z){return mouthSample109(x,z)?seaLevel109-.035:Math.max(seaLevel109-.035,waterHeightBefore109(x,z));};
const preciseWaterBefore109=waterMaterial62;
waterMaterial62=function(o,...args){
 const macro=activeScene?.kind==='overworld',fresh=macro&&o.userData.freshwater38;
 if(fresh){
  const p=o.geometry.attributes.position,d=new Float32Array(p.count);let fixed=0,min=Infinity,max=-Infinity;
  for(let i=0;i<p.count;i++){const x=p.getX(i)+o.position.x,z=p.getZ(i)+o.position.z,y=traversalWaterHeight(x,z)+.035;
   if(Math.abs(p.getY(i)+o.position.y-y)>.001)fixed++;p.setY(i,y-o.position.y);
   // The river's authored polygon owns its shoreline. A tiny narrow channel
   // must not disappear because all its boundary vertices sample dry banks.
   d[i]=clamp(y-macroGround(x,z),.22,12);min=Math.min(min,y);max=Math.max(max,y);
  }
  p.needsUpdate=true;o.geometry.setAttribute('waterDepth18',new THREE.BufferAttribute(d,1));o.geometry.computeVertexNormals();o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();
  o.userData.hydraulics109={explicitDepth:true,vertices:p.count,corrected:fixed,levels:[min,max],oceanJoin:-1.4};
 }
 const m=preciseWaterBefore109(o,...args);if(!macro)return m;
 const u=waterUniforms62.get(m);if(u)u.hasDepth62.value=fresh?1:0;
 m.userData.hydraulics109=fresh?'local river depth':'geographic ocean bed';
 // Use the starting POI's flowing normal strength and paired advected PBR
 // wave layers at this same world scale; terrain depth owns natural color.
 {const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);
  s.fragmentShader=s.fragmentShader.replace('normal=normalize(normal+mat3(viewMatrix)*fineN62*(cascade62>.5?.22:1.));','normal=normalize(normal+mat3(viewMatrix)*fineN62*.65);').replace('mat2(.8,-.6,.6,.8)*worldWater62.xz*.11+current62*time62*.04','mat2(.8,-.6,.6,.8)*stream62*.11+vec2(3.1,7.3)');
 };m.customProgramCacheKey=()=>key+'-brook-wave-parity109';m.userData.brookWaveParity109=true;}
 if(fresh){const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);
  s.fragmentShader=s.fragmentShader.replace('float edge62=max(1.-smoothstep(.01,.34,waterDepth62),1.-smoothstep(.05,.68,bed62.g));','float edge62=1.-smoothstep(.01,.34,waterDepth62);');
 };m.customProgramCacheKey=()=>key+'-continuous-river-depth109';}
 return m;
};
