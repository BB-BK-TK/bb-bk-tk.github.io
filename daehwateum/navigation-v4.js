(function(){'use strict';
function synthetic(action){var app=document.getElementById('app');if(!app)return false;var b=document.createElement('button');b.type='button';b.setAttribute('data-a',action);b.style.display='none';app.appendChild(b);b.click();b.remove();return true}
function isHome(){return !!document.querySelector('.hero') || (!!document.querySelector('.spaces')&&!document.querySelector('.q')&&!document.querySelector('.intro'))}
function goHome(){try{if(window.DT&&DT.clearQuery)DT.clearQuery()}catch(e){}return synthetic('home')}
window.DaehwateumBack=function(){
  try{
    if(isHome())return false;
    if(document.querySelector('#qf')||document.querySelector('.premium-card')){
      var rb=document.querySelector('[data-a="room"]');if(rb){rb.click();return true}
      if(window.DT&&DT.state&&DT.state())return synthetic('room');
      return goHome();
    }
    if(document.querySelector('#cf')||document.querySelector('#jf')||document.querySelector('.recovery-card'))return goHome();
    if(document.querySelector('.q'))return goHome();
    if(window.DT&&DT.state&&DT.state())return synthetic('room');
    return goHome();
  }catch(e){return false}
};
})();
