(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false,lastSnapshot=null;
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function hasAnswered(p){return !!(p&&(p.answered===true||(typeof p.answer==='string'&&p.answer.trim().length>0)))}
function answerStatus(x){
  if(!x||Number(x.participant_count||0)<2)return{label:null,arrived:false};
  if(x.can_start_next)return{label:ko?'새 질문 도착':'New question ready',arrived:true};
  var me=x.me||null;
  if(me&&!hasAnswered(me))return{label:ko?'새 질문 도착':'New question ready',arrived:true};
  var myName=me&&me.name?me.name:'',parts=Array.isArray(x.participants)?x.participants:[];
  var others=parts.filter(function(p){if(p.is_me)return false;if(myName&&p.name===myName)return false;return true});
  if(!others.length&&x.partner&&x.partner.name)others=[x.partner];
  if(!others.length)return{label:null,arrived:false};
  if(!x.unlocked){var waiting=others.filter(function(p){return !hasAnswered(p)});if(waiting.length){if(others.length===1){var name=others[0].name||(ko?'상대방':'Partner');return{label:ko?name+'님의 답을 기다리는 중':'Waiting for '+name+' to answer',arrived:false}}return{label:ko?'다른 사람의 답을 기다리는 중':'Waiting for others to answer',arrived:false}}}
  if(x.unlocked&&!(window.DT&&DT.revealed&&DT.revealed()))return{label:ko?'답변이 모두 도착했어요':'All answers are ready',arrived:true};
  if(x.is_paused)return{label:ko?'대화가 잠시 쉬고 있어요':'Conversation paused',arrived:false};
  if(x.free_period_ended&&x.is_premium)return{label:ko?'다음 질문을 기다리는 중':'Waiting for the next question',arrived:false};
  if(x.unlocked)return{label:ko?'답변이 모두 도착했어요':'All answers are ready',arrived:true};
  return{label:null,arrived:false}
}
function normalizeLegacy(s){if(!s||!s.isPremium||Number(s.lastRound||0)<=7)return false;var legacy=s.homeAnswerStatus==='7일 대화가 완료됐어요'||s.homeAnswerStatus==='Your 7-day conversation is complete';if(!legacy)return false;s.homeAnswerStatus=null;s.homeAnswerArrived=false;if(window.DT&&DT.saveSession)DT.saveSession(s);return true}
function pending(s){var names=Array.isArray(s&&s.memberNames)?s.memberNames.filter(Boolean):[];if(names.length)return names.length<2;return !(s&&s.partnerName)}
function signature(list){return list.map(function(s){var n=Array.isArray(s.memberNames)?s.memberNames.filter(Boolean).length:(s.partnerName?2:1);return s.room+':'+n+':'+(s.lastRound||1)+':'+(s.homeAnswerStatus||'')+':'+(s.homeAnswerArrived?'1':'0')}).join('|')}
function rememberCurrent(){if(!window.DT||!DT.state||!DT.session)return;var d=DT.state(),s=DT.session();if(!d||!s)return;lastSnapshot={state:d,session:s,room:s.room}}
function persistSnapshot(snapshot){if(!snapshot||!window.DT||!DT.saveSession)return false;var d=snapshot.state,s=snapshot.session;if(!d||!s)return false;var st=answerStatus(d),names=(d.participants||[]).map(function(p){return p.name}).filter(Boolean);s.memberNames=names.length?names:s.memberNames;s.partnerName=d.partner&&d.partner.name?d.partner.name:s.partnerName;s.lastRound=d.round_sequence||s.lastRound;s.targetParticipants=d.max_participants||s.targetParticipants;s.isPremium=!!d.is_premium;s.lastSeen=new Date().toISOString();s.homeAnswerStatus=st.label;s.homeAnswerArrived=st.arrived;s.homeAnswerRound=d.round_sequence||null;DT.saveSession(s);return true}
function captureCurrent(){rememberCurrent();if(lastSnapshot&&persistSnapshot(lastSnapshot))lastSnapshot=null}
function paint(card,s){if(!card)return;normalizeLegacy(s);var box=card.querySelector(':scope > div');if(!box)return;var day=box.querySelector(':scope > p:not(.space-answer-status)');if(day)day.textContent='DAY '+(s.lastRound||1);var old=box.querySelector('.space-answer-status');if(pending(s)||!s.homeAnswerStatus){if(old)old.remove();return}if(!old){old=document.createElement('p');box.appendChild(old)}old.className='space-answer-status '+(s.homeAnswerArrived?'arrived':'waiting');old.innerHTML='<span class="space-status-dot"></span>'+esc(s.homeAnswerStatus)}
function patchHome(){if(patching||!window.DT||!DT.spaces)return;var root=document.querySelector('.spaces');if(!root){rememberCurrent();return}if(lastSnapshot&&persistSnapshot(lastSnapshot))lastSnapshot=null;var list=DT.spaces().slice().reverse();list.forEach(normalizeLegacy);var sig=signature(list);if(root.getAttribute('data-status-stable-v28')===sig)return;patching=true;try{var cards={};root.querySelectorAll('.spacecard').forEach(function(card){var b=card.querySelector('[data-room]');if(b)cards[b.getAttribute('data-room')]=card});list.forEach(function(s){var card=cards[s.room];if(card)paint(card,s)});root.setAttribute('data-status-ready','1');root.setAttribute('data-space-status-v1',sig);root.setAttribute('data-status-stable-v28',sig)}finally{patching=false}}
function start(){var app=document.getElementById('app');if(!app)return;document.addEventListener('click',function(ev){var n=ev.target&&ev.target.closest&&ev.target.closest('[data-a="home"]');if(n)captureCurrent()},true);new MutationObserver(function(){patchHome()}).observe(app,{childList:true,subtree:true});rememberCurrent();patchHome()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();