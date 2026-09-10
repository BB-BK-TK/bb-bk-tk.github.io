(function(){'use strict';
var ua=navigator.userAgent||'';
if(/DaehwateumInsets\/1/.test(ua))document.documentElement.classList.add('native-insets');
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}

var app=document.getElementById('app');
if(!app)return;

var homeY=0,hasHomeY=false,mode=null,entryResetRaf=0,restoreTimer=null;
var anchorState=null;
var returningHome=false,returnStartedAt=0,returnCheckTimer=null,returnHardTimer=null,returnSettling=false;

function homeVisible(){return !!app.querySelector('.hero')}
function roomVisible(){return !homeVisible()&&!!app.querySelector('.q,.stage,.intro,.question-queue-screen,#qf,#cf,#jf')}
function freshScreenVisible(){return !homeVisible()&&app.children.length>0}
function currentY(){
  var vals=[window.scrollY||window.pageYOffset||0];
  [document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)vals.push(el.scrollTop||0)}catch(e){}});
  return Math.max.apply(Math,vals.map(function(v){v=Number(v);return isFinite(v)&&v>0?v:0}));
}
function setY(v){
  v=Math.max(0,Number(v)||0);
  try{window.scrollTo({left:0,top:v,behavior:'auto'})}catch(e){try{window.scrollTo(0,v)}catch(_e){}}
  [document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)el.scrollTop=v}catch(e){}});
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
function stopEntryReset(){
  if(entryResetRaf){
    try{cancelAnimationFrame(entryResetRaf)}catch(e){}
    entryResetRaf=0;
  }
  unlockAnchoring();
}
function finishFreshTop(check){
  setY(0);
  entryResetRaf=requestAnimationFrame(function(){
    entryResetRaf=0;
    if(!check||check())setY(0);
    unlockAnchoring();
  });
}
function prepareSynchronousFreshRoute(){
  stopEntryReset();
  lockAnchoring();
  // create()/new() replace #app synchronously in app.js. Reset before that
  // replacement so the destination never paints with the previous home scrollY.
  setY(0);
}
function scheduleRoomTop(){
  stopEntryReset();
  lockAnchoring();
  finishFreshTop(roomVisible);
}
function cancelEntryResetOnInteraction(){
  if(!entryResetRaf)return;
  stopEntryReset();
}
['pointerdown','touchstart','wheel'].forEach(function(type){
  window.addEventListener(type,cancelEntryResetOnInteraction,{capture:true,passive:true});
});
function ensureReturnStyle(){
  if(document.getElementById('dt-route-return-v13-style'))return;
  var s=document.createElement('style');
  s.id='dt-route-return-v13-style';
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
  stopEntryReset();
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
  if((action==='create'||action==='new')&&homeVisible()){
    homeY=currentY();
    hasHomeY=true;
    mode='enter-fresh';
    prepareSynchronousFreshRoute();
    try{node.blur()}catch(e){}
    return;
  }
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
  if(mode==='enter-fresh'&&freshScreenVisible()){
    mode=null;
    finishFreshTop(freshScreenVisible);
    return;
  }
  if(mode==='enter-room'&&roomVisible()){
    mode=null;
    scheduleRoomTop();
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
