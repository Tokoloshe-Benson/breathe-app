// 練習紀錄頁（架構對話維護）：所有分頁的紀錄依日期列出，可補選心情、補寫備註（呼吸）
// 進入方式：openLog(返回時要呼叫的函式)；習慣分頁與設定頁都可以放入口
const LOG_TYPES={breath:['呼吸','#7F77DD'],ex:['運動','#E8825E'],st:['拉伸','#5DCAA5']};
const logEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let logFilter='all',logBack=null,logOpen=-1;
function openLog(back){logBack=back||render;logOpen=-1;rLog()}
function rLog(){
 const l=LOG(),items=l.map((e,i)=>({...e,i})).filter(e=>logFilter==='all'||e.type===logFilter).reverse();
 const wk=['日','一','二','三','四','五','六'];
 let html='',day='';
 items.slice(0,300).forEach(e=>{
  const d=new Date(e.t),k=`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}（${wk[d.getDay()]}）`;
  if(k!==day){day=k;html+=`<div class="logday">${k}</div>`}
  const ty=LOG_TYPES[e.type]||['其他','#888780'],tm=`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  html+=`<div class="card logitem" data-i="${e.i}"><div class="lh"><span class="ld" style="background:${ty[1]}"></span>
   <div>${logEsc(e.name)}<small>${ty[0]}・${tm}・${fmt(e.sec||0)}${e.note?'・📝':''}</small></div>
   <span class="lm">${e.mood?moodImg(e.mood,28):'<small>補選心情</small>'}</span></div>
   ${logOpen===e.i?`<div class="ledit">${moodRow(e.mood)}${NOTE_TYPES.includes(e.type)?`<textarea class="note" rows="2" placeholder="備註（可不填）">${logEsc(e.note)}</textarea>`:''}</div>`:''}</div>`;
 });
 $('#view').innerHTML=`<h1>練習紀錄<button id="lback">返回</button></h1>
 <div class="row">${[['all','全部'],['breath','呼吸'],['ex','運動'],['st','拉伸']].map(([k,t])=>`<button data-f="${k}" class="${logFilter===k?'pri':''}">${t}</button>`).join('')}</div>
 ${html||'<p class="empty">還沒有紀錄<br>完成一次練習後會出現在這裡</p>'}`;
 $('#lback').onclick=()=>logBack();
 $('#view').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{logFilter=b.dataset.f;logOpen=-1;rLog()});
 $('#view').querySelectorAll('.logitem').forEach(c=>{
  const i=+c.dataset.i;
  c.querySelector('.lh').onclick=()=>{logOpen=logOpen===i?-1:i;rLog()};
  const ed=c.querySelector('.ledit');if(!ed)return;
  bindMood(ed,i,rLog);
  const ta=ed.querySelector('textarea');if(ta)ta.onchange=()=>{setLogNote(i,ta.value.trim());rLog()};
 });
}
