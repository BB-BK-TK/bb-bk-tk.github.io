(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false,syncing=false,syncPromise=null,lastSync=0,scheduled=false;
var SUPA='https://kacvynoegfpvgdpqtjdi.supabase.co',KEY='sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6';
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function copy(){return ko?{active:'내 대화틈',waiting:'초대 대기 중',waitingBody:'상대방이 들어오면 대화가 시작돼요.',waitingState:'아직 시작 전 · 상대방 참여 대기',invite:'초대하기',newSpace:'새로운 대화틈 만들기'}:{active:'My spaces',waiting:'Waiting for someone to join',waitingBody:'The conversation starts when someone joins your invitation.',waitingState:'Not started · Waiting for someone to join',invite:'Invite',newSpace:'Create another space'}}
function pending(s){var names=Array.isArray(s&&s.memberNames)?s.memberNames.filter(Boolean):[];if(names.length)return names.length<2;return !(s&&s.partnerName)}
function signature(list){return list.map(function(s){var n=Array.isArray(s.memberNames)?s.memberNames.filter(Boolean).length:(s.partnerName?2:1);return s.room+':'+n+':'+(s.lastRound||1)+':'+(s.homeAnswerStatus||'')+':'+(s.homeAnswerArrived?'1':'0')}).join('|')}
function hasAnswered(p){return !!(p&&(p.answered===true||(typeof p.answer==='string'&&p.answer.trim().length>0)))}
function answerStatus(x){
  if(!x||Number(x.participant_count||0)<2)return{label:null,arrived:false};
  if(x.can_start_next)return{label:ko?'새 질문 도착':'New question ready',arrived:true};
  var seq=Number(x.round_sequence||0),limit=Number(x.round_limit||7);
  if(x.challenge_complete&&x.is_premium&&seq<=limit)return{label:ko?'다음 질문을 기다리는 중':'Waiting for the next question',arrived:false};
  if(x.challenge_complete&&!x.is_premium)return{label:ko?'7일 대화가 완료됐어요':'Your 7-day conversation is complete',arrived:true};
  var me=x.me||null;
  if(me&&!hasAnswered(me))return{label:ko?'새 질문 도착':'New question ready',arrived:true};
  var myName=me&&me.name?me.name:'',parts=Array.isArray(x.participants)?x.participants:[];
  var others=parts.filter(function(p){if(p.is_me)return false;if(myName&&p.name===myName)return false;return true});
  if(!others.length&&x.partner&&x.partner.name)others=[x.partner];
  if(!others.length)return{label:null,arrived:false};
  if(x.unlocked)return{label:ko?'답변이 모두 도착했어요':'All answers are ready',arrived:true};
  var waiting=others.filter(function(p){return !hasAnswered(p)});
  if(waiting.length){
    if(others.length===1){var name=others[0].name||(ko?'상대방':'Partner');return{label:ko?name+'님의 답을 기다리는 중':'Waiting for '+name+' to answer',arrived:false}}
    return{label:ko?'다른 사람의 답을 기다리는 중':'Waiting for others to answer',arrived:false}
  }
  return{label:ko?'답변이 모두 도착했어요':'All answers are ready',arrived:true}
}
function normalizeLegacy(s){
  if(!s||!s.isPremium||Number(s.lastRound||0)<=7)return false;
  var legacy=s.homeAnswerStatus==='7일 대화가 완료됐어요'||s.homeAnswerStatus==='Your 7-day conversation is complete';
  if(!legacy)return false;
  s.homeAnswerStatus=null;s.homeAnswerArrived=false;return true
}
function persist(list){try{var r=JSON.parse(localStorage.getItem('dt.spaces.v1')||'{}');if(!r||!Array.isArray(r.spaces))return;r.spaces=r.spaces.map(function(old){var fresh=null;for(var i=0;i<list.length;i++)if(list[i].room===old.room){fresh=list[i];break}return fresh?Object.assign({},old,{memberNames:fresh.memberNames,partnerName:fresh.partnerName,lastRound:fresh.lastRound,targetParticipants:fresh.targetParticipants,isPremium:fresh.isPremium,lastSeen:fresh.lastSeen,homeAnswerStatus:fresh.homeAnswerStatus||null,homeAnswerArrived:!!fresh.homeAnswerArrived,homeAnswerRound:fresh.homeAnswerRound||null}):old});localStorage.setItem('dt.spaces.v1',JSON.stringify(r))}catch(e){}}
function fetchState(s){if(!s||!s.room||!s.token)return Promise.resolve(null);return fetch(SUPA+'/rest/v1/rpc/dt_get_state',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_room_id:s.room,p_participant_token:s.token})}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}
function syncStatuses(force){
  if(!window.DT||!DT.spaces)return Promise.resolve(false);var now=Date.now();if(!force&&now-lastSync<15000)return Promise.resolve(false);if(syncing&&syncPromise)return syncPromise;
  var list=DT.spaces();if(!list.length)return Promise.resolve(false);syncing=true;lastSync=now;
  syncPromise=Promise.all(list.map(fetchState)).then(function(states){var changed=false;states.forEach(function(x,i){if(!x)return;var s=list[i],names=(x.participants||[]).map(function(p){return p.name}).filter(Boolean),before=Array.isArray(s.memberNames)?s.memberNames.length:(s.partnerName?2:1),prevStatus=s.homeAnswerStatus||null,prevArrived=!!s.homeAnswerArrived,status=answerStatus(x);s.memberNames=names;s.partnerName=x.partner&&x.partner.name?x.partner.name:s.partnerName;s.lastRound=x.round_sequence||s.lastRound;s.targetParticipants=x.max_participants||s.targetParticipants;s.isPremium=!!x.is_premium;s.lastSeen=new Date().toISOString();s.homeAnswerStatus=status.label;s.homeAnswerArrived=status.arrived;s.homeAnswerRound=x.round_sequence||null;if(before!==names.length||prevStatus!==s.homeAnswerStatus||prevArrived!==s.homeAnswerArrived)changed=true});persist(list);return changed}).catch(function(){return false}).then(function(changed){syncing=false;syncPromise=null;return changed},function(){syncing=false;syncPromise=null;return false});
  return syncPromise
}
function paintAnswer(card,s){if(!card)return;normalizeLegacy(s);var old=card.querySelector('.space-answer-status');if(old)old.remove();var day=card.querySelector('div>p');if(day)day.textContent='DAY '+(s.lastRound||1);if(!s.homeAnswerStatus||pending(s))return;var el=document.createElement('p');el.className='space-answer-status '+(s.homeAnswerArrived?'arrived':'waiting');el.innerHTML='<span class="space-status-dot"></span>'+esc(s.homeAnswerStatus);var box=card.querySelector(':scope > div');if(box)box.appendChild(el)}
function patch(){if(patching||!window.DT||!DT.spaces)return;var root=document.querySelector('.spaces');if(!root||root.getAttribute('data-status-ready')!=='1')return;var list=DT.spaces().slice().reverse();list.forEach(normalizeLegacy);var sig=signature(list);if(root.getAttribute('data-space-status-v1')===sig)return;patching=true;requestAnimationFrame(function(){if(!document.documentElement.contains(root)){patching=false;return}var c=copy(),cards={};root.querySelectorAll('.spacecard').forEach(function(card){var b=card.querySelector('[data-room]');if(b)cards[b.getAttribute('data-room')]=card});var active=[],waiting=[];list.forEach(function(s){var card=cards[s.room];if(!card)return;(pending(s)?waiting:active).push({space:s,card:card})});root.innerHTML='';root.setAttribute('data-space-status-v1',sig);if(active.length){var ah=document.createElement('h2');ah.textContent=c.active;root.appendChild(ah);active.forEach(function(x){x.card.classList.remove('pending-spacecard');paintAnswer(x.card,x.space);root.appendChild(x.card)})}if(waiting.length){var group=document.createElement('section');group.className='spaces-awaiting';group.innerHTML='<div class="spaces-awaiting-head"><h2>'+esc(c.waiting)+'</h2><p>'+esc(c.waitingBody)+'</p></div>';waiting.forEach(function(x){var card=x.card;card.classList.add('pending-spacecard');var old=card.querySelector('.space-answer-status');if(old)old.remove();var p=card.querySelector('div>p');if(p)p.textContent=c.waitingState;var btn=card.querySelector('[data-a="open-room"]');if(btn)btn.textContent=c.invite;group.appendChild(card)});root.appendChild(group)}var footer=document.createElement('p');footer.className='c';footer.innerHTML='<button class="text" data-a="new">'+esc(c.newSpace)+'</button>';root.appendChild(footer);patching=false})}
function prime(){scheduled=false;var root=document.querySelector('.spaces');if(!root||!window.DT||!DT.spaces)return;var list=DT.spaces(),normalized=false;list.forEach(function(s){if(normalizeLegacy(s))normalized=true});if(normalized)persist(list);var fresh=root.getAttribute('data-status-ready')!=='1';if(fresh){root.setAttribute('data-status-ready','1');root.removeAttribute('data-space-status-v1')}patch();if(root.getAttribute('data-status-loading')==='1')return;root.setAttribute('data-status-loading','1');syncStatuses(fresh||normalized).then(function(changed){if(!document.documentElement.contains(root))return;root.removeAttribute('data-status-loading');if(changed||normalized){root.removeAttribute('data-space-status-v1');patch()}})}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(prime,0)}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule();setInterval(function(){if(!document.hidden&&document.querySelector('.spaces'))prime()},15000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();document.addEventListener('visibilitychange',function(){if(!document.hidden){lastSync=0;schedule()}});
})();