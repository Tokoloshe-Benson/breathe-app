// 共用核心（架構對話維護）：儲存、設定、平台層、導覽、練習全螢幕外框、完成畫面、練習紀錄
// 各分頁在自己的 js/<tab>.js 裡呼叫 registerTab('<key>', renderFn)，不要直接改這個檔案；
// 需要新的共用功能時，請告訴架構對話。
const $=s=>document.querySelector(s);
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const S=store.get('settings',{theme:'auto',voice:true,sound:true,vibrate:true});
function applyTheme(){const dark=S.theme==='dark'||(S.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light'}
applyTheme();
const isDark=()=>document.documentElement.dataset.theme==='dark';

// ---- 練習紀錄（所有分頁共用格式）----
// { t: 時間戳, type: 'breath'|'ex'|'st', name, sec: 總秒數, mood?: 1-5, ...各分頁自己的欄位 }
const LOG=()=>store.get('log',[]);
function addLog(type,name,sec,extra={}){const l=LOG();l.push({t:Date.now(),type,name,sec,...extra});store.set('log',l);return l.length-1}
function setLogMood(i,mood){const l=LOG();if(l[i]){l[i].mood=mood;store.set('log',l)}}

// ---- 平台層（之後包成 App 時換成 Capacitor 外掛）----
const P={
 // recorded voice clips (audio/f = 女聲 HsiaoChen, audio/m = 男聲 YunJhe); other words fall back to device TTS
 VK:{'準備':'prep','開始':'start','吸氣':'in','停住':'hold','吐氣':'out','結束':'end'},buf:{},
 ctx(){return P.ac=P.ac||new(window.AudioContext||window.webkitAudioContext)()},
 load(){const v=S.voiceType||'f';Object.values(P.VK).forEach(k=>{const id=v+'/'+k;if(P.buf[id])return;fetch('audio/'+id+'.mp3').then(r=>r.arrayBuffer()).then(a=>P.ctx().decodeAudioData(a)).then(b=>P.buf[id]=b).catch(()=>{})})},
 say(t){if(!S.voice)return;const b=P.buf[(S.voiceType||'f')+'/'+P.VK[t]];
  if(b){try{const ac=P.ctx(),s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);s.start()}catch(e){}return}
  if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='zh-TW';u.rate=.85;speechSynthesis.speak(u)},
 beep(f=520,d=.25){if(!S.sound)return;try{P.ctx();const o=P.ac.createOscillator(),g=P.ac.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(.0001,P.ac.currentTime);g.gain.exponentialRampToValueAtTime(.2,P.ac.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,P.ac.currentTime+d);o.connect(g).connect(P.ac.destination);o.start();o.stop(P.ac.currentTime+d)}catch(e){}},
 buzz(ms=80){if(S.vibrate&&navigator.vibrate)navigator.vibrate(ms)},
 async wake(on){try{if(on){P.lock=await navigator.wakeLock?.request('screen')}else{P.lock?.release();P.lock=null}}catch(e){}}
};
P.load();

// ---- 導覽 ----
const TABS={};
function registerTab(key,render){TABS[key]=render}
let tab='breath';
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.t));
function go(t){tab=t;document.body.dataset.tab=t;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));render()}
function render(){(TABS[tab]||(()=>{$('#view').innerHTML='<p class="empty">尚未完成</p>'}))()}

// ---- 練習全螢幕外框 ----
// 各分頁設定 play.restart（按「繼續」時）與 play.end（按「結束」時）
const play={timer:null,paused:false};
function showPlay(bg,fg){const p=$('#play');p.className='';p.style.background=bg;p.style.color=fg;p.classList.add('show');P.wake(true);$('#pbtn').textContent='暫停';$('#sbtn').style.display='none';play.paused=false}
function hidePlay(){clearTimeout(play.timer);$('#play').classList.remove('show');P.wake(false);window.speechSynthesis?.cancel()}
// b=true: breathing — says 準備 at the start, then a calm 開始 with a pause before the first step
function countdown(n,then,b){try{P.ctx().resume()}catch(e){}const p=b?'#b':'#c';$(p+'step').textContent='準備';$(p+'num').textContent=n;P.beep(440,.2);
 if(b&&n===3)setTimeout(()=>P.say('準備'),300);if(!b&&n===1)P.say('開始');
 play.timer=setTimeout(()=>{if(n>1)return countdown(n-1,then,b);if(!b)return then();
  $(p+'step').textContent='開始';$(p+'num').textContent='';P.say('開始');play.timer=setTimeout(then,1800)},1000)}
$('#pbtn').onclick=()=>{if(!play.paused){play.paused=true;clearTimeout(play.timer);window.speechSynthesis?.cancel();$('#pbtn').textContent='繼續';$('#sbtn').style.display=''}else{play.paused=false;$('#pbtn').textContent='暫停';$('#sbtn').style.display='none';clearTimeout(play.timer);play.restart()}};
$('#sbtn').onclick=()=>play.end();
function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}

// ---- 完成畫面（含心情；表情暫用系統 emoji，之後換 Microsoft Fluent Emoji）----
const MOODS=['😣','😕','😐','🙂','😄'];
function doneScreen(name,sec,extra,logIdx,again){
 $('#view').innerHTML=`<h1>完成 🎉</h1><div class="card"><div>${name}<small>${fmt(sec)}・${extra}</small></div></div>
 <div class="card" style="display:block">現在感覺如何？<small>可以跳過，之後在紀錄裡補選</small><div class="mood" style="margin-top:10px">${MOODS.map((m,i)=>`<button data-m="${i+1}">${m}</button>`).join('')}</div></div>
 <div class="row">${again?'<button id="again">再來一次</button>':''}<button class="pri" id="home">回到首頁</button></div>`;
 $('#view').querySelectorAll('.mood button').forEach(b=>b.onclick=()=>{setLogMood(logIdx,+b.dataset.m);$('#view').querySelectorAll('.mood button').forEach(x=>x.classList.toggle('on',x===b))});
 $('#home').onclick=render;if(again)$('#again').onclick=again;
}
