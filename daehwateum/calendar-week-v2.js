(function(){'use strict';
var patching=false;
function dayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function dayKey(d){return window.DT&&DT.dayKey?DT.dayKey(d):(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))}
function parse(v){var d=window.DT&&DT.dateObj?DT.dateObj(v):(v?new Date(v):null);return d&&!isNaN(d.getTime())?dayStart(d):null}
function conversationStart(D){
  var candidates=[];
  var round=parse(D&&D.round_created_at);
  if(round){
    var seq=Math.max(1,parseInt(D.round_sequence||1,10));
    round.setDate(round.getDate()-(seq-1));
    candidates.push(round);
  }
  (D&&D.history||[]).forEach(function(x){var d=parse(x.completed_at);if(d)candidates.push(d)});
  return candidates.length?new Date(Math.min.apply(null,candidates.map(function(d){return d.getTime()}))):dayStart(new Date());
}
function mondayOf(d){var x=new Date(d),dow=x.getDay();x.setDate(x.getDate()+(dow===0?-6:1-dow));return x}
function displayWeek(D,start,today){
  var seq=Math.max(1,parseInt(D&&D.round_sequence||1,10));
  var elapsed=Math.max(0,Math.floor((today-start)/86400000));
  var firstPeriodDone=seq>7||elapsed>=7||(D&&D.free_period_ended===true);

  // Premium rooms still follow the same first-week UX: start-aware for the
  // first seven days, then a familiar Monday-Sunday calendar week. Do not let
  // free_period_ended=false pull an established Premium room back to a rolling
  // seven-day window when switching month -> week.
  if(D&&D.is_premium){
    return firstPeriodDone?{start:mondayOf(today),mode:'calendar-week'}:{start:new Date(start),mode:'first-seven'};
  }

  if(D&&D.free_period_ended===false){
    var freeDay=Math.max(1,Math.min(7,parseInt(D.free_day||1,10)||1)),first=new Date(today);
    first.setDate(first.getDate()-(freeDay-1));
    return {start:first,mode:'first-seven'};
  }
  if(D&&D.free_period_ended===true)return {start:mondayOf(today),mode:'calendar-week'};
  return elapsed<7?{start:new Date(start),mode:'first-seven'}:{start:mondayOf(today),mode:'calendar-week'};
}
function render(){
  if(patching||!window.DT||!DT.state)return;
  var grid=document.querySelector('.cal .weekgrid');if(!grid)return;
  var D=DT.state();if(!D||D.participant_count<2)return;
  var start=conversationStart(D),today=dayStart(new Date()),week=displayWeek(D,start,today),st=week.start;
  var done={};(D.history||[]).forEach(function(x){var d=parse(x.completed_at);if(d)done[dayKey(d)]=1});
  var labels=(document.documentElement.lang||'ko').toLowerCase().indexOf('ko')===0?['일','월','화','수','목','금','토']:['S','M','T','W','T','F','S'];
  var html='',count=0;
  for(var i=0;i<7;i++){
    var d=new Date(st);d.setDate(st.getDate()+i);
    var k=dayKey(d),isDone=!!done[k],isToday=k===dayKey(today),future=d>today;
    if(isDone)count++;
    html+='<span class="day '+(isDone?'done ':'')+(isToday?'today ':'')+(future?'future ':'')+'"><small>'+labels[d.getDay()]+'</small><b>'+d.getDate()+'</b><i>✓</i></span>';
  }
  var sig=week.mode+'|'+dayKey(st)+'|'+Object.keys(done).sort().join(',')+'|'+dayKey(today);
  if(grid.getAttribute('data-conversation-week')===sig)return;
  patching=true;grid.innerHTML=html;grid.setAttribute('data-conversation-week',sig);grid.setAttribute('data-week-mode',week.mode);
  var meta=document.querySelector('.cal .calmeta');if(meta)meta.textContent=count+(D.is_premium?'':' / 7');
  var cal=document.querySelector('.cal');if(cal)cal.classList.add('conversation-week');
  patching=false;
}
function schedule(){requestAnimationFrame(render)}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
