(function(){'use strict';
var busy=false;
function langKo(){return (document.documentElement.lang||navigator.language||'ko').toLowerCase().indexOf('ko')===0}
function dayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function key(d){return window.DT&&DT.dayKey?DT.dayKey(d):d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parse(v){var d=window.DT&&DT.dateObj?DT.dateObj(v):(v?new Date(v):null);return d&&!isNaN(d.getTime())?dayStart(d):null}
function doneMap(D){var out={};(D.history||[]).forEach(function(x){var d=parse(x.completed_at);if(d)out[key(d)]=1});return out}
function conversationStart(D){var a=[],r=parse(D.round_created_at);if(r){if(!D.is_premium)r.setDate(r.getDate()-Math.max(0,parseInt(D.round_sequence||1,10)-1));a.push(r)}(D.history||[]).forEach(function(x){var d=parse(x.completed_at);if(d)a.push(d)});return a.length?new Date(Math.min.apply(null,a.map(function(d){return d.getTime()}))):dayStart(new Date())}
function freeWindow(D){var st=conversationStart(D),en=new Date(st);en.setDate(st.getDate()+6);return [st,en]}
function weekDates(D){var start=conversationStart(D),today=dayStart(new Date()),elapsed=Math.max(0,Math.floor((today-start)/86400000)),block=Math.floor(elapsed/7),st=new Date(start),out=[];st.setDate(start.getDate()+block*7);for(var i=0;i<7;i++){var d=new Date(st);d.setDate(st.getDate()+i);out.push(d)}return out}
function monthDates(){var now=new Date(),first=new Date(now.getFullYear(),now.getMonth(),1),last=new Date(now.getFullYear(),now.getMonth()+1,0),pad=(first.getDay()+6)%7,out=[];for(var p=0;p<pad;p++)out.push(null);for(var j=1;j<=last.getDate();j++)out.push(new Date(now.getFullYear(),now.getMonth(),j));return out}
function focusCalendar(cal){if(!cal)return;var rect=cal.getBoundingClientRect(),offset=Math.max(56,Math.min(96,window.innerHeight*.08)),top=Math.max(0,window.scrollY+rect.top-offset),reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;try{window.scrollTo({top:top,behavior:reduce?'auto':'smooth'})}catch(e){window.scrollTo(0,top)}}
function lockScrollAnchor(){document.documentElement.classList.add('calendar-scroll-lock')}
function unlockScrollAnchor(){document.documentElement.classList.remove('calendar-scroll-lock')}
function render(mode){var cal=document.querySelector('.cal'),D=window.DT&&DT.state&&DT.state();if(!cal||!D)return;var grid=cal.querySelector('.weekgrid,.monthgrid');if(!grid)return;var active=cal.querySelector('[data-a="cal-'+mode+'"]');if(active&&active.classList.contains('on'))return;
  var oldH=cal.getBoundingClientRect().height,done=doneMap(D),today=dayStart(new Date()),labels=langKo()?['월','화','수','목','금','토','일']:['M','T','W','T','F','S','S'],fw=!D.is_premium?freeWindow(D):null,dates=mode==='week'?weekDates(D):monthDates();
  busy=true;lockScrollAnchor();cal.classList.add('calendar-transitioning');cal.style.height=oldH+'px';cal.style.overflow='hidden';grid.classList.add('calendar-grid-out');
  setTimeout(function(){
    cal.querySelectorAll('.switch [data-a]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-a')==='cal-'+mode)});
    var weekdays=cal.querySelector('.weekdays');
    if(mode==='month'){
      if(!weekdays){weekdays=document.createElement('div');weekdays.className='weekdays';grid.parentNode.insertBefore(weekdays,grid)}
      weekdays.innerHTML=labels.map(function(x){return'<span>'+x+'</span>'}).join('');
    }else if(weekdays)weekdays.remove();
    grid.className=mode==='week'?'weekgrid':'monthgrid';
    var html='';dates.forEach(function(d){if(!d){html+='<span class="day blank"></span>';return}var k=key(d),isDone=!!done[k],isToday=k===key(today),outside=!!(fw&&(d<fw[0]||d>fw[1])),future=d>today;html+='<span class="day '+(outside?'outside ':'')+(isDone?'done ':'')+(isToday?'today ':'')+(future?'future ':'')+'"><small>'+(mode==='week'?labels[(d.getDay()+6)%7]:'')+'</small><b>'+d.getDate()+'</b><i>✓</i></span>'});
    grid.innerHTML=html;grid.classList.add('calendar-grid-in');
    var newH=cal.scrollHeight;cal.offsetHeight;cal.style.height=newH+'px';
    requestAnimationFrame(function(){grid.classList.remove('calendar-grid-in');grid.classList.remove('calendar-grid-out');if(mode==='month')focusCalendar(cal)});
    setTimeout(function(){cal.style.height='';cal.style.overflow='';cal.classList.remove('calendar-transitioning');busy=false;setTimeout(unlockScrollAnchor,120)},260);
  },70)
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.cal [data-a="cal-week"],.cal [data-a="cal-month"]');if(!b||busy)return;e.preventDefault();e.stopImmediatePropagation();render(b.getAttribute('data-a')==='cal-month'?'month':'week')},true);
})();