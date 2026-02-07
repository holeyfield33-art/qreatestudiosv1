export interface UrlScanResult {
  safe: boolean;
  risk: 'low' | 'medium' | 'high';
  warnings: string[];
  phishingIndicators: string[];
}

export async function scanUrl(url: string): Promise<UrlScanResult> {
  const result: UrlScanResult = {
    safe: true,
    risk: 'low',
    warnings: [],
    phishingIndicators: [],
  };

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();

    // Check 1: Suspicious TLDs
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top'];
    if (suspiciousTLDs.some((tld) => domain.endsWith(tld))) {
      result.warnings.push('Domain uses commonly abused TLD');
      result.risk = 'medium';
    }

    // Check 2: Typosquatting common brands
    const commonBrands = [
      'paypal', 'amazon', 'google', 'microsoft', 'apple',
      'facebook', 'instagram', 'twitter', 'netflix', 'bank',
      'chase', 'wellsfargo', 'boa', 'citi',
    ];
    
    for (const brand of commonBrands) {
      // Check for common typosquatting patterns
      if (
        domain.includes(brand) &&
        !domain.endsWith(`${brand}.com`) &&
        !domain.endsWith(`${brand}.net`)
      ) {
        result.phishingIndicators.push(`Possible ${brand} impersonation`);
        result.risk = 'high';
        result.safe = false;
      }
    }

    // Check 3: Excessive subdomains (phishing indicator)
    const subdomains = domain.split('.');
    if (subdomains.length > 4) {
      result.warnings.push('Unusually complex domain structure');
      result.risk = result.risk === 'high' ? 'high' : 'medium';
    }

    // Check 4: IP address instead of domain
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
      result.warnings.push('Uses IP address instead of domain name');
      result.risk = 'high';
      result.safe = false;
    }

    // Check 5: Suspicious keywords
    const suspiciousKeywords = [
      'verify', 'suspend', 'urgent', 'security', 'alert',
      'confirm', 'update', 'login', 'signin', 'account',
    ];
    
    const pathAndQuery = parsedUrl.pathname + parsedUrl.search;
    if (suspiciousKeywords.some((kw) => pathAndQuery.toLowerCase().includes(kw))) {
      result.warnings.push('URL contains phishing-related keywords');
      result.risk = result.risk === 'high' ? 'high' : 'medium';
    }

    // Check 6: Homograph attacks (lookalike characters)
    if (/[а-яА-Я]/.test(domain)) {
      // Cyrillic characters that look like Latin
      result.phishingIndicators.push('Domain uses lookalike characters');
      result.risk = 'high';
      result.safe = false;
    }

    // Check 7: URL shorteners (require extra caution)
    const urlShorteners = [
      'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly',
      'is.gd', 'buff.ly', 'adf.ly',
    ];
    
    if (urlShorteners.some((shortener) => domain.includes(shortener))) {
      result.warnings.push('Destination uses URL shortener (destination hidden)');
      result.risk = 'medium';
    }

  } catch (_error) {
    result.warnings.push('Invalid URL format');
    result.risk = 'high';
    result.safe = false;
  }

  return result;
}

export function generateWarningMessage(scanResult: UrlScanResult, url: string): string {
  if (scanResult.safe && scanResult.risk === 'low') {
    return '';
  }

  let message = '⚠️ Security Warning\n\n';
  
  if (scanResult.risk === 'high') {
    message += '🚨 HIGH RISK: This URL shows strong indicators of phishing or fraud.\n\n';
  } else if (scanResult.risk === 'medium') {
    message += '⚠️ MEDIUM RISK: This URL has some suspicious characteristics.\n\n';
  }

  if (scanResult.phishingIndicators.length > 0) {
    message += 'Phishing Indicators:\n';
    scanResult.phishingIndicators.forEach((indicator) => {
      message += `• ${indicator}\n`;
    });
    message += '\n';
  }

  if (scanResult.warnings.length > 0) {
    message += 'Warnings:\n';
    scanResult.warnings.forEach((warning) => {
      message += `• ${warning}\n`;
    });
  }

  message += `\nDestination: ${url}\n`;
  message += '\n⚡ Proceed with caution. Verify the URL is legitimate before continuing.';

  return message;
}
