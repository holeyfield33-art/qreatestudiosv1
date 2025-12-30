'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { scanUrl, type UrlScanResult } from '@/lib/services/anti-quishing-service';

export default function SecurityWarningPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url');
  const code = searchParams.get('code');
  
  const [scanResult, setScanResult] = useState<UrlScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) {
      performScan();
    } else {
      setLoading(false);
    }
  }, [url]);

  async function performScan() {
    if (!url) return;

    try {
      const result = await scanUrl(url);
      setScanResult(result);
    } catch (error) {
      console.error('URL scan error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProceed() {
    if (!url) return;
    
    // Track that user proceeded despite warning
    if (code) {
      fetch('/api/analytics/warning-proceeded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortCode: code, url }),
      }).catch(() => {});
    }

    window.location.href = url;
  }

  function handleGoBack() {
    router.back();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" role="status" aria-label="Scanning"></div>
          <p className="text-muted-foreground">Scanning URL for security threats...</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
          <p className="text-muted-foreground mb-6">No URL provided for scanning.</p>
          <Button onClick={handleGoBack} className="min-h-[44px]">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const riskColor = scanResult?.risk === 'high' ? 'red' : scanResult?.risk === 'medium' ? 'orange' : 'yellow';
  const riskBg = scanResult?.risk === 'high' ? 'bg-red-50' : scanResult?.risk === 'medium' ? 'bg-orange-50' : 'bg-yellow-50';

  return (
    <div className={`min-h-screen flex items-center justify-center ${riskBg}`}>
      <Card className="p-8 max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4" role="img" aria-label="Warning">
            {scanResult?.risk === 'high' ? '🚨' : '⚠️'}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {scanResult?.risk === 'high' ? 'High Risk Detected' : 'Security Warning'}
          </h1>
          <p className="text-muted-foreground">
            This destination has been flagged for potential security concerns
          </p>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="space-y-4 mb-6">
            {/* Risk Level */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Risk Level</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    scanResult.risk === 'high'
                      ? 'bg-red-200 text-red-800'
                      : scanResult.risk === 'medium'
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {scanResult.risk.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {scanResult.safe ? 'Proceed with caution' : 'Not recommended to proceed'}
                </span>
              </div>
            </div>

            {/* Phishing Indicators */}
            {scanResult.phishingIndicators.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-800">🚨 Phishing Indicators</h3>
                <ul className="space-y-1" role="list">
                  {scanResult.phishingIndicators.map((indicator, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {scanResult.warnings.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-orange-800">⚠️ Security Warnings</h3>
                <ul className="space-y-1" role="list">
                  {scanResult.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Destination URL */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Destination URL</h3>
              <p className="text-sm font-mono break-all text-muted-foreground">{url}</p>
            </div>
          </div>
        )}

        {/* Safety Tips */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-800">🛡️ Safety Tips</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Verify the URL matches the expected destination</li>
            <li>• Look for HTTPS and a valid certificate</li>
            <li>• Never enter passwords on suspicious sites</li>
            <li>• When in doubt, contact the organization directly</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGoBack}
            variant="default"
            size="lg"
            className="flex-1 min-h-[44px]"
          >
            🔙 Go Back (Recommended)
          </Button>
          <Button
            onClick={handleProceed}
            variant={scanResult?.risk === 'high' ? 'destructive' : 'outline'}
            size="lg"
            className="flex-1 min-h-[44px]"
          >
            Continue Anyway
          </Button>
        </div>

        {scanResult?.risk === 'high' && (
          <p className="text-center text-xs text-red-600 mt-4" role="alert">
            ⚠️ Proceeding to this destination is not recommended due to high security risks
          </p>
        )}
      </Card>
    </div>
  );
}
