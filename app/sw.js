// 離線快取（架構對話維護）
// 本站檔案：先用網路拿最新版，順便存進快取；沒網路時用快取 → 新增檔案不用改這裡。
// Google 字體、Fluent 表情圖：先用快取，沒有才下載。
const C='v7';
const FL='https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';
const PRE=['./','index.html','manifest.json','icon.svg',
 'css/style.css','css/breath.css','css/exercise.css','css/stretch.css','css/habit.css',
 'js/core.js','js/breath.js','js/exercise.js','js/stretch.js','js/habit.js','js/log.js','js/settings.js','js/main.js',
 ...['f','m'].flatMap(v=>['prep','start','in','hold','out','end'].map(k=>'audio/'+v+'/'+k+'.mp3')),
 ...['f','m'].flatMap(v=>[2,3,4,5,6,7,8,9,10].map(n=>'audio/b/'+v+'/'+n+'.mp3'))];
const MOOD=['Weary%20face/3D/weary_face_3d.png','Confused%20face/3D/confused_face_3d.png','Neutral%20face/3D/neutral_face_3d.png','Slightly%20smiling%20face/3D/slightly_smiling_face_3d.png','Smiling%20face%20with%20smiling%20eyes/3D/smiling_face_with_smiling_eyes_3d.png'].map(x=>FL+x);
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(PRE).then(()=>c.addAll(MOOD).catch(()=>{}))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=e.request.url;
  if(u.startsWith('https://fonts.googleapis.com')||u.startsWith('https://fonts.gstatic.com')||u.startsWith(FL)){
    e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res}))));
    return;
  }
  if(new URL(u).origin!==self.location.origin)return;
  // cache:'no-cache'：每次都向伺服器確認是否有新版，避免瀏覽器暫存讓更新看不到
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
