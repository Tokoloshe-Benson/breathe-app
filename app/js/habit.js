// 習慣分頁（習慣對話維護）
function dayKey(t){const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function rHb(){
 const l=LOG(),days={};l.forEach(e=>{(days[dayKey(e.t)]??=new Set()).add(e.type)});
 let streak=0;const d=new Date();if(!days[dayKey(d)])d.setDate(d.getDate()-1);while(days[dayKey(d)]){streak++;d.setDate(d.getDate()-1)}
 const today=days[dayKey(Date.now())]||new Set();
 const now=new Date(),y=now.getFullYear(),m=now.getMonth(),first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
 const col={breath:'#7F77DD',ex:'#E8825E',st:'#5DCAA5'};
 let cal='';for(let i=0;i<first;i++)cal+='<span></span>';
 for(let i=1;i<=n;i++){const s=days[y+'-'+(m+1)+'-'+i];cal+=`<div>${i}<div class="dots">${s?[...s].map(t=>`<span style="background:${col[t]}"></span>`).join(''):''}</div></div>`}
 $('#view').innerHTML=`<h1>習慣<button id="gear" aria-label="設定">⚙️</button></h1>
 <div class="card"><div class="stat"><b>${streak}</b>連續天數</div><div class="stat"><b>${today.size}/3</b>今日完成</div><div class="stat"><b>${l.length}</b>總次數</div></div>
 <div class="card" style="display:block"><b>${y} 年 ${m+1} 月</b><div class="cal" style="margin-top:8px">${'日一二三四五六'.split('').map(x=>`<span style="color:var(--muted)">${x}</span>`).join('')}${cal}</div></div>
 <p class="empty" style="padding:10px">自訂習慣與更多統計還在討論中。</p>`;
 $('#gear').onclick=rSettings;
}
registerTab('hb',rHb);
