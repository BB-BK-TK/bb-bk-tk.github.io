(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false,released=false;
var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;

function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function initial(v){return window.DT&&DT.initial?DT.initial(v):String(v||'?').trim().charAt(0)}
function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function avatar(p){var photo=p&&(p.avatar_url||p.photo_url||p.image_url);return '<span class="relationship-avatar-v47">'+(photo?'<img src="'+esc(photo)+'" alt="">':esc(initial(p&&p.name)))+'</span>'}
function names(d){return (Array.isArray(d&&d.participants)?d.participants:[]).slice(0,3).map(function(p){return p&&p.name}).filter(Boolean).join(' · ')}

function compactRelationship(){
  if(!document.body.classList.contains('visual-room-v43'))return;
  var d=state(),w=app.querySelector(':scope > .w'),hero=w&&w.querySelector(':scope > .relationship-hero-v43');
  if(!d||!hero)return;
  var ps=Array.isArray(d.participants)?d.participants.slice(0,2):[];
  var sig=ps.map(function(p){return[p&&p.name,p&&(p.avatar_url||p.photo_url||p.image_url)||''].join(':')}).join('|');
  if(hero.classList.contains('relationship-compact-v47')&&hero.getAttribute('data-v47-people')===sig)return;
  hero.classList.add('relationship-compact-v47');hero.setAttribute('data-v47-people',sig);
  hero.innerHTML='<button type="button" class="relationship-compact-button-v47" aria-label="'+(ko?'함께하는 사람 보기':'View people')+'"><span class="relationship-people-v47">'+ps.map(avatar).join('')+'</span><span class="relationship-compact-copy-v47"><b>'+esc(names(d))+'</b><small>'+(ko?'지금, 더 가까워지는 대화':'A conversation that brings us closer')+'</small></span><i aria-hidden="true">›</i></button>';
}

function releaseWhenReady(){
  if(released)return;
  var body=document.body,w=app.querySelector(':scope > .w');if(!body||!w)return;
  var room=body.classList.contains('visual-room-v43');
  var home=body.classList.contains('visual-home-v44');
  var queue=body.classList.contains('visual-queue-v44');
  var form=body.classList.contains('visual-form-v44');
  var ready=false;
  if(room)ready=!!w.querySelector(':scope > .relationship-hero-v43.relationship-compact-v47');
  else if(home){var cards=[].slice.call(w.querySelectorAll('.spacecard'));ready=!cards.length||cards.every(function(c){return c.getAttribute('data-v44-home-card')==='1'})}
  else if(queue||form)ready=true;
  else ready=!!w.querySelector(':scope > :not(.top)');
  if(!ready)return;
  requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.remove('app-boot-pending');document.documentElement.classList.add('app-boot-ready');released=true})});
}

function patch(){queued=false;compactRelationship();releaseWhenReady()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(patch)}

app.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.relationship-compact-button-v47');if(!b)return;var original=app.querySelector('.top .people[data-people-manage],.top .people');if(original&&typeof original.click==='function')original.click()},true);
new MutationObserver(schedule).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
setInterval(schedule,30000);schedule();
setTimeout(function(){if(!released){document.documentElement.classList.remove('app-boot-pending');document.documentElement.classList.add('app-boot-ready');released=true}},1400);
})();
