// Small screens use fixed, separate HUD lanes. Help opens as a sheet during
// exploration; combat retains its protected timing/help layout.
const phone69={guide:false,key:''};
function syncPhone69(){
 const compact=document.body.classList.contains('compact33');
 document.documentElement.style.setProperty('--phone-party69',String(Math.max(1,state.members.length)));
 let button=$('#phone-guide69');if(!button){button=document.createElement('button');button.id='phone-guide69';button.type='button';button.innerHTML='<b>Guide</b><span></span>';button.setAttribute('aria-controls','journey-guide');$('#hud').append(button);button.onclick=()=>{phone69.guide=!phone69.guide;if(phone69.guide){tutorialState16().hidden=false;mentorState17().enabled=true;updateGuide16();}syncPhone69();};}
 const key=mentorStep17(),guide=onboarding16.node,available=compact&&!battle&&!menu&&!dialogue&&!!key&&!gameLoading;
 button.hidden=!available;button.setAttribute('aria-expanded',String(phone69.guide));const label=key?TUTOR17[key]?.title??'Journey help':'';if(button.lastChild.textContent!==label)button.lastChild.textContent=label;
 if(!available||guide?.classList.contains('hidden'))phone69.guide=false;
 document.body.classList.toggle('phone-guide69',compact&&phone69.guide);
 document.body.classList.toggle('phone-reward69',compact&&!battle&&!menu&&!!$('#quest-reward65')&&!$('#quest-reward65').hidden);
 document.body.toggleAttribute('data-phone-dev69',compact&&devConsole60.unlocked&&!devConsole60.open);
 if(compact&&(phone69.guide||document.body.classList.contains('quest-open33')||document.body.classList.contains('phone-reward69')))releaseTouch33();
 const action=$('#touch-action33');if(action){const o=contextTarget63,text=o?contextLabel63(o):'Interact';if(action.textContent!==text)action.textContent=text;action.disabled=!o;action.setAttribute('aria-label',o?.label??'No nearby interaction');action.onclick=()=>{if(!departureControlAvailable())return;const target=nearestInteraction();if(!target)return;initAudio();if(isBuildingPortal48(target))confirmBuildingPortal48();else if(target.type==='poiExit')confirmDeparture();else if(target.type==='location')confirmWorldEntrance();else act(target);};}
}
const phoneLayoutBefore69=layoutMobile33;
layoutMobile33=function(...args){const r=phoneLayoutBefore69(...args);syncPhone69();return r;};
const phoneOpenBefore69=openMenu;
openMenu=function(...args){const previous=menu?.tab,r=phoneOpenBefore69(...args);if(document.body.classList.contains('compact33')&&menu){if(previous!==menu.tab)$('#menu-content').scrollTop=0;const nav=$('#menu-nav'),button=nav.querySelector('.active');if(button){const a=button.getBoundingClientRect(),b=nav.getBoundingClientRect();if(a.right>b.right)nav.scrollLeft+=a.right-b.right+8;else if(a.left<b.left)nav.scrollLeft+=a.left-b.left-8;}}return r;};
const phoneRenderBefore69=render;
render=function(...args){const r=phoneRenderBefore69(...args);if(player&&mobile33.root)syncPhone69();return r;};
