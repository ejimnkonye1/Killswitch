// SubTracker Browser Extension - Popup Logic

document.addEventListener('DOMContentLoaded', async () => {
  const tokenInput = document.getElementById('api-token');
  const apiUrlInput = document.getElementById('api-url');
  const saveTokenBtn = document.getElementById('save-token');
  const tokenStatus = document.getElementById('token-status');
  const detectionsList = document.getElementById('detections-list');
  const countBadge = document.getElementById('count-badge');
  const clearBtn = document.getElementById('clear-btn');

  // Load saved settings
  const settings = await chrome.storage.local.get(['apiToken', 'apiUrl']);
  if (settings.apiToken) {
    tokenInput.value = settings.apiToken;
  }
  if (settings.apiUrl) {
    apiUrlInput.value = settings.apiUrl;
  }

  // Save token
  saveTokenBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();

    if (!token) {
      showStatus('Please enter an API token', 'error');
      return;
    }

    await chrome.storage.local.set({ apiToken: token, apiUrl: apiUrl });
    showStatus('Settings saved successfully', 'success');
  });

  // Clear detections
  clearBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'clearDetections' }, () => {
      loadDetections();
    });
  });

  function showStatus(message, type) {
    tokenStatus.textContent = message;
    tokenStatus.className = 'status-message ' + type;
    setTimeout(() => {
      tokenStatus.className = 'status-message';
    }, 3000);
  }

  async function loadDetections() {
    chrome.runtime.sendMessage({ type: 'getDetections' }, (response) => {
      const detections = response.detections || {};
      const entries = Object.values(detections);

      const unimported = entries.filter(d => !d.imported);
      countBadge.textContent = unimported.length;

      if (entries.length === 0) {
        detectionsList.innerHTML =
          '<div class="empty-state">' +
          '<p>No subscriptions detected yet.</p>' +
          '<p class="hint">Browse subscription websites to detect them.</p>' +
          '</div>';
        return;
      }

      detectionsList.innerHTML = entries.map(function(d) {
        return '<div class="detection-item" data-name="' + d.name + '">' +
          '<div class="detection-info">' +
          '<div class="detection-name">' + d.name + '</div>' +
          '<div class="detection-domain">' + d.domain + '</div>' +
          '</div>' +
          '<div class="detection-cost">' +
          '$' + d.defaultCost.toFixed(2) + '<span>/mo</span>' +
          '</div>' +
          '<button class="add-btn ' + (d.imported ? 'added' : '') + '" data-name="' + d.name + '"' + (d.imported ? ' disabled' : '') + '>' +
          (d.imported ? 'Added' : 'Add') +
          '</button>' +
          '</div>';
      }).join('');

      // Add click handlers
      document.querySelectorAll('.add-btn:not(.added)').forEach(function(btn) {
        btn.addEventListener('click', function() {
          addToSubTracker(btn.dataset.name);
        });
      });
    });
  }

  async function addToSubTracker(serviceName) {
    const settings = await chrome.storage.local.get(['apiToken', 'apiUrl']);

    if (!settings.apiToken || !settings.apiUrl) {
      showStatus('Please configure API token and URL first', 'error');
      return;
    }

    const result = await chrome.storage.local.get('detections');
    var detections = result.detections || {};
    var detection = detections[serviceName];

    if (!detection) return;

    var btn = document.querySelector('.add-btn[data-name="' + serviceName + '"]');
    if (btn) {
      btn.textContent = '...';
      btn.disabled = true;
    }

    try {
      var response = await fetch(settings.apiUrl + '/api/extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + settings.apiToken,
        },
        body: JSON.stringify({
          serviceName: detection.name,
          domain: detection.domain,
          category: detection.category,
          defaultCost: detection.defaultCost,
          billingCycle: 'monthly',
        }),
      });

      var data = await response.json();

      if (data.success) {
        chrome.runtime.sendMessage({
          type: 'markImported',
          name: serviceName,
        }, function() {
          if (btn) {
            btn.textContent = 'Added';
            btn.classList.add('added');
          }
          loadDetections();
        });

        showStatus(data.message || (serviceName + ' added!'), 'success');
      } else {
        if (btn) {
          btn.textContent = 'Add';
          btn.disabled = false;
        }
        showStatus(data.error || 'Failed to add', 'error');
      }
    } catch (err) {
      if (btn) {
        btn.textContent = 'Add';
        btn.disabled = false;
      }
      showStatus('Connection failed. Check your API URL.', 'error');
    }
  }

  // Initial load
  loadDetections();
});
