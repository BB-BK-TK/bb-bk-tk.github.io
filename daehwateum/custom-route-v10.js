(function(){'use strict';
var busy=false,ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
function state(){return window.DT&&DT.state&&DT.state()}
function isPremiumRoom(){var d=state();return !!(d&&(d.is_premium||Number(d.question_interval_hours)===3||Number(d.max_participants)>2))}
function openQueue(){if(busy||!isPremiumRoom()||!window.DT||typeof DT.openQuestionQueue!=='function')return false;busy=true;try{DT.openQuestionQueue();setTimeout(function(){busy=false},250);return true}catch(e){busy=false;return false}}
function isLegacyBlock(){var app=document.getElementById('app');if(!app||app.querySelector('.question-queue-screen'))return false;var card=app.querySelector('.card.intro');if(!card)return false;var h=card.querySelector('h1'),p=card.querySelector('p');var ht=(h&&h.textContent||'').trim(),pt=(p&&p.textContent||'').trim();var title=ko?ht.indexOf('질문 예약')>=0:(/reserve|question/i).test(ht);var wait=ko?pt.indexOf('3시간')>=0:(/3\s*hours?|every 3/i).test(pt);return title&&wait}
document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-a="custom"]');if(!b||!isPremiumRoom())return;if(window.DT&&typeof DT.openQuestionQueue==='function'){ev.preventDefault();ev.stopImmediatePropagation();openQueue()}},true);
function patch(){if(isLegacyBlock())openQueue()}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(function(){setTimeout(patch,0)}).observe(app,{childList:true,subtree:true});patch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
