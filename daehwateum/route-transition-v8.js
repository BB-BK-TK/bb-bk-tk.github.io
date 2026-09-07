(function(){'use strict';
var app=document.getElementById('app');if(!app)return;
var active=false,cover=null,startedAt=0,coreSeenAt=0,lastMutation=0,settleTimer=null,hardTimer=null,roomName='';
try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
function nativeTop(){try{if(window.AndroidDevice&&typeof AndroidDevice.scrollTop==='function')AndroidDevice.scrollTop()}catch(e){}}
function setTop(){try{window.scrollTo({left:0,top:0,behavior:'auto'})}catch(e){try{window.scrollTo(0,0)}catch(_e){}}[document.scrollingElement,document.documentElement,document.body].forEach(function(el){try{if(el)el.scrollTop=0}catch(e){}});nativeTop()}
function isHome(){return !!app.querySelector('.hero')}
function state(){try{return window.DT&&DT.state&&DT.state()}catch(e){return null}}
function coreReady(){return !isHome()&&!!app.querySelector('.top')&&!!app.querySelector('.q,.stage,.intro,.question-queue-screen')}
function premiumRoom(){var d=state();return !!(d&&(d.is_premium||Number(d.question_interval_hours)===3||Number(d.max_participants)>2))}
function queueSettled(){
  if(!premiumRoom()||!app.querySelector('.q')||app.querySelector('.question-queue-screen'))return true;
  var card=app.querySelector('.queue-summary-card');
  if(card)return card.hasAttribute('data-sig')||card.hasAttribute('data-queue-visual');
  var source=app.querySelector('.premium-tools [data-a="custom"]');
  if(source)return false;
  return coreSeenAt>0&&Date.now()-coreSeenAt>700;
}
function timingSettled(){var gate=app.querySelector('.next-gate');if(!gate)return true;if(gate.classList.contains('timing-ready'))return true;return coreSeenAt>0&&Date.now()-coreSeenAt>700}
function originSettled(){var d=state();if(!d||d.question_source!=='custom')return true;var revealed=false;try{revealed=!!(window.DT&&DT.revealed&&DT.revealed())}catch(e){}if(!revealed)return true;var el=app.querySelector('.question-origin');if(el&&el.classList.contains('revealed-origin'))return true;return coreSeenAt>0&&Date.now()-coreSeenAt>700}
function destinationSettled(){return coreReady()&&queueSettled()&&timingSettled()&&originSettled()&&Date.now()-lastMutation>=90}
function ensureStyle(){if(document.getElementById('dt-route-v8-style'))return;var s=document.createElement('style');s.id='dt-route-v8-style';s.textContent='.dt-route-v8-cover{position:fixed;inset:0;width:100%;height:100dvh;z-index:2147483647;background:#f6f1ea;overflow:hidden;pointer-events:auto;transform:translateZ(0);contain:strict}.dt-route-v8-inner{width:min(94%,760px);margin:0 auto;padding-bottom:40px}.native-app .dt-route-v8-inner{padding-top:30px}.dt-route-v8-head{min-height:68px;display:flex;align-items:center;font-weight:900;font-size:16px;color:#292521}.dt-route-v8-card{background:#fffdfa;border:1px solid #e5ddd3;border-radius:26px;padding:28px;margin-top:10px;min-height:190px}.dt-route-v8-k{height:9px;width:90px;border-radius:99px;background:#e5ddd3}.dt-route-v8-name{margin:18px 0 0;font-family:Georgia,"Noto Serif KR",serif;font-size:24px;font-weight:500;color:#292521}.dt-route-v8-line{height:14px;border-radius:99px;background:#e9e3dc;margin-top:18px;width:78%;animation:dtv8 1.05s ease-in-out infinite}.dt-route-v8-line.short{width:48%}.dt-route-v8-note{font-size:11px;color:#7b746c;margin-top:18px}@keyframes dtv8{0%,100%{opacity:.46}50%{opacity:.88}}';document.head.appendChild(s)}
function loaderMarkup(){var safe=roomName.replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]});return'<div class="w"><header class="top"><b class="brand">◉ 대화틈</b></header><section class="card stage" style="min-height:210px"><span class="k">대화를 여는 중</span>'+(safe?'<h2 style="margin-top:14px">'+safe+'</h2>':'')+'<p>잠시만 기다려주세요.</p></section></div>'}
function showCover(){ensureStyle();if(cover)return;var el=document.createElement('div');el.className='dt-route-v8-cover';el.setAttribute('aria-live','polite');el.setAttribute('aria-label','대화틈을 여는 중');var safe=roomName.replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]});el.innerHTML='<div class="dt-route-v8-inner"><div class="dt-route-v8-head">◉ 대화틈</div><section class="dt-route-v8-card"><div class="dt-route-v8-k"></div>'+(safe?'<h2 class="dt-route-v8-name">'+safe+'</h2>':'')+'<div class="dt-route-v8-line"></div><div class="dt-route-v8-line short"></div><p class="dt-route-v8-note">대화를 불러오는 중...</p></section></div>';document.body.appendChild(el);cover=el}
function cleanup(){if(settleTimer){clearTimeout(settleTimer);settleTimer=null}if(hardTimer){clearTimeout(hardTimer);hardTimer=null}if(cover){try{cover.remove()}catch(e){}cover=null}active=false;roomName=''}
function reveal(){if(!active||!coreReady())return;setTop();requestAnimationFrame(function(){setTop();cleanup()})}
function check(){if(!active)return;if(coreReady()&&!coreSeenAt)coreSeenAt=Date.now();if(destinationSettled()){reveal();return}if(settleTimer)clearTimeout(settleTimer);settleTimer=setTimeout(check,100)}
function begin(button){if(active)return;active=true;startedAt=Date.now();coreSeenAt=0;lastMutation=Date.now();var card=button&&button.closest?button.closest('.spacecard'):null;roomName=card&&card.querySelector('h3')?String(card.querySelector('h3').textContent||'').trim():'';showCover();app.innerHTML=loaderMarkup();setTop();hardTimer=setTimeout(function(){if(active&&coreReady())reveal();else cleanup()},2600);check()}
app.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-a="open-room"]');if(!b||!isHome()||active)return;Promise.resolve().then(function(){begin(b)})},true);
new MutationObserver(function(){if(!active)return;lastMutation=Date.now();if(coreReady()&&!coreSeenAt)coreSeenAt=Date.now();if(settleTimer)clearTimeout(settleTimer);settleTimer=setTimeout(check,100)}).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-sig','data-queue-visual','hidden']});
})();
