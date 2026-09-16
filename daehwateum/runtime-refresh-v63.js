(function(){'use strict';
var CURRENT=(document.querySelector('meta[name="dt-build"]')||{}).content||'';
var checking=false,lastCheck=0,pendingRemote='';
function loadAccountLifecycle(){
  if(!document.querySelector('link[data-dt-account-lifecycle]')){
    var l=document.createElement('link');l.rel='stylesheet';l.href='./account-lifecycle-v67.css?v=20260916-1125';l.setAttribute('data-dt-account-lifecycle','1');document.head.appendChild(l);
  }
  if(!document.querySelector('script[data-dt-account-lifecycle]')){
    var s=document.createElement('script');s.src='./account-lifecycle-v67.js?v=20260916-1125';s.defer=true;s.setAttribute('data-dt-account-lifecycle','1');document.head.appendChild(s);
  }
}
function isDrafting(){
  if(window.DT&&typeof DT.isDraftingV72==='function')return DT.isDraftingV72();
  var app=document.getElementById('app'),active=document.activeElement;
  return !!(app&&(app.querySelector('.answer-open-v43 #af')||(active&&app.contains(active)&&active.matches&&active.matches('textarea,input,[contenteditable="true"]'))));
}
function stripRefreshMarker(){
  try{var u=new URL(location.href);if(!u.searchParams.has('dt-build-refresh'))return;u.searchParams.delete('dt-build-refresh');history.replaceState({},'',u.pathname+(u.search?u.search:'')+u.hash)}catch(e){}
}
function reloadFor(remote){
  if(!remote||remote===CURRENT)return;
  if(isDrafting()){pendingRemote=remote;return}
  var key='dt-build-refresh:'+remote;
  try{if(sessionStorage.getItem(key)==='1')return;sessionStorage.setItem(key,'1')}catch(e){}
  try{var u=new URL(location.href);u.searchParams.set('dt-build-refresh',remote);location.replace(u.toString())}catch(e){location.reload()}
}
function checkPending(){if(!pendingRemote||isDrafting())return;var remote=pendingRemote;pendingRemote='';reloadFor(remote)}
function check(){
  var now=Date.now();
  if(checking||now-lastCheck<15000)return;
  checking=true;lastCheck=now;
  fetch('./index.html?dt-refresh='+now,{cache:'no-store',credentials:'same-origin'})
    .then(function(r){return r.ok?r.text():''})
    .then(function(html){
      if(!html||!CURRENT)return;
      var m=html.match(/<meta\s+name=["']dt-build["']\s+content=["']([^"']+)["']/i);
      var remote=m&&m[1];
      if(remote&&remote!==CURRENT)reloadFor(remote);
      else if(remote===CURRENT){pendingRemote='';stripRefreshMarker()}
    })
    .catch(function(){})
    .then(function(){checking=false});
}
loadAccountLifecycle();
document.addEventListener('visibilitychange',function(){if(!document.hidden)check()});
window.addEventListener('focus',check);
document.addEventListener('focusout',function(){setTimeout(checkPending,100)});
document.addEventListener('submit',function(){setTimeout(checkPending,250)});
setTimeout(check,3000);
})();
