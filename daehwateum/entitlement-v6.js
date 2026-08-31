(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
function patch(){if(!window.DT||!DT.isPremium)return;var premium=DT.isPremium(),top=document.querySelector('.top');document.querySelectorAll('.my-premium-pill').forEach(function(x){x.remove()});if(premium&&top){var dots=top.querySelector('.dots'),pill=document.createElement('span');pill.className='my-premium-pill';pill.textContent=ko?'★ 내 Premium':'★ My Premium';if(dots)top.insertBefore(pill,dots);else top.appendChild(pill)}var D=DT.state&&DT.state(),k=document.querySelector('.q .k');if(D&&k&&D.is_premium){k.textContent=k.textContent.replace('★ PREMIUM',ko?'★ 방 PREMIUM':'★ ROOM PREMIUM')}if(premium&&D&&!D.is_premium&&D.me&&!D.me.is_creator){document.querySelectorAll('.premium-banner,.premium-tools').forEach(function(el){el.remove()})}}
function start(){new MutationObserver(function(){requestAnimationFrame(patch)}).observe(document.getElementById('app'),{childList:true,subtree:true});patch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
