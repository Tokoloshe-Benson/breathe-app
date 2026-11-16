// 運動分頁（運動對話維護）— 規格見 docs/exercise.md
// 資料：ex.routines（計時器與菜單）、ex.moves（自訂動作）、ex.seeded；紀錄用共用 addLog('ex', …)
(()=>{
// ---------- 內建動作（30 個，分三級）----------
// type: reps 計次 / time 計時；n: 預設次數或秒數
const EXL=[
 ['jj','開合跳',1,'全身・心肺','time',30,'雙腳跳開同時雙手舉過頭，再跳回併攏。膝蓋微彎，輕輕落地。'],
 ['sq','徒手深蹲',1,'腿・臀','reps',15,'雙腳與肩同寬，臀部往後坐到大腿約與地面平行。膝蓋和腳尖同方向，背打直。'],
 ['kpu','跪姿伏地挺身',1,'胸・手臂','reps',10,'膝蓋著地，頭到膝蓋成一直線。雙手比肩略寬，胸口下降接近地面再推起。'],
 ['gb','臀橋',1,'臀・腿後側','reps',15,'仰躺屈膝，腳跟踩地把臀部推高到肩、髖、膝成一直線，在最高點夾緊臀部。'],
 ['ws','靠牆靜蹲',1,'腿','time',30,'背貼牆往下滑到膝蓋約 90 度，膝蓋不超過腳尖，保持不動。'],
 ['cr','捲腹',1,'腹部','reps',15,'仰躺屈膝，用腹部力量把肩膀捲離地面，下背貼地，不要用手拉脖子。'],
 ['bd','鳥狗式',1,'核心・背','reps',10,'四足跪姿，同時伸直對側的手和腳，身體保持穩定不旋轉；左右各一次算一下。'],
 ['db','死蟲式',1,'核心','reps',10,'仰躺手腳朝上，下背貼地，緩慢放下對側的手和腳再收回；左右各一次算一下。'],
 ['mp','原地踏步',1,'全身・心肺','time',60,'原地踏步，手臂自然擺動，可以慢慢把膝蓋抬高。'],
 ['sll','側躺抬腿',1,'臀側','reps',12,'側躺身體成一直線，上方的腿伸直往上抬再慢慢放下，做完換邊。'],
 ['pu','伏地挺身',2,'胸・手臂','reps',10,'雙手比肩略寬，頭到腳跟成一直線，胸口下降接近地面再推起。'],
 ['lg','弓箭步',2,'腿・臀','reps',12,'一腳往前跨，雙膝彎到約 90 度，前膝不要內夾，推回原位換腳。'],
 ['pl','平板支撐',2,'核心','time',30,'手肘在肩膀正下方，身體成一直線，收緊腹部和臀部，不要塌腰。'],
 ['spl','側平板支撐',2,'核心側邊','time',20,'側躺用手肘撐起，身體成一直線，臀部不要往下掉，做完換邊。'],
 ['mc','登山者',2,'核心・心肺','time',30,'高棒式姿勢，輪流把膝蓋快速拉向胸口，臀部不要翹高。'],
 ['hk','高抬腿',2,'心肺・腿','time',30,'原地快速跑步，膝蓋抬到約髖部高度，用前腳掌著地。'],
 ['ll','仰臥抬腿',2,'下腹','reps',12,'仰躺雙腿伸直，下背貼地，慢慢抬腿到垂直再慢慢放下，腳不碰地。'],
 ['rt','俄羅斯轉體',2,'腹斜肌','reps',20,'坐姿上身微微後傾、雙腳可以離地，雙手合握左右轉動軀幹；左右各算一下。'],
 ['ssq','相撲深蹲',2,'腿內側・臀','reps',15,'雙腳站得比肩寬、腳尖朝外，往下蹲時膝蓋朝腳尖方向打開。'],
 ['sm','超人式',2,'背','reps',12,'趴著，同時把雙手和雙腳抬離地面，停一下再放下，脖子保持自然。'],
 ['bp','波比跳',3,'全身・心肺','reps',10,'蹲下雙手撐地，雙腳往後跳成棒式，再跳回來、起身往上跳。'],
 ['js','跳躍深蹲',3,'腿・心肺','reps',12,'深蹲後用力往上跳，落地時膝蓋微彎緩衝，直接接下一下。'],
 ['jl','跳躍弓箭步',3,'腿・心肺','reps',12,'弓箭步姿勢往上跳，在空中換腳，落地成另一邊的弓箭步。'],
 ['dpu','鑽石伏地挺身',3,'手臂後側・胸','reps',8,'雙手在胸口下方用拇指和食指圍成菱形，手肘貼近身體做伏地挺身。'],
 ['bss','保加利亞分腿蹲',3,'腿・臀','reps',10,'後腳背放在椅子或床沿上，前腳往下蹲，上身保持直立，做完換邊。（需要椅子或床沿）'],
 ['sgb','單腳臀橋',3,'臀・腿後側','reps',10,'臀橋姿勢把一隻腳伸直抬起，用支撐腳把臀部推高，做完換邊。'],
 ['vu','V字起坐',3,'腹部','reps',10,'仰躺手腳伸直，同時抬起上身和雙腿在上方碰觸，身體成 V 字。'],
 ['pjj','平板開合跳',3,'核心・心肺','time',30,'高棒式姿勢，雙腳像開合跳一樣跳開再跳回，臀部保持穩定。'],
 ['dcp','下斜伏地挺身',3,'上胸・肩','reps',10,'雙腳放在椅子或床沿上，雙手撐地做伏地挺身，身體保持一直線。（需要椅子或床沿）'],
 ['spu','蜘蛛人伏地挺身',3,'胸・核心','reps',8,'下降時把同側膝蓋往手肘方向帶，推起後換邊。'],
].map(([id,name,lv,part,type,n,tip])=>({id,name,lv,part,type,n,tip}));
const LV=['','初級','中級','高級'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clone=o=>JSON.parse(JSON.stringify(o));
const myMoves=()=>store.get('ex.moves',[]);
const allMoves=()=>[...EXL,...myMoves().map(m=>({...m,mine:true}))];
const findMove=name=>{const t=String(name||'').trim();return t&&allMoves().find(m=>m.name===t)};
const routines=()=>store.get('ex.routines',[]);
const saveRoutines=a=>store.set('ex.routines',a);

// ---------- 預設資料與範本 ----------
const newIv=()=>({name:'',mode:'iv',work:30,rest:15,sets:3,n:10,period:60});
const newStep=()=>({t:'reps',name:'',n:12,sets:3,rest:30,kg:'',auto:true});
const newRest=()=>({t:'rest',n:30});
const blank=kind=>({id:uid(),kind,name:'',prep:10,loops:1,loopRest:60,items:[kind==='iv'?newIv():newStep()]});
const TPL=[
 {id:'tpl-tabata',kind:'iv',name:'Tabata',prep:10,loops:1,loopRest:60,items:[{...newIv(),work:20,rest:10,sets:8}]},
 {id:'tpl-emom',kind:'iv',name:'EMOM 10 分鐘',prep:10,loops:1,loopRest:60,items:[{...newIv(),name:'徒手深蹲',mode:'emom',n:12,sets:10}]},
];
function seed(){
 if(store.get('ex.seeded',false))return;
 const a=routines(),old=store.get('excfg',null),M=(name,t,n,sets,rest)=>({t,name,n,sets,rest,kg:''});
 if(old)a.push({id:uid(),kind:'iv',name:'我的間歇',prep:10,loops:1,loopRest:60,items:[{...newIv(),work:+old.work||20,rest:+old.rest||0,sets:+old.rounds||8}]});
 a.push({id:uid(),kind:'menu',name:'初級全身',prep:10,loops:1,loopRest:60,items:[
  M('開合跳','time',30,1,0),M('徒手深蹲','reps',15,3,30),M('跪姿伏地挺身','reps',10,3,30),{t:'rest',n:45},
  M('臀橋','reps',15,3,30),M('鳥狗式','reps',10,2,20),M('捲腹','reps',15,2,20)]});
 saveRoutines(a);store.set('ex.seeded',true);
}

// ---------- 把計時器／菜單展開成一步一步 ----------
function build(r){
 const out=[],L=Math.max(1,+r.loops||1),pos=v=>Math.max(1,Math.round(+v)||1);
 for(let l=1;l<=L;l++){
  r.items.forEach((it,ii)=>{
   const name=String(it.name||'').trim();
   if(r.kind==='iv'){const sets=pos(it.sets);
    for(let s=1;s<=sets;s++){
     if(it.mode==='emom')out.push({k:'emom',name:name||'運動',named:!!name,n:pos(it.n),sec:Math.max(10,+it.period||60),set:s,sets,ii,loop:l});
     else{out.push({k:'time',name:name||'運動',named:!!name,sec:pos(it.work),set:s,sets,ii,loop:l});if(+it.rest>0)out.push({k:'rest',sec:Math.round(+it.rest)})}}}
   else if(it.t==='rest'){if(+it.n>0)out.push({k:'rest',sec:Math.round(+it.n)})}
   else{const sets=pos(it.sets),n=pos(it.n);
    for(let s=1;s<=sets;s++){out.push({k:it.t==='time'?'time':'reps',name:name||'動作',named:true,n,sec:n,kg:it.kg,set:s,sets,ii,loop:l});
     if(s<sets&&+it.rest>0)out.push({k:'rest',sec:Math.round(+it.rest)})}}
  });
  if(l<L&&+r.loopRest>0)out.push({k:'rest',sec:Math.round(+r.loopRest)});
 }
 const steps=[];out.forEach(s=>{const p=steps[steps.length-1];if(s.k==='rest'&&p&&p.k==='rest')p.sec=Math.max(p.sec,s.sec);else steps.push(s)});
 while(steps.length&&steps[0].k==='rest')steps.shift();
 while(steps.length&&steps[steps.length-1].k==='rest')steps.pop();
 return steps;
}
const est=r=>build(r).reduce((a,s)=>a+(s.k==='reps'?s.n*3:s.sec),0)+(+r.prep||0);
function summary(r){
 const its=r.items,loops=+r.loops>1?`・${r.loops} 輪`:'';
 if(r.kind==='iv'){if(its.length!==1)return its.length+' 個區段'+loops;const it=its[0];
  return(it.mode==='emom'?`EMOM 每分鐘 ${it.n} 下 × ${it.sets} 分`:`${it.work} 秒／${it.rest} 秒 × ${it.sets} 組`)+loops}
 return its.filter(i=>i.t!=='rest').length+' 個動作'+loops;
}
const desc=s=>s.k==='reps'||s.k==='emom'?`${s.name} ${s.n} 下`:`${s.name} ${s.sec} 秒`;

// ---------- 列表頁 ----------
const U={tab:'iv',view:'home',draft:null,lv:0,mf:null};
function rEx(){
 seed();if(U.view==='edit'&&U.draft)return rEdit();U.view='home';
 const seg=`<div class="ex-seg">${[['iv','間歇計時'],['menu','菜單'],['moves','動作']].map(([k,t])=>`<button data-seg="${k}" class="${U.tab===k?'on':''}">${t}</button>`).join('')}</div>`;
 let body;
 if(U.tab==='moves')body=movesHTML();
 else{const iv=U.tab==='iv',list=routines().filter(r=>r.kind===U.tab),w=iv?'計時器':'菜單';
  body=`<h2 class="ex-h">我的${w}</h2>`+(list.length?list.map(r=>card(r,false)).join(''):`<p class="empty ex-empty">還沒有${w}</p>`)+
   `<button class="ex-add" data-new="${U.tab}">＋ 新增${w}</button>`+(iv?`<h2 class="ex-h">範本</h2>`+TPL.map(r=>card(r,true)).join(''):'')}
 $('#view').innerHTML=`<div id="exroot"><h1>運動</h1>${seg}${body}</div>`;
 bindRoot();
}
const card=(r,tpl)=>`<div class="card ex-card"><div class="ex-ci"><b>${esc(r.name)}</b><small>${esc(summary(r))}・約 ${Math.max(1,Math.round(est(r)/60))} 分鐘</small></div>
 <div class="ex-acts">${tpl?`<button data-copy="${r.id}">複製</button>`:`<button data-edit="${r.id}">編輯</button>`}<button class="pri" data-go="${r.id}">開始</button></div></div>`;
const getR=id=>routines().find(r=>r.id===id)||TPL.find(r=>r.id===id);

function movesHTML(){
 const lv=U.lv,ms=allMoves().filter(m=>lv===0||(lv===4?m.mine:m.lv===lv));
 const chips=`<div class="ex-chips">${['全部','初級','中級','高級','自訂'].map((t,i)=>`<button data-lv="${i}" class="${lv===i?'on':''}">${t}</button>`).join('')}</div>`;
 const mv=m=>`<details class="card ex-mv"><summary><b>${esc(m.name)}</b><small>${LV[m.lv]||''}・${esc(m.part||'—')}・${m.type==='reps'?`計次 ${m.n} 下`:`計時 ${m.n} 秒`}${m.mine?'・自訂':''}</small></summary>
  <p>${esc(m.tip)||'（沒有動作要點）'}</p>${m.mine?`<div class="row"><button data-editmove="${m.id}">編輯</button><button class="ex-danger" data-delmove="${m.id}">刪除</button></div>`:''}</details>`;
 let list;
 if(lv===0)list=[1,2,3].map(l=>{const g=ms.filter(m=>m.lv===l);return g.length?`<h2 class="ex-h">${LV[l]}</h2>`+g.map(mv).join(''):''}).join('');
 else list=ms.length?ms.map(mv).join(''):`<p class="empty ex-empty">${lv===4?'還沒有自訂動作':'沒有動作'}</p>`;
 return chips+(U.mf?moveForm():`<button class="ex-add" data-newmove>＋ 新增自訂動作</button>`)+list;
}
function moveForm(){const m=U.mf;
 return`<div class="card ex-form ex-mf"><b>${m.id?'編輯':'新增'}自訂動作</b>
 <label class="ex-full">名稱<input id="mfName" value="${esc(m.name)}" placeholder="例如：啞鈴肩推"></label>
 <div class="row"><select id="mfLv">${[1,2,3].map(l=>`<option value="${l}" ${m.lv==l?'selected':''}>${LV[l]}</option>`).join('')}</select>
 <input id="mfPart" value="${esc(m.part)}" placeholder="主要部位" style="width:120px"></div>
 <div class="row"><select id="mfType"><option value="reps">計次</option><option value="time" ${m.type==='time'?'selected':''}>計時</option></select>
 預設 <input id="mfN" type="number" min="1" value="${m.n}"></div>
 <label class="ex-full">動作要點<textarea id="mfTip" rows="2" placeholder="一兩句提醒（可不填）">${esc(m.tip)}</textarea></label>
 <div class="row"><button data-mfcancel>取消</button><button class="pri" data-mfsave>儲存</button></div></div>`}

// ---------- 編輯畫面（計時器與菜單共用）----------
const num=(i,f,v,ph='')=>`<input type="number" min="0" inputmode="numeric" data-i="${i}" data-f="${f}" value="${esc(v)}" placeholder="${ph}">`;
function itemHTML(d,it,i){
 const rest=d.kind==='menu'&&it.t==='rest';
 const h=`<div class="ex-item${rest?' rest':''}" data-i="${i}"><div class="ex-ih"><span class="ex-drag" data-drag aria-label="拖曳排序">≡</span><b>${rest?'休息':(d.kind==='iv'?'區段 ':'動作 ')+(i+1)}</b><span class="ex-sp"></span><button data-dupitem="${i}">複製</button><button data-delitem="${i}">刪除</button></div>`;
 if(rest)return h+`<div class="row">休息 ${num(i,'n',it.n)} 秒</div></div>`;
 const name=`<input class="ex-name" data-i="${i}" data-f="name" list="exnames" value="${esc(it.name)}" placeholder="${d.kind==='iv'?'動作名稱（可不填）':'從清單選或輸入名稱'}">`;
 if(d.kind==='iv')return h+name+`<div class="row"><select data-i="${i}" data-f="mode"><option value="iv">間歇</option><option value="emom" ${it.mode==='emom'?'selected':''}>EMOM（每分鐘）</option></select></div>`+
  (it.mode==='emom'?`<div class="row">每分鐘做 ${num(i,'n',it.n)} 下，共 ${num(i,'sets',it.sets)} 分鐘</div>`
   :`<div class="row">運動 ${num(i,'work',it.work)} 秒・休息 ${num(i,'rest',it.rest)} 秒</div><div class="row">${num(i,'sets',it.sets)} 組</div>`)+'</div>';
 return h+name+`<div class="row"><select data-i="${i}" data-f="t"><option value="reps">計次</option><option value="time" ${it.t==='time'?'selected':''}>計時</option></select>
  ${num(i,'n',it.n)} ${it.t==='time'?'秒':'下'} × ${num(i,'sets',it.sets)} 組</div>
  <div class="row">組間休息 ${num(i,'rest',it.rest)} 秒</div>
  <div class="row">重量 <input type="number" min="0" step="0.5" inputmode="decimal" data-i="${i}" data-f="kg" value="${esc(it.kg)}" placeholder="可不填"> kg</div></div>`;
}
function rEdit(){
 const d=U.draft,iv=d.kind==='iv',w=iv?'計時器':'菜單',isNew=!routines().some(r=>r.id===d.id),e=est(d);
 $('#view').innerHTML=`<div id="exroot"><h1>${isNew?'新增':'編輯'}${w}<button data-cancel>取消</button></h1>
 <div class="card ex-form"><label class="ex-full">名稱<input data-f="name" value="${esc(d.name)}" placeholder="${iv?'例如：早晨間歇':'例如：上半身'}"></label>
 <div class="row">準備倒數 ${num('','prep',d.prep)} 秒</div>
 <div class="row">大循環 ${num('','loops',d.loops)} 輪</div>
 <div class="row">輪間休息 ${num('','loopRest',d.loopRest)} 秒<small class="ex-hint">（大循環 2 輪以上才有）</small></div></div>
 <div id="exitems">${d.items.map((it,i)=>itemHTML(d,it,i)).join('')}</div>
 <div class="row">${iv?'<button class="ex-add" data-additem="iv">＋ 新增區段</button>':'<button class="ex-add" data-additem="step">＋ 新增動作</button><button class="ex-add" data-additem="rest">＋ 新增休息</button>'}</div>
 <p class="ex-est">${d.items.length?`總共約 ${Math.max(1,Math.round(e/60))} 分鐘（計次動作以每下 3 秒估算）`:''}</p>
 <div class="row ex-save">${isNew?'':'<button class="ex-danger" data-del>刪除</button><button data-dup>複製一份</button>'}<button class="pri" data-save>儲存</button></div>
 <datalist id="exnames">${allMoves().map(m=>`<option value="${esc(m.name)}">`).join('')}</datalist></div>`;
 bindRoot();
}
function setField(el){
 const d=U.draft,f=el.dataset.f,raw=el.value,isNum=el.type==='number'&&f!=='kg';
 const v=isNum?(raw===''?'':Math.max(0,+raw)):raw;
 if(el.dataset.i===''||el.dataset.i===undefined){d[f]=v;return}
 const it=d.items[+el.dataset.i];it[f]=v;if(f==='t'||f==='n')it.auto=false;
}
function normalize(d){
 const n=(v,def,min=0)=>{v=Math.round(+v);return isNaN(v)||v<min||v===''?def:v};
 d.name=String(d.name||'').trim()||(d.kind==='iv'?'我的計時器':'我的菜單');
 d.prep=n(d.prep,10);d.loops=n(d.loops,1,1);d.loopRest=n(d.loopRest,60);
 d.items.forEach(it=>{if('work'in it){it.work=n(it.work,30,1);it.rest=n(it.rest,0);it.sets=n(it.sets,1,1);it.n=n(it.n,10,1)}
  else if(it.t==='rest')it.n=n(it.n,30,1);else{it.n=n(it.n,12,1);it.sets=n(it.sets,1,1);it.rest=n(it.rest,0);it.kg=it.kg===''||isNaN(+it.kg)?'':+it.kg;delete it.auto}});
 return d;
}

// ---------- 事件 ----------
function bindRoot(){
 const root=$('#exroot');if(!root)return;
 root.onclick=onClick;
 root.oninput=e=>{if(e.target.dataset.f!==undefined&&U.draft){setField(e.target);updEst()}};
 // only selects and an auto-filled move name change the layout; other fields update in place so focus is kept
 root.onchange=e=>{const el=e.target;if(el.dataset.f===undefined||!U.draft)return;setField(el);
  if(el.dataset.f==='name'&&el.dataset.i&&U.draft.kind==='menu'){const it=U.draft.items[+el.dataset.i],m=findMove(el.value);
   if(m&&it.auto!==false&&(it.t!==m.type||it.n!==m.n)){it.t=m.type;it.n=m.n;it.auto=true;return rEditKeep()}}
  if(el.tagName==='SELECT')rEditKeep()};
 root.onpointerdown=onDrag;
}
function updEst(){const el=$('#exroot .ex-est');if(!el)return;const d=clone(U.draft);
 try{d.items=d.items.filter(it=>it.t!=='rest'||+it.n>0);el.textContent=d.items.length?`總共約 ${Math.max(1,Math.round(est(d)/60))} 分鐘（計次動作以每下 3 秒估算）`:''}catch(e){}}
// re-render the editor but keep scroll position
function rEditKeep(){const y=scrollY;rEdit();scrollTo(0,y)}
function onClick(e){
 const b=e.target.closest('button');if(!b)return;const ds=b.dataset,d=U.draft;
 if(ds.seg){U.tab=ds.seg;U.mf=null;return rEx()}
 if(ds.new){U.draft=blank(ds.new);U.view='edit';return rEx()}
 if(ds.edit){U.draft=clone(getR(ds.edit));U.view='edit';return rEx()}
 if(ds.copy){const r=clone(getR(ds.copy));r.id=uid();U.draft=r;U.view='edit';return rEx()}
 if(ds.go)return startEx(getR(ds.go));
 if(ds.lv!==undefined){U.lv=+ds.lv;return rEx()}
 if(ds.newmove!==undefined){U.mf={id:null,name:'',lv:1,part:'',type:'reps',n:12,tip:''};return rEx()}
 if(ds.editmove){U.mf=clone(myMoves().find(m=>m.id===ds.editmove));return rEx()}
 if(ds.delmove){const m=myMoves().find(x=>x.id===ds.delmove);if(m&&confirm(`刪除自訂動作「${m.name}」？已經排進菜單的不受影響。`)){store.set('ex.moves',myMoves().filter(x=>x.id!==m.id))}return rEx()}
 if(ds.mfcancel!==undefined){U.mf=null;return rEx()}
 if(ds.mfsave!==undefined){const name=$('#mfName').value.trim();if(!name)return alert('請輸入動作名稱');
  const dup=allMoves().find(m=>m.name===name&&m.id!==U.mf.id);if(dup)return alert('已經有同名的動作了');
  const m={id:U.mf.id||'c'+uid(),name,lv:+$('#mfLv').value,part:$('#mfPart').value.trim(),type:$('#mfType').value,n:Math.max(1,Math.round(+$('#mfN').value)||12),tip:$('#mfTip').value.trim()};
  const a=myMoves(),k=a.findIndex(x=>x.id===m.id);if(k>=0)a[k]=m;else a.push(m);store.set('ex.moves',a);U.mf=null;U.lv=4;return rEx()}
 if(!d)return;
 if(ds.cancel!==undefined){U.draft=null;U.view='home';return rEx()}
 if(ds.additem){d.items.push(ds.additem==='iv'?newIv():ds.additem==='rest'?newRest():newStep());rEditKeep();return scrollTo(0,document.body.scrollHeight)}
 if(ds.dupitem!==undefined){const i=+ds.dupitem;d.items.splice(i+1,0,clone(d.items[i]));return rEditKeep()}
 if(ds.delitem!==undefined){d.items.splice(+ds.delitem,1);return rEditKeep()}
 if(ds.save!==undefined||ds.dup!==undefined){
  if(!d.items.some(it=>it.t!=='rest'))return alert('至少要有一個動作或區段');
  normalize(d);const a=routines(),k=a.findIndex(r=>r.id===d.id);
  if(ds.dup!==undefined){const c=clone(d);c.id=uid();c.name=d.name+'（複製）';a.push(c);saveRoutines(a);U.draft=c;return rEdit()}
  if(k>=0)a[k]=d;else a.push(d);saveRoutines(a);U.tab=d.kind;U.draft=null;U.view='home';return rEx()}
 if(ds.del!==undefined){if(!confirm(`刪除「${d.name||'這份'}」？刪除後無法復原。`))return;saveRoutines(routines().filter(r=>r.id!==d.id));U.draft=null;U.view='home';return rEx()}
}
// 拖曳排序：抓住 ≡ 上下移動，其他項目讓位，放開後才真正改順序
function onDrag(e){
 const hd=e.target.closest('[data-drag]');if(!hd||!U.draft)return;e.preventDefault();
 const item=hd.closest('.ex-item'),list=$('#exitems');item.classList.add('drag');
 try{hd.setPointerCapture(e.pointerId)}catch(_){}
 const mv=ev=>{for(const el of list.children){if(el===item)continue;const r=el.getBoundingClientRect();
   if(ev.clientY>r.top+r.height*.25&&ev.clientY<r.bottom-r.height*.25){
    if(el.compareDocumentPosition(item)&Node.DOCUMENT_POSITION_FOLLOWING)list.insertBefore(el,item.nextSibling);else list.insertBefore(el,item);break}}};
 const up=()=>{hd.removeEventListener('pointermove',mv);hd.removeEventListener('pointerup',up);hd.removeEventListener('pointercancel',up);
  const order=[...list.children].map(x=>+x.dataset.i);U.draft.items=order.map(i=>U.draft.items[i]);rEditKeep()};
 hd.addEventListener('pointermove',mv);hd.addEventListener('pointerup',up);hd.addEventListener('pointercancel',up);
}

// ---------- 練習中 ----------
const C=2*Math.PI*54;
const X={};
const STAGE=`<div id="exstage">
<div class="ex-top"><span id="exProg"></span><button id="exEnd">結束</button></div>
<div id="exPhase"></div><div id="exName"></div><button id="exReps"></button>
<div id="exRing"><svg viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="54"/><circle class="bar" id="exBar" cx="60" cy="60" r="54" stroke-dasharray="${C}"/></svg>
<div class="ex-mid"><div id="exNum"></div><div id="exUnit"></div></div></div>
<div id="exAdj"><button data-d="-1" aria-label="減少">−</button><span>實際次數</span><button data-d="1" aria-label="增加">＋</button></div>
<div id="exSet"></div>
<div class="ex-main"><button id="exDone">完成</button><button id="exMore">＋10 秒</button></div>
<div id="exNext"></div>
<div class="ex-ctl"><button id="exPrev">上一步</button><button id="exPause">暫停</button><button id="exSkip">跳過</button></div>
<div id="exConfirm"><div class="ex-dlg"><b>確定要結束嗎？</b><small>已完成的部分會保留在紀錄裡</small><div class="row"><button id="exNo">繼續運動</button><button id="exYes" class="pri">結束</button></div></div></div>
</div>`;
const cur=()=>X.i<0?null:X.steps[X.i];
const isWork=s=>s&&s.k!=='rest';
const nextWork=i=>X.steps.slice(i+1).find(isWork);
function say(t,delay=180){setTimeout(()=>{if(!play.paused)P.say(t)},delay)}
// ---------- 預錄語音（audio/ex/{f,m}/）----------
// 一句話拆成片段（動作名稱、數字、下／秒、休息、下一個），依序接起來播放；
// 只要缺任何一段（例如自訂動作名稱、不常見的秒數），整句改用 P.say（手機語音）。
const NUMS=new Set([...Array(60)].map((_,i)=>i+1).concat([70,75,80,90,100,120,150,180]));
const VB={},voiceNow=[];
const vt=()=>S.voiceType||'f';
function toks(s){
 if(!s.named)return['w_go'];const m=EXL.find(x=>x.name===s.name),n=s.k==='reps'||s.k==='emom'?s.n:s.sec;
 return m&&NUMS.has(n)?['mv_'+m.id,'n'+n,s.k==='reps'||s.k==='emom'?'w_rep':'w_sec']:null}
function restToks(sec,nw){const a=sec==null?['w_rest']:NUMS.has(sec)?['w_rest','n'+sec,'w_sec']:null,b=nw?toks(nw):[];
 return a&&b?(nw?[...a,',','w_next',...b]:a):null}
function loadClips(keys){const v=vt();keys.forEach(k=>{if(k===','||VB[v+'/'+k])return;VB[v+'/'+k]=1;
 fetch(`audio/ex/${v}/${k}.mp3`).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(a=>P.ctx().decodeAudioData(a)).then(b=>VB[v+'/'+k]=b).catch(()=>delete VB[v+'/'+k])})}
function hush(){voiceNow.splice(0).forEach(x=>{try{x.stop()}catch(e){}});window.speechSynthesis?.cancel()}
function speak(keys,text,delay=180){
 setTimeout(()=>{if(play.paused||!S.voice)return;hush();const v=vt();
  if(!keys||!keys.every(k=>k===','||VB[v+'/'+k] instanceof AudioBuffer))return P.say(text);
  try{const ac=P.ctx();let t=ac.currentTime+.03;
   keys.forEach(k=>{if(k===','){t+=.28;return}const b=VB[v+'/'+k],src=ac.createBufferSource();src.buffer=b;src.connect(ac.destination);src.start(t);voiceNow.push(src);t+=b.duration+.07})}
  catch(e){P.say(text)}},delay)}
function preloadFor(steps){const ks=new Set(['w_go','w_rest','w_next','w_sec','w_rep']);
 steps.forEach(s=>{(s.k==='rest'?['n'+s.sec]:toks(s)||[]).forEach(k=>ks.add(k))});loadClips([...ks])}
function startEx(r){
 if(!r)return;try{P.ctx().resume()}catch(e){}
 const steps=build(r);if(!steps.length)return alert('這份還沒有任何動作');
 Object.assign(X,{r,steps,i:-1,left:Math.max(0,+r.prep||0),elapsed:0,emomRest:false,adj:false,
  res:steps.map(s=>s.k==='rest'?null:{done:false,skipped:false,actual:s.k==='time'?null:s.n})});
 preloadFor(steps);showPlay('#FBEDE6','#712B13');const p=$('#play');p.classList.add('ex');$('#exstage')?.remove();p.insertAdjacentHTML('beforeend',STAGE);bindStage();
 play.end=()=>finish(false);play.restart=run;
 if(X.left>0){paint();say('準備',0);run()}else{enter(0);run()}
}
function run(){clearTimeout(play.timer);if(!play.paused)play.timer=setTimeout(tick,1000)}
function enter(i){
 X.i=i;X.emomRest=false;X.adj=false;X.stepT=0;const s=cur();X.left=s.k==='reps'?null:s.sec;paint();
 if(s.k==='rest'){P.beep(440,.3);const nw=nextWork(i);speak(restToks(s.sec,nw),`休息 ${s.sec} 秒`+(nw?`，下一個，${desc(nw)}`:''))}
 else{P.beep(880,.3);speak(toks(s),s.named?desc(s):'運動')}
}
function next(){if(X.i+1>=X.steps.length)return finish(true);enter(X.i+1);run()}
function tick(){
 if(play.paused)return;const s=cur();
 if(!s){X.left--;if(X.left<=0){enter(0);return run()}if(X.left<=3)P.beep(660,.12);paint();return run()}
 X.elapsed++;X.stepT++;
 if(s.k==='reps'){paint();return run()}
 X.left--;
 if(X.left<=0){if(isWork(s))X.res[X.i].done=true;return next()}
 if(X.left<=3)P.beep(660,.12);
 paint();run();
}
function paint(){
 const s=cur(),dk=isDark(),rest=!s||s.k==='rest'||X.emomRest,p=$('#play'),st=$('#exstage');if(!st)return;
 p.style.background=dk?'#1C120E':(rest?'#FBEDE6':'#DE7A55');p.style.color=dk?'#F5C4B3':(rest?'#712B13':'#fff');
 st.className=(rest?'rest':'work')+(dk?' dark':'');
 const works=X.steps.filter(isWork),wi=s?X.steps.slice(0,X.i+1).filter(isWork).length:0;
 $('#exProg').textContent=`動作 ${Math.max(1,wi+(s&&!isWork(s)?1:0))}／${works.length}`;
 const nw=s?nextWork(X.i):X.steps.find(isWork);
 $('#exPhase').textContent=!s?'準備開始':rest?'休息':'運動中';
 $('#exName').textContent=!s?desc(nw):s.k==='rest'?'休息':X.emomRest?s.name+'　完成':s.name;
 let n,unit,frac=1;const r=s&&X.res[X.i],canAdj=s&&(s.k==='reps'||(s.k==='emom'&&!X.emomRest));
 // 圓圈裡只放秒數；次數放在動作名稱下方（點一下可改實際次數）
 if(!s){n=X.left;unit='秒';frac=X.left/Math.max(1,+X.r.prep||1)}
 else if(s.k==='reps'){n=X.stepT;unit='秒・已進行'}
 else{n=X.left;unit='秒';frac=X.left/s.sec}
 $('#exNum').textContent=n;$('#exUnit').textContent=unit;
 const rb=$('#exReps');rb.style.display=canAdj?'':'none';
 if(canAdj){rb.textContent=`${r.actual} 下`+(r.actual!==s.n?`（目標 ${s.n}）`:'');rb.classList.toggle('on',!!X.adj);rb.setAttribute('aria-label',`實際 ${r.actual} 下，點一下修改`)}
 $('#exBar').style.strokeDashoffset=C*(1-Math.max(0,Math.min(1,frac)));
 $('#exAdj').classList.toggle('show',!!(canAdj&&X.adj));
 $('#exSet').textContent=isWork(s)?`第 ${s.set}／${s.sets} 組`+(s.kg!==''&&s.kg!=null?`・${s.kg} kg`:'')+(+X.r.loops>1?`・第 ${s.loop}／${X.r.loops} 輪`:''):'';
 $('#exDone').style.display=canAdj?'':'none';$('#exMore').style.display=s&&s.k==='rest'?'':'none';
 $('#exNext').textContent=!s?'':nw?`下一個：${desc(nw)}`:'這是最後一個了';
 $('#exPrev').disabled=!s||!X.steps.slice(0,X.i).some(isWork);
 $('#exPause').textContent=play.paused?'繼續':'暫停';
}
function bindStage(){
 $('#exPause').onclick=()=>{play.paused=!play.paused;if(play.paused){clearTimeout(play.timer);hush()}paint();run()};
 $('#exDone').onclick=()=>{const s=cur();X.res[X.i].done=true;X.res[X.i].skipped=false;
  if(s.k==='emom'&&X.left>1){X.emomRest=true;X.adj=false;P.beep(440,.3);const nw=nextWork(X.i);speak(restToks(null,nw),'休息'+(nw?`，下一個，${desc(nw)}`:''));paint()}else{next()}};
 $('#exReps').onclick=()=>{X.adj=!X.adj;paint()};
 $('#exAdj').onclick=e=>{const b=e.target.closest('button'),s=cur();if(!b||!s||s.k==='time'||s.k==='rest'||X.emomRest)return;const r=X.res[X.i];r.actual=Math.max(0,r.actual+ +b.dataset.d);paint()};
 $('#exMore').onclick=()=>{X.left+=10;paint()};
 $('#exSkip').onclick=()=>{const s=cur();if(!s){enter(0);return run()}if(isWork(s)&&!X.res[X.i].done)X.res[X.i].skipped=true;next()};
 $('#exPrev').onclick=()=>{let j=X.i-1;while(j>=0&&!isWork(X.steps[j]))j--;if(j<0)return;
  const s=X.steps[j];X.res[j]={done:false,skipped:false,actual:s.k==='time'?null:s.n};enter(j);run()};
 $('#exEnd').onclick=()=>{X.wasPaused=play.paused;play.paused=true;clearTimeout(play.timer);hush();$('#exConfirm').classList.add('show');paint()};
 $('#exNo').onclick=()=>{$('#exConfirm').classList.remove('show');play.paused=X.wasPaused;paint();run()};
 $('#exYes').onclick=()=>finish(false);
}
function finish(complete){
 clearTimeout(play.timer);hush();
 const steps=[],skipped=[];let notReached=0;const moves=new Set();
 X.steps.forEach((s,i)=>{if(!isWork(s))return;const r=X.res[i];
  steps.push({name:s.name,k:s.k,set:s.set,loop:s.loop,target:s.k==='time'?s.sec:s.n,actual:r.done?(s.k==='time'?s.sec:r.actual):0,kg:s.kg===''?undefined:s.kg,done:r.done,skipped:r.skipped});
  if(r.done)moves.add(s.ii);else if(r.skipped)skipped.push(s);else notReached++});
 const sets=steps.filter(x=>x.done).length;
 const idx=addLog('ex',X.r.name,X.elapsed,{kind:X.r.kind,routine:X.r.id,steps,sets,skipped:skipped.length,complete});
 if(complete){P.beep(660,.8);P.say('結束')}
 const r=X.r;hidePlay();$('#exstage')?.remove();$('#play').classList.remove('ex');play.paused=false;U.view='home';
 doneScreen(esc(r.name),X.elapsed,`${moves.size} 個動作・${sets} 組`+(complete?'':'（提早結束）'),idx,()=>startEx(r));
 const notes=[];
 if(skipped.length)notes.push(`跳過：${skipped.map(s=>`${esc(s.name)} 第 ${s.set} 組`).join('、')}`);
 if(notReached)notes.push(`還沒做到：${notReached} 組`);
 if(notes.length)$('#view .card')?.insertAdjacentHTML('afterend',`<div class="card ex-skip"><div>${notes.map(t=>`<small>${t}</small>`).join('')}</div></div>`);
}

registerTab('ex',rEx);
})();
