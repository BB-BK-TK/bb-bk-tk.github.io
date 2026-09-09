(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var queued=false;
function reduced(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function dayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function dayKey(d){return window.DT&&DT.dayKey?DT.dayKey(d):(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))}
function parse(v){var d=window.DT&&DT.dateObj?DT.dateObj(v):(v?new Date(v):null);return d&&!isNaN(d.getTime())?dayStart(d):null}
function visibleHistory(D){
  var rev=true;try{rev=!window.DT||typeof DT.revealed!=='function'||DT.revealed()}catch(e){}
  return (D&&D.history||[]).filter(function(x){return x.round_id!==D.round_id||rev});
}
function historyKeys(D){
  var seen={},out=[];visibleHistory(D).forEach(function(x){var d=parse(x.completed_at);if(!d)return;var k=dayKey(d);if(!seen[k]){seen[k]=1;out.push(k)}});return out;
}
function historySet(D){var s={};historyKeys(D).forEach(function(k){s[k]=1});return s}
function conversationStart(D){
  var candidates=[],round=parse(D&&D.round_created_at);
  if(round){var seq=Math.max(1,parseInt(D.round_sequence||1,10));round.setDate(round.getDate()-(seq-1));candidates.push(round)}
  (D&&D.history||[]).forEach(function(x){var d=parse(x.completed_at);if(d)candidates.push(d)});
  return candidates.length?new Date(Math.min.apply(null,candidates.map(function(d){return d.getTime()}))):dayStart(new Date());
}
function mondayOf(d){var x=new Date(d),dow=x.getDay();x.setDate(x.getDate()+(dow===0?-6:1-dow));return x}
function displayWeek(D,start,today){
  var seq=Math.max(1,parseInt(D&&D.round_sequence||1,10)),elapsed=Math.max(0,Math.floor((today-start)/86400000)),firstPeriodDone=seq>7||elapsed>=7||(D&&D.free_period_ended===true);
  if(D&&D.is_premium)return firstPeriodDone?mondayOf(today):new Date(start);
  if(D&&D.free_period_ended===false){var freeDay=Math.max(1,Math.min(7,parseInt(D.free_day||1,10)||1)),first=new Date(today);first.setDate(first.getDate()-(freeDay-1));return first}
  if(D&&D.free_period_ended===true)return mondayOf(today);
  return elapsed<7?new Date(start):mondayOf(today);
}
function ariaLabel(d){
  var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;
  if(ko)return (d.getMonth()+1)+'월 '+d.getDate()+'일 대화 보기';
  try{return 'View conversations from '+new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(d)}catch(e){return 'View conversations from '+(d.getMonth()+1)+'/'+d.getDate()}
}
function clearDay(el){el.classList.remove('rhythm-history-day');el.removeAttribute('data-rhythm-date');el.removeAttribute('role');el.removeAttribute('tabindex');el.removeAttribute('aria-label')}
function markDay(el,d,clickable){clearDay(el);if(!clickable)return;el.classList.add('rhythm-history-day');el.setAttribute('data-rhythm-date',dayKey(d));el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',ariaLabel(d))}
function annotateHistory(D){
  var keys=historyKeys(D),sections=Array.prototype.slice.call(app.querySelectorAll('.hist .hist-day'));
  sections.forEach(function(section,i){section.removeAttribute('data-history-day-key');if(keys[i])section.setAttribute('data-history-day-key',keys[i])});
}
function annotateCalendar(D){
  var set=historySet(D),today=dayStart(new Date()),week=app.querySelector('.cal .weekgrid'),month=app.querySelector('.cal .monthgrid');
  if(week){
    var start=displayWeek(D,conversationStart(D),today),days=Array.prototype.slice.call(week.querySelectorAll('.day'));
    days.forEach(function(el,i){var d=new Date(start);d.setDate(start.getDate()+i);markDay(el,d,el.classList.contains('done')&&!!set[dayKey(d)])});
  }
  if(month){
    var now=new Date(),days2=Array.prototype.slice.call(month.querySelectorAll('.day'));
    days2.forEach(function(el){var b=el.querySelector('b'),n=b?parseInt(b.textContent,10):NaN;if(!b||isNaN(n)){clearDay(el);return}var d=new Date(now.getFullYear(),now.getMonth(),n);markDay(el,d,el.classList.contains('done')&&!!set[dayKey(d)])});
  }
}
function decorate(){if(!window.DT||typeof DT.state!=='function')return;var D=DT.state();if(!D)return;annotateHistory(D);annotateCalendar(D)}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;decorate()})}
function sectionFor(key){var sections=app.querySelectorAll('.hist .hist-day');for(var i=0;i<sections.length;i++)if(sections[i].getAttribute('data-history-day-key')===key)return sections[i];return null}
function jump(key){
  decorate();var section=sectionFor(key);if(!section){setTimeout(function(){decorate();var s=sectionFor(key);if(s)jumpTo(s,key)},60);return}jumpTo(section,key);
}
function jumpTo(section,key){
  var hist=section.closest('.hist'),more=hist&&hist.querySelector('.hist-more');
  if((section.classList.contains('hist-day-hidden')||section.querySelector('.hist-hidden'))&&more&&more.getAttribute('aria-expanded')!=='true')more.click();
  section.classList.remove('hist-day-hidden');Array.prototype.forEach.call(section.querySelectorAll('.hist-hidden'),function(x){x.classList.remove('hist-hidden')});
  requestAnimationFrame(function(){setTimeout(function(){section.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});section.classList.add('rhythm-history-target');setTimeout(function(){section.classList.remove('rhythm-history-target')},900)},24)});
  try{if(window.DT&&typeof DT.log==='function')DT.log('rhythm_history_jump',{date:key,view:app.querySelector('.cal .monthgrid')?'month':'week'})}catch(e){}
}
app.addEventListener('click',function(e){var day=e.target.closest&&e.target.closest('.cal .rhythm-history-day[data-rhythm-date]');if(!day)return;e.preventDefault();jump(day.getAttribute('data-rhythm-date'))});
app.addEventListener('keydown',function(e){var day=e.target.closest&&e.target.closest('.cal .rhythm-history-day[data-rhythm-date]');if(!day||(e.key!=='Enter'&&e.key!==' '))return;e.preventDefault();jump(day.getAttribute('data-rhythm-date'))});
var style=document.createElement('style');style.id='rhythm-history-v39-style';style.textContent='.cal .rhythm-history-day{cursor:pointer;touch-action:manipulation;transition:transform .12s ease}.cal .rhythm-history-day:active{transform:scale(.96)}.cal .rhythm-history-day:focus-visible{outline:2px solid var(--i);outline-offset:3px}.hist-day{scroll-margin-top:24px}.hist-day.rhythm-history-target .hist-day-head{animation:rhythmHistoryTarget .8s ease}@keyframes rhythmHistoryTarget{0%,100%{transform:translateX(0)}35%{transform:translateX(4px)}}';document.head.appendChild(style);
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule();
})();
