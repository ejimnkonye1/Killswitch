export interface ServiceDomainInfo {
  name: string
  category: string
  defaultCost?: number
}

export const SERVICE_DOMAINS: Record<string, ServiceDomainInfo> = {
  'netflix.com': { name: 'Netflix', category: 'streaming', defaultCost: 15.49 },
  'spotify.com': { name: 'Spotify', category: 'music', defaultCost: 11.99 },
  'disneyplus.com': { name: 'Disney+', category: 'streaming', defaultCost: 13.99 },
  'hulu.com': { name: 'Hulu', category: 'streaming', defaultCost: 17.99 },
  'max.com': { name: 'HBO Max', category: 'streaming', defaultCost: 15.99 },
  'apple.com/apple-music': { name: 'Apple Music', category: 'music', defaultCost: 10.99 },
  'music.youtube.com': { name: 'YouTube Premium', category: 'music', defaultCost: 13.99 },
  'amazon.com/prime': { name: 'Amazon Prime', category: 'shopping', defaultCost: 14.99 },
  'adobe.com': { name: 'Adobe Creative Cloud', category: 'productivity', defaultCost: 59.99 },
  'microsoft365.com': { name: 'Microsoft 365', category: 'productivity', defaultCost: 9.99 },
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
  'twitch.tv': { name: 'Twitch', category: 'streaming', defaultCost: 8.99 },
  'linkedin.com/premium': { name: 'LinkedIn Premium', category: 'professional', defaultCost: 29.99 },
  'grammarly.com': { name: 'Grammarly', category: 'productivity', defaultCost: 12.00 },
  'nordvpn.com': { name: 'NordVPN', category: 'security', defaultCost: 12.99 },
  '1password.com': { name: '1Password', category: 'security', defaultCost: 2.99 },
}

export function matchDomain(url: string): ServiceDomainInfo | null {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    const pathname = new URL(url).pathname

    // Check full domain + path matches first
    for (const [domain, info] of Object.entries(SERVICE_DOMAINS)) {
      if (domain.includes('/')) {
        const [domainPart, ...pathParts] = domain.split('/')
        const pathPart = '/' + pathParts.join('/')
        if (hostname.endsWith(domainPart) && pathname.startsWith(pathPart)) {
          return info
        }
      }
    }

    // Check domain-only matches
    for (const [domain, info] of Object.entries(SERVICE_DOMAINS)) {
      if (!domain.includes('/') && hostname.endsWith(domain)) {
        return info
      }
    }

    return null
  } catch {
    return null
  }
}
