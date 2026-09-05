(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function text(D){
  var others=(D.participants||[]).filter(function(p){return !p.is_me}),arrived=others.filter(function(p){return !!p.answered});
  if(D.me&&D.me.answered)return null;
  if(!others.length)return null;
  if(others.length===1){
    var name=others[0].name||'';
    return arrived.length?(ko?name+'님의 답이 도착했어요':name+' has answered'):(ko?name+'님의 답을 기다리는 중':'Waiting for '+name+' to answer');
  }
  return arrived.length?(ko?arrived.length+'명의 답이 도착했어요':arrived.length+' answers have arrived'):(ko?'아직 다른 사람의 답을 기다리는 중':'Waiting for others to answer');
}
function patch(){
  if(!window.DT||!DT.state)return;var D=DT.state(),q=document.querySelector('#app .q');if(!D||!q||q.hasAttribute('hidden'))return;
  var old=q.querySelector('.answer-arrival'),msg=text(D);
  if(!msg){if(old)old.remove();return}
  if(!old){old=document.createElement('p');old.className='answer-arrival';q.appendChild(old)}
  var hasArrived=(D.participants||[]).some(function(p){return !p.is_me&&p.answered});
  old.classList.toggle('arrived',hasArrived);old.innerHTML='<span class="arrival-dot"></span>'+esc(msg);
}
function start(){var app=document.getElementById('app');if(!app)return;new MutationObserver(function(){setTimeout(patch,0)}).observe(app,{childList:true,subtree:true});patch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();