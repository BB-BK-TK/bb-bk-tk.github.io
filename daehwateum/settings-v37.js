(function(){'use strict';
var KO=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var VERSION='0.8.0-beta';
var PUSH_ENABLED='dt.push.enabled.v1';
var PUSH_DISMISSED='dt.push.dismissed.v1';
var patching=false;
function t(){return KO?{
  notification:'알림',subscription:'구독 관리',recovery:'대화 데이터 복구',appInfo:'앱 정보',
  notificationTitle:'알림',notificationOn:'알림을 받고 있어요',notificationOff:'알림이 꺼져 있어요',
  notificationBodyOn:'새 질문이 열리거나 서로의 답을 볼 수 있게 되면 알려드려요.',
  notificationBodyOff:'새 질문과 답변 준비 소식을 놓치지 않도록 알림을 켤 수 있어요.',
  notificationEnable:'알림 받기',notificationOpen:'알림 권한 확인',notificationHint:'알림 권한은 기기 설정에서도 언제든 변경할 수 있어요.',
  appInfoTitle:'앱 정보',version:'버전',how:'대화틈 사용 방법',terms:'이용약관',privacy:'개인정보처리방침',
  legalDraft:'Beta 안내',close:'닫기'
}:{
  notification:'Notifications',subscription:'Manage subscription',recovery:'Conversation recovery',appInfo:'App info',
  notificationTitle:'Notifications',notificationOn:'Notifications are on',notificationOff:'Notifications are off',
  notificationBodyOn:'We’ll let you know when a new question opens or answers are ready to view.',
  notificationBodyOff:'Turn on notifications so you do not miss new questions or answer-ready updates.',
  notificationEnable:'Enable notifications',notificationOpen:'Check notification permission',notificationHint:'You can also change notification permission anytime in your device settings.',
  appInfoTitle:'App info',version:'Version',how:'How Daehwateum works',terms:'Terms of use',privacy:'Privacy policy',
  legalDraft:'Beta notice',close:'Close'
}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function closeSettingsPage(){var x=document.getElementById('settings-page-overlay');if(x)x.remove()}
function page(title,body){closeSettingsPage();var x=document.createElement('div');x.id='settings-page-overlay';x.className='settings-page-overlay';x.innerHTML='<div class="settings-page-sheet"><header><button type="button" class="settings-page-back" data-settings-page-close aria-label="Back">←</button><b>'+esc(title)+'</b></header><main>'+body+'</main></div>';document.body.appendChild(x)}
function pushEnabled(){try{return localStorage.getItem(PUSH_ENABLED)==='1'}catch(e){return false}}
function notificationBody(){var c=t(),on=pushEnabled();return '<section class="settings-page-card notification-settings-card"><span class="k">NOTIFICATIONS</span><h1>'+esc(on?c.notificationOn:c.notificationOff)+'</h1><p>'+esc(on?c.notificationBodyOn:c.notificationBodyOff)+'</p>'+(on?'<button type="button" class="settings-row-action" data-notification-request>'+esc(c.notificationOpen)+'</button>':'<button type="button" class="btn full" data-notification-request>'+esc(c.notificationEnable)+'</button>')+'<small>'+esc(c.notificationHint)+'</small></section>'}
function openNotifications(){page(t().notificationTitle,notificationBody())}
function requestNotifications(){
  try{localStorage.removeItem(PUSH_DISMISSED)}catch(e){}
  if(window.AndroidPush&&typeof AndroidPush.enable==='function'){
    try{AndroidPush.enable();setTimeout(function(){if(document.getElementById('settings-page-overlay'))openNotifications()},700);return}catch(e){}
  }
  if('Notification'in window){
    if(Notification.permission==='denied'){alert(KO?'브라우저 또는 기기 설정에서 대화틈 알림 권한을 허용해 주세요.':'Allow Daehwateum notifications in your browser or device settings.');return}
    if(Notification.permission==='default'){
      Notification.requestPermission().then(function(){closeSettingsPage();nudgeExistingPrompt()});return;
    }
  }
  closeSettingsPage();nudgeExistingPrompt();
}
function nudgeExistingPrompt(){
  var app=document.getElementById('app');
  if(app){var n=document.createComment('notification-settings');app.appendChild(n);setTimeout(function(){if(n.parentNode)n.parentNode.removeChild(n)},0)}
}
function appInfoBody(){var c=t();return '<section class="settings-page-card app-info-card"><div class="app-info-brand">◉ 대화틈</div><div class="app-info-version"><span>'+esc(c.version)+'</span><b>'+esc(VERSION)+'</b></div></section><section class="settings-page-list"><button type="button" data-settings-action="about">'+esc(c.how)+'<span>›</span></button><a href="./legal/terms/">'+esc(c.terms)+'<span>›</span></a><a href="./legal/privacy/">'+esc(c.privacy)+'<span>›</span></a></section>'}
function openAppInfo(){page(t().appInfoTitle,appInfoBody())}
function ensureMenu(){
  var m=document.getElementById('settings-popover');if(!m)return;
  if(m.getAttribute('data-settings-v37')==='1')return;
  var danger=m.querySelector('.danger-menu');
  var c=t();
  Array.from(m.querySelectorAll('button')).forEach(function(b){if(b!==danger)b.remove()});
  function add(label,attr,val){var b=document.createElement('button');b.type='button';b.setAttribute(attr,val||'1');b.textContent=label;m.insertBefore(b,danger||null)}
  add(c.notification,'data-settings-notification','1');
  add(c.subscription,'data-subscription-management','1');
  add(c.recovery,'data-recovery-settings','1');
  add(c.appInfo,'data-settings-app-info','1');
  m.setAttribute('data-settings-v37','1');
}
function patch(){if(patching)return;patching=true;requestAnimationFrame(function(){patching=false;ensureMenu()})}
document.addEventListener('click',function(e){
  var x=e.target.closest&&e.target.closest('[data-settings-notification]');if(x){e.preventDefault();var m=document.getElementById('settings-popover');if(m)m.remove();openNotifications();return}
  x=e.target.closest&&e.target.closest('[data-settings-app-info]');if(x){e.preventDefault();var mm=document.getElementById('settings-popover');if(mm)mm.remove();openAppInfo();return}
  x=e.target.closest&&e.target.closest('[data-settings-page-close]');if(x){e.preventDefault();closeSettingsPage();return}
  x=e.target.closest&&e.target.closest('[data-notification-request]');if(x){e.preventDefault();requestNotifications();return}
  x=e.target.closest&&e.target.closest('#settings-page-overlay [data-settings-action="about"]');if(x){closeSettingsPage()}
},true);
function start(){new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});var old=window.DaehwateumBack;window.DaehwateumBack=function(){if(document.getElementById('settings-page-overlay')){closeSettingsPage();return true}return old?old():false};patch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();