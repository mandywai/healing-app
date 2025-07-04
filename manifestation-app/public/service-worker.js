// public/service-worker.js
self.addEventListener('push', event => {
    const data = event.data.json()
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png'
    })
  })

  self.addEventListener('install', event => {
    self.skipWaiting(); // 安裝後立刻啟用
  });
  
  self.addEventListener('activate', event => {
    clients.claim(); // 接管所有 client
  });