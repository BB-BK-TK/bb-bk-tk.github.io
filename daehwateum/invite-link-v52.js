(function(){'use strict';
var params=new URLSearchParams(location.search);
var invite=params.get('invite');
var ua=navigator.userAgent||'';
var isAndroid=/Android/i.test(ua);
var isNative=/DaehwateumAndroid/i.test(ua);
var isJoin=/\/join\/?$/.test(location.pathname);

// Old invite URLs opened from Kakao/Android should never enter the web app runtime.
// Route them to the lightweight join landing before guest identity is created.
if(invite&&isAndroid&&!isNative&&!isJoin&&params.get('web')!=='1'){
  location.replace('./join/?invite='+encodeURIComponent(invite));
  return;
}

function install(){
  if(!window.DT){setTimeout(install,10);return;}
  DT.inviteUrl=function(){
    var s=DT.session&&DT.session();
    var token=s&&s.invite?s.invite:'';
    return location.origin+DT.base()+'join/?invite='+encodeURIComponent(token);
  };
}
install();
})();