(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
function patch(){
  var menu=document.getElementById('settings-popover');
  if(!menu||menu.querySelector('[data-subscription-management]'))return;
  var btn=document.createElement('button');
  btn.type='button';
  btn.setAttribute('data-subscription-management','1');
  btn.textContent=ko?'구독 관리 · 취소':'Manage · cancel subscription';
  var danger=menu.querySelector('.danger-menu');
  menu.insertBefore(btn,danger||null);
}
document.addEventListener('click',function(e){
  var btn=e.target.closest&&e.target.closest('[data-subscription-management]');
  if(!btn)return;
  e.preventDefault();
  e.stopPropagation();
  location.href='./subscription/';
},true);
function start(){
  new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});
  patch();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
