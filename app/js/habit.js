// 習慣分頁（習慣對話維護）— 規格見 docs/habit.md
// 資料：
//  hb.habits  習慣清單 [{id, name, kind:'auto'|'check'|'count', src?:'breath'|'ex'|'st', target?:次數, freq:'daily'|'weekly', per?:每週幾天, color, hidden?}]
//  hb.marks   手動打勾／計次／補卡 { 'Y-M-D': { 習慣id: 次數 } }
// 呼吸／運動／拉伸（kind 'auto'）依 LOG() 自動打勾，也可以手動補卡。
const HB={
 COL:{breath:'#7F77DD',ex:'#E8825E',st:'#5DCAA5'},
 // 自訂習慣可選的顏色（避開呼吸靛紫、運動珊瑚橘、拉伸薄荷綠）
 PAL:['#888780','#378ADD','#D4537E','#BA7517','#8B6B4A','#5F5E5A'],
 DEF:[{id:'breath',name:'呼吸',kind:'auto',src:'breath',freq:'daily'},
  {id:'ex',name:'運動',kind:'auto',src:'ex',freq:'daily'},
  {id:'st',name:'拉伸',kind:'auto',src:'st',freq:'daily'}],
 month:null,edit:null,
 esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 key(t){const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()},
 habits(){const h=store.get('hb.habits',null);if(h)return h;store.set('hb.habits',HB.DEF);return HB.DEF.map(x=>({...x}))},
 saveHabits(h){store.set('hb.habits',h)},
 marks:()=>store.get('hb.marks',{}),
 color:h=>h.kind==='auto'?HB.COL[h.src]:(h.color||HB.PAL[0]),
 // 某天有哪些練習類型（依練習紀錄）
 logDays(){const days={};LOG().forEach(e=>{(days[HB.key(e.t)]??=new Set()).add(e.type)});return days},
 count(h,k,ctx){const m=(ctx.marks[k]||{})[h.id]||0;if(h.kind==='auto')return Math.max(m,ctx.days[k]?.has(h.src)?1:0);return m},
 done(h,k,ctx){return HB.count(h,k,ctx)>=(h.kind==='count'?(h.target||1):1)},
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
 // 整體連續天數：呼吸／運動／拉伸任一種有做就算一天（含補卡）
 allStreak(ctx){const auto=ctx.habits.filter(h=>h.kind==='auto');const any=k=>auto.some(h=>HB.done(h,k,ctx));
  let n=0,d=new Date();if(!any(HB.key(d)))d=HB.addDays(d,-1);while(any(HB.key(d))&&n<3650){n++;d=HB.addDays(d,-1)}return n},
 ctx(){const habits=HB.habits();return{habits,marks:HB.marks(),days:HB.logDays()}},
};

// 一列習慣：今天清單與補卡共用
function hbRow(h,k,ctx,isToday){
 const c=HB.count(h,k,ctx),ok=HB.done(h,k,ctx),col=HB.color(h),auto=h.kind==='auto'&&ctx.days[k]?.has(h.src);
 let sub='';
 if(isToday){const s=HB.streak(h,ctx);
  sub=h.freq==='weekly'?`本週 ${HB.weekDone(h,HB.weekStart(new Date()),ctx)}/${h.per||1} 天・連續 ${s} 週`:`連續 ${s} 天`}
 else sub=auto?'有練習紀錄':(h.kind==='auto'?'沒有練習紀錄，可以補打勾':'');
 const right=h.kind==='count'
  ?`<span class="hbcnt"><button data-a="-" aria-label="減一">−</button><b>${c}/${h.target||1}</b><button data-a="+" aria-label="加一">＋</button></span>`
  :`<button class="hbchk${ok?' on':''}" data-a="t" aria-label="${ok?'取消打勾':'打勾'}" ${auto?'disabled':''} style="--hc:${col}">${ok?'✓':''}</button>`;
 return `<div class="card hbrow${ok?' ok':''}" data-id="${HB.esc(h.id)}"><span class="hbdot" style="background:${col}"></span>
  <div class="hbname">${HB.esc(h.name)}<small>${sub}</small></div>${right}</div>`;
}
function hbBindRows(root,k,ctx,again){
 root.querySelectorAll('.hbrow').forEach(r=>{const h=ctx.habits.find(x=>x.id===r.dataset.id);if(!h)return;
  r.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
   const m=(HB.marks()[k]||{})[h.id]||0;
   if(b.dataset.a==='t')HB.setMark(h.id,k,m?0:1);
   else HB.setMark(h.id,k,Math.max(0,m+(b.dataset.a==='+'?1:-1)));
   const nc=HB.ctx();if(HB.done(h,k,nc)&&!HB.done(h,k,ctx)){P.beep(660,.15);P.buzz(30)}
   again()})});
}

