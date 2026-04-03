const CACHE='zivve-202604032211';
const ALWAYS_FRESH=['/zivve/','/zivve/index.html'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ALWAYS_FRESH)));
});

self.addEventListener('activate',e=>{
  // Elimina TUTTE le cache vecchie
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>{
        console.log('[SW] Eliminata cache vecchia:',k);
        return caches.delete(k);
      })
    ))
  );
  self.clients.claim();
  // Forza reload di tutti i tab aperti
  self.clients.matchAll({type:'window'}).then(clients=>{
    clients.forEach(client=>client.navigate(client.url));
  });
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isGameFile=ALWAYS_FRESH.some(f=>url.pathname===f||url.pathname.endsWith('/'));
  
  if(isGameFile){
    // NETWORK FIRST per il file principale — aggiornamenti immediati
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(res=>{
          if(res&&res.status===200){
            const clone=res.clone();
            caches.open(CACHE).then(c=>c.put(e.request,clone));
          }
          return res;
        })
        .catch(()=>caches.match(e.request))
    );
  } else {
    // CACHE FIRST per risorse statiche (icone, sw.js)
    e.respondWith(
      caches.match(e.request).then(r=>{
        if(r) return r;
        return fetch(e.request).then(res=>{
          if(res&&res.status===200){
            const clone=res.clone();
            caches.open(CACHE).then(c=>c.put(e.request,clone));
          }
          return res;
        }).catch(()=>caches.match('/zivve/index.html'));
      })
    );
  }
});

self.addEventListener('push',e=>{
  const data=e.data?e.data.json():{};
  e.waitUntil(self.registration.showNotification(data.title||'ZIVVE',{
    body:data.body||'Nuovo record da battere!',
    icon:'/zivve/icon-192.png',
    badge:'/zivve/icon-72.png',
    tag:'zivve-notif',
    renotify:true
  }));
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.openWindow('/zivve/'));
});
