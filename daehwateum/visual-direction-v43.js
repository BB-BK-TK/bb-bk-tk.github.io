(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var queued=false,reviewReturnY=0;

function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[x]})}
function nl(v){return esc(v).replace(/\n/g,'<br>')}
function initial(v){return window.DT&&DT.initial?DT.initial(v):String(v||'?').trim().charAt(0)}
function ordinal(n){return Math.max(1,parseInt(n||1,10)||1)+(ko?'번째':'')}
function copy(k){
  var c={
    closer:['지금, 더 가까워지는 대화','A conversation that brings us closer'],
    closerSub:['오늘도, 작은 질문이 좋은 우리를 만든다','A small question makes room for us today'],
    question:['오늘 {n} 질문','Today’s question {n}'],
    answer:['답변하기','Answer'],
    myAnswerDone:['내 답 완료','My answer done'],
    waitingFor:['{name}의 답을 기다리고 있어요','Waiting for {name}'],
    waitingGeneric:['다른 참여자의 답을 기다리고 있어요','Waiting for the other answers'],
    answersReady:['답변이 모두 도착했어요','All answers are here'],
    reveal:['서로의 답 보기','View our answers'],
    doneTitle:['{n} 대화를 마쳤어요','Conversation {n} complete'],
    review:['답변 다시 보기','Review answers'],
    next:['NEXT','NEXT'],
    nextQuestion:['질문 예약하기','Reserve a question'],
    nextQuestionSub:['다음 질문을 미리 남겨보세요','Leave a question for later'],
    ready:['새 질문이 준비됐어요','A new question is ready'],
    freeDone:['첫 7일의 대화를 마쳤어요','Your first 7 days are complete'],
    freeDoneBody:['지금까지의 대화는 언제든 다시 볼 수 있어요.','You can revisit everything you shared anytime.'],
    continue:['계속 대화하기','Keep talking'],
    back:['돌아가기','Back'],
    reviewTitle:['같은 질문, 여러 개의 마음','One question, many minds'],
    reviewLabel:['{n} 질문','Question {n}'],
    pastReflection:['지난 회고','Past reflections'],
    rhythm:['우리의 대화 리듬','Our conversation rhythm'],
    past:['지난 대화','Past conversations']
  };
  return(c[k]||['',''])[ko?0:1];
}
function format(template,n){return String(template).replace('{n}',ordinal(n))}
function formatName(template,name){return String(template).replace('{name}',name||'')}
function questionText(d){return !ko&&d&&d.question_en?d.question_en:(d&&d.question)||''}

function participantHtml(p,i){
  var photo=p&&(p.avatar_url||p.photo_url||p.image_url);
  var body=photo?'<img src="'+esc(photo)+'" alt="">':esc(initial(p&&p.name));
  return'<span class="relationship-avatar-v43" data-person-index="'+i+'" aria-hidden="true">'+body+'</span>';
}
function relationshipNames(d){
  var parts=Array.isArray(d&&d.participants)?d.participants:[];
  return parts.slice(0,3).map(function(p){return p&&p.name}).filter(Boolean).join(' · ');
}
function ensureRelationshipHero(d,w){
  var top=w.querySelector(':scope > .top');if(!top)return;
  var brand=top.querySelector('.brand');if(brand)brand.textContent=ko?'대화틈':'Daehwateum';
  var old=w.querySelector(':scope > .relationship-hero-v43');
  var parts=Array.isArray(d.participants)?d.participants:[];
  var sig=parts.map(function(p){return[p.name,p.avatar_url||p.photo_url||p.image_url||''].join(':')}).join('|');
  if(!old){old=document.createElement('section');old.className='relationship-hero-v43 relationship-hero-compact-v45';top.insertAdjacentElement('afterend',old)}
  if(old.getAttribute('data-v43-people')===sig&&old.classList.contains('relationship-hero-compact-v45'))return;
  old.className='relationship-hero-v43 relationship-hero-compact-v45';old.setAttribute('data-v43-people',sig);
  var people=parts.slice(0,2).map(participantHtml).join('');
  if(parts.length<2)people+='<span class="relationship-seed-v43" aria-hidden="true"></span>';
  old.innerHTML='<button type="button" class="relationship-compact-button-v45" aria-label="'+(ko?'함께하는 사람 보기':'View people')+'"><span class="relationship-people-v43">'+people+'</span><span class="relationship-compact-copy-v45"><b>'+esc(relationshipNames(d))+'</b><small>'+copy('closer')+'</small></span><i aria-hidden="true">›</i></button>';
}

