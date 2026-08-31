(function(){'use strict';
var syncing=false,patched=false;
function lang(){return (navigator.language||'ko').toLowerCase().indexOf('ko')===0?'ko':'en'}
function copy(){return lang()==='ko'?{
  bannerTitle:'조금 더 자유롭게 대화해볼까요?',
  bannerBody:'직접 질문하고, 최대 5명과 더 많은 대화틈을 만들 수 있어요.',
  bannerCta:'Premium 보기',
  premiumWait:'다음 질문은 조금 뒤 열려요.'
}:{
  bannerTitle:'Want a little more freedom?',
  bannerBody:'Ask your own questions, invite up to 5 people, and create more spaces.',
  bannerCta:'See Premium',
  premiumWait:'Your next question opens a little later.'
}}
function syncPremiumAcrossRooms(){
  if(syncing||!window.DT||!DT.state||!DT.isPremium)return;
  var d=DT.state();
  if(!d||!DT.isPremium()||!d.me||!d.me.is_creator||d.is_premium)return;
  syncing=true;
  DT.enablePremium().then(function(){setTimeout(function(){location.reload()},80)}).catch(function(){syncing=false});
}
function compactPremium(){
  if(!window.DT||!DT.state)return;
  var d=DT.state(),c=copy();
  document.querySelectorAll('.next-gate h2').forEach(function(el){if(d&&d.is_premium)el.textContent=c.premiumWait});
  document.querySelectorAll('.premium-tools').forEach(function(el){
    if(d&&d.is_premium){el.remove();return}
    if(d&&d.me&&!d.me.is_creator){el.remove();return}
    if(el.classList.contains('premium-banner'))return;
    el.className='card premium-banner';
    el.innerHTML='<div class="premium-banner-copy"><span class="k">PREMIUM</span><b>'+c.bannerTitle+'</b><small>'+c.bannerBody+'</small></div><button class="btn" data-a="premium" data-feature="bundle">'+c.bannerCta+'</button>';
  });
}
function patch(){if(patched)return;patched=true;requestAnimationFrame(function(){patched=false;syncPremiumAcrossRooms();compactPremium()})}
var observer=new MutationObserver(patch);
function start(){var app=document.getElementById('app')||document.body;observer.observe(app,{subtree:true,childList:true});patch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
document.addEventListener('visibilitychange',function(){if(!document.hidden)patch()});
})();
