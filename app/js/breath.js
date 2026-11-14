// 呼吸分頁（呼吸對話維護）— 規格見 docs/breathing.md
// 儲存（key 前綴 breath.）：
//   breath.custom  自訂呼吸法 [{id,name,steps:[[k,秒],...]}]（最多 20 個，順序即顯示順序）
//   breath.hidden  隱藏的內建呼吸法 id 陣列
//   breath.dur     每個呼吸法記住的時長 {id:{mode:'time'|'count',mins,count}}
//   breath.last    上次使用的呼吸法 id（快速開始）
//   breath.cue     聲音模式 'both'|'voice'|'sound'
//   breath.count   語音是否數秒 true|false
const BREATHS=[
{id:'box',name:'箱式呼吸',steps:[['in',4],['hold',4],['out',4],['hold',4]]},
{id:'478',name:'4-7-8 呼吸',steps:[['in',4],['hold',7],['out',8]]},
{id:'res',name:'共振呼吸',steps:[['in',6],['out',6]]},
{id:'calm',name:'舒緩呼吸',steps:[['in',4],['out',6]]}];
const STEP={in:'吸氣',hold:'停住',out:'吐氣'};
const B_MAX=20,B_MAXSTEPS=12,B_MAXSEC=600;
const B={
 custom:()=>store.get('breath.custom',[]),
 hidden:()=>store.get('breath.hidden',[]),
 all(){return[...BREATHS.map(b=>({...b,builtin:true})),...B.custom()]},
 find(id){return B.all().find(b=>b.id===id)},
 dur(id){const d=store.get('breath.dur',{})[id];if(d)return d;const old=store.get('bmins',{})[id];return{mode:'time',mins:old||3,count:10}},
 setDur(id,d){const all=store.get('breath.dur',{});all[id]=d;store.set('breath.dur',all)},
 cue:()=>store.get('breath.cue','both'),
 counting:()=>store.get('breath.count',false)
};
const bEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bSec=s=>s<60?s+'':Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const bRhythm=b=>b.steps.map(([k,s])=>STEP[k][0]+' '+bSec(s)).join('・');
const bDurLabel=d=>d.mode==='count'?d.count+' 次':d.mins+' 分鐘';

// ---------- 列表頁 ----------
let bManage=false;
function rBreath(){
 const hidden=B.hidden(),custom=B.custom(),last=B.find(store.get('breath.last',''));
 const quick=last&&!(last.builtin&&hidden.includes(last.id))?`<div class="card bquick"><div><small>快速開始</small>${bEsc(last.name)}<small>${bDurLabel(B.dur(last.id))}・${bRhythm(last)}</small></div><button class="pri" data-quick="${last.id}">開始</button></div>`:'';
 const builtins=BREATHS.filter(b=>bManage||!hidden.includes(b.id)).map(b=>{const h=hidden.includes(b.id);
  return `<div class="card bitem${h?' bhid':''}" data-open="${bManage?'':b.id}"><div>${b.name}<small>${bRhythm(b)}</small></div>${bManage?`<button data-hide="${b.id}">${h?'顯示':'隱藏'}</button>`:'<span class="bgo">›</span>'}</div>`}).join('');
 const customs=custom.map((b,i)=>`<div class="card bitem" data-open="${bManage?'':b.id}"><div>${bEsc(b.name)}<small>${bRhythm(b)}</small></div>${bManage?`<div class="row bmv"><button data-up="${i}" ${i?'':'disabled'} aria-label="上移">↑</button><button data-down="${i}" ${i<custom.length-1?'':'disabled'} aria-label="下移">↓</button><button data-edit="${b.id}">編輯</button></div>`:'<span class="bgo">›</span>'}</div>`).join('');
 $('#view').innerHTML=`<h1>呼吸<span class="row" style="margin:0"><button id="bmanage">${bManage?'完成':'整理'}</button><button class="pri" id="badd" aria-label="新增呼吸法">＋</button></span></h1>
 ${bManage?'':quick}
 <div class="bsec">內建</div>${builtins}
 <div class="bsec">自訂 <small>${custom.length}/${B_MAX}</small></div>${customs||'<p class="empty" style="padding:16px 0">還沒有自訂呼吸法，按右上「＋」新增</p>'}`;
 const v=$('#view');
 $('#bmanage').onclick=()=>{bManage=!bManage;rBreath()};
 $('#badd').onclick=()=>bEdit(null);
 v.querySelectorAll('[data-open]').forEach(c=>{if(c.dataset.open)c.onclick=()=>bPrepare(c.dataset.open)});
 v.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const x=B.find(b.dataset.quick);startBreath(x,B.dur(x.id))});
 v.querySelectorAll('[data-hide]').forEach(b=>b.onclick=()=>{let h=B.hidden();const id=b.dataset.hide;h=h.includes(id)?h.filter(x=>x!==id):[...h,id];store.set('breath.hidden',h);rBreath()});
 const move=(i,d)=>{const c=B.custom();[c[i],c[i+d]]=[c[i+d],c[i]];store.set('breath.custom',c);rBreath()};
 v.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>move(+b.dataset.up,-1));
 v.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>move(+b.dataset.down,1));
 v.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>bEdit(b.dataset.edit));
}

