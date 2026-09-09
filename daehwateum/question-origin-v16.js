(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
function originText(){return ko?'이번 질문은 누군가가 직접 남긴 질문이에요.':'Someone in this room left this question.'}
function patch(){
  var d=window.DT&&DT.state&&DT.state();
  var q=document.querySelector('#app .q');
  if(!q)return;
  var old=q.querySelector('.question-origin');
  if(!d||d.question_source!=='custom'||q.hasAttribute('hidden')){if(old)old.remove();return;}
  if(old)return;
  var el=document.createElement('p');
  el.className='question-origin';
  el.textContent=originText();
  var h=q.querySelector('h1');
  if(h)q.insertBefore(el,h);else q.appendChild(el);
}
function start(){
  var app=document.getElementById('app');
  if(!app)return;
  new MutationObserver(patch).observe(app,{subtree:true,childList:true});
  patch();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
