// Hamburger menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = mainNav.classList.toggle('hidden') ? 'false' : 'true';
    menuToggle.setAttribute('aria-expanded', expanded);
  });
  // Close menu when a nav link is clicked (for mobile)
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 700) {
        mainNav.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
  // Keyboard accessibility: toggle with Enter/Space
  menuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      menuToggle.click();
    }
  });
}

// Offline notice
function updateOnlineStatus() {
  const offlineNotice = document.getElementById('offline-notice');
  if (!offlineNotice) return;
  if (!navigator.onLine) {
    offlineNotice.classList.remove('hidden');
  } else {
    offlineNotice.classList.add('hidden');
  }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Save 'Recently Viewed' emergency
function saveRecentlyViewed(page) {
  if (window.localStorage) {
    localStorage.setItem('recentlyViewed', page);
  }
}

// Show 'Recently Viewed' on homepage
function showRecentlyViewed() {
  const section = document.getElementById('recently-viewed-section');
  const container = document.getElementById('recently-viewed');
  if (!section || !container) return;
  const page = localStorage.getItem('recentlyViewed');
  if (!page) return;
  const data = {
    fire: { name: 'Fire Emergency', img: 'images/fire.png', url: 'fire.html' },
    earthquake: { name: 'Earthquake', img: 'images/earthquake.png', url: 'earthquake.html' },
    firstaid: { name: 'First Aid', img: 'images/first-aid.png', url: 'firstaid.html' },
    gasleak: { name: 'Gas Leak', img: 'images/gas.png', url: 'gasleak.html' },
    accident: { name: 'Road Accident', img: 'images/crash.png', url: 'accident.html' }
  };
  if (data[page]) {
    section.classList.remove('hidden');
    container.innerHTML = `<a href="${data[page].url}"><img src="${data[page].img}" alt="${data[page].name}" width="32" height="32">${data[page].name}</a>`;
  }
}
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
  showRecentlyViewed();
}

// On subpages, save the current emergency as recently viewed
const emergencyPages = ['fire', 'earthquake', 'firstaid', 'gasleak', 'accident'];
const currentPage = window.location.pathname.split('/').pop().split('.')[0];
if (emergencyPages.includes(currentPage)) {
  saveRecentlyViewed(currentPage);
}

// Install PWA button logic
let deferredPrompt;
const installBtn = document.getElementById('install-btn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.classList.remove('hidden');
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.textContent = 'App Installed!';
        installBtn.disabled = true;
      }
      deferredPrompt = null;
    }
  });
}

// --- Emergency Numbers by User Location ---
async function updateEmergencyNumbersByLocation() {
  const savedCountryCode = localStorage.getItem('userCountryCode');
  let countryCode = savedCountryCode;

  // Function to render numbers from a country code
  const renderNumbers = (code) => {
    fetch('emergency-numbers.json')
      .then(resp => resp.json())
      .then(numbersMap => {
        const numbers = numbersMap[code] || numbersMap['DEFAULT'];
        document.querySelectorAll('.emergency-numbers ul').forEach(ul => {
          ul.innerHTML = `
            <li><strong data-i18n="emergency_number_police">Police:</strong> <a href="tel:${numbers.police}">${numbers.police}</a></li>
            <li><strong data-i18n="emergency_number_fire">Fire Department:</strong> <a href="tel:${numbers.fire}">${numbers.fire}</a></li>
            <li><strong data-i18n="emergency_number_ambulance">Ambulance:</strong> <a href="tel:${numbers.ambulance}">${numbers.ambulance}</a></li>
            <li><strong data-i18n="emergency_number_general">General Emergency:</strong> <a href="tel:${numbers.general}">${numbers.general}</a></li>
          `;
        });
        // Re-apply translation if i18next is loaded
        if (window.updateContent) {
            window.updateContent();
        }
      });
  };

  // If we have a saved country, display its numbers immediately for offline support
  if (savedCountryCode) {
    renderNumbers(savedCountryCode);
  }

  // Then, try to get fresh location data from the network
  if (navigator.onLine) {
    let freshCountryCode = null;
    try {
      // First try IP-based location - it's faster and less intrusive
      const resp = await fetch('https://ipapi.co/json/');
      const data = await resp.json();
      if (data.country) freshCountryCode = data.country;
    } catch (e) {
      console.warn('IP location failed, trying geolocation.', e);
      // Fallback to GPS geolocation if IP fails
      if (navigator.geolocation) {
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const nominatimResp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const nominatimData = await nominatimResp.json();
            if (nominatimData.address && nominatimData.address.country_code) {
                freshCountryCode = nominatimData.address.country_code.toUpperCase();
            }
        } catch (geoError) {
            console.error('Geolocation also failed.', geoError);
        }
      }
    }
    
    // If we got a fresh country and it's different from the saved one, update and re-render
    if (freshCountryCode && freshCountryCode !== savedCountryCode) {
        localStorage.setItem('userCountryCode', freshCountryCode);
        renderNumbers(freshCountryCode);
    } else if (!savedCountryCode) {
        // If there was no saved country and we couldn't get a fresh one, render default
        renderNumbers('DEFAULT');
    }
  } else if (!savedCountryCode) {
      // If offline and no saved country, render default
      renderNumbers('DEFAULT');
  }
}

document.addEventListener('DOMContentLoaded', updateEmergencyNumbersByLocation);

// Play video when it enters the viewport
document.addEventListener('DOMContentLoaded', () => {
  const videos = document.querySelectorAll('video');

  if (videos.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play();
        } else {
          entry.target.pause();
        }
      });
    }, {
      threshold: 0.5 // Start playing when 50% of the video is visible
    });

    videos.forEach(video => {
      observer.observe(video);
    });
  }
}); 