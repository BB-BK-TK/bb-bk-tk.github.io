(function(){'use strict';
// The settings menu is owned by settings-v37.js, which renders the subscription
// entry itself. This file no longer injects a second one: that row appeared on
// the first paint and was then replaced, and suppressing it needed a hidden
// placeholder button in settings-v37.js. The click handler stays so any cached
// markup still carrying [data-subscription-management] lands on the same page
// the current menu entry uses.
document.addEventListener('click',function(e){
  var btn=e.target.closest&&e.target.closest('[data-subscription-management]');
  if(!btn)return;
  e.preventDefault();
  e.stopPropagation();
  var menu=document.getElementById('settings-popover');
  if(menu)menu.remove();
  location.href='./subscription/manage/';
},true);
})();
