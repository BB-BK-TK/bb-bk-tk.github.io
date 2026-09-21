(function(){
  'use strict';

  var ENDPOINT='https://kacvynoegfpvgdpqtjdi.supabase.co/rest/v1/dt_acquisition_events';
  var API_KEY='sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6';
  var VISITOR_KEY='dt.acq.visitor.v1';
  var ALLOWED={landing_view:true,download_click:true,app_first_open:true};
  var ASSET_BASE=(function(){try{return new URL('./',document.currentScript&&document.currentScript.src?document.currentScript.src:location.href).href}catch(e){return './'}})();

  function randomId(){
    if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
    var bytes=new Uint8Array(16);
    if(window.crypto&&typeof window.crypto.getRandomValues==='function')window.crypto.getRandomValues(bytes);
    else for(var i=0;i<16;i++)bytes[i]=Math.floor(Math.random()*256);
    bytes[6]=(bytes[6]&15)|64; bytes[8]=(bytes[8]&63)|128;
    var h=Array.prototype.map.call(bytes,function(b){return b.toString(16).padStart(2,'0')}).join('');
    return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
  }

  function visitorId(){
    try{
      var saved=localStorage.getItem(VISITOR_KEY);
      if(saved&&/^[0-9a-f-]{36}$/i.test(saved))return saved;
      var created=randomId();
      localStorage.setItem(VISITOR_KEY,created);
      return created;
    }catch(e){return randomId()}
  }

  function pagePath(){
    var raw=location.pathname;
    if(/^\/daehwateum-about\/?$/.test(raw))return '/about/';
    var p=raw.replace(/^\/daehwateum/,'/');
    if(p==='/about'||p==='/about/')return '/about/';
    if(p==='/join'||p==='/join/')return '/join/';
    return '/';
  }

  function sourceBucket(){
    var params=new URLSearchParams(location.search);
    var tagged=(params.get('utm_source')||'').toLowerCase();
    var ref='';
    try{ref=document.referrer?new URL(document.referrer).hostname.toLowerCase():''}catch(e){}
    if(!tagged&&ref===location.hostname)return 'internal';
    var value=tagged||ref||(/KAKAOTALK/i.test(navigator.userAgent||'')?'kakao':'');
    if(!value)return 'direct';
    if(/instagram|ig/.test(value))return 'instagram';
    if(/linkedin|lnkd/.test(value))return 'linkedin';
    if(/kakao/.test(value))return 'kakao';
    return 'other';
  }

  function platform(){
    var ua=navigator.userAgent||'';
    var standalone=navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);
    var ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    var android=/Android/i.test(ua);
    if(/DaehwateumAndroid/i.test(ua))return 'android_app';
    if(standalone&&ios)return 'ios_pwa';
    if(standalone&&android)return 'android_pwa';
    if(android)return 'android_web';
    if(ios)return 'ios_web';
    if(/Windows|Macintosh|Linux/i.test(ua))return 'desktop_web';
    return 'other';
  }

  function storageGet(key){try{return localStorage.getItem(key)}catch(e){return null}}
  function storageSet(key,value){try{localStorage.setItem(key,value)}catch(e){}}
  function storageRemove(key){try{localStorage.removeItem(key)}catch(e){}}

  function track(eventName){
    if(!ALLOWED[eventName])return Promise.resolve(false);
    var payload={
      event_name:eventName,
      visitor_id:visitorId(),
      page_path:pagePath(),
      source:sourceBucket(),
      platform:platform()
    };
    return fetch(ENDPOINT,{
      method:'POST',
      headers:{apikey:API_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify(payload),
      credentials:'omit',
      keepalive:true
    }).then(function(response){
      if(!response.ok)throw new Error('analytics '+response.status);
      return true;
    }).catch(function(){return false});
  }

  function trackLanding(){
    var path=pagePath();
    if(path!=='/about/'&&path!=='/join/')return;
    var day=new Date().toISOString().slice(0,10);
    var key='dt.acq.landing.'+path+'.'+day;
    if(storageGet(key))return;
    storageSet(key,'1');
    track('landing_view').then(function(ok){if(!ok)storageRemove(key)});
  }

  function trackFirstOpen(){
    var currentPlatform=platform();
    if(currentPlatform!=='android_app'&&currentPlatform!=='android_pwa'&&currentPlatform!=='ios_pwa')return;
    var key='dt.acq.first_open.'+currentPlatform;
    if(storageGet(key))return;
    storageSet(key,'1');
    track('app_first_open').then(function(ok){if(!ok)storageRemove(key)});
  }

  function bindDownload(){
    document.addEventListener('click',function(event){
      var target=event.target&&event.target.closest?event.target.closest('[data-acquisition-download]'):null;
      if(target&&platform()==='android_web')track('download_click');
    },true);
  }

  function loadInstallRecommendation(){
    var p=platform();
    if(p==='android_app'||p==='android_pwa'||p==='ios_pwa')return;
    if(!document.querySelector('link[data-dt-install-css]')){
      var css=document.createElement('link');css.rel='stylesheet';css.href=ASSET_BASE+'pwa-install-v71.css?v=20260916-2';css.setAttribute('data-dt-install-css','1');document.head.appendChild(css);
    }
    if(!document.querySelector('script[data-dt-install-js]')){
      var js=document.createElement('script');js.src=ASSET_BASE+'pwa-install-v71.js?v=20260916-2';js.defer=true;js.setAttribute('data-dt-install-js','1');document.head.appendChild(js);
    }
  }

  function start(){trackLanding();trackFirstOpen();bindDownload();loadInstallRecommendation()}
  window.DaehwateumAcquisition={track:track};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();