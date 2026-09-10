(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,pending=false;
function copy(){return ko?{emptyTitle:'다음 질문을 남겨보세요',emptyDesc:'떠오른 질문을 미리 남겨두세요.',action:'질문 예약하기',reservedTitle:function(n){return '예약된 질문 '+n+'개'},reservedDesc:'다음 질문이 기다리고 있어요.',manage:'질문 더 예약하기'}:{emptyTitle:'Leave your next question',emptyDesc:'Save a question whenever it comes to mind.',action:'Reserve question',reservedTitle:function(n){return n+' reserved question'+(n===1?'':'s')},reservedDesc:'Your next question is waiting.',manage:'Reserve another question'}}
function removeDuplicate(app){var duplicate=app.querySelector('.premium-tools [data-a="custom"]');if(!duplicate)return;var grid=duplicate.closest('.feature-grid'),tools=grid&&grid.closest('.premium-tools');duplicate.remove();if(grid&&!grid.children.length&&tools)tools.remove()}
function countFromStatus(status){var m=String(status||'').match(/\d+/);return m?Number(m[0]):1}
function merge(){
  var app=document.getElementById('app');if(!app)return;
  var card=app.querySelector('.queue-summary-card');if(!card)return;
  removeDuplicate(app);
  var cc=copy(),intro=card.querySelector('.queue-summary-intro'),state=card.querySelector('[data-queue-summary-state],.queue-summary-state'),button=card.querySelector('[data-a="custom"]');
  if(!intro){intro=document.createElement('div');intro.className='queue-summary-intro';intro.innerHTML='<b class="queue-module-title"></b><p></p>';card.insertBefore(intro,card.firstChild)}
  var title=intro.querySelector('.queue-module-title')||intro.querySelector('b'),desc=intro.querySelector('p'),status='';
  if(state&&!state.hidden){var sb=state.querySelector('b');status=sb?String(sb.textContent||'').trim():''}
  var hasReserved=!!status&&status.replace(/\s+/g,'')!==' ',count=hasReserved?countFromStatus(status):0;
  var visualSig=(hasReserved?'reserved:':'empty:')+count;
  if(card.getAttribute('data-queue-visual')!==visualSig){
    if(title)title.textContent=hasReserved?cc.reservedTitle(count):cc.emptyTitle;
    if(desc)desc.textContent=hasReserved?cc.reservedDesc:cc.emptyDesc;
    card.classList.toggle('has-reserved-questions',hasReserved);
    if(button)button.textContent=hasReserved?cc.manage:cc.action;
    card.setAttribute('data-queue-visual',visualSig)
  }
  if(state){state.style.display='none';state.setAttribute('aria-hidden','true')}
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;merge()})}
function start(){var app=document.getElementById('app');if(!app)return;new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
