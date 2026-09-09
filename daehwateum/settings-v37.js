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
  close:'닫기'
}:{
  notification:'Notifications',subscription:'Manage subscription',recovery:'Conversation recovery',appInfo:'App info',
  notificationTitle:'Notifications',notificationOn:'Notifications are on',notificationOff:'Notifications are off',
  notificationBodyOn:'We’ll let you know when a new question opens or answers are ready to view.',
  notificationBodyOff:'Turn on notifications so you do not miss new questions or answer-ready updates.',
  notificationEnable:'Enable notifications',notificationOpen:'Check notification permission',notificationHint:'You can also change notification permission anytime in your device settings.',
  appInfoTitle:'App info',version:'Version',how:'How Daehwateum works',terms:'Terms of use',privacy:'Privacy policy',
  close:'Close'
}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function closeSettingsPage(){var x=document.getElementById('settings-page-overlay');if(x)x.remove()}
function closeSettingsDetail(){var x=document.getElementById('settings-detail-overlay');if(x)x.remove()}
function page(title,body){closeSettingsPage();var x=document.createElement('div');x.id='settings-page-overlay';x.className='settings-page-overlay';x.innerHTML='<div class="settings-page-sheet"><header><button type="button" class="settings-page-back" data-settings-page-close aria-label="Back">←</button><b>'+esc(title)+'</b></header><main>'+body+'</main></div>';document.body.appendChild(x)}
function detailPage(title,body){closeSettingsDetail();var x=document.createElement('div');x.id='settings-detail-overlay';x.className='settings-detail-overlay';x.innerHTML='<div class="settings-detail-sheet"><header><button type="button" class="settings-page-back" data-settings-detail-close aria-label="Back">←</button><b>'+esc(title)+'</b></header><main>'+body+'</main></div>';document.body.appendChild(x)}
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
function appInfoBody(){var c=t();return '<section class="settings-page-card app-info-card"><div class="app-info-brand">◉ 대화틈</div><div class="app-info-version"><span>'+esc(c.version)+'</span><b>'+esc(VERSION)+'</b></div></section><section class="settings-page-list"><button type="button" data-settings-action="about">'+esc(c.how)+'<span>›</span></button><button type="button" data-settings-legal="terms">'+esc(c.terms)+'<span>›</span></button><button type="button" data-settings-legal="privacy">'+esc(c.privacy)+'<span>›</span></button></section>'}
function openAppInfo(){page(t().appInfoTitle,appInfoBody())}
function termsBody(){
  if(!KO)return '<section class="settings-legal-card"><span class="k">BETA TERMS</span><h1>Daehwateum Terms of Use</h1><p>Basic terms for the Daehwateum Private Beta.</p><h2>1. Service</h2><p>Daehwateum is a private conversation service where invited people answer the same question separately and open their answers together.</p><h2>2. How it works</h2><p>The current beta starts without a separate sign-up using a device-based guest identity. If the app is deleted or the device changes without recovery information, the previous connection may be lost.</p><h2>3. Spaces and conversations</h2><p>Spaces you leave deliberately are not recoverable. If the host deletes a space, its records may disappear for all participants.</p><h2>4. Premium</h2><p>Premium in the Private Beta is a test feature and may differ from paid service. When billing is introduced, purchase, renewal and cancellation will follow the purchase screen and Google Play policies.</p><h2>5. User responsibility</h2><p>Invitation links and recovery codes may affect access to conversations and should not be shared without permission.</p><h2>6. Changes</h2><p>Features and operating rules may change during beta, with important changes announced in the app or distribution channel.</p><div class="settings-legal-note">Beta draft · September 9, 2026. Final terms will be reviewed before public release.</div></section>';
  return '<section class="settings-legal-card"><span class="k">BETA TERMS</span><h1>대화틈 이용약관</h1><p>대화틈 Private Beta 이용을 위한 기본 기준입니다.</p><h2>1. 서비스</h2><p>대화틈은 초대한 사람끼리 같은 질문에 각자 답하고, 서로의 답을 함께 열어보는 비공개 대화 서비스입니다.</p><h2>2. 이용 방식</h2><p>현재 Beta는 별도 회원가입 없이 기기 기반 guest identity로 시작합니다. 앱 삭제·기기 변경 시 복구 정보를 준비하지 않았다면 기존 연결을 잃을 수 있습니다.</p><h2>3. 대화와 방 관리</h2><p>사용자가 직접 나간 대화틈은 복구되지 않습니다. 방장이 방을 삭제하면 해당 방의 기록은 참여자 모두에게서 사라질 수 있습니다.</p><h2>4. Premium</h2><p>현재 Private Beta의 Premium은 테스트 기능이며 실제 유료 결제와 다를 수 있습니다. 정식 결제가 도입되면 결제·갱신·취소 조건은 구매 화면과 Google Play 정책을 함께 따릅니다.</p><h2>5. 사용자 책임</h2><p>초대 링크와 복구 코드는 대화 접근에 영향을 줄 수 있으므로 다른 사람과 무단으로 공유하지 않아야 합니다.</p><h2>6. 변경</h2><p>Beta 과정에서 기능과 운영 기준이 변경될 수 있으며 중요한 변경은 앱 또는 배포 채널을 통해 안내할 수 있습니다.</p><div class="settings-legal-note">Beta 초안 · 2026년 9월 9일 기준. 정식 공개 배포 전 최종 약관은 별도 검토 후 확정됩니다.</div></section>';
}
function privacyBody(){
  if(!KO)return '<section class="settings-legal-card"><span class="k">BETA PRIVACY</span><h1>Privacy Policy</h1><p>This page briefly explains the information used in the Daehwateum Private Beta and why it is used.</p><h2>1. Information processed</h2><p>Name, space participation information, questions and answers, reflections, device-generated guest identity, push token when notifications are enabled, and recovery information set by the user may be processed.</p><h2>2. Purpose</h2><p>Information is used for space participation, question and answer storage and reveal control, history, notifications, data recovery and service stability.</p><h2>3. Private conversations</h2><p>Conversation content is used to provide the private space experience. In the current beta, private answers are not used for a public feed or ad targeting.</p><h2>4. Recovery information</h2><p>Recovery email contains a recovery code rather than conversation content. Do not share the code with other people.</p><h2>5. Notifications</h2><p>Notifications are designed not to include raw answer text or the content or author of private queued questions.</p><h2>6. Deletion and retention</h2><p>Access and retention can change when a user leaves or deletes a space. Final retention periods and deletion procedures will be confirmed before public release.</p><div class="settings-legal-note">Beta draft · September 9, 2026. Final legal notices and retention rules require review before public release.</div></section>';
  return '<section class="settings-legal-card"><span class="k">BETA PRIVACY</span><h1>개인정보처리방침</h1><p>대화틈 Private Beta에서 현재 사용하는 정보와 목적을 간단히 설명합니다.</p><h2>1. 처리하는 정보</h2><p>이름, 대화틈 참여 정보, 질문과 답변, 회고, 기기에서 생성된 guest identity, 알림 사용 시 push token, 사용자가 직접 설정한 복구 정보가 처리될 수 있습니다.</p><h2>2. 이용 목적</h2><p>대화틈 참여, 질문·답변 저장과 공개 제어, 대화 히스토리 제공, 알림 전송, 데이터 복구, 서비스 안정성 확인을 위해 사용합니다.</p><h2>3. 비공개 대화</h2><p>대화 내용은 참여 중인 대화틈 경험을 제공하기 위해 사용하며, 현재 Beta에서는 공개 피드나 광고 타게팅을 위해 private answer를 사용하지 않습니다.</p><h2>4. 복구 정보</h2><p>복구 이메일에는 대화 내용 자체가 아니라 활성 대화틈을 다시 연결하기 위한 복구 코드가 포함됩니다. 복구 코드는 다른 사람과 공유하지 않는 것이 좋습니다.</p><h2>5. 알림</h2><p>알림에는 실제 답변 원문이나 비공개 예약 질문의 내용·작성자를 넣지 않는 것을 기본 원칙으로 합니다.</p><h2>6. 삭제와 보존</h2><p>방 나가기·삭제 등 사용자의 조작에 따라 접근 권한과 기록 보존 범위가 달라질 수 있습니다. 정식 공개 전 보존 기간과 삭제 절차를 최종 정책으로 확정할 예정입니다.</p><div class="settings-legal-note">Beta 초안 · 2026년 9월 9일 기준. 정식 공개 배포 전 법적 고지 항목과 보존 기준을 포함해 최종 검토가 필요합니다.</div></section>';
}
function openLegal(kind){var c=t();detailPage(kind==='terms'?c.terms:c.privacy,kind==='terms'?termsBody():privacyBody())}
function ensureMenu(){
  var m=document.getElementById('settings-popover');if(!m)return;
  if(m.getAttribute('data-settings-v38')==='1')return;
  var danger=m.querySelector('.danger-menu');
  var c=t();
  Array.from(m.querySelectorAll('button')).forEach(function(b){if(b!==danger)b.remove()});
  function add(label,attr,val){var b=document.createElement('button');b.type='button';b.setAttribute(attr,val||'1');b.textContent=label;m.insertBefore(b,danger||null)}
  add(c.notification,'data-settings-notification','1');
  add(c.subscription,'data-settings-subscription','1');
  var legacy=document.createElement('button');legacy.type='button';legacy.hidden=true;legacy.setAttribute('data-subscription-management','1');legacy.setAttribute('aria-hidden','true');m.insertBefore(legacy,danger||null);
  add(c.recovery,'data-recovery-settings','1');
  add(c.appInfo,'data-settings-app-info','1');
  m.setAttribute('data-settings-v38','1');
}
function alignRecoveryTitle(){var b=document.querySelector('#recovery-overlay .recovery-sheet>header b');if(b&&b.textContent!==t().recovery)b.textContent=t().recovery}
function patch(){if(patching)return;patching=true;requestAnimationFrame(function(){patching=false;ensureMenu();alignRecoveryTitle()})}
document.addEventListener('click',function(e){
  var x=e.target.closest&&e.target.closest('[data-settings-subscription]');if(x){e.preventDefault();var sm=document.getElementById('settings-popover');if(sm)sm.remove();location.href='./subscription/manage/';return}
  x=e.target.closest&&e.target.closest('[data-settings-notification]');if(x){e.preventDefault();var m=document.getElementById('settings-popover');if(m)m.remove();openNotifications();return}
  x=e.target.closest&&e.target.closest('[data-settings-app-info]');if(x){e.preventDefault();var mm=document.getElementById('settings-popover');if(mm)mm.remove();openAppInfo();return}
  x=e.target.closest&&e.target.closest('[data-settings-page-close]');if(x){e.preventDefault();closeSettingsPage();return}
  x=e.target.closest&&e.target.closest('[data-settings-detail-close]');if(x){e.preventDefault();closeSettingsDetail();return}
  x=e.target.closest&&e.target.closest('[data-settings-legal]');if(x){e.preventDefault();openLegal(x.getAttribute('data-settings-legal'));return}
  x=e.target.closest&&e.target.closest('[data-notification-request]');if(x){e.preventDefault();requestNotifications();return}
  x=e.target.closest&&e.target.closest('#settings-page-overlay [data-settings-action="about"]');if(x){setTimeout(function(){var a=document.getElementById('about-overlay');if(a){a.classList.add('settings-nested-about');a.style.zIndex='10001'}},0);return}
},true);
function start(){
  new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});
  var old=window.DaehwateumBack;
  window.DaehwateumBack=function(){
    if(document.getElementById('settings-detail-overlay')){closeSettingsDetail();return true}
    if(document.getElementById('about-overlay'))return old?old():false;
    if(document.getElementById('settings-page-overlay')){closeSettingsPage();return true}
    return old?old():false
  };
  patch()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();