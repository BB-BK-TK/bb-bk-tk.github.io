(function(){'use strict';
if(!window.DT||typeof DT.refresh!=='function'||DT.__runtimeStabilityV73)return;
DT.__runtimeStabilityV73=true;
var originalRefresh=DT.refresh,deferredRender=false,lastServerSignature=null;
var nativeFetch=window.fetch,homeStateCache={},openingRoomUntil=0;

function app(){return document.getElementById('app')}
function isDrafting(){
  var root=app();if(!root)return false;
  if(root.querySelector('.answer-open-v43 #af'))return true;
  var active=document.activeElement;
  if(active&&root.contains(active)&&active.matches&&active.matches('textarea,input,[contenteditable="true"]'))return true;
  var fields=root.querySelectorAll('#af textarea,#rf textarea,#qf textarea');
  for(var i=0;i<fields.length;i++)if(String(fields[i].value||'').trim())return true;
  return false;
}
function clearDeferred(){deferredRender=false}
function participantSignature(p,showAnswer){
  if(!p)return null;
  return [p.id||'',p.seat||'',p.name||'',!!p.is_me,!!p.is_owner,!!p.answered,showAnswer?(p.answer||''):''];
}
function structuralSignature(x){
  if(!x)return'';
  var unlocked=!!x.unlocked;
  var participants=(x.participants||[]).map(function(p){return participantSignature(p,unlocked)});
  var history=(x.history||[]).map(function(h){return [h.round_id||'',h.sequence||'',h.completed_at||'']});
  var reflection=x.reflection||{};
  var reflectionParticipants=(reflection.participants||[]).map(function(p){return [p.id||'',p.seat||'',p.name||'',!!p.is_me,!!p.submitted]});
  var transfer=x.owner_transfer||null;
  return JSON.stringify([
    x.room_id||'',x.round_id||'',x.round_sequence||0,x.question||'',x.question_en||'',x.question_source||'',
    unlocked,history,x.participant_count||0,x.max_participants||0,participants,
    !!reflection.unlocked,reflectionParticipants,!!x.is_premium,!!x.can_start_next,!!x.is_paused,
    !!x.challenge_complete,!!x.free_period_ended,!!x.can_invite_more,x.round_completed_at||'',
    x.owner&&x.owner.id||'',transfer&&transfer.id||'',transfer&&transfer.status||''
  ]);
}
function rememberServerState(){lastServerSignature=structuralSignature(window.DT&&DT.state?DT.state():null)}

/* Do not let the home-screen cache intercept the explicit room load that starts
   while the old home DOM is still on screen. */
document.addEventListener('click',function(e){
  var open=e.target&&e.target.closest&&e.target.closest('[data-a="open-room"]');
  if(open)openingRoomUntil=Date.now()+2500;
},true);

/* Home status observers can wake themselves through DOM mutations. Coalesce
   identical home state reads to the intended cadence. Room polling is untouched. */
window.fetch=function(input,init){
  var url=typeof input==='string'?input:(input&&input.url)||'';
  var isHomeState=/\/rpc\/dt_get_state(?:\?|$)/.test(url)&&!!document.querySelector('.spaces')&&Date.now()>openingRoomUntil;
  if(!isHomeState)return nativeFetch.apply(this,arguments);
  var body=init&&typeof init.body==='string'?init.body:'';
  var key=url+'|'+body,now=Date.now(),hit=homeStateCache[key];
  if(hit&&now-hit.at<14000){
    if(hit.response)return Promise.resolve(hit.response.clone());
    if(hit.promise)return hit.promise.then(function(){var fresh=homeStateCache[key];if(fresh&&fresh.response)return fresh.response.clone();throw new Error('Home state response unavailable')});
  }
  var args=arguments;
  var pending=nativeFetch.apply(this,args).then(function(r){
    homeStateCache[key]={at:Date.now(),response:r.clone()};
    return r;
  },function(e){delete homeStateCache[key];throw e});
  homeStateCache[key]={at:now,promise:pending};
  return pending;
};

/* Critical v73 fix: compare server snapshot to the previous server snapshot,
   not to DT.state(), because schedule-v6 legitimately mutates timing fields on
   the client between polls. Comparing against that locally-mutated object made
   every 3.5s poll look like a server change and app.js rebuilt the whole room. */
DT.isDraftingV72=isDrafting;
DT.isDraftingV73=isDrafting;
DT.refresh=function(){
  var self=this,args=arguments;
  return originalRefresh.apply(self,args).then(function(result){
    if(!result)return result;
    var sig=structuralSignature(result.state||DT.state());
    var changed=lastServerSignature===null?!!result.changed:(sig!==lastServerSignature);
    lastServerSignature=sig;
    if(isDrafting()){
      if(changed)deferredRender=true;
      return Object.assign({},result,{changed:false,deferredByDraft:changed,serverStableV73:true});
    }
    if(deferredRender){
      deferredRender=false;
      changed=true;
    }
    return Object.assign({},result,{changed:changed,serverStableV73:true});
  });
};

/* User actions already render their returned server state explicitly. Seed the
   next poll from that new server-backed state so it cannot cause a duplicate repaint. */
['answer','submitReflection','customQuestion','next','enablePremium'].forEach(function(name){
  if(typeof DT[name]!=='function')return;
  var original=DT[name];
  DT[name]=function(){
    clearDeferred();
    var out=original.apply(this,arguments);
    if(!out||typeof out.then!=='function'){rememberServerState();return out}
    return out.then(function(value){rememberServerState();return value});
  };
});
})();
