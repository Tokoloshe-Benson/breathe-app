// 習慣分頁（習慣對話維護）— 規格見 docs/habit.md
// 資料：
//  hb.habits  習慣清單 [{id, name, kind:'auto'|'check'|'count', src?:'breath'|'ex'|'st', ref?:指定項目id,
//             goal?:'once'|'min'|'times'（練習習慣的每日目標）, target?:次數或分鐘, freq:'daily'|'weekly', per?:每週幾天, color, hidden?}]
//  hb.marks   手動打勾／計次／補卡 { 'Y-M-D': { 習慣id: 次數 } }
// 練習習慣（kind 'auto'）依 LOG() 自動打勾：可以指定某個呼吸法／運動菜單／拉伸套組，目標可以是做一次、幾分鐘或幾次。
const HB={
 COL:{breath:'#7F77DD',ex:'#E8825E',st:'#5DCAA5'},
 TYPE:{breath:'呼吸',ex:'運動',st:'拉伸'},
 // 練習紀錄裡指向「哪一個項目」的欄位（各分頁 addLog 時存的）
 REFK:{breath:'breathId',ex:'routine',st:'routineId'},
 // 自訂習慣可選的顏色（避開呼吸靛紫、運動珊瑚橘、拉伸薄荷綠）
 PAL:['#888780','#378ADD','#D4537E','#BA7517','#8B6B4A','#5F5E5A'],
 DEF:[{id:'breath',name:'呼吸',kind:'auto',src:'breath',goal:'once',freq:'daily'},
  {id:'ex',name:'運動',kind:'auto',src:'ex',goal:'once',freq:'daily'},
  {id:'st',name:'拉伸',kind:'auto',src:'st',goal:'once',freq:'daily'}],
 BUILTIN:['breath','ex','st'],
 month:null,
 esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 key(t){const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()},
 habits(){const h=store.get('hb.habits',null);if(h)return h;store.set('hb.habits',HB.DEF);return HB.DEF.map(x=>({...x}))},
 saveHabits(h){store.set('hb.habits',h)},
 marks:()=>store.get('hb.marks',{}),
 color:h=>h.kind==='auto'?HB.COL[h.src]:(h.color||HB.PAL[0]),
 // 各分頁可以指定的項目 [[id, 名稱]]（讀各分頁自己的資料；分頁還沒載入時回傳空陣列）
 items(src){try{
  if(src==='breath'&&typeof B!=='undefined')return B.all().map(b=>[b.id,b.name]);
  if(src==='st'&&typeof ST!=='undefined')return ST.all().map(s=>[s.id,s.name]);
  if(src==='ex'&&typeof routines==='function')return routines().map(r=>[r.id,r.name||'未命名']);
 }catch(e){}return[]},
 itemName(h){const it=HB.items(h.src).find(x=>x[0]===h.ref);return it?it[1]:'（已刪除的項目）'},
 // 依日期分組的練習紀錄
 logDays(){const days={};LOG().forEach(e=>{(days[HB.key(e.t)]??=[]).push(e)});return days},
 match(h,e){return e.type===h.src&&(!h.ref||e[HB.REFK[h.src]]===h.ref)},
 need:h=>h.kind==='count'||(h.kind==='auto'&&h.goal&&h.goal!=='once')?(h.target||1):1,
 // 練習習慣當天的進度：做一次→0/1、幾次→次數、幾分鐘→分鐘數
 autoVal(h,k,ctx){const l=(ctx.days[k]||[]).filter(e=>HB.match(h,e));
  if(h.goal==='min')return Math.floor(l.reduce((s,e)=>s+(e.sec||0),0)/60);
  if(h.goal==='times')return l.length;return l.length?1:0},
 mark:(h,k,ctx)=>(ctx.marks[k]||{})[h.id]||0,
 done(h,k,ctx){if(h.kind==='auto')return HB.mark(h,k,ctx)>0||HB.autoVal(h,k,ctx)>=HB.need(h);return HB.mark(h,k,ctx)>=HB.need(h)},
 byLog:(h,k,ctx)=>h.kind==='auto'&&HB.autoVal(h,k,ctx)>=HB.need(h),
 setMark(id,k,n){const m=HB.marks();m[k]=m[k]||{};if(n>0)m[k][id]=n;else delete m[k][id];if(!Object.keys(m[k]).length)delete m[k];store.set('hb.marks',m)},
 addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x},
 weekStart(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x}, // 週一開始
 weekDone(h,ws,ctx){let n=0;for(let i=0;i<7;i++)if(HB.done(h,HB.key(HB.addDays(ws,i)),ctx))n++;return n},
 // 連續：每日習慣＝連續天數（今天還沒做就從昨天算起）；每週習慣＝連續達標週數（本週還沒達標就從上週算起）
 streak(h,ctx){let n=0;
  if(h.freq==='weekly'){const per=h.per||1;let ws=HB.weekStart(new Date());if(HB.weekDone(h,ws,ctx)<per)ws=HB.addDays(ws,-7);
   while(HB.weekDone(h,ws,ctx)>=per&&n<520){n++;ws=HB.addDays(ws,-7)}return n}
  let d=new Date();if(!HB.done(h,HB.key(d),ctx))d=HB.addDays(d,-1);
  while(HB.done(h,HB.key(d),ctx)&&n<3650){n++;d=HB.addDays(d,-1)}return n},
 // 某天做了哪些練習類型：有練習紀錄，或練習習慣有補卡
 typesOn(k,ctx){const s=new Set((ctx.days[k]||[]).map(e=>e.type));ctx.habits.forEach(h=>{if(h.kind==='auto'&&HB.mark(h,k,ctx))s.add(h.src)});return s},
 // 整體連續天數：呼吸／運動／拉伸任一種有做就算一天（含補卡）
 allStreak(ctx){let n=0,d=new Date();if(!HB.typesOn(HB.key(d),ctx).size)d=HB.addDays(d,-1);
  while(HB.typesOn(HB.key(d),ctx).size&&n<3650){n++;d=HB.addDays(d,-1)}return n},
 ctx(){return{habits:HB.habits(),marks:HB.marks(),days:HB.logDays()}},
};

