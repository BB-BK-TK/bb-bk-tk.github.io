(function(){'use strict';
var homeY=0,hasHomeY=false;
function scrollY(){return window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0}
function setY(y){window.scrollTo(0,y);document.documentElement.scrollTop=y;document.body.scrollTop=y}
function isHome(){return !!document.querySelector('.hero')||(!!document.querySelector('.spaces')&&!document.querySelector('.q')&&!document.querySelector('.intro'))}
function saveHomePosition(){if(!isHome())return;homeY=scrollY();hasHomeY=true}
function afterRender(y){requestAnimationFrame(function(){setY(y);requestAnimationFrame(function(){setY(y)})})}
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('[data-a]');if(!b)return;
  var a=b.getAttribute('data-a');
  if(a==='home'){
    if(isHome())return;
    afterRender(hasHomeY?homeY:0);
    return;
  }
  if(a==='open-room'||a==='create'||a==='new'){
    saveHomePosition();
    afterRender(0);
    return;
  }
  if(a==='room'||a==='premium'||a==='custom')afterRender(0);
},true);
})();
