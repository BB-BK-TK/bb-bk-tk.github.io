(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,patching=false;
function copy(){return ko?{lover:'연인',spouse:'배우자',friend:'친구',family:'가족',colleague:'동료',partner:'연인/배우자'}:{lover:'Dating partner',spouse:'Spouse',friend:'Friend',family:'Family',colleague:'Colleague',partner:'Partner/Spouse'}}
function label(rel){var c=copy();return c[rel]||c.partner}
function option(value,icon,text,checked){return '<label class="rel-option"><input type="radio" name="relation" value="'+value+'"'+(checked?' checked':'')+'><span><i>'+icon+'</i><b>'+text+'</b></span></label>'}
function patchCreate(){var grid=document.querySelector('#cf .rel-grid');if(!grid||grid.getAttribute('data-rel-v12')==='1')return;var c=copy();grid.setAttribute('data-rel-v12','1');grid.classList.add('rel-grid-v12');grid.innerHTML=option('lover','♡',c.lover,true)+option('spouse','◎',c.spouse,false)+option('friend','☺',c.friend,false)+option('family','⌂',c.family,false)+option('colleague','▣',c.colleague,false)}
function replaceRelationText(el,rel){if(!el||!rel)return;var wanted=label(rel),txt=el.textContent||'';var re=ko?/(연인\s*[·/]\s*배우자|연인\/배우자|연인|배우자|친구|가족|동료)/:/(Dating partner|Partner\s*[·/]\s*Spouse|Partner\/Spouse|Partner|Spouse|Friend|Family|Colleague)/i;if(re.test(txt)){var next=txt.replace(re,wanted);if(next!==txt)el.textContent=next}}
function patchRoom(){if(!window.DT||!DT.state)return;var d=DT.state();if(!d||!d.relationship_type)return;replaceRelationText(document.querySelector('.q .k'),d.relationship_type);document.querySelectorAll('.stage .k').forEach(function(el){var t=(el.textContent||'').trim();var old=ko?['연인/배우자','연인 · 배우자','연인','배우자','친구','가족','동료']:['Partner/Spouse','Partner · Spouse','Partner','Spouse','Friend','Family','Colleague'];if(old.indexOf(t)>=0&&t!==label(d.relationship_type))el.textContent=label(d.relationship_type)})}
function patchSpaces(){if(!window.DT||!DT.spaces)return;var list=DT.spaces().slice().reverse(),cards=document.querySelectorAll('.spaces .spacecard');cards.forEach(function(card,i){if(!list[i])return;var k=card.querySelector('.k');if(k){var v=label(list[i].relationshipType);if(k.textContent!==v)k.textContent=v}})}
function patch(){patchCreate();patchRoom();patchSpaces()}
function schedule(){if(patching)return;patching=true;requestAnimationFrame(function(){patching=false;patch()})}
function start(){var app=document.getElementById('app');if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
