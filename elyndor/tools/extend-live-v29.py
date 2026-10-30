from pathlib import Path
p=Path(__file__).with_name('live-release-v29.mjs');s=p.read_text(encoding='utf-8')
needle="await page.keyboard.press('Escape');await page.evaluate(()=>{state.flags.combat_tutorial_complete=true;setupParty"
insert="""await page.keyboard.press('Escape');
 await page.evaluate(async()=>{await changeJourneyScene('brookInn',[-4.5,-2.1]);for(let i=0;i<4;i++)tick(1/60);updateCamera(1,true);render();});
 await page.screenshot({path:out+'/live-inn.png'});
 report.interiors=await page.evaluate(()=>({key:activeScene.key,pitch:Math.atan2(camera.position.y-cameraTarget.y,camera.position.z-cameraTarget.z)*180/Math.PI,chairs:world.userData.chairs29.length,loadingStills:document.querySelectorAll('.loading-scenery figure').length,newMaterials:['rug29','panel29','hearth29','landscape29'].every(key=>!!textures[key])}));
 await page.evaluate(()=>changeJourneyScene('entrance'));await page.waitForFunction(()=>!gameLoading);
 await page.evaluate(()=>{state.flags.combat_tutorial_complete=true;setupParty"""
assert needle in s;s=s.replace(needle,insert)
s=s.replace('report.pass=report.targeting.bars',"report.pass=report.interiors.key==='brookInn'&&report.interiors.pitch>24&&report.interiors.pitch<26&&report.interiors.chairs===6&&report.interiors.loadingStills===4&&report.interiors.newMaterials&&report.targeting.bars")
p.write_text(s,encoding='utf-8')
