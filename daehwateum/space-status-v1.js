(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false;
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function copy(){return ko?{active:'내 대화틈',waiting:'초대 대기 중',waitingBody:'상대방이 들어오면 대화가 시작돼요.',waitingState:'아직 시작 전 · 상대방 참여 대기',invite:'초대하기',newSpace:'새로운 대화틈 만들기'}:{active:'My spaces',waiting:'Waiting for someone to join',waitingBody:'The conversation starts when someone joins your invitation.',waitingState:'Not started · Waiting for someone to join',invite:'Invite',newSpace:'Create another space'}}
function pending(s){
  var names=Array.isArray(s&&s.memberNames)?s.memberNames.filter(Boolean):[];
  if(names.length)return names.length<2;
  return !(s&&s.partnerName);
}
function signature(list){return list.map(function(s){var n=Array.isArray(s.memberNames)?s.memberNames.filter(Boolean).length:(s.partnerName?2:1);return s.room+':'+n}).join('|')}
function patch(){
  if(patching||!window.DT||!DT.spaces)return;
  var root=document.querySelector('.spaces');if(!root)return;
  var list=DT.spaces().slice().reverse(),sig=signature(list);
  if(root.getAttribute('data-space-status-v1')===sig)return;
  patching=true;
  requestAnimationFrame(function(){
    var c=copy(),cards={};
    root.querySelectorAll('.spacecard').forEach(function(card){var b=card.querySelector('[data-room]');if(b)cards[b.getAttribute('data-room')]=card});
    var active=[],waiting=[];
    list.forEach(function(s){var card=cards[s.room];if(!card)return;(pending(s)?waiting:active).push({space:s,card:card})});
    root.innerHTML='';root.setAttribute('data-space-status-v1',sig);
    if(active.length){
      var ah=document.createElement('h2');ah.textContent=c.active;root.appendChild(ah);
      active.forEach(function(x){x.card.classList.remove('pending-spacecard');root.appendChild(x.card)});
    }
    if(waiting.length){
      var group=document.createElement('section');group.className='spaces-awaiting';
      group.innerHTML='<div class="spaces-awaiting-head"><h2>'+esc(c.waiting)+'</h2><p>'+esc(c.waitingBody)+'</p></div>';
      waiting.forEach(function(x){
        var card=x.card;card.classList.add('pending-spacecard');
        var p=card.querySelector('p');if(p)p.textContent=c.waitingState;
        var btn=card.querySelector('[data-a="open-room"]');if(btn)btn.textContent=c.invite;
        group.appendChild(card);
      });
      root.appendChild(group);
    }
    var footer=document.createElement('p');footer.className='c';footer.innerHTML='<button class="text" data-a="new">'+esc(c.newSpace)+'</button>';root.appendChild(footer);
    patching=false;
  })
}
function schedule(){if(patching)return;patch()}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();