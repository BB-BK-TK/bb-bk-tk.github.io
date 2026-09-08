(function(){'use strict';
var ko=(navigator.language||'ko').toLowerCase().indexOf('ko')===0,busy=false;
function findSection(title){var sec=document.querySelectorAll('#about-overlay section');for(var i=0;i<sec.length;i++){var h=sec[i].querySelector('h2');if(h&&(h.textContent||'').trim()===title)return sec[i]}return null}
function addAfter(anchor,title,body,key){if(!anchor||document.querySelector('#about-overlay [data-usage-v32="'+key+'"]'))return null;var s=document.createElement('section');s.setAttribute('data-usage-v32',key);s.innerHTML='<h2></h2><p></p>';s.querySelector('h2').textContent=title;s.querySelector('p').textContent=body;anchor.insertAdjacentElement('afterend',s);return s}
function patch(){if(busy)return;busy=true;requestAnimationFrame(function(){busy=false;var o=document.getElementById('about-overlay');if(!o)return;
var free=findSection('Free');
if(free){addAfter(free,ko?'이미 열린 질문':'Already-open questions',ko?'7일이 지나거나 Premium 상태가 바뀌어도 이미 열린 질문은 끝까지 답할 수 있어요. 모두 답한 뒤 서로의 답도 함께 열 수 있고, 그 질문이 사라지거나 중간에 막히지 않아요. 제한은 그 다음 새 질문부터 적용돼요.':'Even if Day 7 passes or Premium status changes, an already-open question can still be completed. Everyone can finish answering and open the responses together. The restriction starts with the next new question, not the current one.','opened');
var premium=findSection('Premium');
if(premium){var transfer=addAfter(premium,ko?'방장 넘기기':'Transfer host',ko?'현재 방장은 설정에서 다른 참여자에게 방장 이전을 요청할 수 있어요. 상대방이 수락해야 방장이 바뀌고, 거절하거나 응답하지 않으면 기존 방장이 그대로 유지돼요. 새 방장이 Premium이면 7일이 지난 방도 다시 이어갈 수 있고, Free라면 기록을 보존한 채 잠시 쉬는 상태로 남아요.':'The current host can request a host transfer from Settings. The other participant must accept before the host changes. If they decline or do not respond, the current host remains. If the new host is Premium, a room older than seven days can continue; if the new host is Free, the room stays saved and paused.','transfer')||document.querySelector('#about-overlay [data-usage-v32="transfer"]');
addAfter(transfer,ko?'Premium이 끝나면':'When Premium ends',ko?'Premium이 실제로 끝난 시점부터, 내가 방장인 7일 초과 대화틈은 새 질문만 멈춰요. 기존 질문·답변·회고·히스토리는 삭제되지 않아요. 상대방에게는 누가 구독을 취소했는지 보여주지 않고, 방이 “잠시 쉬는 중”으로 표시돼요.':'When Premium actually ends, spaces older than seven days where you are the host pause only new questions. Existing questions, answers, reflections, and history are not deleted. Other participants are not told who cancelled; the room is simply shown as paused.','ended')}
}
})}
function start(){new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});patch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();