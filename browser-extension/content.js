// SubTracker Browser Extension - Content Script
// Detects the current page domain and sends a message to the background worker

(function() {
  const hostname = window.location.hostname.replace('www.', '');

  chrome.runtime.sendMessage({
    type: 'pageVisited',
    url: window.location.href,
    hostname: hostname,
    title: document.title,
  });
})();
