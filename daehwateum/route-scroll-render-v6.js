(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML')||Object.getOwnPropertyDescriptor(HTMLElement.prototype,'innerHTML');
if(!d||!d.get||!d.set)return;
var pendingRoom=false,homeY=0,hasHomeY=false,restoreTimer=null;
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function currentY(){var s=document.scrollingElement||document.documentElement||document.body;return (s&&s.scrollTop)||window.pageYOffset||0}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function setY(v){
  try{window.scrollTo({left:0,top:v,behavior:'auto'})}catch(e){try{window.scrollTo(0,v)}catch(_e){}}
  [document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)el.scrollTop=v}catch(e){}});
}
function roomVisible(){return !!app.querySelector('.q,.stage')&&!app.querySelector('.hero')}
function homeVisible(){return !!app.querySelector('.hero')}
function resetRoomTop(){
  var html=document.documentElement,body=document.body,oldHtmlAnchor=html&&html.style?html.style.overflowAnchor:'',oldBodyAnchor=body&&body.style?body.style.overflowAnchor:'';
  try{if(html)html.style.overflowAnchor='none';if(body)body.style.overflowAnchor='none'}catch(e){}
  setY(0);nativeTop();
  try{var top=app.querySelector('.top');if(top&&top.scrollIntoView)top.scrollIntoView({block:'start',inline:'nearest',behavior:'auto'})}catch(e){}
  requestAnimationFrame(function(){setY(0);nativeTop()});
  [60,160,280].forEach(function(delay){setTimeout(function(){if(roomVisible()){setY(0);nativeTop()}},delay)});
  setTimeout(function(){try{if(html)html.style.overflowAnchor=oldHtmlAnchor;if(body)body.style.overflowAnchor=oldBodyAnchor}catch(e){}},360);
}
function restoreHome(){
  if(!hasHomeY)return;
  if(restoreTimer)clearTimeout(restoreTimer);
  setY(homeY);
  requestAnimationFrame(function(){setY(homeY)});
  restoreTimer=setTimeout(function(){if(homeVisible())setY(homeY)},80);
}
document.addEventListener('click',function(ev){
  var t=ev.target&&ev.target.closest&&ev.target.closest('[data-a="open-room"]');
  if(!t||!homeVisible())return;
  homeY=currentY();hasHomeY=true;pendingRoom=true;
},true);
Object.defineProperty(app,'innerHTML',{
  configurable:true,enumerable:d.enumerable,get:function(){return d.get.call(app)},set:function(v){
    var beforeHome=homeVisible(),beforeRoom=roomVisible();
    d.set.call(app,v);
    var afterHome=homeVisible(),afterRoom=roomVisible();
    if(pendingRoom&&afterRoom){pendingRoom=false;resetRoomTop();return}
    if(afterHome&&!beforeHome&&beforeRoom){restoreHome()}
  }
});
})();
