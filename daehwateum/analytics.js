(function(){'use strict';
function dayKey(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function trackDailyOpen(){if(!window.DT||!DT.session())return;var s=DT.session(),k='dt.daily_open.'+s.room+'.'+dayKey();if(localStorage.getItem(k))return;localStorage.setItem(k,'1');DT.log('daily_open',{day:dayKey(),round:s.lastRound||null,entry:location.search.indexOf('invite=')>=0?'invite':'direct'}).catch(function(){localStorage.removeItem(k)})}
function ready(){setTimeout(trackDailyOpen,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
document.addEventListener('visibilitychange',function(){if(!document.hidden)trackDailyOpen()});
})();
