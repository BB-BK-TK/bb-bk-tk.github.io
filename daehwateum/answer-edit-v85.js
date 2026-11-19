(function(){
'use strict';
var app=document.getElementById('app');
if(!app)return;
var ko=(document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0;
var editOpen=false,draft='',baseline='',roundId='',editBlocked=false,saving=false,notice='',scheduled=false;
function t(a,b){return ko?a:b}
function state(){return window.DT&&typeof DT.state==='function'?DT.state():null}
function el(tag,className,text){var e=document.createElement(tag);e.className=className||'';if(text!=null)e.textContent=text;return e}
function otherHasAnswered(d){return (d.participants||[]).some(function(p){return !p.is_me&&!!p.answered})}
function eligible(d){return !!(d&&d.me&&d.me.answered&&d.me.answer!=null&&d.participant_count>=2)}
function editable(d){return eligible(d)&&!d.unlocked&&!d.round_completed_at&&!d.room_closed&&!otherHasAnswered(d)}
function roomContext(){var d=state(),w=app.querySelector(':scope > .w'),q=w&&w.querySelector(':scope > .q');
  if(!d||!q||w.querySelector('.question-queue-screen')||q.hidden||q.getAttribute('aria-hidden')==='true')return null;
  return {d:d,w:w,q:q};
}
function refreshRoom(){var b=el('button');b.type='button';b.hidden=true;b.setAttribute('data-a','room');app.appendChild(b);b.click();b.remove()}
function makePreview(d,q){
  var prev=q.parentNode.querySelector(':scope > .dt-edit-preview-v85');
  if(!prev){prev=el('section','card dt-edit-preview-v85');q.insertAdjacentElement('afterend',prev)}
  if(prev.getAttribute('data-answer')!==d.me.answer){
    prev.replaceChildren();
    prev.appendChild(el('span','dt-edit-preview-label-v85',t('내가 남긴 이야기','My story')));
    prev.appendChild(el('p','dt-edit-preview-body-v85',d.me.answer));
    prev.setAttribute('data-answer',d.me.answer);
  }
  var button=prev.querySelector('.dt-edit-open-v85');
  if(editable(d)&&!editOpen){
    if(!button){button=el('button','dt-edit-open-v85',t('✎ 내 답변 수정하기','✎ Edit my answer'));button.type='button';button.dataset.dtEdit='open';prev.appendChild(button)}
  }else if(button){button.remove()}
  prev.classList.toggle('dt-edit-hidden-v85',editOpen);
}
function panel(d,q){
  var parent=q.parentNode,old=parent&&parent.querySelector(':scope > .dt-edit-panel-v85');
  if(!editOpen){if(old)old.remove();return}
  if(roundId!==String(d.round_id||''))editBlocked=true;
  var blocked=editBlocked||!editable(d);
  if(blocked)editBlocked=true;
  if(!old){
    old=el('section','card dt-edit-panel-v85');
    old.dataset.editRound=roundId;
    var top=el('div','dt-edit-panel-top-v85');
    top.appendChild(el('span','dt-edit-panel-k-v85',t('내 이야기 다듬기','Refine my story')));
    top.appendChild(el('h3','dt-edit-panel-title-v85',t('아까 남긴 마음을 조금 바꿔볼까요?','Would you like to change your answer?')));
    old.appendChild(top);
    var form=el('form','dt-edit-form-v85');form.id='dt-edit-form-v85';
    var area=el('textarea','dt-edit-textarea-v85');area.name='answer';area.maxLength=1000;area.required=true;area.setAttribute('aria-label',t('수정할 답변','Answer to revise'));area.value=draft;
    form.appendChild(area);
    form.appendChild(el('p','dt-edit-hint-v85',t('상대방이 답변을 완료하기 전까지만 수정할 수 있어요.','You can edit until the other person answers.')));
    var msg=el('p','dt-edit-notice-v85');msg.setAttribute('role','status');form.appendChild(msg);
    var actions=el('div','dt-edit-actions-v85');
    var save=el('button','btn dt-edit-save-v85',t('수정 내용 저장하기','Save changes'));save.type='submit';actions.appendChild(save);
    var copy=el('button','btn outline dt-edit-copy-v85',t('작성한 내용 복사','Copy my draft'));copy.type='button';copy.dataset.dtEdit='copy';actions.appendChild(copy);
    var cancel=el('button','text dt-edit-cancel-v85',t('닫기','Close'));cancel.type='button';cancel.dataset.dtEdit='cancel';actions.appendChild(cancel);
    form.appendChild(actions);old.appendChild(form);q.insertAdjacentElement('afterend',old);
  }
  var ta=old.querySelector('textarea'),btn=old.querySelector('.dt-edit-save-v85'),copyBtn=old.querySelector('.dt-edit-copy-v85'),hint=old.querySelector('.dt-edit-hint-v85'),msg=old.querySelector('.dt-edit-notice-v85');
  if(blocked){
    if(ta)ta.readOnly=true;
    if(btn)btn.hidden=true;
    if(copyBtn)copyBtn.hidden=false;
    var lockedHint=t('상대방의 답변이 도착해 이제 수정할 수 없어요. 작성 중이던 내용은 아래에서 복사할 수 있어요.','The other answer arrived. You can no longer save, but you can copy your draft.');
    if(hint&&hint.textContent!==lockedHint)hint.textContent=lockedHint;
    old.classList.add('dt-edit-blocked-v85');
  }else{
    if(ta)ta.readOnly=!!saving;
    if(btn){btn.hidden=false;btn.disabled=!!saving;btn.textContent=saving?t('저장 중…','Saving…'):t('수정 내용 저장하기','Save changes')}
    if(copyBtn)copyBtn.hidden=true;
    old.classList.remove('dt-edit-blocked-v85');
  }
  if(msg&&msg.textContent!==notice)msg.textContent=notice;
}
function patch(){
  var c=roomContext();
  if(!c){if(!editOpen)return;/* retain draft while the room is refreshing */return}
  var d=c.d,q=c.q;
  if(!eligible(d)){
    var panelEl=c.w.querySelector(':scope > .dt-edit-panel-v85');if(panelEl)panelEl.remove();
    return;
  }
  if(!d.unlocked&&!d.round_completed_at){makePreview(d,q)}
  else {var preview=c.w.querySelector(':scope > .dt-edit-preview-v85');if(preview)preview.remove()}
  panel(d,q);
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patch()})}
app.addEventListener('input',function(ev){var a=ev.target;if(a&&a.matches('.dt-edit-textarea-v85'))draft=a.value},true);
app.addEventListener('click',function(ev){
  var button=ev.target.closest&&ev.target.closest('[data-dt-edit]');
  if(!button)return;
  var action=button.dataset.dtEdit,c=roomContext();
  if(action==='open'){
    if(!c||!editable(c.d))return;
    editOpen=true;editBlocked=false;saving=false;notice='';
    draft=c.d.me.answer||'';baseline=draft;roundId=String(c.d.round_id||'');
    schedule();
    requestAnimationFrame(function(){var ta=app.querySelector('.dt-edit-textarea-v85');if(ta)ta.focus()});
  }else if(action==='cancel'){
    editOpen=false;editBlocked=false;saving=false;notice='';draft='';baseline='';roundId='';schedule();
  }else if(action==='copy'){
    if(!navigator.clipboard||!navigator.clipboard.writeText){notice=t('텍스트를 길게 눌러 복사해 주세요.','Select the text to copy.');schedule();return}
    navigator.clipboard.writeText(draft).then(function(){notice=t('작성한 내용을 복사했어요.','Draft copied.');schedule()}).catch(function(){notice=t('텍스트를 선택해 복사해 주세요.','Select the text to copy.');schedule()});
  }
},true);
app.addEventListener('submit',function(ev){
  if(ev.target.id!=='dt-edit-form-v85')return;
  ev.preventDefault();ev.stopImmediatePropagation();
  if(saving||!editOpen)return;
  var c=roomContext(),v=draft.trim();
  if(!c||!editable(c.d)||editBlocked){
    editBlocked=true;notice=t('상대의 답변 상태가 바뀌었어요. 저장할 수 없어요.','The answer status changed. Your draft was not saved.');schedule();return;
  }
  if(!v||v.length>1000){notice=t('답변은 1~1000자로 입력해 주세요.','Enter 1–1000 characters.');schedule();return}
  saving=true;notice='';schedule();
  DT.editAnswer(v,baseline,roundId).then(function(){
    editOpen=false;saving=false;editBlocked=false;draft='';baseline='';roundId='';notice='';
    refreshRoom();
  }).catch(function(e){
    saving=false;notice=e&&e.message||t('저장하지 못했어요. 다시 시도해 주세요.','Could not save your changes.');
    var msg=String(notice);
    if(/상대방|모두 도착|다른 대화|종료된 대화방|other person|already/i.test(msg))editBlocked=true;
    schedule();
    if(DT.refresh)DT.refresh().then(function(){if(state()&&String(state().round_id||'')===roundId)refreshRoom();else schedule()}).catch(function(){});
  });
},true);
new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
schedule();
})();
