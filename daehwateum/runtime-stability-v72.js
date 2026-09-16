(function(){'use strict';
if(!window.DT||typeof DT.refresh!=='function'||DT.__runtimeStabilityV72)return;
DT.__runtimeStabilityV72=true;
var originalRefresh=DT.refresh,deferredRender=false;
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

/* Do not let the home-screen cache intercept the explicit room load that starts
   while the old home DOM is still on screen. */
document.addEventListener('click',function(e){
  var open=e.target&&e.target.closest&&e.target.closest('[data-a="open-room"]');
  if(open)openingRoomUntil=Date.now()+2500;
},true);

/* space-status-policy watches the whole app and its own home-card mutations can
   wake that observer again. It currently forces a state sync on every wake-up.
   Coalesce identical home-screen state reads to the intended 15s cadence. Room
   polling is untouched because a room has no .spaces list. */
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

/* A background state change may update DT.state, but it must not replace the
   whole room DOM while someone is composing. app.js uses result.changed to
   decide whether to call room(), so defer that signal until the draft is gone. */
DT.isDraftingV72=isDrafting;
DT.refresh=function(){
  var self=this,args=arguments;
  return originalRefresh.apply(self,args).then(function(result){
    if(!result)return result;
    if(isDrafting()){
      if(result.changed)deferredRender=true;
      return result.changed?Object.assign({},result,{changed:false,deferredByDraft:true}):result;
    }
    if(deferredRender){
      deferredRender=false;
      return Object.assign({},result,{changed:true,deferredByDraft:true});
    }
    return result;
  });
};

/* These actions already render their returned server state explicitly. */
['answer','submitReflection','customQuestion','next'].forEach(function(name){
  if(typeof DT[name]!=='function')return;
  var original=DT[name];
  DT[name]=function(){clearDeferred();return original.apply(this,arguments)};
});
})();
