// 拉伸分頁（拉伸對話維護）— 規格見 docs/stretching.md
// 儲存（key 前綴 st.）：
//   st.custom  自訂流程 [{id,name,items:[[動作id,秒],...]}]
//   st.first   先做哪一邊 'L'|'R'
//   st.last    上次練習的流程 id（快速開始）
const ST_AREAS=['肩頸','背部','胸','手臂','髖臀','腿部'];
// 動作庫：sides=分左右；img 預留給之後的示意圖
const ST_MOVES={
 neckSide:{name:'頸部側拉',area:'肩頸',sides:true,sec:30,steps:'坐直，頭慢慢往一側肩膀倒，同側的手輕放在頭上加一點重量。',tip:'另一側肩膀放鬆下沉，不要聳肩。'},
 neckFwd:{name:'頸部前彎',area:'肩頸',sides:false,sec:30,steps:'坐直，下巴慢慢收向胸口，雙手交扣輕放在後腦。',tip:'只靠手的重量，不要用力往下壓。'},
 upTrap:{name:'上斜方肌拉伸',area:'肩頸',sides:true,sec:30,steps:'頭轉向一側約 45 度，再低頭看向腋下，同側的手輕扶後腦。',tip:'對側肩膀往下沉。'},
 chestDoor:{name:'胸部開門式',area:'胸',sides:false,sec:30,steps:'站在門框中間，前臂貼住門框、手肘與肩同高，身體慢慢往前跨一小步。',tip:'肋骨不要外翻，感覺胸口打開。'},
 catCow:{name:'貓牛式',area:'背部',sides:false,sec:40,steps:'四足跪姿，吸氣時抬頭塌腰，吐氣時拱背收下巴，慢慢來回。',tip:'跟著呼吸的節奏，動作放慢。'},
 child:{name:'嬰兒式',area:'背部',sides:false,sec:40,steps:'跪坐，臀部往腳跟坐，上身往前趴，雙手往前伸。',tip:'額頭不舒服可以墊個枕頭。'},
 supTwist:{name:'仰臥扭轉',area:'背部',sides:true,sec:30,steps:'躺平，一腳屈膝倒向身體另一側，雙手往兩旁打開，頭轉向反方向。',tip:'肩膀盡量貼地。'},
 thread:{name:'穿針式',area:'背部',sides:true,sec:30,steps:'四足跪姿，一手從另一手下方穿過去，讓肩膀與側臉貼地。',tip:'臀部保持在膝蓋正上方。'},
 sideBend:{name:'站姿側彎',area:'背部',sides:true,sec:30,steps:'站直，雙手舉高，一手抓住另一手的手腕，身體往一側彎。',tip:'身體不要往前傾。'},
 crossArm:{name:'手臂橫胸拉伸',area:'手臂',sides:true,sec:30,steps:'一手伸直橫過胸前，另一手勾住手肘往身體拉。',tip:'肩膀下沉，不要聳肩。'},
 triceps:{name:'三頭肌拉伸',area:'手臂',sides:true,sec:30,steps:'一手舉高彎肘，手掌摸向後背，另一手輕壓手肘。',tip:'頭不要往前低。'},
 wrist:{name:'手腕前臂拉伸',area:'手臂',sides:true,sec:20,steps:'手臂往前伸、掌心朝外，另一手把手指輕輕往回扳。',tip:'手肘保持伸直。'},
 hipFlexor:{name:'髖屈肌弓步拉伸',area:'髖臀',sides:true,sec:30,steps:'單膝跪地呈弓步，骨盆慢慢往前推，感覺後腳大腿前側被拉開。',tip:'收小腹，不要塌腰。'},
 pigeon:{name:'鴿子式',area:'髖臀',sides:true,sec:40,steps:'前腳屈膝橫放在身前，後腳往後伸直，上身慢慢往前傾。',tip:'膝蓋不舒服就改做仰臥 4 字拉伸。'},
 figure4:{name:'仰臥 4 字拉伸',area:'髖臀',sides:true,sec:30,steps:'躺平屈膝，一腳腳踝放到另一腳膝蓋上，雙手抱住大腿往胸口拉。',tip:'頭和肩膀放鬆貼地。'},
 butterfly:{name:'蝴蝶式',area:'髖臀',sides:false,sec:40,steps:'坐姿，腳掌相對，膝蓋往兩側打開，上身微微往前傾。',tip:'背保持延伸，不要駝背。'},
 seatedFold:{name:'坐姿前彎',area:'腿部',sides:false,sec:40,steps:'坐在地上雙腿伸直，從髖部往前彎，雙手往腳尖延伸。',tip:'背保持延伸，膝蓋可以微彎。'},
 hamStand:{name:'站姿大腿後側拉伸',area:'腿部',sides:true,sec:30,steps:'一腳腳跟放在前方、腳尖翹起，髖部往後坐，上身往前傾。',tip:'背打直，從髖部彎。'},
 quad:{name:'站姿股四頭肌拉伸',area:'腿部',sides:true,sec:30,steps:'單腳站，另一腳屈膝，用手抓住腳背拉向臀部。',tip:'膝蓋朝下，可以扶牆保持平衡。'},
 calf:{name:'小腿靠牆拉伸',area:'腿部',sides:true,sec:30,steps:'雙手扶牆，一腳往後踩，後腳跟壓地、膝蓋打直。',tip:'腳尖朝正前方。'},
 legsWall:{name:'靠牆抬腿',area:'腿部',sides:false,sec:60,steps:'躺下，臀部靠近牆，雙腿往上靠在牆上，雙手放身旁。',tip:'放慢呼吸，讓身體完全放鬆。'}
};
const ST_SETS=[
 {id:'neck',name:'肩頸舒緩',desc:'看螢幕、低頭太久',items:[['neckSide',30],['neckFwd',30],['upTrap',30],['crossArm',30],['chestDoor',30],['thread',30]]},
 {id:'sit',name:'久坐舒緩',desc:'坐一整天後，以髖、下背、腿為主',items:[['hipFlexor',30],['figure4',30],['supTwist',30],['seatedFold',40],['chestDoor',30],['catCow',40]]},
 {id:'cool',name:'運動後收操',desc:'跑步或重訓後的全身拉伸',items:[['quad',30],['hamStand',30],['calf',30],['hipFlexor',30],['pigeon',40],['crossArm',30],['triceps',30],['child',40]]},
 {id:'morning',name:'早晨喚醒',desc:'輕鬆、短停留',items:[['catCow',30],['sideBend',20],['neckSide',20],['crossArm',20],['quad',20],['hamStand',20]]},
 {id:'sleep',name:'睡前放鬆',desc:'溫和、停留較久',items:[['child',60],['supTwist',45],['figure4',45],['butterfly',45],['neckFwd',45],['legsWall',60]]}
];
const ST_PREP=5,ST_SWITCH=3,ST_MIN=5,ST_MAX=300,ST_MAXFLOWS=20,ST_MAXITEMS=30;
const ST={
 custom:()=>store.get('st.custom',[]),
 first:()=>store.get('st.first','L'),
 all(){return[...ST_SETS.map(s=>({...s,builtin:true})),...ST.custom()]},
 find(id){return ST.all().find(s=>s.id===id)},
 valid:items=>items.filter(([id])=>ST_MOVES[id])
};
const stEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stClamp=v=>Math.min(ST_MAX,Math.max(ST_MIN,Math.round((+v||30)/5)*5));
function stTotal(items){let t=0;ST.valid(items).forEach(([id,s],i)=>{t+=ST_MOVES[id].sides?s*2+ST_SWITCH:s;t+=ST_PREP});return t}
const stLen=t=>t<60?t+' 秒':'約 '+Math.max(1,Math.round(t/60))+' 分鐘';
const stSideName=s=>s==='L'?'左邊':'右邊';

