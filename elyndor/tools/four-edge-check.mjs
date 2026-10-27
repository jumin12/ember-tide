import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const out='output/elyndor/release-v6';fs.mkdirSync(out,{recursive:true});
const url=process.argv[2]?.startsWith('http')?process.argv[2]:pathToFileURL(path.resolve(process.argv[2]??'index.html')).href;
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--allow-file-access-from-files','--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],report={url};
page.setDefaultTimeout(240000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.goto(url,{timeout:240000});await page.waitForFunction(()=>window.__ely);await page.click('#start-btn');await page.keyboard.press('Space');await page.keyboard.press('Space');
 await page.evaluate(()=>{manualUntil=performance.now()+600000;state.settings.volume=0;state.settings.voices=false;state.encounterDistance=-1000000;state.members=['bren','soren','tavin','mira'];});
 // Exercise the real GPU post shader with a known detailed signal. Compare
 // strength on/off at all four edges and the focal center at two aspect ratios.
 report.blur=await page.evaluate(()=>{
  const u=post.material.uniforms,saved={tex:u.colorTex.value,res:u.resolution.value.clone(),strength:u.strength.value},rows=[];
  try{for(const[w,h]of[[512,512],[800,450],[360,640]]){
   const data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,c=((x>>1)+(y>>1))%2*255;data[i]=data[i+1]=data[i+2]=c;data[i+3]=255;}
   const tex=new THREE.DataTexture(data,w,h);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.needsUpdate=true;
   const target=new THREE.WebGLRenderTarget(w,h),captures=[];u.colorTex.value=tex;u.resolution.value.set(w,h);
   for(const strength of[0,1]){u.strength.value=strength;renderer.setRenderTarget(target);renderer.render(post.scene,post.camera);const pixels=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(target,0,0,w,h,pixels);captures.push(pixels);}
   const patches={left:[32,h/2],right:[w-32,h/2],top:[w/2,h-32],bottom:[w/2,32],center:[w/2,h/2]},difference={};
   for(const[name,[cx,cy]]of Object.entries(patches)){let sum=0,n=0;for(let y=Math.round(cy)-8;y<Math.round(cy)+8;y++)for(let x=Math.round(cx)-8;x<Math.round(cx)+8;x++){const i=(y*w+x)*4;sum+=Math.abs(captures[0][i]-captures[1][i]);n++;}difference[name]=sum/n;}
   rows.push({size:[w,h],difference,allEdgesBlur:['left','right','top','bottom'].every(k=>difference[k]>8),centerUnchanged:difference.center===0});
   tex.dispose();target.dispose();
  }}finally{u.colorTex.value=saved.tex;u.resolution.value.copy(saved.res);u.strength.value=saved.strength;renderer.setRenderTarget(null);render();}
  return rows;
 });
 report.materials=await page.evaluate(()=>({tiles:terrainTileNames.map(k=>({id:k,size:[textures[k].image.width,textures[k].image.height],anisotropy:textures[k].anisotropy})),arrayAnisotropy:scenery.surfaceArray.anisotropy,limit:renderer.capabilities.getMaxAnisotropy()}));
 report.scenes=[];
 for(const[name,x,z,hour]of[['Town',-77,93,16.5],['Canal',-116,51,17],['Forest',5,86,16],['Night',-77,93,21]]){
  const data=await page.evaluate(({x,z,hour})=>{const p=safePoint({x,z});setupParty([p.x,p.z]);state.scene=areaAt(p.x,p.z);state.worldMinutes=hour*60;for(let i=0;i<20;i++)tick(1/60);updateCamera(1,true);updateLighting();$('#toast')?.classList.add('hidden');render();return{area:state.scene,members:[player,...followers].map(a=>({id:a.id,x:a.x,z:a.z,free:staticFree(a.x,a.z,.34),frame:a.frame})),world:world.userData.serial};},{x,z,hour});
  await page.screenshot({path:out+'/'+name+'.png'});report.scenes.push({name,...data});
 }
 await page.evaluate(()=>openMenu('party'));await page.screenshot({path:out+'/Party.png'});await page.keyboard.press('Escape');
 report.errors=errors;report.pass=report.blur.every(r=>r.allEdgesBlur&&r.centerUnchanged)&&report.materials.tiles.every(t=>t.size[0]===512&&t.size[1]===512)&&report.scenes.every(r=>r.members.every(a=>a.free))&&!errors.length;
 fs.writeFileSync(out+'/four-edge-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,scenes:report.scenes.map(({name,area})=>({name,area}))}));if(!report.pass)process.exitCode=1;
}finally{await browser.close();}
