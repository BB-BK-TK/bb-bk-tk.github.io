(function(){'use strict';
var homeY=0,hasHomeY=false,watcher=null,fallbackTimer=null;
function scrollY(){return window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0}
function setY(y){window.scrollTo(0,y);document.documentElement.scrollTop=y;document.body.scrollTop=y}
function isHome(){return !!document.querySelector('.hero')||(!!document.querySelector('.spaces')&&!document.querySelector('.q')&&!document.querySelector('.intro'))}
function saveHomePosition(){if(!isHome())return;homeY=scrollY();hasHomeY=true}
function stopWatch(){if(watcher){watcher.disconnect();watcher=null}if(fallbackTimer){clearTimeout(fallbackTimer);fallbackTimer=null}}
function settleAt(y){setY(y);requestAnimationFrame(function(){setY(y);requestAnimationFrame(function(){setY(y)})});setTimeout(function(){setY(y)},80);setTimeout(function(){setY(y)},180)}
function watchFor(mode,y){
  stopWatch();
  var app=document.getElementById('app');if(!app){settleAt(y);return}
  var started=Date.now();
  function ready(){return mode==='home'?isHome():!isHome()}
  function finish(){stopWatch();settleAt(y)}
  watcher=new MutationObserver(function(){if(ready())finish()});
  watcher.observe(app,{childList:true,subtree:true});
  fallbackTimer=setTimeout(function(){if(ready()||Date.now()-started>=3000)finish()},3000);
  setTimeout(function(){if(ready())finish()},0);
}
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('[data-a]');if(!b)return;
  var a=b.getAttribute('data-a'),fromHome=isHome();
  if(a==='home'){
    if(fromHome)return;
    watchFor('home',hasHomeY?homeY:0);
    return;
  }
  if(fromHome&&(a==='open-room'||a==='create'||a==='new')){
    saveHomePosition();
    watchFor('depth',0);
  }
},true);
})();