// ---------- 預錄語音（audio/st/{f,m}/）----------
// 片段：mv_<動作id>、w_left 左邊、w_right 右邊、w_swl 換左邊、w_swr 換右邊、w_first 先做、w_next 下一個
// 依序接起來播放；缺任何片段（例如還沒下載好）整句改用 P.say（手機語音）。「開始」「結束」用核心的預錄。
const STV={},stNow=[];
const stKeys=()=>[...Object.keys(ST_MOVES).map(k=>'mv_'+k),'w_left','w_right','w_swl','w_swr','w_first','w_next'];
function stLoad(){const v=S.voiceType||'f';stKeys().forEach(k=>{if(STV[v+'/'+k])return;STV[v+'/'+k]=1;
 fetch(`audio/st/${v}/${k}.mp3`).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(a=>P.ctx().decodeAudioData(a)).then(b=>STV[v+'/'+k]=b).catch(()=>delete STV[v+'/'+k])})}
function stHush(){stNow.splice(0).forEach(x=>{try{x.stop()}catch(e){}});window.speechSynthesis?.cancel()}
function stSpeak(keys,text){
 if(!S.voice)return;stHush();const v=S.voiceType||'f';
 if(!keys.every(k=>k===','||STV[v+'/'+k] instanceof AudioBuffer))return P.say(text);
 try{const ac=P.ctx();let t=ac.currentTime+.03;
  keys.forEach(k=>{if(k===','){t+=.25;return}const b=STV[v+'/'+k],s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);s.start(t);stNow.push(s);t+=b.duration+.06})}
 catch(e){P.say(text)}}
