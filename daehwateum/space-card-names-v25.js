(function(){'use strict';
var scheduled=false;
function namesFor(s){var names=Array.isArray(s&&s.memberNames)?s.memberNames.filter(Boolean):[];if(!names.length)names=[s&&s.name,s&&s.partnerName].filter(Boolean);return names.join(' × ')}
function patch(){scheduled=false;if(!window.DT||!DT.spaces)return;var map={};DT.spaces().forEach(function(s){if(s&&s.room)map[s.room]=s});document.querySelectorAll('.spacecard [data-room]').forEach(function(btn){var s=map[btn.getAttribute('data-room')],card=btn.closest('.spacecard');if(!s||!card)return;var title=card.querySelector('div>h3'),names=namesFor(s);if(title&&names&&title.textContent!==names)title.textContent=names})}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(patch)}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule();setTimeout(schedule,800);setTimeout(schedule,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule()});
})();