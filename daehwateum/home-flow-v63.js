(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false;
function isKo(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function doneLabel(d){var n=Math.max(1,parseInt(d&&d.round_sequence||1,10)||1);if(isKo())return n===1?'첫 대화를 마쳤어요':n+'번째 대화를 마쳤어요';return n===1?'First conversation complete':'Conversation '+n+' complete'}
function patch(){
  var d=state(),w=app.querySelector(':scope > .w');
  if(!d||!w||!w.classList.contains('post-reveal-home'))return;
  var summary=w.querySelector('.post-reveal-summary');
  if(summary){var b=summary.querySelector('b');if(b&&b.textContent!==doneLabel(d))b.textContent=doneLabel(d);summary.setAttribute('aria-label',doneLabel(d)+(isKo()?' · 답변 다시 보기':' · Review answers'))}
  var q=w.querySelector(':scope > .queue-summary-card.queue-summary-merged');
  if(q&&!q.classList.contains('has-reserved-questions')){var title=q.querySelector('.queue-module-title');var wanted=isKo()?'물어보고 싶은 질문이 있나요?':'Anything you want to ask?';if(title&&title.textContent!==wanted)title.textContent=wanted}
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;patch()})}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
schedule();setTimeout(schedule,100);setTimeout(schedule,500);setTimeout(schedule,1500);
})();
