// 離線快取（架構對話維護）
// 本站檔案：先用網路拿最新版，順便存進快取；沒網路時用快取 → 新增檔案不用改這裡。
// Google 字體：先用快取，沒有才下載。
const C='v4';
const PRE=['./','index.html','manifest.json','icon.svg',
 'css/style.css','css/breath.css','css/exercise.css','css/stretch.css','css/habit.css',
 'js/core.js','js/breath.js','js/exercise.js','js/stretch.js','js/habit.js','js/settings.js','js/main.js',
 ...['f','m'].flatMap(v=>['prep','start','in','hold','out','end'].map(k=>'audio/'+v+'/'+k+'.mp3'))];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(PRE)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=e.request.url;
  if(u.startsWith('https://fonts.googleapis.com')||u.startsWith('https://fonts.gstatic.com')){
    e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res}))));
    return;
  }
  if(new URL(u).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
