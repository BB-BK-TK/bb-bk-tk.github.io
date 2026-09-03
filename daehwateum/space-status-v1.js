(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false,syncing=false,lastSync=0;
var SUPA='https://kacvynoegfpvgdpqtjdi.supabase.co',KEY='sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6';
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function copy(){return ko?{active:'내 대화틈',waiting:'초대 대기 중',waitingBody:'상대방이 들어오면 대화가 시작돼요.',waitingState:'아직 시작 전 · 상대방 참여 대기',invite:'초대하기',newSpace:'새로운 대화틈 만들기'}:{active:'My spaces',waiting:'Waiting for someone to join',waitingBody:'The conversation starts when someone joins your invitation.',waitingState:'Not started · Waiting for someone to join',invite:'Invite',newSpace:'Create another space'}}
function pending(s){var names=Array.isArray(s&&s.memberNames)?s.memberNames.filter(Boolean):[];if(names.length)return names.length<2;return !(s&&s.partnerName)}
function signature(list){return list.map(function(s){var n=Array.isArray(s.memberNames)?s.memberNames.filter(Boolean).length:(s.partnerName?2:1);return s.room+':'+n}).join('|')}
function persist(list){try{var r=JSON.parse(localStorage.getItem('dt.spaces.v1')||'{}');if(!r||!Array.isArray(r.spaces))return;r.spaces=r.spaces.map(function(old){var fresh=list.find(function(s){return s.room===old.room});return fresh?Object.assign({},old,{memberNames:fresh.memberNames,partnerName:fresh.partnerName,lastRound:fresh.lastRound,targetParticipants:fresh.targetParticipants,isPremium:fresh.isPremium,lastSeen:fresh.lastSeen}):old});localStorage.setItem('dt.spaces.v1',JSON.stringify(r))}catch(e){}}
function syncStatuses(force){
  if(syncing||!window.DT||!DT.spaces)return;var now=Date.now();if(!force&&now-lastSync<15000)return;
  var list=DT.spaces();if(!list.length)return;syncing=true;lastSync=now;
  Promise.all(list.map(function(s){if(!s.room||!s.token)return Promise.resolve(null);return fetch(SUPA+'/rest/v1/rpc/dt_get_state',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_room_id:s.room,p_participant_token:s.token})}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})})).then(function(states){
    var changed=false;states.forEach(function(x,i){if(!x)return;var s=list[i],names=(x.participants||[]).map(function(p){return p.name}).filter(Boolean),before=Array.isArray(s.memberNames)?s.memberNames.length:(s.partnerName?2:1);s.memberNames=names;s.partnerName=x.partner&&x.partner.name?x.partner.name:s.partnerName;s.lastRound=x.round_sequence||s.lastRound;s.targetParticipants=x.max_participants||s.targetParticipants;s.isPremium=!!x.is_premium;s.lastSeen=new Date().toISOString();if(before!==names.length)changed=true});persist(list);syncing=false;if(changed){var root=document.querySelector('.spaces');if(root)root.removeAttribute('data-space-status-v1');patch()}}).catch(function(){syncing=false})
}
function patch(){
  if(patching||!window.DT||!DT.spaces)return;var root=document.querySelector('.spaces');if(!root)return;
  var list=DT.spaces().slice().reverse(),sig=signature(list);if(root.getAttribute('data-space-status-v1')===sig)return;patching=true;
  requestAnimationFrame(function(){var c=copy(),cards={};root.querySelectorAll('.spacecard').forEach(function(card){var b=card.querySelector('[data-room]');if(b)cards[b.getAttribute('data-room')]=card});var active=[],waiting=[];list.forEach(function(s){var card=cards[s.room];if(!card)return;(pending(s)?waiting:active).push({space:s,card:card})});root.innerHTML='';root.setAttribute('data-space-status-v1',sig);
    if(active.length){var ah=document.createElement('h2');ah.textContent=c.active;root.appendChild(ah);active.forEach(function(x){x.card.classList.remove('pending-spacecard');root.appendChild(x.card)})}
    if(waiting.length){var group=document.createElement('section');group.className='spaces-awaiting';group.innerHTML='<div class="spaces-awaiting-head"><h2>'+esc(c.waiting)+'</h2><p>'+esc(c.waitingBody)+'</p></div>';waiting.forEach(function(x){var card=x.card;card.classList.add('pending-spacecard');var p=card.querySelector('p');if(p)p.textContent=c.waitingState;var btn=card.querySelector('[data-a="open-room"]');if(btn)btn.textContent=c.invite;group.appendChild(card)});root.appendChild(group)}
    var footer=document.createElement('p');footer.className='c';footer.innerHTML='<button class="text" data-a="new">'+esc(c.newSpace)+'</button>';root.appendChild(footer);patching=false})
}
function schedule(){if(patching)return;patch();syncStatuses(false)}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule();syncStatuses(true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
document.addEventListener('visibilitychange',function(){if(!document.hidden)syncStatuses(true)});
})();