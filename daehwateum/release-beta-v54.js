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
function patchSettings(){
  document.querySelectorAll('[data-settings-subscription]').forEach(function(el){el.textContent=text('Premium','Premium')});
}
function patch(){scheduled=false;patchPremiumGate();patchPremiumBanner();patchActivePremium();patchSettings()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(patch)}
function start(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
