(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var reserve=null,anchor=null,restoreTimers=[];
function historyRoot(){var roots=app.querySelectorAll('.hist');for(var i=0;i<roots.length;i++)if(roots[i].querySelector('.hist-day'))return roots[i];return null}
function scrollY(){return window.scrollY||window.pageYOffset||document.documentElement.scrollTop||0}
function viewportH(){return window.innerHeight||document.documentElement.clientHeight||700}
function pageHeight(){return Math.max(document.documentElement.scrollHeight||0,document.body?document.body.scrollHeight:0)}
function ensureReserve(){if(reserve&&document.body.contains(reserve))return reserve;reserve=document.createElement('div');reserve.id='rhythm-history-scroll-reserve';reserve.setAttribute('aria-hidden','true');reserve.style.cssText='height:0;min-height:0;width:1px;pointer-events:none;visibility:hidden;';document.body.appendChild(reserve);return reserve}
function clearTimers(){restoreTimers.forEach(function(id){clearTimeout(id)});restoreTimers=[]}
function beginAnchor(){var hist=historyRoot();if(!hist)return;clearTimers();var spacer=ensureReserve(),rect=hist.getBoundingClientRect(),currentReserve=spacer.offsetHeight||0;anchor={hist:hist,top:rect.top,y:scrollY(),vh:viewportH()};var natural=Math.max(0,pageHeight()-currentReserve),safety=Math.max(hist.scrollHeight||0,anchor.vh);spacer.style.height=Math.max(currentReserve,safety,Math.ceil(anchor.y+anchor.vh+2-natural))+'px'}
function restoreAnchor(){if(!anchor||!anchor.hist||!document.documentElement.contains(anchor.hist))return;var spacer=ensureReserve(),hist=anchor.hist,currentY=scrollY(),currentTop=hist.getBoundingClientRect().top,desired=Math.max(0,currentY+(currentTop-anchor.top)),currentReserve=spacer.offsetHeight||0,natural=Math.max(0,pageHeight()-currentReserve),needed=Math.max(0,Math.ceil(desired+anchor.vh+2-natural));spacer.style.height=needed+'px';try{window.scrollTo({top:desired,left:0,behavior:'auto'})}catch(e){window.scrollTo(0,desired)}}
function settle(){restoreAnchor();restoreTimers.push(setTimeout(restoreAnchor,36));restoreTimers.push(setTimeout(restoreAnchor,90));restoreTimers.push(setTimeout(function(){restoreAnchor();anchor=null},170))}
function isDateTarget(target){return target&&target.closest&&target.closest('.cal .rhythm-history-day[data-rhythm-date]')}
function isAllTarget(target){return target&&target.closest&&target.closest('.hist-view-all')}
function scheduleSettle(){setTimeout(function(){requestAnimationFrame(settle)},0)}
document.addEventListener('click',function(e){if(!isDateTarget(e.target)&&!isAllTarget(e.target))return;beginAnchor();scheduleSettle()},true);
document.addEventListener('keydown',function(e){if((e.key!=='Enter'&&e.key!==' ')||!isDateTarget(e.target))return;beginAnchor();scheduleSettle()},true);
})();
