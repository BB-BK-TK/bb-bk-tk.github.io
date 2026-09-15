(function(){'use strict';
var KO=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var scheduled=false;
function text(ko,en){return KO?ko:en}
function patchPremiumGate(){
  var card=document.querySelector('.premium-card');
  if(!card)return;
  var k=card.querySelector(':scope > .k');
  var h=card.querySelector(':scope > h1');
  var list=card.querySelector('.premium-list');
  var button=card.querySelector('[data-a="premium-activate"]');
  var note=list&&list.nextElementSibling;
  if(k)k.textContent='BETA · PREMIUM';
  if(h)h.textContent=text('Beta 기간 동안 Premium을 무료로 써보세요','Try Premium free during Beta');
  if(note&&note.tagName==='P')note.textContent=text('Beta 기간에는 결제 없이 Premium 기능을 이용할 수 있어요. Beta 종료 전 유료 전환 여부를 다시 안내하고, 동의 없이 자동 결제하지 않아요.','Premium is free during Beta. We will ask before any paid transition, and you will not be charged automatically without consent.');
  if(button)button.textContent=text('Beta Premium 무료로 시작하기','Start Beta Premium for free');
}
function patchPremiumBanner(){
  document.querySelectorAll('.premium-banner').forEach(function(el){
    var k=el.querySelector('.k'),b=el.querySelector('.premium-banner-copy b'),small=el.querySelector('.premium-banner-copy small'),btn=el.querySelector('[data-a="premium"]');
    if(k)k.textContent='BETA · PREMIUM';
    if(b)b.textContent=text('Beta에서는 Premium을 무료로 써볼 수 있어요','Premium is free during Beta');
    if(small)small.textContent=text('직접 질문하고, 질문을 예약하고, 최대 5명과 7일 이후에도 대화를 이어가세요.','Ask and schedule your own questions, invite up to 5 people, and keep the conversation going beyond 7 days.');
    if(btn)btn.textContent=text('무료로 시작하기','Try free');
  });
}
function patchActivePremium(){
  document.querySelectorAll('.my-premium-pill').forEach(function(el){el.textContent='★ Beta Premium'});
  document.querySelectorAll('.premium-note').forEach(function(el){
    var v=(el.textContent||'').trim();
    if(/Premium 활성화됨|Premium active/i.test(v))el.textContent=text('★ Beta Premium 이용 중','★ Beta Premium active');
  });
}
function patchSettings(){document.querySelectorAll('[data-settings-subscription]').forEach(function(el){el.textContent='Premium'})}
function patchConversationLabels(){
  if(!window.DT||typeof DT.state!=='function')return;
  var d=DT.state();if(!d)return;
  var n=Math.max(1,Number(d.round_sequence||1));
  var q=document.querySelector('.visual-room-v43 .q .k');
  if(q){var v=(q.textContent||'').trim();if(KO&&/^오늘의\s+\d+번째\s+질문$/.test(v))q.textContent=n+'번째 대화';else if(!KO&&/^Today.?s question\s+\d+$/i.test(v))q.textContent='Conversation '+n}
  var waiting=document.querySelector('.visual-room-v43 .card.stage[data-v43-state="waiting"] h2');
  if(waiting)waiting.textContent=text('내 답변을 남겼어요','Your answer is in');
  var review=document.querySelector('#v44-answer-review .v44-review-question .k');
  if(review)review.textContent=text(n+'번째 대화','Conversation '+n);
}
function patchQuestionQueue(){
  var summary=document.querySelector('.queue-summary-card');
  if(summary&&!summary.classList.contains('has-reserved-questions')){
    var title=summary.querySelector('.queue-module-title'),desc=summary.querySelector('.queue-summary-intro p');
    if(title)title.textContent=text('물어보고 싶은 질문이 있나요?','Anything you want to ask?');
    if(desc)desc.textContent=text('지금 떠오른 질문을 미리 남겨둘 수 있어요.','Save a question now and use it later.');
  }
  var screen=document.querySelector('.question-queue-screen');
  if(screen){
    var h=screen.querySelector(':scope > h1'),p=screen.querySelector(':scope > h1 + p');
    if(h)h.textContent=text('질문 예약하기','Reserve a question');
    if(p)p.textContent=text('물어보고 싶은 질문을 미리 예약해보세요. 예약한 질문은 대화 흐름에 맞춰 하나씩 열려요.','Save questions you want to ask. Reserved questions open one at a time with the conversation flow.');
  }
}
function patch(){scheduled=false;patchPremiumGate();patchPremiumBanner();patchActivePremium();patchSettings();patchConversationLabels();patchQuestionQueue()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(patch)}
function start(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