$('#pbtn').addEventListener('click',()=>{if(play.paused&&$('#play').classList.contains('st'))stHush()});

// ---------- 列表頁 ----------
let stArea='全部';
function rSt(){
 stLoad();
 const custom=ST.custom(),last=ST.find(store.get('st.last',''));
 const card=s=>`<div class="card stitem" data-open="${s.id}"><div>${stEsc(s.name)}<small>${s.desc?stEsc(s.desc)+'・':''}${stLen(stTotal(s.items))}・${ST.valid(s.items).length} 個動作</small></div><span class="stgo">›</span></div>`;
 const moves=Object.entries(ST_MOVES).filter(([,m])=>stArea==='全部'||m.area===stArea);
 $('#view').innerHTML=`<h1>拉伸<button class="pri" id="stadd" aria-label="新增流程">＋</button></h1>
 ${last?`<div class="card stquick"><div><small>快速開始</small>${stEsc(last.name)}<small>${stLen(stTotal(last.items))}</small></div><button class="pri" id="stq">開始</button></div>`:''}
 <div class="stsec">內建套組</div>${ST_SETS.map(card).join('')}
 <div class="stsec">我的流程 <small>${custom.length}/${ST_MAXFLOWS}</small></div>${custom.map(card).join('')||'<p class="empty" style="padding:16px 0">還沒有自訂流程，按右上「＋」新增，<br>或打開內建套組選「複製並編輯」</p>'}
 <div class="stsec">動作庫</div>
 <div class="stchips">${['全部',...ST_AREAS].map(a=>`<button data-area="${a}" class="${a===stArea?'on':''}">${a}</button>`).join('')}</div>
 ${moves.map(([id,m])=>`<div class="card stitem" data-move="${id}"><div>${m.name}<small>${m.area}・${m.sec} 秒${m.sides?'・左右各一次':''}</small></div><span class="stgo">›</span></div>`).join('')}`;
 const v=$('#view');
 $('#stadd').onclick=()=>stEdit(null);
 if(last)$('#stq').onclick=()=>startSt(last);
 v.querySelectorAll('[data-open]').forEach(c=>c.onclick=()=>stPrepare(c.dataset.open));
 v.querySelectorAll('[data-move]').forEach(c=>c.onclick=()=>stMove(c.dataset.move));
 v.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{stArea=b.dataset.area;rSt()});
}

// 先做哪一邊（拉伸分頁自己的設定）
const stFirstRow=()=>`<div class="card">左右動作先做<div class="stchips" style="margin:0">${['L','R'].map(s=>`<button data-first="${s}" class="${ST.first()===s?'on':''}">${stSideName(s)}</button>`).join('')}</div></div>`;
function stBindFirst(redraw){$('#view').querySelectorAll('[data-first]').forEach(b=>b.onclick=()=>{store.set('st.first',b.dataset.first);redraw()})}