// 一列習慣：今天清單與補卡共用
function hbRow(h,k,ctx,isToday){
 const ok=HB.done(h,k,ctx),col=HB.color(h),byLog=HB.byLog(h,k,ctx),need=HB.need(h);
 const parts=[];
 if(h.kind==='auto'){const v=HB.autoVal(h,k,ctx);
  if(h.goal==='min')parts.push(`${isToday?'今天 ':''}${v}/${need} 分鐘`);else if(h.goal==='times')parts.push(`${isToday?'今天 ':''}${v}/${need} 次`);
  if(!isToday&&h.goal!=='min'&&h.goal!=='times')parts.push(byLog?'有練習紀錄':'沒有練習紀錄，可以補打勾');
  if(!isToday&&!byLog&&HB.mark(h,k,ctx))parts.push('已補卡')}
 if(isToday){const s=HB.streak(h,ctx);
  parts.push(h.freq==='weekly'?`本週 ${HB.weekDone(h,HB.weekStart(new Date()),ctx)}/${h.per||1} 天・連續 ${s} 週`:`連續 ${s} 天`)}
 const go=isToday&&h.kind==='auto'&&!ok?`<button class="hbgo" data-a="go" aria-label="去練習${HB.esc(HB.TYPE[h.src])}">去練習</button>`:'';
 const right=h.kind==='count'
  ?`<span class="hbcnt"><button data-a="-" aria-label="減一">−</button><b>${HB.mark(h,k,ctx)}/${need}</b><button data-a="+" aria-label="加一">＋</button></span>`
  :`${go}<button class="hbchk${ok?' on':''}" data-a="t" aria-label="${ok?'取消打勾':'打勾'}" ${byLog?'disabled':''} style="--hc:${col}">${ok?'✓':''}</button>`;
 return `<div class="card hbrow${ok?' ok':''}" data-id="${HB.esc(h.id)}"><span class="hbdot" style="background:${col}"></span>
  <div class="hbname">${HB.esc(h.name)}<small>${parts.join('・')}</small></div>${right}</div>`;
}
function hbBindRows(root,k,ctx,again){
 root.querySelectorAll('.hbrow').forEach(r=>{const h=ctx.habits.find(x=>x.id===r.dataset.id);if(!h)return;
  r.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
   if(b.dataset.a==='go')return hbGo(h);
   const m=(HB.marks()[k]||{})[h.id]||0;
   if(b.dataset.a==='t')HB.setMark(h.id,k,m?0:1);
   else HB.setMark(h.id,k,Math.max(0,m+(b.dataset.a==='+'?1:-1)));
   const nc=HB.ctx();if(HB.done(h,k,nc)&&!HB.done(h,k,ctx)){P.beep(660,.15);P.buzz(30)}
   again()})});
}
// 去練習：切到該分頁；有指定項目時順便設成該分頁「上次使用」，讓快速開始直接是這一個
function hbGo(h){
 if(h.ref&&h.src==='breath')store.set('breath.last',h.ref);
 if(h.ref&&h.src==='st')store.set('st.last',h.ref);
 go(h.src);
}

