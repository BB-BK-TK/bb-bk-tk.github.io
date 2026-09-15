(function(){'use strict';
var KO=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var PUSH_ENABLED='dt.push.enabled.v1';
function nativeSettingsAvailable(){return !!(window.AndroidPush&&typeof AndroidPush.openSettings==='function')}
function standalone(){return !!((window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true)}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function storedEnabled(){try{return localStorage.getItem(PUSH_ENABLED)==='1'}catch(e){return false}}
function setStoredEnabled(on){try{if(on)localStorage.setItem(PUSH_ENABLED,'1');else localStorage.removeItem(PUSH_ENABLED)}catch(e){}}
function permission(){try{return 'Notification'in window?Notification.permission:null}catch(e){return null}}
function enabled(){if(nativeSettingsAvailable())return storedEnabled();var p=permission();if(p==='granted')return true;if(p==='denied'||p==='default')return false;return storedEnabled()}
function syncWebState(){if(nativeSettingsAvailable())return;var p=permission();if(p==='granted')setStoredEnabled(true);else if(p==='denied')setStoredEnabled(false)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function copy(on){if(KO)return on?{title:'알림이 켜져 있어요',body:'새 질문이 열리거나 서로의 답을 볼 수 있게 되면 알려드려요.',label:'알림 권한',status:'켜짐',hint:'알림 권한은 기기 설정에서 언제든 변경할 수 있어요.'}:{title:'알림이 꺼져 있어요',body:'새 질문과 답변 준비 소식을 놓치지 않도록 알림을 켤 수 있어요.',label:'알림 권한',status:'꺼짐',hint:'알림 권한은 기기 설정에서 언제든 변경할 수 있어요.'};return on?{title:'Notifications are on',body:'We’ll let you know when a new question opens or answers are ready to view.',label:'Notification permission',status:'On',hint:'You can change notification permission anytime in your device settings.'}:{title:'Notifications are off',body:'Turn on notifications so you do not miss new questions or answer-ready updates.',label:'Notification permission',status:'Off',hint:'You can change notification permission anytime in your device settings.'}}
function message(kind){if(KO){if(kind==='granted')return '알림을 켰어요.';if(kind==='denied')return '알림이 차단되어 있어요. 기기 설정에서 대화틈 알림을 허용해 주세요.';if(kind==='manage')return '웹앱 알림은 기기 설정에서 변경할 수 있어요.';if(kind==='ios-browser')return 'iPhone에서는 Safari에서 대화틈을 홈 화면에 추가한 뒤 알림을 설정할 수 있어요.';return '이 환경에서는 알림 권한을 변경할 수 없어요.'}if(kind==='granted')return 'Notifications are on.';if(kind==='denied')return 'Notifications are blocked. Allow Daehwateum notifications in device settings.';if(kind==='manage')return 'Web app notification permission can be changed in device settings.';if(kind==='ios-browser')return 'On iPhone, add Daehwateum to your Home Screen from Safari before enabling notifications.';return 'Notification permission cannot be changed in this environment.'}
function setFeedback(text){var el=document.getElementById('notification-feedback');if(el)el.textContent=text||''}
function enhance(forceFeedback){syncWebState();var overlay=document.getElementById('settings-page-overlay');if(!overlay)return;var card=overlay.querySelector('.notification-settings-card');if(!card)return;var existing=card.querySelector('#notification-feedback'),feedback=typeof forceFeedback==='string'?forceFeedback:(existing?existing.textContent:'');var on=enabled(),c=copy(on);card.className='notification-settings-card notification-settings-simple';card.setAttribute('data-simple-notification','1');card.setAttribute('data-notification-state',on?'on':'off');card.innerHTML='<h1>'+esc(c.title)+'</h1><p>'+esc(c.body)+'</p><button type="button" class="notification-permission-row" data-notification-request aria-label="'+esc(c.label+' '+c.status)+'"><span class="notification-permission-label">'+esc(c.label)+'</span><span class="notification-permission-status '+(on?'on':'off')+'">'+esc(c.status)+'</span><span class="notification-permission-chevron" aria-hidden="true">›</span></button><div class="settings-action-feedback" id="notification-feedback" aria-live="polite">'+esc(feedback)+'</div><small>'+esc(c.hint)+'</small>'}
function scan(){requestAnimationFrame(function(){enhance()})}
function handleWebRequest(e){var x=e.target&&e.target.closest&&e.target.closest('[data-notification-request]');if(!x||nativeSettingsAvailable())return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  if(isIOS()&&!standalone()){enhance(message('ios-browser'));return}
  if(!('Notification'in window)){enhance(message('unsupported'));return}
  var p=permission();
  if(p==='default'){
    try{var r=Notification.requestPermission();if(r&&typeof r.then==='function'){r.then(function(next){setStoredEnabled(next==='granted');enhance(message(next==='granted'?'granted':'denied'))});}else{setTimeout(function(){var next=permission();setStoredEnabled(next==='granted');enhance(message(next==='granted'?'granted':'denied'))},250)}}catch(err){enhance(message('unsupported'))}
    return
  }
  enhance(message(p==='granted'?'manage':'denied'))
}
function start(){new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});window.addEventListener('click',handleWebRequest,true);document.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('[data-settings-notification]');if(x)setTimeout(enhance,0)},true);window.addEventListener('focus',scan,true);document.addEventListener('visibilitychange',function(){if(!document.hidden)scan()});scan()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
