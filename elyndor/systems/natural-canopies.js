// Open, branching leaf sprays replace radial leaf-covered crown balls. The
// same alpha-cut PixelLab foliage is retained, with no opaque spherical core.
function branchSpray66(count){
 const key='branch-spray66-'+count;if(sharedGeo[key])return sharedGeo[key];
 const n=Math.max(12,Math.min(24,count)),rng=seeded(660031+count),p=[],uv=[];
 const triangle=(a,b,c,coords)=>{p.push(...a.toArray(),...b.toArray(),...c.toArray());uv.push(...coords);};
 for(let i=0;i<n;i++){
  const stem=i%3,t=(Math.floor(i/3)+.35)/(Math.ceil(n/3)+.3),side=stem===1?-1:1;
  const center=V3(-.75+t*1.65,.06+Math.sin(t*3+stem)*.18,(stem===0?0:side*(.10+t*.43))+(rng()-.5)*.18);
  const yaw=side*(.28+t*.65)+(rng()-.5)*.45,pitch=(rng()-.5)*.65;
  const right=V3(Math.cos(yaw),pitch,Math.sin(yaw)).normalize(),up=V3(-Math.sin(yaw)*.38,.82,Math.cos(yaw)*.38).normalize(),s=.68+rng()*.29;
  const a=center.clone().addScaledVector(right,-s).addScaledVector(up,-s*.7),b=center.clone().addScaledVector(right,s).addScaledVector(up,-s*.7),c=center.clone().addScaledVector(up,s*.82).add(V3(0,.10,0));
  // A folded fan has two differently lit faces; it remains volumetric from
  // oblique camera angles without outlining a textured globe.
  const left=center.clone().addScaledVector(right,-s*.85).addScaledVector(up,s*.65),rightTip=center.clone().addScaledVector(right,s*.85).addScaledVector(up,s*.65);
  triangle(a,b,c,[0,0,1,0,.5,1]);triangle(a,c,left,[0,0,.5,1,0,1]);triangle(c,b,rightTip,[.5,1,1,0,1,1]);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();g.userData={branchSpray66:true,opaqueCore:false};return sharedGeo[key]=g;
}
sprayGeometry30=branchSpray66;
leafVolume28=branchSpray66;
function naturalTree66(t){
 if(!t||t.branching66)return t;
 const rng=seeded(Math.round(t.x*131.7+t.z*237.3+66119)),s=t.scale,h=t.h,x=t.x,y=t.y,z=t.z,pine=t.species30===4,birch=t.species30===1,willow=t.species30===3,turn=rng()*TAU,lean=(rng()-.5)*.38*s;
 t.trunks=[];t.crowns=[];
 const matrix=(p,scale,q=new THREE.Quaternion())=>new THREE.Matrix4().compose(p,q,scale);
 const limb=(from,to,r)=>{const d=to.clone().sub(from);t.trunks.push(matrix(from.clone().add(to).multiplyScalar(.5),V3(r/.22,d.length(),r/.22),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize())));};
 const root=V3(x,y-.05,z),fork=V3(x+lean*.3,y+h*.40,z),leader=V3(x+lean,y+h*.92,z-.10*s);
 limb(root,fork,(birch?.14:.23)*s);limb(fork,leader,(birch?.08:.13)*s);
 for(let i=0;i<3;i++){const a=turn+i*TAU/3;limb(V3(x+Math.cos(a)*.35*s,y-.045,z+Math.sin(a)*.35*s),V3(x,y+h*.12,z),.075*s);}
 if(pine){
  for(let tier=0;tier<4;tier++)for(let j=0;j<3;j++){
   const a=turn+j*TAU/3+tier*1.1,reach=(1.8-tier*.34)*s*(.88+rng()*.15),start=V3(x+lean*tier*.2,y+h*(.34+tier*.14),z),tip=start.clone().add(V3(Math.cos(a)*reach,.10*s,Math.sin(a)*reach));
   limb(start,tip,(.050-tier*.008)*s);t.crowns.push(matrix(tip.clone().lerp(start,.36).add(V3(0,.12*s,0)),V3(reach*.76,1.05*s,reach*.68),new THREE.Quaternion().setFromEuler(new THREE.Euler(.08,-a,(rng()-.5)*.15))));
  }
 }else{
  const branches=birch?5:4;
  for(let j=0;j<branches;j++){
   const a=turn+j*2.399963+(rng()-.5)*.45,start=V3(x+lean*.35,y+h*((birch?.45:.37)+j*(birch?.068:.045)),z),reach=(birch?1.0:willow?1.8:1.55)*s*(.82+rng()*.35);
   const elbow=V3(x+Math.cos(a)*reach*.60+lean*.65,y+h*(.48+j*.07),z+Math.sin(a)*reach*.60),end=V3(x+Math.cos(a)*reach+lean,y+h*(.56+j*.095),z+Math.sin(a)*reach);
   limb(start,elbow,.075*s);limb(elbow,end,.038*s);
   for(const side of[-1,1]){
    const angle=a+side*.43,tip=end.clone().add(V3(Math.cos(angle)*.48*s,(willow?-.35:.13)*s,Math.sin(angle)*.48*s));limb(elbow,tip,.022*s);
    t.crowns.push(matrix(tip,V3((birch?.98:1.18)*s,(willow?1.5:1.28)*s,(birch?.95:1.15)*s),new THREE.Quaternion().setFromEuler(new THREE.Euler((rng()-.5)*.32,-angle,willow?side*.45:(rng()-.5)*.28))));
   }
  }
 }
 t.crowns.push(matrix(leader.clone().add(V3(0,.12*s,0)),V3(.85*s,.75*s,.8*s),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),turn)));
 t.cover30=t.crowns.map(m=>new THREE.Box3(V3(-1.25,-.7,-1),V3(1.25,1,1)).applyMatrix4(m));t.box=new THREE.Box3(V3(x-.4*s,y,z-.4*s),V3(x+.4*s,y+h,z+.4*s));for(const b of t.cover30)t.box.union(b);
 t.branching66=true;t.connectedGrowth62=true;return t;
}
growTree62=naturalTree66;
const canopyBoundaryBefore66=boundaryTree47;
boundaryTree47=function(...args){return naturalTree66(canopyBoundaryBefore66(...args));};

// Native humanoid anatomy is authored in the source frames. Keep the sprite
// plane square to the lens, rather than compensating pitch by stretching it.
function faceNativeHumanoids66(){for(const a of actors){if(assets.sprites[a.id]?.anatomyRevision!==66)continue;const scale=compactWorld44()&&a.party?compactTraversal44.partyScale*1.60:Math.abs(a.mesh.scale.x),mirror=Math.sign(a.mesh.scale.x)||1;a.mesh.scale.set(mirror*scale,scale,scale);a.mesh.quaternion.copy(camera.quaternion);}}
const nativeCameraBefore66=updateCamera;
updateCamera=function(...args){const r=nativeCameraBefore66(...args);faceNativeHumanoids66();return r;};
const nativeIntroBefore66=applyBattleIntro58;
applyBattleIntro58=function(...args){const r=nativeIntroBefore66(...args);faceNativeHumanoids66();return r;};
