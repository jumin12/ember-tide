// The keeper summons the same layered Homeward gate used by the private plot.
// Ownership, the existing cast choreography and all travel targets stay native.
const portalOpeningShader149=`
 float apertureRadius149(vec2 p){return length((p-vec2(0.,2.10))*vec2(1./1.10,1./2.05));}
`;
function configureSummonedPortal149(p){
 if(p.summon149)return;const fx=p.return148;fx.born149=clock;fx.depthSpin149={value:0};p.summon149=true;
 // The light stays in the prepared world's light list even before purchase.
 // Only its intensity changes, so the spell does not force a lighting recompile.
 world.add(p.light);
 const meshes=new Set();for(const root of[p.shell146,p.foot146])root.traverse(o=>{if(o.isMesh&&o.material.isMeshPhysicalMaterial)meshes.add(o);});
 const materials=new Set();for(const o of meshes){if(!materials.has(o.material)){homeStoneShader146(o.material,p.stoneReveal146);materials.add(o.material);o.material.needsUpdate=true;}
  o.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});homeStoneShader146(o.customDepthMaterial,p.stoneReveal146,true);o.userData.portalStone149=true;
 }
 const m=p.material;m.uniforms.opening149=p.open146;m.uniforms.spin149=fx.depthSpin149;
 m.fragmentShader='uniform float opening149;\n'+portalOpeningShader149+m.fragmentShader;
 m.fragmentShader=m.fragmentShader.replace('vec2 depth=(uv-',`if(apertureRadius149(p)>opening149*1.58)discard;vec2 depth=(uv-`);
 m.fragmentShader=m.fragmentShader.replace('color*=1.+energy*.12;',`color+=vec3(.07,.35,.8)*exp(-pow((apertureRadius149(p)-opening149*1.58)/.055,2.))*(1.-step(.999,opening149));color*=1.+energy*.12;`);m.needsUpdate=true;
 for(const layer of fx.currents.children){const m=layer.material;m.uniforms.opening149=p.open146;m.uniforms.spin149={value:0};
  m.fragmentShader='uniform float opening149;\n'+portalOpeningShader149+m.fragmentShader;
  m.fragmentShader=m.fragmentShader.replace('vec2 uv=imageUv148;',`if(apertureRadius149(gate148)>opening149*1.58)discard;vec2 uv=imageUv148;`);m.needsUpdate=true;
 }
 const rim=p.group.children.find(o=>o.name==='Luminous inner edge');if(rim){rim.material=new THREE.ShaderMaterial({uniforms:{opening149:p.open146},vertexShader:'varying vec2 point149;void main(){point149=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 point149;uniform float opening149;'+portalOpeningShader149+'void main(){if(apertureRadius149(point149)>opening149*1.58)discard;gl_FragColor=vec4(.03,.52,1.,1.);}',toneMapped:false});}
 const floor=p.group.children.find(o=>o.name==='Portal light on threshold');if(floor){floor.material.uniforms.opening149=p.open146;floor.material.fragmentShader='uniform float opening149;\n'+floor.material.fragmentShader;floor.material.fragmentShader=floor.material.fragmentShader.replace('if(alpha<.003)discard;','alpha*=opening149*opening149;if(alpha<.003)discard;');floor.material.needsUpdate=true;}
 buildReturnReverse154(p);
}
const summonBuildBefore149=homePortal139;
homePortal139=function(...args){const g=summonBuildBefore149(...args),p=g.userData.portal144;if(!p.return148)finishReturnPortal148(p);configureSummonedPortal149(p);return g;};
const summonSeatBefore149=seatTownPortal141;
seatTownPortal141=function(g){const p=g.userData.portal144;if(!p?.summon149)return summonSeatBefore149(g);const bottom=p.foot146.children.find(o=>o.geometry?.type==='CylinderGeometry');if(!bottom)return;g.updateWorldMatrix(true,true);const pos=bottom.geometry.attributes.position,at=V3();for(let i=0;i<pos.count;i++)if(pos.getY(i)<0){at.fromBufferAttribute(pos,i);bottom.localToWorld(at);at.y=heightAt(at.x,at.z)-.028;bottom.worldToLocal(at);pos.setY(i,at.y);}pos.needsUpdate=true;bottom.geometry.computeVertexNormals();bottom.geometry.computeBoundingBox();bottom.geometry.computeBoundingSphere();bottom.userData.groundSeated141=true;};
const summonPrepareBefore149=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){if(housing139().home&&(world?.userData.homePortals139?.length??0)>0){await warmReturnArt148();for(const p of world.userData.homePortals139)if(p.return148)bindReturnLayers148(p);}return summonPrepareBefore149(...args);};
const summonWarmBefore149=warmHomeCast146;
warmHomeCast146=function(){return Promise.all([summonWarmBefore149(),warmReturnArt148(),warmPortalAudio149()]).then(([cast])=>{for(const p of world?.userData.homePortals139??[])if(p.return148)bindReturnLayers148(p);return cast;});};
const summonTickBefore149=tick;
tick=function(dt){const r=summonTickBefore149(dt);for(const p of world?.userData.homePortals139??[]){if(!p.summon149)continue;const fx=p.return148,t=clock-fx.born149,reveal=homeReveal146?.portal===p,open=p.open146.value,s=p.group.scale.x;
  // Keep the artwork oriented like its source. Motion is local advection and
  // deformation in the current shaders, never a rotating rectangular plate.
  fx.depthSpin149.value=0;for(const o of fx.currents.children)o.material.uniforms.spin149.value=0;
  p.group.updateWorldMatrix(true,false);p.light.position.copy(V3(0,1.65,0).applyMatrix4(p.group.matrixWorld));p.light.distance=7.2*s;p.light.intensity=p.group.visible?(fx.lightBase+p.energy*2.2)*s*s*(reveal?open:1)*(1.+.045*Math.sin(clock*.67)+.025*Math.sin(clock*1.13)):0;
 }updatePortalAudio149(dt);return r;};
const portalStateBootBefore149=boot;
boot=async function(...args){const r=await portalStateBootBefore149(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const d=JSON.parse(before());d.homeSummon149={revealing:!!homeReveal146,portals:(world?.userData.homePortals139??[]).map(p=>({newPortal:!!p.summon149,visible:p.group.visible,opening:p.open146?.value,spin:p.return148?.currents.children.map(o=>+o.material.uniforms.spin149.value.toFixed(3))})),audio:{counts:{...portalAudio149.counts},loopVolume:portalAudio149.loop?.volume??0,errors:[...portalAudio149.errors]},characterSampling:actors.filter(a=>a.mesh?.userData.characterSampling149).length};return JSON.stringify(d);};return r;};
const portalStoneDisposeBefore149=disposeContinuousWorld;
disposeContinuousWorld=function(...args){world?.traverse(o=>{if(o.userData.portalStone149)o.customDepthMaterial?.dispose();});return portalStoneDisposeBefore149(...args);};