function getQuestionCard(w){return w.querySelector(':scope > .q')}
function decorateQuestion(d,w){
  var q=getQuestionCard(w);if(!q)return;
  q.classList.add('v45-question-card');q.classList.remove('v43-status-hidden');
  var k=q.querySelector('.k');var label=format(copy('question'),d.round_sequence||1);if(k)k.textContent=label;
  var h=q.querySelector('h1');if(h&&questionText(d)&&h.textContent.trim()!==questionText(d).trim())h.textContent=questionText(d);
  var stage=q.nextElementSibling;
  if(stage&&stage.matches('.card.stage')&&stage.querySelector('#af')){
    stage.classList.add('v45-answer-stage');
    if(!stage.querySelector('.answer-entry-v43')){var b=document.createElement('button');b.type='button';b.className='answer-entry-v43';b.textContent=copy('answer');stage.insertBefore(b,stage.firstChild)}
  }
}
function waitingNames(d){return (Array.isArray(d.participants)?d.participants:[]).filter(function(p){return !p.is_me&&!p.answered}).map(function(p){return p.name}).filter(Boolean)}
function ensureQuestionStatus(q,d){
  var box=q.querySelector('.v45-question-status');if(box)box.remove();
  if(!d||!d.me||!d.me.answered)return;
  var names=waitingNames(d),waiting=!d.unlocked&&names.length>=0;
  if(!waiting)return;
  box=document.createElement('div');box.className='v45-question-status';
  var wait=names.length?formatName(copy('waitingFor'),names.join(', ')):copy('waitingGeneric');
  box.innerHTML='<span class="v45-done"><i aria-hidden="true">✓</i>'+copy('myAnswerDone')+'</span><span class="v45-wait"><i aria-hidden="true">◷</i>'+esc(wait)+'</span>';
  q.appendChild(box);
}
function decorateWaiting(d,w){
  var waiting=!!(d.me&&d.me.answered&&!d.unlocked);var q=getQuestionCard(w);if(!q)return;
  ensureQuestionStatus(q,d);
  var stages=Array.prototype.slice.call(w.querySelectorAll(':scope > .card.stage'));
  stages.forEach(function(stage){if(stage!==q&&stage.getAttribute('data-v43-state')==='waiting')stage.style.display='none'});
  if(!waiting)return;
  var stage=stages.find(function(el){return !el.querySelector('form')&&!el.classList.contains('next-gate')&&!el.classList.contains('queue-summary-card')});
  if(stage){stage.setAttribute('data-v43-state','waiting');stage.style.display='none'}
}
function decorateAnswersReady(d,w){
  var q=getQuestionCard(w);if(!q)return;
  var ready=!!(d.me&&d.me.answered&&d.unlocked===false&&Array.isArray(d.participants)&&d.participants.length>1&&d.participants.every(function(p){return !!p.answered}));
  if(!ready)return;
  ensureQuestionStatus(q,{me:d.me,participants:d.participants,unlocked:true});
  var old=q.querySelector('.v45-ready-block');if(old)old.remove();
  var block=document.createElement('div');block.className='v45-ready-block';block.innerHTML='<b>'+copy('answersReady')+'</b><button type="button" class="btn full" data-a="reveal">'+copy('reveal')+'</button>';q.appendChild(block);
}

