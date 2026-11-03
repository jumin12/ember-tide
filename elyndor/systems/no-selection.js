// Game text and artwork are controls/presentation, rather than a selectable
// document. Keep normal clicks, keyboard focus, caret movement and typing.
function clearGameSelection49(){
 const selection=window.getSelection();if(selection&&!selection.isCollapsed)selection.removeAllRanges();
 const control=document.activeElement;
 if(control&&typeof control.selectionStart==='number'&&control.selectionStart!==control.selectionEnd){const caret=control.selectionEnd;try{control.setSelectionRange(caret,caret);}catch{}}
}
document.addEventListener('selectstart',event=>event.preventDefault(),true);
document.addEventListener('dragstart',event=>event.preventDefault(),true);
document.addEventListener('selectionchange',clearGameSelection49);
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'){event.preventDefault();event.stopImmediatePropagation();clearGameSelection49();}},true);
window.addEventListener('blur',clearGameSelection49);
clearGameSelection49();
