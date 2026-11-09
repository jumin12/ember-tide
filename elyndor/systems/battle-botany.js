// Battles use the same natural HD botanical surfaces as POIs and the continent.
// Existing planted positions, fighter clearances and per-stage flora remain.
function arenaCoverMaterial102(b,kind){
 const id='native-cover102-'+kind;if(b.materials.has(id))return b.materials.get(id);
 const m=material59(groundcoverMaterial102(kind,{value:new THREE.Vector2(170,200)})),before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.actor={value:V3()};s.uniforms.windTime=stageDepth59.time;};m.customProgramCacheKey=()=>key+'-arena102';bindArenaWeather89(m,b);b.materials.set(id,m);return m;
}
const arenaBotanyMaterialBefore102=arenaPlantMaterial89;
arenaPlantMaterial89=function(b,type){return ['fern','flowers'].includes(type)?arenaCoverMaterial102(b,type):arenaBotanyMaterialBefore102(b,type);};
const arenaBotanyGeometryBefore102=arenaGeometry88;
arenaGeometry88=function(b,id,create){
 const match=id.match(/^(?:poiPlant89-|detail92-)(fern|flowers)$/),grass=id==='small-grass92';
 if(grass)b.grassNext102=true;
 if(!match&&!grass)return arenaBotanyGeometryBefore102(b,id,create);
 const kind=grass?'grassBlades':match[1];
 return arenaBotanyGeometryBefore102(b,'natural102-'+id,()=>{const g=groundcoverGeometry102(kind,b.mobile).clone();if(grass)g.translate(0,.465,0);if(kind==='flowers'){const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*.72,-.465+(p.getY(i)+.465)*.68,p.getZ(i)*.72);g.computeVertexNormals();g.computeBoundingSphere()}g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));return g;});
};
const smallGrassMaterialBefore102=arenaMaterial88;
arenaMaterial88=function(b,...args){if(b.grassNext102&&args[0]===null){b.grassNext102=false;return arenaCoverMaterial102(b,'grassBlades')}return smallGrassMaterialBefore102(b,...args);};
const arenaBotanyFlushBefore102=flushArena88;
flushArena88=function(b){for(const [id,q]of b.batches){if(!q.material?.userData.naturalCover102)continue;const grass=id.startsWith('small-grass92'),flower=id.includes('flowers');q.geometry.setAttribute('botanicalStyle102',new THREE.InstancedBufferAttribute(Float32Array.from(q.rows,m=>{const e=m.elements,v=Math.sin(Math.floor(e[12]/3.3)*31.7+Math.floor(e[14]/3.3)*17.3);return grass?v>.1?0:1:flower?v>.1?2:3:4}),1));}const r=arenaBotanyFlushBefore102(b);for(const o of b.group.children)if(o.material?.userData.naturalCover102)o.castShadow=false;return r;};
const arenaGrassInstanceBefore102=arenaInstance88;
arenaInstance88=function(b,key,geometry,material,position,scale=V3(1,1,1),rotation=new THREE.Quaternion(),color=null){
 arenaGrassInstanceBefore102(b,key,geometry,material,position,scale,rotation,color);
 if(key!=='small-grass92'||!material.userData.naturalCover102)return;
 const rng=seeded(Math.round(position.x*321.7+position.z*713.1+102991));
 for(let i=0;i<2;i++){const a=rng()*TAU,r=.25+rng()*.6,x=position.x+Math.cos(a)*r,z=position.z+Math.sin(a)*r;if(!detailFree92(b,x,z,.65))continue;arenaGrassInstanceBefore102(b,key,geometry,material,V3(x,arenaFloor88(b,x,z)-.025,z),scale.clone().multiplyScalar(.80+rng()*.35),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),rng()*TAU),color)}
};
