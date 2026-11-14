// 呼吸分頁（呼吸對話維護）
const BREATHS=[
{id:'box',name:'箱式呼吸',steps:[['in',4],['hold',4],['out',4],['hold',4]]},
{id:'478',name:'4-7-8 呼吸',steps:[['in',4],['hold',7],['out',8]]},
{id:'res',name:'共振呼吸',steps:[['in',6],['out',6]]},
{id:'calm',name:'舒緩呼吸',steps:[['in',4],['out',6]]}];
const STEP={in:'吸氣',hold:'停住',out:'吐氣'};
function rBreath(){
 const mins=store.get('bmins',{});
 $('#view').innerHTML='<h1>呼吸</h1>'+BREATHS.map(b=>`<div class="card"><div>${b.name}<small>${b.steps.map(s=>STEP[s[0]][0]+' '+s[1]).join('・')}</small></div>
 <div class="row"><select data-id="${b.id}">${[1,3,5,10].map(m=>`<option ${ (mins[b.id]||3)==m?'selected':''}>${m}</option>`).join('')}</select>分
 <button class="pri" data-go="${b.id}">開始</button></div></div>`).join('');
 $('#view').querySelectorAll('[data-go]').forEach(btn=>btn.onclick=()=>{const b=BREATHS.find(x=>x.id===btn.dataset.go);const m=+$(`select[data-id="${b.id}"]`).value;mins[b.id]=m;store.set('bmins',mins);startBreath(b,m)});
}
function startBreath(b,mins){
 showPlay(isDark()?'#110F24':'#2E2966','#EEEDFE');$('#play').classList.add('breath');
 const total=mins*60;let done=0,cycles=0;const st=$('#bstage');
 const size=(s,d)=>{st.style.setProperty('--s',s);st.style.setProperty('--d',d+'s')};
 $('#pinfo').textContent=b.name;
 const cyc=()=>{let i=0;const step=()=>{
   if(i>=b.steps.length){cycles++;if(done>=total)return finish();return cyc()}
   const[k,sec]=b.steps[i];st.classList.toggle('hold',k==='hold');
   if(k==='in')size(.88,sec);else if(k==='out')size(.42,sec);
   $('#bstep').textContent=STEP[k];P.say(STEP[k]);P.buzz();
   let left=sec;const tick=()=>{if(play.paused)return play.timer=setTimeout(tick,300);
     if(left===0){i++;return step()}
     $('#bnum').textContent=left;$('#ptime').textContent='剩餘 '+fmt(Math.max(0,total-done));
     left--;done++;play.timer=setTimeout(tick,1000)};tick()};step()};
 const end=()=>{const idx=addLog('breath',b.name,done,{cycles});hidePlay();st.classList.remove('hold');doneScreen(b.name,done,cycles+' 個循環',idx,()=>startBreath(b,mins))};
 const finish=()=>{P.beep(660,.8);P.say('結束');end()};
 play.restart=()=>{st.classList.remove('hold');size(.42,1.2);countdown(3,cyc,true)};
 play.end=end;
 st.classList.remove('hold');size(.42,0);$('#ptime').textContent='';
 countdown(3,cyc,true);
}
registerTab('breath',rBreath);
