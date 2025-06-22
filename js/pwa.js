// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      // Registration successful
    }, function(err) {
      // Registration failed
    });
  });
}

// Install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  // Optionally, show a custom install button
  // document.getElementById('install-btn').style.display = 'block';
});
// To trigger: deferredPrompt.prompt(); 