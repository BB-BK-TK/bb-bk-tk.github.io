(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var homeY=0,entryPending=false,entryTimer=null;
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function currentY(){var s=document.scrollingElement||document.documentElement||document.body;return (s&&s.scrollTop)||window.pageYOffset||0}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function pageTop(){try{window.scrollTo({top:0,left:0,behavior:'instant'})}catch(e){try{window.scrollTo(0,0)}catch(_) {}}var s=document.scrollingElement;if(s)s.scrollTop=0;if(document.documentElement)document.documentElement.scrollTop=0;if(document.body)document.body.scrollTop=0;nativeTop()}
function isHome(){return !!app.querySelector('.hero')}
function isRoom(){return !isHome()&&!!app.querySelector('.q,.stage,.intro,#qf,.question-queue-screen')}
function beginEntry(){if(!isHome())return;homeY=currentY();entryPending=true;if(entryTimer)clearTimeout(entryTimer);entryTimer=setTimeout(function(){entryPending=false},1800)}
document.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('[data-a="open-room"]');if(t)beginEntry()},true);
new MutationObserver(function(){if(entryPending&&isRoom()){entryPending=false;if(entryTimer){clearTimeout(entryTimer);entryTimer=null}try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}catch(e){}pageTop();requestAnimationFrame(pageTop);setTimeout(pageTop,80);setTimeout(pageTop,240)}}).observe(app,{childList:true,subtree:true});
window.addEventListener('popstate',function(){if(isHome())requestAnimationFrame(function(){try{window.scrollTo(0,homeY)}catch(e){}})});
})();