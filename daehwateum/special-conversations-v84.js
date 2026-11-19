(function(){
'use strict';
var app=document.getElementById('app');
if(!app)return;
var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var scheduled=false;
function t(a,b){return ko?a:b}
function make(tag,cls,txt){var el=document.createElement(tag);el.className=cls;if(txt!=null)el.textContent=txt;return el}
function number(n){var x=Math.max(1,parseInt(n||1,10)||1);return ko?x+'번째':String(x)}
function updateQuestion(d,w){
  var q=w.querySelector(':scope > .q'),stage=q&&q.nextElementSibling;
  if(!q||q.hidden||q.getAttribute('aria-hidden')==='true'||!d.me)return;
  var open=!!(d.unlocked&&window.DT&&DT.revealed&&DT.revealed());
  if(open){
    q.classList.add('v84-revealed');
    if(!q.querySelector('.v84-question-label')){var h=q.querySelector('h1');if(h)h.insertAdjacentElement('beforebegin',make('span','v84-question-label',t('우리가 함께 답한 질문','The question we answered together')))}
    if(stage&&stage.querySelector('.group-answers')){
      stage.classList.add('v84-reveal-section');
      if(!w.querySelector(':scope > .v84-reveal-intro')){
        var intro=make('section','v84-reveal-intro');
        intro.appendChild(make('span','v84-intro-kicker',number(d.round_sequence)+t(' 대화',' conversation')));
        intro.appendChild(make('h2','v84-intro-title',t('오늘, 서로의 마음이 열렸어요.','Today, our stories opened together.')));
        intro.appendChild(make('p','v84-intro-desc',t('같은 질문에 담긴 서로의 이야기를 천천히 읽어보세요.','Take time with each other’s answer to the same question.')));
        q.insertAdjacentElement('beforebegin',intro);
      }
      var cards=stage.querySelectorAll('.group-answers .ans');
      Array.prototype.forEach.call(cards,function(c){c.classList.add('v84-answer-card')});
    }
    return;
  }
  if(d.me.answered)return;
  var form=stage&&stage.querySelector('#af'),heading=q.querySelector('h1');
  if(!form||!heading)return;
  q.classList.add('v84-question');
  var top=q.querySelector('.v84-top-note');
  if(!top){top=make('div','v84-top-note');q.insertBefore(top,q.firstChild)}
  var target=t('우리의 ','Our ')+number(d.round_sequence)+t(' 대화',' conversation');
  if(top.textContent!==target)top.textContent=target;
  if(!q.querySelector('.v84-eyebrow'))heading.insertAdjacentElement('beforebegin',make('p','v84-eyebrow',t('오늘, 서로에게 물어보고 싶은 것','Something to ask each other today')));
  if(!q.querySelector('.v84-quote'))heading.insertAdjacentElement('afterend',make('p','v84-quote',t('오래 알았다고, 다 아는 건 아니니까. 오늘은 서로의 마음을 조금 더 들어봐요.','Even people close to us still have stories to tell.')));
  var button=stage.querySelector('.answer-entry-v43');
  if(button&&button.textContent!==t('내 이야기 남기기','Share my story'))button.textContent=t('내 이야기 남기기','Share my story');
}
function updateHistory(w){
  var hist=Array.prototype.find.call(w.querySelectorAll('.hist'),function(el){return!!el.querySelector('.hist-day .hist-question')});
  if(!hist)return;
  hist.classList.add('v84-history');
  var h2=hist.querySelector(':scope > h2'),headText=t('우리가 나눈 이야기 ','The stories we shared ');
  if(h2&&h2.firstChild&&h2.firstChild.nodeType===3&&h2.firstChild.nodeValue!==headText)h2.firstChild.nodeValue=headText;
  Array.prototype.forEach.call(hist.querySelectorAll('.hist-day details.item'),function(item){
    var sum=item.querySelector('summary'),q=sum&&sum.querySelector('.hist-question'),group=item.querySelector('.history-group');
    if(!q||!group||sum.querySelector('.v84-previews'))return;
    sum.dataset.historyQuestion=q.textContent.trim();
    var previews=make('div','v84-previews');
    var rows=Array.prototype.slice.call(group.children).filter(function(x){return!!x.querySelector('p')});
    rows.slice(0,2).forEach(function(row,i){
      var p=row.querySelector('p'),author=row.querySelector('small'),name=author?(author.textContent||'').trim():'';
      var box=make('div','v84-preview '+(i===0?'first':'second'));
      box.appendChild(make('b','v84-preview-name',name||t(i===0?'나':'상대',i===0?'Me':'Other')));
      box.appendChild(make('p','v84-preview-text',p?p.textContent:''));
      previews.appendChild(box);
    });
    if(rows.length)sum.appendChild(previews);
  });
}
function updateHistoryDetail(){
  var overlay=document.getElementById('history-detail-overlay');
  var main=overlay&&overlay.querySelector('.history-detail-main');
  if(!main||main.querySelector('.v84-detail-label'))return;
  main.insertBefore(make('p','v84-detail-label',t('우리에게만 남은 대화','A conversation just between us')),main.firstChild);
  overlay.classList.add('v84-history-detail');
}
function updateAnswerReview(){
  var overlay=document.getElementById('v44-answer-review');
  if(!overlay||overlay.querySelector('.v84-review-intro'))return;
  var main=overlay.querySelector('.v44-review-main'),question=main&&main.querySelector('.v44-review-question');
  if(!question)return;
  overlay.classList.add('v84-review');
  var intro=make('section','v84-review-intro');
  intro.appendChild(make('span','v84-intro-kicker',t('우리가 함께 만든 대화','A conversation we made together')));
  intro.appendChild(make('h2','v84-intro-title',t('오늘, 서로의 마음이 열렸어요.','Our stories, together.')));
  intro.appendChild(make('p','v84-intro-desc',t('그날 서로 어떤 마음이었는지 다시 읽어보세요.','Look back at what each of you shared.')));
  question.insertAdjacentElement('beforebegin',intro);
}
function patch(){
  var w=app.querySelector(':scope > .w'),d=window.DT&&DT.state&&DT.state();
  if(!w)return;
  var room=!!(d&&w.querySelector(':scope > .q')&&!w.querySelector('.question-queue-screen'));
  if(room){updateQuestion(d,w);updateHistory(w)}
  updateHistoryDetail();
  updateAnswerReview();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patch()})}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
new MutationObserver(schedule).observe(document.body,{childList:true});
schedule();
})();