// ---------- 準備畫面 ----------
function bPrepare(id){
 const b=B.find(id);if(!b)return rBreath();
 const d={...B.dur(id)};
 const draw=()=>{
  $('#view').innerHTML=`<h1>${bEsc(b.name)}<button id="bback">返回</button></h1>
  <div class="card" style="display:block"><small>節奏</small>${bRhythm(b)}</div>
  <div class="card" style="display:block">
   <div class="bseg"><button data-mode="time" class="${d.mode==='time'?'on':''}">時間</button><button data-mode="count" class="${d.mode==='count'?'on':''}">次數</button></div>
   ${d.mode==='time'?`<div class="row bchips">${[1,3,5,10].map(m=>`<button data-min="${m}" class="${d.mins==m?'on':''}">${m} 分</button>`).join('')}<span class="row" style="margin:0">自訂 <input id="bmins" type="number" min="1" max="120" value="${d.mins}"> 分</span></div><small class="bhint">時間到時，會做完當下這個循環才結束</small>`
   :`<div class="row">做 <input id="bcount" type="number" min="1" max="200" value="${d.count}"> 個循環</div>`}
  </div>
  <div class="card" style="display:block"><small>聲音</small>
   <div class="bseg">${[['both','語音＋音效'],['voice','只開語音'],['sound','只開音效']].map(([k,t])=>`<button data-cue="${k}" class="${B.cue()===k?'on':''}">${t}</button>`).join('')}</div>
   <label class="row"><input type="checkbox" id="bcnt" style="width:auto" ${B.counting()?'checked':''}> 語音數秒（例如「吸氣…二…三…四」）</label>
  </div>
  <div class="row"><button class="pri" id="bstart" style="flex:1">開始</button></div>
  <div class="row">${b.builtin?'<button id="bcopy">複製一份來修改</button>':'<button id="bedit">編輯這個呼吸法</button>'}</div>`;
  $('#bback').onclick=rBreath;
  $('#view').querySelectorAll('[data-mode]').forEach(x=>x.onclick=()=>{d.mode=x.dataset.mode;draw()});
  $('#view').querySelectorAll('[data-min]').forEach(x=>x.onclick=()=>{d.mins=+x.dataset.min;draw()});
  $('#view').querySelectorAll('[data-cue]').forEach(x=>x.onclick=()=>{store.set('breath.cue',x.dataset.cue);draw()});
  $('#bcnt').onchange=e=>store.set('breath.count',e.target.checked);
  const mi=$('#bmins');if(mi)mi.onchange=()=>{d.mins=Math.min(120,Math.max(1,Math.round(+mi.value)||1));draw()};
  const ci=$('#bcount');if(ci)ci.onchange=()=>{d.count=Math.min(200,Math.max(1,Math.round(+ci.value)||1))};
  $('#bstart').onclick=()=>{if(ci)ci.onchange();B.setDur(id,d);startBreath(b,d)};
  if(b.builtin)$('#bcopy').onclick=()=>bEdit(null,b);else $('#bedit').onclick=()=>bEdit(id);
 };draw();
}

