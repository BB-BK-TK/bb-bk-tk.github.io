(function(){'use strict';
var app=document.getElementById('app');
if(!app)return;
var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var queued=false,reviewReturnY=0;

function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function nl(v){return esc(v).replace(/\n/g,'<br>')}
function initial(v){return window.DT&&DT.initial?DT.initial(v):String(v||'?').trim().charAt(0)}
function ordinal(n){return Math.max(1,parseInt(n||1,10)||1)+(ko?'번째':'')}
function copy(k){
  var c={
    closer:['지금, 더 가까워지는 대화','A conversation that brings us closer'],
    closerSub:['오늘도, 작은 질문이 좋은 우리를 만든다','A small question makes room for us today'],
    question:['오늘의 {n} 질문','Today’s question {n}'],
    answer:['답변하기','Answer'],
    waitingTitle:['{n} 답변을 남겼어요','Answer {n} submitted'],
    waitingBody:['다른 참여자의 답변을 기다리고 있어요.','Waiting for the other answers.'],
    doneTitle:['{n} 대화를 마쳤어요','Conversation {n} complete'],
    review:['답변 다시 보기','Review answers'],
    next:['다음 질문까지','Until the next question'],
    ready:['다음 질문이 준비됐어요','The next question is ready'],
    freeDone:['첫 7일의 대화를 마쳤어요','Your first 7 days are complete'],
    freeDoneBody:['계속 대화하려면 Premium이 필요해요.','Premium is required to keep the conversation going.'],
    continue:['계속 대화하기','Keep talking'],
    back:['돌아가기','Back'],
    reviewTitle:['같은 질문, 여러 개의 마음','One question, many minds'],
    reviewLabel:['오늘의 {n} 질문','Question {n} today'],
    pastReflection:['지난 회고','Past reflections'],
    reflectionHint:['눌러서 회고 다시 보기','Tap to revisit this reflection']
  };
  return(c[k]||['',''])[ko?0:1];
}
function format(template,n){return String(template).replace('{n}',ordinal(n))}

function participantHtml(p,i){
  var photo=p&&(p.avatar_url||p.photo_url||p.image_url);
  var body=photo?'<img src="'+esc(photo)+'" alt="">':esc(initial(p&&p.name));
  return'<span class="relationship-avatar-v43" data-person-index="'+i+'" aria-hidden="true">'+body+'</span>';
}

function ensureRelationshipHero(d,w){
  var top=w.querySelector(':scope > .top');
  if(!top)return;
  var brand=top.querySelector('.brand');
  if(brand&&brand.textContent.trim()!==(ko?'대화틈':'Daehwateum'))brand.textContent=ko?'대화틈':'Daehwateum';
  var old=w.querySelector(':scope > .relationship-hero-v43');
  var parts=Array.isArray(d.participants)?d.participants:[];
  var sig=parts.map(function(p){return[p.name,p.avatar_url||p.photo_url||p.image_url||''].join(':')}).join('|');
  if(old&&old.getAttribute('data-v43-people')===sig)return;
  if(!old){old=document.createElement('section');old.className='relationship-hero-v43';top.insertAdjacentElement('afterend',old)}
  old.setAttribute('data-v43-people',sig);
  var people=[];
  parts.slice(0,5).forEach(function(p,i){
    if(i===1)people.push('<span class="relationship-seed-v43" aria-hidden="true"></span>');
    people.push(participantHtml(p,i));
  });
  if(parts.length<2)people.push('<span class="relationship-seed-v43" aria-hidden="true"></span>');
  old.innerHTML='<div class="relationship-people-v43" role="button" tabindex="0" aria-label="'+(ko?'함께하는 사람 보기':'View people')+'">'+people.join('')+'</div><div class="relationship-copy-v43"><strong>'+copy('closer')+'</strong><small>'+copy('closerSub')+'</small></div>';
}

function decorateQuestion(d,w){
  var q=w.querySelector(':scope > .q');
  if(!q)return;
  var k=q.querySelector('.k');
  var label=format(copy('question'),d.round_sequence||1);
  if(k&&k.textContent!==label)k.textContent=label;
  var stage=q.nextElementSibling;
  if(stage&&stage.matches('.card.stage')&&stage.querySelector('#af')){
    if(!stage.querySelector('.answer-entry-v43')){
      var b=document.createElement('button');
      b.type='button';b.className='answer-entry-v43';b.textContent=copy('answer');
      stage.insertBefore(b,stage.firstChild);
    }
  }
}

function decorateWaiting(d,w){
  var q=w.querySelector(':scope > .q');
  var waiting=!!(d.me&&d.me.answered&&!d.unlocked);
  if(q)q.classList.toggle('v43-status-hidden',waiting);
  if(!waiting)return;
  var stages=Array.prototype.slice.call(w.querySelectorAll(':scope > .card.stage'));
  var stage=stages.find(function(el){return !el.querySelector('form')&&!el.classList.contains('next-gate')&&!el.classList.contains('queue-summary-card')});
  if(!stage)return;
  stage.setAttribute('data-v43-state','waiting');
  var h=stage.querySelector('h2'),p=stage.querySelector('p');
  var title=format(copy('waitingTitle'),d.round_sequence||1);
  if(h&&h.textContent!==title)h.textContent=title;
  if(p&&p.textContent!==copy('waitingBody'))p.textContent=copy('waitingBody');
}

function decorateComplete(d,w){
  var summary=w.querySelector('.post-reveal-summary');
  if(!summary)return;
  var b=summary.querySelector('b');
  var title=d.free_period_ended&&!d.is_premium?copy('freeDone'):format(copy('doneTitle'),d.round_sequence||1);
  if(b&&b.textContent!==title)b.textContent=title;
  var review=summary.querySelector('[data-post-reveal-review]');
  if(review){
    review.removeAttribute('data-post-reveal-review');
    review.remove();
  }
  summary.setAttribute('data-v44-review-surface','');
  summary.setAttribute('role','button');
  summary.setAttribute('tabindex','0');
  summary.setAttribute('aria-label',copy('review'));
  var gate=w.querySelector('.premium-continuation-gate,.post-reveal-current .next-gate');
  if(!gate)return;
  var k=gate.querySelector('.k'),h=gate.querySelector('h2');
  if(d.can_start_next){if(k)k.textContent=copy('ready');return}
  if(k)k.textContent=copy('next');
  if(h)h.textContent=remaining(d.next_round_at);
}

function decoratePaused(d,w){
  if(!d.is_paused||!d.free_period_ended)return;
  var card=w.querySelector('#owner-policy-region .owner-policy-card');
  if(!card)return;
  card.setAttribute('data-v43-state','free-ended');
  var h=card.querySelector('h2'),p=card.querySelector('p'),primary=card.querySelector('[data-a="premium"]');
  if(h)h.textContent=copy('freeDone');
  if(p)p.textContent=copy('freeDoneBody');
  if(primary)primary.textContent=copy('continue');
  var summary=w.querySelector('.post-reveal-summary');
  if(summary)summary.style.display='none';
}

function remaining(value){
  var due=value?new Date(value).getTime():NaN;
  if(!isFinite(due))return ko?'곧 열려요':'Opening soon';
  var mins=Math.max(0,Math.ceil((due-Date.now())/60000));
  if(mins<=0)return copy('ready');
  var hours=Math.floor(mins/60),rest=mins%60;
  if(ko)return(hours?hours+'시간 ':'')+(rest?rest+'분':hours?'':'1분');
  return(hours?hours+'h ':'')+(rest?rest+'m':hours?'':'1m');
}

function decorateQueue(w){
  var card=w.querySelector('.queue-summary-card');
  if(!card)return;
  card.setAttribute('role','button');card.setAttribute('tabindex','0');
  var title=card.querySelector('.queue-module-title');
  if(title&&/^✎\s*/.test(title.textContent))title.textContent=title.textContent.replace(/^✎\s*/,'');
}

function questionText(d){return !ko&&d&&d.question_en?d.question_en:(d&&d.question)||''}

function reviewAnswer(p){
  var mine=p&&p.is_me,photo=p&&(p.avatar_url||p.photo_url||p.image_url);
  var avatar=photo?'<img src="'+esc(photo)+'" alt="">':esc(initial(p&&p.name));
  return '<article class="v44-review-answer '+(mine?'mine':'other')+'"><header><span class="v44-review-avatar">'+avatar+'</span><b>'+esc(p&&p.name)+(mine?(ko?' · 나':' · Me'):'')+'</b></header><p>'+nl(p&&p.answer||'')+'</p></article>';
}

function closeAnswerReview(){
  var overlay=document.getElementById('v44-answer-review');
  if(!overlay)return false;
  overlay.classList.remove('is-open');
  document.body.classList.remove('v44-review-open');
  setTimeout(function(){if(overlay.parentNode)overlay.remove()},180);
  try{window.scrollTo({left:0,top:reviewReturnY,behavior:'auto'})}catch(e){window.scrollTo(0,reviewReturnY)}
  return true;
}

function openAnswerReview(){
  var d=state();if(!d)return;
  closeAnswerReview();
  reviewReturnY=window.scrollY||window.pageYOffset||0;
  var people=(Array.isArray(d.participants)?d.participants:[]).filter(function(p){return p&&p.answered!==false&&p.answer!=null});
  var overlay=document.createElement('section');
  overlay.id='v44-answer-review';overlay.className='v44-review-overlay';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',copy('review'));
  overlay.innerHTML='<div class="v44-review-sheet"><header class="v44-review-nav"><button type="button" data-v44-review-close><span aria-hidden="true">‹</span>'+copy('back')+'</button></header><main class="v44-review-main"><section class="v44-review-question"><span class="k">'+format(copy('reviewLabel'),d.round_sequence||1)+'</span><h1>'+esc(questionText(d))+'</h1></section><div class="v44-review-heading"><span class="k">OUR ANSWERS</span><h2>'+copy('reviewTitle')+'</h2></div><section class="v44-review-answers">'+people.map(reviewAnswer).join('')+'</section></main></div>';
  document.body.appendChild(overlay);document.body.classList.add('v44-review-open');
  requestAnimationFrame(function(){overlay.classList.add('is-open');var b=overlay.querySelector('[data-v44-review-close]');if(b)try{b.focus({preventScroll:true})}catch(e){}});
}

function decorateReflection(w){
  var root=w.querySelector('#weekly-reflection-v35-root');if(!root)return;
  var card=root.querySelector(':scope > .weekly-reflection-card');
  var saved=card&&card.querySelector('.weekly-reflection-saved');
  if(!card||!saved)return;
  card.classList.add('v43-reflection-completed');
  if(!card.querySelector(':scope > .v43-reflection-toggle')){
    var date=card.querySelector(':scope > .weekly-reflection-week');
    var toggle=document.createElement('button');toggle.type='button';toggle.className='v43-reflection-toggle';
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='<span><small>'+(date?esc(date.textContent):'')+'</small><b>'+copy('pastReflection')+'</b></span><i aria-hidden="true">›</i>';
    card.insertBefore(toggle,card.firstChild);
  }
}

function decorateQueueScreen(w){
  var screen=w.querySelector('.question-queue-screen');if(!screen)return;
  var brand=w.querySelector('.top .brand');if(brand)brand.textContent=ko?'대화틈':'Daehwateum';
  var back=screen.querySelector(':scope > [data-a="room"]');
  if(back){back.textContent=copy('back');back.setAttribute('aria-label',copy('back'))}
}

function decorateHome(w){
  var brand=w.querySelector('.top .brand');if(brand)brand.textContent=ko?'대화틈':'Daehwateum';
  var spaces=w.querySelector('.spaces');if(!spaces)return;
  Array.prototype.forEach.call(spaces.querySelectorAll('.spacecard'),function(card){
    if(card.getAttribute('data-v44-home-card')==='1')return;
    card.setAttribute('data-v44-home-card','1');card.setAttribute('role','button');card.setAttribute('tabindex','0');
    var h=card.querySelector('h3'),names=String(h&&h.textContent||'').split('×').map(function(v){return v.trim()}).filter(Boolean).slice(0,3);
    var avatars=document.createElement('div');avatars.className='space-avatars-v44';avatars.setAttribute('aria-hidden','true');
    avatars.innerHTML=names.map(function(name){return '<span>'+esc(initial(name))+'</span>'}).join('');
    card.insertBefore(avatars,card.firstChild);
    var open=card.querySelector('[data-a="open-room"]');if(open){open.textContent='';open.setAttribute('aria-label',(ko?'대화 열기: ':'Open conversation: ')+(h?h.textContent:''))}
  });
}

function ensureRhythmArt(w){
  var cal=w.querySelector('.cal');
  if(!cal||cal.querySelector('.rhythm-art-v43'))return;
  var art=document.createElement('div');
  art.className='rhythm-art-v43';art.setAttribute('aria-hidden','true');
  art.innerHTML='<i class="rhythm-hill-v43"></i><i class="rhythm-hill-v43"></i><i class="rhythm-hill-v43"></i><i class="rhythm-sprout-v43"></i>';
  cal.appendChild(art);
  cal.setAttribute('role','button');cal.setAttribute('tabindex','0');
  cal.setAttribute('aria-expanded','false');
  cal.setAttribute('aria-label',ko?'대화 리듬 자세히 보기':'View conversation rhythm');
}

function decorate(){
  var d=state(),w=app.querySelector(':scope > .w');
  var queue=!!(w&&w.querySelector('.question-queue-screen'));
  var room=!!(d&&w&&w.querySelector(':scope > .q')&&!queue);
  var home=!!(w&&!room&&!queue&&(w.querySelector('.spaces')||w.querySelector('.hero')));
  var form=!!(w&&!room&&!queue&&!home&&w.querySelector('.card.intro'));
  document.body.classList.toggle('visual-room-v43',room);
  document.body.classList.toggle('visual-queue-v44',queue);
  document.body.classList.toggle('visual-home-v44',home);
  document.body.classList.toggle('visual-form-v44',form);
  if(queue){decorateQueueScreen(w);return}
  if(home){decorateHome(w);return}
  if(form){decorateHome(w);return}
  if(!room)return;
  ensureRelationshipHero(d,w);
  decorateQuestion(d,w);
  decorateWaiting(d,w);
  decorateComplete(d,w);
  decoratePaused(d,w);
  decorateQueue(w);
  ensureRhythmArt(w);
  decorateReflection(w);
}

function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;decorate()})}

