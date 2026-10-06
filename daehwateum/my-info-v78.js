(function(){'use strict';
if(!window.DT||DT.__myInfoV78)return;DT.__myInfoV78=true;
var SUPA='https://kacvynoegfpvgdpqtjdi.supabase.co',KEY='sb_publishable_SeG92zfrAeh5zECaVbztkw_qb0C91D6';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var sockets={},syncing={},ref=0,previousNames={};
function text(k,e){return ko?k:e}
function rpc(fn,p){return fetch(SUPA+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(p)}).then(function(r){return r.json().then(function(x){if(!r.ok)throw Error(x&&x.message||text('저장하지 못했어요. 다시 시도해 주세요.','Could not save. Please try again.'));return x})})}
function persist(){try{var s=DT.session();localStorage.setItem('dt.spaces.v1',JSON.stringify({active:s&&s.room||null,spaces:DT.spaces()}));if(s)localStorage.setItem('dt.active.v3',JSON.stringify(s))}catch(e){}}
function nameMap(x){var names={};function add(p){if(!p)return;var id=p.id||p.participant_id;if(id)names[id]=p.name}
  (x.participants||[]).forEach(add);add(x.me);add(x.owner);
  (x.history||[]).forEach(function(h){(h.answers||[]).forEach(add)});
  ((x.reflection||{}).participants||[]).forEach(add);
  var w=x.weekly_reflection||{};[w.latest].concat(w.history||[]).forEach(function(week){if(!week)return;(week.participants||[]).forEach(function(p){add(p);if(p.selected_participant_id)names[p.selected_participant_id]=p.selected_answer_author});(week.candidates||[]).forEach(function(p){names[p.participant_id]=p.author_name})});return names;
}
function patchNames(x){var names=nameMap(x),seats={};(x.participants||[]).forEach(function(p){seats[p.seat]=p.name});
  document.querySelectorAll('[data-dt-name]').forEach(function(el){var id=el.getAttribute('data-dt-name'),n=id?names[id]:seats[el.getAttribute('data-dt-seat')];if(n!=null){if(el.textContent!==n)el.textContent=n;var av=el.parentElement&&el.parentElement.previousElementSibling;if(av&&av.matches('.av,.v44-review-avatar,.history-detail-avatar')&&!av.querySelector('img')){var initial=String(n||'?').charAt(0);if(av.textContent!==initial)av.textContent=initial}}});
  var ps=x.participants||[];document.querySelectorAll('.top .people .av').forEach(function(el,i){if(ps[i]&&!el.querySelector('img')){var initial=String(ps[i].name||'?').charAt(0);if(el.textContent!==initial)el.textContent=initial}});var heading=document.querySelector('.relationship-compact-copy-v47 b'),label=ps.slice(0,3).map(function(p){return p.name}).join(' · ');if(heading&&heading.textContent!==label)heading.textContent=label;
  var el=document.getElementById('my-info-name');if(el&&x.me)el.textContent=x.me.name;
}
function accept(s,x){if(!x||x.room_id!==s.room)return;var current=DT.spaces().find(function(v){return v.room===s.room&&v.token===s.token});if(!current)return;s=current;
  s.name=x.me&&x.me.name||s.name;s.partnerName=x.partner&&x.partner.name||s.partnerName;s.memberNames=(x.participants||[]).map(function(p){return p.name});persist();
  var active=DT.session();if(active&&active.room===s.room){var key=JSON.stringify(nameMap(x));if(previousNames[s.room]!==key){previousNames[s.room]=key;patchNames(x)}}
  document.querySelectorAll('.spacecard [data-room]').forEach(function(btn){if(btn.getAttribute('data-room')!==s.room)return;var card=btn.closest('.spacecard'),h=card&&card.querySelector('div>h3'),n=s.memberNames.join(' × ');if(h&&h.textContent!==n)h.textContent=n;var av=card&&card.querySelector('.space-avatars-v44');if(av)av.querySelectorAll('span').forEach(function(a,i){if(s.memberNames[i])a.textContent=s.memberNames[i].charAt(0)})});
  connect(s,x.name_sync_topic);
}
function reloadNames(s){if(syncing[s.room])return syncing[s.room];if(DT.invalidateHomeStateCache)DT.invalidateHomeStateCache();
  syncing[s.room]=rpc('dt_get_state',{p_room_id:s.room,p_participant_token:s.token}).then(function(x){var active=DT.session();if(active&&active.room===s.room)DT.setState(x);accept(s,x);return x}).catch(function(){}).then(function(x){delete syncing[s.room];return x});return syncing[s.room];
}
function connect(s,topic){if(!topic||!window.WebSocket||document.hidden)return;var old=sockets[s.room];if(old&&old.topic===topic)return;if(old)old.ws.close();
  var ws;try{ws=new WebSocket(SUPA.replace('https:','wss:')+'/realtime/v1/websocket?apikey='+encodeURIComponent(KEY)+'&vsn=1.0.0')}catch(e){return}
  var joinRef=String(++ref),channel='realtime:dt-name:'+topic,entry={ws:ws,topic:topic,timer:null};sockets[s.room]=entry;
  function send(event,payload,chan){if(ws.readyState===1)ws.send(JSON.stringify({topic:chan||channel,event:event,payload:payload,ref:event==='phx_join'?joinRef:String(++ref),join_ref:chan?null:joinRef}))}
  ws.onopen=function(){send('phx_join',{config:{broadcast:{ack:false,self:false},presence:{enabled:false},postgres_changes:[],private:false}});entry.timer=setInterval(function(){send('heartbeat',{},'phoenix')},20000)};
  ws.onmessage=function(e){var m;try{m=JSON.parse(e.data)}catch(err){return}if(m.topic!==channel)return;if(m.event==='broadcast'&&m.payload&&m.payload.event==='profile_updated')reloadNames(s);if(m.event==='phx_reply'&&m.payload&&m.payload.status==='ok'&&m.ref===joinRef)reloadNames(s);if(m.event==='phx_error'||m.event==='phx_close')ws.close()};
  ws.onerror=function(){ws.close()};ws.onclose=function(){clearInterval(entry.timer);if(sockets[s.room]!==entry)return;delete sockets[s.room];if(!document.hidden)setTimeout(function(){if(DT.spaces().some(function(p){return p.room===s.room}))connect(s,topic)},5000)};
}
// State reads include a capability topic, never a participant token in a channel.
// Broadcasts invalidate names only; all names come from the token-authorized RPC.
var originalFetch=window.fetch;
window.fetch=function(input,init){var url=typeof input==='string'?input:input&&input.url||'',out=originalFetch.apply(this,arguments);if(!/\/rpc\/dt_get_state(?:\?|$)/.test(url))return out;var p;try{p=JSON.parse(init&&init.body||'{}')}catch(e){return out}return out.then(function(r){if(r.ok){r.clone().json().then(function(x){var s=DT.spaces().find(function(v){return v.room===p.p_room_id&&v.token===p.p_participant_token});if(s)accept(s,x)}).catch(function(){})}return r})};
var originalRefresh=DT.refresh;DT.refresh=function(){return originalRefresh.apply(this,arguments).then(function(r){var s=DT.session(),x=DT.state();if(s&&x){accept(s,x);patchNames(x)}return r})};
function close(){var o=document.getElementById('my-info-overlay');if(o)o.remove()}
function view(edit){close();var s=DT.session()||DT.spaces()[0],d=DT.state(),name=d&&d.me&&DT.session()&&DT.session().room===s.room?d.me.name:s&&s.name||'';
  var o=document.createElement('div');o.id='my-info-overlay';o.className='settings-page-overlay account-lifecycle-overlay';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label',text('내 정보','My info'));
  o.innerHTML='<div class="settings-page-sheet"><header><button type="button" class="settings-page-back" data-my-info-back aria-label="'+text('돌아가기','Back')+'">←</button><b>'+text(edit?'이름 수정':'내 정보',edit?'Edit name':'My info')+'</b></header><main><section class="settings-page-card">'+(edit?'<form id="my-name-form" class="form"><label for="my-name-input">'+text('내 이름','My name')+'</label><input id="my-name-input" name="name" type="text" maxlength="40" autocomplete="nickname" value="'+DT.esc(name)+'" required><p>'+text('상대방에게 보이는 이름이에요. 1~20자로 입력해 주세요.','This is the name others see. Use 1–20 characters.')+'</p><button class="btn full" type="submit">'+text('저장','Save')+'</button><button class="account-cancel-btn" type="button" data-my-info-open>'+text('취소','Cancel')+'</button><div id="my-name-feedback" class="account-feedback" aria-live="polite"></div></form>':'<h1>'+text('내 이름','My name')+'</h1><p id="my-info-name">'+DT.esc(name)+'</p><button class="btn full" type="button" data-my-name-edit '+(!s?'disabled':'')+'>'+text('이름 수정','Edit name')+'</button>')+'</section></main></div>';
  document.body.appendChild(o);if(s){o.dataset.room=s.room;o.dataset.token=s.token}if(edit){var input=o.querySelector('input');input.focus();input.setSelectionRange(input.value.length,input.value.length)}else if(s)reloadNames(s);
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-my-info],[data-my-info-open],[data-my-name-edit],[data-my-info-back]');if(!b)return;e.preventDefault();if(b.hasAttribute('data-my-info-back')){if(document.getElementById('my-name-form'))view(false);else close();return}var m=document.getElementById('settings-popover');if(m)m.remove();view(b.hasAttribute('data-my-name-edit'))},true);
document.addEventListener('submit',function(e){if(e.target.id!=='my-name-form')return;e.preventDefault();e.stopImmediatePropagation();var f=e.target,input=f.querySelector('input'),name=input.value.trim(),err=f.querySelector('#my-name-feedback'),button=f.querySelector('[type="submit"]'),o=document.getElementById('my-info-overlay');if(!name||Array.from(name).length>20||/[\u0000-\u001f\u007f]/.test(name)){err.textContent=text('이름은 1~20자로 입력해 주세요.','Use 1–20 characters.');input.focus();return}if(button.disabled)return;button.disabled=true;err.textContent='';
  rpc('dt_update_my_name',{p_room_id:o.dataset.room,p_participant_token:o.dataset.token,p_name:name}).then(function(result){var d=DT.state(),active=DT.session();if(d&&active&&active.room===o.dataset.room){var id=d.me&&d.me.id;function rename(p){if(p&&(p.id===id||p.participant_id===id||p.is_me))p.name=result.name;if(p&&p.selected_participant_id===id)p.selected_answer_author=result.name}rename(d.me);rename(d.owner);(d.participants||[]).forEach(rename);(d.history||[]).forEach(function(h){(h.answers||[]).forEach(rename)});var w=d.weekly_reflection||{};[w.latest].concat(w.history||[]).forEach(function(week){if(week)(week.participants||[]).forEach(rename)});accept(active,d);patchNames(d)}return Promise.all(DT.spaces().map(reloadNames))}).then(function(){if(document.getElementById('my-info-overlay')===o){view(false);var toast=document.getElementById('toast');if(toast){toast.textContent=text('이름을 변경했어요.','Name updated.');toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},2200)}}}).catch(function(error){err.textContent=error.message;button.disabled=false});
},true);
document.addEventListener('visibilitychange',function(){if(document.hidden){Object.keys(sockets).forEach(function(id){var e=sockets[id];delete sockets[id];clearInterval(e.timer);e.ws.close()})}else DT.spaces().forEach(reloadNames)});
var previousBack=window.DaehwateumBack;window.DaehwateumBack=function(){if(document.getElementById('my-info-overlay')){if(document.getElementById('my-name-form'))view(false);else close();return true}return previousBack?previousBack():false};
})();