function remaining(value){
  var due=value?new Date(value).getTime():NaN;if(!isFinite(due))return ko?'곧 열려요':'Opening soon';
  var mins=Math.max(0,Math.ceil((due-Date.now())/60000));if(mins<=0)return copy('ready');
  var hours=Math.floor(mins/60),rest=mins%60;if(ko)return(hours?hours+'시간 ':'')+(rest?rest+'분':hours?'':'1분');
  return(hours?hours+'h ':'')+(rest?rest+'m':hours?'':'1m');
}
function decorateComplete(d,w){
  var summary=w.querySelector('.post-reveal-summary');if(!summary)return;
  summary.classList.add('v45-complete-summary');
  var b=summary.querySelector('b');var title=d.free_period_ended&&!d.is_premium?copy('freeDone'):format(copy('doneTitle'),d.round_sequence||1);if(b)b.textContent=title;
  var review=summary.querySelector('[data-post-reveal-review]');if(review){review.removeAttribute('data-post-reveal-review');review.remove()}
  summary.setAttribute('data-v44-review-surface','');summary.setAttribute('role','button');summary.setAttribute('tabindex','0');summary.setAttribute('aria-label',copy('review'));
  var gate=w.querySelector('.premium-continuation-gate,.post-reveal-current .next-gate,.next-gate');if(!gate)return;
  gate.classList.add('v45-next-gate');
  var k=gate.querySelector('.k'),h=gate.querySelector('h2');if(k)k.textContent=d.can_start_next?copy('ready'):copy('next');if(h&&!d.can_start_next)h.textContent=remaining(d.next_round_at);
}
function decoratePaused(d,w){
  if(!d.is_paused||!d.free_period_ended)return;var card=w.querySelector('#owner-policy-region .owner-policy-card');if(!card)return;
  card.setAttribute('data-v43-state','free-ended');var h=card.querySelector('h2'),p=card.querySelector('p'),primary=card.querySelector('[data-a="premium"]');
  if(h)h.textContent=copy('freeDone');if(p)p.textContent=copy('freeDoneBody');if(primary)primary.textContent=copy('continue');var summary=w.querySelector('.post-reveal-summary');if(summary)summary.style.display='none';
}
function decorateQueue(w){
  var card=w.querySelector('.queue-summary-card');if(!card)return;card.setAttribute('role','button');card.setAttribute('tabindex','0');card.classList.add('v45-next-row');
  var title=card.querySelector('.queue-module-title');if(title)title.textContent=copy('nextQuestion');
  var p=card.querySelector('.queue-summary-intro p');if(p)p.textContent=copy('nextQuestionSub');
}
function decorateMemory(w){
  var cal=w.querySelector('.cal');if(cal){cal.classList.add('v45-memory-card');var h=cal.querySelector('.caltop h2');if(h)h.textContent=copy('rhythm')}
  var hist=w.querySelector('.hist:not(.weekly-reflection-history)');if(hist)hist.classList.add('v45-history-block');
  var refl=w.querySelector('#weekly-reflection-v35-root');if(refl)refl.classList.add('v45-reflection-block');
}

