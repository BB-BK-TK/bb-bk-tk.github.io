(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false,countdownTimer=null;
function isKo(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function doneLabel(d){var n=Math.max(1,parseInt(d&&d.round_sequence||1,10)||1);if(isKo())return n===1?'첫 대화를 마쳤어요':n+'번째 대화를 마쳤어요';return n===1?'First conversation complete':'Conversation '+n+' complete'}
function countdownLabel(d){
  if(!d||d.can_start_next||!d.next_round_at)return'';
  var due=new Date(d.next_round_at);if(isNaN(due.getTime()))return'';
  var left=due.getTime()-Date.now();if(left<=0)return'';
  var total=Math.max(1,Math.ceil(left/60000)),h=Math.floor(total/60),m=total%60;
  var remain=isKo()?(h>0?h+'시간 '+m+'분':m+'분'):(h>0?h+'h '+m+'m':m+'m');
  return isKo()?'다음 대화까지 '+remain:'Next conversation in '+remain;
}
function patchSummary(d,summary){
  var title=doneLabel(d),b=summary.querySelector('b');if(b&&b.textContent!==title)b.textContent=title;
  var box=summary.querySelector(':scope > div'),countdown=box&&box.querySelector('.home-next-countdown-v67'),label=countdownLabel(d);
  if(label&&box){
    if(!countdown){countdown=document.createElement('small');countdown.className='home-next-countdown-v67';box.appendChild(countdown)}
    if(countdown.textContent!==label)countdown.textContent=label;
  }else if(countdown){countdown.remove()}
  summary.setAttribute('aria-label',title+(label?' · '+label:'')+(isKo()?' · 답변 다시 보기':' · Review answers'));
  return label;
}
function patch(){
  var d=state(),w=app.querySelector(':scope > .w');
  if(!d||!w||!w.classList.contains('post-reveal-home'))return;
  var summary=w.querySelector('.post-reveal-summary'),label='';
  if(summary)label=patchSummary(d,summary);
  var gate=w.querySelector('.post-reveal-current > .next-gate.timing-ready:not(.premium-continuation-gate)');
  if(gate){var hasNext=!!gate.querySelector('[data-a="next"]'),text=String(gate.textContent||'');var reflection=/회고|reflection/i.test(text);gate.classList.toggle('home-countdown-absorbed-v67',!!label&&!hasNext&&!reflection)}
  var q=w.querySelector(':scope > .queue-summary-card.queue-summary-merged');
  if(q&&!q.classList.contains('has-reserved-questions')){var queueTitle=q.querySelector('.queue-module-title');var wanted=isKo()?'물어보고 싶은 질문이 있나요?':'Anything you want to ask?';if(queueTitle&&queueTitle.textContent!==wanted)queueTitle.textContent=wanted}
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;patch()})}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
schedule();setTimeout(schedule,100);setTimeout(schedule,500);setTimeout(schedule,1500);countdownTimer=setInterval(schedule,30000);
})();
