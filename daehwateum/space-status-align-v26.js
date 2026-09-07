(function(){'use strict';
var SUPA='https://kacvynoegfpvgdpqtjdi.supabase.co',KEY='sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var syncing=false,cache={},paintTimer=null;
function hasAnswered(p){return !!(p&&(p.answered===true||(typeof p.answer==='string'&&p.answer.trim().length>0)))}
function statusFor(x){
  if(!x||Number(x.participant_count||0)<2)return{label:null,arrived:false};
  if(x.can_start_next)return{label:ko?'새 질문 도착':'New question ready',arrived:true};
  if(x.challenge_complete)return{label:ko?'7일 대화가 완료됐어요':'Your 7-day conversation is complete',arrived:true};
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
function findButton(root,room){
  var buttons=root.querySelectorAll('.spacecard [data-a="open-room"][data-room]');
  for(var i=0;i<buttons.length;i++)if(buttons[i].getAttribute('data-room')===String(room))return buttons[i];
  return null;
}
function paintOne(room,st){
  var root=document.querySelector('.spaces');if(!root||!st)return;
  var btn=findButton(root,room);if(!btn)return;
  var card=btn.closest('.spacecard');if(!card)return;
  var box=card.querySelector(':scope > div');if(!box)return;
  var el=card.querySelector('.space-answer-status');
  if(!st.label){if(el)el.remove();return}
  var key=st.label+'|'+(st.arrived?'1':'0');
  if(el&&el.getAttribute('data-status-key')===key)return;
  if(!el){el=document.createElement('p');el.className='space-answer-status';box.appendChild(el)}
  el.className='space-answer-status '+(st.arrived?'arrived':'waiting');
  el.setAttribute('data-status-key',key);
  el.innerHTML='<span class="space-status-dot"></span>'+(window.DT&&DT.esc?DT.esc(st.label):st.label)
}
function paint(){Object.keys(cache).forEach(function(room){paintOne(room,cache[room])})}
function fetchState(item){
  if(!item||!item.room||!item.token)return Promise.resolve(null);
  return fetch(SUPA+'/rest/v1/rpc/dt_get_state',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_room_id:item.room,p_participant_token:item.token})}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})
}
function sync(){
  if(syncing||!window.DT||!DT.spaces||!document.querySelector('.spaces')){paint();return}
  var list=DT.spaces();if(!list.length)return;syncing=true;
  Promise.all(list.map(function(item){return fetchState(item).then(function(x){if(x)cache[item.room]=statusFor(x)})})).then(paint).then(function(){syncing=false},function(){syncing=false})
}
function schedulePaint(){if(paintTimer)return;paintTimer=setTimeout(function(){paintTimer=null;paint()},80)}
function start(){
  var app=document.getElementById('app');if(app)new MutationObserver(schedulePaint).observe(app,{childList:true,subtree:true});
  setTimeout(sync,300);
  setInterval(function(){if(!document.hidden&&document.querySelector('.spaces'))sync()},15000)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(sync,150)});
})();