import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline capability & PWA installation
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // SW registered
        if (reg.installing) {
          console.log('[Ration SW] Installing service worker');
        } else if (reg.active) {
          console.log('[Ration SW] Active service worker ready for offline caching');
        }
      })
      .catch((err) => {
        console.warn('[Ration SW] Registration notice:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
