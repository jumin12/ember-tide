// Dynamic browser chrome and the on-screen keyboard can reduce the visible
// viewport without changing the game's layout viewport or canvas coordinates.
function phoneViewport62(){
 const v=window.visualViewport;document.documentElement.style.setProperty('--phone-height62',(v?.height??innerHeight)+'px');document.documentElement.style.setProperty('--phone-top62',(v?.offsetTop??0)+'px');
}
window.addEventListener('resize',phoneViewport62);window.visualViewport?.addEventListener('resize',phoneViewport62);window.visualViewport?.addEventListener('scroll',phoneViewport62);phoneViewport62();
const phoneMenuBefore62=openMenu;
openMenu=function(...args){if(devConsole60.open&&devConsole60.root?.querySelector('.dev-mobile62'))hideDevConsole60();const result=phoneMenuBefore62(...args);updateMobile33();return result;};
const phoneCloseMenuBefore62=closeMenu;
closeMenu=function(...args){const result=phoneCloseMenuBefore62(...args);updateMobile33();return result;};