app.addEventListener('click',function(e){
  var review=e.target.closest&&e.target.closest('[data-v44-review-surface]');
  if(review){e.preventDefault();e.stopPropagation();openAnswerReview();return}
  var reflection=e.target.closest&&e.target.closest('.v43-reflection-toggle');
  if(reflection){var card=reflection.closest('.v43-reflection-completed'),open=!card.classList.contains('v43-reflection-open');card.classList.toggle('v43-reflection-open',open);reflection.setAttribute('aria-expanded',open?'true':'false');return}
  var space=e.target.closest&&e.target.closest('.spacecard[data-v44-home-card="1"]');
  if(space&&!e.target.closest('[data-a="open-room"]')){var open=space.querySelector('[data-a="open-room"]');if(open)open.click();return}
  var answer=e.target.closest&&e.target.closest('.answer-entry-v43');
  if(answer){var stage=answer.closest('.stage');stage.classList.add('answer-open-v43');var ta=stage.querySelector('textarea');if(ta)setTimeout(function(){ta.focus()},30);return}
  var people=e.target.closest&&e.target.closest('.relationship-people-v43');
  if(people){var original=app.querySelector('.top .people[data-people-manage]');if(original)original.click();return}
  var queue=e.target.closest&&e.target.closest('.queue-summary-card');
  if(queue&&!e.target.closest('[data-a="custom"]')){var qbtn=queue.querySelector('[data-a="custom"]');if(qbtn)qbtn.click();return}
  var cal=e.target.closest&&e.target.closest('.cal');
  if(cal&&!cal.classList.contains('rhythm-expanded-v43')){cal.classList.add('rhythm-expanded-v43');cal.setAttribute('aria-expanded','true');cal.removeAttribute('role');cal.removeAttribute('tabindex');}
},true);

app.addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' ')return;
  if(e.target.matches('[data-v44-review-surface],.spacecard[data-v44-home-card="1"]')){e.preventDefault();e.target.click();return}
  if(e.target.matches('.relationship-people-v43,.queue-summary-card')){e.preventDefault();e.target.click();return}
  if(e.target.matches('.cal')&&!e.target.classList.contains('rhythm-expanded-v43')){e.preventDefault();e.target.click()}
});

document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-v44-review-close]');if(b){e.preventDefault();closeAnswerReview()}},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.getElementById('v44-answer-review')){e.preventDefault();closeAnswerReview()}},true);

if(!window.__visualDirectionV44Back){
  window.__visualDirectionV44Back=true;
  var previousBack=window.DaehwateumBack;
  window.DaehwateumBack=function(){if(closeAnswerReview())return true;if(typeof previousBack==='function')try{return !!previousBack()}catch(e){}return false};
}

new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
setInterval(function(){var w=app.querySelector(':scope > .w'),d=state();if(d&&w&&w.querySelector('.post-reveal-summary'))decorateComplete(d,w)},60000);
schedule();
})();