function reviewAnswer(p){var mine=p&&p.is_me,photo=p&&(p.avatar_url||p.photo_url||p.image_url);var avatar=photo?'<img src="'+esc(photo)+'" alt="">':esc(initial(p&&p.name));return '<article class="v44-review-answer '+(mine?'mine':'other')+'"><header><span class="v44-review-avatar">'+avatar+'</span><b>'+esc(p&&p.name)+(mine?(ko?' · 나':' · Me'):'')+'</b></header><p>'+nl(p&&p.answer||'')+'</p></article>'}
function closeAnswerReview(){var overlay=document.getElementById('v44-answer-review');if(!overlay)return false;overlay.classList.remove('is-open');document.body.classList.remove('v44-review-open');setTimeout(function(){if(overlay.parentNode)overlay.remove()},180);try{window.scrollTo({left:0,top:reviewReturnY,behavior:'auto'})}catch(e){window.scrollTo(0,reviewReturnY)}return true}
function openAnswerReview(){var d=state();if(!d)return;closeAnswerReview();reviewReturnY=window.scrollY||window.pageYOffset||0;var people=(Array.isArray(d.participants)?d.participants:[]).filter(function(p){return p&&p.answered!==false&&p.answer!=null});var overlay=document.createElement('section');overlay.id='v44-answer-review';overlay.className='v44-review-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',copy('review'));overlay.innerHTML='<div class="v44-review-sheet"><header class="v44-review-nav"><button type="button" data-v44-review-close><span aria-hidden="true">‹</span>'+copy('back')+'</button></header><main class="v44-review-main"><section class="v44-review-question"><span class="k">'+format(copy('reviewLabel'),d.round_sequence||1)+'</span><h1>'+esc(questionText(d))+'</h1></section><div class="v44-review-heading"><span class="k">OUR ANSWERS</span><h2>'+copy('reviewTitle')+'</h2></div><section class="v44-review-answers">'+people.map(reviewAnswer).join('')+'</section></main></div>';document.body.appendChild(overlay);document.body.classList.add('v44-review-open');requestAnimationFrame(function(){overlay.classList.add('is-open');var b=overlay.querySelector('[data-v44-review-close]');if(b)try{b.focus({preventScroll:true})}catch(e){}})}
function decorateReflection(w){var root=w.querySelector('#weekly-reflection-v35-root');if(!root)return;var card=root.querySelector(':scope > .weekly-reflection-card');var saved=card&&card.querySelector('.weekly-reflection-saved');if(!card||!saved)return;card.classList.add('v43-reflection-completed');if(!card.querySelector(':scope > .v43-reflection-toggle')){var date=card.querySelector(':scope > .weekly-reflection-week');var toggle=document.createElement('button');toggle.type='button';toggle.className='v43-reflection-toggle';toggle.setAttribute('aria-expanded','false');toggle.innerHTML='<span><small>'+(date?esc(date.textContent):'')+'</small><b>'+copy('pastReflection')+'</b></span><i aria-hidden="true">›</i>';card.insertBefore(toggle,card.firstChild)}}
function decorateQueueScreen(w){var screen=w.querySelector('.question-queue-screen');if(!screen)return;var brand=w.querySelector('.top .brand');if(brand)brand.textContent=ko?'대화틈':'Daehwateum';var back=screen.querySelector(':scope > [data-a="room"]');if(back){back.textContent=copy('back');back.setAttribute('aria-label',copy('back'))}}
function decorateHome(w){var brand=w.querySelector('.top .brand');if(brand)brand.textContent=ko?'대화틈':'Daehwateum';var spaces=w.querySelector('.spaces');if(!spaces)return;Array.prototype.forEach.call(spaces.querySelectorAll('.spacecard'),function(card){if(card.getAttribute('data-v44-home-card')==='1')return;card.setAttribute('data-v44-home-card','1');card.setAttribute('role','button');card.setAttribute('tabindex','0');var h=card.querySelector('h3'),names=String(h&&h.textContent||'').split('×').map(function(v){return v.trim()}).filter(Boolean).slice(0,3);var avatars=document.createElement('div');avatars.className='space-avatars-v44';avatars.setAttribute('aria-hidden','true');avatars.innerHTML=names.map(function(name){return '<span>'+esc(initial(name))+'</span>'}).join('');card.insertBefore(avatars,card.firstChild);var open=card.querySelector('[data-a="open-room"]');if(open){open.textContent='';open.setAttribute('aria-label',(ko?'대화 열기: ':'Open conversation: ')+(h?h.textContent:''))}})}
function decorate(){var d=state(),w=app.querySelector(':scope > .w');var queue=!!(w&&w.querySelector('.question-queue-screen'));var room=!!(d&&w&&w.querySelector(':scope > .q')&&!queue);var home=!!(w&&!room&&!queue&&(w.querySelector('.spaces')||w.querySelector('.hero')));var form=!!(w&&!room&&!queue&&!home&&w.querySelector('.card.intro'));document.body.classList.toggle('visual-room-v43',room);document.body.classList.toggle('visual-room-v45',room);document.body.classList.toggle('visual-queue-v44',queue);document.body.classList.toggle('visual-home-v44',home);document.body.classList.toggle('visual-form-v44',form);if(queue){decorateQueueScreen(w);return}if(home){decorateHome(w);return}if(form){decorateHome(w);return}if(!room)return;ensureRelationshipHero(d,w);decorateQuestion(d,w);decorateWaiting(d,w);decorateAnswersReady(d,w);decorateComplete(d,w);decoratePaused(d,w);decorateQueue(w);decorateMemory(w);decorateReflection(w)}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;decorate()})}
app.addEventListener('click',function(e){var review=e.target.closest&&e.target.closest('[data-v44-review-surface]');if(review){e.preventDefault();openAnswerReview();return}var close=e.target.closest&&e.target.closest('[data-v44-review-close]');if(close){e.preventDefault();closeAnswerReview();return}var rel=e.target.closest&&e.target.closest('.relationship-compact-button-v45');if(rel){var peopleBtn=document.querySelector('.top>.people,.top>.people-plus');if(peopleBtn&&typeof peopleBtn.click==='function')peopleBtn.click()}},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&closeAnswerReview())return});
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,characterData:true});
setInterval(schedule,30000);schedule();
})();