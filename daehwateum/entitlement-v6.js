(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,scheduled=false;
function patch(){
  if(!window.DT||!DT.isPremium)return;
  var premium=DT.isPremium(),top=document.querySelector('.top'),label=ko?'★ 내 Premium':'★ My Premium';
  var pill=top&&top.querySelector(':scope > .my-premium-pill');
  if(premium&&top){
    if(!pill){pill=document.createElement('span');pill.className='my-premium-pill';var dots=top.querySelector('.dots');if(dots)top.insertBefore(pill,dots);else top.appendChild(pill)}
    if(pill.textContent!==label)pill.textContent=label;
  }else if(pill){pill.remove()}
  var D=DT.state&&DT.state(),k=document.querySelector('.q .k');
  if(D&&k&&D.is_premium){var before=k.textContent||'',after=before.replace('★ PREMIUM',ko?'★ 방 PREMIUM':'★ ROOM PREMIUM');if(after!==before)k.textContent=after}
  if(premium&&D&&!D.is_premium&&D.me&&!D.me.is_creator){document.querySelectorAll('.premium-banner,.premium-tools').forEach(function(el){el.remove()})}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patch()})}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
