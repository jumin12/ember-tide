// The ocean surrounds the entire atlas. Its shallows follow distance to land,
// including outside the saved terrain rectangle, rather than that rectangle's edge.
const coastalOcean50={texture:null,pad:320,cell:4,bounds:null,width:0,height:0};
function coastalBathymetry50(){
 const q=coastalOcean50;if(q.texture)return q.texture;
 const x0=LAND.minX-q.pad,z0=LAND.minZ-q.pad,w=(LAND.maxX-LAND.minX+q.pad*2)/q.cell+1,h=(LAND.maxZ-LAND.minZ+q.pad*2)/q.cell+1,n=w*h,distances=new Float32Array(n).fill(1e6),heights=new Float32Array(n).fill(-32);
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){
  const xx=x0+x*q.cell,zz=z0+z*q.cell,i=z*w+x;
  if(xx<LAND.minX||xx>LAND.maxX||zz<LAND.minZ||zz>LAND.maxZ)continue;
  heights[i]=macroGround(xx,zz);if(heights[i]>-1.4)distances[i]=0;
 }
 const orth=q.cell,diag=q.cell*Math.SQRT2;
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const i=z*w+x;let d=distances[i];if(x)d=Math.min(d,distances[i-1]+orth);if(z){d=Math.min(d,distances[i-w]+orth);if(x)d=Math.min(d,distances[i-w-1]+diag);if(x<w-1)d=Math.min(d,distances[i-w+1]+diag);}distances[i]=d;}
 for(let z=h-1;z>=0;z--)for(let x=w-1;x>=0;x--){const i=z*w+x;let d=distances[i];if(x<w-1)d=Math.min(d,distances[i+1]+orth);if(z<h-1){d=Math.min(d,distances[i+w]+orth);if(x)d=Math.min(d,distances[i+w-1]+diag);if(x<w-1)d=Math.min(d,distances[i+w+1]+diag);}distances[i]=d;}
 const bytes=new Uint8Array(n);
 for(let i=0;i<n;i++){const bed=distances[i]===0?heights[i]:Math.max(-32,-1.4-distances[i]*.22);bytes[i]=Math.round(clamp((bed+32)/192,0,1)*255);}
 q.texture=new THREE.DataTexture(bytes,w,h,THREE.RedFormat);q.texture.minFilter=q.texture.magFilter=THREE.LinearFilter;q.texture.wrapS=q.texture.wrapT=THREE.ClampToEdgeWrapping;q.texture.needsUpdate=true;
 q.bounds=[x0,z0,(w-1)*q.cell,(h-1)*q.cell];q.width=w;q.height=h;return q.texture;
}
const coastCaptureBefore50=captureMacroMap17;
captureMacroMap17=function(...args){
 const result=coastCaptureBefore50(...args),s=macroMap17.scene;if(!s||s.userData.coastalOcean50)return result;
 const texture=coastalBathymetry50(),bounds=new THREE.Vector4(...coastalOcean50.bounds);
 s.traverse(o=>{if(!o.userData.ocean38||!o.material)return;const m=o.material,before=m.onBeforeCompile,key=m.customProgramCacheKey();
  m.onBeforeCompile=sh=>{before(sh);sh.uniforms.oceanRelief38.value=texture;sh.uniforms.oceanBounds50={value:bounds};sh.fragmentShader='uniform vec4 oceanBounds50;\n'+sh.fragmentShader;
   sh.fragmentShader=sh.fragmentShader.replace(/vec2 coastUV38=.*?float shallows38=smoothstep\(-10\.,0\.,seaBed38\);/,'vec2 coastUV38=(mapWorld17.xz-oceanBounds50.xy)/oceanBounds50.zw;float seaBed38=texture2D(oceanRelief38,clamp(coastUV38,0.,1.)).r*192.-32.;float shallows38=smoothstep(-22.,-1.4,seaBed38);');
  };m.customProgramCacheKey=()=>key+'-continuous-shores50';m.needsUpdate=true;
 });s.userData.coastalOcean50={padding:coastalOcean50.pad,texture:[coastalOcean50.width,coastalOcean50.height],source:'distance to actual land, padded beyond every atlas edge'};return result;
};