function rHb(){
 const ctx=HB.ctx(),today=HB.key(Date.now()),vis=ctx.habits.filter(h=>!h.hidden);
 const doneN=vis.filter(h=>HB.done(h,today,ctx)).length,total=LOG().length;
 $('#view').innerHTML=`<h1>習慣<button id="gear" aria-label="設定">⚙️</button></h1>
 <div class="card"><div class="stat"><b>${HB.allStreak(ctx)}</b>連續天數</div><div class="stat"><b>${doneN}/${vis.length}</b>今日完成</div><div class="stat"><b>${total}</b>練習次數</div></div>
 <div class="hbhead"><b>今天</b><button id="hbmanage">管理習慣</button></div>
 <div id="hblist">${vis.map(h=>hbRow(h,today,ctx,true)).join('')||'<p class="empty">沒有顯示中的習慣<br>到「管理習慣」新增或開啟</p>'}</div>
 <div class="card" style="display:block">${hbCal(ctx)}</div>
 <button class="card hblink" id="hblog"><span>練習紀錄</span><small>看每次練習、補選心情 ›</small></button>`;
 $('#gear').onclick=rSettings;
 $('#hbmanage').onclick=hbManage;
 $('#hblog').onclick=()=>openLog(rHb);
 hbBindRows($('#hblist'),today,ctx,rHb);
 hbBindCal();
}

// 月曆：三色點＝呼吸／運動／拉伸，灰點＝當天有完成自訂習慣；點過去的日子可以補卡
function hbCal(ctx){
 const now=new Date();HB.month=HB.month||new Date(now.getFullYear(),now.getMonth(),1);
 const y=HB.month.getFullYear(),m=HB.month.getMonth(),first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
 const tk=HB.key(now),cust=ctx.habits.filter(h=>h.kind!=='auto'&&!h.hidden);
 let cal='';for(let i=0;i<first;i++)cal+='<span></span>';
 for(let i=1;i<=n;i++){const d=new Date(y,m,i),k=HB.key(d),fut=d>now,ty=HB.typesOn(k,ctx);
  const dots=['breath','ex','st'].filter(t=>ty.has(t)).map(t=>`<span style="background:${HB.COL[t]}"></span>`).join('')
   +(cust.some(h=>HB.done(h,k,ctx))?'<span style="background:var(--muted)"></span>':'');
  cal+=`<button class="hbday${k===tk?' today':''}" data-k="${k}" ${fut?'disabled':''}>${i}<div class="dots">${dots}</div></button>`}
 const atNow=y===now.getFullYear()&&m===now.getMonth();
 return `<div class="hbmonth"><button id="hbprev" aria-label="上個月">‹</button><b>${y} 年 ${m+1} 月</b><button id="hbnext" aria-label="下個月" ${atNow?'disabled':''}>›</button></div>
 <div class="cal" style="margin-top:8px">${'日一二三四五六'.split('').map(x=>`<span style="color:var(--muted)">${x}</span>`).join('')}${cal}</div>
 <small class="hbhint">點日期可以補打勾</small>`;
}
function hbBindCal(){
 $('#hbprev').onclick=()=>{HB.month=new Date(HB.month.getFullYear(),HB.month.getMonth()-1,1);rHb()};
 $('#hbnext').onclick=()=>{HB.month=new Date(HB.month.getFullYear(),HB.month.getMonth()+1,1);rHb()};
 $('#view').querySelectorAll('.hbday').forEach(b=>b.onclick=()=>hbDay(b.dataset.k));
}

