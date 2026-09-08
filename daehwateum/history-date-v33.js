(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
function lang(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0?'ko':'en'}
function parseSummary(summary){
  var raw=(summary&&summary.textContent||'').trim(),parts=raw.split(/\s+·\s+/);if(parts.length<3)return null;
  var dateToken=parts[1],custom=parts[parts.length-1]==='✎',question=parts.slice(2,custom?-1:parts.length).join(' · ').trim(),m=dateToken.match(/^(\d{1,2})\.(\d{1,2})$/);
  if(!m||!question)return null;
  return{key:String(parseInt(m[1],10))+'.'+String(parseInt(m[2],10)),month:parseInt(m[1],10),day:parseInt(m[2],10),question:question,custom:custom};
}
function dateLabel(month,day){
  if(lang()==='ko')return month+'월 '+day+'일';
  try{return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(new Date(2000,month-1,day))}catch(e){return month+'/'+day}
}
function makeSummary(summary,data){
  summary.textContent='';var q=document.createElement('span');q.className='hist-question';q.textContent=data.question;summary.appendChild(q);
  if(data.custom){var pen=document.createElement('span');pen.className='hist-custom';pen.textContent='✎';pen.setAttribute('aria-label',lang()==='ko'?'직접 만든 질문':'Custom question');summary.appendChild(pen)}
}
function groupHistory(hist){
  if(!hist||hist.dataset.dateGrouped==='1')return;var items=Array.prototype.slice.call(hist.querySelectorAll('details.item'));if(!items.length)return;
  var parsed=items.map(function(item){return{item:item,data:parseSummary(item.querySelector('summary'))}});if(parsed.some(function(x){return!x.data}))return;
  hist.dataset.dateGrouped='1';
  var title=hist.firstElementChild&&hist.firstElementChild.tagName==='H2'?hist.firstElementChild:null;if(title){var base=(title.firstChild&&title.firstChild.textContent||title.textContent||'').trim().replace(/\s+\d+\s*$/,'');title.textContent=base+' ';var total=document.createElement('small');total.className='hist-total';total.textContent=items.length+(lang()==='ko'?'개':'');title.appendChild(total)}
  var groups=[],byKey={};parsed.forEach(function(x){var d=x.data;if(!byKey[d.key]){byKey[d.key]={month:d.month,day:d.day,rows:[]};groups.push(byKey[d.key])}byKey[d.key].rows.push(x)});
  groups.forEach(function(group){var section=document.createElement('section');section.className='hist-day';var head=document.createElement('header');head.className='hist-day-head';var date=document.createElement('b');date.textContent=dateLabel(group.month,group.day);head.appendChild(date);if(group.rows.length>1){var count=document.createElement('small');count.textContent=group.rows.length+(lang()==='ko'?'개의 대화':' conversations');head.appendChild(count)}section.appendChild(head);group.rows.forEach(function(row){makeSummary(row.item.querySelector('summary'),row.data);section.appendChild(row.item)});hist.appendChild(section)});
}
function run(){Array.prototype.forEach.call(app.querySelectorAll('.hist'),groupHistory)}
var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;run()})}
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});run();
})();