// ---------- 動作說明 ----------
function stMove(id){
 const m=ST_MOVES[id];if(!m)return rSt();
 const draw=()=>{
  $('#view').innerHTML=`<h1>${m.name}<button id="stback">返回</button></h1>
  <div class="card" style="display:block"><small>${m.area}・預設 ${m.sec} 秒${m.sides?'・左右各一次':''}</small><p class="sthowtxt">${m.steps}</p><p class="sttip">💡 ${m.tip}</p></div>
  ${m.sides?stFirstRow():''}
  <div class="row"><button class="pri" id="stgo">單獨練習這個動作</button></div>`;
  $('#stback').onclick=rSt;stBindFirst(draw);
  $('#stgo').onclick=()=>startSt({id:'',name:m.name,items:[[id,m.sec]]});
 };draw();
}

// ---------- 流程預覽 ----------
function stPrepare(id){
 const r=ST.find(id);if(!r)return rSt();
 const items=ST.valid(r.items);
 const draw=()=>{
  $('#view').innerHTML=`<h1>${stEsc(r.name)}<button id="stback">返回</button></h1>
  <div class="card"><div>${stLen(stTotal(items))}<small>${items.length} 個動作・每個動作前準備 ${ST_PREP} 秒</small></div><button class="pri" id="stgo">開始</button></div>
  ${items.some(([i])=>ST_MOVES[i].sides)?stFirstRow():''}
  <div class="stsec">動作</div>
  ${items.map(([i,s],n)=>{const m=ST_MOVES[i];return`<div class="card stline"><span class="stno">${n+1}</span><div style="flex:1">${m.name}<small>${s} 秒${m.sides?'・左右各一次':''}</small></div></div>`}).join('')}
  <div class="row">${r.builtin?'<button id="stcopy">複製並編輯</button>':'<button id="stedit">編輯</button>'}</div>`;
  $('#stback').onclick=rSt;stBindFirst(draw);
  $('#stgo').onclick=()=>startSt(r);
  if(r.builtin)$('#stcopy').onclick=()=>{if(ST.custom().length>=ST_MAXFLOWS)return alert(`自訂流程最多 ${ST_MAXFLOWS} 個`);stEdit(null,{name:r.name+'（自訂）',items:items.map(x=>[...x])})};
  else $('#stedit').onclick=()=>stEdit(r.id);
 };draw();
}

