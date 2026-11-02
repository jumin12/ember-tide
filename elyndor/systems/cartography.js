// The current atlas adds three coastal landmarks outside the approved story
// chapters. They are modeled in both the overworld and its shared 3D map;
// no unapproved quest, vendor stock or campaign is invented for them.
function buildAtlasHarbors(){
 world.userData.atlasHarbors=[];
 for(const id of ['volcanic-port','desert-port','barrens-port']){
  const ref=atlasPoint18(id);if(!ref)continue;const [x,z]=atlasXY18(ref.x,ref.y),g=new THREE.Group(),sand=id==='desert-port',basalt=id==='volcanic-port',stone=sand?'#d2b486':basalt?'#727b7e':'#b7b8a5';g.position.set(x,0,z);world.add(g);
  // Align the landing toward deeper water; the lodge stays on its inland end.
  let angle=0,lowest=Infinity;for(let i=0;i<24;i++){const a=i*TAU/24,y=macroGround(x+Math.sin(a)*12,z+Math.cos(a)*12);if(y<lowest){lowest=y;angle=a;}}
  g.rotation.y=angle;const local=(xx,zz)=>V3(xx,0,zz).applyAxisAngle(V3(0,1,0),angle).add(V3(x,0,z)),h=Math.max(.5,Math.min(4,macroGround(x,z)+.15));
  for(let row=0;row<7;row++){
   const zz=-4+row*1.3,p=local(0,zz),bed=macroGround(p.x,p.z),bottom=Math.min(h-.2,Math.max(-3,bed));
   box(0,(h+bottom)/2,zz,5.8,h-bottom,1.32,'rock',stone,g);box(0,h+.08,zz,5.9,.16,1.32,sand?'wall':'wood',sand?'#ded0ac':'#c3b28b',g);
   for(const side of[-1,1]){box(side*2.8,h+.4,zz,.22,.8,.22,'darkWood','#8c7b60',g);if(row<6)box(side*2.8,h+.7,zz+.65,.1,.12,1.3,'wood','#a18e6c',g);}
  }
  const back=local(0,-8),floor=Math.max(.5,macroGround(back.x,back.z));box(0,floor+1.8,-8,5,3.6,4,sand?'wall':'wood',sand?'#d8bc8e':basalt?'#aaa48e':'#b4ab8d',g);
  const roof=archRoof(g,5.7,4.7,sand?.7:1.9,'brook');roof.position.set(0,floor+3.6,-8);
  box(-.9,floor+1.15,-5.95,1.2,2.3,.12,'darkWood','#7a6549',g);box(1.2,floor+1.8,-5.9,1,.9,.12,'window','#e4c789',g);
  if(basalt){for(const xx of[-2,2])box(xx,h+2.4,1.5,.22,4.8,.22,'darkWood','#8f7654',g);box(0,h+4.8,1.5,5.4,.24,.3,'wood','#b49a6c',g);beam(V3(0,h+4.8,1.5),V3(0,h+1.8,1.5),.035,'metal','#726a55',g);}
  if(sand){for(const xx of[-2.6,2.6])box(xx,h+1.6,-2,.14,3.2,.14,'wood','#b89b6e',g);box(0,h+3.2,-2,5.7,.1,3.8,'cloth','#e3d8b7',g);}
  if(id==='barrens-port'){for(const xx of[-3.8,3.8])box(xx,floor+2,-7.5,.7,4,.9,'wall',stone,g);box(-2,floor+4.2,-7.5,3.2,.65,1,'rock',stone,g);box(2.8,floor+4.15,-7.5,1.7,.65,1,'rock',stone,g);}
  for(const xx of[-1.8,1.6])box(xx,h+.55,-2,.75,.9,.8,'crateFace','#b8a27b',g);
  mergeGroup(g);g.userData.atlasLandmark=id;g.userData.worldHouse=true;world.userData.buildings.push(g);world.userData.atlasHarbors.push({id,x,z,region:ref.region,facilities:[...ref.facilities],source:ATLAS18.source});
 }
}
