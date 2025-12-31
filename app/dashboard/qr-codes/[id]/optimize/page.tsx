'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ExternalLink, 
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  Target,
  Globe,
  BarChart3
} from 'lucide-react';

interface OptimizationData {
  recommendations: string[];
  score: number;
  improvements: any;
}

interface LinkHealthData {
  isHealthy: boolean;
  statusCode?: number;
  error?: string;
  suggestions?: string[];
  alternatives?: Array<{ url: string; isHealthy: boolean; statusCode?: number }>;
}

interface PredictionData {
  predictedScansPerDay: number;
  confidence: number;
  factors: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface ABTestData {
  testIdeas: Array<{
    name: string;
    description: string;
    variants: string[];
    expectedImpact: string;
  }>;
}

export default function OptimizeQRPage() {
  const params = useParams();
  const router = useRouter();
  const qrCodeId = params.id as string;
  
  const [qrCode, setQrCode] = useState<any>(null);
  const [optimization, setOptimization] = useState<OptimizationData | null>(null);
  const [linkHealth, setLinkHealth] = useState<LinkHealthData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [abTest, setAbTest] = useState<ABTestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [qrCodeId]);

  async function loadData() {
    try {
      setLoading(true);

      // Fetch QR code data
      const qrRes = await fetch(`/api/qr/${qrCodeId}`);
      if (!qrRes.ok) throw new Error('Failed to fetch QR code');
      const qrData = await qrRes.json();
      setQrCode(qrData);

      // Run parallel optimizations
      await Promise.all([
        loadOptimization(qrData),
        loadLinkHealth(qrData),
        loadPrediction(qrData),
        loadABTest(qrData),
      ]);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Failed to load data:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadOptimization(qrData: any) {
    try {
      const optRes = await fetch('/api/ai/optimize-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrData),
      });
      const optData = await optRes.json();
      setOptimization(optData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Optimization failed:', error);
      }
    }
  }

  async function loadLinkHealth(qrData: any) {
    try {
      const healthRes = await fetch('/api/ai/check-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: qrData.redirectUrl }),
      });
      const healthData = await healthRes.json();
      setLinkHealth(healthData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Link check failed:', error);
      }
    }
  }

