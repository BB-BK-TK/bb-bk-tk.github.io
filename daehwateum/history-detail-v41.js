(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var overlayId='history-detail-overlay',returnY=0,returnFocus=null;
function isKo(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function copy(){return isKo()?{back:'지난 대화',view:'답변 다시 보기',mine:'나의 답변',answerSuffix:'의 답변',dialog:'지난 대화 답변'}:{back:'Past conversations',view:'View answers',mine:'My answer',answerSuffix:"'s answer",dialog:'Past conversation answers'}}
function cleanName(raw){return String(raw||'').replace(/\s*·\s*(?:나|Me)\s*$/i,'').trim()}
function isMine(raw){return /\s*·\s*(?:나|Me)\s*$/i.test(String(raw||''))}
function initial(name){var s=String(name||'').trim();return s?s.charAt(0).toUpperCase():'·'}
function detailData(item){
  var summary=item&&item.querySelector('summary'),q=summary&&summary.querySelector('.hist-question'),day=item&&item.closest('.hist-day'),head=day&&day.querySelector('.hist-day-head b');
  var question=(q&&q.textContent||summary&&summary.dataset.historyQuestion||'').trim();
  var date=(head&&head.textContent||'').trim();
  var group=item&&item.querySelector('.history-group'),answers=[];
  if(group)Array.prototype.forEach.call(group.children,function(row){
    var small=row.querySelector('small'),p=row.querySelector('p'),raw=(small&&small.textContent||'').trim();
    answers.push({name:cleanName(raw),mine:isMine(raw),text:(p&&p.textContent||'').trim()});
  });
  return{question:question,date:date,answers:answers};
}
function answerCard(a,c){
  var article=document.createElement('article');article.className='history-detail-answer '+(a.mine?'mine':'other');
  var header=document.createElement('header'),av=document.createElement('span'),label=document.createElement('b'),p=document.createElement('p');
  av.className='history-detail-avatar';av.textContent=initial(a.mine?(isKo()?'나':'M'):a.name);
  label.textContent=a.mine?c.mine:((a.name||(isKo()?'상대':'Other'))+c.answerSuffix);
  p.textContent=a.text;
  header.appendChild(av);header.appendChild(label);article.appendChild(header);article.appendChild(p);return article;
}
function closeDetail(){
  var overlay=document.getElementById(overlayId);if(!overlay)return false;
  overlay.remove();document.body.classList.remove('history-detail-open');
  try{window.scrollTo({left:0,top:returnY,behavior:'auto'})}catch(e){window.scrollTo(0,returnY)}
  if(returnFocus&&document.contains(returnFocus)){try{returnFocus.focus({preventScroll:true})}catch(e){try{returnFocus.focus()}catch(_e){}}}
  returnFocus=null;return true;
}
function openDetail(item){
  if(!item)return;closeDetail();
  var c=copy(),d=detailData(item);if(!d.question)return;
  returnY=window.scrollY||window.pageYOffset||0;returnFocus=item.querySelector('summary');item.open=false;
  var overlay=document.createElement('div');overlay.id=overlayId;overlay.className='history-detail-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',c.dialog);
  var sheet=document.createElement('div');sheet.className='history-detail-sheet';
  var nav=document.createElement('header');nav.className='history-detail-nav';
  var back=document.createElement('button');back.type='button';back.className='history-detail-back';back.setAttribute('aria-label',c.back);back.innerHTML='<span aria-hidden="true">‹</span><b></b>';back.querySelector('b').textContent=c.back;
  nav.appendChild(back);sheet.appendChild(nav);
  var main=document.createElement('main');main.className='history-detail-main';
  if(d.date){var date=document.createElement('p');date.className='history-detail-date';date.textContent=d.date;main.appendChild(date)}
  var question=document.createElement('section');question.className='history-detail-question';var h=document.createElement('h1');h.textContent=d.question;question.appendChild(h);main.appendChild(question);
  var answers=document.createElement('section');answers.className='history-detail-answers';d.answers.forEach(function(a){answers.appendChild(answerCard(a,c))});main.appendChild(answers);
  sheet.appendChild(main);overlay.appendChild(sheet);document.body.appendChild(overlay);document.body.classList.add('history-detail-open');overlay.scrollTop=0;
  back.addEventListener('click',closeDetail);requestAnimationFrame(function(){try{back.focus({preventScroll:true})}catch(e){}});
}
function decorateItem(item){
  if(!item||item.dataset.historyDetailV41==='1')return;var summary=item.querySelector('summary');if(!summary)return;
  item.dataset.historyDetailV41='1';item.open=false;
  var q=summary.querySelector('.hist-question');summary.dataset.historyQuestion=(q&&q.textContent||summary.textContent||'').trim();summary.setAttribute('aria-haspopup','dialog');
  var label=document.createElement('span');label.className='hist-open-label';label.textContent=copy().view+' ›';summary.appendChild(label);
}
function decorate(){Array.prototype.forEach.call(app.querySelectorAll('.hist-day details.item'),decorateItem)}
app.addEventListener('click',function(e){var summary=e.target.closest&&e.target.closest('.hist-day details.item > summary');if(!summary)return;e.preventDefault();e.stopPropagation();openDetail(summary.parentElement)},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.getElementById(overlayId)){e.preventDefault();closeDetail()}},true);
var previousBack=window.DaehwateumBack;window.DaehwateumBack=function(){if(document.getElementById(overlayId)){closeDetail();return true}if(typeof previousBack==='function'){try{return !!previousBack()}catch(e){return false}}return false};
var style=document.createElement('style');style.id='history-detail-v41-style';style.textContent='body.history-detail-open{overflow:hidden}.hist-day details.item>summary{list-style:none;cursor:pointer}.hist-day details.item>summary::-webkit-details-marker{display:none}.hist-day details.item>.history-group{display:none!important}.hist-day details.item>summary .hist-question{flex:1 1 auto}.hist-open-label{flex:0 0 auto;margin-left:auto;padding-left:10px;color:var(--g);font-size:10px;font-weight:900;white-space:nowrap}.history-detail-overlay{position:fixed;inset:0;z-index:10000;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:var(--b,#f6f1ea);color:var(--i,#292521)}.history-detail-sheet{width:min(100%,760px);min-height:100%;margin:0 auto;padding:0 18px 56px}.history-detail-nav{position:sticky;top:0;z-index:2;min-height:66px;display:flex;align-items:center;background:rgba(246,241,234,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}.history-detail-back{display:flex;align-items:center;gap:6px;border:0;background:transparent;color:var(--i);padding:10px 8px 10px 0;font-size:14px}.history-detail-back span{font-size:32px;font-weight:300;line-height:.7}.history-detail-back b{font-size:14px}.history-detail-main{max-width:620px;margin:0 auto;padding-top:18px}.history-detail-date{margin:0 2px 18px;color:var(--m);font-size:13px;font-weight:800}.history-detail-question{padding:24px 22px;border:1px solid var(--l);border-radius:24px;background:var(--p);box-shadow:0 16px 44px #4a3b2e0c}.history-detail-question h1{margin:0;font-size:clamp(28px,6vw,38px);line-height:1.28}.history-detail-answers{display:grid;gap:14px;margin-top:26px}.history-detail-answer{padding:20px;border:1px solid var(--l);border-radius:20px;background:var(--p)}.history-detail-answer.mine{background:#edf3ee}.history-detail-answer.other{background:#f7e9e1}.history-detail-answer header{display:flex;align-items:center;gap:9px;margin-bottom:11px}.history-detail-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--g);color:#fff;font-size:11px;font-weight:900}.history-detail-answer.other .history-detail-avatar{background:#efc3ae;color:#624338}.history-detail-answer header b{font-size:13px}.history-detail-answer p{margin:0;color:var(--i);font-size:14px;line-height:1.75;white-space:pre-wrap}@media(max-width:600px){.hist-day details.item>summary{align-items:center}.hist-open-label{font-size:10px}.history-detail-sheet{padding-left:16px;padding-right:16px}.history-detail-main{padding-top:10px}.history-detail-question{padding:22px 18px;border-radius:20px}.history-detail-question h1{font-size:29px}.history-detail-answer{padding:18px 16px;border-radius:18px}}';document.head.appendChild(style);
new MutationObserver(function(){requestAnimationFrame(decorate)}).observe(app,{childList:true,subtree:true});decorate();
})();
