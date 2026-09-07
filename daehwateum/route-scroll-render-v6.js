(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function setTop(){
  try{window.scrollTo({left:0,top:0,behavior:'auto'})}catch(e){try{window.scrollTo(0,0)}catch(_e){}}
  [document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)el.scrollTop=0}catch(e){}});
  nativeTop();
}
function homeVisible(){return !!app.querySelector('.hero')}
function roomVisible(){return !homeVisible()&&!!app.querySelector('.q,.stage')}
var wasHome=homeVisible();
new MutationObserver(function(){
  var nowHome=homeVisible(),nowRoom=roomVisible();
  if(wasHome&&nowRoom){
    try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}catch(e){}
    setTop();
    requestAnimationFrame(setTop);
    setTimeout(function(){if(roomVisible())setTop()},90);
  }
  wasHome=nowHome;
}).observe(app,{childList:true,subtree:false});
})();