// ---------- 編輯自訂流程 ----------
function stEdit(id,from){
 const old=id?ST.custom().find(x=>x.id===id):null;
 if(!id&&!from&&ST.custom().length>=ST_MAXFLOWS)return alert(`自訂流程最多 ${ST_MAXFLOWS} 個`);
 const d=old?{name:old.name,items:ST.valid(old.items).map(x=>[...x])}:from||{name:'',items:[]};
 let pick=d.items.length===0,pArea='全部';
 const draw=()=>{
  const moves=Object.entries(ST_MOVES).filter(([,m])=>pArea==='全部'||m.area===pArea);
  $('#view').innerHTML=`<h1>${old?'編輯流程':'新增流程'}<button id="stcancel">取消</button></h1>
  <div class="card">名稱<input id="stname" maxlength="20" placeholder="例如：午休拉伸" value="${stEsc(d.name)}" style="flex:1;width:auto"></div>
  <div class="stsec">動作 <small>${d.items.length}/${ST_MAXITEMS}・${stLen(stTotal(d.items))}</small></div>
  ${d.items.map(([i,s],n)=>{const m=ST_MOVES[i];return`<div class="card stline"><span class="stno">${n+1}</span><div style="flex:1;min-width:0">${m.name}<small>${m.sides?'左右各':'停留'}</small></div>
   <input type="number" min="${ST_MIN}" max="${ST_MAX}" step="5" value="${s}" data-sec="${n}" aria-label="秒數" style="width:64px">秒
   <span class="stmv"><button data-up="${n}" ${n?'':'disabled'} aria-label="上移">↑</button><button data-down="${n}" ${n<d.items.length-1?'':'disabled'} aria-label="下移">↓</button><button data-del="${n}" aria-label="刪除">✕</button></span></div>`}).join('')||'<p class="empty" style="padding:12px 0">從下方動作庫加入動作</p>'}
  ${pick?`<div class="card" style="display:block"><b>加入動作</b><small>點一下加入，可以連續加</small>
   <div class="stchips">${['全部',...ST_AREAS].map(a=>`<button data-parea="${a}" class="${a===pArea?'on':''}">${a}</button>`).join('')}</div>
   ${moves.map(([i,m])=>`<button class="stpick" data-add="${i}">＋ ${m.name}<small>${m.area}・${m.sec} 秒${m.sides?'・左右':''}</small></button>`).join('')}
   <div class="row"><button id="stpickdone">收起</button></div></div>`:`<div class="row"><button id="stpick">＋ 加入動作</button></div>`}
  <div class="row"><button class="pri" id="stsave">儲存</button>${old?'<button id="stdelf" class="stdanger">刪除流程</button>':''}</div>`;
  const v=$('#view');
  $('#stname').oninput=e=>d.name=e.target.value;
  $('#stcancel').onclick=()=>old?stPrepare(old.id):rSt();
  v.querySelectorAll('[data-sec]').forEach(x=>x.onchange=()=>{const n=+x.dataset.sec;d.items[n][1]=stClamp(x.value);draw()});
  const move=(n,k)=>{[d.items[n],d.items[n+k]]=[d.items[n+k],d.items[n]];draw()};
  v.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>move(+b.dataset.up,-1));
  v.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>move(+b.dataset.down,1));
  v.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{d.items.splice(+b.dataset.del,1);draw()});
  v.querySelectorAll('[data-parea]').forEach(b=>b.onclick=()=>{pArea=b.dataset.parea;draw()});
  v.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{if(d.items.length>=ST_MAXITEMS)return alert(`每個流程最多 ${ST_MAXITEMS} 個動作`);d.items.push([b.dataset.add,ST_MOVES[b.dataset.add].sec]);draw()});
  if(pick)$('#stpickdone').onclick=()=>{pick=false;draw()};else $('#stpick').onclick=()=>{pick=true;draw()};
  $('#stsave').onclick=()=>{
   const name=d.name.trim();if(!name)return alert('請輸入流程名稱');if(!d.items.length)return alert('請至少加入一個動作');
   const all=ST.custom(),fid=old?old.id:'c'+Date.now().toString(36);const rec={id:fid,name,items:d.items};
   const i=all.findIndex(x=>x.id===fid);if(i>=0)all[i]=rec;else all.push(rec);store.set('st.custom',all);stPrepare(fid)};
  if(old)$('#stdelf').onclick=()=>{if(!confirm(`確定刪除「${old.name}」嗎？`))return;store.set('st.custom',ST.custom().filter(x=>x.id!==old.id));if(store.get('st.last','')===old.id)store.set('st.last','');rSt()};
 };draw();
}

