(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML')||Object.getOwnPropertyDescriptor(HTMLElement.prototype,'innerHTML');
if(!d||!d.get||!d.set)return;
var homeY=0,lockTimer=null,lockUntil=0,nativeTimer=null;
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function currentY(){var s=document.scrollingElement||document.documentElement||document.body;return (s&&s.scrollTop)||window.pageYOffset||0}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function setY(v){try{window.scrollTo(0,v)}catch(e){}var s=document.scrollingElement;if(s)s.scrollTop=v;if(document.documentElement)document.documentElement.scrollTop=v;if(document.body)document.body.scrollTop=v;try{app.scrollTop=0}catch(e){}}
function lockAt(v,ms){if(lockTimer){clearInterval(lockTimer);lockTimer=null}if(nativeTimer){clearTimeout(nativeTimer);nativeTimer=null}lockUntil=Date.now()+(ms||700);setY(v);if(v===0){nativeTop();nativeTimer=setTimeout(nativeTop,180)}requestAnimationFrame(function(){setY(v);requestAnimationFrame(function(){setY(v)})});setTimeout(function(){setY(v)},0);setTimeout(function(){setY(v)},40);setTimeout(function(){setY(v)},120);setTimeout(function(){setY(v)},280);lockTimer=setInterval(function(){setY(v);if(Date.now()>=lockUntil){clearInterval(lockTimer);lockTimer=null;setY(v);if(v===0)nativeTop()}},16)}
function isHome(){return !!app.querySelector('.hero')}
function isDepth(){return !isHome()&&!!app.querySelector('.q,.stage,.intro,.premium-card,#qf,#cf,#jf,.question-queue-screen')}
Object.defineProperty(app,'innerHTML',{configurable:true,enumerable:d.enumerable,get:function(){return d.get.call(app)},set:function(v){var beforeHome=isHome();if(beforeHome)homeY=currentY();d.set.call(app,v);var afterHome=isHome();if(isDepth()){try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}catch(e){}lockAt(0,1100)}else if(afterHome&&!beforeHome){lockAt(homeY,280)}}});
})();