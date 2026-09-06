(function(){'use strict';
function reduced(){return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function focusItem(item){
  if(!item||!item.open)return;
  requestAnimationFrame(function(){setTimeout(function(){
    var r=item.getBoundingClientRect(),vh=window.innerHeight||document.documentElement.clientHeight||700,maxH=vh*.72,visibleH=Math.min(r.height,maxH),target=window.scrollY+r.top-Math.max(24,(vh-visibleH)/2);
    window.scrollTo({top:Math.max(0,target),behavior:reduced()?'auto':'smooth'});
  },36)})
}
document.addEventListener('toggle',function(e){var d=e.target;if(!(d instanceof HTMLDetailsElement)||!d.matches('.hist .item')||!d.open)return;focusItem(d)},true);
})();