// ---------- 練習中 ----------
function stBox(){
 let b=$('#stbox');if(b)return b;
 b=document.createElement('div');b.id='stbox';
 b.innerHTML=`<div id="stlabel"></div><div id="stmname"></div><div id="stside"></div>
 <div id="string"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="45"/><circle class="arc" id="starc" cx="50" cy="50" r="45" pathLength="100"/></svg><div id="stnum"></div></div>
 <div id="sthow"></div><div id="stnext"></div>
 <div class="stctl"><button id="stprev">⏮ 上一個</button><button id="stplus">+10 秒</button><button id="stskip">跳過 ⏭</button></div>`;
 $('#play').insertBefore(b,$('#pbtn').parentNode);return b;
}
// 依先做哪一邊，把流程展開成一段一段：prep 準備 → hold 停留（分左右時 hold → switch 換邊 → hold）
function stSegs(items){
 const o=ST.first()==='L'?['L','R']:['R','L'],segs=[];
 items.forEach(([id,sec],i)=>{const m=ST_MOVES[id];segs.push({k:'prep',i,side:m.sides?o[0]:'',sec:ST_PREP});
  if(m.sides){segs.push({k:'hold',i,side:o[0],sec},{k:'switch',i,side:o[1],sec:ST_SWITCH},{k:'hold',i,side:o[1],sec})}else segs.push({k:'hold',i,side:'',sec})});
 return segs;
}
function startSt(r){
 const items=ST.valid(r.items);if(!items.length)return;
 if(r.id)store.set('st.last',r.id);
 try{P.ctx().resume()}catch(e){}stLoad();
 const dark=isDark(),bg=dark?'#0E1A15':'#E6F4EE',flash=dark?'#1C3A2E':'#C7E8D9';
 showPlay(bg,dark?'#CDEBDD':'#0F4D3A');stBox();$('#play').classList.add('st');
 const segs=stSegs(items),reached=new Set();let k=-1,done=0;
 const arc=$('#starc');
 const paint=()=>{const s=segs[k];$('#stnum').textContent=s.left;arc.style.strokeDashoffset=100-100*s.left/s.dur};
 const enter=()=>{
  const s=segs[k],m=ST_MOVES[items[s.i][0]],nx=items[s.i+1];
  const pl=$('#play');pl.classList.toggle('stprep',s.k!=='hold');pl.style.background=s.k==='switch'?flash:bg;
  $('#pinfo').textContent=`${s.i+1}/${items.length}・${r.name}`;
  $('#stlabel').textContent=s.k==='prep'?(s.i?'準備・下一個':'準備'):s.k==='switch'?'換邊':'';
  $('#stmname').textContent=m.name;
  $('#stside').textContent=s.side?(s.k==='switch'?'換'+stSideName(s.side):stSideName(s.side)):'';
  $('#sthow').innerHTML=`${m.steps}<span class="sttip">💡 ${m.tip}</span>`;
  $('#stnext').textContent=s.k==='hold'&&nx?'下一個：'+ST_MOVES[nx[0]].name:'';
  $('#stplus').disabled=s.k!=='hold';$('#stprev').disabled=k===0;
  arc.style.transition='none';paint();arc.getBoundingClientRect();arc.style.transition='';
  const sw=s.side==='L'?'w_left':'w_right';
  if(s.k==='prep')stSpeak([...(s.i?['w_next',',']:[]),'mv_'+items[s.i][0],...(s.side?[',','w_first',sw]:[])],(s.i?'下一個，':'')+m.name+(s.side?'，先做'+stSideName(s.side):''));
  else if(s.k==='switch'){P.beep(600,.3);P.buzz(150);stSpeak([s.side==='L'?'w_swl':'w_swr'],'換'+stSideName(s.side))}
  else{reached.add(s.i);P.beep(520,.2);if(segs[k-1]?.k!=='switch')P.say('開始')}
 };
 const step=()=>{clearTimeout(play.timer);play.timer=setTimeout(()=>{const s=segs[k];s.left--;done++;
  if(s.left<=0)return go(k+1);if(s.k==='hold'&&s.left<=3)P.beep(520,.12);paint();step()},1000)};
 const go=n=>{clearTimeout(play.timer);if(n>=segs.length)return finish(true);k=n;const s=segs[k];s.left=s.dur=s.sec;enter();if(!play.paused)step()};
 const finish=full=>{clearTimeout(play.timer);stHush();
  if(full){P.beep(660,.8);P.say('結束')}
  const n=full?items.length:reached.size;
  const idx=addLog('st',r.name,done,{moves:n,routineId:r.id||null});
  hidePlay();$('#play').classList.remove('st','stprep');
  doneScreen(stEsc(r.name),done,n+' 個動作',idx,()=>startSt(r))};
 const firstOf=i=>segs.findIndex(x=>x.i===i&&x.k!=='prep');
 $('#stskip').onclick=()=>{const cur=segs[k].i,n=segs.findIndex(x=>x.i>cur);go(n<0?segs.length:n)};
 $('#stprev').onclick=()=>{const s=segs[k],fh=firstOf(s.i);
  if(k>fh||(k===fh&&s.dur-s.left>3))return go(fh);go(s.i>0?firstOf(s.i-1):fh)};
 $('#stplus').onclick=()=>{const s=segs[k];if(s.k!=='hold')return;s.left+=10;s.dur+=10;paint()};
 play.restart=step;play.end=()=>finish(false);
 go(0);
}
registerTab('st',rSt);
