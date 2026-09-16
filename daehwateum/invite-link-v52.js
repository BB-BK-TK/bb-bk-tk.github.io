(function(){'use strict';
var params=new URLSearchParams(location.search);
var rawInvite=params.get('invite');
var claim=params.get('claim');
var CLAIM_PREFIX='dtclaim_';
var PENDING_CLAIM='dt.pending.inviteClaim.v66';
var invite=rawInvite;
var ua=navigator.userAgent||'';
var isAndroid=/Android/i.test(ua);
var isNative=/DaehwateumAndroid/i.test(ua);
var isJoin=/\/join\/?$/.test(location.pathname);

function rememberClaim(code){if(!/^[0-9a-f]{48}$/i.test(code||''))return;try{localStorage.setItem(PENDING_CLAIM,String(code).toLowerCase())}catch(e){}}
function storedClaim(){var x='';try{x=localStorage.getItem(PENDING_CLAIM)||''}catch(e){}return /^[0-9a-f]{48}$/i.test(x)?x.toLowerCase():''}

// Native beta builds already understand ?invite=... and the legacy clipboard
// handoff. A synthetic dtclaim_ invite lets those builds carry only the new
// server claim token without requiring an APK protocol change.
if(rawInvite&&rawInvite.indexOf(CLAIM_PREFIX)===0){
  var rawClaim=rawInvite.slice(CLAIM_PREFIX.length);
  if(/^[0-9a-f]{48}$/i.test(rawClaim)){claim=rawClaim.toLowerCase();rememberClaim(claim);params.set('web','1')}
}

// A persisted server claim can also arrive explicitly as ?claim=... (web/PWA)
// or be recovered from same-origin storage after Add to Home Screen.
if(!rawInvite){
  if(!claim)claim=storedClaim();
  if(claim&&/^[0-9a-f]{48}$/i.test(claim)){
    claim=claim.toLowerCase();rememberClaim(claim);invite=CLAIM_PREFIX+claim;
    params.delete('claim');params.set('invite',invite);params.set('web','1');
    var q=params.toString();history.replaceState({},'',location.pathname+(q?'?'+q:'')+location.hash);
  }
}

// Translate legacy invite-status checks to the server-claim RPC. Supabase auth
// wraps this fetch later and still adds the publishable key.
var originalFetch=window.fetch;
window.fetch=function(input,init){
  try{
    var url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.indexOf('/rest/v1/rpc/dt_get_invite_status')>=0&&init&&init.body){
      var req=JSON.parse(init.body),v=req&&req.p_invite_token;
      if(typeof v==='string'&&v.indexOf(CLAIM_PREFIX)===0){
        var code=v.slice(CLAIM_PREFIX.length);
        if(/^[0-9a-f]{48}$/i.test(code)){
          input=url.replace('/rpc/dt_get_invite_status','/rpc/dt_get_invite_claim_status');
          init=Object.assign({},init,{body:JSON.stringify({p_claim_token:code})});
        }
      }
    }
  }catch(e){}
  return originalFetch.call(this,input,init);
};

// Raw browser invite URLs enter the lightweight landing first. A claim route is
// already post-acceptance and must not be bounced back into the invite landing.
if(rawInvite&&rawInvite.indexOf(CLAIM_PREFIX)!==0&&isAndroid&&!isNative&&!isJoin&&params.get('web')!=='1'){
  location.replace('./join/#invite='+encodeURIComponent(rawInvite));
  return;
}

function install(){
  if(!window.DT){setTimeout(install,10);return;}
  DT.inviteUrl=function(){
    var s=DT.session&&DT.session();
    var token=s&&(s.invite||s.joinedInvite)?(s.invite||s.joinedInvite):'';
    if(!token||token.indexOf(CLAIM_PREFIX)===0)return '';
    return location.origin+DT.base()+'join/#invite='+encodeURIComponent(token);
  };
}
install();
})();
