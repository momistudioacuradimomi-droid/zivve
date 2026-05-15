// ZIVVE cache bump Patch 08
const CACHE='zivve-202605142205-direct-small-game-text-hook';
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
  // Firebase e API esterne: mai cachare, sempre rete diretta
  if(url.hostname.includes('firebase')||url.hostname.includes('firebaseio')||url.hostname.includes('googleapis')||url.hostname.includes('supabase')){
    return; // lascia passare senza intercettare
  }
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

// patch-08c-cache-bust

// PATCH_08D_CORRECT_SKIP_TARGET_FIX cache refresh

// PATCH_08E_INTRO_SLOWER_TEXT_FADE cache refresh

// PATCH_08F_COMMUNITY_OFFICIAL_LOGOS cache refresh

// PATCH_08G_COMMUNITY_BUTTON_INTERIOR_MATCH cache refresh

// STABLE_09_QA_BASE cache refresh

// STEP_10A_AUDIO_HAPTIC_BASE cache refresh

// PATCH_10A1_CHAMPION_AURA_VISUAL_HIDE cache refresh

// STEP_10B_MOMENTI_CULT cache refresh

// PATCH_10B1_GAMEOVER_STATS_LAYOUT_FIX cache refresh

// PATCH_10B2_GAMEOVER_SCORE_FIT_FIX cache refresh

// PATCH_10B3_GAMEOVER_HEADER_CLEANUP cache refresh

// PATCH_10B4_GAMEOVER_AGAIN_FIX cache refresh

// PATCH_10B5_HIDE_DASHED_MAGNET_RING cache refresh

// PATCH_10B6_HIDE_GAMEPLAY_DASHED_GUIDES cache refresh

// PATCH_10B7_ORBIT_RING_LEGACY_BANNER_CLEANUP cache refresh

// STEP_11_VISUAL_POLISH_PASS cache refresh

// PATCH_11A_REMOVE_LARGE_GLASS_RINGS cache refresh

// STEP_12_INGAME_TEXT_POLISH cache refresh

// STEP_12B_INGAME_TEXT_HARD_APPLY cache refresh

// STEP_12C_INGAME_TEXT_VISIBLE_OVERLAY cache refresh

// PATCH_12D_INGAME_TEXT_SIZE_TUNE cache refresh

// PATCH_12E_INGAME_TEXT_SMALLER_REAL_TUNE cache refresh

// PATCH_12F_HARD_SHRINK_INGAME_TEXT_OVERLAY cache refresh

// PATCH_12G_REMOVE_INGAME_MESSAGE_CARDS cache refresh

// PATCH_12H_DISABLE_INGAME_MESSAGE_OVERLAYS cache refresh

// PATCH_12I_REMOVE_PRISMA_DASHED_RINGS cache refresh

// PATCH_12J_SMALL_PREMIUM_INGAME_TEXT_RETURN cache refresh

// PATCH_12K_DIRECT_SMALL_GAME_TEXT_HOOK cache refresh
