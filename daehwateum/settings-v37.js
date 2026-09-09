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
  notificationChecking:'알림 상태를 확인하고 있어요…',notificationChecked:'알림 상태를 확인했어요.',notificationDenied:'기기 설정에서 대화틈 알림 권한을 허용해 주세요.',
  appInfoTitle:'앱 정보',version:'버전',how:'대화틈 사용 방법',terms:'이용약관',privacy:'개인정보처리방침'
}:{
  notification:'Notifications',subscription:'Manage subscription',recovery:'Conversation recovery',appInfo:'App info',
  notificationTitle:'Notifications',notificationOn:'Notifications are on',notificationOff:'Notifications are off',
  notificationBodyOn:'We’ll let you know when a new question opens or answers are ready to view.',
  notificationBodyOff:'Turn on notifications so you do not miss new questions or answer-ready updates.',
  notificationEnable:'Enable notifications',notificationOpen:'Check notification permission',notificationHint:'You can also change notification permission anytime in your device settings.',
  notificationChecking:'Checking notification status…',notificationChecked:'Notification status checked.',notificationDenied:'Allow Daehwateum notifications in your device settings.',
  appInfoTitle:'App info',version:'Version',how:'How Daehwateum works',terms:'Terms of use',privacy:'Privacy policy'
}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function closeSettingsPage(){var x=document.getElementById('settings-page-overlay');if(x)x.remove()}
function page(title,body){closeSettingsPage();var x=document.createElement('div');x.id='settings-page-overlay';x.className='settings-page-overlay';x.innerHTML='<div class="settings-page-sheet"><header><button type="button" class="settings-page-back" data-settings-page-close aria-label="Back">←</button><b>'+esc(title)+'</b></header><main>'+body+'</main></div>';document.body.appendChild(x)}
function pushEnabled(){try{return localStorage.getItem(PUSH_ENABLED)==='1'}catch(e){return false}}
function notificationBody(feedback){var c=t(),on=pushEnabled();return '<section class="settings-page-card notification-settings-card"><span class="k">NOTIFICATIONS</span><h1>'+esc(on?c.notificationOn:c.notificationOff)+'</h1><p>'+esc(on?c.notificationBodyOn:c.notificationBodyOff)+'</p>'+(on?'<button type="button" class="settings-row-action" data-notification-request>'+esc(c.notificationOpen)+'</button>':'<button type="button" class="btn full" data-notification-request>'+esc(c.notificationEnable)+'</button>')+'<div class="settings-action-feedback" id="notification-feedback" aria-live="polite">'+esc(feedback||'')+'</div><small>'+esc(c.notificationHint)+'</small></section>'}
function openNotifications(feedback){page(t().notificationTitle,notificationBody(feedback))}
function feedback(msg){var el=document.getElementById('notification-feedback');if(el)el.textContent=msg||''}
function requestNotifications(){
  var c=t();feedback(c.notificationChecking);
  try{localStorage.removeItem(PUSH_DISMISSED)}catch(e){}
  if(window.AndroidPush&&typeof AndroidPush.enable==='function'){
    try{AndroidPush.enable();setTimeout(function(){if(document.getElementById('settings-page-overlay'))openNotifications(pushEnabled()?c.notificationChecked:c.notificationDenied)},700);return}catch(e){feedback(c.notificationDenied);return}
  }
  if('Notification'in window){
    if(Notification.permission==='denied'){feedback(c.notificationDenied);return}
    if(Notification.permission==='default'){
      Notification.requestPermission().then(function(p){if(document.getElementById('settings-page-overlay'))openNotifications(p==='granted'?c.notificationChecked:c.notificationDenied)});return;
    }
    if(Notification.permission==='granted'){try{localStorage.setItem(PUSH_ENABLED,'1')}catch(e){}openNotifications(c.notificationChecked);return}
  }
  feedback(c.notificationDenied);
}
function appInfoBody(){var c=t();return '<section class="settings-page-card app-info-card"><div class="app-info-brand">◉ 대화틈</div><div class="app-info-version"><span>'+esc(c.version)+'</span><b>'+esc(VERSION)+'</b></div></section><section class="settings-page-list"><button type="button" data-settings-action="about">'+esc(c.how)+'<span>›</span></button><a href="./legal/terms/?from=app-info">'+esc(c.terms)+'<span>›</span></a><a href="./legal/privacy/?from=app-info">'+esc(c.privacy)+'<span>›</span></a></section>'}
function openAppInfo(){page(t().appInfoTitle,appInfoBody())}
function openPremiumFromQuery(){var p=new URLSearchParams(location.search);if(p.get('premium')!=='1')return;history.replaceState({},'',location.pathname+location.hash);setTimeout(function(){var app=document.getElementById('app');if(!app)return;var b=document.createElement('button');b.type='button';b.hidden=true;b.setAttribute('data-a','premium');b.setAttribute('data-feature','bundle');app.appendChild(b);b.click();b.remove()},80)}
function ensureMenu(){
  var m=document.getElementById('settings-popover');if(!m)return;
  if(m.getAttribute('data-settings-v37')==='1')return;
  var danger=m.querySelector('.danger-menu');var c=t();
  Array.from(m.querySelectorAll('button')).forEach(function(b){if(b!==danger)b.remove()});
  function add(label,attr,val){var b=document.createElement('button');b.type='button';b.setAttribute(attr,val||'1');b.textContent=label;m.insertBefore(b,danger||null)}
  add(c.notification,'data-settings-notification','1');
  add(c.subscription,'data-settings-subscription','1');
  var legacy=document.createElement('button');legacy.type='button';legacy.hidden=true;legacy.setAttribute('data-subscription-management','1');legacy.setAttribute('aria-hidden','true');m.insertBefore(legacy,danger||null);
  add(c.recovery,'data-recovery-settings','1');
  add(c.appInfo,'data-settings-app-info','1');
  m.setAttribute('data-settings-v37','1');
}
function patch(){if(patching)return;patching=true;requestAnimationFrame(function(){patching=false;ensureMenu()})}
document.addEventListener('click',function(e){
  var x=e.target.closest&&e.target.closest('[data-settings-subscription]');if(x){e.preventDefault();var sm=document.getElementById('settings-popover');if(sm)sm.remove();location.href='./subscription/manage/';return}
  x=e.target.closest&&e.target.closest('[data-settings-notification]');if(x){e.preventDefault();var m=document.getElementById('settings-popover');if(m)m.remove();openNotifications();return}
  x=e.target.closest&&e.target.closest('[data-settings-app-info]');if(x){e.preventDefault();var mm=document.getElementById('settings-popover');if(mm)mm.remove();openAppInfo();return}
  x=e.target.closest&&e.target.closest('[data-settings-page-close]');if(x){e.preventDefault();closeSettingsPage();return}
  x=e.target.closest&&e.target.closest('[data-notification-request]');if(x){e.preventDefault();requestNotifications();return}
  x=e.target.closest&&e.target.closest('#settings-page-overlay [data-settings-action="about"]');if(x){closeSettingsPage();try{sessionStorage.setItem('dt.settings.return.appinfo','1')}catch(err){}}
},true);
function start(){new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});var old=window.DaehwateumBack;window.DaehwateumBack=function(){if(document.getElementById('settings-page-overlay')){closeSettingsPage();return true}return old?old():false};patch();openPremiumFromQuery();try{if(sessionStorage.getItem('dt.settings.return.appinfo')==='1'){sessionStorage.removeItem('dt.settings.return.appinfo');setTimeout(openAppInfo,50)}}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();