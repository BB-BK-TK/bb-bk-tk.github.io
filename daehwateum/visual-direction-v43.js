(function(){'use strict';
var app=document.getElementById('app');
if(!app)return;
var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var queued=false;

function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
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
    continue:['계속 대화하기','Keep talking']
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
  if(review){review.textContent='';review.setAttribute('aria-label',copy('review'));review.setAttribute('title',copy('review'))}
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
  var room=!!(d&&w&&w.querySelector(':scope > .q')&&!w.querySelector('.question-queue-screen'));
  document.body.classList.toggle('visual-room-v43',room);
  if(!room)return;
  ensureRelationshipHero(d,w);
  decorateQuestion(d,w);
  decorateWaiting(d,w);
  decorateComplete(d,w);
  decoratePaused(d,w);
  decorateQueue(w);
  ensureRhythmArt(w);
}

function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;decorate()})}

app.addEventListener('click',function(e){
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
  if(e.target.matches('.relationship-people-v43,.queue-summary-card')){e.preventDefault();e.target.click();return}
  if(e.target.matches('.cal')&&!e.target.classList.contains('rhythm-expanded-v43')){e.preventDefault();e.target.click()}
});

new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
setInterval(function(){var w=app.querySelector(':scope > .w'),d=state();if(d&&w&&w.querySelector('.post-reveal-summary'))decorateComplete(d,w)},60000);
schedule();
})();
