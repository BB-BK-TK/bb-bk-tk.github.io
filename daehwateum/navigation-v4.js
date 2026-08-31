(function(){'use strict';
function synthetic(action){var app=document.getElementById('app');if(!app)return false;var b=document.createElement('button');b.type='button';b.setAttribute('data-a',action);b.style.display='none';app.appendChild(b);b.click();b.remove();return true}
window.DaehwateumBack=function(){
  try{
    var isHome=!!document.querySelector('.hero') || (!!document.querySelector('.spaces')&&!document.querySelector('.q')&&!document.querySelector('.intro'));
    if(isHome)return false;
    if(document.querySelector('[data-a="room"]')){document.querySelector('[data-a="room"]').click();return true}
    if(window.DT&&DT.state&&DT.state())return synthetic('room');
    return synthetic('home');
  }catch(e){return false}
};
})();
