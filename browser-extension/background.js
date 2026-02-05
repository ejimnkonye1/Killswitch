// SubTracker Browser Extension - Background Service Worker

const SERVICE_DOMAINS = {
  'netflix.com': { name: 'Netflix', category: 'streaming', defaultCost: 15.49 },
  'spotify.com': { name: 'Spotify', category: 'music', defaultCost: 11.99 },
  'disneyplus.com': { name: 'Disney+', category: 'streaming', defaultCost: 13.99 },
  'hulu.com': { name: 'Hulu', category: 'streaming', defaultCost: 17.99 },
  'max.com': { name: 'HBO Max', category: 'streaming', defaultCost: 15.99 },
  'music.youtube.com': { name: 'YouTube Premium', category: 'music', defaultCost: 13.99 },
  'amazon.com': { name: 'Amazon Prime', category: 'shopping', defaultCost: 14.99 },
  'adobe.com': { name: 'Adobe Creative Cloud', category: 'productivity', defaultCost: 59.99 },
  'dropbox.com': { name: 'Dropbox', category: 'cloud-storage', defaultCost: 11.99 },
  'one.google.com': { name: 'Google One', category: 'cloud-storage', defaultCost: 2.99 },
  'notion.so': { name: 'Notion', category: 'productivity', defaultCost: 10.00 },
  'slack.com': { name: 'Slack', category: 'productivity', defaultCost: 8.75 },
  'zoom.us': { name: 'Zoom', category: 'productivity', defaultCost: 13.33 },
  'openai.com': { name: 'ChatGPT Plus', category: 'ai', defaultCost: 20.00 },
  'github.com': { name: 'GitHub Pro', category: 'development', defaultCost: 4.00 },
  'figma.com': { name: 'Figma', category: 'design', defaultCost: 15.00 },
  'canva.com': { name: 'Canva Pro', category: 'design', defaultCost: 12.99 },
  'crunchyroll.com': { name: 'Crunchyroll', category: 'streaming', defaultCost: 7.99 },
  'grammarly.com': { name: 'Grammarly', category: 'productivity', defaultCost: 12.00 },
  'nordvpn.com': { name: 'NordVPN', category: 'security', defaultCost: 12.99 },
  '1password.com': { name: '1Password', category: 'security', defaultCost: 2.99 },
  'linkedin.com': { name: 'LinkedIn Premium', category: 'professional', defaultCost: 29.99 },
  'twitch.tv': { name: 'Twitch', category: 'streaming', defaultCost: 8.99 },
  'microsoft365.com': { name: 'Microsoft 365', category: 'productivity', defaultCost: 9.99 },
  'todoist.com': { name: 'Todoist', category: 'productivity', defaultCost: 4.00 },
};

function matchDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    for (const [domain, info] of Object.entries(SERVICE_DOMAINS)) {
      if (hostname.endsWith(domain)) {
        return { domain, ...info };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Listen to tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const match = matchDomain(tab.url);
    if (match) {
      const result = await chrome.storage.local.get('detections');
      const detections = result.detections || {};

      if (!detections[match.name]) {
        detections[match.name] = {
          name: match.name,
          domain: match.domain,
          category: match.category,
          defaultCost: match.defaultCost,
          detectedAt: new Date().toISOString(),
          imported: false,
        };

        await chrome.storage.local.set({ detections });

        const count = Object.values(detections).filter(d => !d.imported).length;
        chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
        chrome.action.setBadgeBackgroundColor({ color: '#06b6d4' });
      }
    }
  }
});

// Listen to messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getDetections') {
    chrome.storage.local.get('detections', (result) => {
      sendResponse({ detections: result.detections || {} });
    });
    return true;
  }

  if (message.type === 'markImported') {
    chrome.storage.local.get('detections', async (result) => {
      const detections = result.detections || {};
      if (detections[message.name]) {
        detections[message.name].imported = true;
        await chrome.storage.local.set({ detections });

        const count = Object.values(detections).filter(d => !d.imported).length;
        chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
      }
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'clearDetections') {
    chrome.storage.local.set({ detections: {} }, () => {
      chrome.action.setBadgeText({ text: '' });
      sendResponse({ success: true });
    });
    return true;
  }
});
