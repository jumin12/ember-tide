import{chromium}from'playwright';import fs from'node:fs';import crypto from'node:crypto';
const out='output/elyndor/pixellab-v12/live',release=JSON.parse(fs.readFileSync('release.json','utf8'));
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],report={url:'https://jumin12.github.io/ember-tide/'};page.setDefaultTimeout(240000);
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.location().url+': '+m.text());});
try{
 const liveUrl=report.url+'?release='+release.artifact.sha256.slice(0,12);
 // The embedded build exceeds Chromium's default inspector body cache. Use
 // the request context to hash the complete response, then boot it in-page.
 const response=await page.request.get(liveUrl,{timeout:240000});
 const body=await response.body();report.httpStatus=response.status();report.bytes=body.length;report.sha256=crypto.createHash('sha256').update(body).digest('hex');report.matchesTestedArtifact=report.sha256===release.artifact.sha256;
 if(!report.matchesTestedArtifact)throw Error('Live artifact differs from the exact tested build');
 const navigation=await page.goto(liveUrl,{timeout:240000});report.browserHttpStatus=navigation.status();
 await page.waitForFunction(()=>window.__ely);await page.click('#start-btn');await page.waitForFunction(()=>document.querySelector('#load-screen').classList.contains('hidden'),null,{timeout:120000});await page.keyboard.press('Space');await page.keyboard.press('Space');
 await page.evaluate(()=>{manualUntil=performance.now()+600000;state.settings.volume=0;state.settings.voices=false;state.encounterDistance=-1000000;});
 const before=await page.evaluate(()=>({x:player.x,z:player.z}));await page.keyboard.down('d');await page.evaluate(()=>advanceTime(350,false));await page.keyboard.up('d');
 report.play=await page.evaluate(()=>{render();const r=JSON.parse(render_game_to_text());return{mode:r.mode,player:r.player,followers:r.followers,title:document.title,blurSides:post.material.fragmentShader.includes('float horizontal='),materials:terrainTileNames.length};});
 report.moved=Math.hypot(report.play.player.x-before.x,report.play.player.z-before.z)>.5;
 await page.screenshot({path:out+'/live-game.png'});await page.keyboard.press('i');report.inventoryOpened=await page.evaluate(()=>!!menu);await page.screenshot({path:out+'/live-inventory.png'});await page.keyboard.press('Escape');
 report.errors=errors;report.pass=report.httpStatus===200&&report.matchesTestedArtifact&&report.play.mode==='explore'&&report.moved&&report.inventoryOpened&&!errors.length;
 fs.writeFileSync(out+'/live-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.pass)process.exitCode=1;
}catch(e){report.failure=e.stack;report.errors=errors;fs.writeFileSync(out+'/live-verification.json',JSON.stringify(report,null,2));throw e;}finally{await browser.close();}