// ---------- 自訂呼吸法編輯 ----------
// id=null 為新增；from=要複製的呼吸法
function bEdit(id,from){
 const custom=B.custom(),orig=id&&custom.find(x=>x.id===id);
 if(!orig&&custom.length>=B_MAX){alert(`自訂呼吸法最多 ${B_MAX} 個，請先刪除不用的。`);return}
 const src=orig||from;
 const f={name:orig?orig.name:from?from.name+'（自訂）':'',steps:(src?src.steps:[['in',4],['hold',4],['out',4],['hold',4]]).map(([k,s])=>({k,s,u:s>=60?'m':'s'}))};
 const read=()=>{f.name=$('#bname').value;$('#view').querySelectorAll('.bstep').forEach((r,i)=>{const st=f.steps[i];st.k=r.querySelector('.bk').value;
   const n=x=>Math.max(0,Math.round(+x||0));st.s=st.u==='m'?n(r.querySelector('.bm').value)*60+n(r.querySelector('.bs').value):n(r.querySelector('.bs').value)})};
 const draw=()=>{
  $('#view').innerHTML=`<h1>${orig?'編輯呼吸法':'新增呼吸法'}<button id="bcancel">取消</button></h1>
  <div class="card" style="display:block"><small>名稱</small><input id="bname" maxlength="20" style="width:100%" placeholder="例如：睡前放鬆" value="${bEsc(f.name)}"></div>
  <div class="bsec">步驟 <small>${f.steps.length}/${B_MAXSTEPS}，每步 1 秒～10 分鐘</small></div>
  ${f.steps.map((st,i)=>`<div class="card bstep"><span class="bno">${i+1}</span>
   <select class="bk">${Object.entries(STEP).map(([k,t])=>`<option value="${k}" ${st.k===k?'selected':''}>${t}</option>`).join('')}</select>
   <span class="btime">${st.u==='m'?`<input class="bm" type="number" min="0" max="10" value="${Math.floor(st.s/60)}">:<input class="bs" type="number" min="0" max="59" value="${st.s%60}">`:`<input class="bs" type="number" min="1" max="600" value="${st.s}">`}
   <button class="bu" data-i="${i}">${st.u==='m'?'分:秒':'秒'}</button></span>
   <span class="bmv"><button data-up="${i}" ${i?'':'disabled'} aria-label="上移">↑</button><button data-down="${i}" ${i<f.steps.length-1?'':'disabled'} aria-label="下移">↓</button><button data-del="${i}" ${f.steps.length>1?'':'disabled'} aria-label="刪除步驟">✕</button></span></div>`).join('')}
  ${f.steps.length<B_MAXSTEPS?'<button id="baddstep" style="width:100%">＋ 新增步驟</button>':''}
  <div class="row" style="margin-top:16px"><button class="pri" id="bsave" style="flex:1">儲存</button></div>
  ${orig?'<div class="row"><button id="bdel" class="bdanger">刪除這個呼吸法</button></div>':''}`;
  const v=$('#view');
  $('#bcancel').onclick=()=>orig?bPrepare(orig.id):rBreath();
  v.querySelectorAll('.bu').forEach(x=>x.onclick=()=>{read();const st=f.steps[+x.dataset.i];st.u=st.u==='m'?'s':'m';draw()});
  v.querySelectorAll('[data-up]').forEach(x=>x.onclick=()=>{read();const i=+x.dataset.up;[f.steps[i-1],f.steps[i]]=[f.steps[i],f.steps[i-1]];draw()});
  v.querySelectorAll('[data-down]').forEach(x=>x.onclick=()=>{read();const i=+x.dataset.down;[f.steps[i+1],f.steps[i]]=[f.steps[i],f.steps[i+1]];draw()});
  v.querySelectorAll('[data-del]').forEach(x=>x.onclick=()=>{read();f.steps.splice(+x.dataset.del,1);draw()});
  const add=$('#baddstep');if(add)add.onclick=()=>{read();f.steps.push({k:'in',s:4,u:'s'});draw()};
  $('#bsave').onclick=()=>{read();
   const name=f.name.trim();if(!name)return alert('請輸入名稱');
   const bad=f.steps.findIndex(st=>st.s<1||st.s>B_MAXSEC);if(bad>=0)return alert(`第 ${bad+1} 步的時間要在 1 秒到 10 分鐘之間`);
   const steps=f.steps.map(st=>[st.k,st.s]),c=B.custom();
   if(orig){const x=c.find(y=>y.id===orig.id);x.name=name;x.steps=steps;store.set('breath.custom',c);bPrepare(orig.id)}
   else{const nid='c'+Date.now().toString(36);c.push({id:nid,name,steps});store.set('breath.custom',c);bPrepare(nid)}};
  if(orig)$('#bdel').onclick=()=>{if(!confirm(`確定要刪除「${orig.name}」嗎？`))return;store.set('breath.custom',B.custom().filter(x=>x.id!==orig.id));if(store.get('breath.last','')===orig.id)store.set('breath.last','');rBreath()};
 };draw();
}

