(function(){'use strict';
var app=document.getElementById('app');
var homeY=0,hasHomeY=false,pending=null,observer=null,holdTimer=null,holdEnd=0;
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function scroller(){return document.scrollingElement||document.documentElement||document.body}
function y(){var s=scroller();return (s&&s.scrollTop)||window.pageYOffset||0}
function setY(v){
  var s=scroller();
  try{window.scrollTo({left:0,top:v,behavior:'auto'})}catch(e){try{window.scrollTo(0,v)}catch(x){}}
  if(s)s.scrollTop=v;
  if(document.documentElement)document.documentElement.scrollTop=v;
  if(document.body)document.body.scrollTop=v;
}
function isHome(){return !!document.querySelector('.hero')}
function depthReady(){
  if(isHome())return false;
  return !!document.querySelector('.q,.stage,.intro,.premium-card,#qf,#cf,#jf');
}
function disableAnchoring(){
  try{document.documentElement.style.overflowAnchor='none'}catch(e){}
  try{document.body.style.overflowAnchor='none'}catch(e){}
  try{if(app)app.style.overflowAnchor='none'}catch(e){}
}
function forceTopOnce(){
  var top=document.querySelector('#app .top')||document.getElementById('app');
  try{if(top&&top.scrollIntoView)top.scrollIntoView({block:'start',inline:'nearest',behavior:'auto'})}catch(e){}
  setY(0);
  try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}
}
function hardTop(ms){
  disableAnchoring();
  if(holdTimer){clearInterval(holdTimer);holdTimer=null}
  holdEnd=Date.now()+(ms||1200);
  forceTopOnce();
  requestAnimationFrame(function(){forceTopOnce();requestAnimationFrame(forceTopOnce)});
  setTimeout(forceTopOnce,60);setTimeout(forceTopOnce,160);setTimeout(forceTopOnce,360);
  holdTimer=setInterval(function(){
    forceTopOnce();
    if(Date.now()>=holdEnd){clearInterval(holdTimer);holdTimer=null;forceTopOnce()}
  },32);
}
function restoreHome(){
  var target=hasHomeY?homeY:0;
  requestAnimationFrame(function(){setY(target);requestAnimationFrame(function(){setY(target)})});
  setTimeout(function(){setY(target)},120);
}
function completeDepth(){
  if(!pending||!depthReady())return false;
  pending=null;
  hardTop(1400);
  return true;
}
if(app){
  observer=new MutationObserver(function(){
    if(pending){completeDepth();return}
    if(holdTimer&&Date.now()<holdEnd)forceTopOnce();
  });
  observer.observe(app,{childList:true,subtree:true,attributes:true});
}
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('[data-a]');if(!b)return;
  var a=b.getAttribute('data-a'),fromHome=isHome();
  if(a==='open-room'||a==='create'||a==='new'){
    if(fromHome){homeY=y();hasHomeY=true}
    try{b.blur()}catch(e){}
    pending='depth';
    setY(0);
    setTimeout(completeDepth,0);
    setTimeout(completeDepth,250);
    setTimeout(completeDepth,700);
    setTimeout(function(){if(pending){pending=null;hardTop(1400)}},3500);
    return;
  }
  if(a==='premium'||a==='custom'||a==='room'){
    try{b.blur()}catch(e){}
    pending='depth';
    setY(0);
    setTimeout(completeDepth,0);
    setTimeout(completeDepth,250);
    setTimeout(function(){if(pending){pending=null;hardTop(1200)}},2200);
    return;
  }
  if(a==='home'&&!fromHome){
    try{b.blur()}catch(e){}
    setTimeout(restoreHome,0);setTimeout(restoreHome,140);
  }
},true);
})();
