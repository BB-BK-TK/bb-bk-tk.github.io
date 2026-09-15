(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false;
function ko(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function sync(){queued=false;var hist=app.querySelector('.hist'),button=hist&&hist.querySelector('.hist-view-all');if(!button)return;if(button.hidden){button.hidden=false;button.textContent=ko()?'접기':'Collapse';button.setAttribute('aria-label',ko()?'지난 대화 접기':'Collapse past conversations');button.setAttribute('aria-expanded','true')}else if(button.textContent.trim()===(ko()?'전체 보기':'View all')){button.setAttribute('aria-expanded','false')}}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(sync)}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
schedule();
})();
