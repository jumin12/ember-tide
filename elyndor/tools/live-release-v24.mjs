import{chromium}from'playwright';import fs from'node:fs';import crypto from'node:crypto';
const out='output/elyndor/pixellab-v24/live',release=JSON.parse(fs.readFileSync('release.json','utf8'));
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
 await page.waitForFunction(()=>window.__ely&&title19.ready&&!title19.busy);
 report.title=await page.evaluate(()=>({changelog:document.querySelector('.title-news19').textContent.includes('Alpha Version 1.0')&&document.querySelectorAll('.alpha-section21').length===11&&[...document.querySelectorAll('.alpha-section21 summary')].some(q=>q.textContent==='Reference atmosphere and expanded locations'),partyHidden:![player,...followers].some(a=>a.mesh.visible||a.shadow.visible),leftNavigation:document.querySelector('.title-copy').getBoundingClientRect().right<document.querySelector('#title-right19').getBoundingClientRect().left}));
 await page.screenshot({path:out+'/live-title.png'});await page.click('#title-load19');report.slots=await page.locator('#title-right19 .journey-slot19').count();await page.screenshot({path:out+'/live-slots.png'});await page.keyboard.press('Escape');
 await page.click('#start-btn');await page.waitForFunction(()=>document.querySelector('#load-screen').classList.contains('hidden'),null,{timeout:120000});await page.evaluate(()=>{state.settings.voices=false;state.settings.volume=0;stopRecordedVoice(true);while(dialogue)nextDialogue();});
 await page.evaluate(()=>{manualUntil=performance.now()+600000;state.settings.volume=0;state.settings.voices=false;state.encounterDistance=-1000000;});
 const before=await page.evaluate(()=>({x:player.x,z:player.z}));await page.keyboard.down('d');await page.evaluate(()=>advanceTime(350,false));await page.keyboard.up('d');
 report.play=await page.evaluate(()=>{render();const r=JSON.parse(render_game_to_text());return{mode:r.mode,player:r.player,followers:r.followers,title:document.title,sharpWorld:!post.material.fragmentShader.includes('depthFocus'),samples:post.target.samples,buffer:renderer.getDrawingBufferSize(new THREE.Vector2()).toArray(),cameraYaw:Math.atan2(camera.position.x-cameraTarget.x,camera.position.z-cameraTarget.z)*180/Math.PI,materials:terrainTileNames.length,tutorialTextOnly:r.tutorialVoice===false,recordedVoices:r.voice.recordedClips,entranceSeal:!!world.userData.entranceSeal22,bloom:cinema22.renders>0};});
 report.moved=Math.hypot(report.play.player.x-before.x,report.play.player.z-before.z)>.5;
 await page.screenshot({path:out+'/live-game.png'});
 // The southwest camera makes D travel southeast in world coordinates. Use
 // the actual entrance seal for the separate real-E service assertion.
 await page.evaluate(()=>{const s=world.userData.saveCircles.find(o=>o.entrance22);setupParty([s.x,s.z]);updateCamera(1,true);tick(1/60);render();});
 await page.keyboard.press('e');report.entranceSave=await page.evaluate(()=>menu?.tab==='save'&&document.querySelectorAll('#menu-content .journey-slot19').length===3);await page.screenshot({path:out+'/live-save-seal.png'});await page.keyboard.press('Escape');await page.keyboard.press('i');report.inventoryOpened=await page.evaluate(()=>!!menu);await page.screenshot({path:out+'/live-inventory.png'});await page.keyboard.press('Escape');
 report.errors=errors;report.pass=report.httpStatus===200&&report.matchesTestedArtifact&&report.title.changelog&&report.title.partyHidden&&report.title.leftNavigation&&report.slots===3&&report.play.mode==='explore'&&report.play.sharpWorld&&report.play.samples>=2&&report.play.cameraYaw<0&&report.play.cameraYaw>-30&&report.moved&&report.play.tutorialTextOnly&&report.play.recordedVoices===259&&report.play.entranceSeal&&report.play.bloom&&report.entranceSave&&report.inventoryOpened&&!errors.length;
 fs.writeFileSync(out+'/live-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.pass)process.exitCode=1;
}catch(e){report.failure=e.stack;report.errors=errors;fs.writeFileSync(out+'/live-verification.json',JSON.stringify(report,null,2));throw e;}finally{await browser.close();}
