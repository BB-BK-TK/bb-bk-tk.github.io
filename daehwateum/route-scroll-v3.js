(function(){'use strict';
var app=document.getElementById('app');
var homeY=0,hasHomeY=false,pendingDepth=false,observer=null,holdTimer=null,holdEnd=0;
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function scroller(){return document.scrollingElement||document.documentElement||document.body}
function y(){var s=scroller();return (s&&s.scrollTop)||window.pageYOffset||0}
function setY(v){
  var s=scroller();
  try{window.scrollTo(0,v)}catch(e){}
  if(s)s.scrollTop=v;
  if(document.documentElement)document.documentElement.scrollTop=v;
  if(document.body)document.body.scrollTop=v;
}
function disableAnchoring(){
  try{document.documentElement.style.overflowAnchor='none'}catch(e){}
  try{document.body.style.overflowAnchor='none'}catch(e){}
  try{if(app)app.style.overflowAnchor='none'}catch(e){}
}
function isHome(){return !!document.querySelector('.hero')||!!document.querySelector('.spaces')}
function hardTop(ms){
  disableAnchoring();
  if(holdTimer){clearInterval(holdTimer);holdTimer=null}
  holdEnd=Date.now()+(ms||900);
  setY(0);
  requestAnimationFrame(function(){setY(0);requestAnimationFrame(function(){setY(0)})});
  holdTimer=setInterval(function(){
    setY(0);
    if(Date.now()>=holdEnd){clearInterval(holdTimer);holdTimer=null;setY(0)}
  },16);
}
function restoreHome(){
  var target=hasHomeY?homeY:0;
  requestAnimationFrame(function(){setY(target);requestAnimationFrame(function(){setY(target)})});
  setTimeout(function(){setY(target)},100);
}
function onDepthRendered(){
  if(!pendingDepth)return;
  pendingDepth=false;
  hardTop(1200);
}
if(app){
  observer=new MutationObserver(function(){
    if(pendingDepth){onDepthRendered();return}
    if(holdTimer&&Date.now()<holdEnd)setY(0);
  });
  observer.observe(app,{childList:true,subtree:true});
}
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('[data-a]');if(!b)return;
  var a=b.getAttribute('data-a');
  if(a==='open-room'||a==='create'||a==='new'){
    if(isHome()){homeY=y();hasHomeY=true}
    pendingDepth=true;
    setY(0);
    setTimeout(function(){if(pendingDepth)hardTop(1200)},2500);
    return;
  }
  if(a==='premium'||a==='custom'||a==='room'){
    pendingDepth=true;
    setY(0);
    setTimeout(function(){if(pendingDepth)hardTop(1000)},1500);
    return;
  }
  if(a==='home'&&!isHome()){
    setTimeout(restoreHome,0);
    setTimeout(restoreHome,120);
  }
},true);
})();
