// Service Worker para Versículo do Dia - Notificações Push

const CACHE_NAME = 'versiculo-dia-v1';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(clients.claim());
});

// Listener para mensagens do app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_DAILY_VERSE') {
    scheduleDailyNotification(event.data.verse);
  }
});

// Função para agendar notificação diária
function scheduleDailyNotification(verse) {
  // Calcula o tempo até as 7h da manhã
  const now = new Date();
  const nextNotification = new Date(now);
  
  if (now.getHours() >= 7) {
    // Se já passou das 7h, agenda para amanhã
    nextNotification.setDate(nextNotification.getDate() + 1);
  }
  nextNotification.setHours(7, 0, 0, 0);
  
  const delay = nextNotification.getTime() - now.getTime();
  
  setTimeout(() => {
    showNotification(verse);
    // Re-agenda para o próximo dia
    scheduleDailyNotification(verse);
  }, delay);
}

// Função para mostrar notificação
function showNotification(verse) {
  if (Notification.permission === 'granted') {
    self.registration.showNotification('Versículo do Dia', {
      body: verse ? `"${verse.text.substring(0, 100)}..." - ${verse.reference}` : 'Abra o app para ver o versículo de hoje!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'daily-verse',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Ver Versículo' },
        { action: 'close', title: 'Fechar' }
      ]
    });
  }
}

// Listener para cliques na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Se já tem uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não, abre uma nova janela
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Listener para push notifications (para uso futuro com backend)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Versículo do Dia', {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'daily-verse',
        data: data.url
      })
    );
  }
});
