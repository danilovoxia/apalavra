
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registra o Service Worker para notificações push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch((error) => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  });
}

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(<App />);
