(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var homeY=0,returning=false,settleTimer=null;
function isHome(){return !!app.querySelector('.hero')}
function y(){
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
function settleHome(){
  if(!returning||!isHome())return;
  var target=homeY;
  setY(target);
  requestAnimationFrame(function(){if(returning&&isHome())setY(target)});
  if(settleTimer)clearTimeout(settleTimer);
  settleTimer=setTimeout(function(){if(returning&&isHome())setY(target);returning=false;settleTimer=null},120);
}
app.addEventListener('click',function(ev){
  var node=ev.target&&ev.target.closest&&ev.target.closest('[data-a]');if(!node)return;
  var action=node.getAttribute('data-a');
  if(action==='open-room'&&isHome()){
    homeY=y();
    returning=false;
    return;
  }
  if(action==='home'&&!isHome()){
    returning=true;
    setY(homeY);
  }
},true);
new MutationObserver(function(){if(returning&&isHome())settleHome()}).observe(app,{childList:true,subtree:false});
})();
