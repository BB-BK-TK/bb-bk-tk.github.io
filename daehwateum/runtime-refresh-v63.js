(function(){'use strict';
var CURRENT=(document.querySelector('meta[name="dt-build"]')||{}).content||'';
var checking=false,lastCheck=0;
function check(){
  var now=Date.now();
  if(checking||now-lastCheck<15000)return;
  checking=true;lastCheck=now;
  fetch('./index.html?dt-refresh='+now,{cache:'no-store',credentials:'same-origin'})
    .then(function(r){return r.ok?r.text():''})
    .then(function(html){
      if(!html||!CURRENT)return;
      var m=html.match(/<meta\s+name=["']dt-build["']\s+content=["']([^"']+)["']/i);
      var remote=m&&m[1];
      if(remote&&remote!==CURRENT)location.reload();
    })
    .catch(function(){})
    .then(function(){checking=false});
}
document.addEventListener('visibilitychange',function(){if(!document.hidden)check()});
window.addEventListener('focus',check);
setTimeout(check,3000);
})();
