(function(){'use strict';
var ua=navigator.userAgent||'';
if(/DaehwateumInsets\/1/.test(ua))document.documentElement.classList.add('native-insets');
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}

var app=document.getElementById('app');
if(!app)return;

var homeY=0,hasHomeY=false,mode=null,settleUntil=0,settleTimer=null,restoreTimer=null;
var anchorState=null;
var returningHome=false,returnStartedAt=0,returnCheckTimer=null,returnHardTimer=null,returnSettling=false;

function homeVisible(){return !!app.querySelector('.hero')}
function roomVisible(){return !homeVisible()&&!!app.querySelector('.q,.stage,.intro,.question-queue-screen,#qf,#cf,#jf')}
function currentY(){
  var vals=[window.scrollY||window.pageYOffset||0];
  [document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)vals.push(el.scrollTop||0)}catch(e){}});
  return Math.max.apply(Math,vals.map(function(v){v=Number(v);return isFinite(v)&&v>0?v:0}));
}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function setY(v){
  v=Math.max(0,Number(v)||0);
  try{window.scrollTo({left:0,top:v,behavior:'auto'})}catch(e){try{window.scrollTo(0,v)}catch(_e){}}
  [document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)el.scrollTop=v}catch(e){}});
  if(v===0)nativeTop();
}
function lockAnchoring(){
  if(anchorState)return;
  anchorState=[];
  [document.documentElement,document.body,app].forEach(function(el){
    if(!el)return;
    anchorState.push([el,el.style.overflowAnchor]);
    try{el.style.overflowAnchor='none'}catch(e){}
  });
}
function unlockAnchoring(){
  if(!anchorState)return;
  anchorState.forEach(function(pair){try{pair[0].style.overflowAnchor=pair[1]||''}catch(e){}});
  anchorState=null;
}
function stopSettle(){
  if(settleTimer){clearTimeout(settleTimer);settleTimer=null}
  settleUntil=0;
  unlockAnchoring();
}
function forceRoomTop(){
  if(!roomVisible())return;
  setY(0);
}
function scheduleRoomTop(){
  stopSettle();
  lockAnchoring();
  settleUntil=Date.now()+1400;
  forceRoomTop();
  requestAnimationFrame(function(){forceRoomTop();requestAnimationFrame(forceRoomTop)});
  [60,160,360,700,1100,1400].forEach(function(ms){setTimeout(function(){if(Date.now()<=settleUntil+40)forceRoomTop()},ms)});
  function finish(){
    if(Date.now()<settleUntil){settleTimer=setTimeout(finish,Math.max(20,settleUntil-Date.now()));return}
    forceRoomTop();
    stopSettle();
  }
  settleTimer=setTimeout(finish,1420);
}
function ensureReturnStyle(){
  if(document.getElementById('dt-route-return-v11-style'))return;
  var s=document.createElement('style');
  s.id='dt-route-return-v11-style';
  s.textContent='html.dt-route-returning #app{visibility:hidden!important}';
  document.head.appendChild(s);
}
function clearReturnTimers(){
  if(returnCheckTimer){clearTimeout(returnCheckTimer);returnCheckTimer=null}
  if(returnHardTimer){clearTimeout(returnHardTimer);returnHardTimer=null}
}
function returnTarget(){return hasHomeY?homeY:0}
function homePatchReady(){
  var hero=app.querySelector('.hero');
  if(!hero)return false;
  return hero.hasAttribute('data-home-v9')||Date.now()-returnStartedAt>=180;
}
function endReturnReveal(force){
  if(!returningHome)return;
  if(!homeVisible()&&!force)return;
  var target=returnTarget();
  if(homeVisible())setY(target);
  requestAnimationFrame(function(){
    if(!returningHome)return;
    if(homeVisible())setY(target);
    document.documentElement.classList.remove('dt-route-returning');
    returningHome=false;
    returnSettling=false;
    clearReturnTimers();
    unlockAnchoring();
    [80,220,420].forEach(function(ms){setTimeout(function(){if(homeVisible())setY(target)},ms)});
  });
}
function scheduleReturnCheck(){
  if(!returningHome)return;
  if(returnCheckTimer)clearTimeout(returnCheckTimer);
  returnCheckTimer=setTimeout(function(){
    returnCheckTimer=null;
    if(!returningHome)return;
    if(homeVisible()){
      setY(returnTarget());
      if(homePatchReady()){endReturnReveal(false);return}
    }
    scheduleReturnCheck();
  },32);
}
function restoreHome(){
  if(!returningHome||!homeVisible())return;
  var target=returnTarget();
  setY(target);
  if(returnSettling)return;
  returnSettling=true;
  requestAnimationFrame(function(){
    if(!returningHome||!homeVisible())return;
    setY(target);
    requestAnimationFrame(function(){
      returnSettling=false;
      if(!returningHome||!homeVisible())return;
      setY(target);
      if(homePatchReady())endReturnReveal(false);else scheduleReturnCheck();
    });
  });
}
function beginReturnHome(){
  stopSettle();
  if(restoreTimer){clearTimeout(restoreTimer);restoreTimer=null}
  clearReturnTimers();
  ensureReturnStyle();
  returningHome=true;
  returnStartedAt=Date.now();
  returnSettling=false;
  mode='return-home';
  lockAnchoring();
  document.documentElement.classList.add('dt-route-returning');
  setY(returnTarget());
  returnHardTimer=setTimeout(function(){endReturnReveal(true)},520);
}

app.addEventListener('click',function(ev){
  var node=ev.target&&ev.target.closest&&ev.target.closest('[data-a]');
  if(!node)return;
  var action=node.getAttribute('data-a');
  if(action==='open-room'&&homeVisible()){
    homeY=currentY();
    hasHomeY=true;
    mode='enter-room';
    try{node.blur()}catch(e){}
    return;
  }
  if(action==='home'&&!homeVisible()){
    beginReturnHome();
    try{node.blur()}catch(e){}
  }
},true);

new MutationObserver(function(){
  if(mode==='enter-room'&&roomVisible()){
    mode=null;
    scheduleRoomTop();
    return;
  }
  if(settleUntil&&Date.now()<settleUntil&&roomVisible()){
    forceRoomTop();
    return;
  }
  if(mode==='return-home'&&homeVisible()){
    mode=null;
    restoreHome();
    return;
  }
  if(returningHome&&homeVisible()){
    setY(returnTarget());
    if(homePatchReady())restoreHome();
  }
}).observe(app,{childList:true,subtree:true,attributes:true});
})();
