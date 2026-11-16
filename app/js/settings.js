// 設定頁（架構對話維護）：從習慣分頁右上齒輪進入
function rSettings(){
 $('#view').innerHTML=`<h1>設定<button onclick="render()">返回</button></h1>
 <div class="card">外觀<select id="th" style="width:auto"><option value="auto">跟隨系統</option><option value="light">淺色</option><option value="dark">深色</option></select></div>
 <div class="card">語音提示<input type="checkbox" id="sv" style="width:auto"></div>
 <div class="card">語音聲音<select id="vt" style="width:auto"><option value="f">女聲</option><option value="m">男聲</option></select></div>
 <div class="card">音效<input type="checkbox" id="ss" style="width:auto"></div>
 <div class="card">震動（Android）<input type="checkbox" id="sb" style="width:auto"></div>
 <div class="card">練習紀錄<button id="logs">查看</button></div>
 <div class="card">備份<div class="row"><button id="exp">匯出</button><button id="imp">匯入</button></div></div>`;
 $('#logs').onclick=()=>openLog(rSettings);
 $('#th').value=S.theme;$('#sv').checked=S.voice;$('#vt').value=S.voiceType||'f';$('#ss').checked=S.sound;$('#sb').checked=S.vibrate;
 const save=()=>{S.theme=$('#th').value;S.voice=$('#sv').checked;S.voiceType=$('#vt').value;S.sound=$('#ss').checked;S.vibrate=$('#sb').checked;store.set('settings',S);applyTheme();P.load()};
 ['th','sv','vt','ss','sb'].forEach(i=>$('#'+i).onchange=save);
 $('#exp').onclick=()=>{const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);data[k]=localStorage.getItem(k)}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download='breath-app-backup.json';a.click()};
 $('#imp').onclick=()=>{const f=document.createElement('input');f.type='file';f.accept='.json';f.onchange=async()=>{try{const d=JSON.parse(await f.files[0].text());if(!confirm('匯入會覆蓋目前的資料，確定嗎？'))return;Object.entries(d).forEach(([k,v])=>localStorage.setItem(k,v));location.reload()}catch(e){alert('檔案格式不正確')}};f.click()};
}
