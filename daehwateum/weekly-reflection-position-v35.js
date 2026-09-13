(function(){'use strict';
var queued=false;
function conversationHistory(app){
  var roots=app.querySelectorAll('.hist:not(.weekly-reflection-history)');
  for(var i=0;i<roots.length;i++){
    if(roots[i].querySelector('.hist-day'))return roots[i];
  }
  return roots[0]||null;
}
function place(){
  var app=document.getElementById('app');if(!app)return;
  var root=app.querySelector('#weekly-reflection-v35-root');if(!root)return;
  var hist=conversationHistory(app);
  if(hist&&hist.parentNode){
    if(root.previousElementSibling!==hist)hist.insertAdjacentElement('afterend',root);
    return;
  }
  var queue=app.querySelector('.queue-summary-card');
  if(queue&&queue.parentNode&&root.previousElementSibling!==queue){queue.insertAdjacentElement('afterend',root);return}
  if(queue)return;
  var gate=app.querySelector('.next-gate');
  if(gate&&gate.parentNode&&root.previousElementSibling!==gate)gate.insertAdjacentElement('afterend',root);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;place()})}
function start(){var app=document.getElementById('app');if(!app)return;new MutationObserver(schedule).observe(app,{childList:true,subtree:true});place()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
