(function(){'use strict';
var app=document.getElementById('app');
if(!app)return;
var queued=false;
function isKo(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function completeLabel(d){
  var n=Math.max(1,parseInt(d&&d.round_sequence||1,10)||1);
  if(isKo())return n===1?'첫 대화를 마쳤어요':n+'번째 대화를 마쳤어요';
  return n===1?'First conversation complete':'Conversation '+n+' complete';
}
function patchCompleted(d){
  app.querySelectorAll('.post-reveal-current .post-reveal-summary').forEach(function(summary){
    summary.classList.add('home-complete-v62');
    var b=summary.querySelector('b');
    if(b)b.setAttribute('data-v62-title',completeLabel(d));
    summary.setAttribute('aria-label',completeLabel(d)+(isKo()?' · 답변 다시 보기':' · Review answers'));
  });
  app.querySelectorAll('.post-reveal-current .next-gate,.post-reveal-current .premium-continuation-gate').forEach(function(gate){
    var hasAction=!!gate.querySelector('button,[data-a="next"]');
    var text=String(gate.textContent||'').replace(/\s+/g,' ').trim();
    gate.classList.toggle('v62-empty-gate',!hasAction&&!text);
  });
}
function patchQueue(){
  app.querySelectorAll('.queue-summary-card.queue-summary-merged').forEach(function(card){
    card.classList.add('home-queue-v62');
    var hasReserved=card.classList.contains('has-reserved-questions');
    var intro=card.querySelector('.queue-summary-intro');
    var title=intro&&intro.querySelector('.queue-module-title');
    if(!hasReserved&&title){
      var wanted=isKo()?'물어보고 싶은 질문이 있나요?':'Anything you want to ask?';
      if(title.textContent!==wanted)title.textContent=wanted;
    }
    card.setAttribute('data-v62-action',hasReserved?(isKo()?'관리하기':'Manage'):(isKo()?'예약하기':'Reserve'));
  });
}
function patchHistory(){
  app.querySelectorAll('.hist').forEach(function(hist){
    if(!hist.classList.contains('weekly-reflection-history'))hist.classList.add('home-history-v62');
  });
}
function patch(){
  var d=state();
  var w=app.querySelector(':scope > .w');
  if(!d||!w||!w.classList.contains('post-reveal-home'))return;
  patchCompleted(d);
  patchQueue();
  patchHistory();
}
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(function(){queued=false;patch()});
}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
schedule();
setTimeout(schedule,120);
setTimeout(schedule,600);
setTimeout(schedule,1800);
})();
