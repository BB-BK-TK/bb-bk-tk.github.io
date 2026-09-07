(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var mode=null;
function homeVisible(){return !!app.querySelector('.hero')}
function roomVisible(){return !homeVisible()&&!!app.querySelector('.q,.stage,.intro,.question-queue-screen')}
function currentY(){return Number(window.scrollY||window.pageYOffset||0)||0}
function setY(v){v=Math.max(0,Number(v)||0);var els=[document.scrollingElement,document.documentElement,document.body];els.forEach(function(el){try{if(el)el.scrollTop=v}catch(e){}});try{window.scrollTo(0,v)}catch(e){}}
function roomTop(){setY(0)}
function listTop(){var s=app.querySelector('.spaces');if(!s){setY(0);return}var top=0;try{top=s.getBoundingClientRect().top+currentY()}catch(e){top=s.offsetTop||0}setY(Math.max(0,top-12))}
app.addEventListener('click',function(ev){var node=ev.target&&ev.target.closest&&ev.target.closest('[data-a]');if(!node)return;var action=node.getAttribute('data-a');if(action==='open-room'&&homeVisible()){mode='enter-room';return}if(action==='home'&&!homeVisible()){mode='return-home'}},true);
new MutationObserver(function(){if(mode==='enter-room'&&roomVisible()){roomTop();mode=null;return}if(mode==='return-home'&&homeVisible()){listTop();mode=null}}).observe(app,{childList:true,subtree:false});
})();
