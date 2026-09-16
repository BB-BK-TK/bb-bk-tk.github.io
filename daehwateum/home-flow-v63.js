(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false,countdownTimer=null;
function isKo(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function doneLabel(d){var n=Math.max(1,parseInt(d&&d.round_sequence||1,10)||1);if(isKo())return n===1?'첫 대화를 마쳤어요':n+'번째 대화를 마쳤어요';return n===1?'First conversation complete':'Conversation '+n+' complete'}
function isReady(d){
  if(!d||!d.round_completed_at||d.is_paused)return false;
  if(Number(d.participant_count||0)<Number(d.max_participants||2))return false;
  if(d.can_start_next)return true;
  if(!d.next_round_at)return false;
  var due=new Date(d.next_round_at);return !isNaN(due.getTime())&&Date.now()>=due.getTime();
}
/* This line is the only thing under the completed card, so it has to say what is
   actually happening. Falling through to a countdown while the room is paused
   read as "preparing", and saying nothing at all when the server has not set a
   next time yet left the card with no status. */
function countdownLabel(d){
  if(!d)return'';
  if(isReady(d))return isKo()?'다음 대화가 준비됐어요':'Next conversation is ready';
  if(d.is_paused)return isKo()?'무료 7일이 끝나 잠시 쉬고 있어요':'Paused after the free 7 days';
  if(Number(d.participant_count||0)<Number(d.max_participants||2))
    return isKo()?'상대방이 들어오면 다음 대화가 열려요':'The next conversation opens once everyone has joined';
  var due=d.next_round_at?new Date(d.next_round_at):null;
  if(!due||isNaN(due.getTime()))return isKo()?'다음 대화 시간을 확인하고 있어요':'Checking the next conversation time';
  var left=due.getTime()-Date.now();
  if(left<=0)return isKo()?'다음 대화를 준비하고 있어요':'Preparing the next conversation';
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
function ensureReadyAction(d,w,summary){
  var sec=w.querySelector('.post-reveal-current');if(!sec)return;
  var fallback=sec.querySelector('.home-ready-next-v69');
  if(!isReady(d)){if(fallback)fallback.remove();return}
  var existing=sec.querySelector('[data-a="next"]');
  if(existing){if(fallback&&fallback!==existing.closest('.home-ready-next-v69'))fallback.remove();return}
  if(!summary)return;
  if(!fallback){
    fallback=document.createElement('section');
    fallback.className='next-gate timing-ready home-ready-next-v69';
    fallback.innerHTML='<button type="button" class="btn full next-question-primary" data-a="next">'+(isKo()?'다음 질문 열기 →':'Open next question →')+'</button>';
    summary.insertAdjacentElement('afterend',fallback);
  }
}
function patch(){
  var d=state(),w=app.querySelector(':scope > .w');
  if(!d||!w||!w.classList.contains('post-reveal-home'))return;
  var summary=w.querySelector('.post-reveal-summary'),label='';
  if(summary)label=patchSummary(d,summary);
  ensureReadyAction(d,w,summary);
  var gate=w.querySelector('.post-reveal-current > .next-gate.timing-ready:not(.premium-continuation-gate):not(.home-ready-next-v69)');
  if(gate){var hasNext=!!gate.querySelector('[data-a="next"]'),text=String(gate.textContent||'');var reflection=/회고|reflection/i.test(text);gate.classList.toggle('home-countdown-absorbed-v67',!!label&&!hasNext&&!reflection)}
  var q=w.querySelector(':scope > .queue-summary-card.queue-summary-merged');
  if(q&&!q.classList.contains('has-reserved-questions')){var queueTitle=q.querySelector('.queue-module-title');var wanted=isKo()?'물어보고 싶은 질문이 있나요?':'Anything you want to ask?';if(queueTitle&&queueTitle.textContent!==wanted)queueTitle.textContent=wanted}
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;patch()})}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
schedule();setTimeout(schedule,100);setTimeout(schedule,500);setTimeout(schedule,1500);countdownTimer=setInterval(schedule,30000);
})();
