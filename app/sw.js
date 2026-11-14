const C='v3',F=['./','index.html','manifest.json','icon.svg',...['f','m'].flatMap(v=>['prep','start','in','hold','out','end'].map(k=>'audio/'+v+'/'+k+'.mp3'))];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(F)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(u.startsWith('https://fonts.googleapis.com')||u.startsWith('https://fonts.gstatic.com')){
    e.respondWith(caches.open(C).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res}))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
