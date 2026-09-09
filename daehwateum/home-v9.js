(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false;
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function copy(premium,returning){
  if(ko){
    return{
      eyebrow:"QUESTIONS WE DON'T ALWAYS ASK",
      title:'오늘도,<br><em>대화할 틈.</em>',
      body:'평소엔 쉽게 묻지 못했던 것도, 여기선 조금 조심스럽게 꺼내봐요.',
      note:'서로를 조금 더 알아가는 질문을 시작해보세요.',
      cta:returning?'':'대화틈 만들기 →'
    };
  }
  return{
    eyebrow:"QUESTIONS WE DON'T ALWAYS ASK",
    title:'Make a little<br><em>space to talk.</em>',
    body:'For the things that are not always easy to ask, start here gently.',
    note:'Start a question that helps you know each other a little better.',
    cta:returning?'':'Create a conversation space →'
  };
}
function cleanPremiumNoise(premium){if(!premium)return;document.querySelectorAll('.spaces .premium-pill').forEach(function(el){el.remove()})}
function patchHome(){
  if(!window.DT)return;
  var hero=document.querySelector('.hero');
  if(!hero)return;
  var spaces=DT.spaces?DT.spaces():[],returning=!!(spaces&&spaces.length),premium=!!(DT.isPremium&&DT.isPremium()),c=copy(premium,returning);
  cleanPremiumNoise(premium);
  var sig=(premium?'p':'f')+':' + (returning?'r':'n')+':brand-copy-v39';
  if(hero.getAttribute('data-home-v9')===sig)return;
  hero.setAttribute('data-home-v9',sig);hero.classList.toggle('returning-home',returning);hero.classList.toggle('premium-home',premium);
  var inner=hero.firstElementChild||hero;
  var cta=(!returning&&c.cta)?'<button class="btn home-v9-cta" data-a="create">'+esc(c.cta)+'</button>':'';
  var eyebrow=c.eyebrow?'<span class="k">'+esc(c.eyebrow)+'</span>':'';
  inner.innerHTML=eyebrow+'<h1>'+c.title+'</h1><p class="home-v9-body">'+esc(c.body)+'</p><p class="home-v9-note">'+esc(c.note)+'</p>'+cta;
}
function schedule(){if(patching)return;patching=true;requestAnimationFrame(function(){patching=false;patchHome()})}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
