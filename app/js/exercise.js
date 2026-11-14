// 運動分頁（運動對話維護）— 目前是初版的簡單間歇計時，規格見 docs/exercise.md
function rEx(){
 const c=store.get('excfg',{work:20,rest:10,rounds:8});
 $('#view').innerHTML=`<h1>運動</h1><div class="card" style="display:block"><b>間歇計時（Tabata）</b>
 <div class="row">運動 <input id="ew" type="number" min="1" value="${c.work}"> 秒</div>
 <div class="row">休息 <input id="er" type="number" min="0" value="${c.rest}"> 秒</div>
 <div class="row">組數 <input id="en" type="number" min="1" value="${c.rounds}"></div>
 <button class="pri" id="ego">開始</button></div><p class="empty">自訂運動菜單還在製作中。</p>`;
 $('#ego').onclick=()=>{const cfg={work:+$('#ew').value||20,rest:+$('#er').value||0,rounds:+$('#en').value||1};store.set('excfg',cfg);startEx(cfg)};
}
function startEx(cfg){
 showPlay(isDark()?'#1C120E':'#FBEDE6',isDark()?'#F5C4B3':'#712B13');
 const c=$('#circle');c.style.transitionDuration='.4s';c.style.width=c.style.height='200px';
 let r=1,phase='work',left=cfg.work,done=0;
 const set=()=>{$('#pinfo').textContent=`第 ${r}/${cfg.rounds} 組`;$('#cstep').textContent=phase==='work'?'運動':'休息';c.style.background=phase==='work'?'#E8825E':'#F5C4B3';c.style.color=phase==='work'?'#fff':'#712B13';P.say(phase==='work'?'開始':'休息');P.buzz(200)};
 const end=(rounds)=>{const idx=addLog('ex','間歇計時',done,{rounds});hidePlay();c.style.color='';doneScreen('間歇計時',done,rounds+' 組',idx,()=>startEx(cfg))};
 const tick=()=>{if(play.paused)return play.timer=setTimeout(tick,300);
  $('#cnum').textContent=left;$('#ptime').textContent='';if(left<=3&&left>0)P.beep(520,.15);
  if(left===0){if(phase==='work'&&cfg.rest>0&&r<cfg.rounds){phase='rest';left=cfg.rest;set()}else if(r<cfg.rounds){r++;phase='work';left=cfg.work;set()}else{P.beep(660,.8);P.say('完成');return end(cfg.rounds)}}
  else{left--;done++}play.timer=setTimeout(tick,1000)};
 play.restart=()=>tick();play.end=()=>end(r-1);
 countdown(3,()=>{set();tick()});
}
registerTab('ex',rEx);
