(function(){'use strict';
var KO=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var timer=null;
function flash(msg,bad){var old=document.getElementById('recovery-action-feedback');if(old)old.remove();var x=document.createElement('div');x.id='recovery-action-feedback';x.setAttribute('role','status');x.textContent=msg;x.style.cssText='position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:10020;max-width:min(88vw,520px);padding:11px 15px;border-radius:999px;background:'+(bad?'#8f3d35':'#292521')+';color:#fff;font-size:12px;font-weight:800;box-shadow:0 12px 34px #0002;text-align:center';document.body.appendChild(x);clearTimeout(timer);timer=setTimeout(function(){if(x.parentNode)x.remove()},2400)}
document.addEventListener('click',function(e){
  var copy=e.target.closest&&e.target.closest('[data-recovery-copy]');
  if(copy){setTimeout(function(){flash(KO?'복구 코드를 복사했어요.':'Recovery code copied.')},40);return}
  var mail=e.target.closest&&e.target.closest('#recovery-add-email .btn');
  if(mail){var form=mail.closest('form'),input=form&&form.querySelector('input[type="email"]');if(!input||!input.value.trim()){e.preventDefault();e.stopImmediatePropagation();if(input){input.focus();input.setCustomValidity(KO?'받을 이메일을 입력해 주세요.':'Enter the email address to receive the recovery code.');input.reportValidity();setTimeout(function(){input.setCustomValidity('')},100)}flash(KO?'받을 이메일을 먼저 입력해 주세요.':'Enter an email address first.',true);return}flash(KO?'메일 앱을 여는 중이에요…':'Opening your email app…');return}
  var saved=e.target.closest&&e.target.closest('[data-recovery-saved]');if(saved)setTimeout(function(){flash(KO?'복구 준비가 완료됐어요.':'Recovery is ready.')},50)
},true);
})();