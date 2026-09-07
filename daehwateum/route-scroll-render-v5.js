(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML')||Object.getOwnPropertyDescriptor(HTMLElement.prototype,'innerHTML');
if(!d||!d.get||!d.set)return;
var homeY=0,lockTimer=null,lockUntil=0,pendingRoomUntil=0,nativeTimers=[];
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function currentY(){var s=document.scrollingElement||document.documentElement||document.body;return (s&&s.scrollTop)||window.pageYOffset||0}
function blurActive(){try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}catch(e){}}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function clearNativeTimers(){nativeTimers.forEach(function(t){clearTimeout(t)});nativeTimers=[]}
function setY(v){try{window.scrollTo(0,v)}catch(e){}var roots=[document.scrollingElement,document.documentElement,document.body,app];roots.forEach(function(el){try{if(el)el.scrollTop=v}catch(e){}});if(v===0){var nodes=app.querySelectorAll('*');for(var i=0;i<nodes.length;i++){var el=nodes[i];if(!el||!el.scrollTop)continue;try{var s=getComputedStyle(el);if(/auto|scroll|overlay/.test(s.overflowY))el.scrollTop=0}catch(e){}}}}
function lockAt(v,ms){if(lockTimer){clearInterval(lockTimer);lockTimer=null}clearNativeTimers();lockUntil=Date.now()+(ms||700);setY(v);if(v===0){nativeTop();[60,180,360,650,1000,1450].forEach(function(delay){nativeTimers.push(setTimeout(function(){setY(0);nativeTop()},delay))})}requestAnimationFrame(function(){setY(v);requestAnimationFrame(function(){setY(v)})});lockTimer=setInterval(function(){setY(v);if(v===0)nativeTop();if(Date.now()>=lockUntil){clearInterval(lockTimer);lockTimer=null;setY(v);if(v===0)nativeTop()}},40)}
function isHome(){return !!app.querySelector('.hero')}
function isDepth(){return !isHome()&&!!app.querySelector('.q,.stage,.intro,.premium-card,#qf,#cf,#jf,.question-queue-screen')}
function prepareRoomEntry(){if(isHome())homeY=currentY();pendingRoomUntil=Date.now()+2200;blurActive();lockAt(0,2200)}
document.addEventListener('pointerdown',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('[data-a="open-room"]');if(t)prepareRoomEntry()},true);
document.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest&&ev.target.closest('[data-a="open-room"]');if(t){pendingRoomUntil=Math.max(pendingRoomUntil,Date.now()+1800);blurActive();lockAt(0,1800)}},true);
window.addEventListener('scroll',function(){if(Date.now()<pendingRoomUntil&&currentY()>1){setY(0);nativeTop()}},{passive:true});
new MutationObserver(function(){if(Date.now()<pendingRoomUntil&&isDepth()){blurActive();lockAt(0,Math.max(500,pendingRoomUntil-Date.now()))}}).observe(app,{childList:true,subtree:true});
Object.defineProperty(app,'innerHTML',{configurable:true,enumerable:d.enumerable,get:function(){return d.get.call(app)},set:function(v){var beforeHome=isHome(),beforeDepth=isDepth();if(beforeHome)homeY=currentY();d.set.call(app,v);var afterHome=isHome(),afterDepth=isDepth();if((beforeHome&&afterDepth)||(Date.now()<pendingRoomUntil&&afterDepth)){pendingRoomUntil=Math.max(pendingRoomUntil,Date.now()+1500);blurActive();lockAt(0,Math.max(900,pendingRoomUntil-Date.now()))}else if(afterHome&&!beforeHome&&!beforeDepth){lockAt(homeY,280)}else if(afterHome&&!beforeHome){lockAt(homeY,280)}}});
})();