(function(){'use strict';
var token=new URLSearchParams(location.search).get('invite');
if(!token)return;
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0;
function render(title,body,button){
  var app=document.getElementById('app');if(!app)return;
  app.innerHTML='<div class="w"><header class="top"><b class="brand">◉ '+(ko?'대화틈':'Daehwateum')+'</b></header><section class="card intro invite-closed"><div class="orb"><i></i><i></i></div><span class="k">INVITATION</span><h1>'+title+'</h1><p>'+body+'</p><button class="btn full" data-a="cancel">'+button+'</button></section></div>';
}
function run(){
  var form=document.getElementById('jf');
  if(!form)return;
  var btn=form.querySelector('button');if(btn)btn.disabled=true;
  fetch('https://kacvynoegfpvgdpqtjdi.supabase.co/rest/v1/rpc/dt_get_invite_status',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_invite_token:token})
  }).then(function(r){return r.json().then(function(j){if(!r.ok)throw Error((j&&j.message)||'Invite check failed');return j})})
    .then(function(s){
      if(!s||!s.valid){render(ko?'이 초대는 더 이상 열 수 없어요.':'This invite is no longer available.',ko?'링크가 만료되었거나 유효하지 않아요.':'The link has expired or is invalid.',ko?'홈으로':'Back home');return}
      if(s.full){render(ko?'이 대화틈은 다 찼어요.':'This space is full.',ko?'최대 '+s.max_participants+'명까지 함께할 수 있어요. 새로 참여할 수는 없어요.':'Up to '+s.max_participants+' people can join this space. No more spots are available.',ko?'홈으로':'Back home');return}
      if(btn)btn.disabled=false;
    }).catch(function(){if(btn)btn.disabled=false});
}
setTimeout(run,30);
})();