// 補卡：某一天的打勾頁（也列出那天做過的練習）
function hbDay(k){
 const ctx=HB.ctx(),[y,mo,d]=k.split('-').map(Number),wk='日一二三四五六'[new Date(y,mo-1,d).getDay()];
 const isToday=k===HB.key(Date.now()),vis=ctx.habits.filter(h=>!h.hidden),logs=ctx.days[k]||[];
 $('#view').innerHTML=`<h1>${mo}/${d}（${wk}）<button id="hbback">返回</button></h1>
 <p class="hbnote">${isToday?'今天的打勾。':'補打勾：例如那天有做，但忘了打開 App。'}練習習慣有練習紀錄的話會自動打勾。</p>
 <div id="hblist">${vis.map(h=>hbRow(h,k,ctx,false)).join('')}</div>
 ${logs.length?`<div class="hbhead"><b>這天的練習</b></div>${logs.map(e=>{const t=new Date(e.t);
  return `<div class="card hbrow"><span class="hbdot" style="background:${HB.COL[e.type]||'var(--muted)'}"></span><div class="hbname">${HB.esc(e.name)}<small>${HB.TYPE[e.type]||''}・${t.getHours()}:${String(t.getMinutes()).padStart(2,'0')}・${fmt(e.sec||0)}</small></div>${e.mood?moodImg(e.mood,26):''}</div>`}).join('')}`:''}`;
 $('#hbback').onclick=rHb;
 hbBindRows($('#hblist'),k,ctx,()=>hbDay(k));
}

