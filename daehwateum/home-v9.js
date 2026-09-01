(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false;
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function copy(premium,returning){
  if(ko){
    if(premium&&returning)return{eyebrow:'PREMIUM · ONGOING',title:'오늘도,<br><em>대화할 틈.</em>',body:'원하는 만큼, 우리 속도로 대화를 계속 이어가요.',note:'이어가고 싶은 대화틈을 열어보세요.'};
    if(premium)return{eyebrow:'PREMIUM · YOUR CONVERSATION SPACE',title:'우리 사이에,<br><em>계속 대화할 틈.</em>',body:'기간 제한 없이, 우리 속도로 대화를 이어가요.',note:'첫 대화틈을 만들어 시작해보세요.',cta:'첫 대화틈 만들기 →'};
    if(returning)return{eyebrow:'7 DAYS · YOUR CONVERSATION',title:'오늘도,<br><em>대화할 틈.</em>',body:'하루 한 질문. 같이 답하고, 같이 열어봐요.',note:'이어가고 싶은 대화틈을 열어보세요.'};
  }else{
    if(premium&&returning)return{eyebrow:'PREMIUM · ONGOING',title:'Make a little<br><em>space to talk.</em>',body:'Keep the conversation going at your own pace, for as long as you want.',note:'Open the space you want to continue.'};
    if(premium)return{eyebrow:'PREMIUM · YOUR CONVERSATION SPACE',title:'A space to<br><em>keep talking.</em>',body:'Keep the conversation going at your pace, with no time limit.',note:'Create your first space to begin.',cta:'Create my first space →'};
    if(returning)return{eyebrow:'7 DAYS · YOUR CONVERSATION',title:'Make a little<br><em>space to talk.</em>',body:'One question a day. Answer separately. Open together.',note:'Open the space you want to continue.'};
  }
  return null;
}
function patchHome(){
  if(!window.DT)return;
  var hero=document.querySelector('.hero');
  if(!hero)return;
  var spaces=DT.spaces?DT.spaces():[],returning=!!(spaces&&spaces.length),premium=!!(DT.isPremium&&DT.isPremium()),c=copy(premium,returning);
  if(!c){hero.classList.remove('returning-home','premium-home');hero.removeAttribute('data-home-v9');return}
  var sig=(premium?'p':'f')+':' + (returning?'r':'n');
  if(hero.getAttribute('data-home-v9')===sig)return;
  hero.setAttribute('data-home-v9',sig);hero.classList.toggle('returning-home',returning);hero.classList.toggle('premium-home',premium);
  var inner=hero.firstElementChild||hero;
  var cta=(!returning&&c.cta)?'<button class="btn home-v9-cta" data-a="create">'+esc(c.cta)+'</button>':'';
  inner.innerHTML='<span class="k">'+esc(c.eyebrow)+'</span><h1>'+c.title+'</h1><p class="home-v9-body">'+esc(c.body)+'</p><p class="home-v9-note">'+esc(c.note)+'</p>'+cta;
}
function schedule(){if(patching)return;patching=true;requestAnimationFrame(function(){patching=false;patchHome()})}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
