// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Check if there's an update available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, refresh the page
              window.location.reload();
            }
          });
        });
      })
      .catch(function(err) {
        console.log('Service Worker registration failed:', err);
      });
  });
}

// Install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button if available
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.classList.remove('hidden');
    installBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        });
      }
    });
  }
});

// Handle app installed event
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed');
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.classList.add('hidden');
  }
});

// Check online/offline status
window.addEventListener('online', function() {
  document.getElementById('offline-notice').classList.add('hidden');
});

window.addEventListener('offline', function() {
  document.getElementById('offline-notice').classList.remove('hidden');
}); 