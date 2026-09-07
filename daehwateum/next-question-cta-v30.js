(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,queued=false;
function decorate(){
  document.querySelectorAll('button[data-a="next"]').forEach(function(btn){
    if(/TEST NEXT/i.test(btn.textContent||''))return;
    btn.classList.remove('outline');
    btn.classList.add('next-question-primary');
    if(btn.closest('.next-gate,.premium-continuation-gate'))return;
    var prev=btn.previousElementSibling;
    if(prev&&prev.classList.contains('next-question-prompt'))return;
    var prompt=document.createElement('div');
    prompt.className='next-question-prompt';
    prompt.innerHTML='<span>'+(ko?'다음 질문이 준비됐어요':'NEXT QUESTION READY')+'</span><strong>'+(ko?'다음 질문을 열어볼까요?':'Ready to open the next question?')+'</strong>';
    btn.insertAdjacentElement('beforebegin',prompt);
  });
  document.querySelectorAll('.next-question-prompt').forEach(function(prompt){
    var next=prompt.nextElementSibling;
    if(!next||!next.matches('button[data-a="next"]'))prompt.remove();
  });
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;decorate()})}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});decorate()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
