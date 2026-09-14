(function(){'use strict';
var KO=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,scheduled=false;
function patch(){scheduled=false;var m=document.getElementById('settings-popover');if(!m||m.querySelector('[data-identity-continuity]'))return;var b=document.createElement('button');b.type='button';b.setAttribute('data-identity-continuity','1');b.textContent=KO?'다른 브라우저에서 이어쓰기':'Continue in another browser';var recovery=m.querySelector('[data-recovery-settings]'),info=m.querySelector('[data-settings-app-info]'),danger=m.querySelector('.danger-menu');m.insertBefore(b,recovery||info||danger||null)}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(patch)}
function start(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
