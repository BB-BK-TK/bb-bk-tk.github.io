(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false;
function state(){return window.DT&&DT.state&&DT.state()}
function label(){return ko?'방장':'Host'}
function hostOf(D){var ps=(D&&D.participants)||[];for(var i=0;i<ps.length;i++)if(Number(ps[i].seat)===1)return ps[i];if(D&&D.me&&D.me.is_creator)return {name:D.me.name,seat:1,is_me:true};return null}
function addBadge(el){if(!el||el.querySelector('.host-badge'))return;var b=document.createElement('span');b.className='host-badge';b.textContent=label();el.appendChild(b)}
function patchMeta(D,host){var meta=document.querySelector('.q>.k');if(!meta||!host)return;var old=meta.querySelector('.room-host-meta');if(old){old.textContent=label()+' '+host.name;return}meta.appendChild(document.createTextNode(' · '));var s=document.createElement('span');s.className='room-host-meta';s.textContent=label()+' '+host.name;meta.appendChild(s)}
function patchAvatars(D){var ps=(D&&D.participants)||[];document.querySelectorAll('.top .people .av').forEach(function(av,i){var p=ps[i];av.classList.toggle('host-avatar',!!p&&Number(p.seat)===1);if(p&&Number(p.seat)===1){av.setAttribute('data-host',label());av.setAttribute('title',label()+' · '+p.name)}else{av.removeAttribute('data-host');av.removeAttribute('title')}});document.querySelectorAll('.reveal.group-reveal .av').forEach(function(av,i){var p=ps[i];av.classList.toggle('host-avatar',!!p&&Number(p.seat)===1);if(p&&Number(p.seat)===1)av.setAttribute('data-host',label());else av.removeAttribute('data-host')})}
function patchNames(D,host){if(!host)return;var head=document.querySelector('.stage .head');if(head&&D.me&&D.me.is_creator)addBadge(head);document.querySelectorAll('.answers.group-answers').forEach(function(group){var cards=group.querySelectorAll(':scope > article.ans'),ps=(D.participants||[]);if(cards.length!==ps.length)return;cards.forEach(function(card,i){if(Number(ps[i].seat)!==1)return;var h=card.querySelector('header b')||card.querySelector(':scope > b');addBadge(h||card)})})}
function patch(){if(patching)return;patching=true;requestAnimationFrame(function(){patching=false;var D=state();if(!D||!D.me||!document.querySelector('.q'))return;var host=hostOf(D);patchMeta(D,host);patchAvatars(D);patchNames(D,host)})}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(patch).observe(app,{childList:true,subtree:true});patch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
