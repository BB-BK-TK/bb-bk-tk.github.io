(function(){'use strict';
var deferredPrompt=null,installedRelated=false;
var STORAGE='dt.install.dismissed.session.v1';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var ASSET_BASE=(function(){try{return new URL('./',document.currentScript&&document.currentScript.src?document.currentScript.src:location.href).href}catch(e){return './'}})();
function standalone(){return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true}
function nativeApp(){return /DaehwateumAndroid/.test(navigator.userAgent||'')}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1}
function isMobile(){return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'')||window.innerWidth<=900}
function inAppScope(){return location.pathname.indexOf('/daehwateum/app/')===0}
function checkInstalledRelated(){
  if(!navigator.getInstalledRelatedApps)return Promise.resolve(false);
  return navigator.getInstalledRelatedApps().then(function(apps){
    installedRelated=(apps||[]).some(function(app){
      return app&&app.platform==='webapp'&&String(app.url||'').indexOf('/daehwateum/app-manifest.webmanifest')>=0;
    });
    return installedRelated;
  }).catch(function(){installedRelated=false;return false});
}
function dismissed(){try{return sessionStorage.getItem(STORAGE)==='1'}catch(e){return false}}
function markDismissed(){try{sessionStorage.setItem(STORAGE,'1')}catch(e){}}
function appBase(){return new URL('app/',ASSET_BASE).href}
function cleanupLegacyWorker(){
  if(!('serviceWorker'in navigator)||!navigator.serviceWorker.getRegistrations)return Promise.resolve();
  return navigator.serviceWorker.getRegistrations().then(function(regs){
    return Promise.all((regs||[]).map(function(reg){
      if(reg&&reg.scope===ASSET_BASE)return reg.unregister().catch(function(){});
      return Promise.resolve();
    }));
  }).catch(function(){});
}
function ensureInstallability(){
  if(!inAppScope())return cleanupLegacyWorker();
  try{
    var manifest=document.querySelector('link[rel="manifest"]');
    if(!manifest){
      manifest=document.createElement('link');
      manifest.rel='manifest';
      document.head.appendChild(manifest);
    }
    manifest.href=ASSET_BASE+'app-manifest.webmanifest';
  }catch(e){}
  if('serviceWorker'in navigator){
    cleanupLegacyWorker().then(function(){
      navigator.serviceWorker.register(ASSET_BASE+'sw.js',{scope:appBase()}).catch(function(){});
    });
  }
}
function remove(){var el=document.querySelector('.dt-install-prompt');if(el)el.remove()}
function helpText(){if(isIOS())return ko?'Safari의 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택해주세요.':'In Safari, tap Share, then choose Add to Home Screen.';return ko?'브라우저 메뉴(⋮)에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해주세요.':'Open the browser menu and choose Install app or Add to Home screen.'}
function trackInstallClick(){try{if(window.DaehwateumAcquisition&&typeof window.DaehwateumAcquisition.track==='function')window.DaehwateumAcquisition.track('download_click')}catch(e){}}
function render(){
  if(standalone()||nativeApp()||installedRelated||dismissed()||document.querySelector('.dt-install-prompt'))return;
  if(!isMobile()&&!deferredPrompt)return;
  var el=document.createElement('aside');el.className='dt-install-prompt';el.setAttribute('role','dialog');el.setAttribute('aria-label',ko?'도란도란 앱 설치':'Install Dorandoran');
  el.innerHTML='<div class="dt-install-row"><div class="dt-install-icon">틈</div><div class="dt-install-copy"><h3>'+(ko?'도란도란을 앱으로 더 편하게':'Use Dorandoran as an app')+'</h3><p>'+(ko?'홈 화면에서 바로 열고, 대화를 놓치지 마세요.':'Open it from your home screen and keep your conversations close.')+'</p></div></div><div class="dt-install-actions"><button type="button" class="secondary" data-dt-install-later>'+(ko?'나중에':'Later')+'</button><button type="button" class="primary" data-dt-install>'+(isIOS()?(ko?'홈 화면에 추가':'Add to Home Screen'):(ko?'앱으로 설치':'Install app'))+'</button></div>';
  document.body.appendChild(el);
  el.querySelector('[data-dt-install-later]').onclick=function(){markDismissed();remove()};
  el.querySelector('[data-dt-install]').onclick=function(){
    var btn=this;trackInstallClick();
    if(!inAppScope()){
      location.href=appBase()+'?install=1';
      return;
    }
    if(deferredPrompt){
      btn.disabled=true;deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choice){if(choice&&choice.outcome==='accepted'){remove()}else{btn.disabled=false}deferredPrompt=null}).catch(function(){btn.disabled=false});
      return;
    }
    var help=el.querySelector('.dt-install-help');
    if(!help){help=document.createElement('div');help.className='dt-install-help';help.textContent=helpText();el.appendChild(help)}
  };
}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();installedRelated=false;deferredPrompt=e;render()});
window.addEventListener('appinstalled',function(){installedRelated=true;deferredPrompt=null;remove()});
function start(){ensureInstallability();if(standalone()||nativeApp())return;checkInstalledRelated().then(function(installed){if(!installed)setTimeout(render,900)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