// ---------- 聲音：柔和氣音、數秒、結束音 ----------
const bSfx={src:[],nums:{},
 noise(){if(bSfx.nb)return bSfx.nb;const ac=P.ctx(),n=ac.sampleRate*2,buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);let last=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5}return bSfx.nb=buf},
 // 吸氣：氣音由暗轉亮、漸強；吐氣：由亮轉暗、漸弱
 breath(kind,sec){if(!S.sound||B.cue()==='voice')return;try{const ac=P.ctx(),t=ac.currentTime,len=Math.min(sec,4.5);
  const s=ac.createBufferSource();s.buffer=bSfx.noise();s.loop=true;
  const f=ac.createBiquadFilter();f.type='bandpass';f.Q.value=.8;
  const g=ac.createGain();g.gain.setValueAtTime(.0001,t);
  if(kind==='in'){f.frequency.setValueAtTime(500,t);f.frequency.exponentialRampToValueAtTime(1400,t+len);g.gain.exponentialRampToValueAtTime(.22,t+len*.6);g.gain.exponentialRampToValueAtTime(.0001,t+len)}
  else{f.frequency.setValueAtTime(1200,t);f.frequency.exponentialRampToValueAtTime(380,t+len);g.gain.exponentialRampToValueAtTime(.22,t+len*.2);g.gain.exponentialRampToValueAtTime(.0001,t+len)}
  s.connect(f).connect(g).connect(ac.destination);s.start(t);s.stop(t+len+.05);bSfx.src.push(s);s.onended=()=>bSfx.src=bSfx.src.filter(x=>x!==s)}catch(e){}},
 // 結束：一次柔和的鐘聲（只響一次）
 bell(){if(!S.sound)return;try{const ac=P.ctx(),t=ac.currentTime;[[528,.16],[792,.06],[1056,.03]].forEach(([fr,v])=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=fr;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+3.2);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+3.3)})}catch(e){}},
 stop(){bSfx.src.forEach(s=>{try{s.stop()}catch(e){}});bSfx.src=[]},
 loadNums(){const v=S.voiceType||'f';for(let i=2;i<=10;i++){const id=v+i;if(bSfx.nums[id])continue;fetch(`audio/b/${v}/${i}.mp3`).then(r=>r.arrayBuffer()).then(a=>P.ctx().decodeAudioData(a)).then(b=>bSfx.nums[id]=b).catch(()=>{})}},
 num(n){if(!S.voice||B.cue()==='sound')return;const b=bSfx.nums[(S.voiceType||'f')+n];if(!b)return;try{const ac=P.ctx(),s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);s.start()}catch(e){}}
};
const bSay=t=>{if(B.cue()!=='sound')P.say(t)};

// ---------- 練習 ----------
// 進行中畫面自動變暗，點一下恢復
const bDim={t:null,arm(){clearTimeout(bDim.t);$('#play').classList.remove('bdim');bDim.t=setTimeout(()=>{if(!play.paused&&$('#play').classList.contains('breath'))$('#play').classList.add('bdim')},8000)},
 off(){clearTimeout(bDim.t);$('#play').classList.remove('bdim')}};
$('#play').addEventListener('click',e=>{if($('#play').classList.contains('breath')&&!e.target.closest('button'))bDim.arm()});
$('#pbtn').addEventListener('click',()=>{if(!$('#play').classList.contains('breath'))return;if(play.paused){bSfx.stop();bDim.off()}else bDim.arm()});

function startBreath(b,d){
 store.set('breath.last',b.id);bSfx.loadNums();
 showPlay(isDark()?'#110F24':'#2E2966','#EEEDFE');$('#play').classList.add('breath');
 const total=d.mode==='time'?d.mins*60:Infinity,goal=d.mode==='count'?d.count:Infinity;
 let done=0,cycles=0;const st=$('#bstage');
 const size=(s,dur)=>{st.style.setProperty('--s',s);st.style.setProperty('--d',dur+'s')};
 const info=()=>$('#ptime').textContent=d.mode==='time'?'剩餘 '+fmt(Math.max(0,total-done)):`第 ${Math.min(cycles+1,goal)} / ${goal} 次`;
 $('#pinfo').textContent=b.name;
 const cyc=()=>{let i=0;const step=()=>{
   if(i>=b.steps.length){cycles++;if(done>=total||cycles>=goal)return finish();return cyc()}
   const[k,sec]=b.steps[i];st.classList.toggle('hold',k==='hold');
   if(k==='in')size(.88,sec);else if(k==='out')size(.42,sec);
   $('#bstep').textContent=STEP[k];bSay(STEP[k]);if(k!=='hold')bSfx.breath(k,sec);P.buzz();
   let left=sec;const tick=()=>{if(play.paused)return play.timer=setTimeout(tick,300);
     if(left===0){i++;return step()}
     const n=sec-left+1;if(n>=2&&n<=10&&B.counting())bSfx.num(n);
     $('#bnum').textContent=left;info();
     left--;done++;play.timer=setTimeout(tick,1000)};tick()};step()};
 const end=()=>{bSfx.stop();bDim.off();const idx=addLog('breath',b.name,done,{cycles,breathId:b.id});hidePlay();st.classList.remove('hold');doneScreen(b.name,done,cycles+' 個循環',idx,()=>startBreath(b,d))};
 const finish=()=>{bSfx.bell();bSay('結束');end()};
 play.restart=()=>{st.classList.remove('hold');size(.42,1.2);bDim.arm();countdown(3,cyc,true)};
 play.end=end;
 st.classList.remove('hold');size(.42,0);info();bDim.arm();
 countdown(3,cyc,true);
}
registerTab('breath',rBreath);
