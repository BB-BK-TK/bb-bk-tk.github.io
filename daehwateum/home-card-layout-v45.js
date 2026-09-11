(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false;
function fixCard(card){
  var avatars=card.querySelector(':scope > .space-avatars-v44');
  var info=card.querySelector(':scope > div:not(.space-avatars-v44)');
  if(!info)return;
  var misplaced=avatars&&avatars.querySelector(':scope > .space-answer-status');
  if(misplaced)info.appendChild(misplaced);
}
function patch(){
  queued=false;
  document.querySelectorAll('.spacecard').forEach(fixCard);
}
function schedule(){
  if(queued)return;queued=true;requestAnimationFrame(patch);
}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
schedule();
setTimeout(schedule,500);
setTimeout(schedule,1800);
})();
