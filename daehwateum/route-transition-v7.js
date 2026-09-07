(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var shell=null,readyTimer=null;
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function setTop(){
  try{window.scrollTo({left:0,top:0,behavior:'auto'})}catch(e){try{window.scrollTo(0,0)}catch(_e){}}
  [document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)el.scrollTop=0}catch(e){}});
  nativeTop();
}
function isHome(){return !!app.querySelector('.hero')}
function roomReady(){return !isHome()&&!!app.querySelector('.q,.stage,.intro,.question-queue-screen')}
function ensureStyle(){
  if(document.getElementById('dt-route-transition-style'))return;
  var s=document.createElement('style');s.id='dt-route-transition-style';
  s.textContent='.dt-route-shell{position:fixed;inset:0;z-index:9998;background:#f6f1ea;overflow:hidden;opacity:1;transition:opacity .12s ease}.dt-route-shell-inner{width:min(94%,760px);margin:0 auto;padding:0 0 40px}.native-app .dt-route-shell-inner{padding-top:30px}.dt-route-shell-head{min-height:68px;display:flex;align-items:center;font-weight:900;font-size:16px;color:#292521}.dt-route-shell-card{background:#fffdfa;border:1px solid #e5ddd3;border-radius:26px;margin-top:10px;padding:28px;min-height:180px}.dt-route-shell-card.small{min-height:118px}.dt-route-shell-k{height:9px;width:92px;border-radius:999px;background:#e5ddd3}.dt-route-shell-line{height:15px;border-radius:999px;background:#e9e3dc;margin-top:18px;width:78%}.dt-route-shell-line.short{width:48%}.dt-route-shell-name{margin:18px 0 0;font-family:Georgia,"Noto Serif KR",serif;font-size:22px;font-weight:500;color:#292521}.dt-route-shell-note{margin-top:8px;font-size:11px;color:#7b746c}.dt-route-shell-pulse{animation:dtRoutePulse 1.1s ease-in-out infinite}@keyframes dtRoutePulse{0%,100%{opacity:.48}50%{opacity:.9}}';
  document.head.appendChild(s);
}
function removeShell(){
  if(!shell)return;
  var old=shell;shell=null;
  old.style.opacity='0';
  setTimeout(function(){try{old.remove()}catch(e){}},130);
}
function finishWhenReady(){
  if(!shell||!roomReady())return;
  if(readyTimer)clearTimeout(readyTimer);
  setTop();
  requestAnimationFrame(function(){setTop();readyTimer=setTimeout(function(){if(roomReady())setTop();removeShell()},45)});
}
function showShell(button){
  if(shell||!isHome())return;
  ensureStyle();
  var card=button&&button.closest?button.closest('.spacecard'):null;
  var name=card&&card.querySelector('h3')?card.querySelector('h3').textContent.trim():'';
  var el=document.createElement('div');el.className='dt-route-shell';el.setAttribute('aria-live','polite');el.setAttribute('aria-label','대화틈을 여는 중');
  el.innerHTML='<div class="dt-route-shell-inner"><div class="dt-route-shell-head">◉ 대화틈</div><section class="dt-route-shell-card"><div class="dt-route-shell-k dt-route-shell-pulse"></div>'+(name?'<h2 class="dt-route-shell-name"></h2>':'')+'<div class="dt-route-shell-line dt-route-shell-pulse"></div><div class="dt-route-shell-line short dt-route-shell-pulse"></div><p class="dt-route-shell-note">대화를 여는 중...</p></section><section class="dt-route-shell-card small"><div class="dt-route-shell-line dt-route-shell-pulse"></div><div class="dt-route-shell-line short dt-route-shell-pulse"></div></section></div>';
  if(name){var n=el.querySelector('.dt-route-shell-name');if(n)n.textContent=name}
  document.body.appendChild(el);shell=el;
}
app.addEventListener('click',function(ev){
  var b=ev.target&&ev.target.closest&&ev.target.closest('[data-a="open-room"]');
  if(b&&isHome())showShell(b);
},true);
new MutationObserver(function(){finishWhenReady()}).observe(app,{childList:true,subtree:false});
window.addEventListener('pageshow',function(){if(shell&&roomReady())finishWhenReady()});
})();
