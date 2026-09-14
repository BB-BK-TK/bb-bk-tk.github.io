(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false;

function patchReadyNext(){
  var sections=app.querySelectorAll('.post-reveal-current');
  sections.forEach(function(sec){
    var btn=sec.querySelector(':scope > button[data-a="next"]');
    if(!btn){
      var wrapped=sec.querySelector(':scope > .next-gate.v51-ready-gate button[data-a="next"]');
      if(wrapped)return;
      btn=sec.querySelector('button[data-a="next"]');
      if(!btn||btn.closest('.next-gate,.premium-continuation-gate'))return;
    }

    var oldPrompt=sec.querySelector(':scope > .next-question-prompt');
    if(oldPrompt)oldPrompt.remove();
    var prev=btn.previousElementSibling;
    if(prev&&prev.classList&&prev.classList.contains('next-question-prompt'))prev.remove();

    var gate=btn.closest('.next-gate');
    if(!gate){
      gate=document.createElement('section');
      gate.className='next-gate v51-ready-gate';
      btn.insertAdjacentElement('beforebegin',gate);
      gate.appendChild(btn);
    }else{
      gate.classList.add('v51-ready-gate');
    }

    var summary=sec.querySelector(':scope > .post-reveal-summary');
    if(summary&&summary.nextElementSibling!==gate)summary.insertAdjacentElement('afterend',gate);
  });
}

function cleanDetachedPrompts(){
  app.querySelectorAll('.post-reveal-current > .next-question-prompt').forEach(function(el){el.remove()});
}

function patch(){patchReadyNext();cleanDetachedPrompts()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;patch()})}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
patch();
})();
