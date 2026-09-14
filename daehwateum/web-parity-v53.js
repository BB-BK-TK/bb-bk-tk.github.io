(function(){'use strict';
var ua=navigator.userAgent||'';
var isIOS=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var KO=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
function standalone(){return !!(window.navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches))}
function addClasses(){
  if(!isIOS)return;
  document.documentElement.classList.add('ios-device');
  document.documentElement.classList.toggle('ios-standalone',standalone());
  document.documentElement.classList.toggle('ios-browser',!standalone());
}
addClasses();

/* Android's hardware back already delegates to DaehwateumBack. Give iPhone browser/PWA back gestures the same in-app behavior. */
var guardArmed=false,leaving=false;
function armBackGuard(){
  if(!isIOS||guardArmed||leaving)return;
  try{history.pushState({dtIosBackGuard:1},'',location.href);guardArmed=true}catch(e){}
}
function handlePop(){
  if(!isIOS||leaving)return;
  guardArmed=false;
  var consumed=false;
  try{consumed=!!(window.DaehwateumBack&&window.DaehwateumBack())}catch(e){}
  if(consumed){setTimeout(armBackGuard,0);return}
  /* We are already at the app home. Skip the duplicate same-document entry and leave normally. */
  leaving=true;
  setTimeout(function(){
    try{history.back()}catch(e){}
    setTimeout(function(){leaving=false},160)
  },0)
}
if(isIOS){
  window.addEventListener('popstate',handlePop);
  window.addEventListener('pageshow',function(){leaving=false;if(!guardArmed)setTimeout(armBackGuard,0)});
}

function patchAboutCopy(){
  document.querySelectorAll('.about-sheet section').forEach(function(section){
    var h=section.querySelector('h2'),p=section.querySelector('p');
    if(!h||!p)return;
    var label=(h.textContent||'').trim();
    if(label==='알림')p.textContent='새 질문이 열리거나 다른 참여자가 답을 남기면 알림을 받을 수 있어요. 알림에는 실제 답변 내용이나 비공개 예약 질문의 내용·작성자를 넣지 않아요.';
    if(label==='Notifications')p.textContent='You can get notified when a new question opens or another participant answers. Notifications never include private answer text or reveal queued-question content or its author.';
  })
}
function patchIOSNotificationSettings(){
  if(!isIOS||standalone())return;
  var card=document.querySelector('.notification-settings-card');
  if(!card)return;
  var h=card.querySelector('h1'),p=card.querySelector('p'),b=card.querySelector('[data-notification-request]'),small=card.querySelector('small');
  if(h)h.textContent=KO?'홈 화면에서 알림을 받을 수 있어요':'Notifications work from the Home Screen app';
  if(p)p.textContent=KO?'Safari에서 대화틈을 홈 화면에 추가한 뒤 그 아이콘으로 열면 알림을 켤 수 있어요.':'Add Daehwateum to your Home Screen from Safari, then open it from that icon to enable notifications.';
  if(b)b.textContent=KO?'추가 방법 보기':'How to add it';
  if(small)small.textContent=KO?'Safari에서 열기 → 공유 버튼 → 홈 화면에 추가':'Open in Safari → Share → Add to Home Screen';
}
function patch(){patchAboutCopy();patchIOSNotificationSettings()}
var queued=false;
function schedulePatch(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;patch()})}
function start(){
  if(isIOS)armBackGuard();
  patch();
  new MutationObserver(schedulePatch).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

/* Do not let regular iPhone browser tabs show a broken permission flow. */
document.addEventListener('click',function(e){
  if(!isIOS||standalone())return;
  var b=e.target.closest&&e.target.closest('[data-notification-request]');
  if(!b)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  var feedback=document.getElementById('notification-feedback');
  if(feedback)feedback.textContent=KO?'Safari에서 대화틈을 연 뒤 공유 버튼 → 홈 화면에 추가를 선택해 주세요.':'Open Daehwateum in Safari, then choose Share → Add to Home Screen.';
},true);
})();
