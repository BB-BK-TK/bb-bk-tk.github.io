(function(){'use strict';
var SUPA='https://kacvynoegfpvgdpqtjdi.supabase.co',KEY='sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,cache={},timer=null,fetching=false,paintQueued=false;
function esc(v){return window.DT&&DT.esc?DT.esc(v):String(v==null?'':v)}
function spaces(){return window.DT&&DT.spaces?DT.spaces():[]}
function statusFrom(x){
  if(!x||Number(x.participant_count||0)<2)return null;
  var parts=Array.isArray(x.participants)?x.participants:[],me=x.me||parts.find(function(p){return !!p.is_me})||null,myName=me&&me.name?me.name:'';
  var myAnswered=me&&typeof me.answered!=='undefined'?!!me.answered:parts.some(function(p){return !!p.is_me&&!!p.answered});
  if(myAnswered)return null;
  var others=parts.filter(function(p){if(p&&p.is_me)return false;if(myName&&p&&p.name===myName)return false;return !!p});
  if(!others.length)return null;
  var arrived=others.filter(function(p){return !!p.answered});
  if(others.length===1){var name=others[0].name||'';return{arrived:!!arrived.length,text:arrived.length?(ko?name+'님의 답이 도착했어요':name+' has answered'):(ko?name+'님의 답을 기다리는 중':'Waiting for '+name+' to answer')}}
  return{arrived:!!arrived.length,text:arrived.length?(ko?arrived.length+'명의 답이 도착했어요':arrived.length+' answers have arrived'):(ko?'다른 사람의 답을 기다리는 중':'Waiting for others to answer')}
}
function cardFor(room){var buttons=document.querySelectorAll('.spaces .spacecard [data-room]');for(var i=0;i<buttons.length;i++)if(buttons[i].getAttribute('data-room')===room)return buttons[i].closest('.spacecard');return null}
function paint(){paintQueued=false;var list=spaces();if(!document.querySelector('.spaces'))return;list.forEach(function(s){var card=cardFor(s.room);if(!card)return;var old=card.querySelector('.home-answer-status');if(old)old.remove();if(card.classList.contains('pending-spacecard'))return;var st=cache[s.room];if(!st||!st.text)return;var left=card.querySelector(':scope > div');if(!left)return;var el=document.createElement('div');el.className='home-answer-status '+(st.arrived?'arrived':'waiting');el.innerHTML='<span class="home-answer-dot"></span><span>'+esc(st.text)+'</span>';left.appendChild(el)})}
function queuePaint(){if(paintQueued)return;paintQueued=true;requestAnimationFrame(paint)}
function fetchState(s){if(!s||!s.room||!s.token)return Promise.resolve();return fetch(SUPA+'/rest/v1/rpc/dt_get_state',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_room_id:s.room,p_participant_token:s.token})}).then(function(r){return r.ok?r.json():null}).then(function(x){cache[s.room]=statusFrom(x);return x}).catch(function(){})}
function sync(){if(fetching||document.hidden||!document.querySelector('.spaces'))return;var list=spaces();if(!list.length)return;fetching=true;Promise.all(list.map(fetchState)).then(function(){fetching=false;queuePaint()}).catch(function(){fetching=false})}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(queuePaint).observe(app,{childList:true,subtree:true});queuePaint();sync();timer=setInterval(sync,4000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
document.addEventListener('visibilitychange',function(){if(!document.hidden){queuePaint();sync()}});
})();