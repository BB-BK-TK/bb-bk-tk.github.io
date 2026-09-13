(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var queued=false;
function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function completedCount(d){return d&&Array.isArray(d.history)?d.history.length:0}
function growthStage(n){if(n<=3)return 1;if(n<=7)return 2;if(n<=20)return 3;if(n<=50)return 4;return 5}
function growthMarkup(){
  return '<div class="rhythm-growth-v50" aria-hidden="true">'+
    '<i class="v50-tree t1"></i><i class="v50-tree t2"></i><i class="v50-tree t3"></i><i class="v50-tree t4"></i><i class="v50-tree t5"></i><i class="v50-tree t6"></i>'+
    '<i class="v50-bush b1"></i><i class="v50-bush b2"></i><i class="v50-bush b3"></i><i class="v50-bush b4"></i>'+
    '<i class="v50-bloom f1"></i><i class="v50-bloom f2"></i><i class="v50-bloom f3"></i><i class="v50-bloom f4"></i><i class="v50-bloom f5"></i>'+
  '</div>'
}
function syncToggle(cal){
  var top=cal.querySelector('.caltop'),toggle=top&&top.querySelector(':scope > div:first-child');if(!top||!toggle)return;
  var open=cal.classList.contains('rhythm-expanded-v43');
  toggle.setAttribute('data-rhythm-toggle-v50','1');
  toggle.setAttribute('role','button');
  toggle.setAttribute('tabindex','0');
  toggle.setAttribute('aria-expanded',open?'true':'false');
  toggle.setAttribute('aria-label',open?(ko?'대화 리듬 접기':'Collapse conversation rhythm'):(ko?'대화 리듬 펼치기':'Expand conversation rhythm'));
  cal.setAttribute('aria-expanded',open?'true':'false');
  if(open){cal.removeAttribute('role');cal.removeAttribute('tabindex')}else{cal.setAttribute('role','button');cal.setAttribute('tabindex','0')}
}
function decorate(){
  queued=false;
  if(!document.body.classList.contains('visual-room-v43'))return;
  var cal=app.querySelector('.cal'),d=state();if(!cal||!d)return;
  var art=cal.querySelector('.rhythm-art-v43');if(!art){setTimeout(schedule,30);return}
  var count=completedCount(d),stage=growthStage(count);
  cal.setAttribute('data-rhythm-count',String(count));
  cal.setAttribute('data-rhythm-growth',String(stage));
  art.setAttribute('data-rhythm-growth',String(stage));
  if(!art.querySelector('.rhythm-growth-v50'))art.insertAdjacentHTML('beforeend',growthMarkup());
  syncToggle(cal);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(decorate)}
function setExpanded(cal,open){
  cal.classList.toggle('rhythm-expanded-v43',open);
  syncToggle(cal);
  try{if(window.DT&&typeof DT.log==='function')DT.log(open?'rhythm_expand':'rhythm_collapse',{completed:parseInt(cal.getAttribute('data-rhythm-count')||'0',10)})}catch(e){}
}

document.addEventListener('click',function(e){
  var toggle=e.target.closest&&e.target.closest('.visual-room-v43 .cal [data-rhythm-toggle-v50]');if(!toggle)return;
  var cal=toggle.closest('.cal');if(!cal)return;
  e.preventDefault();e.stopPropagation();
  setExpanded(cal,!cal.classList.contains('rhythm-expanded-v43'));
},true);

document.addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' ')return;
  var toggle=e.target.closest&&e.target.closest('.visual-room-v43 .cal [data-rhythm-toggle-v50]');if(!toggle)return;
  var cal=toggle.closest('.cal');if(!cal)return;
  e.preventDefault();e.stopPropagation();
  setExpanded(cal,!cal.classList.contains('rhythm-expanded-v43'));
},true);

new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
app.addEventListener('click',function(e){var cal=e.target.closest&&e.target.closest('.cal');if(cal)setTimeout(function(){syncToggle(cal)},0)},false);
schedule();setTimeout(schedule,100);setTimeout(schedule,500);
})();