// 管理習慣：新增／編輯／隱藏／刪除
function hbManage(){
 const hs=HB.habits();
 $('#view').innerHTML=`<h1>管理習慣<button id="hbback">完成</button></h1>
 ${hs.map(h=>`<div class="card hbm" data-id="${HB.esc(h.id)}"><span class="hbdot" style="background:${HB.color(h)}"></span>
  <div class="hbname">${HB.esc(h.name)}${h.hidden?'（隱藏）':''}<small>${HB.esc(hbDesc(h))}</small></div><button data-e>編輯</button></div>`).join('')}
 <button class="pri" id="hbadd" style="width:100%;margin-top:8px">＋ 新增習慣</button>`;
 $('#hbback').onclick=rHb;
 $('#hbadd').onclick=()=>hbEdit(null);
 $('#view').querySelectorAll('.hbm [data-e]').forEach(b=>b.onclick=()=>hbEdit(b.closest('.hbm').dataset.id));
}
function hbGoalText(h){return h.goal==='min'?`每天 ${h.target||1} 分鐘`:h.goal==='times'?`每天 ${h.target||1} 次`:'做一次就打勾'}
function hbDesc(h){
 const f=h.freq==='weekly'?`每週 ${h.per||1} 天`:'每天';
 if(h.kind==='auto')return `${HB.TYPE[h.src]}${h.ref?'：'+HB.itemName(h):''}・${hbGoalText(h)}・${f}`;
 return (h.kind==='count'?`計次・目標 ${h.target||1} 次`:'有做／沒做')+'・'+f;
}
function hbEdit(id){
 const hs=HB.habits(),old=hs.find(h=>h.id===id);
 const h=old?{...old}:{id:'c'+Date.now(),name:'',kind:'check',freq:'daily',per:3,target:8,color:HB.PAL[0],src:'breath',goal:'once'};
 const builtin=HB.BUILTIN.includes(h.id),v=$('#view');
 const sel=(attr,list,cur)=>`<div class="row">${list.map(([k,t])=>`<button data-${attr}="${k}" class="${cur===k?'pri':''}">${t}</button>`).join('')}</div>`;
 const draw=()=>{
  const auto=h.kind==='auto',its=auto?HB.items(h.src):[];
  v.innerHTML=`<h1>${old?'編輯習慣':'新增習慣'}<button id="hbcancel">取消</button></h1>
  <div class="card hbform" style="display:block">
   <label>名稱<input id="hbn" value="${HB.esc(h.name)}" placeholder="${auto?'睡前 4-7-8':'喝水'}" ${builtin?'disabled':''} maxlength="20"></label>
   ${builtin?'<small>依練習紀錄自動打勾。可以改目標、頻率或隱藏。</small>':
   `<div class="hbf">方式${sel('kind',old&&old.kind==='auto'?[['auto','練習']]:old?[['check','有做／沒做'],['count','計次']]:[['check','有做／沒做'],['count','計次'],['auto','練習']],h.kind)}</div>`}
   ${auto&&!builtin?`<div class="hbf">類別${sel('src',[['breath','呼吸'],['ex','運動'],['st','拉伸']],h.src)}</div>
    <label>項目<select id="hbref"><option value="">任何${HB.TYPE[h.src]}都算</option>${its.map(([k,t])=>`<option value="${HB.esc(k)}" ${h.ref===k?'selected':''}>${HB.esc(t)}</option>`).join('')}
     ${h.ref&&!its.some(x=>x[0]===h.ref)?`<option value="${HB.esc(h.ref)}" selected>（已刪除的項目）</option>`:''}</select></label>`:''}
   ${auto?`<div class="hbf">每天目標${sel('goal',[['once','做一次'],['min','幾分鐘'],['times','幾次']],h.goal||'once')}</div>
    <label id="hbtw" style="${h.goal==='min'||h.goal==='times'?'':'display:none'}">目標<span><input id="hbt" type="number" min="1" max="${h.goal==='min'?300:20}" value="${h.target||(h.goal==='min'?10:2)}"> ${h.goal==='min'?'分鐘':'次'}</span></label>`
   :`<label id="hbtw" style="${h.kind==='count'?'':'display:none'}">每天目標<span><input id="hbt" type="number" min="1" max="99" value="${h.target||8}"> 次</span></label>`}
   <div class="hbf">頻率${sel('freq',[['daily','每天'],['weekly','每週幾天']],h.freq)}</div>
   <label id="hbpw" style="${h.freq==='weekly'?'':'display:none'}">每週<span><input id="hbp" type="number" min="1" max="7" value="${h.per||3}"> 天</span></label>
   ${auto?'':`<div class="hbf">顏色<div class="row">${HB.PAL.map(c=>`<button class="hbsw${h.color===c?' on':''}" data-c="${c}" style="background:${c}" aria-label="顏色"></button>`).join('')}</div></div>`}
   <label class="hbchkl"><input id="hbh" type="checkbox" ${h.hidden?'checked':''}> 在今天清單隱藏</label>
   <p id="hberr" class="hberr"></p>
  </div>
  <div class="row"><button class="pri" id="hbsave">儲存</button>${old&&!builtin?'<button id="hbdel">刪除</button>':''}</div>`;
  bind()};
 // 重畫前先把輸入框的值存回 h
 const keep=()=>{if($('#hbn')&&!builtin)h.name=$('#hbn').value;if($('#hbref'))h.ref=$('#hbref').value||undefined;
  if($('#hbt'))h.target=parseInt($('#hbt').value)||h.target;if($('#hbp'))h.per=parseInt($('#hbp').value)||h.per;h.hidden=$('#hbh').checked};
 const bind=()=>{
  $('#hbcancel').onclick=hbManage;
  v.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{keep();h.kind=b.dataset.kind;h.target=h.kind==='count'?8:h.target;draw()});
  v.querySelectorAll('[data-src]').forEach(b=>b.onclick=()=>{keep();h.src=b.dataset.src;h.ref=undefined;draw()});
  v.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{keep();if(h.goal!==b.dataset.goal)h.target=b.dataset.goal==='min'?10:2;h.goal=b.dataset.goal;draw()});
  v.querySelectorAll('[data-freq]').forEach(b=>b.onclick=()=>{h.freq=b.dataset.freq;v.querySelectorAll('[data-freq]').forEach(x=>x.classList.toggle('pri',x===b));$('#hbpw').style.display=h.freq==='weekly'?'':'none'});
  v.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{h.color=b.dataset.c;v.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('on',x===b))});
  $('#hbn').oninput=()=>{$('#hberr').textContent=''};
  $('#hbsave').onclick=save;
  if($('#hbdel'))$('#hbdel').onclick=del};
 const save=()=>{keep();
  if(!builtin){h.name=h.name.trim();
   if(!h.name&&h.kind==='auto')h.name=h.ref?HB.itemName(h):HB.TYPE[h.src];
   if(!h.name){$('#hberr').textContent='請輸入名稱';$('#hbn').focus();return}}
  if(h.kind==='auto'){if(h.goal==='once')delete h.target;else h.target=Math.min(h.goal==='min'?300:20,Math.max(1,h.target||1));delete h.color}
  else{delete h.src;delete h.ref;delete h.goal;if(h.kind==='count')h.target=Math.min(99,Math.max(1,h.target||1));else delete h.target}
  if(h.freq==='weekly')h.per=Math.min(7,Math.max(1,h.per||1));
  const list=HB.habits(),i=list.findIndex(x=>x.id===h.id);if(i<0)list.push(h);else list[i]=h;HB.saveHabits(list);hbManage()};
 const del=()=>{
  if(!confirm(`刪除「${h.name}」？這個習慣的打勾紀錄也會一起刪除，無法復原。（練習紀錄不會被刪）`))return;
  HB.saveHabits(HB.habits().filter(x=>x.id!==h.id));
  const m=HB.marks();Object.keys(m).forEach(k=>{delete m[k][h.id];if(!Object.keys(m[k]).length)delete m[k]});store.set('hb.marks',m);hbManage()};
 draw();
}
registerTab('hb',rHb);
