(function(){'use strict';
/* Compatibility bridge for older modules that still read navigator.language.
   The app locale defaults to Korean from <html lang="ko"> and can be explicitly
   switched with ?lang=en. Keep every module on that single locale. */
var params;try{params=new URLSearchParams(location.search)}catch(e){params=null}
var requested=((params&&params.get('lang'))||document.documentElement.getAttribute('lang')||'ko').toLowerCase();
var lang=requested.indexOf('en')===0?'en':'ko';
var browserLocale=lang==='ko'?'ko-KR':'en-US';
document.documentElement.lang=lang;
window.DaehwateumLocale={lang:lang,isKorean:lang==='ko'};
function forceNavigatorLocale(prop,value){
  try{Object.defineProperty(navigator,prop,{configurable:true,get:function(){return value}})}catch(e){}
  try{
    var current=navigator[prop],matches=prop==='language'?current===value:(current&&current[0]===value);
    if(!matches&&typeof Navigator!=='undefined'&&Navigator.prototype){
      Object.defineProperty(Navigator.prototype,prop,{configurable:true,get:function(){return value}})
    }
  }catch(e){}
}
forceNavigatorLocale('language',browserLocale);
forceNavigatorLocale('languages',[browserLocale]);

/* Editorial eyebrow labels in older screens were written directly in English.
   Product names such as Premium/Beta stay as product names; ordinary UI copy
   follows the active locale. */
var eyebrowKo={
  'OUR ANSWERS':'우리의 답',
  'RECOVERY':'대화 복구',
  'INVITATION':'초대',
  'REFLECTION':'회고',
  'A SMALL SPACE BETWEEN US':'우리 사이의 작은 틈',
  'PREMIUM · PRIVATE QUEUE':'PREMIUM · 비공개 질문'
};
var actionKo={
  'Reserve a question you want to ask':'물어보고 싶은 질문을 예약해보세요',
  'Reserve a question':'질문 예약하기',
  'Reserve question':'질문 예약하기',
  'Reserve another question':'질문 더 예약하기',
  'Leave your next question':'다음 질문을 남겨보세요',
  'Leave a question for later.':'떠오른 질문을 미리 남겨두세요.'
};
function exactText(el,map){
  if(!el||!map)return;
  var s=String(el.textContent||'').replace(/\s+/g,' ').trim();
  if(Object.prototype.hasOwnProperty.call(map,s))el.textContent=map[s]
}
function replaceTextNodes(root,map){
  if(!root||!map||!document.createTreeWalker)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),node;
  while((node=walker.nextNode())){
    var raw=node.nodeValue||'',trim=raw.replace(/\s+/g,' ').trim();
    if(!Object.prototype.hasOwnProperty.call(map,trim))continue;
    var left=(raw.match(/^\s*/)||[''])[0],right=(raw.match(/\s*$/)||[''])[0];
    node.nodeValue=left+map[trim]+right
  }
}
function patch(){
  if(lang!=='ko')return;
  document.querySelectorAll('.k').forEach(function(el){
    var s=String(el.textContent||'').replace(/\s+/g,' ').trim();
    if(s==='OUR RHYTHM'){
      if(!el.hidden){el.hidden=true;el.setAttribute('aria-hidden','true')}
      return
    }
    exactText(el,eyebrowKo)
  });
  document.querySelectorAll('button,a,.queue-module-title').forEach(function(el){replaceTextNodes(el,actionKo)})
}
var queued=false;
function schedule(){
  if(queued)return;queued=true;
  requestAnimationFrame(function(){queued=false;patch()})
}
function start(){
  patch();
  var target=document.getElementById('app')||document.body;if(!target)return;
  new MutationObserver(schedule).observe(target,{childList:true,subtree:true,characterData:true})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
