(function(){'use strict';
var SUPA='https://kacvynoegfpvgdpqtjdi.supabase.co';
var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXAiLCJyZWYiOiJrYWN2eW5vZWdmcHZnZHBxdGpkaiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg3NTM5NTYwLCJleHAiOjIxMDMxMTU1NjB9.G9BzseV6w4uwni5lc9irAu0mSNT5MFmo1JpQIigPRhU';
var LEGACY='dt.active.v3',REGKEY='dt.spaces.v1';
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function nl(v){return esc(v).replace(/\n/g,'<br>')}
function initial(v){var s=String(v||'?').trim();return esc(s.charAt(0)||'?')}
function base(){var p=location.pathname;return p.charAt(p.length-1)==='/'?p:p.slice(0,p.lastIndexOf('/')+1)}
function readLegacy(){try{var x=JSON.parse(localStorage.getItem(LEGACY));if(x&&x.room&&x.token){x.rev=x.rev||[];return x}}catch(e){}return null}
function loadRegistry(){try{var r=JSON.parse(localStorage.getItem(REGKEY));if(r&&Array.isArray(r.spaces))return r}catch(e){}var old=readLegacy(),r={active:old?old.room:null,spaces:old?[old]:[]};localStorage.setItem(REGKEY,JSON.stringify(r));return r}
var registry=loadRegistry(),session=null,state=null;
function writeRegistry(){localStorage.setItem(REGKEY,JSON.stringify(registry))}
function activeSession(){if(!registry.active)return null;for(var i=0;i<registry.spaces.length;i++)if(registry.spaces[i].room===registry.active){registry.spaces[i].rev=registry.spaces[i].rev||[];return registry.spaces[i]}return null}
session=activeSession();
function saveSession(x){session=x;if(!x){registry.active=null;writeRegistry();localStorage.removeItem(LEGACY);return null}x.rev=x.rev||[];var idx=-1;for(var i=0;i<registry.spaces.length;i++)if(registry.spaces[i].room===x.room){idx=i;break}if(idx>=0)registry.spaces[idx]=Object.assign({},registry.spaces[idx],x);else registry.spaces.push(x);session=idx>=0?registry.spaces[idx]:x;registry.active=session.room;writeRegistry();localStorage.setItem(LEGACY,JSON.stringify(session));return session}
function clearActive(){state=null;saveSession(null)}
function activate(room){for(var i=0;i<registry.spaces.length;i++)if(registry.spaces[i].room===room){state=null;return saveSession(registry.spaces[i])}return null}
function findByInvite(tok){if(!tok)return null;for(var i=0;i<registry.spaces.length;i++){var s=registry.spaces[i];if(s.invite===tok||s.joinedInvite===tok)return s}return null}
function rpc(fn,payload){return fetch(SUPA+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.text().then(function(t){var j=null;try{j=t?JSON.parse(t):null}catch(e){}if(!r.ok)throw Error(j&&j.message?j.message:'Something went wrong.');return j})})}
function refresh(){if(!session)return Promise.reject(Error('No active space.'));return rpc('dt_get_state',{p_room_id:session.room,p_participant_token:session.token}).then(function(x){var before=state?JSON.stringify([state.round_id,state.partner&&state.partner.answered,state.unlocked,state.history&&state.history.length,state.reflection&&state.reflection.partner_submitted]):'';state=x;session.name=x.me&&x.me.name?x.me.name:session.name;session.partnerName=x.partner&&x.partner.name?x.partner.name:session.partnerName;session.lastRound=x.round_sequence||session.lastRound;session.relationshipType=x.relationship_type||session.relationshipType||'partner';session.lastSeen=new Date().toISOString();saveSession(session);var after=JSON.stringify([x.round_id,x.partner&&x.partner.answered,x.unlocked,x.history&&x.history.length,x.reflection&&x.reflection.partner_submitted]);return {state:x,changed:before!==after}})}
function createRoom(name,relationshipType){var rel=relationshipType||'partner';return rpc('dt_create_room_v2',{p_creator_name:name,p_relationship_type:rel}).then(function(r){var x=Array.isArray(r)?r[0]:r;saveSession({room:x.room_id,token:x.participant_token,invite:x.invite_token,name:name,relationshipType:rel,rev:[]});return refresh()})}
function joinRoom(invite,name){return rpc('dt_join_room',{p_invite_token:invite,p_name:name}).then(function(r){var x=Array.isArray(r)?r[0]:r;saveSession({room:x.room_id,token:x.participant_token,name:name,joinedInvite:invite,rev:[]});return refresh()})}
function answer(v){return rpc('dt_submit_answer',{p_room_id:session.room,p_participant_token:session.token,p_answer:v}).then(function(x){state=x;session.lastRound=x.round_sequence||session.lastRound;saveSession(session);return x})}
function next(){return rpc('dt_start_next_round',{p_room_id:session.room,p_participant_token:session.token}).then(function(x){state=x;session.lastRound=x.round_sequence||session.lastRound;saveSession(session);return x})}
function submitReflection(good,improve){return rpc('dt_submit_weekly_reflection',{p_room_id:session.room,p_participant_token:session.token,p_good:good,p_improve:improve,p_week_no:1}).then(function(x){state=x;session.reflectionDone=true;saveSession(session);return x})}
function log(eventType,meta){if(!session)return Promise.resolve();return rpc('dt_log_event',{p_room_id:session.room,p_participant_token:session.token,p_event_type:eventType,p_meta:meta||{}}).catch(function(){})}
function reveal(){if(!session||!state)return;session.rev=session.rev||[];if(session.rev.indexOf(state.round_id)<0){session.rev.push(state.round_id);saveSession(session)}}
function revealed(){return !!(session&&state&&session.rev&&session.rev.indexOf(state.round_id)>=0)}
function inviteUrl(){return location.origin+base()+'?invite='+encodeURIComponent(session&&session.invite?session.invite:'')}
function clearQuery(){window.history.replaceState({},'',base())}
function dateObj(v){var d=v?new Date(v):null;return d&&!isNaN(d.getTime())?d:null}
function dateLabel(v){var d=dateObj(v);return d?(d.getMonth()+1)+'.'+d.getDate():''}
function dayKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
window.DT={esc:esc,nl:nl,initial:initial,base:base,spaces:function(){return registry.spaces.slice()},session:function(){return session},state:function(){return state},setState:function(x){state=x},saveSession:saveSession,clearActive:clearActive,activate:activate,findByInvite:findByInvite,refresh:refresh,createRoom:createRoom,joinRoom:joinRoom,answer:answer,next:next,submitReflection:submitReflection,log:log,reveal:reveal,revealed:revealed,inviteUrl:inviteUrl,clearQuery:clearQuery,dateObj:dateObj,dateLabel:dateLabel,dayKey:dayKey};
})();