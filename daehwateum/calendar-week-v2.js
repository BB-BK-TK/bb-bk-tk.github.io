(function(){'use strict';
var patching=false;
function dayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function dayKey(d){return window.DT&&DT.dayKey?DT.dayKey(d):(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))}
function parse(v){var d=window.DT&&DT.dateObj?DT.dateObj(v):(v?new Date(v):null);return d&&!isNaN(d.getTime())?dayStart(d):null}
function conversationStart(D){
  var candidates=[];
  var round=parse(D&&D.round_created_at);
  if(round){
    if(!D.is_premium){var seq=Math.max(1,parseInt(D.round_sequence||1,10));round.setDate(round.getDate()-(seq-1))}
    candidates.push(round);
  }
  (D&&D.history||[]).forEach(function(x){var d=parse(x.completed_at);if(d)candidates.push(d)});
  return candidates.length?new Date(Math.min.apply(null,candidates.map(function(d){return d.getTime()}))):dayStart(new Date());
}
function render(){
  if(patching||!window.DT||!DT.state)return;
  var grid=document.querySelector('.cal .weekgrid');if(!grid)return;
  var D=DT.state();if(!D||D.participant_count<2)return;
  var start=conversationStart(D),today=dayStart(new Date()),elapsed=Math.max(0,Math.floor((today-start)/86400000)),block=Math.floor(elapsed/7),st=new Date(start);st.setDate(start.getDate()+block*7);
  var done={};(D.history||[]).forEach(function(x){var d=parse(x.completed_at);if(d)done[dayKey(d)]=1});
  var labels=(document.documentElement.lang||'ko').toLowerCase().indexOf('ko')===0?['일','월','화','수','목','금','토']:['S','M','T','W','T','F','S'];
  var html='',count=0;
  for(var i=0;i<7;i++){
    var d=new Date(st);d.setDate(st.getDate()+i);
    var k=dayKey(d),isDone=!!done[k],isToday=k===dayKey(today),future=d>today;
    if(isDone)count++;
    html+='<span class="day '+(isDone?'done ':'')+(isToday?'today ':'')+(future?'future ':'')+'"><small>'+labels[d.getDay()]+'</small><b>'+d.getDate()+'</b><i>✓</i></span>';
  }
  var sig=dayKey(st)+'|'+Object.keys(done).sort().join(',')+'|'+dayKey(today);
  if(grid.getAttribute('data-conversation-week')===sig)return;
  patching=true;grid.innerHTML=html;grid.setAttribute('data-conversation-week',sig);
  var meta=document.querySelector('.cal .calmeta');if(meta)meta.textContent=count+(D.is_premium?'':' / 7');
  var cal=document.querySelector('.cal');if(cal)cal.classList.add('conversation-week');
  patching=false;
}
function schedule(){requestAnimationFrame(render)}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();