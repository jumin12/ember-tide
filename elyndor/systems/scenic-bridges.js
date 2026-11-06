// The crossing plan still owns banks, navigation and the exact walk height.
// Only the masonry is replaced: real open arches, piers and continuous coping.
// Leave useful daylight beneath the arches. The same plans raise the physical
// walk surface and graded bank approaches together, before terrain construction.
for(const b of spans38){if(!b.clearance71){b.left+=1.3;b.right+=1.3;b.clearance71=true;}}
function scenicBridge71(x,z){
 const b={...macroBridgePlan15(x,z)},g=new THREE.Group(),c=Math.cos(b.angle),s=Math.sin(b.angle),level=b.left+.12;g.name='Arched river crossing';g.position.set(x,0,z);g.rotation.y=-b.angle;g.userData={persistentLandmark16:true,scenicBridge71:true};world.add(g);world.userData.bridges.push(b);world.userData.buildings.push(g);b.visual71={arches:Math.max(1,Math.ceil(b.length/13)),openWater:true};
 joinedBridgeDeck38(b);
 const count=b.visual71.arches,span=b.length/count,bottom=level-3.0,top=level-.10,shape=new THREE.Shape();shape.moveTo(-b.length/2,bottom);shape.lineTo(b.length/2,bottom);shape.lineTo(b.length/2,top);shape.lineTo(-b.length/2,top);shape.closePath();
 for(let i=0;i<count;i++){
  const center=-b.length/2+span*(i+.5),r=span*.5-.70,spring=level-2.1,h=1.65,hole=new THREE.Path();hole.moveTo(center-r,bottom+.03);hole.lineTo(center+r,bottom+.03);hole.lineTo(center+r,spring);for(let j=0;j<=16;j++){const a=j/16*Math.PI;hole.lineTo(center+Math.cos(a)*r,spring+Math.sin(a)*h);}hole.lineTo(center-r,bottom+.03);hole.closePath();shape.holes.push(hole);
 }
 const geo=new THREE.ExtrudeGeometry(shape,{depth:b.width-.18,bevelEnabled:false,curveSegments:16,steps:1}),p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;for(let i=0;i<p.count;i++){const side=Math.abs(n.getZ(i))>.5;uv.setXY(i,(side?p.getX(i):p.getZ(i))*.21,p.getY(i)*.28);}geo.computeBoundingSphere();const body=new THREE.Mesh(geo,scenicMaterial16('wall','#b8bba6'));body.position.z=-b.width/2+.09;body.castShadow=body.receiveShadow=true;body.name='Open stone arch and river piers';g.add(body);
 // Separate tapered wedge stones describe each arch rather than a flat decal.
 for(const side of[-1,1])for(let i=0;i<count;i++)for(let j=0;j<11;j++){
  const center=-b.length/2+span*(i+.5),r=span*.5-.70,a=(j+.5)/11*Math.PI,u=center+Math.cos(a)*(r+.19),y=level-2.1+Math.sin(a)*1.80;
  const o=block16(g,u,y,side*(b.width/2+.025),Math.max(.35,span/11),.34,.26,'wall',j%3?'#c7c6b1':'#adb5a3');o.rotation.z=Math.atan2(1.8*Math.cos(a),-r*Math.sin(a));
 }
 for(const side of[-1,1]){
  const railZ=side*(b.width/2-.05),pieces=Math.max(1,Math.ceil(b.length/2.4)),step=b.length/pieces;
  for(let i=0;i<pieces;i++){
   const u=-b.length/2+(i+.5)*step,wx=x+c*u-s*railZ,wz=z+s*u+c*railZ;
   if(bridgeJointInterior38(b,wx,wz,.9)||macroRoadInfo15(wx,wz).d<2.7)continue;
   block16(g,u,level+.60,railZ,step+.015,1.20,.42,'wall','#bfc2ac');block16(g,u,level+1.27,railZ,step+.025,.18,.64,'wall','#dad2b8');obstacle(wx,wz,Math.abs(c)*step+Math.abs(s)*.46,Math.abs(s)*step+Math.abs(c)*.46,'bridge rail');
  }
  for(let i=0;i<=count;i++){
   const u=-b.length/2+i*span,wx=x+c*u-s*railZ,wz=z+s*u+c*railZ;if(bridgeJointInterior38(b,wx,wz,1.2))continue;
   block16(g,u,level+.76,railZ,.93,1.52,.92,'wall','#c0c1aa');block16(g,u,level+1.60,railZ,1.16,.18,1.1,'wall','#d9d0b4');
   if(i===0||i===count){block16(g,u,level+1.89,railZ,.40,.42,.40,'darkWood','#786b51');block16(g,u,level+1.90,railZ,.29,.29,.44,'window','#ead1a0');piece16(g,geo16('bridge-lamp71',()=>new THREE.ConeGeometry(.39,.24,4)),'metal','#706d58',u,level+2.22,railZ);}
  }
 }
 mergeGroup(g);return g;
}
