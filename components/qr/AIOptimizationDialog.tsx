'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, Check, ArrowRight, TrendingUp, X, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface QRCodeData {
  id: string;
  url: string;
  name: string;
  scans: number;
}

interface AIOptimizationDialogProps {
  qrCode: QRCodeData;
  remainingCredits: number;
  plan: string;
  onOptimizationComplete?: () => void;
}

interface OptimizationSuggestion {
  issue: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  icon: string;
  description: string;
}

interface OptimizationResult {
  improvements: OptimizationSuggestion[];
  estimatedIncrease: string;
  priority: string[];
  nextSteps: string[];
  beforeScore: number;
  afterScore: number;
}

const ANALYSIS_STEPS = [
  { icon: '🔍', text: 'Analyzing scan patterns...' },
  { icon: '📊', text: 'Reviewing performance data...' },
  { icon: '💡', text: 'Generating recommendations...' },
];

export function AIOptimizationDialog({
  qrCode,
  remainingCredits,
  plan,
  onOptimizationComplete,
}: AIOptimizationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userGoal, setUserGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const hasCredits = remainingCredits > 0 || remainingCredits === -1;

  const handleAnalyze = async () => {
    if (!userGoal.trim()) {
      toast.error('Please describe your goal');
      return;
    }

    if (!hasCredits) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(0);
    setError(null);
    setResult(null);

    try {
      // Animate through steps
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await fetch('/api/ai/optimize-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId: qrCode.id,
          userGoal: userGoal.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          setShowUpgradePrompt(true);
          return;
        }
        
        if (data.error === 'Insufficient data') {
          setError(data.message);
          setResult({
            improvements: data.suggestions || [],
            estimatedIncrease: '0%',
            priority: [],
            nextSteps: ['Share your QR code', 'Gather scan data', 'Come back for AI analysis'],
            beforeScore: 0,
            afterScore: 0,
          });
          return;
        }

        throw new Error(data.error || 'Failed to generate optimizations');
      }

      setResult(data.optimizations);
      toast.success('AI analysis complete!');
      
      if (onOptimizationComplete) {
        onOptimizationComplete();
      }
    } catch (err) {
      console.error('Optimization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze QR code');
      toast.error('Failed to generate optimizations');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUserGoal('');
    setCurrentStep(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      handleReset();
      setShowUpgradePrompt(false);
    }, 200);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={!hasCredits && plan === 'free'}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Optimize
          {hasCredits && remainingCredits !== -1 && (
            <Badge variant="secondary" className="ml-2 bg-white/20">
              {remainingCredits}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Optimization Assistant
          </DialogTitle>
        </DialogHeader>

        {showUpgradePrompt ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-4"
          >
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">
                {plan === 'free' ? 'Unlock AI Optimization' : "You've Used All Your AI Credits"}
              </h3>
              <p className="text-muted-foreground">
                {plan === 'free'
                  ? 'AI-powered optimization is available on Pro plans and above.'
                  : 'Upgrade to get more AI optimization credits this month.'}
              </p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Pro</div>
                    <div className="text-2xl font-bold">50</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Business</div>
                    <div className="text-2xl font-bold">200</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Agency</div>
                    <div className="text-2xl font-bold">∞</div>
                    <div className="text-xs text-muted-foreground">unlimited</div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Maybe Later
              </Button>
              <Button asChild className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link href="/pricing">
                  Upgrade Now
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : !result && !isAnalyzing ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What's your goal for this QR code?</label>
              <Textarea
                placeholder="Example: I want more scans from mobile users at my restaurant"
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific! The more details you provide, the better the AI can help.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">AI Credits</div>
                  <div className="text-xs text-muted-foreground">
                    {remainingCredits === -1 ? 'Unlimited' : `${remainingCredits} remaining this month`}
                  </div>
                </div>
              </div>
              <Badge variant="secondary">{plan}</Badge>
            </div>

            <Button
              onClick={handleAnalyze}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!userGoal.trim() || isAnalyzing}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze & Optimize
            </Button>
          </div>
        ) : isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 py-8"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full animate-ping opacity-20" />
              </div>
            </div>

            <div className="space-y-4">
              {ANALYSIS_STEPS.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= currentStep ? 1 : 0.3,
                    x: 0,
                  }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                      index < currentStep
                        ? 'bg-green-100 text-green-600'
                        : index === currentStep
                        ? 'bg-purple-100 text-purple-600 animate-pulse'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? <Check className="h-5 w-5" /> : <span className="text-xl">{step.icon}</span>}
                  </div>
                  <span className={`text-sm ${index <= currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 py-4"
          >
            {error && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-800">{error}</p>
              </Card>
            )}

            {/* Score Comparison */}
            {result.beforeScore > 0 && (
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Current Score</div>
                    <div className="text-4xl font-bold text-blue-600">{result.beforeScore}</div>
                  </div>
                  <ArrowRight className="h-8 w-8 text-purple-600" />
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Potential Score</div>
                    <div className="text-4xl font-bold text-green-600">{result.afterScore}</div>
                  </div>
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <div className="text-xl font-bold text-green-600">+{result.estimatedIncrease}</div>
                    <div className="text-xs text-muted-foreground">estimated</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Improvements */}
            {result.improvements.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Recommended Improvements</h3>
                {result.improvements.map((improvement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-3">
                        <div className="text-2xl flex-shrink-0">{improvement.icon}</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-medium">{improvement.issue}</div>
                              <div className="text-sm text-green-600 mt-1">
                                → {improvement.suggestion}
                              </div>
                            </div>
                            <Badge className={`${getImpactColor(improvement.impact)} border`}>
                              {improvement.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{improvement.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Next Steps */}
            {result.nextSteps.length > 0 && (
              <Card className="p-4 bg-green-50 border-green-200">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Next Steps
                </h4>
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  {result.nextSteps.map((step, index) => (
                    <li key={index} className="text-green-900">
                      {step}
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Try Another Goal
              </Button>
              <Button onClick={handleClose} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Done
              </Button>
            </div>
          </motion.div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