  async function loadPrediction(qrData: any) {
    try {
      const predRes = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId: qrData.id, qrCodeData: qrData }),
      });
      const predData = await predRes.json();
      setPrediction(predData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Prediction failed:', error);
      }
    }
  }

  async function loadABTest(qrData: any) {
    try {
      const abRes = await fetch('/api/ai/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrData),
      });
      const abData = await abRes.json();
      setAbTest(abData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('A/B test suggestions failed:', error);
      }
    }
  }

  async function refreshAnalysis() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function getScoreColor(score: number): string {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getScoreLabel(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  }

  function getTrendIcon(trend: string) {
    if (trend === 'increasing') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (trend === 'decreasing') return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">QR code not found</p>
          <Button onClick={() => router.push('/dashboard/qr-codes')} className="mt-4">
            Back to QR Codes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            AI Optimization
          </h1>
          <p className="text-muted-foreground mt-1">
            Improve QR code performance with AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAnalysis}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Performance Score</h3>
            <p className="text-sm text-muted-foreground">
              Overall optimization rating based on multiple factors
            </p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(optimization?.score || 0)}`}>
              {optimization?.score || 0}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              {getScoreLabel(optimization?.score || 0)}
            </Badge>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              (optimization?.score || 0) >= 85
                ? 'bg-green-600'
                : (optimization?.score || 0) >= 70
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${optimization?.score || 0}%` }}
          />
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          {(optimization?.score ?? 0) >= 85
            ? '🎉 Excellent! Your QR code is well optimized for maximum scan rates.'
            : (optimization?.score ?? 0) >= 70
            ? '👍 Good performance, but there\'s room for improvement.'
            : (optimization?.score ?? 0) >= 50
            ? '⚡ Fair optimization. Follow recommendations to boost performance.'
            : '⚠️ Multiple optimizations recommended to improve scan rates.'}
        </p>
      </Card>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="health">Link Health</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="testing">A/B Testing</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI Recommendations
            </h3>

            <div className="space-y-3">
              {optimization?.recommendations?.map((rec: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900"
                >
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <p className="text-sm flex-1">{rec}</p>
                </div>
              ))}
            </div>

            {optimization?.improvements && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Fixes
                </h4>

                {optimization.improvements.suggestedColors && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-medium mb-3">
                      Suggested colors for better contrast:
                    </p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded border-2 border-gray-300"
                          style={{
                            backgroundColor: optimization.improvements.suggestedColors.foreground,
                          }}
                        />
                        <div className="text-xs">
                          <p className="font-medium">Foreground</p>
                          <p className="text-muted-foreground">
                            {optimization.improvements.suggestedColors.foreground}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded border-2 border-gray-300"
                          style={{
                            backgroundColor: optimization.improvements.suggestedColors.background,
                          }}
                        />
                        <div className="text-xs">
                          <p className="font-medium">Background</p>
                          <p className="text-muted-foreground">
                            {optimization.improvements.suggestedColors.background}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {optimization.improvements.suggestedSize && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xl">📏</span>
                    <span>
                      Recommended size: <strong>{optimization.improvements.suggestedSize}px</strong>
                    </span>
                  </div>
                )}

                {optimization.improvements.suggestedErrorCorrection && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xl">🛡️</span>
                    <span>
                      Recommended error correction:{' '}
                      <strong>{optimization.improvements.suggestedErrorCorrection}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Link Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Link Health Check
            </h3>

            <div className="flex items-center gap-3 mb-4">
              {linkHealth?.isHealthy ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <Badge variant={linkHealth?.isHealthy ? 'default' : 'destructive'} className="mb-1">
                  {linkHealth?.isHealthy ? '✓ Healthy' : '✗ Issues Detected'}
                </Badge>
                {linkHealth?.statusCode && (
                  <p className="text-sm text-muted-foreground">
                    HTTP Status: {linkHealth.statusCode}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
              <p className="text-sm font-medium mb-2">Target URL:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white dark:bg-gray-800 px-3 py-2 rounded flex-1 overflow-x-auto">
                  {qrCode.redirectUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(qrCode.redirectUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!linkHealth?.isHealthy && linkHealth?.suggestions && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="font-medium text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Suggestions for Auto-Healing:
                </p>
                <ul className="text-sm space-y-2">
                  {linkHealth.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {linkHealth?.alternatives && linkHealth.alternatives.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                <p className="font-medium text-sm mb-3">✅ Alternative URLs Found:</p>
                <div className="space-y-2">
                  {linkHealth.alternatives.map((alt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded"
                    >
                      <code className="text-xs">{alt.url}</code>
                      <Badge variant={alt.isHealthy ? 'default' : 'secondary'}>
                        {alt.isHealthy ? 'Working' : `${alt.statusCode}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Predictive Analytics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <p className="text-sm text-muted-foreground mb-1">Predicted Daily Scans</p>
                <p className="text-3xl font-bold">{prediction?.predictedScansPerDay || 0}</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <p className="text-sm text-muted-foreground mb-1">Confidence Level</p>
                <p className="text-3xl font-bold">{prediction?.confidence || 0}%</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon(prediction?.trend || 'stable')}
                  <p className="text-xl font-bold capitalize">{prediction?.trend || 'stable'}</p>
                </div>
              </Card>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-sm mb-3">Contributing Factors:</p>
              {prediction?.factors?.map((factor: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm"
                >
                  <span>📊</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">A/B Testing Suggestions</h3>

            <div className="space-y-4">
              {abTest?.testIdeas?.map((test, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <h4 className="font-medium mb-2">{test.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{test.description}</p>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Test Variants:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {test.variants.map((variant, vIndex) => (
                        <Badge key={vIndex} variant="secondary">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-3 py-2 rounded">
                    <strong>Expected Impact:</strong> {test.expectedImpact}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => router.push(`/dashboard/qr-codes/${qrCodeId}`)}>
          View QR Code Details
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/qr-codes')}>
          Back to QR Codes
        </Button>
      </div>
    </div>
  );
}
