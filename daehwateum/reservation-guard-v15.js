(function(){'use strict';
var opening=false,timer=null;
function ko(){return (navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function openQueue(){
  if(opening)return;
  if(!window.DT||typeof DT.openQuestionQueue!=='function')return;
  opening=true;
  try{DT.openQuestionQueue()}finally{setTimeout(function(){opening=false},250)}
}
function isLegacyBlock(){
  var app=document.getElementById('app');
  if(!app||app.querySelector('.question-queue-screen'))return false;
  var card=app.querySelector('.card.intro');
  if(!card)return false;
  var h=((card.querySelector('h1')||{}).textContent||'').trim();
  var p=((card.querySelector('p')||{}).textContent||'').trim();
  var titleHit=ko()?(/질문 예약|직접 질문/.test(h)):(/reserve|ask my own question|custom question/i.test(h));
  var waitHit=ko()?(p.indexOf('3시간')>=0):(/3\s*hours?|every 3/i.test(p));
  return titleHit&&waitHit;
}
function check(){
  if(timer)clearTimeout(timer);
  timer=setTimeout(function(){timer=null;if(isLegacyBlock())openQueue()},0);
}
document.addEventListener('click',function(ev){
  var target=ev.target&&ev.target.closest&&ev.target.closest('[data-a="custom"]');
  if(!target)return;
  ev.preventDefault();
  ev.stopPropagation();
  ev.stopImmediatePropagation();
  openQueue();
},true);
function start(){
  var app=document.getElementById('app');
  if(app)new MutationObserver(check).observe(app,{subtree:true,childList:true});
  check();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