function rHb(){
 HB.edit=null;
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
 for(let i=1;i<=n;i++){const d=new Date(y,m,i),k=HB.key(d),fut=d>now;
  const dots=ctx.habits.filter(h=>h.kind==='auto'&&HB.done(h,k,ctx)).map(h=>`<span style="background:${HB.COL[h.src]}"></span>`).join('')
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

// 補卡：某一天的打勾頁
function hbDay(k){
 const ctx=HB.ctx(),[y,mo,d]=k.split('-').map(Number),wk='日一二三四五六'[new Date(y,mo-1,d).getDay()];
 const isToday=k===HB.key(Date.now()),vis=ctx.habits.filter(h=>!h.hidden);
 $('#view').innerHTML=`<h1>${mo}/${d}（${wk}）<button id="hbback">返回</button></h1>
 <p class="hbnote">${isToday?'今天的打勾。':'補打勾：例如那天有做，但忘了打開 App。'}呼吸、運動、拉伸有練習紀錄的話會自動打勾。</p>
 <div id="hblist">${vis.map(h=>hbRow(h,k,ctx,false)).join('')}</div>`;
 $('#hbback').onclick=rHb;
 hbBindRows($('#hblist'),k,ctx,()=>hbDay(k));
}

// 管理習慣：新增／編輯／隱藏／刪除
function hbManage(){
 const hs=HB.habits();
 $('#view').innerHTML=`<h1>管理習慣<button id="hbback">完成</button></h1>
 ${hs.map(h=>`<div class="card hbm" data-id="${HB.esc(h.id)}"><span class="hbdot" style="background:${HB.color(h)}"></span>
  <div class="hbname">${HB.esc(h.name)}${h.hidden?'（隱藏）':''}<small>${hbDesc(h)}</small></div><button data-e>編輯</button></div>`).join('')}
 <button class="pri" id="hbadd" style="width:100%;margin-top:8px">＋ 新增習慣</button>`;
 $('#hbback').onclick=rHb;
 $('#hbadd').onclick=()=>hbEdit(null);
 $('#view').querySelectorAll('.hbm [data-e]').forEach(b=>b.onclick=()=>hbEdit(b.closest('.hbm').dataset.id));
}
function hbDesc(h){
 const f=h.freq==='weekly'?`每週 ${h.per||1} 天`:'每天';
 return (h.kind==='auto'?'練習完自動打勾':h.kind==='count'?`計次・目標 ${h.target||1} 次`:'有做／沒做')+'・'+f;
}
function hbEdit(id){
 const hs=HB.habits(),old=hs.find(h=>h.id===id);
 const h=HB.edit=old?{...old}:{id:'c'+Date.now(),name:'',kind:'check',freq:'daily',per:3,target:8,color:HB.PAL[0]};
 const auto=h.kind==='auto';
 $('#view').innerHTML=`<h1>${old?'編輯習慣':'新增習慣'}<button id="hbcancel">取消</button></h1>
 <div class="card hbform" style="display:block">
  <label>名稱<input id="hbn" value="${HB.esc(h.name)}" placeholder="喝水" ${auto?'disabled':''} maxlength="20"></label>
  ${auto?'<small>呼吸、運動、拉伸會依練習紀錄自動打勾，只能改目標頻率或隱藏。</small>':`
  <div class="hbf">方式<div class="row">${[['check','有做／沒做'],['count','計次']].map(([k,t])=>`<button data-kind="${k}" class="${h.kind===k?'pri':''}">${t}</button>`).join('')}</div></div>
  <label id="hbtw" style="${h.kind==='count'?'':'display:none'}">每天目標<span><input id="hbt" type="number" min="1" max="99" value="${h.target||8}"> 次</span></label>`}
  <div class="hbf">頻率<div class="row">${[['daily','每天'],['weekly','每週幾天']].map(([k,t])=>`<button data-freq="${k}" class="${h.freq===k?'pri':''}">${t}</button>`).join('')}</div></div>
  <label id="hbpw" style="${h.freq==='weekly'?'':'display:none'}">每週<span><input id="hbp" type="number" min="1" max="7" value="${h.per||3}"> 天</span></label>
  ${auto?'':`<div class="hbf">顏色<div class="row">${HB.PAL.map(c=>`<button class="hbsw${h.color===c?' on':''}" data-c="${c}" style="background:${c}" aria-label="顏色"></button>`).join('')}</div></div>`}
  <label class="hbchkl"><input id="hbh" type="checkbox" ${h.hidden?'checked':''}> 在今天清單隱藏</label>
  <p id="hberr" class="hberr"></p>
 </div>
 <div class="row"><button class="pri" id="hbsave">儲存</button>${old&&!auto?'<button id="hbdel">刪除</button>':''}</div>`;
 const v=$('#view');
 $('#hbcancel').onclick=hbManage;
 v.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{h.kind=b.dataset.kind;v.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('pri',x===b));$('#hbtw').style.display=h.kind==='count'?'':'none'});
 v.querySelectorAll('[data-freq]').forEach(b=>b.onclick=()=>{h.freq=b.dataset.freq;v.querySelectorAll('[data-freq]').forEach(x=>x.classList.toggle('pri',x===b));$('#hbpw').style.display=h.freq==='weekly'?'':'none'});
 v.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{h.color=b.dataset.c;v.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('on',x===b))});
 if($('#hbn'))$('#hbn').oninput=()=>{$('#hberr').textContent=''};
 $('#hbsave').onclick=()=>{
  if(!auto){h.name=$('#hbn').value.trim();if(!h.name){$('#hberr').textContent='請輸入名稱';$('#hbn').focus();return}
   if(h.kind==='count')h.target=Math.min(99,Math.max(1,parseInt($('#hbt').value)||1))}
  if(h.freq==='weekly')h.per=Math.min(7,Math.max(1,parseInt($('#hbp').value)||1));
  h.hidden=$('#hbh').checked;
  const list=HB.habits(),i=list.findIndex(x=>x.id===h.id);if(i<0)list.push(h);else list[i]=h;HB.saveHabits(list);hbManage()};
 if($('#hbdel'))$('#hbdel').onclick=()=>{
  if(!confirm(`刪除「${h.name}」？這個習慣的打勾紀錄也會一起刪除，無法復原。`))return;
  HB.saveHabits(HB.habits().filter(x=>x.id!==h.id));
  const m=HB.marks();Object.keys(m).forEach(k=>{delete m[k][h.id];if(!Object.keys(m[k]).length)delete m[k]});store.set('hb.marks',m);hbManage()};
}
registerTab('hb',rHb);
